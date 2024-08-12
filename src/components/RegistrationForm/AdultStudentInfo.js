import React, { useState, useEffect } from 'react';
import { pricing, courseCredits, subscriptionPlans } from './variables';
import PayPalPaymentButton from './PayPalPaymentButton';

const AdultStudentInfo = ({ formData, onPaymentSuccess }) => {
  const [paymentOption, setPaymentOption] = useState('ADULT_FULL_PAYMENT');
  const [availablePaymentOptions, setAvailablePaymentOptions] = useState([]);

  useEffect(() => {
    updateAvailablePaymentOptions();
  }, []);

  const formatDate = (dateString) => {
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
  const refundAmount = Math.round((courseFee * 2 / 3) * 100) / 100; // 2/3 of tuition, rounded to nearest cent

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
    setPaymentDates([]);
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
    <section className="form-section">
      <h2 className="section-title">Information for {studentType} Students</h2>
      
      <div className="info-content">
        <h3>Course Pricing</h3>
        <p>
          As a {studentType} student, the cost for the course you selected ({formData.course}) is structured as follows:
        </p>
        <ul>
          {isCodingOption ? (
            <li>${getCourseFee()} flat rate for the coding option</li>
          ) : (
            <>
              <li>${studentType === 'International' ? pricing.internationalStudentPerCredit : pricing.adultStudentPerCredit} per credit</li>
              <li>The selected course is {courseCredits[formData.course]} credits, resulting in a base fee of ${courseFee.toFixed(2)}</li>
            </>
          )}
          <li>Payment plan fee (if applicable): ${paymentPlanFee.toFixed(2)}</li>
        </ul>

        <h3>Payment Options</h3>
        <p>We offer flexible payment options based on your course duration:</p>
        <div className="payment-options">
          {plans.map((plan) => (
            <div key={plan.planId}>
              <input
                type="radio"
                id={plan.planId}
                name="paymentOption"
                value={plan.planId}
                checked={paymentOption === plan.planId}
                onChange={() => handlePaymentOptionChange(plan.planId)}
              />
              <label htmlFor={plan.planId}>
                {plan.name}
                {plan.planId !== 'ADULT_FULL_PAYMENT' && ` (Includes $${paymentPlanFee.toFixed(2)} payment plan fee)`}
              </label>
            </div>
          ))}
        </div>

        <h3>Total Amount</h3>
        <p>Total amount to be paid: ${getTotalAmount().toFixed(2)}</p>

        <h3>Payment and Enrollment</h3>
        <p>
          To secure your spot in the course, the initial payment is required. Once your payment is processed, you will be enrolled and given access to the course materials. Please note that it may take up to 2 business days before you are enrolled in the course and receive your login information.
        </p>

        <h3>Refund Policy</h3>
        <p>
          We offer a flexible refund policy to ensure you're satisfied with your course:
        </p>
        <ul>
          <li><strong>Full Refund (less processing fee):</strong> Available within 1 week of your course start date.
            <ul>
              <li>If you request a refund within the first week, you will receive a full refund minus a ${paypalFee} processing fee to cover our PayPal charges.</li>
              <li>This allows you to explore the course and ensure it meets your needs.</li>
            </ul>
          </li>
          <li><strong>Partial Refund:</strong> If you request a refund after the first week but within 1 month of your scheduled start date, you will receive a refund of ${refundAmount.toFixed(2)} (2/3 of your tuition).</li>
          <li>To request a refund, you can simply let your instructor know.</li>
        </ul>

        <h3>Next Steps</h3>
        <p>
          To complete your registration and secure your spot in the course, please submit your payment using the PayPal button below. Once your payment is processed, we will finalize your enrollment and provide you with further instructions to get started.
        </p>

        <div className="payment-section">
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
            paymentDates={paymentDates}
            paymentType={paymentOption === 'ADULT_FULL_PAYMENT' ? 'capture' : 'subscription'}
            onSuccess={handlePaymentSuccess}
          />
        </div>
      </div>
    </section>
  );
};

export default AdultStudentInfo;