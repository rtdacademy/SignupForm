import React, { useState, forwardRef, useImperativeHandle } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const PersonalInformation = forwardRef(({ formData, handleChange }, ref) => {
  const [confirmEmail, setConfirmEmail] = useState("");
  const [emailsMatch, setEmailsMatch] = useState(true);
  const [phoneInputFocused, setPhoneInputFocused] = useState(false);
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const handleConfirmEmailChange = (e) => {
    setConfirmEmail(e.target.value);
    setEmailsMatch(e.target.value === formData.studentEmail);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.studentEmail) newErrors.studentEmail = "Email is required";
    else if (!validateEmail(formData.studentEmail)) newErrors.studentEmail = "Invalid email format";
    if (formData.studentEmail !== confirmEmail) newErrors.confirmEmail = "Emails do not match";
    if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useImperativeHandle(ref, () => ({
    validateForm
  }));

  return (
    <section className="form-section">
      <h2 className="section-title">Personal Information</h2>

      <div className="form-group">
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
          className={`form-input ${errors.firstName ? 'is-invalid' : ''}`}
          placeholder=""
        />
        <label htmlFor="firstName" className="form-label">
          First Name
        </label>
        {errors.firstName && <div className="error-message">{errors.firstName}</div>}
      </div>

      <div className="form-group">
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
          className={`form-input ${errors.lastName ? 'is-invalid' : ''}`}
          placeholder=""
        />
        <label htmlFor="lastName" className="form-label">
          Last Name
        </label>
        {errors.lastName && <div className="error-message">{errors.lastName}</div>}
      </div>

      <div className="form-group">
        <input
          type="email"
          id="studentEmail"
          name="studentEmail"
          value={formData.studentEmail}
          onChange={handleChange}
          required
          className={`form-input ${errors.studentEmail ? 'is-invalid' : ''}`}
          placeholder=""
        />
        <label htmlFor="studentEmail" className="form-label">
          Student Email
        </label>
        {errors.studentEmail && <div className="error-message">{errors.studentEmail}</div>}
      </div>

      <div className="form-group">
        <input
          type="email"
          id="confirmEmail"
          name="confirmEmail"
          value={confirmEmail}
          onChange={handleConfirmEmailChange}
          required
          className={`form-input ${errors.confirmEmail ? 'is-invalid' : ''}`}
          placeholder=""
        />
        <label htmlFor="confirmEmail" className="form-label">
          Confirm Student Email
        </label>
        {errors.confirmEmail && <div className="error-message">{errors.confirmEmail}</div>}
      </div>

      <div className="form-group">
        <div
          className={`phone-input-wrapper ${
            phoneInputFocused || formData.phoneNumber ? "focused" : ""
          }`}
        >
          <PhoneInput
            country={"ca"}
            value={formData.phoneNumber}
            onChange={(phone) =>
              handleChange({
                target: {
                  name: "phoneNumber",
                  value: phone,
                },
              })
            }
            inputClass={`form-input ${errors.phoneNumber ? 'is-invalid' : ''}`}
            containerClass="phone-input-container"
            buttonClass="phone-input-button"
            onFocus={() => setPhoneInputFocused(true)}
            onBlur={() => setPhoneInputFocused(false)}
          />
          <label className="form-label phone-label">Phone Number</label>
        </div>
        <small className="form-help-text">
          Your instructor may send out class announcements through text message
        </small>
        {errors.phoneNumber && <div className="error-message">{errors.phoneNumber}</div>}
      </div>
    </section>
  );
});

export default PersonalInformation;