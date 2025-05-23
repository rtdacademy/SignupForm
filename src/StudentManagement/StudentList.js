import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { CSVLink } from 'react-csv';
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "../components/ui/accordion";
import StudentCard from './StudentCard';
import { ChevronUp, ChevronDown, SortAsc, FileDown, RefreshCw, Database, ListChecks, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TutorialButton } from '../components/TutorialButton';
import CustomCSVExport from './CustomCSVExport';
import MassUpdateDialog from './Dialog/MassUpdateDialog';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { toast } from 'sonner';
import { parseStudentSummaryKey } from '../utils/sanitizeEmail';
import { COURSE_OPTIONS } from '../config/DropdownOptions';
import { useSchoolYear } from '../context/SchoolYearContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";

// Initialize Firebase Functions
const functions = getFunctions();

// Cloud Function call utilities
const batchUpdateNormalizedSchedules = async (data) => {
  const callable = httpsCallable(functions, 'batchUpdateNormalizedSchedulesV2');
  return callable(data);
};

const batchSyncStudentData = async (data) => {
  const callable = httpsCallable(functions, 'batchSyncStudentDataV2');
  return callable(data);
};

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
  showMultipleAsnsOnly,
  onToggleMultipleAsnsOnly
}) {
  const { getTeacherForCourse } = useAuth();
  const { asnsRecords } = useSchoolYear();
  const [sortKey, setSortKey] = useState('lastName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isMassUpdateDialogOpen, setIsMassUpdateDialogOpen] = useState(false);
  const checkboxRef = useRef(null);
  const [accordionValue, setAccordionValue] = useState("");
  const [userClickedAccordion, setUserClickedAccordion] = useState(false);

  // Check if any students have ASN issues
  const hasAsnIssues = useMemo(() => {
    if (!asnsRecords || !studentSummaries || studentSummaries.length === 0) return false;
    
    // Helper function to check if a student has multiple email keys for their ASN
    const hasMultipleEmailKeysForASN = (studentAsn) => {
      if (!studentAsn) return false;
      
      // Find the ASN record for this student
      const asnRecord = asnsRecords.find(record => record.id === studentAsn);
      
      // Check if the record exists and has emailKeys
      if (!asnRecord || !asnRecord.emailKeys) return false;
      
      // Count how many email keys have values set to true
      const trueKeysCount = Object.values(asnRecord.emailKeys)
        .filter(value => value === true)
        .length;
      
      // Return true if there are multiple keys set to true
      return trueKeysCount > 1;
    };

    // Return true if any student has multiple ASN email keys
    return studentSummaries.some(student => 
      student && student.asn && hasMultipleEmailKeysForASN(student.asn)
    );
  }, [studentSummaries, asnsRecords]);

  // Handle Batch Update for Normalized Schedules
  const handleBatchUpdateNormalizedSchedules = async () => {
    const selectedStudentsData = Array.from(selectedStudents)
      .map(id => {
        const student = studentSummaries.find(s => s.id === id);
        if (!student) return null;

        // Use our new helper function to properly parse the student key
        const { studentKey, courseId } = parseStudentSummaryKey(student.id);
        
        return {
          studentKey: studentKey,
          courseId: student.CourseID || courseId, // Prefer CourseID if available
        };
      })
      .filter(Boolean);

    if (selectedStudentsData.length === 0) {
      toast.error('No students selected', {
        duration: 3000
      });
      return;
    }

    // Show a loading toast that persists during the operation
    const loadingId = toast.loading(`Updating schedules for ${selectedStudentsData.length} students...`);

    try {
      const result = await batchUpdateNormalizedSchedules({ students: selectedStudentsData });
      console.log('Batch update result:', result);
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingId);
      toast.success(`Schedule update started`, {
        description: `Processing ${selectedStudentsData.length} students in background`,
        duration: 5000,
      });
    } catch (error) {
      console.error('Error during batch update:', error);
      
      // Dismiss loading toast and show error
      toast.dismiss(loadingId);
      toast.error('Failed to start batch update', {
        description: error.message || 'Please try again or contact support',
        duration: 5000,
      });
    }
  };

  // Handle Batch Sync for Student Data
  const handleBatchSyncStudentData = async () => {
    const selectedStudentsData = Array.from(selectedStudents)
      .map(id => {
        const student = studentSummaries.find(s => s.id === id);
        if (!student) return null;

        // Use our new helper function to properly parse the student key
        const { studentKey, courseId } = parseStudentSummaryKey(student.id);
        
        return {
          studentKey: studentKey,
          courseId: student.CourseID || courseId, // Prefer CourseID if available
        };
      })
      .filter(Boolean);

    if (selectedStudentsData.length === 0) {
      toast.error('No students selected', {
        duration: 3000
      });
      return;
    }

    // Show a loading toast that persists during the operation
    const loadingId = toast.loading(`Syncing data for ${selectedStudentsData.length} students...`);

    try {
      const result = await batchSyncStudentData({ students: selectedStudentsData });
      console.log('Batch sync result:', result);
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingId);
      toast.success(`Data sync started`, {
        description: `Processing ${selectedStudentsData.length} students in background`,
        duration: 5000,
      });
    } catch (error) {
      console.error('Error during batch sync:', error);
      
      // Dismiss loading toast and show error
      toast.dismiss(loadingId);
      toast.error('Failed to start data sync', {
        description: error.message || 'Please try again or contact support',
        duration: 5000,
      });
    }
  };

  // Apply filters and search using useMemo for performance optimization
  const filteredStudents = useMemo(() => {
    const normalizedSearchTerm = String(searchTerm || '').toLowerCase().trim();
    
    // Helper function to check if a student has multiple email keys for their ASN
    const hasMultipleEmailKeysForASN = (studentAsn) => {
      if (!studentAsn || !asnsRecords) return false;
      
      // Find the ASN record for this student
      const asnRecord = asnsRecords.find(record => record.id === studentAsn);
      
      // Check if the record exists and has emailKeys
      if (!asnRecord || !asnRecord.emailKeys) return false;
      
      // Count how many email keys have values set to true
      const trueKeysCount = Object.values(asnRecord.emailKeys)
        .filter(value => value === true)
        .length;
      
      // Return true if there are multiple keys set to true
      return trueKeysCount > 1;
    };
  
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
      
      // Check for multiple ASNs filter if enabled
      if (showMultipleAsnsOnly) {
        // Skip this student if they don't have an ASN or if their ASN doesn't have multiple email keys
        if (!student.asn || !hasMultipleEmailKeysForASN(student.asn)) {
          return false;
        }
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
        matchesFullName(student, normalizedSearchTerm) ||
        String(student.firstName || '').toLowerCase().includes(normalizedSearchTerm) ||
        String(student.preferredFirstName || '').toLowerCase().includes(normalizedSearchTerm) ||
        String(student.lastName || '').toLowerCase().includes(normalizedSearchTerm) ||
        String(student.StudentEmail || '').toLowerCase().includes(normalizedSearchTerm) ||
        String(student.ParentEmail || '').toLowerCase().includes(normalizedSearchTerm) || 
        normalizeASN(student.asn).includes(normalizeASN(searchTerm));
  
      return matchesFilters && matchesSearch;
    });
  }, [studentSummaries, filters, searchTerm, showMultipleAsnsOnly, asnsRecords]);


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

// Setup the indeterminate property on the checkbox AFTER sortedStudents is defined
useEffect(() => {
if (checkboxRef.current) {
  const isIndeterminate = selectedStudents.size > 0 && selectedStudents.size < sortedStudents.length;
  checkboxRef.current.indeterminate = isIndeterminate;
}
}, [selectedStudents, sortedStudents]);

// Auto-open accordion when students are selected, but don't override if user manually closed it
useEffect(() => {
if (selectedStudents.size > 0 && accordionValue === "" && !userClickedAccordion) {
  setAccordionValue("batch-actions");
}
}, [selectedStudents, accordionValue, userClickedAccordion]);

// Handle accordion toggle by user
const handleAccordionChange = (value) => {
setUserClickedAccordion(true);
setAccordionValue(value);
};

const sortOptions = [
{ value: 'lastName', label: 'Last Name' },
{ value: 'firstName', label: 'First Name' },
{ value: 'Status_Value', label: 'Status' },
{ value: 'Course_Value', label: 'Course' },
{ value: 'CurrentMark', label: 'Current Mark' },
{ value: 'School_x0020_Year_Value', label: 'School Year' },
{ value: 'StudentType_Value', label: 'Student Type' },
{ value: 'DiplomaMonthChoices_Value', label: 'Diploma Month' },
{ value: 'Term', label: 'Term' },
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
          ref={checkboxRef}
          checked={isAllSelected}
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
        {hasAsnIssues && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showMultipleAsnsOnly ? "secondary" : "outline"}
                  size="icon"
                  onClick={() => onToggleMultipleAsnsOnly()}
                  className="h-8 w-8"
                  aria-label={showMultipleAsnsOnly ? "Show all students" : "Show students with ASN issues only"}
                >
                  <Users className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {showMultipleAsnsOnly ? "Show all students" : "Show ASN issues only"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>

    {selectedStudents.size > 0 && (
      <div className="mt-2 w-full">
        <Accordion 
          type="single" 
          collapsible
          value={accordionValue}
          onValueChange={handleAccordionChange}
          className="border rounded-md"
        >
          <AccordionItem value="batch-actions" className="border-none">
            <AccordionTrigger className="px-3 py-2 hover:bg-gray-50">
              <div className="flex items-center text-sm font-medium">
                <ListChecks className="h-4 w-4 mr-2" />
                Batch Actions ({selectedStudents.size} students)
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 py-2 bg-gray-50">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onSelectedStudentsChange(new Set());
                    setUserClickedAccordion(false);
                  }}
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
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs flex items-center"
                  onClick={handleBatchUpdateNormalizedSchedules}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Update Schedules
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs flex items-center"
                  onClick={handleBatchSyncStudentData}
                >
                  <Database className="w-4 h-4 mr-1" />
                  Sync Student Data
                </Button>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <p>The system can process up to 3000 students in a single operation.</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
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