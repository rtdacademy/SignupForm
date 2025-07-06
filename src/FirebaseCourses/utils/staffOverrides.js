/**
 * Staff Override Utilities
 * 
 * Handles staff-controlled lesson access overrides for Firebase courses.
 * Allows staff users to override lesson accessibility for individual students.
 */

import { getDatabase, ref, get, set, serverTimestamp } from "firebase/database";
import { sanitizeEmail } from '../../utils/sanitizeEmail';

/**
 * Checks if the current user is a staff member with override permissions
 * @param {Object} currentUser - The authenticated user object
 * @returns {boolean} - Whether user has staff override permissions
 */
export const hasStaffOverridePermissions = (currentUser) => {
  return currentUser?.email?.endsWith("@rtdacademy.com") || false;
};

/**
 * Gets staff override data for a student's course
 * @param {string} studentEmail - Student's email address
 * @param {string} courseId - Course ID
 * @returns {Object} - Staff override data or empty object
 */
export const getStaffOverrides = async (studentEmail, courseId) => {
  if (!studentEmail || !courseId) {
    return {};
  }

  try {
    const db = getDatabase();
    const sanitizedEmail = sanitizeEmail(studentEmail);
    const overridesRef = ref(db, `students/${sanitizedEmail}/courses/${courseId}/staffOverrides`);
    
    const snapshot = await get(overridesRef);
    return snapshot.exists() ? snapshot.val() : {};
  } catch (error) {
    console.error('Error fetching staff overrides:', error);
    return {};
  }
};

/**
 * Gets lesson access overrides for a student's course
 * @param {string} studentEmail - Student's email address
 * @param {string} courseId - Course ID
 * @returns {Object} - Lesson access overrides keyed by lessonId
 */
export const getLessonAccessOverrides = async (studentEmail, courseId) => {
  try {
    const overrides = await getStaffOverrides(studentEmail, courseId);
    return overrides.lessonAccess || {};
  } catch (error) {
    console.error('Error fetching lesson access overrides:', error);
    return {};
  }
};

/**
 * Sets a lesson access override for a student
 * @param {string} studentEmail - Student's email address
 * @param {string} courseId - Course ID
 * @param {string} lessonId - Lesson ID to override
 * @param {boolean} accessible - Whether lesson should be accessible
 * @param {string} staffEmail - Email of staff member making override
 * @param {string} reason - Reason for override (optional)
 * @returns {boolean} - Success status
 */
export const setLessonAccessOverride = async (studentEmail, courseId, lessonId, accessible, staffEmail, reason = '') => {
  if (!studentEmail || !courseId || !lessonId || !staffEmail) {
    console.error('Missing required parameters for lesson access override');
    return false;
  }

  try {
    const db = getDatabase();
    const sanitizedEmail = sanitizeEmail(studentEmail);
    const overrideRef = ref(db, `students/${sanitizedEmail}/courses/${courseId}/staffOverrides/lessonAccess/${lessonId}`);
    
    const overrideData = {
      accessible: accessible,
      overriddenBy: staffEmail,
      overrideDate: serverTimestamp(),
      reason: reason || (accessible ? 'Staff override - Access granted' : 'Staff override - Access restricted'),
      lessonId: lessonId
    };

    await set(overrideRef, overrideData);
    
    // Also update the general override metadata
    const metadataRef = ref(db, `students/${sanitizedEmail}/courses/${courseId}/staffOverrides/metadata`);
    const metadataSnapshot = await get(metadataRef);
    const existingMetadata = metadataSnapshot.exists() ? metadataSnapshot.val() : {};
    
    const updatedMetadata = {
      ...existingMetadata,
      enabled: true,
      lastModifiedBy: staffEmail,
      lastModifiedDate: serverTimestamp(),
      totalOverrides: (existingMetadata.totalOverrides || 0) + 1
    };

    await set(metadataRef, updatedMetadata);
    
    console.log(`Lesson access override set: ${lessonId} -> ${accessible ? 'accessible' : 'restricted'} by ${staffEmail}`);
    return true;
  } catch (error) {
    console.error('Error setting lesson access override:', error);
    return false;
  }
};

