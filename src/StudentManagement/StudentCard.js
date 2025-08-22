import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { STATUS_OPTIONS, STATUS_CATEGORIES, getStatusColor, getStatusAllowsAutoStatus, getStudentTypeInfo, COURSE_OPTIONS, getCourseInfo, TERM_OPTIONS, getTermInfo, ACTIVE_FUTURE_ARCHIVED_OPTIONS, getPaymentStatusInfo } from '../config/DropdownOptions';
import { ChevronDown, Plus, CheckCircle, BookOpen, MessageSquare, X, Zap, AlertTriangle, ArrowUp, ArrowDown, Maximize2, Trash2, UserCheck, User, CircleSlash, Circle, Square, Triangle, BookOpen as BookOpenIcon, GraduationCap, Trophy, Target, ClipboardCheck, Brain, Lightbulb, Clock, Calendar as CalendarIcon, BarChart, TrendingUp, AlertCircle, HelpCircle, MessageCircle, Users, Presentation, FileText, Bookmark, Grid2X2, Database, Ban, ArchiveRestore, FileText as FileTextIcon, UserX, Flame, ChevronRight, Eye, RefreshCw, Copy, FileJson, Activity, DollarSign,
  // Seasonal icons
  Snowflake, Flower, Sun, Leaf,
  // Student Management icons
  Award, Flag, Star, Pause, Play, AlertOctagon, Heart, Sparkles, ShieldAlert, Rocket, Hourglass, MapPin, Palette, Calculator, Globe, Home, School, Video, Headphones
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { getDatabase, ref, set, get, push, remove, update, runTransaction, serverTimestamp  } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
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
import { useCourse } from '../context/CourseContext';
import { Checkbox } from "../components/ui/checkbox";
import StudentDetail from './StudentDetail';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../components/ui/tooltip";

import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../components/ui/sheet";
import { ScrollArea } from "../components/ui/scroll-area";
import AsnIssuesDialog from './AsnIssuesDialog';
import PendingFinalizationDialog from './Dialog/PendingFinalizationDialog';
import ResumingOnDialog from './Dialog/ResumingOnDialog';
import { toast } from 'sonner';
import PermissionIndicator from '../context/PermissionIndicator';
import ProfileHistory from './ProfileHistory';
import PasiActionButtons from '../components/PasiActionButtons';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import PaymentInfo from './PaymentInfo';

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
  // Seasonal icons
  'snowflake': Snowflake,
  'flower': Flower,
  'sun': Sun,
  'leaf': Leaf,
  // Student Management icons
  'award': Award,
  'flag': Flag,
  'star': Star,
  'zap': Zap,
  'pause': Pause,
  'play': Play,
  'alert-octagon': AlertOctagon,
  'heart': Heart,
  'sparkles': Sparkles,
  'shield-alert': ShieldAlert,
  'rocket': Rocket,
  'hourglass': Hourglass,
  'map-pin': MapPin,
  'palette': Palette,
  'calculator': Calculator,
  'globe': Globe,
  'home': Home,
  'school': School,
  'video': Video,
  'headphones': Headphones,
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

// PaymentStatusBadge Component
const PaymentStatusBadge = ({ paymentStatus, onClick }) => {
  if (!paymentStatus) return null;

  const paymentInfo = getPaymentStatusInfo(paymentStatus);
  const IconComponent = paymentInfo.icon;

  const handleClick = (e) => {
    e.stopPropagation(); // Prevent card click
    if (onClick) {
      onClick();
    }
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <Badge 
            className="inline-flex items-center gap-1 px-2 py-0.5 h-5 text-[10px] font-medium border-0 rounded w-auto cursor-pointer hover:opacity-80 transition-opacity"
            style={{
              backgroundColor: `${paymentInfo.color}15`,
              color: paymentInfo.color
            }}
            onClick={handleClick}
          >
            <IconComponent className="w-3 h-3 flex-shrink-0" />
            <span>Payment</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs">
            <div>{paymentInfo.tooltip}</div>
            <div className="text-gray-400 mt-1">Click to view details</div>
          </div>
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
  studentAsns,
  isBlacklisted = false,
  blacklistLoading = false
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
  
  // State for showing/hiding tracking categories
  const [showTrackingCategories, setShowTrackingCategories] = useState(false);
  
  // State for payment info sheet
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);

  // Add state for restoring from cold storage
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreOptionsModal, setRestoreOptionsModal] = useState(null);
  const [archiveOptionsDialog, setArchiveOptionsDialog] = useState(false);
  const [archiveData, setArchiveData] = useState(null);
  const [loadingArchiveData, setLoadingArchiveData] = useState(false);
  const [archiveDataViewModal, setArchiveDataViewModal] = useState(null);
  const [expandedSections, setExpandedSections] = useState(new Set(['stats']));

  // Access the logged-in teacher's info
  const { user, isAdminUser } = useAuth();
  
  // Access course data from CourseContext
  const { getCourseById } = useCourse();

  const customHoverStyle = "hover:bg-accent hover:text-accent-foreground";

  const [isPasiDialogOpen, setIsPasiDialogOpen] = useState(false);

  const [isAsnIssuesDialogOpen, setIsAsnIssuesDialogOpen] = useState(false);

  const [isPendingFinalizationOpen, setIsPendingFinalizationOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [isResumingOnOpen, setIsResumingOnOpen] = useState(false);
  
  // Profile History state
  const [isProfileHistoryOpen, setIsProfileHistoryOpen] = useState(false);
  const [hasProfileHistory, setHasProfileHistory] = useState(false);

  // Blacklist state is now passed as props


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
      // Get the student key consistently with how categories are handled
      const rawEmail = student.StudentEmail;
  if (!rawEmail) {
    console.error('StudentEmail is missing for student:', student);
    toast.error('Cannot update: Student email is missing');
    return;
  }
      const studentKey = sanitizeEmail(rawEmail);
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

  // Blacklist status is now passed as props from parent component

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
  // Get the student key consistently with how categories are handled
  const rawEmail = student.StudentEmail;
  if (!rawEmail) {
    console.error('StudentEmail is missing for student:', student);
    toast.error('Cannot update: Student email is missing');
    return;
  }
  const studentKey = sanitizeEmail(rawEmail);
  const courseId = student.CourseID || student.courseId || student.id.slice(student.id.lastIndexOf('_') + 1);
  
  // Debug logging
  console.log('updateStatus - Database path:', `students/${studentKey}/courses/${courseId}/Status/Value`);
  console.log('updateStatus - studentKey:', studentKey, 'courseId:', courseId);
   console.log('Update attempt details:', {
    rawEmail,
    studentKey,
    courseId,
    fullPath: `students/${studentKey}/courses/${courseId}/Status/Value`,
    newStatus
  });
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
    // Get the student key consistently with how categories are handled
    const rawEmail = student.StudentEmail;
  if (!rawEmail) {
    console.error('StudentEmail is missing for student:', student);
    toast.error('Cannot update: Student email is missing');
    return;
  }
    const studentKey = sanitizeEmail(rawEmail);
    const courseId = student.CourseID || student.courseId || student.id.slice(student.id.lastIndexOf('_') + 1);
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
    // Use the actual student email and course ID from the student object
    const rawEmail = student.StudentEmail;
  if (!rawEmail) {
    console.error('StudentEmail is missing for student:', student);
    toast.error('Cannot update: Student email is missing');
    return;
  }
    const studentKey = sanitizeEmail(rawEmail);
    const courseId = student.CourseID || student.courseId;
    const categoryRef = ref(db, `students/${studentKey}/courses/${courseId}/categories/${teacherEmailKey}/${categoryId}`);
    const summaryKey = `${studentKey}_${courseId}`;
    const summaryCategoryRef = ref(db, `studentCourseSummaries/${summaryKey}/categories/${teacherEmailKey}/${categoryId}`);
    const summaryRef = ref(db, `studentCourseSummaries/${summaryKey}`);

    try {
      // Update both locations simultaneously to ensure sync
      const updates = {};
      
      // Set the category to true in the student record
      updates[`students/${studentKey}/courses/${courseId}/categories/${teacherEmailKey}/${categoryId}`] = true;
      
      // Also update the studentCourseSummaries directly to ensure sync
      updates[`studentCourseSummaries/${summaryKey}/categories/${teacherEmailKey}/${categoryId}`] = true;
      
      // Update lastUpdated timestamp in summary
      updates[`studentCourseSummaries/${summaryKey}/lastUpdated`] = Date.now();
      
      // Perform all updates atomically
      await update(ref(db), updates);
      
      // If this is part of a multi-select, update other selected students
      if (isPartOfMultiSelect) {
        onBulkCategoryChange(categoryId, teacherEmailKey, student.id, true);
      }
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error('Failed to add category');
    }
  }, [student.id, isPartOfMultiSelect, onBulkCategoryChange]);

  const handleRemoveCategory = useCallback(async (categoryId, teacherEmailKey) => {
    const db = getDatabase();
    // Use the actual student email and course ID from the student object
    const rawEmail = student.StudentEmail;
  if (!rawEmail) {
    console.error('StudentEmail is missing for student:', student);
    toast.error('Cannot update: Student email is missing');
    return;
  }
    const studentKey = sanitizeEmail(rawEmail);
    const courseId = student.CourseID || student.courseId;
    const summaryKey = `${studentKey}_${courseId}`;
    
    try {
      // Update both locations simultaneously to ensure sync
      const updates = {};
      
      // Set specific category to false in the student record
      updates[`students/${studentKey}/courses/${courseId}/categories/${teacherEmailKey}/${categoryId}`] = false;
      
      // Also update the studentCourseSummaries directly to ensure sync
      updates[`studentCourseSummaries/${summaryKey}/categories/${teacherEmailKey}/${categoryId}`] = false;
      
      // Update lastUpdated timestamp in summary
      updates[`studentCourseSummaries/${summaryKey}/lastUpdated`] = Date.now();
      
      // Perform all updates atomically
      await update(ref(db), updates);
      
      if (isPartOfMultiSelect) {
        onBulkCategoryChange(categoryId, teacherEmailKey, student.id, false);
      }
    } catch (error) {
      console.error("Error removing category:", error);
      toast.error('Failed to remove category');
    }
  }, [student.id, isPartOfMultiSelect, onBulkCategoryChange]);


  // In StudentCard.js
  const handleRemoveCourse = useCallback(async () => {
    const db = getDatabase();
    // Get the student key consistently with how categories are handled
    const rawEmail = student.StudentEmail;
  if (!rawEmail) {
    console.error('StudentEmail is missing for student:', student);
    toast.error('Cannot update: Student email is missing');
    return;
  }
    const studentKey = sanitizeEmail(rawEmail);
    const courseId = student.CourseID || student.courseId || student.id.slice(student.id.lastIndexOf('_') + 1);
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

  // Get safe Active Future Archived value
  const safeActiveFutureArchivedValue = getSafeValue(student?.ActiveFutureArchived_Value);
  const isColdStorage = safeActiveFutureArchivedValue === 'Archived';
  
  // Check if archive data is available for restoration (could be archived or re-enrolled)
  const hasArchiveData = student?.archiveInfo?.archiveFilePath;
  const canRestore = hasArchiveData; // Archive data available regardless of current status

  const handleOpenArchiveOptions = useCallback(async (e) => {
    e.stopPropagation(); // Prevent card click
    setArchiveOptionsDialog(true);
    
    // Check current enrollment status
    const rawEmail = student.StudentEmail;
    if (!rawEmail) {
      console.error('StudentEmail is missing for student:', student);
      toast.error('Cannot manage archive: Student email is missing');
      return;
    }
    
    const courseId = student.CourseID || student.courseId || student.id.slice(student.id.lastIndexOf('_') + 1);
    
    setLoadingArchiveData(true);
    try {
      const functions = getFunctions();
      const restoreArchivedStudent = httpsCallable(functions, 'restoreArchivedStudent');
      
      // Check if there's existing data
      const checkResult = await restoreArchivedStudent({
        studentEmail: rawEmail,
        courseId: courseId,
        mode: 'check'
      });
      
      setArchiveData({
        studentEmail: rawEmail,
        courseId: courseId,
        studentName: getStudentInfo.fullName,
        courseName: getSafeValue(student.Course_Value),
        hasExistingData: checkResult.data.hasExistingData,
        existingDataInfo: checkResult.data.existingDataInfo,
        archiveInfo: student.archiveInfo,
        isArchived: isColdStorage,
        archiveFilePath: student.archiveInfo?.archiveFilePath || checkResult.data.archiveFilePath
      });
    } catch (error) {
      console.error('Error checking archive status:', error);
      // Still show dialog with limited info
      setArchiveData({
        studentEmail: rawEmail,
        courseId: courseId,
        studentName: getStudentInfo.fullName,
        courseName: getSafeValue(student.Course_Value),
        archiveInfo: student.archiveInfo,
        isArchived: isColdStorage,
        archiveFilePath: student.archiveInfo?.archiveFilePath,
        error: error.message
      });
    } finally {
      setLoadingArchiveData(false);
    }
  }, [student, getStudentInfo.fullName, isColdStorage]);
  
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const copyToClipboard = (data) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast.success('JSON data copied to clipboard', { duration: 3000 });
  };

  const renderJsonSection = (title, data, sectionKey) => {
    const isExpanded = expandedSections.has(sectionKey);
    const hasData = data && Object.keys(data).length > 0;
    
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center space-x-2">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
            <span className="font-medium text-gray-900">{title}</span>
            {hasData && (
              <span className="text-sm text-gray-500">
                ({Object.keys(data).length} {Object.keys(data).length === 1 ? 'field' : 'fields'})
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasData && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(data);
                }}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </div>
        </button>
        
        {isExpanded && hasData && (
          <div className="border-t border-gray-200">
            <div className="max-h-96 overflow-auto bg-gray-900 p-4">
              <pre className="text-xs text-gray-200 font-mono whitespace-pre-wrap break-all">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
        )}
        
        {isExpanded && !hasData && (
          <div className="p-4 text-gray-500 text-sm">No data available</div>
        )}
      </div>
    );
  };

  const handleArchiveAction = useCallback(async (action) => {
    if (!archiveData) return;
    
    const { studentEmail, courseId } = archiveData;
    setIsRestoring(true);
    setArchiveOptionsDialog(false);
    
    try {
      const functions = getFunctions();
      
      if (action === 'view') {
        // Call viewArchivedData function
        const viewArchivedData = httpsCallable(functions, 'viewArchivedData');
        toast.info('Loading archive data...');
        
        const result = await viewArchivedData({
          studentEmail: studentEmail,
          courseId: courseId
        });
        
        if (result.data.success) {
          // Show data in modal viewer
          setArchiveDataViewModal({
            studentName: archiveData.studentName,
            courseName: archiveData.courseName,
            data: result.data.data,
            stats: result.data.stats,
            currentSummaryData: result.data.currentSummaryData
          });
          setExpandedSections(new Set(['stats']));
          toast.success('Archive data loaded');
        } else {
          toast.error('Failed to load archive data');
        }
      } else {
        // Handle restore actions
        const restoreArchivedStudent = httpsCallable(functions, 'restoreArchivedStudent');
        
        let mode = action;
        if (action === 'restore') {
          mode = 'full_restore';
        }
        
        toast.info('Processing restoration...', {
          description: `Applying ${mode === 'merge_notes' ? 'note merge' : mode === 'archive_current' ? 'archive and restore' : 'full restore'}...`,
          duration: 3000
        });
        
        const result = await restoreArchivedStudent({
          studentEmail: studentEmail,
          courseId: courseId,
          mode: mode
        });
        
        if (result.data.success) {
          let message = '';
          let description = '';
          
          switch(mode) {
            case 'merge_notes':
              message = 'Notes successfully merged';
              description = result.data.message || `Merged historical notes with current enrollment.`;
              break;
            case 'full_restore':
              message = 'Student fully restored';
              description = `Restored all course data and ${result.data.messagesRestored || 0} messages.`;
              break;
            case 'archive_current':
              message = 'Archive swap completed';
              description = `Current enrollment archived, previous enrollment restored.`;
              break;
            default:
              message = 'Operation completed';
              description = result.data.message;
          }
          
          toast.success(message, {
            description: description,
            duration: 5000
          });
          
          // Only refresh for full restore or archive swap actions
          // Don't refresh for merge_notes or view
          if (mode === 'full_restore' || mode === 'archive_current') {
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        } else {
          toast.error('Operation failed', {
            description: result.data.message || 'An error occurred.',
            duration: 5000
          });
        }
      }
    } catch (error) {
      console.error('Error during archive operation:', error);
      toast.error('Operation failed', {
        description: error.message || 'An unexpected error occurred.',
        duration: 5000
      });
    } finally {
      setIsRestoring(false);
    }
  }, [archiveData]);
  
  // Handle restore option selection from modal
  const handleRestoreOption = useCallback(async (mode) => {
    if (!restoreOptionsModal) return;
    
    const { studentEmail, courseId, studentName, courseName } = restoreOptionsModal;
    
    // Close the modal
    setRestoreOptionsModal(null);
    setIsRestoring(true);
    
    try {
      const functions = getFunctions();
      const restoreArchivedStudent = httpsCallable(functions, 'restoreArchivedStudent');
      
      toast.info('Processing restoration...', {
        description: `Applying ${mode === 'merge_notes' ? 'note merge' : mode === 'archive_current' ? 'archive and restore' : 'full restore'}...`,
        duration: 3000
      });
      
      const result = await restoreArchivedStudent({
        studentEmail: studentEmail,
        courseId: courseId,
        mode: mode
      });
      
      if (result.data.success) {
        let message = '';
        let description = '';
        
        switch(mode) {
          case 'merge_notes':
            message = 'Notes successfully merged';
            description = result.data.message || `Merged historical notes with current enrollment.`;
            break;
          case 'full_restore':
            message = 'Student fully restored';
            description = `Overwrote existing enrollment with archived data.`;
            break;
          case 'archive_current':
            message = 'Archive swap completed';
            description = `Current enrollment archived, previous enrollment restored.`;
            break;
          default:
            message = 'Restoration completed';
            description = result.data.message;
        }
        
        toast.success(message, {
          description: description,
          duration: 5000
        });
        
        // Refresh for full restore or archive swap
        if (mode !== 'merge_notes') {
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      } else {
        toast.error('Restoration failed', {
          description: result.data.message || 'An error occurred during restoration.',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error during restoration:', error);
      toast.error('Failed to restore', {
        description: error.message || 'An unexpected error occurred.',
        duration: 5000
      });
    } finally {
      setIsRestoring(false);
    }
  }, [restoreOptionsModal]);

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
    if (!isMobile) {
      console.log('Selected student object:', student); 
      onStudentSelect(student);
    }
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

  // Compute selectedCategories from student.categories (excluding tracking type)
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
              
              // Only include categories that we can find the data for AND are not tracking type
              if (categoryData && categoryData.type !== 'tracking') {
                return {
                  id: categoryId,
                  teacherEmailKey,
                  category: categoryData
                };
              }
              return null; // Skip categories we can't find data for or are tracking type
            }
            return null;
          })
      )
      .filter(Boolean);
  }, [student.categories, groupedTeacherCategories]);
  
  // Compute tracking categories separately
  const trackingCategories = useMemo(() => {
    if (!student.categories) return [];
  
    const trackingCategoriesSet = new Set();
    return Object.entries(student.categories)
      .flatMap(([teacherEmailKey, categories]) =>
        Object.entries(categories)
          .filter(([_, value]) => value === true)
          .map(([categoryId]) => {
            const uniqueKey = `${categoryId}-${teacherEmailKey}`;
            if (!trackingCategoriesSet.has(uniqueKey)) {
              trackingCategoriesSet.add(uniqueKey);
              // Find the category in groupedTeacherCategories
              const categoryData = groupedTeacherCategories[teacherEmailKey]?.find(c => c.id === categoryId);
              
              // Only include categories that are tracking type
              if (categoryData && categoryData.type === 'tracking') {
                return {
                  id: categoryId,
                  teacherEmailKey,
                  category: categoryData
                };
              }
              return null; // Skip categories that are not tracking type
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

  // Helper function to check if a course is a Firebase course using CourseContext
  const isFirebaseCourse = useCallback((courseId) => {
    if (!courseId) return false;
    const courseData = getCourseById(courseId);
    return courseData?.firebaseCourse === true;
  }, [getCourseById]);

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

             {/* Payment Status Badge in header */}
             {(student.payment_status || 
              (getSafeValue(student.StudentType_Value) === "Adult Student") || 
              (getSafeValue(student.StudentType_Value) === "International Student")) && (
              <div className="mt-1 inline-block">
                <PaymentStatusBadge 
                  paymentStatus={
                    student.payment_status || 
                    ((getSafeValue(student.StudentType_Value) === "Adult Student" || 
                      getSafeValue(student.StudentType_Value) === "International Student") ? "unpaid" : null)
                  }
                  onClick={() => setIsPaymentSheetOpen(true)}
                />
              </div>
            )}

            {/* Blacklist warning indicator */}
            {isBlacklisted && (
              <div className="mt-1 space-y-1">
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap cursor-help">
                      <UserX className="w-3 h-3 mr-1" />
                      Blacklisted Student
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[300px] p-3">
                    <div className="space-y-2">
                      <div className="font-semibold text-red-700">⚠️ Blacklisted Student</div>
                      <div className="text-xs">
                        This student's ASN ({student.asn}) or email ({getStudentInfo.email}) 
                        is on the blacklist. They are restricted from registering for new courses.
                      </div>
                      <div className="text-xs text-gray-500">
                        Contact administration to review blacklist status if needed.
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
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
                  const isFirebase = isFirebaseCourse(student.CourseID);
                  
                  return (
                    <div className="flex items-center gap-2">
                      <Badge 
                        className="flex items-center gap-2 px-3 py-1 h-7 text-sm font-medium border-0 rounded-md shadow-sm"
                        style={{
                          backgroundColor: isFirebase ? '#F59E0B15' : `${courseInfo?.color || '#6B7280'}15`,
                          color: isFirebase ? '#F59E0B' : (courseInfo?.color || '#6B7280')
                        }}
                      >
                        {isFirebase ? (
                          <Flame className="w-4 h-4" />
                        ) : (
                          React.createElement(courseInfo?.icon || BookOpen, {
                            className: "w-4 h-4"
                          })
                        )}
                        {courseInfo?.label || `Course ${student.CourseID}`}
                        {isFirebase && (
                          <span className="ml-1 text-xs font-bold text-orange-600">FIREBASE</span>
                        )}
                      </Badge>
                      
                      {student.DiplomaMonthChoices_Value && (
                        <Badge 
                          className="flex items-center gap-1 px-2 py-0.5 h-6 text-xs font-medium border-0 rounded-md"
                          style={{
                            backgroundColor: '#9333EA15',
                            color: '#9333EA'
                          }}
                        >
                          <GraduationCap className="w-3 h-3 mr-1" />
                          {student.DiplomaMonthChoices_Value}
                        </Badge>
                      )}
                      
                      {student.pasiTerm && (
                        <Badge 
                          className="flex items-center gap-1 px-2 py-0.5 h-6 text-xs font-medium border-0 rounded-md"
                          style={{
                            backgroundColor: `${getTermInfo(student.pasiTerm).color}15`,
                            color: getTermInfo(student.pasiTerm).color
                          }}
                        >
                          {getTermInfo(student.pasiTerm).icon && React.createElement(getTermInfo(student.pasiTerm).icon, {
                            className: "w-3 h-3 mr-1"
                          })}
                          {student.pasiTerm}
                        </Badge>
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
              student.grade !== 0 && 
              student.grade !== '' && 
              student.grade !== '0' && (
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
              <div className="border rounded-md p-2 bg-cyan-50 border-cyan-200">
                <div className="flex items-center justify-center mb-1 text-cyan-700">
                  <span className="mr-2"><ArchiveRestore className="h-4 w-4" /></span>
                  <span className="font-medium">Student is Archived</span>
                </div>
                <p className="text-xs text-cyan-600 mb-2">This student's data is ready for cold storage archiving.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center justify-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                  onClick={async (e) => {
                    e.stopPropagation();
                    const db = getDatabase();
                    const studentKey = sanitizeEmail(student.StudentEmail);
                    const courseId = student.CourseID || student.courseId;
                    const summaryKey = `${studentKey}_${courseId}`;
                    
                    try {
                      await set(ref(db, `/studentCourseSummaries/${summaryKey}/ColdStorage`), true);
                      toast.info('Initiating cold storage archiving...', {
                        description: 'The student data will be archived shortly.',
                        duration: 3000
                      });
                    } catch (error) {
                      console.error('Error triggering cold storage:', error);
                      toast.error('Failed to initiate cold storage');
                    }
                  }}
                >
                  <Snowflake className="h-4 w-4" />
                  Move to Cold Storage
                </Button>
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
          
          {/* Tracking Categories Button */}
          {trackingCategories.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs font-normal ml-2"
              onClick={(e) => {
                e.stopPropagation();
                setShowTrackingCategories(!showTrackingCategories);
              }}
            >
              <Activity className="h-4 w-4 mr-1" />
              Tracking
              <Badge className="ml-1 px-1 h-4 text-[10px]" variant="secondary">
                {trackingCategories.length}
              </Badge>
              <ChevronDown 
                className={`h-3 w-3 ml-1 opacity-50 transition-transform ${showTrackingCategories ? 'rotate-180' : ''}`} 
              />
            </Button>
          )}
        </div>
        
        {/* Tracking Categories List */}
        {showTrackingCategories && trackingCategories.length > 0 && (
          <div className="mt-2 p-2 bg-gray-50 rounded-md border border-gray-200">
            <div className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
              <Activity className="h-3 w-3 mr-1" />
              Tracking Data
            </div>
            <div className="space-y-1">
              {trackingCategories.map(({ id, teacherEmailKey, category }) => (
                <div 
                  key={`tracking-${id}-${teacherEmailKey}-${student.id}`}
                  className="flex items-center justify-between py-1 px-2 rounded hover:bg-gray-100"
                >
                  <span className="text-xs flex items-center">
                    {iconMap[category.icon] && React.createElement(iconMap[category.icon], { 
                      size: 12, 
                      className: 'mr-1.5',
                      style: { color: category.color }
                    })}
                    <span style={{ color: category.color }}>{category.name}</span>
                  </span>
                  <X
                    className="cursor-pointer text-gray-400 hover:text-gray-600"
                    size={12}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCategory(id, teacherEmailKey);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

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
            // Check if this is a Firebase course
            const isStudentFirebaseCourse = isFirebaseCourse(student.CourseID);
            
            // Calculate number of visible buttons
            const buttonCount = 
              (checkAsnIssues ? 1 : 0) +
              (isStudentFirebaseCourse ? 1 : 0) + // Firebase course button
              1 + // Chat is always visible
              (hasProfileHistory ? 1 : 0) +
              1 + // Emulate is always visible
              (isAdminUser ? 1 : 0) +
              (canRestore ? 1 : 0);
            
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

                {isStudentFirebaseCourse && (
                  <Button
                    variant="outline"
                    size="sm"
                    className={`${buttonClass} text-orange-600 hover:text-orange-700 border-orange-200`}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Navigate to Firebase course view for this student
                      const studentEmail = getStudentInfo.email;
                      const courseId = student.CourseID;
                      window.open(`/firebase-course/${courseId}?student=${encodeURIComponent(studentEmail)}`, 'firebaseCourseTab');
                    }}
                  >
                    <Flame className={iconClass} />
                    {useShortLabels ? "Course" : "Firebase Course"}
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

                {isAdminUser && (
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`${buttonClass} text-red-600 hover:text-red-700 border-red-200 bg-red-50 hover:bg-red-100 relative`}
                        onClick={(e) => {
                          setIsRemovalDialogOpen(true);
                        }}
                      >
                        <Trash2 className={iconClass} />
                        Remove
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" title="Admin Only"></span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <div className="text-xs">
                        <div className="font-semibold">Admin Only</div>
                        <div>Remove course from student record</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}

                {canRestore && (
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`${buttonClass} text-blue-600 hover:text-blue-700`}
                        onClick={handleOpenArchiveOptions}
                        disabled={isRestoring}
                      >
                        <ArchiveRestore className={iconClass} />
                        Archive Options
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <div className="text-xs">
                        <div className="font-semibold">Archive Management</div>
                        <div>View and manage archived student data</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
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
        studentKey={(() => {
          const rawEmail = student.StudentEmail;
  if (!rawEmail) {
    console.error('StudentEmail is missing for student:', student);
    toast.error('Cannot update: Student email is missing');
    return;
  }
          return sanitizeEmail(rawEmail);
        })()}
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
        studentKey={(() => {
          const rawEmail = student.StudentEmail;
  if (!rawEmail) {
    console.error('StudentEmail is missing for student:', student);
    toast.error('Cannot update: Student email is missing');
    return;
  }
          return sanitizeEmail(rawEmail);
        })()}
        courseId={student.CourseID || student.courseId || student.id.slice(student.id.lastIndexOf('_') + 1)}
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
        studentKey={(() => {
          const rawEmail = student.StudentEmail;
  if (!rawEmail) {
    console.error('StudentEmail is missing for student:', student);
    toast.error('Cannot update: Student email is missing');
    return;
  }
          return sanitizeEmail(rawEmail);
        })()}
        courseId={student.CourseID || student.courseId || student.id.slice(student.id.lastIndexOf('_') + 1)}
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
            <ProfileHistory studentEmailKey={(() => {
              const rawEmail = student.StudentEmail;
  if (!rawEmail) {
    console.error('StudentEmail is missing for student:', student);
    toast.error('Cannot update: Student email is missing');
    return;
  }
              return sanitizeEmail(rawEmail);
            })()} />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Archive Options Sheet */}
      <Sheet open={archiveOptionsDialog} onOpenChange={setArchiveOptionsDialog}>
        <SheetContent className="w-full sm:max-w-md flex flex-col h-full p-0">
          <SheetHeader className="px-6 pt-6 pb-4 flex-shrink-0">
            <SheetTitle className="flex items-center space-x-2">
              <ArchiveRestore className="w-5 h-5 text-blue-600" />
              <span>Archive Management</span>
            </SheetTitle>
            <SheetDescription>
              View and manage archived student data
            </SheetDescription>
          </SheetHeader>
          
          <ScrollArea className="flex-1 px-6 pb-6">
            <div className="space-y-4">
            {loadingArchiveData ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-sm text-gray-600">Loading archive information...</p>
                </div>
              </div>
            ) : archiveData ? (
              <>
              {/* Archive Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Archive Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Student:</span>
                    <span className="font-medium">{archiveData.studentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Course:</span>
                    <span className="font-medium">{archiveData.courseName}</span>
                  </div>
                  {archiveData.archiveInfo?.archivedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Archived Date:</span>
                      <span className="font-medium">
                        {format(new Date(archiveData.archiveInfo.archivedAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  )}
                  {archiveData.archiveInfo?.restorationInfo?.restoredAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Restored:</span>
                      <span className="font-medium text-green-600">
                        {format(new Date(archiveData.archiveInfo.restorationInfo.restoredAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Status:</span>
                    <span className={`font-medium ${
                      archiveData.isArchived ? 'text-cyan-600' : 'text-green-600'
                    }`}>
                      {archiveData.isArchived ? 'Archived' : 'Active'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Current Enrollment Info (if exists) */}
              {archiveData.hasExistingData && archiveData.existingDataInfo && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                    Current Enrollment Detected
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• School Year: {archiveData.existingDataInfo.schoolYear}</li>
                    <li>• Status: {archiveData.existingDataInfo.status}</li>
                    <li>• Enrollment Date: {archiveData.existingDataInfo.enrollmentDate ? 
                      format(new Date(archiveData.existingDataInfo.enrollmentDate), 'MMM d, yyyy') : 'Unknown'}</li>
                    {archiveData.existingDataInfo.hasNotes && (
                      <li>• Current Notes: {archiveData.existingDataInfo.noteCount} existing notes</li>
                    )}
                    {archiveData.existingDataInfo.totalArchivedNotes > 0 && (
                      <li>• Archive Notes: {archiveData.existingDataInfo.totalArchivedNotes} notes ({archiveData.existingDataInfo.uniqueArchivedNotes} unique)</li>
                    )}
                  </ul>
                </div>
              )}
              
              {/* Error Message */}
              {archiveData.error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    {archiveData.error}
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Action Buttons */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900 mb-2">Available Actions</h3>
                
                {/* View Archive Data - Always available if archive exists */}
                {archiveData.archiveFilePath && (
                  <Button
                    onClick={() => handleArchiveAction('view')}
                    className="w-full justify-between bg-gray-600 hover:bg-gray-700 text-white"
                    disabled={isRestoring}
                  >
                    <div className="text-left">
                      <div className="font-medium">View Archive Data</div>
                      <div className="text-xs opacity-90">Inspect the archived data without making changes</div>
                    </div>
                    <Eye className="w-5 h-5" />
                  </Button>
                )}
                
                {/* Restore Options based on current state */}
                {archiveData.isArchived && !archiveData.hasExistingData && (
                  <Button
                    onClick={() => handleArchiveAction('restore')}
                    className="w-full justify-between bg-green-600 hover:bg-green-700 text-white"
                    disabled={isRestoring}
                  >
                    <div className="text-left">
                      <div className="font-medium">Restore from Archive</div>
                      <div className="text-xs opacity-90">Restore all student data from cold storage</div>
                    </div>
                    <RefreshCw className="w-5 h-5" />
                  </Button>
                )}
                
                {/* Show merge/replace options if:
                   1. Student is archived with existing data OR
                   2. Student is active with archive data available (already restored but can re-apply) */}
                {(archiveData.hasExistingData || (!archiveData.isArchived && archiveData.archiveFilePath)) && (
                  <>
                    {/* Only show merge notes button if there are unique notes to merge */}
                    {archiveData.existingDataInfo?.canMergeNotes && (
                      <Button
                        onClick={() => handleArchiveAction('merge_notes')}
                        className="w-full justify-between bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={isRestoring}
                      >
                        <div className="text-left">
                          <div className="font-medium">Merge Notes Only</div>
                          <div className="text-xs opacity-90">
                            Add {archiveData.existingDataInfo.uniqueArchivedNotes} unique historical note{archiveData.existingDataInfo.uniqueArchivedNotes !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <MessageSquare className="w-5 h-5" />
                      </Button>
                    )}
                    
                    {/* Show info message if no unique notes to merge */}
                    {archiveData.existingDataInfo && !archiveData.existingDataInfo.canMergeNotes && archiveData.existingDataInfo.totalArchivedNotes > 0 && (
                      <div className="w-full p-3 bg-gray-100 rounded-lg">
                        <div className="text-sm text-gray-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>All archived notes already exist in current enrollment</span>
                        </div>
                      </div>
                    )}
                    
                    <Button
                      onClick={() => handleArchiveAction('archive_current')}
                      className="w-full justify-between bg-orange-600 hover:bg-orange-700 text-white"
                      disabled={isRestoring}
                    >
                      <div className="text-left">
                        <div className="font-medium">Swap with Archive</div>
                        <div className="text-xs opacity-90">Save current enrollment & restore archived</div>
                      </div>
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                    
                  </>
                )}
              </div>
              
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No archive information available</p>
              </div>
            )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
      
      {/* Archive Data Viewer Modal */}
      {archiveDataViewModal && (
        <Dialog open={!!archiveDataViewModal} onOpenChange={(open) => !open && setArchiveDataViewModal(null)}>
          <DialogContent className="max-w-6xl w-[90vw] h-[85vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileJson className="w-6 h-6 text-blue-600" />
                  <div>
                    <DialogTitle>Archive Data Viewer</DialogTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {archiveDataViewModal.courseName} - {archiveDataViewModal.studentName}
                    </p>
                  </div>
                </div>
              </div>
            </DialogHeader>
            
            <div className="flex-1 overflow-auto p-4">
              {/* Statistics */}
              {archiveDataViewModal.stats && (
                <div className="mb-6">
                  {renderJsonSection('Archive Statistics', {
                    'File Size (Compressed)': formatBytes(archiveDataViewModal.stats.compressedSize),
                    'File Size (Decompressed)': formatBytes(archiveDataViewModal.stats.decompressedSize),
                    'Compression Ratio': archiveDataViewModal.stats.compressionRatio,
                    'Message Count': archiveDataViewModal.stats.messageCount,
                    'Student Notes': archiveDataViewModal.stats.noteCount,
                    'Has Previous Enrollments': archiveDataViewModal.stats.hasPreviousEnrollments ? 'Yes' : 'No',
                    'Archive Date': archiveDataViewModal.stats.archiveDate ? format(new Date(archiveDataViewModal.stats.archiveDate), 'MMM d, yyyy h:mm a') : 'Unknown',
                    'Archive File Path': archiveDataViewModal.stats.filePath
                  }, 'stats')}
                </div>
              )}
              
              <div className="space-y-4">
                {/* Archive Metadata */}
                {renderJsonSection('Archive Metadata', archiveDataViewModal.data.archiveMetadata, 'archiveMetadata')}
                
                {/* Student Course Summary */}
                {renderJsonSection('Student Course Summary', archiveDataViewModal.data.studentCourseSummary, 'studentCourseSummary')}
                
                {/* Course Data */}
                {renderJsonSection('Course Data', archiveDataViewModal.data.courseData, 'courseData')}
                
                {/* Course Messages */}
                {renderJsonSection(
                  `Course Messages (${Object.keys(archiveDataViewModal.data.courseMessages || {}).length})`, 
                  archiveDataViewModal.data.courseMessages, 
                  'courseMessages'
                )}
                
                {/* Current Summary Data */}
                {archiveDataViewModal.currentSummaryData && 
                  renderJsonSection('Current Summary Info', archiveDataViewModal.currentSummaryData, 'currentSummaryData')
                }
              </div>
            </div>
            
            <div className="flex-shrink-0 px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Click arrows to expand/collapse sections
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => copyToClipboard(archiveDataViewModal.data)}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy All Data</span>
                </Button>
                <Button
                  onClick={() => setArchiveDataViewModal(null)}
                  size="sm"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Payment Info Sheet */}
      <Sheet open={isPaymentSheetOpen} onOpenChange={setIsPaymentSheetOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col h-full p-0">
          <SheetHeader className="px-6 pt-6 pb-4 flex-shrink-0">
            <SheetTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <span>Payment Information</span>
            </SheetTitle>
            <SheetDescription>
              View and manage payment status for {getStudentInfo.fullName}
            </SheetDescription>
          </SheetHeader>
          
          <div className="flex-1 px-6 pb-6 overflow-hidden">
            <PaymentInfo
              studentKey={student.StudentEmail ? sanitizeEmail(student.StudentEmail) : null}
              courseId={student.CourseID || student.courseId || student.id?.slice(student.id.lastIndexOf('_') + 1)}
              paymentStatus={
                student.payment_status || 
                ((getSafeValue(student.StudentType_Value) === "Adult Student" || 
                  getSafeValue(student.StudentType_Value) === "International Student") ? "unpaid" : null)
              }
              readOnly={false}
              onPaymentStatusUpdate={(newStatus) => {
                // The status will be updated via realtime listener in PaymentInfo component
                // This callback is optional for additional handling if needed
                console.log('Payment status updated to:', newStatus);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
});

export default StudentCard;