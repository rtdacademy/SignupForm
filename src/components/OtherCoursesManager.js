import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Save, X, BookOpen, GraduationCap } from 'lucide-react';

const OtherCoursesManager = ({ courses = [], onCoursesChange }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    courseName: '',
    courseCode: '',
    grade: '',
    credits: '',
    forCredit: true,
    category: '',
    description: ''
  });

  const courseCategories = [
    { value: 'CTS', label: 'Career & Technology Studies (CTS)' },
    { value: 'Fine Arts', label: 'Fine Arts' },
    { value: 'Special Projects', label: 'Special Projects' },
    { value: 'Languages', label: 'Languages' },
    { value: 'Other', label: 'Other' }
  ];

  const gradeOptions = [
    { value: '10', label: 'Grade 10' },
    { value: '11', label: 'Grade 11' },
    { value: '12', label: 'Grade 12' },
    { value: 'Various', label: 'Various Grades' }
  ];

  const creditOptions = [
    { value: '1', label: '1 Credit' },
    { value: '2', label: '2 Credits' },
    { value: '3', label: '3 Credits' },
    { value: '4', label: '4 Credits' },
    { value: '5', label: '5 Credits' },
    { value: 'Other', label: 'Other' }
  ];

  const resetForm = () => {
    setFormData({
      courseName: '',
      courseCode: '',
      grade: '',
      credits: '',
      forCredit: true,
      category: '',
      description: ''
    });
  };

  const handleAddCourse = () => {
    setShowAddForm(true);
    setEditingCourse(null);
    resetForm();
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course.id);
    setFormData(course);
    setShowAddForm(true);
  };

  const handleDeleteCourse = (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      const updatedCourses = courses.filter(course => course.id !== courseId);
      onCoursesChange(updatedCourses);
    }
  };

  const handleSaveCourse = () => {
    if (!formData.courseName.trim()) {
      alert('Course name is required');
      return;
    }

    const courseData = {
      ...formData,
      id: editingCourse || `course_${Date.now()}`,
      courseName: formData.courseName.trim(),
      courseCode: formData.courseCode.trim(),
      description: formData.description.trim()
    };

    let updatedCourses;
    if (editingCourse) {
      // Update existing course
      updatedCourses = courses.map(course => 
        course.id === editingCourse ? courseData : course
      );
    } else {
      // Add new course
      updatedCourses = [...courses, courseData];
    }

    onCoursesChange(updatedCourses);
    setShowAddForm(false);
    resetForm();
    setEditingCourse(null);
  };

  const handleCancelEdit = () => {
    setShowAddForm(false);
    resetForm();
    setEditingCourse(null);
  };

  const CourseForm = () => (
    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
      <h4 className="font-semibold text-gray-900 mb-4">
        {editingCourse ? 'Edit Course' : 'Add New Course'}
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Course Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.courseName}
            onChange={(e) => setFormData(prev => ({ ...prev, courseName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="e.g., Photography 1, Foods 1010, Special Projects"
          />
        </div>

        {/* Course Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course Code (Optional)
          </label>
          <input
            type="text"
            value={formData.courseCode}
            onChange={(e) => setFormData(prev => ({ ...prev, courseCode: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="e.g., ART1070, FOD1010"
          />
        </div>

        {/* Grade Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Grade Level
          </label>
          <select
            value={formData.grade}
            onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Select grade level</option>
            {gradeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Credits */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Credits
          </label>
          <select
            value={formData.credits}
            onChange={(e) => setFormData(prev => ({ ...prev, credits: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Select credits</option>
            {creditOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Select category</option>
            {courseCategories.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* For Credit Toggle */}
        <div className="flex items-center">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.forCredit}
              onChange={(e) => setFormData(prev => ({ ...prev, forCredit: e.target.checked }))}
              className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Taking for credit</span>
          </label>
        </div>
      </div>

      {/* Description */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (Optional)
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          rows={2}
          placeholder="Additional details about this course..."
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 mt-4">
        <button
          type="button"
          onClick={handleCancelEdit}
          className="px-4 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center space-x-1"
        >
          <X className="w-4 h-4" />
          <span>Cancel</span>
        </button>
        <button
          type="button"
          onClick={handleSaveCourse}
          className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center space-x-1"
        >
          <Save className="w-4 h-4" />
          <span>{editingCourse ? 'Update' : 'Add'} Course</span>
        </button>
      </div>

      {/* Special Projects Note */}
      {formData.category === 'Special Projects' && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-xs text-yellow-800">
            <strong>Note:</strong> Special Projects are allowed for grades 10-12 only.
          </p>
        </div>
      )}
    </div>
  );

  const CourseCard = ({ course }) => (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <BookOpen className="w-4 h-4 text-purple-600" />
            <h4 className="font-semibold text-gray-900">{course.courseName}</h4>
            {course.courseCode && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                {course.courseCode}
              </span>
            )}
            {!course.forCredit && (
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded">
                Not for Credit
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
            {course.grade && (
              <span className="flex items-center space-x-1">
                <GraduationCap className="w-3 h-3" />
                <span>Grade {course.grade}</span>
              </span>
            )}
            {course.credits && (
              <span>{course.credits} Credit{course.credits !== '1' ? 's' : ''}</span>
            )}
            {course.category && (
              <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs">
                {course.category}
              </span>
            )}
          </div>
          
          {course.description && (
            <p className="text-sm text-gray-600 italic">{course.description}</p>
          )}
        </div>
        
        <div className="flex space-x-1 ml-4">
          <button
            onClick={() => handleEditCourse(course)}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            title="Edit course"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteCourse(course.id)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete course"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">Other Courses</h3>
          <p className="text-sm text-gray-600">
            Add any additional courses your student plans to complete this year 
            (e.g., Foods, Art, Photography, Welding, Special Projects, etc.)
          </p>
        </div>
        {!showAddForm && (
          <button
            onClick={handleAddCourse}
            className="px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add Course</span>
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && <CourseForm />}

      {/* Course List */}
      {courses.length > 0 ? (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800">
            Added Courses ({courses.length})
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      ) : (
        !showAddForm && (
          <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No other courses added yet</p>
            <p className="text-gray-400 text-xs">Click "Add Course" to get started</p>
          </div>
        )
      )}

      {/* Summary */}
      {courses.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <h4 className="font-medium text-green-900 mb-1">Course Summary</h4>
          <div className="text-sm text-green-800">
            <p>Total other courses: {courses.length}</p>
            <p>For credit: {courses.filter(c => c.forCredit).length}</p>
            <p>Not for credit: {courses.filter(c => !c.forCredit).length}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OtherCoursesManager;