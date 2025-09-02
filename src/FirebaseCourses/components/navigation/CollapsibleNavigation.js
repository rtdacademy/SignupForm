import React, { useEffect, useMemo, useState } from 'react';
import { 
  BookOpen, 
  ClipboardCheck,
  FileText,
  Lightbulb,
  Award,
  CheckCircle,
  Info,
  PlayCircle,
  ChevronRight,
  ChevronLeft,
  X,
  Menu,
  TrendingUp,
  TrendingDown,
  // SEQUENTIAL_ACCESS_UPDATE: Added Lock icon for lesson access control
  Lock,
  RefreshCw,
  AlertCircle,
  MessageSquare,
  Eye,
  EyeOff
} from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { toast } from 'sonner';
import { useAuth } from '../../../context/AuthContext';
// SEQUENTIAL_ACCESS_UPDATE: Auth utilities moved to parent component
// Keeping isUserAuthorizedDeveloper for the developer banner
import { 
  isUserAuthorizedDeveloper
} from '../../utils/authUtils';
// Import grade calculation utilities for session-based scoring
import { shouldUseSessionBasedScoring } from '../../utils/gradeCalculations';
import { formatScore } from '../../utils/gradeUtils';
import { 
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '../../../components/ui/accordion';
import { Badge } from '../../../components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../components/ui/tooltip';
import { Button } from '../../../components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '../../../components/ui/sheet';

// Type-specific styling
const typeColors = {
  lesson: 'bg-blue-100 text-blue-800 border-blue-200',
  assignment: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  exam: 'bg-purple-100 text-purple-800 border-purple-200',
  info: 'bg-amber-100 text-amber-800 border-amber-200',
};

const typeIcons = {
  lesson: <BookOpen className="h-3 w-3" />,
  assignment: <ClipboardCheck className="h-3 w-3" />,
  exam: <FileText className="h-3 w-3" />,
  info: <Lightbulb className="h-3 w-3" />,
};

// Fix for unit sections
const getUnitSection = (unit) => {
  return unit.section || "";
};

/**
 * Collapsible navigation component for Firebase courses
 */
const CollapsibleNavigation = ({
  courseTitle,
  unitsList = [],
  progress = {},
  activeItemId,
  onItemSelect,
  expanded = true,
  onToggleExpand,
  currentUnitIndex = 0,
  course,
  isMobile = false,
  // SEQUENTIAL_ACCESS_UPDATE: Added props for lesson access control
  // Original props (before sequential access): courseTitle, unitsList, progress, activeItemId, onItemSelect, expanded, onToggleExpand, currentUnitIndex, course, isMobile
  isStaffView = false,
  devMode = false,
  lessonAccessibility = {},
  isDeveloperModeActive = false,
}) => {
  const { user, currentUser } = useAuth();
  
  // Check if current user is an authorized developer
  const isAuthorizedDeveloper = isUserAuthorizedDeveloper(currentUser, course);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Display debugging information about the course structure
  useEffect(() => {
    if (course) {
    }
  }, [course, unitsList]);

  // Process units by section or course code
  const sectionedUnits = useMemo(() => {
    // Prioritize course.courseDetails['course-config'].courseStructure.units, then fallback to legacy paths
    const effectiveUnitsList = course?.courseDetails?.['course-config']?.courseStructure?.units ||
      course?.Gradebook?.courseStructure?.units ||
      unitsList ||
      course?.courseDetails?.courseStructure?.structure ||
      [];

    // Check if this course has multiple course codes
    const courseCodes = new Set(effectiveUnitsList
      .map(unit => unit.courseCode)
      .filter(code => code && code !== 'SECTION2_EXAM' && code !== 'FINAL_EXAM')
    );
    const hasMultipleCourses = courseCodes.size > 1;

    // Initialize sections
    const sections = {"": [], "1": [], "2": [], "3": []};

    effectiveUnitsList.forEach((unit, index) => {
      let sectionKey;
      
      if (hasMultipleCourses && unit.courseCode) {
        // Use course code as section key for multi-course structures
        sectionKey = unit.courseCode;
      } else {
        // Use traditional section numbering for single-course structures
        sectionKey = getUnitSection(unit);
      }
      
      if (!sections[sectionKey]) {
        sections[sectionKey] = [];
      }
      sections[sectionKey].push({...unit, index});
    });

    // Remove empty sections
    Object.keys(sections).forEach(key => {
      if (sections[key].length === 0) {
        delete sections[key];
      }
    });

    return { sections, hasMultipleCourses };
  }, [unitsList, course]);
  
  // Flatten all course items for progress calculations
  const allCourseItems = useMemo(() => {
    const items = [];

    // Prioritize course.courseDetails['course-config'].courseStructure.units, then fallback to legacy paths
    const effectiveUnitsList = course?.courseDetails?.['course-config']?.courseStructure?.units ||
      course?.Gradebook?.courseStructure?.units ||
      unitsList ||
      course?.courseDetails?.courseStructure?.structure ||
      [];

    effectiveUnitsList.forEach(unit => {
      if (unit.items && Array.isArray(unit.items)) {
        items.push(...unit.items);
      }
    });
    return items;
  }, [unitsList, course]);
  
  // Calculate overall progress percentage using new gradebook structure
  const overallProgress = useMemo(() => {
    if (!allCourseItems.length) return 0;
    
    // Count completed items directly from course.Gradebook.items
    const completedCount = allCourseItems.filter(item => {
      const itemGradeData = course?.Gradebook?.items?.[item.itemId];
      return itemGradeData?.completed === true || 
             itemGradeData?.status === 'completed' || 
             itemGradeData?.status === 'manually_graded';
    }).length;
    
    return Math.round((completedCount / allCourseItems.length) * 100);
  }, [allCourseItems, course]);

  // SEQUENTIAL_ACCESS_UPDATE: Now receives lesson accessibility as a prop from parent
  // Original code (before sequential access): Only had overallProgress calculation above
  // Note: lessonAccessibility is now calculated in the parent component (FirebaseCourseWrapperImproved)
  // and passed as a prop to avoid duplicate calculations and ensure consistency
  
  // Handle refresh button click
  const handleRefresh = async () => {
    // Enhanced debug logging
    console.log('🔍 CollapsibleNavigation Refresh Debug:', {
      course: course,
      courseKeys: course ? Object.keys(course) : 'course is null/undefined',
      user: user,
      userKeys: user ? Object.keys(user) : 'user is null/undefined'
    });
    
    // Check for courseId in multiple possible field names
    const courseIdValue = course?.courseId || course?.CourseID || course?.id;
    
    if (!courseIdValue || !user?.email) {
      console.log('❌ Refresh blocked - Debug info:', {
        courseIdValue,
        courseFields: {
          courseId: course?.courseId,
          CourseID: course?.CourseID,
          id: course?.id
        },
        userEmail: user?.email,
        coursePresent: !!course,
        userPresent: !!user,
        courseObject: course,
        userObject: user
      });
      toast.error('Unable to refresh - missing course or user information');
      return;
    }

    setIsRefreshing(true);
    
    try {
      const functions = getFunctions();
      const trackLessonAccess = httpsCallable(functions, 'trackLessonAccess');
      
      console.log('🔄 Refreshing gradebook structure for course:', courseIdValue);
      console.log('🔄 Sending data to trackLessonAccess:', {
        courseId: courseIdValue,
        lessonId: activeItemId || 'refresh_trigger',
        studentEmail: user.email,
        lessonInfo: {
          title: 'Gradebook Structure Refresh',
          type: 'system',
          purpose: 'refresh'
        }
      });
      
      // Use trackLessonAccess to trigger gradebook initialization
      // This function will call initializeGradebook if the gradebook doesn't exist
      const result = await trackLessonAccess({
        courseId: courseIdValue,
        lessonId: activeItemId || 'refresh_trigger',
        studentEmail: user.email,
        lessonInfo: {
          title: 'Gradebook Structure Refresh',
          type: 'system',
          purpose: 'refresh'
        }
      });
      
      console.log('✅ Gradebook refresh result:', result.data);
      
      toast.success('Course structure refreshed successfully');
      
      // Trigger a page reload to ensure all components get the updated data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error refreshing gradebook:', error);
      toast.error(`Failed to refresh course structure: ${error.message || 'Unknown error'}`);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Helper function to check if an item has teacher comments
  const hasTeacherComments = (itemId) => {
    if (!course?.TeacherComments || !itemId) return false;
    
    // First try to get the questionId from the gradebook course config
    let questionId = itemId; // fallback to original itemId
    
    try {
      // Look up the questionId for this itemId in the gradebook configuration
      const itemStructure = course?.courseDetails?.['course-config']?.gradebook?.itemStructure?.[itemId];
      if (itemStructure?.questions?.[0]?.questionId) {
        questionId = itemStructure.questions[0].questionId;
      }
    } catch (error) {
      console.warn(`Could not resolve questionId for itemId: ${itemId}`, error);
    }
    
    // Check if this item has any teacher comments using the resolved questionId
    const itemComments = course.TeacherComments[questionId];
    if (!itemComments) {
      // Also try with the original itemId as fallback
      const fallbackComments = course.TeacherComments[itemId];
      if (!fallbackComments) return false;
      
      // Check all comment types for fallback
      return Object.values(fallbackComments).some(comment => 
        comment && typeof comment === 'object' && comment.content && comment.content.trim()
      );
    }
    
    // Check all comment types for this item
    return Object.values(itemComments).some(comment => 
      comment && typeof comment === 'object' && comment.content && comment.content.trim()
    );
  };

  const renderItem = (item, unitIndex, itemIndex) => {
    // Look up the scheduled date from course.ScheduleJSON
    let scheduledDate = null;
    
    if (course?.ScheduleJSON?.units) {
      // Search through all units and items to find matching itemId
      for (const unit of course.ScheduleJSON.units) {
        if (unit.items) {
          const matchingItem = unit.items.find(scheduleItem => scheduleItem.itemId === item.itemId);
          if (matchingItem && matchingItem.date) {
            scheduledDate = matchingItem.date;
            break;
          }
        }
      }
    }
    
    // Get student email for session-based scoring
    const studentEmail = currentUser?.email || user?.email;
    
    // Use the pre-calculated grade data from course.Gradebook.items (backend handles all calculations)
    const gradeData = course?.Gradebook?.items?.[item.itemId];
    
    // Extract values directly from the gradebook (no complex calculation needed)
    let lessonPercentage = gradeData?.percentage || 0;
    let lessonScore = gradeData?.score || 0;
    let lessonTotal = gradeData?.total || 0;
    let attemptedQuestions = gradeData?.attempted || 0;
    let totalQuestions = lessonTotal > 0 ? lessonTotal : 0; // Use total as proxy for question count when available
    const isSessionBased = gradeData?.source === 'session';
    // For session-based items, check if they have been completed to determine session count
    const sessionCount = isSessionBased && gradeData?.completed ? 1 : 0;
    const scoringStrategy = gradeData?.strategy || null;
    
    // Check if this should be session-based but has no gradebook entry
    const shouldBeSessionBased = shouldUseSessionBasedScoring(item.itemId, course);
    const hasNoSessions = shouldBeSessionBased && !gradeData;
    
    // No calculation errors with direct gradebook access
    const hasCalculationError = false;
    
    // Determine completion based on progression requirements if available
    let isCompleted = false;
    if (gradeData && course?.courseDetails?.['course-config']?.progressionRequirements?.enabled) {
      const progressionRequirements = course.courseDetails['course-config'].progressionRequirements;
      const lessonOverride = progressionRequirements.lessonOverrides?.[item.itemId] || progressionRequirements.lessonOverrides?.[item.itemId.replace(/-/g, '_')];
      
      // Get item type from the course item
      const itemType = item.type || 'lesson';
      
      // Get default criteria for this item type, with proper fallback
      const typeDefaultCriteria = progressionRequirements.defaultCriteria?.[itemType] || {};
      const generalDefaultCriteria = progressionRequirements.defaultCriteria || {};
      
      // Build criteria based on item type
      let criteria = {};
      
      if (itemType === 'assignment' || itemType === 'exam' || itemType === 'quiz') {
        criteria = {
          sessionsRequired: lessonOverride?.sessionsRequired ?? 
                           typeDefaultCriteria.sessionsRequired ?? 
                           1
        };
        // For session-based items, check if they have completed sessions
        const examSessions = course?.ExamSessions || {};
        const completedSessions = Object.values(examSessions).filter(session => {
          return session?.examItemId === item.itemId && session?.status === 'completed';
        });
        isCompleted = completedSessions.length >= criteria.sessionsRequired;
      } else if (itemType === 'lab') {
        criteria = {
          requiresSubmission: lessonOverride?.requiresSubmission ?? 
                             typeDefaultCriteria.requiresSubmission ?? 
                             true
        };
        // For labs, check if all questions have been submitted
        if (criteria.requiresSubmission) {
          const assessments = course?.Assessments || {};
          const questions = item.questions || [];
          isCompleted = questions.length > 0 && questions.every(q => 
            assessments.hasOwnProperty(q.questionId)
          );
        } else {
          isCompleted = true; // No submission required
        }
      } else {
        // For lessons or other types
        criteria = {
          minimumPercentage: lessonOverride?.minimumPercentage ?? 
                            typeDefaultCriteria.minimumPercentage ?? 
                            generalDefaultCriteria.minimumPercentage ?? 
                            50,
          requireAllQuestions: lessonOverride?.requireAllQuestions ?? 
                              typeDefaultCriteria.requireAllQuestions ?? 
                              generalDefaultCriteria.requireAllQuestions ?? 
                              true
        };
        
        const completionRate = totalQuestions > 0 ? (attemptedQuestions / totalQuestions) * 100 : 0;
        
        if (isSessionBased) {
          // For session-based items, completion is based on having sessions and meeting minimum score
          isCompleted = sessionCount > 0 && lessonPercentage >= criteria.minimumPercentage;
        } else if (criteria.minimumPercentage === 0 && criteria.requireAllQuestions) {
          // If minimum percentage is 0, only check that all questions are attempted
          isCompleted = completionRate >= 100;
        } else if (criteria.requireAllQuestions) {
          isCompleted = completionRate >= 100 && lessonPercentage >= criteria.minimumPercentage;
        } else {
          isCompleted = lessonPercentage >= criteria.minimumPercentage;
        }
      }
    } else {
      // Use gradebook completion status or percentage-based completion
      isCompleted = gradeData?.completed === true || 
                   gradeData?.status === 'completed' || 
                   gradeData?.status === 'manually_graded' ||
                   lessonPercentage >= 100;
    }
    
    const isActive = activeItemId === item.itemId;
    
    // SEQUENTIAL_ACCESS_UPDATE: Check lesson accessibility
    const accessInfo = lessonAccessibility[item.itemId] || { accessible: true, reason: 'Default access' };
    const isAccessible = accessInfo.accessible;
    
    // Check if lesson is in development
    const isInDevelopment = item.inDevelopment === true;
    
    // Determine if this is the next recommended item
    const hasStarted = attemptedQuestions > 0 || lessonPercentage > 0;
    const isNextItem = !isCompleted && hasStarted;
    
    // Use the calculated lesson percentage
    const gradePercentage = lessonPercentage >= 0 ? lessonPercentage : null;
    
    // Get grade color
    const getGradeColor = (percentage) => {
      if (percentage >= 90) return 'text-green-600';
      if (percentage >= 80) return 'text-blue-600';
      if (percentage >= 70) return 'text-yellow-600';
      if (percentage >= 60) return 'text-orange-600';
      return 'text-red-600';
    };
    
    // SEQUENTIAL_ACCESS_UPDATE: Updated styling and click handler for lesson access control
    // Original styling (before sequential access): Only had isActive, isNextItem, isCompleted states
    const getItemStyling = () => {
      if (accessInfo.isNeverVisible) {
        return 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-60 border border-gray-200';
      }
      if (isInDevelopment && !isAccessible) {
        return 'bg-yellow-100 text-yellow-600 cursor-not-allowed opacity-70 border border-yellow-200';
      }
      if (!isAccessible) {
        return 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60';
      }
      if (isActive) {
        return 'bg-blue-50 border border-blue-200 shadow-sm ring-2 ring-blue-300/50 rounded-md';
      }
      if (accessInfo.isShowAlways) {
        return 'bg-blue-50 border-l-2 border-blue-400 pl-1.5';
      }
      if (isNextItem) {
        return 'bg-purple-50 border-l-2 border-purple-400 pl-1.5';
      }
      if (isCompleted) {
        return 'bg-green-50 border-l-2 border-green-400 pl-1.5';
      }
      return 'hover:bg-gray-50 cursor-pointer';
    };

    return (
      <Tooltip key={`${unitIndex}-${itemIndex}-${item.itemId}`}>
        <TooltipTrigger asChild>
          <div
            className={`p-2 mb-1.5 rounded-md text-sm transition-all duration-200 ${getItemStyling()}`}
            onClick={() => {
              // SEQUENTIAL_ACCESS_UPDATE: Added access control to click handler
              // Original click handler (before sequential access): onClick={() => onItemSelect(item.itemId)}
              if (accessInfo.isNeverVisible) {
                toast.info('This lesson is currently hidden from students');
                return;
              }
              if (isInDevelopment && !isAccessible) {
                toast.info('This lesson is currently being developed. Check back soon!');
                return;
              }
              if (isAccessible) {
                onItemSelect(item.itemId);
                // Close navigation after selecting a lesson
                if (onToggleExpand) {
                  onToggleExpand();
                }
              }
            }}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-2 flex-1">
                <div className="mt-0.5 flex-shrink-0">
                  {/* SEQUENTIAL_ACCESS_UPDATE: Added lock icon for inaccessible lessons */}
                  {/* Original icon logic (before sequential access): Only had isCompleted, isNextItem, and default type icons */}
                  {hasCalculationError ? (
                    <AlertCircle className="text-red-500 h-4 w-4" />
                  ) : accessInfo.isNeverVisible ? (
                    <X className="text-red-500 h-4 w-4" />
                  ) : isInDevelopment && !isAccessible ? (
                    <AlertCircle className="text-yellow-500 h-4 w-4" />
                  ) : !isAccessible ? (
                    <Lock className="text-gray-400 h-4 w-4" />
                  ) : isCompleted ? (
                    <CheckCircle className="text-green-500 h-4 w-4" />
                  ) : isNextItem ? (
                    <PlayCircle className="text-purple-500 h-4 w-4" />
                  ) : (
                    typeIcons[item.type] || <Info className="h-4 w-4" />
                  )}
                </div>
                <span className={`font-medium line-clamp-2 flex-1 ${
                  isActive ? 'text-blue-800 font-semibold' : ''
                }`}>
                  {item.title}
                </span>
                {/* Show overdue indicator dot */}
                {scheduledDate && !isCompleted && (() => {
                  const dueDate = new Date(scheduledDate);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  dueDate.setHours(0, 0, 0, 0);
                  const diffDays = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
                  
                  if (diffDays < 0) {
                    return (
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0" 
                           title="Overdue" />
                    );
                  }
                  if (diffDays === 0) {
                    return (
                      <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" 
                           title="Due today" />
                    );
                  }
                  return null;
                })()}
              </div>
              <div className="flex items-center gap-2 ml-2">
                {/* Visibility override indicators */}
                {accessInfo.isShowAlways && (
                  <Eye className="w-3 h-3 text-blue-500 opacity-60" />
                )}
                {accessInfo.isNeverVisible && (
                  <EyeOff className="w-3 h-3 text-gray-500 opacity-60" />
                )}
                {hasCalculationError ? (
                  <span className="text-xs font-semibold text-red-600">
                    ERROR
                  </span>
                ) : !hasCalculationError && gradePercentage !== null && gradeData && (gradeData.attempted > 0 || gradeData.score > 0 || gradeData.completed) ? (
                  <span className={`text-xs font-semibold ${getGradeColor(gradePercentage)}`}>
                    {formatScore(gradePercentage)}%
                  </span>
                ) : null}
                {!hasCalculationError && isSessionBased && sessionCount > 0 && (
                  <span className="text-xs text-purple-600 font-medium">
                    {sessionCount}x
                  </span>
                )}
                {!isStaffView && hasTeacherComments(item.itemId) && (
                  <div 
                    className="relative cursor-pointer hover:bg-blue-100 rounded p-1 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Navigate to the lesson to see the comment
                      onItemSelect(item.itemId);
                      // Show a helpful toast
                      if (typeof toast !== 'undefined') {
                        toast.info('Comment available');
                      }
                    }}
                    title="Click to view teacher comment"
                  >
                    <MessageSquare className="w-3 h-3 text-blue-600" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                  </div>
                )}
                {isInDevelopment && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs py-0.5 px-2 min-h-0 h-5">
                    Dev
                  </Badge>
                )}
                <Badge
                  className={`${typeColors[item.type] || 'bg-gray-100 text-gray-800'} text-xs py-0.5 px-2 min-h-0 h-5`}
                >
                  {item.type}
                </Badge>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{item.title}</p>
            {/* Show scheduled due date */}
            {scheduledDate && (
              <div className="text-sm">
                <span className="font-medium">Due: </span>
                <span className={(() => {
                  const dueDate = new Date(scheduledDate);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  dueDate.setHours(0, 0, 0, 0);
                  const diffDays = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
                  
                  if (diffDays < 0 && !isCompleted) return "text-red-600 font-medium";
                  if (diffDays === 0) return "text-orange-600 font-medium";
                  if (diffDays === 1) return "text-amber-600";
                  return "text-gray-600";
                })()}>
                  {new Date(scheduledDate).toLocaleDateString(undefined, { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                  {(() => {
                    const dueDate = new Date(scheduledDate);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    dueDate.setHours(0, 0, 0, 0);
                    const diffDays = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
                    
                    if (diffDays === 0) return " (Due today)";
                    if (diffDays === 1) return " (Due tomorrow)";
                    if (diffDays === -1) return " (Due yesterday)";
                    if (diffDays < 0 && !isCompleted) return ` (${Math.abs(diffDays)} days overdue)`;
                    if (diffDays > 0 && diffDays <= 7) return ` (Due in ${diffDays} days)`;
                    return "";
                  })()}
                </span>
              </div>
            )}
            {/* Show calculation error first */}
            {hasCalculationError && (
              <p className="text-sm text-red-600 font-medium">❌ Grade calculation error - missing required data</p>
            )}
            {/* SEQUENTIAL_ACCESS_UPDATE: Added accessibility information to tooltip */}
            {/* Original tooltip (before sequential access): Only showed gradebook info and completion status */}
            {!hasCalculationError && isInDevelopment && !isAccessible && (
              <p className="text-sm text-yellow-600 font-medium">🚧 {accessInfo.reason}</p>
            )}
            {accessInfo.isNeverVisible && (
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600 font-medium">Never Visible</p>
                  <p className="text-xs text-gray-500">This lesson is hidden from students but visible to instructors</p>
                </div>
              </div>
            )}
            {!isAccessible && !isInDevelopment && !accessInfo.isNeverVisible && (
              <>
                <p className="text-sm text-red-600 font-medium">🔒 {accessInfo.reason}</p>
                {accessInfo.requiredPercentage && accessInfo.requiredPercentage > 0 && (
                  <p className="text-xs text-red-500">
                    Requires {accessInfo.requiredPercentage}% to unlock
                  </p>
                )}
              </>
            )}
            {isInDevelopment && isAccessible && (
              <p className="text-sm text-orange-600 font-medium">🔧 Developer Access - In Development</p>
            )}
            {isAccessible && accessInfo.isShowAlways && (
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Always Visible</p>
                  <p className="text-xs text-blue-500">Bypasses all progression requirements</p>
                </div>
              </div>
            )}
            {!hasCalculationError && (
              <>
                {shouldBeSessionBased ? (
                  <>
                    <p className="text-sm font-medium text-purple-600">📊 Session-Based Assessment</p>
                    {hasNoSessions ? (
                      <p className="text-sm text-gray-600">No assessment sessions started yet</p>
                    ) : (
                      <>
                        {gradeData?.completed ? (
                          <>
                            <p className="text-sm">Score: {formatScore(lessonScore)}/{lessonTotal} ({formatScore(gradePercentage || 0)}%)</p>
                            <p className="text-sm">Sessions completed: {sessionCount}</p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm">Status: {gradeData?.status || 'In progress'}</p>
                            <p className="text-sm">Progress: {attemptedQuestions}/{totalQuestions} questions answered ({formatScore(gradePercentage || 0)}%)</p>
                            <p className="text-sm">Total sessions: {sessionCount}</p>
                          </>
                        )}
                        {scoringStrategy && (
                          <p className="text-sm">Scoring: {
                            scoringStrategy === 'takeHighest' ? 'Highest attempt' :
                            scoringStrategy === 'latest' ? 'Most recent attempt' :
                            scoringStrategy === 'average' ? 'Average of all attempts' :
                            scoringStrategy
                          }</p>
                        )}
                      </>
                    )}
                  </>
                ) : (gradeData && (gradeData.attempted > 0 || gradeData.score > 0 || gradeData.completed)) ? (
                  <>
                    {(lessonScore > 0 || attemptedQuestions > 0) && (
                      <>
                        <p className="text-sm">Lesson Score: {lessonScore}/{lessonTotal} ({formatScore(gradePercentage || 0)}%)</p>
                        <p className="text-sm">Questions: {attemptedQuestions}/{totalQuestions} attempted</p>
                      </>
                    )}
                    {gradeData.attempts > 0 && (
                      <>
                        <p className="text-sm">Individual Attempts: {gradeData.attempts}</p>
                        {gradeData.lastAttempt && (
                          <p className="text-sm">Last attempt: {new Date(gradeData.lastAttempt).toLocaleDateString()}</p>
                        )}
                      </>
                    )}
                  </>
                ) : null}
              </>
            )}
            {!isCompleted && isAccessible && (
              <p className="text-sm text-gray-600">Not yet completed</p>
            )}
            {/* Show progression requirements for course progression */}
            {course?.courseDetails?.['course-config']?.progressionRequirements?.enabled && (
              <>
                {(() => {
                  const progressionRequirements = course.courseDetails?.['course-config']?.progressionRequirements;
                  const lessonOverride = progressionRequirements.lessonOverrides?.[item.itemId] || 
                                        progressionRequirements.lessonOverrides?.[item.itemId.replace(/-/g, '_')];
                  
                  // Get item type from the course item
                  const itemType = item.type || 'lesson';
                  
                  // Get default criteria for this item type, with proper fallback
                  const typeDefaultCriteria = progressionRequirements.defaultCriteria?.[itemType] || {};
                  const generalDefaultCriteria = progressionRequirements.defaultCriteria || {};
                  
                  // Generate requirement text based on item type
                  if (itemType === 'assignment' || itemType === 'exam' || itemType === 'quiz') {
                    const sessionsRequired = lessonOverride?.sessionsRequired ?? 
                                           typeDefaultCriteria.sessionsRequired ?? 
                                           1;
                    
                    // Check current session count
                    const examSessions = course?.ExamSessions || {};
                    const completedSessions = Object.values(examSessions).filter(session => {
                      return session?.examItemId === item.itemId && session?.status === 'completed';
                    });
                    const currentSessions = completedSessions.length;
                    
                    return (
                      <p className="text-xs text-blue-600 mt-1">
                        📋 Need {sessionsRequired} session{sessionsRequired > 1 ? 's' : ''} to unlock next lesson
                        {currentSessions > 0 && ` (${currentSessions}/${sessionsRequired} completed)`}
                      </p>
                    );
                  } else if (itemType === 'lab') {
                    const requiresSubmission = lessonOverride?.requiresSubmission ?? 
                                             typeDefaultCriteria.requiresSubmission ?? 
                                             true;
                    
                    if (requiresSubmission) {
                      // Check submission status
                      const assessments = course?.Assessments || {};
                      const questions = item.questions || [];
                      const submittedCount = questions.filter(q => 
                        assessments.hasOwnProperty(q.questionId)
                      ).length;
                      
                      return (
                        <p className="text-xs text-blue-600 mt-1">
                          🔬 Submit all lab work to unlock next lesson
                          {questions.length > 0 && ` (${submittedCount}/${questions.length} submitted)`}
                        </p>
                      );
                    } else {
                      return (
                        <p className="text-xs text-blue-600 mt-1">
                          🔬 Lab completion not required
                        </p>
                      );
                    }
                  } else {
                    // For lessons or other types
                    const criteria = {
                      minimumPercentage: lessonOverride?.minimumPercentage ?? 
                                        typeDefaultCriteria.minimumPercentage ?? 
                                        generalDefaultCriteria.minimumPercentage ?? 
                                        50,
                      requireAllQuestions: lessonOverride?.requireAllQuestions ?? 
                                          typeDefaultCriteria.requireAllQuestions ?? 
                                          generalDefaultCriteria.requireAllQuestions ?? 
                                          true
                    };
                    
                    // Generate requirement text
                    let requirementParts = [];
                    
                    // Only show score requirement if minimumPercentage > 0
                    if (criteria.minimumPercentage > 0) {
                      requirementParts.push(`${criteria.minimumPercentage}% score`);
                    }
                    
                    if (criteria.requireAllQuestions) {
                      requirementParts.push('all questions');
                    }
                    
                    // If no score requirement and only completion requirement, use simpler text
                    const requirementText = requirementParts.length > 0 
                      ? requirementParts.join(' + ')
                      : 'completion';
                    
                    return (
                      <p className="text-xs text-blue-600 mt-1">
                        {criteria.minimumPercentage > 0 
                          ? `📊 Need ${requirementText} to unlock next lesson`
                          : `✅ Answer ${requirementText} to unlock next lesson`
                        }
                      </p>
                    );
                  }
                })()}
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  };
  
  // Find current lesson for collapsed view
  const currentLesson = useMemo(() => {
    const effectiveUnitsList = course?.Gradebook?.courseConfig?.courseStructure?.units ||
      course?.Gradebook?.courseStructure?.units ||
      unitsList ||
      course?.courseDetails?.courseStructure?.structure ||
      [];
    
    for (const unit of effectiveUnitsList) {
      if (unit.items) {
        const foundItem = unit.items.find(item => item.itemId === activeItemId);
        if (foundItem) {
          return {
            item: foundItem,
            unit: unit,
            unitIndex: unit.index || effectiveUnitsList.indexOf(unit)
          };
        }
      }
    }
    return null;
  }, [activeItemId, unitsList, course]);

  if (!expanded) {
    return (
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleExpand}
          className="mx-auto mb-4"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        {/* Current lesson indicator at top when collapsed */}
        {currentLesson && (
          <div className="px-2 mb-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 cursor-pointer" onClick={onToggleExpand}>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {currentLesson.unit.sequence || currentLesson.unit.order || currentLesson.unitIndex + 1}
                      </div>
                      <div className="text-xs text-blue-600 font-medium text-center leading-tight line-clamp-2">
                        {currentLesson.item.title.split(' ').slice(0, 3).join(' ')}
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-1">
                        <div className="bg-blue-600 rounded-full h-1 w-3/4"></div>
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <div className="space-y-1">
                    <p className="font-medium">Current Lesson</p>
                    <p className="text-sm">{currentLesson.item.title}</p>
                    <p className="text-xs text-gray-500">
                      {currentLesson.unit.name || currentLesson.unit.title}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

      </div>
    );
  }
  
  // Navigation content component
  const NavigationContent = () => (
    <>
      {/* Developer Access Indicator */}
      {isAuthorizedDeveloper && isDeveloperModeActive && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2 text-xs font-medium flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>DEVELOPER MODE ACTIVE</span>
          </div>
          <span className="opacity-80">• All lessons unlocked • Access restrictions bypassed</span>
        </div>
      )}
      
      {/* Developer Available Indicator */}
      {isAuthorizedDeveloper && !isDeveloperModeActive && (
        <div className="bg-gray-100 text-gray-600 px-3 py-2 text-xs flex items-center gap-2 border-b border-gray-200">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span className="font-medium">Developer Access Available</span>
          </div>
          <span className="opacity-80">• Enable Dev Mode in header to bypass restrictions</span>
        </div>
      )}
      
      <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="font-semibold text-base text-blue-800 flex items-center gap-1 truncate">
          <BookOpen className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{courseTitle}</span>
        </h2>
        <div className="flex items-center gap-1 ml-1 flex-shrink-0">
          {!isMobile && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onToggleExpand} 
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="p-3 bg-white text-sm">
        <div className="font-medium text-gray-700 mb-2">Course Progress</div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className="bg-blue-600 rounded-full h-1.5" 
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>
      
      <div className="flex-1">
        <div className="p-2">
          <TooltipProvider>
            {Object.entries(sectionedUnits.sections)
            .sort(([a, b]) => {
              // Empty section goes last, then sort by section/course code
              if (a === "") return 1;
              if (b === "") return -1;
              
              // If using course codes, sort alphabetically
              if (sectionedUnits.hasMultipleCourses) {
                return a.localeCompare(b);
              }
              
              // Traditional numerical section sorting
              return a.localeCompare(b);
            })
            .map(([sectionKey, sectionUnits]) => (
              <div key={sectionKey} className="mb-4">
                {sectionKey && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-md mb-2 text-xs">
                    <Award className="w-3 h-3 text-blue-600" />
                    <span className="font-medium text-blue-800">
                      {sectionedUnits.hasMultipleCourses ? sectionKey : `Section ${sectionKey}`}
                    </span>
                  </div>
                )}
                
                <Accordion
                  type="multiple"
                  defaultValue={[`unit-${currentUnitIndex}`]}
                  className="space-y-2"
                >
                  {sectionUnits.map((unit) => {
                    // Calculate unit progress using new gradebook data structure
                    const unitItems = unit.items || [];
                    const unitCompletedCount = unitItems.filter(item => {
                      const itemGradeData = course?.Gradebook?.items?.[item.itemId];
                      return itemGradeData?.completed === true || 
                             itemGradeData?.status === 'completed' || 
                             itemGradeData?.status === 'manually_graded';
                    }).length;
                    const unitPercentage = unitItems.length > 0
                      ? Math.round((unitCompletedCount / unitItems.length) * 100)
                      : 0;
                    
                    const isCurrentUnit = unit.index === currentUnitIndex;
                    
                    return (
                      <AccordionItem
                        key={`unit-${unit.sequence || unit.order || unit.index}`}
                        value={`unit-${unit.index}`}
                        className={
                          isCurrentUnit
                            ? 'border border-purple-100 bg-purple-50/30 rounded-md shadow-sm'
                            : 'border border-gray-100 bg-white hover:bg-blue-50/20 rounded-md shadow-sm'
                        }
                      >
                        <AccordionTrigger className="hover:no-underline py-2 px-3">
                          <div className="flex items-center gap-2 w-full">
                            <div className="relative">
                              <div
                                className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs
                                  ${isCurrentUnit ? 'bg-purple-600 text-white' : 'bg-blue-500 text-white'}`}
                              >
                                {unit.sequence || unit.order || unit.index + 1}
                              </div>
                              {/* Show indicator if this unit contains the current lesson */}
                              {currentLesson?.unitIndex === unit.index && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white">
                                  <div className="w-full h-full bg-blue-600 rounded-full animate-pulse"></div>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span
                                  className={`text-sm font-medium ${
                                    isCurrentUnit ? 'text-purple-800' : 'text-blue-800'
                                  }`}
                                >
                                  {unit.name || unit.title || `Section ${unit.sequence || unit.order || unit.index + 1}`}
                                </span>
                                <span className="text-xs text-gray-500 whitespace-nowrap ml-1">
                                  {unitPercentage}%
                                </span>
                              </div>
                              
                              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                <div 
                                  className={`${isCurrentUnit ? 'bg-purple-500' : 'bg-blue-500'} rounded-full h-1`}
                                  style={{ width: `${unitPercentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-2 pb-2 pt-1">
                          {unit.items?.map((item, itemIdx) => {
                            if (!item) return null;
                            // Show all lessons including never visible ones (they'll be greyed out)
                            return renderItem(item, unit.index, itemIdx);
                          })}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            ))}
          </TooltipProvider>
        </div>
      </div>
    </>
  );

  // For mobile devices, wrap in a Sheet
  if (isMobile) {
    return (
      <>
        <Sheet open={expanded} onOpenChange={onToggleExpand}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="fixed bottom-4 right-4 z-50 md:hidden bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 shadow-lg"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:w-[400px] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>{courseTitle} Navigation</SheetTitle>
            </SheetHeader>
            <div className="h-full overflow-y-auto flex flex-col bg-white">
              <NavigationContent />
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // For desktop, return the regular navigation
  return (
    <div className="w-full flex flex-col border-r border-gray-200 bg-white shadow-sm">
      <NavigationContent />
    </div>
  );
};

export default CollapsibleNavigation;