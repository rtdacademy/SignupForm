import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { FaGraduationCap } from 'react-icons/fa';
import { BookOpen, ClipboardCheck, Bug, ArrowUp, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CourseProgressBar from './components/navigation/CourseProgressBar';
import CollapsibleNavigation from './components/navigation/CollapsibleNavigation';
import { GradebookProvider } from './context/GradebookContext';
import { 
  GradebookSummary, 
  AssessmentGrid, 
  CourseItemGrid, 
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
  const [activeTab, setActiveTab] = useState('content');
  const [activeItemId, setActiveItemId] = useState(null);
  const [progress, setProgress] = useState({});
  const [navExpanded, setNavExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [reviewQuestion, setReviewQuestion] = useState(null);
  const [isQuestionReviewModalOpen, setIsQuestionReviewModalOpen] = useState(false);
  const [selectedCourseItem, setSelectedCourseItem] = useState(null);
  const [isItemDetailModalOpen, setIsItemDetailModalOpen] = useState(false);
  
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
  
  // Get course data from the course object, either from database or fallback
  const getCourseData = () => {
    console.log("🔍 FirebaseCourseWrapper - Analyzing course data:", course);
    console.log("🔍 Course structure paths:", {
      "course.courseStructure": course.courseStructure,
      "course.courseStructure?.structure": course.courseStructure?.structure,
      "course.courseStructure?.units": course.courseStructure?.units,
      "course.courseDetails?.courseStructure?.structure": course.courseDetails?.courseStructure?.structure,
      "course.courseDetails?.units": course.courseDetails?.units,
      "course.units": course.units
    });

    // First priority: check direct courseStructure path (JSON file from CourseRouter)
    if (course.courseStructure?.structure) {
      console.log("Using courseStructure.structure from JSON file (via CourseRouter)");
      return {
        title: course.courseStructure.title || '',
        structure: course.courseStructure.structure || [],
        courseWeights: course.weights || { lesson: 0.2, assignment: 0.4, exam: 0.4 }
      };
    }
    // Also check for nested courseStructure.units pattern
    else if (course.courseStructure?.units) {
      console.log("Using courseStructure.units from JSON file (via CourseRouter)");
      return {
        title: course.courseStructure.title || course.Course?.Value || '',
        structure: course.courseStructure.units || [],
        courseWeights: course.weights || { lesson: 0.2, assignment: 0.4, exam: 0.4 }
      };
    }
    // Second priority: check courseDetails.courseStructure.structure (database fallback)
    else if (course.courseDetails?.courseStructure?.structure) {
      console.log("Using courseDetails.courseStructure.structure from database");
      return {
        title: course.courseDetails.courseStructure.title || course.Title || '',
        structure: course.courseDetails.courseStructure.structure,
        courseWeights: course.weights || { lesson: 0.2, assignment: 0.4, exam: 0.4 }
      };
    }
    // Third priority: units array
    else if (course.units) {
      console.log("Using units array directly");
      return {
        title: course.Title || '',
        structure: [{
          name: "Course Content",
          section: "1",
          unitId: "main_unit",
          items: course.units.flatMap(unit => unit.items || [])
        }],
        courseWeights: course.weights || { lesson: 0.2, assignment: 0.4, exam: 0.4 }
      };
    }

    // Fallback: use other course data
    console.log("⚠️ WARNING: Using fallback - no JSON structure found!");
    return {
      title: course.Course?.Value || course.courseDetails?.Title || '',
      structure: course.courseDetails?.units || [],
      courseWeights: course.weights || { lesson: 0.2, assignment: 0.4, exam: 0.4 }
    };
  };

  const courseData = getCourseData();
  const courseTitle = courseData.title;
  const unitsList = courseData.structure || [];
  const courseWeights = courseData.courseWeights || { lesson: 0.2, assignment: 0.4, exam: 0.4 };
  
  // Flatten all course items for progress tracking
  const allCourseItems = useMemo(() => {
    const items = [];
    unitsList.forEach(unit => {
      if (unit.items && Array.isArray(unit.items)) {
        items.push(...unit.items);
      }
    });
    return items;
  }, [unitsList]);

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
        <div className="px-4 py-2 flex items-center gap-4">
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
                activeTab === 'progress' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('progress')}
            >
              <ClipboardCheck className="h-4 w-4" />
              <span>Progress</span>
            </button>
            
            <button
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 text-sm ${
                activeTab === 'grades' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('grades')}
            >
              <FaGraduationCap className="h-4 w-4" />
              <span>Grades</span>
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
              gradebookItems={course?.Gradebook?.items || {}}
            />
          </div>
        )}
        
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
            gradebookItems={course?.Gradebook?.items || {}}
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
                      course,
                      courseId: course?.CourseID || '1',
                      isStaffView,
                      devMode
                    })
                  : child
              )}
            </div>
          )}
          
          {activeTab === 'progress' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-xl font-bold mb-4">Your Progress</h1>
              
              <div className="mb-8">
                <CourseProgressBar 
                  progress={progress} 
                  courseItems={allCourseItems} 
                  className="mb-6" 
                />
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h2 className="text-lg font-medium text-blue-800 mb-2">Progress by Unit</h2>
                  <div className="space-y-4">
                    {unitsList.map((unit, unitIndex) => {
                      // Calculate unit progress
                      const unitItems = unit.items || [];
                      const unitCompletedCount = unitItems.filter(item => progress[item.itemId]?.completed).length;
                      const unitPercentage = unitItems.length > 0 
                        ? Math.round((unitCompletedCount / unitItems.length) * 100) 
                        : 0;
                        
                      return (
                        <div key={unit.unitId || unitIndex}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-blue-700">
                              {unit.name || `Unit ${unitIndex + 1}`}
                            </span>
                            <span className="text-sm text-blue-600">{unitPercentage}%</span>
                          </div>
                          <div className="h-2 w-full bg-blue-100 rounded-full">
                            <div 
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${unitPercentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-medium mb-4">Activity History</h2>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Completed
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allCourseItems.map((item) => {
                        const itemProgress = progress[item.itemId] || {};
                        return (
                          <tr key={item.itemId}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {itemProgress.completed ? (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Completed
                                </span>
                              ) : (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                  Not Started
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {itemProgress.completedAt 
                                ? new Date(itemProgress.completedAt).toLocaleDateString() 
                                : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'grades' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Gradebook</h1>
                
                
                {/* Gradebook Summary */}
                <div className="mb-8">
                  <GradebookSummary />
                </div>
                
                {/* Course Items Grid */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Course Items</h2>
                  <CourseItemGrid 
                    courseStructure={course}
                    onViewItemDetails={(item) => {
                      setSelectedCourseItem(item);
                      setIsItemDetailModalOpen(true);
                    }}
                  />
                </div>
              </div>
            </div>
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
                <h2 className="text-lg font-semibold mb-2">Raw Course Object</h2>
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
                        <li>• course.courseStructure: {course.courseStructure ? '✓' : '✗'}</li>
                        <li>• course.courseStructure?.structure: {course.courseStructure?.structure ? '✓' : '✗'}</li>
                        <li>• course.courseStructure?.units: {course.courseStructure?.units ? '✓' : '✗'}</li>
                        <li>• course.courseDetails: {course.courseDetails ? '✓' : '✗'}</li>
                        <li>• course.units: {course.units ? '✓' : '✗'}</li>
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

// Wrapper component that provides GradebookContext
const FirebaseCourseWrapper = (props) => {
  return (
    <GradebookProvider course={props.course}>
      <FirebaseCourseWrapperContent {...props} />
    </GradebookProvider>
  );
};

export default FirebaseCourseWrapper;