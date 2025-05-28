import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../src/context/AuthContext';
import { getFunctions } from 'firebase/functions';
import { getDatabase } from 'firebase/database';
import LessonContent, { 
  TextSection, 
  MediaSection, 
  LessonSummary 
} from '../../../../../src/FirebaseCourses/components/content/LessonContent';
import { AIMultipleChoiceQuestion } from '../../../../../src/FirebaseCourses/components/assessments';
import { SimpleReadAloudText as ReadAloudText } from '../../../../../src/FirebaseCourses/components/TextToSpeech';
import { getCloudFunctionName } from '../index';

/**
 * Getting Started Lesson Component
 * Folder: 01-getting-started
 * 
 * This lesson uses the following cloud functions (if any):
 * - None specific to this lesson (uses shared AI question function)
 */
const GettingStarted = ({ course, courseId, courseConfig, itemConfig }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const functions = getFunctions();
  const db = getDatabase();

  // This content's folder name - used for generating function names
  const CONTENT_FOLDER = '01-getting-started';

  useEffect(() => {
    if (!currentUser) {
      setError("You must be logged in to view this lesson");
      setLoading(false);
      return;
    }

    setLoading(false);
    console.log(`${courseConfig.courseId}: Getting Started lesson loaded`);
  }, [currentUser, courseConfig]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <LessonContent
      lessonId={itemConfig.itemId}
      title={itemConfig.title}
      metadata={{ 
        estimatedTime: itemConfig.estimatedTime,
        objectives: itemConfig.learningObjectives 
      }}
    >
      {/* Introduction Section */}
      <TextSection title="Welcome to {courseConfig.title}">
        <p className="mb-4">
          Welcome to this exciting journey! This lesson will help you get started 
          with {courseConfig.title} and understand what you'll be learning throughout 
          this course.
        </p>
        
        <ReadAloudText 
          buttonText="Listen to Introduction" 
          className="bg-purple-50 p-4 rounded-lg border border-purple-100 my-4"
        >
          <h3 className="font-medium text-lg mb-2">What to Expect</h3>
          <p className="mb-4">
            In this course, you'll explore various topics that will help you build 
            a strong foundation in the subject matter. Each lesson is designed to 
            be interactive and engaging, with opportunities to test your understanding 
            along the way.
          </p>
        </ReadAloudText>
      </TextSection>

      {/* Course Structure Section */}
      <TextSection title="Course Structure">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="font-medium text-lg mb-3">How This Course Works</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>
              <strong>Lessons:</strong> Interactive content with embedded assessments
            </li>
            <li>
              <strong>Assignments:</strong> Hands-on projects to apply what you learn
            </li>
            <li>
              <strong>Exams:</strong> Comprehensive assessments to test your knowledge
            </li>
          </ul>
        </div>

        <ReadAloudText
          buttonText="Listen to Tips"
          buttonVariant="solid"
          className="bg-green-50 p-4 rounded-lg border border-green-100 my-4"
        >
          <h3 className="font-medium text-lg mb-2">Tips for Success</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Complete lessons in order as they build upon each other</li>
            <li>Take advantage of the AI-powered practice questions</li>
            <li>Don't hesitate to review content multiple times</li>
            <li>Submit assignments on time to get the most from feedback</li>
          </ol>
        </ReadAloudText>
      </TextSection>

      {/* Video Section (if applicable) */}
      {itemConfig.resources?.find(r => r.type === 'video') && (
        <MediaSection 
          title="Introduction Video"
          type="video"
          src={itemConfig.resources.find(r => r.type === 'video').url || 'assets/welcome-video.mp4'}
          caption="Watch this brief introduction to get started"
        />
      )}

      {/* Assessment Section */}
      <div className="my-8">
        <h3 className="text-xl font-medium mb-4">Check Your Understanding</h3>
        
        {/* AI Multiple Choice Question using shared AI function */}
        <AIMultipleChoiceQuestion
          courseId={courseId}
          assessmentId="q1_intro_basics"
          cloudFunctionName={getCloudFunctionName(courseConfig.courseId, 'shared', 'aiQuestion')}
          course={course}
          theme={courseConfig.theme.primaryColor}
          title="Practice Question"
          topic="course_introduction"
          difficulty="beginner"
          onCorrectAnswer={() => {
            console.log("Student answered intro question correctly!");
          }}
          onAttempt={(isCorrect) => {
            console.log(`Student attempted intro question, correct: ${isCorrect}`);
          }}
        />
      </div>

      {/* Lesson Summary */}
      <ReadAloudText
        buttonText="Listen to Summary"
        buttonVariant="minimal"
        className="mt-8"
      >
        <LessonSummary
          points={[
            `Welcome to ${courseConfig.title} - an exciting learning journey`,
            "The course includes lessons, assignments, and exams",
            "Each lesson contains interactive content and assessments",
            "Take advantage of AI-powered questions for practice",
            "Complete activities in order for the best learning experience"
          ]}
        />
      </ReadAloudText>

      {/* Next Steps */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-medium text-lg mb-2">Ready to Continue?</h3>
        <p className="text-gray-700">
          Great job completing this introduction! When you're ready, move on to the 
          next lesson to begin exploring the core concepts of this course.
        </p>
      </div>
    </LessonContent>
  );
};

export default GettingStarted;