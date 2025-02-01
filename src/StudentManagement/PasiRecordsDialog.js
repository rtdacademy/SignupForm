import React, { useState, useEffect } from 'react';
import { getDatabase, ref, query, orderByChild, equalTo, onValue, push, update, remove } from 'firebase/database';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../components/ui/table";
import { Database, Link as LinkIcon, Unlink, AlertCircle } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { format } from 'date-fns';
import { toast } from "sonner";
import { sanitizeEmail } from '../utils/sanitizeEmail';

const PasiRecordsDialog = ({ 
  isOpen, 
  onOpenChange, 
  studentAsn, 
  courseId,
  student,
}) => {
  const [pasiRecords, setPasiRecords] = useState([]);
  const [pasiLinks, setPasiLinks] = useState({});
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);

  const studentCourseSummaryKey = `${sanitizeEmail(student.StudentEmail)}_${courseId}`;

  // Fetch PASI records and their links
  useEffect(() => {
    if (!isOpen || !studentAsn) return;

    const db = getDatabase();
    
    // Fetch PASI records
    const pasiRef = ref(db, 'pasiRecords');
    const pasiQuery = query(pasiRef, orderByChild('asn'), equalTo(studentAsn));
    
    // Fetch existing links for this student course
    const linksRef = ref(db, 'pasiLinks');
    const linksQuery = query(linksRef, orderByChild('studentCourseSummaryKey'), equalTo(studentCourseSummaryKey));
    
    setLoading(true);
    
    const unsubscribePasi = onValue(pasiQuery, (snapshot) => {
      if (snapshot.exists()) {
        const records = Object.entries(snapshot.val()).map(([key, value]) => ({
          id: key,
          ...value
        }));
        setPasiRecords(records);
      } else {
        setPasiRecords([]);
      }
    });

    const unsubscribeLinks = onValue(linksQuery, (snapshot) => {
      if (snapshot.exists()) {
        const links = Object.entries(snapshot.val()).reduce((acc, [linkId, linkData]) => {
          acc[linkData.pasiRecordId] = { ...linkData, linkId };
          return acc;
        }, {});
        setPasiLinks(links);
      } else {
        setPasiLinks({});
      }
      setLoading(false);
    });

    return () => {
      unsubscribePasi();
      unsubscribeLinks();
    };
  }, [isOpen, studentAsn, studentCourseSummaryKey]);

  const handleLink = async (pasiRecord) => {
    setLinking(true);
    const db = getDatabase();
    
    try {
      // Generate a new link ID
      const newLinkRef = push(ref(db, 'pasiLinks'));
      const linkId = newLinkRef.key;
      const studentKey = sanitizeEmail(student.StudentEmail);
      
      // Create updates object
      const updates = {};
      
      // Add the link record with the new studentKey property
      updates[`pasiLinks/${linkId}`] = {
        pasiRecordId: pasiRecord.id,
        studentCourseSummaryKey: `${studentKey}_${courseId}`,
        studentKey: studentKey,  // Add this new property
        linkedAt: new Date().toISOString()
      };
      
      // Add PASI data to student course summaries
      updates[`studentCourseSummaries/${studentKey}_${courseId}/pasiRecords/${pasiRecord.courseCode}`] = {
        courseDescription: pasiRecord.courseDescription,
        creditsAttempted: pasiRecord.creditsAttempted,
        period: pasiRecord.period,
        schoolYear: pasiRecord.schoolYear,
        studentName: pasiRecord.studentName,
        linkId: linkId
      };
  
      // Perform all updates atomically
      await update(ref(db), updates);
  
      toast.success("Successfully linked PASI record");
    } catch (error) {
      console.error("Error linking PASI record:", error);
      toast.error("Failed to link PASI record");
    } finally {
      setLinking(false);
    }
  };

  const handleUnlink = async (pasiRecord) => {
    setLinking(true);
    const db = getDatabase();
    
    try {
      const linkData = pasiLinks[pasiRecord.id];
      if (!linkData) throw new Error("Link not found");

      const updates = {};
      
      // Remove the link record
      updates[`pasiLinks/${linkData.linkId}`] = null;
      
      // Remove PASI data from student course summaries
      updates[`studentCourseSummaries/${studentCourseSummaryKey}/pasiRecords/${pasiRecord.courseCode}`] = null;

      // Perform all updates atomically
      await update(ref(db), updates);

      toast.success("Successfully unlinked PASI record");
    } catch (error) {
      console.error("Error unlinking PASI record:", error);
      toast.error("Failed to unlink PASI record");
    } finally {
      setLinking(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === '-') return '-';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            PASI Records
          </DialogTitle>
        </DialogHeader>
        
        <Alert className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Link PASI records to associate them with this student's course.
          </AlertDescription>
        </Alert>

        <ScrollArea className="flex-1">
          {loading ? (
            <div className="text-center py-8">Loading records...</div>
          ) : pasiRecords.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>School Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Exit Date</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pasiRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      <div>{record.courseCode}</div>
                      <div className="text-xs text-gray-500">{record.courseDescription}</div>
                    </TableCell>
                    <TableCell>{record.schoolYear?.replace('_', '-')}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={record.status === 'Active' ? 'success' : 'secondary'}
                        className="capitalize"
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(record.exitDate)}</TableCell>
                    <TableCell>{record.creditsAttempted}</TableCell>
                    <TableCell className="capitalize">{record.period}</TableCell>
                    <TableCell className="text-right">
                      {pasiLinks[record.id] ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnlink(record)}
                          disabled={linking}
                        >
                          <Unlink className="w-4 h-4 mr-2" />
                          Unlink
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLink(record)}
                          disabled={linking}
                        >
                          <LinkIcon className="w-4 h-4 mr-2" />
                          Link
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No PASI records found for this student.
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PasiRecordsDialog;