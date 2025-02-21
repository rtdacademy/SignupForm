import React, { useState, useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { CSVLink } from 'react-csv';
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import StudentCard from './StudentCard';
import { ChevronUp, ChevronDown, SortAsc, FileDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TutorialButton } from '../components/TutorialButton';
import CustomCSVExport from './CustomCSVExport';
import MassUpdateDialog from './Dialog/MassUpdateDialog';

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
  categoryTypes,
  user_email_key,
  selectedStudents,
  onSelectedStudentsChange,
  isMobile,
  onCourseRemoved,
  studentAsns, 
}) {
  const { getTeacherForCourse } = useAuth();
  const [sortKey, setSortKey] = useState('lastName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isMassUpdateDialogOpen, setIsMassUpdateDialogOpen] = useState(false); 
  // Apply filters and search using useMemo for performance optimization
  
 // Inside the useMemo for filteredStudents in StudentList component
 const filteredStudents = useMemo(() => {
  const normalizedSearchTerm = String(searchTerm || '').toLowerCase().trim();

  // Helper function to normalize ASN for comparison
  const normalizeASN = (asn) => {
    if (!asn) return '';
    // Remove hyphens and convert to lowercase
    return asn.replace(/-/g, '').toLowerCase();
  };

  // Helper function to check full name matches
  const matchesFullName = (student, searchTerm) => {
    // Create both possible full name combinations
    const firstNameLastName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase().trim();
    const preferredFirstNameLastName = `${student.preferredFirstName || student.firstName || ''} ${student.lastName || ''}`.toLowerCase().trim();
    
    // Check if search term matches either combination
    return firstNameLastName.includes(searchTerm) || 
           preferredFirstNameLastName.includes(searchTerm);
  };


  return studentSummaries.filter((student) => {
    // Basic validation - skip invalid student records
    if (!student || 
      typeof student.firstName === 'undefined' || 
      typeof student.lastName === 'undefined' || 
      !student.StudentEmail) {
    console.warn('Skipping invalid student record:', student);
    return false;
  }

    // Helper function to compare dates
    const compareDates = (studentDate, filterDate) => {
      if (!studentDate || !filterDate) return false;
      const studentDateTime = new Date(studentDate).getTime();
      const filterDateTime = new Date(filterDate).getTime();
      return !isNaN(studentDateTime) && !isNaN(filterDateTime) ? { studentDateTime, filterDateTime } : false;
    };

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
          const createdFilter = filters.dateFilters.created;
          
          if (createdFilter.between) {
            const startComparison = compareDates(student.Created, createdFilter.between.start);
            const endComparison = compareDates(student.Created, createdFilter.between.end);
            
            if (!startComparison || !endComparison) return false;
            
            return startComparison.studentDateTime >= startComparison.filterDateTime && 
                   endComparison.studentDateTime <= endComparison.filterDateTime;
          }
          
          if (createdFilter.after) {
            const comparison = compareDates(student.Created, createdFilter.after);
            return comparison && comparison.studentDateTime >= comparison.filterDateTime;
          }
          
          if (createdFilter.before) {
            const comparison = compareDates(student.Created, createdFilter.before);
            return comparison && comparison.studentDateTime <= comparison.filterDateTime;
          }
        }

        // Handle Schedule Start date filters
        if (filters.dateFilters.scheduleStart) {
          const startFilter = filters.dateFilters.scheduleStart;
          
          if (startFilter.between) {
            const startComparison = compareDates(student.ScheduleStartDate, startFilter.between.start);
            const endComparison = compareDates(student.ScheduleStartDate, startFilter.between.end);
            
            if (!startComparison || !endComparison) return false;
            
            return startComparison.studentDateTime >= startComparison.filterDateTime && 
                   endComparison.studentDateTime <= endComparison.filterDateTime;
          }
          
          if (startFilter.after) {
            const comparison = compareDates(student.ScheduleStartDate, startFilter.after);
            return comparison && comparison.studentDateTime >= comparison.filterDateTime;
          }
          
          if (startFilter.before) {
            const comparison = compareDates(student.ScheduleStartDate, startFilter.before);
            return comparison && comparison.studentDateTime <= comparison.filterDateTime;
          }
        }

        // Handle Schedule End date filters
        if (filters.dateFilters.scheduleEnd) {
          const endFilter = filters.dateFilters.scheduleEnd;
          
          if (endFilter.between) {
            const startComparison = compareDates(student.ScheduleEndDate, endFilter.between.start);
            const endComparison = compareDates(student.ScheduleEndDate, endFilter.between.end);
            
            if (!startComparison || !endComparison) return false;
            
            return startComparison.studentDateTime >= startComparison.filterDateTime && 
                   endComparison.studentDateTime <= endComparison.filterDateTime;
          }
          
          if (endFilter.after) {
            const comparison = compareDates(student.ScheduleEndDate, endFilter.after);
            return comparison && comparison.studentDateTime >= comparison.filterDateTime;
          }
          
          if (endFilter.before) {
            const comparison = compareDates(student.ScheduleEndDate, endFilter.before);
            return comparison && comparison.studentDateTime <= comparison.filterDateTime;
          }
        }

        return true;
      }

      // Handle CourseID specifically
      if (filterKey === 'CourseID') {
        if (!Array.isArray(filters[filterKey]) || filters[filterKey].length === 0) return true;
        return filters[filterKey].includes(String(student.CourseID));
      }

      // Handle regular array-based filters
      if (!Array.isArray(filters[filterKey])) return true;
      if (filters[filterKey].length === 0) return true;
      
      // Skip Course_Value since we're using CourseID now
      if (filterKey === 'Course_Value') return true;
      
      const studentValue = String(student[filterKey] || '').toLowerCase();
      return filters[filterKey].some(
        (filterValue) => String(filterValue).toLowerCase() === studentValue
      );
    });

    // Handle search term
    const matchesSearch =
      !normalizedSearchTerm || 
      matchesFullName(student, normalizedSearchTerm) || // Check full name combinations
      String(student.firstName || '').toLowerCase().includes(normalizedSearchTerm) ||
      String(student.preferredFirstName || '').toLowerCase().includes(normalizedSearchTerm) ||
      String(student.lastName || '').toLowerCase().includes(normalizedSearchTerm) ||
      String(student.StudentEmail || '').toLowerCase().includes(normalizedSearchTerm) ||
      String(student.ParentEmail || '').toLowerCase().includes(normalizedSearchTerm) || 
      normalizeASN(student.asn).includes(normalizeASN(searchTerm));

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
          Status_Value: student.Status_Value || '',
          section: formatSection(student.section),
          pemail: student.ParentEmail || '',
          teacherFirstName: teacher ? teacher.firstName : '',
          teacherLastName: teacher ? teacher.lastName : '',
          teacherEmail: teacher ? teacher.email : '',
          studenttype: student.StudentType_Value || '',
          starting: formatDate(student.ScheduleStartDate),
          ending: formatDate(student.ScheduleEndDate),
          asn: student.asn || '', 
          DiplomaMonthChoices_Value: student.DiplomaMonthChoices_Value || '',
          LMSStudentID: student.LMSStudentID || '',
          StudentPhone: student.StudentPhone || '',
          School_x0020_Year_Value: student.School_x0020_Year_Value || '',
          ParentFirstName: student.ParentFirstName || '',
          ParentLastName: student.ParentLastName || '',
          ParentPhone_x0023_: student.ParentPhone_x0023_ || '',
          lastUpdated: student.lastUpdated ? 
            new Date(student.lastUpdated).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : '',
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
            <TutorialButton 
          tutorialId="student-selection" 
          tooltipText="Learn about student selection" 
        />
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
      onClick={() => setIsExportDialogOpen(true)}
    >
      <FileDown className="w-4 h-4 mr-1" />
      Export CSV
    </Button>
    <Button
      variant="outline"
      size="sm"
      className="text-xs flex items-center"
      onClick={() => setIsMassUpdateDialogOpen(true)}
    >
      Mass Update
    </Button>
  </div>
)}
      </div>

      {/* Student List Section */}
      <div className="flex-1 overflow-auto">
      <Virtuoso
  style={{ height: '100%' }}
  totalCount={sortedStudents.length}
  itemContent={(index) => {
    const student = sortedStudents[index];
    return (
      <div className="px-2" key={student.id}>
        <StudentCard
          key={student.id}
          student={student}
          index={index}
          selectedStudentId={selectedStudentId}
          onStudentSelect={() => handleCardClick(student)}
          isSelected={selectedStudents.has(student.id)}
          onSelectionChange={(checked) => handleStudentSelect(student.id, checked)}
          courseInfo={courseInfo}
          courseTeachers={courseTeachers}
          courseSupportStaff={courseSupportStaff}
          teacherCategories={teacherCategories}
          categoryTypes={categoryTypes} 
          user_email_key={user_email_key}
          isMobile={isMobile}
          onCourseRemoved={onCourseRemoved}
          studentAsns={studentAsns} 
        />
      </div>
    );
  }}
  components={{
    EmptyPlaceholder: () => (
      <p className="text-center text-gray-500 py-4">No students match the selected filters.</p>
    ),
  }}
/>
      </div>
      <CustomCSVExport
  isOpen={isExportDialogOpen}
  onClose={() => setIsExportDialogOpen(false)}
  data={csvData}
/>

<MassUpdateDialog
  isOpen={isMassUpdateDialogOpen}
  onClose={() => setIsMassUpdateDialogOpen(false)}
  selectedStudents={Array.from(selectedStudents).map(id => 
    studentSummaries.find(student => student.id === id)
  ).filter(Boolean)}
  teacherCategories={teacherCategories}
  categoryTypes={categoryTypes}
  user_email_key={user_email_key}
/>


    </div>
  );
}

export default StudentList;
