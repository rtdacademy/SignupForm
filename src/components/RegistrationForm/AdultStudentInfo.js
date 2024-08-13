import React, { useState, useEffect } from 'react';
import { pricing, courseCredits, subscriptionPlans } from './variables';
import PayPalPaymentButton from './PayPalPaymentButton';

const AdultStudentInfo = ({ formData, onPaymentSuccess, calculateRefundDates }) => {
  const [paymentOption, setPaymentOption] = useState('ADULT_FULL_PAYMENT');
  const [availablePaymentOptions, setAvailablePaymentOptions] = useState([]);
  const [refundDates, setRefundDates] = useState({ fullRefundDate: null, partialRefundDate: null });

  useEffect(() => {
    updateAvailablePaymentOptions();
  }, []);

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
      paymentType: paymentOption === 'ADULT_FULL_PAYMENT' ? 'one-time' : 'subscription',
      planId: paymentOption !== 'ADULT_FULL_PAYMENT' ? paymentOption : '',
    });
  };

  const isCodingOption = formData.course === 'Coding';
  const studentType = formData.studentType === 'International' ? 'International' : 'Adult';

  const getCourseFee = () => {
    if (isCodingOption) {
      return studentType === 'International' ? pricing.codingInternationalStudentFlatRate : pricing.codingAdultStudentFlatRate;
    } else {
      const credits = courseCredits[formData.course];
      const perCreditPrice = studentType === 'International' ? pricing.internationalStudentPerCredit : pricing.adultStudentPerCredit;
      return credits * perCreditPrice;
    }
  };

  const courseFee = getCourseFee();
  const paymentPlanFee = pricing.paymentPlanFee;
  const paypalFee = pricing.paypalProcessingFee;

  const getRefundAmount = () => {
    if (isCodingOption) {
      return studentType === 'International' ? pricing.codingInternationalStudentPartialRefund : pricing.codingAdultStudentPartialRefund;
    } else {
      return pricing[`${studentType.toLowerCase()}StudentPartialRefund_${formData.course}`];
    }
  };

  const refundAmount = getRefundAmount();

  const plans = [
    {
      planId: 'ADULT_FULL_PAYMENT',
      name: 'Full Payment',
      description: `One-time payment of $${courseFee.toFixed(2)}`,
      initialPayment: courseFee,
      remainingPayments: 0,
      studentType: "Adult"
    },
    ...Object.keys(subscriptionPlans)
      .filter(planKey => subscriptionPlans[planKey].studentType === studentType)
      .map(planKey => ({
        ...subscriptionPlans[planKey],
        planId: subscriptionPlans[planKey].planId,
        name: subscriptionPlans[planKey].description,
        initialPayment: parseFloat(subscriptionPlans[planKey].setupFee.replace(" CAD", "")),
        installmentAmount: parseFloat(subscriptionPlans[planKey].price.replace(" CAD", "")),
        studentType: studentType
      }))
  ];

  const updateAvailablePaymentOptions = () => {
    const availableOptions = plans.map(plan => plan.planId);
    setAvailablePaymentOptions(availableOptions);

    if (!availableOptions.includes(paymentOption)) {
      setPaymentOption('ADULT_FULL_PAYMENT');
    }
  };

  const handlePaymentOptionChange = (option) => {
    setPaymentOption(option);
  };

  const selectedPlan = plans.find(plan => plan.planId === paymentOption);

  const getTotalAmount = () => {
    if (paymentOption === 'ADULT_FULL_PAYMENT') {
      return courseFee;
    } else {
      return courseFee + paymentPlanFee;
    }
  };

  return (
    <section className="form-section adult-student-info">
      <h2 className="section-title">Information for {studentType} Students</h2>
      
      <div className="info-content">
        <div className="info-card course-pricing">
          <h3>Course Pricing</h3>
          <p>Your selected course: <strong>{formData.course}</strong></p>
          <div className="pricing-details">
            {isCodingOption ? (
              <p className="pricing-item">Flat rate: <strong>${getCourseFee()}</strong></p>
            ) : (
              <>
                <p className="pricing-item">Price per credit: <strong>${studentType === 'International' ? pricing.internationalStudentPerCredit : pricing.adultStudentPerCredit}</strong></p>
                <p className="pricing-item">Credits: <strong>{courseCredits[formData.course]}</strong></p>
                <p className="pricing-item">Base fee: <strong>${courseFee.toFixed(2)}</strong></p>
              </>
            )}
            <p className="pricing-item">Payment plan fee: <strong>${paymentPlanFee.toFixed(2)}</strong> (if applicable)</p>
          </div>
        </div>

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
                  {plan.planId !== 'ADULT_FULL_PAYMENT' && (
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
          <p>
            To secure your spot in the course, the initial payment is required. Once your payment is processed, you will be enrolled and given access to the course materials. Please note that it may take up to 2 business days before you are enrolled in the course and receive your login information.
          </p>
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
              <p>Available until: <br/> <strong>{formatDate(refundDates.partialRefundDate)}</strong></p>
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
              studentType: studentType,
              initialPayment: selectedPlan.initialPayment,
              installmentAmount: selectedPlan.installmentAmount
            } : null}
            paymentType={paymentOption === 'ADULT_FULL_PAYMENT' ? 'capture' : 'subscription'}
            onSuccess={handlePaymentSuccess}
          />
        </div>
      </div>
    </section>
  );
};

export default AdultStudentInfo;