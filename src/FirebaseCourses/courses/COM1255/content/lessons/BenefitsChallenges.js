import React from 'react';
import LessonContent, { TextSection, LessonSummary } from '../../../../components/content/LessonContent';

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

export default BenefitsChallenges;