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
  XCircle,
  Code,
  Filter,
  Search
} from 'lucide-react';
import { useSchoolYear } from '../context/SchoolYearContext';
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../components/ui/pagination";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose, SheetTrigger } from "../components/ui/sheet";
import { Input } from "../components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { Checkbox } from "../components/ui/checkbox";
import { toast } from 'sonner';
import { getDatabase, ref, update, get } from 'firebase/database';
import PasiActionButtons from "../components/PasiActionButtons";
import { filterRelevantMissingPasiRecordsWithEmailCheck } from '../utils/pasiRecordsUtils';
import { STUDENT_TYPE_OPTIONS, getStudentTypeInfo } from '../config/DropdownOptions';

const ITEMS_PER_PAGE = 20;

// Format date for user-friendly display (e.g. "Jan 15, 2025")
const formatUserFriendlyDate = (dateValue, isFormatted = false) => {
  if (!dateValue || dateValue === '-' || dateValue === 'N/A' || dateValue === '') return 'N/A';
  
  try {
    const { toEdmontonDate, formatDateForDisplay } = require('../utils/timeZoneUtils');
    
    let dateToFormat = dateValue;
    
    // Check if dateValue is a Unix timestamp in milliseconds (as a number OR string)
    if (typeof dateValue === 'number' && !isNaN(dateValue)) {
      dateToFormat = new Date(dateValue);
    } else if (typeof dateValue === 'string' && /^\d+$/.test(dateValue)) {
      // Convert string timestamp to number, then to Date
      const timestamp = parseInt(dateValue, 10);
      if (!isNaN(timestamp)) {
        dateToFormat = new Date(timestamp);
      }
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

// Enhanced function to filter records that have staffReview set to true
const enhancedFilterRecords = async (records) => {
  if (!records) return [];
  
  try {
    // First apply the existing email check filter
    const emailFilteredRecords = await filterRelevantMissingPasiRecordsWithEmailCheck(records);
    
    // Now filter out records that have staffReview set to true
    const db = getDatabase();
    const filteredRecords = [];
    
    for (const record of emailFilteredRecords) {
      if (!record.id) {
        filteredRecords.push(record);
        continue;
      }
      
      // Check if staffReview is true for this record
      const summaryRef = ref(db, `/studentCourseSummaries/${record.id}`);
      const snapshot = await get(summaryRef);
      const data = snapshot.val();
      
      if (!data || data.staffReview !== true) {
        filteredRecords.push(record);
      }
    }
    
    return filteredRecords;
  } catch (error) {
    console.error("Error in enhanced filter:", error);
    // Fallback to original filter if our enhanced one fails
    return filterRelevantMissingPasiRecordsWithEmailCheck(records);
  }
};

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

const MissingPasi = () => {
  // Get unmatchedStudentSummaries from context
  const { unmatchedStudentSummaries, isLoadingStudents } = useSchoolYear();
  
  // State for selected record
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  // Toggle for showing raw data - default to closed
  const [showRawData, setShowRawData] = useState(false);
  
  // State for pagination and sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [sortState, setSortState] = useState({ column: 'studentName', direction: 'asc' });
  
  // State for filtered records
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);

  // State for dialog visibility
  const [dialogVisible, setDialogVisible] = useState(false);
  const [recordToRemove, setRecordToRemove] = useState(null);
  
  // State for filters
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState([]);
  const [studentTypeFilter, setStudentTypeFilter] = useState([]);
  const [stateFilter, setStateFilter] = useState([]);
  const [filterCount, setFilterCount] = useState(0);

  // Function to clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setCourseFilter([]);
    setStudentTypeFilter([]);
    setStateFilter([]);
    // Reset to first page when filters are cleared
    setCurrentPage(1);
    toast.success("All filters cleared");
  };

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

  // Modified function to mark a record for staff review instead of removing it
  const markForStaffReview = (record) => {
    if (!record.id) {
      toast.error("Cannot mark for review: Missing record id");
      return;
    }
    const db = getDatabase();
    const summaryRef = ref(db, `/studentCourseSummaries/${record.id}`);
    
    // Set both staffReview and isRemoved
    update(summaryRef, { 
      staffReview: true,
      isRemoved: true  // Keep the original functionality
    })
      .then(() => {
        toast.success("Record marked for staff review");
        // Update local state to remove the record from the UI
        setFilteredRecords((prev) => prev.filter((r) => r.id !== record.id));
      })
      .catch((error) => {
        console.error("Error marking record for review:", error);
        toast.error("Failed to mark record for review");
      });
  };

  // Show confirmation dialog for record removal/review
  const showRemoveDialog = (record) => {
    setRecordToRemove(record);
    setDialogVisible(true);
  };

  // Load filtered records when component mounts or unmatchedStudentSummaries changes
  useEffect(() => {
    const loadFilteredRecords = async () => {
      if (!unmatchedStudentSummaries) return;
      
      setIsFiltering(true);
      try {
        // Use our enhanced filter that also checks staffReview status
        const filtered = await enhancedFilterRecords(unmatchedStudentSummaries);
        setFilteredRecords(filtered);
      } catch (error) {
        console.error("Error filtering records:", error);
        toast.error("Error filtering records");
        // Fallback to basic filtered records
        setFilteredRecords(unmatchedStudentSummaries);
      } finally {
        setIsFiltering(false);
      }
    };
    
    loadFilteredRecords();
  }, [unmatchedStudentSummaries]);

  // Process the records with proper date formatting using the new utility function
  const processedRecords = useMemo(() => {
    return filteredRecords.map(record => {
      // Registration date: prefer createdAt, fallback to Created
      let regDate = record.createdAt || record.Created || '';
      // Format all date fields in a friendly way
      const formatFriendly = (date) => date ? formatUserFriendlyDate(date) : 'N/A';
      
      // Create a combined student name field for consistency with PasiRecords
      const studentName = `${record.lastName || ''}, ${record.firstName || ''}`.trim();
      
      return {
        ...record,
        lastName: record.lastName || '',
        firstName: record.firstName || '',
        studentName: studentName || 'N/A',
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
  }, [filteredRecords]);

  // Filter logic
  const filterAndSortRecords = useMemo(() => {
    let filtered = [...processedRecords];
    
    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(record => {
        return (
          (record.asn && record.asn.toLowerCase().includes(searchLower)) ||
          (record.studentName && record.studentName.toLowerCase().includes(searchLower)) ||
          (record.studentEmail && record.studentEmail.toLowerCase().includes(searchLower)) ||
          (record.firstName && record.firstName.toLowerCase().includes(searchLower)) ||
          (record.lastName && record.lastName.toLowerCase().includes(searchLower))
        );
      });
    }
    
    // Apply course filter
    if (courseFilter.length > 0) {
      filtered = filtered.filter(record => 
        courseFilter.includes(record.courseValue)
      );
    }
    
    // Apply student type filter
    if (studentTypeFilter.length > 0) {
      filtered = filtered.filter(record => 
        studentTypeFilter.includes(record.studentType)
      );
    }
    
    // Apply state filter
    if (stateFilter.length > 0) {
      filtered = filtered.filter(record => 
        stateFilter.includes(record.state)
      );
    }
    
    // Update filter count
    let activeFilterCount = 0;
    if (searchTerm.trim()) activeFilterCount++;
    if (courseFilter.length > 0) activeFilterCount++;
    if (studentTypeFilter.length > 0) activeFilterCount++;
    if (stateFilter.length > 0) activeFilterCount++;
    setFilterCount(activeFilterCount);
    
    return filtered;
  }, [processedRecords, searchTerm, courseFilter, studentTypeFilter, stateFilter]);

  // Get unique options for filters
  const filterOptions = useMemo(() => {
    const courseOptions = new Set();
    const studentTypeOptions = new Set();
    const stateOptions = new Set();
    
    processedRecords.forEach(record => {
      if (record.courseValue) courseOptions.add(record.courseValue);
      if (record.studentType) studentTypeOptions.add(record.studentType);
      if (record.state) stateOptions.add(record.state);
    });
    
    return {
      courses: Array.from(courseOptions).sort(),
      studentTypes: Array.from(studentTypeOptions).sort(),
      states: Array.from(stateOptions).sort()
    };
  }, [processedRecords]);

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
    return [...filterAndSortRecords].sort((a, b) => {
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
  }, [filterAndSortRecords, sortState]);

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
      
        
        {/* Main content */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex gap-2">
           
            
            {/* Filter button */}
            <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center"
                >
                  <Filter className="h-4 w-4 mr-1" /> 
                  Filters
                  {filterCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {filterCount} active
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md overflow-y-auto" side="left">
                <SheetHeader className="mb-4">
                  <SheetTitle>Filter Missing PASI Records</SheetTitle>
                  <SheetDescription>
                    Apply filters to find specific missing records
                  </SheetDescription>
                </SheetHeader>
                
                <div className="flex-1 overflow-y-auto pr-6">
                  {/* Search Bar - Now outside the accordion */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-2">Quick Search</h3>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by ASN, name, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  
                  <Accordion type="multiple" className="w-full space-y-3">
                    {/* Course Filter */}
                    <AccordionItem value="course" className="border rounded-lg bg-blue-50/30 px-3">
                      <AccordionTrigger className="text-sm hover:no-underline">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                          Course
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-3">
                        <div className="space-y-2">
                          {filterOptions.courses.map(course => (
                            <div key={course} className="flex items-center space-x-2">
                              <Checkbox
                                id={`course-${course}`}
                                checked={courseFilter.includes(course)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setCourseFilter([...courseFilter, course]);
                                  } else {
                                    setCourseFilter(courseFilter.filter(c => c !== course));
                                  }
                                }}
                              />
                              <label htmlFor={`course-${course}`} className="text-sm">
                                {course}
                              </label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    {/* Student Type Filter */}
                    <AccordionItem value="studentType" className="border rounded-lg bg-green-50/30 px-3">
                      <AccordionTrigger className="text-sm hover:no-underline">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                          Student Type
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-3">
                        <div className="space-y-2">
                          {filterOptions.studentTypes.map(type => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox
                                id={`studentType-${type}`}
                                checked={studentTypeFilter.includes(type)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setStudentTypeFilter([...studentTypeFilter, type]);
                                  } else {
                                    setStudentTypeFilter(studentTypeFilter.filter(t => t !== type));
                                  }
                                }}
                              />
                              <label htmlFor={`studentType-${type}`} className="text-sm">
                                {type}
                              </label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    {/* State Filter */}
                    <AccordionItem value="state" className="border rounded-lg bg-purple-50/30 px-3">
                      <AccordionTrigger className="text-sm hover:no-underline">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                          State
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-3">
                        <div className="space-y-2">
                          {filterOptions.states.map(state => (
                            <div key={state} className="flex items-center space-x-2">
                              <Checkbox
                                id={`state-${state}`}
                                checked={stateFilter.includes(state)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setStateFilter([...stateFilter, state]);
                                  } else {
                                    setStateFilter(stateFilter.filter(s => s !== state));
                                  }
                                }}
                              />
                              <label htmlFor={`state-${state}`} className="text-sm">
                                {state}
                              </label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
                
                <SheetFooter className="mt-4 border-t pt-4">
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                  <SheetClose asChild>
                    <Button variant="outline">Done</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
            
            {/* Clear filters button - only show when filters are active */}
            {filterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1">
                  <path d="M18 6 6 18"/>
                  <path d="m6 6 12 12"/>
                </svg>
                Clear Filters
              </Button>
            )}
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
          {isLoadingStudents || isFiltering ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
              <span>{isFiltering ? 'Filtering records...' : 'Loading records...'}</span>
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
                    <SortableHeader column="studentName" label="Student Name" />
                    <SortableHeader column="studentType" label="Student Type" />
                    <SortableHeader column="regDateFormatted" label="Registration Date" />
                    <SortableHeader column="studentEmail" label="Student Email" />
                    <SortableHeader column="statusValue" label="Status" />
                    <SortableHeader column="scheduleStart" label="Schedule Start" />
                    <SortableHeader column="scheduleEnd" label="Schedule End" />
                    <SortableHeader column="state" label="State" />
                    <SortableHeader column="schoolYear" label="School Year" />
                    <SortableHeader column="courseValue" label="Course" />
                    <TableHead className="px-1 py-1 text-xs w-6 max-w-6" >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <XCircle className="h-3 w-3" />
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>Remove from this list</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRecords.map((record) => {
                    // Get colors for styling student name
                    const { backgroundColor, textColor } = getColorForName(record.studentName);
                    
                    return (
                      <TableRow key={record.id || record.asn}>
                        <TableCell onClick={(e) => { e.stopPropagation(); handleCellClick(record.asn, "ASN"); }}>{record.asn || 'N/A'}</TableCell>
                        <TableCell 
                          className="p-1 cursor-pointer truncate max-w-32 w-32" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCellClick(record.studentName, "Student Name");
                          }}
                        >
                          <div 
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium max-w-full truncate"
                            style={{ 
                              backgroundColor, 
                              color: textColor
                            }}
                            title={record.studentName}
                          >
                            {record.studentName || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell 
                          className="p-1 cursor-pointer" 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleCellClick(record.studentType, "Student Type"); 
                          }}
                        >
                          {record.studentType ? (
                            (() => {
                              // Get student type info using the helper function from DropdownOptions
                              const studentTypeInfo = getStudentTypeInfo(record.studentType);
                              const TypeIcon = studentTypeInfo.icon;
                              
                              return (
                                <div className="flex items-center">
                                  {TypeIcon && (
                                    <TypeIcon 
                                      className="h-3 w-3 mr-1" 
                                      style={{ color: studentTypeInfo.color }} 
                                    />
                                  )}
                                  <span 
                                    className="text-xs"
                                    style={{ color: studentTypeInfo.color }}
                                  >
                                    {record.studentType}
                                  </span>
                                </div>
                              );
                            })()
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell 
                          className="p-1 cursor-pointer truncate max-w-20 w-20" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCellClick(record.regDateFormatted, "Registration Date");
                          }}
                        >
                          {record.regDateFormatted && record.regDateFormatted !== 'N/A' ? (
                            <div 
                              className="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium truncate"
                              style={{
                                backgroundColor: '#dbeafe', // blue-100
                                color: '#1e40af' // blue-800
                              }}
                            >
                              {record.regDateFormatted}
                            </div>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell onClick={(e) => { e.stopPropagation(); handleCellClick(record.studentEmail, "Student Email"); }}>{record.studentEmail || 'N/A'}</TableCell>
                        <TableCell 
                          onClick={(e) => { e.stopPropagation(); handleCellClick(record.statusValue, "Status"); }}
                        >
                          <Badge 
                            variant={record.statusValue === 'Completed' ? 'success' : 'secondary'}
                            className={`
                              text-xs py-0 px-1.5
                              ${record.statusValue === 'Completed' 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : record.statusValue === 'Active'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }
                            `}
                          >
                            {record.statusValue || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell 
                          className="p-1 cursor-pointer truncate max-w-20 w-20" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCellClick(record.scheduleStart, "Schedule Start");
                          }}
                        >
                          {record.scheduleStart && record.scheduleStart !== 'N/A' ? (
                            <div 
                              className="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium truncate"
                              style={{
                                backgroundColor: '#dcfce7', // green-100
                                color: '#166534' // green-800
                              }}
                            >
                              {record.scheduleStart}
                            </div>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell 
                          className="p-1 cursor-pointer truncate max-w-20 w-20" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCellClick(record.scheduleEnd, "Schedule End");
                          }}
                        >
                          {record.scheduleEnd && record.scheduleEnd !== 'N/A' ? (
                            <div 
                              className="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium truncate"
                              style={{
                                backgroundColor: '#fee2e2', // red-100
                                color: '#b91c1c' // red-800
                              }}
                            >
                              {record.scheduleEnd}
                            </div>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell 
                          onClick={(e) => { e.stopPropagation(); handleCellClick(record.state, "State"); }}
                        >
                          <Badge 
                            variant="outline"
                            className={`
                              text-xs py-0 px-1.5
                              ${record.state === 'Active' 
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : record.state === 'Archived'
                                  ? 'bg-gray-50 text-gray-700 border-gray-200'
                                  : 'bg-purple-50 text-purple-700 border-purple-200'
                              }
                            `}
                          >
                            {record.state || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell onClick={(e) => { e.stopPropagation(); handleCellClick(record.schoolYear, "School Year"); }}>{record.schoolYear || 'N/A'}</TableCell>
                        <TableCell 
                          onClick={(e) => { e.stopPropagation(); handleCellClick(record.courseValue, "Course"); }}
                        >
                          <Badge 
                            variant="outline"
                            className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs py-0 px-1.5"
                          >
                            {record.courseValue || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="p-0 w-6 max-w-6">
                          <div onClick={(e) => e.stopPropagation()} className="flex justify-center">
                            <Button 
                              variant="destructive" 
                              size="xs" 
                              onClick={() => showRemoveDialog(record)}
                              className="h-4 w-4"
                              aria-label="Mark for Review"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <PasiActionButtons asn={record.asn} referenceNumber={record.referenceNumber} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              {unmatchedStudentSummaries && unmatchedStudentSummaries.length > 0 
                ? 'No matching records found with valid ASN-email associations or records have been already reviewed.' 
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
                {selectedRecord.studentName} - {selectedRecord.courseValue}
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
                    <dd className="cursor-pointer hover:text-blue-600" onClick={() => handleCellClick(selectedRecord.studentEmail, "Email")}>{selectedRecord.studentEmail || 'N/A'}</dd>
                    
                    <dt className="font-medium text-gray-500">Student Type:</dt>
                    <dd>{selectedRecord.studentType || 'N/A'}</dd>
                    
                    <dt className="font-medium text-gray-500">School Year:</dt>
                    <dd>{selectedRecord.schoolYear || 'N/A'}</dd>
                    
                    <dt className="font-medium text-gray-500">Registration Date:</dt>
                    <dd className="cursor-pointer hover:text-blue-600" onClick={() => handleCellClick(selectedRecord.regDateFormatted, "Registration Date")}>
                      {selectedRecord.regDateFormatted || 'N/A'}
                    </dd>
                  </dl>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2 text-sm">Course Information</h3>
                  <dl className="grid grid-cols-[1fr_2fr] gap-1">
                    <dt className="font-medium text-gray-500">Course:</dt>
                    <dd>{selectedRecord.courseValue || 'N/A'}</dd>
                    
                    <dt className="font-medium text-gray-500">Status:</dt>
                    <dd>
                      <Badge 
                        variant={selectedRecord.statusValue === 'Completed' ? 'success' : 'secondary'}
                        className={`
                          text-xs py-0 px-1.5
                          ${selectedRecord.statusValue === 'Completed' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : selectedRecord.statusValue === 'Active'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }
                        `}
                      >
                        {selectedRecord.statusValue || 'N/A'}
                      </Badge>
                    </dd>
                    
                    <dt className="font-medium text-gray-500">State:</dt>
                    <dd>
                      <Badge 
                        variant="outline"
                        className={`
                          text-xs py-0 px-1.5
                          ${selectedRecord.state === 'Active' 
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : selectedRecord.state === 'Archived'
                              ? 'bg-gray-50 text-gray-700 border-gray-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }
                        `}
                      >
                        {selectedRecord.state || 'N/A'}
                      </Badge>
                    </dd>
                    
                    <dt className="font-medium text-gray-500">Schedule Start:</dt>
                    <dd className="cursor-pointer hover:text-blue-600" onClick={() => handleCellClick(selectedRecord.scheduleStart, "Schedule Start")}>
                      {selectedRecord.scheduleStart || 'N/A'}
                    </dd>
                    
                    <dt className="font-medium text-gray-500">Schedule End:</dt>
                    <dd className="cursor-pointer hover:text-blue-600" onClick={() => handleCellClick(selectedRecord.scheduleEnd, "Schedule End")}>
                      {selectedRecord.scheduleEnd || 'N/A'}
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

        {/* Remove Record Confirmation Dialog */}
        {dialogVisible && (
          <Dialog open={dialogVisible} onOpenChange={setDialogVisible}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Remove from List</DialogTitle>
                <DialogDescription>
                  This will remove this student from the missing pasi list.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogVisible(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={() => {
                  markForStaffReview(recordToRemove);
                  setDialogVisible(false);
                }}>
                  Remove
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </TooltipProvider>
  );
};

export default MissingPasi;