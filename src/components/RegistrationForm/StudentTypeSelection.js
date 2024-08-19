import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { studentTypeInfo } from '../../config/variables';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const provinces = [
  "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador",
  "Nova Scotia", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Northwest Territories",
  "Nunavut", "Yukon"
];

const StudentTypeSelection = forwardRef(({ formData, handleChange, calculateAge, isOver20ForSchoolYear, getCurrentSchoolYear, getNextSchoolYear }, ref) => {
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [justDetermined, setJustDetermined] = useState(false);
  const [ageInfo, setAgeInfo] = useState('');
  const [errors, setErrors] = useState({});
  const [noASN, setNoASN] = useState(formData.noASN === "No ASN");
  const [availableEnrollmentYears, setAvailableEnrollmentYears] = useState([]);
  const [enrollmentYearMessage, setEnrollmentYearMessage] = useState('');
  const [birthdayPickerOpen, setBirthdayPickerOpen] = useState(false);
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);

  const studentTypes = [
    { value: 'Non-Primary', label: 'Non-Primary Student' },
    { value: 'Home Education', label: 'Home Education Student' },
    { value: 'Summer School', label: 'Summer School Student' },
    { value: 'Adult Student', label: 'Adult Student' },
    { value: 'International Student', label: 'International Student' }
  ];

  const questions = [
    {
      id: 'albertaCitizen',
      text: 'Are you a Canadian citizen or permanent resident?',
      options: ['Yes', 'No'],
      next: (answer) => answer === 'Yes' ? 1 : 'International Student'
    },
    {
      id: 'albertaResident',
      text: 'Are you a resident of Alberta?',
      options: ['Yes', 'No'],
      next: (answer) => answer === 'Yes' ? 2 : 'Adult Student'
    },
    {
      id: 'enrolledInSchool',
      text: 'Are you enrolled in another junior high or high school in Alberta?',
      options: ['Yes', 'No'],
      next: (answer) => answer === 'Yes' ? 3 : 4
    },
    {
      id: 'summerIntentEnrolled',
      text: 'Do you intend to complete the course between July and August?',
      options: ['Yes', 'No'],
      next: (answer) => answer === 'Yes' ? 'Summer School' : 'Non-Primary'
    },
    {
      id: 'homeEducation',
      text: 'Is your education parent-directed and part of a Home Education Program?',
      options: ['Yes', 'No'],
      next: (answer) => answer === 'Yes' ? 5 : 'Adult Student'
    },
    {
      id: 'summerIntentHomeEd',
      text: 'Do you intend to complete the course between July and August?',
      options: ['Yes', 'No'],
      next: (answer) => answer === 'Yes' ? 'Summer School' : 'Home Education'
    }
  ];

  useEffect(() => {
    updateAgeInfo();
  }, [formData.birthday, formData.enrollmentYear]);

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

    // If the current enrollmentYear is not in the available years, reset it
    if (!availableYears.includes(formData.enrollmentYear)) {
      handleChange({
        target: {
          name: 'enrollmentYear',
          value: availableYears[0],
        },
      });
    }

    // Initialize noASN in formData if it's not already set
    if (formData.noASN === undefined) {
      handleChange({
        target: {
          name: "noASN",
          value: ""
        }
      });
    }

    // Initialize province
    if (!formData.province) {
      handleChange({
        target: {
          name: 'province',
          value: 'Alberta'
        }
      });
    }
  }, []);

  const updateAgeInfo = () => {
    if (formData.birthday && formData.enrollmentYear) {
      const [enrollmentStartYear] = formData.enrollmentYear.split('/');
      const lastSeptember = new Date(parseInt('20' + enrollmentStartYear) - 1, 8, 1);
      const nextSeptember = new Date(parseInt('20' + enrollmentStartYear), 8, 1);
      const today = new Date();
      const currentAge = calculateAge(formData.birthday, today);
      const ageLastSeptember = calculateAge(formData.birthday, lastSeptember);
      const ageNextSeptember = calculateAge(formData.birthday, nextSeptember);
  
      if (ageLastSeptember >= 20) {
        setAgeInfo(`You are currently ${currentAge} years old. You are over 20 and not considered a school-age student.`);
      } else if (currentAge >= 20 || ageNextSeptember >= 20) {
        setAgeInfo(`You are currently ${currentAge} years old. You are a school-age student for the current school year, but will not be for the next school year.`);
      } else if (currentAge > 18) {
        setAgeInfo(`You are currently ${currentAge} years old. You are considered a school-age student for both the current and next school year.`);
      } else {
        setAgeInfo(`You are currently ${currentAge} years old and considered a school-age student.`);
      }
    }
  };

  const handleStudentTypeChange = (e) => {
    const { value } = e.target;
    handleChange(e);
    setJustDetermined(false);
    setShowProvinceDropdown(value === 'Adult Student');

    // Update province based on student type
    if (value === 'International Student') {
      handleChange({
        target: {
          name: 'province',
          value: 'NA'
        }
      });
    } else if (value !== 'Adult Student') {
      handleChange({
        target: {
          name: 'province',
          value: 'Alberta'
        }
      });
    }

    if (value !== 'International Student' && value !== 'Adult Student') {
      setNoASN(false);
      handleChange({
        target: {
          name: "noASN",
          value: ""
        }
      });
    }
  };

  const handleProvinceChange = (e) => {
    const { value } = e.target;
    handleChange(e);
    if (value !== 'Alberta') {
      setNoASN(true);
      handleChange({
        target: {
          name: "noASN",
          value: "No ASN"
        }
      });
    } else {
      setNoASN(false);
      handleChange({
        target: {
          name: "noASN",
          value: ""
        }
      });
    }
  };

  const handleNoASNChange = (e) => {
    const isChecked = e.target.checked;
    setNoASN(isChecked);
    
    handleChange({
      target: {
        name: "noASN",
        value: isChecked ? "No ASN" : ""
      }
    });
  
    if (isChecked) {
      handleChange({
        target: {
          name: "albertaStudentNumber",
          value: ""
        }
      });
    }
  };

  const handleAnswer = (answer) => {
    const nextStep = questions[currentQuestion].next(answer);
    if (typeof nextStep === 'string') {
      handleChange({
        target: {
          name: 'studentType',
          value: nextStep
        }
      });
      setShowQuestionnaire(false);
      setJustDetermined(true);
    } else if (nextStep < questions.length) {
      if (currentQuestion === 0 && answer === 'Yes' && isOver20ForSchoolYear()) {
        handleChange({
          target: {
            name: 'studentType',
            value: 'Adult Student'
          }
        });
        setShowQuestionnaire(false);
        setJustDetermined(true);
      } else {
        setCurrentQuestion(nextStep);
      }
    }
  };

  const startQuestionnaire = () => {
    setShowQuestionnaire(true);
    setCurrentQuestion(0);
    setJustDetermined(false);
  };

  const exitQuestionnaire = () => {
    setShowQuestionnaire(false);
    setCurrentQuestion(0);
    handleChange({
      target: {
        name: 'studentType',
        value: ''
      }
    });
    setJustDetermined(false);
  };

  const restartQuestionnaire = () => {
    setCurrentQuestion(0);
    setJustDetermined(false);
    setShowQuestionnaire(true);
    handleChange({
      target: {
        name: 'studentType',
        value: ''
      }
    });
  };

  const getAvailableStudentTypes = () => {
    if (isOver20ForSchoolYear()) {
      return studentTypes.filter(type => ['Adult Student', 'International Student'].includes(type.value));
    }
    return studentTypes;
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

  const renderASNInstructions = () => {
    switch (formData.studentType) {
      case 'Non-Primary':
      case 'Home Education':
      case 'Summer School':
        return (
          <p className="asn-instructions">
            Any student that has taken a course in Alberta has an ASN. 
            <a href="https://learnerregistry.ae.alberta.ca/Home/StartLookup" target="_blank" rel="noopener noreferrer"> Click here to easily find yours</a>.
          </p>
        );
      case 'Adult Student':
        return (
          <p className="asn-instructions">
            If you have ever taken a course in Alberta, you should have an ASN. 
            <a href="https://learnerregistry.ae.alberta.ca/Home/StartLookup" target="_blank" rel="noopener noreferrer"> Click here to find yours</a>. 
            If you cannot find your ASN, please email info@rtdacademy.com for assistance.
          </p>
        );
      case 'International Student':
        return (
          <p className="asn-instructions">
            You would not have an ASN assigned unless you have taken a previous course in Alberta. 
            If you have and know your number, please provide it below. 
            If you do not have an ASN yet, leave this blank, and one will be assigned to you once we add you to the Alberta PASI system.
          </p>
        );
      default:
        return null;
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.birthday) {
      newErrors.birthday = "Birthday is required";
    }

    if (!formData.enrollmentYear) {
      newErrors.enrollmentYear = "Enrollment year is required";
    }

    if (!formData.studentType) {
      newErrors.studentType = "Student type is required";
    }

    if (formData.studentType === 'Adult Student' && !formData.province) {
      newErrors.province = "Province is required for Adult Students.";
    }

    if (formData.studentType && formData.studentType !== 'International Student') {
      if (formData.province === 'Alberta' && !formData.albertaStudentNumber && !noASN) {
        newErrors.albertaStudentNumber = "Alberta Student Number is required";
      } else if (formData.albertaStudentNumber && formData.albertaStudentNumber.replace(/\D/g, "").length !== 9) {
        newErrors.albertaStudentNumber = "Alberta Student Number must be 9 digits";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useImperativeHandle(ref, () => ({
    validateForm
  }));

  const CustomInput = forwardRef(({ value, onClick }, ref) => (
    <div className="form-group date-input-group" onClick={onClick} ref={ref}>
      <input
        type="text"
        value={value || ''}
        readOnly
        className={`form-input ${errors.birthday ? 'is-invalid' : ''}`}
        placeholder=" "
      />
      <label className="form-label">Birthday</label>
      <svg className="calendar-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
      {errors.birthday && <div className="error-message">{errors.birthday}</div>}
    </div>
  ));
  
  const formatDate = (date) => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
  
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
  
    return [year, month, day].join('-');
  };
  
  const handleBirthdayChange = (date) => {
    handleChange({
      target: {
        name: 'birthday',
        value: date ? formatDate(date) : '',
      },
    });
    setBirthdayPickerOpen(false);
  };
  
  const getInitialBirthdayDate = () => {
    const today = new Date();
    return new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
  };
  
  const renderEnrollmentYearSelect = () => {
    return (
      <div className="form-group enrollment-year-group">
        <select
          id="enrollmentYear"
          name="enrollmentYear"
          value={formData.enrollmentYear}
          onChange={handleChange}
          required
          className={`form-select ${errors.enrollmentYear ? 'is-invalid' : ''}`}
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
        <small className="form-help-text enrollment-year-message">
          {enrollmentYearMessage}
        </small>
        {errors.enrollmentYear && <div className="error-message">{errors.enrollmentYear}</div>}
      </div>
    );
  };

  return (
    <section className="form-section">
      <h2 className="section-title">Student Information</h2>
      {ageInfo && <p className="age-info">{ageInfo}</p>}
      <DatePicker
        selected={formData.birthday ? new Date(formData.birthday) : null}
        onChange={handleBirthdayChange}
        customInput={<CustomInput />}
        open={birthdayPickerOpen}
        onClickOutside={() => setBirthdayPickerOpen(false)}
        onInputClick={() => setBirthdayPickerOpen(true)}
        maxDate={new Date()}
        showYearDropdown
        scrollableYearDropdown
        yearDropdownItemNumber={100}
        openToDate={getInitialBirthdayDate()}
        className="custom-datepicker"
      />
      {renderEnrollmentYearSelect()}

      {formData.birthday && formData.enrollmentYear && (
        <div className="student-type-section">
          <h3 className="section-subtitle">What type of student are you?</h3>
          {isOver20ForSchoolYear() && (
            <p className="age-message">
              Based on your birthday and enrollment year, you are or will be over 20 years old during the selected school year. 
              Please choose one of the following options that best describes your situation:
            </p>
          )}
          
          {!showQuestionnaire && !justDetermined && (
            <div className="questionnaire-button-container">
              <button type="button" onClick={startQuestionnaire} className="form-button secondary">
                Help me determine my student type
              </button>
            </div>
          )}

          {!showQuestionnaire && !justDetermined && (
            <div className="form-group">
              <select
                id="studentType"
                name="studentType"
                value={formData.studentType}
                onChange={handleStudentTypeChange}
                required
                className={`form-select ${errors.studentType ? 'is-invalid' : ''}`}
              >
                <option value="">Select your student type</option>
                {getAvailableStudentTypes().map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <label htmlFor="studentType" className="form-label">Student Type</label>
              {errors.studentType && <div className="error-message">{errors.studentType}</div>}
            </div>
          )}

          {showQuestionnaire && !justDetermined && (
            <div className="questionnaire-container">
              <div className="questionnaire">
                <h3>Student Type Questionnaire</h3>
                <div className="question">
                  <p>{questions[currentQuestion].text}</p>
                  {questions[currentQuestion].options.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleAnswer(option)}
                      className="form-button answer-button"
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={exitQuestionnaire} className="form-button secondary">
                  Exit Questionnaire
                </button>
              </div>
            </div>
          )}

          {(justDetermined || formData.studentType) && (
            <div className="student-type-info">
              <p className="determination-message">
                Based on your {justDetermined ? 'answers' : 'selection'}, you are a <strong>{studentTypes.find(type => type.value === formData.studentType)?.label}</strong>.
              </p>
              <h3>Student Type: {studentTypes.find(type => type.value === formData.studentType)?.label}</h3>
              <p>{studentTypeInfo[formData.studentType]}</p>
              <div className="questionnaire-actions">
                <button type="button" onClick={restartQuestionnaire} className="form-button secondary">
                  Restart Questionnaire
                </button>
                <button type="button" onClick={exitQuestionnaire} className="form-button secondary">
                  Change Selection Manually
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {formData.studentType === 'Adult Student' && (
        <div className="form-group">
          <label htmlFor="province">Province</label>
          <select
            id="province"
            name="province"
            value={formData.province || ''}
            onChange={handleProvinceChange}
            required
            className={`form-select ${errors.province ? 'is-invalid' : ''}`}
          >
            <option value="">Select your province</option>
            {provinces.map(province => (
              <option key={province} value={province}>{province}</option>
            ))}
          </select>
          {errors.province && <div className="error-message">{errors.province}</div>}
        </div>
      )}

      {formData.studentType && (
        <div className="asn-section">
          <h3>Alberta Student Number (ASN)</h3>
          {renderASNInstructions()}
          {(formData.studentType === 'International Student' || (formData.studentType === 'Adult Student' && formData.province !== 'Alberta')) && (
            <div className="form-group asn-checkbox">
              <input
                type="checkbox"
                id="noASN"
                name="noASN"
                checked={noASN}
                onChange={handleNoASNChange}
                className="form-checkbox"
              />
              <label htmlFor="noASN" className="form-checkbox-label">I do not have an Alberta Student Number (ASN) yet</label>
            </div>
          )}
          {!noASN && (
            <div className="form-group">
              <input
                type="text"
                id="albertaStudentNumber"
                name="albertaStudentNumber"
                value={formData.albertaStudentNumber}
                onChange={handleASNChange}
                className={`form-input ${errors.albertaStudentNumber ? 'is-invalid' : ''}`}
                placeholder=""
                required={formData.studentType !== 'International Student' && formData.province === 'Alberta'}
              />
              <label htmlFor="albertaStudentNumber" className="form-label">
                Alberta Student Number
              </label>
              {errors.albertaStudentNumber && <div className="error-message">{errors.albertaStudentNumber}</div>}
            </div>
          )}
        </div>
      )}
    </section>
  );
});

export default StudentTypeSelection;