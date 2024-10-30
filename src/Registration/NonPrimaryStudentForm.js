import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useAuth } from '../context/AuthContext';
import { Alert, AlertDescription } from "../components/ui/alert";
import { Card, CardHeader, CardContent } from "../components/ui/card";
import { InfoIcon, AlertTriangle, Calendar, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import PhoneInput from "react-phone-input-2";
import DatePicker from 'react-datepicker';
import "react-phone-input-2/lib/style.css";
import "react-datepicker/dist/react-datepicker.css";
import SchoolAddressPicker from '../components/SchoolAddressPicker';
import { getDatabase, ref as databaseRef, get } from 'firebase/database';
import { ValidationFeedback, validationRules, useFormValidation } from './formValidation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";


// === MST Utility Functions ===

// Utility function to convert date to MST
const convertToMST = (date) => {
  if (!date) return null;
  return new Date(
    new Date(date).toLocaleString('en-US', {
      timeZone: 'America/Edmonton'
    })
  );
};

// Utility function to format date in MST
const formatDateMST = (date) => {
  if (!date) return '';
  const mstDate = convertToMST(date);
  let month = '' + (mstDate.getMonth() + 1);
  let day = '' + mstDate.getDate();
  const year = mstDate.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

// Add this formatDate function if it's not already defined
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

// Get the current date in MST
const getCurrentDateMST = () => {
  return convertToMST(new Date());
};

// Get min start date in MST
const getMinStartDateMST = () => {
  const today = getCurrentDateMST();
  let minDate = new Date(today);
  let addedDays = 0;

  while (addedDays < 2) {
    minDate.setDate(minDate.getDate() + 1);
    if (minDate.getDay() !== 0 && minDate.getDay() !== 6) { // Exclude weekends
      addedDays++;
    }
  }

  minDate.setHours(0, 0, 0, 0);
  return minDate;
};

// Get min end date in MST
const getMinEndDateMST = (startDate) => {
  if (!startDate) return null;
  const mstStartDate = convertToMST(startDate);
  const minEnd = new Date(mstStartDate);
  minEnd.setMonth(minEnd.getMonth() + 1);
  return minEnd;
};

// Updated getMaxEndDateMST function
const getMaxEndDateMST = (isDiplomaCourse, alreadyWroteDiploma, selectedDiplomaDate) => {
  if (isDiplomaCourse && !alreadyWroteDiploma && selectedDiplomaDate) {
    // Create a new date from the displayDate at midnight
    const displayDate = new Date(selectedDiplomaDate.displayDate);
    displayDate.setHours(0, 0, 0, 0);
    return displayDate;
  }
  return null;
};



// Calculate duration between dates in MST
const calculateDurationMST = (startDate, endDate) => {
  const start = convertToMST(startDate);
  const end = convertToMST(endDate);
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

// Format diploma date in MST
const formatDiplomaDateMST = (dateObj) => {
  const date = convertToMST(dateObj.date);
  return `${dateObj.month} ${date.getFullYear()} (${dateObj.displayDate})`;
};

// === DiplomaMonthSelector Component ===
const DiplomaMonthSelector = ({ dates, selectedDate, onChange, error }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Diploma Exam Date (Mountain Standard Time) <span className="text-red-500">*</span>
      </label>
      <select
        value={selectedDate?.id || 'no-diploma'}
        onChange={(e) => {
          if (e.target.value === 'no-diploma') {
            onChange(null);
          } else {
            const selected = dates.find(d => d.id === e.target.value);
            onChange(selected || null);
          }
        }}
        className={`w-full p-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'}`}
      >
        <option value="">Select diploma exam date</option>
        <option value="no-diploma">I already wrote the diploma exam</option>
        {dates.map((date) => (
          <option key={date.id} value={date.id}>
            {formatDiplomaDateMST(date)}
          </option>
        ))}
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

const NonPrimaryStudentForm = forwardRef(({ onValidationChange }, ref) => {
  const { user } = useAuth();
  const firstName = user?.displayName?.split(' ')[0] || '';
  const lastName = user?.displayName?.split(' ').slice(1).join(' ') || '';
  const email = user?.email || '';

  const initialFormData = {
    phoneNumber: '',
    currentSchool: '',
    schoolAddress: null,
    birthday: '',
    enrollmentYear: '',
    albertaStudentNumber: '',
    courseId: '',
    courseName: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    startDate: '',
    endDate: '',
    additionalInformation: '' 
  };

  const [showParentInfo, setShowParentInfo] = useState(false);
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

  const {
    formData,
    setFormData,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validateForm
  } = useFormValidation(initialFormData, validationRules, {
    conditionalValidation: {
      parentName: () => showParentInfo,
      parentPhone: () => showParentInfo,
      parentEmail: () => showParentInfo
    }
  });

  useImperativeHandle(ref, () => ({
    async submitForm() {
      const formErrors = validateForm();
      if (Object.keys(formErrors).length === 0 && isEligible && validateDates()) {
        try {
          console.log("Form submitted successfully:", formData);
          return true;
        } catch (error) {
          console.error("Form submission error:", error);
          return false;
        }
      }
      return false;
    },
    getFormData: () => formData
  }));

  useEffect(() => {
    onValidationChange(isValid && isEligible && validateDates());
  }, [isValid, isEligible, onValidationChange, dateErrors]);

  useEffect(() => {
    if (formData.birthday) {
      const age = calculateAge(formData.birthday, new Date());
      setShowParentInfo(age < 18);
    }
  }, [formData.birthday]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const db = getDatabase();
        const coursesRef = databaseRef(db, 'courses');
        const snapshot = await get(coursesRef);

        if (snapshot.exists()) {
          const coursesData = [];
          snapshot.forEach((childSnapshot) => {
            const courseId = childSnapshot.key;
            const courseData = childSnapshot.val();
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
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCoursesError('Error loading courses');
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourses();
  }, []);

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
      handleChange({
        target: {
          name: 'enrollmentYear',
          value: nextSchoolYear,
        },
      });
    } else if (currentMonth >= 8 || currentMonth <= 2) { // September to March
      availableYears = [currentSchoolYear];
      message = `Registration is only available for the current school year. Registration for next school year (${nextSchoolYear}) will open in April.`;
      handleChange({
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
  }, [handleChange]);

  useEffect(() => {
    updateAgeInfo();
  }, [formData.birthday, formData.enrollmentYear]);

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
              .filter(item => new Date(item.date) > getCurrentDateMST())
              .sort((a, b) => new Date(a.date) - new Date(b.date));

            setDiplomaDates(validDates);
          }
        }
      } catch (error) {
        console.error('Error fetching diploma info:', error);
      }
    };

    fetchDiplomaInfo();
  }, [formData.courseId]);

  useEffect(() => {
    if (selectedDiplomaDate) {
      const maxEndDate = getMaxEndDateMST(isDiplomaCourse, alreadyWroteDiploma, selectedDiplomaDate);
      if (formData.endDate && new Date(formData.endDate) > maxEndDate) {
        handleChange({
          target: {
            name: 'endDate',
            value: formatDateMST(maxEndDate)
          }
        });
      }
    }
  }, [selectedDiplomaDate, formData.endDate, handleChange, isDiplomaCourse, alreadyWroteDiploma]);

  useEffect(() => {
    if (!formData.courseId) return;

    setFormData(prev => ({
      ...prev,
      endDate: ''
    }));
    setSelectedDiplomaDate(null);
    setAlreadyWroteDiploma(false);
  }, [formData.courseId, setFormData]);

  const getCurrentSchoolYear = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const startYear = currentMonth >= 8 ? currentYear : currentYear - 1;
    return `${startYear.toString().slice(-2)}/${(startYear + 1).toString().slice(-2)}`;
  };

  const getNextSchoolYear = () => {
    const [startYear] = getCurrentSchoolYear().split('/');
    const nextStartYear = parseInt(startYear, 10) + 1;
    return `${nextStartYear}/${nextStartYear + 1}`;
  };

  const calculateAge = (birthday, date) => {
    const birthDate = new Date(birthday);
    const age = date.getFullYear() - birthDate.getFullYear();
    const monthDiff = date.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && date.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const updateAgeInfo = () => {
    if (formData.birthday && formData.enrollmentYear) {
      const [enrollmentStartYear] = formData.enrollmentYear.split('/');
      const lastSeptember = new Date(parseInt('20' + enrollmentStartYear, 10) - 1, 8, 1); // September 1st of the previous year
      const nextSeptember = new Date(parseInt('20' + enrollmentStartYear, 10), 8, 1); // September 1st of the enrollment start year
      const today = getCurrentDateMST();
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

  const handleDateChange = (date) => {
    handleChange({
      target: {
        name: 'birthday',
        value: date ? formatDateMST(date) : '',
      },
    });
  };

  const getInitialBirthdayDate = () => {
    const today = getCurrentDateMST();
    return new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
  };

  const handleCourseChange = (e) => {
    const { value } = e.target;
    const selectedCourse = courses.find(course => course.id === value);

    setFormData(prev => ({
      ...prev,
      courseId: value,
      courseName: selectedCourse ? selectedCourse.title : ''
    }));

    setIsDiplomaCourse(false);
    setDiplomaDates([]);
    setSelectedDiplomaDate(null);
    setAlreadyWroteDiploma(false);

    setFormData(prev => ({
      ...prev,
      endDate: ''
    }));
  };

  const handleASNChange = (e) => {
    const { value } = e.target;
    let formattedValue = value.replace(/\D/g, "").slice(0, 9);
    if (formattedValue.length > 4) {
      formattedValue = `${formattedValue.slice(0, 4)}-${formattedValue.slice(4)}`;
    }
    if (formattedValue.length > 9) {
      formattedValue = `${formattedValue.slice(0, 9)}-${formattedValue.slice(9)}`;
    }
    handleChange({
      target: {
        name: "albertaStudentNumber",
        value: formattedValue,
      },
    });
  };

  // Updated handleStartDateChange function using MST
  const handleStartDateChangeMST = (date) => {
    const minDate = getMinStartDateMST();
    const mstDate = convertToMST(date);

    if (mstDate < minDate) {
      setDateErrors(prev => ({
        ...prev,
        startDate: 'Start date must be at least 2 business days from today'
      }));
      return;
    }

    handleChange({
      target: {
        name: 'startDate',
        value: formatDateMST(date)
      }
    });
    setDateErrors(prev => ({ ...prev, startDate: '' }));
  };

  // Updated handleEndDateChangeMST function
  const handleEndDateChangeMST = (date) => {
    const minEnd = getMinEndDateMST(formData.startDate);
    const maxEnd = getMaxEndDateMST(isDiplomaCourse, alreadyWroteDiploma, selectedDiplomaDate);
    const mstDate = convertToMST(date);

    if (minEnd && mstDate < minEnd) {
      setDateErrors(prev => ({
        ...prev,
        endDate: 'End date must be at least 1 month after start date'
      }));
      return;
    }

    if (maxEnd && mstDate > maxEnd) {
      setDateErrors(prev => ({
        ...prev,
        endDate: 'End date must be on or before the diploma exam'
      }));
      return;
    }

    handleChange({
      target: {
        name: 'endDate',
        value: formatDateMST(date)
      }
    });
    setDateErrors(prev => ({ ...prev, endDate: '' }));
  };

 // Updated handleDiplomaDateChange function
const handleDiplomaDateChange = (date) => {
  if (date === null) {
    setAlreadyWroteDiploma(true);
    setSelectedDiplomaDate(null);
    
    if (formData.startDate) {
      // Handle the case when they've already written the diploma
      const startDate = new Date(formData.startDate);
      const defaultEndDate = new Date(startDate);
      defaultEndDate.setMonth(defaultEndDate.getMonth() + 5);
      handleChange({
        target: {
          name: 'endDate',
          value: formatDate(defaultEndDate)
        }
      });
    }
  } else {
    setAlreadyWroteDiploma(false);
    setSelectedDiplomaDate(date);
    
    // Simply use the displayDate - this is the cleanest solution
    handleChange({
      target: {
        name: 'endDate',
        value: date.displayDate
      }
    });
  }
  setDateErrors(prev => ({ ...prev, diplomaDate: '' }));
};

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

  return (
    <div className="space-y-8">
      {/* Form Header */}
      <div>
        <h3 className="text-lg font-medium">Non-Primary Student Registration</h3>
        <p className="text-sm text-muted-foreground">
          Please provide your information as a non-primary student
        </p>
      </div>

     

      {/* Account Info Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <InfoIcon className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-700">
          You are registering with the following account information. If this is not you,
          please log out and sign in with your correct account.
        </AlertDescription>
      </Alert>

      {/* Profile Information Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md hover:shadow-lg transition-all duration-200 border-t-4 border-t-blue-400">
        <CardHeader>
          <h3 className="text-md font-semibold">Profile Information</h3>
        </CardHeader>
        <CardContent className="grid gap-6">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md bg-gray-50"
                value={firstName}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md bg-gray-50"
                value={lastName}
                readOnly
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <input
              type="email"
              className="w-full p-2 border rounded-md bg-gray-50"
              value={email}
              readOnly
            />
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <PhoneInput
              country={"ca"}
              value={formData.phoneNumber}
              onChange={(value, country, e, formattedValue) => {
                handleChange({
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

          {/* Birthday Section */}
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
              selected={formData.birthday ? new Date(formData.birthday) : null}
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

          {/* Alberta Student Number (ASN) Section */}
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

          {/* School Selection Section */}
          <div className="space-y-2">
            <div className="mb-2">
              <label className="text-sm font-medium">
                Current School <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-600">
                Please select your current school from the list
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
            {touched.schoolAddress && errors.schoolAddress && (
              <ValidationFeedback
                isValid={false}
                message={errors.schoolAddress}
              />
            )}
          </div>

          {/* Parent Information Section */}
          {showParentInfo ? (
            <div className="space-y-6">
              <h4 className="text-md font-medium">Parent/Guardian Information (Required)</h4>
              <p className="text-sm text-gray-600">
                As you are under 18, parent/guardian information is required.
              </p>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Parent Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="parentName"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('parentName')}
                  className={`w-full p-2 border rounded-md ${
                    touched.parentName && errors.parentName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                <ValidationFeedback
                  isValid={touched.parentName && !errors.parentName}
                  message={
                    touched.parentName
                      ? errors.parentName || validationRules.parentName.successMessage
                      : null
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Parent Phone Number <span className="text-red-500">*</span>
                </label>
                <PhoneInput
                  country={"ca"}
                  value={formData.parentPhone}
                  onChange={(value, country, e, formattedValue) => {
                    handleChange({
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

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Parent Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="parentEmail"
                  name="parentEmail"
                  value={formData.parentEmail}
                  onChange={handleChange}
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
            </div>
          ) : (
            <div className="space-y-6">
              <h4 className="text-md font-medium">Parent/Guardian Information (Optional)</h4>
              <p className="text-sm text-gray-600">
                As you are 18 or older, parent/guardian information is optional.
              </p>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Parent Name
                </label>
                <input
                  type="text"
                  id="parentName"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('parentName')}
                  className={`w-full p-2 border rounded-md ${
                    touched.parentName && errors.parentName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <ValidationFeedback
                  isValid={touched.parentName && !errors.parentName}
                  message={
                    touched.parentName
                      ? errors.parentName || validationRules.parentName.successMessage
                      : null
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Parent Phone Number
                </label>
                <PhoneInput
                  country={"ca"}
                  value={formData.parentPhone}
                  onChange={(value, country, e, formattedValue) => {
                    handleChange({
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

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Parent Email
                </label>
                <input
                  type="email"
                  id="parentEmail"
                  name="parentEmail"
                  value={formData.parentEmail}
                  onChange={handleChange}
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
              onChange={handleChange}
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
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
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
                    <li>Your diploma exam is scheduled for {formatDiplomaDateMST(selectedDiplomaDate)} </li>
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
                selected={formData.startDate ? new Date(formData.startDate) : null}
                onChange={handleStartDateChangeMST}
                minDate={getMinStartDateMST()}
                helpText="Please select a start date at least 2 business days from today."
                error={dateErrors.startDate}
              />

<DatePickerWithInfo
  label="Completion Date"
  selected={formData.endDate ? (() => {
    const date = new Date(formData.endDate + 'T00:00:00');
    date.setDate(date.getDate() + 1);  // Add one day
    return date;
  })() : null}
  onChange={handleEndDateChangeMST}
  minDate={getMinEndDateMST(formData.startDate)}
  maxDate={getMaxEndDateMST(isDiplomaCourse, alreadyWroteDiploma, selectedDiplomaDate)}
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
              <div className="p-4 bg-gray-50 rounded-md">
                <h5 className="font-medium text-sm">Course Duration</h5>
                <p className="text-sm text-gray-600">
                  {calculateDurationMST(formData.startDate, formData.endDate)}
                </p>
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
        onChange={handleChange}
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
    </div>
  );
});

NonPrimaryStudentForm.displayName = 'NonPrimaryStudentForm';

export default NonPrimaryStudentForm;

// === Additional Components Used in the Form ===

const DatePickerWithInfo = ({ label, selected, onChange, minDate, maxDate, helpText, error, disabled = false, readOnly = false }) => {
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
        selected={selected}
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
