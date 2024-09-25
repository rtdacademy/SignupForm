import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, child } from 'firebase/database';
import FilterPanel from './FilterPanel';
import StudentList from './StudentList';
import StudentDetail from './StudentDetail';
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

function StudentManagement() {
  const [studentSummaries, setStudentSummaries] = useState([]);
  const [filters, setFilters] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [availableFilters, setAvailableFilters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('list');

  useEffect(() => {
    // Define available filters explicitly
    const filtersList = [
      { key: 'Status_Value', label: 'Status' },
      { key: 'Course_Value', label: 'Course' },
      { key: 'School_x0020_Year_Value', label: 'School Year' },
      { key: 'StudentType_Value', label: 'Student Type' },
      { key: 'DiplomaMonthChoices_Value', label: 'Diploma Month' },
      { key: 'ActiveFutureArchived_Value', label: 'Active or Archived' },
    ];
    setAvailableFilters(filtersList);

    // Initialize filters with empty arrays
    const initialFilters = {};
    filtersList.forEach(({ key }) => {
      initialFilters[key] = [];
    });
    setFilters(initialFilters);

    // Fetch the student summaries from the database
    const fetchStudentSummaries = async () => {
      const dbRef = ref(getDatabase());
      try {
        const snapshot = await get(child(dbRef, 'studentCourseSummaries'));
        if (snapshot.exists()) {
          const data = snapshot.val();
          // Convert data from object to array
          const summaries = Object.values(data);
          setStudentSummaries(summaries);
        } else {
          console.log('No student summaries available');
        }
      } catch (error) {
        console.error('Error fetching student summaries:', error);
      }
    };

    fetchStudentSummaries();
  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setActiveTab('detail');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-4 flex-grow flex flex-col">
        <div className="mb-4">
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            studentSummaries={studentSummaries}
            availableFilters={availableFilters}
          />
        </div>

        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Student List</TabsTrigger>
            <TabsTrigger value="detail">Student Detail</TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="flex-grow">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <StudentList
                studentSummaries={studentSummaries}
                filters={filters}
                onStudentSelect={handleStudentSelect}
                searchTerm={searchTerm}
              />
            </ScrollArea>
          </TabsContent>
          <TabsContent value="detail" className="flex-grow">
            <ScrollArea className="h-[calc(100vh-300px)]">
              {selectedStudent ? (
                <StudentDetail studentSummary={selectedStudent} />
              ) : (
                <div className="text-center text-muted-foreground">Select a student to view details</div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default StudentManagement;