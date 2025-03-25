import React, { forwardRef, useImperativeHandle, useState } from 'react';

const AlbertaSurvey = forwardRef(({ formData, handleChange }, ref) => {
  const [errors, setErrors] = useState({});

  useImperativeHandle(ref, () => ({
    validateForm: () => {
      const newErrors = {};
      if (formData.studentType !== 'International Student') {
        if (formData.studentType !== 'Adult Student' || formData.province === 'Alberta') {
          if (!formData.albertaRegion) newErrors.albertaRegion = "Please select a region";
        }
        if (!formData.communityType) newErrors.communityType = "Please select a community type";
        if (!formData.indigenousIdentity) newErrors.indigenousIdentity = "Please select an option";
        if (!formData.onlineExperience) newErrors.onlineExperience = "Please select your experience level";
        if (!formData.hearAboutUs) newErrors.hearAboutUs = "Please select how you heard about us";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }
  }));

  const showAlbertaRegionQuestion = formData.studentType !== 'International Student' && 
    (formData.studentType !== 'Adult Student' || formData.province === 'Alberta');

  return (
    <div className="survey-section">
      {showAlbertaRegionQuestion && (
        <div className="form-group">
          <label htmlFor="albertaRegion">What Alberta region do you live in?</label>
          <select
            id="albertaRegion"
            name="albertaRegion"
            value={formData.albertaRegion || ''}
            onChange={handleChange}
            className={`form-select ${errors.albertaRegion ? 'is-invalid' : ''}`}
          >
            <option value="">Select a region</option>
            <option value="Edmonton Region">Edmonton Region</option>
            <option value="Calgary Region">Calgary Region</option>
            <option value="Central Alberta">Central Alberta</option>
            <option value="Northern Alberta">Northern Alberta</option>
            <option value="Southern Alberta">Southern Alberta</option>
            <option value="Alberta's Rockies">Alberta's Rockies</option>
          </select>
          {errors.albertaRegion && <div className="invalid-feedback">{errors.albertaRegion}</div>}
        </div>
      )}

      {formData.studentType !== 'International Student' && (
        <>
          <div className="form-group">
            <label>Do you consider yourself part of an urban or rural community?</label>
            <div>
              <label>
                <input
                  type="radio"
                  name="communityType"
                  value="Urban"
                  checked={formData.communityType === "Urban"}
                  onChange={handleChange}
                /> Urban
              </label>
              <label>
                <input
                  type="radio"
                  name="communityType"
                  value="Rural"
                  checked={formData.communityType === "Rural"}
                  onChange={handleChange}
                /> Rural
              </label>
            </div>
            {errors.communityType && <div className="invalid-feedback">{errors.communityType}</div>}
          </div>

          <div className="form-group">
            <label>Do you identify as First Nations, Metis or Inuit?</label>
            <div>
              <label>
                <input
                  type="radio"
                  name="indigenousIdentity"
                  value="Yes"
                  checked={formData.indigenousIdentity === "Yes"}
                  onChange={handleChange}
                /> Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="indigenousIdentity"
                  value="No"
                  checked={formData.indigenousIdentity === "No"}
                  onChange={handleChange}
                /> No
              </label>
            </div>
            {errors.indigenousIdentity && <div className="invalid-feedback">{errors.indigenousIdentity}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="onlineExperience">Experience with online courses</label>
            <select
              id="onlineExperience"
              name="onlineExperience"
              value={formData.onlineExperience || ''}
              onChange={handleChange}
              className={`form-select ${errors.onlineExperience ? 'is-invalid' : ''}`}
            >
              <option value="">Select your experience</option>
              <option value="First online course">This is my first online course</option>
              <option value="Few online courses">I have taken a few online courses in the past</option>
              <option value="Many online courses">I have taken many courses online</option>
            </select>
            {errors.onlineExperience && <div className="invalid-feedback">{errors.onlineExperience}</div>}
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
              <option value="Web search">Searching the web</option>
              <option value="Facebook">Facebook</option>
              <option value="Instagram">Instagram</option>
              <option value="Rock the Diploma">At a Rock the Diploma session</option>
              <option value="Teacher">From a teacher at my school</option>
              <option value="Friend">From a friend</option>
              <option value="Parents">My parents</option>
              <option value="Other">Other</option>
            </select>
            {errors.hearAboutUs && <div className="invalid-feedback">{errors.hearAboutUs}</div>}
          </div>
        </>
      )}
    </div>
  );
});

export default AlbertaSurvey;