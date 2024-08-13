import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { courseSharepointIDs } from "./variables";

const CourseSelection = forwardRef(({ formData, handleChange, calculateAge, diplomaDates, loading, error }, ref) => {
  const [showDiplomaDate, setShowDiplomaDate] = useState(false);
  const [showParentInfo, setShowParentInfo] = useState(false);
  const [errors, setErrors] = useState({});
  const [filteredDiplomaDates, setFilteredDiplomaDates] = useState([]);
  const [showAdditionalNotes, setShowAdditionalNotes] = useState(false);
  const [alreadyWroteDiploma, setAlreadyWroteDiploma] = useState(false);
  const [isCodingOption, setIsCodingOption] = useState(false);
  const [startDateErrorMessage, setStartDateErrorMessage] = useState('');
const [completionDateErrorMessage, setCompletionDateErrorMessage] = useState('');

  useEffect(() => {
    const isDiplomaCourse = ['Math 30-1', 'Math 30-2'].includes(formData.course);
    setShowDiplomaDate(isDiplomaCourse);
    setShowParentInfo(calculateAge(formData.birthday, new Date()) < 18);

    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

    const filtered = diplomaDates
      .filter(item => {
        const itemDate = new Date(item.date);
        const isCorrectCourse = item.course === `Mathematics ${formData.course.split(' ')[1]}`;
        const isAfterOneMonth = itemDate > oneMonthFromNow;
        return isCorrectCourse && isAfterOneMonth;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 6);

    setFilteredDiplomaDates(filtered);

    if (!isDiplomaCourse) {
      setAlreadyWroteDiploma(false);
    }

    setIsCodingOption(formData.course === 'Coding');
  }, [formData.course, formData.birthday, calculateAge, diplomaDates]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.course) newErrors.course = "Course selection is required";
    if (showDiplomaDate && !formData.diplomaMonth && !alreadyWroteDiploma) newErrors.diplomaMonth = "Diploma month is required for Math 30-1 and Math 30-2";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if ((!showDiplomaDate || alreadyWroteDiploma) && !formData.completionDate) newErrors.completionDate = "Completion date is required";

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
      if (minDate.getDay() !== 0 && minDate.getDay() !== 6) {
        addedDays++;
      }
    }
  
    // Reset the time to midnight
    minDate.setHours(0, 0, 0, 0);
  
    return minDate;
  };
  
  const compareDates = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const getMinCompletionDate = () => {
    if (!formData.startDate) return null;
    const startDate = new Date(formData.startDate);
    const minCompletionDate = new Date(startDate);
    minCompletionDate.setMonth(minCompletionDate.getMonth() + 1);
    return minCompletionDate;
  };

  const getDefaultCompletionDate = () => {
    if (!formData.startDate) return null;
    const startDate = new Date(formData.startDate);
    const defaultCompletionDate = new Date(startDate);
    defaultCompletionDate.setMonth(defaultCompletionDate.getMonth() + 5);
    return defaultCompletionDate;
  };

  const handleDiplomaMonthChange = (e) => {
    const value = e.target.value;
    if (value === "I don't need to write the diploma") {
      setAlreadyWroteDiploma(true);
      handleChange({
        target: {
          name: "diplomaMonth",
          value: "I don't need to write the diploma"
        }
      });
    } else {
      setAlreadyWroteDiploma(false);
      handleChange(e);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);  // Add one day
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
  
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
  
    return [year, month, day].join('-');
  };
  
  const CustomInput = forwardRef(({ value, onClick, label, error, helpText }, ref) => (
    <div className="form-group" onClick={onClick} ref={ref}>
      <div className="date-input-group">
        <input
          type="text"
          value={value || ''}
          readOnly
          className={`form-input ${error ? 'is-invalid' : ''}`}
          placeholder=" "
        />
        <label className="form-label">{label}</label>
        <svg className="calendar-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </div>
      {helpText && <p className="form-help-text">{helpText}</p>}
      {error && <div className="error-message">{error}</div>}
    </div>
  ));



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
                onChange={handleDiplomaMonthChange}
                required
                className={`form-select ${errors.diplomaMonth ? 'is-invalid' : ''}`}
              >
                <option value="">Select diploma writing month</option>
                <option value="I don't need to write the diploma">I don't need to write the diploma</option>
                {filteredDiplomaDates.map((date) => (
                  <option key={`${date.course}-${date.month}-${date.date}`} value={date.month}>
                    {`${date.month} (${new Date(date.date).toLocaleDateString()}) - ${date.status}`}
                  </option>
                ))}
              </select>
              <label htmlFor="diplomaMonth" className="form-label">Diploma Month</label>
              {alreadyWroteDiploma && (
                <p className="form-help-text">
                  The diploma is required for this course, but you may not need to take it if you have already taken the diploma and wish to keep the original mark. The diploma accounts for 30% of your mark for this course.
                </p>
              )}
              <p className="form-help-text">
                <p>Math 30-1 and Math 30-2 are diploma courses that require you to write an exam at a designated test center, often at your school.</p>
                <p><strong>Important Notes:</strong></p>
                <ul>
                  <li>If a diploma date is marked as "Draft", please be aware that Alberta Education may still adjust this date.</li>
                  <li>You can register for your diploma exam now through your <a href="https://public.education.alberta.ca/PASI/myPass/welcome" target="_blank" rel="noopener noreferrer">MyPass account</a>.</li>
                  <li>If you're unsure about the registration process, don't worry. We'll send out detailed instructions as the exam date approaches.</li>
                </ul>
                <p>For more information on Diploma exams, please visit the <a href="https://www.alberta.ca/writing-diploma-exams" target="_blank" rel="noopener noreferrer">Alberta Education Diploma Exams page</a>.</p>
                <p>If you have any questions about diplomas, please email us at <a href="mailto:info@rtdacademy.com">info@rtdacademy.com</a>.</p>
              </p>
              {errors.diplomaMonth && <div className="error-message">{errors.diplomaMonth}</div>}
            </div>
          )}

