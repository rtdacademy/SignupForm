import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { useSchoolYear } from '../context/SchoolYearContext';
import { useCourse } from '../context/CourseContext';
import { useTeacherStudentData } from '../Dashboard/hooks/useTeacherStudentData';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import FilterPanel from './FilterPanel';
import StudentList from './StudentList';
import StudentDetail from './StudentDetail';
import StudentMessaging from './StudentMessaging';
import GradebookDashboard from '../FirebaseCourses/components/gradebook/GradebookDashboard';
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ChevronLeft, Flame, User, ArrowLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";

function StudentManagement({ 
  isFullScreen, 
  onFullScreenToggle,
  // Add props for URL parameter support
  searchTerm: propSearchTerm,
  onSearchChange: propOnSearchChange,
  filters: propFilters,
  onFilterChange: propOnFilterChange 
}) {
  //console.log('StudentManagement component rendered');

  // Use the school year context for both year and student summaries
  const { 
    currentSchoolYear, 
    setCurrentSchoolYear, 
    pasiStudentSummariesCombined,
    isLoadingStudents 
  } = useSchoolYear();

  // Container ref for layout measurements
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Define available filters explicitly
  const filtersList = useMemo(
    () => [
      { key: 'Status_Value', label: 'Status' },
      { key: 'CourseID', label: 'Course' }, 
      { key: 'School_x0020_Year_Value', label: 'School Year' },
      { key: 'StudentType_Value', label: 'Student Type' },
      { key: 'DiplomaMonthChoices_Value', label: 'Diploma Month' },
      { key: 'Term', label: 'Term' },
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
  
  // Maintain local state but use props if provided
  const [localFilters, setLocalFilters] = useState(initialFilters);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [availableFilters, setAvailableFilters] = useState(filtersList);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showStudentDetail, setShowStudentDetail] = useState(false);
  const [teacherCategories, setTeacherCategories] = useState({});
  const [categoryTypes, setCategoryTypes] = useState([]);
  const [teacherNames, setTeacherNames] = useState({});
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [studentAsns, setStudentAsns] = useState({});
  const [showMultipleAsnsOnly, setShowMultipleAsnsOnly] = useState(false);
  const [recordTypeFilter, setRecordTypeFilter] = useState('yourway'); // Default to 'yourway' (hide PASI-only records)

  const { user_email_key, user } = useAuth();
  const { getCourseById } = useCourse();

  // Holds a count or a toggle to force re-mount
  const [detailRefreshKey, setDetailRefreshKey] = useState(0);

  const handleRefreshStudent = useCallback(() => {
    setDetailRefreshKey(prev => prev + 1);
  }, []);

  // Check if selected student has Firebase courses
  const selectedStudentHasFirebaseCourse = useMemo(() => {
    if (!selectedStudent?.CourseID) {
      console.log('🔍 Firebase Course Check - No Course ID:', selectedStudent);
      return false;
    }
    const courseData = getCourseById(selectedStudent.CourseID);
    const isFirebase = courseData?.firebaseCourse === true;
    
    console.log('🔍 Firebase Course Check:', {
      studentName: selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : 'None',
      courseId: selectedStudent.CourseID,
      courseData,
      isFirebaseCourse: isFirebase,
      timestamp: new Date().toLocaleTimeString()
    });
    
    return isFirebase;
  }, [selectedStudent?.CourseID, getCourseById]);

  // Get student email key for teacher data hook
  const selectedStudentEmailKey = useMemo(() => {
    if (!selectedStudent?.StudentEmail) return null;
    try {
      return sanitizeEmail(selectedStudent.StudentEmail);
    } catch (error) {
      console.error('Error sanitizing student email:', error);
      return null;
    }
  }, [selectedStudent?.StudentEmail]);

  // Teacher permissions for accessing student data
  const teacherPermissions = useMemo(() => ({
    canViewStudentData: true,
    isStaff: user?.email?.includes('@rtdacademy.com') || false,
    isTeacher: true
  }), [user?.email]);

  // Fetch student Firebase course data when selected student has Firebase courses
  const studentFirebaseData = useTeacherStudentData(
    selectedStudentHasFirebaseCourse ? selectedStudentEmailKey : null,
    teacherPermissions
  );

  // Handle toggle for filtering by multiple ASNs
  const handleToggleMultipleAsnsOnly = useCallback(() => {
    setShowMultipleAsnsOnly(prev => !prev);
  }, []);

  // Handle record type filter change
  const handleRecordTypeFilterChange = useCallback((filterType) => {
    setRecordTypeFilter(filterType);
  }, []);

  // Use props if provided, otherwise use local state
  const filters = propFilters !== undefined ? propFilters : localFilters;
  const searchTerm = propSearchTerm !== undefined ? propSearchTerm : localSearchTerm;

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

  // Setup ResizeObserver to monitor container width changes
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateContainerWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    
    // Initial measurement
    updateContainerWidth();
    
    // Setup ResizeObserver
    const resizeObserver = new ResizeObserver(updateContainerWidth);
    resizeObserver.observe(containerRef.current);
    
    // Handle window resize
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 768;
      setIsMobile(newIsMobile);
      updateContainerWidth();
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Additional effect to update width when selected students change
  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, [selectedStudents.size]);

  useEffect(() => {
    const db = getDatabase();
    const asnsRef = ref(db, 'ASNs');

    const handleAsnData = (snapshot) => {
      if (snapshot.exists()) {
        setStudentAsns(snapshot.val());
      } else {
        setStudentAsns({});
      }
    };

    const unsubscribe = onValue(asnsRef, handleAsnData);

    return () => unsubscribe();
  }, []);

  // Fetch category types
  useEffect(() => {
    const db = getDatabase();
    const typesRef = ref(db, 'categoryTypes');

    const handleTypes = (snapshot) => {
      if (snapshot.exists()) {
        const typesData = snapshot.val();
        const typesArray = Object.entries(typesData).map(([id, type]) => ({
          id,
          ...type
        }));
        setCategoryTypes(typesArray);
      } else {
        setCategoryTypes([]);
      }
    };

    const unsubscribe = onValue(typesRef, handleTypes);
    return () => unsubscribe();
  }, []);

  // Updated to use context
  const handleSchoolYearChange = useCallback((year) => {
    setCurrentSchoolYear(year);
  }, [setCurrentSchoolYear]);

  // Fetch teacher categories and names
  useEffect(() => {
    if (!user_email_key) return;

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
        setTeacherCategories(allCategories);
      } else {
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

    return () => {
      console.log('useEffect cleanup - Teacher categories listener removed');
      unsubscribe();
    };
  }, [user_email_key]);

  // Handle filter changes - updated to use prop function if available
  const handleFilterChange = useCallback((newFilters) => {
    if (propOnFilterChange) {
      propOnFilterChange(newFilters);
    } else {
      setLocalFilters(newFilters);
    }
  }, [propOnFilterChange]);

  // Handle student selection
  const handleStudentSelect = useCallback(
    (student) => {
      setSelectedStudent(student);
      if (isMobile) {
        setShowStudentDetail(true);
      }
    },
    [isMobile]
  );

  // Handle search term changes - updated to use prop function if available
  const handleSearchChange = useCallback((value) => {
    if (propOnSearchChange) {
      propOnSearchChange(value);
    } else {
      setLocalSearchTerm(value);
    }
  }, [propOnSearchChange]);

  // Handle back navigation on mobile
  const handleBackToList = useCallback(() => {
    setShowStudentDetail(false);
  }, []);

  // Handle selected students change
  const handleSelectedStudentsChange = useCallback((newSelectedStudents) => {
    setSelectedStudents(newSelectedStudents);
  }, []);

  // Handle close messaging
  const handleCloseMessaging = useCallback(() => {
    setSelectedStudents(new Set());
  }, []);

  // Memoize student summaries and available filters
  const memoizedStudentSummaries = useMemo(() => pasiStudentSummariesCombined, [pasiStudentSummariesCombined]);
  const memoizedAvailableFilters = useMemo(() => availableFilters, [availableFilters]);

  // Calculate list width based on container width and view state
  const listWidth = useMemo(() => {
    if (isMobile) return '100%';
    
    // Ensure we have a valid containerWidth
    if (!containerWidth) return '33.333%';
    
    // Always use 1/3 of the container for non-mobile
    return `${Math.floor(containerWidth / 3)}px`;
  }, [containerWidth, isMobile]);

  // Calculate detail width based on container width and view state
  const detailWidth = useMemo(() => {
    if (isMobile) return '100%';
    
    // Ensure we have a valid containerWidth
    if (!containerWidth) return '66.666%';
    
    // Always use 2/3 of the container for non-mobile
    return `${containerWidth - Math.floor(containerWidth / 3) - 16}px`; // 16px for gap
  }, [containerWidth, isMobile]);

  // Render student list
  const renderStudentList = useCallback(() => {
    if (isLoadingStudents) {
      return (
        <Card className="h-full bg-white shadow-md">
          <CardContent className="h-full p-2 overflow-hidden flex items-center justify-center">
            <div className="text-gray-500">Loading students...</div>
          </CardContent>
        </Card>
      );
    }
    
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
            categoryTypes={categoryTypes} 
            user_email_key={user_email_key}
            onSelectedStudentsChange={handleSelectedStudentsChange} 
            selectedStudents={selectedStudents} 
            onCourseRemoved={handleCourseRemoved}
            studentAsns={studentAsns}
            showMultipleAsnsOnly={showMultipleAsnsOnly}
            onToggleMultipleAsnsOnly={handleToggleMultipleAsnsOnly}
            recordTypeFilter={recordTypeFilter}
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
    categoryTypes,
    user_email_key,
    handleSelectedStudentsChange,
    selectedStudents,
    handleCourseRemoved,
    studentAsns,
    isLoadingStudents,
    showMultipleAsnsOnly,
    handleToggleMultipleAsnsOnly,
    recordTypeFilter
  ]);

  // Render student detail
  const renderStudentDetail = useCallback(() => {
    // Debug logging for Firebase course detection
    console.log('🔍 STUDENT MANAGEMENT - renderStudentDetail Debug:', {
      selectedStudent: selectedStudent ? {
        name: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
        courseId: selectedStudent.CourseID
      } : null,
      selectedStudentHasFirebaseCourse,
      studentFirebaseDataLoading: studentFirebaseData.loading,
      studentFirebaseDataCourses: studentFirebaseData.courses ? studentFirebaseData.courses.length : 0,
      studentFirebaseDataError: studentFirebaseData.error,
      timestamp: new Date().toLocaleTimeString()
    });

    // If the selected student has a Firebase course, show the GradebookDashboard
    if (selectedStudentHasFirebaseCourse && studentFirebaseData.courses) {
      const targetCourse = studentFirebaseData.courses.find(course => course.id === selectedStudent.CourseID);
      
      console.log('🎯 STUDENT MANAGEMENT - Firebase Course Search:', {
        selectedStudentCourseId: selectedStudent.CourseID,
        availableCourseIds: studentFirebaseData.courses.map(c => c.id),
        targetCourseFound: !!targetCourse,
        timestamp: new Date().toLocaleTimeString()
      });
      
      if (targetCourse) {
        // Console log for reviewing the course object passed to GradebookDashboard
        console.log('📊 STUDENT MANAGEMENT - GradebookDashboard Course Data:', {
          studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
          courseId: selectedStudent.CourseID,
          targetCourse,
          gradebookData: targetCourse.Gradebook,
          courseConfig: targetCourse.Gradebook?.courseConfig,
          courseStructure: targetCourse.Gradebook?.courseConfig?.courseStructure || targetCourse.Gradebook?.courseStructure,
          gradebookItems: targetCourse.Gradebook?.items,
          gradebookSummary: targetCourse.Gradebook?.summary,
          timestamp: new Date().toLocaleTimeString()
        });

        return (
          <Card className="h-full bg-white shadow-md">
            <CardContent className="h-full p-2 overflow-auto">
              {/* Teacher Context Header */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-600" />
                    <span className="font-medium text-orange-900">Firebase Course View</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </div>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    Teacher View
                  </Badge>
                </div>
                <p className="text-sm text-orange-700 mt-1">
                  Viewing student's gradebook data exactly as they would see it
                </p>
              </div>

              {/* GradebookDashboard Component */}
              <GradebookDashboard course={targetCourse} />
            </CardContent>
          </Card>
        );
      }
    }

    // Default to regular StudentDetail for non-Firebase courses or when no Firebase data
    return (
      <Card className="h-full bg-white shadow-md">
        <CardContent className="h-full p-4 overflow-auto">
          <StudentDetail
            key={detailRefreshKey}
            studentSummary={selectedStudent}
            isMobile={isMobile}
            onRefresh={handleRefreshStudent}
          />
        </CardContent>
      </Card>
    );
  }, [
    selectedStudent, 
    selectedStudentHasFirebaseCourse,
    studentFirebaseData.courses,
    isMobile, 
    detailRefreshKey,
    handleRefreshStudent
  ]);
  
  return (
    <div className="flex flex-col h-full overflow-hidden" ref={containerRef}>
      {(!isMobile || !showStudentDetail) && (
        <div className="flex-shrink-0 space-y-2 mb-4 relative z-50">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
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
                categoryTypes={categoryTypes}
                recordTypeFilter={recordTypeFilter}
                onRecordTypeFilterChange={handleRecordTypeFilterChange}
              />
            </div>
          </div>
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
                        pasiStudentSummariesCombined.find(s => s.id === id)
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
          <div className="flex h-full" style={{ gap: '16px' }}>
            {/* Use explicit pixel width for consistent sizing */}
            <div style={{ width: listWidth, height: '100%', overflow: 'hidden', flexShrink: 0 }}>
              {renderStudentList()}
            </div>
            <div style={{ width: detailWidth, height: '100%', overflow: 'hidden', flexShrink: 0 }}>
              {selectedStudents.size > 0 ? (
                <StudentMessaging
                  selectedStudents={Array.from(selectedStudents).map(id => 
                    pasiStudentSummariesCombined.find(s => s.id === id)
                  ).filter(Boolean)}
                  onClose={handleCloseMessaging}
                  onNotification={handleMessagingNotification}
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