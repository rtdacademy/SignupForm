import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Card, CardHeader, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Label } from '../../components/ui/label';
import { Loader2, FileText, Upload, X, Check, Camera } from 'lucide-react';
import { toast } from 'sonner';

const DocumentsEditor = ({ studentData, onUpdate, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingDocument, setUploadingDocument] = useState(null);

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]; // Remove data:image/jpeg;base64, prefix
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const validateFile = (file) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      throw new Error('File must be PDF or image (jpg, jpeg, png)');
    }

    if (file.size > maxSize) {
      throw new Error('File must be less than 10MB');
    }
  };

  const handleStudentPhotoUpload = async (file) => {
    try {
      setUploadingDocument('studentPhoto');
      setError(null);

      validateFile(file);
      const fileData = await convertFileToBase64(file);

      const functions = getFunctions();
      const updateStudentDocuments = httpsCallable(functions, 'updateStudentDocuments');

      const result = await updateStudentDocuments({
        studentEmailKey: studentData.studentKey,
        documentType: 'studentPhoto',
        fileData,
        fileName: file.name
      });

      if (result.data.success) {
        toast.success('Student photo updated successfully');
        
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
        throw new Error(result.data.message || 'Failed to upload student photo');
      }
    } catch (err) {
      console.error('Error uploading student photo:', err);
      setError(err.message || 'Failed to upload student photo');
      toast.error('Failed to upload student photo');
    } finally {
      setUploadingDocument(null);
    }
  };

  const handleCitizenshipDocumentUpload = async (file, documentInfo) => {
    try {
      setUploadingDocument('citizenshipDocument');
      setError(null);

      validateFile(file);
      const fileData = await convertFileToBase64(file);

      const functions = getFunctions();
      const updateStudentDocuments = httpsCallable(functions, 'updateStudentDocuments');

      const result = await updateStudentDocuments({
        studentEmailKey: studentData.studentKey,
        documentType: 'citizenshipDocument',
        fileData,
        fileName: file.name,
        documentInfo
      });

      if (result.data.success) {
        toast.success('Citizenship document uploaded successfully');
        
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
        throw new Error(result.data.message || 'Failed to upload citizenship document');
      }
    } catch (err) {
      console.error('Error uploading citizenship document:', err);
      setError(err.message || 'Failed to upload citizenship document');
      toast.error('Failed to upload citizenship document');
    } finally {
      setUploadingDocument(null);
    }
  };

  const handleRemoveCitizenshipDocument = async (index) => {
    try {
      setLoading(true);
      setError(null);

      const functions = getFunctions();
      const updateStudentDocuments = httpsCallable(functions, 'updateStudentDocuments');

      const result = await updateStudentDocuments({
        studentEmailKey: studentData.studentKey,
        documentType: 'removeCitizenshipDocument',
        documentInfo: { index }
      });

      if (result.data.success) {
        toast.success('Document removed successfully');
        
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
        throw new Error(result.data.message || 'Failed to remove document');
      }
    } catch (err) {
      console.error('Error removing document:', err);
      setError(err.message || 'Failed to remove document');
      toast.error('Failed to remove document');
    } finally {
      setLoading(false);
    }
  };

  const documentTypes = [
    { value: 'birth-certificate', label: 'Birth Certificate' },
    { value: 'citizenship-certificate', label: 'Canadian Citizenship Certificate' },
    { value: 'citizenship-card', label: 'Canadian Citizenship Card' },
    { value: 'passport', label: 'Canadian Passport' },
    { value: 'visa', label: 'Visa' },
    { value: 'immigration-document', label: 'Immigration Document' },
    { value: 'other', label: 'Other' }
  ];

  const citizenshipDocuments = studentData.profile?.citizenshipDocuments || [];

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-2">
        <FileText className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Edit Documents</h3>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Student Photo Section */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Student Photo</Label>
          <div className="flex items-center gap-4">
            {studentData.profile?.studentPhoto && (
              <img
                src={studentData.profile.studentPhoto}
                alt="Student"
                className="w-16 h-16 object-cover rounded-lg border"
              />
            )}
            <div className="flex-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('student-photo-upload').click()}
                disabled={uploadingDocument === 'studentPhoto'}
                className="w-full sm:w-auto"
              >
                {uploadingDocument === 'studentPhoto' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4 mr-2" />
                )}
                {studentData.profile?.studentPhoto ? 'Update Photo' : 'Upload Photo'}
              </Button>
              <input
                id="student-photo-upload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) handleStudentPhotoUpload(file);
                }}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Citizenship Documents Section */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Citizenship Documents</Label>
          
          {/* Existing Documents */}
          {citizenshipDocuments.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Current Documents:</Label>
              {citizenshipDocuments.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <div>
                      <span className="text-sm font-medium">{doc.name || `Document ${index + 1}`}</span>
                      <p className="text-xs text-gray-500">{doc.typeLabel || doc.type}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveCitizenshipDocument(index)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Document */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Add New Citizenship Document</Label>
            <div className="flex gap-2">
              <select
                id="document-type-select"
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                defaultValue=""
                disabled={uploadingDocument === 'citizenshipDocument'}
              >
                <option value="">Select document type</option>
                {documentTypes.map((docType) => (
                  <option key={docType.value} value={docType.value}>
                    {docType.label}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const select = document.getElementById('document-type-select');
                  const selectedType = select.value;
                  if (!selectedType) {
                    setError('Please select a document type first');
                    return;
                  }
                  document.getElementById('citizenship-doc-upload').click();
                }}
                disabled={uploadingDocument === 'citizenshipDocument'}
              >
                {uploadingDocument === 'citizenshipDocument' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload
              </Button>
              <input
                id="citizenship-doc-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files[0];
                  const select = document.getElementById('document-type-select');
                  const selectedType = select.value;
                  
                  if (file && selectedType) {
                    const documentInfo = {
                      type: selectedType,
                      typeLabel: documentTypes.find(dt => dt.value === selectedType)?.label || selectedType
                    };
                    handleCitizenshipDocumentUpload(file, documentInfo);
                  }
                }}
                className="hidden"
              />
            </div>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-800 text-sm">
              <strong>Acceptable documents:</strong> Birth Certificate, Canadian Citizenship Certificate/Card, 
              Canadian Passport, Visa, or other immigration documents supporting lawful admittance to Canada.
            </AlertDescription>
          </Alert>
        </div>

        <div className="text-sm text-gray-600">
          <p><strong>Requirements:</strong></p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>PDF or image format (JPEG, PNG)</li>
            <li>Maximum file size: 10MB per file</li>
            <li>Clear, readable copies of official documents</li>
            <li>Documents are securely stored and encrypted</li>
          </ul>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading || uploadingDocument}
          >
            <X className="h-4 w-4 mr-2" />
            Done
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentsEditor;