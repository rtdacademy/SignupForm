import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Card, CardHeader, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Loader2, GraduationCap, Save, X } from 'lucide-react';
import { toast } from 'sonner';

const AcademicInfoEditor = ({ studentData, onUpdate, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    asn: studentData.profile?.asn || '',
    grade: studentData.profile?.grade || '',
    homeSchool: studentData.profile?.homeSchool || ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const validateForm = () => {
    if (formData.asn) {
      // Validate ASN format (####-####-#)
      const asnPattern = /^\d{4}-\d{4}-\d$/;
      if (!asnPattern.test(formData.asn)) {
        setError('ASN must be in format ####-####-# (e.g., 1234-5678-9)');
        return false;
      }
    }
    return true;
  };

  const formatASN = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as ####-####-#
    if (digits.length <= 4) {
      return digits;
    } else if (digits.length <= 8) {
      return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    } else {
      return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 9)}`;
    }
  };

  const handleASNChange = (value) => {
    const formatted = formatASN(value);
    handleInputChange('asn', formatted);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      const functions = getFunctions();
      const updateStudentAcademicInfo = httpsCallable(functions, 'updateStudentAcademicInfo');
      
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

      const result = await updateStudentAcademicInfo({
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
        throw new Error(result.data.message || 'Failed to update academic information');
      }
    } catch (err) {
      console.error('Error updating academic info:', err);
      setError(err.message || 'Failed to update academic information');
      toast.error('Failed to update academic information');
    } finally {
      setLoading(false);
    }
  };

  const grades = [
    'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'
  ];

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-2">
        <GraduationCap className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Edit Academic Information</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="asn">Alberta Student Number (ASN)</Label>
            <Input
              id="asn"
              value={formData.asn}
              onChange={(e) => handleASNChange(e.target.value)}
              placeholder="Enter ASN (e.g., 1234-5678-9)"
              disabled={loading}
              maxLength={11}
              className="w-full md:w-48"
            />
            <p className="text-sm text-gray-600">
              The 9-digit number found on report cards and official documents
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">Grade Level</Label>
            <select
              id="grade"
              value={formData.grade}
              onChange={(e) => handleInputChange('grade', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">Select grade level</option>
              {grades.map(grade => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="homeSchool">Home School</Label>
            <Input
              id="homeSchool"
              value={formData.homeSchool}
              onChange={(e) => handleInputChange('homeSchool', e.target.value)}
              placeholder="Enter home school name"
              disabled={loading}
            />
            <p className="text-sm text-gray-600">
              The student's primary or home school (if applicable)
            </p>
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

export default AcademicInfoEditor;