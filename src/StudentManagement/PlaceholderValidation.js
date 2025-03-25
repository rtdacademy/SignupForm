import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { AlertCircle, Check, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";

const PlaceholderValidation = ({ students, placeholders }) => {
  // Function to validate if a placeholder value exists for a student
  const validatePlaceholder = (student, placeholder) => {
    switch (placeholder.id) {
      case 'firstName':
        return student.preferredFirstName || student.firstName;
      case 'lastName':
        return student.lastName;
      case 'courseName':
        return student.Course_Value;
      case 'startDate':
        return student.ScheduleStartDate;
      case 'endDate':
        return student.ScheduleEndDate;
      case 'status':
        return student.Status_Value;
      case 'studentType':
        return student.StudentType_Value;
      default:
        return null;
    }
  };

  // Count missing values for each placeholder
  const getMissingCount = (placeholder) => {
    return students.filter(student => !validatePlaceholder(student, placeholder)).length;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <AlertCircle className="h-4 w-4 mr-2" />
          Validate Fields
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Field Validation Results</DialogTitle>
        </DialogHeader>
        <div className="overflow-auto max-h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Student</TableHead>
                {placeholders.map((placeholder) => (
                  <TableHead key={placeholder.id} className="text-center">
                    <div className="flex flex-col items-center">
                      {placeholder.label}
                      <div className="text-xs text-muted-foreground mt-1">
                        {placeholder.token}
                      </div>
                      {getMissingCount(placeholder) > 0 && (
                        <div className="text-xs text-red-500 mt-1">
                          ({getMissingCount(placeholder)} missing)
                        </div>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    {student.firstName} {student.lastName}
                  </TableCell>
                  {placeholders.map((placeholder) => {
                    const value = validatePlaceholder(student, placeholder);
                    return (
                      <TableCell key={placeholder.id} className="text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              {value ? (
                                <Check className="h-4 w-4 text-green-500 mx-auto" />
                              ) : (
                                <X className="h-4 w-4 text-red-500 mx-auto" />
                              )}
                            </TooltipTrigger>
                            <TooltipContent>
                              {value ? (
                                <p>Value: {value}</p>
                              ) : (
                                <p>No value available</p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlaceholderValidation;