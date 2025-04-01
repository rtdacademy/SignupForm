import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useRef,
  useMemo
} from 'react';
import _ from 'lodash';
import { useAuth } from '../context/AuthContext';
import { Alert, AlertDescription } from "../components/ui/alert";
import { Card, CardHeader, CardContent } from "../components/ui/card";
import {
  InfoIcon,
  AlertTriangle,
  Calendar,
  AlertCircle,
  Loader2,
  
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "../components/ui/tooltip";
import PhoneInput from "react-phone-input-2";
import DatePicker from 'react-datepicker';
import "react-phone-input-2/lib/style.css";
import "react-datepicker/dist/react-datepicker.css";
import SchoolAddressPicker from '../components/SchoolAddressPicker';
import HomeSchoolSelector from '../components/HomeSchoolSelector'; 
import CapitalizedInput from '../components/CapitalizedInput';
import { getDatabase, ref as databaseRef, get, set } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import InternationalDocuments from './InternationalDocuments';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import {
  ValidationFeedback,
  validationRules,
  useFormValidation
} from './formValidation';

// Import timezone utilities
import {
  toEdmontonDate,
  toDateString,
  formatDateForDisplay,
  isDateInSummer,
  calculateAge,
  crossesSchoolYearBoundary,
  calculateDuration,
  getMinEndDate,
  calculateHoursPerWeek,
  formatDiplomaDate,
  getMinCompletionDate,
  getRecommendedCompletionDate,
  validateDateRange
} from '../utils/timeZoneUtils';

// Determine if school selection should be shown
const shouldShowSchoolSelection = (studentType) => {
  return studentType === 'Non-Primary' || studentType === 'Home Education';
};

// Determine if student is Home Education
const isHomeEducation = (studentType) => {
  return studentType === 'Home Education';
};

// Hook to handle registration settings
const useRegistrationSettings = (studentType) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!studentType) return;

      try {
        setLoading(true);
        
        // Determine current school year (Sept 1 to Aug 31)
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth(); // 0-indexed, so 8 = September
        
        // If we're in Sept-Dec, we're in the currentYear/currentYear+1 school year
        // If we're in Jan-Aug, we're in the currentYear-1/currentYear school year
        let schoolYearStart = currentMonth >= 8 ? currentYear : currentYear - 1;
        let schoolYearEnd = schoolYearStart + 1;
        
        // Format as "xx_yy" where xx is the last 2 digits of the start year, and yy is the last 2 digits of the end year
        const schoolYearKey = `${schoolYearStart.toString().slice(-2)}_${schoolYearEnd.toString().slice(-2)}`;
        
        // Convert student type to the format used in Firebase (replace spaces with dashes)
        const studentTypeKey = studentType.replace(/\s+/g, '-');
        
        console.log(`Fetching settings for ${studentTypeKey} in school year ${schoolYearKey}`);
        
        const db = getDatabase();
        const settingsRef = databaseRef(db, `registrationSettings/${schoolYearKey}/${studentTypeKey}`);
        const snapshot = await get(settingsRef);

        if (snapshot.exists()) {
          const settingsData = snapshot.val();
          console.log('Registration settings loaded:', settingsData);
          setSettings(settingsData);
        } else {
          console.error(`No settings found for ${studentType} in the ${schoolYearKey} school year`);
          setError(`No settings found for ${studentType} in the ${schoolYearKey} school year`);
        }
      } catch (err) {
        console.error('Error fetching registration settings:', err);
        setError('Failed to load registration settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [studentType]);

  // Get current school year in the format "XX/YY"
  const getCurrentSchoolYear = useCallback(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    let schoolYearStart = currentMonth >= 8 ? currentYear : currentYear - 1;
    let schoolYearEnd = schoolYearStart + 1;
    
    return `${schoolYearStart.toString().slice(-2)}/${schoolYearEnd.toString().slice(-2)}`;
  }, []);

  // Get next school year in the format "XX/YY"
  const getNextSchoolYear = useCallback(() => {
    const currentYear = getCurrentSchoolYear().split('/')[0];
    const nextYearStart = parseInt(currentYear) + 1;
    const nextYearEnd = nextYearStart + 1;
    
    return `${nextYearStart}/${nextYearEnd}`;
  }, [getCurrentSchoolYear]);

  // Check if next year registration is allowed
  const isNextYearRegistrationAllowed = useCallback(() => {
    return settings?.allowNextYearRegistration === true;
  }, [settings]);

  // Get general message from settings
  const getGeneralMessage = useCallback(() => {
    return settings?.generalMessage || '';
  }, [settings]);

  // Get the time section for the specified year type (current or next)
  const getTimeSection = useCallback((isNextYear = false) => {
    if (!settings || !settings.timeSections) return null;
    
    // Filter time sections based on isForNextYear flag
    const relevantSections = settings.timeSections.filter(section => 
      section.isForNextYear === isNextYear
    );
    
    if (relevantSections.length === 0) return null;
    
    // For simplicity, just return the first matching section
    // You could extend this to find the most appropriate one if there are multiple
    return relevantSections[0];
  }, [settings]);

  // Check if a time section is currently active (today is within start window)
  const isTimeSectionActive = useCallback((timeSection) => {
    if (!timeSection) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startBegins = toEdmontonDate(timeSection.startBegins);
    const startEnds = toEdmontonDate(timeSection.startEnds);
    startBegins.setHours(0, 0, 0, 0);
    startEnds.setHours(23, 59, 59, 999);
    
    return today >= startBegins && today <= startEnds;
  }, []);

  // Get date constraints for a time section
  const getDateConstraints = useCallback((timeSection, isStartDate = true) => {
    if (!timeSection) return { min: null, max: null };
    
    if (isStartDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const startBegins = toEdmontonDate(timeSection.startBegins);
      startBegins.setHours(0, 0, 0, 0);
      
      const startEnds = toEdmontonDate(timeSection.startEnds);
      startEnds.setHours(23, 59, 59, 999);
      
      // Use the later of today or startBegins as the minimum date
      const minDate = today > startBegins ? today : startBegins;
      
      return {
        min: minDate,
        max: startEnds
      };
    } else { // For end date
      const completionBegins = toEdmontonDate(timeSection.completionBegins);
      completionBegins.setHours(0, 0, 0, 0);
      
      const completionEnds = toEdmontonDate(timeSection.completionEnds);
      completionEnds.setHours(23, 59, 59, 999);
      
      return {
        min: completionBegins,
        max: completionEnds
      };
    }
  }, []);

  return {
    settings,
    loading: loading,
    error,
    getCurrentSchoolYear,
    getNextSchoolYear,
    isNextYearRegistrationAllowed,
    getTimeSection,
    isTimeSectionActive,
    getDateConstraints,
    getGeneralMessage,
    crossesSchoolYearBoundary
  };
};

