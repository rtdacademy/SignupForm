import React, { useState, useRef, useEffect } from "react";
import PersonalInformation from "./PersonalInformation";
import StudentTypeSelection from "./StudentTypeSelection";
import CourseSelection from "./CourseSelection";
import SurveyComponent from "./SurveyComponent";
import GrantEligibleStudentInfo from "./GrantEligibleStudentInfo";
import AdultStudentInfo from "./AdultStudentInfo";
import InternationalStudentInfo from "./InternationalStudentInfo";
import InternationalStudentDocuments from "./InternationalStudentDocuments";
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
    diplomaMonth: "",
    startDate: "",
    completionDate: "",
    additionalNotes: "",
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
    currentAge: null,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [courses, setCourses] = useState([]);
  const [diplomaDates, setDiplomaDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const studentTypeSelectionRef = useRef();
  const personalInformationRef = useRef();
  const courseSelectionRef = useRef();
  const surveyComponentRef = useRef();
  const internationalStudentDocumentsRef = useRef();

  useEffect(() => {
    fetchDiplomaDates();
  }, []);

  useEffect(() => {
    if (formData.birthday && formData.enrollmentYear) {
      const age = calculateAge(formData.birthday, new Date());
      setFormData((prevData) => ({ ...prevData, currentAge: age.toString() }));
    }
  }, [formData.birthday, formData.enrollmentYear]);

  const fetchDiplomaDates = async () => {
    try {
      const response = await fetch('https://prod2-06.canadacentral.logic.azure.com:443/workflows/2d90721bda75420e9134adfbfe71e696/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=n6XpSgP3DPD_LFLGsvb3q8k45EoKP2p0oiahYW3sKfk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      console.log("API response data:", data);
  
      // Get the date one month from now
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
      console.log("One month from now:", oneMonthFromNow);
  
      // Filter the diploma dates
      const filteredDiplomaDates = data.filter(item => {
        const itemDate = new Date(item.date);
        return (item.course === 'Mathematics 30-1' || item.course === 'Mathematics 30-2') && 
               itemDate > oneMonthFromNow;
      });
  
      console.log("Filtered diploma dates:", filteredDiplomaDates);
      setDiplomaDates(filteredDiplomaDates);
  
      setLoading(false);
    } catch (err) {
      setError('Failed to load diploma dates. Please try again later.');
      setLoading(false);
      console.error('Error:', err);
    }
  };

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
        // Reset diplomaMonth and completionDate when course changes
        newData.diplomaMonth = '';
        newData.completionDate = '';
      }
      if (name === 'diplomaMonth' && (newData.course === 'Math 30-1' || newData.course === 'Math 30-2')) {
        const selectedDiplomaDate = diplomaDates.find(
          date => date.month === value && date.course === `Mathematics ${newData.course.split(' ')[1]}`
        );
        if (selectedDiplomaDate) {
          // Parse the date string to a Date object before calling toISOString()
          const dateObject = new Date(selectedDiplomaDate.date);
          newData.completionDate = dateObject.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        }
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

  const submitFormData = async (data) => {
    const fileToBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
      });
    };
  
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    };
  
    try {
      const jsonData = { ...data };
  
      // Handle date fields
      jsonData.birthday = formatDate(jsonData.birthday);
      jsonData.startDate = formatDate(jsonData.startDate);
      jsonData.completionDate = formatDate(jsonData.completionDate);
      jsonData.additionalNotes = data.additionalNotes || '';
  
      // Ensure courseSharepointID is a string
      if (jsonData.courseSharepointID !== null && jsonData.courseSharepointID !== undefined) {
        jsonData.courseSharepointID = jsonData.courseSharepointID.toString();
      }
  
      // Convert file fields to Base64
      if (data.passport) {
        jsonData.passport = await fileToBase64(data.passport);
        jsonData.passportFileName = data.passport.name;
      } else {
        jsonData.passport = '';
        jsonData.passportFileName = '';
      }
      if (data.additionalID) {
        jsonData.additionalID = await fileToBase64(data.additionalID);
        jsonData.additionalIDFileName = data.additionalID.name;
      } else {
        jsonData.additionalID = '';
        jsonData.additionalIDFileName = '';
      }
      if (data.residencyProof) {
        jsonData.residencyProof = await fileToBase64(data.residencyProof);
        jsonData.residencyProofFileName = data.residencyProof.name;
      } else {
        jsonData.residencyProof = '';
        jsonData.residencyProofFileName = '';
      }
  
      // Replace null, undefined, or empty values with empty strings
      Object.keys(jsonData).forEach(key => {
        if (jsonData[key] === null || jsonData[key] === undefined || jsonData[key] === '') {
          jsonData[key] = '';
        }
      });
  
      const response = await fetch('https://prod2-23.canadacentral.logic.azure.com:443/workflows/ba5dd61b9e79412c9a2be210a6f3d666/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Cf7iWwnDsUGOQI9ugqYqmAJWLWPaVsKkerXWxes8zv8', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData),
      });
  
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);
  
      if (response.status === 202) {
        console.log('Success: Your registration has been accepted and is being processed.');
        setIsSubmitted(true);
      } else {
        const result = await response.text();
        console.log('Response:', result);
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error:', error);
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        alert('Network error. Please check your internet connection and try again.');
      } else {
        alert(`There was an error submitting your registration: ${error.message}. Please try again later.`);
      }
    }
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
        if (formData.studentType === 'International Student') {
          return courseSelectionRef.current.validateForm();
        }
        return surveyComponentRef.current.validateForm();
      case 5:
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
              courses={courses}
              diplomaDates={diplomaDates}
              loading={loading}
              error={error}
            />
          );
        case 4:
          if (formData.studentType === 'International Student') {
            return (
              <CourseSelection 
                ref={courseSelectionRef}
                formData={formData} 
                handleChange={handleChange}
                calculateAge={calculateAge}
                courses={courses}
                diplomaDates={diplomaDates}
                loading={loading}
                error={error}
              />
            );
          }
          return <SurveyComponent ref={surveyComponentRef} formData={formData} handleChange={handleChange} />;
        case 5:
          if (formData.studentType === 'International Student') {
            return <SurveyComponent ref={surveyComponentRef} formData={formData} handleChange={handleChange} />;
          }
          if (['Non-Primary', 'Home Education', 'Summer School'].includes(formData.studentType)) {
            return <GrantEligibleStudentInfo formData={formData} onPaymentSuccess={handlePaymentSuccess} />;
          } else if (formData.studentType === 'Adult Student') {
            return <AdultStudentInfo formData={formData} onPaymentSuccess={handlePaymentSuccess} />;
          }
          return null;
        case 6:
          if (formData.studentType === 'International Student') {
            return <InternationalStudentInfo formData={formData} onPaymentSuccess={handlePaymentSuccess} />;
          }
          return null;
        default:
          return null;
      }
    };
  
    const isLastStep = () => {
      if (formData.studentType === 'International Student') {
        return currentStep === 6;
      }
      if (['Non-Primary', 'Home Education', 'Summer School', 'Adult Student'].includes(formData.studentType)) {
        return currentStep === 5;
      }
      return currentStep === 4;
    };
  
    if (isSubmitted) {
      return <ConfirmationPage />;
    }
  
    if (loading) {
      return <div>Loading course information...</div>;
    }
  
    if (error) {
      return <div>Error: {error}</div>;
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