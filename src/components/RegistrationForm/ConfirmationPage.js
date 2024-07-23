import React from 'react';

const ConfirmationPage = () => {
  return (
    <div className="confirmation-container">
      <h1>Registration Submitted Successfully</h1>
      <p>Thank you for registering with RTD Academy. Your registration has been accepted and is being processed.</p>
      <h2>What to Expect Next:</h2>
      <ul>
        <li>You will receive a confirmation email shortly.</li>
        <li>Within 2 business days, you will receive an additional email containing:
          <ul>
            <li>Your login information</li>
            <li>Detailed next steps to begin your course</li>
          </ul>
        </li>
      </ul>
      <p>If you don't receive these emails, please check your spam folder. If you still can't find them, please contact us a info@rtdacademy.com.</p>
      <p>We're excited to have you join us at RTD Academy!</p>
    </div>
  );
};

export default ConfirmationPage;