import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStaffClaims } from '../customClaims/useStaffClaims';
import { getDatabase, ref, get, set, push, onValue, off, update } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { useNavigate } from 'react-router-dom';
import ForcedPasswordChange from '../components/auth/ForcedPasswordChange';
import { toDateString, toEdmontonDate, calculateAge, formatDateForDisplay, checkFundingEligibility, checkKindergartenFundingEligibility } from '../utils/timeZoneUtils';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Users, DollarSign, FileText, Home, AlertCircle, CheckCircle2, ArrowRight, GraduationCap, Heart, Shield, User, Phone, MapPin, Edit3, ChevronDown, LogOut, Plus, UserPlus, Calendar, Hash, X, Settings, Loader2, Crown, UserCheck, Clock, AlertTriangle, Info, Upload, Menu, Download, Eye, ExternalLink, BookOpen, TrendingUp } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import AddressPicker from '../components/AddressPicker';
import FamilyManagementWrapper from './FamilyManagementWrapper';
import HomeEducationNotificationFormV2 from './HomeEducationNotificationFormV2';
import StudentCitizenshipDocuments from '../components/StudentCitizenshipDocuments';
import SOLOEducationPlanForm from './SOLOEducationPlanForm';
import FacilitatorMeetingForm from './FacilitatorMeetingForm';
import FacilitatorSelection from './FacilitatorSelection';
import ReceiptUploadForm from './ReceiptUploadForm';
import StudentBudgetCard from './StudentBudgetCard';
import FamilyBudgetOverview from './FamilyBudgetOverview';
import AcceptanceLetterDialog from './AcceptanceLetterDialog';
import PortfolioManager from '../PortfolioManager/components/PortfolioManager';
import Toast from '../components/Toast';
import FormCompletionBadge, { CompactFormCompletionBadge } from '../components/FormCompletionBadge';
import { 
  EmbeddedAccountManagement, 
  EmbeddedNotificationBanner, 
  EmbeddedPayouts 
} from '../components/ConnectEmbeddedComponents';
import {
  formatImportantDate,
  getAllSeptemberCountDates,
  getSeptemberCountForYear,
  CURRENT_SCHOOL_YEAR,
  NEXT_SCHOOL_YEAR
} from '../config/calendarConfig';
import { FUNDING_RATES } from '../config/HomeEducation';
import { getFacilitatorById, getFacilitatorByEmail, getFacilitatorProfileUrl, getAllFacilitatorsRandomized, getFacilitatorAvailabilityForType, AVAILABILITY_STATUS } from '../config/facilitators';
import { generatePartCData } from '../config/signatures';

// Helper function to convert school year format from display to database
const formatSchoolYearForDatabase = (schoolYear) => schoolYear.replace('/', '_');

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

// Helper function to get student funding eligibility from backend calculation
const getStudentFundingEligibility = (student, activeSchoolYear) => {
  if (!student || !activeSchoolYear) {
    return {
      fundingEligible: false,
      fundingAmount: 0,
      currentAllocation: 0,
      remainingAllocation: 0,
      registrationPhase: 'unknown',
      ageCategory: 'unknown',
      eligibilityMessage: 'Missing student or school year data'
    };
  }

  const schoolYearKey = activeSchoolYear.replace('/', '_');
  const eligibilityData = student.FUNDING_ELIGIBILITY?.[schoolYearKey];

  if (!eligibilityData) {
    // No eligibility data calculated yet - this should trigger backend recalculation
    return {
      fundingEligible: false,
      fundingAmount: 0,
      currentAllocation: 0,
      remainingAllocation: 0,
      registrationPhase: 'not_calculated',
      ageCategory: 'unknown',
      eligibilityMessage: 'Eligibility not yet calculated. Please submit notification form.'
    };
  }

  return {
    fundingEligible: eligibilityData.fundingEligible || false,
    fundingAmount: eligibilityData.fundingAmount || 0,
    currentAllocation: eligibilityData.currentAllocation || 0,
    remainingAllocation: eligibilityData.remainingAllocation || 0,
    fullEligibleAmount: eligibilityData.fullEligibleAmount || 0,
    registrationPhase: eligibilityData.registrationPhase || 'unknown',
    registrationDate: eligibilityData.registrationDate,
    proratedReason: eligibilityData.proratedReason,
    upgradeEligibleAfter: eligibilityData.upgradeEligibleAfter,
    ageCategory: eligibilityData.ageCategory || 'unknown',
    eligibilityMessage: eligibilityData.eligibilityMessage,
    calculatedAt: eligibilityData.calculatedAt
  };
};

// Helper function to calculate student budget based on backend eligibility
const calculateStudentBudget = (student, activeSchoolYear) => {
  const eligibility = getStudentFundingEligibility(student, activeSchoolYear);
  return eligibility.currentAllocation || 0;
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

  // Check Citizenship Documents - only count as completed if no staff review required
  const docStatusData = docStatuses[student.id] || { status: 'pending', requiresStaffReview: false };
  if (docStatusData.status !== 'completed' || docStatusData.requiresStaffReview) {
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
  
  // Check if staff review is blocking completion
  const docStatusData = docStatuses[student.id] || { status: 'pending', requiresStaffReview: false };
  const hasStaffReviewPending = docStatusData.requiresStaffReview && docStatusData.status === 'pending-review';
  
  let restrictionReason = null;
  if (!completion.isComplete) {
    restrictionReason = hasStaffReviewPending ? 'staff-review-required' : 'incomplete-forms';
  }
  
  return {
    ...completion,
    canAccessPayments: completion.isComplete,
    restrictionReason: restrictionReason,
    missingForms: completion.missing,
    studentName: `${student.firstName} ${student.lastName}`,
    hasStaffReviewPending: hasStaffReviewPending
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

  // Check if any students have staff review pending
  const studentsWithStaffReview = eligibilityResults.filter(result => result.hasStaffReviewPending);
  const hasStaffReviewPending = studentsWithStaffReview.length > 0;

  return {
    canAccessPayments: allStudentsComplete, // Only allow family-level access if ALL students are complete
    allStudentsComplete,
    someStudentsComplete,
    restrictionReason: allStudentsComplete ? null : hasStaffReviewPending ? 'staff-review-required' : 'incomplete-student-forms',
    studentsWithAccess: studentsWithAccess.map(result => result.studentName),
    studentsWithoutAccess: studentsWithoutAccess.map(result => ({
      name: result.studentName,
      missing: result.missingForms,
      completionPercentage: result.completionPercentage,
      hasStaffReviewPending: result.hasStaffReviewPending
    })),
    studentsWithStaffReview: studentsWithStaffReview.map(result => result.studentName),
    completionPercentage,
    totalStudents: students.length,
    completedStudents: studentsWithAccess.length
  };
};

// Helper function to determine the target school year for SOLO planning
// If it's September or October, plan for current school year
// Otherwise, plan for next school year
const getTargetSchoolYear = () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // 1-12

  // If it's September (9) or October (10), plan for current school year
  // Otherwise, plan for next school year
  if (currentMonth === 9 || currentMonth === 10) {
    return CURRENT_SCHOOL_YEAR;
  } else {
    return NEXT_SCHOOL_YEAR;
  }
};

// Helper function to calculate age with years, months, and days
const calculateAgeWithDays = (birthDate, referenceDate = new Date()) => {
  if (!birthDate) return { years: 0, months: 0, days: 0 };

  // Convert string to Date if necessary
  const birthDateObj = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const refDate = new Date(referenceDate);

  let years = refDate.getFullYear() - birthDateObj.getFullYear();
  let months = refDate.getMonth() - birthDateObj.getMonth();
  let days = refDate.getDate() - birthDateObj.getDate();

  // Adjust days
  if (days < 0) {
    months--;
    // Get the last day of the previous month
    const prevMonth = new Date(refDate.getFullYear(), refDate.getMonth(), 0);
    days += prevMonth.getDate();
  }

  // Adjust months
  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
};

// Helper function to get student age display with September comparison
const getStudentAgeDisplay = (student, schoolYear) => {
  if (!student?.birthday || !schoolYear) return null;

  const today = new Date();
  const currentYear = today.getFullYear();

  // Calculate last September (most recent September that has passed)
  let lastSeptemberYear = currentYear;
  if (today < new Date(currentYear, 8, 1)) {
    // If we haven't reached Sept 1 yet this year, last September was last year
    lastSeptemberYear = currentYear - 1;
  }
  const lastSeptember = new Date(lastSeptemberYear, 8, 1);

  // Calculate next September (next upcoming September)
  let nextSeptemberYear = currentYear;
  if (today >= new Date(currentYear, 8, 1)) {
    // If we've passed Sept 1 this year, next September is next year
    nextSeptemberYear = currentYear + 1;
  }
  const nextSeptember = new Date(nextSeptemberYear, 8, 1);

  // Calculate current age
  const currentAge = calculateAgeWithDays(student.birthday);

  // Calculate age at last September
  const lastSeptemberAge = calculateAgeWithDays(student.birthday, lastSeptember);

  // Calculate age at next September
  const nextSeptemberAge = calculateAgeWithDays(student.birthday, nextSeptember);

  return {
    current: currentAge,
    lastSeptember: {
      age: lastSeptemberAge,
      year: lastSeptemberYear
    },
    nextSeptember: {
      age: nextSeptemberAge,
      year: nextSeptemberYear
    }
  };
};

// Helper function to get family status configuration
const getFamilyStatusConfig = (status) => {
  const config = {
    active: {
      features: ['all'], // Full access to all features
      banner: null,
      primaryAction: null
    },
    inactive: {
      features: ['profileEdit', 'viewFamilyInfo'], // Minimal access
      banner: {
        type: 'warning',
        title: 'Family Registration Inactive',
        message: 'Your family registration with RTD Connect is currently inactive. To return to our program, please contact your facilitator.',
        icon: AlertCircle
      },
      primaryAction: 'Contact your facilitator to reactivate'
    }
  };

  return config[status] || config.active;
};

// Registration Warning Banner Component
const RegistrationWarningBanner = ({ type, onDismiss, onAction }) => {
  const isIntent = type === 'intent';

  return (
    <div className="mb-6 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-400 rounded-lg shadow-lg">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center animate-pulse">
              <AlertCircle className="w-7 h-7 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-orange-900 mb-2">
              ⚠️ IMPORTANT: {isIntent ? 'Submit Your Intent to Register' : 'Complete Your Registration'}
            </h3>

            <div className="text-orange-800 space-y-2 mb-4">
              <p className="font-medium">
                Your family profile has been created, but you're not officially registered yet!
              </p>

              {isIntent ? (
                <>
                  <p>
                    <strong>Next Step:</strong> Complete the Intent to Register form to secure your provisional spot
                    for the {NEXT_SCHOOL_YEAR} school year.
                  </p>
                  <p className="text-sm">
                    Official registration opens January 1, 2026. You'll need to complete notification forms then.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>Next Step:</strong> Complete the Home Education Notification Form for each student
                    to receive funding and officially enroll.
                  </p>
                  <p className="text-sm">
                    This form is required by Alberta Education for all home education students.
                  </p>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onAction}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
              >
                <ArrowRight className="w-5 h-5" />
                <span>{isIntent ? 'Submit Intent Form' : 'Complete Registration Forms'}</span>
              </button>

              <button
                onClick={onDismiss}
                className="px-6 py-3 bg-white hover:bg-gray-50 text-orange-700 font-medium rounded-lg border-2 border-orange-300 hover:border-orange-400 transition-all"
              >
                I'll Do This Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Family Status Banner Component
const FamilyStatusBanner = ({ status, facilitator }) => {
  const config = getFamilyStatusConfig(status);

  if (!config.banner) return null;

  const Icon = config.banner.icon;
  const bgColors = {
    info: 'from-purple-50 to-blue-50 border-purple-200',
    warning: 'from-orange-50 to-red-50 border-orange-300'
  };

  const textColors = {
    info: 'text-purple-900',
    warning: 'text-orange-900'
  };

  const iconColors = {
    info: 'text-purple-600',
    warning: 'text-orange-600'
  };

  return (
    <div className={`mt-6 p-6 bg-gradient-to-r ${bgColors[config.banner.type]} border-2 rounded-lg`}>
      <div className="flex items-start space-x-4">
        <Icon className={`w-8 h-8 ${iconColors[config.banner.type]} flex-shrink-0 mt-1`} />
        <div className="flex-1">
          <h3 className={`font-bold ${textColors[config.banner.type]} text-xl mb-2`}>
            {config.banner.title}
          </h3>
          <p className="text-gray-700 mb-4">
            {config.banner.message}
          </p>

          {/* Inactive-specific contact info */}
          {status === 'inactive' && facilitator && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Your Facilitator
              </h4>
              <p className="text-gray-700 mb-1">{facilitator.name}</p>
              <a href={`mailto:${facilitator.contact?.email || facilitator.email}`} className="text-purple-600 hover:text-purple-800 underline">
                {facilitator.contact?.email || facilitator.email}
              </a>
              {(facilitator.contact?.phone || facilitator.phone) && (
                <p className="text-gray-600 mt-1">{facilitator.contact?.phone || facilitator.phone}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
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
              {onSignOut && (
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
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const FormField = ({ label, icon: Icon, error, children, required = false, infoTooltip = null }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-1.5">
      <label className="flex items-center text-sm font-medium text-gray-900">
        {Icon && <Icon className="w-4 h-4 mr-2 text-purple-500" />}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {infoTooltip && (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 rounded"
            >
              <Info className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 text-sm" side="right" align="start">
            <p className="text-gray-700">{infoTooltip}</p>
          </PopoverContent>
        </Popover>
      )}
    </div>
    {children}
    {error && (
      <div className="flex items-center space-x-2 text-sm text-red-600">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>{error}</span>
      </div>
    )}
  </div>
);

const RTDConnectDashboard = ({ 
  staffView = false, 
  familyId: propFamilyId = null, 
  familyData: propFamilyData = null 
}) => {
  const { user, user_email_key, signOut, isHomeEducationParent, checkAndApplyPendingPermissions: applyPendingFromAuth } = useAuth();
  
  // Use staff claims in read-only mode - just read existing claims, never apply them
  const { isStaff, hasPermission } = useStaffClaims({ readOnly: true });
  
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
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);
  
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
  
  // Document Preview state
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [previewDocuments, setPreviewDocuments] = useState([]);
  const [previewStudentName, setPreviewStudentName] = useState('');
  const [previewStudent, setPreviewStudent] = useState(null);
  const [staffComment, setStaffComment] = useState(null);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  
  // SOLO Education Plan state
  const [showSOLOPlanForm, setShowSOLOPlanForm] = useState(false);
  const [selectedStudentForSOLO, setSelectedStudentForSOLO] = useState(null);
  const [studentSOLOPlanStatuses, setStudentSOLOPlanStatuses] = useState({});
  // Facilitator Meetings state
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [selectedStudentForMeeting, setSelectedStudentForMeeting] = useState(null);
  const [studentMeetingStatuses, setStudentMeetingStatuses] = useState({});
  
  // Portfolio state
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [selectedStudentForPortfolio, setSelectedStudentForPortfolio] = useState(null);
  const [studentPortfolioStatuses, setStudentPortfolioStatuses] = useState({});

  // Warning banner state
  const [dismissedWarnings, setDismissedWarnings] = useState({});
  const [showRegistrationWarning, setShowRegistrationWarning] = useState(false);
  
  // Reimbursement system state
  const [stripeConnectStatus, setStripeConnectStatus] = useState(null);
  const [studentReimbursementStatuses, setStudentReimbursementStatuses] = useState({});
  const [stripeConnectError, setStripeConnectError] = useState(null);
  
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

  // Facilitator preview state - for new user welcome screen
  const [showFacilitatorPreview, setShowFacilitatorPreview] = useState(true);
  const [showFacilitatorPreviewSheet, setShowFacilitatorPreviewSheet] = useState(false);

  // Payment eligibility state
  const [familyPaymentEligibility, setFamilyPaymentEligibility] = useState(null);
  const [studentPaymentEligibility, setStudentPaymentEligibility] = useState({});

  // Collapsed forms state - to minimize completed items
  const [showCompletedForms, setShowCompletedForms] = useState({});
  const [expandedCompletedSections, setExpandedCompletedSections] = useState({});

  // Staff mode detection
  const isStaffViewing = staffView || false;
  const effectiveFamilyId = isStaffViewing && propFamilyId ? propFamilyId : customClaims?.familyId;
  const shouldBypassProfileCheck = isStaff() || isStaffViewing;
  
  // Target user UID for staff mode profile editing
  const [targetUserUid, setTargetUserUid] = useState(null);

  // Helper function to check if registration form should be minimized
  const shouldMinimizeRegistration = (studentId) => {
    const formStatus = studentFormStatuses[studentId]?.current || 'pending';
    return formStatus === 'submitted' && !expandedCompletedSections[`registration-${studentId}`];
  };

  // Helper function to check if citizenship docs should be minimized
  const shouldMinimizeCitizenship = (studentId) => {
    const docStatus = studentDocumentStatuses[studentId] || { status: 'pending' };
    const isApproved = docStatus.status === 'completed' || docStatus.staffApproval?.isApproved;
    return isApproved && !expandedCompletedSections[`citizenship-${studentId}`];
  };

  // Toggle expanded state for completed sections
  const toggleCompletedSection = (sectionId) => {
    setExpandedCompletedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Helper function to determine if a feature should be shown based on family status
  const shouldShowFeature = (featureName) => {
    const statusConfig = getFamilyStatusConfig(familyData?.status || 'active');

    // 'all' means active family - show everything
    if (statusConfig.features.includes('all')) return true;

    // Otherwise check if feature is in allowed list
    return statusConfig.features.includes(featureName);
  };

  // Helper to check if registration warning should show
  const shouldShowRegistrationWarning = () => {
    // Don't show for staff viewing families
    if (isStaff() && isStaffViewing) return false;

    // Don't show if already dismissed
    if (dismissedWarnings?.registrationIncompleteWarning) return false;

    // Check if ANY student has submitted notification form for active year
    if (!familyData?.students || !activeSchoolYear) return false;

    const hasAnySubmittedForm = familyData.students.some(student =>
      studentFormStatuses[student.id]?.[activeSchoolYear] === 'submitted'
    );

    return !hasAnySubmittedForm;
  };


  // Initialize school year tracking
  useEffect(() => {
    // Clean up RTD Connect login flag after successful dashboard load
    if (localStorage.getItem('rtdConnectPortalLogin') === 'true') {
      // Small delay to ensure everything is loaded
      setTimeout(() => {
        localStorage.removeItem('rtdConnectPortalLogin');
      }, 2000);
    }

    // Use CURRENT_SCHOOL_YEAR directly from config
    const currentYear = CURRENT_SCHOOL_YEAR;

    // Get SOLO target school year using the same logic as SOLO form
    const soloTargetYear = getTargetSchoolYear();

    // Get the September count date for the current school year
    const septemberCountDate = getSeptemberCountForYear(currentYear);
    const septemberCountInfo = septemberCountDate ? {
      date: septemberCountDate,
      schoolYear: currentYear
    } : null;

    setCurrentSchoolYear(currentYear);
    setActiveSchoolYear(currentYear);
    setSoloTargetSchoolYear(soloTargetYear);
    setNextSeptemberCount(septemberCountInfo);
  }, []);

  // Debug effect to log user auth object and custom claims
  useEffect(() => {
    const logUserAuthInfo = async () => {
      if (user) {
        try {
          const currentUser = getAuth().currentUser;
          const idTokenResult = await currentUser.getIdTokenResult();
          setCustomClaims(idTokenResult.claims);

          console.log('Custom claims:', idTokenResult.claims);

          // Check for temporary password requirement
          if (idTokenResult.claims.tempPasswordRequired === true) {
            setRequiresPasswordChange(true);
            setLoading(false);
            return;
          }
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
          const currentUser = getAuth().currentUser;

          // Force token refresh to ensure we get the latest claims
          await currentUser.getIdToken(true);
          const idTokenResult = await currentUser.getIdTokenResult();

          setCustomClaims(idTokenResult.claims);
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
      console.error('Error listening to user data:', error);
      setHasCompleteProfile(false);
      setLoading(false);
    });

    // Cleanup listeners
    return () => {
      off(userRef, 'value', unsubscribeUser);
    };
  }, [user, user_email_key]);

  // Effect to load primary guardian's profile when in staff mode
  useEffect(() => {
    if (!isStaffViewing || !familyProfile?.createdBy) {
      return;
    }

    const db = getDatabase();
    const targetUid = familyProfile.createdBy;
    setTargetUserUid(targetUid);
    
    const targetUserRef = ref(db, `users/${targetUid}`);

    // Set up realtime listener for target user profile
    const unsubscribeTargetUser = onValue(targetUserRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        setUserProfile(userData);
        
        // Check if profile is complete
        const isComplete = !!(userData.firstName && 
                             userData.lastName && 
                             userData.phone && 
                             userData.address);
        setHasCompleteProfile(isComplete);
        
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
    }, (error) => {
      console.error('Error loading target user profile in staff mode:', error);
      setHasCompleteProfile(false);
    });

    // Cleanup listener
    return () => {
      off(targetUserRef, 'value', unsubscribeTargetUser);
    };
  }, [isStaffViewing, familyProfile?.createdBy]);

  // Effect to load facilitator data from family level
  useEffect(() => {
    // Don't load personal family data for staff users on staff dashboard
    if (isStaff() && !isStaffViewing && !propFamilyId) {
      return;
    }

    if (!effectiveFamilyId) {
      return;
    }

    const db = getDatabase();
    const familyRef = ref(db, `homeEducationFamilies/familyInformation/${effectiveFamilyId}`);

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
            // Only set hasFacilitatorSelected to true if it's not already true
            // This prevents race conditions during family creation
            setHasFacilitatorSelected(true);
          } else {
            console.warn('No facilitator found for email:', familyData.facilitatorEmail);
            // Only reset if we don't have a local selection already
            // This prevents clearing the selection during family creation
            setSelectedFacilitatorId(prevId => prevId);
            setSelectedFacilitator(prevFac => prevFac);
            // Don't set to false if already true (family might be in the process of being created)
            setHasFacilitatorSelected(prev => prev || false);
          }
        } else {
          // No facilitator email in family data - only reset if not already selected
          // This prevents race conditions during initial family creation
          setSelectedFacilitatorId(prevId => prevId);
          setSelectedFacilitator(prevFac => prevFac);
          setHasFacilitatorSelected(prev => prev || false);
        }
      }
    }, (error) => {
      console.error('Error listening to family facilitator data:', error);
    });

    // Cleanup listener
    return () => {
      off(familyRef, 'value', unsubscribeFamily);
    };
  }, [effectiveFamilyId]);

  // Effect to load student form statuses by school year
  useEffect(() => {
    // Don't load personal family data for staff users on staff dashboard
    if (isStaff() && !isStaffViewing && !propFamilyId) {
      return;
    }

    if (!effectiveFamilyId || !familyData?.students || !activeSchoolYear) {
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
            const formRef = ref(db, `homeEducationFamilies/familyInformation/${effectiveFamilyId}/NOTIFICATION_FORMS/${schoolYear.replace('/', '_')}/${student.id}`);
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
    };

    loadStudentFormStatuses();
  }, [effectiveFamilyId, familyData?.students, activeSchoolYear]);

  // Effect to load student citizenship document statuses
  useEffect(() => {
    // Don't load personal family data for staff users on staff dashboard
    if (isStaff() && !isStaffViewing && !propFamilyId) {
      return;
    }

    if (!effectiveFamilyId || !familyData?.students) {
      return;
    }

    const loadStudentDocumentStatuses = async () => {
      const db = getDatabase();
      const statuses = {};
      
      for (const student of familyData.students) {
        try {
          const docsRef = ref(db, `homeEducationFamilies/familyInformation/${effectiveFamilyId}/STUDENT_CITIZENSHIP_DOCS/${student.id}`);
          const snapshot = await get(docsRef);
          
          if (snapshot.exists()) {
            const docData = snapshot.val();
            // Check if staff review is required and documents are uploaded
            const hasDocuments = docData.documents?.length > 0;
            const requiresStaffReview = docData.staffReviewRequired || docData.requiresStaffReview;
            
            // Determine status based on staff review requirements and staff approval
            let finalStatus = docData.completionStatus || 'pending';
            const isStaffApproved = docData.staffApproval?.isApproved === true;
            
            if (isStaffApproved) {
              finalStatus = 'completed'; // Staff approved = completed regardless of AI flags
            } else if (hasDocuments && requiresStaffReview) {
              finalStatus = 'pending-review'; // Documents uploaded but need staff review
            } else if (hasDocuments && !requiresStaffReview && docData.completionStatus === 'completed') {
              finalStatus = 'completed'; // Truly verified by AI
            }
            
            statuses[student.id] = {
              status: finalStatus,
              documentCount: docData.documents?.length || 0,
              lastUpdated: docData.lastUpdated,
              requiresStaffReview: requiresStaffReview || false,
              staffReviewReason: docData.staffReviewReason || null,
              documents: docData.documents || [],
              staffApproval: docData.staffApproval || null,
              // Load AI analysis results and manual overrides from Firebase
              aiAnalysisResults: docData.aiAnalysisResults || {},
              manualOverrides: docData.manualOverrides || {},
              studentName: docData.studentName || `${student.firstName} ${student.lastName}`
            };
          } else {
            statuses[student.id] = {
              status: 'pending',
              documentCount: 0,
              lastUpdated: null,
              requiresStaffReview: false,
              staffReviewReason: null,
              documents: [],
              staffApproval: null,
              aiAnalysisResults: {},
              manualOverrides: {},
              studentName: `${student.firstName} ${student.lastName}`
            };
          }
        } catch (error) {
          console.error(`Error loading citizenship docs for student ${student.id}:`, error);
          statuses[student.id] = {
            status: 'pending',
            documentCount: 0,
            lastUpdated: null,
            requiresStaffReview: false,
            staffReviewReason: null,
            documents: [],
            staffApproval: null,
            aiAnalysisResults: {},
            manualOverrides: {},
            studentName: `${student.firstName} ${student.lastName}`
          };
        }
      }

      setStudentDocumentStatuses(statuses);

      // Debug AI analysis data loading
      Object.entries(statuses).forEach(([studentId, status]) => {
        if (status.aiAnalysisResults && Object.keys(status.aiAnalysisResults).length > 0) {
          // AI analysis data available
        }
      });
    };

    loadStudentDocumentStatuses();
  }, [effectiveFamilyId, familyData?.students]);

  // Effect to load student SOLO plan statuses
  useEffect(() => {
    // Don't load personal family data for staff users on staff dashboard
    if (isStaff() && !isStaffViewing && !propFamilyId) {
      return;
    }

    if (!effectiveFamilyId || !familyData?.students || !soloTargetSchoolYear) {
      return;
    }

    const loadStudentSOLOPlanStatuses = async () => {
      const db = getDatabase();
      const statuses = {};
      
      for (const student of familyData.students) {
        try {
          const planRef = ref(db, `homeEducationFamilies/familyInformation/${effectiveFamilyId}/SOLO_EDUCATION_PLANS/${soloTargetSchoolYear.replace('/', '_')}/${student.id}`);
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

    loadStudentSOLOPlanStatuses();
  }, [effectiveFamilyId, familyData?.students, soloTargetSchoolYear]);

  // Effect to load student Facilitator Meeting statuses
  useEffect(() => {
    // Don't load personal family data for staff users on staff dashboard
    if (isStaff() && !isStaffViewing && !propFamilyId) {
      return;
    }

    if (!effectiveFamilyId || !familyData?.students || !soloTargetSchoolYear) {
      return;
    }

    const loadMeetingStatuses = async () => {
      const db = getDatabase();
      const statuses = {};
      for (const student of familyData.students) {
        try {
          const formRef = ref(db, `homeEducationFamilies/familyInformation/${effectiveFamilyId}/FACILITATOR_MEETINGS/${soloTargetSchoolYear.replace('/', '_')}/${student.id}`);
          const snapshot = await get(formRef);
          if (snapshot.exists()) {
            const form = snapshot.val();
            statuses[student.id] = {
              status: form.submissionStatus || 'draft',
              lastUpdated: form.lastUpdated,
              submittedAt: form.submittedAt,
              pdfVersions: form.pdfVersions || []
            };
          } else {
            statuses[student.id] = { status: 'pending', lastUpdated: null, submittedAt: null, pdfVersions: [] };
          }
        } catch (err) {
          console.error(`Error loading meeting form for student ${student.id}:`, err);
          statuses[student.id] = { status: 'pending', lastUpdated: null, submittedAt: null, pdfVersions: [] };
        }
      }
      setStudentMeetingStatuses(statuses);
    };

    loadMeetingStatuses();
  }, [effectiveFamilyId, familyData?.students, soloTargetSchoolYear]);

  // Effect to load portfolio statuses
  useEffect(() => {
    // Don't load personal family data for staff users on staff dashboard
    if (isStaff() && !isStaffViewing && !propFamilyId) {
      return;
    }

    if (!effectiveFamilyId || !familyData?.students || !activeSchoolYear) {
      return;
    }

    const loadPortfolioStatuses = async () => {
      const db = getFirestore();
      const statuses = {};
      
      for (const student of familyData.students) {
        try {
          // Check if metadata exists for this student
          const metadataRef = doc(db, 'portfolios', effectiveFamilyId, 'metadata', student.id);
          const metadataSnap = await getDoc(metadataRef);
          
          if (metadataSnap.exists()) {
            const metadata = metadataSnap.data();
            statuses[student.id] = {
              hasPortfolio: true,
              entryCount: metadata.totalEntries || 0,
              lastUpdated: metadata.lastModified?.toDate ? metadata.lastModified.toDate() : metadata.lastModified
            };
          } else {
            statuses[student.id] = {
              hasPortfolio: false,
              entryCount: 0,
              lastUpdated: null
            };
          }
        } catch (error) {
          console.error(`Error loading portfolio status for student ${student.id}:`, error);
          statuses[student.id] = {
            hasPortfolio: false,
            entryCount: 0,
            lastUpdated: null
          };
        }
      }

      setStudentPortfolioStatuses(statuses);
    };

    loadPortfolioStatuses();
  }, [effectiveFamilyId, familyData?.students, activeSchoolYear]);


  // Effect to load dismissed warnings
  useEffect(() => {
    if (!effectiveFamilyId) return;

    const db = getDatabase();
    const warningsRef = ref(db, `homeEducationFamilies/familyInformation/${effectiveFamilyId}/dismissedWarnings`);

    const unsubscribe = onValue(warningsRef, (snapshot) => {
      const warnings = snapshot.val() || {};
      setDismissedWarnings(warnings);
    });

    return () => unsubscribe();
  }, [effectiveFamilyId]);

  // Effect to update warning visibility based on conditions
  useEffect(() => {
    setShowRegistrationWarning(shouldShowRegistrationWarning());
  }, [
    familyData,
    studentFormStatuses,
    activeSchoolYear,
    dismissedWarnings,
    isStaffViewing
  ]);

  // Effect to load Stripe Connect status
  useEffect(() => {
    // Don't load personal Stripe data for staff users on staff dashboard
    if (isStaff() && !isStaffViewing && !propFamilyId) {
      return;
    }

    if (effectiveFamilyId && user?.uid && (customClaims?.familyRole === 'primary_guardian' || isStaffViewing)) {
      // Reset all sessions when Stripe status changes
      setSessionStates({});
      setAccountSession(null);
      setOnboardingSession(null);
      setManagementSession(null);
      setPayoutsSession(null);
      loadStripeConnectStatus();
    }
  }, [effectiveFamilyId, user?.uid, customClaims?.familyRole, isStaffViewing]);

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
    // Don't load personal reimbursement data for staff users on staff dashboard
    if (isStaff() && !isStaffViewing && !propFamilyId) {
      return;
    }

    if (effectiveFamilyId && familyData?.students && activeSchoolYear) {
      loadReimbursementStatuses();
      loadStudentBudgets();
    }
  }, [effectiveFamilyId, familyData?.students, activeSchoolYear]);

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
    }
  }, [familyData?.students, studentFormStatuses, studentDocumentStatuses, studentSOLOPlanStatuses, activeSchoolYear]);

  // Separate effect for family data based on custom claims or staff view
  useEffect(() => {

    // IMPORTANT: If user is staff viewing the staff dashboard (not a specific family),
    // do NOT load their personal family data - this prevents dual role conflicts
    if (isStaff() && !isStaffViewing && !propFamilyId) {
      setHasRegisteredFamily(false);
      setFamilyProfile(null);
      setLoading(false);
      return;
    }

    // If staff is viewing, use provided family data
    if (isStaffViewing && propFamilyData) {
      // Convert students and guardians from objects to arrays while preserving all other data
      const convertedFamilyData = {
        ...propFamilyData, // Keep all fields from the original data
        students: propFamilyData.students ? Object.values(propFamilyData.students) : [],
        guardians: propFamilyData.guardians ? Object.values(propFamilyData.guardians) : []
      };
      
      setFamilyProfile(propFamilyData);
      setFamilyData(convertedFamilyData);
      setFamilyKey(effectiveFamilyId);
      setHasRegisteredFamily(true);
      
      // For staff viewing, bypass profile check
      if (isStaff()) {
        setHasCompleteProfile(true);
      }
      return;
    }

    if (!effectiveFamilyId) {
      setHasRegisteredFamily(false);
      setFamilyProfile(null);
      return;
    }

    const db = getDatabase();
    const familyRef = ref(db, `homeEducationFamilies/familyInformation/${effectiveFamilyId}`);

    // Set up realtime listener for family registration
    const unsubscribeFamily = onValue(familyRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log('Raw family data from database:', data);
        setFamilyProfile(data);

        // Convert students and guardians from objects to arrays while preserving all other data
        const convertedFamilyData = {
          ...data, // Keep all fields from the original data
          students: data.students ? Object.values(data.students) : [],
          guardians: data.guardians ? Object.values(data.guardians) : []
        };

       

        setFamilyData(convertedFamilyData);
        setFamilyKey(customClaims.familyId);
        setHasRegisteredFamily(true);
      } else {
        setFamilyProfile(null);
        setHasRegisteredFamily(false);
      }
    }, (error) => {
      setHasRegisteredFamily(false);
    });

    // Cleanup listener
    return () => {
      off(familyRef, 'value', unsubscribeFamily);
    };
  }, [effectiveFamilyId, isStaffViewing, propFamilyData]);

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
        try {
          await checkAndApplyPendingPermissions();
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
      // Use target UID if in staff mode, otherwise use current user's UID
      const saveUid = isStaffViewing && targetUserUid ? targetUserUid : user.uid;
      const userRef = ref(db, `users/${saveUid}`);
      
      // When staff is editing, use the target user's email from userProfile
      const emailToSave = isStaffViewing ? userProfile?.email : user.email;
      
      await set(userRef, {
        ...profileData,
        email: emailToSave,
        lastUpdated: new Date().toISOString(),
        ...(isStaffViewing && { lastUpdatedByStaff: user.uid }) // Track who made the update
      });

      // Sync with guardian data in family profile (only for primary guardians)
      let guardianSyncSuccess = true;
      let guardianSyncMessage = '';
      
      try {
        // Unified logic for both regular users and staff - use effectiveFamilyId
        if (effectiveFamilyId) {
          const guardiansRef = ref(db, `homeEducationFamilies/familyInformation/${effectiveFamilyId}/guardians`);
          const guardiansSnapshot = await get(guardiansRef);
          
          if (guardiansSnapshot.exists()) {
            const guardians = guardiansSnapshot.val();
            // Use appropriate email based on mode
            const targetEmail = isStaffViewing ? emailToSave : user.email;
            
            // Find matching guardian by email
            for (const [emailKey, guardian] of Object.entries(guardians)) {
              // Only update if email matches AND guardian is primary_guardian
              if ((guardian.email === targetEmail || guardian.email === sanitizeEmail(targetEmail)) 
                  && guardian.guardianType === 'primary_guardian') {
                // Update guardian data
                const guardianRef = ref(db, `homeEducationFamilies/familyInformation/${effectiveFamilyId}/guardians/${emailKey}`);
                await update(guardianRef, {
                  firstName: profileData.firstName,
                  lastName: profileData.lastName,
                  phone: profileData.phone,
                  address: profileData.address,
                  updatedAt: Date.now(),
                  updatedBy: isStaffViewing ? user.uid : saveUid,
                  ...(isStaffViewing && { updatedByStaff: true })
                });
                guardianSyncMessage = ' Primary guardian information in family profile also updated.';
                break;
              } else if ((guardian.email === targetEmail || guardian.email === sanitizeEmail(targetEmail))
                         && guardian.guardianType !== 'primary_guardian') {
                // Found the guardian but they're not primary - skip update
              }
            }
          }
        }
      } catch (syncError) {
        console.error('Error syncing guardian data:', syncError);
        guardianSyncSuccess = false;
        guardianSyncMessage = ' Note: Guardian information in family profile could not be updated.';
      }

      setShowProfileForm(false);

      // Show success toast with guardian sync status
      setToast({
        message: isStaffViewing 
          ? `Successfully updated user profile.${guardianSyncMessage}`
          : `Profile saved successfully!${guardianSyncMessage}`,
        type: guardianSyncSuccess ? 'success' : 'warning'
      });
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
    // 3. User is staff (can edit any family)
    if (customClaims?.familyRole !== 'primary_guardian' && hasRegisteredFamily && !isStaff()) {
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
        const currentUser = getAuth().currentUser;
        await currentUser.getIdToken(true);
        const idTokenResult = await currentUser.getIdTokenResult();
        setCustomClaims(idTokenResult.claims);
        return idTokenResult.claims;
      } catch (error) {
        console.error('Error manually refreshing custom claims:', error);
        return null;
      }
    }
    return null;
  };

  const handleFamilyComplete = async (result, updatedClaims) => {
    // Close the family creation sheet
    setShowFamilyCreation(false);

    // If we have updated claims from the form, use them immediately
    if (updatedClaims) {
      setCustomClaims(updatedClaims);

      // Explicitly set hasRegisteredFamily to true to allow navigation
      if (updatedClaims.familyId) {
        setHasRegisteredFamily(true);
        setFamilyKey(updatedClaims.familyId);
      }
    } else {
      // Otherwise, manually refresh claims
      const refreshedClaims = await refreshCustomClaims();

      // Also set hasRegisteredFamily after refresh
      if (refreshedClaims?.familyId) {
        setHasRegisteredFamily(true);
        setFamilyKey(refreshedClaims.familyId);
      }
    }
  };

  // Facilitator selection handlers
  const handleFacilitatorSelect = async (facilitatorId, facilitator) => {
    setSelectedFacilitatorId(facilitatorId);
    setSelectedFacilitator(facilitator);

    // ALWAYS set this to true when a facilitator is selected
    // This prevents the facilitator selection screen from showing again
    setHasFacilitatorSelected(true);

    // Only try to save to database if family already exists
    // For new families, the facilitator will be saved when the family is created via cloud function
    if (effectiveFamilyId && facilitator?.contact?.email) {
      try {
        const db = getDatabase();
        const familyRef = ref(db, `homeEducationFamilies/familyInformation/${effectiveFamilyId}`);
        await update(familyRef, {
          facilitatorEmail: facilitator.contact.email,
          facilitatorAssignedAt: new Date().toISOString(),
          facilitatorAssignedBy: user?.uid,
          lastUpdated: new Date().toISOString()
        });

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
    } else if (!effectiveFamilyId) {
      // New family - facilitator will be saved during family creation
      console.log('Facilitator selected for new family - will be saved during family creation');
    } else {
      // Family exists but missing facilitator email - this is an error
      console.error('Missing facilitator email for existing family');
      setToast({
        message: 'Error: Unable to save facilitator selection.',
        type: 'error'
      });
    }
  };

  // Handler to dismiss a warning banner
  const handleDismissWarning = async (warningType) => {
    try {
      const db = getDatabase();
      const warningRef = ref(
        db,
        `homeEducationFamilies/familyInformation/${effectiveFamilyId}/dismissedWarnings/${warningType}`
      );
      await set(warningRef, Date.now());

      // Update local state immediately
      setDismissedWarnings(prev => ({
        ...prev,
        [warningType]: Date.now()
      }));

      console.log(`Dismissed warning: ${warningType}`);
    } catch (error) {
      console.error('Error dismissing warning:', error);
      toast.error('Failed to dismiss warning. Please try again.');
    }
  };

  const handleFacilitatorChange = async (facilitatorId, facilitator) => {
    const previousFacilitator = selectedFacilitator;
    
    setSelectedFacilitatorId(facilitatorId);
    setSelectedFacilitator(facilitator);

    // Save only facilitator email to family level
    if (effectiveFamilyId && facilitator?.contact?.email) {
      try {
        const db = getDatabase();
        const familyRef = ref(db, `homeEducationFamilies/familyInformation/${effectiveFamilyId}`);
        await update(familyRef, {
          facilitatorEmail: facilitator.contact.email,
          facilitatorAssignedAt: new Date().toISOString(),
          facilitatorChangedFrom: previousFacilitator?.name || null,
          facilitatorChangedBy: user?.uid,
          lastUpdated: new Date().toISOString()
        });

        setShowFacilitatorChange(false);

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

    if (currentStatus === 'completed') {
      return {
        status: 'completed',
        message: `✅ Registered for ${activeSchoolYear} school year`,
        actionNeeded: false,
        schoolYear: activeSchoolYear,
        deadline: nextSeptemberCount?.date || null,
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
        deadline: nextSeptemberCount?.date || null,
        icon: AlertTriangle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      };
    }

    // Pending status - registration available
    return {
      status: 'available',
      message: `📝 ${activeSchoolYear} registration is available`,
      actionNeeded: true,
      schoolYear: activeSchoolYear,
      deadline: nextSeptemberCount?.date || null,
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

  // Handle opening document preview
  const handlePreviewDocuments = (student) => {
    const docStatus = studentDocumentStatuses[student.id];
    if (docStatus && docStatus.documents && docStatus.documents.length > 0) {
      setPreviewDocuments(docStatus.documents);
      setPreviewStudentName(`${student.firstName} ${student.lastName}`);
      setPreviewStudent(student);
      setStaffComment(null); // Reset comment
      setShowAIAnalysis(false); // Reset AI analysis accordion
      setShowDocumentPreview(true);
    }
  };

  // Helper function to get current staff information
  const getStaffInfo = () => {
    if (!isStaff() || !user) return null;
    
    return {
      uid: user.uid,
      email: user.email,
      name: userProfile?.firstName && userProfile?.lastName 
        ? `${userProfile.firstName} ${userProfile.lastName}` 
        : user.email,
      role: 'staff'
    };
  };

  // Handle staff approval of documents
  const handleStaffApproval = async (student, comment = '') => {
    if (!isStaff()) {
      setToast({
        message: 'Only staff members can approve documents',
        type: 'error'
      });
      return;
    }

    try {
      const staffInfo = getStaffInfo();
      if (!staffInfo) {
        throw new Error('Unable to verify staff credentials');
      }

      const db = getDatabase();
      const docsRef = ref(db, `homeEducationFamilies/familyInformation/${effectiveFamilyId}/STUDENT_CITIZENSHIP_DOCS/${student.id}`);
      
      const approvalData = {
        staffReviewRequired: false,
        requiresStaffReview: false,
        staffApproval: {
          isApproved: true,
          approvedBy: staffInfo,
          approvedAt: new Date().toISOString(),
          comment: comment || null,
          previousStatus: 'pending-review'
        },
        completionStatus: 'completed',
        lastUpdated: new Date().toISOString()
      };

      await update(docsRef, approvalData);

      // Update local state
      setStudentDocumentStatuses(prev => ({
        ...prev,
        [student.id]: {
          ...prev[student.id],
          status: 'completed',
          requiresStaffReview: false,
          staffApproval: approvalData.staffApproval
        }
      }));

      setToast({
        message: `Documents approved for ${student.firstName} ${student.lastName}`,
        type: 'success'
      });

      // Close the preview modal
      setShowDocumentPreview(false);

    } catch (error) {
      console.error('Error approving documents:', error);
      setToast({
        message: `Failed to approve documents: ${error.message}`,
        type: 'error'
      });
    }
  };

  // Handle citizenship documents update
  const handleDocumentsUpdated = (studentId, documents, completionStatus, requiresStaffReview) => {
    // Update local state with the actual status from the save operation
    setStudentDocumentStatuses(prev => ({
      ...prev,
      [studentId]: {
        status: completionStatus || (documents.length > 0 ? 'completed' : 'pending'),
        documentCount: documents.length,
        lastUpdated: new Date().toISOString(),
        requiresStaffReview: requiresStaffReview || false,
        staffReviewReason: requiresStaffReview ? 'AI document analysis failed or returned low confidence scores' : null
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
            const planRef = ref(db, `homeEducationFamilies/familyInformation/${effectiveFamilyId}/SOLO_EDUCATION_PLANS/${soloTargetSchoolYear.replace('/', '_')}/${student.id}`);
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

  // Handle opening/closing Facilitator Meeting form
  const handleOpenMeetingForm = (student) => {
    setSelectedStudentForMeeting(student);
    setShowMeetingForm(true);
  };
  const handleMeetingFormClose = () => {
    setShowMeetingForm(false);
    setSelectedStudentForMeeting(null);
    // Reload statuses to reflect changes
    if (effectiveFamilyId && familyData?.students && soloTargetSchoolYear) {
      (async () => {
        const db = getDatabase();
        const statuses = {};
        for (const s of familyData.students) {
          try {
            const formRef = ref(db, `homeEducationFamilies/familyInformation/${effectiveFamilyId}/FACILITATOR_MEETINGS/${soloTargetSchoolYear.replace('/', '_')}/${s.id}`);
            const snapshot = await get(formRef);
            if (snapshot.exists()) {
              const form = snapshot.val();
              statuses[s.id] = {
                status: form.submissionStatus || 'draft',
                lastUpdated: form.lastUpdated,
                submittedAt: form.submittedAt,
                pdfVersions: form.pdfVersions || []
              };
            } else {
              statuses[s.id] = { status: 'pending', lastUpdated: null, submittedAt: null, pdfVersions: [] };
            }
          } catch (err) {
            console.error(`Error loading meeting form for student ${s.id}:`, err);
            statuses[s.id] = { status: 'pending', lastUpdated: null, submittedAt: null, pdfVersions: [] };
          }
        }
        setStudentMeetingStatuses(statuses);
      })();
    }
  };

  // Check and apply pending permissions (manual trigger)
  const checkAndApplyPendingPermissions = async () => {
    if (!user?.email) return;

    try {
      // Use the auth context function which has better token refresh logic
      const result = await applyPendingFromAuth();

      if (result) {
        // The auth context function handles token refresh automatically
        // Just refresh custom claims in this component
        await refreshCustomClaims();
      }
    } catch (error) {
      console.error('Error manually applying pending permissions:', error);
    }
  };

  // Stripe Connect handlers

  // Debug function to check Stripe account status
  const handleDebugStripeAccount = async () => {
    if (!effectiveFamilyId) {
      alert('No family ID found');
      return;
    }

    try {
      const functions = getFunctions();
      const debugStripeAccount = httpsCallable(functions, 'debugStripeAccount');

      const result = await debugStripeAccount({
        familyId: effectiveFamilyId
      });

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
    if (!effectiveFamilyId) {
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
        familyId: effectiveFamilyId
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
    if (!effectiveFamilyId) {
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
        familyId: effectiveFamilyId
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
    if (!effectiveFamilyId) {
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
      const stripeDataRef = ref(db, `homeEducationFamilies/familyInformation/${effectiveFamilyId}/STRIPE_CONNECT`);
      
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



  // Handler for new receipt upload form
  const handleOpenReceiptUploadForm = () => {
    // Check family payment eligibility
    if (!familyPaymentEligibility?.canAccessPayments) {
      const incompleteStudents = familyPaymentEligibility?.studentsWithoutAccess || [];
      const studentsWithStaffReview = familyPaymentEligibility?.studentsWithStaffReview || [];
      
      if (familyPaymentEligibility?.restrictionReason === 'staff-review-required') {
        const studentNames = studentsWithStaffReview.join(', ');
        setToast({
          message: `Staff review required before accessing payments. Students pending review: ${studentNames}`,
          type: 'warning'
        });
      } else if (incompleteStudents.length > 0) {
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
    if (!effectiveFamilyId || !userProfile) {
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
        familyId: effectiveFamilyId,
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
    if (!effectiveFamilyId || !familyData?.students || !activeSchoolYear) {
      return;
    }

    try {
      const db = getDatabase();
      const budgets = {};
      
      // Load claims to calculate spent amounts
      const claimsRef = ref(db, `homeEducationFamilies/familyInformation/${effectiveFamilyId}/REIMBURSEMENT_CLAIMS/${activeSchoolYear.replace('/', '_')}`);
      const claimsSnapshot = await get(claimsRef);
      
      for (const student of familyData.students) {
        const studentBudgetLimit = calculateStudentBudget(student, activeSchoolYear);
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
    if (!effectiveFamilyId || !familyData?.students || !activeSchoolYear) {
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
      const claimsRef = ref(db, `homeEducationFamilies/familyInformation/${effectiveFamilyId}/REIMBURSEMENT_CLAIMS/${activeSchoolYear.replace('/', '_')}`);
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
    if (!effectiveFamilyId || !user?.uid) {
      return;
    }

    try {
      const db = getDatabase();
      const stripeDataRef = ref(db, `homeEducationFamilies/familyInformation/${effectiveFamilyId}/STRIPE_CONNECT`);
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
    if (!effectiveFamilyId || sessionLoading) {
      return null;
    }

    const sessionKey = `${stripeConnectStatus?.accountId}-${sessionType}`;
    
    // Prevent duplicate session creation
    if (sessionStates[sessionKey]?.created) {
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
        familyId: effectiveFamilyId,
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

  // Handle password change completion
  const handlePasswordChangeComplete = async () => {
    setRequiresPasswordChange(false);
    
    // Force token refresh to get updated claims
    const currentUser = getAuth().currentUser;
    if (currentUser) {
      try {
        await currentUser.getIdToken(true);
        const idTokenResult = await currentUser.getIdTokenResult();
        setCustomClaims(idTokenResult.claims);
        
        // Continue with normal dashboard flow
        setLoading(false);
      } catch (error) {
        console.error('Error refreshing token after password change:', error);
      }
    }
  };

  // Show forced password change screen if temporary password detected
  if (requiresPasswordChange) {
    return <ForcedPasswordChange onPasswordChanged={handlePasswordChangeComplete} />;
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

  // Show facilitator preview screen FIRST for new users before profile creation
  if (!shouldBypassProfileCheck && !hasCompleteProfile && !hasRegisteredFamily && !customClaims?.familyId && showFacilitatorPreview) {
    const allFacilitators = getAllFacilitatorsRandomized();

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-purple-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <RTDConnectLogo />

              {/* Desktop sign out button */}
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-md border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome to RTD Connect!</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We're excited to support your home education journey. Let's get you started!
              </p>
            </div>

            {/* Next Steps Card */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle2 className="w-6 h-6 mr-3 text-purple-600" />
                Quick Setup Process
              </h2>
              <p className="text-gray-700 mb-6">
                Before selecting your facilitator, you'll complete a brief registration process:
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Create Your Personal Profile</h3>
                    <p className="text-sm text-gray-600">
                      Add your contact information as the primary guardian
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Create Your Family Profile</h3>
                    <p className="text-sm text-gray-600">
                      Add your students and family members to your account
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Select Your Facilitator</h3>
                    <p className="text-sm text-gray-600">
                      Choose from our available facilitators to guide your journey
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview Facilitators Button */}
              <div className="mt-6">
                <button
                  onClick={() => setShowFacilitatorPreviewSheet(true)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white border-2 border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 hover:border-purple-400 transition-all"
                >
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Preview Our Facilitators</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 flex items-center justify-center space-x-2 text-purple-700 bg-purple-100 rounded-lg py-3 px-4">
                <Clock className="w-5 h-5" />
                <span className="font-medium">Takes approximately 2-5 minutes to complete</span>
              </div>
            </div>

            {/* Important Note About Registration */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                <Info className="w-5 h-5 mr-2" />
                After Setup: Official Registration
              </h3>
              <p className="text-sm text-blue-800">
                Once you've created your family profile and selected your facilitator, you'll need to complete the
                <strong> Home Education Notification Form</strong> for each student to be officially registered with
                RTD Connect and receive funding. Your facilitator will guide you through this process.
              </p>
            </div>

            {/* Get Started Button */}
            <div className="text-center">
              <button
                onClick={() => setShowFacilitatorPreview(false)}
                className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-lg font-semibold rounded-lg hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all shadow-lg hover:shadow-xl"
              >
                <span>Get Started</span>
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </main>

        {/* Facilitator Preview Sheet - Full Screen Modal */}
        <Sheet open={showFacilitatorPreviewSheet} onOpenChange={setShowFacilitatorPreviewSheet}>
          <SheetContent size="full" className="overflow-y-auto pb-24">
            <SheetHeader>
              <SheetTitle className="text-center">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-3xl font-bold">Preview Our Facilitators</span>
                </div>
              </SheetTitle>
              <SheetDescription className="text-center">
                <p className="text-gray-600 max-w-3xl mx-auto mt-2">
                  Take a moment to learn about our facilitators. After completing your profile setup,
                  you'll be able to select the one that best fits your family's needs.
                </p>
              </SheetDescription>
            </SheetHeader>

            <div className="mt-8 max-w-7xl mx-auto px-4">
              {/* Why Your Facilitator Choice Matters */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-purple-900 mb-3 flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  Why Your Facilitator Choice Matters
                </h3>
                <ul className="text-sm text-purple-800 space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>They'll be your main point of contact for questions and support</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>They'll review your education plans and provide feedback</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>They'll conduct regular check-ins to ensure your success</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>They'll help navigate Alberta's home education requirements</span>
                  </li>
                </ul>
              </div>

              {/* Facilitator Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allFacilitators.map((facilitator) => {
                  const gradientClass = facilitator.gradients?.card || 'from-purple-500 to-blue-500';

                  // Get availability info for regular selection type (for new families)
                  const availabilityInfo = getFacilitatorAvailabilityForType(facilitator.id, 'regular');
                  const isAvailable = availabilityInfo.isAvailable;

                  return (
                    <div
                      key={facilitator.id}
                      className={`relative bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow ${!isAvailable ? 'opacity-60' : ''}`}
                    >
                      {/* Availability Badge */}
                      {isAvailable && (
                        <div className="absolute top-4 left-4 z-10 bg-green-100 border border-green-300 text-green-800 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {availabilityInfo.badge}
                        </div>
                      )}
                      {!isAvailable && (
                        <div className="absolute top-4 left-4 z-10 bg-red-100 border border-red-300 text-red-800 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {availabilityInfo.badge}
                        </div>
                      )}

                      {/* Header with gradient */}
                      <div className={`h-2 bg-gradient-to-r ${gradientClass}`} />

                      <div className="p-6">
                        {/* Profile Section */}
                        <div className="flex items-start space-x-4 mb-4">
                          <div className="relative">
                            {facilitator.image ? (
                              <img
                                src={facilitator.image}
                                alt={facilitator.name}
                                className={`w-16 h-16 rounded-full object-cover border-4 border-white shadow-md ${facilitator.imageStyle || ''}`}
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-white shadow-md flex items-center justify-center">
                                <Users className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900">{facilitator.name}</h3>
                            <p className="text-sm text-gray-600">{facilitator.title}</p>
                            <p className="text-xs text-purple-600 font-medium mt-1">{facilitator.experience}</p>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                          {facilitator.description}
                        </p>

                        {/* Specializations */}
                        <div className="mb-4">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Specializations</h4>
                          <div className="flex flex-wrap gap-2">
                            {facilitator.specializations.slice(0, 2).map((spec, index) => (
                              <span
                                key={index}
                                className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full"
                              >
                                {spec}
                              </span>
                            ))}
                            {facilitator.specializations.length > 2 && (
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                +{facilitator.specializations.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>

                        {/* View Profile Link */}
                        {facilitator.profileUrl && (
                          <a
                            href={getFacilitatorProfileUrl(facilitator)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center"
                          >
                            <span>View Full Profile</span>
                            <ExternalLink className="w-4 h-4 ml-1" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sticky Close Button at Bottom */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-3 z-50">
              <div className="max-w-4xl mx-auto flex justify-center">
                <button
                  onClick={() => setShowFacilitatorPreviewSheet(false)}
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all"
                >
                  <X className="w-4 h-4" />
                  <span>Close Preview</span>
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // Show profile completion first if incomplete (but bypass for staff users)
  if (!shouldBypassProfileCheck && !hasCompleteProfile) {
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
                Let's start by completing your profile as the primary guardian for your family's home education account.
              </p>
            </div>

            {/* Account Information Alert */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">Primary Guardian Account</h3>
                  <div className="space-y-2 text-sm text-blue-800">
                    <p className="flex items-center flex-wrap gap-1">
                      <span>You're logged in as:</span>
                      <span className="font-mono font-semibold bg-blue-100 px-2 py-0.5 rounded border border-blue-300">
                        {user?.email}
                      </span>
                    </p>
                    <ul className="space-y-1 text-xs">
                      <li className="flex items-start">
                        <span className="mr-1.5">•</span>
                        <span>This account will oversee your family's home education - add <strong>your information</strong> to the profile (not your child's)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-1.5">•</span>
                        <span><strong>Wrong email?</strong> Sign out and log back in with the correct email before proceeding</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-1.5">•</span>
                        <span>Keep this account secure - your family information is stored here</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-1.5">•</span>
                        <span>Email changes are possible but require staff assistance for security reasons - best to use the correct email now</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={GraduationCap}
                title="Student Management"
                description="Register and manage your home education students"
                gradient="from-purple-500 to-cyan-500"
              />
              <FeatureCard
                icon={DollarSign}
                title="Reimbursements"
                description="Submit and track reimbursement requests"
                gradient="from-cyan-500 to-blue-500"
              />
              <FeatureCard
                icon={BookOpen}
                title="Portfolio Builder"
                description="Document and showcase your student's learning journey"
                gradient="from-pink-500 to-purple-500"
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
                <div className="space-y-2">
                  <p>Enter <strong>your information</strong> as the primary guardian for this account ({user?.email}).</p>
                  <p className="text-xs">You'll be able to add your children's information in the next step.</p>
                </div>
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

                <FormField
                  label="Birthday"
                  error={profileErrors.birthday}
                  required
                  infoTooltip="Enter your birthday, not your child's. Your children's birthdays will be entered when you add them as family members in the next step."
                >
                  <DatePicker
                    selected={profileData.birthday ? toEdmontonDate(profileData.birthday) : null}
                    onChange={(date) => handleProfileInputChange('birthday', date ? toDateString(date) : '')}
                    openToDate={new Date(new Date().getFullYear() - 35, 0, 1)}
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select your birthday"
                    className={`w-full px-3 py-2 border ${profileErrors.birthday ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    wrapperClassName="w-full"
                  />
                </FormField>

                <FormField
                  label="Address"
                  error={profileErrors.address}
                  required
                  infoTooltip="Enter the address where you currently live. When creating family members in the next steps, you'll have the option to set their address to this same address or update it if different."
                >
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

  // If profile is complete but no family registration, show family setup
  if (!hasRegisteredFamily && !customClaims?.familyId) {
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
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-white" />
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
                  : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500'
              }`}
            >
              {isSettingUpFamily ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-lg">Setting Up...</span>
                </>
              ) : (
                <>
                  <Home className="w-5 h-5" />
                  <span className="text-lg">Create Family Profile</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
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
                  <DatePicker
                    selected={profileData.birthday ? toEdmontonDate(profileData.birthday) : null}
                    onChange={(date) => handleProfileInputChange('birthday', date ? toDateString(date) : '')}
                    openToDate={new Date(new Date().getFullYear() - 35, 0, 1)}
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select your birthday"
                    className={`w-full px-3 py-2 border ${profileErrors.birthday ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    wrapperClassName="w-full"
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

        {/* Family Management */}
        <FamilyManagementWrapper
          isOpen={showFamilyCreation}
          onOpenChange={setShowFamilyCreation}
          familyKey={hasRegisteredFamily ? familyKey : null}
          hasRegisteredFamily={hasRegisteredFamily}
          initialFamilyData={familyData}
          onFamilyDataChange={handleFamilyDataChange}
          onComplete={handleFamilyComplete}
          staffMode={isStaff()}
          isStaffViewing={isStaffViewing}
          onEditProfile={() => setShowProfileForm(true)}
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
                  <DatePicker
                    selected={profileData.birthday ? toEdmontonDate(profileData.birthday) : null}
                    onChange={(date) => handleProfileInputChange('birthday', date ? toDateString(date) : '')}
                    openToDate={new Date(new Date().getFullYear() - 35, 0, 1)}
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select your birthday"
                    className={`w-full px-3 py-2 border ${profileErrors.birthday ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    wrapperClassName="w-full"
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
      {/* Header - Show for all users including staff */}
      <header className="bg-white shadow-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3 sm:space-x-6">
              <RTDConnectLogo />
              {!isStaffViewing && (
                <div className="hidden lg:block">
                  <UserTypeBadge customClaims={customClaims} />
                </div>
              )}
            </div>
            
            {/* Mobile menu button - hide in staff mode */}
            {!isStaffViewing && (
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="flex lg:hidden items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            
            {/* Desktop profile dropdown */}
            <div className="hidden lg:flex items-center space-x-3">
              {isStaffViewing && userProfile && (
                <div className="text-sm text-gray-600 mr-3">
                  Viewing: <span className="font-medium">{userProfile.firstName} {userProfile.lastName}</span>
                </div>
              )}
              <ProfileDropdown 
                userProfile={isStaffViewing && userProfile ? userProfile : { ...userProfile, email: user?.email }}
                onEditProfile={() => setShowProfileForm(true)}
                onSignOut={isStaffViewing ? null : handleSignOut}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Family Dashboard */}
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isStaffViewing ? 'py-4' : 'py-8'}`}>
        {/* Embedded Notification Banner - shows compliance alerts - Only for non-staff */}
        {!isStaffViewing && stripeConnectStatus?.accountId && accountSession?.clientSecret && 
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
        </div>


        {/* Quick Actions & Family Status */}
        <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 border border-gray-100">
          {/* Action Buttons Row */}
          <div className="mb-6">
            <div className="flex-shrink-0">
              {(customClaims?.familyRole === 'primary_guardian' || isStaff()) ? (
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

          {/* Registration Warning Banners - Only for families who need to complete registration */}
          {showRegistrationWarning && (
            <RegistrationWarningBanner
              type="registration"
              onDismiss={() => handleDismissWarning('registrationIncompleteWarning')}
              onAction={() => {
                // Open notification form for first student without submitted form
                const firstStudentNeedingForm = familyData.students.find(student =>
                  studentFormStatuses[student.id]?.[activeSchoolYear] !== 'submitted'
                );
                if (firstStudentNeedingForm) {
                  setSelectedStudent(firstStudentNeedingForm);
                  setShowNotificationForm(true);
                }
              }}
            />
          )}


          {/* Family Status & Facilitator Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Family Status - Dynamic based on status */}
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-4">
                {familyData?.status === 'inactive' ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Family Status</h3>
                      <p className="text-sm text-orange-600 font-medium">Inactive • Contact Facilitator</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Family Status</h3>
                      <p className="text-sm text-green-600 font-medium">Active • {CURRENT_SCHOOL_YEAR}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Facilitator Info - Dynamic based on status */}
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
            {/* Only show verification status for active families */}
            {familyData?.status === 'active' && (
              <>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>
                    <strong>
                      {familyPaymentEligibility?.completedStudents || 0}
                    </strong> of <strong>{familyData.students?.length || 0}</strong> students verified
                  </span>
                </div>
                {familyPaymentEligibility?.studentsWithStaffReview?.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-orange-500" />
                    <span>
                      <strong>{familyPaymentEligibility.studentsWithStaffReview.length}</strong> pending staff review
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Family Status Banner - Shows for Intent and Inactive families */}
        <FamilyStatusBanner
          status={familyData?.status}
          facilitator={selectedFacilitator}
        />

        {/* Family Members List */}
        {((familyData.students && familyData.students.length > 0) || (familyData.guardians && familyData.guardians.length > 0)) && (
          <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-100">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Your Family Members</h2>


            {/* Family Budget Overview - Only for Active Families */}
            {shouldShowFeature('budgetTracking') && familyData.students && familyData.students.length > 0 && Object.keys(studentBudgets).length > 0 && (
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
                      const isInactiveFamily = familyData?.status === 'inactive';

                      // For inactive families, show minimal read-only card
                      if (isInactiveFamily) {
                        return (
                          <div key={student.id || index} className="border border-gray-300 rounded-lg p-4 bg-gray-50 opacity-75">
                            <h4 className="font-semibold text-gray-700 mb-2">
                              {student.preferredName || student.firstName} {student.lastName}
                            </h4>
                            <div className="text-sm text-gray-600">
                              {(() => {
                                const ageInfo = getStudentAgeDisplay(student, activeSchoolYear);
                                if (!ageInfo) return null;

                                return (
                                  <p className="text-sm text-gray-500">
                                    Age: {ageInfo.current.years}y {ageInfo.current.months}m {ageInfo.current.days}d
                                  </p>
                                );
                              })()}
                            </div>
                            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                              <p className="text-xs text-orange-700 italic flex items-center">
                                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                                Contact your facilitator to reactivate this student's registration
                              </p>
                            </div>
                          </div>
                        );
                      }

                      // For active and intent families, show full card
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
                            <div className="mt-2">
                              {(() => {
                                const ageInfo = getStudentAgeDisplay(student, activeSchoolYear);
                                if (!ageInfo) return null;

                                return (
                                  <div className="group relative inline-block">
                                    <div className="text-sm text-blue-700 font-medium cursor-help">
                                      Age: {ageInfo.current.years}y {ageInfo.current.months}m {ageInfo.current.days}d
                                    </div>

                                    {/* Hover tooltip */}
                                    <div className="invisible group-hover:visible absolute left-0 top-full mt-1 w-64 bg-gray-900 text-white text-xs rounded-lg shadow-lg p-3 z-50">
                                      <div className="space-y-1.5">
                                        <p className="font-semibold border-b border-gray-700 pb-1">Age Details</p>
                                        <p className="text-gray-200">
                                          <strong>Current Age:</strong><br/>
                                          {ageInfo.current.years} years, {ageInfo.current.months} months, {ageInfo.current.days} days
                                        </p>
                                        <p className="text-blue-300">
                                          <strong>Age last Sept {ageInfo.lastSeptember.year}:</strong><br/>
                                          {ageInfo.lastSeptember.age.years} years, {ageInfo.lastSeptember.age.months} months, {ageInfo.lastSeptember.age.days} days
                                        </p>
                                        <p className="text-purple-300">
                                          <strong>Age next Sept {ageInfo.nextSeptember.year}:</strong><br/>
                                          {ageInfo.nextSeptember.age.years} years, {ageInfo.nextSeptember.age.months} months, {ageInfo.nextSeptember.age.days} days
                                        </p>
                                      </div>
                                      {/* Arrow pointer */}
                                      <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>

                            {/* Development Mode: Funding Eligibility Information */}
                            {process.env.NODE_ENV === 'development' && student.birthday && (
                              <div className="mt-3 pt-3 border-t border-blue-300">
                                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                                  <div className="flex items-start space-x-2 mb-2">
                                    <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                      <p className="text-xs font-semibold text-yellow-800 mb-1">
                                        DEV MODE ONLY - Funding Eligibility
                                      </p>

                                      {/* Backend Calculated Eligibility */}
                                      <div className="space-y-2 mb-3">
                                        <div className="bg-green-50 border border-green-300 rounded p-2">
                                          <p className="text-xs font-semibold text-green-800 mb-2">
                                            📊 Backend Calculated ({activeSchoolYear}):
                                          </p>
                                          {(() => {
                                            const backendEligibility = getStudentFundingEligibility(student, activeSchoolYear);

                                            if (!backendEligibility || backendEligibility.registrationPhase === 'not_calculated') {
                                              return (
                                                <p className="text-xs text-orange-700">
                                                  ⚠️ Not yet calculated. Submit notification form to trigger.
                                                </p>
                                              );
                                            }

                                            return (
                                              <div className="space-y-1 text-xs">
                                                <div className="flex items-center space-x-2">
                                                  <span className="font-medium">Eligible:</span>
                                                  <span className={backendEligibility.fundingEligible ? 'text-green-700 font-semibold' : 'text-red-700'}>
                                                    {backendEligibility.fundingEligible ? '✅ YES' : '❌ NO'}
                                                  </span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                  <span className="font-medium">Category:</span>
                                                  <span className="text-gray-700">{backendEligibility.ageCategory}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                  <span className="font-medium">Full Amount:</span>
                                                  <span className="text-gray-700 font-semibold">${backendEligibility.fundingAmount}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                  <span className="font-medium">Current Allocation:</span>
                                                  <span className="text-blue-700 font-semibold">${backendEligibility.currentAllocation}</span>
                                                </div>
                                                {backendEligibility.remainingAllocation > 0 && (
                                                  <>
                                                    <div className="flex items-center space-x-2">
                                                      <span className="font-medium">Remaining (Locked):</span>
                                                      <span className="text-purple-700 font-semibold">${backendEligibility.remainingAllocation}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                      <span className="font-medium">Registration Phase:</span>
                                                      <span className="text-orange-700 font-semibold">{backendEligibility.registrationPhase}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                      <span className="font-medium">Upgrade After:</span>
                                                      <span className="text-orange-700">{backendEligibility.upgradeEligibleAfter}</span>
                                                    </div>
                                                    {backendEligibility.proratedReason && (
                                                      <div className="mt-1 p-1 bg-orange-100 rounded">
                                                        <p className="text-xs text-orange-800">{backendEligibility.proratedReason}</p>
                                                      </div>
                                                    )}
                                                  </>
                                                )}
                                                {backendEligibility.eligibilityMessage && (
                                                  <div className="mt-1 p-1 bg-red-100 rounded">
                                                    <p className="text-xs text-red-800">{backendEligibility.eligibilityMessage}</p>
                                                  </div>
                                                )}
                                                {backendEligibility.calculatedAt && (
                                                  <div className="mt-1 text-xs text-gray-500">
                                                    Calculated: {new Date(backendEligibility.calculatedAt).toLocaleString()}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })()}
                                        </div>
                                      </div>

                                      <p className="text-xs text-yellow-700 italic mb-2">
                                        Frontend Calculation (for comparison):
                                      </p>

                                      {/* Current School Year */}
                                      <div className="space-y-2">
                                        <div className="bg-white rounded p-2">
                                          <p className="text-xs font-medium text-gray-700 mb-1">
                                            {CURRENT_SCHOOL_YEAR} Eligibility:
                                          </p>
                                          {(() => {
                                            const kResult = checkKindergartenFundingEligibility(student.birthday, CURRENT_SCHOOL_YEAR);
                                            const g12Result = checkFundingEligibility(student.birthday, CURRENT_SCHOOL_YEAR);

                                            return (
                                              <div className="space-y-1 text-xs">
                                                <div className="flex items-center space-x-2">
                                                  <span className="font-medium">Kindergarten:</span>
                                                  <span className={kResult.isEligible ? 'text-green-600 font-semibold' : 'text-red-600'}>
                                                    {kResult.isEligible ? '✅ Eligible' : '❌ Not Eligible'}
                                                  </span>
                                                  {kResult.isEligible && (
                                                    <span className="text-gray-600">
                                                      (Age: {kResult.ageWithMonths.years}y {kResult.ageWithMonths.months}m)
                                                    </span>
                                                  )}
                                                  {!kResult.isEligible && (
                                                    <span className="text-gray-500">
                                                      ({kResult.reason})
                                                    </span>
                                                  )}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                  <span className="font-medium">Grades 1-12:</span>
                                                  <span className={g12Result.isEligible ? 'text-green-600 font-semibold' : 'text-red-600'}>
                                                    {g12Result.isEligible ? '✅ Eligible' : '❌ Not Eligible'}
                                                  </span>
                                                  {g12Result.isEligible && (
                                                    <span className="text-gray-600">
                                                      (Age: {g12Result.ageOnSept1}y)
                                                    </span>
                                                  )}
                                                  {!g12Result.isEligible && (
                                                    <span className="text-gray-500">
                                                      ({g12Result.reason})
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                            );
                                          })()}
                                        </div>

                                        {/* Next School Year */}
                                        <div className="bg-white rounded p-2">
                                          <p className="text-xs font-medium text-gray-700 mb-1">
                                            {NEXT_SCHOOL_YEAR} Eligibility:
                                          </p>
                                          {(() => {
                                            const kResult = checkKindergartenFundingEligibility(student.birthday, NEXT_SCHOOL_YEAR);
                                            const g12Result = checkFundingEligibility(student.birthday, NEXT_SCHOOL_YEAR);

                                            return (
                                              <div className="space-y-1 text-xs">
                                                <div className="flex items-center space-x-2">
                                                  <span className="font-medium">Kindergarten:</span>
                                                  <span className={kResult.isEligible ? 'text-green-600 font-semibold' : 'text-red-600'}>
                                                    {kResult.isEligible ? '✅ Eligible' : '❌ Not Eligible'}
                                                  </span>
                                                  {kResult.isEligible && (
                                                    <span className="text-gray-600">
                                                      (Age: {kResult.ageWithMonths.years}y {kResult.ageWithMonths.months}m)
                                                    </span>
                                                  )}
                                                  {!kResult.isEligible && (
                                                    <span className="text-gray-500">
                                                      ({kResult.reason})
                                                    </span>
                                                  )}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                  <span className="font-medium">Grades 1-12:</span>
                                                  <span className={g12Result.isEligible ? 'text-green-600 font-semibold' : 'text-red-600'}>
                                                    {g12Result.isEligible ? '✅ Eligible' : '❌ Not Eligible'}
                                                  </span>
                                                  {g12Result.isEligible && (
                                                    <span className="text-gray-600">
                                                      (Age: {g12Result.ageOnSept1}y)
                                                    </span>
                                                  )}
                                                  {!g12Result.isEligible && (
                                                    <span className="text-gray-500">
                                                      ({g12Result.reason})
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                            );
                                          })()}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Home Education Notification Form Status - Only for Active Families */}
                            {shouldShowFeature('notificationForms') && (
                            <div className="mt-3 pt-3 border-t border-blue-300">
                              {shouldMinimizeRegistration(student.id) ? (
                                // Minimized view for completed registration
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2 flex-1">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    <span className="text-sm font-medium text-gray-700">
                                      {activeSchoolYear} Registration
                                    </span>
                                    <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-700 border border-green-300">
                                      Complete
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => toggleCompletedSection(`registration-${student.id}`)}
                                    className="text-xs text-green-600 hover:text-green-700 font-medium"
                                  >
                                    Expand
                                  </button>
                                </div>
                              ) : (
                                // Full view for incomplete or expanded registration
                                <>
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
                                    <div className="flex items-center space-x-2">
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
                                      {formStatus === 'submitted' && (
                                        <button
                                          onClick={() => toggleCompletedSection(`registration-${student.id}`)}
                                          className="text-xs text-gray-500 hover:text-gray-700"
                                        >
                                          Minimize
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Form Access Button - Primary Guardians and Staff */}
                                  {(customClaims?.familyRole === 'primary_guardian' || isStaff()) ? (
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
                                        {isStaff() ? 
                                          (formStatus === 'submitted' || formStatus === 'incomplete' || ['draft', 'draft-complete'].includes(formStatus) ? 
                                            `View ${activeSchoolYear} Registration` : 
                                            `View ${activeSchoolYear} Registration`) :
                                          (formStatus === 'submitted' ? `View ${activeSchoolYear} Form` : 
                                           formStatus === 'incomplete' ? `Complete Missing Parts` :
                                           formStatus === 'draft-complete' ? `Submit ${activeSchoolYear} Form` :
                                           formStatus === 'draft' ? `Complete ${activeSchoolYear} Form` : 
                                           `Start ${activeSchoolYear} Form`)
                                        }
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-500 rounded-md text-center">
                                      Contact Primary Guardian
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                            )}

                            {/* Citizenship Documents Status - For Active and Intent Families */}
                            {shouldShowFeature('citizenshipDocs') && (
                            <div className="mt-3 pt-3 border-t border-blue-300">
                              {shouldMinimizeCitizenship(student.id) ? (
                                // Minimized view for approved documents
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2 flex-1">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    <span className="text-sm font-medium text-gray-700">
                                      Citizenship Documents
                                    </span>
                                    {docStatus.staffApproval ? (
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <button className="inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-full font-medium shadow-sm border bg-green-100 text-green-700 border-green-300 hover:bg-green-200 transition-colors cursor-pointer">
                                            <CheckCircle2 className="w-3 h-3" />
                                            <span>Staff Verified</span>
                                          </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-64 p-3">
                                          <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                                              <span className="font-medium text-green-900">Staff Approved</span>
                                            </div>
                                            <div className="text-sm text-gray-700">
                                              <p><strong>Approved by:</strong> {docStatus.staffApproval.approvedBy.email}</p>
                                              <p><strong>Date:</strong> {new Date(docStatus.staffApproval.approvedAt).toLocaleDateString()}</p>
                                              {docStatus.staffApproval.comment && (
                                                <div className="mt-2">
                                                  <p><strong>Comment:</strong></p>
                                                  <p className="text-xs text-gray-600 italic">"{docStatus.staffApproval.comment}"</p>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </PopoverContent>
                                      </Popover>
                                    ) : (
                                      <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-700 border border-green-300">
                                        Verified
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => toggleCompletedSection(`citizenship-${student.id}`)}
                                    className="text-xs text-green-600 hover:text-green-700 font-medium"
                                  >
                                    Expand
                                  </button>
                                </div>
                              ) : (
                                // Full view for unapproved or expanded documents
                                <>
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <Upload className="w-4 h-4 text-purple-500" />
                                      <span className="text-sm font-medium text-gray-700">
                                        Citizenship Documents
                                      </span>
                                      {docStatus.status === 'completed' ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                      ) : docStatus.status === 'pending-review' ? (
                                        <Eye className="w-4 h-4 text-orange-500" />
                                      ) : (
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {docStatus.status === 'completed' && docStatus.staffApproval ? (
                                        <Popover>
                                          <PopoverTrigger asChild>
                                            <button className="inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-full font-medium shadow-sm border bg-green-100 text-green-700 border-green-300 hover:bg-green-200 transition-colors cursor-pointer">
                                              <CheckCircle2 className="w-3 h-3" />
                                              <span>Staff Verified</span>
                                            </button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-64 p-3">
                                            <div className="space-y-2">
                                              <div className="flex items-center space-x-2">
                                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                <span className="font-medium text-green-900">Staff Approved</span>
                                              </div>
                                              <div className="text-sm text-gray-700">
                                                <p><strong>Approved by:</strong> {docStatus.staffApproval.approvedBy.email}</p>
                                                <p><strong>Date:</strong> {new Date(docStatus.staffApproval.approvedAt).toLocaleDateString()}</p>
                                                {docStatus.staffApproval.comment && (
                                                  <div className="mt-2">
                                                    <p><strong>Comment:</strong></p>
                                                    <p className="text-xs text-gray-600 italic">"{docStatus.staffApproval.comment}"</p>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </PopoverContent>
                                        </Popover>
                                      ) : (
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium shadow-sm border ${
                                          docStatus.status === 'completed' ? 'bg-green-100 text-green-700 border-green-300' : 
                                          docStatus.status === 'pending-review' ? 'bg-orange-100 text-orange-700 border-orange-300' : 
                                          'bg-red-100 text-red-700 border-red-300'
                                        }`}>
                                          {docStatus.status === 'completed' ? 'Verified' : 
                                           docStatus.status === 'pending-review' ? 'Review Required' : 
                                           'Required'}
                                        </span>
                                      )}
                                      {docStatus.status === 'completed' && (
                                        <button
                                          onClick={() => toggleCompletedSection(`citizenship-${student.id}`)}
                                          className="text-xs text-gray-500 hover:text-gray-700"
                                        >
                                          Minimize
                                        </button>
                                      )}
                                    </div>
                                  </div>
                              
                              {/* Staff Review Status */}
                              {!docStatus.staffApproval && docStatus.requiresStaffReview && docStatus.status === 'pending-review' && (
                                <div className="mb-2 p-2 bg-orange-50 border border-orange-200 rounded-md">
                                  <div className="flex items-center space-x-2">
                                    <Eye className="w-4 h-4 text-orange-600" />
                                    <span className="text-xs text-orange-800">
                                      Documents uploaded but require staff verification
                                    </span>
                                  </div>
                                </div>
                              )}
                              
                              {/* Document Action Buttons */}
                              {(customClaims?.familyRole === 'primary_guardian' || isStaff()) ? (
                                <div className="space-y-2">
                                  <button
                                    onClick={() => handleOpenCitizenshipDocs(student)}
                                    className={`w-full px-3 py-2 text-sm rounded-md transition-all shadow-sm hover:shadow-md ${
                                      docStatus.status === 'completed' ?
                                      'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300 hover:border-green-400' :
                                      docStatus.status === 'pending-review' ?
                                      'bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-300 hover:border-orange-400' :
                                      'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300 hover:border-purple-400'
                                    }`}
                                  >
                                    {docStatus.status === 'completed' ? 'View/Update Documents' :
                                     docStatus.status === 'pending-review' ? 'Manage Documents' :
                                     'Upload Documents'}
                                  </button>
                                  
                                  {/* Review/Preview Button - only show if documents exist */}
                                  {docStatus.documentCount > 0 && (
                                    <button
                                      onClick={() => handlePreviewDocuments(student)}
                                      className={`w-full px-3 py-2 text-sm rounded-md transition-all shadow-sm hover:shadow-md flex items-center justify-center space-x-2 ${
                                        isStaff() && docStatus.requiresStaffReview && !docStatus.staffApproval
                                          ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300 hover:border-red-400 font-medium'
                                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300 hover:border-blue-400'
                                      }`}
                                    >
                                      {isStaff() ? (
                                        docStatus.requiresStaffReview && !docStatus.staffApproval ? (
                                          <>
                                            <AlertTriangle className="w-4 h-4" />
                                            <span>Review Required ({docStatus.documentCount})</span>
                                          </>
                                        ) : (
                                          <>
                                            <Eye className="w-4 h-4" />
                                            <span>Review Documents ({docStatus.documentCount})</span>
                                          </>
                                        )
                                      ) : (
                                        <>
                                          <Eye className="w-4 h-4" />
                                          <span>Review Uploaded Documents ({docStatus.documentCount})</span>
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-500 rounded-md text-center">
                                    Contact Primary Guardian
                                  </div>
                                  
                                  {/* Review/Preview Button for non-primary guardians - only show if documents exist */}
                                  {docStatus.documentCount > 0 && (
                                    <button
                                      onClick={() => handlePreviewDocuments(student)}
                                      className={`w-full px-3 py-2 text-sm rounded-md transition-all shadow-sm hover:shadow-md flex items-center justify-center space-x-2 ${
                                        isStaff() && docStatus.requiresStaffReview && !docStatus.staffApproval
                                          ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300 hover:border-red-400 font-medium'
                                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300 hover:border-blue-400'
                                      }`}
                                    >
                                      {isStaff() ? (
                                        docStatus.requiresStaffReview && !docStatus.staffApproval ? (
                                          <>
                                            <AlertTriangle className="w-4 h-4" />
                                            <span>Review Required ({docStatus.documentCount})</span>
                                          </>
                                        ) : (
                                          <>
                                            <Eye className="w-4 h-4" />
                                            <span>Review Documents ({docStatus.documentCount})</span>
                                          </>
                                        )
                                      ) : (
                                        <>
                                          <Eye className="w-4 h-4" />
                                          <span>Review Uploaded Documents ({docStatus.documentCount})</span>
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>
                              )}
                                </>
                              )}
                            </div>
                            )}

                            {/* Program Plan Status - Only for Active Families */}
                            {shouldShowFeature('soloPlans') && (
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
                              
                              {/* Program Plan Button - Primary Guardians and Staff */}
                              {(customClaims?.familyRole === 'primary_guardian' || isStaff()) ? (
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
                                    {isStaff() ? 
                                      'View Program Plan' :
                                      (studentSOLOPlanStatuses[student.id]?.status === 'submitted' ? 'View/Update Program Plan' : 
                                       studentSOLOPlanStatuses[student.id]?.status === 'draft' ? 'Continue Program Plan' : 'Create Program Plan')
                                    }
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
                            )}

                            {/* Facilitator Meetings - Only for Active Families */}
                            {shouldShowFeature('facilitatorMeetings') && (
                            <div className="mt-3 pt-3 border-t border-blue-300">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4 text-purple-500" />
                                  <span className="text-sm font-medium text-gray-700">
                                    Facilitator Meetings
                                  </span>
                                  {studentMeetingStatuses[student.id]?.status === 'submitted' ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                  ) : studentMeetingStatuses[student.id]?.status === 'draft' ? (
                                    <Clock className="w-4 h-4 text-blue-500" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 text-orange-500" />
                                  )}
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium shadow-sm border ${
                                  studentMeetingStatuses[student.id]?.status === 'submitted' ? 'bg-green-100 text-green-700 border-green-300' : 
                                  studentMeetingStatuses[student.id]?.status === 'draft' ? 'bg-blue-100 text-blue-700 border-blue-300' : 
                                  'bg-orange-100 text-orange-700 border-orange-300'
                                }`}>
                                  {studentMeetingStatuses[student.id]?.status === 'submitted' ? 'Completed' : 
                                   studentMeetingStatuses[student.id]?.status === 'draft' ? 'In Progress' : 'Required'}
                                </span>
                              </div>
                              <div className="space-y-2">
                                <button
                                  onClick={() => handleOpenMeetingForm(student)}
                                  className={`w-full px-3 py-2 text-sm rounded-md transition-all shadow-sm hover:shadow-md ${
                                    studentMeetingStatuses[student.id]?.status === 'submitted' ?
                                    'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300 hover:border-green-400' :
                                    studentMeetingStatuses[student.id]?.status === 'draft' ?
                                    'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300 hover:border-blue-400' :
                                    'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300 hover:border-purple-400'
                                  }`}
                                >
                                  {isStaff() ? 'Edit Progress Report' : 'View Progress Report'}
                                </button>
                                {studentMeetingStatuses[student.id]?.pdfVersions?.length > 0 && (
                                  <button
                                    onClick={() => {
                                      const latest = studentMeetingStatuses[student.id].pdfVersions[studentMeetingStatuses[student.id].pdfVersions.length - 1];
                                      window.open(latest.url, '_blank');
                                    }}
                                    className="w-full px-3 py-2 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 hover:border-gray-400 transition-all shadow-sm hover:shadow-md flex items-center justify-center space-x-2"
                                  >
                                    <Download className="w-4 h-4" />
                                    <span>Download Latest PDF</span>
                                  </button>
                                )}
                              </div>
                            </div>
                            )}

                            {/* Learning Portfolio Section - For Active and Intent Families */}
                            {shouldShowFeature('portfolio') && (
                            <div className="mt-3 pt-3 border-t border-blue-300">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <BookOpen className="w-4 h-4 text-indigo-500" />
                                  <span className="text-sm font-medium text-gray-700">
                                    Learning Portfolio
                                  </span>
                                  {studentPortfolioStatuses[student.id]?.hasPortfolio ? (
                                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                                  ) : (
                                    <Info className="w-4 h-4 text-gray-400" />
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  {studentPortfolioStatuses[student.id]?.entryCount > 0 && (
                                    <span className="text-xs px-2 py-1 rounded-full font-medium shadow-sm border bg-indigo-100 text-indigo-700 border-indigo-300">
                                      {studentPortfolioStatuses[student.id].entryCount} {studentPortfolioStatuses[student.id].entryCount === 1 ? 'entry' : 'entries'}
                                    </span>
                                  )}
                                  <span className={`text-xs px-2 py-1 rounded-full font-medium shadow-sm border ${
                                    studentPortfolioStatuses[student.id]?.hasPortfolio 
                                      ? 'bg-gradient-to-r from-indigo-100 to-teal-100 text-indigo-700 border-indigo-300' 
                                      : 'bg-gray-100 text-gray-600 border-gray-300'
                                  }`}>
                                    {studentPortfolioStatuses[student.id]?.hasPortfolio ? 'Active' : 'Not Started'}
                                  </span>
                                </div>
                              </div>

                              {/* Portfolio Details */}
                              {studentPortfolioStatuses[student.id]?.hasPortfolio && (
                                <div className="mb-2 text-xs text-gray-600 flex items-center justify-between">
                                  <span>
                                    Last updated: {studentPortfolioStatuses[student.id]?.lastUpdated 
                                      ? new Date(studentPortfolioStatuses[student.id].lastUpdated).toLocaleDateString()
                                      : 'Never'}
                                  </span>
                                </div>
                              )}
                              
                              {/* Portfolio Button - Primary Guardians and Staff */}
                              {(customClaims?.familyRole === 'primary_guardian' || isStaff()) ? (
                                <button
                                  onClick={() => {
                                    setSelectedStudentForPortfolio(student);
                                    setShowPortfolio(true);
                                  }}
                                  className={`w-full px-3 py-2 text-sm rounded-md transition-all shadow-sm hover:shadow-md ${
                                    studentPortfolioStatuses[student.id]?.hasPortfolio
                                      ? 'bg-gradient-to-r from-indigo-500 to-teal-500 text-white hover:from-indigo-600 hover:to-teal-600 border border-indigo-400'
                                      : 'bg-gradient-to-r from-indigo-100 to-teal-100 text-indigo-700 hover:from-indigo-200 hover:to-teal-200 border border-indigo-300'
                                  }`}
                                >
                                  <div className="flex items-center justify-center space-x-2">
                                    <BookOpen className="w-4 h-4" />
                                    <span>
                                      {isStaff() 
                                        ? 'View Portfolio'
                                        : studentPortfolioStatuses[student.id]?.hasPortfolio
                                          ? 'Manage Portfolio'
                                          : 'Create Portfolio'
                                      }
                                    </span>
                                  </div>
                                </button>
                              ) : (
                                <div className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-500 rounded-md text-center">
                                  Contact Primary Guardian
                                </div>
                              )}
                            </div>
                            )}

                            {/* Budget Information Section - Only for Active Families */}
                            {shouldShowFeature('budgetTracking') && studentBudgets[student.id] && (
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

      {/* Profile Sheet - Available for all users */}
      <Sheet open={showProfileForm} onOpenChange={setShowProfileForm}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-left">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-purple-500" />
                <span>{isStaffViewing ? 'Edit User Profile' : 'Edit Your Profile'}</span>
              </div>
            </SheetTitle>
            <SheetDescription className="text-left">
              {isStaffViewing ? (
                <div className="space-y-2">
                  <div>Update basic information and contact details for this user.</div>
                  <div className="flex items-center space-x-2 text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                    <Info className="w-4 h-4" />
                    <span className="text-sm font-medium">Staff Mode: Editing {userProfile?.firstName} {userProfile?.lastName}'s profile</span>
                  </div>
                </div>
              ) : (
                'Update your basic information and contact details.'
              )}
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

      {/* Family Management - Primary Guardians and Staff */}
      {(customClaims?.familyRole === 'primary_guardian' || isStaff()) && (
        <FamilyManagementWrapper
          isOpen={showFamilyCreation}
          onOpenChange={setShowFamilyCreation}
          familyKey={hasRegisteredFamily ? (isStaffViewing ? effectiveFamilyId : familyKey) : null}
          hasRegisteredFamily={hasRegisteredFamily}
          initialFamilyData={familyData}
          onFamilyDataChange={handleFamilyDataChange}
          onComplete={handleFamilyComplete}
          staffMode={isStaff()}
          isStaffViewing={isStaffViewing}
          onEditProfile={() => setShowProfileForm(true)}
        />
      )}

      {/* Home Education Notification Form - Primary Guardians and Staff */}
      {(customClaims?.familyRole === 'primary_guardian' || isStaff()) && showNotificationForm && (
        <HomeEducationNotificationFormV2
          isOpen={showNotificationForm}
          onOpenChange={(open) => {
            setShowNotificationForm(open);
            if (!open) {
              setSelectedStudent(null);
            }
          }}
          familyId={effectiveFamilyId}
          familyData={familyData}
          selectedStudent={selectedStudent}
          schoolYear={activeSchoolYear}
          readOnly={isStaff()}
          staffMode={isStaff()}
        />
      )}

      {/* Student Citizenship Documents Modal - For Primary Guardians and Staff */}
      {(customClaims?.familyRole === 'primary_guardian' || isStaff()) && showCitizenshipDocs && (
        <StudentCitizenshipDocuments
          isOpen={showCitizenshipDocs}
          onOpenChange={(open) => {
            setShowCitizenshipDocs(open);
            if (!open) {
              setSelectedStudentForDocs(null);
            }
          }}
          student={selectedStudentForDocs}
          familyId={effectiveFamilyId}
          onDocumentsUpdated={handleDocumentsUpdated}
          aiAnalyze={true}
        />
      )}

      {/* Document Preview Modal */}
      {showDocumentPreview && (
        <Sheet open={showDocumentPreview} onOpenChange={setShowDocumentPreview}>
          <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-left">
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-blue-500" />
                  <span>Document Preview - {previewStudentName}</span>
                </div>
              </SheetTitle>
              <SheetDescription className="text-left">
                Preview uploaded citizenship documents for {previewStudentName}.
              </SheetDescription>
            </SheetHeader>

            {/* Staff Approval Section - Only visible to staff */}
            {isStaff() && previewStudent && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-blue-900">Staff Review</h3>
                  </div>
                  {studentDocumentStatuses[previewStudent.id]?.staffApproval && (
                    <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      ✓ Already Approved
                    </div>
                  )}
                </div>

                {/* Show existing approval if present */}
                {studentDocumentStatuses[previewStudent.id]?.staffApproval ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-900">Approved by Staff</span>
                      </div>
                      <div className="text-sm text-green-800">
                        <p><strong>Approved by:</strong> {studentDocumentStatuses[previewStudent.id].staffApproval.approvedBy.email}</p>
                        <p><strong>Date:</strong> {new Date(studentDocumentStatuses[previewStudent.id].staffApproval.approvedAt).toLocaleString()}</p>
                        {studentDocumentStatuses[previewStudent.id].staffApproval.comment && (
                          <p><strong>Comment:</strong> {studentDocumentStatuses[previewStudent.id].staffApproval.comment}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Show approval form if not yet approved */
                  <div className="space-y-4">

                    {/* AI Analysis Details Accordion */}
                    {(() => {
                      const docStatus = studentDocumentStatuses[previewStudent.id];
                      const hasAIAnalysis = docStatus?.aiAnalysisResults && Object.keys(docStatus.aiAnalysisResults).length > 0;
                      const hasManualOverrides = docStatus?.manualOverrides && Object.keys(docStatus.manualOverrides).length > 0;
                      
                      if (!hasAIAnalysis) return null;
                      
                      return (
                        <div className="border border-gray-200 rounded-lg">
                          <button
                            type="button"
                            onClick={() => setShowAIAnalysis(prev => !prev)}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              <Info className="w-5 h-5 text-blue-600" />
                              <span className="font-medium text-gray-900">AI Analysis Results - Why These Documents Need Review</span>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${showAIAnalysis ? 'transform rotate-180' : ''}`} />
                          </button>
                          
                          {showAIAnalysis && (
                            <div className="p-4 border-t border-gray-200 space-y-3">
                          
                          {Object.entries(docStatus.aiAnalysisResults).map(([analysisId, analysis]) => {
                            const matchingDocument = docStatus.documents?.find(doc => doc._analysisId === analysisId);
                            const override = docStatus.manualOverrides?.[analysisId];
                            
                            return (
                              <div key={analysisId} className="border border-red-200 rounded-lg p-4 bg-red-50">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h5 className="font-medium text-red-900">
                                      {matchingDocument?.name || 'Document'}
                                    </h5>
                                    <div className="flex items-center space-x-4 text-sm text-red-700 mt-1">
                                      <span>Overall Score: <strong>{analysis.overallScore}%</strong></span>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        analysis.overallScore < 50 ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                                      }`}>
                                        {analysis.reviewPriority?.toUpperCase() || 'HIGH'} PRIORITY
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Main Issues */}
                                <div className="space-y-3">
                                  {/* Student Name Mismatch */}
                                  {!analysis.studentNameMatch && (
                                    <div className="p-3 bg-white border border-red-300 rounded">
                                      <div className="flex items-start space-x-2">
                                        <X className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                          <h6 className="font-medium text-red-900">Student Name Mismatch</h6>
                                          <div className="text-sm text-red-800 mt-1 space-y-1">
                                            <p><strong>Expected:</strong> {docStatus.studentName}</p>
                                            <p><strong>Found on Document:</strong> {analysis.detectedName || 'Not detected'}</p>
                                            <p><strong>Confidence:</strong> {Math.round((analysis.nameMatchConfidence || 0) * 100)}%</p>
                                            {analysis.nameMatchReasoning && (
                                              <p><strong>AI Reasoning:</strong> {analysis.nameMatchReasoning}</p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Document Type Issues */}
                                  {(!analysis.documentTypeMatch || (analysis.documentTypeConfidence || 0) < 0.8) && (
                                    <div className="p-3 bg-white border border-yellow-300 rounded">
                                      <div className="flex items-start space-x-2">
                                        <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                          <h6 className="font-medium text-yellow-900">Document Type Concern</h6>
                                          <div className="text-sm text-yellow-800 mt-1 space-y-1">
                                            <p><strong>Detected Type:</strong> {analysis.detectedDocumentType?.replace(/_/g, ' ')?.replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown'}</p>
                                            <p><strong>Type Confidence:</strong> {Math.round((analysis.documentTypeConfidence || 0) * 100)}%</p>
                                            {analysis.typeMatchReasoning && (
                                              <p><strong>AI Reasoning:</strong> {analysis.typeMatchReasoning}</p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Validation Issues */}
                                  {analysis.validationIssues && analysis.validationIssues.length > 0 && (
                                    <div className="p-3 bg-white border border-orange-300 rounded">
                                      <div className="flex items-start space-x-2">
                                        <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                          <h6 className="font-medium text-orange-900">Additional Issues Detected</h6>
                                          <ul className="text-sm text-orange-800 mt-1 space-y-1">
                                            {analysis.validationIssues.map((issue, idx) => (
                                              <li key={idx} className="flex items-start space-x-1">
                                                <span className="text-orange-600 mt-1">•</span>
                                                <span>{issue}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Detailed Confidence Scores */}
                                  {analysis.confidence && (
                                    <div className="p-3 bg-white border border-gray-300 rounded">
                                      <h6 className="font-medium text-gray-900 mb-2">Detailed Confidence Scores</h6>
                                      <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                          <span className="text-gray-600">Document Authenticity:</span>
                                          <span className={`ml-2 font-medium ${(analysis.confidence.documentAuthenticity || 0) > 0.7 ? 'text-green-600' : 'text-red-600'}`}>
                                            {Math.round((analysis.confidence.documentAuthenticity || 0) * 100)}%
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-gray-600">Name Extraction:</span>
                                          <span className={`ml-2 font-medium ${(analysis.confidence.nameExtraction || 0) > 0.7 ? 'text-green-600' : 'text-red-600'}`}>
                                            {Math.round((analysis.confidence.nameExtraction || 0) * 100)}%
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-gray-600">Document Type:</span>
                                          <span className={`ml-2 font-medium ${(analysis.confidence.documentType || 0) > 0.7 ? 'text-green-600' : 'text-red-600'}`}>
                                            {Math.round((analysis.confidence.documentType || 0) * 100)}%
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-gray-600">Student Match:</span>
                                          <span className={`ml-2 font-medium ${(analysis.confidence.studentMatch || 0) > 0.7 ? 'text-green-600' : 'text-red-600'}`}>
                                            {Math.round((analysis.confidence.studentMatch || 0) * 100)}%
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Document Details */}
                                  {(analysis.detectedBirthDate || analysis.documentNumber || analysis.issuingAuthority) && (
                                    <div className="p-3 bg-gray-50 border border-gray-300 rounded">
                                      <h6 className="font-medium text-gray-900 mb-2">Extracted Document Information</h6>
                                      <div className="text-sm text-gray-700 space-y-1">
                                        {analysis.detectedBirthDate && (
                                          <p><strong>Birth Date:</strong> {analysis.detectedBirthDate}</p>
                                        )}
                                        {analysis.documentNumber && (
                                          <p><strong>Document Number:</strong> {analysis.documentNumber}</p>
                                        )}
                                        {analysis.issuingAuthority && (
                                          <p><strong>Issuing Authority:</strong> {analysis.issuingAuthority}</p>
                                        )}
                                        {analysis.issueDate && (
                                          <p><strong>Issue Date:</strong> {analysis.issueDate}</p>
                                        )}
                                        {analysis.expiryDate && (
                                          <p><strong>Expiry Date:</strong> {analysis.expiryDate}</p>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Manual Override Status */}
                                  {override && (
                                    <div className="p-3 bg-blue-50 border border-blue-300 rounded">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <Info className="w-4 h-4 text-blue-600" />
                                        <h6 className="font-medium text-blue-900">Parent/Guardian Override</h6>
                                      </div>
                                      <p className="text-sm text-blue-800">
                                        The parent/guardian has manually confirmed this document is valid despite AI concerns.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Collapsible Comment Section */}
                    <div className="border border-gray-200 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setStaffComment(prev => prev === null ? '' : null)}
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-700">Add Staff Comment (Optional)</span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${staffComment !== null ? 'transform rotate-180' : ''}`} />
                      </button>
                      
                      {staffComment !== null && (
                        <div className="p-3 border-t border-gray-200">
                          <textarea
                            id="staff-comment"
                            value={staffComment}
                            onChange={(e) => setStaffComment(e.target.value)}
                            rows={3}
                            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Add any notes about the document verification..."
                          />
                        </div>
                      )}
                    </div>

                    {/* Approval button */}
                    <button
                      onClick={() => handleStaffApproval(previewStudent, staffComment || '')}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Approve Documents</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 space-y-6">
              {previewDocuments.map((document, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{document.name}</h3>
                      <p className="text-sm text-gray-500">{document.typeLabel || document.type}</p>
                      {document.uploadedAt && (
                        <p className="text-xs text-gray-400">
                          Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => window.open(document.url, '_blank')}
                      className="flex items-center justify-center p-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors border border-blue-300 hover:border-blue-400"
                      title="Open in full screen"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="w-full">
                    {document.name?.toLowerCase().endsWith('.pdf') ? (
                      <div className="aspect-[8.5/11] w-full border border-gray-300 rounded-lg overflow-hidden">
                        <iframe
                          src={document.url}
                          className="w-full h-full"
                          title={`PDF Preview: ${document.name}`}
                        />
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <img
                          src={document.url}
                          alt={`Document: ${document.name}`}
                          className="max-w-full max-h-96 object-contain rounded-lg border border-gray-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div 
                          className="hidden p-8 bg-gray-50 border border-gray-300 rounded-lg text-center"
                        >
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">Unable to preview this file</p>
                          <p className="text-sm text-gray-500">Click the external link icon to view</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Program Plan Form - Primary Guardians and Staff */}
      {(customClaims?.familyRole === 'primary_guardian' || isStaff()) && showSOLOPlanForm && (
        <SOLOEducationPlanForm
          isOpen={showSOLOPlanForm}
          onOpenChange={handleSOLOPlanClose}
          student={selectedStudentForSOLO}
          familyId={effectiveFamilyId}
          schoolYear={soloTargetSchoolYear}
          selectedFacilitator={selectedFacilitator}
          readOnly={isStaff()}
          staffMode={isStaff()}
        />
      )}


      {/* Facilitator Meeting Form - Everyone can open; staff edits, family comments */}
      {showMeetingForm && (
        <FacilitatorMeetingForm
          isOpen={showMeetingForm}
          onOpenChange={handleMeetingFormClose}
          student={selectedStudentForMeeting}
          familyId={effectiveFamilyId}
          schoolYear={soloTargetSchoolYear}
          staffMode={isStaff()}
          userClaims={customClaims}
          selectedFacilitator={selectedFacilitator}
        />
      )}

      {/* Portfolio Manager - Primary Guardians and Staff */}
      {(customClaims?.familyRole === 'primary_guardian' || isStaff()) && (
        <Sheet open={showPortfolio} onOpenChange={(open) => {
          if (!open) {
            setShowPortfolio(false);
            setSelectedStudentForPortfolio(null);
            // Reload portfolio statuses after closing
            if (effectiveFamilyId && familyData?.students && activeSchoolYear) {
              const loadPortfolioStatuses = async () => {
                const db = getFirestore();
                const statuses = {};
                
                for (const student of familyData.students) {
                  try {
                    // Check if metadata exists for this student
                    const metadataRef = doc(db, 'portfolios', effectiveFamilyId, 'metadata', student.id);
                    const metadataSnap = await getDoc(metadataRef);
                    
                    if (metadataSnap.exists()) {
                      const metadata = metadataSnap.data();
                      statuses[student.id] = {
                        hasPortfolio: true,
                        entryCount: metadata.totalEntries || 0,
                        lastUpdated: metadata.lastModified?.toDate ? metadata.lastModified.toDate() : metadata.lastModified
                      };
                    } else {
                      statuses[student.id] = {
                        hasPortfolio: false,
                        entryCount: 0,
                        lastUpdated: null
                      };
                    }
                  } catch (error) {
                    console.error(`Error loading portfolio status for student ${student.id}:`, error);
                    statuses[student.id] = {
                      hasPortfolio: false,
                      entryCount: 0,
                      lastUpdated: null
                    };
                  }
                }
                
                setStudentPortfolioStatuses(statuses);
              };
              
              loadPortfolioStatuses();
            }
          }
        }}>
          <SheetContent side="bottom" size="full" className="h-full w-full overflow-hidden p-0">
            {selectedStudentForPortfolio && (
              <PortfolioManager
                student={selectedStudentForPortfolio}
                familyId={effectiveFamilyId}
                schoolYear={activeSchoolYear}
                onClose={() => setShowPortfolio(false)}
              />
            )}
          </SheetContent>
        </Sheet>
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
          onPrint={() => {}}
        />
      )}



      {/* Receipt Upload Form */}
      <ReceiptUploadForm
        isOpen={showReceiptUploadForm}
        onOpenChange={setShowReceiptUploadForm}
        familyData={familyData}
        schoolYear={activeSchoolYear}
        familyId={effectiveFamilyId}
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

      {/* Mobile Navigation Sheet - Only for non-staff users */}
      {!isStaffViewing && (
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

              {/* Completed Documents Section */}
              {familyData?.students && familyData.students.length > 0 && (
                <div className="pb-4 border-b border-gray-200">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Completed Documents</h4>
                  <div className="space-y-1">
                    {familyData.students.map(student => {
                      const formStatus = studentFormStatuses[student.id]?.current || 'pending';
                      const docStatus = studentDocumentStatuses[student.id] || { status: 'pending' };
                      const hasCompletedForm = formStatus === 'submitted';
                      const hasApprovedDocs = docStatus.status === 'completed' || docStatus.staffApproval?.isApproved;
                      
                      if (!hasCompletedForm && !hasApprovedDocs) return null;
                      
                      return (
                        <div key={student.id} className="space-y-1">
                          <p className="text-xs text-gray-500 font-medium px-3 pt-2">
                            {student.firstName} {student.lastName}
                          </p>
                          {hasCompletedForm && (
                            <button
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setSelectedStudent(student);
                                setShowNotificationForm(true);
                              }}
                              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-green-50 rounded-md transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-3 text-green-500" />
                              View Registration Form
                            </button>
                          )}
                          {hasApprovedDocs && (
                            <button
                              onClick={() => {
                                setMobileMenuOpen(false);
                                handlePreviewDocuments(student);
                              }}
                              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-green-50 rounded-md transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-3 text-green-500" />
                              View Citizenship Docs
                            </button>
                          )}
                        </div>
                      );
                    }).filter(Boolean)}
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
      )}
      
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
