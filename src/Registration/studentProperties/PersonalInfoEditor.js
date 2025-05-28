import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Card, CardHeader, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Loader2, User, Save, X } from 'lucide-react';
import { toast } from 'sonner';

const PersonalInfoEditor = ({ studentData, onUpdate, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: studentData.profile?.firstName || '',
    lastName: studentData.profile?.lastName || '',
    preferredFirstName: studentData.profile?.preferredFirstName || '',
    birthday: studentData.profile?.birthday || '',
    age: studentData.profile?.age || '',
    gender: studentData.profile?.gender || '',
    StudentPhone: studentData.profile?.StudentPhone || ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.firstName?.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName?.trim()) {
      setError('Last name is required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      const functions = getFunctions();
      const updateStudentPersonalInfo = httpsCallable(functions, 'updateStudentPersonalInfo');
      
      // Prepare updates object (only include changed fields)
      const updates = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] !== (studentData.profile?.[key] || '')) {
          updates[key] = formData[key];
        }
      });

      if (Object.keys(updates).length === 0) {
        toast.info('No changes to save');
        onCancel();
        return;
      }

      const result = await updateStudentPersonalInfo({
        studentEmailKey: studentData.studentKey,
        updates
      });

      if (result.data.success) {
        toast.success(result.data.message);
        
        // Update the parent component with new data
        const updatedStudentData = {
          ...studentData,
          profile: {
            ...studentData.profile,
            ...result.data.updatedData
          }
        };
        
        onUpdate(updatedStudentData);
      } else {
        throw new Error(result.data.message || 'Failed to update personal information');
      }
    } catch (err) {
      console.error('Error updating personal info:', err);
      setError(err.message || 'Failed to update personal information');
      toast.error('Failed to update personal information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-2">
        <User className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Edit Personal Information</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="Enter first name"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Enter last name"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredFirstName">Preferred First Name</Label>
            <Input
              id="preferredFirstName"
              value={formData.preferredFirstName}
              onChange={(e) => handleInputChange('preferredFirstName', e.target.value)}
              placeholder="Enter preferred name (optional)"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthday">Birthday</Label>
            <Input
              id="birthday"
              type="date"
              value={formData.birthday}
              onChange={(e) => handleInputChange('birthday', e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => handleInputChange('age', e.target.value)}
              placeholder="Enter age"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="StudentPhone">Phone Number</Label>
            <Input
              id="StudentPhone"
              type="tel"
              value={formData.StudentPhone}
              onChange={(e) => handleInputChange('StudentPhone', e.target.value)}
              placeholder="Enter phone number"
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoEditor;