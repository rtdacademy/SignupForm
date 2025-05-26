import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Card, CardHeader, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Label } from '../../components/ui/label';
import { Loader2, Flag, Save, X } from 'lucide-react';
import { toast } from 'sonner';

const StatusEditor = ({ studentData, onUpdate, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    albertaResident: studentData.profile?.albertaResident || false,
    indigenousIdentification: studentData.profile?.indigenousIdentification || '',
    indigenousStatus: studentData.profile?.indigenousStatus || ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      const functions = getFunctions();
      const updateStudentStatus = httpsCallable(functions, 'updateStudentStatus');
      
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

      const result = await updateStudentStatus({
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
        throw new Error(result.data.message || 'Failed to update status information');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.message || 'Failed to update status information');
      toast.error('Failed to update status information');
    } finally {
      setLoading(false);
    }
  };

  const indigenousOptions = [
    'First Nations', 'Métis', 'Inuit', 'Not Indigenous'
  ];

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-2">
        <Flag className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Edit Status Information</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base font-medium">Alberta Residency</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  id="albertaResident-yes"
                  type="radio"
                  name="albertaResident"
                  checked={formData.albertaResident === true}
                  onChange={() => handleInputChange('albertaResident', true)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  disabled={loading}
                />
                <Label htmlFor="albertaResident-yes" className="text-sm">
                  Yes, I am an Alberta resident
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="albertaResident-no"
                  type="radio"
                  name="albertaResident"
                  checked={formData.albertaResident === false}
                  onChange={() => handleInputChange('albertaResident', false)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  disabled={loading}
                />
                <Label htmlFor="albertaResident-no" className="text-sm">
                  No, I am not an Alberta resident
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="indigenousStatus" className="text-base font-medium">
              Indigenous Status
            </Label>
            <select
              id="indigenousStatus"
              value={formData.indigenousStatus}
              onChange={(e) => handleInputChange('indigenousStatus', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">Select status</option>
              {indigenousOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="indigenousIdentification" className="text-base font-medium">
              Indigenous Identification
            </Label>
            <select
              id="indigenousIdentification"
              value={formData.indigenousIdentification}
              onChange={(e) => handleInputChange('indigenousIdentification', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">Select identification</option>
              <option value="Yes, I identify as Indigenous">Yes, I identify as Indigenous</option>
              <option value="No, I do not identify as Indigenous">No, I do not identify as Indigenous</option>
              <option value="Prefer not to answer">Prefer not to answer</option>
            </select>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This information is used for statistical purposes and to ensure 
            appropriate educational support and cultural considerations are provided.
          </p>
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

export default StatusEditor;