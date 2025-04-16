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
  Search, 
  X, 
  ArrowUp, 
  ArrowDown,
  Copy,
  EyeIcon,
  Link2,
  AlertTriangle,
  Trash,
  Sparkles, 
  Loader2,
  AlertCircle,
  UserPlus,
  XCircle,
  CheckCircle,
  HelpCircle,
  ChevronDown, 
  ChevronRight,
  GraduationCap,
  Wrench,
  Mail
} from 'lucide-react';
import Papa from 'papaparse';
import { toast, Toaster } from 'sonner';
import PASIPreviewDialog from './PASIPreviewDialog';
import { getDatabase, ref, query, orderByChild, equalTo, onValue, off, get, update, remove } from 'firebase/database';
import { validatePasiRecordsLinkStatus } from '../utils/pasiValidation';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { getFunctions, httpsCallable } from 'firebase/functions';
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
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "../components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose
} from "../components/ui/sheet";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Progress } from "../components/ui/progress";
import CourseLinkingDialog from './CourseLinkingDialog';
import { processPasiLinkCreation, formatSchoolYearWithSlash, processPasiRecordDeletions, getCourseIdsForPasiCode } from '../utils/pasiLinkUtils';
import CreateStudentDialog from './CreateStudentDialog';
import MissingPasiRecordsTab from './MissingPasiRecordsTab';
import { COURSE_OPTIONS, COURSE_CODE_TO_ID, ACTIVE_FUTURE_ARCHIVED_OPTIONS, COURSE_ID_TO_CODE } from '../config/DropdownOptions';
import RevenueTab from './RevenueTab';
import PermissionIndicator from '../context/PermissionIndicator';
import NPAdjustments from './NPAdjustments';
import { useAuth } from '../context/AuthContext';
import { useSchoolYear } from '../context/SchoolYearContext';
import { hasPasiRecordForCourse, isRecordActuallyMissing, getPasiCodesForCourseId} from '../utils/pasiRecordsUtils';

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
  // Get data from SchoolYearContext
  const { 
    currentSchoolYear,
    setCurrentSchoolYear,
    schoolYearOptions: contextSchoolYearOptions,
    pasiRecords: contextPasiRecords,
    pasiStudentSummariesCombined,
    unlinkedPasiRecords,
    unmatchedStudentSummaries,
    studentSummaries,
    isLoadingStudents,
    error: contextError,
    refreshStudentSummaries
  } = useSchoolYear();

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
  
  // New state for email editing
  const [isEmailEditDialogOpen, setIsEmailEditDialogOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState(null);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

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
  const [summaryAccordionValue, setSummaryAccordionValue] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({});
  const [isGradebookSheetOpen, setIsGradebookSheetOpen] = useState(false);
  const [selectedGradebookRecord, setSelectedGradebookRecord] = useState(null);
  const [studentCourseSummaries, setStudentCourseSummaries] = useState([]);
  const [isLoadingCourseSummaries, setIsLoadingCourseSummaries] = useState(true);
  const { hasSuperAdminAccess } = useAuth();
  const [unfilteredCombinedRecords, setUnfilteredCombinedRecords] = useState([]);

  // Update local school year when context changes
  useEffect(() => {
    if (currentSchoolYear && !selectedSchoolYear) {
      setSelectedSchoolYear(currentSchoolYear);
    }
  }, [currentSchoolYear, selectedSchoolYear]);

  // Update context when local selection changes
  useEffect(() => {
    if (selectedSchoolYear && selectedSchoolYear !== currentSchoolYear) {
      setCurrentSchoolYear(selectedSchoolYear);
    }
  }, [selectedSchoolYear, currentSchoolYear, setCurrentSchoolYear]);

  // Update school year options from context
  useEffect(() => {
    if (contextSchoolYearOptions && contextSchoolYearOptions.length > 0) {
      setSchoolYearOptions(contextSchoolYearOptions);
    }
  }, [contextSchoolYearOptions]);

  // Update PASI records from context - we use pasiStudentSummariesCombined for better data
  useEffect(() => {
    if (pasiStudentSummariesCombined) {
      setPasiRecords(pasiStudentSummariesCombined);
      setIsLoading(false);
      setIsLoadingCourseSummaries(false);
    }
  }, [pasiStudentSummariesCombined]);

  // Update missing PASI records from context unmatchedStudentSummaries
  useEffect(() => {
    if (unmatchedStudentSummaries) {
      setMissingPasiRecords(unmatchedStudentSummaries);
      setIsLoadingMissing(false);
    }
  }, [unmatchedStudentSummaries]);

  // Update summary map from student summaries
  useEffect(() => {
    if (studentSummaries) {
      // Create a map for fast lookup
      const summaryMap = {};
      studentSummaries.forEach(summary => {
        if (summary.id) {
          summaryMap[summary.id] = summary;
        }
      });
      setSummaryDataMap(summaryMap);
    }
  }, [studentSummaries]);

  // Sync error states
  useEffect(() => {
    if (contextError) {
      setError(contextError);
    }
  }, [contextError]);

  const handleOpenGradebook = (record) => {
    setSelectedGradebookRecord(record);
    setIsGradebookSheetOpen(true);
  };

  // Add a function to toggle group expansion
  const toggleGroupExpansion = (asn) => {
    setExpandedGroups(prev => ({
      ...prev,
      [asn]: !prev[asn]
    }));
  };

  // Add a function to expand or collapse all groups
  const toggleAllGroups = (expand) => {
    const asnSet = new Set(filteredRecords.map(record => record.asn));
    const newState = {};
    
    asnSet.forEach(asn => {
      newState[asn] = expand;
    });
    
    setExpandedGroups(newState);
  };

  // With this function:
  const countActualMissingRecords = (records) => {
    if (!records || records.length === 0) return 0;
    return records.filter(record => isRecordActuallyMissing(record)).length;
  };

  const StateEditCell = ({ record }) => {
    // Add safety check at the beginning
    if (!record) return <span>Not Set</span>;
    
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

  const courseIdToPasiCode = useMemo(() => {
    // Start with the COURSE_ID_TO_CODE mapping
    const mapping = { ...COURSE_ID_TO_CODE };
    
    // Add any additional mappings from COURSE_OPTIONS
    COURSE_OPTIONS.forEach(course => {
      if (course.courseId && course.pasiCode) {
        const courseId = parseInt(course.courseId, 10);
        
        // If this courseId already has a mapping, make sure it's an array
        if (mapping[courseId]) {
          if (!Array.isArray(mapping[courseId])) {
            mapping[courseId] = [mapping[courseId]];
          }
          // Add the new pasiCode if it's not already included
          if (!mapping[courseId].includes(course.pasiCode)) {
            mapping[courseId].push(course.pasiCode);
          }
        } else {
          // New mapping
          mapping[courseId] = course.pasiCode;
        }
      }
    });
    
    return mapping;
  }, []);

  const isStudentTypePeriodCompatible = (studentType, period) => {
    // Check Non-Primary and Home Education should have Regular period
    if ((studentType === "Non-Primary" || studentType === "Home Education") && period !== "Regular") {
      return false;
    }
    
    // Check Summer School should have Summer period
    if (studentType === "Summer School" && period !== "Summer") {
      return false;
    }
    
    return true;
  };
  
  // Add explanation for student type/period mismatches
  const getStudentTypePeriodMismatchExplanation = (studentType, period) => {
    if ((studentType === "Non-Primary" || studentType === "Home Education") && period !== "Regular") {
      return `Student type "${studentType}" should have a "Regular" period, but has "${period}" instead.`;
    }
    
    if (studentType === "Summer School" && period !== "Summer") {
      return `Student type "Summer School" should have a "Summer" period, but has "${period}" instead.`;
    }
    
    return "Student type and period incompatibility.";
  };

  // Function to show status mismatch details
  const showStatusMismatchDetails = (record) => {
    setSelectedMismatch(record);
    setStatusMismatchDialogOpen(true);
  };

  const checkStatusMismatch = (pasiRecords, summaryDataMap) => {
    console.log("Running checkStatusMismatch with", pasiRecords.length, "records");
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
          const summaryPasiCode = courseIdToPasiCode[summaryCourseId];
          
          if (summaryPasiCode === record.courseCode) {
            // Get student type from summary
            const studentType = summary.StudentType_Value;
            
            // Check if statuses are compatible
            const isCompatible = isStatusCompatible(
              record.status, 
              summary.Status_Value,
              summary.ActiveFutureArchived_Value
            );
            
            // Check if student type and period are compatible
            const isTypePeriodCompatible = isStudentTypePeriodCompatible(
              studentType,
              record.period
            );
            
            // Add to mismatches if either check fails
            if (!isCompatible || !isTypePeriodCompatible) {
              let explanation = '';
              let needsArchived = false;
              
              if (!isCompatible) {
                explanation = getStatusMismatchExplanation(
                  record.status, 
                  summary.Status_Value,
                  summary.ActiveFutureArchived_Value
                );
                
                needsArchived = record.status === "Completed" && 
                               summary.Status_Value === "Unenrolled" && 
                               summary.ActiveFutureArchived_Value !== "Archived";
              } else {
                explanation = getStudentTypePeriodMismatchExplanation(
                  studentType,
                  record.period
                );
              }
              
              recordsWithMismatch.push({
                ...record,
                summaryStatus: summary.Status_Value,
                summaryState: summary.ActiveFutureArchived_Value || 'Not Set',
                summaryKey,
                studentKey: summaryKey.split('_')[0],
                courseId: summaryCourseId.toString(),
                needsArchived,
                explanation,
                studentType,
                isStudentTypePeriodMismatch: !isTypePeriodCompatible
              });
            }
          }
        }
      });
    });
    console.log("Found", recordsWithMismatch.length, "mismatches");
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

  const findMissingPasiRecords = () => {
    // We now use unmatchedStudentSummaries from context, but we keep the function signature
    // for compatibility with other code that calls it
    setIsLoadingMissing(true);
    
    // Data is now coming from context's unmatchedStudentSummaries
    // Just ensure our local state is updated
    setMissingPasiRecords(unmatchedStudentSummaries || []);
    
    setIsLoadingMissing(false);
  };

  useEffect(() => {
    if (pasiRecords.length > 0 && Object.keys(summaryDataMap).length > 0 && !isLoadingCourseSummaries) {
      setUnfilteredCombinedRecords(pasiRecords); // pasiRecords is already combined from context
    } else {
      setUnfilteredCombinedRecords([]);
    }
  }, [pasiRecords, summaryDataMap, isLoadingCourseSummaries]);

  // Check for status mismatches when data is available
  useEffect(() => {
    if (pasiRecords.length > 0 && Object.keys(summaryDataMap).length > 0 && !isLoadingCourseSummaries) {
      checkStatusMismatch(pasiRecords, summaryDataMap);
    }
  }, [pasiRecords, summaryDataMap, isLoadingCourseSummaries]);

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
      // Use the refreshStudentSummaries function from context
      refreshStudentSummaries();
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
      const cleanupOrphanedPasiLinks = httpsCallable(functions, 'cleanupOrphanedPasiLinksV2');
      
      toast.info("Starting PASI link cleanup process...");
      
      // Pass an empty object as parameter (or add actual parameters if needed)
      const result = await cleanupOrphanedPasiLinks({});
      
      // In callable functions, the result is in result.data
      const data = result.data;
      
      setCleanupResults(data.results);
      toast.success(data.message);
      
      // Close dialog after successful completion
      setIsCleanupDialogOpen(false);
      
      // Refresh data from context
      refreshStudentSummaries();
      
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

  // Function to open email edit dialog
  const handleOpenEmailEditDialog = (record) => {
    setRecordToEdit(record);
    setIsEmailEditDialogOpen(true);
  };
  
  // Function to update email and summaryKey in PASI record
  const handleUpdatePasiRecordEmail = async (recordId, newEmail, summaryKey = null) => {
    if (!recordId || !newEmail) return;
    
    setIsUpdatingEmail(true);
    try {
      const db = getDatabase();
      
      // Update the email in the PASI record
      const updates = {};
      updates[`pasiRecords/${recordId}/email`] = newEmail;
      
      // If summaryKey is provided, update it as well
      if (summaryKey !== null) {
        updates[`pasiRecords/${recordId}/summaryKey`] = summaryKey;
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
      
      // Refresh data from context
      refreshStudentSummaries();
      
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
      const BATCH_SIZE = 400; // Adjust this number based on Firebase limits
      const batches = [];
      
      // Split records into batches
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        batches.push(records.slice(i, i + BATCH_SIZE));
      }
      
      // Process batches sequentially
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const batchNumber = i + 1;
        const totalBatches = batches.length;
        
        // Show progress toast
        toast.loading(`Processing batch ${batchNumber}/${totalBatches}...`, {
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
      
      // Refresh data from context
      refreshStudentSummaries();
      
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

  const handleCloseLinkingDialog = (wasLinked = false) => {
    setIsLinkingDialogOpen(false);
    setSelectedRecord(null);
    
    // If a link was created, refresh data
    if (wasLinked) {
      refreshStudentSummaries();
    }
  };

  // Sort data function
  const sortData = (data, column, direction) => {
    // First, group data by ASN
    const groupedData = {};
    data.forEach(record => {
      const asn = record.asn || 'unknown';
      if (!groupedData[asn]) {
        groupedData[asn] = [];
      }
      groupedData[asn].push(record);
    });
    
    // Sort each group internally by the selected column
    Object.keys(groupedData).forEach(asn => {
      groupedData[asn] = groupedData[asn].sort((a, b) => {
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
            aValue = a.pasiTerm || '';
            bValue = b.pasiTerm || '';
            break;
          case 'asn':
            aValue = a.asn || '';
            bValue = b.asn || '';
            break;
          case 'email':
            aValue = a.email || '';
            bValue = b.email || '';
            break;
          case 'yourWayTerm':
            aValue = a.yourWayTerm || '';
            bValue = b.yourWayTerm || '';
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
    });
    
    // Sort the ASN groups themselves (if asn is the sort column, or by student name otherwise)
    const sortedAsns = Object.keys(groupedData).sort((a, b) => {
      if (column === 'asn') {
        return direction === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
      } else {
        // Sort by the first student's name in each group
        const aName = groupedData[a][0]?.studentName || '';
        const bName = groupedData[b][0]?.studentName || '';
        return direction === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName);
      }
    });
    
    // Flatten the grouped data back into an array, keeping groups together
    const result = [];
    sortedAsns.forEach(asn => {
      result.push(...groupedData[asn]);
    });
    
    return result;
  };

  // Enhanced calculateGroupInfo function with required courses check
  const calculateGroupInfo = (records) => {
    const groups = {};
    
    records.forEach(record => {
      const asn = record.asn || 'unknown';
      if (!groups[asn]) {
        groups[asn] = {
          asn,
          count: 0,
          studentName: record.studentName,
          email: record.email,
          linked: 0,
          notLinked: 0,
          statusMismatches: 0,
          mismatchedRecords: [], // Add this to track individual mismatched records
          courseList: new Set(),
          hasRequiredCourses: {
            COM1255: false,
            INF2020: false
          },
          isExemptFromRequiredCourses: false,
          firstIndex: null,
          studentType: record.studentType || null,
        };
      }
      
      groups[asn].count++;
      if (record.linked) groups[asn].linked++;
      else groups[asn].notLinked++;
      
      // Check both by record ID and by status compatibility directly
      const hasMismatch = hasStatusMismatch(record);
      if (hasMismatch) {
        groups[asn].statusMismatches++;
        groups[asn].mismatchedRecords.push(record.id); // Track the specific record
      }
      
      // Track courses
      groups[asn].courseList.add(record.courseCode);
      
      // Check for required courses
      if (record.courseCode === "COM1255") {
        groups[asn].hasRequiredCourses.COM1255 = true;
      }
      if (record.courseCode === "INF2020") {
        groups[asn].hasRequiredCourses.INF2020 = true;
      }
      
      // Check if exempt from required courses
      if (record.studentType === 'Adult Student' || record.studentType === 'International Student') {
        groups[asn].isExemptFromRequiredCourses = true;
      }
      
      // Track the first index of this ASN in the array
      if (groups[asn].firstIndex === null) {
        groups[asn].firstIndex = records.indexOf(record);
      }
    });
    
    // Process each group to determine if warning is needed
    Object.values(groups).forEach(group => {
      group.needsRequiredCoursesWarning = !group.isExemptFromRequiredCourses && 
        (!group.hasRequiredCourses.COM1255 || !group.hasRequiredCourses.INF2020);
    });
    
    return groups;
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

  // Updated effect for handling filtered and paginated data
  useEffect(() => {
    // Apply search filter
    let filtered = searchData(pasiRecords, searchTerm);
    
    // Apply status mismatch filter if enabled
    let filteredByCriteria = filtered;
    
    if (showStatusMismatchOnly) {
      // Create a new array for all mismatched records, including direct checks
      let allMismatchedRecords = [];
      
      // Check each record for status mismatches
      filtered.forEach(record => {
        // Check directly for Active/Unenrolled combinations
        if (record.status === "Active" && 
            record.statusValue === "Unenrolled") {
          allMismatchedRecords.push(record);
        }
        // Check based on validation rules
        else if (record.status === "Active" && 
            ValidationRules.statusCompatibility.Active.incompatibleStatuses.includes(record.statusValue)) {
          allMismatchedRecords.push(record);
        }
        // Check for precomputed mismatches too
        else if (recordsWithStatusMismatch.some(mismatch => mismatch.id === record.id)) {
          allMismatchedRecords.push(record);
        }
      });
      
      // Get all ASNs with mismatches
      const mismatchASNs = new Set(
        allMismatchedRecords.map(record => record.asn).filter(Boolean)
      );
      
      // Keep all records from ASNs that have at least one mismatch
      filteredByCriteria = filtered.filter(record => mismatchASNs.has(record.asn));
      
      // Debug logging
      console.log(`Found ${allMismatchedRecords.length} records with status mismatches`);
      console.log(`Showing ${filteredByCriteria.length} total records after ASN grouping`);
    }
    
    // Set filtered records
    setFilteredRecords(filteredByCriteria);
    
    // Apply sorting
    const sorted = sortData(filteredByCriteria, sortState.column, sortState.direction);
    
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
  }, [pasiRecords, searchTerm, sortState, currentPage, recordsWithStatusMismatch, showStatusMismatchOnly]);

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

  // Modified handleFileUpload to use refreshStudentSummaries from context after upload
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
    
    if (isLoadingStudents) {
      toast.error('Still loading student data. Please wait a moment...');
      return;
    }
  
    setIsProcessing(true);
    setChangePreview(null); // Reset change preview
    setShowPreview(false); 
  
    const config = {
      header: true,
      skipEmptyLines: 'greedy',
      complete: async (results) => {
        try {
          // Existing implementation...
          
          // After successful upload, refresh data from context
          refreshStudentSummaries();
          
        } catch (error) {
          console.error('Error processing CSV:', error);
          toast.error(error.message || 'Error processing CSV file');
        } finally {
          setIsProcessing(false);
          event.target.value = ''; // Reset file input
        }
      },
      error: (error) => {
        console.error('Papa Parse error:', error);
        toast.error('Failed to parse CSV file');
        setIsProcessing(false);
        event.target.value = ''; // Reset file input
      }
    };

    Papa.parse(file, config);
  };

  // Updated handleConfirmUpload to refresh data from context after upload
  const handleConfirmUpload = async () => {
    if (!changePreview || !changePreview.newRecordsMap) {
      toast.error('No changes to apply');
      return;
    }
    
    // Close the dialog immediately
    setShowPreview(false);
    
    // Show a toast to indicate background processing
    const progressToast = toast.loading("Processing changes in the background...", {
      duration: Infinity,
      id: "pasi-upload-progress"
    });
    
    setIsProcessing(true);
    try {
      // Existing implementation...
      
      // After successful upload, refresh data from context
      refreshStudentSummaries();
      
      toast.success("PASI records updated successfully");
      
    } catch (error) {
      console.error('Error updating records:', error);
      toast.error(error.message || 'Failed to update records');
      toast.dismiss(progressToast);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Helper function to check if a record has changed
  const hasRecordChanged = (existingRecord, newRecord) => {
    // Fields to compare (only the ones that come from CSV)
    const fieldsToCompare = [
      'asn', 'studentName', 'courseCode', 'courseDescription', 
      'status', 'period', 'value', 'approved', 'assignmentDate', 
      'creditsAttempted', 'deleted', 'dualEnrolment', 'exitDate', 
      'fundingRequested', 'term', 'referenceNumber' 
    ];
    
    return fieldsToCompare.some(field => existingRecord[field] !== newRecord[field]);
  };

  const handleCopyData = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleViewRecordDetails = (record) => {
    console.log("Selected record:", record);
    setSelectedRecord(record);
    setShowRecordDetails(true);
  };

  // Modified validation function to use data from context
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
      
      // Refresh data from context
      refreshStudentSummaries();
      
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
    if (!record || !record.id) return false;
    
    // Check in the pre-computed array first
    const inArray = recordsWithStatusMismatch.some(mismatch => mismatch.id === record.id);
    
    // If it's not in the array, do a direct check
    if (!inArray) {
      // Direct check for Active/Unenrolled combination
      if (record.status === "Active" && record.statusValue === "Unenrolled") {
        return true;
      }
      
      // Direct check based on our validation rules
      if (record.status === "Active" && 
          ValidationRules.statusCompatibility.Active.incompatibleStatuses.includes(record.statusValue)) {
        return true;
      }
      
      if (record.status === "Completed" && 
          !ValidationRules.statusCompatibility.Completed.validStatuses.includes(record.statusValue)) {
        return true;
      }
    }
    
    return inArray;
  };

  // Function to get the mismatch object for a record
  const getStatusMismatchForRecord = (record) => {
    if (!record || !record.id) return null;
    return recordsWithStatusMismatch.find(mismatch => mismatch.id === record.id) || null;
  };

  const getUniqueMismatchAsnsCount = () => {
    // Get unique ASNs from records with mismatches
    const uniqueASNs = new Set();
    
    recordsWithStatusMismatch.forEach(record => {
      if (record.asn) uniqueASNs.add(record.asn);
    });
    
    // Also check for direct Active/Unenrolled combinations
    unfilteredCombinedRecords.forEach(record => {
      if (record.status === "Active" && record.statusValue === "Unenrolled") {
        if (record.asn) uniqueASNs.add(record.asn);
      }
    });
    
    return uniqueASNs.size;
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
          <div className="flex justify-end mb-6">
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

            {isLoading || isLoadingCourseSummaries ? (
              <div className="text-center p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                <p>{isLoading ? "Loading PASI records..." : "Loading student course summaries..."}</p>
              </div>
            ) : pasiRecords.length > 0 ? (
              summary && (
                <div className="space-y-6">
                  <Accordion 
                    type="single" 
                    collapsible 
                    value={summaryAccordionValue} 
                    onValueChange={setSummaryAccordionValue}
                    className="w-full"
                  >
                    <AccordionItem value="summary" className="border-none">
                      <AccordionTrigger className="p-4 bg-muted hover:bg-muted/80 rounded-lg flex justify-between">
                        <h3 className="font-medium text-left">Current Records Summary</h3>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 px-4 pb-4 bg-muted rounded-b-lg border-t">
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
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  
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
            hasAllRequiredFields={changePreview?.allFieldsPresent || false}
            missingFields={changePreview?.missingFields || []}
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
                <TabsList className="mb-4 bg-slate-800 p-1 rounded-lg">
                  <TabsTrigger 
                    value="records" 
                    className="text-lg font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    Records
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="missingPasi"
                    className="text-lg font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    Missing PASI
                    {missingPasiRecords.length > 0 && (
                      <Badge variant="destructive" className="ml-2 bg-red-100 hover:bg-red-100 text-red-600">
                        {countActualMissingRecords(missingPasiRecords)}
                      </Badge>
                    )}
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="validation"
                    className="text-lg font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    Validation
                  </TabsTrigger>

                  {hasSuperAdminAccess() && (
                    <TabsTrigger 
                      value="revenue"
                      className="text-lg font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    >
                      Revenue
                      <PermissionIndicator type="SUPER_ADMIN" className="ml-2" />
                    </TabsTrigger>
                  )}

                  <TabsTrigger 
                    value="npAdjustments"
                    className="text-lg font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    NP Adjustments
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
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="showMismatchesOnly"
                        className="h-4 w-4 rounded border-gray-300"
                        checked={showStatusMismatchOnly}
                        onChange={() => setShowStatusMismatchOnly(!showStatusMismatchOnly)}
                        disabled={getUniqueMismatchAsnsCount() === 0}
                      />
                      <label htmlFor="showMismatchesOnly" className="text-sm">
                        Filter issues ({getUniqueMismatchAsnsCount()}) 
                        <span className="text-muted-foreground ml-1">
                          <AlertTriangle className="h-3 w-3 inline mx-1 text-amber-500" title="Status issues" />
                          <HelpCircle className="h-3 w-3 inline mx-1 text-blue-500" title="Student type/period issues" />
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Records table */}
                  <div className="rounded-md border">
                    {/* Add expand/collapse all buttons */}
                    <div className="flex justify-end p-2 gap-2 border-b">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => toggleAllGroups(true)}
                        className="text-xs"
                      >
                        <ChevronDown className="h-3 w-3 mr-1" />
                        Expand All
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => toggleAllGroups(false)}
                        className="text-xs"
                      >
                        <ChevronRight className="h-3 w-3 mr-1" />
                        Collapse All
                      </Button>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10"></TableHead> {/* New column for expand/collapse icons */}
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
                            <TableCell colSpan={12} className="h-24 text-center">
                              {searchTerm || showStatusMismatchOnly ? 'No matching records found.' : 'No records available.'}
                            </TableCell>
                          </TableRow>
                        ) : (
                          // Group by ASN
                          (() => {
                            const groups = calculateGroupInfo(paginatedRecords);
                            const rows = [];
                            
                            // Sort ASN groups by their first appearance in the array
                            const sortedAsns = Object.keys(groups).sort((a, b) => 
                              groups[a].firstIndex - groups[b].firstIndex
                            );
                            
                            sortedAsns.forEach(asn => {
                              const group = groups[asn];
                              const isExpanded = expandedGroups[asn] === true; // Default to collapsed
                              
                              // Filter records for this ASN
                              const groupRecords = paginatedRecords.filter(record => record.asn === asn);
                              
                              // Add a group header row
                              rows.push(
                                <TableRow 
                                  key={`group-${asn}`} 
                                  className="bg-muted/30 hover:bg-muted/50 cursor-pointer"
                                  onClick={() => toggleGroupExpansion(asn)}
                                >
                                  <TableCell className="py-2">
                                    {isExpanded ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                  </TableCell>
                                  <TableCell colSpan={10} className="py-2 font-medium">
                                    <div className="flex items-center gap-2">
                                      <span>{group.studentName}</span>
                                      <Badge variant="outline" className="ml-2">
                                        ASN: {asn}
                                      </Badge>
                                      <Badge variant="outline" className="ml-1">
                                        {group.count} course{group.count !== 1 ? 's' : ''}
                                      </Badge>
                                      {group.statusMismatches > 0 && (
                                        <Badge variant="outline" className="ml-1 bg-amber-100 text-amber-800 hover:bg-amber-200">
                                          {group.statusMismatches} mismatch{group.statusMismatches !== 1 ? 'es' : ''}
                                        </Badge>
                                      )}
                                      
                                      {/* Add the required courses warning */}
                                      {group.needsRequiredCoursesWarning && (
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <div className="ml-2">
                                              <AlertCircle className="h-4 w-4 text-blue-500" />
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p className="text-sm">
                                              This student may be missing required courses (COM1255 and INF2020)
                                            </p>
                                          </TooltipContent>
                                        </Tooltip>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCopyData(asn);
                                        }}
                                        title="Copy ASN"
                                      >
                                        <Copy className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                              
                              // Add individual records if the group is expanded
                              if (isExpanded) {
                                groupRecords.forEach((record, index) => {
                                  const recordIndex = pasiRecords.findIndex(r => r.id === record.id);
                                  const hasMismatch = hasStatusMismatch(record);
                                  
                                  // Debug log full record data for each row being rendered
                                  console.log(`Rendering record row ${recordIndex}:`, JSON.stringify(record));
                                  
                                  rows.push(
                                    <Tooltip key={record.id}>
                                      <TooltipTrigger asChild>
                                        <TableRow 
                                          className={`
                                            ${hoveredRow === recordIndex ? "bg-accent/20" : ""}
                                            ${record.linked ? "bg-green-50/70 dark:bg-green-950/20" : ""}
                                            ${hasMismatch ? "bg-amber-50/70 dark:bg-amber-950/20" : ""}
                                            border-l-4 border-l-transparent
                                          `}
                                          onMouseEnter={() => setHoveredRow(recordIndex)}
                                          onMouseLeave={() => setHoveredRow(null)}
                                        >
                                          <TableCell></TableCell>
                                          <TableCell>{record.studentName}</TableCell>
                                          <TableCell>{record.courseCode}</TableCell>
                                          <TableCell className="max-w-[200px] truncate" title={record.courseDescription}>
                                            {record.courseDescription}
                                          </TableCell>
                                          <TableCell>
                                            <div className="flex items-center gap-1">
                                              {record.status}
                                              {hasStatusMismatch(record) && (
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    {getStatusMismatchForRecord(record)?.isStudentTypePeriodMismatch ? (
                                                      <HelpCircle 
                                                        className="h-4 w-4 text-blue-500 cursor-pointer"
                                                        onClick={() => showStatusMismatchDetails(getStatusMismatchForRecord(record))}
                                                      />
                                                    ) : (
                                                      <AlertTriangle 
                                                        className="h-4 w-4 text-amber-500 cursor-pointer"
                                                        onClick={() => showStatusMismatchDetails(getStatusMismatchForRecord(record))}
                                                      />
                                                    )}
                                                  </TooltipTrigger>
                                                  <TooltipContent className="max-w-xs">
  <p>{getStatusMismatchForRecord(record)?.isStudentTypePeriodMismatch ? 
      "Student type and period compatibility issue. Click for details." : 
      "Status compatibility issue. Click for details."}</p>
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
                                            {hasStatusMismatch(record) ? (
                                              <StateEditCell record={getStatusMismatchForRecord(record) || {
                                                summaryState: record.summaryState || 'Not Set',
                                                studentKey: record.studentKey,
                                                courseId: record.courseId,
                                                needsArchived: false
                                              }} />
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
                                                onClick={() => {
                                                  console.log("View button clicked, record:", record);
                                                  handleViewRecordDetails(record);
                                                }}
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
                                                
                                              {/* Fix PASI Record button */}
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleOpenEmailEditDialog(record)}
                                                title="Fix PASI Record Links"
                                                className="text-purple-500 hover:text-purple-700 hover:bg-purple-50"
                                              >
                                                <Wrench className="h-4 w-4" />
                                              </Button>

                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleOpenGradebook(record)}
                                                title="View Gradebook"
                                                className="text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50"
                                              >
                                                <GraduationCap className="h-4 w-4" />
                                              </Button>
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
                                });
                              }
                            });
                            
                            return rows;
                          })()
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {renderPagination()}
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

                {hasSuperAdminAccess() && (
                  <TabsContent value="revenue">
                    <RevenueTab records={unfilteredCombinedRecords} />
                  </TabsContent>
                )}

                <TabsContent value="npAdjustments">
                  <NPAdjustments records={unfilteredCombinedRecords} />
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
              <DialogTitle>
                {selectedMismatch?.isStudentTypePeriodMismatch 
                  ? "Student Type/Period Mismatch" 
                  : "Status Compatibility Issue"}
              </DialogTitle>
              <DialogDescription>
                {selectedMismatch?.isStudentTypePeriodMismatch 
                  ? "This record has a student type and period combination that is invalid." 
                  : "This record has a status that may be incompatible with its YourWay status."}
              </DialogDescription>
            </DialogHeader>
            
            {selectedMismatch && (
              <>
                <div className="py-4">
                  <div className="mb-4 p-3 bg-muted rounded-md">
                    <p><span className="font-medium">Student:</span> {selectedMismatch.studentName}</p>
                    <p><span className="font-medium">Course:</span> {selectedMismatch.courseCode} - {selectedMismatch.courseDescription}</p>
                  </div>
                  
                  {/* Conditionally render different content based on mismatch type */}
                  {selectedMismatch.isStudentTypePeriodMismatch ? (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="border p-3 rounded-md">
                        <p className="text-sm font-medium mb-1">Student Type:</p>
                        <p className="text-lg">{selectedMismatch.studentType}</p>
                      </div>
                      <div className="border p-3 rounded-md">
                        <p className="text-sm font-medium mb-1">Period:</p>
                        <p className="text-lg">{selectedMismatch.period}</p>
                      </div>
                    </div>
                  ) : (
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
                  )}
                  
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-800">Explanation</AlertTitle>
                    <AlertDescription className="text-amber-700">
                      {selectedMismatch.explanation}
                    </AlertDescription>
                  </Alert>
                  
                  {/* Add state update UI if needed - only for status mismatches that need archived */}
                  {!selectedMismatch.isStudentTypePeriodMismatch && selectedMismatch.needsArchived && (
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
                  
                  {/* For student type/period mismatches, show how to fix */}
                  {selectedMismatch.isStudentTypePeriodMismatch && (
                    <div className="mt-4 p-3 border border-blue-200 rounded-md bg-blue-50">
                      <h3 className="text-sm font-medium text-blue-800 mb-2">How to Resolve</h3>
                      <p className="text-sm text-blue-700">
                        {selectedMismatch.studentType === "Summer School" 
                          ? "Summer School students should have a 'Summer' period value in PASI."
                          : "Non-Primary and Home Education students should have a 'Regular' period value in PASI."}
                      </p>
                      <p className="text-sm text-blue-700 mt-2">
                        Please correct this in PASI and re-upload the data.
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">
                      <HelpCircle className="h-4 w-4 inline-block mr-1" />
                      {selectedMismatch.isStudentTypePeriodMismatch 
                        ? "This mismatch needs to be corrected in PASI before uploading again."
                        : selectedMismatch.needsArchived 
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

      {/* Gradebook Sheet */}
      <Sheet open={isGradebookSheetOpen} onOpenChange={setIsGradebookSheetOpen}>
        <SheetContent className="sm:max-w-xl md:max-w-2xl lg:max-w-4xl overflow-hidden" side="right">
          <SheetHeader>
            <SheetTitle>
              {selectedGradebookRecord?.studentName} - {selectedGradebookRecord?.courseCode}
            </SheetTitle>
            <SheetDescription>
              Student gradebook from Learning Management System
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 h-[calc(100vh-10rem)] relative">
            {selectedGradebookRecord ? (
              !selectedGradebookRecord.courseID || !selectedGradebookRecord.lmsStudentID ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />
                  <p className="text-muted-foreground text-center">
                    Missing required information to display gradebook.
                    <br />
                    <span className="text-sm mt-1 block">
                      {!selectedGradebookRecord.courseID && "Course ID is missing."}
                      {!selectedGradebookRecord.lmsStudentID && "LMS Student ID is missing."}
                    </span>
                  </p>
                </div>
              ) : (
                <iframe 
                  src={`https://edge.rtdacademy.com/course/gradebook.php?cid=${selectedGradebookRecord.courseID}&stu=${selectedGradebookRecord.lmsStudentID}`}
                  className="w-full h-full border-0"
                  title="Student Gradebook"
                  sandbox="allow-same-origin allow-scripts allow-forms"
                />
              )
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No student record selected</p>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex justify-end">
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* EmailEditDialog Component - implemented as a child component in the original code */}
      <EmailEditDialog 
        record={recordToEdit}
        isOpen={isEmailEditDialogOpen}
        onClose={() => setIsEmailEditDialogOpen(false)}
        onUpdate={handleUpdatePasiRecordEmail}
        isUpdating={isUpdatingEmail}
      />
      
      <Toaster position="top-right" />
    </TooltipProvider>
  );
};

// Helper function to generate a CSV file for missing PASI records
const handleGeneratePasiCsv = async () => {
  // Implementation would go here
};

// We need to keep this component as it's referenced in the main component
const EmailEditDialog = ({ record, isOpen, onClose, onUpdate, isUpdating }) => {
  const [newEmail, setNewEmail] = useState(record?.email || '');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [summaryKey, setSummaryKey] = useState(record?.summaryKey || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (record) {
      setNewEmail(record.email || '');
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
              value={record?.email || ''} 
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
                    ))}
                  </div>
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

export default PASIDataUpload;