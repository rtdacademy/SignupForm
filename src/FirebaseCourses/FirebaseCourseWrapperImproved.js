import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaGraduationCap } from 'react-icons/fa';
import { BookOpen, ClipboardCheck, MenuIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CourseProgressBar from './components/navigation/CourseProgressBar';
import CollapsibleNavigation from './components/navigation/CollapsibleNavigation';
import { Button } from '../components/ui/button';

// Main wrapper component for all Firebase courses
// Provides common layout, navigation, and context for course content
const FirebaseCourseWrapper = ({
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

  // Debug logging
  console.log("🔄 FirebaseCourseWrapper rendering with course:", course);
  console.log("👤 Current User in wrapper:", currentUser);

  // Sync with external state if provided
  useEffect(() => {
    if (externalActiveItemId && externalActiveItemId !== activeItemId) {
      setActiveItemId(externalActiveItemId);
    }
  }, [externalActiveItemId, activeItemId]);

  // Handle internal item selection and propagate to parent if needed
  const handleItemSelect = useCallback((itemId) => {
    setActiveItemId(itemId);

    if (externalItemSelect) {
      externalItemSelect(itemId);
    }
  }, [externalItemSelect]);
  
  // Get course data from the course object, either from database or fallback
  const getCourseData = () => {
    console.log("Course data in wrapper:", course);
    console.log("Course structure path check:", {
      detailsStructurePath: course.courseDetails?.courseStructure?.structure,
      directPath: course.courseStructure,
      units: course.units
    });

    // First priority: check courseDetails.courseStructure.structure
    if (course.courseDetails?.courseStructure?.structure) {
      console.log("Using courseDetails.courseStructure.structure from database");
      return {
        title: course.courseDetails.courseStructure.title || course.Title || '',
        structure: course.courseDetails.courseStructure.structure,
        courseWeights: course.weights || { lesson: 0.2, assignment: 0.4, exam: 0.4 }
      };
    }
    // Second priority: check direct courseStructure path
    else if (course.courseStructure) {
      console.log("Using courseStructure from database");
      return {
        title: course.courseStructure.title || '',
        structure: course.courseStructure.structure || [],
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

  // Simulate progress data - in a real app, this would come from Firebase
  useEffect(() => {
    // Mock progress data
    const mockProgress = {};
    unitsList.forEach((unit) => {
      if (unit.items) {
        unit.items.forEach((item, idx) => {
          // Mark first item in each unit as completed for demo purposes
          if (idx === 0) {
            mockProgress[item.itemId] = { completed: true, completedAt: new Date().toISOString() };
          }
        });
      }
    });
    setProgress(mockProgress);
  }, [unitsList]);
  
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
    <div className="flex h-full">
      {/* Collapsible Navigation - fixed width */}
      <div className={`${navExpanded ? 'w-80' : 'w-12'} flex-shrink-0 h-full`}>
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
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full">
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 py-2 flex items-center gap-4">
            {!navExpanded && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setNavExpanded(true)}
                className="mr-2"
              >
                <MenuIcon className="h-5 w-5" />
              </Button>
            )}
            
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
          </div>
        </div>
        
        <main className="p-6 overflow-auto flex-1">
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
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-xl font-bold mb-4">Your Grades</h1>
              
              {/* Grade Summary */}
              <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Current Grade</h3>
                  <div className="text-3xl font-bold text-blue-700">82%</div>
                  <div className="text-sm text-blue-600 mt-1">B</div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Assignments</h3>
                  <div className="text-3xl font-bold text-green-700">90%</div>
                  <div className="text-sm text-green-600 mt-1">Weight: {course.courseDetails?.weights?.assignment * 100 || 0}%</div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Exams</h3>
                  <div className="text-3xl font-bold text-purple-700">78%</div>
                  <div className="text-sm text-purple-600 mt-1">Weight: {course.courseDetails?.weights?.exam * 100 || 0}%</div>
                </div>
              </div>
              
              {/* Grades Table */}
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
                        
                        // Generate mock grade for demo purposes
                        const mockGrade = itemProgress.completed ? 
                          Math.floor(Math.random() * 30) + 70 : // Random grade between 70-100 for completed items
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
                  Your final grade is calculated based on the weights specified in the course:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  {Object.entries(course.courseDetails?.weights || {}).map(([type, weight]) => (
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
    </div>
  );
};

export default FirebaseCourseWrapper;