import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Upload, 
  AlertTriangle,
  Trash,
  Sparkles, 
  Loader2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import Papa from 'papaparse';
import { toast, Toaster } from 'sonner';
import { getDatabase, ref, query, orderByChild, equalTo, onValue, off, get, update, remove } from 'firebase/database';
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

import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Progress } from "../components/ui/progress";
//import CourseLinkingDialog from './CourseLinkingDialog';
import { processPasiLinkCreation, formatSchoolYearWithSlash, processPasiRecordDeletions, getCourseIdsForPasiCode } from '../utils/pasiLinkUtils';

import MissingPasi from '../TeacherDashboard/MissingPasi';
import MissingYourWay from '../TeacherDashboard/MissingYourWay';
import { COURSE_OPTIONS, COURSE_CODE_TO_ID, ACTIVE_FUTURE_ARCHIVED_OPTIONS, COURSE_ID_TO_CODE } from '../config/DropdownOptions';
import { useAuth } from '../context/AuthContext';
import { useSchoolYear } from '../context/SchoolYearContext';
import { hasPasiRecordForCourse, isRecordActuallyMissing, getPasiCodesForCourseId, filterRelevantMissingPasiRecords, filterRelevantMissingPasiRecordsWithEmailCheck, hasValidAsnEmailAssociation } from '../utils/pasiRecordsUtils';
import PasiRecords from '../TeacherDashboard/pasiRecords';
import { processCsvFile, applyChanges } from '../utils/pasiCsvUtils';
import PASIPreviewDialog from './PASIPreviewDialog'; 
import StatusConflicts from '../TeacherDashboard/StatusConflicts';

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
    duplicateAsnStudents,
    studentSummaries,
    isLoadingStudents,
    error: contextError,
    refreshStudentSummaries,
    asnEmailMap,  
  } = useSchoolYear();

  const [selectedSchoolYear, setSelectedSchoolYear] = useState('');
  const [schoolYearOptions, setSchoolYearOptions] = useState([]);
  const [pasiRecords, setPasiRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showPreview, setShowPreview] = useState(false);
  const [changePreview, setChangePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);


  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showRecordDetails, setShowRecordDetails] = useState(false);
  const [isLinkingDialogOpen, setIsLinkingDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("records");
  const [recordsWithStatusMismatch, setRecordsWithStatusMismatch] = useState([]);
  const [summaryDataMap, setSummaryDataMap] = useState({});
  
  // New state for email editing
  const [isEmailEditDialogOpen, setIsEmailEditDialogOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState(null);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  // Status mismatch state
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


  const [isCreateStudentDialogOpen, setIsCreateStudentDialogOpen] = useState(false);
  const [selectedRecordForCreate, setSelectedRecordForCreate] = useState(null);


  const [missingPasiRecords, setMissingPasiRecords] = useState([]);
  const [isLoadingMissing, setIsLoadingMissing] = useState(false);

  const [isLoadingCourseSummaries, setIsLoadingCourseSummaries] = useState(true);
  const { hasSuperAdminAccess } = useAuth();
  const [unfilteredCombinedRecords, setUnfilteredCombinedRecords] = useState([]);
  const [filteredMissingWithEmail, setFilteredMissingWithEmail] = useState([]);
  const [isFilteringMissingWithEmail, setIsFilteringMissingWithEmail] = useState(false);

  

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

// Add this useMemo near the top where other useMemo hooks are defined
const filteredUnlinkedCount = useMemo(() => {
  if (!unlinkedPasiRecords) return 0;
  
  // Apply the same filter logic as in MissingYourWay component
  // Default to filtering out completed courses with courseId 1111 or 2000
  const filtered = unlinkedPasiRecords.filter(record => {
    // Keep the record if it's not completed
    if (record.status !== 'Completed') {
      return true;
    }

    // If it's completed, check if the courseCode maps to courseId 1111 or 2000
    const courseId = COURSE_CODE_TO_ID[record.courseCode];
    
    // Keep the record if courseId is NOT 1111 or 2000
    // (i.e., filter out completed courses with courseId 1111 or 2000)
    return courseId !== 1111 && courseId !== 2000;
  });
  
  return filtered.length;
}, [unlinkedPasiRecords]);




  useEffect(() => {
    const fetchFiltered = async () => {
      if (!unmatchedStudentSummaries) {
        setFilteredMissingWithEmail([]);
        return;
      }
      setIsFilteringMissingWithEmail(true);
      try {
        const results = await filterRelevantMissingPasiRecordsWithEmailCheck(unmatchedStudentSummaries);
        setFilteredMissingWithEmail(results);
      } catch (e) {
        console.error('Error filtering missing PASI records with email check:', e);
        setFilteredMissingWithEmail([]);
      } finally {
        setIsFilteringMissingWithEmail(false);
      }
    };
    fetchFiltered();
  }, [unmatchedStudentSummaries]);

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

  const checkStatusMismatch = (pasiRecords) => {
    console.log("Running checkStatusMismatch with", pasiRecords.length, "records");
    
    const recordsWithMismatch = pasiRecords.filter(record => {
      // Skip if either status is missing
      if (!record.status || !record.Status_Value) return false;
      
      // Skip if courseCode maps to courseId 1111 or 2000
      if (record.courseCode) {
        const courseId = COURSE_CODE_TO_ID[record.courseCode];
        if (courseId === 1111 || courseId === 2000) {
          return false;
        }
      }
      
      // Check Active status incompatibilities
      if (record.status === "Active" && 
          ValidationRules.statusCompatibility.Active.incompatibleStatuses.includes(record.Status_Value)) {
        return true;
      }
      
      // Check Completed status validations
      if (record.status === "Completed" && 
          !ValidationRules.statusCompatibility.Completed.validStatuses.includes(record.Status_Value)) {
        return true;
      }
      
      return false;
    });
    
    console.log("Found", recordsWithMismatch.length, "mismatches");
    setRecordsWithStatusMismatch(recordsWithMismatch);
    return recordsWithMismatch;
  };
  
  // Update the useEffect to use the simplified check
  useEffect(() => {
    if (pasiStudentSummariesCombined && pasiStudentSummariesCombined.length > 0) {
      checkStatusMismatch(pasiStudentSummariesCombined);
    }
  }, [pasiStudentSummariesCombined]);

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

  // Convert school year format (e.g., "23/24" to "23_24")
  const formatSchoolYear = (year) => {
    return year.replace('/', '_');
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
      statusMismatches: recordsWithStatusMismatch.length || 0,
      duplicateAsns: duplicateAsnStudents.length ? duplicateAsnStudents.length : 0
    };
  };

  const summary = getSummary();

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
    setChangePreview(null);
    setShowPreview(false);
  
    // Create context with all the dependencies needed by the utility function
    // Still pass asnEmailMap even though the utility won't use it (for backward compatibility)
    const context = {
      selectedSchoolYear,
      setIsProcessing,
      setChangePreview,
      setShowPreview,
      asnEmails: asnEmailMap,  // Keep passing this so we don't break the API
      COURSE_CODE_TO_ID,
      summaryDataMap,
      Papa
    };
  
    processCsvFile(file, context)
      .catch(error => {
        console.error('Error processing CSV:', error);
        toast.error(error.message || 'Error processing CSV file');
      })
      .finally(() => {
        event.target.value = ''; // Reset file input
      });
  };


  const handleConfirmUpload = async () => {
    if (!changePreview || !changePreview.newRecordsMap) {
      toast.error('No changes to apply');
      return;
    }
  
    // Create context with all the dependencies needed by the utility function
    const context = {
      setShowPreview,
      setIsProcessing,
      selectedSchoolYear,
      refreshStudentSummaries
    };
  
    await applyChanges(changePreview, context);
  };

  return (
    <TooltipProvider>
      <div className="space-y-2">
        {/* New Records Table Card with Tabs */}
        {pasiRecords.length > 0 && (
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>PASI Records Management</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={!selectedSchoolYear || isProcessing}
                  >
                    <Upload className="h-4 w-4" />
                    <label className="cursor-pointer">
                      Upload CSV
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={!selectedSchoolYear || isProcessing}
                      />
                    </label>
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex items-center gap-2"
                    onClick={() => setIsDeleteAllDialogOpen(true)}
                    disabled={
                      !selectedSchoolYear || pasiRecords.length === 0 || isProcessing
                    }
                  >
                    <Trash className="h-4 w-4" />
                    Delete All
                  </Button>
                </div>
              </CardHeader>

            <CardContent>
              {/* Add Tabs for Records and Validation */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4 bg-slate-800 p-1 rounded-lg">
                <TabsTrigger 
  value="records" 
  className="text-lg font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white"
>
  All Records
  {pasiRecords.length > 0 && (
    <Badge variant="default" className="ml-2 bg-slate-100 hover:bg-slate-100 text-slate-700">
      {pasiRecords.length}
    </Badge>
  )}
</TabsTrigger>

                  <TabsTrigger 
  value="statusConflicts"
  className="text-lg font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white"
>
Updates Required
  {recordsWithStatusMismatch.length > 0 && (
    <Badge variant="destructive" className="ml-2 bg-amber-100 hover:bg-amber-100 text-amber-600">
      {recordsWithStatusMismatch.length}
    </Badge>
  )}
</TabsTrigger>

                  
                  <TabsTrigger 
                    value="missingPasi"
                    className="text-lg font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    Add to PASI
                    {isFilteringMissingWithEmail
                      ? <Loader2 className="h-4 w-4 animate-spin text-primary ml-2" />
                      : filteredMissingWithEmail.length > 0 && (
                          <Badge variant="destructive" className="ml-2 bg-red-100 hover:bg-red-100 text-red-600">
                            {filteredMissingWithEmail.length}
                          </Badge>
                        )}
                  </TabsTrigger>

                  <TabsTrigger 
  value="missingYourWay"
  className="text-lg font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white"
>
  Missing YourWay
  {filteredUnlinkedCount > 0 && (
    <Badge variant="destructive" className="ml-2 bg-orange-100 hover:bg-orange-100 text-orange-600">
      {filteredUnlinkedCount}
    </Badge>
  )}
</TabsTrigger>

                </TabsList>
                
                <TabsContent value="records">
                  {/* Replace with PasiRecords component */}
                  <PasiRecords 
                    records={pasiRecords}
                    recordsWithStatusMismatch={recordsWithStatusMismatch}
                    onOpenLinkingDialog={handleOpenLinkingDialog}
                    onOpenGradebook={handleOpenGradebook}
                    onOpenDeleteDialog={handleOpenDeleteDialog}
                    onOpenCreateStudentDialog={handleOpenCreateStudentDialog}
                    onOpenEmailEditDialog={handleOpenEmailEditDialog}
                    onCopyData={handleCopyData}
                    onViewRecordDetails={handleViewRecordDetails}
                    hasStatusMismatch={hasStatusMismatch}
                    getStatusMismatchForRecord={getStatusMismatchForRecord}
                    showStatusMismatchDetails={showStatusMismatchDetails}
                    getUniqueMismatchAsnsCount={getUniqueMismatchAsnsCount}
                  />
                </TabsContent>

                <TabsContent value="statusConflicts">
  <StatusConflicts 
    recordsWithStatusMismatch={recordsWithStatusMismatch}
    onFixState={updateCourseState}
    onViewRecordDetails={handleViewRecordDetails}
  />
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
                    <MissingPasi />
                  )}
                </TabsContent>

                <TabsContent value="missingYourWay">
                  <MissingYourWay />
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
                        <Select 
                          value={selectedMismatch.summaryState || 'Not Set'} 
                          onValueChange={(value) => updateCourseState(selectedMismatch.studentKey, selectedMismatch.courseId, value)}
                        >
                          <SelectTrigger className="h-8 w-[120px]">
                            <SelectValue placeholder="Select State" />
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

      

     
      </div>

      {/* EmailEditDialog Component - implemented as a child component in the original code */}
      <EmailEditDialog 
        record={recordToEdit}
        isOpen={isEmailEditDialogOpen}
        onClose={() => setIsEmailEditDialogOpen(false)}
        onUpdate={handleUpdatePasiRecordEmail}
        isUpdating={isUpdatingEmail}
      />
      
{/* Preview Dialog */}
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
  
  export default PASIDataUpload;