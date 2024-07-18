import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const PersonalInformation = ({ formData, handleChange }) => {
  const [confirmEmail, setConfirmEmail] = useState("");
  const [emailsMatch, setEmailsMatch] = useState(true);
  const [phoneInputFocused, setPhoneInputFocused] = useState(false);

  const validateEmail = (email) => {
    const re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const handleConfirmEmailChange = (e) => {
    setConfirmEmail(e.target.value);
    setEmailsMatch(e.target.value === formData.studentEmail);
  };

  const handleASNChange = (e) => {
    const { value } = e.target;
    let formattedValue = value.replace(/\D/g, "").slice(0, 9);
    if (formattedValue.length > 4) {
      formattedValue = `${formattedValue.slice(0, 4)}-${formattedValue.slice(
        4
      )}`;
    }
    if (formattedValue.length > 9) {
      formattedValue = `${formattedValue.slice(0, 9)}-${formattedValue.slice(
        9
      )}`;
    }
    handleChange({
      target: {
        name: "albertaStudentNumber",
        value: formattedValue,
      },
    });
  };

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
          className="form-input"
          placeholder=""
        />
        <label htmlFor="firstName" className="form-label">
          First Name
        </label>
      </div>

      <div className="form-group">
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
          className="form-input"
          placeholder=""
        />
        <label htmlFor="lastName" className="form-label">
          Last Name
        </label>
      </div>

      <div className="form-group">
        <input
          type="email"
          id="studentEmail"
          name="studentEmail"
          value={formData.studentEmail}
          onChange={handleChange}
          required
          className={`form-input ${
            !validateEmail(formData.studentEmail) && formData.studentEmail
              ? "is-invalid"
              : ""
          }`}
          placeholder=""
        />
        <label htmlFor="studentEmail" className="form-label">
          Student Email
        </label>
        {!validateEmail(formData.studentEmail) && formData.studentEmail && (
          <span className="input-status invalid">
            Please enter a valid email address
          </span>
        )}
      </div>

      <div className="form-group">
        <input
          type="email"
          id="confirmEmail"
          name="confirmEmail"
          value={confirmEmail}
          onChange={handleConfirmEmailChange}
          required
          className={`form-input ${
            !emailsMatch && confirmEmail ? "is-invalid" : ""
          }`}
          placeholder=""
        />
        <label htmlFor="confirmEmail" className="form-label">
          Confirm Student Email
        </label>
        {!emailsMatch && confirmEmail && (
          <span className="input-status invalid">Emails do not match</span>
        )}
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
            inputClass="form-input"
            containerClass="phone-input-container"
            buttonClass="phone-input-button"
            onFocus={() => setPhoneInputFocused(true)}
            onBlur={() => setPhoneInputFocused(false)}
          />
          <label className="form-label phone-label">Phone Number</label>
        </div>
        <small>
          Your instructor may send out class announcements through text message
        </small>
      </div>

      <div className="form-group">
        <input
          type="date"
          id="birthday"
          name="birthday"
          value={formData.birthday}
          onChange={handleChange}
          required
          className="form-input"
        />
        <label htmlFor="birthday" className="form-label">
          Birthday
        </label>
      </div>

      <div className="form-group">
        <input
          type="text"
          id="albertaStudentNumber"
          name="albertaStudentNumber"
          value={formData.albertaStudentNumber}
          onChange={handleASNChange}
          required
          className="form-input"
          placeholder="####-####-#"
        />
        <label htmlFor="albertaStudentNumber" className="form-label">
          Alberta Student Number
        </label>
      </div>
    </section>
  );
};

export default PersonalInformation;
