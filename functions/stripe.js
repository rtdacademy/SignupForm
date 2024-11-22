const functions = require('firebase-functions');
const stripe = require('stripe')(functions.config().stripe.secret_key);
const admin = require('firebase-admin');

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Define the function before exporting
const handleStripeWebhook = functions.https.onRequest(async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const endpointSecret = functions.config().stripe.webhook_secret;

  try {
    // Verify the webhook event
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      endpointSecret
    );

    console.log('Webhook event received:', event.type);

    // Handle customer.subscription.created event
    if (event.type === 'customer.subscription.created') {
      const subscription = event.data.object;
      
      console.log('Processing new subscription:', subscription.id);
      console.log('Subscription metadata:', subscription.metadata);

      // Check for cancel_at in metadata
      if (subscription.metadata?.cancel_at) {
        try {
          // Convert cancel_at to Unix timestamp
          const cancelTimestamp = Math.floor(new Date(subscription.metadata.cancel_at).getTime() / 1000);
          
          console.log('Updating subscription with cancel_at:', {
            subscriptionId: subscription.id,
            cancelTimestamp,
            originalDate: subscription.metadata.cancel_at
          });

          // Update the subscription with only cancel_at
          const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
            cancel_at: cancelTimestamp
          });

          console.log('Successfully updated subscription:', {
            subscriptionId: updatedSubscription.id,
            status: updatedSubscription.status,
            cancelAt: updatedSubscription.cancel_at,
            courseId: subscription.metadata.courseId
          });
        } catch (error) {
          console.error('Error updating subscription:', error);
          console.error('Stripe API Error:', {
            type: error.type,
            code: error.code,
            param: error.param,
            message: error.message
          });
        }
      } else {
        console.log('No cancel_at date in metadata for subscription:', subscription.id);
      }
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
    
  } catch (error) {
    console.error('Webhook Error:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// Export all functions
module.exports = {
  handleStripeWebhook
};