import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Info,
  Calendar,
  Database,
  RefreshCw,
  FileSpreadsheet,
  CloudUpload,
  Users,
  BarChart3,
  History,
  Clock,
  X
} from 'lucide-react';
import { functions, auth } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { getDatabase, ref, onValue, off, get } from 'firebase/database';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useSchoolYear } from '../context/SchoolYearContext';
import PasiRecordsSimplified from './PasiRecordsSimplified';
import BlacklistSheet from '../components/BlacklistSheet';
import PASIAnalyticsV2 from './PASIAnalyticsV2';
import UploadHistorySheet from './UploadHistorySheet';

const PASIDataUploadV2 = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [lastSystemUpload, setLastSystemUpload] = useState(null);
  const [showBlacklistSheet, setShowBlacklistSheet] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsRecords, setAnalyticsRecords] = useState([]);
  const [showUploadHistorySheet, setShowUploadHistorySheet] = useState(false);
  const [allUploads, setAllUploads] = useState([]);
  const { preferences } = useUserPreferences();
  const { 
    refreshStudentSummaries, 
    currentSchoolYear, 
    includeNextYear, 
    includePreviousYear,
    getNextSchoolYear,
    getPreviousSchoolYear,
    schoolYearOptions
  } = useSchoolYear();



  useEffect(() => {
    // Load upload history and system-wide last upload
    const db = getDatabase();
    const user = auth.currentUser;
    console.log('Loading upload data, current user:', user?.email || 'Not logged in');
    
    if (!user) {
      console.log('No user logged in, skipping upload data load');
      return;
    }

    const uploadsRef = ref(db, 'pasiUploads');
    console.log('Setting up Firebase listener for pasiUploads');
    
    // Also try a one-time read to debug
    get(uploadsRef).then((snapshot) => {
      console.log('One-time get - exists:', snapshot.exists());
      if (snapshot.exists()) {
        console.log('One-time get - data keys:', Object.keys(snapshot.val()));
      }
    }).catch((error) => {
      console.error('One-time get error:', error);
    });
    
    const unsubscribe = onValue(uploadsRef, (snapshot) => {
      console.log('Firebase snapshot received, exists:', snapshot.exists());
        
        if (snapshot.exists()) {
          const uploads = snapshot.val();
          console.log('Raw uploads data:', uploads);
          
          const allUploads = Object.entries(uploads)
            .map(([id, upload]) => ({ id, ...upload }))
            // Include all uploads, not just completed ones
            .sort((a, b) => (b.startTime || 0) - (a.startTime || 0));

          // Get user uploads for history
          const userUploads = allUploads
            .filter((upload) => upload.uploadedBy === user.email)
            .slice(0, 10); // Last 10 uploads
          
          setUploadHistory(userUploads);
          
          // Store all uploads for the history view
          setAllUploads(allUploads.slice(0, 20)); // Keep last 20 uploads for display
          
          // Debug log to check if uploads are loading
          console.log('PASI Uploads loaded:', allUploads.length, 'uploads found');
          console.log('First few uploads:', allUploads.slice(0, 3));
          console.log('Current user email:', user.email);

          // Get the most recent successful upload from any user
          if (allUploads.length > 0) {
            setLastSystemUpload(allUploads[0]);
          }
        } else {
          console.log('No pasiUploads data found in Firebase');
          setAllUploads([]);
          setUploadHistory([]);
          setLastSystemUpload(null);
        }
    }, (error) => {
      console.error('Firebase error:', error);
    });

    return () => {
      console.log('Cleaning up Firebase listener');
      off(uploadsRef, 'value', unsubscribe);
    };
  }, []);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setError(null);
      setUploadStatus(null);
    } else {
      setError('Please select a valid CSV file');
      setSelectedFile(null);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setError(null);
    setUploadStatus(null);
    // Reset the file input
    const fileInput = document.getElementById('file-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !currentSchoolYear) {
      setError('Please select a file and ensure a school year is selected in the header');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadStatus(null);
    setUploadProgress(0);

    try {
      // Read file content
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const csvContent = e.target.result;
          
          // Convert to base64 for cloud function
          const base64Content = btoa(csvContent);
          
          // Call cloud function
          const uploadPasiCsvV2 = httpsCallable(functions, 'uploadPasiCsvV2');
          
          // Start progress monitoring
          const progressInterval = setInterval(() => {
            setUploadProgress((prev) => Math.min(prev + 5, 90));
          }, 1000);
          
          const result = await uploadPasiCsvV2({
            csvContent: base64Content,
            schoolYear: currentSchoolYear
          });
          
          clearInterval(progressInterval);
          setUploadProgress(100);
          
          if (result.data.success) {
            setUploadStatus({
              type: 'success',
              message: result.data.message,
              details: {
                totalRecords: result.data.totalRecords,
                processedRecords: result.data.processedRecords,
                errors: result.data.errors,
                uploadId: result.data.uploadId
              }
            });
            
            // Refresh the data in context
            refreshStudentSummaries();
          } else {
            throw new Error(result.data.message || 'Upload failed');
          }
          
        } catch (error) {
          console.error('Upload error:', error);
          setError(error.message || 'Failed to upload CSV file');
          setUploadStatus({
            type: 'error',
            message: 'Upload failed',
            details: error.message
          });
        } finally {
          setUploading(false);
        }
      };
      
      reader.onerror = () => {
        setError('Failed to read file');
        setUploading(false);
      };
      
      reader.readAsText(selectedFile);
      
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to upload CSV file');
      setUploading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';
    const duration = endTime - startTime;
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const getStatusBadge = (upload) => {
    if (upload.status === 'completed') {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    } else if (upload.status === 'failed') {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      );
    } else if (upload.status === 'processing') {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
          Processing
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline">
          <Info className="h-3 w-3 mr-1" />
          {upload.status || 'Unknown'}
        </Badge>
      );
    }
  };

  const handleShowAnalytics = (records) => {
    setAnalyticsRecords(records || []);
    setShowAnalytics(true);
  };


  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="border-2 border-dashed hover:border-solid transition-all duration-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <span>PASI Data Upload</span>
                  {lastSystemUpload && (
                    <span className="text-xs font-normal text-gray-500">
                      {formatRelativeTime(lastSystemUpload.startTime)} • {formatDate(lastSystemUpload.startTime)}
                    </span>
                  )}
                </div>
                {currentSchoolYear && (
                  <span className="text-sm font-normal text-gray-600">
                    Uploading to: <span 
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{ 
                        backgroundColor: `${schoolYearOptions?.find(opt => opt.value === currentSchoolYear)?.color || '#3B82F6'}20`,
                        color: schoolYearOptions?.find(opt => opt.value === currentSchoolYear)?.color || '#3B82F6',
                        borderColor: schoolYearOptions?.find(opt => opt.value === currentSchoolYear)?.color || '#3B82F6',
                        borderWidth: '1px',
                        borderStyle: 'solid'
                      }}
                    >{currentSchoolYear}</span>
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUploadHistorySheet(true)}
                className="flex items-center gap-2"
              >
                <History className="h-4 w-4" />
                Upload History
                {allUploads.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {allUploads.length}
                  </Badge>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBlacklistSheet(true)}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Blacklist
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Selection and Upload */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="sr-only"
                id="file-upload"
                disabled={uploading}
              />
              <label
                htmlFor="file-upload"
                className={`
                  w-full h-12 px-4 border rounded-md flex items-center justify-between gap-2 cursor-pointer
                  ${uploading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50 hover:border-gray-400'}
                  transition-all duration-200
                `}
              >
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">
                    {selectedFile ? selectedFile.name : 'Choose CSV file...'}
                  </span>
                </div>
                {selectedFile && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleClearFile();
                    }}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    disabled={uploading}
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                )}
              </label>
            </div>

            {/* Upload Button - Only show when file is selected */}
            {selectedFile && (
              <Button
                onClick={handleUpload}
                disabled={!currentSchoolYear || uploading}
                className={`
                  h-12 px-6 text-base font-medium transition-all duration-200 animate-in slide-in-from-right-2
                  ${!currentSchoolYear || uploading 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                  }
                `}
                variant={uploading ? "secondary" : "default"}
              >
                {uploading ? (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CloudUpload className="mr-2 h-5 w-5" />
                    Upload
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full h-2" />
              <p className="text-sm text-center text-muted-foreground font-medium">
                Processing records... {uploadProgress}%
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive" className="animate-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Display */}
          {uploadStatus?.type === 'success' && (
            <Alert className="border-green-200 bg-green-50 animate-in slide-in-from-top-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="space-y-2">
                  <p className="font-medium">{uploadStatus.message}</p>
                  <div className="flex gap-4 text-sm">
                    <span>Records: {uploadStatus.details.processedRecords}/{uploadStatus.details.totalRecords}</span>
                    {uploadStatus.details.errors > 0 && (
                      <span className="text-orange-600">Errors: {uploadStatus.details.errors}</span>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    
      {/* PASI Records Table */}
      <PasiRecordsSimplified onShowAnalytics={handleShowAnalytics} />

      {/* Blacklist Sheet Modal */}
      <BlacklistSheet 
        isOpen={showBlacklistSheet}
        onClose={() => setShowBlacklistSheet(false)}
      />

      {/* Analytics Modal */}
      <PASIAnalyticsV2
        records={analyticsRecords}
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        selectedSchoolYear={currentSchoolYear || '24/25'}
        includePreviousYear={includePreviousYear}
        includeNextYear={includeNextYear}
        getPreviousSchoolYear={getPreviousSchoolYear}
        getNextSchoolYear={getNextSchoolYear}
        schoolYearOptions={schoolYearOptions}
      />

      {/* Upload History Sheet */}
      <UploadHistorySheet
        isOpen={showUploadHistorySheet}
        onClose={() => setShowUploadHistorySheet(false)}
        uploads={allUploads}
        formatRelativeTime={formatRelativeTime}
        formatDate={formatDate}
        formatDuration={formatDuration}
        getStatusBadge={getStatusBadge}
      />
    </div>
  );
};

export default PASIDataUploadV2;