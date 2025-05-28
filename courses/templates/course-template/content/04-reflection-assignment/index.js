import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import LessonContent, { 
  TextSection, 
  MediaSection, 
  LessonSummary 
} from '../../../../components/content/LessonContent';
import { SimpleReadAloudText as ReadAloudText } from '../../../../components/TextToSpeech';

/**
 * Reflection Assignment Component
 * Folder: 04-reflection-assignment
 * 
 * This assignment is for reflection and doesn't typically use cloud functions
 */
const ReflectionAssignment = ({ course, courseId, courseDisplay, itemConfig }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // This content's folder name - used for generating function names
  const CONTENT_FOLDER = '04-reflection-assignment';

  useEffect(() => {
    if (!currentUser) {
      setError("You must be logged in to view this assignment");
      setLoading(false);
      return;
    }

    setLoading(false);
    console.log(`${courseDisplay.courseId}: Reflection Assignment loaded`);
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
        objectives: itemConfig.learningObjectives,
        type: 'assignment'
      }}
    >
      {/* Assignment Overview */}
      <TextSection title="Assignment Overview">
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4">
          <h3 className="font-medium text-lg mb-2 text-amber-900">📝 Reflection Assignment</h3>
          <p className="text-amber-800">
            This assignment asks you to reflect on what you've learned so far and 
            connect the concepts to your own experiences and understanding.
          </p>
        </div>
        
        <ReadAloudText 
          buttonText="Listen to Instructions" 
          className="bg-blue-50 p-4 rounded-lg border border-blue-100 my-4"
        >
          <h3 className="font-medium text-lg mb-2">Assignment Purpose</h3>
          <p className="mb-4">
            Reflection is a powerful learning tool that helps you process new information, 
            identify connections, and deepen your understanding. This assignment will help 
            you consolidate your learning and prepare for more advanced topics.
          </p>
        </ReadAloudText>
      </TextSection>

      {/* Assignment Instructions */}
      <TextSection title="Instructions">
        <div className="space-y-6">
          {/* Part 1 */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-lg mb-3 text-gray-900">Part 1: Concept Review</h4>
            <p className="text-gray-700 mb-3">
              Review the core concepts we've covered in this course. For each concept, write:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>A brief summary in your own words</li>
              <li>Why this concept is important</li>
              <li>How it connects to other concepts we've learned</li>
            </ul>
          </div>

          {/* Part 2 */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-lg mb-3 text-gray-900">Part 2: Personal Connections</h4>
            <p className="text-gray-700 mb-3">
              Think about how these concepts relate to your life and experiences:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>Can you think of examples from your daily life that illustrate these concepts?</li>
              <li>How might you use this knowledge in the future?</li>
              <li>What questions do you still have about these topics?</li>
            </ul>
          </div>

          {/* Part 3 */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-lg mb-3 text-gray-900">Part 3: Looking Forward</h4>
            <p className="text-gray-700 mb-3">
              Consider your learning journey and future goals:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>What has been the most challenging aspect of this course so far?</li>
              <li>What has been the most interesting or surprising?</li>
              <li>How do you plan to apply what you've learned?</li>
            </ul>
          </div>
        </div>
      </TextSection>

      {/* Submission Guidelines */}
      <TextSection title="Submission Guidelines">
        <ReadAloudText
          buttonText="Listen to Guidelines"
          buttonVariant="solid"
          className="bg-green-50 p-4 rounded-lg border border-green-100 my-4"
        >
          <h3 className="font-medium text-lg mb-2">How to Submit</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <p className="ml-3 text-gray-700">Write your reflection (minimum 500 words)</p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <p className="ml-3 text-gray-700">Address all three parts of the assignment</p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <p className="ml-3 text-gray-700">Submit through the course platform by the due date</p>
            </div>
          </div>
        </ReadAloudText>
      </TextSection>

      {/* Grading Criteria */}
      <TextSection title="Grading Criteria">
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <h3 className="font-medium text-lg mb-3 text-purple-900">What We're Looking For</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-purple-800 mb-2">Content (40%)</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Clear understanding of concepts</li>
                <li>• Thoughtful personal connections</li>
                <li>• Evidence of reflection</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-purple-800 mb-2">Writing Quality (30%)</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Clear and organized</li>
                <li>• Proper grammar and spelling</li>
                <li>• Meets length requirement</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-purple-800 mb-2">Completeness (20%)</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• All parts addressed</li>
                <li>• Submitted on time</li>
                <li>• Follows guidelines</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-purple-800 mb-2">Insight (10%)</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Original thinking</li>
                <li>• Meaningful connections</li>
                <li>• Personal growth evident</li>
              </ul>
            </div>
          </div>
        </div>
      </TextSection>

      {/* Tips for Success */}
      <ReadAloudText
        buttonText="Listen to Tips"
        buttonVariant="minimal"
        className="mt-8"
      >
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 className="font-medium text-lg mb-2 text-yellow-900">💡 Tips for Success</h3>
          <ul className="list-disc list-inside space-y-2 text-yellow-800">
            <li>Set aside uninterrupted time to think and write</li>
            <li>Review your course notes before writing</li>
            <li>Be honest and specific in your reflections</li>
            <li>Proofread your work before submitting</li>
            <li>Don't wait until the last minute - good reflection takes time</li>
          </ul>
        </div>
      </ReadAloudText>

      {/* Support Resources */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-medium text-lg mb-2">Need Help?</h3>
        <p className="text-gray-700">
          If you have questions about this assignment or need writing support, 
          don't hesitate to reach out through the course discussion forum or 
          office hours. Reflection is a skill that improves with practice!
        </p>
      </div>
    </LessonContent>
  );
};

export default ReflectionAssignment;