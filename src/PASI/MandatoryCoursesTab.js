import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { 
  Search, 
  X, 
  FileDown, 
  Copy, 
  RefreshCw, 
  AlertCircle, 
  Link2, 
  ExternalLink, 
  Loader2,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { getDatabase, ref, get } from 'firebase/database';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import Papa from 'papaparse';

const ITEMS_PER_PAGE = 100;

const MandatoryCoursesTab = ({ selectedSchoolYear }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentsWithoutMandatoryCourses, setStudentsWithoutMandatoryCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortState, setSortState] = useState({ column: 'lastName', direction: 'asc' });
  const [isExporting, setIsExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [totalCompliance, setTotalCompliance] = useState({ total: 0, missing: 0, percentage: 0 });
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);

  // Fetch data when school year changes
  useEffect(() => {
    if (selectedSchoolYear) {
      fetchMandatoryCoursesData();
    }
  }, [selectedSchoolYear]);

  // Fetch all necessary data
  const fetchMandatoryCoursesData = async (isRefresh = false) => {
    if (!selectedSchoolYear) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      const db = getDatabase();
      
      // Format school year for querying
      const formattedYear = selectedSchoolYear.replace('/', '_');
      
      // Step 1: Get all student course summaries for the selected school year
      const summariesRef = ref(db, 'studentCourseSummaries');
      const yearQuery = query =>
        query.orderByChild('School_x0020_Year_Value')
             .equalTo(formatSchoolYearWithSlash(selectedSchoolYear));
      
      const summariesSnapshot = await get(summariesRef, { query: yearQuery });
      
      if (!summariesSnapshot.exists()) {
        setStudentsWithoutMandatoryCourses([]);
        setTotalCompliance({ total: 0, missing: 0, percentage: 0 });
        throw new Error(`No student records found for ${selectedSchoolYear}`);
      }
      
      // Step 2: Get the mandatory courses tracking data
      const com1255Ref = ref(db, 'mandatoryCourses/COM1255');
      const inf2020Ref = ref(db, 'mandatoryCourses/INF2020');
      
      const [com1255Snapshot, inf2020Snapshot] = await Promise.all([
        get(com1255Ref),
        get(inf2020Ref)
      ]);
      
      // Create sets of ASNs that have taken mandatory courses
      const com1255Students = new Set();
      const inf2020Students = new Set();
      
      if (com1255Snapshot.exists()) {
        Object.keys(com1255Snapshot.val()).forEach(asn => {
          com1255Students.add(asn);
        });
      }
      
      if (inf2020Snapshot.exists()) {
        Object.keys(inf2020Snapshot.val()).forEach(asn => {
          inf2020Students.add(asn);
        });
      }
      
      // Step 3: Process student records
      const studentData = {};
      
      summariesSnapshot.forEach(childSnapshot => {
        const summaryKey = childSnapshot.key;
        const summary = childSnapshot.val();
        
        // Skip Adult and International students
        if (summary.StudentType_Value === "Adult Student" || 
            summary.StudentType_Value === "International Student") {
          return;
        }
        
        // Get the student key from the summary key
        const studentKey = summaryKey.split('_')[0];
        
        // Get clean ASN
        const asn = summary.asn?.replace(/-/g, '');
        if (!asn) return; // Skip if no ASN
        
        // Check if this ASN is in either mandatory course list
        const hasTakenCOM1255 = com1255Students.has(asn);
        const hasTakenINF2020 = inf2020Students.has(asn);
        const hasTakenEither = hasTakenCOM1255 || hasTakenINF2020;
        
        // If student has already been processed
        if (studentData[studentKey]) {
          studentData[studentKey].courses.push({
            courseId: summary.CourseID,
            courseTitle: summary.Course_Value,
            summary
          });
          return;
        }
        
        // Add new student
        studentData[studentKey] = {
          studentKey,
          firstName: summary.firstName || '',
          lastName: summary.lastName || '',
          asn: summary.asn || '',
          asnNoDashes: asn,
          studentType: summary.StudentType_Value || '',
          email: summary.StudentEmail || '',
          hasTakenCOM1255,
          hasTakenINF2020,
          hasTakenEither,
          courses: [{
            courseId: summary.CourseID,
            courseTitle: summary.Course_Value,
            summary
          }]
        };
      });
      
      // Step 4: Filter students who haven't taken either course
      const missingMandatoryCourses = Object.values(studentData)
        .filter(student => !student.hasTakenEither);
      
      // Step 5: Calculate compliance stats
      const totalStudents = Object.values(studentData).length;
      const missingStudents = missingMandatoryCourses.length;
      const compliancePercentage = totalStudents > 0 ? 
        Math.round((totalStudents - missingStudents) / totalStudents * 100) : 0;
      
      setStudentsWithoutMandatoryCourses(missingMandatoryCourses);
      setTotalCompliance({
        total: totalStudents,
        missing: missingStudents,
        percentage: compliancePercentage
      });
      
      // Reset to first page when data changes
      setCurrentPage(1);
      
    } catch (error) {
      console.error("Error fetching mandatory courses data:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  
  // Helper function to format school year with slash
  const formatSchoolYearWithSlash = (year) => {
    if (year.includes('/')) return year;
    if (year.includes('_')) return year.replace('_', '/');
    return year;
  };

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    if (!studentsWithoutMandatoryCourses.length) return [];
    
    // Apply search filter
    if (!searchTerm.trim()) return studentsWithoutMandatoryCourses;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return studentsWithoutMandatoryCourses.filter(student => 
      student.firstName.toLowerCase().includes(lowerSearchTerm) ||
      student.lastName.toLowerCase().includes(lowerSearchTerm) ||
      student.asn.toLowerCase().includes(lowerSearchTerm) ||
      student.email.toLowerCase().includes(lowerSearchTerm) ||
      student.studentType.toLowerCase().includes(lowerSearchTerm) ||
      student.courses.some(course => 
        course.courseTitle.toLowerCase().includes(lowerSearchTerm)
      )
    );
  }, [studentsWithoutMandatoryCourses, searchTerm]);
  
  // Sort filtered students
  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      const aValue = a[sortState.column] || '';
      const bValue = b[sortState.column] || '';
      
      const direction = sortState.direction === 'asc' ? 1 : -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction * aValue.localeCompare(bValue);
      }
      
      if (aValue < bValue) return -1 * direction;
      if (aValue > bValue) return 1 * direction;
      return 0;
    });
  }, [filteredStudents, sortState]);
  
  // Paginate sorted students
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sortedStudents.slice(startIndex, endIndex);
  }, [sortedStudents, currentPage]);
  
  const totalPages = useMemo(() => 
    Math.ceil(sortedStudents.length / ITEMS_PER_PAGE) || 1, 
    [sortedStudents.length]
  );
  
  // Handle sort column change
  const handleSort = (column) => {
    setSortState(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1); // Reset to first page when sorting
  };
  
  // Clear search function
  const clearSearch = () => {
    setSearchTerm('');
  };
  
  // Copy ASN to clipboard
  const handleCopyAsn = (asn) => {
    if (!asn) return;
    navigator.clipboard.writeText(asn);
    toast.success('ASN copied to clipboard');
  };
  
  // Export data to CSV
  const exportToCsv = async () => {
    try {
      setIsExporting(true);
      
      // Prepare data for CSV
      const csvData = sortedStudents.map(student => ({
        LastName: student.lastName,
        FirstName: student.firstName,
        ASN: student.asn,
        Email: student.email,
        StudentType: student.studentType,
        Courses: student.courses.map(c => c.courseTitle).join(', '),
        SchoolYear: selectedSchoolYear
      }));
      
      // Generate CSV
      const csv = Papa.unparse(csvData);
      
      // Create file and download link
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `students-missing-mandatory-courses-${selectedSchoolYear.replace('/', '-')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('CSV exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };
  
  // View student details
  const handleViewStudentDetails = (student) => {
    setSelectedStudent(student);
    setShowStudentDetails(true);
  };
  
  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            />
          </PaginationItem>
          
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            // Show first page, last page, and pages around current page
            let pageToShow;
            
            if (totalPages <= 7) {
              // If 7 or fewer pages, show all
              pageToShow = i + 1;
            } else if (currentPage <= 4) {
              // If near the start, show first 5 pages, ellipsis, and last page
              if (i < 5) {
                pageToShow = i + 1;
              } else if (i === 5) {
                return (
                  <PaginationItem key="ellipsis-start">
                    <span className="px-2">...</span>
                  </PaginationItem>
                );
              } else {
                pageToShow = totalPages;
              }
            } else if (currentPage >= totalPages - 3) {
              // If near the end, show first page, ellipsis, and last 5 pages
              if (i === 0) {
                pageToShow = 1;
              } else if (i === 1) {
                return (
                  <PaginationItem key="ellipsis-end">
                    <span className="px-2">...</span>
                  </PaginationItem>
                );
              } else {
                pageToShow = totalPages - (6 - i);
              }
            } else {
              // If in the middle, show first page, ellipsis, current page and neighbors, ellipsis, and last page
              if (i === 0) {
                pageToShow = 1;
              } else if (i === 1) {
                return (
                  <PaginationItem key="ellipsis-start">
                    <span className="px-2">...</span>
                  </PaginationItem>
                );
              } else if (i === 5) {
                return (
                  <PaginationItem key="ellipsis-end">
                    <span className="px-2">...</span>
                  </PaginationItem>
                );
              } else if (i === 6) {
                pageToShow = totalPages;
              } else {
                pageToShow = currentPage + (i - 3);
              }
            }
            
            return (
              <PaginationItem key={pageToShow}>
                <PaginationLink
                  isActive={currentPage === pageToShow}
                  onClick={() => setCurrentPage(pageToShow)}
                >
                  {pageToShow}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNext
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  // Sortable header component
  const SortableHeader = ({ column, label }) => {
    const isActive = sortState.column === column;
    
    return (
      <TableHead 
        className="cursor-pointer hover:bg-muted/50 transition-colors" 
        onClick={() => handleSort(column)}
      >
        <div className="flex items-center">
          {label}
          <span className="ml-1 inline-flex">
            {isActive ? (
              sortState.direction === 'asc' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="m5 12 7-7 7 7"/>
                  <path d="m5 19 7-7 7 7"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="m19 5-7 7-7-7"/>
                  <path d="m19 12-7 7-7-7"/>
                </svg>
              )
            ) : null}
          </span>
        </div>
      </TableHead>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-sm text-muted-foreground">
            Loading mandatory courses data...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
          <Button 
            variant="outline" 
            className="mt-2" 
            onClick={() => fetchMandatoryCoursesData()}
            size="sm"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Header with summary statistics */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted rounded-lg">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">Computer Course Compliance</h3>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setHelpDialogOpen(true)}
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Students who haven't taken COM1255 or INF2020
            </p>
          </div>
          
          <div className="flex items-end gap-8">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-2xl font-bold">{totalCompliance.total}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Missing Courses</p>
              <p className="text-2xl font-bold text-red-600">{totalCompliance.missing}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Compliance</p>
              <p className={`text-2xl font-bold ${
                totalCompliance.percentage >= 90 ? 'text-green-600' : 
                totalCompliance.percentage >= 70 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {totalCompliance.percentage}%
              </p>
            </div>
          </div>
        </div>
        
        {/* Search and actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, ASN, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-8"
            />
            {searchTerm && (
              <Button
                variant="ghost" 
                size="sm" 
                className="absolute right-0 top-0 h-9 w-9 p-0"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchMandatoryCoursesData(true)}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              {refreshing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCsv}
              disabled={isExporting || !studentsWithoutMandatoryCourses.length}
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4" />
                  Export CSV
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Results count */}
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {filteredStudents.length} students
          </Badge>
          {searchTerm && (
            <Badge variant="secondary">
              Filtered
            </Badge>
          )}
        </div>
        
        {/* No data state */}
        {!studentsWithoutMandatoryCourses.length && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center pt-8 pb-8">
              <BookOpen className="h-10 w-10 text-primary mb-4" />
              <p className="text-lg font-medium">
                {selectedSchoolYear ? 
                  'No students missing mandatory courses' : 
                  'Select a school year to view data'
                }
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedSchoolYear ? 
                  'All students have taken either COM1255 or INF2020' : 
                  'Choose a school year from the dropdown above'
                }
              </p>
            </CardContent>
          </Card>
        )}
        
        {/* Students table */}
        {studentsWithoutMandatoryCourses.length > 0 && (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader column="lastName" label="Student Name" />
                    <SortableHeader column="asn" label="ASN" />
                    <SortableHeader column="email" label="Email" />
                    <SortableHeader column="studentType" label="Student Type" />
                    <TableHead>Courses</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        No students match your search
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedStudents.map((student) => (
                      <TableRow key={student.studentKey}>
                        <TableCell className="font-medium">
                          {student.lastName}, {student.firstName}
                        </TableCell>
                        <TableCell className="font-mono">
                          {student.asn || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {student.email || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {student.studentType || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {student.courses.slice(0, 3).map((course, i) => (
                              <Badge key={i} variant="outline" className="whitespace-nowrap">
                                {course.courseTitle}
                              </Badge>
                            ))}
                            {student.courses.length > 3 && (
                              <Badge variant="outline">
                                +{student.courses.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyAsn(student.asn)}
                                  title="Copy ASN"
                                  disabled={!student.asn}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy ASN</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewStudentDetails(student)}
                                  title="View Details"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View Details</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            {student.asnNoDashes && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    title="View in PASI Prep"
                                    onClick={() => window.open(`https://extranet.education.alberta.ca/PASI/PASIprep/view-student/${student.asnNoDashes}`, '_blank')}
                                  >
                                    <Link2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>View in PASI Prep</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            {renderPagination()}
          </>
        )}
        
        {/* Student details dialog */}
        <Dialog open={showStudentDetails} onOpenChange={setShowStudentDetails}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Student Details</DialogTitle>
              <DialogDescription>
                Student information and courses
              </DialogDescription>
            </DialogHeader>
            
            {selectedStudent && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm font-medium">Name</p>
                      <p className="text-sm">{selectedStudent.lastName}, {selectedStudent.firstName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">ASN</p>
                      <p className="text-sm font-mono">{selectedStudent.asn || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm">{selectedStudent.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Student Type</p>
                      <p className="text-sm">{selectedStudent.studentType || 'Unknown'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Enrolled Courses</h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto p-1">
                    {selectedStudent.courses.map((course, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">
                            Course ID: {course.courseId}
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            {selectedSchoolYear}
                          </p>
                        </div>
                        <p className="font-medium mt-1">{course.courseTitle}</p>
                        
                        {course.summary && (
                          <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                            {Object.entries(course.summary)
                              .filter(([key, value]) => 
                                typeof value !== 'object' && 
                                !key.includes('_x0020_') &&
                                key !== 'firstName' &&
                                key !== 'lastName' &&
                                key !== 'Course' &&
                                key !== 'CourseID' &&
                                key !== 'StudentEmail' &&
                                key !== 'asn' &&
                                key !== 'studentKey'
                              )
                              .map(([key, value]) => (
                                <div key={key} className="flex flex-col">
                                  <span className="text-muted-foreground">{key}</span>
                                  <span>{String(value)}</span>
                                </div>
                              ))
                            }
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                onClick={() => setShowStudentDetails(false)} 
                variant="outline"
              >
                Close
              </Button>
              {selectedStudent?.asnNoDashes && (
                <Button
                  onClick={() => window.open(`https://extranet.education.alberta.ca/PASI/PASIprep/view-student/${selectedStudent.asnNoDashes}`, '_blank')}
                >
                  <Link2 className="h-4 w-4 mr-2" />
                  Open in PASI Prep
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Help dialog */}
        <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>About Mandatory Computer Courses</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <p>
                All students except for Adult Students and International Students should take either COM1255 or INF2020 as a mandatory graduation requirement.
              </p>
              
              <div className="p-3 border rounded-lg">
                <h3 className="font-medium mb-1">COM1255</h3>
                <p className="text-sm text-muted-foreground">Computer Science 1</p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <h3 className="font-medium mb-1">INF2020</h3>
                <p className="text-sm text-muted-foreground">Information Processing 2</p>
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Information</AlertTitle>
                <AlertDescription>
                  This report helps identify students who need to take one of these courses to meet graduation requirements.
                </AlertDescription>
              </Alert>
            </div>
            
            <DialogFooter>
              <Button onClick={() => setHelpDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default MandatoryCoursesTab;