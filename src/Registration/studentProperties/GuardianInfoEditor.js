import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Card, CardHeader, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Loader2, Users, Save, X } from 'lucide-react';
import { toast } from 'sonner';

const GuardianInfoEditor = ({ studentData, onUpdate, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    ParentEmail: studentData.profile?.ParentEmail || '',
    'ParentPhone_x0023_': studentData.profile?.['ParentPhone_x0023_'] || '',
    ParentFirstName: studentData.profile?.ParentFirstName || '',
    ParentLastName: studentData.profile?.ParentLastName || '',
    parentRelationship: studentData.profile?.parentRelationship || '',
    isLegalGuardian: studentData.profile?.isLegalGuardian || false
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const validateForm = () => {
    if (formData.ParentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ParentEmail)) {
      setError('Please enter a valid email address');
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
      const updateGuardianInfo = httpsCallable(functions, 'updateGuardianInfo');
      
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

      const result = await updateGuardianInfo({
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
        throw new Error(result.data.message || 'Failed to update guardian information');
      }
    } catch (err) {
      console.error('Error updating guardian info:', err);
      setError(err.message || 'Failed to update guardian information');
      toast.error('Failed to update guardian information');
    } finally {
      setLoading(false);
    }
  };

  const relationships = [
    'Mother', 'Father', 'Guardian', 'Grandmother', 'Grandfather',
    'Aunt', 'Uncle', 'Stepmother', 'Stepfather', 'Foster Parent', 'Other'
  ];

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-2">
        <Users className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Edit Guardian Information</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ParentFirstName">First Name</Label>
              <Input
                id="ParentFirstName"
                value={formData.ParentFirstName}
                onChange={(e) => handleInputChange('ParentFirstName', e.target.value)}
                placeholder="Enter first name"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ParentLastName">Last Name</Label>
              <Input
                id="ParentLastName"
                value={formData.ParentLastName}
                onChange={(e) => handleInputChange('ParentLastName', e.target.value)}
                placeholder="Enter last name"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ParentEmail">Email Address</Label>
            <Input
              id="ParentEmail"
              type="email"
              value={formData.ParentEmail}
              onChange={(e) => handleInputChange('ParentEmail', e.target.value)}
              placeholder="Enter email address"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ParentPhone_x0023_">Phone Number</Label>
            <Input
              id="ParentPhone_x0023_"
              type="tel"
              value={formData['ParentPhone_x0023_']}
              onChange={(e) => handleInputChange('ParentPhone_x0023_', e.target.value)}
              placeholder="Enter phone number"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentRelationship">Relationship to Student</Label>
            <select
              id="parentRelationship"
              value={formData.parentRelationship}
              onChange={(e) => handleInputChange('parentRelationship', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">Select relationship</option>
              {relationships.map(relationship => (
                <option key={relationship} value={relationship}>
                  {relationship}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="isLegalGuardian"
              type="checkbox"
              checked={formData.isLegalGuardian}
              onChange={(e) => handleInputChange('isLegalGuardian', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={loading}
            />
            <Label htmlFor="isLegalGuardian" className="text-sm">
              I am the legal guardian of this student
            </Label>
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

export default GuardianInfoEditor;