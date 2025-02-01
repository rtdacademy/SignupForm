import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Table, TableBody, TableCell, TableRow } from "../components/ui/table";
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { ScrollArea } from "../components/ui/scroll-area";

const PASIRecordDialog = ({ isOpen, onClose, pasiRecordId }) => {
  const [record, setRecord] = useState(null);

  useEffect(() => {
    if (!pasiRecordId || !isOpen) return;

    const db = getDatabase();
    const recordRef = ref(db, `pasiRecords/${pasiRecordId}`);

    const unsubscribe = onValue(recordRef, (snapshot) => {
      setRecord(snapshot.val());
    });

    return () => off(recordRef);
  }, [pasiRecordId, isOpen]);

  // Define fields to display and their labels
  const fields = [
    { key: 'studentName', label: 'Student Name' },
    { key: 'courseCode', label: 'Course Code' },
    { key: 'courseDescription', label: 'Course Description' },
    { key: 'status', label: 'Status' },
    { key: 'creditsAttempted', label: 'Credits' },
    { key: 'term', label: 'Term' },
    { key: 'period', label: 'Period' },
    { key: 'schoolYear', label: 'School Year' },
    { key: 'asn', label: 'ASN' },
    { key: 'email', label: 'Email' },
    { key: 'approved', label: 'Approved' },
    { key: 'assignmentDate', label: 'Assignment Date' },
    { key: 'exitDate', label: 'Exit Date' },
    { key: 'fundingRequested', label: 'Funding Requested' },
    { key: 'dualEnrolment', label: 'Dual Enrolment' },
    { key: 'deleted', label: 'Deleted' },
    { key: 'value', label: 'Value' },
    { key: 'lastUpdated', label: 'Last Updated' },
    { key: 'matchStatus', label: 'Match Status' },
    { key: 'linked', label: 'Linked' },
    { key: 'linkedAt', label: 'Linked At' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>PASI Record Details</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[600px]">
          {record && (
            <Table>
              <TableBody>
                {fields.map(({ key, label }) => (
                  <TableRow key={key}>
                    <TableCell className="font-medium">{label}</TableCell>
                    <TableCell>{record[key]?.toString() || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PASIRecordDialog;