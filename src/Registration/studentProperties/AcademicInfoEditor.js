import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Card, CardHeader, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Loader2, GraduationCap, Save, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import HomeSchoolSelector from '../../components/HomeSchoolSelector';
import SchoolAddressPicker from '../../components/SchoolAddressPicker';
import { getStudentRequirements, FIELD_IMPORTANCE } from './studentRequirements';

const AcademicInfoEditor = ({ studentData, onUpdate, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    asn: studentData.profile?.asn || ''
  });
  
  // Get primary school data from first course if available
  const firstCourse = studentData.courses?.[0];
  const [primarySchoolData, setPrimarySchoolData] = useState({
    name: firstCourse?.primarySchoolName || '',
    address: firstCourse?.primarySchoolAddress || '',
    placeId: firstCourse?.primarySchoolPlaceId || ''
  });
  
  // Get student type from the first course or studentType field
  const studentType = studentData.studentType?.Value || 
                     studentData.courses?.[0]?.StudentType?.Value || 
                     '';
  
  // Get requirements for this student
  const requirements = getStudentRequirements(studentData);
  const academicRequirements = requirements.academic || {};

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
      
      // Prepare updates object
      const updates = {};
      
      // Check ASN changes
      if (formData.asn !== (studentData.profile?.asn || '')) {
        updates.asn = formData.asn;
      }
      
      // Check primary school changes (only for Home Education and Non-Primary)
      if (requiresPrimarySchool) {
        if (primarySchoolData.name !== (firstCourse?.primarySchoolName || '') ||
            primarySchoolData.address !== (firstCourse?.primarySchoolAddress || '') ||
            primarySchoolData.placeId !== (firstCourse?.primarySchoolPlaceId || '')) {
          updates.primarySchool = primarySchoolData;
        }
      }

      if (Object.keys(updates).length === 0) {
        toast.info('No changes to save');
        onCancel();
        return;
      }

      const result = await updateStudentAcademicInfo({
        studentEmailKey: studentData.studentEmailKey,
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

  // Determine if fields are required based on student type
  
  const isHomeSchoolRequired = studentType === 'Home Education' || 
                              (academicRequirements.homeSchool?.importance === FIELD_IMPORTANCE.PASI_REQUIRED ||
                               academicRequirements.homeSchool?.importance === FIELD_IMPORTANCE.REQUIRED);
  
  const requiresPrimarySchool = studentType === 'Home Education' || studentType === 'Non-Primary';
  const shouldUseHomeSchoolSelector = studentType === 'Home Education';
  const shouldUseSchoolAddressPicker = studentType === 'Non-Primary';
  
  const handleSchoolSelect = (addressDetails) => {
    if (addressDetails) {
      setPrimarySchoolData({
        name: addressDetails.name,
        address: addressDetails.fullAddress,
        placeId: addressDetails.placeId
      });
    } else {
      setPrimarySchoolData({
        name: '',
        address: '',
        placeId: ''
      });
    }
  };

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
            <Label htmlFor="asn">
              Alberta Student Number (ASN)
              {academicRequirements.asn?.importance === FIELD_IMPORTANCE.PASI_REQUIRED && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
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


          {requiresPrimarySchool && (
            <div className="space-y-2">
              <Label htmlFor="primarySchool">
                {studentType === 'Home Education' ? 'Home Education Provider' : 'Primary School'}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              
              {shouldUseHomeSchoolSelector ? (
                <HomeSchoolSelector 
                  onAddressSelect={handleSchoolSelect}
                  initialValue={primarySchoolData.name ? {
                    name: primarySchoolData.name,
                    placeId: primarySchoolData.placeId
                  } : null}
                />
              ) : shouldUseSchoolAddressPicker ? (
                <SchoolAddressPicker 
                  onAddressSelect={handleSchoolSelect}
                  initialValue={primarySchoolData.name ? {
                    name: primarySchoolData.name,
                    placeId: primarySchoolData.placeId
                  } : null}
                />
              ) : null}
              
              <p className="text-sm text-gray-600">
                {studentType === 'Home Education' ? 
                  'Select your home education provider or organization' :
                  'Select your primary school (the school you normally attend)'}
              </p>
            </div>
          )}
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
        {/* Info alert for student type specific requirements */}
        {studentType && (
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>{studentType} Requirements:</strong>
              {studentType === 'Home Education' && (
                <span> Please select your home education provider from the search field.</span>
              )}
              {studentType === 'Non-Primary' && (
                <span> Please select your primary school (the school you normally attend) from the search field.</span>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default AcademicInfoEditor;