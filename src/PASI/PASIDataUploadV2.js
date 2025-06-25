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
  Users
} from 'lucide-react';
import { functions, auth } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useSchoolYear } from '../context/SchoolYearContext';
import PasiRecordsSimplified from './PasiRecordsSimplified';
import BlacklistSheet from '../components/BlacklistSheet';

const PASIDataUploadV2 = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [lastSystemUpload, setLastSystemUpload] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');
  const [showBlacklistSheet, setShowBlacklistSheet] = useState(false);
  const { preferences } = useUserPreferences();
  const { refreshStudentSummaries } = useSchoolYear();

  // School years from preferences
  const schoolYears = preferences?.schoolYears || ['2024-2025', '2023-2024'];

  useEffect(() => {
    // Set default school year
    if (schoolYears.length > 0 && !selectedYear) {
      setSelectedYear(schoolYears[0]);
    }
  }, [schoolYears, selectedYear]);

  useEffect(() => {
    // Load upload history and system-wide last upload
    const loadUploadData = async () => {
      const db = getDatabase();
      const user = auth.currentUser;
      if (!user) return;

      const uploadsRef = ref(db, 'pasiUploads');
      
      const unsubscribe = onValue(uploadsRef, (snapshot) => {
        if (snapshot.exists()) {
          const uploads = snapshot.val();
          const allUploads = Object.entries(uploads)
            .map(([id, upload]) => ({ id, ...upload }))
            .filter((upload) => upload.status === 'completed') // Only completed uploads
            .sort((a, b) => (b.startTime || 0) - (a.startTime || 0));

          // Get user uploads for history
          const userUploads = allUploads
            .filter((upload) => upload.uploadedBy === user.email)
            .slice(0, 5); // Last 5 uploads
          
          setUploadHistory(userUploads);

          // Get the most recent successful upload from any user
          if (allUploads.length > 0) {
            setLastSystemUpload(allUploads[0]);
          }
        }
      });

      return () => off(uploadsRef, 'value', unsubscribe);
    };

    loadUploadData();
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

  const handleUpload = async () => {
    if (!selectedFile || !selectedYear) {
      setError('Please select both a file and school year');
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
            schoolYear: selectedYear
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

  return (
    <div className="space-y-6">
      {/* Last Upload Summary */}
      {lastSystemUpload && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Info className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Last System Upload</h3>
                  <p className="text-sm text-blue-700">
                    By <span className="font-medium">{lastSystemUpload.uploadedBy}</span> • {formatDate(lastSystemUpload.startTime)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-900">
                  {lastSystemUpload.processedCount?.toLocaleString() || 'N/A'} records
                </div>
                <div className="text-sm text-blue-600">
                  {lastSystemUpload.schoolYear}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Section */}
      <Card className="border-2 border-dashed hover:border-solid transition-all duration-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              <span>PASI Data Upload</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBlacklistSheet(true)}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Manage Blacklist
              </Button>
              {uploadHistory.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  Last upload: {formatDate(uploadHistory[0]?.startTime)}
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* School Year Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                School Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full p-2.5 border rounded-md bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                disabled={uploading}
              >
                <option value="">Select school year</option>
                {schoolYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* File Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                CSV File
              </label>
              <div className="relative">
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
                    w-full p-2.5 border rounded-md flex items-center justify-center gap-2 cursor-pointer
                    ${uploading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50 hover:border-gray-400'}
                    transition-all duration-200
                  `}
                >
                  <FileSpreadsheet className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {selectedFile ? selectedFile.name : 'Choose CSV file...'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !selectedYear || uploading}
            className={`
              w-full h-12 text-base font-medium transition-all duration-200
              ${!selectedFile || !selectedYear || uploading 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
              }
            `}
            variant={uploading ? "secondary" : "default"}
          >
            {uploading ? (
              <>
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                Processing Upload...
              </>
            ) : (
              <>
                <CloudUpload className="mr-2 h-5 w-5" />
                Upload PASI Data
              </>
            )}
          </Button>

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
      <PasiRecordsSimplified />

      {/* Blacklist Sheet Modal */}
      <BlacklistSheet 
        isOpen={showBlacklistSheet}
        onClose={() => setShowBlacklistSheet(false)}
      />
    </div>
  );
};

export default PASIDataUploadV2;