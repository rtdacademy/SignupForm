import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDatabase, ref, get, set, push, onValue, off, update } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { useNavigate } from 'react-router-dom';
import { toDateString, toEdmontonDate, calculateAge, formatDateForDisplay } from '../utils/timeZoneUtils';
import { Users, DollarSign, FileText, Home, AlertCircle, CheckCircle2, ArrowRight, GraduationCap, Heart, Shield, User, Phone, MapPin, Edit3, ChevronDown, LogOut, Plus, UserPlus, Calendar, Hash, X, Settings, Loader2, Crown, UserCheck, Clock, AlertTriangle, Info, Upload, Menu, Download } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../components/ui/sheet';
import AddressPicker from '../components/AddressPicker';
import FamilyCreationSheet from './FamilyCreationSheet';
import HomeEducationNotificationFormV2 from './HomeEducationNotificationFormV2';
import StudentCitizenshipDocuments from '../components/StudentCitizenshipDocuments';
import SOLOEducationPlanForm from './SOLOEducationPlanForm';
import FacilitatorSelection from './FacilitatorSelection';
import ReimbursementSubmissionForm from './ReimbursementSubmissionForm';
import ReceiptUploadForm from './ReceiptUploadForm';
import StudentBudgetCard from './StudentBudgetCard';
import FamilyBudgetOverview from './FamilyBudgetOverview';
import AcceptanceLetterDialog from './AcceptanceLetterDialog';
import Toast from '../components/Toast';
import FormCompletionBadge, { CompactFormCompletionBadge } from '../components/FormCompletionBadge';
import { 
  EmbeddedAccountManagement, 
  EmbeddedNotificationBanner, 
  EmbeddedPayouts 
} from '../components/ConnectEmbeddedComponents';
import { 
  getCurrentSchoolYear, 
  getActiveSeptemberCount, 
  formatImportantDate, 
  hasSeptemberCountPassed,
  getAllSeptemberCountDates,
  isRegistrationOpen,
  getOpenRegistrationSchoolYear,
  getAllOpenRegistrationSchoolYears,
  getRegistrationOpenDateForYear,
  getSeptemberCountForYear
} from '../config/importantDates';
import { FUNDING_RATES } from '../config/HomeEducation';
import { getFacilitatorById, getFacilitatorByEmail, getFacilitatorProfileUrl } from '../config/facilitators';
import { generatePartCData } from '../config/signatures';

// Helper function to check if a form is complete (has all required parts)
const isFormComplete = (formData) => {
  return !!(
    formData?.PART_A && 
    formData?.PART_B?.declaration && 
    formData?.PART_C?.acceptanceStatus
  );
};

// Helper function to determine form status including completeness
const determineFormStatus = (formData) => {
  if (!formData) return 'pending';
  
  const isComplete = isFormComplete(formData);
  const isSubmitted = formData.submissionStatus === 'submitted';
  
  if (isSubmitted && isComplete) {
    return 'submitted';
  } else if (isSubmitted && !isComplete) {
    return 'incomplete';
  } else if (isComplete && !isSubmitted) {
    return 'draft-complete';
  } else {
    return 'draft';
  }
};

// Helper function to calculate student budget based on grade
const calculateStudentBudget = (grade) => {
  // Convert grade to normalized format for comparison
  const gradeStr = grade?.toString().toLowerCase().trim();
  
  // Check for kindergarten variations
  if (gradeStr === 'k' || 
      gradeStr === 'kindergarten' || 
      gradeStr === '0' ||
      gradeStr === 'kg') {
    return FUNDING_RATES.KINDERGARTEN.amount; // $450.50
  } else {
    return FUNDING_RATES.GRADES_1_TO_12.amount; // $901.00
  }
};

// Helper function to get funding type for display
const getFundingType = (grade) => {
  const gradeStr = grade?.toString().toLowerCase().trim();
  
  if (gradeStr === 'k' || 
      gradeStr === 'kindergarten' || 
      gradeStr === '0' ||
      gradeStr === 'kg') {
    return {
      type: 'kindergarten',
      label: 'Kindergarten',
      formatted: FUNDING_RATES.KINDERGARTEN.formatted
    };
  } else {
    return {
      type: 'grades_1_12',
      label: 'Grades 1-12',
      formatted: FUNDING_RATES.GRADES_1_TO_12.formatted
    };
  }
};

// Helper function to check if a student has completed all required forms
const checkStudentFormCompletion = (student, formStatuses, docStatuses, soloStatuses, activeSchoolYear) => {
  if (!student?.id) {
    return {
      isComplete: false,
      missing: ['student-data'],
      completionPercentage: 0
    };
  }

  const missing = [];
  let completed = 0;
  const totalRequiredForms = 3; // Notification Form, Citizenship Docs, SOLO Plan

  // Check Home Education Notification Form
  const notificationFormStatus = formStatuses[student.id]?.[activeSchoolYear] || formStatuses[student.id]?.current || 'pending';
  if (notificationFormStatus !== 'submitted') {
    missing.push('notification-form');
  } else {
    completed++;
  }

  // Check Citizenship Documents
  const citizenshipDocsStatus = docStatuses[student.id]?.status || 'pending';
  if (citizenshipDocsStatus !== 'completed') {
    missing.push('citizenship-docs');
  } else {
    completed++;
  }

  // Check SOLO Education Plan
  const soloStatus = soloStatuses[student.id]?.status || 'pending';
  if (soloStatus !== 'submitted') {
    missing.push('solo-plan');
  } else {
    completed++;
  }

  return {
    isComplete: missing.length === 0,
    missing: missing,
    completionPercentage: Math.round((completed / totalRequiredForms) * 100),
    completedForms: completed,
    totalRequiredForms: totalRequiredForms
  };
};

// Helper function to determine payment eligibility for a specific student
const getStudentPaymentEligibility = (student, formStatuses, docStatuses, soloStatuses, activeSchoolYear) => {
  const completion = checkStudentFormCompletion(student, formStatuses, docStatuses, soloStatuses, activeSchoolYear);
  
  return {
    ...completion,
    canAccessPayments: completion.isComplete,
    restrictionReason: completion.isComplete ? null : 'incomplete-forms',
    missingForms: completion.missing,
    studentName: `${student.firstName} ${student.lastName}`
  };
};

// Helper function to determine family-level payment access
const getFamilyPaymentEligibility = (students, formStatuses, docStatuses, soloStatuses, activeSchoolYear) => {
  if (!students || students.length === 0) {
    return {
      canAccessPayments: false,
      allStudentsComplete: false,
      restrictionReason: 'no-students',
      studentsWithAccess: [],
      studentsWithoutAccess: [],
      completionPercentage: 0
    };
  }

  const eligibilityResults = students.map(student => 
    getStudentPaymentEligibility(student, formStatuses, docStatuses, soloStatuses, activeSchoolYear)
  );

  const studentsWithAccess = eligibilityResults.filter(result => result.canAccessPayments);
  const studentsWithoutAccess = eligibilityResults.filter(result => !result.canAccessPayments);
  
  const allStudentsComplete = studentsWithoutAccess.length === 0;
  const someStudentsComplete = studentsWithAccess.length > 0;
  
  // Calculate overall completion percentage
  const totalForms = eligibilityResults.reduce((sum, result) => sum + result.totalRequiredForms, 0);
  const completedForms = eligibilityResults.reduce((sum, result) => sum + result.completedForms, 0);
  const completionPercentage = totalForms > 0 ? Math.round((completedForms / totalForms) * 100) : 0;

  return {
    canAccessPayments: allStudentsComplete, // Only allow family-level access if ALL students are complete
    allStudentsComplete,
    someStudentsComplete,
    restrictionReason: allStudentsComplete ? null : 'incomplete-student-forms',
    studentsWithAccess: studentsWithAccess.map(result => result.studentName),
    studentsWithoutAccess: studentsWithoutAccess.map(result => ({
      name: result.studentName,
      missing: result.missingForms,
      completionPercentage: result.completionPercentage
    })),
    completionPercentage,
    totalStudents: students.length,
    completedStudents: studentsWithAccess.length
  };
};

// Helper function to determine the target school year for SOLO planning
// Same logic as in SOLOEducationPlanForm.js
const getTargetSchoolYear = () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentYear = currentDate.getFullYear();
  
  // If it's September (9) or October (10), plan for current school year
  // Otherwise, plan for next school year
  if (currentMonth === 9 || currentMonth === 10) {
    return getCurrentSchoolYear();
  } else {
    // Get next school year
    const currentSchoolYear = getCurrentSchoolYear();
    const startYear = parseInt('20' + currentSchoolYear.substr(0, 2));
    const nextStartYear = startYear + 1;
    return `${nextStartYear.toString().substr(-2)}/${(nextStartYear + 1).toString().substr(-2)}`;
  }
};

// RTD Connect Logo with gradient colors
const RTDConnectLogo = () => (
  <div className="flex items-center space-x-3">
    <img 
      src="/connectImages/Connect.png" 
      alt="RTD Connect Logo"
      className="h-12 w-auto"
    />
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
        RTD Connect
      </h1>
      <p className="text-sm text-gray-600">Home Education Portal</p>
    </div>
  </div>
);

