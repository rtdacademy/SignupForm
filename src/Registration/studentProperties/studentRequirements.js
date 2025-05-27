/**
 * Student Requirements Configuration
 * Defines required, optional, and conditional fields for each student type
 * Used to determine what information needs to be collected for PASI registration
 */

// Field categories and their importance levels
export const FIELD_IMPORTANCE = {
  REQUIRED: 'required',        // Must have for basic functionality
  PASI_REQUIRED: 'pasi',       // Required for PASI registration
  RECOMMENDED: 'recommended',  // Should have but not blocking
  OPTIONAL: 'optional'         // Nice to have
};

// Common requirements for all students
const commonRequirements = {
  personal: {
    firstName: { importance: FIELD_IMPORTANCE.PASI_REQUIRED, label: 'First Name' },
    lastName: { importance: FIELD_IMPORTANCE.PASI_REQUIRED, label: 'Last Name' },
    preferredFirstName: { importance: FIELD_IMPORTANCE.OPTIONAL, label: 'Preferred First Name' },
    birthday: { importance: FIELD_IMPORTANCE.PASI_REQUIRED, label: 'Date of Birth' },
    age: { importance: FIELD_IMPORTANCE.REQUIRED, label: 'Age' },
    gender: { importance: FIELD_IMPORTANCE.PASI_REQUIRED, label: 'Gender' },
    StudentPhone: { importance: FIELD_IMPORTANCE.RECOMMENDED, label: 'Phone Number' }
  },
  academic: {
    asn: { importance: FIELD_IMPORTANCE.PASI_REQUIRED, label: 'Alberta Student Number (ASN)' }
  },
  address: {
    'address.streetAddress': { importance: FIELD_IMPORTANCE.PASI_REQUIRED, label: 'Street Address' },
    'address.city': { importance: FIELD_IMPORTANCE.PASI_REQUIRED, label: 'City' },
    'address.province': { importance: FIELD_IMPORTANCE.PASI_REQUIRED, label: 'Province' },
    'address.postalCode': { importance: FIELD_IMPORTANCE.PASI_REQUIRED, label: 'Postal Code' }
  },
  status: {
    albertaResident: { importance: FIELD_IMPORTANCE.PASI_REQUIRED, label: 'Alberta Residency' },
    indigenousIdentification: { importance: FIELD_IMPORTANCE.RECOMMENDED, label: 'Indigenous Identification' },
    indigenousStatus: { importance: FIELD_IMPORTANCE.RECOMMENDED, label: 'Indigenous Status' }
  },
  documents: {
    studentPhoto: { importance: FIELD_IMPORTANCE.RECOMMENDED, label: 'Student Photo' },
    citizenshipDocuments: { importance: FIELD_IMPORTANCE.REQUIRED, label: 'Citizenship Documents' }
  }
};

// Requirements specific to minors (under 18)
const minorRequirements = {
  guardian: {
    ParentEmail: { importance: FIELD_IMPORTANCE.REQUIRED, label: 'Parent/Guardian Email' },
    'ParentPhone_x0023_': { importance: FIELD_IMPORTANCE.REQUIRED, label: 'Parent/Guardian Phone' },
    ParentFirstName: { importance: FIELD_IMPORTANCE.REQUIRED, label: 'Parent/Guardian First Name' },
    ParentLastName: { importance: FIELD_IMPORTANCE.REQUIRED, label: 'Parent/Guardian Last Name' },
    parentRelationship: { importance: FIELD_IMPORTANCE.REQUIRED, label: 'Relationship to Student' },
    isLegalGuardian: { importance: FIELD_IMPORTANCE.REQUIRED, label: 'Legal Guardian Status' }
  }
};

// Requirements specific to international students
const internationalRequirements = {
  documents: {
    internationalDocuments: { importance: FIELD_IMPORTANCE.REQUIRED, label: 'International Documents', isArray: true, minItems: 1 },
    citizenshipDocuments: { importance: FIELD_IMPORTANCE.OPTIONAL, label: 'Citizenship Documents' } // Override to optional
  }
};

