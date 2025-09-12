import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getDatabase, ref, onValue, off, update, remove, push, get } from 'firebase/database';
import { toast } from 'sonner';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { formatDateForDisplay, formatDateForInput, calculateAge } from '../utils/timeZoneUtils';
import { useAuth } from '../context/AuthContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../components/ui/sheet';
import AddressPicker from '../components/AddressPicker';
import { Users, Plus, UserPlus, X, Edit3, Trash2, Save, Loader2, Shield, User, Phone, MapPin, Mail, Check, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { FUNDING_RATES } from '../config/HomeEducation';
import { determineFundingEligibility } from '../utils/fundingEligibilityUtils';

// Format ASN with dashes for display
const formatASN = (value) => {
  const digits = value.replace(/\D/g, '');
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

// Name validation helper
const validateName = (name, fieldName) => {
  if (!name || !name.trim()) {
    return `${fieldName} is required`;
  }
  
  const trimmedName = name.trim();
  
  // Check if each word starts with a capital letter (allow spaces)
  const words = trimmedName.split(/\s+/);
  for (const word of words) {
    if (word.length > 0 && word[0] !== word[0].toUpperCase()) {
      return `Each word in ${fieldName} must start with a capital letter`;
    }
  }
  
  return null;
};

// Name formatting helper
const formatName = (name) => {
  if (!name) return name;
  return name.replace(/\b\w/g, (char) => char.toUpperCase());
};

// Helper to clean name for submission
const cleanNameForSubmission = (name) => {
  if (!name) return name;
  return name.trim().replace(/\s+/g, ' ');
};

const FamilyManagementDirect = ({ 
  isOpen, 
  onOpenChange, 
  familyKey,
  isStaffMode = false,
  onEditProfile
}) => {
  const { user } = useAuth();
  const db = getDatabase();
  
  // State
  const [familyData, setFamilyData] = useState({ familyName: '', students: {}, guardians: {} });
  const [activeTab, setActiveTab] = useState('students');
  const [isSaving, setIsSaving] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  
  // Auto-save state
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle');
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const autoSaveTimeoutRef = useRef(null);
  
  // Student form state
  const [studentFormData, setStudentFormData] = useState({
    asn: '',
    firstName: '',
    lastName: '',
    preferredName: '',
    grade: '',
    birthday: '',
    email: '',
    phone: '',
    gender: '',
    address: null,
    usePrimaryAddress: false,
    fundingEligible: true,
    fundingAmount: 0
  });
  const [studentErrors, setStudentErrors] = useState({});
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [fundingEligibilityInfo, setFundingEligibilityInfo] = useState(null);
  
  // Guardian form state
  const [guardianFormData, setGuardianFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: null,
    usePrimaryAddress: false,
    relationToStudents: 'Guardian'
  });
  const [guardianErrors, setGuardianErrors] = useState({});
  const [editingGuardianKey, setEditingGuardianKey] = useState(null);
  const [showGuardianForm, setShowGuardianForm] = useState(false);

  // Load family data with real-time listener
  useEffect(() => {
    if (!isOpen || !familyKey) return;

    const familyRef = ref(db, `homeEducationFamilies/familyInformation/${familyKey}`);
    
    const unsubscribe = onValue(familyRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setFamilyData(data);
        console.log('Family data loaded:', data);
      } else {
        console.error('Family not found');
        toast.error('Family data not found');
        onOpenChange(false);
      }
    }, (error) => {
      console.error('Error loading family data:', error);
      toast.error('Failed to load family data');
    });

    return () => {
      off(familyRef, 'value', unsubscribe);
    };
  }, [isOpen, familyKey, db, onOpenChange]);

  // Load user profile
  useEffect(() => {
    if (!user?.uid) return;

    const userRef = ref(db, `users/${user.uid}`);

    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        setUserProfile({
          ...userData,
          email: user.email
        });
      }
    }, (error) => {
      console.error('Error loading user profile:', error);
    });

    return () => {
      off(userRef, 'value', unsubscribe);
    };
  }, [user?.uid, user?.email, db]);

  // Direct database update function for individual fields
  const updateFieldDirect = useCallback(async (path, value) => {
    try {
      setAutoSaveStatus('saving');
      
      const updatePath = `homeEducationFamilies/familyInformation/${familyKey}/${path}`;
      const updateRef = ref(db, updatePath);
      
      await update(updateRef, {
        [path.split('/').pop()]: value,
        updatedAt: Date.now(),
        updatedBy: user?.uid || 'unknown'
      });
      
      setAutoSaveStatus('saved');
      setLastSavedTime(new Date());
      
      setTimeout(() => {
        setAutoSaveStatus('idle');
      }, 2000);
      
      return true;
    } catch (error) {
      console.error('Error updating field:', error);
      setAutoSaveStatus('error');
      toast.error('Failed to save changes');
      
      setTimeout(() => {
        setAutoSaveStatus('idle');
      }, 3000);
      
      return false;
    }
  }, [familyKey, db, user?.uid]);

  // Debounced field update
  const debouncedFieldUpdate = useCallback((path, value) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      updateFieldDirect(path, value);
    }, 500);
  }, [updateFieldDirect]);

  // Handle family name change with direct update
  const handleFamilyNameChange = (value) => {
    const familyRef = ref(db, `homeEducationFamilies/familyInformation/${familyKey}`);
    update(familyRef, {
      familyName: value,
      updatedAt: Date.now(),
      updatedBy: user?.uid || 'unknown'
    }).catch(error => {
      console.error('Error updating family name:', error);
      toast.error('Failed to update family name');
    });
  };

  // Student validation
  const validateStudentForm = () => {
    const errors = {};

    const firstNameError = validateName(studentFormData.firstName, 'First name');
    if (firstNameError) errors.firstName = firstNameError;

    const lastNameError = validateName(studentFormData.lastName, 'Last name');
    if (lastNameError) errors.lastName = lastNameError;

    if (studentFormData.preferredName && studentFormData.preferredName.trim()) {
      const preferredNameError = validateName(studentFormData.preferredName, 'Preferred name');
      if (preferredNameError) errors.preferredName = preferredNameError;
    }

    if (studentFormData.asn.trim() && !validateASN(studentFormData.asn)) {
      errors.asn = 'Please enter a valid 9-digit ASN';
    }

    if (!studentFormData.birthday) errors.birthday = 'Birthday is required';
    if (!studentFormData.grade) errors.grade = 'Grade is required';
    if (!studentFormData.gender) errors.gender = 'Gender is required';

    if (!studentFormData.usePrimaryAddress && (!studentFormData.address || !studentFormData.address.fullAddress)) {
      errors.address = 'Address is required. Please select an address or use primary guardian address.';
    }

    // Email uniqueness validation
    if (studentFormData.email && studentFormData.email.trim()) {
      const studentEmail = studentFormData.email.trim().toLowerCase();
      const primaryGuardianEmail = user?.email?.toLowerCase();
      
      if (studentEmail === primaryGuardianEmail) {
        errors.email = 'Student email cannot be the same as primary guardian email.';
      }
      
      // Check against other students (excluding current if editing)
      const otherStudents = Object.entries(familyData.students || {})
        .filter(([id]) => id !== editingStudentId)
        .map(([, student]) => student.email?.toLowerCase())
        .filter(Boolean);
      
      if (otherStudents.includes(studentEmail)) {
        errors.email = 'This email is already used by another student.';
      }
    }

    setStudentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add/Update student directly in database
  const handleAddStudent = async () => {
    if (!validateStudentForm()) return;
    
    try {
      const eligibility = determineFundingEligibility(studentFormData.birthday);
      
      const studentData = {
        ...studentFormData,
        firstName: cleanNameForSubmission(studentFormData.firstName),
        lastName: cleanNameForSubmission(studentFormData.lastName),
        preferredName: cleanNameForSubmission(studentFormData.preferredName),
        asn: studentFormData.asn ? studentFormData.asn.replace(/\D/g, '') : '',
        fundingEligible: eligibility.fundingEligible,
        fundingAmount: eligibility.fundingAmount,
        familyId: familyKey,
        updatedAt: Date.now(),
        updatedBy: user?.uid || 'unknown'
      };
      
      if (studentFormData.usePrimaryAddress) {
        studentData.address = null;
      }
      
      if (studentFormData.email && studentFormData.email.trim()) {
        studentData.emailKey = sanitizeEmail(studentFormData.email);
      }
      
      let studentId;
      const studentsRef = ref(db, `homeEducationFamilies/familyInformation/${familyKey}/students`);
      
      if (editingStudentId) {
        // Update existing student - preserve the ID!
        studentId = editingStudentId;
        studentData.id = studentId; // Ensure ID is preserved
        studentData.addedAt = familyData.students[studentId]?.addedAt || Date.now();
        studentData.addedBy = familyData.students[studentId]?.addedBy || user?.uid;
        
        const studentRef = ref(db, `homeEducationFamilies/familyInformation/${familyKey}/students/${studentId}`);
        await update(studentRef, studentData);
        
        toast.success('Student updated successfully');
      } else {
        // Add new student
        studentId = Date.now().toString();
        studentData.id = studentId;
        studentData.addedAt = Date.now();
        studentData.addedBy = user?.uid || 'unknown';
        
        const newStudentRef = ref(db, `homeEducationFamilies/familyInformation/${familyKey}/students/${studentId}`);
        await update(newStudentRef, studentData);
        
        toast.success('Student added successfully');
      }
      
      // Update student count
      const familyRef = ref(db, `homeEducationFamilies/familyInformation/${familyKey}`);
      const snapshot = await get(familyRef);
      if (snapshot.exists()) {
        const currentData = snapshot.val();
        const studentCount = Object.keys(currentData.students || {}).length;
        await update(familyRef, {
          studentCount,
          updatedAt: Date.now(),
          updatedBy: user?.uid || 'unknown'
        });
      }
      
      // Reset form
      setStudentFormData({
        asn: '',
        firstName: '',
        lastName: '',
        preferredName: '',
        birthday: '',
        grade: '',
        email: '',
        phone: '',
        gender: '',
        address: null,
        usePrimaryAddress: false,
        fundingEligible: true,
        fundingAmount: 0
      });
      setEditingStudentId(null);
      setShowStudentForm(false);
      setFundingEligibilityInfo(null);
      
    } catch (error) {
      console.error('Error saving student:', error);
      toast.error('Failed to save student');
    }
  };

  // Edit student
  const handleEditStudent = (studentId) => {
    const student = familyData.students[studentId];
    if (!student) return;
    
    setStudentFormData({
      ...student,
      birthday: formatDateForInput(student.birthday),
      asn: formatASN(student.asn || ''),
      fundingEligible: student.fundingEligible !== undefined ? student.fundingEligible : true,
      fundingAmount: student.fundingAmount || 0
    });
    
    if (student.birthday) {
      const eligibility = determineFundingEligibility(student.birthday);
      setFundingEligibilityInfo(eligibility);
    }
    
    setEditingStudentId(studentId);
    setShowStudentForm(true);
    
    // Scroll to form after a brief delay to ensure it's rendered
    setTimeout(() => {
      const formElement = document.getElementById('student-form-section');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Delete student directly from database
  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this student?')) return;
    
    try {
      const studentRef = ref(db, `homeEducationFamilies/familyInformation/${familyKey}/students/${studentId}`);
      await remove(studentRef);
      
      // Update student count
      const familyRef = ref(db, `homeEducationFamilies/familyInformation/${familyKey}`);
      const snapshot = await get(familyRef);
      if (snapshot.exists()) {
        const currentData = snapshot.val();
        const studentCount = Object.keys(currentData.students || {}).filter(id => id !== studentId).length;
        await update(familyRef, {
          studentCount,
          updatedAt: Date.now(),
          updatedBy: user?.uid || 'unknown'
        });
      }
      
      toast.success('Student removed successfully');
    } catch (error) {
      console.error('Error removing student:', error);
      toast.error('Failed to remove student');
    }
  };

  // Guardian validation
  const validateGuardianForm = () => {
    const errors = {};

    const firstNameError = validateName(guardianFormData.firstName, 'First name');
    if (firstNameError) errors.firstName = firstNameError;

    const lastNameError = validateName(guardianFormData.lastName, 'Last name');
    if (lastNameError) errors.lastName = lastNameError;

    if (!guardianFormData.email.trim()) {
      errors.email = 'Email is required';
    } else {
      const guardianEmail = guardianFormData.email.trim().toLowerCase();
      const primaryGuardianEmail = user?.email?.toLowerCase();
      
      if (guardianEmail === primaryGuardianEmail) {
        errors.email = 'Guardian email cannot be the same as primary guardian email.';
      }
      
      // Check against other guardians (excluding current if editing)
      const otherGuardians = Object.entries(familyData.guardians || {})
        .filter(([key]) => key !== editingGuardianKey)
        .map(([, guardian]) => guardian.email?.toLowerCase())
        .filter(Boolean);
      
      if (otherGuardians.includes(guardianEmail)) {
        errors.email = 'This email is already used by another guardian.';
      }
    }

    if (!guardianFormData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }

    if (!guardianFormData.relationToStudents) {
      errors.relationToStudents = 'Relation to students is required';
    }

    if (!guardianFormData.usePrimaryAddress && (!guardianFormData.address || !guardianFormData.address.fullAddress)) {
      errors.address = 'Address is required. Please select an address or use primary guardian address.';
    }

    setGuardianErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add/Update guardian directly in database
  const handleAddGuardian = async () => {
    if (!validateGuardianForm()) return;
    
    try {
      const guardianEmailKey = sanitizeEmail(guardianFormData.email);
      
      const guardianData = {
        ...guardianFormData,
        firstName: cleanNameForSubmission(guardianFormData.firstName),
        lastName: cleanNameForSubmission(guardianFormData.lastName),
        emailKey: guardianEmailKey,
        guardianType: 'guardian',
        familyId: familyKey,
        updatedAt: Date.now(),
        updatedBy: user?.uid || 'unknown'
      };
      
      if (guardianFormData.usePrimaryAddress) {
        guardianData.address = null;
        guardianData.fullAddress = '';
      } else if (guardianFormData.address) {
        guardianData.fullAddress = guardianFormData.address.fullAddress || '';
      }
      
      if (editingGuardianKey) {
        // Update existing guardian
        guardianData.addedAt = familyData.guardians[editingGuardianKey]?.addedAt || Date.now();
        guardianData.addedBy = familyData.guardians[editingGuardianKey]?.addedBy || user?.uid;
      } else {
        // Add new guardian
        guardianData.addedAt = Date.now();
        guardianData.addedBy = user?.uid || 'unknown';
      }
      
      const guardianRef = ref(db, `homeEducationFamilies/familyInformation/${familyKey}/guardians/${guardianEmailKey}`);
      await update(guardianRef, guardianData);
      
      // Update guardian count
      const familyRef = ref(db, `homeEducationFamilies/familyInformation/${familyKey}`);
      const snapshot = await get(familyRef);
      if (snapshot.exists()) {
        const currentData = snapshot.val();
        const guardianCount = Object.keys(currentData.guardians || {}).length;
        await update(familyRef, {
          guardianCount,
          updatedAt: Date.now(),
          updatedBy: user?.uid || 'unknown'
        });
      }
      
      toast.success(editingGuardianKey ? 'Guardian updated successfully' : 'Guardian added successfully');
      
      // Reset form
      setGuardianFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: null,
        usePrimaryAddress: false,
        relationToStudents: 'Guardian'
      });
      setEditingGuardianKey(null);
      setShowGuardianForm(false);
      
    } catch (error) {
      console.error('Error saving guardian:', error);
      toast.error('Failed to save guardian');
    }
  };

  // Edit guardian
  const handleEditGuardian = (guardianKey) => {
    const guardian = familyData.guardians[guardianKey];
    if (!guardian || guardian.guardianType === 'primary_guardian') return;
    
    setGuardianFormData(guardian);
    setEditingGuardianKey(guardianKey);
    setShowGuardianForm(true);
    
    // Scroll to form after a brief delay to ensure it's rendered
    setTimeout(() => {
      const formElement = document.getElementById('guardian-form-section');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Delete guardian directly from database
  const handleRemoveGuardian = async (guardianKey) => {
    const guardian = familyData.guardians[guardianKey];
    if (!guardian || guardian.guardianType === 'primary_guardian') return;
    
    if (!window.confirm('Are you sure you want to remove this guardian?')) return;
    
    try {
      const guardianRef = ref(db, `homeEducationFamilies/familyInformation/${familyKey}/guardians/${guardianKey}`);
      await remove(guardianRef);
      
      // Update guardian count
      const familyRef = ref(db, `homeEducationFamilies/familyInformation/${familyKey}`);
      const snapshot = await get(familyRef);
      if (snapshot.exists()) {
        const currentData = snapshot.val();
        const guardianCount = Object.keys(currentData.guardians || {}).filter(key => key !== guardianKey).length;
        await update(familyRef, {
          guardianCount,
          updatedAt: Date.now(),
          updatedBy: user?.uid || 'unknown'
        });
      }
      
      toast.success('Guardian removed successfully');
    } catch (error) {
      console.error('Error removing guardian:', error);
      toast.error('Failed to remove guardian');
    }
  };

  // Cancel edit handlers
  const handleCancelStudentEdit = () => {
    setStudentFormData({
      firstName: '',
      lastName: '',
      preferredName: '',
      asn: '',
      birthday: '',
      grade: '',
      email: '',
      phone: '',
      gender: '',
      address: null,
      usePrimaryAddress: false,
      fundingEligible: true,
      fundingAmount: 0
    });
    setEditingStudentId(null);
    setStudentErrors({});
    setShowStudentForm(false);
    setFundingEligibilityInfo(null);
  };

  const handleCancelGuardianEdit = () => {
    setGuardianFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: null,
      usePrimaryAddress: false,
      relationToStudents: 'Guardian'
    });
    setEditingGuardianKey(null);
    setGuardianErrors({});
    setShowGuardianForm(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Student Card Component
  const StudentCard = ({ student, studentId }) => {
    const getFundingBadge = () => {
      if (student.fundingEligible === false) {
        return (
          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-md font-medium flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Not Funded
          </span>
        );
      }
      if (student.fundingAmount === FUNDING_RATES.KINDERGARTEN.amount) {
        return (
          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-md font-medium">
            Kindergarten Funding: {FUNDING_RATES.KINDERGARTEN.formatted}
          </span>
        );
      }
      if (student.fundingAmount === FUNDING_RATES.GRADES_1_TO_12.amount) {
        return (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md font-medium">
            Full Funding: {FUNDING_RATES.GRADES_1_TO_12.formatted}
          </span>
        );
      }
      return null;
    };

    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium text-gray-900">
                {student.preferredName || `${student.firstName} ${student.lastName}`}
              </h4>
              {getFundingBadge()}
            </div>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <p>Student ID: {studentId}</p>
              <p>Legal Name: {student.firstName} {student.lastName}</p>
              {student.asn && <p>ASN: {formatASN(student.asn)}</p>}
              <p>Grade: {student.grade}</p>
              <p>Gender: {student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : student.gender === 'X' ? 'Other' : student.gender}</p>
              <p>Birthday: {formatDateForDisplay(student.birthday)}</p>
              {student.email && <p>Email: {student.email}</p>}
              {student.phone && <p>Phone: {student.phone}</p>}
            </div>
          </div>
          <div className="flex space-x-2 ml-4">
            <button
              onClick={() => handleEditStudent(studentId)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Edit student"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleRemoveStudent(studentId)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Remove student"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Guardian Card Component
  const GuardianCard = ({ guardian, guardianKey }) => {
    const isPrimary = guardian.guardianType === 'primary_guardian';
    
    // Check if current user can edit the primary guardian profile
    const canEditProfile = isPrimary && onEditProfile && (
      isStaffMode || 
      (user && sanitizeEmail(user.email) === sanitizeEmail(guardian.email))
    );
    
    return (
      <div className={`rounded-lg p-4 border ${isPrimary ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900">
                {guardian.firstName} {guardian.lastName}
              </h4>
              {isPrimary && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-md">
                  Primary
                </span>
              )}
            </div>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <p>Email: {guardian.email}</p>
              <p>Phone: {guardian.phone}</p>
              <p>Relation: {guardian.relationToStudents}</p>
            </div>
            {canEditProfile && (
              <button
                onClick={onEditProfile}
                className="mt-3 flex items-center px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-100 rounded-md transition-colors"
              >
                <Edit3 className="w-4 h-4 mr-1" />
                Edit Profile
              </button>
            )}
          </div>
          {!isPrimary && (
            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => handleEditGuardian(guardianKey)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Edit guardian"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleRemoveGuardian(guardianKey)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Remove guardian"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-500" />
                <span>Manage Family Members</span>
              </div>
              <div className="flex items-center space-x-2">
                {autoSaveStatus === 'saving' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Saving...
                  </span>
                )}
                {autoSaveStatus === 'saved' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Check className="w-3 h-3 mr-1" />
                    Saved
                  </span>
                )}
                {autoSaveStatus === 'error' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Error saving
                  </span>
                )}
                {isStaffMode && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Staff Mode
                  </span>
                )}
              </div>
            </div>
          </SheetTitle>
          <SheetDescription className="text-left">
            Add, edit, or remove family members. Changes are saved automatically.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {/* Family Name */}
          <div className="mb-6">
            <label htmlFor="familyName" className="block text-sm font-medium text-gray-700 mb-1">
              Family Name
            </label>
            <input
              type="text"
              id="familyName"
              value={familyData.familyName || ''}
              onChange={(e) => handleFamilyNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., The Smith Family"
            />
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('students')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'students'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Students ({Object.keys(familyData.students || {}).length})
              </button>
              <button
                onClick={() => setActiveTab('guardians')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'guardians'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Parents/Guardians ({Object.keys(familyData.guardians || {}).length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'students' ? (
            <div className="space-y-6">
              {/* Student List */}
              {Object.keys(familyData.students || {}).length > 0 && (
                <div className="space-y-4 mb-6">
                  {Object.entries(familyData.students).map(([studentId, student]) => (
                    <StudentCard
                      key={studentId}
                      student={student}
                      studentId={studentId}
                    />
                  ))}
                </div>
              )}

              {/* Add/Edit Student Form */}
              {showStudentForm ? (
                <div id="student-form-section" className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-medium text-gray-900 mb-4">
                    {editingStudentId ? 'Edit Student' : 'Add a Student'}
                  </h4>
                  
                  <form onSubmit={(e) => { e.preventDefault(); handleAddStudent(); }} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="student-firstName" className="block text-sm font-medium text-gray-700 mb-1">
                          First Name (Legal)
                        </label>
                        <input
                          type="text"
                          id="student-firstName"
                          value={studentFormData.firstName}
                          onChange={(e) => {
                            const formattedName = formatName(e.target.value);
                            setStudentFormData({...studentFormData, firstName: formattedName});
                          }}
                          className={`w-full px-3 py-2 border ${studentErrors.firstName ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        />
                        {studentErrors.firstName && (
                          <p className="mt-1 text-sm text-red-600">{studentErrors.firstName}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="student-lastName" className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name (Legal)
                        </label>
                        <input
                          type="text"
                          id="student-lastName"
                          value={studentFormData.lastName}
                          onChange={(e) => {
                            const formattedName = formatName(e.target.value);
                            setStudentFormData({...studentFormData, lastName: formattedName});
                          }}
                          className={`w-full px-3 py-2 border ${studentErrors.lastName ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        />
                        {studentErrors.lastName && (
                          <p className="mt-1 text-sm text-red-600">{studentErrors.lastName}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="student-preferredName" className="block text-sm font-medium text-gray-700 mb-1">
                          Preferred Name (Optional)
                        </label>
                        <input
                          type="text"
                          id="student-preferredName"
                          value={studentFormData.preferredName}
                          onChange={(e) => {
                            const formattedName = formatName(e.target.value);
                            setStudentFormData({...studentFormData, preferredName: formattedName});
                          }}
                          className={`w-full px-3 py-2 border ${studentErrors.preferredName ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                          placeholder="If different from legal name"
                        />
                        {studentErrors.preferredName && (
                          <p className="mt-1 text-sm text-red-600">{studentErrors.preferredName}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="student-asn" className="block text-sm font-medium text-gray-700 mb-1">
                          Alberta Student Number (ASN)
                        </label>
                        <input
                          type="text"
                          id="student-asn"
                          value={studentFormData.asn}
                          onChange={(e) => {
                            const formatted = formatASN(e.target.value);
                            setStudentFormData({...studentFormData, asn: formatted});
                          }}
                          className={`w-full px-3 py-2 border ${studentErrors.asn ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                          placeholder="1234-5678-9"
                        />
                        {studentErrors.asn && (
                          <p className="mt-1 text-sm text-red-600">{studentErrors.asn}</p>
                        )}
                        <p className="mt-1 text-sm text-gray-500">Optional</p>
                      </div>

                      <div>
                        <label htmlFor="student-birthday" className="block text-sm font-medium text-gray-700 mb-1">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          id="student-birthday"
                          value={studentFormData.birthday}
                          onChange={(e) => {
                            const newBirthday = e.target.value;
                            const eligibility = determineFundingEligibility(newBirthday);
                            
                            setStudentFormData({
                              ...studentFormData, 
                              birthday: newBirthday,
                              fundingEligible: eligibility.fundingEligible,
                              fundingAmount: eligibility.fundingAmount,
                              grade: eligibility.grade || studentFormData.grade
                            });
                            
                            setFundingEligibilityInfo(eligibility);
                          }}
                          className={`w-full px-3 py-2 border ${studentErrors.birthday ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        />
                        {studentErrors.birthday && (
                          <p className="mt-1 text-sm text-red-600">{studentErrors.birthday}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="student-grade" className="block text-sm font-medium text-gray-700 mb-1">
                          Expected Grade Level
                        </label>
                        <select
                          id="student-grade"
                          value={studentFormData.grade}
                          onChange={(e) => {
                            if (fundingEligibilityInfo?.ageCategory === 'kindergarten') {
                              return;
                            }
                            setStudentFormData({...studentFormData, grade: e.target.value});
                          }}
                          disabled={fundingEligibilityInfo?.ageCategory === 'kindergarten'}
                          className={`w-full px-3 py-2 border ${
                            studentErrors.grade ? 'border-red-300' : 'border-gray-300'
                          } rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            fundingEligibilityInfo?.ageCategory === 'kindergarten' 
                              ? 'bg-gray-100 cursor-not-allowed' 
                              : ''
                          }`}
                        >
                          <option value="">Select expected grade</option>
                          {['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(grade => (
                            <option key={grade} value={grade}>Grade {grade}</option>
                          ))}
                        </select>
                        {studentErrors.grade && (
                          <p className="mt-1 text-sm text-red-600">{studentErrors.grade}</p>
                        )}
                      </div>

                      {/* Funding Eligibility Message */}
                      {fundingEligibilityInfo && fundingEligibilityInfo.message && (
                        <div className={`md:col-span-2 p-3 rounded-md border ${
                          fundingEligibilityInfo.fundingEligible === false
                            ? 'bg-red-50 border-red-200'
                            : fundingEligibilityInfo.ageCategory === 'kindergarten'
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-green-50 border-green-200'
                        }`}>
                          <div className="flex items-start space-x-2">
                            {fundingEligibilityInfo.fundingEligible === false ? (
                              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            ) : (
                              <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="text-sm">
                              <p className={`font-medium ${
                                fundingEligibilityInfo.fundingEligible === false
                                  ? 'text-red-800'
                                  : 'text-amber-800'
                              }`}>
                                {fundingEligibilityInfo.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <label htmlFor="student-gender" className="block text-sm font-medium text-gray-700 mb-1">
                          Gender *
                        </label>
                        <select
                          id="student-gender"
                          value={studentFormData.gender}
                          onChange={(e) => setStudentFormData({...studentFormData, gender: e.target.value})}
                          className={`w-full px-3 py-2 border ${studentErrors.gender ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        >
                          <option value="">Select gender</option>
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                          <option value="X">Other</option>
                        </select>
                        {studentErrors.gender && (
                          <p className="mt-1 text-sm text-red-600">{studentErrors.gender}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="student-email" className="block text-sm font-medium text-gray-700 mb-1">
                          Student Email (Optional)
                        </label>
                        <input
                          type="email"
                          id="student-email"
                          value={studentFormData.email}
                          onChange={(e) => setStudentFormData({...studentFormData, email: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="student@example.com"
                        />
                        {studentErrors.email && (
                          <p className="mt-1 text-sm text-red-600">{studentErrors.email}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="student-phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Student Phone (Optional)
                        </label>
                        <input
                          type="tel"
                          id="student-phone"
                          value={studentFormData.phone}
                          onChange={(e) => {
                            const formatted = formatPhoneNumber(e.target.value);
                            setStudentFormData({...studentFormData, phone: formatted});
                          }}
                          className={`w-full px-3 py-2 border ${studentErrors.phone ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                          placeholder="(403) 555-0123"
                        />
                        {studentErrors.phone && (
                          <p className="mt-1 text-sm text-red-600">{studentErrors.phone}</p>
                        )}
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Student Address *
                        </label>
                        
                        <div className="mb-3">
                          <label className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={studentFormData.usePrimaryAddress}
                              onChange={(e) => {
                                const usePrimary = e.target.checked;
                                setStudentFormData({
                                  ...studentFormData,
                                  usePrimaryAddress: usePrimary,
                                  address: usePrimary ? null : studentFormData.address
                                });
                              }}
                              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                            />
                            <span className="text-gray-700">
                              <MapPin className="w-4 h-4 inline mr-1" />
                              Same as primary guardian address
                            </span>
                          </label>
                        </div>
                        
                        {!studentFormData.usePrimaryAddress && (
                          <>
                            <AddressPicker
                              value={studentFormData.address}
                              onAddressSelect={(address) => setStudentFormData({...studentFormData, address})}
                              error={studentErrors.address}
                              placeholder="Start typing the student's address..."
                            />
                            {studentErrors.address && (
                              <p className="mt-1 text-sm text-red-600">{studentErrors.address}</p>
                            )}
                          </>
                        )}
                        
                        {studentFormData.usePrimaryAddress && (
                          <div className="px-3 py-2 bg-purple-50 border border-purple-200 rounded-md text-purple-700 text-sm">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            Student will use: {userProfile?.address?.fullAddress || 'Primary guardian address'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        <Plus className="w-4 h-4 inline mr-1" />
                        {editingStudentId ? 'Update Student' : 'Add Student'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelStudentEdit}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowStudentForm(true);
                    // Scroll to form after a brief delay to ensure it's rendered
                    setTimeout(() => {
                      const formElement = document.getElementById('student-form-section');
                      if (formElement) {
                        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 100);
                  }}
                  className="w-full py-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-400 hover:text-blue-700 transition-colors flex items-center justify-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add a Student
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Guardian List */}
              {Object.keys(familyData.guardians || {}).length > 0 && (
                <div className="space-y-4 mb-6">
                  {Object.entries(familyData.guardians).map(([guardianKey, guardian]) => (
                    <GuardianCard
                      key={guardianKey}
                      guardian={guardian}
                      guardianKey={guardianKey}
                    />
                  ))}
                </div>
              )}

              {/* Add/Edit Guardian Form */}
              {showGuardianForm ? (
                <div id="guardian-form-section" className="bg-pink-50 rounded-lg p-4 border border-pink-200">
                  <h4 className="font-medium text-gray-900 mb-4">
                    {editingGuardianKey ? 'Edit Parent/Guardian' : 'Add Parent/Guardian'}
                  </h4>
                  
                  <form onSubmit={(e) => { e.preventDefault(); handleAddGuardian(); }} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="guardian-firstName" className="block text-sm font-medium text-gray-700 mb-1">
                          First Name *
                        </label>
                        <input
                          type="text"
                          id="guardian-firstName"
                          value={guardianFormData.firstName}
                          onChange={(e) => {
                            const formattedName = formatName(e.target.value);
                            setGuardianFormData({...guardianFormData, firstName: formattedName});
                          }}
                          className={`w-full px-3 py-2 border ${guardianErrors.firstName ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        />
                        {guardianErrors.firstName && (
                          <p className="mt-1 text-sm text-red-600">{guardianErrors.firstName}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="guardian-lastName" className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          id="guardian-lastName"
                          value={guardianFormData.lastName}
                          onChange={(e) => {
                            const formattedName = formatName(e.target.value);
                            setGuardianFormData({...guardianFormData, lastName: formattedName});
                          }}
                          className={`w-full px-3 py-2 border ${guardianErrors.lastName ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        />
                        {guardianErrors.lastName && (
                          <p className="mt-1 text-sm text-red-600">{guardianErrors.lastName}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="guardian-email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          id="guardian-email"
                          value={guardianFormData.email}
                          onChange={(e) => setGuardianFormData({...guardianFormData, email: e.target.value})}
                          className={`w-full px-3 py-2 border ${guardianErrors.email ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        />
                        {guardianErrors.email && (
                          <p className="mt-1 text-sm text-red-600">{guardianErrors.email}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="guardian-phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          id="guardian-phone"
                          value={guardianFormData.phone}
                          onChange={(e) => {
                            const formatted = formatPhoneNumber(e.target.value);
                            setGuardianFormData({...guardianFormData, phone: formatted});
                          }}
                          className={`w-full px-3 py-2 border ${guardianErrors.phone ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                          placeholder="(403) 555-0123"
                        />
                        {guardianErrors.phone && (
                          <p className="mt-1 text-sm text-red-600">{guardianErrors.phone}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="guardian-relation" className="block text-sm font-medium text-gray-700 mb-1">
                          Relation to Students *
                        </label>
                        <select
                          id="guardian-relation"
                          value={guardianFormData.relationToStudents}
                          onChange={(e) => setGuardianFormData({...guardianFormData, relationToStudents: e.target.value})}
                          className={`w-full px-3 py-2 border ${guardianErrors.relationToStudents ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        >
                          <option value="">Select relation</option>
                          <option value="Mother">Mother</option>
                          <option value="Father">Father</option>
                          <option value="Guardian">Guardian</option>
                          <option value="Grandparent">Grandparent</option>
                          <option value="Other">Other</option>
                        </select>
                        {guardianErrors.relationToStudents && (
                          <p className="mt-1 text-sm text-red-600">{guardianErrors.relationToStudents}</p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Guardian Address *
                        </label>
                        
                        <div className="mb-3">
                          <label className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={guardianFormData.usePrimaryAddress}
                              onChange={(e) => {
                                const usePrimary = e.target.checked;
                                setGuardianFormData({
                                  ...guardianFormData,
                                  usePrimaryAddress: usePrimary,
                                  address: usePrimary ? null : guardianFormData.address
                                });
                              }}
                              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                            />
                            <span className="text-gray-700">
                              <MapPin className="w-4 h-4 inline mr-1" />
                              Same as primary guardian address
                            </span>
                          </label>
                        </div>
                        
                        {!guardianFormData.usePrimaryAddress && (
                          <>
                            <AddressPicker
                              value={guardianFormData.address}
                              onAddressSelect={(address) => setGuardianFormData({...guardianFormData, address})}
                              error={guardianErrors.address}
                              placeholder="Start typing your address..."
                            />
                            {guardianErrors.address && (
                              <p className="mt-1 text-sm text-red-600">{guardianErrors.address}</p>
                            )}
                          </>
                        )}
                        
                        {guardianFormData.usePrimaryAddress && (
                          <div className="px-3 py-2 bg-purple-50 border border-purple-200 rounded-md text-purple-700 text-sm">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            Guardian will use: {userProfile?.address?.fullAddress || 'Primary guardian address'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        <UserPlus className="w-4 h-4 inline mr-1" />
                        {editingGuardianKey ? 'Update Guardian' : 'Add Guardian'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelGuardianEdit}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowGuardianForm(true);
                    // Scroll to form after a brief delay to ensure it's rendered
                    setTimeout(() => {
                      const formElement = document.getElementById('guardian-form-section');
                      if (formElement) {
                        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 100);
                  }}
                  className="w-full py-3 border-2 border-dashed border-pink-300 rounded-lg text-pink-600 hover:border-pink-400 hover:text-pink-700 transition-colors flex items-center justify-center"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Add Additional Parent/Guardian
                </button>
              )}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Changes are saved automatically as you type
              </p>
              {lastSavedTime && (
                <p className="text-xs text-gray-500 mt-1">
                  Last saved: {lastSavedTime.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FamilyManagementDirect;