/**
 * Cloud Functions for Physics 30 course assessments and logic
 */

const { generateSeed } = require('../../utils');

exports.generateQuestion = async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new Error('Unauthorized');
  }

  const { questionId, studentId } = data;
  const seed = generateSeed(studentId, questionId);

  // Example question generation - replace with actual physics questions
  const questions = {
    momentum_q1: {
      text: "A 2.0 kg object moving at 3.0 m/s collides with a 1.5 kg object at rest. After the collision, the 2.0 kg object moves at 1.0 m/s in the same direction. What is the velocity of the 1.5 kg object after the collision?",
      correctAnswer: 3.33,
      tolerance: 0.01
    },

    if (allCorrect) {
      return {
        isCorrect: true,
        feedback: "Excellent! You correctly calculated all displacements. Remember: displacement is the change in position (final position - initial position)."
      };
    } else {
      return {
        isCorrect: false,
        feedback: "Some answers are incorrect. Remember: displacement = final position - initial position. Check your signs carefully!",
        correctAnswer: question.correctAnswers.join(', ')
      };
    }
  } catch (err) {
    return {
      isCorrect: false,
      feedback: "Please enter your answers as comma-separated numbers (e.g., 6,-10,4,28,-16)",
      correctAnswer: question.correctAnswers.join(', ')
    };
  }
};

exports.handler = async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new Error('Unauthorized');
  }

  const { operation } = data;
  
  // Generate a seed based on student and question IDs for consistent generation
  const seed = data.studentEmail + data.assessmentId;
  
  switch (operation) {
    case 'generate':
      return generateDisplacementQuestion(seed);
      
    case 'evaluate':
      const question = generateDisplacementQuestion(seed);
      return {
        result: evaluateDisplacementAnswer(question, data.answer)
      };
      
    default:
      throw new Error('Invalid operation');
  }
};
    },
    // Add more questions as needed
  };

  return {
    questionId,
    seed,
    ...questions[questionId]
  };
};

exports.evaluateAnswer = async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new Error('Unauthorized');
  }

  const { questionId, answer, studentId } = data;
  
  // Regenerate the question using the same seed
  const seed = generateSeed(studentId, questionId);
  const question = await exports.generateQuestion({ questionId, studentId }, context);

  // Check if the answer is within tolerance
  const isCorrect = Math.abs(answer - question.correctAnswer) <= question.tolerance;

  return {
    correct: isCorrect,
    feedback: isCorrect 
      ? "Correct! Your understanding of conservation of momentum is excellent."
      : "Try again. Remember to use conservation of momentum: p₁ = p₂"
  };
};

// Add more course-specific functions as needed
