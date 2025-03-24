import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { STATUS_OPTIONS, STATUS_CATEGORIES, getStatusColor, getStatusAllowsAutoStatus, getStudentTypeInfo, COURSE_OPTIONS, getCourseInfo, ACTIVE_FUTURE_ARCHIVED_OPTIONS } from '../config/DropdownOptions';
import { ChevronDown, Plus, CheckCircle, BookOpen, MessageSquare, X, Zap, History, AlertTriangle, ArrowUp, ArrowDown, Maximize2, Trash2, UserCheck, User, CircleSlash, Circle, Square, Triangle, BookOpen as BookOpenIcon, GraduationCap, Trophy, Target, ClipboardCheck, Brain, Lightbulb, Clock, Calendar as CalendarIcon, BarChart, TrendingUp, AlertCircle, HelpCircle, MessageCircle, Users, Presentation, FileText, Bookmark, Grid2X2, Database, CheckCircle2, AlertOctagon, Archive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { getDatabase, ref, set, get, push, remove, update  } from 'firebase/database';
import { Button } from "../components/ui/button";
import { Toggle } from "../components/ui/toggle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from "../components/ui/dropdown-menu";
import { Badge } from "../components/ui/badge";
import ChatApp from '../chat/ChatApp';
import { useAuth } from '../context/AuthContext';
import { Checkbox } from "../components/ui/checkbox";
import StudentDetail from './StudentDetail';
import { useMode, MODES } from '../context/ModeContext';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../components/ui/tooltip";
import { TutorialButton } from '../components/TutorialButton';
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import PasiRecordsDialog from './PasiRecordsDialog';
import AsnIssuesDialog from './AsnIssuesDialog';
import PendingFinalizationDialog from './Dialog/PendingFinalizationDialog';
import ResumingOnDialog from './Dialog/ResumingOnDialog';

// Helper function to safely extract values from status objects
const getSafeValue = (value) => {
  if (value === undefined || value === null) return '';
  
  // If it's not an object, return it directly
  if (typeof value !== 'object') return value;
  
  // Handle SharePoint object format
  if (value.Value !== undefined) return value.Value;
  if (value.SharepointValue !== undefined) return value.SharepointValue;
  if (value.value !== undefined) return value.value;
  
  // Last resort - try to show something useful
  try {
    return JSON.stringify(value);
  } catch (e) {
    return '[Complex Object]';
  }
};

// Map icon names to icon components
const iconMap = {
  'circle': Circle,
  'square': Square,
  'triangle': Triangle,
  'book-open': BookOpenIcon,
  'graduation-cap': GraduationCap,
  'trophy': Trophy,
  'target': Target,
  'clipboard-check': ClipboardCheck,
  'brain': Brain,
  'lightbulb': Lightbulb,
  'clock': Clock,
  'calendar': CalendarIcon,
  'bar-chart': BarChart,
  'trending-up': TrendingUp,
  'alert-circle': AlertCircle,
  'help-circle': HelpCircle,
  'message-circle': MessageCircle,
  'users': Users,
  'presentation': Presentation,
  'file-text': FileText,
  'bookmark': Bookmark,
};

// Define color palette outside the component
const colorPalette = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F06292', '#AED581', '#FFD54F', '#4DB6AC', '#7986CB',
  '#9575CD', '#4DD0E1', '#81C784', '#DCE775', '#FFB74D',
  '#F06292', '#BA68C8', '#4FC3F7', '#4DB6AC', '#FFF176',
  '#FF8A65', '#A1887F', '#90A4AE', '#E57373', '#64B5F6'
];

