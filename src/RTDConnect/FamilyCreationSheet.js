import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { toast } from 'sonner';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { useAuth } from '../context/AuthContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../components/ui/sheet';
import AddressPicker from '../components/AddressPicker';
import { Users, Plus, UserPlus, X, Edit3, Trash2, Save, Loader2, Shield, User, Phone, MapPin, Mail } from 'lucide-react';

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
const StudentCard = ({ student, index, onEdit, onRemove, userProfile }) => (
  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">
          {student.preferredName || `${student.firstName} ${student.lastName}`}
        </h4>
        <div className="mt-2 space-y-1 text-sm text-gray-600">
          <p>Legal Name: {student.firstName} {student.lastName}</p>
          <p>ASN: {student.asn}</p>
          <p>Grade: {student.grade}</p>
          <p>Gender: {student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : student.gender === 'X' ? 'Other' : student.gender}</p>
          <p>Birthday: {new Date(student.birthday).toLocaleDateString()}</p>
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

// Primary Guardian card component (read-only)
const PrimaryGuardianCard = ({ userProfile }) => (
  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
    <div className="flex items-start space-x-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
        <Shield className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-2">
          <h4 className="font-medium text-gray-900">
            {userProfile?.firstName} {userProfile?.lastName}
          </h4>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-md font-medium">
            Primary Guardian
          </span>
        </div>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <span>{userProfile?.email}</span>
          </div>
          {userProfile?.phone && (
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{userProfile.phone}</span>
            </div>
          )}
          {userProfile?.address && (
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm">
                {userProfile.address.fullAddress || 
                  `${userProfile.address.streetAddress || ''} ${userProfile.address.city || ''}, ${userProfile.address.province || ''} ${userProfile.address.postalCode || ''}`.trim()}
              </span>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          This information comes from your profile and cannot be edited here.
        </p>
      </div>
    </div>
  </div>
);

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
  onComplete
}) => {
  const { user } = useAuth();
  
  // Family data state
  const [familyData, setFamilyData] = useState(initialFamilyData);
  const [activeTab, setActiveTab] = useState('students');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [restoredFromSession, setRestoredFromSession] = useState(false);

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

  // Load saved form data from session storage when sheet opens
  useEffect(() => {
    if (isOpen) {
      console.log('FamilyCreationSheet opened, checking for saved data');
      const savedData = loadFormDataFromSession();
      if (savedData && savedData.familyData) {
        console.log('Restoring saved family data:', savedData.familyData);
        setFamilyData(savedData.familyData);
        setHasUnsavedChanges(true); // Mark as having unsaved changes since we restored data
        setRestoredFromSession(true);
        
        // Show a brief notification that data was restored
        setTimeout(() => {
          setRestoredFromSession(false);
        }, 5000);
      } else if (initialFamilyData) {
        console.log('Using initial family data:', initialFamilyData);
        setFamilyData(initialFamilyData);
        setRestoredFromSession(false);
      }
    }
  }, [isOpen, initialFamilyData]);

  // Save form data to session storage whenever familyData changes
  useEffect(() => {
    if (isOpen && hasUnsavedChanges) {
      const dataToSave = {
        familyData,
        timestamp: Date.now()
      };
      saveFormDataToSession(dataToSave);
      console.log('Saved form data to session storage');
    }
  }, [familyData, isOpen, hasUnsavedChanges]);

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

  // Session storage helpers
  const FAMILY_FORM_STORAGE_KEY = 'familyCreationFormData';
  
  const saveFormDataToSession = (data) => {
    try {
      sessionStorage.setItem(FAMILY_FORM_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save form data to session storage:', error);
    }
  };
  
  const loadFormDataFromSession = () => {
    try {
      const saved = sessionStorage.getItem(FAMILY_FORM_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn('Failed to load form data from session storage:', error);
      return null;
    }
  };
  
  const clearFormDataFromSession = () => {
    try {
      sessionStorage.removeItem(FAMILY_FORM_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear form data from session storage:', error);
    }
  };

  // Family name change handler
  const handleFamilyNameChange = (value) => {
    const updatedData = { ...familyData, familyName: value };
    setFamilyData(updatedData);
    onFamilyDataChange?.(updatedData);
    setHasUnsavedChanges(true);
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

    if (!studentFormData.asn.trim()) {
      errors.asn = 'ASN is required';
    } else if (!validateASN(studentFormData.asn)) {
      errors.asn = 'Please enter a valid 9-digit ASN';
    }

    if (!studentFormData.birthday) {
      errors.birthday = 'Birthday is required';
    }

    if (!studentFormData.grade) {
      errors.grade = 'Grade is required';
    }

    if (!studentFormData.gender) {
      errors.gender = 'Gender is required';
    }

    // Address validation
    if (!studentFormData.usePrimaryAddress && !studentFormData.address) {
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
      id: Date.now().toString()
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
      usePrimaryAddress: false
    });
    setShowStudentForm(false);
  };

  const handleEditStudent = (index) => {
    const student = familyData.students[index];
    setStudentFormData(student);
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
  };

  const handleCancelEdit = () => {
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
    if (!guardianFormData.usePrimaryAddress && !guardianFormData.address) {
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
    if (familyData.students.length === 0) {
      toast.error('Please add at least one student to your family.');
      return;
    }

    if (!familyData.familyName.trim()) {
      toast.error('Please enter a family name.');
      return;
    }

    // Show loading toast
    const toastId = toast.loading('Saving family data...');
    setIsSaving(true);

    try {
      const functions = getFunctions();
      const saveFamilyData = httpsCallable(functions, 'saveFamilyData');
      
      const result = await saveFamilyData({
        familyData: {
          familyName: familyData.familyName,
          students: familyData.students,
          guardians: familyData.guardians
        }
      });

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
        
        // Clear saved form data from session storage on successful save
        clearFormDataFromSession();
        console.log('Cleared saved form data after successful save');
        
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
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-500" />
              <span>{hasRegisteredFamily ? 'Update Your Family' : 'Create Your Family'}</span>
            </div>
          </SheetTitle>
          <SheetDescription className="text-left">
            {hasRegisteredFamily 
              ? 'Update your family name, students, and family members.'
              : 'Add your students and family members to complete your family profile.'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {/* Restored Data Notification */}
          {restoredFromSession && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                <p className="text-sm text-blue-800">
                  <strong>Data Restored:</strong> Your previous work has been automatically restored.
                </p>
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
              value={familyData.familyName}
              onChange={(e) => handleFamilyNameChange(e.target.value)}
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
                      key={student.asn}
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
                      </div>

                      <div>
                        <label htmlFor="student-birthday" className="block text-sm font-medium text-gray-700 mb-1">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          id="student-birthday"
                          value={studentFormData.birthday}
                          onChange={(e) => setStudentFormData({...studentFormData, birthday: e.target.value})}
                          className={`w-full px-3 py-2 border ${studentErrors.birthday ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        />
                        {studentErrors.birthday && (
                          <p className="mt-1 text-sm text-red-600">{studentErrors.birthday}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="student-grade" className="block text-sm font-medium text-gray-700 mb-1">
                          Grade Level
                        </label>
                        <select
                          id="student-grade"
                          value={studentFormData.grade}
                          onChange={(e) => setStudentFormData({...studentFormData, grade: e.target.value})}
                          className={`w-full px-3 py-2 border ${studentErrors.grade ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        >
                          <option value="">Select grade</option>
                          {['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(grade => (
                            <option key={grade} value={grade}>Grade {grade}</option>
                          ))}
                        </select>
                        {studentErrors.grade && (
                          <p className="mt-1 text-sm text-red-600">{studentErrors.grade}</p>
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
              {userProfile && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Primary Guardian</h3>
                  <PrimaryGuardianCard userProfile={userProfile} />
                </div>
              )}

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

          {/* Save Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-center">
              <button
                onClick={handleSaveFamilyData}
                disabled={isSaving || familyData.students.length === 0 || !familyData.familyName}
                className={`w-full max-w-md py-3 px-4 rounded-md font-medium flex items-center justify-center ${
                  isSaving || familyData.students.length === 0 || !familyData.familyName
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
            
            {familyData.students.length === 0 && (
              <p className="mt-2 text-sm text-gray-500 text-center">Add at least one student to save</p>
            )}
            {!familyData.familyName && familyData.students.length > 0 && (
              <p className="mt-2 text-sm text-gray-500 text-center">Please enter a family name to save</p>
            )}
            {hasUnsavedChanges && (
              <p className="mt-2 text-sm text-amber-600 text-center">You have unsaved changes</p>
            )}
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FamilyCreationSheet;