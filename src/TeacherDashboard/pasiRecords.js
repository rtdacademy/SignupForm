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
  Search, 
  X, 
  ChevronDown, 
  ChevronRight, 
  Edit, 
  AlertTriangle,
  Info, 
  HelpCircle, 
  BellRing,
  BarChart4,
  Filter,
  Settings,
  CheckCircle,
  ClipboardCheck
} from 'lucide-react';
import { useSchoolYear } from '../context/SchoolYearContext';
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../components/ui/pagination";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose, SheetTrigger } from "../components/ui/sheet";
import { Checkbox } from "../components/ui/checkbox";
import { toast } from 'sonner';
// Import Firebase DB functionality
import { getDatabase, ref, update, get } from 'firebase/database';
// Import the PasiActionButtons and MultipleRecordsDisplay components
import PasiActionButtons, { MultipleRecordsDisplay } from "../components/PasiActionButtons";
// Import the new PasiRecordsFilter component
import PasiRecordsFilter from "./PasiRecordsFilter";
// Import the PasiAnalysisDashboard
import PasiAnalysisDashboard from "./PasiAnalysisDashboard";
import CSVFileUpload from '../components/CSVFileUpload';
import PasiCSVPreview from '../components/PasiCSVPreview';
import { processPasiCsvData, savePasiRecords } from '../utils/pasiCsvUtils';
import { useAuth } from '../context/AuthContext'; // If permission checking is needed


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

