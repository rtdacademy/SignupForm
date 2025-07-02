/**
 * AI Models Configuration
 * Centralized configuration for AI models used across the application
 */

const { genkit } = require('genkit/beta');
const { googleAI } = require('@genkit-ai/googleai');

// Environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Available AI models configuration
 */
const MODEL_CONFIGS = {
  // Primary model for most tasks
  'gemini-2.0-flash': {
    provider: googleAI,
    model: 'gemini-2.0-flash',
    description: 'Latest Gemini model with improved performance and capabilities',
    recommended: true,
    capabilities: ['text-generation', 'structured-output', 'long-context'],
    maxTokens: 1048576,
    settings: {
      temperature: 0.7,
      topP: 0.8,
      topK: 40
    }
  },
  
  // Alternative models
  'gemini-1.5-flash': {
    provider: googleAI,
    model: 'gemini-1.5-flash',
    description: 'Fast and efficient for most educational content generation',
    capabilities: ['text-generation', 'structured-output'],
    maxTokens: 1048576,
    settings: {
      temperature: 0.7,
      topP: 0.8,
      topK: 40
    }
  },
  
  'gemini-1.5-pro': {
    provider: googleAI,
    model: 'gemini-1.5-pro',
    description: 'More capable for complex reasoning and analysis',
    capabilities: ['text-generation', 'structured-output', 'complex-reasoning'],
    maxTokens: 2097152,
    settings: {
      temperature: 0.6,
      topP: 0.85,
      topK: 40
    }
  }
};

/**
 * Default model to use across the application
 */
const DEFAULT_MODEL = 'gemini-2.0-flash';

/**
 * Initialize AI with specified model
 * @param {string} modelName - Name of the model to initialize
 * @param {string} apiKey - API key (optional, uses environment variable if not provided)
 * @returns {Object} Initialized AI instance
 */
function initializeAI(modelName = DEFAULT_MODEL, apiKey = null) {
  const effectiveApiKey = apiKey || GEMINI_API_KEY;
  
  if (!effectiveApiKey) {
    throw new Error('GEMINI_API_KEY not found in environment variables');
  }
  
  const modelConfig = MODEL_CONFIGS[modelName];
  if (!modelConfig) {
    throw new Error(`Unsupported model: ${modelName}. Available models: ${Object.keys(MODEL_CONFIGS).join(', ')}`);
  }
  
  try {
    const ai = genkit({
      plugins: [modelConfig.provider({ apiKey: effectiveApiKey })],
      model: modelConfig.provider.model(modelConfig.model),
    });
    
    console.log(`✅ AI initialized successfully with model: ${modelName}`);
    return ai;
  } catch (error) {
    console.error(`❌ Failed to initialize AI with model ${modelName}:`, error);
    throw error;
  }
}

/**
 * Get model configuration
 * @param {string} modelName - Name of the model
 * @returns {Object} Model configuration
 */
function getModelConfig(modelName = DEFAULT_MODEL) {
  const config = MODEL_CONFIGS[modelName];
  if (!config) {
    throw new Error(`Model configuration not found: ${modelName}`);
  }
  return config;
}

/**
 * Get default AI settings for a specific task type
 * @param {string} taskType - Type of task ('assessment', 'evaluation', 'content-generation')
 * @param {string} modelName - Model to use
 * @returns {Object} AI settings optimized for the task
 */
function getTaskSettings(taskType, modelName = DEFAULT_MODEL) {
  const baseSettings = getModelConfig(modelName).settings;
  
  const taskOptimizations = {
    'assessment': {
      temperature: 0.6, // Lower for more consistent questions
      topP: 0.85,
      topK: 40
    },
    'evaluation': {
      temperature: 0.1, // Very low for deterministic grading
      topP: 0.8,
      topK: 40
    },
    'content-generation': {
      temperature: 0.8, // Higher for more creative content
      topP: 0.9,
      topK: 50
    }
  };
  
  return {
    ...baseSettings,
    ...(taskOptimizations[taskType] || {})
  };
}

/**
 * Get available models list
 * @returns {Array} List of available model names
 */
function getAvailableModels() {
  return Object.keys(MODEL_CONFIGS);
}

/**
 * Get recommended model for a specific task
 * @param {string} taskType - Type of task
 * @returns {string} Recommended model name
 */
function getRecommendedModel(taskType) {
  switch (taskType) {
    case 'assessment':
    case 'evaluation':
      return 'gemini-2.0-flash'; // Best balance of speed and accuracy
    case 'complex-reasoning':
      return 'gemini-1.5-pro'; // Better for complex analysis
    default:
      return DEFAULT_MODEL;
  }
}

/**
 * Check if API key is available
 * @returns {boolean} True if API key is configured
 */
function isAPIKeyAvailable() {
  return !!GEMINI_API_KEY;
}

module.exports = {
  initializeAI,
  getModelConfig,
  getTaskSettings,
  getAvailableModels,
  getRecommendedModel,
  isAPIKeyAvailable,
  DEFAULT_MODEL,
  MODEL_CONFIGS
};