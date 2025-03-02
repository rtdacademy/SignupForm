import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { 
  AlertCircle, 
  Copy, 
  InfoIcon, 
  PlusCircle, 
  ExternalLink,
  Search,
  ArrowUp,
  ArrowDown,
  X
} from "lucide-react";
import { getDatabase, ref, onValue, off, set } from 'firebase/database';
import { toast } from "sonner";
import CreateStudent from '../Registration/CreateStudent';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
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

const getErrorBadgeColor = (reason) => {
  switch (reason) {
    case 'No ASN Found':
      return 'bg-red-500';
    case 'Student course not found':
      return 'bg-yellow-500';
    case 'Unknown course code':
      return 'bg-purple-500';
    case 'Error processing record':
      return 'bg-red-700';
    default:
      if (reason.includes('invalid for PASI')) {
        return 'bg-orange-500';
      }
      return 'bg-gray-500';
  }
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

const ErrorBadge = ({ reason }) => {
  const getTooltipContent = (reason) => {
    switch (reason) {
      case 'Student course not found':
        return "This error often indicates that the student has multiple email addresses associated with one ASN. Check the student's card under 'ASN Issues' to resolve this.";
      case 'No ASN Found':
        return "This could mean either: 1) The student does not have an ASN in YourWay, or 2) The ASN is not in the correct 9-digit format. Check the student's profile to verify.";
      default:
        return null;
    }
  };

  const tooltipContent = getTooltipContent(reason);

  if (tooltipContent) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="secondary"
              className={`${getErrorBadgeColor(reason)} text-white cursor-help`}
            >
              {reason}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>{tooltipContent}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Badge 
      variant="secondary"
      className={`${getErrorBadgeColor(reason)} text-white`}
    >
      {reason}
    </Badge>
  );
};

