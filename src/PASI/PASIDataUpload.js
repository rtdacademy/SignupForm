import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"; // Add this import
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
  AlertTriangle // Add this import
} from 'lucide-react';
import Papa from 'papaparse';
import { toast, Toaster } from 'sonner';
import { getSchoolYearOptions } from '../config/DropdownOptions';
import PASIPreviewDialog from './PASIPreviewDialog';
import { getDatabase, ref, query, orderByChild, equalTo, onValue, off, get, update } from 'firebase/database';
import { validatePasiRecordsLinkStatus } from '../utils/pasiValidation'; // Add this import
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
} from "../components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"; // Add this import
import CourseLinkingDialog from './CourseLinkingDialog';
import { processPasiRecordDeletions } from '../utils/pasiLinkUtils';
import { processPasiLinkCreation } from '../utils/pasiLinkUtils';

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
  const [activeTab, setActiveTab] = useState("records"); // Add this state

  // Validation state
  const [isValidating, setIsValidating] = useState(false); // Add this state
  const [validationResults, setValidationResults] = useState(null); // Add this state
  const [selectedRecords, setSelectedRecords] = useState(new Set()); // Add this state
  const [isFixing, setIsFixing] = useState(false); // Add this state
  const [changePreview, setChangePreview] = useState(null);

  // Step 3: Add these handler functions in the component
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
  const sortData = (data, column, direction) => {
    return [...data].sort((a, b) => {
      // Get comparable values based on column
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
      // Search in student name
      const studentName = (record.studentName || '').toLowerCase();
      
      // Search in course code and description
      const courseCode = (record.courseCode || '').toLowerCase();
      const courseDescription = (record.courseDescription || '').toLowerCase();
      
      // Search in ASN and email
      const asn = (record.asn || '').toLowerCase();
      const email = (record.email || '').toLowerCase();
      
      // Search in status and other fields
      const status = (record.status || '').toLowerCase();
      const value = (record.value || '').toLowerCase();
      
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

    setIsLoading(true);
    setError(null);

    const db = getDatabase();
    const formattedYear = formatSchoolYear(selectedSchoolYear);
    
    const pasiRef = ref(db, 'pasiRecords');
    const schoolYearQuery = query(
      pasiRef,
      orderByChild('schoolYear'),
      equalTo(formattedYear)
    );

    const unsubscribe = onValue(schoolYearQuery, (snapshot) => {
      setIsLoading(false);
      
      if (!snapshot.exists()) {
        setPasiRecords([]);
        return;
      }

      const records = [];
      snapshot.forEach((child) => {
        records.push({
          id: child.key,
          ...child.val()
        });
      });

      records.sort((a, b) => a.studentName.localeCompare(b.studentName));
      setPasiRecords(records);
    }, (error) => {
      setError(error.message);
      setIsLoading(false);
    });

    return () => {
      off(schoolYearQuery);
    };
  }, [selectedSchoolYear]);

  // Effect for handling filtered and paginated data
  useEffect(() => {
    // Apply search filter
    const filtered = searchData(pasiRecords, searchTerm);
    setFilteredRecords(filtered);
    
    // Apply sorting
    const sorted = sortData(filtered, sortState.column, sortState.direction);
    
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
  }, [pasiRecords, searchTerm, sortState, currentPage]);

  // Calculate summary statistics
  const getSummary = () => {
    if (!pasiRecords.length) return null;

    return {
      total: pasiRecords.length,
      linked: pasiRecords.filter(r => r.linked).length,
      notLinked: pasiRecords.filter(r => !r.linked).length,
      uniqueStudents: new Set(pasiRecords.map(r => r.asn)).size,
      uniqueCourses: new Set(pasiRecords.map(r => r.courseCode)).size,
      missingPasiRecords: 0 // Placeholder as syncReport is removed
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
            const isLinked = existingRecord?.linked === true ? true : false;
            
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
              linked: isLinked,
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
    
    // Set change preview state
    setChangePreview({
      recordsToAdd,
      recordsToUpdate,
      recordsToDelete,
      recordsUnchanged,
      totalChanges: recordsToAdd.length + recordsToUpdate.length + recordsToDelete.length
    });
    
    // Show the preview dialog
    setShowPreview(true);
    setIsProcessing(false);
    
    // Log summary for debugging
    console.log(`Change analysis completed: ${recordsToAdd.length} to add, ${recordsToUpdate.length} to update, ${recordsToDelete.length} to delete, ${recordsUnchanged.length} unchanged`);
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
  
  setIsProcessing(true);
  try {
    const db = getDatabase();
    const updates = {};
    
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
    
    // Process records to delete
    changePreview.recordsToDelete.forEach(record => {
      updates[`pasiRecords/${record.id}`] = null;
    });
    
    // Process records to add
    changePreview.recordsToAdd.forEach(record => {
      updates[`pasiRecords/${record.id}`] = record;
    });
    
    // Process records to update
    changePreview.recordsToUpdate.forEach(({old: existingRecord, new: newRecord}) => {
      updates[`pasiRecords/${existingRecord.id}`] = {
        ...existingRecord,
        ...getUpdatedFields(existingRecord, newRecord)
      };
    });
    
    // Update the database
    if (Object.keys(updates).length > 0) {
      await update(ref(db), updates);
    }
    
    // Process link creations if there are any
    if (linksToCreate.length > 0) {
      console.log(`Processing ${linksToCreate.length} new course links`);
      const linkResults = await processPasiLinkCreation(linksToCreate);
      
      if (linkResults.failed > 0) {
        console.warn(`Failed to create ${linkResults.failed} links`, linkResults.errors);
        toast.warning(`Failed to create ${linkResults.failed} course links.`);
      }
      
      if (linkResults.success > 0) {
        console.log(`Successfully created ${linkResults.success} links`);
        toast.success(`Created ${linkResults.success} new course links`);
      }
    }
    
    // Show success message
    if (Object.keys(updates).length > 0 || linksToCreate.length > 0) {
      toast.success(`Updated PASI records for ${selectedSchoolYear}: ${changePreview.totalChanges} changes applied`);
    } else {
      toast.info("No changes detected in PASI records");
    }
    
    setShowPreview(false);
  } catch (error) {
    console.error('Error updating records:', error);
    toast.error(error.message || 'Failed to update records');
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
      if (existingRecord[field] !== newRecord[field]) {
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
  
  // Add this function to actually perform the update when user confirms
  const performDifferentialUpdate = async () => {
    setIsProcessing(true);
    try {
      const db = getDatabase();
      const updates = {};
      
      // Process records to delete
      changePreview.recordsToDelete.forEach(record => {
        updates[`pasiRecords/${record.id}`] = null;
      });
      
      // Process records to add
      changePreview.recordsToAdd.forEach(record => {
        updates[`pasiRecords/${record.id}`] = record;
      });
      
      // Process records to update
      changePreview.recordsToUpdate.forEach(({old: existingRecord, new: newRecord}) => {
        updates[`pasiRecords/${existingRecord.id}`] = {
          ...existingRecord,
          ...getUpdatedFields(existingRecord, newRecord)
        };
      });
      
      // Only update if there are actual changes
      if (Object.keys(updates).length > 0) {
        await update(ref(db), updates);
        toast.success(`Updated PASI records for ${selectedSchoolYear}: ${changePreview.totalChanges} changes applied`);
      } else {
        toast.info("No changes detected in PASI records");
      }
      
      setShowPreview(false);
    } catch (error) {
      console.error('Error updating records:', error);
      toast.error(error.message || 'Failed to update records');
    } finally {
      setIsProcessing(false);
    }
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
            <div className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h3 className="font-medium text-foreground mb-2">Process Overview</h3>
                <p>Follow these steps to upload and manage PASI student records:</p>
                <ol className="list-decimal list-inside space-y-2 mt-2">
                  <li>Visit the <a 
                    href="https://extranet.education.alberta.ca/PASI/PASIprep/course-enrolment/list" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    PASI Prep Course Enrollment List <ExternalLink className="h-3 w-3" />
                  </a></li>
                  <li>Select the current school year in PASI Prep</li>
                  <li>Export the data as a CSV file</li>
                  <li>Upload the CSV file using the button below</li>
                  <li>Review and confirm the data in the preview window</li>
                  <li>Once uploaded, go to the Sync Report page to sync with local records</li>
                </ol>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
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
                    </div>
                  </div>
                 
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
                            label="Status" 
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
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedRecords.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                              {searchTerm ? 'No matching records found.' : 'No records available.'}
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedRecords.map((record, index) => {
                            const recordIndex = pasiRecords.findIndex(r => r.id === record.id);
                            
                            return (
                              <Tooltip key={record.id}>
                                <TooltipTrigger asChild>
                                <TableRow 
                  className={`
                    ${hoveredRow === index ? "bg-accent/20" : ""}
                    ${record.linked ? "bg-green-50 dark:bg-green-950/20" : ""}
                  `}
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                                    <TableCell className="font-medium">{record.studentName}</TableCell>
                                    <TableCell>{record.courseCode}</TableCell>
                                    <TableCell className="max-w-[200px] truncate" title={record.courseDescription}>
                                      {record.courseDescription}
                                    </TableCell>
                                    <TableCell>{record.status}</TableCell>
                                    <TableCell>{record.value !== '-' ? record.value : 'N/A'}</TableCell>
                                    <TableCell>
                                      <Badge
                                        variant={record.linked ? "success" : "secondary"}
                                        className={record.linked ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
                                      >
                                        {record.linked ? "Yes" : "No"}
                                      </Badge>
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
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Record Index: {recordIndex}</p>
                                  <p>ASN: {record.asn}</p>
                                  <p>Email: {record.email}</p>
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
                        <span className="text-sm ml-2">{selectedRecord.status}</span>
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

        <CourseLinkingDialog
          isOpen={isLinkingDialogOpen}
          onClose={handleCloseLinkingDialog}
          record={selectedRecord}
        />
      </div>
    </TooltipProvider>
  );
};

export default PASIDataUpload;