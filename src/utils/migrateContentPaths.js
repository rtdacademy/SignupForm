import { generateContentPath, generateContentPathWithOrder } from './firebaseCourseConfigUtils.js';

/**
 * Migration script to add contentPath to existing course items
 * This script generates the appropriate contentPath values for all existing items
 * based on their itemId and order properties.
 */

// Sample data structure for testing - replace with actual database data
const sampleCourseData = {
  units: [
    {
      unitId: "unit_1_momentum_optics",
      name: "Momentum and Optics", 
      order: 1,
      items: [
        {
          itemId: "01_physics_20_review",
          title: "Physics 20 Review",
          type: "lesson",
          order: 1
        },
        {
          itemId: "53_physics_30_quantization_of_light", 
          title: "Quantization Of Light",
          type: "lesson",
          order: 5
        },
        {
          itemId: "74_unit_5_review",
          title: "Unit 5 Review", 
          type: "lesson",
          order: 26
        },
        {
          itemId: "assignment_l1_3",
          title: "Assignment L1-3 - Momentum Fundamentals",
          type: "assignment", 
          order: 5
        },
        {
          itemId: "lab_momentum_conservation",
          title: "Lab - Momentum Conservation",
          type: "lab",
          order: 7
        }
      ]
    }
  ]
};

/**
 * Generate contentPath migration data for a course structure
 * @param {Object} courseStructure - The course structure with units and items
 * @returns {Array} Array of migration operations
 */
export function generateContentPathMigration(courseStructure) {
  const migrations = [];
  
  if (!courseStructure.units) {
    return migrations;
  }
  
  courseStructure.units.forEach((unit, unitIndex) => {
    if (!unit.items) return;
    
    unit.items.forEach((item, itemIndex) => {
      // Skip items that already have contentPath
      if (item.contentPath) {
        return;
      }
      
      // Generate contentPath based on itemId and order
      const generatedContentPath = generateContentPathWithOrder(item.itemId, item.order);
      
      migrations.push({
        unitIndex,
        itemIndex,
        itemId: item.itemId,
        currentTitle: item.title,
        generatedContentPath,
        firebasePath: `/courses/2/course-config/courseStructure/units/${unitIndex}/items/${itemIndex}/contentPath`,
        operation: 'add_contentPath',
        value: generatedContentPath
      });
    });
  });
  
  return migrations;
}

/**
 * Preview what contentPaths would be generated for existing items
 * @param {Object} courseStructure - The course structure
 * @returns {Object} Preview object with counts and examples
 */
export function previewContentPathMigration(courseStructure) {
  const migrations = generateContentPathMigration(courseStructure);
  
  const preview = {
    totalItems: 0,
    itemsNeedingMigration: migrations.length,
    examples: migrations.slice(0, 10), // Show first 10 examples
    byType: {}
  };
  
  // Count items by type
  if (courseStructure.units) {
    courseStructure.units.forEach(unit => {
      if (unit.items) {
        unit.items.forEach(item => {
          preview.totalItems++;
          const type = item.type || 'unknown';
          preview.byType[type] = (preview.byType[type] || 0) + 1;
        });
      }
    });
  }
  
  return preview;
}

/**
 * Generate Firebase commands to apply the migration
 * @param {Array} migrations - Array of migration operations
 * @param {string} courseId - The course ID (default: 2)
 * @returns {Array} Array of Firebase CLI commands
 */
export function generateFirebaseCommands(migrations, courseId = '2') {
  return migrations.map(migration => ({
    command: `firebase database:update /courses/${courseId}/course-config/courseStructure/units/${migration.unitIndex}/items/${migration.itemIndex} --data '{"contentPath":"${migration.generatedContentPath}"}'`,
    description: `Add contentPath "${migration.generatedContentPath}" to ${migration.itemId} (${migration.currentTitle})`
  }));
}

/**
 * Test the migration with sample data
 */
export function testMigration() {
  console.log('🔍 Testing Content Path Migration');
  console.log('=====================================');
  
  const preview = previewContentPathMigration(sampleCourseData);
  console.log('\n📊 Migration Preview:');
  console.log(`Total items: ${preview.totalItems}`);
  console.log(`Items needing contentPath: ${preview.itemsNeedingMigration}`);
  console.log('\nBy type:', preview.byType);
  
  console.log('\n🔧 Examples of generated contentPaths:');
  preview.examples.forEach(example => {
    console.log(`  ${example.itemId} → ${example.generatedContentPath}`);
  });
  
  const commands = generateFirebaseCommands(generateContentPathMigration(sampleCourseData));
  console.log('\n🚀 Sample Firebase Commands:');
  commands.slice(0, 3).forEach(cmd => {
    console.log(`  ${cmd.command}`);
  });
  
  console.log(`\n... and ${commands.length - 3} more commands`);
}

// For command line usage
if (import.meta.url === `file://${process.argv[1]}`) {
  testMigration();
}