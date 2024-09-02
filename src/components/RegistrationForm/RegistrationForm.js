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
import { courseSharepointIDs, pricing, courseCredits, refundPeriods } from "../../config/variables";
import "../../styles/styles.css";

const RegistrationForm = ({ userEmail }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    studentEmail: userEmail || "",
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
    
    paymentOption: "",
    paymentAmount: "",
    paymentPlanFee: "",
    paymentType: "",
    subscriptionID: ""
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

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
  
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
      console.log("One month from now:", oneMonthFromNow);
  
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
        newData.diplomaMonth = '';
        newData.completionDate = '';
      }
      if (name === 'diplomaMonth' && (newData.course === 'Math 30-1' || newData.course === 'Math 30-2')) {
        const selectedDiplomaDate = diplomaDates.find(
          date => date.month === value && date.course === `Mathematics ${newData.course.split(' ')[1]}`
        );
        if (selectedDiplomaDate) {
          const dateObject = new Date(selectedDiplomaDate.date);
          newData.completionDate = dateObject.toISOString().split('T')[0];
        }
      }
      return newData;
    });
  };

  const calculateRefundDates = (startDate) => {
    if (!startDate) return { fullRefundDate: null, partialRefundDate: null };
    
    const start = new Date(startDate);
    const fullRefundDate = new Date(start.getTime() + refundPeriods.fullRefundDays * 24 * 60 * 60 * 1000);
    const partialRefundDate = new Date(start.getTime() + refundPeriods.partialRefundDays * 24 * 60 * 60 * 1000);
    
    return {
      fullRefundDate: fullRefundDate.toISOString().split('T')[0],
      partialRefundDate: partialRefundDate.toISOString().split('T')[0]
    };
  };

  const handlePaymentSuccess = (paymentDetails) => {
    console.log("Payment Details: ", paymentDetails);
    
    const combinedData = {
      ...formData,
      ...paymentDetails,
      orderId: paymentDetails.orderId || paymentDetails.subscriptionID,
      payerId: paymentDetails.payerId,
      payerEmail: paymentDetails.payerEmail,
      transactionStatus: paymentDetails.transactionStatus,
      transactionTime: paymentDetails.transactionTime,
      amount: paymentDetails.amount,
      paymentType: paymentDetails.paymentType,
      subscriptionID: paymentDetails.subscriptionID || '',
      planId: paymentDetails.planId || '',
      paymentAmount: paymentDetails.paymentAmount ? paymentDetails.paymentAmount.toString() : '',
      paymentPlanFee: paymentDetails.paymentPlanFee ? paymentDetails.paymentPlanFee.toString() : '',
      courseFee: paymentDetails.courseFee ? paymentDetails.courseFee.toString() : '',
      pricePerCredit: paymentDetails.pricePerCredit ? paymentDetails.pricePerCredit.toString() : '',
      credits: paymentDetails.credits ? paymentDetails.credits.toString() : '',
      fullRefundDate: paymentDetails.fullRefundDate || '',
      partialRefundDate: paymentDetails.partialRefundDate || '',
      refundAmount: paymentDetails.refundAmount ? paymentDetails.refundAmount.toString() : '',
      isCodingCourse: paymentDetails.isCodingCourse ? 'true' : 'false'
    };
  
    delete combinedData.paymentOption;
    
    console.log("Combined Data: ", combinedData);
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
      return date.toISOString().split('T')[0];
    };
  
    try {
      const jsonData = { ...data };
  
      jsonData.birthday = formatDate(jsonData.birthday);
      jsonData.startDate = formatDate(jsonData.startDate);
      jsonData.completionDate = formatDate(jsonData.completionDate);
      jsonData.additionalNotes = data.additionalNotes || '';
  
      if (jsonData.courseSharepointID !== null && jsonData.courseSharepointID !== undefined) {
        jsonData.courseSharepointID = jsonData.courseSharepointID.toString();
      }
  
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep(prevStep => prevStep - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCurrentSchoolYear = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const nextYear = currentYear + 1;
    const septemberFirst = new Date(currentYear, 8, 1);
  
    if (today >= septemberFirst) {
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
    return Math.abs(ageDate.getUTCFullYear() - 1970);};

    const shouldShowNextSchoolYear = () => {
      const today = new Date();
      return today.getMonth() >= 0 && today.getMonth() < 8;
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
      const cutoffDate = new Date(parseInt('20' + enrollmentStartYear), 8, 1);
      
      const ageDifference = cutoffDate.getFullYear() - birthDate.getFullYear();
      const monthDifference = cutoffDate.getMonth() - birthDate.getMonth();
      const dayDifference = cutoffDate.getDate() - birthDate.getDate();
  
      return ageDifference > 20 || (ageDifference === 20 && (monthDifference > 0 || (monthDifference === 0 && dayDifference >= 0)));
    };
  
    const renderStep = () => {
      switch (currentStep) {
        case 1:
          return <PersonalInformation ref={personalInformationRef} formData={formData} handleChange={handleChange} userEmail={userEmail} />;
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
            return <AdultStudentInfo 
              formData={formData} 
              onPaymentSuccess={handlePaymentSuccess} 
              calculateRefundDates={calculateRefundDates}
            />;
          }
          return null;
        case 6:
          if (formData.studentType === 'International Student') {
            return <InternationalStudentInfo 
              formData={formData} 
              onPaymentSuccess={handlePaymentSuccess} 
              calculateRefundDates={calculateRefundDates}
            />;
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
      <div className="registration-form-wrapper">
        <div className="registration-form-container">
          <h2 className="form-title">Register for a New Course</h2>
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
                {isLastStep() && (
                  <button type="submit" className="form-button primary">
                    Submit Registration
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };
  
  export default RegistrationForm;