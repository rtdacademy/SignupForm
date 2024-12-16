import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getDatabase, ref, onValue } from 'firebase/database';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { 
  Info,
  MenuIcon,
  CalendarDays,
  Star,
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Separator } from "../../components/ui/separator";
import { ScrollArea } from '../../components/ui/scroll-area';
import { Progress } from '../../components/ui/progress';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../../components/ui/sheet";
import { format, parseISO } from 'date-fns';
import PerformanceSummary from './PerformanceSummary';
import CourseNavigation from './CourseNavigation';

const typeColors = {
  lesson: 'text-blue-600 bg-blue-50 border-blue-200',
  assignment: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  exam: 'text-purple-600 bg-purple-50 border-purple-200',
  info: 'text-gray-600 bg-gray-50 border-gray-200'
};

const ModernCourseViewer = ({ 
  courseId: propsCourseId,
  previewMode = false,
  previewContent = null 
}) => {
  const { courseId: paramsCourseId } = useParams();
  const { current_user_email_key } = useAuth();
  const finalCourseId = propsCourseId || paramsCourseId || '89';
  
  const [courseData, setCourseData] = useState(null);
  const [studentCourseData, setStudentCourseData] = useState(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [currentUnitIndex, setCurrentUnitIndex] = useState(0);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(true);
  const [contentData, setContentData] = useState(null);

  // Fetch course structure and content
  useEffect(() => {
    const db = getDatabase();
    const courseRef = ref(db, `courses/${finalCourseId}`);
    
    const unsubscribeCourse = onValue(courseRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCourseData(data);
        setCourseTitle(data.Title || 'Course Title');
      }
    });

    // If in preview mode, use provided content
    if (previewMode && previewContent) {
      setContentData(previewContent);
      setLoading(false);
      return () => unsubscribeCourse();
    }

    // Fetch published content from Firestore
    const fetchContent = async () => {
      const firestore = getFirestore();
      const contentRef = doc(firestore, 'courses', finalCourseId, 'content', 'published');
      
      try {
        const docSnap = await getDoc(contentRef);
        if (docSnap.exists()) {
          setContentData(docSnap.data());
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    };

    fetchContent();

    // Only fetch student data if not in preview mode
    if (!previewMode) {
      const studentCourseRef = ref(db, `students/${current_user_email_key}/courses/${finalCourseId}`);
      const unsubscribeStudent = onValue(studentCourseRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setStudentCourseData(data);
          setLoading(false);
        }
      });

      return () => {
        unsubscribeCourse();
        unsubscribeStudent();
      };
    }

    return () => unsubscribeCourse();
  }, [finalCourseId, previewMode, previewContent, current_user_email_key]);

  const {
    schedule,
    currentAssignmentIndex,
    lastStartedIndex,
    sortedScheduleItems
  } = useMemo(() => {
    if (previewMode) {
      return {
        schedule: null,
        currentAssignmentIndex: -1,
        lastStartedIndex: -1,
        sortedScheduleItems: []
      };
    }

    const schedule = studentCourseData?.jsonGradebookSchedule;
    if (!schedule) return { schedule: null, currentAssignmentIndex: -1, lastStartedIndex: -1, sortedScheduleItems: [] };

    const sortedItems = schedule.units
      .flatMap(unit => unit.items)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      schedule,
      currentAssignmentIndex: schedule.adherenceMetrics?.currentAssignmentIndex ?? -1,
      lastStartedIndex: schedule.adherenceMetrics?.lastStartedIndex ?? -1,
      sortedScheduleItems: sortedItems
    };
  }, [studentCourseData, previewMode]);

  const units = courseData?.units || [];
  const currentUnit = units[currentUnitIndex];
  const currentItem = currentUnit?.items?.[currentItemIndex];

  // Get content for current item
  const currentItemContent = useMemo(() => {
    if (!contentData || !currentUnit || !currentItem) return null;
    return contentData.units?.[currentUnit.sequence]?.items?.[currentItem.sequence];
  }, [contentData, currentUnit, currentItem]);

  const findScheduleItem = (item) => {
    if (!schedule || previewMode) return null;
    return sortedScheduleItems.find(schedItem => schedItem.title === item.title);
  };

  const calculateProgress = () => {
    if (!schedule || previewMode) return 0;
    const completed = sortedScheduleItems.filter(item => item.completed).length;
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="h-16 border-b border-gray-200 bg-white">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="hover:bg-gray-100"
                >
                  <MenuIcon className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85%] sm:w-[540px] p-0">
                <SheetHeader className="px-4 py-2">
                  <SheetTitle>Course Content</SheetTitle>
                </SheetHeader>
                <CourseNavigation 
                  courseTitle={courseTitle}
                  schedule={schedule}
                  units={units}
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
                />
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
                  <div className={`flex items-start gap-4 p-4 rounded-lg ${typeColors[currentItem?.type]}`}>
                    <span className="text-lg mt-1">
                      <Info className="h-5 w-5" />
                    </span>
                    <div className="space-y-1 flex-1">
                      <h3 className="text-xl font-semibold break-words">{currentItem?.title}</h3>
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
                                  <Badge variant="secondary" className={typeColors[currentItem.type]}>
                                    <CalendarDays className="w-3 h-3 mr-1" />
                                    {format(parseISO(scheduleItem.date), 'MMM d, yyyy')}
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
                <CardContent className="p-6">
                  {currentItemContent ? (
                    <div className="prose max-w-none">
                      {currentItem.type === 'lesson' && (
                        <div dangerouslySetInnerHTML={{ __html: currentItemContent.content }} />
                      )}
                      {currentItem.type === 'assignment' && currentItemContent.questions && (
                        <div className="space-y-6">
                          {currentItemContent.questions.map((question, index) => (
                            <div key={index} className="p-4 border rounded-lg">
                              <div dangerouslySetInnerHTML={{ __html: question.prompt }} />
                              {/* Add question rendering logic here */}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-600">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          This {currentItem?.type} does not have any content yet.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </CardContent>
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