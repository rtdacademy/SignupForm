import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getDatabase, ref, onValue, get, off } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { useSchoolYear } from '../context/SchoolYearContext';
import { useCourse } from '../context/CourseContext';
import { useTeacherStudentData } from '../Dashboard/hooks/useTeacherStudentData';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { getLessonAccessibility } from '../FirebaseCourses/utils/lessonAccess';
import FilterPanel from './FilterPanel';
import StudentList from './StudentList';
import StudentDetail from './StudentDetail';
import StudentMessaging from './StudentMessaging';
import GradebookDashboard from '../FirebaseCourses/components/gradebook/GradebookDashboard';
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ChevronLeft, Flame, User, ArrowLeft, InfoIcon, UserCheck, Activity } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { useUserPreferences } from '../context/UserPreferencesContext';
import StudentNotes from './StudentNotes';
import { ClipboardList, X, Maximize2 } from 'lucide-react';
import StudentDetailsSheet from './StudentDetailsSheet';
import RegistrationInfo from './RegistrationInfo';
import StudentActivitySheet from './StudentActivitySheet';
import { Sheet, SheetContent } from "../components/ui/sheet";

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
  const { preferences, updatePreferences } = useUserPreferences();
  
  // State to track if selected student's course is a Firebase course
  const [selectedStudentHasFirebaseCourse, setSelectedStudentHasFirebaseCourse] = useState(false);
  
  // State for notes panel (similar to StudentDetail)
  const [isNotesVisible, setIsNotesVisible] = useState(preferences?.notesVisible ?? true);
  const [isNotesSheetOpen, setIsNotesSheetOpen] = useState(false);
  const [studentNotes, setStudentNotes] = useState([]);
  
  // State for action buttons and sheets
  const [isStudentDetailsSheetOpen, setIsStudentDetailsSheetOpen] = useState(false);
  const [isRegistrationSheetOpen, setIsRegistrationSheetOpen] = useState(false);
  const [isActivitySheetOpen, setIsActivitySheetOpen] = useState(false);
  const [userClaims, setUserClaims] = useState(null);

  // Holds a count or a toggle to force re-mount
  const [detailRefreshKey, setDetailRefreshKey] = useState(0);

  const handleRefreshStudent = useCallback(() => {
    setDetailRefreshKey(prev => prev + 1);
  }, []);

  // Fetch user custom claims for permission checking
  useEffect(() => {
    const fetchUserClaims = async () => {
      if (user) {
        try {
          const tokenResult = await user.getIdTokenResult();
          setUserClaims(tokenResult.claims);
        } catch (error) {
          console.error('Error fetching user claims:', error);
          setUserClaims(null);
        }
      } else {
        setUserClaims(null);
      }
    };
    
    fetchUserClaims();
  }, [user]);

  // Helper functions to check user permissions
  const isAdminUser = useCallback(() => {
    return userClaims?.permissions?.isAdmin === true || userClaims?.isAdminUser === true;
  }, [userClaims]);

  const isSuperAdminUser = useCallback(() => {
    return userClaims?.permissions?.isSuperAdmin === true || userClaims?.isSuperAdminUser === true;
  }, [userClaims]);

  const isStaffUser = useCallback(() => {
    return userClaims?.permissions?.isStaff === true || userClaims?.isStaffUser === true;
  }, [userClaims]);
  
  // Initialize notes visibility from preferences
  useEffect(() => {
    if (preferences?.notesVisible !== undefined) {
      setIsNotesVisible(preferences.notesVisible);
    }
  }, [preferences?.notesVisible]);

  // Effect to check if selected student's course is a Firebase course
  useEffect(() => {
    const checkFirebaseCourse = async () => {
      if (!selectedStudent?.CourseID) {
        setSelectedStudentHasFirebaseCourse(false);
        return;
      }

      try {
        const db = getDatabase();
        const courseRef = ref(db, `courses/${selectedStudent.CourseID}/firebaseCourse`);
        const snapshot = await get(courseRef);
        const isFirebase = snapshot.val() === true;
        
        console.log('🔍 Firebase Course Check (Database):', {
          studentName: selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : 'None',
          courseId: selectedStudent.CourseID,
          firebaseCourseValue: snapshot.val(),
          isFirebaseCourse: isFirebase,
          timestamp: new Date().toLocaleTimeString()
        });
        
        setSelectedStudentHasFirebaseCourse(isFirebase);
      } catch (error) {
        console.error('Error checking Firebase course status:', error);
        setSelectedStudentHasFirebaseCourse(false);
      }
    };

    checkFirebaseCourse();
  }, [selectedStudent?.CourseID]);
  
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

  // Effect to load student notes when student is selected with real-time updates
  useEffect(() => {
    if (!selectedStudent?.StudentEmail || !selectedStudent?.CourseID || !selectedStudentEmailKey) {
      setStudentNotes([]);
      return;
    }

    const db = getDatabase();
    const notesRef = ref(
      db, 
      `students/${selectedStudentEmailKey}/courses/${selectedStudent.CourseID}/jsonStudentNotes`
    );
    
    const unsubscribe = onValue(notesRef, (snapshot) => {
      if (snapshot.exists()) {
        const notes = snapshot.val();
        setStudentNotes(Array.isArray(notes) ? notes : []);
      } else {
        setStudentNotes([]);
      }
    }, (error) => {
      console.error('Error loading student notes:', error);
      setStudentNotes([]);
    });

    return () => unsubscribe();
  }, [selectedStudent?.StudentEmail, selectedStudent?.CourseID, selectedStudentEmailKey]);

  // Teacher permissions for accessing student data
  const teacherPermissions = useMemo(() => ({
    canViewStudentData: true,
    isStaff: user?.email?.includes('@rtdacademy.com') || false,
    isTeacher: true
  }), [user?.email]);

  // Fetch student Firebase data when a student is selected (needed for StudentDetailsSheet)
  const studentFirebaseData = useTeacherStudentData(
    selectedStudentEmailKey,
    teacherPermissions
  );

  // Memoize the specific Firebase data we need to prevent unnecessary re-renders
  const memoizedFirebaseCourses = useMemo(() => studentFirebaseData.courses, [studentFirebaseData.courses]);
  const memoizedFirebaseProfile = useMemo(() => studentFirebaseData.profile, [studentFirebaseData.profile]);
  const memoizedFirebaseLoading = useMemo(() => studentFirebaseData.loading, [studentFirebaseData.loading]);

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
  
  const handleToggleNotesPanel = useCallback(() => {
    setIsNotesVisible(prev => {
      const newValue = !prev;
      // Save preference
      updatePreferences({
        ...preferences,
        notesVisible: newValue
      });
      return newValue;
    });
  }, [preferences, updatePreferences]);
  
  const handleNotesUpdate = useCallback((updatedNotes) => {
    setStudentNotes(updatedNotes);
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
    if (!selectedStudent) {
      return (
        <Card className="h-full bg-white shadow-md">
          <CardContent className="h-full p-4 overflow-auto flex items-center justify-center">
            <p className="text-gray-500">Select a student to view details</p>
          </CardContent>
        </Card>
      );
    }

    // Check if student is missing critical data
    if (selectedStudent.archiveStatus === "Completed") {
      return (
        <Card className="h-full bg-white shadow-md">
          <CardContent className="h-full p-4 overflow-auto">
            <div className="flex flex-col items-center justify-center h-full">
              <User className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Limited Student Information Available</h3>
              <p className="text-gray-500 text-center mb-4">This student's profile is incomplete. Some features may not be available.</p>
              {(selectedStudent.firstName || selectedStudent.lastName || selectedStudent.StudentEmail) && (
                <div className="text-sm text-gray-600 mt-4 p-4 bg-gray-50 rounded-lg">
                  {selectedStudent.firstName && selectedStudent.lastName && (
                    <p><strong>Name:</strong> {selectedStudent.firstName} {selectedStudent.lastName}</p>
                  )}
                  {selectedStudent.StudentEmail && (
                    <p><strong>Email:</strong> {selectedStudent.StudentEmail}</p>
                  )}
                  {selectedStudent.CourseID && (
                    <p><strong>Course ID:</strong> {selectedStudent.CourseID}</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    // Determine which component to render
    let detailComponent;

    // If the selected student has a Firebase course, show the GradebookDashboard
    if (selectedStudentHasFirebaseCourse && memoizedFirebaseCourses && memoizedFirebaseCourses.length > 0) {
      // Try to find the course by exact match first, then by string conversion
      let targetCourse = memoizedFirebaseCourses.find(course => course.id === selectedStudent.CourseID);
      
      // If not found, try string/number conversion
      if (!targetCourse) {
        targetCourse = memoizedFirebaseCourses.find(course => 
          String(course.id) === String(selectedStudent.CourseID) ||
          course.CourseID === selectedStudent.CourseID ||
          String(course.CourseID) === String(selectedStudent.CourseID)
        );
      }
      
      if (targetCourse) {
        // Calculate actual student lesson accessibility based on their progress
        // This shows the real accessibility status that the student experiences
        const courseStructure = targetCourse.Gradebook?.courseConfig?.courseStructure || 
                               targetCourse.Gradebook?.courseStructure || 
                               targetCourse.courseStructure;
        
        const gradebookWithGrades = {
          ...targetCourse.Gradebook,
          grades: {
            assessments: targetCourse?.Grades?.assessments || {}
          }
        };
        
        const lessonAccessibility = getLessonAccessibility(
          courseStructure, 
          targetCourse.Gradebook?.items || {}, 
          gradebookWithGrades,
          {
            isDeveloperBypass: false // Show actual student restrictions in teacher view
          }
        );

        detailComponent = (
          <GradebookDashboard 
            course={targetCourse}
            profile={memoizedFirebaseProfile}
            lessonAccessibility={lessonAccessibility}
            showHeader={false}
          />
        );
      }
    }

    // Default to regular StudentDetail for non-Firebase courses or when no Firebase data
    if (!detailComponent) {
      detailComponent = (
        <StudentDetail
          key={detailRefreshKey}
          studentSummary={selectedStudent}
          isMobile={isMobile}
          onRefresh={handleRefreshStudent}
        />
      );
    }

    // Wrap with notes panel layout (similar to StudentDetail.js)
    return (
      <Card className="h-full bg-white shadow-md">
        <CardContent className="h-full p-2 overflow-hidden">
          <div className="flex h-full">
            {/* Notes Panel - Left side with animation */}
            <AnimatePresence mode="wait">
              {isNotesVisible && (
                <motion.div
                  key="notes-panel"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "320px", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ 
                    duration: 0.3, 
                    ease: "easeInOut",
                    width: { duration: 0.3 },
                    opacity: { duration: 0.2 }
                  }}
                  className="flex-shrink-0 h-full mr-4 overflow-hidden bg-white rounded-xl border-t-4 border-t-indigo-500 border-x border-b border-gray-200 shadow-md"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                    className="p-3 h-full"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-semibold text-indigo-600 flex items-center">
                        <ClipboardList className="h-4 w-4 mr-1" />
                        {memoizedFirebaseProfile ? 
                          `${memoizedFirebaseProfile.preferredFirstName || memoizedFirebaseProfile.firstName || ''} ${memoizedFirebaseProfile.lastName || ''}`.trim() :
                          `${selectedStudent.firstName || ''} ${selectedStudent.lastName || ''}`.trim()
                        }
                      </h4>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleToggleNotesPanel}
                          className="h-6 w-6 p-0"
                          title="Close notes panel"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsNotesSheetOpen(true)}
                          className="h-6 w-6 p-0"
                          title="Expand notes"
                        >
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="h-[calc(100%-2rem)] overflow-hidden">
                      <StudentNotes
                        studentEmail={selectedStudentEmailKey}
                        courseId={selectedStudent.CourseID}
                        initialNotes={studentNotes}
                        onNotesUpdate={handleNotesUpdate}
                        allowEdit={true}
                        isExpanded={false}
                      />
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main content area */}
            <div className="flex-1 overflow-auto relative">
              {/* Floating Action Buttons Overlay */}
              <div className="absolute left-2 top-2 z-10 flex flex-col space-y-2">
                {/* Notes Toggle Button - when notes are hidden */}
                <AnimatePresence>
                  {!isNotesVisible && (
                    <motion.div
                      key="notes-toggle"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleToggleNotesPanel}
                        className="h-8 w-8 p-0 bg-white shadow-md border border-gray-200 hover:bg-gray-50"
                        title="Show notes panel"
                      >
                        <ClipboardList className="h-4 w-4 text-indigo-600" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Action Buttons - when student is selected and has complete data */}
                {selectedStudent && selectedStudent.archiveStatus !== "Completed" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.2 }}
                    className="flex flex-col space-y-1"
                  >
                    {/* More Info Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsStudentDetailsSheetOpen(true)}
                      className="h-8 w-8 p-0 bg-white shadow-md border border-gray-200 hover:bg-gray-50"
                      title="More Info"
                    >
                      <InfoIcon className="h-4 w-4 text-[#40b3b3]" />
                    </Button>
                    
                    {/* Registration Button - Admin only */}
                    {isAdminUser() && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsRegistrationSheetOpen(true)}
                        className="h-8 w-8 p-0 bg-white shadow-md border border-gray-200 hover:bg-gray-50"
                        title="Registration"
                      >
                        <UserCheck className="h-4 w-4 text-orange-600" />
                      </Button>
                    )}
                    
                    {/* Activity Button - Hidden for now */}
                    {/* <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsActivitySheetOpen(true)}
                      className="h-8 w-8 p-0 bg-white shadow-md border border-gray-200 hover:bg-gray-50"
                      title="Activity"
                    >
                      <Activity className="h-4 w-4 text-[#40b3b3]" />
                    </Button> */}
                  </motion.div>
                )}
              </div>
              {detailComponent}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }, [
    selectedStudent, 
    selectedStudentHasFirebaseCourse,
    memoizedFirebaseCourses,
    memoizedFirebaseProfile,
    memoizedFirebaseLoading,
    studentFirebaseData.error,
    isMobile, 
    detailRefreshKey,
    handleRefreshStudent,
    isNotesVisible,
    selectedStudentEmailKey,
    studentNotes,
    handleNotesUpdate,
    handleToggleNotesPanel
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
      
      {/* Notes Expanded Sheet */}
      <Sheet open={isNotesSheetOpen} onOpenChange={setIsNotesSheetOpen}>
        <SheetContent side="right" className="w-full md:w-2/3 bg-white p-6 overflow-hidden flex flex-col">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="mb-4 flex-shrink-0">
              <h2 className="text-xl font-bold text-[#1fa6a7] flex items-center">
                <ClipboardList className="h-5 w-5 mr-2" />
                {memoizedFirebaseProfile ? 
                  `${memoizedFirebaseProfile.preferredFirstName || memoizedFirebaseProfile.firstName || ''} ${memoizedFirebaseProfile.lastName || ''}`.trim() :
                  selectedStudent ? `${selectedStudent.firstName || ''} ${selectedStudent.lastName || ''}`.trim() : 'Student Notes'
                }
              </h2>
            </div>
            
            {/* Notes Content */}
            <div className="flex-1 overflow-auto">
              <StudentNotes
                studentEmail={selectedStudentEmailKey}
                courseId={selectedStudent?.CourseID}
                initialNotes={studentNotes}
                onNotesUpdate={handleNotesUpdate}
                allowEdit={true}
                isExpanded={true}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Student Details Sheet */}
      {selectedStudent && memoizedFirebaseProfile && (
        <Sheet open={isStudentDetailsSheetOpen} onOpenChange={setIsStudentDetailsSheetOpen}>
          <SheetContent side="right" className="w-full md:w-2/3 bg-gray-50">
            <StudentDetailsSheet 
              studentData={{ profile: memoizedFirebaseProfile, courses: memoizedFirebaseCourses || {} }}
              courseData={memoizedFirebaseCourses?.[selectedStudent.CourseID] || {}}
              changedFields={{}}
              courseId={selectedStudent?.CourseID}
              studentKey={selectedStudentEmailKey}
              onClose={() => setIsStudentDetailsSheetOpen(false)}
            />
          </SheetContent>
        </Sheet>
      )}
      
      {/* Registration Sheet */}
      {selectedStudent && memoizedFirebaseProfile && isAdminUser() && (
        <Sheet open={isRegistrationSheetOpen} onOpenChange={setIsRegistrationSheetOpen}>
          <SheetContent side="right" className="w-full md:w-2/3 bg-white p-6 overflow-hidden flex flex-col">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="mb-4 flex-shrink-0">
                <h2 className="text-xl font-bold text-[#1fa6a7] flex items-center">
                  <UserCheck className="h-5 w-5 mr-2" />
                  Registration Information
                </h2>
              </div>
              
              {/* Registration Content */}
              <div className="flex-1 overflow-auto">
                <RegistrationInfo 
                  studentData={{ profile: memoizedFirebaseProfile, courses: memoizedFirebaseCourses || {} }}
                  courseId={selectedStudent?.CourseID}
                  readOnly={false}
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
      
      {/* Activity Sheet */}
      {selectedStudent && memoizedFirebaseProfile && (
        <Sheet open={isActivitySheetOpen} onOpenChange={setIsActivitySheetOpen}>
          <SheetContent side="right" className="w-[95%] max-w-6xl p-0 overflow-hidden">
            <StudentActivitySheet 
              studentData={{ profile: memoizedFirebaseProfile, courses: memoizedFirebaseCourses || {} }}
              courseId={selectedStudent?.CourseID}
              onClose={() => setIsActivitySheetOpen(false)}
            />
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}

export default StudentManagement;