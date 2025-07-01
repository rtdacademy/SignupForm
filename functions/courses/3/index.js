// Course 3 - Financial Literacy Cloud Functions
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
// Course 3 Assessment Functions - Financial Literacy
//==============================================================================
exports.course3_01_intro_ethics_question1 = require('./01-intro-ethics-financial-decisions/assessments').course3_01_intro_ethics_question1;
