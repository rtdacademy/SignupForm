import React from 'react';
import PayPalButton from './PayPalButton';

const InternationalStudentInfo = ({ formData, onPaymentSuccess }) => {
  // Function to format the date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handlePaymentSuccess = (paymentDetails) => {
    console.log("Payment successful:", paymentDetails);
    onPaymentSuccess(paymentDetails);
  };

  return (
    <section className="form-section">
      <h2 className="section-title">Information for International Students</h2>
      
      <div className="info-content">
        <h3>Welcome to RTD Academy</h3>
        <p>
          We're excited to have you join our international student community. Here's some important information about your enrollment:
        </p>

        <h3>Course Pricing</h3>
        <p>
          As an International student, the cost for your courses is currently structured as follows:
        </p>
        <ul>
          <li>$100 per credit (promotional rate)</li>
          <li>Most core courses are 5 credits, resulting in a typical course fee of $500</li>
        </ul>
        <p className="note">
          <strong>Note:</strong> This is a promotional rate and is subject to change in the near future. We encourage you to take advantage of this offer while it lasts.
        </p>

        <h3>Payment and Enrollment</h3>
        <p>
          To secure your spot in the course:
        </p>
        <ul>
          <li>Full payment is required before you will be added to the course.</li>
          <li>Once payment is received, you will be enrolled and given access to the course materials.</li>
          <li>You will be added to the Alberta Education PASI system, and an Alberta Student Number will be generated for you.</li>
          <li>This student number allows you to access your MyPass account and view your official transcript.</li>
          <li>The same transcript is accessible to Alberta Universities.</li>
        </ul>

        <h3>Course Completion</h3>
        <p>
          You are free to complete our courses from your home country. Our online platform allows for flexible learning from anywhere in the world.
        </p>

        <h3>Refund Policy</h3>
        <p>
          We offer a flexible refund policy to ensure you're satisfied with your course:
        </p>
        <ul>
          <li><strong>Full Refund:</strong> Available within 1 week of your course start date ({formatDate(formData.startDate)}).
            <ul>
              <li>This allows you to explore the course and ensure it meets your needs.</li>
            </ul>
          </li>
          <li><strong>Partial Refund:</strong> $250 refund if you drop the course within 1 month of your scheduled start date.</li>
          <li>To request a refund, simply message your instructor</li>
        </ul>

        <h3>Next Steps</h3>
        <p>
          To complete your registration and secure your spot in the course, please submit your payment using the PayPal button below.
          Once your payment is processed, we will finalize your enrollment, add you to the PASI system, and provide you with further instructions to get started.
        </p>

        <div className="payment-section">
          <p>Click the PayPal button below to pay for your course and complete your registration:</p>
          <PayPalButton amount="500.00" onSuccess={handlePaymentSuccess} />
        </div>
      </div>
    </section>
  );
};

export default InternationalStudentInfo;