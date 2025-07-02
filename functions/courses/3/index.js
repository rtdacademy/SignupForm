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
exports.course3_01_intro_ethics_question2 = require('./01-intro-ethics-financial-decisions/assessments').course3_01_intro_ethics_question2;
exports.course3_02_economic_environment_question1 = require('./02-economic-environment-money/assessments').course3_02_economic_environment_question1;
exports.course3_02_economic_environment_question2 = require('./02-economic-environment-money/assessments').course3_02_economic_environment_question2;
exports.course3_02_economic_environment_question3 = require('./02-economic-environment-money/assessments').course3_02_economic_environment_question3;
exports.course3_02_economic_environment_question4 = require('./02-economic-environment-money/assessments').course3_02_economic_environment_question4;
exports.course3_02_economic_environment_longAnswer = require('./02-economic-environment-money/assessments').course3_02_economic_environment_longAnswer;
exports.course3_02_economic_environment_shortAnswer = require('./02-economic-environment-money/assessments').course3_02_economic_environment_shortAnswer;
