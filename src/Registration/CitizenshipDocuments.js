import React, { forwardRef, useState, useRef, useCallback } from 'react';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Alert, AlertDescription } from "../components/ui/alert";
import { Card, CardHeader, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { AlertTriangle, Upload, Check, Loader2, FileText, X, Camera } from "lucide-react";
import { useAuth } from '../context/AuthContext';

const CitizenshipDocuments = forwardRef(({ 
  onUploadComplete, 
  initialDocuments = [], 
  error: externalError,
  familyId = null,
  studentId = null,
  saveToStudentProfile = false
}, ref) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState(initialDocuments);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [error, setError] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Separate existing documents from new ones
  const existingDocuments = documents.filter(doc => doc.fromProfile);
  const newDocuments = documents.filter(doc => !doc.fromProfile);

  // Document type options - organized by category and matching PASI system
  const documentTypes = [
    // Birth Certificates
    { value: 'alberta_birth_certificate', label: 'Alberta Birth Certificate', category: 'Birth Certificates' },
    { value: 'canadian_birth_certificate', label: 'Canadian Birth Certificate (Other Province/Territory)', category: 'Birth Certificates', helper: 'For BC, Ontario, Quebec, or any other Canadian province' },
    { value: 'foreign_birth_certificate', label: 'Foreign Birth Certificate', category: 'Birth Certificates', helper: 'Non-Canadian birth certificate' },
    
    // Canadian Citizenship
    { value: 'canadian_citizenship_certificate', label: 'Canadian Citizenship Certificate', category: 'Canadian Citizenship' },
    { value: 'canadian_citizenship_card', label: 'Canadian Citizenship Card', category: 'Canadian Citizenship' },
    { value: 'canadian_passport', label: 'Canadian Passport', category: 'Canadian Citizenship' },
    { value: 'temporary_declaration_of_citizenship', label: 'Temporary Declaration of Citizenship', category: 'Canadian Citizenship' },
    
    // Immigration Documents
    { value: 'canadian_permanent_resident_card', label: 'Permanent Resident Card (PR Card)', category: 'Immigration Documents' },
    { value: 'canadian_study_permit', label: 'Study Permit', category: 'Immigration Documents' },
    { value: 'canadian_work_permit', label: 'Work Permit', category: 'Immigration Documents' },
    { value: 'canadian_temporary_resident_visa', label: 'Temporary Resident Visa', category: 'Immigration Documents' },
    { value: 'confirmation_of_permanent_residence', label: 'Confirmation of Permanent Residence', category: 'Immigration Documents' },
    { value: 'canadian_refugee_protection_claimant', label: 'Refugee Protection Claimant Document', category: 'Immigration Documents' },
    { value: 'application_permanent_temporary_residence', label: 'Application for Permanent/Temporary Residence', category: 'Immigration Documents' },
    { value: 'proof_of_application_status', label: 'Proof of Application Status', category: 'Immigration Documents' },
    
    // Indigenous Status
    { value: 'canadian_certificate_of_indian_status', label: 'Status Card', category: 'Indigenous Status' },
    { value: 'treaty_card', label: 'Treaty Card', category: 'Indigenous Status' },
    
    // Other Documents
    { value: 'foreign_passport', label: 'Foreign Passport', category: 'Other Documents', helper: 'Must include visa or legal status' },
    { value: 'consulate_visa', label: 'Consulate Visa', category: 'Other Documents' },
    { value: 'visa', label: 'Visa', category: 'Other Documents' }
  ];

  const handleFileSelect = async (files, documentType = null) => {
    if (!files || files.length === 0) return;

    // Use provided documentType or selectedDocumentType
    const docType = documentType || selectedDocumentType;
    if (!docType) {
      setError('Please select a document type before uploading');
      return;
    }

    // Convert FileList to Array
    const fileArray = Array.from(files);
    
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      
      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setError(`${file.name} must be a PDF or image file (jpg, jpeg, png)`);
        continue;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} must be less than 5MB`);
        continue;
      }

      try {
        setError(null);
        setUploadingIndex(documents.length + i);

        const downloadURL = await uploadFile(file, docType);
        
        if (downloadURL) {
          const newDoc = {
            url: downloadURL,
            name: file.name,
            type: docType,
            typeLabel: documentTypes.find(dt => dt.value === docType)?.label || docType,
            uploadedAt: new Date().toISOString()
          };
          
          setDocuments(prev => {
            const updated = [...prev, newDoc];
            onUploadComplete('citizenshipDocuments', updated);
            return updated;
          });
        }
      } catch (err) {
        console.error(`Error uploading ${file.name}:`, err);
        setError(`Failed to upload ${file.name}: ${err.message}`);
      } finally {
        setUploadingIndex(null);
      }
    }
  };

  const uploadFile = async (file, documentType) => {
    if (!file || !user?.uid) {
      setError("User authentication required");
      return null;
    }

    const storage = getStorage();
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const fileName = `${timestamp}-${documentType}.${fileExtension}`;
    const filePath = `rtdAcademy/citizenshipDocs/${user.uid}/${fileName}`;
    const fileRef = storageRef(storage, filePath);

    try {
      const snapshot = await uploadBytes(fileRef, file);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error('Error during file upload:', error);
      throw new Error(error.message);
    }
  };

  const handleRemoveDocument = (index) => {
    setDocuments(prev => {
      const updated = prev.filter((_, i) => i !== index);
      onUploadComplete('citizenshipDocuments', updated);
      return updated;
    });
  };

  // Camera functions for document capture
  const startCamera = async () => {
    if (!selectedDocumentType) {
      setError('Please select a document type before using the camera');
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera if available (better for documents)
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }, 
        audio: false 
      });
      setStream(mediaStream);
      setShowCamera(true);
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
  }, [stream]);

  const captureDocument = async () => {
    if (!videoRef.current || !canvasRef.current || !selectedDocumentType) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob with higher quality for documents
    canvas.toBlob(async (blob) => {
      if (blob) {
        // Create a file from the blob
        const timestamp = Date.now();
        const file = new File([blob], `${selectedDocumentType}-${timestamp}.jpg`, { type: 'image/jpeg' });
        
        // Stop camera
        stopCamera();
        
        // Process the file with the selected document type
        await handleFileSelect([file], selectedDocumentType);
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

  const displayError = externalError || error;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
      <CardHeader className="pb-3">
        <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Citizenship Verification <span className="text-red-500">*</span>
        </h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-800">
            {existingDocuments.length > 0 ? (
              <>
                <p className="font-medium mb-2">You have previously uploaded citizenship documents. You may add additional documents if needed.</p>
                <p className="mb-2"><strong>Required for Alberta school registration:</strong> Upload clear copies of ONE of the following documents:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li><strong>Birth Certificate:</strong> From ANY Canadian province/territory (Alberta, BC, Ontario, Quebec, etc.) - all are accepted</li>
                  <li><strong>Canadian Citizenship Certificate or Card:</strong> For naturalized Canadian citizens</li>
                  <li><strong>Canadian Passport:</strong> Valid passport showing Canadian citizenship</li>
                  <li><strong>Indigenous Status Documents:</strong> Status Card or Treaty Card</li>
                  <li><strong>Immigration Documents:</strong> PR card, study/work permit, or other documents showing legal status in Canada</li>
                </ul>
                <p className="mt-2 text-sm italic">Note: Schools require these documents to verify your child's eligibility for enrollment under Alberta Education regulations.</p>
              </>
            ) : (
              <>
                <p className="font-medium mb-2"><strong>Required for Alberta school registration:</strong> Upload clear copies of ONE of the following documents:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Birth Certificate:</strong> From ANY Canadian province/territory (Alberta, BC, Ontario, Quebec, etc.) - all are accepted</li>
                  <li><strong>Canadian Citizenship Certificate or Card:</strong> For naturalized Canadian citizens</li>
                  <li><strong>Canadian Passport:</strong> Valid passport showing Canadian citizenship</li>
                  <li><strong>Indigenous Status Documents:</strong> Status Card or Treaty Card</li>
                  <li><strong>Immigration Documents:</strong> PR card, study/work permit, or other documents showing legal status in Canada</li>
                </ul>
                <p className="mt-3 text-sm italic">Note: Schools require these documents to verify your child's eligibility for enrollment under Alberta Education regulations.</p>
              </>
            )}
          </AlertDescription>
        </Alert>

        {displayError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{displayError}</AlertDescription>
          </Alert>
        )}

        {/* Document Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Document Type <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedDocumentType}
            onChange={(e) => setSelectedDocumentType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select document type</option>
            
            {/* Group documents by category */}
            {Object.entries(
              documentTypes.reduce((groups, docType) => {
                const category = docType.category || 'Other';
                if (!groups[category]) groups[category] = [];
                groups[category].push(docType);
                return groups;
              }, {})
            ).map(([category, types]) => (
              <optgroup key={category} label={category}>
                {types.map((docType) => (
                  <option key={docType.value} value={docType.value}>
                    {docType.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          
          {/* Helper text for selected document type */}
          {selectedDocumentType && (() => {
            const selected = documentTypes.find(dt => dt.value === selectedDocumentType);
            return selected?.helper ? (
              <p className="text-xs text-gray-600 mt-1">
                <span className="font-medium">Note:</span> {selected.helper}
              </p>
            ) : null;
          })()}
        </div>

        {/* Existing Documents from Profile */}
        {existingDocuments.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Previously Uploaded Documents:</p>
            {existingDocuments.map((doc, index) => (
              <div key={`existing-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">{doc.name || `Document ${index + 1}`}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">From Profile</span>
                  </div>
                  <span className="text-xs text-gray-500 ml-6">{doc.typeLabel || doc.type}</span>
                </div>
                <div className="text-xs text-gray-500">Cannot be removed</div>
              </div>
            ))}
          </div>
        )}
        
        {/* New Documents */}
        {newDocuments.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">{existingDocuments.length > 0 ? 'Additional Documents:' : 'Uploaded Documents:'}</p>
            {newDocuments.map((doc, index) => {
              const actualIndex = existingDocuments.length + index;
              return (
                <div key={`new-${index}`} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700">{doc.name || `Document ${actualIndex + 1}`}</span>
                    </div>
                    <span className="text-xs text-gray-500 ml-6">{doc.typeLabel || doc.type}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveDocument(actualIndex)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Upload Options */}
        {!showCamera && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-blue-300 hover:bg-blue-50 flex-1"
                disabled={uploadingIndex !== null || !selectedDocumentType}
                onClick={() => document.getElementById('citizenship-upload-input').click()}
              >
                {uploadingIndex !== null ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {existingDocuments.length > 0 ? 'Add More Files' : 'Choose Files'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="border-blue-300 hover:bg-blue-50 flex-1"
                disabled={uploadingIndex !== null || !selectedDocumentType}
                onClick={startCamera}
              >
                <Camera className="h-4 w-4 mr-2" />
                {existingDocuments.length > 0 ? 'Add with Camera' : 'Use Camera'}
              </Button>
            </div>
            {!selectedDocumentType && (
              <p className="text-sm text-gray-500">Please select a document type to upload or capture documents</p>
            )}
            <input
              id="citizenship-upload-input"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              multiple
              disabled={uploadingIndex !== null}
            />
          </div>
        )}

        {/* Camera View */}
        {showCamera && (
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-800">
                Position your document within the camera view. Make sure the text is clear and readable, and all edges of the document are visible.
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
              
              {/* Document capture overlay guide */}
              <div className="absolute inset-4 border-2 border-white border-dashed rounded-lg pointer-events-none opacity-70">
                <div className="absolute top-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                  Align document within this area
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <Button
                type="button"
                variant="default"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={captureDocument}
              >
                <Camera className="h-4 w-4 mr-2" />
                Capture Document
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

        <div className="text-sm text-gray-600">
          <p>Requirements:</p>
          <ul className="list-disc pl-5 mt-1">
            <li>PDF or image format (JPEG, PNG)</li>
            <li>Maximum file size: 5MB per file</li>
            <li>Clear, readable copies of official documents</li>
            <li>You can upload multiple documents if needed</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
});

CitizenshipDocuments.displayName = 'CitizenshipDocuments';

export default CitizenshipDocuments;