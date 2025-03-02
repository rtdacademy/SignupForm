import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { 
  AlertCircle, 
  Copy, 
  RotateCw, 
  ExternalLink, 
  Search, 
  ArrowUp, 
  ArrowDown,
  X
} from "lucide-react";
import { getDatabase, ref, onValue, off, set } from 'firebase/database';
import { toast } from "sonner";
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { STATUS_OPTIONS, getStatusColor, COURSE_OPTIONS } from '../config/DropdownOptions';
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

const formatASNForURL = (asn) => {
  return asn ? asn.replace(/-/g, '') : '';
};

const handleOpenPASI = (asn) => {
  const formattedASN = formatASNForURL(asn);
  const url = `${PASI_URL}/${formattedASN}`;
  window.open(url, 'pasiWindow');
};

// Helper function to get course information
const getCourseInfo = (courseId) => {
  const course = COURSE_OPTIONS.find(course => course.courseId === parseInt(courseId));
  return course || { value: 'Unknown Course', color: '#666666' };
};

const StatusCell = ({ record, studentKey, currentStatus, originalStatus, onStatusChange, onReset }) => {
  const hasChanged = currentStatus !== originalStatus;

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentStatus}
        onValueChange={(newStatus) => onStatusChange(studentKey, record.courseId, newStatus)}
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
            onClick={onReset}
            title="Reset to original status"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
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

const TabMissingRecords = ({ data = { details: [], total: 0 }, schoolYear }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [studentStatuses, setStudentStatuses] = useState({});
  const [checkedStatus, setCheckedStatus] = useState({});
  const [originalStatuses, setOriginalStatuses] = useState({});
  const [paginatedData, setPaginatedData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [recordSchoolYear, setRecordSchoolYear] = useState('');
  const [activeStatus, setActiveStatus] = useState('');
  
  // New state for sorting and searching
  const [sortState, setSortState] = useState({ column: 'studentName', direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [hoveredRow, setHoveredRow] = useState(null);

  // Sort data function
  const sortData = (data, column, direction) => {
    return [...data].sort((a, b) => {
      // Get comparable values based on column
      let aValue, bValue;
      
      if (column === 'course') {
        aValue = getCourseInfo(a.courseId).value;
        bValue = getCourseInfo(b.courseId).value;
      } else if (column === 'status') {
        const aStudentKey = sanitizeEmail(a.email);
        const bStudentKey = sanitizeEmail(b.email);
        aValue = studentStatuses[`${aStudentKey}_${a.courseId}`] || a.status;
        bValue = studentStatuses[`${bStudentKey}_${b.courseId}`] || b.status;
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
      
      // Search in email
      const email = (record.email || '').toLowerCase();
      
      // Search in ASN
      const asn = (record.asn || '').toLowerCase();
      
      // Split name to check first and last name separately
      const nameParts = studentName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
      
      // Check if the search term matches any of these fields
      return studentName.includes(lowerTerm) || 
             email.includes(lowerTerm) || 
             asn.includes(lowerTerm) || 
             firstName.includes(lowerTerm) || 
             lastName.includes(lowerTerm);
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
  }, [data.details, searchTerm, sortState, currentPage]);

  useEffect(() => {
    if (!schoolYear) return;

    const db = getDatabase();
    
    const schoolYearRef = ref(db, `pasiSyncReport/schoolYear/${schoolYear}/studentCourseSummariesMissingPasi/details/0/schoolYear`);
    const activeStatusRef = ref(db, `pasiSyncReport/schoolYear/${schoolYear}/studentCourseSummariesMissingPasi/details/0/activeStatus`);
    
    const schoolYearCallback = onValue(schoolYearRef, (snapshot) => {
      setRecordSchoolYear(snapshot.val() || '');
    });

    const activeStatusCallback = onValue(activeStatusRef, (snapshot) => {
      setActiveStatus(snapshot.val() || '');
    });

    return () => {
      off(schoolYearRef, 'value', schoolYearCallback);
      off(activeStatusRef, 'value', activeStatusCallback);
    };
  }, [schoolYear]);

  useEffect(() => {
    if (!schoolYear) return;

    const db = getDatabase();
    const listeners = {};
    const checkListeners = {};
    const originalStatusListeners = {};

    paginatedData.forEach((record, index) => {
      const studentKey = sanitizeEmail(record.email);
      const absoluteIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
      const statusPath = `students/${studentKey}/courses/${record.courseId}/Status/Value`;
      const checkedPath = `pasiSyncReport/schoolYear/${schoolYear}/studentCourseSummariesMissingPasi/details/${absoluteIndex}/checked`;
      const originalStatusPath = `pasiSyncReport/schoolYear/${schoolYear}/studentCourseSummariesMissingPasi/details/${absoluteIndex}/status`;

      // Set up listeners for status, checked status, and original status
      const setupListener = (path, callback) => {
        const reference = ref(db, path);
        const valueCallback = onValue(reference, (snapshot) => {
          callback(snapshot.val());
        });
        return { ref: reference, callback: valueCallback };
      };

      listeners[`${studentKey}_${record.courseId}`] = setupListener(
        statusPath,
        (status) => setStudentStatuses(prev => ({ ...prev, [`${studentKey}_${record.courseId}`]: status }))
      );

      checkListeners[absoluteIndex] = setupListener(
        checkedPath,
        (checked) => setCheckedStatus(prev => ({ ...prev, [absoluteIndex]: checked || false }))
      );

      originalStatusListeners[`${studentKey}_${record.courseId}`] = setupListener(
        originalStatusPath,
        (status) => setOriginalStatuses(prev => ({ ...prev, [`${studentKey}_${record.courseId}`]: status }))
      );
    });

    return () => {
      Object.values(listeners).forEach(({ ref, callback }) => off(ref, 'value', callback));
      Object.values(checkListeners).forEach(({ ref, callback }) => off(ref, 'value', callback));
      Object.values(originalStatusListeners).forEach(({ ref, callback }) => off(ref, 'value', callback));
    };
  }, [paginatedData, currentPage, schoolYear]);

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

  const handleCheckChange = async (index, checked) => {
    if (!schoolYear) return;

    try {
      const db = getDatabase();
      const absoluteIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
      const checkedRef = ref(db, `pasiSyncReport/schoolYear/${schoolYear}/studentCourseSummariesMissingPasi/details/${absoluteIndex}/checked`);
      await set(checkedRef, checked);
      toast.success('Record status updated');
    } catch (error) {
      console.error('Error updating checked status:', error);
      toast.error('Failed to update record status');
    }
  };

  const handleCopyData = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const clearSearch = () => {
    setSearchTerm('');
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
            <span className="font-semibold">Missing PASI Records:</span> These are courses in YourWay that don't have any corresponding PASI record.
            Showing {paginatedData.length} of {filteredData.length} filtered records (total: {data.details.length}).
            {recordSchoolYear && <span className="ml-2">School Year: {recordSchoolYear}</span>}
            {activeStatus && <span className="ml-2">State: {activeStatus}</span>}
          </AlertDescription>
        </Alert>

        {/* Search area */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, email, or ASN..."
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
              <TableHead className="w-[50px]">Done</TableHead>
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
                column="email" 
                label="Email" 
                currentSort={sortState} 
                onSort={handleSort} 
              />
              <SortableHeader 
                column="status" 
                label="Status" 
                currentSort={sortState} 
                onSort={handleSort} 
              />
              <TableHead>School Year</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((record, index) => {
              const studentKey = sanitizeEmail(record.email);
              const statusKey = `${studentKey}_${record.courseId}`;
              const currentStatus = studentStatuses[statusKey] || record.status;
              const originalStatus = originalStatuses[statusKey] || record.status;
              const absoluteIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
              
              return (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <TableRow 
                      className={`${checkedStatus[absoluteIndex] ? "bg-muted/50" : ""} ${
                        hoveredRow === index ? "bg-accent/20" : ""
                      }`}
                      onMouseEnter={() => setHoveredRow(index)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <TableCell>
                        <Checkbox
                          checked={checkedStatus[absoluteIndex] || false}
                          onCheckedChange={(checked) => handleCheckChange(index, checked)}
                        />
                      </TableCell>
                      <TableCell>{record.studentName}</TableCell>
                      <TableCell>
                        <CourseCell courseId={record.courseId} />
                      </TableCell>
                      <TableCell>{record.email}</TableCell>
                      <TableCell>
                        <StatusCell 
                          record={record}
                          studentKey={studentKey}
                          currentStatus={currentStatus}
                          originalStatus={originalStatus}
                          onStatusChange={handleStatusChange}
                          onReset={() => handleResetStatus(studentKey, record.courseId, originalStatus)}
                        />
                      </TableCell>
                      <TableCell>{recordSchoolYear}</TableCell>
                      <TableCell>{activeStatus}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleCopyData(record.asn)}
                            title="Copy ASN"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleOpenPASI(record.asn)}
                            title="Open in PASI"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Database Index: {absoluteIndex}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TableBody>
        </Table>

        {renderPagination()}
      </div>
    </TooltipProvider>
  );
};

export default TabMissingRecords;