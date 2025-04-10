import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { ScrollArea, ScrollBar } from "../components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { AlertCircle, Link, Link2Off, UserCheck, UserX, HelpCircle, Search, Filter, Plus, Minus, Edit, ArrowRight, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { getDatabase, ref, get, set, update } from 'firebase/database';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { STATUS_OPTIONS, STUDENT_TYPE_OPTIONS } from '../config/DropdownOptions';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useVirtualizer } from '@tanstack/react-virtual';
import { 
  findStudentCourseSummariesByASN, 
  formatSchoolYearWithSlash, 
  parseStudentKeyFromSummaryKey, 
  checkCourseCodeMapping,
  processPasiLinkCreation,   
  processPasiRecordDeletions,
  findPasiLinkByRecordId 
} from '../utils/pasiLinkUtils';

// Helper to parse a student's full name (assumed to be "LastName, FirstName")
const parseStudentName = (fullName) => {
  if (!fullName) return { firstName: '', lastName: '' };
  const parts = fullName.split(',');
  if (parts.length < 2) return { firstName: fullName.trim(), lastName: '' };
  return { lastName: parts[0].trim(), firstName: parts[1].trim() };
};

// Status Icon Component
const StatusIcon = ({ type, status }) => {
  let icon = null;
  let tooltipText = '';
  let colorClass = '';

  if (type === 'match') {
    if (status === 'Found in Database') {
      icon = <UserCheck className="h-4 w-4" />;
      tooltipText = 'ASN Found in Database';
      colorClass = 'text-green-600';
    } else {
      icon = <UserX className="h-4 w-4" />;
      tooltipText = 'ASN Not Found';
      colorClass = 'text-red-600';
    }
  } else if (type === 'linked') {
    if (status === true) {
      icon = <Link className="h-4 w-4" />;
      tooltipText = 'Record Linked';
      colorClass = 'text-green-600';
    } else if (status === false) {
      icon = <Link2Off className="h-4 w-4" />;
      tooltipText = 'Link Broken';
      colorClass = 'text-red-600';
    } else {
      icon = <HelpCircle className="h-4 w-4" />;
      tooltipText = 'Never Linked';
      colorClass = 'text-muted-foreground';
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className={colorClass}>{icon}</div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// AddRecordRow Component – used in the Add tab
const AddRecordRow = ({ 
  record, 
  index, 
  recordMatches, 
  selectedMatches, 
  handleSelectMatch, 
  isLoadingMatches,
  baseColumns
}) => {
  const matches = recordMatches[record.id] || [];
  const selectedMatch = selectedMatches[record.id] || '';
  const hasMatches = matches.length > 0;
  
  // Check if this course code has only one possible course ID
  const courseMapping = useMemo(() => {
    if (record && record.courseCode) {
      return checkCourseCodeMapping(record.courseCode);
    }
    return null;
  }, [record]);
  
  const hasSingleCourseId = courseMapping?.courseIds?.length === 1;
  
  // Note: Automatic selection moved to parent component
  
  const selectedMatchData = matches.find(m => m.key === selectedMatch);
  const isExactMatch = selectedMatchData?.matchType === "exact";
  const isReadOnly = isExactMatch && hasSingleCourseId;
  
  return (
    <TableRow className={record.matchStatus === 'Not Found' ? 'bg-red-50' : ''}>
      {/* Link to Course Column */}
      <TableCell className="w-[250px]">
        {isLoadingMatches ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : (
          <div>
            {isReadOnly ? (
              <div className="flex items-center p-2 border rounded-md bg-green-50 border-green-200">
                <div className="flex-1 font-medium text-sm text-green-700">
                  {selectedMatchData?.displayName}
                </div>
                <Badge variant="outline" className="ml-2 bg-green-100 border-green-300 text-green-800">
                  Exact Match
                </Badge>
              </div>
            ) : (
              <Select
                value={selectedMatch}
                onValueChange={(value) => handleSelectMatch(record.id, value)}
                disabled={!hasMatches || record.linked}
              >
                <SelectTrigger 
                  className={`w-full ${!hasMatches ? 'opacity-50' : ''} ${selectedMatch && !isExactMatch ? 'border-amber-400 bg-amber-50' : ''}`}
                >
                  <SelectValue placeholder={hasMatches ? "Select course to link" : "No courses found"} />
                </SelectTrigger>
                <SelectContent>
                  {hasMatches ? (
                    matches.map((match) => (
                      <SelectItem key={match.key} value={match.key}>
                        <div className="flex items-center justify-between w-full">
                          <span>{match.displayName}</span>
                          {match.matchType === "exact" ? (
                            <Badge variant="outline" className="ml-2 bg-green-50 border-green-200 text-green-700">
                              Match
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="ml-2 bg-amber-50 border-amber-200 text-amber-700">
                              Partial
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-match" disabled>
                      No matching courses found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
            {selectedMatch && !isExactMatch && (
              <div className="mt-1 text-xs flex items-center text-amber-600">
                <AlertCircle className="h-3 w-3 mr-1" />
                Course ID may not match exactly
              </div>
            )}
          </div>
        )}
      </TableCell>
      {/* Other columns */}
      {baseColumns.map(({ key, type }) => (
        <TableCell key={key} className="whitespace-nowrap">
          {type === 'icon' ? <StatusIcon type={key} status={record[key]} /> : record[key] || '-'}
        </TableCell>
      ))}
    </TableRow>
  );
};

// UpdateRecordRow Component – used in the Update tab
const UpdateRecordRow = ({ record }) => {
  const [expanded, setExpanded] = useState(false);
  const changedFieldNames = Object.keys(record.changes);
  const { old, new: newRecord, changes } = record;
  
  return (
    <>
      <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => setExpanded(!expanded)}>
        <TableCell className="font-medium">{newRecord.studentName}</TableCell>
        <TableCell>{newRecord.asn}</TableCell>
        <TableCell>{newRecord.courseCode}</TableCell>
        <TableCell className="max-w-[200px] truncate" title={newRecord.courseDescription}>
          {newRecord.courseDescription}
        </TableCell>
        <TableCell>
          <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
            {changedFieldNames.length} change{changedFieldNames.length !== 1 ? 's' : ''}
          </Badge>
        </TableCell>
        <TableCell>
          {changedFieldNames.slice(0, 2).map(field => (
            <Badge key={field} variant="outline" className="mr-1">
              {field}
            </Badge>
          ))}
          {changedFieldNames.length > 2 && (
            <Badge variant="outline">+{changedFieldNames.length - 2} more</Badge>
          )}
        </TableCell>
        <TableCell>{newRecord.email || '-'}</TableCell>
        <TableCell>{newRecord.referenceNumber || '-'}</TableCell>
      </TableRow>
      
      {expanded && (
        <TableRow className="bg-muted/30">
          <TableCell colSpan={7} className="p-0">
            <div className="p-4">
              <h4 className="text-sm font-medium mb-2">Changes:</h4>
              <div className="space-y-2">
                {changedFieldNames.map(field => (
                  <div key={field} className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
                    <div className="text-sm bg-red-50 p-2 rounded border border-red-100">
                      {changes[field].old || <em className="text-muted-foreground">empty</em>}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm bg-green-50 p-2 rounded border border-green-100">
                      {changes[field].new || <em className="text-muted-foreground">empty</em>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

// New VirtualizedRecordList component
const VirtualizedRecordList = ({ records, renderRow, estimatedRowHeight = 60 }) => {
  const parentRef = useRef();
  
  const rowVirtualizer = useVirtualizer({
    count: records.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedRowHeight,
    overscan: 15
  });
  
  return (
    <div ref={parentRef} style={{ height: '100%', overflow: 'auto' }}>
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {rowVirtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {renderRow(records[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
    </div>
  );
};

const PASIPreviewDialog = ({ 
  isOpen, 
  onClose, 
  changePreview, 
  onConfirm, 
  isConfirming = false,
  selectedSchoolYear 
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [matchFilter, setMatchFilter] = useState('all');
  const [activeTab, setActiveTab] = useState("add");
  const [recordMatches, setRecordMatches] = useState({});
  const [selectedMatches, setSelectedMatches] = useState({});
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [matchLoadingProgress, setMatchLoadingProgress] = useState(0);
  const [creatingStudents, setCreatingStudents] = useState({});
  const [createdStudents, setCreatedStudents] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  
  // Track created students with their link information
  const [createdStudentLinks, setCreatedStudentLinks] = useState({});

  // New state for courses and selected course for unmatched records
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState({});

  // State for email input and "use ASN instead" toggle in the Actions cell
  const [emailInputs, setEmailInputs] = useState({});
  const [useAsn, setUseAsn] = useState({});

  // State for student status selection for unmatched records
  const [statusInputs, setStatusInputs] = useState({});

  // New state for student type selection for unmatched records
  const [studentTypeInputs, setStudentTypeInputs] = useState({});

  // State for comment input for unmatched records
  const [commentInputs, setCommentInputs] = useState({});

  // Refs for optimization
  const parentRef = useRef(null);
  const [tableWidth, setTableWidth] = useState(0);
  const abortControllerRef = useRef(null);

  // Monitor window size
  useEffect(() => {
    const handleResize = () => {
      if (parentRef.current) {
        setTableWidth(parentRef.current.offsetWidth);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Count for created student links
  const createdLinksCount = useMemo(() => 
    Object.keys(createdStudentLinks).length, 
    [createdStudentLinks]
  );

  // Fetch courses from /courses node (excluding 'sections')
  useEffect(() => {
    const db = getDatabase();
    const coursesRef = ref(db, 'courses');
    get(coursesRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const coursesArray = [];
          for (const key in data) {
            if (key === 'sections') continue;
            coursesArray.push({ id: key, ...data[key] });
          }
          setCourses(coursesArray);
        } else {
          console.log("No courses available");
        }
      })
      .catch((error) => {
        console.error("Error fetching courses: ", error);
      });
  }, []);

  // Handler for selecting a course for an unmatched record
  const handleCourseSelect = (recordId, courseId) => {
    setSelectedCourses(prev => ({
      ...prev,
      [recordId]: courseId
    }));
  };
  
  // Base columns for Add/Update/Delete tabs (email and grade removed)
  const baseColumns = [
    { key: 'linked', label: 'Link', type: 'icon' },
    { key: 'asn', label: 'ASN' },
    { key: 'studentName', label: 'Student Name' },
    { key: 'courseCode', label: 'Course Code' },
    { key: 'courseDescription', label: 'Description' },
    { key: 'status', label: 'Status' },
    { key: 'referenceNumber', label: 'Reference #' } 
  ];

  // For the Unmatched tab, we define custom columns: remove email and grade, add comment column
  const unmatchedColumns = [
    { key: 'comment', label: 'Comment', type: 'editable' },
    { key: 'asn', label: 'ASN' },
    { key: 'studentName', label: 'Student Name' },
    { key: 'courseCode', label: 'Course Code' },
    { key: 'courseDescription', label: 'Description' },
    { key: 'status', label: 'Status' }
  ];
  
  // Initialize the active tab based on available changePreview data
  useEffect(() => {
    if (changePreview) {
      if (changePreview.recordsToAdd.length > 0) {
        setActiveTab("add");
        loadMatchesForNewRecords();
      } else if (changePreview.recordsToUpdate.length > 0) {
        setActiveTab("update");
      } else if (changePreview.recordsToDelete.length > 0) {
        setActiveTab("delete");
      }
    }
    
    // Cleanup abort controller
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [changePreview]);

  // NEW EFFECT: Automatically select matches for all records after loading is complete
  useEffect(() => {
    if (!isLoadingMatches && changePreview?.recordsToAdd) {
      // Create a batch of selections for all records with matches
      const newSelections = {};
      
      changePreview.recordsToAdd.forEach(record => {
        const matches = recordMatches[record.id] || [];
        if (matches.length > 0 && !selectedMatches[record.id] && !record.linked) {
          newSelections[record.id] = matches[0].key;
        }
      });
      
      // Only update state if we have new selections to make
      if (Object.keys(newSelections).length > 0) {
        setSelectedMatches(prev => ({
          ...prev,
          ...newSelections
        }));
      }
    }
  }, [isLoadingMatches, recordMatches, changePreview?.recordsToAdd, selectedMatches]);

  // Optimized function to load matches for new records in batches
  const loadMatchesForNewRecords = async () => {
    if (!changePreview || !changePreview.recordsToAdd.length) return;
    
    setIsLoadingMatches(true);
    setMatchLoadingProgress(0);
    
    // Create a new abort controller
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    try {
      const matches = {};
      changePreview.recordsToAdd.forEach(record => {
        matches[record.id] = [];
      });
      
      const foundAsns = new Set();
      const uniqueAsnCourses = [];
      
      // First, collect unique ASN + courseCode combinations
      for (const record of changePreview.recordsToAdd) {
        const { asn, courseCode } = record;
        if (!asn) continue;
        
        const lookupKey = `${asn}_${courseCode}`;
        if (foundAsns.has(lookupKey)) continue;
        
        foundAsns.add(lookupKey);
        uniqueAsnCourses.push({ asn, courseCode, records: [] });
      }
      
      // Map records to their ASN + courseCode combinations
      for (const record of changePreview.recordsToAdd) {
        const lookupKey = `${record.asn}_${record.courseCode}`;
        const combination = uniqueAsnCourses.find(
          c => `${c.asn}_${c.courseCode}` === lookupKey
        );
        
        if (combination) {
          combination.records.push(record);
        }
      }
      
      // Process in smaller batches
      const BATCH_SIZE = 10;
      let processedCount = 0;
      const totalCombinations = uniqueAsnCourses.length;
      
      for (let i = 0; i < uniqueAsnCourses.length; i += BATCH_SIZE) {
        // Check if operation was aborted
        if (abortControllerRef.current?.signal.aborted) {
          console.log('Match loading aborted');
          break;
        }
        
        const batch = uniqueAsnCourses.slice(i, i + BATCH_SIZE);
        
        await Promise.all(batch.map(async ({ asn, courseCode, records }) => {
          try {
            const summaries = await findStudentCourseSummariesByASN(asn, courseCode);
            
            // Update matches for all related records
            for (const record of records) {
              matches[record.id] = summaries;
            }
          } catch (error) {
            console.error(`Error finding matches for ASN ${asn}:`, error);
          }
        }));
        
        processedCount += batch.length;
        const progress = Math.round((processedCount / totalCombinations) * 100);
        setMatchLoadingProgress(progress);
      }
      
      if (!abortControllerRef.current?.signal.aborted) {
        setRecordMatches(matches);
      }
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setIsLoadingMatches(false);
      abortControllerRef.current = null;
    }
  };



  // Create student function
  const createStudent = async (record) => {

    if (!record.referenceNumber) {
      toast.error('Cannot create student: Reference # is missing in the CSV');
      return;
    }
    // Set creatingStatus for this record
    setCreatingStudents(prev => ({ ...prev, [record.id]: true }));
    
    try {
      // Get all necessary data
      let studentKey;
      if (useAsn[record.id]) {
        studentKey = record.asn.replace(/-/g, '');
      } else {
        studentKey = sanitizeEmail(emailInputs[record.id]);
      }
      
      const { firstName, lastName } = parseStudentName(record.studentName);
      const schoolYearConverted = formatSchoolYearWithSlash(record.schoolYear);
      const status = statusInputs[record.id] || STATUS_OPTIONS[0].value;
      const studentType = studentTypeInputs[record.id] || STUDENT_TYPE_OPTIONS[0].value;
      const comment = commentInputs[record.id] || '';
      const courseId = selectedCourses[record.id];
      const course = courses.find(c => c.id === courseId);
      
      if (!course) {
        throw new Error("Selected course not found");
      }
      
      // Generate a unique ID for the note
      const noteId = `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Determine if course should be active or archived
      const activeOrArchived = (status === 'Course Completed' || status === 'Unenrolled') 
        ? 'Archived' 
        : 'Active';
      
      // Current timestamp in ISO format
      const timestamp = new Date().toISOString();
      
      // Create the student record with all specified properties
      const db = getDatabase();
      
      // Create updates object for all paths
      const updates = {};
      
      // Student profile
      updates[`students/${studentKey}/profile/asn`] = record.asn;
      updates[`students/${studentKey}/profile/firstName`] = firstName;
      updates[`students/${studentKey}/profile/lastName`] = lastName;
      
      // Add student email if using email mode (not ASN mode)
      if (!useAsn[record.id] && emailInputs[record.id]) {
        updates[`students/${studentKey}/profile/StudentEmail`] = emailInputs[record.id];
      }
      
      // Course information
      updates[`students/${studentKey}/courses/${courseId}/Course/Value`] = course.Title;
      updates[`students/${studentKey}/courses/${courseId}/CourseID`] = parseInt(courseId, 10); // Store as number
      updates[`students/${studentKey}/courses/${courseId}/Created`] = timestamp;
      updates[`students/${studentKey}/courses/${courseId}/PASI/Value`] = "Yes";
      updates[`students/${studentKey}/courses/${courseId}/School_x0020_Year/Value`] = schoolYearConverted;
      updates[`students/${studentKey}/courses/${courseId}/Status/Value`] = status;
      updates[`students/${studentKey}/courses/${courseId}/StudentType/Value`] = studentType;
      updates[`students/${studentKey}/courses/${courseId}/ActiveFutureArchived/Value`] = activeOrArchived;
      updates[`students/${studentKey}/courses/${courseId}/categories/kyle@rtdacademy,com/1740839540398`] = true;
      updates[`students/${studentKey}/courses/${courseId}/referenceNumber`] = record.referenceNumber;
      
      // Student note
      const authorName = user?.displayName || 'System';
      updates[`students/${studentKey}/courses/${courseId}/jsonStudentNotes/0`] = {
        author: authorName,
        content: comment || "Student Created from the PASI upload screen",
        id: noteId,
        noteType: "🛠️",
        timestamp: timestamp
      };
      
      // Execute all updates at once
      await update(ref(db), updates);

      // Create studentCourseSummaries entry for linking
      const summaryKey = `${studentKey}_${courseId}`;
      const courseSummaryData = {
        CourseID: parseInt(courseId, 10),
        Course: course.Title,
        firstName: firstName,
        lastName: lastName,
        schoolYear: schoolYearConverted,
        status: status,
        studentKey: studentKey,
        timestamp: Date.now()
      };
      
      // Add to studentCourseSummaries
      await set(ref(db, `studentCourseSummaries/${summaryKey}`), courseSummaryData);
      
      // Store link info for later use when applying changes
      const linkInfo = {
        pasiRecordId: record.id,
        studentCourseSummaryKey: summaryKey,
        studentKey: studentKey,
        schoolYear: schoolYearConverted,
        courseCode: record.courseCode,
        courseDescription: record.courseDescription,
        creditsAttempted: record.creditsAttempted || '',
        period: record.period || '',
        studentName: `${firstName} ${lastName}`,
        referenceNumber: record.referenceNumber // Add this line
      };
      
      setCreatedStudentLinks(prev => ({
        ...prev,
        [record.id]: linkInfo
      }));
      
      // Show success message
      toast.success(`Student ${firstName} ${lastName} created successfully!`);
      
      // Mark record as processed in the UI
      setCreatingStudents(prev => ({ ...prev, [record.id]: false }));
      setCreatedStudents(prev => ({ ...prev, [record.id]: true }));
      
    } catch (error) {
      console.error("Error creating student:", error);
      toast.error(`Failed to create student: ${error.message}`);
      setCreatingStudents(prev => ({ ...prev, [record.id]: false }));
    }
  };

  // Handle selection of a match for a record
  const handleSelectMatch = (recordId, matchKey) => {
    setSelectedMatches(prev => ({
      ...prev,
      [recordId]: matchKey
    }));
  };

  // Get links data for confirmation (combining matches from Add tab and created students)
  const getSelectedLinksData = () => {
    if (!changePreview) return [];
    
    const linksToCreate = [];
    
    // Add links from the Add tab (normal matches)
    Object.entries(selectedMatches).forEach(([recordId, summaryKey]) => {
      if (!summaryKey) return;
      const record = changePreview.recordsToAdd.find(r => r.id === recordId);
      const matchData = recordMatches[recordId]?.find(m => m.key === summaryKey);
      if (!record || !matchData) return;
      const studentKey = parseStudentKeyFromSummaryKey(summaryKey);
      const schoolYearWithSlash = formatSchoolYearWithSlash(record.schoolYear);
      linksToCreate.push({
        pasiRecordId: record.id,
        studentCourseSummaryKey: summaryKey,
        studentKey,
        schoolYear: schoolYearWithSlash,
        courseCode: record.courseCode,
        courseDescription: record.courseDescription,
        creditsAttempted: record.creditsAttempted,
        period: record.period,
        studentName: record.studentName
      });
    });
    
    // Add links for newly created students
    Object.values(createdStudentLinks).forEach(linkInfo => {
      linksToCreate.push(linkInfo);
    });
    
    return linksToCreate;
  };


// Optimized handleConfirmUpload function that works with batches
const handleConfirmUpload = async (additionalData = {}) => {
  if (!changePreview) {
    toast.error('No changes to apply');
    return;
  }
  const linkedRecordSummaryKeys = new Map(); 
  const { linksToCreate = [] } = additionalData;
  
  // Close the dialog immediately
  setShowPreview(false);
  onClose();
  
  // Show a toast to indicate background processing
  const progressToast = toast.loading("Processing changes in the background...", {
    duration: Infinity, // Keep the toast visible until we dismiss it
    id: "pasi-upload-progress"
  });
  
  // Continue with the processing
  setIsProcessing(true);
  try {
    const db = getDatabase();
    
    // First, process link deletions for records being removed in batches
    if (changePreview.recordsToDelete.length > 0) {
      console.log(`Processing ${changePreview.recordsToDelete.length} record deletions with potential links`);
      toast.loading(`Removing links for ${changePreview.recordsToDelete.filter(r => r.linked).length} records...`, {
        id: progressToast
      });
      
      // Process in batches of 100
      const BATCH_SIZE = 100;
      const linkedRecordsToDelete = changePreview.recordsToDelete.filter(r => r.linked);
      
      for (let i = 0; i < linkedRecordsToDelete.length; i += BATCH_SIZE) {
        const batch = linkedRecordsToDelete.slice(i, i + BATCH_SIZE);
        const currentBatchNumber = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(linkedRecordsToDelete.length / BATCH_SIZE);
        
        toast.loading(`Removing links: batch ${currentBatchNumber}/${totalBatches}...`, {
          id: progressToast
        });
        
        const deletionResults = await processPasiRecordDeletions(batch);
        
        if (deletionResults.failed > 0) {
          console.warn(`Failed to remove links for ${deletionResults.failed} records in batch ${currentBatchNumber}`, deletionResults.errors);
        }
        
        if (deletionResults.success > 0) {
          console.log(`Successfully removed links for ${deletionResults.success} records in batch ${currentBatchNumber}`);
          toast.loading(`Removed ${deletionResults.success} links (batch ${currentBatchNumber}/${totalBatches})`, {
            id: progressToast
          });
        }
      }
    }
    
    // PROCESS LINK CREATIONS FIRST - track which records should be marked as linked
    const linkedRecordIds = new Set();
    
    // First, collect existing linked records
    for (const record of changePreview.recordsToAdd) {
      if (record && record.id && record.linked === true) {
        linkedRecordIds.add(record.id);
      }
    }
    for (const { old: existingRecord } of changePreview.recordsToUpdate) {
      if (existingRecord && existingRecord.id && existingRecord.linked === true) {
        linkedRecordIds.add(existingRecord.id);
      }
    }
    
    // Process link creations with progress updates if there are any
    if (linksToCreate.length > 0) {
      console.log(`Processing ${linksToCreate.length} new course links`);
      toast.loading(`Creating ${linksToCreate.length} new course links...`, {
        id: progressToast
      });
      
      // Define callback for progress updates that will update the toast
      const updateLinkProgress = (percent, info) => {
        const { phase, batch, totalBatches, batchSize, success, failed } = info;
        
        if (phase === 'prefetch') {
          toast.loading(`Pre-fetching PASI records: ${Math.round(percent)}%`, {
            id: progressToast
          });
        } else if (phase === 'linking') {
          toast.loading(`Creating links: batch ${batch}/${totalBatches} (${success || 0} successful)`, {
            id: progressToast
          });
        }
      };
      
      // Use our optimized function with the progress callback
      const linkResults = await processPasiLinkCreation(linksToCreate, updateLinkProgress);
      
      // Track successfully linked record IDs
      if (linkResults.createdLinks && linkResults.createdLinks.length > 0) {
        // Fetch the link details to get the summaryKeys
        const linkDetails = await Promise.all(
          linkResults.createdLinks.map(async link => {
            const linkData = await findPasiLinkByRecordId(link.pasiRecordId);
            return { 
              pasiRecordId: link.pasiRecordId, 
              summaryKey: linkData?.data?.studentCourseSummaryKey 
            };
          })
        );
        
        linkDetails.forEach(link => {
          if (link.pasiRecordId) {
            linkedRecordIds.add(link.pasiRecordId);
            if (link.summaryKey) {
              linkedRecordSummaryKeys.set(link.pasiRecordId, link.summaryKey);
            }
            console.log(`Marking record ${link.pasiRecordId} as linked with summaryKey ${link.summaryKey || 'unknown'}`);
          }
        });
      }
      
      console.log(`Total records marked as linked: ${linkedRecordIds.size}`);
      
      if (linkResults.failed > 0) {
        toast.warning(`Failed to create ${linkResults.failed} course links.`);
      }
      
      if (linkResults.success > 0) {
        toast.loading(`Created ${linkResults.success} new course links`, {
          id: progressToast
        });
      }
    }
    
    // Process PASI records with proper link status
    toast.loading(`Updating PASI records...`, {
      id: progressToast
    });
    
    // Process records in larger batches
    const BATCH_SIZE = 500;
    let currentBatch = {};
    let batchCount = 0;
    let totalOperations = 0;
    
    // Enhanced helper to flush the current batch with validation
    const flushBatch = async () => {
      if (Object.keys(currentBatch).length === 0) return;
      
      try {
        // Validate batch - look for any undefined values that would cause errors
        let validOperations = 0;
        
        for (const path in currentBatch) {
          if (currentBatch[path] === undefined) {
            console.error(`Found undefined value at path: ${path}`);
            // Replace undefined with null or remove the property
            delete currentBatch[path];
            continue;
          }
          
          if (currentBatch[path] !== null && typeof currentBatch[path] === 'object') {
            // Check for undefined values in nested objects
            for (const key in currentBatch[path]) {
              if (currentBatch[path][key] === undefined) {
                console.error(`Found undefined value at ${path}.${key}`);
                // Replace with null to avoid Firebase errors
                currentBatch[path][key] = null;
              }
            }
          }
          
          validOperations++;
        }
        
        const batchNumber = batchCount + 1;
        toast.loading(`Updating PASI records: batch ${batchNumber} (${validOperations} operations)`, {
          id: progressToast
        });
        
        await update(ref(db), currentBatch);
        batchCount++;
        totalOperations += validOperations;
        
        console.log(`Processed batch ${batchCount} with ${validOperations} operations`);
        
      } catch (error) {
        console.error('Error processing batch:', error);
        // Log the problematic batch data for debugging
        console.error('Batch data with error:', JSON.stringify(currentBatch, null, 2));
        throw error; // Re-throw to be caught by the main try/catch
      } finally {
        currentBatch = {};
      }
    };
    
    // Process records to delete
    for (const record of changePreview.recordsToDelete) {
      if (!record || !record.id) {
        console.warn("Skipping invalid record deletion:", record);
        continue;
      }
      
      currentBatch[`pasiRecords/${record.id}`] = null;
      
      // Flush when batch is full
      if (Object.keys(currentBatch).length >= BATCH_SIZE) {
        await flushBatch();
      }
    }
    
    // Process records to add
    for (const record of changePreview.recordsToAdd) {
      // Safety check - ensure we have a valid record object
      if (!record || !record.id) {
        console.warn("Skipping invalid record:", record);
        continue;
      }
      
      // Use our tracked linked status - IMPORTANT: default to false if undefined
      const isLinked = linkedRecordIds.has(record.id) ? true : false;
      
      // For debugging purposes
      if (isLinked) {
        console.log(`Setting add record ${record.id} linked status to ${isLinked}`);
      }
      
      // Create a shallow copy with linked explicitly set to boolean
      const recordWithLinked = {
        ...record,
        linked: isLinked,
        linkedAt: isLinked ? new Date().toISOString() : null,
        summaryKey: linkedRecordSummaryKeys.get(record.id) || record.summaryKey || null,
        referenceNumber: record.referenceNumber
      };
      
      currentBatch[`pasiRecords/${record.id}`] = recordWithLinked;
      
      // Flush when batch is full
      if (Object.keys(currentBatch).length >= BATCH_SIZE) {
        await flushBatch();
      }
    }
    
    // Process records to update
  // Process records to update
for (const { old: existingRecord, new: newRecord } of changePreview.recordsToUpdate) {
  // Safety check - ensure we have a valid record object
  if (!existingRecord || !existingRecord.id) {
    console.warn("Skipping invalid record update:", existingRecord);
    continue;
  }
  
  const updatedFields = getUpdatedFields(existingRecord, newRecord);
  
  // Use our tracked linked status - IMPORTANT: default to false if undefined
  const isLinked = linkedRecordIds.has(existingRecord.id) ? true : false;
  
  if (existingRecord.linked !== isLinked) {
    console.log(`Setting update record ${existingRecord.id} linked status to ${isLinked}`);
  }
  
  currentBatch[`pasiRecords/${existingRecord.id}`] = {
    ...existingRecord,
    ...updatedFields,
    linked: isLinked,
    linkedAt: isLinked ? (existingRecord.linkedAt || new Date().toISOString()) : null,
    summaryKey: linkedRecordSummaryKeys.get(existingRecord.id) || existingRecord.summaryKey,
    
    // Always use existing reference number, never update it
    referenceNumber: existingRecord.referenceNumber
  };
  
  // Flush when batch is full
  if (Object.keys(currentBatch).length >= BATCH_SIZE) {
    await flushBatch();
  }
}
    
    // Flush any remaining updates
    await flushBatch();
    
    // Show success message
    const totalChanges = changePreview.totalChanges;
    
    // Dismiss the progress toast
    toast.dismiss(progressToast);
    
    if (batchCount > 0 || linksToCreate.length > 0) {
      toast.success(`Updated PASI records for ${selectedSchoolYear}: ${totalChanges} changes applied (${totalOperations} database operations)`);
    } else {
      toast.info("No changes detected in PASI records");
    }
    
    // Call the onConfirm callback - pass a flag indicating success
    onConfirm({ success: true });
    
  } catch (error) {
    console.error('Error updating records:', error);
    toast.error(error.message || 'Failed to update records');
    
    // Dismiss the progress toast
    toast.dismiss("pasi-upload-progress");
    
    // Call the onConfirm callback - pass the error
    onConfirm({ success: false, error: error.message || 'Failed to update records' });
  } finally {
    setIsProcessing(false);
  }
};

const getUpdatedFields = (existingRecord, newRecord) => {
  const fieldsToCompare = [
    'asn', 'studentName', 'courseCode', 'courseDescription', 
    'status', 'period', 'value', 'approved', 'assignmentDate', 
    'creditsAttempted', 'deleted', 'dualEnrolment', 'exitDate', 
    'fundingRequested', 'term', 'email'
    // Removed 'referenceNumber' from this list
  ];
  
  const updatedFields = {};
  
  // Only add defined values that have changed
  fieldsToCompare.forEach(field => {
    // Original behavior for all fields
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
  // Derived states for filtering and categorizing records
  const filteredAddRecords = useMemo(() => {
    if (!changePreview) return [];
    let filtered = [...changePreview.recordsToAdd];
    if (matchFilter !== 'all') {
      filtered = filtered.filter(record => record.matchStatus === matchFilter);
    }
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(record =>
        record.asn?.toLowerCase().includes(searchLower) ||
        record.studentName?.toLowerCase().includes(searchLower)
      );
    }
    return filtered;
  }, [changePreview, searchTerm, matchFilter]);

// Modify the filteredUpdateRecords useMemo to filter out records with no changes
const filteredUpdateRecords = useMemo(() => {
  if (!changePreview) return [];
  
  // First filter out records with empty changes
  let filtered = changePreview.recordsToUpdate.filter(record => {
    // Only include records that have at least one change
    return Object.keys(record.changes || {}).length > 0;
  });
  
  // Then apply the search term filter
  if (searchTerm.trim()) {
    const searchLower = searchTerm.toLowerCase();
    filtered = filtered.filter(record =>
      record.new.asn?.toLowerCase().includes(searchLower) ||
      record.new.studentName?.toLowerCase().includes(searchLower)
    );
  }
  return filtered;
}, [changePreview, searchTerm]);

  const filteredDeleteRecords = useMemo(() => {
    if (!changePreview) return [];
    let filtered = [...changePreview.recordsToDelete];
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(record =>
        record.asn?.toLowerCase().includes(searchLower) ||
        record.studentName?.toLowerCase().includes(searchLower)
      );
    }
    return filtered;
  }, [changePreview, searchTerm]);

  const categorizedAddRecords = useMemo(() => {
    if (!changePreview) return { matched: [], unmatched: [] };
    const records = changePreview.recordsToAdd || [];
    const categorized = { matched: [], unmatched: [] };
    records.forEach(record => {
      const matches = recordMatches[record.id] || [];
      if (matches.length > 0) {
        categorized.matched.push(record);
      } else {
        categorized.unmatched.push(record);
      }
    });
    return categorized;
  }, [changePreview, recordMatches]);

  const filteredCategorizedAddRecords = useMemo(() => {
    if (!filteredAddRecords) return { matched: [], unmatched: [] };
    const categorized = { matched: [], unmatched: [] };
    filteredAddRecords.forEach(record => {
      const matches = recordMatches[record.id] || [];
      if (matches.length > 0) {
        categorized.matched.push(record);
      } else {
        categorized.unmatched.push(record);
      }
    });
    return categorized;
  }, [filteredAddRecords, recordMatches]);

  const linksToCreate = useMemo(() => getSelectedLinksData(), [selectedMatches, changePreview, recordMatches, createdStudentLinks]);

  const FilterBar = () => (
    <div className="flex gap-4 items-center mb-2">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by ASN or student name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      {activeTab === "add" && (
        <div className="flex gap-2 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={matchFilter} onValueChange={setMatchFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by match status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Match Status</SelectItem>
              <SelectItem value="Found in Database">Found in Database</SelectItem>
              <SelectItem value="Not Found">Not Found</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );

  // Cancel matches loading function
  const cancelMatchesLoading = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoadingMatches(false);
      toast.info("Match loading cancelled");
    }
  };

  if (!changePreview) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Processing records...</DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex items-center justify-center">
            <p>Analyzing changes to PASI records...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="pb-0">
          <DialogTitle>PASI Records Changes for {selectedSchoolYear}</DialogTitle>
        </DialogHeader>
        
        <div className="flex items-center justify-between space-x-2 py-2">
          <div className="flex flex-col text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-medium">
                {changePreview.recordsToAdd.length + 
                 changePreview.recordsToUpdate.length + 
                 changePreview.recordsToDelete.length + 
                 changePreview.recordsUnchanged.length}
              </span>
              
              <span className="text-muted-foreground ml-2">Unchanged:</span> 
              <span className="font-medium">{changePreview.recordsUnchanged.length}</span>
              
              <span className="text-muted-foreground ml-2">Changes:</span>
              <span className="font-medium text-amber-600">{changePreview.totalChanges}</span>
              
              <span className="text-muted-foreground ml-2">Unmatched:</span>
              <span className="font-medium text-red-600">
                {categorizedAddRecords.unmatched.length}
              </span>
            </div>
          </div>
          
          <FilterBar />
        </div>
        
        {isLoadingMatches && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Loading student matches...</span>
              <Button variant="outline" size="sm" onClick={cancelMatchesLoading}>Cancel</Button>
            </div>
            <Progress value={matchLoadingProgress} className="w-full" />
            <p className="text-xs text-muted-foreground mt-1">
              This might take a few moments for large datasets
            </p>
          </div>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="add" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Adding</span>
              <Badge variant="secondary" className="text-white bg-gray-500">
                {changePreview.recordsToAdd.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unmatched" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>Unmatched</span>
              <Badge variant="secondary" className="text-white bg-red-500">
                {categorizedAddRecords.unmatched.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="update" className="flex items-center gap-2">
  <Edit className="h-4 w-4" />
  <span>Updating</span>
  <Badge variant="secondary" className="text-white bg-gray-500">
    {changePreview.recordsToUpdate.filter(record => 
      Object.keys(record.changes || {}).length > 0
    ).length}
  </Badge>
</TabsTrigger>
            <TabsTrigger value="delete" className="flex items-center gap-2">
              <Minus className="h-4 w-4" />
              <span>Deleting</span>
              <Badge variant="secondary" className="text-white bg-gray-500">
                {changePreview.recordsToDelete.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-hidden pt-2">
            {/* Add Tab with Virtualization */}
            <TabsContent value="add" className="h-full m-0 overflow-hidden flex flex-col">
              {activeTab === "add" && categorizedAddRecords.matched.length > 0 && (
                <Alert className="mb-2 py-2">
                  <AlertTitle className="text-sm">Course Linking</AlertTitle>
                  <AlertDescription className="text-xs">
                    <p>
                      <span className="font-medium">{linksToCreate.length - createdLinksCount}</span> of <span className="font-medium">{categorizedAddRecords.matched.length}</span> records selected for linking
                    </p>
                  </AlertDescription>
                </Alert>
              )}
              <div className="flex-1 overflow-hidden" ref={parentRef}>
                <div className="h-[calc(70vh-150px)] border rounded-md relative overflow-hidden">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Link to Course</TableHead>
                        {baseColumns.map(({ label }) => (
                          <TableHead key={label} className="whitespace-nowrap">{label}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                  </Table>
                  
                  {filteredCategorizedAddRecords.matched.length === 0 ? (
                    <div className="text-center py-8">
                      {searchTerm ? 'No matching records found' : 'No records to add with matching students'}
                    </div>
                  ) : (
                    <div style={{ height: 'calc(70vh - 190px)', overflow: 'auto' }}>
                      <VirtualizedRecordList 
                        records={filteredCategorizedAddRecords.matched}
                        renderRow={(record, index) => (
                          <AddRecordRow 
                            key={record.id}
                            record={record} 
                            index={index}
                            recordMatches={recordMatches}
                            selectedMatches={selectedMatches}
                            handleSelectMatch={handleSelectMatch}
                            isLoadingMatches={isLoadingMatches}
                            baseColumns={baseColumns}
                          />
                        )}
                        estimatedRowHeight={90}
                      />
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            {/* Unmatched Students Tab with Virtualization */}
            <TabsContent value="unmatched" className="h-full m-0 overflow-hidden flex flex-col">
              <Alert className="mb-2 py-2" variant="destructive">
                <AlertTitle className="text-sm">Unmatched Students</AlertTitle>
                <AlertDescription className="text-xs">
                  <p>These records don't have matching students in YourWay. You can create these students directly from this interface.</p>
                </AlertDescription>
              </Alert>
              <div className="flex-1 overflow-hidden">
                <div className="h-[calc(70vh-150px)] border rounded-md relative overflow-hidden">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Course & Type</TableHead>
                        <TableHead className="whitespace-nowrap">Student & Email</TableHead>
                        {unmatchedColumns.map(({ label }) => (
                          <TableHead key={label} className="whitespace-nowrap">{label}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                  </Table>
                  
                  {filteredCategorizedAddRecords.unmatched.length === 0 ? (
                    <div className="text-center py-8">
                      {searchTerm ? 'No matching records found' : 'All students have matches in the system!'}
                    </div>
                  ) : (
                    <div style={{ height: 'calc(70vh - 190px)', overflow: 'auto' }}>
                      <VirtualizedRecordList 
                        records={filteredCategorizedAddRecords.unmatched}
                        renderRow={(record, index) => (
                          <TableRow key={record.id} className={`${createdStudents[record.id] ? 'bg-green-50' : 'bg-red-50'}`}>
                            {/* First Action Column - Course & Type */}
                            <TableCell className="space-y-2 py-4">
                              <div className="flex flex-col gap-2">
                                {/* Course Selection */}
                                <Select
                                  value={selectedCourses[record.id] || ''}
                                  onValueChange={(value) => handleCourseSelect(record.id, value)}
                                  disabled={createdStudents[record.id] || creatingStudents[record.id]}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Course" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {courses.length > 0 ? (
                                      courses.map(course => (
                                        <SelectItem key={course.id} value={course.id}>
                                          {course.Title}
                                        </SelectItem>
                                      ))
                                    ) : (
                                      <SelectItem value="" disabled>No courses available</SelectItem>
                                    )}
                                  </SelectContent>
                                </Select>
                                
                                {/* Student Type Selection */}
                                <Select
                                  value={studentTypeInputs[record.id] || ''}
                                  onValueChange={(value) =>
                                    setStudentTypeInputs(prev => ({ ...prev, [record.id]: value }))
                                  }
                                  disabled={createdStudents[record.id] || creatingStudents[record.id]}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Student Type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {STUDENT_TYPE_OPTIONS.map(option => (
                                      <SelectItem key={option.value} value={option.value}>
                                        <div className="flex items-center">
                                          <span style={{ color: option.color }} className="mr-2">
                                            {option.value}
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                
                                {/* Status Selection */}
                                <Select
                                  value={statusInputs[record.id] || STATUS_OPTIONS[0].value}
                                  onValueChange={(value) =>
                                    setStatusInputs(prev => ({ ...prev, [record.id]: value }))
                                  }
                                  disabled={createdStudents[record.id] || creatingStudents[record.id]}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {STATUS_OPTIONS.map(opt => (
                                      <SelectItem key={opt.value} value={opt.value}>
                                        {opt.value}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </TableCell>
                            
                            {/* Second Action Column - Email & Create Button */}
                            <TableCell className="space-y-2 py-4">
                              <div className="flex flex-col gap-2">
                                {/* Email Input and Use ASN Toggle */}
                                <div>
                                  <Input 
                                    value={emailInputs[record.id] || ''} 
                                    onChange={(e) =>
                                      setEmailInputs(prev => ({ ...prev, [record.id]: e.target.value }))
                                    } 
                                    placeholder="Enter email address" 
                                    disabled={useAsn[record.id] || createdStudents[record.id] || creatingStudents[record.id]}
                                    className="mb-1"
                                  />
                                  <label className="flex items-center space-x-2">
                                    <input 
                                      type="checkbox" 
                                      checked={useAsn[record.id] || false} 
                                      onChange={(e) =>
                                        setUseAsn(prev => ({ ...prev, [record.id]: e.target.checked }))
                                      }
                                      disabled={createdStudents[record.id] || creatingStudents[record.id]}
                                    />
                                    <span className="text-xs">Use ASN instead</span>
                                  </label>
                                </div>
                              
                                {/* Create Student Button */}
                                <Button 
  size="sm" 
  variant={createdStudents[record.id] ? "success" : "outline"} 
  className={`mt-1 text-xs ${createdStudents[record.id] ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}`}
  onClick={() => createStudent(record)}
  disabled={
    !selectedCourses[record.id] ||
    (!useAsn[record.id] && !emailInputs[record.id]) ||
    !studentTypeInputs[record.id] ||
    !record.referenceNumber || // Add this condition
    createdStudents[record.id] ||
    creatingStudents[record.id]
  }
  title={!record.referenceNumber ? "Reference # is required to create student" : ""}
>
  {creatingStudents[record.id] ? (
    <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Creating...</>
  ) : createdStudents[record.id] ? (
    "✓ Student Created"
  ) : (
    "Create Student"
  )}
</Button>

{/* Add warning message if Reference # is missing */}
{!record.referenceNumber && (
  <div className="text-xs text-red-500 mt-1 flex items-center">
    <AlertCircle className="h-3 w-3 mr-1" />
    Reference # required to create student
  </div>
)}
                              </div>
                            </TableCell>
                            
                            {/* Other columns */}
                            {unmatchedColumns.map(col => {
                              if (col.key === 'comment') {
                                return (
                                  <TableCell key={col.key}>
                                    <textarea
                                      value={commentInputs[record.id] || ''}
                                      onChange={(e) => setCommentInputs(prev => ({ ...prev, [record.id]: e.target.value }))}
                                      placeholder="Enter comment"
                                      className="w-full p-2 border rounded-md"
                                      rows={3}
                                      disabled={createdStudents[record.id] || creatingStudents[record.id]}
                                    />
                                  </TableCell>
                                );
                              } else {
                                return (
                                  <TableCell key={col.key} className="whitespace-nowrap">
                                    {record[col.key] || '-'}
                                  </TableCell>
                                );
                              }
                            })}
                          </TableRow>
                        )}
                        estimatedRowHeight={200}
                      />
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            {/* Update Tab with Virtualization */}
            <TabsContent value="update" className="h-full m-0 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-hidden">
                <div className="h-[calc(70vh-150px)] border rounded-md relative overflow-hidden">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>ASN</TableHead>
                        <TableHead>Course Code</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Changes</TableHead>
                        <TableHead>Fields</TableHead>
                        <TableHead>Email</TableHead>
                      </TableRow>
                    </TableHeader>
                  </Table>
                  
                  {filteredUpdateRecords.length === 0 ? (
  <div className="text-center py-8">
    {searchTerm ? 'No matching records found' : 'No records to update'}
  </div>
) : (
  <div style={{ height: 'calc(70vh - 190px)', overflow: 'auto' }}>
    {/* We don't use VirtualizedRecordList here because UpdateRecordRow has expandable content */}
    <Table>
      <TableBody>
        {filteredUpdateRecords.map((record, index) => (
          <UpdateRecordRow key={index} record={record} />
        ))}
      </TableBody>
    </Table>
  </div>
)}
                </div>
              </div>
            </TabsContent>
            
            {/* Delete Tab with Virtualization */}
            <TabsContent value="delete" className="h-full m-0 overflow-hidden flex flex-col">
              <Alert className="mb-2 py-2" variant="destructive">
                <AlertTitle className="text-sm">Warning: Link Removal</AlertTitle>
                <AlertDescription className="text-xs">
                  <p>When these records are deleted, any associated links to student courses will also be removed.</p>
                </AlertDescription>
              </Alert>
              <div className="flex-1 overflow-hidden">
                <div className="h-[calc(70vh-150px)] border rounded-md relative overflow-hidden">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Actions</TableHead>
                        {baseColumns.map(({ label }) => (
                          <TableHead key={label} className="whitespace-nowrap">{label}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                  </Table>
                  
                  {filteredDeleteRecords.length === 0 ? (
                    <div className="text-center py-8">
                      {searchTerm ? 'No matching records found' : 'No records to delete'}
                    </div>
                  ) : (
                    <div style={{ height: 'calc(70vh - 190px)', overflow: 'auto' }}>
                      <VirtualizedRecordList 
                        records={filteredDeleteRecords}
                        renderRow={(record, index) => (
                          <TableRow key={record.id}>
                            <TableCell>
                              <Badge variant="destructive">Will Remove</Badge>
                            </TableCell>
                            {baseColumns.map(({ key, type }) => (
                              <TableCell key={key} className="whitespace-nowrap">
                                {type === 'icon' ? <StatusIcon type={key} status={record[key]} /> : record[key] || '-'}
                              </TableCell>
                            ))}
                          </TableRow>
                        )}
                        estimatedRowHeight={60}
                      />
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
        
        <div className="flex justify-between mt-2">
          <div className="flex gap-2">
            {(changePreview.recordsToAdd.filter(r => r.matchStatus === 'Not Found').length > 0 || linksToCreate.length > 0) && (
              <Alert variant={changePreview.recordsToAdd.filter(r => r.matchStatus === 'Not Found').length > 0 ? "destructive" : "info"} 
                     className={`py-1 px-3 ${changePreview.recordsToAdd.filter(r => r.matchStatus === 'Not Found').length > 0 ? "" : "border-blue-200 bg-blue-50"}`}>
                <div className="flex items-center">
                  {changePreview.recordsToAdd.filter(r => r.matchStatus === 'Not Found').length > 0 ? (
                    <>
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <span className="text-xs">
                        {changePreview.recordsToAdd.filter(r => r.matchStatus === 'Not Found').length} unmatched ASNs
                      </span>
                    </>
                  ) : (
                    <>
                      <Link className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="text-xs">
                        <span className="font-medium">{linksToCreate.length}</span> new course links
                        {createdLinksCount > 0 && (
                          <> (includes {createdLinksCount} newly created students)</>
                        )}
                      </span>
                    </>
                  )}
                </div>
              </Alert>
            )}
          </div>
          
          <DialogFooter className="p-0 m-0">
            <Button variant="outline" onClick={onClose} size="sm">Cancel</Button>
            <Button 
              onClick={() => handleConfirmUpload({ linksToCreate })} 
              disabled={isConfirming || changePreview.totalChanges === 0}
              size="sm"
            >
              {isConfirming ? 'Applying Changes...' : `Apply ${changePreview.totalChanges} Changes`}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PASIPreviewDialog;