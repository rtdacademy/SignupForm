// steps/StudentTypeAndCourse.js
import React from "react";

const StudentTypeAndCourse = ({ formData, handleChange }) => (
  <section className="form-section">
    <h2 className="section-title">Student Type and Course Selection</h2>

    <div className="form-group">
      <select
        id="studentType"
        name="studentType"
        value={formData.studentType}
        onChange={handleChange}
        required
        className="form-select"
      >
        <option value="">Select student type</option>
        <option value="Non-Primary">Non-Primary</option>
        <option value="Home Education">Home Education</option>
        <option value="Summer School">Summer School</option>
        <option value="Paid Student">Paid Student</option>
      </select>
      <label htmlFor="studentType" className="form-label">
        What type of student are you?
      </label>
      <small>
        Non-Primary: You are under 20 before September 1st of this school year
        and are registered at another junior high or high school in Alberta
        (Free)
        <br />
        Home Education: You are under 20 before September 1st of this school
        year and your education is parent-directed (Free)
        <br />
        Summer School: You are under 20 years old before September 1st of this
        school year and intend to complete the course between July and August
        (Free)
        <br />
        Paid Student: Adult Student or International Student
      </small>
    </div>

    {formData.studentType === "Paid Student" && (
      <div className="form-group">
        <select
          id="paidStudentType"
          name="paidStudentType"
          value={formData.paidStudentType}
          onChange={handleChange}
          required
          className="form-select"
        >
          <option value="">Select paid student type</option>
          <option value="Adult Student">Adult Student</option>
          <option value="International Student">International Student</option>
        </select>
        <label htmlFor="paidStudentType" className="form-label">
          Paid Student Type
        </label>
      </div>
    )}

    {formData.paidStudentType === "Adult Student" && (
      <div className="form-group">
        <label className="form-checkbox-label">
          <input
            type="checkbox"
            name="adultUnderstanding"
            checked={formData.adultUnderstanding}
            onChange={handleChange}
            required
          />
          I understand the Adult Student fee structure and payment process
        </label>
        <small>
          Course Registration Fee: $100 per credit (math courses are 5 credits)
          <br />
          After submitting this form you will receive an email with a link to
          pay using PayPal or debit/credit.
          <br />
          One week after your Start Date you will receive a payment reminder,
          and one week after that you will be locked out of the course if no
          payment is received.
          <br />
          The course you are taking will appear on your transcript after payment
          is received.
          <br />
          You can email info@rtdacademy.com if you have any questions or
          requests.
        </small>
      </div>
    )}

    {formData.paidStudentType === "International Student" && (
      <div className="form-group">
        <label className="form-checkbox-label">
          <input
            type="checkbox"
            name="internationalUnderstanding"
            checked={formData.internationalUnderstanding}
            onChange={handleChange}
            required
          />
          I understand the International Student fee structure and payment
          process
        </label>
        <small>
          Course Registration Fee: $100 per credit - math courses are typically
          5 credits each. This is a special introductory rate, about half the
          normal international student rate.
          <br />
          After submitting this form you will receive an email with a link to
          pay, you may preview the course first.
          <br />
          One week after your Start Date you will receive a payment reminder,
          and one week after that you will be locked out of the course if no
          payment is received.
          <br />
          Please note that the course will not appear on your transcript until
          payment is received.
          <br />
          You can email info@rtdacademy.com if you have any questions.
        </small>
      </div>
    )}

    {/* Add other conditional fields based on student type */}

    <div className="form-group">
      <select
        id="course"
        name="course"
        value={formData.course}
        onChange={handleChange}
        required
        className="form-select"
      >
        <option value="">Select a course</option>
        <option value="Coding">Coding</option>
        <option value="Math 15">Math 15</option>
        <option value="Math 31">Math 31 (Calculus)</option>
        <option value="Math 30-1">Math 30-1</option>
        <option value="Math 30-2">Math 30-2</option>
        <option value="Math 30-3">Math 30-3</option>
        <option value="Math 20-1">Math 20-1</option>
        <option value="Math 20-2">Math 20-2</option>
        <option value="Math 20-3">Math 20-3</option>
        <option value="Math 20-4">Math 20-4</option>
        <option value="Math 10C">Math 10C</option>
        <option value="Math 10-3">Math 10-3</option>
        <option value="Math 10-4">Math 10-4</option>
      </select>
      <label htmlFor="course" className="form-label">
        Which course are you registering for?
      </label>
    </div>

    {/* Add diploma date field for Math 30-1 and Math 30-2 */}

    <div className="form-group">
      <input
        type="date"
        id="startDate"
        name="startDate"
        value={formData.startDate}
        onChange={handleChange}
        required
        className="form-input"
      />
      <label htmlFor="startDate" className="form-label">
        When do you intend to start the course?
      </label>
      <small>
        An date estimate is fine. This will be used to create your initial
        schedule, but we can create a new schedule at your orientation meeting.
      </small>
    </div>

    <div className="form-group">
      <input
        type="date"
        id="endDate"
        name="endDate"
        value={formData.endDate}
        onChange={handleChange}
        required
        className="form-input"
      />
      <label htmlFor="endDate" className="form-label">
        When do you intend to complete the course by?
      </label>
      <small>
        An date estimate is fine. Note: You can start and complete a course at
        any time of year, but if you are in a diploma course, there are set
        times that you are allowed to take your diploma.
      </small>
    </div>
  </section>
);

export default StudentTypeAndCourse;
