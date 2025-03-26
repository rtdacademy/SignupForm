import React, { useState, useEffect, useMemo } from 'react';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../../context/AuthContext';
import { Info, MenuIcon, CalendarDays, Star, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
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
  const [creatingInitialSchedule, setCreatingInitialSchedule] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(true);
  const [contentData, setContentData] = useState(null);
  const [ltiLaunchLoading, setLtiLaunchLoading] = useState(false);
  const [isLaunchSheetOpen, setIsLaunchSheetOpen] = useState(false);
  const [ltiLaunchUrl, setLtiLaunchUrl] = useState(null);
  const [normalizedSchedule, setNormalizedSchedule] = useState(null);
  const [needsInitialSchedule, setNeedsInitialSchedule] = useState(false);

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
  // This now more closely resembles the structure expected by CourseNavigation
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

  // Enhanced Firestore content fetching
  useEffect(() => {
    // Even in preview mode, we want to fetch from published path
    if (!courseId) {
      console.error('No courseId provided');
      return;
    }
  
    // Special case: if previewContent already has the content structure we need
    if (previewMode && previewContent && previewContent.units) {
      console.log("Using provided preview content structure:", previewContent);
      setContentData(previewContent);
      return;
    }
  
    const fetchContent = async () => {
      const firestore = getFirestore();
      // Ensure courseId is a string
      const courseIdString = String(courseId);
      // Always fetch from published path, even in preview mode
      const contentRef = doc(firestore, 'courses', courseIdString, 'content', 'published');
  
      try {
        const docSnap = await getDoc(contentRef);
        if (docSnap.exists()) {
          console.log("Loaded published content from Firestore");
          setContentData(docSnap.data());
        } else {
          console.log("No published content found");
          setContentData(null);
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    };
  
    fetchContent();
  }, [courseId, previewMode, previewContent]);

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

  // Updated renderContent function using ContentDisplay component
  const renderContent = () => {
    if (!currentItem) {
      return (
        <div className="text-gray-600">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
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
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Begin Your Course</h3>
                <p className="text-sm text-gray-500">
                  Click to start this lesson and activate your course progress tracking
                </p>
              </div>
              <Button
                onClick={() => setIsLaunchSheetOpen(true)}
                disabled={ltiLaunchLoading}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Start Lesson
              </Button>
            </div>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
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
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">IMathAS Assessment</h3>
              <p className="text-sm text-gray-500">Click to open the assessment</p>
            </div>
            <Button
              onClick={() => setIsLaunchSheetOpen(true)}
              disabled={ltiLaunchLoading}
              className="flex items-center gap-2"
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

    // Use ContentDisplay component for regular content
    return (
      <ContentDisplay 
    item={currentItem}
    unit={currentUnit}
    contentData={currentItemContent} 
    allContentData={contentData}   
    previewMode={previewMode}
  />
    );
  };

  // Handle loading states
  if (loading || creatingInitialSchedule) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">
            {creatingInitialSchedule ? 'Creating your schedule...' : 'Loading your course...'}
          </p>
        </div>
      </div>
    );
  }

  // Check if we have necessary data to render
  if (!courseData && !previewMode) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">No course data available</p>
        </div>
      </div>
    );
  }

  const isInitialSchedule = normalizedSchedule?.isInitialSchedule;
  
  // Check if we have either a normalized schedule or a preview schedule
  const hasSchedule = normalizedSchedule || (previewMode && previewSchedule && previewSchedule.units);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="h-16 border-b border-gray-200 bg-white">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                  <MenuIcon className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85%] sm:w-[540px] p-0">
                <SheetHeader className="px-4 py-2">
                  <SheetTitle>
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
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">No schedule found for this course.</p>
                      {!previewMode && (
                        <Button onClick={createSchedule} disabled={creatingInitialSchedule}>
                          {creatingInitialSchedule ? 'Creating Schedule...' : 'Create Schedule'}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <span className={typeColors[currentItem?.type]?.split(' ')[0] || ''}>
                {currentItem?.type && <Info className="h-5 w-5" />}
              </span>
              <h2 className="font-semibold break-words max-w-xl line-clamp-2">
                {currentItem?.title || 'No item selected'}
                {previewMode && (
                  <Badge variant="outline" className="ml-2 text-xs bg-amber-100 text-amber-800 border-amber-200">
                    Preview
                  </Badge>
                )}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!previewMode && (
              <PerformanceSummary
                studentCourseData={studentCourseData}
                courseData={courseData}
              />
            )}
            <Separator orientation="vertical" className="h-8" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {previewMode && (
                <Alert className="mb-6 bg-amber-50 border-amber-200 text-amber-800">
                  <Info className="h-5 w-5" />
                  <AlertDescription>
                    <p className="font-medium">Preview Mode</p>
                    <p>This is a preview of how students will see your course content.</p>
                  </AlertDescription>
                </Alert>
              )}
              
              {!previewMode && isInitialSchedule && (
                <Alert className="mb-6 bg-blue-50 border-blue-200 text-blue-800">
                  <Info className="h-5 w-5" />
                  <AlertDescription>
                    <p className="font-medium">Welcome to your course!</p>
                    <p>Click on your first lesson to begin tracking your progress.</p>
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Item Header Card */}
              <Card className="border-t-4 shadow-sm">
                <CardContent className="p-6">
                  <div
                    className={`flex items-start gap-4 p-4 rounded-lg ${typeColors[currentItem?.type] || ''}`}
                  >
                    <span className="text-lg mt-1">
                      <Info className="h-5 w-5" />
                    </span>
                    <div className="space-y-1 flex-1">
                      <h3 className="text-xl font-semibold break-words">
                        {currentItem?.title || 'No item selected'}
                      </h3>
                      {currentItem?.type === 'assignment' && currentItem?.multiplier > 1 && (
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Weighted {currentItem.multiplier}x
                          </span>
                        </div>
                      )}
                      {normalizedSchedule && !previewMode && currentItem && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(() => {
                            const scheduleItem = findScheduleItem(currentItem);
                            if (scheduleItem && scheduleItem.date) {
                              return (
                                <div className="space-y-2">
                                  <Badge
                                    variant="secondary"
                                    className={typeColors[currentItem.type] || ''}
                                  >
                                    <CalendarDays className="w-3 h-3 mr-1" />
                                    {format(
                                      parseISO(scheduleItem.date),
                                      'MMM d, yyyy'
                                    )}
                                  </Badge>
                                  {scheduleItem.assessmentData && (
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline">
                                        Grade: {scheduleItem.assessmentData.scorePercent}%
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Main Content Card */}
              <Card>
                <CardContent className="p-6">{renderContent()}</CardContent>
              </Card>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="h-16 border-t border-gray-200 bg-white px-6 flex-shrink-0">
          <div className="flex items-center justify-between h-full max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">
                  Unit {currentUnit?.sequence || '?'} of {units.length}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-sm font-medium text-gray-600">
                  Item {(currentItemIndex + 1) || '?'} of {currentUnit?.items?.length || '?'}
                </span>
              </div>
            </div>
            {!previewMode && normalizedSchedule && (
              <div className="flex items-center gap-3 w-64">
                <Progress value={calculateProgress()} className="h-2" />
                <span className="text-sm font-medium text-gray-600 w-14">
                  {calculateProgress()}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernCourseViewer;