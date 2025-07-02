import React, { useMemo, useState } from 'react';
import { CheckCircle, Circle, Clock, Target, BookOpen, Award, Lock, Play, Eye } from 'lucide-react';
import { Progress } from '../../../components/ui/progress';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { 
  validateGradeDataStructures, 
  calculateLessonScore, 
  checkLessonCompletion 
} from '../../utils/gradeCalculations';
import LessonDetailModal from './LessonDetailModal';

const CourseProgress = ({ course, allCourseItems = [] }) => {
  // State for lesson detail modal
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Validate that we have the required data structures
  const validation = validateGradeDataStructures(course);
  
  const gradebook = course?.Gradebook || {};
  const courseStructure = gradebook?.courseStructure || {};
  const grades = course?.Grades?.assessments || {}; // Use reliable grades source
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
      
      // Use reliable calculation function for lesson scores
      const lessonScore = calculateLessonScore(lessonId, course);
      
      // Check if lesson meets completion requirements
      const isCompleted = checkLessonCompletion(lessonId, course);
      
      // Calculate completion rate and status
      const completionRate = lessonScore.totalQuestions > 0 ? 
        (lessonScore.attempted / lessonScore.totalQuestions) * 100 : 0;
      
      let status = 'not_started';
      if (lessonScore.attempted > 0) {
        status = isCompleted ? 'completed' : 'in_progress';
      }
      
      // Determine unlock status
      let isUnlocked = true; // Default to unlocked
      if (globalIndex > 0 && progressionRequirements.enabled !== false) {
        // Check if previous item is completed
        const previousItemId = allCourseItems[globalIndex - 1].itemId;
        const previousCompleted = checkLessonCompletion(previousItemId, course);
        isUnlocked = previousCompleted;
      }
      
      // Global item number: 1, 2, 3, 4, 5... across all units
      const itemNumber = globalIndex + 1;
      
      return {
        lessonId: lessonId,
        lessonNumber: itemNumber,
        lessonTitle: courseItem.title || `${courseItem.type || 'Item'} ${itemNumber}`,
        activityType: courseItem.type || 'lesson',
        contentPath: courseItem.contentPath || lessonId,
        totalQuestions: lessonScore.totalQuestions,
        completedQuestions: lessonScore.attempted,
        totalScore: lessonScore.score,
        maxScore: lessonScore.total,
        completionRate: completionRate,
        averageScore: lessonScore.percentage,
        status: status,
        isUnlocked: isUnlocked,
        meetsRequirements: isCompleted,
        valid: lessonScore.valid
      };
    });
    
    return items;
  }, [allCourseItems, course, progressionRequirements]);

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
            value={Math.round(stats.completionPercentage)}
            suffix="%"
            color="blue"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Course Items Completed</span>
            <span>{stats.completed} / {stats.total} ({Math.round(stats.completionPercentage)}%)</span>
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
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courseItemsProgress.map((item) => (
                  <LessonProgressRow 
                    key={item.lessonId} 
                    lesson={item} 
                    onViewDetails={() => handleViewDetails(item)}
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
const LessonProgressRow = ({ lesson, onViewDetails }) => {
  const getStatusIcon = () => {
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

  return (
    <tr className={`${lesson.isUnlocked ? 'hover:bg-gray-50' : 'bg-gray-50 opacity-60'}`}>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="text-xs font-medium text-gray-500 bg-gray-100 rounded px-2 py-1">
            {lesson.lessonNumber.toString().padStart(2, '0')}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {lesson.lessonTitle}
            </div>
            <div className="text-xs text-gray-500">{lesson.activityType}</div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 text-center">
        <div className="flex flex-col items-center">
          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
            <div 
              className={`h-2 rounded-full ${getProgressColor(lesson.completionRate)}`}
              style={{ width: `${lesson.completionRate}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-600">{Math.round(lesson.completionRate)}%</div>
        </div>
      </td>
      
      <td className="px-6 py-4 text-center">
        <div className="text-sm text-gray-600">
          {lesson.completedQuestions} / {lesson.totalQuestions}
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
        <div className="flex items-center justify-center gap-2">
          {getAccessIcon()}
          <span className="text-xs text-gray-600">
            {lesson.isUnlocked ? 'Unlocked' : 'Locked'}
          </span>
        </div>
      </td>
      
      <td className="px-6 py-4 text-center">
        {lesson.totalQuestions > 0 ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={onViewDetails}
            className="flex items-center gap-1"
          >
            <Eye className="h-4 w-4" />
            View Details
          </Button>
        ) : (
          <span className="text-xs text-gray-400">No questions</span>
        )}
      </td>
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