// === DiplomaMonthSelector Component ===
const DiplomaMonthSelector = ({ dates, selectedDate, onChange, error, alreadyWroteDiploma }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if there are any available diploma dates
  const hasAvailableDates = dates.length > 0;
  
  // Check if a selection has been made (either a specific date or "already wrote")
  const hasSelection = selectedDate !== null || alreadyWroteDiploma;
  
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Diploma Exam Date <span className="text-red-500">*</span>
      </label>
      
      {!hasAvailableDates && (
        <Alert className="mb-2 bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm text-amber-700">
            Registration deadlines have passed for all upcoming diploma exams for this course. 
            Please select a different course or contact support for assistance.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="relative">
        <select
          value={selectedDate?.id || (alreadyWroteDiploma ? 'no-diploma' : '')}
          onChange={(e) => {
            if (e.target.value === '') {
              // Prevent changing back to "Select Diploma Exam Date" if a selection was already made
              if (selectedDate || alreadyWroteDiploma) {
                return;
              }
              onChange(null);
            } else if (e.target.value === 'no-diploma') {
              onChange(null);
            } else {
              const selected = dates.find(d => d.id === e.target.value);
              onChange(selected || null);
            }
          }}
          className={`w-full p-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'}`}
          disabled={!hasAvailableDates || hasSelection}
        >
          <option value="" disabled={selectedDate !== null || alreadyWroteDiploma}>Select Diploma Exam Date</option>
          {dates.map((date) => {
            // Format registration deadline if available
            const hasDeadline = !!date.registrationDeadline;
            const deadlineText = hasDeadline 
              ? ` (Register by: ${date.registrationDeadlineDisplayDate || toDateString(toEdmontonDate(date.registrationDeadline))})` 
              : '';
              
            return (
              <option key={date.id} value={date.id}>
                {formatDiplomaDate(date)}{deadlineText}
              </option>
            );
          })}
          <option value="no-diploma">I already wrote the diploma exam</option>
        </select>
        
        {/* Show a reset button when a selection has been made */}
        {hasSelection && (
          <button
            type="button"
            onClick={() => {
              // Reset diploma date selection
              onChange(undefined);
            }}
            className="absolute right-10 top-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
            title="Reset selection"
          >
            Change
          </button>
        )}
      </div>
      
      {error && (
        <div className="flex items-center gap-2 mt-1">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-500">{error}</span>
        </div>
      )}
    </div>
  );
};

// Main component
const NonPrimaryStudentForm = forwardRef(({ 
  onValidationChange, 
  initialData, 
  onSave, 
  studentType,
  importantDates 
}, ref) => {
  const { user, user_email_key } = useAuth();
  const uid = user?.uid; // Extract uid from user
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [hasASN, setHasASN] = useState(true);

  // Use our registration settings hook
  const { 
    settings,
    loading: settingsLoading,
    error: settingsError,
    getCurrentSchoolYear,
    getNextSchoolYear,
    isNextYearRegistrationAllowed,
    getTimeSection,
    isTimeSectionActive,
    getDateConstraints,
    getGeneralMessage
  } = useRegistrationSettings(studentType);

  const countryOptions = useMemo(() => countryList().getData(), []);

  const [documentUrls, setDocumentUrls] = useState({
    passport: '',
    additionalID: '',
    residencyProof: ''
  });

  const [usePreferredFirstName, setUsePreferredFirstName] = useState(false);

  // Initialize form data with user's information
  const getInitialFormData = () => {
    if (initialData) {
      console.log('Using initial data:', initialData);
      return initialData;
    }
  
    const today = new Date();
    const currentMonth = today.getMonth();
    let defaultEnrollmentYear;
  
    console.log('Current month:', currentMonth);
  
    if (currentMonth === 7) { // August
      defaultEnrollmentYear = getNextSchoolYear();
      console.log('August - setting to next school year:', defaultEnrollmentYear);
    } else if (currentMonth >= 8 || currentMonth <= 2) { // September to March
      defaultEnrollmentYear = getCurrentSchoolYear();
      console.log('Sept-March - setting to current school year:', defaultEnrollmentYear);
    }
  
    console.log('Default enrollment year:', defaultEnrollmentYear);
  
    const formData = {
      gender: '',
      firstName: validationRules.firstName.format(user?.displayName?.split(' ')[0] || ''),
      lastName: validationRules.lastName.format(user?.displayName?.split(' ').slice(1).join(' ') || ''),
      preferredFirstName: '', 
      phoneNumber: '',
      currentSchool: '',
      schoolAddress: null,
      birthday: '',
      enrollmentYear: defaultEnrollmentYear || '',
      albertaStudentNumber: '',
      courseId: '',
      courseName: '',
      parentFirstName: '',
      parentLastName: '',
      parentPhone: '',
      parentEmail: '',
      startDate: '',
      endDate: '',
      additionalInformation: '',
      diplomaMonth: null,
      studentType: studentType || 'Non-Primary', // Initialize with studentType prop
      age: null,
      country: '', 
      documents: {
        passport: '',
        additionalID: '',
        residencyProof: ''
      }
    };

    console.log('Initial form data:', formData);
    return formData;
  };

  const [formData, setFormData] = useState(getInitialFormData());
  const [user18OrOlder, setUser18OrOlder] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [isEligible, setIsEligible] = useState(true);
  const [ageInfo, setAgeInfo] = useState('');
  const [enrollmentYearMessage, setEnrollmentYearMessage] = useState('');
  const [availableEnrollmentYears, setAvailableEnrollmentYears] = useState([]);

  const [isDiplomaCourse, setIsDiplomaCourse] = useState(false);
  const [diplomaDates, setDiplomaDates] = useState([]);
  const [selectedDiplomaDate, setSelectedDiplomaDate] = useState(null);
  const [alreadyWroteDiploma, setAlreadyWroteDiploma] = useState(false);

  // Course duration requirements
  const [minCompletionMonths, setMinCompletionMonths] = useState(null);
  const [recommendedCompletionMonths, setRecommendedCompletionMonths] = useState(null);
  const [recommendedEndDate, setRecommendedEndDate] = useState(null);
  const [noValidDatesAvailable, setNoValidDatesAvailable] = useState(false);

  const [dateErrors, setDateErrors] = useState({
    startDate: '',
    endDate: '',
    diplomaDate: '',
    summerNotice: ''
  });

  // State for enrolled courses with their statuses
  const [enrolledCourses, setEnrolledCourses] = useState({});

  // State for course hours
  const [courseHours, setCourseHours] = useState(null);
  
  // Set ASN requirement based on student type
  useEffect(() => {
    if (studentType !== 'International Student') {
      setHasASN(true); // Non-international students are expected to have ASN
    } else {
      setHasASN(true); // International students may or may not have ASN
    }
  }, [studentType]);
  
  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user_email_key) return;

      try {
        const db = getDatabase();
        const profileRef = databaseRef(db, `students/${user_email_key}/profile`);
        const snapshot = await get(profileRef);

        if (snapshot.exists()) {
          setProfileData(snapshot.val());

          // Update form data with profile data
          setFormData(prev => ({
            ...prev,
            firstName: snapshot.val().firstName || prev.firstName,
            lastName: snapshot.val().lastName || prev.lastName,
            phoneNumber: snapshot.val().StudentPhone || prev.phoneNumber,
            gender: snapshot.val().gender || prev.gender,
            birthday: snapshot.val().birthday || prev.birthday,
            albertaStudentNumber: snapshot.val().asn || prev.albertaStudentNumber,
            parentFirstName: snapshot.val().ParentFirstName || prev.parentFirstName,
            parentLastName: snapshot.val().ParentLastName || prev.parentLastName,
            parentPhone: snapshot.val().ParentPhone_x0023_ || prev.parentPhone,
            parentEmail: snapshot.val().ParentEmail || prev.parentEmail,
            country: snapshot.val().internationalDocuments?.countryOfOrigin || prev.country,
          }));

          // Set document URLs if they exist
          if (snapshot.val().internationalDocuments) {
            setDocumentUrls(prev => ({
              ...prev,
              passport: snapshot.val().internationalDocuments.passport || '',
              additionalID: snapshot.val().internationalDocuments.additionalID || '',
              residencyProof: snapshot.val().internationalDocuments.residencyProof || ''
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user_email_key]);

  // Determine which fields should be read-only
  const readOnlyFields = useMemo(() => {
    if (!profileData) return {};

    return {
      firstName: !!profileData.firstName,
      lastName: !!profileData.lastName,
      phoneNumber: !!profileData.StudentPhone,
      birthday: !!profileData.birthday,
      albertaStudentNumber: !!profileData.asn,
      parentFirstName: !!profileData.ParentFirstName,
      parentLastName: !!profileData.ParentLastName,
      parentPhone: !!profileData.ParentPhone_x0023_,
      parentEmail: !!profileData.ParentEmail,
      country: !!profileData.internationalDocuments?.countryOfOrigin,
      documents: !!(profileData.internationalDocuments?.passport && 
                  profileData.internationalDocuments?.additionalID)
    };
  }, [profileData]);

  // Initialize form validation
  const validationOptions = useMemo(() => ({
    conditionalValidation: {
      parentFirstName: () => !user18OrOlder,
      parentLastName: () => !user18OrOlder,
      parentPhone: () => !user18OrOlder,
      parentEmail: () => !user18OrOlder,
      preferredFirstName: () => usePreferredFirstName,
      country: () => studentType === 'International Student',
      documents: () => studentType === 'International Student',
      albertaStudentNumber: () => {
        if (studentType === 'International Student' && !hasASN) {
          return false; // Do not validate ASN
        }
        return true; // Validate ASN
      },
    },
    readOnlyFields,
    formData // Pass the entire formData to the validation
  }), [user18OrOlder, usePreferredFirstName, readOnlyFields, studentType, formData, hasASN]);

  const rules = useMemo(() => ({
    ...validationRules,
    email: undefined
  }), []);

  const {
    errors,
    touched,
    isValid,
    handleBlur,
    validateForm
  } = useFormValidation(formData, rules, validationOptions); 

  // Memoize validateForm ref to prevent it from causing infinite updates
  const validateFormRef = useRef(validateForm);
  useEffect(() => {
    validateFormRef.current = validateForm;
  }, [validateForm]);

  // Save to pending registration in Firebase
  const saveToPendingRegistration = async (formDataToSave) => {
    try {
      setIsSaving(true);
      const db = getDatabase();
      const pendingRegRef = databaseRef(db, `users/${uid}/pendingRegistration`);
      await set(pendingRegRef, {
        formData: formDataToSave,
        lastUpdated: new Date().toISOString()
      });
      if (onSave) {
        await onSave(formDataToSave);
      }
      setError(null);
    } catch (err) {
      console.error('Error saving form data:', err);
      setError('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle form field changes with functional updates
  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;

    setFormData(prev => {
      // Reset start and end dates when enrollment year changes
      if (name === 'enrollmentYear') {
        // Also reset date-related errors when enrollment year changes
        setDateErrors(prev => ({
          ...prev,
          startDate: '',
          endDate: '',
          diplomaDate: '',
          summerNotice: ''
        }));
        
        return {
          ...prev,
          [name]: value,
          startDate: '',
          endDate: ''
        };
      }
      
      // For other fields, just update the specified field
      const newData = {
        ...prev,
        [name]: value
      };

      return newData;
    });

    handleBlur(name);
  }, [handleBlur]);

  const handleCountryChange = (selectedOption) => {
    handleFormChange({
      target: {
        name: 'country',
        value: selectedOption.value
      }
    });
  };

  const handleDocumentUpload = (type, url) => {
    setDocumentUrls(prev => ({
      ...prev,
      [type]: url
    }));
    
    setFormData(prev => {
      const newData = {
        ...prev,
        documents: {
          ...prev.documents,
          [type]: url
        }
      };
      handleBlur('documents'); // Trigger validation for documents
      return newData;
    });
  };

  // Handle date changes
  const handleDateChange = (date) => {
    handleFormChange({
      target: {
        name: 'birthday',
        value: date ? toDateString(date) : '',
      },
    });
  };

  // Get max end date accounting for diploma course constraints
  const getMaxEndDate = useCallback((isDiplomaCourse, alreadyWroteDiploma, selectedDiplomaDate) => {
    // Start with no constraint
    let maxEndDate = null;
    
    // 1. Check if there's a diploma exam constraint
    if (isDiplomaCourse && !alreadyWroteDiploma && selectedDiplomaDate) {
      const displayDate = toEdmontonDate(selectedDiplomaDate.displayDate);
      displayDate.setHours(0, 0, 0, 0);
      maxEndDate = displayDate;
      // If we have a diploma date, we return it immediately without checking other constraints
      // The diploma date must be respected exactly as the end date
      return maxEndDate;
    }
    
    // 2. Check if there's a registration settings constraint for completion date
    const isNextYear = formData.enrollmentYear !== getCurrentSchoolYear();
    const timeSection = getTimeSection(isNextYear);
    
    if (timeSection) {
      const { max: completionEndsDate } = getDateConstraints(timeSection, false);
      
      // If both constraints exist, use the earlier one (this only applies when not using diploma date)
      if (maxEndDate && completionEndsDate) {
        return completionEndsDate < maxEndDate ? completionEndsDate : maxEndDate;
      }
      
      // If only time section constraint exists, use that
      if (completionEndsDate) {
        return completionEndsDate;
      }
    }
    
    // Return diploma constraint if it exists, otherwise null
    return maxEndDate;
  }, [formData.enrollmentYear, getCurrentSchoolYear, getTimeSection, getDateConstraints]);

  // Get date constraints based on registration settings
  const getEffectiveDateConstraints = useCallback(() => {
    const currentSchoolYear = getCurrentSchoolYear();
    const isNextYear = formData.enrollmentYear && formData.enrollmentYear !== currentSchoolYear;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get time section based on enrollment year
    const timeSection = getTimeSection(isNextYear);
    
    if (!timeSection) {
      console.log(`No time section found for ${isNextYear ? 'next' : 'current'} year`);
      return {
        minStartDate: today,
        maxStartDate: null,
        hasActiveWindow: false,
        needsDiplomaSelection: isDiplomaCourse && !selectedDiplomaDate && !alreadyWroteDiploma,
        isNextYear,
        timeSection: null
      };
    }
    
    // Get start date constraints from time section
    const { min: minStartDate, max: maxStartDate } = getDateConstraints(timeSection, true);
    
    // Consider diploma deadline as potential constraint for maximum start date
    let effectiveMaxStartDate = maxStartDate;
    if (isDiplomaCourse && selectedDiplomaDate && selectedDiplomaDate.registrationDeadline) {
      const diplomaDeadline = toEdmontonDate(selectedDiplomaDate.registrationDeadline);
      
      // Use the earlier of window end date and diploma deadline
      if (diplomaDeadline && (!effectiveMaxStartDate || diplomaDeadline < effectiveMaxStartDate)) {
        effectiveMaxStartDate = diplomaDeadline;
      }
    }
    
    // For next year, the time section exists but might not be active yet
    const hasActiveWindow = isNextYear ? true : isTimeSectionActive(timeSection);
    
    return {
      minStartDate,
      maxStartDate: effectiveMaxStartDate,
      hasActiveWindow: hasActiveWindow,
      needsDiplomaSelection: isDiplomaCourse && !selectedDiplomaDate && !alreadyWroteDiploma,
      isNextYear,
      timeSection
    };
  }, [
    getCurrentSchoolYear,
    formData.enrollmentYear,
    getTimeSection,
    isTimeSectionActive,
    getDateConstraints,
    isDiplomaCourse,
    selectedDiplomaDate,
    alreadyWroteDiploma
  ]);

  // Handle start date changes
  const handleStartDateChange = (date) => {
    const { 
      minStartDate, 
      maxStartDate, 
      hasActiveWindow, 
      needsDiplomaSelection,
      isNextYear,
      timeSection
    } = getEffectiveDateConstraints();
    
    // Check if student needs to select a diploma date first
    if (needsDiplomaSelection) {
      setDateErrors(prev => ({
        ...prev,
        startDate: 'Please select a diploma exam date first'
      }));
      return;
    }
    
    // Check if there's an active registration window
    if (!hasActiveWindow) {
      setDateErrors(prev => ({
        ...prev,
        startDate: 'There are currently no active registration windows for your student type'
      }));
      return;
    }
    
    // Check minimum date constraint
    if (date < minStartDate) {
      setDateErrors(prev => ({
        ...prev,
        startDate: `Start date must be on or after ${formatDateForDisplay(minStartDate)}`
      }));
      return;
    }
  
    // Check maximum date constraint
    if (maxStartDate && date > maxStartDate) {
      let message = '';
      
      if (isDiplomaCourse && selectedDiplomaDate && selectedDiplomaDate.registrationDeadline) {
        message = `Start date must be on or before the diploma registration deadline (${selectedDiplomaDate.registrationDeadlineDisplayDate})`;
      } else {
        message = `Start date must be on or before ${formatDateForDisplay(maxStartDate)}`;
      }
      
      setDateErrors(prev => ({
        ...prev,
        startDate: message
      }));
      return;
    }
  
    // If all checks pass, update the start date
    handleFormChange({
      target: {
        name: 'startDate',
        value: toDateString(date)
      }
    });
    
    setDateErrors(prev => ({ ...prev, startDate: '' }));
    
    // Calculate recommended end date based on course requirements
    if (minCompletionMonths || recommendedCompletionMonths) {
      // If we have a minimum completion period, use it to determine the earliest possible end date
      const minEndDate = minCompletionMonths ? getMinCompletionDate(date, minCompletionMonths) : getMinEndDate(date);
      
      // Get the recommended completion date
      const recEndDate = recommendedCompletionMonths ? 
        getRecommendedCompletionDate(date, recommendedCompletionMonths) : 
        new Date(date);
      
      if (recEndDate) {
        // Default to 5 months if no recommended completion months
        if (!recommendedCompletionMonths) {
          recEndDate.setMonth(recEndDate.getMonth() + 5);
        }
        
        // Check if the recommended end date is after the max allowed end date
        const maxEndDate = getMaxEndDate(isDiplomaCourse, alreadyWroteDiploma, selectedDiplomaDate);
        
        // If there's a maximum end date and the recommended end date exceeds it
        if (maxEndDate && recEndDate > maxEndDate) {
          // Check if the minimum required end date is also past the maximum allowed end date
          if (minEndDate && minEndDate > maxEndDate) {
            // This means there are no valid dates available
            setNoValidDatesAvailable(true);
            setDateErrors(prev => ({
              ...prev,
              endDate: `This course requires at least ${minCompletionMonths} months to complete, but the registration period ends on ${formatDateForDisplay(maxEndDate)}. Please select a different course or try registering for the next school year.`
            }));
          } else {
            // Check if this is a diploma date - if so, we should use it exactly, not subtract days
            const isDiplomaDate = isDiplomaCourse && !alreadyWroteDiploma && selectedDiplomaDate;
            let safeEndDate;
            
            if (isDiplomaDate) {
              // For diploma courses, use the exact diploma date
              safeEndDate = maxEndDate;
            } else {
              // For non-diploma courses, subtract 7 days to avoid putting the student right at the end
              const adjustedMaxEndDate = new Date(maxEndDate);
              adjustedMaxEndDate.setDate(adjustedMaxEndDate.getDate() - 7);
              
              // If adjusted date is still after minEndDate, use it. Otherwise, use minEndDate
              safeEndDate = minEndDate && adjustedMaxEndDate < minEndDate ? minEndDate : adjustedMaxEndDate;
            }
            
            setRecommendedEndDate(safeEndDate);
            
            // For diploma dates, don't show error message since info is shown elsewhere
            // For non-diploma dates, show the adjustment message
            if (!isDiplomaDate) {
              setDateErrors(prev => ({
                ...prev,
                endDate: `Note: The end date has been adjusted to ${formatDateForDisplay(safeEndDate)} based on the registration deadline.`
              }));
            } else {
              // Clear any existing error message for diploma dates
              setDateErrors(prev => ({
                ...prev,
                endDate: ''
              }));
            }
            
            // If diploma date is the constraint, use it as the end date
            if (isDiplomaCourse && !alreadyWroteDiploma && selectedDiplomaDate) {
              handleFormChange({
                target: {
                  name: 'endDate',
                  value: toDateString(safeEndDate)
                }
              });
            }
          }
        } else {
          // The recommended end date is within the allowed range
          setRecommendedEndDate(recEndDate);
          setNoValidDatesAvailable(false);
          
          // If diploma date is selected, use it as the end date
          if (isDiplomaCourse && !alreadyWroteDiploma && selectedDiplomaDate) {
            const diplomaDate = toEdmontonDate(selectedDiplomaDate.displayDate);
            
            // Use the earlier of max end date and diploma date if both exist
            const effectiveEndDate = maxEndDate && diplomaDate && maxEndDate < diplomaDate ? 
              maxEndDate : diplomaDate;
            
            handleFormChange({
              target: {
                name: 'endDate',
                value: toDateString(effectiveEndDate)
              }
            });
          }
        }
      }
    } else if (isDiplomaCourse && !alreadyWroteDiploma && selectedDiplomaDate) {
      // Handle diploma course case when we don't have completion requirements
      const diplomaDate = toEdmontonDate(selectedDiplomaDate.displayDate);
      
      // Set end date to diploma date if possible
      const maxEndDate = getMaxEndDate(isDiplomaCourse, alreadyWroteDiploma, selectedDiplomaDate);
      
      handleFormChange({
        target: {
          name: 'endDate',
          value: toDateString(maxEndDate || diplomaDate)
        }
      });
    }
  };

  // Handle end date changes
  const handleEndDateChange = async (date) => {
    // If there are no valid dates available, prevent changes
    if (noValidDatesAvailable) {
      return;
    }
    
    // Calculate the minimum end date based on course requirements
    const courseMinEndDate = formData.startDate && minCompletionMonths ? 
      getMinCompletionDate(formData.startDate, minCompletionMonths) : 
      null;
    
    // Use the course minimum if available, otherwise default to 1 month
    const minEnd = courseMinEndDate || getMinEndDate(formData.startDate);
    
    // Basic minimum duration validation
    if (minEnd && date < minEnd) {
      const message = minCompletionMonths ? 
        `End date must be at least ${minCompletionMonths} months after start date` : 
        'End date must be at least 1 month after start date';
      
      setDateErrors(prev => ({
        ...prev,
        endDate: message
      }));
      return;
    }
  
    // Get maximum end date from multiple constraints
    const maxEnd = getMaxEndDate(isDiplomaCourse, alreadyWroteDiploma, selectedDiplomaDate);
    
    // Handle maximum end date constraints with specific error messages
    if (maxEnd && date > maxEnd) {
      let errorMessage = '';
      
      // Determine the appropriate error message based on the constraint type
      if (isDiplomaCourse && !alreadyWroteDiploma && selectedDiplomaDate && 
          date > toEdmontonDate(selectedDiplomaDate.displayDate)) {
        errorMessage = `End date must be exactly on your diploma exam date (${formatDateForDisplay(toEdmontonDate(selectedDiplomaDate.displayDate))})`;
      } else {
        errorMessage = `End date must be on or before ${formatDateForDisplay(maxEnd)} based on registration period constraints`;
      }
      
      setDateErrors(prev => ({ ...prev, endDate: errorMessage }));
      return;
    }
    
    // Summer school validation - only check end date for summer school student type
    if (studentType === 'Summer School' && !isDateInSummer(date)) {
      setDateErrors(prev => ({
        ...prev,
        endDate: 'Summer school courses must end in July or August'
      }));
      return;
    }
  
    // School year boundary validation
    if (formData.startDate && crossesSchoolYearBoundary(formData.startDate, date)) {
      setDateErrors(prev => ({
        ...prev,
        endDate: 'For courses starting in summer and ending after August, please select the next school year'
      }));
      return;
    }
  
    // If all validations pass, update the end date
    handleFormChange({
      target: {
        name: 'endDate',
        value: toDateString(date)
      }
    });
    setDateErrors(prev => ({ ...prev, endDate: '' }));
  
    // Add summer school notification for regular students
    if ((studentType === 'Non-Primary' || studentType === 'Home Education') && isDateInSummer(date)) {
      setDateErrors(prev => ({
        ...prev,
        summerNotice: 'Since you selected an end date in July or August, this will be considered a summer school registration.'
      }));
    } else {
      setDateErrors(prev => ({
        ...prev,
        summerNotice: ''
      }));
    }
  
    // Fetch course hours for study time calculation
    if (formData.courseId && formData.startDate) {
      try {
        const db = getDatabase();
        const courseHoursRef = databaseRef(db, `courses/${formData.courseId}/NumberOfHours`);
        const snapshot = await get(courseHoursRef);
        if (snapshot.exists()) {
          setCourseHours(snapshot.val());
        }
      } catch (err) {
        console.error('Error fetching course hours:', err);
      }
    }
  };

  // Calculate age based on birthday
  useEffect(() => {
    if (formData.birthday) {
      const birthdayDate = toEdmontonDate(formData.birthday);
      const today = new Date();
      let age = today.getFullYear() - birthdayDate.getFullYear();
      const monthDiff = today.getMonth() - birthdayDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdayDate.getDate())) {
        age--;
      }

      setFormData(prev => ({
        ...prev,
        age: age
      }));
    }
  }, [formData.birthday]);

  // Determine if user is 18 or older and show parent info accordingly
  useEffect(() => {
    if (formData.birthday) {
      const age = calculateAge(formData.birthday, new Date());
      setUser18OrOlder(age >= 18);
    }
  }, [formData.birthday]);

  // Update validation status
  useEffect(() => {
    onValidationChange(isValid && isEligible && validateDates() && !noValidDatesAvailable);
  }, [isValid, isEligible, noValidDatesAvailable, onValidationChange]);

  // Fetch courses from Firebase
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCoursesLoading(true);
        const db = getDatabase();
        const coursesRef = databaseRef(db, 'courses');
        const snapshot = await get(coursesRef);

        if (snapshot.exists()) {
          const coursesData = [];
          snapshot.forEach((childSnapshot) => {
            const courseId = childSnapshot.key;

            // Skip the 'sections' node
            if (courseId === 'sections') {
              return;
            }

            const courseData = childSnapshot.val();

            // Ensure 'Title' exists to determine if it's a course
            if (!courseData.Title) {
              return;
            }

            // Only include courses with Active status set to "Current"
            if (courseData.Active !== "Current") {
              return;
            }

            coursesData.push({
              id: courseId,
              title: courseData.Title,
              DiplomaCourse: courseData.DiplomaCourse,
              diplomaTimes: courseData.diplomaTimes || [],
              recommendedCompletionMonths: courseData.recommendedCompletionMonths || null,
              minCompletionMonths: courseData.minCompletionMonths || null
            });
          });

          coursesData.sort((a, b) => a.title.localeCompare(b.title));
          setCourses(coursesData);
        } else {
          setCoursesError('No courses found');
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        setCoursesError('Error loading courses');
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Fetch enrolled courses with their statuses for the student
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!user_email_key) return;
      try {
        const db = getDatabase();
        const studentCoursesRef = databaseRef(db, `students/${user_email_key}/courses`);
        const snapshot = await get(studentCoursesRef);

        if (snapshot.exists()) {
          const coursesData = snapshot.val();
          const enrolledCoursesMap = {};

          // Iterate over each course
          for (const [courseId, courseInfo] of Object.entries(coursesData)) {
            // Get the status at ActiveFutureArchived/Value
            const status = courseInfo.ActiveFutureArchived?.Value || '';
            enrolledCoursesMap[courseId] = status;
          }

          setEnrolledCourses(enrolledCoursesMap);
        } else {
          setEnrolledCourses({});
        }
      } catch (err) {
        console.error('Error fetching enrolled courses:', err);
      }
    };

    fetchEnrolledCourses();
  }, [user_email_key]);

  // Update enrollment year options based on registration settings
  useEffect(() => {
    if (settingsLoading || !settings) return;
    
    const currentSchoolYear = getCurrentSchoolYear();
    const nextSchoolYear = getNextSchoolYear();
    const canRegisterForNextYear = isNextYearRegistrationAllowed();
    
    console.log('Current school year:', currentSchoolYear);
    console.log('Next school year:', nextSchoolYear);
    console.log('Can register for next year:', canRegisterForNextYear);
    
    // Current year time section
    const currentYearSection = getTimeSection(false);
    const hasCurrentYear = !!currentYearSection;
    
    // Next year time section
    const nextYearSection = getTimeSection(true);
    const hasNextYear = canRegisterForNextYear && !!nextYearSection;
    
    console.log('Current year section:', currentYearSection);
    console.log('Next year section:', nextYearSection);
    
    let availableYears = [];
    let message = '';
    
    // Add current year if it has a section
    if (hasCurrentYear) {
      availableYears.push(currentSchoolYear);
      if (isTimeSectionActive(currentYearSection)) {
        message = `Registration is currently open for the ${currentSchoolYear} school year until ${formatDateForDisplay(currentYearSection.startEnds)}.`;
      } else {
        message = `Registration for the ${currentSchoolYear} school year will open on ${formatDateForDisplay(currentYearSection.startBegins)}.`;
      }
    }
    
    // Add next year if allowed and has a section
    if (hasNextYear) {
      availableYears.push(nextSchoolYear);
      
      if (message) {
        message += ` You can also register for the ${nextSchoolYear} school year`;
      } else {
        message = `Registration is available for the ${nextSchoolYear} school year`;
      }
      
      if (isTimeSectionActive(nextYearSection)) {
        message += ` until ${formatDateForDisplay(nextYearSection.startEnds)}.`;
      } else {
        message += ` between ${formatDateForDisplay(nextYearSection.startBegins)} and ${formatDateForDisplay(nextYearSection.startEnds)}.`;
      }
    }

    // Always add current year as a fallback if no sections are found
    if (availableYears.length === 0) {
      availableYears.push(currentSchoolYear);
      message = `Registration is currently closed for this student type.`;
    }
    
    console.log('Available years:', availableYears);
    
    // Auto-select if there's only one option and no current selection or invalid selection
    if (availableYears.length === 1 && (!formData.enrollmentYear || !availableYears.includes(formData.enrollmentYear))) {
      console.log('Setting default enrollment year:', availableYears[0]);
      handleFormChange({
        target: {
          name: 'enrollmentYear',
          value: availableYears[0],
        },
      });
    }
    
    // If the current selection is not in available years, reset it
    if (formData.enrollmentYear && !availableYears.includes(formData.enrollmentYear)) {
      handleFormChange({
        target: {
          name: 'enrollmentYear',
          value: availableYears[0] || '',
        },
      });
    }
    
    setAvailableEnrollmentYears(availableYears);
    setEnrollmentYearMessage(message);
  }, [
    settings, 
    settingsLoading, 
    formData.enrollmentYear, 
    handleFormChange, 
    getCurrentSchoolYear, 
    getNextSchoolYear, 
    isNextYearRegistrationAllowed, 
    getTimeSection,
    isTimeSectionActive
  ]);

  // Update age information based on birthday and enrollment year
  useEffect(() => {
    updateAgeInfo();
  }, [formData.birthday, formData.enrollmentYear]);

  // Fetch course specific information (diploma, completion requirements)
  useEffect(() => {
    const fetchCourseInfo = async () => {
      if (!formData.courseId) return;

      try {
        const db = getDatabase();
        const courseRef = databaseRef(db, `courses/${formData.courseId}`);
        const snapshot = await get(courseRef);

        if (snapshot.exists()) {
          const courseData = snapshot.val();
          
          // Set diploma course information
          const isDiploma = courseData.DiplomaCourse === "Yes";
          setIsDiplomaCourse(isDiploma);

          // Set completion requirements
          const minMonths = courseData.minCompletionMonths !== undefined ? 
            parseFloat(courseData.minCompletionMonths) : null;
          const recMonths = courseData.recommendedCompletionMonths !== undefined ? 
            parseFloat(courseData.recommendedCompletionMonths) : null;
          
          console.log(`Course completion requirements - Min: ${minMonths}, Recommended: ${recMonths}`);
          
          setMinCompletionMonths(minMonths);
          setRecommendedCompletionMonths(recMonths);

          // Handle diploma dates
          if (isDiploma && courseData.diplomaTimes) {
            const diplomaTimesArray = Array.isArray(courseData.diplomaTimes)
              ? courseData.diplomaTimes
              : Object.values(courseData.diplomaTimes);

            // Filter based on enrollment year and check registration deadlines
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Determine if we're filtering for next year
            const isNextYear = formData.enrollmentYear !== getCurrentSchoolYear();
            const isSummerSchool = formData.studentType === 'Summer School';
            console.log('Filtering diploma dates - isNextYear:', isNextYear, 'isSummerSchool:', isSummerSchool);
            
            // Parse the enrollment year to get start and end years
            const enrollmentYearParts = formData.enrollmentYear ? formData.enrollmentYear.split('/') : [];
            const enrollmentStartYear = enrollmentYearParts.length > 0 ? parseInt('20' + enrollmentYearParts[0]) : null;
            const enrollmentEndYear = enrollmentYearParts.length > 1 ? parseInt('20' + enrollmentYearParts[1]) : null;
            
            console.log(`Enrollment year parsed: Start year ${enrollmentStartYear}, End year ${enrollmentEndYear}`);
            
            // For next year, we need to use a different filter logic
            const validDates = diplomaTimesArray
              .filter(item => {
                // Safely convert dates with error handling
                let examDate = null;
                try {
                    examDate = item.date ? toEdmontonDate(item.date) : null;
                } catch (err) {
                    console.warn(`Error parsing exam date: ${item.date}`, err);
                }
                
                // Also check if registration deadline hasn't passed
                const hasDeadline = !!item.registrationDeadline;
                let registrationDeadline = null;
                if (hasDeadline) {
                    try {
                        registrationDeadline = toEdmontonDate(item.registrationDeadline);
                    } catch (err) {
                        console.warn(`Error parsing registration deadline: ${item.registrationDeadline}`, err);
                    }
                }
                
                // Log each date being considered (with safe date logging)
                console.log(`Diploma date: ${examDate ? formatDateForDisplay(examDate) : 'Invalid Date'}, hasDeadline: ${hasDeadline}, registrationDeadline: ${registrationDeadline ? formatDateForDisplay(registrationDeadline) : 'None'}`);
                
                // Check for invalid dates first
                if (!examDate || isNaN(examDate.getTime())) {
                  console.warn(`Skipping invalid diploma date`, item);
                  return false;
                }
                
                // Get the display date (for checking month)
                const displayDate = item.displayDate ? toEdmontonDate(item.displayDate) : null;
                const isAugustDiploma = displayDate && (displayDate.getMonth() === 6 || displayDate.getMonth() === 7); // July (6) or August (7)
                const diplomaYear = displayDate ? displayDate.getFullYear() : null;
                
                console.log(`Diploma displayDate: ${displayDate}, isAugustDiploma: ${isAugustDiploma}, diplomaYear: ${diplomaYear}`);
                
                // Basic filter: date must be in the future
                // and if it has a registration deadline, that deadline must be in the future too
                const basicValidation = examDate > today && (!hasDeadline || (registrationDeadline && registrationDeadline >= today));
                
                if (!basicValidation) return false;
                
                const isNonPrimary = formData.studentType === 'Non-Primary';
                const isAdultStudent = formData.studentType === 'Adult';
                const isInternationalStudent = formData.studentType === 'International';
                
                console.log(`Student type checks: isNonPrimary: ${isNonPrimary}, isSummerSchool: ${isSummerSchool}, isAdultStudent: ${isAdultStudent}, isInternationalStudent: ${isInternationalStudent}`);
                
                // Special case for Summer School students - only show August diplomas for current year
                if (isSummerSchool) {
                  const currentYear = new Date().getFullYear();
                  return isAugustDiploma && diplomaYear === currentYear;
                }
                
                // Non-Primary students should not be able to select August diplomas
                if (isNonPrimary && isAugustDiploma) {
                  console.log(`Filtering out August diploma for Non-Primary student: ${item.displayDate}`);
                  return false;
                }
                
                // For Adult and International students, apply normal enrollment year filtering
                // For all student types, filter based on enrollment year
                // School years run from September to August
                // If diploma is between September and December, it should be in enrollmentStartYear
                // If diploma is between January and August, it should be in enrollmentEndYear
                if (enrollmentStartYear && enrollmentEndYear && diplomaYear) {
                  const diplomaMonth = displayDate.getMonth(); // 0-indexed
                  
                  // If diploma is between September (8) and December (11), it should be in enrollmentStartYear
                  if (diplomaMonth >= 8 && diplomaMonth <= 11) {
                    return diplomaYear === enrollmentStartYear;
                  }
                  
                  // If diploma is between January (0) and August (7), it should be in enrollmentEndYear
                  if (diplomaMonth >= 0 && diplomaMonth <= 7) {
                    // For Non-Primary students, exclude August diplomas (already handled above)
                    return diplomaYear === enrollmentEndYear;
                  }
                }
                
                // Default fallback behavior
                if (isNextYear) {
                  return true; // For next year, accept future dates
                } else {
                  return true; // For current year, accept dates in the next 12 months
                }
              })
              .sort((a, b) => toEdmontonDate(a.date) - toEdmontonDate(b.date));

            console.log(`Found ${validDates.length} valid diploma dates for ${courseData.Title}`);
            setDiplomaDates(validDates);
          }
          
          // Reset end date recommendations when course changes
          setRecommendedEndDate(null);
        }
      } catch (err) {
        console.error('Error fetching course info:', err);
      }
    };

    fetchCourseInfo();
    
    // Reset course-specific state when course changes
    setNoValidDatesAvailable(false);
    setDateErrors(prev => ({ 
      ...prev, 
      startDate: '',
      endDate: '',
      diplomaDate: ''
    }));
    
  }, [formData.courseId, formData.enrollmentYear]);

  // Adjust end date and validate start date based on selected diploma date
  useEffect(() => {
    if (selectedDiplomaDate) {
      // Check if start date is after registration deadline
      if (selectedDiplomaDate.registrationDeadline && formData.startDate) {
        const startDate = toEdmontonDate(formData.startDate);
        const deadline = toEdmontonDate(selectedDiplomaDate.registrationDeadline);
        
        const { maxStartDate } = getEffectiveDateConstraints();
        const effectiveDeadline = maxStartDate && maxStartDate < deadline ? maxStartDate : deadline;
        
        if (startDate > effectiveDeadline) {
          // Reset the start date if it's after the effective deadline
          handleFormChange({
            target: {
              name: 'startDate',
              value: ''
            }
          });
          setDateErrors(prev => ({
            ...prev,
            startDate: `Start date must be on or before ${selectedDiplomaDate.registrationDeadlineDisplayDate}`
          }));
        }
      }
      
      // Adjust end date based on diploma exam date
      const maxEndDate = getMaxEndDate(isDiplomaCourse, alreadyWroteDiploma, selectedDiplomaDate);
      if (formData.endDate && toEdmontonDate(formData.endDate) > maxEndDate) {
        handleFormChange({
          target: {
            name: 'endDate',
            value: toDateString(maxEndDate)
          }
        });
      }
      
      // Check if there's a minimum completion period that would create a conflict
      if (minCompletionMonths && formData.startDate) {
        const startDate = toEdmontonDate(formData.startDate);
        const minCompletionDate = getMinCompletionDate(startDate, minCompletionMonths);
        const diplomaDate = toEdmontonDate(selectedDiplomaDate.displayDate);
        
        // If the minimum completion date is after the diploma date, there's a conflict
        if (minCompletionDate > diplomaDate) {
          setNoValidDatesAvailable(true);
          setDateErrors(prev => ({
            ...prev,
            endDate: `This course requires at least ${minCompletionMonths} months to complete, but the diploma exam is on ${formatDateForDisplay(diplomaDate)}. Please select a different course or diploma date.`
          }));
        } else {
          setNoValidDatesAvailable(false);
        }
      }
    }
  }, [
    selectedDiplomaDate, 
    formData.endDate, 
    formData.startDate, 
    handleFormChange, 
    isDiplomaCourse, 
    alreadyWroteDiploma, 
    getEffectiveDateConstraints, 
    getMaxEndDate,
    minCompletionMonths
  ]);

  // Reset end date and diploma selection when course changes
  useEffect(() => {
    if (!formData.courseId) return;

    setFormData(prev => ({
      ...prev,
      endDate: ''
    }));
    setSelectedDiplomaDate(null);
    setAlreadyWroteDiploma(false);
    setCourseHours(null);
  }, [formData.courseId]);

  // Update age-related information and eligibility
  const updateAgeInfo = () => {
    if (!formData.birthday || !formData.enrollmentYear) {
      setAgeInfo('');
      setIsEligible(true);
      return;
    }
  
    // If it's an adult student, don't show age messaging
    if (studentType === 'Adult Student') {
      setAgeInfo('');
      setIsEligible(true);
      return;
    }
  
    const [enrollmentStartYear] = formData.enrollmentYear.split('/');
    const lastSeptember = new Date(parseInt('20' + enrollmentStartYear, 10) - 1, 8, 1);
    const nextSeptember = new Date(parseInt('20' + enrollmentStartYear, 10), 8, 1);
    const today = new Date();
    const currentAge = calculateAge(formData.birthday, today);
    const ageLastSeptember = calculateAge(formData.birthday, lastSeptember);
    const ageNextSeptember = calculateAge(formData.birthday, nextSeptember);
  
    if (ageLastSeptember >= 20) {
      setAgeInfo(`You are currently ${currentAge} years old. You are over 20 and not considered a school-age student.`);
      setIsEligible(false);
    } else if (currentAge >= 20 || ageNextSeptember >= 20) {
      setAgeInfo(`You are currently ${currentAge} years old. You are a school-age student for the current school year, but will not be for the next school year.`);
      setIsEligible(false);
    } else if (currentAge > 18) {
      setAgeInfo(`You are currently ${currentAge} years old. You are considered a school-age student for both the current and next school year.`);
      setIsEligible(true);
    } else {
      setAgeInfo(`You are currently ${currentAge} years old and considered a school-age student.`);
      setIsEligible(true);
    }
  };

  // Handle Alberta Student Number (ASN) changes with formatting
  const handleASNChange = (e) => {
    const { value } = e.target;
    
    // Format the ASN as it's typed
    let formattedValue = value.replace(/\D/g, "").slice(0, 9);
    
    // Apply ####-####-# format
    if (formattedValue.length > 4) {
      formattedValue = `${formattedValue.slice(0, 4)}-${formattedValue.slice(4)}`;
    }
    if (formattedValue.length > 9) {
      formattedValue = `${formattedValue.slice(0, 9)}-${formattedValue.slice(9)}`;
    }
    
    handleFormChange({
      target: {
        name: "albertaStudentNumber",
        value: formattedValue,
      },
    });
    
    // Mark as touched to trigger validation feedback
    handleBlur('albertaStudentNumber');
  };

  // Handle diploma date changes
  const handleDiplomaDateChange = (date) => {
    // Handle reset case - allow reselection
    if (date === undefined) {
      setAlreadyWroteDiploma(false);
      setSelectedDiplomaDate(null);
      handleFormChange({
        target: {
          name: 'diplomaMonth',
          value: null
        }
      });
      return;
    }
    
    if (date === null) {
      // Student already wrote the diploma
      setAlreadyWroteDiploma(true);
      setSelectedDiplomaDate(null);
      handleFormChange({
        target: {
          name: 'diplomaMonth',
          value: {
            alreadyWrote: true // Add this flag for the submission handler
          }
        }
      });
  
      if (formData.startDate) {
        const startDate = toEdmontonDate(formData.startDate);
        
        // Calculate end date based on recommended/min completion months or default to 5 months
        let defaultEndDate;
        
        if (recommendedCompletionMonths) {
          defaultEndDate = getRecommendedCompletionDate(startDate, recommendedCompletionMonths);
        } else if (minCompletionMonths) {
          defaultEndDate = getMinCompletionDate(startDate, minCompletionMonths);
        } else {
          defaultEndDate = new Date(startDate);
          defaultEndDate.setMonth(defaultEndDate.getMonth() + 5);
        }
        
        // Check against schedule end date constraint
        const maxEndDate = getMaxEndDate(isDiplomaCourse, true, null);
        if (maxEndDate && defaultEndDate > maxEndDate) {
          handleFormChange({
            target: {
              name: 'endDate',
              value: toDateString(maxEndDate)
            }
          });
          
          // For diploma dates, don't show error message
          // For non-diploma dates, show the adjustment message
          if (!(isDiplomaCourse && !alreadyWroteDiploma)) {
            setDateErrors(prev => ({
              ...prev,
              endDate: `Note: The end date has been adjusted to ${formatDateForDisplay(maxEndDate)} based on registration constraints`
            }));
          } else {
            // Clear any existing error message for diploma dates
            setDateErrors(prev => ({
              ...prev,
              endDate: ''
            }));
          }
        } else {
          handleFormChange({
            target: {
              name: 'endDate',
              value: toDateString(defaultEndDate)
            }
          });
        }
      }
      
      // Clear any no-valid-dates flag when selecting "already wrote diploma"
      setNoValidDatesAvailable(false);
    } else {
      // Student selected a diploma date
      setAlreadyWroteDiploma(false);
      setSelectedDiplomaDate(date);
      handleFormChange({
        target: {
          name: 'diplomaMonth',
          value: {
            id: date.id,
            month: date.month,
            date: date.date,
            displayDate: date.displayDate,
            alreadyWrote: false
          }
        }
      });
      
      // Check for potential conflicts with minimum completion requirements
      if (minCompletionMonths && formData.startDate) {
        const startDate = toEdmontonDate(formData.startDate);
        const minCompletionDate = getMinCompletionDate(startDate, minCompletionMonths);
        const diplomaDate = toEdmontonDate(date.displayDate);
        
        // If minimum completion date is after diploma date, flag that no valid dates are available
        if (minCompletionDate > diplomaDate) {
          setNoValidDatesAvailable(true);
          setDateErrors(prev => ({
            ...prev,
            endDate: `This course requires at least ${minCompletionMonths} months to complete, but the diploma exam is on ${formatDateForDisplay(diplomaDate)}. Please select a different course or diploma date.`
          }));
          return;
        }
      }
      
      // Set end date to diploma date, but check against schedule end date constraint
      const diplomaDate = toEdmontonDate(date.date);
      const maxEndDate = getMaxEndDate(isDiplomaCourse, false, date);
      
      if (maxEndDate && maxEndDate < diplomaDate) {
        // For diploma courses, we need to use the actual diploma date
        // This is a special case where we have a diploma course, but for some reason
        // the maxEndDate from registration constraints is earlier than the diploma date
        // In this case, we should use the diploma date because it's a hard requirement
        const safeEndDate = diplomaDate;
        
        handleFormChange({
          target: {
            name: 'endDate',
            value: toDateString(safeEndDate)
          }
        });
        
        // For diploma dates, don't show error message since info is shown elsewhere
        setDateErrors(prev => ({
          ...prev,
          endDate: ''
        }));
      } else {
        handleFormChange({
          target: {
            name: 'endDate',
            value: toDateString(diplomaDate)
          }
        });
      }
      
      // Clear the no-valid-dates flag if we've found a valid date
      setNoValidDatesAvailable(false);
    }
    setDateErrors(prev => ({ ...prev, diplomaDate: '' }));
  };

  // Validate date fields, including registration constraints
  const validateDates = useCallback(() => {
    let valid = true;
    const newDateErrors = {};
    
    // If no valid dates are available, validation fails
    if (noValidDatesAvailable) {
      return false;
    }
    
    // Get date constraints
    const { hasActiveWindow } = getEffectiveDateConstraints();
    
    // Check if there's an active registration window first
    if (!hasActiveWindow) {
      newDateErrors.startDate = 'There are currently no active registration windows for your student type';
      valid = false;
    }

    if (!formData.startDate) {
      newDateErrors.startDate = 'Start date is required';
      valid = false;
    }

    if (!formData.endDate) {
      newDateErrors.endDate = 'End date is required';
      valid = false;
    }

    // Check minimum completion period if applicable
    if (minCompletionMonths && formData.startDate && formData.endDate) {
      const startDate = toEdmontonDate(formData.startDate);
      const endDate = toEdmontonDate(formData.endDate);
      const minCompletionDate = getMinCompletionDate(startDate, minCompletionMonths);
      
      if (endDate < minCompletionDate) {
        newDateErrors.endDate = `This course requires at least ${minCompletionMonths} months to complete. Please select an end date on or after ${formatDateForDisplay(minCompletionDate)}`;
        valid = false;
      }
    }

    // Validate that end date doesn't exceed schedule end date constraint
    const maxEndDate = getMaxEndDate(isDiplomaCourse, alreadyWroteDiploma, selectedDiplomaDate);
    if (maxEndDate && formData.endDate && toEdmontonDate(formData.endDate) > maxEndDate) {
      newDateErrors.endDate = `End date cannot be later than ${formatDateForDisplay(maxEndDate)} based on registration constraints`;
      valid = false;
    }

    // Validate diploma-related constraints
    if (isDiplomaCourse && !alreadyWroteDiploma) {
      if (!selectedDiplomaDate) {
        newDateErrors.diplomaDate = 'Diploma date is required';
        valid = false;
      } else if (selectedDiplomaDate.registrationDeadline) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadline = toEdmontonDate(selectedDiplomaDate.registrationDeadline);
        
        if (today > deadline) {
          newDateErrors.diplomaDate = `Registration deadline (${selectedDiplomaDate.registrationDeadlineDisplayDate}) has passed`;
          valid = false;
        }
      }
    }

    // Check if dates cross school year boundary
    if (formData.startDate && formData.endDate && crossesSchoolYearBoundary(formData.startDate, formData.endDate)) {
      newDateErrors.endDate = 'For courses starting in summer and ending after August, please select the next school year';
      valid = false;
    }

    setDateErrors(prev => ({ ...prev, ...newDateErrors }));
    return valid;
  }, [
    formData.startDate, 
    formData.endDate, 
    isDiplomaCourse, 
    alreadyWroteDiploma, 
    selectedDiplomaDate, 
    getEffectiveDateConstraints,
    getMaxEndDate,
    crossesSchoolYearBoundary,
    minCompletionMonths,
    noValidDatesAvailable
  ]);

  // Validate form and update validation status
  useEffect(() => {
    const debouncedValidation = _.debounce(() => {
      // Simple phone validation
      const isPhoneValid = readOnlyFields.phoneNumber || (formData.phoneNumber && formData.phoneNumber.length > 0);
      
      const isFormValid = isValid && 
                         isEligible && 
                         validateDates() && 
                         !noValidDatesAvailable &&
                         formData.courseId &&
                         isPhoneValid &&
                         (studentType !== 'International Student' || 
                          readOnlyFields.country || 
                          (formData.country && 
                           formData.documents?.passport && 
                           formData.documents?.additionalID));
      onValidationChange(isFormValid);
    }, 300);
  
    debouncedValidation();
    return () => debouncedValidation.cancel();
  }, [
    isValid, 
    isEligible, 
    validateDates, 
    onValidationChange, 
    formData.courseId, 
    studentType, 
    formData.country, 
    formData.documents, 
    readOnlyFields, 
    formData.phoneNumber,
    noValidDatesAvailable
  ]);

  // Determine if end date should be readonly
  const isEndDateReadOnly = isDiplomaCourse && !alreadyWroteDiploma && selectedDiplomaDate;

  // Function to get initial birthday date for DatePicker
  const getInitialBirthdayDate = () => {
    const today = new Date();
    return new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );
  };

  // Handle course selection changes
  const handleCourseChange = async (e) => {
    const { value } = e.target;
    const selectedCourse = courses.find(course => course.id === value);
  
    setFormData(prev => ({
      ...prev,
      courseId: value,
      courseName: selectedCourse ? selectedCourse.title : '',
      startDate: '', // Reset start date when course changes
      endDate: '' // Reset end date when course changes
    }));
    
    // Reset course-related state
    setSelectedDiplomaDate(null);
    setAlreadyWroteDiploma(false);
    setNoValidDatesAvailable(false);
    setDateErrors(prev => ({
      ...prev,
      startDate: '',
      endDate: '',
      diplomaDate: '',
      summerNotice: ''
    }));
  
    handleBlur('courseId'); // Add this to mark the field as touched
  };

  // Update preferredFirstName when usePreferredFirstName or firstName changes
  useEffect(() => {
    if (profileData?.preferredFirstName) {
      // If there's a preferred name in the profile, use it and show the checkbox
      setUsePreferredFirstName(true);
      setFormData(prevData => ({
        ...prevData,
        preferredFirstName: profileData.preferredFirstName
      }));
    } else if (!usePreferredFirstName) {
      // If checkbox is unchecked and no preferred name in profile, use firstName
      setFormData(prevData => ({
        ...prevData,
        preferredFirstName: prevData.firstName
      }));
    }
  }, [usePreferredFirstName, formData.firstName, profileData]);

  // Handle form submission and data retrieval
  useImperativeHandle(ref, () => ({
    async submitForm() {
      const formErrors = validateForm();
      if (Object.keys(formErrors).length === 0 && isEligible && validateDates() && !noValidDatesAvailable) {
        try {
          // Check phone number
          const phoneNumber = formData.phoneNumber?.replace(/\D/g, '');
          if (!readOnlyFields.phoneNumber && (!phoneNumber || phoneNumber.length < 10)) {
            setError('Please enter a valid phone number');
            return false;
          }
          
          // International student validation
          if (studentType === 'International Student' && 
              !readOnlyFields.country && 
              !readOnlyFields.documents) {
            const errors = [];
            if (!formData.country) {
              errors.push('Please select your country of origin');
            }
            if (!formData.documents?.passport || !formData.documents?.additionalID) {
              errors.push('Please upload all required documents (Passport and Additional ID)');
            }
            if (errors.length > 0) {
              setError(errors.join('. '));
              return false;
            }
          }
          
          await saveToPendingRegistration(formData);
          return true;
        } catch (err) {
          console.error("Form submission error:", err);
          setError('Failed to submit form');
          return false;
        }
      }
      return false;
    },
    getFormData: () => formData
  }));

  // Render a read-only field
  const renderReadOnlyField = (fieldName, value, label) => (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <input
        type="text"
        value={value}
        className="w-full p-2 border rounded-md bg-gray-50 cursor-not-allowed"
        readOnly
      />
      <p className="text-sm text-gray-500">
        This field cannot be changed as it's already set in your profile
      </p>
    </div>
  );

  // === Render the component ===
  return (
    <div className="space-y-8 relative">
      {/* Loading State */}
      {loading || settingsLoading ? (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Loading form data...</p>
        </div>
      ) : (
        <>
          {/* Saving Indicator */}
          {isSaving && (
            <div className="fixed top-4 right-4 z-50">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving changes...</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {(error || settingsError) && (
            <Alert className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-sm text-red-700">
                {error || settingsError}
              </AlertDescription>
            </Alert>
          )}

       {/* General Message from Settings */}
       {settings?.generalMessage && 
  // Create a DOM element to parse the HTML
  (() => {
    const div = document.createElement('div');
    div.innerHTML = settings.generalMessage;
    // Check if there's any text content after parsing the HTML
    return div.textContent.trim() !== '';
  })() && (
  <Alert className="bg-blue-50 border-blue-200">
    <InfoIcon className="h-4 w-4 text-blue-600 flex-shrink-0 mt-1" />
    <AlertDescription className="text-blue-700">
      <div 
        className="prose prose-sm max-w-none prose-blue"
        dangerouslySetInnerHTML={{ __html: settings.generalMessage }}
      />
    </AlertDescription>
  </Alert>
)}

    {/* Course Information Card */}
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md hover:shadow-lg transition-all duration-200 border-t-4 border-t-blue-400">
            <CardHeader>
              <h3 className="text-md font-semibold">Course Information</h3>
            </CardHeader>
            <CardContent className="grid gap-6">

              {/* Enrollment Year */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Enrollment Year <span className="text-red-500">*</span>
                </label>
                <select
                  name="enrollmentYear"
                  value={formData.enrollmentYear}
                  onChange={handleFormChange}
                  onBlur={() => handleBlur('enrollmentYear')}
                  className={`w-full p-2 border rounded-md ${
                    touched.enrollmentYear && errors.enrollmentYear ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select enrollment year</option>
                  {availableEnrollmentYears.map((year) => (
                    <option key={year} value={year}>
                      {year === getCurrentSchoolYear()
                        ? `Current School Year (${year})`
                        : `Next School Year (${year})`}
                    </option>
                  ))}
                </select>
                <ValidationFeedback
                  isValid={touched.enrollmentYear && !errors.enrollmentYear}
                  message={
                    touched.enrollmentYear
                      ? errors.enrollmentYear || validationRules.enrollmentYear.successMessage
                      : null
                  }
                />
                <p className="text-sm text-gray-500">{enrollmentYearMessage}</p>
              </div>

              {/* Course Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Course Selection <span className="text-red-500">*</span>
                </label>
                <select
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleCourseChange}
                  onBlur={() => handleBlur('courseId')}
                  className={`w-full p-2 border rounded-md ${
                    touched.courseId && errors.courseId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={coursesLoading}
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => {
                    const status = enrolledCourses[course.id];
                    const isDisabled = !!status; // Disable if there's any status

                    let statusText = '';
                    if (status === 'Registration') {
                      statusText = '(Pending Registration)';
                    } else if (status) {
                      statusText = '(Already Enrolled)';
                    }

                    return (
                      <option
                        key={course.id}
                        value={course.id}
                        disabled={isDisabled}
                      >
                        {course.title} {statusText}
                      </option>
                    );
                  })}
                </select>

                {coursesLoading && (
                  <p className="text-sm text-gray-500">Loading courses...</p>
                )}
                <ValidationFeedback
                  isValid={touched.courseId && !errors.courseId}
                  message={
                    touched.courseId
                      ? errors.courseId || validationRules.courseId.successMessage
                      : null
                  }
                />
                {coursesError && (
                  <p className="text-sm text-red-500">{coursesError}</p>
                )}
              </div>

        

              {/* Diploma Section */}
              {isDiplomaCourse && formData.courseId && (
                <div className="space-y-4">
                  <Alert className="bg-blue-50 border-blue-200">
                    <InfoIcon className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-sm text-blue-700">
                      This is a diploma course.{' '}
                      <a
                        href="https://www.alberta.ca/diploma-exams-overview"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Learn more about diploma exams
                      </a>
                    </AlertDescription>
                  </Alert>

                  <DiplomaMonthSelector
                    dates={diplomaDates}
                    selectedDate={selectedDiplomaDate}
                    onChange={handleDiplomaDateChange}
                    error={dateErrors.diplomaDate}
                    alreadyWroteDiploma={alreadyWroteDiploma}
                  />

                  {selectedDiplomaDate && (
                    <div className="text-sm text-gray-600">
                      <p>Important Notes:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Your diploma exam is scheduled for {formatDiplomaDate(selectedDiplomaDate)}</li>
                        <li>You must complete the course by your diploma exam date.</li>
                        {selectedDiplomaDate.registrationDeadline && (
                          <li className="font-medium text-amber-700">
                            <AlertTriangle className="inline-block h-4 w-4 mr-1" />
                            Registration deadline: {selectedDiplomaDate.registrationDeadlineDisplayDate}
                          </li>
                        )}
                        {!selectedDiplomaDate.confirmed && (
                          <li className="text-amber-600">This exam date is tentative and may be adjusted by Alberta Education.</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {alreadyWroteDiploma && (
                    <div className="text-sm text-gray-600">
                      <p>Since you've already written the diploma exam:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>You can complete the course at your own pace (subject to term dates).</li>
                        <li>Your previous diploma mark (30%) will be combined with your new school mark (70%).</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* No Valid Date Range Warning */}
              {noValidDatesAvailable && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-sm text-red-700">
                    <div className="font-semibold mb-1">No valid dates available!</div>
                    {dateErrors.endDate || (
                      <div>
                        There are no dates available that satisfy both the course requirements and registration constraints.
                        Please select a different course, a different diploma date, or try registering for the next school year.
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Course Dates Section */}
              <div className="space-y-4">
                <h4 className="font-medium">Course Schedule</h4>
                
                {/* Display time section message */}
                {formData.enrollmentYear && (
                  <>
                    {/* Show message from the selected time section */}
                
                    {getTimeSection(formData.enrollmentYear !== getCurrentSchoolYear()) && (
  <Alert className="bg-blue-50 border-blue-200">
    <InfoIcon className="h-4 w-4 text-blue-600 flex-shrink-0 mt-1" />
    <AlertDescription className="text-blue-700">
      {getTimeSection(formData.enrollmentYear !== getCurrentSchoolYear()).message ? (
        <div 
          className="prose prose-sm max-w-none prose-blue"
          dangerouslySetInnerHTML={{ 
            __html: getTimeSection(formData.enrollmentYear !== getCurrentSchoolYear()).message 
          }}
        />
      ) : (
        <span className="text-sm">
          Please select dates within the {getTimeSection(formData.enrollmentYear !== getCurrentSchoolYear())?.title || 'registration period'}.
        </span>
      )}
    </AlertDescription>
  </Alert>
)}
                  </>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DatePickerWithInfo
                    label="Start Date"
                    selected={formData.startDate}
                    onChange={handleStartDateChange}
                    minDate={getEffectiveDateConstraints().minStartDate}
                    maxDate={getEffectiveDateConstraints().maxStartDate}
                    helpText={
                      formData.enrollmentYear !== getCurrentSchoolYear()
                        ? "Please select a start date within the next school year registration window"
                        : isDiplomaCourse && selectedDiplomaDate && selectedDiplomaDate.registrationDeadline 
                            ? `Must register by ${selectedDiplomaDate.registrationDeadlineDisplayDate}`
                            : getEffectiveDateConstraints().maxStartDate
                                ? `Must start by ${formatDateForDisplay(getEffectiveDateConstraints().maxStartDate)}`
                                : "Please select a start date within the active registration window."
                    }
                    error={dateErrors.startDate}
                    isRegistrationDeadline={isDiplomaCourse && selectedDiplomaDate && selectedDiplomaDate.registrationDeadline}
                    hasActiveWindow={getEffectiveDateConstraints().hasActiveWindow}
                    isNextYear={formData.enrollmentYear !== getCurrentSchoolYear()}
                    timeSection={getEffectiveDateConstraints().timeSection}
                    studentType={studentType}
                    disabled={noValidDatesAvailable}
                  />

                  <DatePickerWithInfo
                    label="Completion Date"
                    selected={formData.endDate}
                    onChange={handleEndDateChange}
                    minDate={formData.startDate && minCompletionMonths ? 
                      getMinCompletionDate(formData.startDate, minCompletionMonths) : 
                      getMinEndDate(formData.startDate)}
                    maxDate={getMaxEndDate(isDiplomaCourse, alreadyWroteDiploma, selectedDiplomaDate)}
                    disabled={!formData.startDate || noValidDatesAvailable}
                    readOnly={isEndDateReadOnly}
                    helpText={
                      isDiplomaCourse && !alreadyWroteDiploma && selectedDiplomaDate
                        ? `Must be completed exactly on your diploma exam date (${formatDateForDisplay(toEdmontonDate(selectedDiplomaDate.displayDate))})`
                        : minCompletionMonths
                          ? `Must be at least ${minCompletionMonths} months after start date`
                          : getMaxEndDate(isDiplomaCourse, alreadyWroteDiploma, selectedDiplomaDate)
                              ? `Must be completed by ${formatDateForDisplay(getMaxEndDate(isDiplomaCourse, alreadyWroteDiploma, selectedDiplomaDate))}`
                              : "Recommended 5 months for course completion"
                    }
                    error={dateErrors.endDate}
                    studentType={studentType}
                    startDate={formData.startDate}
                    timeSection={getEffectiveDateConstraints().timeSection}
                    enrollmentYear={formData.enrollmentYear}
                    recommendedEndDate={recommendedEndDate}
                    isDiplomaCourse={isDiplomaCourse}
                    alreadyWroteDiploma={alreadyWroteDiploma}
                    selectedDiplomaDate={selectedDiplomaDate}
                  />
                </div>

        

                {dateErrors.summerNotice && (
                  <Alert className="bg-amber-50 border-amber-200">
                    <InfoIcon className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-sm text-amber-700">
                      {dateErrors.summerNotice}
                    </AlertDescription>
                  </Alert>
                )}

                {!getEffectiveDateConstraints().hasActiveWindow && (
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-sm text-amber-700">
                      There are currently no active registration windows for your student type. 
                      Please check back later or contact support for assistance.
                    </AlertDescription>
                  </Alert>
                )}

                {!formData.startDate && (
                  <p className="text-sm text-gray-500">Please select a start date first</p>
                )}

                {/* Show warning if all registration deadlines have passed */}
                {isDiplomaCourse && diplomaDates.length === 0 && (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-sm text-red-700">
                      Registration deadlines have passed for all upcoming diploma exams for this course.
                      Please select a different course or contact support for assistance.
                      </AlertDescription>
                  </Alert>
                )}

                {formData.startDate && formData.endDate && !noValidDatesAvailable && (
                  <div className="p-4 bg-gray-50 rounded-md space-y-2">
                    <div>
                      <h5 className="font-medium text-sm">Course Duration</h5>
                      <p className="text-sm text-gray-600">
                        {calculateDuration(formData.startDate, formData.endDate)}
                      </p>
                    </div>
                    
                    {courseHours && (
                      <div>
                        <h5 className="font-medium text-sm">Study Time Required</h5>
                        <p className="text-sm text-gray-600">
                          This is a {courseHours}-hour course. Based on your selected schedule, 
                          you will need to study approximately{' '}
                          <span className="font-medium">
                            {calculateHoursPerWeek(formData.startDate, formData.endDate, courseHours)}
                          </span>{' '}
                          hours per week.
                        </p>
                        
                        {parseFloat(calculateHoursPerWeek(formData.startDate, formData.endDate, courseHours)) > 20 && (
                          <p className="text-sm text-amber-600 mt-1">
                            <AlertTriangle className="inline-block h-4 w-4 mr-1" />
                            This schedule may be intensive. Consider extending your end date for a more manageable pace.
                          </p>
                        )}
                        
                        {parseFloat(calculateHoursPerWeek(formData.startDate, formData.endDate, courseHours)) < 3 && (
                          <p className="text-sm text-amber-600 mt-1">
                            <AlertTriangle className="inline-block h-4 w-4 mr-1" />
                            This schedule is quite spread out. Consider reducing the duration to maintain momentum.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {studentType === 'International Student' && (
            <>
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md hover:shadow-lg transition-all duration-200 border-t-4 border-t-blue-400">
                <CardHeader>
                  <h3 className="text-md font-semibold">Country Information</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Country of Origin <span className="text-red-500">*</span>
                    </label>
                    {readOnlyFields.country ? (
                      <input
                        type="text"
                        value={formData.country}
                        className="w-full p-2 border rounded-md bg-gray-50 cursor-not-allowed"
                        readOnly
                      />
                    ) : (
                      <Select
                        options={countryOptions}
                        value={countryOptions.find(option => option.value === formData.country)}
                        onChange={handleCountryChange}
                        className={touched.country && errors.country ? 'border-red-500' : ''}
                        placeholder="Select your country"
                      />
                    )}
                    {readOnlyFields.country && (
                      <p className="text-sm text-gray-500 mt-2">
                        Country of origin cannot be changed as it's already set in your profile
                      </p>
                    )}
                    {touched.country && errors.country && (
                      <ValidationFeedback
                        isValid={false}
                        message={errors.country}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <InternationalDocuments
                onUploadComplete={handleDocumentUpload}
                initialDocuments={documentUrls} 
              />
            </>
          )}

          {/* Profile Information Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md hover:shadow-lg transition-all duration-200 border-t-4 border-t-blue-400">
            <CardHeader>
              <h3 className="text-md font-semibold">Profile Information</h3>
            </CardHeader>
            <CardContent className="grid gap-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                {readOnlyFields.firstName ? (
                  renderReadOnlyField('firstName', formData.firstName, 'First Name')
                ) : (
                  <CapitalizedInput
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleFormChange}
                    onBlur={() => handleBlur('firstName')}
                    error={touched.firstName && errors.firstName}
                    touched={touched.firstName}
                    required={true}
                    successMessage={touched.firstName && !errors.firstName ? validationRules.firstName.successMessage : null}
                  />
                )}

                {readOnlyFields.lastName ? (
                  renderReadOnlyField('lastName', formData.lastName, 'Last Name')
                ) : (
                  <CapitalizedInput
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleFormChange}
                    onBlur={() => handleBlur('lastName')}
                    error={touched.lastName && errors.lastName}
                    touched={touched.lastName}
                    required={true}
                    successMessage={touched.lastName && !errors.lastName ? validationRules.lastName.successMessage : null}
                  />
                )}
              </div>

              {/* Preferred First Name */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={usePreferredFirstName}
                    onChange={(e) => setUsePreferredFirstName(e.target.checked)}
                    className="mr-2"
                  />
                  Use a preferred first name
                </label>
                {usePreferredFirstName && (
                  readOnlyFields.preferredFirstName ? (
                    renderReadOnlyField('preferredFirstName', formData.preferredFirstName, 'Preferred First Name')
                  ) : (
                    <div className="space-y-2">
                      <CapitalizedInput
                        label="Preferred First Name"
                        name="preferredFirstName"
                        value={formData.preferredFirstName}
                        onChange={handleFormChange}
                        onBlur={() => handleBlur('preferredFirstName')}
                        error={touched.preferredFirstName && errors.preferredFirstName}
                        touched={touched.preferredFirstName}
                        required={true}
                        successMessage={touched.preferredFirstName && !errors.preferredFirstName ? validationRules.preferredFirstName.successMessage : null}
                      />
                    </div>
                  )
                )}
              </div>

              <div className="space-y-4">
                {readOnlyFields.gender ? (
                  renderReadOnlyField('gender', formData.gender, 'Gender')
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleFormChange}
                      onBlur={() => handleBlur('gender')}
                      className={`w-full p-2 border rounded-md ${
                        touched.gender && errors.gender ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                    <ValidationFeedback
                      isValid={touched.gender && !errors.gender}
                      message={
                        touched.gender
                          ? errors.gender || validationRules.gender.successMessage
                          : null
                      }
                    />
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <input
                  type="email"
                  className="w-full p-2 border rounded-md bg-gray-50"
                  value={user.email}
                  readOnly
                />
              </div>

              {/* Phone Field */}
              {readOnlyFields.phoneNumber ? (
                renderReadOnlyField('phoneNumber', formData.phoneNumber, 'Phone Number')
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <PhoneInput
                    country={studentType === 'International Student' ? undefined : "ca"}
                    value={formData.phoneNumber}
                    onChange={(value, country, e, formattedValue) => {
                      handleFormChange({
                        target: {
                          name: 'phoneNumber',
                          value: formattedValue
                        }
                      });
                    }}
                    onBlur={() => handleBlur('phoneNumber')}
                    inputClass={`w-full p-2 border rounded-md ${
                      touched.phoneNumber && errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    containerClass="phone-input-container"
                    buttonClass="phone-input-button"
                    preferredCountries={studentType === 'International Student' ? [] : ["ca"]}
                    priority={studentType === 'International Student' ? {} : { ca: 0, us: 1 }}
                    enableSearch={studentType === 'International Student'}
                    searchPlaceholder="Search country..."
                    autoFormat={true}
                    required
                  />
                  <ValidationFeedback
                    isValid={touched.phoneNumber && !errors.phoneNumber}
                    message={
                      touched.phoneNumber
                        ? errors.phoneNumber || validationRules.phoneNumber.successMessage
                        : null
                    }
                  />
                  {studentType === 'International Student' && (
                    <p className="text-sm text-gray-500">
                      Please select your country code and enter your phone number
                    </p>
                  )}
                </div>
              )}
              {/* Birthday Section */}
              {readOnlyFields.birthday ? (
                renderReadOnlyField('birthday', formData.birthday, 'Birthday')
              ) : (
                <div className="space-y-2">
                  {ageInfo && (
                    <p className={`text-sm ${!isEligible ? 'text-red-600' : 'text-gray-600'}`}>
                      {ageInfo}
                    </p>
                  )}
                  <label className="text-sm font-medium">
                    Birthday <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    selected={formData.birthday ? toEdmontonDate(formData.birthday) : null}
                    onChange={handleDateChange}
                    maxDate={new Date()}
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                    openToDate={getInitialBirthdayDate()}
                    className={`w-full p-2 border rounded-md ${
                      touched.birthday && errors.birthday ? 'border-red-500' : 'border-gray-300'
                    }`}
                    onBlur={() => handleBlur('birthday')}
                  />
                  <ValidationFeedback
                    isValid={touched.birthday && !errors.birthday}
                    message={
                      touched.birthday
                        ? errors.birthday || validationRules.birthday.successMessage
                        : null
                    }
                  />
                </div>
              )}

              {/* Alberta Student Number (ASN) Section */}
              {readOnlyFields.albertaStudentNumber ? (
                renderReadOnlyField('albertaStudentNumber', formData.albertaStudentNumber, 'Alberta Student Number (ASN)')
              ) : (
                <div className="space-y-2">
                  <h4 className="text-md font-medium">
                    Alberta Student Number (ASN)
                    {(!studentType === 'International Student' || hasASN) && <span className="text-red-500">*</span>}
                  </h4>

                  {/* Display different messages based on student type */}
                  {studentType === 'International Student' ? (
                    <p className="text-sm text-gray-600">
                      If you have previously studied in Alberta, you may have an ASN.{' '}
                      <a
                        href="https://learnerregistry.ae.alberta.ca/Home/StartLookup"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Click here to check
                      </a>. If you do not have an ASN, please check the box below.
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Any student that has taken a course in Alberta has an ASN.{' '}
                      <a
                        href="https://learnerregistry.ae.alberta.ca/Home/StartLookup"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Click here to easily find yours
                      </a>.
                    </p>
                  )}

                  {/* Checkbox for international students to indicate they don't have an ASN */}
                  {studentType === 'International Student' && (
                    <div className="flex items-center space-x-2 mt-2">
                      <input
                        type="checkbox"
                        id="noASN"
                        checked={!hasASN}
                        onChange={(e) => {
                          setHasASN(!e.target.checked);
                          if (e.target.checked) {
                            // Clear ASN value when they indicate they don't have one
                            handleFormChange({
                              target: {
                                name: 'albertaStudentNumber',
                                value: ''
                              }
                            });
                          }
                          handleBlur('albertaStudentNumber');
                        }}
                      />
                      <label htmlFor="noASN" className="text-sm">
                        I do not have an Alberta Student Number (ASN)
                      </label>
                    </div>
                  )}

                  {/* Show ASN input only if the student has an ASN */}
                  {hasASN && (
                    <>
                      <input
                        type="text"
                        id="albertaStudentNumber"
                        name="albertaStudentNumber"
                        value={formData.albertaStudentNumber}
                        onChange={handleASNChange}
                        onBlur={() => handleBlur('albertaStudentNumber')}
                        className={`w-full p-2 border rounded-md ${
                          touched.albertaStudentNumber && errors.albertaStudentNumber 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        placeholder="####-####-#"
                        maxLength={11} // Account for the two hyphens
                      />
                      <ValidationFeedback
                        isValid={touched.albertaStudentNumber && !errors.albertaStudentNumber}
                        message={
                          touched.albertaStudentNumber
                            ? errors.albertaStudentNumber || validationRules.albertaStudentNumber.successMessage
                            : null
                        }
                      />
                    </>
                  )}

                  {/* Message to international students who don't have an ASN */}
                  {studentType === 'International Student' && !hasASN && (
                    <Alert className="bg-gray-100 text-gray-700 border-gray-300">
                      <AlertDescription>
                        <strong className="block mb-2">Important Information for International Students</strong>
                        Since you do not currently have an Alberta Student Number (ASN), one will be automatically generated for you when we add you to Alberta's PASI system during enrollment. Once this process is complete, your ASN will appear in your profile.
                        <br />
                        <br />
                        This number is essential for your schooling in Alberta, so please keep it safe for future reference.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* School/Home Education Selection Section */}
              {shouldShowSchoolSelection(studentType) && (
                <div className="space-y-2">
                  <div className="mb-2">
                    <label className="text-sm font-medium">
                      {isHomeEducation(studentType) ? 'Home Education Provider' : 'Current School'} <span className="text-red-500">*</span>
                    </label>
                    <p className="text-sm text-gray-600">
                      {isHomeEducation(studentType)
                        ? 'Search for your home education provider'
                        : 'Start typing the name of your school, and then select it from the list'}
                    </p>
                  </div>

                  {isHomeEducation(studentType) ? (
                    <HomeSchoolSelector
                      onAddressSelect={(addressDetails) => {
                        if (addressDetails) {
                          setFormData(prev => ({
                            ...prev,
                            currentSchool: addressDetails.name,
                            schoolAddress: {
                              name: addressDetails.name,
                              streetAddress: addressDetails.streetAddress,
                              city: addressDetails.city,
                              province: addressDetails.province,
                              placeId: addressDetails.placeId,
                              fullAddress: addressDetails.fullAddress,
                              location: addressDetails.location
                            }
                          }));
                        
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            currentSchool: '',
                            schoolAddress: null
                          }));
                        }
                      }}
                    />
                  ) : (
                    <SchoolAddressPicker
                      onAddressSelect={(addressDetails) => {
                        if (addressDetails) {
                          setFormData(prev => ({
                            ...prev,
                            currentSchool: addressDetails.name,
                            schoolAddress: {
                              name: addressDetails.name,
                              streetAddress: addressDetails.streetAddress,
                              city: addressDetails.city,
                              province: addressDetails.province,
                              placeId: addressDetails.placeId,
                              fullAddress: addressDetails.fullAddress,
                              location: addressDetails.location
                            }
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            currentSchool: '',
                            schoolAddress: null
                          }));
                        }
                      }}
                      required
                    />
                  )}
                  {touched.schoolAddress && errors.schoolAddress && (
                    <ValidationFeedback
                      isValid={false}
                      message={errors.schoolAddress}
                    />
                  )}
                </div>
              )}

              {/* Parent Information Section */}
              {user18OrOlder ? (
                <div className="space-y-6">
                  <h4 className="text-md font-medium">Parent/Guardian Information (Optional)</h4>
                  <p className="text-sm text-gray-600">
                    As you are 18 or older, parent/guardian information is optional.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    {readOnlyFields.parentFirstName ? (
                      renderReadOnlyField('parentFirstName', formData.parentFirstName, 'Parent First Name')
                    ) : (
                      <CapitalizedInput
                        label="Parent First Name"
                        name="parentFirstName"
                        value={formData.parentFirstName}
                        onChange={handleFormChange}
                        onBlur={() => handleBlur('parentFirstName')}
                        error={touched.parentFirstName && errors.parentFirstName}
                        touched={touched.parentFirstName}
                        required={false}
                        successMessage={touched.parentFirstName && !errors.parentFirstName ? validationRules.parentFirstName.successMessage : null}
                      />
                    )}

                    {readOnlyFields.parentLastName ? (
                      renderReadOnlyField('parentLastName', formData.parentLastName, 'Parent Last Name')
                    ) : (
                      <CapitalizedInput
                        label="Parent Last Name"
                        name="parentLastName"
                        value={formData.parentLastName}
                        onChange={handleFormChange}
                        onBlur={() => handleBlur('parentLastName')}
                        error={touched.parentLastName && errors.parentLastName}
                        touched={touched.parentLastName}
                        required={false}
                        successMessage={touched.parentLastName && !errors.parentLastName ? validationRules.parentLastName.successMessage : null}
                      />
                    )}
                  </div>

                  {readOnlyFields.parentPhone ? (
                    renderReadOnlyField('parentPhone', formData.parentPhone, 'Parent Phone Number')
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Parent Phone Number</label>
                      <PhoneInput
                        country={"ca"}
                        value={formData.parentPhone}
                        onChange={(value, country, e, formattedValue) => {
                          handleFormChange({
                            target: {
                              name: 'parentPhone',
                              value: formattedValue
                            }
                          });
                        }}
                        onBlur={() => handleBlur('parentPhone')}
                        inputClass={`w-full p-2 border rounded-md ${
                          touched.parentPhone && errors.parentPhone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        containerClass="phone-input-container"
                        buttonClass="phone-input-button"
                        preferredCountries={["ca"]}
                        priority={{ ca: 0, us: 1 }}
                      />
                      <ValidationFeedback
                        isValid={touched.parentPhone && !errors.parentPhone}
                        message={
                          touched.parentPhone
                            ? errors.parentPhone || validationRules.parentPhone.successMessage
                            : null
                        }
                      />
                    </div>
                  )}

                  {readOnlyFields.parentEmail ? (
                    renderReadOnlyField('parentEmail', formData.parentEmail, 'Parent Email')
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Parent Email</label>
                      <input
                        type="email"
                        id="parentEmail"
                        name="parentEmail"
                        value={formData.parentEmail}
                        onChange={handleFormChange}
                        onBlur={() => handleBlur('parentEmail')}
                        className={`w-full p-2 border rounded-md ${
                          touched.parentEmail && errors.parentEmail ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <ValidationFeedback
                        isValid={touched.parentEmail && !errors.parentEmail}
                        message={
                          touched.parentEmail
                            ? errors.parentEmail || validationRules.parentEmail.successMessage
                            : null
                        }
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <h4 className="text-md font-medium">Parent/Guardian Information (Required)</h4>
                  <p className="text-sm text-gray-600">
                    As you are under 18, parent/guardian information is required.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    {readOnlyFields.parentFirstName ? (
                      renderReadOnlyField('parentFirstName', formData.parentFirstName, 'Parent First Name')
                    ) : (
                      <CapitalizedInput
                        label="Parent First Name"
                        name="parentFirstName"
                        value={formData.parentFirstName}
                        onChange={handleFormChange}
                        onBlur={() => handleBlur('parentFirstName')}
                        error={touched.parentFirstName && errors.parentFirstName}
                        touched={touched.parentFirstName}
                        required={true}
                        successMessage={touched.parentFirstName && !errors.parentFirstName ? validationRules.parentFirstName.successMessage : null}
                      />
                    )}

                    {readOnlyFields.parentLastName ? (
                      renderReadOnlyField('parentLastName', formData.parentLastName, 'Parent Last Name')
                    ) : (
                      <CapitalizedInput
                        label="Parent Last Name"
                        name="parentLastName"
                        value={formData.parentLastName}
                        onChange={handleFormChange}
                        onBlur={() => handleBlur('parentLastName')}
                        error={touched.parentLastName && errors.parentLastName}
                        touched={touched.parentLastName}
                        required={true}
                        successMessage={touched.parentLastName && !errors.parentLastName ? validationRules.parentLastName.successMessage : null}
                      />
                    )}
                  </div>

                  {readOnlyFields.parentPhone ? (
                    renderReadOnlyField('parentPhone', formData.parentPhone, 'Parent Phone Number')
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Parent Phone Number <span className="text-red-500">*</span>
                      </label>
                      <PhoneInput
                        country={studentType === 'International Student' ? undefined : "ca"}
                        value={formData.parentPhone}
                        onChange={(value, country, e, formattedValue) => {
                          handleFormChange({
                            target: {
                              name: 'parentPhone',
                              value: formattedValue
                            }
                          });
                        }}
                        onBlur={() => handleBlur('parentPhone')}
                        inputClass={`w-full p-2 border rounded-md ${
                          touched.parentPhone && errors.parentPhone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        containerClass="phone-input-container"
                        buttonClass="phone-input-button"
                        preferredCountries={studentType === 'International Student' ? [] : ["ca"]}
                        priority={studentType === 'International Student' ? {} : { ca: 0, us: 1 }}
                        enableSearch={studentType === 'International Student'}
                        searchPlaceholder="Search country..."
                        autoFormat={true}
                        required
                      />
                      <ValidationFeedback
                        isValid={touched.parentPhone && !errors.parentPhone}
                        message={
                          touched.parentPhone
                            ? errors.parentPhone || validationRules.parentPhone.successMessage
                            : null
                        }
                      />
                      {studentType === 'International Student' && (
                        <p className="text-sm text-gray-500">
                          Please select your country code and enter your parent's phone number
                        </p>
                      )}
                    </div>
                  )}

                  {readOnlyFields.parentEmail ? (
                    renderReadOnlyField('parentEmail', formData.parentEmail, 'Parent Email')
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Parent Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="parentEmail"
                        name="parentEmail"
                        value={formData.parentEmail}
                        onChange={handleFormChange}
                        onBlur={() => handleBlur('parentEmail')}
                        className={`w-full p-2 border rounded-md ${
                          touched.parentEmail && errors.parentEmail ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                      <ValidationFeedback
                        isValid={touched.parentEmail && !errors.parentEmail}
                        message={
                          touched.parentEmail
                            ? errors.parentEmail || validationRules.parentEmail.successMessage
                            : null
                        }
                      />
                      <p className="text-sm text-gray-500">
                        Your parent/guardian will receive an email and will need to grant permission for you to join the course.
                        Please ensure that the parent email is correct.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

      

          {/* Additional Information Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md hover:shadow-lg transition-all duration-200 border-t-4 border-t-blue-400">
            <CardHeader>
              <h3 className="text-md font-semibold">Additional Information</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Is there anything else you would like us to know?
                </label>
                <textarea
                 name="additionalInformation"
                 value={formData.additionalInformation}
                 onChange={handleFormChange}
                 onBlur={() => handleBlur('additionalInformation')}
                 className="w-full p-3 border rounded-md min-h-[100px] resize-y"
                 placeholder="Please share any additional information that might be relevant to your registration (optional)"
                />
                <p className="text-sm text-gray-500">
                  You can use this space to share any additional context, special circumstances, or specific needs we should be aware of.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Eligibility Alert */}
          {!isEligible && studentType !== 'Adult Student' && (
            <Alert className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-sm text-red-700">
                You are not eligible to continue with the registration because you are over 20 years old.
                Please choose a different birthday or select 'Cancel' and register as an Adult Student.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
});

NonPrimaryStudentForm.displayName = 'NonPrimaryStudentForm';

export default NonPrimaryStudentForm;

// === Additional Components Used in the Form ===

// Enhanced DatePickerWithInfo Component
const DatePickerWithInfo = ({
  label,
  selected,
  onChange,
  minDate,
  maxDate,
  helpText,
  error,
  notice,
  disabled = false,
  readOnly = false,
  studentType,
  startDate,
  isRegistrationDeadline = false,
  hasActiveWindow = true,
  timeSection = null,
  isNextYear = false,
  recommendedEndDate = null,
  isDiplomaCourse = false,
  alreadyWroteDiploma = false,
  selectedDiplomaDate = null
 }) => {
  // Function to calculate the default open date (5 months from start date)
  const getOpenToDate = () => {
    if (!startDate || label !== 'Completion Date') return null;
    
    // If there's a recommended end date, use that
    if (recommendedEndDate) return recommendedEndDate;
    
    // Otherwise, default to 5 months after start date
    const openDate = toEdmontonDate(startDate);
    openDate.setMonth(openDate.getMonth() + 5);
    return openDate;
  };
 
  // Function to get excluded date intervals based on student type
  const getExcludedIntervals = () => {
    // For next year selections, don't exclude any dates
    if (isNextYear) return [];
    
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    
    if (studentType === 'Summer School') {
      return [
        {
          start: new Date(currentYear, 0, 1),
          end: new Date(currentYear, 5, 30)
        },
        {
          start: new Date(currentYear, 8, 1),
          end: new Date(currentYear, 11, 31)
        },
        {
          start: new Date(nextYear, 0, 1),
          end: new Date(nextYear, 5, 30)
        },
        {
          start: new Date(nextYear, 8, 1),
          end: new Date(nextYear, 11, 31)
        }
      ];
    }
    return [];
  };
 
  // Get appropriate warning message based on student type and constraints
  // Get appropriate warning message based on student type and constraints
const getWarningMessage = () => {
  if (!hasActiveWindow) {
    return "There are currently no active registration windows for your student type.";
  }
  
  if (isRegistrationDeadline && maxDate) {
    return `Note: You must register by ${formatDateForDisplay(maxDate)} to qualify for this diploma exam.`;
  }
  
  if (timeSection) {
    if (label === "Start Date") {
      return `Note: Your start date must be between ${formatDateForDisplay(minDate)} and ${formatDateForDisplay(maxDate)}.`;
    } else if (label === "Completion Date") {
      // For diploma courses, indicate exact date requirement
      if (isDiplomaCourse && !alreadyWroteDiploma && selectedDiplomaDate) {
        return `Note: Your completion date must be exactly on your diploma exam date (${formatDateForDisplay(maxDate)}).`;
      } else if (studentType !== 'Adult Student' && studentType !== 'International Student') {
        // Only show end date constraint for student types other than Adult or International
        return `Note: Your completion date must be on or before ${formatDateForDisplay(maxDate)}.`;
      }
    }
  }
  
  if (studentType === 'Summer School') {
    return "Note: Summer School courses must be completed in July or August.";
  }
  
  return null;
};
 
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">
          {label} <span className="text-red-500">*</span>
        </label>
        {helpText && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">{helpText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <DatePicker
        selected={selected ? toEdmontonDate(selected) : null}
        onChange={onChange}
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled || !hasActiveWindow}
        readOnly={readOnly}
        excludeDateIntervals={getExcludedIntervals()}
        openToDate={getOpenToDate()}
        customInput={
          <CustomDateInput
            disabled={disabled || !hasActiveWindow}
            readOnly={readOnly}
            error={error}
            placeholder="Select date"
          />
        }
        dateFormat="MMMM d, yyyy"
        placeholderText="Select date"
      />
      
      {error && (
        <div className="flex items-center gap-2 mt-1">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-500">{error}</span>
        </div>
      )}
      
      {notice && (
        <div className="flex items-center gap-2 mt-1">
          <InfoIcon className="h-4 w-4 text-blue-500" />
          <span className="text-sm text-blue-700">{notice}</span>
        </div>
      )}
      
      {recommendedEndDate && label === "Completion Date" && !readOnly && !disabled && (
        <div className="flex items-start gap-2 mt-1">
          <InfoIcon className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-blue-700">
            Recommended completion date: {formatDateForDisplay(recommendedEndDate)}
          </span>
        </div>
      )}
      
      {getWarningMessage() && (
        <div className="flex items-start gap-2 mt-1">
          <InfoIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-gray-500">{getWarningMessage()}</span>
        </div>
      )}
    </div>
  );
 };

// Custom input component for DatePicker
const CustomDateInput = forwardRef(({ value, onClick, disabled, readOnly, error, placeholder }, ref) => (
 <div className="relative">
   <input
     type="text"
     value={value || ''}
     onClick={disabled || readOnly ? undefined : onClick}
     readOnly
     disabled={disabled}
     className={`w-full p-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'} ${
       disabled || readOnly ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'
     }`}
     placeholder={placeholder || 'Select date'}
     ref={ref}
   />
   <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
 </div>
));
CustomDateInput.displayName = 'CustomDateInput';