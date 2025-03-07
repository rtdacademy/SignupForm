import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Upload, 
  ExternalLink, 
  Search, 
  X, 
  ArrowUp, 
  ArrowDown,
  Copy,
  EyeIcon,
  Link2,
  AlertTriangle,
  Trash,
  CleanIcon,
  Sparkles, 
  Loader2,
  AlertCircle,
  UserPlus,
  XCircle,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import Papa from 'papaparse';
import { toast, Toaster } from 'sonner';
import { getSchoolYearOptions } from '../config/DropdownOptions';
import PASIPreviewDialog from './PASIPreviewDialog';
import { getDatabase, ref, query, orderByChild, equalTo, onValue, off, get, update, remove } from 'firebase/database';
import { validatePasiRecordsLinkStatus } from '../utils/pasiValidation';
import { getFunctions, httpsCallable } from 'firebase/functions'; // Add this import
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Progress } from "../components/ui/progress"; // Add Progress component
import CourseLinkingDialog from './CourseLinkingDialog';
import { processPasiLinkCreation, formatSchoolYearWithSlash, processPasiRecordDeletions, getCourseIdsForPasiCode } from '../utils/pasiLinkUtils';
import CreateStudentDialog from './CreateStudentDialog';
import MissingPasiRecordsTab from './MissingPasiRecordsTab';
import { COURSE_OPTIONS, ACTIVE_FUTURE_ARCHIVED_OPTIONS } from '../config/DropdownOptions';


// Validation rules for status compatibility
const ValidationRules = {
  statusCompatibility: {
    Active: {
      incompatibleStatuses: [
        "🔒 Locked Out - No Payment",
        "✅ Mark Added to PASI",
        "☑️ Removed From PASI (Funded)",
        "✗ Removed (Not Funded)",
        "Course Completed",
        "Newly Enrolled",
        "Unenrolled"
      ]
    },
    Completed: {
      validStatuses: [
        "🔒 Locked Out - No Payment",
        "✅ Mark Added to PASI",
        "☑️ Removed From PASI (Funded)",
        "Course Completed",
        "Unenrolled"
      ]
    }
  }
};

// Replace both functions below with these updated versions
// Function to check if a record's status is compatible with the summary's status
const isStatusCompatible = (recordStatus, summaryStatus, activeFutureArchived) => {
  if (!recordStatus || !summaryStatus) return true; // Can't validate if either status is missing
  
  // Special case: If Completed and Unenrolled, check ActiveFutureArchived_Value
  if (recordStatus === "Completed" && 
      summaryStatus === "Unenrolled") {
    // Only compatible if ActiveFutureArchived_Value is "Archived"
    return activeFutureArchived === "Archived";
  }
  
  // Check Active status incompatibilities
  if (recordStatus === "Active" && 
      ValidationRules.statusCompatibility.Active.incompatibleStatuses.includes(summaryStatus)) {
    return false;
  }
  
  // Check Completed status validations (excluding the special case we handled above)
  if (recordStatus === "Completed" && 
      summaryStatus !== "Unenrolled" && // Skip Unenrolled since we handled it above
      !ValidationRules.statusCompatibility.Completed.validStatuses.includes(summaryStatus)) {
    return false;
  }
  
  return true;
};

// Get the explanation for a status mismatch
const getStatusMismatchExplanation = (recordStatus, summaryStatus, activeFutureArchived) => {
  // Special case for Completed and Unenrolled with wrong ActiveFutureArchived value
  if (recordStatus === "Completed" && 
      summaryStatus === "Unenrolled" && 
      activeFutureArchived !== "Archived") {
    return `PASI Record status "${recordStatus}" is compatible with YourWay status "${summaryStatus}" only when the YourWay State is "Archived". Current State: "${activeFutureArchived || 'Not Set'}"`;
  }
  
  if (recordStatus === "Active" && 
      ValidationRules.statusCompatibility.Active.incompatibleStatuses.includes(summaryStatus)) {
    return `PASI Record status "${recordStatus}" is incompatible with YourWay status "${summaryStatus}". Active PASI records should not have completed or removed YourWay statuses.`;
  }
  
  if (recordStatus === "Completed" && 
      !ValidationRules.statusCompatibility.Completed.validStatuses.includes(summaryStatus)) {
    return `PASI Record status "${recordStatus}" is incompatible with YourWay status "${summaryStatus}". Completed PASI records should only be linked to completed or removed YourWay statuses.`;
  }
  
  return "Status compatibility issue. Please review the record.";
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

const ITEMS_PER_PAGE = 100;

const PASIDataUpload = () => {
 
  const [selectedSchoolYear, setSelectedSchoolYear] = useState('');
  const [schoolYearOptions, setSchoolYearOptions] = useState([]);
  const [pasiRecords, setPasiRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [asnEmails, setAsnEmails] = useState({});
  const [isLoadingAsns, setIsLoadingAsns] = useState(true);
  
  // New state for record viewing, pagination, search and sort
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortState, setSortState] = useState({ column: 'studentName', direction: 'asc' });
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [paginatedRecords, setPaginatedRecords] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showRecordDetails, setShowRecordDetails] = useState(false);
  const [isLinkingDialogOpen, setIsLinkingDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("records");
  const [showStatusMismatchOnly, setShowStatusMismatchOnly] = useState(false);
  const [recordsWithStatusMismatch, setRecordsWithStatusMismatch] = useState([]);
  const [summaryDataMap, setSummaryDataMap] = useState({});

  // Validation state
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [selectedRecords, setSelectedRecords] = useState(new Set());
  const [isFixing, setIsFixing] = useState(false);
  const [changePreview, setChangePreview] = useState(null);
  
  // State for status mismatch dialog
  const [statusMismatchDialogOpen, setStatusMismatchDialogOpen] = useState(false);
  const [selectedMismatch, setSelectedMismatch] = useState(null);
  
  // New state for deletion operations
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [isDeletingRecord, setIsDeletingRecord] = useState(false);
  const [isDeletingAllRecords, setIsDeletingAllRecords] = useState(false);
  
  // New state for cleanup links operations
  const [isCleanupDialogOpen, setIsCleanupDialogOpen] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [cleanupResults, setCleanupResults] = useState(null);

  const [isCreateStudentDialogOpen, setIsCreateStudentDialogOpen] = useState(false);
  const [selectedRecordForCreate, setSelectedRecordForCreate] = useState(null);

  const [activeTabMain, setActiveTabMain] = useState("records"); // For the main tabs
  const [missingPasiRecords, setMissingPasiRecords] = useState([]);
  const [isLoadingMissing, setIsLoadingMissing] = useState(false);
  const [isGeneratingCsv, setIsGeneratingCsv] = useState(false);

  // Create this function in your component
  const combineRecordsWithSummaries = (records, summariesMap) => {
    return records.map(record => {
      // Get summary data if available
      const summary = record.summaryKey && summariesMap[record.summaryKey] 
        ? summariesMap[record.summaryKey] 
        : null;
      
      return {
        ...record,
        // Add summary fields directly to the record object for filtering
        courseID: summary?.CourseID || null,
        statusValue: summary?.Status_Value || null,
        studentType: summary?.StudentType_Value || null,
        // Add other fields you might need later
        summaryState: summary?.ActiveFutureArchived_Value || 'Not Set',
        // Original summary object for any other data
        summary: summary
      };
    });
  };

  
// Add this to your PASIDataUpload component
const getYourWayState = (record) => {
  if (!record || !record.linked) return "Not Linked";
  
  // Use the summaryKey to directly access the summary
  if (record.summaryKey && summaryDataMap[record.summaryKey]) {
    const summary = summaryDataMap[record.summaryKey];
    return summary.ActiveFutureArchived_Value || "Not Set";
  }
  
  return "Unknown";
};

const StateEditCell = ({ record }) => {
  const [state, setState] = useState(record.summaryState || 'Not Set');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const needsArchived = record.needsArchived;
  
  const handleStateChange = async (newState) => {
    if (!record.studentKey || !record.courseId) {
      toast.error("Missing student key or course ID");
      return;
    }
    
    // Don't update if the state hasn't changed
    if (newState === record.summaryState) return;
    
    setState(newState);
    setIsUpdating(true);
    
    try {
      await updateCourseState(record.studentKey, record.courseId, newState);
    } catch (error) {
      // If update fails, revert to the original state
      setState(record.summaryState || 'Not Set');
      toast.error(`Failed to update state: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // For non-editable cases or if not a mismatch that needs archived
  if (!needsArchived) {
    return <span>{record.summaryState || 'Not Set'}</span>;
  }
  
  return (
    <div className="relative">
      <Select 
        value={state} 
        onValueChange={handleStateChange}
        disabled={isUpdating}
      >
        <SelectTrigger className="h-8 w-[120px]">
          <div className="flex items-center">
            <SelectValue placeholder="Select State" />
            {isUpdating && <Loader2 className="h-3 w-3 animate-spin ml-2" />}
          </div>
        </SelectTrigger>
        <SelectContent>
          {ACTIVE_FUTURE_ARCHIVED_OPTIONS.map(option => (
            <SelectItem 
              key={option.value} 
              value={option.value}
            >
              <span style={{ color: option.color }}>{option.value}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

  // Create a mapping of courseIds to PASI codes
  const courseIdToPasiCode = useMemo(() => {
    const mapping = {};
    COURSE_OPTIONS.forEach(course => {
      if (course.courseId && course.pasiCode) {
        mapping[course.courseId] = course.pasiCode;
      }
    });
    return mapping;
  }, []);

  // Check if a record has a status mismatch with its summary

  // Function to show status mismatch details
  const showStatusMismatchDetails = (record) => {
    setSelectedMismatch(record);
    setStatusMismatchDialogOpen(true);
  };

const checkStatusMismatch = (pasiRecords, summaryDataMap) => {
  const recordsWithMismatch = [];
  
  pasiRecords.forEach(record => {
    // Skip if not linked (no summary to compare with)
    if (!record.linked) return;
    
    // Get the email key for lookup
    const emailKey = record.email.replace(/\./g, ',');
    
    // Find all summaries for this student
    Object.keys(summaryDataMap).forEach(summaryKey => {
      // Check if this summary belongs to the student
      if (summaryKey.startsWith(emailKey)) {
        const summaryCourseId = parseInt(summaryKey.split('_')[1], 10);
        const summary = summaryDataMap[summaryKey];
        
        // Find summaries with matching course and student
        // For PASI records, we have courseCode (e.g., "MAT3791")
        // For summaries, we have courseId (a number)
        // We need to check if they match using our courseIdToPasiCode mapping
        const summaryPasiCode = courseIdToPasiCode[summaryCourseId];
        
        if (summaryPasiCode === record.courseCode) {
          // Now check if statuses are compatible, including ActiveFutureArchived value
          const isCompatible = isStatusCompatible(
            record.status, 
            summary.Status_Value,
            summary.ActiveFutureArchived_Value
          );
          
          if (!isCompatible) {
            recordsWithMismatch.push({
              ...record,
              summaryStatus: summary.Status_Value,
              summaryState: summary.ActiveFutureArchived_Value || 'Not Set',
              summaryKey, // Store the summaryKey for later use
              studentKey: summaryKey.split('_')[0], // Extract the studentKey
              courseId: summaryCourseId.toString(), // Store courseId as string
              needsArchived: record.status === "Completed" && 
                             summary.Status_Value === "Unenrolled" && 
                             summary.ActiveFutureArchived_Value !== "Archived",
              explanation: getStatusMismatchExplanation(
                record.status, 
                summary.Status_Value,
                summary.ActiveFutureArchived_Value
              )
            });
          }
        }
      }
    });
  });
  
  setRecordsWithStatusMismatch(recordsWithMismatch);
  return recordsWithMismatch;
};




// Add this new function to update the ActiveFutureArchived_Value
const updateCourseState = async (studentKey, courseId, newState) => {
  try {
    const db = getDatabase();
    
    // Path to update the ActiveFutureArchived/Value for this student course
    const updatePath = `students/${studentKey}/courses/${courseId}/ActiveFutureArchived/Value`;
    const updates = {};
    updates[updatePath] = newState;
    
    await update(ref(db), updates);
    
    // Update the local summaryDataMap to reflect the change
    setSummaryDataMap(prevMap => {
      const updatedMap = {...prevMap};
      const summaryKey = `${studentKey}_${courseId}`;
      
      if (updatedMap[summaryKey]) {
        updatedMap[summaryKey] = {
          ...updatedMap[summaryKey],
          ActiveFutureArchived_Value: newState
        };
      }
      
      return updatedMap;
    });
    
    // Re-run the status mismatch check to update the UI
    const updatedMismatches = checkStatusMismatch(pasiRecords, summaryDataMap);
    
    toast.success(`Updated state to "${newState}" successfully`);
    
    return true;
  } catch (error) {
    console.error("Error updating state:", error);
    toast.error(`Failed to update state: ${error.message}`);
    return false;
  }
};



  // Add the function to find missing PASI records
  const findMissingPasiRecords = async () => {
    if (!selectedSchoolYear) {
      toast.error("Please select a school year first");
      return;
    }
  
    console.log("=== FINDING MISSING PASI RECORDS ===");
    console.log("Selected school year:", selectedSchoolYear);
    console.log("Current PASI records count:", pasiRecords.length);
  
    setIsLoadingMissing(true);
    try {
      const db = getDatabase();
      const formattedYear = formatSchoolYearWithSlash(selectedSchoolYear);
      console.log("Formatted school year for matching:", formattedYear);
      
      // Step 1: Create a lookup map of PASI records
      console.time("Creating PASI lookup map");
      const pasiLookupMap = {};
      
      pasiRecords.forEach(record => {
        // Create a unique key combining course code and student key
        const studentKey = record.email.replace(/\./g, ',');
        const lookupKey = `${record.courseCode}_${studentKey}`;
        pasiLookupMap[lookupKey] = true;
      });
      
      console.timeEnd("Creating PASI lookup map");
      console.log(`PASI lookup map created with ${Object.keys(pasiLookupMap).length} entries`);
      
      // Step 2: Query student course summaries for the selected school year
      console.time("Querying database");
      
      // Using field indexing to filter directly at the database level
      // NOTE: This requires the 'School_x0020_Year_Value' field to be indexed for efficient querying
      const summariesRef = ref(db, 'studentCourseSummaries');
      const filteredQuery = query(
        summariesRef,
        orderByChild('School_x0020_Year_Value'),
        equalTo(formattedYear)
      );
      
      const summariesSnapshot = await get(filteredQuery);
      console.timeEnd("Querying database");
      
      if (!summariesSnapshot.exists()) {
        console.log("No matching studentCourseSummaries found for this school year");
        setMissingPasiRecords([]);
        return;
      }
  
      console.log("Records matching school year from database:", Object.keys(summariesSnapshot.val()).length);
  
      // Step 3: Process student course summaries
      console.time("Processing summaries");
      const studentCourseSummaries = [];
      let skippedRemovedCount = 0;
      let skippedNoPasiCodeCount = 0;
      
      // Create a map of summaries for status validation
      const newSummaryDataMap = {};
      
      summariesSnapshot.forEach(childSnapshot => {
        const summary = childSnapshot.val();
        const summaryKey = childSnapshot.key;
        
        // Add to summary map for status validation
        newSummaryDataMap[summaryKey] = summary;
        
        // Skip records with "✗ Removed (Not Funded)" status
        if (summary.Status_Value === "✗ Removed (Not Funded)") {
          skippedRemovedCount++;
          return; // Skip this record
        }
        
        // Parse the summary key to get student key and course id
        const [studentKey, courseIdStr] = summaryKey.split('_');
        const courseId = parseInt(courseIdStr, 10);
        
        // Get PASI code from the course mapping
        const pasiCode = courseIdToPasiCode[courseId];
        
        // IMPORTANT CHANGE: Skip records without a PASI code mapping in COURSE_OPTIONS
        if (!pasiCode) {
          skippedNoPasiCodeCount++;
          return; // Skip this record
        }
        
        // Create PASI Prep link only if ASN exists
        let studentPage = null; // No link by default
        
        // Create PASI Prep link if ASN exists
        if (summary.asn) {
          // Remove all dashes from the ASN to create the URL format expected by PASI Prep
          const asnWithoutDashes = summary.asn.replace(/-/g, '');
          studentPage = `https://extranet.education.alberta.ca/PASI/PASIprep/view-student/${asnWithoutDashes}`;
        }
        
        studentCourseSummaries.push({
          summaryKey,
          studentKey,
          courseId,
          courseTitle: summary.Course_Value || '',
          pasiCode, // This will always have a value now since we skip records without a pasiCode
          schoolYear: formattedYear,
          status: summary.Status_Value || 'Unknown',
          studentName: `${summary.lastName || ''}, ${summary.firstName || ''}`,
          studentPage, // Will be null if no ASN exists
          // Include additional useful fields from summary
          ActiveFutureArchived_Value: summary.ActiveFutureArchived_Value || '',
          StudentEmail: summary.StudentEmail || '',
          asn: summary.asn || '',
          studentType: summary.StudentType_Value || '',
          // Also include any PASI records that might exist
          pasiRecords: summary.pasiRecords || {}
        });
      });
      
      // Update the summary data map for status validation
      setSummaryDataMap(newSummaryDataMap);
      
      console.timeEnd("Processing summaries");
      console.log(`Number of studentCourseSummaries matching school year: ${studentCourseSummaries.length}`);
      console.log(`Skipped ${skippedRemovedCount} records with "✗ Removed (Not Funded)" status`);
      console.log(`Skipped ${skippedNoPasiCodeCount} records without a PASI code mapping in COURSE_OPTIONS`);
      
      // Step 4: Find missing records efficiently
      console.time("Finding missing records");
      const missing = [];
      
      for (const summary of studentCourseSummaries) {
        // Create the lookup key
        const lookupKey = `${summary.pasiCode}_${summary.studentKey}`;
        
        // Check if this key exists in our lookup map
        if (!pasiLookupMap[lookupKey]) {
          missing.push({...summary, reason: 'No matching PASI record'});
          
          // Log a sample for debugging
          if (missing.length <= 3) {
            console.log(`Missing record: ${summary.studentName}, pasiCode: ${summary.pasiCode}, studentKey: ${summary.studentKey}`);
          }
        }
      }
      console.timeEnd("Finding missing records");
      
      console.log("Final missing PASI records count:", missing.length);
      if (missing.length > 0) {
        console.log("Sample missing record:", missing[0]);
      }
      
      setMissingPasiRecords(missing);
    } catch (error) {
      console.error("Error finding missing PASI records:", error);
      toast.error(`Failed to find missing PASI records: ${error.message}`);
    } finally {
      setIsLoadingMissing(false);
    }
  };

  // Also, modify the useEffect to add a console log when it runs:
  useEffect(() => {
    if (selectedSchoolYear && pasiRecords.length > 0) {
      console.log("Triggering findMissingPasiRecords, school year:", selectedSchoolYear, "PASI records:", pasiRecords.length);
      findMissingPasiRecords();
    } else {
      console.log("Not running findMissingPasiRecords yet:", {
        hasSchoolYear: !!selectedSchoolYear,
        pasiRecordsCount: pasiRecords.length
      });
    }
  }, [selectedSchoolYear, pasiRecords.length, courseIdToPasiCode]);



  // Add effect to fetch missing PASI records when school year or PASI records change
  useEffect(() => {
    if (selectedSchoolYear && pasiRecords.length > 0) {
      findMissingPasiRecords();
    }
  }, [selectedSchoolYear, pasiRecords.length]);

  // Add effect to check for status mismatches whenever pasiRecords or summaryDataMap change
  useEffect(() => {
    if (pasiRecords.length > 0 && Object.keys(summaryDataMap).length > 0) {
      checkStatusMismatch(pasiRecords, summaryDataMap);
    }
  }, [pasiRecords, summaryDataMap]);

  const handleOpenCreateStudentDialog = (record) => {
    // Don't allow creating students for already linked records
    if (record.linked) return;
    
    setSelectedRecordForCreate(record);
    setIsCreateStudentDialogOpen(true);
  };

  const handleCloseCreateStudentDialog = (wasStudentCreated = false) => {
    setIsCreateStudentDialogOpen(false);
    setSelectedRecordForCreate(null);
    
    // If a student was created, we may want to refresh data or show a success message
    if (wasStudentCreated) {
      // Optionally refresh data if needed
      toast.success("Student created successfully. You can now link it to this PASI record.");
    }
  };

  // Function to open cleanup confirmation dialog
  const handleOpenCleanupDialog = () => {
    setIsCleanupDialogOpen(true);
  };

  // Function to run the cleanup process
  const handleCleanupLinks = async () => {
    setIsCleaningUp(true);
    setCleanupResults(null);
    
    try {
      const functions = getFunctions();
      const cleanupOrphanedPasiLinks = httpsCallable(functions, 'cleanupOrphanedPasiLinks');
      
      toast.info("Starting PASI link cleanup process...");
      
      // Pass an empty object as parameter (or add actual parameters if needed)
      const result = await cleanupOrphanedPasiLinks({});
      
      // In callable functions, the result is in result.data
      const data = result.data;
      
      setCleanupResults(data.results);
      toast.success(data.message);
      
      // Close dialog after successful completion
      setIsCleanupDialogOpen(false);
      
      return data.results;
    } catch (error) {
      console.error("Error cleaning up PASI links:", error);
      toast.error(`Error cleaning up PASI links: ${error.message}`);
      
      setCleanupResults({
        success: false,
        error: error.message,
        partial_results: error.details?.partial_results
      });
    } finally {
      setIsCleaningUp(false);
    }
  };

  // Function to open delete confirmation dialog
  const handleOpenDeleteDialog = (record) => {
    setRecordToDelete(record);
    setIsDeleteDialogOpen(true);
  };

  // Function to delete a single record
  const handleDeleteRecord = async () => {
    if (!recordToDelete || !selectedSchoolYear) return;
    
    setIsDeletingRecord(true);
    try {
      const db = getDatabase();

      // Ensure the record belongs to the selected school year
      const formattedYear = formatSchoolYear(selectedSchoolYear);
      if (recordToDelete.schoolYear !== formattedYear) {
        throw new Error("Record does not belong to the selected school year");
      }
      
      // If the record is linked, we need to handle link deletions first
      if (recordToDelete.linked) {
        await processPasiRecordDeletions([recordToDelete]);
      }
      
      // Delete the record using update with null value
      const updates = {};
      updates[`pasiRecords/${recordToDelete.id}`] = null;
      await update(ref(db), updates);
      
      toast.success(`Record for ${recordToDelete.studentName} deleted successfully`);
      setIsDeleteDialogOpen(false);
      setRecordToDelete(null);
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error(error.message || 'Failed to delete record');
    } finally {
      setIsDeletingRecord(false);
    }
  };

  // Function to delete all records for the selected school year
 // Function to delete all records for the selected school year in batches
const handleDeleteAllRecords = async () => {
  if (!selectedSchoolYear) {
    toast.error("Please select a school year first");
    return;
  }
  
  setIsDeletingAllRecords(true);
  try {
    const db = getDatabase();
    const formattedYear = formatSchoolYear(selectedSchoolYear);
    
    // Use query to get only records for this school year
    const pasiRef = ref(db, 'pasiRecords');
    const schoolYearQuery = query(
      pasiRef,
      orderByChild('schoolYear'),
      equalTo(formattedYear)
    );
    
    // Get the records that need to be deleted
    const snapshot = await get(schoolYearQuery);
    
    if (!snapshot.exists()) {
      toast.info(`No records found for school year ${selectedSchoolYear}`);
      setIsDeleteAllDialogOpen(false);
      setIsDeletingAllRecords(false);
      return;
    }
    
    // Convert the snapshot to an array of records
    const records = [];
    snapshot.forEach((childSnapshot) => {
      records.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    
    // Count how many records we're deleting
    const totalRecords = records.length;
    let deletedCount = 0;
    
    // Process in batches to avoid Firebase limits
    const BATCH_SIZE = 200; // Adjust this number based on Firebase limits
    const batches = [];
    
    // Split records into batches
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      batches.push(records.slice(i, i + BATCH_SIZE));
    }
    
    // Process each batch sequentially
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const batchNumber = i + 1;
      const totalBatches = batches.length;
      
      // Show progress toast
      toast.info(`Processing batch ${batchNumber}/${totalBatches}...`, {
        id: `batch-${batchNumber}`,
        duration: 3000
      });
      
      // Prepare updates for this batch
      const updates = {};
      batch.forEach((record) => {
        updates[`pasiRecords/${record.id}`] = null;
      });
      
      // Apply the batch deletion
      await update(ref(db), updates);
      
      // Update count
      deletedCount += batch.length;
      
      // Small delay between batches to reduce load
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    toast.success(`All ${deletedCount} PASI records for ${selectedSchoolYear} deleted successfully`);
    setIsDeleteAllDialogOpen(false);
  } catch (error) {
    console.error('Error deleting all records:', error);
    toast.error(error.message || 'Failed to delete records');
  } finally {
    setIsDeletingAllRecords(false);
  }
};

  const handleOpenLinkingDialog = (record) => {
    // Don't allow linking already linked records
    if (record.linked) return;
    
    setSelectedRecord({
      ...record,
      pasiRecordId: record.id
    });
    setIsLinkingDialogOpen(true);
  };

  const handleCloseLinkingDialog = () => {
    setIsLinkingDialogOpen(false);
    setSelectedRecord(null);
  };

  // Get school year options on mount
  useEffect(() => {
    const options = getSchoolYearOptions();
    setSchoolYearOptions(options);
    
    // Set default school year if available
    const defaultOption = options.find(opt => opt.isDefault);
    if (defaultOption) {
      setSelectedSchoolYear(defaultOption.value);
    }
  }, []);

  // Sort data function
// Sort data function
const sortData = (data, column, direction) => {
  return [...data].sort((a, b) => {
    // Get comparable values based on column
    let aValue, bValue;
    
    switch (column) {
      // Existing cases
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
      case 'linked':
        aValue = a.linked ? 'yes' : 'no';
        bValue = b.linked ? 'yes' : 'no';
        break;
      case 'value':
        aValue = a.value || '';
        bValue = b.value || '';
        break;
      case 'assignmentDate':
        aValue = a.assignmentDate || '';
        bValue = b.assignmentDate || '';
        break;
      case 'exitDate':
        aValue = a.exitDate || '';
        bValue = b.exitDate || '';
        break;
      case 'period':
        aValue = a.period || '';
        bValue = b.period || '';
        break;
      case 'term':
        aValue = a.term || '';
        bValue = b.term || '';
        break;
      case 'asn':
        aValue = a.asn || '';
        bValue = b.asn || '';
        break;
      case 'email':
        aValue = a.email || '';
        bValue = b.email || '';
        break;
      
      // New columns from summary data
      case 'courseID':
        aValue = a.courseID || 0;
        bValue = b.courseID || 0;
        break;
      case 'statusValue':
        aValue = a.statusValue || '';
        bValue = b.statusValue || '';
        break;
      case 'studentType':
        aValue = a.studentType || '';
        bValue = b.studentType || '';
        break;
      case 'summaryState':
        aValue = a.summaryState || '';
        bValue = b.summaryState || '';
        break;
      default:
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
    // Original fields
    const studentName = (record.studentName || '').toLowerCase();
    const courseCode = (record.courseCode || '').toLowerCase();
    const courseDescription = (record.courseDescription || '').toLowerCase();
    const asn = (record.asn || '').toLowerCase();
    const email = (record.email || '').toLowerCase();
    const status = (record.status || '').toLowerCase();
    const value = (record.value || '').toLowerCase();
    
    // Added fields from summary
    const courseID = record.courseID ? String(record.courseID).toLowerCase() : '';
    const statusValue = (record.statusValue || '').toLowerCase();
    const studentType = (record.studentType || '').toLowerCase();
    
    // Split name to check first and last name separately
    const nameParts = studentName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
    
    // Check if the search term matches any of these fields
    return studentName.includes(lowerTerm) || 
           courseCode.includes(lowerTerm) || 
           courseDescription.includes(lowerTerm) ||
           asn.includes(lowerTerm) ||
           email.includes(lowerTerm) ||
           status.includes(lowerTerm) ||
           value.includes(lowerTerm) ||
           firstName.includes(lowerTerm) || 
           lastName.includes(lowerTerm) ||
           courseID.includes(lowerTerm) ||
           statusValue.includes(lowerTerm) ||
           studentType.includes(lowerTerm);
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

  // Fetch ASNs
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

  // Convert school year format (e.g., "23/24" to "23_24")
  const formatSchoolYear = (year) => {
    return year.replace('/', '_');
  };

  // Set up database listener when school year changes
  useEffect(() => {
    if (!selectedSchoolYear) return;
  
    const db = getDatabase();
    const formattedYear = formatSchoolYear(selectedSchoolYear);
    
    const pasiRef = ref(db, 'pasiRecords');
    const schoolYearQuery = query(
      pasiRef,
      orderByChild('schoolYear'),
      equalTo(formattedYear)
    );
  
    const unsubscribe = onValue(schoolYearQuery, (snapshot) => {
      if (!snapshot.exists()) {
        setPasiRecords([]);
        return;
      }
  
      const records = [];
      snapshot.forEach((child) => {
        const record = child.val();
        // Ensure linked status is properly typed
        records.push({
          id: child.key,
          linked: Boolean(record.linked), // Convert to boolean
          ...record
        });
      });
  
      setPasiRecords(records.sort((a, b) => a.studentName.localeCompare(b.studentName)));
    });
  
    return () => off(schoolYearQuery);
  }, [selectedSchoolYear]);

  // Updated effect for handling filtered and paginated data
useEffect(() => {
  // Apply search filter
  let filtered = searchData(pasiRecords, searchTerm);
  
  // Apply status mismatch filter if enabled
  if (showStatusMismatchOnly) {
    const mismatchIds = recordsWithStatusMismatch.map(record => record.id);
    filtered = filtered.filter(record => mismatchIds.includes(record.id));
  }
  
  // Combine records with summary data - this is the key addition
  const combinedRecords = combineRecordsWithSummaries(filtered, summaryDataMap);
  
  // Set filtered records using the combined data
  setFilteredRecords(combinedRecords);
  
  // Apply sorting
  const sorted = sortData(combinedRecords, sortState.column, sortState.direction);
  
  // Calculate pagination
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE) || 1;
  setTotalPages(totalPages);
  
  // Make sure current page is valid
  const validPage = Math.min(currentPage, totalPages);
  if (validPage !== currentPage) {
    setCurrentPage(validPage);
  }
  
  // Create paginated data
  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  setPaginatedRecords(sorted.slice(startIndex, endIndex));
}, [pasiRecords, searchTerm, sortState, currentPage, recordsWithStatusMismatch, showStatusMismatchOnly, summaryDataMap]);

  // Calculate summary statistics
  const getSummary = () => {
    if (!pasiRecords.length) return null;

    return {
      total: pasiRecords.length,
      linked: pasiRecords.filter(r => r.linked).length,
      notLinked: pasiRecords.filter(r => !r.linked).length,
      uniqueStudents: new Set(pasiRecords.map(r => r.asn)).size,
      uniqueCourses: new Set(pasiRecords.map(r => r.courseCode)).size,
      missingPasiRecords: missingPasiRecords.length || 0,
      statusMismatches: recordsWithStatusMismatch.length || 0
    };
  };

  const summary = getSummary();

  const extractSchoolYear = (enrollmentString) => {
    try {
      const matches = enrollmentString.match(/\((\d{4})\/\d{2}\/\d{2} to (\d{4})\/\d{2}\/\d{2}\)/);
      if (matches) {
        const startYear = matches[1];
        const endYear = matches[2];
        if (startYear === endYear) {
          return `${(parseInt(startYear) - 1).toString().slice(-2)}_${startYear.slice(-2)}`;
        } else {
          return `${startYear.slice(-2)}_${endYear.slice(-2)}`;
        }
      }
      return null;
    } catch (error) {
      console.error('Error parsing school enrollment date:', error);
      return null;
    }
  };
  
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) {
      toast.error('Please select a file');
      return;
    }
  
    if (!selectedSchoolYear) {
      toast.error('Please select a school year before uploading');
      return;
    }
  
    setIsProcessing(true);
    setChangePreview(null); // Reset change preview
    setShowPreview(false); 
  
    const config = {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        try {
          if (!results?.data?.length) {
            throw new Error('No valid data found in CSV file');
          }
  
          const missingAsnRow = results.data.findIndex(row => !row['ASN']?.trim());
          if (missingAsnRow !== -1) {
            toast.error(`Missing ASN value in row ${missingAsnRow + 2}`);
            setIsProcessing(false);
            return;
          }
  
          const expectedSchoolYear = formatSchoolYear(selectedSchoolYear);
          const processedRecords = [];
  
          for (let i = 0; i < results.data.length; i++) {
            const row = results.data[i];
            const extractedYear = extractSchoolYear(row['School Enrolment']);
            if (!extractedYear) {
              toast.error(`Invalid School Enrolment format in row ${i + 2}`);
              setIsProcessing(false);
              return;
            }
            
            if (extractedYear !== expectedSchoolYear) {
              toast.error(
                `School year mismatch in row ${i + 2}: Expected ${expectedSchoolYear}, found ${extractedYear}`
              );
              setIsProcessing(false);
              return;
            }
  
            const asn = row['ASN']?.trim() || '';
            const email = asnEmails[asn] || '-';
            const matchStatus = asnEmails[asn] ? 'Found in Database' : 'Not Found';
            const courseCode = row[' Code']?.trim().toUpperCase() || '';
            const period = row['Period']?.trim() || 'Regular';
            const schoolYear = expectedSchoolYear;
            const uniqueId = `${asn}_${courseCode.toLowerCase()}_${schoolYear}_${period.toLowerCase()}`;
            const existingRecord = pasiRecords.find(record => record.id === uniqueId);
            const oldLinkValue = existingRecord?.linked === true; 

            
            processedRecords.push({
              asn,
              email,
              matchStatus,
              studentName: row['Student Name']?.trim() || '',
              courseCode,
              courseDescription: row[' Description']?.trim() || '',
              status: row['Status']?.trim() || 'Active',
              period,
              schoolYear,
              value: row['Value']?.trim() || '-',
              approved: row['Approved']?.trim() || 'No',
              assignmentDate: row['Assignment Date']?.trim() || '-',
              creditsAttempted: row['Credits Attempted']?.trim() || '-',
              deleted: row['Deleted']?.trim() || 'No',
              dualEnrolment: row['Dual Enrolment']?.trim() || 'No',
              exitDate: row['Exit Date']?.trim() || '-',
              fundingRequested: row['Funding Requested']?.trim() || 'No',
              term: row['Term']?.trim() || 'Full Year',
              lastUpdated: new Date().toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }),
              linked: oldLinkValue,
              id: uniqueId
            });
          }
          
          // Create the differential change analysis
          analyzeChanges(processedRecords);
          
          event.target.value = '';
        } catch (error) {
          console.error('Error processing CSV:', error);
          toast.error(error.message || 'Error processing CSV file');
          setIsProcessing(false);
        }
      },
      error: (error) => {
        console.error('Papa Parse error:', error);
        toast.error('Failed to parse CSV file');
        setIsProcessing(false);
      }
    };
  
    Papa.parse(file, config);
  };

  // Add this new function to analyze changes
const analyzeChanges = (newRecords) => {
  try {
    // Step 1: Create a map of existing records for easy lookup
    const existingRecordsMap = {};
    pasiRecords.forEach(record => {
      existingRecordsMap[record.id] = record;
    });
    
    // Step 2: Create a map of new records
    const newRecordsMap = {};
    newRecords.forEach(record => {
      newRecordsMap[record.id] = record;
    });
    
    // Step 3: Identify records by change type
    const recordsToAdd = [];
    const recordsToUpdate = [];
    const recordsToDelete = [];
    const recordsUnchanged = [];
    
    // Find records to delete (in existingRecordsMap but not in newRecordsMap)
    Object.keys(existingRecordsMap).forEach(recordId => {
      if (!newRecordsMap[recordId]) {
        recordsToDelete.push(existingRecordsMap[recordId]);
      }
    });
    
    // Process new records - categorize as add, update, or unchanged
    Object.keys(newRecordsMap).forEach(recordId => {
      const newRecord = newRecordsMap[recordId];
      const existingRecord = existingRecordsMap[recordId];
      
      if (!existingRecord) {
        // This is a new record to add
        recordsToAdd.push(newRecord);
      } else {
        // Check if it has changed
        if (hasRecordChanged(existingRecord, newRecord)) {
          // Store both records to show what's changing
          recordsToUpdate.push({
            old: existingRecord,
            new: newRecord,
            changes: getChangedFields(existingRecord, newRecord)
          });
        } else {
          recordsUnchanged.push(newRecord);
        }
      }
    });
    
    // Step 4: Check for potential status compatibility issues
    const recordsWithStatusIssues = [];
    
    // Check status compatibility for all records
    [...recordsToAdd, ...recordsToUpdate.map(update => update.new)].forEach(record => {
      // Skip if the record isn't linked
      if (!record.linked) return;
      
      // Get the student email key for lookup
      const emailKey = record.email.replace(/\./g, ',');
      
      // Find summaries for this student
      Object.keys(summaryDataMap).forEach(summaryKey => {
        if (summaryKey.startsWith(emailKey)) {
          const summaryCourseId = parseInt(summaryKey.split('_')[1], 10);
          const summary = summaryDataMap[summaryKey];
          
          // Find summaries with matching course code
          const summaryPasiCode = courseIdToPasiCode[summaryCourseId];
          
          if (summaryPasiCode === record.courseCode) {
            // Check if statuses are compatible
            const isCompatible = isStatusCompatible(record.status, summary.Status_Value);
            
            if (!isCompatible) {
              recordsWithStatusIssues.push({
                record,
                summaryStatus: summary.Status_Value,
                explanation: getStatusMismatchExplanation(record.status, summary.Status_Value)
              });
            }
          }
        }
      });
    });
    
    // Set change preview state
    setChangePreview({
      recordsToAdd,
      recordsToUpdate,
      recordsToDelete,
      recordsUnchanged,
      totalChanges: recordsToAdd.length + recordsToUpdate.length + recordsToDelete.length,
      recordsWithStatusIssues
    });
    
    // Show the preview dialog
    setShowPreview(true);
    setIsProcessing(false);
    
    // Log summary for debugging
    console.log(`Change analysis completed: ${recordsToAdd.length} to add, ${recordsToUpdate.length} to update, ${recordsToDelete.length} to delete, ${recordsUnchanged.length} unchanged, ${recordsWithStatusIssues.length} with status issues`);
  } catch (error) {
    console.error('Error analyzing changes:', error);
    toast.error(error.message || 'Error analyzing changes');
    setIsProcessing(false);
  }
};


const handleConfirmUpload = async (additionalData = {}) => {
  if (!changePreview) {
    toast.error('No changes to apply');
    return;
  }

  const { linksToCreate = [] } = additionalData;

  // Close the dialog immediately
  setShowPreview(false);

  // Show a toast to indicate background processing
  toast.info("Processing changes in the background...");

  // Continue with the processing in the background
  setIsProcessing(true);
  try {
    const db = getDatabase();
    
    // First, process link deletions for records being removed
    if (changePreview.recordsToDelete.length > 0) {
      console.log(`Processing ${changePreview.recordsToDelete.length} record deletions with potential links`);
      const deletionResults = await processPasiRecordDeletions(changePreview.recordsToDelete);

      if (deletionResults.failed > 0) {
        console.warn(`Failed to remove links for ${deletionResults.failed} records`, deletionResults.errors);
      }

      if (deletionResults.success > 0) {
        console.log(`Successfully removed links for ${deletionResults.success} records`);
      }
    }

    // Process link creations first if there are any
    let newlyLinkedRecordIds = new Set();
    if (linksToCreate.length > 0) {
      console.log(`Processing ${linksToCreate.length} new course links`);
      const linkResults = await processPasiLinkCreation(linksToCreate);

      if (linkResults.failed > 0) {
        console.warn(`Failed to create ${linkResults.failed} links`, linkResults.errors);
        toast.warning(`Failed to create ${linkResults.failed} course links.`);
      }

      if (linkResults.success > 0) {
        console.log(`Successfully created ${linkResults.success} links`);
        
        // Keep track of which records were just linked
        linkResults.createdLinks.forEach(link => {
          newlyLinkedRecordIds.add(link.pasiRecordId);
        });
        
        toast.success(`Created ${linkResults.success} new course links`);
      }
    }

    // Now prepare database updates with the correct linked status
    const updates = {};

    // Process records to delete
    changePreview.recordsToDelete.forEach(record => {
      updates[`pasiRecords/${record.id}`] = null;
    });

  
    // Update the database with the prepared updates
    if (Object.keys(updates).length > 0) {
      await update(ref(db), updates);
    }

    // Show success message
    if (Object.keys(updates).length > 0 || linksToCreate.length > 0) {
      toast.success(`Updated PASI records for ${selectedSchoolYear}: ${changePreview.totalChanges} changes applied`);
    } else {
      toast.success(`Updated PASI records for ${selectedSchoolYear}: ${changePreview.totalChanges} changes applied`);
    }

  } catch (error) {
    console.error('Error updating records:', error);
    toast.error(error.message || 'Failed to update records');
  } finally {
    setIsProcessing(false);
    setChangePreview(null); // Reset the change preview after processing
  }
};
  
  // Helper function to check if a record has changed
const hasRecordChanged = (existingRecord, newRecord) => {
  // Fields to compare (only the ones that come from CSV)
  const fieldsToCompare = [
    'asn', 'studentName', 'courseCode', 'courseDescription', 
    'status', 'period', 'value', 'approved', 'assignmentDate', 
    'creditsAttempted', 'deleted', 'dualEnrolment', 'exitDate', 
    'fundingRequested', 'term'
  ];
  
  return fieldsToCompare.some(field => existingRecord[field] !== newRecord[field]);
};

// Helper function to get the fields that have changed (for UI display)
const getChangedFields = (existingRecord, newRecord) => {
  const fieldsToCompare = [
    'asn', 'studentName', 'courseCode', 'courseDescription', 
    'status', 'period', 'value', 'approved', 'assignmentDate', 
    'creditsAttempted', 'deleted', 'dualEnrolment', 'exitDate', 
    'fundingRequested', 'term'
  ];
  
  const changedFields = {};
  fieldsToCompare.forEach(field => {
    if (existingRecord[field] !== newRecord[field]) {
      changedFields[field] = {
        old: existingRecord[field],
        new: newRecord[field]
      };
    }
  });
  
  return changedFields;
};
  
  // Additional function needed when performing the actual update
  const getUpdatedFields = (existingRecord, newRecord) => {
    const fieldsToCompare = [
      'asn', 'studentName', 'courseCode', 'courseDescription', 
      'status', 'period', 'value', 'approved', 'assignmentDate', 
      'creditsAttempted', 'deleted', 'dualEnrolment', 'exitDate', 
      'fundingRequested', 'term', 'email'
    ];
    
    const updatedFields = {};
  fieldsToCompare.forEach(field => {
    // Only add defined values, and if they've changed
    if (existingRecord[field] !== newRecord[field] && newRecord[field] !== undefined) {
      updatedFields[field] = newRecord[field];
    }
  });
    
    // Always update the lastUpdated field
    updatedFields.lastUpdated = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    return updatedFields;
  };

  const handleCopyData = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleViewRecordDetails = (record) => {
    setSelectedRecord(record);
    setShowRecordDetails(true);
  };

  // Add these validation functions
  const handleValidate = async () => {
    if (!selectedSchoolYear) {
      toast.error("Please select a school year first");
      return;
    }
    
    setIsValidating(true);
    try {
      const formattedYear = selectedSchoolYear.replace('/', '_');
      const results = await validatePasiRecordsLinkStatus(formattedYear);
      setValidationResults(results);
      // Clear any previously selected records
      setSelectedRecords(new Set());
    } catch (error) {
      console.error("Validation error:", error);
      toast.error("Failed to validate PASI records: " + error.message);
    } finally {
      setIsValidating(false);
    }
  };
  
  const handleToggleSelectAll = () => {
    if (!validationResults) return;
    
    if (selectedRecords.size === validationResults.validationResults.filter(r => !r.isCorrect).length) {
      // If all are selected, clear the selection
      setSelectedRecords(new Set());
    } else {
      // Otherwise, select all incorrect records
      const newSelected = new Set();
      validationResults.validationResults.forEach(result => {
        if (!result.isCorrect) {
          newSelected.add(result.recordId);
        }
      });
      setSelectedRecords(newSelected);
    }
  };
  
  const handleToggleSelect = (recordId) => {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(recordId)) {
      newSelected.delete(recordId);
    } else {
      newSelected.add(recordId);
    }
    setSelectedRecords(newSelected);
  };
  
  const handleFixSelected = async () => {
    if (selectedRecords.size === 0) {
      toast.info("No records selected to fix");
      return;
    }
    
    setIsFixing(true);
    try {
      // Get all PASI links to determine correct status
      const db = getDatabase();
      const pasiLinksSnapshot = await get(ref(db, 'pasiLinks'));
      
      // Create a Set of pasiRecordIds that are linked
      const linkedRecordIds = new Set();
      
      if (pasiLinksSnapshot.exists()) {
        pasiLinksSnapshot.forEach(linkSnapshot => {
          const link = linkSnapshot.val();
          if (link.pasiRecordId) {
            linkedRecordIds.add(link.pasiRecordId);
          }
        });
      }
      
      // Prepare batch updates
      const updates = {};
      
      Array.from(selectedRecords).forEach(recordId => {
        const shouldBeLinked = linkedRecordIds.has(recordId);
        updates[`pasiRecords/${recordId}/linked`] = shouldBeLinked;
      });
      
      // Apply all updates in a single batch operation
      await update(ref(db), updates);
      
      toast.success(`Fixed ${selectedRecords.size} records successfully`);
      
      // Re-validate to show updated results
      await handleValidate();
    } catch (error) {
      console.error("Error fixing records:", error);
      toast.error("Failed to fix records: " + error.message);
    } finally {
      setIsFixing(false);
    }
  };

  // Function to check if a record has a status mismatch
  const hasStatusMismatch = (record) => {
    return recordsWithStatusMismatch.some(mismatch => mismatch.id === record.id);
  };

  // Function to get the mismatch object for a record
  const getStatusMismatchForRecord = (record) => {
    return recordsWithStatusMismatch.find(mismatch => mismatch.id === record.id);
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
      <div className="space-y-8">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>PASI Records Upload</CardTitle>
           
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Select 
                  value={selectedSchoolYear} 
                  onValueChange={setSelectedSchoolYear}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {schoolYearOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span style={{ color: option.color }}>
                          {option.value}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
             
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  disabled={!selectedSchoolYear || isProcessing || isLoadingAsns}
                >
                  <Upload className="h-4 w-4" />
                  <label className="cursor-pointer">
                    Upload CSV
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={!selectedSchoolYear || isProcessing || isLoadingAsns}
                    />
                  </label>
                </Button>
                
                {/* Delete All Records button */}
                <Button 
                  variant="destructive" 
                  className="flex items-center gap-2"
                  onClick={() => setIsDeleteAllDialogOpen(true)}
                  disabled={!selectedSchoolYear || pasiRecords.length === 0 || isProcessing}
                >
                  <Trash className="h-4 w-4" />
                  Delete All
                </Button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                Error: {error}
              </div>
            )}

            {isLoading ? (
              <div className="text-center p-4">Loading...</div>
            ) : pasiRecords.length > 0 ? (
              summary && (
                <div className="space-y-6">
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-medium mb-4">Current Records Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Records:</p>
                        <p className="font-medium">{summary.total}</p>
                        <p className="text-xs text-muted-foreground mt-1">Total number of course enrollments in PASI</p>
                      </div>
                      <div>
                        <p className="text-sm text-green-600">Linked Records:</p>
                        <p className="font-medium">{summary.linked}</p>
                        <p className="text-xs text-muted-foreground mt-1">Records successfully matched to YourWay students</p>
                      </div>
                      <div>
                        <p className="text-sm text-red-600">Not Linked:</p>
                        <p className="font-medium">{summary.notLinked}</p>
                        <p className="text-xs text-muted-foreground mt-1">Records pending matching with YourWay students</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Unique Students:</p>
                        <p className="font-medium">{summary.uniqueStudents}</p>
                        <p className="text-xs text-muted-foreground mt-1">Total number of individual students</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Unique Courses:</p>
                        <p className="font-medium">{summary.uniqueCourses}</p>
                        <p className="text-xs text-muted-foreground mt-1">Total number of distinct courses</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Missing PASI Records:</p>
                        <p className="font-medium">{summary.missingPasiRecords}</p>
                        <p className="text-xs text-muted-foreground mt-1">YourWay courses without PASI records</p>
                      </div>
                      {summary.statusMismatches > 0 && (
                        <div>
                          <p className="text-sm text-amber-600">Status Mismatches:</p>
                          <p className="font-medium">{summary.statusMismatches}</p>
                          <p className="text-xs text-muted-foreground mt-1">Records with incompatible status values</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Status mismatches warning */}
                  {recordsWithStatusMismatch.length > 0 && (
                    <Alert variant="warning" className="bg-amber-50 border-amber-200">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertTitle className="text-amber-800">Status Mismatches Detected</AlertTitle>
                      <AlertDescription className="text-amber-700">
                        Found {recordsWithStatusMismatch.length} records with status values that may be incompatible with 
                        their corresponding YourWay status.
                      
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Display cleanup results if available */}
                  {cleanupResults && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h3 className="font-medium mb-2 text-green-800">PASI Link Cleanup Results</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-green-800">Total Processed:</p>
                          <p className="font-medium">{cleanupResults.processed}</p>
                        </div>
                        <div>
                          <p className="text-sm text-green-800">Orphaned Links Deleted:</p>
                          <p className="font-medium">{cleanupResults.deleted}</p>
                        </div>
                        <div>
                          <p className="text-sm text-green-800">Errors:</p>
                          <p className="font-medium">{cleanupResults.errors || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm text-green-800">Total Links:</p>
                          <p className="font-medium">{cleanupResults.total}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="text-center p-4 text-muted-foreground">
                No PASI records found for {selectedSchoolYear}
              </div>
            )}
          </CardContent>
      
          <PASIPreviewDialog 
  isOpen={showPreview}
  onClose={() => setShowPreview(false)}
  changePreview={changePreview}
  onConfirm={handleConfirmUpload}
  isConfirming={isProcessing}
  selectedSchoolYear={selectedSchoolYear}
/>
        </Card>

        {/* New Records Table Card with Tabs */}
        {pasiRecords.length > 0 && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>PASI Records Management</CardTitle>
              <p className="text-sm text-muted-foreground">
                Browse, search, and validate PASI records for {selectedSchoolYear}
              </p>
            </CardHeader>
            <CardContent>
              {/* Add Tabs for Records and Validation */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4">
  <TabsTrigger value="records">Records</TabsTrigger>
  <TabsTrigger value="validation">Validation</TabsTrigger>
  <TabsTrigger value="missingPasi">
    Missing PASI
    {missingPasiRecords.length > 0 && (
      <Badge variant="destructive" className="ml-2">{missingPasiRecords.length}</Badge>
    )}
  </TabsTrigger>
</TabsList>
                
                <TabsContent value="records">
                  {/* Search bar */}
                  <div className="flex items-center space-x-2 mb-4">
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
                    <Badge variant="outline">
                      {filteredRecords.length} records
                    </Badge>
                    
                    {/* Status mismatch filter toggle */}
                    {recordsWithStatusMismatch.length > 0 && (
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="showMismatchesOnly"
                          className="h-4 w-4 rounded border-gray-300"
                          checked={showStatusMismatchOnly}
                          onChange={() => setShowStatusMismatchOnly(!showStatusMismatchOnly)}
                        />
                        <label htmlFor="showMismatchesOnly" className="text-sm">
                          Show status mismatches only ({recordsWithStatusMismatch.length})
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Records table */}
                  <div className="rounded-md border">
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
        column="courseCode" 
        label="Course Code" 
        currentSort={sortState} 
        onSort={handleSort} 
      />
      <SortableHeader 
        column="courseDescription" 
        label="Description" 
        currentSort={sortState} 
        onSort={handleSort} 
      />
      <SortableHeader 
        column="status" 
        label="PASI Status" 
        currentSort={sortState} 
        onSort={handleSort} 
      />
      <SortableHeader 
        column="value" 
        label="Grade" 
        currentSort={sortState} 
        onSort={handleSort} 
      />
      <SortableHeader 
        column="linked" 
        label="Linked" 
        currentSort={sortState} 
        onSort={handleSort} 
      />
      
      {/* YourWay columns with consistent blue styling */}
      <SortableHeader 
        column="courseID" 
        label="Course ID" 
        currentSort={sortState} 
        onSort={handleSort}
        className="bg-blue-50 text-blue-800" 
      />
      <SortableHeader 
        column="statusValue" 
        label="Status" 
        currentSort={sortState} 
        onSort={handleSort}
        className="bg-blue-50 text-blue-800" 
      />
      <SortableHeader 
        column="studentType" 
        label="Student Type" 
        currentSort={sortState} 
        onSort={handleSort}
        className="bg-blue-50 text-blue-800" 
      />
      
      {/* YourWay State column - now sortable */}
      <SortableHeader 
        column="summaryState" 
        label="State" 
        currentSort={sortState} 
        onSort={handleSort}
        className="bg-blue-50 text-blue-800" 
      />
      
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {paginatedRecords.length === 0 ? (
      <TableRow>
        <TableCell colSpan={11} className="h-24 text-center">
          {searchTerm || showStatusMismatchOnly ? 'No matching records found.' : 'No records available.'}
        </TableCell>
      </TableRow>
    ) : (
      paginatedRecords.map((record, index) => {
        const recordIndex = pasiRecords.findIndex(r => r.id === record.id);
        const hasMismatch = hasStatusMismatch(record);
        
        return (
          <Tooltip key={record.id}>
            <TooltipTrigger asChild>
              <TableRow 
                className={`
                  ${hoveredRow === index ? "bg-accent/20" : ""}
                  ${record.linked ? "bg-green-50 dark:bg-green-950/20" : ""}
                  ${hasMismatch ? "bg-amber-50 dark:bg-amber-950/20" : ""}
                `}
                onMouseEnter={() => setHoveredRow(index)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <TableCell>{record.studentName}</TableCell>
                <TableCell>{record.courseCode}</TableCell>
                <TableCell className="max-w-[200px] truncate" title={record.courseDescription}>
                  {record.courseDescription}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {record.status}
                    {hasMismatch && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertTriangle 
                            className="h-4 w-4 text-amber-500 cursor-pointer"
                            onClick={() => showStatusMismatchDetails(getStatusMismatchForRecord(record))}
                          />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Status compatibility issue. Click for details.</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
                <TableCell>{record.value !== '-' ? record.value : 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {record.linked ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-300" />
                    )}
                    {record.linked ? "Linked" : "Not Linked"}
                  </div>
                </TableCell>

                {/* YourWay data columns with consistent blue styling */}
                <TableCell className="bg-blue-50 text-blue-800">
                  {record.courseID || 'N/A'}
                </TableCell>
                <TableCell className="bg-blue-50 text-blue-800">
                  {record.statusValue || 'N/A'}
                </TableCell>
                <TableCell className="bg-blue-50 text-blue-800">
                  {record.studentType || 'N/A'}
                </TableCell>

                {/* YourWay State column */}
                <TableCell className="bg-blue-50 text-blue-800">
                  {hasMismatch ? (
                    <StateEditCell record={getStatusMismatchForRecord(record)} />
                  ) : (
                    record.summaryState || 'Not Set'
                  )}
                </TableCell>

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
                      onClick={() => handleViewRecordDetails(record)}
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenLinkingDialog(record)}
                      title={record.linked ? "Already Linked" : "Link Course"}
                      disabled={record.linked}
                      className={record.linked ? "opacity-50" : ""}
                    >
                      {record.linked ? (
                        <Link2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Link2 className="h-4 w-4" />
                      )}
                    </Button>
                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDeleteDialog(record)}
                      title="Delete Record"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                    
                    {/* Create Student button */}
                    {!record.linked && record.matchStatus !== 'Found in Database' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenCreateStudentDialog(record)}
                        title="Create Student"
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            </TooltipTrigger>
            <TooltipContent>
              <p>Record Index: {recordIndex}</p>
              <p>ASN: {record.asn}</p>
              <p>Email: {record.email}</p>
              {hasMismatch && (
                <p className="text-amber-600 mt-1">Has status compatibility issue</p>
              )}
            </TooltipContent>
          </Tooltip>
        );
      })
    )}
  </TableBody>
</Table>
                  </div>

                  {/* Pagination */}
                  {renderPagination()}
                </TabsContent>
                
                {/* Validation Tab Content */}
                <TabsContent value="validation">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                      <Button
                        onClick={handleValidate}
                        disabled={isValidating || !selectedSchoolYear}
                      >
                        {isValidating ? "Validating..." : "Validate Links"}
                      </Button>

                         
                {/* Add Cleanup Links Button */}
                <Button 
                  variant="secondary" 
                  className="flex items-center gap-2"
                  onClick={handleOpenCleanupDialog}
                  disabled={isCleaningUp}
                >
                  {isCleaningUp ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cleaning...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Cleanup Links
                    </>
                  )}
                </Button>
                      
                      {validationResults && validationResults.summary.incorrectlyMarked > 0 && (
                        <Button
                          variant="secondary"
                          onClick={handleFixSelected}
                          disabled={isFixing || selectedRecords.size === 0}
                        >
                          {isFixing ? "Fixing..." : `Fix Selected (${selectedRecords.size})`}
                        </Button>
                      )}
                    </div>
                    
                    {validationResults ? (
                      <>
                        <Alert className="mb-6">
                          <AlertTitle>Validation Results</AlertTitle>
                          <AlertDescription>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                              <div>
                                <p className="text-sm font-medium">Total Records:</p>
                                <p>{validationResults.summary.totalChecked}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-green-600">Correctly Marked:</p>
                                <p>{validationResults.summary.correctlyMarked}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-red-600">Incorrectly Marked:</p>
                                <p>{validationResults.summary.incorrectlyMarked}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Accuracy:</p>
                                <p>{validationResults.summary.accuracyPercentage}%</p>
                              </div>
                            </div>
                          </AlertDescription>
                        </Alert>
                        
                        {validationResults.summary.incorrectlyMarked > 0 ? (
                          <>
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="text-sm font-medium">Records Needing Correction</h3>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleToggleSelectAll}
                              >
                                {selectedRecords.size === validationResults.validationResults.filter(r => !r.isCorrect).length
                                  ? "Deselect All"
                                  : "Select All"
                                }
                              </Button>
                            </div>
                            
                            <div className="rounded-md border overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-[40px]"></TableHead>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Course Code</TableHead>
                                    <TableHead>Status in DB</TableHead>
                                    <TableHead>Actual Status</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {validationResults.validationResults
                                    .filter(result => !result.isCorrect)
                                    .map(result => (
                                      <TableRow 
                                        key={result.recordId}
                                        className={selectedRecords.has(result.recordId) ? "bg-muted/50" : ""}
                                      >
                                        <TableCell>
                                          <input
                                            type="checkbox"
                                            checked={selectedRecords.has(result.recordId)}
                                            onChange={() => handleToggleSelect(result.recordId)}
                                            className="h-4 w-4 rounded border-gray-300"
                                          />
                                        </TableCell>
                                        <TableCell className="font-medium">{result.studentName}</TableCell>
                                        <TableCell>{result.courseCode}</TableCell>
                                        <TableCell>
                                          <Badge
                                            variant={result.isMarkedLinked ? "success" : "secondary"}
                                          >
                                            {result.isMarkedLinked ? "Linked" : "Not Linked"}
                                          </Badge>
                                        </TableCell>
                                        <TableCell>
                                          <Badge
                                            variant={result.isActuallyLinked ? "success" : "secondary"}
                                          >
                                            {result.isActuallyLinked ? "Linked" : "Not Linked"}
                                          </Badge>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                </TableBody>
                              </Table>
                            </div>
                          </>
                        ) : (
                          <div className="p-4 text-center text-green-600 bg-green-50 rounded-md">
                            All records are correctly marked. No fixes needed!
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        {isValidating ? (
                          <p>Validating records...</p>
                        ) : (
                          <p>Click "Validate Links" to check if the linked status of your records is correct.</p>
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="missingPasi">
  {isLoadingMissing ? (
    <div className="flex items-center justify-center h-40">
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">
          Loading missing PASI records...
        </p>
      </div>
    </div>
  ) : (
    <MissingPasiRecordsTab 
      missingRecords={missingPasiRecords}
      onGeneratePasiFile={handleGeneratePasiCsv}
      isProcessing={isGeneratingCsv}
    />
  )}
</TabsContent>

              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Record details dialog using shadcn component */}
        <Dialog open={showRecordDetails} onOpenChange={setShowRecordDetails}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>PASI Record Details</DialogTitle>
            </DialogHeader>
            
            {selectedRecord && (
              <>
                {/* Status mismatch warning alert */}
                {hasStatusMismatch(selectedRecord) && (
                  <Alert variant="warning" className="bg-amber-50 border-amber-200 mb-4">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-800">Status Compatibility Issue</AlertTitle>
                    <AlertDescription className="text-amber-700">
                      {getStatusMismatchForRecord(selectedRecord)?.explanation || 
                      "This record's status is incompatible with its YourWay status."}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Student Information</h4>
                    <div className="mt-2 space-y-2">
                      <div>
                        <span className="text-sm font-medium">Name:</span>
                        <span className="text-sm ml-2">{selectedRecord.studentName}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">ASN:</span>
                        <span className="text-sm ml-2">{selectedRecord.asn}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Email:</span>
                        <span className="text-sm ml-2">{selectedRecord.email}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Linked:</span>
                        <Badge
                          variant={selectedRecord.linked ? "success" : "secondary"}
                          className={`ml-2 ${selectedRecord.linked ? "bg-green-100 text-green-800" : ""}`}
                        >
                          {selectedRecord.linked ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Course Information</h4>
                    <div className="mt-2 space-y-2">
                      <div>
                        <span className="text-sm font-medium">Code:</span>
                        <span className="text-sm ml-2">{selectedRecord.courseCode}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Description:</span>
                        <span className="text-sm ml-2">{selectedRecord.courseDescription}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Status:</span>
                        <span className={`text-sm ml-2 ${hasStatusMismatch(selectedRecord) ? "text-amber-600 font-semibold" : ""}`}>
                          {selectedRecord.status}
                        </span>
                        {hasStatusMismatch(selectedRecord) && (
                          <span className="text-amber-600 ml-2">
                            <AlertTriangle className="h-4 w-4 inline-block" />
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-medium">Grade:</span>
                        <span className="text-sm ml-2">{selectedRecord.value !== '-' ? selectedRecord.value : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Enrollment Details</h4>
                    <div className="mt-2 space-y-2">
                      <div>
                        <span className="text-sm font-medium">School Year:</span>
                        <span className="text-sm ml-2">{selectedRecord.schoolYear.replace('_', '/')}</span>
                      </div>
                      <div>
                      <span className="text-sm font-medium">Term:</span>
<span className="text-sm ml-2">{selectedRecord.term}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Period:</span>
                        <span className="text-sm ml-2">{selectedRecord.period}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Assignment Date:</span>
                        <span className="text-sm ml-2">{selectedRecord.assignmentDate}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Exit Date:</span>
                        <span className="text-sm ml-2">{selectedRecord.exitDate}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Additional Information</h4>
                    <div className="mt-2 space-y-2">
                      <div>
                        <span className="text-sm font-medium">Credits Attempted:</span>
                        <span className="text-sm ml-2">{selectedRecord.creditsAttempted}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Dual Enrollment:</span>
                        <span className="text-sm ml-2">{selectedRecord.dualEnrolment}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Approved:</span>
                        <span className="text-sm ml-2">{selectedRecord.approved}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Funding Requested:</span>
                        <span className="text-sm ml-2">{selectedRecord.fundingRequested}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Last Updated:</span>
                        <span className="text-sm ml-2">{selectedRecord.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Add matching YourWay status information if there's a status mismatch */}
                {hasStatusMismatch(selectedRecord) && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <h4 className="text-sm font-medium text-amber-800">Status Compatibility Issue Details</h4>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-amber-700">PASI Status:</span>
                        <span className="text-sm ml-2 text-amber-700">{selectedRecord.status}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-amber-700">YourWay Status:</span>
                        <span className="text-sm ml-2 text-amber-700">
                          {getStatusMismatchForRecord(selectedRecord)?.summaryStatus || "Unknown"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-sm font-medium text-amber-700">Explanation:</span>
                      <p className="text-sm text-amber-700 mt-1">
                        {getStatusMismatchForRecord(selectedRecord)?.explanation || 
                        "This record's status is incompatible with its YourWay status."}
                      </p>
                    </div>
                  </div>
                )}
                
                <DialogFooter className="mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowRecordDetails(false)}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>


{/* Status Mismatch Dialog */}
<Dialog open={statusMismatchDialogOpen} onOpenChange={setStatusMismatchDialogOpen}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Status Compatibility Issue</DialogTitle>
      <DialogDescription>
        This record has a status that may be incompatible with its YourWay status.
      </DialogDescription>
    </DialogHeader>
    
    {selectedMismatch && (
      <>
        <div className="py-4">
          <div className="mb-4 p-3 bg-muted rounded-md">
            <p><span className="font-medium">Student:</span> {selectedMismatch.studentName}</p>
            <p><span className="font-medium">Course:</span> {selectedMismatch.courseCode} - {selectedMismatch.courseDescription}</p>
          </div>
          
          {/* Update this grid to include the state */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="border p-3 rounded-md">
              <p className="text-sm font-medium mb-1">PASI Status:</p>
              <p className="text-lg">{selectedMismatch.status}</p>
            </div>
            <div className="border p-3 rounded-md">
              <p className="text-sm font-medium mb-1">YourWay Status:</p>
              <p className="text-lg">{selectedMismatch.summaryStatus}</p>
            </div>
            <div className="border p-3 rounded-md bg-blue-50">
              <p className="text-sm font-medium mb-1 text-blue-800">YourWay State:</p>
              <p className="text-lg text-blue-800">{selectedMismatch.summaryState || 'Not Set'}</p>
            </div>
          </div>
          
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Explanation</AlertTitle>
            <AlertDescription className="text-amber-700">
              {selectedMismatch.explanation}
            </AlertDescription>
          </Alert>
          
          {/* Add state update UI if needed */}
          {selectedMismatch.needsArchived && (
            <div className="mt-4 p-3 border border-blue-200 rounded-md bg-blue-50">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Required Action</h3>
              <p className="text-sm text-blue-700">
                Set the YourWay State to "Archived" to resolve this issue.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <StateEditCell record={selectedMismatch} />
              </div>
            </div>
          )}
          
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              <HelpCircle className="h-4 w-4 inline-block mr-1" />
              {selectedMismatch.needsArchived 
                ? "Set the YourWay State to 'Archived' to resolve this issue."
                : "To resolve this issue, either update the PASI record status or adjust the YourWay course status."}
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setStatusMismatchDialogOpen(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </>
    )}
  </DialogContent>
</Dialog>

        {/* Delete confirmation dialog for single record */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete PASI Record</DialogTitle>
            </DialogHeader>
            
            {recordToDelete && (
              <>
                <div className="py-4">
                  <p>Are you sure you want to delete this PASI record?</p>
                  <div className="mt-2 p-2 bg-muted rounded-md">
                    <p><span className="font-medium">Student:</span> {recordToDelete.studentName}</p>
                    <p><span className="font-medium">Course:</span> {recordToDelete.courseCode} - {recordToDelete.courseDescription}</p>
                    <p><span className="font-medium">School Year:</span> {recordToDelete.schoolYear.replace('_', '/')}</p>
                  </div>
                  {recordToDelete.linked && (
                    <Alert className="mt-4" variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Warning</AlertTitle>
                      <AlertDescription>
                        This record is linked to a YourWay student course. Deleting it will remove this link.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(false)}
                    disabled={isDeletingRecord}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={handleDeleteRecord}
                    disabled={isDeletingRecord}
                  >
                    {isDeletingRecord ? "Deleting..." : "Delete Record"}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete all confirmation dialog */}
        <Dialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete All PASI Records</DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <p>Are you sure you want to delete <strong>ALL</strong> PASI records for the {selectedSchoolYear} school year?</p>
              
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 text-amber-600" />
                  <div>
                    <p className="font-medium">This action cannot be undone.</p>
                    <p className="text-sm mt-1">
                      {pasiRecords.length} records will be permanently deleted from the database.
                    </p>
                  </div>
                </div>
              </div>
              
              {pasiRecords.filter(r => r.linked).length > 0 && (
                <Alert className="mt-4" variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    {pasiRecords.filter(r => r.linked).length} records are linked to YourWay student courses. 
                    Deleting these records will remove these links.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteAllDialogOpen(false)}
                disabled={isDeletingAllRecords}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteAllRecords}
                disabled={isDeletingAllRecords}
              >
                {isDeletingAllRecords ? "Deleting..." : "Delete All Records"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cleanup Links Dialog */}
        <Dialog open={isCleanupDialogOpen} onOpenChange={setIsCleanupDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Cleanup PASI Links</DialogTitle>
              <DialogDescription className="pt-2">
                This will scan all PASI links in the database and clean up orphaned or inconsistent links.
              </DialogDescription>
            </DialogHeader>
            
            {isCleaningUp ? (
              <div className="py-6 space-y-4">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  <p className="text-center font-medium">Cleaning up PASI links...</p>
                  <p className="text-center text-sm text-muted-foreground mt-1">
                    This may take a few minutes for large databases
                  </p>
                </div>
                <Progress value={50} className="w-full" />
              </div>
            ) : (
              <>
                <div className="py-4">
                  <p>This operation will:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                    <li>Remove links with missing PASI records</li>
                    <li>Remove links with missing student course summaries</li>
                    <li>Fix inconsistencies between links and references</li>
                    <li>Clean up orphaned links and references</li>
                  </ul>
                  
                  <Alert className="mt-4" variant="default">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Note</AlertTitle>
                    <AlertDescription className="text-sm">
                      This process might take several minutes depending on the size of your database. You can continue using the application while it runs.
                    </AlertDescription>
                  </Alert>
                </div>
                
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCleanupDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCleanupLinks}
                    disabled={isCleaningUp}
                  >
                    Run Cleanup
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        <CourseLinkingDialog
          isOpen={isLinkingDialogOpen}
          onClose={handleCloseLinkingDialog}
          record={selectedRecord}
        />

        <CreateStudentDialog
          isOpen={isCreateStudentDialogOpen}
          onClose={handleCloseCreateStudentDialog}
          record={selectedRecordForCreate}
        />
      </div>
      
      {/* Add function to generate CSV for missing PASI records */}
      <Toaster position="top-right" />
    </TooltipProvider>
  );
};

// Helper function to generate a CSV file for missing PASI records
const handleGeneratePasiCsv = async () => {
  // Implementation would go here - this was referenced but not defined in the original code
  // This function would generate a CSV file with missing PASI records
};

export default PASIDataUpload;