import React, { useState } from 'react';
import { ArrowRight, ChevronRight, Loader, Lock } from 'lucide-react';
import { toast } from 'sonner';

/**
 * NextLessonButtonFloating Component
 * 
 * A floating button that allows navigation to the next lesson.
 * Respects lesson accessibility and expands navigation when clicked.
 */
const NextLessonButtonFloating = ({
  currentLessonInfo = null,
  nextLessonInfo = null,
  onNavigateToNext,
  onExpandNavigation,
  isAccessible = true,
  accessReason = '',
  className = ''
}) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Don't render if no next lesson exists or if it's not accessible
  if (!nextLessonInfo || !isAccessible) {
    return null;
  }

  const handleNavigateToNext = async () => {
    if (isNavigating || !isAccessible) {
      if (!isAccessible) {
        toast.info(accessReason || 'Next lesson is locked. Complete the current lesson first.');
      }
      return;
    }

    setIsNavigating(true);
    
    try {
      // First expand navigation to show context
      if (onExpandNavigation) {
        onExpandNavigation();
      }
      
      // Small delay to let navigation expand
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Show toast notification
      toast.success(`Navigating to: ${nextLessonInfo.title}`);
      
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Another small delay for visual feedback
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
      setIsHovered(false);
    }
  };

  return (
    <>
      {/* Main floating button - positioned lower on screen */}
      <button
        onClick={handleNavigateToNext}
        disabled={isNavigating}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          fixed bottom-6 right-24 z-40
          flex items-center justify-center
          w-14 h-14 rounded-full
          bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600
          text-white shadow-lg hover:shadow-xl
          transform transition-all duration-300
          ${isNavigating ? 'opacity-75 cursor-not-allowed' : 'hover:scale-110'}
          ${className}
        `}
        title={`Next: ${nextLessonInfo.title}`}
        aria-label="Go to next lesson"
      >
        {isNavigating ? (
          <Loader className="w-6 h-6 animate-spin" />
        ) : (
          <ArrowRight className="w-6 h-6" />
        )}
      </button>
      
      {/* Hover tooltip - shows lesson title */}
      {isHovered && !isNavigating && (
        <div className="fixed bottom-6 right-40 mr-2 z-40 animate-fade-in">
          <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 shadow-lg max-w-xs">
            <div className="font-medium">Next Lesson</div>
            <div className="text-xs opacity-90 mt-0.5">
              {nextLessonInfo.title}
            </div>
            <div className="absolute top-1/2 -right-2 transform -translate-y-1/2">
              <div className="w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NextLessonButtonFloating;