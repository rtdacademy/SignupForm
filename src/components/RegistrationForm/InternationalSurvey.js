import React, { forwardRef, useImperativeHandle, useState } from 'react';

const InternationalSurvey = forwardRef(({ formData, handleChange }, ref) => {
  const [errors, setErrors] = useState({});

  useImperativeHandle(ref, () => ({
    validateForm: () => {
      const newErrors = {};
      if (!formData.understandingEnglishProficiency) newErrors.understandingEnglishProficiency = "Please select your proficiency in understanding spoken English";
      if (!formData.speakingEnglishProficiency) newErrors.speakingEnglishProficiency = "Please select your proficiency in speaking English";
      if (!formData.readingEnglishProficiency) newErrors.readingEnglishProficiency = "Please select your proficiency in reading English";
      if (!formData.studyGoals) newErrors.studyGoals = "Please select your primary study goal";
      if (!formData.hearAboutUs) newErrors.hearAboutUs = "Please select how you heard about us";
      if (!formData.suggestedGroups) newErrors.suggestedGroups = "Please provide suggestions or enter 'None'";
      if (!formData.contactNames) newErrors.contactNames = "Please provide contacts or enter 'None'";

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }
  }));

  return (
    <div className="survey-section">
      <div className="form-group">
        <label htmlFor="understandingEnglishProficiency">How would you rate your proficiency in understanding spoken English?</label>
        <select
          id="understandingEnglishProficiency"
          name="understandingEnglishProficiency"
          value={formData.understandingEnglishProficiency || ''}
          onChange={handleChange}
          className={`form-select ${errors.understandingEnglishProficiency ? 'is-invalid' : ''}`}
        >
          <option value="">Select your proficiency</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
          <option value="Native">Native or bilingual</option>
        </select>
        {errors.understandingEnglishProficiency && <div className="invalid-feedback">{errors.understandingEnglishProficiency}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="speakingEnglishProficiency">How would you rate your proficiency in speaking English?</label>
        <select
          id="speakingEnglishProficiency"
          name="speakingEnglishProficiency"
          value={formData.speakingEnglishProficiency || ''}
          onChange={handleChange}
          className={`form-select ${errors.speakingEnglishProficiency ? 'is-invalid' : ''}`}
        >
          <option value="">Select your proficiency</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
          <option value="Native">Native or bilingual</option>
        </select>
        {errors.speakingEnglishProficiency && <div className="invalid-feedback">{errors.speakingEnglishProficiency}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="readingEnglishProficiency">How would you rate your proficiency in reading English?</label>
        <select
          id="readingEnglishProficiency"
          name="readingEnglishProficiency"
          value={formData.readingEnglishProficiency || ''}
          onChange={handleChange}
          className={`form-select ${errors.readingEnglishProficiency ? 'is-invalid' : ''}`}
        >
          <option value="">Select your proficiency</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
          <option value="Native">Native or bilingual</option>
        </select>
        {errors.readingEnglishProficiency && <div className="invalid-feedback">{errors.readingEnglishProficiency}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="studyGoals">What are your primary goals for studying with us?</label>
        <select
          id="studyGoals"
          name="studyGoals"
          value={formData.studyGoals || ''}
          onChange={handleChange}
          className={`form-select ${errors.studyGoals ? 'is-invalid' : ''}`}
        >
          <option value="">Select your primary goal</option>
          <option value="University preparation">Prepare for university in Alberta/Canada</option>
          <option value="High school completion">Complete high school education</option>
          <option value="Improve English and academic skills">Improve English and academic skills</option>
          <option value="Head start before moving">Get a head start before moving to Alberta/Canada</option>
          <option value="Canadian curriculum experience">Gain experience with the Canadian curriculum</option>
          <option value="Credit transfer">Earn credits for transfer to my home country</option>
          <option value="Personal interest">Personal interest or growth</option>
        </select>
        {errors.studyGoals && <div className="invalid-feedback">{errors.studyGoals}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="hearAboutUs">How did you hear about our school?</label>
        <select
          id="hearAboutUs"
          name="hearAboutUs"
          value={formData.hearAboutUs || ''}
          onChange={handleChange}
          className={`form-select ${errors.hearAboutUs ? 'is-invalid' : ''}`}
        >
          <option value="">Select an option</option>
          <option value="Web search">Internet search</option>
          <option value="Social media">Social media</option>
          <option value="Education agent">Education agent or consultant</option>
          <option value="Friend or family">Friend or family recommendation</option>
          <option value="School partnership">Partnership with my local school</option>
          <option value="Other">Other</option>
        </select>
        {errors.hearAboutUs && <div className="invalid-feedback">{errors.hearAboutUs}</div>}
      </div>

      <div className="form-group">
        <p>
          Our school is just starting to take on international students. We would love to hear your suggestions for social media groups, websites, or specific contacts (names or emails) we should reach out to in order to let them know we are an option.
        </p>
        <label htmlFor="suggestedGroups">Suggestions for social media groups or websites:</label>
        <textarea
          id="suggestedGroups"
          name="suggestedGroups"
          value={formData.suggestedGroups || ''}
          onChange={handleChange}
          className={`form-textarea ${errors.suggestedGroups ? 'is-invalid' : ''}`}
        />
        {errors.suggestedGroups && <div className="invalid-feedback">{errors.suggestedGroups}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="contactNames">Specific names or emails we should contact:</label>
        <textarea
          id="contactNames"
          name="contactNames"
          value={formData.contactNames || ''}
          onChange={handleChange}
          className={`form-textarea ${errors.contactNames ? 'is-invalid' : ''}`}
        />
        {errors.contactNames && <div className="invalid-feedback">{errors.contactNames}</div>}
      </div>
    </div>
  );
});

export default InternationalSurvey;
