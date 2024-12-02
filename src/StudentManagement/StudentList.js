import React, { useState, useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { CSVLink } from 'react-csv';
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import StudentCard from './StudentCard';
import { ChevronUp, ChevronDown, SortAsc, FileDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Utility function to generate username
const generateUsername = (firstName, lastName) => {
  const cleanString = (str) => str.replace(/[^a-zA-Z]/g, '').toLowerCase();
  
  const cleanFirstName = cleanString(firstName);
  const cleanLastName = cleanString(lastName);
  
  return cleanFirstName.charAt(0) + '_' + cleanLastName;
};

// Utility function to generate temporary password
const generateTempPassword = () => {
  const allowedNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const getRandomNumber = () => allowedNumbers[Math.floor(Math.random() * allowedNumbers.length)];
  
  return `Temp${getRandomNumber()}${getRandomNumber()}${getRandomNumber()}`;
};

// Utility function to format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

// Utility function to format section
const formatSection = (section) => {
  if (!section) return '';
  return section.replace('_', '/');
};

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
  selectedStudents,
  onSelectedStudentsChange,
  isMobile
}) {
  const { getTeacherForCourse } = useAuth();
  const [sortKey, setSortKey] = useState('lastName');
  const [sortOrder, setSortOrder] = useState('asc');

  // Apply filters and search using useMemo for performance optimization
  
  const filteredStudents = useMemo(() => {
    return studentSummaries.filter((student) => {
      // Handle hasSchedule filter
      if (filters.hasSchedule?.length > 0) {
        const shouldHaveSchedule = filters.hasSchedule[0];
        const hasSchedule = Boolean(student.hasSchedule);
        if (shouldHaveSchedule !== hasSchedule) {
          return false;
        }
      }
  
      // Handle category filters
      const matchesCategories = !filters.categories || filters.categories.length === 0 || 
        filters.categories.some((teacherCat) => {
          const teacherEmailKey = Object.keys(teacherCat)[0];
          const categoryIds = teacherCat[teacherEmailKey];
          return student.categories && 
                 student.categories[teacherEmailKey] && 
                 categoryIds.some(categoryId => student.categories[teacherEmailKey][categoryId] === true);
        });
  
      if (!matchesCategories) {
        return false;
      }
  
      // Handle all other filters
      const matchesFilters = Object.keys(filters).every((filterKey) => {
        // Skip special filter cases
        if (filterKey === 'hasSchedule' || filterKey === 'categories') return true;
        
        // Handle date filters
        if (filterKey === 'dateFilters') {
          if (!filters.dateFilters || Object.keys(filters.dateFilters).length === 0) return true;
          
          // Handle Created date filters
          if (filters.dateFilters.created) {
            if (!student.Created) return false;
            const createdDate = new Date(student.Created);
            if (isNaN(createdDate.getTime())) return false;
  
            if (filters.dateFilters.created.after && createdDate < new Date(filters.dateFilters.created.after)) {
              return false;
            }
            if (filters.dateFilters.created.before && createdDate > new Date(filters.dateFilters.created.before)) {
              return false;
            }
            if (filters.dateFilters.created.between) {
              const { start, end } = filters.dateFilters.created.between;
              if (createdDate < new Date(start) || createdDate > new Date(end)) {
                return false;
              }
            }
          }
  
          // Handle Schedule Start date filters
          if (filters.dateFilters.scheduleStart) {
            if (!student.ScheduleStartDate) return false;
            const startDate = new Date(student.ScheduleStartDate);
            if (isNaN(startDate.getTime())) return false;
  
            if (filters.dateFilters.scheduleStart.after && startDate < new Date(filters.dateFilters.scheduleStart.after)) {
              return false;
            }
            if (filters.dateFilters.scheduleStart.before && startDate > new Date(filters.dateFilters.scheduleStart.before)) {
              return false;
            }
            if (filters.dateFilters.scheduleStart.between) {
              const { start, end } = filters.dateFilters.scheduleStart.between;
              if (startDate < new Date(start) || startDate > new Date(end)) {
                return false;
              }
            }
          }
  
          // Handle Schedule End date filters
          if (filters.dateFilters.scheduleEnd) {
            if (!student.ScheduleEndDate) return false;
            const endDate = new Date(student.ScheduleEndDate);
            if (isNaN(endDate.getTime())) return false;
  
            if (filters.dateFilters.scheduleEnd.after && endDate < new Date(filters.dateFilters.scheduleEnd.after)) {
              return false;
            }
            if (filters.dateFilters.scheduleEnd.before && endDate > new Date(filters.dateFilters.scheduleEnd.before)) {
              return false;
            }
            if (filters.dateFilters.scheduleEnd.between) {
              const { start, end } = filters.dateFilters.scheduleEnd.between;
              if (endDate < new Date(start) || endDate > new Date(end)) {
                return false;
              }
            }
          }
  
          return true;
        }
  
        // Handle regular array-based filters
        if (!Array.isArray(filters[filterKey])) return true;
        if (filters[filterKey].length === 0) return true;
        
        const studentValue = String(student[filterKey] || '').toLowerCase();
        return filters[filterKey].some(
          (filterValue) => String(filterValue).toLowerCase() === studentValue
        );
      });
  
      // Handle search term
      const matchesSearch =
        searchTerm === '' ||
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

      // Special handling for date sorting
      if (sortKey === 'ScheduleStartDate') {
        const aDate = aValue ? new Date(aValue).getTime() : 0;
        const bDate = bValue ? new Date(bValue).getTime() : 0;
        
        return sortOrder === 'asc' 
          ? aDate - bDate 
          : bDate - aDate;
      }

      // Regular string sorting for other fields
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
    { value: 'ScheduleStartDate', label: 'Start Date' },
  ];

  const handleSelectAll = (checked) => {
    if (checked) {
      const newSelected = new Set(sortedStudents.map(student => student.id));
      onSelectedStudentsChange(newSelected);
    } else {
      onSelectedStudentsChange(new Set());
    }
  };

  const handleStudentSelect = (studentId, checked) => {
    const newSelected = new Set(selectedStudents);
    if (checked) {
      newSelected.add(studentId);
    } else {
      newSelected.delete(studentId);
    }
    onSelectedStudentsChange(newSelected);
  };

  const handleCardClick = (student) => {
    // Only trigger onStudentSelect if no checkboxes are selected
    if (selectedStudents.size === 0) {
      onStudentSelect(student);
    }
  };

  const isAllSelected = sortedStudents.length > 0 && 
    sortedStudents.every(student => selectedStudents.has(student.id));
  const isSomeSelected = selectedStudents.size > 0 && !isAllSelected;

  // Prepare CSV data for selected students
  const csvData = useMemo(() => {
    const selectedStudentsData = Array.from(selectedStudents)
      .map(id => {
        const student = studentSummaries.find(s => s.id === id);
        if (!student) return null;

        const teacher = getTeacherForCourse(student.CourseID);
        
        return {
          username: generateUsername(student.firstName, student.lastName),
          password: generateTempPassword(),
          lname: student.lastName || '',
          fname: student.preferredFirstName || student.firstName || '',
          email: student.StudentEmail || '',
          courseid: student.CourseID || '',
          course: student.Course_Value || '',
          section: formatSection(student.section),
          pemail: student.ParentEmail || '',
          teacherFirstName: teacher ? teacher.firstName : '',
          teacherLastName: teacher ? teacher.lastName : '',
          teacherEmail: teacher ? teacher.email : '',
          studenttype: student.StudentType_Value || '',
          starting: formatDate(student.ScheduleStartDate),
          ending: formatDate(student.ScheduleEndDate),
          asn: student.asn || '' // Adding the ASN to the CSV data
        };
      })
      .filter(Boolean);

    return selectedStudentsData;
  }, [selectedStudents, studentSummaries, getTeacherForCourse]);

  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="flex-shrink-0 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={isAllSelected}
              indeterminate={isSomeSelected}
              onCheckedChange={handleSelectAll}
              aria-label="Select all students"
            />
            <h3 className="text-lg font-medium text-gray-700 flex items-center">
              Students
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({sortedStudents.length})
                {selectedStudents.size > 0 && ` • ${selectedStudents.size} selected`}
              </span>
            </h3>
          </div>
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

        {selectedStudents.size > 0 && (
          <div className="mt-2 flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectedStudentsChange(new Set())}
              className="text-xs"
            >
              Clear Selection
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs flex items-center"
              asChild
            >
              <CSVLink
                data={csvData}
                filename={`student-export-${new Date().toISOString().split('T')[0]}.csv`}
                className="flex items-center"
                headers={[
                  { label: 'Username', key: 'username' },
                  { label: 'Password', key: 'password' },
                  { label: 'Last Name', key: 'lname' },
                  { label: 'First Name', key: 'fname' },
                  { label: 'Email', key: 'email' },
                  { label: 'Course ID', key: 'courseid' },
                  { label: 'Course', key: 'course' },
                  { label: 'Section', key: 'section' },
                  { label: 'Parent Email', key: 'pemail' },
                  { label: 'Teacher First Name', key: 'teacherFirstName' },
                  { label: 'Teacher Last Name', key: 'teacherLastName' },
                  { label: 'Teacher Email', key: 'teacherEmail' },
                  { label: 'Student Type', key: 'studenttype' },
                  { label: 'Start Date', key: 'starting' },
                  { label: 'End Date', key: 'ending' },
                  { label: 'ASN', key: 'asn' } // Adding ASN to CSV headers
                ]}
              >
                <FileDown className="w-4 h-4 mr-1" />
                Export CSV
              </CSVLink>
            </Button>
          </div>
        )}
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
                onStudentSelect={() => handleCardClick(sortedStudents[index])}
                isSelected={selectedStudents.has(sortedStudents[index].id)}
                onSelectionChange={(checked) => handleStudentSelect(sortedStudents[index].id, checked)}
                courseInfo={courseInfo}
                courseTeachers={courseTeachers}
                courseSupportStaff={courseSupportStaff}
                teacherCategories={teacherCategories}
                user_email_key={user_email_key}
                isMobile={isMobile}
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
