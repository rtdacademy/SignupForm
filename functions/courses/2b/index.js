// Course 2b - Physics 30 Cloud Functions (Lessons 25-48)
const admin = require('firebase-admin');
require('dotenv').config();
const { setGlobalOptions } = require('firebase-functions/v2');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Set global options for Gen 2 functions
setGlobalOptions({
  region: 'us-central1',
  maxInstances: 30 
});

//==============================================================================
// Course 2b Assessment Functions - (25-55)
//==============================================================================
