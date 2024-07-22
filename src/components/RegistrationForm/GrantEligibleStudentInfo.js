import React, { useState } from 'react';
import PayPalButton from './PayPalButton';

const GrantEligibleStudentInfo = ({ formData, handleSubmit }) => {
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  const handlePaymentSuccess = (order) => {
    setOrderDetails(order);
    setIsPaymentCompleted(true);
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      orderId: orderDetails.id,
      payerId: orderDetails.payer.payer_id,
      transactionStatus: orderDetails.status,
    };

    fetch('https://your-power-automate-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      handleSubmit();
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  return (
    <section className="form-section">
      <h2 className="section-title">Course Information for Grant-Eligible Students</h2>
      
      <div className="info-content">
        <p>
          As a {formData.studentType === 'nonPrimary' ? 'Non-Primary' : formData.studentType === 'homeEducation' ? 'Home Education' : 'Summer School'} student,
          you are eligible for 2 free courses per year. Our school receives a grant from Alberta Education for these student types,
          which allows us to offer these courses at no cost to you.
        </p>
        
        <h3>Course Participation and Deposit</h3>
        <p>
          To ensure active participation in the course, we require a $50 deposit to start the course. This deposit is fully refundable
          upon course completion. Here's how it works:
        </p>
        <ul>
          <li>You pay a $50 deposit to begin the course.</li>
          <li>We monitor your activity in the course on a weekly basis.</li>
          <li>You will receive a weekly email updating you on your status in the course.</li>
          <li>If you are marked as not active for 4 consecutive weeks, you may lose your deposit and be removed from the course.</li>
          <li>If you need to continue after being removed, you will need to provide an additional $50 deposit and create a new schedule.</li>
        </ul>

        <h3>Important Notes</h3>
        <p>
          We want to clarify that:
        </p>
        <ul>
          <li>You will not lose your deposit simply for falling behind in the course.</li>
          <li>The deposit is only forfeited if you fall behind <strong>and</strong> do not respond to teacher emails or make plans to get back on track.</li>
          <li>Communication is key - stay in touch with your teachers if you're having difficulties.</li>
          <li>Upon successful completion of the course, your $50 deposit will be refunded to you.</li>
        </ul>

        <h3>Next Steps</h3>
        <p>
          To complete your registration and secure your spot in the course, please submit the $50 deposit using the PayPal button below.
          Once your payment is processed, we will finalize your enrollment and provide you with further instructions to get started.
        </p>

        <div className="payment-section">
          <p>Click the button below to pay your $50 deposit and complete your registration:</p>
          {!isPaymentCompleted ? (
            <PayPalButton amount="50.00" onSuccess={handlePaymentSuccess} />
          ) : (
            <button onClick={handleFinalSubmit} className="form-button primary">
              Complete Registration
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default GrantEligibleStudentInfo;
