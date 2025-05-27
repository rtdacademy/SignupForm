// Import 2nd gen Firebase Functions
const { onCall } = require('firebase-functions/v2/https');
const { HttpsError } = require('firebase-functions/v2/https');

// Other dependencies
const admin = require('firebase-admin');
const { sanitizeEmail } = require('./utils');
const { getStorage } = require('firebase-admin/storage');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Helper function to validate that the parent has permission to edit student data
 */
const validateParentPermission = async (parentEmail, studentEmailKey) => {
  const db = admin.database();
  
  // Check if parent is the primary parent
  const primaryParentRef = db.ref(`students/${studentEmailKey}/profile/ParentEmail`);
  const primaryParentSnapshot = await primaryParentRef.once('value');
  
  if (!primaryParentSnapshot.exists()) {
    throw new HttpsError('not-found', 'Student profile not found');
  }
  
  const primaryParentEmail = primaryParentSnapshot.val();
  if (primaryParentEmail.toLowerCase() !== parentEmail.toLowerCase()) {
    throw new HttpsError('permission-denied', 'Only the primary parent can edit student information');
  }
  
  return true;
};

/**
 * Helper function to create profile history entry
 */
const createProfileHistoryEntry = async (studentEmailKey, fieldName, oldValue, newValue, parentEmail, changeSource = 'parent_portal_update') => {
  const db = admin.database();
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substr(2, 9);
  const entryKey = `${fieldName}_${timestamp}_${randomId}`;
  
  // Get parent relationship
  const parentRef = db.ref(`students/${studentEmailKey}/profile/parentAccounts`);
  const parentSnapshot = await parentRef.once('value');
  let parentRelationship = 'Parent';
  
  if (parentSnapshot.exists()) {
    const parentAccounts = parentSnapshot.val();
    const parentEmailKey = sanitizeEmail(parentEmail);
    if (parentAccounts[parentEmailKey]) {
      parentRelationship = parentAccounts[parentEmailKey].relationship || 'Parent';
    }
  }
  
  const historyEntry = {
    changedAt: timestamp,
    fieldName: fieldName,
    metadata: {
      changeSource: changeSource,
      userEmail: parentEmail,
      isParentUpdate: true,
      parentRelationship: parentRelationship
    },
    newValue: newValue,
    previousValue: oldValue
  };
  
  await db.ref(`students/${studentEmailKey}/profileHistory/${entryKey}`).set(historyEntry);
  return entryKey;
};

/**
 * Helper function to create or update summary entry
 */
const createSummaryEntry = async (studentEmailKey, parentEmail, fieldsChanged, changeSource = 'parent_portal_update') => {
  const db = admin.database();
  const timestamp = Date.now();
  const summaryKey = `${changeSource}_${timestamp}`;
  
  const summaryEntry = {
    changeCount: fieldsChanged.length,
    fieldsChanged: fieldsChanged,
    timestamp: timestamp,
    userEmail: parentEmail,
    isParentUpdate: true,
    lastChangeTimestamp: timestamp
  };
  
  await db.ref(`students/${studentEmailKey}/profileHistory/summaries/${summaryKey}`).set(summaryEntry);
  return summaryKey;
};

/**
 * Helper function to validate file upload
 */
const validateFile = (file, maxSizeMB = 10) => {
  const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
  
  if (!validTypes.includes(file.mimetype)) {
    throw new HttpsError('invalid-argument', 'File must be PDF or image (jpg, jpeg, png)');
  }
  
  if (file.size > maxSize) {
    throw new HttpsError('invalid-argument', `File must be less than ${maxSizeMB}MB`);
  }
  
  return true;
};

/**
 * Cloud Function: updateStudentPersonalInfo
 * Updates student's personal information (name, birthday, gender, phone)
 */
