import React, { useState, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
// No longer using gradebook context - data comes from course prop
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  RotateCcw
} from 'lucide-react';
import { 
  validateGradeDataStructures, 
  calculateLessonScore, 
  checkLessonCompletion,
  findAssessmentSessions 
} from '../../utils/gradeCalculations';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import LessonDetailModal from './LessonDetailModal';

const AssessmentGrid = ({ onReviewAssessment, course, allCourseItems = [], profile }) => {
  // Validate that we have the required data structures
  const validation = validateGradeDataStructures(course);
  const { currentUser } = useAuth();
  
  // Extract data from the new reliable sources
  const itemStructure = course?.Gradebook?.courseConfig?.gradebook?.itemStructure || {};
  const actualGrades = course?.Grades?.assessments || {};
  const assessments = course?.Assessments || {};
  
  // Get student email for session-based scoring
  const studentEmail = profile?.StudentEmail || currentUser?.email;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('order');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use allCourseItems for consistent data with other components
  const groupedLessons = useMemo(() => {
    // Use allCourseItems passed from parent for consistency with navigation and progress
    if (allCourseItems.length === 0) {
      return [];
    }
    
    const lessons = [];
    
    // Process all course items in the same order as CourseProgress
    allCourseItems.forEach((courseItem, globalIndex) => {
      // Use reliable calculation function for lesson scores
      const lessonScore = calculateLessonScore(courseItem.itemId, course);
      
      // Check if lesson meets completion requirements
      const isCompleted = checkLessonCompletion(courseItem.itemId, course);
      
      // Calculate completion rate and status
      const completionRate = lessonScore.totalQuestions > 0 ? 
        (lessonScore.attempted / lessonScore.totalQuestions) * 100 : 0;
      
      let status = 'not_started';
      if (lessonScore.attempted > 0) {
        status = isCompleted ? 'completed' : 'in_progress';
      }
      
      // Global lesson number: 1, 2, 3, 4, 5... across all units (same as CourseProgress)
      const lessonNumber = globalIndex + 1;
      
      // Get detailed question information if configured
      const normalizedLessonId = courseItem.itemId.replace(/-/g, '_');
      const lessonConfig = itemStructure[normalizedLessonId];
      const questions = [];
      let lastActivity = 0;
      let totalAttempts = 0;
      
      // Find session data for assignments, exams, and quizzes
      let sessionData = null;
      const sessionTypes = ['assignment', 'exam', 'quiz'];
      if (sessionTypes.includes(courseItem.type) && studentEmail) {
        const sessions = findAssessmentSessions(courseItem.itemId, course, studentEmail);
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
          const actualGrade = actualGrades[questionId] || 0;
          const assessmentData = assessments[questionId];
          const maxPoints = questionConfig.points || 0;
          
          // Track last activity from assessment submission
          if (assessmentData?.lastSubmission?.timestamp > lastActivity) {
            lastActivity = assessmentData.lastSubmission.timestamp;
          }
          
          // Count attempts
          if (actualGrades.hasOwnProperty(questionId)) {
            totalAttempts += assessmentData?.attempts || 1;
          }
          
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
      
      const lesson = {
        lessonId: courseItem.itemId,
        lessonNumber: lessonNumber,
        lessonTitle: courseItem.title || `Lesson ${lessonNumber}`,
        activityType: courseItem.type || 'lesson',
        questions: questions,
        totalQuestions: lessonScore.totalQuestions,
        completedQuestions: lessonScore.attempted,
        totalScore: lessonScore.score,
        maxScore: lessonScore.total,
        averageScore: lessonScore.percentage,
        completionRate: completionRate,
        status: status,
        totalAttempts: totalAttempts,
        lastActivity: lastActivity,
        isConfigured: !!lessonConfig, // Flag to show if lesson has been configured
        sessionData: sessionData // Include session data for assignments/exams/quizzes
      };
      
      lessons.push(lesson);
    });
    
    return lessons;
  }, [allCourseItems, course, itemStructure, actualGrades, assessments, studentEmail]);

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

  // Show error state if validation fails
  if (!validation.valid) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-700 font-medium">Assessment Data Loading</p>
        <p className="text-yellow-600 text-sm mt-2">
          Assessment data is loading. Missing: {validation.missing.join(', ')}
        </p>
      </div>
    );
  }

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
      <div className="text-sm text-gray-600">
        Showing {filteredLessons.length} of {groupedLessons.length} lessons
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
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('type')}
                >
                  <div className="flex items-center gap-1">
                    Type
                    <SortIcon field="type" currentSort={sortBy} sortOrder={sortOrder} />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('score')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Score
                    <SortIcon field="score" currentSort={sortBy} sortOrder={sortOrder} />
                  </div>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Questions
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('date')}
                >
                  <div className="flex items-center gap-1">
                    Last Activity
                    <SortIcon field="date" currentSort={sortBy} sortOrder={sortOrder} />
                  </div>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLessons.map((lesson) => (
                <LessonRow 
                  key={lesson.lessonId}
                  lesson={lesson}
                  onViewDetails={() => handleViewDetails(lesson)}
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
      />
    </div>
  );
};

