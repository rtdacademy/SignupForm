import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import LessonContent, { 
  TextSection, 
  MediaSection, 
  LessonSummary 
} from '../../../../components/content/LessonContent';
import { AIMultipleChoiceQuestion } from '../../../../components/assessments';
import { SimpleReadAloudText as ReadAloudText } from '../../../../components/TextToSpeech';
import { getCloudFunctionName } from '../index';

/**
 * Advanced Topic 1 Lesson Component
 * Folder: 03-advanced-topic-1
 * 
 * This lesson uses the following cloud functions (if any):
 * - None specific to this lesson (uses shared AI question function)
 */
const AdvancedTopic1 = ({ course, courseId, courseDisplay, itemConfig }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // This content's folder name - used for generating function names
  const CONTENT_FOLDER = '03-advanced-topic-1';

  useEffect(() => {
    if (!currentUser) {
      setError("You must be logged in to view this lesson");
      setLoading(false);
      return;
    }

    setLoading(false);
    console.log(`${courseDisplay.courseId}: Advanced Topic 1 lesson loaded`);
  }, [currentUser, courseDisplay]);

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
      <TextSection title="Advanced Topic Overview">
        <p className="mb-4">
          Welcome to our first advanced topic! This lesson builds upon the core concepts 
          we've learned and introduces more sophisticated ideas and applications.
        </p>
        
        <ReadAloudText 
          buttonText="Listen to Introduction" 
          className="bg-purple-50 p-4 rounded-lg border border-purple-100 my-4"
        >
          <h3 className="font-medium text-lg mb-2">Why This Topic Matters</h3>
          <p className="mb-4">
            This advanced topic represents a significant step forward in your understanding. 
            It connects multiple concepts we've studied and shows how they work together 
            in complex scenarios.
          </p>
        </ReadAloudText>
      </TextSection>

      {/* Main Content Section */}
      <TextSection title="Key Advanced Concepts">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="font-medium text-lg mb-3">What You'll Learn</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>
              <strong>Advanced Concept 1:</strong> Building on foundational knowledge
            </li>
            <li>
              <strong>Advanced Concept 2:</strong> Connecting multiple ideas
            </li>
            <li>
              <strong>Advanced Concept 3:</strong> Real-world applications
            </li>
          </ul>
        </div>

        <ReadAloudText
          buttonText="Listen to Details"
          buttonVariant="solid"
          className="bg-green-50 p-4 rounded-lg border border-green-100 my-4"
        >
          <h3 className="font-medium text-lg mb-2">Deep Dive</h3>
          <p className="mb-4">
            This is where you would provide detailed explanations of the advanced 
            concepts. Use examples, analogies, and step-by-step explanations to 
            help students understand complex material.
          </p>
          <div className="bg-white p-3 rounded border border-green-200 mt-3">
            <h4 className="font-medium text-sm text-green-900 mb-1">Example:</h4>
            <p className="text-sm text-gray-700">
              Provide a detailed example that demonstrates the advanced concept in action.
            </p>
          </div>
        </ReadAloudText>
      </TextSection>

      {/* Assessment Section */}
      <div className="my-8">
        <h3 className="text-xl font-medium mb-4">Check Your Understanding</h3>
        
        {/* AI Multiple Choice Question using shared AI function */}
        <AIMultipleChoiceQuestion
          courseId={courseId}
          assessmentId="q1_advanced_topic"
          cloudFunctionName={getCloudFunctionName(courseDisplay.courseId, 'shared', 'aiQuestion')}
          course={course}
          theme={courseDisplay.theme?.primaryColor}
          title="Advanced Practice Question"
          topic="advanced_topic_1"
          difficulty="advanced"
          onCorrectAnswer={() => {
            console.log("Student answered advanced topic question correctly!");
          }}
          onAttempt={(isCorrect) => {
            console.log(`Student attempted advanced topic question, correct: ${isCorrect}`);
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
            "Advanced topics build upon core foundational concepts",
            "Complex ideas require connecting multiple learning areas",
            "Real-world applications demonstrate practical value",
            "Practice with challenging questions reinforces understanding",
            "Advanced knowledge opens doors to new opportunities"
          ]}
        />
      </ReadAloudText>

      {/* Next Steps */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-medium text-lg mb-2">Ready for the Next Challenge?</h3>
        <p className="text-gray-700">
          Excellent work mastering this advanced topic! You're now ready to apply 
          this knowledge in practical assignments and continue building your expertise.
        </p>
      </div>
    </LessonContent>
  );
};

export default AdvancedTopic1;