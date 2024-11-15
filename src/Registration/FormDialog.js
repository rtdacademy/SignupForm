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

        // Build the 'profile' data with conditional parent info for adult students
        const profileData = {
          "LastSync": new Date().toISOString(),
          "ParentEmail": selectedStudentType === 'Adult Student' && !registrationData.formData.includeParentInfo 
            ? '' 
            : registrationData.formData.parentEmail || '',
          "ParentPermission_x003f_": {
            "Id": selectedStudentType === 'Adult Student' ? 1 : 2,
            "Value": selectedStudentType === 'Adult Student' ? "Not Required" : "No Approval Yet"
          },
          "ParentPhone_x0023_": selectedStudentType === 'Adult Student' && !registrationData.formData.includeParentInfo 
            ? '' 
            : registrationData.formData.parentPhone || '',
          "ParentFirstName": selectedStudentType === 'Adult Student' && !registrationData.formData.includeParentInfo 
            ? '' 
            : registrationData.formData.parentFirstName || '',
          "ParentLastName": selectedStudentType === 'Adult Student' && !registrationData.formData.includeParentInfo 
            ? '' 
            : registrationData.formData.parentLastName || '',
          "age": registrationData.formData.age || '',
          "birthday": registrationData.formData.birthday || '',
          "StudentEmail": user.email,
          "StudentPhone": registrationData.formData.phoneNumber || '',
          "asn": registrationData.formData.albertaStudentNumber || '',
          "firstName": registrationData.formData.firstName || '',
          // Set preferredFirstName to firstName if it's empty, null, or undefined
          "preferredFirstName": registrationData.formData.preferredFirstName || registrationData.formData.firstName || '',
          "lastName": registrationData.formData.lastName || '',
          "originalEmail": user.email
        };
  
        // Build the 'courses' data with adult-specific adjustments
        const courseId = registrationData.formData.courseId;
        const courseData = {
          "inOldSharePoint": false,
          "ActiveFutureArchived": {
            "Id": 1,
            "Value": "Registration"
          },
          "Course": {
            "Id": Number(courseId),
            "Value": registrationData.formData.courseName || ''
          },
          "CourseID": Number(courseId),
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
            "Id": selectedStudentType === 'Adult Student' ? 1 : (registrationData.formData.age >= 18 ? 1 : 2),
            "Value": registrationData.formData.age >= 18 ? "Yes" : "No"
          },
          "PASI": {
            "Id": 1,
            "Value": "No"
          },
          // Only include school-related fields for non-adult students
          ...(selectedStudentType !== 'Adult Student' && {
            "primarySchoolName": registrationData.formData.schoolAddress?.name || '',
            "primarySchoolAddress": registrationData.formData.schoolAddress?.fullAddress || '',
            "primarySchoolPlaceId": registrationData.formData.schoolAddress?.placeId || '',
            "School_x0020_Year": {
              "Id": 1,
              "Value": registrationData.formData.enrollmentYear || ''
            }
          }),
          "jsonStudentNotes": [
            {
              "author": `${registrationData.formData.firstName} ${registrationData.formData.lastName}`,
              "content": `📝 Student completed the registration form.${
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
  
        // Write to 'students/student_email_key/profile'
        const studentProfileRef = ref(db, `students/${studentEmailKey}/profile`);
        await set(studentProfileRef, profileData);
  
        // Write to 'students/student_email_key/courses/${courseId}'
        const studentCourseRef = ref(db, `students/${studentEmailKey}/courses/${courseId}`);
        await set(studentCourseRef, courseData);
  
        // Remove the pendingRegistration node
        await remove(pendingRegRef);
  
        // Close the dialog
        onOpenChange(false);
      } else {
        setError('Registration data not found');
      }
    } catch (error) {
      console.error('Error submitting registration:', error);
      setError('Failed to submit registration. Please try again.');
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
        />
      );
    }

    switch (selectedStudentType) {
      case 'Non-Primary':
        return (
          <NonPrimaryStudentForm 
            ref={formRef}
            initialData={formData}
            onValidationChange={setIsFormValid}
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
      case 'Adult Student':
        return (
          <AdultStudentForm 
            ref={formRef}
            initialData={formData}
            onValidationChange={setIsFormValid}
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
      case 'Home Education':
        return <div>Home Education Form Coming Soon...</div>;
      case 'Summer School':
        return <div>Summer School Form Coming Soon...</div>;
      case 'International Student':
        return <div>International Student Form Coming Soon. Please email stan@rtdacademy.com to see how you can register as an international student.</div>;
      default:
        return null;
    }
  };

  const renderFooterButtons = () => {
    return (
      <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
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
            "translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg",
            "duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            "overflow-hidden"
          )}
        >
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
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
                    ? `${selectedStudentType} Student Registration`
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

              <div className={cn(
                "overflow-y-auto",
                "max-h-[calc(90vh-200px)] py-6"
              )}>
                {renderContent()}
              </div>

              {renderFooterButtons()}

              {error && (
                <Alert className="mt-4 bg-red-50 border-red-200">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-sm text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {!loading && (
                <DialogPrimitive.Close 
                  className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                  onClick={handleClose}
                >
                  <Cross2Icon className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              )}
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default FormDialog;