// Student type specific overrides
const studentTypeOverrides = {
  // Currently no overrides needed since primary school is stored at course level
};

/**
 * Get requirements for a specific student based on their type and characteristics
 * @param {Object} student - Student data including type, age, etc.
 * @returns {Object} Merged requirements object
 */
export function getStudentRequirements(student) {
  let requirements = JSON.parse(JSON.stringify(commonRequirements)); // Deep clone
  
  // Add minor requirements if under 18
  if (student.profile?.age < 18) {
    requirements = mergeRequirements(requirements, minorRequirements);
  }
  
  // Get student type from the first course if available
  let studentType = student.studentType?.Value;
  if (!studentType && student.courses && student.courses.length > 0) {
    studentType = student.courses[0].StudentType?.Value;
  }
  
  // Add international requirements if international student
  if (studentType === 'International Student') {
    requirements = mergeRequirements(requirements, internationalRequirements);
  }
  
  // Apply student type specific overrides
  if (studentType && studentTypeOverrides[studentType]) {
    requirements = mergeRequirements(requirements, studentTypeOverrides[studentType]);
  }
  
  return requirements;
}

/**
 * Merge two requirement objects, with the second overriding the first
 */
function mergeRequirements(base, override) {
  const merged = { ...base };
  
  Object.keys(override).forEach(category => {
    if (!merged[category]) {
      merged[category] = {};
    }
    merged[category] = { ...merged[category], ...override[category] };
  });
  
  return merged;
}

/**
 * Get the value of a field from student data, supporting nested paths
 * @param {Object} student - Student data
 * @param {string} fieldPath - Path to field (e.g., 'profile.firstName' or 'profile.address.streetAddress')
 * @returns {*} Field value or undefined
 */
export function getFieldValue(student, fieldPath) {
  const parts = fieldPath.split('.');
  let value = student;
  
  for (const part of parts) {
    if (value && typeof value === 'object') {
      value = value[part];
    } else {
      return undefined;
    }
  }
  
  return value;
}

/**
 * Check if a field has a value (not null, undefined, or empty string/array)
 * For international documents array, check if it has at least one valid document
 */
export function hasFieldValue(student, fieldPath) {
  const value = getFieldValue(student, fieldPath);
  
  if (value === null || value === undefined || value === '') {
    return false;
  }
  
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return false;
    }
    // For international documents, check if at least one document has a URL
    if (fieldPath === 'profile.internationalDocuments') {
      return value.some(doc => doc && doc.url);
    }
  }
  
  return true;
}

/**
 * Calculate completion statistics for a student
 * @param {Object} student - Student data
 * @returns {Object} Completion statistics
 */
