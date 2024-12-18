// StudentManagement.js

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getDatabase, ref, onChildAdded, onChildChanged, onChildRemoved, onValue, get } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import FilterPanel from './FilterPanel';
import StudentList from './StudentList';
import StudentDetail from './StudentDetail';
import StudentMessaging from './StudentMessaging';
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ChevronLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast, Toaster } from "sonner";

function StudentManagement({ isFullScreen, onFullScreenToggle }) {
  console.log('StudentManagement component rendered');

  // Define available filters explicitly
  const filtersList = useMemo(
    () => [
      { key: 'Status_Value', label: 'Status' },
      { key: 'CourseID', label: 'Course' }, 
      { key: 'School_x0020_Year_Value', label: 'School Year' },
      { key: 'StudentType_Value', label: 'Student Type' },
      { key: 'DiplomaMonthChoices_Value', label: 'Diploma Month' },
      { key: 'ActiveFutureArchived_Value', label: 'State' },
      { key: 'categories', label: 'Categories' }
    ],
    []
  );

  // Initialize filters state directly
  const initialFilters = useMemo(() => {
    const initial = {};
    filtersList.forEach(({ key }) => {
      initial[key] = [];
    });
    return initial;
  }, [filtersList]);

  const [studentSummaries, setStudentSummaries] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [availableFilters, setAvailableFilters] = useState(filtersList);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showStudentDetail, setShowStudentDetail] = useState(false);
  const [teacherCategories, setTeacherCategories] = useState({});
  const [teacherNames, setTeacherNames] = useState({});
  const [selectedStudents, setSelectedStudents] = useState(new Set()); // Add this state

  const { user_email_key } = useAuth();

  const handleMessagingNotification = useCallback((message, type = 'success') => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      default:
        toast(message);
    }
  }, []);

  const handleCourseRemoved = useCallback((studentName, courseName) => {
    toast.success(`Removed course "${courseName}" from ${studentName}`);
    // If the removed course was for the selected student, clear the selection
    setSelectedStudent(null);
  }, []);

  // Handle window resize to update isMobile state
  useEffect(() => {
    //console.log('useEffect - Window resize listener added');
    const handleResize = () => {
     // console.log('Window resized, updating isMobile state');
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
     // console.log('useEffect cleanup - Window resize listener removed');
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Fetch student summaries from Firebase
  useEffect(() => {
    //console.log('useEffect - Firebase listeners added for student summaries');

    const db = getDatabase();
    const studentSummariesRef = ref(db, 'studentCourseSummaries');

    // Define the event handlers
    const handleChildAdded = (snapshot) => {
     // console.log('Child added:', snapshot.key);
      const key = snapshot.key;
      const data = snapshot.val();
      const student = { ...data, id: key };

      setStudentSummaries((prevSummaries) => [...prevSummaries, student]);
    };

    const handleChildChanged = (snapshot) => {
     // console.log('Child changed:', snapshot.key);
      const key = snapshot.key;
      const data = snapshot.val();
      const updatedStudent = { ...data, id: key };

      setStudentSummaries((prevSummaries) =>
        prevSummaries.map((student) => (student.id === key ? updatedStudent : student))
      );
    };

    const handleChildRemoved = (snapshot) => {
     // console.log('Child removed:', snapshot.key);
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
     // console.log('useEffect cleanup - Firebase listeners removed');
      unsubscribeChildAdded();
      unsubscribeChildChanged();
      unsubscribeChildRemoved();
    };
  }, []);

  // Fetch teacher categories and names
  useEffect(() => {
    if (!user_email_key) return;

    //console.log('useEffect - Fetching teacher categories for:', user_email_key);

    const db = getDatabase();
    const categoriesRef = ref(db, `teacherCategories`);

    const handleValueChange = async (snapshot) => {
      if (snapshot.exists()) {
        const categoriesData = snapshot.val();
        // Process categoriesData to include teacherEmailKey
        const allCategories = {};
        Object.entries(categoriesData).forEach(([teacherEmailKey, categories]) => {
          const categoryList = Object.entries(categories)
            .filter(([_, category]) => !category.archived)
            .map(([id, category]) => ({ id, teacherEmailKey, ...category }));
          allCategories[teacherEmailKey] = categoryList;
        });
       // console.log('Fetched teacher categories:', allCategories);
        setTeacherCategories(allCategories);
      } else {
        //console.log('No teacher categories found.');
        setTeacherCategories({});
      }
    };

    const unsubscribe = onValue(categoriesRef, handleValueChange);

    // Fetch teacher names
    const fetchTeacherNames = async () => {
      const staffRef = ref(db, 'staff');
      try {
        const snapshot = await get(staffRef);
        if (snapshot.exists()) {
          const staffData = snapshot.val();
          const names = Object.entries(staffData).reduce((acc, [email, data]) => {
            acc[email] = `${data.firstName} ${data.lastName}`;
            return acc;
          }, {});
          setTeacherNames(names);
        }
      } catch (error) {
        console.error("Error fetching teacher names:", error);
      }
    };

    fetchTeacherNames();

    // Cleanup function
    return () => {
      console.log('useEffect cleanup - Teacher categories listener removed');
      unsubscribe();
    };
  }, [user_email_key]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters) => {
  //  console.log('Filters changed:', newFilters);
    setFilters(newFilters);
  }, []);

  // Handle student selection
  const handleStudentSelect = useCallback(
    (student) => {
      //console.log('Student selected:', student);
      setSelectedStudent(student);
      if (isMobile) {
        setShowStudentDetail(true);
      }
    },
    [isMobile]
  );

  // Handle search term changes
  const handleSearchChange = useCallback((value) => {
   // console.log('Search term changed:', value);
    setSearchTerm(value);
  }, []);

  // Handle back navigation on mobile
  const handleBackToList = useCallback(() => {
   // console.log('Back to student list');
    setShowStudentDetail(false);
  }, []);

  // Add this handler
  const handleSelectedStudentsChange = useCallback((newSelectedStudents) => {
    setSelectedStudents(newSelectedStudents);
  }, []);

  // Add this handler
  const handleCloseMessaging = useCallback(() => {
    setSelectedStudents(new Set());
  }, []);

  // Memoize student summaries and available filters
  const memoizedStudentSummaries = useMemo(() => studentSummaries, [studentSummaries]);
  const memoizedAvailableFilters = useMemo(() => availableFilters, [availableFilters]);


  // Render student list
  const renderStudentList = useCallback(() => {
   // console.log('Rendering student list');
    return (
      <Card className="h-full bg-white shadow-md">
        <CardContent className="h-full p-2 overflow-hidden">
          <StudentList
            studentSummaries={memoizedStudentSummaries}
            filters={filters}
            onStudentSelect={handleStudentSelect}
            searchTerm={searchTerm}
            selectedStudentId={selectedStudent?.id}
            isMobile={isMobile}
            teacherCategories={teacherCategories}
            user_email_key={user_email_key}
            onSelectedStudentsChange={handleSelectedStudentsChange} 
            selectedStudents={selectedStudents} 
            onCourseRemoved={handleCourseRemoved}
          />
        </CardContent>
      </Card>
    );
  }, [
    memoizedStudentSummaries,
    filters,
    handleStudentSelect,
    searchTerm,
    selectedStudent?.id,
    isMobile,
    teacherCategories,
    user_email_key,
    handleSelectedStudentsChange,
    selectedStudents,
    handleCourseRemoved
  ]);

  // Render student detail
  const renderStudentDetail = useCallback(() => {
    return (
      <Card className="h-full bg-white shadow-md">
        <CardContent className="h-full p-4 overflow-auto">
          <StudentDetail 
            studentSummary={selectedStudent} 
            isMobile={isMobile}  
          />
        </CardContent>
      </Card>
    );
  }, [selectedStudent, isMobile]); 

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Toaster />
      {console.log('Rendering main StudentManagement component')}
      {(!isMobile || !showStudentDetail) && (
        <div className="flex-shrink-0 mb-4 relative z-50">
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            studentSummaries={memoizedStudentSummaries}
            availableFilters={memoizedAvailableFilters}
            isFullScreen={isFullScreen}
            onFullScreenToggle={onFullScreenToggle}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            teacherCategories={teacherCategories}
            teacherNames={teacherNames}
            user_email_key={user_email_key}
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
                  {selectedStudents.size > 0 ? (
                    <StudentMessaging
                      selectedStudents={Array.from(selectedStudents).map(id => 
                        studentSummaries.find(s => s.id === id)
                      ).filter(Boolean)}
                      onClose={handleCloseMessaging}
                      onNotification={handleMessagingNotification} 
                    />
                  ) : (
                    renderStudentDetail()
                  )}
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
            <div className="w-1/3 h-full overflow-hidden"> 
              {renderStudentList()}
            </div>
            <div className="flex-1 h-full overflow-hidden">
              {selectedStudents.size > 0 ? (
                <StudentMessaging
                  selectedStudents={Array.from(selectedStudents).map(id => 
                    studentSummaries.find(s => s.id === id)
                  ).filter(Boolean)}
                  onClose={handleCloseMessaging}
                />
              ) : (
                renderStudentDetail()
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentManagement;
