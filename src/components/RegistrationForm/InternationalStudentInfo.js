import React, { useState, useEffect } from 'react';
import { pricing, courseCredits, subscriptionPlans } from "../../config/variables";
import { diplomaInfo } from "../../config/siteMessages";
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
    
    const updatedFormData = {
      ...formData,
      paymentType: paymentOption === 'INTERNATIONAL_FULL_PAYMENT' ? 'one-time' : 'subscription',
      planId: paymentOption !== 'INTERNATIONAL_FULL_PAYMENT' ? paymentOption : '',
      courseFee: courseFee,
      pricePerCredit: pricing.internationalStudentPerCredit,
      credits: courseCreditsAmount,
      paymentAmount: getTotalAmount(),
      paymentPlanFee: paymentOption === 'INTERNATIONAL_FULL_PAYMENT' ? 0 : paymentPlanFee,
      fullRefundDate: refundDates.fullRefundDate,
      partialRefundDate: refundDates.partialRefundDate,
      refundAmount: refundAmount
    };

    onPaymentSuccess({
      ...paymentDetails,
      ...updatedFormData
    });
  };

  const toggleDiplomaInfo = () => {
    setShowDiplomaInfo(!showDiplomaInfo);
  };

  const courseCreditsAmount = courseCredits[formData.course] || 5; // Default to 5 if not found

  const getCourseFee = () => {
    return courseCreditsAmount * pricing.internationalStudentPerCredit;
  };

  const courseFee = getCourseFee();
  const paymentPlanFee = pricing.paymentPlanFee;
  const paypalFee = pricing.paypalProcessingFee;

  const getRefundAmount = () => {
    const refundKey = `${formData.studentType.toLowerCase().replace(' ', '')}StudentPartialRefund_${formData.course}`;
    return pricing[refundKey] || 0; // Return 0 if the refund amount is not defined
  };

  const refundAmount = getRefundAmount();

  const plans = [
    {
      planId: 'INTERNATIONAL_FULL_PAYMENT',
      name: 'Full Payment',
      description: `One-time payment of $${courseFee.toFixed(2)}`,
      initialPayment: courseFee,
      remainingPayments: 0,
      studentType: "International Student",
      credits: courseCreditsAmount
    },
    ...Object.keys(subscriptionPlans)
      .filter(planKey => 
        subscriptionPlans[planKey].studentType === 'International Student' &&
        subscriptionPlans[planKey].credits === courseCreditsAmount
      )
      .map(planKey => ({
        ...subscriptionPlans[planKey],
        planId: subscriptionPlans[planKey].planId,
        name: subscriptionPlans[planKey].name, 
        description: subscriptionPlans[planKey].description, 
        initialPayment: parseFloat(subscriptionPlans[planKey].setupFee.replace(" CAD", "")),
        installmentAmount: parseFloat(subscriptionPlans[planKey].price.replace(" CAD", "")),
        studentType: "International Student"
      }))
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
    <section className="form-section international-student-info">
      <h2 className="section-title">Information for International Students</h2>
      
      <div className="info-content">
        <div className="info-card course-pricing">
          <h3>Course Pricing</h3>
          <p>Your selected course: <strong>{formData.course}</strong></p>
          <div className="pricing-details">
            <p className="pricing-item">Price per credit: <strong>${pricing.internationalStudentPerCredit}</strong></p>
            <p className="pricing-item">Credits: <strong>{courseCreditsAmount}</strong></p>
            <p className="pricing-item">Base fee: <strong>${courseFee.toFixed(2)}</strong></p>
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
              <div className="diploma-details" dangerouslySetInnerHTML={{ __html: diplomaInfo.content }} />
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
                  <h4>{plan.name}</h4>
                  <p>{plan.description}</p>
                  {!plan.name.includes('Full Payment') && (
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
            <li>This student number allows you to access your MyPass account and view your official transcript.</li>
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
  {refundAmount > 0 ? (
    <p>Refund amount: <strong>${refundAmount.toFixed(2)}</strong> ({Math.round(pricing.partialRefundPercentage * 100)}% of tuition)</p>
  ) : (
    <p>No partial refund available for this course.</p>
  )}
</div>
          </div>
          <p className="refund-note">To request a refund, please contact your instructor. These dates are based on your selected start date: {formatDate(formData.startDate)}</p>
        </div>

        <div className="info-card payment-section">
          <h3>Complete Your Registration</h3>
          <p>Click the PayPal button below to pay for your course and complete your registration:</p>
          <PayPalPaymentButton
            amount={paymentOption === 'INTERNATIONAL_FULL_PAYMENT' ? getTotalAmount().toFixed(2) : '0.00'}
            plan={selectedPlan ? {
              ...selectedPlan,
              courseName: formData.course,
              studentType: "International Student",
              initialPayment: selectedPlan.initialPayment || getTotalAmount(),
              installmentAmount: selectedPlan.installmentAmount || getTotalAmount()
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