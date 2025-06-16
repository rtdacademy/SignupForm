// TermConflicts.js
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Checkbox } from "../components/ui/checkbox";
import { AlertTriangle, ArrowRight, Code, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { toast } from 'sonner';
import { getDatabase, ref, update } from 'firebase/database';
import PasiActionButtons from "../components/PasiActionButtons";
import PasiRecordDetails from './PasiRecordDetails';
import { Button } from "../components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";

const TermConflicts = ({ recordsWithTermMismatch }) => {
  const [sortState, setSortState] = useState({ column: 'studentName', direction: 'asc' });
  const [showRawData, setShowRawData] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  // Ref for detail card
  const detailCardRef = useRef(null);
  
  // Function to update companion data in Firebase
  const updateTermConflictsChecked = (recordId, isChecked) => {
    if (!recordId) {
      toast.error("Cannot update: Missing record id");
      return;
    }
    const db = getDatabase();
    const companionRef = ref(db, `/pasiRecordsCompanion/${recordId}`);
    const updates = {
      termConflictsChecked: isChecked
    };
    
    update(companionRef, updates)
      .then(() => {
        toast.success(`Updated term conflicts status successfully`);
      })
      .catch((error) => {
        console.error(`Error updating term conflicts status:`, error);
        toast.error(`Failed to update term conflicts status`);
      });
  };

  // Process records to ensure all properties exist
  const processedRecords = useMemo(() => {
    return recordsWithTermMismatch.map(record => ({
      ...record,
      asn: record.asn || '',
      studentName: record.studentName || '',
      courseCode: record.courseCode || '',
      courseDescription: record.courseDescription || '',
      // Use the displayStudentType and displayTerm that were set during filtering
      StudentType_Value: record.displayStudentType || record.StudentType_Value || record.studentType || '',
      pasiTerm: record.displayTerm || record.pasiTerm || record.term || '',
      period: record.displayPeriod || record.period || '',
      exitDate: record.displayExitDate || record.exitDate || '',
      suggestedPeriod: record.suggestedPeriod || '',
      referenceNumber: record.referenceNumber || '',
    }));
  }, [recordsWithTermMismatch]);

  // Handle column sorting
  const handleSort = (column) => {
    setSortState(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Sortable table header component
  const SortableHeader = ({ column, label }) => {
    const isActive = sortState.column === column;
    
    return (
      <TableHead 
        className="cursor-pointer hover:bg-muted/50 transition-colors text-xs" 
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

  // Get term conflict explanation
  const getTermConflictExplanation = (record) => {
    const studentType = record.StudentType_Value;
    const pasiTerm = record.pasiTerm;
    const period = record.period;
    const exitDate = record.exitDate;
    
    // Original rules
    if (studentType === 'Summer Student' && pasiTerm !== 'Summer') {
      return "Summer Student records must have 'Summer' term.";
    } else if ((studentType === 'Non-Primary' || studentType === 'Home Education') && pasiTerm === 'Summer') {
      return `${studentType} records cannot have 'Summer' term.`;
    }
    
    // New rules for Adult/International students
    if ((studentType === 'Adult Student' || studentType === 'International Student')) {
      if (period === 'Full Year' && exitDate && exitDate !== '-') {
        return `${studentType} with exit date ${exitDate} in summer range should have 'Summer' period.`;
      } else if (period === 'Summer' && exitDate && exitDate !== '-') {
        return `${studentType} with exit date ${exitDate} outside summer range should have 'Full Year' period.`;
      }
    }
    
    return "Term/Period configuration is incorrect for this student type.";
  };

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
            Term Conflicts 
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
          <Table className="text-xs w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs px-2 py-1 w-8">Checked</TableHead>
                <SortableHeader column="asn" label="ASN" />
                <SortableHeader column="studentName" label="Student" />
                <SortableHeader column="courseCode" label="Course" />
                <SortableHeader column="StudentType_Value" label="Student Type" />
                <SortableHeader column="period" label="Current Period" />
                <TableHead className="text-center w-8">
                  <ArrowRight className="h-4 w-4 mx-auto" />
                </TableHead>
                <SortableHeader column="suggestedPeriod" label="Suggested Period" />
                <SortableHeader column="exitDate" label="Exit Date" />
                <TableHead className="text-xs px-1 py-1 w-36 min-w-36">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRecords.map((record) => {
                const explanation = getTermConflictExplanation(record);
                
                return (
                  <TableRow key={record.id} className="hover:bg-gray-100">
                    <TableCell className="p-1 w-8">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Checkbox
                                id={`checked-${record.id}`}
                                checked={Boolean(record.termConflictsChecked)}
                                onCheckedChange={(checked) => {
                                  if (record.id) {
                                    updateTermConflictsChecked(record.id, Boolean(checked));
                                  }
                                }}
                                aria-label="Mark as checked"
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Mark this term conflict as checked</p>
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
                      className="p-1 cursor-pointer font-medium" 
                      onClick={() => handleCellClick(record.studentName, "Student Name")}
                    >
                      {record.studentName || 'N/A'}
                    </TableCell>
                    <TableCell 
                      className="p-1 cursor-pointer" 
                      onClick={() => handleCellClick(record.courseCode, "Course")}
                    >
                      {record.courseCode} - {record.courseDescription || 'N/A'}
                    </TableCell>
                    <TableCell 
                      className="p-1 cursor-pointer" 
                      onClick={() => handleCellClick(record.StudentType_Value, "Student Type")}
                    >
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {record.StudentType_Value}
                      </Badge>
                    </TableCell>
                    <TableCell 
                      className="p-1 cursor-pointer" 
                      onClick={() => handleCellClick(record.period, "Current Period")}
                    >
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        {record.period || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center w-8">
                      <AlertTriangle className="h-4 w-4 text-amber-500 inline-block" />
                    </TableCell>
                    <TableCell 
                      className="p-1 cursor-pointer" 
                      onClick={() => handleCellClick(record.suggestedPeriod, "Suggested Period")}
                    >
                      <div>
                        <Badge 
                          variant="secondary" 
                          className="bg-green-100 text-green-800 border border-green-300"
                        >
                          {record.suggestedPeriod || 'N/A'}
                        </Badge>
                        <div className="text-xs text-amber-700 mt-1">{explanation}</div>
                      </div>
                    </TableCell>
                    <TableCell 
                      className="p-1 cursor-pointer" 
                      onClick={() => handleCellClick(record.exitDate, "Exit Date")}
                    >
                      {record.exitDate && record.exitDate !== '-' ? record.exitDate : 'N/A'}
                    </TableCell>
                    <TableCell className="p-1 w-36 min-w-36">
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
            No term conflicts found.
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

export default TermConflicts;