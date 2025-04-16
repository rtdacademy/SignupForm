import React, { useState, useMemo, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "../components/ui/card";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../components/ui/table";
import { 
  FileText, 
  Loader2, 
  AlertTriangle,
  ClipboardCheck,
  Code
} from 'lucide-react';
import { useSchoolYear } from '../context/SchoolYearContext';
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../components/ui/pagination";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { Checkbox } from "../components/ui/checkbox";
import { toast } from 'sonner';
// Import Firebase DB functionality
import { getDatabase, ref, update } from 'firebase/database';
import PasiActionButtons, { MultipleRecordsDisplay } from "../components/PasiActionButtons";

const ITEMS_PER_PAGE = 20;

// Helper function to check if a date value is valid and not empty
const isValidDateValue = (value) => {
  if (!value) return false;
  if (value === '-') return false;
  if (value === 'N/A') return false;
  if (value === '') return false;
  
  // If it's a timestamp that would result in an invalid date (like 0), it's not valid
  if (!isNaN(value) && new Date(parseInt(value)).getFullYear() < 1971) return false;
  
  return true;
};

// Function to get startDate based on available fields
const getStartDate = (record) => {
  // First check createdAt
  if (record.createdAt && isValidDateValue(record.createdAt)) {
    return {
      value: record.createdAt,
      source: 'createdAt',
      formatted: typeof record.createdAt === 'string' && !isNaN(Date.parse(record.createdAt))
    };
  } 
  // Then check Created (with capital C)
  else if (record.Created && isValidDateValue(record.Created)) {
    return {
      value: record.Created,
      source: 'Created',
      formatted: false // ISO date string, not a timestamp
    };
  } 
  // Then check created (with lowercase c)
  else if (record.created && isValidDateValue(record.created)) {
    return {
      value: record.created,
      source: 'created',
      formatted: false // ISO date string, not a timestamp
    };
  } 
  // Finally check assignmentDate
  else if (record.assignmentDate && isValidDateValue(record.assignmentDate)) {
    return {
      value: record.assignmentDate,
      source: 'assignmentDate',
      formatted: true // Already formatted correctly
    };
  }
  
  return {
    value: null,
    source: null,
    formatted: false
  };
};

// Format date for display with timezone handling
const formatDate = (dateValue, isFormatted = false) => {
  if (!isValidDateValue(dateValue)) return 'N/A';
  
  // If it's already formatted, return as is
  if (isFormatted && typeof dateValue === 'string') {
    return dateValue;
  }
  
  try {
    // Import from timeZoneUtils.js
    const { toEdmontonDate, toDateString } = require('../utils/timeZoneUtils');
    
    // Check if it's a numeric timestamp (as string or number)
    if (!isNaN(dateValue) && typeof dateValue !== 'object') {
      const date = toEdmontonDate(new Date(parseInt(dateValue)).toISOString());
      // Check if valid date
      if (!isNaN(date.getTime()) && date.getFullYear() >= 1971) {
        return toDateString(date);
      }
      return 'N/A';
    }
    
    // If it's a date object or ISO string
    const date = toEdmontonDate(dateValue);
    if (!isNaN(date.getTime()) && date.getFullYear() >= 1971) {
      return toDateString(date);
    }
    
    // Fallback for strings that may already be formatted
    if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateValue;
    }
    
    // Fallback
    return 'N/A';
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'N/A';
  }
};

// Format date for user-friendly display (e.g. "Jan 15, 2025")
const formatUserFriendlyDate = (dateValue, isFormatted = false) => {
  if (!isValidDateValue(dateValue)) return 'N/A';
  
  try {
    // Import from timeZoneUtils.js
    const { toEdmontonDate, formatDateForDisplay } = require('../utils/timeZoneUtils');
    
    // Get the standard formatted date first if needed
    let dateToFormat = dateValue;
    if (!isFormatted) {
      const isoDate = formatDate(dateValue, isFormatted);
      if (isoDate === 'N/A') return 'N/A';
      dateToFormat = isoDate;
    }
    
    // Use the Edmonton-specific date formatting
    const edmontonDate = toEdmontonDate(dateToFormat);
    if (!edmontonDate) return 'N/A';
    
    // Format date in Edmonton timezone
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return edmontonDate.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error("Error formatting user-friendly date:", error);
    return 'N/A';
  }
};

