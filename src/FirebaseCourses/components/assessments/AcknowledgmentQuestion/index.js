import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { getDatabase, ref, onValue, set, serverTimestamp } from 'firebase/database';
import { useAuth } from '../../../../context/AuthContext';
import { CheckCircle } from 'lucide-react';

/**
 * AcknowledgmentQuestion Component
 * 
 * A clean, card-free component for confirmations and acknowledgments.
 * Uses the same true-false backend but with a minimal UI perfect for:
 * - End of lesson confirmations
 * - Safety acknowledgments
 * - Terms acceptance
 * - Reading confirmations
 */
const AcknowledgmentQuestion = ({
  // Required props
  courseId,
  itemId, // The lesson/item ID this acknowledgment is for
  questionId, // Unique ID for this acknowledgment question
  questionText = "I have reviewed and understood this content.",
  
  // Display props
  displayStyle = 'checkbox', // 'checkbox' or 'toggle'
  theme = 'purple',
  
  // Callbacks
  onComplete = () => {},
  onAttempt = () => {},
}) => {
  
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  
  const db = getDatabase();

  // Theme colors
  const getThemeConfig = (theme) => {
    const themes = {
      purple: {
        gradient: 'from-purple-600 to-indigo-600',
        accent: 'purple-600',
        light: 'purple-100',
        ring: 'ring-purple-200',
      },
      blue: {
        gradient: 'from-blue-600 to-cyan-600',
        accent: 'blue-600',
        light: 'blue-100',
        ring: 'ring-blue-200',
      },
      green: {
        gradient: 'from-emerald-600 to-teal-600',
        accent: 'emerald-600',
        light: 'emerald-100',
        ring: 'ring-emerald-200',
      }
    };
    return themes[theme] || themes.purple;
  };

  const themeConfig = getThemeConfig(theme);

  // Load acknowledgment data from user's node
  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      setError("User authentication required");
      setLoading(false);
      return;
    }

    let unsubscribeRef = null;
    
    const loadAcknowledgment = () => {
      setLoading(true);
      try {
        // Path: /users/{uid}/firebaseCourses/{courseId}/{itemId}/acknowledgments/{questionId}
        const dbPath = `users/${currentUser.uid}/firebaseCourses/${courseId}/${itemId}/acknowledgments/${questionId}`;
        const acknowledgmentRef = ref(db, dbPath);

        unsubscribeRef = onValue(acknowledgmentRef, (snapshot) => {
          const data = snapshot.val();
          
          if (data && data.acknowledged === true) {
            setAcknowledged(true);
            setHasCompleted(true);
          } else {
            setAcknowledged(false);
            setHasCompleted(false);
          }
          
          setLoading(false);
        }, (error) => {
          console.error("Error in database listener:", error);
          setError("Failed to load acknowledgment data");
          setLoading(false);
        });
      } catch (err) {
        console.error("Error loading acknowledgment:", err);
        setError("Failed to load acknowledgment.");
        setLoading(false);
      }
    };

    loadAcknowledgment();
    
    return () => {
      if (unsubscribeRef) {
        unsubscribeRef();
      }
    };
  }, [currentUser, courseId, itemId, questionId, db]);


  // Handle acknowledgment submission - write directly to user's node
  const handleSubmit = async (isAcknowledged) => {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    try {
      // Path: /users/{uid}/firebaseCourses/{courseId}/{itemId}/acknowledgments/{questionId}
      const dbPath = `users/${currentUser.uid}/firebaseCourses/${courseId}/${itemId}/acknowledgments/${questionId}`;
      const acknowledgmentRef = ref(db, dbPath);
      
      const acknowledgmentData = {
        acknowledged: isAcknowledged,
        timestamp: serverTimestamp(),
        questionText: questionText,
        itemId: itemId,
        questionId: questionId
      };

      await set(acknowledgmentRef, acknowledgmentData);
      
      setAcknowledged(isAcknowledged);
      setHasCompleted(isAcknowledged);
      
      onAttempt(isAcknowledged);
      
      if (isAcknowledged) {
        onComplete();
      }
    } catch (err) {
      console.error("Error saving acknowledgment:", err);
      setError("Failed to save acknowledgment: " + (err.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  // Render the checkbox
  const renderCheckbox = () => (
    <div className="flex items-center">
      <div className={`relative ${!hasCompleted ? 'animate-gentleBounce' : ''}`}>
        <label className="cursor-pointer">
          <input
            type="checkbox"
            checked={acknowledged === true}
            onChange={async (e) => {
              const newValue = e.target.checked;
              setAcknowledged(newValue);
              await handleSubmit(newValue);
            }}
            disabled={submitting}
            className={`h-8 w-8 rounded-md cursor-pointer transition-all duration-200 
              ${acknowledged === true 
                ? `text-${themeConfig.accent} ring-4 ${themeConfig.ring} ring-opacity-50` 
                : 'text-gray-400 hover:text-gray-500'
              } 
              focus:ring-4 focus:${themeConfig.ring} focus:ring-opacity-50
              ${submitting ? 'opacity-60 cursor-not-allowed' : ''}
            `}
          />
        </label>
        {/* Pulse effect when not checked and not completed */}
        {!hasCompleted && !acknowledged && (
          <div className={`absolute inset-0 rounded-md bg-${themeConfig.accent} animate-ping opacity-25 pointer-events-none`}></div>
        )}
      </div>
    </div>
  );

  // Render the toggle
  const renderToggle = () => (
    <div className="flex items-center space-x-3">
      <span className={`text-sm font-medium ${acknowledged === false ? 'text-gray-900' : 'text-gray-400'}`}>
        No
      </span>
      <button
        type="button"
        onClick={async () => {
          if (!submitting) {
            const newValue = !acknowledged;
            setAcknowledged(newValue);
            await handleSubmit(newValue);
          }
        }}
        disabled={submitting}
        className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-${themeConfig.accent} focus:ring-offset-2 ${
          acknowledged === true ? `bg-gradient-to-r ${themeConfig.gradient}` : 'bg-gray-300'
        } ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            acknowledged === true ? 'translate-x-7' : 'translate-x-0'
          }`}
        />
      </button>
      <span className={`text-sm font-medium ${acknowledged === true ? 'text-gray-900' : 'text-gray-400'}`}>
        Yes
      </span>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Error state
  if (error && !examMode) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        {error}
      </div>
    );
  }

  // Already completed state
  if (hasCompleted) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg"
      >
        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-green-800 font-medium">
            {questionText}
          </p>
        </div>
      </motion.div>
    );
  }

  // Main render
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Question text and control in a clean layout */}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {displayStyle === 'toggle' ? renderToggle() : renderCheckbox()}
        </div>
        
        <div className="flex-1">
          <p className="text-lg text-gray-800">
            {questionText}
          </p>
        </div>
      </div>

      {/* Show submitting state */}
      {submitting && (
        <div className="text-sm text-gray-500 text-right">
          Saving...
        </div>
      )}
    </motion.div>
  );
};

export default AcknowledgmentQuestion;