import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { formatScore } from '../../utils/gradeUtils';
import { functions } from '../../../firebase';
import { httpsCallable } from 'firebase/functions';
import { getDatabase, ref, update, get, remove } from 'firebase/database';
import { sanitizeEmail } from '../../../utils/sanitizeEmail';

// Helper function to format timestamps in a friendly format
const formatFriendlyDate = (timestamp) => {
  if (!timestamp) return null;
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  // If it's today
  if (diffDays === 0) {
    if (diffHours === 0) {
      if (diffMinutes === 0) {
        return 'Just now';
      } else if (diffMinutes === 1) {
        return '1 minute ago';
      } else {
        return `${diffMinutes} minutes ago`;
      }
    } else if (diffHours === 1) {
      return '1 hour ago';
    } else {
      return `${diffHours} hours ago`;
    }
  }
  // If it's yesterday
  else if (diffDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  // If it's within the last week
  else if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  // Otherwise, show the full date
  else {
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
};

import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  RotateCcw,
  ChevronRight,
  Plus,
  Loader2,
  Edit3,
  Trash2,
  UserCheck,
  PenTool,
  X,
  Check,
  AlertCircle,
  Shield,
  AlertTriangle,
  Calendar,
  CalendarDays,
  CalendarCheck
} from 'lucide-react';
import { 
  checkLessonCompletion,
  findAssessmentSessions,
  shouldUseSessionBasedScoring 
} from '../../utils/gradeCalculations';

// Helper function to get due date status and styling
const getDueDateStatus = (scheduledDate, isCompleted = false) => {
  if (!scheduledDate) return null;
  
  const dueDate = new Date(scheduledDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
  
  // If completed, show success styling regardless of due date
  if (isCompleted) {
    return {
      status: 'completed',
      text: 'Completed',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: CheckCircle,
      priority: 0 // Lowest priority for sorting
    };
  }
  
  // Overdue (red - highest priority)
  if (diffDays < 0) {
    const daysOverdue = Math.abs(diffDays);
    return {
      status: 'overdue',
      text: daysOverdue === 1 ? 'Due yesterday' : `${daysOverdue} days overdue`,
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: AlertTriangle,
      priority: 4
    };
  }
  
  // Due today (orange - high priority)
  if (diffDays === 0) {
    return {
      status: 'due-today',
      text: 'Due today',
      textColor: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      icon: Clock,
      priority: 3
    };
  }
  
  // Due tomorrow (amber - medium-high priority)
  if (diffDays === 1) {
    return {
      status: 'due-tomorrow',
      text: 'Due tomorrow',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      icon: CalendarDays,
      priority: 2
    };
  }
  
  // Due within 3 days (yellow - medium priority)
  if (diffDays <= 3) {
    return {
      status: 'due-soon',
      text: `${diffDays} days`,
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      icon: CalendarCheck,
      priority: 1
    };
  }
  
  // Future dates (gray - low priority)
  return {
    status: 'future',
    text: `${diffDays} days`,
    textColor: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: Calendar,
    priority: 0
  };
};

import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import LessonDetailModal from './LessonDetailModal';

/**
 * Helper function to update session final results directly in Firebase
 * This replaces the cloud function call for immediate updates
 */
const updateSessionFinalResultsDirectly = async (studentEmail, courseId, sessionId, newScore, maxScore) => {
  const database = getDatabase();
  const sessionPath = `students/${sanitizeEmail(studentEmail)}/courses/${courseId}/ExamSessions/${sessionId}/finalResults`;
  
  const updatedResults = {
    score: newScore,
    maxScore: maxScore,
    percentage: (newScore / maxScore) * 100,
    status: "manually_graded"
  };
  
  await update(ref(database, sessionPath), updatedResults);
};

/**
 * AssessmentGrid component that accepts enriched course data as props
 * instead of importing createAllCourseItems utility.
 * 
 * This approach enables real-time Firebase updates from the parent component.
 */
const AssessmentGridProps = ({ 
  enrichedCourseItems, 
  course, 
  profile, 
  onReviewAssessment,
  loading = false,
  error = null 
}) => {
  const { currentUser } = useAuth();
  
  
  // Extract data from props instead of course object
  const itemStructure = course?.courseDetails?.['course-config']?.gradebook?.itemStructure || {};
  const actualGrades = course?.Grades?.assessments || course?.Grades || {};
  const assessments = course?.Assessments || {};
  
  // Get student email for session-based scoring
  const studentEmail = profile?.StudentEmail || currentUser?.email;
  
  // Determine if this is a staff view (teacher looking at student data)
  const isStaffView = currentUser?.email && studentEmail && 
                      currentUser.email !== studentEmail;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('order');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creatingSessionFor, setCreatingSessionFor] = useState(null);
  const [editingTeacherScore, setEditingTeacherScore] = useState(null);
  const [teacherScoreValue, setTeacherScoreValue] = useState('');
  const [updatingTeacherScore, setUpdatingTeacherScore] = useState(false);
  
  // Use enriched course items directly from props
  const allCourseItems = enrichedCourseItems || [];

  // Handle grade updates from the modal - now just a callback since parent handles realtime updates
  const handleModalGradeUpdate = useCallback((questionId, newGrade, lessonId) => {
    // In the prop-based approach, we don't need to manage local state
    // The parent component's realtime listeners will automatically update the data
    // and re-render this component with the new data
  }, []);

  // Process enriched course items into lessons for UI display
  const groupedLessons = useMemo(() => {
    if (allCourseItems.length === 0) {
      return [];
    }
    
    const lessons = [];
    
    // Process all course items - data is already enriched with gradebook and schedule info
    allCourseItems.forEach((courseItem, globalIndex) => {
      // Check if lesson meets completion requirements
      const isCompleted = checkLessonCompletion(courseItem.itemId, course, studentEmail);
      
      // Check if this should be session-based but has no sessions
      const shouldBeSessionBased = shouldUseSessionBasedScoring(courseItem.itemId, course);
      const isSessionBased = courseItem.source === 'session';
      const sessionCount = courseItem.sessionsCount || 0;
      const hasNoSessions = shouldBeSessionBased && sessionCount === 0;
      
      // Calculate completion rate and status
      const completionRate = courseItem.total > 0 ? 
        (courseItem.attempted / courseItem.total) * 100 : 0;
      
      let status = 'not_started';
      
      // Special handling for lab-type assessments
      if (courseItem.type === 'lab') {
        // For labs, check if there's a submission in course.Assessments
        const normalizedLessonId = courseItem.itemId.replace(/-/g, '_');
        const lessonConfig = itemStructure[normalizedLessonId];
        const questionId = lessonConfig?.questions?.[0]?.questionId;
        
        if (questionId && course?.Assessments?.[questionId]) {
          const labSubmission = course.Assessments[questionId];
          // Lab is submitted if there's assessment data
          if (labSubmission.status === 'completed' || labSubmission.status === 'submitted') {
            status = 'completed';
          } else {
            status = 'in_progress';
          }
        } else if (courseItem.attempted > 0 || courseItem.score > 0) {
          // Fallback: if there's a grade but no submission data, consider it completed
          status = 'completed';
        }
      } else if (shouldBeSessionBased) {
        // For session-based items, status depends on sessions
        if (sessionCount > 0) {
          status = isCompleted ? 'completed' : 'in_progress';
        }
      } else {
        // For individual question items, status depends on attempts and completion
        if (courseItem.attempted > 0) {
          // Check if all questions are completed (attempted === total for lessons)
          if (courseItem.attempted === courseItem.total) {
            status = 'completed';
          } else {
            status = 'in_progress';
          }
        }
      }
      
      // Global lesson number: 1, 2, 3, 4, 5... across all units (same as CourseProgress)
      const lessonNumber = globalIndex + 1;
      
      // Get detailed question information if configured
      const normalizedLessonId = courseItem.itemId.replace(/-/g, '_');
      const lessonConfig = itemStructure[normalizedLessonId];
      const questions = [];
      // Get last activity from course data
      let lastActivity = null;
      
      // Check if this is a session-based item (assignments, exams, quizzes)
      const sessionTypes = ['assignment', 'exam', 'quiz'];
      if (sessionTypes.includes(courseItem.type) && course?.ExamSessions) {
        // For session-based items, look in ExamSessions
        const examSessions = course.ExamSessions;
        const lessonSessions = Object.values(examSessions).filter(session => 
          session.examItemId === courseItem.itemId
        );
        
        if (lessonSessions.length > 0) {
          const allTimestamps = lessonSessions.flatMap(session => [
            session.completedAt,
            session.lastUpdated,
            session.createdAt,
            session.startTime,
            session.endTime
          ].filter(timestamp => timestamp && timestamp > 0));
          
          if (allTimestamps.length > 0) {
            lastActivity = Math.max(...allTimestamps);
          }
        }
      } else if (course?.Assessments) {
        // For individual question items (lessons, labs), look in Assessments
        const assessments = course.Assessments;
        
        // Get all assessment keys that belong to this lesson/lab
        const relevantAssessments = [];
        
        if (courseItem.type === 'lab') {
          // For labs, look for direct lab assessment
          const labAssessmentKey = Object.keys(assessments).find(key => 
            key.includes(courseItem.itemId) || assessments[key].labId === courseItem.itemId
          );
          if (labAssessmentKey && assessments[labAssessmentKey]) {
            relevantAssessments.push(assessments[labAssessmentKey]);
          }
        } else {
          // For lessons, look for questions that belong to this lesson
          const lessonPrefix = courseItem.itemId.replace(/-/g, '_');
          Object.entries(assessments).forEach(([key, assessment]) => {
            if (key.startsWith(lessonPrefix) || key.includes(lessonPrefix)) {
              relevantAssessments.push(assessment);
            }
          });
        }
        
        // Get the most recent timestamp from all relevant assessments
        if (relevantAssessments.length > 0) {
          const allTimestamps = relevantAssessments.flatMap(assessment => [
            assessment.lastSubmission?.timestamp,
            assessment.timestamp,
            assessment.lastModified,
            assessment.submittedAt
          ].filter(timestamp => timestamp && timestamp > 0));
          
          if (allTimestamps.length > 0) {
            lastActivity = Math.max(...allTimestamps);
          }
        }
      }
      
      let totalAttempts = 0;
      let teacherSessionCount = 0;
      
      // Find session data for assignments, exams, and quizzes
      let sessionData = null;
      if (sessionTypes.includes(courseItem.type) && studentEmail) {
        const sessions = findAssessmentSessions(courseItem.itemId, course, studentEmail);
        if (sessions.length > 0) {
          // Count student sessions and teacher sessions separately
          const studentSessions = sessions.filter(session => !session.isTeacherCreated);
          const teacherSessions = sessions.filter(session => session.isTeacherCreated === true);
          totalAttempts = studentSessions.length;
          teacherSessionCount = teacherSessions.length;
          
          sessionData = {
            sessions: sessions,
            sessionCount: sessions.length,
            studentSessionCount: studentSessions.length,
            teacherSessionCount: teacherSessions.length,
            latestSession: sessions[0], // Sessions are sorted by completion time (newest first)
            hasMultipleAttempts: sessions.length > 1
          };
        }
      }
      
      // If lesson is configured, get detailed question data
      if (lessonConfig && lessonConfig.questions) {
        // For non-session based assessments, count attempts differently
        if (!sessionTypes.includes(courseItem.type)) {
          // For regular lessons, consider it 1 attempt if any questions are attempted
          const attemptedQuestions = lessonConfig.questions.filter(q => 
            actualGrades.hasOwnProperty(q.questionId)
          );
          if (attemptedQuestions.length > 0) {
            totalAttempts = 1;
          }
        }
        
        lessonConfig.questions.forEach(questionConfig => {
          const questionId = questionConfig.questionId;
          const actualGrade = actualGrades[questionId] || 0;
          const assessmentData = assessments[questionId];
          const maxPoints = questionConfig.points || 0;
          
          // Add question to lesson with complete data
          questions.push({
            id: questionId,
            title: questionConfig.title || questionId,
            points: maxPoints,
            actualGrade: actualGrade,
            attempted: actualGrades.hasOwnProperty(questionId),
            assessmentData: assessmentData
          });
        });
      }
      
      // Schedule data is already available in enriched courseItem
      const scheduledDate = courseItem.scheduledDate;
      
      const lesson = {
        lessonId: courseItem.itemId,
        lessonNumber: lessonNumber,
        lessonTitle: courseItem.title || `Lesson ${lessonNumber}`,
        activityType: courseItem.type || 'lesson',
        questions: questions,
        totalQuestions: courseItem.total,
        completedQuestions: courseItem.attempted,
        totalScore: courseItem.score,
        maxScore: courseItem.total,
        averageScore: courseItem.percentage,
        completionRate: completionRate,
        status: status,
        totalAttempts: totalAttempts,
        teacherSessionCount: teacherSessionCount,
        lastActivity: lastActivity,
        isConfigured: courseItem.hasGradebookData || !!lessonConfig, // Show scores if we have gradebook data OR lesson config
        sessionData: sessionData, // Include session data for assignments/exams/quizzes
        // Session-based scoring information
        shouldBeSessionBased: shouldBeSessionBased,
        isSessionBased: isSessionBased,
        sessionCount: sessionCount,
        hasNoSessions: hasNoSessions,
        scoringStrategy: courseItem.strategy || null,
        sessionStatus: courseItem.sessionStatus || null,
        // Add scheduled date if available (from enriched data)
        scheduledDate: scheduledDate
      };
      
      lessons.push(lesson);
    });
    
    return lessons;
  }, [allCourseItems, course, studentEmail, itemStructure, actualGrades, assessments]);

  // Filter and sort lessons
  const filteredLessons = useMemo(() => {
    let lessons = [...groupedLessons];

    // Apply search filter
    if (searchTerm) {
      lessons = lessons.filter(lesson =>
        lesson.lessonTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.lessonId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.activityType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      lessons = lessons.filter(lesson => lesson.activityType === filterType);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      lessons = lessons.filter(lesson => {
        if (filterStatus === 'completed') return lesson.status === 'completed';
        if (filterStatus === 'in_progress') return lesson.status === 'in_progress';
        if (filterStatus === 'not_started') return lesson.status === 'not_started';
        return true;
      });
    }

    // Apply sorting
    lessons.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'order':
          // Use lesson number for proper sequential ordering
          comparison = a.lessonNumber - b.lessonNumber;
          break;
        case 'lesson':
          // Also use lesson number instead of lessonId
          comparison = a.lessonNumber - b.lessonNumber;
          break;
        case 'date':
          comparison = (b.lastActivity || 0) - (a.lastActivity || 0);
          break;
        case 'score':
          comparison = (b.averageScore || 0) - (a.averageScore || 0);
          break;
        case 'title':
          comparison = (a.lessonTitle || '').localeCompare(b.lessonTitle || '');
          break;
        case 'type':
          comparison = (a.activityType || '').localeCompare(b.activityType || '');
          break;
        default:
          // Default to maintaining original order
          comparison = a.lessonNumber - b.lessonNumber;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return lessons;
  }, [groupedLessons, searchTerm, filterType, filterStatus, sortBy, sortOrder]);

  // Show loading state
  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
        <p className="text-gray-500">Loading course data...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
        <p className="text-red-700 font-medium">Error loading course data</p>
        <p className="text-red-600 text-sm mt-2">{error}</p>
      </div>
    );
  }

  // Show empty state
  if (allCourseItems.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-500">No course items available yet. Course structure may still be loading.</p>
      </div>
    );
  }

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleViewDetails = (lesson) => {
    setSelectedLesson(lesson);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLesson(null);
  };

  const handleCreateSession = async (lesson) => {
    if (!isStaffView || !studentEmail) {
      console.error('Cannot create session: not in staff view or no student email');
      return;
    }

    setCreatingSessionFor(lesson.lessonId);

    try {
      // Get lesson configuration from itemStructure using the current data structure path
      const normalizedLessonId = lesson.lessonId.replace(/-/g, '_');
      const itemStructure = course?.courseDetails?.['course-config']?.gradebook?.itemStructure || {};
      const lessonConfig = itemStructure[normalizedLessonId] || itemStructure[lesson.lessonId];
      
      if (!lessonConfig || !lessonConfig.questions) {
        throw new Error(`No lesson configuration found for ${lesson.lessonId}`);
      }

      // Extract course ID from the current course context
      const courseId = course?.courseDetails?.courseId || course?.id;
      if (!courseId) {
        throw new Error('Course ID not found');
      }

      console.log('Creating optimized teacher session for:', {
        lessonId: lesson.lessonId,
        studentEmail,
        courseId,
        questionsCount: lessonConfig.questions.length,
        maxScore: lesson.maxScore
      });

      // Use the optimized teacher session cloud function
      const createTeacherSessionFunction = httpsCallable(functions, 'createTeacherSession');
      
      const sessionResult = await createTeacherSessionFunction({
        courseId: courseId,
        assessmentItemId: lesson.lessonId,
        studentEmail: studentEmail,
        questionsCount: lessonConfig.questions.length, // Just count, not full question data
        maxScore: lesson.maxScore, // Pass max score directly
        initialScore: 0 // Start with 0 score - teacher can set it manually
      });

      console.log('Teacher session created:', sessionResult.data);
      
      // Brief delay to show completion and allow real-time listener to update
      setTimeout(() => {
        setCreatingSessionFor(null);
        // The parent's real-time listeners should handle the data update automatically
      }, 1000); // Slightly longer delay to ensure data propagation
      
    } catch (error) {
      console.error('Error creating teacher session:', error);
      alert(`Failed to create teacher session: ${error.message}`);
      setCreatingSessionFor(null);
    }
  };

  const handleCreateSessionDirect = async (lesson) => {
    if (!isStaffView || !studentEmail || !currentUser?.email) {
      console.error('Cannot create session: missing required data');
      return;
    }

    setCreatingSessionFor(lesson.lessonId);

    try {
      const courseId = course?.courseDetails?.courseId || course?.id;
      const timestamp = Date.now();

      // Create teacher session object
      const teacherSession = {
        completedAt: timestamp,
        countsTowardAttempts: false,
        courseId: parseInt(courseId),
        createdAt: timestamp,
        examItemId: lesson.lessonId,
        finalResults: {
          completedAt: timestamp,
          maxScore: lesson.maxScore || lesson.totalQuestions || 10,
          percentage: 0,
          score: 0,
          status: "manually_graded",
          totalQuestions: lesson.totalQuestions || lesson.maxScore || 10
        },
        isTeacherCreated: true,
        status: "completed",
        studentEmail: studentEmail,
        teacherEmail: currentUser.email,
        useAsManualGrade: true
      };


      // Create session directly in Firebase
      const database = getDatabase();
      const sessionTimestamp = Date.now();
      const sessionId = `exam_${lesson.lessonId}_${sanitizeEmail(studentEmail)}_${sessionTimestamp}`;
      const sessionPath = `students/${sanitizeEmail(studentEmail)}/courses/${courseId}/ExamSessions/${sessionId}`;
      
      await update(ref(database, sessionPath), teacherSession);

      
      setCreatingSessionFor(null);
      // Parent's realtime listeners will handle the data updates
      
    } catch (error) {
      console.error('Error creating teacher session:', error);
      alert(`Failed to create teacher session: ${error.message}`);
      setCreatingSessionFor(null);
    }
  };

  const handleEditTeacherScore = (lesson) => {
    setEditingTeacherScore(lesson);
    setTeacherScoreValue(lesson.totalScore.toString());
  };

  const handleSaveTeacherScore = async () => {
    if (!editingTeacherScore || !studentEmail) {
      return;
    }

    const newScore = parseFloat(teacherScoreValue) || 0;
    const maxScore = editingTeacherScore.maxScore;

    if (newScore < 0 || newScore > maxScore) {
      alert(`Score must be between 0 and ${maxScore}`);
      return;
    }

    setUpdatingTeacherScore(true);

    try {
      // Find the teacher session for this lesson
      const sanitizedEmail = studentEmail.replace(/[.#$[\]]/g, ',');
      const sessionsRef = ref(getDatabase(), `students/${sanitizedEmail}/courses/${course?.courseDetails?.courseId || course?.id}/ExamSessions`);
      const sessionsSnapshot = await get(sessionsRef);
      const allSessions = sessionsSnapshot.val() || {};
      
      // Find teacher-created session for this item
      let teacherSessionId = null;
      for (const [sessionId, sessionData] of Object.entries(allSessions)) {
        if (sessionData.examItemId === editingTeacherScore.lessonId && 
            sessionData.isTeacherCreated === true &&
            sessionData.useAsManualGrade === true) {
          teacherSessionId = sessionId;
          break;
        }
      }

      if (!teacherSessionId) {
        throw new Error('Teacher session not found');
      }


      // Update session score directly in Firebase
      await updateSessionFinalResultsDirectly(
        studentEmail,
        course?.courseDetails?.courseId || course?.id,
        teacherSessionId,
        newScore,
        maxScore
      );

      
      // Close the editing interface
      setEditingTeacherScore(null);
      setTeacherScoreValue('');
      // Parent's realtime listeners will handle the data updates
      
    } catch (error) {
      console.error('Error updating teacher score:', error);
      alert(`Failed to update score: ${error.message}`);
    } finally {
      setUpdatingTeacherScore(false);
    }
  };

  const handleCancelEditTeacherScore = () => {
    setEditingTeacherScore(null);
    setTeacherScoreValue('');
  };

  const handleDeleteTeacherSession = async (lesson) => {
    if (!isStaffView || !studentEmail) {
      return;
    }

    try {
      // Find the teacher session for this lesson
      const sanitizedEmail = studentEmail.replace(/[.#$[\]]/g, ',');
      const sessionsRef = ref(getDatabase(), `students/${sanitizedEmail}/courses/${course?.courseDetails?.courseId || course?.id}/ExamSessions`);
      const sessionsSnapshot = await get(sessionsRef);
      const allSessions = sessionsSnapshot.val() || {};
      
      // Find teacher-created session for this item
      let teacherSessionId = null;
      for (const [sessionId, sessionData] of Object.entries(allSessions)) {
        if (sessionData.examItemId === lesson.lessonId && 
            sessionData.isTeacherCreated === true &&
            sessionData.useAsManualGrade === true) {
          teacherSessionId = sessionId;
          break;
        }
      }

      if (!teacherSessionId) {
        alert('No teacher session found to delete');
        return;
      }


      // Delete session directly from Firebase
      const database = getDatabase();
      const sessionPath = `students/${sanitizeEmail(studentEmail)}/courses/${course?.courseDetails?.courseId || course?.id}/ExamSessions/${teacherSessionId}`;
      await remove(ref(database, sessionPath));

      // Parent's realtime listeners will handle the data updates
      
    } catch (error) {
      console.error('Error deleting teacher session:', error);
      alert(`Failed to delete teacher session: ${error.message}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search lessons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="lesson">Lessons</SelectItem>
            <SelectItem value="assignment">Assignments</SelectItem>
            <SelectItem value="exam">Exams</SelectItem>
            <SelectItem value="lab">Labs</SelectItem>
            <SelectItem value="project">Projects</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="not_started">Not Started</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600 flex items-center gap-4">
        <span>Showing {filteredLessons.length} of {groupedLessons.length} lessons</span>
        <div className={`inline-flex items-center gap-1 text-xs ${course?._isRealtimeData ? 'text-green-600' : 'text-orange-600'}`}>
          <div className={`w-2 h-2 rounded-full ${course?._isRealtimeData ? 'bg-green-500' : 'bg-orange-500'}`}></div>
          {course?._isRealtimeData ? 'Real-time active' : 'Loading...'}
        </div>
        {course?._lastRealtimeUpdate && (
          <span className="text-xs text-gray-400">
            Updated: {new Date(course._lastRealtimeUpdate).toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Assessment Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('lesson')}
                >
                  <div className="flex items-center gap-1">
                    Lesson
                    <SortIcon field="lesson" currentSort={sortBy} sortOrder={sortOrder} />
                  </div>
                </th>
                <th 
                  className="w-48 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('score')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Score
                    <SortIcon field="score" currentSort={sortBy} sortOrder={sortOrder} />
                  </div>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLessons.map((lesson) => (
                <LessonRow 
                  key={lesson.lessonId}
                  lesson={lesson}
                  course={course}
                  onViewDetails={() => handleViewDetails(lesson)}
                  isStaffView={isStaffView}
                  onCreateSession={handleCreateSessionDirect}
                  creatingSessionFor={creatingSessionFor}
                  editingTeacherScore={editingTeacherScore}
                  teacherScoreValue={teacherScoreValue}
                  setTeacherScoreValue={setTeacherScoreValue}
                  updatingTeacherScore={updatingTeacherScore}
                  onEditTeacherScore={handleEditTeacherScore}
                  onSaveTeacherScore={handleSaveTeacherScore}
                  onCancelEditTeacherScore={handleCancelEditTeacherScore}
                  onDeleteTeacherSession={handleDeleteTeacherSession}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredLessons.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No lessons match your filters.
        </div>
      )}

      {/* Lesson Detail Modal */}
      <LessonDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        lesson={selectedLesson}
        course={course}
        isStaffView={isStaffView}
        onGradeUpdate={handleModalGradeUpdate}
      />
    </div>
  );
};

// Helper function to get progress bar color
const getProgressColor = (rate) => {
  if (rate === 100) return 'bg-green-500';
  if (rate >= 50) return 'bg-yellow-500';
  if (rate > 0) return 'bg-blue-500';
  return 'bg-gray-300';
};

// Helper function for score color
const getScoreColor = (pct) => {
  if (pct >= 90) return 'text-green-700 bg-green-50';
  if (pct >= 80) return 'text-blue-700 bg-blue-50';
  if (pct >= 70) return 'text-yellow-700 bg-yellow-50';
  if (pct >= 60) return 'text-orange-700 bg-orange-50';
  return 'text-red-700 bg-red-50';
};

// Helper function to get status badge for session-based items and labs
const getStatusBadge = (lesson) => {
  // Handle session-based items
  if (lesson.shouldBeSessionBased && lesson.sessionCount > 0) {
    if (lesson.sessionStatus === 'completed') {
      return (
        <div className="flex items-center justify-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <Badge className="bg-green-100 text-green-800 text-xs">Submitted</Badge>
        </div>
      );
    } else if (lesson.sessionStatus === 'in_progress' || lesson.sessionStatus === 'exited') {
      return (
        <div className="flex items-center justify-center gap-2">
          <RotateCcw className="h-4 w-4 text-yellow-500" />
          <Badge className="bg-yellow-100 text-yellow-800 text-xs">In Progress</Badge>
        </div>
      );
    }
  }
  
  // Handle labs - submitted if any progress > 0
  if (lesson.activityType === 'lab') {
    if (lesson.completionRate > 0) {
      return (
        <div className="flex items-center justify-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <Badge className="bg-green-100 text-green-800 text-xs">Submitted</Badge>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <Badge className="bg-gray-100 text-gray-600 text-xs">Not Started</Badge>
        </div>
      );
    }
  }
  
  // Not started or no sessions (for session-based items)
  return (
    <div className="flex items-center justify-center gap-2">
      <Clock className="h-4 w-4 text-gray-400" />
      <Badge className="bg-gray-100 text-gray-600 text-xs">Not Started</Badge>
    </div>
  );
};

// Lesson Row Component (same as original, just moved inside the file)
const LessonRow = ({ 
  lesson, 
  course, 
  onViewDetails, 
  isStaffView, 
  onCreateSession, 
  creatingSessionFor,
  editingTeacherScore,
  teacherScoreValue,
  setTeacherScoreValue,
  updatingTeacherScore,
  onEditTeacherScore,
  onSaveTeacherScore,
  onCancelEditTeacherScore,
  onDeleteTeacherSession
}) => {
  // Handle row click to open details modal
  const handleRowClick = () => {
    // Log the lesson record to console
    
    // Prevent clicking if session is being created for this lesson
    if (creatingSessionFor === lesson.lessonId) {
      return;
    }
    if (lesson.isConfigured && lesson.questions.length > 0) {
      onViewDetails();
    }
  };

  // Determine if row should be clickable
  const isClickable = lesson.isConfigured && lesson.questions.length > 0 && creatingSessionFor !== lesson.lessonId;

  const getTypeColor = (type) => {
    const colors = {
      lesson: 'bg-blue-100 text-blue-800',
      assignment: 'bg-emerald-100 text-emerald-800',
      exam: 'bg-purple-100 text-purple-800',
      lab: 'bg-orange-100 text-orange-800',
      project: 'bg-pink-100 text-pink-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <tr 
      className={`${
        creatingSessionFor === lesson.lessonId
          ? 'bg-blue-50 opacity-75 cursor-wait' 
          : isClickable
            ? 'hover:bg-blue-50 cursor-pointer transition-colors duration-150 hover:shadow-sm group' 
            : 'hover:bg-gray-50'
      }`}
      onClick={handleRowClick}
      title={
        creatingSessionFor === lesson.lessonId 
          ? 'Creating session...' 
          : isClickable 
            ? 'Click to view details' 
            : undefined
      }
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
              {creatingSessionFor === lesson.lessonId && (
                <Loader2 className="h-4 w-4 text-blue-500 animate-spin" 
                     title="Creating session..." />
              )}
              {/* Show urgency indicator */}
              {lesson.scheduledDate && (() => {
                const dueDateStatus = getDueDateStatus(lesson.scheduledDate, lesson.status === 'completed');
                
                // Only show high priority indicators in the title area (overdue, due today, due tomorrow)
                if (dueDateStatus && dueDateStatus.priority >= 2) {
                  return (
                    <Badge className={`${dueDateStatus.bgColor} ${dueDateStatus.textColor} text-xs px-1.5 py-0 shadow-sm`}>
                      <dueDateStatus.icon className="w-2.5 h-2.5 mr-1" />
                      <span className="text-[10px] font-medium">
                        {dueDateStatus.status === 'overdue' ? 'Overdue' : 
                         dueDateStatus.status === 'due-today' ? 'Due Today' : 'Due Tomorrow'}
                      </span>
                    </Badge>
                  );
                }
                return null;
              })()}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`${getTypeColor(lesson.activityType)} text-xs`}>
                {lesson.activityType}
              </Badge>
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        {lesson.isConfigured ? (
          <>
            {lesson.maxScore > 0 ? (
              <div className="flex flex-col items-center">
                {lesson.scoringStrategy === 'teacher_manual' ? (
                  // Teacher override display with editing capability
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-orange-500" title="Teacher Override" />
                    {editingTeacherScore?.lessonId === lesson.lessonId ? (
                      // Editing mode
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max={lesson.maxScore}
                          step="0.1"
                          value={teacherScoreValue}
                          onChange={(e) => setTeacherScoreValue(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !updatingTeacherScore) {
                              onSaveTeacherScore();
                            } else if (e.key === 'Escape') {
                              onCancelEditTeacherScore();
                            }
                          }}
                          className="w-16 px-1 py-0.5 text-xs border border-orange-300 rounded focus:outline-none focus:border-orange-500"
                          autoFocus
                          disabled={updatingTeacherScore}
                          title="Press Enter to save, Escape to cancel"
                        />
                        <span className="text-xs text-gray-500">/ {lesson.maxScore}</span>
                        {updatingTeacherScore && (
                          <Loader2 className="h-3 w-3 animate-spin text-orange-500" />
                        )}
                      </div>
                    ) : (
                      // Display mode
                      <>
                        <div className="text-sm font-medium px-2 py-1 rounded border border-orange-300 bg-orange-50 text-orange-800">
                          {formatScore(lesson.totalScore)} / {lesson.maxScore}
                        </div>
                        {isStaffView && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditTeacherScore(lesson);
                              }}
                              className="h-4 w-4 p-0.5 text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors duration-200"
                              title="Edit score"
                            >
                              <Edit3 className="h-2.5 w-2.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteTeacherSession(lesson);
                              }}
                              className="h-4 w-4 p-0.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                              title="Delete teacher override"
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  // Regular score display
                  <div className="flex items-center gap-2">
                    <div className={`text-sm font-medium px-2 py-1 rounded ${getScoreColor(lesson.averageScore)}`}>
                      {formatScore(lesson.totalScore)} / {lesson.maxScore}
                    </div>
                    {isStaffView && lesson.isSessionBased && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreateSession(lesson);
                        }}
                        disabled={creatingSessionFor === lesson.lessonId}
                        className="h-5 w-5 p-0.5 text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded transition-all duration-200 disabled:opacity-50"
                        title="Override with manual score"
                      >
                        {creatingSessionFor === lesson.lessonId ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <PenTool className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">{formatScore(lesson.averageScore)}%</div>
                {lesson.totalAttempts > 0 && lesson.isSessionBased && (
                  <div className="text-xs text-gray-500">
                    {lesson.totalAttempts} {lesson.totalAttempts === 1 ? 'attempt' : 'attempts'}
                  </div>
                )}
              </div>
            ) : isStaffView ? (
              // No score but staff can create manual grade
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateSession(lesson);
                }}
                disabled={creatingSessionFor === lesson.lessonId}
                className="text-gray-400 hover:text-orange-500 transition-all duration-200 disabled:opacity-50"
                title="Set manual score"
              >
                {creatingSessionFor === lesson.lessonId ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PenTool className="h-4 w-4" />
                )}
              </button>
            ) : (
              // No score, no staff access
              <span className="text-sm text-gray-400">-</span>
            )}
          </>
        ) : (
          <span className="text-xs text-gray-400 italic">Coming soon</span>
        )}
      </td>
      <td className="px-6 py-4 text-center">
        {lesson.isConfigured ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full cursor-help">
                  {lesson.shouldBeSessionBased || lesson.activityType === 'lab' ? (
                    // Session-based items and labs: Show status badge
                    getStatusBadge(lesson)
                  ) : (
                    // Other items (lessons, etc.): Show progress bar or dash
                    <>
                      {lesson.lastActivity && (
                        <div className="text-xs text-gray-400 mb-2" title={new Date(lesson.lastActivity).toLocaleString()}>
                          {formatFriendlyDate(lesson.lastActivity)}
                        </div>
                      )}
                      {lesson.completionRate > 0 ? (
                        // Show progress bar when there's actual progress
                        <>
                          <div className="w-full bg-gray-200 rounded-full h-3 mx-auto max-w-[120px]">
                            <div 
                              className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(lesson.completionRate)}`}
                              style={{ width: `${lesson.completionRate}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {Math.round(lesson.completionRate)}%
                          </div>
                        </>
                      ) : (
                        // Show dash when no progress
                        <div className="text-sm text-gray-400 text-center">
                          -
                        </div>
                      )}
                    </>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                {lesson.shouldBeSessionBased ? (
                  // Session-based assessment tooltip
                  lesson.hasNoSessions ? (
                    <div className="text-center">
                      <div className="font-medium">No sessions started</div>
                      <div className="text-xs opacity-75">Session-based assessment</div>
                    </div>
                  ) : (
                    <div className="text-center space-y-1">
                      <div className="font-medium">
                        {lesson.sessionStatus === 'completed' ? 'Session submitted' :
                         lesson.sessionStatus === 'in_progress' || lesson.sessionStatus === 'exited' ? 'Session in progress' :
                         'Session status unknown'}
                      </div>
                      
                      {/* Show session progress details if available */}
                      {lesson.sessionData?.latestSession && (lesson.sessionStatus === 'in_progress' || lesson.sessionStatus === 'exited') && (
                        <div className="text-xs">
                          <div>
                            {lesson.sessionData.latestSession.answeredQuestions || 0} / {lesson.sessionData.latestSession.totalQuestions || 0} questions attempted in current session
                          </div>
                          <div className="opacity-75">
                            ({Math.round(lesson.completionRate)}% progress)
                          </div>
                        </div>
                      )}
                      
                      {/* Show completed session info */}
                      {lesson.sessionStatus === 'completed' && (
                        <div className="text-xs opacity-75">
                          {lesson.sessionCount} session{lesson.sessionCount !== 1 ? 's' : ''} completed
                        </div>
                      )}
                      
                      {/* Show scoring strategy */}
                      <div className="text-xs opacity-75 border-t pt-1">
                        Strategy: {lesson.scoringStrategy === 'takeHighest' ? 'Highest score' :
                                 lesson.scoringStrategy === 'latest' ? 'Latest attempt' :
                                 lesson.scoringStrategy === 'average' ? 'Average score' :
                                 'Session-based'}
                      </div>
                    </div>
                  )
                ) : lesson.activityType === 'lab' ? (
                  // Lab tooltip
                  <div className="text-center">
                    <div className="font-medium">
                      {lesson.completionRate > 0 ? 'Lab submitted' : 'Lab not started'}
                    </div>
                    <div className="text-xs opacity-75">
                      {lesson.completionRate > 0 ? 
                        `Submitted with ${Math.round(lesson.completionRate)}% completion` : 
                        'Lab assignment not yet submitted'}
                    </div>
                  </div>
                ) : (
                  // Individual question-based tooltip (lessons, etc.)
                  <div className="text-center">
                    <div className="font-medium">
                      {lesson.completedQuestions} / {lesson.totalQuestions} questions attempted
                    </div>
                    <div className="text-xs opacity-75">
                      {Math.round(lesson.completionRate)}% progress
                    </div>
                  </div>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span className="text-xs text-gray-400 italic">Coming soon</span>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="text-sm">
          {lesson.scheduledDate ? (
            (() => {
              const dueDateStatus = getDueDateStatus(lesson.scheduledDate, lesson.status === 'completed');
              if (!dueDateStatus) return null;
              
              return (
                <div className="space-y-1">
                  {/* Date */}
                  <div className="font-medium text-gray-900 text-sm">
                    {new Date(lesson.scheduledDate).toLocaleDateString(undefined, { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  
                  {/* Status badge */}
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${dueDateStatus.textColor} ${dueDateStatus.bgColor} ${dueDateStatus.borderColor} border shadow-sm`}>
                    <dueDateStatus.icon className="w-2.5 h-2.5" />
                    {dueDateStatus.text}
                  </div>
                </div>
              );
            })()
          ) : (
            <span className="text-sm text-gray-400">No date set</span>
          )}
        </div>
      </td>
    </tr>
  );
};

// Sort Icon Component
const SortIcon = ({ field, currentSort, sortOrder }) => {
  if (currentSort !== field) {
    return <ChevronDown className="h-3 w-3 text-gray-400" />;
  }
  return sortOrder === 'asc' 
    ? <ChevronUp className="h-3 w-3 text-gray-700" />
    : <ChevronDown className="h-3 w-3 text-gray-700" />;
};

export default AssessmentGridProps;