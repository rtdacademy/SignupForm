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
  Shield,
  Users,
  FileText,
  HelpCircle
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
import AddressPicker from '../components/AddressPicker';
import { getDatabase, ref as databaseRef, get, set } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import InternationalDocuments from './InternationalDocuments';
import StudentPhotoUpload from './StudentPhotoUpload';
import CitizenshipDocuments from './CitizenshipDocuments';
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
  const [currentSchoolYearKey, setCurrentSchoolYearKey] = useState(null);

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
        
        // Store the current school year key for use in building paths
        setCurrentSchoolYearKey(schoolYearKey);
        
        // Convert student type to the format used in Firebase (replace spaces with dashes)
        const studentTypeKey = studentType.replace(/\s+/g, '-');
        
        console.log(`Fetching settings for ${studentTypeKey} in school year ${schoolYearKey}`);
        
        const db = getDatabase();
        const settingsRef = databaseRef(db, `registrationSettings/${schoolYearKey}/${studentTypeKey}`);
        const snapshot = await get(settingsRef);

        if (snapshot.exists()) {
          const settingsData = snapshot.val();
          console.log('Registration settings loaded:', settingsData);
          // Log time sections to see their structure
          if (settingsData.timeSections) {
            console.log('Time sections:', settingsData.timeSections);
            settingsData.timeSections.forEach((section, index) => {
              console.log(`Time section ${index}:`, section);
            });
          }
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
    
    // Find the index of the first matching section in the original array
    const firstMatchingSection = relevantSections[0];
    const sectionIndex = settings.timeSections.findIndex(section => section === firstMatchingSection);
    
    // Return the section with its index
    return {
      ...firstMatchingSection,
      originalIndex: sectionIndex
    };
  }, [settings]);

  // Check if a time section is currently active (today is within start window AND isActive flag is true)
  const isTimeSectionActive = useCallback((timeSection) => {
    if (!timeSection) return false;
    
    // First check if the section is explicitly marked as inactive
    if (timeSection.isActive === false) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // If startFromToday is true or startBegins is set to 1900-01-01, 
    // we only need to check the end date
    if (timeSection.startFromToday || timeSection.startBegins === '1900-01-01') {
      const startEnds = toEdmontonDate(timeSection.startEnds);
      startEnds.setHours(23, 59, 59, 999);
      
      // Only check if today is before the end date
      return today <= startEnds;
    }
    
    // Otherwise check the normal date range
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
      
      const startEnds = toEdmontonDate(timeSection.startEnds);
      startEnds.setHours(23, 59, 59, 999);
      
      // Handle startFromToday flag or special date 1900-01-01
      if (timeSection.startFromToday || timeSection.startBegins === '1900-01-01') {
        // If start from today is enabled, min date is always today
        return {
          min: today,
          max: startEnds
        };
      }
      
      // Normal case - use timeSection.startBegins
      const startBegins = toEdmontonDate(timeSection.startBegins);
      startBegins.setHours(0, 0, 0, 0);
      
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
    crossesSchoolYearBoundary,
    currentSchoolYearKey
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
    getGeneralMessage,
    currentSchoolYearKey
  } = useRegistrationSettings(studentType);


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
      
      // Check if the registration settings path needs to be fixed
      if (initialData.registrationSettingsPath && 
          !initialData.registrationSettingsPath.includes('/timeSections/') &&
          initialData.timeSectionId) {
        console.log('Initial data has incomplete registration settings path, will be fixed when currentSchoolYearKey is available');
      }
      
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
  
    // Set default term based on student type
    let defaultTerm = 'Full Year';
    if (studentType === 'Non-Primary' || studentType === 'Home Education') {
      defaultTerm = 'Term 1';
    } else if (studentType === 'Summer School') {
      defaultTerm = 'Summer';
    }
    
    const formData = {
      gender: '',
      firstName: validationRules.firstName.format(user?.displayName?.split(' ')[0] || ''),
      lastName: validationRules.lastName.format(user?.displayName?.split(' ').slice(1).join(' ') || ''),
      preferredFirstName: '', 
      phoneNumber: '',
      address: null, // Add address field
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
      term: defaultTerm, // Initialize with default term based on student type
      documents: {
        passport: '',
        additionalID: '',
        residencyProof: ''
      },
      internationalDocuments: [], // New array format for international documents
      registrationSettingsPath: null,
      timeSectionId: null,
      // New fields
      studentPhoto: '',
      albertaResident: false,
      parentRelationship: '',
      isLegalGuardian: false,
      hasLegalRestrictions: '',
      legalDocumentUrl: '',
      indigenousIdentification: '',
      indigenousStatus: '',
      citizenshipDocuments: [],
      howDidYouHear: '',
      whyApplying: ''
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
  const [areDatesValid, setAreDatesValid] = useState(false);

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
  
  // Ensure registration settings are populated when enrollment year is set
  useEffect(() => {
    console.log('Registration settings path effect check:', {
      enrollmentYear: formData.enrollmentYear,
      studentType,
      hasRegistrationSettingsPath: !!formData.registrationSettingsPath,
      currentSchoolYearKey,
      settingsLoading
    });
    
    // Only build path if we have the school year key from settings
    if (formData.enrollmentYear && studentType && !formData.registrationSettingsPath && currentSchoolYearKey) {
      const isNextYear = formData.enrollmentYear !== getCurrentSchoolYear();
      const timeSection = getTimeSection(isNextYear);
      
      // Build registration settings path using the actual school year from settings
      const studentTypeKey = studentType.replace(/\s+/g, '-');
      const registrationBasePath = `/registrationSettings/${currentSchoolYearKey}/${studentTypeKey}`;
      
      // Create the full path including the time section index if available
      const registrationSettingsPath = timeSection?.originalIndex !== undefined ?
        `${registrationBasePath}/timeSections/${timeSection.originalIndex}` : registrationBasePath;
      
      console.log('Populating missing registration settings:', {
        enrollmentYear: formData.enrollmentYear,
        studentType,
        currentSchoolYearKey,
        registrationSettingsPath,
        timeSectionId: timeSection?.id,
        timeSectionOriginalIndex: timeSection?.originalIndex
      });
      
      setFormData(prev => ({
        ...prev,
        registrationSettingsPath: registrationSettingsPath,
        timeSectionId: timeSection?.id || null
      }));
    }
  }, [formData.enrollmentYear, studentType, formData.registrationSettingsPath, getCurrentSchoolYear, getTimeSection, currentSchoolYearKey, settingsLoading]);
  
  // Fix registration settings path when school year key becomes available
  useEffect(() => {
    // Only fix if the path exists but is missing the time section
    if (currentSchoolYearKey && 
        formData.enrollmentYear && 
        formData.registrationSettingsPath && 
        !formData.registrationSettingsPath.includes("/timeSections/")) {
      
      console.log('Fixing incomplete registration settings path');
      
      const isNextYear = formData.enrollmentYear !== getCurrentSchoolYear();
      const timeSection = getTimeSection(isNextYear);
      
      if (timeSection) {
        const studentTypeKey = studentType.replace(/\s+/g, '-');
        const registrationBasePath = `/registrationSettings/${currentSchoolYearKey}/${studentTypeKey}`;
        const registrationSettingsPath = timeSection.originalIndex !== undefined ?
          `${registrationBasePath}/timeSections/${timeSection.originalIndex}` : registrationBasePath;
        
        console.log('Fixed registration settings path:', {
          oldPath: formData.registrationSettingsPath,
          newPath: registrationSettingsPath
        });
        
        setFormData(prev => ({
          ...prev,
          registrationSettingsPath: registrationSettingsPath,
          timeSectionId: timeSection.id || null
        }));
      }
    }
  }, [currentSchoolYearKey]); // Only depend on school year key to avoid loops
  
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
            parentRelationship: snapshot.val().parentRelationship || prev.parentRelationship,
            isLegalGuardian: snapshot.val().isLegalGuardian || prev.isLegalGuardian,
            // Pre-populate student photo from profile
            studentPhoto: snapshot.val().studentPhoto || prev.studentPhoto,
            // Pre-populate Indigenous identification from profile
            indigenousIdentification: snapshot.val().indigenousIdentification || prev.indigenousIdentification,
            indigenousStatus: snapshot.val().indigenousStatus || prev.indigenousStatus,
            // Pre-populate marketing question from profile
            howDidYouHear: snapshot.val().howDidYouHear || prev.howDidYouHear,
            // Pre-populate citizenship documents from profile, marking as from profile
            citizenshipDocuments: (() => {
              let profileCitizenshipDocs = snapshot.val().citizenshipDocuments || prev.citizenshipDocuments;
              if (Array.isArray(profileCitizenshipDocs)) {
                profileCitizenshipDocs = profileCitizenshipDocs.map(doc => ({ ...doc, fromProfile: true }));
              }
              return profileCitizenshipDocs;
            })(),
            // Don't pre-populate address - require fresh input for each registration
            // address: snapshot.val().address || prev.address,
          }));

          // Set document URLs if they exist (for international students)
          if (snapshot.val().internationalDocuments) {
            setDocumentUrls(prev => ({
              ...prev,
              passport: snapshot.val().internationalDocuments.passport || '',
              additionalID: snapshot.val().internationalDocuments.additionalID || '',
              residencyProof: snapshot.val().internationalDocuments.residencyProof || ''
            }));
            
            // Also set in form data for compatibility, marking as from profile
            let profileDocs = snapshot.val().internationalDocuments || [];
            if (Array.isArray(profileDocs)) {
              profileDocs = profileDocs.map(doc => ({ ...doc, fromProfile: true }));
            }
            
            setFormData(prev => ({
              ...prev,
              internationalDocuments: profileDocs
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
      parentRelationship: !!profileData.parentRelationship,
      documents: !!(profileData.internationalDocuments?.passport && 
                  profileData.internationalDocuments?.additionalID),
      internationalDocuments: !!(profileData.internationalDocuments && 
                                Array.isArray(profileData.internationalDocuments) && 
                                profileData.internationalDocuments.length > 0),
      studentPhoto: !!profileData.studentPhoto,
      indigenousIdentification: !!profileData.indigenousIdentification,
      indigenousStatus: !!profileData.indigenousStatus,
      howDidYouHear: !!profileData.howDidYouHear,
      citizenshipDocuments: !!(profileData.citizenshipDocuments && 
                              Array.isArray(profileData.citizenshipDocuments) && 
                              profileData.citizenshipDocuments.length > 0),
      // Don't make address read-only - require fresh input for each registration
      // address: !!profileData.address
    };
  }, [profileData]);

  // Initialize form validation
  const validationOptions = useMemo(() => ({
    conditionalValidation: {
      parentFirstName: () => !user18OrOlder && !readOnlyFields.parentFirstName,
      parentLastName: () => !user18OrOlder && !readOnlyFields.parentLastName,
      parentPhone: () => !user18OrOlder && !readOnlyFields.parentPhone,
      parentEmail: () => !user18OrOlder && !readOnlyFields.parentEmail,
      preferredFirstName: () => usePreferredFirstName,
      documents: () => studentType === 'International Student' && !readOnlyFields.documents && !readOnlyFields.internationalDocuments,
      albertaStudentNumber: () => {
        if (studentType === 'International Student' && !hasASN) {
          return false; // Do not validate ASN
        }
        return true; // Validate ASN
      },
      schoolAddress: () => studentType === 'Non-Primary' || studentType === 'Home Education',
      parentRelationship: () => !user18OrOlder && !readOnlyFields.parentRelationship,
      legalDocumentUrl: () => formData.hasLegalRestrictions === 'yes',
      indigenousIdentification: () => studentType !== 'International Student' && !readOnlyFields.indigenousIdentification,
      indigenousStatus: () => formData.indigenousIdentification === 'yes' && !readOnlyFields.indigenousStatus,
      citizenshipDocuments: () => studentType !== 'International Student' && !readOnlyFields.citizenshipDocuments,
      albertaResident: () => studentType !== 'International Student' && !user18OrOlder,
    },
    readOnlyFields,
    formData // Pass the entire formData to the validation
  }), [user18OrOlder, usePreferredFirstName, readOnlyFields, studentType, formData, hasASN]);

  const rules = useMemo(() => ({
    ...validationRules,
    email: undefined,
    schoolAddress: validationRules.schoolAddress || {
      validate: (value, options) => {
        // Only validate for Non-Primary and Home Education students
        if (options?.formData?.studentType === 'Non-Primary' || options?.formData?.studentType === 'Home Education') {
          if (!value || !value.name) {
            return options?.formData?.studentType === 'Home Education' ? 
              "Home education provider selection is required" : 
              "School selection is required";
          }
        }
        return null;
      },
      required: true,
      successMessage: "School selected"
    }
  }), []);
  const {
    errors,
    touched,
    isValid,
    completionPercentage,
    handleBlur,
    validateForm,
    getFieldStatus
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
      
      // Ensure registration settings path is built correctly before saving
      let dataToSave = { ...formDataToSave };
      
      if (currentSchoolYearKey && formDataToSave.enrollmentYear && studentType) {
        const isNextYear = formDataToSave.enrollmentYear !== getCurrentSchoolYear();
        const timeSection = getTimeSection(isNextYear);
        
        // Always rebuild the path with the correct school year key
        const studentTypeKey = studentType.replace(/\s+/g, '-');
        const registrationBasePath = `/registrationSettings/${currentSchoolYearKey}/${studentTypeKey}`;
        
        // Create the full path including the time section index if available
        const registrationSettingsPath = timeSection?.originalIndex !== undefined ?
          `${registrationBasePath}/timeSections/${timeSection.originalIndex}` : registrationBasePath;
        
        dataToSave.registrationSettingsPath = registrationSettingsPath;
        dataToSave.timeSectionId = timeSection?.id || null;
      }
      
      console.log('Saving to pending registration - corrected data:', {
        registrationSettingsPath: dataToSave.registrationSettingsPath,
        timeSectionId: dataToSave.timeSectionId,
        studentType: dataToSave.studentType,
        enrollmentYear: dataToSave.enrollmentYear,
        currentSchoolYearKey: currentSchoolYearKey
      });
      
      const db = getDatabase();
      const pendingRegRef = databaseRef(db, `users/${uid}/pendingRegistration`);
      await set(pendingRegRef, {
        formData: dataToSave,
        lastUpdated: new Date().toISOString()
      });
      if (onSave) {
        await onSave(dataToSave);
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
        
        // Update term based on the new enrollment year's time section
        const isNextYear = value !== getCurrentSchoolYear();
        const timeSection = getTimeSection(isNextYear);
        
        // Build registration settings path only if we have the school year key from settings
        let registrationSettingsPath = null;
        if (currentSchoolYearKey && studentType) {
          const studentTypeKey = studentType.replace(/\s+/g, '-');
          const registrationBasePath = `/registrationSettings/${currentSchoolYearKey}/${studentTypeKey}`;
          
          // Create the full path including the time section index if available
          registrationSettingsPath = timeSection?.originalIndex !== undefined ?
            `${registrationBasePath}/timeSections/${timeSection.originalIndex}` : registrationBasePath;
        }
        
        console.log('Enrollment year change - updating registration settings:', {
          enrollmentYear: value,
          currentSchoolYearKey,
          studentType,
          registrationSettingsPath,
          timeSection,
          timeSectionId: timeSection?.id,
          timeSectionOriginalIndex: timeSection?.originalIndex
        });
        
        return {
          ...prev,
          [name]: value,
          startDate: '',
          endDate: '',
          // Update term if available from time section
          term: timeSection?.term || prev.term,
          // Update registration settings info
          registrationSettingsPath: registrationSettingsPath,
          timeSectionId: timeSection?.id || null
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
  }, [handleBlur, getCurrentSchoolYear, getTimeSection, studentType, currentSchoolYearKey]);


  const handleDocumentUpload = (type, data) => {
    // Handle both old format (type, url) and new format ('internationalDocuments', array)
    if (type === 'internationalDocuments') {
      // New array format from updated InternationalDocuments component
      setFormData(prev => ({
        ...prev,
        internationalDocuments: data,
        documents: data // Also set documents field for backward compatibility
      }));
      handleBlur('internationalDocuments');
      handleBlur('documents');
    } else {
      // Old format - keep for backward compatibility
      setDocumentUrls(prev => ({
        ...prev,
        [type]: data
      }));
      
      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [type]: data
        }
      }));
      
      // Trigger validation after state update
      handleBlur('documents');
    }
  };

  // Handle file uploads for new fields
  const handleFileUpload = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    handleBlur(fieldName);
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
    
    // Build registration settings path
    const schoolYearKey = formData.enrollmentYear ? formData.enrollmentYear.replace('/', '_') : '';
    const studentTypeKey = studentType ? studentType.replace(/\s+/g, '-') : '';
    const registrationSettingsPath = schoolYearKey && studentTypeKey ? 
      `/registrationSettings/${schoolYearKey}/${studentTypeKey}` : null;
    
    if (!timeSection) {
      console.log(`No time section found for ${isNextYear ? 'next' : 'current'} year`);
      return {
        minStartDate: today,
        maxStartDate: null,
        hasActiveWindow: false,
        needsDiplomaSelection: isDiplomaCourse && !selectedDiplomaDate && !alreadyWroteDiploma,
        isNextYear,
        timeSection: null,
        registrationSettingsPath,
        timeSectionId: null
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
      timeSection,
      registrationSettingsPath,
      timeSectionId: timeSection.id || null
    };
  }, [
    getCurrentSchoolYear,
    formData.enrollmentYear,
    getTimeSection,
    isTimeSectionActive,
    getDateConstraints,
    isDiplomaCourse,
    selectedDiplomaDate,
    alreadyWroteDiploma,
    studentType
  ]);

  // Handle start date changes
  const handleStartDateChange = (date) => {
    const { 
      minStartDate, 
      maxStartDate, 
      hasActiveWindow, 
      needsDiplomaSelection,
      isNextYear,
      timeSection,
      registrationSettingsPath,
      timeSectionId
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
  
    // If all checks pass, update the start date and registration settings
    handleFormChange({
      target: {
        name: 'startDate',
        value: toDateString(date)
      }
    });
    
    // Mark field as touched for validation
    handleBlur('startDate');
    
    // Update registration settings path and time section ID
    console.log('Updating registration settings:', {
      registrationSettingsPath,
      timeSectionId,
      timeSection
    });
    
    setFormData(prev => ({
      ...prev,
      registrationSettingsPath: registrationSettingsPath,
      timeSectionId: timeSectionId
    }));
    
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
              // Mark end date as touched to trigger validation
              handleBlur('endDate');
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
            // Mark end date as touched to trigger validation
            handleBlur('endDate');
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
      // Mark end date as touched to trigger validation
      handleBlur('endDate');
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
    
    // Check completionBegins constraint from registration settings
    const endDateIsNextYear = formData.enrollmentYear !== getCurrentSchoolYear();
    const endDateTimeSection = getTimeSection(endDateIsNextYear);
    if (endDateTimeSection) {
      const { min: completionBeginsDate } = getDateConstraints(endDateTimeSection, false);
      if (completionBeginsDate && date < completionBeginsDate) {
        setDateErrors(prev => ({
          ...prev,
          endDate: `End date must be on or after ${formatDateForDisplay(completionBeginsDate)} based on registration period constraints`
        }));
        return;
      }
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
    
    // Remove special Summer School validation - rely on registration settings instead
  
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
    
    // Mark field as touched for validation
    handleBlur('endDate');
    
    setDateErrors(prev => ({ ...prev, endDate: '' }));
    
    // Get term from the active time section and add it to form data
    const isNextYear = formData.enrollmentYear !== getCurrentSchoolYear();
    const timeSection = getTimeSection(isNextYear);
    if (timeSection && timeSection.term) {
      handleFormChange({
        target: {
          name: 'term',
          value: timeSection.term
        }
      });
    }
  
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
    const overallValid = isValid && isEligible && areDatesValid && !noValidDatesAvailable;
    onValidationChange(overallValid);
  }, [isValid, isEligible, areDatesValid, noValidDatesAvailable, onValidationChange]);


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

            // Check if user email is in allowedEmails for developer access
            const userEmail = user?.email;
            const allowedEmails = courseData.allowedEmails || [];
            const isDeveloperAccess = userEmail && allowedEmails.includes(userEmail);
            
            // Only include courses with OnRegistration set to true OR if user has developer access
            if (courseData.OnRegistration !== true && !isDeveloperAccess) {
              return;
            }

            coursesData.push({
              id: courseId,
              title: courseData.Title,
              DiplomaCourse: courseData.DiplomaCourse,
              diplomaTimes: courseData.diplomaTimes || [],
              recommendedCompletionMonths: courseData.recommendedCompletionMonths || null,
              minCompletionMonths: courseData.minCompletionMonths || null,
              isDeveloperAccess: isDeveloperAccess,
              onRegistrationStatus: courseData.OnRegistration
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
    
    // Add current year if it has a section and it's active
    if (hasCurrentYear) {
      // Check if the section is marked as active
      if (currentYearSection && currentYearSection.isActive !== false) {
        availableYears.push(currentSchoolYear);
        if (isTimeSectionActive(currentYearSection)) {
          message = `Please select your course below to see available registration dates for the ${currentSchoolYear} school year.`;
        } else {
          // Check if the section has startFromToday enabled or special date 1900-01-01
          if (currentYearSection.startFromToday || currentYearSection.startBegins === '1900-01-01') {
            message = `Please select your course below to see available registration dates for the ${currentSchoolYear} school year.`;
          } else {
            message = `Registration for the ${currentSchoolYear} school year will open on ${formatDateForDisplay(currentYearSection.startBegins)}.`;
          }
        }
      } else {
        message = `Registration for this student type is currently closed for the ${currentSchoolYear} school year.`;
      }
    } else {
      message = `Registration for this student type is closed for the current school year.`;
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
        // Check if next year section has startFromToday enabled or special date 1900-01-01
        if (nextYearSection.startFromToday || nextYearSection.startBegins === '1900-01-01') {
          message += ` starting today until ${formatDateForDisplay(nextYearSection.startEnds)}.`;
        } else {
          message += ` between ${formatDateForDisplay(nextYearSection.startBegins)} and ${formatDateForDisplay(nextYearSection.startEnds)}.`;
        }
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
        // Mark end date as touched to trigger validation
        handleBlur('endDate');
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
        
        // Mark end date as touched to trigger validation
        handleBlur('endDate');
        
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
        
        // Mark end date as touched to trigger validation
        handleBlur('endDate');
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
      // Don't show inline message, just mark as invalid
      valid = false;
    }

    if (!formData.endDate) {
      // Don't show inline message, just mark as invalid
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
    
    // Check completionBegins constraint from registration settings
    if (formData.endDate) {
      const endDate = toEdmontonDate(formData.endDate);
      const validateIsNextYear = formData.enrollmentYear !== getCurrentSchoolYear();
      const validateTimeSection = getTimeSection(validateIsNextYear);
      
      if (validateTimeSection) {
        const { min: completionBeginsDate } = getDateConstraints(validateTimeSection, false);
        
        if (completionBeginsDate && endDate < completionBeginsDate) {
          newDateErrors.endDate = `End date must be on or after ${formatDateForDisplay(completionBeginsDate)} based on registration period constraints`;
          valid = false;
        }
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

  // Update areDatesValid whenever validateDates dependencies change
  useEffect(() => {
    const isValid = validateDates();
    setAreDatesValid(isValid);
  }, [validateDates]);

  // Effect to restore validation state for date fields when component has existing data
  useEffect(() => {
    // Only run after component is fully loaded and if we have date values
    if (!loading && !settingsLoading && (formData.startDate || formData.endDate)) {
      // Small delay to ensure all initialization is complete
      const timeoutId = setTimeout(() => {
        // Mark date fields as touched if they have values but aren't touched yet
        if (formData.startDate && !touched.startDate) {
          handleBlur('startDate');
        }
        if (formData.endDate && !touched.endDate) {
          handleBlur('endDate');
        }
        
        // Ensure date validation runs
        setTimeout(() => {
          validateDates();
        }, 50);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [
    loading, 
    settingsLoading, 
    formData.startDate, 
    formData.endDate, 
    touched.startDate, 
    touched.endDate, 
    handleBlur, 
    validateDates
  ]);

  // Validate form and update validation status
  useEffect(() => {
    const debouncedValidation = _.debounce(() => {
      // Simple phone validation
      const isPhoneValid = readOnlyFields.phoneNumber || (formData.phoneNumber && formData.phoneNumber.length > 0);
      
      // School validation for Non-Primary and Home Education students
      const isSchoolValid = (studentType !== 'Non-Primary' && studentType !== 'Home Education') || 
                            (formData.schoolAddress && formData.schoolAddress.name);
      
      const isFormValid = isValid && 
                         isEligible && 
                         validateDates() && 
                         !noValidDatesAvailable &&
                         formData.courseId &&
                         isPhoneValid &&
                         isSchoolValid &&
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
    noValidDatesAvailable,
    formData.schoolAddress
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
  
    // Use handleFormChange to trigger validation
    handleFormChange({
      target: {
        name: 'courseId',
        value: value
      }
    });
    
    // Update additional fields
    setFormData(prev => ({
      ...prev,
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
    
    // Update term based on active time section
    const isNextYear = formData.enrollmentYear !== getCurrentSchoolYear();
    const timeSection = getTimeSection(isNextYear);
    if (timeSection && timeSection.term) {
      handleFormChange({
        target: {
          name: 'term',
          value: timeSection.term
        }
      });
    }
  
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
          if (studentType === 'International Student' && !readOnlyFields.documents) {
            // Check for documents in either format
            const hasNewFormatDocs = formData.internationalDocuments && 
                                    Array.isArray(formData.internationalDocuments) && 
                                    formData.internationalDocuments.length > 0;
            const hasOldFormatDocs = formData.documents && 
                                    (formData.documents.passport || 
                                     formData.documents.additionalID || 
                                     formData.documents.residencyProof);
            
            if (!hasNewFormatDocs && !hasOldFormatDocs) {
              setError('Please upload at least one identification document');
              return false;
            }
          }
          
          // Ensure registration settings are populated
          let dataToSave = formData;
          if (!formData.registrationSettingsPath && formData.enrollmentYear) {
            const isNextYear = formData.enrollmentYear !== getCurrentSchoolYear();
            const timeSection = getTimeSection(isNextYear);
            
            // Build registration settings path
            const schoolYearKey = formData.enrollmentYear.replace('/', '_');
            const studentTypeKey = studentType.replace(/\s+/g, '-');
            const registrationSettingsPath = `/registrationSettings/${schoolYearKey}/${studentTypeKey}`;
            
            console.log('Adding registration settings before save:', {
              registrationSettingsPath,
              timeSectionId: timeSection?.id
            });
            
            dataToSave = {
              ...formData,
              registrationSettingsPath: registrationSettingsPath,
              timeSectionId: timeSection?.id || null
            };
          }
          
          await saveToPendingRegistration(dataToSave);
          return true;
        } catch (err) {
          console.error("Form submission error:", err);
          setError('Failed to submit form');
          return false;
        }
      }
      return false;
    },
    getFormData: () => {
      // Ensure registration settings path is built correctly before returning
      let finalFormData = { ...formData };
      
      if (currentSchoolYearKey && formData.enrollmentYear && studentType) {
        const isNextYear = formData.enrollmentYear !== getCurrentSchoolYear();
        const timeSection = getTimeSection(isNextYear);
        
        // Always rebuild the path with the correct school year key
        const studentTypeKey = studentType.replace(/\s+/g, '-');
        const registrationBasePath = `/registrationSettings/${currentSchoolYearKey}/${studentTypeKey}`;
        
        // Create the full path including the time section index if available
        const registrationSettingsPath = timeSection?.originalIndex !== undefined ?
          `${registrationBasePath}/timeSections/${timeSection.originalIndex}` : registrationBasePath;
        
        finalFormData.registrationSettingsPath = registrationSettingsPath;
        finalFormData.timeSectionId = timeSection?.id || null;
      }
      
      console.log('Getting form data for submission:', {
        registrationSettingsPath: finalFormData.registrationSettingsPath,
        timeSectionId: finalFormData.timeSectionId,
        studentType: finalFormData.studentType,
        enrollmentYear: finalFormData.enrollmentYear,
        currentSchoolYearKey: currentSchoolYearKey
      });
      
      return finalFormData;
    },
    getCompletionPercentage: () => completionPercentage,
    getValidationStatus: () => ({
      isValid,
      completionPercentage,
      isEligible,
      hasValidDates: validateDates() && !noValidDatesAvailable
    })
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

                    // Add developer access messaging
                    if (course.isDeveloperAccess) {
                      const regStatus = course.onRegistrationStatus === true ? 'Available' : 
                                      course.onRegistrationStatus === false ? 'Not Available' : 'Unknown';
                      statusText += ` [DEV ACCESS - Registration: ${regStatus}]`;
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
                
                {/* Developer Access Message */}
                {formData.courseId && (() => {
                  const selectedCourse = courses.find(course => course.id === formData.courseId);
                  return selectedCourse?.isDeveloperAccess && (
                    <Alert className="bg-yellow-50 border-yellow-200">
                      <Shield className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-sm text-yellow-700">
                        <div className="font-semibold mb-1">Developer Access Course</div>
                        You have access to this course because your email is listed in the allowedEmails. 
                        Registration status: <span className="font-mono font-semibold">
                          {selectedCourse.onRegistrationStatus === true ? 'Available' : 
                           selectedCourse.onRegistrationStatus === false ? 'Not Available' : 'Unknown'}
                        </span>
                        <br />
                        <span className="text-xs">This course may not be visible to regular students if registration is not available.</span>
                      </AlertDescription>
                    </Alert>
                  );
                })()}
                
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
      {/* Display term if available */}
      {getTimeSection(formData.enrollmentYear !== getCurrentSchoolYear()).term && (
        <div className="flex items-center mb-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" 
            style={{ 
              backgroundColor: getTimeSection(formData.enrollmentYear !== getCurrentSchoolYear()).term === 'Term 1' ? '#dbeafe' :
                               getTimeSection(formData.enrollmentYear !== getCurrentSchoolYear()).term === 'Term 2' ? '#ede9fe' :
                               getTimeSection(formData.enrollmentYear !== getCurrentSchoolYear()).term === 'Full Year' ? '#d1fae5' : 
                               getTimeSection(formData.enrollmentYear !== getCurrentSchoolYear()).term === 'Summer' ? '#fef3c7' : '#f3f4f6',
              color: getTimeSection(formData.enrollmentYear !== getCurrentSchoolYear()).term === 'Term 1' ? '#1e40af' :
                     getTimeSection(formData.enrollmentYear !== getCurrentSchoolYear()).term === 'Term 2' ? '#5b21b6' :
                     getTimeSection(formData.enrollmentYear !== getCurrentSchoolYear()).term === 'Full Year' ? '#047857' : 
                     getTimeSection(formData.enrollmentYear !== getCurrentSchoolYear()).term === 'Summer' ? '#b45309' : '#374151',
              border: '1px solid',
              borderColor: getTimeSection(formData.enrollmentYear !== getCurrentSchoolYear()).term === 'Term 1' ? '#bfdbfe' :
                           getTimeSection(formData.enrollmentYear !== getCurrentSchoolYear()).term === 'Term 2' ? '#ddd6fe' :
                           getTimeSection(formData.enrollmentYear !== getCurrentSchoolYear()).term === 'Full Year' ? '#a7f3d0' : 
                           getTimeSection(formData.enrollmentYear !== getCurrentSchoolYear()).term === 'Summer' ? '#fde68a' : '#e5e7eb'
            }}
          >
            {getTimeSection(formData.enrollmentYear !== getCurrentSchoolYear()).term}
          </span>
        </div>
      )}
      
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
                    minDate={(() => {
                      // Get min date from course requirements
                      const courseMinDate = formData.startDate && minCompletionMonths ? 
                        getMinCompletionDate(formData.startDate, minCompletionMonths) : 
                        getMinEndDate(formData.startDate);
                      
                      // Get min date from registration settings
                      const isNextYear = formData.enrollmentYear !== getCurrentSchoolYear();
                      const timeSection = getTimeSection(isNextYear);
                      const registrationMinDate = timeSection ? 
                        getDateConstraints(timeSection, false).min : null;
                      
                      // Use the later of the two dates
                      if (courseMinDate && registrationMinDate) {
                        return registrationMinDate > courseMinDate ? registrationMinDate : courseMinDate;
                      } else {
                        return registrationMinDate || courseMinDate;
                      }
                    })()}
                    maxDate={getMaxEndDate(isDiplomaCourse, alreadyWroteDiploma, selectedDiplomaDate)}
                    disabled={!formData.startDate || noValidDatesAvailable}
                    readOnly={isEndDateReadOnly}
                    helpText={(() => {
                      // For diploma courses
                      if (isDiplomaCourse && !alreadyWroteDiploma && selectedDiplomaDate) {
                        return `Must be completed exactly on your diploma exam date (${formatDateForDisplay(toEdmontonDate(selectedDiplomaDate.displayDate))})`;
                      }
                      
                      // Get constraints
                      const helpIsNextYear = formData.enrollmentYear !== getCurrentSchoolYear();
                      const helpTimeSection = getTimeSection(helpIsNextYear);
                      const regMinDate = helpTimeSection ? getDateConstraints(helpTimeSection, false).min : null;
                      const regMaxDate = getMaxEndDate(isDiplomaCourse, alreadyWroteDiploma, selectedDiplomaDate);
                      const courseMinMonths = minCompletionMonths ? `at least ${minCompletionMonths} months after start date` : null;
                      
                      // Build message
                      const constraints = [];
                      
                      if (regMinDate) {
                        constraints.push(`on or after ${formatDateForDisplay(regMinDate)}`);
                      }
                      
                      if (regMaxDate) {
                        constraints.push(`on or before ${formatDateForDisplay(regMaxDate)}`);
                      }
                      
                      if (courseMinMonths) {
                        constraints.push(courseMinMonths);
                      }
                      
                      if (constraints.length > 0) {
                        return `Completion date must be ${constraints.join(' and ')}`;
                      }
                      
                      return "Recommended 5 months for course completion";
                    })()
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

          {/* Student Photo Upload - for all students */}
          <StudentPhotoUpload
            onUploadComplete={handleFileUpload}
            initialPhoto={formData.studentPhoto}
            error={touched.studentPhoto && errors.studentPhoto ? errors.studentPhoto : null}
          />

          {studentType === 'International Student' && (
            <InternationalDocuments
              onUploadComplete={handleDocumentUpload}
              initialDocuments={formData.internationalDocuments || []} 
            />
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

              {/* Address Field */}
              {readOnlyFields.address ? (
                renderReadOnlyField('address', formData.address?.fullAddress || formData.address, 'Address')
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <AddressPicker
                    onAddressSelect={(addressDetails) => {
                      setFormData(prev => ({
                        ...prev,
                        address: addressDetails
                      }));
                      handleBlur('address');
                    }}
                    studentType={studentType}
                  />
                  <ValidationFeedback
                    isValid={touched.address && !errors.address}
                    message={
                      touched.address
                        ? errors.address || validationRules.address.successMessage
                        : null
                    }
                  />
                  {studentType !== 'International Student' && (
                    <p className="text-sm text-gray-500">
                      Please select an address in Canada
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

              {/* Alberta Residency Acknowledgment - for Non-International students and non-adults */}
              {studentType !== 'International Student' && !user18OrOlder && (
                <div className="space-y-2">
                  <div className="space-y-3">
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        name="albertaResident"
                        checked={formData.albertaResident === true || formData.albertaResident === 'yes'}
                        onChange={(e) => {
                          handleFormChange({
                            target: {
                              name: 'albertaResident',
                              value: e.target.checked
                            }
                          });
                        }}
                        onBlur={() => handleBlur('albertaResident')}
                        className="mt-1 h-4 w-4 rounded border-gray-300"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium">
                          I acknowledge that I am a resident of Alberta <span className="text-red-500">*</span>
                        </span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="ml-1 text-gray-500 hover:text-gray-700 inline-flex">
                                <InfoIcon className="h-3 w-3" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-sm">
                                As defined by Section 4 of the Education Act - meaning that the student is 
                                living and ordinarily present in Alberta, and has a parent who is a resident of Canada.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </label>
                
                  </div>
                  <ValidationFeedback
                    isValid={touched.albertaResident && !errors.albertaResident}
                    message={
                      touched.albertaResident
                        ? errors.albertaResident || validationRules.albertaResident.successMessage
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
                          handleBlur('schoolAddress');
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            currentSchool: '',
                            schoolAddress: null
                          }));
                          handleBlur('schoolAddress');
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
                          handleBlur('schoolAddress');
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            currentSchool: '',
                            schoolAddress: null
                          }));
                          handleBlur('schoolAddress');
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
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
                    <div className="flex items-start">
                      <InfoIcon className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-amber-800 font-medium mb-1">Important: Parent Permission Required</p>
                        <p className="text-amber-700">
                          As you are under 18, your parent/guardian will receive an email and will need to give permission for you to take this course. 
                          You will be able to start the course in the meantime, but we will require parent permission before you will be added to the Alberta Education system.
                        </p>
                      </div>
                    </div>
                  </div>
                  {(readOnlyFields.parentFirstName || readOnlyFields.parentLastName || readOnlyFields.parentPhone || readOnlyFields.parentEmail) ? (
                    <Alert className="bg-blue-50 border-blue-200">
                      <InfoIcon className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-700">
                        We have existing parent/guardian information in your profile. Fields marked as "cannot be changed" are pre-filled from your previous registration.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Please provide your parent or guardian's contact information below.
                    </p>
                  )}

                  {/* Parent Relationship */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Relationship to Student <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="parentRelationship"
                      value={formData.parentRelationship}
                      onChange={handleFormChange}
                      onBlur={() => handleBlur('parentRelationship')}
                      className={`w-full p-2 border rounded-md ${
                        touched.parentRelationship && errors.parentRelationship ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    >
                      <option value="">Select relationship</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Emergency Contact">Emergency Contact</option>
                      <option value="Doctor">Doctor</option>
                      <option value="Sitter">Sitter</option>
                      <option value="Custodian">Custodian</option>
                      <option value="School Closure Contact">School Closure Contact</option>
                      <option value="Caregiver">Caregiver</option>
                      <option value="Stepmother">Stepmother</option>
                      <option value="Stepfather">Stepfather</option>
                    </select>
                    <ValidationFeedback
                      isValid={touched.parentRelationship && !errors.parentRelationship}
                      message={
                        touched.parentRelationship
                          ? errors.parentRelationship || validationRules.parentRelationship.successMessage
                          : null
                      }
                    />

                    {/* Legal Guardian Checkbox */}
                    <div className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        id="isLegalGuardian"
                        name="isLegalGuardian"
                        checked={formData.isLegalGuardian}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            isLegalGuardian: e.target.checked
                          }));
                        }}
                        className="mr-2"
                      />
                      <label htmlFor="isLegalGuardian" className="text-sm">
                        This person is the legal guardian of student
                      </label>
                    </div>
                  </div>

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
                      {formData.parentEmail && !errors.parentEmail && (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-2">
                          <div className="flex items-start">
                            <InfoIcon className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                            <div className="text-xs text-blue-700">
                              <p className="font-medium">Email will be sent to: {formData.parentEmail}</p>
                              <p className="mt-1">Your parent/guardian will receive an email requesting permission for you to enroll in this course.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>


          {/* Indigenous FNMI Declaration - for all non-International students */}
          {studentType !== 'International Student' && (
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md hover:shadow-lg transition-all duration-200 border-t-4 border-t-blue-400">
              <CardHeader>
                <h3 className="text-md font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Indigenous Identification
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Indigenous Self-Identification <span className="text-red-500">*</span>
                    {readOnlyFields.indigenousIdentification && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">From Profile</span>
                    )}
                  </label>
                  <p className="text-sm text-gray-600">
                    Does the student wish to self-identify as an Indigenous person?
                  </p>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="indigenousIdentification"
                        value="yes"
                        checked={formData.indigenousIdentification === 'yes'}
                        onChange={readOnlyFields.indigenousIdentification ? undefined : handleFormChange}
                        onBlur={() => handleBlur('indigenousIdentification')}
                        className="mr-2"
                        disabled={readOnlyFields.indigenousIdentification}
                      />
                      <span className="text-sm">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="indigenousIdentification"
                        value="no"
                        checked={formData.indigenousIdentification === 'no'}
                        onChange={readOnlyFields.indigenousIdentification ? undefined : handleFormChange}
                        onBlur={() => handleBlur('indigenousIdentification')}
                        className="mr-2"
                        disabled={readOnlyFields.indigenousIdentification}
                      />
                      <span className="text-sm">No</span>
                    </label>
                  </div>
                  <ValidationFeedback
                    isValid={touched.indigenousIdentification && !errors.indigenousIdentification}
                    message={
                      touched.indigenousIdentification
                        ? errors.indigenousIdentification || validationRules.indigenousIdentification.successMessage
                        : null
                    }
                  />

                  {formData.indigenousIdentification === 'yes' && (
                    <div className="space-y-2 mt-3">
                      <label className="text-sm font-medium">
                        Indigenous Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="indigenousStatus"
                        value={formData.indigenousStatus}
                        onChange={readOnlyFields.indigenousStatus ? undefined : handleFormChange}
                        onBlur={() => handleBlur('indigenousStatus')}
                        className={`w-full p-2 border rounded-md ${
                          touched.indigenousStatus && errors.indigenousStatus ? 'border-red-500' : 'border-gray-300'
                        } ${readOnlyFields.indigenousStatus ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                        disabled={readOnlyFields.indigenousStatus}
                        required
                      >
                        <option value="">Select status</option>
                        <option value="331">331 - Indigenous Learner - Status First Nations</option>
                        <option value="332">332 - Indigenous Learner - Non-Status First Nations</option>
                        <option value="333">333 - Indigenous Learner - Metis</option>
                        <option value="334">334 - Indigenous Learner - Inuit</option>
                      </select>
                      <ValidationFeedback
                        isValid={touched.indigenousStatus && !errors.indigenousStatus}
                        message={
                          touched.indigenousStatus
                            ? errors.indigenousStatus || validationRules.indigenousStatus.successMessage
                            : null
                        }
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Citizenship Verification - for all non-International students */}
          {studentType !== 'International Student' && (
            <CitizenshipDocuments
              onUploadComplete={handleFileUpload}
              initialDocuments={formData.citizenshipDocuments || []}
              error={touched.citizenshipDocuments && errors.citizenshipDocuments ? errors.citizenshipDocuments : null}
            />
          )}

          {/* Marketing Questions - for all student types */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md hover:shadow-lg transition-all duration-200 border-t-4 border-t-blue-400">
            <CardHeader>
              <h3 className="text-md font-semibold flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Help Us Improve
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  How did you hear about us? <span className="text-red-500">*</span>
                  {readOnlyFields.howDidYouHear && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">From Profile</span>
                  )}
                </label>
                <select
                  name="howDidYouHear"
                  value={formData.howDidYouHear}
                  onChange={readOnlyFields.howDidYouHear ? undefined : handleFormChange}
                  onBlur={() => handleBlur('howDidYouHear')}
                  className={`w-full p-2 border rounded-md ${readOnlyFields.howDidYouHear ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                  disabled={readOnlyFields.howDidYouHear}
                >
                  <option value="">Select an option</option>
                  <option value="google-search">Google Search</option>
                  <option value="online-ad">Online Advertising (Google Ads, etc.)</option>
                  <option value="social-media">Social Media (Facebook, Instagram, etc.)</option>
                  <option value="friend-referral">Friend or Family Referral</option>
                  <option value="school-counselor">School Counselor</option>
                  <option value="teacher">Teacher Recommendation</option>
                  <option value="radio-ad">Radio Advertisement</option>
                  <option value="newspaper">Newspaper</option>
                  <option value="school-website">School Website</option>
                  <option value="education-fair">Education Fair/Event</option>
                  <option value="other">Other</option>
                </select>
                {getFieldStatus('howDidYouHear') && (
                  <ValidationFeedback 
                    isValid={getFieldStatus('howDidYouHear').isValid}
                    message={getFieldStatus('howDidYouHear').message}
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Why are you applying with us? (Optional)
                </label>
                <textarea
                  name="whyApplying"
                  value={formData.whyApplying}
                  onChange={handleFormChange}
                  onBlur={() => handleBlur('whyApplying')}
                  className="w-full p-3 border rounded-md min-h-[80px] resize-y"
                  placeholder="Tell us what made you choose our school..."
                />
              </div>
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
    // For all student types including Summer School, rely on the registration settings
    // rather than imposing special date restrictions
    
    // No date exclusions - the min/max dates from registration settings will handle constraints
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
  
  // Remove special Summer School message - rely on registration settings instead
  
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