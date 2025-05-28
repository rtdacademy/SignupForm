import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../../context/AuthContext';
import { getFunctions } from 'firebase/functions';
import { getDatabase } from 'firebase/database';
import LessonContent, { 
  TextSection, 
  MediaSection, 
  LessonSummary 
} from '../../../../components/content/LessonContent';
import { AIMultipleChoiceQuestion } from '../../../../components/assessments';
import { SimpleReadAloudText as ReadAloudText } from '../../../../components/TextToSpeech';
import { getCloudFunctionName } from '../index';

/**
 * Advanced Topic 1 - Physics 30
 * Folder: 03-advanced-topic-1
 * 
 * This lesson covers advanced physics concepts
 */
const AdvancedTopic1 = ({ course, courseId, courseConfig, itemConfig }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const functions = getFunctions();
  const db = getDatabase();

  // This content's folder name - used for generating function names
  const CONTENT_FOLDER = '03-advanced-topic-1';

  useEffect(() => {
    if (!currentUser) {
      setError("You must be logged in to view this lesson");
      setLoading(false);
      return;
    }

    setLoading(false);
    console.log(`${courseConfig.courseId}: Advanced Topic 1 lesson loaded`);
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
      title={itemConfig.title || "Advanced Physics Concepts"}
      metadata={{ 
        estimatedTime: itemConfig.estimatedTime || 60,
        objectives: itemConfig.learningObjectives || [
          "Understand advanced physics principles",
          "Apply complex formulas to solve problems",
          "Analyze real-world applications"
        ]
      }}
    >
      {/* Introduction Section */}
      <TextSection title="Introduction to Advanced Physics">
        <p className="mb-4">
          In this lesson, we'll explore advanced physics concepts that build upon 
          the fundamentals you've already learned. These topics require careful 
          attention and practice to master.
        </p>
        
        <ReadAloudText 
          buttonText="Listen to Introduction" 
          className="bg-purple-50 p-4 rounded-lg border border-purple-100 my-4"
        >
          <h3 className="font-medium text-lg mb-2">What You'll Learn</h3>
          <p className="mb-4">
            This lesson covers complex physics phenomena including quantum mechanics 
            principles, relativistic effects, and advanced electromagnetic theory. 
            You'll learn how these concepts apply to modern technology and scientific 
            research.
          </p>
        </ReadAloudText>
      </TextSection>

      {/* Main Content Section */}
      <TextSection title="Key Concepts">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="font-medium text-lg mb-3">Advanced Topics Overview</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>
              <strong>Quantum Mechanics:</strong> Wave-particle duality and uncertainty principle
            </li>
            <li>
              <strong>Special Relativity:</strong> Time dilation and length contraction
            </li>
            <li>
              <strong>Electromagnetic Waves:</strong> Maxwell's equations and applications
            </li>
            <li>
              <strong>Nuclear Physics:</strong> Radioactive decay and nuclear reactions
            </li>
          </ul>
        </div>

        <ReadAloudText
          buttonText="Listen to Examples"
          buttonVariant="solid"
          className="bg-green-50 p-4 rounded-lg border border-green-100 my-4"
        >
          <h3 className="font-medium text-lg mb-2">Real-World Applications</h3>
          <p className="mb-4">
            These advanced physics concepts are not just theoretical - they have 
            practical applications in:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>GPS satellite technology (relativistic corrections)</li>
            <li>Medical imaging (MRI and PET scans)</li>
            <li>Quantum computing and cryptography</li>
            <li>Nuclear power generation</li>
          </ul>
        </ReadAloudText>
      </TextSection>

      {/* Formula Section */}
      <TextSection title="Important Formulas">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-medium text-lg mb-3">Key Equations to Remember</h3>
          <div className="space-y-3 font-mono">
            <div>
              <strong>Time Dilation:</strong> Δt' = Δt / √(1 - v²/c²)
            </div>
            <div>
              <strong>Energy-Mass Equivalence:</strong> E = mc²
            </div>
            <div>
              <strong>de Broglie Wavelength:</strong> λ = h/p
            </div>
            <div>
              <strong>Uncertainty Principle:</strong> ΔxΔp ≥ ℏ/2
            </div>
          </div>
        </div>
      </TextSection>

      {/* Practice Problems */}
      <TextSection title="Practice Problems">
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <h3 className="font-medium text-lg mb-3">Try These Problems</h3>
          <ol className="list-decimal list-inside space-y-3 text-gray-700">
            <li>
              A spacecraft travels at 0.8c relative to Earth. Calculate the time 
              dilation factor experienced by the astronauts.
            </li>
            <li>
              An electron has a momentum of 2.0 × 10⁻²⁴ kg·m/s. What is its 
              de Broglie wavelength?
            </li>
            <li>
              Calculate the rest energy of a proton with mass 1.67 × 10⁻²⁷ kg.
            </li>
          </ol>
        </div>
      </TextSection>

      {/* Assessment Section */}
      <div className="my-8">
        <h3 className="text-xl font-medium mb-4">Check Your Understanding</h3>
        
        {/* AI Multiple Choice Question using shared AI function */}
        <AIMultipleChoiceQuestion
          courseId={courseId}
          assessmentId="q1_advanced_physics"
          cloudFunctionName={getCloudFunctionName(courseConfig.courseId, 'shared', 'aiQuestion')}
          course={course}
          theme={courseConfig.theme?.primaryColor || '#3B82F6'}
          title="Advanced Physics Question"
          topic="advanced_physics_concepts"
          difficulty="advanced"
          onCorrectAnswer={() => {
            console.log("Student answered advanced question correctly!");
          }}
          onAttempt={(isCorrect) => {
            console.log(`Student attempted advanced question, correct: ${isCorrect}`);
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
            "Advanced physics explores quantum mechanics and relativity",
            "These concepts explain phenomena at very small and very large scales",
            "Key formulas include time dilation, E=mc², and the uncertainty principle",
            "Applications include GPS, medical imaging, and quantum computing",
            "Practice problems help reinforce understanding of complex concepts"
          ]}
        />
      </ReadAloudText>

      {/* Next Steps */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-medium text-lg mb-2">Next: Reflection Assignment</h3>
        <p className="text-gray-700">
          Excellent work on these advanced concepts! Your next task will be to 
          complete a reflection assignment where you'll apply what you've learned 
          to analyze a real-world physics phenomenon.
        </p>
      </div>
    </LessonContent>
  );
};

export default AdvancedTopic1;