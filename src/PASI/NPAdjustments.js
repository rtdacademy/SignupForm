import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { 
  Search, 
  X, 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  ExternalLink, 
  CheckCircle, 
  Loader2,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";

// Import term options and helpers
import { TERM_OPTIONS, getTermInfo } from "../config/DropdownOptions";

// For pagination
const ITEMS_PER_PAGE = 50;

// Sortable header component
const SortableHeader = ({ column, label, currentSort, onSort, className }) => {
  const isActive = currentSort.column === column;
  
  return (
    <TableHead 
      className={`cursor-pointer hover:bg-muted/50 transition-colors ${className || ''}`}
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

// Helper function to check if a grade value is valid
const isValidGradeValue = (value) => {
  if (!value) return false;
  if (value === '-') return false;
  if (value === 'N/A') return false;
  if (value === '') return false;
  
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

// Format date for display
const formatDate = (dateValue, isFormatted = false) => {
  if (!isValidDateValue(dateValue)) return 'N/A';
  
  // If it's already formatted, return as is
  if (isFormatted && typeof dateValue === 'string') {
    return dateValue;
  }
  
  try {
    // Check if it's a numeric timestamp (as string or number)
    if (!isNaN(dateValue) && typeof dateValue !== 'object') {
      const date = new Date(parseInt(dateValue));
      // Check if valid date
      if (!isNaN(date.getTime()) && date.getFullYear() >= 1971) {
        return date.toISOString().split('T')[0];
      }
      return 'N/A';
    }
    
    // If it's a date object or ISO string
    const date = new Date(dateValue);
    if (!isNaN(date.getTime()) && date.getFullYear() >= 1971) {
      return date.toISOString().split('T')[0];
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

const NPAdjustments = ({ records = [] }) => {
  // State for search, pagination, and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortState, setSortState] = useState({ column: 'studentName', direction: 'asc' });
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [paginatedRecords, setPaginatedRecords] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  
  // State for tracking processed records - use localStorage to persist
  const [processedRecords, setProcessedRecords] = useState(() => {
    const saved = localStorage.getItem('npAdjustmentsProcessed');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  
  // State for external links
  const [pasiWindowRef, setPasiWindowRef] = useState(null);
  const [dashboardWindowRef, setDashboardWindowRef] = useState(null);
  
  // State for loading
  const [isLoading, setIsLoading] = useState(true);
  
  // State for selected record (for debugging)
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  
  // Enrich records with startDate property and filter to only Non-Primary students
  const enrichedRecords = React.useMemo(() => {
    if (!records || records.length === 0) return [];
    
    // First filter to only include non-primary students
    const nonPrimaryRecords = records.filter(record => record.studentType === 'Non-Primary');
    
    const enriched = nonPrimaryRecords.map(record => {
      const startDateInfo = getStartDate(record);
      
      // Get formatted date for display and sorting
      const formattedDate = startDateInfo.formatted 
        ? startDateInfo.value 
        : formatDate(startDateInfo.value);
      
      // Format schedule start date if available
      const scheduleStartDate = record.scheduleStartDate && record.scheduleStartDate !== '-' 
        ? formatDate(record.scheduleStartDate) 
        : 'N/A';
      
      return {
        ...record,
        startDate: startDateInfo.value,
        startDateFormatted: formattedDate,
        startDateSource: startDateInfo.source,
        startDateIsPreFormatted: startDateInfo.formatted,
        hasValidStartDate: formattedDate !== 'N/A',
        scheduleStartDateFormatted: scheduleStartDate
      };
    });
    
    return enriched;
  }, [records]);

  // Save processed records to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('npAdjustmentsProcessed', JSON.stringify([...processedRecords]));
  }, [processedRecords]);

  // Debug function - log record data to console
  const debugRecord = (record) => {
    // Toggle selection
    if (selectedRecordId === record.id) {
      setSelectedRecordId(null);
      return;
    }
    
    setSelectedRecordId(record.id);
    
    // Create a clean object with the raw date values for inspection
    const debugData = {
      id: record.id,
      studentName: record.studentName,
      createdAt: record.createdAt,
      Created: record.Created,
      created: record.created,
      assignmentDate: record.assignmentDate,
      scheduleStartDate: record.scheduleStartDate,
      startDateSelected: record.startDateSource,
      startDateFormatted: record.startDateFormatted,
      scheduleStartDateFormatted: record.scheduleStartDateFormatted,
      hasValidStartDate: record.hasValidStartDate,
      value: record.value,
      pasiTerm: record.pasiTerm,
      yourWayTerm: record.yourWayTerm,
      // Include all other properties
      ...Object.keys(record)
        .filter(key => !['id', 'studentName', 'createdAt', 'Created', 'created', 'assignmentDate', 
                          'scheduleStartDate', 'startDate', 'startDateFormatted', 'startDateSource', 
                          'startDateIsPreFormatted', 'hasValidStartDate', 'scheduleStartDateFormatted'].includes(key))
        .reduce((obj, key) => {
          obj[key] = record[key];
          return obj;
        }, {})
    };
    
    console.log('Record Debug Data:', debugData);
    toast.info(`Debug data for ${record.studentName} logged to console`);
  };

  // Search functionality
  const searchData = (data, term) => {
    if (!term.trim()) return data;
    
    const lowerTerm = term.toLowerCase().trim();
    return data.filter(record => {
      // Check various fields for the search term
      const studentName = (record.studentName || '').toLowerCase();
      const courseCode = (record.courseCode || '').toLowerCase();
      const courseDescription = (record.courseDescription || '').toLowerCase();
      const asn = (record.asn || '').toLowerCase();
      const email = (record.email || '').toLowerCase();
      const status = (record.status || '').toLowerCase();
      const value = (record.value || '').toLowerCase();
      const pasiTerm = (record.pasiTerm || '').toLowerCase();
      const yourWayTerm = (record.yourWayTerm || '').toLowerCase();
      
      // Use the pre-formatted date for search
      const startDateStr = (record.startDateFormatted || '').toLowerCase();
      const scheduleStartDateStr = (record.scheduleStartDateFormatted || '').toLowerCase();
      
      // Split name to check first and last name separately
      const nameParts = studentName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
      
      // Check if any field matches the search term
      return studentName.includes(lowerTerm) || 
             courseCode.includes(lowerTerm) || 
             courseDescription.includes(lowerTerm) ||
             asn.includes(lowerTerm) ||
             email.includes(lowerTerm) ||
             status.includes(lowerTerm) ||
             value.includes(lowerTerm) ||
             pasiTerm.includes(lowerTerm) ||
             yourWayTerm.includes(lowerTerm) ||
             startDateStr.includes(lowerTerm) ||
             scheduleStartDateStr.includes(lowerTerm) ||
             firstName.includes(lowerTerm) || 
             lastName.includes(lowerTerm);
    });
  };

  // Sort data function
  const sortData = (data, column, direction) => {
    return [...data].sort((a, b) => {
      let aValue, bValue;
      
      switch (column) {
        case 'studentName':
          aValue = a.studentName || '';
          bValue = b.studentName || '';
          break;
        case 'courseCode':
          aValue = a.courseCode || '';
          bValue = b.courseCode || '';
          break;
        case 'courseDescription':
          aValue = a.courseDescription || '';
          bValue = b.courseDescription || '';
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        case 'value':
          aValue = a.value || '';
          bValue = b.value || '';
          // For numeric grades, convert to numbers for proper sorting
          if (!isNaN(aValue) && !isNaN(bValue)) {
            aValue = parseFloat(aValue);
            bValue = parseFloat(bValue);
          }
          break;
        case 'pasiTerm':
          aValue = a.pasiTerm || '';
          bValue = b.pasiTerm || '';
          break;
        case 'yourWayTerm':
          aValue = a.yourWayTerm || '';
          bValue = b.yourWayTerm || '';
          break;
        case 'registeredDate':
          // Use formatted date string for sorting
          aValue = a.startDateFormatted || '';
          bValue = b.startDateFormatted || '';
          break;
        case 'scheduleStartDate':
          aValue = a.scheduleStartDateFormatted || '';
          bValue = b.scheduleStartDateFormatted || '';
          break;
        case 'exitDate':
          aValue = a.exitDate || '';
          bValue = b.exitDate || '';
          break;
        case 'period':
          aValue = a.period || '';
          bValue = b.period || '';
          break;
        case 'asn':
          aValue = a.asn || '';
          bValue = b.asn || '';
          break;
        default:
          aValue = a[column] || '';
          bValue = b[column] || '';
      }
      
      // Numeric comparison for numbers
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'asc' 
          ? (aValue - bValue) 
          : (bValue - aValue);
      }
      
      // String comparison for text values
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      // Fallback comparison
      return direction === 'asc' 
        ? (aValue > bValue ? 1 : -1) 
        : (aValue < bValue ? 1 : -1);
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

  // Clear search function
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Copy to clipboard functionality
  const handleCopyData = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  // Mark record as processed or unprocessed
  const toggleProcessedStatus = (recordId) => {
    setProcessedRecords(prevProcessed => {
      const newProcessed = new Set(prevProcessed);
      if (newProcessed.has(recordId)) {
        newProcessed.delete(recordId);
      } else {
        newProcessed.add(recordId);
      }
      return newProcessed;
    });
  };

  // Open PASI link in the same tab
  const openPasiLink = (asn) => {
    if (!asn) return;
    
    const asnWithoutDashes = asn.replace(/-/g, '');
    const url = `https://extranet.education.alberta.ca/PASI/PASIprep/view-student/${asnWithoutDashes}`;
    
    // If we already have a window reference, use it, otherwise create a new one
    if (pasiWindowRef && !pasiWindowRef.closed) {
      pasiWindowRef.location.href = url;
      pasiWindowRef.focus();
    } else {
      const newWindow = window.open(url, 'pasiWindow');
      setPasiWindowRef(newWindow);
    }
  };

  // Open teacher dashboard with ASN parameter
  const openTeacherDashboard = (asn) => {
    if (!asn) return;
    
    const url = `/teacher-dashboard?asn=${asn}`;
    
    // If we already have a window reference, use it, otherwise create a new one
    if (dashboardWindowRef && !dashboardWindowRef.closed) {
      dashboardWindowRef.location.href = url;
      dashboardWindowRef.focus();
    } else {
      const newWindow = window.open(url, 'dashboardWindow');
      setDashboardWindowRef(newWindow);
    }
  };

  // Filter, sort, and paginate records when data changes
  useEffect(() => {
    setIsLoading(true);
    
    if (!enrichedRecords || enrichedRecords.length === 0) {
      setFilteredRecords([]);
      setPaginatedRecords([]);
      setTotalPages(1);
      setIsLoading(false);
      return;
    }
    
    // First filter by search term if there is one
    let filtered = searchTerm ? 
      searchData(enrichedRecords, searchTerm) : 
      [...enrichedRecords];
    
    setFilteredRecords(filtered);
    
    // Sort the filtered data
    const sorted = sortData(filtered, sortState.column, sortState.direction);
    
    // Calculate pagination
    const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE) || 1;
    setTotalPages(totalPages);
    
    // Ensure current page is valid
    const validPage = Math.min(currentPage, totalPages);
    if (validPage !== currentPage) {
      setCurrentPage(validPage);
    }
    
    // Get the paginated data slice
    const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaginatedRecords(sorted.slice(startIndex, endIndex));
    setIsLoading(false);
  }, [enrichedRecords, searchTerm, sortState, currentPage]);

  // Render pagination controls
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

  // Function to render YourWay term with appropriate styling based on TERM_OPTIONS
  const renderYourWayTerm = (term) => {
    if (!term) return <span className="text-gray-400">N/A</span>;
    
    const termInfo = getTermInfo(term);
    const Icon = termInfo.icon;
    
    return (
      <div className="flex items-center gap-1">
        <div 
          className="rounded-full w-2 h-2 flex-shrink-0" 
          style={{ backgroundColor: termInfo.color }}
        />
        <span style={{ color: termInfo.color }}>
          {termInfo.label}
        </span>
        {Icon && <Icon className="h-4 w-4 ml-1" style={{ color: termInfo.color }} />}
      </div>
    );
  };

  // Function to render PASI term with a simpler style
  const renderPasiTerm = (term) => {
    if (!term) return <span className="text-gray-400">N/A</span>;
    
    return (
      <div className="flex items-center gap-1">
        <div className="rounded-full w-2 h-2 flex-shrink-0 bg-amber-500" />
        <span className="text-amber-700 font-medium">{term}</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search bar and statistics */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, course, ASN..."
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
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {filteredRecords.length} records
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            {processedRecords.size} processed
          </Badge>
        </div>
      </div>

      {/* Records table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Loading records...</p>
              </div>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Debug</TableHead>
                    <SortableHeader 
                      column="yourWayTerm" 
                      label="YourWay Term" 
                      currentSort={sortState} 
                      onSort={handleSort}
                      className="text-indigo-700 bg-indigo-50"
                    />
                    <SortableHeader 
                      column="pasiTerm" 
                      label="PASI Term" 
                      currentSort={sortState} 
                      onSort={handleSort}
                      className="text-amber-700 bg-amber-50"
                    />
                    <SortableHeader 
                      column="studentName" 
                      label="Student Name" 
                      currentSort={sortState} 
                      onSort={handleSort} 
                    />
                    <SortableHeader 
                      column="asn" 
                      label="ASN" 
                      currentSort={sortState} 
                      onSort={handleSort} 
                    />
                    <SortableHeader 
                      column="courseCode" 
                      label="Course Code" 
                      currentSort={sortState} 
                      onSort={handleSort} 
                    />
                    <SortableHeader 
                      column="registeredDate" 
                      label="Registered Date" 
                      currentSort={sortState} 
                      onSort={handleSort}
                      className="text-purple-700 bg-purple-50" 
                    />
                    <SortableHeader 
                      column="scheduleStartDate" 
                      label="Schedule Start" 
                      currentSort={sortState} 
                      onSort={handleSort}
                      className="text-blue-700 bg-blue-50"
                    />
                    <SortableHeader 
                      column="exitDate" 
                      label="Exit Date" 
                      currentSort={sortState} 
                      onSort={handleSort}
                      className="text-red-700 bg-red-50"
                    />
                    <SortableHeader 
                      column="value" 
                      label="Grade" 
                      currentSort={sortState} 
                      onSort={handleSort} 
                    />
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="h-24 text-center">
                        {searchTerm ? 'No matching records found.' : 'No records available.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRecords.map((record) => {
                      const isSelected = selectedRecordId === record.id;
                      const missingDate = !record.hasValidStartDate;

                      return (
                        <TableRow 
                          key={record.id}
                          className={
                            isSelected
                              ? "bg-blue-50 hover:bg-blue-100"
                              : missingDate
                                ? "bg-amber-50 hover:bg-amber-100"
                                : "hover:bg-gray-50"
                          }
                        >
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => debugRecord(record)}
                              title="Debug Record"
                              className="h-8"
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          </TableCell>
                          <TableCell className="bg-indigo-50">
                            {renderYourWayTerm(record.yourWayTerm)}
                          </TableCell>
                          <TableCell className="bg-amber-50">
                            {renderPasiTerm(record.pasiTerm)}
                          </TableCell>
                          <TableCell>{record.studentName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span>{isValidDateValue(record.asn) ? record.asn : 'N/A'}</span>
                              {isValidDateValue(record.asn) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyData(record.asn)}
                                  title="Copy ASN"
                                  className="h-6 w-6 p-0"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span>{isValidDateValue(record.courseCode) ? record.courseCode : 'N/A'}</span>
                              {isValidDateValue(record.courseCode) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyData(record.courseCode)}
                                  title="Copy Course Code"
                                  className="h-6 w-6 p-0"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="bg-purple-50">
                            <div className="flex items-center gap-1">
                              <span 
                                className={missingDate ? "text-amber-700 font-medium" : "text-purple-700"}
                              >
                                {record.startDateFormatted !== 'N/A' ? record.startDateFormatted : 'N/A'}
                              </span>
                              {record.startDateFormatted !== 'N/A' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyData(record.startDateFormatted)}
                                  title="Copy Registered Date"
                                  className="h-6 w-6 p-0"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="bg-blue-50">
                            <div className="flex items-center gap-1">
                              <span className="text-blue-700">
                                {record.scheduleStartDateFormatted !== 'N/A' ? record.scheduleStartDateFormatted : 'N/A'}
                              </span>
                              {record.scheduleStartDateFormatted !== 'N/A' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyData(record.scheduleStartDateFormatted)}
                                  title="Copy Schedule Start Date"
                                  className="h-6 w-6 p-0"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="bg-red-50">
                            <div className="flex items-center gap-1">
                              <span className="text-red-700">
                                {isValidDateValue(record.exitDate) ? record.exitDate : 'N/A'}
                              </span>
                              {isValidDateValue(record.exitDate) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyData(record.exitDate)}
                                  title="Copy Exit Date"
                                  className="h-6 w-6 p-0"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span>
                                {isValidGradeValue(record.value) ? record.value : 'N/A'}
                              </span>
                              {isValidGradeValue(record.value) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyData(record.value)}
                                  title="Copy Grade"
                                  className="h-6 w-6 p-0"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openPasiLink(record.asn)}
                                title="Open in PASI"
                                className="h-8"
                                disabled={!isValidDateValue(record.asn)}
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                PASI
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openTeacherDashboard(record.asn)}
                                title="Open in Teacher Dashboard"
                                className="h-8"
                                disabled={!isValidDateValue(record.asn)}
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                YourWay
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination controls */}
      {renderPagination()}
    </div>
  );
};

export default NPAdjustments;