import React, { useMemo, useState, useCallback } from 'react';
import { CheckCircle, Circle, Clock, Target, BookOpen, Award, Lock, Play, Eye, ChevronRight, Unlock, Shield } from 'lucide-react';
import { Progress } from '../../../components/ui/progress';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { 
  validateGradeDataStructures, 
  calculateLessonScore, 
  checkLessonCompletion,
  findAssessmentSessions,
  shouldUseSessionBasedScoring 
} from '../../utils/gradeCalculations';
import { formatScore } from '../../utils/gradeUtils';
import { useAuth } from '../../../context/AuthContext';
import LessonDetailModal from './LessonDetailModal';
import { 
  hasStaffOverridePermissions, 
  setLessonAccessOverride, 
  removeLessonAccessOverride,
  getLessonAccessOverrides 
} from '../../utils/staffOverrides';

const CourseProgress = ({ course, allCourseItems = [], profile, lessonAccessibility = {} }) => {
  const { currentUser } = useAuth();
  // State for lesson detail modal
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for staff overrides
  const [staffOverrides, setStaffOverrides] = useState({});
  const [overrideLoading, setOverrideLoading] = useState({});
  const [overridesLoaded, setOverridesLoaded] = useState(false);
  
  // Get student email for session-based scoring
  const studentEmail = profile?.StudentEmail || currentUser?.email;
  
  // Determine if this is a staff view (teacher looking at student data)
  const isStaffView = currentUser?.email && studentEmail && 
                      currentUser.email !== studentEmail;
                      
  // Check if current user has staff override permissions
  const canOverride = hasStaffOverridePermissions(currentUser);
  
  // Get course ID for override operations
  const courseId = course?.courseId || course?.id;
  
  // Load staff overrides if user has permissions and we're viewing student data
  const loadStaffOverrides = useCallback(async () => {
    if (!canOverride || !studentEmail || !courseId || overridesLoaded) {
      return;
    }
    
    try {
      const overrides = await getLessonAccessOverrides(studentEmail, courseId);
      setStaffOverrides(overrides);
      setOverridesLoaded(true);
    } catch (error) {
      console.error('Failed to load staff overrides:', error);
    }
  }, [canOverride, studentEmail, courseId, overridesLoaded]);

  // Load overrides when component mounts or dependencies change
  React.useEffect(() => {
    loadStaffOverrides();
  }, [loadStaffOverrides]);

  // Handle staff override toggle
  const handleOverrideToggle = useCallback(async (lessonId, currentlyAccessible) => {
    if (!canOverride || !studentEmail || !courseId || !currentUser?.email) {
      return;
    }
    
    setOverrideLoading(prev => ({ ...prev, [lessonId]: true }));
    
    try {
      const newAccessible = !currentlyAccessible;
      
      if (newAccessible) {
        // Grant access
        const success = await setLessonAccessOverride(
          studentEmail, 
          courseId, 
          lessonId, 
          true, 
          currentUser.email,
          'Staff override - Access granted'
        );
        
        if (success) {
          setStaffOverrides(prev => ({
            ...prev,
            [lessonId]: {
              accessible: true,
              overriddenBy: currentUser.email,
              overrideDate: Date.now(),
              reason: 'Staff override - Access granted'
            }
          }));
        }
      } else {
        // Remove access override (revert to normal progression)
        const success = await removeLessonAccessOverride(
          studentEmail, 
          courseId, 
          lessonId, 
          currentUser.email
        );
        
        if (success) {
          setStaffOverrides(prev => {
            const newOverrides = { ...prev };
            delete newOverrides[lessonId];
            return newOverrides;
          });
        }
      }
    } catch (error) {
      console.error('Failed to toggle override:', error);
    } finally {
      setOverrideLoading(prev => ({ ...prev, [lessonId]: false }));
    }
  }, [canOverride, studentEmail, courseId, currentUser]);
  
  // Validate that we have the required data structures
  const validation = validateGradeDataStructures(course);
  
  const gradebook = course?.Gradebook || {};
  const courseStructure = gradebook?.courseStructure || {};
  const grades = course?.Grades?.assessments || {}; // Use reliable grades source
  const assessments = course?.Assessments || {};
  const itemStructure = gradebook?.courseConfig?.gradebook?.itemStructure || {};
  const progressionRequirements = gradebook?.courseConfig?.progressionRequirements || {};
  
  // Show error state if validation fails
  if (!validation.valid) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <h3 className="text-lg font-medium text-yellow-800">Progress Data Loading</h3>
          </div>
          <p className="text-yellow-700 text-sm">
            Progress tracking is loading. Missing: {validation.missing.join(', ')}
          </p>
        </div>
      </div>
    );
  }

  // Use the passed allCourseItems for consistent data with navigation
  const courseItemsProgress = useMemo(() => {
    // Use allCourseItems passed from parent for consistency with navigation
    if (allCourseItems.length === 0) {
      return [];
    }
    
    // Process ALL course items (lessons, assignments, exams, labs, etc.) not just lessons
    // Since allCourseItems is already in the correct order from the wrapper, we can use that
    const items = allCourseItems.map((courseItem, globalIndex) => {
      const lessonId = courseItem.itemId;
      
      // Use the studentEmail defined above for consistent checking
      
      // Use reliable calculation function for lesson scores with student email for session-based scoring
      const lessonScore = calculateLessonScore(lessonId, course, studentEmail);
      
      // Check if lesson meets completion requirements
      const isCompleted = checkLessonCompletion(lessonId, course, studentEmail);
      
      // Check if this should be session-based
      const shouldBeSessionBased = shouldUseSessionBasedScoring(lessonId, course);
      const isSessionBased = lessonScore.source === 'session';
      const sessionCount = lessonScore.sessionsCount || 0;
      const hasNoSessions = shouldBeSessionBased && sessionCount === 0;
      
      // Calculate completion rate and status based on assessment type
      let completionRate = 0;
      let status = 'not_started';
      
      if (shouldBeSessionBased) {
        // For session-based assessments, use session data for status
        if (sessionCount > 0) {
          // Use the session progress information from the lesson score calculation
          const sessionStatus = lessonScore.sessionStatus;
          const sessionProgress = lessonScore.sessionProgress || 0;
          
          if (sessionStatus === 'completed') {
            status = isCompleted ? 'completed' : 'in_progress';
            completionRate = 100; // Session was completed
          } else if (sessionStatus === 'in_progress' || sessionStatus === 'exited') {
            status = 'in_progress';
            // Use actual progress based on answered questions
            completionRate = sessionProgress;
          }
        }
        // If no sessions, status remains 'not_started' and completionRate remains 0
      } else {
        // For individual question-based items, use question progress
        completionRate = lessonScore.totalQuestions > 0 ? 
          (lessonScore.attempted / lessonScore.totalQuestions) * 100 : 0;
        
        if (lessonScore.attempted > 0) {
          status = isCompleted ? 'completed' : 'in_progress';
        }
      }
      
      // Use the same lesson accessibility as navigation for consistency
      const accessInfo = lessonAccessibility[lessonId] || { accessible: false, reason: 'Access not determined' };
      const isUnlocked = accessInfo.accessible;
      
      // Check for staff override
      const override = staffOverrides[lessonId];
      const hasStaffOverride = !!override;
      const overrideAccessible = override?.accessible;
      
      // Global item number: 1, 2, 3, 4, 5... across all units
      const itemNumber = globalIndex + 1;
      
      // Get detailed question information if configured
      const normalizedLessonId = lessonId.replace(/-/g, '_');
      const lessonConfig = itemStructure[normalizedLessonId];
      const questions = [];
      let lastActivity = 0;
      let totalAttempts = 0;
      
      // Find session data for assignments, exams, and quizzes
      let sessionData = null;
      const sessionTypes = ['assignment', 'exam', 'quiz'];
      if (sessionTypes.includes(courseItem.type) && studentEmail) {
        const sessions = findAssessmentSessions(lessonId, course, studentEmail);
        if (sessions.length > 0) {
          sessionData = {
            sessions: sessions,
            sessionCount: sessions.length,
            latestSession: sessions[0], // Sessions are sorted by completion time (newest first)
            hasMultipleAttempts: sessions.length > 1
          };
        }
      }
      
      // If lesson is configured, get detailed question data
      if (lessonConfig && lessonConfig.questions) {
        lessonConfig.questions.forEach(questionConfig => {
          const questionId = questionConfig.questionId;
          const actualGrade = grades[questionId] || 0;
          const assessmentData = assessments[questionId];
          const maxPoints = questionConfig.points || 0;
          
          // Track last activity from assessment submission
          if (assessmentData?.lastSubmission?.timestamp > lastActivity) {
            lastActivity = assessmentData.lastSubmission.timestamp;
          }
          
          // Count attempts
          if (grades.hasOwnProperty(questionId)) {
            totalAttempts += assessmentData?.attempts || 1;
          }
          
          // Add question to lesson with complete data
          questions.push({
            id: questionId,
            title: questionConfig.title || questionId,
            points: maxPoints,
            actualGrade: actualGrade,
            attempted: grades.hasOwnProperty(questionId),
            assessmentData: assessmentData
          });
        });
      }
      
      return {
        lessonId: lessonId,
        lessonNumber: itemNumber,
        lessonTitle: courseItem.title || `${courseItem.type || 'Item'} ${itemNumber}`,
        activityType: courseItem.type || 'lesson',
        contentPath: courseItem.contentPath || lessonId,
        questions: questions,
        totalQuestions: lessonScore.totalQuestions,
        completedQuestions: lessonScore.attempted,
        totalScore: lessonScore.score,
        maxScore: lessonScore.total,
        completionRate: completionRate,
        averageScore: lessonScore.percentage,
        status: status,
        totalAttempts: totalAttempts,
        lastActivity: lastActivity,
        isConfigured: !!lessonConfig,
        sessionData: sessionData,
        isUnlocked: isUnlocked,
        meetsRequirements: isCompleted,
        valid: lessonScore.valid,
        // Session-based information
        shouldBeSessionBased: shouldBeSessionBased,
        isSessionBased: isSessionBased,
        sessionCount: sessionCount,
        hasNoSessions: hasNoSessions,
        scoringStrategy: lessonScore.strategy || null,
        sessionStatus: lessonScore.sessionStatus || null,
        // Staff override information
        hasStaffOverride: hasStaffOverride,
        overrideAccessible: overrideAccessible,
        overrideData: override
      };
    });
    
    return items;
  }, [allCourseItems, course, itemStructure, grades, assessments, profile, lessonAccessibility, studentEmail, staffOverrides]);

  // Calculate overall stats based on all course items
  const stats = useMemo(() => {
    const total = courseItemsProgress.length;
    const completed = courseItemsProgress.filter(item => item.status === 'completed').length;
    const inProgress = courseItemsProgress.filter(item => item.status === 'in_progress').length;
    const notStarted = total - completed - inProgress;
    const completionPercentage = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      completed,
      inProgress,
      notStarted,
      completionPercentage
    };
  }, [courseItemsProgress]);

  // Find next item to work on
  const nextItem = courseItemsProgress.find(item => item.isUnlocked && item.status !== 'completed');

  // Modal handlers
  const handleViewDetails = (item) => {
    setSelectedLesson(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLesson(null);
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">Course Progress</h3>
            <p className="text-sm text-gray-600">Your journey through {
              course?.Gradebook?.courseConfig?.courseStructure?.title || 
              course?.Gradebook?.courseStructure?.title || 
              courseStructure.title || 
              'this course'
            }</p>
          </div>
          <BookOpen className="h-8 w-8 text-green-600" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <ProgressStat 
            icon={<CheckCircle className="h-4 w-4 text-green-600" />}
            label="Items Completed"
            value={stats.completed}
            total={stats.total}
            color="green"
          />
          <ProgressStat 
            icon={<Clock className="h-4 w-4 text-yellow-600" />}
            label="In Progress"
            value={stats.inProgress}
            total={stats.total}
            color="yellow"
          />
          <ProgressStat 
            icon={<Circle className="h-4 w-4 text-gray-400" />}
            label="Not Started"
            value={stats.notStarted}
            total={stats.total}
            color="gray"
          />
          <ProgressStat 
            icon={<Target className="h-4 w-4 text-blue-600" />}
            label="Overall"
            value={formatScore(stats.completionPercentage)}
            suffix="%"
            color="blue"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Course Items Completed</span>
            <span>{stats.completed} / {stats.total} ({formatScore(stats.completionPercentage)}%)</span>
          </div>
          <Progress value={stats.completionPercentage} className="h-3" />
        </div>
        
        {stats.completionPercentage === 100 && (
          <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Congratulations! Course completed!</span>
          </div>
        )}
      </div>

      {/* Course Items Progress Table */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-700">Course Items Progress</h4>
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course Item
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Questions
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Access
                  </th>
                  {canOverride && (
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staff Override
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courseItemsProgress.map((item) => (
                  <LessonProgressRow 
                    key={item.lessonId} 
                    lesson={item} 
                    onViewDetails={() => handleViewDetails(item)}
                    canOverride={canOverride}
                    onOverrideToggle={handleOverrideToggle}
                    overrideLoading={overrideLoading[item.lessonId] || false}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Lesson Detail Modal */}
      <LessonDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        lesson={selectedLesson}
        course={course}
        isStaffView={isStaffView}
      />
    </div>
  );
};

// Progress Stat Component
const ProgressStat = ({ icon, label, value, total, suffix = '', color }) => (
  <div className={`bg-${color}-50 rounded-lg p-3 border border-${color}-100`}>
    <div className="flex items-center gap-2 mb-1">
      {icon}
      <span className="text-xs font-medium text-gray-600">{label}</span>
    </div>
    <div className={`text-lg font-bold text-${color}-700`}>
      {value}{suffix}
      {total && <span className="text-sm text-gray-500 font-normal"> / {total}</span>}
    </div>
  </div>
);

// Lesson Progress Row Component
const LessonProgressRow = ({ lesson, onViewDetails, canOverride, onOverrideToggle, overrideLoading }) => {
  const getStatusIcon = () => {
    // For session-based assessments, use session status
    if (lesson.shouldBeSessionBased && lesson.sessionCount > 0) {
      if (lesson.sessionStatus === 'completed') {
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      } else if (lesson.sessionStatus === 'in_progress' || lesson.sessionStatus === 'exited') {
        return <Clock className="h-5 w-5 text-yellow-500" />;
      }
      return <Circle className="h-5 w-5 text-gray-400" />;
    }
    
    // For individual question-based items, use traditional status
    if (lesson.status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (lesson.status === 'in_progress') {
      return <Clock className="h-5 w-5 text-yellow-500" />;
    }
    return <Circle className="h-5 w-5 text-gray-400" />;
  };

  const getAccessIcon = () => {
    if (lesson.isUnlocked) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <Lock className="h-4 w-4 text-gray-400" />;
  };

  const getProgressColor = (rate) => {
    if (rate === 100) return 'bg-green-500';
    if (rate >= 50) return 'bg-yellow-500';
    if (rate > 0) return 'bg-blue-500';
    return 'bg-gray-300';
  };

  // Handle row click to open details modal
  const handleRowClick = () => {
    // Only check if configured - the modal has fallback logic to fetch questions
    if (lesson.isConfigured) {
      onViewDetails();
    }
  };

  // Determine if row should be clickable - only needs to be configured
  const isClickable = lesson.isConfigured;

  return (
    <tr 
      className={`${
        lesson.isUnlocked 
          ? isClickable
            ? 'hover:bg-blue-50 cursor-pointer transition-colors duration-150 hover:shadow-sm' 
            : 'hover:bg-gray-50'
          : 'bg-gray-50 opacity-60'
      } ${isClickable ? 'group' : ''}`}
      onClick={handleRowClick}
      title={isClickable ? 'Click to view details' : undefined}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="text-xs font-medium text-gray-500 bg-gray-100 rounded px-2 py-1">
            {lesson.lessonNumber.toString().padStart(2, '0')}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-gray-900">
                {lesson.lessonTitle}
              </div>
              {isClickable && (
                <Eye className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-150" 
                     title="Click to view details" />
              )}
            </div>
            <div className="text-xs text-gray-500">{lesson.activityType}</div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 text-center">
        <div className="flex justify-center">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getProgressColor(lesson.completionRate)}`}
              style={{ width: `${lesson.completionRate}%` }}
            ></div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 text-center">
        {lesson.shouldBeSessionBased ? (
          // Session-based assessment display
          lesson.hasNoSessions ? (
            <div className="text-sm text-gray-400">
              No sessions
            </div>
          ) : (
            <div>
              <div className="text-sm text-gray-600">
                {lesson.sessionCount} session{lesson.sessionCount !== 1 ? 's' : ''}
              </div>
              <div className="text-xs text-gray-500">
                {lesson.scoringStrategy === 'takeHighest' ? 'Highest score' :
                 lesson.scoringStrategy === 'latest' ? 'Latest attempt' :
                 lesson.scoringStrategy === 'average' ? 'Average score' :
                 'Session-based'}
              </div>
            </div>
          )
        ) : (
          // Individual question-based display
          <div className="text-sm text-gray-600">
            {lesson.completedQuestions} / {lesson.totalQuestions}
          </div>
        )}
      </td>
      
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          {getStatusIcon()}
          <span className="text-xs text-gray-600 capitalize">
            {lesson.shouldBeSessionBased && lesson.sessionCount > 0 ? (
              // Show actual session status for session-based assessments
              lesson.sessionStatus === 'completed' ? 'Completed' :
              lesson.sessionStatus === 'in_progress' ? 'In Progress' :
              lesson.sessionStatus === 'exited' ? 'Exited' :
              lesson.sessionStatus || 'Unknown'
            ) : (
              // Show traditional status for individual question-based items
              lesson.status === 'completed' ? 'Completed' : 
              lesson.status === 'in_progress' ? 'In Progress' : 'Not Started'
            )}
          </span>
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          {getAccessIcon()}
          <span className="text-xs text-gray-600">
            {lesson.isUnlocked ? 'Unlocked' : 'Locked'}
          </span>
          {isClickable && lesson.isUnlocked && (
            <ChevronRight className="h-3 w-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-150 ml-1" />
          )}
        </div>
      </td>
      
      {canOverride && (
        <td className="px-6 py-4">
          <div className="flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant={lesson.hasStaffOverride ? "destructive" : "outline"}
              onClick={() => onOverrideToggle(lesson.lessonId, lesson.hasStaffOverride ? lesson.overrideAccessible : lesson.isUnlocked)}
              disabled={overrideLoading}
              className="h-8 w-8 p-0"
              title={
                lesson.hasStaffOverride 
                  ? `Remove override (Currently: ${lesson.overrideAccessible ? 'Accessible' : 'Restricted'})` 
                  : `Override access (Currently: ${lesson.isUnlocked ? 'Unlocked' : 'Locked'})`
              }
            >
              {overrideLoading ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : lesson.hasStaffOverride ? (
                <Shield className="h-4 w-4" />
              ) : lesson.isUnlocked ? (
                <Lock className="h-4 w-4" />
              ) : (
                <Unlock className="h-4 w-4" />
              )}
            </Button>
            {lesson.hasStaffOverride && (
              <div className="text-xs text-orange-600 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span>Override</span>
              </div>
            )}
          </div>
        </td>
      )}
    </tr>
  );
};

// Helper Functions - Now simplified since we get lesson info from itemStructure
const formatLessonNumber = (lessonKey) => {
  // Extract lesson number from key like "01_physics_20_review" -> "01"
  const match = lessonKey.match(/^(\d+)/);
  return match ? match[1] : '00';
};

const formatLessonTitle = (title, lessonNumber) => {
  if (!title) {
    return `Lesson ${lessonNumber}`;
  }
  
  // If title doesn't already include lesson number, add it
  if (!title.toLowerCase().includes('lesson')) {
    return `Lesson ${lessonNumber}: ${title}`;
  }
  
  return title;
};

export default CourseProgress;