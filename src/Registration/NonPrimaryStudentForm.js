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
  Loader2
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
import CapitalizedInput from '../components/CapitalizedInput';
import { getDatabase, ref as databaseRef, get, set } from 'firebase/database';
import {
  ValidationFeedback,
  validationRules,
  useFormValidation
} from './formValidation';

// === Utility Functions ===

// Convert UTC date string to local Date object
const utcToLocal = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Format Date object to YYYY-MM-DD string
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

// Get minimum start date (2 business days from today)
const getMinStartDate = () => {
  const today = new Date();
  let minDate = new Date(today);
  minDate.setHours(0, 0, 0, 0);
  let addedDays = 0;

  while (addedDays < 2) {
    minDate.setDate(minDate.getDate() + 1);
    if (minDate.getDay() !== 0 && minDate.getDay() !== 6) { // Exclude weekends
      addedDays++;
    }
  }

  return minDate;
};

// Get minimum end date (1 month after start date)
const getMinEndDate = (startDate) => {
  if (!startDate) return null;
  const minEnd = new Date(startDate);
  minEnd.setMonth(minEnd.getMonth() + 1);
  return minEnd;
};

// Get maximum end date based on diploma course status
const getMaxEndDate = (isDiplomaCourse, alreadyWroteDiploma, selectedDiplomaDate) => {
  if (isDiplomaCourse && !alreadyWroteDiploma && selectedDiplomaDate) {
    const displayDate = new Date(selectedDiplomaDate.displayDate);
    displayDate.setUTCHours(0, 0, 0, 0);
    return displayDate;
  }
  return null;
};

// Calculate duration between start and end dates
const calculateDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const months = Math.floor(diffDays / 30);
  const remainingDays = diffDays % 30;

  let duration = '';
  if (months > 0) {
    duration += `${months} month${months > 1 ? 's' : ''}`;
    if (remainingDays > 0) {
      duration += ` and ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
    }
  } else {
    duration = `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  }

  return duration;
};

// Format diploma date for display
const formatDiplomaDate = (dateObj) => {
  const date = new Date(dateObj.date);
  return `${dateObj.month} ${date.getUTCFullYear()} (${dateObj.displayDate})`;
};

// === DiplomaMonthSelector Component ===
const DiplomaMonthSelector = ({ dates, selectedDate, onChange, error }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Diploma Exam Date <span className="text-red-500">*</span>
      </label>
      <select
        value={selectedDate?.id || ''}
        onChange={(e) => {
          if (e.target.value === '') {
            onChange(null);
          } else if (e.target.value === 'no-diploma') {
            onChange(null);
          } else {
            const selected = dates.find(d => d.id === e.target.value);
            onChange(selected || null);
          }
        }}
        className={`w-full p-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'}`}
      >
        <option value="">Select Diploma Exam Date</option>
        {dates.map((date) => (
          <option key={date.id} value={date.id}>
            {formatDiplomaDate(date)}
          </option>
        ))}
        <option value="no-diploma">I already wrote the diploma exam</option>
      </select>
      {error && (
        <div className="flex items-center gap-2 mt-1">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-500">{error}</span>
        </div>
      )}
    </div>
  );
};

