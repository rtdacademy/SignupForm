import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDatabase, ref, get, set, push, onValue, off } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { useNavigate } from 'react-router-dom';
import { Users, DollarSign, FileText, Home, AlertCircle, CheckCircle2, ArrowRight, GraduationCap, Heart, Shield, User, Phone, MapPin, Edit3, ChevronDown, LogOut, Plus, UserPlus, Calendar, Hash, X, Settings, Loader2, Crown, UserCheck, Clock, AlertTriangle, Info, Upload, Menu, Download } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../components/ui/sheet';
import AddressPicker from '../components/AddressPicker';
import FamilyCreationSheet from './FamilyCreationSheet';
import HomeEducationNotificationFormV2 from './HomeEducationNotificationFormV2';
import StudentCitizenshipDocuments from '../components/StudentCitizenshipDocuments';
import SOLOEducationPlanForm from './SOLOEducationPlanForm';
import StripeConnectOnboarding from '../components/StripeConnectOnboarding';
import ReimbursementSubmissionForm from '../components/ReimbursementSubmissionForm';
import { 
  getCurrentSchoolYear, 
  getActiveSeptemberCount, 
  formatImportantDate, 
  hasSeptemberCountPassed,
  getAllSeptemberCountDates,
  isRegistrationOpen,
  getOpenRegistrationSchoolYear,
  getAllOpenRegistrationSchoolYears,
  getRegistrationOpenDateForYear
} from '../config/importantDates';

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
    address: null
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
  const [showStripeOnboarding, setShowStripeOnboarding] = useState(false);
  const [showReimbursementForm, setShowReimbursementForm] = useState(false);
  const [selectedStudentForReimbursement, setSelectedStudentForReimbursement] = useState(null);
  const [stripeConnectStatus, setStripeConnectStatus] = useState(null);
  const [studentReimbursementStatuses, setStudentReimbursementStatuses] = useState({});
  const [isSubmittingReimbursement, setIsSubmittingReimbursement] = useState(false);
  const [stripeConnectError, setStripeConnectError] = useState(null);
  const [reimbursementError, setReimbursementError] = useState(null);
  
  // School year tracking state
  const [currentSchoolYear, setCurrentSchoolYear] = useState('');
  const [activeSchoolYear, setActiveSchoolYear] = useState('');
  const [soloTargetSchoolYear, setSoloTargetSchoolYear] = useState('');
  const [schoolYearStatus, setSchoolYearStatus] = useState({});
  const [nextSeptemberCount, setNextSeptemberCount] = useState(null);

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
    
    setCurrentSchoolYear(currentYear);
    setActiveSchoolYear(targetSchoolYear);
    setSoloTargetSchoolYear(soloTargetYear);
    setNextSeptemberCount(activeSeptember);
    
    console.log('School year tracking initialized:', {
      currentSchoolYear: currentYear,
      activeSchoolYear: targetSchoolYear,
      soloTargetSchoolYear: soloTargetYear,
      openRegistrationYears,
      primaryOpenYear,
      nextSeptemberCount: activeSeptember
    });
  }, []);

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
        
        // Pre-fill form if data exists
        if (userData.firstName || userData.lastName || userData.phone || userData.address) {
          setProfileData({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            phone: userData.phone || '',
            address: userData.address || null
          });
        }
      } else {
        setUserProfile(null);
        setHasCompleteProfile(false);
        setProfileData({
          firstName: '',
          lastName: '',
          phone: '',
          address: null
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
              // Check if form is actually submitted, not just saved
              if (formData.submissionStatus === 'submitted') {
                statuses[student.id][schoolYear] = 'submitted';
              } else {
                statuses[student.id][schoolYear] = 'draft';
              }
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
          statuses[student.id][schoolYear] === 'submitted'
        );
        const anyStudentStarted = familyData.students.some(student => 
          statuses[student.id][schoolYear] === 'draft'
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
      loadStripeConnectStatus();
    }
  }, [customClaims?.familyId, user?.uid, customClaims?.familyRole]);

  // Effect to load reimbursement statuses
  useEffect(() => {
    if (customClaims?.familyId && familyData?.students && activeSchoolYear) {
      loadReimbursementStatuses();
    }
  }, [customClaims?.familyId, familyData?.students, activeSchoolYear]);

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
  const handleStripeAccountCreated = (accountData) => {
    setStripeConnectStatus({
      accountId: accountData.accountId,
      status: accountData.status,
      onboardingComplete: accountData.status === 'active'
    });
    console.log('Stripe Connect account created:', accountData);
  };

  const handleStripeOnboardingComplete = () => {
    setShowStripeOnboarding(false);
    // Reload the Stripe Connect status to get updated information
    loadStripeConnectStatus();
    console.log('Stripe onboarding completed');
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

      // Generate a unique reimbursement ID
      const reimbursementId = `reimb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Find the student name from familyData
      const student = familyData.students.find(s => s.id === reimbursementData.studentId);
      const studentName = student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';

      // Create reimbursement record
      const reimbursementRecord = {
        id: reimbursementId,
        studentId: reimbursementData.studentId,
        studentName: studentName,
        amount: parseFloat(reimbursementData.amount),
        description: reimbursementData.description,
        category: reimbursementData.category,
        purchaseDate: reimbursementData.purchaseDate,
        receiptFiles: receiptFiles,
        submittedAt: new Date().toISOString(),
        submittedBy: user.uid,
        submittedByEmail: user.email,
        status: 'pending_review',
        schoolYear: activeSchoolYear,
        payout_status: 'pending',
        lastUpdated: new Date().toISOString()
      };

      const db = getDatabase();
      
      // Write to family reimbursements
      const reimbursementRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/REIMBURSEMENTS/${activeSchoolYear.replace('/', '_')}/${reimbursementData.studentId}/${reimbursementId}`);
      await set(reimbursementRef, reimbursementRecord);

      // Add to admin queue for review
      const adminQueueRef = ref(db, `adminReimbursementQueue/${reimbursementId}`);
      await set(adminQueueRef, {
        ...reimbursementRecord,
        familyId: familyId,
        queuedAt: new Date().toISOString()
      });

      // Log the action for audit purposes
      const auditLogRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/AUDIT_LOG`);
      await push(auditLogRef, {
        action: 'reimbursement_submitted',
        performed_by: user.uid,
        performed_by_email: user.email,
        timestamp: new Date().toISOString(),
        details: {
          reimbursementId: reimbursementId,
          studentId: reimbursementData.studentId,
          studentName: studentName,
          amount: reimbursementData.amount,
          category: reimbursementData.category
        }
      });

      console.log('Reimbursement submitted successfully:', reimbursementId);
      
      setShowReimbursementForm(false);
      setSelectedStudentForReimbursement(null);
      
      // Reload reimbursement statuses
      await loadReimbursementStatuses();
    } catch (error) {
      console.error('Error submitting reimbursement:', error);
      setReimbursementError(error.message || 'Failed to submit reimbursement');
    } finally {
      setIsSubmittingReimbursement(false);
    }
  };

  const handleOpenReimbursementForm = (student) => {
    // Check if Stripe Connect account is set up
    if (!stripeConnectStatus?.onboardingComplete) {
      alert('Please complete the secure payout setup before submitting reimbursements.');
      setShowStripeOnboarding(true);
      return;
    }
    
    setSelectedStudentForReimbursement(student);
    setShowReimbursementForm(true);
  };

  const loadReimbursementStatuses = async () => {
    if (!customClaims?.familyId || !familyData?.students || !activeSchoolYear) {
      return;
    }

    try {
      const db = getDatabase();
      const statuses = {};
      
      for (const student of familyData.students) {
        const reimbursementRef = ref(db, `homeEducationFamilies/familyInformation/${customClaims.familyId}/REIMBURSEMENTS/${activeSchoolYear.replace('/', '_')}/${student.id}`);
        const snapshot = await get(reimbursementRef);
        
        if (snapshot.exists()) {
          const reimbursements = snapshot.val();
          const reimbursementList = Object.values(reimbursements);
          
          statuses[student.id] = {
            total: reimbursementList.length,
            pending: reimbursementList.filter(r => r.status === 'pending_review').length,
            approved: reimbursementList.filter(r => r.status === 'approved').length,
            paid: reimbursementList.filter(r => r.payout_status === 'paid').length,
            totalAmount: reimbursementList.reduce((sum, r) => sum + (r.amount || 0), 0)
          };
        } else {
          statuses[student.id] = {
            total: 0,
            pending: 0,
            approved: 0,
            paid: 0,
            totalAmount: 0
          };
        }
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
          accountId: data.accountId,
          status: data.status,
          onboardingComplete: data.status === 'active',
          createdAt: data.createdAt,
          lastUpdated: data.lastUpdated
        });
      }
    } catch (error) {
      console.error('Error loading Stripe Connect status:', error);
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

  // If family is registered, show the full dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
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
                studentFormStatuses[student.id]?.current === 'pending'
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
            {/* Action Button */}
            <div className="flex-shrink-0">
              {customClaims?.familyRole === 'primary_guardian' ? (
                <div className="flex gap-3">
                  <button
                    onClick={handleStartRegistration}
                    className="w-full lg:w-auto flex items-center justify-center space-x-2 px-4 lg:px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Edit3 className="w-5 h-5" />
                    <span className="text-sm lg:text-base">Update Family Information</span>
                  </button>
                </div>
              ) : (
                <div className="w-full lg:w-auto flex items-center justify-center space-x-2 px-4 lg:px-6 py-3 bg-gray-50 text-gray-500 rounded-lg border border-gray-200">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm lg:text-base">Only Primary Guardian Can Edit</span>
                </div>
              )}
            </div>
            
            {/* Family Status Info */}
            <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 lg:w-12 h-10 lg:h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-5 lg:w-6 h-5 lg:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900">Family Status</h3>
                  <p className="text-xs lg:text-sm text-green-600 font-medium">Active • Profile Complete</p>
                </div>
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
          </div>
        </div>


        {/* Family Members List */}
        {((familyData.students && familyData.students.length > 0) || (familyData.guardians && familyData.guardians.length > 0)) && (
          <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-100">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Your Family Members</h2>
            
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
                    return (
                      <div key={student.id || index} className="border border-blue-200 rounded-lg p-3 sm:p-4 bg-blue-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {student.preferredName || student.firstName} {student.lastName}
                            </h4>
                            <div className="mt-2 space-y-1 text-xs sm:text-sm text-gray-600">
                              <p>ASN: {student.asn}</p>
                              <p>Grade: {student.grade}</p>
                              <p>Gender: {student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : student.gender === 'X' ? 'Other' : student.gender || 'Not specified'}</p>
                              <p>Birthday: {new Date(student.birthday).toLocaleDateString()}</p>
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
                                  ) : formStatus === 'draft' ? (
                                    <Clock className="w-4 h-4 text-blue-500" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 text-orange-500" />
                                  )}
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium shadow-sm border ${
                                  formStatus === 'submitted' ? 'bg-green-100 text-green-700 border-green-300' :
                                  formStatus === 'draft' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                                  'bg-orange-100 text-orange-700 border-orange-300'
                                }`}>
                                  {formStatus === 'submitted' ? 'Submitted' :
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
                                      formStatus === 'draft' ?
                                      'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300 hover:border-blue-400' :
                                      'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300 hover:border-purple-400'
                                    }`}
                                  >
                                    {formStatus === 'submitted' ? `Update ${activeSchoolYear} Form` : 
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

                            {/* SOLO Education Plan Status */}
                            <div className="mt-3 pt-3 border-t border-blue-300">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <FileText className="w-4 h-4 text-green-500" />
                                  <span className="text-sm font-medium text-gray-700">
                                    SOLO Education Plan
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
                              
                              {/* SOLO Plan Button - Only for Primary Guardians */}
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
                                    {studentSOLOPlanStatuses[student.id]?.status === 'submitted' ? 'View/Update SOLO Plan' : 
                                     studentSOLOPlanStatuses[student.id]?.status === 'draft' ? 'Continue SOLO Plan' : 'Create SOLO Plan'}
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

                            {/* Reimbursement Section */}
                            <div className="mt-3 pt-3 border-t border-blue-300">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <DollarSign className="w-4 h-4 text-emerald-500" />
                                  <span className="text-sm font-medium text-gray-700">
                                    Reimbursements
                                  </span>
                                  {studentReimbursementStatuses[student.id]?.pending > 0 ? (
                                    <Clock className="w-4 h-4 text-orange-500" />
                                  ) : studentReimbursementStatuses[student.id]?.paid > 0 ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 text-gray-500" />
                                  )}
                                </div>
                                <div className="flex flex-col text-right">
                                  <span className={`text-xs px-2 py-1 rounded-full font-medium shadow-sm border ${
                                    studentReimbursementStatuses[student.id]?.pending > 0 ? 'bg-orange-100 text-orange-700 border-orange-300' :
                                    studentReimbursementStatuses[student.id]?.paid > 0 ? 'bg-green-100 text-green-700 border-green-300' :
                                    'bg-gray-100 text-gray-700 border-gray-300'
                                  }`}>
                                    {studentReimbursementStatuses[student.id]?.total || 0} submitted
                                  </span>
                                  {studentReimbursementStatuses[student.id]?.totalAmount > 0 && (
                                    <span className="text-xs text-gray-500 mt-1">
                                      ${studentReimbursementStatuses[student.id].totalAmount.toFixed(2)} total
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Stripe Connect Setup for Primary Guardians */}
                              {customClaims?.familyRole === 'primary_guardian' ? (
                                <div className="space-y-2">
                                  {!stripeConnectStatus?.onboardingComplete && (
                                    <button
                                      onClick={() => setShowStripeOnboarding(true)}
                                      className="w-full px-3 py-2 text-sm rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300 hover:border-blue-400 transition-all shadow-sm hover:shadow-md"
                                    >
                                      Set Up Secure Payouts
                                    </button>
                                  )}
                                  
                                  {stripeConnectStatus?.onboardingComplete && (
                                    <button
                                      onClick={() => handleOpenReimbursementForm(student)}
                                      className="w-full px-3 py-2 text-sm rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-300 hover:border-emerald-400 transition-all shadow-sm hover:shadow-md"
                                    >
                                      Submit Reimbursement
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-500 rounded-md text-center">
                                  Contact Primary Guardian
                                </div>
                              )}
                            </div>
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

      {/* SOLO Education Plan Form - Only for Primary Guardians */}
      {customClaims?.familyRole === 'primary_guardian' && showSOLOPlanForm && (
        <SOLOEducationPlanForm
          isOpen={showSOLOPlanForm}
          onOpenChange={handleSOLOPlanClose}
          student={selectedStudentForSOLO}
          familyId={customClaims?.familyId}
          schoolYear={soloTargetSchoolYear}
        />
      )}

      {/* Stripe Connect Onboarding Sheet */}
      <Sheet open={showStripeOnboarding} onOpenChange={setShowStripeOnboarding}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-left">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <span>Secure Payout Setup</span>
              </div>
            </SheetTitle>
            <SheetDescription className="text-left">
              Set up secure payouts through Stripe to receive reimbursement payments directly to your bank account.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            <StripeConnectOnboarding
              familyId={customClaims?.familyId}
              userProfile={userProfile}
              onAccountCreated={handleStripeAccountCreated}
              onOnboardingComplete={handleStripeOnboardingComplete}
              existingStripeAccount={stripeConnectStatus}
              error={stripeConnectError}
            />
          </div>
        </SheetContent>
      </Sheet>

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
    </div>
  );
};

export default RTDConnectDashboard;