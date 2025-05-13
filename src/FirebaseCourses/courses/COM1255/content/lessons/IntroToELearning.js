import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { getFunctions } from 'firebase/functions';
import { getDatabase } from 'firebase/database';
import LessonContent, { TextSection, MediaSection, LessonSummary } from '../../../../components/content/LessonContent';
import { MultipleChoiceQuestion, DynamicQuestion } from '../../../../components/assessments';

/**
 * Student view of the "What is E-Learning?" lesson
 * Uses cloud functions for assessment questions
 */
const IntroToELearning = ({ course, courseId = '1' }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Assessment IDs for the lesson
  const multipleChoiceId = 'q1_elearning_benefits';
  const dynamicQuestionId = 'intro_dynamic_question';

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

    // The MultipleChoiceQuestion component handles its own database interactions
    setLoading(false);
    console.log("✅ IntroToELearning component initialized successfully");
  }, [currentUser, course]);
  
  // Debug props check in render function
  console.log("🏃‍♂️ Rendering IntroToELearning component with:", {
    course,
    courseId: effectiveCourseId,
    currentUser,
    assessmentIds: {
      multipleChoiceId,
      dynamicQuestionId
    },
    loading,
    error
  });

  return (
    <LessonContent
      lessonId="lesson_intro_elearning"
      title="What is E-Learning?"
      metadata={{ estimated_time: '30 minutes' }}
    >
      <TextSection title="What is E-Learning?">
        <p className="mb-4">
          E-Learning refers to the process of learning that takes place through digital technologies
          and the internet. It encompasses a wide range of learning activities, from
          accessing educational content online to participating in virtual classrooms
          and collaborative learning environments.
        </p>
        <p className="mb-4">
          E-Learning has transformed education by providing flexibility, accessibility,
          and personalization that traditional classroom learning often cannot match.
        </p>
      </TextSection>

      <MediaSection
        type="image"
        src="https://placehold.co/800x450?text=E-Learning+Illustration"
        alt="Illustration of E-Learning concepts"
        caption="E-Learning connects students to educational resources across distances"
      />

      <TextSection title="Benefits of E-Learning">
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li><strong>Flexibility:</strong> Learn at your own pace and on your own schedule</li>
          <li><strong>Accessibility:</strong> Access course materials from anywhere with an internet connection</li>
          <li><strong>Personalization:</strong> Customize your learning path based on your needs and preferences</li>
          <li><strong>Resource Variety:</strong> Engage with diverse multimedia content and interactive activities</li>
          <li><strong>Immediate Feedback:</strong> Receive instant assessment results and progress tracking</li>
        </ul>
      </TextSection>

      <div className="my-8">
        <h3 className="text-xl font-medium mb-4">Check Your Understanding</h3>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Multiple Choice Question - Using reusable component with course object */}
        <div className="mb-10">
          <MultipleChoiceQuestion
            courseId={effectiveCourseId}
            assessmentId={multipleChoiceId}
            cloudFunctionName="COM1255_IntroToELearningQ1"
            course={course}
            theme="blue"
            title="Multiple Choice Question"
            onCorrectAnswer={() => console.log("Student answered multiple choice question correctly!")}
            onAttempt={(isCorrect) => console.log(`Student made an attempt, correct: ${isCorrect}`)}
          />
        </div>

        {/* Dynamic Math Question - Using the DynamicQuestion component with course object */}
        <div className="mb-10">
          <DynamicQuestion
            courseId={effectiveCourseId}
            assessmentId={dynamicQuestionId}
            cloudFunctionName="COM1255_IntroToELearningDynamic"
            course={course}
            theme="green"
            title="Dynamic Math Question"
            onCorrectAnswer={() => console.log("Student answered math question correctly!")}
            showRegenerate={true} // Allow regeneration of math questions for more practice
          />
        </div>
      </div>

      <LessonSummary
        points={[
          "E-Learning uses digital technologies to deliver educational content and experiences",
          "Key benefits include flexibility, accessibility, and personalization",
          "E-Learning continues to evolve with advancements in technology",
          "Success in E-Learning requires good time management and self-discipline"
        ]}
      />
    </LessonContent>
  );
};

export default IntroToELearning;