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

const REQUIRED_FIELDS = ['preferredFirstName', 'StudentPhone', 'gender'];

const ProfileComponent = ({ isOpen, onOpenChange, profile }) => {
  const { current_user_email_key } = useAuth();
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

  const handleChange = async (field, value) => {
    try {
      // Update local state
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));

      // Update database
      const db = getDatabase();
      await update(ref(db), {
        [`students/${current_user_email_key}/profile/${field}`]: value
      });

      setError(null);
    } catch (err) {
      console.error('Error updating field:', err);
      setError('Failed to update profile');
    }
  };

  const renderField = (label, field, type = 'text', readonly = false) => {
    const isPhoneField = type === 'phone';
    const isGenderField = type === 'gender';
    const value = formData[field];
    const isRequired = ['preferredFirstName', 'StudentPhone', 'gender'].includes(field);
    const isMissing = isRequired && (!value || !String(value).trim());

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
          {!readonly && <span className="text-primary ml-1">(Editable)</span>}
        </label>
        
        {isGenderField ? (
          <Select
            value={value}
            onValueChange={(val) => handleChange(field, val)}
            disabled={readonly}
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
            disabled={readonly}
            inputClass={`w-full p-2 border rounded-md ${isMissing ? 'border-red-500' : ''} ${readonly ? 'bg-gray-50' : ''}`}
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
              ${readonly ? 'bg-gray-50' : ''}`}
            readOnly={readonly}
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
          <SheetTitle>Profile Information</SheetTitle>
          <SheetDescription>
            Manage your profile information
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
                <h4 className="text-sm font-medium text-gray-500">Other Information (Contact instructor to update)</h4>
                {renderField('Birthday', 'birthday', 'date', true)}
                {renderField('Alberta Student Number (ASN)', 'albertaStudentNumber', 'text', true)}
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

        <SheetFooter className="flex-shrink-0 flex justify-end border-t pt-4">
          <SheetClose asChild>
            <Button type="button" variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileComponent;