import React, { useState, useEffect } from 'react';

const StudentTypeSelection = ({ formData, handleChange, getCurrentSchoolYear, getNextSchoolYear }) => {
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [justDetermined, setJustDetermined] = useState(false);

  const studentTypes = [
    { value: 'nonPrimary', label: 'Non-Primary Student' },
    { value: 'homeEducation', label: 'Home Education Student' },
    { value: 'summerSchool', label: 'Summer School Student' },
    { value: 'adultStudent', label: 'Adult Student' },
    { value: 'internationalStudent', label: 'International Student' }
  ];

  const questions = [
    {
      id: 'enrolledInSchool',
      text: 'Are you enrolled in another junior high or high school in Alberta?',
      options: ['Yes', 'No'],
      next: (answer) => answer === 'Yes' ? 'nonPrimary' : 1
    },
    {
      id: 'homeEducation',
      text: 'Is your education parent-directed and part of a Home Education Program?',
      options: ['Yes', 'No'],
      next: (answer) => answer === 'Yes' ? 'homeEducation' : 2
    },
    {
      id: 'summerIntent',
      text: 'Do you intend to complete the course between July and August?',
      options: ['Yes', 'No'],
      next: (answer) => answer === 'Yes' ? 'summerSchool' : 3
    },
    {
      id: 'residency',
      text: 'Are you a Canadian citizen or permanent resident?',
      options: ['Yes', 'No'],
      next: (answer) => answer === 'Yes' ? 'adultStudent' : 'internationalStudent'
    }
  ];

  const studentTypeInfo = {
    nonPrimary: "Non-Primary Students are school-aged students that have a primary registration at another high school in Alberta. You may take up to 10 credits per school year for free.",
    homeEducation: "Home Education Students are school-aged students whose education is parent-directed and overseen by a school board as part of a Home Education Program. You may take up to 10 credits per school year for free.",
    summerSchool: "Summer School Students are School-aged Alberta students intending to complete their course in July or August. Courses are free for students under 20 before September of the current school year.",
    adultStudent: "Adult Students include Canadian citizens and permanent residents who do not qualify for other categories. Fees are $100 per credit.",
    internationalStudent: "International Students include students who ordinarily reside outside of Alberta. Fees are $100 per credit (special introductory rate)."
  };

  const isUnder20ForSchoolYear = () => {
    if (!formData.birthday || !formData.enrollmentYear) return false;

    const birthDate = new Date(formData.birthday);
    const [enrollmentStartYear] = formData.enrollmentYear.split('/');
    const cutoffDate = new Date(enrollmentStartYear, 8, 1); // September 1st of the enrollment year
    
    const ageDifference = cutoffDate.getFullYear() - birthDate.getFullYear();
    const monthDifference = cutoffDate.getMonth() - birthDate.getMonth();
    const dayDifference = cutoffDate.getDate() - birthDate.getDate();

    return ageDifference < 20 || (ageDifference === 20 && (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)));
  };

  useEffect(() => {
    if (formData.birthday && formData.enrollmentYear) {
      if (!isUnder20ForSchoolYear()) {
        handleChange({
          target: {
            name: 'studentType',
            value: 'adultStudent'
          }
        });
        setJustDetermined(true);
      }
    }
  }, [formData.birthday, formData.enrollmentYear]);

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
    } else {
      setCurrentQuestion(nextStep);
    }
  };

  const startQuestionnaire = () => {
    setShowQuestionnaire(true);
    setCurrentQuestion(0);
    setJustDetermined(false);
  };

  return (
    <section className="form-section">
      <h2 className="section-title">What type of student are you?</h2>
      <div className="form-group">
        <select
          id="studentType"
          name="studentType"
          value={formData.studentType}
          onChange={(e) => {
            handleChange(e);
            setJustDetermined(false);
          }}
          required
          className="form-select"
        >
          <option value="">Select your student type</option>
          {studentTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
        <label htmlFor="studentType" className="form-label">Student Type</label>
      </div>
      
      {!showQuestionnaire && !formData.studentType && (
        <button type="button" onClick={startQuestionnaire} className="form-button secondary">
          Help me determine my student type
        </button>
      )}

      {showQuestionnaire && (
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
          </div>
        </div>
      )}

      {formData.studentType && (
        <div className="student-type-info">
          {justDetermined && (
            <p className="determination-message">
              Based on your {formData.studentType === 'adultStudent' ? 'birthday and enrollment year' : 'answers'}, 
              you are a <strong>{studentTypes.find(type => type.value === formData.studentType)?.label}</strong>.
            </p>
          )}
          <h3>Student Type: {studentTypes.find(type => type.value === formData.studentType)?.label}</h3>
          <p>{studentTypeInfo[formData.studentType]}</p>
        </div>
      )}
    </section>
  );
};

export default StudentTypeSelection;