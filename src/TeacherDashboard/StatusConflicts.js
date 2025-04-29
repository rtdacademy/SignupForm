// StatusConflicts.js
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { AlertTriangle, ArrowRight, Code } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { toast } from 'sonner';
import PasiActionButtons from "../components/PasiActionButtons";
import { STATUS_OPTIONS } from '../config/DropdownOptions';
import { Button } from "../components/ui/button";

const StatusConflicts = ({ recordsWithStatusMismatch }) => {
  const [sortState, setSortState] = useState({ column: 'studentName', direction: 'asc' });
  const [showRawData, setShowRawData] = useState(false);

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
      referenceNumber: record.referenceNumber || '',
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

  // Copy record to clipboard as JSON
  const copyRecordToClipboard = (record) => {
    const recordStr = JSON.stringify(record, null, 2);
    navigator.clipboard.writeText(recordStr);
    toast.success("Record data copied to clipboard as JSON");
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
            Status Conflicts 
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
                <SortableHeader column="asn" label="ASN" />
                <SortableHeader column="studentName" label="Student" />
                <SortableHeader column="courseCode" label="Course" />
                <SortableHeader column="status" label="PASI Status" />
                <TableHead className="text-center w-8">
                  <ArrowRight className="h-4 w-4 mx-auto" />
                </TableHead>
                <SortableHeader column="Status_Value" label="YourWay Status" />
                <TableHead className="text-xs px-1 py-1 w-28 max-w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRecords.map((record) => {
                const statusOption = getStatusOption(record.Status_Value);
                
                return (
                  <TableRow key={record.id} className="hover:bg-gray-100">
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
                      onClick={() => handleCellClick(record.status, "PASI Status")}
                    >
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center w-8">
                      <AlertTriangle className="h-4 w-4 text-amber-500 inline-block" />
                    </TableCell>
                    <TableCell 
                      className="p-1 cursor-pointer" 
                      onClick={() => handleCellClick(record.Status_Value, "YourWay Status")}
                    >
                      <Badge 
                        variant="secondary" 
                        style={{ 
                          backgroundColor: statusOption ? `${statusOption.color}15` : undefined,
                          color: statusOption ? statusOption.color : undefined,
                          borderColor: statusOption ? statusOption.color : undefined
                        }}
                        className="border"
                      >
                        {record.Status_Value}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-1 w-28 max-w-28">
                      <PasiActionButtons 
                        asn={record.asn} 
                        referenceNumber={record.referenceNumber} 
                      />
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
      </CardContent>
    </Card>
  );
};

export default StatusConflicts;