import React, { useState, useEffect } from 'react';
import { pricing, courseCredits, subscriptionPlans } from "./variables";
import PayPalPaymentButton from './PayPalPaymentButton';

const InternationalStudentInfo = ({ formData, onPaymentSuccess, calculateRefundDates }) => {
  const [paymentOption, setPaymentOption] = useState('INTERNATIONAL_FULL_PAYMENT');
  const [refundDates, setRefundDates] = useState({ fullRefundDate: null, partialRefundDate: null });
  const [showDiplomaInfo, setShowDiplomaInfo] = useState(false);

  useEffect(() => {
    if (formData.startDate) {
      setRefundDates(calculateRefundDates(formData.startDate));
    }
  }, [formData.startDate, calculateRefundDates]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handlePaymentSuccess = (paymentDetails) => {
    console.log("Payment successful:", paymentDetails);
    onPaymentSuccess({
      ...paymentDetails,
      paymentType: paymentOption === 'INTERNATIONAL_FULL_PAYMENT' ? 'one-time' : 'subscription',
      planId: paymentOption !== 'INTERNATIONAL_FULL_PAYMENT' ? paymentOption : '',
    });
  };

  const toggleDiplomaInfo = () => {
    setShowDiplomaInfo(!showDiplomaInfo);
  };

  const isCodingOption = formData.course === 'Coding';

  const getCourseFee = () => {
    if (isCodingOption) {
      return pricing.codingInternationalStudentFlatRate;
    } else {
      const credits = courseCredits[formData.course];
      return credits * pricing.internationalStudentPerCredit;
    }
  };

  const courseFee = getCourseFee();
  const paymentPlanFee = pricing.paymentPlanFee;
  const paypalFee = pricing.paypalProcessingFee;

  const getRefundAmount = () => {
    if (isCodingOption) {
      return pricing.codingInternationalStudentPartialRefund;
    } else {
      return pricing[`internationalStudentPartialRefund_${formData.course}`];
    }
  };

  const refundAmount = getRefundAmount();

  const plans = [
    {
      planId: 'INTERNATIONAL_FULL_PAYMENT',
      name: 'Full Payment',
      description: `One-time payment of $${courseFee.toFixed(2)}`,
      initialPayment: courseFee,
      remainingPayments: 0,
      studentType: "International"
    },
    ...Object.values(subscriptionPlans).filter(plan => plan.studentType === "International")
  ];

  const handlePaymentOptionChange = (option) => {
    setPaymentOption(option);
  };

  const selectedPlan = plans.find(plan => plan.planId === paymentOption);

  const getTotalAmount = () => {
    if (paymentOption === 'INTERNATIONAL_FULL_PAYMENT') {
      return courseFee;
    } else {
      return courseFee + paymentPlanFee;
    }
  };

  return (
    <section className="form-section adult-student-info">
      <h2 className="section-title">Information for International Students</h2>
      
      <div className="info-content">
        <div className="info-card course-pricing">
          <h3>Course Pricing</h3>
          <p>Your selected course: <strong>{formData.course}</strong></p>
          <div className="pricing-details">
            {isCodingOption ? (
              <p className="pricing-item">Flat rate: <strong>${courseFee}</strong></p>
            ) : (
              <>
                <p className="pricing-item">Price per credit: <strong>${pricing.internationalStudentPerCredit}</strong></p>
                <p className="pricing-item">Credits: <strong>{courseCredits[formData.course]}</strong></p>
                <p className="pricing-item">Base fee: <strong>${courseFee.toFixed(2)}</strong></p>
              </>
            )}
            <p className="pricing-item">Payment plan fee: <strong>${paymentPlanFee.toFixed(2)}</strong> (if applicable)</p>
          </div>
          <p className="note"><strong>Note:</strong> This is a promotional rate and is subject to change in the near future. We encourage you to take advantage of this offer while it lasts.</p>
        </div>

        {(formData.course === 'Math 30-1' || formData.course === 'Math 30-2') && (
          <div className="info-card diploma-info">
            <h3>Important Information for Diploma Courses</h3>
            <button 
              className="info-toggle-button" 
              onClick={toggleDiplomaInfo}
            >
              {showDiplomaInfo ? 'Hide Diploma Information' : 'Show Diploma Information'}
            </button>
            {showDiplomaInfo && (
              <div className="diploma-details">
                <h4>Alberta High School Diploma Requirements</h4>
                <p>To obtain an Alberta High School Diploma, students must complete specific courses and pass diploma exams, which are standardized tests for key subjects such as Math, English, Sciences, and Social Studies. These exams are mandatory and are typically written in person at designated locations within Alberta.</p>

                <h4>Your Pathway to a Diploma</h4>
                <ol>
                  <li>
                    <strong>Registration and Alberta Student Number (ASN):</strong>
                    <p>When you enroll in one of our courses, we will create an Alberta Student Number (ASN) for you. The ASN is essential for accessing your educational records and registering for diploma exams. You can manage this through your myPass account, which is the Alberta government's self-service website for students.</p>
                  </li>
                  <li>
                    <strong>Writing Diploma Exams:</strong>
                    <p>Once you arrive in Alberta, you'll be able to log in to your myPass account and register for the necessary diploma exams. These exams must be written in person at an authorized Alberta high school or another approved exam center.</p>
                  </li>
                  <li>
                    <strong>Special Considerations:</strong>
                    <p>Alberta Education offers accommodations for students with special needs, including extended time and alternate formats for exams. If you require any special arrangements, please reach out to us or the exam center early to ensure everything is in place.</p>
                  </li>
                </ol>

                <h4>Additional Resources</h4>
                <p>For more detailed information about earning an Alberta High School Diploma as an international student, including specific course requirements and exam schedules, please visit the <a href="https://www.alberta.ca/international-students-studying-alberta" target="_blank" rel="noopener noreferrer">Alberta Education website</a>.</p>
              </div>
            )}
          </div>
        )}

        <div className="info-card payment-options">
          <h3>Payment Options</h3>
          <div className="payment-options-grid">
            {plans.map((plan) => (
              <div
                key={plan.planId}
                className={`payment-option ${paymentOption === plan.planId ? 'selected' : ''}`}
                onClick={() => handlePaymentOptionChange(plan.planId)}
              >
                <input
                  type="radio"
                  id={plan.planId}
                  name="paymentOption"
                  value={plan.planId}
                  checked={paymentOption === plan.planId}
                  onChange={() => {}}
                />
                <label htmlFor={plan.planId}>
                  <h4>Payment Plan</h4>
                  <p>{plan.description}</p>
                  {plan.planId !== 'INTERNATIONAL_FULL_PAYMENT' && (
                    <p className="fee-note">Includes ${paymentPlanFee.toFixed(2)} payment plan fee</p>
                  )}
                </label>
              </div>
            ))}
          </div>
          <div className="total-amount">
            <h4>Total Amount: <span>${getTotalAmount().toFixed(2)}</span></h4>
          </div>
        </div>

        <div className="info-card enrollment-info">
          <h3>Payment and Enrollment</h3>
          <ul>
            <li>Full payment or initial payment (for payment plans) is required before you will be added to the course.</li>
            <li>Once payment is received, you will be enrolled and given access to the course materials.</li>
            <li>Please allow up to 2 business days for enrollment completion and login information.</li>
            <li>You will be added to the Alberta Education PASI system, and an Alberta Student Number will be generated for you.</li>
            <li>This student student number allows you to access your MyPass account and view your official transcript.</li>
            <li>The same transcript is accessible to Alberta Universities.</li>
          </ul>
        </div>

        <div className="info-card course-completion">
          <h3>Course Completion</h3>
          <p>You are free to complete our courses from your home country. Our online platform allows for flexible learning from anywhere in the world.</p>
        </div>

        <div className="info-card refund-policy">
          <h3>Refund Policy</h3>
          <div className="refund-details">
            <div className="refund-item">
              <h4>Full Refund</h4>
              <p>Available until: <br/><strong>{formatDate(refundDates.fullRefundDate)}</strong></p>
              <p>Full refund minus ${paypalFee} processing fee</p>
            </div>
            <div className="refund-item">
              <h4>Partial Refund</h4>
              <p>Available until: <br/><strong>{formatDate(refundDates.partialRefundDate)}</strong></p>
              <p>Refund amount: <strong>${refundAmount.toFixed(2)}</strong> ({Math.round(pricing.partialRefundPercentage * 100)}% of tuition)</p>
            </div>
          </div>
          <p className="refund-note">To request a refund, please contact your instructor. These dates are based on your selected start date: {formatDate(formData.startDate)}</p>
        </div>

        <div className="info-card payment-section">
          <h3>Complete Your Registration</h3>
          <p>Click the PayPal button below to pay for your course and complete your registration:</p>
          <PayPalPaymentButton
            amount={getTotalAmount().toFixed(2)}
            plan={selectedPlan ? {
              ...selectedPlan,
              courseName: formData.course,
              studentType: "International",
              initialPayment: selectedPlan.initialPayment,
              installmentAmount: selectedPlan.installmentAmount
            } : null}
            paymentType={paymentOption === 'INTERNATIONAL_FULL_PAYMENT' ? 'capture' : 'subscription'}
            onSuccess={handlePaymentSuccess}
          />
        </div>
      </div>
    </section>
  );
};

export default InternationalStudentInfo;