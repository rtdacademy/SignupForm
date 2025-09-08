import React, { useState, useEffect } from 'react';
import { getDatabase, ref, set, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { COURSE_OPTIONS } from '../config/DropdownOptions';
import { 
  AlertTriangle,
  AlertCircle,
  Check,
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
  
  // Load existing overrides on mount
  useEffect(() => {
    loadExistingOverrides();
    
    // Reset form state when component unmounts
    return () => {
      setCreditAdjustment({ amount: 0, reason: '' });
      setManualOverride({ enabled: false, reason: '', selectedCourses: [] });
      setActiveAction(null);
      setMessage(null);
    };
  }, [student, schoolYear]);

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

  const handleRemoveOverride = async () => {
    if (manualOverride.selectedCourses.length === 0) {
      setMessage({ type: 'error', text: 'Please select courses to remove override' });
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
      
      // Remove overrides for selected courses
      for (const courseId of manualOverride.selectedCourses) {
        const overridePath = `students/${emailKey}/profile/creditOverrides/${schoolYearKey}/${student.typeKey}/courseOverrides/${courseId}`;
        await set(ref(db, overridePath), null);
      }
      
      // Log the removal action
      const overrideLogId = Date.now();
      const logPath = `paymentOverrides/${emailKey}/${overrideLogId}`;
      await set(ref(db, logPath), {
        action: 'removed',
        removedCourses: manualOverride.selectedCourses,
        removedBy: currentUserEmail,
        timestamp: Date.now(),
        schoolYear,
        studentType: student.typeKey
      });
      
      // Trigger credit recalculation
      await set(ref(db, `creditRecalculations/${emailKey}/trigger`), Date.now());
      
      setMessage({ 
        type: 'success', 
        text: `Override removed for ${manualOverride.selectedCourses.length} course(s)` 
      });
      
      // Reset and go back to main override view
      setTimeout(() => {
        setManualOverride({ enabled: false, reason: '', selectedCourses: [] });
        loadExistingOverrides(); // Reload to show updated state
        setActiveAction('override');
      }, 1500);
    } catch (error) {
      console.error('Error removing override:', error);
      setMessage({ type: 'error', text: 'Failed to remove override' });
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
          
          // When submitting with courses and reason, we're enabling the override
          const overrideData = {
            isPaid: true,
            reason: manualOverride.reason,
            overriddenBy: currentUserEmail,
            overriddenAt: Date.now(),
            schoolYear: schoolYear // Store the school year for clarity
          };
          
          await set(ref(db, overridePath), overrideData);
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
        action: 'enabled', // Always 'enabled' when applying override
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
        text: 'Payment override enabled successfully' 
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
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></span>
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

      case 'removeOverride':
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700">Remove Payment Overrides</h3>
            
            <p className="text-sm text-gray-600">
              Remove payment overrides for selected courses in <strong>{schoolYear}</strong> school year.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Courses to Remove Override
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                {Object.entries(existingOverride?.data || {}).map(([courseId, override]) => {
                  const courseInfo = COURSE_OPTIONS.find(c => c.courseId === parseInt(courseId));
                  const courseName = courseInfo?.label || `Course ${courseId}`;
                  
                  return (
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
                        {courseName}
                        <span className="text-gray-500 ml-2 text-xs">
                          (by {override.overriddenBy} on {new Date(override.overriddenAt).toLocaleDateString()})
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {manualOverride.selectedCourses.length === 0 
                  ? 'Select courses to remove override' 
                  : `${manualOverride.selectedCourses.length} course(s) selected for removal`}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveAction('override')}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveOverride}
                disabled={processing || manualOverride.selectedCourses.length === 0}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></span>
                    Removing...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4" />
                    Remove Override
                  </>
                )}
              </button>
            </div>
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

                {/* Show existing overrides if any */}
                {existingOverride && existingOverride.type === 'course' && (
                  <Alert className="border-yellow-500">
                    <Shield className="h-4 w-4 text-yellow-500" />
                    <AlertDescription className="text-yellow-700">
                      <strong>Existing Overrides:</strong><br />
                      {Object.entries(existingOverride.data).map(([courseId, override]) => {
                        const courseInfo = COURSE_OPTIONS.find(c => c.courseId === parseInt(courseId));
                        const courseName = courseInfo?.label || `Course ${courseId}`;
                        return (
                          <div key={courseId} className="text-sm mt-1">
                            • {courseName}: Marked as paid by {override.overriddenBy} on {new Date(override.overriddenAt).toLocaleDateString()}
                          </div>
                        );
                      })}
                    </AlertDescription>
                  </Alert>
                )}
            
                {/* Course selection for per-course payment students */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Courses to Mark as Paid
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                    {Object.entries(student.courses || {}).map(([courseId, courseData]) => {
                      // Try to find the course in COURSE_OPTIONS by courseId
                      const courseInfo = COURSE_OPTIONS.find(c => c.courseId === parseInt(courseId));
                      const courseName = courseInfo?.label || courseData.courseName || `Course ${courseId}`;
                      const hasOverride = existingOverride?.data?.[courseId];
                      
                      return (
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
                            {courseName}
                            {hasOverride && <span className="text-green-600 ml-2">(Currently Overridden)</span>}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {manualOverride.selectedCourses.length === 0 
                      ? 'Select courses to mark as paid' 
                      : `${manualOverride.selectedCourses.length} course(s) selected`}
                  </p>
                </div>

                {/* Add button to remove overrides */}
                {existingOverride && existingOverride.type === 'course' && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setActiveAction('removeOverride')}
                      className="text-sm text-red-600 hover:text-red-700 underline"
                    >
                      Remove existing overrides for selected courses
                    </button>
                  </div>
                )}
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
              disabled={processing || !manualOverride.reason || student.paymentModel !== 'course' || manualOverride.selectedCourses.length === 0}
              className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></span>
                  Processing...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  {student.paymentModel === 'course' ? 
                    (manualOverride.selectedCourses.length === 0 ? 'Select Courses First' : 'Mark Selected as Paid') : 
                    'Not Available for Credit Students'}
                </>
              )}
            </button>
          </div>
        );



      default:
        // Show different actions based on student payment model
        // Credit-based (Primary/Home Ed): Show only Adjust Credits
        // Course-based (Adult/International): Show only Manual Override
        return (
          <div className="grid grid-cols-1 gap-4">
            {student.paymentModel === 'credit' ? (
              // For Primary and Home Ed students - show Adjust Credits only
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
                    <p className="text-sm text-gray-600">Grant additional free credits for this student</p>
                  </div>
                </div>
              </button>
            ) : (
              // For Adult and International students - show Manual Override only
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
                    <p className="text-sm text-gray-600">Mark courses as paid without processing payment</p>
                  </div>
                </div>
              </button>
            )}
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