import React from 'react';
import LessonContent, { TextSection, MediaSection, LessonSummary } from '../../../../components/content/LessonContent';
import MultipleChoiceQuestion from '../../../../components/assessments/MultipleChoiceQuestion';

const IntroToELearning = () => (
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
      <MultipleChoiceQuestion
        questionId="q1"
        questionText="Which of the following is NOT typically considered a benefit of E-Learning?"
        options={[
          { id: "a", text: "Learning at your own pace" },
          { id: "b", text: "Access to educational resources from anywhere" },
          { id: "c", text: "Reduced need for self-discipline" },
          { id: "d", text: "Immediate feedback on assessments" }
        ]}
        correctOptionId="c"
        explanation="E-Learning actually requires more self-discipline than traditional classroom learning since students must manage their own time and learning schedule without direct supervision."
      />
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

export default IntroToELearning;