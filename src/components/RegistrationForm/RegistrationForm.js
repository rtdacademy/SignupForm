import React, { useState } from "react";
import PersonalInformation from "./PersonalInformation";
import StudentTypeSelection from "./StudentTypeSelection";
import "../../styles/styles.css";
import "../../styles/formComponents.css";

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    studentEmail: "",
    phoneNumber: "",
    birthday: "",
    albertaStudentNumber: "",
    enrollmentYear: "",
    studentType: "",
    // Add other fields as needed
  });

  const [currentStep, setCurrentStep] = useState(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
    // Here you would typically send the data to your backend
  };

  const nextStep = () => setCurrentStep(prevStep => prevStep + 1);
  const prevStep = () => setCurrentStep(prevStep => prevStep - 1);

  const getCurrentSchoolYear = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const cutoffDate = new Date(currentYear, 8, 1); // September 1st
    
    if (currentDate < cutoffDate) {
      return `${currentYear - 1}/${currentYear.toString().slice(-2)}`;
    } else {
      return `${currentYear}/${(currentYear + 1).toString().slice(-2)}`;
    }
  };

  const getNextSchoolYear = () => {
    const [startYear] = getCurrentSchoolYear().split('/');
    const nextStartYear = parseInt(startYear) + 1;
    return `${nextStartYear}/${(nextStartYear + 1).toString().slice(-2)}`;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInformation formData={formData} handleChange={handleChange} />;
      case 2:
        return (
          <>
            <div className="form-section">
              <h2 className="section-title">Enrollment Year</h2>
              <div className="form-group">
                <select
                  id="enrollmentYear"
                  name="enrollmentYear"
                  value={formData.enrollmentYear}
                  onChange={handleChange}
                  required
                  className="form-select"
                >
                  <option value="">Select enrollment year</option>
                  <option value={getCurrentSchoolYear()}>{`Current School Year (${getCurrentSchoolYear()})`}</option>
                  <option value={getNextSchoolYear()}>{`Next School Year (${getNextSchoolYear()})`}</option>
                </select>
                <label htmlFor="enrollmentYear" className="form-label">Enrollment Year</label>
              </div>
            </div>
            <StudentTypeSelection 
              formData={formData} 
              handleChange={handleChange}
              getCurrentSchoolYear={getCurrentSchoolYear}
              getNextSchoolYear={getNextSchoolYear}
            />
          </>
        );
      // Add more cases for additional steps
      default:
        return null;
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <img
          src="https://cdn.prod.website-files.com/62f2cd1feafac51b7859878b/63000729c32fa7acc3f6ad95_iSpring%20Logo-p-500.png"
          alt="RTD Academy Logo"
          className="form-logo"
        />
        <h1 className="form-title">Register with RTD Academy</h1>
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
            {currentStep < 2 ? (
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
  );
};

export default RegistrationForm;