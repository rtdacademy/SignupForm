import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { getDatabase, ref, query, orderByChild, equalTo, get, push, update } from 'firebase/database';
import { Loader2, Link2 } from "lucide-react";
import { toast } from "sonner";
import { sanitizeEmail } from '../utils/sanitizeEmail';

const CourseLinkingDialog = ({ isOpen, onClose, record }) => {
  const [studentRecords, setStudentRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [linkingId, setLinkingId] = useState(null);

  useEffect(() => {
    const fetchStudentRecords = async () => {
      if (!record?.asn) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const db = getDatabase();
        const summariesRef = ref(db, 'studentCourseSummaries');
        const asnQuery = query(
          summariesRef,
          orderByChild('asn'),
          equalTo(record.asn)
        );
        
        const snapshot = await get(asnQuery);
        
        if (!snapshot.exists()) {
          setStudentRecords([]);
          return;
        }

        const matchingRecords = Object.entries(snapshot.val()).map(([id, data]) => ({
          id,
          courseValue: data.Course_Value,
          asn: data.asn,
          statusValue: data.Status_Value,
          studentEmail: data.StudentEmail,
          firstName: data.preferredFirstName || data.firstName,
          lastName: data.lastName,
          schoolYear: data.School_x0020_Year_Value,
          studentType: data.StudentType_Value,
          courseId: data.CourseID
        }));

        setStudentRecords(matchingRecords);
      } catch (error) {
        console.error('Error fetching student records:', error);
        setError('Failed to fetch student records. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchStudentRecords();
    }
  }, [isOpen, record]);

  const handleLink = async (studentRecord) => {
    setLinkingId(studentRecord.id); 
    const db = getDatabase();
    
    try {
      // First, fetch the complete PASI record
      const pasiRecordRef = ref(db, `pasiRecords/${record.pasiRecordId}`);
      const pasiSnapshot = await get(pasiRecordRef);
      
      if (!pasiSnapshot.exists()) {
        throw new Error('PASI record not found');
      }
      
      const pasiRecord = pasiSnapshot.val();
      console.log("Full PASI Record:", pasiRecord);

      const newLinkRef = push(ref(db, 'pasiLinks'));
      const linkId = newLinkRef.key;
      const studentKey = sanitizeEmail(studentRecord.studentEmail);
      const linkedAt = new Date().toISOString();
      
      // Format school year for the report paths
      const schoolYearWithUnderscore = pasiRecord.schoolYear; // Already in correct format "24_25"
      const schoolYearWithSlash = schoolYearWithUnderscore.replace('_', '/'); // Convert to "24/25" format
      const manualMappingPath = `pasiSyncReport/schoolYear/${schoolYearWithUnderscore}/newLinks/needsManualCourseMapping`;
      const failedPath = `pasiSyncReport/schoolYear/${schoolYearWithUnderscore}/newLinks/failed`;
      
      // Prepare updates object
      const updates = {};
      
      // Get current manual mapping report data
      const manualMappingRef = ref(db, manualMappingPath);
      const manualMappingSnapshot = await get(manualMappingRef);
      
      if (manualMappingSnapshot.exists()) {
        const reportData = manualMappingSnapshot.val();
        const updatedReportData = Object.entries(reportData)
          .filter(([key, value]) => !(
            value.asn === pasiRecord.asn && 
            value.courseCode === pasiRecord.courseCode
          ))
          .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {});
        
        updates[manualMappingPath] = updatedReportData;
      }

      // Get current failed links report data
      const failedRef = ref(db, failedPath);
      const failedSnapshot = await get(failedRef);
      
      if (failedSnapshot.exists()) {
        const failedData = failedSnapshot.val();
        const recordPattern = `${pasiRecord.asn}_${pasiRecord.courseCode.toLowerCase()}`;
        
        const updatedFailedData = Object.entries(failedData)
          .filter(([key, value]) => {
            const [recordAsn, recordCourseCode] = value.pasiRecordId.split('_');
            const currentPattern = `${recordAsn}_${recordCourseCode.toLowerCase()}`;
            return currentPattern !== recordPattern;
          })
          .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {});
        
        updates[failedPath] = updatedFailedData;
      }
      
      // Add new link
      updates[`pasiLinks/${linkId}`] = {
        pasiRecordId: pasiRecord.id,
        studentCourseSummaryKey: `${studentKey}_${studentRecord.courseId}`,
        studentKey: studentKey,
        linkedAt,
        schoolYear: schoolYearWithUnderscore
      };
      
      // Update student course summary with the correct data format
      updates[`studentCourseSummaries/${studentKey}_${studentRecord.courseId}/pasiRecords/${pasiRecord.courseCode}`] = {
        courseDescription: pasiRecord.courseDescription,
        creditsAttempted: pasiRecord.creditsAttempted,
        period: pasiRecord.period,
        schoolYear: schoolYearWithSlash, // Use the slash format here
        studentName: pasiRecord.studentName,
        linkId: linkId,
        linkedAt
      };
      
      // Update PASI record status
      updates[`pasiRecords/${pasiRecord.id}/linked`] = true;
      updates[`pasiRecords/${pasiRecord.id}/linkedAt`] = linkedAt;

      await update(ref(db), updates);
      toast.success("Successfully linked PASI record");
      onClose();
    } catch (error) {
      console.error("Error linking PASI record:", error);
      toast.error("Failed to link PASI record");
    } finally {
      setLinkingId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Link Course</DialogTitle>
          <DialogDescription>
            Link PASI record {record?.courseCode} to student course
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading student records...</span>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : studentRecords.length === 0 ? (
            <div className="text-center py-4">No records found for this ASN</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>School Year</TableHead>
                  <TableHead>Student Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentRecords.map((studentRecord) => (
                  <TableRow key={studentRecord.id}>
                    <TableCell className="font-medium">
                      {studentRecord.firstName} {studentRecord.lastName}
                    </TableCell>
                    <TableCell>{studentRecord.courseValue}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {studentRecord.statusValue}
                      </Badge>
                    </TableCell>
                    <TableCell>{studentRecord.schoolYear}</TableCell>
                    <TableCell>{studentRecord.studentType}</TableCell>
                    <TableCell>
                    <Button
  size="sm"
  onClick={() => handleLink(studentRecord)}
  disabled={linkingId !== null}
>
  {linkingId === studentRecord.id ? (
    <Loader2 className="h-4 w-4 animate-spin mr-2" />
  ) : (
    <Link2 className="h-4 w-4 mr-2" />
  )}
  Link
</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourseLinkingDialog;