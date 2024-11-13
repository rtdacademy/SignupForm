import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '../components/ui/sheet';
import { Alert, AlertDescription } from '../components/ui/alert';
import { ScrollArea } from '../components/ui/scroll-area';
import { FaUser, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { AlertCircle, Loader2, InfoIcon } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import "react-phone-input-2/lib/style.css";
import { getDatabase, ref, update } from 'firebase/database';
import { useAuth } from '../context/AuthContext';

const ProfileComponent = ({ isOpen, onOpenChange, profile }) => {
  const { user_email_key } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    preferredFirstName: '',
    phoneNumber: '',
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
        phoneNumber: profile.StudentPhone || '',
        birthday: profile.birthday || '',
        albertaStudentNumber: profile.asn || '',
        parentFirstName: profile.ParentFirstName || '',
        parentLastName: profile.ParentLastName || '',
        parentPhone: profile.ParentPhone_x0023_ || '',
        parentEmail: profile.ParentEmail || '',
      });
    }
  }, [profile]);

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
        [`students/${user_email_key}/profile/StudentPhone`]: formData.phoneNumber,
      };

      await update(ref(getDatabase()), updates);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile changes');
    } finally {
      setIsSaving(false);
    }
  };

  const renderEditableField = (label, value, field, type = 'text') => {
    const isPhoneField = type === 'phone';

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {label}
          {isEditing && <span className="text-primary ml-1">(Editable)</span>}
        </label>
        {isPhoneField ? (
          <PhoneInput
            country={"ca"}
            value={value}
            onChange={(val) => handleChange(field, val)}
            disabled={!isEditing}
            inputClass={`w-full p-2 border rounded-md ${!isEditing ? 'bg-gray-50' : ''}`}
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
            className={`w-full p-2 border rounded-md ${!isEditing ? 'bg-gray-50' : ''}`}
            readOnly={!isEditing}
          />
        )}
      </div>
    );
  };

  const renderReadOnlyField = (label, value, type = 'text') => {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-600">{label}</label>
        <input
          type={type}
          value={value}
          className="w-full p-2 border rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
          readOnly
        />
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-2xl overflow-hidden flex flex-col h-full">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>Profile Information</SheetTitle>
          <SheetDescription>
            View and manage your profile information
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

        <Alert className="mt-4 flex-shrink-0 bg-blue-50 border-blue-200">
          <InfoIcon className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-700">
            You can only edit your preferred name and phone number. To update other information, please contact your instructor.
          </AlertDescription>
        </Alert>

        <ScrollArea className="flex-grow my-6 pr-4">
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderReadOnlyField('First Name', formData.firstName)}
                {renderReadOnlyField('Last Name', formData.lastName)}
              </div>
              
              {/* Editable Fields */}
              <div className="space-y-4 border-l-4 border-primary pl-4 bg-primary/5 p-4 rounded">
                <h4 className="text-sm font-medium text-primary">Editable Information</h4>
                {renderEditableField('Preferred Name', formData.preferredFirstName, 'preferredFirstName')}
                {renderEditableField('Phone Number', formData.phoneNumber, 'phoneNumber', 'phone')}
              </div>

              {/* Read-only Fields */}
              <div className="space-y-4 mt-6">
                <h4 className="text-sm font-medium text-gray-500">Other Information (Contact instructor to update)</h4>
                {renderReadOnlyField('Birthday', formData.birthday, 'date')}
                {renderReadOnlyField('Alberta Student Number (ASN)', formData.albertaStudentNumber)}
              </div>
            </div>

            {/* Parent/Guardian Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-500">Parent/Guardian Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderReadOnlyField('Parent First Name', formData.parentFirstName)}
                {renderReadOnlyField('Parent Last Name', formData.parentLastName)}
              </div>
              {renderReadOnlyField('Parent Phone', formData.parentPhone)}
              {renderReadOnlyField('Parent Email', formData.parentEmail)}
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="flex-shrink-0 flex justify-between border-t pt-4">
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <FaSave className="mr-2" />
                  )}
                  Save Changes
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(prev => ({
                      ...prev,
                      preferredFirstName: profile.preferredFirstName || profile.firstName || '',
                      phoneNumber: profile.StudentPhone || ''
                    }));
                  }}
                  variant="outline"
                  disabled={isSaving}
                >
                  <FaTimes className="mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-secondary hover:bg-secondary/90"
              >
                <FaEdit className="mr-2" />
                Edit Profile
              </Button>
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