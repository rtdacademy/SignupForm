import React, { useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import Select from 'react-select';
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { ArrowUpDown } from 'lucide-react';

function StudentList({ studentSummaries, filters, onStudentSelect, searchTerm }) {
  const [sortKey, setSortKey] = useState('lastName');
  const [sortOrder, setSortOrder] = useState('asc');

  // Apply filters and search
  const filteredStudents = studentSummaries.filter((student) => {
    const matchesFilters = Object.keys(filters).every((filterKey) => {
      if (filters[filterKey].length === 0) return true;
      const studentValue = String(student[filterKey]).toLowerCase();
      return filters[filterKey].some(
        (filterValue) => String(filterValue).toLowerCase() === studentValue
      );
    });

    const matchesSearch =
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.StudentEmail.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilters && matchesSearch;
  });

  // Sorting
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const aValue = a[sortKey] || '';
    const bValue = b[sortKey] || '';
    if (sortOrder === 'asc') {
      return String(aValue).localeCompare(String(bValue));
    } else {
      return String(bValue).localeCompare(String(aValue));
    }
  });

  const Row = ({ index, style }) => {
    const student = sortedStudents[index];
    return (
      <Card className="mb-2" style={style}>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h4 className="font-bold text-lg">
                {student.firstName} {student.lastName}
              </h4>
              <p className="text-sm text-muted-foreground">{student.StudentEmail}</p>
            </div>
            <div className="mt-2 sm:mt-0 text-right">
              <Badge variant={student.Status_Value === 'Behind' ? "destructive" : "success"}>
                {student.Status_Value}
              </Badge>
              <p className="text-sm mt-1">
                <span className="font-semibold">Last Week:</span> {student.StatusCompare}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Streak:</span> {student.StatusStreakCount}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <p><span className="font-semibold">Course:</span> {student.Course_Value}</p>
            <p><span className="font-semibold">Mark:</span> {student.CurrentMark}%</p>
            <p><span className="font-semibold">Year:</span> {student.School_x0020_Year_Value}</p>
            <p><span className="font-semibold">Type:</span> {student.StudentType_Value}</p>
          </div>
          <Button 
            variant="outline" 
            className="mt-4 w-full"
            onClick={() => onStudentSelect(student)}
          >
            View Details
          </Button>
        </CardContent>
      </Card>
    );
  };

  const sortOptions = [
    { value: 'lastName', label: 'Last Name' },
    { value: 'firstName', label: 'First Name' },
    { value: 'Status_Value', label: 'Status' },
    { value: 'Course_Value', label: 'Course' },
    { value: 'CurrentMark', label: 'Current Mark' },
    { value: 'School_x0020_Year_Value', label: 'School Year' },
    { value: 'StudentType_Value', label: 'Student Type' },
    { value: 'DiplomaMonthChoices_Value', label: 'Diploma Month' },
  ];

  return (
    <div>
      <h3 className="text-2xl font-semibold mb-4">Students</h3>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0 sm:space-x-2">
        <Select
          options={sortOptions}
          value={sortOptions.find(option => option.value === sortKey)}
          onChange={(selectedOption) => setSortKey(selectedOption.value)}
          className="w-full sm:w-[180px]"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {sortedStudents.length > 0 ? (
        <ScrollArea className="h-[calc(100vh-250px)]">
          <List
            height={window.innerHeight - 250}
            itemCount={sortedStudents.length}
            itemSize={200}
            width={'100%'}
          >
            {Row}
          </List>
        </ScrollArea>
      ) : (
        <p className="text-center text-muted-foreground">No students match the selected filters.</p>
      )}
    </div>
  );
}

export default StudentList;