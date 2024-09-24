import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaSave, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import Modal from 'react-modal';
import Select from 'react-select';
import { sanitizeEmail } from '../utils/sanitizeEmail';

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
  const [originalCourseData, setOriginalCourseData] = useState({});

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
    onValue(coursesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCourses(data);
      } else {
        setCourses({});
      }
    });

    // Fetch staff members
    const staffRef = ref(db, 'staff');
    onValue(staffRef, (snapshot) => {
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
  }, [user, isStaff, navigate]);

  const handleCourseSelect = (courseId) => {
    setSelectedCourseId(courseId);
    setCourseData(courses[courseId]);
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (selectedOption, { name }) => {
    setCourseData((prevData) => ({
      ...prevData,
      [name]: selectedOption.value,
    }));
  };

  const handleMultiSelectChange = (selectedOptions, { name }) => {
    setCourseData((prevData) => ({
      ...prevData,
      [name]: selectedOptions.map(option => option.value),
    }));
  };

  const handleEditClick = () => {
    setShowWarning(true);
  };

  const confirmEdit = () => {
    setShowWarning(false);
    setIsEditing(true);
    setOriginalCourseData(courseData);
  };

  const cancelEdit = () => {
    setShowWarning(false);
    setIsEditing(false);
    setCourseData(originalCourseData);
  };

  const handleCancelEdit = () => {
    setCourseData(originalCourseData);
    setIsEditing(false);
  };

  const handleSave = () => {
    const db = getDatabase();
    const courseRef = ref(db, `courses/${selectedCourseId}`);
    update(courseRef, courseData)
      .then(() => {
        alert('Course updated successfully.');
        setIsEditing(false);
      })
      .catch((error) => {
        console.error('Error updating course:', error);
        alert('An error occurred while updating the course.');
      });
  };

  const handleAddUnit = () => {
    const unitFields = Object.keys(courseData)
      .filter((key) => key.startsWith('Unit') && !isNaN(key.replace('Unit', '')))
      .sort((a, b) => {
        const numA = parseInt(a.replace('Unit', ''), 10);
        const numB = parseInt(b.replace('Unit', ''), 10);
        return numA - numB;
      });
    const newUnitNumber = unitFields.length + 1;
    const newUnitKey = `Unit${newUnitNumber}`;
    setCourseData((prevData) => ({
      ...prevData,
      [newUnitKey]: '',
    }));
  };

  const handleDeleteUnit = (unitKey) => {
    const { [unitKey]: _, ...rest } = courseData;
    setCourseData(rest);
  };

  const inputClass = `mt-1 block w-full p-2 border ${
    isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-100'
  } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm`;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-200 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Courses</h2>
        <ul className="space-y-2">
          {Object.keys(courses).map((courseId) => (
            <li
              key={courseId}
              className={`p-2 rounded cursor-pointer ${
                selectedCourseId === courseId ? 'bg-blue-500 text-white' : 'bg-white'
              }`}
              onClick={() => handleCourseSelect(courseId)}
            >
              {courses[courseId].Title || `Course ID: ${courseId}`}
            </li>
          ))}
        </ul>
      </div>

      {/* Course Details */}
      <div className="w-3/4 p-4 overflow-y-auto">
        {selectedCourseId ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Editing Course: {courses[selectedCourseId].Title || selectedCourseId}
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
                {isEditing && (
                  <>
                    <button
                      onClick={handleSave}
                      className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition duration-200 text-sm"
                    >
                      <FaSave className="mr-1" /> Save Changes
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition duration-200 text-sm"
                    >
                      <FaTimes className="mr-1" /> Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
            <form className="space-y-4">
              {/* Course Name */}
              <div>
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

              {/* SharePoint ID (ID) */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  SharePoint ID
                </label>
                <input
                  type="text"
                  name="ID"
                  value={courseData.ID || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={inputClass}
                />
              </div>

              {/* LMS Course ID */}
              <div>
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
              <div>
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
              <div>
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
              <div>
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

              {/* Teachers */}
              <div>
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
              <div>
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

              {/* NumberGradeBookAssignments */}
              <div>
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
              </div>

              {/* NumberOfAssignments */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Number of Assignments
                </label>
                <input
                  type="number"
                  name="NumberOfAssignments"
                  value={courseData.NumberOfAssignments || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={inputClass}
                />
              </div>

              {/* Units */}
              <h3 className="text-lg font-bold mt-6">Units</h3>
              {Object.keys(courseData)
                .filter((key) => key.startsWith('Unit') && !isNaN(key.replace('Unit', '')))
                .sort((a, b) => {
                  const numA = parseInt(a.replace('Unit', ''), 10);
                  const numB = parseInt(b.replace('Unit', ''), 10);
                  return numA - numB;
                })
                .map((unitKey, index) => (
                  <div key={unitKey}>
                    <label className="block text-sm font-medium text-gray-700">
                      Unit {index + 1}
                    </label>
                    <textarea
                      name={unitKey}
                      value={courseData[unitKey] || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={inputClass}
                      rows={3}
                    />
                  {isEditing && (
                      <button
                        onClick={() => handleDeleteUnit(unitKey)}
                        className="mt-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200 text-sm"
                      >
                        Delete Unit
                      </button>
                    )}
                  </div>
                ))}
              {isEditing && (
                <button
                  onClick={handleAddUnit}
                  className="mt-4 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition duration-200 text-sm"
                >
                  Add New Unit
                </button>
              )}
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
            Editing course data can affect students' access and progress. Are you sure you want to
            proceed?
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