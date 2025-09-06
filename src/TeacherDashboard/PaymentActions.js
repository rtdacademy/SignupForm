import React, { useState, useEffect } from 'react';
import { getDatabase, ref, set, update, get } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { 
  X,
  DollarSign,
  RefreshCw,
  Link,
  AlertTriangle,
  Check,
  Calculator,
  CreditCard,
  FileText,
  Shield,
  Edit,
  Save
} from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

const PaymentActions = ({ student, schoolYear, onClose }) => {
  const [processing, setProcessing] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [message, setMessage] = useState(null);
  const [creditAdjustment, setCreditAdjustment] = useState({
    amount: 0,
    reason: ''
  });
  const [manualOverride, setManualOverride] = useState({
    enabled: false,
    reason: ''
  });
  const [paymentLinkData, setPaymentLinkData] = useState({
    amount: student.amountDue || 0,
    description: '',
    courses: []
  });
  const [stripeCustomerId, setStripeCustomerId] = useState(null);
  
  // Load customer ID from Firebase payment data on mount
  useEffect(() => {
    loadCustomerId();
  }, [student]);
  
  const loadCustomerId = async () => {
    try {
      const db = getDatabase();
      const emailKey = sanitizeEmail(student.email);
      
      // Get course IDs from student data
      let courseIds = [];
      if (student.courses && typeof student.courses === 'object') {
        courseIds = Object.keys(student.courses);
      } else if (student.rawData?.coursePaymentDetails) {
        courseIds = Object.keys(student.rawData.coursePaymentDetails);
      }
      
      // Try to find a customer_id from any course payment
      for (const courseId of courseIds) {
        const paymentRef = ref(db, `payments/${emailKey}/courses/${courseId}`);
        const snapshot = await get(paymentRef);
        
        if (snapshot.exists() && snapshot.val().customer_id) {
          setStripeCustomerId(snapshot.val().customer_id);
          console.log('Found customer ID:', snapshot.val().customer_id);
          break;
        }
      }
    } catch (error) {
      console.error('Error loading customer ID:', error);
    }
  };

  const handleCreditAdjustment = async () => {
    if (!creditAdjustment.amount || !creditAdjustment.reason) {
      setMessage({ type: 'error', text: 'Please provide amount and reason for adjustment' });
      return;
    }

    setProcessing(true);
    try {
      const db = getDatabase();
      const emailKey = sanitizeEmail(student.email);
      const schoolYearKey = schoolYear.replace('/', '_');
      
      // Update paid credits
      const creditPath = `students/${emailKey}/profile/creditsPaid/${schoolYearKey}/${student.typeKey}`;
      const creditRef = ref(db, creditPath);
      
      // Get current paid credits
      const snapshot = await creditRef.get();
      const currentCredits = snapshot.val() || 0;
      const newCredits = currentCredits + parseInt(creditAdjustment.amount);
      
      await set(creditRef, Math.max(0, newCredits));
      
      // Log the adjustment
      const adjustmentId = Date.now();
      const adjustmentPath = `creditAdjustments/${emailKey}/${adjustmentId}`;
      await set(ref(db, adjustmentPath), {
        amount: creditAdjustment.amount,
        reason: creditAdjustment.reason,
        adjustedBy: 'staff', // In production, use actual staff user ID
        timestamp: Date.now(),
        previousValue: currentCredits,
        newValue: newCredits,
        schoolYear,
        studentType: student.typeKey
      });
      
      // Trigger credit recalculation
      await set(ref(db, `creditRecalculations/${emailKey}/trigger`), Date.now());
      
      setMessage({ type: 'success', text: 'Credit adjustment applied successfully' });
      setCreditAdjustment({ amount: 0, reason: '' });
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error adjusting credits:', error);
      setMessage({ type: 'error', text: 'Failed to adjust credits' });
    }
    setProcessing(false);
  };

  const handleManualOverride = async () => {
    if (!manualOverride.reason) {
      setMessage({ type: 'error', text: 'Please provide a reason for manual override' });
      return;
    }

    setProcessing(true);
    try {
      const db = getDatabase();
      const emailKey = sanitizeEmail(student.email);
      
      // Set manual payment override for each course
      const updates = {};
      
      if (student.paymentModel === 'course') {
        // For course-based students
        Object.keys(student.courses).forEach(courseId => {
          updates[`payments/${emailKey}/courses/${courseId}/manual`] = manualOverride.enabled;
          updates[`payments/${emailKey}/courses/${courseId}/manualReason`] = manualOverride.reason;
          updates[`payments/${emailKey}/courses/${courseId}/manualTimestamp`] = Date.now();
        });
      } else {
        // For credit-based students
        updates[`students/${emailKey}/profile/paymentOverride`] = {
          enabled: manualOverride.enabled,
          reason: manualOverride.reason,
          timestamp: Date.now(),
          setBy: 'staff' // In production, use actual staff user ID
        };
      }
      
      await update(ref(db), updates);
      
      setMessage({ 
        type: 'success', 
        text: manualOverride.enabled ? 'Payment override enabled' : 'Payment override disabled' 
      });
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error setting manual override:', error);
      setMessage({ type: 'error', text: 'Failed to set manual override' });
    }
    setProcessing(false);
  };

  const handleRecalculateCredits = async () => {
    setProcessing(true);
    try {
      const db = getDatabase();
      const emailKey = sanitizeEmail(student.email);
      
      // Trigger credit recalculation
      await set(ref(db, `creditRecalculations/${emailKey}/trigger`), Date.now());
      
      setMessage({ type: 'success', text: 'Credit recalculation triggered successfully' });
      
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error triggering recalculation:', error);
      setMessage({ type: 'error', text: 'Failed to trigger recalculation' });
    }
    setProcessing(false);
  };

  const handleGeneratePaymentLink = async () => {
    if (!paymentLinkData.amount || paymentLinkData.amount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid payment amount' });
      return;
    }

    setProcessing(true);
    try {
      const functions = getFunctions();
      const createPaymentLink = httpsCallable(functions, 'createStripePaymentLinkV2');
      
      const result = await createPaymentLink({
        email: student.email,
        uid: student.uid,
        customerId: stripeCustomerId, // Include customer ID if available
        amount: Math.round(paymentLinkData.amount), // Amount in cents
        description: paymentLinkData.description || `Payment for ${student.email}`,
        metadata: {
          studentType: student.typeKey,
          schoolYear,
          firebaseUID: student.uid,
          userEmail: student.email,
          paymentType: student.paymentModel === 'credit' ? 'credits' : 'course'
        }
      });
      
      if (result.data.success) {
        setMessage({ 
          type: 'success', 
          text: 'Payment link generated successfully',
          link: result.data.url
        });
      } else {
        throw new Error(result.data.message || 'Failed to create payment link');
      }
    } catch (error) {
      console.error('Error generating payment link:', error);
      setMessage({ type: 'error', text: 'Failed to generate payment link' });
    }
    setProcessing(false);
  };

  const handleSyncStripeData = async () => {
    setProcessing(true);
    try {
      const functions = getFunctions();
      const syncPayment = httpsCallable(functions, 'syncStripePaymentStatusV2');
      
      // Get course IDs
      let courseIds = [];
      if (student.courses && typeof student.courses === 'object') {
        courseIds = Object.keys(student.courses);
      } else if (student.rawData?.coursePaymentDetails) {
        courseIds = Object.keys(student.rawData.coursePaymentDetails);
      }
      
      // If we have a customer ID, use it for more efficient sync
      const syncData = {
        userEmail: student.email,
        courseId: courseIds[0] // Use first course for sync
      };
      
      if (stripeCustomerId) {
        syncData.customerId = stripeCustomerId;
      }
      
      const result = await syncPayment(syncData);
      
      if (result.data.success) {
        setMessage({ 
          type: 'success', 
          text: `Payment data synced: ${result.data.paymentCount || 0} payments found`
        });
      } else {
        throw new Error(result.data.message || 'Failed to sync payment data');
      }
    } catch (error) {
      console.error('Error syncing Stripe data:', error);
      setMessage({ type: 'error', text: 'Failed to sync Stripe data' });
    }
    setProcessing(false);
  };

  const renderActionContent = () => {
    switch (activeAction) {
      case 'adjust':
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700">Adjust Paid Credits</h3>
            <p className="text-sm text-gray-600">
              Add or subtract paid credits for this student. Current paid credits: {student.totalPaidCredits || 0}
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credit Adjustment (use negative for reduction)
              </label>
              <input
                type="number"
                value={creditAdjustment.amount}
                onChange={(e) => setCreditAdjustment({
                  ...creditAdjustment,
                  amount: parseInt(e.target.value) || 0
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., 5 or -3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Adjustment
              </label>
              <textarea
                value={creditAdjustment.reason}
                onChange={(e) => setCreditAdjustment({
                  ...creditAdjustment,
                  reason: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="3"
                placeholder="Provide a reason for this adjustment..."
              />
            </div>
            <button
              onClick={handleCreditAdjustment}
              disabled={processing || !creditAdjustment.amount || !creditAdjustment.reason}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Apply Adjustment
                </>
              )}
            </button>
          </div>
        );

      case 'override':
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700">Manual Payment Override</h3>
            <Alert className="border-yellow-500">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-700">
                This will bypass automatic payment checks. Use with caution.
              </AlertDescription>
            </Alert>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={manualOverride.enabled}
                  onChange={(e) => setManualOverride({
                    ...manualOverride,
                    enabled: e.target.checked
                  })}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Enable manual payment override
                </span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Override
              </label>
              <textarea
                value={manualOverride.reason}
                onChange={(e) => setManualOverride({
                  ...manualOverride,
                  reason: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="3"
                placeholder="Explain why payment is being manually overridden..."
              />
            </div>
            <button
              onClick={handleManualOverride}
              disabled={processing || !manualOverride.reason}
              className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Apply Override
                </>
              )}
            </button>
          </div>
        );

      case 'link':
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700">Generate Payment Link</h3>
            <p className="text-sm text-gray-600">
              Create a Stripe payment link for the student to complete payment.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (in dollars)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  value={paymentLinkData.amount / 100}
                  onChange={(e) => setPaymentLinkData({
                    ...paymentLinkData,
                    amount: Math.round(parseFloat(e.target.value) * 100) || 0
                  })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={paymentLinkData.description}
                onChange={(e) => setPaymentLinkData({
                  ...paymentLinkData,
                  description: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Payment description..."
              />
            </div>
            <button
              onClick={handleGeneratePaymentLink}
              disabled={processing || !paymentLinkData.amount}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Link className="h-4 w-4" />
                  Generate Payment Link
                </>
              )}
            </button>
            {message?.link && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-green-900 mb-2">Payment link generated:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={message.link}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-md text-sm"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(message.link)}
                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'recalculate':
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700">Recalculate Credits</h3>
            <p className="text-sm text-gray-600">
              Trigger a recalculation of this student's credit usage and payment requirements.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <p className="text-sm text-blue-700">
                This will recalculate all credits for {student.email} based on their current courses
                and the latest pricing configuration.
              </p>
            </div>
            <button
              onClick={handleRecalculateCredits}
              disabled={processing}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Recalculating...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4" />
                  Recalculate Now
                </>
              )}
            </button>
          </div>
        );

      case 'sync':
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700">Sync Stripe Data</h3>
            <p className="text-sm text-gray-600">
              Fetch the latest payment data from Stripe for this student.
            </p>
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
              <p className="text-sm text-purple-700">
                This will query Stripe for all payments, subscriptions, and invoices
                associated with this student's email address.
              </p>
            </div>
            <button
              onClick={handleSyncStripeData}
              disabled={processing}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Sync Now
                </>
              )}
            </button>
          </div>
        );

      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setActiveAction('adjust')}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Edit className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Adjust Credits</p>
                  <p className="text-sm text-gray-600">Manually adjust paid credits</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveAction('override')}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Shield className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium">Manual Override</p>
                  <p className="text-sm text-gray-600">Override payment requirements</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveAction('link')}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Link className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Payment Link</p>
                  <p className="text-sm text-gray-600">Generate Stripe payment link</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveAction('recalculate')}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calculator className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Recalculate</p>
                  <p className="text-sm text-gray-600">Recalculate credit usage</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveAction('sync')}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <RefreshCw className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Sync Stripe</p>
                  <p className="text-sm text-gray-600">Fetch latest Stripe data</p>
                </div>
              </div>
            </button>

            <button
              className="p-4 border rounded-lg hover:bg-gray-50 text-left opacity-50 cursor-not-allowed"
              disabled
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">Process Refund</p>
                  <p className="text-sm text-gray-600">Coming soon</p>
                </div>
              </div>
            </button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Payment Actions</h2>
            <p className="text-sm text-gray-600 mt-1">{student.email}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {message && (
            <Alert className={`mb-4 ${message.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
              {message.type === 'success' ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              <AlertDescription className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {renderActionContent()}
        </div>

        {/* Footer */}
        {activeAction && (
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-between">
            <button
              onClick={() => setActiveAction(null)}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              ← Back to Actions
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentActions;