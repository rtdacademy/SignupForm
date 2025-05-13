import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { getFunctions } from 'firebase/functions';
import { getDatabase } from 'firebase/database';
import LessonContent, { TextSection, MediaSection, LessonSummary } from '../../../../components/content/LessonContent';
import { MultipleChoiceQuestion, AIMultipleChoiceQuestion } from '../../../../components/assessments';

/**
 * Lesson about the Benefits and Challenges of E-Learning
 * Includes an AI-powered question component
 */
const BenefitsChallenges = ({ course, courseId = '1' }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Assessment IDs for the lesson
  const aiQuestionId = 'ai_elearning_benefits_challenges';

  // Get courseId from the course object - check different possible formats
  // This handles different ways the courseId might be structured in the course object
  const effectiveCourseId = String(course?.CourseID || course?.courseId || course?.id || courseId || 'COM1255');

  // Firebase references
  const functions = getFunctions();
  const db = getDatabase();

  console.log("🏫 Using courseId:", effectiveCourseId);

  // Log course and currentUser to help with debugging
  useEffect(() => {
    console.log("🔍 COURSE OBJECT:", course);
    console.log("🔑 CURRENT USER:", currentUser);
    console.log("📊 COURSE ID:", effectiveCourseId);

    // Check if functions are available
    if (functions) {
      console.log("✅ Firebase Functions available");
    } else {
      console.error("❌ Firebase Functions not available");
    }

    // Check if database is available
    if (db) {
      console.log("✅ Firebase Database available");
    } else {
      console.error("❌ Firebase Database not available");
    }
  }, [course, currentUser, effectiveCourseId]);

  useEffect(() => {
    if (!currentUser) {
      console.error("❌ No authenticated user found");
      setError("You must be logged in to view this lesson");
      setLoading(false);
      return;
    }

    if (!course) {
      console.error("❌ No course data provided");
      setError("Course data is missing");
      setLoading(false);
      return;
    }

    if (!currentUser.email) {
      console.error("❌ User has no email");
      setError("User email is required");
      setLoading(false);
      return;
    }

    // The question components handle their own database interactions
    setLoading(false);
    console.log("✅ BenefitsChallenges component initialized successfully");
  }, [currentUser, course]);

  return (
    <LessonContent
      lessonId="lesson_benefits"
      title="Benefits and Challenges of E-Learning"
      metadata={{ estimated_time: '35 minutes' }}
    >
      <TextSection title="Key Benefits of E-Learning">
        <p className="mb-4">
          E-Learning offers numerous advantages for both students and educational institutions.
          Let's explore some of the most significant benefits in greater detail.
        </p>

        <h3 className="font-medium text-lg mb-2">Cost Effectiveness</h3>
        <p className="mb-4">
          E-Learning typically reduces costs associated with travel, physical materials, and facilities.
          Students save on commuting expenses, while institutions can serve more students with fewer
          physical resources.
        </p>

        <h3 className="font-medium text-lg mb-2">Global Reach</h3>
        <p className="mb-4">
          Online learning transcends geographical boundaries, allowing students from around the world
          to access quality education regardless of their location.
        </p>
      </TextSection>

      <TextSection title="Challenges of E-Learning">
        <p className="mb-4">
          Despite its many benefits, e-learning comes with its own set of challenges that
          both students and educators need to address.
        </p>

        <h3 className="font-medium text-lg mb-2">Technical Requirements</h3>
        <p className="mb-4">
          E-learning requires reliable internet access and appropriate devices, which may not
          be universally available. Technical issues can disrupt the learning experience.
        </p>

        <h3 className="font-medium text-lg mb-2">Self-Discipline and Motivation</h3>
        <p className="mb-4">
          Without the structure of a traditional classroom, students must develop stronger
          self-discipline and motivation to stay on track with their learning.
        </p>
      </TextSection>

      <div className="my-8">
        <h3 className="text-xl font-medium mb-4">Check Your Understanding</h3>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* AI Multiple Choice Question Component */}
        <div className="mb-10">
          <AIMultipleChoiceQuestion
            courseId={effectiveCourseId}
            assessmentId={aiQuestionId}
            cloudFunctionName="COM1255_BenefitsChallengesAI"
            course={course}
            theme="purple"
            title="AI-Generated Question"
            topic="elearning_benefits_challenges"
            difficulty="intermediate"
            onCorrectAnswer={() => console.log("Student answered AI question correctly!")}
            onAttempt={(isCorrect) => console.log(`Student made an attempt on AI question, correct: ${isCorrect}`)}
          />
        </div>
      </div>

      <LessonSummary
        points={[
          "E-Learning offers cost-effectiveness and global reach",
          "Students must navigate technical requirements and develop self-discipline",
          "Balancing the benefits and challenges is key to e-learning success",
          "Understanding these factors helps in designing effective online courses"
        ]}
      />
    </LessonContent>
  );
};

export default BenefitsChallenges;