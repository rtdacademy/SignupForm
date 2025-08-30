// Function to link pending Shopify purchases to newly registered users
const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Links pending Shopify purchases to a user account
 * Call this after user registration or when user confirms their email
 */
const linkPendingShopifyPurchases = onCall({
  cors: true,
  maxInstances: 10
}, async (request) => {
  const { email, uid } = request.data;
  const authUid = request.auth?.uid;
  
  // Verify the request is for the authenticated user or from admin
  if (!authUid || (authUid !== uid && !request.auth?.token?.admin)) {
    throw new Error('Unauthorized');
  }
  
  if (!email) {
    throw new Error('Email is required');
  }
  
  const normalizedEmail = email.toLowerCase().trim();
  console.log(`Checking for pending purchases for email: ${normalizedEmail}`);
  
  try {
    // Get all pending purchases for this email
    const pendingSnapshot = await admin.database()
      .ref('pendingShopifyPurchases')
      .orderByChild('email')
      .equalTo(normalizedEmail)
      .once('value');
    
    const pendingPurchases = pendingSnapshot.val() || {};
    const purchaseCount = Object.keys(pendingPurchases).length;
    
    if (purchaseCount === 0) {
      console.log('No pending purchases found');
      return { 
        success: true, 
        message: 'No pending purchases found',
        purchasesLinked: 0 
      };
    }
    
    console.log(`Found ${purchaseCount} pending purchases to link`);
    
    // Process each pending purchase
    const linkedPurchases = [];
    for (const [orderId, purchase] of Object.entries(pendingPurchases)) {
      const orderInfo = purchase.orderInfo;
      
      // Update user's custom claims with purchased products
      if (orderInfo.purchasedItems && orderInfo.purchasedItems.length > 0) {
        const userRecord = await admin.auth().getUser(uid);
        const existingClaims = userRecord.customClaims || {};
        
        // Add purchased products to claims
        let purchasedProducts = existingClaims.purchasedProducts || [];
        let activePurchases = existingClaims.activePurchases || {};
        
        orderInfo.purchasedItems.forEach(item => {
          if (item.productId && !purchasedProducts.includes(item.productId)) {
            purchasedProducts.push(item.productId);
          }
          
          if (item.productId) {
            activePurchases[item.productId] = {
              orderId: orderInfo.orderId,
              orderNumber: orderInfo.orderNumber,
              purchaseDate: orderInfo.createdAt,
              productTitle: item.title,
              price: item.price,
              status: 'active',
              lastUpdated: Date.now()
            };
          }
        });
        
        // Update custom claims
        const updatedClaims = {
          ...existingClaims,
          purchasedProducts,
          activePurchases,
          hasActivePurchases: purchasedProducts.length > 0,
          lastPurchaseUpdate: Date.now(),
          shopifyCustomer: true
        };
        
        await admin.auth().setCustomUserClaims(uid, updatedClaims);
        
        // Move purchase from pending to user's purchases
        await admin.database().ref(`users/${uid}/shopifyPurchases/${orderId}`).set({
          ...orderInfo,
          linkedAt: admin.database.ServerValue.TIMESTAMP,
          status: 'active'
        });
        
        // Remove from pending
        await admin.database().ref(`pendingShopifyPurchases/${orderId}`).remove();
        
        linkedPurchases.push({
          orderId,
          orderNumber: orderInfo.orderNumber,
          products: orderInfo.purchasedItems.map(p => p.title)
        });
        
        console.log(`Linked purchase ${orderId} to user ${uid}`);
      }
    }
    
    return {
      success: true,
      message: `Successfully linked ${linkedPurchases.length} purchases`,
      purchasesLinked: linkedPurchases.length,
      purchases: linkedPurchases
    };
    
  } catch (error) {
    console.error('Error linking pending purchases:', error);
    throw new Error(`Failed to link purchases: ${error.message}`);
  }
});

module.exports = {
  linkPendingShopifyPurchases
};