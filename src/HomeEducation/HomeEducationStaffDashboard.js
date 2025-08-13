import React, { useState, useEffect, useMemo } from 'react';
import { getDatabase, ref, onValue, off, query, orderByChild, equalTo, get, update } from 'firebase/database';
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
  FilterX,
  Settings,
  UserPlus,
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
  HelpCircle
} from 'lucide-react';
import { 
  getCurrentSchoolYear, 
  getActiveSeptemberCount, 
  formatImportantDate,
  getAllSeptemberCountDates,
  getOpenRegistrationSchoolYear,
  getAllOpenRegistrationSchoolYears
} from '../config/importantDates';
import { formatDateForDisplay } from '../utils/timeZoneUtils';
import RTDConnectDashboard from '../RTDConnect/Dashboard';
import { getAllFacilitators, getFacilitatorByEmail } from '../config/facilitators';
import FacilitatorSelector from './FacilitatorSelector';
import { useNavigate } from 'react-router-dom';
import FamilyNotesModal from './FamilyNotes/FamilyNotesModal';
import FamilyNotesIcon from './FamilyNotes/FamilyNotesIcon';
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
} from '../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

// Comprehensive Status Badge Component
const ComprehensiveStatusBadge = ({ statuses, assistanceRequired = false, familyId, onToggleAssistance }) => {
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
            <div className={`p-1 rounded relative ${getStatusColor(statuses.citizenshipDocs)}`}>
              <UserCheck className="w-3.5 h-3.5" />
              {statuses.citizenshipDocs === 'pending_review' && (
                <div className="absolute -top-1 -right-1 bg-orange-500 rounded-full p-0.5">
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

// Family Table Component
const FamilyTable = ({ families, onViewDashboard, onManageFamily, currentUserEmail, impersonatedEmail, isAdmin }) => {
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [familyStatuses, setFamilyStatuses] = useState({});
  const [loadingStatuses, setLoadingStatuses] = useState(true);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [selectedNotesFamily, setSelectedNotesFamily] = useState(null);
  const [selectedNotesFamilyId, setSelectedNotesFamilyId] = useState(null);
  const [togglingAssistance, setTogglingAssistance] = useState({});
  
  // Bulk selection state
  const [selectedFamilies, setSelectedFamilies] = useState(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [showBulkConfirmDialog, setShowBulkConfirmDialog] = useState(false);
  const [pendingBulkAction, setPendingBulkAction] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('active');
  
  // Determine active school year
  const currentYear = getCurrentSchoolYear();
  const openRegistrationYear = getOpenRegistrationSchoolYear();
  const activeSchoolYear = openRegistrationYear || currentYear;
  const dbSchoolYear = activeSchoolYear.replace('/', '_'); // Convert 25/26 to 25_26
  
  const effectiveEmail = impersonatedEmail || currentUserEmail;

  // Fetch comprehensive status data for all families
  useEffect(() => {
    const fetchFamilyStatuses = async () => {
      setLoadingStatuses(true);
      const db = getDatabase();
      const statuses = {};

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
              
              if (docsData.completionStatus === 'completed' && !docsData.requiresStaffReview) {
                // Document is complete
              } else if (docsData.requiresStaffReview || docsData.staffReviewRequired) {
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

    if (Object.keys(families).length > 0) {
      fetchFamilyStatuses();
    } else {
      setLoadingStatuses(false);
    }
  }, [families, dbSchoolYear]);

  // Process families data for table display
  const familyRows = useMemo(() => {
    return Object.entries(families).map(([familyId, family]) => {
      const students = family.students ? Object.values(family.students) : [];
      const guardians = family.guardians ? Object.values(family.guardians) : [];
      const primaryGuardian = guardians.find(g => g.guardianType === 'primary_guardian') || guardians[0];
      
      // Get grade range
      const grades = students.map(s => s.grade).filter(Boolean);
      const gradeRange = grades.length > 0 ? 
        (grades.length === 1 ? `Grade ${grades[0]}` : `Grades ${Math.min(...grades)}-${Math.max(...grades)}`) : 
        'No grades';

      // Get comprehensive status for this family
      const comprehensiveStatus = familyStatuses[familyId] || {
        notificationForm: 'pending',
        programPlan: 'pending',
        citizenshipDocs: 'pending',
        paymentSetup: 'not_started',
        assistanceRequired: false
      };

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
        comprehensiveStatus,
        lastUpdated: family.lastUpdated || family.createdAt,
        city: primaryGuardian?.address?.city || '',
        rawFamily: family
      };
    });
  }, [families, effectiveEmail, familyStatuses]);

  // Sort functionality
  const sortedRows = useMemo(() => {
    if (!sortConfig.key) return familyRows;
    
    return [...familyRows].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [familyRows, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Bulk selection handlers
  const handleSelectFamily = (familyId) => {
    const newSelection = new Set(selectedFamilies);
    if (newSelection.has(familyId)) {
      newSelection.delete(familyId);
    } else {
      newSelection.add(familyId);
    }
    setSelectedFamilies(newSelection);
    
    // Update "select all" state if needed
    if (newSelection.size === 0) {
      setIsAllSelected(false);
    } else if (newSelection.size === sortedRows.length) {
      setIsAllSelected(true);
    }
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      // Deselect all
      setSelectedFamilies(new Set());
      setIsAllSelected(false);
    } else {
      // Select all visible families
      const allFamilyIds = sortedRows.map(row => row.familyId);
      setSelectedFamilies(new Set(allFamilyIds));
      setIsAllSelected(true);
    }
  };

  const clearSelection = () => {
    setSelectedFamilies(new Set());
    setIsAllSelected(false);
  };

  // Bulk action handlers
  const handleBulkSetAssistance = (value) => {
    setPendingBulkAction({ type: 'setAssistance', value });
    setShowBulkConfirmDialog(true);
  };

  const handleBulkSetStatus = (status) => {
    setPendingBulkAction({ type: 'setStatus', status });
    setShowBulkConfirmDialog(true);
  };

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

  const handleViewDashboard = (familyId, family) => {
    // Call the parent's onViewDashboard to open the sheet
    onViewDashboard(familyId, family);
  };

  const handleOpenNotes = (familyId, family) => {
    setSelectedNotesFamilyId(familyId);
    setSelectedNotesFamily(family);
    setNotesModalOpen(true);
  };

  // Handle toggling assistance required status
  const handleToggleAssistance = async (familyId, newValue) => {
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
  };



  // Bulk Actions Toolbar Component
  const BulkActionsToolbar = () => {
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
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <BulkActionsToolbar />
      
      {/* Add spacing when toolbar is visible */}
      {selectedFamilies.size > 0 && <div className="h-14" />}
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all families"
              />
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('familyName')}
            >
              <div className="flex items-center space-x-1">
                <span>Family Name</span>
                {sortConfig.key === 'familyName' && (
                  <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                )}
              </div>
            </TableHead>
            <TableHead>Primary Guardian</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('studentCount')}
            >
              <div className="flex items-center space-x-1">
                <span>Students</span>
                {sortConfig.key === 'studentCount' && (
                  <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                )}
              </div>
            </TableHead>
            <TableHead>Grades</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('facilitatorEmail')}
            >
              <div className="flex items-center space-x-1">
                <span>Facilitator</span>
                {sortConfig.key === 'facilitatorEmail' && (
                  <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                )}
              </div>
            </TableHead>
            <TableHead>
              <span>Status</span>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('lastUpdated')}
            >
              <div className="flex items-center space-x-1">
                <span>Last Activity</span>
                {sortConfig.key === 'lastUpdated' && (
                  <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                )}
              </div>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                No families found
              </TableCell>
            </TableRow>
          ) : (
            sortedRows.map((row) => {
              const isSelected = selectedFamilies.has(row.familyId);
              return (
                <TableRow 
                  key={row.familyId}
                  className={`${
                    isSelected 
                      ? 'bg-blue-50 hover:bg-blue-100' 
                      : row.isMyFamily 
                        ? 'bg-purple-50 hover:bg-purple-100' 
                        : 'hover:bg-gray-50'
                  }`}
                >
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleSelectFamily(row.familyId)}
                      aria-label={`Select ${row.familyName}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                  {row.familyName}
                  {row.isMyFamily && (
                    <span className="ml-2 text-xs text-purple-600">(My Family)</span>
                  )}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="text-sm font-medium">{row.primaryGuardian}</div>
                    <div className="text-xs text-gray-500">{row.guardianEmail}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <GraduationCap className="w-4 h-4 text-blue-500" />
                    <span>{row.studentCount}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{row.gradeRange}</TableCell>
                <TableCell>
                  <FacilitatorSelector
                    family={row.rawFamily}
                    familyId={row.familyId}
                    isAdmin={isAdmin}
                    currentUserEmail={effectiveEmail}
                    isMyFamily={row.isMyFamily}
                  />
                </TableCell>
                <TableCell>
                  {loadingStatuses ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  ) : togglingAssistance[row.familyId] ? (
                    <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
                  ) : (
                    <ComprehensiveStatusBadge 
                      statuses={row.comprehensiveStatus} 
                      assistanceRequired={row.comprehensiveStatus.assistanceRequired}
                      familyId={row.familyId}
                      onToggleAssistance={handleToggleAssistance}
                    />
                  )}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {row.lastUpdated ? new Date(row.lastUpdated).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleViewDashboard(row.familyId, row.rawFamily)}
                      className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                      title="View Dashboard"
                    >
                      <PanelRightOpen className="w-4 h-4" />
                    </button>
                    <FamilyNotesIcon
                      familyId={row.familyId}
                      onClick={() => handleOpenNotes(row.familyId, row.rawFamily)}
                    />
                  </div>
                </TableCell>
              </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
      
    {/* Family Notes Modal */}
    <FamilyNotesModal
      isOpen={notesModalOpen}
      onClose={() => setNotesModalOpen(false)}
      family={selectedNotesFamily}
      familyId={selectedNotesFamilyId}
    />
    
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
  showMyFamiliesOnly = false,
  setShowMyFamiliesOnly = () => {},
  impersonatingFacilitator = null,
  setImpersonatingFacilitator = () => {},
  showImpersonationDropdown = false,
  setShowImpersonationDropdown = () => {},
  statusFilter = 'active',
  setStatusFilter = () => {},
  homeEducationStats = { totalFamilies: 0, myFamilies: 0 },
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
  const [activeSchoolYear, setActiveSchoolYear] = useState('');
  const [filters, setFilters] = useState({
    registrationStatus: 'all', // all, completed, partial, pending
    gradeLevel: 'all', // all, k, elementary, middle, high
    location: 'all', // all, specific provinces/cities
    facilitatorAssigned: 'all', // all, assigned, unassigned
    assistanceRequired: 'all' // all, yes, no
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

  // Initialize active school year
  useEffect(() => {
    const currentYear = getCurrentSchoolYear();
    const openRegistrationYear = getOpenRegistrationSchoolYear();
    const targetSchoolYear = openRegistrationYear || currentYear;
    setActiveSchoolYear(targetSchoolYear);
    console.log('Active school year set to:', targetSchoolYear);
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
              
              if (docsData.completionStatus === 'completed' && !docsData.requiresStaffReview) {
                // Document is complete
              } else if (docsData.requiresStaffReview || docsData.staffReviewRequired) {
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
      console.log('Family statuses loaded:', statuses);
    };

    fetchFamilyStatuses();
  }, [families, activeSchoolYear]);

  // Load families data
  useEffect(() => {
    if (!user || claimsLoading) return;

    const db = getDatabase();
    
    // Always use a query to filter by status - never load all families
    const familiesRef = query(
      ref(db, 'homeEducationFamilies/familyInformation'),
      orderByChild('status'),
      equalTo(statusFilter)
    );

    const unsubscribe = onValue(familiesRef, (snapshot) => {
      if (snapshot.exists()) {
        const familiesData = snapshot.val();
        setFamilies(familiesData);
        
        // Calculate statistics
        const familyEntries = Object.entries(familiesData);
        const currentYear = getCurrentSchoolYear();
        // Use impersonated facilitator email if set, otherwise use actual user email
        const effectiveEmail = impersonatingFacilitator?.contact?.email || user?.email;
        
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
        
        // Update header stats
        if (setHomeEducationStats) {
          setHomeEducationStats({
            totalFamilies: familyEntries.length,
            myFamilies
          });
        }
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
        
        // Update header stats
        if (setHomeEducationStats) {
          setHomeEducationStats({
            totalFamilies: 0,
            myFamilies: 0
          });
        }
      }
      setLoading(false);
    }, (error) => {
      console.error('Error loading families data:', error);
      setLoading(false);
    });

    return () => {
      off(familiesRef, 'value', unsubscribe);
    };
  }, [user, claimsLoading, impersonatingFacilitator, statusFilter]);

  // Filter families based on all criteria
  const filteredFamilies = useMemo(() => {
    let result = families;
    // Use impersonated facilitator email if set, otherwise use actual user email
    const effectiveEmail = impersonatingFacilitator?.contact?.email || user?.email;
    const currentYear = getCurrentSchoolYear();

    // Apply facilitator filter first (most restrictive)
    if (showMyFamiliesOnly && effectiveEmail) {
      result = Object.fromEntries(
        Object.entries(result).filter(([familyId, family]) => 
          family.facilitatorEmail === effectiveEmail
        )
      );
    }

    // Apply advanced filters
    result = Object.fromEntries(
      Object.entries(result).filter(([familyId, family]) => {
        // Registration Status Filter
        if (filters.registrationStatus !== 'all') {
          const students = family.students ? Object.values(family.students) : [];
          const forms = family.NOTIFICATION_FORMS?.[currentYear] || {};
          const hasFormsForAllStudents = students.length > 0 && students.every(student => 
            forms[student.id] && forms[student.id].submissionStatus === 'submitted'
          );
          const hasAnyForms = Object.keys(forms).length > 0;

          if (filters.registrationStatus === 'completed' && !hasFormsForAllStudents) return false;
          if (filters.registrationStatus === 'partial' && (hasFormsForAllStudents || !hasAnyForms)) return false;
          if (filters.registrationStatus === 'pending' && hasAnyForms) return false;
        }

        // Grade Level Filter
        if (filters.gradeLevel !== 'all') {
          const students = family.students ? Object.values(family.students) : [];
          const hasMatchingGrade = students.some(student => {
            const grade = student.grade?.toString().toLowerCase();
            if (filters.gradeLevel === 'k') return grade === 'k' || grade === 'kindergarten' || grade === '0';
            if (filters.gradeLevel === 'elementary') return ['1', '2', '3', '4', '5', '6'].includes(grade);
            if (filters.gradeLevel === 'middle') return ['7', '8', '9'].includes(grade);
            if (filters.gradeLevel === 'high') return ['10', '11', '12'].includes(grade);
            return false;
          });
          if (!hasMatchingGrade) return false;
        }

        // Facilitator Assignment Filter
        if (filters.facilitatorAssigned !== 'all') {
          const hasAssignedFacilitator = !!family.facilitatorEmail;
          if (filters.facilitatorAssigned === 'assigned' && !hasAssignedFacilitator) return false;
          if (filters.facilitatorAssigned === 'unassigned' && hasAssignedFacilitator) return false;
        }

        // Assistance Required Filter
        if (filters.assistanceRequired !== 'all') {
          const familyStatus = familyStatuses[familyId];
          const hasAssistanceRequired = familyStatus?.assistanceRequired || false;
          if (filters.assistanceRequired === 'yes' && !hasAssistanceRequired) return false;
          if (filters.assistanceRequired === 'no' && hasAssistanceRequired) return false;
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
  }, [families, searchTerm, showMyFamiliesOnly, filters, user?.email, impersonatingFacilitator]);

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
      registrationStatus: 'all',
      gradeLevel: 'all',
      location: 'all',
      facilitatorAssigned: 'all',
      assistanceRequired: 'all'
    });
    setSearchTerm('');
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== 'all') || searchTerm.trim();

  // Export functionality
  const handleExportFamilies = () => {
    const familyEntries = Object.entries(filteredFamilies);
    
    const csvData = familyEntries.map(([familyId, family]) => {
      const students = family.students ? Object.values(family.students) : [];
      const guardians = family.guardians ? Object.values(family.guardians) : [];
      const primaryGuardian = guardians.find(g => g.guardianType === 'primary_guardian') || guardians[0];
      
      // Get comprehensive status
      const status = familyStatuses[familyId] || {
        notificationForm: 'pending',
        programPlan: 'pending',
        citizenshipDocs: 'pending',
        paymentSetup: 'not_started'
      };

      return {
        'Family ID': familyId,
        'Family Name': family.familyName || 'Unnamed Family',
        'Primary Guardian': primaryGuardian ? `${primaryGuardian.firstName} ${primaryGuardian.lastName}` : '',
        'Guardian Email': primaryGuardian?.email || '',
        'Guardian Phone': primaryGuardian?.phone || '',
        'City': primaryGuardian?.address?.city || '',
        'Province': primaryGuardian?.address?.province || '',
        'Student Count': students.length,
        'Guardian Count': guardians.length,
        'Facilitator Email': family.facilitatorEmail || 'Unassigned',
        'Notification Form': status.notificationForm,
        'Program Plan': status.programPlan,
        'Citizenship Docs': status.citizenshipDocs,
        'Payment Setup': status.paymentSetup,
        'Last Updated': family.lastUpdated ? new Date(family.lastUpdated).toLocaleDateString() : '',
        'Created Date': family.createdAt ? new Date(family.createdAt).toLocaleDateString() : ''
      };
    });

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
          return stringValue.includes(',') || stringValue.includes('"') ? 
            `"${stringValue.replace(/"/g, '""')}"` : stringValue;
        }).join(',')
      )
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `home_education_families_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
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
      {showMyFamiliesOnly && (
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
                <span>Advanced Filters</span>
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
                onClick={handleExportFamilies}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                title={`Export ${Object.keys(filteredFamilies).length} families to CSV`}
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Registration Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration Status</label>
                  <select
                    value={filters.registrationStatus}
                    onChange={(e) => handleFilterChange('registrationStatus', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="partial">Partial</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                {/* Grade Level Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
                  <select
                    value={filters.gradeLevel}
                    onChange={(e) => handleFilterChange('gradeLevel', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Grades</option>
                    <option value="k">Kindergarten</option>
                    <option value="elementary">Elementary (1-6)</option>
                    <option value="middle">Middle School (7-9)</option>
                    <option value="high">High School (10-12)</option>
                  </select>
                </div>

                {/* Facilitator Assignment Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Facilitator Assignment</label>
                  <select
                    value={filters.facilitatorAssigned}
                    onChange={(e) => handleFilterChange('facilitatorAssigned', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Families</option>
                    <option value="assigned">Assigned Facilitator</option>
                    <option value="unassigned">No Facilitator</option>
                  </select>
                </div>

                {/* Assistance Required Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assistance Required</label>
                  <select
                    value={filters.assistanceRequired}
                    onChange={(e) => handleFilterChange('assistanceRequired', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Families</option>
                    <option value="yes">Needs Assistance</option>
                    <option value="no">No Assistance Needed</option>
                  </select>
                </div>

                {/* Location Filter Placeholder */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Locations</option>
                    <option value="alberta">Alberta</option>
                    <option value="calgary">Calgary</option>
                    <option value="edmonton">Edmonton</option>
                    <option value="red-deer">Red Deer</option>
                  </select>
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
                      {Object.entries(filters).filter(([_, value]) => value !== 'all').map(([key, value]) => (
                        <span key={key} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {key}: {value}
                          <button 
                            onClick={() => handleFilterChange(key, 'all')}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
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
        currentUserEmail={user?.email}
        impersonatedEmail={impersonatingFacilitator?.contact?.email}
        isAdmin={isAdmin}
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
    </div>
  );
};

export default HomeEducationStaffDashboard;