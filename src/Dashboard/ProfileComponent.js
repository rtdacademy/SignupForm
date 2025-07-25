import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '../components/ui/sheet';
import { Alert, AlertDescription } from '../components/ui/alert';
import { ScrollArea } from '../components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AlertCircle, Loader2 } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import "react-phone-input-2/lib/style.css";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../context/AuthContext';
import { toDateString, toEdmontonDate, calculateAge } from '../utils/timeZoneUtils';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' }
];

const REQUIRED_FIELDS = ['preferredFirstName', 'StudentPhone', 'gender', 'birthday'];

const ProfileComponent = ({ isOpen, onOpenChange, profile, readOnly = false }) => {
  const { current_user_email_key } = useAuth();
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
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
  const [originalData, setOriginalData] = useState({});

  // Initialize form data when profile changes
  useEffect(() => {
    if (profile) {
      const data = {
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        preferredFirstName: profile.preferredFirstName || profile.firstName || '',
        StudentPhone: profile.StudentPhone || '',
        gender: profile.gender || '',
        birthday: profile.birthday ? toDateString(toEdmontonDate(profile.birthday)) : '',
        albertaStudentNumber: profile.asn || '',
        parentFirstName: profile.ParentFirstName || '',
        parentLastName: profile.ParentLastName || '',
        parentPhone: profile.ParentPhone_x0023_ || '',
        parentEmail: profile.ParentEmail || '',
      };
      setFormData(data);
      setOriginalData(data);
      setHasChanges(false);
    }
  }, [profile]);

  const handleChange = (field, value) => {
    // Update local state
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Check if there are changes compared to original data
      const editableFields = ['preferredFirstName', 'StudentPhone', 'gender', 'birthday'];
      const hasChanges = editableFields.some(field => 
        newData[field] !== originalData[field]
      );
      setHasChanges(hasChanges);
      
      return newData;
    });
    
    setError(null);
    setSuccessMessage(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const functions = getFunctions();
      const updateProfile = httpsCallable(functions, 'updateStudentProfile');
      
      // Only include editable fields that have changed
      const editableFields = ['preferredFirstName', 'StudentPhone', 'gender', 'birthday'];
      const updates = {};
      
      editableFields.forEach(field => {
        if (formData[field] !== originalData[field]) {
          updates[field] = formData[field];
        }
      });
      
      if (Object.keys(updates).length === 0) {
        setHasChanges(false);
        return;
      }
      
      const result = await updateProfile({ updates });
      console.log('Profile update result:', result.data);
      
      // Update original data to reflect the saved state
      setOriginalData({ ...formData });
      setHasChanges(false);
      setSuccessMessage('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({ ...originalData });
    setHasChanges(false);
    setError(null);
    setSuccessMessage(null);
  };

  const renderField = (label, field, type = 'text', readonly = false) => {
    const isPhoneField = type === 'phone';
    const isGenderField = type === 'gender';
    const value = formData[field];
    const isRequired = ['preferredFirstName', 'StudentPhone', 'gender', 'birthday'].includes(field);
    const isMissing = isRequired && (!value || !String(value).trim());
    
    // Apply global readOnly if set
    const isReadonly = readOnly || readonly;

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {isGenderField ? (
          <Select
            value={value}
            onValueChange={(val) => handleChange(field, val)}
            disabled={isReadonly}
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
            disabled={isReadonly}
            inputClass={`w-full p-2 border rounded-md ${isMissing ? 'border-red-500' : ''} ${isReadonly ? 'bg-gray-50' : ''}`}
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
              ${isReadonly ? 'bg-gray-50' : ''}`}
            readOnly={isReadonly}
          />
        )}
        
        {isMissing && (
          <p className="text-sm text-red-500">This field is required</p>
        )}
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-2xl overflow-hidden flex flex-col h-full">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="flex items-center gap-2">
            Profile Information
            {!readOnly && hasChanges && (
              <span className="text-sm text-amber-600 font-normal">• Unsaved changes</span>
            )}
          </SheetTitle>
          <SheetDescription>
            {readOnly ? 'View student profile information' : 'Manage your profile information'}
          </SheetDescription>
        </SheetHeader>

        {error && (
          <Alert className="mt-4 flex-shrink-0 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-sm text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mt-4 flex-shrink-0 bg-green-50 border-green-200">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-sm text-green-700">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        <ScrollArea className="flex-grow my-6 pr-4">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField('First Name', 'firstName', 'text', true)}
                {renderField('Last Name', 'lastName', 'text', true)}
              </div>
              
              <div className="space-y-4">
                {renderField('Preferred Name', 'preferredFirstName')}
                {renderField('Phone Number', 'StudentPhone', 'phone')}
                {renderField('Gender', 'gender', 'gender')}
              </div>

              <div className="space-y-4 mt-6">
                <h4 className="text-sm font-medium text-gray-500">Other Information</h4>
                {renderField('Birthday', 'birthday', 'date')}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-500">Contact instructor to update</h4>
                  {renderField('Alberta Student Number (ASN)', 'albertaStudentNumber', 'text', true)}
                </div>
              </div>
            </div>

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
          <div className="flex gap-2">
            {!readOnly && hasChanges && (
              <>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel Changes
                </Button>
                <Button 
                  type="button" 
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </>
            )}
          </div>
          <SheetClose asChild>
            <Button type="button" variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileComponent;