// Shopify Webhook Handler Cloud Function - DEBUG VERSION
// Logs webhook structure to understand Shopify payload format

const { onRequest, onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const crypto = require('crypto');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Initialize Firestore
const firestore = admin.firestore();

/**
 * Verifies Shopify webhook signature
 * @param {string} body - Raw webhook body
 * @param {string} signature - Shopify signature header (base64)
 * @param {string} secret - Webhook secret (UTF-8 string)
 * @returns {boolean} - Whether signature is valid
 */
function verifyShopifyWebhook(body, signature, secret) {
  try {
    // Create HMAC using the secret as UTF-8 string
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(body, 'utf8');
    
    // Get base64 encoded signature
    const computedSignature = hmac.digest('base64');
    
    console.log('Signature verification details:', {
      computedSignature,
      receivedSignature: signature,
      secretLength: secret.length,
      bodyLength: body.length
    });
    
    // Compare base64 signatures
    return crypto.timingSafeEqual(
      Buffer.from(computedSignature, 'base64'),
      Buffer.from(signature, 'base64')
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Extracts Firebase UID and product info from Shopify order metadata
 * @param {Object} order - Shopify order object
 * @returns {Object} - Extracted user info and products
 */
function extractUserInfoFromOrder(order) {
  // Check for Firebase UID in various possible locations
  let firebaseUid = null;
  let userEmail = null;
  
  // Try order note attributes first
  if (order.note_attributes && Array.isArray(order.note_attributes)) {
    const uidAttribute = order.note_attributes.find(attr => 
      attr.name === 'firebase_uid' || attr.name === 'user_id'
    );
    if (uidAttribute) {
      firebaseUid = uidAttribute.value;
    }
  }
  
  // Try line item properties for Firebase UID
  if (!firebaseUid && order.line_items) {
    for (const lineItem of order.line_items) {
      if (lineItem.properties && Array.isArray(lineItem.properties)) {
        const uidProperty = lineItem.properties.find(prop => 
          prop.name === 'firebase_uid' || prop.name === 'user_id'
        );
        if (uidProperty) {
          firebaseUid = uidProperty.value;
          break;
        }
      }
    }
  }
  
  // Get customer email
  if (order.customer && order.customer.email) {
    userEmail = order.customer.email.toLowerCase().trim();
  } else if (order.contact_email) {
    userEmail = order.contact_email.toLowerCase().trim();
  }
  
  // Extract purchased products (simplified - just use Shopify product IDs)
  const purchasedItems = [];
  if (order.line_items && Array.isArray(order.line_items)) {
    order.line_items.forEach(item => {
      purchasedItems.push({
        productId: item.product_id?.toString(),
        variantId: item.variant_id?.toString(),
        title: item.title,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        sku: item.sku
      });
    });
  }
  
  return {
    firebaseUid,
    userEmail,
    purchasedItems,
    orderId: order.id?.toString(),
    orderNumber: order.order_number?.toString(),
    totalPrice: order.total_price,
    currency: order.currency,
    createdAt: order.created_at,
    financialStatus: order.financial_status,
    fulfillmentStatus: order.fulfillment_status
  };
}

/**
 * Updates user custom claims based on purchase status
 * @param {string} firebaseUid - Firebase user UID
 * @param {Array} purchasedItems - Array of purchased items
 * @param {string} action - 'grant' or 'revoke'
 * @param {Object} orderInfo - Additional order information
 */
async function updateUserCustomClaims(firebaseUid, purchasedItems, action, orderInfo) {
  try {
    console.log(`Updating custom claims for user ${firebaseUid}: ${action} access`);
    
    // Get current user record
    const userRecord = await admin.auth().getUser(firebaseUid);
    const existingClaims = userRecord.customClaims || {};
    
    // Initialize or get existing purchased products
    let purchasedProducts = existingClaims.purchasedProducts || [];
    let activePurchases = existingClaims.activePurchases || {};
    
    // Process each purchased item
    purchasedItems.forEach(item => {
      if (action === 'grant') {
        // Add product access
        if (item.productId && !purchasedProducts.includes(item.productId)) {
          purchasedProducts.push(item.productId);
        }
        
        // Track active purchase
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
      } else if (action === 'revoke') {
        // Remove product access
        if (item.productId) {
          purchasedProducts = purchasedProducts.filter(id => id !== item.productId);
          
          // Update active purchase status
          if (activePurchases[item.productId]) {
            activePurchases[item.productId].status = 'revoked';
            activePurchases[item.productId].lastUpdated = Date.now();
            activePurchases[item.productId].revokeReason = orderInfo.revokeReason || 'order_cancelled';
          }
        }
      }
    });
    
    // Build updated custom claims
    const updatedClaims = {
      ...existingClaims,
      purchasedProducts,
      activePurchases,
      hasActivePurchases: purchasedProducts.length > 0,
      lastPurchaseUpdate: Date.now(),
      shopifyCustomer: true
    };
    
    // Set the updated custom claims
    await admin.auth().setCustomUserClaims(firebaseUid, updatedClaims);
    
    console.log(`Successfully updated custom claims for user ${firebaseUid}`);
    console.log(`Active products: ${purchasedProducts.length}`);
    
    return updatedClaims;
  } catch (error) {
    console.error(`Error updating custom claims for user ${firebaseUid}:`, error);
    throw error;
  }
}

/**
 * Shopify Webhook Handler - DEBUG VERSION
 * Logs all webhook data to understand structure
 */
const handleShopifyWebhookV2 = onRequest({
  cors: true,
  maxInstances: 10,
  timeoutSeconds: 120,
  secrets: ["SHOPIFY_WEBHOOK_SECRET"]
}, async (req, res) => {
  const signature = req.headers['x-shopify-hmac-sha256'];
  const shopDomain = req.headers['x-shopify-shop-domain'];
  const topic = req.headers['x-shopify-topic'];
  const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET;

  console.log('=== SHOPIFY WEBHOOK DEBUG ===');
  console.log('Headers received:', {
    'x-shopify-topic': topic,
    'x-shopify-shop-domain': shopDomain,
    'x-shopify-hmac-sha256': signature,
    'content-type': req.headers['content-type'],
    'user-agent': req.headers['user-agent']
  });

  try {
    // Get raw body for signature verification
    const rawBody = JSON.stringify(req.body);
    console.log('Raw body length:', rawBody.length);
    console.log('Webhook secret configured:', !!webhookSecret);
    
    // Verify webhook signature if secret is configured
    if (webhookSecret && signature) {
      const isValid = verifyShopifyWebhook(rawBody, signature, webhookSecret);
      console.log('Signature verification result:', isValid);
      
      if (!isValid) {
        console.error('❌ Invalid webhook signature');
        return res.status(401).send('Unauthorized');
      }
    } else {
      console.warn('⚠️  Skipping signature verification - no secret configured');
    }
    
    const webhookData = req.body;
    console.log('✅ Webhook event verified:', topic, 'ID:', webhookData.id);

    // LOG THE COMPLETE WEBHOOK STRUCTURE
    console.log('=== COMPLETE WEBHOOK PAYLOAD ===');
    console.log(JSON.stringify(webhookData, null, 2));
    console.log('=== END WEBHOOK PAYLOAD ===');

    // Extract and log user info
    if (webhookData.id) {
      const userInfo = extractUserInfoFromOrder(webhookData);
      console.log('=== EXTRACTED USER INFO ===');
      console.log('Firebase UID:', userInfo.firebaseUid);
      console.log('User Email:', userInfo.userEmail);
      console.log('Order ID:', userInfo.orderId);
      console.log('Order Number:', userInfo.orderNumber);
      console.log('Total Price:', userInfo.totalPrice);
      console.log('Financial Status:', userInfo.financialStatus);
      console.log('Purchased Items:', JSON.stringify(userInfo.purchasedItems, null, 2));
      console.log('=== END EXTRACTED INFO ===');

      // Test custom claims update if we have a Firebase UID
      if (userInfo.firebaseUid && userInfo.purchasedItems.length > 0) {
        console.log('🧪 Testing custom claims update...');
        try {
          const action = topic === 'orders/paid' ? 'grant' : 
                       topic === 'orders/cancelled' || topic === 'refunds/create' ? 'revoke' : 'grant';
          
          const updatedClaims = await updateUserCustomClaims(
            userInfo.firebaseUid,
            userInfo.purchasedItems,
            action,
            userInfo
          );
          
          console.log('✅ Custom claims updated successfully');
          console.log('Updated claims:', JSON.stringify(updatedClaims, null, 2));
        } catch (claimsError) {
          console.error('❌ Custom claims update failed:', claimsError);
        }
      } else {
        console.log('⚠️  No Firebase UID or purchased items - skipping custom claims test');
      }
    }

    console.log('=== WEBHOOK DEBUG COMPLETE ===');
    
    res.json({ 
      received: true, 
      topic: topic,
      orderId: webhookData.id,
      debug: 'Webhook structure logged to console'
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', {
      message: error.message,
      stack: error.stack,
      topic: topic,
      shopDomain: shopDomain
    });
    
    return res.status(200).send('Error logged - returning 200 to prevent retries during debugging');
  }
});

module.exports = {
  handleShopifyWebhookV2
};