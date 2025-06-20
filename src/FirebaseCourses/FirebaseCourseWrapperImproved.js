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
  
  // Check if current user is an authorized developer
  const isAuthorizedDeveloper = isUserAuthorizedDeveloper(currentUser, course);
  const [activeTab, setActiveTab] = useState('content');
  const [activeItemId, setActiveItemId] = useState(null);
  const [progress, setProgress] = useState({});
  const [navExpanded, setNavExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [reviewQuestion, setReviewQuestion] = useState(null);
  const [isQuestionReviewModalOpen, setIsQuestionReviewModalOpen] = useState(false);
  const [selectedCourseItem, setSelectedCourseItem] = useState(null);
  const [isItemDetailModalOpen, setIsItemDetailModalOpen] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  
  // Ref for navigation container to detect outside clicks
  const navigationRef = useRef(null);
  
  // Flag to temporarily disable scroll-based auto-collapse
  const [disableScrollCollapse, setDisableScrollCollapse] = useState(false);
  
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

  // Debug logging
  console.log("🔄 FirebaseCourseWrapper rendering with course:", course);
  console.log("👤 Current User in wrapper:", currentUser);
  console.log("!!!!!!!!!!!!!!!!!!Course:",course)
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
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
  
  // Handle scroll-based navigation auto-collapse (desktop only)
  useEffect(() => {
    const handleScroll = () => {
      // Only handle on desktop when navigation is expanded and auto-collapse is not disabled
      if (!isMobile && navExpanded && navigationRef.current && !disableScrollCollapse) {
        const navigationRect = navigationRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const headerHeight = 60; // Sticky header height
        
        // Calculate how much of the navigation is still visible
        const visibleNavHeight = Math.max(0, navigationRect.bottom - headerHeight);
        const navigationFullHeight = navigationRect.height;
        
        // If less than 50% of the navigation is visible, collapse it
        const visibilityThreshold = 0.4; // 60% visibility threshold
        const visibilityRatio = visibleNavHeight / navigationFullHeight;
        
        if (visibilityRatio < visibilityThreshold) {
          setNavExpanded(false);
        }
      }
    };

    // Add scroll listener with throttling for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Add scroll listener
    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [isMobile, navExpanded, disableScrollCollapse]);
  
  // Sync with external state if provided
  useEffect(() => {
    if (externalActiveItemId && externalActiveItemId !== activeItemId) {
      setActiveItemId(externalActiveItemId);
    }
  }, [externalActiveItemId, activeItemId]);

  // Handle internal item selection and propagate to parent if needed
  const handleItemSelect = useCallback((itemId) => {
    setActiveItemId(itemId);
    
    // Scroll to top when selecting a new item
    window.scrollTo(0, 0);

    if (externalItemSelect) {
      externalItemSelect(itemId);
    }
  }, [externalItemSelect]);

  // Handle scroll to top and expand navigation
  const handleScrollToTopAndExpand = useCallback(() => {
    // Temporarily disable scroll-based auto-collapse
    setDisableScrollCollapse(true);
    
    // Expand navigation first
    setNavExpanded(true);
    
    // Scroll to top smoothly
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Re-enable scroll-based auto-collapse after scroll completes
    setTimeout(() => {
      setDisableScrollCollapse(false);
    }, 1000); // Give enough time for smooth scroll to complete
  }, []);

  // Handle gradebook recalculation
  const handleRecalculateGradebook = useCallback(async () => {
    try {
      // Check if user is authenticated
      if (!currentUser || !currentUser.email) {
        console.error('User not authenticated');
        return;
      }
      
      setIsRecalculating(true);
      console.log('🔄 Recalculating gradebook for user:', currentUser.email);
      
      const functions = getFunctions();
      const recalculateMyGradebook = httpsCallable(functions, 'recalculateMyGradebook');
      
      const result = await recalculateMyGradebook({
        courseId: course?.CourseID?.toString() || course?.courseId?.toString(),
        studentEmail: currentUser.email
      });
      
      console.log('✅ Gradebook recalculated:', result);
      
      // Force page refresh to reload course data with updated gradebook structure
      window.location.reload();
    } catch (error) {
      console.error('❌ Error recalculating gradebook:', error);
      setIsRecalculating(false);
      alert('Error recalculating gradebook: ' + error.message);
    }
  }, [currentUser, course]);
  
  // Get course data from the course object - now prioritizes database structure
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
  const courseTitle = courseData.title;
  const unitsList = courseData.structure || [];
  const courseWeights = courseData.courseWeights || { lesson: 0.15, assignment: 0.35, exam: 0.35, project: 0.15 };
  
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
  
  // Calculate lesson accessibility for the active lesson info panel
  const lessonAccessibility = useMemo(() => {
    // Skip access control for staff/dev/authorized developers or if no course structure
    if (shouldBypassAllRestrictions(isStaffView, devMode, currentUser, course) || !course?.Gradebook) {
      const accessibility = {};
      const bypassReason = getBypassReason(isStaffView, devMode, currentUser, course);
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
  }, [allCourseItems, isStaffView, devMode, currentUser, course]);
  
  // Find the current active item for the info panel
  const currentActiveItem = useMemo(() => {
    if (!activeItemId) return null;
    return allCourseItems.find(item => item.itemId === activeItemId);
  }, [activeItemId, allCourseItems]);
  
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
            
            {/* Debug tab - only show for authorized users */}
            {isDebugAuthorized && (
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
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-6">
          {activeTab === 'content' && (
            <div className="bg-white rounded-lg shadow">
              {isStaffView && devMode && (
                <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-sm">
                  <span className="font-medium text-yellow-800">Developer Mode:</span>
                  <span className="ml-2 text-yellow-700">
                    You can directly interact with the database in this view for testing questions.
                  </span>
                </div>
              )}
              
              
              {React.Children.map(children, child =>
                React.isValidElement(child)
                  ? React.cloneElement(child, {
                      course: course,
                      courseId: course?.CourseID || '1',
                      isStaffView,
                      devMode
                    })
                  : child
              )}
            </div>
          )}
          
          {(activeTab === 'progress' || activeTab === 'grades') && (
            <GradebookDashboard course={course} />
          )}
          
          {/* Debug tab - only accessible by authorized users */}
          {activeTab === 'debug' && isDebugAuthorized && (
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
                  <h3 className="font-medium text-yellow-800 mb-3">Development Tools</h3>
                  <button
                    onClick={handleRecalculateGradebook}
                    disabled={isRecalculating}
                    className={`flex items-center gap-2 px-4 py-2 text-white rounded transition-colors ${
                      isRecalculating 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-yellow-600 hover:bg-yellow-700'
                    }`}
                  >
                    {isRecalculating ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        Recalculating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Recalculate Gradebook with New Weights
                      </>
                    )}
                  </button>
                  {isRecalculating && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                      <div className="flex items-center gap-2 text-blue-700">
                        <Loader className="h-4 w-4 animate-spin" />
                        <span className="font-medium">Processing gradebook recalculation...</span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        This may take up to 10 seconds. The page will refresh automatically when complete.
                      </p>
                    </div>
                  )}
                  {!isRecalculating && (
                    <p className="text-xs text-yellow-700 mt-2">
                      Click to update gradebook with course config weights (lessons: 100%, others: 0%). 
                      This will force a complete recalculation of all gradebook data.
                    </p>
                  )}
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