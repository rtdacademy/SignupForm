import React, { useState, useEffect } from 'react';
import { CheckCircle, ArrowRight, Trophy, Lock, Loader } from 'lucide-react';
import { toast } from 'sonner';

/**
 * NextLessonButton Component
 * 
 * Displays a button to navigate to the next lesson when the current lesson is completed.
 * The button only appears when:
 * 1. The current lesson meets all completion requirements
 * 2. All questions have been attempted
 * 3. A next lesson exists and is accessible
 */
const NextLessonButton = ({
  currentLessonCompleted = false,
  nextLessonInfo = null,
  onNavigateToNext,
  isLoading = false,
  courseProgress = 0,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Animate button appearance when lesson is completed
  useEffect(() => {
    if (currentLessonCompleted && nextLessonInfo) {
      // Delay appearance for smooth animation
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [currentLessonCompleted, nextLessonInfo]);

  // Don't render if lesson is not completed or no next lesson
  if (!currentLessonCompleted || !nextLessonInfo) {
    return null;
  }

  const handleNavigateToNext = async () => {
    if (isNavigating || !nextLessonInfo.accessible) return;

    setIsNavigating(true);
    
    try {
      // Show toast notification
      toast.success(`Navigating to: ${nextLessonInfo.title}`);
      
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Call navigation handler
      if (onNavigateToNext) {
        onNavigateToNext(nextLessonInfo.itemId);
      }
    } catch (error) {
      console.error('Error navigating to next lesson:', error);
      toast.error('Failed to navigate to next lesson');
    } finally {
      setIsNavigating(false);
    }
  };

  // Determine button state and messaging
  const isLocked = !nextLessonInfo.accessible;
  const buttonText = isNavigating 
    ? 'Loading...' 
    : isLocked 
      ? 'Next Lesson Locked' 
      : `Continue to: ${nextLessonInfo.title}`;

  return (
    <div 
      className={`
        transition-all duration-700 transform
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${className}
      `}
    >
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 shadow-sm">
        <div className="text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-4">
            {courseProgress >= 100 ? (
              <Trophy className="w-12 h-12 text-yellow-500 animate-bounce" />
            ) : (
              <CheckCircle className="w-12 h-12 text-green-500 animate-pulse" />
            )}
          </div>

          {/* Completion Message */}
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {courseProgress >= 100 ? 'Course Complete!' : 'Lesson Complete!'}
          </h3>
          
          <p className="text-gray-600 mb-4">
            {courseProgress >= 100 
              ? 'Congratulations on completing the entire course!' 
              : 'Great work! You\'ve mastered this lesson.'}
          </p>

          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
              <span>Course Progress</span>
              <span className="font-semibold text-blue-600">{courseProgress}%</span>
            </div>
            <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${courseProgress}%` }}
              />
            </div>
          </div>

          {/* Next Lesson Information */}
          {nextLessonInfo && !isLocked && (
            <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Next up:</p>
              <p className="text-sm font-medium text-gray-800">
                {nextLessonInfo.unitTitle && (
                  <span className="text-gray-500">{nextLessonInfo.unitTitle} • </span>
                )}
                {nextLessonInfo.title}
              </p>
              {nextLessonInfo.type && (
                <span className={`
                  inline-block mt-2 px-2 py-1 text-xs font-medium rounded
                  ${nextLessonInfo.type === 'lesson' ? 'bg-blue-100 text-blue-800' : ''}
                  ${nextLessonInfo.type === 'assignment' ? 'bg-emerald-100 text-emerald-800' : ''}
                  ${nextLessonInfo.type === 'exam' ? 'bg-purple-100 text-purple-800' : ''}
                  ${nextLessonInfo.type === 'quiz' ? 'bg-amber-100 text-amber-800' : ''}
                  ${nextLessonInfo.type === 'lab' ? 'bg-pink-100 text-pink-800' : ''}
                `}>
                  {nextLessonInfo.type.charAt(0).toUpperCase() + nextLessonInfo.type.slice(1)}
                </span>
              )}
            </div>
          )}

          {/* Locked Message */}
          {isLocked && (
            <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-center gap-2 text-yellow-800">
                <Lock className="w-4 h-4" />
                <p className="text-sm font-medium">Next lesson is locked</p>
              </div>
              {nextLessonInfo.reason && (
                <p className="text-xs text-yellow-700 mt-1">{nextLessonInfo.reason}</p>
              )}
            </div>
          )}

          {/* Navigation Button */}
          {!isLocked && (
            <button
              onClick={handleNavigateToNext}
              disabled={isNavigating || isLoading}
              className={`
                relative inline-flex items-center justify-center gap-2
                px-6 py-3 rounded-lg font-semibold text-white
                bg-gradient-to-r from-blue-600 to-purple-600
                hover:from-blue-700 hover:to-purple-700
                transform transition-all duration-200
                ${isNavigating || isLoading 
                  ? 'opacity-75 cursor-not-allowed' 
                  : 'hover:scale-105 shadow-lg hover:shadow-xl'}
              `}
            >
              {isNavigating || isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>{buttonText}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          )}

          {/* Alternative Actions */}
          {courseProgress >= 100 && (
            <div className="mt-4 text-sm text-gray-600">
              <p>Or review any lesson from the navigation menu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NextLessonButton;