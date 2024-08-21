import React, { useEffect, useState } from 'react';
import PayPalPaymentButton from './PayPalPaymentButton';
import { pricing } from "../../config/variables";

const GrantEligibleStudentInfo = ({ formData, onPaymentSuccess }) => {
  const [isCodingCourse, setIsCodingCourse] = useState(false);

  useEffect(() => {
    setIsCodingCourse(formData.course === 'Coding');
  }, [formData.course]);

  const handlePaymentSuccess = (order) => {
    console.log("Payment successful:", order);
    onPaymentSuccess({
      ...order,
      paymentType: 'deposit'  // set the paymentType
    });
  };

  const getStudentTypeMessage = () => {
    switch (formData.studentType) {
      case 'Non-Primary':
      case 'Home Education':
        return 'As a Non-Primary or Home Education student, you are eligible for 2 free courses per year (September to June). Additionally, you can take 1 free summer school course within the same school year.';
      case 'Summer School':
        return 'As a Summer School student, you are eligible for 1 free summer school course within the school year. If you are also a Non-Primary or Home Education student, you may be eligible for 2 additional free courses during the regular school year.';
      default:
        return 'You are eligible for grant-supported courses.';
    }
  };

  const getCodingCourseMessage = () => `
    As a coding student, you are allowed to work through the credits and continue the course throughout the school year.
    You will need to re-register next September if you wish to continue with your course. You will receive a refund on your deposit
    after completing the first module of the course.
  `;

  return (
    <section className="form-section grant-student-info">
      <h2 className="section-title">Information for Grant-Eligible Students</h2>
      
      <div className="info-content">
        <div className="info-card student-type-info">
          <h3>Your Eligibility</h3>
          <p>{getStudentTypeMessage()}</p>
          {isCodingCourse && <p>{getCodingCourseMessage()}</p>}
          <p>
            Our school receives a grant from Alberta Education for these student types, which allows us to offer these courses at no cost to you. If you intend to take an additional course, you will need to complete this form again.
          </p>
        </div>

        <div className="info-card course-participation">
          <h3>Course Participation and Deposit</h3>
          <p>
            To ensure active participation in the course, we require a ${pricing.depositAmount} deposit to start the course. 
            {isCodingCourse 
              ? ` This deposit is fully refundable upon completion of the first module of the course. Here's how it works:`
              : ` This deposit is fully refundable upon course completion within 5 months. Here's how it works:`
            }
          </p>
          <ul>
            <li>You pay a ${pricing.depositAmount} deposit to begin the course.</li>
            <li>We monitor your activity and you will receive a weekly email updating you on your status in the course.</li>
            <li>If you are marked as behind or not active for 4 consecutive weeks, you will be unenrolled from the course.</li>
            <li>You will not be unenrolled simply for falling behind in the course. We only take this step if you fall behind <strong>and</strong> do not respond to teacher emails or make plans to get back on track.</li>
            <li>To continue, you will need to pay a new ${pricing.depositAmount} deposit and be re-enrolled in the course.</li>           
            <li>Communication is key - stay in touch with your teachers if you're having difficulties.</li>
            {isCodingCourse ? (
              <li>Upon successful completion of the first module, your ${pricing.depositAmount} deposit will be refunded to you.</li>
            ) : (
              <li>If you take longer than 5 months to complete the course, your deposit will be forfeited. This policy encourages you to stay on track and aligns with PayPal's time limit on refunds.</li> 
            )}
          </ul>
        </div>

        <div className="info-card payment-section">
          <h3>Complete Your Registration</h3>
          <p>
            To complete your registration and secure your spot in the course, please submit the ${pricing.depositAmount} deposit using the PayPal button below.
            Once your payment is processed, we will finalize your enrollment and provide you with further instructions to get started.
          </p>
          <PayPalPaymentButton 
            amount={pricing.depositAmount.toFixed(2)} 
            onSuccess={handlePaymentSuccess} 
          />
        </div>
      </div>
    </section>
  );
};

export default GrantEligibleStudentInfo;