import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { FaGraduationCap } from 'react-icons/fa';
import { BookOpen, ClipboardCheck, Bug, ArrowUp, Menu, RefreshCw, Loader, CheckCircle, Lock, PlayCircle, AlertCircle, FileText, Folder, Bot, MessageCircle, X, Minimize2, RotateCcw, Maximize2, Monitor, Tablet, Smartphone } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { isUserAuthorizedDeveloper, shouldBypassAllRestrictions, getBypassReason } from './utils/authUtils';
import { 
  getLessonAccessibility,
  isLessonFullyCompleted,
  getNextLessonWithAccessibility
} from './utils/lessonAccess';
import NextLessonButtonFloating from './components/NextLessonButtonFloating';
import ReturnToDashboardButton from './components/ReturnToDashboardButton';
import { loadLessonPrompt, enhancePromptWithContext } from './utils/aiPromptLoader';
import { 
  validateGradeDataStructures, 
  calculateLessonScore, 
  calculateCategoryScores 
} from './utils/gradeCalculations';
import { createAllCourseItems } from './utils/courseItemsUtils';
import { 
  calculateCourseProgress, 
  getNavigationProgress, 
  hasValidGradebookData,
  getLessonScore 
} from './utils/courseProgressUtils';
import { sanitizeEmail } from '../utils/sanitizeEmail';
//import LessonInfoPanel from './components/navigation/LessonInfoPanel';
import CollapsibleNavigation from './components/navigation/CollapsibleNavigation';
import CourseOutline from './components/CourseOutline';
import CourseResources from './components/CourseResources';
// Import the comprehensive GradebookDashboard component
import { 
  GradebookDashboard
} from './components/gradebook';
import { Skeleton } from '../components/ui/skeleton';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '../components/ui/sheet';
import GoogleAIChatApp from '../edbotz/GoogleAIChat/GoogleAIChatApp';
import { AIAccordion } from '../components/ui/AIAccordion';

// Lazy load course components at module level to prevent re-importing
const Course0 = React.lazy(() => import('./courses/PHY30'));
const Course2 = React.lazy(() => import('./courses/2'));
const Course3 = React.lazy(() => import('./courses/3'));
const Course4 = React.lazy(() => import('./courses/4'));
const Course5 = React.lazy(() => import('./courses/5'));
const Course6 = React.lazy(() => import('./courses/6'));
const Course100 = React.lazy(() => import('./courses/100'));

// Skeleton fallback component for lazy loading
const CourseLoadingSkeleton = () => (
  <div className="p-6 space-y-6">
    {/* Course header skeleton */}
    <div className="space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    
    {/* Content area skeleton */}
    <div className="space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    
    {/* Additional content skeleton */}
    <div className="space-y-4">
      <Skeleton className="h-24 w-full" />
      <div className="flex space-x-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  </div>
);

