import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from '../components/ui/dialog';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { X, Search, ChevronLeft, ChevronRight, Users } from 'lucide-react';

// Number of students to display per page
const STUDENTS_PER_PAGE = 10;

const StudentSelectionDialog = ({ 
  open, 
  onOpenChange, 
  students, 
  title = "Selected Students", 
  description = "The following students match your notification criteria" 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  
  // Filter students based on search text
  const filteredStudents = searchText 
    ? students.filter(student => 
        (student.firstName && student.firstName.toLowerCase().includes(searchText.toLowerCase())) || 
        (student.lastName && student.lastName.toLowerCase().includes(searchText.toLowerCase())) || 
        (student.StudentEmail && student.StudentEmail.toLowerCase().includes(searchText.toLowerCase())) ||
        (student.StudentType_Value && student.StudentType_Value.toLowerCase().includes(searchText.toLowerCase()))
      )
    : students;
    
  // Calculate pagination values
  const totalPages = Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * STUDENTS_PER_PAGE;
  const endIndex = Math.min(startIndex + STUDENTS_PER_PAGE, filteredStudents.length);
  const studentsToDisplay = filteredStudents.slice(startIndex, endIndex);
  
  // Handle page navigation
  const goToPage = (page) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/50" />
        <DialogPrimitive.Content
          className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg"
        >
          <DialogHeader className="flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-xl flex items-center">
                <Users className="mr-2 h-5 w-5" />
                {title} ({filteredStudents.length})
              </DialogTitle>
              <DialogDescription>
                {description}
              </DialogDescription>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => onOpenChange(false)} 
              className="rounded-full h-8 w-8 p-0"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10 pr-4"
              placeholder="Search by name, email, or student type"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
            />
          </div>
          
          {/* Students Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Student Type</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>School Year</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsToDisplay.length > 0 ? (
                  studentsToDisplay.map((student, index) => (
                    <TableRow key={`${student.StudentEmail}-${student.CourseID || index}`}>
                      <TableCell>{startIndex + index + 1}</TableCell>
                      <TableCell className="font-medium">
                        {student.firstName || ''} {student.lastName || ''}
                        {student.preferredFirstName && student.preferredFirstName !== student.firstName && (
                          <span className="text-sm text-gray-500 ml-1">
                            ({student.preferredFirstName})
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{student.StudentEmail}</TableCell>
                      <TableCell>{student.StudentType_Value || 'N/A'}</TableCell>
                      <TableCell>{student.Course_Value || 'N/A'}</TableCell>
                      <TableCell>{student.School_x0020_Year_Value || 'N/A'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No students found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1}-{endIndex} of {filteredStudents.length} students
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};

export default StudentSelectionDialog;