import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Search,
  Info
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
import PasiRecordDetails from './PasiRecordDetails';
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
// and optionally filter adult/international students by payment status
// and optionally include coding courses (CourseID 1111)
const enhancedFilterRecords = async (records, filterByPayment = false, includeCoding = false) => {
  if (!records) return [];
  
  try {
    // Use the optimized batch filtering function
    return await filterRelevantMissingPasiRecordsWithEmailCheck(records, filterByPayment, includeCoding);
  } catch (error) {
    console.error("Error in enhanced filter:", error);
    return [];
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
  
  // Ref for detail card
  const detailCardRef = useRef(null);
  
  // Toggle for showing raw data - default to closed
  const [showRawData, setShowRawData] = useState(false);
  
  // State for pagination and sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [sortState, setSortState] = useState({ column: 'studentName', direction: 'asc' });
  
  // State for filtered records
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);
  
  // State for filter toggles - defaults
  const [filterByPayment, setFilterByPayment] = useState(true);
  const [includeCoding, setIncludeCoding] = useState(false);
  const [unfilteredRecords, setUnfilteredRecords] = useState([]);

  // Removed dialog-related state variables since we no longer have the remove button
  
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
  
  // Function to update student summary record in Firebase
  const updateMissingPasiStatus = (record, isChecked) => {
    if (!record.id) {
      toast.error("Cannot update: Missing record id");
      return;
    }
    const db = getDatabase();
    const summaryRef = ref(db, `/studentCourseSummaries/${record.id}`);
    const updates = {
      MissingPasiChecked: isChecked
    };
    
    update(summaryRef, updates)
      .then(() => {
        toast.success(`Updated missing PASI status successfully`);
      })
      .catch((error) => {
        console.error(`Error updating missing PASI status:`, error);
        toast.error(`Failed to update missing PASI status`);
      });
  };

  // Note: Removed markForStaffReview and showRemoveDialog functions since we no longer have the remove button

  // Cache of all filtered records (without payment or coding filters)
  const [allFilteredRecords, setAllFilteredRecords] = useState([]);
  
  // Load all records once when component mounts or unmatchedStudentSummaries changes
  useEffect(() => {
    const loadAllRecords = async () => {
      if (!unmatchedStudentSummaries) return;
      
      setIsFiltering(true);
      try {
        // Get all records once with minimum filtering
        const allRecords = await enhancedFilterRecords(unmatchedStudentSummaries, false, true);
        setAllFilteredRecords(allRecords);
        setUnfilteredRecords(allRecords);
        
        // Apply client-side filters for initial display
        const initialFiltered = allRecords.filter(record => {
          // Handle payment filter
          if (filterByPayment) {
            const studentType = record.StudentType_Value || record.studentType_Value || '';
            const paymentStatus = record.payment_status || '';
            
            if ((studentType === 'Adult Student' || studentType === 'International Student') && 
                paymentStatus !== 'paid' && paymentStatus !== 'active') {
              return false;
            }
          }
          
          // Handle coding courses filter
          if (!includeCoding) {
            const courseId = parseInt(record.courseId || record.CourseID || '0', 10);
            if (courseId === 1111) {
              return false;
            }
          }
          
          return true;
        });
        
        setFilteredRecords(initialFiltered);
      } catch (error) {
        console.error("Error loading records:", error);
        toast.error("Error loading records");
        setFilteredRecords([]);
      } finally {
        setIsFiltering(false);
      }
    };
    
    loadAllRecords();
  }, [unmatchedStudentSummaries]);
  
  // Apply client-side filters when filter toggles change
  useEffect(() => {
    if (allFilteredRecords.length === 0) return;
    
    setIsFiltering(true);
    try {
      // Apply client-side filters based on toggles
      const filtered = allFilteredRecords.filter(record => {
        // Handle payment filter
        if (filterByPayment) {
          const studentType = record.StudentType_Value || record.studentType_Value || '';
          const paymentStatus = record.payment_status || '';
          
          if ((studentType === 'Adult Student' || studentType === 'International Student') && 
              paymentStatus !== 'paid' && paymentStatus !== 'active') {
            return false;
          }
        }
        
        // Handle coding courses filter
        if (!includeCoding) {
          const courseId = parseInt(record.courseId || record.CourseID || '0', 10);
          if (courseId === 1111) {
            return false;
          }
        }
        
        return true;
      });
      
      setFilteredRecords(filtered);
    } catch (error) {
      console.error("Error applying filters:", error);
      toast.error("Error applying filters");
    } finally {
      setIsFiltering(false);
    }
  }, [allFilteredRecords, filterByPayment, includeCoding]);

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
        payment_status: record.payment_status || '',
      };
    });
  }, [filteredRecords]);

  // Filter logic - optimized to reduce re-renders
  const filterAndSortRecords = useMemo(() => {
    // Create index maps for faster filtering
    const courseFilterSet = new Set(courseFilter);
    const studentTypeFilterSet = new Set(studentTypeFilter);
    const stateFilterSet = new Set(stateFilter);
    
    // Get whether any filters are active
    const hasSearchFilter = searchTerm.trim().length > 0;
    const hasCourseFilter = courseFilterSet.size > 0;
    const hasStudentTypeFilter = studentTypeFilterSet.size > 0;
    const hasStateFilter = stateFilterSet.size > 0;
    
    // Calculate filter count once
    const activeFilterCount = 
      (hasSearchFilter ? 1 : 0) + 
      (hasCourseFilter ? 1 : 0) + 
      (hasStudentTypeFilter ? 1 : 0) + 
      (hasStateFilter ? 1 : 0);
    
    // Update filter count in state
    setFilterCount(activeFilterCount);
    
    // If no filters are active, return all records unmodified
    if (activeFilterCount === 0) {
      return processedRecords;
    }
    
    // Prepare search term for case-insensitive search
    const searchLower = hasSearchFilter ? searchTerm.toLowerCase() : '';
    
    // Apply all filters in a single pass
    return processedRecords.filter(record => {
      // Search filter - early return for performance
      if (hasSearchFilter) {
        const matchesSearch = 
          (record.asn && record.asn.toLowerCase().includes(searchLower)) ||
          (record.studentName && record.studentName.toLowerCase().includes(searchLower)) ||
          (record.studentEmail && record.studentEmail.toLowerCase().includes(searchLower)) ||
          (record.firstName && record.firstName.toLowerCase().includes(searchLower)) ||
          (record.lastName && record.lastName.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }
      
      // Course filter - using Set for O(1) lookup
      if (hasCourseFilter && !courseFilterSet.has(record.courseValue)) {
        return false;
      }
      
      // Student type filter - using Set for O(1) lookup
      if (hasStudentTypeFilter && !studentTypeFilterSet.has(record.studentType)) {
        return false;
      }
      
      // State filter - using Set for O(1) lookup
      if (hasStateFilter && !stateFilterSet.has(record.state)) {
        return false;
      }
      
      // Record passed all active filters
      return true;
    });
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

  // Function to scroll to detail card
  const scrollToDetailCard = () => {
    if (detailCardRef.current) {
      // Wait for the detail card to be fully rendered
      setTimeout(() => {
        detailCardRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  };
  
  // Handle record selection
  const handleRecordSelect = (record) => {
    setSelectedRecord(record);
  };
  
  // Effect to observe when selectedRecord changes
  useEffect(() => {
    // If selectedRecord exists and detailCardRef is defined, scroll to it
    if (selectedRecord && detailCardRef.current) {
      scrollToDetailCard();
    }
  }, [selectedRecord]);

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

  // Handle record updates - refresh the selected record with updated data
  const handleRecordUpdate = (fieldKey, fieldPath, newValue) => {
    if (!selectedRecord) return;
    
    // Create a copy of the selected record with the updated field
    const updatedRecord = { ...selectedRecord };
    
    // Update the record based on field path
    if (fieldPath.includes('/')) {
      // Handle nested paths like "Status/Value"
      const pathParts = fieldPath.split('/');
      if (pathParts.length === 2) {
        if (!updatedRecord[pathParts[0]]) {
          updatedRecord[pathParts[0]] = {};
        }
        updatedRecord[pathParts[0]][pathParts[1]] = newValue;
      }
    } else {
      // Handle direct field updates
      updatedRecord[fieldPath] = newValue;
    }
    
    // Map profile fields to the record structure
    switch (fieldPath) {
      case 'asn':
        updatedRecord.asn = newValue;
        break;
      case 'firstName':
        updatedRecord.firstName = newValue;
        break;
      case 'lastName':
        updatedRecord.lastName = newValue;
        break;
      case 'preferredFirstName':
        updatedRecord.preferredFirstName = newValue;
        break;
      case 'birthday':
        updatedRecord.birthday = newValue;
        break;
      case 'StudentPhone':
        updatedRecord.StudentPhone = newValue;
        break;
      case 'ParentFirstName':
        updatedRecord.ParentFirstName = newValue;
        break;
      case 'ParentLastName':
        updatedRecord.ParentLastName = newValue;
        break;
      case 'ParentEmail':
        updatedRecord.ParentEmail = newValue;
        break;
      case 'ParentPhone_x0023_':
        updatedRecord.ParentPhone_x0023_ = newValue;
        break;
      case 'StudentType/Value':
        updatedRecord.StudentType_Value = newValue;
        break;
      case 'School_x0020_Year/Value':
        updatedRecord.School_x0020_Year_Value = newValue;
        break;
      default:
        break;
    }
    
    // Update the selected record state
    setSelectedRecord(updatedRecord);
  };

  // Copy record to clipboard as JSON
  const copyRecordToClipboard = (record) => {
    const recordStr = JSON.stringify(record, null, 2);
    navigator.clipboard.writeText(recordStr);
    toast.success("Record data copied to clipboard as JSON");
  };

  // Get local sorted results from processed records - optimized sorting
  const sortedRecords = useMemo(() => {
    const { column, direction } = sortState;
    const isAsc = direction === 'asc';
    
    // Check if column is a date column for special handling
    const isDateColumn = column === 'exitDate' || column === 'startDateFormatted' || 
                         column === 'regDateFormatted' || column === 'scheduleStart' || 
                         column === 'scheduleEnd';
    
    // Create a collator for string comparison (more efficient than localeCompare for multiple comparisons)
    const collator = new Intl.Collator('en', { sensitivity: 'base' });
    
    return [...filterAndSortRecords].sort((a, b) => {
      let aValue = a[column] || '';
      let bValue = b[column] || '';
      
      // Use correct comparison based on value type
      
      // For numeric fields
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return isAsc ? aValue - bValue : bValue - aValue;
      }
      
      // For date fields (optimize by checking field name first)
      if (isDateColumn && typeof aValue === 'string' && typeof bValue === 'string') {
        // Catch invalid dates and treat them as empty values
        let dateA, dateB;
        try {
          dateA = aValue && aValue !== 'N/A' ? new Date(aValue).getTime() : 0;
        } catch {
          dateA = 0;
        }
        try {
          dateB = bValue && bValue !== 'N/A' ? new Date(bValue).getTime() : 0;
        } catch {
          dateB = 0;
        }
        return isAsc ? dateA - dateB : dateB - dateA;
      }
      
      // For string fields
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        // Use the collator for faster string comparison
        return isAsc ? collator.compare(aValue, bValue) : collator.compare(bValue, aValue);
      }
      
      // Fallback comparison
      if (aValue === bValue) return 0;
      if (aValue === '' || aValue === null || aValue === undefined) return isAsc ? -1 : 1;
      if (bValue === '' || bValue === null || bValue === undefined) return isAsc ? 1 : -1;
      return isAsc ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
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
    
    // Set width classes based on column
    let widthClass = "w-16";
    if (column === "studentEmail") {
      widthClass = "w-[15%] max-w-[150px]"; // Make email column fixed but smaller
    } else if (column === "asn") {
      widthClass = "w-16";
    } else if (column === "studentName") {
      widthClass = "w-24";
    } else if (column === "regDateFormatted" || column === "scheduleStart" || column === "scheduleEnd") {
      widthClass = "w-16";
    } else if (column === "statusValue" || column === "payment_status" || column === "state") {
      widthClass = "w-14";
    } else if (column === "schoolYear") {
      widthClass = "w-16";
    }
    
    return (
      <TableHead 
        className={`cursor-pointer hover:bg-muted/50 transition-colors text-xs px-1.5 py-1 ${widthClass}`}
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
      <div className="container mx-auto p-4 w-full overflow-hidden">
      
        
        {/* Main content */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex gap-2">
            {/* Payment filter toggle */}
            <Button
              variant={filterByPayment ? "default" : "outline"}
              size="sm"
              className="flex items-center"
              onClick={() => setFilterByPayment(!filterByPayment)}
            >
              {filterByPayment ? (
                <>
                  <span className="h-4 w-4 mr-1">💰</span>
                  Paid Only
                </>
              ) : (
                <>
                  <span className="h-4 w-4 mr-1">👥</span>
                  All Records
                </>
              )}
            </Button>
            
            {/* Coding courses toggle */}
            <Button
              variant={includeCoding ? "default" : "outline"}
              size="sm"
              className="flex items-center"
              onClick={() => setIncludeCoding(!includeCoding)}
            >
              {includeCoding ? (
                <>
                  <span className="h-4 w-4 mr-1">💻</span>
                  With Coding
                </>
              ) : (
                <>
                  <span className="h-4 w-4 mr-1">🔍</span>
                  No Coding
                </>
              )}
            </Button>
            
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
        <div className="bg-white rounded-lg shadow-md p-4 overflow-x-auto w-full" style={{ maxWidth: 'calc(100vw - 2rem)', overflowX: 'auto' }}>
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
            
              <Table className="text-xs w-full min-w-[1200px]" style={{ tableLayout: 'fixed' }}>
                <TableCaption className="text-xs">Students with Missing PASI Records</TableCaption>
                <TableHeader>
                  <TableRow className="text-xs">
                    <TableHead className="text-xs px-1 py-1 w-8 sticky left-0 bg-white z-10">✓</TableHead>
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
                    <SortableHeader column="payment_status" label="Payment" />
                    <TableHead className="text-xs px-1 py-1 w-28 min-w-28">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRecords.map((record) => {
                    // Get colors for styling student name
                    const { backgroundColor, textColor } = getColorForName(record.studentName);
                    
                    return (
                      <TableRow key={record.id || record.asn} className="text-xs">
                        <TableCell className="p-1 w-8 sticky left-0 bg-white z-10">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <Checkbox
                                  id={`checked-${record.id}`}
                                  checked={Boolean(record.MissingPasiChecked)}
                                  onCheckedChange={(checked) => {
                                    if (record.id) {
                                      updateMissingPasiStatus(record, Boolean(checked));
                                    }
                                  }}
                                  aria-label="Mark as checked"
                                  className="h-4 w-4"
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Mark this missing PASI record as checked</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="p-1" onClick={(e) => { e.stopPropagation(); handleCellClick(record.asn, "ASN"); }}>{record.asn || 'N/A'}</TableCell>
                        <TableCell 
                          className="p-1 cursor-pointer truncate w-24" 
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
                              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium truncate"
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
                        <TableCell 
                          className="p-1 w-[15%] max-w-[150px] truncate"
                          onClick={(e) => { e.stopPropagation(); handleCellClick(record.studentEmail, "Student Email"); }}
                          title={record.studentEmail || 'N/A'}
                        >
                          {record.studentEmail || 'N/A'}
                        </TableCell>
                        <TableCell 
                          className="p-1"
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
                          className="p-1 cursor-pointer truncate w-16" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCellClick(record.scheduleStart, "Schedule Start");
                          }}
                        >
                          {record.scheduleStart && record.scheduleStart !== 'N/A' ? (
                            <div 
                              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium truncate"
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
                          className="p-1 cursor-pointer truncate w-16" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCellClick(record.scheduleEnd, "Schedule End");
                          }}
                        >
                          {record.scheduleEnd && record.scheduleEnd !== 'N/A' ? (
                            <div 
                              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium truncate"
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
                          className="p-1"
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
                        <TableCell className="p-1 text-xs truncate" onClick={(e) => { e.stopPropagation(); handleCellClick(record.schoolYear, "School Year"); }}>{record.schoolYear || 'N/A'}</TableCell>
                        <TableCell 
                          className="p-1"
                          onClick={(e) => { e.stopPropagation(); handleCellClick(record.courseValue, "Course"); }}
                        >
                          <Badge 
                            variant="outline"
                            className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs py-0 px-1.5"
                          >
                            {record.courseValue || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="p-1">
                          {/* Only show payment status for Adult and International students */}
                          {(record.studentType === 'Adult Student' || record.studentType === 'International Student') ? (
                            <Badge 
                              variant="outline"
                              className={`text-xs py-0 px-1.5 ${
                                record.payment_status === 'paid' 
                                  ? 'bg-green-50 text-green-700 border-green-200' 
                                  : record.payment_status === 'active'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : record.payment_status
                                      ? 'bg-orange-50 text-orange-700 border-orange-200'
                                      : 'bg-gray-50 text-gray-400 border-gray-200'
                              }`}
                            >
                              {record.payment_status || 'None'}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="p-1 w-28 min-w-28">
                          <div className="flex items-center justify-start space-x-1">
                            <div className="flex-shrink-0">
                              <PasiActionButtons asn={record.asn} referenceNumber={record.referenceNumber} />
                            </div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 flex-shrink-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRecordSelect(record);
                                    }}
                                  >
                                    <Info className="h-4 w-4 text-blue-500" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>View detailed information</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
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
          <PasiRecordDetails
            ref={detailCardRef}
            record={selectedRecord}
            onClose={() => setSelectedRecord(null)}
            handleCellClick={handleCellClick}
            onRecordUpdate={handleRecordUpdate}
            isMissingPasi={true}
          />
        )}

        {/* Removed the dialog for removing records since we no longer have the remove button */}
      </div>
    </TooltipProvider>
  );
};

export default MissingPasi;