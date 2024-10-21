import React, { useState, useEffect, useMemo } from 'react';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaExclamationTriangle } from 'react-icons/fa';
import Modal from 'react-modal';
import Select from 'react-select';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import CourseUnitsEditor from './CourseUnitsEditor';

Modal.setAppElement('#root');

function Courses() {
  const { user, isStaff } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState({});
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [courseData, setCourseData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [staffMembers, setStaffMembers] = useState([]);

  const activeOptions = [
    { value: 'Current', label: 'Current' },
    { value: 'Old', label: 'Old' },
    { value: 'Not Used', label: 'Not Used' },
    { value: 'Custom', label: 'Custom' },
  ];

  const courseTypeOptions = [
    { value: 'Math', label: 'Math' },
    { value: 'Science', label: 'Science' },
    { value: 'Option', label: 'Option' },
    { value: 'Custom', label: 'Custom' },
  ];

  const diplomaCourseOptions = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' },
  ];

  useEffect(() => {
    if (!user || !isStaff(user)) {
      navigate('/login');
      return;
    }

    const db = getDatabase();

    // Fetch courses
    const coursesRef = ref(db, 'courses');
    const unsubscribeCourses = onValue(coursesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCourses(data);
        if (selectedCourseId) {
          setCourseData(data[selectedCourseId]);
        }
      } else {
        setCourses({});
        setCourseData({});
      }
    });

    // Fetch staff members
    const staffRef = ref(db, 'staff');
    const unsubscribeStaff = onValue(staffRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStaffMembers(
          Object.entries(data).map(([_, staffData]) => ({
            value: sanitizeEmail(staffData.email),
            label: staffData.name || staffData.displayName || 'No Name',
            email: staffData.email
          }))
        );
      } else {
        setStaffMembers([]);
      }
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeCourses();
      unsubscribeStaff();
    };
  }, [user, isStaff, navigate, selectedCourseId]);

  const handleCourseSelect = (courseId) => {
    setSelectedCourseId(courseId);
    setCourseData(courses[courseId]);
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedData = {
      ...courseData,
      [name]: value,
    };
    setCourseData(updatedData);

    // Update database directly
    const db = getDatabase();
    const courseRef = ref(db, `courses/${selectedCourseId}`);
    update(courseRef, { [name]: value })
      .catch((error) => {
        console.error('Error updating course:', error);
        alert('An error occurred while updating the course.');
      });
  };

  const handleSelectChange = (selectedOption, { name }) => {
    const updatedData = {
      ...courseData,
      [name]: selectedOption.value,
    };
    setCourseData(updatedData);

    // Update database directly
    const db = getDatabase();
    const courseRef = ref(db, `courses/${selectedCourseId}`);
    update(courseRef, { [name]: selectedOption.value })
      .catch((error) => {
        console.error('Error updating course:', error);
        alert('An error occurred while updating the course.');
      });
  };

  const handleMultiSelectChange = (selectedOptions, { name }) => {
    const values = selectedOptions.map(option => option.value);
    const updatedData = {
      ...courseData,
      [name]: values,
    };
    setCourseData(updatedData);

    // Update database directly
    const db = getDatabase();
    const courseRef = ref(db, `courses/${selectedCourseId}`);
    update(courseRef, { [name]: values })
      .catch((error) => {
        console.error('Error updating course:', error);
        alert('An error occurred while updating the course.');
      });
  };

  const handleUnitsChange = (newUnits) => {
    const updatedData = {
      ...courseData,
      units: newUnits,
    };
    setCourseData(updatedData);

    // Update database directly
    const db = getDatabase();
    const courseRef = ref(db, `courses/${selectedCourseId}`);
    update(courseRef, { units: newUnits })
      .catch((error) => {
        console.error('Error updating course:', error);
        alert('An error occurred while updating the course.');
      });
  };

  const handleEditClick = () => {
    setShowWarning(true);
  };

  const confirmEdit = () => {
    setShowWarning(false);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setShowWarning(false);
  };

  const inputClass = `mt-1 block w-full p-2 border ${
    isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-100'
  } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm`;

  // Group courses by grade
  const groupedCourses = useMemo(() => {
    const groups = {};

    Object.entries(courses).forEach(([courseId, course]) => {
      const grade = course.grade ? course.grade.trim() : 'Other';
      if (!grade) {
        if (!groups['Other']) groups['Other'] = [];
        groups['Other'].push({ courseId, course });
      } else {
        if (!groups[grade]) groups[grade] = [];
        groups[grade].push({ courseId, course });
      }
    });

    // Sort the grades, placing "Other" at the end
    const sortedGrades = Object.keys(groups).filter(g => g !== 'Other').sort((a, b) => {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return a.localeCompare(b);
    });
    if (groups['Other']) {
      sortedGrades.push('Other');
    }

    const sortedGroups = {};
    sortedGrades.forEach(grade => {
      sortedGroups[grade] = groups[grade];
    });

    return sortedGroups;
  }, [courses]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-200 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Courses</h2>
        {Object.keys(groupedCourses).length > 0 ? (
          <div>
            {Object.entries(groupedCourses).map(([grade, coursesInGrade]) => (
              <div key={grade} className="mb-4">
                <h3 className="text-md font-semibold mb-2">{grade}</h3>
                <ul className="space-y-1 pl-4">
                  {coursesInGrade.map(({ courseId, course }) => (
                    <li
                      key={courseId}
                      className={`p-2 rounded cursor-pointer ${
                        selectedCourseId === courseId ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
                      }`}
                      onClick={() => handleCourseSelect(courseId)}
                    >
                      {course.Title || `Course ID: ${courseId}`}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p>No courses available.</p>
        )}
      </div>

      {/* Course Details */}
      <div className="w-3/4 p-4 overflow-y-auto">
        {selectedCourseId ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Course: {courses[selectedCourseId].Title || selectedCourseId}
              </h2>
              <div className="flex items-center space-x-2">
                {!isEditing && (
                  <button
                    onClick={handleEditClick}
                    className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200 text-sm"
                  >
                    <FaEdit className="mr-1" /> Edit Course
                  </button>
                )}
              </div>
            </div>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div className="flex flex-wrap -mx-2">
                {/* Course Name */}
                <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Course Name
                  </label>
                  <input
                    type="text"
                    name="Title"
                    value={courseData.Title || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={inputClass}
                  />
                </div>

                {/* LMS Course ID */}
                <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    LMS Course ID
                  </label>
                  <input
                    type="text"
                    name="LMSCourseID"
                    value={courseData.LMSCourseID || ''}
                    disabled
                    className={`mt-1 block w-full p-2 border border-gray-200 bg-gray-100 rounded-md shadow-sm text-sm`}
                  />
                </div>

                {/* Active */}
                <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Active
                  </label>
                  <Select
                    name="Active"
                    options={activeOptions}
                    value={activeOptions.find(option => option.value === courseData.Active)}
                    onChange={handleSelectChange}
                    isDisabled={!isEditing}
                    className="mt-1"
                  />
                  {courseData.Active === 'Custom' && (
                    <input
                      type="text"
                      name="ActiveCustom"
                      value={courseData.ActiveCustom || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`${inputClass} mt-2`}
                      placeholder="Enter custom value"
                    />
                  )}
                </div>

                {/* CourseType */}
                <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Course Type
                  </label>
                  <Select
                    name="CourseType"
                    options={courseTypeOptions}
                    value={courseTypeOptions.find(option => option.value === courseData.CourseType)}
                    onChange={handleSelectChange}
                    isDisabled={!isEditing}
                    className="mt-1"
                  />
                  {courseData.CourseType === 'Custom' && (
                    <input
                      type="text"
                      name="CourseTypeCustom"
                      value={courseData.CourseTypeCustom || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`${inputClass} mt-2`}
                      placeholder="Enter custom value"
                    />
                  )}
                </div>

                {/* DiplomaCourse */}
                <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Diploma Course
                  </label>
                  <Select
                    name="DiplomaCourse"
                    options={diplomaCourseOptions}
                    value={diplomaCourseOptions.find(option => option.value === courseData.DiplomaCourse)}
                    onChange={handleSelectChange}
                    isDisabled={!isEditing}
                    className="mt-1"
                  />
                </div>

                {/* NumberGradeBookAssignments */}
                <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Number of Gradebook Assignments
                  </label>
                  <input
                    type="number"
                    name="NumberGradeBookAssignments"
                    value={courseData.NumberGradeBookAssignments || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={inputClass}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This value must match the LMS gradebook in Student View.
                  </p>
                </div>

                {/* Grade (Newly Added) */}
                <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Grade
                  </label>
                  <input
                    type="text" // Change to "number" if grade should be numeric
                    name="grade"
                    value={courseData.grade || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={inputClass}
                    placeholder="Enter grade"
                  />
                </div>

                {/* Teachers */}
                <div className="w-full md:w-1/2 lg:w-2/3 px-2 mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Teachers
                  </label>
                  <Select
                    isMulti
                    name="Teachers"
                    options={staffMembers}
                    value={staffMembers.filter(staff => 
                      courseData.Teachers && courseData.Teachers.includes(staff.value)
                    )}
                    onChange={handleMultiSelectChange}
                    isDisabled={!isEditing}
                    className="mt-1"
                  />
                </div>

                {/* Support Staff */}
                <div className="w-full md:w-1/2 lg:w-2/3 px-2 mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Support Staff
                  </label>
                  <Select
                    isMulti
                    name="SupportStaff"
                    options={staffMembers}
                    value={staffMembers.filter(staff => 
                      courseData.SupportStaff && courseData.SupportStaff.includes(staff.value)
                    )}
                    onChange={handleMultiSelectChange}
                    isDisabled={!isEditing}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Course Units Editor */}
              <div className="mt-8">
                <CourseUnitsEditor
                  units={courseData.units || []}
                  onUnitsChange={handleUnitsChange}
                  isEditing={isEditing}
                />
              </div>
            </form>
          </div>
        ) : (
          <p>Select a course to view details.</p>
        )}
      </div>

      {/* Warning Modal */}
      <Modal
        isOpen={showWarning}
        onRequestClose={() => setShowWarning(false)}
        contentLabel="Warning"
        className="bg-white p-6 rounded shadow-lg max-w-md mx-auto mt-20"
        overlayClassName="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center"
      >
        <div className="text-center">
          <FaExclamationTriangle className="text-yellow-500 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Warning</h2>
          <p className="mb-4">
            Editing course data can affect students' access and progress. Changes made cannot be undone.
            Are you sure you want to proceed?
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={confirmEdit}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200"
            >
              Yes, Proceed
            </button>
            <button
              onClick={cancelEdit}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Courses;
