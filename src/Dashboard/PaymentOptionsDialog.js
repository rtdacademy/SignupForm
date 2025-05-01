import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { FaCreditCard } from 'react-icons/fa';
import { Loader2 } from "lucide-react";
import { 
  collection,
  onSnapshot,
  addDoc,
  doc
} from 'firebase/firestore';
import { toast } from 'sonner';
import { firestore } from '../firebase'; // Import the firestore instance from your firebase.js

// Loading Overlay Component
const LoadingOverlay = ({ isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4 text-center space-y-4">
        <div className="flex justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Preparing Your Secure Checkout
        </h3>
        <p className="text-sm text-gray-500">
          You'll be redirected to our secure payment partner momentarily...
        </p>
      </div>
    </div>
  );
};

// Calculate subscription end date (3 payments)
// Calculate subscription end date for exactly 3 payments
const calculateSubscriptionEndDate = () => {
  const endDate = new Date();
  
  // Add exactly 2 months to get 3 full billing cycles
  // (first payment today, plus two more monthly payments)
  endDate.setMonth(endDate.getMonth() + 2);
  
  // Set time to end of day to be safe
  endDate.setHours(23, 59, 59);
  
  return endDate;
};

// Format price helper function
const formatPrice = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount);
};

// Payment options configuration
const paymentOptions = {
  onetime: {
    id: 'price_1QNT5yFQ2LFjAOXoBBSx1W5a',
    name: 'One-time Payment',
    amount: 650,
    description: 'Pay full amount upfront and save $50'
  },
  subscription: {
    id: 'price_1QNT5nFQ2LFjAOXoa9eGZork',
    name: 'Monthly Payments',
    amount: 233.33,
    total: 700,
    description: '3 monthly payments of $233.33'
  }
};

const PaymentOptionsDialog = ({ isOpen, onOpenChange, course, user }) => {
  const [selectedOption, setSelectedOption] = useState('onetime');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [checkoutSessionUnsubscribe, setCheckoutSessionUnsubscribe] = useState(null);

  useEffect(() => {
    return () => {
      if (checkoutSessionUnsubscribe) {
        checkoutSessionUnsubscribe();
      }
    };
  }, [checkoutSessionUnsubscribe]);

  useEffect(() => {
    if (!isOpen) {
      if (checkoutSessionUnsubscribe) {
        checkoutSessionUnsubscribe();
        setCheckoutSessionUnsubscribe(null);
      }
      setIsRedirecting(false);
      setPaymentError(null);
      setPaymentLoading(false);
    }
  }, [isOpen]);

  const handleCheckout = async () => {
    try {
      setPaymentLoading(true);
      setIsRedirecting(true);
      setPaymentError(null);

      if (!user) {
        throw new Error('You must be logged in to make a purchase');
      }

      const isSubscription = selectedOption === 'subscription';
      
      // Base metadata for all payment types
      const baseMetadata = {
        courseId: String(course.CourseID),
        courseName: course.Course?.Value || '',
        userEmail: user.email,
        userId: user.uid, 
        paymentType: isSubscription ? 'subscription_3_month' : 'one_time'
      };

      // Add cancel_at to metadata for subscription payments
      if (isSubscription) {
        const subscriptionEndDate = calculateSubscriptionEndDate();
        baseMetadata.cancel_at = subscriptionEndDate.toISOString();
      }

      const sessionData = {
        success_url: `${window.location.origin}/payment/result?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/payment/cancelled`,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        payment_method_types: ['card'],
        collect_shipping_address: false,
        metadata: baseMetadata,
        mode: isSubscription ? 'subscription' : 'payment',
        price: isSubscription ? paymentOptions.subscription.id : paymentOptions.onetime.id,
      };

      // Fixed: Properly access a subcollection in Firestore using the imported firestore instance
      const customerDocRef = doc(firestore, 'customers', user.uid);
      const checkoutSessionsRef = collection(customerDocRef, 'checkout_sessions');

      const docRef = await addDoc(checkoutSessionsRef, sessionData);

      const unsubscribe = onSnapshot(docRef, (snap) => {
        const data = snap.data();
        if (data?.error) {
          setPaymentError(data.error.message);
          setIsRedirecting(false);
          toast.error(data.error.message);
          unsubscribe();
        } else if (data?.url) {
          window.location.assign(data.url);
        }
      });

      setCheckoutSessionUnsubscribe(() => unsubscribe);

      setTimeout(() => {
        unsubscribe();
        setCheckoutSessionUnsubscribe(null);
        setIsRedirecting(false);
      }, 120000);

    } catch (error) {
      console.error('Checkout error:', error);
      setPaymentError(error.message);
      setIsRedirecting(false);
      toast.error('Unable to start checkout process. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Choose Your Payment Option</DialogTitle>
          <DialogDescription>
            Select your preferred payment method to access the course.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <RadioGroup
            value={selectedOption}
            onValueChange={setSelectedOption}
            className="gap-4"
          >
            {Object.entries(paymentOptions).map(([key, option]) => (
              <div 
                key={key}
                className={`flex items-start space-x-3 rounded-lg border p-4 cursor-pointer hover:border-primary ${
                  selectedOption === key ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <RadioGroupItem value={key} id={key} />
                <Label htmlFor={key} className="flex-1 cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{option.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-semibold">
                        {formatPrice(option.amount)}
                        {key === 'subscription' && '/mo'}
                      </span>
                      {key === 'subscription' && (
                        <div className="text-sm text-muted-foreground">
                          Total: {formatPrice(option.total)}
                        </div>
                      )}
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>

          {paymentError && (
            <Alert variant="destructive">
              <AlertDescription>{paymentError}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={paymentLoading || isRedirecting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCheckout}
            disabled={paymentLoading || isRedirecting}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {paymentLoading ? (
              <>
                <FaCreditCard className="mr-2 animate-pulse" />
                {selectedOption === 'onetime' ? 'Processing payment...' : 'Setting up subscription...'}
              </>
            ) : (
              <>
                <FaCreditCard className="mr-2" />
                Continue to Payment
              </>
            )}
          </Button>
        </DialogFooter>

        <LoadingOverlay isVisible={isRedirecting} />
      </DialogContent>
    </Dialog>
  );
};

export default PaymentOptionsDialog;