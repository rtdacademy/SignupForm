// src/StudentManagement/StudentDetail.js

import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, child } from 'firebase/database';
import { sanitizeEmail } from '../utils/sanitizeEmail';

function StudentDetail({ studentSummary }) {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the student data from the 'students' node
    const fetchStudentData = async () => {
      setLoading(true);
      const dbRef = ref(getDatabase());
      try {
        // Use the StudentEmail from studentSummary and sanitize it
        const sanitizedEmail = sanitizeEmail(studentSummary.StudentEmail);
        const snapshot = await get(child(dbRef, `students/${sanitizedEmail}`));
        if (snapshot.exists()) {
          const data = snapshot.val();
          setStudentData(data);
        } else {
          console.log('No student data available');
          setStudentData(null);
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
        setStudentData(null);
      }
      setLoading(false);
    };

    fetchStudentData();
  }, [studentSummary.StudentEmail]);

  if (loading) {
    return <div>Loading student data...</div>;
  }

  if (!studentData) {
    return <div>No data available for this student.</div>;
  }

  // Extract course data
  const courseData = studentData.courses[studentSummary.courseId];

  // Helper function to render HTML safely
  const renderHTML = (htmlString) => {
    return <div dangerouslySetInnerHTML={{ __html: htmlString }} />;
  };

  // Define display labels
  const profileFields = {
    firstName: 'First Name',
    lastName: 'Last Name',
    StudentEmail: 'Email',
    LastLogin: 'Last Login',
    ResponsibleTeacherEmail: 'Responsible Teacher Email',
  };

  const courseFields = {
    Status_Value: 'Status',
    StatusCompare: 'Last Week Status',
    StudentType_Value: 'Student Type',
    StatusStreakCount: 'Status Streak Count',
    Course_Value: 'Course',
    CurrentMark: 'Current Mark',
    School_x0020_Year_Value: 'School Year',
    DiplomaMonthChoices_Value: 'Diploma Month',
    ResponsibleTeacher_Value: 'Responsible Teacher',
    ActiveFutureArchived_Value: 'Active or Archived',
    ActivityLogLMS: 'Activity Log',
    GradebookHTML: 'Gradebook',
    Schedule: 'Schedule',
    // AssignmentsList is handled separately
    PercentCompleteGradebook: 'Percent Complete Gradebook',
    PercentScheduleComplete: 'Percent Schedule Complete',
    CountAllGradebookAssignments: 'Total Gradebook Assignments',
    CountAssignmentsComplete: 'Gradebook Assignments Completed',
    CountSchedAssignmentsLeft: 'Schedule Assignments Left',
    CountSchedAssignmentsPast: 'Schedule Assignments Past',
    LinkToStudentInLMS: 'Link to Student in LMS',
    ScheduleStartDate: 'Schedule Start Date',
    ScheduleEndDate: 'Schedule End Date',
  };

  return (
    <div>
      <h3 className="text-2xl font-semibold mb-4">
        {studentData.profile.firstName} {studentData.profile.lastName}
      </h3>
      <p className="text-sm text-gray-600 mb-4">{studentData.profile.StudentEmail}</p>

      {/* Course Information */}
      <div className="mb-6">
        <h4 className="text-xl font-semibold mb-2">Course Information</h4>
        {/* Display course details using courseData */}
        {courseData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm">
                  <span className="font-semibold">Status:</span> {courseData.Status_Value?.value || courseData.Status_Value}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Last Week Status:</span> {courseData.StatusCompare?.value || courseData.StatusCompare}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Status Streak Count:</span> {courseData.StatusStreakCount}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Course:</span> {courseData.Course_Value?.value || courseData.Course_Value}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Current Mark:</span> {courseData.CurrentMark}%
                </p>
                <p className="text-sm">
                  <span className="font-semibold">School Year:</span> {courseData.School_x0020_Year_Value?.value || courseData.School_x0020_Year_Value}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Student Type:</span> {courseData.StudentType_Value?.value || courseData.StudentType_Value}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Diploma Month:</span> {courseData.DiplomaMonthChoices_Value?.value || courseData.DiplomaMonthChoices_Value}
                </p>
              </div>
              <div>
                <p className="text-sm">
                  <span className="font-semibold">Responsible Teacher:</span> {courseData.ResponsibleTeacher_Value?.value || courseData.ResponsibleTeacher_Value}
                </p>
                <p className="text-sm flex items-center">
                  <span className="font-semibold mr-2">Active:</span>
                  <input
                    type="checkbox"
                    checked={courseData.ActiveFutureArchived_Value?.value === 'Active'}
                    readOnly
                  />
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Percent Complete Gradebook:</span> {courseData.PercentCompleteGradebook}%
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Percent Schedule Complete:</span> {courseData.PercentScheduleComplete}%
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Total Gradebook Assignments:</span> {courseData.CountAllGradebookAssignments}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Gradebook Assignments Completed:</span> {courseData.CountAssignmentsComplete}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Schedule Assignments Left:</span> {courseData.CountSchedAssignmentsLeft}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Schedule Assignments Past:</span> {courseData.CountSchedAssignmentsPast}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Schedule Start Date:</span> {courseData.ScheduleStartDate}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Schedule End Date:</span> {courseData.ScheduleEndDate}
                </p>
              </div>
            </div>

            {/* HTML Content */}
            <div>
              <p className="text-sm font-semibold">Activity Log:</p>
              {courseData.ActivityLogLMS ? renderHTML(courseData.ActivityLogLMS) : <p>No Activity Log available.</p>}
            </div>
            <div>
              <p className="text-sm font-semibold">Gradebook:</p>
              {courseData.GradebookHTML ? renderHTML(courseData.GradebookHTML) : <p>No Gradebook available.</p>}
            </div>
            <div>
              <p className="text-sm font-semibold">Schedule:</p>
              {courseData.Schedule ? renderHTML(courseData.Schedule) : <p>No Schedule available.</p>}
            </div>

            {/* Assignments List */}
            <div>
              <p className="text-sm font-semibold">Assignments List:</p>
              {courseData.AssignmentsList ? (
                <p>{courseData.AssignmentsList}</p>
              ) : (
                <p>No assignments available.</p>
              )}
            </div>

            {/* Link to LMS */}
            <div className="mt-4">
              {courseData.LinkToStudentInLMS ? (
                <button
                  onClick={() => window.open(courseData.LinkToStudentInLMS, '_blank')}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  View in LMS
                </button>
              ) : (
                <p>No LMS link available.</p>
              )}
            </div>
          </div>
        ) : (
          <p>No course data available for this course.</p>
        )}
      </div>

      {/* Profile Information */}
      <div className="mt-6">
        <h4 className="text-xl font-semibold mb-2">Profile Information</h4>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(profileFields).map(([key, label]) => (
            <div key={key}>
              <p className="text-sm">
                <span className="font-semibold">{label}:</span> {studentData.profile[key]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudentDetail;
