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
  RefreshCw
} from 'lucide-react';
import { functions, auth } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { useUserPreferences } from '../context/UserPreferencesContext';

const PASIDataUploadV2 = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const { preferences } = useUserPreferences();

  // School years from preferences
  const schoolYears = preferences?.schoolYears || ['2024-2025', '2023-2024'];

  useEffect(() => {
    // Set default school year
    if (schoolYears.length > 0 && !selectedYear) {
      setSelectedYear(schoolYears[0]);
    }
  }, [schoolYears, selectedYear]);

  useEffect(() => {
    // Load upload history
    const loadUploadHistory = async () => {
      const db = getDatabase();
      const user = auth.currentUser;
      if (!user) return;

      const uploadsRef = ref(db, 'pasiUploads');
      
      const unsubscribe = onValue(uploadsRef, (snapshot) => {
        if (snapshot.exists()) {
          const uploads = snapshot.val();
          const userUploads = Object.entries(uploads)
            .filter(([_, upload]) => upload.uploadedBy === user.email)
            .map(([id, upload]) => ({ id, ...upload }))
            .sort((a, b) => (b.startTime || 0) - (a.startTime || 0))
            .slice(0, 5); // Last 5 uploads
          
          setUploadHistory(userUploads);
        }
      });

      return () => off(uploadsRef, 'value', unsubscribe);
    };

    loadUploadHistory();
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
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            PASI Data Upload V2
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Upload PASI CSV files to update student course records. This new version stores each course attempt separately
            for better data management and querying.
          </p>
        </CardContent>
      </Card>

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>Upload New PASI Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* School Year Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              School Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full p-2 border rounded-md"
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
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="flex-1"
                disabled={uploading}
              />
              {selectedFile && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {selectedFile.name}
                </Badge>
              )}
            </div>
          </div>

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !selectedYear || uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload CSV
              </>
            )}
          </Button>

          {/* Progress Bar */}
          {uploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                Processing... {uploadProgress}%
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Display */}
          {uploadStatus?.type === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="space-y-2">
                  <p className="font-medium">{uploadStatus.message}</p>
                  <div className="text-sm space-y-1">
                    <p>Total Records: {uploadStatus.details.totalRecords}</p>
                    <p>Processed: {uploadStatus.details.processedRecords}</p>
                    {uploadStatus.details.errors > 0 && (
                      <p>Errors: {uploadStatus.details.errors}</p>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Upload History */}
      {uploadHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadHistory.map((upload) => (
                <div key={upload.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{upload.schoolYear}</span>
                    </div>
                    <Badge variant={upload.status === 'completed' ? 'success' : upload.status === 'failed' ? 'destructive' : 'secondary'}>
                      {upload.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Uploaded: {formatDate(upload.startTime)}</p>
                    {upload.status === 'completed' && (
                      <>
                        <p>Records: {upload.processedCount || 0} / {upload.recordCount || 0}</p>
                        <p>Duration: {formatDuration(upload.startTime, upload.endTime)}</p>
                        {upload.errorCount > 0 && (
                          <p className="text-orange-600">Errors: {upload.errorCount}</p>
                        )}
                      </>
                    )}
                    {upload.status === 'failed' && upload.error && (
                      <p className="text-red-600">Error: {upload.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            About This Version
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <p className="font-medium">Key Improvements:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Each course attempt (Term 1, Term 2, Summer) stored separately</li>
              <li>Cloud-based processing for large files</li>
              <li>Atomic operations - all records updated or none</li>
              <li>Better performance and simpler queries</li>
              <li>No complex duplicate handling needed</li>
            </ul>
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-medium">Data Structure:</p>
            <code className="block bg-muted p-2 rounded text-xs">
              /pasiRecordsNew/{'{24_25}'}/{'{asn}_{courseCode}_{referenceNumber}_{term}'}
            </code>
            <p className="text-xs text-muted-foreground">
              Uses Reference # for unique identification and 24_25 format for school years
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PASIDataUploadV2;