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

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates email address format
 * @param {string} email - Email address to validate
 * @returns {boolean} - Whether email is valid
 */
function validateEmail(email) {
  if (!email) return false;
  const normalizedEmail = String(email).trim().toLowerCase();
  return emailRegex.test(normalizedEmail);
}

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
  let recipientEmail = null;
  let recipientName = null;
  let purchaserEmail = null;
  let purchaserName = null;
  
  // Try order note attributes first for Recipient info
  if (order.note_attributes && Array.isArray(order.note_attributes)) {
    // Look for Firebase UID
    const uidAttribute = order.note_attributes.find(attr => 
      attr.name === 'firebase_uid' || attr.name === 'user_id'
    );
    if (uidAttribute) {
      firebaseUid = uidAttribute.value;
    }
    
    // Look for Recipient Email (the actual student/user)
    const recipientEmailAttr = order.note_attributes.find(attr => 
      attr.name === 'Recipient Email' || attr.name === 'recipient_email'
    );
    if (recipientEmailAttr) {
      recipientEmail = recipientEmailAttr.value?.toLowerCase().trim();
    }
    
    // Look for Recipient Name
    const recipientNameAttr = order.note_attributes.find(attr => 
      attr.name === 'Recipient' || attr.name === 'recipient_name'
    );
    if (recipientNameAttr) {
      recipientName = recipientNameAttr.value;
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
  
  // Get purchaser email (the person who paid)
  if (order.customer && order.customer.email) {
    purchaserEmail = order.customer.email.toLowerCase().trim();
    purchaserName = `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim();
  } else if (order.contact_email) {
    purchaserEmail = order.contact_email.toLowerCase().trim();
  } else if (order.email) {
    purchaserEmail = order.email.toLowerCase().trim();
  }
  
  // Determine the primary user email (prefer recipient email if available)
  userEmail = recipientEmail || purchaserEmail;
  
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
    userEmail,           // Primary email for the user (recipient if available, otherwise purchaser)
    recipientEmail,      // Specific recipient email if provided
    recipientName,       // Specific recipient name if provided
    purchaserEmail,      // Email of the person who made the purchase
    purchaserName,       // Name of the person who made the purchase
    purchasedItems,
    orderId: order.id?.toString() || null,
    orderNumber: order.order_number?.toString() || null,
    totalPrice: order.total_price || '0.00',
    currency: order.currency || 'USD',
    createdAt: order.created_at || new Date().toISOString(),
    financialStatus: order.financial_status || 'unknown',
    fulfillmentStatus: order.fulfillment_status || null,
    noteAttributes: order.note_attributes || []
  };
}

/**
 * Finds Firebase user by email
 * @param {string} email - User email address
 * @returns {Object|null} - User record or null if not found
 */
async function findUserByEmail(email) {
  try {
    if (!email) return null;
    
    const userRecord = await admin.auth().getUserByEmail(email.toLowerCase().trim());
    console.log(`Found Firebase user for email ${email}: ${userRecord.uid}`);
    return userRecord;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log(`No Firebase user found for email: ${email}`);
      return null;
    }
    console.error(`Error finding user by email ${email}:`, error);
    return null;
  }
}

/**
 * Stores purchase information in Firestore
 * @param {Object} webhookData - Raw webhook data from Shopify
 * @param {Object} userInfo - Extracted user information
 * @param {Object} processingResult - Result of webhook processing
 * @param {string} topic - Webhook topic (orders/paid, orders/updated, etc.)
 */
async function storePurchaseInFirestore(webhookData, userInfo, processingResult, topic) {
  try {
    // Process each purchased item as a separate purchase record
    const purchasePromises = [];
    
    if (userInfo?.purchasedItems && userInfo.purchasedItems.length > 0) {
      for (const item of userInfo.purchasedItems) {
        const purchaseId = `${userInfo.orderId}_${item.productId}`;
        
        // Build the purchase document
        const purchaseData = {
          // Order information
          orderId: userInfo?.orderId || null,
          orderNumber: userInfo?.orderNumber || null,
          purchaseId: purchaseId,
          
          // Product information
          productId: item.productId || null,
          variantId: item.variantId || null,
          productTitle: item.title || item.name || null,
          sku: item.sku || null,
          quantity: item.quantity || 1,
          price: item.price || '0.00',
          
          // User information
          userId: processingResult?.userId || null,
          userEmail: userInfo?.userEmail || null,
          recipientEmail: userInfo?.recipientEmail || null,
          recipientName: userInfo?.recipientName || null,
          purchaserEmail: userInfo?.purchaserEmail || null,
          purchaserName: userInfo?.purchaserName || null,
          emailUsed: userInfo?.recipientEmail ? 'recipient' : (userInfo?.purchaserEmail ? 'purchaser' : 'none'),
          
          // Status information
          status: topic === 'orders/paid' ? 'active' : 
                  topic === 'orders/cancelled' || topic === 'refunds/create' ? 'cancelled' : 'pending',
          financialStatus: userInfo?.financialStatus || null,
          fulfillmentStatus: userInfo?.fulfillmentStatus || null,
          
          // Processing information
          userCreated: processingResult?.userCreated || false,
          userFound: processingResult?.userFound || false,
          hasValidEmail: validateEmail(userInfo?.userEmail),
          
          // Pricing information
          totalOrderPrice: userInfo?.totalPrice || null,
          currency: userInfo?.currency || null,
          
          // Metadata
          webhookTopic: topic,
          noteAttributes: userInfo?.noteAttributes || [],
          processingErrors: processingResult?.errors || [],
          processingWarnings: processingResult?.warnings || [],
          
          // Store the complete webhook payload
          webhookPayload: webhookData || {},
          
          // Timestamps
          grantedAt: topic === 'orders/paid' ? admin.firestore.FieldValue.serverTimestamp() : null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        // Remove any undefined values
        Object.keys(purchaseData).forEach(key => {
          if (purchaseData[key] === undefined) {
            delete purchaseData[key];
          }
        });
        
        // Store in purchases collection
        purchasePromises.push(
          firestore.collection('shopifyWebhooks').doc('purchases').collection('orders').doc(purchaseId).set(purchaseData)
        );
      }
      
      await Promise.all(purchasePromises);
      console.log(`✅ Stored ${userInfo.purchasedItems.length} purchase(s) in Firestore`);
    } else {
      // No items but still log the order attempt
      const purchaseId = `${userInfo?.orderId || 'unknown'}_no_items`;
      
      const purchaseData = {
        orderId: userInfo?.orderId || null,
        orderNumber: userInfo?.orderNumber || null,
        purchaseId: purchaseId,
        status: 'no_items',
        userEmail: userInfo?.userEmail || null,
        recipientEmail: userInfo?.recipientEmail || null,
        purchaserEmail: userInfo?.purchaserEmail || null,
        webhookTopic: topic,
        processingErrors: ['No items in order'],
        webhookPayload: webhookData || {},
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      // Remove undefined values
      Object.keys(purchaseData).forEach(key => {
        if (purchaseData[key] === undefined) {
          delete purchaseData[key];
        }
      });
      
      await firestore.collection('shopifyWebhooks').doc('purchases').collection('orders').doc(purchaseId).set(purchaseData);
      console.log('⚠️ Stored order with no items');
    }
    
    // Also create a lightweight log entry (without full payload)
    const logData = {
      timestamp: Date.now(),
      orderId: userInfo?.orderId || null,
      orderNumber: userInfo?.orderNumber || null,
      topic: topic,
      status: processingResult?.status || 'unknown',
      userId: processingResult?.userId || null,
      userEmail: userInfo?.userEmail || null,
      productCount: userInfo?.purchasedItems?.length || 0,
      processingTimeMs: processingResult?.processingTime || 0,
      hasErrors: (processingResult?.errors?.length || 0) > 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Remove undefined values
    Object.keys(logData).forEach(key => {
      if (logData[key] === undefined) {
        delete logData[key];
      }
    });
    
    // Store lightweight log
    const logId = `${Date.now()}_${userInfo?.orderId || 'unknown'}`;
    await firestore.collection('shopifyWebhooks').doc('logs').collection('summary').doc(logId).set(logData);
    
  } catch (error) {
    console.error('Error storing purchase in Firestore:', error);
    // Don't throw - storage failure shouldn't break webhook processing
  }
}

/**
 * Creates an admin alert for issues requiring attention
 * @param {string} alertType - Type of alert
 * @param {string} severity - 'warning' | 'error' | 'critical'
 * @param {Object} details - Alert details
 */
async function createAdminAlert(alertType, severity, details) {
  try {
    // Clean the details object to remove undefined values
    const cleanDetails = {};
    Object.keys(details || {}).forEach(key => {
      if (details[key] !== undefined) {
        cleanDetails[key] = details[key];
      }
    });
    
    const alertDoc = await firestore.collection('shopifyWebhooks').doc('alerts').collection('active').add({
      type: alertType,
      severity: severity,
      details: cleanDetails,
      resolved: false,
      acknowledgedBy: null,
      acknowledgedAt: null,
      notes: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`⚠️ Admin alert created: ${alertType} (${severity}) - ID: ${alertDoc.id}`);
    
    // Also update daily stats
    await updateDailyStats('alertsCreated', 1);
  } catch (error) {
    console.error('Error creating admin alert:', error);
  }
}

/**
 * Updates daily statistics for dashboard
 * @param {string} field - Field to update
 * @param {number} increment - Amount to increment by
 */
async function updateDailyStats(field, increment = 1) {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const statsRef = firestore.collection('shopifyWebhooks').doc('stats').collection('daily').doc(today);
    
    await statsRef.set({
      [field]: admin.firestore.FieldValue.increment(increment),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error updating daily stats:', error);
  }
}

/**
 * Creates a new Firebase user account
 * @param {Object} userInfo - User information from Shopify order
 * @returns {Object|null} - Created user record or null if failed
 */
async function createFirebaseUser(userInfo) {
  try {
    const email = userInfo.userEmail;
    if (!email) {
      console.error('Cannot create user without email');
      return null;
    }
    
    // Parse name from recipient or purchaser
    const fullName = userInfo.recipientName || userInfo.purchaserName || '';
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Generate a secure random password
    const randomPassword = crypto.randomBytes(32).toString('base64');
    
    // Create the user account
    const userRecord = await admin.auth().createUser({
      email: email.toLowerCase().trim(),
      password: randomPassword,
      displayName: fullName || email.split('@')[0],
      emailVerified: false, // User will need to verify email
      disabled: false
    });
    
    console.log(`✅ Created new Firebase user: ${userRecord.uid} for email: ${email}`);
    
    // Store additional user info in Realtime Database
    await admin.database().ref(`users/${userRecord.uid}`).set({
      email: email.toLowerCase().trim(),
      firstName: firstName,
      lastName: lastName,
      displayName: fullName || email.split('@')[0],
      createdAt: admin.database.ServerValue.TIMESTAMP,
      createdBy: 'shopify_webhook',
      shopifyCustomer: true,
      recipientEmail: userInfo.recipientEmail,
      purchaserEmail: userInfo.purchaserEmail,
      isRecipient: userInfo.recipientEmail === email,
      isPurchaser: userInfo.purchaserEmail === email
    });
    
    console.log(`✅ User profile created in database for: ${userRecord.uid}`);
    
    // Send password reset email so user can set their own password
    try {
      const resetLink = await admin.auth().generatePasswordResetLink(email);
      console.log(`Password reset link generated for ${email}`);
      // In a production environment, you would send this via email
      // For now, just log that it was generated
    } catch (resetError) {
      console.error('Error generating password reset link:', resetError);
      // Continue anyway - user can request reset manually
    }
    
    return userRecord;
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('User already exists with this email, fetching existing user');
      return await findUserByEmail(userInfo.userEmail);
    }
    console.error('Error creating Firebase user:', error);
    return null;
  }
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
  
  // Track processing start time
  const processingStartTime = Date.now();
  
  // Initialize processing result object
  const processingResult = {
    status: 'processing',
    userFound: false,
    userCreated: false,
    userId: null,
    errors: [],
    warnings: [],
    processingTime: 0
  };

  try {
    // Update daily stats for webhook received
    await updateDailyStats('totalWebhooks', 1);
    // Get raw body for signature verification
    // Firebase Functions v2 provides req.rawBody as a Buffer
    const rawBody = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body);
    console.log('Raw body length:', rawBody.length);
    console.log('Webhook secret configured:', !!webhookSecret);
    console.log('Using rawBody from:', req.rawBody ? 'Firebase rawBody' : 'JSON.stringify fallback');
    
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

    // Initialize userInfo variable at higher scope
    let userInfo = {};
    
    // Extract and log user info
    if (webhookData.id) {
      userInfo = extractUserInfoFromOrder(webhookData);
      console.log('=== EXTRACTED USER INFO ===');
      console.log('Firebase UID:', userInfo.firebaseUid);
      console.log('User Email:', userInfo.userEmail);
      console.log('Recipient Email:', userInfo.recipientEmail);
      console.log('Recipient Name:', userInfo.recipientName);
      console.log('Purchaser Email:', userInfo.purchaserEmail);
      console.log('Purchaser Name:', userInfo.purchaserName);
      console.log('Order ID:', userInfo.orderId);
      console.log('Order Number:', userInfo.orderNumber);
      console.log('Total Price:', userInfo.totalPrice);
      console.log('Financial Status:', userInfo.financialStatus);
      console.log('Note Attributes:', JSON.stringify(userInfo.noteAttributes, null, 2));
      console.log('Purchased Items:', JSON.stringify(userInfo.purchasedItems, null, 2));
      console.log('=== END EXTRACTED INFO ===');

      // Check for data quality issues and create alerts
      if (!userInfo.recipientEmail && userInfo.purchaserEmail) {
        processingResult.warnings.push('Missing recipient email - using purchaser email');
        await createAdminAlert(
          'missing_recipient_email',
          'warning',
          {
            orderId: userInfo.orderId,
            orderNumber: userInfo.orderNumber,
            purchaserEmail: userInfo.purchaserEmail,
            purchaserName: userInfo.purchaserName,
            message: 'Order processed with purchaser email - no recipient specified',
            products: userInfo.purchasedItems,
            totalPrice: userInfo.totalPrice,
            noteAttributes: userInfo.noteAttributes
          }
        );
      }
      
      if (userInfo.userEmail && !validateEmail(userInfo.userEmail)) {
        processingResult.errors.push('Invalid email format');
        await createAdminAlert(
          'invalid_email',
          'error',
          {
            orderId: userInfo.orderId,
            orderNumber: userInfo.orderNumber,
            providedEmail: userInfo.userEmail,
            recipientEmail: userInfo.recipientEmail,
            purchaserEmail: userInfo.purchaserEmail,
            message: 'Cannot process order - invalid email format',
            products: userInfo.purchasedItems
          }
        );
      }
      
      // Try to find or create user based on order info
      let firebaseUser = null;
      
      // PRIORITY 1: If Firebase UID is provided, use that existing user
      if (userInfo.firebaseUid) {
        try {
          firebaseUser = await admin.auth().getUser(userInfo.firebaseUid);
          console.log('✅ Found user by Firebase UID:', userInfo.firebaseUid);
          console.log('   User email:', firebaseUser.email);
          processingResult.userFound = true;
          processingResult.userId = firebaseUser.uid;
        } catch (error) {
          console.log('❌ Could not find user by Firebase UID:', userInfo.firebaseUid);
          processingResult.errors.push(`Invalid Firebase UID: ${userInfo.firebaseUid}`);
        }
      }
      
      // PRIORITY 2: If no user found by UID, check if user exists by email
      if (!firebaseUser && userInfo.userEmail && validateEmail(userInfo.userEmail)) {
        firebaseUser = await findUserByEmail(userInfo.userEmail);
        if (firebaseUser) {
          console.log('✅ Found existing user by email:', userInfo.userEmail);
          console.log('   User UID:', firebaseUser.uid);
          processingResult.userFound = true;
          processingResult.userId = firebaseUser.uid;
        } else {
          console.log('📝 No existing user found for email:', userInfo.userEmail);
        }
      }
      
      // PRIORITY 3: Create new user if this is a paid order and no user exists
      if (!firebaseUser && userInfo.userEmail && validateEmail(userInfo.userEmail) && topic === 'orders/paid' && userInfo.purchasedItems.length > 0) {
        console.log('🆕 Attempting to create new Firebase user');
        console.log('   Primary email (recipient or purchaser):', userInfo.userEmail);
        console.log('   Is recipient email:', userInfo.userEmail === userInfo.recipientEmail);
        
        firebaseUser = await createFirebaseUser(userInfo);
        if (firebaseUser) {
          console.log('✅ Successfully created or found user:', firebaseUser.uid);
          processingResult.userCreated = true;
          processingResult.userId = firebaseUser.uid;
          await updateDailyStats('usersCreated', 1);
        } else {
          console.log('❌ Failed to create new user for:', userInfo.userEmail);
          processingResult.errors.push('User creation failed');
          await createAdminAlert(
            'user_creation_failed',
            'error',
            {
              orderId: userInfo.orderId,
              orderNumber: userInfo.orderNumber,
              attemptedEmail: userInfo.userEmail,
              recipientEmail: userInfo.recipientEmail,
              purchaserEmail: userInfo.purchaserEmail,
              message: 'Failed to create Firebase user for paid order',
              products: userInfo.purchasedItems,
              totalPrice: userInfo.totalPrice
            }
          );
        }
      }
      
      // Update custom claims if we have a user
      if (firebaseUser && userInfo.purchasedItems.length > 0) {
        console.log('🧪 Updating user access for:', firebaseUser.uid);
        try {
          const action = topic === 'orders/paid' ? 'grant' : 
                       topic === 'orders/cancelled' || topic === 'refunds/create' ? 'revoke' : 'grant';
          
          const updatedClaims = await updateUserCustomClaims(
            firebaseUser.uid,
            userInfo.purchasedItems,
            action,
            userInfo
          );
          
          console.log('✅ Custom claims updated successfully');
          console.log('Updated claims:', JSON.stringify(updatedClaims, null, 2));
          
          // Also update Realtime Database with purchase info
          await admin.database().ref(`users/${firebaseUser.uid}/shopifyPurchases/${userInfo.orderId}`).set({
            orderId: userInfo.orderId,
            orderNumber: userInfo.orderNumber,
            userEmail: userInfo.userEmail,
            recipientEmail: userInfo.recipientEmail,
            recipientName: userInfo.recipientName,
            purchaserEmail: userInfo.purchaserEmail,
            purchaserName: userInfo.purchaserName,
            totalPrice: userInfo.totalPrice,
            currency: userInfo.currency,
            financialStatus: userInfo.financialStatus,
            purchasedItems: userInfo.purchasedItems,
            createdAt: userInfo.createdAt,
            lastUpdated: admin.database.ServerValue.TIMESTAMP,
            status: action === 'grant' ? 'active' : 'cancelled',
            webhookTopic: topic
          });
          
          console.log('✅ Database updated with purchase info');
          processingResult.status = 'success';
          await updateDailyStats('successfulOrders', 1);
          
        } catch (claimsError) {
          console.error('❌ User update failed:', claimsError);
          processingResult.errors.push('Failed to update user claims');
          processingResult.status = 'partial_failure';
        }
      } else if (!firebaseUser && userInfo.userEmail) {
        console.log('⚠️  No Firebase user found or created for this order');
        processingResult.status = 'no_user';
        
        // Create alert for orders without users
        await createAdminAlert(
          'no_user_for_order',
          'warning',
          {
            orderId: userInfo.orderId,
            orderNumber: userInfo.orderNumber,
            userEmail: userInfo.userEmail,
            recipientEmail: userInfo.recipientEmail,
            purchaserEmail: userInfo.purchaserEmail,
            message: 'Order received but no user could be found or created',
            products: userInfo.purchasedItems,
            totalPrice: userInfo.totalPrice,
            financialStatus: userInfo.financialStatus,
            webhookTopic: topic
          }
        );
        await updateDailyStats('ordersWithoutUsers', 1);
      } else if (!userInfo.userEmail) {
        console.log('❌ No email provided in order - cannot process');
        processingResult.status = 'no_email';
        processingResult.errors.push('No email address provided');
        
        // Create critical alert for orders with no email
        await createAdminAlert(
          'no_email_in_order',
          'critical',
          {
            orderId: userInfo.orderId,
            orderNumber: userInfo.orderNumber,
            message: 'Order received with no email address - cannot process',
            products: userInfo.purchasedItems,
            totalPrice: userInfo.totalPrice,
            noteAttributes: userInfo.noteAttributes,
            webhookTopic: topic
          }
        );
        await updateDailyStats('failedOrders', 1);
      } else {
        console.log('⚠️  No purchased items in order - skipping');
        processingResult.status = 'no_items';
      }
    }
    
    // Calculate processing time
    processingResult.processingTime = Date.now() - processingStartTime;
    
    // Store purchase data in Firestore
    await storePurchaseInFirestore(
      webhookData,
      userInfo || {},
      topic,
      shopDomain,
      processingResult
    );

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
    
    // Log error to Firestore
    processingResult.status = 'error';
    processingResult.errors.push(error.message);
    processingResult.processingTime = Date.now() - processingStartTime;
    
    await storePurchaseInFirestore(
      { error: error.message },
      {},
      topic || 'unknown',
      shopDomain || 'unknown',
      processingResult
    );
    
    // Create critical alert for webhook processing error
    await createAdminAlert(
      'webhook_processing_error',
      'critical',
      {
        error: error.message,
        stack: error.stack,
        topic: topic,
        shopDomain: shopDomain,
        message: 'Webhook processing failed with error'
      }
    );
    
    await updateDailyStats('failedWebhooks', 1);
    
    return res.status(200).send('Error logged - returning 200 to prevent retries during debugging');
  }
});

module.exports = {
  handleShopifyWebhookV2
};