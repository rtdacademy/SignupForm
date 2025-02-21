import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { format } from 'date-fns';

const PrimarySchoolsView = ({ summariesData, selectedSchoolYear }) => {
  const [selectedSchool, setSelectedSchool] = useState(null);

  // Get schools organized by student type
  const schoolsByType = useMemo(() => {
    const typeMap = new Map();
    
    // First pass: Count students per school and collect student types
    const schoolCounts = new Map();
    const schoolTypes = new Map();
    
    summariesData.forEach(student => {
      if (student.School_x0020_Year_Value === selectedSchoolYear && 
          student.primarySchoolName &&
          student.StudentType_Value) {
        // Count students per school
        const count = schoolCounts.get(student.primarySchoolName) || 0;
        schoolCounts.set(student.primarySchoolName, count + 1);
        
        // Collect all student types for each school
        const types = schoolTypes.get(student.primarySchoolName) || new Set();
        types.add(student.StudentType_Value);
        schoolTypes.set(student.primarySchoolName, types);
      }
    });

    // Second pass: Organize schools by their primary student type
    schoolTypes.forEach((types, schoolName) => {
      // Get the most common student type for this school
      const typeCount = new Map();
      summariesData.forEach(student => {
        if (student.primarySchoolName === schoolName && 
            student.School_x0020_Year_Value === selectedSchoolYear) {
          const count = typeCount.get(student.StudentType_Value) || 0;
          typeCount.set(student.StudentType_Value, count + 1);
        }
      });

      // Find the most common type
      let primaryType = Array.from(typeCount.entries())
        .sort((a, b) => b[1] - a[1])[0][0];

      // Add school to its primary type category
      const schoolsOfType = typeMap.get(primaryType) || [];
      schoolsOfType.push({
        name: schoolName,
        count: schoolCounts.get(schoolName),
        types: Array.from(types)
      });
      typeMap.set(primaryType, schoolsOfType);
    });

    // Convert to array and sort types and schools
    return Array.from(typeMap.entries())
      .map(([type, schools]) => ({
        type,
        schools: schools.sort((a, b) => a.name.localeCompare(b.name))
      }))
      .sort((a, b) => a.type.localeCompare(b.type));
  }, [summariesData, selectedSchoolYear]);

  // Filter students by selected school
  const schoolStudents = useMemo(() => {
    if (!selectedSchool) return [];
    
    return summariesData
      .filter(student => 
        student.School_x0020_Year_Value === selectedSchoolYear &&
        student.primarySchoolName === selectedSchool
      )
      .map(student => ({
        ...student,
        ScheduleStartDate: student.ScheduleStartDate ? 
          format(new Date(student.ScheduleStartDate), 'MMM d, yyyy') : '',
        ScheduleEndDate: student.ScheduleEndDate ? 
          format(new Date(student.ScheduleEndDate), 'MMM d, yyyy') : ''
      }))
      .sort((a, b) => (a.lastName || '').localeCompare(b.lastName || ''));
  }, [summariesData, selectedSchool, selectedSchoolYear]);

  if (schoolsByType.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No primary schools found for the selected school year.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* School Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Primary Schools by Student Type</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-4">
            {schoolsByType.map((typeGroup) => (
              <AccordionItem 
                key={typeGroup.type} 
                value={typeGroup.type}
                className="border rounded-lg px-4"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold">{typeGroup.type}</span>
                    <span className="text-sm text-muted-foreground">
                      {typeGroup.schools.length} school{typeGroup.schools.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                    {typeGroup.schools.map(school => (
                      <button
                        key={school.name}
                        onClick={() => setSelectedSchool(school.name)}
                        className={`p-4 text-left rounded-lg transition-colors ${
                          selectedSchool === school.name
                            ? 'bg-primary text-white'
                            : 'bg-secondary hover:bg-secondary/80 text-white'
                        }`}
                      >
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{school.name}</span>
                          <span className="text-sm opacity-90">
                            {school.count} student{school.count !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Student Table */}
      {selectedSchool && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedSchool} Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>ASN</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schoolStudents.map((student, index) => (
                    <TableRow key={`${student.StudentEmail}-${index}`}>
                      <TableCell>
                        {student.preferredFirstName || student.firstName} {student.lastName}
                      </TableCell>
                      <TableCell>{student.Status_Value}</TableCell>
                      <TableCell>{student.Course_Value}</TableCell>
                      <TableCell>{student.StudentType_Value}</TableCell>
                      <TableCell>{student.asn}</TableCell>
                      <TableCell>{student.StudentEmail}</TableCell>
                      <TableCell>{student.ScheduleStartDate}</TableCell>
                      <TableCell>{student.ScheduleEndDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PrimarySchoolsView;