import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Card, CardHeader, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Label } from '../../components/ui/label';
import { Loader2, FileText, Upload, Check, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

/**
 * RestrictedDocumentsEditor - A restricted version of DocumentsEditor for post-registration use
 * Only allows adding missing citizenship documents, not modifying existing ones
 */
const RestrictedDocumentsEditor = ({ studentData, onUpdate, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingDocument, setUploadingDocument] = useState(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState('');

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
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
        documentInfo: {
          ...documentInfo,
          uploadedPostRegistration: true,
          uploadDate: new Date().toISOString()
        }
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
      setSelectedDocumentType('');
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
  const isInternationalStudent = studentData.studentType?.Value === 'International Student';

  // Don't show for international students
  if (isInternationalStudent) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-800">
              Citizenship documents are not required for international students.
            </AlertDescription>
          </Alert>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={onCancel}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-2">
        <FileText className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Upload Missing Documents</h3>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700">
            <p className="font-medium mb-1">Important:</p>
            <ul className="list-disc pl-5 text-sm">
              <li>You can only add missing documents</li>
              <li>Previously submitted documents cannot be modified or removed</li>
              <li>If you need to correct a document, please contact support</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Existing Documents - Read Only */}
        {citizenshipDocuments.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Existing Documents:</Label>
            {citizenshipDocuments.map((doc, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Check className="h-4 w-4 text-green-500" />
                <div className="flex-1">
                  <span className="text-sm font-medium">{doc.name || `Document ${index + 1}`}</span>
                  <p className="text-xs text-gray-500">
                    {doc.typeLabel || doc.type}
                    {doc.uploadedPostRegistration && ' • Added after registration'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add New Document */}
        {citizenshipDocuments.length === 0 ? (
          <div className="space-y-4">
            <Alert className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                <p className="font-medium">Missing Required Documentation</p>
                <p className="text-sm mt-1">Please upload at least one citizenship document to complete your profile.</p>
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Select Document Type <span className="text-red-500">*</span></Label>
              
              {/* Document Type Selection */}
              <select
                value={selectedDocumentType}
                onChange={(e) => setSelectedDocumentType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={uploadingDocument === 'citizenshipDocument'}
              >
                <option value="">Select document type</option>
                {documentTypes.map((docType) => (
                  <option key={docType.value} value={docType.value}>
                    {docType.label}
                  </option>
                ))}
              </select>
              
              {/* Upload Button */}
              <Button
                type="button"
                variant="default"
                onClick={() => {
                  if (!selectedDocumentType) {
                    setError('Please select a document type first');
                    return;
                  }
                  document.getElementById('citizenship-doc-upload').click();
                }}
                disabled={uploadingDocument === 'citizenshipDocument' || !selectedDocumentType}
                className="w-full"
              >
                {uploadingDocument === 'citizenshipDocument' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File to Upload
                  </>
                )}
              </Button>
              
              <input
                id="citizenship-doc-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files[0];
                  
                  if (file && selectedDocumentType) {
                    const documentInfo = {
                      type: selectedDocumentType,
                      typeLabel: documentTypes.find(dt => dt.value === selectedDocumentType)?.label || selectedDocumentType
                    };
                    handleCitizenshipDocumentUpload(file, documentInfo);
                  }
                }}
                className="hidden"
              />
              
              {!selectedDocumentType && (
                <p className="text-sm text-gray-500">Please select a document type before uploading</p>
              )}
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-800 text-sm">
                <strong>Acceptable documents:</strong> Birth Certificate, Canadian Citizenship Certificate/Card, 
                Canadian Passport, Visa, or other immigration documents supporting lawful admittance to Canada.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <Alert className="bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Document requirement satisfied. You have {citizenshipDocuments.length} document{citizenshipDocuments.length > 1 ? 's' : ''} on file.
            </AlertDescription>
          </Alert>
        )}

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
            {citizenshipDocuments.length > 0 ? 'Close' : 'Cancel'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RestrictedDocumentsEditor;