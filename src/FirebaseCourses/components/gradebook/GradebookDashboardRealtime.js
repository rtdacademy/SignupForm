import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, List, Target } from 'lucide-react';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { useAuth } from '../../../context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import GradebookSummary, { getLastActivityTime, getRelativeTime } from './GradebookSummary';
import AssessmentGridProps from './AssessmentGridProps';
import { createEnrichedCourseItems, getCourseUnitsList } from '../../utils/courseItemsUtils';
import { sanitizeEmail } from '../../../utils/sanitizeEmail';

/**
 * GradebookDashboard with realtime Firebase listeners
 * Fetches all necessary data and passes enriched course items as props to child components
 */
const GradebookDashboardRealtime = ({ course, profile, lessonAccessibility = {}, showHeader = true }) => {

  const { currentUser } = useAuth();
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [selectedCourseItem, setSelectedCourseItem] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  // Realtime data states
  const [realtimeGradebook, setRealtimeGradebook] = useState(null);
  const [realtimeSchedule, setRealtimeSchedule] = useState(null);
  const [realtimeAssessments, setRealtimeAssessments] = useState(null);
  const [realtimeExamSessions, setRealtimeExamSessions] = useState(null);
  const [realtimeGrades, setRealtimeGrades] = useState(null);
  const [itemStructure, setItemStructure] = useState(null);
  const [realtimeCourseStructure, setRealtimeCourseStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get student email for Firebase paths - prioritize StudentEmail from profile (teacher view)
  const studentEmail = profile?.StudentEmail || currentUser?.email;
  const courseId = course?.courseDetails?.courseId || course?.id;
  
  // Use the sanitizeEmail utility for consistent Firebase key formatting
  const userEmailKey = studentEmail ? sanitizeEmail(studentEmail) : null;

  // Set up Firebase realtime listeners
  useEffect(() => {
    if (!userEmailKey || !courseId) {
      console.warn('GradebookDashboardRealtime: Missing userEmailKey or courseId:', { userEmailKey, courseId });
      setLoading(false);
      return;
    }

    const database = getDatabase();
    

    // Create refs for all the data we need
    const gradebookRef = ref(database, `students/${userEmailKey}/courses/${courseId}/Gradebook`);
    const scheduleRef = ref(database, `students/${userEmailKey}/courses/${courseId}/ScheduleJSON`);
    const assessmentsRef = ref(database, `students/${userEmailKey}/courses/${courseId}/Assessments`);
    const examSessionsRef = ref(database, `students/${userEmailKey}/courses/${courseId}/ExamSessions`);
    const gradesRef = ref(database, `students/${userEmailKey}/courses/${courseId}/Grades`);
    const itemStructureRef = ref(database, `courses/${courseId}/course-config/itemStructure`);
    const courseStructureRef = ref(database, `courses/${courseId}/course-config/courseStructure`);

    setLoading(true);
    setError(null);

    // Error handler function
    const handleError = (error, pathName) => {
      setError(prev => prev || `Failed to load ${pathName}`);
    };

    // Set up listeners with proper error handling
    const unsubscribeGradebook = onValue(gradebookRef, (snapshot) => {
      const data = snapshot.exists() ? snapshot.val() : null;
      setRealtimeGradebook(data);
    }, (error) => handleError(error, 'gradebook'));

    const unsubscribeSchedule = onValue(scheduleRef, (snapshot) => {
      const data = snapshot.exists() ? snapshot.val() : null;
      setRealtimeSchedule(data);
    }, (error) => handleError(error, 'schedule'));

    const unsubscribeAssessments = onValue(assessmentsRef, (snapshot) => {
      const data = snapshot.exists() ? snapshot.val() : null;
      setRealtimeAssessments(data);
    }, (error) => handleError(error, 'assessments'));

    const unsubscribeExamSessions = onValue(examSessionsRef, (snapshot) => {
      const data = snapshot.exists() ? snapshot.val() : null;
      setRealtimeExamSessions(data);
    }, (error) => handleError(error, 'examSessions'));

    const unsubscribeGrades = onValue(gradesRef, (snapshot) => {
      const data = snapshot.exists() ? snapshot.val() : null;
      setRealtimeGrades(data);
    }, (error) => handleError(error, 'grades'));

    const unsubscribeItemStructure = onValue(itemStructureRef, (snapshot) => {
      const data = snapshot.exists() ? snapshot.val() : null;
      setItemStructure(data);
    }, (error) => handleError(error, 'itemStructure'));

    const unsubscribeCourseStructure = onValue(courseStructureRef, (snapshot) => {
      const data = snapshot.exists() ? snapshot.val() : null;
      if (data && data.units) {
        console.log('🔍 CourseStructure listener update: Loaded', data.units.length, 'units');
        // Log first unit for debugging
        if (data.units.length > 0 && data.units[0].items) {
          const firstItem = data.units[0].items[0];
          console.log('🔍 First item has questions:', firstItem?.questions?.length || 0);
        }
      } else {
        console.log('🔍 CourseStructure listener update: No data found');
      }
      setRealtimeCourseStructure(data);
    }, (error) => handleError(error, 'courseStructure'));

    // Set loading to false after a brief delay to allow initial data to load
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

    // Cleanup function
    return () => {
      clearTimeout(loadingTimeout);
      unsubscribeGradebook();
      unsubscribeSchedule();
      unsubscribeAssessments();
      unsubscribeExamSessions();
      unsubscribeGrades();
      unsubscribeItemStructure();
      unsubscribeCourseStructure();
    };
  }, [userEmailKey, courseId]);

  // Create enriched course object from realtime data
  const enrichedCourse = useMemo(() => {
    if (!realtimeGradebook && !realtimeSchedule && !realtimeAssessments && !realtimeCourseStructure) {
      return course; // Return original course if no realtime data yet
    }

    // Create enriched course object by combining original course with realtime data
    const enriched = {
      ...course,
      // Override with realtime data where available, but preserve course structure
      Gradebook: realtimeGradebook ? {
        ...realtimeGradebook,
        // Preserve original courseStructure from course.Gradebook if it exists
        courseStructure: course.Gradebook?.courseStructure || realtimeGradebook.courseStructure,
        // Preserve courseConfig with courseStructure
        courseConfig: course.Gradebook?.courseConfig ? {
          ...course.Gradebook.courseConfig,
          courseStructure: course.Gradebook?.courseConfig?.courseStructure || realtimeGradebook.courseConfig?.courseStructure
        } : realtimeGradebook.courseConfig
      } : course.Gradebook,
      ScheduleJSON: realtimeSchedule || course.ScheduleJSON,
      Assessments: realtimeAssessments || course.Assessments,
      ExamSessions: realtimeExamSessions || course.ExamSessions,
      Grades: realtimeGrades || course.Grades,
      // Add additional data structures that might be needed
      courseDetails: {
        ...course.courseDetails,
        'course-config': {
          ...course.courseDetails?.['course-config'],
          // Use realtime courseStructure if available, otherwise fall back to original
          courseStructure: realtimeCourseStructure || course.courseDetails?.['course-config']?.courseStructure,
          itemStructure: itemStructure || course.courseDetails?.['course-config']?.itemStructure,
          gradebook: {
            ...course.courseDetails?.['course-config']?.gradebook
          }
        }
      },
      // Add flags to indicate this is realtime data
      _isRealtimeData: true,
      _lastRealtimeUpdate: Date.now()
    };

    return enriched;
  }, [course, realtimeGradebook, realtimeSchedule, realtimeAssessments, realtimeExamSessions, realtimeGrades, itemStructure, realtimeCourseStructure]);

  // Create enriched course items using the utility function with realtime data
  const enrichedCourseItems = useMemo(() => {
    if (!enrichedCourse) {
      return [];
    }
    
    const unitsList = getCourseUnitsList(enrichedCourse);
    console.log('🔍 GradebookDashboardRealtime: Units list found:', unitsList?.length || 0, 'units');
    
    const enrichedItems = createEnrichedCourseItems(enrichedCourse, unitsList);
    console.log('🔍 GradebookDashboardRealtime: Enriched items created:', enrichedItems?.length || 0, 'items');
    
    // Debug: Check if first few items have questions
    if (enrichedItems.length > 0) {
      const firstItem = enrichedItems[0];
      console.log('🔍 GradebookDashboardRealtime: First item questions:', firstItem?.questions?.length || 0, 'questions');
    }
    
    return enrichedItems;
  }, [enrichedCourse]);

  // Event handlers
  const handleReviewAssessment = (assessment) => {
    setSelectedAssessment(assessment);
    setReviewModalOpen(true);
  };

  const handleCourseItemSelect = (item) => {
    setSelectedCourseItem(item);
  };

  // Show error state if critical error
  if (error && !loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Gradebook</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Page Header - conditionally rendered */}
      {showHeader && (
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Gradebook</h1>
              <p className="text-gray-600 mt-1">Track your progress and manage your learning journey</p>
           
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Last updated</p>
              <p className="text-sm font-medium text-gray-700">
                {getRelativeTime(getLastActivityTime(enrichedCourse))}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="assessments" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Lessons
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <GradebookSummary 
            course={enrichedCourse} 
            profile={profile} 
            enrichedCourseItems={enrichedCourseItems}
          />
        </TabsContent>

        <TabsContent value="assessments" className="space-y-6">
          <AssessmentGridProps 
            enrichedCourseItems={enrichedCourseItems}
            course={enrichedCourse}
            profile={profile}
            onReviewAssessment={handleReviewAssessment}
            loading={loading}
            error={error}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {selectedCourseItem && (
        <div>
          {/* CourseItemDetailModal would go here if needed */}
          <p>Course item detail modal not implemented yet</p>
        </div>
      )}

    </div>
  );
};

// Quick Action Cards Component (kept from original for compatibility)
const QuickActionCards = ({ course }) => {
  const gradebook = course?.Gradebook || {};
  const items = gradebook?.items || {};
  const summary = gradebook?.summary || {};

  const overallPercentage = summary.percentage > 0 && summary.percentage < 1 
    ? summary.percentage * 100 
    : summary.percentage;

  const actions = [];

  // Incomplete items
  const incompleteCount = Object.values(items).filter(item => item.attempts === 0).length;
  if (incompleteCount > 0) {
    actions.push({
      title: 'Complete Missing Assessments',
      description: `${incompleteCount} assessments need to be started`,
      color: 'blue',
      icon: '📝'
    });
  }

  // Low scores to retry
  const lowScoreCount = Object.values(items).filter(item => 
    item.attempts > 0 && item.score < item.maxScore * 0.7
  ).length;
  if (lowScoreCount > 0) {
    actions.push({
      title: 'Improve Low Scores',
      description: `${lowScoreCount} assessments scored below 70%`,
      color: 'orange',
      icon: '🎯'
    });
  }

  // Overall grade improvement
  if (overallPercentage < 85) {
    actions.push({
      title: 'Boost Your Grade',
      description: `Current: ${Math.round(overallPercentage)}% - Aim for 85%+`,
      color: 'green',
      icon: '📈'
    });
  }

  // Course completion
  const completedCount = Object.values(items).filter(item => item.status === 'completed').length;
  const completionRate = items.length > 0 ? (completedCount / Object.keys(items).length) * 100 : 0;
  if (completionRate < 100) {
    actions.push({
      title: 'Course Completion',
      description: `${Math.round(completionRate)}% complete - Keep going!`,
      color: 'purple',
      icon: '🏆'
    });
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {actions.slice(0, 4).map((action, index) => (
        <div key={index} className={`bg-${action.color}-50 border border-${action.color}-200 rounded-lg p-4`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">{action.icon}</span>
            <div>
              <h5 className="font-medium text-gray-800">{action.title}</h5>
              <p className="text-sm text-gray-600">{action.description}</p>
            </div>
          </div>
        </div>
      ))}
      {actions.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⭐</span>
            <div>
              <h5 className="font-medium text-green-800">Excellent Work!</h5>
              <p className="text-sm text-green-700">You're performing well across all areas.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradebookDashboardRealtime;