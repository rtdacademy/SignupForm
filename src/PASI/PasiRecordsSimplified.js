import React, { useState, useMemo, useEffect } from 'react';
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../components/ui/table";
import { 
  Loader2, 
  Search, 
  X,
  Link2,
  AlertTriangle,
  FileText,
  Database,
  Edit,
  Info,
  HelpCircle,
  BellRing,
  Wrench,
  Plus,
  Filter,
  Trash2,
  Settings,
  Star,
  Flag,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Target,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  UserCheck,
  UserX,
  Bookmark,
  Heart,
  Zap,
  Shield,
  Award,
  Bell,
  Bug,
  CheckSquare,
  RefreshCw,
  Activity,
  UserPlus,
  GripVertical,
  List,
  FileDown,
  FileSpreadsheet,
  BarChart3
} from 'lucide-react';
import { useSchoolYear } from '../context/SchoolYearContext';
import { useAuth } from '../context/AuthContext';
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../components/ui/sheet";
import PasiActionButtons from "../components/PasiActionButtons";
import PasiRecordDetails from "../TeacherDashboard/PasiRecordDetails";
import PDFGenerationSheet from "./PDFGenerationSheet";
import CSVExportSheet from "./CSVExportSheet";
import { toast } from 'sonner';
import { getDatabase, ref, push, onValue, off, remove, update } from 'firebase/database';
import { getStudentTypeInfo, getActiveFutureArchivedColor, getPaymentStatusColor } from '../config/DropdownOptions';

const ITEMS_PER_PAGE = 100;

// Available icons for custom views
const AVAILABLE_ICONS = [
  { value: 'filter', label: 'Filter', component: Filter },
  { value: 'star', label: 'Star', component: Star },
  { value: 'flag', label: 'Flag', component: Flag },
  { value: 'alertTriangle', label: 'Alert Triangle', component: AlertTriangle },
  { value: 'alertCircle', label: 'Alert Circle', component: AlertCircle },
  { value: 'bell', label: 'Bell', component: Bell },
  { value: 'bellRing', label: 'Bell Ring', component: BellRing },
  { value: 'clock', label: 'Clock', component: Clock },
  { value: 'checkCircle', label: 'Check Circle', component: CheckCircle },
  { value: 'checkSquare', label: 'Check Square', component: CheckSquare },
  { value: 'xCircle', label: 'X Circle', component: XCircle },
  { value: 'eye', label: 'Eye', component: Eye },
  { value: 'target', label: 'Target', component: Target },
  { value: 'trendingUp', label: 'Trending Up', component: TrendingUp },
  { value: 'trendingDown', label: 'Trending Down', component: TrendingDown },
  { value: 'calendar', label: 'Calendar', component: Calendar },
  { value: 'users', label: 'Users', component: Users },
  { value: 'userCheck', label: 'User Check', component: UserCheck },
  { value: 'userX', label: 'User X', component: UserX },
  { value: 'bookmark', label: 'Bookmark', component: Bookmark },
  { value: 'heart', label: 'Heart', component: Heart },
  { value: 'zap', label: 'Zap', component: Zap },
  { value: 'shield', label: 'Shield', component: Shield },
  { value: 'award', label: 'Award', component: Award },
  { value: 'bug', label: 'Bug', component: Bug },
  { value: 'refreshCw', label: 'Refresh', component: RefreshCw },
  { value: 'activity', label: 'Activity', component: Activity },
  { value: 'info', label: 'Info', component: Info },
  { value: 'helpCircle', label: 'Help Circle', component: HelpCircle }
];

// Available colors for custom view tabs
const AVAILABLE_COLORS = [
  { value: 'blue', label: 'Blue', className: 'bg-blue-500 border-blue-600 text-white hover:bg-blue-600' },
  { value: 'green', label: 'Green', className: 'bg-green-500 border-green-600 text-white hover:bg-green-600' },
  { value: 'purple', label: 'Purple', className: 'bg-purple-500 border-purple-600 text-white hover:bg-purple-600' },
  { value: 'red', label: 'Red', className: 'bg-red-500 border-red-600 text-white hover:bg-red-600' },
  { value: 'orange', label: 'Orange', className: 'bg-orange-500 border-orange-600 text-white hover:bg-orange-600' },
  { value: 'pink', label: 'Pink', className: 'bg-pink-500 border-pink-600 text-white hover:bg-pink-600' },
  { value: 'indigo', label: 'Indigo', className: 'bg-indigo-500 border-indigo-600 text-white hover:bg-indigo-600' },
  { value: 'teal', label: 'Teal', className: 'bg-teal-500 border-teal-600 text-white hover:bg-teal-600' },
  { value: 'cyan', label: 'Cyan', className: 'bg-cyan-500 border-cyan-600 text-white hover:bg-cyan-600' },
  { value: 'yellow', label: 'Yellow', className: 'bg-yellow-500 border-yellow-600 text-black hover:bg-yellow-600' },
  { value: 'gray', label: 'Gray', className: 'bg-gray-500 border-gray-600 text-white hover:bg-gray-600' },
  { value: 'slate', label: 'Slate', className: 'bg-slate-500 border-slate-600 text-white hover:bg-slate-600' }
];

// Field definitions for filtering - Common fields only
const FILTERABLE_FIELDS = {
  // State and Status
  ActiveFutureArchived_Value: { label: 'State', type: 'text' },
  StudentType_Value: { label: 'Student Type', type: 'text' },
  Status_Value: { label: 'YourWay Status', type: 'text' },
  status: { label: 'PASI Status', type: 'text' },
  workItems: { label: 'Work Items', type: 'text' },

  // School Year and Terms
  School_x0020_Year_Value: { label: 'School Year', type: 'text' },
  pasiTerm: { label: 'PASI Term', type: 'text' },

  // Course Information
  courseCode: { label: 'Course Code', type: 'text' },

  // Student Demographics
  age: { label: 'Age', type: 'number' },
  gender: { label: 'Gender', type: 'text' },

  // Important Dates
  entryDate: { label: 'Entry Date', type: 'date' },
  exitDate: { label: 'Exit Date', type: 'date' },
  resumingOnDate: { label: 'Resuming On Date', type: 'date' },
  startDate: { label: 'Start Date', type: 'date' },
  
  // Special Fields
  current_date: { label: 'Today\'s Date', type: 'current_date' },
  'student.categories': { label: 'Student Categories', type: 'categories' },
  
  // Payment Information
  payment_status: { label: 'Payment Status', type: 'text' }
};

// Full field definitions for advanced users (can be enabled later)
const ALL_FILTERABLE_FIELDS = {
  // Basic Student Info
  firstName: { label: 'First Name', type: 'text' },
  lastName: { label: 'Last Name', type: 'text' },
  studentName: { label: 'Student Name', type: 'text' },
  asn: { label: 'ASN', type: 'text' },
  studentEmail: { label: 'Student Email', type: 'text' },
  preferredFirstName: { label: 'Preferred First Name', type: 'text' },
  age: { label: 'Age', type: 'number' },
  gender: { label: 'Gender', type: 'text' },
  birthday: { label: 'Birthday', type: 'date' },

  // Course Info
  courseCode: { label: 'Course Code', type: 'text' },
  courseDescription: { label: 'Course Description', type: 'text' },
  Course_Value: { label: 'Course Value', type: 'text' },
  CourseID: { label: 'Course ID', type: 'number' },
  creditsAttempted: { label: 'Credits Attempted', type: 'text' },
  period: { label: 'Period', type: 'text' },
  pasiTerm: { label: 'PASI Term', type: 'text' },
  Term: { label: 'Term', type: 'text' },

  // Status & Progress
  status: { label: 'PASI Status', type: 'text' },
  Status_Value: { label: 'YourWay Status', type: 'text' },
  ActiveFutureArchived_Value: { label: 'State', type: 'text' },
  PercentCompleteGradebook: { label: 'Percent Complete Gradebook', type: 'number' },
  PercentScheduleComplete: { label: 'Percent Schedule Complete', type: 'number' },
  grade: { label: 'Grade', type: 'number' },
  StatusCompare: { label: 'Status Compare', type: 'text' },

  // Dates
  Created: { label: 'Created Date', type: 'date' },
  entryDate: { label: 'Entry Date', type: 'date' },
  exitDate: { label: 'Exit Date', type: 'date' },
  assignmentDate: { label: 'Assignment Date', type: 'date' },
  startDate: { label: 'Start Date', type: 'date' },
  resumingOnDate: { label: 'Resuming On Date', type: 'date' },
  ScheduleStartDate: { label: 'Schedule Start Date', type: 'date' },
  ScheduleEndDate: { label: 'Schedule End Date', type: 'date' },

  // Contact Info
  ParentEmail: { label: 'Parent Email', type: 'text' },
  ParentFirstName: { label: 'Parent First Name', type: 'text' },
  ParentLastName: { label: 'Parent Last Name', type: 'text' },
  ParentPhone_x0023_: { label: 'Parent Phone', type: 'text' },
  StudentPhone: { label: 'Student Phone', type: 'text' },

  // Academic/Administrative
  StudentType_Value: { label: 'Student Type', type: 'text' },
  school: { label: 'School', type: 'text' },
  schoolYear: { label: 'School Year', type: 'text' },
  School_x0020_Year_Value: { label: 'School Year Value', type: 'text' },
  referenceNumber: { label: 'Reference Number', type: 'text' },
  workItems: { label: 'Work Items', type: 'text' },
  recordType: { label: 'Record Type', type: 'text' },
  displayStudentType: { label: 'Display Student Type', type: 'text' },
  LMSStudentID: { label: 'LMS Student ID', type: 'text' },

  // Boolean/Status Fields
  approved: { label: 'Approved', type: 'text' },
  deleted: { label: 'Deleted', type: 'text' },
  fundingRequested: { label: 'Funding Requested', type: 'text' },
  dualEnrolment: { label: 'Dual Enrolment', type: 'text' },
  hasStudentKey: { label: 'Has Student Key', type: 'boolean' },
  autoStatus: { label: 'Auto Status', type: 'boolean' },
  hasSchedule: { label: 'Has Schedule', type: 'boolean' },
  instructionalMinutesReceived: { label: 'Instructional Minutes Received', type: 'text' },
  
  // Special Fields
  current_date: { label: 'Current Date', type: 'current_date' },
  'student.categories': { label: 'Student Categories', type: 'categories' }
};

// Operator definitions
const OPERATORS = {
  text: [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does Not Contain' },
    { value: 'starts_with', label: 'Starts With' },
    { value: 'ends_with', label: 'Ends With' },
    { value: 'is_empty', label: 'Is Empty' },
    { value: 'is_not_empty', label: 'Is Not Empty' }
  ],
  // Special operators for courseCode field when groupByASN is enabled
  courseCode_aggregate: [
    { value: 'student_has_course', label: 'Student Has Course' },
    { value: 'student_does_not_have_course', label: 'Student Does Not Have Course' },
    { value: 'student_has_any_of_courses', label: 'Student Has Any of These Courses' },
    { value: 'student_has_all_courses', label: 'Student Has All of These Courses' },
    { value: 'student_has_none_of_courses', label: 'Student Has None of These Courses' }
  ],
  number: [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'greater_than_equal', label: 'Greater Than or Equal' },
    { value: 'less_than_equal', label: 'Less Than or Equal' },
    { value: 'is_empty', label: 'Is Empty' },
    { value: 'is_not_empty', label: 'Is Not Empty' }
  ],
  date: [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'before', label: 'Before' },
    { value: 'after', label: 'After' },
    { value: 'is_empty', label: 'Is Empty' },
    { value: 'is_not_empty', label: 'Is Not Empty' }
  ],
  boolean: [
    { value: 'is_true', label: 'Is True' },
    { value: 'is_false', label: 'Is False' },
    { value: 'exists', label: 'Exists' },
    { value: 'not_exists', label: 'Does Not Exist' }
  ],
  categories: [
    { value: 'has_category', label: 'Has Category' },
    { value: 'does_not_have_category', label: 'Does Not Have Category' },
    { value: 'has_any_of_categories', label: 'Has Any of These Categories' },
    { value: 'has_all_categories', label: 'Has All of These Categories' },
    { value: 'has_none_of_categories', label: 'Has None of These Categories' },
    { value: 'is_empty', label: 'Has No Categories' },
    { value: 'is_not_empty', label: 'Has Categories' }
  ],
  current_date: [
    { value: 'month_is_one_of', label: 'Current Month Is One Of' },
    { value: 'month_is_not_one_of', label: 'Current Month Is Not One Of' },
    { value: 'month_equals', label: 'Current Month Equals' },
    { value: 'month_not_equals', label: 'Current Month Does Not Equal' },
    { value: 'day_of_month_equals', label: 'Current Day Of Month Equals' },
    { value: 'day_of_month_greater_than', label: 'Current Day Of Month Greater Than' },
    { value: 'day_of_month_less_than', label: 'Current Day Of Month Less Than' },
    { value: 'year_equals', label: 'Current Year Equals' },
    { value: 'weekday_is_one_of', label: 'Current Weekday Is One Of' }
  ]
};

// Base data sources for custom views
const BASE_DATA_SOURCES = [
  { value: 'linked', label: 'Linked Records' },
  { value: 'summaryOnly', label: 'YourWay Only Records' },
  { value: 'pasiOnly', label: 'PASI Only Records' },
  { value: 'linkedAndPasiOnly', label: 'Linked & PASI Only Records' },
  { value: 'allPasi', label: 'All PASI Records' },
  { value: 'allYourWay', label: 'All YourWay Records' }
];

// Options for current_date field dropdowns
const MONTH_OPTIONS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' }
];

const WEEKDAY_OPTIONS = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' }
];

const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1)
}));

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

// Utility functions for responsive content display
const useResponsiveBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState('lg');
  
  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint('sm');
      else if (width < 768) setBreakpoint('md');
      else if (width < 1024) setBreakpoint('lg');
      else setBreakpoint('xl');
    };
    
    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);
  
  return breakpoint;
};

// Format dates for responsive display
const formatDateResponsive = (date, breakpoint = 'lg') => {
  if (!isValidDateValue(date)) return 'N/A';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return 'N/A';
  
  switch (breakpoint) {
    case 'sm':
      return dateObj.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
    case 'md':
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    default:
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
  }
};

// Format student names for responsive display
const formatNameResponsive = (firstName, lastName, studentName, breakpoint = 'lg') => {
  const fullName = `${firstName || ''} ${lastName || ''}`.trim();
  
  if (breakpoint === 'sm' && firstName && lastName) {
    return `${firstName.charAt(0)}. ${lastName}`;
  }
  
  // If no first/last name, fall back to studentName
  return fullName || studentName || 'N/A';
};

// Format course codes for responsive display
const formatCourseResponsive = (courseCode, courseValue, breakpoint = 'lg') => {
  const course = courseCode || courseValue;
  if (!course) return 'N/A';
  
  if (breakpoint === 'sm' && course.length > 8) {
    return course.substring(0, 6) + '..';
  }
  
  return course;
};

