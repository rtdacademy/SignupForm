import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getDatabase, ref, get } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { FaWrench, FaGraduationCap, FaCode } from 'react-icons/fa';
import { BookOpen, ClipboardCheck } from 'lucide-react';
import CourseProgressBar from './components/navigation/CourseProgressBar';
import CollapsibleNavigation from './components/navigation/CollapsibleNavigation';
import ModernSectionEditor from './components/codeEditor/ModernSectionEditor';
import CourseRouterEnhanced from './CourseRouterEnhanced';

/**
 * Refactored Staff Course Wrapper
 * 
 * This version eliminates duplication by using CourseRouterEnhanced for all course rendering.
 * It maintains staff-specific features while delegating course content rendering to the router.
 */
const StaffCourseWrapperRefactored = () => {
  const { courseId } = useParams();
  const { currentUser } = useAuth();
  
  // Course data state
  const [course, setCourse] = useState(null);
  const [courseLoading, setCourseLoading] = useState(true);
  
  // Staff-specific state
  const [devMode, setDevMode] = useState(false);
  
  // Code editor state
  const [currentLessonInfo, setCurrentLessonInfo] = useState(null);
  const [codeEditorOpen, setCodeEditorOpen] = useState(false);
  
  // UI state
  const [activeTab, setActiveTab] = useState('content');
  const [activeItemId, setActiveItemId] = useState(null);
  const [progress, setProgress] = useState({});
  const [navExpanded, setNavExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Load course data
  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) return;
      
      try {
        const db = getDatabase();
        const courseRef = ref(db, `courses/${courseId}`);
        const snapshot = await get(courseRef);
        
        if (snapshot.exists()) {
          setCourse({
            CourseID: courseId,
            ...snapshot.val()
          });
        }
        
        setCourseLoading(false);
      } catch (error) {
        console.error('Error loading course:', error);
        setCourseLoading(false);
      }
    };
    
    loadCourse();
  }, [courseId]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    if (window.innerWidth < 768) {
      setNavExpanded(false);
    }
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Course structure now comes from database (staff testing data)
  // Load staff gradebook data to get course structure
  const enhancedCourse = useMemo(() => {
    if (!course) return null;

    // For staff, structure will be loaded from staff_testing gradebook data
    // CourseRouterEnhanced will handle loading structure from database
    return course;
  }, [course]);

  // Get course data (memoized to prevent unnecessary re-calculations)
  const courseData = useMemo(() => {
    if (!enhancedCourse) return { title: '', structure: [], courseWeights: {} };

    // Use the same logic as before for consistency
    if (enhancedCourse.courseStructure?.structure) {
      return {
        title: enhancedCourse.courseStructure.title || '',
        structure: enhancedCourse.courseStructure.structure || [],
        courseWeights: enhancedCourse.weights || { lesson: 0.2, assignment: 0.4, exam: 0.4 }
      };
    }
    else if (enhancedCourse.courseStructure?.units) {
      return {
        title: enhancedCourse.courseStructure.title || enhancedCourse.Course?.Value || '',
        structure: enhancedCourse.courseStructure.units || [],
        courseWeights: enhancedCourse.weights || { lesson: 0.2, assignment: 0.4, exam: 0.4 }
      };
    }

    return {
      title: enhancedCourse.Course?.Value || enhancedCourse.courseDetails?.Title || '',
      structure: enhancedCourse.courseDetails?.units || [],
      courseWeights: enhancedCourse.weights || { lesson: 0.2, assignment: 0.4, exam: 0.4 }
    };
  }, [enhancedCourse]);

  const courseTitle = courseData.title;
  const unitsList = courseData.structure || [];
  const courseWeights = courseData.courseWeights || { lesson: 0.2, assignment: 0.4, exam: 0.4 };

  // Handle internal item selection
  const handleItemSelect = useCallback((itemId) => {
    setActiveItemId(itemId);
    
    // Find the lesson info for the code editor
    let foundLesson = null;
    const currentUnits = courseData.structure || [];
    for (const unit of currentUnits) {
      if (unit.items) {
        foundLesson = unit.items.find(item => item.itemId === itemId);
        if (foundLesson) break;
      }
    }
    setCurrentLessonInfo(foundLesson);
    
    window.scrollTo(0, 0);
    
    if (isMobile) {
      setNavExpanded(false);
    }
  }, [isMobile, courseData.structure]);

  // Flatten all course items for progress tracking
  const allCourseItems = useMemo(() => {
    if (!unitsList || !Array.isArray(unitsList) || unitsList.length === 0) return [];
    
    return unitsList.reduce((items, unit) => {
      if (unit?.items && Array.isArray(unit.items)) {
        items.push(...unit.items);
      }
      return items;
    }, []);
  }, [unitsList]);

  // Simulate progress data
  const progressInitialized = useRef(false);
  useEffect(() => {
    if (!progressInitialized.current && unitsList.length > 0) {
      const mockProgress = {};
      unitsList.forEach((unit) => {
        if (unit.items) {
          unit.items.forEach((item, idx) => {
            if (idx === 0) {
              mockProgress[item.itemId] = { completed: true, completedAt: new Date().toISOString() };
            }
          });
        }
      });
      setProgress(mockProgress);
      progressInitialized.current = true;
    }
  }, [unitsList.length]);

  // Reset progress initialization flag when course changes
  useEffect(() => {
    progressInitialized.current = false;
  }, [courseId]);

  // Get current unit index
  const currentUnitIndex = useMemo(() => {
    if (!activeItemId) {
      return 0;
    }
    
    return unitsList.findIndex(unit => 
      unit.items && unit.items.some(item => item.itemId === activeItemId)
    );
  }, [unitsList, activeItemId]);

  // Toggle developer mode
  const handleToggleDevMode = () => {
    setDevMode(!devMode);
  };

  if (courseLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="ml-4">Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-600">Course not found or access denied.</p>
        </div>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Staff toolbar - fixed at the top */}
      <div className="bg-gray-800 text-white px-2 py-1 z-50 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center">
          <span className="font-medium mr-3 text-sm">{course.Title || `Course #${courseId}`}</span>
          <Button
            variant={devMode ? "default" : "default"}
            size="sm"
            className={`px-2 py-1 text-xs ${devMode
              ? "bg-yellow-600 hover:bg-yellow-700 text-white"
              : "bg-blue-700 hover:bg-blue-800 text-white"
            }`}
            onClick={handleToggleDevMode}
          >
            <FaWrench className="mr-1 h-3 w-3" />
            {devMode ? 'Dev Mode' : 'Dev Mode'}
          </Button>

          {devMode && (
            <div className="ml-2 flex items-center text-xs">
              <span className="bg-green-600 text-white px-1 py-0.5 rounded text-xs">Staff</span>
              <span className="mx-1">|</span>
              <span className="text-yellow-300 font-medium truncate max-w-32">{currentUser?.email}</span>
            </div>
          )}
        </div>

        <div></div>
      </div>

      {/* Header - full width, sticky */}
      <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0 z-20">
        <div className="px-3 py-1 flex items-center gap-2">
          <button
              className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 text-xs ${
                activeTab === 'content' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('content')}
            >
              <BookOpen className="h-3 w-3" />
              <span>Content</span>
            </button>
            
            <button
              className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 text-xs ${
                activeTab === 'progress' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('progress')}
            >
              <ClipboardCheck className="h-3 w-3" />
              <span>Progress</span>
            </button>
            
            <button
              className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 text-xs ${
                activeTab === 'grades' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('grades')}
            >
              <FaGraduationCap className="h-3 w-3" />
              <span>Grades</span>
            </button>
            
            {devMode && (
              <Button
                variant="default"
                size="sm"
                className="px-2 py-1 rounded-md transition-colors flex items-center gap-1 text-xs"
                onClick={() => setCodeEditorOpen(true)}
              >
                <FaCode className="h-3 w-3" />
                <span>Section Editor</span>
              </Button>
            )}
        </div>
      </div>

      {/* Content area with navigation */}
      <div className="flex flex-1 relative min-h-0">
        {/* Mobile overlay backdrop */}
        {isMobile && navExpanded && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={() => setNavExpanded(false)}
          />
        )}
        
        {/* Collapsible Navigation */}
        <div className={`
          ${navExpanded 
            ? isMobile 
              ? 'fixed inset-0 z-30 w-full' 
              : 'w-80' 
            : 'w-12'
          } 
          flex-shrink-0 transition-all duration-300 overflow-y-auto
        `}>
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
            course={enhancedCourse}
            isMobile={isMobile}
            gradebookItems={enhancedCourse?.Gradebook?.items || enhancedCourse?.Assessments || {}}
            isStaffView={true}
            devMode={devMode}
          />
        </div>
        {/* SEQUENTIAL_ACCESS_UPDATE: Added isStaffView and devMode props for lesson access control */}
        {/* Original CollapsibleNavigation props (before sequential access): courseTitle, unitsList, progress, activeItemId, expanded, onToggleExpand, onItemSelect, currentUnitIndex, course, isMobile */}

        {/* Main content - using CourseRouterEnhanced */}
        <main className="flex-1 overflow-auto p-2 pb-8 min-h-0">
          {activeTab === 'content' && (
            <div className="bg-white rounded-lg shadow">
              {devMode && (
                <div className="bg-yellow-50 border-b border-yellow-200 px-3 py-1 text-xs">
                  <span className="font-medium text-yellow-800">Dev Mode:</span>
                  <span className="ml-1 text-yellow-700">
                    Enhanced permissions active
                  </span>
                </div>
              )}
              {/* TODO: Refactor to use course components directly instead of CourseRouterEnhanced
                  Currently using deprecated CourseRouterEnhanced in content-only mode.
                  This staff wrapper needs its own refactoring to work with course components directly. */}
              <CourseRouterEnhanced
                course={enhancedCourse}
                isStaffView={true}
                devMode={devMode}
                renderMode="content-only"
                externalActiveItemId={activeItemId}
                externalOnItemSelect={handleItemSelect}
              />
            </div>
          )}
          
          {activeTab === 'progress' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-xl font-bold mb-4">Staff Progress View</h1>
              
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
                      const unitItems = unit.items || [];
                      const unitCompletedCount = unitItems.filter(item => progress[item.itemId]?.completed).length;
                      const unitPercentage = unitItems.length > 0 
                        ? Math.round((unitCompletedCount / unitItems.length) * 100) 
                        : 0;
                        
                      return (
                        <div key={unit.unitId || unitIndex}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-blue-700">
                              {unit.courseCode ? `${unit.courseCode} - ${unit.name}` : (unit.name || `Unit ${unitIndex + 1}`)}
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
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-xl font-bold mb-4">Staff Grades View</h1>
              
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">Staff Permissions</h3>
                <p className="text-sm text-green-800">
                  As a staff member, you have enhanced access to view and modify grades, progress tracking, and assessment data.
                </p>
              </div>
              
              <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Current Grade</h3>
                  <div className="text-3xl font-bold text-blue-700">82%</div>
                  <div className="text-sm text-blue-600 mt-1">B</div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Assignments</h3>
                  <div className="text-3xl font-bold text-green-700">90%</div>
                  <div className="text-sm text-green-600 mt-1">Weight: {courseWeights.assignment * 100 || 0}%</div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Exams</h3>
                  <div className="text-3xl font-bold text-purple-700">78%</div>
                  <div className="text-sm text-purple-600 mt-1">Weight: {courseWeights.exam * 100 || 0}%</div>
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="text-lg font-medium mb-4">Grade Breakdown</h2>
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
                          Weight
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Grade
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allCourseItems.filter(item => item.type !== 'lesson').map((item) => {
                        const itemProgress = progress[item.itemId] || {};
                        const mockGrade = itemProgress.completed ? 
                          Math.floor(Math.random() * 30) + 70 :
                          null;
                          
                        return (
                          <tr key={item.itemId}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {courseWeights[item.type] * 100 || 0}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {mockGrade ? `${mockGrade}%` : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {itemProgress.completed ? (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Graded
                                </span>
                              ) : (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                  Not Submitted
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
                <h3 className="font-medium text-gray-700 mb-2">How Grades Are Calculated</h3>
                <p className="mb-2">
                  The final grade is calculated based on the weights specified in the course:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  {Object.entries(courseWeights).map(([type, weight]) => (
                    <li key={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}: {weight * 100}%
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Code Editor */}
      {devMode && (
        <ModernSectionEditor
          courseProps={{
            course: enhancedCourse,
            courseId: courseId,
            isStaffView: true,
            devMode: devMode
          }}
          currentLessonInfo={currentLessonInfo}
          isOpen={codeEditorOpen}
          onOpenChange={setCodeEditorOpen}
          courseId={courseId}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default StaffCourseWrapperRefactored;