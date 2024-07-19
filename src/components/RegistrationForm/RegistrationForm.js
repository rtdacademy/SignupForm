import React, { useState } from "react";
import PersonalInformation from "./PersonalInformation";
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
    // Add other fields as needed
  });

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
          **Start your next high school math course today. Math 10c to 31 | CTS
          Coding
        </p>
      </div>

      <div className="form-content">
        <form onSubmit={handleSubmit}>
          <PersonalInformation
            formData={formData}
            handleChange={handleChange}
          />

          {/* Other form sections will go here */}

          <div className="form-navigation">
            <button type="submit" className="form-button primary">
              Submit Registration
            </button>
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
