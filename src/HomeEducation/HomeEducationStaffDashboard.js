import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { getDatabase, ref, onValue, off, query, orderByChild, equalTo, get, update, set, remove } from 'firebase/database';
import { TableVirtuoso } from 'react-virtuoso';
import { useAuth } from '../context/AuthContext';
import { useStaffClaims } from '../customClaims/useStaffClaims';
import {
  Users,
  GraduationCap,
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  Clock,
  Home,
  Building2,
  Hash,
  User,
  UserCheck,
  Globe,
  ToggleLeft,
  ToggleRight,
  X,
  ChevronDown,
  ChevronRight,
  FilterX,
  Settings,
  UserPlus,
  Plus,
  MessageSquare,
  Edit,
  MoreVertical,
  Save,
  AlertTriangle,
  StarIcon as Star,
  Loader2,
  Maximize2,
  Minimize2,
  PanelRightOpen,
  CreditCard,
  BookOpen,
  HelpCircle,
  ClipboardCheck,
  Check,
  Copy,
  Cake,
  Tag,
  Tags,
  Circle,
  Square,
  Triangle,
  Trophy,
  Target,
  Brain,
  Lightbulb,
  BarChart,
  TrendingUp,
  MessageCircle,
  Presentation,
  Bookmark,
  Snowflake,
  Flower,
  Sun,
  Leaf,
  Award,
  Flag,
  Zap,
  Pause,
  Play,
  AlertOctagon,
  Heart,
  Sparkles,
  ShieldAlert,
  Rocket,
  Hourglass,
  Palette,
  Calculator,
  School,
  Video,
  Headphones,
  Grid2X2,
  BookOpenCheck,
  ExternalLink
} from 'lucide-react';
import {
  getCurrentSchoolYear,
  getActiveSeptemberCount,
  formatImportantDate,
  getAllSeptemberCountDates,
  getAllOpenRegistrationSchoolYears
} from '../config/calendarConfig';
import { formatDateForDisplay } from '../utils/timeZoneUtils';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import RTDConnectDashboard from '../RTDConnect/Dashboard';
import { getAllFacilitators, getFacilitatorByEmail } from '../config/facilitators';
import { getAllAlbertaCourses, getAlbertaCourseById } from '../config/albertaCourses';
import FacilitatorSelector from './FacilitatorSelector';
import { useNavigate } from 'react-router-dom';
import FamilyNotesIcon from './FamilyNotes/FamilyNotesIcon';
import FamilyMessaging from './FamilyMessaging';
import HomeEducationCategoryManager from './HomeEducationCategoryManager';
// Lazy load components to prevent circular dependencies and loading issues
const FamilyNotesModal = React.lazy(() => import('./FamilyNotes/FamilyNotesModal'));
import StaffDocumentReview from './StaffDocumentReview';
import CSVColumnSelector from './CSVColumnSelector';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../components/ui/table';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '../components/ui/sheet';
import { Checkbox } from '../components/ui/checkbox';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuLabel
} from '../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Input } from '../components/ui/input';

// Icon mapping for categories
const iconMap = {
  'circle': Circle,
  'square': Square,
  'triangle': Triangle,
  'book-open': BookOpen,
  'graduation-cap': GraduationCap,
  'trophy': Trophy,
  'target': Target,
  'clipboard-check': ClipboardCheck,
  'brain': Brain,
  'lightbulb': Lightbulb,
  'clock': Clock,
  'calendar': Calendar,
  'bar-chart': BarChart,
  'trending-up': TrendingUp,
  'alert-circle': AlertCircle,
  'help-circle': HelpCircle,
  'message-circle': MessageCircle,
  'users': Users,
  'presentation': Presentation,
  'file-text': FileText,
  'bookmark': Bookmark,
  'snowflake': Snowflake,
  'flower': Flower,
  'sun': Sun,
  'leaf': Leaf,
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
  'user-check': UserCheck,
  'user-plus': UserPlus,
  'grid-2x2': Grid2X2
};

// Utility function to generate consistent color from string
const stringToColor = (str) => {
  if (!str) return '#9CA3AF'; // Default gray color
  
  // Get first 2 characters and convert to number
  const firstTwo = (str.substring(0, 2).toUpperCase());
  let hash = 0;
  for (let i = 0; i < firstTwo.length; i++) {
    hash = firstTwo.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate hue between 0-360
  const hue = Math.abs(hash % 360);
  // Use consistent saturation and lightness for good visibility
  return `hsl(${hue}, 70%, 45%)`;
};

// Utility function to format date as relative time
const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Never';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}yr ago`;
};

// Helper function to determine student registration status (ported from RegistrarDashboard)
const determineStudentRegistrationStatus = (student, familyData, schoolYear) => {
  const dbSchoolYear = schoolYear.replace('/', '_');

  // Check if student has ASN or is marked ready for PASI
  const hasASN = !!student.asn || student.readyForPASI === true;

  // Check notification form status
  const notificationForm = familyData?.NOTIFICATION_FORMS?.[dbSchoolYear]?.[student.id];
  const hasNotificationForm = !!notificationForm;
  const notificationFormSubmitted = notificationForm?.submissionStatus === 'submitted';

  // Check citizenship docs
  const citizenshipDocs = familyData?.STUDENT_CITIZENSHIP_DOCS?.[student.id];
  const hasApprovedDocs = citizenshipDocs?.staffApproval?.isApproved === true;
  const docsNeedReview = citizenshipDocs?.requiresStaffReview === true;

  // Check SOLO plan
  const soloPlan = familyData?.SOLO_EDUCATION_PLANS?.[dbSchoolYear]?.[student.id];
  const hasSoloPlan = !!soloPlan;
  const soloPlanSubmitted = soloPlan?.submissionStatus === 'submitted';

  // Check if marked as registered in PASI
  const pasiRegistration = familyData?.PASI_REGISTRATIONS?.[dbSchoolYear]?.[student.id];
  const registeredInPasi = pasiRegistration?.status === 'completed';

  // Determine overall status
  if (registeredInPasi) {
    // Check if registration is complete or incomplete
    const missingItems = [];
    if (!hasASN) missingItems.push('ASN');
    if (!hasApprovedDocs) missingItems.push('Citizenship Docs');
    if (!hasSoloPlan || !soloPlanSubmitted) missingItems.push('Education Plan');
    
    if (missingItems.length > 0) {
      return {
        status: 'incomplete',
        label: `Incomplete - Missing: ${missingItems.join(', ')}`,
        color: 'yellow',
        priority: 1,
        missingItems
      };
    }
    
    return {
      status: 'completed',
      label: 'Registered in PASI - Complete',
      color: 'green',
      priority: 0
    };
  }
  
  // Not registered in PASI yet - check requirements
  if (!hasNotificationForm || !notificationFormSubmitted) {
    return {
      status: 'queue',
      label: 'Missing Notification Form',
      color: 'orange',
      priority: 3
    };
  }
  
  // Has notification form - ready for PASI even if missing other items
  const missingItems = [];
  // Only count ASN as missing if not marked ready for PASI
  if (!student.asn && !student.readyForPASI) missingItems.push('ASN');
  if (!hasApprovedDocs) missingItems.push('Citizenship Docs');
  if (!hasSoloPlan || !soloPlanSubmitted) missingItems.push('Education Plan');
  
  // Add special indicator if ready for PASI but needs ASN created
  const needsASNCreation = student.readyForPASI && !student.asn;
  
  return {
    status: 'ready',
    label: missingItems.length > 0 ? `Ready for PASI (Missing: ${missingItems.join(', ')})` : 
           needsASNCreation ? 'Ready for PASI (ASN pending)' : 'Ready for PASI',
    color: 'blue',
    priority: 2,
    missingItems,
    needsASNCreation
  };
};

// Helper function to determine family registration status (aggregate of all students)
const determineFamilyRegistrationStatus = (family, schoolYear) => {
  const students = family.students ? Object.values(family.students) : [];

  if (students.length === 0) {
    return {
      status: 'no-students',
      label: 'No Students',
      color: 'gray',
      priority: -1,
      studentStatuses: []
    };
  }

  // Get status for each student
  const studentStatuses = students.map(student => {
    const status = determineStudentRegistrationStatus(student, family, schoolYear);
    return {
      student,
      status
    };
  });
  
  // Count students in each status
  const statusCounts = {
    queue: 0,
    ready: 0,
    incomplete: 0,
    completed: 0
  };
  
  studentStatuses.forEach(({ status }) => {
    if (statusCounts.hasOwnProperty(status.status)) {
      statusCounts[status.status]++;
    }
  });
  
  // Determine overall family status (worst case)
  // Priority: queue > ready > incomplete > completed
  let familyStatus;
  if (statusCounts.queue > 0) {
    familyStatus = {
      status: 'queue',
      label: `${statusCounts.queue} student${statusCounts.queue > 1 ? 's' : ''} missing notification`,
      color: 'orange',
      priority: 3
    };
  } else if (statusCounts.ready > 0) {
    familyStatus = {
      status: 'ready',
      label: `${statusCounts.ready} student${statusCounts.ready > 1 ? 's' : ''} ready for PASI`,
      color: 'blue',
      priority: 2
    };
  } else if (statusCounts.incomplete > 0) {
    familyStatus = {
      status: 'incomplete',
      label: `${statusCounts.incomplete} student${statusCounts.incomplete > 1 ? 's' : ''} incomplete`,
      color: 'yellow',
      priority: 1
    };
  } else if (statusCounts.completed === students.length) {
    familyStatus = {
      status: 'completed',
      label: 'All students registered',
      color: 'green',
      priority: 0
    };
  } else {
    familyStatus = {
      status: 'mixed',
      label: 'Mixed statuses',
      color: 'gray',
      priority: 1
    };
  }
  
  return {
    ...familyStatus,
    studentStatuses,
    statusCounts,
    totalStudents: students.length
  };
};

// Registration Status Badge Component
const RegistrationStatusBadge = ({ registrationStatus }) => {
  if (!registrationStatus) return null;
  
  const getStatusStyles = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'ready':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'incomplete':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'queue':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'ready':
        return <ClipboardCheck className="w-3.5 h-3.5" />;
      case 'incomplete':
        return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'queue':
        return <Clock className="w-3.5 h-3.5" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5" />;
    }
  };
  
  // Get shortened status text
  const getShortStatus = (status) => {
    switch (status) {
      case 'completed':
        return 'Done';
      case 'ready':
        return 'Ready';
      case 'incomplete':
        return 'Inc.';
      case 'queue':
        return 'Queue';
      default:
        return 'N/A';
    }
  };

  // Get full status text for tooltip
  const getFullStatus = (status) => {
    switch (status) {
      case 'completed':
        return 'Registration Completed';
      case 'ready':
        return 'Ready for PASI Submission';
      case 'incomplete':
        return 'Incomplete Registration';
      case 'queue':
        return 'In Queue for Processing';
      default:
        return 'Not Available';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border ${getStatusStyles(registrationStatus.status)}`}>
            {getStatusIcon(registrationStatus.status)}
            <span className="text-xs font-medium">
              {getShortStatus(registrationStatus.status)}
            </span>
            {registrationStatus.statusCounts && registrationStatus.totalStudents > 1 && (
              <span className="text-xs opacity-75">
                {registrationStatus.statusCounts[registrationStatus.status]}/{registrationStatus.totalStudents}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <div className="space-y-2">
            <p className="font-semibold">{getFullStatus(registrationStatus.status)}</p>
            {registrationStatus.studentStatuses && registrationStatus.studentStatuses.length > 0 && (
              <div className="space-y-1 text-xs">
                <p className="font-medium">Student Details:</p>
                {registrationStatus.studentStatuses.map(({ student, status }, idx) => (
                  <div key={idx} className="flex items-start gap-1 ml-2">
                    <span className="font-medium">• {student.firstName} {student.lastName}:</span>
                    <span className={`text-${status.color}-600`}>{status.label}</span>
                  </div>
                ))}
              </div>
            )}
            {registrationStatus.statusCounts && (
              <div className="text-xs border-t pt-1 mt-2">
                {registrationStatus.statusCounts.queue > 0 && (
                  <p>Queue: {registrationStatus.statusCounts.queue} students</p>
                )}
                {registrationStatus.statusCounts.ready > 0 && (
                  <p>Ready for PASI: {registrationStatus.statusCounts.ready} students</p>
                )}
                {registrationStatus.statusCounts.incomplete > 0 && (
                  <p>Incomplete: {registrationStatus.statusCounts.incomplete} students</p>
                )}
                {registrationStatus.statusCounts.completed > 0 && (
                  <p>Completed: {registrationStatus.statusCounts.completed} students</p>
                )}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Comprehensive Status Badge Component
const ComprehensiveStatusBadge = ({ statuses, assistanceRequired = false, familyId, onToggleAssistance, onDocumentReview }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'submitted':
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'partial':
      case 'in_progress':
      case 'pending_review':
      case 'pending_setup':
        return 'text-orange-600 bg-orange-100';
      case 'pending':
      case 'not_started':
      default:
        return 'text-red-600 bg-red-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'submitted':
      case 'active':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'partial':
      case 'in_progress':
      case 'pending_review':
      case 'pending_setup':
        return <Clock className="w-3.5 h-3.5" />;
      case 'pending':
      case 'not_started':
      default:
        return <X className="w-3.5 h-3.5" />;
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {/* Notification Form Status */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className={`p-1 rounded relative ${getStatusColor(statuses.notificationForm)} ${
                assistanceRequired && onToggleAssistance ? 'cursor-pointer hover:ring-2 hover:ring-yellow-400 transition-all' : ''
              }`}
              onClick={assistanceRequired && onToggleAssistance ? () => onToggleAssistance(familyId, false) : undefined}
            >
              <FileText className="w-3.5 h-3.5" />
              {assistanceRequired && (
                <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5 animate-pulse">
                  <HelpCircle className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-semibold">Notification Form</p>
            <p className="text-xs capitalize">{statuses.notificationForm.replace('_', ' ')}</p>
            {assistanceRequired && (
              <>
                <p className="text-xs text-yellow-600 font-medium mt-1">⚠️ Assistance Requested</p>
                {onToggleAssistance && (
                  <p className="text-xs text-gray-600 mt-1">🖱️ Click to mark as handled</p>
                )}
              </>
            )}
          </TooltipContent>
        </Tooltip>

        {/* Program Plan Status */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`p-1 rounded ${getStatusColor(statuses.programPlan)}`}>
              <BookOpen className="w-3.5 h-3.5" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-semibold">Program Plan</p>
            <p className="text-xs capitalize">{statuses.programPlan.replace('_', ' ')}</p>
          </TooltipContent>
        </Tooltip>

        {/* Citizenship Docs Status */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className={`p-1 rounded relative ${getStatusColor(statuses.citizenshipDocs)} ${
                onDocumentReview 
                  ? 'cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all transform hover:scale-105' 
                  : ''
              }`}
              onClick={onDocumentReview 
                ? () => onDocumentReview(familyId)
                : undefined}
            >
              <UserCheck className="w-3.5 h-3.5" />
              {statuses.citizenshipDocs === 'pending_review' && (
                <div className="absolute -top-1 -right-1 bg-orange-500 rounded-full p-0.5 animate-pulse">
                  <Eye className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-semibold">Citizenship Docs</p>
            <p className="text-xs capitalize">{statuses.citizenshipDocs.replace('_', ' ')}</p>
            {statuses.citizenshipDocs === 'pending_review' && (
              <p className="text-xs text-orange-600 font-medium mt-1">🔍 Staff Review Required</p>
            )}
            {onDocumentReview && (
              <p className="text-xs text-gray-600 mt-1">🖱️ Click to review documents</p>
            )}
          </TooltipContent>
        </Tooltip>

        {/* Payment Setup Status */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`p-1 rounded ${getStatusColor(statuses.paymentSetup)}`}>
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-semibold">Payment Setup</p>
            <p className="text-xs capitalize">{statuses.paymentSetup.replace('_', ' ')}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

// Bulk Actions Toolbar Component - Extracted to fix dropdown issues
const BulkActionsToolbar = ({ 
  selectedFamilies, 
  clearSelection, 
  bulkActionLoading, 
  selectedStatus, 
  setSelectedStatus, 
  handleBulkSetStatus, 
  handleBulkSetAssistance, 
  handleBulkEmail 
}) => {
  if (selectedFamilies.size === 0) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-lg transform transition-transform duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              {selectedFamilies.size} {selectedFamilies.size === 1 ? 'family' : 'families'} selected
            </span>
            <button
              onClick={clearSelection}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear selection
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  disabled={bulkActionLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bulkActionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Settings className="w-4 h-4" />
                  )}
                  <span>Bulk Actions</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 p-4">
                <div className="space-y-4">
                  {/* Status Update Section */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <ToggleRight className="w-4 h-4 mr-2 text-gray-500" />
                      Set Family Status
                    </label>
                    <div className="flex items-center space-x-2">
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">
                            <span className="flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                              Active
                            </span>
                          </SelectItem>
                          <SelectItem value="inactive">
                            <span className="flex items-center">
                              <span className="w-2 h-2 bg-gray-500 rounded-full mr-2" />
                              Inactive
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <button
                        onClick={() => handleBulkSetStatus(selectedStatus)}
                        className="px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Assistance Required Section */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Assistance Required
                    </label>
                    <div className="space-y-1">
                      <button
                        onClick={() => handleBulkSetAssistance(true)}
                        className="w-full flex items-center px-3 py-2 text-sm text-left hover:bg-gray-100 rounded-md"
                      >
                        <HelpCircle className="w-4 h-4 mr-2 text-yellow-500" />
                        Set Assistance Required
                      </button>
                      <button
                        onClick={() => handleBulkSetAssistance(false)}
                        className="w-full flex items-center px-3 py-2 text-sm text-left hover:bg-gray-100 rounded-md"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                        Clear Assistance Required
                      </button>
                    </div>
                  </div>

                  {/* Email Section */}
                  <DropdownMenuSeparator className="my-2" />
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-500" />
                      Communication
                    </label>
                    <button
                      onClick={handleBulkEmail}
                      className="w-full flex items-center px-3 py-2 text-sm text-left hover:bg-gray-100 rounded-md"
                    >
                      <Mail className="w-4 h-4 mr-2 text-blue-500" />
                      Email Families
                    </button>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

// ASN Edit Sheet Component - Allows editing student ASNs in a sheet interface
const ASNEditSheet = ({ isOpen, onClose, families, familyId, onUpdate, currentStudent = null }) => {
  const [selectedStudentId, setSelectedStudentId] = useState(currentStudent?.id || null);
  const [asnValues, setAsnValues] = useState({});
  const [isValid, setIsValid] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState({});
  const [justSaved, setJustSaved] = useState({});
  const [readyForPASI, setReadyForPASI] = useState({});
  const [copiedField, setCopiedField] = useState(null);
  const inputRefs = useRef({});

  // Get fresh family data from families prop
  const family = families?.[familyId] || null;
  // Use Object.entries to preserve the database keys
  const studentEntries = family?.students ? Object.entries(family.students) : [];
  const students = studentEntries.map(([dbKey, student]) => ({
    ...student,
    dbKey: dbKey // Store the actual database key
  }));
  const selectedStudent = students.find(s => s.dbKey === selectedStudentId) || students[0];

  // Format ASN for display (1234-5678-9)
  const formatASN = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as 1234-5678-9
    if (digits.length <= 4) {
      return digits;
    } else if (digits.length <= 8) {
      return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    } else {
      return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 9)}`;
    }
  };

  // Validate ASN (must be exactly 9 digits)
  const validateASN = (value) => {
    const digits = value.replace(/\D/g, '');
    return digits.length === 9;
  };

  // Initialize ASN values and ready for PASI status when sheet opens or family changes
  useEffect(() => {
    if (isOpen && students.length > 0) {
      const initialValues = {};
      const initialValid = {};
      const initialReadyStatus = {};
      students.forEach(student => {
        initialValues[student.dbKey] = student.asn ? formatASN(student.asn) : '';
        initialValid[student.dbKey] = true;
        initialReadyStatus[student.dbKey] = student.readyForPASI === true;
        console.log(`Student ${student.firstName} ${student.lastName}: readyForPASI = ${student.readyForPASI}, dbKey = ${student.dbKey}`);
      });
      setAsnValues(initialValues);
      setIsValid(initialValid);
      setReadyForPASI(initialReadyStatus);
      
      // Set initial selected student if not already set
      if (!selectedStudentId && students.length > 0) {
        // Find first student without ASN, or use first student
        const firstMissingASN = students.find(s => !s.asn && !s.readyForPASI);
        setSelectedStudentId(firstMissingASN?.dbKey || students[0].dbKey);
      }
    }
  }, [isOpen, familyId, families, selectedStudentId]);

  // Handle input change for a specific student
  const handleInputChange = (studentId, value) => {
    const formattedValue = formatASN(value);
    setAsnValues(prev => ({ ...prev, [studentId]: formattedValue }));
    setIsValid(prev => ({ ...prev, [studentId]: validateASN(value) }));
  };

  // Handle paste event
  const handlePaste = (studentId, e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const formattedValue = formatASN(pastedText);
    setAsnValues(prev => ({ ...prev, [studentId]: formattedValue }));
    setIsValid(prev => ({ ...prev, [studentId]: validateASN(pastedText) }));
  };

  // Handle Ready for PASI checkbox toggle
  const handleReadyForPASIToggle = (studentId) => {
    const newValue = !readyForPASI[studentId];
    
    // Update local state only - actual save happens when Save button is clicked
    setReadyForPASI(prev => ({ ...prev, [studentId]: newValue }));
    
    // Clear ASN value when checking "No ASN Yet"
    if (newValue) {
      setAsnValues(prev => ({ ...prev, [studentId]: '' }));
      setIsValid(prev => ({ ...prev, [studentId]: true })); // No validation needed for "No ASN Yet"
    }
  };

  // Save ASN for a specific student
  const handleSave = async (studentId, moveToNext = true) => {
    const asnValue = asnValues[studentId] || '';
    const isReadyForPASI = readyForPASI[studentId];
    
    console.log('handleSave called:', { 
      studentId, 
      asnValue, 
      isReadyForPASI, 
      familyId,
      selectedStudent,
      allStudentIds: students.map(s => s.id)
    });
    
    // If not ready for PASI, validate ASN
    if (!isReadyForPASI && !validateASN(asnValue)) {
      setIsValid(prev => ({ ...prev, [studentId]: false }));
      return;
    }

    setIsSaving(true);
    try {
      const db = getDatabase();
      
      // If ready for PASI (No ASN Yet), save to database
      if (isReadyForPASI) {
        const updatePath = `homeEducationFamilies/familyInformation/${familyId}/students/${studentId}`;
        console.log('Saving readyForPASI to EXACT path:', updatePath);
        console.log('StudentId type:', typeof studentId, 'Value:', studentId);
        console.log('FamilyId type:', typeof familyId, 'Value:', familyId);
        
        try {
          // Save the readyForPASI status and clear ASN
          const updateData = {
            asn: '', // Clear any existing ASN
            readyForPASI: true
          };
          console.log('Update data being sent:', updateData);
          await update(ref(db, updatePath), updateData);
          
          // Verify the update by reading back from database
          const verifyRef = ref(db, `${updatePath}/readyForPASI`);
          const snapshot = await get(verifyRef);
          
          if (snapshot.exists() && snapshot.val() === true) {
            console.log('Successfully verified readyForPASI = true in database');
          } else {
            console.error('Warning: readyForPASI may not have been saved correctly');
            throw new Error('Failed to verify readyForPASI save');
          }
          
          // Call the onUpdate callback for optimistic update
          if (onUpdate) {
            onUpdate(familyId, studentId, '', true); // Empty ASN, readyForPASI true
          }
        } catch (saveError) {
          console.error('Error saving readyForPASI:', saveError);
          alert('Failed to save "No ASN Yet" status. Please try again.');
          setIsSaving(false);
          return;
        }
        
        // Show success feedback
        setShowSuccess(prev => ({ ...prev, [`ready_${studentId}`]: true }));
        setJustSaved(prev => ({ ...prev, [studentId]: true }));
        
        // Move to next or close
        if (moveToNext) {
          const currentIndex = students.findIndex(s => s.id === studentId);
          const nextStudentWithoutASN = students.slice(currentIndex + 1).find(s => !s.asn && !readyForPASI[s.id]);
          
          if (nextStudentWithoutASN) {
            setTimeout(() => {
              setSelectedStudentId(nextStudentWithoutASN.id);
              setShowSuccess(prev => ({ ...prev, [`ready_${studentId}`]: false }));
              setJustSaved(prev => ({ ...prev, [studentId]: false }));
              // Focus on next student's input if not ready for PASI
              if (!readyForPASI[nextStudentWithoutASN.id]) {
                setTimeout(() => {
                  inputRefs.current[nextStudentWithoutASN.id]?.focus();
                  inputRefs.current[nextStudentWithoutASN.id]?.select();
                }, 100);
              }
            }, 500);
          } else {
            // No more students, close sheet after delay
            setTimeout(() => {
              onClose();
              setSelectedStudentId(null);
              setShowSuccess({});
              setJustSaved({});
            }, 500);
          }
        } else {
          // Just close the sheet
          setTimeout(() => {
            onClose();
            setSelectedStudentId(null);
            setShowSuccess({});
            setJustSaved({});
          }, 500);
        }
      } else {
        // Save ASN
        const digits = asnValue.replace(/\D/g, '');
        const updatePath = `homeEducationFamilies/familyInformation/${familyId}/students/${studentId}`;
        console.log('Saving ASN to path:', updatePath, 'ASN:', digits);
        
        // Update the student's ASN in the database and explicitly delete readyForPASI
        const updates = {
          asn: digits
        };
        
        // First update the ASN
        await update(ref(db, updatePath), updates);
        
        // Then explicitly remove readyForPASI field if it exists
        const readyForPASIRef = ref(db, `${updatePath}/readyForPASI`);
        const readySnapshot = await get(readyForPASIRef);
        if (readySnapshot.exists()) {
          await update(ref(db, updatePath), { readyForPASI: null });
          console.log('Removed existing readyForPASI field');
        }
        
        console.log('Successfully saved ASN:', digits);

        // Call the onUpdate callback immediately for optimistic update
        if (onUpdate) {
          onUpdate(familyId, studentId, digits, false); // Pass ASN and readyForPASI false
        }

        // Show success feedback
        setShowSuccess(prev => ({ ...prev, [studentId]: true }));
        setJustSaved(prev => ({ ...prev, [studentId]: true }));
        
        // Move to next student without ASN if requested
        if (moveToNext) {
          const currentIndex = students.findIndex(s => s.id === studentId);
          const nextStudentWithoutASN = students.slice(currentIndex + 1).find(s => !s.asn && !asnValues[s.id]);
          
          if (nextStudentWithoutASN) {
            setTimeout(() => {
              setSelectedStudentId(nextStudentWithoutASN.id);
              setShowSuccess(prev => ({ ...prev, [studentId]: false }));
              setJustSaved(prev => ({ ...prev, [studentId]: false }));
              // Focus on next student's input
              setTimeout(() => {
                inputRefs.current[nextStudentWithoutASN.id]?.focus();
                inputRefs.current[nextStudentWithoutASN.id]?.select();
              }, 100);
            }, 1000);
          } else {
            // No more students, show success for a moment then can close
            setTimeout(() => {
              setShowSuccess(prev => ({ ...prev, [studentId]: false }));
              setJustSaved(prev => ({ ...prev, [studentId]: false }));
            }, 2000);
          }
        } else {
          setTimeout(() => {
            setShowSuccess(prev => ({ ...prev, [studentId]: false }));
            setJustSaved(prev => ({ ...prev, [studentId]: false }));
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error updating ASN:', error);
      setIsValid(prev => ({ ...prev, [studentId]: false }));
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Enter key
  const handleKeyDown = (studentId, e) => {
    if (e.key === 'Enter') {
      handleSave(studentId);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Handle copy field to clipboard
  const handleCopyField = (field, value) => {
    if (value) {
      navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // Calculate progress
  const studentsWithASN = students.filter(s => 
    s.asn || 
    (asnValues[s.dbKey] && validateASN(asnValues[s.dbKey])) || 
    readyForPASI[s.dbKey]
  ).length;
  const totalStudents = students.length;

  if (!isOpen || !family) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[500px] sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>Edit Student ASNs - {family.familyName}</SheetTitle>
          <SheetDescription>
            Add or update Alberta Student Numbers for all students
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">ASN Progress</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: totalStudents }).map((_, i) => {
                  const student = students[i];
                  const hasASN = student && (student.asn || (asnValues[student.dbKey] && validateASN(asnValues[student.dbKey])) || readyForPASI[student.dbKey]);
                  return (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        hasASN ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                  );
                })}
              </div>
              <span className="text-sm text-gray-600">
                {studentsWithASN}/{totalStudents}
              </span>
            </div>
          </div>

          {/* Student tabs/list */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Select Student</label>
            <div className="grid gap-2">
              {students.map((student) => {
                const hasASN = student.asn || (asnValues[student.dbKey] && validateASN(asnValues[student.dbKey]));
                const isReadyForPASI = readyForPASI[student.dbKey];
                const isComplete = hasASN || isReadyForPASI;
                const isSelected = selectedStudentId === student.dbKey;
                const age = calculateAge(student.birthday);
                
                return (
                  <div
                    key={student.dbKey}
                    className={`p-3 rounded-lg border transition-colors ${
                      isSelected 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <button
                      onClick={() => {
                        setSelectedStudentId(student.dbKey);
                        setTimeout(() => {
                          inputRefs.current[student.dbKey]?.focus();
                          inputRefs.current[student.dbKey]?.select();
                        }, 100);
                      }}
                      className="w-full"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
                            hasASN ? 'bg-green-100' : isReadyForPASI ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            {hasASN ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : isReadyForPASI ? (
                              <ClipboardCheck className="w-4 h-4 text-blue-600" />
                            ) : (
                              <User className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className="text-left space-y-1">
                            <div className="flex items-center gap-1.5">
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-medium">{student.firstName}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyField(`firstName-${student.dbKey}`, student.firstName);
                                  }}
                                  className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                                  title="Copy first name"
                                >
                                  {copiedField === `firstName-${student.dbKey}` ? (
                                    <Check className="w-3 h-3 text-green-600" />
                                  ) : (
                                    <Copy className="w-3 h-3 text-gray-400" />
                                  )}
                                </button>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-medium">{student.lastName}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyField(`lastName-${student.dbKey}`, student.lastName);
                                  }}
                                  className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                                  title="Copy last name"
                                >
                                  {copiedField === `lastName-${student.dbKey}` ? (
                                    <Check className="w-3 h-3 text-green-600" />
                                  ) : (
                                    <Copy className="w-3 h-3 text-gray-400" />
                                  )}
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span>Grade {student.grade || 'N/A'}</span>
                              {age !== null && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Cake className="w-3 h-3" />
                                    {age}y
                                  </span>
                                </>
                              )}
                              {student.birthday && (
                                <>
                                  <span>•</span>
                                  <div className="flex items-center gap-1">
                                    <span className="font-mono">{student.birthday}</span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopyField(`birthday-${student.dbKey}`, student.birthday);
                                      }}
                                      className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                                      title="Copy birthday"
                                    >
                                      {copiedField === `birthday-${student.dbKey}` ? (
                                        <Check className="w-3 h-3 text-green-600" />
                                      ) : (
                                        <Copy className="w-3 h-3 text-gray-400" />
                                      )}
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        {(hasASN || isReadyForPASI) && (
                          <Badge variant="outline" className={`text-xs ${isReadyForPASI && !hasASN ? 'bg-blue-50 text-blue-700 border-blue-300' : ''}`}>
                            {student.asn ? formatASNDisplay(student.asn) : isReadyForPASI ? 'Ready for PASI' : 'Modified'}
                          </Badge>
                        )}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ASN input for selected student */}
          {selectedStudent && (
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <div>
                <h4 className="font-medium text-sm mb-1">
                  Edit ASN for {selectedStudent.firstName} {selectedStudent.lastName}
                </h4>
                <p className="text-xs text-gray-500">
                  Enter the 9-digit Alberta Student Number or mark as no ASN yet
                </p>
              </div>
              
              <div className="space-y-2">
                {/* Only show ASN input if NOT marked as ready for PASI */}
                {!readyForPASI[selectedStudent.dbKey] && (
                  <>
                    <div className="relative">
                      <Input
                        ref={el => inputRefs.current[selectedStudent.dbKey] = el}
                        type="text"
                        value={asnValues[selectedStudent.dbKey] || ''}
                        onChange={(e) => handleInputChange(selectedStudent.dbKey, e.target.value)}
                        onPaste={(e) => handlePaste(selectedStudent.dbKey, e)}
                        onKeyDown={(e) => handleKeyDown(selectedStudent.dbKey, e)}
                        placeholder="1234-5678-9"
                        className={`${
                          !isValid[selectedStudent.dbKey] && asnValues[selectedStudent.dbKey] 
                            ? 'border-red-500 focus:ring-red-500' 
                            : ''
                        } ${showSuccess[selectedStudent.dbKey] ? 'border-green-500' : ''}`}
                        disabled={isSaving}
                        maxLength={11} // 9 digits + 2 dashes
                      />
                      {showSuccess[selectedStudent.dbKey] && (
                        <Check className="absolute right-2 top-2.5 w-4 h-4 text-green-500" />
                      )}
                    </div>
                    
                    {!isValid[selectedStudent.dbKey] && asnValues[selectedStudent.dbKey] && (
                      <p className="text-xs text-red-500">
                        ASN must be exactly 9 digits
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-400">
                      Format: 1234-5678-9 or paste as 123456789
                    </p>

                    {justSaved[selectedStudent.dbKey] && (
                      <p className="text-xs text-green-600 font-medium animate-pulse">
                        ✓ Saved successfully!
                      </p>
                    )}
                  </>
                )}

                {/* No ASN Yet checkbox - show if no ASN or empty string ASN */}
                {(!selectedStudent.asn || selectedStudent.asn === '') && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <div className="flex items-center h-5">
                        <Checkbox
                          checked={readyForPASI[selectedStudent.dbKey] || false}
                          onCheckedChange={() => handleReadyForPASIToggle(selectedStudent.dbKey)}
                          disabled={isSaving}
                          className="border-blue-400"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-blue-900">
                            No ASN Yet
                          </span>
                          {showSuccess[`ready_${selectedStudent.dbKey}`] && (
                            <Check className="w-3 h-3 text-green-600" />
                          )}
                        </div>
                        <p className="text-xs text-blue-700 mt-1">
                          Check this if the student doesn't have an ASN yet but is ready to be registered in PASI. 
                          The registrar will create one.
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleSave(selectedStudent.dbKey, false)}
                  disabled={
                    ((!asnValues[selectedStudent.dbKey] && !readyForPASI[selectedStudent.dbKey]) || 
                     (!isValid[selectedStudent.dbKey] && asnValues[selectedStudent.dbKey])) || 
                    isSaving
                  }
                  className="px-4 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
                <button
                  onClick={() => handleSave(selectedStudent.dbKey, true)}
                  disabled={
                    ((!asnValues[selectedStudent.dbKey] && !readyForPASI[selectedStudent.dbKey]) || 
                     (!isValid[selectedStudent.dbKey] && asnValues[selectedStudent.dbKey])) || 
                    isSaving
                  }
                  className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save & Next'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Close button */}
          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ASN Edit Button Component - Trigger for opening the sheet
const ASNEditButton = ({ student, familyId, family, onOpenSheet }) => {
  return (
    <button
      onClick={() => onOpenSheet(family, student)}
      className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-50 border border-amber-300 rounded hover:bg-amber-100 transition-colors"
      title={`Click to add ASN for ${student.firstName} ${student.lastName}`}
    >
      <Edit className="w-3 h-3 text-amber-600" />
      <span className="text-xs text-amber-700 font-medium">Add ASN</span>
    </button>
  );
};

// Dashboard Sheet Component - Displays family dashboard in a resizable sheet
const DashboardSheet = ({ isOpen, onClose, family, familyId }) => {
  const [sheetSize, setSheetSize] = useState('preview');
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
      if (window.innerWidth < 640) {
        setSheetSize('full'); // Force full width on mobile
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSize = () => {
    setSheetSize(prev => prev === 'preview' ? 'full' : 'preview');
  };

  if (!family) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        size={sheetSize}
        className="flex flex-col p-0 gap-0"
      >
        <SheetHeader className="px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <SheetTitle className="text-xl font-semibold">
                {family.familyName || 'Family Dashboard'}
              </SheetTitle>
              <SheetDescription className="mt-1">
                Viewing family dashboard for {family.familyName}
              </SheetDescription>
            </div>
            {!isMobile && (
              <button
                onClick={toggleSize}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                title={sheetSize === 'preview' ? 'Expand to full width' : 'Collapse to preview'}
              >
                {sheetSize === 'preview' ? (
                  <>
                    <Maximize2 className="w-4 h-4" />
                    <span>Full Width</span>
                  </>
                ) : (
                  <>
                    <Minimize2 className="w-4 h-4" />
                    <span>Preview</span>
                  </>
                )}
              </button>
            )}
          </div>
        </SheetHeader>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6">

              {/* Dashboard Content */}
              <div className="border rounded-lg overflow-hidden bg-white">
                <RTDConnectDashboard 
                  staffView={true}
                  familyId={familyId}
                  familyData={family}
                />
              </div>
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Helper function to format ASN for display
const formatASNDisplay = (asn) => {
  if (!asn) return '';
  const digits = asn.replace(/\D/g, '');
  if (digits.length !== 9) return asn;
  return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 9)}`;
};

// Helper function to calculate age from birthday
const calculateAge = (birthday) => {
  if (!birthday) return null;
  
  // Parse the birthday string (YYYY-MM-DD format)
  const birthDate = new Date(birthday + 'T00:00:00'); // Add time to avoid timezone issues
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // Adjust if birthday hasn't occurred this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// StudentDetailsRow component - Extracted to fix hooks error
const StudentDetailsRow = memo(({ student, familyId, onASNUpdate, idx, allStudents = [], localASN, family, onOpenASNSheet }) => {
  const [copiedBirthday, setCopiedBirthday] = useState(false);
  const [copiedASN, setCopiedASN] = useState(false);
  const age = calculateAge(student.birthday);
  
  // Use local ASN if available, otherwise use student's ASN
  const displayASN = localASN || student.asn;
  const isReadyForPASI = student.readyForPASI === true;
  
  // Calculate remaining students needing ASN (excluding those marked ready for PASI)
  const studentsNeedingASN = allStudents.filter(s => !s.asn && !s.readyForPASI && s.id !== student.id);
  const remainingCount = studentsNeedingASN.length;
  
  const handleCopyBirthday = () => {
    if (student.birthday) {
      navigator.clipboard.writeText(student.birthday);
      setCopiedBirthday(true);
      setTimeout(() => setCopiedBirthday(false), 2000);
    }
  };
  
  const handleCopyASN = () => {
    if (displayASN) {
      const formattedASN = formatASNDisplay(displayASN);
      navigator.clipboard.writeText(formattedASN);
      setCopiedASN(true);
      setTimeout(() => setCopiedASN(false), 2000);
    }
  };
  
  return (
    <div key={idx} className="border rounded-lg p-2.5 bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="space-y-1.5">
        {/* Name and Grade Header - More Compact */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">
              {student.firstName} {student.lastName}
            </p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-gray-600">
                Grade: <span className="font-medium">{student.grade || 'N/A'}</span>
              </span>
              {age !== null && (
                <span className="text-xs text-gray-600 flex items-center gap-1">
                  <Cake className="w-3 h-3" />
                  <span className="font-medium">{age}y</span>
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Birthday with Copy */}
        {student.birthday && (
          <div className="flex items-center gap-2 bg-white rounded px-2 py-1.5 border border-gray-200">
            <span className="text-xs text-gray-600">Birthday:</span>
            <span className="text-xs font-mono font-medium text-gray-900">
              {student.birthday}
            </span>
            <button
              onClick={handleCopyBirthday}
              className="ml-auto p-1 hover:bg-gray-100 rounded transition-colors"
              title="Copy birthday to clipboard"
            >
              {copiedBirthday ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-gray-500 hover:text-gray-700" />
              )}
            </button>
          </div>
        )}
        
        {/* Email if exists */}
        {student.email && (
          <p className="text-xs text-gray-500">Email: {student.email}</p>
        )}
        
        {/* ASN or Ready for PASI or Add ASN Button - Compact */}
        {displayASN ? (
          <div className="flex items-center gap-1.5 bg-green-50 rounded px-2 py-1 border border-green-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
            <span className="text-xs text-gray-600">ASN:</span>
            <span className="text-xs font-mono font-medium text-green-900">
              {formatASNDisplay(displayASN)}
            </span>
            <button
              onClick={handleCopyASN}
              className="ml-auto p-0.5 hover:bg-green-100 rounded transition-colors"
              title="Copy ASN to clipboard"
            >
              {copiedASN ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3 text-green-600 hover:text-green-700" />
              )}
            </button>
          </div>
        ) : isReadyForPASI ? (
          <div className="flex items-center gap-1.5 bg-blue-50 rounded px-2 py-1 border border-blue-200">
            <ClipboardCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <span className="text-xs text-gray-600">Status:</span>
            <span className="text-xs font-medium text-blue-900">Ready for PASI</span>
            <span className="text-xs text-blue-700">(ASN pending)</span>
            <button
              onClick={() => onOpenASNSheet(family, student)}
              className="ml-auto p-0.5 hover:bg-blue-100 rounded transition-colors"
              title="Edit status"
            >
              <Edit className="w-3 h-3 text-blue-600 hover:text-blue-700" />
            </button>
          </div>
        ) : (
          <div className="mt-1 pt-1 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-xs text-amber-600">
                ⚠️ ASN needed
                {remainingCount > 0 && (
                  <span className="ml-1 text-gray-600">
                    (+{remainingCount} more)
                  </span>
                )}
              </p>
              <ASNEditButton 
                student={student} 
                familyId={familyId}
                family={family}
                onOpenSheet={onOpenASNSheet}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

StudentDetailsRow.displayName = 'StudentDetailsRow';

// Helper component for student detail row
const StudentDetailRow = memo(({ student, familyId, schoolYear }) => {
  const [formData, setFormData] = useState({
    notificationForm: null,
    educationPlan: null,
    citizenshipDocs: null,
    loading: true
  });
  const [showDocumentReview, setShowDocumentReview] = useState(false);
  const [familyData, setFamilyData] = useState(null);

  // Format school year for database queries
  const dbSchoolYear = schoolYear.replace('/', '_');

  useEffect(() => {
    const fetchStudentFormData = async () => {
      try {
        const db = getDatabase();

        // Fetch notification form status
        const notificationRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/NOTIFICATION_FORMS/${dbSchoolYear}/${student.id}`);
        const notificationSnapshot = await get(notificationRef);

        // Fetch education plan data
        const educationRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/SOLO_EDUCATION_PLANS/${dbSchoolYear}/${student.id}`);
        const educationSnapshot = await get(educationRef);

        // Fetch citizenship documents status
        const citizenshipRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/STUDENT_CITIZENSHIP_DOCS/${student.id}`);
        const citizenshipSnapshot = await get(citizenshipRef);

        // Fetch full family data for StaffDocumentReview
        const familyRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}`);
        const familySnapshot = await get(familyRef);

        setFormData({
          notificationForm: notificationSnapshot.val(),
          educationPlan: educationSnapshot.val(),
          citizenshipDocs: citizenshipSnapshot.val(),
          loading: false
        });

        setFamilyData(familySnapshot.val());
      } catch (error) {
        console.error('Error fetching student form data:', error);
        setFormData(prev => ({ ...prev, loading: false }));
      }
    };

    if (student.id && familyId && schoolYear) {
      fetchStudentFormData();
    }
  }, [student.id, familyId, dbSchoolYear, schoolYear]);

  const age = calculateAge(student.birthday);
  const hasASN = student.asn && student.asn.trim() !== '';
  const isReadyForPASI = student.readyForPASI === true;

  // Get form statuses
  const notificationStatus = formData.notificationForm?.submissionStatus || 'not_started';
  const educationPlanStatus = formData.educationPlan?.submissionStatus || 'not_started';

  // Get citizenship docs status
  const getCitizenshipDocsStatus = () => {
    const docs = formData.citizenshipDocs;
    if (!docs) return { status: 'not_started', label: 'Not Started', color: 'red' };

    if (docs.staffApproval?.isApproved === true) {
      return { status: 'approved', label: 'Approved', color: 'green' };
    }
    if (docs.staffApproval?.isApproved === false) {
      return { status: 'rejected', label: 'Rejected', color: 'red' };
    }
    if (docs.documents && docs.documents.length > 0) {
      if (docs.requiresStaffReview || docs.staffReviewRequired) {
        return { status: 'pending_review', label: 'Pending Review', color: 'yellow' };
      }
      return { status: 'uploaded', label: 'Uploaded', color: 'blue' };
    }
    return { status: 'not_started', label: 'No Documents', color: 'gray' };
  };

  const citizenshipStatus = getCitizenshipDocsStatus();

  // Map Alberta course IDs to names
  const getCourseName = (courseId) => {
    const course = getAlbertaCourseById(courseId);
    return course ? `${course.name} (${course.credits} cr)` : courseId;
  };

  // Process selected Alberta courses
  const albertaCourses = formData.educationPlan?.selectedAlbertaCourses || {};
  const otherCourses = formData.educationPlan?.otherCourses || [];
  const followsAlbertaPrograms = formData.educationPlan?.followAlbertaPrograms;

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 mb-3 hover:bg-blue-100 transition-colors">
      <div className="grid grid-cols-12 gap-4">
        {/* Student Basic Info - 3 cols */}
        <div className="col-span-12 md:col-span-3">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-sm text-gray-900">
                  {student.firstName} {student.lastName}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Grade {student.grade || 'N/A'} • {age !== null ? `${age} years old` : 'Age N/A'}
                </p>
                {student.birthday && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    DOB: {student.birthday}
                  </p>
                )}
              </div>
            </div>
            
            {/* ASN Status */}
            <div className="mt-2">
              {hasASN ? (
                <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  ASN: {formatASNDisplay(student.asn)}
                </Badge>
              ) : isReadyForPASI ? (
                <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                  <ClipboardCheck className="w-3 h-3 mr-1" />
                  Ready for PASI
                </Badge>
              ) : (
                <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  No ASN
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Form Statuses - 3 cols */}
        <div className="col-span-12 md:col-span-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-700 mb-1">Form Status</p>
            
            {/* Notification Form Status */}
            <div className="flex items-center gap-2 bg-white rounded px-2 py-1.5">
              {notificationStatus === 'submitted' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              ) : notificationStatus === 'in_progress' ? (
                <Clock className="w-3.5 h-3.5 text-yellow-600" />
              ) : (
                <X className="w-3.5 h-3.5 text-red-600" />
              )}
              <span className="text-xs">
                Notification: {' '}
                <span className={`font-medium ${
                  notificationStatus === 'submitted' ? 'text-green-700' :
                  notificationStatus === 'in_progress' ? 'text-yellow-700' :
                  'text-red-700'
                }`}>
                  {notificationStatus === 'submitted' ? 'Submitted' :
                   notificationStatus === 'in_progress' ? 'In Progress' :
                   'Not Started'}
                </span>
              </span>
            </div>
            
            {/* Education Plan Status */}
            <div className="flex items-center gap-2 bg-white rounded px-2 py-1.5">
              {educationPlanStatus === 'submitted' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              ) : educationPlanStatus === 'in_progress' ? (
                <Clock className="w-3.5 h-3.5 text-yellow-600" />
              ) : (
                <X className="w-3.5 h-3.5 text-red-600" />
              )}
              <span className="text-xs">
                Education Plan: {' '}
                <span className={`font-medium ${
                  educationPlanStatus === 'submitted' ? 'text-green-700' :
                  educationPlanStatus === 'in_progress' ? 'text-yellow-700' :
                  'text-red-700'
                }`}>
                  {educationPlanStatus === 'submitted' ? 'Submitted' :
                   educationPlanStatus === 'in_progress' ? 'In Progress' :
                   'Not Started'}
                </span>
              </span>
            </div>

            {/* Citizenship Documents Status - Clickable */}
            <button
              onClick={() => setShowDocumentReview(true)}
              className="flex items-center gap-2 bg-white rounded px-2 py-1.5 hover:bg-gray-50 transition-colors w-full text-left"
              title="Click to review citizenship documents"
            >
              {citizenshipStatus.status === 'approved' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              ) : citizenshipStatus.status === 'rejected' ? (
                <X className="w-3.5 h-3.5 text-red-600" />
              ) : citizenshipStatus.status === 'pending_review' ? (
                <Clock className="w-3.5 h-3.5 text-yellow-600" />
              ) : citizenshipStatus.status === 'uploaded' ? (
                <FileText className="w-3.5 h-3.5 text-blue-600" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-gray-600" />
              )}
              <span className="text-xs">
                Citizenship Docs: {' '}
                <span className={`font-medium ${
                  citizenshipStatus.color === 'green' ? 'text-green-700' :
                  citizenshipStatus.color === 'red' ? 'text-red-700' :
                  citizenshipStatus.color === 'yellow' ? 'text-yellow-700' :
                  citizenshipStatus.color === 'blue' ? 'text-blue-700' :
                  'text-gray-700'
                }`}>
                  {citizenshipStatus.label}
                </span>
              </span>
              <ExternalLink className="w-3 h-3 ml-auto text-gray-400" />
            </button>
          </div>
        </div>

        {/* Courses - 6 cols */}
        <div className="col-span-12 md:col-span-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs font-semibold text-gray-700">Courses</p>
              {followsAlbertaPrograms && (
                <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs">
                  <BookOpenCheck className="w-3 h-3 mr-1" />
                  Following Alberta Programs
                </Badge>
              )}
            </div>
            
            {formData.loading ? (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading course information...
              </div>
            ) : (
              <div className="space-y-2">
                {/* Alberta Courses */}
                {Object.keys(albertaCourses).length > 0 && (
                  <div className="bg-white rounded-lg p-2 space-y-1">
                    <p className="text-xs font-medium text-gray-700 mb-1">Alberta Courses:</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(albertaCourses).map(([category, courseIds]) => (
                        <div key={category} className="w-full">
                          {Array.isArray(courseIds) && courseIds.map(courseId => (
                            <Badge 
                              key={courseId}
                              variant="outline" 
                              className="text-xs mr-1 mb-1 bg-purple-50 text-purple-700 border-purple-300"
                            >
                              {getCourseName(courseId)}
                            </Badge>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Other Courses */}
                {otherCourses.length > 0 && (
                  <div className="bg-white rounded-lg p-2 space-y-1">
                    <p className="text-xs font-medium text-gray-700 mb-1">Other Courses:</p>
                    <div className="flex flex-wrap gap-1">
                      {otherCourses.map((course, idx) => (
                        <Badge 
                          key={idx}
                          variant="outline" 
                          className="text-xs bg-gray-50 text-gray-700 border-gray-300"
                        >
                          {course.courseName} ({course.credits} cr)
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* No courses message */}
                {Object.keys(albertaCourses).length === 0 && otherCourses.length === 0 && !formData.loading && (
                  <p className="text-xs text-gray-500 italic">No courses registered yet</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Staff Document Review Modal */}
      {showDocumentReview && (
        <StaffDocumentReview
          isOpen={showDocumentReview}
          onOpenChange={setShowDocumentReview}
          familyId={familyId}
          familyData={familyData}
          initialStudentId={student.id}
        />
      )}
    </div>
  );
});

StudentDetailRow.displayName = 'StudentDetailRow';

// Expanded Row Content Component
const ExpandedRowContent = memo(({ row, categories, categoryTypes, onCategoryAdd, onCategoryRemove }) => {
  const students = row.rawFamily?.students ? Object.values(row.rawFamily.students) : [];
  const familyCategories = row.categories || [];
  const schoolYear = getCurrentSchoolYear();
  
  return (
    <React.Fragment>
      <td colSpan="9" className="px-3 py-0 bg-gray-50">
        <div className="py-4 px-6">
          {/* Categories Section */}
          {familyCategories.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-700 mb-2">All Categories</h4>
              <div className="flex flex-wrap gap-1">
                {familyCategories.map((category) => (
                  <Badge
                    key={`expanded-${category.facilitatorKey}-${category.id}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-xs"
                    style={{
                      backgroundColor: `${category.color}20`,
                      color: category.color,
                      borderColor: category.color
                    }}
                    variant="outline"
                  >
                    {category.icon && iconMap[category.icon] && 
                      React.createElement(iconMap[category.icon], { 
                        style: { color: category.color }, 
                        className: 'w-3 h-3' 
                      })
                    }
                    <span>{category.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCategoryRemove(row.familyId, category.id, category.facilitatorKey);
                      }}
                      className="ml-1 hover:opacity-70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Enhanced Students Section with Detailed Rows */}
          {students.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-800">
                  Student Details ({students.length})
                </h4>
                <Badge className="bg-gray-100 text-gray-700 text-xs">
                  School Year: {schoolYear}
                </Badge>
              </div>
              
              {/* Detailed student rows */}
              <div className="space-y-2 border-t border-gray-200 pt-3">
                {students.map((student, idx) => (
                  <StudentDetailRow 
                    key={student.id || idx} 
                    student={student} 
                    familyId={row.familyId}
                    schoolYear={schoolYear}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Primary Guardian</h4>
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <p className="text-sm font-medium">{row.primaryGuardian}</p>
                <p className="text-xs text-gray-500 mt-1">{row.guardianEmail}</p>
                {row.rawFamily?.guardianPhone && (
                  <p className="text-xs text-gray-500">{row.rawFamily.guardianPhone}</p>
                )}
              </div>
            </div>
            
            {row.rawFamily?.secondaryGuardian && (
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Secondary Guardian</h4>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium">{row.rawFamily.secondaryGuardian}</p>
                  {row.rawFamily?.secondaryEmail && (
                    <p className="text-xs text-gray-500 mt-1">{row.rawFamily.secondaryEmail}</p>
                  )}
                  {row.rawFamily?.secondaryPhone && (
                    <p className="text-xs text-gray-500">{row.rawFamily.secondaryPhone}</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Additional Information */}
          {row.rawFamily?.address && (
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Address</h4>
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <p className="text-sm">{row.rawFamily.address}</p>
              </div>
            </div>
          )}
        </div>
      </td>
    </React.Fragment>
  );
});

ExpandedRowContent.displayName = 'ExpandedRowContent';

// Memoized table row component for better performance
const FamilyTableRow = memo(({ 
  row, 
  isSelected,
  isExpanded,
  onToggleExpand,
  comprehensiveStatus,
  onSelectFamily, 
  onViewDashboard, 
  onOpenNotes, 
  onToggleAssistance,
  onDocumentReview,
  onEmailFamily,
  onASNUpdate,
  onOpenASNSheet,
  loadingStatuses,
  togglingAssistance,
  isAdmin,
  effectiveEmail,
  categories,
  categoryTypes,
  onCategoryAdd,
  onCategoryRemove
}) => {
  // Get student details
  const students = row.rawFamily?.students ? Object.values(row.rawFamily.students) : [];
  
  const familyBgColor = stringToColor(row.familyName);
  const initials = row.familyName ? row.familyName.substring(0, 2).toUpperCase() : 'FF';
  
  // State for category dropdown
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  
  // Get family categories
  const familyCategories = row.categories || [];
  
  // Limit categories shown in collapsed state
  const maxCollapsedCategories = 2;
  const visibleCategories = isExpanded ? familyCategories : familyCategories.slice(0, maxCollapsedCategories);
  const hiddenCategoriesCount = familyCategories.length - maxCollapsedCategories;
  
  return (
    <React.Fragment>
      <td className="px-3 py-3 whitespace-nowrap">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelectFamily(row.familyId)}
          aria-label={`Select ${row.familyName}`}
        />
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleExpand(row.familyId)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: familyBgColor }}
                  >
                    {initials}
                  </div>
                  {row.isMyFamily && (
                    <Badge variant="outline" className="text-xs px-1 py-0 text-purple-600 border-purple-300">
                      Mine
                    </Badge>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-semibold">{row.familyName}</p>
                {row.isMyFamily && <p className="text-xs text-purple-600">My Family</p>}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium">{row.primaryGuardian}</div>
          <div className="text-xs text-gray-500">{row.guardianEmail}</div>
        </div>
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        <div>
          <div className="flex items-center space-x-1 text-sm">
            <button 
              onClick={() => onOpenASNSheet(row.rawFamily, null)}
              className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-gray-100 transition-colors group"
              title="Click to manage student ASNs"
            >
              <GraduationCap className="w-4 h-4 text-blue-500" />
              <span className="font-medium">{row.studentCount}</span>
              {row.hasMissingASN && (
                <div className="flex items-center">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs text-amber-600 font-medium ml-0.5">
                    {row.missingASNCount}
                  </span>
                </div>
              )}
              {row.hasNoASNYet && (
                <div className="flex items-center">
                  <ClipboardCheck className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs text-blue-600 font-medium ml-0.5">
                    {row.noASNYetCount}
                  </span>
                </div>
              )}
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{row.gradeRange}</div>
        </div>
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        <FacilitatorSelector
          family={row.rawFamily}
          familyId={row.familyId}
          isAdmin={isAdmin}
          currentUserEmail={effectiveEmail}
          isMyFamily={row.isMyFamily}
        />
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        <RegistrationStatusBadge registrationStatus={row.registrationStatus} />
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        <div className="flex flex-wrap gap-1">
          {visibleCategories.map((category) => (
            <Badge
              key={`${category.facilitatorKey}-${category.id}`}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs"
              style={{
                backgroundColor: `${category.color}20`,
                color: category.color,
                borderColor: category.color
              }}
              variant="outline"
              title={category.name} // Show full name on hover
            >
              {category.icon && iconMap[category.icon] && 
                React.createElement(iconMap[category.icon], { 
                  style: { color: category.color }, 
                  className: 'w-3 h-3 flex-shrink-0' 
                })
              }
              <span className="truncate max-w-[3rem]">
                {category.name.length > 5 ? `${category.name.substring(0, 5)}...` : category.name}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCategoryRemove(row.familyId, category.id, category.facilitatorKey);
                }}
                className="ml-0.5 hover:opacity-70 flex-shrink-0"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </Badge>
          ))}
          {!isExpanded && hiddenCategoriesCount > 0 && (
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              +{hiddenCategoriesCount} more
            </Badge>
          )}
          <DropdownMenu open={categoryDropdownOpen} onOpenChange={setCategoryDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs border border-dashed border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {/* By Facilitator option */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Users className="h-4 w-4 mr-2" />
                  By Facilitator
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
                    {categories && Object.entries(categories).map(([facilitatorKey, facilitatorCategories]) => {
                      // Filter out already added categories
                      const availableCategories = Object.entries(facilitatorCategories || {})
                        .filter(([categoryId, category]) => {
                          const isAdded = familyCategories.some(fc => 
                            fc.id === categoryId && fc.facilitatorKey === facilitatorKey
                          );
                          return !category.archived && !isAdded;
                        })
                        .map(([categoryId, category]) => ({
                          id: categoryId,
                          ...category
                        }));

                      if (availableCategories.length === 0) return null;

                      return (
                        <DropdownMenuSub key={facilitatorKey}>
                          <DropdownMenuSubTrigger className="w-full">
                            <div className="truncate">
                              {facilitatorKey.replace(',', '.')}
                            </div>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                              {availableCategories.map(category => (
                                <DropdownMenuItem
                                  key={category.id}
                                  onSelect={() => {
                                    onCategoryAdd(row.familyId, category.id, facilitatorKey);
                                    setCategoryDropdownOpen(false);
                                  }}
                                  className="hover:bg-gray-50"
                                >
                                  <div className="flex items-center">
                                    {category.icon && iconMap[category.icon] && 
                                      React.createElement(iconMap[category.icon], { 
                                        style: { color: category.color }, 
                                        className: 'w-4 h-4 mr-2' 
                                      })
                                    }
                                    <span>{category.name}</span>
                                  </div>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                      );
                    })}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              {/* By Type option */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Grid2X2 className="h-4 w-4 mr-2" />
                  By Type
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
                    {categoryTypes && categoryTypes.map((type) => {
                      // Get all categories of this type across all facilitators
                      const categoriesOfType = [];
                      if (categories) {
                        Object.entries(categories).forEach(([facilitatorKey, facilitatorCategories]) => {
                          Object.entries(facilitatorCategories || {}).forEach(([categoryId, category]) => {
                            if (category.type === type.id && !category.archived) {
                              const isAdded = familyCategories.some(fc => 
                                fc.id === categoryId && fc.facilitatorKey === facilitatorKey
                              );
                              if (!isAdded) {
                                categoriesOfType.push({
                                  ...category,
                                  id: categoryId,
                                  facilitatorKey
                                });
                              }
                            }
                          });
                        });
                      }

                      if (categoriesOfType.length === 0) return null;

                      return (
                        <DropdownMenuSub key={type.id}>
                          <DropdownMenuSubTrigger className="w-full">
                            <div className="flex items-center">
                              {type.icon && iconMap[type.icon] && 
                                React.createElement(iconMap[type.icon], { 
                                  className: "h-4 w-4 mr-2 flex-shrink-0",
                                  style: { color: type.color }
                                })
                              }
                              <span className="truncate">{type.name}</span>
                            </div>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                              {categoriesOfType.map(category => (
                                <DropdownMenuItem
                                  key={`${category.facilitatorKey}-${category.id}`}
                                  onSelect={() => {
                                    onCategoryAdd(row.familyId, category.id, category.facilitatorKey);
                                    setCategoryDropdownOpen(false);
                                  }}
                                  className="hover:bg-gray-50"
                                >
                                  <div className="flex items-center">
                                    {category.icon && iconMap[category.icon] && 
                                      React.createElement(iconMap[category.icon], { 
                                        style: { color: category.color }, 
                                        className: 'w-4 h-4 mr-2' 
                                      })
                                    }
                                    <span className="truncate">{category.name}</span>
                                    <span className="ml-2 text-xs text-gray-500 flex-shrink-0">
                                      ({category.facilitatorKey.replace(',', '.')})
                                    </span>
                                  </div>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                      );
                    })}

                    {/* Uncategorized section */}
                    {(() => {
                      const uncategorizedItems = [];
                      if (categories) {
                        Object.entries(categories).forEach(([facilitatorKey, facilitatorCategories]) => {
                          Object.entries(facilitatorCategories || {}).forEach(([categoryId, category]) => {
                            if (!category.type && !category.archived) {
                              const isAdded = familyCategories.some(fc => 
                                fc.id === categoryId && fc.facilitatorKey === facilitatorKey
                              );
                              if (!isAdded) {
                                uncategorizedItems.push({
                                  ...category,
                                  id: categoryId,
                                  facilitatorKey
                                });
                              }
                            }
                          });
                        });
                      }

                      if (uncategorizedItems.length === 0) return null;

                      return (
                        <DropdownMenuSub key="uncategorized">
                          <DropdownMenuSubTrigger>
                            <Circle className="h-4 w-4 mr-2" />
                            Uncategorized
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                              {uncategorizedItems.map(category => (
                                <DropdownMenuItem
                                  key={`${category.facilitatorKey}-${category.id}`}
                                  onSelect={() => {
                                    onCategoryAdd(row.familyId, category.id, category.facilitatorKey);
                                    setCategoryDropdownOpen(false);
                                  }}
                                  className="hover:bg-gray-50"
                                >
                                  <div className="flex items-center">
                                    {category.icon && iconMap[category.icon] && 
                                      React.createElement(iconMap[category.icon], { 
                                        style: { color: category.color }, 
                                        className: 'w-4 h-4 mr-2' 
                                      })
                                    }
                                    <span className="truncate">{category.name}</span>
                                    <span className="ml-2 text-xs text-gray-500 flex-shrink-0">
                                      ({category.facilitatorKey.replace(',', '.')})
                                    </span>
                                  </div>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                      );
                    })()}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        {loadingStatuses ? (
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        ) : togglingAssistance[row.familyId] ? (
          <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
        ) : (
          <ComprehensiveStatusBadge 
            statuses={comprehensiveStatus} 
            assistanceRequired={comprehensiveStatus.assistanceRequired}
            familyId={row.familyId}
            onToggleAssistance={onToggleAssistance}
            onDocumentReview={onDocumentReview}
          />
        )}
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs text-gray-500 cursor-help">
                {formatRelativeTime(row.lastUpdated)}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{row.lastUpdated ? new Date(row.lastUpdated).toLocaleString() : 'Never updated'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </td>
      <td className="px-3 py-3 whitespace-nowrap text-right">
        <div className="flex justify-end space-x-1">
          <button
            onClick={() => onViewDashboard(row.familyId, row.rawFamily)}
            className="p-1 text-purple-600 hover:bg-purple-50 rounded"
            title="View Dashboard"
          >
            <PanelRightOpen className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEmailFamily(row.familyId)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Email Family"
          >
            <Mail className="w-4 h-4" />
          </button>
          <FamilyNotesIcon
            familyId={row.familyId}
            onClick={() => onOpenNotes(row.familyId, row.rawFamily)}
          />
        </div>
      </td>
    </React.Fragment>
  );
});

FamilyTableRow.displayName = 'FamilyTableRow';

// Family Table Component
const FamilyTable = ({ families, onViewDashboard, onManageFamily, onDocumentReview, currentUserEmail, impersonatedEmail, isAdmin, onOpenEmailSheet, facilitatorCategories, categoryTypes }) => {
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [familyStatuses, setFamilyStatuses] = useState({});
  const [loadingStatuses, setLoadingStatuses] = useState(true);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [selectedNotesFamily, setSelectedNotesFamily] = useState(null);
  const [selectedNotesFamilyId, setSelectedNotesFamilyId] = useState(null);
  const [togglingAssistance, setTogglingAssistance] = useState({});
  
  // Local state for tracking ASN updates optimistically
  const [localASNUpdates, setLocalASNUpdates] = useState({});
  const [localReadyForPASIUpdates, setLocalReadyForPASIUpdates] = useState({});
  
  // ASN Edit Sheet state
  const [asnSheetOpen, setAsnSheetOpen] = useState(false);
  const [asnSheetFamilyId, setAsnSheetFamilyId] = useState(null);
  const [asnSheetStudent, setAsnSheetStudent] = useState(null);
  
  // Bulk selection state
  const [selectedFamilies, setSelectedFamilies] = useState(new Set());
  
  // Row expansion state
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [expandAll, setExpandAll] = useState(false);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [showBulkConfirmDialog, setShowBulkConfirmDialog] = useState(false);
  const [pendingBulkAction, setPendingBulkAction] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('active');

  // Use the current school year from calendarConfig (updated once per year)
  const activeSchoolYear = getCurrentSchoolYear();
  const dbSchoolYear = activeSchoolYear.replace('/', '_'); // Convert 25/26 to 25_26

  const effectiveEmail = impersonatedEmail || currentUserEmail;


  // State to track visible families for lazy loading
  const [visibleFamilies, setVisibleFamilies] = useState(new Set());
  const [debouncedVisibleFamilies, setDebouncedVisibleFamilies] = useState(new Set());

  // Track the last fetched school year to detect changes
  const [lastFetchedSchoolYear, setLastFetchedSchoolYear] = useState(null);
  
  // Debounce visible families to reduce re-renders
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedVisibleFamilies(visibleFamilies);
    }, 200); // 200ms debounce
    
    return () => clearTimeout(timer);
  }, [visibleFamilies]);
  
  // Fetch comprehensive status data for visible families only (lazy loading)
  useEffect(() => {
    const fetchFamilyStatuses = async () => {
      if (debouncedVisibleFamilies.size === 0) {
        setLoadingStatuses(false);
        return;
      }

      setLoadingStatuses(true);
      const db = getDatabase();

      // Clear cache if school year has changed
      let statuses;
      let familiesToFetch;

      if (lastFetchedSchoolYear !== dbSchoolYear) {
        // School year changed - clear all cached statuses and refetch all visible families
        setFamilyStatuses({});
        setLastFetchedSchoolYear(dbSchoolYear);
        statuses = {};
        familiesToFetch = Array.from(debouncedVisibleFamilies).filter(
          familyId => families[familyId]
        );
      } else {
        // Same school year - keep existing statuses and only fetch new ones
        statuses = { ...familyStatuses };
        familiesToFetch = Array.from(debouncedVisibleFamilies).filter(
          familyId => !familyStatuses[familyId] && families[familyId]
        );
      }
      
      for (const familyId of familiesToFetch) {
        const family = families[familyId];
        if (!family) continue;
        const students = family.students ? Object.values(family.students) : [];
        
        // Initialize status object
        statuses[familyId] = {
          notificationForm: 'pending',
          programPlan: 'pending',
          citizenshipDocs: 'pending',
          paymentSetup: 'not_started',
          assistanceRequired: false
        };

        // Check Notification Forms for all students
        let allFormsSubmitted = true;
        let anyFormStarted = false;
        let anyAssistanceRequired = false;
        
        for (const student of students) {
          try {
            const formRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/NOTIFICATION_FORMS/${dbSchoolYear}/${student.id}`);
            const formSnapshot = await get(formRef);
            
            if (formSnapshot.exists()) {
              const formData = formSnapshot.val();
              if (formData.submissionStatus === 'submitted') {
                anyFormStarted = true;
              } else {
                allFormsSubmitted = false;
                anyFormStarted = true;
              }
              
              // Check if assistance is required
              if (formData.PART_A?.editableFields?.assistanceRequired === true) {
                anyAssistanceRequired = true;
              }
            } else {
              allFormsSubmitted = false;
            }
          } catch (error) {
            console.error(`Error fetching notification form for student ${student.id}:`, error);
            allFormsSubmitted = false;
          }
        }
        
        // Set assistance required status
        if (anyAssistanceRequired) {
          statuses[familyId].assistanceRequired = true;
        }
        
        if (students.length > 0) {
          if (allFormsSubmitted) {
            statuses[familyId].notificationForm = 'submitted';
          } else if (anyFormStarted) {
            statuses[familyId].notificationForm = 'partial';
          }
        }

        // Check Program Plans (SOLO) for all students
        let allPlansSubmitted = true;
        let anyPlanStarted = false;
        
        for (const student of students) {
          try {
            const planRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/SOLO_EDUCATION_PLANS/${dbSchoolYear}/${student.id}`);
            const planSnapshot = await get(planRef);
            
            if (planSnapshot.exists()) {
              const planData = planSnapshot.val();
              if (planData.submissionStatus === 'submitted') {
                anyPlanStarted = true;
              } else {
                allPlansSubmitted = false;
                anyPlanStarted = true;
              }
            } else {
              allPlansSubmitted = false;
            }
          } catch (error) {
            console.error(`Error fetching program plan for student ${student.id}:`, error);
            allPlansSubmitted = false;
          }
        }
        
        if (students.length > 0) {
          if (allPlansSubmitted) {
            statuses[familyId].programPlan = 'submitted';
          } else if (anyPlanStarted) {
            statuses[familyId].programPlan = 'in_progress';
          }
        }

        // Check Citizenship Docs for all students
        let allDocsCompleted = true;
        let anyDocsStarted = false;
        let anyPendingReview = false;
        
        for (const student of students) {
          try {
            const docsRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/STUDENT_CITIZENSHIP_DOCS/${student.id}`);
            const docsSnapshot = await get(docsRef);
            
            if (docsSnapshot.exists()) {
              const docsData = docsSnapshot.val();
              anyDocsStarted = true;
              
              // Check if already approved by staff
              const isStaffApproved = docsData.staffApproval?.isApproved === true;
              
              if (isStaffApproved) {
                // Already approved by staff - counts as complete
              } else if (docsData.completionStatus === 'completed' && !docsData.requiresStaffReview && !docsData.staffReviewRequired) {
                // Document is complete and doesn't need review
              } else if ((docsData.requiresStaffReview || docsData.staffReviewRequired) && !isStaffApproved) {
                // Needs staff review and hasn't been approved yet
                anyPendingReview = true;
                allDocsCompleted = false;
              } else {
                allDocsCompleted = false;
              }
            } else {
              allDocsCompleted = false;
            }
          } catch (error) {
            console.error(`Error fetching citizenship docs for student ${student.id}:`, error);
            allDocsCompleted = false;
          }
        }
        
        if (students.length > 0) {
          if (allDocsCompleted && !anyPendingReview) {
            statuses[familyId].citizenshipDocs = 'completed';
          } else if (anyPendingReview) {
            statuses[familyId].citizenshipDocs = 'pending_review';
          } else if (anyDocsStarted) {
            statuses[familyId].citizenshipDocs = 'in_progress';
          }
        }

        // Check Stripe Connect (Payment Setup)
        try {
          const stripeRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/STRIPE_CONNECT`);
          const stripeSnapshot = await get(stripeRef);
          
          if (stripeSnapshot.exists()) {
            const stripeData = stripeSnapshot.val();
            if (stripeData.status === 'active' || stripeData.status === 'complete') {
              statuses[familyId].paymentSetup = 'active';
            } else if (stripeData.status === 'pending') {
              statuses[familyId].paymentSetup = 'pending_setup';
            }
          }
        } catch (error) {
          console.error(`Error fetching Stripe status for family ${familyId}:`, error);
        }
      }

      setFamilyStatuses(statuses);
      setLoadingStatuses(false);
    };

    if (Object.keys(families).length > 0 && debouncedVisibleFamilies.size > 0) {
      fetchFamilyStatuses();
    } else {
      setLoadingStatuses(false);
    }
  }, [families, dbSchoolYear, debouncedVisibleFamilies, familyStatuses, lastFetchedSchoolYear]);

  // Process families data for table display with local ASN updates
  const familyRows = useMemo(() => {
    return Object.entries(families).map(([familyId, family]) => {
      // Apply local ASN and readyForPASI updates to students
      const studentsObj = family.students ? { ...family.students } : {};
      Object.keys(studentsObj).forEach(studentId => {
        const localUpdateKey = `${familyId}_${studentId}`;
        if (localASNUpdates[localUpdateKey]) {
          studentsObj[studentId] = {
            ...studentsObj[studentId],
            asn: localASNUpdates[localUpdateKey]
          };
        }
        if (localReadyForPASIUpdates[localUpdateKey] !== undefined) {
          studentsObj[studentId] = {
            ...studentsObj[studentId],
            readyForPASI: localReadyForPASIUpdates[localUpdateKey]
          };
        }
      });
      
      const students = Object.values(studentsObj);
      const guardians = family.guardians ? Object.values(family.guardians) : [];
      const primaryGuardian = guardians.find(g => g.guardianType === 'primary_guardian') || guardians[0];
      
      // Get grade range
      const grades = students.map(s => s.grade).filter(Boolean);
      const gradeRange = grades.length > 0 ? 
        (grades.length === 1 ? `Grade ${grades[0]}` : `Grades ${Math.min(...grades)}-${Math.max(...grades)}`) : 
        'No grades';

      // Check for missing ASN (accounting for local updates and readyForPASI status)
      const studentsWithMissingASN = students.filter(student => {
        const localUpdateKey = `${familyId}_${student.id}`;
        const localASN = localASNUpdates[localUpdateKey];
        const asn = localASN || student.asn;
        const localReadyStatus = localReadyForPASIUpdates[localUpdateKey];
        const isReadyForPASI = localReadyStatus !== undefined ? localReadyStatus : (student.readyForPASI === true);
        // Only count as missing if no ASN AND not marked as ready for PASI
        return (!asn || asn === '') && !isReadyForPASI;
      });
      
      // Count students marked as "No ASN Yet" (readyForPASI = true)
      const studentsNoASNYet = students.filter(student => {
        const localUpdateKey = `${familyId}_${student.id}`;
        const localASN = localASNUpdates[localUpdateKey];
        const asn = localASN || student.asn;
        const localReadyStatus = localReadyForPASIUpdates[localUpdateKey];
        const isReadyForPASI = localReadyStatus !== undefined ? localReadyStatus : (student.readyForPASI === true);
        // Count if no ASN AND marked as ready for PASI
        return (!asn || asn === '') && isReadyForPASI;
      });
      
      const hasMissingASN = studentsWithMissingASN.length > 0;
      const missingASNCount = studentsWithMissingASN.length;
      const hasNoASNYet = studentsNoASNYet.length > 0;
      const noASNYetCount = studentsNoASNYet.length;

      // Calculate registration status for the family
      const registrationStatus = determineFamilyRegistrationStatus(family, activeSchoolYear);

      // Note: comprehensiveStatus removed from here to prevent re-renders during lazy loading
      // It will be accessed directly from familyStatuses in the row component
      
      // Map category references to actual category objects
      const familyCategories = [];
      if (family.categories && facilitatorCategories) {
        Object.entries(family.categories).forEach(([facilitatorKey, categoryIds]) => {
          if (facilitatorCategories[facilitatorKey]) {
            Object.entries(categoryIds).forEach(([categoryId, enabled]) => {
              if (enabled && facilitatorCategories[facilitatorKey][categoryId]) {
                const category = facilitatorCategories[facilitatorKey][categoryId];
                if (!category.archived) {
                  familyCategories.push({
                    ...category,
                    id: categoryId,
                    facilitatorKey: facilitatorKey
                  });
                }
              }
            });
          }
        });
      }

      return {
        familyId,
        familyName: family.familyName || 'Unnamed Family',
        primaryGuardian: primaryGuardian ? `${primaryGuardian.firstName} ${primaryGuardian.lastName}` : '',
        guardianEmail: primaryGuardian?.email || '',
        guardianPhone: primaryGuardian?.phone || '',
        studentCount: students.length,
        gradeRange,
        facilitatorEmail: family.facilitatorEmail || '',
        isMyFamily: family.facilitatorEmail === effectiveEmail,
        lastUpdated: family.lastUpdated || family.createdAt,
        city: primaryGuardian?.address?.city || '',
        hasMissingASN,
        missingASNCount,
        hasNoASNYet,
        noASNYetCount,
        studentsWithMissingASN,
        studentsNoASNYet,
        registrationStatus,
        categories: familyCategories, // Add the mapped categories
        rawFamily: { ...family, students: studentsObj }, // Pass the updated students with local ASN and readyForPASI
        localASNUpdates: localASNUpdates, // Pass the local ASN updates to the row
        localReadyForPASIUpdates: localReadyForPASIUpdates // Pass the local readyForPASI updates to the row
      };
    });
  }, [families, effectiveEmail, activeSchoolYear, localASNUpdates, localReadyForPASIUpdates, facilitatorCategories]);

  // Sort functionality
  const sortedRows = useMemo(() => {
    let rows = familyRows;
    
    // Sort if needed
    if (sortConfig.key) {
      rows = [...familyRows].sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        // Handle null/undefined values
        if (aVal === null || aVal === undefined) aVal = '';
        if (bVal === null || bVal === undefined) bVal = '';
        
        // Special handling for date fields (lastUpdated)
        if (sortConfig.key === 'lastUpdated') {
          // Convert to timestamps for consistent comparison
          aVal = aVal ? new Date(aVal).getTime() : 0;
          bVal = bVal ? new Date(bVal).getTime() : 0;
        }
        
        // Special handling for numeric fields
        if (sortConfig.key === 'studentCount') {
          aVal = Number(aVal) || 0;
          bVal = Number(bVal) || 0;
        }
        
        // Compare values
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    // Inject expanded rows
    const rowsWithExpanded = [];
    rows.forEach(row => {
      rowsWithExpanded.push(row);
      if (expandedRows.has(row.familyId)) {
        rowsWithExpanded.push({
          ...row,
          isExpandedRow: true,
          parentId: row.familyId
        });
      }
    });
    
    return rowsWithExpanded;
  }, [familyRows, sortConfig, expandedRows]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Bulk selection handlers - memoized for virtualized table performance
  const handleSelectFamily = useCallback((familyId) => {
    setSelectedFamilies(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(familyId)) {
        newSelection.delete(familyId);
      } else {
        newSelection.add(familyId);
      }
      console.log('Selection updated:', Array.from(newSelection));
      return newSelection;
    });
  }, []);

  // Toggle individual row expansion
  const toggleRow = useCallback((familyId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(familyId)) {
        newSet.delete(familyId);
      } else {
        newSet.add(familyId);
      }
      return newSet;
    });
  }, []);

  // Toggle all rows expansion
  const toggleAllRows = useCallback(() => {
    if (expandAll) {
      setExpandedRows(new Set());
      setExpandAll(false);
    } else {
      const allFamilyIds = familyRows.map(f => f.familyId);
      setExpandedRows(new Set(allFamilyIds));
      setExpandAll(true);
    }
  }, [familyRows, expandAll]);

  const handleSelectAll = useCallback((allRows) => {
    setIsAllSelected(prev => {
      if (prev) {
        // Deselect all
        setSelectedFamilies(new Set());
        return false;
      } else {
        // Select all visible families
        const allFamilyIds = allRows.map(row => row.familyId);
        setSelectedFamilies(new Set(allFamilyIds));
        return true;
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedFamilies(new Set());
    setIsAllSelected(false);
  }, []);

  // Bulk action handlers - memoized for virtualized table performance
  const handleBulkSetAssistance = useCallback((value) => {
    setPendingBulkAction({ type: 'setAssistance', value });
    setShowBulkConfirmDialog(true);
  }, []);

  const handleBulkEmail = useCallback(() => {
    if (onOpenEmailSheet) {
      onOpenEmailSheet(selectedFamilies);
    }
  }, [onOpenEmailSheet, selectedFamilies]);

  const handleBulkSetStatus = useCallback((status) => {
    setPendingBulkAction({ type: 'setStatus', status });
    setShowBulkConfirmDialog(true);
  }, []);

  const executeBulkAction = async () => {
    if (!pendingBulkAction || selectedFamilies.size === 0) return;
    
    setBulkActionLoading(true);
    setShowBulkConfirmDialog(false);
    
    try {
      const db = getDatabase();
      const dbSchoolYear = activeSchoolYear.replace('/', '_');
      
      if (pendingBulkAction.type === 'setStatus') {
        // Update family status (active/inactive)
        const updatePromises = [];
        
        for (const familyId of selectedFamilies) {
          const familyRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}`);
          updatePromises.push(update(familyRef, { 
            status: pendingBulkAction.status,
            lastUpdated: Date.now()
          }));
        }
        
        // Execute all updates in parallel
        await Promise.all(updatePromises);
        
        // Clear selection after successful update
        clearSelection();
        console.log(`Successfully updated status to ${pendingBulkAction.status} for ${selectedFamilies.size} families`);
        
        // Reload the page to reflect the status changes
        window.location.reload();
        
      } else if (pendingBulkAction.type === 'setAssistance') {
        // Prepare all update promises
        const updatePromises = [];
        
        for (const familyId of selectedFamilies) {
          const family = families[familyId];
          if (family && family.students) {
            const students = Object.values(family.students);
            
            // Update assistance required for all students in each selected family
            students.forEach(student => {
              const formRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/NOTIFICATION_FORMS/${dbSchoolYear}/${student.id}/PART_A/editableFields`);
              updatePromises.push(update(formRef, { assistanceRequired: pendingBulkAction.value }));
            });
          }
        }
        
        // Execute all updates in parallel
        await Promise.all(updatePromises);
        
        // Update local state for all affected families
        setFamilyStatuses(prev => {
          const newStatuses = { ...prev };
          selectedFamilies.forEach(familyId => {
            if (newStatuses[familyId]) {
              newStatuses[familyId] = {
                ...newStatuses[familyId],
                assistanceRequired: pendingBulkAction.value
              };
            }
          });
          return newStatuses;
        });
        
        // Clear selection after successful update
        clearSelection();
        console.log(`Successfully updated assistance status for ${selectedFamilies.size} families`);
      }
    } catch (error) {
      console.error('Error executing bulk action:', error);
      alert('An error occurred while updating families. Please try again.');
    } finally {
      setBulkActionLoading(false);
      setPendingBulkAction(null);
    }
  };


  // Handle toggling assistance required status - memoized for virtualized table
  const handleToggleAssistance = useCallback(async (familyId, newValue) => {
    setTogglingAssistance(prev => ({ ...prev, [familyId]: true }));
    
    try {
      const db = getDatabase();
      const family = families[familyId];
      
      if (family && family.students) {
        const students = Object.values(family.students);
        
        // Update assistance required for all students in the family
        const updatePromises = students.map(async (student) => {
          const formRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/NOTIFICATION_FORMS/${dbSchoolYear}/${student.id}/PART_A/editableFields`);
          return update(formRef, { assistanceRequired: newValue });
        });
        
        await Promise.all(updatePromises);
        
        // Update local state
        setFamilyStatuses(prev => ({
          ...prev,
          [familyId]: {
            ...prev[familyId],
            assistanceRequired: newValue
          }
        }));
        
        // Show success feedback (you might want to add a toast here)
        console.log(`Assistance ${newValue ? 'requested' : 'marked as handled'} for family ${familyId}`);
      }
    } catch (error) {
      console.error('Error toggling assistance status:', error);
    } finally {
      setTogglingAssistance(prev => ({ ...prev, [familyId]: false }));
    }
  }, [families, dbSchoolYear]);

  // Handler for opening ASN Edit Sheet
  const handleOpenASNSheet = useCallback((family, student = null) => {
    // The family object contains its own familyId
    const familyId = family?.familyId || Object.keys(families).find(id => families[id] === family);
    console.log('Opening ASN sheet for family:', familyId, family);
    setAsnSheetFamilyId(familyId);
    setAsnSheetStudent(student);
    setAsnSheetOpen(true);
  }, [families]);

  // Handler for ASN updates from sheet
  const handleASNUpdate = useCallback((familyId, studentId, asn, readyForPASI = null) => {
    // Update local state for optimistic updates
    if (asn !== null) {
      setLocalASNUpdates(prev => ({
        ...prev,
        [`${familyId}_${studentId}`]: asn
      }));
    }
    
    // Update readyForPASI status if provided
    if (readyForPASI !== null) {
      setLocalReadyForPASIUpdates(prev => ({
        ...prev,
        [`${familyId}_${studentId}`]: readyForPASI
      }));
    }
  }, []);

  // Custom table components for TableVirtuoso
  const tableComponents = useMemo(() => ({
    Table: (props) => (
      <table {...props} className="min-w-full divide-y divide-gray-200" />
    ),
    TableHead: React.forwardRef((props, ref) => (
      <thead {...props} ref={ref} className="bg-gray-50" />
    )),
    TableRow: React.forwardRef((props, ref) => {
      const { item, ...restProps } = props;
      
      // Handle expanded content rows differently
      if (item?.isExpandedRow) {
        return (
          <tr 
            {...restProps} 
            ref={ref}
            className="bg-gray-50 border-b border-gray-200"
          />
        );
      }
      
      const isSelected = item ? selectedFamilies.has(item.familyId) : false;
      return (
        <tr 
          {...restProps} 
          ref={ref}
          onClick={() => {
            if (item?.rawFamily) {
              console.log('Family record clicked:', item.rawFamily);
              console.log('Family ID:', item.familyId);
              //console.log('Family Name:', item.familyName);
              //console.log('Full record object:', JSON.stringify(item.rawFamily, null, 2));
            }
          }}
          style={{ cursor: 'pointer' }}
          className={`${
            isSelected 
              ? 'bg-blue-50 hover:bg-blue-100' 
              : item?.isMyFamily 
                ? 'bg-purple-50 hover:bg-purple-100' 
                : 'hover:bg-gray-50'
          }`}
        />
      );
    }),
    TableBody: React.forwardRef((props, ref) => (
      <tbody {...props} ref={ref} className="bg-white divide-y divide-gray-200" />
    ))
  }), [selectedFamilies]);

  // Fixed header content - moved outside of useCallback to avoid dependency issues
  const fixedHeaderContent = () => (
    <tr className="bg-gray-50">
      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
        <Checkbox
          checked={isAllSelected}
          onCheckedChange={() => handleSelectAll(sortedRows)}
          aria-label="Select all families"
        />
      </th>
      <th 
        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20"
      >
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleAllRows}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title={expandAll ? "Collapse all rows" : "Expand all rows"}
          >
            {expandAll ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
          <div 
            className="flex items-center space-x-1 cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded"
            onClick={() => handleSort('familyName')}
          >
            <span>Family</span>
            {sortConfig.key === 'familyName' && (
              <ChevronDown className={`w-3 h-3 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
            )}
          </div>
        </div>
      </th>
      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guardian</th>
      <th 
        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
        onClick={() => handleSort('studentCount')}
      >
        <div className="flex items-center space-x-1">
          <span>Students</span>
          {sortConfig.key === 'studentCount' && (
            <ChevronDown className={`w-3 h-3 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
          )}
        </div>
      </th>
      <th 
        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-16"
        onClick={() => handleSort('facilitatorEmail')}
      >
        <div className="flex items-center space-x-1">
          <span>Fac.</span>
          {sortConfig.key === 'facilitatorEmail' && (
            <ChevronDown className={`w-3 h-3 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
          )}
        </div>
      </th>
      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        <span>Reg.</span>
      </th>
      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        <span>Categories</span>
      </th>
      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        <span>Forms</span>
      </th>
      <th 
        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
        onClick={() => handleSort('lastUpdated')}
      >
        <div className="flex items-center space-x-1">
          <span>Active</span>
          {sortConfig.key === 'lastUpdated' && (
            <ChevronDown className={`w-3 h-3 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
          )}
        </div>
      </th>
      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
    </tr>
  );

  // Handle individual family email
  const handleEmailFamily = useCallback((familyId) => {
    if (onOpenEmailSheet) {
      onOpenEmailSheet(new Set([familyId]));
    }
  }, [onOpenEmailSheet]);

  // Handle category add
  const handleCategoryAdd = useCallback(async (familyId, categoryId, facilitatorKey) => {
    const db = getDatabase();
    const family = families[familyId];
    if (!family) return;

    try {
      // Update category assignment in Firebase
      const categoryRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/categories/${facilitatorKey}/${categoryId}`);
      await set(categoryRef, true);
      
      console.log('Category added successfully');
    } catch (error) {
      console.error('Error adding category:', error);
    }
  }, [families]);

  // Handle category remove
  const handleCategoryRemove = useCallback(async (familyId, categoryId, facilitatorKey) => {
    const db = getDatabase();
    
    try {
      // Remove category assignment in Firebase
      const categoryRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/categories/${facilitatorKey}/${categoryId}`);
      await remove(categoryRef);
      
      console.log('Category removed successfully');
    } catch (error) {
      console.error('Error removing category:', error);
    }
  }, []);

  // Row renderer - Note: We use inline functions here since these handlers are defined within FamilyTable
  const rowContent = useCallback((index, row) => {
    // Check if this is an expanded content row
    if (row.isExpandedRow) {
      return (
        <ExpandedRowContent 
          row={row}
          categories={facilitatorCategories}
          categoryTypes={categoryTypes}
          onCategoryAdd={handleCategoryAdd}
          onCategoryRemove={handleCategoryRemove}
        />
      );
    }
    
    const isSelected = selectedFamilies.has(row.familyId);
    // Get the comprehensive status for this specific row
    const comprehensiveStatus = familyStatuses[row.familyId] || {
      notificationForm: 'pending',
      programPlan: 'pending',
      citizenshipDocs: 'pending',
      paymentSetup: 'not_started',
      assistanceRequired: false
    };
    
    return (
      <FamilyTableRow
        row={row}
        isSelected={isSelected}
        isExpanded={expandedRows.has(row.familyId)}
        onToggleExpand={toggleRow}
        comprehensiveStatus={comprehensiveStatus}
        onSelectFamily={handleSelectFamily}
        onViewDashboard={(familyId, family) => {
          // Call the parent's onViewDashboard to open the sheet
          onViewDashboard(familyId, family);
        }}
        onOpenNotes={(familyId, family) => {
          setSelectedNotesFamilyId(familyId);
          setSelectedNotesFamily(family);
          setNotesModalOpen(true);
        }}
        onToggleAssistance={handleToggleAssistance}
        onDocumentReview={onDocumentReview}
        onEmailFamily={handleEmailFamily}
        onASNUpdate={handleASNUpdate}
        onOpenASNSheet={handleOpenASNSheet}
        loadingStatuses={loadingStatuses}
        togglingAssistance={togglingAssistance}
        isAdmin={isAdmin}
        effectiveEmail={effectiveEmail}
        categories={facilitatorCategories}
        categoryTypes={categoryTypes}
        onCategoryAdd={handleCategoryAdd}
        onCategoryRemove={handleCategoryRemove}
      />
    );
  }, [selectedFamilies, familyStatuses, handleSelectFamily, onViewDashboard, handleToggleAssistance, onDocumentReview, handleEmailFamily, handleASNUpdate, handleOpenASNSheet, loadingStatuses, togglingAssistance, isAdmin, effectiveEmail, facilitatorCategories, categoryTypes, handleCategoryAdd, handleCategoryRemove, expandedRows, toggleRow]);

  // Handle range changes for lazy loading with extra buffer
  const handleRangeChanged = useCallback((range) => {
    // Track which families are visible for lazy loading
    // Add extra buffer to pre-fetch nearby families
    const visibleFamilyIds = new Set();
    const bufferSize = 10; // Pre-fetch 10 extra rows on each side
    
    const startIdx = Math.max(0, range.startIndex - bufferSize);
    const endIdx = Math.min(sortedRows.length - 1, range.endIndex + bufferSize);
    
    for (let i = startIdx; i <= endIdx && i < sortedRows.length; i++) {
      if (sortedRows[i]) {
        visibleFamilyIds.add(sortedRows[i].familyId);
      }
    }
    setVisibleFamilies(visibleFamilyIds);
  }, [sortedRows]);

  return (
    <>
      <BulkActionsToolbar 
        selectedFamilies={selectedFamilies}
        clearSelection={clearSelection}
        bulkActionLoading={bulkActionLoading}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        handleBulkSetStatus={handleBulkSetStatus}
        handleBulkSetAssistance={handleBulkSetAssistance}
        handleBulkEmail={handleBulkEmail}
      />
      
      {/* Add spacing when toolbar is visible */}
      {selectedFamilies.size > 0 && <div className="h-14" />}
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {sortedRows.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No families found
          </div>
        ) : (
          <TableVirtuoso
            data={sortedRows}
            components={tableComponents}
            fixedHeaderContent={fixedHeaderContent}
            itemContent={rowContent}
            useWindowScroll={true}
            overscan={20}
            increaseViewportBy={{ top: 500, bottom: 500 }}
            rangeChanged={handleRangeChanged}
            scrollSeekConfiguration={{
              enter: velocity => Math.abs(velocity) > 1000,
              exit: velocity => Math.abs(velocity) < 100,
              change: (_velocity, { startIndex, endIndex }) => {
                // Show placeholder during fast scrolling
                return {
                  placeholder: (
                    <tr>
                      <td colSpan={8} className="text-center py-4 text-gray-400">
                        Loading...
                      </td>
                    </tr>
                  )
                };
              }
            }}
          />
        )}
      </div>
      
    {/* Family Notes Modal */}
    <React.Suspense fallback={
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    }>
      <FamilyNotesModal
        isOpen={notesModalOpen}
        onClose={() => setNotesModalOpen(false)}
        family={selectedNotesFamily}
        familyId={selectedNotesFamilyId}
      />
    </React.Suspense>
    
    {/* Bulk Action Confirmation Dialog */}
    <AlertDialog open={showBulkConfirmDialog} onOpenChange={setShowBulkConfirmDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Bulk Action</AlertDialogTitle>
          <AlertDialogDescription>
            {pendingBulkAction?.type === 'setStatus' && (
              <>
                You are about to set the status to <strong>{pendingBulkAction.status}</strong> for{' '}
                <strong>{selectedFamilies.size} {selectedFamilies.size === 1 ? 'family' : 'families'}</strong>.
                {pendingBulkAction.status === 'inactive' && (
                  <span className="block mt-2 text-orange-600">
                    Warning: Setting families to inactive will remove them from the active view.
                  </span>
                )}
              </>
            )}
            {pendingBulkAction?.type === 'setAssistance' && (
              <>
                You are about to {pendingBulkAction.value ? 'set' : 'clear'} assistance required for{' '}
                <strong>{selectedFamilies.size} {selectedFamilies.size === 1 ? 'family' : 'families'}</strong>.
                This will update all students in {selectedFamilies.size === 1 ? 'this family' : 'these families'}.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={bulkActionLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={executeBulkAction}
            disabled={bulkActionLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {bulkActionLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Confirm'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* ASN Edit Sheet */}
    <ASNEditSheet
      isOpen={asnSheetOpen}
      onClose={() => setAsnSheetOpen(false)}
      families={families}
      familyId={asnSheetFamilyId}
      onUpdate={handleASNUpdate}
      currentStudent={asnSheetStudent}
    />
    </>
  );
};

// Statistics Card Component
const StatsCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => (
  <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
    <div className="flex items-center">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r from-${color}-500 to-${color}-600 flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="ml-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {subtitle && (
          <p className="text-xs text-gray-500">{subtitle}</p>
        )}
      </div>
    </div>
  </div>
);

// Family Dashboard View Modal Component - Shows the exact Dashboard.js view the family sees
const FamilyDashboardModal = ({ family, familyId, isOpen, onClose }) => {
  const { user } = useAuth();
  const [familyUser, setFamilyUser] = useState(null);
  
  useEffect(() => {
    if (isOpen && family && family.guardians) {
      // Create a mock user object from the primary guardian for the Dashboard component
      const guardians = Object.values(family.guardians);
      const primaryGuardian = guardians.find(g => g.guardianType === 'primary_guardian') || guardians[0];
      
      if (primaryGuardian) {
        setFamilyUser({
          uid: `mock-${primaryGuardian.emailKey}`,
          email: primaryGuardian.email,
          displayName: `${primaryGuardian.firstName} ${primaryGuardian.lastName}`,
          // Mock the auth context properties
          user_email_key: primaryGuardian.emailKey,
          familyId: family.familyId
        });
      }
    } else {
      setFamilyUser(null);
    }
  }, [isOpen, family]);

  if (!isOpen || !family || !familyUser) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto">
          <div className="sticky top-0 z-10 px-6 py-4 border-b border-gray-200 bg-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Family Dashboard View - {family.familyName || 'Unnamed Family'}
                </h2>
                <p className="text-sm text-gray-600">
                  This is exactly what the family sees in their RTD Connect Dashboard
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6">

            {/* Dashboard Component */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <span className="text-sm font-medium text-gray-700">Family Dashboard Content</span>
              </div>
              <div className="min-h-[600px]">
                {/* Note: We would render the RTDConnectDashboard here but it requires complex auth context setup */}
                {/* For now, show a placeholder with key family information */}
                <div className="p-6">
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Dashboard View Integration
                    </h3>
                    <p className="text-gray-600 mb-4">
                      The full family dashboard integration is ready for implementation.
                      This would show the exact RTD Connect Dashboard that {family.familyName} sees.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 text-left max-w-md mx-auto">
                      <h4 className="font-medium text-gray-900 mb-2">Would include:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Student registration progress</li>
                        <li>• Form completion status</li>
                        <li>• Payment and budget information</li>
                        <li>• Document upload areas</li>
                        <li>• Facilitator communications</li>
                        <li>• Real-time family data</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Family Management Modal Component
const FamilyManagementModal = ({ family, familyId, isOpen, onClose, action }) => {
  const [facilitatorEmail, setFacilitatorEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState(false);
  const [assistanceHandled, setAssistanceHandled] = useState(false);
  const [hasAssistanceRequest, setHasAssistanceRequest] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && family && familyId) {
      setFacilitatorEmail(family.facilitatorEmail || '');
      setNotes(family.staffNotes || '');
      setPriority(family.priority || false);
      
      // Check if family has assistance requests
      const checkAssistanceRequests = async () => {
        const db = getDatabase();
        const currentYear = getCurrentSchoolYear();
        const dbSchoolYear = currentYear.replace('/', '_');
        const students = family.students ? Object.values(family.students) : [];
        
        for (const student of students) {
          const formRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/NOTIFICATION_FORMS/${dbSchoolYear}/${student.id}`);
          const snapshot = await get(formRef);
          if (snapshot.exists()) {
            const formData = snapshot.val();
            if (formData.PART_A?.editableFields?.assistanceRequired === true) {
              setHasAssistanceRequest(true);
              break;
            }
          }
        }
      };
      
      checkAssistanceRequests();
    }
  }, [isOpen, family, familyId]);

  const handleSave = async () => {
    if (!family || !familyId) return;
    
    setSaving(true);
    try {
      const db = getDatabase();
      
      // Update family information
      const familyRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}`);
      const updates = {
        facilitatorEmail: facilitatorEmail || null,
        staffNotes: notes || null,
        priority: priority,
        lastUpdated: Date.now()
      };
      await update(familyRef, updates);
      
      // If assistance was marked as handled, clear the assistance request
      if (assistanceHandled && hasAssistanceRequest) {
        const currentYear = getCurrentSchoolYear();
        const dbSchoolYear = currentYear.replace('/', '_');
        const students = family.students ? Object.values(family.students) : [];
        
        for (const student of students) {
          const formRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/NOTIFICATION_FORMS/${dbSchoolYear}/${student.id}/PART_A/editableFields`);
          await update(formRef, { assistanceRequired: false });
        }
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving changes:', error);
    }
    setSaving(false);
  };

  if (!isOpen || !family) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Manage Family - {family.familyName || 'Unnamed Family'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="px-6 py-4 space-y-6">
            {/* Facilitator Assignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Facilitator
              </label>
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={facilitatorEmail}
                  onChange={(e) => setFacilitatorEmail(e.target.value)}
                  placeholder="Enter facilitator email address"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Current: {family.facilitatorEmail || 'No facilitator assigned'}
              </p>
            </div>

            {/* Priority Flag */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="priority"
                checked={priority}
                onChange={(e) => setPriority(e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="priority" className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">
                  Mark as Priority Family
                </span>
              </label>
            </div>

            {/* Assistance Handled */}
            {hasAssistanceRequest && (
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="assistanceHandled"
                  checked={assistanceHandled}
                  onChange={(e) => setAssistanceHandled(e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="assistanceHandled" className="flex items-center space-x-2">
                  <HelpCircle className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Mark assistance request as handled
                  </span>
                </label>
              </div>
            )}

            {/* Staff Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Staff Notes (Private)
              </label>
              <div className="flex items-start space-x-2">
                <MessageSquare className="w-5 h-5 text-gray-400 mt-2" />
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add private notes about this family..."
                  rows={4}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                These notes are only visible to staff members
              </p>
            </div>

            {/* Quick Actions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Actions
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center space-x-2 p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Send Email</span>
                </button>
                <button className="flex items-center space-x-2 p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className="text-sm">Flag Issue</span>
                </button>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Family Details Modal Component
const FamilyDetailsModal = ({ family, familyId, isOpen, onClose }) => {
  if (!isOpen || !family) return null;

  const students = family.students ? Object.values(family.students) : [];
  const guardians = family.guardians ? Object.values(family.guardians) : [];
  const currentYear = getCurrentSchoolYear();
  const forms = family.NOTIFICATION_FORMS?.[currentYear] || {};

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {family.familyName || 'Family Details'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="px-6 py-4">
            {/* Family Overview */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Family Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Hash className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Family ID: {familyId}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600">{students.length} Students</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-600">{guardians.length} Guardians</span>
                </div>
              </div>
            </div>

            {/* Students Section */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Students</h3>
              <div className="space-y-4">
                {students.map((student, index) => {
                  const hasForm = forms[student.id];
                  return (
                    <div key={student.id || index} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {student.preferredName || student.firstName} {student.lastName}
                          </h4>
                          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div>ASN: {student.asn}</div>
                            <div>Grade: {student.grade}</div>
                            <div>Gender: {student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : student.gender === 'X' ? 'Other' : student.gender}</div>
                            <div>Birthday: {formatDateForDisplay(student.birthday)}</div>
                            {student.email && <div>Email: {student.email}</div>}
                            {student.phone && <div>Phone: {student.phone}</div>}
                          </div>
                        </div>
                        <div className="ml-4">
                          {hasForm ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                              Registered
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Guardians Section */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Parents/Guardians</h3>
              <div className="space-y-4">
                {guardians.map((guardian, index) => (
                  <div key={guardian.id || index} className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {guardian.firstName} {guardian.lastName}
                        </h4>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Mail className="w-3 h-3" />
                            <span>{guardian.email}</span>
                          </div>
                          {guardian.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="w-3 h-3" />
                              <span>{guardian.phone}</span>
                            </div>
                          )}
                          <div>Relation: {guardian.relationToStudents || 'Guardian'}</div>
                          {guardian.address && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{guardian.address.city}, {guardian.address.province}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        {guardian.guardianType === 'primary_guardian' ? (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                            Primary
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                            Guardian
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HomeEducationStaffDashboard = ({
  // Props from Layout for header functionality
  viewMode = 'my', // 'my', 'all', 'inactive', or 'unassigned'
  setViewMode = () => {},
  impersonatingFacilitator = null,
  setImpersonatingFacilitator = () => {},
  showImpersonationDropdown = false,
  setShowImpersonationDropdown = () => {},
  showTestFamilies = false,
  setShowTestFamilies = () => {},
  homeEducationStats = { totalFamilies: 0, myFamilies: 0, inactiveFamilies: 0, unassignedFamilies: 0 },
  setHomeEducationStats = () => {}
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { hasPermission, isStaff, isAdmin, loading: claimsLoading } = useStaffClaims();
  const [families, setFamilies] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [selectedFamilyId, setSelectedFamilyId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDashboardModal, setShowDashboardModal] = useState(false);
  const [showDashboardSheet, setShowDashboardSheet] = useState(false);
  const [dashboardSheetFamily, setDashboardSheetFamily] = useState(null);
  const [dashboardSheetFamilyId, setDashboardSheetFamilyId] = useState(null);
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [managementAction, setManagementAction] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [familyStatuses, setFamilyStatuses] = useState({});
  const [loadingStatuses, setLoadingStatuses] = useState(true);
  const [showCSVColumnSelector, setShowCSVColumnSelector] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showDocumentReview, setShowDocumentReview] = useState(false);
  const [documentReviewFamilyId, setDocumentReviewFamilyId] = useState(null);
  const [documentReviewFamily, setDocumentReviewFamily] = useState(null);
  // activeSchoolYear is now defined earlier as a const from getCurrentSchoolYear()
  const [filters, setFilters] = useState({
    registrationStatus: [], // Multiple statuses can be selected
    gradeLevel: [], // Multiple grade levels
    location: [], // Multiple locations
    facilitatorAssigned: [], // Multiple facilitator states
    facilitatorEmails: [], // Specific facilitator emails
    assistanceRequired: [], // Multiple assistance states
    missingASN: [], // Multiple ASN states
    categories: [], // Selected categories for filtering
    followsAlbertaPrograms: [], // Filter by Alberta Programs enrollment
    albertaCourses: [] // Filter by specific Alberta courses
  });
  const [stats, setStats] = useState({
    totalFamilies: 0,
    totalStudents: 0,
    totalGuardians: 0,
    registeredFamilies: 0,
    pendingFamilies: 0,
    partialFamilies: 0,
    myFamilies: 0,
    myRegisteredFamilies: 0
  });
  const [showEmailSheet, setShowEmailSheet] = useState(false);
  const [selectedFamiliesForEmail, setSelectedFamiliesForEmail] = useState(new Set());
  
  // Category state
  const [facilitatorCategories, setFacilitatorCategories] = useState({});
  const [categoryTypes, setCategoryTypes] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Use the current school year from calendarConfig (updated once per year)
  const activeSchoolYear = getCurrentSchoolYear();

  // Function to reload categories from Firebase
  const loadCategoriesFromFirebase = useCallback(() => {
    const db = getDatabase();
    const categoriesRef = ref(db, 'homeEducationCategories');
    
    get(categoriesRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const categoriesByFacilitator = {};
        
        Object.entries(data).forEach(([facilitatorKey, categories]) => {
          // Store categories as objects, not arrays
          categoriesByFacilitator[facilitatorKey] = categories;
        });
        
        setFacilitatorCategories(categoriesByFacilitator);
      } else {
        setFacilitatorCategories({});
      }
    });
  }, []);

  // Load categories for facilitators
  useEffect(() => {
    const db = getDatabase();
    const categoriesRef = ref(db, 'homeEducationCategories');
    const typesRef = ref(db, 'homeEducationCategoryTypes');
    
    // Load all categories grouped by facilitator
    const unsubscribeCategories = onValue(categoriesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const categoriesByFacilitator = {};
        
        Object.entries(data).forEach(([facilitatorKey, categories]) => {
          // Store categories as objects to maintain ID references
          categoriesByFacilitator[facilitatorKey] = categories;
        });
        
        setFacilitatorCategories(categoriesByFacilitator);
      } else {
        setFacilitatorCategories({});
      }
    });
    
    // Load category types
    const unsubscribeTypes = onValue(typesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const typesArray = Object.entries(data).map(([id, type]) => ({
          ...type,
          id
        }));
        setCategoryTypes(typesArray);
      } else {
        setCategoryTypes([]);
      }
    });
    
    return () => {
      unsubscribeCategories();
      unsubscribeTypes();
    };
  }, []);

  // Fetch comprehensive status data for all families
  useEffect(() => {
    const fetchFamilyStatuses = async () => {
      if (!activeSchoolYear || Object.keys(families).length === 0) {
        setLoadingStatuses(false);
        return;
      }

      setLoadingStatuses(true);
      const db = getDatabase();
      const statuses = {};
      const dbSchoolYear = activeSchoolYear.replace('/', '_'); // Convert 25/26 to 25_26

      for (const [familyId, family] of Object.entries(families)) {
        const students = family.students ? Object.values(family.students) : [];

        // Initialize status object
        statuses[familyId] = {
          notificationForm: 'pending',
          programPlan: 'pending',
          citizenshipDocs: 'pending',
          paymentSetup: 'not_started',
          assistanceRequired: false
        };

        // Check Notification Forms for all students
        let allFormsSubmitted = true;
        let anyFormStarted = false;
        let anyAssistanceRequired = false;

        for (const student of students) {
          try {
            const formPath = `homeEducationFamilies/familyInformation/${familyId}/NOTIFICATION_FORMS/${dbSchoolYear}/${student.id}`;
            const formRef = ref(db, formPath);
            const formSnapshot = await get(formRef);

            if (formSnapshot.exists()) {
              const formData = formSnapshot.val();

              if (formData.submissionStatus === 'submitted') {
                anyFormStarted = true;
                // allFormsSubmitted stays true
              } else {
                allFormsSubmitted = false;
                anyFormStarted = true;
              }

              // Check if assistance is required
              if (formData.PART_A?.editableFields?.assistanceRequired === true) {
                anyAssistanceRequired = true;
              }
            } else {
              allFormsSubmitted = false;
            }
          } catch (error) {
            console.error(`Error fetching notification form for student ${student.id}:`, error);
            allFormsSubmitted = false;
          }
        }

        // Set assistance required status
        if (anyAssistanceRequired) {
          statuses[familyId].assistanceRequired = true;
        }

        if (students.length > 0) {
          if (allFormsSubmitted) {
            statuses[familyId].notificationForm = 'submitted';
          } else if (anyFormStarted) {
            statuses[familyId].notificationForm = 'partial';
          }
        }

        // Check Program Plans (SOLO) for all students
        let allPlansSubmitted = true;
        let anyPlanStarted = false;
        
        for (const student of students) {
          try {
            const planRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/SOLO_EDUCATION_PLANS/${dbSchoolYear}/${student.id}`);
            const planSnapshot = await get(planRef);
            
            if (planSnapshot.exists()) {
              const planData = planSnapshot.val();
              if (planData.submissionStatus === 'submitted') {
                anyPlanStarted = true;
              } else {
                allPlansSubmitted = false;
                anyPlanStarted = true;
              }
            } else {
              allPlansSubmitted = false;
            }
          } catch (error) {
            console.error(`Error fetching program plan for student ${student.id}:`, error);
            allPlansSubmitted = false;
          }
        }
        
        if (students.length > 0) {
          if (allPlansSubmitted) {
            statuses[familyId].programPlan = 'submitted';
          } else if (anyPlanStarted) {
            statuses[familyId].programPlan = 'in_progress';
          }
        }

        // Check Citizenship Docs for all students
        let allDocsCompleted = true;
        let anyDocsStarted = false;
        let anyPendingReview = false;
        
        for (const student of students) {
          try {
            const docsRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/STUDENT_CITIZENSHIP_DOCS/${student.id}`);
            const docsSnapshot = await get(docsRef);
            
            if (docsSnapshot.exists()) {
              const docsData = docsSnapshot.val();
              anyDocsStarted = true;
              
              // Check if already approved by staff
              const isStaffApproved = docsData.staffApproval?.isApproved === true;
              
              if (isStaffApproved) {
                // Already approved by staff - counts as complete
              } else if (docsData.completionStatus === 'completed' && !docsData.requiresStaffReview && !docsData.staffReviewRequired) {
                // Document is complete and doesn't need review
              } else if ((docsData.requiresStaffReview || docsData.staffReviewRequired) && !isStaffApproved) {
                // Needs staff review and hasn't been approved yet
                anyPendingReview = true;
                allDocsCompleted = false;
              } else {
                allDocsCompleted = false;
              }
            } else {
              allDocsCompleted = false;
            }
          } catch (error) {
            console.error(`Error fetching citizenship docs for student ${student.id}:`, error);
            allDocsCompleted = false;
          }
        }
        
        if (students.length > 0) {
          if (allDocsCompleted && !anyPendingReview) {
            statuses[familyId].citizenshipDocs = 'completed';
          } else if (anyPendingReview) {
            statuses[familyId].citizenshipDocs = 'pending_review';
          } else if (anyDocsStarted) {
            statuses[familyId].citizenshipDocs = 'in_progress';
          }
        }

        // Check Stripe Connect (Payment Setup)
        try {
          const stripeRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/STRIPE_CONNECT`);
          const stripeSnapshot = await get(stripeRef);
          
          if (stripeSnapshot.exists()) {
            const stripeData = stripeSnapshot.val();
            if (stripeData.status === 'active' || stripeData.status === 'complete') {
              statuses[familyId].paymentSetup = 'active';
            } else if (stripeData.status === 'pending') {
              statuses[familyId].paymentSetup = 'pending_setup';
            }
          }
        } catch (error) {
          console.error(`Error fetching Stripe status for family ${familyId}:`, error);
        }
      }

      setFamilyStatuses(statuses);
      setLoadingStatuses(false);
    };

    fetchFamilyStatuses();
  }, [families, activeSchoolYear]);

  // Load families data
  // PERFORMANCE OPTIMIZATION:
  // - By default, query by facilitatorEmail to limit data download (5-50 families per facilitator)
  // - When viewing "All Active" tab: query by status === 'active'
  // - When viewing "Inactive" tab: query by status === 'inactive'
  // - When viewing "Unassigned" tab: query by facilitatorEmail === null (all unassigned families)
  // - In "My Families" mode: client-side filter to only show active families
  // - This reduces initial load from 100+ families to just the relevant subset
  useEffect(() => {
    if (!user || claimsLoading) return;

    const db = getDatabase();
    const effectiveEmail = impersonatingFacilitator?.contact?.email || user?.email;

    // Determine query strategy based on user role and view preference
    let familiesRef;

    if (viewMode === 'all') {
      // Admin viewing "All Active Families": Query by status = active
      familiesRef = query(
        ref(db, 'homeEducationFamilies/familyInformation'),
        orderByChild('status'),
        equalTo('active')
      );
    } else if (viewMode === 'inactive') {
      // Admin viewing "Inactive Families": Query by status = inactive
      familiesRef = query(
        ref(db, 'homeEducationFamilies/familyInformation'),
        orderByChild('status'),
        equalTo('inactive')
      );
    } else if (viewMode === 'unassigned') {
      // Admin viewing "Unassigned Families": Query for null facilitatorEmail
      familiesRef = query(
        ref(db, 'homeEducationFamilies/familyInformation'),
        orderByChild('facilitatorEmail'),
        equalTo(null)
      );
    } else {
      // DEFAULT: "My Families" - Query by facilitatorEmail (most efficient)
      if (!effectiveEmail) {
        setLoading(false);
        return;
      }

      familiesRef = query(
        ref(db, 'homeEducationFamilies/familyInformation'),
        orderByChild('facilitatorEmail'),
        equalTo(effectiveEmail)
      );
    }

    const unsubscribe = onValue(familiesRef, (snapshot) => {
      if (snapshot.exists()) {
        const familiesData = snapshot.val();

        // Client-side filtering based on viewMode
        let filteredData = familiesData;

        if (viewMode === 'my') {
          // Show only active families for facilitator's assigned families
          filteredData = Object.fromEntries(
            Object.entries(familiesData).filter(([_, family]) =>
              family.status === 'active'
            )
          );
        }
        // For 'all', 'inactive', and 'unassigned' modes, the database query already handles filtering

        // Filter out test families unless showTestFamilies is true
        if (!showTestFamilies) {
          filteredData = Object.fromEntries(
            Object.entries(filteredData).filter(([_, family]) => {
              // Check if family has the test category marker
              const isTestFamily = family.categories?.["kyle@rtdacademy,com"]?.["1759858143461"] === true;
              return !isTestFamily; // Exclude test families
            })
          );
        }

        setFamilies(filteredData);

        // Calculate statistics
        const familyEntries = Object.entries(filteredData);
        const currentYear = getCurrentSchoolYear();
        
        let totalStudents = 0;
        let totalGuardians = 0;
        let registeredCount = 0;
        let pendingCount = 0;
        let partialCount = 0;
        let myFamilies = 0;
        let myRegisteredFamilies = 0;

        familyEntries.forEach(([familyId, family]) => {
          const students = family.students ? Object.values(family.students) : [];
          const guardians = family.guardians ? Object.values(family.guardians) : [];
          const forms = family.NOTIFICATION_FORMS?.[currentYear] || {};
          const isMyFamily = family.facilitatorEmail === effectiveEmail;
          
          totalStudents += students.length;
          totalGuardians += guardians.length;
          
          if (isMyFamily) {
            myFamilies++;
          }
          
          // Check registration status
          const hasFormsForAllStudents = students.length > 0 && students.every(student => 
            forms[student.id] && forms[student.id].submissionStatus === 'submitted'
          );
          
          if (hasFormsForAllStudents) {
            registeredCount++;
            if (isMyFamily) {
              myRegisteredFamilies++;
            }
          } else if (Object.keys(forms).length > 0) {
            partialCount++;
          } else {
            pendingCount++;
          }
        });

        const newStats = {
          totalFamilies: familyEntries.length,
          totalStudents,
          totalGuardians,
          registeredFamilies: registeredCount,
          pendingFamilies: pendingCount,
          partialFamilies: partialCount,
          myFamilies,
          myRegisteredFamilies
        };
        
        setStats(newStats);
      } else {
        setFamilies({});
        const emptyStats = {
          totalFamilies: 0,
          totalStudents: 0,
          totalGuardians: 0,
          registeredFamilies: 0,
          pendingFamilies: 0,
          partialFamilies: 0,
          myFamilies: 0,
          myRegisteredFamilies: 0
        };
        setStats(emptyStats);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error loading families data:', error);
      setLoading(false);
    });

    return () => {
      off(familiesRef, 'value', unsubscribe);
    };
  }, [user, claimsLoading, impersonatingFacilitator, viewMode, isAdmin, showTestFamilies]);

  // Filter families based on all criteria
  const filteredFamilies = useMemo(() => {
    let result = families;
    // Use impersonated facilitator email if set, otherwise use actual user email
    const effectiveEmail = impersonatingFacilitator?.contact?.email || user?.email;
    // Use activeSchoolYear (not currentYear) to match the year used everywhere else
    // activeSchoolYear accounts for open registration and could be 25/26 instead of 24/25

    // NOTE: Facilitator filtering is now done at database level for performance
    // No need to re-filter here unless admin is viewing all families

    // Apply advanced filters
    result = Object.fromEntries(
      Object.entries(result).filter(([familyId, family]) => {
        // Registration Status Filter - Now using detailed PASI statuses
        if (filters.registrationStatus && filters.registrationStatus.length > 0) {
          const registrationStatus = determineFamilyRegistrationStatus(family, activeSchoolYear);
          if (!filters.registrationStatus.includes(registrationStatus.status)) return false;
        }

        // Grade Level Filter
        if (filters.gradeLevel && filters.gradeLevel.length > 0) {
          const students = family.students ? Object.values(family.students) : [];
          const hasMatchingGrade = students.some(student => {
            const grade = student.grade?.toString().toLowerCase();
            return filters.gradeLevel.some(level => {
              if (level === 'k') return grade === 'k' || grade === 'kindergarten' || grade === '0';
              if (level === 'elementary') return ['1', '2', '3', '4', '5', '6'].includes(grade);
              if (level === 'middle') return ['7', '8', '9'].includes(grade);
              if (level === 'high') return ['10', '11', '12'].includes(grade);
              return false;
            });
          });
          if (!hasMatchingGrade) return false;
        }

        // Facilitator Assignment Filter
        if (filters.facilitatorAssigned && filters.facilitatorAssigned.length > 0) {
          const hasAssignedFacilitator = !!family.facilitatorEmail;
          const matchesFilter = filters.facilitatorAssigned.some(value => {
            if (value === 'assigned') return hasAssignedFacilitator;
            if (value === 'unassigned') return !hasAssignedFacilitator;
            return false;
          });
          if (!matchesFilter) return false;
        }

        // Specific Facilitator Filter
        if (filters.facilitatorEmails && filters.facilitatorEmails.length > 0) {
          const familyFacilitator = family.facilitatorEmail?.toLowerCase();
          if (!familyFacilitator || !filters.facilitatorEmails.includes(familyFacilitator)) {
            return false;
          }
        }

        // Assistance Required Filter
        if (filters.assistanceRequired && filters.assistanceRequired.length > 0) {
          const familyStatus = familyStatuses[familyId];
          const hasAssistanceRequired = familyStatus?.assistanceRequired || false;
          const matchesFilter = filters.assistanceRequired.some(value => {
            if (value === 'yes') return hasAssistanceRequired;
            if (value === 'no') return !hasAssistanceRequired;
            return false;
          });
          if (!matchesFilter) return false;
        }

        // Missing ASN Filter
        if (filters.missingASN && filters.missingASN.length > 0) {
          const students = family.students ? Object.values(family.students) : [];
          const hasMissingASN = students.some(student => !student.asn || student.asn === '');
          const matchesFilter = filters.missingASN.some(value => {
            if (value === 'yes') return hasMissingASN;
            if (value === 'no') return !hasMissingASN;
            return false;
          });
          if (!matchesFilter) return false;
        }

        // Category Filter
        if (filters.categories && filters.categories.length > 0) {
          const familyCategories = family.categories || {};
          const hasMatchingCategory = filters.categories.some(facilitatorCat => {
            const [facilitatorEmail, categoryData] = Object.entries(facilitatorCat)[0];
            const [categoryId] = Object.keys(categoryData);
            return familyCategories[facilitatorEmail]?.[categoryId];
          });
          if (!hasMatchingCategory) return false;
        }

        // Alberta Programs Filter
        if (filters.followsAlbertaPrograms && filters.followsAlbertaPrograms.length > 0) {
          const dbSchoolYear = activeSchoolYear.replace('/', '_');
          const soloPlans = family.SOLO_EDUCATION_PLANS?.[dbSchoolYear];
          if (!soloPlans) return false;
          
          const hasAlbertaPrograms = Object.values(soloPlans).some(plan => 
            plan.followAlbertaPrograms === true
          );
          
          const matchesFilter = filters.followsAlbertaPrograms.some(value => {
            if (value === 'yes') return hasAlbertaPrograms;
            if (value === 'no') return !hasAlbertaPrograms;
            return false;
          });
          if (!matchesFilter) return false;
        }

        // Alberta Courses Filter
        if (filters.albertaCourses && filters.albertaCourses.length > 0) {
          const dbSchoolYear = activeSchoolYear.replace('/', '_');
          const soloPlans = family.SOLO_EDUCATION_PLANS?.[dbSchoolYear];
          if (!soloPlans) return false;
          
          const familyCourses = [];
          Object.values(soloPlans).forEach(plan => {
            if (plan.selectedAlbertaCourses) {
              Object.values(plan.selectedAlbertaCourses).forEach(subjectCourses => {
                if (Array.isArray(subjectCourses)) {
                  familyCourses.push(...subjectCourses);
                }
              });
            }
          });
          
          const hasMatchingCourse = filters.albertaCourses.some(courseId => 
            familyCourses.includes(courseId)
          );
          if (!hasMatchingCourse) return false;
        }

        return true;
      })
    );

    // Apply search term filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = Object.fromEntries(
        Object.entries(result).filter(([familyId, family]) => {
          // Search in family name
          if (family.familyName?.toLowerCase().includes(searchLower)) return true;
          
          // Search in student names and ASNs
          const students = family.students ? Object.values(family.students) : [];
          if (students.some(student => 
            student.firstName?.toLowerCase().includes(searchLower) ||
            student.lastName?.toLowerCase().includes(searchLower) ||
            student.preferredName?.toLowerCase().includes(searchLower) ||
            student.asn?.includes(searchTerm)
          )) return true;

          // Search in guardian names and emails
          const guardians = family.guardians ? Object.values(family.guardians) : [];
          if (guardians.some(guardian =>
            guardian.firstName?.toLowerCase().includes(searchLower) ||
            guardian.lastName?.toLowerCase().includes(searchLower) ||
            guardian.email?.toLowerCase().includes(searchLower)
          )) return true;

          // Search in facilitator email
          if (family.facilitatorEmail?.toLowerCase().includes(searchLower)) return true;

          // Search in family ID
          if (familyId.toLowerCase().includes(searchLower)) return true;

          return false;
        })
      );
    }

    return result;
  }, [families, searchTerm, filters, user?.email, impersonatingFacilitator, activeSchoolYear, familyStatuses]);

  const handleViewDetails = (familyId, family) => {
    setSelectedFamilyId(familyId);
    setSelectedFamily(family);
    setShowDetailsModal(true);
  };

  const handleViewDashboard = (familyId, family) => {
    setDashboardSheetFamilyId(familyId);
    setDashboardSheetFamily(family);
    setShowDashboardSheet(true);
  };

  const handleDocumentReview = (familyId) => {
    const family = families[familyId];
    if (family) {
      setDocumentReviewFamilyId(familyId);
      setDocumentReviewFamily(family);
      setShowDocumentReview(true);
    }
  };

  const handleCloseModal = () => {
    setSelectedFamily(null);
    setSelectedFamilyId(null);
    setShowDetailsModal(false);
  };

  const handleCloseDashboardModal = () => {
    setSelectedFamily(null);
    setSelectedFamilyId(null);
    setShowDashboardModal(false);
  };

  const handleCloseDashboardSheet = () => {
    setDashboardSheetFamily(null);
    setDashboardSheetFamilyId(null);
    setShowDashboardSheet(false);
  };

  // Handle individual family email - allows emailing without checkbox selection
  const handleIndividualEmail = (familyId) => {
    setSelectedFamiliesForEmail(new Set([familyId]));
    setShowEmailSheet(true);
  };

  const handleManageFamily = (familyId, family) => {
    setSelectedFamilyId(familyId);
    setSelectedFamily(family);
    setManagementAction('manage');
    setShowManagementModal(true);
  };

  const handleCloseManagementModal = () => {
    setSelectedFamily(null);
    setSelectedFamilyId(null);
    setManagementAction(null);
    setShowManagementModal(false);
  };

  // Helper functions for filter management
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      registrationStatus: [],
      gradeLevel: [],
      location: [],
      facilitatorAssigned: [],
      assistanceRequired: [],
      missingASN: [],
      categories: [],
      followsAlbertaPrograms: [],
      albertaCourses: []
    });
    setSearchTerm('');
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    return Array.isArray(value) && value.length > 0;
  }) || searchTerm.trim();

  // Export functionality with selected columns
  const handleExportFamilies = (selectedColumns, exportMode = 'family') => {
    const familyEntries = Object.entries(filteredFamilies);

    // Generate data based on export mode
    let csvData = [];

    if (exportMode === 'student') {
      // Student mode: Create one row per student
      familyEntries.forEach(([familyId, family]) => {
        const students = family.students ? Object.values(family.students) : [];
        const guardians = family.guardians ? Object.values(family.guardians) : [];
        const primaryGuardian = guardians.find(g => g.guardianType === 'primary_guardian') || guardians[0];
        const secondaryGuardians = guardians.filter(g => g.guardianType !== 'primary_guardian');

        // Get comprehensive status
        const status = familyStatuses[familyId] || {
          notificationForm: 'pending',
          programPlan: 'pending',
          citizenshipDocs: 'pending',
          paymentSetup: 'not_started',
          assistanceRequired: false
        };

        // Get meeting information
        const dbSchoolYear = activeSchoolYear.replace('/', '_');
        const facilitatorMeetings = family.FACILITATOR_MEETINGS?.[dbSchoolYear];
        const meetings = facilitatorMeetings ? Object.values(facilitatorMeetings) : [];
        const meeting1 = meetings[0];
        const meeting2 = meetings[1];

        // Create a row for each student
        students.forEach((student, studentIndex) => {
          const rowData = {};

          selectedColumns.forEach(columnId => {
            switch(columnId) {
              // Family Information (repeated for each student)
              case 'familyId':
                rowData['Family ID'] = familyId;
                break;
              case 'familyName':
                rowData['Family Name'] = family.familyName || 'Unnamed Family';
                break;
              case 'status':
                rowData['Status'] = family.status || 'active';
                break;
              case 'createdAt':
                rowData['Created Date'] = family.createdAt ? new Date(family.createdAt).toLocaleDateString() : '';
                break;
              case 'lastUpdated':
                rowData['Last Updated'] = family.lastUpdated ? new Date(family.lastUpdated).toLocaleDateString() : '';
                break;
              case 'totalStudents':
                rowData['Total Students'] = students.length;
                break;
              case 'totalGuardians':
                rowData['Total Guardians'] = guardians.length;
                break;

              // Individual Student Information
              case 'studentId':
                rowData['Student ID'] = student.id || '';
                break;
              case 'studentFirstName':
                rowData['First Name'] = student.firstName || '';
                break;
              case 'studentLastName':
                rowData['Last Name'] = student.lastName || '';
                break;
              case 'studentASN':
                rowData['ASN'] = student.asn || (student.readyForPASI ? 'Ready' : '');
                break;
              case 'studentGrade':
                rowData['Grade'] = student.grade || '';
                break;
              case 'studentAge':
                if (student.birthday) {
                  const age = calculateAge(student.birthday);
                  rowData['Age'] = age !== null ? age : '';
                } else {
                  rowData['Age'] = '';
                }
                break;
              case 'studentBirthday':
                rowData['Birthday'] = student.birthday || '';
                break;
              case 'studentGender':
                rowData['Gender'] = student.gender || '';
                break;
              case 'studentEmail':
                rowData['Email'] = student.email || '';
                break;
              case 'studentPhone':
                rowData['Phone'] = student.phone || '';
                break;
              case 'studentReadyForPASI':
                rowData['Ready for PASI'] = student.readyForPASI ? 'Yes' : 'No';
                break;

              // Guardian Information
              case 'primaryGuardianName':
                rowData['Primary Guardian'] = primaryGuardian ? `${primaryGuardian.firstName} ${primaryGuardian.lastName}` : '';
                break;
              case 'primaryGuardianEmail':
                rowData['Primary Email'] = primaryGuardian?.email || '';
                break;
              case 'primaryGuardianPhone':
                rowData['Primary Phone'] = primaryGuardian?.phone || '';
                break;
              case 'secondaryGuardianNames':
                rowData['Other Guardians'] = secondaryGuardians.map(g => `${g.firstName} ${g.lastName}`).join('; ');
                break;
              case 'secondaryGuardianEmails':
                rowData['Other Emails'] = secondaryGuardians.map(g => g.email).join('; ');
                break;
              case 'guardianRelations':
                rowData['Relations'] = guardians.map(g => g.relationToStudents || 'N/A').join('; ');
                break;

              // Facilitator Information
              case 'facilitatorName':
                rowData['Facilitator Name'] = family.facilitatorName || 'Unassigned';
                break;
              case 'facilitatorEmail':
                rowData['Facilitator Email'] = family.facilitatorEmail || 'Unassigned';
                break;
              case 'facilitatorAssignedDate':
                rowData['Facilitator Assigned'] = family.facilitatorAssignedAt ? new Date(family.facilitatorAssignedAt).toLocaleDateString() : '';
                break;
              case 'lastFacilitatorUpdate':
                rowData['Last Facilitator Update'] = family.lastFacilitatorUpdate ? new Date(family.lastFacilitatorUpdate).toLocaleDateString() : '';
                break;

              // Registration Status
              case 'schoolYear':
                rowData['School Year'] = activeSchoolYear;
                break;
              case 'notificationFormStatus':
                rowData['Notification Form'] = status.notificationForm;
                break;
              case 'educationPlanStatus':
                rowData['Education Plan'] = status.programPlan;
                break;
              case 'citizenshipDocsStatus':
                rowData['Citizenship Docs'] = status.citizenshipDocs;
                break;
              case 'paymentSetupStatus':
                rowData['Payment Setup'] = status.paymentSetup;
                break;
              case 'pasiRegistrationStatus':
                rowData['PASI Status'] = family.PASI_REGISTRATIONS?.[dbSchoolYear]?.status || 'pending';
                break;
              case 'overallRegistrationStatus':
                rowData['Overall Status'] = determineOverallStatus(status);
                break;
              case 'assistanceRequired':
                rowData['Assistance Required'] = status.assistanceRequired ? 'Yes' : 'No';
                break;

              // Address Information
              case 'streetAddress':
                rowData['Street Address'] = primaryGuardian?.address?.streetAddress || '';
                break;
              case 'city':
                rowData['City'] = primaryGuardian?.address?.city || '';
                break;
              case 'province':
                rowData['Province'] = primaryGuardian?.address?.province || '';
                break;
              case 'postalCode':
                rowData['Postal Code'] = primaryGuardian?.address?.postalCode || '';
                break;
              case 'country':
                rowData['Country'] = primaryGuardian?.address?.country || '';
                break;
              case 'fullAddress':
                rowData['Full Address'] = primaryGuardian?.address?.fullAddress || '';
                break;

              // Compliance Information
              case 'registrationDate':
                rowData['Registration Date'] = family.registrationDate || '';
                break;
              case 'acceptanceStatus':
                rowData['Acceptance Status'] = family.acceptanceStatus || '';
                break;
              case 'schoolCode':
                rowData['School Code'] = '2444';
                break;
              case 'authorityCode':
                rowData['Authority Code'] = '0402';
                break;
              case 'residentSchoolBoard':
                rowData['School Board'] = family.residentSchoolBoard || '';
                break;
              case 'aboriginalDeclaration':
                rowData['Aboriginal Declaration'] = family.aboriginalDeclaration || '';
                break;
              case 'francophoneEligible':
                rowData['Francophone'] = family.francophoneEligible || '';
                break;

              // Funding Information (per student)
              case 'fundingEligible':
                rowData['Funding Eligible'] = student.fundingEligible ? 'Yes' : 'No';
                break;
              case 'fundingAmounts':
                rowData['Funding Amount'] = student.fundingAmount || 0;
                break;
              case 'totalFunding':
                // For student mode, show individual student funding
                rowData['Funding Amount'] = student.fundingAmount || 0;
                break;

              // Meeting Information
              case 'meeting1Date':
                rowData['Meeting 1 Date'] = meeting1?.meeting1?.date || '';
                break;
              case 'meeting1Attendees':
                rowData['Meeting 1 Attendees'] = meeting1?.meeting1?.attendees?.map(a => a.name).join(', ') || '';
                break;
              case 'meeting2Date':
                rowData['Meeting 2 Date'] = meeting1?.meeting2?.date || '';
                break;
              case 'meeting2Attendees':
                rowData['Meeting 2 Attendees'] = meeting1?.meeting2?.attendees?.map(a => a.name).join(', ') || '';
                break;
              case 'professionalJudgment':
                rowData['Professional Judgment'] = meeting1?.professionalJudgmentAchievingOutcomes ? 'Yes' : 'No';
                break;
              case 'meetingComments':
                rowData['Meeting Comments'] = meeting1?.overallComments || '';
                break;
            }
          });

          csvData.push(rowData);
        });
      });
    } else {
      // Family mode: Create one row per family (existing logic)
      csvData = familyEntries.map(([familyId, family]) => {
      const students = family.students ? Object.values(family.students) : [];
      const guardians = family.guardians ? Object.values(family.guardians) : [];
      const primaryGuardian = guardians.find(g => g.guardianType === 'primary_guardian') || guardians[0];
      const secondaryGuardians = guardians.filter(g => g.guardianType !== 'primary_guardian');
      
      // Get comprehensive status
      const status = familyStatuses[familyId] || {
        notificationForm: 'pending',
        programPlan: 'pending',
        citizenshipDocs: 'pending',
        paymentSetup: 'not_started',
        assistanceRequired: false
      };

      // Calculate funding information
      const fundingEligibleStudents = students.filter(s => s.fundingEligible);
      const totalFunding = students.reduce((sum, s) => sum + (s.fundingAmount || 0), 0);
      
      // Get meeting information
      const dbSchoolYear = activeSchoolYear.replace('/', '_');
      const facilitatorMeetings = family.FACILITATOR_MEETINGS?.[dbSchoolYear];
      const meetings = facilitatorMeetings ? Object.values(facilitatorMeetings) : [];
      const meeting1 = meetings[0];
      const meeting2 = meetings[1];

      // Build row data based on selected columns
      const rowData = {};
      
      selectedColumns.forEach(columnId => {
        switch(columnId) {
          // Family Information
          case 'familyId':
            rowData['Family ID'] = familyId;
            break;
          case 'familyName':
            rowData['Family Name'] = family.familyName || 'Unnamed Family';
            break;
          case 'status':
            rowData['Status'] = family.status || 'active';
            break;
          case 'createdAt':
            rowData['Created Date'] = family.createdAt ? new Date(family.createdAt).toLocaleDateString() : '';
            break;
          case 'lastUpdated':
            rowData['Last Updated'] = family.lastUpdated ? new Date(family.lastUpdated).toLocaleDateString() : '';
            break;
          case 'totalStudents':
            rowData['Total Students'] = students.length;
            break;
          case 'totalGuardians':
            rowData['Total Guardians'] = guardians.length;
            break;
            
          // Student Information
          case 'studentNames':
            rowData['Student Names'] = students.map(s => `${s.firstName} ${s.lastName}`).join('; ');
            break;
          case 'studentASNs':
            rowData['Student ASNs'] = students.map(s => s.asn || (s.readyForPASI ? 'Ready' : 'Missing')).join('; ');
            break;
          case 'studentGrades':
            rowData['Grades'] = students.map(s => s.grade || 'N/A').join('; ');
            break;
          case 'studentAges':
            rowData['Ages'] = students.map(s => {
              if (!s.birthday) return 'N/A';
              const age = calculateAge(s.birthday);
              return age !== null ? age : 'N/A';
            }).join('; ');
            break;
          case 'studentBirthdays':
            rowData['Birthdays'] = students.map(s => s.birthday || 'N/A').join('; ');
            break;
          case 'studentGenders':
            rowData['Genders'] = students.map(s => s.gender || 'N/A').join('; ');
            break;
          case 'studentEmails':
            rowData['Student Emails'] = students.map(s => s.email || 'N/A').join('; ');
            break;
          case 'studentPhones':
            rowData['Student Phones'] = students.map(s => s.phone || 'N/A').join('; ');
            break;
          case 'readyForPASI':
            rowData['Ready for PASI'] = students.map(s => s.readyForPASI ? 'Yes' : 'No').join('; ');
            break;
            
          // Guardian Information
          case 'primaryGuardianName':
            rowData['Primary Guardian'] = primaryGuardian ? `${primaryGuardian.firstName} ${primaryGuardian.lastName}` : '';
            break;
          case 'primaryGuardianEmail':
            rowData['Primary Email'] = primaryGuardian?.email || '';
            break;
          case 'primaryGuardianPhone':
            rowData['Primary Phone'] = primaryGuardian?.phone || '';
            break;
          case 'secondaryGuardianNames':
            rowData['Other Guardians'] = secondaryGuardians.map(g => `${g.firstName} ${g.lastName}`).join('; ');
            break;
          case 'secondaryGuardianEmails':
            rowData['Other Emails'] = secondaryGuardians.map(g => g.email).join('; ');
            break;
          case 'guardianRelations':
            rowData['Relations'] = guardians.map(g => g.relationToStudents || 'N/A').join('; ');
            break;
            
          // Facilitator Information
          case 'facilitatorName':
            rowData['Facilitator Name'] = family.facilitatorName || 'Unassigned';
            break;
          case 'facilitatorEmail':
            rowData['Facilitator Email'] = family.facilitatorEmail || 'Unassigned';
            break;
          case 'facilitatorAssignedDate':
            rowData['Facilitator Assigned'] = family.facilitatorAssignedAt ? new Date(family.facilitatorAssignedAt).toLocaleDateString() : '';
            break;
          case 'lastFacilitatorUpdate':
            rowData['Last Facilitator Update'] = family.lastFacilitatorUpdate ? new Date(family.lastFacilitatorUpdate).toLocaleDateString() : '';
            break;
            
          // Registration Status
          case 'schoolYear':
            rowData['School Year'] = activeSchoolYear;
            break;
          case 'notificationFormStatus':
            rowData['Notification Form'] = status.notificationForm;
            break;
          case 'educationPlanStatus':
            rowData['Education Plan'] = status.programPlan;
            break;
          case 'citizenshipDocsStatus':
            rowData['Citizenship Docs'] = status.citizenshipDocs;
            break;
          case 'paymentSetupStatus':
            rowData['Payment Setup'] = status.paymentSetup;
            break;
          case 'pasiRegistrationStatus':
            rowData['PASI Status'] = family.PASI_REGISTRATIONS?.[dbSchoolYear]?.status || 'pending';
            break;
          case 'overallRegistrationStatus':
            rowData['Overall Status'] = determineOverallStatus(status);
            break;
          case 'assistanceRequired':
            rowData['Assistance Required'] = status.assistanceRequired ? 'Yes' : 'No';
            break;
            
          // Address Information
          case 'streetAddress':
            rowData['Street Address'] = primaryGuardian?.address?.streetAddress || '';
            break;
          case 'city':
            rowData['City'] = primaryGuardian?.address?.city || '';
            break;
          case 'province':
            rowData['Province'] = primaryGuardian?.address?.province || '';
            break;
          case 'postalCode':
            rowData['Postal Code'] = primaryGuardian?.address?.postalCode || '';
            break;
          case 'country':
            rowData['Country'] = primaryGuardian?.address?.country || '';
            break;
          case 'fullAddress':
            rowData['Full Address'] = primaryGuardian?.address?.fullAddress || '';
            break;
            
          // Compliance Information
          case 'registrationDate':
            rowData['Registration Date'] = family.registrationDate || '';
            break;
          case 'acceptanceStatus':
            rowData['Acceptance Status'] = family.acceptanceStatus || '';
            break;
          case 'schoolCode':
            rowData['School Code'] = '2444';
            break;
          case 'authorityCode':
            rowData['Authority Code'] = '0402';
            break;
          case 'residentSchoolBoard':
            rowData['School Board'] = family.residentSchoolBoard || '';
            break;
          case 'aboriginalDeclaration':
            rowData['Aboriginal Declaration'] = family.aboriginalDeclaration || '';
            break;
          case 'francophoneEligible':
            rowData['Francophone'] = family.francophoneEligible || '';
            break;
            
          // Funding Information
          case 'fundingEligible':
            rowData['Funding Eligible'] = fundingEligibleStudents.length;
            break;
          case 'fundingAmounts':
            rowData['Funding Amounts'] = students.map(s => s.fundingAmount || 0).join('; ');
            break;
          case 'totalFunding':
            rowData['Total Funding'] = totalFunding;
            break;
            
          // Meeting Information
          case 'meeting1Date':
            rowData['Meeting 1 Date'] = meeting1?.meeting1?.date || '';
            break;
          case 'meeting1Attendees':
            rowData['Meeting 1 Attendees'] = meeting1?.meeting1?.attendees?.map(a => a.name).join(', ') || '';
            break;
          case 'meeting2Date':
            rowData['Meeting 2 Date'] = meeting1?.meeting2?.date || '';
            break;
          case 'meeting2Attendees':
            rowData['Meeting 2 Attendees'] = meeting1?.meeting2?.attendees?.map(a => a.name).join(', ') || '';
            break;
          case 'professionalJudgment':
            rowData['Professional Judgment'] = meeting1?.professionalJudgmentAchievingOutcomes ? 'Yes' : 'No';
            break;
          case 'meetingComments':
            rowData['Meeting Comments'] = meeting1?.overallComments || '';
            break;
        }
      });

      return rowData;
    });
    }

    // Convert to CSV
    if (csvData.length === 0) return;
    
    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          // Convert to string and escape quotes and wrap in quotes if contains comma
          const stringValue = String(value);
          return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') ? 
            `"${stringValue.replace(/"/g, '""')}"` : stringValue;
        }).join(',')
      )
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const modePrefix = exportMode === 'student' ? 'students' : 'families';
    link.download = `home_education_${modePrefix}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };
  
  // Helper function to determine overall status
  const determineOverallStatus = (status) => {
    if (status.notificationForm === 'submitted' && 
        status.programPlan === 'submitted' && 
        status.citizenshipDocs === 'completed') {
      return 'Complete';
    } else if (status.notificationForm === 'submitted') {
      return 'In Progress';
    } else {
      return 'Pending';
    }
  };

  // Check access permissions
  if (claimsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading permissions...</p>
        </div>
      </div>
    );
  }

  if (!isStaff || !hasPermission('staff')) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">
            <h3 className="font-medium">Access Denied</h3>
            <p className="mt-1">You don't have permission to access the Home Education Staff Dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading home education data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Current facilitator info */}
      {viewMode === 'my' && (
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-blue-700">
                Facilitator: {impersonatingFacilitator?.contact?.email || user?.email}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Notifications & Alerts */}
      {stats.partialFamilies > 0 && (
        <div className="mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-800">Attention Required</h3>
                <div className="mt-1 text-sm text-yellow-700">
                  <span className="block">
                    {stats.partialFamilies} famil{stats.partialFamilies === 1 ? 'y' : 'ies'} have incomplete registrations
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col gap-4">
          {/* Primary Search Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search families, students, guardians, ASNs, or facilitator emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex items-center space-x-2 px-4 py-2 border rounded-md transition-colors ${
                  showAdvancedFilters 
                    ? 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
              </button>
              {hasActiveFilters && (
                <button 
                  onClick={clearAllFilters}
                  className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                >
                  <FilterX className="w-4 h-4" />
                  <span>Clear All</span>
                </button>
              )}
              <button 
                onClick={() => setShowCSVColumnSelector(true)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                title={`Export ${Object.keys(filteredFamilies).length} families to CSV`}
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
              <button 
                onClick={() => setShowCategoryManager(true)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                title="Manage Categories"
              >
                <Tags className="w-4 h-4" />
                <span>Categories</span>
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Registration Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center">
                      Registration Status
                      <ClipboardCheck className="w-3 h-3 text-gray-500 ml-1" />
                    </span>
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="w-full p-2 border border-gray-300 rounded-md text-left focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white flex items-center justify-between"
                      >
                        <span>
                          {filters.registrationStatus?.length > 0 
                            ? `${filters.registrationStatus.length} selected`
                            : 'All Statuses'}
                        </span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64">
                      <DropdownMenuLabel>Registration Status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {[
                        { value: 'queue', label: 'Queue - Missing Notification', icon: Clock },
                        { value: 'ready', label: 'Ready for PASI', icon: ClipboardCheck },
                        { value: 'incomplete', label: 'Incomplete Registration', icon: AlertTriangle },
                        { value: 'completed', label: 'Fully Registered', icon: CheckCircle2 }
                      ].map(status => (
                        <DropdownMenuItem key={status.value} onSelect={(e) => e.preventDefault()}>
                          <Checkbox
                            checked={filters.registrationStatus.includes(status.value)}
                            onCheckedChange={(checked) => {
                              handleFilterChange('registrationStatus', 
                                checked
                                  ? [...filters.registrationStatus, status.value]
                                  : filters.registrationStatus.filter(s => s !== status.value)
                              );
                            }}
                            className="mr-2"
                          />
                          <div className="flex items-center gap-2">
                            {React.createElement(status.icon, { className: 'w-4 h-4' })}
                            <span>{status.label}</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                      {filters.registrationStatus.length > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => handleFilterChange('registrationStatus', [])}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Clear Selection
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Grade Level Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="w-full p-2 border border-gray-300 rounded-md text-left focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white flex items-center justify-between"
                      >
                        <span>
                          {filters.gradeLevel?.length > 0 
                            ? `${filters.gradeLevel.length} selected`
                            : 'All Grades'}
                        </span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64">
                      <DropdownMenuLabel>Grade Level</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {[
                        { value: 'k', label: 'Kindergarten' },
                        { value: 'elementary', label: 'Elementary (1-6)' },
                        { value: 'middle', label: 'Middle School (7-9)' },
                        { value: 'high', label: 'High School (10-12)' }
                      ].map(grade => (
                        <DropdownMenuItem key={grade.value} onSelect={(e) => e.preventDefault()}>
                          <Checkbox
                            checked={filters.gradeLevel.includes(grade.value)}
                            onCheckedChange={(checked) => {
                              handleFilterChange('gradeLevel', 
                                checked
                                  ? [...filters.gradeLevel, grade.value]
                                  : filters.gradeLevel.filter(g => g !== grade.value)
                              );
                            }}
                            className="mr-2"
                          />
                          <span>{grade.label}</span>
                        </DropdownMenuItem>
                      ))}
                      {filters.gradeLevel.length > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => handleFilterChange('gradeLevel', [])}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Clear Selection
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Facilitator Assignment Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Facilitator Assignment</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="w-full p-2 border border-gray-300 rounded-md text-left focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white flex items-center justify-between"
                      >
                        <span>
                          {filters.facilitatorAssigned?.length > 0 
                            ? `${filters.facilitatorAssigned.length} selected`
                            : 'All Families'}
                        </span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64">
                      <DropdownMenuLabel>Facilitator Status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Checkbox
                          checked={filters.facilitatorAssigned.includes('assigned')}
                          onCheckedChange={(checked) => {
                            handleFilterChange('facilitatorAssigned', 
                              checked
                                ? [...filters.facilitatorAssigned, 'assigned']
                                : filters.facilitatorAssigned.filter(f => f !== 'assigned')
                            );
                          }}
                          className="mr-2"
                        />
                        <span>Assigned Facilitator</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Checkbox
                          checked={filters.facilitatorAssigned.includes('unassigned')}
                          onCheckedChange={(checked) => {
                            handleFilterChange('facilitatorAssigned', 
                              checked
                                ? [...filters.facilitatorAssigned, 'unassigned']
                                : filters.facilitatorAssigned.filter(f => f !== 'unassigned')
                            );
                          }}
                          className="mr-2"
                        />
                        <span>No Facilitator</span>
                      </DropdownMenuItem>
                      {filters.facilitatorAssigned.length > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => handleFilterChange('facilitatorAssigned', [])}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Clear Selection
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Specific Facilitator Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Facilitator</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="w-full p-2 border border-gray-300 rounded-md text-left focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white flex items-center justify-between"
                      >
                        <span>
                          {filters.facilitatorEmails?.length > 0 
                            ? `${filters.facilitatorEmails.length} selected`
                            : 'All Facilitators'}
                        </span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 max-h-80 overflow-y-auto">
                      <DropdownMenuLabel>Select Facilitators</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {(() => {
                        // Get unique facilitator emails from families
                        const facilitatorEmails = new Set();
                        Object.values(families).forEach(family => {
                          if (family.facilitatorEmail) {
                            facilitatorEmails.add(family.facilitatorEmail);
                          }
                        });
                        const sortedFacilitators = Array.from(facilitatorEmails).sort();
                        
                        // Get facilitator info
                        const facilitators = getAllFacilitators();
                        
                        return sortedFacilitators.map(email => {
                          const facilitator = facilitators.find(f => f.email === email);
                          const displayName = facilitator ? `${facilitator.firstName} ${facilitator.lastName}` : email;
                          
                          return (
                            <DropdownMenuItem key={email} onSelect={(e) => e.preventDefault()}>
                              <Checkbox
                                checked={filters.facilitatorEmails.includes(email.toLowerCase())}
                                onCheckedChange={(checked) => {
                                  handleFilterChange('facilitatorEmails', 
                                    checked
                                      ? [...filters.facilitatorEmails, email.toLowerCase()]
                                      : filters.facilitatorEmails.filter(f => f !== email.toLowerCase())
                                  );
                                }}
                                className="mr-2"
                              />
                              <div className="flex flex-col">
                                <span className="text-sm">{displayName}</span>
                                {facilitator && (
                                  <span className="text-xs text-gray-500">{email}</span>
                                )}
                              </div>
                            </DropdownMenuItem>
                          );
                        });
                      })()}
                      {filters.facilitatorEmails.length > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => handleFilterChange('facilitatorEmails', [])}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Clear Selection
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Assistance Required Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assistance Required</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="w-full p-2 border border-gray-300 rounded-md text-left focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white flex items-center justify-between"
                      >
                        <span>
                          {filters.assistanceRequired?.length > 0 
                            ? `${filters.assistanceRequired.length} selected`
                            : 'All Families'}
                        </span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64">
                      <DropdownMenuLabel>Assistance Status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Checkbox
                          checked={filters.assistanceRequired.includes('yes')}
                          onCheckedChange={(checked) => {
                            handleFilterChange('assistanceRequired', 
                              checked
                                ? [...filters.assistanceRequired, 'yes']
                                : filters.assistanceRequired.filter(a => a !== 'yes')
                            );
                          }}
                          className="mr-2"
                        />
                        <span>Needs Assistance</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Checkbox
                          checked={filters.assistanceRequired.includes('no')}
                          onCheckedChange={(checked) => {
                            handleFilterChange('assistanceRequired', 
                              checked
                                ? [...filters.assistanceRequired, 'no']
                                : filters.assistanceRequired.filter(a => a !== 'no')
                            );
                          }}
                          className="mr-2"
                        />
                        <span>No Assistance Needed</span>
                      </DropdownMenuItem>
                      {filters.assistanceRequired.length > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => handleFilterChange('assistanceRequired', [])}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Clear Selection
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Missing ASN Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center">
                      ASN Status
                      <AlertTriangle className="w-3 h-3 text-amber-500 ml-1" />
                    </span>
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="w-full p-2 border border-gray-300 rounded-md text-left focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white flex items-center justify-between"
                      >
                        <span>
                          {filters.missingASN?.length > 0 
                            ? `${filters.missingASN.length} selected`
                            : 'All Families'}
                        </span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64">
                      <DropdownMenuLabel>ASN Status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Checkbox
                          checked={filters.missingASN.includes('yes')}
                          onCheckedChange={(checked) => {
                            handleFilterChange('missingASN', 
                              checked
                                ? [...filters.missingASN, 'yes']
                                : filters.missingASN.filter(m => m !== 'yes')
                            );
                          }}
                          className="mr-2"
                        />
                        <span>Missing ASN</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Checkbox
                          checked={filters.missingASN.includes('no')}
                          onCheckedChange={(checked) => {
                            handleFilterChange('missingASN', 
                              checked
                                ? [...filters.missingASN, 'no']
                                : filters.missingASN.filter(m => m !== 'no')
                            );
                          }}
                          className="mr-2"
                        />
                        <span>ASN Complete</span>
                      </DropdownMenuItem>
                      {filters.missingASN.length > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => handleFilterChange('missingASN', [])}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Clear Selection
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Location Filter Placeholder */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="w-full p-2 border border-gray-300 rounded-md text-left focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white flex items-center justify-between"
                      >
                        <span>
                          {filters.location?.length > 0 
                            ? `${filters.location.length} selected`
                            : 'All Locations'}
                        </span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64">
                      <DropdownMenuLabel>Location</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {[
                        { value: 'alberta', label: 'Alberta' },
                        { value: 'calgary', label: 'Calgary' },
                        { value: 'edmonton', label: 'Edmonton' },
                        { value: 'red-deer', label: 'Red Deer' }
                      ].map(location => (
                        <DropdownMenuItem key={location.value} onSelect={(e) => e.preventDefault()}>
                          <Checkbox
                            checked={filters.location.includes(location.value)}
                            onCheckedChange={(checked) => {
                              handleFilterChange('location', 
                                checked
                                  ? [...filters.location, location.value]
                                  : filters.location.filter(l => l !== location.value)
                              );
                            }}
                            className="mr-2"
                          />
                          <span>{location.label}</span>
                        </DropdownMenuItem>
                      ))}
                      {filters.location.length > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => handleFilterChange('location', [])}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Clear Selection
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Categories Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categories
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="w-full p-2 border border-gray-300 rounded-md text-left focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white flex items-center justify-between"
                      >
                        <span>
                          {filters.categories?.length > 0 
                            ? `${filters.categories.length} categories selected`
                            : 'Select categories'}
                        </span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 max-h-[400px] overflow-y-auto">
                      {/* By Facilitator */}
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Users className="h-4 w-4 mr-2" />
                          By Facilitator
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
                            {Object.entries(facilitatorCategories).map(([facilitatorEmail, categories]) => {
                              const availableCategories = Object.entries(categories)
                                .filter(([_, category]) => !category.archived)
                                .map(([categoryId, category]) => ({
                                  id: categoryId,
                                  ...category
                                }));

                              if (availableCategories.length === 0) return null;

                              return (
                                <DropdownMenuSub key={facilitatorEmail}>
                                  <DropdownMenuSubTrigger className="w-full">
                                    <div className="truncate">
                                      {facilitatorEmail.replace(',', '.')}
                                    </div>
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuPortal>
                                    <DropdownMenuSubContent>
                                      {availableCategories.map(category => {
                                        const isSelected = filters.categories?.some(cat => 
                                          cat[facilitatorEmail]?.[category.id]
                                        );
                                        
                                        return (
                                          <DropdownMenuItem
                                            key={category.id}
                                            onSelect={(e) => {
                                              e.preventDefault(); // Prevent menu close
                                              const newCategories = [...(filters.categories || [])];
                                              const existingIndex = newCategories.findIndex(cat => 
                                                cat[facilitatorEmail]?.[category.id]
                                              );
                                              
                                              if (!isSelected && existingIndex === -1) {
                                                newCategories.push({
                                                  [facilitatorEmail]: { [category.id]: category }
                                                });
                                              } else if (isSelected && existingIndex > -1) {
                                                newCategories.splice(existingIndex, 1);
                                              }
                                              
                                              handleFilterChange('categories', newCategories);
                                            }}
                                            className="hover:bg-gray-50"
                                          >
                                            <div className="flex items-center justify-between w-full">
                                              <div className="flex items-center">
                                                {category.icon && iconMap[category.icon] && 
                                                  React.createElement(iconMap[category.icon], { 
                                                    style: { color: category.color }, 
                                                    className: 'w-4 h-4 mr-2' 
                                                  })
                                                }
                                                <span>{category.name}</span>
                                              </div>
                                              {isSelected && (
                                                <Check className="w-4 h-4 ml-2" />
                                              )}
                                            </div>
                                          </DropdownMenuItem>
                                        );
                                      })}
                                    </DropdownMenuSubContent>
                                  </DropdownMenuPortal>
                                </DropdownMenuSub>
                              );
                            })}
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>

                      {/* By Type */}
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Grid2X2 className="h-4 w-4 mr-2" />
                          By Type
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
                            {categoryTypes && categoryTypes.map((type) => {
                              const categoriesOfType = [];
                              Object.entries(facilitatorCategories).forEach(([facilitatorEmail, categories]) => {
                                Object.entries(categories).forEach(([categoryId, category]) => {
                                  if (category.type === type.id && !category.archived) {
                                    categoriesOfType.push({
                                      ...category,
                                      id: categoryId,
                                      facilitatorEmail
                                    });
                                  }
                                });
                              });

                              if (categoriesOfType.length === 0) return null;

                              return (
                                <DropdownMenuSub key={type.id}>
                                  <DropdownMenuSubTrigger className="w-full">
                                    <div className="flex items-center">
                                      {type.icon && iconMap[type.icon] && 
                                        React.createElement(iconMap[type.icon], { 
                                          className: "h-4 w-4 mr-2 flex-shrink-0",
                                          style: { color: type.color }
                                        })
                                      }
                                      <span className="truncate">{type.name}</span>
                                    </div>
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuPortal>
                                    <DropdownMenuSubContent>
                                      {categoriesOfType.map(category => {
                                        const isSelected = filters.categories?.some(cat => 
                                          cat[category.facilitatorEmail]?.[category.id]
                                        );
                                        
                                        return (
                                          <DropdownMenuItem
                                            key={`${category.facilitatorEmail}-${category.id}`}
                                            onSelect={(e) => {
                                              e.preventDefault(); // Prevent menu close
                                              const newCategories = [...(filters.categories || [])];
                                              const existingIndex = newCategories.findIndex(cat => 
                                                cat[category.facilitatorEmail]?.[category.id]
                                              );
                                              
                                              if (!isSelected && existingIndex === -1) {
                                                newCategories.push({
                                                  [category.facilitatorEmail]: { [category.id]: category }
                                                });
                                              } else if (isSelected && existingIndex > -1) {
                                                newCategories.splice(existingIndex, 1);
                                              }
                                              
                                              handleFilterChange('categories', newCategories);
                                            }}
                                            className="hover:bg-gray-50"
                                          >
                                            <div className="flex items-center justify-between w-full">
                                              <div className="flex items-center">
                                                {category.icon && iconMap[category.icon] && 
                                                  React.createElement(iconMap[category.icon], { 
                                                    style: { color: category.color }, 
                                                    className: 'w-4 h-4 mr-2' 
                                                  })
                                                }
                                                <span className="truncate">{category.name}</span>
                                                <span className="ml-2 text-xs text-gray-500 flex-shrink-0">
                                                  ({category.facilitatorEmail.replace(',', '.')})
                                                </span>
                                              </div>
                                              {isSelected && (
                                                <Check className="w-4 h-4 ml-2" />
                                              )}
                                            </div>
                                          </DropdownMenuItem>
                                        );
                                      })}
                                    </DropdownMenuSubContent>
                                  </DropdownMenuPortal>
                                </DropdownMenuSub>
                              );
                            })}
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>

                      <DropdownMenuSeparator />
                      
                      {/* Clear Selection */}
                      {filters.categories?.length > 0 && (
                        <DropdownMenuItem
                          onSelect={() => handleFilterChange('categories', [])}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Clear Selection
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Following Alberta Programs Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center">
                      Alberta Programs
                      <BookOpenCheck className="w-3 h-3 text-gray-500 ml-1" />
                    </span>
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="w-full p-2 border border-gray-300 rounded-md text-left focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white flex items-center justify-between"
                      >
                        <span>
                          {filters.followsAlbertaPrograms?.length > 0 
                            ? `${filters.followsAlbertaPrograms.length} selected`
                            : 'All Families'}
                        </span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64">
                      <DropdownMenuLabel>Alberta Programs Status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Checkbox
                          checked={filters.followsAlbertaPrograms.includes('yes')}
                          onCheckedChange={(checked) => {
                            handleFilterChange('followsAlbertaPrograms', 
                              checked
                                ? [...filters.followsAlbertaPrograms, 'yes']
                                : filters.followsAlbertaPrograms.filter(f => f !== 'yes')
                            );
                          }}
                          className="mr-2"
                        />
                        <span>Following Alberta Programs</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Checkbox
                          checked={filters.followsAlbertaPrograms.includes('no')}
                          onCheckedChange={(checked) => {
                            handleFilterChange('followsAlbertaPrograms', 
                              checked
                                ? [...filters.followsAlbertaPrograms, 'no']
                                : filters.followsAlbertaPrograms.filter(f => f !== 'no')
                            );
                          }}
                          className="mr-2"
                        />
                        <span>Not Following Alberta Programs</span>
                      </DropdownMenuItem>
                      {filters.followsAlbertaPrograms.length > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => handleFilterChange('followsAlbertaPrograms', [])}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Clear Selection
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Alberta Courses Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center">
                      Alberta Courses
                      <BookOpen className="w-3 h-3 text-gray-500 ml-1" />
                    </span>
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="w-full p-2 border border-gray-300 rounded-md text-left focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white flex items-center justify-between"
                      >
                        <span>
                          {filters.albertaCourses?.length > 0 
                            ? `${filters.albertaCourses.length} courses`
                            : 'Select courses'}
                        </span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 max-h-[400px] overflow-y-auto">
                      <DropdownMenuLabel>Filter by Alberta Courses</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      {/* Group courses by grade level for better organization */}
                      {(() => {
                        const allCourses = getAllAlbertaCourses();
                        const coursesByGrade = {};
                        
                        // Group courses by grade
                        allCourses.forEach(course => {
                          const gradeKey = course.grade === 'K' ? 'Kindergarten' : 
                                          course.grade <= 6 ? `Grade ${course.grade}` :
                                          course.grade <= 9 ? `Grade ${course.grade}` :
                                          `Grade ${course.grade}`;
                          
                          if (!coursesByGrade[gradeKey]) {
                            coursesByGrade[gradeKey] = [];
                          }
                          coursesByGrade[gradeKey].push(course);
                        });
                        
                        return Object.entries(coursesByGrade).map(([grade, courses]) => (
                          <DropdownMenuSub key={grade}>
                            <DropdownMenuSubTrigger>
                              <GraduationCap className="h-4 w-4 mr-2" />
                              {grade}
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
                                {courses.map(course => {
                                  const isSelected = filters.albertaCourses?.includes(course.id);
                                  
                                  return (
                                    <DropdownMenuItem
                                      key={course.id}
                                      onSelect={(e) => {
                                        e.preventDefault();
                                        handleFilterChange('albertaCourses',
                                          isSelected
                                            ? filters.albertaCourses.filter(c => c !== course.id)
                                            : [...(filters.albertaCourses || []), course.id]
                                        );
                                      }}
                                      className="hover:bg-gray-50"
                                    >
                                      <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={(checked) => {
                                          handleFilterChange('albertaCourses',
                                            checked
                                              ? [...(filters.albertaCourses || []), course.id]
                                              : filters.albertaCourses.filter(c => c !== course.id)
                                          );
                                        }}
                                        className="mr-2"
                                      />
                                      <span className="flex-1">
                                        <span className="font-medium">{course.code}</span>
                                        {' - '}
                                        <span className="text-sm text-gray-600">{course.name}</span>
                                      </span>
                                    </DropdownMenuItem>
                                  );
                                })}
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                        ));
                      })()}
                      
                      {filters.albertaCourses?.length > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => handleFilterChange('albertaCourses', [])}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Clear All ({filters.albertaCourses.length} selected)
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                    <div className="flex flex-wrap gap-2">
                      {searchTerm && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Search: "{searchTerm}"
                          <button 
                            onClick={() => setSearchTerm('')}
                            className="ml-1 text-purple-600 hover:text-purple-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {Object.entries(filters).filter(([key, value]) => {
                        return Array.isArray(value) && value.length > 0;
                      }).map(([key, value]) => {
                        if (key === 'categories') {
                          return value.map((cat, index) => {
                            const [facilitatorEmail, categoryData] = Object.entries(cat)[0];
                            const [categoryId, category] = Object.entries(categoryData)[0];
                            return (
                              <span 
                                key={`${facilitatorEmail}-${categoryId}-${index}`} 
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                style={{ 
                                  backgroundColor: `${category.color}20`, 
                                  color: category.color 
                                }}
                              >
                                {category.icon && <span className="mr-1">{category.icon}</span>}
                                {category.name}
                                <button 
                                  onClick={() => {
                                    const newCategories = filters.categories.filter((_, i) => i !== index);
                                    handleFilterChange('categories', newCategories);
                                  }}
                                  className="ml-1 hover:opacity-70"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            );
                          });
                        } else if (key === 'albertaCourses') {
                          return (
                            <span key={key} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {value.length} courses selected
                              <button 
                                onClick={() => handleFilterChange(key, [])}
                                className="ml-1 text-green-600 hover:text-green-800"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          );
                        } else {
                          const labelMap = {
                            registrationStatus: 'Status',
                            gradeLevel: 'Grade',
                            location: 'Location',
                            facilitatorAssigned: 'Facilitator',
                            assistanceRequired: 'Assistance',
                            missingASN: 'ASN',
                            followsAlbertaPrograms: 'Alberta Programs'
                          };
                          
                          return (
                            <span key={key} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {labelMap[key] || key}: {value.length} selected
                              <button 
                                onClick={() => handleFilterChange(key, [])}
                                className="ml-1 text-blue-600 hover:text-blue-800"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          );
                        }
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {Object.keys(filteredFamilies).length} of {stats.totalFamilies} families ({
            Object.values(filteredFamilies).reduce((total, family) => {
              const students = family.students ? Object.values(family.students) : [];
              return total + students.length;
            }, 0)
          } students)
        </p>
      </div>

      {/* Families Display */}
      <FamilyTable
        families={filteredFamilies}
        onViewDashboard={handleViewDashboard}
        onManageFamily={handleManageFamily}
        onDocumentReview={handleDocumentReview}
        currentUserEmail={user?.email}
        impersonatedEmail={impersonatingFacilitator?.contact?.email}
        isAdmin={isAdmin}
        onOpenEmailSheet={(selectedFamilies) => {
          setSelectedFamiliesForEmail(selectedFamilies);
          setShowEmailSheet(true);
        }}
        facilitatorCategories={facilitatorCategories}
        categoryTypes={categoryTypes}
      />

      {/* Empty State */}
      {Object.keys(filteredFamilies).length === 0 && !loading && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No families found' : 'No families registered yet'}
          </h3>
          <p className="text-gray-600">
            {searchTerm 
              ? 'Try adjusting your search terms to find what you\'re looking for.'
              : 'Families will appear here once they complete their registration through RTD Connect.'
            }
          </p>
        </div>
      )}

      {/* Family Details Modal */}
      <FamilyDetailsModal
        family={selectedFamily}
        familyId={selectedFamilyId}
        isOpen={showDetailsModal}
        onClose={handleCloseModal}
      />

      {/* Family Dashboard View Modal (kept for compatibility) */}
      <FamilyDashboardModal
        family={selectedFamily}
        familyId={selectedFamilyId}
        isOpen={showDashboardModal}
        onClose={handleCloseDashboardModal}
      />

      {/* Dashboard Sheet - New resizable sheet implementation */}
      <DashboardSheet
        family={dashboardSheetFamily}
        familyId={dashboardSheetFamilyId}
        isOpen={showDashboardSheet}
        onClose={handleCloseDashboardSheet}
      />

      {/* Family Management Modal */}
      <FamilyManagementModal
        family={selectedFamily}
        familyId={selectedFamilyId}
        isOpen={showManagementModal}
        onClose={handleCloseManagementModal}
        action={managementAction}
      />

      {/* Email Sheet */}
      <Sheet open={showEmailSheet} onOpenChange={setShowEmailSheet}>
        <SheetContent 
          className="w-full sm:max-w-2xl overflow-hidden p-0" 
          side="right"
        >
          <FamilyMessaging
            selectedFamilies={selectedFamiliesForEmail}
            families={families}
            onClose={() => {
              setShowEmailSheet(false);
              setSelectedFamiliesForEmail(new Set()); // Clear selection after sending
            }}
          />
        </SheetContent>
      </Sheet>

      {/* Document Review Sheet */}
      <StaffDocumentReview
        isOpen={showDocumentReview}
        onOpenChange={(open) => {
          setShowDocumentReview(open);
          // The sheet has closed, statuses will be updated via realtime listeners
        }}
        familyId={documentReviewFamilyId}
        familyData={documentReviewFamily}
      />

      {/* CSV Column Selector Modal */}
      <CSVColumnSelector
        isOpen={showCSVColumnSelector}
        onClose={() => setShowCSVColumnSelector(false)}
        onExport={handleExportFamilies}
        families={filteredFamilies}
        schoolYear={activeSchoolYear}
      />

      {/* Category Manager Sheet */}
      <Sheet open={showCategoryManager} onOpenChange={setShowCategoryManager}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Manage Categories</SheetTitle>
            <SheetDescription>
              Create and manage categories to organize families
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <HomeEducationCategoryManager
              onCategoryChange={(updatedCategories) => {
                // Categories are already being updated via the real-time listener
                // No need to reload here to avoid infinite loops
                console.log('Categories updated:', updatedCategories?.length);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default HomeEducationStaffDashboard;