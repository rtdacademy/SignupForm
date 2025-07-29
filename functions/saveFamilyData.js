// functions/saveFamilyData.js

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const { sanitizeEmail } = require('./utils');

// Ensure Firebase Admin is initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Cloud Function: saveFamilyData
 * 
 * Creates or updates an entire family node.
 * Handles custom claims for primary guardian and permission syncing for all family members.
 */
const saveFamilyData = onCall({
  concurrency: 50,
  cors: ["https://yourway.rtdacademy.com", "https://rtd-connect.com", "http://localhost:3000", "http://localhost:3001", "https://3000-idx-yourway-1744540653512.cluster-76blnmxvvzdpat4inoxk5tmzik.cloudworkstations.dev"]
}, async (request) => {
  // Verify authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated to perform this action.');
  }

  const uid = request.auth.uid;
  const userEmail = request.auth.token.email;
  const { familyData } = request.data;
  
  if (!familyData) {
    throw new HttpsError('invalid-argument', 'Family data is required.');
  }

  // Validate required fields
  if (!familyData.familyName || !familyData.familyName.trim()) {
    throw new HttpsError('invalid-argument', 'Family name is required.');
  }

  if (!familyData.students || Object.keys(familyData.students).length === 0) {
    throw new HttpsError('invalid-argument', 'At least one student is required.');
  }

  const db = admin.database();
  
  try {
    // Get user's existing custom claims
    const userRecord = await admin.auth().getUser(uid);
    const existingClaims = userRecord.customClaims || {};
    
    // Determine if this is a new family or update
    let familyId = existingClaims.familyId;
    let isNewFamily = false;
    
    // If no familyId in claims, check if user has an existing family in the database
    if (!familyId) {
      console.log(`No familyId in claims for user ${uid}, checking database for existing family...`);
      
      // Search for existing family where this user is the primary guardian
      const userEmailKey = sanitizeEmail(userEmail);
      const familiesSnapshot = await db.ref('homeEducationFamilies/familyInformation').once('value');
      
      if (familiesSnapshot.exists()) {
        const allFamilies = familiesSnapshot.val();
        
        // Look for a family where this user is the primary guardian
        for (const [existingFamilyId, familyData] of Object.entries(allFamilies)) {
          if (familyData.guardians && familyData.guardians[userEmailKey] && 
              familyData.guardians[userEmailKey].guardianType === 'primary_guardian') {
            console.log(`Found existing family ${existingFamilyId} for user ${uid}`);
            familyId = existingFamilyId;
            
            // Re-apply the custom claims since they seem to be missing
            const customClaims = {
              ...existingClaims,
              familyId: familyId,
              familyRole: 'primary_guardian'
            };
            
            await admin.auth().setCustomUserClaims(uid, customClaims);
            console.log(`Re-applied custom claims for user ${uid} with familyId ${familyId}`);
            break;
          }
        }
      }
    }
    
    if (!familyId) {
      // New family - generate ID
      familyId = uuidv4();
      isNewFamily = true;
      console.log(`Creating new family ${familyId} for user ${uid}`);
    } else {
      // For existing families, we already verified the user is the primary guardian 
      // when we found the family in the database lookup above
      // No additional permission check needed since we found them as primary_guardian
      console.log(`Updating existing family ${familyId} for user ${uid}`);
    }
    
    // Always set custom claims for the primary guardian (current user) - ensures consistency
    const customClaims = {
      ...existingClaims,
      familyId: familyId,
      familyRole: 'primary_guardian'
    };
    
    try {
      // Multiple attempts to ensure claims are set properly
      let claimsSet = false;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!claimsSet && attempts < maxAttempts) {
        attempts++;
        
        try {
          await admin.auth().setCustomUserClaims(uid, customClaims);
          console.log(`✓ Attempt ${attempts}: Set custom claims for user ${uid} with familyId: ${familyId}`);
          
          // Verify the claims were set by reading them back
          await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for propagation
          const updatedUserRecord = await admin.auth().getUser(uid);
          const verifyCustomClaims = updatedUserRecord.customClaims || {};
          
          if (verifyCustomClaims.familyId === familyId && verifyCustomClaims.familyRole === 'primary_guardian') {
            console.log(`✓ Verified custom claims - familyId: ${verifyCustomClaims.familyId}, familyRole: ${verifyCustomClaims.familyRole}`);
            claimsSet = true;
          } else {
            console.log(`⚠️ Attempt ${attempts}: Claims verification failed, retrying...`);
            if (attempts === maxAttempts) {
              console.log(`✗ Failed to verify claims after ${maxAttempts} attempts`);
            }
          }
        } catch (error) {
          console.error(`✗ Attempt ${attempts} failed:`, error);
          if (attempts === maxAttempts) {
            throw error;
          }
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
        }
      }
      
      if (!claimsSet) {
        throw new Error('Failed to set and verify custom claims after multiple attempts');
      }
      
      console.log(`✓ Successfully set and verified custom claims for user ${uid} with familyId: ${familyId}`);
      
      // Small delay to ensure claims are propagated
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`✗ Failed to set custom claims for user ${uid}:`, error);
      throw new HttpsError('internal', 'Failed to set user permissions');
    }
    
    // Get existing family data to compare for permission syncing
    const existingFamilySnapshot = await db.ref(`homeEducationFamilies/familyInformation/${familyId}`).once('value');
    const existingFamilyData = existingFamilySnapshot.val() || { students: {}, guardians: {} };
    
    // Prepare family data structure
    const familyDataToSave = {
      familyName: familyData.familyName,
      students: {},
      guardians: {},
      // Root level metadata for easy querying
      createdAt: existingFamilyData.createdAt || Date.now(),
      createdBy: existingFamilyData.createdBy || uid,
      updatedAt: Date.now(),
      updatedBy: uid,
      familyId: familyId,
      // Summary information for queries
      studentCount: 0, // Will be updated below
      guardianCount: 0, // Will be updated below
      status: 'active',
      lastActivity: Date.now()
    };
    
    // Always ensure primary guardian exists (both new and existing families)
    let primaryGuardianCount = 0;
    
    // Get user profile data from database
    let userProfile = {};
    try {
      const userProfileSnapshot = await db.ref(`users/${uid}`).once('value');
      userProfile = userProfileSnapshot.val() || {};
      console.log('Loaded user profile for primary guardian:', userProfile?.firstName, userProfile?.lastName, userProfile?.email);
    } catch (error) {
      console.log('Could not fetch user profile:', error);
    }
    
    const userEmailKey = sanitizeEmail(userEmail);
    
    // Always add/update the current user as primary guardian
    familyDataToSave.guardians[userEmailKey] = {
      email: userEmail,
      emailKey: userEmailKey,
      firstName: userProfile.firstName || 'Unknown',
      lastName: userProfile.lastName || 'User',
      phone: userProfile.phone || '',
      address: userProfile.address || null,
      relationToStudents: 'Primary Guardian',
      guardianType: 'primary_guardian',
      addedAt: existingFamilyData.guardians?.[userEmailKey]?.addedAt || Date.now(),
      addedBy: existingFamilyData.guardians?.[userEmailKey]?.addedBy || uid,
      familyId: familyId,
      updatedAt: Date.now(),
      updatedBy: uid
    };
    primaryGuardianCount = 1;
    console.log(`Added/updated primary guardian: ${userEmail}`);
    
