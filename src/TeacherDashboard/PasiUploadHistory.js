import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Clock, FileArchive, Download, Database } from 'lucide-react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { usePasiData } from './usePasiData';

function PasiUploadHistory() {
  const [uploadHistory, setUploadHistory] = useState({
    courseRegistrations: null,
    schoolEnrollments: null,
    mergedPasiData: null
  });
  const { loading, retrieveData } = usePasiData();

  useEffect(() => {
    const db = getDatabase();
    
    // Listen to latest uploads
    const courseRegRef = ref(db, 'pasiData/courseRegistrations/latestUpload');
    const schoolEnrollRef = ref(db, 'pasiData/schoolEnrollments/latestUpload');
    const mergedDataRef = ref(db, 'pasiData/mergedPasiData/latestUpload');
    
    const unsubscribeCourseReg = onValue(courseRegRef, (snapshot) => {
      setUploadHistory(prev => ({
        ...prev,
        courseRegistrations: snapshot.val()
      }));
    });
    
    const unsubscribeSchoolEnroll = onValue(schoolEnrollRef, (snapshot) => {
      setUploadHistory(prev => ({
        ...prev,
        schoolEnrollments: snapshot.val()
      }));
    });

    const unsubscribeMergedData = onValue(mergedDataRef, (snapshot) => {
      setUploadHistory(prev => ({
        ...prev,
        mergedPasiData: snapshot.val()
      }));
    });
    
    return () => {
      unsubscribeCourseReg();
      unsubscribeSchoolEnroll();
      unsubscribeMergedData();
    };
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleRetrieveData = async (dataType, filePath) => {
    try {
      const result = await retrieveData(dataType, filePath);
      console.log(`Retrieved ${result.recordCount} records`);
      // You can handle the retrieved data here (e.g., display in a modal, export, etc.)
    } catch (error) {
      console.error('Failed to retrieve data:', error);
    }
  };

  const DataTypeCard = ({ title, dataType, latestUpload }) => {
    if (!latestUpload) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>No uploads yet</CardDescription>
          </CardHeader>
        </Card>
      );
    }

    const isMergedData = dataType === 'mergedPasiData';

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            {title}
            {isMergedData ? (
              <div className="flex flex-col items-end gap-1">
                <Badge variant="secondary">
                  {latestUpload.studentCount?.toLocaleString() || latestUpload.recordCount?.toLocaleString()} students
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {latestUpload.totalCourseCount?.toLocaleString()} courses
                </Badge>
              </div>
            ) : (
              <Badge variant="secondary">
                {latestUpload.recordCount.toLocaleString()} records
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(latestUpload.uploadDate)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <FileArchive className="h-4 w-4 text-muted-foreground" />
            <span>
              {formatFileSize(latestUpload.fileSize)} 
              <span className="text-muted-foreground ml-1">
                ({latestUpload.compressionRatio}% compressed)
              </span>
            </span>
          </div>

          {isMergedData && (
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Enrollments: {latestUpload.schoolEnrollmentCount?.toLocaleString()}</div>
              <div>Course Records: {latestUpload.originalCourseRegistrationCount?.toLocaleString()}</div>
            </div>
          )}
          
          <div className="text-sm text-muted-foreground">
            Uploaded by: {latestUpload.uploadedBy}
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleRetrieveData(dataType, latestUpload.filePath)}
            disabled={loading}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            {isMergedData ? 'Retrieve Merged Data' : 'Retrieve Data'}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Database className="h-6 w-6" />
        <h2 className="text-xl font-bold">PASI Upload History</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DataTypeCard
          title="Course Registrations"
          dataType="courseRegistrations"
          latestUpload={uploadHistory.courseRegistrations}
        />
        <DataTypeCard
          title="School Enrollments"
          dataType="schoolEnrollments"
          latestUpload={uploadHistory.schoolEnrollments}
        />
        <DataTypeCard
          title="Merged PASI Data"
          dataType="mergedPasiData"
          latestUpload={uploadHistory.mergedPasiData}
        />
      </div>
    </div>
  );
}

export default PasiUploadHistory;