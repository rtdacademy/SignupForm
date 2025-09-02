/**
 * Assessment Configuration for Keyboarding Practice
 * Each category is a separate assessment that uses direct score update
 * Score is binary: 1 (pass) or 0 (fail) based on performance criteria
 */

// ===== ACTIVITY TYPE CONFIGURATION =====
const ACTIVITY_TYPE = 'practice';

const assessmentConfigs = {
  // Beginner text practice
  'course6_02_keyboarding_beginner': {
    type: 'direct-score',
    allowDirectScoring: true,
    requiresVerification: false,
    minimumInteractionTime: 30000, // 30 seconds minimum
    minimumInteractions: 50, // At least 50 keystrokes
    passingCriteria: {
      minWpm: 15,
      minAccuracy: 70
    },
    metadata: {
      title: 'Beginner Typing Practice',
      description: 'Complete a typing exercise with general text',
      category: 'beginner',
      points: 1,
      activityType: ACTIVITY_TYPE
    }
  },

  // Home row practice
  'course6_02_keyboarding_homerow': {
    type: 'direct-score',
    allowDirectScoring: true,
    requiresVerification: false,
    minimumInteractionTime: 30000, // 30 seconds minimum
    minimumInteractions: 50,
    passingCriteria: {
      minWpm: 20,
      minAccuracy: 75
    },
    metadata: {
      title: 'Home Row Practice',
      description: 'Master the home row keys with focused exercises',
      category: 'homeRow',
      points: 1,
      activityType: ACTIVITY_TYPE
    }
  },

  // Numbers practice
  'course6_02_keyboarding_numbers': {
    type: 'direct-score',
    allowDirectScoring: true,
    requiresVerification: false,
    minimumInteractionTime: 30000,
    minimumInteractions: 50,
    passingCriteria: {
      minWpm: 15,
      minAccuracy: 70
    },
    metadata: {
      title: 'Number Typing Practice',
      description: 'Practice typing numbers and numerical data',
      category: 'numbers',
      points: 1,
      activityType: ACTIVITY_TYPE
    }
  },

  // Math formulas practice
  'course6_02_keyboarding_math': {
    type: 'direct-score',
    allowDirectScoring: true,
    requiresVerification: false,
    minimumInteractionTime: 30000,
    minimumInteractions: 50,
    passingCriteria: {
      minWpm: 12,
      minAccuracy: 65
    },
    metadata: {
      title: 'Math Formula Practice',
      description: 'Type mathematical expressions and formulas',
      category: 'math',
      points: 1,
      activityType: ACTIVITY_TYPE
    }
  },

  // Sentences practice
  'course6_02_keyboarding_sentences': {
    type: 'direct-score',
    allowDirectScoring: true,
    requiresVerification: false,
    minimumInteractionTime: 30000,
    minimumInteractions: 50,
    passingCriteria: {
      minWpm: 18,
      minAccuracy: 72
    },
    metadata: {
      title: 'Sentence Typing Practice',
      description: 'Practice typing complete sentences with proper punctuation',
      category: 'sentences',
      points: 1,
      activityType: ACTIVITY_TYPE
    }
  }
};

module.exports = {
  assessmentConfigs
};