export function calculateCompletionStats(student) {
  const requirements = getStudentRequirements(student);
  const stats = {
    total: 0,
    completed: 0,
    pasiRequired: 0,
    pasiCompleted: 0,
    required: 0,
    requiredCompleted: 0,
    byCategory: {}
  };
  
  Object.entries(requirements).forEach(([category, fields]) => {
    stats.byCategory[category] = {
      total: 0,
      completed: 0,
      fields: {}
    };
    
    Object.entries(fields).forEach(([fieldName, config]) => {
      let fieldPath;
      if (category === 'guardian') {
        fieldPath = `profile.${fieldName}`;
      } else if (category === 'documents') {
        // Handle documents specially - they might be at top level or nested
        if (fieldName === 'internationalDocuments') {
          fieldPath = `profile.internationalDocuments`;
        } else if (fieldName.includes('.')) {
          fieldPath = fieldName;
        } else {
          fieldPath = `profile.${fieldName}`;
        }
      } else if (fieldName.includes('.')) {
        // Handle nested fields like 'address.streetAddress'
        fieldPath = `profile.${fieldName}`;
      } else {
        fieldPath = `profile.${fieldName}`;
      }
      
      const hasValue = hasFieldValue(student, fieldPath);
      
      // Debug logging for troubleshooting
      if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
        const actualValue = getFieldValue(student, fieldPath);
        console.log(`Field check: ${fieldPath} = ${JSON.stringify(actualValue)} (hasValue: ${hasValue})`);
      }
      
      stats.total++;
      stats.byCategory[category].total++;
      
      if (hasValue) {
        stats.completed++;
        stats.byCategory[category].completed++;
      }
      
      if (config.importance === FIELD_IMPORTANCE.PASI_REQUIRED) {
        stats.pasiRequired++;
        if (hasValue) stats.pasiCompleted++;
      }
      
      if (config.importance === FIELD_IMPORTANCE.REQUIRED || 
          config.importance === FIELD_IMPORTANCE.PASI_REQUIRED) {
        stats.required++;
        if (hasValue) stats.requiredCompleted++;
      }
      
      stats.byCategory[category].fields[fieldName] = {
        ...config,
        hasValue,
        fieldPath
      };
    });
  });
  
  // Calculate percentages
  stats.completionPercentage = Math.round((stats.completed / stats.total) * 100);
  stats.pasiCompletionPercentage = stats.pasiRequired > 0 
    ? Math.round((stats.pasiCompleted / stats.pasiRequired) * 100)
    : 100;
  stats.requiredCompletionPercentage = stats.required > 0
    ? Math.round((stats.requiredCompleted / stats.required) * 100)
    : 100;
  
  return stats;
}

/**
 * Get missing fields grouped by category
 * @param {Object} student - Student data
 * @param {string} importanceFilter - Filter by importance level (optional)
 * @returns {Object} Missing fields by category
 */
export function getMissingFields(student, importanceFilter = null) {
  const requirements = getStudentRequirements(student);
  const missing = {};
  
  Object.entries(requirements).forEach(([category, fields]) => {
    const missingInCategory = {};
    
    Object.entries(fields).forEach(([fieldName, config]) => {
      if (importanceFilter && config.importance !== importanceFilter) {
        return;
      }
      
      let fieldPath;
      if (category === 'guardian') {
        fieldPath = `profile.${fieldName}`;
      } else if (category === 'documents') {
        // Handle documents specially - they might be at top level or nested
        if (fieldName === 'internationalDocuments') {
          fieldPath = `profile.internationalDocuments`;
        } else if (fieldName.includes('.')) {
          fieldPath = fieldName;
        } else {
          fieldPath = `profile.${fieldName}`;
        }
      } else if (fieldName.includes('.')) {
        // Handle nested fields like 'address.streetAddress'
        fieldPath = `profile.${fieldName}`;
      } else {
        fieldPath = `profile.${fieldName}`;
      }
      
      if (!hasFieldValue(student, fieldPath)) {
        missingInCategory[fieldName] = {
          ...config,
          fieldPath,
          category
        };
      }
    });
    
    if (Object.keys(missingInCategory).length > 0) {
      missing[category] = missingInCategory;
    }
  });
  
  return missing;
}

/**
 * Get category display information
 */
export const CATEGORY_INFO = {
  personal: {
    title: 'Personal Information',
    icon: 'User',
    description: 'Basic student information'
  },
  address: {
    title: 'Address Information',
    icon: 'MapPin',
    description: 'Current residence details'
  },
  academic: {
    title: 'Academic Information',
    icon: 'GraduationCap',
    description: 'School and grade information'
  },
  guardian: {
    title: 'Parent/Guardian Information',
    icon: 'Users',
    description: 'Parent or guardian contact details'
  },
  status: {
    title: 'Status Information',
    icon: 'Flag',
    description: 'Residency and identification status'
  },
  documents: {
    title: 'Documents',
    icon: 'FileText',
    description: 'Required documentation and photos'
  }
};