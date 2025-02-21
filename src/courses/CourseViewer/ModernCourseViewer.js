import React, { useState, useEffect, useMemo } from 'react';

import { getDatabase, ref, onValue, set } from 'firebase/database';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
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
import { getScheduleData, validateScheduleStructure } from '../../utils/scheduleNormalizer';
import UpdateScheduleSheet from './UpdateScheduleSheet';
import isEqual from 'lodash/isEqual';
import { processScheduleForStorage } from '../../utils/scheduleCompression';

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
  profile,
  studentCourseData: initialStudentCourseData
}) => {
 
  const { user, current_user_email_key } = useAuth();
  const [studentCourseData, setStudentCourseData] = useState(initialStudentCourseData);

  // State
  const [courseData, setCourseData] = useState(null);
 
  const [courseTitle, setCourseTitle] = useState('');
  const [currentUnitIndex, setCurrentUnitIndex] = useState(0);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(true);
  const [contentData, setContentData] = useState(null);
  const [ltiLaunchLoading, setLtiLaunchLoading] = useState(false);
  const [isLaunchSheetOpen, setIsLaunchSheetOpen] = useState(false);
  const [ltiLaunchUrl, setLtiLaunchUrl] = useState(null);
  const [normalizedSchedule, setNormalizedSchedule] = useState(null);
  const [usingSchedule, setUsingSchedule] = useState(false);
  const [previousSchedule, setPreviousSchedule] = useState(null);
  const [scheduleValidationError, setScheduleValidationError] = useState(null);
const [isUpdateScheduleOpen, setIsUpdateScheduleOpen] = useState(false);

  // Derived shortcuts
  const units = useMemo(() => courseData?.units || [], [courseData]);
  const currentUnit = useMemo(
    () => units[currentUnitIndex],
    [units, currentUnitIndex]
  );
  const currentItem = useMemo(
    () => currentUnit?.items?.[currentItemIndex],
    [currentUnit, currentItemIndex]
  );

  const currentItemContent = useMemo(() => {
    if (!contentData || !currentUnit || !currentItem) return null;
    return contentData.units?.[currentUnit.sequence]?.items?.[currentItem.sequence];
  }, [contentData, currentUnit, currentItem]);



  useEffect(() => {
    if (normalizedSchedule && courseData?.units) {
      console.group('Schedule Validation');
      console.log('Normalized Schedule Units:', normalizedSchedule.units);
      console.log('Course Units:', courseData.units);
      const validationResult = validateScheduleStructure(normalizedSchedule, courseData.units);
      console.log('Validation Result:', validationResult);
      console.groupEnd();
  
      if (!validationResult.isValid) {
        setScheduleValidationError(validationResult);
        setIsUpdateScheduleOpen(true);
      } else {
        setScheduleValidationError(null);
        setIsUpdateScheduleOpen(false);
      }
    }
  }, [normalizedSchedule, courseData]);







  // Set up schedule data and listeners
  useEffect(() => {
    if (previewMode || !current_user_email_key || !courseId || !studentCourseData?.LMSStudentID) return;

    console.log('Setting up schedule manager with:', {
      current_user_email_key,
      courseId,
      LMSStudentID: studentCourseData.LMSStudentID
    });

    const scheduleManager = getScheduleData(
      current_user_email_key,
      courseId,
      studentCourseData.LMSStudentID,
      // onUpdate callback (for item-level updates)
      (unitIndex, itemIndex, updatedItem) => {
        setNormalizedSchedule((prev) => {
          if (!prev) return prev;
          const newUnits = [...prev.units];
          newUnits[unitIndex].items[itemIndex] = updatedItem;
          return { ...prev, units: newUnits };
        });
      },
      // onTopLevelDataUpdate
      (newNormalized, newCourse, newStudent) => {
        console.log('Received new normalized schedule:', newNormalized);
        setNormalizedSchedule(newNormalized);
        setCourseData(newCourse);
        setStudentCourseData(newStudent);
        setLoading(false);
      }
    );

    return () => {
      if (scheduleManager?.cleanup) {
        scheduleManager.cleanup();
      }
    };
  }, [previewMode, current_user_email_key, courseId, studentCourseData?.LMSStudentID]);

  // Fetch published content from Firestore
useEffect(() => {
  if (previewMode && previewContent) {
    setContentData(previewContent);
    setLoading(false);
    return;
  }

  // Add safety check for courseId
  if (!courseId) {
    console.error('No courseId provided');
    setLoading(false);
    return;
  }

  const fetchContent = async () => {
    const firestore = getFirestore();
    // Ensure courseId is a string
    const courseIdString = String(courseId);
    const contentRef = doc(firestore, 'courses', courseIdString, 'content', 'published');

    try {
      const docSnap = await getDoc(contentRef);
      if (docSnap.exists()) {
        setContentData(docSnap.data());
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    }
    setLoading(false);
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


  
  useEffect(() => {
    if (previewMode || !current_user_email_key || !courseId || !normalizedSchedule) {
      return;
    }
  
    // Only update if the new schedule is different from the previous one
    if (!isEqual(normalizedSchedule, previousSchedule)) {
      const db = getDatabase();
      const normalizedScheduleRef = ref(
        db,
        `students/${current_user_email_key}/courses/${courseId}/normalizedSchedule`
      );
  
      // Process and compress the schedule data before saving
      const processedSchedule = processScheduleForStorage(normalizedSchedule);
  
      // Update the database with the processed schedule
      set(normalizedScheduleRef, processedSchedule)
        .then(() => {
          // Update our previous schedule reference after successful save
          setPreviousSchedule(normalizedSchedule); // Note: Keep the uncompressed version here
        })
        .catch(error => {
          console.error('Error updating normalized schedule:', error);
        });
    }
  
  }, [normalizedSchedule, current_user_email_key, courseId, previewMode, previousSchedule]);

  // Derived schedule data
  const { schedule, currentAssignmentIndex, lastStartedIndex, sortedScheduleItems } = useMemo(() => {
    if (previewMode || !normalizedSchedule) {
      return {
        schedule: null,
        currentAssignmentIndex: -1,
        lastStartedIndex: -1,
        sortedScheduleItems: [],
      };
    }
    const scheduleData = studentCourseData?.jsonGradebookSchedule;
    if (!scheduleData) {
      return {
        schedule: null,
        currentAssignmentIndex: -1,
        lastStartedIndex: -1,
        sortedScheduleItems: [],
      };
    }
    
    const sortedItems = normalizedSchedule.units
      .flatMap((unit) => unit.items)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      schedule: scheduleData,
      currentAssignmentIndex: scheduleData.adherenceMetrics?.currentAssignmentIndex ?? -1,
      lastStartedIndex: scheduleData.adherenceMetrics?.lastStartedIndex ?? -1,
      sortedScheduleItems: sortedItems,
    };
  }, [studentCourseData, previewMode, normalizedSchedule]);

  // Helper functions
  const findScheduleItem = (item) => {
    if (!schedule || previewMode) return null;
    return sortedScheduleItems.find((schedItem) => schedItem.title === item.title);
  };

  const calculateProgress = () => {
    if (!schedule || previewMode) return 0;
    const completed = sortedScheduleItems.filter((item) => item.completed).length;
    return Math.round((completed / sortedScheduleItems.length) * 100);
  };

  const isCurrentAssignment = (item) => {
    if (previewMode) return false;
    const scheduleItem = findScheduleItem(item);
    if (!scheduleItem) return false;
    return sortedScheduleItems.indexOf(scheduleItem) === currentAssignmentIndex;
  };

  const isLastStartedAssignment = (item) => {
    if (previewMode) return false;
    const scheduleItem = findScheduleItem(item);
    if (!scheduleItem) return false;
    return sortedScheduleItems.indexOf(scheduleItem) === lastStartedIndex;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your course...</p>
        </div>
      </div>
    );
  }

  // Render content based on type
  const renderContent = () => {
    if (currentItem?.lti?.enabled) {
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

    if (currentItemContent) {
      return (
        <div className="prose max-w-none">
          {currentItem.type === 'lesson' && (
            <div
              dangerouslySetInnerHTML={{
                __html: currentItemContent.content,
              }}
            />
          )}
          {currentItem.type === 'assignment' && currentItemContent.questions && (
            <div className="space-y-6">
              {currentItemContent.questions.map((question, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: question.prompt,
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="text-gray-600">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This {currentItem?.type} does not have any content yet.
          </AlertDescription>
        </Alert>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

{scheduleValidationError && (
      <UpdateScheduleSheet
        isOpen={isUpdateScheduleOpen}
        onOpenChange={setIsUpdateScheduleOpen}
        course={{
          CourseID: courseId,
          Course: { Value: courseData?.Title },
          ...courseData
        }}
        validationError={scheduleValidationError}
      />
    )}

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
                  <SheetTitle>Course Content</SheetTitle>
                </SheetHeader>
                {normalizedSchedule ? (
                  <>
                 
                    <CourseNavigation
                      courseTitle={courseTitle}
                      schedule={studentCourseData?.jsonGradebookSchedule}
                      normalizedSchedule={normalizedSchedule}
                      currentUnitIndex={currentUnitIndex}
                      currentItemIndex={currentItemIndex}
                      calculateProgress={calculateProgress}
                      findScheduleItem={findScheduleItem}
                      isCurrentAssignment={isCurrentAssignment}
                      isLastStartedAssignment={isLastStartedAssignment}
                      onItemSelect={(unitIdx, itemIdx) => {
                        setCurrentUnitIndex(unitIdx);
                        setCurrentItemIndex(itemIdx);
                        setSheetOpen(false);
                      }}
                      typeColors={typeColors}
                      studentCourseData={studentCourseData}
                      courseData={courseData}
                      previewMode={previewMode}
                      usingSchedule={usingSchedule}
                    />
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
                      <p className="text-gray-600">Loading course content...</p>
                    </div>
                  </div>
                )}
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <span className={typeColors[currentItem?.type]?.split(' ')[0]}>
                {currentItem?.type && <Info className="h-5 w-5" />}
              </span>
              <h2 className="font-semibold break-words max-w-xl line-clamp-2">
                {currentItem?.title}
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
              {/* Item Header Card */}
              <Card className="border-t-4 shadow-sm">
                <CardContent className="p-6">
                  <div
                    className={`flex items-start gap-4 p-4 rounded-lg ${typeColors[currentItem?.type]}`}
                  >
                    <span className="text-lg mt-1">
                      <Info className="h-5 w-5" />
                    </span>
                    <div className="space-y-1 flex-1">
                      <h3 className="text-xl font-semibold break-words">
                        {currentItem?.title}
                      </h3>
                      {currentItem?.type === 'assignment' && currentItem?.multiplier > 1 && (
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Weighted {currentItem.multiplier}x
                          </span>
                        </div>
                      )}
                      {schedule && !previewMode && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(() => {
                            const scheduleItem = findScheduleItem(currentItem);
                            if (scheduleItem) {
                              return (
                                <div className="space-y-2">
                                  <Badge
                                    variant="secondary"
                                    className={typeColors[currentItem.type]}
                                  >
                                    <CalendarDays className="w-3 h-3 mr-1" />
                                    {format(
                                      parseISO(scheduleItem.date),
                                      'MMM d, yyyy'
                                    )}
                                  </Badge>
                                  {scheduleItem.gradebookData?.grade && (
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline">
                                        Grade: {scheduleItem.gradebookData.grade.percentage}%
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
                  Unit {currentUnit?.sequence} of {units.length}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-sm font-medium text-gray-600">
                  Item {currentItemIndex + 1} of {currentUnit?.items.length}
                </span>
              </div>
            </div>
            {!previewMode && (
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
