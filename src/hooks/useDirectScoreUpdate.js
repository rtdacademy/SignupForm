import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../context/AuthContext';

/**
 * Hook for directly updating assessment scores
 * Use this for complex frontend interactions where the score is calculated on the client
 */
export const useDirectScoreUpdate = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  const updateScore = async ({
    courseId,
    assessmentId,
    score,
    metadata = {}
  }) => {
    setIsUpdating(true);
    setError(null);

    try {
      // Validate inputs
      if (!courseId || !assessmentId) {
        throw new Error('Course ID and Assessment ID are required');
      }

      if (typeof score !== 'number' || score < 0 || score > 1) {
        throw new Error('Score must be a number between 0 and 1');
      }

      const functions = getFunctions();
      const universalAssessments = httpsCallable(functions, 'universal_assessments');

      const result = await universalAssessments({
        operation: 'directScore',
        courseId: String(courseId),
        assessmentId,
        score,
        metadata,
        studentEmail: currentUser.email,
        userId: currentUser.uid,
        isStaff: false // Set to true if needed for staff operations
      });

      if (result.data.success) {
        return {
          success: true,
          score: result.data.score,
          message: result.data.message
        };
      } else {
        throw new Error(result.data.error || 'Failed to update score');
      }
    } catch (err) {
      console.error('Error updating score:', err);
      setError(err.message);
      return {
        success: false,
        error: err.message
      };
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateScore,
    isUpdating,
    error
  };
};