// src/StudentManagement/StudentManagement.js

import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, child } from 'firebase/database';
import FilterPanel from './FilterPanel';
import StudentList from './StudentList';
import StudentDetail from './StudentDetail';

function StudentManagement() {
  const [studentSummaries, setStudentSummaries] = useState([]);
  const [filters, setFilters] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [availableFilters, setAvailableFilters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Define available filters explicitly
    const filtersList = [
      { key: 'Status_Value', label: 'Status' },
      { key: 'Course_Value', label: 'Course' },
      { key: 'School_x0020_Year_Value', label: 'School Year' },
      { key: 'StudentType_Value', label: 'Student Type' },
      { key: 'DiplomaMonthChoices_Value', label: 'Diploma Month' },
      { key: 'ActiveFutureArchived_Value', label: 'Active or Archived' },
    ];
    setAvailableFilters(filtersList);

    // Initialize filters with empty arrays
    const initialFilters = {};
    filtersList.forEach(({ key }) => {
      initialFilters[key] = [];
    });
    setFilters(initialFilters);

    // Fetch the student summaries from the database
    const fetchStudentSummaries = async () => {
      const dbRef = ref(getDatabase());
      try {
        const snapshot = await get(child(dbRef, 'studentCourseSummaries'));
        if (snapshot.exists()) {
          const data = snapshot.val();
          // Convert data from object to array
          const summaries = Object.values(data);
          setStudentSummaries(summaries);
        } else {
          console.log('No student summaries available');
        }
      } catch (error) {
        console.error('Error fetching student summaries:', error);
      }
    };

    fetchStudentSummaries();
  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Filter Panel */}
      <div className="sticky top-0 bg-white shadow z-10 p-4">
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          studentSummaries={studentSummaries}
          availableFilters={availableFilters}
        />
      </div>

      {/* Main Content Below Filters */}
      <div className="flex flex-1 mt-4">
        {/* Student List */}
        <div className="w-full md:w-1/3 p-2 overflow-auto">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <StudentList
            studentSummaries={studentSummaries}
            filters={filters}
            onStudentSelect={handleStudentSelect}
            searchTerm={searchTerm}
          />
        </div>

        {/* Student Detail */}
        <div className="w-full md:w-2/3 p-2 overflow-auto">
          {selectedStudent ? (
            <StudentDetail studentSummary={selectedStudent} />
          ) : (
            <div className="text-center text-gray-500">Select a student to view details</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentManagement;
