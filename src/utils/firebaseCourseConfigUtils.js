import { getDatabase, ref, update, get } from 'firebase/database';

// Default course configuration structure
export const getDefaultCourseConfig = (courseId, title = 'New Course') => ({
  courseId,
  title,
  metadata: {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    status: 'development',
    createdAt: new Date().toISOString()
  },
  weights: {
    lesson: 0,
    assignment: 0.3,
    lab: 0.2,
    exam: 0.5
  },
  attemptLimits: {
    lesson: 999,      // Unlimited for lessons
    assignment: 3,    // 3 attempts for assignments
    exam: 1,          // 1 attempt for exams
    quiz: 2,          // 2 attempts for quizzes
    lab: 3            // 3 attempts for labs
  },
  courseStructure: {
    units: []
  }
});


// Generate unique IDs
export const generateUniqueId = (type) => {
  return `${type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

// Generate proper unit ID following naming convention: unit_1_momentum_optics
export const generateUnitId = (unitNumber, name) => {
  const cleanName = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  return `unit_${unitNumber}_${cleanName}`;
};

// Generate proper item ID following naming convention: 01_physics_30_whatever_name
export const generateItemId = (itemNumber, customName, customPrefix = null) => {
  const prefix = customPrefix !== null ? String(customPrefix).padStart(2, '0') : String(itemNumber).padStart(2, '0');
  const cleanName = customName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  return `${prefix}_physics_30_${cleanName}`;
};

// Extract prefix from existing itemId (e.g., "06_physics_30_something" -> "06")
export const extractItemIdPrefix = (itemId) => {
  if (!itemId) return null;
  const match = itemId.match(/^(\d{2})_physics_30_/);
  return match ? match[1] : null;
};

// Extract title from itemId - clean any text by removing numbers/symbols and capitalizing words
export const extractTitleFromItemId = (itemId) => {
  if (!itemId) return '';
  
  // Remove numbers, symbols, and split by underscores, dashes, or spaces
  const cleanedText = itemId
    .replace(/[0-9]/g, '') // Remove all numbers
    .replace(/[^a-zA-Z\s_-]/g, '') // Remove symbols except spaces, underscores, dashes
    .replace(/[_-]+/g, ' ') // Replace underscores and dashes with spaces
    .trim(); // Remove leading/trailing spaces
  
  // Split by spaces and capitalize each word
  return cleanedText
    .split(/\s+/)
    .filter(word => word.length > 0) // Remove empty strings
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Generate proper question ID following naming convention: course2_01_whatever_question1
export const generateQuestionId = (courseId, itemNumber, questionNumber, customTitle = '') => {
  const paddedItemNumber = String(itemNumber).padStart(2, '0');
  
  if (customTitle) {
    // Clean the custom title and incorporate it into the ID
    const cleanTitle = customTitle.toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .substring(0, 30); // Limit length
    
    if (cleanTitle) {
      return `course${courseId}_${paddedItemNumber}_${cleanTitle}_question${questionNumber}`;
    }
  }
  
  return `course${courseId}_${paddedItemNumber}_question${questionNumber}`;
};

// Generate question ID with preview
export const generateQuestionIdPreview = (courseId, itemNumber, questionNumber, title = '') => {
  return generateQuestionId(courseId, itemNumber, questionNumber, title);
};

// Generate contentPath from itemId for content registry lookup
export const generateContentPath = (itemId) => {
  if (!itemId) return '';
  
  // Handle special assignment patterns: assignment_lX_Y → XX-lX-Y-assignment
  if (itemId.startsWith('assignment_l')) {
    const match = itemId.match(/assignment_l(\d+)_(\d+)/);
    if (match) {
      const [, start, end] = match;
      // For assignments, we need to derive the order number some other way
      // For now, return the pattern and let the caller provide order
      return `XX-l${start}-${end}-assignment`;
    }
  }
  
  // Handle lab patterns: lab_description → XX-lab-description  
  if (itemId.startsWith('lab_')) {
    const description = itemId.replace('lab_', '');
    return `XX-lab-${description.replace(/_/g, '-')}`;
  }
  
  // Handle numbered items with physics_30 pattern: XX_physics_30_description → XX-description
  const physicsMatch = itemId.match(/^(\d{2})_physics_30_(.+)$/);
  if (physicsMatch) {
    const [, number, description] = physicsMatch;
    return `${number}-${description.replace(/_/g, '-')}`;
  }
  
  // Handle other numbered patterns: XX_description → XX-description
  const numberedMatch = itemId.match(/^(\d{2})_(.+)$/);
  if (numberedMatch) {
    const [, number, description] = numberedMatch;
    return `${number}-${description.replace(/_/g, '-')}`;
  }
  
  // Default: convert underscores to hyphens
  return itemId.replace(/_/g, '-');
};

// Generate contentPath with order number for special patterns
export const generateContentPathWithOrder = (itemId, order) => {
  const baseContentPath = generateContentPath(itemId);
  
  // Replace XX placeholder with actual order number
  if (baseContentPath.startsWith('XX-')) {
    const orderStr = String(order).padStart(2, '0');
    return baseContentPath.replace('XX-', `${orderStr}-`);
  }
  
  return baseContentPath;
};

// Validate question ID format and uniqueness
export const validateQuestionId = (questionId, existingQuestions = []) => {
  const errors = [];
  
  // Check format
  if (!questionId) {
    errors.push('Question ID is required');
    return { isValid: false, errors };
  }
  
  // Check basic format pattern
  const pattern = /^course\d+_\d{2}_.*_question\d+$|^course\d+_\d{2}_question\d+$/;
  if (!pattern.test(questionId)) {
    errors.push('Question ID must follow the format: course{id}_{item}_question{num} or course{id}_{item}_{title}_question{num}');
  }
  
  // Check uniqueness
  if (existingQuestions.some(q => q.questionId === questionId)) {
    errors.push('Question ID must be unique within this item');
  }
  
  // Check length
  if (questionId.length > 100) {
    errors.push('Question ID is too long (max 100 characters)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Get next available question number for an item
export const getNextQuestionNumber = (existingQuestions = []) => {
  if (!existingQuestions.length) return 1;
  
  const numbers = existingQuestions
    .map(q => {
      const match = q.questionId?.match(/question(\d+)$/);
      return match ? parseInt(match[1]) : 0;
    })
    .filter(n => n > 0);
  
  return Math.max(...numbers, 0) + 1;
};

// Validate itemId uniqueness across all course units
export const validateItemId = (itemId, courseStructure, excludeUnitIndex = null, excludeItemIndex = null) => {
  const errors = [];
  
  if (!itemId) {
    errors.push('Item ID is required');
    return { isValid: false, errors };
  }
  
  // Check uniqueness across all units
  if (courseStructure?.units) {
    courseStructure.units.forEach((unit, unitIndex) => {
      if (unit.items) {
        unit.items.forEach((item, itemIndex) => {
          // Skip the item being edited
          if (excludeUnitIndex === unitIndex && excludeItemIndex === itemIndex) {
            return;
          }
          
          if (item.itemId === itemId) {
            errors.push('Item ID must be unique across the entire course');
          }
        });
      }
    });
  }
  
  // Check length
  if (itemId.length > 100) {
    errors.push('Item ID is too long (max 100 characters)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Save course configuration to Firebase
export const saveCourseConfig = async (courseId, config) => {
  try {
    const db = getDatabase();
    const courseRef = ref(db, `courses/${courseId}/course-config`);
    
    // Update metadata
    const updatedConfig = {
      ...config,
      metadata: {
        ...config.metadata,
        lastUpdated: new Date().toISOString(),
        version: incrementVersion(config.metadata?.version || '1.0.0')
      }
    };
    
    await update(courseRef, updatedConfig);
    
    // Also update version control
    const versionRef = ref(db, `courses/${courseId}/course-config-version-control`);
    await update(versionRef, {
      version: updatedConfig.metadata.version,
      lastSynced: new Date().toISOString(),
      syncedFrom: 'UI Editor',
      updatedBy: 'Course Manager'
    });
    
    return { success: true, config: updatedConfig };
  } catch (error) {
    console.error('Error saving course config:', error);
    return { success: false, error: error.message };
  }
};

// Load course configuration from Firebase
export const loadCourseConfig = async (courseId) => {
  try {
    const db = getDatabase();
    const configRef = ref(db, `courses/${courseId}/course-config`);
    const snapshot = await get(configRef);
    
    if (snapshot.exists()) {
      return { success: true, config: snapshot.val() };
    } else {
      // Return default config if none exists
      return { success: true, config: getDefaultCourseConfig(courseId) };
    }
  } catch (error) {
    console.error('Error loading course config:', error);
    return { success: false, error: error.message };
  }
};

// Increment version number
const incrementVersion = (version) => {
  const parts = version.split('.');
  const patch = parseInt(parts[2] || 0) + 1;
  return `${parts[0]}.${parts[1]}.${patch}`;
};

// Validate course configuration
export const validateCourseConfig = (config) => {
  const errors = [];
  
  // Check required fields
  if (!config.courseId) errors.push('Course ID is required');
  if (!config.title) errors.push('Course title is required');
  
  // Validate weights
  const weightSum = Object.values(config.weights || {}).reduce((sum, weight) => sum + weight, 0);
  if (Math.abs(weightSum - 1) > 0.001 && weightSum !== 0) {
    errors.push(`Weights must sum to 1 or 0 (current sum: ${weightSum})`);
  }
  
  // Validate attempt limits
  if (config.attemptLimits) {
    Object.entries(config.attemptLimits).forEach(([sessionType, attempts]) => {
      if (typeof attempts !== 'number' || attempts < 1) {
        errors.push(`Attempt limit for ${sessionType} must be a positive number`);
      }
      if (attempts > 999) {
        errors.push(`Attempt limit for ${sessionType} cannot exceed 999`);
      }
    });
  }
  
  return errors;
};

// Clone course configuration
export const cloneCourseConfig = (sourceConfig, newCourseId, newTitle) => {
  const clonedConfig = JSON.parse(JSON.stringify(sourceConfig));
  
  return {
    ...clonedConfig,
    courseId: newCourseId,
    title: newTitle,
    metadata: {
      ...clonedConfig.metadata,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      clonedFrom: sourceConfig.courseId
    }
  };
};

// Export/Import functions
export const exportCourseConfig = (config) => {
  const dataStr = JSON.stringify(config, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `course-config-${config.courseId}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export const importCourseConfig = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target.result);
        const errors = validateCourseConfig(config);
        
        if (errors.length > 0) {
          reject(new Error(`Invalid configuration: ${errors.join(', ')}`));
        } else {
          resolve(config);
        }
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};