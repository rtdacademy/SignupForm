import React, { useState, useEffect, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "../components/ui/sheet";
import { ScrollArea } from "../components/ui/scroll-area";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Separator } from "../components/ui/separator";
import { 
  FileSpreadsheet, 
  Download, 
  ChevronDown,
  ChevronRight,
  Check,
  Info,
  Users,
  File,
  AlertCircle
} from 'lucide-react';
import Papa from 'papaparse';
import { toast } from 'sonner';

const CSVExportSheet = ({ 
  isOpen, 
  onOpenChange, 
  filteredRecords,
  selectedRecords = [],
  schoolYear
}) => {
  const [selectedColumns, setSelectedColumns] = useState({});
  const [columnCategories, setColumnCategories] = useState({});
  const [showColumnSelector, setShowColumnSelector] = useState(true);
  const [filename, setFilename] = useState(`PASI_Records_Export_${schoolYear}`);
  
  // Get records to process (either selected or all filtered)
  const recordsToProcess = selectedRecords.length > 0 ? selectedRecords : filteredRecords;
  
  // Group by unique ASN to get student count
  const uniqueStudents = [...new Set(recordsToProcess.map(r => r.asn).filter(Boolean))];
  const studentCount = uniqueStudents.length;

  // Helper function to categorize columns
  const categorizeColumns = (records) => {
    if (!records || records.length === 0) return {};
    
    const categories = {
      'Student Information': ['asn', 'studentName', 'firstName', 'lastName', 'StudentEmail', 
        'StudentPhone', 'birthday', 'StudentType_Value', 'entryDate'],
      'Course Information': ['Course_Value', 'courseCode', 'pasiTerm', 'schoolYear', 
        'Created', 'startDate', 'ScheduleStartDate', 'courseDescription'],
      'Parent Information': ['ParentFirstName', 'ParentLastName', 'ParentEmail', 
        'ParentPhone_x0023_'],
      'Registration Details': ['pasiStatus', 'InstructorName', 'CourseDeliveryType', 
        'EntryType', 'ExitType', 'exitDate', 'grade', 'creditsAwarded'],
      'Status Information': ['Status_Value', 'ActiveFutureArchived_Value', 'payment_status',
        'workItems', 'status'],
      'YourWay Data': ['firestoreID', 'yourwayEnrolmentID', 'enrollmentStatus',
        'parentEnrolmentPaymentStatus', 'paymentId'],
      'PASI Data': ['referenceNumber', 'term', 'mark', 'gradeType', 'pasiTerm'],
      'Other': []
    };

    // Get all unique columns from records
    const allColumns = new Set();
    records.forEach(record => {
      Object.keys(record).forEach(key => allColumns.add(key));
    });

    // Initialize column selections
    const initialSelections = {};
    const organizedCategories = {};

    // Organize columns by category
    Object.entries(categories).forEach(([category, columns]) => {
      organizedCategories[category] = [];
      columns.forEach(col => {
        if (allColumns.has(col)) {
          organizedCategories[category].push(col);
          initialSelections[col] = true; // Default to selected
        }
      });
    });

    // Add any remaining columns to "Other"
    allColumns.forEach(col => {
      let found = false;
      Object.values(categories).forEach(catCols => {
        if (catCols.includes(col)) found = true;
      });
      if (!found && !col.startsWith('_')) { // Skip internal fields starting with _
        organizedCategories['Other'].push(col);
        initialSelections[col] = false; // Default uncategorized to unselected
      }
    });

    // Remove empty categories
    Object.keys(organizedCategories).forEach(cat => {
      if (organizedCategories[cat].length === 0) {
        delete organizedCategories[cat];
      }
    });

    return { categories: organizedCategories, selections: initialSelections };
  };

  // Initialize column categories and selections when records change
  useEffect(() => {
    if (recordsToProcess.length > 0) {
      const { categories, selections } = categorizeColumns(recordsToProcess);
      setColumnCategories(categories);
      setSelectedColumns(selections);
    }
  }, [recordsToProcess]);

  // Column selection helpers
  const toggleColumn = (column) => {
    setSelectedColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const toggleAllColumns = (selected) => {
    const newSelections = {};
    Object.keys(selectedColumns).forEach(col => {
      newSelections[col] = selected;
    });
    setSelectedColumns(newSelections);
  };

  const toggleCategory = (category) => {
    const categoryColumns = columnCategories[category];
    const allSelected = categoryColumns.every(col => selectedColumns[col]);
    
    setSelectedColumns(prev => {
      const newSelections = { ...prev };
      categoryColumns.forEach(col => {
        newSelections[col] = !allSelected;
      });
      return newSelections;
    });
  };

  const getSelectedColumnCount = () => {
    return Object.values(selectedColumns).filter(Boolean).length;
  };

  // Format value for CSV
  const formatValueForCSV = (value, columnName) => {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    // Handle dates
    if (['birthday', 'entryDate', 'exitDate', 'Created', 'startDate', 'ScheduleStartDate'].includes(columnName)) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
        }
      } catch (e) {
        // If date parsing fails, return original value
      }
    }

    // Handle boolean values
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    // Handle objects/arrays
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  };

  // Generate CSV
  const handleGenerateCSV = () => {
    if (getSelectedColumnCount() === 0) {
      toast.error('Please select at least one column for CSV export');
      return;
    }

    try {
      // Get selected column names
      const selectedColumnNames = Object.keys(selectedColumns).filter(col => selectedColumns[col]);

      // Prepare data for CSV
      const csvData = recordsToProcess.map(record => {
        const row = {};
        selectedColumnNames.forEach(col => {
          row[col] = formatValueForCSV(record[col], col);
        });
        return row;
      });

      // Generate CSV string using Papa Parse
      const csv = Papa.unparse(csvData, {
        header: true,
        skipEmptyLines: true
      });

      // Create and download the file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`CSV exported successfully! ${csvData.length} records exported.`);
      onOpenChange(false);
    } catch (error) {
      console.error('Error generating CSV:', error);
      toast.error('Failed to generate CSV file');
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-hidden flex flex-col h-full">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-[#008B8B]" />
            Export to CSV
          </SheetTitle>
          <SheetDescription>
            Select columns to include in your CSV export
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-grow my-6 pr-4">
          <div className="space-y-6">
            {/* Record Count Info */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">{studentCount} unique students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4" />
                    <span className="font-medium">{recordsToProcess.length} total records</span>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {/* Filename Configuration */}
            <div className="space-y-2">
              <Label htmlFor="filename">Export Filename</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="filename"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="Enter filename (without .csv extension)"
                />
                <span className="text-sm text-gray-500">.csv</span>
              </div>
            </div>

            <Separator />

            {/* Column Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Select Columns ({getSelectedColumnCount()} selected)</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowColumnSelector(!showColumnSelector)}
                  className="h-8"
                >
                  {showColumnSelector ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </div>

              {showColumnSelector && (
                <div className="border rounded-md p-4 space-y-4 bg-gray-50">
                  <div className="flex gap-2 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAllColumns(true)}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAllColumns(false)}
                    >
                      Deselect All
                    </Button>
                  </div>

                  {Object.entries(columnCategories).map(([category, columns]) => (
                    <div key={category} className="space-y-2">
                      <div 
                        className="font-medium text-sm flex items-center gap-2 cursor-pointer hover:text-[#008B8B]"
                        onClick={() => toggleCategory(category)}
                      >
                        <div className="w-4 h-4 border rounded flex items-center justify-center">
                          {columns.every(col => selectedColumns[col]) && <Check className="h-3 w-3" />}
                        </div>
                        {category} ({columns.filter(col => selectedColumns[col]).length}/{columns.length})
                      </div>
                      <div className="ml-6 grid grid-cols-2 gap-2">
                        {columns.map(column => (
                          <label key={column} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded text-sm">
                            <input
                              type="checkbox"
                              checked={selectedColumns[column] || false}
                              onChange={() => toggleColumn(column)}
                              className="rounded border-gray-300"
                            />
                            <span className="truncate" title={column}>{column}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {getSelectedColumnCount() === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please select at least one column for CSV export
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="flex-shrink-0 border-t pt-4">
          <Button
            onClick={handleGenerateCSV}
            disabled={getSelectedColumnCount() === 0}
            className="w-full bg-[#008B8B] hover:bg-[#20B2AA]"
          >
            <Download className="h-4 w-4 mr-2" />
            Export {recordsToProcess.length} Records to CSV
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CSVExportSheet;