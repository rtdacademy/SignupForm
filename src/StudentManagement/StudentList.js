// StudentList.jsx

import React, { useState, useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import StudentCard from './StudentCard';
import { ChevronUp, ChevronDown, SortAsc } from 'lucide-react';

function StudentList({
  studentSummaries,
  filters,
  onStudentSelect,
  searchTerm,
  selectedStudentId,
  courseInfo,
  courseTeachers,
  courseSupportStaff,
  teacherCategories,
  user_email_key,
}) {
  const [sortKey, setSortKey] = useState('lastName');
  const [sortOrder, setSortOrder] = useState('asc');

  // Apply filters and search using useMemo for performance optimization
  const filteredStudents = useMemo(() => {
    return studentSummaries.filter((student) => {
      const matchesFilters = Object.keys(filters).every((filterKey) => {
        if (filters[filterKey].length === 0) return true;
        const studentValue = String(student[filterKey] || '').toLowerCase();
        return filters[filterKey].some(
          (filterValue) => String(filterValue).toLowerCase() === studentValue
        );
      });

      const matchesSearch =
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.StudentEmail.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesFilters && matchesSearch;
    });
  }, [studentSummaries, filters, searchTerm]);

  // Sorting using useMemo for performance optimization
  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      const aValue = a[sortKey] || '';
      const bValue = b[sortKey] || '';
      if (sortOrder === 'asc') {
        return String(aValue).localeCompare(String(bValue));
      } else {
        return String(bValue).localeCompare(String(aValue));
      }
    });
  }, [filteredStudents, sortKey, sortOrder]);

  const sortOptions = [
    { value: 'lastName', label: 'Last Name' },
    { value: 'firstName', label: 'First Name' },
    { value: 'Status_Value', label: 'Status' },
    { value: 'Course_Value', label: 'Course' },
    { value: 'CurrentMark', label: 'Current Mark' },
    { value: 'School_x0020_Year_Value', label: 'School Year' },
    { value: 'StudentType_Value', label: 'Student Type' },
    { value: 'DiplomaMonthChoices_Value', label: 'Diploma Month' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="flex-shrink-0 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <h3 className="text-lg font-medium text-gray-700 flex items-center">
            Students 
            <span className="ml-2 text-sm font-normal text-gray-500">({sortedStudents.length})</span>
          </h3>
          <div className="flex items-center space-x-2">
            <Select value={sortKey} onValueChange={setSortKey}>
              <SelectTrigger className="w-[140px] h-8 text-xs bg-white border-gray-200 text-gray-600">
                <SortAsc className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-xs">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="h-8 w-8 bg-white text-gray-600 hover:bg-gray-100"
            >
              {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Student List Section */}
      <div className="flex-1 overflow-auto">
        <Virtuoso
          style={{ height: '100%' }}
          totalCount={sortedStudents.length}
          itemContent={(index) => (
            <div className="px-2">
              <StudentCard
                student={sortedStudents[index]}
                index={index}
                selectedStudentId={selectedStudentId}
                onStudentSelect={onStudentSelect}
                courseInfo={courseInfo}
                courseTeachers={courseTeachers}
                courseSupportStaff={courseSupportStaff}
                teacherCategories={teacherCategories}
                user_email_key={user_email_key}
              />
            </div>
          )}
          components={{
            EmptyPlaceholder: () => (
              <p className="text-center text-gray-500 py-4">No students match the selected filters.</p>
            ),
          }}
        />
      </div>
    </div>
  );
}

export default StudentList;
