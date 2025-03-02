import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { 
  AlertCircle, 
  RotateCw, 
  Copy, 
  FileText, 
  ExternalLink, 
  GraduationCap,
  Search,
  ArrowUp,
  ArrowDown,
  X
} from "lucide-react";
import { getDatabase, ref, set, onValue, off } from 'firebase/database';
import { toast } from "sonner";
import { STATUS_OPTIONS, getStatusColor, COURSE_OPTIONS } from '../config/DropdownOptions';
import PASIRecordDialog from './PASIRecordDialog';
import StudentGradesDisplay from '../StudentManagement/StudentGradesDisplay';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";

const ITEMS_PER_PAGE = 50;
const PASI_URL = 'https://extranet.education.alberta.ca/PASI/PASIprep/view-student';

// Helper function to get course information
const getCourseInfo = (courseId) => {
  const course = COURSE_OPTIONS.find(course => course.courseId === parseInt(courseId));
  return course || { value: 'Unknown Course', color: '#666666' };
};

// Helper function to format ASN for PASI URL
const formatASNForURL = (asn) => {
  return asn ? asn.replace(/-/g, '') : '';
};

// Sortable header component
const SortableHeader = ({ column, label, currentSort, onSort }) => {
  const isActive = currentSort.column === column;
  
  return (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 transition-colors" 
      onClick={() => onSort(column)}
    >
      <div className="flex items-center">
        {label}
        <span className="ml-1 inline-flex">
          {isActive ? (
            currentSort.direction === 'asc' ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )
          ) : null}
        </span>
      </div>
    </TableHead>
  );
};

const CourseCell = ({ courseId }) => {
  const courseInfo = getCourseInfo(courseId);
  return (
    <div className="flex items-center gap-2">
      <span style={{ color: courseInfo.color }}>
        {courseInfo.value}
      </span>
      <span className="text-xs text-muted-foreground">
        ({courseInfo.pasiCode || 'No PASI Code'})
      </span>
    </div>
  );
};