// Process students
const studentsById = {};
const studentEmailKeys = new Set();

for (const student of Object.values(familyData.students)) {
  if (!student.firstName || !student.lastName) {
    throw new HttpsError('invalid-argument', 'Each student must have first name, and last name.');
  }
  
  const studentId = student.id;
  if (!studentId) {
    throw new HttpsError('invalid-argument', 'Each student must have an id.');
  }
  
  studentsById[studentId] = {
    ...student,
    familyId: familyId,
    addedAt: existingFamilyData.students?.[studentId]?.addedAt || Date.now(),
    addedBy: existingFamilyData.students?.[studentId]?.addedBy || uid,
    updatedAt: Date.now(),
    updatedBy: uid
  };
  
  // Track student emails for permission syncing
  if (student.email && student.email.trim()) {
    const emailKey = sanitizeEmail(student.email);
    studentsById[studentId].emailKey = emailKey;
    studentEmailKeys.add(emailKey);
  }
}

familyDataToSave.students = studentsById;
    
    // Process guardians 
    const guardianEmailKeys = new Set();
    
    // Always include primary guardian in the set
    guardianEmailKeys.add(userEmailKey);
    
    if (familyData.guardians) {
      for (const guardian of Object.values(familyData.guardians)) {
        if (!guardian.email || !guardian.firstName || !guardian.lastName) {
          continue; // Skip invalid guardians
        }
        
        const emailKey = sanitizeEmail(guardian.email);
        
        // Skip if this is the primary guardian's email (already handled above)
        if (emailKey === sanitizeEmail(userEmail)) {
          continue;
        }
        
        guardianEmailKeys.add(emailKey);
        
        familyDataToSave.guardians[emailKey] = {
          ...guardian,
          emailKey: emailKey,
          familyId: familyId,
          guardianType: guardian.guardianType || 'guardian',
          addedAt: existingFamilyData.guardians?.[emailKey]?.addedAt || Date.now(),
          addedBy: existingFamilyData.guardians?.[emailKey]?.addedBy || uid,
          updatedAt: Date.now(),
          updatedBy: uid
        };
      }
    }
    
    // Note: Primary guardian is always the current user (handled above)
    // Additional guardians are processed separately
    
    // Update counts and metadata
    familyDataToSave.studentCount = Object.keys(familyDataToSave.students).length;
    familyDataToSave.guardianCount = Object.keys(familyDataToSave.guardians).length;
    familyDataToSave.totalMembers = familyDataToSave.studentCount + familyDataToSave.guardianCount;
    familyDataToSave.hasStudentsWithEmail = Object.values(familyDataToSave.students).some(student => student.email && student.email.trim());
    familyDataToSave.studentsAgeRange = calculateStudentAgeRange(Object.values(familyDataToSave.students));
    
    console.log(`Family summary: ${familyDataToSave.studentCount} students, ${familyDataToSave.guardianCount} guardians, ${familyDataToSave.totalMembers} total members`);
    
    // Save the family data
    await db.ref(`homeEducationFamilies/familyInformation/${familyId}`).set(familyDataToSave);
    
    // Handle permission syncing
    await syncFamilyPermissions(
      familyId,
      existingFamilyData,
      familyDataToSave,
      studentEmailKeys,
      guardianEmailKeys,
      uid
    );
    
    console.log(`Successfully saved family data for family ${familyId}`);
    
    // Update metadata to trigger token refresh - AFTER everything is complete
    try {
      await db.ref(`metadata/${uid}`).set({
        refreshTime: Date.now(),
        familyRegistrationTime: isNewFamily ? Date.now() : Date.now()
      });
      console.log(`✓ Updated metadata to trigger token refresh for user ${uid}`);
    } catch (error) {
      console.error(`✗ Failed to update metadata for user ${uid}:`, error);
    }
    
    return {
      success: true,
      familyId: familyId,
      isNewFamily: isNewFamily,
      message: isNewFamily ? 'Family created successfully' : 'Family updated successfully'
    };
    
  } catch (error) {
    console.error('Error saving family data:', error);
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', 'An error occurred while saving family data.');
  }
});

