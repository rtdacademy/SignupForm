#!/usr/bin/env node

/**
 * Database Migration Script: Add ContentPath to Course Items
 * 
 * This script adds contentPath fields to all existing course items in the database.
 * Run this once to migrate existing data to the new contentPath-aware system.
 * 
 * Usage:
 *   node migrate-content-paths.js [courseId]
 * 
 * Example:
 *   node migrate-content-paths.js 2
 */

import { generateContentPathWithOrder } from './src/utils/firebaseCourseConfigUtils.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const courseId = process.argv[2] || '2';

console.log(`🚀 Starting ContentPath Migration for Course ${courseId}`);
console.log('=====================================================');

async function getCourseStructure() {
  try {
    console.log('📥 Fetching course structure from database...');
    const { stdout } = await execAsync(`firebase database:get /courses/${courseId}/course-config/courseStructure/units --pretty`);
    return JSON.parse(stdout);
  } catch (error) {
    console.error('❌ Failed to fetch course structure:', error.message);
    process.exit(1);
  }
}

async function updateItemContentPath(unitIndex, itemIndex, contentPath) {
  try {
    // Use proper escaping for Windows command line
    const data = JSON.stringify({ contentPath });
    const command = process.platform === 'win32' 
      ? `firebase database:update /courses/${courseId}/course-config/courseStructure/units/${unitIndex}/items/${itemIndex} --data "${data.replace(/"/g, '\\"')}"`
      : `firebase database:update /courses/${courseId}/course-config/courseStructure/units/${unitIndex}/items/${itemIndex} --data '${data}'`;
    
    await execAsync(command);
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
  
  // First pass: count and preview
  console.log('\n🔍 Analyzing items...');
  units.forEach((unit, unitIndex) => {
    if (unit.items && Array.isArray(unit.items)) {
      unit.items.forEach((item, itemIndex) => {
        totalItems++;
        if (!item.contentPath) {
          itemsNeedingMigration++;
          const generatedContentPath = generateContentPathWithOrder(item.itemId, item.order);
          console.log(`  📝 ${item.itemId} → ${generatedContentPath}`);
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
    return;
  }
  
  // Confirm before proceeding
  console.log(`\n⚠️  This will update ${itemsNeedingMigration} items in the database.`);
  console.log('Continue? (Press Enter to continue, Ctrl+C to cancel)');
  
  // Wait for user confirmation (in a real script, you might want to use readline)
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });
  
  // Second pass: apply updates
  console.log('\n🔄 Applying updates...');
  for (let unitIndex = 0; unitIndex < units.length; unitIndex++) {
    const unit = units[unitIndex];
    if (!unit.items) continue;
    
    for (let itemIndex = 0; itemIndex < unit.items.length; itemIndex++) {
      const item = unit.items[itemIndex];
      
      if (!item.contentPath) {
        const generatedContentPath = generateContentPathWithOrder(item.itemId, item.order);
        console.log(`  🔄 Updating ${item.itemId} → ${generatedContentPath}`);
        
        const success = await updateItemContentPath(unitIndex, itemIndex, generatedContentPath);
        if (success) {
          itemsUpdated++;
          console.log(`  ✅ Updated successfully`);
        } else {
          console.log(`  ❌ Update failed`);
        }
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 200));
      } else {
        itemsSkipped++;
      }
    }
  }
  
  console.log('\n🎉 Migration Complete!');
  console.log(`  Items updated: ${itemsUpdated}`);
  console.log(`  Items skipped: ${itemsSkipped}`);
  console.log(`  Success rate: ${Math.round((itemsUpdated / itemsNeedingMigration) * 100)}%`);
  
  if (itemsUpdated > 0) {
    console.log('\n💡 Next steps:');
    console.log('  1. Test your course content to ensure lessons load properly');
    console.log('  2. The problematic lessons should now be visible');
    console.log('  3. You can now use the Course Structure Builder to edit contentPath for any items');
  }
}

// Run the migration
runMigration().catch(error => {
  console.error('💥 Migration failed:', error);
  process.exit(1);
});