// Lesson Row Component
const LessonRow = ({ lesson, onViewDetails }) => {
  const getScoreColor = (pct) => {
    if (pct >= 90) return 'text-green-700 bg-green-50';
    if (pct >= 80) return 'text-blue-700 bg-blue-50';
    if (pct >= 70) return 'text-yellow-700 bg-yellow-50';
    if (pct >= 60) return 'text-orange-700 bg-orange-50';
    return 'text-red-700 bg-red-50';
  };

  const getStatusIcon = () => {
    if (lesson.status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (lesson.status === 'in_progress') {
      return <RotateCcw className="h-5 w-5 text-yellow-500" />;
    }
    return <Clock className="h-5 w-5 text-gray-400" />;
  };

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
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="text-xs font-medium text-gray-500 bg-gray-100 rounded px-2 py-1">
            {lesson.lessonNumber.toString().padStart(2, '0')}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {lesson.lessonTitle}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <Badge className={`${getTypeColor(lesson.activityType)} text-xs`}>
          {lesson.activityType}
        </Badge>
      </td>
      <td className="px-6 py-4 text-center">
        {lesson.isConfigured && lesson.totalAttempts > 0 ? (
          <div className="flex flex-col items-center">
            <div className={`text-sm font-medium px-2 py-1 rounded ${getScoreColor(lesson.averageScore)}`}>
              {lesson.totalScore} / {lesson.maxScore}
            </div>
            <div className="text-xs text-gray-500 mt-1">{Math.round(lesson.averageScore)}%</div>
          </div>
        ) : lesson.isConfigured ? (
          <span className="text-sm text-gray-400">-</span>
        ) : (
          <span className="text-xs text-gray-400 italic">Coming soon</span>
        )}
      </td>
      <td className="px-6 py-4 text-center">
        {lesson.isConfigured ? (
          <div>
            <div className="text-sm text-gray-600">
              {lesson.completedQuestions} / {lesson.totalQuestions}
            </div>
            <div className="text-xs text-gray-500">
              {Math.round(lesson.completionRate)}% complete
            </div>
          </div>
        ) : (
          <span className="text-xs text-gray-400 italic">Coming soon</span>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          {getStatusIcon()}
          <span className="text-xs text-gray-600 capitalize">
            {lesson.status === 'completed' ? 'Completed' : 
             lesson.status === 'in_progress' ? 'In Progress' : 'Not Started'}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        {lesson.isConfigured && lesson.lastActivity ? (
          <div className="text-sm text-gray-600">
            {new Date(lesson.lastActivity).toLocaleDateString()}
          </div>
        ) : lesson.isConfigured ? (
          <span className="text-sm text-gray-400">-</span>
        ) : (
          <span className="text-xs text-gray-400 italic">Coming soon</span>
        )}
      </td>
      <td className="px-6 py-4 text-center">
        {lesson.isConfigured && lesson.questions.length > 0 ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={onViewDetails}
            className="flex items-center gap-1"
          >
            <Eye className="h-4 w-4" />
            View Details
          </Button>
        ) : lesson.isConfigured ? (
          <span className="text-xs text-gray-400">No questions</span>
        ) : (
          <span className="text-xs text-gray-400 italic">Coming soon</span>
        )}
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

// Helper Functions
const getItemStatus = (lesson) => {
  // Determine lesson status based on completion
  if (lesson.completedQuestions === 0) {
    return 'not_started';
  } else if (lesson.completedQuestions === lesson.totalQuestions) {
    return 'completed';
  } else {
    return 'in_progress';
  }
};

export default AssessmentGrid;