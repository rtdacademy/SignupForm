import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onChildAdded, onChildChanged, onChildRemoved } from 'firebase/database';
import FilterPanel from './FilterPanel';
import StudentList from './StudentList';
import StudentDetail from './StudentDetail';
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ChevronLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

function StudentManagement({ isFullScreen, onFullScreenToggle }) {
  const [studentSummaries, setStudentSummaries] = useState([]);
  const [filters, setFilters] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [availableFilters, setAvailableFilters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showStudentDetail, setShowStudentDetail] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Adjust this breakpoint as needed
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

    const db = getDatabase();
    const studentSummariesRef = ref(db, 'studentCourseSummaries');

    // Define the event handlers
    const handleChildAdded = (snapshot) => {
      const key = snapshot.key;
      const data = snapshot.val();
      const student = { ...data, id: key };

      setStudentSummaries((prevSummaries) => [...prevSummaries, student]);
    };

    const handleChildChanged = (snapshot) => {
      const key = snapshot.key;
      const data = snapshot.val();
      const updatedStudent = { ...data, id: key };

      setStudentSummaries((prevSummaries) =>
        prevSummaries.map((student) => (student.id === key ? updatedStudent : student))
      );
    };

    const handleChildRemoved = (snapshot) => {
      const key = snapshot.key;

      setStudentSummaries((prevSummaries) =>
        prevSummaries.filter((student) => student.id !== key)
      );
    };

    // Attach the listeners
    const unsubscribeChildAdded = onChildAdded(studentSummariesRef, handleChildAdded);
    const unsubscribeChildChanged = onChildChanged(studentSummariesRef, handleChildChanged);
    const unsubscribeChildRemoved = onChildRemoved(studentSummariesRef, handleChildRemoved);

    // Cleanup function
    return () => {
      unsubscribeChildAdded();
      unsubscribeChildChanged();
      unsubscribeChildRemoved();
    };
  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    if (isMobile) {
      setShowStudentDetail(true);
    }
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleBackToList = () => {
    setShowStudentDetail(false);
  };

  const renderStudentList = () => (
    <Card className="h-full bg-white shadow-md">
      <CardContent className="h-full p-2 overflow-hidden">
        <StudentList
          studentSummaries={studentSummaries}
          filters={filters}
          onStudentSelect={handleStudentSelect}
          searchTerm={searchTerm}
          selectedStudentId={selectedStudent?.id}
          isMobile={isMobile}
        />
      </CardContent>
    </Card>
  );

  const renderStudentDetail = () => (
    <Card className="h-full bg-white shadow-md">
      <CardContent className="h-full p-4 overflow-auto">
        <StudentDetail studentSummary={selectedStudent} />
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {(!isMobile || !showStudentDetail) && (
        <div className="flex-shrink-0 mb-4 relative z-50">
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            studentSummaries={studentSummaries}
            availableFilters={availableFilters}
            isFullScreen={isFullScreen}
            onFullScreenToggle={onFullScreenToggle}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            isMobile={isMobile}
          />
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        {isMobile ? (
          <AnimatePresence initial={false}>
            {showStudentDetail ? (
              <motion.div
                key="detail"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween' }}
                className="absolute inset-0 bg-white z-10"
              >
                <Button
                  onClick={handleBackToList}
                  className="m-2"
                  variant="ghost"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back to List
                </Button>
                <div className="h-full overflow-auto">
                  {renderStudentDetail()}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ x: 0 }}
                animate={{ x: 0 }}
                transition={{ type: 'tween' }}
                className="h-full"
              >
                {renderStudentList()}
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <div className="flex h-full space-x-4">
            <div className="w-96 h-full overflow-hidden">
              {renderStudentList()}
            </div>
            <div className="flex-1 h-full overflow-hidden">
              {renderStudentDetail()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentManagement;