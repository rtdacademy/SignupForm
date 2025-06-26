/**
 * AI Model Settings
 * 
 * This file contains configuration for various AI models and parameters used in the application.
 * Update these settings to change behavior across the application.
 */

const AI_MODELS = {
  // Gemini Models
  GEMINI: {
    FLASH: 'gemini-2.5-flash',
    FLASH_PREVIEW_IMAGE_GENERATION: 'gemini-2.0-flash-preview-image-generation',
    FLASH_LITE: 'gemini-2.5-flash-lite-preview-06-17',
    PRO: 'gemini-2.5-pro'
  },
  
  // Default model to use for chat
  DEFAULT_CHAT_MODEL: 'gemini-2.5-flash',
  
  // Default model to use for image generation
  DEFAULT_IMAGE_GENERATION_MODEL: 'gemini-2.0-flash-preview-image-generation',
  
  // Current active model for GoogleAI chat
  ACTIVE_CHAT_MODEL: 'gemini-2.5-flash',
  
  // Temperature Settings (creativity/randomness control)
  TEMPERATURE: {
    CREATIVE: 0.9,      // High creativity, more varied responses
    BALANCED: 0.7,      // Balanced creativity and consistency (recommended)
    FOCUSED: 0.3        // Low creativity, more consistent and focused responses
  },
  
  // Max Token Settings (response length control)
  MAX_TOKENS: {
    SHORT: 500,         // Brief responses
    MEDIUM: 1000,       // Standard responses (recommended)
    LONG: 2000,         // Detailed responses
    EXTENDED: 4000      // Very detailed responses (use sparingly)
  },
  
  // Available model options for frontend selection
  ALLOWED_MODELS: [
    'FLASH',                          // Fast, efficient for most tasks
    'FLASH_LITE',                     // Lighter version, faster responses
    'PRO',                            // Most capable, slower but higher quality
    'DEFAULT_CHAT_MODEL'              // System default
    // Note: All models support image analysis when students upload images
  ],
  
  // Available temperature options for frontend selection
  ALLOWED_TEMPERATURES: [
    'CREATIVE',   // More varied and creative responses
    'BALANCED',   // Recommended balance of creativity and consistency
    'FOCUSED'     // More consistent and focused responses
  ],
  
  // Available max token options for frontend selection
  ALLOWED_MAX_TOKENS: [
    'SHORT',      // Brief responses (~500 tokens)
    'MEDIUM',     // Standard responses (~1000 tokens)
    'LONG',       // Detailed responses (~2000 tokens)
    'EXTENDED'    // Very detailed responses (~4000 tokens)
  ]
};

module.exports = AI_MODELS;