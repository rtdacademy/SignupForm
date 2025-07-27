import React from 'react';
import AssessmentSession from '../../../../components/AssessmentSession';

const L3738Assignment = ({ courseId, studentEmail, course }) => {
  const assessmentConfig = {
    assessmentId: 'assignment_l37_38',
    activityType: 'assignment',
    title: 'L37-38 Assignment - Particle Physics',
    description: '65-minute assessment covering quarks, leptons, and fundamental particle interactions. Topics include neutrino energy calculations, pair production, quark composition, and particle physics principles.',
    timeLimit: 65, // 65 minutes
    questions: [
      {
        questionId: 'course2_72_l3738_question1',
        type: 'multiple-choice',
        title: 'Neutrino Energy in Beta Decay',
        points: 1
      },
      {
        questionId: 'course2_72_l3738_question2',
        type: 'multiple-choice',
        title: 'Mass-Energy Conversion in Particle Creation',
        points: 1
      },
      {
        questionId: 'course2_72_l3738_question3',
        type: 'multiple-choice',
        title: 'Photon Wavelength from Annihilation',
        points: 1
      },
      {
        questionId: 'course2_72_l3738_question4',
        type: 'multiple-choice',
        title: 'Quark Composition and Charge',
        points: 1
      },
      {
        questionId: 'course2_72_l3738_question5',
        type: 'multiple-choice',
        title: 'Quark Confinement',
        points: 1
      },
      {
        questionId: 'course2_72_l3738_question6',
        type: 'multiple-choice',
        title: 'Leptons vs Hadrons',
        points: 1
      }
    ],
    instructions: [
      '⏰ This is a 65-minute timed assessment on particle physics.',
      '⚛️ Topics include beta decay, pair production, and particle interactions.',
      '🔬 Questions cover quarks, leptons, and fundamental forces.',
      '💾 Your progress will be automatically saved as you work through the questions.',
      '🔄 You can review and change your answers before final submission.',
      '📊 Detailed feedback will be provided for each question upon completion.',
      '⚠️ Once you start, the timer cannot be paused. Ensure you have uninterrupted time.',
      '✅ Aim for at least 70% (4/6 questions correct) for a passing grade.'
    ],
    passingGrade: 70
  };

  return (
    <AssessmentSession
      courseId={courseId}
      studentEmail={studentEmail}
      assessmentConfig={assessmentConfig}
      course={course}
      activityType="assignment"
    />
  );
};

export default L3738Assignment;
