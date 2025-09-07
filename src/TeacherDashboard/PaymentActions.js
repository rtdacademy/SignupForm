import React, { useState, useEffect } from 'react';
import { getDatabase, ref, set, update, get } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { 
  X,
  DollarSign,
  RefreshCw,
  Link,
  AlertTriangle,
  AlertCircle,
  Check,
  Calculator,
  CreditCard,
  FileText,
  Shield,
  Edit,
  Save,
  Plus,
  Minus
} from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter 
} from '../components/ui/sheet';

const PaymentActions = ({ student, schoolYear, onClose }) => {
  const [processing, setProcessing] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [message, setMessage] = useState(null);
  const [existingOverride, setExistingOverride] = useState(null);
  const [creditAdjustment, setCreditAdjustment] = useState({
    amount: 0,
    reason: ''
  });
  const [manualOverride, setManualOverride] = useState({
    enabled: false,
    reason: '',
    selectedCourses: [] // For per-course overrides
  });
  const [paymentLinkData, setPaymentLinkData] = useState({
    amount: student.amountDue || 0,
    description: '',
    courses: []
  });
  const [stripeCustomerId, setStripeCustomerId] = useState(null);
  
  // Load customer ID and existing overrides on mount
  useEffect(() => {
    loadCustomerId();
    loadExistingOverrides();
    
    // Reset form state when component unmounts
    return () => {
      setCreditAdjustment({ amount: 0, reason: '' });
      setManualOverride({ enabled: false, reason: '', selectedCourses: [] });
      setPaymentLinkData({ amount: student.amountDue || 0, description: '', courses: [] });
      setActiveAction(null);
      setMessage(null);
    };
  }, [student, schoolYear]);
  
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

  const loadExistingOverrides = async () => {
    try {
      const db = getDatabase();
      const emailKey = sanitizeEmail(student.email);
      const schoolYearKey = schoolYear.replace('/', '_');
      
      // Check for credit adjustment overrides
      if (student.paymentModel === 'credit') {
        const overridePath = `students/${emailKey}/profile/creditOverrides/${schoolYearKey}/${student.typeKey}/creditAdjustments`;
        const overrideRef = ref(db, overridePath);
        const snapshot = await get(overrideRef);
        
        if (snapshot.exists()) {
          const override = snapshot.val();
          setExistingOverride({
            type: 'credit',
            data: override
          });
          // Pre-fill the form with existing values
          setCreditAdjustment({
            amount: override.additionalFreeCredits || 0,
            reason: override.reason || ''
          });
        }
      } else if (student.paymentModel === 'course') {
        // Check for course payment overrides
        const overridePath = `students/${emailKey}/profile/creditOverrides/${schoolYearKey}/${student.typeKey}/courseOverrides`;
        const overrideRef = ref(db, overridePath);
        const snapshot = await get(overrideRef);
        
        if (snapshot.exists()) {
          const overrides = snapshot.val();
          const overriddenCourses = Object.keys(overrides);
          setExistingOverride({
            type: 'course',
            data: overrides,
            courses: overriddenCourses
          });
          // Pre-fill the form
          setManualOverride({
            enabled: true,
            reason: overrides[overriddenCourses[0]]?.reason || '',
            selectedCourses: overriddenCourses
          });
        }
      }
    } catch (error) {
      console.error('Error loading existing overrides:', error);
    }
  };

  const handleCreditAdjustment = async () => {
    // Allow 0 for removing override, but still require reason
    if (creditAdjustment.amount === null || creditAdjustment.amount === undefined || !creditAdjustment.reason) {
      setMessage({ type: 'error', text: 'Please provide amount and reason for adjustment' });
      return;
    }

    setProcessing(true);
    try {
      const db = getDatabase();
      const auth = getAuth();
      const currentUser = auth.currentUser;
      const currentUserEmail = currentUser?.email || 'unknown';
      
      const emailKey = sanitizeEmail(student.email);
      const schoolYearKey = schoolYear.replace('/', '_');
      
      // For credit-based students, we add/update/remove additional free credits via override
      if (student.paymentModel === 'credit') {
        const overridePath = `students/${emailKey}/profile/creditOverrides/${schoolYearKey}/${student.typeKey}/creditAdjustments`;
        
        if (creditAdjustment.amount === 0) {
          // Remove override if amount is 0
          await set(ref(db, overridePath), null);
          setMessage({ type: 'success', text: 'Credit override removed successfully' });
        } else {
          // Add or update override
          const overrideData = {
            additionalFreeCredits: parseInt(creditAdjustment.amount),
            reason: creditAdjustment.reason,
            overriddenBy: currentUserEmail,
            overriddenAt: Date.now(),
            schoolYear: schoolYear // Store the school year for clarity
          };
          
          await set(ref(db, overridePath), overrideData);
          const successMessage = existingOverride ? 
            `Override updated: ${creditAdjustment.amount} additional credits` : 
            `Override applied: ${creditAdjustment.amount} additional credits`;
          setMessage({ type: 'success', text: successMessage });
        }
      } else {
        // For paid credits (purchasing credits), update the paid credits directly
        const creditPath = `students/${emailKey}/profile/creditsPaid/${schoolYearKey}/${student.typeKey}`;
        const creditRef = ref(db, creditPath);
        
        // Get current paid credits
        const snapshot = await creditRef.get();
        const currentCredits = snapshot.val() || 0;
        const newCredits = currentCredits + parseInt(creditAdjustment.amount);
        
        await set(creditRef, Math.max(0, newCredits));
      }
      
      // Log the adjustment
      const adjustmentId = Date.now();
      const adjustmentPath = `creditAdjustments/${emailKey}/${adjustmentId}`;
      await set(ref(db, adjustmentPath), {
        amount: creditAdjustment.amount,
        reason: creditAdjustment.reason,
        adjustedBy: currentUserEmail,
        timestamp: Date.now(),
        schoolYear,
        studentType: student.typeKey,
        adjustmentType: creditAdjustment.amount > 0 ? 'freeCreditsOverride' : 'paidCreditsAdjustment'
      });
      
      // Trigger credit recalculation
      await set(ref(db, `creditRecalculations/${emailKey}/trigger`), Date.now());
      
      setMessage({ type: 'success', text: 'Credit adjustment applied successfully' });
      // Don't reset the form until after closing
      
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
      const auth = getAuth();
      const currentUser = auth.currentUser;
      const currentUserEmail = currentUser?.email || 'unknown';
      
      const emailKey = sanitizeEmail(student.email);
      const schoolYearKey = schoolYear.replace('/', '_');
      
      if (student.paymentModel === 'course') {
        // For course-based students (Adult/International), set override for specific courses
        const coursesToOverride = manualOverride.selectedCourses.length > 0 
          ? manualOverride.selectedCourses 
          : Object.keys(student.courses);
        
        for (const courseId of coursesToOverride) {
          const overridePath = `students/${emailKey}/profile/creditOverrides/${schoolYearKey}/${student.typeKey}/courseOverrides/${courseId}`;
          
          if (manualOverride.enabled) {
            const overrideData = {
              isPaid: true,
              reason: manualOverride.reason,
              overriddenBy: currentUserEmail,
              overriddenAt: Date.now(),
              schoolYear: schoolYear // Store the school year for clarity
            };
            
            await set(ref(db, overridePath), overrideData);
          } else {
            // Remove override
            await set(ref(db, overridePath), null);
          }
        }
      } else {
        // For credit-based students, this would be additional free credits
        // Use the credit adjustment function for this case
        setMessage({ 
          type: 'info', 
          text: 'For credit-based students, use the "Adjust Credits" option to grant additional free credits' 
        });
        setProcessing(false);
        return;
      }
      
      // Log the override action
      const overrideLogId = Date.now();
      const logPath = `paymentOverrides/${emailKey}/${overrideLogId}`;
      await set(ref(db, logPath), {
        action: manualOverride.enabled ? 'enabled' : 'disabled',
        reason: manualOverride.reason,
        overriddenBy: currentUserEmail,
        timestamp: Date.now(),
        schoolYear,
        studentType: student.typeKey,
        courses: manualOverride.selectedCourses.length > 0 
          ? manualOverride.selectedCourses 
          : Object.keys(student.courses)
      });
      
      // Trigger credit recalculation
      await set(ref(db, `creditRecalculations/${emailKey}/trigger`), Date.now());
      
      setMessage({ 
        type: 'success', 
        text: manualOverride.enabled ? 'Payment override enabled' : 'Payment override disabled' 
      });
      // Don't reset the form until after closing
      
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
            <h3 className="font-medium text-gray-700">
              {student.paymentModel === 'credit' ? 
                (existingOverride ? 'Edit Free Credits Override' : 'Grant Additional Free Credits') : 
                'Adjust Paid Credits'}
            </h3>
            {student.paymentModel === 'credit' ? (
              <>
                <p className="text-sm text-gray-600">
                  {existingOverride ? 'Modify or remove the existing' : 'Grant'} additional free credits to this student for <strong>{schoolYear}</strong> school year. 
                  Current free credit limit: {student.freeCreditsLimit || 10}
                  {existingOverride && ` (includes +${existingOverride.data.additionalFreeCredits} override)`}
                </p>
                
                {existingOverride && (
                  <Alert className="border-yellow-500">
                    <Shield className="h-4 w-4 text-yellow-500" />
                    <AlertDescription className="text-yellow-700">
                      <strong>Existing Override:</strong><br />
                      Additional Credits: +{existingOverride.data.additionalFreeCredits}<br />
                      Applied by: {existingOverride.data.overriddenBy}<br />
                      Date: {new Date(existingOverride.data.overriddenAt).toLocaleDateString()}<br />
                      Reason: {existingOverride.data.reason}
                    </AlertDescription>
                  </Alert>
                )}
                
                <Alert className="border-blue-500">
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                  <AlertDescription className="text-blue-700">
                    {existingOverride ? 
                      'Update the override amount or set to 0 to remove the override entirely.' :
                      `This will increase the student's free credit limit for the ${schoolYear} school year only, 
                      allowing them to register for more courses without payment.`}
                  </AlertDescription>
                </Alert>
              </>
            ) : (
              <p className="text-sm text-gray-600">
                Adjust payment records for this student.
              </p>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {student.paymentModel === 'credit' ? 'Additional Free Credits' : 'Credit Adjustment'}
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCreditAdjustment({
                    ...creditAdjustment,
                    amount: Math.max(0, creditAdjustment.amount - 1)
                  })}
                  className="p-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all hover:scale-105 active:scale-95"
                  disabled={student.paymentModel === 'credit' && creditAdjustment.amount <= 0}
                >
                  <Minus className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="number"
                    value={creditAdjustment.amount}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-center text-xl font-bold bg-white cursor-default"
                    min={student.paymentModel === 'credit' ? 0 : undefined}
                  />
                  <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-xs bg-white px-2 text-gray-500">
                    Credits
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCreditAdjustment({
                    ...creditAdjustment,
                    amount: creditAdjustment.amount + 1
                  })}
                  className="p-3 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-all hover:scale-105 active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {creditAdjustment.amount === 0 && existingOverride ? 
                  <span className="text-red-600 font-medium">Setting to 0 will remove the existing override</span> :
                  creditAdjustment.amount === 0 ? 
                  'Use + button to add credits' :
                  `Will grant ${creditAdjustment.amount} additional free credit${creditAdjustment.amount !== 1 ? 's' : ''}`
                }
              </p>
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
              disabled={processing || (creditAdjustment.amount === null || creditAdjustment.amount === undefined) || !creditAdjustment.reason}
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
                  {creditAdjustment.amount === 0 ? 'Remove Override' : 
                   (existingOverride ? 'Update Override' : 'Apply Adjustment')}
                </>
              )}
            </button>
          </div>
        );

      case 'override':
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700">
              {student.paymentModel === 'course' ? 'Mark Courses as Paid' : 'Manual Payment Override'}
            </h3>
            
            {student.paymentModel === 'course' ? (
              <>
                <p className="text-sm text-gray-600">
                  Mark specific courses as paid for <strong>{schoolYear}</strong> school year without processing payment through Stripe.
                </p>
                <Alert className="border-yellow-500">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <AlertDescription className="text-yellow-700">
                    This will bypass automatic payment checks. Use only when payment has been received through alternative means.
                  </AlertDescription>
                </Alert>
                
                {/* Course selection for per-course payment students */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Courses to Override
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                    {Object.entries(student.courses || {}).map(([courseId, courseData]) => (
                      <label key={courseId} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={manualOverride.selectedCourses.includes(courseId)}
                          onChange={(e) => {
                            const newSelected = e.target.checked
                              ? [...manualOverride.selectedCourses, courseId]
                              : manualOverride.selectedCourses.filter(id => id !== courseId);
                            setManualOverride({
                              ...manualOverride,
                              selectedCourses: newSelected
                            });
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">
                          {courseData.courseName || `Course ${courseId}`}
                          {courseData.isPaid && <span className="text-green-600 ml-2">(Already Paid)</span>}
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {manualOverride.selectedCourses.length === 0 
                      ? 'No courses selected - will apply to all courses' 
                      : `${manualOverride.selectedCourses.length} course(s) selected`}
                  </p>
                </div>
              </>
            ) : (
              <>
                <Alert className="border-blue-500">
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                  <AlertDescription className="text-blue-700">
                    For credit-based students, use the "Adjust Credits" option to grant additional free credits instead.
                  </AlertDescription>
                </Alert>
              </>
            )}
            
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
                  disabled={student.paymentModel !== 'course'}
                />
                <span className="text-sm font-medium text-gray-700">
                  {manualOverride.enabled ? 'Mark as paid' : 'Remove override'}
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
                placeholder={student.paymentModel === 'course' 
                  ? "e.g., Payment received via check, Alternative payment arrangement..." 
                  : "Use 'Adjust Credits' for credit-based students"}
                disabled={student.paymentModel !== 'course'}
              />
            </div>
            
            <button
              onClick={handleManualOverride}
              disabled={processing || !manualOverride.reason || student.paymentModel !== 'course'}
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
                  {student.paymentModel === 'course' ? 'Apply Override' : 'Not Available for Credit Students'}
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
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-2/3 lg:w-1/2 xl:w-2/5 overflow-hidden flex flex-col">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle>Payment Actions</SheetTitle>
          <SheetDescription className="flex flex-col gap-1">
            <span>{student.email}</span>
            <span className="text-xs">
              {student.studentType} • {schoolYear} • {student.paymentModel === 'credit' ? 'Credit-Based' : 'Course-Based'}
            </span>
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 px-1">
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

        {activeAction && (
          <div className="border-t pt-4 mt-auto">
            <button
              onClick={() => setActiveAction(null)}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              ← Back to Actions
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default PaymentActions;