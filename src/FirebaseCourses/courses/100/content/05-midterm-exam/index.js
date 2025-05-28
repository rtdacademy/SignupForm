import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import LessonContent, { 
  TextSection, 
  MediaSection, 
  LessonSummary 
} from '../../../../components/content/LessonContent';
import { SimpleReadAloudText as ReadAloudText } from '../../../../components/TextToSpeech';

/**
 * Midterm Exam Component
 * Folder: 05-midterm-exam
 * 
 * This exam component provides information and preparation materials
 * The actual exam would typically be administered through a separate system
 */
const MidtermExam = ({ course, courseId, courseDisplay, itemConfig }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // This content's folder name - used for generating function names
  const CONTENT_FOLDER = '05-midterm-exam';

  useEffect(() => {
    if (!currentUser) {
      setError("You must be logged in to view this exam information");
      setLoading(false);
      return;
    }

    setLoading(false);
    console.log(`${courseDisplay.courseId}: Midterm Exam information loaded`);
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
        type: 'exam'
      }}
    >
      {/* Exam Overview */}
      <TextSection title="Midterm Exam Information">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
          <h3 className="font-medium text-lg mb-2 text-red-900">🎓 Midterm Examination</h3>
          <p className="text-red-800">
            This midterm exam will assess your understanding of all concepts covered 
            in the first half of the course. It represents a significant portion of 
            your final grade.
          </p>
        </div>
        
        <ReadAloudText 
          buttonText="Listen to Overview" 
          className="bg-blue-50 p-4 rounded-lg border border-blue-100 my-4"
        >
          <h3 className="font-medium text-lg mb-2">Exam Purpose</h3>
          <p className="mb-4">
            The midterm exam serves multiple purposes: it evaluates your mastery of 
            key concepts, identifies areas where you may need additional support, 
            and prepares you for the types of questions you'll encounter on the final exam.
          </p>
        </ReadAloudText>
      </TextSection>

      {/* Exam Details */}
      <TextSection title="Exam Details">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-lg mb-3 text-gray-900">📅 Logistics</h4>
            <ul className="space-y-2 text-gray-700">
              <li><strong>Date:</strong> [To be announced]</li>
              <li><strong>Time:</strong> [To be announced]</li>
              <li><strong>Duration:</strong> 90 minutes</li>
              <li><strong>Format:</strong> Online proctored exam</li>
              <li><strong>Questions:</strong> 50 multiple choice + 5 short answer</li>
            </ul>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-lg mb-3 text-gray-900">📚 Coverage</h4>
            <ul className="space-y-2 text-gray-700">
              <li><strong>Unit 1:</strong> Getting Started (10%)</li>
              <li><strong>Unit 2:</strong> Core Concepts (40%)</li>
              <li><strong>Unit 3:</strong> Advanced Topics (30%)</li>
              <li><strong>Unit 4:</strong> Applications (20%)</li>
            </ul>
          </div>
        </div>
      </TextSection>

      {/* Study Guide */}
      <TextSection title="Study Guide">
        <ReadAloudText
          buttonText="Listen to Study Guide"
          buttonVariant="solid"
          className="bg-green-50 p-4 rounded-lg border border-green-100 my-4"
        >
          <h3 className="font-medium text-lg mb-2">What to Review</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-green-900 mb-2">Key Concepts to Master:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Fundamental principles from Unit 2</li>
                <li>Advanced applications from Unit 3</li>
                <li>Connections between different topics</li>
                <li>Real-world examples and case studies</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-green-900 mb-2">Study Materials:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>All lesson content and readings</li>
                <li>Practice questions from each unit</li>
                <li>Assignment feedback and corrections</li>
                <li>Class discussions and notes</li>
              </ul>
            </div>
          </div>
        </ReadAloudText>
      </TextSection>

      {/* Preparation Tips */}
      <TextSection title="Preparation Tips">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-lg mb-3 text-yellow-900">📖 Study Strategies</h4>
            <ul className="space-y-2 text-yellow-800">
              <li>• Create a study schedule (start 1-2 weeks early)</li>
              <li>• Review material daily rather than cramming</li>
              <li>• Practice explaining concepts out loud</li>
              <li>• Form study groups with classmates</li>
              <li>• Take practice tests under timed conditions</li>
            </ul>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-medium text-lg mb-3 text-purple-900">💡 Exam Day Tips</h4>
            <ul className="space-y-2 text-purple-800">
              <li>• Get a good night's sleep before the exam</li>
              <li>• Eat a healthy meal beforehand</li>
              <li>• Test your technology in advance</li>
              <li>• Find a quiet, well-lit study space</li>
              <li>• Read all questions carefully</li>
            </ul>
          </div>
        </div>
      </TextSection>

      {/* Practice Questions */}
      <TextSection title="Sample Questions">
        <ReadAloudText
          buttonText="Listen to Sample Questions"
          buttonVariant="outline"
          className="bg-gray-50 p-4 rounded-lg border border-gray-100 my-4"
        >
          <h3 className="font-medium text-lg mb-2">Practice Questions</h3>
          <p className="mb-4">
            Here are some sample questions similar to what you'll see on the exam:
          </p>
          
          <div className="space-y-4">
            <div className="bg-white p-3 rounded border border-gray-200">
              <p className="font-medium text-gray-900 mb-2">Sample Multiple Choice:</p>
              <p className="text-gray-700 mb-2">
                Which of the following best describes the primary concept covered in Unit 2?
              </p>
              <ul className="list-alpha list-inside text-gray-600 ml-4">
                <li>Option A: Basic introduction</li>
                <li>Option B: Advanced applications</li>
                <li>Option C: Core foundational principles</li>
                <li>Option D: Final synthesis</li>
              </ul>
              <p className="text-sm text-green-600 mt-2">Answer: C</p>
            </div>
            
            <div className="bg-white p-3 rounded border border-gray-200">
              <p className="font-medium text-gray-900 mb-2">Sample Short Answer:</p>
              <p className="text-gray-700">
                Explain how the concepts from Unit 2 relate to the advanced topics 
                covered in Unit 3. Provide at least one specific example.
              </p>
            </div>
          </div>
        </ReadAloudText>
      </TextSection>

      {/* Grading and Policies */}
      <TextSection title="Grading Information">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="font-medium text-lg mb-3 text-blue-900">Grading Breakdown</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Point Distribution:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Multiple Choice: 100 points (2 pts each)</li>
                <li>• Short Answer: 50 points (10 pts each)</li>
                <li>• Total: 150 points</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Grade Scale:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• A: 135-150 points (90-100%)</li>
                <li>• B: 120-134 points (80-89%)</li>
                <li>• C: 105-119 points (70-79%)</li>
                <li>• D: 90-104 points (60-69%)</li>
              </ul>
            </div>
          </div>
        </div>
      </TextSection>

      {/* Important Policies */}
      <div className="mt-8 p-4 bg-red-50 rounded-lg border border-red-200">
        <h3 className="font-medium text-lg mb-2 text-red-900">⚠️ Important Policies</h3>
        <ul className="list-disc list-inside space-y-2 text-red-800">
          <li>Late exams will only be permitted for documented emergencies</li>
          <li>Academic integrity policies apply - no collaboration during the exam</li>
          <li>Technical issues should be reported immediately</li>
          <li>Make-up exams may be scheduled at instructor discretion</li>
        </ul>
      </div>

      {/* Support Resources */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-medium text-lg mb-2">Need Support?</h3>
        <p className="text-gray-700 mb-2">
          If you have questions about the exam or need study support:
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
          <li>Attend review sessions (dates to be announced)</li>
          <li>Visit office hours for one-on-one help</li>
          <li>Post questions in the course discussion forum</li>
          <li>Contact the instructor directly if needed</li>
        </ul>
      </div>
    </LessonContent>
  );
};

export default MidtermExam;