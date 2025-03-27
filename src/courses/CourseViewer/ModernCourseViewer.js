import React, { useState, useEffect, useMemo } from 'react';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../../context/AuthContext';
import { 
  Info, 
  MenuIcon, 
  CalendarDays, 
  Star, 
  ExternalLink, 
  Eye,
  EyeOff,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Progress } from '../../components/ui/progress';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../../components/ui/sheet';
import { format, parseISO } from 'date-fns';
import PerformanceSummary from './PerformanceSummary';
import CourseNavigation from './CourseNavigation';
import LTIAssessmentLauncher from './LTIAssessmentLauncher';
import ContentDisplay from './ContentDisplay';
import { createInitialNormalizedSchedule } from '../../utils/scheduleInitializer';

const LTI_BASE_URL = 'https://us-central1-rtd-academy.cloudfunctions.net';

const typeColors = {
  lesson: 'text-blue-600 bg-blue-50 border-blue-200',
  assignment: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  exam: 'text-purple-600 bg-purple-50 border-purple-200',
  info: 'text-gray-600 bg-gray-50 border-gray-200',
};

const typeIcons = {
  lesson: <BookOpen className="h-4 w-4" />,
  assignment: <ClipboardCheck className="h-4 w-4" />,
  exam: <FileText className="h-4 w-4" />,
  info: <Lightbulb className="h-4 w-4" />,
};

// Import necessary icons
import { BookOpen, FileText, ClipboardCheck } from 'lucide-react';