const TabFailedLinks = ({ data = { details: [] }, schoolYear }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedData, setPaginatedData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [failedLinks, setFailedLinks] = useState([]);
  const [checkedStatus, setCheckedStatus] = useState({});
  const [hasIssues, setHasIssues] = useState({
    multipleEmails: false,
    asnMissing: false
  });
  const [createStudentDialog, setCreateStudentDialog] = useState({
    isOpen: false,
    data: null
  });
  
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
      
      // Handle different column types and nested data
      if (column === 'studentName') {
        aValue = a.data?.pasiRecord?.studentName || '';
        bValue = b.data?.pasiRecord?.studentName || '';
      } else if (column === 'reason') {
        aValue = a.reason || '';
        bValue = b.reason || '';
      } else if (column === 'course') {
        aValue = a.data?.pasiRecord?.courseDescription || '';
        bValue = b.data?.pasiRecord?.courseDescription || '';
      } else if (column === 'exitDate') {
        aValue = a.data?.pasiRecord?.exitDate || '';
        bValue = b.data?.pasiRecord?.exitDate || '';
      } else if (column === 'status') {
        aValue = a.data?.pasiRecord?.status || '';
        bValue = b.data?.pasiRecord?.status || '';
      } else if (column === 'grade') {
        aValue = a.data?.pasiRecord?.value || '';
        bValue = b.data?.pasiRecord?.value || '';
      } else {
        // Default case
        aValue = '';
        bValue = '';
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
      const pasiRecord = record.data?.pasiRecord || {};
      
      // Search in PASI student name
      const studentName = (pasiRecord.studentName || '').toLowerCase();
      
      // Search in error reason
      const reason = (record.reason || '').toLowerCase();
      
      // Search in course description
      const courseDescription = (pasiRecord.courseDescription || '').toLowerCase();
      
      // Search in course code
      const courseCode = (pasiRecord.courseCode || '').toLowerCase();
      
      // Search in ASN
      const asn = (pasiRecord.asn || '').toLowerCase();
      
      // Search in status
      const status = (pasiRecord.status || '').toLowerCase();
      
      // Split name to check first and last name separately
      const nameParts = studentName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
      
      // Check if the search term matches any of these fields
      return studentName.includes(lowerTerm) || 
             reason.includes(lowerTerm) || 
             courseDescription.includes(lowerTerm) ||
             courseCode.includes(lowerTerm) ||
             asn.includes(lowerTerm) ||
             status.includes(lowerTerm) ||
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
  
  // Filter, sort, and paginate when data or search/sort parameters change
  useEffect(() => {
    if (!failedLinks.length) return;
    
    // Apply search filter
    const filtered = searchData(failedLinks, searchTerm);
    
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
  }, [failedLinks, searchTerm, sortState, currentPage]);

  useEffect(() => {
    if (!schoolYear) return;

    const db = getDatabase();
    const failedLinksRef = ref(db, `pasiSyncReport/schoolYear/${schoolYear}/newLinks/failed`);
    
    const unsubscribe = onValue(failedLinksRef, (snapshot) => {
      const rawData = snapshot.val() || [];
      
      // Check for both types of issues
      const issues = rawData.reduce((acc, record) => ({
        multipleEmails: acc.multipleEmails || record.reason === 'Student course not found',
        asnMissing: acc.asnMissing || record.reason === 'No ASN Found'
      }), { multipleEmails: false, asnMissing: false });

      setHasIssues(issues);
      setFailedLinks(rawData);
    });

    return () => off(failedLinksRef);
  }, [schoolYear]);

  useEffect(() => {
    if (!schoolYear) return;

    const db = getDatabase();
    const checkListeners = {};

    paginatedData.forEach((record, index) => {
      // Find the original index in the failedLinks array
      const originalIndex = failedLinks.findIndex(item => 
        item.data?.pasiRecord?.asn === record.data?.pasiRecord?.asn && 
        item.data?.pasiRecord?.courseCode === record.data?.pasiRecord?.courseCode
      );
      
      if (originalIndex === -1) return;
      
      const checkedPath = `pasiSyncReport/schoolYear/${schoolYear}/newLinks/failed/${originalIndex}/checked`;

      const checkedRef = ref(db, checkedPath);
      const checkedCallback = onValue(checkedRef, (snapshot) => {
        const checked = snapshot.val();
        setCheckedStatus(prev => ({
          ...prev,
          [originalIndex]: checked || false
        }));
      });

      checkListeners[originalIndex] = {
        ref: checkedRef,
        callback: checkedCallback
      };
    });

    return () => {
      Object.values(checkListeners).forEach(({ ref, callback }) => off(ref, 'value', callback));
    };
  }, [paginatedData, failedLinks, schoolYear]);

  const handleCheckChange = async (record, checked) => {
    if (!schoolYear) return;

    try {
      const db = getDatabase();
      
      // Find the original index in the failedLinks array
      const originalIndex = failedLinks.findIndex(item => 
        item.data?.pasiRecord?.asn === record.data?.pasiRecord?.asn && 
        item.data?.pasiRecord?.courseCode === record.data?.pasiRecord?.courseCode
      );
      
      if (originalIndex === -1) {
        throw new Error('Record not found in original data');
      }
      
      const checkedRef = ref(db, `pasiSyncReport/schoolYear/${schoolYear}/newLinks/failed/${originalIndex}/checked`);
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

  const handleCreateStudent = (record) => {
    const pasiRecord = record?.data?.pasiRecord || {};
    setCreateStudentDialog({
      isOpen: true,
      data: {
        asn: pasiRecord.asn,
        email: pasiRecord.email,
        schoolYear: schoolYear,
        status: pasiRecord.status,
        studentName: pasiRecord.studentName,
        courseCode: pasiRecord.courseCode,
        courseDescription: pasiRecord.courseDescription
      }
    });
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
            <span className="font-semibold">Failed Links:</span> These PASI records couldn't be linked to YourWay records.
            Showing {paginatedData.length} of {filteredData.length} filtered records (total: {failedLinks.length}).
          </AlertDescription>
        </Alert>

        {/* Search area */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, course, error, ASN..."
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

        {hasIssues.multipleEmails && (
          <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
            <InfoIcon className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="ml-2 text-yellow-800">
              <span className="font-semibold">"Student course not found" Issues Detected:</span> This error typically means 
              that a student has multiple email addresses associated with one ASN number. To resolve this:
              <ol className="mt-2 ml-4 list-decimal">
                <li>Go to the student's card</li>
                <li>Select "ASN Issues" from the menu</li>
                <li>Review and consolidate the student's email addresses under the correct ASN</li>
              </ol>
              <p className="mt-2 text-sm italic">Hover over the "Student course not found" badge for a quick reminder of this information.</p>
            </AlertDescription>
          </Alert>
        )}

        {hasIssues.asnMissing && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <InfoIcon className="h-4 w-4 text-red-600" />
            <AlertDescription className="ml-2 text-red-800">
              <span className="font-semibold">"No ASN Found" Issues Detected:</span> This error indicates potential ASN formatting issues:
              <ol className="mt-2 ml-4 list-decimal">
                <li>Check if the student has an ASN assigned in YourWay</li>
                <li>Verify that the ASN is exactly 9 digits long</li>
                <li>Update the ASN if needed in the student's profile</li>
              </ol>
              <p className="mt-2 text-sm italic">Hover over the "No ASN Found" badge for more details.</p>
            </AlertDescription>
          </Alert>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Done</TableHead>
              <SortableHeader 
                column="studentName" 
                label="PASI Name" 
                currentSort={sortState} 
                onSort={handleSort} 
              />
              <SortableHeader 
                column="reason" 
                label="Error" 
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
                column="exitDate" 
                label="PASI Exit Date" 
                currentSort={sortState} 
                onSort={handleSort} 
              />
              <TableHead>Linked</TableHead>
              <SortableHeader 
                column="status" 
                label="PASI Status" 
                currentSort={sortState} 
                onSort={handleSort} 
              />
              <SortableHeader 
                column="grade" 
                label="PASI Grade" 
                currentSort={sortState} 
                onSort={handleSort} 
              />
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((record, index) => {
              const pasiRecord = record?.data?.pasiRecord || {};
              
// Find the original index in the failedLinks array
const originalIndex = failedLinks.findIndex(item => 
  item?.data?.pasiRecord?.asn === record?.data?.pasiRecord?.asn && 
  item?.data?.pasiRecord?.courseCode === record?.data?.pasiRecord?.courseCode
);
              
              return (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <TableRow 
                      className={`${checkedStatus[originalIndex] ? "bg-muted/50" : ""} ${
                        hoveredRow === index ? "bg-accent/20" : ""
                      }`}
                      onMouseEnter={() => setHoveredRow(index)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <TableCell>
                        <Checkbox
                          checked={checkedStatus[originalIndex] || false}
                          onCheckedChange={(checked) => handleCheckChange(record, checked)}
                        />
                      </TableCell>
                      <TableCell>{pasiRecord.studentName}</TableCell>
                      <TableCell>
                        <ErrorBadge reason={record.reason} />
                      </TableCell>
                      <TableCell>{pasiRecord.courseDescription}</TableCell>
                      <TableCell>{pasiRecord.exitDate || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={pasiRecord.linked ? "success" : "secondary"}>
                          {pasiRecord.linked ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell>{pasiRecord.status}</TableCell>
                      <TableCell>{pasiRecord.value || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleCopyData(pasiRecord.asn)}
                            title="Copy ASN"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleOpenPASI(pasiRecord.asn)}
                            title="Open in PASI"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCreateStudent(record)}
                            title="Create Student"
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Database Index: {originalIndex}</p>
                    <p>ASN: {pasiRecord.asn}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TableBody>
        </Table>

        {renderPagination()}

        <CreateStudent
          isOpen={createStudentDialog.isOpen}
          onClose={() => setCreateStudentDialog({ isOpen: false, data: null })}
          {...createStudentDialog.data}
        />
      </div>
    </TooltipProvider>
  );
};

export default TabFailedLinks;