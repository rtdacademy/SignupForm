import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getDatabase, ref, onValue, off, update, get } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { Sheet, SheetContent } from "../components/ui/sheet";
import { Calendar, Split, IdCard, AlertTriangle, Edit, ClipboardList, DollarSign, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Maximize2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../components/ui/collapsible";
import { Switch } from "../components/ui/switch";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "../components/ui/resizable";
import ScheduleMaker from '../Schedule/ScheduleMaker';
import SchedCombined from '../Schedule/schedCombined';
import ScheduleDisplay from '../Schedule/ScheduleDisplay';
import InternationalDocuments from './InternationalDocuments';
import { useUserPreferences } from '../context/UserPreferencesContext';
 
import StudentGradesDisplay from './StudentGradesDisplay';
import { useTeacherStudentData } from '../Dashboard/hooks/useTeacherStudentData';
import GradebookDashboard from '../FirebaseCourses/components/gradebook/GradebookDashboard';

const getColorFromInitials = (initials) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F06292', '#AED581', '#FFD54F', '#4DB6AC', '#7986CB'
  ];
  let hash = 0;
  for (let i = 0; i < initials.length; i++) {
    hash = initials.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  return colors[hash % colors.length];
};

function StudentDetail({ studentSummary, isMobile, onRefresh }) {
  // Add the teacher hook just for debugging purposes
  const studentEmailKey = studentSummary?.StudentEmail ? sanitizeEmail(studentSummary.StudentEmail) : null;
  const teacherPermissions = {
    canViewStudentData: true,
    isStaff: true,
    isTeacher: true
  };
  
  const { 
    courses: hookCourses, 
    profile: hookProfile, 
    loading: hookLoading, 
    error: hookError,
    studentExists 
  } = useTeacherStudentData(studentEmailKey, teacherPermissions);
  
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isComparisonSheetOpen, setIsComparisonSheetOpen] = useState(false);
  const { user } = useAuth();
  
  // Fetch user custom claims
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
  const isAdminUser = () => {
    return userClaims?.permissions?.isAdmin === true || userClaims?.isAdminUser === true;
  };
  
  const isSuperAdminUser = () => {
    return userClaims?.permissions?.isSuperAdmin === true || userClaims?.isSuperAdminUser === true;
  };
  
  const isStaffUser = () => {
    return userClaims?.permissions?.isStaff === true || userClaims?.isStaffUser === true;
  };
  
  // Helper function to get admin button styles
  const getAdminButtonStyles = () => {
    return "h-8 text-orange-600 border-orange-600 hover:bg-orange-600 hover:text-white flex items-center";
  };
  
  const getAdminButtonStylesMobile = () => {
    return "flex-1 min-w-[80px] text-orange-600 border-orange-600 hover:bg-orange-600 hover:text-white flex items-center justify-center";
  };
  
  const getRegularButtonStyles = () => {
    return "h-8 text-[#40b3b3] border-[#40b3b3] hover:bg-[#40b3b3] hover:text-white flex items-center";
  };
  
  const getRegularButtonStylesMobile = () => {
    return "flex-1 min-w-[80px] text-[#40b3b3] border-[#40b3b3] hover:bg-[#40b3b3] hover:text-white flex items-center justify-center";
  };
  // Section expansion states
  const [isScheduleExpanded, setIsScheduleExpanded] = useState(true);
  const [isGradebookExpanded, setIsGradebookExpanded] = useState(true);
  const [isProgressExpanded, setIsProgressExpanded] = useState(true);
  const [isGradesExpanded, setIsGradesExpanded] = useState(true);
  
  const [changedFields, setChangedFields] = useState({});
  const [assignedStaff, setAssignedStaff] = useState([]);
  const [courseId, setCourseId] = useState(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseData, setCourseData] = useState(null);
  const [ltiLinksComplete, setLtiLinksComplete] = useState(false);
  const prevDataRef = useRef();
  const [jsonGradebookSchedule, setJsonGradebookSchedule] = useState(null);
  const [scheduleJSON, setScheduleJSON] = useState(null);
  const [jsonGradebook, setJsonGradebook] = useState(null);
  const { preferences, updatePreferences } = useUserPreferences();
  const [newLMSId, setNewLMSId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localLMSStudentID, setLocalLMSStudentID] = useState(null);
  const [isLMSIdDialogOpen, setIsLMSIdDialogOpen] = useState(false);
  
  // Payment sheet state
  // Documents sheet state (for international docs)
  const [isDocumentsSheetOpen, setIsDocumentsSheetOpen] = useState(false);
  
  // Sheet states for full-screen overlays
  const [isScheduleSheetOpen, setIsScheduleSheetOpen] = useState(false);
  const [isGradebookSheetOpen, setIsGradebookSheetOpen] = useState(false);
  
  // For mobile, only show one section at a time
  const [mobileActiveSection, setMobileActiveSection] = useState('schedule');
  
  // User custom claims state
  const [userClaims, setUserClaims] = useState(null);
  
  // Firebase course detection state
  const [isCurrentCourseFirebase, setIsCurrentCourseFirebase] = useState(false);
  
  
  // New refs and state for dynamic font sizing
  const nameRef = useRef(null);
  const containerRef = useRef(null);
  const [nameFontSize, setNameFontSize] = useState(20);

  // Effect to check if current course is a Firebase course
  useEffect(() => {
    const checkFirebaseCourse = async () => {
      if (!courseId) {
        setIsCurrentCourseFirebase(false);
        return;
      }

      try {
        const db = getDatabase();
        const courseRef = ref(db, `courses/${courseId}/firebaseCourse`);
        const snapshot = await get(courseRef);
        setIsCurrentCourseFirebase(snapshot.val() === true);
      } catch (error) {
        console.error('Error checking Firebase course status:', error);
        setIsCurrentCourseFirebase(false);
      }
    };

    checkFirebaseCourse();
  }, [courseId]);

  const [comparisonTab, setComparisonTab] = useState("unified");
  const lmsId = studentData?.courses?.[courseId]?.LMSStudentID || "";

  // Check if student has a schedule
  const hasSchedule = !!studentData?.courses?.[courseId]?.ScheduleJSON;
  
  // Check if student has international documents
  const hasInternationalDocs = !!studentData?.profile?.internationalDocuments;


  const handleStudentStatsChange = (checked) => {
    const db = getDatabase();
    const studentRef = ref(db, `students/${studentEmailKey}`);
    const updates = {
      [`courses/${courseId}/showStats`]: checked,
      [`courses/${courseId}/enrollmentHistory/lastChange`]: {
        userEmail: user?.email || 'unknown',
        timestamp: Date.now(),
        field: 'showStats'
      }
    };
    update(studentRef, updates)
      .then(() => {
        console.log('Successfully updated student showStats');
        // The hook will automatically update with the new data
        // We can still update local state for immediate UI feedback
        setStudentData(prev => ({
          ...prev,
          courses: {
            ...prev.courses,
            [courseId]: {
              ...prev.courses[courseId],
              showStats: checked
            }
          }
        }));
      })
      .catch((error) => {
        console.error('Error updating student stats setting:', error);
        toast.error('An error occurred while updating the student stats setting.');
      });
  };

  const handleFetchLMSId = async () => {
    if (!studentSummary?.StudentEmail || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const functions = getFunctions();
      const fetchLMSStudentId = httpsCallable(functions, 'fetchLMSStudentIdV2');
      
      const result = await fetchLMSStudentId({
        email: studentSummary.StudentEmail,
        courseId: courseId
      });
      
      if (result.data.success) {
        setLocalLMSStudentID(result.data.lmsId);
        
        // Update the student data with the new LMS ID
        setStudentData(prev => ({
          ...prev,
          courses: {
            ...prev.courses,
            [courseId]: {
              ...prev.courses[courseId],
              LMSStudentID: result.data.lmsId
            }
          }
        }));
        
        toast.success("Successfully fetched and updated LMS Student ID");
      } else {
        toast.error(result.data.message || "Failed to fetch LMS ID");
      }
    } catch (error) {
      console.error('Error fetching LMS ID:', error);
      toast.error(error.message || "An error occurred while fetching the LMS ID");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitLMSId = async () => {
    if (!newLMSId.trim()) return;
  
    setIsSubmitting(true);
    const db = getDatabase();
  
    try {
      // Update the student's LMS Student ID with lastChange tracking
      await update(
        ref(db, `students/${studentEmailKey}`),
        {
          [`courses/${courseId}/LMSStudentID`]: newLMSId,
          [`courses/${courseId}/enrollmentHistory/lastChange`]: {
            userEmail: user?.email || 'unknown',
            timestamp: Date.now(),
            field: 'LMSStudentID'
          }
        }
      );
      
      // Update local state for immediate UI feedback
      setStudentData(prev => ({
        ...prev,
        courses: {
          ...prev.courses,
          [courseId]: {
            ...prev.courses[courseId],
            LMSStudentID: newLMSId
          }
        }
      }));
      
      setLocalLMSStudentID(newLMSId);
  
      toast.success('LMS Student ID updated successfully');
      setNewLMSId('');
      setIsLMSIdDialogOpen(false);
    } catch (error) {
      console.error('Error updating LMS Student ID:', error);
      toast.error('Failed to update LMS Student ID. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine which sections should be available
  const shouldShowGrades = ltiLinksComplete;
  const shouldShowProgress = !ltiLinksComplete && studentData?.courses?.[courseId]?.jsonGradebookSchedule;
  const shouldShowSchedule = !ltiLinksComplete && !studentData?.courses?.[courseId]?.jsonGradebookSchedule;
  const shouldShowGradebook = !ltiLinksComplete && !studentData?.courses?.[courseId]?.jsonGradebookSchedule;

  // Load section expansion states from preferences
  useEffect(() => {
    if (preferences?.sectionExpansion) {
      setIsScheduleExpanded(preferences.sectionExpansion.schedule ?? true);
      setIsGradebookExpanded(preferences.sectionExpansion.gradebook ?? true);
      setIsProgressExpanded(preferences.sectionExpansion.progress ?? true);
      setIsGradesExpanded(preferences.sectionExpansion.grades ?? true);
    }
  }, [preferences]);
  
  // Set default mobile section based on what's available
  useEffect(() => {
    if (isMobile) {
      if (shouldShowGrades) {
        setMobileActiveSection('grades');
      } else if (shouldShowProgress) {
        setMobileActiveSection('progress');
      } else if (shouldShowSchedule) {
        setMobileActiveSection('schedule');
      } else if (shouldShowGradebook) {
        setMobileActiveSection('gradebook');
      }
    }
  }, [isMobile, shouldShowGrades, shouldShowProgress, shouldShowSchedule, shouldShowGradebook]);

  // Original Firebase data fetching logic
  useEffect(() => {
    if (!studentSummary || !studentEmailKey) {
      setStudentData(null);
      setCourseId(null);
      return;
    }

    setLoading(true);
    const db = getDatabase();
    const studentRef = ref(db, `students/${studentEmailKey}`);
    
    const unsubscribe = onValue(studentRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setStudentData(data);
        
        // Set course ID from the student summary
        const selectedCourseId = studentSummary.CourseID;
        setCourseId(selectedCourseId);
        
        // Set course-specific data
        if (data.courses && data.courses[selectedCourseId]) {
          const courseData = data.courses[selectedCourseId];
          setJsonGradebookSchedule(courseData.jsonGradebookSchedule || null);
          setScheduleJSON(courseData.ScheduleJSON || null);
          setJsonGradebook(courseData.jsonGradebook || null);
          setLocalLMSStudentID(courseData.LMSStudentID || null);
        }
        
        // Track field changes
        if (prevDataRef.current) {
          setChangedFields(findChangedFields(prevDataRef.current, data));
        }
        prevDataRef.current = data;
      } else {
        setStudentData(null);
        setCourseId(null);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching student data:', error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [studentSummary, studentEmailKey]);

  // Fetch course data separately
  useEffect(() => {
    if (!courseId) return;
    
    const db = getDatabase();
    const courseRef = ref(db, `courses/${courseId}`);
    
    const unsubscribe = onValue(courseRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setCourseData(data);
        setCourseTitle(data.Title || 'Unknown Course');
        setLtiLinksComplete(!!data.ltiLinksComplete);
        
        // Extract staff information
        const teachers = data.teachers || {};
        const supportStaff = data.supportStaff || {};
        
        const staffArray = [
          ...Object.values(teachers).map(teacher => ({ ...teacher, role: 'Teacher' })),
          ...Object.values(supportStaff).map(support => ({ ...support, role: 'Support Staff' }))
        ];
        
        setAssignedStaff(staffArray.filter(Boolean));
      } else {
        setCourseTitle('Unknown Course');
        setLtiLinksComplete(false);
        setAssignedStaff([]);
      }
    }, (error) => {
      console.error('Error fetching course data:', error);
    });
    
    return () => unsubscribe();
  }, [courseId]);

  // Add a debugging useEffect to log the course from the hook
  useEffect(() => {
    if (hookCourses && hookCourses.length > 0 && studentSummary?.CourseID) {
      const selectedCourseId = studentSummary.CourseID;
      
      // Enhanced debugging with type checking
      console.log('🔍 STUDENT DETAIL - Hook Course Debug:', {
        selectedCourseId,
        selectedCourseIdType: typeof selectedCourseId,
        hookCoursesCount: hookCourses.length,
        hookCourseIds: hookCourses.map(c => ({ id: c.id, type: typeof c.id })),
        studentEmailKey,
        hookLoading,
        hookError,
        timestamp: new Date().toLocaleTimeString()
      });
      
      // Try both strict and loose comparison
      const foundCourseStrict = hookCourses.find(course => course.id === selectedCourseId);
      const foundCourseLoose = hookCourses.find(course => String(course.id) === String(selectedCourseId));
      
      // Log the raw course object for debugging
      console.log('Raw course object from hook (strict):', foundCourseStrict);
      console.log('Raw course object from hook (loose):', foundCourseLoose);
      
   
    }
  }, [hookCourses, studentSummary, studentEmailKey, hookLoading, hookError]);

  // Update the font sizing useEffect
  useEffect(() => {
    if (!isMobile && nameRef.current && containerRef.current) {
      const nameContainer = nameRef.current;
      const container = containerRef.current;

      const adjustNameSize = () => {
        if (!nameContainer || !container) return;
        
        try {
          const availableWidth = container.offsetWidth - 100; // Reserve less space since we're on a dedicated row
          if (availableWidth <= 0) return; // Don't proceed if width is invalid
          
          let currentFontSize = 20; // Starting size - smaller than before
          
          // Reset font size to measure natural width
          nameContainer.style.fontSize = `${currentFontSize}px`;
          
          // If name is too wide, gradually reduce font size
          while (nameContainer.scrollWidth > availableWidth && currentFontSize > 12) {
            currentFontSize -= 1;
            nameContainer.style.fontSize = `${currentFontSize}px`;
          }
          
          setNameFontSize(currentFontSize);
        } catch (error) {
          console.error('Error adjusting name size:', error);
        }
      };

      // Use ResizeObserver instead of window resize event
      const resizeObserver = new ResizeObserver((entries) => {
        // Wait for next frame to ensure DOM is updated
        requestAnimationFrame(() => {
          adjustNameSize();
        });
      });

      // Start observing the container
      resizeObserver.observe(container);

      // Initial adjustment
      adjustNameSize();

      // Cleanup
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [isMobile, studentData, nameRef.current, containerRef.current]);

  // Toggle handlers for each section
  const toggleSchedule = () => {
    const newState = !isScheduleExpanded;
    setIsScheduleExpanded(newState);
    saveExpansionPreferences({ schedule: newState });
  };
  
  const toggleGradebook = () => {
    const newState = !isGradebookExpanded;
    setIsGradebookExpanded(newState);
    saveExpansionPreferences({ gradebook: newState });
  };
  
  const toggleProgress = () => {
    const newState = !isProgressExpanded;
    setIsProgressExpanded(newState);
    saveExpansionPreferences({ progress: newState });
  };
  
  const toggleGrades = () => {
    const newState = !isGradesExpanded;
    setIsGradesExpanded(newState);
    saveExpansionPreferences({ grades: newState });
  };
  
  const saveExpansionPreferences = (updates) => {
    updatePreferences({
      ...preferences,
      sectionExpansion: {
        ...preferences?.sectionExpansion,
        ...updates
      }
    });
  };

  // Create Schedule Button component
  const CreateScheduleButton = () => (
    <Button 
      variant="default" 
      size="sm" 
      onClick={() => setIsScheduleDialogOpen(true)}
      className="w-full flex items-center justify-center bg-[#1fa6a7] text-white hover:bg-[#1a8f90] transition-colors mb-4"
    >
      <Calendar className="h-4 w-4 mr-2" />
      {hasSchedule ? "Update Schedule" : "Create Schedule"}
    </Button>
  );

  // NEW LMS ID Button Component
  const LMSIdButton = ({ compact = false, className = "" }) => (
    <Button
      variant={compact ? "outline" : "default"}
      size="sm"
      onClick={() => setIsLMSIdDialogOpen(true)}
      className={`text-[#40b3b3] border-[#40b3b3] hover:bg-[#40b3b3] hover:text-white ${className}`}
    >
      <IdCard className="h-4 w-4 mr-1" />
      {studentData?.courses?.[courseId]?.LMSStudentID 
        ? (compact 
            ? `${studentData.courses[courseId].LMSStudentID}` 
            : `LMS ID: ${studentData.courses[courseId].LMSStudentID} (Edit)`)
        : "Set LMS ID"}
      {!compact && studentData?.courses?.[courseId]?.LMSStudentID && <Edit className="h-3 w-3 ml-1" />}
    </Button>
  );

  // Added function to render the gradebook container with LMS button
  const renderGradebookContainer = (gradebookUrl) => {
    if (!lmsId) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-center text-yellow-700">
            <p className="mb-4">LMS Student ID is required to view the gradebook</p>
            <LMSIdButton className="mx-auto" />
          </div>
        </div>
      );
    }
    
    return (
      <div className="w-full h-full min-h-[500px] relative">
        <iframe
          src={gradebookUrl}
          className="w-full h-full absolute inset-0 border-0"
          title="Student Gradebook"
          allow="fullscreen"
        />
      </div>
    );
  };

  const renderScheduleContent = () => {
    const courseData = studentData?.courses[courseId];

    return (
      <div className="space-y-4">
        <CreateScheduleButton />
        
        {courseData?.ScheduleJSON ? (
          <ScheduleDisplay 
            scheduleJSON={courseData.ScheduleJSON}
            readOnly={false}
          />
        ) : courseData?.Schedule ? (
          <div 
            className="legacy-schedule" 
            dangerouslySetInnerHTML={{ __html: courseData.Schedule }}
          />
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700">No schedule available in either system</p>
          </div>
        )}
      </div>
    );
  };

  const renderProgressContent = () => {
    const courseData = studentData?.courses[courseId];
    
    return (
      <div className="space-y-4">
        <CreateScheduleButton />

        <div className="flex items-center justify-between p-2 border rounded-lg bg-gray-50">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={studentData?.courses[courseId]?.showStats ?? true}
                    onCheckedChange={handleStudentStatsChange}
                  />
                  <span className="text-sm font-medium">Show Statistics</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p>Toggle this off to hide statistics for students in unique situations where progress tracking may not be applicable. This helps prevent confusion when standard progress metrics don't reflect their actual situation.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <SchedCombined 
          jsonGradebookSchedule={courseData?.jsonGradebookSchedule}
          readOnly={false}
        />
      </div>
    );
  };

  // Updated render function for StudentGradesDisplay
  // Helper function to render panel header with open-in-sheet button
  const renderPanelHeader = (title, color, openSheetFn, actionButtons = null) => {
    const colorClasses = {
      emerald: { text: 'text-emerald-600', border: 'border-emerald-600', hover: 'hover:bg-emerald-600' },
      green: { text: 'text-green-600', border: 'border-green-600', hover: 'hover:bg-green-600' },
      teal: { text: 'text-teal-600', border: 'border-teal-600', hover: 'hover:bg-teal-600' },
      slate: { text: 'text-slate-600', border: 'border-slate-600', hover: 'hover:bg-slate-600' }
    };
    
    const classes = colorClasses[color] || colorClasses.teal;
    
    return (
      <div className="px-4 pt-4 pb-2 flex items-center justify-between hover:bg-gray-50 transition-colors">
        <h4 className={`font-semibold ${classes.text}`}>
          {title}
        </h4>
        <div className="flex items-center space-x-2">
          {actionButtons}
          <Maximize2
            className={`h-5 w-5 ${classes.text} cursor-pointer hover:opacity-75 transition-opacity`}
            onClick={(e) => { e.stopPropagation(); openSheetFn(); }}
          />
        </div>
      </div>
    );
  };

  const renderGradesContent = () => {
    if (!studentData?.courses[courseId]?.LMSStudentID) {
      return (
        <div className="flex items-center justify-center h-full p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-center text-yellow-700">
            <p className="mb-2">LMS Student ID is required for displaying grades</p>
            <LMSIdButton className="mx-auto mt-2" />
          </div>
        </div>
      );
    }

    // Check if student has a schedule
    if (!hasSchedule) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center mb-4 text-amber-600">
            <AlertTriangle className="h-6 w-6 mr-2" />
            <h3 className="text-lg font-medium">Schedule Required</h3>
          </div>
          <p className="text-center text-yellow-700 mb-4">
            Student needs a schedule to track progress properly. Please create a schedule first.
          </p>
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsScheduleDialogOpen(true)}
            className="bg-[#1fa6a7] text-white hover:bg-[#1a8f90] transition-colors"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Create Schedule
          </Button>
        </div>
      );
    }

    // Check if this is a Firebase course
    if (isCurrentCourseFirebase) {
      // Use data from useTeacherStudentData hook for Firebase courses
      const course = hookCourses?.[courseId];
      const allCourseItems = []; // This would need to be populated if needed
      const lessonAccessibility = {}; // This would need to be populated if needed
      
      return (
        <div className="h-full">
          <GradebookDashboard 
            course={course}
            allCourseItems={allCourseItems}
            profile={hookProfile}
            lessonAccessibility={lessonAccessibility}
            showHeader={false}
          />
        </div>
      );
    }

    return (
      <div className="h-full">
        <div className="flex justify-end mb-2">
         
        </div>
        <StudentGradesDisplay
          studentKey={studentEmailKey}
          courseId={courseId}
          useSheet={false}
          className="h-full"
        />
      </div>
    );
  };


  // Updated renderGradebookContent with LMS ID button integration
  const renderGradebookContent = () => {
    if (!studentSummary?.CourseID) {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700">Missing course information</p>
        </div>
      );
    }
  
    const gradebookUrl = `https://edge.rtdacademy.com/course/gradebook.php?cid=${studentSummary?.CourseID}&stu=${lmsId}`;
    return renderGradebookContainer(gradebookUrl);
  };

  // Render the comparison sheet content - updated with LMS ID button
  const renderComparisonSheetContent = () => {
    const courseData = studentData?.courses[courseId];
    const gradebookUrl = `https://edge.rtdacademy.com/course/gradebook.php?cid=${studentSummary?.CourseID}&stu=${lmsId}`;

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <Split className="h-5 w-5 mr-2" />
            Student Progress Views
          </h2>
          <LMSIdButton compact={true} />
        </div>
        
        <Tabs
          value={comparisonTab}
          onValueChange={setComparisonTab}
          className="flex-1 flex flex-col h-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="unified">YourWay Schedule</TabsTrigger>
            <TabsTrigger value="gradebook">Gradebook</TabsTrigger>
            <TabsTrigger value="schedule">Legacy Schedule</TabsTrigger>
          </TabsList>
          <TabsContent value="gradebook" className="flex-1 h-full">
            {!lmsId ? (
              <div className="flex items-center justify-center h-full p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-center text-yellow-700">
                  <p className="mb-4">LMS Student ID is required to view the gradebook</p>
                  <LMSIdButton className="mx-auto" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex justify-end mb-2">
                 
                </div>
                <div className="w-full h-full min-h-[600px] relative">
                  <iframe
                    src={gradebookUrl}
                    className="w-full h-full absolute inset-0 border-0"
                    title="Student Gradebook"
                    allow="fullscreen"
                  />
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="schedule" className="flex-1 h-full overflow-auto">
            {courseData?.ScheduleJSON ? (
              <ScheduleDisplay 
                scheduleJSON={courseData.ScheduleJSON}
                readOnly={true}
              />
            ) : courseData?.Schedule ? (
              <div 
                className="legacy-schedule" 
                dangerouslySetInnerHTML={{ __html: courseData.Schedule }}
              />
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-700">No schedule available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="unified" className="flex-1 h-full">
            {!hasSchedule ? (
              <div className="flex flex-col items-center justify-center h-full p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center mb-4 text-amber-600">
                  <AlertTriangle className="h-6 w-6 mr-2" />
                  <h3 className="text-lg font-medium">Schedule Required</h3>
                </div>
                <p className="text-center text-yellow-700 mb-4">
                  A schedule is needed to view the YourWay schedule. Please create one first.
                </p>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setIsScheduleDialogOpen(true)}
                  className="bg-[#1fa6a7] text-white hover:bg-[#1a8f90] transition-colors"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Create Schedule
                </Button>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex justify-end mb-2">
                  <LMSIdButton compact={true} />
                </div>
                <StudentGradesDisplay
                  studentKey={sanitizeEmail(studentSummary.StudentEmail)}
                  courseId={courseId}
                  useSheet={false}
                  className="h-full"
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!studentSummary || !studentData || !courseId || !studentData.courses || !studentData.courses[courseId]) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <p className="mb-2">No student selected or no courses available.</p>
          <p className="text-sm">Select a student from the list to view or manage their courses.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-hidden flex flex-col">
      {/* Header Section */}
      <div className="mb-3">
        {/* First row: Action Buttons */}
        {!isMobile ? (
          <div className="flex items-center justify-between mb-1 gap-2">
            <div className="flex gap-2 flex-shrink-0">
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 flex-shrink-0">
              
              {/* Documents Button - Visible for students with international docs */}
              {hasInternationalDocs && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDocumentsSheetOpen(true)}
                  className={getRegularButtonStyles()}
                >
                  <ClipboardList className="h-4 w-4 mr-1" />
                  Documents
                </Button>
              )}
              
            </div>
            
            {/* Staff Badges - Fixed width */}
            <div className="flex-none -space-x-2 overflow-hidden">
              {assignedStaff.map((staff) => (
                <TooltipProvider key={staff.email}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar 
                        className="inline-block border-2 border-white w-8 h-8" 
                        style={{ backgroundColor: getColorFromInitials(`${staff.firstName?.[0] || ''}${staff.lastName?.[0] || ''}`) }}
                      >
                        <AvatarFallback className="text-sm">
                          {staff.firstName?.[0] || ''}{staff.lastName?.[0] || ''}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{staff.displayName || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{staff.email}</p>
                      <p className="text-xs font-semibold">{staff.role}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        ) : (
          // Mobile layout: buttons first, then tabs below
          <>
            {/* Action buttons in a row */}
            <div className="flex flex-wrap gap-2 w-full mb-2">
              
              {/* Documents Button - Visible for students with international docs */}
              {hasInternationalDocs && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDocumentsSheetOpen(true)}
                  className={getRegularButtonStylesMobile()}
                >
                  <ClipboardList className="h-4 w-4 mr-1" />
                  Docs
                </Button>
              )}
              
            </div>
            
            {/* Mobile section selector buttons */}
            <div className="flex flex-wrap gap-1.5 w-full mb-2">
              {shouldShowSchedule && (
                <Button
                  variant={mobileActiveSection === 'schedule' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMobileActiveSection('schedule')}
                  className={`flex-1 ${mobileActiveSection === 'schedule' ? 'bg-[#40b3b3] text-white' : 'text-[#40b3b3] border-[#40b3b3]'}`}
                >
                  Schedule
                </Button>
              )}
              {shouldShowGradebook && (
                <Button
                  variant={mobileActiveSection === 'gradebook' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMobileActiveSection('gradebook')}
                  className={`flex-1 ${mobileActiveSection === 'gradebook' ? 'bg-[#40b3b3] text-white' : 'text-[#40b3b3] border-[#40b3b3]'}`}
                >
                  Gradebook
                </Button>
              )}
              {shouldShowProgress && (
                <Button
                  variant={mobileActiveSection === 'progress' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMobileActiveSection('progress')}
                  className={`flex-1 ${mobileActiveSection === 'progress' ? 'bg-[#40b3b3] text-white' : 'text-[#40b3b3] border-[#40b3b3]'}`}
                >
                  Progress
                </Button>
              )}
              {shouldShowGrades && (
                <Button
                  variant={mobileActiveSection === 'grades' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMobileActiveSection('grades')}
                  className={`flex-1 ${mobileActiveSection === 'grades' ? 'bg-[#40b3b3] text-white' : 'text-[#40b3b3] border-[#40b3b3]'}`}
                >
                  Progress
                </Button>
              )}
            </div>
          </>
        )}

     
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {isMobile ? (
          // Mobile: Keep existing vertical layout
          <div className="flex flex-col space-y-4 p-4">
            {/* Grades Section - New section for ltiLinksComplete courses */}
            {shouldShowGrades && mobileActiveSection === 'grades' && (
              <div className="w-full">
                <Collapsible open={isGradesExpanded}>
                  <Card className="bg-white shadow-md rounded-xl border-t-4 border-t-emerald-500 border-x border-b border-gray-200">
                    <CollapsibleTrigger onClick={toggleGrades} className="w-full">
                      <div className="px-4 pt-4 pb-2 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
                        <h4 className="font-semibold text-emerald-600">Progress</h4>
                        <div className="flex items-center space-x-2">
                          {isGradesExpanded && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); setIsScheduleDialogOpen(true); }}
                              className="text-emerald-600 border-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center"
                            >
                              <Calendar className="h-4 w-4 mr-1" />
                              {hasSchedule ? "" : "Create"}
                            </Button>
                          )}
                          {isGradesExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="p-4 pt-2">
                        {renderGradesContent()}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              </div>
            )}

            {/* Progress Section */}
            {shouldShowProgress && mobileActiveSection === 'progress' && (
              <div className="w-full">
                <Collapsible open={isProgressExpanded}>
                  <Card className="bg-white shadow-md rounded-xl border-t-4 border-t-green-500 border-x border-b border-gray-200">
                    <CollapsibleTrigger onClick={toggleProgress} className="w-full">
                      <div className="px-4 pt-4 pb-2 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
                        <h4 className="font-semibold text-green-600">Progress</h4>
                        <div className="flex items-center space-x-2">
                          {isProgressExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="p-4 pt-2">
                        {renderProgressContent()}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              </div>
            )}

            {/* Mobile Schedule and Gradebook sections */}
            {shouldShowSchedule && mobileActiveSection === 'schedule' && (
              <div className="w-full">
                <Collapsible open={isScheduleExpanded}>
                  <Card className="bg-white shadow-md rounded-xl border-t-4 border-t-teal-500 border-x border-b border-gray-200">
                    <CollapsibleTrigger onClick={toggleSchedule} className="w-full">
                      <div className="px-4 pt-4 pb-2 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
                        <h4 className="font-semibold text-teal-600">Schedule</h4>
                        <div className="flex items-center space-x-2">
                          {isScheduleExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="p-4 pt-2">
                        {renderScheduleContent()}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              </div>
            )}

            {shouldShowGradebook && mobileActiveSection === 'gradebook' && (
              <div className="w-full">
                <Collapsible open={isGradebookExpanded}>
                  <Card className="bg-white shadow-md rounded-xl border-t-4 border-t-slate-500 border-x border-b border-gray-200">
                    <CollapsibleTrigger onClick={toggleGradebook} className="w-full">
                      <div className="px-4 pt-4 pb-2 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
                        <h4 className="font-semibold text-slate-600">Gradebook</h4>
                        <div className="flex items-center space-x-2">
                          {isGradebookExpanded && (
                            <LMSIdButton compact={true} />
                          )}
                          {isGradebookExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="p-4 pt-2">
                        {renderGradebookContent()}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              </div>
            )}
          </div>
        ) : (
          // Desktop: New side-by-side resizable layout
          <div className="h-full">
            {/* Single sections (Progress or Grades) - keep vertical */}
            {shouldShowGrades && (
              <div className="w-full h-full">
                <Card className="bg-white shadow-md rounded-xl border-t-4 border-t-emerald-500 border-x border-b border-gray-200 h-full flex flex-col">
                  {renderPanelHeader("Progress", "emerald", () => setIsComparisonSheetOpen(true), (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsScheduleDialogOpen(true)}
                      className="text-emerald-600 border-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center"
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      {hasSchedule ? "" : "Create"}
                    </Button>
                  ))}
                  <CardContent className="p-4 pt-2 flex-1 overflow-auto">
                    {renderGradesContent()}
                  </CardContent>
                </Card>
              </div>
            )}

            {shouldShowProgress && (
              <div className="w-full h-full">
                <Card className="bg-white shadow-md rounded-xl border-t-4 border-t-green-500 border-x border-b border-gray-200 h-full flex flex-col">
                  {renderPanelHeader("Progress", "green", () => setIsComparisonSheetOpen(true), null)}
                  <CardContent className="p-4 pt-2 flex-1 overflow-auto">
                    {renderProgressContent()}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Side-by-side Schedule and Gradebook sections */}
            {shouldShowSchedule && shouldShowGradebook && (
              <ResizablePanelGroup direction="horizontal" className="h-full">
                {/* Schedule Panel */}
                <ResizablePanel 
                  defaultSize={50} 
                  minSize={25}
                  className="flex flex-col"
                >
                  <Card className="bg-white shadow-md rounded-xl border-t-4 border-t-teal-500 border-x border-b border-gray-200 h-full flex flex-col">
                    {renderPanelHeader("Schedule", "teal", () => setIsScheduleSheetOpen(true), null)}
                    <CardContent className="p-4 pt-2 flex-1 overflow-auto">
                      {renderScheduleContent()}
                    </CardContent>
                  </Card>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Gradebook Panel */}
                <ResizablePanel 
                  defaultSize={50} 
                  minSize={25}
                  className="flex flex-col"
                >
                  <Card className="bg-white shadow-md rounded-xl border-t-4 border-t-slate-500 border-x border-b border-gray-200 h-full flex flex-col">
                    {renderPanelHeader("Gradebook", "slate", () => setIsGradebookSheetOpen(true), (
                      <LMSIdButton compact={true} />
                    ))}
                    <CardContent className="p-4 pt-2 flex-1 overflow-auto">
                      {renderGradebookContent()}
                    </CardContent>
                  </Card>
                </ResizablePanel>
              </ResizablePanelGroup>
            )}
          </div>
        )}
      </div>

      {/* LMS Student ID Dialog */}
      <Dialog open={isLMSIdDialogOpen} onOpenChange={setIsLMSIdDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>LMS Student ID</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Auto-fetch section */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-3">
                Click below to automatically fetch the student's LMS ID using their email:
              </p>
              <Button
                onClick={handleFetchLMSId}
                disabled={isSubmitting}
                className="w-full bg-[#40b3b3] text-white hover:bg-[#379999] disabled:bg-gray-300"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">⟳</span>
                    Fetching...
                  </span>
                ) : (
                  'Fetch LMS ID from Edge'
                )}
              </Button>
              <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                <span>Using email:</span>
                <code className="px-2 py-1 bg-white rounded border">
                  {studentSummary.StudentEmail}
                </code>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">or enter manually</span>
              </div>
            </div>

            {/* Manual entry section */}
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newLMSId || ''}
                  onChange={(e) => setNewLMSId(e.target.value)}
                  placeholder="Enter LMS Student ID"
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#40b3b3] focus:border-transparent"
                  disabled={isSubmitting}
                />
                <Button
                  onClick={handleSubmitLMSId}
                  disabled={!newLMSId || isSubmitting}
                  className="bg-[#40b3b3] text-white hover:bg-[#379999] disabled:bg-gray-300"
                >
                  Save
                </Button>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <a 
                  href="https://edge.rtdacademy.com/util/utils.php?form=lookup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#40b3b3] hover:text-[#379999] flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Look up ID manually
                </a>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Additional Sheets and Dialogs */}
      <>



        {/* Documents Sheet (International) */}
        {hasInternationalDocs && (
          <Sheet open={isDocumentsSheetOpen} onOpenChange={setIsDocumentsSheetOpen}>
            <SheetContent 
              side="right" 
              className="w-full md:w-2/3 bg-white p-6 overflow-hidden flex flex-col"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="mb-4 flex-shrink-0">
                  <h2 className="text-xl font-bold text-[#1fa6a7] flex items-center">
                    <ClipboardList className="h-5 w-5 mr-2" />
                    International Documents
                  </h2>
                </div>
                
                {/* Documents Content */}
                <div className="flex-1 overflow-auto">
                  <InternationalDocuments documents={studentData.profile.internationalDocuments} />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}

        {/* Comparison Sheet - Wide Sheet for Side by Side Comparison */}
        <Sheet open={isComparisonSheetOpen} onOpenChange={setIsComparisonSheetOpen}>
          <SheetContent side="right" className="w-[95%] max-w-5xl p-6 overflow-hidden">
            <div className="h-full flex flex-col">
              {renderComparisonSheetContent()}
            </div>
          </SheetContent>
        </Sheet>

        {/* Schedule Sheet - Full Schedule View */}
        <Sheet open={isScheduleSheetOpen} onOpenChange={setIsScheduleSheetOpen}>
          <SheetContent side="right" className="w-[90%] max-w-6xl p-6 overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-teal-600 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Full Schedule View
                </h2>
                <div className="text-sm text-gray-600">
                  {(studentData?.profile.preferredFirstName || studentData?.profile.firstName || '') + ' ' + (studentData?.profile.lastName || '')} - {courseTitle}
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                {renderScheduleContent()}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Gradebook Sheet - Full Gradebook View */}
        <Sheet open={isGradebookSheetOpen} onOpenChange={setIsGradebookSheetOpen}>
          <SheetContent side="right" className="w-[90%] max-w-6xl p-6 overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-600 flex items-center">
                  <ClipboardList className="h-5 w-5 mr-2" />
                  Full Gradebook View
                </h2>
                <div className="text-sm text-gray-600">
                  {(studentData?.profile.preferredFirstName || studentData?.profile.firstName || '') + ' ' + (studentData?.profile.lastName || '')} - {courseTitle}
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                {renderGradebookContent()}
              </div>
            </div>
          </SheetContent>
        </Sheet>
        

        {/* Schedule Dialog */}
        <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
          <DialogContent className="max-w-6xl w-full h-[90vh] overflow-auto bg-gray-50">
            <DialogHeader>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                <DialogTitle className="flex items-center">
                  <Calendar className="h-6 w-6 mr-2" />
                  Schedule Maker
                </DialogTitle>
                <div className="text-sm text-gray-700 text-center sm:text-left">
                  <p><strong>Student:</strong> {(studentData?.profile.preferredFirstName || studentData?.profile.firstName || '') + ' ' + (studentData?.profile.lastName || '')}</p>
                  <p><strong>Course:</strong> {courseTitle}</p>
                </div>
              </div>
            </DialogHeader>
            <div className="h-full overflow-auto p-4 flex flex-col">
              {courseId ? (
                <div className="flex-1">
                  <ScheduleMaker 
                    studentKey={studentEmailKey} 
                    courseId={courseId} 
                    onClose={() => setIsScheduleDialogOpen(false)}
                  />
                </div>
              ) : (
                <p className="text-gray-600">No course selected.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    </div>
  );
}

const findChangedFields = (prevData, newData, path = '') => {
  const changed = {};
  Object.keys(newData).forEach(key => {
    const currentPath = path ? `${path}.${key}` : key;
    if (typeof newData[key] === 'object' && newData[key] !== null) {
      Object.assign(changed, findChangedFields(prevData[key] || {}, newData[key], currentPath));
    } else if (prevData[key] !== newData[key]) {
      changed[currentPath] = true;
    }
  });
  return changed;
};

export default StudentDetail;