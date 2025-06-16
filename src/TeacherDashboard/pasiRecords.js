import React, { useState, useMemo, useEffect, useRef } from 'react';
import PasiRecordDetails from './PasiRecordDetails';
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
  ClipboardCheck,
  Link2,
  Wrench,
  Mail,
  ExternalLink
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
import { useAuth } from '../context/AuthContext'; // If permission checking is needed
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../components/ui/dialog";
import { COURSE_OPTIONS } from '../config/DropdownOptions';


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

// Format date for user-friendly display is now in PasiRecordDetails component

const PasiRecords = () => {
  // Get PASI records from context - now using the combined data from pasiRecordsNew
  const { pasiStudentSummariesCombined, isLoadingStudents, currentSchoolYear, refreshStudentSummaries } = useSchoolYear();
  
  // Ref for detail card
  const detailCardRef = useRef(null);
  
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

  // State for email editing dialog
  const [isEmailEditDialogOpen, setIsEmailEditDialogOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState(null);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

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

  // Function to open email edit dialog
  const handleOpenEmailEditDialog = (record, e) => {
    if (e) e.stopPropagation(); // Prevent row selection
    setRecordToEdit(record);
    setIsEmailEditDialogOpen(true);
  };
  
  // Function to update email and summaryKey in PASI record using pasiRecordsNew structure
  const handleUpdatePasiRecordEmail = async (recordId, newEmail, summaryKey = null) => {
    if (!recordId || !newEmail) return;
    
    setIsUpdatingEmail(true);
    try {
      const db = getDatabase();
      
      // Find the record's school year and construct the proper path for pasiRecordsNew
      const record = pasiStudentSummariesCombined.find(r => r.id === recordId);
      if (!record) {
        throw new Error('Record not found');
      }
      
      // Format school year for pasiRecordsNew path (e.g., "2024/2025" -> "24_25")
      const schoolYear = record.schoolYear || record.School_x0020_Year_Value || currentSchoolYear;
      let formattedYear = '';
      if (schoolYear) {
        const yearParts = schoolYear.split('/');
        if (yearParts.length === 2) {
          formattedYear = `${yearParts[0].slice(-2)}_${yearParts[1].slice(-2)}`;
        }
      }
      
      if (!formattedYear) {
        throw new Error('Unable to determine school year for record update');
      }
      
      // Update the email in the PASI record using pasiRecordsNew structure
      const updates = {};
      updates[`pasiRecordsNew/${formattedYear}/${recordId}/StudentEmail`] = newEmail;
      
      // If summaryKey is provided, update it as well
      if (summaryKey !== null) {
        updates[`pasiRecordsNew/${formattedYear}/${recordId}/summaryKey`] = summaryKey;
        
        // Also set the linked status to true if a summaryKey is provided
        updates[`pasiRecordsNew/${formattedYear}/${recordId}/linked`] = true;
      }
      
      await update(ref(db), updates);
      
      // Success message
      if (summaryKey) {
        toast.success(`PASI record fixed! Email: ${newEmail}, linked with key: ${summaryKey}`);
      } else {
        toast.success(`Email updated successfully to ${newEmail}`);
      }
      
      // Refresh data from context
      refreshStudentSummaries();
      
      setIsEmailEditDialogOpen(false);
      setRecordToEdit(null);
    } catch (error) {
      console.error('Error updating PASI record:', error);
      toast.error(error.message || 'Failed to update record');
    } finally {
      setIsUpdatingEmail(false);
    }
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
      
      // Add a linkStatus field for sorting
      const linkStatus = record.summaryKey ? 'linked' : 'unlinked';
      
      return {
        ...record,
        startDate: startDateInfo.value,
        startDateFormatted,
        startDateSource: startDateInfo.source,
        exitDateFormatted,
        hasMultipleRecords: record.multipleRecords && record.multipleRecords.length > 0,
        multipleRecords: formattedMultipleRecords || record.multipleRecords,
        linkStatus // Add the linkStatus field for sorting
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
      
      // Add a linkStatus field for sorting
      const linkStatus = record.summaryKey ? 'linked' : 'unlinked';
      
      return {
        ...record,
        startDate: startDateInfo.value,
        startDateFormatted,
        startDateSource: startDateInfo.source,
        exitDateFormatted,
        hasMultipleRecords: record.multipleRecords && record.multipleRecords.length > 0,
        multipleRecords: formattedMultipleRecords || record.multipleRecords,
        linkStatus // Add the linkStatus field for sorting
      };
    });
  }, [filteredRecords]);

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
      
      // Handle linkStatus sorting (linked should appear before unlinked)
      if (sortState.column === 'linkStatus') {
        // For linkStatus, we might want to sort in a specific order (linked first, then unlinked)
        const order = { 'linked': 1, 'unlinked': 2 };
        aValue = order[aValue] || 3;
        bValue = order[bValue] || 3;
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

  return (
    <TooltipProvider>
      <div className="container mx-auto p-4">
        {/* Main content */}
        <div className="mb-4 flex justify-between items-center">
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
                  <SortableHeader column="linkStatus" label="Linked" />
                  <TableHead className="text-xs px-1 py-1 w-32 max-w-32 truncate">Actions</TableHead>
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
                              {record.startDateFormatted}
                            </div>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        
                        <TableCell 
                          className="p-1 cursor-pointer truncate max-w-16 w-16" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCellClick(record.displayTerm || record.term || record.pasiTerm, "Term");
                          }}
                        >
                          <Badge 
                            variant="outline" 
                            className="bg-blue-50 text-blue-700 border-blue-200 text-xs py-0 px-1.5 truncate"
                          >
                            {record.displayTerm || record.term || record.pasiTerm || 'N/A'}
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
                              <span className="truncate">{record.exitDateFormatted}</span>
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
                        
                        {/* Link Status Cell */}
                        <TableCell className="p-0 w-10 max-w-10">
                          <div className="flex justify-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost" 
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => handleOpenEmailEditDialog(record, e)}
                                  >
                                    {record.recordType === 'linked' ? (
                                      <Link2 className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <Wrench className="h-4 w-4 text-amber-600" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  {record.recordType === 'linked' ? (
                                    <p>Record linked - Click to edit</p>
                                  ) : (
                                    <p>Record not linked - Click to link</p>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                        
                        {/* Actions Cell */}
                        <TableCell className="p-1 w-32 max-w-32 truncate">
                          <div className="flex items-center space-x-1">
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
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
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
                                    {record.startDateFormatted}
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
                                    handleCellClick(subRecord.displayTerm || subRecord.term, "Term");
                                  }}
                                >
                                  {subRecord.displayTerm || subRecord.term || 'N/A'}
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
                                    <span className="truncate">{subRecord.exitDateFormatted}</span>
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
                              
                              {/* Link Status for Sub-Record */}
                              <TableCell className="p-0 w-10 max-w-10">
                                <div className="flex justify-center">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0 opacity-50"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenEmailEditDialog({
                                              ...record,
                                              ...subRecord,
                                              id: subRecord.id || record.id
                                            }, e);
                                          }}
                                        >
                                          {subRecord.recordType === 'linked' ? (
                                            <Link2 className="h-4 w-4 text-green-600" />
                                          ) : (
                                            <Wrench className="h-4 w-4 text-amber-600" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        {subRecord.recordType === 'linked' ? (
                                          <p>Record linked - Click to edit</p>
                                        ) : (
                                          <p>Record not linked - Click to link</p>
                                        )}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </TableCell>
                              
                              <TableCell className="p-1 w-32 max-w-32 truncate">
                                <div className="flex items-center space-x-1">
                                  <PasiActionButtons 
                                    asn={record.asn} 
                                    referenceNumber={subRecord.referenceNumber} 
                                  />
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 w-7 p-0"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const subRecordData = {
                                              ...record,
                                              ...subRecord,
                                              isSubRecord: true,
                                              parentRecordId: record.id,
                                              subRecordIndex: index + 1
                                            };
                                            handleRecordSelect(subRecordData);
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
          <PasiRecordDetails
            ref={detailCardRef}
            record={selectedRecord}
            onClose={() => setSelectedRecord(null)}
            onStaffReviewChange={handleStaffReviewChange}
            onEmailEdit={handleOpenEmailEditDialog}
            handleCellClick={handleCellClick}
            onRecordUpdate={handleRecordUpdate}
          />
        )}

        {/* Email Edit Dialog */}
        <EmailEditDialog 
          isOpen={isEmailEditDialogOpen}
          onClose={() => setIsEmailEditDialogOpen(false)}
          record={recordToEdit}
          onUpdate={handleUpdatePasiRecordEmail}
          isUpdating={isUpdatingEmail}
        />
      </div>
    </TooltipProvider>
  );
};

// Email Edit Dialog Component
const EmailEditDialog = ({ record, isOpen, onClose, onUpdate, isUpdating }) => {
  const [newEmail, setNewEmail] = useState(record?.email || '');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [summaryKey, setSummaryKey] = useState(record?.summaryKey || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (record) {
      setNewEmail(record.StudentEmail || record.email || '');
      setSummaryKey(record.summaryKey || '');
      setSelectedCourseId('');
      setError('');
    }
  }, [record]);

  const handleEmailChange = (e) => {
    setNewEmail(e.target.value);
    // Clear error when user types
    if (error) setError('');
    
    // Auto-update summary key when email changes if course is selected
    if (selectedCourseId) {
      const sanitizedEmail = sanitizeEmail(e.target.value);
      setSummaryKey(`${sanitizedEmail}_${selectedCourseId}`);
    }
  };

  const handleCourseChange = (courseId) => {
    setSelectedCourseId(courseId);
    
    // Auto-update summary key when course changes
    if (courseId && newEmail) {
      const sanitizedEmail = sanitizeEmail(newEmail);
      setSummaryKey(`${sanitizedEmail}_${courseId}`);
    }
  };

  const handleSummaryKeyChange = (e) => {
    setSummaryKey(e.target.value);
  };

  const handleSubmit = () => {
    // Simple email validation
    if (!newEmail || !newEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    onUpdate(record.id, newEmail, summaryKey);
  };

  // Group courses by grade for easier selection
  const coursesByGrade = COURSE_OPTIONS.reduce((acc, course) => {
    const grade = course.grade || 'Other';
    if (!acc[grade]) {
      acc[grade] = [];
    }
    acc[grade].push(course);
    return acc;
  }, {});

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Fix PASI Record</DialogTitle>
          <DialogDescription>
            Update email and link {record?.studentName}'s PASI record to a YourWay course.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="current-email" className="text-sm font-medium text-gray-700">
              Current Email
            </label>
            <Input 
              id="current-email" 
              value={record?.StudentEmail || record?.email || ''} 
              disabled 
              className="bg-gray-50"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="new-email" className="text-sm font-medium text-gray-700">
              New Email
            </label>
            <Input 
              id="new-email" 
              value={newEmail} 
              onChange={handleEmailChange}
              placeholder="Enter new email address"
              disabled={isUpdating}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="course-select" className="text-sm font-medium text-gray-700">
              YourWay Course
            </label>
            <Select
              onValueChange={handleCourseChange}
              value={selectedCourseId}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a course to link" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(coursesByGrade).sort((a, b) => {
                  // Convert 'Other' to a high number so it appears last
                  const aNum = a === 'Other' ? 9999 : parseInt(a);
                  const bNum = b === 'Other' ? 9999 : parseInt(b);
                  return aNum - bNum;
                }).map(grade => (
                  <div key={grade}>
                    <p className="px-2 pt-1 text-xs text-muted-foreground">Grade {grade}</p>
                    {coursesByGrade[grade].map(course => (
                      <SelectItem key={course.courseId} value={course.courseId.toString()}>
                        <div className="flex items-center">
                          <span className="mr-2" style={{ color: course.color }}>
                            {course.icon && <course.icon className="h-4 w-4 inline mr-1" />}
                            {course.value}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            (ID: {course.courseId}{course.pasiCode ? `, PASI: ${course.pasiCode}` : ''})
                          </span>
                        </div>
                      </SelectItem>
                    ))}</div>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between items-center">
                <label htmlFor="summary-key" className="text-sm font-medium text-gray-700">
                  Summary Key
                </label>
                <span className="text-xs text-muted-foreground">Auto-generated from Email + Course</span>
              </div>
              <Input 
                id="summary-key" 
                value={summaryKey} 
                onChange={handleSummaryKeyChange}
                placeholder="e.g., student,email,com_89"
                disabled={isUpdating}
                className={summaryKey ? "bg-blue-50 font-mono text-sm" : "font-mono text-sm"}
              />
              <p className="text-xs text-muted-foreground">
                Links PASI record to a specific YourWay course. Format: sanitizedEmail_courseId
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Fix Record'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
};

export default PasiRecords;