const updateStudentPersonalInfo = onCall({
  memory: '256MiB',
  timeoutSeconds: 60,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000"]
}, async (data) => {
  // Authentication check
  if (!data.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { studentEmailKey, updates } = data.data;
  const parentEmail = data.auth.token.email;

  if (!studentEmailKey || !updates) {
    throw new HttpsError('invalid-argument', 'Missing required fields');
  }

  const db = admin.database();
  
  try {
    // Validate parent permission
    await validateParentPermission(parentEmail, studentEmailKey);
    
    // Get current values for history tracking
    const profileRef = db.ref(`students/${studentEmailKey}/profile`);
    const profileSnapshot = await profileRef.once('value');
    
    if (!profileSnapshot.exists()) {
      throw new HttpsError('not-found', 'Student profile not found');
    }
    
    const currentProfile = profileSnapshot.val();
    const fieldsChanged = [];
    const historyEntries = [];
    
    // Valid fields for personal info
    const validFields = ['firstName', 'lastName', 'preferredFirstName', 'birthday', 'age', 'gender', 'StudentPhone'];
    const updateData = {};
    
    for (const [field, newValue] of Object.entries(updates)) {
      if (!validFields.includes(field)) {
        throw new HttpsError('invalid-argument', `Field '${field}' is not allowed for personal info updates`);
      }
      
      const oldValue = currentProfile[field];
      if (oldValue !== newValue) {
        updateData[field] = newValue;
        fieldsChanged.push(field);
        
        // Create history entry
        const entryKey = await createProfileHistoryEntry(
          studentEmailKey, 
          field, 
          oldValue, 
          newValue, 
          parentEmail
        );
        historyEntries.push(entryKey);
      }
    }
    
    if (fieldsChanged.length === 0) {
      return {
        success: true,
        message: 'No changes detected',
        updatedFields: []
      };
    }
    
    // Update profile
    await profileRef.update(updateData);
    
    // Create summary entry
    await createSummaryEntry(studentEmailKey, parentEmail, fieldsChanged);
    
    return {
      success: true,
      message: 'Personal information updated successfully',
      updatedFields: fieldsChanged,
      updatedData: updateData
    };
    
  } catch (error) {
    console.error('Error updating student personal info:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', error.message || 'Failed to update personal information');
  }
});

/**
 * Cloud Function: updateStudentAddress
 * Updates student's address information
 */
const updateStudentAddress = onCall({
  memory: '256MiB',
  timeoutSeconds: 60,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000"]
}, async (data) => {
  // Authentication check
  if (!data.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { studentEmailKey, updates } = data.data;
  const parentEmail = data.auth.token.email;

  if (!studentEmailKey || !updates) {
    throw new HttpsError('invalid-argument', 'Missing required fields');
  }

  const db = admin.database();
  
  try {
    // Validate parent permission
    await validateParentPermission(parentEmail, studentEmailKey);
    
    // Get current values for history tracking
    const profileRef = db.ref(`students/${studentEmailKey}/profile`);
    const profileSnapshot = await profileRef.once('value');
    
    if (!profileSnapshot.exists()) {
      throw new HttpsError('not-found', 'Student profile not found');
    }
    
    const currentProfile = profileSnapshot.val();
    const fieldsChanged = [];
    const historyEntries = [];
    
    // Valid fields for address
    const validFields = ['address', 'city', 'province', 'postalCode'];
    const updateData = {};
    
    for (const [field, newValue] of Object.entries(updates)) {
      if (!validFields.includes(field)) {
        throw new HttpsError('invalid-argument', `Field '${field}' is not allowed for address updates`);
      }
      
      const oldValue = currentProfile[field];
      if (oldValue !== newValue) {
        updateData[field] = newValue;
        fieldsChanged.push(field);
        
        // Create history entry
        const entryKey = await createProfileHistoryEntry(
          studentEmailKey, 
          field, 
          oldValue, 
          newValue, 
          parentEmail
        );
        historyEntries.push(entryKey);
      }
    }
    
    if (fieldsChanged.length === 0) {
      return {
        success: true,
        message: 'No changes detected',
        updatedFields: []
      };
    }
    
    // Update profile
    await profileRef.update(updateData);
    
    // Create summary entry
    await createSummaryEntry(studentEmailKey, parentEmail, fieldsChanged);
    
    return {
      success: true,
      message: 'Address information updated successfully',
      updatedFields: fieldsChanged,
      updatedData: updateData
    };
    
  } catch (error) {
    console.error('Error updating student address:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', error.message || 'Failed to update address information');
  }
});

/**
 * Cloud Function: updateStudentAcademicInfo
 * Updates student's academic information (ASN, grade, home school)
 */
const updateStudentAcademicInfo = onCall({
  memory: '256MiB',
  timeoutSeconds: 60,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000"]
}, async (data) => {
  // Authentication check
  if (!data.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { studentEmailKey, updates } = data.data;
  const parentEmail = data.auth.token.email;

  if (!studentEmailKey || !updates) {
    throw new HttpsError('invalid-argument', 'Missing required fields');
  }

  const db = admin.database();
  
  try {
    // Validate parent permission
    await validateParentPermission(parentEmail, studentEmailKey);
    
    // Get current values for history tracking
    const profileRef = db.ref(`students/${studentEmailKey}/profile`);
    const profileSnapshot = await profileRef.once('value');
    
    if (!profileSnapshot.exists()) {
      throw new HttpsError('not-found', 'Student profile not found');
    }
    
    const currentProfile = profileSnapshot.val();
    const fieldsChanged = [];
    const historyEntries = [];
    
    // Valid fields for academic info
    const validFields = ['asn', 'primarySchool'];
    const updateData = {};
    
    // Handle ASN update
    if (updates.asn !== undefined) {
      // Special validation for ASN
      if (updates.asn) {
        const asnPattern = /^\d{4}-\d{4}-\d$/;
        if (!asnPattern.test(updates.asn)) {
          throw new HttpsError('invalid-argument', 'ASN must be in format ####-####-#');
        }
      }
      
      const oldValue = currentProfile.asn;
      if (oldValue !== updates.asn) {
        updateData.asn = updates.asn;
        fieldsChanged.push('asn');
        
        // Create history entry
        const entryKey = await createProfileHistoryEntry(
          studentEmailKey, 
          'asn', 
          oldValue, 
          updates.asn, 
          parentEmail
        );
        historyEntries.push(entryKey);
      }
    }
    
    // Handle primary school update (for Home Education and Non-Primary students)
    if (updates.primarySchool) {
      // Get student's courses to update primary school info
      const coursesRef = db.ref(`students/${studentEmailKey}/courses`);
      const coursesSnapshot = await coursesRef.once('value');
      
      if (coursesSnapshot.exists()) {
        const courses = coursesSnapshot.val();
        const courseUpdates = {};
        
        // Update primary school info for all courses
        for (const courseId of Object.keys(courses)) {
          courseUpdates[`${courseId}/primarySchoolName`] = updates.primarySchool.name || null;
          courseUpdates[`${courseId}/primarySchoolAddress`] = updates.primarySchool.address || null;
          courseUpdates[`${courseId}/primarySchoolPlaceId`] = updates.primarySchool.placeId || null;
        }
        
        // Apply updates to all courses
        await coursesRef.update(courseUpdates);
        fieldsChanged.push('primarySchool');
        
        // Create history entry for primary school change
        const oldPrimarySchool = courses[Object.keys(courses)[0]]?.primarySchoolName || null;
        const entryKey = await createProfileHistoryEntry(
          studentEmailKey, 
          'primarySchool', 
          oldPrimarySchool, 
          updates.primarySchool.name, 
          parentEmail
        );
        historyEntries.push(entryKey);
      }
    }
    
    if (fieldsChanged.length === 0) {
      return {
        success: true,
        message: 'No changes detected',
        updatedFields: []
      };
    }
    
    // Update profile
    await profileRef.update(updateData);
    
    // Create summary entry
    await createSummaryEntry(studentEmailKey, parentEmail, fieldsChanged);
    
    return {
      success: true,
      message: 'Academic information updated successfully',
      updatedFields: fieldsChanged,
      updatedData: updateData
    };
    
  } catch (error) {
    console.error('Error updating student academic info:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', error.message || 'Failed to update academic information');
  }
});

/**
 * Cloud Function: updateGuardianInfo
 * Updates guardian/parent contact information
 */
const updateGuardianInfo = onCall({
  memory: '256MiB',
  timeoutSeconds: 60,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000"]
}, async (data) => {
  // Authentication check
  if (!data.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { studentEmailKey, updates } = data.data;
  const parentEmail = data.auth.token.email;

  if (!studentEmailKey || !updates) {
    throw new HttpsError('invalid-argument', 'Missing required fields');
  }

  const db = admin.database();
  
  try {
    // Validate parent permission
    await validateParentPermission(parentEmail, studentEmailKey);
    
    // Get current values for history tracking
    const profileRef = db.ref(`students/${studentEmailKey}/profile`);
    const profileSnapshot = await profileRef.once('value');
    
    if (!profileSnapshot.exists()) {
      throw new HttpsError('not-found', 'Student profile not found');
    }
    
    const currentProfile = profileSnapshot.val();
    const fieldsChanged = [];
    const historyEntries = [];
    
    // Valid fields for guardian info
    const validFields = ['ParentEmail', 'ParentPhone_x0023_', 'ParentFirstName', 'ParentLastName', 'parentRelationship', 'isLegalGuardian'];
    const updateData = {};
    
    for (const [field, newValue] of Object.entries(updates)) {
      if (!validFields.includes(field)) {
        throw new HttpsError('invalid-argument', `Field '${field}' is not allowed for guardian info updates`);
      }
      
      // Special validation for email
      if (field === 'ParentEmail' && newValue) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(newValue)) {
          throw new HttpsError('invalid-argument', 'Invalid email format');
        }
      }
      
      const oldValue = currentProfile[field];
      if (oldValue !== newValue) {
        updateData[field] = newValue;
        fieldsChanged.push(field);
        
        // Create history entry
        const entryKey = await createProfileHistoryEntry(
          studentEmailKey, 
          field, 
          oldValue, 
          newValue, 
          parentEmail
        );
        historyEntries.push(entryKey);
      }
    }
    
    if (fieldsChanged.length === 0) {
      return {
        success: true,
        message: 'No changes detected',
        updatedFields: []
      };
    }
    
    // Update profile
    await profileRef.update(updateData);
    
    // Create summary entry
    await createSummaryEntry(studentEmailKey, parentEmail, fieldsChanged);
    
    return {
      success: true,
      message: 'Guardian information updated successfully',
      updatedFields: fieldsChanged,
      updatedData: updateData
    };
    
  } catch (error) {
    console.error('Error updating guardian info:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', error.message || 'Failed to update guardian information');
  }
});

/**
 * Cloud Function: updateStudentStatus
 * Updates student status information (residency, indigenous status)
 */
const updateStudentStatus = onCall({
  memory: '256MiB',
  timeoutSeconds: 60,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000"]
}, async (data) => {
  // Authentication check
  if (!data.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { studentEmailKey, updates } = data.data;
  const parentEmail = data.auth.token.email;

  if (!studentEmailKey || !updates) {
    throw new HttpsError('invalid-argument', 'Missing required fields');
  }

  const db = admin.database();
  
  try {
    // Validate parent permission
    await validateParentPermission(parentEmail, studentEmailKey);
    
    // Get current values for history tracking
    const profileRef = db.ref(`students/${studentEmailKey}/profile`);
    const profileSnapshot = await profileRef.once('value');
    
    if (!profileSnapshot.exists()) {
      throw new HttpsError('not-found', 'Student profile not found');
    }
    
    const currentProfile = profileSnapshot.val();
    const fieldsChanged = [];
    const historyEntries = [];
    
    // Valid fields for status
    const validFields = ['albertaResident', 'indigenousIdentification', 'indigenousStatus'];
    const updateData = {};
    
    for (const [field, newValue] of Object.entries(updates)) {
      if (!validFields.includes(field)) {
        throw new HttpsError('invalid-argument', `Field '${field}' is not allowed for status updates`);
      }
      
      const oldValue = currentProfile[field];
      if (oldValue !== newValue) {
        updateData[field] = newValue;
        fieldsChanged.push(field);
        
        // Create history entry
        const entryKey = await createProfileHistoryEntry(
          studentEmailKey, 
          field, 
          oldValue, 
          newValue, 
          parentEmail
        );
        historyEntries.push(entryKey);
      }
    }
    
    if (fieldsChanged.length === 0) {
      return {
        success: true,
        message: 'No changes detected',
        updatedFields: []
      };
    }
    
    // Update profile
    await profileRef.update(updateData);
    
    // Create summary entry
    await createSummaryEntry(studentEmailKey, parentEmail, fieldsChanged);
    
    return {
      success: true,
      message: 'Status information updated successfully',
      updatedFields: fieldsChanged,
      updatedData: updateData
    };
    
  } catch (error) {
    console.error('Error updating student status:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', error.message || 'Failed to update status information');
  }
});

/**
 * Cloud Function: updateStudentDocuments
 * Updates student documents (citizenship docs, photos) with file upload handling
 */
const updateStudentDocuments = onCall({
  memory: '512MiB',
  timeoutSeconds: 120,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000"]
}, async (data) => {
  // Authentication check
  if (!data.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { studentEmailKey, documentType, fileData, fileName, documentInfo } = data.data;
  const parentEmail = data.auth.token.email;

  if (!studentEmailKey || !documentType) {
    throw new HttpsError('invalid-argument', 'Missing required fields');
  }

  const db = admin.database();
  
  try {
    // Validate parent permission
    await validateParentPermission(parentEmail, studentEmailKey);
    
    let updateData = {};
    let fieldsChanged = [];
    
    if (fileData && fileName) {
      // Handle file upload
      const buffer = Buffer.from(fileData, 'base64');
      const file = {
        buffer: buffer,
        mimetype: fileName.split('.').pop().toLowerCase() === 'pdf' ? 'application/pdf' : `image/${fileName.split('.').pop().toLowerCase()}`,
        size: buffer.length
      };
      
      // Validate file
      validateFile(file, 10);
      
      // Upload to Firebase Storage
      const bucket = getStorage().bucket();
      const timestamp = Date.now();
      const fileExtension = fileName.split('.').pop().toLowerCase();
      const storagePath = `rtdAcademy/parentUpdates/${data.auth.uid}/${timestamp}-${documentType}.${fileExtension}`;
      const fileRef = bucket.file(storagePath);
      
      await fileRef.save(buffer, {
        metadata: {
          contentType: file.mimetype,
          metadata: {
            uploadedBy: parentEmail,
            documentType: documentType,
            originalFileName: fileName
          }
        }
      });
      
      // Get download URL
      await fileRef.makePublic();
      const downloadURL = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
      
      // Get current values for history tracking
      const profileRef = db.ref(`students/${studentEmailKey}/profile`);
      const profileSnapshot = await profileRef.once('value');
      
      if (!profileSnapshot.exists()) {
        throw new HttpsError('not-found', 'Student profile not found');
      }
      
      const currentProfile = profileSnapshot.val();
      
      if (documentType === 'studentPhoto') {
        const oldValue = currentProfile.studentPhoto;
        updateData.studentPhoto = downloadURL;
        fieldsChanged.push('studentPhoto');
        
        await createProfileHistoryEntry(
          studentEmailKey, 
          'studentPhoto', 
          oldValue, 
          downloadURL, 
          parentEmail
        );
      } else if (documentType === 'citizenshipDocument') {
        // Handle citizenship documents array
        const currentDocs = currentProfile.citizenshipDocuments || [];
        const newDoc = {
          url: downloadURL,
          name: fileName,
          type: documentInfo?.type || 'document',
          typeLabel: documentInfo?.typeLabel || 'Document',
          uploadedAt: new Date().toISOString(),
          uploadedBy: parentEmail
        };
        
        const updatedDocs = [...currentDocs, newDoc];
        updateData.citizenshipDocuments = updatedDocs;
        fieldsChanged.push('citizenshipDocuments');
        
        await createProfileHistoryEntry(
          studentEmailKey, 
          'citizenshipDocuments', 
          JSON.stringify(currentDocs), 
          JSON.stringify(updatedDocs), 
          parentEmail
        );
      }
    } else {
      // Handle non-file document updates (like removing documents)
      const profileRef = db.ref(`students/${studentEmailKey}/profile`);
      const profileSnapshot = await profileRef.once('value');
      
      if (!profileSnapshot.exists()) {
        throw new HttpsError('not-found', 'Student profile not found');
      }
      
      const currentProfile = profileSnapshot.val();
      
      if (documentType === 'removeCitizenshipDocument' && documentInfo?.index !== undefined) {
        const currentDocs = currentProfile.citizenshipDocuments || [];
        const updatedDocs = currentDocs.filter((_, index) => index !== documentInfo.index);
        
        updateData.citizenshipDocuments = updatedDocs;
        fieldsChanged.push('citizenshipDocuments');
        
        await createProfileHistoryEntry(
          studentEmailKey, 
          'citizenshipDocuments', 
          JSON.stringify(currentDocs), 
          JSON.stringify(updatedDocs), 
          parentEmail
        );
      }
    }
    
    if (fieldsChanged.length === 0) {
      return {
        success: true,
        message: 'No changes detected',
        updatedFields: []
      };
    }
    
    // Update profile
    const profileRef = db.ref(`students/${studentEmailKey}/profile`);
    await profileRef.update(updateData);
    
    // Create summary entry
    await createSummaryEntry(studentEmailKey, parentEmail, fieldsChanged);
    
    return {
      success: true,
      message: 'Documents updated successfully',
      updatedFields: fieldsChanged,
      updatedData: updateData
    };
    
  } catch (error) {
    console.error('Error updating student documents:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', error.message || 'Failed to update documents');
  }
});

// Export all functions
module.exports = {
  updateStudentPersonalInfo,
  updateStudentAddress,
  updateStudentAcademicInfo,
  updateGuardianInfo,
  updateStudentStatus,
  updateStudentDocuments
};