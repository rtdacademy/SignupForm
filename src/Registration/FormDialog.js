import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from "../components/ui/alert";
import { Progress } from "../components/ui/progress";
import { Loader2, AlertTriangle, X, InfoIcon, CheckCircle } from "lucide-react";
import { CreditSummaryCard } from '../Dashboard/CreditSummaryCard';
import StudentTypeSelector from './StudentTypeSelector';
import NonPrimaryStudentForm from './NonPrimaryStudentForm';
//import AdultStudentForm from './AdultStudentForm';
import StudentRegistrationReview from './StudentRegistrationReview';
//import { cn } from "../lib/utils";
import { useAuth } from '../context/AuthContext';
import { getDatabase, ref, get, remove, set, update, onValue } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useConversionTracking } from '../components/hooks/use-conversion-tracking';
import { useRegistrationWindows, RegistrationPeriod } from '../utils/registrationPeriods';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { useCreditTracking, getCourseCredits, isExemptCourse } from '../hooks/useCreditTracking';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "../components/ui/sheet";
import { getStudentTypeInfo } from '../config/DropdownOptions';
import {
  GraduationCap,
  Home,
  Sun,
  User,
  Globe
} from 'lucide-react';

const FormDialog = ({ trigger, open, onOpenChange, importantDates, transitionCourse, onTransitionComplete }) => {
  const trackConversion = useConversionTracking();
  const { user, user_email_key } = useAuth();
  const uid = user?.uid;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Required courses state
  const [requiredCourses, setRequiredCourses] = useState([]);
  const [loadingRequiredCourses, setLoadingRequiredCourses] = useState(false);
  // Form state
  const [currentStep, setCurrentStep] = useState('type-selection');
  const [selectedStudentType, setSelectedStudentType] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [formData, setFormData] = useState(null);
  const [existingRegistration, setExistingRegistration] = useState(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const formRef = React.useRef(null);
  
  // Get current school year for credit tracking
  const getCurrentSchoolYear = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    let startYear = month >= 9 ? year : year - 1;
    
    // If we have formData with enrollmentYear, use that
    if (formData?.enrollmentYear) {
      return formData.enrollmentYear;
    }
    
    // Otherwise calculate current year
    return `${startYear.toString().substr(-2)}/${(startYear + 1).toString().substr(-2)}`;
  };
  
  // Use credit tracking hook with student type
  const { creditData, remainingFreeCredits, atCreditLimit, hasLimit } = useCreditTracking(
    getCurrentSchoolYear(),
    selectedStudentType
  );

  // Use the new registration windows hook
  const { 
    getActiveRegistrationWindows, 
    getEffectiveRegistrationPeriod,
    formatDate 
  } = useRegistrationWindows(importantDates);

  // Function to fetch required courses
  const fetchRequiredCourses = async () => {
    if (!user?.email) return [];

    try {
      setLoadingRequiredCourses(true);
      const db = getDatabase();
      const coursesRef = ref(db, 'courses');
      const snapshot = await get(coursesRef);

      if (!snapshot.exists()) return [];

      const coursesData = snapshot.val();
      const required = [];

      // Loop through all courses to find ones with Active:"Required"
      for (const [id, course] of Object.entries(coursesData)) {
        if (course.Active === "Required") {
          // Check if this course should be included for this user
          const includeForUser =
            // Include if allowedEmails doesn't exist (available to everyone)
            !course.allowedEmails ||
            // Include if allowedEmails is empty (available to everyone)
            (Array.isArray(course.allowedEmails) && course.allowedEmails.length === 0) ||
            // Include if user's email is in the allowedEmails list
            (Array.isArray(course.allowedEmails) && course.allowedEmails.includes(user.email));

          if (includeForUser) {
            required.push({
              id,
              courseId: id,
              title: course.Title,
              courseType: course.CourseType,
              credits: course.courseCredits,
              grade: course.grade,
              hasAllowedEmails: !!course.allowedEmails
            });
          }
        }
      }

      setRequiredCourses(required);
      return required;
    } catch (error) {
      console.error('Error fetching required courses:', error);
      return [];
    } finally {
      setLoadingRequiredCourses(false);
    }
  };

  // Effect to fetch required courses when dialog opens
  useEffect(() => {
    if (open && user?.email) {
      fetchRequiredCourses();
    }
  }, [open, user?.email]);

  // Check for existing registration on mount
  useEffect(() => {
    const checkExistingRegistration = async () => {
      if (!open || !uid) return;

      try {
        setLoading(true);
        const db = getDatabase();
        const pendingRegRef = ref(db, `users/${uid}/pendingRegistration`);
        const snapshot = await get(pendingRegRef);

        if (snapshot.exists()) {
          const data = snapshot.val();

          // Skip if already submitted
          if (data.currentStep === 'submitted') {
            setLoading(false);
            return;
          }

          // Validate student type against active registration windows
          const studentType = data.studentType;

          // Check if there are active windows for this student type
          const activeWindows = getActiveRegistrationWindows(studentType);
          const registrationPeriod = getEffectiveRegistrationPeriod(activeWindows);

          let isValid = true;
          let periodMessage = null;

          // Skip validation for Adult and International Students, and for transition re-registrations
          if (!transitionCourse && studentType !== 'Adult Student' && studentType !== 'International Student') {
            isValid = registrationPeriod.hasActiveWindow;

            if (!isValid) {
              periodMessage = `There are currently no active registration windows for ${studentType} students.`;
            }
          }

          if (!isValid) {
            // Invalid registration for current period - clear it and show message
            await remove(pendingRegRef);
            setExistingRegistration(null);
            setSelectedStudentType('');
            setFormData(null);
            setError(`Your previously saved registration as a ${studentType} is no longer valid. ${periodMessage} Please start a new registration.`);
          } else {
            // Registration is valid, restore it
            setExistingRegistration(data);
            setSelectedStudentType(data.studentType);
            setCurrentStep(data.currentStep);
            if (data.formData) {
              setFormData(data.formData);
            }
          }
        }
      } catch (err) {
        console.error('Error checking existing registration:', err);
        setError('Failed to load registration data');
      } finally {
        setLoading(false);
      }
    };

    checkExistingRegistration();
  }, [open, uid, getActiveRegistrationWindows, getEffectiveRegistrationPeriod]);

  // Reset state when dialog is closed
  useEffect(() => {
    if (!open) {
      if (!existingRegistration) {
        setCurrentStep('type-selection');
        setSelectedStudentType('');
        setIsFormValid(false);
        setFormData(null);
      }
      setSubmitting(false);
      setError(null);
    }
  }, [open, existingRegistration]);

  const handleStudentTypeSelect = async (type) => {
    try {
      setSelectedStudentType(type);
      const db = getDatabase();
      const pendingRegRef = ref(db, `users/${uid}/pendingRegistration`);
      await set(pendingRegRef, {
        studentType: type,
        currentStep: 'type-selection',
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving student type:', error);
      setError('Failed to save student type');
    }
  };

  const handleProceed = async () => {
    if (currentStep === 'type-selection' && selectedStudentType) {
      // Skip registration window validation for transition re-registrations
      // as students need to select a new school year on the form page
      if (!transitionCourse) {
        // Verify there's an active registration window (except for Adult/International)
        if (selectedStudentType !== 'Adult Student' && selectedStudentType !== 'International Student') {
          const activeWindows = getActiveRegistrationWindows(selectedStudentType);
          const registrationPeriod = getEffectiveRegistrationPeriod(activeWindows);
          
          if (!registrationPeriod.hasActiveWindow) {
            setError(`There are currently no active registration windows for ${selectedStudentType} students.`);
            return;
          }
        }
      }
      
      setCurrentStep('form');
      try {
        const db = getDatabase();
        const pendingRegRef = ref(db, `users/${uid}/pendingRegistration`);
        await set(pendingRegRef, {
          ...existingRegistration,
          studentType: selectedStudentType,
          currentStep: 'form',
          lastUpdated: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error updating step:', error);
        setError('Failed to proceed to next step');
      }
    }
  };

  const handleBack = async () => {
    try {
      if (currentStep === 'form') {
        setCurrentStep('type-selection');
        const db = getDatabase();
        const pendingRegRef = ref(db, `users/${uid}/pendingRegistration`);
        await remove(pendingRegRef);
        setExistingRegistration(null);
        setFormData(null);
      } else if (currentStep === 'review') {
        setCurrentStep('form');
        const db = getDatabase();
        const pendingRegRef = ref(db, `users/${uid}/pendingRegistration`);
        await set(pendingRegRef, {
          ...existingRegistration,
          currentStep: 'form',
          lastUpdated: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error handling back:', error);
      setError('Failed to go back');
    }
  };

  const handleReview = async () => {
    try {
      const currentFormData = formRef.current?.getFormData();
      console.log('Form data received in handleReview:', {
        registrationSettingsPath: currentFormData?.registrationSettingsPath,
        timeSectionId: currentFormData?.timeSectionId
      });
      
      if (currentFormData) {
        // Ensure the registration settings path is correct
        // If it exists but doesn't include /timeSections/, it might be outdated
        if (currentFormData.registrationSettingsPath && 
            !currentFormData.registrationSettingsPath.includes('/timeSections/') &&
            currentFormData.timeSectionId) {
          console.log('Warning: Registration settings path appears incomplete, missing time section');
        }
        
        setFormData(currentFormData);
        setCurrentStep('review');
        const db = getDatabase();
        const pendingRegRef = ref(db, `users/${uid}/pendingRegistration`);
        await set(pendingRegRef, {
          studentType: selectedStudentType,
          currentStep: 'review',
          formData: currentFormData,
          lastUpdated: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error moving to review:', error);
      setError('Failed to proceed to review');
    }
  };
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setCompletionPercentage(100); // Show 100% completion during submission
      setError(null);

      const db = getDatabase();
      const pendingRegRef = ref(db, `users/${uid}/pendingRegistration`);
      const snapshot = await get(pendingRegRef);

      if (snapshot.exists()) {
        const registrationData = snapshot.val();
        console.log('Retrieved registration data from pending:', {
          registrationSettingsPath: registrationData.formData.registrationSettingsPath,
          timeSectionId: registrationData.formData.timeSectionId,
          studentType: registrationData.formData.studentType,
          enrollmentYear: registrationData.formData.enrollmentYear
        });

        // Call the cloud function to handle secure registration
        const functions = getFunctions();
        const submitRegistration = httpsCallable(functions, 'submitStudentRegistration');
        
        const result = await submitRegistration({
          registrationData: registrationData
        });

        console.log('Registration submitted successfully:', result.data);

        trackConversion();

        // If this was a transition re-registration, set up listeners for completion
        if (result.data.isTransition && registrationData.formData?.courseId) {
          const studentKey = sanitizeEmail(user.email);
          const courseId = registrationData.formData.courseId;
          
          console.log('Setting up transition listeners for:', { studentKey, courseId });
          
          // Listen for transition flag removal
          const transitionRef = ref(db, `students/${studentKey}/courses/${courseId}/transition`);
          const statusRef = ref(db, `students/${studentKey}/courses/${courseId}/Status/Value`);
          const activeFutureRef = ref(db, `students/${studentKey}/courses/${courseId}/ActiveFutureArchived/Value`);
          
          let transitionListener = null;
          let statusListener = null;
          let activeFutureListener = null;
          let cleanupDone = false;
          
          // Cleanup function
          const cleanup = () => {
            if (cleanupDone) return;
            cleanupDone = true;
            
            if (transitionListener) transitionListener();
            if (statusListener) statusListener();
            if (activeFutureListener) activeFutureListener();
            
            // Call the callback if provided
            if (onTransitionComplete) {
              onTransitionComplete(studentKey, courseId);
            }
          };
          
          // Listen for transition flag removal (primary indicator)
          transitionListener = onValue(transitionRef, (snapshot) => {
            console.log('Transition flag value:', snapshot.val());
            if (!snapshot.exists() || snapshot.val() === null) {
              console.log('Transition flag removed - update complete');
              cleanup();
            }
          });
          
          // Also listen for status change as backup
          statusListener = onValue(statusRef, (snapshot) => {
            if (snapshot.val() === "Re-enrolled") {
              console.log('Status changed to Re-enrolled');
              // Small delay to ensure all updates are complete
              setTimeout(cleanup, 500);
            }
          });
          
          // Listen for ActiveFutureArchived change
          activeFutureListener = onValue(activeFutureRef, (snapshot) => {
            if (snapshot.val() === "Registration") {
              console.log('ActiveFutureArchived changed to Registration');
              // Small delay to ensure all updates are complete
              setTimeout(cleanup, 500);
            }
          });
          
          // Set timeout to clean up listeners after 30 seconds (failsafe)
          setTimeout(() => {
            console.log('Cleanup timeout reached');
            cleanup();
          }, 30000);
        }

        // Reset all form state
        setCurrentStep('type-selection');
        setSelectedStudentType('');
        setIsFormValid(false);
        setFormData(null);
        setExistingRegistration(null);
        setCompletionPercentage(0);

        // Close the dialog
        onOpenChange(false);
      } else {
        throw new Error('Registration data not found');
      }
    } catch (error) {
      console.error('Error submitting registration:', error);
      
      // Handle specific blacklist error
      if (error.code === 'functions/permission-denied' && 
          error.message.includes('Registration not permitted')) {
        setError('We are unable to process your registration at this time. Please contact the school administration for assistance.');
      } else {
        setError(error.message || 'Failed to submit registration. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (existingRegistration && currentStep !== 'type-selection') {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onOpenChange(false);
      }
    } else {
      onOpenChange(false);
    }
  };  // Track completion percentage from form
  useEffect(() => {
    const trackProgress = () => {
      if (formRef.current && currentStep === 'form') {
        try {
          const percentage = formRef.current.getCompletionPercentage?.() || 0;
          setCompletionPercentage(percentage);
        } catch (error) {
          console.error('Error getting completion percentage:', error);
        }
      } else {
        // Set progress based on current step
        if (currentStep === 'type-selection') {
          setCompletionPercentage(selectedStudentType ? 10 : 0);
        } else if (currentStep === 'review') {
          setCompletionPercentage(95);
        }
      }
    };

    // Track progress immediately
    trackProgress();

    // Set up interval to track progress periodically while on form step
    const interval = currentStep === 'form' ? setInterval(trackProgress, 1000) : null;

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [currentStep, selectedStudentType]);

  const renderContent = () => {
    if (currentStep === 'review') {
      return (
        <StudentRegistrationReview
          onBack={handleBack}
          formData={formData}
          studentType={selectedStudentType}
          importantDates={importantDates}
          requiredCourses={requiredCourses}
          loadingRequiredCourses={loadingRequiredCourses}
          transitionCourse={transitionCourse}
        />
      );
    }

    if (currentStep === 'type-selection') {
      return (
        <StudentTypeSelector 
          onStudentTypeSelect={handleStudentTypeSelect} 
          selectedType={selectedStudentType}
          isFormComponent={true} 
          importantDates={importantDates}
          transitionCourse={transitionCourse}
        />
      );
    }

    switch (selectedStudentType) {
      case 'Non-Primary':
      case 'Home Education':
      case 'Adult Student':
      case 'Summer School':
      case 'International Student': 
        return (
          <NonPrimaryStudentForm 
            ref={formRef}
            initialData={formData}
            onValidationChange={setIsFormValid}
            studentType={selectedStudentType}
            importantDates={importantDates}
            transitionCourse={transitionCourse}
            onSave={async (data) => {
              const db = getDatabase();
              const pendingRegRef = ref(db, `users/${uid}/pendingRegistration`);
              await set(pendingRegRef, {
                studentType: selectedStudentType,
                currentStep: 'form',
                formData: data,
                transitionCourse: transitionCourse,
                lastUpdated: new Date().toISOString()
              });
            }}
          />
        );
      
      default:
        return null;
    }
  };

  const renderFooterButtons = () => {
    return (
      <div className="flex justify-end gap-2">
        {currentStep !== 'type-selection' && (
          <Button 
            variant="outline" 
            onClick={handleBack}
          >
            Back
          </Button>
        )}
        <Button 
          variant="outline" 
          onClick={handleClose}
        >
          Cancel
        </Button>
        {currentStep === 'review' ? (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Registration'
            )}
          </Button>
        ) : (
          <Button 
            onClick={currentStep === 'type-selection' ? handleProceed : handleReview}
            disabled={
              (currentStep === 'type-selection' && !selectedStudentType) ||
              (currentStep === 'form' && !isFormValid && completionPercentage < 100)
            }
          >
            {currentStep === 'type-selection' ? 'Proceed' : 'Review'}
          </Button>
        )}
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent 
        className="w-full sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl flex flex-col h-full overflow-hidden"
        side="right"
      >
        {loading ? (
          <div className="flex items-center justify-center p-8 h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Header Section */}
          {/* Header Section */}
<SheetHeader className="px-1 pb-4">  {currentStep === 'form' && selectedStudentType && (
    <div className="flex items-center justify-between mb-3">
      {(() => {
        const { color, icon: Icon, description } = getStudentTypeInfo(selectedStudentType);
        return (
          <div 
            className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium mb-2"
            style={{ backgroundColor: `${color}15`, color: color }}
          >
            {Icon && <Icon className="h-4 w-4 mr-2" />}
            {selectedStudentType} Student Registration
          </div>
        );
      })()}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleBack} 
        className="bg-customGreen-light border-customGreen-medium text-customGreen-dark hover:bg-customGreen-medium hover:text-white hover:border-customGreen-dark transition-all duration-200 font-medium shadow-sm"
      >
        ✏️ Change Student Type
      </Button>
    </div>
  )}
  {currentStep !== 'form' && (
    <>
      <div className="text-2xl font-semibold">
        {transitionCourse ? 
          (currentStep === 'type-selection' ? 'Course Re-registration' : 'Review Re-registration') :
          (currentStep === 'type-selection' ? 'Student Information Form' : 'Review Registration')}
      </div>
      <div className="text-gray-600 text-sm">
        {transitionCourse ? (
          currentStep === 'type-selection' ?
            `Re-registering for ${transitionCourse.courseName} - Please select your student type for the next school year` :
            'Please review your re-registration information before submitting'
        ) : (
          currentStep === 'type-selection' ?
            'Please determine your student type' :
            'Please review your information before submitting'
        )}
      </div>
    </>  )}
</SheetHeader>
            {/* Credit Usage Display for Non-Primary and Home Education */}
            {currentStep === 'form' && 
             hasLimit && (
              <div className="mx-1 mb-3">
                <CreditSummaryCard 
                  schoolYear={getCurrentSchoolYear()}
                  compactMode={true}
                  fullWidth={true}
                />
              </div>
            )}
            
            {/* Compact Progress Bar - Only show during form step */}
            {currentStep === 'form' && (
              <div className="px-1 pb-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">Form Completion</span>
                    <span className="text-customGreen-dark font-medium">{completionPercentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-customGreen-medium to-customGreen-dark transition-all duration-300"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Content Section - Scrollable */}
            <div className="flex-1 overflow-y-auto pr-1">
              {renderContent()}
            </div>

            {/* Footer Section - Always Visible */}
            <SheetFooter className="pt-4 mt-auto border-t bg-white">
              {renderFooterButtons()}

              {error && (
                <Alert className="mt-4 bg-red-50 border-red-200">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-sm text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
            </SheetFooter>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default FormDialog;