import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from "../components/ui/alert";
import { Progress } from "../components/ui/progress";
import { Loader2, AlertTriangle, X, InfoIcon, CheckCircle } from "lucide-react";
import StudentTypeSelector from './StudentTypeSelector';
import NonPrimaryStudentForm from './NonPrimaryStudentForm';
//import AdultStudentForm from './AdultStudentForm';
import StudentRegistrationReview from './StudentRegistrationReview';
//import { cn } from "../lib/utils";
import { useAuth } from '../context/AuthContext';
import { getDatabase, ref, get, remove, set, update } from 'firebase/database';
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
import { getStudentTypeInfo } from '../config/DropdownOptions';
import {
  GraduationCap,
  Home,
  Sun,
  User,
  Globe
} from 'lucide-react';

const FormDialog = ({ trigger, open, onOpenChange, importantDates }) => {
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
          enrollmentYear: registrationData.formData.enrollmentYear,
          // Log new fields to verify they're being passed
          indigenousStatus: registrationData.formData.indigenousStatus,
          studentPhoto: registrationData.formData.studentPhoto,
          albertaResident: registrationData.formData.albertaResident,
          parentRelationship: registrationData.formData.parentRelationship,
          howDidYouHear: registrationData.formData.howDidYouHear
        });
        
        // Validate the registration settings path
        if (registrationData.formData.registrationSettingsPath && 
            !registrationData.formData.registrationSettingsPath.includes('/timeSections/') &&
            registrationData.formData.timeSectionId) {
          console.warn('WARNING: Registration settings path is missing time section, this may be incorrect');
        }
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
          // Add address information if provided
          ...(registrationData.formData.address && {
            "address": registrationData.formData.address
          }),
          // Add new registration fields
          "studentPhoto": registrationData.formData.studentPhoto || '',
          "albertaResident": registrationData.formData.albertaResident || false,
          "parentRelationship": registrationData.formData.parentRelationship || '',
          "isLegalGuardian": registrationData.formData.isLegalGuardian || false,
          "hasLegalRestrictions": registrationData.formData.hasLegalRestrictions || '',
          "legalDocumentUrl": registrationData.formData.legalDocumentUrl || '',
          "indigenousIdentification": registrationData.formData.indigenousIdentification || '',
          "indigenousStatus": registrationData.formData.indigenousStatus || '',
          "citizenshipDocuments": registrationData.formData.citizenshipDocuments || [],
          "howDidYouHear": registrationData.formData.howDidYouHear || '',
          "whyApplying": registrationData.formData.whyApplying || '',
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
        console.log('Building course data with registration settings:', {
          registrationSettingsPath: registrationData.formData.registrationSettingsPath,
          timeSectionId: registrationData.formData.timeSectionId,
          studentType: registrationData.formData.studentType,
          enrollmentYear: registrationData.formData.enrollmentYear
        });
        
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
          // Add Term information
          "Term": registrationData.formData.term || 'Full Year',
          // Single DiplomaMonthChoices conditional that only adds if there's data
          ...(registrationData.formData.diplomaMonth && {
            "DiplomaMonthChoices": {
              "Id": 1,
              "Value": registrationData.formData.diplomaMonth.alreadyWrote
                ? "Already Wrote"
                : registrationData.formData.diplomaMonth.month || ""
            }
          }),
          // Add registration settings information
          ...(registrationData.formData.registrationSettingsPath && {
            "registrationSettingsPath": registrationData.formData.registrationSettingsPath,
            "timeSectionId": registrationData.formData.timeSectionId || null
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
              }${
                requiredCourses.length > 0
                  ? '\n\nAuto-enrolled in required courses.'
                  : ''
              }`,
              "id": `note-${Date.now()}`,
              "noteType": "📝",
              "timestamp": new Date().toISOString()
            }
          ]
        };
        
        console.log('Final course data to be saved:', courseData);
        console.log('Final profile data to be saved:', profileData);

        // Prepare profile updates object
        const profileUpdates = {};
        
        // Helper function to flatten nested objects for Firebase update
        const flattenObject = (obj, prefix = '') => {
          Object.keys(obj).forEach(key => {
            const value = obj[key];
            const path = prefix ? `${prefix}/${key}` : key;
            
            if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
              // Recursively flatten nested objects
              flattenObject(value, path);
            } else {
              profileUpdates[`students/${studentEmailKey}/profile/${path}`] = value;
            }
          });
        };
        
        flattenObject(profileData);

        // Prepare all database operations we need to perform
        const writeOperations = [
          update(ref(db), profileUpdates),
          set(ref(db, `students/${studentEmailKey}/courses/${numericCourseId}`), courseData)
        ];

        // Generate required course data for each required course
        for (const requiredCourse of requiredCourses) {
          // First check if the student is already registered for this course
          const existingRequiredCourseRef = ref(db, `students/${studentEmailKey}/courses/${requiredCourse.courseId}`);
          const existingRequiredCourseSnapshot = await get(existingRequiredCourseRef);

          // Skip if student is already registered for this required course
          if (!existingRequiredCourseSnapshot.exists()) {
            // Create a course entry for this required course
            const requiredCourseData = {
              "inOldSharePoint": false,
              "ActiveFutureArchived": {
                "Id": 1,
                "Value": "Active" // Required courses start as Active
              },
              "Course": {
                "Id": Number(requiredCourse.courseId),
                "Value": requiredCourse.title || ''
              },
              "CourseID": Number(requiredCourse.courseId),
              "Created": new Date().toISOString(),
              "ScheduleStartDate": registrationData.formData.startDate || '',
              "ScheduleEndDate": registrationData.formData.endDate || '',
              "StudentType": {
                "Id": 1,
                "Value": registrationData.formData.studentType || ''
              },
              "Status": {
                "Id": 1,
                "Value": "Auto-Enrolled" // Special status for auto-enrolled courses
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
              "Term": registrationData.formData.term || 'Full Year',
              "isRequiredCourse": true, // Flag to identify it as a required course
              // Add registration settings information
              ...(registrationData.formData.registrationSettingsPath && {
                "registrationSettingsPath": registrationData.formData.registrationSettingsPath,
                "timeSectionId": registrationData.formData.timeSectionId || null
              }),
              "jsonStudentNotes": [
                {
                  "author": "System",
                  "content": `Student was automatically enrolled in this required course when registering for ${registrationData.formData.courseName}.`,
                  "id": `note-${Date.now()}-${requiredCourse.courseId}`,
                  "noteType": "🔄",
                  "timestamp": new Date().toISOString()
                }
              ]
            };

            // Add this write operation to our batch
            writeOperations.push(
              set(ref(db, `students/${studentEmailKey}/courses/${requiredCourse.courseId}`), requiredCourseData)
            );
          }
        }

        // Execute all database operations in parallel
        await Promise.all(writeOperations);

        trackConversion();

        // Remove the pendingRegistration node
        await remove(pendingRegRef);        // Reset all form state
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
        {currentStep === 'type-selection' ? 'Student Information Form' : 'Review Registration'}
      </div>
      <div className="text-gray-600 text-sm">
        {currentStep === 'type-selection'
          ? 'Please determine your student type'
          : 'Please review your information before submitting'}
      </div>
    </>  )}
</SheetHeader>            {/* Compact Progress Bar - Only show during form step */}
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