// User Type Badge Component
const UserTypeBadge = ({ customClaims }) => {
  if (!customClaims) return null;

  const getUserTypeInfo = () => {
    const familyRole = customClaims.familyRole;
    
    if (familyRole === 'primary_guardian') {
      return {
        label: 'Primary Guardian',
        icon: Crown,
        bgColor: 'bg-gradient-to-r from-purple-500 to-blue-500',
        textColor: 'text-white',
        description: 'Family Administrator'
      };
    } else if (familyRole === 'guardian') {
      return {
        label: 'Guardian',
        icon: Shield,
        bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
        textColor: 'text-white',
        description: 'Family Member'
      };
    } else if (familyRole === 'student') {
      return {
        label: 'Student',
        icon: GraduationCap,
        bgColor: 'bg-gradient-to-r from-green-500 to-emerald-500',
        textColor: 'text-white',
        description: 'Student Account'
      };
    } else {
      return {
        label: 'User',
        icon: UserCheck,
        bgColor: 'bg-gradient-to-r from-gray-400 to-gray-500',
        textColor: 'text-white',
        description: 'Standard User'
      };
    }
  };

  const userType = getUserTypeInfo();
  const Icon = userType.icon;

  return (
    <div className={`${userType.bgColor} px-3 py-2 rounded-lg flex items-center space-x-2 shadow-sm`}>
      <Icon className={`w-4 h-4 ${userType.textColor}`} />
      <div className="flex flex-col">
        <span className={`text-sm font-medium ${userType.textColor}`}>
          {userType.label}
        </span>
        <span className={`text-xs ${userType.textColor} opacity-90`}>
          {userType.description}
        </span>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, gradient = "from-gray-400 to-gray-500" }) => (
  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${gradient} flex items-center justify-center mb-4`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

// Registration Status Card Component
const RegistrationStatusCard = ({ registrationStatus, onActionClick }) => {
  const StatusIcon = registrationStatus.icon || FileText;
  
  return (
    <div className={`rounded-lg p-4 border ${registrationStatus.bgColor} border-gray-200`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm`}>
            <StatusIcon className={`w-5 h-5 ${registrationStatus.color}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              School Year Registration
            </h3>
            <p className={`text-sm ${registrationStatus.color} font-medium mb-2`}>
              {registrationStatus.message}
            </p>
            {registrationStatus.deadline && (
              <p className="text-xs text-gray-600">
                Deadline: {formatImportantDate(registrationStatus.deadline)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileDropdown = ({ userProfile, onEditProfile, onSignOut }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const displayName = userProfile?.firstName && userProfile?.lastName 
    ? `${userProfile.firstName} ${userProfile.lastName}`
    : userProfile?.email || 'User';

  const initials = userProfile?.firstName && userProfile?.lastName
    ? `${userProfile.firstName[0]}${userProfile.lastName[0]}`
    : (userProfile?.email ? userProfile.email[0].toUpperCase() : 'U');

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
          {initials}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-gray-900 truncate max-w-32">
            {displayName}
          </p>
          {userProfile?.phone && (
            <p className="text-xs text-gray-500 truncate max-w-32">
              {userProfile.phone}
            </p>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {userProfile?.email}
                  </p>
                </div>
              </div>
            </div>

            {userProfile?.firstName && (
              <div className="px-4 py-3 border-b border-gray-100">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Profile Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{userProfile.firstName} {userProfile.lastName}</span>
                  </div>
                  {userProfile.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{userProfile.phone}</span>
                    </div>
                  )}
                  {userProfile.address && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700 truncate">
                        {userProfile.address.city}, {userProfile.address.province}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="py-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onEditProfile();
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Edit3 className="w-4 h-4 mr-3 text-gray-400" />
                Edit Profile
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onSignOut();
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <ArrowRight className="w-4 h-4 mr-3 text-gray-400 rotate-180" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const FormField = ({ label, icon: Icon, error, children, required = false }) => (
  <div className="space-y-2">
    <label className="flex items-center text-sm font-medium text-gray-900">
      {Icon && <Icon className="w-4 h-4 mr-2 text-purple-500" />}
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && (
      <div className="flex items-center space-x-2 text-sm text-red-600">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>{error}</span>
      </div>
    )}
  </div>
);

// Under Construction Modal Component
const UnderConstructionModal = ({ 
  isOpen, 
  password, 
  setPassword, 
  onSubmit, 
  error 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-purple-200">
        {/* Logo and Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <img 
              src="/connectImages/Connect.png" 
              alt="RTD Connect Logo"
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent mb-2">
            RTD Connect
          </h1>
          <div className="w-16 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 mx-auto mb-4"></div>
        </div>

        {/* Under Construction Message */}
        <div className="text-center mb-6 space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Settings className="w-8 h-8 text-orange-500" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-900">
            🚧 Portal Under Construction
          </h2>
          
          <div className="space-y-3 text-sm text-gray-600">
            <p className="leading-relaxed">
              <strong className="text-gray-800">We apologize for the confusion!</strong>
            </p>
            <p className="leading-relaxed">
              Some families have registered early while we're still putting the finishing touches on the portal. 
              We're working hard to complete the system and provide you with the best possible experience.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <p className="text-blue-800 font-medium">
                📅 The portal should be fully operational by Monday.
              </p>
            </div>
          </div>
        </div>

        {/* Password Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="construction-password" className="block text-sm font-medium text-gray-700 mb-2">
              Development Access Password
            </label>
            <input
              id="construction-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password to continue"
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
              required
            />
            {error && (
              <div className="mt-2 flex items-center space-x-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
          >
            Access Portal
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Thank you for your patience as we complete development.</p>
        </div>
      </div>
    </div>
  );
};

const RTDConnectDashboard = () => {
  const { user, user_email_key, signOut, isHomeEducationParent, checkAndApplyPendingPermissions: applyPendingFromAuth } = useAuth();
  const navigate = useNavigate();
  const [familyProfile, setFamilyProfile] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasRegisteredFamily, setHasRegisteredFamily] = useState(false);
  const [hasCompleteProfile, setHasCompleteProfile] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});
  const [isSettingUpFamily, setIsSettingUpFamily] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: null,
    birthday: ''
  });

  // Family creation state
  const [showFamilyCreation, setShowFamilyCreation] = useState(false);
  const [familyKey, setFamilyKey] = useState(null);
  const [customClaims, setCustomClaims] = useState(null);
  const [familyData, setFamilyData] = useState({
    familyName: '',
    students: [],
    guardians: []
  });

  // Home Education Notification Form state
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentFormStatuses, setStudentFormStatuses] = useState({});
  
  // Citizenship Documents state
  const [showCitizenshipDocs, setShowCitizenshipDocs] = useState(false);
  const [selectedStudentForDocs, setSelectedStudentForDocs] = useState(null);
  const [studentDocumentStatuses, setStudentDocumentStatuses] = useState({});
  
  // SOLO Education Plan state
  const [showSOLOPlanForm, setShowSOLOPlanForm] = useState(false);
  const [selectedStudentForSOLO, setSelectedStudentForSOLO] = useState(null);
  const [studentSOLOPlanStatuses, setStudentSOLOPlanStatuses] = useState({});
  
  // Reimbursement system state
  const [showReimbursementForm, setShowReimbursementForm] = useState(false);
  const [selectedStudentForReimbursement, setSelectedStudentForReimbursement] = useState(null);
  const [stripeConnectStatus, setStripeConnectStatus] = useState(null);
  const [studentReimbursementStatuses, setStudentReimbursementStatuses] = useState({});
  const [isSubmittingReimbursement, setIsSubmittingReimbursement] = useState(false);
  const [stripeConnectError, setStripeConnectError] = useState(null);
  const [reimbursementError, setReimbursementError] = useState(null);
  
  // Receipt upload form state
  const [showReceiptUploadForm, setShowReceiptUploadForm] = useState(false);
  
  // Acceptance letter state
  const [showAcceptanceLetter, setShowAcceptanceLetter] = useState(false);
  
  // Enhanced budget tracking state
  const [studentBudgets, setStudentBudgets] = useState({});
  
  // Embedded components state
  const [showAccountManagement, setShowAccountManagement] = useState(false);
  const [showPayoutsView, setShowPayoutsView] = useState(false);
  const [showStripeInfo, setShowStripeInfo] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);
  const [accountSession, setAccountSession] = useState(null);
  const [onboardingSession, setOnboardingSession] = useState(null);
  const [managementSession, setManagementSession] = useState(null);
  const [payoutsSession, setPayoutsSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionStates, setSessionStates] = useState({});
  
  // Toast notification state
  const [toast, setToast] = useState(null);
  
  // School year tracking state
  const [currentSchoolYear, setCurrentSchoolYear] = useState('');
  const [activeSchoolYear, setActiveSchoolYear] = useState('');
  const [soloTargetSchoolYear, setSoloTargetSchoolYear] = useState('');
  const [schoolYearStatus, setSchoolYearStatus] = useState({});
  const [nextSeptemberCount, setNextSeptemberCount] = useState(null);
  
  // Facilitator selection state
  const [hasFacilitatorSelected, setHasFacilitatorSelected] = useState(false);
  const [selectedFacilitatorId, setSelectedFacilitatorId] = useState(null);
  const [selectedFacilitator, setSelectedFacilitator] = useState(null);
  const [showFacilitatorChange, setShowFacilitatorChange] = useState(false);

  // Under construction state
  const [showUnderConstruction, setShowUnderConstruction] = useState(false);
  const [constructionPassword, setConstructionPassword] = useState('');
  const [constructionPasswordError, setConstructionPasswordError] = useState('');

  // Payment eligibility state
  const [familyPaymentEligibility, setFamilyPaymentEligibility] = useState(null);
  const [studentPaymentEligibility, setStudentPaymentEligibility] = useState({});

  // Initialize school year tracking
  useEffect(() => {
    const currentYear = getCurrentSchoolYear();
    const activeSeptember = getActiveSeptemberCount();
    
    // Check for open registration school years
    const openRegistrationYears = getAllOpenRegistrationSchoolYears();
    const primaryOpenYear = getOpenRegistrationSchoolYear();
    
    // Prioritize the open registration year, otherwise use the active September count year
    const targetSchoolYear = primaryOpenYear || activeSeptember?.schoolYear || currentYear;
    
    // Get SOLO target school year using the same logic as SOLO form
    const soloTargetYear = getTargetSchoolYear();
    
    // Get the September count date for the active school year
    const septemberCountDate = getSeptemberCountForYear(targetSchoolYear);
    const septemberCountInfo = septemberCountDate ? {
      date: septemberCountDate,
      schoolYear: targetSchoolYear
    } : null;
    
    setCurrentSchoolYear(currentYear);
    setActiveSchoolYear(targetSchoolYear);
    setSoloTargetSchoolYear(soloTargetYear);
    setNextSeptemberCount(septemberCountInfo);
    
    console.log('School year tracking initialized:', {
      currentSchoolYear: currentYear,
      activeSchoolYear: targetSchoolYear,
      soloTargetSchoolYear: soloTargetYear,
      openRegistrationYears,
      primaryOpenYear,
      nextSeptemberCount: activeSeptember
    });
  }, []);

  // Check for under construction bypass on component mount
  useEffect(() => {
    const checkConstructionBypass = () => {
      const bypass = localStorage.getItem('rtdConnectBypassPassword');
      if (bypass === 'connect') {
        setShowUnderConstruction(false);
      } else {
        setShowUnderConstruction(true);
      }
    };

    // Only show under construction if user is logged in
    if (user && !loading) {
      checkConstructionBypass();
    }
  }, [user, loading]);

  // Debug effect to log user auth object and custom claims
  useEffect(() => {
    const logUserAuthInfo = async () => {
      if (user) {
        try {
          const currentUser = getAuth().currentUser;
          const idTokenResult = await currentUser.getIdTokenResult();
          setCustomClaims(idTokenResult.claims);
          
          console.log('currentUser:', currentUser);
          console.log('idTokenResult:', idTokenResult);
        } catch (error) {
          console.error('Error getting auth info:', error);
        }
      }
    };
    
    logUserAuthInfo();
  }, [user]);

  // Listen for token refresh events to update custom claims
  useEffect(() => {
    const handleTokenRefresh = async () => {
      if (user) {
        try {
          console.log('Token refresh event detected, re-reading custom claims...');
          const currentUser = getAuth().currentUser;
          
          // Force token refresh to ensure we get the latest claims
          await currentUser.getIdToken(true);
          const idTokenResult = await currentUser.getIdTokenResult();
          
          console.log('Previous custom claims:', customClaims);
          console.log('New custom claims:', idTokenResult.claims);
          
          // Check if familyId was added
          if (!customClaims?.familyId && idTokenResult.claims.familyId) {
            console.log('🎉 familyId added to claims!', idTokenResult.claims.familyId);
          }
          
          setCustomClaims(idTokenResult.claims);
          console.log('Custom claims updated after token refresh:', idTokenResult.claims);
        } catch (error) {
          console.error('Error re-reading custom claims after token refresh:', error);
        }
      }
    };

    // Listen for the custom token refresh event
    window.addEventListener('tokenRefreshed', handleTokenRefresh);

    return () => {
      window.removeEventListener('tokenRefreshed', handleTokenRefresh);
    };
  }, [user, customClaims]);

  useEffect(() => {
    if (!user || !user_email_key) {
      setLoading(false);
      return;
    }

    const db = getDatabase();
    const userRef = ref(db, `users/${user.uid}`);

    // Set up realtime listener for user profile
    const unsubscribeUser = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        setUserProfile(userData);
        
        // Check if profile is complete
        const isComplete = !!(userData.firstName && 
                             userData.lastName && 
                             userData.phone && 
                             userData.address);
        setHasCompleteProfile(isComplete);
        
        // User-level facilitator data is no longer used - facilitators are now stored at family level only
        
        // Pre-fill form if data exists
        if (userData.firstName || userData.lastName || userData.phone || userData.address) {
          setProfileData({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            phone: userData.phone || '',
            address: userData.address || null,
            birthday: userData.birthday ? toDateString(toEdmontonDate(userData.birthday)) : ''
          });
        }
      } else {
        setUserProfile(null);
        setHasCompleteProfile(false);
        setProfileData({
          firstName: '',
          lastName: '',
          phone: '',
          address: null,
          birthday: ''
        });
      }
      setLoading(false);
    }, (error) => {
      console.log('Error listening to user data:', error);
      setHasCompleteProfile(false);
      setLoading(false);
    });

    // Cleanup listeners
    return () => {
      off(userRef, 'value', unsubscribeUser);
    };
  }, [user, user_email_key]);

  // Effect to load facilitator data from family level
  useEffect(() => {
    if (!customClaims?.familyId) {
      return;
    }

    const db = getDatabase();
    const familyRef = ref(db, `homeEducationFamilies/familyInformation/${customClaims.familyId}`);

    // Set up realtime listener for family facilitator data
    const unsubscribeFamily = onValue(familyRef, (snapshot) => {
      if (snapshot.exists()) {
        const familyData = snapshot.val();
        
        // Load facilitator data using email lookup from config
        if (familyData.facilitatorEmail) {
          const facilitator = getFacilitatorByEmail(familyData.facilitatorEmail);
          if (facilitator) {
            setSelectedFacilitatorId(facilitator.id);
            setSelectedFacilitator(facilitator);
            setHasFacilitatorSelected(true);
            console.log('Loaded facilitator from family email:', facilitator.name, facilitator.contact.email);
          } else {
            console.warn('No facilitator found for email:', familyData.facilitatorEmail);
            setSelectedFacilitatorId(null);
            setSelectedFacilitator(null);
            setHasFacilitatorSelected(false);
          }
        } else {
          // No facilitator email in family data
          setSelectedFacilitatorId(null);
          setSelectedFacilitator(null);
          setHasFacilitatorSelected(false);
        }
      }
    }, (error) => {
      console.log('Error listening to family facilitator data:', error);
    });

    // Cleanup listener
    return () => {
      off(familyRef, 'value', unsubscribeFamily);
    };
  }, [customClaims?.familyId]);

  // Effect to load student form statuses by school year
  useEffect(() => {
    if (!customClaims?.familyId || !familyData?.students || !activeSchoolYear) {
      return;
    }

    const loadStudentFormStatuses = async () => {
      const db = getDatabase();
      const statuses = {};
      const schoolYearStatuses = {};
      
      // Get all available school years to check
      const allSchoolYears = getAllSeptemberCountDates();
      
      for (const student of familyData.students) {
        statuses[student.id] = {};
        
        // Check each school year for this student
        for (const {schoolYear} of allSchoolYears) {
          try {
            const formRef = ref(db, `homeEducationFamilies/familyInformation/${customClaims.familyId}/NOTIFICATION_FORMS/${schoolYear.replace('/', '_')}/${student.id}`);
            const snapshot = await get(formRef);
            
            if (snapshot.exists()) {
              const formData = snapshot.val();
              statuses[student.id][schoolYear] = determineFormStatus(formData);
            } else {
              statuses[student.id][schoolYear] = 'pending';
            }
          } catch (error) {
            console.error(`Error loading form status for student ${student.id}, school year ${schoolYear}:`, error);
            statuses[student.id][schoolYear] = 'pending';
          }
        }
        
        // Set current year status for backward compatibility
        statuses[student.id].current = statuses[student.id][activeSchoolYear] || 'pending';
      }
      
      // Calculate overall school year status for the family
      for (const {schoolYear} of allSchoolYears) {
        const allStudentsSubmitted = familyData.students.every(student => 
          statuses[student.id][schoolYear] === 'submitted'
        );
        const anyStudentSubmitted = familyData.students.some(student => 
          ['submitted', 'incomplete'].includes(statuses[student.id][schoolYear])
        );
        const anyStudentStarted = familyData.students.some(student => 
          ['draft', 'draft-complete', 'incomplete'].includes(statuses[student.id][schoolYear])
        );
        
        if (allStudentsSubmitted && familyData.students.length > 0) {
          schoolYearStatuses[schoolYear] = 'completed';
        } else if (anyStudentSubmitted || anyStudentStarted) {
          schoolYearStatuses[schoolYear] = 'partial';
        } else {
          schoolYearStatuses[schoolYear] = 'pending';
        }
      }
      
      setStudentFormStatuses(statuses);
      setSchoolYearStatus(schoolYearStatuses);
      
      console.log('Student form statuses loaded:', statuses);
      console.log('School year statuses:', schoolYearStatuses);
    };

    loadStudentFormStatuses();
  }, [customClaims?.familyId, familyData?.students, activeSchoolYear]);

  // Effect to load student citizenship document statuses
  useEffect(() => {
    if (!customClaims?.familyId || !familyData?.students) {
      return;
    }

    const loadStudentDocumentStatuses = async () => {
      const db = getDatabase();
      const statuses = {};
      
      for (const student of familyData.students) {
        try {
          const docsRef = ref(db, `homeEducationFamilies/familyInformation/${customClaims.familyId}/STUDENT_CITIZENSHIP_DOCS/${student.id}`);
          const snapshot = await get(docsRef);
          
          if (snapshot.exists()) {
            const docData = snapshot.val();
            statuses[student.id] = {
              status: docData.completionStatus || 'pending',
              documentCount: docData.documents?.length || 0,
              lastUpdated: docData.lastUpdated
            };
          } else {
            statuses[student.id] = {
              status: 'pending',
              documentCount: 0,
              lastUpdated: null
            };
          }
        } catch (error) {
          console.error(`Error loading citizenship docs for student ${student.id}:`, error);
          statuses[student.id] = {
            status: 'pending',
            documentCount: 0,
            lastUpdated: null
          };
        }
      }
      
      setStudentDocumentStatuses(statuses);
      console.log('Student document statuses loaded:', statuses);
    };

    loadStudentDocumentStatuses();
  }, [customClaims?.familyId, familyData?.students]);

  // Effect to load student SOLO plan statuses
  useEffect(() => {
    if (!customClaims?.familyId || !familyData?.students || !soloTargetSchoolYear) {
      return;
    }

    const loadStudentSOLOPlanStatuses = async () => {
      const db = getDatabase();
      const statuses = {};
      
      for (const student of familyData.students) {
        try {
          const planRef = ref(db, `homeEducationFamilies/familyInformation/${customClaims.familyId}/SOLO_EDUCATION_PLANS/${soloTargetSchoolYear.replace('/', '_')}/${student.id}`);
          const snapshot = await get(planRef);
          
          if (snapshot.exists()) {
            const planData = snapshot.val();
            statuses[student.id] = {
              status: planData.submissionStatus || 'pending',
              lastUpdated: planData.lastUpdated,
              submittedAt: planData.submittedAt
            };
          } else {
            statuses[student.id] = {
              status: 'pending',
              lastUpdated: null,
              submittedAt: null
            };
          }
        } catch (error) {
          console.error(`Error loading SOLO plan for student ${student.id}:`, error);
          statuses[student.id] = {
            status: 'pending',
            lastUpdated: null,
            submittedAt: null
          };
        }
      }
      
      setStudentSOLOPlanStatuses(statuses);
      console.log('Student SOLO plan statuses loaded for school year:', soloTargetSchoolYear, statuses);
    };

    loadStudentSOLOPlanStatuses();
  }, [customClaims?.familyId, familyData?.students, soloTargetSchoolYear]);

  // Effect to load Stripe Connect status
  useEffect(() => {
    if (customClaims?.familyId && user?.uid && customClaims?.familyRole === 'primary_guardian') {
      // Reset all sessions when Stripe status changes
      setSessionStates({});
      setAccountSession(null);
      setOnboardingSession(null);
      setManagementSession(null);
      setPayoutsSession(null);
      loadStripeConnectStatus();
    }
  }, [customClaims?.familyId, user?.uid, customClaims?.familyRole]);

  // Effect to create account session for notification banner when Stripe account exists
  useEffect(() => {
    const createNotificationSession = async () => {
      const sessionKey = `${stripeConnectStatus?.accountId}-notification`;
      
      // Check if we should attempt to create a session
      if (stripeConnectStatus?.accountId && 
          !accountSession && 
          !sessionLoading) {
        
        // Check if we've already attempted this session or if it failed
        const sessionState = sessionStates[sessionKey];
        if (sessionState?.created || sessionState?.error || sessionState?.attempted) {
          return; // Don't retry if we've already tried or succeeded
        }
        
        // Mark as attempted to prevent immediate retries
        setSessionStates(prev => ({
          ...prev,
          [sessionKey]: { attempted: true, created: false, claimed: false, error: false }
        }));
        
        try {
          const session = await createAccountSession(['notification_banner'], 'notification');
          if (session) {
            setSessionStates(prev => ({
              ...prev,
              [sessionKey]: { attempted: true, created: true, claimed: false, error: false }
            }));
          }
        } catch (error) {
          console.error('Failed to create notification session:', error);
          
          // Handle specific Stripe account missing error
          if (error.message?.includes('STRIPE_ACCOUNT_MISSING')) {
            console.log('Stripe account no longer exists, clearing local data and showing setup option');
            // Clear the invalid Stripe data locally
            setStripeConnectStatus(null);
            setToast({
              message: 'Your banking account setup was outdated and has been reset. Please set up your banking account again.',
              type: 'warning'
            });
            // Don't mark as error - let user try to create a new account
            setSessionStates(prev => ({
              ...prev,
              [sessionKey]: { attempted: true, created: false, claimed: false, error: false, reset: true }
            }));
          } else {
            // Mark as error to prevent retries for other errors
            setSessionStates(prev => ({
              ...prev,
              [sessionKey]: { attempted: true, created: false, claimed: false, error: true }
            }));
          }
        }
      }
    };

    createNotificationSession();
  }, [stripeConnectStatus?.accountId, accountSession, sessionLoading]); // Removed sessionStates from dependencies

  // Effect to load reimbursement statuses and budgets
  useEffect(() => {
    if (customClaims?.familyId && familyData?.students && activeSchoolYear) {
      loadReimbursementStatuses();
      loadStudentBudgets();
    }
  }, [customClaims?.familyId, familyData?.students, activeSchoolYear]);

  // Effect to calculate payment eligibility when form statuses change
  useEffect(() => {
    if (familyData?.students && activeSchoolYear) {
      // Calculate family-level payment eligibility
      const familyEligibility = getFamilyPaymentEligibility(
        familyData.students,
        studentFormStatuses,
        studentDocumentStatuses,
        studentSOLOPlanStatuses,
        activeSchoolYear
      );
      setFamilyPaymentEligibility(familyEligibility);

      // Calculate individual student payment eligibility
      const studentEligibilities = {};
      familyData.students.forEach(student => {
        studentEligibilities[student.id] = getStudentPaymentEligibility(
          student,
          studentFormStatuses,
          studentDocumentStatuses,
          studentSOLOPlanStatuses,
          activeSchoolYear
        );
      });
      setStudentPaymentEligibility(studentEligibilities);

      console.log('Payment eligibility calculated:', {
        familyEligibility,
        studentEligibilities
      });
    }
  }, [familyData?.students, studentFormStatuses, studentDocumentStatuses, studentSOLOPlanStatuses, activeSchoolYear]);

  // Separate effect for family data based on custom claims
  useEffect(() => {
    console.log('Family data effect triggered. customClaims:', customClaims);
    
    if (!customClaims?.familyId) {
      console.log('No familyId in customClaims, setting hasRegisteredFamily to false');
      setHasRegisteredFamily(false);
      setFamilyProfile(null);
      return;
    }

    console.log('Found familyId in customClaims:', customClaims.familyId);

    const db = getDatabase();
    const familyRef = ref(db, `homeEducationFamilies/familyInformation/${customClaims.familyId}`);

    // Set up realtime listener for family registration
    const unsubscribeFamily = onValue(familyRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setFamilyProfile(data);
        
        // Convert the family data structure to match what FamilyCreationSheet expects
        const convertedFamilyData = {
          familyName: data.familyName || '',
          students: data.students ? Object.values(data.students).map(student => ({
            ...student,
            grade: student.grade || '', // Add default grade if missing
            birthday: student.birthday || '', // Ensure birthday field exists
            preferredName: student.preferredName || '', // Ensure preferredName exists
            email: student.email || '', // Ensure email exists
            gender: student.gender || '' // Ensure gender field exists
          })) : [],
          guardians: data.guardians ? Object.values(data.guardians).map(guardian => ({
            ...guardian,
            permissions: guardian.permissions || {
              canEditFamily: true,
              canViewReports: true,
              canSubmitReimbursements: true
            }
          })) : []
        };
        
        console.log('Loaded family data:', data);
        console.log('Converted family data:', convertedFamilyData);
        console.log('Setting hasRegisteredFamily to TRUE');
        
        console.log('Converted family data:', convertedFamilyData);
        console.log('Students in converted data:', convertedFamilyData.students);
        setFamilyData(convertedFamilyData);
        setFamilyKey(customClaims.familyId);
        setHasRegisteredFamily(true);
      } else {
        setFamilyProfile(null);
        setHasRegisteredFamily(false);
      }
    }, (error) => {
      console.log('Family data not accessible:', error);
      setHasRegisteredFamily(false);
    });

    // Cleanup listener
    return () => {
      off(familyRef, 'value', unsubscribeFamily);
    };
  }, [customClaims?.familyId]);

  // Enhanced permission checking when user logs in
  useEffect(() => {
    if (user && !loading && hasCompleteProfile) {
      checkAndApplyPendingPermissions();
    }
  }, [user, loading, hasCompleteProfile]);

  // Additional fallback: If user has a complete profile but no family registration after 3 seconds,
  // try to recover permissions one more time
  useEffect(() => {
    if (user && !loading && hasCompleteProfile && !hasRegisteredFamily && !customClaims?.familyId) {
      const timer = setTimeout(async () => {
        console.log('Dashboard fallback: Attempting permission recovery for user with complete profile but no family...');
        try {
          const result = await checkAndApplyPendingPermissions();
          if (result) {
            console.log('✅ Dashboard fallback successfully recovered permissions:', result);
          }
        } catch (error) {
          console.error('Dashboard fallback permission recovery failed:', error);
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [user, loading, hasCompleteProfile, hasRegisteredFamily, customClaims?.familyId]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Handle under construction password submission
  const handleConstructionPasswordSubmit = (e) => {
    e.preventDefault();
    setConstructionPasswordError('');

    if (constructionPassword.toLowerCase() === 'connect') {
      localStorage.setItem('rtdConnectBypassPassword', 'connect');
      setShowUnderConstruction(false);
      setConstructionPassword('');
    } else {
      setConstructionPasswordError('Incorrect password. Please try again.');
    }
  };

  const handleProfileInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (profileErrors[field]) {
      setProfileErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const phoneRegex = /^[\d\s\-\(\)]*$/;
    
    if (phoneRegex.test(value)) {
      const formatted = formatPhoneNumber(value);
      handleProfileInputChange('phone', formatted);
    }
  };

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const handleAddressSelect = (address) => {
    setProfileData(prev => ({ ...prev, address }));
    if (profileErrors.address) {
      setProfileErrors(prev => ({ ...prev, address: '' }));
    }
  };

  const validateProfile = () => {
    const errors = {};
    
    if (!profileData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!profileData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!profileData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else {
      const phoneDigits = profileData.phone.replace(/\D/g, '');
      if (phoneDigits.length !== 10) {
        errors.phone = 'Please enter a valid 10-digit phone number';
      }
    }
    
    if (!profileData.address) {
      errors.address = 'Address is required';
    }
    
    if (!profileData.birthday.trim()) {
      errors.birthday = 'Birthday is required';
    } else {
      // Validate birthday
      const birthDate = toEdmontonDate(profileData.birthday);
      if (!birthDate || isNaN(birthDate.getTime())) {
        errors.birthday = 'Invalid date format';
      } else {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (birthDate > today) {
          errors.birthday = 'Birthday cannot be in the future';
        } else {
          const age = calculateAge(birthDate);
          if (age < 5 || age > 100) {
            errors.birthday = 'Please enter a valid birthday';
          }
        }
      }
    }
    
    return errors;
  };

  const handleSaveProfile = async () => {
    const errors = validateProfile();
    
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setIsSubmittingProfile(true);
    setProfileErrors({});

    try {
      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}`);
      
      await set(userRef, {
        ...profileData,
        email: user.email,
        lastUpdated: new Date().toISOString()
      });

      setShowProfileForm(false);
      console.log('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      setProfileErrors({ submit: 'Failed to save profile. Please try again.' });
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handleStartRegistration = async () => {
    // Allow family creation/editing in two scenarios:
    // 1. User is a primary guardian (for existing families)
    // 2. User has no family yet (for new family creation)
    if (customClaims?.familyRole !== 'primary_guardian' && hasRegisteredFamily) {
      console.log('Access denied: Only primary guardians can edit existing family data');
      return;
    }
    
    // If user already has a family, just open the sheet for updates
    if (hasRegisteredFamily && familyKey) {
      setShowFamilyCreation(true);
      return;
    }
    
    // For new families, just open the creation sheet
    // The saveFamilyData function will handle creating the family and setting claims
    setShowFamilyCreation(true);
  };

  const handleFamilyDataChange = (newFamilyData) => {
    setFamilyData(newFamilyData);
  };

  // Manual method to refresh custom claims
  const refreshCustomClaims = async () => {
    if (user) {
      try {
        console.log('Manually refreshing custom claims...');
        const currentUser = getAuth().currentUser;
        await currentUser.getIdToken(true);
        const idTokenResult = await currentUser.getIdTokenResult();
        setCustomClaims(idTokenResult.claims);
        console.log('Manual custom claims refresh completed:', idTokenResult.claims);
        return idTokenResult.claims;
      } catch (error) {
        console.error('Error manually refreshing custom claims:', error);
        return null;
      }
    }
    return null;
  };

  const handleFamilyComplete = async (result, updatedClaims) => {
    console.log('Family registration completed successfully', result);
    
    // If we have updated claims from the form, use them immediately
    if (updatedClaims) {
      console.log('Using claims from family creation:', updatedClaims);
      setCustomClaims(updatedClaims);
    } else {
      // Otherwise, manually refresh claims
      console.log('No claims provided, manually refreshing...');
      await refreshCustomClaims();
    }
  };

  // Facilitator selection handlers
  const handleFacilitatorSelect = async (facilitatorId, facilitator) => {
    setSelectedFacilitatorId(facilitatorId);
    setSelectedFacilitator(facilitator);

    // Save only facilitator email to family level
    if (customClaims?.familyId && facilitator?.contact?.email) {
      try {
        const db = getDatabase();
        const familyRef = ref(db, `homeEducationFamilies/familyInformation/${customClaims.familyId}`);
        await update(familyRef, {
          facilitatorEmail: facilitator.contact.email,
          facilitatorAssignedAt: new Date().toISOString(),
          facilitatorAssignedBy: user?.uid,
          lastUpdated: new Date().toISOString()
        });
        
        setHasFacilitatorSelected(true);
        console.log('Saving facilitator email to family level:', facilitator.contact.email);
        
        setToast({
          message: `Great choice! ${facilitator.name} will be your facilitator.`,
          type: 'success'
        });
      } catch (error) {
        console.error('Error saving facilitator selection:', error);
        setToast({
          message: 'Error saving facilitator selection. Please try again.',
          type: 'error'
        });
      }
    } else {
      console.error('Missing familyId or facilitator email');
      setToast({
        message: 'Error: Unable to save facilitator selection.',
        type: 'error'
      });
    }
  };

  const handleContinueToFamilyCreation = () => {
    setShowFamilyCreation(true);
  };

  const handleFacilitatorChange = async (facilitatorId, facilitator) => {
    const previousFacilitator = selectedFacilitator;
    
    setSelectedFacilitatorId(facilitatorId);
    setSelectedFacilitator(facilitator);

    // Save only facilitator email to family level
    if (customClaims?.familyId && facilitator?.contact?.email) {
      try {
        const db = getDatabase();
        const familyRef = ref(db, `homeEducationFamilies/familyInformation/${customClaims.familyId}`);
        await update(familyRef, {
          facilitatorEmail: facilitator.contact.email,
          facilitatorAssignedAt: new Date().toISOString(),
          facilitatorChangedFrom: previousFacilitator?.name || null,
          facilitatorChangedBy: user?.uid,
          lastUpdated: new Date().toISOString()
        });
        
        setShowFacilitatorChange(false);
        console.log('Changed facilitator email at family level to:', facilitator.contact.email);
        
        setToast({
          message: `Facilitator changed to ${facilitator.name} successfully!`,
          type: 'success'
        });
      } catch (error) {
        console.error('Error changing facilitator:', error);
        
        // Revert on error
        setSelectedFacilitatorId(previousFacilitator?.id || null);
        setSelectedFacilitator(previousFacilitator);
        
        setToast({
          message: 'Error changing facilitator. Please try again.',
          type: 'error'
        });
      }
    } else {
      console.error('Missing familyId or facilitator email');
      setToast({
        message: 'Error: Unable to change facilitator selection.',
        type: 'error'
      });
    }
  };

  // Get registration status for the current/active school year
  const getRegistrationStatus = () => {
    if (!activeSchoolYear || !nextSeptemberCount) {
      return {
        status: 'unknown',
        message: 'Loading registration status...',
        actionNeeded: false,
        schoolYear: '',
        deadline: null
      };
    }

    const currentStatus = schoolYearStatus[activeSchoolYear] || 'pending';
    const hasPassedSeptemberCount = hasSeptemberCountPassed(activeSchoolYear);
    const registrationIsOpen = isRegistrationOpen(activeSchoolYear);
    const registrationOpenDate = getRegistrationOpenDateForYear(activeSchoolYear);
    const isCurrentYear = activeSchoolYear === currentSchoolYear;
    
    if (currentStatus === 'completed') {
      return {
        status: 'completed',
        message: `✅ Registered for ${activeSchoolYear} school year`,
        actionNeeded: false,
        schoolYear: activeSchoolYear,
        deadline: null,
        icon: CheckCircle2,
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      };
    }
    
    if (currentStatus === 'partial') {
      return {
        status: 'partial',
        message: `⚠️ Partial registration for ${activeSchoolYear} - some students still need forms`,
        actionNeeded: true,
        schoolYear: activeSchoolYear,
        deadline: nextSeptemberCount.date,
        icon: AlertTriangle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      };
    }
    
    // Check if registration is not yet open
    if (!registrationIsOpen && registrationOpenDate) {
      const daysUntilOpen = Math.ceil((registrationOpenDate - new Date()) / (1000 * 60 * 60 * 24));
      return {
        status: 'not_open',
        message: `📅 ${activeSchoolYear} registration opens on ${formatImportantDate(registrationOpenDate)}`,
        actionNeeded: false,
        schoolYear: activeSchoolYear,
        deadline: registrationOpenDate,
        icon: Info,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      };
    }
    
    // Registration is open - pending status
    if (registrationIsOpen && !hasPassedSeptemberCount) {
      const daysUntilDeadline = Math.ceil((nextSeptemberCount.date - new Date()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDeadline > 30) {
        return {
          status: 'available',
          message: `📝 ${activeSchoolYear} registration is now open`,
          actionNeeded: true,
          schoolYear: activeSchoolYear,
          deadline: nextSeptemberCount.date,
          icon: FileText,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50'
        };
      } else if (daysUntilDeadline > 0) {
        return {
          status: 'urgent',
          message: `⏰ ${activeSchoolYear} registration due in ${daysUntilDeadline} days`,
          actionNeeded: true,
          schoolYear: activeSchoolYear,
          deadline: nextSeptemberCount.date,
          icon: Clock,
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        };
      } else {
        return {
          status: 'overdue',
          message: `🚨 ${activeSchoolYear} registration is overdue`,
          actionNeeded: true,
          schoolYear: activeSchoolYear,
          deadline: nextSeptemberCount.date,
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        };
      }
    }
    
    return {
      status: 'required',
      message: `📝 Complete ${activeSchoolYear} registration`,
      actionNeeded: true,
      schoolYear: activeSchoolYear,
      deadline: nextSeptemberCount.date,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    };
  };

  // Handle opening citizenship documents modal
  const handleOpenCitizenshipDocs = (student) => {
    setSelectedStudentForDocs(student);
    setShowCitizenshipDocs(true);
  };

  // Handle citizenship documents update
  const handleDocumentsUpdated = (studentId, documents) => {
    // Update local state
    setStudentDocumentStatuses(prev => ({
      ...prev,
      [studentId]: {
        status: documents.length > 0 ? 'completed' : 'pending',
        documentCount: documents.length,
        lastUpdated: new Date().toISOString()
      }
    }));
  };

  // Handle opening SOLO education plan form
  const handleOpenSOLOPlan = (student) => {
    setSelectedStudentForSOLO(student);
    setShowSOLOPlanForm(true);
  };

  // Handle SOLO plan form close
  const handleSOLOPlanClose = () => {
    setShowSOLOPlanForm(false);
    setSelectedStudentForSOLO(null);
    
    // Reload SOLO plan statuses after form close to reflect any changes
    if (customClaims?.familyId && familyData?.students && soloTargetSchoolYear) {
      const loadUpdatedStatuses = async () => {
        const db = getDatabase();
        const statuses = {};
        
        for (const student of familyData.students) {
          try {
            const planRef = ref(db, `homeEducationFamilies/familyInformation/${customClaims.familyId}/SOLO_EDUCATION_PLANS/${soloTargetSchoolYear.replace('/', '_')}/${student.id}`);
            const snapshot = await get(planRef);
            
            if (snapshot.exists()) {
              const planData = snapshot.val();
              statuses[student.id] = {
                status: planData.submissionStatus || 'pending',
                lastUpdated: planData.lastUpdated,
                submittedAt: planData.submittedAt
              };
            } else {
              statuses[student.id] = {
                status: 'pending',
                lastUpdated: null,
                submittedAt: null
              };
            }
          } catch (error) {
            console.error(`Error loading SOLO plan for student ${student.id}:`, error);
            statuses[student.id] = {
              status: 'pending',
              lastUpdated: null,
              submittedAt: null
            };
          }
        }
        
        setStudentSOLOPlanStatuses(statuses);
      };
      
      loadUpdatedStatuses();
    }
  };

  // Check and apply pending permissions (manual trigger)
  const checkAndApplyPendingPermissions = async () => {
    if (!user?.email) return;
    
    try {
      console.log('Manually checking for pending permissions...');
      
      // Use the auth context function which has better token refresh logic
      const result = await applyPendingFromAuth();
      
      if (result) {
        console.log('✅ Manually applied pending permissions:', result);
        // The auth context function handles token refresh automatically
        // Just refresh custom claims in this component
        await refreshCustomClaims();
      } else {
        console.log('No pending permissions found or already applied');
      }
    } catch (error) {
      console.error('Error manually applying pending permissions:', error);
    }
  };

  // Stripe Connect handlers

  // Debug function to check Stripe account status
  const handleDebugStripeAccount = async () => {
    if (!customClaims?.familyId) {
      alert('No family ID found');
      return;
    }

    try {
      const functions = getFunctions();
      const debugStripeAccount = httpsCallable(functions, 'debugStripeAccount');
      
      console.log('Calling debugStripeAccount for family:', customClaims.familyId);
      const result = await debugStripeAccount({
        familyId: customClaims.familyId
      });
      
      console.log('Debug Stripe Account Result:', result.data);
      
      if (!result.data.success) {
        alert(`Error: ${result.data.error}`);
        return;
      }
      
      // Display debug info from the new structure
      const debugInfo = result.data.debug_info;
      const alertMessage = `
Stripe Account Debug Results:
Account ID: ${result.data.accountId}
Details Submitted: ${debugInfo.details_submitted}
Charges Enabled: ${debugInfo.charges_enabled}
Payouts Enabled: ${debugInfo.payouts_enabled}

Business Profile:
${debugInfo.business_profile ? JSON.stringify(debugInfo.business_profile, null, 2) : 'Not set'}

Individual Data:
${typeof debugInfo.individual === 'string' ? debugInfo.individual : JSON.stringify(debugInfo.individual, null, 2)}

Requirements Currently Due:
${debugInfo.requirements?.currently_due?.join(', ') || 'None'}

Check console for full details.
      `;
      
      alert(alertMessage);
    } catch (error) {
      console.error('Error debugging Stripe account:', error);
      alert(`Error debugging Stripe account: ${error.message}`);
    }
  };
  
  // Function to update/fix Stripe account with proper prefilling
  const handleUpdateStripeAccount = async () => {
    if (!customClaims?.familyId) {
      setToast({
        message: 'No family ID found',
        type: 'error'
      });
      return;
    }

    try {
      const functions = getFunctions();
      const updateStripeAccount = httpsCallable(functions, 'updateStripeAccount');
      
      setToast({
        message: 'Updating Stripe account data...',
        type: 'info'
      });
      
      const result = await updateStripeAccount({
        familyId: customClaims.familyId
      });
      
      if (result.data.success) {
        setToast({
          message: 'Stripe account updated successfully!',
          type: 'success'
        });
        
        // Reload Stripe status
        await loadStripeConnectStatus();
      } else {
        throw new Error('Failed to update Stripe account');
      }
    } catch (error) {
      console.error('Error updating Stripe account:', error);
      setToast({
        message: `Error updating Stripe account: ${error.message}`,
        type: 'error'
      });
    }
  };

  // Function to delete Stripe account (for testing)
  const handleDeleteStripeAccount = async () => {
    if (!customClaims?.familyId) {
      setToast({
        message: 'No family ID found',
        type: 'error'
      });
      return;
    }

    // Confirm deletion
    const confirmDelete = window.confirm(
      'Are you sure you want to delete your Stripe account? This action cannot be undone and you will need to set up payments again.'
    );
    
    if (!confirmDelete) return;

    try {
      const functions = getFunctions();
      const deleteStripeAccount = httpsCallable(functions, 'deleteStripeAccount');
      
      setToast({
        message: 'Deleting Stripe account...',
        type: 'info'
      });
      
      const result = await deleteStripeAccount({
        familyId: customClaims.familyId
      });
      
      if (result.data.success) {
        setToast({
          message: 'Stripe account deleted successfully! You can now create a new one.',
          type: 'success'
        });
        
        // Reset Stripe status
        setStripeConnectStatus(null);
      } else {
        throw new Error('Failed to delete Stripe account');
      }
    } catch (error) {
      console.error('Error deleting Stripe account:', error);
      setToast({
        message: `Error deleting Stripe account: ${error.message}`,
        type: 'error'
      });
    }
  };

  // Function to manually clean up invalid Stripe data
  const handleCleanupStripeData = async () => {
    if (!customClaims?.familyId) {
      setToast({
        message: 'No family ID found',
        type: 'error'
      });
      return;
    }

    const confirmCleanup = window.confirm(
      'This will clean up invalid banking account data. You will need to set up your banking account again. Continue?'
    );
    
    if (!confirmCleanup) return;

    try {
      const db = getDatabase();
      const stripeDataRef = ref(db, `homeEducationFamilies/familyInformation/${customClaims.familyId}/STRIPE_CONNECT`);
      
      setToast({
        message: 'Cleaning up invalid banking data...',
        type: 'info'
      });
      
      await set(stripeDataRef, null); // Remove the data
      
      // Reset local state
      setStripeConnectStatus(null);
      setStripeConnectError(null);
      setAccountSession(null);
      setSessionStates({});
      
      setToast({
        message: 'Banking account data cleaned up successfully! You can now set up a new account.',
        type: 'success'
      });
    } catch (error) {
      console.error('Error cleaning up Stripe data:', error);
      setToast({
        message: `Error cleaning up data: ${error.message}`,
        type: 'error'
      });
    }
  };

  const handleSubmitReimbursement = async (reimbursementData) => {
    setIsSubmittingReimbursement(true);
    setReimbursementError(null);

    try {
      // Get current user's family ID from custom claims
      const idTokenResult = await user.getIdTokenResult();
      const familyId = idTokenResult.claims.familyId;
      
      if (!familyId) {
        throw new Error('User must be part of a family to submit reimbursements');
      }

      // Convert file objects to base64 for storage
      const receiptFiles = await Promise.all(
        reimbursementData.receipts.map(async (file) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                data: reader.result.split(',')[1], // Remove data:... prefix
                name: file.name,
                type: file.type,
                size: file.size
              });
            };
            reader.readAsDataURL(file);
          });
        })
      );

      // Find the student name from familyData
      const student = familyData.students.find(s => s.id === reimbursementData.studentId);
      const studentName = student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';

      // Use the Cloud Function to submit reimbursement
      const functions = getFunctions();
      const submitReimbursementFunc = httpsCallable(functions, 'submitReimbursement');
      
      const result = await submitReimbursementFunc({
        familyId: familyId,
        studentId: reimbursementData.studentId,
        studentName: studentName,
        amount: parseFloat(reimbursementData.amount),
        description: reimbursementData.description,
        category: reimbursementData.category,
        purchaseDate: reimbursementData.purchaseDate,
        receiptFiles: receiptFiles,
        schoolYear: activeSchoolYear
      });

      if (result.data.success) {
        console.log('Reimbursement submitted successfully:', result.data.reimbursementId);
        
        // Show success toast
        setToast({
          message: `Reimbursement submitted successfully! ID: ${result.data.reimbursementId}`,
          type: 'success'
        });
        
        setShowReimbursementForm(false);
        setSelectedStudentForReimbursement(null);
        
        // Reload reimbursement statuses
        await loadReimbursementStatuses();
      } else {
        throw new Error('Failed to submit reimbursement');
      }
    } catch (error) {
      console.error('Error submitting reimbursement:', error);
      setReimbursementError(error.message || 'Failed to submit reimbursement');
    } finally {
      setIsSubmittingReimbursement(false);
    }
  };

  const handleOpenReimbursementForm = (student) => {
    // Check payment eligibility first
    const studentEligibility = studentPaymentEligibility[student.id];
    if (!studentEligibility?.canAccessPayments) {
      const missingFormLabels = {
        'notification-form': `${activeSchoolYear} Notification Form`,
        'citizenship-docs': 'Citizenship Documents',
        'solo-plan': 'Program Plan'
      };
      
      const missingForms = studentEligibility?.missingForms?.map(form => missingFormLabels[form]).join(', ') || 'required forms';
      
      setToast({
        message: `${student.firstName} must complete ${missingForms} before accessing payment features.`,
        type: 'warning'
      });
      return;
    }
    
    // Check if Stripe Connect is set up
    if (stripeConnectStatus?.status !== 'completed') {
      setToast({
        message: 'Please complete the banking setup using the Account Management button before submitting reimbursements.',
        type: 'warning'
      });
      return;
    }
    
    setSelectedStudentForReimbursement(student);
    setShowReimbursementForm(true);
  };

  // Handler for new receipt upload form
  const handleOpenReceiptUploadForm = () => {
    // Check family payment eligibility
    if (!familyPaymentEligibility?.canAccessPayments) {
      const incompleteStudents = familyPaymentEligibility?.studentsWithoutAccess || [];
      
      if (incompleteStudents.length > 0) {
        const studentNames = incompleteStudents.map(s => s.name).join(', ');
        setToast({
          message: `Complete all required forms first. Students with incomplete forms: ${studentNames}`,
          type: 'warning'
        });
      } else {
        setToast({
          message: 'All students must complete their required forms before accessing payment features.',
          type: 'warning'
        });
      }
      return;
    }
    
    setShowReceiptUploadForm(true);
  };


  const handleClaimSubmitted = async (claimData) => {
    setToast({
      message: `Reimbursement claim submitted successfully! Claim ID: ${claimData.claimId}`,
      type: 'success'
    });
    
    // Reload reimbursement statuses and budgets to reflect the new claim
    await loadReimbursementStatuses();
    await loadStudentBudgets();
  };

  // Handlers for embedded components
  const handleOpenAccountManagement = async () => {
    if (!stripeConnectStatus?.accountId) {
      setToast({
        message: 'Please complete Stripe Connect setup first',
        type: 'error'
      });
      return;
    }

    // Let the EmbeddedAccountManagement component handle session creation automatically
    setShowAccountManagement(true);
  };

  // Create account and immediately open account management (the working flow)
  const handleCreateAndOpenAccountManagement = async () => {
    if (!customClaims?.familyId || !userProfile) {
      setToast({
        message: 'Missing family or user profile information',
        type: 'error'
      });
      return;
    }

    try {
      setToast({
        message: 'Creating your secure banking account...',
        type: 'info'
      });

      const functions = getFunctions();
      const createStripeConnectAccount = httpsCallable(functions, 'createStripeConnectAccount');
      
      // Create the account with improved pre-filling
      const result = await createStripeConnectAccount({
        familyId: customClaims.familyId,
        userProfile: userProfile
      });

      if (result.data.success) {
        // Update local state
        setStripeConnectStatus({
          accountId: result.data.accountId,
          status: result.data.status || 'pending',
          createdAt: new Date().toISOString()
        });

        setToast({
          message: 'Account created successfully! Opening banking settings...',
          type: 'success'
        });

        // Let the EmbeddedAccountManagement component create its own session automatically
        setToast({
          message: 'Opening banking management...',
          type: 'success'
        });
        
        setTimeout(() => {
          setShowAccountManagement(true);
        }, 1000);

      } else {
        throw new Error('Failed to create Stripe account');
      }
    } catch (error) {
      console.error('Error creating Stripe account:', error);
      setToast({
        message: `Error creating account: ${error.message}`,
        type: 'error'
      });
    }
  };

  const handleOpenPayoutsView = async () => {
    if (!stripeConnectStatus?.accountId) {
      setToast({
        message: 'Please complete Stripe Connect setup first',
        type: 'error'
      });
      return;
    }

    const session = await createAccountSession(['payouts'], 'payouts');
    if (session) {
      setShowPayoutsView(true);
    }
  };

  const loadStudentBudgets = async () => {
    if (!customClaims?.familyId || !familyData?.students || !activeSchoolYear) {
      return;
    }

    try {
      const db = getDatabase();
      const budgets = {};
      
      // Load claims to calculate spent amounts
      const claimsRef = ref(db, `homeEducationFamilies/familyInformation/${customClaims.familyId}/REIMBURSEMENT_CLAIMS/${activeSchoolYear.replace('/', '_')}`);
      const claimsSnapshot = await get(claimsRef);
      
      for (const student of familyData.students) {
        const studentBudgetLimit = calculateStudentBudget(student.grade);
        const fundingInfo = getFundingType(student.grade);
        
        let spentAmount = 0;
        if (claimsSnapshot.exists()) {
          const allClaims = claimsSnapshot.val();
          Object.values(allClaims).forEach(claim => {
            if (claim.studentAllocations) {
              claim.studentAllocations.forEach(allocation => {
                if (allocation.studentId === student.id && 
                    (claim.status === 'approved' || claim.status === 'paid')) {
                  spentAmount += allocation.amount || 0;
                }
              });
            }
          });
        }

        const remaining = studentBudgetLimit - spentAmount;
        budgets[student.id] = {
          limit: studentBudgetLimit,
          spent: spentAmount,
          remaining: Math.max(0, remaining),
          percentageUsed: (spentAmount / studentBudgetLimit) * 100,
          gradeLevel: student.grade,
          fundingType: fundingInfo.type,
          fundingLabel: fundingInfo.label,
          fundingFormatted: fundingInfo.formatted
        };
      }
      
      setStudentBudgets(budgets);
    } catch (error) {
      console.error('Error loading student budgets:', error);
    }
  };

  const loadReimbursementStatuses = async () => {
    if (!customClaims?.familyId || !familyData?.students || !activeSchoolYear) {
      return;
    }

    try {
      const db = getDatabase();
      const statuses = {};
      
      // Initialize statuses for all students
      for (const student of familyData.students) {
        statuses[student.id] = {
          total: 0,
          pending: 0,
          approved: 0,
          paid: 0,
          totalAmount: 0,
          latestSubmission: null
        };
      }
      
      // Load claims from new REIMBURSEMENT_CLAIMS structure
      const claimsRef = ref(db, `homeEducationFamilies/familyInformation/${customClaims.familyId}/REIMBURSEMENT_CLAIMS/${activeSchoolYear.replace('/', '_')}`);
      const claimsSnapshot = await get(claimsRef);
      
      if (claimsSnapshot.exists()) {
        const allClaims = claimsSnapshot.val();
        const claimsList = Object.values(allClaims);
        
        // Process each claim and its student allocations
        claimsList.forEach(claim => {
          if (claim.studentAllocations) {
            claim.studentAllocations.forEach(allocation => {
              const studentId = allocation.studentId;
              
              if (statuses[studentId]) {
                // Count this allocation
                statuses[studentId].total += 1;
                
                // Add to appropriate status counters
                if (claim.status === 'pending_review') {
                  statuses[studentId].pending += 1;
                } else if (claim.status === 'approved') {
                  statuses[studentId].approved += 1;
                } else if (claim.status === 'paid') {
                  statuses[studentId].paid += 1;
                }
                
                // Add amount (only for approved or paid claims)
                if (claim.status === 'approved' || claim.status === 'paid') {
                  statuses[studentId].totalAmount += allocation.amount || 0;
                }
                
                // Track latest submission per student
                const currentSubmissionDate = new Date(claim.submittedAt);
                const existingLatest = statuses[studentId].latestSubmission;
                
                if (!existingLatest || currentSubmissionDate > new Date(existingLatest.submittedAt)) {
                  statuses[studentId].latestSubmission = {
                    ...claim,
                    studentAllocation: allocation
                  };
                }
              }
            });
          }
        });
      }
      
      setStudentReimbursementStatuses(statuses);
    } catch (error) {
      console.error('Error loading reimbursement statuses:', error);
    }
  };

  const loadStripeConnectStatus = async () => {
    if (!customClaims?.familyId || !user?.uid) {
      return;
    }

    try {
      const db = getDatabase();
      const stripeDataRef = ref(db, `homeEducationFamilies/familyInformation/${customClaims.familyId}/STRIPE_CONNECT`);
      const snapshot = await get(stripeDataRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        setStripeConnectStatus({
          status: data.status,
          accountId: data.accountId,
          onboardingUrl: data.onboardingUrl,
          createdAt: data.createdAt,
          completedAt: data.completedAt,
          lastUpdated: data.lastUpdated
        });
      }
    } catch (error) {
      console.error('Error loading Stripe Connect status:', error);
    }
  };

  // Create account session for specific embedded components
  const createAccountSession = async (components = ['notification_banner'], sessionType = 'notification') => {
    if (!customClaims?.familyId || sessionLoading) {
      return null;
    }

    const sessionKey = `${stripeConnectStatus?.accountId}-${sessionType}`;
    
    // Prevent duplicate session creation
    if (sessionStates[sessionKey]?.created) {
      console.log(`${sessionType} session already created, skipping...`);
      switch (sessionType) {
        case 'onboarding':
          return onboardingSession;
        case 'management':
          return managementSession;
        case 'payouts':
          return payoutsSession;
        case 'notification':
        default:
          return accountSession;
      }
    }

    setSessionLoading(true);
    setStripeConnectError(null);

    try {
      const functions = getFunctions();
      const createSession = httpsCallable(functions, 'createAccountSession');
      
      const result = await createSession({
        familyId: customClaims.familyId,
        components: components
      });

      if (result.data.success) {
        // Store session in component-specific state to avoid sharing
        switch (sessionType) {
          case 'onboarding':
            setOnboardingSession(result.data);
            break;
          case 'management':
            setManagementSession(result.data);
            break;
          case 'payouts':
            setPayoutsSession(result.data);
            break;
          case 'notification':
          default:
            setAccountSession(result.data);
            break;
        }
        return result.data;
      } else {
        throw new Error('Failed to create account session');
      }
    } catch (error) {
      console.error(`Error creating ${sessionType} session:`, error);
      
      // Handle specific Stripe account missing error
      if (error.message?.includes('STRIPE_ACCOUNT_MISSING')) {
        console.log('Stripe account no longer exists, clearing local data');
        // Clear the invalid Stripe data locally
        setStripeConnectStatus(null);
        setStripeConnectError('Your banking account setup was outdated and has been reset. Please set up your banking account again.');
        setToast({
          message: 'Banking account data was outdated and has been reset. You can now set up a new account.',
          type: 'warning'
        });
      } else if (error.message?.includes('already been claimed')) {
        console.warn(`Account session already claimed for ${sessionType} - this may be expected`);
        // Don't update sessionStates here to avoid triggering useEffect loops
      } else {
        setStripeConnectError(error.message || `Failed to create ${sessionType} session`);
      }
      
      // Re-throw error so calling code can handle it
      throw error;
    } finally {
      setSessionLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to RTD Connect</h1>
          <p className="text-gray-600 mb-6">Please sign in to access your home education portal.</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show profile completion first if incomplete
  if (!hasCompleteProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-purple-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <RTDConnectLogo />
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="flex lg:hidden items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              {/* Desktop sign out button */}
              <button
                onClick={handleSignOut}
                className="hidden lg:flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-md border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to RTD Connect!</h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Let's start by completing your profile. This information helps us personalize your experience and ensure proper communication.
              </p>
            </div>

            <button
              onClick={() => setShowProfileForm(true)}
              className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:from-purple-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="text-lg font-medium">Complete Your Profile</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Feature preview */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">What's Available After Setup</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard 
                icon={GraduationCap}
                title="Student Management"
                description="Register and manage your home education students"
                gradient="from-purple-500 to-cyan-500"
              />
              <FeatureCard 
                icon={FileText}
                title="Annual Registration"
                description="Complete yearly registration requirements online"
                gradient="from-blue-500 to-cyan-500"
              />
              <FeatureCard 
                icon={DollarSign}
                title="Reimbursements"
                description="Submit and track reimbursement requests"
                gradient="from-cyan-500 to-blue-500"
              />
            </div>
          </div>
        </main>

        {/* Profile Sheet */}
        <Sheet open={showProfileForm} onOpenChange={setShowProfileForm}>
          <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-left">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-purple-500" />
                  <span>Complete Your Profile</span>
                </div>
              </SheetTitle>
              <SheetDescription className="text-left">
                Please provide your basic information to get started with RTD Connect.
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} className="mt-6 space-y-6">
              <div className="space-y-4">
                <FormField label="First Name" error={profileErrors.firstName} required>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => handleProfileInputChange('firstName', e.target.value)}
                    className={`w-full px-3 py-2 border ${profileErrors.firstName ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="Enter your first name"
                  />
                </FormField>

                <FormField label="Last Name" error={profileErrors.lastName} required>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => handleProfileInputChange('lastName', e.target.value)}
                    className={`w-full px-3 py-2 border ${profileErrors.lastName ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="Enter your last name"
                  />
                </FormField>

                <FormField label="Phone Number" error={profileErrors.phone} required>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={handlePhoneChange}
                    className={`w-full px-3 py-2 border ${profileErrors.phone ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="(403) 555-0123"
                  />
                </FormField>

                <FormField label="Birthday" error={profileErrors.birthday} required>
                  <input
                    type="date"
                    value={profileData.birthday}
                    onChange={(e) => handleProfileInputChange('birthday', e.target.value)}
                    className={`w-full px-3 py-2 border ${profileErrors.birthday ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                </FormField>

                <FormField label="Address" error={profileErrors.address} required>
                  <AddressPicker
                    value={profileData.address}
                    onAddressSelect={handleAddressSelect}
                    error={profileErrors.address}
                    placeholder="Start typing your address..."
                  />
                </FormField>
              </div>

              {profileErrors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{profileErrors.submit}</p>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmittingProfile}
                  className={`w-full py-3 px-4 border border-transparent rounded-md text-white font-medium ${
                    isSubmittingProfile 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors flex items-center justify-center`}
                >
                  {isSubmittingProfile ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      Save Profile
                      <CheckCircle2 className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </SheetContent>
        </Sheet>

        {/* Mobile Navigation Sheet */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-80 p-0">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                    {userProfile?.firstName && userProfile?.lastName
                      ? `${userProfile.firstName[0]}${userProfile.lastName[0]}`
                      : (user?.email ? user.email[0].toUpperCase() : 'U')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {userProfile?.firstName && userProfile?.lastName 
                        ? `${userProfile.firstName} ${userProfile.lastName}`
                        : user?.email || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 px-6 py-4 space-y-4">
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3 text-gray-400" />
                    Sign Out
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200">
                <div className="text-center text-xs text-gray-500">
                  <p>&copy; {new Date().getFullYear()} RTD Connect</p>
                  <p>Home Education Portal</p>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // If profile is complete but no facilitator selected, show facilitator selection
  if (!hasFacilitatorSelected && !hasRegisteredFamily && !customClaims?.familyId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-purple-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <RTDConnectLogo />
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="flex lg:hidden items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              {/* Desktop profile dropdown */}
              <div className="hidden lg:flex items-center space-x-3">
                <ProfileDropdown 
                  userProfile={{ ...userProfile, email: user?.email }}
                  onEditProfile={() => setShowProfileForm(true)}
                  onSignOut={handleSignOut}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Facilitator Selection */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FacilitatorSelection 
            selectedFacilitatorId={selectedFacilitatorId}
            onFacilitatorSelect={handleFacilitatorSelect}
            showAsStep={true}
            onContinue={handleContinueToFamilyCreation}
          />
        </main>

        {/* Profile Sheet */}
        <Sheet open={showProfileForm} onOpenChange={setShowProfileForm}>
          <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-left">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-purple-500" />
                  <span>Edit Your Profile</span>
                </div>
              </SheetTitle>
              <SheetDescription className="text-left">
                Update your basic information and contact details.
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} className="mt-6 space-y-6">
              <div className="space-y-4">
                <FormField label="First Name" error={profileErrors.firstName} required>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => handleProfileInputChange('firstName', e.target.value)}
                    className={`w-full px-3 py-2 border ${profileErrors.firstName ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="Enter your first name"
                  />
                </FormField>

                <FormField label="Last Name" error={profileErrors.lastName} required>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => handleProfileInputChange('lastName', e.target.value)}
                    className={`w-full px-3 py-2 border ${profileErrors.lastName ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="Enter your last name"
                  />
                </FormField>

                <FormField label="Phone Number" error={profileErrors.phone} required>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={handlePhoneChange}
                    className={`w-full px-3 py-2 border ${profileErrors.phone ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="(403) 555-0123"
                  />
                </FormField>

                <FormField label="Birthday" error={profileErrors.birthday} required>
                  <input
                    type="date"
                    value={profileData.birthday}
                    onChange={(e) => handleProfileInputChange('birthday', e.target.value)}
                    className={`w-full px-3 py-2 border ${profileErrors.birthday ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                </FormField>

                <FormField label="Address" error={profileErrors.address} required>
                  <AddressPicker
                    value={profileData.address}
                    onAddressSelect={handleAddressSelect}
                    error={profileErrors.address}
                    placeholder="Start typing your address..."
                  />
                </FormField>
              </div>

              {profileErrors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{profileErrors.submit}</p>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmittingProfile}
                  className={`w-full py-3 px-4 border border-transparent rounded-md text-white font-medium ${
                    isSubmittingProfile 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors flex items-center justify-center`}
                >
                  {isSubmittingProfile ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      Save Profile
                      <CheckCircle2 className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </SheetContent>
        </Sheet>

        {/* Mobile Navigation Sheet */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-80 p-0">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                    {userProfile?.firstName && userProfile?.lastName
                      ? `${userProfile.firstName[0]}${userProfile.lastName[0]}`
                      : (userProfile?.email ? userProfile.email[0].toUpperCase() : 'U')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {userProfile?.firstName && userProfile?.lastName 
                        ? `${userProfile.firstName} ${userProfile.lastName}`
                        : userProfile?.email || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {userProfile?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 px-6 py-4 space-y-4">
                {userProfile?.firstName && (
                  <div className="pb-4 border-b border-gray-200">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Profile Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{userProfile.firstName} {userProfile.lastName}</span>
                      </div>
                      {userProfile.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{userProfile.phone}</span>
                        </div>
                      )}
                      {userProfile.address && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700 truncate">
                            {userProfile.address.city}, {userProfile.address.province}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowProfileForm(true);
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <Edit3 className="w-4 h-4 mr-3 text-gray-400" />
                    Edit Profile
                  </button>
                  
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3 text-gray-400" />
                    Sign Out
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200">
                <div className="text-center text-xs text-gray-500">
                  <p>&copy; {new Date().getFullYear()} RTD Connect</p>
                  <p>Home Education Portal</p>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Family Creation Sheet - opened from facilitator selection */}
        <FamilyCreationSheet
          isOpen={showFamilyCreation}
          onOpenChange={setShowFamilyCreation}
          familyKey={hasRegisteredFamily ? familyKey : null}
          hasRegisteredFamily={hasRegisteredFamily}
          initialFamilyData={familyData}
          onFamilyDataChange={handleFamilyDataChange}
          onComplete={handleFamilyComplete}
          selectedFacilitator={selectedFacilitator} // Pass facilitator info
        />
      </div>
    );
  }

  // If facilitator is selected but no family registration, show family setup
  if (hasFacilitatorSelected && !hasRegisteredFamily && !customClaims?.familyId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-purple-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <RTDConnectLogo />
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="flex lg:hidden items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              {/* Desktop profile dropdown */}
              <div className="hidden lg:flex items-center space-x-3">
                <ProfileDropdown 
                  userProfile={{ ...userProfile, email: user?.email }}
                  onEditProfile={() => setShowProfileForm(true)}
                  onSignOut={handleSignOut}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Family Profile</h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Now let's set up your family profile. Add your students and family members to get started with home education services.
              </p>
            </div>

            <button
              onClick={handleStartRegistration}
              disabled={isSettingUpFamily}
              className={`w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-lg font-medium transition-colors ${
                isSettingUpFamily
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
              }`}
            >
              {isSettingUpFamily ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-lg">Setting Up...</span>
                </>
              ) : (
                <>
                  <Users className="w-5 h-5" />
                  <span className="text-lg">Create Family Profile</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {/* Feature preview */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Coming Soon to Your Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard 
                icon={Calendar}
                title="Course Scheduling"
                description="Plan and track your students' course schedules"
                gradient="from-purple-500 to-cyan-500"
              />
              <FeatureCard 
                icon={FileText}
                title="Report Generation"
                description="Generate progress reports and transcripts"
                gradient="from-blue-500 to-cyan-500"
              />
              <FeatureCard 
                icon={Shield}
                title="Secure Communication"
                description="Communicate securely with RTD Academy staff"
                gradient="from-cyan-500 to-blue-500"
              />
            </div>
          </div>
        </main>

        {/* Profile Sheet */}
        <Sheet open={showProfileForm} onOpenChange={setShowProfileForm}>
          <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-left">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-purple-500" />
                  <span>Edit Your Profile</span>
                </div>
              </SheetTitle>
              <SheetDescription className="text-left">
                Update your basic information and contact details.
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} className="mt-6 space-y-6">
              <div className="space-y-4">
                <FormField label="First Name" error={profileErrors.firstName} required>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => handleProfileInputChange('firstName', e.target.value)}
                    className={`w-full px-3 py-2 border ${profileErrors.firstName ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="Enter your first name"
                  />
                </FormField>

                <FormField label="Last Name" error={profileErrors.lastName} required>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => handleProfileInputChange('lastName', e.target.value)}
                    className={`w-full px-3 py-2 border ${profileErrors.lastName ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="Enter your last name"
                  />
                </FormField>

                <FormField label="Phone Number" error={profileErrors.phone} required>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={handlePhoneChange}
                    className={`w-full px-3 py-2 border ${profileErrors.phone ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="(403) 555-0123"
                  />
                </FormField>

                <FormField label="Birthday" error={profileErrors.birthday} required>
                  <input
                    type="date"
                    value={profileData.birthday}
                    onChange={(e) => handleProfileInputChange('birthday', e.target.value)}
                    className={`w-full px-3 py-2 border ${profileErrors.birthday ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                </FormField>

                <FormField label="Address" error={profileErrors.address} required>
                  <AddressPicker
                    value={profileData.address}
                    onAddressSelect={handleAddressSelect}
                    error={profileErrors.address}
                    placeholder="Start typing your address..."
                  />
                </FormField>
              </div>

              {profileErrors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{profileErrors.submit}</p>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmittingProfile}
                  className={`w-full py-3 px-4 border border-transparent rounded-md text-white font-medium ${
                    isSubmittingProfile 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors flex items-center justify-center`}
                >
                  {isSubmittingProfile ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      Save Profile
                      <CheckCircle2 className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </SheetContent>
        </Sheet>

        {/* Family Creation Sheet */}
        <FamilyCreationSheet
          isOpen={showFamilyCreation}
          onOpenChange={setShowFamilyCreation}
          familyKey={hasRegisteredFamily ? familyKey : null}
          hasRegisteredFamily={hasRegisteredFamily}
          initialFamilyData={familyData}
          onFamilyDataChange={handleFamilyDataChange}
          onComplete={handleFamilyComplete}
        />

        {/* Mobile Navigation Sheet */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-80 p-0">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                    {userProfile?.firstName && userProfile?.lastName
                      ? `${userProfile.firstName[0]}${userProfile.lastName[0]}`
                      : (userProfile?.email ? userProfile.email[0].toUpperCase() : 'U')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {userProfile?.firstName && userProfile?.lastName 
                        ? `${userProfile.firstName} ${userProfile.lastName}`
                        : userProfile?.email || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {userProfile?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 px-6 py-4 space-y-4">
                {userProfile?.firstName && (
                  <div className="pb-4 border-b border-gray-200">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Profile Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{userProfile.firstName} {userProfile.lastName}</span>
                      </div>
                      {userProfile.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{userProfile.phone}</span>
                        </div>
                      )}
                      {userProfile.address && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700 truncate">
                            {userProfile.address.city}, {userProfile.address.province}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowProfileForm(true);
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <Edit3 className="w-4 h-4 mr-3 text-gray-400" />
                    Edit Profile
                  </button>
                  
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3 text-gray-400" />
                    Sign Out
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200">
                <div className="text-center text-xs text-gray-500">
                  <p>&copy; {new Date().getFullYear()} RTD Connect</p>
                  <p>Home Education Portal</p>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // If family is registered but no facilitator selected, show facilitator selection
  if (hasRegisteredFamily && !hasFacilitatorSelected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-purple-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <RTDConnectLogo />
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="flex lg:hidden items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              {/* Desktop profile dropdown */}
              <div className="hidden lg:flex items-center space-x-3">
                <ProfileDropdown 
                  userProfile={{ ...userProfile, email: user?.email }}
                  onEditProfile={() => setShowProfileForm(true)}
                  onSignOut={handleSignOut}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Facilitator Selection for Existing Families */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Choose Your Facilitator</h3>
                <p className="text-sm text-blue-800">
                  Before accessing your full dashboard, please select a facilitator who will guide your family through the home education process.
                </p>
              </div>
            </div>
          </div>
          
          <FacilitatorSelection 
            selectedFacilitatorId={selectedFacilitatorId}
            onFacilitatorSelect={handleFacilitatorSelect}
            showAsStep={true}
            onContinue={() => {
              // Don't need to do anything special - they'll see the dashboard after selection
            }}
          />
        </main>

        {/* Profile Sheet */}
        <Sheet open={showProfileForm} onOpenChange={setShowProfileForm}>
          <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-left">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-purple-500" />
                  <span>Edit Your Profile</span>
                </div>
              </SheetTitle>
              <SheetDescription className="text-left">
                Update your basic information and contact details.
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} className="mt-6 space-y-6">
              <div className="space-y-4">
                <FormField label="First Name" error={profileErrors.firstName} required>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => handleProfileInputChange('firstName', e.target.value)}
                    className={`w-full px-3 py-2 border ${profileErrors.firstName ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="Enter your first name"
                  />
                </FormField>

                <FormField label="Last Name" error={profileErrors.lastName} required>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => handleProfileInputChange('lastName', e.target.value)}
                    className={`w-full px-3 py-2 border ${profileErrors.lastName ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="Enter your last name"
                  />
                </FormField>

                <FormField label="Phone Number" error={profileErrors.phone} required>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={handlePhoneChange}
                    className={`w-full px-3 py-2 border ${profileErrors.phone ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="(403) 555-0123"
                  />
                </FormField>

                <FormField label="Birthday" error={profileErrors.birthday} required>
                  <input
                    type="date"
                    value={profileData.birthday}
                    onChange={(e) => handleProfileInputChange('birthday', e.target.value)}
                    className={`w-full px-3 py-2 border ${profileErrors.birthday ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                </FormField>

                <FormField label="Address" error={profileErrors.address} required>
                  <AddressPicker
                    value={profileData.address}
                    onAddressSelect={handleAddressSelect}
                    error={profileErrors.address}
                    placeholder="Start typing your address..."
                  />
                </FormField>
              </div>

              {profileErrors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{profileErrors.submit}</p>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmittingProfile}
                  className={`w-full py-3 px-4 border border-transparent rounded-md text-white font-medium ${
                    isSubmittingProfile 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors flex items-center justify-center`}
                >
                  {isSubmittingProfile ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      Save Profile
                      <CheckCircle2 className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </SheetContent>
        </Sheet>

        {/* Mobile Navigation Sheet */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-80 p-0">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                    {userProfile?.firstName && userProfile?.lastName
                      ? `${userProfile.firstName[0]}${userProfile.lastName[0]}`
                      : (userProfile?.email ? userProfile.email[0].toUpperCase() : 'U')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {userProfile?.firstName && userProfile?.lastName 
                        ? `${userProfile.firstName} ${userProfile.lastName}`
                        : userProfile?.email || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {userProfile?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 px-6 py-4 space-y-4">
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowProfileForm(true);
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <Edit3 className="w-4 h-4 mr-3 text-gray-400" />
                    Edit Profile
                  </button>
                  
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3 text-gray-400" />
                    Sign Out
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200">
                <div className="text-center text-xs text-gray-500">
                  <p>&copy; {new Date().getFullYear()} RTD Connect</p>
                  <p>Home Education Portal</p>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // If family is registered, show the full dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      {/* Under Construction Modal */}
      <UnderConstructionModal
        isOpen={showUnderConstruction}
        password={constructionPassword}
        setPassword={setConstructionPassword}
        onSubmit={handleConstructionPasswordSubmit}
        error={constructionPasswordError}
      />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3 sm:space-x-6">
              <RTDConnectLogo />
              <div className="hidden lg:block">
                <UserTypeBadge customClaims={customClaims} />
              </div>
            </div>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex lg:hidden items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Desktop profile dropdown */}
            <div className="hidden lg:flex items-center space-x-3">
              <ProfileDropdown 
                userProfile={{ ...userProfile, email: user?.email }}
                onEditProfile={() => setShowProfileForm(true)}
                onSignOut={handleSignOut}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Family Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Embedded Notification Banner - shows compliance alerts */}
        {stripeConnectStatus?.accountId && accountSession?.clientSecret && 
         sessionStates[`${stripeConnectStatus.accountId}-notification`]?.created && 
         !sessionStates[`${stripeConnectStatus.accountId}-notification`]?.claimed && (
          <div className="mb-6" key={`notification-${stripeConnectStatus.accountId}-${accountSession.clientSecret.slice(-8)}`}>
            <EmbeddedNotificationBanner 
              familyId={customClaims?.familyId}
            />
          </div>
        )}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {familyData.familyName || 'Family Dashboard'}
          </h1>
          <p className="text-gray-600 mb-4">
            Welcome back! Here's your family information at a glance.
          </p>
          
          {/* Registration Status Card */}
          <RegistrationStatusCard 
            registrationStatus={getRegistrationStatus()}
            onActionClick={() => {
              // Find the first student needing a form and open individual form
              const studentsNeedingForms = familyData.students?.filter(student => 
                ['pending', 'incomplete', 'draft'].includes(studentFormStatuses[student.id]?.current)
              ) || [];
              
              if (studentsNeedingForms.length > 0) {
                // Open form for first student needing registration
                setSelectedStudent(studentsNeedingForms[0]);
                setShowNotificationForm(true);
              }
            }}
          />
        </div>

        {/* Quick Actions & Family Status */}
        <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 border border-gray-100">
          {/* Action Buttons Row */}
          <div className="mb-6">
            <div className="flex-shrink-0">
              {customClaims?.familyRole === 'primary_guardian' ? (
                <div className="space-y-3">
                  {/* Top Row - Primary Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleStartRegistration}
                      className="w-full flex items-center justify-center space-x-2 px-4 lg:px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-sm hover:shadow-md"
                    >
                      <Edit3 className="w-5 h-5" />
                      <span className="text-sm lg:text-base">Update Family Information</span>
                    </button>

                    {/* Acceptance Letter Button - only show when all students have completed all forms */}
                    {familyPaymentEligibility?.allStudentsComplete && (
                      <button
                        onClick={() => setShowAcceptanceLetter(true)}
                        className="w-full flex items-center justify-center space-x-2 px-4 lg:px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 border border-gray-300 hover:border-gray-400 transition-all shadow-sm hover:shadow-md"
                      >
                        <Download className="w-5 h-5" />
                        <span className="text-sm lg:text-base">Download Acceptance Letter</span>
                      </button>
                    )}
                  </div>
                  
                  {/* Bottom Row - Banking/Payment Actions */}
                  {familyPaymentEligibility?.canAccessPayments && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Account Management Button */}
                      <button
                        onClick={stripeConnectStatus?.accountId ? handleOpenAccountManagement : handleCreateAndOpenAccountManagement}
                        disabled={sessionLoading}
                        className="w-full flex items-center justify-center space-x-2 px-4 lg:px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 border border-gray-300 hover:border-gray-400 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                      >
                        <Settings className="w-5 h-5" />
                        <span className="text-sm lg:text-base">
                          {stripeConnectStatus?.accountId ? 'Banking Settings' : 'Set Up Banking'}
                        </span>
                      </button>

                      {/* Submit Expenses Button */}
                      <button
                        onClick={handleOpenReceiptUploadForm}
                        className="w-full flex items-center justify-center space-x-2 px-4 lg:px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 border border-gray-300 hover:border-gray-400 transition-all shadow-sm hover:shadow-md"
                      >
                        <Upload className="w-5 h-5" />
                        <span className="text-sm lg:text-base">Submit Expenses</span>
                      </button>

                      {/* Payouts View Button - only if Stripe Connect is set up */}
                      {stripeConnectStatus?.accountId && (
                        <button
                          onClick={handleOpenPayoutsView}
                          disabled={sessionLoading}
                          className="w-full flex items-center justify-center space-x-2 px-4 lg:px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 border border-gray-300 hover:border-gray-400 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                        >
                          <DollarSign className="w-5 h-5" />
                          <span className="text-sm lg:text-base">View Payouts</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full lg:w-auto flex items-center justify-center space-x-2 px-4 lg:px-6 py-3 bg-gray-50 text-gray-500 rounded-lg border border-gray-200">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm lg:text-base">Only Primary Guardian Can Edit</span>
                </div>
              )}
            </div>
          </div>

          {/* Stripe Connect Information Section */}
          {customClaims?.familyRole === 'primary_guardian' && (
            <div className="mb-6">
                <button
                  onClick={() => setShowStripeInfo(!showStripeInfo)}
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors mb-2"
                >
                  <Info className="w-4 h-4" />
                  <span>Learn more about secure banking & payouts</span>
                  <ChevronDown className={`w-4 h-4 transform transition-transform ${showStripeInfo ? 'rotate-180' : ''}`} />
                </button>
                
                {showStripeInfo && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3 text-sm">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-blue-800 font-medium mb-1">Bank-level Security with Stripe</p>
                        <p className="text-blue-700">
                          We use Stripe for trusted security and PCI compliance. Your banking information is encrypted 
                          and never stored on our servers - the same security used by major banks and millions of businesses worldwide.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-green-800 font-medium mb-1">Simple Setup, Quick Payouts</p>
                        <p className="text-green-700">
                          Quick bank account setup enables direct payouts for education expenses. Once set up, 
                          receive reimbursements automatically in 1-2 business days - no ongoing worry needed.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Heart className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-purple-800 font-medium mb-1">Parent-Friendly Process</p>
                        <p className="text-purple-700">
                          Identity verification is required by financial regulations, but most of your information 
                          is pre-filled from your RTD Academy profile. You can update banking information anytime through your dashboard.
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-blue-200">
                      <p className="text-blue-600 text-xs">
                        <strong>Need help?</strong> Contact our support team - we're here to make this process as smooth as possible.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

          {/* Family Status & Facilitator Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Family Status */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Family Status</h3>
                <p className="text-sm text-green-600 font-medium">Active • Profile Complete</p>
              </div>
            </div>

            {/* Facilitator Info */}
            {selectedFacilitator ? (
              <div className="flex items-center space-x-4">
                <a 
                  href={getFacilitatorProfileUrl(selectedFacilitator)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                  title={`View ${selectedFacilitator.name}'s profile`}
                >
                  <img 
                    src={selectedFacilitator.image} 
                    alt={selectedFacilitator.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-purple-300 hover:border-purple-400"
                  />
                </a>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Your Facilitator</h3>
                  <p className="text-sm text-purple-600 font-medium">{selectedFacilitator.name}</p>
                  <p className="text-xs text-gray-500">{selectedFacilitator.title}</p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center space-x-4 mb-3">
                  <AlertTriangle className="w-8 h-8 text-orange-500" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-orange-900">No Facilitator Selected</h3>
                    <p className="text-xs text-orange-700">Please select a facilitator to continue</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFacilitatorChange(true)}
                  className="w-full px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 text-sm font-medium rounded-md transition-colors flex items-center justify-center space-x-2 border border-orange-300 hover:border-orange-400"
                >
                  <Users className="w-4 h-4" />
                  <span>Select Facilitator</span>
                </button>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-4 text-xs lg:text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-purple-500" />
              <span><strong>{familyData.students?.length || 0}</strong> Students</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span><strong>{familyData.guardians?.length || 0}</strong> Guardians</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <span>
                <strong>
                  {familyData.students?.filter(student => 
                    studentFormStatuses[student.id]?.current === 'submitted'
                  ).length || 0}
                </strong> of <strong>{familyData.students?.length || 0}</strong> forms submitted
              </span>
            </div>
          </div>
        </div>

        {/* Family Members List */}
        {((familyData.students && familyData.students.length > 0) || (familyData.guardians && familyData.guardians.length > 0)) && (
          <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-100">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Your Family Members</h2>
            
            
            {/* Family Budget Overview */}
            {familyData.students && familyData.students.length > 0 && Object.keys(studentBudgets).length > 0 && (
              <FamilyBudgetOverview 
                students={familyData.students}
                budgetData={studentBudgets}
                familyPaymentEligibility={familyPaymentEligibility}
              />
            )}
            
            {/* Students Section */}
            {familyData.students && familyData.students.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-blue-500" />
                  Students ({familyData.students.length})
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                    {familyData.students.map((student, index) => {
                      const formStatus = studentFormStatuses[student.id]?.current || 'pending';
                      const docStatus = studentDocumentStatuses[student.id] || { status: 'pending', documentCount: 0 };
                      const studentEligibility = studentPaymentEligibility[student.id];
                      return (
                        <div key={student.id || index} className="border border-blue-200 rounded-lg p-3 sm:p-4 bg-blue-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {student.preferredName || student.firstName} {student.lastName}
                              </h4>
                              {studentEligibility && (
                                <CompactFormCompletionBadge
                                  completionPercentage={studentEligibility.completionPercentage}
                                  isComplete={studentEligibility.isComplete}
                                  canAccessPayments={studentEligibility.canAccessPayments}
                                />
                              )}
                            </div>
                            <div className="mt-2 space-y-1 text-xs sm:text-sm text-gray-600">
                              <p>ASN: {student.asn}</p>
                              <p>Grade: {student.grade}</p>
                              <p>Gender: {student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : student.gender === 'X' ? 'Other' : student.gender || 'Not specified'}</p>
                              <p>Birthday: {formatDateForDisplay(student.birthday)}</p>
                              {student.email && <p className="truncate">Email: {student.email}</p>}
                              {student.phone && <p>Phone: {student.phone}</p>}
                            </div>
                            
                            {/* Home Education Notification Form Status */}
                            <div className="mt-3 pt-3 border-t border-blue-300">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <FileText className="w-4 h-4 text-blue-500" />
                                  <span className="text-sm font-medium text-gray-700">
                                    {activeSchoolYear} Registration
                                  </span>
                                  {formStatus === 'submitted' ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                  ) : formStatus === 'incomplete' ? (
                                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                                  ) : ['draft', 'draft-complete'].includes(formStatus) ? (
                                    <Clock className="w-4 h-4 text-blue-500" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 text-orange-500" />
                                  )}
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium shadow-sm border ${
                                  formStatus === 'submitted' ? 'bg-green-100 text-green-700 border-green-300' :
                                  formStatus === 'incomplete' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                                  formStatus === 'draft-complete' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                                  formStatus === 'draft' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                                  'bg-orange-100 text-orange-700 border-orange-300'
                                }`}>
                                  {formStatus === 'submitted' ? 'Complete' :
                                   formStatus === 'incomplete' ? 'Incomplete' :
                                   formStatus === 'draft-complete' ? 'Ready' :
                                   formStatus === 'draft' ? 'Draft' : 'Required'}
                                </span>
                              </div>
                              
                              {/* Form Access Button - Only for Primary Guardians */}
                              {customClaims?.familyRole === 'primary_guardian' ? (
                                <div className="space-y-2">
                                  <button
                                    onClick={() => {
                                      setSelectedStudent(student);
                                      setShowNotificationForm(true);
                                    }}
                                    className={`w-full px-3 py-2 text-sm rounded-md transition-all shadow-sm hover:shadow-md ${
                                      formStatus === 'submitted' ?
                                      'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300 hover:border-green-400' :
                                      formStatus === 'incomplete' ?
                                      'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-300 hover:border-yellow-400' :
                                      ['draft', 'draft-complete'].includes(formStatus) ?
                                      'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300 hover:border-blue-400' :
                                      'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300 hover:border-purple-400'
                                    }`}
                                  >
                                    {formStatus === 'submitted' ? `Update ${activeSchoolYear} Form` : 
                                     formStatus === 'incomplete' ? `Complete Missing Parts` :
                                     formStatus === 'draft-complete' ? `Submit ${activeSchoolYear} Form` :
                                     formStatus === 'draft' ? `Complete ${activeSchoolYear} Form` : 
                                     `Start ${activeSchoolYear} Form`}
                                  </button>
                                </div>
                              ) : (
                                <div className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-500 rounded-md text-center">
                                  Contact Primary Guardian
                                </div>
                              )}
                            </div>

                            {/* Citizenship Documents Status */}
                            <div className="mt-3 pt-3 border-t border-blue-300">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <Upload className="w-4 h-4 text-purple-500" />
                                  <span className="text-sm font-medium text-gray-700">
                                    Citizenship Documents
                                  </span>
                                  {docStatus.status === 'completed' ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 text-orange-500" />
                                  )}
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium shadow-sm border ${
                                  docStatus.status === 'completed' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-orange-100 text-orange-700 border-orange-300'
                                }`}>
                                  {docStatus.status === 'completed' ? `${docStatus.documentCount} uploaded` : 'Required'}
                                </span>
                              </div>
                              
                              {/* Document Upload Button - Only for Primary Guardians */}
                              {customClaims?.familyRole === 'primary_guardian' ? (
                                <button
                                  onClick={() => handleOpenCitizenshipDocs(student)}
                                  className={`w-full px-3 py-2 text-sm rounded-md transition-all shadow-sm hover:shadow-md ${
                                    docStatus.status === 'completed' ?
                                    'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300 hover:border-green-400' :
                                    'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300 hover:border-purple-400'
                                  }`}
                                >
                                  {docStatus.status === 'completed' ? 'View/Update Documents' : 'Upload Documents'}
                                </button>
                              ) : (
                                <div className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-500 rounded-md text-center">
                                  Contact Primary Guardian
                                </div>
                              )}
                            </div>

                            {/* Program Plan Status */}
                            <div className="mt-3 pt-3 border-t border-blue-300">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <FileText className="w-4 h-4 text-green-500" />
                                  <span className="text-sm font-medium text-gray-700">
                                    Program Plan
                                  </span>
                                  {studentSOLOPlanStatuses[student.id]?.status === 'submitted' ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                  ) : studentSOLOPlanStatuses[student.id]?.status === 'draft' ? (
                                    <Clock className="w-4 h-4 text-blue-500" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 text-orange-500" />
                                  )}
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium shadow-sm border ${
                                  studentSOLOPlanStatuses[student.id]?.status === 'submitted' ? 'bg-green-100 text-green-700 border-green-300' : 
                                  studentSOLOPlanStatuses[student.id]?.status === 'draft' ? 'bg-blue-100 text-blue-700 border-blue-300' : 
                                  'bg-orange-100 text-orange-700 border-orange-300'
                                }`}>
                                  {studentSOLOPlanStatuses[student.id]?.status === 'submitted' ? 'Completed' : 
                                   studentSOLOPlanStatuses[student.id]?.status === 'draft' ? 'In Progress' : 'Required'}
                                </span>
                              </div>
                              
                              {/* Program Plan Button - Only for Primary Guardians */}
                              {customClaims?.familyRole === 'primary_guardian' ? (
                                <div className="space-y-2">
                                  <button
                                    onClick={() => handleOpenSOLOPlan(student)}
                                    className={`w-full px-3 py-2 text-sm rounded-md transition-all shadow-sm hover:shadow-md ${
                                      studentSOLOPlanStatuses[student.id]?.status === 'submitted' ?
                                      'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300 hover:border-green-400' :
                                      studentSOLOPlanStatuses[student.id]?.status === 'draft' ?
                                      'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300 hover:border-blue-400' :
                                      'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300 hover:border-purple-400'
                                    }`}
                                  >
                                    {studentSOLOPlanStatuses[student.id]?.status === 'submitted' ? 'View/Update Program Plan' : 
                                     studentSOLOPlanStatuses[student.id]?.status === 'draft' ? 'Continue Program Plan' : 'Create Program Plan'}
                                  </button>
                                  
                                  {/* Download Latest PDF Button - Only for submitted plans */}
                                  {studentSOLOPlanStatuses[student.id]?.status === 'submitted' && 
                                   studentSOLOPlanStatuses[student.id]?.pdfVersions?.length > 0 && (
                                    <button
                                      onClick={() => {
                                        const latestPDF = studentSOLOPlanStatuses[student.id].pdfVersions[
                                          studentSOLOPlanStatuses[student.id].pdfVersions.length - 1
                                        ];
                                        window.open(latestPDF.url, '_blank');
                                      }}
                                      className="w-full px-3 py-2 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 hover:border-gray-400 transition-all shadow-sm hover:shadow-md flex items-center justify-center space-x-2"
                                    >
                                      <Download className="w-4 h-4" />
                                      <span>Download Latest PDF</span>
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-500 rounded-md text-center">
                                  Contact Primary Guardian
                                </div>
                              )}
                            </div>

                            {/* Budget Information Section */}
                            {studentBudgets[student.id] && (
                              <div className={`mt-3 pt-3 border-t border-blue-300 ${!studentEligibility?.canAccessPayments ? 'relative' : ''}`}>
                                {/* Payment restriction overlay for budget section */}
                                {!studentEligibility?.canAccessPayments && (
                                  <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center rounded-lg z-10">
                                    <div className="text-center p-2">
                                      <Shield className="w-6 h-6 text-red-500 mx-auto mb-1" />
                                      <p className="text-xs text-red-600 font-medium">Budget Locked</p>
                                      <p className="text-xs text-gray-500">Complete forms to unlock</p>
                                    </div>
                                  </div>
                                )}
                                
                                <div className={`flex items-center justify-between mb-3 ${!studentEligibility?.canAccessPayments ? 'opacity-40' : ''}`}>
                                  <div className="flex items-center space-x-2">
                                    <DollarSign className="w-4 h-4 text-purple-500" />
                                    <span className="text-sm font-medium text-gray-700">
                                      Budget Tracking
                                    </span>
                                    {!studentEligibility?.canAccessPayments ? (
                                      <Shield className="w-4 h-4 text-red-500" />
                                    ) : studentBudgets[student.id].percentageUsed > 95 ? (
                                      <AlertTriangle className="w-4 h-4 text-red-500" />
                                    ) : studentBudgets[student.id].percentageUsed > 80 ? (
                                      <Clock className="w-4 h-4 text-yellow-500" />
                                    ) : (
                                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm font-bold text-gray-900">
                                      {studentBudgets[student.id].fundingFormatted}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {studentBudgets[student.id].fundingLabel}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Budget Progress Bar */}
                                <div className={`mb-3 ${!studentEligibility?.canAccessPayments ? 'opacity-40' : ''}`}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium text-gray-600">
                                      {!studentEligibility?.canAccessPayments ? 'Access restricted' :
                                       studentBudgets[student.id].percentageUsed > 95 ? 'Budget nearly exhausted' :
                                       studentBudgets[student.id].percentageUsed > 80 ? 'Budget running low' :
                                       studentBudgets[student.id].percentageUsed > 60 ? 'Good progress' :
                                       'Plenty of budget remaining'}
                                    </span>
                                    <span className="text-xs text-gray-600">
                                      {studentBudgets[student.id].percentageUsed.toFixed(1)}% used
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full transition-all duration-500 ${
                                        !studentEligibility?.canAccessPayments ? 'bg-gray-400' :
                                        studentBudgets[student.id].percentageUsed > 95 ? 'bg-red-500' :
                                        studentBudgets[student.id].percentageUsed > 80 ? 'bg-yellow-500' :
                                        studentBudgets[student.id].percentageUsed > 60 ? 'bg-blue-500' :
                                        'bg-green-500'
                                      }`}
                                      style={{ width: `${Math.min(studentBudgets[student.id].percentageUsed, 100)}%` }}
                                    />
                                  </div>
                                </div>
                                
                                {/* Budget Breakdown */}
                                <div className={`grid grid-cols-3 gap-2 text-center text-xs ${!studentEligibility?.canAccessPayments ? 'opacity-40' : ''}`}>
                                  <div className="p-2 bg-green-50 rounded">
                                    <div className="font-medium text-green-600">
                                      ${studentBudgets[student.id].remaining.toFixed(2)}
                                    </div>
                                    <div className="text-gray-500">Remaining</div>
                                  </div>
                                  <div className="p-2 bg-blue-50 rounded">
                                    <div className="font-medium text-blue-600">
                                      ${studentBudgets[student.id].spent.toFixed(2)}
                                    </div>
                                    <div className="text-gray-500">Spent</div>
                                  </div>
                                  <div className="p-2 bg-purple-50 rounded">
                                    <div className="font-medium text-purple-600">
                                      {studentReimbursementStatuses[student.id]?.pending || 0}
                                    </div>
                                    <div className="text-gray-500">Pending</div>
                                  </div>
                                </div>
                                
                                {/* Latest Activity */}
                                {studentReimbursementStatuses[student.id]?.latestSubmission && (
                                  <div className={`mt-2 pt-2 border-t border-gray-200 ${!studentEligibility?.canAccessPayments ? 'opacity-40' : ''}`}>
                                    <div className="text-xs text-gray-500">
                                      Latest: {new Date(studentReimbursementStatuses[student.id].latestSubmission.submittedAt).toLocaleDateString()}
                                      {studentReimbursementStatuses[student.id].latestSubmission.studentAllocation && (
                                        <span className="ml-1">
                                          (${studentReimbursementStatuses[student.id].latestSubmission.studentAllocation.amount.toFixed(2)})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <GraduationCap className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                    })}
                </div>
              </div>
            )}

            {/* Guardians Section */}
            {familyData.guardians && familyData.guardians.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-500" />
                  Guardians ({familyData.guardians.length})
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {familyData.guardians.map((guardian, index) => (
                    <div key={guardian.email || index} className="border border-blue-200 rounded-lg p-3 sm:p-4 bg-blue-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {guardian.firstName} {guardian.lastName}
                          </h4>
                          <div className="mt-2 space-y-1 text-xs sm:text-sm text-gray-600">
                            <p className="truncate">Email: {guardian.email}</p>
                            {guardian.phone && <p>Phone: {guardian.phone}</p>}
                            <p>Role: {guardian.guardianType === 'primary_guardian' ? 'Primary Guardian' : 'Guardian'}</p>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            guardian.guardianType === 'primary_guardian' 
                              ? 'bg-purple-500' 
                              : 'bg-blue-500'
                          }`}>
                            {guardian.guardianType === 'primary_guardian' ? (
                              <Crown className="w-4 h-4 text-white" />
                            ) : (
                              <Shield className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} RTD Connect - Home Education Portal. All rights reserved.</p>
            <p className="mt-1">Need help? Contact us at support@rtdacademy.com</p>
            <div className="mt-3 space-x-4">
              <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline">Privacy Statement</a>
              <span>|</span>
              <a href="/terms" className="text-blue-600 hover:text-blue-800 underline">Terms & Conditions</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Profile Sheet */}
      <Sheet open={showProfileForm} onOpenChange={setShowProfileForm}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-left">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-purple-500" />
                <span>Edit Your Profile</span>
              </div>
            </SheetTitle>
            <SheetDescription className="text-left">
              Update your basic information and contact details.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} className="mt-6 space-y-6">
            <div className="space-y-4">
              <FormField label="First Name" error={profileErrors.firstName} required>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => handleProfileInputChange('firstName', e.target.value)}
                  className={`w-full px-3 py-2 border ${profileErrors.firstName ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  placeholder="Enter your first name"
                />
              </FormField>

              <FormField label="Last Name" error={profileErrors.lastName} required>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => handleProfileInputChange('lastName', e.target.value)}
                  className={`w-full px-3 py-2 border ${profileErrors.lastName ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  placeholder="Enter your last name"
                />
              </FormField>

              <FormField label="Phone Number" error={profileErrors.phone} required>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={handlePhoneChange}
                  className={`w-full px-3 py-2 border ${profileErrors.phone ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  placeholder="(403) 555-0123"
                />
              </FormField>

              <FormField label="Birthday" error={profileErrors.birthday} required>
                <input
                  type="date"
                  value={profileData.birthday}
                  onChange={(e) => handleProfileInputChange('birthday', e.target.value)}
                  className={`w-full px-3 py-2 border ${profileErrors.birthday ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
              </FormField>

              <FormField label="Address" error={profileErrors.address} required>
                <AddressPicker
                  value={profileData.address}
                  onAddressSelect={handleAddressSelect}
                  error={profileErrors.address}
                  placeholder="Start typing your address..."
                />
              </FormField>

              {/* Facilitator Management Section */}
              {hasFacilitatorSelected && selectedFacilitator && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Your Family's Facilitator
                    </label>
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <a 
                          href={getFacilitatorProfileUrl(selectedFacilitator)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                          title={`View ${selectedFacilitator.name}'s profile`}
                        >
                          <img 
                            src={selectedFacilitator.image} 
                            alt={selectedFacilitator.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-purple-300 hover:border-purple-400"
                          />
                        </a>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{selectedFacilitator.name}</p>
                          <p className="text-xs text-gray-600">{selectedFacilitator.title}</p>
                          <p className="text-xs text-purple-600 mt-1">{selectedFacilitator.experience}</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-purple-200">
                        <button
                          type="button"
                          onClick={() => setShowFacilitatorChange(true)}
                          className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center space-x-1"
                        >
                          <Users className="w-4 h-4" />
                          <span>Change Facilitator</span>
                        </button>
                        <p className="text-xs text-gray-500 mt-1">
                          Your facilitator provides ongoing support and guidance for your family's home education journey.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {profileErrors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{profileErrors.submit}</p>
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmittingProfile}
                className={`w-full py-3 px-4 border border-transparent rounded-md text-white font-medium ${
                  isSubmittingProfile 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors flex items-center justify-center`}
              >
                {isSubmittingProfile ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    Save Profile
                    <CheckCircle2 className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Family Creation Sheet - Only for Primary Guardians */}
      {customClaims?.familyRole === 'primary_guardian' && (
        <FamilyCreationSheet
          isOpen={showFamilyCreation}
          onOpenChange={setShowFamilyCreation}
          familyKey={hasRegisteredFamily ? familyKey : null}
          hasRegisteredFamily={hasRegisteredFamily}
          initialFamilyData={familyData}
          onFamilyDataChange={handleFamilyDataChange}
          onComplete={handleFamilyComplete}
        />
      )}

      {/* Home Education Notification Form - Only for Primary Guardians */}
      {customClaims?.familyRole === 'primary_guardian' && showNotificationForm && (
        <HomeEducationNotificationFormV2
          isOpen={showNotificationForm}
          onOpenChange={(open) => {
            setShowNotificationForm(open);
            if (!open) {
              setSelectedStudent(null);
            }
          }}
          familyId={customClaims?.familyId}
          familyData={familyData}
          selectedStudent={selectedStudent}
          schoolYear={activeSchoolYear}
        />
      )}

      {/* Student Citizenship Documents Modal - Only for Primary Guardians */}
      {customClaims?.familyRole === 'primary_guardian' && showCitizenshipDocs && (
        <StudentCitizenshipDocuments
          isOpen={showCitizenshipDocs}
          onOpenChange={(open) => {
            setShowCitizenshipDocs(open);
            if (!open) {
              setSelectedStudentForDocs(null);
            }
          }}
          student={selectedStudentForDocs}
          familyId={customClaims?.familyId}
          onDocumentsUpdated={handleDocumentsUpdated}
        />
      )}

      {/* Program Plan Form - Only for Primary Guardians */}
      {customClaims?.familyRole === 'primary_guardian' && showSOLOPlanForm && (
        <SOLOEducationPlanForm
          isOpen={showSOLOPlanForm}
          onOpenChange={handleSOLOPlanClose}
          student={selectedStudentForSOLO}
          familyId={customClaims?.familyId}
          schoolYear={soloTargetSchoolYear}
          selectedFacilitator={selectedFacilitator}
        />
      )}

      {/* Acceptance Letter Dialog */}
      {showAcceptanceLetter && (
        <AcceptanceLetterDialog
          isOpen={showAcceptanceLetter}
          onOpenChange={(open) => {
            setShowAcceptanceLetter(open);
          }}
          familyData={familyData}
          activeSchoolYear={activeSchoolYear}
          parentName={userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : ''}
          onPrint={() => {
            console.log('Acceptance letter printed');
          }}
        />
      )}


      {/* Reimbursement Submission Sheet */}
      <Sheet open={showReimbursementForm} onOpenChange={setShowReimbursementForm}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-left">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-blue-500" />
                <span>Submit Reimbursement</span>
              </div>
            </SheetTitle>
            <SheetDescription className="text-left">
              Submit an educational expense for reimbursement review.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            {selectedStudentForReimbursement && (
              <ReimbursementSubmissionForm
                student={selectedStudentForReimbursement}
                onSubmit={handleSubmitReimbursement}
                onCancel={() => {
                  setShowReimbursementForm(false);
                  setSelectedStudentForReimbursement(null);
                  setReimbursementError(null);
                }}
                isSubmitting={isSubmittingReimbursement}
                error={reimbursementError}
                isEligible={studentPaymentEligibility[selectedStudentForReimbursement?.id]?.canAccessPayments || false}
                eligibilityMessage={studentPaymentEligibility[selectedStudentForReimbursement?.id]?.canAccessPayments ? null : 
                  `${selectedStudentForReimbursement.firstName} must complete all required forms before accessing payment features.`}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Receipt Upload Form */}
      <ReceiptUploadForm
        isOpen={showReceiptUploadForm}
        onOpenChange={setShowReceiptUploadForm}
        familyData={familyData}
        schoolYear={activeSchoolYear}
        customClaims={customClaims}
        onClaimSubmitted={handleClaimSubmitted}
      />

      {/* Embedded Account Management Sheet */}
      <Sheet open={showAccountManagement} onOpenChange={setShowAccountManagement}>
        <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-left">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-green-500" />
                <span>Banking Settings</span>
              </div>
            </SheetTitle>
            <SheetDescription className="text-left">
              Manage your bank account information and payout settings securely through Stripe.
            </SheetDescription>
          </SheetHeader>

          {/* Information Section */}
          <div className="space-y-4 mb-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-800 font-medium mb-1">Secure banking management through Stripe</p>
                  <p className="text-blue-700">
                    Your financial information is protected with bank-level security. 
                    All data is encrypted and managed securely by Stripe.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-green-800 font-medium mb-2">Why you see business/professional details</p>
                  <ul className="text-green-700 space-y-1">
                    <li>• Most information is pre-filled from your RTD Academy profile</li>
                    <li>• Business details are set to RTD Academy's information (regulatory requirement)</li>
                    <li>• You mainly need to verify your identity and update banking details</li>
                    <li>• Professional categories are required by financial regulations for tax reporting</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <EmbeddedAccountManagement
              familyId={customClaims?.familyId}
              className="min-h-[600px]"
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Embedded Payouts View Sheet */}
      <Sheet open={showPayoutsView} onOpenChange={setShowPayoutsView}>
        <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-left">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-blue-500" />
                <span>Payout History</span>
              </div>
            </SheetTitle>
            <SheetDescription className="text-left">
              View your reimbursement payouts, current balance, and payout schedule.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            {payoutsSession?.clientSecret && (
              <EmbeddedPayouts
                familyId={customClaims?.familyId}
                className="min-h-[600px]"
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Navigation Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                  {userProfile?.firstName && userProfile?.lastName
                    ? `${userProfile.firstName[0]}${userProfile.lastName[0]}`
                    : (userProfile?.email ? userProfile.email[0].toUpperCase() : 'U')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {userProfile?.firstName && userProfile?.lastName 
                      ? `${userProfile.firstName} ${userProfile.lastName}`
                      : userProfile?.email || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {userProfile?.email}
                  </p>
                </div>
              </div>
              
              {/* User Type Badge for Mobile */}
              {customClaims && (
                <div className="mt-4">
                  <UserTypeBadge customClaims={customClaims} />
                </div>
              )}
            </div>

            {/* Navigation Items */}
            <div className="flex-1 px-6 py-4 space-y-4">
              {userProfile?.firstName && (
                <div className="pb-4 border-b border-gray-200">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Profile Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{userProfile.firstName} {userProfile.lastName}</span>
                    </div>
                    {userProfile.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{userProfile.phone}</span>
                      </div>
                    )}
                    {userProfile.address && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700 truncate">
                          {userProfile.address.city}, {userProfile.address.province}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowProfileForm(true);
                  }}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Edit3 className="w-4 h-4 mr-3 text-gray-400" />
                  Edit Profile
                </button>
                
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3 text-gray-400" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200">
              <div className="text-center text-xs text-gray-500">
                <p>&copy; {new Date().getFullYear()} RTD Connect</p>
                <p>Home Education Portal</p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Facilitator Change Modal */}
      <Sheet open={showFacilitatorChange} onOpenChange={setShowFacilitatorChange}>
        <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-left">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-500" />
                <span>Change Family Facilitator</span>
              </div>
            </SheetTitle>
            <SheetDescription className="text-left">
              Select a different facilitator to guide your family's home education journey. This change will affect your entire family.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            {selectedFacilitator && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Info className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-blue-800">
                      <strong>Current facilitator:</strong> {selectedFacilitator.name}
                    </p>
                    <p className="text-xs text-blue-600">
                      Choose a new facilitator below to make the change.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <FacilitatorSelection 
              selectedFacilitatorId={selectedFacilitatorId}
              onFacilitatorSelect={handleFacilitatorChange}
              showAsStep={false}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Floating Development Tools - Development Only */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-6 right-6 z-50">
          {/* Collapsed State - Main Toggle Button */}
          {!showDevTools && (
            <div className="relative group">
              <button
                onClick={() => setShowDevTools(true)}
                className="w-12 h-12 bg-gray-800 hover:bg-gray-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
              >
                <Settings className="w-5 h-5" />
              </button>
              {/* Tooltip */}
              <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                Development Tools
              </div>
            </div>
          )}

          {/* Expanded State - Tools Panel */}
          {showDevTools && (
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[200px]">
              {/* Header */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Dev Tools</h3>
                <button
                  onClick={() => setShowDevTools(false)}
                  className="w-6 h-6 text-gray-400 hover:text-gray-600 flex items-center justify-center rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tools Grid */}
              <div className="space-y-2">
                {/* Debug Stripe Account */}
                {stripeConnectStatus?.accountId && (
                  <div className="relative group">
                    <button
                      onClick={handleDebugStripeAccount}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      <span>Debug Stripe</span>
                    </button>
                    {/* Tooltip */}
                    <div className="absolute left-full top-0 ml-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      Check Stripe account status & debug info
                    </div>
                  </div>
                )}

                {/* Clean Up Invalid Stripe Data */}
                {stripeConnectStatus?.accountId && (
                  <div className="relative group">
                    <button
                      onClick={handleCleanupStripeData}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-orange-700 hover:bg-orange-50 rounded-md transition-colors"
                    >
                      <Settings className="w-4 h-4 text-orange-500" />
                      <span>Clean Stripe Data</span>
                    </button>
                    {/* Tooltip */}
                    <div className="absolute left-full top-0 ml-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      Remove invalid banking account data
                    </div>
                  </div>
                )}

                {/* Delete Stripe Account */}
                {stripeConnectStatus?.accountId && (
                  <div className="relative group">
                    <button
                      onClick={handleDeleteStripeAccount}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <X className="w-4 h-4 text-red-500" />
                      <span>Delete Stripe</span>
                    </button>
                    {/* Tooltip */}
                    <div className="absolute left-full top-0 ml-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      Delete Stripe account (destructive)
                    </div>
                  </div>
                )}

                {/* Add more dev tools here as needed */}
                <div className="pt-2 border-t border-gray-200">
                  <div className="text-xs text-gray-500 text-center">
                    Development Only
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RTDConnectDashboard;