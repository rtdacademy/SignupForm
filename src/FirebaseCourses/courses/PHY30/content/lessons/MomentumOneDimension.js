import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { getFunctions } from 'firebase/functions';
import { getDatabase } from 'firebase/database';
import LessonContent, { TextSection, MediaSection, LessonSummary } from '../../../../components/content/LessonContent';
import { MultipleChoiceQuestion, DynamicQuestion } from '../../../../components/assessments';

/**
 * Lesson on Momentum in One Dimension for Physics 30
 */
const MomentumOneDimension = ({ course, courseId = '2' }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Assessment IDs for the lesson
  const multipleChoiceId = 'q1_momentum_concepts';
  const dynamicQuestionId = 'q2_momentum_calculation';

  // Get courseId from the course object
  const effectiveCourseId = String(course?.CourseID || course?.courseId || course?.id || courseId || '2');
  
  // Firebase references
  const functions = getFunctions();
  const db = getDatabase();

  useEffect(() => {
    if (!currentUser) {
      setError("You must be logged in to view this lesson");
      setLoading(false);
      return;
    }

    if (!course) {
      setError("Course data is missing");
      setLoading(false);
      return;
    }

    setLoading(false);
  }, [course, currentUser]);

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <LessonContent
      lessonId="lesson_1747281764415_851"
      title="Momentum in One Dimension"
      metadata={{ estimated_time: '45 minutes' }}
    >
      <TextSection title="Understanding Linear Momentum">
        <p className="mb-4">
          Linear momentum is a fundamental concept in physics that describes an object's tendency 
          to remain in motion. It is defined as the product of an object's mass and velocity:
        </p>
        <div className="bg-gray-100 p-4 rounded-lg text-center my-4">
          <p className="font-mono text-lg">p = mv</p>
          <p className="text-sm text-gray-600 mt-2">
            where p is momentum (kg⋅m/s), m is mass (kg), and v is velocity (m/s)
          </p>
        </div>
      </TextSection>

      <TextSection title="Conservation of Momentum">
        <p className="mb-4">
          One of the most important principles in physics is the conservation of momentum: 
          in a closed system, the total momentum before an interaction equals the total 
          momentum after the interaction.
        </p>
        <div className="bg-gray-100 p-4 rounded-lg text-center my-4">
          <p className="font-mono text-lg">p₁initial + p₂initial = p₁final + p₂final</p>
        </div>
        <p className="mb-4">
          This principle is especially useful when analyzing collisions between objects.
        </p>
      </TextSection>

      <MediaSection
        type="image"
        src="https://placehold.co/800x450?text=Momentum+Conservation+Diagram"
        alt="Diagram showing conservation of momentum in a collision"
        caption="Conservation of momentum in a one-dimensional collision"
      />

      <TextSection title="Types of Collisions">
        <ul className="list-disc pl-6 mb-6">
          <li className="mb-2">
            <strong>Elastic Collisions:</strong> Total kinetic energy is conserved
          </li>
          <li className="mb-2">
            <strong>Inelastic Collisions:</strong> Some kinetic energy is converted to other forms
          </li>
          <li className="mb-2">
            <strong>Perfectly Inelastic Collisions:</strong> Objects stick together after collision
          </li>
        </ul>
      </TextSection>

      <div className="my-8">
        <h3 className="text-xl font-medium mb-4">Check Your Understanding</h3>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-8">
          <div>
            <h4 className="text-lg font-medium mb-3">1. Momentum Concepts</h4>
            <MultipleChoiceQuestion
              courseId={effectiveCourseId}
              assessmentId={multipleChoiceId}
              cloudFunctionName="PHY30_MomentumOneDimension"
              course={course}
              theme="blue"
              title="Test Your Knowledge"
              onCorrectAnswer={() => console.log("Student answered momentum question correctly!")}
              onAttempt={(isCorrect) => console.log(`Student made an attempt, correct: ${isCorrect}`)}
            />
          </div>

          <div>
            <h4 className="text-lg font-medium mb-3">2. Conservation of Momentum Problem</h4>
            <p className="text-gray-600 mb-4">
              Let's solve a problem involving conservation of momentum in a collision.
            </p>
            <DynamicQuestion
              courseId={effectiveCourseId}
              assessmentId={dynamicQuestionId}
              cloudFunctionName="PHY30_MomentumOneDimension"
              course={course}
              theme="green"
              title="Collision Calculation"
              showRegenerate={true}
              onCorrectAnswer={() => console.log("Student completed momentum calculation correctly!")}
            />
          </div>
        </div>
      </div>

      <LessonSummary
        points={[
          "Linear momentum is the product of mass and velocity (p = mv)",
          "The total momentum of a closed system remains constant",
          "Conservation of momentum is especially useful for analyzing collisions",
          "Different types of collisions conserve different physical quantities",
          "Understanding momentum is crucial for solving real-world physics problems"
        ]}
      />
    </LessonContent>
  );
};

export default MomentumOneDimension;