// Format status for responsive display with symbols
const formatStatusResponsive = (status, breakpoint = 'lg') => {
  if (!status || status === 'N/A') return 'N/A';
  
  if (breakpoint === 'sm') {
    const statusMap = {
      'Active': '🟢',
      'Completed': '✅',
      'Withdrawn': '❌',
      'Enrolled': '📝',
      'In Progress': '⏳',
      'Pending': '⏸️',
      'Approved': '✓',
      'Archived': '📦'
    };
    return statusMap[status] || status.charAt(0);
  }
  
  return status;
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

// Helper function to determine if PASI columns should be shown
const shouldShowPasiColumns = (activeTab, customViews) => {
  const currentView = customViews.find(view => view.id === activeTab);
  const baseDataSource = currentView?.baseDataSource || activeTab;
  
  // Hide PASI columns for YourWay-only data sources
  return baseDataSource !== 'summaryOnly' && baseDataSource !== 'allYourWay';
};

// Function to generate a consistent color for a student based on initials
const getColorForName = (fullName) => {
  if (!fullName) return { backgroundColor: '#f3f4f6', textColor: '#374151' }; // Default gray
  
  // Extract first and last name
  const nameParts = fullName.split(', ');
  const lastName = nameParts[0] || '';
  const firstName = nameParts.length > 1 ? nameParts[1] : '';
  
  // Get first characters and convert to uppercase
  const firstInitial = firstName.charAt(0).toUpperCase();
  const lastInitial = lastName.charAt(0).toUpperCase();
  
  // Convert to character codes and use for HSL values
  const firstCharCode = firstInitial.charCodeAt(0);
  const lastCharCode = lastInitial.charCodeAt(0);
  
  // Generate a hue value between 0 and 360 based on the initials
  const hue = ((firstCharCode * 11 + lastCharCode * 17) % 360);
  
  // Other HSL values for a consistent, readable palette
  const saturation = 85;  // Fairly saturated
  const lightness = 87;   // Light background for readability
  const textLightness = 30;   // Darker text for contrast
  
  return {
    backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    textColor: `hsl(${hue}, ${saturation}%, ${textLightness}%)`
  };
};

// Function to generate a consistent color for a student based on ASN
const getColorForASN = (asn) => {
  if (!asn) return { backgroundColor: '#f3f4f6', textColor: '#374151' }; // Default gray
  
  // Convert ASN to a string for consistent hashing
  const asnString = String(asn);
  
  // Use a simple hash function to convert ASN to a number
  let hash = 0;
  for (let i = 0; i < asnString.length; i++) {
    const char = asnString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Generate a hue value between 0 and 360 with better distribution
  const hue = Math.abs(hash) % 360;
  
  // Use higher saturation and contrast for more distinct colors
  const saturation = 85;  // Higher saturation for more vibrant colors
  const lightness = 88;   // Light background for readability
  const textLightness = 20;   // Darker text for contrast
  
  return {
    backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    textColor: `hsl(${hue}, ${saturation}%, ${textLightness}%)`
  };
};

// Helper function to get icon component
const getIconComponent = (iconValue) => {
  if (!iconValue) return null;
  const iconData = AVAILABLE_ICONS.find(icon => icon.value === iconValue);
  return iconData ? iconData.component : null;
};

// Helper function to get color class name
const getColorClassName = (colorValue, isActive = false) => {
  if (!colorValue) return '';
  const colorData = AVAILABLE_COLORS.find(color => color.value === colorValue);
  if (!colorData) return '';
  
  if (isActive) {
    return colorData.className;
  } else {
    // For inactive state, use a lighter version
    const baseColor = colorData.className.split(' ')[0]; // e.g., 'bg-blue-500'
    const colorName = baseColor.split('-')[1]; // e.g., 'blue'
    if (colorName === 'yellow') {
      return `bg-${colorName}-100 border-${colorName}-300 text-${colorName}-800 hover:bg-${colorName}-200`;
    }
    return `bg-${colorName}-100 border-${colorName}-300 text-${colorName}-700 hover:bg-${colorName}-200`;
  }
};

// Separate modal component for better performance
const CustomViewModal = ({ 
  isOpen, 
  onClose, 
  editingView, 
  onSave,
  onDelete,
  baseDataSources = BASE_DATA_SOURCES,
  filterableFields = FILTERABLE_FIELDS,
  operators = OPERATORS,
  teacherCategories = {}
}) => {
  // Local form state isolated to this component
  const [localFormState, setLocalFormState] = useState({
    newViewName: '',
    newViewDescription: '',
    newViewIcon: 'filter',
    newViewColor: 'blue',
    newViewBaseSource: 'linked',
    newViewGroupByASN: false,
    newViewConditions: {
      groups: [
        {
          id: 'group-1',
          conditions: [{ field: '', operator: '', value: '', logicOperator: 'AND' }],
          internalLogic: 'AND'
        }
      ],
      groupLogic: 'AND'
    }
  });

  const [showAdvancedFields, setShowAdvancedFields] = useState(false);

  // Reset form when modal opens/closes or editingView changes
  useEffect(() => {
    if (isOpen) {
      // Reset advanced fields toggle when modal opens
      setShowAdvancedFields(false);
      
      if (editingView) {
        // Handle both legacy and new formats
        let conditions;
        if (Array.isArray(editingView.conditions)) {
          conditions = {
            groups: [
              {
                id: 'group-1',
                conditions: editingView.conditions.length > 0 ? editingView.conditions : [{ field: '', operator: '', value: '', logicOperator: 'AND' }],
                internalLogic: 'AND'
              }
            ],
            groupLogic: 'AND'
          };
        } else {
          conditions = editingView.conditions || {
            groups: [
              {
                id: 'group-1',
                conditions: [{ field: '', operator: '', value: '', logicOperator: 'AND' }],
                internalLogic: 'AND'
              }
            ],
            groupLogic: 'AND'
          };
        }
        
        setLocalFormState({
          newViewName: editingView.name,
          newViewDescription: editingView.description || '',
          newViewIcon: editingView.icon || 'filter',
          newViewColor: editingView.color || 'blue',
          newViewBaseSource: editingView.baseDataSource,
          newViewGroupByASN: editingView.groupByASN || false,
          newViewConditions: conditions
        });
      } else {
        // Reset for new view
        setLocalFormState({
          newViewName: '',
          newViewDescription: '',
          newViewIcon: 'filter',
          newViewColor: 'blue',
          newViewBaseSource: 'linked',
          newViewGroupByASN: false,
          newViewConditions: {
            groups: [
              {
                id: 'group-1',
                conditions: [{ field: '', operator: '', value: '', logicOperator: 'AND' }],
                internalLogic: 'AND'
              }
            ],
            groupLogic: 'AND'
          }
        });
        setShowAdvancedFields(false);
      }
    }
  }, [isOpen, editingView]);

  // Group management functions
  const addGroup = () => {
    const newGroupId = `group-${Date.now()}`;
    setLocalFormState(prev => ({
      ...prev,
      newViewConditions: {
        ...prev.newViewConditions,
        groups: [
          ...prev.newViewConditions.groups,
          {
            id: newGroupId,
            conditions: [{ field: '', operator: '', value: '', logicOperator: 'AND' }],
            internalLogic: 'AND'
          }
        ]
      }
    }));
  };

  const removeGroup = (groupId) => {
    if (localFormState.newViewConditions.groups.length > 1) {
      setLocalFormState(prev => ({
        ...prev,
        newViewConditions: {
          ...prev.newViewConditions,
          groups: prev.newViewConditions.groups.filter(group => group.id !== groupId)
        }
      }));
    }
  };

  const updateGroupLogic = (groupId, logic) => {
    setLocalFormState(prev => ({
      ...prev,
      newViewConditions: {
        ...prev.newViewConditions,
        groups: prev.newViewConditions.groups.map(group => 
          group.id === groupId 
            ? { ...group, internalLogic: logic }
            : group
        )
      }
    }));
  };

  const updateGroupsLogic = (logic) => {
    setLocalFormState(prev => ({
      ...prev,
      newViewConditions: {
        ...prev.newViewConditions,
        groupLogic: logic
      }
    }));
  };

  // Condition management functions
  const addCondition = (groupId) => {
    setLocalFormState(prev => ({
      ...prev,
      newViewConditions: {
        ...prev.newViewConditions,
        groups: prev.newViewConditions.groups.map(group => 
          group.id === groupId 
            ? {
                ...group,
                conditions: [...group.conditions, { field: '', operator: '', value: '', logicOperator: 'AND' }]
              }
            : group
        )
      }
    }));
  };

  const removeCondition = (groupId, conditionIndex) => {
    setLocalFormState(prev => ({
      ...prev,
      newViewConditions: {
        ...prev.newViewConditions,
        groups: prev.newViewConditions.groups.map(group => {
          if (group.id === groupId && group.conditions.length > 1) {
            return {
              ...group,
              conditions: group.conditions.filter((_, i) => i !== conditionIndex)
            };
          }
          return group;
        })
      }
    }));
  };

  const updateCondition = (groupId, conditionIndex, field, value) => {
    setLocalFormState(prev => ({
      ...prev,
      newViewConditions: {
        ...prev.newViewConditions,
        groups: prev.newViewConditions.groups.map(group => {
          if (group.id === groupId) {
            const updatedConditions = [...group.conditions];
            updatedConditions[conditionIndex] = { 
              ...updatedConditions[conditionIndex], 
              [field]: value 
            };
            
            // Clear operator and value when field changes
            if (field === 'field') {
              updatedConditions[conditionIndex].operator = '';
              updatedConditions[conditionIndex].value = '';
            }
            
            return { ...group, conditions: updatedConditions };
          }
          return group;
        })
      }
    }));
  };

  const getOperatorsForField = (fieldName) => {
    // Use the appropriate field list based on advanced mode
    const fieldList = showAdvancedFields ? ALL_FILTERABLE_FIELDS : filterableFields;
    const field = fieldList[fieldName];
    if (!field) return [];
    
    // Special handling for courseCode when groupByASN is enabled
    if (fieldName === 'courseCode' && localFormState.newViewGroupByASN) {
      return OPERATORS.courseCode_aggregate || [];
    }
    
    return OPERATORS[field.type] || [];
  };

  const needsValueInput = (operator) => {
    return !['is_empty', 'is_not_empty', 'exists', 'not_exists', 'is_true', 'is_false'].includes(operator);
  };

  // Helper function to render appropriate input for current_date conditions
  const renderValueInput = (condition, groupId, conditionIndex) => {
    const isCurrentDate = condition.field === 'current_date';
    const isCategories = condition.field === 'student.categories';
    const operator = condition.operator;
    
    if (!needsValueInput(operator)) {
      return null;
    }

    // Handle student.categories field with dropdown
    if (isCategories && ['has_category', 'does_not_have_category'].includes(operator)) {
      // Get all categories from all teachers
      const allCategories = [];
      
      Object.keys(teacherCategories).forEach(teacherEmail => {
        Object.keys(teacherCategories[teacherEmail]).forEach(categoryId => {
          const category = teacherCategories[teacherEmail][categoryId];
          if (category && !category.archived) {
            // Add top-level category with teacher email in the value
            allCategories.push({
              value: `${teacherEmail}.${categoryId}`,
              label: `${category.name} (${teacherEmail})`,
              teacher: teacherEmail,
              type: category.type || 'general',
              color: category.color
            });
          }
        });
      });
      
      // Also add special nested categories for info@rtdacademy.com
      if (teacherCategories['info@rtdacademy,com']) {
        const infoCategories = teacherCategories['info@rtdacademy,com'];
        ['PASI_Course_Link', 'PASI_Record_Missing', 'YourWay_PASI_Status_Mismatch'].forEach(nestedKey => {
          if (infoCategories[nestedKey]) {
            allCategories.push({
              value: `info@rtdacademy,com.${nestedKey}`,
              label: `${infoCategories[nestedKey].name} (system)`,
              teacher: 'info@rtdacademy,com',
              type: infoCategories[nestedKey].type || 'system',
              color: infoCategories[nestedKey].color
            });
          }
        });
      }

      return (
        <Select 
          value={condition.value} 
          onValueChange={(value) => updateCondition(groupId, conditionIndex, 'value', value)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {allCategories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-2 h-2 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: category.color || '#3B82F6' }}
                  />
                  <span className="truncate">{category.label}</span>
                  {category.type && (
                    <Badge variant="outline" className="text-xs ml-1">
                      {category.type}
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Handle current_date field with special dropdowns
    if (isCurrentDate) {
      switch (operator) {
        case 'month_is_one_of':
        case 'month_is_not_one_of':
          // Multi-select for months
          return (
            <div className="space-y-2">
              <div className="text-xs text-gray-600">Select months (comma-separated values will be created):</div>
              {MONTH_OPTIONS.map((month) => (
                <label key={month.value} className="flex items-center space-x-2 text-xs">
                  <input
                    type="checkbox"
                    checked={(condition.value || '').split(',').map(v => v.trim()).includes(month.value)}
                    onChange={(e) => {
                      const currentValues = condition.value ? condition.value.split(',').map(v => v.trim()).filter(Boolean) : [];
                      let newValues;
                      if (e.target.checked) {
                        newValues = [...currentValues, month.value];
                      } else {
                        newValues = currentValues.filter(v => v !== month.value);
                      }
                      updateCondition(groupId, conditionIndex, 'value', newValues.join(','));
                    }}
                    className="rounded"
                  />
                  <span>{month.label}</span>
                </label>
              ))}
            </div>
          );
        
        case 'month_equals':
        case 'month_not_equals':
          return (
            <Select value={condition.value} onValueChange={(value) => updateCondition(groupId, conditionIndex, 'value', value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {MONTH_OPTIONS.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        
        case 'weekday_is_one_of':
          // Multi-select for weekdays
          return (
            <div className="space-y-2">
              <div className="text-xs text-gray-600">Select weekdays:</div>
              {WEEKDAY_OPTIONS.map((day) => (
                <label key={day.value} className="flex items-center space-x-2 text-xs">
                  <input
                    type="checkbox"
                    checked={(condition.value || '').split(',').map(v => v.trim()).includes(day.value)}
                    onChange={(e) => {
                      const currentValues = condition.value ? condition.value.split(',').map(v => v.trim()).filter(Boolean) : [];
                      let newValues;
                      if (e.target.checked) {
                        newValues = [...currentValues, day.value];
                      } else {
                        newValues = currentValues.filter(v => v !== day.value);
                      }
                      updateCondition(groupId, conditionIndex, 'value', newValues.join(','));
                    }}
                    className="rounded"
                  />
                  <span>{day.label}</span>
                </label>
              ))}
            </div>
          );
        
        case 'day_of_month_equals':
        case 'day_of_month_greater_than':
        case 'day_of_month_less_than':
          return (
            <Select value={condition.value} onValueChange={(value) => updateCondition(groupId, conditionIndex, 'value', value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {DAY_OPTIONS.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        
        case 'year_equals':
          return (
            <Input
              type="number"
              placeholder="Enter year (e.g., 2024)"
              value={condition.value}
              onChange={(e) => updateCondition(groupId, conditionIndex, 'value', e.target.value)}
              className="h-8 text-xs"
              min="2020"
              max="2030"
            />
          );
        
        default:
          return (
            <Input
              placeholder="Enter value"
              value={condition.value}
              onChange={(e) => updateCondition(groupId, conditionIndex, 'value', e.target.value)}
              className="h-8 text-xs"
            />
          );
      }
    }

    // Handle aggregate course operators
    if (condition.field === 'courseCode' && 
        ['student_has_course', 'student_does_not_have_course', 'student_has_any_of_courses', 
         'student_has_all_courses', 'student_has_none_of_courses'].includes(condition.operator)) {
      
      const placeholderText = 
        condition.operator === 'student_has_course' || condition.operator === 'student_does_not_have_course'
          ? "Enter course code (e.g., COM1255)"
          : "Enter comma-separated course codes (e.g., COM1255, MAT1255, ENG1255)";
      
      return (
        <Input
          placeholder={placeholderText}
          value={condition.value}
          onChange={(e) => updateCondition(groupId, conditionIndex, 'value', e.target.value)}
          className="h-8 text-xs"
        />
      );
    }

    // Default text input for other fields
    return (
      <Input
        placeholder="Enter value"
        value={condition.value}
        onChange={(e) => updateCondition(groupId, conditionIndex, 'value', e.target.value)}
        className="h-8 text-xs"
      />
    );
  };

  const handleSave = () => {
    onSave(localFormState);
  };

  const handleDelete = () => {
    if (editingView && onDelete) {
      if (window.confirm('Are you sure you want to delete this custom view? This action cannot be undone.')) {
        onDelete(editingView.id);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingView ? 'Edit Custom View' : 'Create Custom View'}
          </DialogTitle>
          <DialogDescription>
            {editingView 
              ? 'Modify the existing custom view settings and conditions.'
              : 'Create a new custom view by selecting a base data source and adding filter conditions.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* View Name */}
          <div className="space-y-2">
            <Label htmlFor="viewName">View Name</Label>
            <Input
              id="viewName"
              placeholder="Enter a name for this view"
              value={localFormState.newViewName}
              onChange={(e) => setLocalFormState(prev => ({ ...prev, newViewName: e.target.value }))}
            />
          </div>

          {/* View Description */}
          <div className="space-y-2">
            <Label htmlFor="viewDescription">Description (Optional)</Label>
            <Input
              id="viewDescription"
              placeholder="Enter a description to help others understand what this view represents"
              value={localFormState.newViewDescription}
              onChange={(e) => setLocalFormState(prev => ({ ...prev, newViewDescription: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* View Icon */}
            <div className="space-y-2">
              <Label htmlFor="viewIcon">Icon</Label>
              <Select value={localFormState.newViewIcon} onValueChange={(value) => setLocalFormState(prev => ({ ...prev, newViewIcon: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an icon">
                    {localFormState.newViewIcon && (
                      <div className="flex items-center space-x-2">
                        {(() => {
                          const IconComponent = getIconComponent(localFormState.newViewIcon);
                          return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
                        })()}
                        <span>{AVAILABLE_ICONS.find(icon => icon.value === localFormState.newViewIcon)?.label}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {AVAILABLE_ICONS.map((icon) => {
                    const IconComponent = icon.component;
                    return (
                      <SelectItem key={icon.value} value={icon.value}>
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-4 w-4" />
                          <span>{icon.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Tab Color */}
            <div className="space-y-2">
              <Label htmlFor="viewColor">Tab Color</Label>
              <Select value={localFormState.newViewColor} onValueChange={(value) => setLocalFormState(prev => ({ ...prev, newViewColor: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a color">
                    {localFormState.newViewColor && (
                      <div className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded ${AVAILABLE_COLORS.find(color => color.value === localFormState.newViewColor)?.className.split(' ')[0] || 'bg-blue-500'}`} />
                        <span>{AVAILABLE_COLORS.find(color => color.value === localFormState.newViewColor)?.label}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {AVAILABLE_COLORS.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded ${color.className.split(' ')[0]}`} />
                        <span>{color.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Base Data Source */}
          <div className="space-y-2">
            <Label htmlFor="baseSource">Base Data Source</Label>
            <Select value={localFormState.newViewBaseSource} onValueChange={(value) => setLocalFormState(prev => ({ ...prev, newViewBaseSource: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select base data source" />
              </SelectTrigger>
              <SelectContent>
                {baseDataSources.map((source) => (
                  <SelectItem key={source.value} value={source.value}>
                    {source.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Group by ASN Toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="groupByASN" className="text-base">Group by Student (ASN)</Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, if any course matches the filter, all courses for that student will be shown
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="groupByASN"
                  checked={localFormState.newViewGroupByASN}
                  onChange={(e) => setLocalFormState(prev => ({ ...prev, newViewGroupByASN: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
              </div>
            </div>
            {localFormState.newViewGroupByASN && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1 text-blue-800">
                    <p className="font-medium">Student-Level Filtering Enabled</p>
                    <p className="text-xs">
                      When filtering by Course Code, you can now use special operators to find students based on their entire course enrollment:
                    </p>
                    <ul className="text-xs space-y-0.5 ml-4 list-disc">
                      <li><strong>Student Has Course:</strong> Shows students who have the specified course</li>
                      <li><strong>Student Does Not Have Course:</strong> Shows students who don't have the specified course</li>
                      <li><strong>Student Has Any/All/None:</strong> For checking multiple courses at once</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filter Conditions - Grouped */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Filter Conditions</Label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant={showAdvancedFields ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowAdvancedFields(!showAdvancedFields)}
                  className="text-xs"
                >
                  {showAdvancedFields ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Advanced
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-1" />
                      Show All Fields
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addGroup}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Group
                </Button>
              </div>
            </div>

            {/* Field Selection Info */}
            <div className={`text-xs p-3 rounded-lg ${showAdvancedFields ? 'bg-blue-50 border border-blue-200' : 'bg-green-50 border border-green-200'}`}>
              <div className="flex items-start space-x-2">
                {showAdvancedFields ? (
                  <>
                    <Settings className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-blue-800">
                      <p className="font-medium">Advanced Mode</p>
                      <p>All available fields are shown. Use with caution as some fields may not be populated for all records.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-green-800">
                      <p className="font-medium">Common Fields Mode</p>
                      <p>Showing the most commonly used fields for filtering. Click "Show All Fields" for advanced options.</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Group Logic Selector */}
            {localFormState.newViewConditions.groups.length > 1 && (
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <Label className="text-sm font-medium">Groups Combined With:</Label>
                <Select value={localFormState.newViewConditions.groupLogic} onValueChange={updateGroupsLogic}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AND">AND</SelectItem>
                    <SelectItem value="OR">OR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Condition Groups */}
            {localFormState.newViewConditions.groups.map((group, groupIndex) => (
              <div key={group.id} className="border-2 border-dashed border-gray-300 rounded-lg p-4 space-y-4 bg-gray-50">
                {/* Group Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-semibold text-gray-700">
                      Group {groupIndex + 1}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Label className="text-xs text-gray-600">Logic:</Label>
                      <Select 
                        value={group.internalLogic} 
                        onValueChange={(value) => updateGroupLogic(group.id, value)}
                      >
                        <SelectTrigger className="w-20 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AND">AND</SelectItem>
                          <SelectItem value="OR">OR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addCondition(group.id)}
                      className="h-7 px-2 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Condition
                    </Button>
                    {localFormState.newViewConditions.groups.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGroup(group.id)}
                        className="h-7 px-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Conditions within group */}
                {group.conditions.map((condition, conditionIndex) => (
                  <div key={conditionIndex} className="bg-white border rounded-lg p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600">
                        Condition {conditionIndex + 1}
                      </span>
                      {group.conditions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCondition(group.id, conditionIndex)}
                          className="h-6 w-6 p-0 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Field Selection */}
                      <div className="space-y-1">
                        <Label className="text-xs">Field</Label>
                        <Select 
                          value={condition.field} 
                          onValueChange={(value) => updateCondition(group.id, conditionIndex, 'field', value)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(showAdvancedFields ? ALL_FILTERABLE_FIELDS : filterableFields).map(([key, field]) => (
                              <SelectItem key={key} value={key}>
                                {field.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Operator Selection */}
                      <div className="space-y-1">
                        <Label className="text-xs">Operator</Label>
                        <Select 
                          value={condition.operator} 
                          onValueChange={(value) => updateCondition(group.id, conditionIndex, 'operator', value)}
                          disabled={!condition.field}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select operator" />
                          </SelectTrigger>
                          <SelectContent>
                            {getOperatorsForField(condition.field).map((op) => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {condition.field === 'courseCode' && localFormState.newViewGroupByASN && (
                          <p className="text-xs text-blue-600 mt-1">
                            Using student-level operators
                          </p>
                        )}
                      </div>

                      {/* Value Input */}
                      <div className="space-y-1">
                        <Label className="text-xs">Value</Label>
                        {condition.operator && needsValueInput(condition.operator) ? (
                          renderValueInput(condition, group.id, conditionIndex)
                        ) : (
                          <div className="h-8 flex items-center text-xs text-gray-400">
                            No value needed
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* Visual representation */}
            <div className="text-xs text-gray-500 p-3 bg-blue-50 rounded-lg">
              <strong>Preview:</strong> 
              {localFormState.newViewConditions.groups.map((group, idx) => (
                <span key={group.id}>
                  {idx > 0 && ` ${localFormState.newViewConditions.groupLogic} `}
                  ({group.conditions.filter(c => c.field && c.operator).length} condition{group.conditions.filter(c => c.field && c.operator).length !== 1 ? 's' : ''} with {group.internalLogic})
                </span>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {editingView && (
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                className="mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete View
              </Button>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingView ? 'Update View' : 'Create View'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const PasiRecordsSimplified = ({ onShowAnalytics }) => {
  const { 
    pasiStudentSummariesCombined, 
    pasiRecordsNew, 
    studentSummaries, 
    isLoadingStudents, 
    currentSchoolYear 
  } = useSchoolYear();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('allYourWay');
  const [selectedPasiRecords, setSelectedPasiRecords] = useState({});
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [sortState, setSortState] = useState({ column: 'studentName', direction: 'asc' });
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  const [isPDFGenerationOpen, setIsPDFGenerationOpen] = useState(false);
  const [isCSVExportOpen, setIsCSVExportOpen] = useState(false);
  
  // Responsive breakpoint state
  const breakpoint = useResponsiveBreakpoint();
  
  // Custom view states
  const [showCreateViewModal, setShowCreateViewModal] = useState(false);
  const [customViews, setCustomViews] = useState([]);
  const [isLoadingCustomViews, setIsLoadingCustomViews] = useState(true);
  const [editingView, setEditingView] = useState(null);
  const [draggedViewId, setDraggedViewId] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [userViewPreferences, setUserViewPreferences] = useState({});
  const [showManageViews, setShowManageViews] = useState(false);
  
  
  // Teacher categories state
  const [teacherCategories, setTeacherCategories] = useState({});
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  
  // Get current user
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;

  // Load custom views from Firebase
  useEffect(() => {
    const database = getDatabase();
    const customViewsRef = ref(database, 'customViews/pasiRecords');
    
    const unsubscribe = onValue(customViewsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const viewsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setCustomViews(viewsArray);
      } else {
        setCustomViews([]);
      }
      setIsLoadingCustomViews(false);
    });

    return () => {
      off(customViewsRef, 'value', unsubscribe);
    };
  }, []);

  // Load user view preferences
  useEffect(() => {
    if (!userId) return;
    
    const database = getDatabase();
    const preferencesRef = ref(database, `userPreferences/${userId}/pasiViewPreferences`);
    
    const unsubscribe = onValue(preferencesRef, (snapshot) => {
      const data = snapshot.val();
      setUserViewPreferences(data || {});
    });

    return () => {
      off(preferencesRef, 'value', unsubscribe);
    };
  }, [userId]);

  // Load teacher categories
  useEffect(() => {
    const database = getDatabase();
    const categoriesRef = ref(database, 'teacherCategories');
    
    const unsubscribe = onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      setTeacherCategories(data || {});
      setIsLoadingCategories(false);
    });

    return () => {
      off(categoriesRef, 'value', unsubscribe);
    };
  }, []);

  // Helper function to evaluate a single condition
  const evaluateCondition = (record, condition) => {
    
    if (!condition.field || !condition.operator) {
      return false;
    }
    
    const fieldValue = record[condition.field];
    let result = false;
    
    switch (condition.operator) {
      case 'equals':
        result = String(fieldValue || '').toLowerCase() === String(condition.value || '').toLowerCase();
        break;
      case 'not_equals':
        result = String(fieldValue || '').toLowerCase() !== String(condition.value || '').toLowerCase();
        break;
      case 'contains':
        result = String(fieldValue || '').toLowerCase().includes(String(condition.value || '').toLowerCase());
        break;
      case 'not_contains':
        result = !String(fieldValue || '').toLowerCase().includes(String(condition.value || '').toLowerCase());
        break;
      case 'starts_with':
        result = String(fieldValue || '').toLowerCase().startsWith(String(condition.value || '').toLowerCase());
        break;
      case 'ends_with':
        result = String(fieldValue || '').toLowerCase().endsWith(String(condition.value || '').toLowerCase());
        break;
      case 'greater_than':
        result = Number(fieldValue) > Number(condition.value);
        break;
      case 'less_than':
        result = Number(fieldValue) < Number(condition.value);
        break;
      case 'greater_than_equal':
        result = Number(fieldValue) >= Number(condition.value);
        break;
      case 'less_than_equal':
        result = Number(fieldValue) <= Number(condition.value);
        break;
      case 'before':
        result = new Date(fieldValue) < new Date(condition.value);
        break;
      case 'after':
        result = new Date(fieldValue) > new Date(condition.value);
        break;
      case 'is_empty':
        if (condition.field === 'student.categories') {
          const categories = record.categories || {};
          result = Object.keys(categories).length === 0;
        } else {
          result = !fieldValue || fieldValue === '' || fieldValue === 'N/A';
        }
        break;
      case 'is_not_empty':
        if (condition.field === 'student.categories') {
          const categories = record.categories || {};
          result = Object.keys(categories).length > 0;
        } else {
          result = fieldValue && fieldValue !== '' && fieldValue !== 'N/A';
        }
        break;
      case 'is_true':
        result = fieldValue === true || fieldValue === 'true' || fieldValue === 'Yes';
        break;
      case 'is_false':
        result = fieldValue === false || fieldValue === 'false' || fieldValue === 'No';
        break;
      case 'exists':
        result = fieldValue !== undefined && fieldValue !== null;
        break;
      case 'not_exists':
        result = fieldValue === undefined || fieldValue === null;
        break;
      
      // Current Date operators
      case 'month_is_one_of':
        if (condition.field === 'current_date') {
          const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-indexed
          const monthNumbers = (condition.value || '').split(',').map(month => {
            const monthName = month.trim();
            // Convert month names to numbers
            const monthMap = {
              'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6,
              'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12,
              '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
              '7': 7, '8': 8, '9': 9, '10': 10, '11': 11, '12': 12
            };
            return monthMap[monthName] || parseInt(monthName);
          }).filter(Boolean);
          result = monthNumbers.includes(currentMonth);
        }
        break;
      case 'month_is_not_one_of':
        if (condition.field === 'current_date') {
          const currentMonth = new Date().getMonth() + 1;
          const monthNumbers = (condition.value || '').split(',').map(month => {
            const monthName = month.trim();
            const monthMap = {
              'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6,
              'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12,
              '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
              '7': 7, '8': 8, '9': 9, '10': 10, '11': 11, '12': 12
            };
            return monthMap[monthName] || parseInt(monthName);
          }).filter(Boolean);
          result = !monthNumbers.includes(currentMonth);
        }
        break;
      case 'month_equals':
        if (condition.field === 'current_date') {
          const currentMonth = new Date().getMonth() + 1;
          const monthMap = {
            'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6,
            'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12
          };
          const targetMonth = monthMap[condition.value] || parseInt(condition.value);
          result = currentMonth === targetMonth;
        }
        break;
      case 'month_not_equals':
        if (condition.field === 'current_date') {
          const currentMonth = new Date().getMonth() + 1;
          const monthMap = {
            'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6,
            'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12
          };
          const targetMonth = monthMap[condition.value] || parseInt(condition.value);
          result = currentMonth !== targetMonth;
        }
        break;
      case 'day_of_month_equals':
        if (condition.field === 'current_date') {
          const currentDay = new Date().getDate();
          result = currentDay === parseInt(condition.value);
        }
        break;
      case 'day_of_month_greater_than':
        if (condition.field === 'current_date') {
          const currentDay = new Date().getDate();
          result = currentDay > parseInt(condition.value);
        }
        break;
      case 'day_of_month_less_than':
        if (condition.field === 'current_date') {
          const currentDay = new Date().getDate();
          result = currentDay < parseInt(condition.value);
        }
        break;
      case 'year_equals':
        if (condition.field === 'current_date') {
          const currentYear = new Date().getFullYear();
          result = currentYear === parseInt(condition.value);
        }
        break;
      case 'weekday_is_one_of':
        if (condition.field === 'current_date') {
          const currentWeekday = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
          const weekdayNumbers = (condition.value || '').split(',').map(day => {
            const dayName = day.trim();
            const dayMap = {
              'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6,
              '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6
            };
            return dayMap[dayName] !== undefined ? dayMap[dayName] : parseInt(dayName);
          }).filter(num => num !== undefined && !isNaN(num));
          result = weekdayNumbers.includes(currentWeekday);
        }
        break;
      
      // Category operators - handle student.categories field
      case 'has_category':
        if (condition.field === 'student.categories') {
          const categories = record.categories || {};
          // Check for nested categories first (e.g., charlie@rtdacademy,com.1733176421727)
          if (condition.value.includes('.')) {
            const [parent, child] = condition.value.split('.');
            result = !!(categories[parent] && categories[parent][child]);
          } else {
            // Check if the category exists and is true (for legacy direct categories)
            result = !!categories[condition.value];
          }
        }
        break;
      case 'does_not_have_category':
        if (condition.field === 'student.categories') {
          const categories = record.categories || {};
          // Check for nested categories first (e.g., charlie@rtdacademy,com.1733176421727)
          if (condition.value.includes('.')) {
            const [parent, child] = condition.value.split('.');
            result = !(categories[parent] && categories[parent][child]);
          } else {
            // Check if the category doesn't exist or is false (for legacy direct categories)
            result = !categories[condition.value];
          }
        }
        break;
      case 'has_any_of_categories':
        if (condition.field === 'student.categories') {
          const categories = record.categories || {};
          const targetCategories = (condition.value || '').split(',').map(c => c.trim()).filter(c => c);
          result = targetCategories.some(category => {
            if (category.includes('.')) {
              const [parent, child] = category.split('.');
              return !!(categories[parent] && categories[parent][child]);
            }
            return !!categories[category];
          });
        }
        break;
      case 'has_all_categories':
        if (condition.field === 'student.categories') {
          const categories = record.categories || {};
          const targetCategories = (condition.value || '').split(',').map(c => c.trim()).filter(c => c);
          result = targetCategories.every(category => {
            if (category.includes('.')) {
              const [parent, child] = category.split('.');
              return !!(categories[parent] && categories[parent][child]);
            }
            return !!categories[category];
          });
        }
        break;
      case 'has_none_of_categories':
        if (condition.field === 'student.categories') {
          const categories = record.categories || {};
          const targetCategories = (condition.value || '').split(',').map(c => c.trim()).filter(c => c);
          result = !targetCategories.some(category => {
            if (category.includes('.')) {
              const [parent, child] = category.split('.');
              return !!(categories[parent] && categories[parent][child]);
            }
            return !!categories[category];
          });
        }
        break;
      default:
        result = false;
    }
    
    return result;
  };

  // Enhanced filter function for grouped conditions
  const applyCustomFilter = (records, conditionsConfig) => {
    
    // Handle legacy format (simple array of conditions)
    if (Array.isArray(conditionsConfig)) {
      return applyLegacyFilter(records, conditionsConfig);
    }
    
    // Handle new grouped format
    if (!conditionsConfig || !conditionsConfig.groups || conditionsConfig.groups.length === 0) {
      return records;
    }
    
    
    const filteredRecords = records.filter((record, recordIndex) => {
      // Only log for first few records to avoid console spam
      const shouldLog = recordIndex < 3;
      if (shouldLog) {
      }
      
      const groupResults = [];
      
      // Evaluate each group
      for (let groupIndex = 0; groupIndex < conditionsConfig.groups.length; groupIndex++) {
        const group = conditionsConfig.groups[groupIndex];
        
        if (shouldLog) {
        }
        
        if (!group.conditions || group.conditions.length === 0) {
          groupResults.push(true);
          groupResults.push(true);
          continue;
        }
        
        // Filter out invalid conditions
        const validConditions = group.conditions.filter(c => c.field && c.operator);
        if (validConditions.length === 0) {
          groupResults.push(true);
          groupResults.push(true);
          continue;
        }
        
        // Evaluate conditions within the group
        let groupResult = true;
        const groupLogic = group.internalLogic || 'AND';
        
        if (shouldLog) {
        }
        
        for (let i = 0; i < validConditions.length; i++) {
          const condition = validConditions[i];
          if (shouldLog) {
          }
          
          const conditionResult = evaluateCondition(record, condition);
          
          if (i === 0) {
            groupResult = conditionResult;
          } else {
            const previousResult = groupResult;
            if (groupLogic === 'AND') {
              groupResult = groupResult && conditionResult;
            } else if (groupLogic === 'OR') {
              groupResult = groupResult || conditionResult;
            }
            if (shouldLog) {
            }
          }
        }
        
        if (shouldLog) {
        }
        groupResults.push(groupResult);
      }
      
      // Combine group results using groupLogic
      let finalResult = groupResults[0] || false;
      const globalGroupLogic = conditionsConfig.groupLogic || 'AND';
      
      if (shouldLog) {
      }
      
      for (let i = 1; i < groupResults.length; i++) {
        const previousResult = finalResult;
        if (globalGroupLogic === 'AND') {
          finalResult = finalResult && groupResults[i];
        } else if (globalGroupLogic === 'OR') {
          finalResult = finalResult || groupResults[i];
        }
        if (shouldLog) {
        }
      }
      
      if (shouldLog) {
      }
      
      return finalResult;
    });
    
    return filteredRecords;
  };

  // Legacy filter function for backwards compatibility
  const applyLegacyFilter = (records, conditions) => {
    
    if (!conditions || conditions.length === 0) {
      return records;
    }
    
    const validConditions = conditions.filter(c => c.field && c.operator);
    
    if (validConditions.length === 0) {
      return records;
    }
    
    const filteredRecords = records.filter((record, recordIndex) => {
      const shouldLog = recordIndex < 3;
      if (shouldLog) {
      }
      
      let result = true;
      let currentLogic = 'AND';
      
      for (let i = 0; i < validConditions.length; i++) {
        const condition = validConditions[i];
        if (shouldLog) {
        }
        
        const conditionResult = evaluateCondition(record, condition);
        
        if (i === 0) {
          result = conditionResult;
        } else {
          const previousResult = result;
          if (currentLogic === 'AND') {
            result = result && conditionResult;
          } else if (currentLogic === 'OR') {
            result = result || conditionResult;
          }
          if (shouldLog) {
          }
        }
        
        currentLogic = condition.logicOperator || 'AND';
      }
      
      if (shouldLog) {
      }
      
      return result;
    });
    
    return filteredRecords;
  };

  // Apply aggregate filter for student-level course conditions
  const applyAggregateFilter = (records, conditionsConfig) => {
    // Group records by ASN
    const recordsByASN = {};
    records.forEach(record => {
      if (record.asn) {
        if (!recordsByASN[record.asn]) {
          recordsByASN[record.asn] = [];
        }
        recordsByASN[record.asn].push(record);
      }
    });

    // Evaluate conditions for each student
    const matchedASNs = new Set();
    
    Object.entries(recordsByASN).forEach(([asn, studentRecords]) => {
      // Extract course codes for this student
      const studentCourseCodes = new Set(
        studentRecords
          .map(r => r.courseCode)
          .filter(code => code && code !== 'N/A')
      );
      
      // Check if this student matches all condition groups
      const studentMatches = evaluateStudentAgainstConditions(
        studentRecords[0], // Use first record for non-course fields
        studentCourseCodes,
        conditionsConfig
      );
      
      if (studentMatches) {
        matchedASNs.add(asn);
      }
    });

    // Return all records for matched students
    if (matchedASNs.size === 0) {
      return [];
    }

    return records.filter(record => record.asn && matchedASNs.has(record.asn));
  };

  // Helper function to evaluate a student against aggregate conditions
  const evaluateStudentAgainstConditions = (sampleRecord, studentCourseCodes, conditionsConfig) => {
    if (!conditionsConfig || !conditionsConfig.groups || conditionsConfig.groups.length === 0) {
      return true;
    }

    const groupResults = [];

    for (const group of conditionsConfig.groups) {
      if (!group.conditions || group.conditions.length === 0) {
        groupResults.push(true);
        continue;
      }

      const validConditions = group.conditions.filter(c => c.field && c.operator);
      if (validConditions.length === 0) {
        groupResults.push(true);
        continue;
      }

      // Evaluate conditions within the group
      let groupResult = true;
      const groupLogic = group.internalLogic || 'AND';

      for (let i = 0; i < validConditions.length; i++) {
        const condition = validConditions[i];
        let conditionResult;

        // Handle aggregate course operators specially
        if (condition.field === 'courseCode' && 
            ['student_has_course', 'student_does_not_have_course', 'student_has_any_of_courses', 
             'student_has_all_courses', 'student_has_none_of_courses'].includes(condition.operator)) {
          conditionResult = evaluateAggregateCondition(studentCourseCodes, condition);
        } else {
          // Use regular evaluation for non-aggregate conditions
          conditionResult = evaluateCondition(sampleRecord, condition);
        }

        if (i === 0) {
          groupResult = conditionResult;
        } else {
          if (groupLogic === 'AND') {
            groupResult = groupResult && conditionResult;
          } else if (groupLogic === 'OR') {
            groupResult = groupResult || conditionResult;
          }
        }
      }

      groupResults.push(groupResult);
    }

    // Combine group results
    let finalResult = groupResults[0] || false;
    const globalGroupLogic = conditionsConfig.groupLogic || 'AND';

    for (let i = 1; i < groupResults.length; i++) {
      if (globalGroupLogic === 'AND') {
        finalResult = finalResult && groupResults[i];
      } else if (globalGroupLogic === 'OR') {
        finalResult = finalResult || groupResults[i];
      }
    }

    return finalResult;
  };

  // Evaluate aggregate course conditions
  const evaluateAggregateCondition = (studentCourseCodes, condition) => {
    const { operator, value } = condition;
    
    switch (operator) {
      case 'student_has_course':
        return studentCourseCodes.has(value);
        
      case 'student_does_not_have_course':
        return !studentCourseCodes.has(value);
        
      case 'student_has_any_of_courses':
        // Split comma-separated course codes
        const anyCourses = value.split(',').map(c => c.trim()).filter(c => c);
        return anyCourses.some(course => studentCourseCodes.has(course));
        
      case 'student_has_all_courses':
        // Split comma-separated course codes
        const allCourses = value.split(',').map(c => c.trim()).filter(c => c);
        return allCourses.every(course => studentCourseCodes.has(course));
        
      case 'student_has_none_of_courses':
        // Split comma-separated course codes
        const noneCourses = value.split(',').map(c => c.trim()).filter(c => c);
        return !noneCourses.some(course => studentCourseCodes.has(course));
        
      default:
        return false;
    }
  };

  // Apply grouped filter - shows all records for students who have at least one matching record
  const applyGroupedFilter = (records, conditionsConfig) => {
    // Check if we have any aggregate operators in use
    const hasAggregateOperators = conditionsConfig?.groups?.some(group => 
      group.conditions?.some(condition => 
        condition.field === 'courseCode' && 
        ['student_has_course', 'student_does_not_have_course', 'student_has_any_of_courses', 
         'student_has_all_courses', 'student_has_none_of_courses'].includes(condition.operator)
      )
    );

    if (hasAggregateOperators) {
      // Use aggregate filtering logic
      return applyAggregateFilter(records, conditionsConfig);
    }

    // Original logic for non-aggregate filters
    // First, get all records that match the filter
    const matchedRecords = applyCustomFilter(records, conditionsConfig);
    
    // Extract unique ASNs from matched records
    const matchedASNs = new Set();
    matchedRecords.forEach(record => {
      if (record.asn) {
        matchedASNs.add(record.asn);
      }
    });
    
    // If no ASNs found, return empty array
    if (matchedASNs.size === 0) {
      return [];
    }
    
    // Return all records that have any of the matched ASNs
    const groupedRecords = records.filter(record => {
      return record.asn && matchedASNs.has(record.asn);
    });
    
    // Add a flag to indicate which records were direct matches
    return groupedRecords.map(record => {
      const isDirectMatch = matchedRecords.some(matched => 
        matched.id === record.id || 
        (matched.asn === record.asn && 
         matched.courseCode === record.courseCode &&
         matched.referenceNumber === record.referenceNumber)
      );
      
      return {
        ...record,
        _isDirectMatch: isDirectMatch
      };
    });
  };

  // Filter records based on search term and active tab
  const filteredRecords = useMemo(() => {
    let records = [];
    
    // Check if this is a custom view
    const customView = customViews.find(view => view.id === activeTab);
    
    if (customView) {
      // Get base data source for custom view
      switch (customView.baseDataSource) {
        case 'linked':
        case 'summaryOnly':
        case 'pasiOnly':
        case 'linkedAndPasiOnly':
          if (!pasiStudentSummariesCombined) return [];
          records = [...pasiStudentSummariesCombined];
          // Apply base filter
          if (customView.baseDataSource === 'linked') {
            records = records.filter(r => r.recordType === 'linked');
          } else if (customView.baseDataSource === 'summaryOnly') {
            records = records.filter(r => r.recordType === 'summaryOnly');
          } else if (customView.baseDataSource === 'pasiOnly') {
            records = records.filter(r => r.recordType === 'pasiOnly');
          } else if (customView.baseDataSource === 'linkedAndPasiOnly') {
            records = records.filter(r => r.recordType === 'linked' || r.recordType === 'pasiOnly');
            
            // Create a map of ASN to StudentType_Value from linked records
            const asnToStudentTypeMap = {};
            records.forEach(record => {
              if (record.recordType === 'linked' && record.asn && record.StudentType_Value) {
                if (!asnToStudentTypeMap[record.asn]) {
                  asnToStudentTypeMap[record.asn] = record.StudentType_Value;
                }
              }
            });
            
            // Apply StudentType_Value to PASI-only records that have the same ASN
            records = records.map(record => {
              if (record.recordType === 'pasiOnly' && record.asn && asnToStudentTypeMap[record.asn]) {
                return {
                  ...record,
                  StudentType_Value: asnToStudentTypeMap[record.asn]
                };
              }
              return record;
            });
          }
          break;
        case 'allPasi':
          if (!pasiRecordsNew) return [];
          records = [...pasiRecordsNew];
          break;
        case 'allYourWay':
          if (!studentSummaries) return [];
          records = [...studentSummaries];
          break;
        default:
          if (!pasiStudentSummariesCombined) return [];
          records = [...pasiStudentSummariesCombined];
          break;
      }
      
      // Apply custom filters - use grouped filter if groupByASN is enabled
      if (customView.groupByASN) {
        records = applyGroupedFilter(records, customView.conditions);
      } else {
        records = applyCustomFilter(records, customView.conditions);
      }
    } else {
      // Get the appropriate data source based on active tab (default tabs)
      switch (activeTab) {
        case 'linked':
        case 'summaryOnly':
        case 'pasiOnly':
          if (!pasiStudentSummariesCombined) return [];
          records = [...pasiStudentSummariesCombined];
          break;
        case 'allPasi':
          if (!pasiRecordsNew) return [];
          records = [...pasiRecordsNew];
          break;
        case 'allYourWay':
          if (!studentSummaries) return [];
          records = [...studentSummaries];
          break;
        default:
          if (!pasiStudentSummariesCombined) return [];
          records = [...pasiStudentSummariesCombined];
          break;
      }
      
      // Apply tab filter for combined data tabs (default tabs only)
      if (activeTab === 'linked') {
        records = records.filter(r => r.recordType === 'linked');
      } else if (activeTab === 'summaryOnly') {
        records = records.filter(r => r.recordType === 'summaryOnly');
      } else if (activeTab === 'pasiOnly') {
        records = records.filter(r => r.recordType === 'pasiOnly');
      }
    }
    
    // Apply search filter (for both default and custom views)
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      records = records.filter(record => 
        record.studentName?.toLowerCase().includes(lowerSearch) ||
        record.firstName?.toLowerCase().includes(lowerSearch) ||
        record.lastName?.toLowerCase().includes(lowerSearch) ||
        record.asn?.toLowerCase().includes(lowerSearch) ||
        record.courseCode?.toLowerCase().includes(lowerSearch) ||
        record.courseDescription?.toLowerCase().includes(lowerSearch) ||
        record.Course_Value?.toLowerCase().includes(lowerSearch) ||
        record.status?.toLowerCase().includes(lowerSearch) ||
        record.Status_Value?.toLowerCase().includes(lowerSearch) ||
        record.StudentEmail?.toLowerCase().includes(lowerSearch)
      );
    }
    
    return records;
  }, [pasiStudentSummariesCombined, pasiRecordsNew, studentSummaries, searchTerm, activeTab, customViews]);

  // Get visible custom views based on user preferences
  const getVisibleCustomViews = () => {
    if (!customViews.length) return [];
    
    // Filter out hidden views and apply color/icon filters
    const visibleViews = customViews.filter(view => {
      // Individual view hiding (existing functionality)
      if (userViewPreferences.hidden?.[view.id]) return false;
      
      // Check if color and icon filters are enabled
      const colorFilterEnabled = userViewPreferences.colorFilters?.enabled;
      const iconFilterEnabled = userViewPreferences.iconFilters?.enabled;
      const filterLogic = userViewPreferences.filterLogic || 'AND'; // Default to AND
      
      // If no filters are enabled, show the view
      if (!colorFilterEnabled && !iconFilterEnabled) {
        return true;
      }
      
      // Get selected colors and icons
      const visibleColors = userViewPreferences.colorFilters?.visibleColors || [];
      const visibleIcons = userViewPreferences.iconFilters?.visibleIcons || [];
      
      // Check color filter condition
      let colorMatches = true;
      if (colorFilterEnabled) {
        colorMatches = visibleColors.length === 0 || visibleColors.includes(view.color);
      }
      
      // Check icon filter condition  
      let iconMatches = true;
      if (iconFilterEnabled) {
        iconMatches = visibleIcons.length === 0 || visibleIcons.includes(view.icon);
      }
      
      // Apply AND/OR logic between filters
      if (colorFilterEnabled && iconFilterEnabled) {
        return filterLogic === 'AND' ? (colorMatches && iconMatches) : (colorMatches || iconMatches);
      } else if (colorFilterEnabled) {
        return colorMatches;
      } else if (iconFilterEnabled) {
        return iconMatches;
      }
      
      return true;
    });
    
    // Sort by user-specific order, then by creation date
    return visibleViews.sort((a, b) => {
      const orderA = userViewPreferences.order?.[a.id];
      const orderB = userViewPreferences.order?.[b.id];
      
      if (orderA !== undefined && orderB !== undefined) {
        return orderA - orderB;
      }
      if (orderA !== undefined) return -1;
      if (orderB !== undefined) return 1;
      
      // Fallback to creation date
      return (a.createdAt || 0) - (b.createdAt || 0);
    });
  };

  // Get hidden custom views
  const getHiddenCustomViews = () => {
    if (!customViews.length) return [];
    
    return customViews.filter(view => 
      userViewPreferences.hidden?.[view.id]
    );
  };

  const visibleCustomViews = getVisibleCustomViews();
  const hiddenCustomViews = getHiddenCustomViews();

  // Get unique colors and icons used in custom views
  const getUsedColors = () => {
    const usedColors = new Set(customViews.map(view => view.color).filter(Boolean));
    return AVAILABLE_COLORS.filter(color => usedColors.has(color.value));
  };

  const getUsedIcons = () => {
    const usedIcons = new Set(customViews.map(view => view.icon).filter(Boolean));
    return AVAILABLE_ICONS.filter(icon => usedIcons.has(icon.value));
  };

  const usedColors = getUsedColors();
  const usedIcons = getUsedIcons();

  // Process records to add formatted dates and other computed fields
  const processedRecords = useMemo(() => {
    return filteredRecords.map(record => {
      // Get start date information
      const startDateInfo = getStartDate(record);
      
      // Format dates properly
      const startDateFormatted = startDateInfo.value 
        ? formatDate(startDateInfo.value, startDateInfo.formatted)
        : 'N/A';
        
      // Format exit date
      const exitDateFormatted = record.exitDate && record.exitDate !== '-'
        ? formatDate(record.exitDate)
        : 'N/A';
      
      return {
        ...record,
        startDate: startDateInfo.value,
        startDateFormatted,
        startDateSource: startDateInfo.source,
        exitDateFormatted
      };
    });
  }, [filteredRecords]);

  // Sort records
  const sortedRecords = useMemo(() => {
    // Check if we're in a grouped view
    const customView = customViews.find(view => view.id === activeTab);
    const isGroupedView = customView && customView.groupByASN;
    
    return [...processedRecords].sort((a, b) => {
      // If grouped by ASN, always sort by ASN first, then by direct match status
      if (isGroupedView) {
        // First sort by ASN
        const asnCompare = (a.asn || '').localeCompare(b.asn || '');
        if (asnCompare !== 0) return asnCompare;
        
        // Then prioritize direct matches within the same ASN
        if (a._isDirectMatch && !b._isDirectMatch) return -1;
        if (!a._isDirectMatch && b._isDirectMatch) return 1;
      }
      
      // Normal sorting logic
      let aValue = a[sortState.column] || '';
      let bValue = b[sortState.column] || '';
      
      // Handle computed fields that may not exist directly in the data
      if (sortState.column === 'studentName') {
        // Use studentName if it exists, otherwise concatenate firstName and lastName
        aValue = a.studentName || `${a.firstName || ''} ${a.lastName || ''}`.trim();
        bValue = b.studentName || `${b.firstName || ''} ${b.lastName || ''}`.trim();
      } else if (sortState.column === 'courseCode') {
        // Use courseCode if it exists, otherwise fall back to Course_Value
        aValue = a.courseCode || a.Course_Value || '';
        bValue = b.courseCode || b.Course_Value || '';
      } else if (sortState.column === 'Course_Value') {
        // Use Course_Value if it exists, otherwise fall back to courseCode
        aValue = a.Course_Value || a.courseCode || '';
        bValue = b.Course_Value || b.courseCode || '';
      }
      
      // Handle workItems sorting based on severity
      if (sortState.column === 'workItems') {
        const severityOrder = { 'Warning': 3, 'Advice': 2, 'Unknown': 1 };
        aValue = severityOrder[aValue] || 0;
        bValue = severityOrder[bValue] || 0;
      }
      
      // For numeric fields
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortState.direction === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      }
      
      // For string fields
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        // Special case for date sorting
        if (sortState.column === 'exitDate' || sortState.column === 'startDateFormatted') {
          const dateA = aValue ? new Date(aValue).getTime() : 0;
          const dateB = bValue ? new Date(bValue).getTime() : 0;
          return sortState.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }
        return sortState.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      // Fallback comparison
      return sortState.direction === 'asc' 
        ? (aValue > bValue ? 1 : -1) 
        : (aValue < bValue ? 1 : -1);
    });
  }, [processedRecords, sortState, customViews, activeTab]);

  // Pagination
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sortedRecords.slice(startIndex, endIndex);
  }, [sortedRecords, currentPage]);

  const totalPages = Math.ceil(sortedRecords.length / ITEMS_PER_PAGE);

  // Sortable table header component
  const SortableHeader = ({ column, label }) => {
    const isActive = sortState.column === column;
    
    return (
      <TableHead 
        className="cursor-pointer hover:bg-muted/50 transition-colors text-xs px-2 py-1" 
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

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts = {
      linked: 0,
      summaryOnly: 0,
      pasiOnly: 0,
      allPasi: 0,
      allYourWay: 0
    };
    
    if (pasiStudentSummariesCombined) {
      counts.linked = pasiStudentSummariesCombined.filter(r => r.recordType === 'linked').length;
      counts.summaryOnly = pasiStudentSummariesCombined.filter(r => r.recordType === 'summaryOnly').length;
      counts.pasiOnly = pasiStudentSummariesCombined.filter(r => r.recordType === 'pasiOnly').length;
    }
    
    if (pasiRecordsNew) {
      counts.allPasi = pasiRecordsNew.length;
    }
    
    if (studentSummaries) {
      counts.allYourWay = studentSummaries.length;
    }
    
    // Calculate counts for custom views (including hidden ones for management)
    customViews.forEach(view => {
      let records = [];
      
      // Get base data source for custom view
      switch (view.baseDataSource) {
        case 'linked':
        case 'summaryOnly':
        case 'pasiOnly':
        case 'linkedAndPasiOnly':
          if (!pasiStudentSummariesCombined) {
            counts[view.id] = 0;
            return;
          }
          records = [...pasiStudentSummariesCombined];
          // Apply base filter
          if (view.baseDataSource === 'linked') {
            records = records.filter(r => r.recordType === 'linked');
          } else if (view.baseDataSource === 'summaryOnly') {
            records = records.filter(r => r.recordType === 'summaryOnly');
          } else if (view.baseDataSource === 'pasiOnly') {
            records = records.filter(r => r.recordType === 'pasiOnly');
          } else if (view.baseDataSource === 'linkedAndPasiOnly') {
            records = records.filter(r => r.recordType === 'linked' || r.recordType === 'pasiOnly');
            
            // Create a map of ASN to StudentType_Value from linked records
            const asnToStudentTypeMap = {};
            records.forEach(record => {
              if (record.recordType === 'linked' && record.asn && record.StudentType_Value) {
                if (!asnToStudentTypeMap[record.asn]) {
                  asnToStudentTypeMap[record.asn] = record.StudentType_Value;
                }
              }
            });
            
            // Apply StudentType_Value to PASI-only records that have the same ASN
            records = records.map(record => {
              if (record.recordType === 'pasiOnly' && record.asn && asnToStudentTypeMap[record.asn]) {
                return {
                  ...record,
                  StudentType_Value: asnToStudentTypeMap[record.asn]
                };
              }
              return record;
            });
          }
          break;
        case 'allPasi':
          if (!pasiRecordsNew) {
            counts[view.id] = 0;
            return;
          }
          records = [...pasiRecordsNew];
          break;
        case 'allYourWay':
          if (!studentSummaries) {
            counts[view.id] = 0;
            return;
          }
          records = [...studentSummaries];
          break;
        default:
          if (!pasiStudentSummariesCombined) {
            counts[view.id] = 0;
            return;
          }
          records = [...pasiStudentSummariesCombined];
          break;
      }
      
      // Apply custom filters - use grouped filter if groupByASN is enabled
      if (view.groupByASN) {
        records = applyGroupedFilter(records, view.conditions);
        // Count unique ASNs instead of total records
        const uniqueASNs = new Set(records.map(r => r.asn).filter(asn => asn));
        counts[view.id] = uniqueASNs.size;
      } else {
        records = applyCustomFilter(records, view.conditions);
        counts[view.id] = records.length;
      }
    });
    
    return counts;
  }, [pasiStudentSummariesCombined, pasiRecordsNew, studentSummaries, customViews, applyGroupedFilter, applyCustomFilter]);

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  // Reset page when search or tab changes
  React.useEffect(() => {
    setCurrentPage(1);
    setIsDetailsSheetOpen(false); // Close details sheet when filters change
    setSelectedRecord(null); // Clear selected record
  }, [searchTerm, activeTab]);


  // Handle cell click to copy to clipboard
  const handleCellClick = (content, label) => {
    if (!content || content === 'N/A') return;
    
    navigator.clipboard.writeText(content);
    
    // Truncate long content for toast message
    const displayText = content.length > 25 ? `${content.substring(0, 25)}...` : content;
    toast.success(`Copied ${label ? label + ': ' : ''}${displayText}`);
  };

  // Handle cell click with both clipboard copying and row selection
  const handleCellClickWithSelection = (content, label, record, e) => {
    // Copy to clipboard
    if (content && content !== 'N/A') {
      navigator.clipboard.writeText(content);
      
      // Truncate long content for toast message
      const displayText = content.length > 25 ? `${content.substring(0, 25)}...` : content;
      toast.success(`Copied ${label ? label + ': ' : ''}${displayText}`);
    }
    
    // Handle row selection (don't stop propagation)
    const rowId = record.id || record.asn;
    setSelectedRowId(selectedRowId === rowId ? null : rowId);
  };

  // Handle record selection and open details sheet
  const handleRecordSelect = (record) => {
    setSelectedRecord(record);
    setIsDetailsSheetOpen(true);
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

  // Handle selecting a PASI record from multiple records
  const handleSelectPasiRecord = (recordId, pasiRecord) => {
    setSelectedPasiRecords(prev => ({
      ...prev,
      [recordId]: pasiRecord
    }));
  };

  // Handle column sorting
  const handleSort = (column) => {
    setSortState(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  };


  // Custom view management functions
  const handleCreateView = () => {
    setEditingView(null);
    setShowCreateViewModal(true);
  };

  const handleEditView = (view) => {
    setEditingView(view);
    setShowCreateViewModal(true);
  };

  // User preference management functions
  const saveUserPreferences = async (newPreferences) => {
    if (!userId) return;
    
    try {
      const database = getDatabase();
      const preferencesRef = ref(database, `userPreferences/${userId}/pasiViewPreferences`);
      await update(preferencesRef, newPreferences);
    } catch (error) {
      console.error('Error saving user preferences:', error);
      toast.error('Failed to save preferences');
    }
  };

  const toggleViewVisibility = async (viewId) => {
    const currentVisibility = userViewPreferences.hidden?.[viewId] || false;
    const newPreferences = {
      ...userViewPreferences,
      hidden: {
        ...userViewPreferences.hidden,
        [viewId]: !currentVisibility
      }
    };
    
    setUserViewPreferences(newPreferences);
    await saveUserPreferences(newPreferences);
    
    const action = currentVisibility ? 'shown' : 'hidden';
    toast.success(`View ${action} successfully`);
  };

  // Toggle color filter enabled/disabled
  const toggleColorFilterEnabled = async () => {
    const isEnabling = !userViewPreferences.colorFilters?.enabled;
    const newPreferences = {
      ...userViewPreferences,
      colorFilters: {
        ...userViewPreferences.colorFilters,
        enabled: isEnabling,
        // Clear selections when enabling (start with nothing selected)
        visibleColors: isEnabling ? [] : (userViewPreferences.colorFilters?.visibleColors || [])
      }
    };
    
    setUserViewPreferences(newPreferences);
    await saveUserPreferences(newPreferences);
    
    const action = isEnabling ? 'enabled' : 'disabled';
    toast.success(`Color filtering ${action}${isEnabling ? ' - select colors to show' : ''}`);
  };

  // Toggle icon filter enabled/disabled
  const toggleIconFilterEnabled = async () => {
    const isEnabling = !userViewPreferences.iconFilters?.enabled;
    const newPreferences = {
      ...userViewPreferences,
      iconFilters: {
        ...userViewPreferences.iconFilters,
        enabled: isEnabling,
        // Clear selections when enabling (start with nothing selected)
        visibleIcons: isEnabling ? [] : (userViewPreferences.iconFilters?.visibleIcons || [])
      }
    };
    
    setUserViewPreferences(newPreferences);
    await saveUserPreferences(newPreferences);
    
    const action = isEnabling ? 'enabled' : 'disabled';
    toast.success(`Icon filtering ${action}${isEnabling ? ' - select icons to show' : ''}`);
  };

  // Toggle specific color visibility
  const toggleColorFilter = async (color) => {
    const visibleColors = userViewPreferences.colorFilters?.visibleColors || [];
    const isCurrentlyVisible = visibleColors.includes(color);
    const newVisibleColors = isCurrentlyVisible
      ? visibleColors.filter(c => c !== color)
      : [...visibleColors, color];
    
    const newPreferences = {
      ...userViewPreferences,
      colorFilters: {
        ...userViewPreferences.colorFilters,
        enabled: userViewPreferences.colorFilters?.enabled || false,
        visibleColors: newVisibleColors
      }
    };
    
    setUserViewPreferences(newPreferences);
    await saveUserPreferences(newPreferences);
    
    const action = isCurrentlyVisible ? 'deselected' : 'selected';
    const colorLabel = AVAILABLE_COLORS.find(c => c.value === color)?.label || color;
    toast.success(`${colorLabel} views ${action}`);
  };

  // Toggle specific icon visibility
  const toggleIconFilter = async (icon) => {
    const visibleIcons = userViewPreferences.iconFilters?.visibleIcons || [];
    const isCurrentlyVisible = visibleIcons.includes(icon);
    const newVisibleIcons = isCurrentlyVisible
      ? visibleIcons.filter(i => i !== icon)
      : [...visibleIcons, icon];
    
    const newPreferences = {
      ...userViewPreferences,
      iconFilters: {
        ...userViewPreferences.iconFilters,
        enabled: userViewPreferences.iconFilters?.enabled || false,
        visibleIcons: newVisibleIcons
      }
    };
    
    setUserViewPreferences(newPreferences);
    await saveUserPreferences(newPreferences);
    
    const action = isCurrentlyVisible ? 'deselected' : 'selected';
    const iconLabel = AVAILABLE_ICONS.find(i => i.value === icon)?.label || icon;
    toast.success(`${iconLabel} views ${action}`);
  };

  // Toggle filter logic between AND/OR
  const toggleFilterLogic = async () => {
    const currentLogic = userViewPreferences.filterLogic || 'AND';
    const newLogic = currentLogic === 'AND' ? 'OR' : 'AND';
    
    const newPreferences = {
      ...userViewPreferences,
      filterLogic: newLogic
    };
    
    setUserViewPreferences(newPreferences);
    await saveUserPreferences(newPreferences);
    
    toast.success(`Filter logic changed to ${newLogic}`);
  };

  // Drag and drop handlers for reordering custom views (user-specific)
  const handleDragStart = (e, viewId) => {
    setDraggedViewId(viewId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    
    if (!draggedViewId || !userId) return;
    
    const visibleViews = getVisibleCustomViews();
    const draggedIndex = visibleViews.findIndex(view => view.id === draggedViewId);
    if (draggedIndex === -1 || draggedIndex === dropIndex) {
      setDraggedViewId(null);
      setDragOverIndex(null);
      return;
    }

    // Create new order array by reordering the visible views
    const reorderedViews = [...visibleViews];
    const draggedView = reorderedViews.splice(draggedIndex, 1)[0];
    reorderedViews.splice(dropIndex, 0, draggedView);
    
    // Create new order mapping
    const newOrder = {};
    reorderedViews.forEach((view, index) => {
      newOrder[view.id] = index;
    });

    const newPreferences = {
      ...userViewPreferences,
      order: {
        ...userViewPreferences.order,
        ...newOrder
      }
    };
    
    setUserViewPreferences(newPreferences);
    await saveUserPreferences(newPreferences);
    toast.success('View order updated');

    setDraggedViewId(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedViewId(null);
    setDragOverIndex(null);
  };

  const handleDeleteView = async (viewId) => {
    try {
      const database = getDatabase();
      const viewRef = ref(database, `customViews/pasiRecords/${viewId}`);
      await remove(viewRef);
      toast.success('Custom view deleted successfully');
      
      // Close the modal
      setShowCreateViewModal(false);
      setEditingView(null);
      
      // Switch to default tab if current tab was deleted
      if (activeTab === viewId) {
        setActiveTab('allYourWay');
      }
    } catch (error) {
      console.error('Error deleting custom view:', error);
      toast.error('Failed to delete custom view');
    }
  };

  const handleSaveView = async (formData) => {
    if (!formData.newViewName.trim()) {
      toast.error('Please enter a view name');
      return;
    }

    // Validate conditions across all groups
    let hasValidConditions = false;
    for (const group of formData.newViewConditions.groups) {
      const validConditions = group.conditions.filter(c => c.field && c.operator);
      if (validConditions.length > 0) {
        hasValidConditions = true;
        break;
      }
    }
    
    if (!hasValidConditions) {
      toast.error('Please add at least one valid condition');
      return;
    }

    try {
      const database = getDatabase();
      const viewData = {
        name: formData.newViewName.trim(),
        description: formData.newViewDescription.trim(),
        icon: formData.newViewIcon,
        color: formData.newViewColor,
        baseDataSource: formData.newViewBaseSource,
        groupByASN: formData.newViewGroupByASN,
        conditions: formData.newViewConditions,
        createdAt: editingView ? editingView.createdAt : Date.now(),
        updatedAt: Date.now()
      };

      if (editingView) {
        // Update existing view
        const viewRef = ref(database, `customViews/pasiRecords/${editingView.id}`);
        await update(viewRef, viewData);
        toast.success('Custom view updated successfully');
      } else {
        // Create new view
        const customViewsRef = ref(database, 'customViews/pasiRecords');
        await push(customViewsRef, viewData);
        toast.success('Custom view created successfully');
      }

      setShowCreateViewModal(false);
      setEditingView(null);
    } catch (error) {
      console.error('Error saving custom view:', error);
      toast.error('Failed to save custom view');
    }
  };


  // Get badge variant based on record type
  const getRecordTypeBadge = (recordType) => {
    switch (recordType) {
      case 'linked':
        return <Badge variant="success" className="text-xs"><Link2 className="h-3 w-3 mr-1" />Linked</Badge>;
      case 'summaryOnly':
        return <Badge variant="secondary" className="text-xs"><FileText className="h-3 w-3 mr-1" />Summary Only</Badge>;
      case 'pasiOnly':
        return <Badge variant="outline" className="text-xs"><Database className="h-3 w-3 mr-1" />PASI Only</Badge>;
      default:
        return <Badge variant="default" className="text-xs">Unknown</Badge>;
    }
  };

  // Get status badge styling
  const getStatusBadgeClass = (status) => {
    if (!status) return '';
    
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'withdrawn':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>PASI Records - {currentSchoolYear}</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {(() => {
                  const customView = customViews.find(view => view.id === activeTab);
                  if (customView?.groupByASN) {
                    const uniqueASNs = new Set(filteredRecords.map(r => r.asn).filter(asn => asn));
                    return `${uniqueASNs.size} Students`;
                  }
                  return `${filteredRecords.length} Records`;
                })()}
              </Badge>
              {filteredRecords.length > 0 && (
                <>
                  {onShowAnalytics && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onShowAnalytics(filteredRecords)}
                      className="h-8"
                    >
                      <BarChart3 className="h-4 w-4 mr-1" />
                      View Analytics
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCSVExportOpen(true)}
                    className="h-8"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-1" />
                    Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPDFGenerationOpen(true)}
                    className="h-8"
                  >
                    <FileDown className="h-4 w-4 mr-1" />
                    Generate PDFs
                  </Button>
                </>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, ASN, course code, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="linked">
            Linked ({tabCounts.linked || 0})
          </TabsTrigger>
          <TabsTrigger value="summaryOnly">
            YourWay Only ({tabCounts.summaryOnly || 0})
          </TabsTrigger>
          <TabsTrigger value="pasiOnly">
            PASI Only ({tabCounts.pasiOnly || 0})
          </TabsTrigger>
          <TabsTrigger value="allPasi">
            All PASI ({tabCounts.allPasi || 0})
          </TabsTrigger>
          <TabsTrigger value="allYourWay">
            All YourWay ({tabCounts.allYourWay || 0})
          </TabsTrigger>
        </TabsList>

        {/* Custom Views Section */}
        {customViews.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700 flex items-center">
                <Filter className="h-4 w-4 mr-1" />
                Custom Views
                {hiddenCustomViews.length > 0 && (
                  <span className="ml-2 text-xs text-gray-500">({hiddenCustomViews.length} hidden)</span>
                )}
              </h3>
              <div className="flex items-center space-x-2">
                {(hiddenCustomViews.length > 0 || usedColors.length > 0 || usedIcons.length > 0) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowManageViews(!showManageViews)}
                    className="h-7 px-2 text-xs"
                  >
                    <List className="h-3 w-3 mr-1" />
                    Manage
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateView}
                  className="h-7 px-2 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Create View
                </Button>
              </div>
            </div>
            {/* Visible Custom Views */}
            <div className="flex flex-wrap gap-2">
              {visibleCustomViews.map((view, index) => {
                const isActive = activeTab === view.id;
                const count = tabCounts[view.id] || 0;
                const isDraggedOver = dragOverIndex === index;
                const isDragging = draggedViewId === view.id;

                return (
                  <div 
                    key={view.id} 
                    className={`flex items-center transition-all duration-200 ${
                      isDraggedOver ? 'scale-105 transform' : ''
                    } ${isDragging ? 'opacity-50' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, view.id)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    {/* Drag Handle */}
                    <div className="mr-1 cursor-grab active:cursor-grabbing">
                      <GripVertical className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </div>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab(view.id)}
                          className={`h-8 px-3 text-xs mr-1 border ${isActive ? getColorClassName(view.color, true) : getColorClassName(view.color, false)}`}
                        >
                          <div className="flex items-center">
                            {(() => {
                              const IconComponent = getIconComponent(view.icon);
                              return IconComponent ? <IconComponent className="h-3 w-3 mr-1" /> : <Filter className="h-3 w-3 mr-1" />;
                            })()}
                            {view.groupByASN && <Users className="h-3 w-3 mr-1" />}
                            <span>{view.name} ({count} {view.groupByASN ? 'Students' : 'Records'})</span>
                          </div>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="max-w-xs space-y-1">
                          {view.description && <p>{view.description}</p>}
                          {view.groupByASN && (
                            <p className="text-xs text-muted-foreground">
                              <Users className="h-3 w-3 inline mr-1" />
                              Grouped by student (ASN)
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            💡 Drag to reorder views
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                    <div className="flex">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleViewVisibility(view.id)}
                        className="h-6 w-6 p-0 hover:bg-red-100"
                        title="Hide this view"
                      >
                        <EyeOff className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditView(view)}
                        className="h-6 w-6 p-0 hover:bg-blue-100"
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hidden Views Management */}
            {showManageViews && (hiddenCustomViews.length > 0 || usedColors.length > 0 || usedIcons.length > 0) && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Settings className="h-4 w-4 mr-1" />
                  Manage Views
                </h4>

                {/* Color and Icon Filters */}
                {(usedColors.length > 0 || usedIcons.length > 0) && (
                  <div className="mb-4 p-3 bg-white rounded-lg border">
                    <h5 className="text-xs font-medium text-gray-600 mb-3 flex items-center">
                      <Filter className="h-3 w-3 mr-1" />
                      View Filters
                    </h5>
                    
                    {/* Color Filter Section */}
                    {usedColors.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center gap-3 mb-2">
                          <label className="text-xs font-medium text-gray-600">Filter by Color</label>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={userViewPreferences.colorFilters?.enabled || false}
                              onCheckedChange={toggleColorFilterEnabled}
                              className="data-[state=checked]:bg-blue-600"
                            />
                            <span className="text-xs text-gray-500">
                              {userViewPreferences.colorFilters?.enabled ? 'On' : 'Off'}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {usedColors.map((color) => {
                            const visibleColors = userViewPreferences.colorFilters?.visibleColors || [];
                            const isSelected = visibleColors.includes(color.value);
                            const isFilterEnabled = userViewPreferences.colorFilters?.enabled;
                            return (
                              <TooltipProvider key={color.value}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => toggleColorFilter(color.value)}
                                      className={`h-6 w-6 p-0 border-2 ${color.className} ${
                                        !isFilterEnabled 
                                          ? 'opacity-60' 
                                          : isSelected 
                                            ? 'opacity-100 ring-2 ring-blue-500 ring-offset-1' 
                                            : 'opacity-30'
                                      }`}
                                      disabled={!isFilterEnabled}
                                    >
                                      <span className="sr-only">{color.label}</span>
                                      {isFilterEnabled && isSelected && (
                                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full flex items-center justify-center">
                                          <span className="text-white text-xs">✓</span>
                                        </div>
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      {color.label} views 
                                      {!isFilterEnabled ? ' (filter disabled)' : 
                                       isSelected ? ' (selected - will show)' : ' (click to select)'}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Filter Logic Toggle - Only show when both filters have options */}
                    {usedColors.length > 0 && usedIcons.length > 0 && (
                      <div className="mb-3 p-2 bg-gray-50 rounded border-l-4 border-blue-400">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-gray-700">Filter Logic</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-3 w-3 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="text-xs">
                                  <strong>AND:</strong> Views must match BOTH color AND icon selections<br/>
                                  <strong>OR:</strong> Views match EITHER color OR icon selections
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-gray-600">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleFilterLogic}
                            className={`h-6 px-3 text-xs font-mono ${
                              (userViewPreferences.filterLogic || 'AND') === 'AND' 
                                ? 'bg-blue-100 text-blue-800 border-blue-300' 
                                : 'bg-orange-100 text-orange-800 border-orange-300'
                            }`}
                          >
                            {userViewPreferences.filterLogic || 'AND'}
                          </Button>
                          {(userViewPreferences.filterLogic || 'AND') === 'AND' ? (
                            <span>Views must have a selected color <strong>AND</strong> a selected icon to show</span>
                          ) : (
                            <span>Views show if they have a selected color <strong>OR</strong> a selected icon (or both)</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Icon Filter Section */}
                    {usedIcons.length > 0 && (
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <label className="text-xs font-medium text-gray-600">Filter by Icon</label>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={userViewPreferences.iconFilters?.enabled || false}
                              onCheckedChange={toggleIconFilterEnabled}
                              className="data-[state=checked]:bg-blue-600"
                            />
                            <span className="text-xs text-gray-500">
                              {userViewPreferences.iconFilters?.enabled ? 'On' : 'Off'}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {usedIcons.map((icon) => {
                            const IconComponent = icon.component;
                            const visibleIcons = userViewPreferences.iconFilters?.visibleIcons || [];
                            const isSelected = visibleIcons.includes(icon.value);
                            const isFilterEnabled = userViewPreferences.iconFilters?.enabled;
                            return (
                              <TooltipProvider key={icon.value}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => toggleIconFilter(icon.value)}
                                      className={`h-6 w-6 p-0 relative ${
                                        !isFilterEnabled 
                                          ? 'opacity-60' 
                                          : isSelected 
                                            ? 'opacity-100 ring-2 ring-blue-500 ring-offset-1' 
                                            : 'opacity-30'
                                      }`}
                                      disabled={!isFilterEnabled}
                                    >
                                      <IconComponent className="h-3 w-3" />
                                      {isFilterEnabled && isSelected && (
                                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full flex items-center justify-center">
                                          <span className="text-white text-xs">✓</span>
                                        </div>
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      {icon.label} views 
                                      {!isFilterEnabled ? ' (filter disabled)' : 
                                       isSelected ? ' (selected - will show)' : ' (click to select)'}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Hidden Views List */}
                {hiddenCustomViews.length > 0 && (
                  <>
                    <h5 className="text-xs font-medium text-gray-600 mb-2 flex items-center">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Hidden Views ({hiddenCustomViews.length})
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {hiddenCustomViews.map((view) => {
                    const count = tabCounts[view.id] || 0;
                    return (
                      <div key={view.id} className="flex items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-xs mr-1 opacity-60"
                          disabled
                        >
                          <div className="flex items-center">
                            {(() => {
                              const IconComponent = getIconComponent(view.icon);
                              return IconComponent ? <IconComponent className="h-3 w-3 mr-1" /> : <Filter className="h-3 w-3 mr-1" />;
                            })()}
                            {view.groupByASN && <Users className="h-3 w-3 mr-1" />}
                            <span>{view.name} ({count} {view.groupByASN ? 'Students' : 'Records'})</span>
                          </div>
                        </Button>
                        <div className="flex">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleViewVisibility(view.id)}
                            className="h-6 w-6 p-0 hover:bg-green-100"
                            title="Show this view"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditView(view)}
                            className="h-6 w-6 p-0 hover:bg-blue-100"
                          >
                            <Settings className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Create View Button when no custom views exist */}
        {customViews.length === 0 && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateView}
              className="h-8 px-3 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Create Custom View
            </Button>
          </div>
        )}

        {/* Show message when all views are hidden */}
        {customViews.length > 0 && visibleCustomViews.length === 0 && (
          <div className="mt-4">
            <div className="text-sm text-gray-500 flex items-center">
              <EyeOff className="h-4 w-4 mr-1" />
              All custom views are hidden.
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowManageViews(true)}
                className="ml-2 h-6 px-2 text-xs text-blue-600 hover:text-blue-800"
              >
                Show hidden views
              </Button>
            </div>
          </div>
        )}

        <TabsContent value={activeTab} className="mt-6">
          {/* Custom View Description */}
          {(() => {
            const customView = customViews.find(view => view.id === activeTab);
            if (customView && (customView.description?.trim() || customView.groupByASN)) {
              const IconComponent = getIconComponent(customView.icon);
              return (
                <Card className="mb-4">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {IconComponent ? (
                          <IconComponent className="h-5 w-5 text-blue-600 mt-0.5" />
                        ) : (
                          <Filter className="h-5 w-5 text-blue-600 mt-0.5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          {customView.name}
                        </h4>
                        {customView.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {customView.description}
                          </p>
                        )}
                        {customView.groupByASN && (
                          <div className="flex items-start space-x-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                            <Users className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <div className="space-y-1">
                              <p className="font-medium">Grouped by Student</p>
                              <div className="text-xs text-blue-600/80">
                                Showing all courses for students who have at least one course matching the filter criteria. 
                                Records with <Target className="h-3 w-3 inline mx-1" /> matched the filter directly.
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }
            return null;
          })()}

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              {isLoadingStudents ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
                  <span>Loading records...</span>
                </div>
              ) : paginatedRecords.length > 0 ? (
                <div className="overflow-x-auto w-full border border-gray-200 rounded-lg">
                  <Table className="w-full relative">
                    <TableCaption>
                      Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, sortedRecords.length)} of {sortedRecords.length} records
                      {(() => {
                        const customView = customViews.find(view => view.id === activeTab);
                        if (customView?.groupByASN) {
                          const uniqueASNs = new Set(sortedRecords.map(r => r.asn).filter(asn => asn));
                          return ` (${uniqueASNs.size} students)`;
                        }
                        return '';
                      })()}
                    </TableCaption>
                    <TableHeader>
                      <TableRow>
                        {(() => {
                          const currentView = customViews.find(view => view.id === activeTab);
                          const baseDataSource = currentView?.baseDataSource || activeTab;
                          const isPasiOnlyView = baseDataSource === 'pasiOnly' || baseDataSource === 'allPasi';
                          
                          if (isPasiOnlyView) {
                            // PASI-only column layout
                            return (
                              <>
                                <TableHead className="w-6"></TableHead>
                                <SortableHeader column="asn" label="ASN" />
                                <SortableHeader column="studentName" label="Student Name" />
                                <SortableHeader column="courseCode" label="Course Code" />
                                <SortableHeader column="entryDate" label="Entry Date" />
                                <SortableHeader column="exitDate" label="Exit Date" />
                                <SortableHeader column="grade" label="Grade" />
                                <SortableHeader column="schoolYear" label="School Year" />
                                <SortableHeader column="status" label="Status" />
                                <SortableHeader column="term" label="Term" />
                                <TableHead className="text-xs px-1 py-1" >Actions</TableHead>
                              </>
                            );
                          } else {
                            // Standard column layout
                            return (
                              <>
                                <TableHead className="w-6"></TableHead>
                                <SortableHeader column="asn" label="ASN" />
                                <SortableHeader 
                                  column="studentName" 
                                  label="Student Name" 
                                />
                                <SortableHeader 
                                  column={
                                    activeTab === 'allYourWay' 
                                      ? 'Course_Value'
                                      : 'courseCode'
                                  } 
                                  label="Course"
                                />
                                <SortableHeader column="startDateFormatted" label="Reg Date" />
                                {shouldShowPasiColumns(activeTab, customViews) && (
                                  <SortableHeader 
                                    column="pasiTerm" 
                                    label="Term" 
                                  />
                                )}
                                {(activeTab !== 'pasiOnly' && activeTab !== 'allPasi' && 
                                  (!customViews.find(view => view.id === activeTab) || 
                                   (customViews.find(view => view.id === activeTab)?.baseDataSource !== 'pasiOnly' && 
                                    customViews.find(view => view.id === activeTab)?.baseDataSource !== 'allPasi'))) && (
                                  <SortableHeader column="StudentType_Value" label="Student Type" />
                                )}
                                <SortableHeader column="ActiveFutureArchived_Value" label="State" />
                                {shouldShowPasiColumns(activeTab, customViews) && (
                                  <SortableHeader column="status" label="PASI Status" />
                                )}
                                <SortableHeader 
                                  column="Status_Value"
                                  label="YourWay Status" 
                                />
                                <SortableHeader 
                                  column="payment_status"
                                  label="Payment Status" 
                                />
                                {shouldShowPasiColumns(activeTab, customViews) && (
                                  <SortableHeader column="grade" label="Grade" />
                                )}
                                {shouldShowPasiColumns(activeTab, customViews) && (
                                  <SortableHeader column="exitDate" label="Exit Date" />
                                )}
                                {(activeTab !== 'pasiOnly' && activeTab !== 'allPasi') && shouldShowPasiColumns(activeTab, customViews) && (
                                  <SortableHeader column="workItems" label={<AlertTriangle className="h-3 w-3" />} />
                                )}
                                <TableHead className="text-xs px-1 py-1" >Actions</TableHead>
                              </>
                            );
                          }
                        })()}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedRecords.map((record) => {
                        // Check if this is a PASI-only view first
                        const currentView = customViews.find(view => view.id === activeTab);
                        const baseDataSource = currentView?.baseDataSource || activeTab;
                        const isPasiOnlyView = baseDataSource === 'pasiOnly' || baseDataSource === 'allPasi';
                        
                        // Get student name for display
                        const fullName = (() => {
                          if (isPasiOnlyView) {
                            return record.studentName || 'N/A';
                          }
                          // Try first/last name first, then fall back to studentName
                          const firstLastName = `${record.firstName || ''} ${record.lastName || ''}`.trim();
                          return firstLastName || record.studentName || 'N/A';
                        })();
                        
                        // Get colors for styling based on ASN
                        const { backgroundColor, textColor } = getColorForASN(record.asn);
                        
                        
                        return (
                          <React.Fragment key={record.id || record.asn}>
                            {/* Main Record Row */}
                            <TableRow 
                              className={`cursor-pointer hover:bg-gray-100 border-b border-gray-200 ${
                                record._isDirectMatch ? 'bg-blue-50/30' : ''
                              } ${
                                selectedRowId === (record.id || record.asn) ? 'bg-yellow-100 border-yellow-300' : ''
                              }`}
                              onClick={(e) => {
                                // Only handle row click if it's not from a button or interactive element
                                if (e.target.closest('button') || e.target.closest('[role="button"]')) {
                                  return;
                                }
                                // Toggle row selection
                                const rowId = record.id || record.asn;
                                setSelectedRowId(selectedRowId === rowId ? null : rowId);
                                // Log record details to console for debugging
                                console.log('Record Details:', record);
                              }}
                            >
                              {isPasiOnlyView ? (
                                // PASI-only view cells
                                <>
                                  <TableCell className="p-1 w-6">
                                    <div className="flex items-center justify-center">
                                      {(() => {
                                        const customView = customViews.find(view => view.id === activeTab);
                                        if (customView && customView.groupByASN && record._isDirectMatch) {
                                          return (
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <div className="mr-1">
                                                  <Target className="h-3 w-3 text-blue-600" />
                                                </div>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p className="text-xs">Matched filter criteria</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          );
                                        }
                                        return null;
                                      })()}
                                    </div>
                                  </TableCell>
                                  
                                  {/* ASN */}
                                  <TableCell 
                                    className="p-1 cursor-pointer truncate max-w-14 w-14" 
                                    onClick={(e) => {
                                      handleCellClickWithSelection(record.asn, "ASN", record, e);
                                    }}
                                  >
                                    {record.asn || 'N/A'}
                                  </TableCell>
                                  
                                  {/* Student Name */}
                                  <TableCell 
                                    className="p-1 cursor-pointer truncate min-w-24 max-w-32" 
                                    onClick={(e) => {
                                      handleCellClickWithSelection(fullName, "Student Name", record, e);
                                    }}
                                  >
                                    <div 
                                      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium max-w-full truncate"
                                      style={{ 
                                        backgroundColor, 
                                        color: textColor
                                      }}
                                      title={fullName}
                                    >
                                      {formatNameResponsive(record.firstName, record.lastName, record.studentName, breakpoint)}
                                    </div>
                                  </TableCell>
                                  
                                  {/* Course Code */}
                                  <TableCell 
                                    className="p-1 cursor-pointer truncate min-w-12 max-w-20" 
                                    onClick={(e) => {
                                      handleCellClickWithSelection(record.courseCode || record.Course_Value, "Course Code", record, e);
                                    }}
                                  >
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="truncate">
                                          {formatCourseResponsive(record.courseCode, record.Course_Value, breakpoint) || 'N/A'}
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="max-w-xs">{record.courseDescription || record.courseCode || record.Course_Value || 'No description available'}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TableCell>
                                  
                                  {/* Entry Date */}
                                  <TableCell 
                                    className="p-1 cursor-pointer truncate min-w-12 max-w-20" 
                                    onClick={(e) => {
                                      handleCellClickWithSelection(record.entryDate, "Entry Date", record, e);
                                    }}
                                  >
                                    {record.entryDate && record.entryDate !== '-' ? (
                                      <div 
                                        className="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium truncate"
                                        style={{
                                          backgroundColor: '#dcfce7', // green-100
                                          color: '#166534' // green-800
                                        }}
                                        title={formatDate(record.entryDate)}
                                      >
                                        {formatDateResponsive(record.entryDate, breakpoint)}
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">N/A</span>
                                    )}
                                  </TableCell>
                                  
                                  {/* Exit Date */}
                                  <TableCell 
                                    className="p-1 cursor-pointer truncate min-w-12 max-w-20" 
                                    onClick={(e) => {
                                      handleCellClickWithSelection(record.exitDate, "Exit Date", record, e);
                                    }}
                                  >
                                    {record.exitDate && record.exitDate !== '-' ? (
                                      <div 
                                        className="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium truncate"
                                        style={{
                                          backgroundColor: '#fee2e2', // red-100
                                          color: '#b91c1c' // red-800
                                        }}
                                        title={formatDate(record.exitDate)}
                                      >
                                        {formatDateResponsive(record.exitDate, breakpoint)}
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">N/A</span>
                                    )}
                                  </TableCell>
                                  
                                  {/* Grade */}
                                  <TableCell 
                                    className="p-1 cursor-pointer truncate max-w-10 w-10" 
                                    onClick={(e) => {
                                      handleCellClickWithSelection(record.grade, "Grade", record, e);
                                    }}
                                  >
                                    {record.grade !== undefined && record.grade !== null ? (
                                      <div className="flex items-center gap-1 cursor-pointer">
                                        <Edit className="h-3 w-3 text-blue-500" />
                                        <span className="font-medium truncate">
                                          {record.grade}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">N/A</span>
                                    )}
                                  </TableCell>
                                  
                                  {/* School Year */}
                                  <TableCell 
                                    className="p-1 cursor-pointer truncate max-w-16 w-16" 
                                    onClick={(e) => {
                                      handleCellClickWithSelection(record.schoolYear, "School Year", record, e);
                                    }}
                                  >
                                    <Badge 
                                      variant="outline" 
                                      className="bg-purple-50 text-purple-700 border-purple-200 text-xs py-0 px-1.5 truncate"
                                    >
                                      {record.schoolYear || 'N/A'}
                                    </Badge>
                                  </TableCell>
                                  
                                  {/* Status */}
                                  <TableCell 
                                    className="p-1 cursor-pointer truncate min-w-12 max-w-20" 
                                    onClick={(e) => {
                                      handleCellClickWithSelection(record.status, "Status", record, e);
                                    }}
                                  >
                                    <Badge 
                                      variant={record.status === 'Completed' ? 'success' : 'secondary'}
                                      className={`
                                        text-xs py-0 px-1.5 truncate
                                        ${record.status === 'Completed' 
                                          ? 'bg-green-50 text-green-700 border-green-200' 
                                          : record.status === 'Active'
                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                        }
                                      `}
                                      title={record.status || 'N/A'}
                                    >
                                      {formatStatusResponsive(record.status, breakpoint)}
                                    </Badge>
                                  </TableCell>
                                  
                                  {/* Term */}
                                  <TableCell 
                                    className="p-1 cursor-pointer truncate min-w-12 max-w-16" 
                                    onClick={(e) => {
                                      handleCellClickWithSelection(record.term, "Term", record, e);
                                    }}
                                  >
                                    <Badge 
                                      variant="outline" 
                                      className="bg-blue-50 text-blue-700 border-blue-200 text-xs py-0 px-1.5 truncate"
                                      title={record.term || record.period || 'N/A'}
                                    >
                                      {record.term || record.period || 'N/A'}
                                    </Badge>
                                  </TableCell>
                                  
                                  {/* Actions */}
                                  <TableCell className="p-1" >
                                    <div className="flex items-center space-x-1">
                                      <PasiActionButtons 
                                        asn={record.asn} 
                                        referenceNumber={record.referenceNumber}
                                        onViewDetails={() => handleRecordSelect(record)}
                                      />
                                    </div>
                                  </TableCell>
                                </>
                              ) : (
                                // Standard view cells
                                <>
                                  <TableCell className="p-1 w-6">
                                    <div className="flex items-center justify-center">
                                      {(() => {
                                        const customView = customViews.find(view => view.id === activeTab);
                                        if (customView && customView.groupByASN && record._isDirectMatch) {
                                          return (
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <div className="mr-1">
                                                  <Target className="h-3 w-3 text-blue-600" />
                                                </div>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p className="text-xs">Matched filter criteria</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          );
                                        }
                                        return null;
                                      })()}
                                    </div>
                                  </TableCell>
                                  
                                  {/* ASN */}
                                  <TableCell 
                                    className="p-1 cursor-pointer truncate max-w-14 w-14" 
                                    onClick={(e) => {
                                      handleCellClickWithSelection(record.asn, "ASN", record, e);
                                    }}
                                  >
                                    {record.asn || 'N/A'}
                                  </TableCell>
                                  
                                  {/* Student Name */}
                                  <TableCell 
                                    className="p-1 cursor-pointer truncate min-w-24 max-w-32" 
                                    onClick={(e) => {
                                      handleCellClickWithSelection(fullName, "Student Name", record, e);
                                    }}
                                  >
                                    <div 
                                      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium max-w-full truncate"
                                      style={{ 
                                        backgroundColor, 
                                        color: textColor
                                      }}
                                      title={fullName}
                                    >
                                      {formatNameResponsive(record.firstName, record.lastName, record.studentName, breakpoint)}
                                    </div>
                                  </TableCell>
                                  
                                  {/* Course */}
                                  <TableCell 
                                    className="p-1 cursor-pointer truncate min-w-12 max-w-20" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const courseValue = activeTab === 'allYourWay' 
                                        ? (record.Course_Value || record.courseCode)
                                        : (record.courseCode || record.Course_Value);
                                      handleCellClick(courseValue, "Course");
                                    }}
                                  >
                                    {activeTab === 'allYourWay' 
                                      ? formatCourseResponsive(record.Course_Value, record.courseCode, breakpoint) || 'N/A'
                                      : formatCourseResponsive(record.courseCode, record.Course_Value, breakpoint) || 'N/A'
                                    }
                                  </TableCell>
                                  
                                  {/* Registration Date Cell */}
                                  <TableCell 
                                    className="p-1 cursor-pointer truncate min-w-12 max-w-20" 
                                    onClick={(e) => {
                                      handleCellClickWithSelection(record.startDateFormatted, "Registration Date", record, e);
                                    }}
                                  >
                                    {record.startDateFormatted && record.startDateFormatted !== 'N/A' ? (
                                      <div 
                                        className="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium truncate"
                                        style={{
                                          backgroundColor: '#dbeafe', // blue-100
                                          color: '#1e40af' // blue-800
                                        }}
                                        title={record.startDateFormatted}
                                      >
                                        {formatDateResponsive(record.startDateFormatted, breakpoint)}
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">N/A</span>
                                    )}
                                  </TableCell>
                                  
                                  {/* Term Cell - only show when PASI columns should be shown */}
                                  {shouldShowPasiColumns(activeTab, customViews) && (
                                    <TableCell 
                                      className="p-1 cursor-pointer truncate max-w-16 w-16" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCellClick(record.pasiTerm, "Term");
                                      }}
                                    >
                                      <Badge 
                                        variant="outline" 
                                        className="bg-blue-50 text-blue-700 border-blue-200 text-xs py-0 px-1.5 truncate"
                                      >
                                        {record.pasiTerm || 'N/A'}
                                      </Badge>
                                    </TableCell>
                                  )}
                                  
                                  {/* Student Type Cell - only show for non-PASI tabs */}
                                  {(activeTab !== 'pasiOnly' && activeTab !== 'allPasi' && 
                                    (!customViews.find(view => view.id === activeTab) || 
                                     (customViews.find(view => view.id === activeTab)?.baseDataSource !== 'pasiOnly' && 
                                      customViews.find(view => view.id === activeTab)?.baseDataSource !== 'allPasi'))) && (
                                    <TableCell 
                                      className="p-1 cursor-pointer truncate max-w-20 w-20" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCellClick(record.StudentType_Value, "Student Type");
                                      }}
                                    >
                                      {record.StudentType_Value ? (
                                        (() => {
                                          const { color, icon: IconComponent } = getStudentTypeInfo(record.StudentType_Value);
                                          return (
                                            <div 
                                              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium truncate"
                                              style={{
                                                backgroundColor: `${color}20`, // Add transparency
                                                color: color,
                                                border: `1px solid ${color}40`
                                              }}
                                              title={record.StudentType_Value}
                                            >
                                              {IconComponent && <IconComponent className="h-2.5 w-2.5 mr-1 flex-shrink-0" />}
                                              <span className="truncate">{record.StudentType_Value}</span>
                                            </div>
                                          );
                                        })()
                                      ) : (
                                        <span className="text-gray-400">N/A</span>
                                      )}
                                    </TableCell>
                                  )}
                                  
                                  {/* State Cell - show for all tabs */}
                                  <TableCell 
                                    className="p-1 cursor-pointer truncate max-w-20 w-20" 
                                    onClick={(e) => {
                                      handleCellClickWithSelection(record.ActiveFutureArchived_Value, "State", record, e);
                                    }}
                                  >
                                    {record.ActiveFutureArchived_Value ? (
                                      <div 
                                        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium truncate"
                                        style={{
                                          backgroundColor: `${getActiveFutureArchivedColor(record.ActiveFutureArchived_Value)}20`, // Add transparency
                                          color: getActiveFutureArchivedColor(record.ActiveFutureArchived_Value),
                                          border: `1px solid ${getActiveFutureArchivedColor(record.ActiveFutureArchived_Value)}40`
                                        }}
                                        title={record.ActiveFutureArchived_Value}
                                      >
                                        <span className="truncate">{record.ActiveFutureArchived_Value}</span>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">N/A</span>
                                    )}
                                  </TableCell>
                                  
                                  {/* PASI Status - show for all views with PASI records */}
                                  {shouldShowPasiColumns(activeTab, customViews) && (
                                    <TableCell 
                                      className="p-1 cursor-pointer truncate min-w-12 max-w-20" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCellClick(record.status, "PASI Status");
                                      }}
                                    >
                                      <Badge 
                                        variant="outline"
                                        className={getStatusBadgeClass(record.status)}
                                        title={record.status || 'N/A'}
                                      >
                                        {formatStatusResponsive(record.status, breakpoint)}
                                      </Badge>
                                    </TableCell>
                                  )}
                                  
                                  {/* YourWay Status */}
                                  <TableCell 
                                    className="p-1 cursor-pointer truncate min-w-12 max-w-20" 
                                    onClick={(e) => {
                                      handleCellClickWithSelection(record.Status_Value, "YourWay Status", record, e);
                                    }}
                                  >
                                    <Badge 
                                      variant={record.Status_Value === 'Completed' ? 'success' : 'secondary'}
                                      className={`
                                        text-xs py-0 px-1.5 truncate
                                        ${record.Status_Value === 'Completed' 
                                          ? 'bg-green-50 text-green-700 border-green-200' 
                                          : record.Status_Value === 'Active'
                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                        }
                                      `}
                                      title={record.Status_Value || 'N/A'}
                                    >
                                      {formatStatusResponsive(record.Status_Value, breakpoint)}
                                    </Badge>
                                  </TableCell>
                                  
                                  {/* Payment Status Cell */}
                                  <TableCell className="p-1 truncate min-w-12 max-w-20">
                                    {record.payment_status ? (
                                      <Badge 
                                        variant="outline"
                                        className={`text-xs py-0 px-1.5 truncate`}
                                        style={{
                                          backgroundColor: `${getPaymentStatusColor(record.payment_status)}20`,
                                          color: getPaymentStatusColor(record.payment_status),
                                          borderColor: `${getPaymentStatusColor(record.payment_status)}40`
                                        }}
                                        title={record.payment_status || 'N/A'}
                                      >
                                        {record.payment_status}
                                      </Badge>
                                    ) : (
                                      <span className="text-xs text-gray-400">Not Set</span>
                                    )}
                                  </TableCell>
                                  
                                  {/* Grade Cell - only show when PASI columns should be shown */}
                                  {shouldShowPasiColumns(activeTab, customViews) && (
                                    <TableCell 
                                      className="p-1 cursor-pointer truncate max-w-10 w-10" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCellClick(record.grade || record.PercentCompleteGradebook, "Grade");
                                      }}
                                    >
                                      {(record.grade !== undefined && record.grade !== null) || record.PercentCompleteGradebook ? (
                                        <div className="flex items-center gap-1 cursor-pointer">
                                          <Edit className="h-3 w-3 text-blue-500" />
                                          <span className="font-medium truncate">
                                            {record.grade !== undefined && record.grade !== null ? record.grade : `${record.PercentCompleteGradebook}%`}
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-gray-400">N/A</span>
                                      )}
                                    </TableCell>
                                  )}
                                  
                                  {/* Exit Date Cell - only show when PASI columns should be shown */}
                                  {shouldShowPasiColumns(activeTab, customViews) && (
                                    <TableCell 
                                    className="p-1 cursor-pointer truncate min-w-12 max-w-20" 
                                    onClick={(e) => {
                                      handleCellClickWithSelection(record.exitDateFormatted || record.exitDate, "Exit Date", record, e);
                                    }}
                                  >
                                    {record.exitDateFormatted && record.exitDateFormatted !== 'N/A' ? (
                                      <div 
                                        className="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium truncate"
                                        style={{
                                          backgroundColor: '#fee2e2', // red-100
                                          color: '#b91c1c' // red-800
                                        }}
                                        title={record.exitDateFormatted}
                                      >
                                        <Edit className="h-2.5 w-2.5 mr-1 flex-shrink-0" />
                                        <span className="truncate">{formatDateResponsive(record.exitDateFormatted, breakpoint)}</span>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">N/A</span>
                                    )}
                                  </TableCell>
                                  )}
                                  
                                  {/* Work Items Cell - only show for non-PASI tabs and when PASI columns should be shown */}
                                  {(activeTab !== 'pasiOnly' && activeTab !== 'allPasi') && shouldShowPasiColumns(activeTab, customViews) && (
                                    <TableCell className="p-1 w-6 max-w-6">
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <div className="flex items-center justify-center">
                                              {(() => {
                                                if (!record.workItems) return null;
                                                if (record.workItems === 'Advice') {
                                                  return <Info className="h-3 w-3 text-blue-500" />;
                                                } else if (record.workItems === 'Warning') {
                                                  return <AlertTriangle className="h-3 w-3 text-amber-500" />;
                                                } else if (record.workItems === 'Unknown') {
                                                  return <HelpCircle className="h-3 w-3 text-purple-500" />;
                                                } else {
                                                  return <BellRing className="h-3 w-3 text-gray-500" />;
                                                }
                                              })()}
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>{record.workItems || 'No work items'}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </TableCell>
                                  )}
                                  
                                  {/* Actions Cell */}
                                  <TableCell className="p-1" >
                                    <div className="flex items-center space-x-1">
                                      <PasiActionButtons 
                                        asn={record.asn} 
                                        referenceNumber={record.referenceNumber}
                                        onViewDetails={() => handleRecordSelect(record)}
                                      />
                                    </div>
                                  </TableCell>
                                </>
                              )}
                            </TableRow>
                          </React.Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No records found matching your search.' : 'No records found.'}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
      </div>

      {/* Custom View Creation/Edit Modal */}
      <CustomViewModal
        isOpen={showCreateViewModal}
        onClose={() => setShowCreateViewModal(false)}
        editingView={editingView}
        onSave={handleSaveView}
        onDelete={handleDeleteView}
        baseDataSources={BASE_DATA_SOURCES}
        filterableFields={FILTERABLE_FIELDS}
        operators={OPERATORS}
        teacherCategories={teacherCategories}
      />


      {/* Details Sheet */}
      <Sheet open={isDetailsSheetOpen} onOpenChange={setIsDetailsSheetOpen}>
        <SheetContent className="w-[75vw] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Record Details</SheetTitle>
            <SheetDescription>
              {selectedRecord && (
                `${selectedRecord.studentName || `${selectedRecord.firstName} ${selectedRecord.lastName}`} - ${selectedRecord.courseCode || selectedRecord.Course_Value}`
              )}
            </SheetDescription>
          </SheetHeader>
          
          {selectedRecord && (
            <div className="mt-4">
              <PasiRecordDetails
                record={selectedRecord}
                onClose={() => setIsDetailsSheetOpen(false)}
                handleCellClick={handleCellClick}
                onRecordUpdate={handleRecordUpdate}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
      
      {/* PDF Generation Sheet */}
      <PDFGenerationSheet
        isOpen={isPDFGenerationOpen}
        onOpenChange={setIsPDFGenerationOpen}
        filteredRecords={filteredRecords}
        selectedRecords={selectedPasiRecords ? Object.values(selectedPasiRecords) : []}
        schoolYear={currentSchoolYear}
      />
      
      {/* CSV Export Sheet */}
      <CSVExportSheet
        isOpen={isCSVExportOpen}
        onOpenChange={setIsCSVExportOpen}
        filteredRecords={filteredRecords}
        selectedRecords={selectedPasiRecords ? Object.values(selectedPasiRecords) : []}
        schoolYear={currentSchoolYear}
      />
    </TooltipProvider>
  );
};

export default PasiRecordsSimplified;