const MissingPasi = () => {
  // Get unmatchedStudentSummaries from context
  const { unmatchedStudentSummaries, isLoadingStudents } = useSchoolYear();
  
  // State for selected record
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  // Toggle for showing raw data
  const [showRawData, setShowRawData] = useState(true);
  
  // State for pagination and sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [sortState, setSortState] = useState({ column: 'studentName', direction: 'asc' });
  
  // Function to update records in Firebase
  const updateRecordField = (record, field, value) => {
    if (!record.id) {
      toast.error("Cannot update: Missing record id");
      return;
    }
    const db = getDatabase();
    const summaryRef = ref(db, `/studentCourseSummaries/${record.id}`);
    const updates = {};
    updates[field] = value;
    update(summaryRef, updates)
      .then(() => {
        toast.success(`Updated ${field} successfully`);
      })
      .catch((error) => {
        console.error(`Error updating ${field}:`, error);
        toast.error(`Failed to update ${field}`);
      });
  };
  
  // Handle Staff Review checkbox change
  const handleStaffReviewChange = (checked, record, e) => {
    if (e) e.stopPropagation(); // Prevent row selection
    updateRecordField(record, 'staffReview', checked);
  };

  // Process the records with proper date formatting
  const processedRecords = useMemo(() => {
    if (!unmatchedStudentSummaries) return [];
    return unmatchedStudentSummaries
      .filter(record => (record.StudentEmail || record.email) !== '000kyle.e.brown13@gmail.com')
      .filter(record => record.Status_Value !== '✗ Removed (Not Funded)' && record.Status_Value !== 'Unenrolled')
      .map(record => {
        // Registration date: prefer createdAt, fallback to Created
        let regDate = record.createdAt || record.Created || '';
        // Format all date fields in a friendly way
        const formatFriendly = (date) => date ? formatUserFriendlyDate(date) : 'N/A';
        return {
          ...record,
          lastName: record.lastName || '',
          firstName: record.firstName || '',
          studentType: record.StudentType_Value || record.studentType_Value || '',
          regDateFormatted: formatFriendly(regDate),
          studentEmail: record.StudentEmail || record.email || '',
          statusValue: record.Status_Value || '',
          scheduleStart: formatFriendly(record.ScheduleStartDate),
          scheduleEnd: formatFriendly(record.ScheduleEndDate),
          state: record.ActiveFutureArchived_Value || '',
          schoolYear: record.School_x0020_Year_Value || '',
          courseValue: record.Course_Value || '',
        };
      });
  }, [unmatchedStudentSummaries]);

  // Handle record selection
  const handleRecordSelect = (record) => {
    setSelectedRecord(record);
  };

  // Handle column sorting
  const handleSort = (column) => {
    setSortState(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  };

  // Handle copy to clipboard for any cell content
  const handleCellClick = (content, label) => {
    if (!content || content === 'N/A') return;
    
    navigator.clipboard.writeText(content);
    
    // Truncate long content for toast message
    const displayText = content.length > 25 ? `${content.substring(0, 25)}...` : content;
    toast.success(`Copied ${label ? label + ': ' : ''}${displayText}`);
  };

  // Copy record to clipboard as JSON
  const copyRecordToClipboard = (record) => {
    const recordStr = JSON.stringify(record, null, 2);
    navigator.clipboard.writeText(recordStr);
    toast.success("Record data copied to clipboard as JSON");
  };

  // Get local sorted results from processed records
  const sortedRecords = useMemo(() => {
    return [...processedRecords].sort((a, b) => {
      let aValue = a[sortState.column] || '';
      let bValue = b[sortState.column] || '';

      // For numeric fields
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortState.direction === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      }
      
      // For string fields
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        // Special case for date sorting
        if (sortState.column === 'exitDate' || sortState.column === 'startDateFormatted') {
          const dateA = aValue ? new Date(aValue).getTime() : 0;
          const dateB = bValue ? new Date(bValue).getTime() : 0;
          return sortState.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }
        return sortState.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      // Fallback comparison
      return sortState.direction === 'asc' 
        ? (aValue > bValue ? 1 : -1) 
        : (aValue < bValue ? 1 : -1);
    });
  }, [processedRecords, sortState]);

  // Paginate records
  const paginatedRecords = useMemo(() => {
    const totalPages = Math.ceil(sortedRecords.length / ITEMS_PER_PAGE) || 1;
    const validPage = Math.min(currentPage, totalPages);
    
    if (validPage !== currentPage) {
      setCurrentPage(validPage);
    }
    
    const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sortedRecords.slice(startIndex, endIndex);
  }, [sortedRecords, currentPage]);

  const totalPages = useMemo(() => 
    Math.ceil(sortedRecords.length / ITEMS_PER_PAGE) || 1, 
    [sortedRecords]
  );

  // Function to generate a consistent color for a student based on initials
  const getColorForName = (fullName) => {
    if (!fullName) return { backgroundColor: '#f3f4f6', textColor: '#374151' }; // Default gray
    
    // Extract first and last name
    const nameParts = fullName.split(', ');
    const lastName = nameParts[0] || '';
    const firstName = nameParts.length > 1 ? nameParts[1] : '';
    
    // Get first characters and convert to uppercase
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    
    // Convert to character codes and use for HSL values
    const firstCharCode = firstInitial.charCodeAt(0);
    const lastCharCode = lastInitial.charCodeAt(0);
    
    // Generate a hue value between 0 and 360 based on the initials
    const hue = ((firstCharCode * 11 + lastCharCode * 17) % 360);
    
    // Other HSL values for a consistent, readable palette
    const saturation = 85;  // Fairly saturated
    const lightness = 87;   // Light background for readability
    const textLightness = 30;   // Darker text for contrast
    
    return {
      backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
      textColor: `hsl(${hue}, ${saturation}%, ${textLightness}%)`
    };
  };

  // Sortable table header component
  const SortableHeader = ({ column, label }) => {
    const isActive = sortState.column === column;
    
    return (
      <TableHead 
        className="cursor-pointer hover:bg-muted/50 transition-colors text-xs px-2 py-1" 
        onClick={() => handleSort(column)}
      >
        <div className="flex items-center">
          {label}
          <span className="ml-1 inline-flex">
            {isActive && (
              sortState.direction === 'asc' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                  <path d="m5 12 7-7 7 7"/>
                  <path d="m5 19 7-7 7 7"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                  <path d="m19 5-7 7-7-7"/>
                  <path d="m19 12-7 7-7-7"/>
                </svg>
              )
            )}
          </span>
        </div>
      </TableHead>
    );
  };

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            />
          </PaginationItem>
          
          {/* Logic to show appropriate page numbers */}
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let pageToShow;
            
            if (totalPages <= 7) {
              pageToShow = i + 1;
            } else if (currentPage <= 4) {
              if (i < 5) {
                pageToShow = i + 1;
              } else if (i === 5) {
                return (
                  <PaginationItem key="ellipsis-start">
                    <span className="px-2">...</span>
                  </PaginationItem>
                );
              } else {
                pageToShow = totalPages;
              }
            } else if (currentPage >= totalPages - 3) {
              if (i === 0) {
                pageToShow = 1;
              } else if (i === 1) {
                return (
                  <PaginationItem key="ellipsis-end">
                    <span className="px-2">...</span>
                  </PaginationItem>
                );
              } else {
                pageToShow = totalPages - (6 - i);
              }
            } else {
              if (i === 0) {
                pageToShow = 1;
              } else if (i === 1) {
                return (
                  <PaginationItem key="ellipsis-start">
                    <span className="px-2">...</span>
                  </PaginationItem>
                );
              } else if (i === 5) {
                return (
                  <PaginationItem key="ellipsis-end">
                    <span className="px-2">...</span>
                  </PaginationItem>
                );
              } else if (i === 6) {
                pageToShow = totalPages;
              } else {
                pageToShow = currentPage + (i - 3);
              }
            }
            
            return (
              <PaginationItem key={pageToShow}>
                <PaginationLink
                  isActive={currentPage === pageToShow}
                  onClick={() => setCurrentPage(pageToShow)}
                >
                  {pageToShow}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNext
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <TooltipProvider>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <FileText className="mr-2" /> Missing PASI Records
        </h1>
        
        {/* Main content */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex gap-2">
            <Badge variant="destructive" className="font-normal text-sm py-1">
              <AlertTriangle className="h-4 w-4 mr-1" /> Missing PASI Records: {sortedRecords?.length || 0}
            </Badge>
          </div>
          
          {/* Show Raw Data Toggle */}
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowRawData(!showRawData)}
              className="flex items-center gap-1"
            >
              <Code className="h-4 w-4" />
              {showRawData ? "Hide Raw Data" : "Show Raw Data"}
            </Button>
          </div>
        </div>
    
        {/* Missing PASI Records Table */}
        <div className="bg-white rounded-lg shadow-md p-4 overflow-x-auto">
          {isLoadingStudents ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
              <span>Loading records...</span>
            </div>
          ) : paginatedRecords && paginatedRecords.length > 0 ? (
            <>
              {/* Raw Data Display Above Table */}
              {showRawData && (
                <div className="mb-4 p-4 border rounded bg-gray-50 overflow-auto max-h-40">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium">Sample Record Data Structure</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyRecordToClipboard(paginatedRecords[0])}
                      className="text-xs"
                    >
                      Copy JSON
                    </Button>
                  </div>
                  <pre className="text-xs overflow-auto whitespace-pre-wrap">
                    {JSON.stringify(paginatedRecords[0], null, 2)}
                  </pre>
                </div>
              )}
            
              <Table className="text-xs w-full">
                <TableCaption className="text-xs">Students with Missing PASI Records</TableCaption>
                <TableHeader>
                  <TableRow>
                    <SortableHeader column="asn" label="ASN" />
                    <SortableHeader column="lastName" label="Last Name" />
                    <SortableHeader column="firstName" label="First Name" />
                    <SortableHeader column="studentType" label="Student Type" />
                    <SortableHeader column="regDateFormatted" label="Registration Date" />
                    <SortableHeader column="studentEmail" label="Student Email" />
                    <SortableHeader column="statusValue" label="Status" />
                    <SortableHeader column="scheduleStart" label="Schedule Start" />
                    <SortableHeader column="scheduleEnd" label="Schedule End" />
                    <SortableHeader column="state" label="State" />
                    <SortableHeader column="schoolYear" label="School Year" />
                    <SortableHeader column="courseValue" label="Course" />
                    <TableHead className="px-1 py-1 text-xs w-6 max-w-6" title="Staff Review">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <ClipboardCheck className="h-3 w-3" />
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>Staff Review</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRecords.map((record) => (
                    <TableRow key={record.id || record.asn}>
                      <TableCell onClick={(e) => { e.stopPropagation(); handleCellClick(record.asn, "ASN"); }}>{record.asn || 'N/A'}</TableCell>
                      <TableCell onClick={(e) => { e.stopPropagation(); handleCellClick(record.lastName, "Last Name"); }}>{record.lastName || 'N/A'}</TableCell>
                      <TableCell onClick={(e) => { e.stopPropagation(); handleCellClick(record.firstName, "First Name"); }}>{record.firstName || 'N/A'}</TableCell>
                      <TableCell onClick={(e) => { e.stopPropagation(); handleCellClick(record.studentType, "Student Type"); }}>{record.studentType || 'N/A'}</TableCell>
                      <TableCell onClick={(e) => { e.stopPropagation(); handleCellClick(record.regDateFormatted, "Registration Date"); }}>{record.regDateFormatted || 'N/A'}</TableCell>
                      <TableCell onClick={(e) => { e.stopPropagation(); handleCellClick(record.studentEmail, "Student Email"); }}>{record.studentEmail || 'N/A'}</TableCell>
                      <TableCell onClick={(e) => { e.stopPropagation(); handleCellClick(record.statusValue, "Status"); }}>{record.statusValue || 'N/A'}</TableCell>
                      <TableCell onClick={(e) => { e.stopPropagation(); handleCellClick(record.scheduleStart, "Schedule Start"); }}>{record.scheduleStart || 'N/A'}</TableCell>
                      <TableCell onClick={(e) => { e.stopPropagation(); handleCellClick(record.scheduleEnd, "Schedule End"); }}>{record.scheduleEnd || 'N/A'}</TableCell>
                      <TableCell onClick={(e) => { e.stopPropagation(); handleCellClick(record.state, "State"); }}>{record.state || 'N/A'}</TableCell>
                      <TableCell onClick={(e) => { e.stopPropagation(); handleCellClick(record.schoolYear, "School Year"); }}>{record.schoolYear || 'N/A'}</TableCell>
                      <TableCell onClick={(e) => { e.stopPropagation(); handleCellClick(record.courseValue, "Course"); }}>{record.courseValue || 'N/A'}</TableCell>
                      <TableCell className="p-0 w-6 max-w-6">
                        <div onClick={(e) => e.stopPropagation()} className="flex justify-center">
                          <Checkbox 
                            checked={record.staffReview === true}
                            onCheckedChange={(checked) => handleStaffReviewChange(checked, record)}
                            className="h-4 w-4 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            aria-label="Staff Review Checkbox"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <PasiActionButtons asn={record.asn} referenceNumber={record.referenceNumber} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              {unmatchedStudentSummaries && unmatchedStudentSummaries.length > 0 
                ? 'No matching records found.' 
                : 'No missing PASI records found for the current school year.'}
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {renderPagination()}

        {/* Record details display for selected record */}
        {selectedRecord && (
          <Card className="mt-4">
            <CardHeader className="py-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" /> 
                Missing PASI Record Details
                <Badge variant="destructive" className="ml-2">
                  <AlertTriangle className="h-3 w-3 mr-1" /> Not Found in PASI
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                {selectedRecord.studentName} - {selectedRecord.courseCode} ({selectedRecord.courseDescription})
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2 text-sm">Student Information</h3>
                  <dl className="grid grid-cols-[1fr_2fr] gap-1">
                    <dt className="font-medium text-gray-500">ASN:</dt>
                    <dd className="cursor-pointer hover:text-blue-600" onClick={() => handleCellClick(selectedRecord.asn, "ASN")}>{selectedRecord.asn || 'N/A'}</dd>
                    
                    <dt className="font-medium text-gray-500">Name:</dt>
                    <dd className="cursor-pointer hover:text-blue-600" onClick={() => handleCellClick(selectedRecord.studentName, "Name")}>{selectedRecord.studentName || 'N/A'}</dd>
                    
                    <dt className="font-medium text-gray-500">Email:</dt>
                    <dd className="cursor-pointer hover:text-blue-600" onClick={() => handleCellClick(selectedRecord.email, "Email")}>{selectedRecord.email || 'N/A'}</dd>
                    
                    <dt className="font-medium text-gray-500">Student Type:</dt>
                    <dd>{selectedRecord.studentType_Value || 'N/A'}</dd>
                    
                    <dt className="font-medium text-gray-500">School Year:</dt>
                    <dd>{selectedRecord.schoolYear || selectedRecord.School_x0020_Year_Value || 'N/A'}</dd>
                    
                    <dt className="font-medium text-gray-500">Registration Date:</dt>
                    <dd className="cursor-pointer hover:text-blue-600" onClick={() => handleCellClick(selectedRecord.startDateFormatted, "Registration Date")}>
                      {selectedRecord.startDateFormatted && selectedRecord.startDateFormatted !== 'N/A' ? 
                        formatUserFriendlyDate(selectedRecord.startDateFormatted, true) : 'N/A'}
                    </dd>
                  </dl>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2 text-sm">Course Information</h3>
                  <dl className="grid grid-cols-[1fr_2fr] gap-1">
                    <dt className="font-medium text-gray-500">Course Code:</dt>
                    <dd className="cursor-pointer hover:text-blue-600" onClick={() => handleCellClick(selectedRecord.courseCode, "Course Code")}>{selectedRecord.courseCode || 'N/A'}</dd>
                    
                    <dt className="font-medium text-gray-500">Description:</dt>
                    <dd>{selectedRecord.courseDescription || 'N/A'}</dd>
                    
                    <dt className="font-medium text-gray-500">Term:</dt>
                    <dd className="cursor-pointer hover:text-blue-600" onClick={() => handleCellClick(selectedRecord.term, "Term")}>
                      <Badge className="text-xs py-0 px-1.5">{selectedRecord.term || 'N/A'}</Badge>
                    </dd>
                    
                    <dt className="font-medium text-gray-500">Status:</dt>
                    <dd className="cursor-pointer hover:text-blue-600" onClick={() => handleCellClick(selectedRecord.status, "Status")}>
                      <Badge 
                        variant={selectedRecord.status === 'Completed' ? 'success' : 'secondary'}
                        className={`
                          text-xs py-0 px-1.5
                          ${selectedRecord.status === 'Completed' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : selectedRecord.status === 'Active'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }
                        `}
                      >
                        {selectedRecord.status || 'N/A'}
                      </Badge>
                    </dd>
                    
                    <dt className="font-medium text-gray-500">Grade:</dt>
                    <dd className="cursor-pointer hover:text-blue-600" onClick={() => handleCellClick(selectedRecord.value, "Grade")}>
                      {selectedRecord.value && selectedRecord.value !== '-' ? selectedRecord.value : 'N/A'}
                    </dd>
                    
                    <dt className="font-medium text-gray-500">Exit Date:</dt>
                    <dd className="cursor-pointer hover:text-blue-600" onClick={() => handleCellClick(selectedRecord.exitDateFormatted || selectedRecord.exitDate, "Exit Date")}>
                      {selectedRecord.exitDateFormatted && selectedRecord.exitDateFormatted !== 'N/A' ? 
                        formatUserFriendlyDate(selectedRecord.exitDateFormatted, true) : 'N/A'}
                    </dd>
                  </dl>
                </div>
              </div>
              
              {/* Full Record Data Display */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-sm">Complete Record Data</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyRecordToClipboard(selectedRecord)}
                  >
                    <Code className="h-3 w-3 mr-1" /> Copy JSON
                  </Button>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3 overflow-auto max-h-80">
                  <pre className="text-xs whitespace-pre-wrap">
                    {JSON.stringify(selectedRecord, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 py-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedRecord(null)}
              >
                Close
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
};

export default MissingPasi;