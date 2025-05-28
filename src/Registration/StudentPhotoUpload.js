import React, { forwardRef, useState, useRef, useCallback } from 'react';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Alert, AlertDescription } from "../components/ui/alert";
import { Card, CardHeader, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { AlertTriangle, Upload, Check, Loader2, Camera, X } from "lucide-react";
import { useAuth } from '../context/AuthContext';

const StudentPhotoUpload = forwardRef(({ onUploadComplete, initialPhoto = null, error: externalError }, ref) => {
  const { user } = useAuth();
  const [uploadStatus, setUploadStatus] = useState(initialPhoto ? 'completed' : null);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(initialPhoto);
  const [fileName, setFileName] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Photo must be a JPEG or PNG file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Photo must be less than 10MB');
      return;
    }

    try {
      setError(null);
      setUploadStatus('uploading');
      setFileName(file.name);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      const downloadURL = await uploadFile(file);
      
      if (downloadURL) {
        setUploadStatus('completed');
        onUploadComplete('studentPhoto', downloadURL);
      }
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError(`Failed to upload photo: ${err.message}`);
      setUploadStatus('error');
    }
  };

  const uploadFile = async (file) => {
    if (!file || !user?.uid) {
      setError("User authentication required");
      return null;
    }

    const storage = getStorage();
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const fileName = `${timestamp}-headshot.${fileExtension}`;
    const filePath = `rtdAcademy/studentPhotos/${user.uid}/${fileName}`;
    const fileRef = storageRef(storage, filePath);

    try {
      const snapshot = await uploadBytes(fileRef, file);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error('Error during file upload:', error);
      throw new Error(error.message);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setUploadStatus(null);
    setFileName(null);
    setError(null);
    onUploadComplete('studentPhoto', '');
  };

  // Camera functions
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, 
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

  const capturePhoto = async () => {
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
        // Create a file from the blob
        const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
        
        // Stop camera
        stopCamera();
        
        // Process the file
        await handleFileSelect(file);
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
          <Camera className="h-5 w-5" />
          Student Photo <span className="text-red-500">*</span>
        </h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-800">
            Please upload a recent headshot photo of the student. This will be used for identification purposes.
          </AlertDescription>
        </Alert>

        {displayError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{displayError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {preview && (
            <div className="relative inline-block">
              <img 
                src={preview} 
                alt="Student photo preview" 
                className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
              />
              <button
                onClick={handleRemove}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {!preview && !showCamera && (
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                className="border-blue-300 hover:bg-blue-50"
                disabled={uploadStatus === 'uploading'}
                onClick={() => document.getElementById('photo-upload-input').click()}
              >
                {uploadStatus === 'uploading' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Choose File
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="border-blue-300 hover:bg-blue-50"
                disabled={uploadStatus === 'uploading'}
                onClick={startCamera}
              >
                <Camera className="h-4 w-4 mr-2" />
                Use Camera
              </Button>
              
              <input
                id="photo-upload-input"
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                className="hidden"
                disabled={uploadStatus === 'uploading'}
              />

              {uploadStatus === 'completed' && (
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="h-5 w-5" />
                  <span className="text-sm">Photo uploaded successfully</span>
                </div>
              )}
            </div>
          )}

          {/* Camera View */}
          {showCamera && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline
                  className="w-full max-w-md mx-auto"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              
              <div className="flex items-center justify-center gap-4">
                <Button
                  type="button"
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={capturePhoto}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Capture Photo
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
              <li>JPEG or PNG format only</li>
              <li>Maximum file size: 10MB</li>
              <li>Clear headshot photo showing student's face</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

StudentPhotoUpload.displayName = 'StudentPhotoUpload';

export default StudentPhotoUpload;