const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Processes payout for approved reimbursements using Stripe Connect
 * This replaces manual bank transfers
 */
const processReimbursementPayout = onCall({
  concurrency: 20,
  memory: '512MiB',
  timeoutSeconds: 120,
  secrets: ["STRIPE_SECRET_KEY_TEST"]
}, async (request) => {
  // Verify user is authenticated and has admin privileges
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  // Check if user has admin privileges (you can customize this based on your admin system)
  const userClaims = await admin.auth().getUser(request.auth.uid);
  const customClaims = userClaims.customClaims || {};
  
  if (!customClaims.isAdmin && !customClaims.isStaff) {
    throw new Error('Only administrators can process payouts');
  }

  const { familyId, reimbursementIds, totalAmount, description } = request.data;

  if (!familyId || !reimbursementIds || !Array.isArray(reimbursementIds) || !totalAmount) {
    throw new Error('Missing required payout information');
  }

  try {
    const db = admin.database();

    // Get the family's Stripe Connect account
    const stripeDataRef = await db.ref(`homeEducationFamilies/familyInformation/${familyId}/STRIPE_CONNECT`).once('value');
    const stripeData = stripeDataRef.val();

    if (!stripeData?.accountId) {
      throw new Error('No Stripe Connect account found for this family');
    }

    // Verify all reimbursements are approved and belong to this family
    const reimbursementChecks = await Promise.all(
      reimbursementIds.map(async (reimbId) => {
        // Find the reimbursement across all school years and students
        const familyReimbursements = await db.ref(`homeEducationFamilies/familyInformation/${familyId}/REIMBURSEMENTS`).once('value');
        const allReimbursements = familyReimbursements.val() || {};
        
        let foundReimbursement = null;
        let reimbursementPath = null;

        // Search through all school years and students
        Object.keys(allReimbursements).forEach(schoolYear => {
          Object.keys(allReimbursements[schoolYear] || {}).forEach(studentId => {
            if (allReimbursements[schoolYear][studentId][reimbId]) {
              foundReimbursement = allReimbursements[schoolYear][studentId][reimbId];
              reimbursementPath = `homeEducationFamilies/familyInformation/${familyId}/REIMBURSEMENTS/${schoolYear}/${studentId}/${reimbId}`;
            }
          });
        });

        if (!foundReimbursement) {
          throw new Error(`Reimbursement ${reimbId} not found`);
        }

        if (foundReimbursement.status !== 'approved') {
          throw new Error(`Reimbursement ${reimbId} is not approved for payout`);
        }

        if (foundReimbursement.payout_status === 'paid') {
          throw new Error(`Reimbursement ${reimbId} has already been paid`);
        }

        return { reimbursement: foundReimbursement, path: reimbursementPath };
      })
    );

    // Calculate total amount to verify
    const calculatedTotal = reimbursementChecks.reduce((sum, { reimbursement }) => sum + (reimbursement.amount || 0), 0);
    
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      throw new Error(`Total amount mismatch. Expected: ${calculatedTotal}, Provided: ${totalAmount}`);
    }

    // Initialize Stripe with the secret key from Secret Manager
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_TEST);
    const transfer = await stripe.transfers.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'cad',
      destination: stripeData.accountId,
      description: description || `Reimbursement payout for ${reimbursementIds.length} items`,
      metadata: {
        familyId: familyId,
        reimbursementIds: reimbursementIds.join(','),
        processedBy: request.auth.uid,
        processedAt: new Date().toISOString(),
      }
    });

    // Update all reimbursements with payout information
    const updatePromises = reimbursementChecks.map(({ path }) => 
      db.ref(path).update({
        payout_status: 'paid',
        payout_transfer_id: transfer.id,
        payout_processed_by: request.auth.uid,
        payout_processed_at: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      })
    );

    await Promise.all(updatePromises);

    // Create payout record
    const payoutRecord = {
      id: transfer.id,
      familyId: familyId,
      stripeAccountId: stripeData.accountId,
      amount: totalAmount,
      currency: 'CAD',
      reimbursementIds: reimbursementIds,
      description: description || `Reimbursement payout for ${reimbursementIds.length} items`,
      status: 'completed',
      processedBy: request.auth.uid,
      processedByEmail: request.auth.token.email,
      processedAt: new Date().toISOString(),
      stripeTransferId: transfer.id,
    };

    // Store payout record
    await db.ref(`homeEducationFamilies/familyInformation/${familyId}/PAYOUTS/${transfer.id}`).set(payoutRecord);

    // Add to admin payout tracking
    await db.ref(`adminPayoutHistory/${transfer.id}`).set(payoutRecord);

    // Log the action
    await db.ref(`homeEducationFamilies/familyInformation/${familyId}/AUDIT_LOG`).push({
      action: 'reimbursement_payout_processed',
      performed_by: request.auth.uid,
      performed_by_email: request.auth.token.email,
      timestamp: new Date().toISOString(),
      details: {
        transferId: transfer.id,
        amount: totalAmount,
        reimbursementCount: reimbursementIds.length,
        reimbursementIds: reimbursementIds,
      }
    });

    return {
      success: true,
      transferId: transfer.id,
      amount: totalAmount,
      status: 'completed',
      estimatedArrival: 'Next business day', // Standard for Canadian transfers
    };

  } catch (error) {
    console.error('Error processing reimbursement payout:', error);
    
    // Re-throw with enhanced error message
    throw new Error(`Failed to process payout: ${error.message}`);
  }
});

module.exports = {
  processReimbursementPayout
};