const { createStandardMultipleChoice } = require('../shared/assessment-types/standard-multiple-choice');

const course2_76_section_3_exam_question1 = createStandardMultipleChoice({
  questionId: 'course2_76_section_3_exam_question1',
  question: 'Which of the following best describes the photoelectric effect?',
  options: [
    'Light behaves only as a wave when interacting with matter',
    'Electrons are emitted from a metal surface when light of sufficient frequency strikes it',
    'All electromagnetic radiation has the same energy regardless of frequency',
    'The intensity of light determines the kinetic energy of emitted electrons'
  ],
  correctAnswer: 'Electrons are emitted from a metal surface when light of sufficient frequency strikes it',
  explanation: 'The photoelectric effect demonstrates that light has particle-like properties. When photons of sufficient energy (frequency) strike a metal surface, they can transfer their energy to electrons, causing them to be emitted. This was key evidence for the quantum nature of light.',
  metadata: {
    difficulty: 'intermediate',
    estimatedTime: 3,
    bloomsLevel: 'understanding',
    topic: 'Quantum Physics',
    subtopic: 'Photoelectric Effect'
  }
});

module.exports = { 
  course2_76_section_3_exam_question1 
};
