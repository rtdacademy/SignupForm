const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Submit a reimbursement request
 * This function handles both saving to family records and admin queue
 */
const submitReimbursement = onCall({
  concurrency: 50,
  memory: '512MiB',
  timeoutSeconds: 60
}, async (request) => {
  // Verify user is authenticated
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const { 
    familyId, 
    studentId, 
    studentName,
    amount, 
    description, 
    category, 
    purchaseDate, 
    receiptFiles,
    schoolYear 
  } = request.data;
  
  const userId = request.auth.uid;

  // Verify user has permission to submit for this family
  const userClaims = await admin.auth().getUser(userId);
  const customClaims = userClaims.customClaims || {};
  
  if (customClaims.familyId !== familyId) {
    throw new Error('You can only submit reimbursements for your own family');
  }

  try {
    // Generate a unique reimbursement ID
    const reimbursementId = `reimb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create reimbursement record
    const reimbursementRecord = {
      id: reimbursementId,
      studentId: studentId,
      studentName: studentName,
      amount: parseFloat(amount),
      description: description,
      category: category,
      purchaseDate: purchaseDate,
      receiptFiles: receiptFiles || [],
      submittedAt: new Date().toISOString(),
      submittedBy: userId,
      submittedByEmail: request.auth.token.email,
      status: 'pending_review',
      schoolYear: schoolYear,
      payout_status: 'pending',
      lastUpdated: new Date().toISOString()
    };

    const db = admin.database();
    
    // Use Promise.all to write to both locations atomically
    await Promise.all([
      // Write to family reimbursements
      db.ref(`homeEducationFamilies/familyInformation/${familyId}/REIMBURSEMENTS/${schoolYear.replace('/', '_')}/${studentId}/${reimbursementId}`)
        .set(reimbursementRecord),
      
      // Write to admin queue (admin SDK has full access)
      db.ref(`adminReimbursementQueue/${reimbursementId}`)
        .set({
          ...reimbursementRecord,
          familyId: familyId,
          queuedAt: new Date().toISOString()
        }),
      
      // Log the action
      db.ref(`homeEducationFamilies/familyInformation/${familyId}/AUDIT_LOG`).push({
        action: 'reimbursement_submitted',
        performed_by: userId,
        performed_by_email: request.auth.token.email,
        timestamp: new Date().toISOString(),
        details: {
          reimbursementId: reimbursementId,
          studentId: studentId,
          studentName: studentName,
          amount: amount,
          category: category
        }
      })
    ]);

    return {
      success: true,
      reimbursementId: reimbursementId,
      message: 'Reimbursement submitted successfully'
    };

  } catch (error) {
    console.error('Error submitting reimbursement:', error);
    throw new Error(`Failed to submit reimbursement: ${error.message}`);
  }
});

module.exports = { submitReimbursement };