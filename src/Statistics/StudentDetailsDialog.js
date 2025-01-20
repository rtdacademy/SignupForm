import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useCourse } from '../context/CourseContext';
import { useState, useMemo } from 'react';
import { X } from 'lucide-react';

const StudentDetailsDialog = ({ isOpen, onClose, students, filterType, filterValue }) => {
    const { getCourseById } = useCourse();
    const defaultFilters = {
      name: '',
      course: 'all',
      status: 'all',
      studentType: 'all'
    };
  
    const [filters, setFilters] = useState(defaultFilters);
  
    // Extract unique values and ensure no empty strings
    const filterOptions = useMemo(() => {
      const options = {
        courses: new Set(),
        statuses: new Set(),
        studentTypes: new Set()
      };
  
      students.forEach(student => {
        const course = getCourseById(student.CourseID)?.Title;
        const status = student.Status_Value || 'Unknown';
        const studentType = student.StudentType_Value || 'Unknown';
  
        if (course) options.courses.add(course);
        if (status) options.statuses.add(status);
        if (studentType) options.studentTypes.add(studentType);
      });
  
      return {
        courses: Array.from(options.courses).filter(Boolean).sort(),
        statuses: Array.from(options.statuses).filter(Boolean).sort(),
        studentTypes: Array.from(options.studentTypes).filter(Boolean).sort()
      };
    }, [students, getCourseById]);
  
    const filteredStudents = students.filter(student => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const course = getCourseById(student.CourseID)?.Title || 'Unknown';
      const status = student.Status_Value || 'Unknown';
      const studentType = student.StudentType_Value || 'Unknown';
      
      return (
        fullName.includes(filters.name.toLowerCase()) &&
        (filters.course === 'all' || course === filters.course) &&
        (filters.status === 'all' || status === filters.status) &&
        (filters.studentType === 'all' || studentType === filters.studentType)
      );
    });
  
    const handleFilterChange = (key, value) => {
      setFilters(prev => ({ ...prev, [key]: value }));
    };
  
    const clearFilters = () => {
      setFilters(defaultFilters);
    };
  
    const hasActiveFilters = filters.name !== '' || 
      filters.course !== 'all' || 
      filters.status !== 'all' || 
      filters.studentType !== 'all';
  
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Student Details - {filterType}: {filterValue}
            </DialogTitle>
          </DialogHeader>
  
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredStudents.length} of {students.length}</div>
              </CardContent>
            </Card>
  
            <div className="space-y-4">
              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
  
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    placeholder="Filter by name..."
                    value={filters.name}
                    onChange={(e) => handleFilterChange('name', e.target.value)}
                    className="max-w-sm"
                  />
                </div>
  
                <div className="space-y-2">
                  <label className="text-sm font-medium">Course</label>
                  <Select
                    value={filters.course}
                    onValueChange={(value) => handleFilterChange('course', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      {filterOptions.courses.map(course => (
                        <SelectItem key={course} value={course || 'unknown'}>
                          {course || 'Unknown'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
  
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {filterOptions.statuses.map(status => (
                        <SelectItem key={status} value={status || 'unknown'}>
                          {status || 'Unknown'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
  
                <div className="space-y-2">
                  <label className="text-sm font-medium">Student Type</label>
                  <Select
                    value={filters.studentType}
                    onValueChange={(value) => handleFilterChange('studentType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {filterOptions.studentTypes.map(type => (
                        <SelectItem key={type} value={type || 'unknown'}>
                          {type || 'Unknown'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
  
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Student Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => {
                    const course = getCourseById(student.CourseID);
                    return (
                      <TableRow key={student.StudentEmail}>
                        <TableCell className="font-medium">
                          {student.firstName} {student.lastName}
                        </TableCell>
                        <TableCell>{course?.Title || 'Unknown'}</TableCell>
                        <TableCell>
                          <Badge variant={
                            student.Status_Value === 'Default' ? 'secondary' :
                            student.Status_Value === 'Red' ? 'destructive' :
                            'default'
                          }>
                            {student.Status_Value || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>{student.StudentType_Value || 'Unknown'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            {filteredStudents.length === 0 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No students found matching the current filters
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  
  export default StudentDetailsDialog;