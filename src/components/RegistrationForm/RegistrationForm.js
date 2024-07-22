import React, { useState, useRef } from "react";
import PersonalInformation from "./PersonalInformation";
import StudentTypeSelection from "./StudentTypeSelection";
import CourseSelection from "./CourseSelection";
import GrantEligibleStudentInfo from "./GrantEligibleStudentInfo";
import AdultStudentInfo from "./AdultStudentInfo";
import InternationalStudentInfo from "./InternationalStudentInfo";
import "../../styles/styles.css";

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    studentEmail: "",
    phoneNumber: "",
    albertaStudentNumber: "",
    birthday: "",
    enrollmentYear: "",
    studentType: "",
    course: "",
    diplomaDate: "",
    startDate: "",
    completionDate: "",
    currentSchool: "",
    homeEducationOrg: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const studentTypeSelectionRef = useRef();
  const personalInformationRef = useRef();
  const courseSelectionRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep()) {
      console.log("Form Data Submitted:", formData);
      // Here you would typically send the data to your backend
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return personalInformationRef.current.validateForm();
      case 2:
        return studentTypeSelectionRef.current.validateForm();
      case 3:
        return courseSelectionRef.current.validateForm();
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prevStep => prevStep + 1);
    }
  };

  const prevStep = () => setCurrentStep(prevStep => prevStep - 1);

  const getCurrentSchoolYear = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const nextYear = currentYear + 1;
    
    if (today.getMonth() >= 8) { // 8 represents September (0-indexed)
      return `${currentYear}/${nextYear.toString().slice(-2)}`;
    }
    return `${currentYear - 1}/${currentYear.toString().slice(-2)}`;
  };

  const getNextSchoolYear = () => {
    const [startYear] = getCurrentSchoolYear().split('/');
    const nextStartYear = parseInt(startYear) + 1;
    return `${nextStartYear}/${(nextStartYear + 1).toString().slice(-2)}`;
  };

  const calculateAge = (birthday, referenceDate) => {
    const birthDate = new Date(birthday);
    const ageDifMs = referenceDate - birthDate;
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const shouldShowNextSchoolYear = () => {
    const today = new Date();
    return today.getMonth() >= 0 && today.getMonth() < 8; // Show next school year option from January to August
  };

  const getDefaultBirthday = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 16);
    return date.toISOString().split('T')[0];
  };

  const isOver20ForSchoolYear = () => {
    if (!formData.birthday || !formData.enrollmentYear) return false;

    const birthDate = new Date(formData.birthday);
    const [enrollmentStartYear] = formData.enrollmentYear.split('/');
    const cutoffDate = new Date(enrollmentStartYear, 8, 1); // September 1st of the enrollment year
    
    const ageDifference = cutoffDate.getFullYear() - birthDate.getFullYear();
    const monthDifference = cutoffDate.getMonth() - birthDate.getMonth();
    const dayDifference = cutoffDate.getDate() - birthDate.getDate();

    return ageDifference > 20 || (ageDifference === 20 && (monthDifference > 0 || (monthDifference === 0 && dayDifference >= 0)));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInformation ref={personalInformationRef} formData={formData} handleChange={handleChange} />;
      case 2:
        return (
          <StudentTypeSelection 
            ref={studentTypeSelectionRef}
            formData={formData} 
            handleChange={handleChange}
            getCurrentSchoolYear={getCurrentSchoolYear}
            getNextSchoolYear={getNextSchoolYear}
            calculateAge={calculateAge}
            shouldShowNextSchoolYear={shouldShowNextSchoolYear}
            getDefaultBirthday={getDefaultBirthday}
            isOver20ForSchoolYear={isOver20ForSchoolYear}
          />
        );
      case 3:
        return (
          <CourseSelection 
            ref={courseSelectionRef}
            formData={formData} 
            handleChange={handleChange}
            calculateAge={calculateAge}
          />
        );
      case 4:
        if (['nonPrimary', 'homeEducation', 'summerSchool'].includes(formData.studentType)) {
          return <GrantEligibleStudentInfo formData={formData} handleSubmit={handleSubmit} />;
        } else if (formData.studentType === 'adultStudent') {
          return <AdultStudentInfo formData={formData} handleSubmit={handleSubmit} />;
        } else if (formData.studentType === 'internationalStudent') {
          return <InternationalStudentInfo formData={formData} handleSubmit={handleSubmit} />;
        }
        return null;
      default:
        return null;
    }
  };

  const isLastStep = () => {
    if (['nonPrimary', 'homeEducation', 'summerSchool', 'adultStudent', 'internationalStudent'].includes(formData.studentType)) {
      return currentStep === 4;
    }
    return currentStep === 3;
  };

  return (
    <div className="page-container">
      <div className="logo-container">
        <img
          src="https://cdn.prod.website-files.com/62f2cd1feafac51b7859878b/63000729c32fa7acc3f6ad95_iSpring%20Logo-p-500.png"
          alt="RTD Academy Logo"
          className="form-logo"
        />
      </div>
      <div className="form-container">
        <div className="form-header">
          <h1 className="form-title">Course Registration</h1>
          <p className="form-subtitle">
            Start your next high school math course today. Math 10c to 31 | CTS
            Coding
          </p>
        </div>
  
        <div className="form-content">
          <form onSubmit={handleSubmit}>
            {renderStep()}
  
            <div className="form-navigation">
              {currentStep > 1 && (
                <button type="button" onClick={prevStep} className="form-button secondary">
                  Previous
                </button>
              )}
              {!isLastStep() ? (
                <button type="button" onClick={nextStep} className="form-button primary">
                  Next
                </button>
              ) : (
                <button type="submit" className="form-button primary">
                  Submit Registration
                </button>
              )}
            </div>
          </form>
        </div>
        <div className="form-footer">
          <p>RTD Academy © 2024</p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;