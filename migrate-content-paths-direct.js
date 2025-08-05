#!/usr/bin/env node

/**
 * Direct Database Migration Script: Add ContentPath to Course Items
 * 
 * This script adds contentPath fields to all existing course items in the database.
 * It uses the Firebase SDK directly instead of CLI commands for better reliability.
 * 
 * Usage:
 *   node migrate-content-paths-direct.js [courseId]
 * 
 * Example:
 *   node migrate-content-paths-direct.js 2
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, update } from 'firebase/database';
import { generateContentPathWithOrder } from './src/utils/firebaseCourseConfigUtils.js';

// Firebase configuration - copied from src/firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyDjx3BINgvUwR1CHE80yX1gCBXYl5OMCqs",
  authDomain: "rtd-academy.firebaseapp.com",
  databaseURL: "https://rtd-academy-default-rtdb.firebaseio.com",
  projectId: "rtd-academy",
  storageBucket: "rtd-academy.appspot.com",
  messagingSenderId: "406494878558",
  appId: "1:406494878558:web:7d69901b5b089ac2cf0dcf",
  measurementId: "G-PDQPPYM0BB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const courseId = process.argv[2] || '2';

console.log(`🚀 Starting ContentPath Migration for Course ${courseId}`);
console.log('=====================================================');

async function getCourseStructure() {
  try {
    console.log('📥 Fetching course structure from database...');
    const snapshot = await get(ref(database, `/courses/${courseId}/course-config/courseStructure/units`));
    if (!snapshot.exists()) {
      throw new Error('Course structure not found');
    }
    return snapshot.val();
  } catch (error) {
    console.error('❌ Failed to fetch course structure:', error.message);
    process.exit(1);
  }
}

async function updateItemContentPath(unitIndex, itemIndex, contentPath) {
  try {
    const itemPath = `/courses/${courseId}/course-config/courseStructure/units/${unitIndex}/items/${itemIndex}/contentPath`;
    await update(ref(database, `/courses/${courseId}/course-config/courseStructure/units/${unitIndex}/items/${itemIndex}`), {
      contentPath: contentPath
    });
    return true;
  } catch (error) {
    console.error(`❌ Failed to update item ${unitIndex}-${itemIndex}:`, error.message);
    return false;
  }
}

async function runMigration() {
  const units = await getCourseStructure();
  
  if (!Array.isArray(units)) {
    console.error('❌ Invalid course structure format');
    process.exit(1);
  }
  
  console.log(`📊 Found ${units.length} units in course structure`);
  
  let totalItems = 0;
  let itemsNeedingMigration = 0;
  let itemsUpdated = 0;
  let itemsSkipped = 0;
  const migrationNeeded = [];
  
  // First pass: count and preview
  console.log('\n🔍 Analyzing items...');
  units.forEach((unit, unitIndex) => {
    if (unit?.items && Array.isArray(unit.items)) {
      unit.items.forEach((item, itemIndex) => {
        totalItems++;
        if (!item.contentPath) {
          itemsNeedingMigration++;
          const generatedContentPath = generateContentPathWithOrder(item.itemId, item.order);
          console.log(`  📝 ${item.itemId} → ${generatedContentPath}`);
          migrationNeeded.push({ unitIndex, itemIndex, item, generatedContentPath });
        }
      });
    }
  });
  
  console.log(`\n📈 Migration Summary:`);
  console.log(`  Total items: ${totalItems}`);
  console.log(`  Items needing contentPath: ${itemsNeedingMigration}`);
  console.log(`  Items already have contentPath: ${totalItems - itemsNeedingMigration}`);
  
  if (itemsNeedingMigration === 0) {
    console.log('✅ All items already have contentPath! No migration needed.');
    process.exit(0);
  }
  
  // Confirm before proceeding
  console.log(`\n⚠️  This will update ${itemsNeedingMigration} items in the database.`);
  console.log('Press Enter to continue, or Ctrl+C to cancel...');
  
  // Wait for user confirmation
  await new Promise(resolve => {
    process.stdin.resume();
    process.stdin.once('data', () => {
      process.stdin.pause();
      resolve();
    });
  });
  
  // Second pass: apply updates
  console.log('\n🔄 Applying updates...');
  for (const { unitIndex, itemIndex, item, generatedContentPath } of migrationNeeded) {
    console.log(`  🔄 Updating ${item.itemId} → ${generatedContentPath}`);
    
    const success = await updateItemContentPath(unitIndex, itemIndex, generatedContentPath);
    if (success) {
      itemsUpdated++;
      console.log(`  ✅ Updated successfully`);
    } else {
      console.log(`  ❌ Update failed`);
    }
    
    // Small delay to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n🎉 Migration Complete!');
  console.log(`  Items updated: ${itemsUpdated}`);
  console.log(`  Items skipped: ${totalItems - itemsNeedingMigration}`);
  console.log(`  Success rate: ${itemsNeedingMigration > 0 ? Math.round((itemsUpdated / itemsNeedingMigration) * 100) : 100}%`);
  
  if (itemsUpdated > 0) {
    console.log('\n💡 Next steps:');
    console.log('  1. Test your course content to ensure lessons load properly');
    console.log('  2. The problematic lessons (like "Quantization of Light") should now be visible');
    console.log('  3. You can now use the Course Structure Builder to edit contentPath for any items');
  }
  
  process.exit(0);
}

// Run the migration
runMigration().catch(error => {
  console.error('💥 Migration failed:', error);
  process.exit(1);
});