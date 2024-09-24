// src/StudentManagement/StudentList.js

import React, { useState } from 'react';
import { FixedSizeList as List } from 'react-window';

function StudentList({ studentSummaries, filters, onStudentSelect, searchTerm }) {
  const [sortKey, setSortKey] = useState('lastName');
  const [sortOrder, setSortOrder] = useState('asc');

  // Apply filters
  const filteredStudents = studentSummaries.filter((student) => {
    // Apply filters
    const matchesFilters = Object.keys(filters).every((filterKey) => {
      if (filters[filterKey].length === 0) return true; // No filter applied for this key
      const studentValue = String(student[filterKey]).toLowerCase();
      return filters[filterKey].some(
        (filterValue) => String(filterValue).toLowerCase() === studentValue
      );
    });

    // Apply search term
    const matchesSearch =
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.StudentEmail.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilters && matchesSearch;
  });

  // Sorting
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const aValue = a[sortKey] || '';
    const bValue = b[sortKey] || '';
    if (sortOrder === 'asc') {
      return String(aValue).localeCompare(String(bValue));
    } else {
      return String(bValue).localeCompare(String(aValue));
    }
  });

  const Row = ({ index, style }) => {
    const student = sortedStudents[index];
    return (
      <li
        key={`${student.studentId}_${student.courseId}`}
        className="border p-4 rounded-md hover:bg-gray-100 cursor-pointer mb-2"
        onClick={() => onStudentSelect(student)}
        style={style}
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-lg">
              {student.firstName} {student.lastName}
            </h4>
            <p className="text-sm text-gray-600">{student.StudentEmail}</p>
          </div>
          <div className="text-right">
            <p className="text-sm">
              <span className="font-semibold">Status:</span>{' '}
              <span
                className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                  student.Status_Value === 'Behind'
                    ? 'bg-red-200 text-red-800'
                    : 'bg-green-200 text-green-800'
                }`}
              >
                {student.Status_Value}
              </span>
            </p>
            <p className="text-sm">
              <span className="font-semibold">Last Week Status:</span> {student.StatusCompare}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Status Streak Count:</span> {student.StatusStreakCount}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Course:</span> {student.Course_Value}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Current Mark:</span> {student.CurrentMark}%
            </p>
            <p className="text-sm">
              <span className="font-semibold">School Year:</span> {student.School_x0020_Year_Value}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Student Type:</span> {student.StudentType_Value}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Diploma Month:</span> {student.DiplomaMonthChoices_Value}
            </p>
            <p className="text-sm flex items-center">
              <span className="font-semibold mr-2">Active:</span>
              <input
                type="checkbox"
                checked={student.ActiveFutureArchived_Value === 'Active'}
                readOnly
              />
            </p>
          </div>
        </div>
      </li>
    );
  };

  // Define sort options with display labels
  const sortOptions = [
    { key: 'lastName', label: 'Last Name' },
    { key: 'firstName', label: 'First Name' },
    { key: 'Status_Value', label: 'Status' },
    { key: 'Course_Value', label: 'Course' },
    { key: 'CurrentMark', label: 'Current Mark' },
    { key: 'School_x0020_Year_Value', label: 'School Year' },
    { key: 'StudentType_Value', label: 'Student Type' },
    { key: 'DiplomaMonthChoices_Value', label: 'Diploma Month' },
    // Add more options as needed
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Students</h3>

      {/* Sort Controls */}
      <div className="flex items-center mb-4">
        <label className="mr-2">Sort by:</label>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          className="mr-2 px-2 py-1 border rounded"
        >
          {sortOptions.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="text-blue-500 hover:underline"
        >
          {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        </button>
      </div>

      {sortedStudents.length > 0 ? (
        <List
          height={600} // Adjust based on your layout
          itemCount={sortedStudents.length}
          itemSize={250} // Adjust based on the height of your student card
          width={'100%'}
        >
          {Row}
        </List>
      ) : (
        <p>No students match the selected filters.</p>
      )}
    </div>
  );
}

export default StudentList;
