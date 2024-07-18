// steps/AdditionalInformation.js
import React from "react";

const AdditionalInformation = ({ formData, handleChange }) => (
  <section className="form-section">
    <h2 className="section-title">Additional Information</h2>

    <div className="form-group">
      <select
        id="isAdult"
        name="isAdult"
        value={formData.isAdult}
        onChange={handleChange}
        required
        className="form-select"
      >
        <option value="">Select an option</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
      <label htmlFor="isAdult" className="form-label">
        Are you over 18 years old?
      </label>
      <small>We require parent information for students under 18</small>
    </div>

    {formData.isAdult === "no" && (
      <>
        <div className="form-group">
          <input
            type="text"
            id="parentName"
            name="parentName"
            value={formData.parentName}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="Parent Name"
          />
          <label htmlFor="parentName" className="form-label">
            Parent Name
          </label>
        </div>

        <div className="form-group">
          <input
            type="tel"
            id="parentPhone"
            name="parentPhone"
            value={formData.parentPhone}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="Parent/Guardian Phone #"
          />
          <label htmlFor="parentPhone" className="form-label">
            Parent/Guardian Phone #
          </label>
        </div>

        <div className="form-group">
          <input
            type="email"
            id="parentEmail"
            name="parentEmail"
            value={formData.parentEmail}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="Parent/Guardian Email"
          />
          <label htmlFor="parentEmail" className="form-label">
            Parent/Guardian Email
          </label>
        </div>
      </>
    )}

    <div className="form-group">
      <select
        id="region"
        name="region"
        value={formData.region}
        onChange={handleChange}
        required
        className="form-select"
      >
        <option value="">Select a region</option>
        <option value="Edmonton Region">Edmonton Region</option>
        <option value="Calgary Region">Calgary Region</option>
        <option value="Central Alberta">Central Alberta</option>
        <option value="Northern Alberta">Northern Alberta</option>
        <option value="Southern Alberta">Southern Alberta</option>
        <option value="Alberta's Rockies">Alberta's Rockies</option>
      </select>
      <label htmlFor="region" className="form-label">
        What Alberta region do you live in?
      </label>
    </div>

    <div className="form-group">
      <select
        id="communityType"
        name="communityType"
        value={formData.communityType}
        onChange={handleChange}
        required
        className="form-select"
      >
        <option value="">Select an option</option>
        <option value="Urban">Urban</option>
        <option value="Rural">Rural</option>
      </select>
      <label htmlFor="communityType" className="form-label">
        Do you consider yourself part of an urban or rural community?
      </label>
    </div>

    <div className="form-group">
      <select
        id="indigenousIdentity"
        name="indigenousIdentity"
        value={formData.indigenousIdentity}
        onChange={handleChange}
        required
        className="form-select"
      >
        <option value="">Select an option</option>
        <option value="Yes">Yes</option>
        <option value="No">No</option>
        <option value="Prefer not to say">Prefer not to say</option>
      </select>
      <label htmlFor="indigenousIdentity" className="form-label">
        Do you identify as First Nations, Metis or Inuit?
      </label>
    </div>

    <div className="form-group">
      <select
        id="onlineExperience"
        name="onlineExperience"
        value={formData.onlineExperience}
        onChange={handleChange}
        required
        className="form-select"
      >
        <option value="">Select an option</option>
        <option value="First online course">
          This is my first online course
        </option>
        <option value="Few online courses">
          I have taken a few online courses in the past
        </option>
        <option value="Many online courses">
          I have taken many courses online
        </option>
      </select>
      <label htmlFor="onlineExperience" className="form-label">
        Experience with online courses
      </label>
    </div>

    <div className="form-group">
      <select
        id="referralSource"
        name="referralSource"
        value={formData.referralSource}
        onChange={handleChange}
        required
        className="form-select"
      >
        <option value="">Select an option</option>
        <option value="Web search">Searching the web</option>
        <option value="Facebook">Facebook</option>
        <option value="Instagram">Instagram</option>
        <option value="Rock the Diploma">At a Rock the Diploma session</option>
        <option value="Teacher">From a teacher at my school</option>
        <option value="Friend">From a friend</option>
        <option value="Parents">My parents</option>
        <option value="Other">Other</option>
      </select>
      <label htmlFor="referralSource" className="form-label">
        How did you hear about our school?
      </label>
    </div>

    <div className="form-group">
      <textarea
        id="reason"
        name="reason"
        value={formData.reason}
        onChange={handleChange}
        required
        className="form-textarea"
        placeholder="Your reason for taking an online course with us"
      ></textarea>
      <label htmlFor="reason" className="form-label">
        Why did you decide to take an online course with us?
      </label>
    </div>
  </section>
);

export default AdditionalInformation;
