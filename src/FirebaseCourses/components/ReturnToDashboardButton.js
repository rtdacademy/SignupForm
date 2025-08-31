import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Home, Sparkles, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

/**
 * ReturnToDashboardButton Component
 * 
 * A prominent button that appears when a student completes the entire course.
 * Provides navigation back to the dashboard with celebratory styling.
 */
const ReturnToDashboardButton = ({
  isLastLesson = false,
  isCourseComplete = false,
  courseTitle = 'Course',
  completionPercentage = 0,
  className = ''
}) => {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  // Only render if on last lesson AND course is complete
  if (!isLastLesson || !isCourseComplete) {
    return null;
  }

  const handleReturnToDashboard = async () => {
    if (isNavigating) return;

    setIsNavigating(true);
    
    try {
      // Show success toast
      toast.success('Congratulations on completing the course! 🎉', {
        description: 'Returning to dashboard...',
        duration: 3000
      });
      
      // Small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error navigating to dashboard:', error);
      toast.error('Failed to navigate to dashboard');
      setIsNavigating(false);
    }
  };

  return (
    <>
      {/* Fixed bottom bar */}
      <div className={`
        fixed bottom-0 left-0 right-0 z-50
        bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600
        shadow-2xl border-t-4 border-white/20
        animate-slide-up
        ${className}
      `}>
        {/* Animated background sparkles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          {/* Animated sparkle elements */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${15 + i * 15}%`,
                animationDelay: `${i * 0.5}s`,
                top: '20%'
              }}
            >
              <Sparkles className="w-4 h-4 text-white/30" />
            </div>
          ))}
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left side - Completion message */}
            <div className="flex items-center gap-3 text-white">
              <div className="relative">
                <Trophy className="w-8 h-8 md:w-10 md:h-10 text-yellow-300 animate-bounce" />
                <div className="absolute -inset-1 bg-yellow-300/30 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
                  Congratulations! Course Complete!
                  <CheckCircle className="w-5 h-5 text-green-300" />
                </h3>
                <p className="text-sm md:text-base opacity-90">
                  You've successfully completed {courseTitle}
                </p>
              </div>
            </div>

            {/* Right side - Return button */}
            <button
              onClick={handleReturnToDashboard}
              disabled={isNavigating}
              className={`
                flex items-center gap-3 px-6 py-3 md:px-8 md:py-4
                bg-white text-purple-700 font-semibold
                rounded-full shadow-lg hover:shadow-xl
                transform transition-all duration-300
                ${isNavigating 
                  ? 'opacity-75 cursor-not-allowed scale-95' 
                  : 'hover:scale-105 hover:bg-yellow-50'
                }
                animate-pulse-slow
              `}
            >
              <Home className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-base md:text-lg">
                {isNavigating ? 'Returning...' : 'Return to Dashboard'}
              </span>
              {!isNavigating && (
                <span className="text-2xl animate-bounce-slow">🎉</span>
              )}
            </button>
          </div>

          {/* Progress indicator */}
          <div className="mt-3 md:mt-4">
            <div className="flex items-center justify-center gap-2 text-white/90 text-sm">
              <span className="font-medium">Course Progress:</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: '100%' }}
                  ></div>
                </div>
                <span className="font-bold text-green-300">100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add some custom animations via style tag */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(180deg);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.5s ease-out forwards;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 1s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default ReturnToDashboardButton;