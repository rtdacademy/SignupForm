import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Database, Upload, FileText, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { getDatabase, ref, set } from 'firebase/database';
import Papa from 'papaparse';

function DataRectification() {
  const [courseRegistrationsFile, setCourseRegistrationsFile] = useState(null);
  const [courseRegistrationsData, setCourseRegistrationsData] = useState(null);
  const [schoolEnrollmentsFile, setSchoolEnrollmentsFile] = useState(null);
  const [schoolEnrollmentsData, setSchoolEnrollmentsData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });

  const handleFileUpload = (event, fileType) => {
    const file = event.target.files[0];
    if (!file) return;

    if (fileType === 'courseRegistrations') {
      setCourseRegistrationsFile(file);
    } else {
      setSchoolEnrollmentsFile(file);
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setUploadStatus({
            type: 'error',
            message: `Error parsing ${fileType}: ${results.errors[0].message}`
          });
          return;
        }

        if (fileType === 'courseRegistrations') {
          setCourseRegistrationsData(results.data);
        } else {
          setSchoolEnrollmentsData(results.data);
        }

        setUploadStatus({
          type: 'success',
          message: `${fileType === 'courseRegistrations' ? 'Course Registrations' : 'School Enrollments'} loaded: ${results.data.length} records found`
        });
      },
      error: (error) => {
        setUploadStatus({
          type: 'error',
          message: `Error reading file: ${error.message}`
        });
      }
    });
  };

  const handleUploadToFirebase = async () => {
    if (!courseRegistrationsData && !schoolEnrollmentsData) {
      setUploadStatus({
        type: 'error',
        message: 'Please upload at least one file first'
      });
      return;
    }

    setUploading(true);
    setUploadStatus({ type: '', message: '' });

    try {
      const db = getDatabase();
      console.log('Database instance:', db);
      
      // Upload Course Registrations data if available
      if (courseRegistrationsData) {
        console.log('Uploading course registrations:', courseRegistrationsData.length, 'records');
        const courseRegRef = ref(db, 'pasiData/courseRegistrations');
        console.log('Reference created:', courseRegRef);
        
        await set(courseRegRef, {
          lastUpdated: new Date().toISOString(),
          recordCount: courseRegistrationsData.length,
          data: courseRegistrationsData
        });
        console.log('Course registrations uploaded successfully');
      }

      // Upload School Enrollments data if available
      if (schoolEnrollmentsData) {
        console.log('Uploading school enrollments:', schoolEnrollmentsData.length, 'records');
        const schoolEnrollmentsRef = ref(db, 'pasiData/schoolEnrollments');
        console.log('Reference created:', schoolEnrollmentsRef);
        
        await set(schoolEnrollmentsRef, {
          lastUpdated: new Date().toISOString(),
          recordCount: schoolEnrollmentsData.length,
          data: schoolEnrollmentsData
        });
        console.log('School enrollments uploaded successfully');
      }

      setUploadStatus({
        type: 'success',
        message: 'Data successfully uploaded to Firebase'
      });
    } catch (error) {
      console.error('Firebase upload error:', error);
      console.error('Error code:', error.code);
      console.error('Error details:', error);
      
      setUploadStatus({
        type: 'error',
        message: `Upload failed: ${error.message} (Code: ${error.code || 'unknown'})`
      });
    } finally {
      setUploading(false);
    }
  };

  const clearData = (fileType) => {
    if (fileType === 'courseRegistrations') {
      setCourseRegistrationsFile(null);
      setCourseRegistrationsData(null);
    } else {
      setSchoolEnrollmentsFile(null);
      setSchoolEnrollmentsData(null);
    }
    setUploadStatus({ type: '', message: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Database className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Data Rectification</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>PASI Data Upload</CardTitle>
          <CardDescription>
            Upload CSV files from PASI. Data will be completely replaced on each upload.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Course Registrations Upload */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="course-registrations">Course Registrations CSV</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="course-registrations"
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileUpload(e, 'courseRegistrations')}
                  className="flex-1"
                />
                {courseRegistrationsFile && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => clearData('courseRegistrations')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {courseRegistrationsFile && (
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{courseRegistrationsFile.name}</span>
                  {courseRegistrationsData && (
                    <span className="text-green-600">
                      ({courseRegistrationsData.length} records)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* School Enrollments Upload */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="school-enrollments">School Enrollments CSV</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="school-enrollments"
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileUpload(e, 'schoolEnrollments')}
                  className="flex-1"
                />
                {schoolEnrollmentsFile && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => clearData('schoolEnrollments')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {schoolEnrollmentsFile && (
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{schoolEnrollmentsFile.name}</span>
                  {schoolEnrollmentsData && (
                    <span className="text-green-600">
                      ({schoolEnrollmentsData.length} records)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Upload Status */}
          {uploadStatus.message && (
            <Alert variant={uploadStatus.type === 'error' ? 'destructive' : 'default'}>
              {uploadStatus.type === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <AlertDescription>{uploadStatus.message}</AlertDescription>
            </Alert>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUploadToFirebase}
            disabled={uploading || (!courseRegistrationsData && !schoolEnrollmentsData)}
            className="w-full"
          >
            {uploading ? (
              <>Uploading...</>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload to Firebase
              </>
            )}
          </Button>

          {/* Data Preview */}
          {courseRegistrationsData && courseRegistrationsData.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Course Registrations Preview</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(courseRegistrationsData[0]).slice(0, 5).map((header) => (
                        <th
                          key={header}
                          className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ...
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {courseRegistrationsData.slice(0, 5).map((row, index) => (
                      <tr key={index}>
                        {Object.keys(row).slice(0, 5).map((key) => (
                          <td key={key} className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {row[key]}
                          </td>
                        ))}
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">...</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Showing first 5 rows of {courseRegistrationsData.length} total records
              </p>
            </div>
          )}

          {/* School Enrollments Preview */}
          {schoolEnrollmentsData && schoolEnrollmentsData.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">School Enrollments Preview</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(schoolEnrollmentsData[0]).slice(0, 5).map((header) => (
                        <th
                          key={header}
                          className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ...
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {schoolEnrollmentsData.slice(0, 5).map((row, index) => (
                      <tr key={index}>
                        {Object.keys(row).slice(0, 5).map((key) => (
                          <td key={key} className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {row[key]}
                          </td>
                        ))}
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">...</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Showing first 5 rows of {schoolEnrollmentsData.length} total records
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default DataRectification;