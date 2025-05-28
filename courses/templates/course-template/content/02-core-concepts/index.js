import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../src/context/AuthContext';
import LessonContent, { 
  TextSection, 
  MediaSection, 
  LessonSummary 
} from '../../../../../src/FirebaseCourses/components/content/LessonContent';
import { 
  MultipleChoiceQuestion, 
  AIMultipleChoiceQuestion 
} from '../../../../../src/FirebaseCourses/components/assessments';
import { SimpleReadAloudText as ReadAloudText } from '../../../../../src/FirebaseCourses/components/TextToSpeech';
import { getCloudFunctionName } from '../index';

/**
 * Core Concepts Lesson Component
 * Folder: 02-core-concepts
 * 
 * This lesson uses the following cloud functions:
 * - COURSEID_02_core_concepts_multipleChoice
 * - COURSEID_02_core_concepts_aiQuestion
 */
const CoreConcepts = ({ course, courseId, courseConfig, itemConfig }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // This content's folder name - used for generating function names
  const CONTENT_FOLDER = '02-core-concepts';

  useEffect(() => {
    if (!currentUser) {
      setError("You must be logged in to view this lesson");
      setLoading(false);
      return;
    }

    setLoading(false);
    console.log(`${courseConfig.courseId}: Core Concepts lesson loaded`);
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
      {/* Introduction */}
      <TextSection title="Introduction to Core Concepts">
        <p className="mb-4">
          In this lesson, we'll explore the fundamental concepts that form the 
          foundation of our subject. Understanding these core principles is essential 
          for your success in this course and beyond.
        </p>
      </TextSection>

      {/* Concept 1 */}
      <TextSection title="First Core Concept">
        <ReadAloudText 
          buttonText="Listen to Concept 1" 
          className="bg-blue-50 p-4 rounded-lg border border-blue-100 my-4"
        >
          <h3 className="font-medium text-lg mb-2">Understanding the Basics</h3>
          <p className="mb-4">
            This is where you would explain the first core concept in detail. 
            Use clear language and provide examples to help students understand 
            the material.
          </p>
          <div className="bg-white p-3 rounded border border-blue-200 mt-3">
            <h4 className="font-medium text-sm text-blue-900 mb-1">Example:</h4>
            <p className="text-sm text-gray-700">
              Provide a concrete example that illustrates this concept in action.
            </p>
          </div>
        </ReadAloudText>
      </TextSection>

      {/* Concept 2 */}
      <TextSection title="Second Core Concept">
        <ReadAloudText
          buttonText="Listen to Concept 2"
          buttonVariant="solid"
          className="bg-green-50 p-4 rounded-lg border border-green-100 my-4"
        >
          <h3 className="font-medium text-lg mb-2">Building on the Foundation</h3>
          <p className="mb-4">
            This concept builds upon what we just learned. Notice how these ideas 
            connect and reinforce each other.
          </p>
          
          <div className="mt-4 space-y-3">
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <p className="ml-3 text-gray-700">First key point about this concept</p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <p className="ml-3 text-gray-700">Second key point to remember</p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <p className="ml-3 text-gray-700">Third important aspect</p>
            </div>
          </div>
        </ReadAloudText>
      </TextSection>

      {/* Interactive Diagram or Visual Aid */}
      <TextSection title="Visual Representation">
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-600 mb-4">
            [This is where you would include an interactive diagram, chart, or visual aid]
          </p>
          <div className="inline-block bg-white p-8 rounded shadow-sm border border-gray-300">
            <p className="text-gray-500">Diagram Placeholder</p>
          </div>
        </div>
      </TextSection>

      {/* Practice Section with Assessments */}
      <div className="my-8">
        <h3 className="text-xl font-medium mb-4">Test Your Understanding</h3>
        <p className="text-gray-600 mb-6">
          Let's check your understanding of these core concepts with some practice questions.
        </p>
        
        {/* Standard Multiple Choice Question */}
        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-700 mb-3">
            Question 1: Concept Check
          </h4>
          <MultipleChoiceQuestion
            courseId={courseId}
            assessmentId="q1_core_concepts"
            cloudFunctionName={getCloudFunctionName(courseConfig.courseId, CONTENT_FOLDER, 'multipleChoice')}
            theme={courseConfig.theme.primaryColor}
            title="Concept Understanding"
          />
        </div>
        
        {/* AI-Generated Question */}
        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-700 mb-3">
            Question 2: Apply Your Knowledge
          </h4>
          <AIMultipleChoiceQuestion
            courseId={courseId}
            assessmentId="q2_core_application"
            cloudFunctionName={getCloudFunctionName(courseConfig.courseId, CONTENT_FOLDER, 'aiQuestion')}
            course={course}
            theme={courseConfig.theme.primaryColor}
            title="Application Question"
            topic="core_concepts_application"
            difficulty="intermediate"
            onCorrectAnswer={() => {
              console.log("Correct answer for core concepts application");
            }}
            onAttempt={(isCorrect) => {
              console.log(`Attempt on core concepts application: ${isCorrect}`);
            }}
          />
        </div>
      </div>

      {/* Application Examples */}
      <TextSection title="Real-World Applications">
        <ReadAloudText
          buttonText="Listen to Applications"
          buttonVariant="outline"
          iconPosition="right"
          className="bg-amber-50 p-4 rounded-lg border border-amber-100 my-4"
        >
          <h3 className="font-medium text-lg mb-2">How These Concepts Apply</h3>
          <p className="mb-4">
            Understanding these core concepts is crucial because they appear in many 
            real-world scenarios:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Application scenario 1 - explain how the concept is used</li>
            <li>Application scenario 2 - another practical example</li>
            <li>Application scenario 3 - demonstrate versatility</li>
          </ul>
        </ReadAloudText>
      </TextSection>

      {/* Summary */}
      <ReadAloudText
        buttonText="Listen to Summary"
        buttonVariant="minimal"
        className="mt-8"
      >
        <LessonSummary
          points={[
            "We explored the first core concept and its fundamental principles",
            "The second core concept builds upon the first, creating a foundation",
            "Visual representations help us understand complex relationships",
            "These concepts have numerous real-world applications",
            "Practice questions help reinforce your understanding"
          ]}
        />
      </ReadAloudText>

      {/* Next Steps */}
      <div className="mt-8 p-4 bg-purple-50 rounded-lg border border-purple-200">
        <h3 className="font-medium text-lg mb-2 text-purple-900">What's Next?</h3>
        <p className="text-purple-800">
          Now that you understand these core concepts, you're ready to apply them 
          in the upcoming assignment. Take some time to review this material before 
          moving forward.
        </p>
      </div>
    </LessonContent>
  );
};

export default CoreConcepts;