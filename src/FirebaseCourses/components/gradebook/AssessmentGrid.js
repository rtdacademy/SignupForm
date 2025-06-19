import React, { useState, useMemo } from 'react';
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

const AssessmentGrid = ({ onReviewAssessment, course }) => {
  // Extract gradebook data directly from course prop
  const gradebook = course?.Gradebook || {};
  const items = gradebook?.items || {};
  const assessments = course?.Assessments || {};
  const categories = gradebook?.categories || {};
  const hasData = !!gradebook?.summary;
  const configError = hasData ? null : 'No gradebook data available';
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('lesson');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Group assessments by lesson prefix and calculate lesson-level statistics
  const groupedLessons = useMemo(() => {
    const lessons = {};
    
    // Process items from gradebook
    Object.entries(items || {}).forEach(([itemId, itemData]) => {
      const lessonPrefix = extractLessonPrefix(itemId);
      if (!lessonPrefix) return;
      
      if (!lessons[lessonPrefix]) {
        lessons[lessonPrefix] = {
          lessonId: lessonPrefix,
          questions: [],
          totalQuestions: 0,
          completedQuestions: 0,
          totalScore: 0,
          maxScore: 0,
          totalAttempts: 0,
          lastActivity: 0,
          activityType: 'lesson',
          lessonTitle: ''
        };
      }
      
      // Get assessment data for activityType and other details
      const assessmentData = assessments[itemId];
      if (assessmentData?.activityType) {
        lessons[lessonPrefix].activityType = assessmentData.activityType;
      }
      
      lessons[lessonPrefix].questions.push({
        id: itemId,
        ...itemData,
        assessmentData
      });
      
      lessons[lessonPrefix].totalQuestions += 1;
      lessons[lessonPrefix].totalScore += itemData.score || 0;
      lessons[lessonPrefix].maxScore += itemData.maxScore || 0;
      lessons[lessonPrefix].totalAttempts += itemData.attempts || 0;
      
      if (itemData.score > 0) {
        lessons[lessonPrefix].completedQuestions += 1;
      }
      
      if (itemData.lastAttempt > lessons[lessonPrefix].lastActivity) {
        lessons[lessonPrefix].lastActivity = itemData.lastAttempt;
      }
      
      // Generate lesson title from the first question
      if (!lessons[lessonPrefix].lessonTitle && itemData.title) {
        lessons[lessonPrefix].lessonTitle = generateLessonTitle(lessonPrefix, itemData.title);
      }
    });
    
    // Calculate lesson-level statistics
    Object.values(lessons).forEach(lesson => {
      lesson.averageScore = lesson.maxScore > 0 ? (lesson.totalScore / lesson.maxScore) * 100 : 0;
      lesson.completionRate = lesson.totalQuestions > 0 ? (lesson.completedQuestions / lesson.totalQuestions) * 100 : 0;
      lesson.status = getItemStatus(lesson);
    });
    
    return Object.values(lessons);
  }, [items, assessments]);

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
        case 'lesson':
          comparison = a.lessonId.localeCompare(b.lessonId);
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
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return lessons;
  }, [groupedLessons, searchTerm, filterType, filterStatus, sortBy, sortOrder]);

  // Show configuration error if weights are missing
  if (configError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700 font-medium">Configuration Error</p>
        <p className="text-red-600 text-sm mt-2">{configError}</p>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-500">No lessons available yet.</p>
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
        <div className="text-sm font-medium text-gray-900">
          {lesson.lessonTitle}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {lesson.lessonId}
        </div>
      </td>
      <td className="px-6 py-4">
        <Badge className={`${getTypeColor(lesson.activityType)} text-xs`}>
          {lesson.activityType}
        </Badge>
      </td>
      <td className="px-6 py-4 text-center">
        {lesson.totalAttempts > 0 ? (
          <div className="flex flex-col items-center">
            <div className={`text-sm font-medium px-2 py-1 rounded ${getScoreColor(lesson.averageScore)}`}>
              {lesson.totalScore} / {lesson.maxScore}
            </div>
            <div className="text-xs text-gray-500 mt-1">{Math.round(lesson.averageScore)}%</div>
          </div>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )}
      </td>
      <td className="px-6 py-4 text-center">
        <div className="text-sm text-gray-600">
          {lesson.completedQuestions} / {lesson.totalQuestions}
        </div>
        <div className="text-xs text-gray-500">
          {Math.round(lesson.completionRate)}% complete
        </div>
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
        {lesson.lastActivity ? (
          <div className="text-sm text-gray-600">
            {new Date(lesson.lastActivity).toLocaleDateString()}
          </div>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )}
      </td>
      <td className="px-6 py-4 text-center">
        {lesson.questions.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onViewDetails}
            className="flex items-center gap-1"
          >
            <Eye className="h-4 w-4" />
            View Details
          </Button>
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
const extractLessonPrefix = (itemId) => {
  // Extract lesson prefix from item ID like "course4_01_welcome_rtd_academy_knowledge_check"
  // Returns "course4_01"
  const match = itemId.match(/^(course\d+_\d+)/);
  return match ? match[1] : null;
};

const generateLessonTitle = (lessonPrefix, firstQuestionTitle) => {
  // Extract lesson number from prefix like "course4_01" -> "01"
  const lessonNumber = lessonPrefix.split('_')[1];
  
  // Try to create a meaningful title from the question title
  // Remove common suffixes and clean up the title
  let title = firstQuestionTitle || '';
  title = title.replace(/Knowledge Check.*$/i, '');
  title = title.replace(/Question \d+.*$/i, '');
  title = title.replace(/- Question.*$/i, '');
  title = title.trim();
  
  // If we couldn't extract a good title, use a default
  if (!title) {
    title = `Lesson ${lessonNumber}`;
  } else if (!title.toLowerCase().includes('lesson')) {
    title = `Lesson ${lessonNumber} - ${title}`;
  }
  
  return title;
};

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