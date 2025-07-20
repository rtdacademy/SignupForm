import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Progress } from "../components/ui/progress";
import { Database, Upload, FileText, CheckCircle, AlertCircle, Trash2, Cloud, FileArchive } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import Papa from 'papaparse';

function DataRectification() {
  const [courseRegistrationsFile, setCourseRegistrationsFile] = useState(null);
  const [courseRegistrationsData, setCourseRegistrationsData] = useState(null);
  const [schoolEnrollmentsFile, setSchoolEnrollmentsFile] = useState(null);
  const [schoolEnrollmentsData, setSchoolEnrollmentsData] = useState(null);
  const [mergedData, setMergedData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });
  const [uploadProgress, setUploadProgress] = useState(0);

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

        // Clear merged data when new file is loaded
        setMergedData(null);
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
    if (!mergedData) {
      setUploadStatus({
        type: 'error',
        message: 'Please merge the data before uploading'
      });
      return;
    }

    setUploading(true);
    setUploadStatus({ type: '', message: '' });
    setUploadProgress(50); // Start at 50% since merging is done

    try {
      const functions = getFunctions();
      const uploadPasiData = httpsCallable(functions, 'uploadPasiData');
      
      const studentCount = Object.keys(mergedData).length;
      const totalCourseCount = Object.values(mergedData).reduce(
        (sum, student) => sum + student.courseRegistrations.length, 0
      );
      
      console.log(`Uploading merged PASI data: ${studentCount} students, ${totalCourseCount} course registrations`);
      setUploadStatus({
        type: 'info',
        message: `Uploading data for ${studentCount} students...`
      });
      
      const result = await uploadPasiData({
        data: mergedData,
        dataType: 'mergedPasiData',
        recordCount: studentCount,
        metadata: {
          studentCount,
          totalCourseCount,
          schoolEnrollmentCount: schoolEnrollmentsData?.length || 0,
          originalCourseRegistrationCount: courseRegistrationsData?.length || 0
        }
      });
      
      setUploadProgress(100);
      console.log('Merged data upload result:', result.data);

      setUploadStatus({
        type: 'success',
        message: `Successfully uploaded merged PASI data for ${studentCount} students with ${totalCourseCount} course registrations. Achieved ${result.data.compressionRatio}% compression.`
      });
    } catch (error) {
      console.error('Upload error:', error);
      
      let errorMessage = 'Upload failed: ';
      if (error.code === 'functions/unauthenticated') {
        errorMessage += 'You must be logged in to upload data';
      } else if (error.code === 'functions/invalid-argument') {
        errorMessage += error.message;
      } else if (error.code === 'functions/internal') {
        errorMessage += error.message;
      } else {
        errorMessage += error.message || 'Unknown error occurred';
      }
      
      setUploadStatus({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
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
    setMergedData(null);
    setUploadStatus({ type: '', message: '' });
  };

  const mergeDataByASN = () => {
    if (!courseRegistrationsData || !schoolEnrollmentsData) {
      setUploadStatus({
        type: 'error',
        message: 'Both files must be loaded before merging'
      });
      return;
    }

    try {
      const merged = {};
      let studentsWithoutEnrollment = 0;
      let enrollmentsWithoutCourses = 0;

      // First, process school enrollments (one per student)
      schoolEnrollmentsData.forEach(enrollment => {
        const asn = enrollment.asn || enrollment.ASN || enrollment['Alberta Student Number'];
        if (asn) {
          merged[asn] = {
            asn: asn,
            schoolEnrollment: enrollment,
            courseRegistrations: [],
            metadata: {
              courseCount: 0,
              lastUpdated: new Date().toISOString()
            }
          };
        }
      });

      // Then, add course registrations
      courseRegistrationsData.forEach(registration => {
        const asn = registration.asn || registration.ASN || registration['Alberta Student Number'];
        if (asn) {
          if (merged[asn]) {
            merged[asn].courseRegistrations.push(registration);
            merged[asn].metadata.courseCount++;
          } else {
            // Student has course registrations but no school enrollment
            studentsWithoutEnrollment++;
            merged[asn] = {
              asn: asn,
              schoolEnrollment: null,
              courseRegistrations: [registration],
              metadata: {
                courseCount: 1,
                lastUpdated: new Date().toISOString(),
                warning: 'No school enrollment found'
              }
            };
          }
        }
      });

      // Check for students with enrollment but no courses
      Object.values(merged).forEach(student => {
        if (student.courseRegistrations.length === 0) {
          enrollmentsWithoutCourses++;
          student.metadata.warning = 'No course registrations found';
        }
      });

      const totalStudents = Object.keys(merged).length;
      const totalCourses = courseRegistrationsData.length;

      setMergedData(merged);
      
      let statusMessage = `Merged data for ${totalStudents} students with ${totalCourses} total course registrations.`;
      if (studentsWithoutEnrollment > 0) {
        statusMessage += ` Warning: ${studentsWithoutEnrollment} students have courses but no enrollment.`;
      }
      if (enrollmentsWithoutCourses > 0) {
        statusMessage += ` ${enrollmentsWithoutCourses} students have enrollment but no courses.`;
      }

      setUploadStatus({
        type: 'success',
        message: statusMessage
      });
    } catch (error) {
      console.error('Error merging data:', error);
      setUploadStatus({
        type: 'error',
        message: `Failed to merge data: ${error.message}`
      });
    }
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
            Upload CSV files from PASI to Cloud Storage. Files are compressed and stored securely with full upload history tracking.
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
            <Alert variant={uploadStatus.type === 'error' ? 'destructive' : uploadStatus.type === 'info' ? 'default' : 'default'}>
              {uploadStatus.type === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : uploadStatus.type === 'info' ? (
                <Cloud className="h-4 w-4 animate-pulse" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <AlertDescription>{uploadStatus.message}</AlertDescription>
            </Alert>
          )}

          {/* Upload Progress */}
          {uploading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Upload Progress</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Merge Button */}
          {courseRegistrationsData && schoolEnrollmentsData && !mergedData && (
            <Button
              onClick={mergeDataByASN}
              variant="secondary"
              className="w-full"
            >
              <FileArchive className="h-4 w-4 mr-2" />
              Merge Data by ASN
            </Button>
          )}

          {/* Merged Data Summary */}
          {mergedData && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Data merged successfully: {Object.keys(mergedData).length} students ready for upload
              </AlertDescription>
            </Alert>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUploadToFirebase}
            disabled={uploading || !mergedData}
            className="w-full"
          >
            {uploading ? (
              <>Uploading...</>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Merged Data to Cloud Storage
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

          {/* Merged Data Preview */}
          {mergedData && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Merged Data Preview</h3>
              <div className="space-y-4">
                {Object.entries(mergedData).slice(0, 3).map(([asn, studentData]) => (
                  <Card key={asn} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">ASN: {asn}</h4>
                      <div className="flex gap-2">
                        <Badge variant={studentData.schoolEnrollment ? "secondary" : "destructive"}>
                          {studentData.schoolEnrollment ? "Enrolled" : "No Enrollment"}
                        </Badge>
                        <Badge variant="outline">
                          {studentData.courseRegistrations.length} courses
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div>Updated: {new Date(studentData.metadata.lastUpdated).toLocaleString()}</div>
                      {studentData.metadata.warning && (
                        <div className="text-yellow-600 mt-1">⚠️ {studentData.metadata.warning}</div>
                      )}
                    </div>
                  </Card>
                ))}
                <p className="text-sm text-gray-500">
                  Showing first 3 students of {Object.keys(mergedData).length} total students
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default DataRectification;