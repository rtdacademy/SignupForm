import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { getDatabase, ref, get, set } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { FaWrench, FaGraduationCap, FaCode } from 'react-icons/fa';
import { BookOpen, ClipboardCheck } from 'lucide-react';
import CourseProgressBar from './components/navigation/CourseProgressBar';
import CollapsibleNavigation from './components/navigation/CollapsibleNavigation';

// Import course components - same as CourseRouter
const COM1255Course = lazy(() => import('./courses/COM1255'));
const PHY30Course = lazy(() => import('./courses/PHY30'));
const Course2 = lazy(() => import('./courses/2'));
const Course3 = lazy(() => import('./courses/3'));
const Course100 = lazy(() => import('./courses/100'));

// Code Editor Panel Component
const CodeEditorPanel = ({ courseId, currentUser, activeItemId, unitsList, onClose }) => {
  const [currentLessonPath, setCurrentLessonPath] = useState('');
  const [reactCode, setReactCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [existingContent, setExistingContent] = useState(null);
  const [currentLessonInfo, setCurrentLessonInfo] = useState(null);

  // Find the current lesson based on activeItemId
  useEffect(() => {
    if (!activeItemId || !unitsList) {
      setCurrentLessonPath('');
      setCurrentLessonInfo(null);
      return;
    }

    // Find the lesson item in the course structure
    let foundLesson = null;
    for (const unit of unitsList) {
      if (unit.items) {
        foundLesson = unit.items.find(item => item.itemId === activeItemId);
        if (foundLesson) break;
      }
    }

    if (foundLesson && foundLesson.contentPath) {
      setCurrentLessonPath(foundLesson.contentPath);
      setCurrentLessonInfo(foundLesson);
    } else {
      setCurrentLessonPath('');
      setCurrentLessonInfo(null);
    }
  }, [activeItemId, unitsList]);

  // Load existing code when lesson path changes
  useEffect(() => {
    if (currentLessonPath) {
      loadCode();
    }
  }, [currentLessonPath, courseId]);

  const saveCode = async () => {
    if (!reactCode.trim()) {
      setError('Please enter some React code before saving.');
      return;
    }

    if (!currentLessonPath) {
      setError('No lesson selected. Please select a lesson from the navigation first.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Starting code save process...');
      console.log('User:', currentUser?.email);
      console.log('Course ID:', courseId);
      console.log('Lesson Path:', currentLessonPath);
      
      // Transform JSX to React.createElement if needed
      let processedCode = reactCode;
      const containsJSX = reactCode.includes('<') && reactCode.includes('>');
      
      if (containsJSX) {
        console.log('JSX detected, transforming...');
        try {
          const functions = getFunctions();
          const transformJSX = httpsCallable(functions, 'transformJSXCode');
          const result = await transformJSX({ jsxCode: reactCode });
          
          if (result.data.success) {
            processedCode = result.data.transformedCode;
            console.log('JSX transformed successfully');
          } else {
            throw new Error(`JSX transformation failed: ${result.data.error}`);
          }
        } catch (transformError) {
          console.warn('Backend JSX transformation failed, saving original code:', transformError);
          // Continue with original code - the frontend will attempt transformation
        }
      }
      
      // Create a file from the code string
      const timestamp = Date.now();
      const fileName = `${currentLessonPath}-v${timestamp}.js`;
      const codeBlob = new Blob([processedCode], { type: 'text/javascript' });
      const codeFile = new File([codeBlob], fileName, { type: 'text/javascript' });
      
      // Upload to Firebase Storage
      const storage = getStorage();
      const storagePath = `courseDevelopment/${courseId}/${currentLessonPath}/${fileName}`;
      const fileRef = storageRef(storage, storagePath);
      
      console.log('Storage path:', storagePath);
      
      // Upload the file
      const snapshot = await uploadBytes(fileRef, codeFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log('File uploaded successfully to storage:', downloadURL);
      
      // Update database metadata only
      const db = getDatabase();
      const dbPath = `courseDevelopment/${courseId}/${currentLessonPath}`;
      const metadataRef = ref(db, dbPath);
      
      // Load existing metadata to preserve version history
      const existingSnapshot = await get(metadataRef);
      const existingData = existingSnapshot.exists() ? existingSnapshot.val() : {};
      const existingVersions = existingData.versions || [];
      
      const metadataUpdate = {
        enabled: true,
        currentFile: fileName,
        currentFileUrl: downloadURL,
        metadata: {
          lastModified: new Date().toISOString(),
          modifiedBy: currentUser?.email || 'unknown',
          version: timestamp,
          lessonTitle: currentLessonInfo?.title || currentLessonPath,
          contentType: 'lesson'
        },
        versions: [
          ...existingVersions,
          {
            fileName: fileName,
            uploadedAt: new Date().toISOString(),
            version: timestamp,
            url: downloadURL,
            modifiedBy: currentUser?.email || 'unknown'
          }
        ]
      };
      
      await set(metadataRef, metadataUpdate);
      
      console.log('Metadata saved successfully to database');
      setSaved(true);
      
      // Auto-close developer mode after successful save
      setTimeout(() => {
        setSaved(false);
        if (onClose) {
          onClose(); // This will turn off dev mode and switch to content tab
        }
      }, 2000); // Show success message for 2 seconds, then close
      
    } catch (err) {
      console.error('Detailed error saving code:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      setError(`Failed to save code: ${err.message} (Code: ${err.code || 'unknown'})`);
    } finally {
      setLoading(false);
    }
  };

  const loadCode = async () => {
    if (!currentLessonPath || !courseId) return;
    
    try {
      const db = getDatabase();
      const metadataRef = ref(db, `courseDevelopment/${courseId}/${currentLessonPath}`);
      const snapshot = await get(metadataRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        setExistingContent(data);
        
        // Load the code using Firebase Function (bypasses CORS)
        if (data.currentFile) {
          console.log('Loading code via function:', data.currentFile);
          const functions = getFunctions();
          const loadCourseCode = httpsCallable(functions, 'loadCourseCode');
          
          try {
            const result = await loadCourseCode({
              courseId: courseId,
              lessonPath: currentLessonPath,
              fileName: data.currentFile
            });
            
            if (result.data.success) {
              setReactCode(result.data.code);
            } else {
              throw new Error('Function returned error');
            }
          } catch (functionError) {
            console.error('Error loading from function:', functionError);
            throw new Error('Failed to load code via function');
          }
        } else {
          // Fallback for old format (if reactCode is still stored in database)
          setReactCode(data.reactCode || '');
        }
        setError(null);
      } else {
        setExistingContent(null);
        setReactCode('');
        setError(null);
      }
    } catch (err) {
      console.error('Error loading code:', err);
      setError('Failed to load code: ' + err.message);
    }
  };

  const validateCode = (code) => {
    // Basic validation for dangerous patterns
    const forbiddenPatterns = [
      /fetch\s*\(/i,
      /window\./i,
      /document\./i,
      /localStorage/i,
      /sessionStorage/i,
      /eval\s*\(/i,
      /new\s+Function\s*\(/i
    ];
    
    const dangerous = forbiddenPatterns.find(pattern => pattern.test(code));
    if (dangerous) {
      return `Code contains potentially dangerous pattern: ${dangerous}`;
    }
    return null;
  };

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setReactCode(newCode);
    setSaved(false);
    
    // Validate code
    const validation = validateCode(newCode);
    if (validation) {
      setError(validation);
    } else {
      setError(null);
    }
  };

  // Show message if no lesson is selected
  if (!currentLessonPath || !currentLessonInfo) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">📌 Select a Lesson to Edit</h3>
          <p className="text-sm text-blue-700">
            Use the navigation on the left to select a lesson, then return to this Code Editor tab to edit its content.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-yellow-800 mb-2">🚧 Course Development Mode</h3>
            <p className="text-sm text-yellow-700 mb-2">
              Paste React component code below. Use React.createElement syntax (JSX support coming soon). No imports or exports needed.
            </p>
            <p className="text-xs text-yellow-600">
              <strong>Security Note:</strong> Only use trusted code. Avoid fetch, window, document, localStorage, and eval.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-yellow-600 hover:text-yellow-800 ml-4 text-sm underline"
          >
            Exit Code Editor
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-3 rounded-md">
          <p className="text-sm text-red-700">⚠️ {error}</p>
        </div>
      )}

      {/* Current Lesson Info */}
      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
        <h4 className="font-medium text-green-800 mb-1">📝 Currently Editing:</h4>
        <p className="text-green-700 font-medium">{currentLessonInfo.title}</p>
        <p className="text-xs text-green-600 mt-1">
          Path: {currentLessonPath} | Type: {currentLessonInfo.type}
        </p>
      </div>

      {/* Existing Content Info */}
      {existingContent && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
          <p className="text-sm text-blue-800">
            📄 <strong>Existing Content Found</strong> | 
            Last modified: {new Date(existingContent.metadata?.lastModified).toLocaleString()} 
            by {existingContent.metadata?.modifiedBy}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Status: {existingContent.enabled ? '✅ Enabled' : '❌ Disabled'}
          </p>
        </div>
      )}

      {/* Code Editor */}
      <div>
        <label className="block text-sm font-medium mb-2">React Component Code:</label>
        <textarea
          value={reactCode}
          onChange={handleCodeChange}
          placeholder={`Paste your React component code here...

Example (React.createElement syntax):
const IntroEthicsFinancialDecisions = ({ course, courseId, itemConfig, isStaffView, devMode }) => {
  return React.createElement('div', { className: 'space-y-8' },
    React.createElement(Card, null,
      React.createElement(CardHeader, null,
        React.createElement(CardTitle, null, 'Your Custom Content')
      ),
      React.createElement(CardContent, null,
        React.createElement('p', null, 'This is dynamically rendered from storage!')
      )
    )
  );
};

// No export needed - component will be found automatically`}
          className="w-full h-96 p-4 font-mono text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
        />
        <p className="text-xs text-gray-500 mt-1">
          Available components (no imports needed): React, Card, CardContent, CardHeader, CardTitle, Alert, AlertDescription, Badge, AIMultipleChoiceQuestion
        </p>
        <p className="text-xs text-blue-600 mt-1">
          💡 Use SAMPLE_REACT_CODE.js as a reference for the React.createElement syntax.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 items-center">
        <Button 
          onClick={saveCode} 
          disabled={loading || !!error || !currentLessonPath}
          className="bg-green-600 hover:bg-green-700"
        >
          {loading ? 'Saving...' : 'Save to Storage'}
        </Button>
        <Button 
          variant="outline" 
          onClick={loadCode}
          disabled={loading}
        >
          Reload from Storage
        </Button>
        <Button 
          variant="outline" 
          onClick={onClose}
          className="border-red-300 text-red-600 hover:bg-red-50"
        >
          Exit Code Editor
        </Button>
        {saved && (
          <span className="text-green-600 text-sm flex items-center">
            ✓ Saved successfully - Closing in 2 seconds...
          </span>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 border border-gray-200 p-4 rounded-md">
        <h4 className="font-medium text-gray-800 mb-2">📚 Instructions:</h4>
        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
          <li>Select a lesson from the navigation on the left</li>
          <li>Return to this Code Editor tab</li>
          <li>Paste your React component code (must export default)</li>
          <li>Click "Save to Storage" to store the code file</li>
          <li>View the lesson in "Content" tab to see your changes</li>
          <li>Use the toggle in the lesson to switch between manual and UI-generated versions</li>
        </ol>
      </div>
    </div>
  );
};

/**
 * Staff course wrapper with enhanced permissions and features
 * Similar structure to FirebaseCourseWrapper but with staff-specific functionality
 */
const StaffCourseWrapper = () => {
  const { courseId } = useParams();
  const { currentUser } = useAuth();
  
  // Course data state
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Staff-specific state
  const [devMode, setDevMode] = useState(false);
  
  // UI state (similar to FirebaseCourseWrapper)
  const [activeTab, setActiveTab] = useState('content');
  const [activeItemId, setActiveItemId] = useState(null);
  const [progress, setProgress] = useState({});
  const [navExpanded, setNavExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Loading component for Suspense fallback
  const LoadingCourse = () => (
    <div className="p-8 flex justify-center items-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-gray-600">Loading course content...</p>
      </div>
    </div>
  );

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
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading course:', error);
        setLoading(false);
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
      setIsMobile(window.innerWidth < 768); // Tailwind's md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Start with navigation closed on mobile
    if (window.innerWidth < 768) {
      setNavExpanded(false);
    }
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Enhanced course with structure data (similar to CourseRouter logic)
  const getEnhancedCourse = useCallback(() => {
    if (!course) return null;

    switch(courseId) {
      case '2':
      case 2:
        const courseStructureData2 = require('./courses/2/course-structure.json');
        return {
          ...course,
          courseStructure: {
            title: "Physics 30",
            structure: courseStructureData2.courseStructure?.units || []
          }
        };
      case '3':
      case 3:
        const courseStructureData3 = require('./courses/3/course-structure.json');
        return {
          ...course,
          courseStructure: {
            title: "Financial Literacy",
            structure: courseStructureData3.courseStructure?.units || []
          }
        };
      case '100':
      case 100:
        const courseStructureData100 = require('./courses/100/course-structure.json');
        return {
          ...course,
          courseStructure: {
            title: "Sample Course",
            structure: courseStructureData100.courseStructure?.units || []
          }
        };
      default:
        return course;
    }
  }, [course, courseId]);

  // Get course data (similar to FirebaseCourseWrapper)
  const getCourseData = useCallback(() => {
    const enhancedCourse = getEnhancedCourse();
    if (!enhancedCourse) return { title: '', structure: [], courseWeights: {} };

    console.log("🔍 StaffCourseWrapper - Analyzing course data:", enhancedCourse);

    // First priority: check direct courseStructure path (JSON file)
    if (enhancedCourse.courseStructure?.structure) {
      console.log("Using courseStructure.structure from JSON file");
      return {
        title: enhancedCourse.courseStructure.title || '',
        structure: enhancedCourse.courseStructure.structure || [],
        courseWeights: enhancedCourse.weights || { lesson: 0.2, assignment: 0.4, exam: 0.4 }
      };
    }
    // Also check for nested courseStructure.units pattern
    else if (enhancedCourse.courseStructure?.units) {
      console.log("Using courseStructure.units from JSON file");
      return {
        title: enhancedCourse.courseStructure.title || enhancedCourse.Course?.Value || '',
        structure: enhancedCourse.courseStructure.units || [],
        courseWeights: enhancedCourse.weights || { lesson: 0.2, assignment: 0.4, exam: 0.4 }
      };
    }

    // Fallback: use other course data
    console.log("⚠️ WARNING: Using fallback - no JSON structure found!");
    return {
      title: enhancedCourse.Course?.Value || enhancedCourse.courseDetails?.Title || '',
      structure: enhancedCourse.courseDetails?.units || [],
      courseWeights: enhancedCourse.weights || { lesson: 0.2, assignment: 0.4, exam: 0.4 }
    };
  }, [getEnhancedCourse]);

  const courseData = getCourseData();
  const courseTitle = courseData.title;
  const unitsList = courseData.structure || [];
  const courseWeights = courseData.courseWeights || { lesson: 0.2, assignment: 0.4, exam: 0.4 };

  // Handle internal item selection
  const handleItemSelect = useCallback((itemId) => {
    setActiveItemId(itemId);
    
    // Scroll to top when selecting a new item
    window.scrollTo(0, 0);
    
    // Auto-close navigation on mobile after selection
    if (isMobile) {
      setNavExpanded(false);
    }
  }, [isMobile]);

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

  // Render course content directly (similar to CourseRouter logic)
  const renderCourseContent = () => {
    const enhancedCourse = getEnhancedCourse();
    
    switch(courseId) {
      case '1':
      case 1:
        return (
          <Suspense fallback={<LoadingCourse />}>
            <COM1255Course
              course={enhancedCourse}
              activeItemId={activeItemId}
              onItemSelect={handleItemSelect}
              isStaffView={true}
              devMode={devMode}
            />
          </Suspense>
        );
      case '0':
      case 0:
        return (
          <Suspense fallback={<LoadingCourse />}>
            <PHY30Course
              course={enhancedCourse}
              activeItemId={activeItemId}
              onItemSelect={handleItemSelect}
              isStaffView={true}
              devMode={devMode}
            />
          </Suspense>
        );
      case '2':
      case 2:
        return (
          <Suspense fallback={<LoadingCourse />}>
            <Course2
              course={enhancedCourse}
              activeItemId={activeItemId}
              onItemSelect={handleItemSelect}
              isStaffView={true}
              devMode={devMode}
            />
          </Suspense>
        );
      case '3':
      case 3:
        return (
          <Suspense fallback={<LoadingCourse />}>
            <Course3
              course={enhancedCourse}
              activeItemId={activeItemId}
              onItemSelect={handleItemSelect}
              isStaffView={true}
              devMode={devMode}
            />
          </Suspense>
        );
      case '100':
      case 100:
        return (
          <Suspense fallback={<LoadingCourse />}>
            <Course100
              course={enhancedCourse}
              activeItemId={activeItemId}
              onItemSelect={handleItemSelect}
              isStaffView={true}
              devMode={devMode}
            />
          </Suspense>
        );
      default:
        return (
          <div className="p-8">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
              <p className="text-amber-600">Course content for ID {courseId} is being developed. Check back soon!</p>
            </div>
          </div>
        );
    }
  };

  // Toggle developer mode
  const handleToggleDevMode = () => {
    setDevMode(!devMode);
  };

  // Handle closing code editor (turn off dev mode and switch to content)
  const handleCloseCodeEditor = () => {
    setDevMode(false);
    setActiveTab('content');
  };

  if (loading) {
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
    <div className="flex flex-col h-screen">
      {/* Staff toolbar - fixed at the top */}
      <div className="bg-gray-800 text-white p-2 z-50 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center">
          <span className="font-medium mr-4">{course.Title || `Course #${courseId}`}</span>
          <Button
            variant={devMode ? "default" : "default"}
            size="sm"
            className={devMode
              ? "bg-yellow-600 hover:bg-yellow-700 text-white"
              : "bg-blue-700 hover:bg-blue-800 text-white"
            }
            onClick={handleToggleDevMode}
          >
            <FaWrench className="mr-2" />
            {devMode ? 'Developer Mode Active' : 'Enable Developer Mode'}
          </Button>

          {devMode && (
            <div className="ml-4 flex items-center text-sm">
              <span className="bg-green-600 text-white px-2 py-0.5 rounded">Staff</span>
              <span className="mx-2">|</span>
              <span className="text-yellow-300 font-medium">{currentUser?.email}</span>
            </div>
          )}
        </div>

        {/* Empty div to maintain the flex layout */}
        <div></div>
      </div>

      {/* Header - full width, sticky */}
      <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0 z-20">
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
            
            {devMode && (
              <button
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 text-sm ${
                  activeTab === 'codeEditor' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('codeEditor')}
              >
                <FaCode className="h-4 w-4" />
                <span>Code Editor</span>
              </button>
            )}
        </div>
      </div>

      {/* Content area with navigation - this div will handle the scrolling */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Mobile overlay backdrop */}
        {isMobile && navExpanded && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={() => setNavExpanded(false)}
          />
        )}
        
        {/* Collapsible Navigation - responsive width */}
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
            course={getEnhancedCourse()}
            isMobile={isMobile}
          />
        </div>

        {/* Main content - this will be scrollable */}
        <main className="flex-1 overflow-auto p-6">
          {activeTab === 'content' && (
            <div className="bg-white rounded-lg shadow">
              {devMode && (
                <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-sm">
                  <span className="font-medium text-yellow-800">Staff Developer Mode:</span>
                  <span className="ml-2 text-yellow-700">
                    You have enhanced permissions and can directly interact with the database for testing questions.
                  </span>
                </div>
              )}
              {renderCourseContent()}
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
          
          {activeTab === 'codeEditor' && devMode && (
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-xl font-bold mb-4">Course Code Editor</h1>
              <CodeEditorPanel 
                courseId={courseId} 
                currentUser={currentUser} 
                activeItemId={activeItemId}
                unitsList={unitsList}
                onClose={handleCloseCodeEditor}
              />
            </div>
          )}
          
          {activeTab === 'grades' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-xl font-bold mb-4">Staff Grades View</h1>
              
              {/* Staff-specific grade management tools could go here */}
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">Staff Permissions</h3>
                <p className="text-sm text-green-800">
                  As a staff member, you have enhanced access to view and modify grades, progress tracking, and assessment data.
                </p>
              </div>
              
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
                  <div className="text-sm text-green-600 mt-1">Weight: {courseWeights.assignment * 100 || 0}%</div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Exams</h3>
                  <div className="text-3xl font-bold text-purple-700">78%</div>
                  <div className="text-sm text-purple-600 mt-1">Weight: {courseWeights.exam * 100 || 0}%</div>
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
    </div>
  );
};

export default StaffCourseWrapper;