const PasiRecords = () => {
  // Get PASI records from context
  const { pasiStudentSummariesCombined, isLoadingStudents, currentSchoolYear } = useSchoolYear();
  
  // State for selected record
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  // State for pagination, sorting, and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [sortState, setSortState] = useState({ column: 'studentName', direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for expanded accordions (to track which records are expanded)
  const [expandedAccordions, setExpandedAccordions] = useState({});
  
  // State for selected PASI record for records with multiple entries
  const [selectedPasiRecords, setSelectedPasiRecords] = useState({});
  
  // State to hold filtered records from the filter component
  const [filteredRecords, setFilteredRecords] = useState([]);
  
  // State for showing/hiding the analysis dashboard
  const [showAnalysisDashboard, setShowAnalysisDashboard] = useState(false);
  
  // State for filter sheet open state
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  
  // State for tracking number of active filters
  const [filterCount, setFilterCount] = useState(0);

  // --- BEGIN: Persisted Filter State ---
  const [statusFilter, setStatusFilter] = useState([]);
  const [termFilter, setTermFilter] = useState([]);
  const [courseFilter, setCourseFilter] = useState([]);
  const [dateRangeStart, setDateRangeStart] = useState(null);
  const [dateRangeEnd, setDateRangeEnd] = useState(null);
  const [hasGradeFilter, setHasGradeFilter] = useState(false);
  const [noGradeFilter, setNoGradeFilter] = useState(false);
  const [hasMultipleRecordsFilter, setHasMultipleRecordsFilter] = useState(false);
  const [workItemsFilter, setWorkItemsFilter] = useState([]);
  const [startDateRange, setStartDateRange] = useState({ from: null, to: null });
  const [assignmentDateRange, setAssignmentDateRange] = useState({ from: null, to: null });
  const [resumingOnDateRange, setResumingOnDateRange] = useState({ from: null, to: null });
  const [scheduleEndDateRange, setScheduleEndDateRange] = useState({ from: null, to: null });
  const [selectedMonths, setSelectedMonths] = useState([]);

  // --- BEGIN: New Filter States ---
  // For COM1255 and INF2020 filters
  const [hasCom1255Filter, setHasCom1255Filter] = useState(false);
  const [noCom1255Filter, setNoCom1255Filter] = useState(false);
  const [hasInf2020Filter, setHasInf2020Filter] = useState(false);
  const [noInf2020Filter, setNoInf2020Filter] = useState(false);
  
  // For YourWay Related filters
  const [studentTypeFilter, setStudentTypeFilter] = useState([]);
  const [activeStatusFilter, setActiveStatusFilter] = useState([]);
  const [diplomaMonthFilter, setDiplomaMonthFilter] = useState([]);
  const [statusValueFilter, setStatusValueFilter] = useState([]);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState([]);
  
  // For PASI Related filters
  const [approvedFilter, setApprovedFilter] = useState([]);
  const [deletedFilter, setDeletedFilter] = useState([]);
  const [dualEnrolmentFilter, setDualEnrolmentFilter] = useState([]);
  const [schoolEnrolmentFilter, setSchoolEnrolmentFilter] = useState([]);
  const [pasiStatusFilter, setPasiStatusFilter] = useState([]);
  const [pasiWorkItemsFilter, setPasiWorkItemsFilter] = useState([]);
  const [pasiTermFilter, setPasiTermFilter] = useState([]);
  // --- END: New Filter States ---

  // State for filter accordion open/closed states
  const [openFilterAccordionItems, setOpenFilterAccordionItems] = useState();

  const [isLoadingAsns, setIsLoadingAsns] = useState(true);

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
        // Update local state to reflect the change
        setFilteredRecords(prevRecords => 
          prevRecords.map(r => 
            r.id === record.id 
              ? { ...r, [field]: value } 
              : r
          )
        );
      })
      .catch((error) => {
        console.error(`Error updating ${field}:`, error);
        toast.error(`Failed to update ${field}`);
      });
  };
  
  // Determine if COM1255 is checked
  const isCom1255Checked = (record) => {
    if (record.com1255Checked !== undefined) {
      return record.com1255Checked;
    }
    
    return record.pasiRecords?.com1255 ? true : false;
  };
  
  // Handle COM1255 checkbox change
  const handleCom1255Change = (checked, record, e) => {
    if (e) e.stopPropagation(); // Prevent row selection
    updateRecordField(record, 'com1255Checked', checked);
  };
  
  // Handle Staff Review checkbox change
  const handleStaffReviewChange = (checked, record, e) => {
    if (e) e.stopPropagation(); // Prevent row selection
    updateRecordField(record, 'staffReview', checked);
  };

  // Process the incoming data first to ensure date fields exist for filtering
  const processedDataForFilter = useMemo(() => {
    if (!pasiStudentSummariesCombined) return [];
    
    return pasiStudentSummariesCombined.map(record => {
      // Get start date information
      const startDateInfo = getStartDate(record);
      
      // Format dates properly
      const startDateFormatted = startDateInfo.value 
        ? formatDate(startDateInfo.value, startDateInfo.formatted)
        : 'N/A';
        
      // Format exit date
      const exitDateFormatted = record.exitDate && record.exitDate !== '-'
        ? formatDate(record.exitDate)
        : 'N/A';
      
      // Process multiple records with proper date formatting if they exist
      let formattedMultipleRecords = null;
      if (record.multipleRecords && record.multipleRecords.length > 0) {
        formattedMultipleRecords = record.multipleRecords.map(subRecord => ({
          ...subRecord,
          exitDateFormatted: subRecord.exitDate && subRecord.exitDate !== '-'
            ? formatDate(subRecord.exitDate)
            : 'N/A'
        }));
      }
      
      return {
        ...record,
        startDate: startDateInfo.value,
        startDateFormatted,
        startDateSource: startDateInfo.source,
        exitDateFormatted,
        hasMultipleRecords: record.multipleRecords && record.multipleRecords.length > 0,
        multipleRecords: formattedMultipleRecords || record.multipleRecords
      };
    });
  }, [pasiStudentSummariesCombined]);

  // Toggle accordion expansion
  const toggleAccordion = (recordId, event) => {
    event.stopPropagation();
    setExpandedAccordions(prev => ({
      ...prev,
      [recordId]: !prev[recordId]
    }));
  };
  
  // Function to handle selecting a PASI record from multiple records
  const handleSelectPasiRecord = (recordId, pasiRecord) => {
    setSelectedPasiRecords(prev => ({
      ...prev,
      [recordId]: pasiRecord
    }));
  };

  // Process records to get main records and their children, including proper date formatting
  const processedRecords = useMemo(() => {
    if (!filteredRecords || filteredRecords.length === 0) return [];
    
    return filteredRecords.map(record => {
      // Get start date information
      const startDateInfo = getStartDate(record);
      
      // Format dates properly with timezone consideration
      const startDateFormatted = startDateInfo.value 
        ? formatDate(startDateInfo.value, startDateInfo.formatted)
        : 'N/A';
        
      // Format exit date
      const exitDateFormatted = record.exitDate && record.exitDate !== '-'
        ? formatDate(record.exitDate)
        : 'N/A';
      
      // Process multiple records with proper date formatting if they exist
      let formattedMultipleRecords = null;
      if (record.multipleRecords && record.multipleRecords.length > 0) {
        formattedMultipleRecords = record.multipleRecords.map(subRecord => ({
          ...subRecord,
          exitDateFormatted: subRecord.exitDate && subRecord.exitDate !== '-'
            ? formatDate(subRecord.exitDate)
            : 'N/A'
        }));
      }
      
      return {
        ...record,
        startDate: startDateInfo.value,
        startDateFormatted,
        startDateSource: startDateInfo.source,
        exitDateFormatted,
        hasMultipleRecords: record.multipleRecords && record.multipleRecords.length > 0,
        multipleRecords: formattedMultipleRecords || record.multipleRecords
      };
    });
  }, [filteredRecords]);

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

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Handle receiving filtered records from the filter component
  const handleFilteredDataChange = (newFilteredData, activeFilterCount = 0) => {
    setFilteredRecords(newFilteredData);
    setCurrentPage(1); // Reset to first page when filters change
    setFilterCount(activeFilterCount);
    
    // Reset selected record if it's no longer in the filtered set
    if (selectedRecord) {
      const stillExists = newFilteredData.some(record => 
        record.id === selectedRecord.id && 
        record.referenceNumber === selectedRecord.referenceNumber
      );
      
      if (!stillExists) {
        setSelectedRecord(null);
      }
    }
  };

  // Initialize the filtered records on component mount
  useEffect(() => {
    if (processedDataForFilter && processedDataForFilter.length > 0) {
      setFilteredRecords(processedDataForFilter);
    }
  }, [processedDataForFilter]);

  // Get local sorted results from processed records
  const sortedRecords = useMemo(() => {
    return [...processedRecords].sort((a, b) => {
      let aValue = a[sortState.column] || '';
      let bValue = b[sortState.column] || '';
      
      // Handle workItems sorting based on severity (e.g., Warning > Advice > Unknown > None)
      if (sortState.column === 'workItems') {
        const severityOrder = { 'Warning': 3, 'Advice': 2, 'Unknown': 1 };
        aValue = severityOrder[aValue] || 0;
        bValue = severityOrder[bValue] || 0;
      }

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

  // Handle PASI CSV processing
  const handleProcessPasiCsv = async (csvData) => {
    if (!currentSchoolYear) {
      throw new Error("Please select a school year first");
    }
    const processedData = await processPasiCsvData(csvData, currentSchoolYear, asnEmails);
    return processedData;
  };

  // Handle PASI CSV upload confirmation
  const handleConfirmPasiUpload = async (previewData) => {
    if (!previewData || !previewData.data) {
      throw new Error("No data to upload");
    }
    const result = await savePasiRecords(previewData.data);
    // After successful upload, refresh the data if needed
    return result;
  };

  // Fetch ASN emails for CSV import
  useEffect(() => {
    let isMounted = true;
    const fetchAsns = async () => {
      if (!isMounted) return;
      try {
        const db = getDatabase();
        const asnsRef = ref(db, 'ASNs');
        const snapshot = await get(asnsRef);
        if (!snapshot.exists()) {
          throw new Error('No ASN data found');
        }
        const emailMapping = {};
        snapshot.forEach(childSnapshot => {
          const asn = childSnapshot.key;
          const data = childSnapshot.val();
          const emailKeys = data.emailKeys || {};
          const currentEmail = Object.entries(emailKeys)
            .find(([_, value]) => value === true)?.[0];
          if (currentEmail) {
            const formattedEmail = currentEmail.replace(/,/g, '.');
            emailMapping[asn] = formattedEmail;
          }
        });
        if (isMounted) {
          setAsnEmails(emailMapping);
        }
      } catch (error) {
        console.error('Error fetching ASNs:', error);
        toast.error("Failed to fetch ASN data: " + error.message);
      } finally {
        if (isMounted) {
          setIsLoadingAsns(false);
        }
      }
    };
    fetchAsns();
    return () => { isMounted = false; };
  }, []);

  // Required PASI CSV fields
  const requiredPasiFields = [
    'ASN', 'Work Items', ' Code', 'Student Name', ' Description',
    'Status', 'School Enrolment', 'Value', 'Approved?', 'Assignment Date',
    'Credits Attempted', 'Deleted?', 'Dual Enrolment?', 'Exit Date',
    'Funding Requested?', 'Term', 'Reference #'
  ];

  return (
    <TooltipProvider>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <FileText className="mr-2" /> PASI Records Management
        </h1>
        
        {/* Filter Sheet */}
        <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="mb-4 flex items-center"
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
              <SheetTitle>Filter PASI Records</SheetTitle>
              <SheetDescription>
                Apply filters to find specific PASI records
              </SheetDescription>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto pr-6">
              <PasiRecordsFilter 
                pasiStudentSummariesCombined={processedDataForFilter}
                onFilteredDataChange={handleFilteredDataChange}
                
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                termFilter={termFilter}
                setTermFilter={setTermFilter}
                courseFilter={courseFilter}
                setCourseFilter={setCourseFilter}
                dateRangeStart={dateRangeStart}
                setDateRangeStart={setDateRangeStart}
                dateRangeEnd={dateRangeEnd}
                setDateRangeEnd={setDateRangeEnd}
                hasGradeFilter={hasGradeFilter}
                setHasGradeFilter={setHasGradeFilter}
                noGradeFilter={noGradeFilter}
                setNoGradeFilter={setNoGradeFilter}
                hasMultipleRecordsFilter={hasMultipleRecordsFilter}
                setHasMultipleRecordsFilter={setHasMultipleRecordsFilter}
                workItemsFilter={workItemsFilter}
                setWorkItemsFilter={setWorkItemsFilter}
                startDateRange={startDateRange}
                setStartDateRange={setStartDateRange}
                assignmentDateRange={assignmentDateRange}
                setAssignmentDateRange={setAssignmentDateRange}
                resumingOnDateRange={resumingOnDateRange}
                setResumingOnDateRange={setResumingOnDateRange}
                scheduleEndDateRange={scheduleEndDateRange}
                setScheduleEndDateRange={setScheduleEndDateRange}
                selectedMonths={selectedMonths}
                setSelectedMonths={setSelectedMonths}
                
                
                hasCom1255Filter={hasCom1255Filter}
                setHasCom1255Filter={setHasCom1255Filter}
                noCom1255Filter={noCom1255Filter}
                setNoCom1255Filter={setNoCom1255Filter}
                hasInf2020Filter={hasInf2020Filter}
                setHasInf2020Filter={setHasInf2020Filter}
                noInf2020Filter={noInf2020Filter}
                setNoInf2020Filter={setNoInf2020Filter}
                
               
                studentTypeFilter={studentTypeFilter}
                setStudentTypeFilter={setStudentTypeFilter}
                activeStatusFilter={activeStatusFilter}
                setActiveStatusFilter={setActiveStatusFilter}
                diplomaMonthFilter={diplomaMonthFilter}
                setDiplomaMonthFilter={setDiplomaMonthFilter}
                statusValueFilter={statusValueFilter}
                setStatusValueFilter={setStatusValueFilter}
                paymentStatusFilter={paymentStatusFilter}
                setPaymentStatusFilter={setPaymentStatusFilter}
                
                
                approvedFilter={approvedFilter}
                setApprovedFilter={setApprovedFilter}
                deletedFilter={deletedFilter}
                setDeletedFilter={setDeletedFilter}
                dualEnrolmentFilter={dualEnrolmentFilter}
                setDualEnrolmentFilter={setDualEnrolmentFilter}
                schoolEnrolmentFilter={schoolEnrolmentFilter}
                setSchoolEnrolmentFilter={setSchoolEnrolmentFilter}
                pasiStatusFilter={pasiStatusFilter}
                setPasiStatusFilter={setPasiStatusFilter}
                pasiWorkItemsFilter={pasiWorkItemsFilter}
                setPasiWorkItemsFilter={setPasiWorkItemsFilter}
                pasiTermFilter={pasiTermFilter}
                setPasiTermFilter={setPasiTermFilter}

                openAccordionItems={openFilterAccordionItems}
                setOpenAccordionItems={setOpenFilterAccordionItems}
              />
            </div>
            
            <SheetFooter className="mt-4 border-t pt-4">
              <SheetClose asChild>
                <Button variant="outline">Done</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        
        {/* Main content */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex gap-2">
            {/* Add the CSV Upload component here */}
            <CSVFileUpload
              buttonText="Import PASI CSV"
              buttonVariant="outline"
              disabled={isLoadingAsns || !currentSchoolYear}
              title="PASI CSV Import Preview"
              description="Review the data before uploading to the database"
              requiredFields={requiredPasiFields}
              onDataProcessed={handleProcessPasiCsv}
              onConfirmUpload={handleConfirmPasiUpload}
              renderPreview={(previewData) => (
                <PasiCSVPreview previewData={previewData} />
              )}
            />
            {/* Filter button already handled in Sheet trigger above */}
          </div>
          
          {/* Analysis Dashboard Button */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAnalysisDashboard(true)}
            className="flex items-center"
          >
            <BarChart4 className="h-4 w-4 mr-1" /> View Analysis Dashboard
          </Button>
        </div>
        
        {/* Analysis Dashboard Sheet */}
        <PasiAnalysisDashboard 
          records={processedRecords}
          isOpen={showAnalysisDashboard}
          onClose={() => setShowAnalysisDashboard(false)}
        />
    
        {/* PASI Records Table */}
        <div className="bg-white rounded-lg shadow-md p-4 overflow-x-auto">
          {isLoadingStudents ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
              <span>Loading records...</span>
            </div>
          ) : paginatedRecords && paginatedRecords.length > 0 ? (
            <Table className="text-xs w-full">
              <TableCaption className="text-xs">List of PASI Student Records</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-6"></TableHead>
                  <SortableHeader column="asn" label="ASN" />
                  <SortableHeader column="courseCode" label="Course Code" />
                  <SortableHeader column="studentName" label="Student Name" />
                  <SortableHeader column="startDateFormatted" label="Reg Date" />
                  <SortableHeader column="term" label="Term" />
                  <SortableHeader column="status" label="Status" />
                  <SortableHeader column="value" label="Grade" />
                  <SortableHeader column="exitDate" label="Exit Date" />
                  <SortableHeader column="workItems" label={<AlertTriangle className="h-3 w-3" />} />
                  {/* New column headers for checkboxes */}
                  <TableHead className="px-1 py-1 text-xs w-6 max-w-6" title="COM1255">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <CheckCircle className="h-3 w-3" />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>COM1255</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableHead>
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
                  <TableHead className="text-xs px-2 py-1 w-14 max-w-14 truncate">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRecords.map((record) => {
                  const isSelected = selectedRecord?.id === record.id && 
                                    selectedRecord?.referenceNumber === record.referenceNumber;
                  const isExpanded = expandedAccordions[record.id] || false;
                  
                  // Get colors for styling student name
                  const { backgroundColor, textColor } = getColorForName(record.studentName);
                  
                  return (
                    <React.Fragment key={record.id || record.asn}>
                      {/* Main Record Row */}
                      <TableRow 
                        onClick={() => {
                          console.log('Main Record Clicked:', record); // Log the record
                          handleRecordSelect(record);
                        }}
                        className={`
                          cursor-pointer 
                          hover:bg-gray-100 
                          ${isSelected ? 'bg-blue-50' : ''} 
                          border-b border-gray-200
                        `}
                      >
                        <TableCell className="p-1 w-6">
                          {record.hasMultipleRecords ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0"
                              onClick={(e) => toggleAccordion(record.id, e)}
                            >
                              {isExpanded ? 
                                <ChevronDown className="h-3 w-3" /> : 
                                <ChevronRight className="h-3 w-3" />
                              }
                            </Button>
                          ) : null}
                        </TableCell>
                        
                        <TableCell 
                          className="p-1 cursor-pointer truncate max-w-14 w-14" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCellClick(record.asn, "ASN");
                          }}
                        >
                          {record.asn || 'N/A'}
                        </TableCell>
                        
                        <TableCell 
                          className="p-1 cursor-pointer truncate max-w-16 w-16" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCellClick(record.courseCode, "Course Code");
                          }}
                        >
                          {record.courseCode || 'N/A'}
                        </TableCell>
                        
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
                        
                        {/* Registration Date Cell */}
                        <TableCell 
                          className="p-1 cursor-pointer truncate max-w-20 w-20" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCellClick(record.startDateFormatted, "Registration Date");
                          }}
                        >
                          {record.startDateFormatted && record.startDateFormatted !== 'N/A' ? (
                            <div 
                              className="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium truncate"
                              style={{
                                backgroundColor: '#dbeafe', // blue-100
                                color: '#1e40af' // blue-800
                              }}
                            >
                              {formatUserFriendlyDate(record.startDateFormatted, true)}
                            </div>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        
                        <TableCell 
                          className="p-1 cursor-pointer truncate max-w-16 w-16" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCellClick(record.term || record.pasiTerm, "Term");
                          }}
                        >
                          <Badge 
                            variant="outline" 
                            className="bg-blue-50 text-blue-700 border-blue-200 text-xs py-0 px-1.5 truncate"
                          >
                            {record.term || record.pasiTerm || 'N/A'}
                          </Badge>
                        </TableCell>
                        
                        <TableCell 
                          className="p-1 cursor-pointer truncate max-w-16 w-16" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCellClick(record.status, "Status");
                          }}
                        >
                          <Badge 
                            variant={record.status === 'Completed' ? 'success' : 'secondary'}
                            className={`
                              text-xs py-0 px-1.5 truncate
                              ${record.status === 'Completed' 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : record.status === 'Active'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }
                            `}
                          >
                            {record.status || 'N/A'}
                          </Badge>
                        </TableCell>
                        
                        <TableCell 
                          className="p-1 cursor-pointer truncate max-w-10 w-10" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCellClick(record.value, "Grade");
                          }}
                        >
                          {record.value && record.value !== '-' ? (
                            <div className="flex items-center gap-1 cursor-pointer">
                              <Edit className="h-3 w-3 text-blue-500" />
                              <span className="font-medium truncate">{record.value}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        
                        <TableCell 
                          className="p-1 cursor-pointer truncate max-w-20 w-20" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCellClick(record.exitDateFormatted || record.exitDate, "Exit Date");
                          }}
                        >
                          {record.exitDateFormatted && record.exitDateFormatted !== 'N/A' ? (
                            <div 
                              className="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium truncate"
                              style={{
                                backgroundColor: '#fee2e2', // red-100
                                color: '#b91c1c' // red-800
                              }}
                            >
                              <Edit className="h-2.5 w-2.5 mr-1 flex-shrink-0" />
                              <span className="truncate">{formatUserFriendlyDate(record.exitDateFormatted, true)}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        
                        {/* Work Items Cell */}
                        <TableCell className="p-1 w-6 max-w-6">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center justify-center">
                                  {(() => {
                                    if (!record.workItems) return null;
                                    if (record.workItems === 'Advice') {
                                      return <Info className="h-3 w-3 text-blue-500" />;
                                    } else if (record.workItems === 'Warning') {
                                      return <AlertTriangle className="h-3 w-3 text-amber-500" />;
                                    } else if (record.workItems === 'Unknown') {
                                      return <HelpCircle className="h-3 w-3 text-purple-500" />;
                                    } else {
                                      return <BellRing className="h-3 w-3 text-gray-500" />;
                                    }
                                  })()}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{record.workItems || 'No work items'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        
                        {/* COM1255 Checkbox Cell */}
                        <TableCell className="p-0 w-6 max-w-6">
                          <div onClick={(e) => e.stopPropagation()} className="flex justify-center">
                            <Checkbox 
                              checked={isCom1255Checked(record)}
                              onCheckedChange={(checked) => handleCom1255Change(checked, record)}
                              className="h-4 w-4 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                              aria-label="COM1255 Checkbox"
                            />
                          </div>
                        </TableCell>
                        
                        {/* Staff Review Checkbox Cell */}
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
                        
                        <TableCell className="p-1 w-14 max-w-14 truncate">
                          {record.hasMultipleRecords ? (
                            <MultipleRecordsDisplay 
                              records={record.multipleRecords}
                              asn={record.asn}
                              onSelect={(selectedRecord) => handleSelectPasiRecord(record.id, selectedRecord)}
                              selectedRecord={selectedPasiRecords[record.id]}
                            />
                          ) : (
                            <PasiActionButtons 
                              asn={record.asn} 
                              referenceNumber={record.referenceNumber} 
                            />
                          )}
                        </TableCell>
                      </TableRow>
                      
                      {/* Accordion content for multiple records */}
                      {record.hasMultipleRecords && isExpanded && record.multipleRecords
                        .filter((subRecord, index) => !(subRecord.referenceNumber === record.referenceNumber && index === 0))
                        .map((subRecord, index) => {
                          const subRecordData = {
                            ...record,
                            ...subRecord,
                            isSubRecord: true,
                            parentRecordId: record.id,
                            subRecordIndex: index + 1
                          };

                          return (
                            <TableRow 
                              key={`${record.id}_sub_${index}`}
                              onClick={() => {
                                console.log('Sub Record Clicked:', subRecordData); // Log the sub-record data
                                handleRecordSelect(subRecordData);
                              }}
                              className="cursor-pointer hover:bg-gray-100 bg-gray-50 border-b border-dashed border-gray-200"
                            >
                              <TableCell className="p-1 w-6">
                                <Badge variant="outline" className="h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                                  {index + 1}
                                </Badge>
                              </TableCell>
                              
                              <TableCell className="p-1 text-gray-500 truncate max-w-14 w-14">
                                {record.asn || '-'}
                              </TableCell>
                              
                              <TableCell className="p-1 text-gray-500 truncate max-w-16 w-16">
                                {record.courseCode || 'N/A'}
                              </TableCell>
                              
                              <TableCell className="p-1 text-gray-500 truncate max-w-32 w-32">
                                <div className="opacity-70 truncate">
                                  {record.studentName || 'N/A'}
                                </div>
                              </TableCell>
                              
                              {/* Registration Date for Sub Record */}
                              <TableCell className="p-1 text-gray-500 truncate max-w-20 w-20">
                                {record.startDateFormatted && record.startDateFormatted !== 'N/A' ? (
                                  <div className="opacity-70">
                                    {formatUserFriendlyDate(record.startDateFormatted, true)}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">N/A</span>
                                )}
                              </TableCell>
                              
                              <TableCell className="p-1 truncate max-w-16 w-16">
                                <Badge 
                                  variant="outline" 
                                  className="bg-purple-50 text-purple-700 border-purple-200 text-xs py-0 px-1.5 truncate"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCellClick(subRecord.term, "Term");
                                  }}
                                >
                                  {subRecord.term || 'N/A'}
                                </Badge>
                              </TableCell>
                              
                              <TableCell className="p-1 truncate max-w-16 w-16">
                                <Badge 
                                  variant={subRecord.status === 'Completed' ? 'success' : 'secondary'}
                                  className={`
                                    text-xs py-0 px-1.5 truncate
                                    ${subRecord.status === 'Completed' 
                                      ? 'bg-green-50 text-green-700 border-green-200' 
                                      : subRecord.status === 'Active'
                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }
                                  `}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCellClick(subRecord.status, "Status");
                                  }}
                                >
                                  {subRecord.status || 'N/A'}
                                </Badge>
                              </TableCell>
                              
                              <TableCell className="p-1 text-gray-500 truncate max-w-10 w-10">
                                {record.value && record.value !== '-' ? record.value : '-'}
                              </TableCell>
                              
                              <TableCell className="p-1 truncate max-w-20 w-20">
                                {subRecord.exitDateFormatted && subRecord.exitDateFormatted !== 'N/A' ? (
                                  <div 
                                    className="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium truncate cursor-pointer"
                                    style={{
                                      backgroundColor: '#e9d5ff', // purple-100
                                      color: '#7e22ce' // purple-800
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCellClick(subRecord.exitDateFormatted, "Exit Date");
                                    }}
                                  >
                                    <Edit className="h-2.5 w-2.5 mr-1 flex-shrink-0" />
                                    <span className="truncate">{formatUserFriendlyDate(subRecord.exitDateFormatted, true)}</span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">N/A</span>
                                )}
                              </TableCell>

                              {/* Work Items Cell for Sub-Record */}
                              <TableCell className="p-1 w-8 max-w-8">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center justify-center">
                                        {(() => {
                                          // Use subRecord's workItems if available, otherwise fallback to main record's
                                          const workItems = subRecord.workItems || record.workItems; 
                                          if (!workItems) return null;
                                          if (workItems === 'Advice') {
                                            return <Info className="h-3 w-3 text-blue-400 opacity-70" />;
                                          } else if (workItems === 'Warning') {
                                            return <AlertTriangle className="h-3 w-3 text-amber-400 opacity-70" />;
                                          } else if (workItems === 'Unknown') {
                                            return <HelpCircle className="h-3 w-3 text-purple-400 opacity-70" />;
                                          } else {
                                            return <BellRing className="h-3 w-3 text-gray-400 opacity-70" />;
                                          }
                                        })()}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{subRecord.workItems || record.workItems || 'No work items'}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </TableCell>
                              
                              {/* COM1255 Checkbox for Sub-Record - disabled and inherits from parent */}
                              <TableCell className="p-1 w-10 max-w-10">
                                <div onClick={(e) => e.stopPropagation()} className="flex justify-center">
                                  <Checkbox 
                                    checked={isCom1255Checked(record)}
                                    disabled={true}
                                    className="h-4 w-4 opacity-50"
                                    aria-label="COM1255 Checkbox (Inherited)"
                                  />
                                </div>
                              </TableCell>
                              
                              {/* Staff Review Checkbox for Sub-Record - disabled and inherits from parent */}
                              <TableCell className="p-1 w-10 max-w-10">
                                <div onClick={(e) => e.stopPropagation()} className="flex justify-center">
                                  <Checkbox 
                                    checked={record.staffReview === true}
                                    disabled={true}
                                    className="h-4 w-4 opacity-50"
                                    aria-label="Staff Review Checkbox (Inherited)"
                                  />
                                </div>
                              </TableCell>
                              
                              <TableCell className="p-1 w-14 max-w-14 truncate">
                                <PasiActionButtons 
                                  asn={record.asn} 
                                  referenceNumber={subRecord.referenceNumber} 
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              {pasiStudentSummariesCombined && pasiStudentSummariesCombined.length > 0 
                ? 'No matching records found with the current filters.' 
                : 'No PASI records found for the current school year.'}
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
                PASI Record Details
                {selectedRecord.isSubRecord && (
                  <Badge className="ml-2 bg-purple-100 text-purple-800 border-purple-300 text-xs">
                    Additional Record {selectedRecord.subRecordIndex}
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
                    <dd className="cursor-pointer hover:text-blue-600" onClick={() => handleCellClick(selectedRecord.term || selectedRecord.pasiTerm, "Term")}>
                      <Badge className="text-xs py-0 px-1.5">{selectedRecord.term || selectedRecord.pasiTerm || 'N/A'}</Badge>
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
                    
                    <dt className="font-medium text-gray-500">Reference #:</dt>
                    <dd className="cursor-pointer hover:text-blue-600 break-all" onClick={() => handleCellClick(selectedRecord.referenceNumber, "Reference Number")}>
                      {selectedRecord.referenceNumber || 'N/A'}
                    </dd>
                    
                    {/* Added COM1255 Status to Details */}
                    <dt className="font-medium text-gray-500">COM1255:</dt>
                    <dd className="flex items-center gap-2">
                      <Checkbox 
                        checked={isCom1255Checked(selectedRecord)}
                        onCheckedChange={(checked) => handleCom1255Change(checked, selectedRecord)}
                        className="h-4 w-4 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                      />
                      <span>{isCom1255Checked(selectedRecord) ? 'Checked' : 'Not checked'}</span>
                    </dd>
                    
                    {/* Added Staff Review Status to Details */}
                    <dt className="font-medium text-gray-500">Staff Review:</dt>
                    <dd className="flex items-center gap-2">
                      <Checkbox 
                        checked={selectedRecord.staffReview === true}
                        onCheckedChange={(checked) => handleStaffReviewChange(checked, selectedRecord)}
                        className="h-4 w-4 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <span>{selectedRecord.staffReview ? 'Reviewed' : 'Not reviewed'}</span>
                    </dd>
                    
                    {/* Added Work Items to Details */}
                    {selectedRecord.workItems && (
                      <>
                        <dt className="font-medium text-gray-500">Work Items:</dt>
                        <dd className="flex items-center gap-1">
                          {(() => {
                            if (selectedRecord.workItems === 'Advice') {
                              return <Info className="h-3 w-3 text-blue-500" />;
                            } else if (selectedRecord.workItems === 'Warning') {
                              return <AlertTriangle className="h-3 w-3 text-amber-500" />;
                            } else if (selectedRecord.workItems === 'Unknown') {
                              return <HelpCircle className="h-3 w-3 text-purple-500" />;
                            } else {
                              return <BellRing className="h-3 w-3 text-gray-500" />;
                            }
                          })()}
                          {selectedRecord.workItems}
                        </dd>
                      </>
                    )}
                  </dl>
                </div>
              </div>
              
              {/* Additional Information about Multiple Records */}
              {!selectedRecord.isSubRecord && selectedRecord.multipleRecords && selectedRecord.multipleRecords.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2 text-sm">Multiple PASI Records</h3>
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                    <p className="text-amber-800 flex items-center mb-2">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      This student has multiple PASI records for this course
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedRecord.multipleRecords.map((record, index) => (
                        <div key={record.referenceNumber || index} className="bg-white border border-gray-200 rounded-md p-2">
                          <div className="flex justify-between items-center mb-1">
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                              Record {index + 1}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {record.referenceNumber === selectedRecord.referenceNumber ? '(Current)' : ''}
                            </span>
                          </div>
                          <dl className="grid grid-cols-[1fr_1.5fr] gap-1 text-xs">
                            <dt className="font-medium text-gray-500">Status:</dt>
                            <dd>{record.status || 'N/A'}</dd>
                            
                            <dt className="font-medium text-gray-500">Term:</dt>
                            <dd>{record.term || 'N/A'}</dd>
                            
                            <dt className="font-medium text-gray-500">Exit Date:</dt>
                            <dd>{record.exitDateFormatted ? 
                                formatUserFriendlyDate(record.exitDateFormatted, true) : 
                                (record.exitDate ? formatUserFriendlyDate(record.exitDate) : 'N/A')}
                            </dd>
                          </dl>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
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

export default PasiRecords;