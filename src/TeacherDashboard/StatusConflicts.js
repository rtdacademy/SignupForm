// StatusConflicts.js
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Checkbox } from "../components/ui/checkbox";
import { AlertTriangle, ArrowRight, Code, Info, Wrench } from 'lucide-react';
import PasiRecordDetails from './PasiRecordDetails';
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { toast } from 'sonner';
import { getDatabase, ref, update } from 'firebase/database';
import PasiActionButtons from "../components/PasiActionButtons";
import { STATUS_OPTIONS, ACTIVE_FUTURE_ARCHIVED_OPTIONS, getActiveFutureArchivedColor } from '../config/DropdownOptions';
import { Button } from "../components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { sanitizeEmail } from '../utils/sanitizeEmail';

const StatusConflicts = ({ recordsWithStatusMismatch }) => {
  const [sortState, setSortState] = useState({ column: 'studentName', direction: 'asc' });
  const [showRawData, setShowRawData] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  // Ref for detail card
  const detailCardRef = useRef(null);
  
  // Function to update companion data in Firebase
  const updateStatusConflictsChecked = (recordId, isChecked) => {
    if (!recordId) {
      toast.error("Cannot update: Missing record id");
      return;
    }
    const db = getDatabase();
    const companionRef = ref(db, `/pasiRecordsCompanion/${recordId}`);
    const updates = {
      StatusConflictsChecked: isChecked
    };
    
    update(companionRef, updates)
      .then(() => {
        toast.success(`Updated status conflicts check successfully`);
      })
      .catch((error) => {
        console.error(`Error updating status conflicts check:`, error);
        toast.error(`Failed to update status conflicts check`);
      });
  };

  // Function to fix state mismatch by updating ActiveFutureArchived value
  const fixStateMismatch = async (record) => {
    if (!record.email || !record.courseId || !record.expectedState) {
      toast.error("Cannot fix state: Missing required data");
      return;
    }

    try {
      const studentKey = sanitizeEmail(record.email);
      const db = getDatabase();
      const updates = {};
      
      // Update the ActiveFutureArchived/Value for this student course
      updates[`students/${studentKey}/courses/${record.courseId}/ActiveFutureArchived/Value`] = record.expectedState;
      
      // If setting to Archived, also set ColdStorage to trigger archiving
      if (record.expectedState === 'Archived') {
        updates[`students/${studentKey}/courses/${record.courseId}/ColdStorage`] = true;
      }
      
      await update(ref(db), updates);
      
      toast.success(`Updated ActiveFutureArchived state to "${record.expectedState}" for ${record.studentName}`);
      
      // You may want to refresh the data here to reflect the changes
      // This would depend on how your parent component handles data refreshing
      
    } catch (error) {
      console.error("Error updating ActiveFutureArchived state:", error);
      toast.error(`Failed to update state: ${error.message}`);
    }
  };

  // Function to update state via select component
  const updateState = async (record, newState) => {
    if (!record.email || !record.courseId) {
      toast.error("Cannot update state: Missing required data");
      return;
    }

    try {
      const studentKey = sanitizeEmail(record.email);
      const db = getDatabase();
      const updates = {};
      
      // Update the ActiveFutureArchived/Value for this student course
      updates[`students/${studentKey}/courses/${record.courseId}/ActiveFutureArchived/Value`] = newState;
      
      // If setting to Archived, also set ColdStorage to trigger archiving
      if (newState === 'Archived') {
        updates[`students/${studentKey}/courses/${record.courseId}/ColdStorage`] = true;
      }
      
      await update(ref(db), updates);
      
      toast.success(`Updated ActiveFutureArchived state to "${newState}" for ${record.studentName}`);
      
    } catch (error) {
      console.error("Error updating ActiveFutureArchived state:", error);
      toast.error(`Failed to update state: ${error.message}`);
    }
  };

  // Process records to ensure all properties exist
  const processedRecords = useMemo(() => {
    return recordsWithStatusMismatch.map(record => ({
      ...record,
      asn: record.asn || '',
      studentName: record.studentName || '',
      courseCode: record.courseCode || '',
      courseDescription: record.courseDescription || '',
      status: record.status || '',
      Status_Value: record.Status_Value || '',
      ActiveFutureArchived_Value: record.ActiveFutureArchived_Value || '',
      mismatchType: record.mismatchType || 'status',
      mismatchReason: record.mismatchReason || 'Status mismatch detected',
      expectedState: record.expectedState || '',
      actualState: record.actualState || '',
      referenceNumber: record.referenceNumber || '',
      email: record.email || record.studentEmail || '',
      courseId: record.courseId || record.CourseID || '',
    }));
  }, [recordsWithStatusMismatch]);

  // Get status option for a given status value
  const getStatusOption = (statusValue) => {
    return STATUS_OPTIONS.find(opt => opt.value === statusValue);
  };

  // Handle column sorting
  const handleSort = (column) => {
    setSortState(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Sortable table header component
  const SortableHeader = ({ column, label, className = "" }) => {
    const isActive = sortState.column === column;
    
    return (
      <TableHead 
        className={`cursor-pointer hover:bg-muted/50 transition-colors text-[11px] ${className}`}
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

  // Handle copy to clipboard
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

  // Sort records
  const sortedRecords = useMemo(() => {
    return [...processedRecords].sort((a, b) => {
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
  }, [processedRecords, sortState]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Status & State Conflicts 
          </CardTitle>
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
      </CardHeader>
      <CardContent>
        

        {showRawData && sortedRecords.length > 0 && (
          <div className="mb-4 p-4 border rounded bg-gray-50 overflow-auto max-h-40">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Sample Record Data Structure</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => copyRecordToClipboard(sortedRecords[0])}
                className="text-xs"
              >
                Copy JSON
              </Button>
            </div>
            <pre className="text-xs overflow-auto whitespace-pre-wrap">
              {JSON.stringify(sortedRecords[0], null, 2)}
            </pre>
          </div>
        )}

        {sortedRecords.length > 0 ? (
          <Table className="text-[11px] w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="text-[11px] px-1 py-1 w-6 min-w-6">✓</TableHead>
                <SortableHeader column="asn" label="ASN" className="w-16 min-w-16" />
                <SortableHeader column="studentName" label="Student" className="w-[12%]" />
                <SortableHeader column="courseCode" label="Course" className="w-24 max-w-24" />
                <SortableHeader column="status" label="PASI Status" className="w-20 max-w-20" />
                <TableHead className="text-center w-6 min-w-6">
                  <ArrowRight className="h-3 w-3 mx-auto" />
                </TableHead>
                <SortableHeader column="Status_Value" label="YourWay Status" className="w-[12%]" />
                <SortableHeader column="ActiveFutureArchived_Value" label="State" className="w-[10%]" />
                <SortableHeader column="mismatchType" label="Issue" className="w-32 max-w-32" />
                <TableHead className="text-xs px-1 py-1 w-32 min-w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRecords.map((record) => {
                const statusOption = getStatusOption(record.Status_Value);
                
                return (
                  <TableRow key={record.id} className="hover:bg-gray-100">
                    <TableCell className="p-1 w-6">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Checkbox
                                id={`checked-${record.id}`}
                                checked={Boolean(record.StatusConflictsChecked)}
                                onCheckedChange={(checked) => {
                                  if (record.id) {
                                    updateStatusConflictsChecked(record.id, Boolean(checked));
                                  }
                                }}
                                aria-label="Mark as checked"
                                className="h-3 w-3"
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Mark this status conflict as checked</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell 
                      className="p-1 cursor-pointer" 
                      onClick={() => handleCellClick(record.asn, "ASN")}
                    >
                      {record.asn || 'N/A'}
                    </TableCell>
                    <TableCell 
                      className="p-1 cursor-pointer font-medium truncate w-[15%]" 
                      onClick={() => handleCellClick(record.studentName, "Student Name")}
                    >
                      <div className="truncate">
                        {record.studentName || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell 
                      className="p-1 cursor-pointer w-24 max-w-24" 
                      onClick={() => handleCellClick(record.courseCode, "Course")}
                    >
                      <div className="truncate" title={`${record.courseCode} - ${record.courseDescription || 'N/A'}`}>
                        {record.courseCode}
                      </div>
                    </TableCell>
                    <TableCell 
                      className="p-1 cursor-pointer w-20 max-w-20" 
                      onClick={() => handleCellClick(record.status, "PASI Status")}
                    >
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-[10px] px-1 py-0.5">
                        <div className="truncate" title={record.status}>
                          {record.status}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center w-6">
                      <AlertTriangle className="h-3 w-3 text-amber-500 inline-block" />
                    </TableCell>
                    <TableCell 
                      className="p-1 cursor-pointer w-[12%]" 
                      onClick={() => handleCellClick(record.Status_Value, "YourWay Status")}
                    >
                      <Badge 
                        variant="secondary" 
                        style={{ 
                          backgroundColor: statusOption ? `${statusOption.color}15` : undefined,
                          color: statusOption ? statusOption.color : undefined,
                          borderColor: statusOption ? statusOption.color : undefined
                        }}
                        className="border whitespace-nowrap"
                      >
                        {record.Status_Value}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-1 w-[10%]">
                      {record.email && record.courseId ? (
                        <Select
                          value={record.ActiveFutureArchived_Value || ''}
                          onValueChange={(newState) => updateState(record, newState)}
                        >
                          <SelectTrigger 
                            className={`h-6 text-[10px] ${
                              record.mismatchType === 'state' ? 'border-red-300 bg-red-50' : ''
                            }`}
                            style={{
                              backgroundColor: record.mismatchType === 'state' 
                                ? '#fef2f2' 
                                : record.ActiveFutureArchived_Value 
                                  ? `${getActiveFutureArchivedColor(record.ActiveFutureArchived_Value)}15`
                                  : undefined,
                              borderColor: record.mismatchType === 'state' 
                                ? '#fca5a5' 
                                : record.ActiveFutureArchived_Value 
                                  ? getActiveFutureArchivedColor(record.ActiveFutureArchived_Value)
                                  : undefined
                            }}
                          >
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {ACTIVE_FUTURE_ARCHIVED_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                <span style={{ color: option.color }}>{option.value}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge 
                          variant="outline" 
                          className="text-[10px] px-1 py-0.5"
                        >
                          {record.ActiveFutureArchived_Value || 'N/A'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="p-1 w-32 max-w-32">
                      <div className="text-[11px]">
                        <div className="flex items-center justify-between mb-1">
                          <Badge 
                            variant={record.mismatchType === 'status' ? 'destructive' : 'secondary'}
                            className="text-[10px] px-1 py-0.5"
                          >
                            {record.mismatchType === 'status' ? 'Status' : 'State'}
                          </Badge>
                          {record.mismatchType === 'state' && record.expectedState && record.email && record.courseId && 
                           record.expectedState !== 'Archived' && record.expectedState !== 'Completed' && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      fixStateMismatch(record);
                                    }}
                                  >
                                    <Wrench className="h-3 w-3 text-blue-500" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Fix state to "{record.expectedState}"</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="text-muted-foreground truncate cursor-help">
                                {record.mismatchType === 'state' && record.expectedState ? (
                                  <span>
                                    Expected: <strong>{record.expectedState}</strong>
                                  </span>
                                ) : (
                                  <span className="truncate">
                                    {record.mismatchReason.length > 25 
                                      ? `${record.mismatchReason.substring(0, 25)}...` 
                                      : record.mismatchReason}
                                  </span>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p className="text-sm">{record.mismatchReason}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                    <TableCell className="p-1 w-32 min-w-32">
                      <div className="flex items-center justify-start space-x-1">
                        <div className="flex-shrink-0">
                          <PasiActionButtons 
                            asn={record.asn} 
                            referenceNumber={record.referenceNumber} 
                          />
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
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No status conflicts found.
          </div>
        )}
        
        {/* Display selected record details */}
        {selectedRecord && (
          <PasiRecordDetails
            ref={detailCardRef}
            record={selectedRecord}
            onClose={() => setSelectedRecord(null)}
            handleCellClick={handleCellClick}
            onRecordUpdate={handleRecordUpdate}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default StatusConflicts;