const TabStatusMismatches = ({ data = { details: [] }, schoolYear }) => {
  const [studentStatuses, setStudentStatuses] = useState({});
  const [selectedPasiRecord, setSelectedPasiRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedData, setPaginatedData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [pasiWindowName, setPasiWindowName] = useState('pasiWindow');
  const [selectedGradesData, setSelectedGradesData] = useState(null);
  
  // New state for sorting and searching
  const [sortState, setSortState] = useState({ column: 'studentName', direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [hoveredRow, setHoveredRow] = useState(null);

  const getStudentKeyFromSummaryKey = (summaryKey) => {
    return summaryKey.split('_')[0];
  };

  // Sort data function
  const sortData = (data, column, direction) => {
    return [...data].sort((a, b) => {
      // Get comparable values based on column
      let aValue, bValue;
      
      if (column === 'course') {
        aValue = getCourseInfo(a.courseId).value;
        bValue = getCourseInfo(b.courseId).value;
      } else if (column === 'yourWayStatus') {
        const aStudentKey = getStudentKeyFromSummaryKey(a.summaryKey);
        const bStudentKey = getStudentKeyFromSummaryKey(b.summaryKey);
        aValue = studentStatuses[`${aStudentKey}_${a.courseId}`] || a.yourWayStatus;
        bValue = studentStatuses[`${bStudentKey}_${b.courseId}`] || b.yourWayStatus;
      } else {
        aValue = a[column] || '';
        bValue = b[column] || '';
      }
      
      // String comparison for text values
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      // Numeric comparison for numbers
      return direction === 'asc' 
        ? (aValue > bValue ? 1 : -1) 
        : (aValue < bValue ? 1 : -1);
    });
  };

  // Search data function
  const searchData = (data, term) => {
    if (!term.trim()) return data;
    
    const lowerTerm = term.toLowerCase().trim();
    return data.filter(record => {
      // Search in student name
      const studentName = (record.studentName || '').toLowerCase();
      
      // Search in ASN
      const asn = (record.asn || '').toLowerCase();
      
      // Search in reason
      const reason = (record.reason || '').toLowerCase();
      
      // Search in PASI status
      const pasiStatus = (record.pasiStatus || '').toLowerCase();
      
      // Search in YourWay status
      const yourWayStatus = (record.yourWayStatus || '').toLowerCase();
      
      // Split name to check first and last name separately
      const nameParts = studentName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
      
      // Search in course info
      const courseInfo = getCourseInfo(record.courseId);
      const courseName = (courseInfo.value || '').toLowerCase();
      const pasiCode = (courseInfo.pasiCode || '').toLowerCase();
      
      // Check if the search term matches any of these fields
      return studentName.includes(lowerTerm) || 
             asn.includes(lowerTerm) || 
             reason.includes(lowerTerm) ||
             pasiStatus.includes(lowerTerm) ||
             yourWayStatus.includes(lowerTerm) ||
             firstName.includes(lowerTerm) || 
             lastName.includes(lowerTerm) ||
             courseName.includes(lowerTerm) ||
             pasiCode.includes(lowerTerm);
    });
  };

  // Handle sort column change
  const handleSort = (column) => {
    setSortState(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Filter, sort, and paginate data
  useEffect(() => {
    // Apply search filter
    const filtered = searchData(data.details || [], searchTerm);
    
    // Store filtered data for total count
    setFilteredData(filtered);
    
    // Apply sorting
    const sorted = sortData(filtered, sortState.column, sortState.direction);
    
    // Update total pages
    const total = Math.ceil(sorted.length / ITEMS_PER_PAGE) || 1;
    setTotalPages(total);
    
    // Make sure current page is valid
    const validPage = Math.min(currentPage, total);
    if (validPage !== currentPage) {
      setCurrentPage(validPage);
    }
    
    // Paginate the data
    const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaginatedData(sorted.slice(startIndex, endIndex));
  }, [data.details, searchTerm, sortState, currentPage, studentStatuses]);

  const handleCopyData = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleOpenPASI = (asn) => {
    const formattedASN = formatASNForURL(asn);
    const url = `${PASI_URL}/${formattedASN}`;
    window.open(url, pasiWindowName);
  };

  const handleStatusChange = async (studentKey, courseId, newStatus) => {
    try {
      const db = getDatabase();
      const statusRef = ref(db, `students/${studentKey}/courses/${courseId}/Status/Value`);
      await set(statusRef, newStatus);
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleResetStatus = async (studentKey, courseId, originalStatus) => {
    try {
      await handleStatusChange(studentKey, courseId, originalStatus);
      toast.success('Status reset to original value');
    } catch (error) {
      toast.error('Failed to reset status');
    }
  };

  const handleViewGrades = (studentKey, courseId) => {
    setSelectedGradesData({ studentKey, courseId });
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  useEffect(() => {
    const db = getDatabase();
    const listeners = {};

    paginatedData.forEach(mismatch => {
      const studentKey = getStudentKeyFromSummaryKey(mismatch.summaryKey);
      const statusPath = `students/${studentKey}/courses/${mismatch.courseId}/Status/Value`;
      const statusRef = ref(db, statusPath);

      const callback = onValue(statusRef, (snapshot) => {
        const status = snapshot.val();
        setStudentStatuses(prev => ({
          ...prev,
          [`${studentKey}_${mismatch.courseId}`]: status
        }));
      });

      listeners[`${studentKey}_${mismatch.courseId}`] = {
        ref: statusRef,
        callback
      };
    });

    return () => {
      Object.values(listeners).forEach(({ ref, callback }) => {
        off(ref, 'value', callback);
      });
    };
  }, [paginatedData]);

  const StatusCell = ({ mismatch, studentKey }) => {
    const statusKey = `${studentKey}_${mismatch.courseId}`;
    const currentStatus = studentStatuses[statusKey] || mismatch.yourWayStatus;
    const hasChanged = currentStatus !== mismatch.yourWayStatus;

    return (
      <div className="flex items-center gap-2">
        <Select
          value={currentStatus}
          onValueChange={(newStatus) => 
            handleStatusChange(studentKey, mismatch.courseId, newStatus)
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue>
              <span style={{ color: getStatusColor(currentStatus) }}>
                {currentStatus}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
              >
                <span style={{ color: option.color }}>
                  {option.value}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {hasChanged && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="h-6">
              Changed
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleResetStatus(studentKey, mismatch.courseId, mismatch.yourWayStatus)}
              title="Reset to original status"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  };

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
          
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            // Show first page, last page, and pages around current page
            let pageToShow;
            
            if (totalPages <= 7) {
              // If 7 or fewer pages, show all
              pageToShow = i + 1;
            } else if (currentPage <= 4) {
              // If near the start, show first 5 pages, ellipsis, and last page
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
              // If near the end, show first page, ellipsis, and last 5 pages
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
              // If in the middle, show first page, ellipsis, current page and neighbors, ellipsis, and last page
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
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            <span className="font-semibold">Status Mismatches:</span> These records have incompatible statuses between YourWay and PASI. 
            Showing {paginatedData.length} of {filteredData.length} filtered records (total: {data.details.length}).
          </AlertDescription>
        </Alert>

        {/* Search area */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, status, course, reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-8"
            />
            {searchTerm && (
              <Button
                variant="ghost" 
                size="sm" 
                className="absolute right-0 top-0 h-9 w-9 p-0"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
          <Badge variant="outline">
            {filteredData.length} matches
          </Badge>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader 
                column="studentName" 
                label="Student Name" 
                currentSort={sortState} 
                onSort={handleSort} 
              />
              <SortableHeader 
                column="course" 
                label="Course" 
                currentSort={sortState} 
                onSort={handleSort} 
              />
              <SortableHeader 
                column="yourWayStatus" 
                label="YourWay Status" 
                currentSort={sortState} 
                onSort={handleSort} 
              />
              <SortableHeader 
                column="pasiStatus" 
                label="PASI Status" 
                currentSort={sortState} 
                onSort={handleSort} 
              />
              <SortableHeader 
                column="reason" 
                label="Reason" 
                currentSort={sortState} 
                onSort={handleSort} 
              />
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((mismatch, index) => {
              const studentKey = getStudentKeyFromSummaryKey(mismatch.summaryKey);
              const absoluteIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
              
              return (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <TableRow 
                      className={hoveredRow === index ? "bg-accent/20" : ""}
                      onMouseEnter={() => setHoveredRow(index)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <TableCell>{mismatch.studentName}</TableCell>
                      <TableCell>
                        <CourseCell courseId={mismatch.courseId} />
                      </TableCell>
                      <TableCell>
                        <StatusCell mismatch={mismatch} studentKey={studentKey} />
                      </TableCell>
                      <TableCell>{mismatch.pasiStatus}</TableCell>
                      <TableCell>{mismatch.reason}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleCopyData(mismatch.asn)}
                            title="Copy ASN"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedPasiRecord(mismatch.id)}
                            title="View PASI Details"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenPASI(mismatch.asn)}
                            title="Open in PASI"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewGrades(studentKey, mismatch.courseId)}
                            title="View Grades"
                          >
                            <GraduationCap className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Database Index: {absoluteIndex}</p>
                    <p>Summary Key: {mismatch.summaryKey}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TableBody>
        </Table>

        {renderPagination()}

        <PASIRecordDialog
          isOpen={!!selectedPasiRecord}
          onClose={() => setSelectedPasiRecord(null)}
          pasiRecordId={selectedPasiRecord}
          schoolYear={schoolYear}
        />

        {/* Grades Display Sheet */}
        <StudentGradesDisplay
          studentKey={selectedGradesData?.studentKey}
          courseId={selectedGradesData?.courseId}
          isOpen={!!selectedGradesData}
          onOpenChange={(open) => !open && setSelectedGradesData(null)}
          useSheet={true}
        />
      </div>
    </TooltipProvider>
  );
};

export default TabStatusMismatches;