const ModernCourseViewer = ({
  courseId,
  previewMode = false,
  previewContent = null,
  courseData: initialCourseData = null,
  profile,
  studentCourseData: initialStudentCourseData
}) => {
  const { user, current_user_email_key } = useAuth();
  const [studentCourseData, setStudentCourseData] = useState(initialStudentCourseData);
  const [courseData, setCourseData] = useState(initialCourseData);
  const [courseTitle, setCourseTitle] = useState('');
  const [currentUnitIndex, setCurrentUnitIndex] = useState(0);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(true);
  const [creatingInitialSchedule, setCreatingInitialSchedule] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [contentData, setContentData] = useState(null);
  const [ltiLaunchLoading, setLtiLaunchLoading] = useState(false);
  const [isLaunchSheetOpen, setIsLaunchSheetOpen] = useState(false);
  const [ltiLaunchUrl, setLtiLaunchUrl] = useState(null);
  const [normalizedSchedule, setNormalizedSchedule] = useState(null);
  const [needsInitialSchedule, setNeedsInitialSchedule] = useState(false);
  const [error, setError] = useState(null);

  // All useMemo hooks must be defined in the same order every render
  const units = useMemo(() => courseData?.units || [], [courseData]);
  
  const currentUnit = useMemo(
    () => units[currentUnitIndex] || null,
    [units, currentUnitIndex]
  );
  
  const currentItem = useMemo(
    () => currentUnit?.items?.[currentItemIndex] || null,
    [currentUnit, currentItemIndex]
  );

  const currentItemContent = useMemo(() => {
    if (!contentData || !currentUnit || !currentItem) return null;
    
    const unitId = `unit_${currentUnit.sequence}`;
    const itemId = `item_${currentItem.sequence}`;
    
    // Check if contentData has the expected structure
    if (contentData.units && contentData.units[unitId] && 
        contentData.units[unitId].items && contentData.units[unitId].items[itemId]) {
      return contentData.units[unitId].items[itemId];
    }
    
    console.log("Content structure not found for:", unitId, itemId);
    return null;
  }, [contentData, currentUnit, currentItem]);
  
  // Create a proper preview schedule from the course data for preview mode
  const previewSchedule = useMemo(() => {
    if (!previewMode || normalizedSchedule) return normalizedSchedule;
    
    // Make sure we have course data with units
    if (!courseData || !Array.isArray(courseData.units)) {
      console.log("No course data available for preview schedule");
      return null;
    }

    console.log("Creating preview schedule from course data:", courseData);
    
    // Filter out undefined units and ensure they have items array
    const validUnits = courseData.units.filter(unit => 
      unit && typeof unit === 'object' && unit.sequence
    );

    // Create a global index counter for all items
    let globalIndex = 0;
    
    // Transform the units into the format expected by CourseNavigation
    const transformedUnits = validUnits.map((unit, unitIndex) => {
      // Ensure unit items is an array
      const unitItems = Array.isArray(unit.items) ? unit.items : [];
      
      // Filter out undefined items and transform them
      const transformedItems = unitItems
        .filter(item => item && typeof item === 'object' && item.sequence)
        .map((item, itemIndex) => {
          // Assign a global index to each item
          const itemGlobalIndex = globalIndex++;
          
          return {
            ...item,
            globalIndex: itemGlobalIndex,
            unitIndex,
            itemIndex
          };
        });
      
      return {
        ...unit,
        items: transformedItems
      };
    });
    
    console.log("Created preview schedule with units:", transformedUnits);
    
    return {
      units: transformedUnits,
      isPreview: true
    };
  }, [previewMode, normalizedSchedule, courseData]);
  
  // Derived schedule data
  const { sortedScheduleItems } = useMemo(() => {
    if (previewMode || !normalizedSchedule?.units) {
      return {
        sortedScheduleItems: [],
      };
    }
    
    // Ensure we have valid units with items before flattening
    const validUnits = normalizedSchedule.units.filter(unit => Array.isArray(unit.items));
    
    const sortedItems = validUnits
      .flatMap((unit) => unit.items || [])
      .filter(item => item && item.date) // Ensure item and date exist
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      sortedScheduleItems: sortedItems,
    };
  }, [normalizedSchedule, previewMode]);

  // Navigation functions
  const goToNextItem = () => {
    if (!currentUnit || !currentUnit.items) return;
    
    if (currentItemIndex < currentUnit.items.length - 1) {
      // Next item in current unit
      setCurrentItemIndex(currentItemIndex + 1);
    } else if (currentUnitIndex < units.length - 1) {
      // First item in next unit
      setCurrentUnitIndex(currentUnitIndex + 1);
      setCurrentItemIndex(0);
    }
  };

  const goToPreviousItem = () => {
    if (currentItemIndex > 0) {
      // Previous item in current unit
      setCurrentItemIndex(currentItemIndex - 1);
    } else if (currentUnitIndex > 0) {
      // Last item in previous unit
      const prevUnit = units[currentUnitIndex - 1];
      if (prevUnit && prevUnit.items && prevUnit.items.length > 0) {
        setCurrentUnitIndex(currentUnitIndex - 1);
        setCurrentItemIndex(prevUnit.items.length - 1);
      }
    }
  };

  // Function to create initial normalized schedule
  const createSchedule = async () => {
    if (previewMode || !current_user_email_key || !courseId || !courseData || !studentCourseData) {
      return;
    }

    setCreatingInitialSchedule(true);
    
    try {
      console.log('Creating initial normalized schedule...');
      
      // First check if student has LMSStudentID
      const hasLMSStudentID = !!studentCourseData.LMSStudentID;
      
      if (hasLMSStudentID) {
        // If they have an ID, use the cloud function
        console.log('Student has LMSStudentID, using cloud function');
        const functions = getFunctions();
        const generateScheduleFunction = httpsCallable(functions, 'generateNormalizedSchedule');
        
        await generateScheduleFunction({
          studentKey: current_user_email_key,
          courseId: courseId,
          forceUpdate: true
        });
      } else {
        // No LMSStudentID, create initial client-side schedule
        console.log('No LMSStudentID, creating initial client-side schedule');
        const initialSchedule = createInitialNormalizedSchedule(
          current_user_email_key, 
          courseId, 
          courseData, 
          studentCourseData
        );
        
        if (initialSchedule) {
          setNormalizedSchedule(initialSchedule);
        }
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      setError('Failed to create schedule. Please try again.');
    } finally {
      setCreatingInitialSchedule(false);
      setNeedsInitialSchedule(false);
    }
  };

  // Handle course data initialization in preview mode
  useEffect(() => {
    if (previewMode) {
      // In preview mode, use either provided courseData or extract from previewContent
      if (initialCourseData) {
        setCourseData(initialCourseData);
        setCourseTitle(initialCourseData.Title || 'Course Preview');
        setLoading(false);
      } else if (previewContent) {
        // If we have courseData in previewContent, use it
        if (previewContent.courseData) {
          setCourseData(previewContent.courseData);
          setCourseTitle(previewContent.courseData.Title || 'Course Preview');
        }
        setLoading(false);
      }
    }
  }, [previewMode, previewContent, initialCourseData]);

  // Set up Firebase listeners for course data, student course data, and normalized schedule
  useEffect(() => {
    if (previewMode) {
      // In preview mode, we already handle data initialization in another effect
      return;
    }
    
    if (!current_user_email_key || !courseId) return;
    
    const db = getDatabase();
    setLoading(true);

    // Setup course listener
    const courseRef = ref(db, `courses/${courseId}`);
    const courseUnsubscribe = onValue(courseRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCourseData(data);
        setCourseTitle(data.Title || 'Course');
      }
    });

    // Setup student course data listener
    const studentCourseRef = ref(db, `students/${current_user_email_key}/courses/${courseId}`);
    const studentCourseUnsubscribe = onValue(studentCourseRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStudentCourseData(data);
      }
    });

    // Setup normalized schedule listener
    const normalizedScheduleRef = ref(db, `students/${current_user_email_key}/courses/${courseId}/normalizedSchedule`);
    const normalizedScheduleUnsubscribe = onValue(normalizedScheduleRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        console.log('Received normalized schedule from server:', data);
        setNormalizedSchedule(data);
        setNeedsInitialSchedule(false);
      } else if (courseData && studentCourseData?.ScheduleJSON?.units) {
        // No schedule exists but we have course data, mark as needing initial schedule
        setNeedsInitialSchedule(true);
      }
      
      setLoading(false);
    }, (error) => {
      console.error('Error fetching normalized schedule:', error);
      if (courseData && studentCourseData?.ScheduleJSON?.units) {
        setNeedsInitialSchedule(true);
      }
      setLoading(false);
    });

    return () => {
      courseUnsubscribe();
      studentCourseUnsubscribe();
      normalizedScheduleUnsubscribe();
    };
  }, [previewMode, current_user_email_key, courseId, courseData, studentCourseData]);

  // Create initial schedule when needed
  useEffect(() => {
    if (needsInitialSchedule && courseData && studentCourseData && !normalizedSchedule && !creatingInitialSchedule) {
      createSchedule();
    }
  }, [needsInitialSchedule, courseData, studentCourseData, normalizedSchedule, creatingInitialSchedule]);

  // Function to gather all contentPaths from course data
  const getContentPaths = (courseData) => {
    if (!courseData || !courseData.units) return [];
    
    const paths = [];
    courseData.units.forEach((unit, unitIndex) => {
      if (unit && unit.items) {
        unit.items.forEach((item, itemIndex) => {
          if (item && item.contentPath) {
            paths.push({
              unitIndex,
              itemIndex,
              unitSequence: unit.sequence,
              itemSequence: item.sequence,
              contentPath: item.contentPath
            });
          }
        });
      }
    });
    
    return paths;
  };

  // Fetch content from individual content paths in Firestore
  useEffect(() => {
    if (!courseData) {
      return;
    }

    // Special case: if previewContent already has the content structure we need
    if (previewMode && previewContent && previewContent.units) {
      console.log("Using provided preview content structure:", previewContent);
      setContentData(previewContent);
      setContentLoading(false);
      return;
    }
    
    const fetchContentFromPaths = async () => {
      setContentLoading(true);
      
      try {
        // 1. Get content paths from the course data
        const contentPaths = getContentPaths(courseData);
        console.log(`Found ${contentPaths.length} content paths`);
        
        if (contentPaths.length === 0) {
          setContentData(null);
          setContentLoading(false);
          return;
        }
        
        // 2. Initialize content structure
        const contentStructure = { units: {} };
        
        // 3. Fetch content for each path
        const firestore = getFirestore();
        
        for (const pathInfo of contentPaths) {
          if (!pathInfo.contentPath) continue;
          
          // Replace 'draft' with 'saved' to ensure we get the published version
          const contentPath = pathInfo.contentPath.replace('/draft/', '/saved/');
          console.log(`Fetching content from: ${contentPath}`);
          
          try {
            // Get the document reference
            const contentRef = doc(firestore, contentPath);
            const contentSnap = await getDoc(contentRef);
            
            console.log(`Document exists: ${contentSnap.exists()}`);
            if (contentSnap.exists()) {
              // Log the full document data to debug
              console.log(`Document data:`, contentSnap.data());
              
              const unitId = `unit_${pathInfo.unitSequence}`;
              const itemId = `item_${pathInfo.itemSequence}`;
              
              // Ensure unit exists in the structure
              if (!contentStructure.units[unitId]) {
                contentStructure.units[unitId] = { items: {} };
              }
              
              // Ensure items exists in the unit
              if (!contentStructure.units[unitId].items) {
                contentStructure.units[unitId].items = {};
              }
              
              // Add the content to the structure - accessing 'content' property from the document
              const docData = contentSnap.data();
              const contentHtml = docData.content || "";
              console.log(`Content HTML for ${unitId}/${itemId}:`, contentHtml.substring(0, 100) + "...");
              
              contentStructure.units[unitId].items[itemId] = {
                content: contentHtml
              };
            } else {
              console.log(`No content found at ${contentPath}`);
            }
          } catch (error) {
            console.error(`Error fetching content for path ${pathInfo.contentPath}:`, error);
          }
        }
        
        console.log("Content successfully assembled:", contentStructure);
        setContentData(contentStructure);
      } catch (error) {
        console.error('Error fetching content:', error);
        setError('Failed to load content. Please try again.');
      } finally {
        setContentLoading(false);
      }
    };

    fetchContentFromPaths();
  }, [courseData, previewMode, previewContent]);

  // Prepare LTI launch URL
  useEffect(() => {
    const prepareLTILaunch = async () => {
      if (!user || !profile || !currentItem?.lti?.enabled) {
        return;
      }
      try {
        const firstName = profile.preferredFirstName || profile.firstName || '';
        const params = new URLSearchParams({
          user_id: user.uid,
          course_id: courseId,
          role: 'student',
          deep_link_id: currentItem.lti.deep_link_id,
          allow_direct_login: '1',
          firstname: firstName,
          lastname: profile.lastName || '',
          email: profile.StudentEmail || user.email,
        });
        const launchUrl = `${LTI_BASE_URL}/ltiLogin?${params.toString()}`;
        setLtiLaunchUrl(launchUrl);
      } catch (error) {
        console.error('Error preparing LTI launch:', error);
      }
    };
    prepareLTILaunch();
  }, [currentItem, user, profile, courseId]);

  // Helper functions
  const findScheduleItem = (item) => {
    if (!normalizedSchedule?.units || previewMode || !item?.title) return null;
    return sortedScheduleItems.find((schedItem) => schedItem?.title === item.title);
  };

  const calculateProgress = () => {
    if (!normalizedSchedule?.units || previewMode || sortedScheduleItems.length === 0) return 0;
    // Count items with assessmentData as completed
    const completed = sortedScheduleItems.filter((item) => item?.assessmentData).length;
    return Math.round((completed / sortedScheduleItems.length) * 100);
  };

  const isCurrentAssignment = (item) => {
    if (previewMode || !normalizedSchedule?.scheduleAdherence || !item) return false;
    const adherence = normalizedSchedule.scheduleAdherence;
    return item.globalIndex === (adherence.currentCompletedIndex + 1);
  };

  const isLastStartedAssignment = (item) => {
    if (previewMode || !normalizedSchedule?.scheduleAdherence || !item) return false;
    const adherence = normalizedSchedule.scheduleAdherence;
    return item.globalIndex === adherence.currentCompletedIndex;
  };

  // Get the item type icon
  const getItemTypeIcon = (type) => {
    return typeIcons[type] || <Info className="h-4 w-4" />;
  };

  // Updated renderContent function
  const renderContent = () => {
    if (contentLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
            <p className="mt-4 text-blue-700 font-medium">Loading content...</p>
          </div>
        </div>
      );
    }

    if (!currentItem) {
      return (
        <div className="text-gray-600">
          <Alert className="border-blue-100 bg-gradient-to-r from-blue-50/90 to-indigo-50/90 text-blue-800">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="font-medium">
              No content selected. Please choose an item from the menu.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    // Handle LTI-enabled items
    if (currentItem.lti?.enabled) {
      // If this is an initial schedule, encourage the student to start the course
      if (normalizedSchedule?.isInitialSchedule) {
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg shadow-sm">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-blue-800">Begin Your Course</h3>
                <p className="text-sm text-blue-700">
                  Click to start this lesson and activate your course progress tracking
                </p>
              </div>
              <Button
                onClick={() => setIsLaunchSheetOpen(true)}
                disabled={ltiLaunchLoading}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md transition-all duration-200"
              >
                <ExternalLink className="h-4 w-4" />
                Start Lesson
              </Button>
            </div>
            <Alert className="border-blue-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/80">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertDescription className="font-medium text-blue-700">
                Your progress will be tracked once you start your first lesson.
              </AlertDescription>
            </Alert>
            <LTIAssessmentLauncher
              isOpen={isLaunchSheetOpen}
              onOpenChange={setIsLaunchSheetOpen}
              title={currentItem.title}
              courseId={courseId}
              launchUrl={ltiLaunchUrl}
              type={currentItem.type}
              onError={(error) => {
                console.error('LTI Launch error:', error);
                setIsLaunchSheetOpen(false);
              }}
            />
          </div>
        );
      }
      
      // Normal LTI launch for students with progress
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg shadow-sm">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-blue-800">IMathAS Assessment</h3>
              <p className="text-sm text-blue-700">Click to open the assessment</p>
            </div>
            <Button
              onClick={() => setIsLaunchSheetOpen(true)}
              disabled={ltiLaunchLoading}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md transition-all duration-200"
            >
              <ExternalLink className="h-4 w-4" />
              Open Assessment
            </Button>
          </div>
          <LTIAssessmentLauncher
            isOpen={isLaunchSheetOpen}
            onOpenChange={setIsLaunchSheetOpen}
            title={currentItem.title}
            courseId={courseId}
            launchUrl={ltiLaunchUrl}
            type={currentItem.type}
            onError={(error) => {
              console.error('LTI Launch error:', error);
              setIsLaunchSheetOpen(false);
            }}
          />
        </div>
      );
    }

    // Debug logging to help diagnose issues
    if (currentUnit && currentItem) {
      const unitId = `unit_${currentUnit.sequence}`;
      const itemId = `item_${currentItem.sequence}`;
      console.log("Current unit & item IDs:", unitId, itemId);
      console.log("ContentData structure:", contentData);
      if (contentData?.units?.[unitId]?.items?.[itemId]) {
        console.log("Found content for current item:", contentData.units[unitId].items[itemId]);
      } else {
        console.log("No content found for current item in contentData");
      }
    }

    // Use ContentDisplay component for regular content
    return (
      <div className="bg-gradient-to-br from-white via-blue-50/10 to-indigo-50/20 rounded-lg">
        <ContentDisplay 
          item={currentItem}
          unit={currentUnit}
          contentData={contentData} 
          previewMode={previewMode}
        />
      </div>
    );
  };

  // Handle loading states
  if (loading || creatingInitialSchedule) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50">
        <div className="text-center p-8 bg-white rounded-xl shadow-xl border border-blue-100">
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
          <p className="text-blue-700 font-medium text-lg">
            {creatingInitialSchedule ? 'Creating your personalized schedule...' : 'Loading your course...'}
          </p>
          <p className="text-blue-600/70 mt-2 max-w-sm">
            {creatingInitialSchedule 
              ? 'This may take a moment as we prepare your customized learning path.' 
              : 'We\'re gathering your course materials and progress data.'}
          </p>
        </div>
      </div>
    );
  }

  // Check if we have necessary data to render
  if (!courseData && !previewMode) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-blue-100">
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <p className="text-blue-800 font-medium text-lg">No course data available</p>
          <p className="text-blue-600/70 mt-2">Please select a different course or contact support.</p>
        </div>
      </div>
    );
  }

  const isInitialSchedule = normalizedSchedule?.isInitialSchedule;
  
  // Check if we have either a normalized schedule or a preview schedule
  const hasSchedule = normalizedSchedule || (previewMode && previewSchedule && previewSchedule.units);

  // Determine if we have next/previous items available
  const hasNextItem = currentUnitIndex < units.length - 1 || currentItemIndex < (currentUnit?.items?.length - 1 || 0);
  const hasPrevItem = currentUnitIndex > 0 || currentItemIndex > 0;

  return (
    <div className="h-full flex flex-col min-h-0 bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/30">
      {/* Header */}
      <div className="flex-none bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 active:bg-white/20 rounded-full">
                  <MenuIcon className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85%] sm:w-[540px] p-0 border-r border-blue-100 bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/80">
                <SheetHeader className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 border-b border-blue-400">
                  <SheetTitle className="text-white flex items-center gap-2">
                    <BookOpen className="h-5 w-5" /> 
                    Course Content
                    {previewMode && (
                      <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 border-amber-200">
                        Preview Mode
                      </Badge>
                    )}
                  </SheetTitle>
                </SheetHeader>
                {hasSchedule ? (
                  <CourseNavigation
                    courseTitle={courseTitle}
                    normalizedSchedule={previewMode ? previewSchedule : normalizedSchedule}
                    currentUnitIndex={currentUnitIndex}
                    currentItemIndex={currentItemIndex}
                    calculateProgress={calculateProgress}
                    findScheduleItem={findScheduleItem}
                    isCurrentAssignment={isCurrentAssignment}
                    isLastStartedAssignment={isLastStartedAssignment}
                    onItemSelect={(unitIdx, itemIdx) => {
                      if (unitIdx !== undefined && itemIdx !== undefined) {
                        setCurrentUnitIndex(unitIdx);
                        setCurrentItemIndex(itemIdx);
                        setSheetOpen(false);
                      }
                    }}
                    typeColors={typeColors}
                    studentCourseData={studentCourseData}
                    courseData={courseData}
                    previewMode={previewMode}
                    isInitialSchedule={previewMode ? false : normalizedSchedule?.isInitialSchedule}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full p-6">
                    <div className="text-center p-8 bg-white rounded-lg shadow-md border border-blue-100">
                      <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                      <p className="text-blue-800 font-medium mb-4">No schedule found for this course.</p>
                      {!previewMode && (
                        <Button 
                          onClick={createSchedule} 
                          disabled={creatingInitialSchedule}
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md transition-all duration-200"
                        >
                          {creatingInitialSchedule ? 'Creating Schedule...' : 'Create Schedule'}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-white">{courseTitle || 'Course Viewer'}</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
              <span className="text-sm text-white font-medium">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" /> Viewing Mode
                </span>
              </span>
            </div>
            {!previewMode && (
              <PerformanceSummary
                studentCourseData={studentCourseData}
                courseData={courseData}
              />
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="flex-none px-4 py-2">
          <Alert variant="destructive" className="border-red-200 bg-red-50 shadow-sm">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="font-medium">{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Current Item Info Bar */}
      <div className="flex-none bg-white border-b border-blue-100 px-4 py-2 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`flex items-center justify-center px-3 py-1 rounded-full mr-3 ${typeColors[currentItem?.type] || 'bg-gray-100 text-gray-800'}`}>
              {getItemTypeIcon(currentItem?.type)}
              <span className="ml-1.5 capitalize text-xs font-medium">{currentItem?.type || 'Item'}</span>
            </div>
            <h2 className="font-medium text-blue-800 truncate max-w-md">
              {currentItem?.title || 'No item selected'}
              {previewMode && (
                <Badge variant="outline" className="ml-2 text-xs bg-amber-100 text-amber-800 border-amber-200">
                  Preview
                </Badge>
              )}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={goToPreviousItem}
              disabled={!hasPrevItem}
              size="sm"
              variant="outline"
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button
              onClick={goToNextItem}
              disabled={!hasNextItem}
              size="sm"
              variant="outline"
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto min-h-0">
        <div className="p-4 h-full">
        
          
          {!previewMode && isInitialSchedule && (
            <Alert className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-800 shadow-sm">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertDescription>
                <p className="font-medium">Welcome to your course!</p>
                <p>Click on your first lesson to begin tracking your progress.</p>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Content Cards */}
          <div className="space-y-4 max-w-4xl mx-auto">
            {/* Item Details Card */}
            <Card className="shadow-lg border-blue-100 overflow-hidden rounded-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 py-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-blue-700 flex items-center gap-2">
                      {getItemTypeIcon(currentItem?.type)}
                      {currentItem?.title || 'No item selected'}
                    </CardTitle>
                    {currentItem?.type && (
                      <div className="text-xs text-blue-600 mt-1 capitalize flex items-center gap-1">
                        <span>{currentItem.type}</span>
                        {currentItem.type === 'assignment' && currentItem.multiplier > 1 && (
                          <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-700 border-blue-200">
                            <Star className="w-3 h-3 mr-1" />
                            {currentItem.multiplier}x Weight
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center">
                    {normalizedSchedule && !previewMode && currentItem && (() => {
                      const scheduleItem = findScheduleItem(currentItem);
                      if (scheduleItem && scheduleItem.date) {
                        return (
                          <div className="flex flex-col items-end gap-1">
                            <Badge
                              variant="secondary"
                              className="bg-blue-100 text-blue-700 border-blue-200"
                            >
                              <CalendarDays className="w-3 h-3 mr-1" />
                              {format(parseISO(scheduleItem.date), 'MMM d, yyyy')}
                            </Badge>
                            {scheduleItem.assessmentData && (
                              <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                                Grade: {scheduleItem.assessmentData.scorePercent}%
                              </Badge>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {renderContent()}
              </CardContent>
              <CardFooter className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-t border-blue-100 py-2 px-6">
                <div className="flex items-center justify-between w-full">
                  <Button
                    onClick={goToPreviousItem}
                    disabled={!hasPrevItem}
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:bg-blue-100/50"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <div className="flex items-center text-sm text-blue-700">
                    <span>Unit {currentUnit?.sequence || '?'}</span>
                    <span className="mx-2">•</span>
                    <span>Item {(currentItemIndex + 1) || '?'} of {currentUnit?.items?.length || '?'}</span>
                  </div>
                  <Button
                    onClick={goToNextItem}
                    disabled={!hasNextItem}
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:bg-blue-100/50"
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer with Progress */}
      <div className="h-12 flex-none bg-white border-t border-blue-100 px-6 shadow-inner">
        <div className="flex items-center justify-between h-full max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-700">
                {currentUnit?.name || `Unit ${currentUnit?.sequence || '?'}`}
              </span>
            </div>
          </div>
          {!previewMode && normalizedSchedule && (
            <div className="flex items-center gap-3 w-64">
              <Progress 
                value={calculateProgress()} 
                className="h-2 bg-blue-100" 
                indicatorClassName="bg-gradient-to-r from-blue-500 to-indigo-500" 
              />
              <span className="text-sm font-medium text-blue-700 w-14">
                {calculateProgress()}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernCourseViewer;