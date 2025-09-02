import React, { useState, useEffect, useRef } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDatabase, ref, set } from 'firebase/database';
import { useAuth } from '../../../../context/AuthContext';

/**
 * Example Interactive Assessment Component
 * This demonstrates how to create a complex frontend interaction that calculates
 * a score based on user performance and securely submits it to the backend
 */
const InteractiveAssessment = ({
  courseId,
  assessmentId,
  onComplete,
  onAttempt,
  theme = 'blue',
  requireVerification = false,
  verificationSecret = null
}) => {
  const { currentUser } = useAuth();
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [interactionData, setInteractionData] = useState({
    startTime: Date.now(),
    endTime: null,
    events: [],
    interactionCount: 0,
    actions: []
  });

  // Track interaction start
  useEffect(() => {
    setInteractionData(prev => ({
      ...prev,
      startTime: Date.now()
    }));
  }, []);

  /**
   * Track user interactions for security validation
   */
  const trackInteraction = (eventType, data = {}) => {
    setInteractionData(prev => ({
      ...prev,
      events: [...prev.events, eventType],
      interactionCount: prev.interactionCount + 1,
      actions: [...prev.actions, {
        type: eventType,
        timestamp: Date.now(),
        data
      }]
    }));
  };

  /**
   * Generate verification token for secure submission
   */
  const generateVerificationToken = async () => {
    if (!requireVerification || !verificationSecret) return null;

    try {
      // This should match the backend token generation logic
      const crypto = window.crypto || window.msCrypto;
      const encoder = new TextEncoder();
      const data = encoder.encode(
        `${currentUser.email}:${courseId}:${assessmentId}:${interactionData.startTime}:${verificationSecret}`
      );
      
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      return hashHex;
    } catch (err) {
      console.error('Error generating verification token:', err);
      return null;
    }
  };

  /**
   * Example interaction: Drag and drop activity
   */
  const [dragItems, setDragItems] = useState([
    { id: 1, text: 'Item 1', correct: 'box1' },
    { id: 2, text: 'Item 2', correct: 'box2' },
    { id: 3, text: 'Item 3', correct: 'box3' }
  ]);
  
  const [dropBoxes, setDropBoxes] = useState({
    box1: null,
    box2: null,
    box3: null
  });

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('item', JSON.stringify(item));
    trackInteraction('drag_start', { itemId: item.id });
  };

  const handleDrop = (e, boxId) => {
    e.preventDefault();
    const item = JSON.parse(e.dataTransfer.getData('item'));
    
    setDropBoxes(prev => ({
      ...prev,
      [boxId]: item
    }));

    trackInteraction('drop', { itemId: item.id, boxId });

    // Calculate score based on correct placement
    const newBoxes = { ...dropBoxes, [boxId]: item };
    const correctPlacements = Object.entries(newBoxes).filter(
      ([boxId, item]) => item && item.correct === boxId
    ).length;
    
    const calculatedScore = correctPlacements / dragItems.length;
    setScore(calculatedScore);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  /**
   * Submit the calculated score to the backend
   */
  const submitScore = async () => {
    if (isSubmitting || submitted) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Mark interaction as complete
      const endTime = Date.now();
      const finalInteractionData = {
        ...interactionData,
        endTime,
        duration: endTime - interactionData.startTime
      };

      // Generate verification token if required
      const verificationToken = await generateVerificationToken();

      // First, enable direct scoring for this assessment in the database
      if (requireVerification) {
        const db = getDatabase();
        const configRef = ref(db, `courses/${courseId}/assessments/${assessmentId}/config`);
        await set(configRef, {
          allowDirectScoring: true,
          requiresVerification: requireVerification,
          verificationSecret: verificationSecret,
          minimumInteractionTime: 5000, // 5 seconds minimum
          minimumInteractions: 3
        });
      }

      const functions = getFunctions();
      const universalAssessments = httpsCallable(functions, 'universal_assessments');

      const result = await universalAssessments({
        operation: 'directScore',
        courseId: String(courseId),
        assessmentId,
        score,
        studentEmail: currentUser.email,
        userId: currentUser.uid,
        verificationToken,
        interactionData: finalInteractionData,
        metadata: {
          assessmentType: 'interactive_drag_drop',
          itemsCorrect: Object.entries(dropBoxes).filter(
            ([boxId, item]) => item && item.correct === boxId
          ).length,
          totalItems: dragItems.length,
          completionTime: finalInteractionData.duration
        }
      });

      if (result.data.success) {
        setSubmitted(true);
        trackInteraction('submission_success', { score });
        
        if (onAttempt) onAttempt(score >= 0.7); // Consider >= 70% as correct
        if (onComplete && score >= 0.7) onComplete();
      } else {
        throw new Error(result.data.error || 'Failed to submit score');
      }
    } catch (err) {
      console.error('Error submitting score:', err);
      setError(err.message);
      trackInteraction('submission_error', { error: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Theme colors
  const themeColors = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    indigo: 'bg-indigo-500 hover:bg-indigo-600',
    slate: 'bg-slate-500 hover:bg-slate-600'
  };

  return (
    <div className="interactive-assessment p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">
        Interactive Assessment: Drag and Drop
      </h3>
      
      <p className="mb-4 text-gray-600">
        Drag each item to its correct box. Your score is calculated based on correct placements.
      </p>

      {/* Drag items */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">Items to Place:</h4>
        <div className="flex gap-3">
          {dragItems.map(item => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              className="px-4 py-2 bg-gray-100 rounded cursor-move hover:bg-gray-200 transition-colors"
            >
              {item.text}
            </div>
          ))}
        </div>
      </div>

      {/* Drop boxes */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">Drop Zones:</h4>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(dropBoxes).map(([boxId, item]) => (
            <div
              key={boxId}
              onDrop={(e) => handleDrop(e, boxId)}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[100px] flex items-center justify-center"
            >
              {item ? (
                <div className={`px-3 py-1 rounded ${
                  item.correct === boxId ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {item.text}
                </div>
              ) : (
                <span className="text-gray-400">Drop here (Box {boxId.slice(-1)})</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Score display */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Current Score:</span>
          <span className={`text-2xl font-bold ${
            score >= 0.7 ? 'text-green-600' : 'text-orange-600'
          }`}>
            {(score * 100).toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              score >= 0.7 ? 'bg-green-500' : 'bg-orange-500'
            }`}
            style={{ width: `${score * 100}%` }}
          />
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={submitScore}
        disabled={isSubmitting || submitted || interactionData.interactionCount < 3}
        className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          themeColors[theme] || themeColors.blue
        }`}
      >
        {isSubmitting ? 'Submitting...' : submitted ? 'Score Submitted!' : 'Submit Score'}
      </button>

      {/* Submission feedback */}
      {submitted && (
        <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-md">
          <p className="font-medium">Assessment Complete!</p>
          <p>Your score of {(score * 100).toFixed(0)}% has been recorded.</p>
        </div>
      )}

      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
          <p>Interactions: {interactionData.interactionCount}</p>
          <p>Duration: {interactionData.endTime ? 
            `${((interactionData.endTime - interactionData.startTime) / 1000).toFixed(1)}s` : 
            'In progress'}</p>
          <p>Events: {interactionData.events.join(', ')}</p>
        </div>
      )}
    </div>
  );
};

export default InteractiveAssessment;