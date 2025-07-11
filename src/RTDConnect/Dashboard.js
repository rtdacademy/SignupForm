import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDatabase, ref, get, set, onValue, off } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { useNavigate } from 'react-router-dom';
import { Users, DollarSign, FileText, Home, AlertCircle, CheckCircle2, ArrowRight, GraduationCap, Heart, Shield, User, Phone, MapPin, Edit3, ChevronDown, LogOut, Plus, UserPlus, Calendar, Hash, X, Settings, Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../components/ui/sheet';
import AddressPicker from '../components/AddressPicker';

// RTD Connect Logo with gradient colors
const RTDConnectLogo = () => (
  <div className="flex items-center space-x-3">
    <img 
      src="/connectImages/Connect.png" 
      alt="RTD Connect Logo"
      className="h-12 w-auto"
    />
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
        RTD Connect
      </h1>
      <p className="text-sm text-gray-600">Home Education Portal</p>
    </div>
  </div>
);

const FeatureCard = ({ icon: Icon, title, description, gradient = "from-gray-400 to-gray-500" }) => (
  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${gradient} flex items-center justify-center mb-4`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

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
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
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
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-medium">
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

// ASN formatting utility
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

// Validate ASN format
const validateASN = (asn) => {
  const cleanASN = asn.replace(/\D/g, '');
  return cleanASN.length === 9;
};

// Student card component
const StudentCard = ({ student, index, onEdit, onRemove }) => (
  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">
          {student.preferredName || `${student.firstName} ${student.lastName}`}
        </h4>
        <div className="mt-2 space-y-1 text-sm text-gray-600">
          <p>Legal Name: {student.firstName} {student.lastName}</p>
          <p>ASN: {student.asn}</p>
          <p>Birthday: {new Date(student.birthday).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(index)}
          className="text-purple-600 hover:text-purple-700"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onRemove(index)}
          className="text-red-600 hover:text-red-700"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);

// Parent/Guardian card component
const GuardianCard = ({ guardian, index, isPrimary, onEdit, onRemove }) => (
  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <h4 className="font-medium text-gray-900">
            {guardian.firstName} {guardian.lastName}
          </h4>
          {isPrimary && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              Primary
            </span>
          )}
        </div>
        <div className="mt-2 space-y-1 text-sm text-gray-600">
          <p>{guardian.email}</p>
          <p>{guardian.phone}</p>
          {guardian.address && (
            <p>{guardian.address.city}, {guardian.address.province}</p>
          )}
        </div>
        <div className="mt-2">
          <p className="text-xs text-gray-500">Permissions:</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {guardian.permissions.canEditFamily && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                Edit Family
              </span>
            )}
            {guardian.permissions.canViewReports && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                View Reports
              </span>
            )}
            {guardian.permissions.canSubmitReimbursements && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                Submit Reimbursements
              </span>
            )}
          </div>
        </div>
      </div>
      {!isPrimary && (
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(index)}
            className="text-purple-600 hover:text-purple-700"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRemove(index)}
            className="text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  </div>
);

const RTDConnectDashboard = () => {
  const { user, user_email_key, signOut, isHomeEducationParent } = useAuth();
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
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: null
  });

  // Family creation state
  const [showFamilyCreation, setShowFamilyCreation] = useState(false);
  const [activeTab, setActiveTab] = useState('students');
  const [familyKey, setFamilyKey] = useState(null);
  const [familyData, setFamilyData] = useState({
    familyName: '',
    students: [],
    guardians: []
  });
  
  // Student form state
  const [studentFormData, setStudentFormData] = useState({
    asn: '',
    firstName: '',
    lastName: '',
    preferredName: '',
    birthday: '',
    email: '' // Optional student email
  });
  const [studentFormErrors, setStudentFormErrors] = useState({});
  const [editingStudentIndex, setEditingStudentIndex] = useState(null);
  
  // Guardian form state
  const [guardianFormData, setGuardianFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: null,
    relationToStudents: 'Guardian', // Default value
    permissions: {
      canEditFamily: true,
      canViewReports: true,
      canSubmitReimbursements: true
    }
  });
  const [guardianFormErrors, setGuardianFormErrors] = useState({});
  const [editingGuardianIndex, setEditingGuardianIndex] = useState(null);

  // Debug effect to log user auth object and custom claims
  useEffect(() => {
    const logUserAuthInfo = async () => {
      if (user) {
        try {
          const currentUser = getAuth().currentUser;
          const idTokenResult = await currentUser.getIdTokenResult();
          
          console.log('currentUser:', currentUser);
          console.log('idTokenResult:', idTokenResult);
        } catch (error) {
          console.error('Error getting auth info:', error);
        }
      }
    };
    
    logUserAuthInfo();
  }, [user]);

  useEffect(() => {
    if (!user || !user_email_key) {
      setLoading(false);
      return;
    }

    const db = getDatabase();
    const userRef = ref(db, `users/${user.uid}`);
    const familyRef = ref(db, `homeEducationFamilies/${user_email_key}/profile`);

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

    // Set up realtime listener for family registration
    const unsubscribeFamily = onValue(familyRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setFamilyProfile(data);
        setHasRegisteredFamily(true);
      } else {
        setFamilyProfile(null);
        setHasRegisteredFamily(false);
      }
    }, (error) => {
      // Silently handle permission errors - user likely hasn't registered family yet
      console.log('Family data not accessible - user needs to register');
      setHasRegisteredFamily(false);
    });

    // Cleanup listeners
    return () => {
      off(userRef, 'value', unsubscribeUser);
      off(familyRef, 'value', unsubscribeFamily);
    };
  }, [user, user_email_key]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Phone number formatting
  const formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/[^\d]/g, '');
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  };

  const handleProfileInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (profileErrors[field]) {
      setProfileErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    handleProfileInputChange('phone', formatted);
  };

  const handleAddressSelect = (address) => {
    setProfileData(prev => ({ ...prev, address }));
    if (profileErrors.address) {
      setProfileErrors(prev => ({ ...prev, address: null }));
    }
  };

  const validateProfile = () => {
    const newErrors = {};

    if (!profileData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!profileData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!profileData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const phoneDigits = profileData.phone.replace(/\D/g, '');
      if (phoneDigits.length !== 10) {
        newErrors.phone = 'Please enter a valid 10-digit phone number';
      }
    }

    if (!profileData.address) {
      newErrors.address = 'Address is required';
    }

    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) {
      return;
    }

    setIsSubmittingProfile(true);
    
    try {
      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}`);
      
      // Get existing user data and merge with profile data
      const userSnapshot = await get(userRef);
      const existingData = userSnapshot.exists() ? userSnapshot.val() : {};
      
      const updatedUserData = {
        ...existingData,
        firstName: profileData.firstName.trim(),
        lastName: profileData.lastName.trim(),
        phone: profileData.phone.trim(),
        address: profileData.address,
        profileCompletedAt: Date.now(),
        lastUpdated: Date.now()
      };
      
      await set(userRef, updatedUserData);
      
      setUserProfile(updatedUserData);
      setHasCompleteProfile(true);
      setShowProfileForm(false);
      
    } catch (error) {
      console.error('Error saving profile:', error);
      setProfileErrors({ submit: 'Failed to save profile. Please try again.' });
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handleStartRegistration = async () => {
    if (!hasCompleteProfile) {
      setShowProfileForm(true);
      return;
    }

    setIsSettingUpFamily(true);

    try {
      // Check if user already has custom claims
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        console.error('No authenticated user found');
        setIsSettingUpFamily(false);
        return;
      }

      // Get current ID token to check for existing custom claims
      const idTokenResult = await currentUser.getIdTokenResult();
      const customClaims = idTokenResult.claims;

      let familyId = null;

      // Check if user already has family custom claims
      if (customClaims.familyId && customClaims.familyRole === 'primary_guardian') {
        console.log('User already has family custom claims');
        familyId = customClaims.familyId;
      } else {
        // Call cloud function to set custom claims
        console.log('Setting family custom claims...');
        const functions = getFunctions();
        const setFamilyCustomClaims = httpsCallable(functions, 'setFamilyCustomClaims');
        
        const result = await setFamilyCustomClaims();
        
        if (result.data.success) {
          familyId = result.data.familyId;
          console.log('Custom claims set successfully, familyId:', familyId);
          
          // Force refresh the ID token to get the latest custom claims
          await currentUser.getIdToken(true);
        } else {
          console.error('Failed to set custom claims');
          alert('Failed to initialize family registration. Please try again.');
          setIsSettingUpFamily(false);
          return;
        }
      }

      // Create family key from primary user email
      const primaryEmailKey = sanitizeEmail(user.email);
      setFamilyKey(familyId); // Use the actual familyId from custom claims
      
      // Open family creation sheet
      setShowFamilyCreation(true);
      // Initialize with primary guardian data from user profile
      setFamilyData({
        familyName: '',
        students: [],
        guardians: [{
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          email: user.email,
          emailKey: primaryEmailKey,
          phone: userProfile.phone,
          address: userProfile.address,
          fullAddress: userProfile.address?.fullAddress || '',
          guardianType: 'primary_guardian',
          relationToStudents: 'Guardian', // Default, user can change
          permissions: {
            canEditFamily: true,
            canViewReports: true,
            canSubmitReimbursements: true
          },
          isPrimary: true
        }]
      });

    } catch (error) {
      console.error('Error starting family registration:', error);
      alert('Error starting family registration. Please try again.');
    } finally {
      setIsSettingUpFamily(false);
    }
  };

  // Student management functions
  const handleStudentFormChange = (field, value) => {
    if (field === 'asn') {
      value = formatASN(value);
    }
    setStudentFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (studentFormErrors[field]) {
      setStudentFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateStudentForm = () => {
    const errors = {};
    
    if (!studentFormData.asn.trim()) {
      errors.asn = 'ASN is required';
    } else if (!validateASN(studentFormData.asn)) {
      errors.asn = 'Please enter a valid 9-digit ASN';
    }
    
    if (!studentFormData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!studentFormData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!studentFormData.birthday) {
      errors.birthday = 'Birthday is required';
    }
    
    setStudentFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save family metadata and primary guardian to root level
  const saveFamilyMetadata = async (db) => {
    const primaryGuardian = familyData.guardians[0]; // Primary guardian is always first
    
    const familyMetadata = {
      familyId: familyKey,
      familyName: familyData.familyName,
      familyCreatedAt: Date.now(),
      lastUpdated: Date.now(),
      primaryGuardianEmail: primaryGuardian.email,
      primaryGuardianPhone: primaryGuardian.phone,
      primaryGuardianFirstName: primaryGuardian.firstName,
      primaryGuardianLastName: primaryGuardian.lastName,
      primaryGuardianFullAddress: primaryGuardian.fullAddress || '',
      primaryGuardianAddress: primaryGuardian.address || {},
      city: primaryGuardian.address?.city || '',
      province: primaryGuardian.address?.province || '',
      postalCodePrefix: (primaryGuardian.address?.postalCode || '').substring(0, 3)
    };

    // Save family metadata to root level
    const metadataRef = ref(db, `homeEducationFamilies/familyInformation/${familyKey}`);
    await set(metadataRef, familyMetadata);

    // Save primary guardian to guardians collection
    const primaryGuardianRef = ref(db, `homeEducationFamilies/familyInformation/${familyKey}/guardians/${primaryGuardian.emailKey}`);
    await set(primaryGuardianRef, {
      ...primaryGuardian,
      familyId: familyKey,
      addedAt: Date.now()
    });
  };

  const handleAddStudent = async () => {
    if (!validateStudentForm()) return;
    
    try {
      const db = getDatabase();
      const asnWithDashes = studentFormData.asn; // Keep dashes for storage
      
      const newStudent = {
        ...studentFormData,
        asn: asnWithDashes, // Store with dashes
        id: Date.now().toString(),
        familyId: familyKey,
        addedAt: Date.now()
      };

      // Add emailKey if email is provided
      if (studentFormData.email && studentFormData.email.trim()) {
        newStudent.emailKey = sanitizeEmail(studentFormData.email);
      }
      
      // Save to Firebase at homeEducationFamilies/familyInformation/{familyId}/students/{asnWithDashes}
      const studentRef = ref(db, `homeEducationFamilies/familyInformation/${familyKey}/students/${asnWithDashes}`);
      await set(studentRef, newStudent);

      // If this is the first student, also save family metadata and primary guardian
      if (familyData.students.length === 0) {
        await saveFamilyMetadata(db);
      }
      
      if (editingStudentIndex !== null) {
        // Update existing student in local state
        const updatedStudents = [...familyData.students];
        updatedStudents[editingStudentIndex] = newStudent;
        setFamilyData(prev => ({ ...prev, students: updatedStudents }));
        setEditingStudentIndex(null);
      } else {
        // Add new student to local state
        setFamilyData(prev => ({
          ...prev,
          students: [...prev.students, newStudent]
        }));
      }
      
      // Reset form
      setStudentFormData({
        asn: '',
        firstName: '',
        lastName: '',
        preferredName: '',
        birthday: '',
        email: ''
      });
      
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Failed to save student information. Please try again.');
    }
  };

  const handleEditStudent = (index) => {
    const student = familyData.students[index];
    setStudentFormData(student);
    setEditingStudentIndex(index);
  };

  const handleRemoveStudent = async (index) => {
    try {
      const student = familyData.students[index];
      const db = getDatabase();
      const asnWithDashes = student.asn; // ASN should already be stored with dashes
      
      // Remove from Firebase
      const studentRef = ref(db, `homeEducationFamilies/familyInformation/${familyKey}/students/${asnWithDashes}`);
      await set(studentRef, null);
      
      // Remove from local state
      const updatedStudents = familyData.students.filter((_, i) => i !== index);
      setFamilyData(prev => ({ ...prev, students: updatedStudents }));
      
    } catch (error) {
      console.error('Error removing student:', error);
      alert('Failed to remove student. Please try again.');
    }
  };

  // Guardian management functions
  const handleGuardianFormChange = (field, value) => {
    if (field.startsWith('permissions.')) {
      const permissionKey = field.split('.')[1];
      setGuardianFormData(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [permissionKey]: value
        }
      }));
    } else {
      setGuardianFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear error when user starts typing
    if (guardianFormErrors[field]) {
      setGuardianFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateGuardianForm = () => {
    const errors = {};
    
    if (!guardianFormData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!guardianFormData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!guardianFormData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guardianFormData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!guardianFormData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    
    if (!guardianFormData.address) {
      errors.address = 'Address is required';
    }
    
    setGuardianFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddGuardian = async () => {
    if (!validateGuardianForm()) return;
    
    try {
      const db = getDatabase();
      const guardianEmailKey = sanitizeEmail(guardianFormData.email);
      
      const newGuardian = {
        ...guardianFormData,
        emailKey: guardianEmailKey,
        id: Date.now().toString(),
        guardianType: 'guardian', // Secondary guardians are type 'guardian'
        fullAddress: guardianFormData.address?.fullAddress || '',
        familyId: familyKey,
        addedAt: Date.now()
      };
      
      // Save to Firebase at homeEducationFamilies/familyInformation/{familyId}/guardians/{emailKey}
      const guardianRef = ref(db, `homeEducationFamilies/familyInformation/${familyKey}/guardians/${guardianEmailKey}`);
      await set(guardianRef, newGuardian);
      
      if (editingGuardianIndex !== null) {
        // Update existing guardian in local state
        const updatedGuardians = [...familyData.guardians];
        updatedGuardians[editingGuardianIndex] = { ...newGuardian, isPrimary: updatedGuardians[editingGuardianIndex].isPrimary };
        setFamilyData(prev => ({ ...prev, guardians: updatedGuardians }));
        setEditingGuardianIndex(null);
      } else {
        // Add new guardian to local state
        setFamilyData(prev => ({
          ...prev,
          guardians: [...prev.guardians, newGuardian]
        }));
      }
      
      // Reset form
      setGuardianFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: null,
        relationToStudents: 'Guardian',
        permissions: {
          canEditFamily: true,
          canViewReports: true,
          canSubmitReimbursements: true
        }
      });
      
    } catch (error) {
      console.error('Error saving guardian:', error);
      alert('Failed to save guardian information. Please try again.');
    }
  };

  const handleEditGuardian = (index) => {
    const guardian = familyData.guardians[index];
    setGuardianFormData(guardian);
    setEditingGuardianIndex(index);
  };

  const handleRemoveGuardian = async (index) => {
    // Don't allow removing primary guardian
    if (familyData.guardians[index].guardianType === 'primary_guardian') return;
    
    try {
      const guardian = familyData.guardians[index];
      const db = getDatabase();
      
      // Remove from Firebase
      const guardianRef = ref(db, `homeEducationFamilies/familyInformation/${familyKey}/guardians/${guardian.emailKey}`);
      await set(guardianRef, null);
      
      // Remove from local state
      const updatedGuardians = familyData.guardians.filter((_, i) => i !== index);
      setFamilyData(prev => ({ ...prev, guardians: updatedGuardians }));
      
    } catch (error) {
      console.error('Error removing guardian:', error);
      alert('Failed to remove guardian. Please try again.');
    }
  };

  const handleCompleteRegistration = async () => {
    if (familyData.students.length === 0) {
      alert('Please add at least one student to your family.');
      return;
    }
    
    if (!familyData.familyName.trim()) {
      alert('Please enter a family name.');
      return;
    }
    
    try {
      const db = getDatabase();
      
      // Update family metadata with family name and completion time
      const familyMetadata = {
        familyId: familyKey,
        familyName: familyData.familyName,
        familyCreatedAt: Date.now(),
        lastUpdated: Date.now(),
        familyCreationCompleted: true,
        familyCreationCompletedAt: Date.now()
      };

      // Update the family metadata
      const metadataRef = ref(db, `homeEducationFamilies/familyInformation/${familyKey}`);
      await set(metadataRef, familyMetadata);
      
      // Mark family creation as complete
      setHasRegisteredFamily(true);
      setShowFamilyCreation(false);
      
    } catch (error) {
      console.error('Error completing registration:', error);
      alert('Failed to complete registration. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-center">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isHomeEducationParent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to access the RTD Connect dashboard.
            </p>
            <button
              onClick={() => navigate('/rtd-connect-login')}
              className="w-full py-2 px-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-md hover:from-pink-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show welcome screen for users who haven't completed profile or registered family yet
  if (!hasCompleteProfile || !hasRegisteredFamily) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-purple-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <RTDConnectLogo />
              
              <div className="flex items-center space-x-3">
                <ProfileDropdown 
                  userProfile={{ ...userProfile, email: user?.email }}
                  onEditProfile={() => setShowProfileForm(true)}
                  onSignOut={handleSignOut}
                />
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-md border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Welcome Hero Section */}
          <div className="text-center mb-12">
            <div className="mb-6">
              <Home className="w-16 h-16 mx-auto text-purple-500 mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to RTD Connect
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Your gateway to home education support with RTD Academy. Get started by registering your family 
                to access our home education programs and reimbursement services.
              </p>
            </div>
            
            {/* Primary CTA */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-purple-100">
              {!hasCompleteProfile ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Your Profile</h2>
                  <p className="text-gray-600 mb-6">
                    Let's start by getting your basic information. This will help us personalize your RTD Connect experience.
                  </p>
                  <button
                    onClick={handleStartRegistration}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white text-lg font-semibold rounded-lg hover:from-pink-600 hover:via-purple-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all transform hover:scale-105"
                  >
                    Complete Profile
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Create Your Family Profile?</h2>
                  <p className="text-gray-600 mb-6">
                    Great! Your profile is complete. Now let's create your family profile with RTD Academy. This information will stay with your family year after year.
                  </p>
                  <button
                    onClick={handleStartRegistration}
                    disabled={isSettingUpFamily}
                    className={`inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white text-lg font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all ${
                      isSettingUpFamily 
                        ? 'opacity-75 cursor-not-allowed' 
                        : 'hover:from-pink-600 hover:via-purple-600 hover:to-cyan-600 transform hover:scale-105'
                    }`}
                  >
                    {isSettingUpFamily ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Setting up family creation...
                      </>
                    ) : (
                      <>
                        Create Your Family
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <FeatureCard
              icon={Users}
              title="Family Registration"
              description="Register your family and students with our home education program"
              gradient="from-pink-500 to-purple-500"
            />
            <FeatureCard
              icon={DollarSign}
              title="Reimbursement Support"
              description="Access up to $900 annually in home education reimbursements"
              gradient="from-purple-500 to-cyan-500"
            />
            <FeatureCard
              icon={GraduationCap}
              title="Educational Resources"
              description="Access quality educational materials and support for your students"
              gradient="from-cyan-500 to-blue-500"
            />
          </div>

          {/* Info Section */}
          <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">About RTD Connect</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Heart className="w-6 h-6 text-pink-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900">Personalized Support</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    Get dedicated support for your family's unique home education needs and goals.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900">Secure & Reliable</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    Your family's information is secure and protected with enterprise-level security.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900">Easy Process</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    Simple registration and reimbursement processes designed with families in mind.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FileText className="w-6 h-6 text-purple-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900">Comprehensive Tracking</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    Track your students' progress and manage all your home education documentation.
                  </p>
                </div>
              </div>
            </div>
          </div>
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

        {/* Profile Form Sheet */}
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

            <div className="mt-6 space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 gap-6">
                <FormField
                  label="First Name"
                  icon={User}
                  error={profileErrors.firstName}
                  required
                >
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => handleProfileInputChange('firstName', e.target.value)}
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm ${
                      profileErrors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    placeholder="Enter your first name"
                  />
                </FormField>

                <FormField
                  label="Last Name"
                  icon={User}
                  error={profileErrors.lastName}
                  required
                >
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => handleProfileInputChange('lastName', e.target.value)}
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm ${
                      profileErrors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    placeholder="Enter your last name"
                  />
                </FormField>
              </div>

              {/* Phone Field */}
              <FormField
                label="Phone Number"
                icon={Phone}
                error={profileErrors.phone}
                required
              >
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={handlePhoneChange}
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm ${
                    profileErrors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="(123) 456-7890"
                  maxLength={14}
                />
              </FormField>

              {/* Address Field */}
              <FormField
                label="Home Address"
                icon={MapPin}
                error={profileErrors.address}
                required
              >
                <div className="relative">
                  {profileData.address ? (
                    <div className="space-y-4">
                      <div className="rounded-md border border-gray-300 bg-gray-50 p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-sm text-gray-900">Current Address</h4>
                            <p className="text-sm text-gray-600">{profileData.address.fullAddress || profileData.address.formattedAddress}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddressSelect(null)}
                            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                          >
                            Change
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {profileData.address.streetAddress && (
                            <div>
                              <span className="font-medium text-gray-500">Street:</span>
                              <p className="text-gray-700">{profileData.address.streetAddress}</p>
                            </div>
                          )}
                          <div>
                            <span className="font-medium text-gray-500">City:</span>
                            <p className="text-gray-700">{profileData.address.city || 'Not specified'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">Province:</span>
                            <p className="text-gray-700">{profileData.address.province || 'Not specified'}</p>
                          </div>
                          {profileData.address.postalCode && (
                            <div>
                              <span className="font-medium text-gray-500">Postal Code:</span>
                              <p className="text-gray-700">{profileData.address.postalCode}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <AddressPicker
                      onAddressSelect={handleAddressSelect}
                      studentType="Parent Verification"
                    />
                  )}
                </div>
              </FormField>

              {/* Submit Error */}
              {profileErrors.submit && (
                <div className="rounded-md bg-red-50 border border-red-200 p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-sm text-red-700">{profileErrors.submit}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-6">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSubmittingProfile}
                  className={`w-full flex items-center justify-center px-6 py-3 text-white rounded-md font-medium transition-all ${
                    isSubmittingProfile
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:from-pink-600 hover:via-purple-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                  }`}
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
                
                <button
                  type="button"
                  onClick={() => setShowProfileForm(false)}
                  className="w-full px-6 py-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Family Creation Sheet */}
        <Sheet open={showFamilyCreation} onOpenChange={setShowFamilyCreation}>
          <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-left">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  <span>Create Your Family</span>
                </div>
              </SheetTitle>
              <SheetDescription className="text-left">
                Add your family name, students, and family members to create your RTD Connect family profile.
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6">
              {/* Family Name Section */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">Family Name</h3>
                <p className="text-sm text-blue-700 mb-3">
                  Choose how you'd like your family to be displayed (e.g., "The Brown Family", "Smith Homeschool")
                </p>
                <input
                  type="text"
                  value={familyData.familyName}
                  onChange={(e) => setFamilyData(prev => ({ ...prev, familyName: e.target.value }))}
                  placeholder="The Brown Family"
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
                <button
                  onClick={() => setActiveTab('students')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'students'
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Students ({familyData.students.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('guardians')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'guardians'
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Parents/Guardians ({familyData.guardians.length})</span>
                </button>
              </div>

              {/* Students Tab */}
              {activeTab === 'students' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h3 className="font-medium text-blue-900 mb-2">Add Students</h3>
                    <p className="text-sm text-blue-700">
                      Add each student who will be part of your home education program. You'll need their Alberta Student Number (ASN), legal name, and birthday.
                    </p>
                  </div>

                  {/* Student List */}
                  {familyData.students.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Your Students</h4>
                      {familyData.students.map((student, index) => (
                        <StudentCard
                          key={student.id}
                          student={student}
                          index={index}
                          onEdit={handleEditStudent}
                          onRemove={handleRemoveStudent}
                        />
                      ))}
                    </div>
                  )}

                  {/* Student Form */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">
                      {editingStudentIndex !== null ? 'Edit Student' : 'Add New Student'}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        label="Alberta Student Number (ASN)"
                        icon={Hash}
                        error={studentFormErrors.asn}
                        required
                      >
                        <input
                          type="text"
                          value={studentFormData.asn}
                          onChange={(e) => handleStudentFormChange('asn', e.target.value)}
                          className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm ${
                            studentFormErrors.asn ? 'border-red-500' : ''
                          }`}
                          placeholder="1234-5678-9"
                          maxLength={11}
                        />
                      </FormField>

                      <FormField
                        label="Birthday"
                        icon={Calendar}
                        error={studentFormErrors.birthday}
                        required
                      >
                        <input
                          type="date"
                          value={studentFormData.birthday}
                          onChange={(e) => handleStudentFormChange('birthday', e.target.value)}
                          className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm ${
                            studentFormErrors.birthday ? 'border-red-500' : ''
                          }`}
                        />
                      </FormField>

                      <FormField
                        label="Legal First Name"
                        icon={User}
                        error={studentFormErrors.firstName}
                        required
                      >
                        <input
                          type="text"
                          value={studentFormData.firstName}
                          onChange={(e) => handleStudentFormChange('firstName', e.target.value)}
                          className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm ${
                            studentFormErrors.firstName ? 'border-red-500' : ''
                          }`}
                          placeholder="Enter legal first name"
                        />
                      </FormField>

                      <FormField
                        label="Legal Last Name"
                        icon={User}
                        error={studentFormErrors.lastName}
                        required
                      >
                        <input
                          type="text"
                          value={studentFormData.lastName}
                          onChange={(e) => handleStudentFormChange('lastName', e.target.value)}
                          className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm ${
                            studentFormErrors.lastName ? 'border-red-500' : ''
                          }`}
                          placeholder="Enter legal last name"
                        />
                      </FormField>

                      <FormField
                        label="Preferred Name (Optional)"
                        icon={User}
                      >
                        <input
                          type="text"
                          value={studentFormData.preferredName}
                          onChange={(e) => handleStudentFormChange('preferredName', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                          placeholder="Enter preferred name if different"
                        />
                      </FormField>

                      {/* Optional Email Field */}
                      <FormField
                        label="Email (Optional)"
                        icon={User}
                        error={studentFormErrors.email}
                      >
                        <input
                          type="email"
                          value={studentFormData.email}
                          onChange={(e) => handleStudentFormChange('email', e.target.value)}
                          className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm ${
                            studentFormErrors.email ? 'border-red-500' : ''
                          }`}
                          placeholder="student@email.com (optional)"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Optional: For future communication with the student
                        </p>
                      </FormField>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={handleAddStudent}
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{editingStudentIndex !== null ? 'Update Student' : 'Add Student'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Guardians Tab */}
              {activeTab === 'guardians' && (
                <div className="space-y-6">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h3 className="font-medium text-green-900 mb-2">Family Members</h3>
                    <p className="text-sm text-green-700">
                      You are the primary parent/guardian. You can add additional parents or guardians and set their permissions for managing family information.
                    </p>
                  </div>

                  {/* Guardian List */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Parents & Guardians</h4>
                    {familyData.guardians.map((guardian, index) => (
                      <GuardianCard
                        key={guardian.id || guardian.email}
                        guardian={guardian}
                        index={index}
                        isPrimary={guardian.isPrimary}
                        onEdit={handleEditGuardian}
                        onRemove={handleRemoveGuardian}
                      />
                    ))}
                  </div>

                  {/* Guardian Form */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">
                      {editingGuardianIndex !== null ? 'Edit Parent/Guardian' : 'Add Parent/Guardian'}
                    </h4>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          label="First Name"
                          icon={User}
                          error={guardianFormErrors.firstName}
                          required
                        >
                          <input
                            type="text"
                            value={guardianFormData.firstName}
                            onChange={(e) => handleGuardianFormChange('firstName', e.target.value)}
                            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm ${
                              guardianFormErrors.firstName ? 'border-red-500' : ''
                            }`}
                            placeholder="Enter first name"
                          />
                        </FormField>

                        <FormField
                          label="Last Name"
                          icon={User}
                          error={guardianFormErrors.lastName}
                          required
                        >
                          <input
                            type="text"
                            value={guardianFormData.lastName}
                            onChange={(e) => handleGuardianFormChange('lastName', e.target.value)}
                            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm ${
                              guardianFormErrors.lastName ? 'border-red-500' : ''
                            }`}
                            placeholder="Enter last name"
                          />
                        </FormField>

                        <FormField
                          label="Email Address"
                          icon={User}
                          error={guardianFormErrors.email}
                          required
                        >
                          <input
                            type="email"
                            value={guardianFormData.email}
                            onChange={(e) => handleGuardianFormChange('email', e.target.value)}
                            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm ${
                              guardianFormErrors.email ? 'border-red-500' : ''
                            }`}
                            placeholder="Enter email address"
                          />
                        </FormField>

                        <FormField
                          label="Phone Number"
                          icon={Phone}
                          error={guardianFormErrors.phone}
                          required
                        >
                          <input
                            type="tel"
                            value={guardianFormData.phone}
                            onChange={(e) => handleGuardianFormChange('phone', formatPhoneNumber(e.target.value))}
                            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm ${
                              guardianFormErrors.phone ? 'border-red-500' : ''
                            }`}
                            placeholder="(123) 456-7890"
                            maxLength={14}
                          />
                        </FormField>
                      </div>

                      <FormField
                        label="Address"
                        icon={MapPin}
                        error={guardianFormErrors.address}
                        required
                      >
                        <div className="relative">
                          {guardianFormData.address ? (
                            <div className="space-y-4">
                              <div className="rounded-md border border-gray-300 bg-gray-50 p-4 space-y-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium text-sm text-gray-900">Current Address</h4>
                                    <p className="text-sm text-gray-600">{guardianFormData.address.fullAddress || guardianFormData.address.formattedAddress}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleGuardianFormChange('address', null)}
                                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                                  >
                                    Change
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <AddressPicker
                              onAddressSelect={(address) => handleGuardianFormChange('address', address)}
                              studentType="Guardian Verification"
                            />
                          )}
                        </div>
                      </FormField>

                      {/* Relation to Students */}
                      <FormField
                        label="Relation to Students"
                        error={guardianFormErrors.relationToStudents}
                        required
                      >
                        <select
                          value={guardianFormData.relationToStudents}
                          onChange={(e) => handleGuardianFormChange('relationToStudents', e.target.value)}
                          className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm ${
                            guardianFormErrors.relationToStudents ? 'border-red-500' : ''
                          }`}
                        >
                          <option value="Mother">Mother</option>
                          <option value="Father">Father</option>
                          <option value="Guardian">Guardian</option>
                          <option value="Grandparent">Grandparent</option>
                          <option value="Other">Other</option>
                        </select>
                      </FormField>

                      {/* Permissions */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                          <Settings className="w-4 h-4 mr-2 text-purple-500" />
                          Permissions
                        </h5>
                        <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={guardianFormData.permissions.canEditFamily}
                              onChange={(e) => handleGuardianFormChange('permissions.canEditFamily', e.target.checked)}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Can edit family information</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={guardianFormData.permissions.canViewReports}
                              onChange={(e) => handleGuardianFormChange('permissions.canViewReports', e.target.checked)}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Can view student reports and progress</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={guardianFormData.permissions.canSubmitReimbursements}
                              onChange={(e) => handleGuardianFormChange('permissions.canSubmitReimbursements', e.target.checked)}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Can submit reimbursement requests</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={handleAddGuardian}
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-md hover:from-green-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{editingGuardianIndex !== null ? 'Update Guardian' : 'Add Guardian'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Complete Registration Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <p>Students: {familyData.students.length}</p>
                    <p>Parents/Guardians: {familyData.guardians.length}</p>
                    {familyData.students.length > 0 && (
                      <p className="text-green-600 font-medium mt-1">
                        ✓ Ready to complete family creation
                      </p>
                    )}
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowFamilyCreation(false)}
                      className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      Close
                    </button>
                    {familyData.students.length > 0 && (
                      <button
                        onClick={handleCompleteRegistration}
                        className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:from-pink-600 hover:via-purple-600 hover:to-cyan-600 text-white rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Complete Family Creation</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // If family is registered, show the full dashboard (this part can be expanded later)
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <RTDConnectLogo />
            
            <div className="flex items-center space-x-3">
              <ProfileDropdown 
                userProfile={{ ...userProfile, email: user?.email }}
                onEditProfile={() => setShowProfileForm(true)}
                onSignOut={handleSignOut}
              />
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-md border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Registered Family Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Family Dashboard
          </h1>
          <p className="text-gray-600 mb-8">
            Welcome back! Your family is registered and ready to go.
          </p>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <p className="text-gray-600">
              Your full family dashboard features will be available here once we implement 
              the complete family management system.
            </p>
          </div>
        </div>
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
    </div>
  );
};

export default RTDConnectDashboard;