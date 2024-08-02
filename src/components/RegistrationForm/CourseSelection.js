import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { courseSharepointIDs } from "./variables";

const CourseSelection = forwardRef(({ formData, handleChange, calculateAge, diplomaDates, loading, error }, ref) => {
  const [showDiplomaDate, setShowDiplomaDate] = useState(false);
  const [showParentInfo, setShowParentInfo] = useState(false);
  const [errors, setErrors] = useState({});
  const [filteredDiplomaDates, setFilteredDiplomaDates] = useState([]);
  const [showAdditionalNotes, setShowAdditionalNotes] = useState(false);

  useEffect(() => {
    setShowDiplomaDate(['Math 30-1', 'Math 30-2'].includes(formData.course));
    setShowParentInfo(calculateAge(formData.birthday, new Date()) < 18);
  
    console.log("All diploma dates:", diplomaDates);
    console.log("Current selected course:", formData.course);
  
    // Get the date one month from now
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
    console.log("One month from now:", oneMonthFromNow);
  
    // Filter, sort, and limit the diploma dates
    const filtered = diplomaDates
      .filter(item => {
        const itemDate = new Date(item.date);
        const isCorrectCourse = item.course === `Mathematics ${formData.course.split(' ')[1]}`;
        const isAfterOneMonth = itemDate > oneMonthFromNow;
        console.log(`Date: ${itemDate}, Course: ${item.course}, Is Correct Course: ${isCorrectCourse}, Is After One Month: ${isAfterOneMonth}`);
        return isCorrectCourse && isAfterOneMonth;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 6);
  
    console.log("Filtered diploma dates:", filtered);
    setFilteredDiplomaDates(filtered);
  }, [formData.course, formData.birthday, calculateAge, diplomaDates]);


  const validateForm = () => {
    const newErrors = {};

    if (!formData.course) newErrors.course = "Course selection is required";
    if (showDiplomaDate && !formData.diplomaMonth) newErrors.diplomaMonth = "Diploma month is required for Math 30-1 and Math 30-2";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!showDiplomaDate && !formData.completionDate) newErrors.completionDate = "Completion date is required";

    if (showParentInfo) {
      if (!formData.parentName) newErrors.parentName = "Parent name is required";
      if (!formData.parentPhone) newErrors.parentPhone = "Parent phone number is required";
      if (!formData.parentEmail) newErrors.parentEmail = "Parent email is required";
    }

    if (formData.studentType === 'nonPrimary' && !formData.currentSchool) {
      newErrors.currentSchool = "Current school is required for Non-Primary students";
    }

    if (formData.studentType === 'homeEducation' && !formData.homeEducationOrg) {
      newErrors.homeEducationOrg = "Home Education organization is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useImperativeHandle(ref, () => ({
    validateForm
  }));

  const toggleAdditionalNotes = () => {
    setShowAdditionalNotes(!showAdditionalNotes);
  };


  const getMinStartDate = () => {
    const today = new Date();
    let minDate = new Date(today);
    let addedDays = 0;

    while (addedDays < 2) {
      minDate.setDate(minDate.getDate() + 1);
      // Check if it's a weekday (Monday = 1, Friday = 5)
      if (minDate.getDay() !== 0 && minDate.getDay() !== 6) {
        addedDays++;
      }
    }

    return minDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };


  return (
    <section className="form-section">
      <h2 className="section-title">Course Selection</h2>

      {loading ? (
        <p>Loading courses...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <>
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
              {Object.keys(courseSharepointIDs).map((course) => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
            <label htmlFor="course" className="form-label">Which course are you registering for?</label>
            {errors.course && <div className="error-message">{errors.course}</div>}
          </div>

          {showDiplomaDate && (
            <div className="form-group">
              <select
                id="diplomaMonth"
                name="diplomaMonth"
                value={formData.diplomaMonth || ''}
                onChange={handleChange}
                required
                className={`form-select ${errors.diplomaMonth ? 'is-invalid' : ''}`}
              >
                <option value="">Select diploma writing month</option>
                {filteredDiplomaDates.map((date) => (
                  <option key={`${date.course}-${date.month}-${date.date}`} value={date.month}>
                    {`${date.month} (${new Date(date.date).toLocaleDateString()}) - ${date.status}`}
                  </option>
                ))}
              </select>
              <label htmlFor="diplomaMonth" className="form-label">Diploma Month</label>
              <p className="form-help-text">
              <p>Math 30-1 and Math 30-2 are diploma courses that require you to write an exam at a designated test center, often at your school.</p>
  
  <p><strong>Important Notes:</strong></p>
  <ul>
    <li>If a diploma date is marked as "Draft", please be aware that Alberta Education may still adjust this date.</li>
    <li>You can register for your diploma exam now through your <a href="https://public.education.alberta.ca/PASI/myPass/welcome" target="_blank" rel="noopener noreferrer">MyPass account</a>.</li>
    <li>If you're unsure about the registration process, don't worry. We'll send out detailed instructions as the exam date approaches.</li>
  </ul>

  <p>For more information on Diploma exams, please visit the <a href="https://www.alberta.ca/writing-diploma-exams" target="_blank" rel="noopener noreferrer">Alberta Education Diploma Exams page</a>.</p>

  <p>If you have any questions about diplomas, please email us at <a href="mailto:info@rtdacademy.com">info@rtdacademy.com</a>.</p>.
              </p>
              {errors.diplomaMonth && <div className="error-message">{errors.diplomaMonth}</div>}
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
              min={getMinStartDate()}
              className={`form-input ${errors.startDate ? 'is-invalid' : ''}`}
            />
            <label htmlFor="startDate" className="form-label">When do you intend to start the course?</label>
            <p className="form-help-text">
              Please select a start date at least 2 business days from today. This allows our registrar time to add you to the course. 
              The date you choose will be used to create your initial schedule, but we can adjust adjust this later on as well if needed.
            </p>
            {errors.startDate && <div className="error-message">{errors.startDate}</div>}
          </div>

          {!showDiplomaDate && (
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
                A date estimate is fine. You can start and complete a course at any time of year.
              </p>
              {errors.completionDate && <div className="error-message">{errors.completionDate}</div>}
            </div>
          )}


<button type="button" onClick={toggleAdditionalNotes} className="btn btn-secondary">
            {showAdditionalNotes ? 'Hide Additional Notes' : 'Include Additional Notes (Optional)'}
          </button>

          {showAdditionalNotes && (
            <div className="form-group">
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                value={formData.additionalNotes || ''}
                onChange={handleChange}
                className={`form-textarea ${errors.additionalNotes ? 'is-invalid' : ''}`}
                rows="4"
                placeholder="Enter your additional notes here"
              />
              <label htmlFor="additionalNotes" className="form-label">Additional Notes</label>
              <p className="form-help-text">
                Please provide any additional information that may be relevant to your course scheduling or progress. 
                This could include planned vacations, your academic background, or any other details you think we should know.
              </p>
              {errors.additionalNotes && <div className="error-message">{errors.additionalNotes}</div>}
            </div>
          )}

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
                  className="form-input"
                  placeholder=""
                />
                <label htmlFor="parentEmail" className="form-label">Parent/Guardian Email</label>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
});

export default CourseSelection;