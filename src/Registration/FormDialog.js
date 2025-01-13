import React, { useState, useEffect } from 'react';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from "../components/ui/alert";
import { Loader2, AlertTriangle } from "lucide-react";
import StudentTypeSelector from './StudentTypeSelector';
import NonPrimaryStudentForm from './NonPrimaryStudentForm';
import AdultStudentForm from './AdultStudentForm';
import StudentRegistrationReview from './StudentRegistrationReview';
import { cn } from "../lib/utils";
import { useAuth } from '../context/AuthContext';
import { getDatabase, ref, get, remove, set } from 'firebase/database';

const FormDialog = ({ trigger, open, onOpenChange }) => {
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

  // Check for existing registration on mount
  useEffect(() => {
    const checkExistingRegistration = async () => {
      try {
        setLoading(true);
        const db = getDatabase();
        const pendingRegRef = ref(db, `users/${uid}/pendingRegistration`);
        const snapshot = await get(pendingRegRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          // Only restore if not submitted
          if (data.currentStep !== 'submitted') {
            setExistingRegistration(data);
            setSelectedStudentType(data.studentType);
            setCurrentStep(data.currentStep);
            setFormData(data.formData);
          }
        }
      } catch (err) {
        console.error('Error checking existing registration:', err);
        setError('Failed to load registration data');
      } finally {
        setLoading(false);
      }
    };

    if (open && uid) {
      checkExistingRegistration();
    }
  }, [open, uid]);

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
        />
      );
    }

    if (currentStep === 'type-selection') {
      return (
        <StudentTypeSelector 
          onStudentTypeSelect={handleStudentTypeSelect} 
          selectedType={selectedStudentType}
          isFormComponent={true} 
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
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Trigger asChild>
        {trigger}
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay 
          className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" 
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-[102] grid w-[90vw] max-w-[1000px] max-h-[90vh]",
            "translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white shadow-lg",
            "duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            "flex flex-col" // Added flex column
          )}
        >
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col h-full max-h-[90vh]"> {/* Wrapper div with flex */}
              {/* Header Section */}
              <div className="p-6 pb-0">
                {existingRegistration && currentStep === 'type-selection' && (
                  <Alert className="mb-6 bg-blue-50 border-blue-200">
                    <AlertDescription className="text-sm text-blue-700">
                      You have an incomplete registration from{' '}
                      {new Date(existingRegistration.lastUpdated).toLocaleString()}.
                      Click 'Proceed' to continue where you left off.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="mb-6">
                  <DialogPrimitive.Title className="text-2xl font-semibold">
                    {currentStep === 'type-selection'
                      ? 'Student Information Form'
                      : currentStep === 'form'
                      ? selectedStudentType === 'Home Education'
                        ? 'Home Education Student Registration'
                        : `${selectedStudentType} Student Registration`
                      : 'Review Registration'}
                  </DialogPrimitive.Title>
                  <DialogPrimitive.Description className="text-gray-600">
                    {currentStep === 'type-selection'
                      ? 'Please determine your student type'
                      : currentStep === 'form'
                      ? 'Please fill out your registration information'
                      : 'Please review your information before submitting'}
                  </DialogPrimitive.Description>
                </div>
              </div>

              {/* Content Section - Scrollable */}
              <div className="flex-1 overflow-y-auto px-6">
                {renderContent()}
              </div>

              {/* Footer Section - Always Visible */}
              <div className="p-6 pt-4 mt-auto border-t bg-white">
                {renderFooterButtons()}

                {error && (
                  <Alert className="mt-4 bg-red-50 border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-sm text-red-700">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {!loading && (
                <DialogPrimitive.Close 
                  className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                  onClick={handleClose}
                >
                  <Cross2Icon className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              )}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default FormDialog;
