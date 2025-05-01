import React, { useState, useMemo } from 'react';
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
  AlertTriangle, 
  Loader2,
  Code,
  FileText,
  Filter,
  Mail,
  Info
} from 'lucide-react';
import { useSchoolYear } from '../context/SchoolYearContext';
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Checkbox } from "../components/ui/checkbox";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "../components/ui/pagination";
import { toast } from 'sonner';
import { getDatabase, ref, update } from 'firebase/database';
import PasiActionButtons from "../components/PasiActionButtons";
import { COURSE_CODE_TO_ID } from '../config/DropdownOptions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";

const ITEMS_PER_PAGE = 20;

// Format date for user-friendly display (e.g. "Jan 15, 2025")
const formatUserFriendlyDate = (dateValue) => {
  if (!dateValue || dateValue === '-' || dateValue === 'N/A' || dateValue === '') return 'N/A';
  
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'N/A';
    
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'N/A';
  }
};

const MissingYourWay = () => {
  // Get required data from context
  const { 
    pasiStudentSummariesCombined, 
    studentSummaries, 
    asnsRecords, 
    isLoadingStudents 
  } = useSchoolYear();
  
  // State for selected record
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  // Toggle for showing raw data
  const [showRawData, setShowRawData] = useState(false);
  
  // Toggle for filtering completed courses with specific courseIds
  const [filterCompletedCourses, setFilterCompletedCourses] = useState(true);
  
  // Toggle for showing coding courses (CourseID: 1111)
  const [includeCoding, setIncludeCoding] = useState(false);
  
  // State for pagination and sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [sortState, setSortState] = useState({ column: 'studentName', direction: 'asc' });
  
  // Function to update student summary record in Firebase
  const updateMissingYourWayStatus = (recordId, isChecked) => {
    if (!recordId) {
      toast.error("Cannot update: Missing record id");
      return;
    }
    const db = getDatabase();
    const recordRef = ref(db, `/pasiRecords/${recordId}`);
    const updates = {
      MissingYourWayChecked: isChecked
    };
    
    update(recordRef, updates)
      .then(() => {
        toast.success(`Updated missing YourWay status successfully`);
      })
      .catch((error) => {
        console.error(`Error updating missing YourWay status:`, error);
        toast.error(`Failed to update missing YourWay status`);
      });
  };

  // Create a mapping of ASNs to their emailKeys from asnsRecords
  const asnToEmailKeysMap = useMemo(() => {
    const map = {};
    
    asnsRecords.forEach(record => {
      if (record.id && record.emailKeys) {
        map[record.id] = Object.keys(record.emailKeys);
      }
    });
    
    return map;
  }, [asnsRecords]);

  // Create a mapping of courseCode to courseId
  const courseCodeToIdMap = useMemo(() => {
    return COURSE_CODE_TO_ID || {};
  }, []);

  // Find student summary records with alternative emails for the same ASN
  const findAlternativeEmailRecords = useMemo(() => {
    const alternativeRecordsMap = {};
    
    pasiStudentSummariesCombined.forEach(record => {
      if (!record.asn) return;
      
      const emailKeys = asnToEmailKeysMap[record.asn] || [];
      if (emailKeys.length <= 1) return;
      
      // For the current record, find alternative emailKeys
      const currentEmail = record.email || record.StudentEmail || '';
      const alternativeEmails = emailKeys.filter(email => email !== currentEmail);
      
      if (alternativeEmails.length === 0) return;
      
      // Try to find existing summaries for these alternative emails
      // with matching course data
      const courseId = courseCodeToIdMap[record.courseCode] || '';
      const alternativeSummaries = [];
      
      alternativeEmails.forEach(email => {
        // Summary key format is {emailKey}_{courseId}
        const potentialSummaryKey = `${email}_${courseId}`;
        
        // Look for matching summaries
        const matchingSummaries = studentSummaries.filter(summary => 
          summary.id === potentialSummaryKey ||
          (summary.StudentEmail === email && summary.CourseID === courseId)
        );
        
        if (matchingSummaries.length > 0) {
          alternativeSummaries.push(...matchingSummaries.map(summary => ({
            email: email,
            summary: summary
          })));
        }
      });
      
      if (alternativeSummaries.length > 0) {
        alternativeRecordsMap[record.id || record.referenceNumber] = {
          alternativeEmails,
          alternativeSummaries
        };
      }
    });
    
    return alternativeRecordsMap;
  }, [pasiStudentSummariesCombined, asnToEmailKeysMap, studentSummaries, courseCodeToIdMap]);

  // Process the records with filtering
  const processedRecords = useMemo(() => {
    // First filter for records with null or "missing" StudentType_Value
    let filteredRecords = pasiStudentSummariesCombined.filter(record => 
      record.StudentType_Value === null || record.StudentType_Value === "missing"
    );

    // Apply conditional filtering for coding courses (CourseID: 1111 or 2000)
    if (!includeCoding) {
      // Filter out records with courseId values of 1111 or 2000
      filteredRecords = filteredRecords.filter(record => {
        const courseId = COURSE_CODE_TO_ID[record.courseCode];
        // Keep the record only if courseId is NOT 1111 or 2000
        return courseId !== 1111 && courseId !== 2000;
      });
    }

    // Apply additional filters if toggle is on
    if (filterCompletedCourses) {
      filteredRecords = filteredRecords.filter(record => {
        // Keep the record if it's not completed
        if (record.status !== 'Completed') {
          return true;
        }

        // If it's completed, check if the courseCode maps to courseId 1111 or 2000
        const courseId = COURSE_CODE_TO_ID[record.courseCode];
        
        // If we're including coding courses, no need to filter them out
        if (includeCoding) {
          return true;
        }
        
        // Keep the record if courseId is NOT 1111 or 2000
        // (i.e., filter out completed courses with courseId 1111 or 2000)
        return courseId !== 1111 && courseId !== 2000;
      });
    }

    return filteredRecords.map(record => {
      const recordId = record.id || record.referenceNumber;
      const hasAlternativeRecords = recordId in findAlternativeEmailRecords;
      
      return {
        ...record,
        asn: record.asn || '',
        studentName: record.studentName || '',
        courseCode: record.courseCode || '',
        status: record.status || '',
        email: record.email || '',
        pasiTerm: record.pasiTerm || record.term || '', 
        referenceNumber: record.referenceNumber || '',
        courseDescription: record.courseDescription || '',
        exitDate: formatUserFriendlyDate(record.exitDate),
        lastUpdated: formatUserFriendlyDate(record.lastUpdated),
        hasAlternativeRecords,
        alternativeRecordsInfo: hasAlternativeRecords ? findAlternativeEmailRecords[recordId] : null
      };
    });
  }, [pasiStudentSummariesCombined, filterCompletedCourses, includeCoding, findAlternativeEmailRecords]);

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

      // For string fields
      if (typeof aValue === 'string' && typeof bValue === 'string') {
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
          
          {/* Page numbers logic */}
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

  // Render alternative email records info
  const renderAlternativeEmailInfo = (record) => {
    if (!record.hasAlternativeRecords) return null;
    
    const { alternativeEmails, alternativeSummaries } = record.alternativeRecordsInfo;
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200"
            >
              <Mail className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="text-xs p-1">
              <p className="font-medium mb-1">Found {alternativeSummaries.length} record(s) with alternative email(s):</p>
              <ul className="list-disc list-inside">
                {alternativeSummaries.map((item, idx) => (
                  <li key={idx}>
                    <span className="font-semibold">{item.email}</span>
                    {item.summary.StudentType_Value && (
                      <span className="ml-1">
                        (Student Type: <span className="font-medium">{item.summary.StudentType_Value}</span>)
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="container mx-auto p-4">
      {/* Main content */}
      <div className="mb-4 flex justify-between items-center">
        {/* Toggles */}
        <div className="flex gap-2">
          {/* Filter Toggle */}
          <Button 
            variant={filterCompletedCourses ? "default" : "outline"} 
            size="sm" 
            onClick={() => setFilterCompletedCourses(!filterCompletedCourses)}
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            {filterCompletedCourses ? "Filtering Completed Courses" : "Show All Courses"}
          </Button>
          
          {/* Coding Courses Toggle */}
          <Button 
            variant={includeCoding ? "default" : "outline"} 
            size="sm" 
            onClick={() => setIncludeCoding(!includeCoding)}
            className="flex items-center gap-1"
          >
            <Code className="h-4 w-4" />
            {includeCoding ? "Showing Coding Courses" : "Hiding Coding Courses"}
          </Button>
          
          {/* Show Raw Data Toggle */}
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
  
      {/* Records Table */}
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
              <TableCaption className="text-xs">PASI Records With Missing Student Type</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs px-2 py-1 w-8">Checked</TableHead>
                  <SortableHeader column="asn" label="ASN" />
                  <SortableHeader column="studentName" label="Student Name" />
                  <TableHead className="px-2 py-1 text-xs">Alt Email</TableHead>
                  <SortableHeader column="courseCode" label="Course Code" />
                  <SortableHeader column="status" label="Status" />
                  <SortableHeader column="email" label="Email" />
                  <SortableHeader column="pasiTerm" label="Term" />
                  <SortableHeader column="schoolYear" label="School Year" />
                  <TableHead className="px-2 py-1 text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRecords.map((record) => (
                  <TableRow key={record.id || record.referenceNumber} className="cursor-pointer hover:bg-gray-50" onClick={() => handleRecordSelect(record)}>
                    <TableCell className="p-1 w-8" onClick={(e) => e.stopPropagation()}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Checkbox
                              id={`checked-${record.id || record.referenceNumber}`}
                              checked={Boolean(record.MissingYourWayChecked)}
                              onCheckedChange={(checked) => {
                                if (record.id || record.referenceNumber) {
                                  updateMissingYourWayStatus(record.id || record.referenceNumber, Boolean(checked));
                                }
                              }}
                              aria-label="Mark as checked"
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Mark this missing student type record as checked</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell onClick={(e) => { e.stopPropagation(); handleCellClick(record.asn, "ASN"); }}>{record.asn || 'N/A'}</TableCell>
                    <TableCell onClick={(e) => { e.stopPropagation(); handleCellClick(record.studentName, "Student Name"); }}>{record.studentName || 'N/A'}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()} className="text-center">
                      {renderAlternativeEmailInfo(record)}
                    </TableCell>
                    <TableCell onClick={(e) => { e.stopPropagation(); handleCellClick(record.courseCode, "Course Code"); }}>{record.courseCode || 'N/A'}</TableCell>
                    <TableCell onClick={(e) => { e.stopPropagation(); handleCellClick(record.status, "Status"); }}>
                      <Badge 
                        variant={record.status === 'Active' ? 'default' : 'secondary'}
                        className={`
                          text-xs
                          ${record.status === 'Active' 
                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                          }
                        `}
                      >
                        {record.status || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={(e) => { e.stopPropagation(); handleCellClick(record.email, "Email"); }}>{record.email || 'N/A'}</TableCell>
                    <TableCell onClick={(e) => { e.stopPropagation(); handleCellClick(record.pasiTerm, "Term"); }}>{record.pasiTerm || 'N/A'}</TableCell>
                    <TableCell onClick={(e) => { e.stopPropagation(); handleCellClick(record.schoolYear, "School Year"); }}>{record.schoolYear || 'N/A'}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <PasiActionButtons asn={record.asn} referenceNumber={record.referenceNumber} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            No records with missing student type found for the current school year.
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
              Record Details
              <Badge variant="destructive" className="ml-2">
                <AlertTriangle className="h-3 w-3 mr-1" /> Missing Student Type
              </Badge>
              {selectedRecord.hasAlternativeRecords && (
                <Badge variant="warning" className="ml-1 bg-amber-100 text-amber-800 border-amber-200">
                  <Mail className="h-3 w-3 mr-1" /> Alternative Email Exists
                </Badge>
              )}
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
                  
                  <dt className="font-medium text-gray-500">School Year:</dt>
                  <dd>{selectedRecord.schoolYear || 'N/A'}</dd>
                  
                  <dt className="font-medium text-gray-500">Last Updated:</dt>
                  <dd>{selectedRecord.lastUpdated || 'N/A'}</dd>
                  
                  <dt className="font-medium text-gray-500">StudentType:</dt>
                  <dd>{selectedRecord.StudentType_Value || 'Missing'}</dd>
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
                  <dd className="cursor-pointer hover:text-blue-600" onClick={() => handleCellClick(selectedRecord.pasiTerm, "Term")}>
                    <Badge className="text-xs py-0 px-1.5">{selectedRecord.pasiTerm || 'N/A'}</Badge>
                  </dd>
                  
                  <dt className="font-medium text-gray-500">Status:</dt>
                  <dd>
                    <Badge 
                      variant={selectedRecord.status === 'Active' ? 'default' : 'secondary'}
                      className={`
                        text-xs py-0 px-1.5
                        ${selectedRecord.status === 'Active'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                        }
                      `}
                    >
                      {selectedRecord.status || 'N/A'}
                    </Badge>
                  </dd>
                  
                  <dt className="font-medium text-gray-500">Exit Date:</dt>
                  <dd>{selectedRecord.exitDate || 'N/A'}</dd>
                  
                  <dt className="font-medium text-gray-500">Link Status:</dt>
                  <dd>{selectedRecord.linkStatus || 'N/A'}</dd>
                </dl>
              </div>
            </div>
            
            {/* Alternative Email Records Section */}
            {selectedRecord.hasAlternativeRecords && (
              <div className="mt-4 p-3 border rounded-md bg-amber-50 border-amber-200">
                <h3 className="font-medium text-sm flex items-center mb-2">
                  <Mail className="h-4 w-4 mr-1 text-amber-600" /> 
                  Alternative Email Records Found
                </h3>
                <div className="space-y-2">
                  {selectedRecord.alternativeRecordsInfo.alternativeSummaries.map((item, idx) => (
                    <div key={idx} className="p-2 bg-white rounded border border-amber-200">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.email}</span>
                        <Badge className="text-xs">
                          Student Type: {item.summary.StudentType_Value || 'N/A'}
                        </Badge>
                      </div>
                      <div className="mt-1 text-gray-600">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          <div>
                            <span className="font-medium">Course ID:</span> {item.summary.CourseID || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Status:</span> {item.summary.Status_Value || 'N/A'}
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium">Summary Key:</span> {item.summary.id || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
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
  );
};

export default MissingYourWay;