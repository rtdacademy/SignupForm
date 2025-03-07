import React, { useState, useMemo, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../components/ui/pagination";
import { Search, X, FileUp, ExternalLink, Copy, Eye, AlertTriangle, Files, Archive } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { ScrollArea } from "../components/ui/scroll-area";
import { getDatabase, ref, get, update } from 'firebase/database';
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { ACTIVE_FUTURE_ARCHIVED_OPTIONS } from "../config/DropdownOptions";

const ITEMS_PER_PAGE = 100;

// ASN validation regex
const ASN_REGEX = /^\d{4}-\d{4}-\d{1}$/;

const MissingPasiRecordsTab = ({ missingRecords, onGeneratePasiFile, isProcessing, onRecordUpdated }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortState, setSortState] = useState({ column: 'studentName', direction: 'asc' });
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [fullStudentData, setFullStudentData] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [showOnlyIssues, setShowOnlyIssues] = useState(false);
  const [showOnlyArchivedUnenrolled, setShowOnlyArchivedUnenrolled] = useState(false);
  const [updatingStates, setUpdatingStates] = useState({});
  const [modifiedStates, setModifiedStates] = useState({});
  
// 1. Update the isArchivedUnenrolled helper function
const isArchivedUnenrolled = (record) => {
  // Check if state is "Archived"
  const isArchived = record.ActiveFutureArchived_Value === "Archived";
  
  // Check if status is any of the "unenrolled-like" statuses
  const isUnenrolledLikeStatus = 
    record.status === "Unenrolled" || 
    record.status === "✅ Mark Added to PASI" || 
    record.status === "☑️ Removed From PASI (Funded)";
    
  // Return true if both conditions are met
  return isArchived && isUnenrolledLikeStatus;
};

  // Function to parse student key from summary key
  const parseStudentKeyFromSummary = (summaryKey) => {
    if (!summaryKey) return null;
    
    // Remove the prefix
    const withoutPrefix = summaryKey.replace('/studentCourseSummaries/', '');
    
    // Find the last underscore which separates studentKey from courseId
    const lastUnderscoreIndex = withoutPrefix.lastIndexOf('_');
    if (lastUnderscoreIndex === -1) return null;
    
    // Extract the studentKey
    return withoutPrefix.substring(0, lastUnderscoreIndex);
  };

  // Handle state change for a record
  const handleStateChange = async (newValue, record) => {
    const studentKey = parseStudentKeyFromSummary(record.summaryKey);
    const courseId = record.courseId;
    
    if (!studentKey || !courseId) {
      toast.error("Unable to update state: Missing student or course information");
      return;
    }
    
    // Set loading state for this record
    setUpdatingStates(prev => ({ ...prev, [record.summaryKey]: true }));
    
    try {
      const db = getDatabase();
      const updates = {};
      updates[`/students/${studentKey}/courses/${courseId}/ActiveFutureArchived/Value`] = newValue;
      
      await update(ref(db), updates);
      
      // Update local state to reflect change immediately
      setModifiedStates(prev => ({
        ...prev,
        [record.summaryKey]: newValue
      }));
      
      toast.success(`State updated to ${newValue}`);
      
      // Notify parent component to refresh data if callback exists
      if (onRecordUpdated) {
        onRecordUpdated();
      }
    } catch (error) {
      console.error("Error updating state:", error);
      toast.error("Failed to update state");
    } finally {
      // Clear loading state
      setUpdatingStates(prev => {
        const updated = { ...prev };
        delete updated[record.summaryKey];
        return updated;
      });
    }
  };
  
  // Process records to find duplicates and validate ASNs
  const processedRecords = useMemo(() => {
    if (!missingRecords.length) return [];
    
    // Track duplicate courseID+ASN combinations
    const courseAsnCombos = {};
    const duplicateMarker = {};
    
    // First pass: identify duplicates
    missingRecords.forEach(record => {
      if (record.asn && record.courseId) {
        const comboKey = `${record.courseId}_${record.asn}`;
        if (courseAsnCombos[comboKey]) {
          duplicateMarker[comboKey] = true;
        } else {
          courseAsnCombos[comboKey] = true;
        }
      }
    });
    
    // Second pass: mark records with issues
    return missingRecords.map(record => {
      const isAsnValid = record.asn && ASN_REGEX.test(record.asn);
      const isDuplicate = record.asn && record.courseId && 
        duplicateMarker[`${record.courseId}_${record.asn}`];
        
      // Apply any modified states
      const effectiveState = modifiedStates[record.summaryKey] || record.ActiveFutureArchived_Value;
      
      return {
        ...record,
        isAsnValid,
        isDuplicate,
        hasIssues: !isAsnValid || isDuplicate,
        isArchivedUnenrolled: isArchivedUnenrolled({...record, ActiveFutureArchived_Value: effectiveState}),
        ActiveFutureArchived_Value: effectiveState
      };
    });
  }, [missingRecords, modifiedStates]);
  
  // Count records with issues and Archived/Unenrolled
  const stats = useMemo(() => {
    const invalidAsn = processedRecords.filter(r => !r.isAsnValid).length;
    const duplicates = processedRecords.filter(r => r.isDuplicate).length;
    const totalIssues = processedRecords.filter(r => r.hasIssues).length;
    const archivedUnenrolled = processedRecords.filter(r => r.isArchivedUnenrolled).length;
    
    return { invalidAsn, duplicates, totalIssues, archivedUnenrolled };
  }, [processedRecords]);

  // Filter records based on search term, issues filter, and archived/unenrolled filter
  const filteredRecords = useMemo(() => {
    let filtered = processedRecords;
    
    // Apply archived/unenrolled filter if enabled
    if (showOnlyArchivedUnenrolled) {
      filtered = filtered.filter(record => isArchivedUnenrolled(record));
    } else {
      // Exclude archived/unenrolled records from normal view
      filtered = filtered.filter(record => !isArchivedUnenrolled(record));
      
      // Apply issues filter if enabled
      if (showOnlyIssues) {
        filtered = filtered.filter(record => record.hasIssues);
      }
    }
    
    // Apply search filter if there's a search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(record => 
        (record.studentName || '').toLowerCase().includes(searchLower) ||
        (record.courseTitle || '').toLowerCase().includes(searchLower) ||
        (record.pasiCode || '').toLowerCase().includes(searchLower) ||
        (record.StudentEmail || '').toLowerCase().includes(searchLower) ||
        (record.ActiveFutureArchived_Value || '').toLowerCase().includes(searchLower) ||
        (record.status || '').toLowerCase().includes(searchLower) ||
        (record.studentType || '').toLowerCase().includes(searchLower) ||
        (record.asn || '').toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [processedRecords, searchTerm, showOnlyIssues, showOnlyArchivedUnenrolled]);

  // Sort records
  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      let aValue = a[sortState.column] || '';
      let bValue = b[sortState.column] || '';
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortState.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      return sortState.direction === 'asc' 
        ? (aValue > bValue ? 1 : -1) 
        : (aValue < bValue ? 1 : -1);
    });
  }, [filteredRecords, sortState]);

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

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [showOnlyIssues, showOnlyArchivedUnenrolled, searchTerm]);

  // Handle column sorting
  const handleSort = (column) => {
    setSortState(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  };

  // Handle copy to clipboard
  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Open student details dialog with additional data fetching
  const openStudentDetails = async (record) => {
    setSelectedRecord(record);
    setDetailsDialogOpen(true);
    setIsLoadingDetails(true);
    setFullStudentData(null);
    
    try {
      // Fetch the full student course summary data
      const db = getDatabase();
      const summaryRef = ref(db, `studentCourseSummaries/${record.summaryKey}`);
      const snapshot = await get(summaryRef);
      
      if (snapshot.exists()) {
        setFullStudentData(snapshot.val());
      }
    } catch (error) {
      console.error("Error fetching student details:", error);
      toast.error("Failed to load full student details");
    } finally {
      setIsLoadingDetails(false);
    }
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

  // Sortable table header component
  const SortableHeader = ({ column, label }) => {
    const isActive = sortState.column === column;
    
    return (
      <TableHead 
        className="cursor-pointer hover:bg-muted/50 transition-colors" 
        onClick={() => handleSort(column)}
      >
        <div className="flex items-center">
          {label}
          <span className="ml-1 inline-flex">
            {isActive && (
              sortState.direction === 'asc' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="m5 12 7-7 7 7"/>
                  <path d="m5 19 7-7 7 7"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
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

  // Extract PASI course codes from pasiRecords if available
  const extractPasiCodes = (record) => {
    if (!record.pasiRecords) return [];
    return Object.keys(record.pasiRecords);
  };

  // Get ASN display with validation indicator
  const getAsnDisplay = (record) => {
    if (!record.asn) {
      return (
        <div className="flex items-center text-red-500">
          <AlertTriangle className="h-4 w-4 mr-1" />
          <span>Missing</span>
        </div>
      );
    }
    
    if (!record.isAsnValid) {
      return (
        <div className="flex items-center text-red-500">
          <AlertTriangle className="h-4 w-4 mr-1" />
          <span className="font-mono">{record.asn}</span>
        </div>
      );
    }
    
    return <span className="font-mono">{record.asn}</span>;
  };

  // Format student type for display
  const getStudentTypeDisplay = (studentType) => {
    if (!studentType) return 'N/A';
    
    // Convert camelCase or snake_case to readable format with proper capitalization
    const formatted = studentType
      .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
      .replace(/_/g, ' ') // Replace underscores with spaces
      .trim(); // Remove any leading/trailing spaces
      
    // Capitalize first letter of each word
    return formatted
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Get state color based on value
  const getStateColor = (value) => {
    const option = ACTIVE_FUTURE_ARCHIVED_OPTIONS.find(opt => opt.value === value);
    return option ? option.color : "#6B7280"; // Default to gray if not found
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Header section with count and generate button */}
        <div className="flex justify-between">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md flex items-center">
            <div>
              <p className="text-sm font-medium text-amber-800">
                {missingRecords.length - stats.archivedUnenrolled} YourWay courses without PASI records
                {stats.archivedUnenrolled > 0 && (
                  <span className="text-gray-600"> (excluding {stats.archivedUnenrolled} Archived/Unenrolled)</span>
                )}
              </p>
              <p className="text-xs text-amber-700 mt-1">
                These courses need to be registered in PASI to ensure complete records
              </p>
              {stats.totalIssues > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {stats.invalidAsn > 0 && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {stats.invalidAsn} Invalid ASNs
                    </Badge>
                  )}
                  {stats.duplicates > 0 && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <Files className="h-3 w-3" />
                      {stats.duplicates} Duplicates
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search and filter area */}
        <div className="flex items-center justify-between space-x-2 mb-4">
          <div className="flex-1">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, course, email, ASN, student type..."
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
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch 
                id="show-issues" 
                checked={showOnlyIssues}
                onCheckedChange={setShowOnlyIssues}
                disabled={showOnlyArchivedUnenrolled}
              />
              <Label htmlFor="show-issues" className="text-sm cursor-pointer">
                Show only students with data issues
              </Label>
            </div>
            
            {/* New toggle for Archived/Unenrolled records */}
            <div className="flex items-center gap-2">
              <Switch 
                id="show-archived-unenrolled" 
                checked={showOnlyArchivedUnenrolled}
                onCheckedChange={setShowOnlyArchivedUnenrolled}
              />
              <Label htmlFor="show-archived-unenrolled" className="text-sm cursor-pointer flex items-center">
                <Archive className="h-4 w-4 mr-1 text-blue-600" />
                Show Archived/Unenrolled ({stats.archivedUnenrolled})
              </Label>
            </div>
          </div>
          
          <Badge variant="outline">
            {filteredRecords.length} records
          </Badge>
        </div>

       {/* Table */}
<div className="rounded-md border border-blue-200">
  <Table className="bg-blue-50">
    <TableHeader className="bg-blue-100">
      <TableRow>
        <SortableHeader column="studentName" label="Student Name" />
        <SortableHeader column="courseTitle" label="Course" />
        <SortableHeader column="StudentEmail" label="Student Email" />
        <SortableHeader column="asn" label="ASN" />
        <SortableHeader column="studentType" label="Student Type" />
        <SortableHeader column="ActiveFutureArchived_Value" label="State" />
        <SortableHeader column="status" label="Status" />
        <SortableHeader column="pasiCode" label="PASI Code" />
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {paginatedRecords.length === 0 ? (
        <TableRow>
          <TableCell colSpan={9} className="h-24 text-center text-blue-600 bg-blue-50">
            {searchTerm || showOnlyIssues || showOnlyArchivedUnenrolled ? 'No matching records found.' : 'No records available.'}
          </TableCell>
        </TableRow>
      ) : (
        paginatedRecords.map((record) => (
          <TableRow 
            key={record.summaryKey} 
            className={`hover:bg-blue-100 bg-blue-50 border-b border-blue-200
              ${record.isDuplicate ? 'bg-blue-100' : ''}`}
          >
            <TableCell className="font-medium text-blue-800">{record.studentName || 'N/A'}</TableCell>
            <TableCell className="text-blue-800">{record.courseTitle || 'N/A'}</TableCell>
            <TableCell className="text-blue-800">
              <span className="text-xs">{record.StudentEmail || 'N/A'}</span>
            </TableCell>
            <TableCell className="text-blue-800">{getAsnDisplay(record)}</TableCell>
            <TableCell>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">
                {getStudentTypeDisplay(record.studentType)}
              </Badge>
            </TableCell>
            <TableCell>
              <Select 
                defaultValue={record.ActiveFutureArchived_Value || ""}
                value={record.ActiveFutureArchived_Value || ""}
                onValueChange={(value) => handleStateChange(value, record)}
                disabled={updatingStates[record.summaryKey]}
              >
                <SelectTrigger className="w-[140px] border-blue-300 bg-blue-50 text-blue-800">
                  {updatingStates[record.summaryKey] ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-solid border-current border-r-transparent mr-2" />
                      <span>Updating...</span>
                    </div>
                  ) : (
                    <SelectValue>
                      {record.ActiveFutureArchived_Value && (
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: getStateColor(record.ActiveFutureArchived_Value) }}
                          />
                          {record.ActiveFutureArchived_Value}
                        </div>
                      )}
                    </SelectValue>
                  )}
                </SelectTrigger>
                <SelectContent className="bg-blue-50 border-blue-300">
                  {ACTIVE_FUTURE_ARCHIVED_OPTIONS.map(option => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      className="hover:bg-blue-100 focus:bg-blue-100"
                    >
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: option.color }}
                        />
                        {option.value}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300">
                {record.status || 'N/A'}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="font-mono bg-blue-50 text-blue-800 border-blue-300">
                {record.pasiCode || 'N/A'}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(record.asn)}
                      title="Copy ASN"
                      disabled={!record.asn}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-blue-50 border-blue-300 text-blue-800">
                    <p>Copy ASN</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openStudentDetails(record)}
                      title="View Details"
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-blue-50 border-blue-300 text-blue-800">
                    <p>View Details</p>
                  </TooltipContent>
                </Tooltip>

                {record.studentPage && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(record.studentPage, '_blank')}
                        title="View in PASI Prep"
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-blue-50 border-blue-300 text-blue-800">
                      <p>View in PASI Prep</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  </Table>
</div>

        {/* Pagination */}
        {renderPagination()}

        {/* Student Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Student Course Details</DialogTitle>
            </DialogHeader>
            
            {selectedRecord && (
              <ScrollArea className="max-h-[70vh] pr-4">
                {isLoadingDetails ? (
                  <div className="py-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent" role="status">
                      <span className="sr-only">Loading...</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading details...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Special notice for Archived/Unenrolled records */}
                    {selectedRecord.isArchivedUnenrolled && (
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                        <div className="flex items-start">
                          <Archive className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                          <div>
                            <h3 className="text-sm font-medium text-blue-800">Archived and Unenrolled Record</h3>
                            <p className="text-sm text-blue-700 mt-1">
                              This student course has been archived and unenrolled. It is not considered a missing PASI record.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Issue warning banners */}
                    {selectedRecord.hasIssues && (
                      <div className="space-y-2">
                        {!selectedRecord.isAsnValid && (
                          <div className="bg-red-50 border-l-4 border-red-500 p-4">
                            <div className="flex items-start">
                              <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                              <div>
                                <h3 className="text-sm font-medium text-red-800">Invalid ASN Format</h3>
                                <p className="text-sm text-red-700 mt-1">
                                  {!selectedRecord.asn 
                                    ? "This student is missing an ASN, which is required for PASI records." 
                                    : `The ASN "${selectedRecord.asn}" does not match the required format (1234-5678-9).`}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {selectedRecord.isDuplicate && (
                          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                            <div className="flex items-start">
                              <Files className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                              <div>
                                <h3 className="text-sm font-medium text-yellow-800">Duplicate Student Course</h3>
                                <p className="text-sm text-yellow-700 mt-1">
                                  This combination of Course ID ({selectedRecord.courseId}) and ASN ({selectedRecord.asn}) appears multiple times in the dataset.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  
                    {/* Basic information from the missing record */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-3">Course Summary</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Student Name</p>
                          <p className="text-sm">{selectedRecord.studentName || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Student Email</p>
                          <p className="text-sm">{selectedRecord.StudentEmail || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Student Type</p>
                          <p className="text-sm">{getStudentTypeDisplay(selectedRecord.studentType)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">ASN</p>
                          <p className={`text-sm font-mono ${!selectedRecord.isAsnValid ? 'text-red-500' : ''}`}>
                            {selectedRecord.asn || 'Missing'}
                            {!selectedRecord.isAsnValid && selectedRecord.asn && (
                              <span className="ml-2 text-xs">(Invalid format)</span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Course Title</p>
                          <p className="text-sm">{selectedRecord.courseTitle || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Course ID</p>
                          <p className="text-sm">{selectedRecord.courseId || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">PASI Code</p>
                          <p className="text-sm">{selectedRecord.pasiCode || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">School Year</p>
                          <p className="text-sm">{selectedRecord.schoolYear || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">State</p>
                          <p className="text-sm">
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2" 
                                style={{ backgroundColor: getStateColor(selectedRecord.ActiveFutureArchived_Value) }}
                              />
                              {selectedRecord.ActiveFutureArchived_Value || 'N/A'}
                            </div>
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Status</p>
                          <p className="text-sm">
                            {selectedRecord.isArchivedUnenrolled ? (
                              <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300">
                                {selectedRecord.status || 'N/A'}
                              </Badge>
                            ) : (
                              selectedRecord.status || 'N/A'
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Summary Key</p>
                          <p className="text-sm font-mono text-xs" title={selectedRecord.summaryKey}>
                            {selectedRecord.summaryKey || 'N/A'}
                          </p>
                        </div>
                        {selectedRecord.reason && (
                          <div>
                            <p className="text-sm font-medium">Missing Reason</p>
                            <p className="text-sm text-amber-600">{selectedRecord.reason}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Display additional data if available */}
                    {fullStudentData && (
                      <>
                        <div className="border rounded-lg p-4">
                          <h3 className="font-semibold mb-3">Student Information</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {Object.entries(fullStudentData)
                              .filter(([key, value]) => 
                                typeof value !== 'object' && 
                                key !== 'lastName' && 
                                key !== 'firstName' &&
                                key !== 'Course' &&
                                key !== 'CourseID' &&
                                !key.includes('_Value') &&
                                key !== 'StudentEmail' &&
                                key !== 'asn' &&
                                key !== 'studentType'
                              )
                              .sort(([a], [b]) => a.localeCompare(b))
                              .map(([key, value]) => (
                                <div key={key}>
                                  <p className="text-sm font-medium">{key}</p>
                                  <p className="text-sm break-words">
                                    {typeof value === 'boolean' 
                                      ? (value ? 'Yes' : 'No')
                                      : value?.toString() || 'N/A'}
                                  </p>
                                </div>
                              ))
                            }
                          </div>
                        </div>

                        {/* PASI Records if available */}
                        {fullStudentData.pasiRecords && Object.keys(fullStudentData.pasiRecords).length > 0 && (
                          <div className="border rounded-lg p-4">
                            <h3 className="font-semibold mb-3">Existing PASI Records</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {Object.entries(fullStudentData.pasiRecords).map(([code, record]) => (
                                <div key={code} className="border rounded p-3 bg-muted/20">
                                  <h4 className="font-medium text-sm mb-2">{code}</h4>
                                  {typeof record === 'object' && (
                                    <div className="grid grid-cols-2 gap-1 text-xs">
                                      {Object.entries(record).map(([key, value]) => (
                                        <React.Fragment key={key}>
                                          <div className="font-medium">{key}</div>
                                          <div>
                                            {typeof value === 'object' 
                                              ? JSON.stringify(value) 
                                              : value?.toString() || 'N/A'}
                                          </div>
                                        </React.Fragment>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Categories if available */}
                        {fullStudentData.categories && Object.keys(fullStudentData.categories).length > 0 && (
                          <div className="border rounded-lg p-4">
                            <h3 className="font-semibold mb-3">Categories</h3>
                            <div className="grid grid-cols-1 gap-4">
                              {Object.entries(fullStudentData.categories).map(([email, categories]) => (
                                <div key={email} className="border rounded p-3">
                                  <p className="font-medium text-sm mb-2">{email.replace(/,/g, '.')}</p>
                                  {typeof categories === 'object' && (
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      {Object.entries(categories).map(([category, value]) => (
                                        <React.Fragment key={category}>
                                          <div className="font-medium">{category}</div>
                                          <div>
                                            {typeof value === 'boolean' 
                                              ? (value ? 'Yes' : 'No') 
                                              : value?.toString() || 'N/A'}
                                          </div>
                                        </React.Fragment>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Auto Status if available */}
                        {fullStudentData.autoStatus && (
                          <div className="border rounded-lg p-4">
                            <h3 className="font-semibold mb-3">Auto Status</h3>
                            <div className="grid grid-cols-2 gap-4">
                              {Object.entries(fullStudentData.autoStatus).map(([key, value]) => (
                                <div key={key}>
                                  <p className="text-sm font-medium">{key}</p>
                                  <p className="text-sm">{value?.toString() || 'N/A'}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </ScrollArea>
            )}
            
            <DialogFooter>
              <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default MissingPasiRecordsTab;