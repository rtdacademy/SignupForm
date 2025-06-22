import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { FaGraduationCap } from 'react-icons/fa';
import { BookOpen, ClipboardCheck, Bug, ArrowUp, Menu, RefreshCw, Loader, CheckCircle, Lock, PlayCircle, AlertCircle } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../context/AuthContext';
import { isUserAuthorizedDeveloper, shouldBypassAllRestrictions, getBypassReason } from './utils/authUtils';
import { getLessonAccessibility } from './utils/lessonAccess';
//import LessonInfoPanel from './components/navigation/LessonInfoPanel';
import CourseProgressBar from './components/navigation/CourseProgressBar';
import CollapsibleNavigation from './components/navigation/CollapsibleNavigation';
// Import the comprehensive GradebookDashboard component
import { 
  GradebookDashboard,
  CourseItemDetailModal, 
  QuestionReviewModal 
} from './components/gradebook';
import { Skeleton } from '../components/ui/skeleton';

// Lazy load course components at module level to prevent re-importing
const Course0 = React.lazy(() => import('./courses/PHY30'));
const Course2 = React.lazy(() => import('./courses/2'));
const Course3 = React.lazy(() => import('./courses/3'));
const Course4 = React.lazy(() => import('./courses/4'));
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
  devMode = false
}) => {
  const { currentUser } = useAuth();
  
  // Get course data first to check for errors
  const getCourseData = () => {
    console.log("🔍 FirebaseCourseWrapper - Analyzing course data:", course);
    console.log("🔍 Course structure paths:", {
      "course.Gradebook?.courseStructure": course.Gradebook?.courseStructure,
      "course.courseStructure": course.courseStructure,
      "course.courseStructure?.structure": course.courseStructure?.structure,
      "course.courseStructure?.units": course.courseStructure?.units
    });

    // First priority: check gradebook courseStructure (database-driven from backend config)
    if (course.Gradebook?.courseStructure) {
      console.log("✅ Using course structure from gradebook (database-driven from backend config)");
      return {
        title: course.Gradebook.courseStructure.title || course.Course?.Value || '',
        structure: course.Gradebook.courseStructure.units || [],
        courseWeights: course.weights || { lesson: 0.15, assignment: 0.35, exam: 0.35, project: 0.15 }
      };
    }
    
    // Second priority: check direct courseStructure path (legacy JSON file approach)
    else if (course.courseStructure?.structure) {
      console.log("⚠️ Using legacy courseStructure.structure from JSON file");
      return {
        title: course.courseStructure.title || '',
        structure: course.courseStructure.structure || [],
        courseWeights: course.weights || { lesson: 0.15, assignment: 0.35, exam: 0.35, project: 0.15 }
      };
    }
    // Also check for nested courseStructure.units pattern (legacy)
    else if (course.courseStructure?.units) {
      console.log("⚠️ Using legacy courseStructure.units from JSON file");
      return {
        title: course.courseStructure.title || course.Course?.Value || '',
        structure: course.courseStructure.units || [],
        courseWeights: course.weights || { lesson: 0.15, assignment: 0.35, exam: 0.35, project: 0.15 }
      };
    }

    // Error state: no structure available
    console.error("❌ ERROR: No course structure found! Gradebook may not be initialized.");
    return {
      title: course.Course?.Value || course.courseDetails?.Title || 'Course',
      structure: [],
      courseWeights: course.weights || { lesson: 0.15, assignment: 0.35, exam: 0.35, project: 0.15 },
      error: "Course structure not available. Please refresh the page or contact support."
    };
  };

  const courseData = getCourseData();
  
  // Show error state if no course structure available - BEFORE any hooks
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
  
  // Check if current user is an authorized developer
  const isAuthorizedDeveloper = isUserAuthorizedDeveloper(currentUser, course);
  const [activeTab, setActiveTab] = useState('content');
  
  // Developer mode toggle state - only active if user is authorized
  const [isDeveloperModeActive, setIsDeveloperModeActive] = useState(false);
  
  // Initialize activeItemId from URL or localStorage
  const [activeItemId, setActiveItemId] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const lessonFromUrl = urlParams.get('lesson');
    
    // If URL has lesson, use it
    if (lessonFromUrl) {
      console.log('🔍 Wrapper initializing from URL:', lessonFromUrl);
      return lessonFromUrl;
    }
    
    // Otherwise, try localStorage
    const courseId = course?.CourseID || course?.courseId;
    if (courseId) {
      const storageKey = `lastLesson_${courseId}`;
      const lessonFromStorage = localStorage.getItem(storageKey);
      console.log('🔍 Wrapper initializing from localStorage:', lessonFromStorage);
      return lessonFromStorage || null;
    }
    
    return null;
  });
  const [progress, setProgress] = useState({});
  const [navExpanded, setNavExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [reviewQuestion, setReviewQuestion] = useState(null);
  const [isQuestionReviewModalOpen, setIsQuestionReviewModalOpen] = useState(false);
  const [selectedCourseItem, setSelectedCourseItem] = useState(null);
  const [isItemDetailModalOpen, setIsItemDetailModalOpen] = useState(false);
  const [isContentReady, setIsContentReady] = useState(false);
  const [courseModuleLoaded, setCourseModuleLoaded] = useState(false);
  
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

  const courseTitle = courseData.title;
  const unitsList = courseData.structure || [];
  const courseWeights = courseData.courseWeights || { lesson: 0.15, assignment: 0.35, exam: 0.35, project: 0.15 };

  // Debug logging
  console.log("🔄 FirebaseCourseWrapper rendering with course:", course);
  console.log("👤 Current User in wrapper:", currentUser);
  console.log("!!!!!!!!!!!!!!!!!!Course:",course)
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
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

  // Handle developer mode toggle
  const handleDeveloperModeToggle = useCallback((enabled) => {
    setIsDeveloperModeActive(enabled);
    const courseId = course?.CourseID || course?.courseId;
    if (courseId) {
      localStorage.setItem(`devMode_${courseId}`, enabled.toString());
    }
  }, [course]);

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
      console.log('🔍 Saved to localStorage:', storageKey, '=', itemId);
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

  
  // Flatten all course items for progress tracking (moved after courseData)
  const allCourseItems = useMemo(() => {
    const items = [];
    unitsList.forEach(unit => {
      if (unit.items && Array.isArray(unit.items)) {
        items.push(...unit.items);
      }
    });
    return items;
  }, [unitsList]);
  
  // Validate lesson from URL parameter exists in course structure
  useEffect(() => {
    // Only validate if we have both an activeItemId AND course structure is loaded
    if (activeItemId && allCourseItems.length > 0) {
      console.log('🔍 Wrapper validating lesson:', activeItemId, 'against', allCourseItems.length, 'items');
      
      // Validate that the current activeItemId (from URL) exists in course structure
      const lessonExists = allCourseItems.find(item => item.itemId === activeItemId);
      if (!lessonExists) {
        console.log('❌ Wrapper: Lesson not found in course structure, clearing activeItemId');
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
        console.log('✅ Wrapper: Lesson found in course structure, keeping activeItemId');
        // If lesson exists and came from URL, save it to localStorage for future sessions
        const urlParams = new URLSearchParams(window.location.search);
        const lessonFromUrl = urlParams.get('lesson');
        if (lessonFromUrl === activeItemId) {
          const courseId = course?.CourseID || course?.courseId;
          if (courseId) {
            const storageKey = `lastLesson_${courseId}`;
            localStorage.setItem(storageKey, activeItemId);
            console.log('🔍 URL lesson validated, saved to localStorage:', storageKey, '=', activeItemId);
          }
        }
      }
    } else if (activeItemId && allCourseItems.length === 0) {
      console.log('⏳ Wrapper: Have activeItemId but course structure not loaded yet, waiting...');
    }
  }, [allCourseItems, activeItemId, course]);
  
  // Calculate lesson accessibility for the active lesson info panel
  const lessonAccessibility = useMemo(() => {
    console.log('🔍 Calculating lesson accessibility:', {
      isStaffView,
      devMode,
      isAuthorizedDeveloper,
      isDeveloperModeActive,
      shouldBypassOriginal: shouldBypassAllRestrictions(isStaffView, devMode, currentUser, course),
      hasGradebook: !!course?.Gradebook
    });
    
    // Skip access control for staff/dev or when developer mode is active
    const shouldBypass = shouldBypassAllRestrictions(isStaffView, devMode, currentUser, course) || 
                        (isAuthorizedDeveloper && isDeveloperModeActive);
    
    if (shouldBypass || !course?.Gradebook) {
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
    
    // Use the gradebook directly from course.Gradebook
    const gradebook = course.Gradebook;
    const courseStructure = gradebook.courseStructure || course.courseStructure;
    
    // Only apply sequential access if enabled
    if (!gradebook.courseConfig?.globalSettings?.requireSequentialProgress || 
        !gradebook.courseConfig?.progressionRequirements?.enabled) {
      const accessibility = {};
      allCourseItems.forEach(item => {
        accessibility[item.itemId] = { accessible: true, reason: 'Sequential access disabled' };
      });
      return accessibility;
    }
    
    // Use the lesson access logic with gradebook data
    return getLessonAccessibility(courseStructure, gradebook.items || {}, gradebook);
  }, [allCourseItems, isStaffView, devMode, currentUser, course, isAuthorizedDeveloper, isDeveloperModeActive]);
  
  // Find the current active item for the info panel
  const currentActiveItem = useMemo(() => {
    if (!activeItemId) return null;
    return allCourseItems.find(item => item.itemId === activeItemId);
  }, [activeItemId, allCourseItems]);
  
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
        case 100:
        case '100':
          modulePromise = import('./courses/100');
          break;
        default:
          setCourseModuleLoaded(true); // No module to load
          return;
      }
      
      modulePromise.then(() => {
        console.log('✅ Course module loaded for courseId:', courseId);
        setCourseModuleLoaded(true);
      }).catch(err => {
        console.error('❌ Failed to load course module:', err);
        setCourseModuleLoaded(true); // Set to true anyway to show error state
      });
    }
  }, [course?.CourseID, courseModuleLoaded]);

  // Validate gradebook structure and sync course config when course loads
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
        console.log('🔍 Validating gradebook structure and syncing course config...');
        
        const functions = getFunctions();
        const validateGradebookStructure = httpsCallable(functions, 'validateGradebookStructure');
        
        const result = await validateGradebookStructure({
          courseId: course.CourseID.toString(),
          studentEmail: currentUser.email
        });
        
        if (result.data?.success) {
          const { configSynced, configChanges, wasRebuilt } = result.data;
          
          if (configSynced && configChanges?.length > 0) {
            console.log('✅ Course config changes detected and synced:', configChanges);
            
            // If significant changes were made, we might want to refresh the course data
            // For now, just log the changes - the realtime listener will pick up updates
            if (wasRebuilt) {
              console.log('🔄 Gradebook was rebuilt due to structure changes');
              // Could trigger a course data refresh here if needed
            }
          } else if (configSynced) {
            console.log('✅ Course config validation completed - no changes needed');
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

  // Convert gradebook data to progress format for navigation
  useEffect(() => {
    // This will be handled by the GradebookContext now
    // For navigation, we'll use a simplified approach
    const gradebookProgress = {};
    
    // Check if we have any gradebook data
    if (course?.Gradebook?.items) {
      Object.entries(course.Gradebook.items).forEach(([itemId, item]) => {
        if (item.status === 'completed' || item.score > 0) {
          gradebookProgress[itemId] = {
            completed: true,
            completedAt: item.completedAt || item.lastAttempt || new Date().toISOString(),
            score: item.score,
            maxScore: item.maxScore,
            attempts: item.attempts
          };
        }
      });
    }
    
    setProgress(gradebookProgress);
  }, [course?.Gradebook?.items]);
  
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
          
          {/* Simple Lesson Status Indicator - hidden on small screens */}
          {activeTab === 'content' && currentActiveItem && (
            <div className="hidden md:flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                {(() => {
                  // Calculate lesson status (same logic as LessonInfoPanel)
                  const gradebook = course?.Gradebook;
                  const courseStructureItem = gradebook?.courseStructureItems?.[currentActiveItem.itemId];
                  const gradebookItem = gradebook?.items?.[currentActiveItem.itemId];
                  
                  // Calculate lesson percentage
                  let lessonPercentage = 0;
                  if (courseStructureItem) {
                    lessonPercentage = courseStructureItem.percentage || 0;
                  } else {
                    const gradebookConfig = gradebook?.courseConfig?.gradebook?.itemStructure?.[currentActiveItem.itemId];
                    if (gradebookConfig && gradebookConfig.questions) {
                      let calculatedScore = 0;
                      let calculatedTotal = 0;
                      gradebookConfig.questions.forEach(question => {
                        const assessmentItem = gradebook?.items?.[question.questionId];
                        if (assessmentItem) {
                          calculatedScore += assessmentItem.score || 0;
                          calculatedTotal += assessmentItem.maxScore || question.points || 0;
                        } else {
                          calculatedTotal += question.points || 0;
                        }
                      });
                      lessonPercentage = calculatedTotal > 0 ? Math.round((calculatedScore / calculatedTotal) * 100) : 0;
                    }
                  }
                  
                  const isCompleted = courseStructureItem?.completed || gradebookItem?.status === 'completed' || lessonPercentage >= 100;
                  const accessInfo = lessonAccessibility[currentActiveItem.itemId] || { accessible: true };
                  const isAccessible = accessInfo.accessible;
                  
                  // Status icon and text
                  let statusIcon, statusText, statusColor;
                  if (!isAccessible) {
                    statusIcon = <Lock className="h-4 w-4" />;
                    statusText = 'Locked';
                    statusColor = 'text-gray-500';
                  } else if (isCompleted) {
                    statusIcon = <CheckCircle className="h-4 w-4" />;
                    statusText = 'Completed';
                    statusColor = 'text-green-600';
                  } else if (lessonPercentage > 0) {
                    statusIcon = <PlayCircle className="h-4 w-4" />;
                    statusText = 'In Progress';
                    statusColor = 'text-purple-600';
                  } else {
                    statusIcon = <AlertCircle className="h-4 w-4" />;
                    statusText = 'Not Started';
                    statusColor = 'text-gray-500';
                  }
                  
                  const getGradeColor = (percentage) => {
                    if (percentage >= 90) return 'text-green-600';
                    if (percentage >= 80) return 'text-blue-600';
                    if (percentage >= 70) return 'text-yellow-600';
                    if (percentage >= 60) return 'text-orange-600';
                    return 'text-red-600';
                  };
                  
                  return (
                    <>
                      <div className={`flex items-center gap-1 ${statusColor}`}>
                        {statusIcon}
                        <span className="font-medium">{statusText}</span>
                      </div>
                      {lessonPercentage > 0 && (
                        <span className={`font-semibold ${getGradeColor(lessonPercentage)}`}>
                          {lessonPercentage}%
                        </span>
                      )}
                      {!isAccessible && accessInfo.reason && (
                        <span className="text-xs text-red-600 max-w-xs truncate">
                          {accessInfo.reason}
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
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
              ${navExpanded ? 'w-80' : 'w-12'} 
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

        {/* Main content */}
        <main className="flex-1 p-6">
          {activeTab === 'content' && (
            <div className="bg-white rounded-lg shadow">
              {(isStaffView && devMode) && (
                <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-sm">
                  <span className="font-medium text-yellow-800">Staff Developer Mode:</span>
                  <span className="ml-2 text-yellow-700">
                    You can directly interact with the database in this view for testing questions.
                  </span>
                </div>
              )}
              
              <React.Suspense fallback={<CourseLoadingSkeleton />}>
                {!isContentReady ? (
                  <CourseLoadingSkeleton />
                ) : (() => {
                  // Render course content directly in wrapper instead of going through CourseRouterEnhanced
                  const courseId = course?.CourseID;
                  console.log('🔍 Wrapper directly rendering course content for courseId:', courseId, 'activeItemId:', activeItemId);
                  
                  const courseProps = {
                    course: course,
                    activeItemId: activeItemId, // Course components expect this prop name
                    onItemSelect: handleItemSelect,
                    isStaffView,
                    devMode,
                    gradebookItems: course?.Gradebook?.items || course?.Assessments || {}
                  };
                  
                  // Use pre-loaded components
                  switch(courseId) {
                    case 4:
                    case '4':
                      return <Course4 {...courseProps} />;
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
            <GradebookDashboard course={course} />
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
      
      {/* Course Item Detail Modal */}
      <CourseItemDetailModal
        item={selectedCourseItem}
        isOpen={isItemDetailModalOpen}
        onClose={() => {
          setIsItemDetailModalOpen(false);
          setSelectedCourseItem(null);
        }}
        onReviewQuestion={(question) => {
          setReviewQuestion(question);
          setIsQuestionReviewModalOpen(true);
        }}
      />
      
      {/* Question Review Modal */}
      <QuestionReviewModal
        question={reviewQuestion}
        isOpen={isQuestionReviewModalOpen}
        onClose={() => {
          setIsQuestionReviewModalOpen(false);
          setReviewQuestion(null);
        }}
      />
    </div>
  );
};

// Export the main component directly - no provider wrapper needed
export default FirebaseCourseWrapperContent;