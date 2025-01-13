import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '../components/ui/sheet';
import { Alert, AlertDescription } from '../components/ui/alert';
import { ScrollArea } from '../components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AlertCircle, Loader2 } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import "react-phone-input-2/lib/style.css";
import { getDatabase, ref, update } from 'firebase/database';
import { useAuth } from '../context/AuthContext';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' }
];

const ProfileComponent = ({ isOpen, onOpenChange, profile }) => {
  const { user_email_key } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    preferredFirstName: '',
    StudentPhone: '',
    gender: '',
    birthday: '',
    albertaStudentNumber: '',
    parentFirstName: '',
    parentLastName: '',
    parentPhone: '',
    parentEmail: '',
  });

  // Initialize form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        preferredFirstName: profile.preferredFirstName || profile.firstName || '',
        StudentPhone: profile.StudentPhone || '',
        gender: profile.gender || '',
        birthday: profile.birthday || '',
        albertaStudentNumber: profile.asn || '',
        parentFirstName: profile.ParentFirstName || '',
        parentLastName: profile.ParentLastName || '',
        parentPhone: profile.ParentPhone_x0023_ || '',
        parentEmail: profile.ParentEmail || '',
      });
    }
  }, [profile]);

  // Check if required fields are complete in the database
  const checkRequiredFields = (profileData) => {
    if (!profileData) return false;
    
    console.log('Checking profile data:', profileData);
    
    return (
      profileData.firstName?.trim() &&
      profileData.lastName?.trim() &&
      profileData.preferredFirstName?.trim() &&
      profileData.StudentPhone?.trim() &&
      profileData.gender?.trim()
    );
  };

  const getMissingFields = (profileData) => {
    if (!profileData) return [];
    
    const required = [
      { key: 'firstName', label: 'first name' },
      { key: 'lastName', label: 'last name' },
      { key: 'preferredFirstName', label: 'preferred name' },
      { key: 'StudentPhone', label: 'phone number' },
      { key: 'gender', label: 'gender' }
    ];
    
    return required.filter(field => 
      !profileData[field.key] || !String(profileData[field.key]).trim()
    ).map(field => field.label);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user_email_key) return;
    
    setIsSaving(true);
    setError(null);
  
    try {
      const db = getDatabase();
      const updates = {
        [`students/${user_email_key}/profile/preferredFirstName`]: formData.preferredFirstName,
        [`students/${user_email_key}/profile/StudentPhone`]: formData.StudentPhone,
        [`students/${user_email_key}/profile/gender`]: formData.gender,
      };
  
      // Only update firstName and lastName if they're currently empty in the database
      if (!profile.firstName) {
        updates[`students/${user_email_key}/profile/firstName`] = formData.firstName;
      }
      if (!profile.lastName) {
        updates[`students/${user_email_key}/profile/lastName`] = formData.lastName;
      }
  
      await update(ref(db), updates);
      
      // Always close the dialog after successful save
      onOpenChange(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile changes');
    } finally {
      setIsSaving(false);
    }
  };

  const renderField = (label, field, type = 'text', readonly = false) => {
    const isPhoneField = type === 'phone';
    const isGenderField = type === 'gender';
    const value = formData[field];
    const isRequired = ['firstName', 'lastName', 'preferredFirstName', 'StudentPhone', 'gender'].includes(field);
    const isMissing = isRequired && (!profile[field] || !String(profile[field]).trim());
    const canEdit = field === 'preferredFirstName' || field === 'StudentPhone' || field === 'gender' || 
                   (field === 'firstName' && !profile.firstName) || 
                   (field === 'lastName' && !profile.lastName);

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
          {canEdit && <span className="text-primary ml-1">(Editable)</span>}
        </label>
        
        {isGenderField ? (
          <Select
            value={value}
            onValueChange={(val) => handleChange(field, val)}
            disabled={readonly || !canEdit}
          >
            <SelectTrigger className={`w-full ${isMissing ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {GENDER_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : isPhoneField ? (
          <PhoneInput
            country={"ca"}
            value={value}
            onChange={(val) => handleChange(field, val)}
            disabled={readonly || !canEdit}
            inputClass={`w-full p-2 border rounded-md ${isMissing ? 'border-red-500' : ''} ${!canEdit ? 'bg-gray-50' : ''}`}
            containerClass="phone-input-container"
            buttonClass="phone-input-button"
            preferredCountries={["ca"]}
            priority={{ ca: 0, us: 1 }}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => handleChange(field, e.target.value)}
            className={`w-full p-2 border rounded-md 
              ${isMissing ? 'border-red-500' : ''} 
              ${!canEdit ? 'bg-gray-50' : ''}`}
            readOnly={readonly || !canEdit}
          />
        )}
        
        {isMissing && (
          <p className="text-sm text-red-500">This field is required</p>
        )}
      </div>
    );
  };

  const canClose = checkRequiredFields(profile);
  const missingFields = getMissingFields(profile);

  return (
    <Sheet 
      open={isOpen} 
      onOpenChange={(open) => {
        console.log('Sheet onOpenChange:', { open, canClose, profile });
        if (!open && canClose) {
          onOpenChange(false);
        } else if (open) {
          onOpenChange(true);
        }
      }}
    >
      <SheetContent className="w-full max-w-2xl overflow-hidden flex flex-col h-full">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>Profile Information</SheetTitle>
          <SheetDescription>
            Manage your profile information
          </SheetDescription>
        </SheetHeader>

        {!canClose && (
          <Alert className="mt-4 flex-shrink-0 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-sm text-red-700">
              Please complete all required fields marked with * before closing. 
              {missingFields.length > 0 && (
                <span> Missing: {missingFields.join(', ')}.</span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mt-4 flex-shrink-0 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-sm text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <ScrollArea className="flex-grow my-6 pr-4">
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField('First Name', 'firstName')}
                {renderField('Last Name', 'lastName')}
              </div>
              
              <div className="space-y-4">
                {renderField('Preferred Name', 'preferredFirstName')}
                {renderField('Phone Number', 'StudentPhone', 'phone')}
                {renderField('Gender', 'gender', 'gender')}
              </div>

              {/* Read-only Fields */}
              <div className="space-y-4 mt-6">
                <h4 className="text-sm font-medium text-gray-500">Other Information (Contact instructor to update)</h4>
                {renderField('Birthday', 'birthday', 'date', true)}
                {renderField('Alberta Student Number (ASN)', 'albertaStudentNumber', 'text', true)}
              </div>
            </div>

            {/* Parent/Guardian Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-500">Parent/Guardian Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField('Parent First Name', 'parentFirstName', 'text', true)}
                {renderField('Parent Last Name', 'parentLastName', 'text', true)}
              </div>
              {renderField('Parent Phone', 'parentPhone', 'text', true)}
              {renderField('Parent Email', 'parentEmail', 'text', true)}
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="flex-shrink-0 flex justify-between border-t pt-4">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              'Update Profile'
            )}
          </Button>
          
          {canClose && (
            <SheetClose asChild>
              <Button type="button" variant="outline">Close</Button>
            </SheetClose>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileComponent;