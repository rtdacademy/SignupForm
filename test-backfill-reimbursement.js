// Test script to call the backfill reimbursement accounts function
const https = require('https');

const FUNCTION_URL = 'https://us-central1-rtd-academy.cloudfunctions.net/triggers-backfillReimbursementAccounts';
const CURRENT_SCHOOL_YEAR = '25/26';

// You'll need to get an ID token from Firebase Auth
// For testing, you can get this from the browser console:
// firebase.auth().currentUser.getIdToken().then(token => console.log(token))

const testBackfill = async () => {
  const idToken = process.argv[2];

  if (!idToken) {
    console.log('❌ Please provide an ID token as argument');
    console.log('Usage: node test-backfill-reimbursement.js <ID_TOKEN>');
    console.log('\nGet token from browser console:');
    console.log('firebase.auth().currentUser.getIdToken().then(token => console.log(token))');
    process.exit(1);
  }

  const data = JSON.stringify({
    data: {
      targetSchoolYear: CURRENT_SCHOOL_YEAR
    }
  });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
      'Content-Length': data.length
    }
  };

  console.log(`🔄 Testing backfill for school year ${CURRENT_SCHOOL_YEAR}...`);

  const req = https.request(FUNCTION_URL, options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      console.log('\n📊 Response:');
      console.log(JSON.stringify(JSON.parse(responseData), null, 2));
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error:', error);
  });

  req.write(data);
  req.end();
};

testBackfill();
