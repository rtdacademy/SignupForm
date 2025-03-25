import React, { forwardRef, useState } from 'react';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Alert, AlertDescription } from "../components/ui/alert";
import { Card, CardHeader, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { AlertTriangle, Upload, Check, Loader2 } from "lucide-react";
import { useAuth } from '../context/AuthContext';

const InternationalDocuments = forwardRef(({ onUploadComplete, initialDocuments = {} }, ref) => {
  const { user, user_email_key } = useAuth();
  const [uploadStatus, setUploadStatus] = useState({
    passport: initialDocuments.passport ? 'completed' : null,
    additionalID: initialDocuments.additionalID ? 'completed' : null,
    residencyProof: initialDocuments.residencyProof ? 'completed' : null
  });
  const [error, setError] = useState(null);

  const handleFileSelect = async (type, file) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError(`${type} must be a PDF or image file (jpg, jpeg, png)`);
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(`${type} must be less than 5MB`);
      return;
    }

    try {
      setError(null);
      setUploadStatus(prev => ({
        ...prev,
        [type]: 'uploading'
      }));

      const downloadURL = await uploadFile(type, file);
      
      if (downloadURL) {
        setUploadStatus(prev => ({
          ...prev,
          [type]: 'completed'
        }));
        onUploadComplete(type, downloadURL);
      }
    } catch (err) {
      console.error(`Error uploading ${type}:`, err);
      setError(`Failed to upload ${type}: ${err.message}`);
      setUploadStatus(prev => ({
        ...prev,
        [type]: 'error'
      }));
    }
  };

  const uploadFile = async (type, file) => {
    if (!file || !user?.uid) {
      setError("User authentication required");
      return null;
    }

    const storage = getStorage();
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const fileName = `${timestamp}-${type}.${fileExtension}`;
    const filePath = `rtdAcademy/international/${user.uid}/${fileName}`;
    const fileRef = storageRef(storage, filePath);

    try {
      const snapshot = await uploadBytes(fileRef, file);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error('Error during file upload:', error);
      throw new Error(error.message);
    }
  };

  const getUploadStatus = (type) => {
    if (uploadStatus[type] === 'uploading') {
      return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    }
    if (uploadStatus[type] === 'completed') {
      return <Check className="h-5 w-5 text-green-500" />;
    }
    if (uploadStatus[type] === 'error') {
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
    return null;
  };

  const renderUploadField = (type, label, required = true) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById(type).click()}
          className="flex items-center gap-2"
          disabled={uploadStatus[type] === 'uploading'}
        >
          <Upload className="h-4 w-4" />
          {uploadStatus[type] === 'completed' ? 'Upload New File' : 'Choose File'}
        </Button>
        <input
          id={type}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => handleFileSelect(type, e.target.files[0])}
        />
        <div className="flex items-center gap-2">
          {getUploadStatus(type)}
          {uploadStatus[type] === 'completed' && (
            <span className="text-sm text-green-600">Document uploaded successfully</span>
          )}
          {uploadStatus[type] === 'uploading' && (
            <span className="text-sm text-blue-600">Uploading document...</span>
          )}
        </div>
      </div>
      {initialDocuments[type] && !uploadStatus[type] && (
        <p className="text-sm text-green-600">Previous document already uploaded</p>
      )}
    </div>
  );

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md hover:shadow-lg transition-all duration-200 border-t-4 border-t-blue-400">
      <CardHeader>
        <h3 className="text-md font-semibold">Required Documents</h3>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert className="bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-sm text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {renderUploadField('passport', 'Passport')}
          {renderUploadField('additionalID', 'Additional ID (Birth Certificate or National ID Card)')}
          {renderUploadField('residencyProof', 'Proof of Residency (Study Permit/Work Permit)', false)}
        </div>

        <div className="text-sm text-gray-600">
          <p>Please note:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>All documents must be in PDF or image format (jpg, jpeg, png)</li>
            <li>Maximum file size is 5MB per document</li>
            <li>Ensure all documents are clear and readable</li>
            <li>Documents are securely stored and encrypted</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
});

InternationalDocuments.displayName = 'InternationalDocuments';

export default InternationalDocuments;