/**
 * Configuration Loader Utility
 * Loads and merges configuration from assessment-defaults.json and other config files
 */

const fs = require('fs').promises;
const path = require('path');

// Cache configurations to avoid repeated file reads
let configCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Loads the global assessment defaults configuration
 * @returns {Promise<Object>} The loaded configuration
 */
async function loadAssessmentDefaults() {
  try {
    const configPath = path.join(__dirname, '../config/assessment-defaults.json');
    const configData = await fs.readFile(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.warn('Could not load assessment-defaults.json, using built-in defaults:', error.message);
    // Return built-in defaults if file doesn't exist
    return getBuiltInDefaults();
  }
}

/**
 * Loads a course-specific configuration file
 * @param {string} courseId - The course ID
 * @param {string} configFileName - The config file name (e.g., 'course-config.json')
 * @returns {Promise<Object>} The loaded course configuration
 */
async function loadCourseConfig(courseId, configFileName = 'course-config.json') {
  // Legacy function - courses-config directory no longer exists
  // Returning empty object as configurations are now handled differently
  console.warn(`loadCourseConfig called for course ${courseId} - returning empty object (legacy method)`);
  return {};
}

/**
 * Gets built-in default configuration when files are not available
 * @returns {Object} Built-in default configuration
 */
function getBuiltInDefaults() {
  return {
    questionTypes: {
      multipleChoice: {
        standard: {
          numberOfOptions: 4,
          correctOptions: 1,
          shuffleOptions: true,
          displayFormat: "vertical"
        },
        ai_generated: {
          numberOfOptions: 4,
          correctOptions: 1,
          shuffleOptions: true,
          displayFormat: "vertical",
          maxAttempts: 9999,
          pointsValue: 2,
          showFeedback: true,
          aiSettings: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40
          },
          generationPrompts: {
            beginner: "Create a basic multiple-choice question that tests fundamental understanding. Focus on definitions and basic concepts.",
            intermediate: "Create a multiple-choice question that requires application of concepts and understanding of relationships between ideas.",
            advanced: "Create a complex multiple-choice question that requires critical analysis, synthesis of multiple concepts, or evaluation of scenarios."
          }
        }
      }
    },
    feedbackTemplates: {
      correct: {
        default: "Correct! Well done.",
        detailed: "Correct! {explanation}"
      },
      incorrect: {
        default: "Incorrect. Please review the material and try again.",
        detailed: "Incorrect. {explanation}",
        hint: "Incorrect. Hint: {hint}"
      }
    },
    cloudFunctions: {
      timeout: 60,
      memory: "512MiB",
      region: "us-central1"
    }
  };
}

/**
 * Merges multiple configuration objects with precedence
 * @param {...Object} configs - Configuration objects in order of precedence (last wins)
 * @returns {Object} Merged configuration
 */
function mergeConfigs(...configs) {
  const result = {};
  
  for (const config of configs) {
    if (config && typeof config === 'object') {
      deepMerge(result, config);
    }
  }
  
  return result;
}

/**
 * Deep merges two objects
 * @param {Object} target - Target object to merge into
 * @param {Object} source - Source object to merge from
 */
function deepMerge(target, source) {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key] || typeof target[key] !== 'object') {
          target[key] = {};
        }
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
}

/**
 * Loads the complete configuration with caching
 * @param {string} courseId - Optional course ID for course-specific config
 * @returns {Promise<Object>} Complete merged configuration
 */
async function loadConfig(courseId = null) {
  const now = Date.now();
  
  // Return cached config if still valid
  if (configCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return configCache;
  }
  
  try {
    // Load global defaults
    const globalDefaults = await loadAssessmentDefaults();
    
    // If no course ID provided, just return global defaults
    if (!courseId) {
      configCache = globalDefaults;
      cacheTimestamp = now;
      return globalDefaults;
    }
    
    // Load course-specific configuration
    const courseConfig = await loadCourseConfig(courseId);
    
    // Merge configurations (course config overrides global defaults)
    const mergedConfig = mergeConfigs(globalDefaults, courseConfig);
    
    configCache = mergedConfig;
    cacheTimestamp = now;
    
    return mergedConfig;
  } catch (error) {
    console.error('Error loading configuration:', error);
    // Return built-in defaults as fallback
    const fallbackConfig = getBuiltInDefaults();
    configCache = fallbackConfig;
    cacheTimestamp = now;
    return fallbackConfig;
  }
}

/**
 * Extracts activity type settings from course configuration
 * @param {Object} courseConfig - The loaded course configuration
 * @param {string} activityType - The activity type ('lesson', 'assignment', 'lab', 'exam')
 * @param {string} assessmentType - Optional assessment type ('longAnswer' for long answer specific settings)
 * @returns {Object} Settings for the specified activity type
 */
function getActivityTypeSettings(courseConfig, activityType, assessmentType = null) {
  if (!courseConfig?.activityTypes?.[activityType]) {
    console.warn(`Activity type '${activityType}' not found in course config, using lesson defaults`);
    activityType = 'lesson';
  }
  
  const activitySettings = courseConfig.activityTypes[activityType];
  
  // If requesting long answer specific settings, merge them in
  if (assessmentType === 'longAnswer' && activitySettings.longAnswer) {
    return {
      // Base activity settings
      maxAttempts: activitySettings.maxAttempts,
      attemptPenalty: activitySettings.attemptPenalty,
      pointValue: activitySettings.pointValue,
      theme: activitySettings.theme,
      showDetailedFeedback: activitySettings.showDetailedFeedback,
      enableHints: activitySettings.enableHints,
      allowDifficultySelection: activitySettings.allowDifficultySelection,
      defaultDifficulty: activitySettings.defaultDifficulty,
      aiSettings: activitySettings.aiSettings,
      
      // Long answer specific settings
      totalPoints: activitySettings.longAnswer.totalPoints,
      rubricCriteria: activitySettings.longAnswer.rubricCriteria,
      wordLimits: activitySettings.longAnswer.wordLimits,
      showRubric: activitySettings.longAnswer.showRubric,
      showWordCount: activitySettings.longAnswer.showWordCount
    };
  }
  
  // Return base activity settings
  return {
    maxAttempts: activitySettings.maxAttempts,
    attemptPenalty: activitySettings.attemptPenalty,
    pointValue: activitySettings.pointValue,
    theme: activitySettings.theme,
    showDetailedFeedback: activitySettings.showDetailedFeedback,
    enableHints: activitySettings.enableHints,
    allowDifficultySelection: activitySettings.allowDifficultySelection,
    defaultDifficulty: activitySettings.defaultDifficulty,
    aiSettings: activitySettings.aiSettings
  };
}

/**
 * Gets dynamic word limits based on difficulty level and activity type
 * @param {Object} courseConfig - The loaded course configuration
 * @param {string} activityType - The activity type ('lesson', 'assignment', 'lab', 'exam')
 * @param {string} difficulty - The difficulty level ('beginner', 'intermediate', 'advanced')
 * @returns {Object} Word limits for the specified difficulty
 */
function getWordLimitsForDifficulty(courseConfig, activityType, difficulty) {
  const settings = getActivityTypeSettings(courseConfig, activityType, 'longAnswer');
  const baseWordLimits = settings.wordLimits || { min: 50, max: 200 };
  
  // Adjust word limits based on difficulty
  const multipliers = {
    beginner: { min: 0.8, max: 0.9 },
    intermediate: { min: 1.0, max: 1.0 },
    advanced: { min: 1.2, max: 1.3 }
  };
  
  const multiplier = multipliers[difficulty] || multipliers.intermediate;
  
  return {
    min: Math.round(baseWordLimits.min * multiplier.min),
    max: Math.round(baseWordLimits.max * multiplier.max)
  };
}

/**
 * Clears the configuration cache (useful for testing or forcing reload)
 */
function clearConfigCache() {
  configCache = null;
  cacheTimestamp = 0;
}

module.exports = {
  loadConfig,
  loadAssessmentDefaults,
  loadCourseConfig,
  mergeConfigs,
  getActivityTypeSettings,
  getWordLimitsForDifficulty,
  clearConfigCache
};