const getColorFromInitials = (initials) => {
  let hash = 0;
  for (let i = 0; i < initials.length; i++) {
    hash = initials.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorPalette[Math.abs(hash) % colorPalette.length];
};

// Add Gender Display Configuration
const GENDER_DISPLAY_CONFIG = {
  male: {
    Icon: User,
    color: '#3B82F6', // Blue-500
    label: 'Male'
  },
  female: {
    Icon: User,
    color: '#EC4899', // Pink-500
    label: 'Female'
  },
  'prefer-not-to-say': {
    Icon: CircleSlash,
    color: '#9CA3AF', // Gray-400
    label: 'Prefer not to say'
  }
};

// GenderBadge Component
const GenderBadge = ({ gender }) => {
  if (!gender || !GENDER_DISPLAY_CONFIG[gender]) return null;

  const config = GENDER_DISPLAY_CONFIG[gender];
  const IconComponent = config.Icon;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <div 
            className="inline-flex items-center rounded-full w-5 h-5 justify-center"
            style={{ 
              backgroundColor: `${config.color}15`,
              color: config.color
            }}
          >
            <IconComponent className="w-3 h-3" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          Gender: {config.label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const StudentCard = React.memo(({ 
  student, 
  index, 
  selectedStudentId, 
  onStudentSelect, 
  teacherCategories,
  categoryTypes,
  user_email_key,
  isSelected,
  onSelectionChange,
  isPartOfMultiSelect,
  onBulkStatusChange,
  onBulkCategoryChange,
  onBulkAutoStatusToggle,
  isMobile,
  onCourseRemoved,
  studentAsns
}) => {
  
  const { currentMode } = useMode();
  const bgColor = selectedStudentId === student.id 
    ? 'bg-blue-100' 
    : index % 2 === 0 
      ? 'bg-white' 
      : 'bg-gray-50';
  const displayName = (student?.preferredFirstName || student?.firstName || '?');
  const lastName = (student?.lastName || '?');
  const initials = `${displayName[0] || '?'}${lastName[0] || '?'}`;
  const avatarColor = getColorFromInitials(initials);

  // Get safe status value from potentially complex object
  const safeStatusValue = getSafeValue(student?.Status_Value);
  
  // Initialize statusValue from the safe value
  const [statusValue, setStatusValue] = useState(safeStatusValue || '');
  const [autoStatus, setAutoStatus] = useState(student?.autoStatus || false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [teacherNames, setTeacherNames] = useState({});
  
  // State variables for status history dialog
  const [isStatusHistoryOpen, setIsStatusHistoryOpen] = useState(false);
  const [statusHistory, setStatusHistory] = useState([]);
  const [loadingStatusHistory, setLoadingStatusHistory] = useState(false);

  // State variable for expanded view
  const [isExpanded, setIsExpanded] = useState(false);

  // New state variable for removal dialog
  const [isRemovalDialogOpen, setIsRemovalDialogOpen] = useState(false);

  // Access the logged-in teacher's info
  const { user } = useAuth();

  const customHoverStyle = "hover:bg-accent hover:text-accent-foreground";

  const [isPasiDialogOpen, setIsPasiDialogOpen] = useState(false);

  const [isAsnIssuesDialogOpen, setIsAsnIssuesDialogOpen] = useState(false);

  const [isPendingFinalizationOpen, setIsPendingFinalizationOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [isResumingOnOpen, setIsResumingOnOpen] = useState(false);


  const checkAsnIssues = useMemo(() => {
    if (!student.asn || !studentAsns) return true;  // Show button if no ASN or no studentAsns data
    
    // Check if student's ASN exists in studentAsns
    const asnData = studentAsns[student.asn];
    if (!asnData) return true;  // Show button if ASN not found
  
    // Check for multiple email keys set to true
    const emailKeys = asnData.emailKeys || {};
    const trueEmailKeys = Object.entries(emailKeys)
      .filter(([_, value]) => value === true)
      .length;
  
    return trueEmailKeys > 1;  // Show button only if multiple email keys are true
  }, [student.asn, studentAsns]);
 

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'No timestamp available';
    try {
      const date = new Date(timestamp);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return 'Invalid timestamp';
    }
  };
  
  useEffect(() => {
    // Update status value when the student prop changes, handling potential object values
    setStatusValue(getSafeValue(student.Status_Value));
    setAutoStatus(student.autoStatus || false);
  }, [student.Status_Value, student.autoStatus]);

  useEffect(() => {
    const fetchTeacherNames = async () => {
      const db = getDatabase();
      const staffRef = ref(db, 'staff');
      try {
        const snapshot = await get(staffRef);
        if (snapshot.exists()) {
          const staffData = snapshot.val();
          const names = Object.entries(staffData).reduce((acc, [email, data]) => {
            acc[email] = `${data.firstName} ${data.lastName}`;
            return acc;
          }, {});
          setTeacherNames(names);
        }
      } catch (error) {
        console.error("Error fetching teacher names:", error);
      }
    };

    fetchTeacherNames();
  }, []);

 // Add this before your updateStatus function
const validateActiveFutureArchivedValue = useCallback((value) => {
  if (!value) return true; // No value is valid (not all statuses need to set this)
  
  const isValid = ACTIVE_FUTURE_ARCHIVED_OPTIONS.some(option => option.value === value);
  
  if (!isValid) {
    console.error(`Invalid ActiveFutureArchived value: ${value}. Must be one of: ${
      ACTIVE_FUTURE_ARCHIVED_OPTIONS.map(option => option.value).join(', ')
    }`);
  }
  
  return isValid;
}, []);

// Then update the updateStatus function
const updateStatus = useCallback(async (newStatus) => {
  const db = getDatabase();
  const lastUnderscoreIndex = student.id.lastIndexOf('_');
  const studentKey = student.id.slice(0, lastUnderscoreIndex);
  const courseId = student.id.slice(lastUnderscoreIndex + 1);
  
  try {
    const previousStatus = statusValue;
    const selectedStatusOption = STATUS_OPTIONS.find(option => option.value === newStatus);

    // Don't proceed with status update if delay is true
    if (selectedStatusOption?.delay) {
      return;
    }

    // Validate ActiveFutureArchived value if present
    if (selectedStatusOption?.activeFutureArchivedValue && 
        !validateActiveFutureArchivedValue(selectedStatusOption.activeFutureArchivedValue)) {
      throw new Error(`Invalid ActiveFutureArchived value configured for status: ${newStatus}`);
    }

    // Start all updates
    const updates = {};
    
    // Only update Status/Value if not delayed
    updates[`students/${studentKey}/courses/${courseId}/Status/Value`] = newStatus;
    
    // If status has an associated ActiveFutureArchived value, set it
    if (selectedStatusOption?.activeFutureArchivedValue) {
      updates[`students/${studentKey}/courses/${courseId}/ActiveFutureArchived/Value`] = 
        selectedStatusOption.activeFutureArchivedValue;
    }

    // Handle auto status changes
    let newAutoStatus;
    if (selectedStatusOption?.allowAutoStatusChange === true) {
      updates[`students/${studentKey}/courses/${courseId}/autoStatus`] = true;
      newAutoStatus = true;
    } else {
      updates[`students/${studentKey}/courses/${courseId}/autoStatus`] = false;
      newAutoStatus = false;
    }

    // Create status log entry
    const statusLogRef = ref(db, `students/${studentKey}/courses/${courseId}/statusLog`);
    const newLogRef = push(statusLogRef);
    updates[`students/${studentKey}/courses/${courseId}/statusLog/${newLogRef.key}`] = {
      timestamp: new Date().toISOString(),
      status: newStatus,
      previousStatus: previousStatus || '',
      updatedBy: {
        name: user.displayName || user.email,
        email: user.email,
      },
      updatedByType: 'teacher',
      autoStatus: newAutoStatus,
    };

    // Only perform updates if there are changes to make
    if (Object.keys(updates).length > 0) {
      const dbRef = ref(db);
      await update(dbRef, updates);

      // Update local state
      setStatusValue(newStatus);
      setAutoStatus(newAutoStatus);

      if (isPartOfMultiSelect) {
        onBulkStatusChange(newStatus, student.id);
      }
    }

  } catch (error) {
    console.error("Error updating status:", error);
    // You might want to show an error notification to the user here
  }
}, [student.id, statusValue, user, isPartOfMultiSelect, onBulkStatusChange, validateActiveFutureArchivedValue]);

const isStatusEligibleForAutoChange = useCallback((statusValue) => {
  // Get safe value in case statusValue is an object
  const safeStatus = getSafeValue(statusValue);
  const statusOption = STATUS_OPTIONS.find(option => option.value === safeStatus);
  return statusOption?.allowAutoStatusChange === true;
}, []);

const isCurrentStatusEligibleForAutoChange = useCallback((currentStatusValue) => {
  // Get safe value in case currentStatusValue is an object
  const safeStatus = getSafeValue(currentStatusValue);
  const statusOption = STATUS_OPTIONS.find(option => option.value === safeStatus);
  return statusOption?.allowAutoStatusChange === true;
}, []);


const handleAutoStatusButtonClick = useCallback(async (e) => {
  e.stopPropagation(); // Prevent card click
  
  // Only proceed if there's an auto status value and it's eligible for auto change
  if (!student.autoStatus_Value || !isStatusEligibleForAutoChange(student.autoStatus_Value)) {
    return;
  }
  
  // Use the existing updateStatus function to update the status
  await updateStatus(getSafeValue(student.autoStatus_Value));
}, [student.autoStatus_Value, isStatusEligibleForAutoChange, updateStatus]);


const handleStatusChange = useCallback(async (newStatus) => {
  const selectedStatusOption = STATUS_OPTIONS.find(option => option.value === newStatus);
  
  // Check for action first
  if (selectedStatusOption?.action === "PENDING_FINALIZATION") {
    setPendingStatus(newStatus);
    setIsPendingFinalizationOpen(true);
    return;
  }
  
  // Then check for the specific status value
  if (selectedStatusOption?.value === "Resuming on (date)") {
    setIsResumingOnOpen(true);
    return;
  }

  await updateStatus(newStatus);
}, [updateStatus]);

  const handleAutoStatusToggle = useCallback(async () => {
    if (!getStatusAllowsAutoStatus(statusValue)) return;

    const db = getDatabase();
    const lastUnderscoreIndex = student.id.lastIndexOf('_');
    const studentKey = student.id.slice(0, lastUnderscoreIndex);
    const courseId = student.id.slice(lastUnderscoreIndex + 1);
    const autoStatusRef = ref(db, `students/${studentKey}/courses/${courseId}/autoStatus`);

    try {
      const newAutoStatus = !autoStatus;
      await set(autoStatusRef, newAutoStatus);
      setAutoStatus(newAutoStatus);

      // If this is part of a multi-select, update other selected students
      if (isPartOfMultiSelect) {
        onBulkAutoStatusToggle(newAutoStatus, student.id);
      }
    } catch (error) {
      console.error("Error updating auto status:", error);
    }
  }, [student.id, autoStatus, statusValue, isPartOfMultiSelect, onBulkAutoStatusToggle]);

  const handleCategoryChange = useCallback(async (categoryId, teacherEmailKey) => {
    const db = getDatabase();
    const lastUnderscoreIndex = student.id.lastIndexOf('_');
    const studentKey = student.id.slice(0, lastUnderscoreIndex);
    const courseId = student.id.slice(lastUnderscoreIndex + 1);
    const categoryRef = ref(db, `students/${studentKey}/courses/${courseId}/categories/${teacherEmailKey}/${categoryId}`);

    try {
      await set(categoryRef, true);
      
      // If this is part of a multi-select, update other selected students
      if (isPartOfMultiSelect) {
        onBulkCategoryChange(categoryId, teacherEmailKey, student.id, true);
      }
    } catch (error) {
      console.error("Error adding category:", error);
    }
  }, [student.id, isPartOfMultiSelect, onBulkCategoryChange]);

  const handleRemoveCategory = useCallback(async (categoryId, teacherEmailKey) => {
    const db = getDatabase();
    const lastUnderscoreIndex = student.id.lastIndexOf('_');
    const studentKey = student.id.slice(0, lastUnderscoreIndex);
    const courseId = student.id.slice(lastUnderscoreIndex + 1);
    const categoryRef = ref(db, `students/${studentKey}/courses/${courseId}/categories/${teacherEmailKey}/${categoryId}`);
  
    try {
      // Set to false instead of removing the node
      await set(categoryRef, false);
      
      if (isPartOfMultiSelect) {
        onBulkCategoryChange(categoryId, teacherEmailKey, student.id, false);
      }
    } catch (error) {
      console.error("Error updating category:", error);
    }
  }, [student.id, isPartOfMultiSelect, onBulkCategoryChange]);

  // In StudentCard.js
  const handleRemoveCourse = useCallback(async () => {
    const db = getDatabase();
    const lastUnderscoreIndex = student.id.lastIndexOf('_');
    const studentKey = student.id.slice(0, lastUnderscoreIndex);
    const courseId = student.id.slice(lastUnderscoreIndex + 1);
    const courseRef = ref(db, `students/${studentKey}/courses/${courseId}`);
  
    try {
      await remove(courseRef);
      setIsRemovalDialogOpen(false);
      // Call the parent callback with student and course info
      onCourseRemoved(
        `${student.preferredFirstName || student.firstName} ${student.lastName}`,
        getSafeValue(student.Course_Value)
      );
    } catch (error) {
      console.error("Error removing course:", error);
    }
  }, [student.id, student.preferredFirstName, student.firstName, student.lastName, student.Course_Value, onCourseRemoved]);

  const groupedTeacherCategories = useMemo(() => {
    if (!teacherCategories || typeof teacherCategories !== 'object') {
      console.error('teacherCategories is not an object:', teacherCategories);
      return {};
    }

    if (Object.values(teacherCategories).every(Array.isArray)) {
      const grouped = teacherCategories;
      return grouped;
    }

    if (Array.isArray(teacherCategories)) {
      const grouped = { [user_email_key]: teacherCategories };
      return grouped;
    }

    console.error('Unexpected teacherCategories format:', teacherCategories);
    return {};
  }, [teacherCategories, user_email_key]);

  const filteredTeacherCategories = useMemo(() => {
    if (!teacherCategories || typeof teacherCategories !== 'object') {
      console.error('teacherCategories is not an object:', teacherCategories);
      return {};
    }

    const studentCategories = student.categories || {};

    const filtered = Object.entries(teacherCategories).reduce((acc, [teacherEmailKey, categories]) => {
      if (Array.isArray(categories)) {
        const filteredCategories = categories.filter(category => {
          const isAlreadyAdded = studentCategories[teacherEmailKey] && 
                                 studentCategories[teacherEmailKey][category.id] === true;
          return !isAlreadyAdded;
        });
        if (filteredCategories.length > 0) {
          acc[teacherEmailKey] = filteredCategories;
        }
      }
      return acc;
    }, {});

    return filtered;
  }, [teacherCategories, student.categories]);

  const handleCardClick = useCallback(() => {
      onStudentSelect(student);
  }, [isMobile, onStudentSelect, student]);

  const handleSelectClick = useCallback((event) => {
    event.stopPropagation();
    if (!isSelected) {
      onStudentSelect(student);
    }
  }, [isSelected, onStudentSelect, student]);

  const handleOpenChat = useCallback((event) => {
    event.stopPropagation();
    setIsChatOpen(true);
  }, []);

  const initialParticipantsMemo = useMemo(() => {
    return [
      {
        email: student.StudentEmail,
        displayName: `${student.preferredFirstName || student.firstName} ${student.lastName}`,
        type: 'student',
      },
    ];
  }, [student.StudentEmail, student.preferredFirstName, student.firstName, student.lastName]);

  // Safely get the last week status value
  const lastWeekStatus = getSafeValue(student.StatusCompare);
  const lastWeekColor = getStatusColor(lastWeekStatus);

  // Compute selectedCategories from student.categories
  const selectedCategories = useMemo(() => {
    if (!student.categories) return [];
  
    const activeCategoriesSet = new Set();
    return Object.entries(student.categories)
      .flatMap(([teacherEmailKey, categories]) =>
        Object.entries(categories)
          .filter(([_, value]) => value === true)
          .map(([categoryId]) => {
            const uniqueKey = `${categoryId}-${teacherEmailKey}`;
            if (!activeCategoriesSet.has(uniqueKey)) {
              activeCategoriesSet.add(uniqueKey);
              // Find the category in groupedTeacherCategories
              const categoryData = groupedTeacherCategories[teacherEmailKey]?.find(c => c.id === categoryId);
              
              // Only include categories that we can find the data for
              if (categoryData) {
                return {
                  id: categoryId,
                  teacherEmailKey,
                  category: categoryData
                };
              }
              return null; // Skip categories we can't find data for
            }
            return null;
          })
      )
      .filter(Boolean);
  }, [student.categories, groupedTeacherCategories]);

  const currentStatusColor = useMemo(() => getStatusColor(statusValue), [statusValue]);

  const currentStatusOption = useMemo(() => 
    STATUS_OPTIONS.find(option => option.value === statusValue),
    [statusValue]
  );

  const StatusOption = React.memo(({ option }) => {
    const IconComponent = option.alertLevel?.icon || Circle;
    
    return (
      <div className="flex items-center w-full">
        <div className="flex-shrink-0 mr-2">
          <IconComponent 
            className="w-4 h-4" 
            style={{ color: option.alertLevel?.color || option.color }}
          />
        </div>
        <span style={{ color: option.alertLevel?.color || option.color }}>
          {option.value}
        </span>
      </div>
    );
  });

  const isAutoStatusAllowed = useMemo(() => getStatusAllowsAutoStatus(statusValue), [statusValue]);

  const handleOpenStatusHistory = useCallback(async () => {
    setIsStatusHistoryOpen(true);
    setLoadingStatusHistory(true);

    const db = getDatabase();
    const lastUnderscoreIndex = student.id.lastIndexOf('_');
    const studentKey = student.id.slice(0, lastUnderscoreIndex);
    const courseId = student.id.slice(lastUnderscoreIndex + 1);
    const statusLogRef = ref(db, `students/${studentKey}/courses/${courseId}/statusLog`);

    try {
      const snapshot = await get(statusLogRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const historyArray = Object.values(data).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setStatusHistory(historyArray);
      } else {
        setStatusHistory([]);
      }
    } catch (error) {
      console.error("Error fetching status history:", error);
    } finally {
      setLoadingStatusHistory(false);
    }
  }, [student.id]);

  // Function to determine grade color and icon
  const getGradeColorAndIcon = useCallback((grade) => {
    if (grade < 50) return { color: 'text-red-500', icon: <AlertTriangle className="w-4 h-4" /> };
    if (grade < 70) return { color: 'text-black', icon: null };
    return { color: 'text-green-500', icon: <CheckCircle className="w-4 h-4" /> };
  }, []);

  // Function to format grade
  const formatGrade = useCallback((grade) => {
    if (grade === undefined || grade === null || grade === 0) return null;
    const roundedGrade = Math.round(grade);
    return `${roundedGrade}%`;
  }, []);

  // Function to format lessons behind/ahead
  const formatLessons = useCallback((lessonsBehind) => {
    if (lessonsBehind === undefined || lessonsBehind === null) return null;
    const absValue = Math.abs(lessonsBehind);
    if (lessonsBehind < 0) {
      return { value: absValue, icon: <ArrowUp className="w-4 h-4 text-green-500" /> };
    }
    return { value: absValue, icon: <ArrowDown className="w-4 h-4 text-red-500" /> };
  }, []);

  const handleExpandClick = useCallback((e) => {
    setIsExpanded(true);
  }, []);

  const findCourseById = (courseId) => {
    return COURSE_OPTIONS.find(course => String(course.courseId) === String(courseId));
  };

  const groupedStatusOptions = useMemo(() => {
    return STATUS_OPTIONS.reduce((acc, option) => {
      if (!acc[option.category]) {
        acc[option.category] = [];
      }
      acc[option.category].push(option);
      return acc;
    }, {});
  }, []);
  
  // Add a debugging section to help identify problematic students
  const hasObjectStatusValue = typeof student.Status_Value === 'object' && student.Status_Value !== null;

  return (
    <>
    <TooltipProvider>
      <Card
        className={`transition-shadow duration-200 ${bgColor} hover:shadow-md mb-3 ${!isMobile ? 'cursor-pointer' : ''}`}
        onClick={handleCardClick}
      >
        <CardHeader className="p-3 pb-2">
          {/* First row with checkbox, avatar, name, expand button, and migration badge */}
          <div className="flex items-start space-x-3 mb-2">
            <div 
              className="flex items-center" 
              onClick={(e) => {
                
              }}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={onSelectionChange}
                aria-label={`Select ${student.firstName} ${student.lastName}`}
              />
            </div>
            <Avatar className="w-10 h-10">
              <AvatarFallback 
                className="text-sm font-medium" 
                style={{ backgroundColor: avatarColor, color: '#FFFFFF' }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base font-medium truncate flex items-center gap-2">
                {student.preferredFirstName || student.firstName} {student.lastName}
                <TutorialButton 
                  tutorialId="student-card" 
                  tooltipText="Learn about student cards" 
                />
              </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExpandClick}
                  aria-label="Expand student details"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>

             {(!student.hasSchedule || student.inOldSharePoint !== false) && (
              <div className="mt-1 space-y-1">
                <div className="inline-flex items-center bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Needs Migration
                </div>
              </div>
            )}

            {/* Add a debugging badge for students with object Status_Value */}
            {hasObjectStatusValue && (
              <div className="mt-1 space-y-1">
                <div className="inline-flex items-center bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Complex Status Object
                </div>
              </div>
            )}
            </div>
            {selectedStudentId === student.id && !isSelected && (
              <CheckCircle className="w-5 h-5 text-blue-500" />
            )}
          </div>

          {/* Updated Section with GenderBadge */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 truncate">
                {student.StudentEmail}
              </span>
              <GenderBadge gender={student.gender} />
            </div>
            {student.StudentType_Value && (
              <Badge 
                className="flex items-center gap-1 px-2 py-0.5 h-5 text-[10px] font-medium border-0 rounded"
                style={{
                  backgroundColor: `${getStudentTypeInfo(getSafeValue(student.StudentType_Value)).color}15`,
                  color: getStudentTypeInfo(getSafeValue(student.StudentType_Value)).color
                }}
              >
                {getStudentTypeInfo(getSafeValue(student.StudentType_Value)).icon && 
                  React.createElement(getStudentTypeInfo(getSafeValue(student.StudentType_Value)).icon, {
                    className: "w-3 h-3"
                  })
                }
                {getSafeValue(student.StudentType_Value)}
              </Badge>
            )}
          </div> 

        </CardHeader>
        <CardContent className="p-3 pt-2">
          {/* Course, Grade, and Progress on the same line */}
          <div className="flex items-center text-xs mb-2">
            <span className="flex-grow flex items-center">
              {student.CourseID ? (
                (() => {
                  const courseInfo = findCourseById(student.CourseID);
                  return (
                    <Badge 
                      className="flex items-center gap-2 px-3 py-1 h-7 text-sm font-medium border-0 rounded-md shadow-sm"
                      style={{
                        backgroundColor: `${courseInfo?.color || '#6B7280'}15`,
                        color: courseInfo?.color || '#6B7280'
                      }}
                    >
                      {React.createElement(courseInfo?.icon || BookOpen, {
                        className: "w-4 h-4"
                      })}
                      {courseInfo?.label || `Course ${student.CourseID}`}
                    </Badge>
                  );
                })()
              ) : (
                <Badge 
                  className="flex items-center gap-2 px-3 py-1 h-7 text-sm font-medium border-0 rounded-md shadow-sm"
                  style={{
                    backgroundColor: '#6B728015',
                    color: '#6B7280'
                  }}
                >
                  <BookOpen className="w-4 h-4" />
                  No Course
                </Badge>
              )}
            </span>
            {student.grade !== undefined && 
              student.grade !== null && 
              student.grade !== 0 && (
              <span className={`text-xs font-bold ${getGradeColorAndIcon(student.grade).color} flex items-center mr-2`}>
                Gr. {formatGrade(student.grade)}
                {getGradeColorAndIcon(student.grade).icon}
              </span>
            )}
            {student.adherenceMetrics && formatLessons(student.adherenceMetrics.lessonsBehind) && (
              <span className="text-xs font-bold flex items-center">
                {formatLessons(student.adherenceMetrics.lessonsBehind).value}
                {formatLessons(student.adherenceMetrics.lessonsBehind).icon}
              </span>
            )}
          </div>
                    
          {/* Status Dropdown, Last Week Status, and Auto Status Toggle */}
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex-grow">
           
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between"
                    style={{ 
                      borderColor: currentStatusOption?.alertLevel?.color || currentStatusColor,
                      color: currentStatusOption?.alertLevel?.color || currentStatusColor 
                    }}
                  >
                    <div className="flex items-center">
                      {React.createElement(
                        currentStatusOption?.alertLevel?.icon || Circle,
                        { 
                          className: "w-4 h-4 mr-2",
                          style: { 
                            color: currentStatusOption?.alertLevel?.color || currentStatusColor 
                          }
                        }
                      )}
                      {statusValue === "Resuming on (date)" && student.resumingOnDate ? (
                        `Resuming on ${format(new Date(student.resumingOnDate), 'MMM d, yyyy')}`
                      ) : statusValue === "Starting on (Date)" && student.ScheduleStartDate ? (
                        `Starting on ${format(new Date(student.ScheduleStartDate), 'MMM d, yyyy')}`
                      ) : (
                        statusValue
                      )}
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuContent className="w-56 max-h-60 overflow-y-auto">
                    {Object.entries(groupedStatusOptions).map(([category, options]) => (
                      <div key={category}>
                        <div className="px-2 py-1 text-xs font-bold text-gray-600">
                          {category}
                        </div>
                        {options.map(option => (
                          <Tooltip key={option.value} delayDuration={200}>
                            <TooltipTrigger asChild>
                              <DropdownMenuItem
                                onSelect={() => handleStatusChange(option.value)}
                                className={`${customHoverStyle} hover:bg-opacity-10`}
                                style={{
                                  backgroundColor: option.value === statusValue ? 
                                    `${option.alertLevel?.color || option.color}20` : 
                                    'transparent'
                                }}
                              >
                                <StatusOption option={option} />
                              </DropdownMenuItem>
                            </TooltipTrigger>
                            <TooltipContent>
                              {option.tooltip ? option.tooltip : option.value}
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenuPortal>
              </DropdownMenu>
            </div>
          </div>


          {/* New Auto Status Suggestion Row */}
          <div className="flex items-center space-x-2 mb-2">
            {student.autoStatus_Value ? (
              <TooltipProvider>
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-grow flex items-center justify-start h-9 px-3"
                      style={{
                        borderColor: isStatusEligibleForAutoChange(student.autoStatus_Value) && isCurrentStatusEligibleForAutoChange(statusValue) ? '#6366F1' : '#9CA3AF',
                        backgroundColor: isStatusEligibleForAutoChange(student.autoStatus_Value) && isCurrentStatusEligibleForAutoChange(statusValue) ? '#EEF2FF' : '#F3F4F6',
                        color: isStatusEligibleForAutoChange(student.autoStatus_Value) && isCurrentStatusEligibleForAutoChange(statusValue) ? '#4F46E5' : '#6B7280',
                        cursor: isStatusEligibleForAutoChange(student.autoStatus_Value) && isCurrentStatusEligibleForAutoChange(statusValue) ? 'pointer' : 'not-allowed',
                      }}
                      onClick={handleAutoStatusButtonClick}
                      disabled={!isStatusEligibleForAutoChange(student.autoStatus_Value) || !isCurrentStatusEligibleForAutoChange(statusValue)}
                    >
                      {isCurrentStatusEligibleForAutoChange(statusValue) ? (
                        <>
                          <Zap className={`h-4 w-4 mr-2 ${isStatusEligibleForAutoChange(student.autoStatus_Value) ? 'text-indigo-500' : 'text-gray-400'}`} />
                          <span className="font-medium">Suggested: {getSafeValue(student.autoStatus_Value)}</span>
                          {isStatusEligibleForAutoChange(student.autoStatus_Value) && (
                            <span className="ml-2 text-xs text-indigo-400">(Click to apply)</span>
                          )}
                        </>
                      ) : (
                        <>
                          <CircleSlash className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium">Cannot auto-update current status</span>
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[300px] p-3">
                    <div className="space-y-2">
                      <div className="font-semibold">Auto Status Suggestion</div>
                      <div className="text-xs text-gray-500">
                        Generated on: {student.autoStatus_timestamp ? 
                          formatTimestamp(student.autoStatus_timestamp) : 
                          'No timestamp available'}
                      </div>
                      <div className="text-xs">
                        {isCurrentStatusEligibleForAutoChange(statusValue) ? (
                          <>
                            This status is automatically suggested based on the student's activity and progress.
                            {isStatusEligibleForAutoChange(student.autoStatus_Value) ? (
                              <p className="mt-1 text-indigo-500 font-medium">Click to apply this status.</p>
                            ) : (
                              <p className="mt-1 text-amber-500">This status requires manual assignment.</p>
                            )}
                          </>
                        ) : (
                          <>
                            <p className="text-amber-500 font-medium">Current status: "{statusValue}"</p>
                            <p className="mt-1">This status cannot be automatically updated. You must manually change the status before auto-suggestions can be applied.</p>
                          </>
                        )}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <div className="flex-grow">
                <div className="text-xs text-gray-500 italic">No auto status suggestion available</div>
              </div>
            )}
          </div>

        {/* Category Selection */}
        <div className="mt-2 flex items-center">
          <DropdownMenu open={categoryMenuOpen} onOpenChange={setCategoryMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-xs font-normal"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Category
                <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {/* By Staff option */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Users className="h-4 w-4 mr-2" />
                  By Staff
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
                  {Object.entries(filteredTeacherCategories).map(([teacherEmailKey, categories]) => (
                    <DropdownMenuSub key={teacherEmailKey}>
                      <DropdownMenuSubTrigger className="w-full">
                        <div className="truncate">
                          {teacherNames[teacherEmailKey] || teacherEmailKey}
                        </div>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {categories.map(category => (
                          <DropdownMenuItem
                            key={category.id}
                            onSelect={() => handleCategoryChange(category.id, teacherEmailKey)}
                            className={customHoverStyle}
                          >
                            <div className="flex items-center">
                              {iconMap[category.icon] && React.createElement(iconMap[category.icon], { 
                                style: { color: category.color }, 
                                size: 16, 
                                className: 'mr-2' 
                              })}
                              <span>{category.name}</span>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              {/* By Type option */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Grid2X2 className="h-4 w-4 mr-2" />
                  By Type
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
                  {categoryTypes.map((type) => (
                    <DropdownMenuSub key={type.id}>
                      <DropdownMenuSubTrigger className="w-full">
                        <div className="flex items-center">
                          {React.createElement(
                            iconMap[type.icon] || Circle,
                            { 
                              className: "h-4 w-4 mr-2 flex-shrink-0",
                              style: { color: type.color }
                            }
                          )}
                          <span className="truncate">{type.name}</span>
                        </div>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {Object.entries(filteredTeacherCategories).flatMap(([teacherEmailKey, categories]) =>
                          categories
                            .filter(category => category.type === type.id)
                            .map(category => (
                              <DropdownMenuItem
                                key={`${teacherEmailKey}-${category.id}`}
                                onSelect={() => handleCategoryChange(category.id, teacherEmailKey)}
                                className={customHoverStyle}
                              >
                                <div className="flex items-center">
                                  {iconMap[category.icon] && React.createElement(iconMap[category.icon], { 
                                    style: { color: category.color }, 
                                    size: 16, 
                                    className: 'mr-2' 
                                  })}
                                  <span className="truncate">{category.name}</span>
                                  <span className="ml-2 text-xs text-gray-500 flex-shrink-0">
                                    ({teacherNames[teacherEmailKey] || teacherEmailKey})
                                  </span>
                                </div>
                              </DropdownMenuItem>
                            ))
                        )}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  ))}

                  {/* Uncategorized section */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Circle className="h-4 w-4 mr-2" />
                      Uncategorized
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {Object.entries(filteredTeacherCategories).flatMap(([teacherEmailKey, categories]) =>
                        categories
                          .filter(category => !category.type)
                          .map(category => (
                            <DropdownMenuItem
                              key={`${teacherEmailKey}-${category.id}`}
                              onSelect={() => handleCategoryChange(category.id, teacherEmailKey)}
                              className={customHoverStyle}
                            >
                              <div className="flex items-center">
                                {iconMap[category.icon] && React.createElement(iconMap[category.icon], { 
                                  style: { color: category.color }, 
                                  size: 16, 
                                  className: 'mr-2' 
                                })}
                                <span className="truncate">{category.name}</span>
                                <span className="ml-2 text-xs text-gray-500 flex-shrink-0">
                                  ({teacherNames[teacherEmailKey] || teacherEmailKey})
                                </span>
                              </div>
                            </DropdownMenuItem>
                          ))
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

          {/* Display selected categories */}
          <div className="flex flex-wrap mt-2">
            {selectedCategories.map(({ id, teacherEmailKey, category }) => {
              const uniqueKey = `${id}-${teacherEmailKey}-${student.id}`;

              return (
                <div 
                  key={uniqueKey}
                  className="flex items-center bg-gray-100 rounded-full px-2 py-1 text-xs mr-1 mb-1"
                  style={{ color: category.color }}
                >
                  {iconMap[category.icon] && React.createElement(iconMap[category.icon], { size: 12, className: 'mr-1' })}
                  {category.name}
                  <X
                    className="ml-1 cursor-pointer"
                    size={12}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCategory(id, teacherEmailKey);
                    }}
                  />
                </div>
              );
            })}
          </div>

       

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mt-2">
            {student.asn && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPasiDialogOpen(true);
                }}
              >
                <Database className="w-4 h-4 mr-1" />
                PASI
              </Button>
            )}

            {checkAsnIssues && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-amber-600 hover:text-amber-700"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAsnIssuesDialogOpen(true);
                }}
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                ASN Issues
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={handleOpenChat}
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Chat
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={handleOpenStatusHistory}
            >
              <History className="w-4 h-4 mr-1" />
              Status
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-xs text-blue-600 hover:text-blue-700"
              onClick={(e) => {
                window.open(`/emulate/${student.StudentEmail}`, 'emulationTab');
              }}
            >
              <UserCheck className="w-4 h-4 mr-1" />
              Emulate
            </Button>

            {currentMode === MODES.REGISTRATION && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-red-600 hover:text-red-700"
                onClick={(e) => {
                  setIsRemovalDialogOpen(true);
                }}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Remove
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

     
      {/* Full-screen dialog for expanded view */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-7xl w-[95vw] h-[95vh] p-6 flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              Student Details - {student.firstName} {student.lastName}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto mt-4">
            <StudentDetail studentSummary={student} isMobile={isMobile} />
          </div>
        </DialogContent>
      </Dialog>
    
      {/* Chat Dialog */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="max-w-[90vw] w-[1000px] h-[95vh] max-h-[900px] p-4 flex flex-col">
          <DialogHeader className="mb-0 bg-white py-0">
            <DialogTitle> 
              Messaging
            </DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-hidden rounded-lg border border-gray-200">
            <ChatApp
              mode="popup"
              courseInfo={null}
              courseTeachers={[]}
              courseSupportStaff={[]}
              initialParticipants={initialParticipantsMemo}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Status History Dialog */}
      <Dialog open={isStatusHistoryOpen} onOpenChange={setIsStatusHistoryOpen}>
        <DialogContent className="max-w-[90vw] w-[600px] h-[70vh] max-h-[600px] p-4 flex flex-col">
          <DialogHeader className="mb-4 bg-white">
            <DialogTitle>
              Status Update History
            </DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-auto">
          {loadingStatusHistory ? (
            <div className="text-center">Loading...</div>
          ) : statusHistory.length > 0 ? (
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left">Timestamp</th>
                  <th className="px-2 py-1 text-left">Status</th>
                  <th className="px-2 py-1 text-left">Previous Status</th>
                  <th className="px-2 py-1 text-left">Updated By</th>
                  <th className="px-2 py-1 text-left">Type</th>
                </tr>
              </thead>
              <tbody>
                {statusHistory.map((logEntry, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="px-2 py-1">{new Date(logEntry.timestamp).toLocaleString()}</td>
                    <td className="px-2 py-1">{getSafeValue(logEntry.status)}</td>
                    <td className="px-2 py-1">{getSafeValue(logEntry.previousStatus)}</td>
                    <td className="px-2 py-1">
                      {logEntry.updatedByType === 'teacher' ? (
                        <>
                          {logEntry.updatedBy.name} ({logEntry.updatedBy.email})
                        </>
                      ) : (
                        'Auto Status'
                      )}
                    </td>
                    <td className="px-2 py-1">
                      {logEntry.bulkUpdate && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="inline-flex items-center text-blue-600">
                                <Users className="h-4 w-4" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Part of a bulk update</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center">No status history available.</div>
          )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Course Removal Dialog */}
      <Dialog open={isRemovalDialogOpen} onOpenChange={setIsRemovalDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Remove Course</DialogTitle>
            <div className="text-sm text-gray-600 mt-4">
              Are you sure you want to remove this course for:
              <div className="font-medium mt-2 text-base">
                {student.preferredFirstName || student.firstName} {student.lastName}
              </div>
              <div className="font-medium mt-2 text-blue-600">
                {getSafeValue(student.Course_Value)}
              </div>
            </div>
          </DialogHeader>
          
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              This action cannot be undone and will remove all course data for this student.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsRemovalDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveCourse}
              className="flex items-center bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove Course
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </TooltipProvider>

      {/* PASI Records Dialog */}
      <PasiRecordsDialog
        isOpen={isPasiDialogOpen}
        onOpenChange={setIsPasiDialogOpen}
        studentAsn={student.asn}
        student={student} 
        courseId={student.CourseID}
      />

      {/* ASN Issues Dialog */}
      <AsnIssuesDialog
        isOpen={isAsnIssuesDialogOpen}
        onOpenChange={setIsAsnIssuesDialogOpen}
        asn={student.asn}
        studentKey={student.id.slice(0, student.id.lastIndexOf('_'))}
        studentEmail={student.StudentEmail}  
        emailKeys={studentAsns?.[student.asn]?.emailKeys ? 
          Object.entries(studentAsns[student.asn].emailKeys)
            .filter(([_, value]) => value === true)
            .map(([email]) => email) : 
          []
        }
      />

      <PendingFinalizationDialog
        isOpen={isPendingFinalizationOpen}
        onOpenChange={setIsPendingFinalizationOpen}
        status={pendingStatus}
        studentName={`${student.preferredFirstName || student.firstName} ${student.lastName}`}
        courseName={getSafeValue(student.Course_Value)}
        studentKey={student.id.slice(0, student.id.lastIndexOf('_'))}
        courseId={student.id.slice(student.id.lastIndexOf('_') + 1)}
        onConfirm={() => {
          setIsPendingFinalizationOpen(false);
          setPendingStatus(null);
        }}
        onCancel={() => {
          setIsPendingFinalizationOpen(false);
          setPendingStatus(null);
        }}
      />

      <ResumingOnDialog
        isOpen={isResumingOnOpen}
        onOpenChange={setIsResumingOnOpen}
        status="Resuming on (date)"
        statusValue={statusValue}
        studentName={`${student.preferredFirstName || student.firstName} ${student.lastName}`}
        courseName={getSafeValue(student.Course_Value)}
        studentEmail={student.StudentEmail} 
        studentKey={student.id.slice(0, student.id.lastIndexOf('_'))}
        courseId={student.id.slice(student.id.lastIndexOf('_') + 1)}
        onConfirm={async () => {
          setIsResumingOnOpen(false);
        }}
        onCancel={() => {
          setIsResumingOnOpen(false);
        }}
      />
    </>
  );
});

export default StudentCard;