import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { 
  AlertCircle, 
  Copy, 
  ExternalLink, 
  Link2,
  Search,
  ArrowUp,
  ArrowDown,
  X
} from "lucide-react";
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { toast } from "sonner";
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
import CourseLinkingDialog from './CourseLinkingDialog';

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

const TabManualMapping = ({ data = { details: [] }, schoolYear }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedData, setPaginatedData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [mappingRecords, setMappingRecords] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [isLinkingDialogOpen, setIsLinkingDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  // New state for sorting and searching
  const [sortState, setSortState] = useState({ column: 'courseCode', direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [hoveredRow, setHoveredRow] = useState(null);

  // Sort data function
  const sortData = (data, column, direction) => {
    return [...data].sort((a, b) => {
      // Get comparable values based on column
      let aValue = a[column] || '';
      let bValue = b[column] || '';
      
      // Check for special cases (can add more as needed)
      if (column === 'status') {
        aValue = a.flaggedForReview ? "Flagged for Review" : "Needs Mapping";
        bValue = b.flaggedForReview ? "Flagged for Review" : "Needs Mapping";
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
      // Search in course code
      const courseCode = (record.courseCode || '').toLowerCase();
      
      // Search in ASN
      const asn = (record.asn || '').toLowerCase();
      
      // Search in email
      const email = (record.email || '').toLowerCase();
      
      // Search in school year
      const schoolYear = (record.schoolYear || '').toLowerCase();
      
      // Search in status
      const status = record.flaggedForReview 
        ? "flagged for review" 
        : "needs mapping";
      
      // Check if the search term matches any of these fields
      return courseCode.includes(lowerTerm) || 
             asn.includes(lowerTerm) || 
             email.includes(lowerTerm) ||
             schoolYear.includes(lowerTerm) ||
             status.includes(lowerTerm);
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
    if (!mappingRecords.length) return;
    
    // Apply search filter
    const filtered = searchData(mappingRecords, searchTerm);
    
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
  }, [mappingRecords, searchTerm, sortState, currentPage]);

  useEffect(() => {
    if (!schoolYear) return;

    const db = getDatabase();
    const mappingRef = ref(db, `pasiSyncReport/schoolYear/${schoolYear}/newLinks/needsManualCourseMapping`);
    const categoryRef = ref(db, `teacherCategories/info@rtdacademy,com/PASI_Course_Link/name`);
    
    const unsubscribe = onValue(mappingRef, (snapshot) => {
      const rawData = snapshot.val();
      let dataArray = [];
      
      // Convert to array if needed
      if (rawData) {
        if (typeof rawData === 'object' && !Array.isArray(rawData)) {
          // Convert object to array of values
          dataArray = Object.keys(rawData).map(key => ({
            ...rawData[key],
            key // Store the key for reference if needed
          }));
        } else if (Array.isArray(rawData)) {
          dataArray = rawData;
        }
      }
      
      setMappingRecords(dataArray);
    });

    // Get category name
    const categoryUnsubscribe = onValue(categoryRef, (snapshot) => {
      setCategoryName(snapshot.val() || 'PASI Course Link');
    });

    return () => {
      off(mappingRef);
      off(categoryRef);
    };
  }, [schoolYear]);

  const handleCopyData = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleOpenDashboard = () => {
    window.open('https://yourway.rtdacademy.com/teacher-dashboard', '_blank');
  };

  const handleOpenLinkingDialog = (record) => {
    setSelectedRecord(record);
    setIsLinkingDialogOpen(true);
  };

  const handleCloseLinkingDialog = () => {
    setIsLinkingDialogOpen(false);
    setSelectedRecord(null);
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
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Needs Manual Course Mapping:</span> These PASI records have course codes that need to be manually mapped to YourWay courses.
                Showing {paginatedData.length} of {filteredData.length} filtered records (total: {mappingRecords.length}).
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                <p>To link these students:</p>
                <ol className="list-decimal ml-4 mt-1">
                  <li>Go to the <Button 
                      variant="link" 
                      className="h-auto p-0 text-sm font-normal text-blue-500 hover:text-blue-700"
                      onClick={handleOpenDashboard}
                    >
                      Teacher Dashboard <ExternalLink className="h-3 w-3 inline ml-1" />
                    </Button>
                  </li>
                  <li>Filter by the category "<span className="font-medium">{categoryName}</span>"</li>
                  <li>You will see all students that need to be linked to a PASI record</li>
                </ol>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Search area */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by course code, ASN, email..."
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
                column="courseCode" 
                label="Course Code" 
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
                column="email" 
                label="Email" 
                currentSort={sortState} 
                onSort={handleSort} 
              />
              <SortableHeader 
                column="schoolYear" 
                label="School Year" 
                currentSort={sortState} 
                onSort={handleSort} 
              />
              <SortableHeader 
                column="status" 
                label="Status" 
                currentSort={sortState} 
                onSort={handleSort} 
              />
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((record, index) => {
              // Get the original index if we can
              const originalIndex = mappingRecords.findIndex(r => 
                r.key === record.key || 
                (r.asn === record.asn && r.courseCode === record.courseCode)
              );
              
              return (
                <Tooltip key={record.key || index}>
                  <TooltipTrigger asChild>
                    <TableRow 
                      className={hoveredRow === index ? "bg-accent/20" : ""}
                      onMouseEnter={() => setHoveredRow(index)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <TableCell>{record.courseCode}</TableCell>
                      <TableCell>{record.asn}</TableCell>
                      <TableCell>{record.email}</TableCell>
                      <TableCell>{record.schoolYear}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={record.flaggedForReview ? "warning" : "secondary"}
                          className={record.flaggedForReview ? "bg-yellow-500 text-white" : ""}
                        >
                          {record.flaggedForReview ? "Flagged for Review" : "Needs Mapping"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenLinkingDialog(record)}
                            title="Link Course"
                          >
                            <Link2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Database Index: {originalIndex !== -1 ? originalIndex : 'Unknown'}</p>
                    <p>Record Key: {record.key || 'No key'}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TableBody>
        </Table>

        {renderPagination()}

        <CourseLinkingDialog
          isOpen={isLinkingDialogOpen}
          onClose={handleCloseLinkingDialog}
          record={selectedRecord}
        />
      </div>
    </TooltipProvider>
  );
};

export default TabManualMapping;