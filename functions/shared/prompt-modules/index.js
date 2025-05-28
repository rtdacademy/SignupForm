/**
 * Prompt Modules Index
 * Central export point for all reusable prompt modules
 */

const { KATEX_FORMATTING_PROMPT } = require('./katex-formatting');

/**
 * Applies conditional prompt modules based on configuration
 * @param {Object} config - Configuration object with prompt module flags
 * @returns {string} Combined prompt additions
 */
function applyPromptModules(config = {}) {
  const promptAdditions = [];

  // Add KaTeX formatting requirements if enabled
  if (config.katexFormatting === true) {
    promptAdditions.push(KATEX_FORMATTING_PROMPT);
  }

  return promptAdditions.join('\n\n');
}

module.exports = {
  // Individual prompt modules
  KATEX_FORMATTING_PROMPT,
  
  // Helper function
  applyPromptModules
};