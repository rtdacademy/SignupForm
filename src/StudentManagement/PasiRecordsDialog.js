import React, { useState, useEffect } from 'react';
import { getDatabase, ref, query, orderByChild, equalTo, onValue, push, update, get } from 'firebase/database';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../components/ui/table";
import { Database, Link as LinkIcon, Unlink, AlertCircle, Lock } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
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
  const [allPasiLinks, setAllPasiLinks] = useState({});
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);

  const studentCourseSummaryKey = `${sanitizeEmail(student.StudentEmail)}_${courseId}`;

  useEffect(() => {
    if (!isOpen || !studentAsn) return;

    const db = getDatabase();
    
    // Fetch PASI records for this student
    const pasiRef = ref(db, 'pasiRecords');
    const pasiQuery = query(pasiRef, orderByChild('asn'), equalTo(studentAsn));
    
    // Fetch ALL links to check for existing links
    const linksRef = ref(db, 'pasiLinks');
    
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

    const unsubscribeLinks = onValue(linksRef, (snapshot) => {
      if (snapshot.exists()) {
        const links = Object.entries(snapshot.val()).reduce((acc, [linkId, linkData]) => {
          acc[linkData.pasiRecordId] = { ...linkData, linkId };
          return acc;
        }, {});
        setAllPasiLinks(links);
      } else {
        setAllPasiLinks({});
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
      const newLinkRef = push(ref(db, 'pasiLinks'));
      const linkId = newLinkRef.key;
      const studentKey = sanitizeEmail(student.StudentEmail);
      
      const updates = {};
      const linkedAt = new Date().toISOString();
      
      // Format school year correctly if needed
      const schoolYearWithUnderscore = pasiRecord.schoolYear.includes('/') 
        ? pasiRecord.schoolYear.replace('/', '_') 
        : pasiRecord.schoolYear;
      
      // Create the summaryKey
      const summaryKey = `${studentKey}_${courseId}`;
      
      // Add the link to pasiLinks
      updates[`pasiLinks/${linkId}`] = {
        pasiRecordId: pasiRecord.id,
        studentCourseSummaryKey: summaryKey,
        studentKey: studentKey,
        linkedAt,
        schoolYear: schoolYearWithUnderscore,
        courseCode: pasiRecord.courseCode
      };
      
      // Update student course summary
      updates[`studentCourseSummaries/${summaryKey}/pasiRecords/${pasiRecord.courseCode}`] = {
        courseDescription: pasiRecord.courseDescription,
        creditsAttempted: pasiRecord.creditsAttempted,
        period: pasiRecord.period,
        schoolYear: pasiRecord.schoolYear.includes('/') 
          ? pasiRecord.schoolYear 
          : pasiRecord.schoolYear.replace('_', '/'),
        studentName: pasiRecord.studentName,
        linkId: linkId,
        linkedAt
      };
      
      // Update PASI record with link status and summaryKey
      updates[`pasiRecords/${pasiRecord.id}/linked`] = true;
      updates[`pasiRecords/${pasiRecord.id}/linkedAt`] = linkedAt;
      updates[`pasiRecords/${pasiRecord.id}/summaryKey`] = summaryKey;
  
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
      const linkData = allPasiLinks[pasiRecord.id];
      if (!linkData) throw new Error("Link not found");

      const updates = {};
      
      // Remove link
      updates[`pasiLinks/${linkData.linkId}`] = null;
      
      // Remove reference from student course summary
      updates[`studentCourseSummaries/${studentCourseSummaryKey}/pasiRecords/${pasiRecord.courseCode}`] = null;
      
      // Update PASI record
      updates[`pasiRecords/${pasiRecord.id}/linked`] = false;
      updates[`pasiRecords/${pasiRecord.id}/linkedAt`] = null;
      updates[`pasiRecords/${pasiRecord.id}/summaryKey`] = null;

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

  const renderActionButton = (record) => {
    const existingLink = allPasiLinks[record.id];
    
    if (!existingLink) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleLink(record)}
          disabled={linking}
        >
          <LinkIcon className="w-4 h-4 mr-2" />
          Link
        </Button>
      );
    }

    if (existingLink.studentCourseSummaryKey === studentCourseSummaryKey) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleUnlink(record)}
          disabled={linking}
        >
          <Unlink className="w-4 h-4 mr-2" />
          Unlink
        </Button>
      );
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex items-center">
              <Lock className="w-4 h-4 text-gray-400" />
              <span className="ml-2 text-gray-400">Linked to another course</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>This PASI record is already linked to another course</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
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
                      {renderActionButton(record)}
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