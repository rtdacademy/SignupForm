// Edbotz Cloud Functions Export
// This file exports all Edbotz-specific cloud functions

const admin = require('firebase-admin');
require('dotenv').config();
const { setGlobalOptions } = require('firebase-functions/v2');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Set global options
setGlobalOptions({
  region: 'us-central1',
  maxInstances: 30
});

// Import function modules
const assistantFunctions = require('./generateAssistant');

// Export all Edbotz functions
module.exports = {
  ...assistantFunctions
};