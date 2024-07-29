import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';

const CourseSelection = forwardRef(({ formData, handleChange, calculateAge }, ref) => {
  const [showDiplomaDate, setShowDiplomaDate] = useState(false);
  const [showParentInfo, setShowParentInfo] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setShowDiplomaDate(['Math 30-1', 'Math 30-2'].includes(formData.course));
    setShowParentInfo(calculateAge(formData.birthday, new Date()) < 18);
  }, [formData.course, formData.birthday, calculateAge]);

  const courseDescriptions = {
    'Coding': 'Learn programming fundamentals and web development.',
    'Math 15': 'A bridging course between Math 10C and Math 20-1.',
    'Math 31 (Calculus)': 'An introduction to calculus and analytic geometry.',
    'Math 30-1': 'Advanced topics for students planning to enter post-secondary programs requiring calculus.',
    'Math 30-2': 'Topics for students planning to enter post-secondary programs not requiring calculus.',
    'Math 30-3': 'Mathematics for trades and workplace applications.',
    'Math 20-1': 'Topics include sequences and series, trigonometry, quadratics, and rational expressions.',
    'Math 20-2': 'Topics include measurement, geometry, number and logic, and statistics.',
    'Math 20-3': 'Practical applications of measurement, geometry, and trigonometry.',
    'Math 20-4': 'Practical math skills for everyday life and the workplace.',
    'Math 10C': 'Combined course covering topics from both Math 10-1 and 10-2.',
    'Math 10-3': 'Practical applications of algebra, geometry, and measurement.',
    'Math 10-4': 'Basic math skills for everyday life and entry-level employment.'
  };

  const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.course) newErrors.course = "Course selection is required";
    if (showDiplomaDate && !formData.diplomaDate) newErrors.diplomaDate = "Diploma date is required for Math 30-1 and Math 30-2";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.completionDate) newErrors.completionDate = "Completion date is required";

    if (showParentInfo) {
      if (!formData.parentName) newErrors.parentName = "Parent name is required";
      if (!formData.parentPhone) newErrors.parentPhone = "Parent phone number is required";
      if (!formData.parentEmail) {
        newErrors.parentEmail = "Parent email is required";
      } else if (!validateEmail(formData.parentEmail)) {
        newErrors.parentEmail = "Please enter a valid email address";
      }
    } else if (formData.parentEmail && !validateEmail(formData.parentEmail)) {
      newErrors.parentEmail = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useImperativeHandle(ref, () => ({
    validateForm
  }));

  return (
    <section className="form-section">
      <h2 className="section-title">Course Selection</h2>

      {formData.studentType === 'nonPrimary' && (
        <div className="form-group">
          <input
            type="text"
            id="currentSchool"
            name="currentSchool"
            value={formData.currentSchool || ''}
            onChange={handleChange}
            required
            className={`form-input ${errors.currentSchool ? 'is-invalid' : ''}`}
            placeholder=""
          />
          <label htmlFor="currentSchool" className="form-label">
            School that you are currently enrolled with
          </label>
          {errors.currentSchool && <div className="error-message">{errors.currentSchool}</div>}
        </div>
      )}

      {formData.studentType === 'homeEducation' && (
        <div className="form-group">
          <input
            type="text"
            id="homeEducationOrg"
            name="homeEducationOrg"
            value={formData.homeEducationOrg || ''}
            onChange={handleChange}
            required
            className={`form-input ${errors.homeEducationOrg ? 'is-invalid' : ''}`}
            placeholder=""
          />
          <label htmlFor="homeEducationOrg" className="form-label">
            Home Education organization that you are currently enrolled with
          </label>
          {errors.homeEducationOrg && <div className="error-message">{errors.homeEducationOrg}</div>}
        </div>
      )}

      <div className="form-group">
        <select
          id="course"
          name="course"
          value={formData.course || ''}
          onChange={handleChange}
          required
          className={`form-select ${errors.course ? 'is-invalid' : ''}`}
        >
          <option value="">Select a course</option>
          {Object.keys(courseDescriptions).map((course) => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>
        <label htmlFor="course" className="form-label">Which course are you registering for?</label>
        {formData.course && (
          <p className="course-description">{courseDescriptions[formData.course]}</p>
        )}
        {errors.course && <div className="error-message">{errors.course}</div>}
      </div>

      {showDiplomaDate && (
        <div className="form-group">
          <select
            id="diplomaDate"
            name="diplomaDate"
            value={formData.diplomaDate || ''}
            onChange={handleChange}
            required
            className={`form-select ${errors.diplomaDate ? 'is-invalid' : ''}`}
          >
            <option value="">Select diploma writing month</option>
            {['November', 'January', 'April', 'June', 'August'].map((month) => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          <label htmlFor="diplomaDate" className="form-label">Diploma Date</label>
          <p className="form-help-text">
            Math 30-1 and Math 30-2 are diploma courses and you will need to write your exam in a test writing center (often at your school).
            We will contact you with more information when it is time to register for the diploma. If you have questions around diplomas,
            please email us at info@rtdacademy.com. For more information on Diploma exams, please
            <a href="https://www.alberta.ca/writing-diploma-exams" target="_blank" rel="noopener noreferrer"> click here</a>.
          </p>
          {errors.diplomaDate && <div className="error-message">{errors.diplomaDate}</div>}
        </div>
      )}

      <div className="form-group">
        <input
          type="date"
          id="startDate"
          name="startDate"
          value={formData.startDate || ''}
          onChange={handleChange}
          required
          className={`form-input ${errors.startDate ? 'is-invalid' : ''}`}
        />
        <label htmlFor="startDate" className="form-label">When do you intend to start the course?</label>
        <p className="form-help-text">A date estimate is fine. This will be used to create your initial schedule, but we can create a new schedule at your orientation meeting.</p>
        {errors.startDate && <div className="error-message">{errors.startDate}</div>}
      </div>

      <div className="form-group">
        <input
          type="date"
          id="completionDate"
          name="completionDate"
          value={formData.completionDate || ''}
          onChange={handleChange}
          required
          className={`form-input ${errors.completionDate ? 'is-invalid' : ''}`}
        />
        <label htmlFor="completionDate" className="form-label">When do you intend to complete the course by?</label>
        <p className="form-help-text">
          A date estimate is fine. Note: You can start and complete a course at any time of year, but if you are in a diploma course,
          there are set times that you are allowed to take your diploma. If you know your diploma date please add it here.
          If you do not have your diploma date, an estimate is fine.
        </p>
        {errors.completionDate && <div className="error-message">{errors.completionDate}</div>}
      </div>

      {showParentInfo ? (
        <div className="parent-info">
          <h3>Parent/Guardian Information</h3>
          <p className="form-help-text">As you are under 18, parent/guardian information is required.</p>

          <div className="form-group">
            <input
              type="text"
              id="parentName"
              name="parentName"
              value={formData.parentName || ''}
              onChange={handleChange}
              required
              className={`form-input ${errors.parentName ? 'is-invalid' : ''}`}
              placeholder=""
            />
            <label htmlFor="parentName" className="form-label">Parent Name</label>
            {errors.parentName && <div className="error-message">{errors.parentName}</div>}
          </div>

          <div className="form-group">
            <input
              type="tel"
              id="parentPhone"
              name="parentPhone"
              value={formData.parentPhone || ''}
              onChange={handleChange}
              required
              className={`form-input ${errors.parentPhone ? 'is-invalid' : ''}`}
              placeholder=""
            />
            <label htmlFor="parentPhone" className="form-label">Parent/Guardian Phone #</label>
            <p className="form-help-text">Will only be used for school related matters</p>
            {errors.parentPhone && <div className="error-message">{errors.parentPhone}</div>}
          </div>

          <div className="form-group">
            <input
              type="email"
              id="parentEmail"
              name="parentEmail"
              value={formData.parentEmail || ''}
              onChange={handleChange}
              required
              className={`form-input ${errors.parentEmail ? 'is-invalid' : ''}`}
              placeholder=""
            />
            <label htmlFor="parentEmail" className="form-label">Parent/Guardian Email</label>
            {errors.parentEmail && <div className="error-message">{errors.parentEmail}</div>}
          </div>
        </div>
      ) : (
        <div className="parent-info">
          <h3>Parent/Guardian Information (Optional)</h3>
          <p className="form-help-text">As you are 18 or older, parent/guardian information is optional.</p>

          <div className="form-group">
            <input
              type="text"
              id="parentName"
              name="parentName"
              value={formData.parentName || ''}
              onChange={handleChange}
              className="form-input"
              placeholder=""
            />
            <label htmlFor="parentName" className="form-label">Parent Name</label>
          </div>

          <div className="form-group">
            <input
              type="tel"
              id="parentPhone"
              name="parentPhone"
              value={formData.parentPhone || ''}
              onChange={handleChange}
              className="form-input"
              placeholder=""
            />
            <label htmlFor="parentPhone" className="form-label">Parent/Guardian Phone #</label>
            <p className="form-help-text">Will only be used for school related matters</p>
          </div>

          <div className="form-group">
            <input
              type="email"
              id="parentEmail"
              name="parentEmail"
              value={formData.parentEmail || ''}
              onChange={handleChange}
              className={`form-input ${errors.parentEmail ? 'is-invalid' : ''}`}
              placeholder=""
            />
            <label htmlFor="parentEmail" className="form-label">Parent/Guardian Email</label>
            {errors.parentEmail && <div className="error-message">{errors.parentEmail}</div>}
          </div>
        </div>
      )}
    </section>
  );
});

export default CourseSelection;