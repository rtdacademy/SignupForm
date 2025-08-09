/**
 * Migration Script: Move Facilitator Data from User Level to Family Level
 * 
 * This script migrates facilitator selections from being stored at the user level
 * to being stored at the family level, which makes more sense since facilitators
 * work with entire families, not individual users.
 * 
 * Migration Process:
 * 1. Scan all users who have selectedFacilitatorId and selectedFacilitator
 * 2. For each user, find their associated family
 * 3. Copy facilitator data to the family level
 * 4. Update the Dashboard.js to read/write from family level instead of user level
 * 5. Clean up user-level facilitator data (optional)
 */

import { getDatabase, ref, get, set, update } from 'firebase/database';
import { initializeApp } from 'firebase/app';

// Firebase configuration (use your actual config)
const firebaseConfig = {
  // Your Firebase config here
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

/**
 * Step 1: Find all users with facilitator selections
 */
async function getAllUsersWithFacilitators() {
  console.log('🔍 Scanning users for facilitator selections...');
  
  const usersRef = ref(database, 'users');
  const snapshot = await get(usersRef);
  
  if (!snapshot.exists()) {
    console.log('No users found');
    return [];
  }
  
  const users = snapshot.val();
  const usersWithFacilitators = [];
  
  for (const [uid, userData] of Object.entries(users)) {
    if (userData.selectedFacilitatorId && userData.selectedFacilitator) {
      usersWithFacilitators.push({
        uid,
        email: userData.email,
        selectedFacilitatorId: userData.selectedFacilitatorId,
        selectedFacilitator: userData.selectedFacilitator,
        facilitatorSelectedAt: userData.facilitatorSelectedAt,
        userData: userData
      });
    }
  }
  
  console.log(`Found ${usersWithFacilitators.length} users with facilitator selections`);
  return usersWithFacilitators;
}

/**
 * Step 2: Find the family ID for each user
 */
async function findFamilyForUser(userEmail) {
  const familiesRef = ref(database, 'homeEducationFamilies/familyInformation');
  const snapshot = await get(familiesRef);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  const families = snapshot.val();
  const userEmailKey = userEmail.replace(/\./g, ',');
  
  for (const [familyId, familyData] of Object.entries(families)) {
    if (familyData.guardians && 
        familyData.guardians[userEmailKey] && 
        familyData.guardians[userEmailKey].guardianType === 'primary_guardian') {
      return familyId;
    }
  }
  
  return null;
}

/**
 * Step 3: Migrate facilitator data to family level
 */
async function migrateFacilitatorToFamily(userWithFacilitator) {
  const { uid, email, selectedFacilitatorId, selectedFacilitator, facilitatorSelectedAt } = userWithFacilitator;
  
  console.log(`\n📋 Processing user: ${email}`);
  
  // Find the family for this user
  const familyId = await findFamilyForUser(email);
  
  if (!familyId) {
    console.log(`❌ No family found for user: ${email}`);
    return { success: false, reason: 'No family found' };
  }
  
  console.log(`✅ Found family: ${familyId}`);
  
  // Check if family already has facilitator data
  const familyRef = ref(database, `homeEducationFamilies/familyInformation/${familyId}`);
  const familySnapshot = await get(familyRef);
  
  if (familySnapshot.exists()) {
    const familyData = familySnapshot.val();
    
    if (familyData.selectedFacilitatorId) {
      console.log(`⚠️  Family already has facilitator: ${familyData.selectedFacilitator?.name || 'Unknown'}`);
      console.log(`   Current user facilitator: ${selectedFacilitator?.name || 'Unknown'}`);
      
      // If they're different, we need to decide what to do
      if (familyData.selectedFacilitatorId !== selectedFacilitatorId) {
        console.log(`🔄 Facilitator mismatch - keeping family level data`);
        return { success: true, reason: 'Family already has different facilitator' };
      } else {
        console.log(`✅ Same facilitator, no migration needed`);
        return { success: true, reason: 'Same facilitator already at family level' };
      }
    }
  }
  
  // Migrate the facilitator data to family level
  try {
    const facilitatorData = {
      selectedFacilitatorId,
      selectedFacilitator,
      facilitatorSelectedAt: facilitatorSelectedAt || new Date().toISOString(),
      facilitatorMigratedAt: new Date().toISOString(),
      facilitatorMigratedFrom: uid
    };
    
    await update(familyRef, facilitatorData);
    console.log(`✅ Facilitator data migrated to family ${familyId}`);
    
    return { success: true, familyId, facilitatorData };
  } catch (error) {
    console.error(`❌ Error migrating facilitator data for ${email}:`, error);
    return { success: false, reason: error.message };
  }
}

/**
 * Step 4: Main migration function
 */
async function runMigration() {
  console.log('🚀 Starting facilitator migration from user level to family level...\n');
  
  try {
    // Get all users with facilitator selections
    const usersWithFacilitators = await getAllUsersWithFacilitators();
    
    if (usersWithFacilitators.length === 0) {
      console.log('✅ No facilitator data to migrate');
      return;
    }
    
    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      details: []
    };
    
    // Process each user
    for (const user of usersWithFacilitators) {
      const result = await migrateFacilitatorToFamily(user);
      
      if (result.success) {
        if (result.reason?.includes('already')) {
          results.skipped++;
        } else {
          results.success++;
        }
      } else {
        results.failed++;
      }
      
      results.details.push({
        user: user.email,
        result
      });
    }
    
    // Summary
    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successful migrations: ${results.success}`);
    console.log(`⏭️  Skipped (already migrated): ${results.skipped}`);
    console.log(`❌ Failed migrations: ${results.failed}`);
    
    if (results.failed > 0) {
      console.log('\n❌ Failed migrations:');
      results.details.filter(d => !d.result.success).forEach(d => {
        console.log(`   ${d.user}: ${d.result.reason}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

/**
 * Dry run function - shows what would be migrated without making changes
 */
async function dryRun() {
  console.log('🔍 DRY RUN: Analyzing facilitator data migration...\n');
  
  try {
    const usersWithFacilitators = await getAllUsersWithFacilitators();
    
    if (usersWithFacilitators.length === 0) {
      console.log('✅ No facilitator data found to migrate');
      return;
    }
    
    console.log(`\n📋 Found ${usersWithFacilitators.length} users with facilitator data:\n`);
    
    for (const user of usersWithFacilitators) {
      console.log(`👤 User: ${user.email}`);
      console.log(`   Facilitator: ${user.selectedFacilitator?.name || 'Unknown'}`);
      console.log(`   Selected: ${user.facilitatorSelectedAt || 'Unknown'}`);
      
      const familyId = await findFamilyForUser(user.email);
      if (familyId) {
        console.log(`   Family ID: ${familyId}`);
        
        // Check if family already has facilitator
        const familyRef = ref(database, `homeEducationFamilies/familyInformation/${familyId}`);
        const familySnapshot = await get(familyRef);
        
        if (familySnapshot.exists()) {
          const familyData = familySnapshot.val();
          if (familyData.selectedFacilitatorId) {
            console.log(`   ⚠️  Family already has facilitator: ${familyData.selectedFacilitator?.name || 'Unknown'}`);
          } else {
            console.log(`   ✅ Ready to migrate`);
          }
        }
      } else {
        console.log(`   ❌ No family found`);
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Dry run failed:', error);
  }
}

// Export functions for use
export { runMigration, dryRun };

// If running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const mode = process.argv[2];
  
  if (mode === '--dry-run') {
    dryRun();
  } else if (mode === '--migrate') {
    runMigration();
  } else {
    console.log('Usage:');
    console.log('  node migrate-facilitator-to-family.js --dry-run    # Show what would be migrated');
    console.log('  node migrate-facilitator-to-family.js --migrate    # Actually perform migration');
  }
}