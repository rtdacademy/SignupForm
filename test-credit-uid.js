/**
 * Test script to verify UID is added to credit tracking
 * Run with: node test-credit-uid.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const { getUidFromStudentKey } = require('./functions-triggers/utils/creditTracking');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://signup-form-4d233.firebaseio.com'
  });
}

async function testUidRetrieval() {
  console.log('Testing UID retrieval from users node using sanitizedEmail...\n');
  
  // Test case 1: Try to get UID for a real student (you'll need to replace with actual email)
  const realStudentKey = 'student@example,com'; // Replace with actual sanitized email from your database
  
  console.log(`Testing UID retrieval for sanitizedEmail: ${realStudentKey}`);
  console.log('This will query /users node with orderByChild("sanitizedEmail")');
  
  const uid = await getUidFromStudentKey(realStudentKey);
  
  if (uid) {
    console.log(`✅ Successfully retrieved UID: ${uid}`);
    
    // Verify by checking the actual user node
    const db = admin.database();
    const userRef = db.ref(`users/${uid}`);
    const userSnapshot = await userRef.once('value');
    const userData = userSnapshot.val();
    
    if (userData && userData.sanitizedEmail === realStudentKey) {
      console.log(`✅ Verified: User ${uid} has sanitizedEmail: ${userData.sanitizedEmail}`);
    }
  } else {
    console.log(`❌ Could not retrieve UID (user may not exist in database)`);
  }
  
  // Test case 2: Check if credit tracking would include UID
  console.log('\nSimulated credit tracking data structure:');
  const mockCreditData = {
    studentType: 'Non-Primary',
    uid: uid || null,
    nonExemptCredits: 10,
    exemptCredits: 0,
    totalCredits: 10,
    freeCreditsLimit: 10,
    requiresPayment: false,
    lastUpdated: Date.now()
  };
  
  console.log(JSON.stringify(mockCreditData, null, 2));
  
  process.exit(0);
}

// Run tests
testUidRetrieval().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});