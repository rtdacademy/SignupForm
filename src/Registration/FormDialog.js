import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from "../components/ui/alert";
import { Loader2, AlertTriangle, X } from "lucide-react";
import StudentTypeSelector from './StudentTypeSelector';
import NonPrimaryStudentForm from './NonPrimaryStudentForm';
import AdultStudentForm from './AdultStudentForm';
import StudentRegistrationReview from './StudentRegistrationReview';
import { cn } from "../lib/utils";
import { useAuth } from '../context/AuthContext';
import { getDatabase, ref, get, remove, set } from 'firebase/database';
import { useConversionTracking } from '../components/hooks/use-conversion-tracking';
import { useRegistrationWindows, RegistrationPeriod } from '../utils/registrationPeriods';
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

const FormDialog = ({ trigger, open, onOpenChange, importantDates }) => {
  const trackConversion = useConversionTracking();
  const { user, user_email_key } = useAuth();
  const uid = user?.uid;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [currentStep, setCurrentStep] = useState('type-selection');
  const [selectedStudentType, setSelectedStudentType] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [formData, setFormData] = useState(null);
  const [existingRegistration, setExistingRegistration] = useState(null);
  const formRef = React.useRef(null);

  // Use the new registration windows hook
  const { 
    getActiveRegistrationWindows, 
    getEffectiveRegistrationPeriod,
    formatDate 
  } = useRegistrationWindows(importantDates);

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
          
          // Skip validation for Adult and International Students
          if (studentType !== 'Adult Student' && studentType !== 'International Student') {
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
      // Verify there's an active registration window (except for Adult/International)
      if (selectedStudentType !== 'Adult Student' && selectedStudentType !== 'International Student') {
        const activeWindows = getActiveRegistrationWindows(selectedStudentType);
        const registrationPeriod = getEffectiveRegistrationPeriod(activeWindows);
        
        if (!registrationPeriod.hasActiveWindow) {
          setError(`There are currently no active registration windows for ${selectedStudentType} students.`);
          return;
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
      if (currentFormData) {
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
      setError(null);
  
      const db = getDatabase();
      const pendingRegRef = ref(db, `users/${uid}/pendingRegistration`);
      const snapshot = await get(pendingRegRef);
  
      if (snapshot.exists()) {
        const registrationData = snapshot.val();
        const studentEmailKey = user_email_key;
  
        // Validate courseId
        const courseId = registrationData.formData.courseId;
        if (!courseId) {
          throw new Error('Course ID is required');
        }
  
        // Ensure courseId is a valid number
        const numericCourseId = Number(courseId);
        if (isNaN(numericCourseId)) {
          throw new Error('Invalid Course ID format');
        }
  
        // Check if course already exists
        const existingCourseRef = ref(db, `students/${studentEmailKey}/courses/${numericCourseId}`);
        const existingCourseSnapshot = await get(existingCourseRef);
        
        if (existingCourseSnapshot.exists()) {
          throw new Error('You are already registered for this course');
        }
  
        // Build the 'profile' data
        const profileData = {
          "LastSync": new Date().toISOString(),
          "ParentEmail": registrationData.formData.parentEmail || '',
          "ParentPermission_x003f_": {
            "Id": registrationData.formData.age >= 18 ? 1 : 2,
            "Value": registrationData.formData.age >= 18 ? "Not Required" : "No Approval Yet"
          },
          "ParentPhone_x0023_": registrationData.formData.parentPhone || '',
          "ParentFirstName": registrationData.formData.parentFirstName || '',
          "ParentLastName": registrationData.formData.parentLastName || '',
          "preferredFirstName": registrationData.formData.preferredFirstName || registrationData.formData.firstName,
          "age": registrationData.formData.age || '',
          "birthday": registrationData.formData.birthday || '',
          "StudentEmail": user.email,
          "StudentPhone": registrationData.formData.phoneNumber || '',
          "asn": registrationData.formData.albertaStudentNumber || '',
          "gender": registrationData.formData.gender || '',
          "firstName": registrationData.formData.firstName || '',
          "lastName": registrationData.formData.lastName || '',
          "originalEmail": user.email,
          "uid": uid,
          // Add international student information to profile if applicable
          ...(registrationData.studentType === 'International Student' && {
            "internationalDocuments": {
              "passport": registrationData.formData.documents?.passport || '',
              "additionalID": registrationData.formData.documents?.additionalID || '',
              "residencyProof": registrationData.formData.documents?.residencyProof || '',
              "countryOfOrigin": registrationData.formData.country || ''
            }
          })
        };
  
        // Build the 'courses' data
        const courseData = {
          "inOldSharePoint": false,
          "ActiveFutureArchived": {
            "Id": 1,
            "Value": "Registration"
          },
          "Course": {
            "Id": numericCourseId,
            "Value": registrationData.formData.courseName || ''
          },
          "CourseID": numericCourseId,
          "Created": new Date().toISOString(),
          "ScheduleStartDate": registrationData.formData.startDate || '',
          "ScheduleEndDate": registrationData.formData.endDate || '',
          "StudentType": {
            "Id": 1,
            "Value": registrationData.formData.studentType || ''
          },
          "Status": {
            "Id": 1,
            "Value": "Newly Enrolled"
          },
          "Over18_x003f_": {
            "Id": registrationData.studentType === 'Adult Student' ? 1 : (registrationData.formData.age >= 18 ? 1 : 2),
            "Value": registrationData.formData.age >= 18 ? "Yes" : "No"
          },
          "PASI": {
            "Id": 1,
            "Value": "No"
          },
          "School_x0020_Year": {
            "Id": 1,
            "Value": registrationData.formData.enrollmentYear || ''
          },
          // Single DiplomaMonthChoices conditional that only adds if there's data
          ...(registrationData.formData.diplomaMonth && {
            "DiplomaMonthChoices": {
              "Id": 1,
              "Value": registrationData.formData.diplomaMonth.alreadyWrote 
                ? "Already Wrote"
                : registrationData.formData.diplomaMonth.month || ""
            }
          }),
          ...(registrationData.studentType !== 'Adult Student' && {
            "primarySchoolName": registrationData.formData.schoolAddress?.name || '',
            "primarySchoolAddress": registrationData.formData.schoolAddress?.fullAddress || '',
            "primarySchoolPlaceId": registrationData.formData.schoolAddress?.placeId || ''
          }),
          "jsonStudentNotes": [
            {
              "author": `${registrationData.formData.firstName} ${registrationData.formData.lastName}`,
              "content": `Student completed the registration form.${
                registrationData.formData.additionalInformation
                  ? '\n\nAdditional Information:\n' + registrationData.formData.additionalInformation
                  : ''
              }`,
              "id": `note-${Date.now()}`,
              "noteType": "📝",
              "timestamp": new Date().toISOString()
            }
          ]
        };
        // Write data using separate set operations
        const studentProfileRef = ref(db, `students/${studentEmailKey}/profile`);
        const studentCourseRef = ref(db, `students/${studentEmailKey}/courses/${numericCourseId}`);
  
        // Use Promise.all to perform both writes atomically
        await Promise.all([
          set(studentProfileRef, profileData),
          set(studentCourseRef, courseData)
        ]);

        trackConversion();
  
        // Remove the pendingRegistration node
        await remove(pendingRegRef);
  
        // Reset all form state
        setCurrentStep('type-selection');
        setSelectedStudentType('');
        setIsFormValid(false);
        setFormData(null);
        setExistingRegistration(null);
  
        // Close the dialog
        onOpenChange(false);
      } else {
        throw new Error('Registration data not found');
      }
    } catch (error) {
      console.error('Error submitting registration:', error);
      setError(error.message || 'Failed to submit registration. Please try again.');
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
  };

  const renderContent = () => {
    if (currentStep === 'review') {
      return (
        <StudentRegistrationReview 
          onBack={handleBack}
          formData={formData}
          studentType={selectedStudentType}
          importantDates={importantDates}
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
            onSave={async (data) => {
              const db = getDatabase();
              const pendingRegRef = ref(db, `users/${uid}/pendingRegistration`);
              await set(pendingRegRef, {
                studentType: selectedStudentType,
                currentStep: 'form',
                formData: data,
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
              (currentStep === 'form' && !isFormValid)
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
        className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl flex flex-col h-full overflow-hidden"
        side="right"
      >
        {loading ? (
          <div className="flex items-center justify-center p-8 h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Header Section */}
            <SheetHeader className="px-1 pb-4">
              <SheetTitle className="text-2xl font-semibold">
                {currentStep === 'type-selection'
                  ? 'Student Information Form'
                  : currentStep === 'form'
                  ? selectedStudentType === 'Home Education'
                    ? 'Home Education Student Registration'
                    : `${selectedStudentType} Student Registration`
                  : 'Review Registration'}
              </SheetTitle>
              <SheetDescription className="text-gray-600">
                {currentStep === 'type-selection'
                  ? 'Please determine your student type'
                  : currentStep === 'form'
                  ? 'Please fill out your registration information'
                  : 'Please review your information before submitting'}
              </SheetDescription>
            </SheetHeader>

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