// Main wrapper component for all Firebase courses
// Provides common layout, navigation, and context for course content
const FirebaseCourseWrapperContent = ({
  course,
  children,
  activeItemId: externalActiveItemId,
  onItemSelect: externalItemSelect,
  isStaffView = false,
  devMode = false,
  profile
}) => {
  const { currentUser } = useAuth();
  
  // State variables that are used in functions must be declared first
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // ALL HOOKS MUST BE DECLARED BEFORE ANY CONDITIONAL RETURNS
  // Check if current user is an authorized developer with caching to prevent flickering
  // Use a ref to track previous authorization state for persistence
  const previousAuthRef = useRef({ wasAuthorized: false, userEmail: null, courseId: null });
  
  const isAuthorizedDeveloper = useMemo(() => {
    // Calculate current authorization status
    const currentAuth = isUserAuthorizedDeveloper(currentUser, course);
    const currentUserEmail = currentUser?.email;
    const currentCourseId = course?.CourseID || course?.courseId;
    
    // If we have valid data and user is currently authorized, cache it
    if (currentAuth && currentUserEmail && currentCourseId) {
      previousAuthRef.current = {
        wasAuthorized: true,
        userEmail: currentUserEmail,
        courseId: currentCourseId
      };
      return true;
    }
    
    // If current check fails but we had previous authorization for same user/course, use cached result
    const { wasAuthorized, userEmail, courseId } = previousAuthRef.current;
    if (wasAuthorized && 
        currentUserEmail === userEmail && 
        currentCourseId === courseId &&
        currentUserEmail && currentCourseId) {
      return true;
    }
    
    // If user or course changed, clear cache and use current auth result
    if (currentUserEmail !== userEmail || currentCourseId !== courseId) {
      previousAuthRef.current = {
        wasAuthorized: currentAuth,
        userEmail: currentUserEmail,
        courseId: currentCourseId
      };
    }
    
    return currentAuth;
  }, [currentUser?.email, course?.CourseID, course?.courseId, currentUser, course]);
  const [activeTab, setActiveTab] = useState('content');
  
  // VARIABLE DECLARATIONS needed by useEffect hooks must come before useEffect hooks
  
  // Get course data - simplified to use only the correct course-config path
  const getCourseData = () => {
    // First check if course object exists at all
    if (!course) {
      console.warn("⚠️ WARNING: Course object is null/undefined - likely during re-render transition");
      return {
        title: 'Loading Course...',
        structure: [],
        courseWeights: null,
        loading: true
      };
    }
    
    // Only use the correct course-config path - no fallbacks
    if (course.courseDetails?.['course-config']?.courseStructure) {
      return {
        title: course.courseDetails['course-config'].courseStructure.title || course.Course?.Value || '',
        structure: course.courseDetails['course-config'].courseStructure.units,
        courseWeights: course.courseDetails['course-config'].weights
      };
    }
    
    // During initial loading period, show loading state instead of error
    if (isInitialLoading) {
      return {
        title: 'Loading Course...',
        structure: [],
        courseWeights: null,
        loading: true
      };
    }
    
    // Only show error after initial loading period has passed
    console.error("❌ ERROR: Course configuration not available at course.courseDetails['course-config']", {
      courseExists: !!course,
      courseDetailsExists: !!course?.courseDetails,
      courseConfigExists: !!course?.courseDetails?.['course-config'],
      courseStructureExists: !!course?.courseDetails?.['course-config']?.courseStructure
    });
    return {
      title: course.Course?.Value || 'Course',
      structure: [],
      courseWeights: null,
      error: "Course configuration not available. Please refresh the page or contact support."
    };
  };

  const courseData = useMemo(() => getCourseData(), [course, isInitialLoading]);
  const courseTitle = courseData.title;
  const unitsList = courseData.structure;
  const courseWeights = courseData.courseWeights;
  
  // Check if AI features are enabled for this course
  const isAIEnabled = useMemo(() => {
    return course?.courseDetails?.['course-config']?.aiFeatures?.enabled === true;
  }, [course?.courseDetails]);
  
  // Create enriched course items using centralized utility function
  const allCourseItems = useMemo(() => {
    return createAllCourseItems(course);
  }, [course]);
  
  // Utility function to extract lesson-specific questions
  const getLessonSpecificQuestions = useCallback((courseId, lessonId, assessments) => {
    if (!courseId || !lessonId || !assessments) {
      return {};
    }
    
    // Convert lesson ID to question pattern: "01-physics-20-review" -> "course2_01_physics_20_review"
    // Handle both hyphenated and underscored lessonId formats
    const normalizedLessonId = lessonId.replace(/-/g, '_');
    const questionPattern = `course${courseId}_${normalizedLessonId}`;
    
    
    const lessonQuestions = {};
    
    Object.entries(assessments).forEach(([questionId, questionData]) => {
      if (questionId.startsWith(questionPattern)) {
        // Extract only the relevant fields for AI context
        lessonQuestions[questionId] = {
          questionText: questionData.questionText,
          options: questionData.options,
          activityType: questionData.activityType,
          attempts: questionData.attempts || 0,
          status: questionData.status,
          // Include lastSubmission if it exists
          ...(questionData.lastSubmission && {
            lastSubmission: {
              answer: questionData.lastSubmission.answer,
              correctOptionId: questionData.lastSubmission.correctOptionId,
              feedback: questionData.lastSubmission.feedback,
              isCorrect: questionData.lastSubmission.isCorrect,
              timestamp: questionData.lastSubmission.timestamp
            }
          })
        };
      }
    });
    
    
    return lessonQuestions;
  }, []);
  
  // ALL useState DECLARATIONS must come before useEffect hooks that use them
  // Developer mode toggle state - only active if user is authorized
  const [isDeveloperModeActive, setIsDeveloperModeActive] = useState(false);
  // Initialize activeItemId from URL or localStorage
  const [activeItemId, setActiveItemId] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const lessonFromUrl = urlParams.get('lesson');
    
    // If URL has lesson, use it
    if (lessonFromUrl) {
      return lessonFromUrl;
    }
    
    // Otherwise, try localStorage
    const courseId = course?.CourseID || course?.courseId;
    if (courseId) {
      const storageKey = `lastLesson_${courseId}`;
      const lessonFromStorage = localStorage.getItem(storageKey);
      return lessonFromStorage || null;
    }
    
    return null;
  });
  const [progress, setProgress] = useState({});
  const [navExpanded, setNavExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [reviewQuestion, setReviewQuestion] = useState(null);
  const [selectedCourseItem, setSelectedCourseItem] = useState(null);
  const [isItemDetailModalOpen, setIsItemDetailModalOpen] = useState(false);
  const [isContentReady, setIsContentReady] = useState(false);
  const [courseModuleLoaded, setCourseModuleLoaded] = useState(false);
  const [isCourseOutlineOpen, setIsCourseOutlineOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatSheetSize, setChatSheetSize] = useState(() => {
    // On mobile, always use full width
    if (window.innerWidth < 768) {
      return 'full';
    }
    // Load preferred size from localStorage for desktop
    const courseId = course?.CourseID || course?.courseId;
    const savedSize = courseId ? localStorage.getItem(`chatSheetSize_${courseId}`) : null;
    // Only allow 'sm' (compact) or 'full' (fullscreen)
    if (savedSize === 'sm' || savedSize === 'full') {
      return savedSize;
    }
    return 'sm'; // Default to compact mode
  });
  const [currentAIPrompt, setCurrentAIPrompt] = useState(null);
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);
  // Simplified AI state - just prepopulated message for chat input
  const [prepopulatedMessage, setPrepopulatedMessage] = useState('');
  // State for realtime grades updates
  const [realtimeGrades, setRealtimeGrades] = useState(null);
  const [realtimeExamSessions, setRealtimeExamSessions] = useState(null);
  const [realtimeGradebook, setRealtimeGradebook] = useState(null);
  const [dataUpdateTrigger, setDataUpdateTrigger] = useState(0);
  // State for content context from AI accordion
  const [contentContextData, setContentContextData] = useState(null);
  // State for forcing new chat sessions
  const [forceNewChatSession, setForceNewChatSession] = useState(false);
  // State for controlling lesson progress display (can be overridden by course components)
  const [showLessonProgress, setShowLessonProgress] = useState(true);
  
  // ALL useEffect HOOKS MUST BE DECLARED HERE - BEFORE ANY CONDITIONAL RETURNS
  // This prevents "Rendered more hooks than during the previous render" error
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Timer to prevent brief error message flash during normal loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2000); // Wait 2 seconds before allowing error messages
    
    return () => clearTimeout(timer);
  }, []);
  
  // Clear loading state early if course configuration becomes available
  useEffect(() => {
    if (course?.courseDetails?.['course-config']?.courseStructure && isInitialLoading) {
      setIsInitialLoading(false);
    }
  }, [course?.courseDetails]); // Remove isInitialLoading from dependencies to prevent loop
  
  // Clear developer authorization cache when user logs out
  useEffect(() => {
    if (!currentUser) {
      previousAuthRef.current = { wasAuthorized: false, userEmail: null, courseId: null };
    }
  }, [currentUser]);

  // Initialize developer mode state from localStorage when course loads
  useEffect(() => {
    if (isAuthorizedDeveloper && course) {
      const courseId = course?.CourseID || course?.courseId;
      if (courseId) {
        const stored = localStorage.getItem(`devMode_${courseId}`);
        // Only set to true if not explicitly set to false
        setIsDeveloperModeActive(stored !== 'false');
      }
    }
  }, [isAuthorizedDeveloper, course]);
  
  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind's md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Handle click outside navigation to collapse it (desktop only)
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only handle on desktop when navigation is expanded
      if (!isMobile && navExpanded && navigationRef.current && !navigationRef.current.contains(event.target)) {
        setNavExpanded(false);
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, navExpanded]);
  
  // Sync with external state if provided
  useEffect(() => {
    if (externalActiveItemId && externalActiveItemId !== activeItemId) {
      setActiveItemId(externalActiveItemId);
    }
  }, [externalActiveItemId, activeItemId]);

  // Validate lesson from URL parameter exists in course structure
  useEffect(() => {
    // Only validate if we have both an activeItemId AND course structure is loaded
    if (activeItemId && allCourseItems.length > 0) {
      
      // Validate that the current activeItemId (from URL) exists in course structure
      const lessonExists = allCourseItems.find(item => item.itemId === activeItemId);
      if (!lessonExists) {
        // If lesson from URL doesn't exist, clear it so course can set default
        setActiveItemId(null);
        // Also clean up the URL and localStorage
        const url = new URL(window.location);
        url.searchParams.delete('lesson');
        window.history.replaceState({}, '', url);
        
        const courseId = course?.CourseID || course?.courseId;
        if (courseId) {
          const storageKey = `lastLesson_${courseId}`;
          localStorage.removeItem(storageKey);
        }
      } else {
        // If lesson exists and came from URL, save it to localStorage for future sessions
        const urlParams = new URLSearchParams(window.location.search);
        const lessonFromUrl = urlParams.get('lesson');
        if (lessonFromUrl === activeItemId) {
          const courseId = course?.CourseID || course?.courseId;
          if (courseId) {
            const storageKey = `lastLesson_${courseId}`;
            localStorage.setItem(storageKey, activeItemId);
          }
        }
      }
    } else if (activeItemId && allCourseItems.length === 0) {
    }
  }, [allCourseItems, activeItemId, course]);

  // Preload course module when course ID is known
  useEffect(() => {
    const courseId = course?.CourseID;
    if (courseId && !courseModuleLoaded) {
      // Preload the appropriate course module
      let modulePromise;
      switch(courseId) {
        case 4:
        case '4':
          modulePromise = import('./courses/4');
          break;
        case 2:
        case '2':
          modulePromise = import('./courses/2');
          break;
        case 3:
        case '3':
          modulePromise = import('./courses/3');
          break;
        case 0:
        case '0':
          modulePromise = import('./courses/PHY30');
          break;
        case 5:
        case '5':
          modulePromise = import('./courses/5');
          break;
        case 6:
        case '6':
          modulePromise = import('./courses/6');
          break;
        case 100:
        case '100':
          modulePromise = import('./courses/100');
          break;
        default:
          setCourseModuleLoaded(true); // No module to load
          return;
      }
      
      modulePromise.then(() => {
        setCourseModuleLoaded(true);
      }).catch(err => {
        console.error('❌ Failed to load course module:', err);
        setCourseModuleLoaded(true); // Set to true anyway to show error state
      });
    }
  }, [course?.CourseID, courseModuleLoaded]);

  // Set content ready state when all necessary data is loaded including course module
  useEffect(() => {
    const hasStructure = allCourseItems.length > 0;
    const hasCourseData = !!course;
    const hasTitle = !!courseData.title;
    const hasModule = courseModuleLoaded;
    
    if (hasStructure && hasCourseData && hasTitle && hasModule && !isContentReady) {
      // Small delay to prevent flickering
      const timer = setTimeout(() => {
        setIsContentReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [allCourseItems.length, course, courseData.title, courseModuleLoaded, isContentReady]);

  // Load AI prompt when active lesson changes
  useEffect(() => {
    const loadPromptForLesson = async () => {
      if (!activeItemId || !course?.CourseID) {
        return;
      }
      
      setIsLoadingPrompt(true);
      try {
        const prompt = await loadLessonPrompt(course.CourseID, activeItemId);
        
        // Enhance prompt with additional context
        const currentItem = allCourseItems.find(item => item.itemId === activeItemId);
        const currentUnit = unitsList.find(unit => 
          unit.items?.some(item => item.itemId === activeItemId)
        );
        
        // Extract lesson-specific questions from course assessments
        const lessonQuestions = getLessonSpecificQuestions(
          course.CourseID, 
          activeItemId, 
          course.Assessments
        );
        
        // Calculate progress for this specific use
        let courseProgress = 0;
        if (allCourseItems.length > 0) {
          const gradebook = course?.Gradebook;
          const completedCount = allCourseItems.filter(item => {
            const courseStructureItem = gradebook?.courseStructureItems?.[item.itemId];
            const gradebookItem = gradebook?.items?.[item.itemId];
            return courseStructureItem?.completed || gradebookItem?.status === 'completed' || gradebookItem?.status === 'manually_graded';
          }).length;
          courseProgress = Math.round((completedCount / allCourseItems.length) * 100);
        }
        
        const enhancedPrompt = enhancePromptWithContext(prompt, {
          currentUnit: currentUnit?.title || currentUnit?.name,
          lessonTitle: currentItem?.title,
          lessonType: currentItem?.type,
          studentProgress: `${courseProgress}% course completion`,
          keywords: currentItem?.keywords || [],
          lessonQuestions: lessonQuestions,
          studentName: profile?.preferredFirstName || profile?.firstName
        });
        
        // Add lesson questions to the enhanced prompt for AI context
        enhancedPrompt.lessonQuestions = lessonQuestions;
        
        
        setCurrentAIPrompt(enhancedPrompt);
      } catch (error) {
        console.error('Failed to load AI prompt:', error);
        // Will use default prompt from the loader
      } finally {
        setIsLoadingPrompt(false);
      }
    };
    
    if (activeItemId) {
      loadPromptForLesson();
    }
  }, [activeItemId, course?.CourseID, allCourseItems, unitsList, course?.Gradebook, course?.Assessments, getLessonSpecificQuestions]);

  // Calculate progress using simplified cloud function data - Using new courseProgressUtils
  useEffect(() => {
    // Check if we have valid gradebook data from cloud functions
    if (!hasValidGradebookData(course) || !allCourseItems.length) {
      setProgress({});
      return;
    }
    
    // Use simplified progress calculation from courseProgressUtils
    const navigationProgress = getNavigationProgress(course, allCourseItems);
    setProgress(navigationProgress);
    
  
  // DEBUG: Log activeItemId and gradebook path for troubleshooting
  }, [course?.Gradebook, allCourseItems, realtimeGradebook, dataUpdateTrigger]);

  // Realtime listener for grades updates
  useEffect(() => {
    // Only set up listener if we have a course ID and user email
    const courseId = course?.CourseID || course?.courseId;
    const userEmail = currentUser?.email || profile?.StudentEmail;
    
    if (!courseId || !userEmail) {
      return;
    }
    
    
    // Use the correct student key format from the profile if available
    let studentKey;
    if (profile?.StudentKey) {
      studentKey = profile.StudentKey;
    } else {
      // Fallback to sanitizing the email
      studentKey = sanitizeEmail(userEmail);
    }
    const gradesPath = `students/${studentKey}/courses/${courseId}/Grades/assessments`;
    
    
    // Create database reference
    const db = getDatabase();
    const gradesRef = ref(db, gradesPath);
    
    // Set up the listener
    const unsubscribe = onValue(gradesRef, (snapshot) => {
      const gradesData = snapshot.val();
      
      // Update the realtime grades state
      setRealtimeGrades(gradesData || {});
      
      // Update the course object's grades if they exist
      if (gradesData && course?.Grades) {
        course.Grades.assessments = gradesData;
      }
      
      // Force re-render by updating trigger
      setDataUpdateTrigger(prev => prev + 1);
    }, (error) => {
      console.error('❌ Error in grades listener:', error);
    });
    
    // Cleanup function
    return () => {
      off(gradesRef, 'value');
    };
  }, [course?.CourseID, course?.courseId, currentUser?.email, profile?.StudentEmail, profile?.StudentKey]);

  // Realtime listener for ExamSessions updates (for session-based scoring)
  useEffect(() => {
    // Only set up listener if we have a course ID and user email
    const courseId = course?.CourseID || course?.courseId;
    const userEmail = currentUser?.email || profile?.StudentEmail;
    
    if (!courseId || !userEmail) {
      return;
    }
    
    // Use the correct student key format from the profile if available
    let studentKey;
    if (profile?.StudentKey) {
      studentKey = profile.StudentKey;
    } else {
      // Fallback to sanitizing the email
      studentKey = sanitizeEmail(userEmail);
    }
    
    // Listen to the student's specific exam sessions path
    const examSessionsPath = `students/${studentKey}/courses/${courseId}/ExamSessions`;
    
    
    // Create database reference
    const db = getDatabase();
    const examSessionsRef = ref(db, examSessionsPath);
    
    // Set up the listener
    const unsubscribe = onValue(examSessionsRef, (snapshot) => {
      const sessionsData = snapshot.val();
      
      // Update the realtime exam sessions state
      setRealtimeExamSessions(sessionsData || {});
      
      // Update the course object's exam sessions if they exist
      if (sessionsData && course) {
        course.ExamSessions = sessionsData;
      }
      
      // Force re-render by updating trigger
      setDataUpdateTrigger(prev => prev + 1);
    }, (error) => {
      console.error('❌ Error in ExamSessions listener:', error);
    });
    
    // Cleanup function
    return () => {
      off(examSessionsRef, 'value');
    };
  }, [course?.CourseID, course?.courseId, currentUser?.email, profile?.StudentEmail, profile?.StudentKey]);

  // Realtime listener for Gradebook updates (cloud function calculated data)
  useEffect(() => {
    // Only set up listener if we have a course ID and user email
    const courseId = course?.CourseID || course?.courseId;
    const userEmail = currentUser?.email || profile?.StudentEmail;
    
    if (!courseId || !userEmail) {
      return;
    }
    
    // Use the correct student key format from the profile if available
    let studentKey;
    if (profile?.StudentKey) {
      studentKey = profile.StudentKey;
    } else {
      // Fallback to sanitizing the email
      studentKey = sanitizeEmail(userEmail);
    }
    
    // Listen to the student's specific gradebook path
    const gradebookPath = `students/${studentKey}/courses/${courseId}/Gradebook`;
    
    
    // Create database reference
    const db = getDatabase();
    const gradebookRef = ref(db, gradebookPath);
    
    // Set up the listener
    const unsubscribe = onValue(gradebookRef, (snapshot) => {
      const gradebookData = snapshot.val();
      
      // Update the realtime gradebook state
      setRealtimeGradebook(gradebookData || {});
      
      // Update the course object's gradebook if it exists
      if (gradebookData && course) {
        course.Gradebook = gradebookData;
      }
      
      // Force re-render by updating trigger
      setDataUpdateTrigger(prev => prev + 1);
    }, (error) => {
      console.error('❌ Error in Gradebook listener:', error);
    });
    
    // Cleanup function
    return () => {
      off(gradebookRef, 'value');
    };
  }, [course?.CourseID, course?.courseId, currentUser?.email, profile?.StudentEmail, profile?.StudentKey]);

  // Realtime listener for progressionExemptions (teacher-granted prerequisite waivers)
  useEffect(() => {
    // Only set up listener if we have a course ID and user email
    const courseId = course?.CourseID || course?.courseId;
    const userEmail = currentUser?.email || profile?.StudentEmail;
    
    if (!courseId || !userEmail) {
      return;
    }
    
    // Use the correct student key format from the profile if available
    let studentKey;
    if (profile?.StudentKey) {
      studentKey = profile.StudentKey;
    } else {
      // Fallback to sanitizing the email
      studentKey = sanitizeEmail(userEmail);
    }
    
    // Listen to the student's progression exemptions
    const exemptionsPath = `students/${studentKey}/courses/${courseId}/progressionExemptions`;
    
    // Create database reference
    const db = getDatabase();
    const exemptionsRef = ref(db, exemptionsPath);
    
    // Set up the listener
    const unsubscribe = onValue(exemptionsRef, (snapshot) => {
      const exemptionsData = snapshot.val();
      
      // Update the course object's progression exemptions
      if (course) {
        course.progressionExemptions = exemptionsData || {};
      }
      
      // Force re-render by updating trigger
      setDataUpdateTrigger(prev => prev + 1);
    }, (error) => {
      console.error('❌ Error in progressionExemptions listener:', error);
    });
    
    // Cleanup function
    return () => {
      off(exemptionsRef, 'value');
    };
  }, [course?.CourseID, course?.courseId, currentUser?.email, profile?.StudentEmail, profile?.StudentKey]);
  
  // END OF useEffect HOOKS SECTION
  
  // Ref for navigation container to detect outside clicks
  const navigationRef = useRef(null);
  
  // Check if current user is authorized to see debug info
  const isDebugAuthorized = useMemo(() => {
    if (!currentUser?.email || !course?.courseDetails?.allowedEmails) {
      return false;
    }
    
    const userEmail = currentUser.email.toLowerCase();
    const allowedEmails = course.courseDetails.allowedEmails;
    
    // Check if user email is in the allowed emails array
    return allowedEmails.some(email => 
      email.toLowerCase() === userEmail
    );
  }, [currentUser, course]);
  
  // Handle developer mode toggle
  const handleDeveloperModeToggle = useCallback((enabled) => {
    setIsDeveloperModeActive(enabled);
    const courseId = course?.CourseID || course?.courseId;
    if (courseId) {
      localStorage.setItem(`devMode_${courseId}`, enabled.toString());
    }
  }, [course]);

  // Handle AI chat sheet size change
  const handleChatSizeChange = useCallback((newSize) => {
    setChatSheetSize(newSize);
    // Save preference to localStorage
    const courseId = course?.CourseID || course?.courseId;
    if (courseId) {
      localStorage.setItem(`chatSheetSize_${courseId}`, newSize);
    }
  }, [course]);

  // Handle message prepopulation from child components
  const handlePrepopulateMessage = useCallback((message) => {
    setPrepopulatedMessage(message);
    
    // If chat is closed, open it
    if (!isChatOpen) {
      setIsChatOpen(true);
    }
    
    // Clear prepopulated message after a delay to allow chat to use it
    setTimeout(() => {
      setPrepopulatedMessage('');
    }, 500);
  }, [isChatOpen]);

  // Handle AI accordion content selection
  const handleAIAccordionContent = useCallback((extractedContent) => {
    // Set the content context data for the AI chat
    setContentContextData(extractedContent);
    
    // If chat is closed, open it
    if (!isChatOpen) {
      setIsChatOpen(true);
    }
  }, [isChatOpen]);

  // Helper function to create "Ask AI about this question/example" buttons
  const createAskAIButton = useCallback((questionTextOrNumber, userQuestion = null, buttonText = null) => {
    // Handle both direct question text and example numbers
    let messageText;
    let displayText;
    
    if (typeof questionTextOrNumber === 'string') {
      // Direct question text provided
      messageText = questionTextOrNumber;
      displayText = buttonText || "Ask AI about this question";
    } else {
      // Example number provided (legacy support)
      const exampleNumber = questionTextOrNumber;
      messageText = userQuestion || `Can you help me understand Example ${exampleNumber}?`;
      displayText = buttonText || `Ask AI about Example ${exampleNumber}`;
    }
    
    return (
      <button
        onClick={() => handlePrepopulateMessage(messageText)}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 hover:border-purple-300 transition-all duration-200"
      >
        <Bot className="w-4 h-4" />
        {displayText}
      </button>
    );
  }, [handlePrepopulateMessage]);

  // Helper function to create "Ask AI" button that extracts text from a parent element
  const createAskAIButtonFromElement = useCallback((elementSelector, buttonText = "Ask AI about this question") => {
    const handleClick = () => {
      try {
        // Try to find the element and extract its text content
        const element = document.querySelector(elementSelector);
        if (element) {
          // Extract clean text content, removing extra whitespace
          let textContent = element.textContent || element.innerText || '';
          textContent = textContent.replace(/\s+/g, ' ').trim();
          
          // Truncate if too long and add context
          if (textContent.length > 500) {
            textContent = textContent.substring(0, 500) + '...';
          }
          
          const message = `Can you help me with this question: "${textContent}"`;
          handlePrepopulateMessage(message);
        } else {
          // Fallback if element not found
          handlePrepopulateMessage(`Can you help me with this question?`);
        }
      } catch (error) {
        console.warn('Error extracting text from element:', error);
        handlePrepopulateMessage(`Can you help me with this question?`);
      }
    };

    return (
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 hover:border-purple-300 transition-all duration-200"
      >
        <Bot className="w-4 h-4" />
        {buttonText}
      </button>
    );
  }, [handlePrepopulateMessage]);

  // Handle internal item selection and propagate to parent if needed
  const handleItemSelect = useCallback((itemId) => {
    setActiveItemId(itemId);
    
    // Update URL parameter to persist lesson selection
    const url = new URL(window.location);
    url.searchParams.set('lesson', itemId);
    window.history.replaceState({}, '', url);
    
    // Also save to localStorage for reliable persistence
    const courseId = course?.CourseID || course?.courseId;
    if (courseId) {
      const storageKey = `lastLesson_${courseId}`;
      localStorage.setItem(storageKey, itemId);
    }
    
    // Scroll to top when selecting a new item
    window.scrollTo(0, 0);

    if (externalItemSelect) {
      externalItemSelect(itemId);
    }
  }, [externalItemSelect, course]);

  // Handle scroll to top and expand navigation
  const handleScrollToTopAndExpand = useCallback(() => {
    // Expand navigation
    setNavExpanded(true);
    
    // Scroll to top smoothly
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  // Calculate lesson accessibility for the active lesson info panel
  const lessonAccessibility = useMemo(() => {
    console.log('🔐 Calculating lessonAccessibility:', {
      isStaffView,
      devMode,
      isDeveloperModeActive,
      hasGradebook: !!course?.Gradebook,
      allCourseItemsCount: allCourseItems.length,
      progressionEnabled: course?.courseDetails?.['course-config']?.progressionRequirements?.enabled,
      realtimeGradebookUpdate: !!realtimeGradebook,
      dataUpdateTrigger
    });
    
    // If no course items yet, return empty
    if (allCourseItems.length === 0) {
      console.log('🔐 No course items yet, returning empty accessibility');
      return {};
    }
    
    // Skip access control for staff/dev or when developer mode is active
    const shouldBypass = shouldBypassAllRestrictions(isStaffView, devMode, currentUser, course) || 
                        (isAuthorizedDeveloper && isDeveloperModeActive);
    
    if (shouldBypass) {
      const accessibility = {};
      let bypassReason = getBypassReason(isStaffView, devMode, currentUser, course);
      if (isAuthorizedDeveloper && isDeveloperModeActive) {
        bypassReason = 'Developer mode active';
      }
      allCourseItems.forEach(item => {
        accessibility[item.itemId] = { accessible: true, reason: bypassReason };
      });
      return accessibility;
    }
    
    // Use the real-time gradebook if available, otherwise fall back to course.Gradebook
    const currentGradebook = realtimeGradebook || course?.Gradebook;
    
    // If no gradebook data yet, still calculate basic accessibility
    if (!currentGradebook) {
      const accessibility = {};
      // First lesson is always accessible, others need gradebook data to determine
      allCourseItems.forEach((item, index) => {
        if (index === 0) {
          accessibility[item.itemId] = { accessible: true, reason: 'First lesson' };
        } else {
          accessibility[item.itemId] = { accessible: false, reason: 'Loading progression data...' };
        }
      });
      return accessibility;
    }
    
    // Create an updated course object with real-time gradebook
    const courseWithRealtimeData = {
      ...course,
      Gradebook: currentGradebook
    };
    
    // Get the course structure
    const courseStructure = {
      courseStructure: {
        units: unitsList
      }
    };
    
    // Get progression requirements from the correct location
    const progressionRequirements = course.courseDetails?.['course-config']?.progressionRequirements;
    
    // Only apply sequential access if enabled
    if (!progressionRequirements?.enabled) {
      const accessibility = {};
      allCourseItems.forEach(item => {
        accessibility[item.itemId] = { accessible: true, reason: 'Sequential access disabled' };
      });
      return accessibility;
    }
    
    // Pass developer bypass information to handle inDevelopment restrictions
    const isDeveloperBypass = shouldBypass || (isAuthorizedDeveloper && isDeveloperModeActive);
    
    // Use the simplified lesson access logic with the course object that has real-time gradebook
    return getLessonAccessibility(courseStructure, courseWithRealtimeData, {
      isDeveloperBypass,
      staffOverrides: {}, // Add staff overrides if needed
      progressionExemptions: courseWithRealtimeData?.progressionExemptions || {}
    });
  }, [allCourseItems, isStaffView, devMode, currentUser, course, isAuthorizedDeveloper, isDeveloperModeActive, unitsList, realtimeGradebook, dataUpdateTrigger]);
  
  // Find the current active item for the info panel
  const currentActiveItem = useMemo(() => {
    if (!activeItemId) return null;
    return allCourseItems.find(item => item.itemId === activeItemId);
  }, [activeItemId, allCourseItems]);

  // Calculate overall course progress percentage
  const overallProgress = useMemo(() => {
    if (!allCourseItems.length) return 0;
    
    // Use realtime gradebook if available, otherwise fall back to course.Gradebook
    const gradebookToUse = realtimeGradebook || course?.Gradebook;
    
    // Count completed items directly from gradebook items
    const completedCount = allCourseItems.filter(item => {
      const itemGradeData = gradebookToUse?.items?.[item.itemId];
      return itemGradeData?.completed === true || 
             itemGradeData?.status === 'completed' || 
             itemGradeData?.status === 'manually_graded';
    }).length;
    
    return Math.round((completedCount / allCourseItems.length) * 100);
  }, [allCourseItems, course, realtimeGradebook, dataUpdateTrigger]);

  // Calculate if current lesson is completed and get next lesson info
  const currentLessonCompletion = useMemo(() => {
    if (!activeItemId || !course) return { isCompleted: false, nextLesson: null };
    
    // Check if current lesson is completed
    const isCompleted = isLessonFullyCompleted(activeItemId, course);
    
    // Get next lesson info with accessibility
    const courseStructure = {
      courseStructure: {
        units: unitsList
      }
    };
    
    const nextLesson = getNextLessonWithAccessibility(
      courseStructure, 
      activeItemId, 
      course,
      {
        isDeveloperBypass: isAuthorizedDeveloper && isDeveloperModeActive,
        staffOverrides: {},
        progressionExemptions: course?.progressionExemptions || {}
      }
    );
    
    return {
      isCompleted,
      nextLesson
    };
  }, [activeItemId, course, unitsList, isAuthorizedDeveloper, isDeveloperModeActive, realtimeGradebook, dataUpdateTrigger]);

  // Simple next lesson finder with accessibility check
  const findNextLesson = useMemo(() => {
    if (!activeItemId || !allCourseItems.length) return null;
    
    // Find current lesson index
    const currentIndex = allCourseItems.findIndex(item => item.itemId === activeItemId);
    
    if (currentIndex === -1 || currentIndex === allCourseItems.length - 1) {
      return null; // No next lesson
    }
    
    // Get next lesson
    const nextItem = allCourseItems[currentIndex + 1];
    
    if (!nextItem) return null;
    
    // Get the unit for the next lesson
    const nextUnit = unitsList.find(unit => 
      unit.items && unit.items.some(item => item.itemId === nextItem.itemId)
    );
    
    // Check accessibility of the next lesson
    const accessInfo = lessonAccessibility[nextItem.itemId] || { accessible: true, reason: 'Default access' };
    
    return {
      itemId: nextItem.itemId,
      title: nextItem.title,
      type: nextItem.type,
      unitTitle: nextUnit?.name || nextUnit?.title,
      accessible: accessInfo.accessible,
      accessReason: accessInfo.reason
    };
  }, [activeItemId, allCourseItems, unitsList, lessonAccessibility]);

  // Check if current lesson is the last lesson in the course
  const isLastLesson = useMemo(() => {
    if (!activeItemId || !allCourseItems.length) return false;
    
    const currentIndex = allCourseItems.findIndex(item => item.itemId === activeItemId);
    return currentIndex === allCourseItems.length - 1;
  }, [activeItemId, allCourseItems]);

  // Check if the entire course is complete (100% completion)
  const isCourseFullyComplete = useMemo(() => {
    if (!allCourseItems.length) return false;
    
    // Use realtime gradebook if available, otherwise fall back to course.Gradebook
    const gradebookToUse = realtimeGradebook || course?.Gradebook;
    
    if (!gradebookToUse?.items) return false;
    
    // Check if ALL items are completed
    const allItemsCompleted = allCourseItems.every(item => {
      const itemGradeData = gradebookToUse.items[item.itemId];
      return itemGradeData?.completed === true || 
             itemGradeData?.status === 'completed' || 
             itemGradeData?.status === 'manually_graded';
    });
    
    return allItemsCompleted;
  }, [allCourseItems, course, realtimeGradebook, dataUpdateTrigger]);

  // Get current unit index
  const currentUnitIndex = useMemo(() => {
    if (!activeItemId) {
      // Default to first unit if no active item
      return 0;
    }
    
    return unitsList.findIndex(unit => 
      unit.items && unit.items.some(item => item.itemId === activeItemId)
    );
  }, [unitsList, activeItemId]);

  // Get course-specific AI assistant name
  const getAIAssistantName = useCallback(() => {
    const courseId = course?.CourseID || course?.courseId;
    const courseIdStr = String(courseId);
    
    switch(courseIdStr) {
      case '2':
        return 'AI Physics Assistant';
      case '3':
        return 'AI Math Assistant';
      case '4':
        return 'AI Orientation Assistant';
      case '5':
        return 'AI Data Science Assistant';
      case '6':
        return 'AI Keyboarding Assistant';
      case '100':
        return 'AI Learning Assistant';
      case '0':
        return 'AI Physics Assistant';
      default:
        return 'AI Course Assistant';
    }
  }, [course]);
  
  // Course and profile data available for component logic
  console.log('Course object:', course);
  console.log('Profile object:', profile);
  
  // Log Firebase token details for device detection
  useEffect(() => {
    const logTokenInfo = async () => {
      if (currentUser) {
        try {
          // Get the ID token result which includes claims
          const tokenResult = await currentUser.getIdTokenResult();
          console.log('🔐 Firebase Token Claims:', tokenResult.claims);
          console.log('🔐 Token Issued At:', new Date(tokenResult.issuedAtTime));
          console.log('🔐 Token Expiration:', new Date(tokenResult.expirationTime));
          console.log('🔐 Sign-in Provider:', tokenResult.signInProvider);
          console.log('🔐 Auth Time:', new Date(tokenResult.authTime));
          
          // Log the full token result for inspection
          console.log('🔐 Full Token Result:', tokenResult);
          
          // Also log user metadata
          console.log('📱 User Metadata:', {
            creationTime: currentUser.metadata.creationTime,
            lastSignInTime: currentUser.metadata.lastSignInTime,
            providerId: currentUser.providerId,
            providerData: currentUser.providerData
          });
          
          // Log user agent for device detection
          console.log('📱 User Agent:', navigator.userAgent);
          console.log('📱 Platform:', navigator.platform);
          console.log('📱 Is Mobile (detected):', isMobile);
          console.log('📱 Screen Size:', {
            width: window.innerWidth,
            height: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio
          });
        } catch (error) {
          console.error('Error getting token info:', error);
        }
      }
    };
    
    logTokenInfo();
  }, [currentUser, isMobile]);
  
  // Now that all hooks are declared, we can do conditional returns
  // Show loading state if course is temporarily unavailable during transitions
  if (courseData.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-blue-600 mb-4">
            <svg className="mx-auto h-16 w-16 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Course...</h2>
          <p className="text-gray-600">Please wait while we load the course structure.</p>
        </div>
      </div>
    );
  }

  // Show error state if no course structure available
  if (courseData.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Course Structure Loading</h2>
          <p className="text-gray-600 mb-4">{courseData.error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Debug logging

  // Validate gradebook structure and sync course config when course loads
  // TEMPORARILY COMMENTED OUT FOR TESTING - Kyle
  /*
  useEffect(() => {
    const validateAndSyncCourseConfig = async () => {
      // Only validate for authenticated users with a valid course
      if (!currentUser?.email || !course?.CourseID) {
        return;
      }
      
      // Skip validation in staff/dev mode to avoid unnecessary overhead
      if (shouldBypassAllRestrictions(isStaffView, devMode, currentUser, course)) {
        return;
      }
      
      try {
        
        const functions = getFunctions();
        const validateGradebookStructure = httpsCallable(functions, 'validateGradebookStructure');
        
        const result = await validateGradebookStructure({
          courseId: course.CourseID.toString(),
          studentEmail: currentUser.email
        });
        
        if (result.data?.success) {
          const { configSynced, configChanges, wasRebuilt } = result.data;
          
          if (configSynced && configChanges?.length > 0) {
            
            // If significant changes were made, we might want to refresh the course data
            // For now, just log the changes - the realtime listener will pick up updates
            if (wasRebuilt) {
              // Could trigger a course data refresh here if needed
            }
          } else if (configSynced) {
          }
        }
      } catch (error) {
        // Don't show errors to users for background validation
        console.warn('Course config validation failed (non-critical):', error.message);
      }
    };
    
    // Run validation after course data is loaded
    if (course?.CourseID && currentUser?.email && allCourseItems.length > 0) {
      // Debounce validation to avoid multiple calls
      const timer = setTimeout(validateAndSyncCourseConfig, 2000);
      return () => clearTimeout(timer);
    }
  }, [course?.CourseID, currentUser?.email, allCourseItems.length, isStaffView, devMode]);
  */

  // GRADE CALCULATION UTILITY FUNCTIONS - Now imported from utils
  
  // Show error state if no course structure available
  if (courseData.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Course Structure Loading</h2>
          <p className="text-gray-600 mb-4">{courseData.error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">

      
      {/* Header - full width, sticky */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
          <button
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 text-sm ${
                activeTab === 'content' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('content')}
            >
              <BookOpen className="h-4 w-4" />
              <span>Content</span>
            </button>
            
            <button
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 text-sm ${
                (activeTab === 'progress' || activeTab === 'grades') 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('progress')}
            >
              <FaGraduationCap className="h-4 w-4" />
              <span>Gradebook</span>
            </button>
            
            <button
              className="px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 text-sm text-gray-600 hover:bg-gray-50"
              onClick={() => setIsCourseOutlineOpen(true)}
            >
              <FileText className="h-4 w-4" />
              <span>Course Outline</span>
            </button>
            
            <button
              className="px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 text-sm text-gray-600 hover:bg-gray-50"
              onClick={() => setIsResourcesOpen(true)}
            >
              <Folder className="h-4 w-4" />
              <span>Resources</span>
            </button>
            
            {/* Debug tab - only show for authorized users when developer mode is active */}
            {isDebugAuthorized && isDeveloperModeActive && (
              <button
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 text-sm ${
                  activeTab === 'debug' 
                    ? 'bg-orange-100 text-orange-800' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('debug')}
              >
                <Bug className="h-4 w-4" />
                <span>Debug</span>
              </button>
            )}
            
            {/* Developer Mode Toggle - only show for authorized developers */}
            {isAuthorizedDeveloper && (
              <div className="ml-4 flex items-center gap-2 px-3 py-1 bg-orange-50 rounded-md border border-orange-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm font-medium text-orange-800">Dev Mode</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isDeveloperModeActive}
                      onChange={(e) => handleDeveloperModeToggle(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
                  </div>
                </label>
              </div>
            )}
          </div>
          
          {/* Simple Lesson Title - hidden on small screens */}
          {activeTab === 'content' && currentActiveItem && (
            <div className="hidden md:flex items-center gap-3 text-sm">
              <div className="text-gray-600 font-medium truncate max-w-xs">
                {currentActiveItem.title}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content area with navigation */}
      <div className="flex relative">
        {/* Collapsible Navigation - responsive width */}
        {!isMobile && (
          <div 
            ref={navigationRef}
            className={`
              ${navExpanded ? 'w-96' : 'w-12'} 
              flex-shrink-0 transition-all duration-300
            `}
          >
            <CollapsibleNavigation
              courseTitle={courseTitle}
              unitsList={unitsList}
              progress={progress}
              activeItemId={activeItemId}
              expanded={navExpanded}
              onToggleExpand={() => setNavExpanded(!navExpanded)}
              onItemSelect={(itemId) => {
                handleItemSelect(itemId);
                setActiveTab('content');
              }}
              currentUnitIndex={currentUnitIndex !== -1 ? currentUnitIndex : 0}
              course={course}
              isMobile={false}
              isStaffView={isStaffView}
              devMode={devMode}
              lessonAccessibility={lessonAccessibility}
              isDeveloperModeActive={isDeveloperModeActive}
            />
          </div>
        )}
        
        {/* SEQUENTIAL_ACCESS_UPDATE: Added isStaffView and devMode props for lesson access control */}
        {/* Original CollapsibleNavigation props (before sequential access): courseTitle, unitsList, progress, activeItemId, expanded, onToggleExpand, onItemSelect, currentUnitIndex, course, isMobile, gradebookItems */}
        
        {/* Mobile navigation is now handled by Sheet in CollapsibleNavigation */}
        {isMobile && (
          <CollapsibleNavigation
            courseTitle={courseTitle}
            unitsList={unitsList}
            progress={progress}
            activeItemId={activeItemId}
            expanded={navExpanded}
            onToggleExpand={() => setNavExpanded(!navExpanded)}
            onItemSelect={(itemId) => {
              handleItemSelect(itemId);
              setActiveTab('content');
              // Auto-close navigation on mobile after selection
              setNavExpanded(false);
            }}
            currentUnitIndex={currentUnitIndex !== -1 ? currentUnitIndex : 0}
            course={course}
            isMobile={true}
            isStaffView={isStaffView}
            devMode={devMode}
            lessonAccessibility={lessonAccessibility}
            isDeveloperModeActive={isDeveloperModeActive}
          />
        )}

        {/* Main content - add padding bottom when course complete bar is shown */}
        <main className={`flex-1 p-6 ${isLastLesson && isCourseFullyComplete ? 'pb-32' : ''}`}>
          {activeTab === 'content' && (
            <div className="bg-white rounded-lg shadow">
          
              
              {/* Lesson Progress Bars - Hidden for AssessmentSession lessons and labs */}
              {currentActiveItem && showLessonProgress && (() => {
                // Hide progress bars for assignments, exams, quizzes, and labs
                if (currentActiveItem.type === 'assignment' || 
                    currentActiveItem.type === 'exam' || 
                    currentActiveItem.type === 'quiz' ||
                    currentActiveItem.type === 'lab') {
                  return null;
                }
                
                // Use realtimeGradebook for reactive updates
                const gradebookToUse = realtimeGradebook || course?.Gradebook;

                // Get the lesson score directly from gradebook items
                let lessonScore = null;
                if (gradebookToUse?.items) {
                  // Try original itemId first
                  let item = gradebookToUse.items[currentActiveItem.itemId];
                  
                  // If not found, try converting hyphens to underscores
                  if (!item && currentActiveItem.itemId.includes('-')) {
                    const underscoreItemId = currentActiveItem.itemId.replace(/-/g, '_');
                    item = gradebookToUse.items[underscoreItemId];
                  }
                  
                  // If still not found, try converting underscores to hyphens
                  if (!item && currentActiveItem.itemId.includes('_')) {
                    const hyphenItemId = currentActiveItem.itemId.replace(/_/g, '-');
                    item = gradebookToUse.items[hyphenItemId];
                  }
                  
                  if (item) {
                    lessonScore = {
                      score: item.score || 0,
                      total: item.total || 0,
                      percentage: item.percentage || 0,
                      attempted: item.attempted || 0,
                      totalQuestions: item.totalQuestions || item.total || 0,
                      valid: true
                    };
                  }
                }

                // Default if no item found
                if (!lessonScore) {
                  lessonScore = {
                    score: 0,
                    total: 0,
                    percentage: 0,
                    attempted: 0,
                    totalQuestions: 0,
                    valid: false
                  };
                }
                
                // DEBUG: Log lesson score data for troubleshooting
                
                if (!lessonScore.valid || lessonScore.totalQuestions === 0) {
                  return null;
                }
                
                const attemptedPercentage = lessonScore.totalQuestions > 0 ? (lessonScore.attempted / lessonScore.totalQuestions) * 100 : 0;
                
                return (
                  <div className="border-b border-gray-200 px-6 py-3 bg-gradient-to-r from-gray-50 to-blue-50">
                    <div className="space-y-2">
                      {/* Attempted Progress Bar */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700 w-32 flex-shrink-0">Attempted</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-gradient-to-r from-blue-400 to-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                            style={{ width: `${attemptedPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">{lessonScore.attempted}/{lessonScore.totalQuestions}</span>
                      </div>
                      
                      {/* Score Progress Bar - Now using actual grades */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700 w-32 flex-shrink-0">Score</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-green-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                            style={{ width: `${lessonScore.percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-green-600">{Math.round(lessonScore.percentage)}%</span>
                          <span className="text-sm text-gray-500">({lessonScore.score}/{lessonScore.total})</span>
                        </div>
                      </div>
                      
                      {/* Points Display */}
                    
                    </div>
                  </div>
                );
              })()}
              
              <React.Suspense fallback={<CourseLoadingSkeleton />}>
                {!isContentReady ? (
                  <CourseLoadingSkeleton />
                ) : (() => {
                  // Render course content directly in wrapper instead of going through CourseRouterEnhanced
                  const courseId = course?.CourseID;
                  
                  const courseProps = {
                    course: course,
                    activeItemId: activeItemId, // Course components expect this prop name
                    onItemSelect: handleItemSelect,
                    isStaffView,
                    devMode,
                    gradebookItems: course?.Gradebook?.items || course?.Assessments || {},
                    // Dynamic AI context callbacks (simplified)
                    // onUpdateAIContext: handleUpdateAIContext, // REMOVED: Using simple prepopulate approach
                    onPrepopulateMessage: handlePrepopulateMessage,
                    // Helper functions for creating AI assistant buttons
                    createAskAIButton: createAskAIButton,
                    createAskAIButtonFromElement: createAskAIButtonFromElement,
                    // AI Accordion support
                    AIAccordion: AIAccordion,
                    onAIAccordionContent: handleAIAccordionContent,
                    // Next lesson navigation props
                    currentLessonCompleted: currentLessonCompletion.isCompleted,
                    nextLessonInfo: currentLessonCompletion.nextLesson,
                    courseProgress: overallProgress,
                    // Progress display control
                    showLessonProgress: showLessonProgress,
                    setShowLessonProgress: setShowLessonProgress
                  };
                  
                  // Use pre-loaded components
                  switch(courseId) {
                    case 4:
                    case '4':
                      return <Course4 {...courseProps} />;
                    case 5:
                    case '5':
                      return <Course5 {...courseProps} />;
                    case 6:
                    case '6':
                      return <Course6 {...courseProps} />;
                    case 2:
                    case '2':
                      return <Course2 {...courseProps} />;
                    case 3:
                    case '3':
                      return <Course3 {...courseProps} />;
                    case 0:
                    case '0':
                      return <Course0 {...courseProps} />;
                    case 100:
                    case '100':
                      return <Course100 {...courseProps} />;
                    default:
                      return (
                        <div className="p-8">
                          <h1 className="text-2xl font-bold mb-4">{course?.Course?.Value || course?.courseDetails?.Title || 'Course'}</h1>
                          <p className="text-gray-600">
                            Course content for ID {courseId} is being developed. Check back soon!
                          </p>
                        </div>
                      );
                  }
                })()}
              </React.Suspense>
            </div>
          )}
          
          {(activeTab === 'progress' || activeTab === 'grades') && (
            <GradebookDashboard 
              course={{
                ...course,
                ExamSessions: realtimeExamSessions || course?.ExamSessions || {},
                Grades: realtimeGrades || course?.Grades || {}
              }} 
              profile={profile} 
              lessonAccessibility={lessonAccessibility} 
            />
          )}
          
          {/* Debug tab - only accessible by authorized users when developer mode is active */}
          {activeTab === 'debug' && isDebugAuthorized && isDeveloperModeActive && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="border-l-4 border-orange-400 bg-orange-50 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Bug className="h-5 w-5 text-orange-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-orange-800">
                      Debug Information
                    </h3>
                    <div className="mt-2 text-sm text-orange-700">
                      <p>This debug panel is only visible to authorized developers. It shows the raw course object for development purposes.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <h1 className="text-xl font-bold mb-4">Course Debug Information</h1>
              
              {/* User Authorization Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Authorization Status</h2>
                <div className="space-y-2 text-sm">
                  <div><strong>Current User Email:</strong> {currentUser?.email || 'Not authenticated'}</div>
                  <div><strong>Debug Access:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      isDebugAuthorized 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {isDebugAuthorized ? 'Authorized' : 'Not Authorized'}
                    </span>
                  </div>
                  <div><strong>Allowed Emails:</strong> 
                    {course?.courseDetails?.allowedEmails ? (
                      <ul className="ml-4 mt-1">
                        {course.courseDetails.allowedEmails.map((email, index) => (
                          <li key={index} className="text-gray-600">• {email}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-500 ml-2">None configured</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Course Object Display */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Real-time Course Object</h2>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96 text-sm font-mono">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(course, null, 2)}
                  </pre>
                </div>
              </div>
              
              {/* Course Structure Analysis */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Course Structure Analysis</h2>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h3 className="font-medium text-blue-800 mb-2">Available Paths:</h3>
                      <ul className="space-y-1 text-blue-700">
                        <li>• course.Gradebook?.courseStructure: {course.Gradebook?.courseStructure ? '✓' : '✗'}</li>
                        <li>• course.courseStructure: {course.courseStructure ? '✓' : '✗'}</li>
                        <li>• course.courseStructure?.structure: {course.courseStructure?.structure ? '✓' : '✗'}</li>
                        <li>• course.courseStructure?.units: {course.courseStructure?.units ? '✓' : '✗'}</li>
                        <li>• course.courseDetails: {course.courseDetails ? '✓' : '✗'}</li>
                        <li>• course.Gradebook?.summary: {course.Gradebook?.summary ? '✓' : '✗'}</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-800 mb-2">Resolved Data:</h3>
                      <ul className="space-y-1 text-blue-700">
                        <li>• Course Title: {courseTitle || 'Not found'}</li>
                        <li>• Units Count: {unitsList.length}</li>
                        <li>• Total Items: {allCourseItems.length}</li>
                        <li>• Course ID: {course?.CourseID || course?.courseId || 'Not found'}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Component Props */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Component Props</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h3 className="font-medium mb-2">Wrapper Props:</h3>
                      <ul className="space-y-1">
                        <li>• isStaffView: {String(isStaffView)}</li>
                        <li>• devMode: {String(devMode)}</li>
                        <li>• activeItemId: {externalActiveItemId || 'null'}</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Internal State:</h3>
                      <ul className="space-y-1">
                        <li>• activeTab: {activeTab}</li>
                        <li>• navExpanded: {String(navExpanded)}</li>
                        <li>• isMobile: {String(isMobile)}</li>
                        <li>• currentUnitIndex: {currentUnitIndex}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Gradebook Debug Tools */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Gradebook Debug Tools</h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-800 mb-3">Real-time Gradebook</h3>
                  <p className="text-sm text-yellow-700">
                    The gradebook is automatically updated in real-time when assessments are completed. 
                    No manual recalculation needed - all updates are handled by database triggers.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* Floating Navigation Button - only show on desktop when nav is collapsed */}
      {!isMobile && !navExpanded && (
        <button
          onClick={handleScrollToTopAndExpand}
          className="fixed bottom-4 left-4 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 shadow-lg transition-all duration-300 flex items-center justify-center group"
          aria-label="Show navigation and scroll to top"
        >
          <div className="relative">
            <Menu className="h-6 w-6 transition-transform group-hover:scale-110" />
            <ArrowUp className="h-3 w-3 absolute -top-1 -right-1 bg-blue-600 rounded-full" />
          </div>
        </button>
      )}
      
      {/* Floating Next Lesson Button - shows when there's a next lesson, greys out if not accessible */}
      <NextLessonButtonFloating
        currentLessonInfo={currentActiveItem}
        nextLessonInfo={findNextLesson}
        isAccessible={findNextLesson?.accessible}
        accessReason={findNextLesson?.accessReason}
        onExpandNavigation={() => {
          // Expand navigation panel to show context
          setNavExpanded(true);
        }}
        onNavigateToNext={(nextItemId) => {
          handleItemSelect(nextItemId);
          setActiveTab('content');
        }}
      />
      
      {/* Return to Dashboard Button - shows when course is complete and on last lesson */}
      <ReturnToDashboardButton
        isLastLesson={isLastLesson}
        isCourseComplete={isCourseFullyComplete}
        courseTitle={courseTitle}
        completionPercentage={overallProgress}
      />

 
      
      {/* Course Outline Modal */}
      <CourseOutline
        course={course}
        isOpen={isCourseOutlineOpen}
        onClose={() => setIsCourseOutlineOpen(false)}
      />
      
      {/* Course Resources Modal */}
      <CourseResources
        course={course}
        isOpen={isResourcesOpen}
        onClose={() => setIsResourcesOpen(false)}
      />
      
      {/* AI Chat Assistant Sheet - Only show if AI is enabled */}
      {isAIEnabled && (
        <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
          {/* Floating AI Assistant Button - Trigger */}
          <SheetTrigger asChild>
            <button
              className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full w-16 h-16 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110"
              aria-label="Open AI Assistant"
            >
              <Bot className="w-7 h-7 transition-transform group-hover:scale-110" />
              {/* Pulse animation ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 animate-ping opacity-20"></div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {getAIAssistantName()}
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </button>
          </SheetTrigger>
        
        {/* Sheet Content with AI Chat */}
        <SheetContent 
          side="right" 
          size={chatSheetSize}
          className="flex flex-col p-0 gap-0 [&>button]:hidden"
        >
          {/* Custom Chat Header with Width Controls */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Bot className="w-6 h-6 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{getAIAssistantName()}</span>
                    {currentActiveItem && (
                      <>
                        <span className="text-white/60">•</span>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-white/80 rounded-full animate-pulse flex-shrink-0"></div>
                          <span className="text-sm font-medium truncate text-white/90">
                            {currentActiveItem.title}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  {isLoadingPrompt && (
                    <div className="flex items-center gap-1 mt-1">
                      <Loader className="w-3 h-3 animate-spin" />
                      <span className="text-xs opacity-90">Loading context...</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Control Buttons - Close and Width Toggle */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Width toggle button - only show on desktop */}
                {!isMobile && (
                  <button
                    onClick={() => handleChatSizeChange(chatSheetSize === 'sm' ? 'full' : 'sm')}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    title={chatSheetSize === 'sm' ? 'Expand to fullscreen' : 'Compact view'}
                  >
                    {chatSheetSize === 'sm' ? (
                      <Maximize2 className="w-5 h-5 text-white" />
                    ) : (
                      <Minimize2 className="w-5 h-5 text-white" />
                    )}
                  </button>
                )}
                
                {/* Custom close button */}
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Close chat"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Chat Component */}
          <div className="flex-1 overflow-hidden">
            {currentAIPrompt && !isLoadingPrompt ? (
              <GoogleAIChatApp
                firebaseApp={undefined} // Will use default app
                instructions={currentAIPrompt.instructions}
                conversationHistory={currentAIPrompt.conversationHistory || [
                  {
                    sender: 'user',
                    text: 'Hello',
                    timestamp: Date.now() - 1000
                  },
                  {
                    sender: 'model',
                    text: currentAIPrompt.firstMessage || "Hello! I'm your AI assistant. How can I help you today?",
                    timestamp: Date.now()
                  }
                ]}
                sessionIdentifier={`course_${course?.CourseID}_lesson_${activeItemId}`}
                aiChatContext={{
                  courseId: course?.CourseID,
                  lessonId: activeItemId,
                  lessonTitle: currentActiveItem?.title,
                  lessonType: currentActiveItem?.type,
                  contextKeywords: currentAIPrompt.contextKeywords || [],
                  studentEmail: currentUser?.email,
                  lessonQuestions: currentAIPrompt.lessonQuestions || {}
                }}
                // Dynamic chat configuration from AI prompt
                showYouTube= {false} // Disabled YouTube for now
                showUpload={false} // Disabled file upload for now
                allowContentRemoval={currentAIPrompt.chatConfig?.allowContentRemoval ?? true}
                showResourcesAtTop={currentAIPrompt.chatConfig?.showResourcesAtTop ?? false}
                // Predefined content from lesson configuration
                YouTubeURL={currentAIPrompt.chatConfig?.predefinedYouTubeVideos?.[0]?.url}
                YouTubeDisplayName={currentAIPrompt.chatConfig?.predefinedYouTubeVideos?.[0]?.displayName}
                predefinedFiles={currentAIPrompt.chatConfig?.predefinedFiles || []}
                predefinedFilesDisplayNames={currentAIPrompt.chatConfig?.predefinedFilesDisplayNames || {}}
                showHeader={false}
                // AI configuration from lesson ai-prompt file
                aiModel={currentAIPrompt.aiConfig?.model || 'DEFAULT_CHAT_MODEL'}
                aiTemperature={currentAIPrompt.aiConfig?.temperature || 'BALANCED'}
                aiMaxTokens={currentAIPrompt.aiConfig?.maxTokens || 'MEDIUM'}
                // Simplified message prepopulation
                initialMessage={prepopulatedMessage}
                // Force new session when "Ask AI about example" is clicked
                forceNewSession={forceNewChatSession}
                // Content context from AI accordion
                contentContextData={contentContextData}
                onContentContext={(context) => {
                  // Clear content context after it's been processed
                  if (!context) {
                    setContentContextData(null);
                  }
                }}
                // Enable math-friendly rendering for physics courses
                mathFriendly={true}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Loading AI assistant...</p>
                  <p className="text-xs text-gray-500 mt-1">Preparing lesson context</p>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
      )}
    </div>
  );
};

// Export the main component directly - no provider wrapper needed
export default FirebaseCourseWrapperContent;