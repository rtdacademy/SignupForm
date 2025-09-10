#!/usr/bin/env node

/**
 * Test script to verify Stripe payment sync for credit tracking
 * Usage: node test-stripe-payment-sync.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://hep-alberta-default-rtdb.firebaseio.com'
});

// Import the credit tracking utilities
const { checkCoursePaymentStatus } = require('./functions-triggers/utils/creditTracking');

async function testPaymentSync() {
  console.log('Testing Stripe payment sync for problematic subscription...\n');
  
  // Test case: The problematic subscription
  const testCase = {
    studentEmailKey: 'arysiamerkel@hotmail,com',
    courseId: '98',
    schoolYear: '24/25',
    studentType: 'Non-Primary'
  };
  
  console.log('Test Case:', testCase);
  console.log('-------------------------------------------');
  
  try {
    // Check current database state
    const db = admin.database();
    const paymentRef = db.ref(`payments/${testCase.studentEmailKey}/courses/${testCase.courseId}`);
    const beforeSnapshot = await paymentRef.once('value');
    const beforeData = beforeSnapshot.val();
    
    console.log('\n📊 BEFORE Stripe Sync:');
    console.log('  Status:', beforeData?.status);
    console.log('  Payment Count:', beforeData?.payment_count || 'not set');
    console.log('  Invoices:', beforeData?.invoices?.length || 0, 'in database');
    console.log('  Subscription ID:', beforeData?.subscription_id);
    
    // Call the updated checkCoursePaymentStatus which now fetches from Stripe
    console.log('\n🔄 Fetching fresh data from Stripe...');
    const paymentStatus = await checkCoursePaymentStatus(
      testCase.studentEmailKey,
      testCase.courseId,
      testCase.schoolYear,
      testCase.studentType
    );
    
    console.log('\n✅ Payment Status Result:');
    console.log('  Is Paid:', paymentStatus.isPaid);
    console.log('  Status:', paymentStatus.status);
    console.log('  Payment Type:', paymentStatus.paymentType);
    console.log('  Payment Method:', paymentStatus.paymentMethod);
    
    // Check updated database state
    const afterSnapshot = await paymentRef.once('value');
    const afterData = afterSnapshot.val();
    
    console.log('\n📊 AFTER Stripe Sync:');
    console.log('  Status:', afterData?.status);
    console.log('  Payment Count:', afterData?.payment_count || 'not set');
    console.log('  Invoices:', afterData?.invoices?.length || 0, 'in database');
    console.log('  Last Stripe Sync:', afterData?.last_stripe_sync ? new Date(afterData.last_stripe_sync).toLocaleString() : 'not set');
    
    // Show invoice details if available
    if (afterData?.invoices && afterData.invoices.length > 0) {
      console.log('\n📋 Invoice Details:');
      afterData.invoices.forEach((invoice, index) => {
        console.log(`  Invoice ${index + 1}:`);
        console.log(`    ID: ${invoice.id}`);
        console.log(`    Amount: $${(invoice.amount_paid / 100).toFixed(2)}`);
        console.log(`    Status: ${invoice.status}`);
        console.log(`    Paid At: ${invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString() : 'N/A'}`);
      });
    }
    
    // Check if the issue is resolved
    console.log('\n🎯 VERIFICATION:');
    if (afterData?.payment_count === 3 && afterData?.status === 'paid') {
      console.log('  ✅ SUCCESS: Subscription correctly shows as fully paid with 3 payments!');
    } else if (afterData?.payment_count > beforeData?.payment_count) {
      console.log(`  ⚠️  PARTIAL SUCCESS: Payment count updated from ${beforeData?.payment_count || 0} to ${afterData?.payment_count}`);
      console.log('  Status:', afterData?.status);
    } else {
      console.log('  ❌ ISSUE: Payment data may not have synced correctly');
    }
    
  } catch (error) {
    console.error('\n❌ Error during test:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    // Clean up
    console.log('\n🏁 Test complete');
    process.exit(0);
  }
}

// Run the test
testPaymentSync();