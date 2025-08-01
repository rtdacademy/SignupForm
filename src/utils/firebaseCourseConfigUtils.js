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
export const generateItemId = (itemNumber, customName) => {
  const paddedNumber = String(itemNumber).padStart(2, '0');
  const cleanName = customName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  return `${paddedNumber}_physics_30_${cleanName}`;
};

// Generate proper question ID following naming convention: course2_01_whatever_question1
export const generateQuestionId = (courseId, itemNumber, questionNumber) => {
  const paddedItemNumber = String(itemNumber).padStart(2, '0');
  return `course${courseId}_${paddedItemNumber}_question${questionNumber}`;
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