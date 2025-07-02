// Course 2c - Physics 30 Cloud Functions (Lessons 49-78)
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
// Course 2c Assessment Functions -  ( 57-78)
//==============================================================================


exports.course2_76_section_3_exam_question1 = require('./78-diploma-exam/assessments').course2_76_section_3_exam_question1;
