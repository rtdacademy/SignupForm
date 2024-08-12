import React from 'react';
import PayPalPaymentButton from './PayPalPaymentButton';
import { pricing } from "./variables";

const GrantEligibleStudentInfo = ({ formData, onPaymentSuccess }) => {
  const handlePaymentSuccess = (order) => {
    console.log("Payment successful:", order);
    onPaymentSuccess(order);
  };

  const getStudentTypeMessage = () => {
    if (formData.studentType === 'Non-Primary') {
      return 'As a Non-Primary student, you are eligible for 2 free courses per year (September to August). Additionally, you can take 1 free summer school course within the same school year.';
    } else if (formData.studentType === 'Home Education') {
      return 'As a Home Education student, you are eligible for 2 free courses per year (September to August). Additionally, you can take 1 free summer school course within the same school year.';
    } else if (formData.studentType === 'Summer School') {
      return 'As a Summer School student, you are eligible for 1 free summer school course within the school year (September to August). If you are also a Non-Primary or Home Education student, you may be eligible for 2 additional free courses during the regular school year.';
    } else {
      return 'You are eligible for grant-supported courses.';
    }
  };

  const getCodingCourseMessage = () => {
    return `
      As a coding student, you are allowed to work through the credits and continue the course throughout the school year.
      You will need to re-register next September if you wish to continue with your course. You will receive a refund on your deposit
      after completing the first module of the course.
    `;
  };

  const isCodingCourse = formData.course === 'Coding';

  return (
    <section className="form-section">
      <h2 className="section-title">Course Information for Grant-Eligible Students</h2>

      <div className="info-content">
        <p>{getStudentTypeMessage()}</p>
        {isCodingCourse && <p>{getCodingCourseMessage()}</p>}
        <p>
          Our school receives a grant from Alberta Education for these student types, which allows us to offer these courses at no cost to you. If you intend to take an additional course, you will need to complete this form again.
        </p>
        
        <h3>Course Participation and Deposit</h3>
        <p>
          To ensure active participation in the course, we require a ${pricing.depositAmount} deposit to start the course. This deposit is fully refundable
          upon course completion. Here's how it works:
        </p>
        <ul>
          <li>You pay a ${pricing.depositAmount} deposit to begin the course.</li>
          <li>We monitor your activity in the course on a weekly basis.</li>
          <li>You will receive a weekly email updating you on your status in the course.</li>
          <li>If you are marked as not active for 4 consecutive weeks, you may lose your deposit and be removed from the course.</li>
          <li>If you need to continue after being removed, you will need to provide an additional ${pricing.depositAmount} deposit and create a new schedule.</li>
        </ul>

        <h3>Important Notes</h3>
        <p>
          We want to clarify that:
        </p>
        <ul>
          <li>You will not lose your deposit simply for falling behind in the course.</li>
          <li>The deposit is only forfeited if you fall behind <strong>and</strong> do not respond to teacher emails or make plans to get back on track.</li>
          <li>Communication is key - stay in touch with your teachers if you're having difficulties.</li>
          {isCodingCourse ? (
            <li>Upon successful completion of the first module, your ${pricing.depositAmount} deposit will be refunded to you.</li>
          ) : (
            <li>Upon successful completion of the course, your ${pricing.depositAmount} deposit will be refunded to you.</li>
          )}
        </ul>

        <h3>Next Steps</h3>
        <p>
          To complete your registration and secure your spot in the course, please submit the ${pricing.depositAmount} deposit using the PayPal button below.
          Once your payment is processed, we will finalize your enrollment and provide you with further instructions to get started.
        </p>

        <div className="payment-section">
          <p>Click the button below to pay your ${pricing.depositAmount} deposit and complete your registration:</p>
          <PayPalPaymentButton amount={pricing.depositAmount.toFixed(2)} onSuccess={handlePaymentSuccess} />
        </div>
      </div>
    </section>
  );
};

export default GrantEligibleStudentInfo;
