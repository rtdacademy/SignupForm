import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { STATUS_OPTIONS, STATUS_CATEGORIES, getStatusColor, getStatusAllowsAutoStatus, getStudentTypeInfo, COURSE_OPTIONS, getCourseInfo, TERM_OPTIONS, getTermInfo, ACTIVE_FUTURE_ARCHIVED_OPTIONS } from '../config/DropdownOptions';
import { ChevronDown, Plus, CheckCircle, BookOpen, MessageSquare, X, Zap, AlertTriangle, ArrowUp, ArrowDown, Maximize2, Trash2, UserCheck, User, CircleSlash, Circle, Square, Triangle, BookOpen as BookOpenIcon, GraduationCap, Trophy, Target, ClipboardCheck, Brain, Lightbulb, Clock, Calendar as CalendarIcon, BarChart, TrendingUp, AlertCircle, HelpCircle, MessageCircle, Users, Presentation, FileText, Bookmark, Grid2X2, Database, Ban, ArchiveRestore, FileText as FileTextIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { getDatabase, ref, set, get, push, remove, update, runTransaction, serverTimestamp  } from 'firebase/database';
import { Button } from "../components/ui/button";
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

import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import AsnIssuesDialog from './AsnIssuesDialog';
import PendingFinalizationDialog from './Dialog/PendingFinalizationDialog';
import ResumingOnDialog from './Dialog/ResumingOnDialog';
import { toast } from 'sonner';
import PermissionIndicator from '../context/PermissionIndicator';
import ProfileHistory from './ProfileHistory';
import PasiActionButtons from '../components/PasiActionButtons';

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

// Helper function to detect PASI-only records
const isPasiOnlyRecord = (student) => {
  return student?.ActiveFutureArchived_Value === 'Not Set' || 
         (student?.CourseID === null && student?.Status_Value === null && student?.StudentType_Value === null);
};

// Component for PASI-only records
const PasiOnlyCard = React.memo(({ student, index, isSelected, onSelectionChange }) => {
  const bgColor = index % 2 === 0 ? 'bg-orange-50' : 'bg-orange-100';
  
  // Parse student name from PASI format
  const getNameInfo = () => {
    if (student.studentName) {
      const nameParts = student.studentName.split(',');
      if (nameParts.length >= 2) {
        const lastName = nameParts[0].trim();
        const firstPart = nameParts[1].trim();
        const firstName = firstPart.split(' ')[0];
        return {
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`,
          initials: `${firstName[0] || '?'}${lastName[0] || '?'}`
        };
      }
    }
    return {
      firstName: '?',
      lastName: '?',
      fullName: student.studentName || '? ?',
      initials: '??'
    };
  };

  const nameInfo = getNameInfo();
  const avatarColor = getColorFromInitials(nameInfo.initials);

  // Format assignment date
  const formatDate = (dateString) => {
    if (!dateString || dateString === '-') return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <Card className={`transition-shadow duration-200 ${bgColor} hover:shadow-md mb-3 border-l-4 border-l-orange-400`}>
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center space-x-3 mb-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelectionChange}
            aria-label={`Select ${nameInfo.fullName}`}
          />
          <Avatar className="w-10 h-10">
            <AvatarFallback 
              className="text-sm font-medium" 
              style={{ backgroundColor: avatarColor, color: '#FFFFFF' }}
            >
              {nameInfo.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base font-medium truncate flex items-center gap-2">
                {nameInfo.fullName}
                <Badge className="bg-orange-200 text-orange-800 text-xs">
                  PASI Only
                </Badge>
              </CardTitle>
            </div>
            {student.email && student.email !== '-' && (
              <div className="text-xs text-gray-600 truncate mt-1">
                {student.email}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-3 pt-0">
        {/* Course Information */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-blue-100 text-blue-800 text-xs">
              {student.courseCode}
            </Badge>
            {student.approved && (
              <Badge 
                className={`text-xs ${
                  student.approved === 'Yes' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {student.approved === 'Yes' ? 'Approved' : 'Not Approved'}
              </Badge>
            )}
          </div>
          <div className="text-sm font-medium text-gray-900">
            {student.courseDescription}
          </div>
        </div>

        {/* Key Information Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div>
            <span className="text-gray-500">ASN:</span>
            <div className="font-medium">{student.asn || 'N/A'}</div>
          </div>
          <div>
            <span className="text-gray-500">Term:</span>
            <div className="font-medium">{student.pasiTerm || 'N/A'}</div>
          </div>
          <div>
            <span className="text-gray-500">Assignment Date:</span>
            <div className="font-medium">{formatDate(student.assignmentDate)}</div>
          </div>
          <div>
            <span className="text-gray-500">Status:</span>
            <div className="font-medium">{student.status || 'N/A'}</div>
          </div>
        </div>

        {/* School Enrollment */}
        {student.schoolEnrolment && (
          <div className="mb-3">
            <span className="text-xs text-gray-500">School Enrollment:</span>
            <div className="text-xs font-medium bg-gray-100 p-2 rounded mt-1">
              {student.schoolEnrolment}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-2 border-t border-orange-200">
          <div className="text-xs text-orange-700 font-medium">
            Not in YourWay
          </div>
          <PasiActionButtons 
            asn={student.asn} 
            referenceNumber={student.referenceNumber}
            showYourWay={false}
          />
        </div>
      </CardContent>
    </Card>
  );
});

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
  
  // Check if this is a PASI-only record and render accordingly
  if (isPasiOnlyRecord(student)) {
    return (
      <PasiOnlyCard
        student={student}
        index={index}
        isSelected={isSelected}
        onSelectionChange={onSelectionChange}
      />
    );
  }
  
  // Helper function to extract student information from both formats
  const getStudentInfo = useMemo(() => {
    if (student?.firstName && student?.lastName) {
      // Student summary format
      return {
        firstName: student.firstName,
        lastName: student.lastName,
        preferredFirstName: student.preferredFirstName,
        displayName: student.preferredFirstName || student.firstName,
        fullName: `${student.preferredFirstName || student.firstName} ${student.lastName}`,
        email: student.StudentEmail || '',
        initials: `${(student.preferredFirstName || student.firstName)[0] || '?'}${student.lastName[0] || '?'}`
      };
    } else if (student?.studentName) {
      // PASI format - parse "Last, First Middle"
      const nameParts = student.studentName.split(',');
      if (nameParts.length >= 2) {
        const lastName = nameParts[0].trim();
        const firstPart = nameParts[1].trim();
        const firstName = firstPart.split(' ')[0];
        return {
          firstName,
          lastName,
          preferredFirstName: firstName,
          displayName: firstName,
          fullName: `${firstName} ${lastName}`,
          email: student.email || '',
          initials: `${firstName[0] || '?'}${lastName[0] || '?'}`
        };
      }
    }
    
    // Fallback for incomplete data
    return {
      firstName: '?',
      lastName: '?',
      preferredFirstName: '?',
      displayName: '?',
      fullName: '? ?',
      email: student?.StudentEmail || student?.email || '',
      initials: '??'
    };
  }, [student]);
  
  const { currentMode } = useMode();
  const bgColor = selectedStudentId === student.id 
    ? 'bg-blue-100' 
    : index % 2 === 0 
      ? 'bg-white' 
      : 'bg-gray-50';
  const avatarColor = getColorFromInitials(getStudentInfo.initials);

  // Get safe status value from potentially complex object
  const safeStatusValue = getSafeValue(student?.Status_Value);
  
  // Initialize statusValue from the safe value
  const [statusValue, setStatusValue] = useState(safeStatusValue || '');
  const [autoStatus, setAutoStatus] = useState(student?.autoStatus || false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [teacherNames, setTeacherNames] = useState({});
  

  // State variable for expanded view
  const [isExpanded, setIsExpanded] = useState(false);

  // New state variable for removal dialog
  const [isRemovalDialogOpen, setIsRemovalDialogOpen] = useState(false);

  // Add state for restoring from cold storage
  const [isRestoring, setIsRestoring] = useState(false);

  // Access the logged-in teacher's info
  const { user, isAdminUser } = useAuth();

  const customHoverStyle = "hover:bg-accent hover:text-accent-foreground";

  const [isPasiDialogOpen, setIsPasiDialogOpen] = useState(false);

  const [isAsnIssuesDialogOpen, setIsAsnIssuesDialogOpen] = useState(false);

  const [isPendingFinalizationOpen, setIsPendingFinalizationOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [isResumingOnOpen, setIsResumingOnOpen] = useState(false);
  
  // Profile History state
  const [isProfileHistoryOpen, setIsProfileHistoryOpen] = useState(false);
  const [hasProfileHistory, setHasProfileHistory] = useState(false);


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

  // Check if profile history exists
  useEffect(() => {
    const checkProfileHistory = async () => {
      if (!student.id) return;
      
      const db = getDatabase();
      const lastUnderscoreIndex = student.id.lastIndexOf('_');
      const studentKey = student.id.slice(0, lastUnderscoreIndex);
      const profileHistoryRef = ref(db, `students/${studentKey}/profileHistory`);
      
      try {
        const snapshot = await get(profileHistoryRef);
        setHasProfileHistory(snapshot.exists());
      } catch (error) {
        console.error("Error checking profile history:", error);
        setHasProfileHistory(false);
      }
    };

    checkProfileHistory();
  }, [student.id]);

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

    // First, set the lastChange tracking info
    const lastChangeRef = ref(db, `students/${studentKey}/courses/${courseId}/enrollmentHistory/lastChange`);
    await set(lastChangeRef, {
      userEmail: user?.email || 'unknown',
      timestamp: Date.now(),
      field: 'Status_Value'
    });

    // Use transaction for course data update
    const courseRef = ref(db, `students/${studentKey}/courses/${courseId}`);
    const result = await runTransaction(courseRef, (currentData) => {
      // If data doesn't exist, abort
      if (currentData === null) return null;
      
      // Make a deep copy of the current data to modify
      const updatedData = JSON.parse(JSON.stringify(currentData));
      
      // Ensure object structure exists
      if (!updatedData.Status) updatedData.Status = {};
      
      // Update the status
      updatedData.Status.Value = newStatus;
      
      // Set ActiveFutureArchived value if needed
      if (selectedStatusOption?.activeFutureArchivedValue) {
        if (!updatedData.ActiveFutureArchived) updatedData.ActiveFutureArchived = {};
        updatedData.ActiveFutureArchived.Value = selectedStatusOption.activeFutureArchivedValue;
      }
      
      // Update auto status flag
      updatedData.autoStatus = selectedStatusOption?.allowAutoStatusChange === true;
      
      return updatedData;
    });

    // Check if transaction was successful
    if (!result.committed) {
      throw new Error("Transaction failed to commit");
    }

    // Status log entries need to be added separately since we need a push() operation
    // which isn't available within transactions
    const statusLogRef = ref(db, `students/${studentKey}/courses/${courseId}/statusLog`);
    const newLogRef = push(statusLogRef);
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      status: newStatus,
      previousStatus: previousStatus || '',
      updatedBy: {
        name: user.displayName || user.email,
        email: user.email,
      },
      updatedByType: 'teacher',
      autoStatus: selectedStatusOption?.allowAutoStatusChange === true,
    };
    
    await set(newLogRef, logEntry);

    // Update local state
    setStatusValue(newStatus);
    setAutoStatus(selectedStatusOption?.allowAutoStatusChange === true);

    if (isPartOfMultiSelect) {
      onBulkStatusChange(newStatus, student.id);
    }

    console.log(`Successfully updated status to ${newStatus} using transaction`);

  } catch (error) {
    console.error("Error updating status with transaction:", error);
    // Consider showing an error notification to the user here
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
    const summaryKey = `${studentKey}_${courseId}`;
    const summaryRef = ref(db, `studentCourseSummaries/${summaryKey}`);

    try {
      // Check if the category already exists
      const snapshot = await get(categoryRef);
      const currentValue = snapshot.exists() ? snapshot.val() : null;
      
      // Set the category to true in the student record
      await set(categoryRef, true);
      
      // If the category was already true, also update the summary directly
      // This handles the case where the cloud function might not detect a change
      if (currentValue === true) {
        // Get the current categories from the summary
        const summarySnapshot = await get(summaryRef.child('categories'));
        const summaryCategories = summarySnapshot.exists() ? summarySnapshot.val() : {};
        
        // Update the summary categories
        if (!summaryCategories[teacherEmailKey]) {
          summaryCategories[teacherEmailKey] = {};
        }
        summaryCategories[teacherEmailKey][categoryId] = true;
        
        // Set the updated categories in the summary
        await set(summaryRef.child('categories'), summaryCategories);
      }
      
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

  // Handle term change for the student
  const handleTermChange = useCallback(async (newTerm) => {
    if (!isAdminUser) {
      toast.error("Term changes require admin permissions");
      return;
    }

    if (newTerm === student.Term) return; // No change needed

    const db = getDatabase();
    const lastUnderscoreIndex = student.id.lastIndexOf('_');
    const studentKey = student.id.slice(0, lastUnderscoreIndex);
    const courseId = student.id.slice(lastUnderscoreIndex + 1);
    const termRef = ref(db, `students/${studentKey}/courses/${courseId}/Term`);
    
    try {
      await set(termRef, newTerm);
      toast.success(`Term updated to ${newTerm}`, {
        description: `For ${getStudentInfo.fullName}`,
        duration: 3000
      });
    } catch (error) {
      console.error("Error updating term:", error);
      toast.error("Failed to update term", {
        description: error.message,
        duration: 3000
      });
    }
  }, [student.id, student.Term, getStudentInfo.fullName, isAdminUser]);

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
        getStudentInfo.fullName,
        getSafeValue(student.Course_Value)
      );
    } catch (error) {
      console.error("Error removing course:", error);
    }
  }, [student.id, getStudentInfo.fullName, student.Course_Value, onCourseRemoved]);

  const handleRestoreFromColdStorage = useCallback(async (e) => {
    e.stopPropagation(); // Prevent card click
    setIsRestoring(true);
    
    const db = getDatabase();
    const lastUnderscoreIndex = student.id.lastIndexOf('_');
    const studentKey = student.id.slice(0, lastUnderscoreIndex);
    const courseId = student.id.slice(lastUnderscoreIndex + 1);
    const summaryKey = `${studentKey}_${courseId}`;
    
    try {
      // Update the ActiveFutureArchived_Value to 'Active' in the studentCourseSummaries
      const summaryRef = ref(db, `studentCourseSummaries/${summaryKey}/ActiveFutureArchived_Value`);
      await set(summaryRef, 'Active');
      
      // Show success message
      toast.success('Student is being restored from Archived', {
        description: 'This may take a few moments to complete.',
        duration: 5000
      });
    } catch (error) {
      console.error('Error restoring student from archived:', error);
      toast.error('Failed to restore student', {
        description: error.message,
        duration: 3000
      });
    } finally {
      setIsRestoring(false);
    }
  }, [student.id]);

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
    console.log('Selected student object:', student); 
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
        email: getStudentInfo.email,
        displayName: getStudentInfo.fullName,
        type: 'student',
      },
    ];
  }, [getStudentInfo.email, getStudentInfo.fullName]);

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

  // Get safe Active Future Archived value
  const safeActiveFutureArchivedValue = getSafeValue(student?.ActiveFutureArchived_Value);
  const isColdStorage = safeActiveFutureArchivedValue === 'Archived';

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
                {getStudentInfo.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base font-medium truncate flex items-center gap-2">
                {getStudentInfo.fullName}
              
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
                {getStudentInfo.email}
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
                    <div className="flex items-center gap-2">
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
                      
                      {student.Term && (
                        <TooltipProvider>
                          <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                              <div className="relative">
                                {isAdminUser ? (
                                  // Interactive dropdown for admins
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Badge 
                                        className="flex items-center gap-1 px-2 py-0.5 h-6 text-xs font-medium border-0 rounded-md cursor-pointer"
                                        style={{
                                          backgroundColor: `${getTermInfo(student.Term).color}15`,
                                          color: getTermInfo(student.Term).color
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {getTermInfo(student.Term).icon && React.createElement(getTermInfo(student.Term).icon, {
                                          className: "w-3 h-3 mr-1"
                                        })}
                                        {student.Term}
                                        <div className="absolute -top-1 -right-1">
                                          <PermissionIndicator type="ADMIN" className="h-3 w-3" />
                                        </div>
                                      </Badge>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-[180px]">
                                      {TERM_OPTIONS.map((option) => (
                                        <DropdownMenuItem
                                          key={option.value}
                                          className={customHoverStyle}
                                          onSelect={(e) => {
                                            e.preventDefault();
                                            handleTermChange(option.value);
                                          }}
                                        >
                                          <div className="flex items-center w-full">
                                            {React.createElement(option.icon, {
                                              className: "w-4 h-4 mr-2",
                                              style: { color: option.color }
                                            })}
                                            <span>{option.value}</span>
                                          </div>
                                        </DropdownMenuItem>
                                      ))}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                ) : (
                                  // Static badge for non-admins
                                  <Badge 
                                    className="flex items-center gap-1 px-2 py-0.5 h-6 text-xs font-medium border-0 rounded-md"
                                    style={{
                                      backgroundColor: `${getTermInfo(student.Term).color}15`,
                                      color: getTermInfo(student.Term).color
                                    }}
                                  >
                                    {getTermInfo(student.Term).icon && React.createElement(getTermInfo(student.Term).icon, {
                                      className: "w-3 h-3 mr-1"
                                    })}
                                    {student.Term}
                                    <div className="absolute -top-1 -right-1">
                                      <PermissionIndicator type="ADMIN" className="h-3 w-3" />
                                    </div>
                                  </Badge>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              {isAdminUser 
                                ? 'Click to change term (Admin only)' 
                                : 'Term change requires admin access'}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
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
            {isColdStorage ? (
              <div className="border rounded-md p-2 text-center bg-cyan-50 border-cyan-200">
                <div className="flex items-center justify-center mb-1 text-cyan-700">
                  <span className="mr-2"><ArchiveRestore className="h-4 w-4" /></span>
                  <span className="font-medium">Student is Archived</span>
                </div>
                <p className="text-xs text-cyan-600">This student's data has been archived. Use the Restore button below to restore access.</p>
              </div>
            ) : (
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
            )}
            </div>
          </div>

          {/* New Auto Status Suggestion Row */}
          <div className="flex items-center space-x-2 mb-2">
            {!isColdStorage && student.autoStatus_Value ? (
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
          {(() => {
            // Calculate number of visible buttons
            const buttonCount = 
              (checkAsnIssues ? 1 : 0) +
              1 + // Chat is always visible
              (hasProfileHistory ? 1 : 0) +
              1 + // Emulate is always visible
              (currentMode === MODES.REGISTRATION ? 1 : 0) +
              (isColdStorage ? 1 : 0);
            
            // Three size tiers based on button count
            const sizeMode = buttonCount > 4 ? 'small' : buttonCount === 4 ? 'medium' : 'normal';
            
            const buttonClass = {
              small: "text-[10px] px-2 py-1 h-6",
              medium: "text-[11px] px-2 py-1 h-7",
              normal: "text-xs"
            }[sizeMode];
            
            const iconClass = {
              small: "w-3 h-3 mr-0.5",
              medium: "w-3.5 h-3.5 mr-0.5",
              normal: "w-4 h-4 mr-1"
            }[sizeMode];
            
            const gapClass = {
              small: "gap-1",
              medium: "gap-1.5",
              normal: "gap-2"
            }[sizeMode];
            
            const useShortLabels = sizeMode !== 'normal';

            return (
              <div className={`flex flex-wrap ${gapClass} mt-2`}>
                {checkAsnIssues && (
                  <Button
                    variant="outline"
                    size="sm"
                    className={`${buttonClass} text-amber-600 hover:text-amber-700`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAsnIssuesDialogOpen(true);
                    }}
                  >
                    <AlertTriangle className={iconClass} />
                    {useShortLabels ? "ASN" : "ASN Issues"}
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className={buttonClass}
                  onClick={handleOpenChat}
                >
                  <MessageSquare className={iconClass} />
                  Chat
                </Button>

                {hasProfileHistory && (
                  <Button
                    variant="outline"
                    size="sm"
                    className={`${buttonClass} text-purple-600 hover:text-purple-700`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsProfileHistoryOpen(true);
                    }}
                  >
                    <FileTextIcon className={iconClass} />
                    {useShortLabels ? "History" : "History"}
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className={`${buttonClass} text-blue-600 hover:text-blue-700`}
                  onClick={(e) => {
                    window.open(`/emulate/${getStudentInfo.email}`, 'emulationTab');
                  }}
                >
                  <UserCheck className={iconClass} />
                  Emulate
                </Button>

                {currentMode === MODES.REGISTRATION && (
                  <Button
                    variant="outline"
                    size="sm"
                    className={`${buttonClass} text-red-600 hover:text-red-700`}
                    onClick={(e) => {
                      setIsRemovalDialogOpen(true);
                    }}
                  >
                    <Trash2 className={iconClass} />
                    Remove
                  </Button>
                )}

                {isColdStorage && (
                  <Button
                    variant="outline"
                    size="sm"
                    className={`${buttonClass} text-green-600 hover:text-green-700`}
                    onClick={handleRestoreFromColdStorage}
                    disabled={isRestoring}
                  >
                    <ArchiveRestore className={iconClass} />
                    {isRestoring ? 'Restoring...' : 'Restore'}
                  </Button>
                )}
              </div>
            );
          })()}
        </CardContent>
      </Card>

     
      {/* Full-screen dialog for expanded view */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-7xl w-[95vw] h-[95vh] p-6 flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              Student Details - {getStudentInfo.fullName}
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


      {/* Course Removal Dialog */}
      <Dialog open={isRemovalDialogOpen} onOpenChange={setIsRemovalDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Remove Course</DialogTitle>
            <div className="text-sm text-gray-600 mt-4">
              Are you sure you want to remove this course for:
              <div className="font-medium mt-2 text-base">
                {getStudentInfo.fullName}
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

      {/* ASN Issues Dialog */}
      <AsnIssuesDialog
        isOpen={isAsnIssuesDialogOpen}
        onOpenChange={setIsAsnIssuesDialogOpen}
        asn={student.asn}
        studentKey={student.id.slice(0, student.id.lastIndexOf('_'))}
        studentEmail={getStudentInfo.email}  
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
        studentName={getStudentInfo.fullName}
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
        studentName={getStudentInfo.fullName}
        courseName={getSafeValue(student.Course_Value)}
        studentEmail={getStudentInfo.email} 
        studentKey={student.id.slice(0, student.id.lastIndexOf('_'))}
        courseId={student.id.slice(student.id.lastIndexOf('_') + 1)}
        onConfirm={async () => {
          setIsResumingOnOpen(false);
        }}
        onCancel={() => {
          setIsResumingOnOpen(false);
        }}
      />

      {/* Profile History Dialog */}
      <Dialog open={isProfileHistoryOpen} onOpenChange={setIsProfileHistoryOpen}>
        <DialogContent className="max-w-[90vw] w-[800px] h-[80vh] max-h-[700px] p-4 flex flex-col">
          <DialogHeader className="mb-4 bg-white">
            <DialogTitle>
              Profile Change History - {getStudentInfo.fullName}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-auto">
            <ProfileHistory studentEmailKey={student.id.slice(0, student.id.lastIndexOf('_'))} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

export default StudentCard;