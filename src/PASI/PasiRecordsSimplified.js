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
  ChevronDown,
  ChevronRight,
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
  Activity
} from 'lucide-react';
import { useSchoolYear } from '../context/SchoolYearContext';
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../components/ui/sheet";
import PasiActionButtons from "../components/PasiActionButtons";
import PasiRecordDetails from "../TeacherDashboard/PasiRecordDetails";
import { toast } from 'sonner';
import { getDatabase, ref, push, onValue, off, remove, update } from 'firebase/database';

const ITEMS_PER_PAGE = 20;

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

// Field definitions for filtering
const FILTERABLE_FIELDS = {
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
  ActiveFutureArchived_Value: { label: 'Active/Future/Archived', type: 'text' },
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
  instructionalMinutesReceived: { label: 'Instructional Minutes Received', type: 'text' }
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
  ]
};

// Base data sources for custom views
const BASE_DATA_SOURCES = [
  { value: 'linked', label: 'Linked Records' },
  { value: 'summaryOnly', label: 'YourWay Only Records' },
  { value: 'pasiOnly', label: 'PASI Only Records' },
  { value: 'allPasi', label: 'All PASI Records' },
  { value: 'allYourWay', label: 'All YourWay Records' }
];

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

// Helper function to get icon component
const getIconComponent = (iconValue) => {
  if (!iconValue) return null;
  const iconData = AVAILABLE_ICONS.find(icon => icon.value === iconValue);
  return iconData ? iconData.component : null;
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
  operators = OPERATORS
}) => {
  // Local form state isolated to this component
  const [localFormState, setLocalFormState] = useState({
    newViewName: '',
    newViewDescription: '',
    newViewIcon: 'filter',
    newViewBaseSource: 'linked',
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

  // Reset form when modal opens/closes or editingView changes
  useEffect(() => {
    if (isOpen) {
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
          newViewBaseSource: editingView.baseDataSource,
          newViewConditions: conditions
        });
      } else {
        // Reset for new view
        setLocalFormState({
          newViewName: '',
          newViewDescription: '',
          newViewIcon: 'filter',
          newViewBaseSource: 'linked',
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
    const field = filterableFields[fieldName];
    if (!field) return [];
    return operators[field.type] || [];
  };

  const needsValueInput = (operator) => {
    return !['is_empty', 'is_not_empty', 'exists', 'not_exists', 'is_true', 'is_false'].includes(operator);
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

          {/* Filter Conditions - Grouped */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Filter Conditions</Label>
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
                            {Object.entries(filterableFields).map(([key, field]) => (
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
                      </div>

                      {/* Value Input */}
                      <div className="space-y-1">
                        <Label className="text-xs">Value</Label>
                        <Input
                          placeholder="Enter value"
                          value={condition.value}
                          onChange={(e) => updateCondition(group.id, conditionIndex, 'value', e.target.value)}
                          disabled={!condition.operator || !needsValueInput(condition.operator)}
                          className="h-8 text-xs"
                        />
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

const PasiRecordsSimplified = () => {
  const { 
    pasiStudentSummariesCombined, 
    pasiRecordsNew, 
    studentSummaries, 
    isLoadingStudents, 
    currentSchoolYear 
  } = useSchoolYear();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('linked');
  const [expandedRows, setExpandedRows] = useState({});
  const [selectedPasiRecords, setSelectedPasiRecords] = useState({});
  const [sortState, setSortState] = useState({ column: 'studentName', direction: 'asc' });
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  
  // Custom view states
  const [showCreateViewModal, setShowCreateViewModal] = useState(false);
  const [customViews, setCustomViews] = useState([]);
  const [isLoadingCustomViews, setIsLoadingCustomViews] = useState(true);
  const [editingView, setEditingView] = useState(null);

  // Load custom views from Firebase
  useEffect(() => {
    const database = getDatabase();
    const customViewsRef = ref(database, 'customViews/pasiRecords');
    
    const unsubscribe = onValue(customViewsRef, (snapshot) => {
      const data = snapshot.val();
      console.log('Firebase custom views data:', data); // Debug log
      if (data) {
        const viewsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        console.log('Processed custom views:', viewsArray); // Debug log
        setCustomViews(viewsArray);
      } else {
        console.log('No custom views found'); // Debug log
        setCustomViews([]);
      }
      setIsLoadingCustomViews(false);
    });

    return () => {
      off(customViewsRef, 'value', unsubscribe);
    };
  }, []);

  // Helper function to evaluate a single condition
  const evaluateCondition = (record, condition) => {
    console.log('🔍 Evaluating condition:', {
      field: condition.field,
      operator: condition.operator,
      value: condition.value,
      fieldValue: record[condition.field]
    });
    
    if (!condition.field || !condition.operator) {
      console.log('❌ Invalid condition - missing field or operator');
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
        result = !fieldValue || fieldValue === '' || fieldValue === 'N/A';
        break;
      case 'is_not_empty':
        result = fieldValue && fieldValue !== '' && fieldValue !== 'N/A';
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
      default:
        result = false;
    }
    
    console.log(`✅ Condition result: ${result}`);
    return result;
  };

  // Enhanced filter function for grouped conditions
  const applyCustomFilter = (records, conditionsConfig) => {
    console.log('🎯 applyCustomFilter called with:', {
      recordCount: records.length,
      conditionsConfig,
      isArray: Array.isArray(conditionsConfig)
    });
    
    // Handle legacy format (simple array of conditions)
    if (Array.isArray(conditionsConfig)) {
      console.log('📊 Using legacy filter format');
      return applyLegacyFilter(records, conditionsConfig);
    }
    
    // Handle new grouped format
    if (!conditionsConfig || !conditionsConfig.groups || conditionsConfig.groups.length === 0) {
      console.log('⚠️ No conditions config or empty groups, returning all records');
      return records;
    }
    
    console.log('🔄 Processing grouped conditions:', {
      groupCount: conditionsConfig.groups.length,
      groupLogic: conditionsConfig.groupLogic
    });
    
    const filteredRecords = records.filter((record, recordIndex) => {
      // Only log for first few records to avoid console spam
      const shouldLog = recordIndex < 3;
      if (shouldLog) {
        console.log(`🔍 Processing record ${recordIndex + 1}:`, {
          asn: record.asn,
          studentName: record.studentName,
          firstName: record.firstName,
          lastName: record.lastName
        });
      }
      
      const groupResults = [];
      
      // Evaluate each group
      for (let groupIndex = 0; groupIndex < conditionsConfig.groups.length; groupIndex++) {
        const group = conditionsConfig.groups[groupIndex];
        
        if (shouldLog) {
          console.log(`📁 Evaluating Group ${groupIndex + 1}:`, {
            conditionCount: group.conditions?.length || 0,
            internalLogic: group.internalLogic
          });
        }
        
        if (!group.conditions || group.conditions.length === 0) {
          if (shouldLog) console.log('📁 Empty group, defaulting to true');
          groupResults.push(true);
          continue;
        }
        
        // Filter out invalid conditions
        const validConditions = group.conditions.filter(c => c.field && c.operator);
        if (validConditions.length === 0) {
          if (shouldLog) console.log('📁 No valid conditions in group, defaulting to true');
          groupResults.push(true);
          continue;
        }
        
        // Evaluate conditions within the group
        let groupResult = true;
        const groupLogic = group.internalLogic || 'AND';
        
        if (shouldLog) {
          console.log(`📁 Processing ${validConditions.length} valid conditions with ${groupLogic} logic`);
        }
        
        for (let i = 0; i < validConditions.length; i++) {
          const condition = validConditions[i];
          if (shouldLog) {
            console.log(`🔸 Condition ${i + 1}/${validConditions.length}:`);
          }
          
          const conditionResult = evaluateCondition(record, condition);
          
          if (i === 0) {
            groupResult = conditionResult;
            if (shouldLog) console.log(`🔸 First condition result: ${groupResult}`);
          } else {
            const previousResult = groupResult;
            if (groupLogic === 'AND') {
              groupResult = groupResult && conditionResult;
            } else if (groupLogic === 'OR') {
              groupResult = groupResult || conditionResult;
            }
            if (shouldLog) {
              console.log(`🔸 Combined: ${previousResult} ${groupLogic} ${conditionResult} = ${groupResult}`);
            }
          }
        }
        
        if (shouldLog) {
          console.log(`📁 Group ${groupIndex + 1} final result: ${groupResult}`);
        }
        groupResults.push(groupResult);
      }
      
      // Combine group results using groupLogic
      let finalResult = groupResults[0] || false;
      const globalGroupLogic = conditionsConfig.groupLogic || 'AND';
      
      if (shouldLog) {
        console.log(`🎯 Combining ${groupResults.length} group results with ${globalGroupLogic}:`, groupResults);
      }
      
      for (let i = 1; i < groupResults.length; i++) {
        const previousResult = finalResult;
        if (globalGroupLogic === 'AND') {
          finalResult = finalResult && groupResults[i];
        } else if (globalGroupLogic === 'OR') {
          finalResult = finalResult || groupResults[i];
        }
        if (shouldLog) {
          console.log(`🎯 Global combine: ${previousResult} ${globalGroupLogic} ${groupResults[i]} = ${finalResult}`);
        }
      }
      
      if (shouldLog) {
        console.log(`🎯 Record ${recordIndex + 1} FINAL RESULT: ${finalResult}`);
        console.log('---');
      }
      
      return finalResult;
    });
    
    console.log(`🎯 Filter complete: ${records.length} → ${filteredRecords.length} records`);
    return filteredRecords;
  };

  // Legacy filter function for backwards compatibility
  const applyLegacyFilter = (records, conditions) => {
    console.log('📊 Legacy filter called with:', {
      recordCount: records.length,
      conditionCount: conditions?.length || 0,
      conditions
    });
    
    if (!conditions || conditions.length === 0) {
      console.log('⚠️ No legacy conditions, returning all records');
      return records;
    }
    
    const validConditions = conditions.filter(c => c.field && c.operator);
    console.log(`📊 Valid legacy conditions: ${validConditions.length}/${conditions.length}`);
    
    if (validConditions.length === 0) {
      console.log('⚠️ No valid legacy conditions, returning all records');
      return records;
    }
    
    const filteredRecords = records.filter((record, recordIndex) => {
      const shouldLog = recordIndex < 3;
      if (shouldLog) {
        console.log(`📊 Legacy: Processing record ${recordIndex + 1}`);
      }
      
      let result = true;
      let currentLogic = 'AND';
      
      for (let i = 0; i < validConditions.length; i++) {
        const condition = validConditions[i];
        if (shouldLog) {
          console.log(`📊 Legacy condition ${i + 1}:`);
        }
        
        const conditionResult = evaluateCondition(record, condition);
        
        if (i === 0) {
          result = conditionResult;
          if (shouldLog) console.log(`📊 Legacy first result: ${result}`);
        } else {
          const previousResult = result;
          if (currentLogic === 'AND') {
            result = result && conditionResult;
          } else if (currentLogic === 'OR') {
            result = result || conditionResult;
          }
          if (shouldLog) {
            console.log(`📊 Legacy combined: ${previousResult} ${currentLogic} ${conditionResult} = ${result}`);
          }
        }
        
        currentLogic = condition.logicOperator || 'AND';
      }
      
      if (shouldLog) {
        console.log(`📊 Legacy record ${recordIndex + 1} final: ${result}`);
      }
      
      return result;
    });
    
    console.log(`📊 Legacy filter complete: ${records.length} → ${filteredRecords.length} records`);
    return filteredRecords;
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
          if (!pasiStudentSummariesCombined) return [];
          records = [...pasiStudentSummariesCombined];
          // Apply base filter
          if (customView.baseDataSource === 'linked') {
            records = records.filter(r => r.recordType === 'linked');
          } else if (customView.baseDataSource === 'summaryOnly') {
            records = records.filter(r => r.recordType === 'summaryOnly');
          } else if (customView.baseDataSource === 'pasiOnly') {
            records = records.filter(r => r.recordType === 'pasiOnly');
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
      
      // Apply custom filters
      console.log('🎯 Applying custom view filters:', {
        viewName: customView.name,
        baseDataSource: customView.baseDataSource,
        recordsBeforeFilter: records.length,
        conditions: customView.conditions
      });
      records = applyCustomFilter(records, customView.conditions);
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
    return [...processedRecords].sort((a, b) => {
      let aValue = a[sortState.column] || '';
      let bValue = b[sortState.column] || '';
      
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
  }, [processedRecords, sortState]);

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
    
    return counts;
  }, [pasiStudentSummariesCombined, pasiRecordsNew, studentSummaries]);

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  // Reset page when search or tab changes
  React.useEffect(() => {
    setCurrentPage(1);
    setExpandedRows({}); // Reset expanded rows when filters change
    setIsDetailsSheetOpen(false); // Close details sheet when filters change
    setSelectedRecord(null); // Clear selected record
  }, [searchTerm, activeTab]);

  // Toggle expanded state for a row
  const toggleExpanded = (recordId, event) => {
    event.stopPropagation(); // Prevent any row click handlers
    setExpandedRows(prev => ({
      ...prev,
      [recordId]: !prev[recordId]
    }));
  };

  // Handle cell click to copy to clipboard
  const handleCellClick = (content, label) => {
    if (!content || content === 'N/A') return;
    
    navigator.clipboard.writeText(content);
    
    // Truncate long content for toast message
    const displayText = content.length > 25 ? `${content.substring(0, 25)}...` : content;
    toast.success(`Copied ${label ? label + ': ' : ''}${displayText}`);
  };

  // Handle record selection and open details sheet
  const handleRecordSelect = (record) => {
    setSelectedRecord(record);
    setIsDetailsSheetOpen(true);
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
        setActiveTab('linked');
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
        baseDataSource: formData.newViewBaseSource,
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
            <Badge variant="outline">{filteredRecords.length} records</Badge>
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
              </h3>
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
            <div className="flex flex-wrap gap-2">
              {customViews.map((view) => {
                const isActive = activeTab === view.id;
                const matchedRecords = applyCustomFilter(
                  (() => {
                    switch (view.baseDataSource) {
                      case 'linked':
                        return pasiStudentSummariesCombined?.filter(r => r.recordType === 'linked') || [];
                      case 'summaryOnly':
                        return pasiStudentSummariesCombined?.filter(r => r.recordType === 'summaryOnly') || [];
                      case 'pasiOnly':
                        return pasiStudentSummariesCombined?.filter(r => r.recordType === 'pasiOnly') || [];
                      case 'allPasi':
                        return pasiRecordsNew || [];
                      case 'allYourWay':
                        return studentSummaries || [];
                      default:
                        return [];
                    }
                  })(),
                  view.conditions
                ).length;

                return (
                  <div key={view.id} className="flex items-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={isActive ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveTab(view.id)}
                          className="h-8 px-3 text-xs mr-1"
                        >
                          {(() => {
                            const IconComponent = getIconComponent(view.icon);
                            return IconComponent ? <IconComponent className="h-3 w-3 mr-1" /> : <Filter className="h-3 w-3 mr-1" />;
                          })()}
                          {view.name} ({matchedRecords})
                        </Button>
                      </TooltipTrigger>
                      {view.description && (
                        <TooltipContent>
                          <p className="max-w-xs">{view.description}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                    <div className="flex">
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

        <TabsContent value={activeTab} className="mt-6">
          {/* Custom View Description */}
          {(() => {
            const customView = customViews.find(view => view.id === activeTab);
            if (customView && customView.description && customView.description.trim()) {
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
                        <p className="text-sm text-gray-600">
                          {customView.description}
                        </p>
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
                <div className="overflow-x-auto">
                  <Table>
                    <TableCaption>
                      Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, sortedRecords.length)} of {sortedRecords.length} records
                    </TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-6"></TableHead>
                        <SortableHeader column="asn" label="ASN" />
                        <SortableHeader 
                          column="studentName" 
                          label="Student Name" 
                        />
                        <SortableHeader 
                          column={
                            activeTab === 'pasiOnly' || activeTab === 'allPasi' 
                              ? 'courseDescription' 
                              : activeTab === 'allYourWay' 
                                ? 'Course_Value'
                                : 'courseCode'
                          } 
                          label={
                            activeTab === 'pasiOnly' || activeTab === 'allPasi' 
                              ? 'Course Description' 
                              : 'Course'
                          } 
                        />
                        <SortableHeader column="startDateFormatted" label="Reg Date" />
                        <SortableHeader 
                          column="pasiTerm" 
                          label="Term" 
                        />
                        {((activeTab === 'linked' || activeTab === 'summaryOnly') || 
                          (customViews.find(view => view.id === activeTab)?.baseDataSource === 'linked' || 
                           customViews.find(view => view.id === activeTab)?.baseDataSource === 'summaryOnly')) && (
                          <SortableHeader column="status" label="PASI Status" />
                        )}
                        <SortableHeader 
                          column={
                            activeTab === 'pasiOnly' || activeTab === 'allPasi'
                              ? 'status' 
                              : 'Status_Value'
                          } 
                          label="YourWay Status" 
                        />
                        <SortableHeader column="grade" label="Grade" />
                        <SortableHeader column="exitDate" label="Exit Date" />
                        {(activeTab !== 'pasiOnly' && activeTab !== 'allPasi') && (
                          <SortableHeader column="workItems" label={<AlertTriangle className="h-3 w-3" />} />
                        )}
                        <TableHead className="text-xs px-1 py-1 w-32 max-w-32 truncate">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedRecords.map((record) => {
                        const isExpanded = expandedRows[record.id] || false;
                        const hasMultipleRecords = record.pasiRecordCount > 1;
                        
                        // Get colors for styling student name - different logic for different tabs
                        const fullName = (activeTab === 'pasiOnly' || activeTab === 'allPasi')
                          ? record.studentName || 'N/A'
                          : `${record.firstName || ''} ${record.lastName || ''}`.trim();
                        const { backgroundColor, textColor } = getColorForName(fullName);
                        
                        return (
                          <React.Fragment key={record.id || record.asn}>
                            {/* Main Record Row */}
                            <TableRow 
                              className={`cursor-pointer hover:bg-gray-100 border-b border-gray-200 ${isExpanded && hasMultipleRecords ? 'border-b-0' : ''}`}
                              onClick={() => handleRecordSelect(record)}
                            >
                              <TableCell className="p-1 w-6">
                                {hasMultipleRecords ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0"
                                    onClick={(e) => toggleExpanded(record.id, e)}
                                  >
                                    {isExpanded ? 
                                      <ChevronDown className="h-3 w-3" /> : 
                                      <ChevronRight className="h-3 w-3" />
                                    }
                                  </Button>
                                ) : null}
                              </TableCell>
                              
                              <TableCell 
                                className="p-1 cursor-pointer truncate max-w-14 w-14" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCellClick(record.asn, "ASN");
                                }}
                              >
                                {record.asn || 'N/A'}
                              </TableCell>
                              
                              <TableCell 
                                className="p-1 cursor-pointer truncate max-w-32 w-32" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCellClick(fullName, "Student Name");
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
                                  {fullName || 'N/A'}
                                </div>
                              </TableCell>
                              
                              <TableCell 
                                className="p-1 cursor-pointer truncate max-w-16 w-16" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const courseValue = (activeTab === 'pasiOnly' || activeTab === 'allPasi') 
                                    ? record.courseDescription 
                                    : record.Course_Value;
                                  handleCellClick(courseValue, (activeTab === 'pasiOnly' || activeTab === 'allPasi') ? 'Course Description' : 'Course');
                                }}
                              >
                                {(activeTab === 'pasiOnly' || activeTab === 'allPasi') ? (record.courseDescription || 'N/A') : (record.Course_Value || 'N/A')}
                              </TableCell>
                              
                              {/* Registration Date Cell */}
                              <TableCell 
                                className="p-1 cursor-pointer truncate max-w-20 w-20" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCellClick(record.startDateFormatted, "Registration Date");
                                }}
                              >
                                {record.startDateFormatted && record.startDateFormatted !== 'N/A' ? (
                                  <div 
                                    className="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium truncate"
                                    style={{
                                      backgroundColor: '#dbeafe', // blue-100
                                      color: '#1e40af' // blue-800
                                    }}
                                  >
                                    {record.startDateFormatted}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">N/A</span>
                                )}
                              </TableCell>
                              
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
                              
                              {((activeTab === 'linked' || activeTab === 'summaryOnly') || 
                                (customViews.find(view => view.id === activeTab)?.baseDataSource === 'linked' || 
                                 customViews.find(view => view.id === activeTab)?.baseDataSource === 'summaryOnly')) && (
                                <TableCell 
                                  className="p-1 cursor-pointer truncate max-w-16 w-16" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCellClick(record.status, "PASI Status");
                                  }}
                                >
                                  <Badge 
                                    variant="outline"
                                    className={getStatusBadgeClass(record.status)}
                                  >
                                    {record.status || 'N/A'}
                                  </Badge>
                                </TableCell>
                              )}
                              
                              <TableCell 
                                className="p-1 cursor-pointer truncate max-w-16 w-16" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const statusValue = (activeTab === 'pasiOnly' || activeTab === 'allPasi') 
                                    ? record.status 
                                    : record.Status_Value;
                                  handleCellClick(statusValue, "YourWay Status");
                                }}
                              >
                                <Badge 
                                  variant={(activeTab === 'pasiOnly' || activeTab === 'allPasi' ? record.status : record.Status_Value) === 'Completed' ? 'success' : 'secondary'}
                                  className={`
                                    text-xs py-0 px-1.5 truncate
                                    ${(activeTab === 'pasiOnly' || activeTab === 'allPasi' ? record.status : record.Status_Value) === 'Completed' 
                                      ? 'bg-green-50 text-green-700 border-green-200' 
                                      : (activeTab === 'pasiOnly' || activeTab === 'allPasi' ? record.status : record.Status_Value) === 'Active'
                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }
                                  `}
                                >
                                  {(activeTab === 'pasiOnly' || activeTab === 'allPasi') ? (record.status || 'N/A') : (record.Status_Value || 'N/A')}
                                </Badge>
                              </TableCell>
                              
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
                              
                              <TableCell 
                                className="p-1 cursor-pointer truncate max-w-20 w-20" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCellClick(record.exitDateFormatted || record.exitDate, "Exit Date");
                                }}
                              >
                                {record.exitDateFormatted && record.exitDateFormatted !== 'N/A' ? (
                                  <div 
                                    className="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium truncate"
                                    style={{
                                      backgroundColor: '#fee2e2', // red-100
                                      color: '#b91c1c' // red-800
                                    }}
                                  >
                                    <Edit className="h-2.5 w-2.5 mr-1 flex-shrink-0" />
                                    <span className="truncate">{record.exitDateFormatted}</span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">N/A</span>
                                )}
                              </TableCell>
                              
                              {/* Work Items Cell - only show for non-PASI tabs */}
                              {(activeTab !== 'pasiOnly' && activeTab !== 'allPasi') && (
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
                              <TableCell className="p-1 w-32 max-w-32 truncate">
                                <div className="flex items-center space-x-1">
                                  <PasiActionButtons 
                                    asn={record.asn} 
                                    referenceNumber={record.referenceNumber}
                                    onViewDetails={() => handleRecordSelect(record)}
                                  />
                                </div>
                              </TableCell>
                            </TableRow>
                            
                            {/* Multiple PASI Records Dropdown */}
                            {hasMultipleRecords && isExpanded && record.pasiRecords && (
                              <TableRow className="bg-gray-50">
                                <TableCell colSpan={(() => {
                                  const currentView = customViews.find(view => view.id === activeTab);
                                  const baseDataSource = currentView?.baseDataSource || activeTab;
                                  
                                  if (baseDataSource === 'pasiOnly' || baseDataSource === 'allPasi') {
                                    return 10;
                                  } else if (baseDataSource === 'linked' || baseDataSource === 'summaryOnly' || activeTab === 'linked' || activeTab === 'summaryOnly') {
                                    return 12;
                                  } else {
                                    return 11;
                                  }
                                })()} className="p-0">
                                  <div className="bg-blue-50 border-t-2 border-blue-200">
                                    <div className="p-3">
                                      <div className="flex items-center mb-3">
                                        <Database className="h-4 w-4 text-blue-600 mr-2" />
                                        <span className="text-sm font-medium text-blue-700">
                                          {record.pasiRecordCount || Object.keys(record.pasiRecords).length} PASI Records
                                        </span>
                                      </div>
                                      <div className="space-y-2">
                                        {Object.entries(record.pasiRecords).map(([key, pasiRecord]) => (
                                          <div 
                                            key={pasiRecord.pasiRecordID || key} 
                                            className="bg-white rounded-lg p-3 border border-blue-200 hover:border-blue-300 transition-colors"
                                          >
                                            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
                                              {/* Course Code */}
                                              <div>
                                                <span className="text-gray-500 block">Course Code</span>
                                                <span className="font-semibold text-gray-700 uppercase">{key}</span>
                                              </div>
                                              
                                              {/* Course Description */}
                                              <div className="col-span-2">
                                                <span className="text-gray-500 block">Course Description</span>
                                                <span className="font-medium text-gray-700 truncate block" title={pasiRecord.courseDescription}>
                                                  {pasiRecord.courseDescription || 'N/A'}
                                                </span>
                                              </div>
                                              
                                              {/* School Year */}
                                              <div>
                                                <span className="text-gray-500 block">School Year</span>
                                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs px-2 py-0">
                                                  {pasiRecord.schoolYear || 'N/A'}
                                                </Badge>
                                              </div>
                                              
                                              {/* Term */}
                                              <div>
                                                <span className="text-gray-500 block">Term</span>
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2 py-0">
                                                  {pasiRecord.term || pasiRecord.period || 'N/A'}
                                                </Badge>
                                              </div>
                                              
                                              {/* Credits */}
                                              <div>
                                                <span className="text-gray-500 block">Credits</span>
                                                <span className="font-medium text-gray-700">
                                                  {pasiRecord.creditsAttempted || 'N/A'}
                                                </span>
                                              </div>
                                            </div>
                                            
                                            {/* Additional details on second row if needed */}
                                            {(pasiRecord.period || pasiRecord.pasiRecordID) && (
                                              <div className="mt-2 pt-2 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                                {pasiRecord.period && pasiRecord.period !== pasiRecord.term && (
                                                  <div>
                                                    <span className="text-gray-500 block">Period</span>
                                                    <span className="text-gray-700">{pasiRecord.period}</span>
                                                  </div>
                                                )}
                                                {pasiRecord.pasiRecordID && (
                                                  <div className="col-span-2">
                                                    <span className="text-gray-500 block">PASI Record ID</span>
                                                    <span className="text-gray-600 font-mono text-xs truncate block" title={pasiRecord.pasiRecordID}>
                                                      {pasiRecord.pasiRecordID}
                                                    </span>
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
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
      />

      {/* Details Sheet */}
      <Sheet open={isDetailsSheetOpen} onOpenChange={setIsDetailsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
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
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
};

export default PasiRecordsSimplified;