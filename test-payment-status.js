const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const { recalculateCredits, updateStudentCourseSummaryPaymentStatus, getStudentCredits } = require('./functions-triggers/utils/creditTracking');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://classroom-75d8a.firebaseio.com"
});

async function testPaymentStatus() {
  const db = admin.database();
  
  // Test cases for different student types
  const testCases = [
    {
      studentKey: 'sharcardinal@gmail,com',
      courseId: '98',
      schoolYear: '25/26',
      studentType: 'Non-Primary',
      description: 'Non-Primary student with credit-based payment'
    },
    {
      studentKey: 'test-adult@example,com',
      courseId: '100',
      schoolYear: '25/26',
      studentType: 'Adult Student',
      description: 'Adult student with per-course payment'
    }
  ];
  
  console.log('🧪 Testing Payment Status Updates\n');
  console.log('=====================================\n');
  
  for (const testCase of testCases) {
    console.log(`\n📋 Test Case: ${testCase.description}`);
    console.log(`   Student: ${testCase.studentKey}`);
    console.log(`   Course: ${testCase.courseId}`);
    console.log(`   Type: ${testCase.studentType}`);
    console.log(`   Year: ${testCase.schoolYear}\n`);
    
    try {
      // First, let's check if the student and course exist
      const courseRef = db.ref(`students/${testCase.studentKey}/courses/${testCase.courseId}`);
      const courseSnapshot = await courseRef.once('value');
      
      if (!courseSnapshot.exists()) {
        console.log(`   ⚠️  Course ${testCase.courseId} not found for ${testCase.studentKey}`);
        continue;
      }
      
      // Recalculate credits (this will also update payment status)
      console.log('   🔄 Recalculating credits...');
      const creditData = await recalculateCredits(testCase.studentKey, testCase.schoolYear, testCase.studentType);
      
      // Check the payment status that was written
      const summaryKey = `${testCase.studentKey}_${testCase.courseId}`;
      const statusRef = db.ref(`studentCourseSummaries/${summaryKey}/payment_status`);
      const statusSnapshot = await statusRef.once('value');
      const paymentStatus = statusSnapshot.val();
      
      if (paymentStatus) {
        console.log(`   ✅ Payment Status Updated:`);
        console.log(`      Status: ${paymentStatus.status}`);
        console.log(`      Payment Model: ${paymentStatus.details?.paymentModel}`);
        
        if (paymentStatus.details?.paymentModel === 'credit_based') {
          console.log(`      Credits Used: ${paymentStatus.details?.creditsUsed || 0}`);
          console.log(`      Free Credits Limit: ${paymentStatus.details?.freeCreditsLimit || 'N/A'}`);
          console.log(`      Credits Remaining: ${paymentStatus.details?.creditsRemaining || 0}`);
          console.log(`      Requires Payment: ${paymentStatus.details?.requiresPayment || false}`);
        } else if (paymentStatus.details?.paymentModel === 'per_course') {
          console.log(`      Course Paid: ${paymentStatus.details?.coursePaid || false}`);
          console.log(`      Payment Method: ${paymentStatus.details?.paymentMethod || 'N/A'}`);
        }
        
        if (paymentStatus.details?.hasOverrides) {
          console.log(`      Has Overrides: Yes`);
        }
      } else {
        console.log(`   ❌ No payment status found`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n=====================================');
  console.log('✨ Test Complete\n');
  
  // Clean up
  process.exit(0);
}

// Run the test
testPaymentStatus().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});