const NonPrimaryStudentForm = forwardRef(({ onValidationChange, initialData, onSave }, ref) => {
  const { user, user_email_key } = useAuth();
  const uid = user?.uid; // Extract uid from user
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const [usePreferredFirstName, setUsePreferredFirstName] = useState(false);

  const getInitialFormData = () => {
    if (initialData) {
      return initialData;
    }

    return {
      firstName: validationRules.firstName.format(user?.displayName?.split(' ')[0] || ''),
      lastName: validationRules.lastName.format(user?.displayName?.split(' ').slice(1).join(' ') || ''),
      preferredFirstName: '', 
      phoneNumber: '',
      currentSchool: '',
      schoolAddress: null,
      birthday: '',
      enrollmentYear: '',
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
      studentType: 'Non-Primary',
      age: null
    };
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

  const [dateErrors, setDateErrors] = useState({
    startDate: '',
    endDate: '',
    diplomaDate: ''
  });

  // New state for enrolled courses with their statuses
  const [enrolledCourses, setEnrolledCourses] = useState({});

  // New state for course hours
  const [courseHours, setCourseHours] = useState(null);

  // === New Modifications Start ===

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
            birthday: snapshot.val().birthday || prev.birthday,
            albertaStudentNumber: snapshot.val().asn || prev.albertaStudentNumber,
            parentFirstName: snapshot.val().ParentFirstName || prev.parentFirstName,
            parentLastName: snapshot.val().ParentLastName || prev.parentLastName,
            parentPhone: snapshot.val().ParentPhone_x0023_ || prev.parentPhone,
            parentEmail: snapshot.val().ParentEmail || prev.parentEmail,
          }));
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
      parentEmail: !!profileData.ParentEmail
    };
  }, [profileData]);

  // Initialize form validation
  const options = useMemo(() => ({
    conditionalValidation: {
      parentFirstName: () => !user18OrOlder,
      parentLastName: () => !user18OrOlder,
      parentPhone: () => !user18OrOlder,
      parentEmail: () => !user18OrOlder,
      preferredFirstName: () => usePreferredFirstName
    },
    readOnlyFields
  }), [user18OrOlder, usePreferredFirstName, readOnlyFields]);

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
  } = useFormValidation(formData, rules, options); 

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

  // Debounced save to Firebase
  const debouncedSave = useCallback(
    _.debounce(async (newData) => {
      await saveToPendingRegistration(newData);
    }, 1000),
    []
  );

  // Handle form field changes with functional updates
  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;

    setFormData(prevData => {
      const newFormData = {
        ...prevData,
        [name]: value
      };

      debouncedSave(newFormData);

      return newFormData;
    });

    handleBlur(name);
  }, [handleBlur, debouncedSave]);

  // Add cleanup for debouncedSave
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  // Handle date changes
  const handleDateChange = (date) => {
    handleFormChange({
      target: {
        name: 'birthday',
        value: date ? formatDate(date) : '',
      },
    });
  };

  const handleStartDateChange = (date) => {
    const minDate = getMinStartDate();

    if (date < minDate) {
      setDateErrors(prev => ({
        ...prev,
        startDate: 'Start date must be at least 2 business days from today'
      }));
      return;
    }

    handleFormChange({
      target: {
        name: 'startDate',
        value: formatDate(date)
      }
    });
    setDateErrors(prev => ({ ...prev, startDate: '' }));
  };

  const handleEndDateChange = async (date) => {
    const minEnd = getMinEndDate(formData.startDate);
    const maxEnd = getMaxEndDate(isDiplomaCourse, alreadyWroteDiploma, selectedDiplomaDate);

    if (minEnd && date < minEnd) {
      setDateErrors(prev => ({
        ...prev,
        endDate: 'End date must be at least 1 month after start date'
      }));
      return;
    }

    if (maxEnd && date > maxEnd) {
      setDateErrors(prev => ({
        ...prev,
        endDate: 'End date must be on or before the diploma exam'
      }));
      return;
    }

    // Update the end date
    handleFormChange({
      target: {
        name: 'endDate',
        value: formatDate(date)
      }
    });
    setDateErrors(prev => ({ ...prev, endDate: '' }));

    // Fetch course hours if we have both dates and a course selected
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
      const birthdayDate = new Date(formData.birthday);
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
    onValidationChange(isValid && isEligible && validateDates());
  }, [isValid, isEligible, onValidationChange, dateErrors]);

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

            coursesData.push({
              id: courseId,
              title: courseData.Title,
              DiplomaCourse: courseData.DiplomaCourse,
              diplomaTimes: courseData.diplomaTimes || []
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
        setLoading(false);
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

  // Determine available enrollment years based on current date
  useEffect(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentSchoolYear = getCurrentSchoolYear();
    const nextSchoolYear = getNextSchoolYear();

    let availableYears = [];
    let message = '';

    if (currentMonth === 7) { // August
      availableYears = [nextSchoolYear];
      message = `We are no longer taking registrations for the current school year, but you are free to start now. You will be registered as a ${nextSchoolYear} student.`;
      handleFormChange({
        target: {
          name: 'enrollmentYear',
          value: nextSchoolYear,
        },
      });
    } else if (currentMonth >= 8 || currentMonth <= 2) { // September to March
      availableYears = [currentSchoolYear];
      message = `Registration is only available for the current school year. Registration for next school year (${nextSchoolYear}) will open in April.`;
      handleFormChange({
        target: {
          name: 'enrollmentYear',
          value: currentSchoolYear,
        },
      });
    } else { // April to July
      availableYears = [currentSchoolYear, nextSchoolYear];
      message = `Please select either the current school year (${currentSchoolYear}) if you intend to complete the course before September, or select the next school year (${nextSchoolYear}) if you intend to finish beyond September.`;
    }

    setAvailableEnrollmentYears(availableYears);
    setEnrollmentYearMessage(message);
  }, [handleFormChange]);

  // Update age information based on birthday and enrollment year
  useEffect(() => {
    updateAgeInfo();
  }, [formData.birthday, formData.enrollmentYear]);

  // Fetch diploma course information based on selected course
  useEffect(() => {
    const fetchDiplomaInfo = async () => {
      if (!formData.courseId) return;

      try {
        const db = getDatabase();
        const courseRef = databaseRef(db, `courses/${formData.courseId}`);
        const snapshot = await get(courseRef);

        if (snapshot.exists()) {
          const courseData = snapshot.val();
          const isDiploma = courseData.DiplomaCourse === "Yes";
          setIsDiplomaCourse(isDiploma);

          if (isDiploma && courseData.diplomaTimes) {
            const diplomaTimesArray = Array.isArray(courseData.diplomaTimes)
              ? courseData.diplomaTimes
              : Object.values(courseData.diplomaTimes);

            const validDates = diplomaTimesArray
              .filter(item => new Date(item.date) > new Date())
              .sort((a, b) => new Date(a.date) - new Date(b.date));

            setDiplomaDates(validDates);
          }
        }
      } catch (err) {
        console.error('Error fetching diploma info:', err);
      }
    };

    fetchDiplomaInfo();
  }, [formData.courseId]);

  // Adjust end date based on selected diploma date
  useEffect(() => {
    if (selectedDiplomaDate) {
      const maxEndDate = getMaxEndDate(isDiplomaCourse, alreadyWroteDiploma, selectedDiplomaDate);
      if (formData.endDate && new Date(formData.endDate) > maxEndDate) {
        handleFormChange({
          target: {
            name: 'endDate',
            value: formatDate(maxEndDate)
          }
        });
      }
    }
  }, [selectedDiplomaDate, formData.endDate, handleFormChange, isDiplomaCourse, alreadyWroteDiploma]);

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

  // Calculate age based on birthday and a specific date
  const calculateAge = (birthday, date) => {
    const birthDate = new Date(birthday);
    const age = date.getUTCFullYear() - birthDate.getUTCFullYear();
    const monthDiff = date.getUTCMonth() - birthDate.getUTCMonth();

    if (monthDiff < 0 || (monthDiff === 0 && date.getUTCDate() < birthDate.getUTCDate())) {
      return age - 1;
    }
    return age;
  };

  // Update age-related information and eligibility
  const updateAgeInfo = () => {
    if (formData.birthday && formData.enrollmentYear) {
      const [enrollmentStartYear] = formData.enrollmentYear.split('/');
      const lastSeptember = new Date(parseInt('20' + enrollmentStartYear, 10) - 1, 8, 1); // September 1st of the previous year
      const nextSeptember = new Date(parseInt('20' + enrollmentStartYear, 10), 8, 1); // September 1st of the enrollment start year
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
    } else {
      setAgeInfo('');
      setIsEligible(true);
    }
  };

  // Handle Alberta Student Number (ASN) changes with formatting
  const handleASNChange = (e) => {
    const { value } = e.target;
    let formattedValue = value.replace(/\D/g, "").slice(0, 9);
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
  };

  // Handle diploma date changes
  const handleDiplomaDateChange = (date) => {
    if (date === null) {
      setAlreadyWroteDiploma(true);
      setSelectedDiplomaDate(null);
      handleFormChange({
        target: {
          name: 'diplomaMonth',
          value: null
        }
      });

      if (formData.startDate) {
        const startDate = new Date(formData.startDate);
        const defaultEndDate = new Date(startDate);
        defaultEndDate.setMonth(defaultEndDate.getMonth() + 5);
        handleFormChange({
          target: {
            name: 'endDate',
            value: formatDate(defaultEndDate)
          }
        });
      }
    } else {
      setAlreadyWroteDiploma(false);
      setSelectedDiplomaDate(date);
      handleFormChange({
        target: {
          name: 'diplomaMonth',
          value: date
        }
      });

      handleFormChange({
        target: {
          name: 'endDate',
          value: formatDate(new Date(date.date))
        }
      });
    }
    setDateErrors(prev => ({ ...prev, diplomaDate: '' }));
  };

  // Validate date fields
  const validateDates = () => {
    let valid = true;
    const newDateErrors = { ...dateErrors };

    if (!formData.startDate) {
      newDateErrors.startDate = 'Start date is required';
      valid = false;
    } else {
      newDateErrors.startDate = '';
    }

    if (!formData.endDate) {
      newDateErrors.endDate = 'End date is required';
      valid = false;
    } else {
      newDateErrors.endDate = '';
    }

    if (isDiplomaCourse && !alreadyWroteDiploma && !selectedDiplomaDate) {
      newDateErrors.diplomaDate = 'Diploma date is required';
      valid = false;
    } else {
      newDateErrors.diplomaDate = '';
    }

    setDateErrors(newDateErrors);
    return valid;
  };

  // Determine if end date should be readonly
  const isEndDateReadOnly = isDiplomaCourse && !alreadyWroteDiploma && selectedDiplomaDate;

  // Function to get initial birthday date for DatePicker
  const getInitialBirthdayDate = () => {
    const today = new Date();
    return new Date(today.getUTCFullYear() - 16, today.getUTCMonth(), today.getUTCDate());
  };

  // Function to get current school year
  const getCurrentSchoolYear = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const startYear = currentMonth >= 8 ? currentYear : currentYear - 1;
    return `${startYear.toString().slice(-2)}/${(startYear + 1).toString().slice(-2)}`;
  };

  // Function to get next school year
  const getNextSchoolYear = () => {
    const [startYear] = getCurrentSchoolYear().split('/');
    const nextStartYear = parseInt(startYear, 10) + 1;
    return `${nextStartYear}/${nextStartYear + 1}`;
  };

  // Handle course selection changes
  const handleCourseChange = async (e) => {
    const { value } = e.target;

    const selectedCourse = courses.find(course => course.id === value);

    setFormData(prev => ({
      ...prev,
      courseId: value,
      courseName: selectedCourse ? selectedCourse.title : ''
    }));

    // Remove fetching course hours from here

    // Save to pending registration immediately after course change
    debouncedSave({
      ...formData,
      courseId: value,
      courseName: selectedCourse ? selectedCourse.title : ''
    });
  };

  // Calculate hours per week based on start date, end date, and total hours
  const calculateHoursPerWeek = (startDate, endDate, totalHours) => {
    if (!startDate || !endDate || !totalHours) return null;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffWeeks = diffDays / 7;
    
    const hoursPerWeek = totalHours / diffWeeks;
    return hoursPerWeek.toFixed(1); // Round to 1 decimal place
  };

  // Calculate age based on birthday and enrollment year
  useEffect(() => {
    updateAgeInfo();
  }, [formData.birthday, formData.enrollmentYear]);

  // Update preferredFirstName when usePreferredFirstName or firstName changes
  useEffect(() => {
    if (!usePreferredFirstName) {
      setFormData(prevData => ({
        ...prevData,
        preferredFirstName: prevData.firstName
      }));
    }
  }, [usePreferredFirstName, formData.firstName]);

  // Update validation status
  useEffect(() => {
    onValidationChange(isValid && isEligible && validateDates());
  }, [isValid, isEligible, onValidationChange, dateErrors]);

  // Handle form submission and data retrieval
  useImperativeHandle(ref, () => ({
    async submitForm() {
      const formErrors = validateForm();
      if (Object.keys(formErrors).length === 0 && isEligible && validateDates()) {
        try {
          // Save final form data
          await saveToPendingRegistration({
            ...formData,
            status: 'complete'
          });
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

  // === New Modifications End ===

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
      {loading ? (
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
          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-sm text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Form Header */}

          {/* 
          <Alert className="bg-blue-50 border-blue-200">
            <InfoIcon className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-700">
              You are registering with the following account information. You may edit your name if needed.
              If this is not your account, please log out and sign in with your correct account.
            </AlertDescription>
          </Alert>
 */}
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
                    country={"ca"}
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
                    preferredCountries={["ca"]}
                    priority={{ ca: 0, us: 1 }}
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
                    selected={formData.birthday ? utcToLocal(formData.birthday) : null}
                    onChange={handleDateChange}
                    customInput={<CustomDateInput />}
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
                  <h4 className="text-md font-medium">Alberta Student Number (ASN)</h4>
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
                  <input
                    type="text"
                    id="albertaStudentNumber"
                    name="albertaStudentNumber"
                    value={formData.albertaStudentNumber}
                    onChange={handleASNChange}
                    onBlur={() => handleBlur('albertaStudentNumber')}
                    className={`w-full p-2 border rounded-md ${
                      touched.albertaStudentNumber && errors.albertaStudentNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your ASN"
                    required
                  />
                  <ValidationFeedback
                    isValid={touched.albertaStudentNumber && !errors.albertaStudentNumber}
                    message={
                      touched.albertaStudentNumber
                        ? errors.albertaStudentNumber || validationRules.albertaStudentNumber.successMessage
                        : null
                    }
                  />
                </div>
              )}

              {/* School Selection Section */}
              <div className="space-y-2">
                <div className="mb-2">
                  <label className="text-sm font-medium">
                    Current School <span className="text-red-500">*</span>
                  </label>
                  <p className="text-sm text-gray-600">
                    Start typing the name of your school, and then select it from the list
                  </p>
                </div>

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

                      // Save to pending registration immediately after school address selection
                      debouncedSave({
                        ...formData,
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
                      });
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        currentSchool: '',
                        schoolAddress: null
                      }));

                      // Save to pending registration immediately after school address deselection
                      debouncedSave({
                        ...formData,
                        currentSchool: '',
                        schoolAddress: null
                      });
                    }
                  }}
                  required
                />
                {touched.schoolAddress && errors.schoolAddress && (
                  <ValidationFeedback
                    isValid={false}
                    message={errors.schoolAddress}
                  />
                )}
              </div>

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
                        successMessage={touched.parentLastName && !errors.parentLastName ? validationRules.parentLastName.successMessage : null}
                      />
                    )}
                  </div>

                  {readOnlyFields.parentPhone ? (
                    renderReadOnlyField('parentPhone', formData.parentPhone, 'Parent Phone Number')
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Parent Phone Number
                      </label>
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
                      <label className="text-sm font-medium">
                        Parent Email
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
                  />

                  {selectedDiplomaDate && (
                    <div className="text-sm text-gray-600">
                      <p>Important Notes:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Your diploma exam is scheduled for {formatDiplomaDate(selectedDiplomaDate)} </li>
                        <li>You must complete the course by your diploma exam date.</li>
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
                        <li>You can complete the course at your own pace.</li>
                        <li>Your previous diploma mark (30%) will be combined with your new school mark (70%).</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Course Dates Section */}
              <div className="space-y-4">
                <h4 className="font-medium">Course Schedule</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DatePickerWithInfo
                    label="Start Date"
                    selected={formData.startDate}
                    onChange={handleStartDateChange}
                    minDate={getMinStartDate()}
                    helpText="Please select a start date at least 2 business days from today."
                    error={dateErrors.startDate}
                  />

                  <DatePickerWithInfo
                    label="Completion Date"
                    selected={formData.endDate}
                    onChange={handleEndDateChange}
                    minDate={getMinEndDate(formData.startDate)}
                    maxDate={getMaxEndDate(isDiplomaCourse, alreadyWroteDiploma, selectedDiplomaDate)}
                    disabled={!formData.startDate}
                    readOnly={isEndDateReadOnly}
                    helpText={
                      isDiplomaCourse && !alreadyWroteDiploma
                        ? "Automatically set to your diploma exam date"
                        : "Recommended 5 months for course completion"
                    }
                    error={dateErrors.endDate}
                  />
                </div>

                {!formData.startDate && (
                  <p className="text-sm text-gray-500">Please select a start date first</p>
                )}

                {formData.startDate && formData.endDate && (
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
                        
                        {calculateHoursPerWeek(formData.startDate, formData.endDate, courseHours) > 20 && (
                          <p className="text-sm text-amber-600 mt-1">
                            <AlertTriangle className="inline-block h-4 w-4 mr-1" />
                            This schedule may be intensive. Consider extending your end date for a more manageable pace.
                          </p>
                        )}
                        
                        {calculateHoursPerWeek(formData.startDate, formData.endDate, courseHours) < 3 && (
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
          {!isEligible && (
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

const DatePickerWithInfo = ({
  label,
  selected,
  onChange,
  minDate,
  maxDate,
  helpText,
  error,
  disabled = false,
  readOnly = false
}) => {
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
        selected={selected ? utcToLocal(selected) : null}
        onChange={onChange}
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
        readOnly={readOnly}
        customInput={
          <CustomDateInput
            disabled={disabled}
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
    </div>
  );
};

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