<DatePicker
  selected={formData.startDate ? new Date(formData.startDate) : null}
  onChange={(date) => {
    const minDate = getMinStartDate();
    if (date >= minDate || compareDates(date, minDate)) {
      handleChange({ target: { name: 'startDate', value: formatDate(date) } });
      setStartDateErrorMessage('');
    } else {
      setStartDateErrorMessage('You must choose a date that is at least 2 business days from today.');
    }
  }}
  minDate={getMinStartDate()}
  customInput={
    <CustomInput 
      label="When do you intend to start the course?" 
      error={errors.startDate || startDateErrorMessage}
      helpText="Please select a start date at least 2 business days from today. This allows our registrar time to add you to the course. The date you choose will be used to create your initial schedule, but we can adjust this later on as well if needed."
    />
  }
  dateFormat="MMMM d, yyyy"
  onClickOutside={() => setStartDateErrorMessage('')}
/>
{startDateErrorMessage && <div className="error-message">{startDateErrorMessage}</div>}

{(!showDiplomaDate || alreadyWroteDiploma) && (
  <DatePicker
    selected={formData.completionDate ? new Date(formData.completionDate) : null}
    onChange={(date) => {
      if (date >= getMinCompletionDate()) {
        handleChange({ target: { name: 'completionDate', value: formatDate(date) } });
        setCompletionDateErrorMessage('');
      } else {
        setCompletionDateErrorMessage('You must choose a date that allows at least one month to complete the course.');
      }
    }}
    minDate={getMinCompletionDate()}
    openToDate={getDefaultCompletionDate()}
    disabled={!formData.startDate}
    customInput={
      <CustomInput 
        label="When do you intend to complete the course by?" 
        error={errors.completionDate || completionDateErrorMessage}
        helpText={`Please select a completion date at least one month after your start date. Most 5-credit courses are typically designed to be completed in 5 months. A date estimate is fine. You can start and complete a course at any time of year.${!formData.startDate ? ' Please select a start date first.' : ''}`}
      />
    }
    dateFormat="MMMM d, yyyy"
    onClickOutside={() => setCompletionDateErrorMessage('')}
  />
)}
{completionDateErrorMessage && <div className="error-message">{completionDateErrorMessage}</div>}
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