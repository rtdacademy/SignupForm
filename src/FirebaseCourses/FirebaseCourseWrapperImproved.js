import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { FaGraduationCap } from 'react-icons/fa';
import { BookOpen, ClipboardCheck, Bug, ArrowUp, Menu, RefreshCw, Loader, CheckCircle, Lock, PlayCircle, AlertCircle, FileText, Folder, Bot, MessageCircle, X, Minimize2, RotateCcw } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../context/AuthContext';
import { isUserAuthorizedDeveloper, shouldBypassAllRestrictions, getBypassReason } from './utils/authUtils';
import { getLessonAccessibility } from './utils/lessonAccess';
import { loadLessonPrompt, enhancePromptWithContext } from './utils/aiPromptLoader';
import { 
  validateGradeDataStructures, 
  calculateLessonScore, 
  calculateCategoryScores 
} from './utils/gradeCalculations';
import { useDraggableResizable } from './hooks/useDraggableResizable';
//import LessonInfoPanel from './components/navigation/LessonInfoPanel';
import CollapsibleNavigation from './components/navigation/CollapsibleNavigation';
import CourseOutline from './components/CourseOutline';
import CourseResources from './components/CourseResources';
// Import the comprehensive GradebookDashboard component
import { 
  GradebookDashboard
} from './components/gradebook';
import { Skeleton } from '../components/ui/skeleton';
import GoogleAIChatApp from '../edbotz/GoogleAIChat/GoogleAIChatApp';
import { AIAccordion } from '../components/ui/AIAccordion';

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
  devMode = false,
  profile
}) => {
  const { currentUser } = useAuth();
  
  // Debug: Log course prop value
  console.log('🔍 Course prop value:', course);
  console.log('🔍 Profile prop value:', profile);
  
  // Get course data first to check for errors
  const getCourseData = () => {

    // First priority: check gradebook courseConfig courseStructure (database-driven from backend config)
    if (course.Gradebook?.courseConfig?.courseStructure) {
      return {
        title: course.Gradebook.courseConfig.courseStructure.title || course.Course?.Value || '',
        structure: course.Gradebook.courseConfig.courseStructure.units || [],
        courseWeights: course.Gradebook.courseConfig.weights || course.weights || { lesson: 0.15, assignment: 0.35, exam: 0.35, project: 0.15 }
      };
    }
    
    // Second priority: check gradebook courseStructure (legacy database path)
    else if (course.Gradebook?.courseStructure) {
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
      console.log('🔧 Using cached developer authorization to prevent flickering');
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
      console.log('🔍 Wrapper initializing from localStorage:', lessonFromStorage);
      return lessonFromStorage || null;
    }
    
    return null;
  });
  const [progress, setProgress] = useState({});
  const [navExpanded, setNavExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [reviewQuestion, setReviewQuestion] = useState(null);
  //const [isQuestionReviewModalOpen, setIsQuestionReviewModalOpen] = useState(false);
  const [selectedCourseItem, setSelectedCourseItem] = useState(null);
  const [isItemDetailModalOpen, setIsItemDetailModalOpen] = useState(false);
  const [isContentReady, setIsContentReady] = useState(false);
  const [courseModuleLoaded, setCourseModuleLoaded] = useState(false);
  const [isCourseOutlineOpen, setIsCourseOutlineOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [currentAIPrompt, setCurrentAIPrompt] = useState(null);
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);
  const [chatAnimationState, setChatAnimationState] = useState('closed'); // 'closed', 'opening', 'open', 'closing'
  
  // Simplified AI state - just prepopulated message for chat input
  const [prepopulatedMessage, setPrepopulatedMessage] = useState('');
  
  // State for content context from AI accordion
  const [contentContextData, setContentContextData] = useState(null);
  
  // Draggable and resizable functionality for AI chat
  const {
    position: chatPosition,
    size: chatSize,
    isDragging,
    isResizing,
    handleDragStart,
    handleResizeStart,
    resetToDefault: resetChatPosition
  } = useDraggableResizable({
    defaultPosition: { x: window.innerWidth - 644, y: 24 }, // 620px width + 24px margin
    defaultSize: { width: 620, height: 600 }, // More reasonable initial height
    minSize: { width: 320, height: 400 },
    maxSize: { width: 1000, height: Math.min(900, window.innerHeight - 48) },
    storageKey: `ai-chat-state-course-${course?.CourseID}`,
    disabled: isMobile
  });
  
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
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
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

  // Handle developer mode toggle
  const handleDeveloperModeToggle = useCallback((enabled) => {
    setIsDeveloperModeActive(enabled);
    const courseId = course?.CourseID || course?.courseId;
    if (courseId) {
      localStorage.setItem(`devMode_${courseId}`, enabled.toString());
    }
  }, [course]);

  // Handle AI chat toggle with animations
  const handleChatToggle = useCallback(() => {
    if (chatAnimationState === 'closed') {
      // Opening animation
      setChatAnimationState('opening');
      setIsChatOpen(true);
      setIsChatMinimized(false);
      // After a brief delay, set to fully open
      setTimeout(() => setChatAnimationState('open'), 300);
    } else if (chatAnimationState === 'open') {
      // Closing animation
      setChatAnimationState('closing');
      // Clear content context when closing
      setContentContextData(null);
      // After animation completes, fully close
      setTimeout(() => {
        setIsChatOpen(false);
        setIsChatMinimized(false);
        setChatAnimationState('closed');
      }, 300);
    }
  }, [chatAnimationState]);

  // Handle chat minimize/restore
  const handleChatMinimize = useCallback(() => {
    setIsChatMinimized(!isChatMinimized);
    // When restoring from minimized state, reset to default size if needed
    if (isChatMinimized) {
      // Chat is currently minimized and being restored
      // The useDraggableResizable hook will handle the size restoration
    }
  }, [isChatMinimized]);

  // State for forcing new chat sessions
  const [forceNewChatSession, setForceNewChatSession] = useState(false);
  
  // Handle dynamic AI context updates from child components
  // COMMENTED OUT: Complex conversation history management - using simple approach instead
  /*
  const handleUpdateAIContext = useCallback((newContext) => {
    // Instead of modifying system instructions, we'll update the conversation history
    if (newContext.type === 'askAboutExample' && newContext.exampleNumber) {
      // Generate conversation history for specific example
      const exampleConversation = currentAIPrompt?.generateExampleConversation?.(
        newContext.exampleNumber, 
        newContext.userQuestion
      );
      
      if (exampleConversation) {
        // Update the current prompt with new conversation history and force new session
        setCurrentAIPrompt(prev => ({
          ...prev,
          conversationHistory: exampleConversation
        }));
        
        // Force a new chat session to clear existing messages
        setForceNewChatSession(true);
        
        // Reset the force flag after a brief delay
        setTimeout(() => setForceNewChatSession(false), 100);
      }
    } else {
      // For other types of dynamic context, store for processing
      setDynamicAIContext(newContext);
    }
    
    // If chat is closed, open it
    if (chatAnimationState === 'closed') {
      handleChatToggle();
    }
  }, [chatAnimationState, handleChatToggle, currentAIPrompt]);
  */

  // Handle message prepopulation from child components
  const handlePrepopulateMessage = useCallback((message) => {
    setPrepopulatedMessage(message);
    
    // If chat is closed, open it; if minimized, restore it
    if (chatAnimationState === 'closed') {
      handleChatToggle();
    } else if (isChatMinimized) {
      setIsChatMinimized(false);
    }
    
    // Clear prepopulated message after a delay to allow chat to use it
    setTimeout(() => {
      setPrepopulatedMessage('');
    }, 500);
  }, [chatAnimationState, handleChatToggle, isChatMinimized]);

  // Handle AI accordion content selection
  const handleAIAccordionContent = useCallback((extractedContent) => {
    // Set the content context data for the AI chat
    setContentContextData(extractedContent);
    
    // If chat is closed, open it; if minimized, restore it
    if (chatAnimationState === 'closed') {
      handleChatToggle();
    } else if (isChatMinimized) {
      setIsChatMinimized(false);
    }
  }, [chatAnimationState, handleChatToggle, isChatMinimized]);

  // Helper function to create "Ask AI about this question/example" buttons
  // Simplified version that just populates the chat input with question text
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
  
  // Calculate lesson accessibility for the active lesson info panel
  const lessonAccessibility = useMemo(() => {
    
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
        !course.courseDetails?.progressionRequirements?.enabled) {
      const accessibility = {};
      allCourseItems.forEach(item => {
        accessibility[item.itemId] = { accessible: true, reason: 'Sequential access disabled' };
      });
      return accessibility;
    }
    
    // Use the lesson access logic with gradebook data and actual grades
    const gradebookWithGrades = {
      ...gradebook,
      grades: {
        assessments: course?.Grades?.assessments || {}
      }
    };
    
    // Pass developer bypass information to handle inDevelopment restrictions
    const isDeveloperBypass = shouldBypass;
    
    return getLessonAccessibility(courseStructure, gradebook.items || {}, gradebookWithGrades, {
      isDeveloperBypass
    });
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
        setCourseModuleLoaded(true);
      }).catch(err => {
        console.error('❌ Failed to load course module:', err);
        setCourseModuleLoaded(true); // Set to true anyway to show error state
      });
    }
  }, [course?.CourseID, courseModuleLoaded]);

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
  */

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

  // GRADE CALCULATION UTILITY FUNCTIONS - Now imported from utils

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

  // Convert gradebook data to progress format for navigation - Using new grade calculation functions
  useEffect(() => {
    const gradebookProgress = {};
    
    // Validate that we have the required data structures
    const validation = validateGradeDataStructures(course);
    if (!validation.valid) {
      console.warn('Cannot calculate progress - missing required data:', validation.missing);
      setProgress({});
      return;
    }
    
    const itemStructure = course.Gradebook.courseConfig.gradebook.itemStructure;
    const progressionRequirements = course.courseDetails?.progressionRequirements || {};
    
    // Process each lesson from itemStructure using new calculation functions
    Object.entries(itemStructure).forEach(([lessonKey, lessonConfig]) => {
      if (!lessonConfig || lessonConfig.type !== 'lesson') return;
      
      // Use new grade calculation function for accurate scores with session support
      const studentEmail = profile?.StudentEmail || currentUser?.email;
      const lessonScore = calculateLessonScore(lessonKey, course, studentEmail);
      
      if (!lessonScore.valid) {
        return; // Skip if calculation failed
      }
      
      // Determine if lesson meets completion requirements
      const requirements = progressionRequirements.lessonOverrides?.[lessonKey] || progressionRequirements.defaultCriteria || {};
      const minimumPercentage = requirements.minimumPercentage || 50;
      const requireAllQuestions = requirements.requireAllQuestions !== false;
      
      const completionRate = lessonScore.totalQuestions > 0 ? (lessonScore.attempted / lessonScore.totalQuestions) * 100 : 0;
      const averageScore = lessonScore.percentage;
      
      let isCompleted = false;
      if (requireAllQuestions) {
        // Must attempt all questions AND meet minimum score
        isCompleted = completionRate >= 100 && averageScore >= minimumPercentage;
      } else {
        // Only need to meet minimum score (allows partial completion)
        isCompleted = averageScore >= minimumPercentage;
      }
      
      if (isCompleted) {
        gradebookProgress[lessonKey] = {
          completed: true,
          completedAt: new Date().toISOString(),
          score: lessonScore.score,
          maxScore: lessonScore.total,
          attempts: lessonScore.attempted,
          percentage: lessonScore.percentage
        };
      }
    });
    
    setProgress(gradebookProgress);
  }, [course?.Gradebook?.courseConfig, course?.Grades?.assessments, course?.ExamSessions, course?.Assessments, profile?.StudentEmail, currentUser?.email]);

 
  
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
          
              
              {/* Lesson Progress Bars - Hidden for AssessmentSession lessons and labs */}
              {currentActiveItem && (() => {
                // Hide progress bars for assignments, exams, quizzes, and labs
                if (currentActiveItem.type === 'assignment' || 
                    currentActiveItem.type === 'exam' || 
                    currentActiveItem.type === 'quiz' ||
                    currentActiveItem.type === 'lab') {
                  return null;
                }
                
                // Use new grade calculation function for accurate data with session support
                const studentEmail = profile?.StudentEmail || currentUser?.email;
                const lessonScore = calculateLessonScore(currentActiveItem.itemId, course, studentEmail);
                
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
                    onAIAccordionContent: handleAIAccordionContent
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
            <GradebookDashboard course={course} allCourseItems={allCourseItems} profile={profile} lessonAccessibility={lessonAccessibility} />
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
      
      {/* Floating AI Assistant Button - Show when chat is closed or when minimized */}
      {(chatAnimationState === 'closed' || isChatMinimized) && (
        <button
          onClick={isChatMinimized ? handleChatMinimize : handleChatToggle}
          disabled={chatAnimationState === 'opening' || chatAnimationState === 'closing'}
          className={`fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full w-16 h-16 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group ${
            chatAnimationState === 'opening'
              ? 'scale-0 opacity-0' 
              : 'scale-100 opacity-100 hover:scale-110'
          }`}
          style={{ 
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
            transformOrigin: 'center'
          }}
          aria-label={isChatMinimized ? "Restore AI Assistant" : "Open AI Assistant"}
        >
          {isChatMinimized ? (
            <>
              <MessageCircle className="w-7 h-7 transition-transform group-hover:scale-110" />
              {/* Active conversation indicator - small dot */}
              <div className="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </>
          ) : (
            <>
              <Bot className="w-7 h-7 transition-transform group-hover:scale-110" />
              {/* Pulse animation ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 animate-ping opacity-20"></div>
            </>
          )}
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {isChatMinimized ? 'Resume conversation' : 'AI Physics Assistant'}
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </button>
      )}

      {/* AI Chat Assistant - Draggable & Resizable Panel */}
      {(isChatOpen || chatAnimationState !== 'closed') && !isChatMinimized && (
        <div 
          className={`fixed z-50 bg-white shadow-2xl border border-gray-200 flex flex-col overflow-hidden transition-all duration-300 ${
            isMobile 
              ? 'inset-0 rounded-none' // Full screen on mobile
              : 'rounded-2xl'
          } ${isDragging ? 'cursor-grabbing' : ''} ${isResizing ? 'select-none' : ''}`}
          style={isMobile ? {} : {
            left: chatPosition.x,
            top: chatPosition.y,
            width: chatSize.width,
            height: chatSize.height,
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            transformOrigin: 'bottom right',
            transform: chatAnimationState === 'open' 
              ? 'scale(1)' 
              : chatAnimationState === 'opening'
              ? 'scale(0.95)'
              : 'scale(0.9)',
            opacity: chatAnimationState === 'open' ? 1 : 
                    chatAnimationState === 'opening' ? 0.9 : 0.7
          }}
        >
          {/* Resize Handles - Only on desktop */}
          {!isMobile && (
            <>
              {/* Corner handles - More visible */}
              <div 
                className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-10 bg-gradient-to-br from-purple-400/30 to-transparent rounded-br-md opacity-60 hover:opacity-100 transition-opacity"
                onMouseDown={(e) => handleResizeStart(e, 'nw')}
                onTouchStart={(e) => handleResizeStart(e, 'nw')}
              />
              <div 
                className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-10 bg-gradient-to-bl from-purple-400/30 to-transparent rounded-bl-md opacity-60 hover:opacity-100 transition-opacity"
                onMouseDown={(e) => handleResizeStart(e, 'ne')}
                onTouchStart={(e) => handleResizeStart(e, 'ne')}
              />
              <div 
                className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-10 bg-gradient-to-tr from-purple-400/30 to-transparent rounded-tr-md opacity-60 hover:opacity-100 transition-opacity"
                onMouseDown={(e) => handleResizeStart(e, 'sw')}
                onTouchStart={(e) => handleResizeStart(e, 'sw')}
              />
              <div 
                className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-10 bg-gradient-to-tl from-purple-400/40 to-transparent rounded-tl-md opacity-70 hover:opacity-100 transition-opacity group"
                onMouseDown={(e) => handleResizeStart(e, 'se')}
                onTouchStart={(e) => handleResizeStart(e, 'se')}
              >
                {/* Visual resize indicator on bottom-right corner */}
                <div className="absolute bottom-0.5 right-0.5 w-2 h-2">
                  <div className="absolute bottom-0 right-0 w-1 h-1 bg-purple-500/60 rounded-full"></div>
                  <div className="absolute bottom-0.5 right-1 w-0.5 h-0.5 bg-purple-500/40 rounded-full"></div>
                  <div className="absolute bottom-1 right-0.5 w-0.5 h-0.5 bg-purple-500/40 rounded-full"></div>
                </div>
              </div>
              
              {/* Edge handles - Subtle resize bars that appear on hover */}
              {/* Top edge - vertical resize (full width, avoiding corners) */}
              <div 
                className="absolute top-0 left-4 right-4 h-2 cursor-n-resize hover:bg-purple-400/25 transition-all duration-300 opacity-0 hover:opacity-100 z-20 group"
                onMouseDown={(e) => handleResizeStart(e, 'n')}
                onTouchStart={(e) => handleResizeStart(e, 'n')}
              >
                {/* Visual indicator - only visible on hover */}
                <div className="absolute top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-purple-500/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              {/* Bottom edge - vertical resize (full width, avoiding corners) */}
              <div 
                className="absolute bottom-0 left-4 right-4 h-2 cursor-s-resize hover:bg-purple-400/25 transition-all duration-300 opacity-0 hover:opacity-100 z-20 group"
                onMouseDown={(e) => handleResizeStart(e, 's')}
                onTouchStart={(e) => handleResizeStart(e, 's')}
              >
                {/* Visual indicator - only visible on hover */}
                <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-purple-500/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              {/* Left edge - horizontal resize (full height, avoiding corners) */}
              <div 
                className="absolute left-0 top-4 bottom-4 w-2 cursor-w-resize hover:bg-purple-400/25 transition-all duration-300 opacity-0 hover:opacity-100 z-20 group"
                onMouseDown={(e) => handleResizeStart(e, 'w')}
                onTouchStart={(e) => handleResizeStart(e, 'w')}
              >
                {/* Visual indicator - only visible on hover */}
                <div className="absolute left-0.5 top-1/2 transform -translate-y-1/2 w-0.5 h-8 bg-purple-500/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              {/* Right edge - horizontal resize (full height, avoiding corners) */}
              <div 
                className="absolute right-0 top-4 bottom-4 w-2 cursor-e-resize hover:bg-purple-400/25 transition-all duration-300 opacity-0 hover:opacity-100 z-20 group"
                onMouseDown={(e) => handleResizeStart(e, 'e')}
                onTouchStart={(e) => handleResizeStart(e, 'e')}
              >
                {/* Visual indicator - only visible on hover */}
                <div className="absolute right-0.5 top-1/2 transform -translate-y-1/2 w-0.5 h-8 bg-purple-500/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </>
          )}

              {/* Chat Header - Draggable */}
              <div 
                className={`bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3 flex items-center justify-between ${
                  !isMobile ? 'cursor-grab active:cursor-grabbing' : ''
                }`}
                onMouseDown={!isMobile ? handleDragStart : undefined}
                onTouchStart={!isMobile ? handleDragStart : undefined}
              >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Bot className="w-6 h-6 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">AI Physics Assistant</span>
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
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Minimize button */}
              <button
                onClick={handleChatMinimize}
                className="hover:bg-white/20 rounded-full p-1.5 transition-colors"
                title="Minimize chat"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleChatToggle}
                className="hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Chat Component */}
          <div className={`flex-1 overflow-hidden transition-all duration-300 ${
            isChatMinimized ? 'h-0 opacity-0' : 'opacity-100'
          }`} style={{ margin: '0 3px 3px 3px' }}>
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
        </div>
      )}
    </div>
  );
};

// Export the main component directly - no provider wrapper needed
export default FirebaseCourseWrapperContent;