import React, { useState, useRef, useCallback } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Card, CardHeader, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Label } from '../../components/ui/label';
import { Loader2, FileText, Upload, X, Check, Camera, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const DocumentsEditor = ({ studentData, onUpdate, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingDocument, setUploadingDocument] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [cameraMode, setCameraMode] = useState(''); // 'photo' or 'citizenship'
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

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

  // Camera functions for document capture
  const startCamera = async (mode) => {
    if (mode === 'citizenship' && !selectedDocumentType) {
      setError('Please select a document type before using the camera');
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: mode === 'photo' ? 'user' : 'environment', // Use front camera for photos, back for documents
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }, 
        audio: false 
      });
      setStream(mediaStream);
      setShowCamera(true);
      setCameraMode(mode);
      setError(null);
      
      // Wait for video element to be ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please ensure camera permissions are granted.');
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
    setCameraMode('');
  }, [stream]);

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (blob) {
        const timestamp = Date.now();
        let file;
        
        if (cameraMode === 'photo') {
          file = new File([blob], `student-photo-${timestamp}.jpg`, { type: 'image/jpeg' });
          stopCamera();
          await handleStudentPhotoUpload(file);
        } else if (cameraMode === 'citizenship' && selectedDocumentType) {
          file = new File([blob], `${selectedDocumentType}-${timestamp}.jpg`, { type: 'image/jpeg' });
          const documentInfo = {
            type: selectedDocumentType,
            typeLabel: documentTypes.find(dt => dt.value === selectedDocumentType)?.label || selectedDocumentType
          };
          stopCamera();
          await handleCitizenshipDocumentUpload(file, documentInfo);
        }
      }
    }, 'image/jpeg', 0.95);
  };

  // Cleanup camera on unmount
  React.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const citizenshipDocuments = studentData.profile?.citizenshipDocuments || [];
  const internationalDocuments = studentData.profile?.internationalDocuments || [];
  const isInternationalStudent = studentData.studentType?.Value === 'International Student' || 
    (studentData.courses && studentData.courses.length > 0 && studentData.courses[0].StudentType?.Value === 'International Student');

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
        {!showCamera && (
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
              <div className="flex gap-2 flex-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('student-photo-upload').click()}
                  disabled={uploadingDocument === 'studentPhoto'}
                  className="flex-1"
                >
                  {uploadingDocument === 'studentPhoto' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {studentData.profile?.studentPhoto ? 'Update Photo' : 'Upload Photo'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => startCamera('photo')}
                  disabled={uploadingDocument === 'studentPhoto'}
                  className="flex-1"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Use Camera
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
        )}

        {/* International Documents Section - Only show for international students */}
        {isInternationalStudent && !showCamera && (
          <div className="space-y-4">
            <Label className="text-base font-medium">International Student Documents <span className="text-red-500">*</span></Label>
            
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-800">
                Please upload <strong>ONE</strong> of the following documents:
                <ul className="list-disc pl-5 mt-2">
                  <li>Valid Passport</li>
                  <li>Birth Certificate or National ID Card</li>
                  <li>Study Permit or Work Permit</li>
                  <li>Other Government Issued ID</li>
                </ul>
                <p className="mt-2 font-medium">Note: Only one document is required for verification.</p>
              </AlertDescription>
            </Alert>
            
            {/* Existing International Documents */}
            {internationalDocuments.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Current Documents:</Label>
                {internationalDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700">{doc.name || `Document ${index + 1}`}</span>
                      </div>
                      <span className="text-xs text-gray-500 ml-6">{doc.typeLabel || doc.type}</span>
                    </div>
                  </div>
                ))}
                <Alert className="bg-green-50 border-green-200">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Document requirement satisfied. You have uploaded {internationalDocuments.length} document{internationalDocuments.length > 1 ? 's' : ''}.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        )}

        {/* Citizenship Documents Section - Only show for non-international students */}
        {!isInternationalStudent && !showCamera && (
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
              
              {/* Document Type Selection */}
              <div className="space-y-2">
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
              </div>
              
              {/* Upload Options */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (!selectedDocumentType) {
                      setError('Please select a document type first');
                      return;
                    }
                    document.getElementById('citizenship-doc-upload').click();
                  }}
                  disabled={uploadingDocument === 'citizenshipDocument' || !selectedDocumentType}
                  className="flex-1"
                >
                  {uploadingDocument === 'citizenshipDocument' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Choose File
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => startCamera('citizenship')}
                  disabled={uploadingDocument === 'citizenshipDocument' || !selectedDocumentType}
                  className="flex-1"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Use Camera
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
              </div>
              {!selectedDocumentType && (
                <p className="text-sm text-gray-500">Please select a document type to upload or capture documents</p>
              )}
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-800 text-sm">
                <strong>Acceptable documents:</strong> Birth Certificate, Canadian Citizenship Certificate/Card, 
                Canadian Passport, Visa, or other immigration documents supporting lawful admittance to Canada.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Camera View */}
        {showCamera && (
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-800">
                {cameraMode === 'photo' 
                  ? 'Position yourself in the center of the camera view. Make sure your face is clearly visible.'
                  : 'Position your document within the camera view. Make sure the text is clear and readable, and all edges of the document are visible.'
                }
              </AlertDescription>
            </Alert>
            
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline
                className="w-full max-w-2xl mx-auto"
                style={{ aspectRatio: '16/9' }}
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Overlay guide */}
              {cameraMode === 'citizenship' && (
                <div className="absolute inset-4 border-2 border-white border-dashed rounded-lg pointer-events-none opacity-70">
                  <div className="absolute top-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                    Align document within this area
                  </div>
                </div>
              )}
              {cameraMode === 'photo' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-white border-dashed rounded-full opacity-70">
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                      Position face here
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <Button
                type="button"
                variant="default"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={captureImage}
              >
                <Camera className="h-4 w-4 mr-2" />
                {cameraMode === 'photo' ? 'Take Photo' : 'Capture Document'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={stopCamera}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {!showCamera && (
          <div className="text-sm text-gray-600">
            <p><strong>Requirements:</strong></p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>PDF or image format (JPEG, PNG)</li>
              <li>Maximum file size: 10MB per file</li>
              <li>Clear, readable copies of official documents</li>
              <li>Documents are securely stored and encrypted</li>
            </ul>
          </div>
        )}

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