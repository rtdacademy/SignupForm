import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDatabase, ref, onValue, off, update, get } from 'firebase/database';
import { toast } from 'sonner';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { toEdmontonDate, formatDateForDisplay, formatDateForInput, calculateAge, calculateAgeWithMonths, toDateString } from '../utils/timeZoneUtils';
import { useAuth } from '../context/AuthContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../components/ui/sheet';
import AddressPicker from '../components/AddressPicker';
import { Users, Plus, UserPlus, X, Edit3, Trash2, Save, Loader2, Shield, User, Phone, MapPin, Mail, Eye, Check, AlertCircle, Info } from 'lucide-react';
import { CURRENT_SCHOOL_YEAR, NEXT_SCHOOL_YEAR } from '../config/calendarConfig';

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

// Student card component
const StudentCard = ({ student, index, onEdit, onRemove, userProfile }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium text-gray-900">
              {student.preferredName || `${student.firstName} ${student.lastName}`}
            </h4>
          </div>
          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <p>Legal Name: {student.firstName} {student.lastName}</p>
            <p>ASN: {student.asn}</p>
            <p>Grade: {student.grade}</p>
            <p>Gender: {student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : student.gender === 'X' ? 'Other' : student.gender}</p>
            <p>Birthday: {formatDateForDisplay(student.birthday)}</p>
            {student.email && <p>Email: {student.email}</p>}
            {student.phone && <p>Phone: {student.phone}</p>}
            {student.usePrimaryAddress ? (
              <p>Address: {userProfile?.address?.fullAddress || 'Same as primary guardian'}</p>
            ) : student.address ? (
              <p>Address: {student.address.fullAddress || 
                `${student.address.streetAddress || ''} ${student.address.city || ''}, ${student.address.province || ''} ${student.address.postalCode || ''}`.trim()
              }</p>
            ) : (
              <p>Address: Not provided</p>
            )}
          </div>
        </div>
        <div className="flex space-x-2 ml-4">
          <button
            onClick={() => onEdit(index)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Edit student"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRemove(index)}
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

// Primary Guardian card component (read-only with optional edit button)
const PrimaryGuardianCard = ({ guardian, isStaffMode, canEdit, onEditProfile }) => {
  if (!guardian) return null;
  
  return (
    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="font-medium text-gray-900">
              {guardian.firstName} {guardian.lastName}
            </h4>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-md font-medium">
              Primary Guardian
            </span>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>{guardian.email}</span>
            </div>
            {guardian.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{guardian.phone}</span>
              </div>
            )}
            {guardian.address && (
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm">
                  {guardian.address.fullAddress || guardian.fullAddress ||
                    `${guardian.address.streetAddress || ''} ${guardian.address.city || ''}, ${guardian.address.province || ''} ${guardian.address.postalCode || ''}`.trim()}
                </span>
              </div>
            )}
          </div>
          {canEdit && onEditProfile ? (
            <button
              onClick={onEditProfile}
              className="mt-3 flex items-center px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-100 rounded-md transition-colors"
            >
              <Edit3 className="w-4 h-4 mr-1" />
              Edit Profile
            </button>
          ) : (
            <p className="text-xs text-gray-500 mt-2">
              {isStaffMode 
                ? "This is the family's primary guardian."
                : "This information comes from your profile and cannot be edited here."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Guardian card component
const GuardianCard = ({ guardian, index, isPrimary, onEdit, onRemove, userProfile }) => (
  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
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
          {guardian.usePrimaryAddress ? (
            <p>Address: {userProfile?.address?.fullAddress || 'Same as primary guardian'}</p>
          ) : guardian.address ? (
            <p>Address: {guardian.address.fullAddress || 
              `${guardian.address.streetAddress || ''} ${guardian.address.city || ''}, ${guardian.address.province || ''} ${guardian.address.postalCode || ''}`.trim()
            }</p>
          ) : (
            <p>Address: Not provided</p>
          )}
        </div>
      </div>
      <div className="flex space-x-2 ml-4">
        <button
          onClick={() => onEdit(index)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          title="Edit guardian"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        {!isPrimary && (
          <button
            onClick={() => onRemove(index)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Remove guardian"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  </div>
);

const FamilyCreationSheet = ({
  isOpen,
  onOpenChange,
  familyKey,
  hasRegisteredFamily,
  initialFamilyData = { familyName: '', students: [], guardians: [] },
  onFamilyDataChange,
  onComplete,
  staffMode = false,
  isStaffViewing = false,
  onEditProfile
}) => {
  const { user } = useAuth();
  
  // Family data state
  const [familyData, setFamilyData] = useState(initialFamilyData);
  const [localFamilyName, setLocalFamilyName] = useState(initialFamilyData?.familyName || '');
  const [activeTab, setActiveTab] = useState('students');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // Auto-save state for staff mode
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const autoSaveTimeoutRef = useRef(null);
  const isStaffEditMode = (staffMode || isStaffViewing) && familyKey;

  // Student form state
  const [studentFormData, setStudentFormData] = useState({
    asn: '',
    firstName: '',
    lastName: '',
    preferredName: '',
    birthday: '',
    email: '',
    phone: '',
    gender: '',
    address: null,
    usePrimaryAddress: false
  });
  const [studentErrors, setStudentErrors] = useState({});
  const [editingStudentIndex, setEditingStudentIndex] = useState(null);
  const [showStudentForm, setShowStudentForm] = useState(false);

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
  const [editingGuardianIndex, setEditingGuardianIndex] = useState(null);
  const [showGuardianForm, setShowGuardianForm] = useState(false);

  // Load initial family data when sheet opens
  useEffect(() => {
    if (isOpen && initialFamilyData) {
      console.log('Using initial family data:', initialFamilyData);
      setFamilyData(initialFamilyData);
    }
  }, [isOpen, initialFamilyData]);

  // Sync local family name with familyData when it changes externally
  useEffect(() => {
    setLocalFamilyName(familyData.familyName || '');
  }, [familyData.familyName]);

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

  // Auto-save function for staff edits (direct database updates)
  const autoSaveToDatabase = useCallback(async (dataToSave) => {
    if (!isStaffEditMode || !familyKey) return;
    
    try {
      setAutoSaveStatus('saving');
      
      const db = getDatabase();
      const familyRef = ref(db, `homeEducationFamilies/familyInformation/${familyKey}`);
      
      // Prepare the update object
      const updates = {
        familyName: dataToSave.familyName,
        updatedAt: Date.now(),
        updatedBy: user?.uid || 'staff'
      };
      
      // Update students
      if (dataToSave.students && dataToSave.students.length > 0) {
        // First, get existing students to preserve their keys
        const existingDataSnapshot = await get(familyRef);
        const existingStudents = existingDataSnapshot.exists() ? 
          existingDataSnapshot.val().students || {} : {};
        
        const studentsObj = {};
        
        // First, add all existing students to preserve their IDs
        Object.keys(existingStudents).forEach(existingKey => {
          const existingStudent = existingStudents[existingKey];
          // Find matching student in dataToSave by comparing properties
          const matchingStudent = dataToSave.students.find(s => 
            (s.id === existingKey) || 
            (s.id === existingStudent.id) ||
            (s.firstName === existingStudent.firstName && 
             s.lastName === existingStudent.lastName &&
             s.birthday === existingStudent.birthday)
          );
          
          if (matchingStudent) {
            // Update existing student, preserving the original key
            studentsObj[existingKey] = {
              ...matchingStudent,
              id: existingKey, // ALWAYS preserve the original key as the ID
              asn: matchingStudent.asn ? matchingStudent.asn.replace(/\D/g, '') : '',
              updatedAt: Date.now(),
              updatedBy: user?.uid || 'staff'
            };
          }
        });
        
        // Then add any truly new students that weren't matched
        dataToSave.students.forEach((student) => {
          const alreadyAdded = Object.values(studentsObj).some(s => 
            (s.firstName === student.firstName && 
             s.lastName === student.lastName &&
             s.birthday === student.birthday)
          );
          
          if (!alreadyAdded) {
            // This is a new student
            const studentKey = student.id || `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            studentsObj[studentKey] = {
              ...student,
              id: studentKey,
              asn: student.asn ? student.asn.replace(/\D/g, '') : '',
              updatedAt: Date.now(),
              updatedBy: user?.uid || 'staff'
            };
          }
        });
        
        updates.students = studentsObj;
      }
      
      // Update guardians
      if (dataToSave.guardians) {
        const guardiansObj = {};
        dataToSave.guardians.forEach((guardian) => {
          const emailKey = sanitizeEmail(guardian.email);
          guardiansObj[emailKey] = {
            ...guardian,
            emailKey,
            updatedAt: Date.now(),
            updatedBy: user?.uid || 'staff'
          };
        });
        
        // Preserve primary guardian if exists
        const existingDataSnapshot = await get(familyRef);
        if (existingDataSnapshot.exists()) {
          const existingData = existingDataSnapshot.val();
          if (existingData.guardians) {
            // Find and preserve primary guardian
            Object.entries(existingData.guardians).forEach(([key, guardian]) => {
              if (guardian.guardianType === 'primary_guardian' && !guardiansObj[key]) {
                guardiansObj[key] = guardian;
              }
            });
          }
        }
        
        updates.guardians = guardiansObj;
      }
      
      // Perform the update
      await update(familyRef, updates);
      
      setAutoSaveStatus('saved');
      setLastSavedTime(new Date());
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setAutoSaveStatus('idle');
      }, 2000);
      
    } catch (error) {
      console.error('Auto-save error:', error);
      setAutoSaveStatus('error');
      toast.error('Failed to auto-save changes');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setAutoSaveStatus('idle');
      }, 3000);
    }
  }, [isStaffEditMode, familyKey, user?.uid]);

  // Debounced auto-save
  const debouncedAutoSave = useCallback((data) => {
    if (!isStaffEditMode) return;
    
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Set new timeout for auto-save (500ms delay)
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveToDatabase(data);
    }, 500);
  }, [isStaffEditMode, autoSaveToDatabase]);

  // Name validation helper
  const validateName = (name, fieldName) => {
    if (!name || !name.trim()) {
      return `${fieldName} is required`;
    }
    
    const trimmedName = name.trim();
    
    // Check if each word starts with a capital letter (allow spaces)
    const words = trimmedName.split(/\s+/); // Split on any whitespace
    for (const word of words) {
      if (word.length > 0 && word[0] !== word[0].toUpperCase()) {
        return `Each word in ${fieldName} must start with a capital letter`;
      }
    }
    
    return null;
  };

  // Name formatting helper - capitalizes first letter of each word, preserves spacing
  const formatName = (name) => {
    if (!name) return name;
    
    // Only capitalize first letter of each word, preserve original spacing
    return name.replace(/\b\w/g, (char) => char.toUpperCase());
  };
  
  // Helper to clean name for submission (trim whitespace)
  const cleanNameForSubmission = (name) => {
    if (!name) return name;
    return name.trim().replace(/\s+/g, ' '); // Trim and normalize multiple spaces to single
  };

  // Family name change handler
  const handleFamilyNameChange = (value) => {
    const updatedData = { ...familyData, familyName: value };
    setFamilyData(updatedData);
    onFamilyDataChange?.(updatedData);
    setHasUnsavedChanges(true);
    
    // Auto-save for staff mode
    if (isStaffEditMode) {
      debouncedAutoSave(updatedData);
    }
  };

  // Student validation
  const validateStudentForm = () => {
    const errors = {};

    // Validate first name
    const firstNameError = validateName(studentFormData.firstName, 'First name');
    if (firstNameError) {
      errors.firstName = firstNameError;
    }

    // Validate last name
    const lastNameError = validateName(studentFormData.lastName, 'Last name');
    if (lastNameError) {
      errors.lastName = lastNameError;
    }

    // Validate preferred name (optional but must follow rules if provided)
    if (studentFormData.preferredName && studentFormData.preferredName.trim()) {
      const preferredNameError = validateName(studentFormData.preferredName, 'Preferred name');
      if (preferredNameError) {
        errors.preferredName = preferredNameError;
      }
    }

    // ASN is now optional, but if provided, must be valid
    if (studentFormData.asn.trim() && !validateASN(studentFormData.asn)) {
      errors.asn = 'Please enter a valid 9-digit ASN';
    }

    if (!studentFormData.birthday) {
      errors.birthday = 'Birthday is required';
    }

    if (!studentFormData.gender) {
      errors.gender = 'Gender is required';
    }

    // Address validation
    if (!studentFormData.usePrimaryAddress && (!studentFormData.address || !studentFormData.address.fullAddress)) {
      errors.address = 'Address is required. Please select an address or use primary guardian address.';
    }

    // Email uniqueness validation
    if (studentFormData.email && studentFormData.email.trim()) {
      const studentEmail = studentFormData.email.trim().toLowerCase();
      const primaryGuardianEmail = user?.email?.toLowerCase();
      
      // Check if student email matches primary guardian email
      if (studentEmail === primaryGuardianEmail) {
        errors.email = 'Student email cannot be the same as primary guardian email. Leave blank if student does not need separate access.';
      }
      
      // Check if student email matches any existing guardian email
      const existingGuardianEmails = familyData.guardians.map(g => g.email?.toLowerCase()).filter(Boolean);
      if (existingGuardianEmails.includes(studentEmail)) {
        errors.email = 'Student email cannot be the same as any guardian email. Leave blank if student does not need separate access.';
      }
      
      // Check if student email matches any other student email (when editing)
      const otherStudents = familyData.students.filter((_, index) => index !== editingStudentIndex);
      const existingStudentEmails = otherStudents.map(s => s.email?.toLowerCase()).filter(Boolean);
      if (existingStudentEmails.includes(studentEmail)) {
        errors.email = 'This email is already used by another student.';
      }
    }

    // Phone uniqueness validation
    if (studentFormData.phone && studentFormData.phone.trim()) {
      const studentPhone = studentFormData.phone.replace(/\D/g, '');
      const primaryGuardianPhone = userProfile?.phone?.replace(/\D/g, '');
      
      // Check if student phone matches primary guardian phone
      if (studentPhone === primaryGuardianPhone) {
        errors.phone = 'Student phone cannot be the same as primary guardian phone. Leave blank to use primary guardian phone.';
      }
      
      // Check if student phone matches any existing guardian phone
      const existingGuardianPhones = familyData.guardians.map(g => g.phone?.replace(/\D/g, '')).filter(Boolean);
      if (existingGuardianPhones.includes(studentPhone)) {
        errors.phone = 'Student phone cannot be the same as any guardian phone. Leave blank to use primary guardian phone.';
      }
      
      // Check if student phone matches any other student phone (when editing)
      const otherStudents = familyData.students.filter((_, index) => index !== editingStudentIndex);
      const existingStudentPhones = otherStudents.map(s => s.phone?.replace(/\D/g, '')).filter(Boolean);
      if (existingStudentPhones.includes(studentPhone)) {
        errors.phone = 'This phone number is already used by another student.';
      }
    }

    setStudentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddStudent = () => {
    if (!validateStudentForm()) return;
    
    const newStudent = {
      ...studentFormData,
      // Clean names for submission
      firstName: cleanNameForSubmission(studentFormData.firstName),
      lastName: cleanNameForSubmission(studentFormData.lastName),
      preferredName: cleanNameForSubmission(studentFormData.preferredName),
      // CRITICAL: Preserve existing ID when editing, only generate new ID for new students
      id: editingStudentIndex !== null ? familyData.students[editingStudentIndex].id : Date.now().toString()
    };
    
    // If using primary address, don't store the full address object
    if (newStudent.usePrimaryAddress) {
      newStudent.address = null;
    }

    if (studentFormData.email && studentFormData.email.trim()) {
      newStudent.emailKey = sanitizeEmail(studentFormData.email);
    }
    
    // Update local state only
    let updatedStudents;
    if (editingStudentIndex !== null) {
      updatedStudents = [...familyData.students];
      updatedStudents[editingStudentIndex] = newStudent;
      setEditingStudentIndex(null);
    } else {
      updatedStudents = [...familyData.students, newStudent];
    }
    
    const updatedData = { ...familyData, students: updatedStudents };
    setFamilyData(updatedData);
    onFamilyDataChange?.(updatedData);
    setHasUnsavedChanges(true);
    
    // Auto-save for staff mode
    if (isStaffEditMode) {
      debouncedAutoSave(updatedData);
    }
    
    // Reset form
    setStudentFormData({
      asn: '',
      firstName: '',
      lastName: '',
      preferredName: '',
      birthday: '',
      email: '',
      phone: '',
      gender: '',
      address: null,
      usePrimaryAddress: false
    });
    setShowStudentForm(false);
  };

  const handleEditStudent = (index) => {
    const student = familyData.students[index];
    setStudentFormData({
      ...student,
      birthday: formatDateForInput(student.birthday)
    });
    
    setEditingStudentIndex(index);
    setShowStudentForm(true);
  };

  const handleRemoveStudent = (index) => {
    // Remove from local state only
    const updatedStudents = familyData.students.filter((_, i) => i !== index);
    const updatedData = { ...familyData, students: updatedStudents };
    setFamilyData(updatedData);
    onFamilyDataChange?.(updatedData);
    setHasUnsavedChanges(true);
    
    // Auto-save for staff mode
    if (isStaffEditMode) {
      debouncedAutoSave(updatedData);
    }
  };

  const handleCancelEdit = () => {
    setStudentFormData({
      firstName: '',
      lastName: '',
      preferredName: '',
      asn: '',
      birthday: '',
      email: '',
      phone: '',
      gender: '',
      address: null,
      usePrimaryAddress: false
    });
    setEditingStudentIndex(null);
    setStudentErrors({});
    setShowStudentForm(false);
  };

  // Guardian validation
  const validateGuardianForm = () => {
    const errors = {};

    // Validate first name
    const firstNameError = validateName(guardianFormData.firstName, 'First name');
    if (firstNameError) {
      errors.firstName = firstNameError;
    }

    // Validate last name
    const lastNameError = validateName(guardianFormData.lastName, 'Last name');
    if (lastNameError) {
      errors.lastName = lastNameError;
    }

    if (!guardianFormData.email.trim()) {
      errors.email = 'Email is required';
    } else {
      // Email uniqueness validation
      const guardianEmail = guardianFormData.email.trim().toLowerCase();
      const primaryGuardianEmail = user?.email?.toLowerCase();
      
      // Check if guardian email matches primary guardian email
      if (guardianEmail === primaryGuardianEmail) {
        errors.email = 'Guardian email cannot be the same as primary guardian email.';
      }
      
      // Check if guardian email matches any existing guardian email (when editing)
      const otherGuardians = familyData.guardians.filter((_, index) => index !== editingGuardianIndex);
      const existingGuardianEmails = otherGuardians.map(g => g.email?.toLowerCase()).filter(Boolean);
      if (existingGuardianEmails.includes(guardianEmail)) {
        errors.email = 'This email is already used by another guardian.';
      }
      
      // Check if guardian email matches any student email
      const existingStudentEmails = familyData.students.map(s => s.email?.toLowerCase()).filter(Boolean);
      if (existingStudentEmails.includes(guardianEmail)) {
        errors.email = 'Guardian email cannot be the same as any student email.';
      }
    }

    if (!guardianFormData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }

    if (!guardianFormData.relationToStudents) {
      errors.relationToStudents = 'Relation to students is required';
    }

    // Address validation
    if (!guardianFormData.usePrimaryAddress && (!guardianFormData.address || !guardianFormData.address.fullAddress)) {
      errors.address = 'Address is required. Please select an address or use primary guardian address.';
    }

    setGuardianErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddGuardian = () => {
    if (!validateGuardianForm()) return;
    
    const guardianEmailKey = sanitizeEmail(guardianFormData.email);
    
    const newGuardian = {
      ...guardianFormData,
      // Clean names for submission
      firstName: cleanNameForSubmission(guardianFormData.firstName),
      lastName: cleanNameForSubmission(guardianFormData.lastName),
      emailKey: guardianEmailKey,
      id: Date.now().toString(),
      guardianType: 'guardian',
      fullAddress: guardianFormData.usePrimaryAddress ? '' : (guardianFormData.address?.fullAddress || '')
    };
    
    // If using primary address, don't store the full address object
    if (newGuardian.usePrimaryAddress) {
      newGuardian.address = null;
    }
    
    // Update local state only
    let updatedGuardians;
    if (editingGuardianIndex !== null) {
      updatedGuardians = [...familyData.guardians];
      updatedGuardians[editingGuardianIndex] = { ...newGuardian, isPrimary: updatedGuardians[editingGuardianIndex].isPrimary };
      setEditingGuardianIndex(null);
    } else {
      updatedGuardians = [...familyData.guardians, newGuardian];
    }
    
    const updatedData = { ...familyData, guardians: updatedGuardians };
    setFamilyData(updatedData);
    onFamilyDataChange?.(updatedData);
    setHasUnsavedChanges(true);
    
    // Auto-save for staff mode
    if (isStaffEditMode) {
      debouncedAutoSave(updatedData);
    }
    
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
    setShowGuardianForm(false);
  };

  const handleEditGuardian = (index) => {
    const guardian = familyData.guardians[index];
    setGuardianFormData(guardian);
    setEditingGuardianIndex(index);
    setShowGuardianForm(true);
  };

  const handleRemoveGuardian = (index) => {
    // Don't allow removing primary guardian
    if (familyData.guardians[index].guardianType === 'primary_guardian') return;
    
    // Remove from local state only
    const updatedGuardians = familyData.guardians.filter((_, i) => i !== index);
    const updatedData = { ...familyData, guardians: updatedGuardians };
    setFamilyData(updatedData);
    onFamilyDataChange?.(updatedData);
    setHasUnsavedChanges(true);
    
    // Auto-save for staff mode
    if (isStaffEditMode) {
      debouncedAutoSave(updatedData);
    }
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
    setEditingGuardianIndex(null);
    setGuardianErrors({});
    setShowGuardianForm(false);
  };

  const handleSaveFamilyData = async () => {
    // Ensure local family name is synced before validation
    if (localFamilyName !== familyData.familyName) {
      handleFamilyNameChange(localFamilyName);
    }

    if (familyData.students.length === 0) {
      toast.error('Please add at least one student to your family.');
      return;
    }

    if (!localFamilyName.trim()) {
      toast.error('Please enter a family name.');
      return;
    }

    // Show loading toast
    const toastId = toast.loading('Saving family data...');
    setIsSaving(true);

    try {
      // Prepare students object with id as key
      // IMPORTANT: Always use student.id as the key to maintain consistency with forms and other data
      const studentsObj = {};
      familyData.students.forEach((student) => {
        // Always use the student's ID as the key, not the ASN
        // This ensures consistency with notification forms, SOLO plans, etc.
        const key = student.id || `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        studentsObj[key] = {
          ...student,
          id: key,
          asn: student.asn ? student.asn.replace(/\D/g, '') : '' // Store clean ASN as a property
        };
      });

      // Prepare guardians object with emailKey as key
      const guardiansObj = {};
      familyData.guardians.forEach((guardian) => {
        const key = guardian.emailKey;
        if (!key) {
          throw new Error('Guardian missing emailKey');
        }
        guardiansObj[key] = {
          ...guardian,
          id: key
        };
      });

      const functions = getFunctions();
      const saveFamilyData = httpsCallable(functions, 'saveFamilyData');

      // Determine target school year based on current month
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // 1-12
      // If it's September (9) or October (10), use current school year
      // Otherwise, use next school year
      const targetYear = (currentMonth === 9 || currentMonth === 10)
        ? CURRENT_SCHOOL_YEAR
        : NEXT_SCHOOL_YEAR;

      console.log('Creating family for year:', targetYear);

      // Include familyId and staff flags when staff is editing
      const requestData = {
        familyData: {
          familyName: familyData.familyName,
          students: studentsObj,
          guardians: guardiansObj,
          // Include target year for tracking
          registeredForYear: targetYear
        }
      };
      
      // If staff is editing an existing family, include the family ID
      if ((staffMode || isStaffViewing) && familyKey) {
        requestData.familyId = familyKey;
        requestData.isStaffEdit = true;
      }
      
      const result = await saveFamilyData(requestData);

      if (result.data.success) {
        console.log('Family data saved successfully:', result.data);
        setHasUnsavedChanges(false);
        
        // Update toast to show waiting for token refresh
        toast.loading('Updating your permissions...', { id: toastId });
        
        // First attempt: Try immediate token refresh
        console.log('Attempting immediate token refresh...');
        try {
          await user.getIdToken(true);
          const immediateTokenResult = await user.getIdTokenResult();
          if (immediateTokenResult.claims.familyId) {
            console.log('familyId found immediately:', immediateTokenResult.claims.familyId);
            
            // Success - close and complete immediately
            onOpenChange(false);
            toast.success(
              result.data.isNewFamily 
                ? 'Family created successfully!' 
                : 'Family updated successfully!',
              { id: toastId }
            );
            
            setTimeout(() => {
              onComplete?.(result.data, immediateTokenResult.claims);
            }, 100);
            return;
          }
        } catch (error) {
          console.log('Immediate token refresh did not work, waiting for metadata trigger...');
        }
        
        // Fallback: Wait for metadata-triggered token refresh
        const waitForTokenRefresh = () => {
          return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 10; // Check every 500ms for up to 5 seconds
            
            const checkClaims = async () => {
              attempts++;
              try {
                const idTokenResult = await user.getIdTokenResult(true);
                
                if (idTokenResult.claims.familyId) {
                  console.log(`familyId found after ${attempts} attempts:`, idTokenResult.claims.familyId);
                  resolve(idTokenResult.claims);
                } else if (attempts >= maxAttempts) {
                  console.log('Max attempts reached, resolving without familyId');
                  resolve(null);
                } else {
                  console.log(`Attempt ${attempts}: familyId not yet in claims, retrying...`);
                  setTimeout(checkClaims, 500);
                }
              } catch (error) {
                console.error('Error checking claims:', error);
                if (attempts >= maxAttempts) {
                  resolve(null);
                } else {
                  setTimeout(checkClaims, 500);
                }
              }
            };
            
            // Also listen for the token refresh event as a trigger
            const handleTokenRefresh = () => {
              console.log('Token refresh event detected, checking claims immediately...');
              checkClaims();
            };
            
            window.addEventListener('tokenRefreshed', handleTokenRefresh);
            
            // Start checking
            checkClaims();
            
            // Cleanup listener when done
            setTimeout(() => {
              window.removeEventListener('tokenRefreshed', handleTokenRefresh);
            }, 6000);
          });
        };
        
        // Wait for the token refresh
        const updatedClaims = await waitForTokenRefresh();
        
        // Close the sheet
        onOpenChange(false);
        
        // Show success toast
        toast.success(
          result.data.isNewFamily 
            ? 'Family created successfully!' 
            : 'Family updated successfully!',
          { id: toastId }
        );

        // Call completion callback with updated claims info
        setTimeout(() => {
          onComplete?.(result.data, updatedClaims);
        }, 100);
        
      } else {
        throw new Error(result.data.message || 'Failed to save family data');
      }
      
    } catch (error) {
      console.error('Error saving family data:', error);
      toast.error('Failed to save family data. Please try again.', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  // Update family data when initialFamilyData changes
  React.useEffect(() => {
    setFamilyData(initialFamilyData);
    setHasUnsavedChanges(false);
  }, [initialFamilyData]);

  // Reset unsaved changes when sheet opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setHasUnsavedChanges(false);
    }
  }, [isOpen]);
  
  // Cleanup auto-save timeout on unmount
  React.useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Load user profile data
  React.useEffect(() => {
    if (!user?.uid) return;

    const db = getDatabase();
    const userRef = ref(db, `users/${user.uid}`);

    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        setUserProfile({
          ...userData,
          email: user.email // Ensure we have the email from auth
        });
      }
    }, (error) => {
      console.error('Error loading user profile:', error);
    });

    return () => {
      off(userRef, 'value', unsubscribe);
    };
  }, [user?.uid, user?.email]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-500" />
                <span>{hasRegisteredFamily ? (staffMode ? 'Update Family Information' : 'Update Your Family') : 'Create Your Family'}</span>
              </div>
              <div className="flex items-center space-x-2">
                {/* Auto-save status indicator for staff mode */}
                {isStaffEditMode && (
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
                  </div>
                )}
                {staffMode && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Eye className="w-3 h-3 mr-1" />
                    Staff Mode
                  </span>
                )}
              </div>
            </div>
          </SheetTitle>
          <SheetDescription className="text-left">
            {staffMode 
              ? 'Updating family information as staff member.'
              : (hasRegisteredFamily 
                ? 'Update your family name, students, and family members.'
                : 'Add your students and family members to complete your family profile.')}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {/* Staff Mode Notification */}
          {staffMode && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-amber-600" />
                <div className="flex-1">
                  <p className="text-sm text-amber-800">
                    <strong>Staff Mode:</strong> You are editing this family's information as a staff member.
                  </p>
                  {isStaffEditMode && (
                    <p className="text-xs text-amber-700 mt-1">
                      Changes are automatically saved as you type.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Family Name */}
          <div className="mb-6">
            <label htmlFor="familyName" className="block text-sm font-medium text-gray-700 mb-1">
              Family Name
            </label>
            <input
              type="text"
              id="familyName"
              value={localFamilyName}
              onChange={(e) => setLocalFamilyName(e.target.value)}
              onBlur={(e) => handleFamilyNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., The Smith Family"
            />
            <p className="mt-1 text-sm text-gray-500">This will be displayed as your family identifier</p>
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
                Students ({familyData.students.length})
              </button>
              <button
                onClick={() => setActiveTab('guardians')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'guardians'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Parents/Guardians ({(() => {
                  const additionalGuardians = familyData.guardians.filter(guardian => 
                    guardian.guardianType !== 'primary_guardian' && 
                    guardian.emailKey !== sanitizeEmail(user?.email || '')
                  );
                  return additionalGuardians.length + (userProfile ? 1 : 0);
                })()})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'students' ? (
            <div className="space-y-6">
              {/* Student List */}
              {familyData.students.length > 0 && (
                <div className="space-y-4 mb-6">
                  {familyData.students.map((student, index) => (
                    <StudentCard
                      key={student.id || student.asn || `student-${index}`}
                      student={student}
                      index={index}
                      onEdit={() => handleEditStudent(index)}
                      onRemove={() => handleRemoveStudent(index)}
                      userProfile={userProfile}
                    />
                  ))}
                </div>
              )}

              {/* Add Student Form or Button */}
              {showStudentForm ? (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-medium text-gray-900 mb-4">
                    {editingStudentIndex !== null ? 'Edit Student' : 'Add a Student'}
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
  <p className="mt-1 text-sm text-gray-500">
    Optional: If you don't have the ASN, you can look it up <a href="https://learnerregistry.ae.alberta.ca/Home/StartLookup" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">here</a>. We can also find it later.
  </p>
</div>

                      <div>
                        <label htmlFor="student-birthday" className="block text-sm font-medium text-gray-700 mb-1">
                          Date of Birth
                        </label>
                        <DatePicker
                          selected={studentFormData.birthday ? toEdmontonDate(studentFormData.birthday) : null}
                          onChange={(date) => setStudentFormData({...studentFormData, birthday: date ? toDateString(date) : ''})}
                          openToDate={new Date(new Date().getFullYear() - 14, 0, 1)}
                          showYearDropdown
                          scrollableYearDropdown
                          yearDropdownItemNumber={100}
                          dateFormat="yyyy-MM-dd"
                          placeholderText="Select date of birth"
                          className={`w-full px-3 py-2 border ${studentErrors.birthday ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                          wrapperClassName="w-full"
                        />
                        {studentFormData.birthday && (() => {
                          const age = calculateAgeWithMonths(studentFormData.birthday);
                          return (
                            <p className="mt-1 text-sm text-gray-600">
                              Age: {age.years} {age.years === 1 ? 'year' : 'years'}, {age.months} {age.months === 1 ? 'month' : 'months'}
                            </p>
                          );
                        })()}
                        {studentErrors.birthday && (
                          <p className="mt-1 text-sm text-red-600">{studentErrors.birthday}</p>
                        )}
                      </div>

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
                        <p className="mt-1 text-sm text-gray-500">For students who need their own login access. Must be different from all guardian emails.</p>
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
                        <p className="mt-1 text-sm text-gray-500">For direct contact. If not provided, primary guardian phone will be used. Must be different from all other family member phones.</p>
                        {studentErrors.phone && (
                          <p className="mt-1 text-sm text-red-600">{studentErrors.phone}</p>
                        )}
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Student Address *
                        </label>
                        
                        {/* Same as Primary Guardian Checkbox */}
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
                        
                        {/* Address Picker (only shown when not using primary address) */}
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
                        {editingStudentIndex !== null ? 'Update Student' : 'Add Student'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <button
                  onClick={() => setShowStudentForm(true)}
                  className="w-full py-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-400 hover:text-blue-700 transition-colors flex items-center justify-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add a Student
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Primary Guardian */}
              {(() => {
                // Find the primary guardian from the family data
                let primaryGuardian = null;
                
                if (isStaffEditMode) {
                  // In staff mode, find the primary guardian from family data
                  primaryGuardian = familyData.guardians?.find(g => g.guardianType === 'primary_guardian') || null;
                } else {
                  // In regular mode, use userProfile as primary guardian
                  primaryGuardian = userProfile ? { ...userProfile, guardianType: 'primary_guardian' } : null;
                }
                
                if (!primaryGuardian) return null;
                
                // Determine if user can edit the profile
                const canEditProfile = isStaffEditMode || 
                  (primaryGuardian?.email === user?.email || 
                   sanitizeEmail(primaryGuardian?.email || '') === sanitizeEmail(user?.email || ''));
                
                return (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Primary Guardian</h3>
                    <PrimaryGuardianCard 
                      guardian={primaryGuardian} 
                      isStaffMode={isStaffEditMode}
                      canEdit={canEditProfile}
                      onEditProfile={onEditProfile}
                    />
                  </div>
                );
              })()}

              {/* Additional Guardians List */}
              {(() => {
                // Filter out primary guardian to avoid duplication
                const additionalGuardians = familyData.guardians.filter(guardian => 
                  guardian.guardianType !== 'primary_guardian' && 
                  guardian.emailKey !== sanitizeEmail(user?.email || '')
                );
                
                return additionalGuardians.length > 0 && (
                  <>
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Additional Parents/Guardians</h3>
                    </div>
                    <div className="space-y-4 mb-6">
                      {additionalGuardians.map((guardian, index) => {
                        // Find the original index in the full guardians array for editing/removing
                        const originalIndex = familyData.guardians.findIndex(g => g.emailKey === guardian.emailKey);
                        return (
                          <GuardianCard
                            key={guardian.emailKey}
                            guardian={guardian}
                            index={originalIndex}
                            isPrimary={false}
                            onEdit={() => handleEditGuardian(originalIndex)}
                            onRemove={() => handleRemoveGuardian(originalIndex)}
                            userProfile={userProfile}
                          />
                        );
                      })}
                    </div>
                  </>
                );
              })()}

              {/* Add Guardian Form or Button */}
              {showGuardianForm ? (
                <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
                  <h4 className="font-medium text-gray-900 mb-4">
                    {editingGuardianIndex !== null ? 'Edit Parent/Guardian' : 'Add Parent/Guardian'}
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
                        
                        {/* Same as Primary Guardian Checkbox */}
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
                        
                        {/* Address Picker (only shown when not using primary address) */}
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
                        {editingGuardianIndex !== null ? 'Update Guardian' : 'Add Guardian'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleCancelGuardianEdit();
                          setShowGuardianForm(false);
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <button
                  onClick={() => setShowGuardianForm(true)}
                  className="w-full py-3 border-2 border-dashed border-pink-300 rounded-lg text-pink-600 hover:border-pink-400 hover:text-pink-700 transition-colors flex items-center justify-center"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Add Additional Parent/Guardian
                </button>
              )}
            </div>
          )}

          {/* Save Button - hidden in staff mode with auto-save */}
          {!isStaffEditMode ? (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-center">
                <button
                  onClick={handleSaveFamilyData}
                  disabled={isSaving || familyData.students.length === 0 || !localFamilyName.trim()}
                  className={`w-full max-w-md py-3 px-4 rounded-md font-medium flex items-center justify-center ${
                    isSaving || familyData.students.length === 0 || !localFamilyName.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : hasUnsavedChanges
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : hasUnsavedChanges ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Family
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Auto-save info for staff mode */
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Changes are saved automatically
                </p>
                {lastSavedTime && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last saved: {lastSavedTime.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          )}
            
          {familyData.students.length === 0 && (
            <p className="mt-2 text-sm text-gray-500 text-center">Add at least one student to save</p>
          )}
          {!localFamilyName.trim() && familyData.students.length > 0 && (
            <p className="mt-2 text-sm text-gray-500 text-center">Please enter a family name to save</p>
          )}
          {hasUnsavedChanges && !isStaffEditMode && (
            <p className="mt-2 text-sm text-amber-600 text-center">You have unsaved changes</p>
          )}

        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FamilyCreationSheet;