// Removed dependency on config file - settings are now handled directly in assessment configurations

// Assessment configurations for the master function
const assessmentConfigs = {
  'course2_78_diploma_exam_q1': {
    questions: [{
      questionText: 'Which of the following best describes the photoelectric effect?',
      options: [
        { id: 'a', text: 'Light behaves only as a wave when interacting with matter', feedback: 'Incorrect. The photoelectric effect shows light has particle properties.' },
        { id: 'b', text: 'Electrons are emitted from a metal surface when light of sufficient frequency strikes it', feedback: 'Correct! This demonstrates the particle nature of light.' },
        { id: 'c', text: 'All electromagnetic radiation has the same energy regardless of frequency', feedback: 'Incorrect. Energy depends on frequency: E = hf.' },
        { id: 'd', text: 'The intensity of light determines the kinetic energy of emitted electrons', feedback: 'Incorrect. Frequency determines kinetic energy, intensity affects the number of electrons.' }
      ],
      correctOptionId: 'b',
      explanation: 'The photoelectric effect demonstrates that light has particle-like properties. When photons of sufficient energy (frequency) strike a metal surface, they can transfer their energy to electrons, causing them to be emitted. This was key evidence for the quantum nature of light.',
      difficulty: 'intermediate',
      tags: ['quantum-physics', 'photoelectric-effect']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  }
};

module.exports = assessmentConfigs;
