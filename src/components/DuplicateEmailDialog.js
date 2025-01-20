import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { AlertCircle } from "lucide-react";

const DuplicateEmailDialog = ({ 
  open, 
  onOpenChange, 
  duplicates, 
  onContinue 
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Duplicate Email Addresses Detected
          </DialogTitle>
          <DialogDescription>
            The following students have the same email address listed as both the recipient
            and CC. If you continue, these CC addresses will be removed to prevent
            duplicate emails.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[400px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Student Email</TableHead>
                <TableHead>Duplicate CC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {duplicates.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {item.studentName}
                  </TableCell>
                  <TableCell>{item.studentEmail}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {item.duplicateCCs.map((cc, idx) => (
                        <div 
                          key={idx} 
                          className="text-sm text-red-600 line-through"
                        >
                          {cc}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onContinue();
              onOpenChange(false);
            }}
          >
            Continue Without CC
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DuplicateEmailDialog;