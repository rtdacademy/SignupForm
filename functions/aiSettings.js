/**
 * AI Model Settings
 * 
 * This file contains configuration for various AI models used in the application.
 * Update these settings to change models across the application.
 */

const AI_MODELS = {
  // Gemini Models
  GEMINI: {
    FLASH: 'gemini-2.0-flash',
    FLASH_PREVIEW_IMAGE_GENERATION: 'gemini-2.0-flash-preview-image-generation',
    FLASH_LITE: 'gemini-2.0-flash-lite',
    PRO: 'gemini-2.0-pro'
  },
  
  // Default model to use for chat
  DEFAULT_CHAT_MODEL: 'gemini-2.0-flash',
  
  // Default model to use for image generation
  DEFAULT_IMAGE_GENERATION_MODEL: 'gemini-2.0-flash-preview-image-generation',
  
  // Current active model for GoogleAI chat
  ACTIVE_CHAT_MODEL: 'gemini-2.0-flash-preview-image-generation'
};

module.exports = AI_MODELS;