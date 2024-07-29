import React, { useState, useRef } from "react";
import PersonalInformation from "./PersonalInformation";
import StudentTypeSelection from "./StudentTypeSelection";
import CourseSelection from "./CourseSelection";
import SurveyComponent from "./SurveyComponent";
import GrantEligibleStudentInfo from "./GrantEligibleStudentInfo";
import AdultStudentInfo from "./AdultStudentInfo";
import InternationalStudentInfo from "./InternationalStudentInfo";
import InternationalStudentDocuments from "./InternationalStudentDocuments"; // Import the new component
import ConfirmationPage from "./ConfirmationPage";
import { courseSharepointIDs } from "./variables";
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
    courseSharepointID: null,
    diplomaDate: "",
    startDate: "",
    completionDate: "",
    currentSchool: "",
    homeEducationOrg: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    albertaRegion: "",
    communityType: "",
    indigenousIdentity: "",
    onlineExperience: "",
    hearAboutUs: "",
    country: "",
    understandingEnglishProficiency: "",
    speakingEnglishProficiency: "",
    readingEnglishProficiency: "",
    studyGoals: "",
    suggestedGroups: "",
    contactNames: "",
    passport: null,
    additionalID: null,
    residencyProof: null,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const studentTypeSelectionRef = useRef();
  const personalInformationRef = useRef();
  const courseSelectionRef = useRef();
  const surveyComponentRef = useRef();
  const internationalStudentDocumentsRef = useRef(); // Create a ref for the new component

  const capitalizeWords = (str) => {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const newData = { ...prevData, [name]: value };
      if (name === "firstName" || name === "lastName" || name === "parentName") {
        newData[name] = capitalizeWords(value);
      }
      if (name === 'course') {
        newData.courseSharepointID = courseSharepointIDs[value] || null;
      }
      return newData;
    });
  };

  const handlePaymentSuccess = (paymentDetails) => {
    const combinedData = {
      ...formData,
      orderId: paymentDetails.id,
      payerId: paymentDetails.payer.payer_id,
      payerEmail: paymentDetails.payer.email_address,
      transactionStatus: paymentDetails.status,
      transactionTime: paymentDetails.update_time,
      amount: paymentDetails.amount,
    };
  
    submitFormData(combinedData);
  };

  const submitFormData = (data) => {
    const courseSharepointID = courseSharepointIDs[data.course] || null;
    const dataWithSharepointID = {
      ...data,
      courseSharepointID
    };

    console.log("Form Data Submitted:", dataWithSharepointID);

    fetch('https://prod2-23.canadacentral.logic.azure.com:443/workflows/ba5dd61b9e79412c9a2be210a6f3d666/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Cf7iWwnDsUGOQI9ugqYqmAJWLWPaVsKkerXWxes8zv8', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataWithSharepointID),
    })
    .then(response => {
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);
      
      if (response.status === 202) {
        return { status: 'success', message: 'Your registration has been accepted and is being processed.' };
      }
      
      return response.text().then(text => {
        try {
          return text ? JSON.parse(text) : {}
        } catch (e) {
          console.log("Error parsing JSON:", e);
          return text;
        }
      });
    })
    .then(result => {
      console.log('Success:', result);
      setIsSubmitted(true);
    })
    .catch(error => {
      console.error('Error:', error);
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        alert('Network error. Please check your internet connection and try again.');
      } else {
        alert(`There was an error submitting your registration: ${error.message}. Please try again later.`);
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep()) {
      if (!['Non-Primary', 'Home Education', 'Summer School', 'Adult Student', 'International Student'].includes(formData.studentType)) {
        submitFormData(formData);
      } else {
        console.log("For students requiring payment, form is submitted after successful payment.");
      }
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return personalInformationRef.current.validateForm();
      case 2:
        return studentTypeSelectionRef.current.validateForm();
      case 3:
        if (formData.studentType === 'International Student') {
          return internationalStudentDocumentsRef.current.validateForm();
        }
        return courseSelectionRef.current.validateForm();
      case 4:
        return surveyComponentRef.current.validateForm();
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
      return `${currentYear.toString().slice(-2)}/${nextYear.toString().slice(-2)}`;
    }
    return `${(currentYear - 1).toString().slice(-2)}/${currentYear.toString().slice(-2)}`;
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
    const cutoffDate = new Date(parseInt('20' + enrollmentStartYear), 8, 1); // September 1st of the enrollment year
    
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
        if (formData.studentType === 'International Student') {
          return (
            <InternationalStudentDocuments
              ref={internationalStudentDocumentsRef}
              formData={formData}
              handleChange={handleChange}
            />
          );
        }
        return (
          <CourseSelection 
            ref={courseSelectionRef}
            formData={formData} 
            handleChange={handleChange}
            calculateAge={calculateAge}
          />
        );
      case 4:
        return <SurveyComponent ref={surveyComponentRef} formData={formData} handleChange={handleChange} />;
      case 5:
        if (['Non-Primary', 'Home Education', 'Summer School'].includes(formData.studentType)) {
          return <GrantEligibleStudentInfo formData={formData} onPaymentSuccess={handlePaymentSuccess} />;
        } else if (formData.studentType === 'Adult Student') {
          return <AdultStudentInfo formData={formData} onPaymentSuccess={handlePaymentSuccess} />;
        } else if (formData.studentType === 'International Student') {
          return <InternationalStudentInfo formData={formData} onPaymentSuccess={handlePaymentSuccess} />;
        }
        return null;
      default:
        return null;
    }
  };

  const isLastStep = () => {
    if (['Non-Primary', 'Home Education', 'Summer School', 'Adult Student', 'International Student'].includes(formData.studentType)) {
      return currentStep === 5;
    }
    return currentStep === 4;
  };

  if (isSubmitted) {
    return <ConfirmationPage />;
  }

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
              {!isLastStep() && (
                <button type="button" onClick={nextStep} className="form-button primary">
                  Next
                </button>
              )}
              {isLastStep() && !['Non-Primary', 'Home Education', 'Summer School', 'Adult Student', 'International Student'].includes(formData.studentType) && (
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
