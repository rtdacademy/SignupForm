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
  CalendarCheck,
  EyeOff,
  Ban,
  MoreVertical
} from 'lucide-react';
import { 
  checkLessonCompletion,
  findAssessmentSessions,
  shouldUseSessionBasedScoring 
} from '../../utils/gradeCalculations';
import { getCourseUnitsList } from '../../utils/courseItemsUtils';

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
import { toast } from 'sonner';

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
  const actualGrades = course?.Grades?.assessments || course?.Grades || {};
  const assessments = course?.Assessments || {};
  
  // Get student email for session-based scoring
  const studentEmail = profile?.StudentEmail || currentUser?.email;
  
  // Determine if this is a staff view (teacher looking at student data)
  const isStaffView = currentUser?.email && studentEmail && 
                      currentUser.email !== studentEmail;
  
  // State for omitted items
  const [omittedItems, setOmittedItems] = useState({});
  const [loadingOmittedItems, setLoadingOmittedItems] = useState(true);
  const [togglingOmit, setTogglingOmit] = useState({});
  
  // State for dropdown menu
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);
  
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
  const [recalculatingGradebook, setRecalculatingGradebook] = useState(false);
  const [recalculationError, setRecalculationError] = useState(null);
  
  // Use enriched course items directly from props
  const allCourseItems = enrichedCourseItems || [];
  
  // Load omitted items from Firebase on component mount
  useEffect(() => {
    const loadOmittedItems = async () => {
      if (!studentEmail || !course?.CourseID) return;
      
      const database = getDatabase();
      const courseId = course.CourseID;
      const omittedPath = `students/${sanitizeEmail(studentEmail)}/courses/${courseId}/Gradebook/omittedItems`;
      
      try {
        const snapshot = await get(ref(database, omittedPath));
        if (snapshot.exists()) {
          setOmittedItems(snapshot.val());
        }
        setLoadingOmittedItems(false);
      } catch (error) {
        console.error('Error loading omitted items:', error);
        setLoadingOmittedItems(false);
      }
    };
    
    loadOmittedItems();
  }, [studentEmail, course?.CourseID]);

  // Handle click outside and escape key for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [openDropdown]);
  
  // Toggle omit status for an item
  const handleToggleOmit = async (itemId) => {
    if (!isStaffView || !studentEmail || !course?.CourseID) return;
    
    setTogglingOmit(prev => ({ ...prev, [itemId]: true }));
    
    const database = getDatabase();
    const courseId = course.CourseID;
    const omittedItemPath = `students/${sanitizeEmail(studentEmail)}/courses/${courseId}/Gradebook/omittedItems/${itemId}`;
    
    // Add debugging to verify path construction
    console.log('🎯 Omit action:', {
      isStaffView,
      studentEmail,
      courseId,
      itemId,
      omittedItemPath,
      courseData: { CourseID: course.CourseID }
    });
    
    try {
      if (omittedItems[itemId]) {
        // Un-omit the item
        await remove(ref(database, omittedItemPath));
        setOmittedItems(prev => {
          const newItems = { ...prev };
          delete newItems[itemId];
          return newItems;
        });
        toast.success(`${itemId} has been included in grade calculations`);
      } else {
        // Omit the item
        const omitData = {
          omittedAt: Date.now(),
          omittedBy: currentUser.email,
          reason: 'Legacy assessment data - incorrect naming convention'
        };
        await update(ref(database, omittedItemPath), omitData);
        setOmittedItems(prev => ({ ...prev, [itemId]: omitData }));
        toast.success(`${itemId} has been excluded from grade calculations`);
      }
      
      // Trigger gradebook recalculation
      await handleRecalculateGradebook();
      
    } catch (error) {
      console.error('Error toggling omit status:', error);
      toast.error('Failed to update omit status');
    } finally {
      setTogglingOmit(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Handle manual score override for non-session items (lessons, labs)
  const handleSetManualOverride = async (lesson, manualScore, manualTotal) => {
    if (!isStaffView || !studentEmail || !course?.CourseID) return;
    
    const database = getDatabase();
    const courseId = course.CourseID;
    const itemPath = `students/${sanitizeEmail(studentEmail)}/courses/${courseId}/Gradebook/items/${lesson.lessonId}`;
    
    try {
      // Get existing data to preserve original values
      const snapshot = await get(ref(database, itemPath));
      const existingItem = snapshot.val() || {};
      
      console.log('🎯 Setting manual score override:', {
        lessonId: lesson.lessonId,
        manualScore,
        manualTotal,
        existingItem
      });
      
      const overrideData = {
        isManualOverride: true,
        manualScore: manualScore,
        manualTotal: manualTotal,
        manualSetBy: currentUser.email,
        manualSetAt: Date.now(),
        // Preserve original calculated values if this is first override
        originalScore: existingItem.isManualOverride ? existingItem.originalScore : (existingItem.score || 0),
        originalTotal: existingItem.isManualOverride ? existingItem.originalTotal : (existingItem.total || 0),
        // Update current display values for compatibility
        score: manualScore,
        total: manualTotal,
        percentage: manualTotal > 0 ? (manualScore / manualTotal) * 100 : 0,
        attempted: manualTotal, // Consider fully attempted if manually set
        source: 'individual'
      };
      
      await update(ref(database, itemPath), overrideData);
      
      // Trigger gradebook recalculation in background (don't await)
      handleRecalculateGradebook().catch(error => {
        console.error('Background gradebook recalculation failed:', error);
        // Could show a subtle notification if needed, but don't block UI
      });
      
      toast.success(`Manual score set for ${lesson.lessonTitle}: ${manualScore}/${manualTotal}`);
      
    } catch (error) {
      console.error('Error setting manual score override:', error);
      toast.error('Failed to set manual score');
    }
  };

  // Remove manual score override and restore calculated scores
  const handleRemoveManualOverride = async (lesson) => {
    if (!isStaffView || !studentEmail || !course?.CourseID) return;
    
    const database = getDatabase();
    const courseId = course.CourseID;
    const itemPath = `students/${sanitizeEmail(studentEmail)}/courses/${courseId}/Gradebook/items/${lesson.lessonId}`;
    
    try {
      // Get existing data
      const snapshot = await get(ref(database, itemPath));
      const existingItem = snapshot.val();
      
      if (!existingItem || !existingItem.isManualOverride) {
        console.log(`No manual override found for ${lesson.lessonId}`);
        return;
      }
      
      // Restore original calculated values
      const restoredData = {
        score: existingItem.originalScore || 0,
        total: existingItem.originalTotal || 0,
        percentage: existingItem.originalTotal > 0 ? (existingItem.originalScore / existingItem.originalTotal) * 100 : 0,
        // Remove override-specific fields by setting to null
        isManualOverride: null,
        manualScore: null,
        manualTotal: null,
        manualSetBy: null,
        manualSetAt: null,
        originalScore: null,
        originalTotal: null
      };
      
      await update(ref(database, itemPath), restoredData);
      
      // Trigger gradebook recalculation in background (don't await)
      handleRecalculateGradebook().catch(error => {
        console.error('Background gradebook recalculation failed:', error);
      });
      
      toast.success(`Manual override removed for ${lesson.lessonTitle}`);
      
    } catch (error) {
      console.error('Error removing manual score override:', error);
      toast.error('Failed to remove manual override');
    }
  };
  
  // Get course structure units for fallback question lookup
  const courseUnits = useMemo(() => {
    return getCourseUnitsList(course) || [];
  }, [course]);

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
      
      // Calculate initial completion rate (will be updated later for session-based items)
      let completionRate = courseItem.total > 0 ? 
        (courseItem.attempted / courseItem.total) * 100 : 0;
      
      // Global lesson number: 1, 2, 3, 4, 5... across all units (same as CourseProgress)
      const lessonNumber = globalIndex + 1;
      
      // Get detailed question information if configured
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
      
      // Update completion rate for session-based items now that sessionData is available
      if (shouldBeSessionBased && sessionData?.sessionCount > 0) {
        // For session-based items, completion rate should reflect session progress
        const latestSession = sessionData.latestSession;
        if (latestSession) {
          // Use session progress if available, otherwise consider it 100% if completed
          completionRate = latestSession.sessionProgress || 
            (latestSession.status === 'completed' ? 100 : 
             latestSession.questionsCompleted ? (latestSession.questionsCompleted / latestSession.totalQuestions) * 100 : 0);
        }
      }
      
      // Determine status now that sessionData is available
      let status = 'not_started';
      
      // Special handling for lab-type assessments
      if (courseItem.type === 'lab') {
        // For labs, check if there's a submission in course.Assessments
        const questionId = courseItem.questions?.[0]?.questionId;
        const labAssessment = questionId && course?.Assessments?.[questionId];
        
        if (labAssessment) {
          // Check if teacher has marked it (actualGrade > 0)
          const isMarked = courseItem.attempted && courseItem.score > 0;
          
          if (isMarked) {
            status = 'marked'; // New status for teacher-graded labs
          } else if (labAssessment.status === 'submitted') {
            status = 'submitted'; // New status for student-submitted labs
          } else {
            status = 'in_progress'; // Lab started but not submitted
          }
        } else if (courseItem.attempted > 0 || courseItem.score > 0) {
          // Fallback: if there's a grade but no assessment data, consider it marked
          status = 'marked';
        }
      } else if (shouldBeSessionBased) {
        // For session-based items, status depends on actual session data
        const actualSessionCount = sessionData?.sessionCount || 0;
        if (actualSessionCount > 0) {
          // Determine status based on session completion and scoring strategy
          const latestSession = sessionData?.latestSession;
          const hasCompletedSessions = sessionData?.sessions?.some(session => 
            session.status === 'completed' && session.finalResults?.score !== undefined
          );
          
          if (hasCompletedSessions) {
            status = 'completed';
          } else if (latestSession && latestSession.status === 'completed') {
            status = 'completed';
          } else if (latestSession) {
            status = 'in_progress';
          }
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
      
      // If lesson has questions in courseItem, get detailed question data
      // Always preserve the questions array from the original course structure
      let questionsSource = courseItem.questions;
      
      // If questions are missing from enriched item, try to fetch from original course structure
      if ((!questionsSource || questionsSource.length === 0) && courseUnits.length > 0) {
        // Find the matching item in course structure
        for (const unit of courseUnits) {
          if (unit.items && Array.isArray(unit.items)) {
            const originalItem = unit.items.find(item => item.itemId === courseItem.itemId);
            if (originalItem && originalItem.questions && originalItem.questions.length > 0) {
              questionsSource = originalItem.questions;
              break;
            }
          }
        }
      }
      
      if (questionsSource && Array.isArray(questionsSource)) {
        // For non-session based assessments, count attempts differently
        if (!sessionTypes.includes(courseItem.type)) {
          // For regular lessons, consider it 1 attempt if any questions are attempted
          const attemptedQuestions = questionsSource.filter(q => 
            actualGrades.hasOwnProperty(q.questionId)
          );
          if (attemptedQuestions.length > 0) {
            totalAttempts = 1;
          }
        }
        
        questionsSource.forEach(questionConfig => {
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
      
      // For session-based items, override certain values with session data
      let finalTotalScore = courseItem.score;
      let finalMaxScore = courseItem.total;
      let finalAverageScore = courseItem.percentage;
      let finalCompletedQuestions = courseItem.attempted;
      let finalSessionCount = sessionCount;
      let currentAttemptNumber = null;
      
      if (shouldBeSessionBased && sessionData?.sessionCount > 0) {
        finalSessionCount = sessionData.sessionCount;
        currentAttemptNumber = sessionData.sessions.length;
        
        // Apply scoring strategy to determine which session score to use
        if (courseItem.strategy === 'takeHighest' && sessionData.sessions.length > 0) {
          const bestSession = sessionData.sessions.reduce((best, session) => {
            const sessionScore = session.finalResults?.score || 0;
            const bestScore = best.finalResults?.score || 0;
            return sessionScore > bestScore ? session : best;
          });
          finalTotalScore = bestSession.finalResults?.score || 0;
          finalMaxScore = bestSession.finalResults?.maxScore || courseItem.total;
          finalAverageScore = bestSession.finalResults?.percentage || 0;
        } else if (courseItem.strategy === 'latest' && sessionData.latestSession) {
          finalTotalScore = sessionData.latestSession.finalResults?.score || 0;
          finalMaxScore = sessionData.latestSession.finalResults?.maxScore || courseItem.total;
          finalAverageScore = sessionData.latestSession.finalResults?.percentage || 0;
        }
        
        // For session-based items, completed questions should reflect session completion
        if (status === 'completed') {
          finalCompletedQuestions = finalMaxScore; // Consider all questions completed if session is completed
        } else if (sessionData.latestSession?.questionsCompleted) {
          finalCompletedQuestions = sessionData.latestSession.questionsCompleted;
        }
      }

      // Check for manual override in gradebook data for non-session items
      let scoringStrategy = courseItem.strategy || null;
      if (!shouldBeSessionBased && courseItem.gradebookData?.isManualOverride === true) {
        scoringStrategy = 'teacher_manual';
        // Use manual override values
        finalTotalScore = courseItem.gradebookData.manualScore || 0;
        finalMaxScore = courseItem.gradebookData.manualTotal || 0;
        finalAverageScore = finalMaxScore > 0 ? (finalTotalScore / finalMaxScore) * 100 : 0;
        
        console.log(`🎯 Detected manual override for ${courseItem.itemId}:`, {
          manualScore: finalTotalScore,
          manualTotal: finalMaxScore,
          originalScore: courseItem.gradebookData.originalScore,
          originalTotal: courseItem.gradebookData.originalTotal
        });
      }

      const lesson = {
        lessonId: courseItem.itemId,
        lessonNumber: lessonNumber,
        lessonTitle: courseItem.title || `Lesson ${lessonNumber}`,
        activityType: courseItem.type || 'lesson',
        questions: questions,
        totalQuestions: finalMaxScore,
        completedQuestions: finalCompletedQuestions,
        totalScore: finalTotalScore,
        maxScore: finalMaxScore,
        averageScore: finalAverageScore,
        completionRate: completionRate,
        status: status,
        totalAttempts: totalAttempts,
        teacherSessionCount: teacherSessionCount,
        lastActivity: lastActivity,
        isConfigured: courseItem.hasGradebookData || !!(questionsSource && questionsSource.length > 0), // Show scores if we have gradebook data OR questions
        sessionData: sessionData, // Include session data for assignments/exams/quizzes
        // Session-based scoring information
        shouldBeSessionBased: shouldBeSessionBased,
        isSessionBased: isSessionBased,
        sessionCount: finalSessionCount,
        hasNoSessions: shouldBeSessionBased && finalSessionCount === 0,
        scoringStrategy: scoringStrategy, // Updated to use the potentially modified strategy
        sessionStatus: courseItem.sessionStatus || null,
        // Add attempt number for session-based items
        currentAttemptNumber: currentAttemptNumber,
        // Add scheduled date if available (from enriched data)
        scheduledDate: scheduledDate,
        // Add manual override data for delete functionality
        hasManualOverride: courseItem.gradebookData?.isManualOverride === true,
        manualOverrideData: courseItem.gradebookData?.isManualOverride ? courseItem.gradebookData : null
      };
      
      lessons.push(lesson);
    });
    
    return lessons;
  }, [allCourseItems, course, studentEmail, actualGrades, assessments]);

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
      // Get lesson configuration from the lesson object itself
      if (!lesson.questions || lesson.questions.length === 0) {
        throw new Error(`No questions found for ${lesson.lessonId}`);
      }

      // Extract course ID from the current course context
      const courseId = course.CourseID;
      if (!courseId) {
        throw new Error('Course ID not found');
      }

      console.log('Creating optimized teacher session for:', {
        lessonId: lesson.lessonId,
        studentEmail,
        courseId,
        questionsCount: lesson.questions.length,
        maxScore: lesson.maxScore
      });

      // Use the optimized teacher session cloud function
      const createTeacherSessionFunction = httpsCallable(functions, 'createTeacherSession');
      
      const sessionResult = await createTeacherSessionFunction({
        courseId: courseId,
        assessmentItemId: lesson.lessonId,
        studentEmail: studentEmail,
        questionsCount: lesson.questions.length, // Just count, not full question data
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
      // Determine if this is a session-based item (assignment, exam, quiz) or regular lesson/lab
      const sessionBasedTypes = ['assignment', 'exam', 'quiz'];
      const isSessionBased = sessionBasedTypes.includes(lesson.activityType);

      if (isSessionBased) {
        // Handle session-based items (assignments, exams, quizzes) - original logic
        const courseId = course.CourseID;
        const timestamp = Date.now();

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
        
        // Auto-open edit mode for the newly created session
        setEditingTeacherScore(lesson);
        setTeacherScoreValue(''); // Start with empty value for immediate input
        
      } else {
        // Handle non-session items (lessons, labs) - open edit mode immediately
        console.log(`🎓 Opening edit mode for ${lesson.activityType}: ${lesson.lessonId}`);
        
        setCreatingSessionFor(null);
        
        // Auto-open edit mode immediately (NO database operations)
        setEditingTeacherScore(lesson);
        setTeacherScoreValue(''); // Start with empty value for immediate input
        
        // NOTE: Manual override will be created only when user saves the score
        // This ensures instant UI response with zero database blocking
      }
      
    } catch (error) {
      console.error('Error creating manual score:', error);
      alert(`Failed to create manual score: ${error.message}`);
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
      // Check if this is a manual override for a non-session item
      if (editingTeacherScore.hasManualOverride || 
          !['assignment', 'exam', 'quiz'].includes(editingTeacherScore.activityType)) {
        console.log(`💾 Saving manual override score for ${editingTeacherScore.lessonId}: ${newScore}/${maxScore}`);
        
        // Create/update manual override directly here (since we didn't create it on initial click)
        const database = getDatabase();
        const courseId = course.CourseID;
        const itemPath = `students/${sanitizeEmail(studentEmail)}/courses/${courseId}/Gradebook/items/${editingTeacherScore.lessonId}`;
        
        // Get existing data to preserve original values, then save
        get(ref(database, itemPath))
          .then(snapshot => {
            const existingItem = snapshot.val() || {};
            
            const overrideData = {
              isManualOverride: true,
              manualScore: newScore,
              manualTotal: maxScore,
              manualSetBy: currentUser.email,
              manualSetAt: Date.now(),
              // Preserve original calculated values if this is first override
              originalScore: existingItem.isManualOverride ? existingItem.originalScore : (existingItem.score || editingTeacherScore.totalScore || 0),
              originalTotal: existingItem.isManualOverride ? existingItem.originalTotal : (existingItem.total || editingTeacherScore.maxScore || maxScore),
              // Update current display values for compatibility
              score: newScore,
              total: maxScore,
              percentage: maxScore > 0 ? (newScore / maxScore) * 100 : 0,
              attempted: maxScore,
              source: 'individual'
            };
            
            return update(ref(database, itemPath), overrideData);
          })
          .then(() => {
            // Trigger gradebook recalculation in background
            handleRecalculateGradebook().catch(error => {
              console.error('Background gradebook recalculation failed:', error);
            });
            
            toast.success(`Manual score set: ${newScore}/${maxScore}`);
          })
          .catch(error => {
            console.error('Failed to save manual override:', error);
            toast.error('Failed to save manual score');
          });
      } else {
        // Handle session-based score saving (original logic)
        const sanitizedEmail = studentEmail.replace(/[.#$[\]]/g, ',');
        const sessionsRef = ref(getDatabase(), `students/${sanitizedEmail}/courses/${course.CourseID}/ExamSessions`);
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
          course.CourseID,
          teacherSessionId,
          newScore,
          maxScore
        );
      }

      // Close the editing interface
      setEditingTeacherScore(null);
      setTeacherScoreValue('');
      // Parent's realtime listeners will handle the data updates
      
    } catch (error) {
      console.error('Error updating score:', error);
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
      // First check if this lesson has a manual override in gradebook items
      const database = getDatabase();
      const courseId = course.CourseID;
      const itemPath = `students/${sanitizeEmail(studentEmail)}/courses/${courseId}/Gradebook/items/${lesson.lessonId}`;
      
      // Check gradebook item for manual override
      const itemSnapshot = await get(ref(database, itemPath));
      const itemData = itemSnapshot.val();
      
      if (itemData && itemData.isManualOverride === true) {
        console.log(`🗑️ Removing manual override from gradebook item: ${lesson.lessonId}`);
        
        // Restore to original calculated values
        const restoredData = {
          score: itemData.originalScore || 0,
          total: itemData.originalTotal || 0,
          percentage: itemData.originalTotal > 0 ? (itemData.originalScore / itemData.originalTotal) * 100 : 0,
          attempted: itemData.originalScore > 0 ? itemData.originalTotal : 0, // Restore original attempted count
          // Remove manual override fields
          isManualOverride: null,
          manualScore: null,
          manualTotal: null,
          manualSetBy: null,
          manualSetAt: null,
          originalScore: null,
          originalTotal: null,
          strategy: null // Remove teacher_manual strategy
        };
        
        await update(ref(database, itemPath), restoredData);
        
        // Trigger gradebook recalculation in background
        handleRecalculateGradebook().catch(error => {
          console.error('Background gradebook recalculation failed:', error);
        });
        
        toast.success(`Manual override removed for ${lesson.lessonTitle}`);
        return;
      }

      // Handle session-based deletion (original logic for assignments/exams/quizzes)
      const sanitizedEmail = studentEmail.replace(/[.#$[\]]/g, ',');
      const sessionsRef = ref(getDatabase(), `students/${sanitizedEmail}/courses/${course.CourseID}/ExamSessions`);
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
        console.log(`No manual override or teacher session found for ${lesson.lessonId}`);
        alert('No teacher override found to delete');
        return;
      }

      // Delete session directly from Firebase
      const sessionPath = `students/${sanitizeEmail(studentEmail)}/courses/${course.CourseID}/ExamSessions/${teacherSessionId}`;
      await remove(ref(database, sessionPath));

      toast.success(`Teacher session deleted for ${lesson.lessonTitle}`);
      
    } catch (error) {
      console.error('Error deleting teacher override:', error);
      alert(`Failed to delete teacher override: ${error.message}`);
    }
  };

  const handleRecalculateGradebook = async () => {
    if (!isStaffView || !studentEmail) {
      console.error('Cannot recalculate gradebook: not in staff view or no student email');
      return;
    }

    // Clear any previous error
    setRecalculationError(null);
    setRecalculatingGradebook(true);

    try {
      const courseId = course.CourseID;
      if (!courseId) {
        throw new Error('Course ID not found');
      }

      console.log('🔄 Teacher requesting gradebook recalculation for:', {
        studentEmail,
        courseId,
        teacherEmail: currentUser?.email
      });

      // Call the Cloud Function
      const recalculateGradebookFunction = httpsCallable(functions, 'recalculateStudentGradebook');
      
      const result = await recalculateGradebookFunction({
        studentEmail: studentEmail,
        courseId: courseId
      });

      console.log('✅ Gradebook recalculation completed:', result.data);
      
      // Show success toast
      toast.success('Gradebook recalculated successfully', {
        description: `Updated scores for ${studentEmail}`,
        duration: 4000,
      });
      
      // The parent's real-time listeners will automatically update the gradebook data
      // No need to manually refresh anything
      
    } catch (error) {
      console.error('❌ Error recalculating gradebook:', error);
      
      // Set user-friendly error message
      let errorMessage = 'Failed to recalculate gradebook';
      if (error.code === 'permission-denied') {
        errorMessage = 'You do not have permission to recalculate gradebooks';
      } else if (error.code === 'not-found') {
        errorMessage = 'Student is not enrolled in this course';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setRecalculationError(errorMessage);
      
      // Show error toast
      toast.error('Failed to recalculate gradebook', {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setRecalculatingGradebook(false);
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
        
        {/* Recalculation Button - Only visible to teachers */}
        {isStaffView && (
          <Button
            onClick={handleRecalculateGradebook}
            disabled={recalculatingGradebook}
            variant="outline"
            className="w-full md:w-auto whitespace-nowrap"
          >
            {recalculatingGradebook ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Recalculating...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4 mr-2" />
                Recalculate Scores
              </>
            )}
          </Button>
        )}
      </div>

      {/* Error Display */}
      {recalculationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
            <p className="text-red-700 text-sm">{recalculationError}</p>
            <button
              onClick={() => setRecalculationError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

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
                  className="w-80 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
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
                {isStaffView && (
                  <th className="w-12 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
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
                  isOmitted={!!omittedItems[lesson.lessonId]}
                  onToggleOmit={() => handleToggleOmit(lesson.lessonId)}
                  togglingOmit={togglingOmit[lesson.lessonId]}
                  openDropdown={openDropdown}
                  setOpenDropdown={setOpenDropdown}
                  dropdownRef={dropdownRef}
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
        courseUnits={courseUnits}
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
  // Handle session-based items using the new status logic
  if (lesson.shouldBeSessionBased && lesson.sessionCount > 0) {
    if (lesson.status === 'completed') {
      return (
        <div className="flex flex-col items-center justify-center gap-1">
          <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1 text-center">
            Completed
          </Badge>
          {lesson.currentAttemptNumber && (
            <div className="text-xs text-gray-500">
              {lesson.currentAttemptNumber} {lesson.currentAttemptNumber === 1 ? 'attempt' : 'attempts'}
            </div>
          )}
        </div>
      );
    } else if (lesson.status === 'in_progress') {
      return (
        <div className="flex flex-col items-center justify-center gap-1">
          <Badge className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 text-center">
            In Progress
          </Badge>
          {lesson.currentAttemptNumber && (
            <div className="text-xs text-gray-500">
              Attempt {lesson.currentAttemptNumber}
            </div>
          )}
        </div>
      );
    }
  }
  
  // Handle labs with new status system
  if (lesson.activityType === 'lab') {
    if (lesson.status === 'marked') {
      return (
        <div className="flex flex-col items-center justify-center gap-1">
          <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1 text-center">
            Marked
          </Badge>
          <div className="text-xs text-gray-500">
            {lesson.totalScore}/{lesson.maxScore}
          </div>
        </div>
      );
    } else if (lesson.status === 'submitted') {
      return (
        <div className="flex flex-col items-center justify-center gap-1">
          <Badge className="bg-blue-100 text-blue-800 text-xs px-2 py-1 text-center">
            Submitted
          </Badge>
          <div className="text-xs text-gray-500">
            Awaiting marking
          </div>
        </div>
      );
    } else if (lesson.status === 'in_progress') {
      return (
        <div className="flex flex-col items-center justify-center gap-1">
          <Badge className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 text-center">
            In Progress
          </Badge>
          <div className="text-xs text-gray-500">
            Not submitted
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center gap-1">
          <Badge className="bg-gray-100 text-gray-600 text-xs px-2 py-1 text-center">
            Not Started
          </Badge>
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
  onDeleteTeacherSession,
  isOmitted,
  onToggleOmit,
  togglingOmit,
  openDropdown,
  setOpenDropdown,
  dropdownRef
}) => {
  // Handle row click to open details modal
  const handleRowClick = () => {
    // Log the lesson record to console
    console.log('🎯 Lesson clicked:', lesson);
    
    // Prevent clicking if session is being created for this lesson
    if (creatingSessionFor === lesson.lessonId) {
      return;
    }
    // Only check if configured - the modal has fallback logic to fetch questions
    if (lesson.isConfigured) {
      onViewDetails();
    }
  };

  // Determine if row should be clickable - only needs to be configured
  const isClickable = lesson.isConfigured && creatingSessionFor !== lesson.lessonId;

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
        isOmitted 
          ? 'bg-gray-100 opacity-60' 
          : creatingSessionFor === lesson.lessonId
          ? 'bg-blue-50 opacity-75 cursor-wait' 
          : isClickable
            ? 'hover:bg-blue-50 cursor-pointer transition-colors duration-150 hover:shadow-sm group' 
            : 'hover:bg-gray-50'
      }`}
      onClick={handleRowClick}
      title={
        creatingSessionFor === lesson.lessonId 
          ? 'Creating session...' 
          : lesson.isConfigured 
            ? 'Click to view details' 
            : 'Coming soon'
      }
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="text-xs font-medium text-gray-500 bg-gray-100 rounded px-2 py-1">
            {lesson.lessonNumber.toString().padStart(2, '0')}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className={`text-sm font-medium ${isOmitted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                {lesson.lessonTitle}
              </div>
              {creatingSessionFor === lesson.lessonId && (
                <Loader2 className="h-4 w-4 text-blue-500 animate-spin" 
                     title="Creating session..." />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`${getTypeColor(lesson.activityType)} text-xs`}>
                {lesson.activityType}
              </Badge>
              {/* Show urgency indicator badge alongside activity type (but not for omitted items) */}
              {!isOmitted && lesson.scheduledDate && (() => {
                const dueDateStatus = getDueDateStatus(lesson.scheduledDate, lesson.status === 'completed');
                
                // Only show high priority indicators (overdue, due today, due tomorrow)
                if (dueDateStatus && dueDateStatus.priority >= 2) {
                  return (
                    <Badge className={`${dueDateStatus.bgColor} ${dueDateStatus.textColor} text-xs px-1.5 py-0.5 shadow-sm`}>
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
              {/* Show compact attempt/strategy info for session-based items */}
              {lesson.shouldBeSessionBased && lesson.currentAttemptNumber && (
                <div className="text-xs text-gray-500">
                  Attempt #{lesson.currentAttemptNumber}
                  {lesson.scoringStrategy && (
                    <span className="ml-1">
                      • {lesson.scoringStrategy === 'takeHighest' ? 'Best' : 
                         lesson.scoringStrategy === 'latest' ? 'Latest' : 
                         lesson.scoringStrategy === 'average' ? 'Avg' : 
                         lesson.scoringStrategy}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        {lesson.isConfigured ? (
          <>
            {lesson.maxScore > 0 ? (
              <div className="flex flex-col items-center">
                {isOmitted && (
                  <div className="text-[10px] text-gray-500 mb-1 font-medium">
                    Excused
                  </div>
                )}
                {lesson.scoringStrategy === 'teacher_manual' || editingTeacherScore?.lessonId === lesson.lessonId ? (
                  // Teacher override display with editing capability OR currently editing
                  <div className="flex items-center gap-1">
                    {lesson.scoringStrategy === 'teacher_manual' && <Shield className="h-3 w-3 text-orange-500" title="Teacher Override" />}
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditTeacherScore(lesson);
                          }}
                          className="text-sm font-medium px-2 py-1 rounded border border-orange-300 bg-orange-50 text-orange-800 hover:bg-orange-100 cursor-pointer transition-colors duration-200"
                          title="Click to edit score"
                        >
                          {formatScore(lesson.totalScore)} / {lesson.maxScore}
                        </button>
                        {isStaffView && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTeacherSession(lesson);
                            }}
                            className="h-4 w-4 p-0.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200 ml-1"
                            title="Delete teacher override"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  // Regular score display
                  <div className="flex items-center gap-2">
                    {lesson.activityType === 'lab' ? (
                      // Special handling for labs - show status text until marked
                      <div className="text-sm font-medium px-2 py-1 rounded">
                        {lesson.status === 'marked' ? (
                          <span className={getScoreColor(lesson.averageScore)}>
                            {formatScore(lesson.totalScore)} / {lesson.maxScore}
                          </span>
                        ) : lesson.status === 'submitted' ? (
                          <span className="text-blue-700 bg-blue-50">
                            Awaiting Grade
                          </span>
                        ) : lesson.status === 'in_progress' ? (
                          <span className="text-yellow-700 bg-yellow-50">
                            In Progress
                          </span>
                        ) : (
                          <span className="text-gray-500 bg-gray-50">
                            -
                          </span>
                        )}
                      </div>
                    ) : (
                      // Regular numerical score display for non-labs
                      <div className={`text-sm font-medium px-2 py-1 rounded ${getScoreColor(lesson.averageScore)}`}>
                        {formatScore(lesson.totalScore)} / {lesson.maxScore}
                      </div>
                    )}
                    {isStaffView && (
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
                <div className={`text-xs mt-1 ${isOmitted ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formatScore(lesson.averageScore)}%
                  {isOmitted && (
                    <span className="text-[10px] text-gray-400 ml-1">(excused)</span>
                  )}
                </div>
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
        {isOmitted ? (
          // Simplified display for omitted items
          <div className="text-center">
            <Badge className="bg-gray-100 text-gray-600 text-xs">
              Excused
            </Badge>
          </div>
        ) : lesson.isConfigured ? (
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
                        {lesson.status === 'completed' ? 
                          `${lesson.currentAttemptNumber} attempt${lesson.currentAttemptNumber !== 1 ? 's' : ''} completed` :
                         lesson.status === 'in_progress' ? 
                          `Attempt ${lesson.currentAttemptNumber} in progress` :
                         'Sessions available'}
                      </div>
                      
                      {/* Show current score based on strategy */}
                      {lesson.status === 'completed' && (
                        <div className="text-xs">
                          <div className="font-medium">
                            Score: {Math.round(lesson.averageScore)}% ({lesson.totalScore}/{lesson.maxScore})
                          </div>
                          <div className="opacity-75">
                            Using {lesson.scoringStrategy === 'takeHighest' ? 'best' : 
                                   lesson.scoringStrategy === 'latest' ? 'latest' : 
                                   lesson.scoringStrategy === 'average' ? 'average' : 'session'} score
                          </div>
                        </div>
                      )}
                      
                      {/* Show session progress details if in progress */}
                      {lesson.status === 'in_progress' && lesson.sessionData?.latestSession && (
                        <div className="text-xs">
                          <div>
                            {lesson.sessionData.latestSession.answeredQuestions || 0} / {lesson.sessionData.latestSession.totalQuestions || 0} questions answered
                          </div>
                          <div className="opacity-75">
                            ({Math.round(lesson.completionRate)}% progress)
                          </div>
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
                  // Lab tooltip with new status system
                  <div className="text-center">
                    <div className="font-medium">
                      {lesson.status === 'marked' ? 'Lab marked by teacher' :
                       lesson.status === 'submitted' ? 'Lab submitted for marking' :
                       lesson.status === 'in_progress' ? 'Lab in progress' :
                       'Lab not started'}
                    </div>
                    <div className="text-xs opacity-75">
                      {lesson.status === 'marked' ? 
                        `Grade: ${lesson.totalScore}/${lesson.maxScore} (${Math.round(lesson.averageScore)}%)` :
                       lesson.status === 'submitted' ? 
                        'Awaiting teacher to mark and provide grade' :
                       lesson.status === 'in_progress' ? 
                        'Student working on lab but not yet submitted' :
                        'Lab assignment not yet started'}
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
          {isOmitted ? (
            // Simplified display for omitted items - just show the date without status
            lesson.scheduledDate ? (
              <div className="text-center">
                <div className="text-gray-500 text-sm">
                  {new Date(lesson.scheduledDate).toLocaleDateString(undefined, { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Excused
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 text-sm">
                Excused
              </div>
            )
          ) : lesson.scheduledDate ? (
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
      {isStaffView && (
        <td className="px-2 py-4 text-center" onClick={(e) => e.stopPropagation()}>
          <div className="relative" ref={openDropdown === lesson.lessonId ? dropdownRef : null}>
            {/* Three-dot menu button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdown(openDropdown === lesson.lessonId ? null : lesson.lessonId);
              }}
              className="p-1.5 rounded transition-all duration-200 bg-gray-100 text-gray-600 hover:bg-gray-200"
              title="Actions"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {/* Dropdown menu */}
            {openDropdown === lesson.lessonId && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="py-1">
                  {/* Omit/Include menu item */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleOmit();
                      setOpenDropdown(null);
                    }}
                    disabled={togglingOmit}
                    className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors duration-200 ${
                      isOmitted 
                        ? 'text-red-600' 
                        : 'text-gray-700'
                    } disabled:opacity-50`}
                  >
                    {togglingOmit ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isOmitted ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                    <span>
                      {isOmitted ? 'Include in grades' : 'Exclude from grades'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </td>
      )}
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