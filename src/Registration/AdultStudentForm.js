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
  import CapitalizedInput from '../components/CapitalizedInput';
  import { getDatabase, ref as databaseRef, get, set } from 'firebase/database';
  import {
    ValidationFeedback,
    validationRules,
    useFormValidation
  } from './formValidation';
  
  // Utility functions from NonPrimaryStudentForm
  const utcToLocal = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };
  
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
  
  // Move formatDiplomaDate outside to be accessible by both components
  const formatDiplomaDate = (dateObj) => {
    const date = new Date(dateObj.date);
    return `${dateObj.month} ${date.getUTCFullYear()} (${dateObj.displayDate})`;
  };
  
  const getMinStartDate = () => {
    const today = new Date();
    let minDate = new Date(today);
    minDate.setHours(0, 0, 0, 0);
    let addedDays = 0;
  
    while (addedDays < 2) {
      minDate.setDate(minDate.getDate() + 1);
      if (minDate.getDay() !== 0 && minDate.getDay() !== 6) {
        addedDays++;
      }
    }
  
    return minDate;
  };
  
  const getMinEndDate = (startDate) => {
    if (!startDate) return null;
    const minEnd = new Date(startDate);
    minEnd.setMonth(minEnd.getMonth() + 1);
    return minEnd;
  };
  
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
  
  const AdultStudentForm = forwardRef(({ onValidationChange, initialData, onSave }, ref) => {
    const { user, user_email_key } = useAuth();
    const uid = user?.uid;
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
  
    const [usePreferredFirstName, setUsePreferredFirstName] = useState(false);
    const [includeParentInfo, setIncludeParentInfo] = useState(false);
  
    const getInitialFormData = () => {
      if (initialData) {
        return initialData;
      }
  
      return {
        firstName: validationRules.firstName.format(user?.displayName?.split(' ')[0] || ''),
        lastName: validationRules.lastName.format(user?.displayName?.split(' ').slice(1).join(' ') || ''),
        preferredFirstName: '',
        phoneNumber: '',
        birthday: '',
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
        studentType: 'Adult Student',
        age: null
      };
    };
  
    const [formData, setFormData] = useState(getInitialFormData());
    const [coursesLoading, setCoursesLoading] = useState(true);
    const [coursesError, setCoursesError] = useState(null);
    const [courses, setCourses] = useState([]);
    const [dateErrors, setDateErrors] = useState({
      startDate: '',
      endDate: '',
      diplomaDate: ''
    });
  
    // Add new state variables for diploma functionality
    const [isDiplomaCourse, setIsDiplomaCourse] = useState(false);
    const [diplomaDates, setDiplomaDates] = useState([]);
    const [selectedDiplomaDate, setSelectedDiplomaDate] = useState(null);
    const [alreadyWroteDiploma, setAlreadyWroteDiploma] = useState(false);
    const [courseHours, setCourseHours] = useState(null);
  
    // Add getMaxEndDate utility function
    const getMaxEndDate = useCallback((isDiplomaCourse, alreadyWroteDiploma, selectedDiplomaDate) => {
      if (isDiplomaCourse && !alreadyWroteDiploma && selectedDiplomaDate) {
        const displayDate = new Date(selectedDiplomaDate.date);
        displayDate.setUTCHours(0, 0, 0, 0);
        return displayDate;
      }
      return null;
    }, []);
  
    // Fetch profile data
    useEffect(() => {
      const fetchProfileData = async () => {
        if (!user_email_key) return;
  
        try {
          const db = getDatabase();
          const profileRef = databaseRef(db, `students/${user_email_key}/profile`);
          const snapshot = await get(profileRef);
  
          if (snapshot.exists()) {
            const data = snapshot.val();
            setProfileData(data);
  
            // Update form data with profile data
            setFormData(prev => ({
              ...prev,
              firstName: data.firstName || prev.firstName,
              lastName: data.lastName || prev.lastName,
              phoneNumber: data.StudentPhone || prev.phoneNumber,
              birthday: data.birthday || prev.birthday,
              albertaStudentNumber: data.asn || prev.albertaStudentNumber,
              parentFirstName: data.ParentFirstName || prev.parentFirstName,
              parentLastName: data.ParentLastName || prev.parentLastName,
              parentPhone: data.ParentPhone_x0023_ || prev.parentPhone,
              parentEmail: data.ParentEmail || prev.parentEmail,
              preferredFirstName: data.preferredFirstName || prev.preferredFirstName
            }));
  
            // If there's a preferred first name in the profile, enable the checkbox
            if (data.preferredFirstName) {
              setUsePreferredFirstName(true);
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
        parentEmail: !!profileData.ParentEmail
        // Remove preferredFirstName from readOnlyFields
      };
    }, [profileData]);
  
    // Update options to properly handle preferredFirstName validation
    const options = useMemo(() => ({
        conditionalValidation: {
          parentFirstName: () => includeParentInfo,
          parentLastName: () => includeParentInfo,
          parentPhone: () => includeParentInfo,
          parentEmail: () => includeParentInfo,
          preferredFirstName: () => usePreferredFirstName
        },
        readOnlyFields // Include the readOnlyFields directly without modification
      }), [includeParentInfo, usePreferredFirstName, readOnlyFields]);
    
      // Initialize form validation with the correct options
      const {
        errors,
        touched,
        isValid,
        handleBlur,
        validateForm,
        formData: validatedFormData
      } = useFormValidation(formData, validationRules, options);

      useEffect(() => {
        if (profileData) {
          const updatedFormData = { ...formData };
          let hasChanges = false;
    
          // Update form data with profile data for read-only fields
          Object.entries(readOnlyFields).forEach(([fieldName, isReadOnly]) => {
            if (isReadOnly && profileData[fieldName]) {
              updatedFormData[fieldName] = profileData[fieldName];
              hasChanges = true;
            }
          });
    
          // Only update if there were changes
          if (hasChanges) {
            setFormData(updatedFormData);
            
            // Trigger validation after setting form data
            setTimeout(() => {
              validateForm();
            }, 0);
          }
        }
      }, [profileData, readOnlyFields]);
    
    // Save to pending registration
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
  
    // Debounced save
    const debouncedSave = useCallback(
      _.debounce(async (newData) => {
        await saveToPendingRegistration(newData);
      }, 1000),
      []
    );
  
    // Handle form field changes
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
  
    // Handle ASN change
    const handleASNChange = (e) => {
      const { name, value } = e.target;
  
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
  
      debouncedSave({
        ...formData,
        [name]: value
      });
  
      handleBlur(name);
    };
  
    // Add filter functions for the start and end dates
    const filterStartDate = (date) => {
      // Don't allow dates before minimum start date
      if (date < getMinStartDate()) {
        return false;
      }
  
      // If there's an end date, don't allow dates within 1 month of it
      if (formData.endDate) {
        const minimumGap = new Date(date);
        minimumGap.setMonth(minimumGap.getMonth() + 1);
        return new Date(formData.endDate) >= minimumGap;
      }
  
      return true;
    };
  
    const filterEndDate = (date) => {
      // If there's a start date, don't allow dates less than 1 month after it
      if (formData.startDate) {
        const minimumEndDate = new Date(formData.startDate);
        minimumEndDate.setMonth(minimumEndDate.getMonth() + 1);
        return date >= minimumEndDate;
      }
      return true;
    };
  
    // Simplified handleStartDateChange and handleEndDateChange
    const handleStartDateChange = (date) => {
      handleFormChange({
        target: {
          name: 'startDate',
          value: formatDate(date)
        }
      });
      setDateErrors(prev => ({ ...prev, startDate: '' }));
    };
  
    // Update handleEndDateChange to include diploma course logic
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
  
    // Add handleDiplomaDateChange function
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
  
    // Validate dates
    const validateDates = useCallback(() => {
      let valid = true;
      const newDateErrors = { ...dateErrors };
  
      if (!formData.startDate) {
        newDateErrors.startDate = 'Start date is required';
        valid = false;
      }
  
      if (!formData.endDate) {
        newDateErrors.endDate = 'End date is required';
        valid = false;
      }
  
      if (isDiplomaCourse && !alreadyWroteDiploma && !selectedDiplomaDate) {
        newDateErrors.diplomaDate = 'Diploma date is required';
        valid = false;
      }
  
      setDateErrors(newDateErrors);
      return valid;
    }, [formData.startDate, formData.endDate, isDiplomaCourse, alreadyWroteDiploma, selectedDiplomaDate]);
  
    // Update validation effect
    useEffect(() => {
        const validateAll = () => {
          const formErrors = validateForm();
          const hasValidReadOnlyFields = Object.entries(readOnlyFields)
            .every(([field, isReadOnly]) => !isReadOnly || (isReadOnly && formData[field]));
          
          onValidationChange(
            Object.keys(formErrors).length === 0 && 
            hasValidReadOnlyFields && 
            validateDates()
          );
        };
    
        validateAll();
      }, [validateForm, readOnlyFields, formData, validateDates, onValidationChange]);
  
    // Fetch courses
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
              if (courseId === 'sections') return;
  
              const courseData = childSnapshot.val();
              if (!courseData.Title) return;
  
              coursesData.push({
                id: courseId,
                title: courseData.Title
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
  
    // Add useEffect for fetching diploma course information
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
  
    // Add useEffect for adjusting end date based on selected diploma date
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
    }, [selectedDiplomaDate, formData.endDate, isDiplomaCourse, alreadyWroteDiploma, getMaxEndDate, handleFormChange]);
  
    // Calculate hours per week function
    const calculateHoursPerWeek = (startDate, endDate, totalHours) => {
      if (!startDate || !endDate || !totalHours) return null;
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const diffWeeks = diffDays / 7;
      
      const hoursPerWeek = totalHours / diffWeeks;
      return hoursPerWeek.toFixed(1);
    };
  
    // Handle form submission
    useImperativeHandle(ref, () => ({
      async submitForm() {
        const formErrors = validateForm();
        if (Object.keys(formErrors).length === 0 && validateDates()) {
          try {
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
  
    // Add the renderReadOnlyField helper function
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
  
    // Add the renderPreferredNameField helper function
    const renderPreferredNameField = () => (
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
        )}
      </div>
    );
  
    // === Render Component ===
    return (
      <div className="space-y-8 relative">
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
            <div>
              <h3 className="text-lg font-medium">Adult Student Registration</h3>
              <p className="text-sm text-muted-foreground">
                Please provide your information as an adult student
              </p>
            </div>
  
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
  
                {/* Preferred First Name - single instance */}
                {renderPreferredNameField()}
  
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
                    <label className="text-sm font-medium">
                      Birthday <span className="text-red-500">*</span>
                    </label>
                    <DatePicker
                      selected={formData.birthday ? utcToLocal(formData.birthday) : null}
                      onChange={(date) => {
                        handleFormChange({
                          target: {
                            name: 'birthday',
                            value: formatDate(date)
                          }
                        });
                      }}
                      customInput={<CustomDateInput />}
                      maxDate={new Date()}
                      showYearDropdown
                      scrollableYearDropdown
                      yearDropdownItemNumber={100}
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
  
                {/* Optional Parent Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeParentInfo"
                      checked={includeParentInfo}
                      onChange={(e) => setIncludeParentInfo(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="includeParentInfo" className="text-sm font-medium">
                      Include Parent/Guardian Information (Optional)
                    </label>
                  </div>
  
                  {includeParentInfo && (
                    <div className="space-y-4">
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
                  )}
                </div>
              </CardContent>
            </Card>
  
            {/* Course Information Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md hover:shadow-lg transition-all duration-200 border-t-4 border-t-blue-400">
              <CardHeader>
                <h3 className="text-md font-semibold">Course Information</h3>
              </CardHeader>
              <CardContent className="grid gap-6">
                {/* Course Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Course Selection <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="courseId"
                    value={formData.courseId}
                    onChange={(e) => {
                      const selectedCourse = courses.find(course => course.id === e.target.value);
                      handleFormChange({
                        target: {
                          name: 'courseId',
                          value: e.target.value
                        }
                      });
                      if (selectedCourse) {
                        handleFormChange({
                          target: {
                            name: 'courseName',
                            value: selectedCourse.title
                          }
                        });
                      }
                    }}
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
  
                {/* Add this section after the course selection in the Course Information Card */}
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
                          <li>Your diploma exam is scheduled for {formatDiplomaDate(selectedDiplomaDate)}</li>
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
                      maxDate={formData.endDate ? new Date(formData.endDate) : undefined}
                      helpText="Please select a start date at least 2 business days from today and 1 month before end date."
                      error={dateErrors.startDate}
                      filterDate={filterStartDate}
                    />
  
                    <DatePickerWithInfo
                      label="Completion Date"
                      selected={formData.endDate}
                      onChange={handleEndDateChange}
                      minDate={formData.startDate ? getMinEndDate(formData.startDate) : undefined}
                      disabled={!formData.startDate}
                      helpText="Must be at least 1 month after start date"
                      error={dateErrors.endDate}
                      filterDate={filterEndDate}
                    />
                  </div>
  
                  {/* Update the Course Duration section to include study time */}
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
          </>
        )}
      </div>
    );
  });
  
  // Custom Date Input Component
  const CustomDateInput = forwardRef(({ value, onClick, disabled, error, placeholder }, ref) => (
    <div className="relative">
      <input
        type="text"
        value={value || ''}
        onClick={disabled ? undefined : onClick}
        readOnly
        disabled={disabled}
        className={`w-full p-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'} ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'
        }`}
        placeholder={placeholder || 'Select date'}
        ref={ref}
      />
      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
    </div>
  ));
  
  CustomDateInput.displayName = 'CustomDateInput';
  
  // Updated DatePickerWithInfo Component
  const DatePickerWithInfo = ({
    label,
    selected,
    onChange,
    minDate,
    maxDate,
    helpText,
    error,
    disabled = false,
    filterDate = null
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
          filterDate={filterDate}
          customInput={
            <CustomDateInput
              disabled={disabled}
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
  
  AdultStudentForm.displayName = 'AdultStudentForm';
  
  export default AdultStudentForm;
  