import React, { useState, useEffect } from 'react';
import { ProgressProvider } from '../../context/CourseProgressContext';
import LessonContent, { TextSection, MediaSection, LessonSummary } from '../../components/content/LessonContent';
import MultipleChoiceQuestion from '../../components/assessments/MultipleChoiceQuestion';
import { Badge } from '../../../components/ui/badge';
import courseData from './courseStructure';

// Type-specific styling
const typeColors = {
  lesson: 'bg-blue-100 text-blue-800 border-blue-200',
  assignment: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  exam: 'bg-purple-100 text-purple-800 border-purple-200',
  info: 'bg-amber-100 text-amber-800 border-amber-200',
};

/**
 * Components for specific content items
 * In a real implementation, these would likely be imported from separate files
 */
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

const BenefitsChallenges = () => (
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

/**
 * Content registry - maps content IDs to their respective components
 */
const contentRegistry = {
  "intro_elearning": IntroToELearning,
  "benefits_challenges": BenefitsChallenges,
  // Additional content components would be added here
};

/**
 * The main COM1255 Course component
 */
const COM1255Course = ({ course, activeItemId: externalActiveItemId, onItemSelect }) => {
  // Maintain internal state that can sync with external props
  const [internalActiveItemId, setInternalActiveItemId] = useState(null);
  const courseId = course.CourseID;

  // Get structure from the static file instead of from the course object
  const { structure } = courseData;

  // Use the activeItemId from props if provided, otherwise use internal state
  const activeItemId = externalActiveItemId !== undefined ? externalActiveItemId : internalActiveItemId;

  // Find the first item ID to use as default if none is active
  useEffect(() => {
    if (!activeItemId && structure && structure.length > 0 && structure[0].items.length > 0) {
      const firstItemId = structure[0].items[0].itemId;

      // Update internal state
      setInternalActiveItemId(firstItemId);

      // Notify parent component if callback is provided
      if (onItemSelect) {
        onItemSelect(firstItemId);
      }
    }
  }, [activeItemId, structure, onItemSelect]);

  // Find the active item in the course structure
  const activeItem = React.useMemo(() => {
    if (!activeItemId || !structure) return null;

    for (const unit of structure) {
      for (const item of unit.items) {
        if (item.itemId === activeItemId) {
          return item;
        }
      }
    }
    return null;
  }, [activeItemId, structure]);

  // Render the appropriate content based on the active item
  const renderContent = () => {
    if (!activeItem) {
      return (
        <div className="text-center p-10">
          <h2 className="text-xl font-semibold text-gray-700">Select a lesson to begin</h2>
        </div>
      );
    }

    // Get the content component based on the content ID in the active item
    const ContentComponent = contentRegistry[activeItem.content];

    if (ContentComponent) {
      return (
        <div className="p-2">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-gray-800">{activeItem.title}</h1>
            <Badge className={`${typeColors[activeItem.type] || 'bg-gray-100'} px-2 py-1`}>
              {activeItem.type.charAt(0).toUpperCase() + activeItem.type.slice(1)}
            </Badge>
          </div>
          <ContentComponent />
        </div>
      );
    }

    // Fallback if content is not registered
    return (
      <div className="p-6 bg-amber-50 border border-amber-200 rounded-md">
        <h2 className="text-xl font-semibold text-amber-800 mb-2">{activeItem.title}</h2>
        <p className="text-amber-700">
          Content for this {activeItem.type} is currently under development.
        </p>
      </div>
    );
  };

  // Debug log to track state changes
  useEffect(() => {
    console.log('COM1255Course: Active item ID:', activeItemId);
  }, [activeItemId]);

  return (
    <ProgressProvider courseId={courseId}>
      <div className="max-w-4xl mx-auto p-6">
        {renderContent()}
      </div>
    </ProgressProvider>
  );
};

export default COM1255Course;