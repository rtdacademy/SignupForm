import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Check, X } from 'lucide-react';

const ErrorHelpDialog = ({ isOpen, onClose }) => {
  const errorTypes = [
    {
      error: "No ASN Found",
      studentInPASI: true,
      studentInYourWay: false,
      courseInPASI: true,
      courseInYourWay: "N/A",
      rootCause: "ASN in PASI doesn't match any ASN in YourWay → No email mapping.",
    },
    {
      error: "Student course not found",
      studentInPASI: true,
      studentInYourWay: true,
      courseInPASI: true,
      courseInYourWay: false,
      rootCause: "Student exists in YourWay, but the course in PASI doesn't match YourWay.",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Error Help Guide</DialogTitle>
        </DialogHeader>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Error Type</TableHead>
                <TableHead>Student in PASI</TableHead>
                <TableHead>Student in YourWay</TableHead>
                <TableHead>Course in PASI</TableHead>
                <TableHead>Course in YourWay</TableHead>
                <TableHead>Root Cause</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errorTypes.map((error, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{error.error}</TableCell>
                  <TableCell>
                    {error.studentInPASI ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-red-600" />}
                  </TableCell>
                  <TableCell>
                    {error.studentInYourWay ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-red-600" />}
                  </TableCell>
                  <TableCell>
                    {error.courseInPASI ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-red-600" />}
                  </TableCell>
                  <TableCell>
                    {error.courseInYourWay === "N/A" ? "N/A" : (error.courseInYourWay ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-red-600" />)}
                  </TableCell>
                  <TableCell>{error.rootCause}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ErrorHelpDialog;