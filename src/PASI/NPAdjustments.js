import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { ScrollArea, ScrollBar } from "../components/ui/scroll-area";
import { Checkbox } from "../components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "../components/ui/sheet";
import { 
  Search, 
  X, 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  ExternalLink, 
  CheckCircle, 
  Loader2,
  Info,
  AlertTriangle,
  Maximize2,
  Minimize2,
  Calendar,
  Filter,
  ClipboardCheck
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";

// Import database functionality
import { ref, update, get, onValue, off } from 'firebase/database';
import { database, auth } from '../firebase';

// Import term options and helpers
import { TERM_OPTIONS, getTermInfo, getStatusColor, COURSE_OPTIONS, getTermColor } from "../config/DropdownOptions";

// Import utility function to parse summary key
import { parseStudentSummaryKey } from "../utils/sanitizeEmail";

// Import the new Term Mapping Manager component
import TermMappingManager from './TermMappingManager';
// Import the new Configuration Manager component
import ConfigurationManager from './ConfigurationManager';

// For pagination
const ITEMS_PER_PAGE = 100;

// Function to check if yourWayTerm and pasiTerm are compatible
const checkTermCompatibility = (yourWayTerm, pasiTerm, termMappings) => {
  // If YourWay term is N/A, always return true (compatibility check not applicable)
  if (yourWayTerm === 'N/A') return true;
  
  // If either term is missing, they're not compatible
  if (!yourWayTerm || !pasiTerm) return false;
  
  // Check if this combination is in our mappings
  return termMappings[yourWayTerm] && 
         termMappings[yourWayTerm].includes(pasiTerm);
};

// Sortable header component
const SortableHeader = ({ column, label, currentSort, onSort, className }) => {
  const isActive = currentSort.column === column;
  
  return (
    <TableHead 
      className={`cursor-pointer hover:bg-muted/50 transition-colors ${className || ''}`}
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

// Helper function to check if a date value is valid and not empty
const isValidDateValue = (value) => {
  if (!value) return false;
  if (value === '-') return false;
  if (value === 'N/A') return false;
  if (value === '') return false;
  
  // If it's a timestamp that would result in an invalid date (like 0), it's not valid
  if (!isNaN(value) && new Date(parseInt(value)).getFullYear() < 1971) return false;
  
  return true;
};

// Helper function to check if a grade value is valid
const isValidGradeValue = (value) => {
  if (!value) return false;
  if (value === '-') return false;
  if (value === 'N/A') return false;
  if (value === '') return false;
  
  return true;
};

// Function to get startDate based on available fields
const getStartDate = (record) => {
  // First check createdAt
  if (record.createdAt && isValidDateValue(record.createdAt)) {
    return {
      value: record.createdAt,
      source: 'createdAt',
      formatted: typeof record.createdAt === 'string' && !isNaN(Date.parse(record.createdAt))
    };
  } 
  // Then check Created (with capital C)
  else if (record.Created && isValidDateValue(record.Created)) {
    return {
      value: record.Created,
      source: 'Created',
      formatted: false // ISO date string, not a timestamp
    };
  } 
  // Then check created (with lowercase c)
  else if (record.created && isValidDateValue(record.created)) {
    return {
      value: record.created,
      source: 'created',
      formatted: false // ISO date string, not a timestamp
    };
  } 
  // Finally check assignmentDate
  else if (record.assignmentDate && isValidDateValue(record.assignmentDate)) {
    return {
      value: record.assignmentDate,
      source: 'assignmentDate',
      formatted: true // Already formatted correctly
    };
  }
  
  return {
    value: null,
    source: null,
    formatted: false
  };
};

// Function to generate a consistent color for a student based on initials
const getColorForName = (firstName, lastName) => {
  if (!firstName || !lastName) return { backgroundColor: '#f3f4f6', textColor: '#374151' }; // Default gray for missing names
  
  // Get first characters and convert to uppercase
  const firstInitial = firstName.charAt(0).toUpperCase();
  const lastInitial = lastName.charAt(0).toUpperCase();
  
  // Convert to character codes and use for HSL values
  const firstCharCode = firstInitial.charCodeAt(0);
  const lastCharCode = lastInitial.charCodeAt(0);
  
  // Generate a hue value between 0 and 360 based on the initials
  // Use a formula that distributes colors nicely and avoids too similar colors
  const hue = ((firstCharCode * 11 + lastCharCode * 17) % 360);
  
  // Other HSL values for a consistent, readable palette
  const saturation = 85;  // Fairly saturated
  const lightness = 87;   // Light background for readability
  
  // Generate a darker version for text
  const textLightness = 30;
  
  // Return colors in HSL format
  return {
    backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    textColor: `hsl(${hue}, ${saturation}%, ${textLightness}%)`
  };
};

// Function to get name parts from a full name
const getNameParts = (fullName) => {
  if (!fullName) return { firstName: '', lastName: '' };
  
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  
  const lastName = parts.pop();
  const firstName = parts.join(' ');
  
  return { firstName, lastName };
};

// Format date for display
const formatDate = (dateValue, isFormatted = false) => {
  if (!isValidDateValue(dateValue)) return 'N/A';
  
  // If it's already formatted, return as is
  if (isFormatted && typeof dateValue === 'string') {
    return dateValue;
  }
  
  try {
    // Import from timeZoneUtils.js
    const { toEdmontonDate, toDateString } = require('../utils/timeZoneUtils');
    
    // Check if it's a numeric timestamp (as string or number)
    if (!isNaN(dateValue) && typeof dateValue !== 'object') {
      const date = toEdmontonDate(new Date(parseInt(dateValue)).toISOString());
      // Check if valid date
      if (!isNaN(date.getTime()) && date.getFullYear() >= 1971) {
        return toDateString(date);
      }
      return 'N/A';
    }
    
    // If it's a date object or ISO string
    const date = toEdmontonDate(dateValue);
    if (!isNaN(date.getTime()) && date.getFullYear() >= 1971) {
      return toDateString(date);
    }
    
    // Fallback for strings that may already be formatted
    if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateValue;
    }
    
    // Fallback
    return 'N/A';
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'N/A';
  }
};

// Format date for user-friendly display (e.g. "Jan 15, 2025")
const formatUserFriendlyDate = (dateValue, isFormatted = false) => {
  if (!isValidDateValue(dateValue)) return 'N/A';
  
  try {
    // Import from timeZoneUtils.js
    const { toEdmontonDate, formatDateForDisplay } = require('../utils/timeZoneUtils');
    
    // Get the standard formatted date first if needed
    let dateToFormat = dateValue;
    if (!isFormatted) {
      const isoDate = formatDate(dateValue, isFormatted);
      if (isoDate === 'N/A') return 'N/A';
      dateToFormat = isoDate;
    }
    
    // Use the Edmonton-specific date formatting
    const edmontonDate = toEdmontonDate(dateToFormat);
    if (!edmontonDate) return 'N/A';
    
    // Format date in Edmonton timezone
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return edmontonDate.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error("Error formatting user-friendly date:", error);
    return 'N/A';
  }
};

// Function to determine if a student belongs in Term 1 based on criteria
const isTerm1Student = (record, cutoffDate = '2025-01-30') => {
  // If the student doesn't have a completed status, they don't belong to any specific term yet
  if (record.status !== 'Completed') return false;
  
  // If there's no valid exit date, can't determine term
  if (!record.exitDate || !isValidDateValue(record.exitDate)) return false;
  
  try {
    const exitDate = new Date(record.exitDate);
    const configCutoffDate = new Date(cutoffDate);
    
    // If exit date is earlier than the cutoff date, it's Term 1
    return !isNaN(exitDate.getTime()) && exitDate < configCutoffDate;
  } catch (error) {
    console.error("Error parsing exit date:", error);
    return false;
  }
};

// Function to get shorter term label
const getShortTermLabel = (term) => {
  if (!term) return 'N/A';
  if (term === 'Term 1') return 'T1';
  if (term === 'Term 2') return 'T2';
  return term;
};

// New Table component to avoid duplication
const StudentRecordsTable = ({
  records,
  currentSort,
  onSort,
  updatingTermFor,
  updatingCheckedFor,
  termMappings,
  updateTerm,
  updateTermChecked,
  openPasiLink,
  openTeacherDashboard,
  handleCopyData,
  selectedRecordId,
  generateEmailColor, 
  isFullScreen = false,
  termCutoffDate
}) => {
  // Function to render the YourWay term dropdown
  const renderYourWayTerm = (record) => {
    const term = record.yourWayTerm;
    const isUpdating = updatingTermFor === record.id;
    const termInfo = getTermInfo(term);
    const backgroundColor = getTermColor(term);
    const Icon = termInfo.icon;
  
    // Use the pre-calculated isValidForSelect property from the record
    if (!record.isValidForSelect) {
      return <span className="text-gray-400">N/A</span>;
    }
  
    return (
      <div className="flex flex-col gap-2">
        {/* Term selection dropdown */}
        <div className="relative">
          <Select
            value={term || "N/A"}
            onValueChange={(newTerm) => updateTerm(record, newTerm)}
            disabled={isUpdating || !record.summaryKey}
          >
            <SelectTrigger 
              className="h-7 w-full text-xs min-w-[60px]"
              style={{ 
                backgroundColor: backgroundColor + '30', // Adding transparency
                borderColor: backgroundColor,
                color: backgroundColor
              }}
            >
              <div className="flex items-center gap-1">
                {Icon && <Icon className="h-3 w-3" />}
                <SelectValue placeholder="Change term" />
                {/* Use the pre-calculated termMismatch property from the record */}
                {record.termMismatch && <AlertTriangle className="h-3 w-3 text-amber-500 ml-auto" />}
              </div>
            </SelectTrigger>
            <SelectContent>
              {TERM_OPTIONS.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                >
                  <div className="flex items-center gap-2">
                    <span 
                      style={{ color: option.color }}
                      className="font-medium"
                    >
                      {getShortTermLabel(option.label)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
  
          {isUpdating && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
        </div>
      </div>
    );
  };

  // Function to render the PASI term with compatibility icons
  const renderPasiTerm = (record) => {
    const pasiTerm = record.pasiTerm;
    const yourWayTerm = record.yourWayTerm;
    const suggestedTerm = record.suggestedTerm;
    
    // If there's no PASI term, show N/A
    if (!pasiTerm) return <span className="text-gray-400">N/A</span>;
    
    // Get the short label for display
    const shortTerm = getShortTermLabel(pasiTerm);
    
    // Check if we have a valid course to evaluate
    const isValidCourse = COURSE_OPTIONS.some(opt => opt.pasiCode === record.courseCode);
    
    // Default to showing incompatible
    let isCompatible = false;
    
    // Handle missing term mappings
    if (!termMappings || Object.keys(termMappings).length === 0) {
      // If mappings aren't loaded yet, show a neutral state
      return (
        <div className="flex items-center gap-1" title="Term mappings not yet loaded">
          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
          <span className="font-medium text-gray-700 truncate">{shortTerm}</span>
        </div>
      );
    }
    
    if (suggestedTerm === 'Term 1') {
      // For Term 1, check if pasiTerm is in the allowed Term 1 pasiTerms array
      isCompatible = termMappings['Term 1'] && termMappings['Term 1'].includes(pasiTerm);
    } else if (suggestedTerm === 'Term 2') {
      // For Term 2, check if pasiTerm is in the allowed Term 2 pasiTerms array
      isCompatible = termMappings['Term 2'] && termMappings['Term 2'].includes(pasiTerm);
    }
    
    return (
      <div className="flex items-center gap-1" title={`PASI Term: ${pasiTerm}`}>
        {isCompatible ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        )}
        <span className={`font-medium ${isCompatible ? 'text-green-700' : 'text-amber-700'} truncate`}>
          {shortTerm}
        </span>
      </div>
    );
  };
  
  // Function to render the checked status checkbox with the user who checked it
  const renderCheckedStatus = (record) => {
    const isUpdating = updatingCheckedFor === record.id;
    const isChecked = record.termChecked || false;
    const checkedBy = record.checkedBy || null;
    
    return (
      <div className="flex items-center justify-center">
        {isUpdating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <div className="flex flex-col items-center space-y-1">
            {!isChecked && (
              <Checkbox
                checked={isChecked}
                onCheckedChange={(checked) => updateTermChecked(record, checked)}
              />
            )}
            {isChecked && checkedBy && (
              <div 
                className="text-xxs px-1 py-0.5 rounded-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[60px] cursor-pointer"
                title={`Checked by: ${checkedBy} (click to uncheck)`}
                style={(() => {
                  // Use the generateEmailColor function passed as prop
                  const colors = generateEmailColor(checkedBy);
                  return {
                    backgroundColor: colors.backgroundColor,
                    color: colors.textColor
                  };
                })()}
                onClick={() => updateTermChecked(record, false)}
              >
                {checkedBy.split('@')[0]}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  // Function to render the suggested term with improved logic
  const renderSuggestedTerm = (record) => {
    const suggestedTerm = record.suggestedTerm;
    const shortTerm = getShortTermLabel(suggestedTerm);
    const pasiTerm = record.pasiTerm;
    
    // Default to showing warning icon
    let isCorrect = false;
    
    // Check if we have a valid course to evaluate
    const isValidCourse = COURSE_OPTIONS.some(opt => opt.pasiCode === record.courseCode);
    
    // Handle missing term mappings
    if (!termMappings || Object.keys(termMappings).length === 0) {
      // If mappings aren't loaded yet, show a neutral state
      return (
        <div className="flex items-center gap-1" title="Term mappings not yet loaded">
          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
          <span className="font-medium text-gray-700 truncate">{shortTerm}</span>
        </div>
      );
    }
    
    if (suggestedTerm === 'Term 1') {
      // For Term 1, check if pasiTerm is in the allowed Term 1 pasiTerms array
      isCorrect = termMappings['Term 1'] && termMappings['Term 1'].includes(pasiTerm);
    } else if (suggestedTerm === 'Term 2') {
      // For Term 2, also check if pasiTerm is in the allowed Term 2 pasiTerms array
      isCorrect = termMappings['Term 2'] && termMappings['Term 2'].includes(pasiTerm);
    }
    
    return (
      <div className="flex items-center gap-1" title={`Suggested Term: ${suggestedTerm}`}>
        {isCorrect ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        )}
        <span className={`font-medium ${isCorrect ? 'text-green-700' : 'text-amber-700'} truncate`}>
          {shortTerm}
        </span>
      </div>
    );
  };

  // Function to render schedule start date with conditional coloring
  const renderScheduleStartDate = (record) => {
    // Get the formatted date
    const scheduleStartDate = record.scheduleStartDateFormatted;
    
    // Check if date is valid
    if (!scheduleStartDate || scheduleStartDate === 'N/A') {
      return <span className="text-gray-400">N/A</span>;
    }
    
    // Convert to date object for comparison with cutoff date
    const dateObj = new Date(scheduleStartDate);
    const cutoffDateObj = new Date(termCutoffDate);
    
    // Determine the color based on whether the date is before or after cutoff
    const isTerm1Date = dateObj < cutoffDateObj;
    
    // Style for the badge
    const badgeStyle = {
      backgroundColor: isTerm1Date ? '#e0f2fe' : '#f0fdf4', // blue-50 for term 1, green-50 for term 2
      color: isTerm1Date ? '#0369a1' : '#15803d' // blue-700 for term 1, green-700 for term 2
    };
    
    return (
      <div 
        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
        style={badgeStyle}
        title={`Schedule Start Date: ${scheduleStartDate} (${isTerm1Date ? 'Term 1' : 'Term 2'})`}
      >
        {formatUserFriendlyDate(scheduleStartDate)}
      </div>
    );
  };
  
  // Function to handle cell click for copying content
  const handleCellClick = (content, label) => {
    // Don't copy if there's no content or it's invalid
    if (!content || content === 'N/A') return;
    handleCopyData(content, label);
  };

  return (
    <div 
      className="relative overflow-x-auto border border-gray-300 rounded-lg" 
      style={{ 
        width: "100%", 
        ...(isFullScreen 
          ? { height: "calc(100vh - 140px)" } 
          : { maxHeight: "calc(100vh - 190px)", overflowY: "auto", scrollbarWidth: "auto" }),
        overflowY: "auto",
        scrollbarWidth: "auto",
        scrollbarColor: "rgba(155, 155, 155, 0.7) transparent"
      }}
    >
      <Table className="w-full table-fixed text-xs pr-4">
        <TableHeader sticky={true}>
          <TableRow>
            <SortableHeader 
              column="termChecked" 
              label={<ClipboardCheck className="h-4 w-4" />}
              currentSort={currentSort} 
              onSort={onSort}
              className="text-purple-700 bg-purple-50 w-[30px] p-1"
            />
            <SortableHeader 
              column="yourWayTerm" 
              label="YW Term" 
              currentSort={currentSort} 
              onSort={onSort}
              className="text-indigo-700 bg-indigo-50 w-[65px]"
            />
            <SortableHeader 
              column="pasiTerm" 
              label="PASI" 
              currentSort={currentSort} 
              onSort={onSort}
              className="text-amber-700 bg-amber-50 w-[50px]"
            />
            <SortableHeader 
              column="suggestedTerm" 
              label="Suggest" 
              currentSort={currentSort} 
              onSort={onSort}
              className="text-green-700 bg-green-50 w-[50px]"
            />
            <SortableHeader 
              column="studentName" 
              label="Student Name" 
              currentSort={currentSort} 
              onSort={onSort}
              className="w-[140px]"
            />
            <SortableHeader 
              column="asn" 
              label="ASN" 
              currentSort={currentSort} 
              onSort={onSort}
              className="w-[30px]"
            />
            <SortableHeader 
              column="courseCode" 
              label="Course" 
              currentSort={currentSort} 
              onSort={onSort}
              className="w-[60px]"
            />
            <SortableHeader 
              column="registeredDate" 
              label="Reg Date" 
              currentSort={currentSort} 
              onSort={onSort}
              className="text-purple-700 bg-purple-50 w-[75px]"
            />
            <SortableHeader 
              column="exitDate" 
              label="Exit Date" 
              currentSort={currentSort} 
              onSort={onSort}
              className="text-red-700 bg-red-50 w-[75px]"
            />
            <SortableHeader 
              column="scheduleStartDate" 
              label="Sched Start" 
              currentSort={currentSort} 
              onSort={onSort}
              className="text-teal-700 bg-teal-50 w-[75px]"
            />
            <SortableHeader 
              column="value" 
              label="Grade" 
              currentSort={currentSort} 
              onSort={onSort}
              className="w-[40px]"
            />
            <SortableHeader 
              column="status" 
              label="YW Status" 
              currentSort={currentSort} 
              onSort={onSort} 
              className="text-blue-700 bg-blue-50 w-[75px]"
            />
            <SortableHeader 
              column="pasiStatus" 
              label="PASI Status" 
              currentSort={currentSort} 
              onSort={onSort} 
              className="text-green-700 bg-green-50 w-[75px]"
            />
            <TableHead className="w-[90px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 ? (
            <TableRow>
              <TableCell colSpan={15} className="h-24 text-center">
                No matching records found.
              </TableCell>
            </TableRow>
          ) : (
            records.map((record) => {
              const isSelected = selectedRecordId === record.id;
              const missingDate = !record.hasValidStartDate;
              
              // Use the pre-calculated properties to determine if the row needs a term update
              const needsTermUpdate = !record.isCorrectTerm || record.termMismatch;
            
              return (
                <TableRow 
                  key={record.id}
                  className={
                    isSelected
                      ? "bg-blue-50 hover:bg-blue-100"
                      : needsTermUpdate
                        ? "bg-yellow-100 hover:bg-yellow-200"
                        : record.isCorrectTerm
                          ? record.termChecked
                            ? "bg-green-200 hover:bg-green-300" // Darker green for checked rows with no warnings
                            : "bg-green-100 hover:bg-green-200" // Light green for rows with no warnings
                          : "hover:bg-gray-50"
                  }
                  onClick={() => console.log(record)}
                >
                  <TableCell className="p-1 text-center" style={{ width: "30px" }}>
                    {renderCheckedStatus(record)}
                  </TableCell>
                  <TableCell className="p-1" style={{ width: "65px" }}>
                    {renderYourWayTerm(record)}
                  </TableCell>
                  <TableCell className="p-1" style={{ width: "50px" }}>
                    {renderPasiTerm(record)}
                  </TableCell>
                  <TableCell className="p-1" style={{ width: "50px" }}>
                    {renderSuggestedTerm(record)}
                  </TableCell>
                  <TableCell 
                    className="p-1 whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer" 
                    style={{ maxWidth: "140px !important" }}
                    onClick={() => handleCellClick(record.studentName, "Student Name")}
                  >
                    {(() => {
                      // Extract first and last name
                      const nameParts = getNameParts(record.studentName);
                      const { firstName, lastName } = nameParts;
                      
                      // Get colors based on initials
                      const { backgroundColor, textColor } = getColorForName(firstName, lastName);
                      
                      // Create styled pill
                      return (
                        <div 
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium max-w-full truncate"
                          style={{ 
                            backgroundColor, 
                            color: textColor
                          }}
                          title={record.studentName}
                        >
                          {record.studentName}
                        </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell 
                    className="p-1 cursor-pointer" 
                    style={{ width: "30px !important" }}
                    onClick={() => handleCellClick(record.asn, "ASN")}
                  >
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyData(record.asn, "ASN");
                        }}
                        title={isValidDateValue(record.asn) ? record.asn : 'N/A'}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell 
                    className="p-1 truncate cursor-pointer" 
                    style={{ width: "60px !important" }} 
                    title={record.courseCode}
                    onClick={() => handleCellClick(record.courseCode, "Course Code")}
                  >
                    {isValidDateValue(record.courseCode) ? record.courseCode : 'N/A'}
                  </TableCell>
                  <TableCell 
                    className="p-1 truncate cursor-pointer" 
                    style={{ width: "75px" }}
                    onClick={() => handleCellClick(record.startDateFormatted, "Registered Date")}
                  >
                    <span 
                      className={missingDate ? "text-amber-700 font-medium" : "text-purple-700"}
                      title={record.startDateFormatted}
                      data-original-format={record.startDateFormatted}
                    >
                      {record.startDateFormatted !== 'N/A' ? formatUserFriendlyDate(record.startDateFormatted) : 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell 
                    className="p-1 truncate cursor-pointer" 
                    style={{ width: "75px" }}
                    onClick={() => handleCellClick(record.exitDateFormatted, "Exit Date")}
                  >
                    <span 
                      className="text-red-700"
                      title={record.exitDateFormatted}
                      data-original-format={record.exitDateFormatted}
                    >
                      {record.exitDateFormatted !== 'N/A' ? formatUserFriendlyDate(record.exitDateFormatted) : 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell 
                    className="p-1 truncate cursor-pointer" 
                    style={{ width: "75px" }}
                    onClick={() => handleCellClick(record.scheduleStartDateFormatted, "Schedule Start Date")}
                  >
                    {renderScheduleStartDate(record)}
                  </TableCell>
                  <TableCell 
                    className="p-1 text-center cursor-pointer" 
                    style={{ width: "40px" }}
                    onClick={() => handleCellClick(record.value, "Grade")}
                  >
                    <span title={`Grade: ${isValidGradeValue(record.value) ? record.value : 'N/A'}`}>
                      {isValidGradeValue(record.value) ? record.value : 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell 
                    className="p-1 truncate cursor-pointer" 
                    style={{ width: "75px" }}
                    onClick={() => handleCellClick(record.statusValue, "YW Status")}
                  >
                    <span 
                      className={`font-medium ${
                        record.statusValue === 'N/A' ? 'text-gray-400' : ''
                      }`}
                      style={{ color: getStatusColor(record.statusValue) }}
                      title={record.statusValue || 'N/A'}
                    >
                      {COURSE_OPTIONS.some(opt => opt.pasiCode === record.courseCode) 
                        ? (record.statusValue || 'N/A')
                        : 'N/A'
                      }
                    </span>
                  </TableCell>
                  <TableCell 
                    className="p-1 truncate cursor-pointer" 
                    style={{ width: "75px" }}
                    onClick={() => handleCellClick(record.status, "PASI Status")}
                  >
                    <span 
                      className={`font-medium ${
                        record.status === 'Completed' ? 'text-green-700' : 'text-blue-700'
                      }`}
                      title={record.status || 'N/A'}
                    >
                      {record.status || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell className="p-1" style={{ width: "90px !important" }}>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => openPasiLink(record.asn)}
                        title="Open in PASI"
                        className="h-5 text-xs px-1"
                        disabled={!isValidDateValue(record.asn)}
                      >
                        PASI
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => openTeacherDashboard(record.asn)}
                        title="Open in Teacher Dashboard"
                        className="h-5 text-xs px-1"
                        disabled={!isValidDateValue(record.asn)}
                      >
                        YW
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

// Create a reusable SearchFilterBar component
const SearchFilterBar = ({ 
  searchTerm, 
  setSearchTerm, 
  hasActiveFilters, 
  setIsFilterOpen,
  isFilterOpen,
  exitDateStart,
  setExitDateStart,
  exitDateEnd,
  setExitDateEnd,
  termClassFilter,
  setTermClassFilter,
  checkedFilter,
  setCheckedFilter,
  courseCodeFilter,
  setCourseCodeFilter,
  clearFilters,
  clearSearch,
  enrichedRecords,
  isFullScreen,
  toggleFullScreen,
  termStats,
  generateEmailColor
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center space-x-2">
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
        
        {/* Filter button and popover */}
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant={hasActiveFilters ? "default" : "outline"}
              size="sm" 
              className="h-9"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge className="ml-2 bg-primary-foreground text-primary">
                  Active
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <div className="space-y-4">
              <h3 className="font-medium">Filter Options</h3>
              
              {/* Exit Date Range Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Exit Date Range:</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">From</label>
                    <Input
                      type="date"
                      value={exitDateStart}
                      onChange={(e) => setExitDateStart(e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">To</label>
                    <Input
                      type="date"
                      value={exitDateEnd}
                      onChange={(e) => setExitDateEnd(e.target.value)}
                      className="h-8"
                    />
                  </div>
                </div>
              </div>
              
              {/* Course Code Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Course Code:</label>
                <Select
                  value={courseCodeFilter}
                  onValueChange={setCourseCodeFilter}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Filter by course code" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {(() => {
                      // Get all distinct course codes from the enriched records
                      const distinctCourseCodes = Array.from(
                        new Set(
                          enrichedRecords
                            .map(record => record.courseCode)
                            .filter(Boolean) // Remove undefined/null values
                        )
                      ).sort();

                      // Return the SelectItem elements
                      return distinctCourseCodes.map(courseCode => (
                        <SelectItem key={courseCode} value={courseCode}>
                          {courseCode}
                        </SelectItem>
                      ));
                    })()}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Term Classification Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Term Classification:</label>
                <Select
                  value={termClassFilter}
                  onValueChange={setTermClassFilter}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Filter by term classification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="term1">Term 1 Students</SelectItem>
                    <SelectItem value="term2">Term 2 Students</SelectItem>
                    <SelectItem value="incorrect">Incorrect Term</SelectItem>
                    <SelectItem value="correct">Correct Term</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Checked Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Checked Status:</label>
                <Select
                  value={checkedFilter}
                  onValueChange={setCheckedFilter}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Filter by checked status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Records</SelectItem>
                    <SelectItem value="checked">Checked Records</SelectItem>
                    <SelectItem value="unchecked">Unchecked Records</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Clear Filters Button */}
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex items-center gap-2 flex-wrap justify-end">
        <Button 
          variant="outline" 
          size="sm"
          onClick={toggleFullScreen}
          className="h-8"
        >
          {isFullScreen ? (
            <>
              <Minimize2 className="h-4 w-4 mr-2" />
              Exit Full Screen
            </>
          ) : (
            <>
              <Maximize2 className="h-4 w-4 mr-2" />
              Full Screen
            </>
          )}
        </Button>
        <Badge variant="outline">
          {termStats.total} records
        </Badge>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          {termStats.term1} Term 1
        </Badge>
        <Badge variant="outline" className="bg-green-50 text-green-700">
          {termStats.term2} Term 2
        </Badge>
        <Badge variant="outline" className="bg-amber-50 text-amber-700">
          {termStats.incorrectTerm} incorrect term
        </Badge>
        <Popover>
          <PopoverTrigger asChild>
            <Badge variant="outline" className="bg-green-50 text-green-700 cursor-help">
              {termStats.checked} checked
            </Badge>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="text-xs font-semibold mb-1">Checked by user:</div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {Object.entries(termStats.checksByUser).sort((a, b) => b[1] - a[1]).map(([username, count]) => (
                <div key={username} className="flex justify-between items-center">
                  <span>{username}:</span>
                  <Badge variant="outline" size="sm">{count}</Badge>
                </div>
              ))}
              {Object.keys(termStats.checksByUser).length === 0 && (
                <div className="text-gray-500 italic text-xs">No checks yet</div>
              )}
            </div>
          </PopoverContent>
        </Popover>
        <Badge variant="outline" className="bg-amber-50 text-amber-700">
          {termStats.unchecked} unchecked
        </Badge>
        {(() => {
          // Get the current user's email
          const currentUser = auth.currentUser;
          const currentUserEmail = currentUser ? currentUser.email : "";
          
          // Generate color using the same function used for the user badge
          const colors = generateEmailColor(currentUserEmail);
          
          return (
            <Badge 
              variant="outline" 
              className="cursor-help"
              style={{
                backgroundColor: colors.backgroundColor,
                color: colors.textColor
              }}
            >
              {termStats.currentUserChecks} by me
            </Badge>
          );
        })()}
      </div>
    </div>
  );
};

// Create a reusable pagination component
const PaginationControls = ({ currentPage, totalPages, setCurrentPage }) => {
  if (totalPages <= 1) return null;

  return (
    <Pagination className="mt-2">
      <PaginationContent className="h-8">
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="h-8 min-w-8 px-2"
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
                  <span className="px-1">...</span>
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
                  <span className="px-1">...</span>
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
                  <span className="px-1">...</span>
                </PaginationItem>
              );
            } else if (i === 5) {
              return (
                <PaginationItem key="ellipsis-end">
                  <span className="px-1">...</span>
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
                className="h-8 w-8 p-0"
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
            className="h-8 min-w-8 px-2"
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

const NPAdjustments = ({ records = [] }) => {
  // State for search, pagination, and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortTerm, setSortState] = useState({ column: 'studentName', direction: 'asc' });
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [paginatedRecords, setPaginatedRecords] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  // State for external links
  const [pasiWindowRef, setPasiWindowRef] = useState(null);
  const [dashboardWindowRef, setDashboardWindowRef] = useState(null);
  
  // State for loading
  const [isLoading, setIsLoading] = useState(true);
  
  // State for selected record (for debugging)
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  
  // State for term update loading
  const [updatingTermFor, setUpdatingTermFor] = useState(null);
  
  // State for term mappings
  const [termMappings, setTermMappings] = useState({});
  
  // State for fullscreen mode
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // New state for date range filter
  const [exitDateStart, setExitDateStart] = useState('');
  const [exitDateEnd, setExitDateEnd] = useState('');
  
  // State for term classification filter
  const [termClassFilter, setTermClassFilter] = useState('all'); // 'all', 'term1', 'term2'
  
  // State for checked status filter
  const [checkedFilter, setCheckedFilter] = useState('all'); // 'all', 'checked', 'unchecked'
  
  // State for updating checked status
  const [updatingCheckedFor, setUpdatingCheckedFor] = useState(null);
  
  // State for filter popover
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // State for term cutoff date from configuration
  const [termCutoffDate, setTermCutoffDate] = useState('2025-01-30'); // Default date
  
  // State for filtering by course code
  const [courseCodeFilter, setCourseCodeFilter] = useState('all');
  
  // State for pasiRecordsCompanion data
  const [pasiRecordsCompanion, setPasiRecordsCompanion] = useState({});

  // Enrich records with startDate property and filter to only Non-Primary students
  const enrichedRecords = React.useMemo(() => {
    if (!records || records.length === 0) return [];
    
    // First filter to only include non-primary students
    const nonPrimaryRecords = records.filter(record => record.studentType === 'Non-Primary');
    
    const enriched = nonPrimaryRecords.map(record => {
      const startDateInfo = getStartDate(record);
      
      // Get formatted date for display and sorting
      const formattedDate = startDateInfo.formatted 
        ? startDateInfo.value 
        : formatDate(startDateInfo.value);
      
      // Format schedule start date if available  
      const scheduleStartDate = record.scheduleStartDate && record.scheduleStartDate !== '-' 
        ? formatDate(record.scheduleStartDate) 
        : 'N/A';
      
      // Format schedule end date if available
      const scheduleEndDate = record.scheduleEndDate && record.scheduleEndDate !== '-'
        ? formatDate(record.scheduleEndDate)
        : 'N/A';
      
      // Format exit date if available
      const exitDateFormatted = record.exitDate && record.exitDate !== '-'
        ? formatDate(record.exitDate)
        : 'N/A';
      
      // Check if the YourWay term is set to a valid term (not N/A)
      const hasValidYourWayTerm = record.yourWayTerm && record.yourWayTerm !== 'N/A';
      
      // Check if this is a valid course
      const isValidCourse = COURSE_OPTIONS.some(opt => opt.pasiCode === record.courseCode);

      // Determine if this is a Term 1 student using the configured cutoff date
      const isTerm1 = isTerm1Student(record, termCutoffDate);
      
      // Determine suggested term
      const suggestedTerm = isTerm1 ? 'Term 1' : 'Term 2';

      // Add isValidForSelect property to determine if dropdown should be shown
      const isValidForSelect = COURSE_OPTIONS.some(opt => opt.pasiCode === record.courseCode) && record.statusValue;
      
      // Add termMismatch property to check for mismatch between YW term and suggested term
      const termMismatch = isValidForSelect && record.yourWayTerm && suggestedTerm && 
                           record.yourWayTerm !== suggestedTerm;

      // Determine compatibility based on course validity
      let isTermCompatible = false;

      if (isValidCourse) {
        // For valid courses, directly compare PASI term with suggested term
        isTermCompatible = record.pasiTerm === suggestedTerm;
      } else {
        // For non-valid courses, use a fixed check with Term 1 mappings
        // This ensures changing yourWayTerm won't affect the display
        isTermCompatible = termMappings['Term 1'] && 
                          termMappings['Term 1'].includes(record.pasiTerm);
      }
      
      // Determine if this student's terms are correct
      let isCorrectTerm = false;

      if (suggestedTerm === 'Term 1') {
        // For Term 1, check if pasiTerm is in the allowed Term 1 pasiTerms array
        isCorrectTerm = termMappings['Term 1'] && termMappings['Term 1'].includes(record.pasiTerm);
      } else if (suggestedTerm === 'Term 2') {
        // For Term 2, also check if pasiTerm is in the allowed Term 2 pasiTerms array
        isCorrectTerm = termMappings['Term 2'] && termMappings['Term 2'].includes(record.pasiTerm);
      } else {
        // For other terms, consider correct if valid course
        isCorrectTerm = !isValidCourse;
      }

      // Get the checked status from pasiRecordsCompanion data if available
      const companionData = pasiRecordsCompanion[record.id];
      const termChecked = companionData && 
                          companionData.NPAdjustments && 
                          companionData.NPAdjustments.termChecked !== undefined ? 
                          companionData.NPAdjustments.termChecked : false;
      const checkedBy = companionData && 
                        companionData.NPAdjustments && 
                        companionData.NPAdjustments.checkedBy ? 
                        companionData.NPAdjustments.checkedBy : null;
      
      return {
        ...record,
        startDate: startDateInfo.value,
        startDateFormatted: formattedDate,
        startDateSource: startDateInfo.source,
        startDateIsPreFormatted: startDateInfo.formatted,
        hasValidStartDate: formattedDate !== 'N/A',
        scheduleStartDateFormatted: scheduleStartDate,
        scheduleEndDateFormatted: scheduleEndDate,
        exitDateFormatted: exitDateFormatted,
        hasValidYourWayTerm,
        isTermCompatible,
        isTerm1Student: isTerm1,
        suggestedTerm,
        isCorrectTerm,
        termChecked,
        isValidForSelect,
        termMismatch,
        checkedBy
      };
    });
    
    return enriched;
  }, [records, termMappings, termCutoffDate, pasiRecordsCompanion]);

  // Handler for when mappings change in the TermMappingManager
  const handleMappingsChange = useCallback((newMappings) => {
    setTermMappings(newMappings);
  }, []);
  
  // Set up realtime listeners for pasiRecordsCompanion data
  useEffect(() => {
    // Only set up listeners if we have records
    if (!records || records.length === 0) return;
    
    // Filter to get only non-primary record IDs to reduce data load
    const nonPrimaryRecordIds = records
      .filter(record => record.studentType === 'Non-Primary')
      .map(record => record.id)
      .filter(Boolean); // Filter out any undefined IDs
    
    if (nonPrimaryRecordIds.length === 0) return;
    
    // Create an object to store unsubscribe functions
    const unsubscribes = {};
    // Create a temporary object to store data
    const companionData = {};
    
    // Set up individual listeners for each record to improve performance
    nonPrimaryRecordIds.forEach(recordId => {
      const recordRef = ref(database, `/pasiRecordsCompanion/${recordId}`);
      
      const handleData = (snapshot) => {
        if (snapshot.exists()) {
          // Update our temp object with this record's data
          companionData[recordId] = snapshot.val();
          // Update the state with the latest data
          setPasiRecordsCompanion(prevData => ({
            ...prevData,
            [recordId]: snapshot.val()
          }));
        }
      };
      
      // Set up the listener and store the unsubscribe function
      unsubscribes[recordId] = onValue(recordRef, handleData);
    });
    
    // Clean up all listeners on unmount
    return () => {
      Object.values(unsubscribes).forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, [records]);

  // Function to generate a color based on user email
  const generateEmailColor = (email) => {
    if (!email) return { backgroundColor: '#f3f4f6', textColor: '#374151' }; // Default gray
    
    // Extract the username part (before @)
    const username = email.split('@')[0].toLowerCase();
    
    // Take first 4 characters or the entire username if shorter
    const colorSeed = username.substring(0, 4); 
    
    // Convert characters to numbers and calculate a hue value
    let hueValue = 0;
    for (let i = 0; i < colorSeed.length; i++) {
      hueValue += colorSeed.charCodeAt(i) * (i + 1);
    }
    
    // Create consistent hue (0-360)
    const hue = hueValue % 360;
    
    // Other HSL values for a consistent, readable palette
    const saturation = 85; // Fairly saturated
    const lightness = 87;  // Light background for readability
    const textLightness = 30; // Darker text for contrast
    
    return {
      backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
      textColor: `hsl(${hue}, ${saturation}%, ${textLightness}%)`
    };
  };

  // Function to update the checked status in Firebase
  const updateTermChecked = async (record, isChecked) => {
    if (!record || !record.id) {
      console.error("Cannot update checked status: Invalid record data");
      return;
    }
    
    // Set the record ID as updating
    setUpdatingCheckedFor(record.id);
    
    try {
      // Get current user email from Firebase Authentication
      const currentUser = auth.currentUser;
      const userEmail = currentUser ? currentUser.email : "unknown@user.com";
      
      // Update the termChecked field in pasiRecordsCompanion/{record.id}/NPAdjustments
      const dbPath = `/pasiRecordsCompanion/${record.id}/NPAdjustments`;
      
      await update(ref(database, dbPath), {
        termChecked: isChecked,
        checkedBy: isChecked ? userEmail : null // Store email when checked, remove when unchecked
      });
      
      // Toast removed - no notification when checkbox is toggled
    } catch (error) {
      console.error("Error updating checked status:", error);
      toast.error(`Failed to update checked status: ${error.message}`);
    } finally {
      // Clear the updating state
      setUpdatingCheckedFor(null);
    }
  };

  // Function to update the term in Firebase
  const updateTerm = async (record, newTerm) => {
    if (!record || !record.summaryKey) {
      toast.error("Cannot update term: Invalid record data");
      return;
    }
    
    // Set the record ID as updating
    setUpdatingTermFor(record.id);
    
    try {
      // Parse the summaryKey to get studentKey and courseId
      const { studentKey, courseId } = parseStudentSummaryKey(record.summaryKey);
      
      if (!studentKey || !courseId) {
        toast.error("Cannot update term: Invalid student key or course ID");
        setUpdatingTermFor(null);
        return;
      }
      
      // Path to update in the database
      const dbPath = `/students/${studentKey}/courses/${courseId}`;
      
      // Update the term
      await update(ref(database, dbPath), {
        Term: newTerm
      });
      
      toast.success(`Updated ${record.studentName}'s term to ${newTerm}`);
    } catch (error) {
      console.error("Error updating term:", error);
      toast.error(`Failed to update term: ${error.message}`);
    } finally {
      // Clear the updating state
      setUpdatingTermFor(null);
    }
  };

  // Filter data function with additional filters
  const filterData = (data, searchTerm, dateStart, dateEnd, termClass, checkedStatus, courseCode) => {
    // Apply search term filter
    let filtered = data;
    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase().trim();
      filtered = data.filter(record => {
        // Check various fields for the search term
        const studentName = (record.studentName || '').toLowerCase();
        const courseCode = (record.courseCode || '').toLowerCase();
        const courseDescription = (record.courseDescription || '').toLowerCase();
        const asn = (record.asn || '').toLowerCase();
        const email = (record.email || '').toLowerCase();
        const status = (record.statusValue || '').toLowerCase();
        const value = (record.value || '').toLowerCase();
        const pasiTerm = (record.pasiTerm || '').toLowerCase();
        const yourWayTerm = (record.yourWayTerm || '').toLowerCase();
        
        // Use the pre-formatted date for search
        const startDateStr = (record.startDateFormatted || '').toLowerCase();
        const scheduleStartDateStr = (record.scheduleStartDateFormatted || '').toLowerCase();
        const exitDateStr = (record.exitDateFormatted || '').toLowerCase();
        
        // Split name to check first and last name separately
        const nameParts = studentName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
        
        // Check if any field matches the search term
        return studentName.includes(lowerTerm) || 
               courseCode.includes(lowerTerm) || 
               courseDescription.includes(lowerTerm) ||
               asn.includes(lowerTerm) ||
               email.includes(lowerTerm) ||
               status.includes(lowerTerm) ||
               value.includes(lowerTerm) ||
               pasiTerm.includes(lowerTerm) ||
               yourWayTerm.includes(lowerTerm) ||
               startDateStr.includes(lowerTerm) ||
               scheduleStartDateStr.includes(lowerTerm) ||
               exitDateStr.includes(lowerTerm) ||
               firstName.includes(lowerTerm) || 
               lastName.includes(lowerTerm);
      });
    }
    
    // Apply course code filter
    if (courseCode && courseCode !== 'all') {
      filtered = filtered.filter(record => 
        record.courseCode === courseCode
      );
    }
    
    // Apply exit date range filter
    if (dateStart || dateEnd) {
      filtered = filtered.filter(record => {
        if (!record.exitDateFormatted || record.exitDateFormatted === 'N/A') {
          return false;
        }

        const exitDate = new Date(record.exitDateFormatted);

        if (isNaN(exitDate.getTime())) {
          return false;
        }

        if (dateStart) {
          const startDateFilter = new Date(dateStart);
          if (exitDate < startDateFilter) {
            return false;
          }
        }

        if (dateEnd) {
          const endDateFilter = new Date(dateEnd);
          if (exitDate >= endDateFilter) {
            return false;
          }
        }

        return true;
      });
    }
    
    // Apply term classification filter
    if (termClass !== 'all') {
      filtered = filtered.filter(record => {
        if (termClass === 'term1') {
          return record.isTerm1Student;
        } else if (termClass === 'term2') {
          return !record.isTerm1Student;
        } else if (termClass === 'incorrect') {
          return !record.isCorrectTerm;
        } else if (termClass === 'correct') {
          return record.isCorrectTerm;
        }
        return true;
      });
    }
    
    // Apply checked status filter
    if (checkedStatus !== 'all') {
      filtered = filtered.filter(record => {
        if (checkedStatus === 'checked') {
          return record.termChecked === true;
        } else if (checkedStatus === 'unchecked') {
          return record.termChecked !== true;
        }
        return true;
      });
    }
    
    return filtered;
  };

  // Sort data function
  const sortData = (data, column, direction) => {
    return [...data].sort((a, b) => {
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
        case 'value':
          aValue = a.value || '';
          bValue = b.value || '';
          // For numeric grades, convert to numbers for proper sorting
          if (!isNaN(aValue) && !isNaN(bValue)) {
            aValue = parseFloat(aValue);
            bValue = parseFloat(bValue);
          }
          break;
        case 'pasiTerm':
          aValue = a.pasiTerm || '';
          bValue = b.pasiTerm || '';
          break;
        case 'yourWayTerm':
          aValue = a.yourWayTerm || '';
          bValue = b.yourWayTerm || '';
          break;
        case 'termCompatibility':
          aValue = a.isTermCompatible ? 1 : 0;
          bValue = b.isTermCompatible ? 1 : 0;
          break;
        case 'registeredDate':
          // Use formatted date string for sorting
          aValue = a.startDateFormatted || '';
          bValue = b.startDateFormatted || '';
          break;
        case 'scheduleStartDate':
          aValue = a.scheduleStartDateFormatted || '';
          bValue = b.scheduleStartDateFormatted || '';
          break;
        case 'exitDate':
          aValue = a.exitDateFormatted || '';
          bValue = b.exitDateFormatted || '';
          break;
        case 'period':
          aValue = a.period || '';
          bValue = b.period || '';
          break;
        case 'asn':
          aValue = a.asn || '';
          bValue = b.asn || '';
          break;
        case 'termChecked':
          aValue = a.termChecked ? 1 : 0;
          bValue = b.termChecked ? 1 : 0;
          break;
        case 'suggestedTerm':
          aValue = a.suggestedTerm || '';
          bValue = b.suggestedTerm || '';
          break;
        default:
          aValue = a[column] || '';
          bValue = b[column] || '';
      }
      
      // Numeric comparison for numbers
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'asc' 
          ? (aValue - bValue) 
          : (bValue - aValue);
      }
      
      // String comparison for text values
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      // Fallback comparison
      return direction === 'asc' 
        ? (aValue > bValue ? 1 : -1) 
        : (aValue < bValue ? 1 : -1);
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
  
  // Clear filters function
  const clearFilters = () => {
    setExitDateStart('');
    setExitDateEnd('');
    setTermClassFilter('all');
    setCheckedFilter('all');
    setCourseCodeFilter('all');
    setIsFilterOpen(false);
  };

  // Toggle fullscreen function
  const toggleFullScreen = () => {
    setIsFullScreen(prev => !prev);
  };

  // Copy to clipboard functionality
  const handleCopyData = (text, label = '') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    const displayText = text.length > 25 ? `${text.substring(0, 25)}...` : text;
    toast.success(`Copied ${label ? label + ': ' : ''}${displayText}`);
  };

  // Open PASI link in a new window
  const openPasiLink = (asn) => {
    if (!asn) return;
    
    const asnWithoutDashes = asn.replace(/-/g, '');
    const url = `https://extranet.education.alberta.ca/PASI/PASIprep/view-student/${asnWithoutDashes}`;
    
    // If we already have a window reference, use it, otherwise create a new one
    if (pasiWindowRef && !pasiWindowRef.closed) {
      pasiWindowRef.location.href = url;
      pasiWindowRef.focus();
    } else {
      const newWindow = window.open(url, 'pasiWindow');
      setPasiWindowRef(newWindow);
    }
  };

  // Open teacher dashboard with ASN parameter
  const openTeacherDashboard = (asn) => {
    if (!asn) return;
    
    const url = `/teacher-dashboard?asn=${asn}`;
    
    // If we already have a window reference, use it, otherwise create a new one
    if (dashboardWindowRef && !dashboardWindowRef.closed) {
      dashboardWindowRef.location.href = url;
      dashboardWindowRef.focus();
    } else {
      const newWindow = window.open(url, 'dashboardWindow');
      setDashboardWindowRef(newWindow);
    }
  };

  // Filter, sort, and paginate records when data changes
  useEffect(() => {
    setIsLoading(true);
    
    if (!enrichedRecords || enrichedRecords.length === 0) {
      setFilteredRecords([]);
      setPaginatedRecords([]);
      setTotalPages(1);
      setIsLoading(false);
      return;
    }
    
    // Apply all filters
    const filtered = filterData(
      enrichedRecords, 
      searchTerm, 
      exitDateStart, 
      exitDateEnd, 
      termClassFilter, 
      checkedFilter,
      courseCodeFilter
    );
    
    setFilteredRecords(filtered);
    
    // Sort the filtered data
    const sorted = sortData(filtered, sortTerm.column, sortTerm.direction);
    
    // Calculate pagination
    const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE) || 1;
    setTotalPages(totalPages);
    
    // Ensure current page is valid
    const validPage = Math.min(currentPage, totalPages);
    if (validPage !== currentPage) {
      setCurrentPage(validPage);
    }
    
    // Get the paginated data slice
    const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaginatedRecords(sorted.slice(startIndex, endIndex));
    setIsLoading(false);
  }, [
    enrichedRecords, 
    searchTerm, 
    sortTerm, 
    currentPage, 
    exitDateStart, 
    exitDateEnd, 
    termClassFilter, 
    checkedFilter,
    courseCodeFilter
  ]);

  // Calculate term classification statistics
  const termStats = React.useMemo(() => {
    if (!filteredRecords || filteredRecords.length === 0) {
      return { 
        term1: 0, 
        term2: 0, 
        incorrectTerm: 0, 
        correctTerm: 0,
        checked: 0,
        unchecked: 0,
        total: 0,
        checksByUser: {},
        currentUserChecks: 0
      };
    }
    
    const term1 = filteredRecords.filter(record => record.isTerm1Student).length;
    const term2 = filteredRecords.filter(record => !record.isTerm1Student).length;
    const incorrectTerm = filteredRecords.filter(record => !record.isCorrectTerm).length;
    const correctTerm = filteredRecords.filter(record => record.isCorrectTerm).length;
    const checked = filteredRecords.filter(record => record.termChecked).length;
    const unchecked = filteredRecords.filter(record => !record.termChecked).length;
    
    // Get the current user's email
    const currentUser = auth.currentUser;
    const currentUserEmail = currentUser ? currentUser.email : "";
    
    // Count checks by user
    const checksByUser = {};
    let currentUserChecks = 0;
    
    filteredRecords.forEach(record => {
      if (record.termChecked && record.checkedBy) {
        // Increment the count for this user
        const username = record.checkedBy.split('@')[0];
        checksByUser[username] = (checksByUser[username] || 0) + 1;
        
        // Count checks by the current user
        if (record.checkedBy === currentUserEmail) {
          currentUserChecks++;
        }
      }
    });
    
    return { 
      term1, 
      term2, 
      incorrectTerm, 
      correctTerm,
      checked,
      unchecked,
      total: filteredRecords.length,
      checksByUser,
      currentUserChecks
    };
  }, [filteredRecords]);
  
  // Determine if any filters are active
  const hasActiveFilters = exitDateStart || exitDateEnd || termClassFilter !== 'all' || checkedFilter !== 'all' || courseCodeFilter !== 'all';

  return (
    <div className="space-y-4">
      {/* Informational message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-blue-800 flex items-center">
        <Info className="h-5 w-5 mr-2" />
        <span>This page displays all Non-Primary student records for the selected school year. Use the filters and term configuration options below to manage these records.</span>
      </div>

      {/* Accordion components in two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Term Mapping Manager component */}
        <div className="bg-gray-100 border border-gray-300 rounded-lg">
          <TermMappingManager onMappingsChange={handleMappingsChange} />
        </div>
        
        {/* Configuration Manager component */}
        <div className="bg-gray-100 border border-gray-300 rounded-lg">
          <ConfigurationManager onCutoffDateChange={setTermCutoffDate} />
        </div>
      </div>
      
      {/* Search bar, filters, and statistics */}
      <SearchFilterBar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        hasActiveFilters={hasActiveFilters}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        exitDateStart={exitDateStart}
        setExitDateStart={setExitDateStart}
        exitDateEnd={exitDateEnd}
        setExitDateEnd={setExitDateEnd}
        termClassFilter={termClassFilter}
        setTermClassFilter={setTermClassFilter}
        checkedFilter={checkedFilter}
        setCheckedFilter={setCheckedFilter}
        courseCodeFilter={courseCodeFilter}
        setCourseCodeFilter={setCourseCodeFilter}
        clearFilters={clearFilters}
        clearSearch={clearSearch}
        enrichedRecords={enrichedRecords}
        isFullScreen={isFullScreen}
        toggleFullScreen={toggleFullScreen}
        termStats={termStats}
        generateEmailColor={generateEmailColor}
      />

      {/* Records table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Loading records...</p>
              </div>
            </div>
          ) : (
            <StudentRecordsTable 
  records={paginatedRecords}
  currentSort={sortTerm}
  onSort={handleSort}
  updatingTermFor={updatingTermFor}
  updatingCheckedFor={updatingCheckedFor}
  termMappings={termMappings}
  updateTerm={updateTerm}
  updateTermChecked={updateTermChecked}
  openPasiLink={openPasiLink}
  openTeacherDashboard={openTeacherDashboard}
  handleCopyData={handleCopyData}
  selectedRecordId={selectedRecordId}
  generateEmailColor={generateEmailColor}
  isFullScreen={isFullScreen}
  termCutoffDate={termCutoffDate}
/>
          )}
        </CardContent>
      </Card>

      {/* Pagination controls */}
      <PaginationControls 
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />

      {/* Fullscreen mode */}
      <Sheet open={isFullScreen} onOpenChange={setIsFullScreen}>
      <SheetContent 
  className="w-[100vw] sm:w-[100vw] flex flex-col sheet-no-footer" 
  size="full"
>
          <div className="space-y-4">
            {/* Search bar, filters, and statistics for fullscreen mode */}
            <SearchFilterBar 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              hasActiveFilters={hasActiveFilters}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              exitDateStart={exitDateStart}
              setExitDateStart={setExitDateStart}
              exitDateEnd={exitDateEnd}
              setExitDateEnd={setExitDateEnd}
              termClassFilter={termClassFilter}
              setTermClassFilter={setTermClassFilter}
              checkedFilter={checkedFilter}
              setCheckedFilter={setCheckedFilter}
              courseCodeFilter={courseCodeFilter}
              setCourseCodeFilter={setCourseCodeFilter}
              clearFilters={clearFilters}
              clearSearch={clearSearch}
              enrichedRecords={enrichedRecords}
              isFullScreen={isFullScreen}
              toggleFullScreen={toggleFullScreen}
              termStats={termStats}
              generateEmailColor={generateEmailColor}
            />
            
          {/* Records table for fullscreen mode */}
{isLoading ? (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
      <p className="text-sm text-muted-foreground">Loading records...</p>
    </div>
  </div>
) : (
  <StudentRecordsTable 
    records={paginatedRecords}
    currentSort={sortTerm}
    onSort={handleSort}
    updatingTermFor={updatingTermFor}
    updatingCheckedFor={updatingCheckedFor}
    termMappings={termMappings}
    updateTerm={updateTerm}
    updateTermChecked={updateTermChecked}
    openPasiLink={openPasiLink}
    openTeacherDashboard={openTeacherDashboard}
    handleCopyData={handleCopyData}
    selectedRecordId={selectedRecordId}
    generateEmailColor={generateEmailColor} // Add this line
    isFullScreen={true}
  />
)}
            
            {/* Pagination controls for fullscreen mode */}
            <PaginationControls 
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default NPAdjustments;