/**
 * Removes a lesson access override for a student
 * @param {string} studentEmail - Student's email address
 * @param {string} courseId - Course ID
 * @param {string} lessonId - Lesson ID to remove override for
 * @param {string} staffEmail - Email of staff member removing override
 * @returns {boolean} - Success status
 */
export const removeLessonAccessOverride = async (studentEmail, courseId, lessonId, staffEmail) => {
  if (!studentEmail || !courseId || !lessonId || !staffEmail) {
    console.error('Missing required parameters for removing lesson access override');
    return false;
  }

  try {
    const db = getDatabase();
    const sanitizedEmail = sanitizeEmail(studentEmail);
    const overrideRef = ref(db, `students/${sanitizedEmail}/courses/${courseId}/staffOverrides/lessonAccess/${lessonId}`);
    
    // Set to null to remove the node
    await set(overrideRef, null);
    
    // Update metadata
    const metadataRef = ref(db, `students/${sanitizedEmail}/courses/${courseId}/staffOverrides/metadata`);
    const metadataSnapshot = await get(metadataRef);
    const existingMetadata = metadataSnapshot.exists() ? metadataSnapshot.val() : {};
    
    const updatedMetadata = {
      ...existingMetadata,
      lastModifiedBy: staffEmail,
      lastModifiedDate: serverTimestamp(),
      totalOverrides: Math.max((existingMetadata.totalOverrides || 1) - 1, 0)
    };

    await set(metadataRef, updatedMetadata);
    
    console.log(`Lesson access override removed: ${lessonId} by ${staffEmail}`);
    return true;
  } catch (error) {
    console.error('Error removing lesson access override:', error);
    return false;
  }
};

/**
 * Checks if a lesson has a staff access override
 * @param {Object} overrides - Lesson access overrides object
 * @param {string} lessonId - Lesson ID to check
 * @returns {Object|null} - Override data if exists, null otherwise
 */
export const getLessonOverride = (overrides, lessonId) => {
  if (!overrides || !lessonId) {
    return null;
  }
  
  return overrides[lessonId] || null;
};

/**
 * Validates staff override permissions and logs the action
 * @param {Object} currentUser - The authenticated user object
 * @param {string} action - The action being performed
 * @param {string} studentEmail - Student's email address
 * @param {string} courseId - Course ID
 * @param {string} lessonId - Lesson ID (optional)
 * @returns {boolean} - Whether action is authorized
 */
export const validateStaffOverrideAction = (currentUser, action, studentEmail, courseId, lessonId = '') => {
  // Check if user has staff permissions
  if (!hasStaffOverridePermissions(currentUser)) {
    console.warn(`Unauthorized override attempt: ${currentUser?.email || 'unknown'} tried to ${action}`);
    return false;
  }

  // Log the action for audit purposes
  console.log(`Staff Override Action: ${currentUser.email} - ${action} - Student: ${studentEmail} - Course: ${courseId}${lessonId ? ` - Lesson: ${lessonId}` : ''}`);
  
  return true;
};

/**
 * Gets a formatted reason for staff override accessibility
 * @param {Object} override - Override data object
 * @param {boolean} defaultAccessible - Default accessibility without override
 * @returns {string} - Formatted reason string
 */
export const getOverrideReason = (override, defaultAccessible = false) => {
  if (!override) {
    return null;
  }
  
  const action = override.accessible ? 'granted' : 'restricted';
  const staffName = override.overriddenBy ? override.overriddenBy.split('@')[0] : 'staff';
  const date = override.overrideDate ? new Date(override.overrideDate).toLocaleDateString() : 'recently';
  
  return `Staff override: Access ${action} by ${staffName} on ${date}`;
};