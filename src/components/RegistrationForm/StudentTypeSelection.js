import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';

const StudentTypeSelection = forwardRef(({ formData, handleChange, calculateAge, shouldShowNextSchoolYear, getDefaultBirthday, isOver20ForSchoolYear }, ref) => {
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [justDetermined, setJustDetermined] = useState(false);
  const [ageInfo, setAgeInfo] = useState('');
  const [errors, setErrors] = useState({});
  const [noASN, setNoASN] = useState(false); // New state for the checkbox

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
      text: 'Are you an Alberta citizen or permanent resident?',
      options: ['Yes', 'No'],
      next: (answer) => answer === 'Yes' ? 1 : 'International Student'
    },
    {
      id: 'enrolledInSchool',
      text: 'Are you enrolled in another junior high or high school in Alberta?',
      options: ['Yes', 'No'],
      next: (answer) => answer === 'Yes' ? 2 : 3
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
      next: (answer) => answer === 'Yes' ? 4 : 'Adult Student'
    },
    {
      id: 'summerIntentHomeEd',
      text: 'Do you intend to complete the course between July and August?',
      options: ['Yes', 'No'],
      next: (answer) => answer === 'Yes' ? 'Summer School' : 'Home Education'
    }
  ];

  const studentTypeInfo = {
    'Non-Primary': "Non-Primary Students are school-aged students that have a primary registration at another high school in Alberta. You may take up to 10 credits per school year for free.",
    'Home Education': "Home Education Students are school-aged students whose education is parent-directed and overseen by a school board as part of a Home Education Program. You may take up to 10 credits per school year for free.",
    'Summer School': "Summer School Students are School-aged Alberta students intending to complete their course in July or August. Courses are free for students under 20 before September of the current school year.",
    'Adult Student': "Adult Students include Canadian citizens and permanent residents who do not qualify for other categories. This includes students under 20 for whom our school does not receive grant funding. Fees are $100 per credit.",
    'International Student': "International Students include students who ordinarily reside outside of Alberta. Fees are $100 per credit (special introductory rate)."
  };


  const getCurrentSchoolYear = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const nextYear = currentYear + 1;
    
    if (today.getMonth() >= 8) { // 8 represents September (0-indexed)
      return `${currentYear.toString().slice(-2)}/${nextYear.toString().slice(-2)}`;
    }
    return `${(currentYear - 1).toString().slice(-2)}/${currentYear.toString().slice(-2)}`;
  };

  const getNextSchoolYear = () => {
    const [startYear] = getCurrentSchoolYear().split('/');
    const nextStartYear = parseInt(startYear) + 1;
    return `${nextStartYear}/${(nextStartYear + 1).toString().slice(-2)}`;
  };

  useEffect(() => {
    if (!formData.birthday) {
      handleChange({
        target: {
          name: 'birthday',
          value: getDefaultBirthday()
        }
      });
    }
  }, []);

  useEffect(() => {
    updateAgeInfo();
  }, [formData.birthday, formData.enrollmentYear]);

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

    if (formData.studentType && formData.studentType !== 'International Student') {
      if (!formData.albertaStudentNumber && !noASN) {
        newErrors.albertaStudentNumber = "Alberta Student Number is required";
      } else if (formData.albertaStudentNumber.replace(/\D/g, "").length !== 9) {
        newErrors.albertaStudentNumber = "Alberta Student Number must be 9 digits";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useImperativeHandle(ref, () => ({
    validateForm
  }));

  return (
    <section className="form-section">
      <h2 className="section-title">Student Information</h2>
      
      <div className="form-group">
        <input
          type="date"
          id="birthday"
          name="birthday"
          value={formData.birthday}
          onChange={handleChange}
          required
          className={`form-input ${errors.birthday ? 'is-invalid' : ''}`}
        />
        <label htmlFor="birthday" className="form-label">Birthday (YYYY-MM-DD)</label>
        {errors.birthday && <div className="error-message">{errors.birthday}</div>}
      </div>

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
          <option value={getCurrentSchoolYear()}>{`Current School Year (${getCurrentSchoolYear()})`}</option>
          {shouldShowNextSchoolYear() && (
            <option value={getNextSchoolYear()}>{`Next School Year (${getNextSchoolYear()})`}</option>
          )}
        </select>
        <small className="form-help-text">
          The school year starts on September 1st. Please select the school year in which you plan to complete your course.
        </small>
        {errors.enrollmentYear && <div className="error-message">{errors.enrollmentYear}</div>}
      </div>

      {ageInfo && <p className="age-info">{ageInfo}</p>}

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
                onChange={(e) => {
                  handleChange(e);
                  setJustDetermined(false);
                  if (e.target.value !== 'International Student') {
                    setNoASN(false);
                  }
                }}
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

      {formData.studentType && (
        <div className="asn-section">
          <h3>Alberta Student Number (ASN)</h3>
          {renderASNInstructions()}
          {formData.studentType === 'International Student' && (
            <div className="form-group asn-checkbox">
              <input
                type="checkbox"
                id="noASN"
                name="noASN"
                checked={noASN}
                onChange={() => setNoASN(!noASN)}
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
                required={formData.studentType !== 'International Student' || !noASN}
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