/**
 * Sync permissions for family members
 */
async function syncFamilyPermissions(
  familyId,
  oldFamilyData,
  newFamilyData,
  currentStudentEmails,
  currentGuardianEmails,
  updatedBy
) {
  const db = admin.database();
  const batch = [];
  
  // Get all old student emails
  const oldStudentEmails = new Set();
  if (oldFamilyData.students) {
    Object.values(oldFamilyData.students).forEach(student => {
      if (student.emailKey) {
        oldStudentEmails.add(student.emailKey);
      }
    });
  }
  
  // Get all old guardian emails
  const oldGuardianEmails = new Set();
  if (oldFamilyData.guardians) {
    Object.values(oldFamilyData.guardians).forEach(guardian => {
      if (guardian.emailKey) {
        oldGuardianEmails.add(guardian.emailKey);
      }
    });
  }
  
  // Handle removed students
  for (const emailKey of oldStudentEmails) {
    if (!currentStudentEmails.has(emailKey)) {
      batch.push(db.ref(`pendingPermissions/${emailKey}`).remove());
      console.log(`Removing permissions for deleted student: ${emailKey}`);
    }
  }
  
  // Handle removed guardians
  for (const emailKey of oldGuardianEmails) {
    if (!currentGuardianEmails.has(emailKey)) {
      batch.push(db.ref(`pendingPermissions/${emailKey}`).remove());
      console.log(`Removing permissions for deleted guardian: ${emailKey}`);
    }
  }
  
  // Handle current students
  for (const student of Object.values(newFamilyData.students)) {
    if (student.email && student.emailKey) {
      // Check if user exists and apply immediately
      try {
        const userRecord = await admin.auth().getUserByEmail(student.email);
        
        // User exists - apply custom claims immediately
        await admin.auth().setCustomUserClaims(userRecord.uid, {
          familyId: familyId,
          familyRole: 'student',
          studentInfo: {
            asn: student.asn,
            firstName: student.firstName,
            lastName: student.lastName,
            preferredName: student.preferredName
          }
        });
        
        console.log(`Applied student permissions immediately for existing user: ${student.email}`);
        
        // Remove any existing pending permissions since we applied them
        batch.push(db.ref(`pendingPermissions/${student.emailKey}`).remove());
        
      } catch (error) {
        // User doesn't exist yet - create pending permissions
        console.log(`Creating pending student permissions for future user: ${student.email}`);
        
        const pendingPermissionData = {
          email: student.email,
          familyId: familyId,
          familyRole: 'student',
          createdAt: Date.now(),
          createdBy: updatedBy,
          applied: false,
          type: 'student',
          studentInfo: {
            asn: student.asn,
            firstName: student.firstName,
            lastName: student.lastName,
            preferredName: student.preferredName
          }
        };
        
        batch.push(db.ref(`pendingPermissions/${student.emailKey}`).set(pendingPermissionData));
      }
    }
  }
  
  // Handle current guardians (excluding primary guardian)
  for (const guardian of Object.values(newFamilyData.guardians)) {
    if (guardian.email && guardian.emailKey && guardian.guardianType !== 'primary_guardian') {
      // Check if user exists and apply immediately
      try {
        const userRecord = await admin.auth().getUserByEmail(guardian.email);
        
        // User exists - apply custom claims immediately
        await admin.auth().setCustomUserClaims(userRecord.uid, {
          familyId: familyId,
          familyRole: 'guardian'
        });
        
        console.log(`Applied guardian permissions immediately for existing user: ${guardian.email}`);
        
        // Remove any existing pending permissions since we applied them
        batch.push(db.ref(`pendingPermissions/${guardian.emailKey}`).remove());
        
      } catch (error) {
        // User doesn't exist yet - create pending permissions
        console.log(`Creating pending guardian permissions for future user: ${guardian.email}`);
        
        const pendingPermissionData = {
          email: guardian.email,
          familyId: familyId,
          familyRole: 'guardian',
          createdAt: Date.now(),
          createdBy: updatedBy,
          applied: false,
          type: 'guardian'
        };
        
        batch.push(db.ref(`pendingPermissions/${guardian.emailKey}`).set(pendingPermissionData));
      }
    }
  }
  
  // Execute all permission updates
  await Promise.all(batch);
}

/**
 * Calculate age range for students based on their birthdates
 */
function calculateStudentAgeRange(students) {
  if (!students || students.length === 0) {
    return null;
  }
  
  const currentDate = new Date();
  const ages = students
    .filter(student => student.birthday)
    .map(student => {
      const birthDate = new Date(student.birthday);
      const age = currentDate.getFullYear() - birthDate.getFullYear();
      const monthDiff = currentDate.getMonth() - birthDate.getMonth();
      
      // Adjust if birthday hasn't occurred this year
      if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())) {
        return age - 1;
      }
      return age;
    })
    .filter(age => age >= 0 && age <= 25); // Reasonable age range for students
  
  if (ages.length === 0) {
    return null;
  }
  
  const minAge = Math.min(...ages);
  const maxAge = Math.max(...ages);
  
  if (minAge === maxAge) {
    return `${minAge} years`;
  }
  
  return `${minAge}-${maxAge} years`;
}

module.exports = saveFamilyData;