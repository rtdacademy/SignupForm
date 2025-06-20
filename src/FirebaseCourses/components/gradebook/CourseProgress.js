import React, { useMemo } from 'react';
import { CheckCircle, Circle, Clock, Target, BookOpen, Award, Lock, Play } from 'lucide-react';
import { Progress } from '../../../components/ui/progress';
import { Badge } from '../../../components/ui/badge';

const CourseProgress = ({ course }) => {
  const gradebook = course?.Gradebook || {};
  const courseStructure = gradebook?.courseStructure || {};
  const items = gradebook?.items || {};
  const assessments = course?.Assessments || {};

  // Group items by lesson and calculate lesson-level progress
  const lessonProgress = useMemo(() => {
    const lessons = {};
    
    // Process items from gradebook
    Object.entries(items || {}).forEach(([itemId, itemData]) => {
      const lessonPrefix = extractLessonPrefix(itemId);
      if (!lessonPrefix) return;
      
      if (!lessons[lessonPrefix]) {
        lessons[lessonPrefix] = {
          lessonId: lessonPrefix,
          lessonNumber: parseInt(lessonPrefix.split('_')[1]),
          questions: [],
          totalQuestions: 0,
          completedQuestions: 0,
          totalScore: 0,
          maxScore: 0,
          lastActivity: 0,
          activityType: 'lesson',
          lessonTitle: '',
          isUnlocked: false,
          status: 'not_started'
        };
      }
      
      // Get assessment data for activityType
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
    
    // Calculate lesson statistics and status
    const sortedLessons = Object.values(lessons).sort((a, b) => a.lessonNumber - b.lessonNumber);
    
    sortedLessons.forEach((lesson, index) => {
      lesson.completionRate = lesson.totalQuestions > 0 ? (lesson.completedQuestions / lesson.totalQuestions) * 100 : 0;
      lesson.averageScore = lesson.maxScore > 0 ? (lesson.totalScore / lesson.maxScore) * 100 : 0;
      
      // Determine lesson status
      if (lesson.completedQuestions === 0) {
        lesson.status = 'not_started';
      } else if (lesson.completedQuestions === lesson.totalQuestions) {
        lesson.status = 'completed';
      } else {
        lesson.status = 'in_progress';
      }
      
      // Determine if lesson is unlocked (first lesson always unlocked, others unlock when previous is completed)
      if (index === 0) {
        lesson.isUnlocked = true;
      } else {
        const previousLesson = sortedLessons[index - 1];
        lesson.isUnlocked = previousLesson.status === 'completed';
      }
    });
    
    return sortedLessons;
  }, [items, assessments]);

  // Calculate overall stats based on lessons
  const stats = useMemo(() => {
    const total = lessonProgress.length;
    const completed = lessonProgress.filter(lesson => lesson.status === 'completed').length;
    const inProgress = lessonProgress.filter(lesson => lesson.status === 'in_progress').length;
    const notStarted = total - completed - inProgress;
    const completionPercentage = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      completed,
      inProgress,
      notStarted,
      completionPercentage
    };
  }, [lessonProgress]);

  // Find next lesson to work on
  const nextLesson = lessonProgress.find(lesson => lesson.isUnlocked && lesson.status !== 'completed');

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">Course Progress</h3>
            <p className="text-sm text-gray-600">Your journey through {courseStructure.title || 'this course'}</p>
          </div>
          <BookOpen className="h-8 w-8 text-green-600" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <ProgressStat 
            icon={<CheckCircle className="h-4 w-4 text-green-600" />}
            label="Lessons Completed"
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
            <span>Lessons Completed</span>
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

      {/* Lesson Progress Table */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-700">Lesson Progress</h4>
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lesson
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lessonProgress.map((lesson) => (
                  <LessonProgressRow key={lesson.lessonId} lesson={lesson} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
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
const LessonProgressRow = ({ lesson }) => {
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
    </tr>
  );
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

export default CourseProgress;