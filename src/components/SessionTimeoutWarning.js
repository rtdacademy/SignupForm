import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, AlertTriangle, Clock } from 'lucide-react';

const SessionTimeoutWarning = () => {
  const { user, signOut, refreshSession, tokenExpirationTime } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const checkIntervalRef = useRef(null);
  const activityTimeoutRef = useRef(null);
  
  // Configure timing thresholds
  const WARNING_TIME = 5 * 60 * 1000; // 5 minutes warning before logout
  const ACTIVITY_THRESHOLD = 120 * 1000; // 2 minutes of inactivity to consider user inactive
  
  // Track user activity
  const trackActivity = useCallback(() => {
    const now = Date.now();
    
    // Reset inactivity tracking when user becomes active
    setIsActive(true);
    setLastActivityTime(now);
    
    // Hide warning if it was showing
    if (showWarning) {
      setShowWarning(false);
    }
    
    // Clear activity timeout
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
    
    // Set timeout to mark user as inactive after threshold
    activityTimeoutRef.current = setTimeout(() => {
      setIsActive(false);
    }, ACTIVITY_THRESHOLD);
    
    // Refresh the session in Auth context
    refreshSession();
  }, [showWarning, refreshSession]);

  // Set up activity tracking
  useEffect(() => {
    if (!user) return;

    // Throttle events to prevent excessive updates
    let timeout;
    const throttledActivity = () => {
      if (!timeout) {
        timeout = setTimeout(() => {
          trackActivity();
          timeout = null;
        }, 200); // Throttle time to reduce processing
      }
    };
    
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, throttledActivity, { passive: true });
    });
    
    // Initial activity mark
    trackActivity();
    
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, throttledActivity);
      });
      
      if (timeout) clearTimeout(timeout);
      if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [user, trackActivity]);

  // Check for token expiration and show warnings
  useEffect(() => {
    if (!user) return;
    
    const checkTokenStatus = () => {
      if (!tokenExpirationTime) return;
      
      const now = Date.now();
      const timeRemaining = tokenExpirationTime - now;
      
      // Update remaining time
      setRemainingTime(timeRemaining);
      
      // Show warning when token is about to expire
      if (!isActive && timeRemaining < WARNING_TIME && timeRemaining > 0) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    };
    
    // Initial check
    checkTokenStatus();
    
    // Set up interval to check expiration periodically
    checkIntervalRef.current = setInterval(checkTokenStatus, 1000);
    
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [user, tokenExpirationTime, isActive]);

  const formatTimeRemaining = (ms) => {
    if (ms === null || ms === undefined) return '--:--';
    
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Simple activity indicator */}
      {user && (
        <div className="fixed bottom-2 right-2 bg-white dark:bg-gray-800 border rounded-full p-2 shadow-md z-50">
          {isActive ? (
            <Activity size={18} className="text-green-500" title="Active" />
          ) : showWarning ? (
            <Clock size={18} className="text-red-500" title="Session expiring soon" />
          ) : (
            <AlertTriangle size={18} className="text-amber-500" title="Inactive" />
          )}
        </div>
      )}

      {/* Warning notification */}
      {showWarning && (
        <div className="fixed top-4 right-4 bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 rounded shadow-lg z-50 max-w-md animate-fadeIn">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">
                Your session will expire in {formatTimeRemaining(remainingTime)} due to inactivity
              </p>
              <p className="mt-1 text-xs">
                Move your mouse or press a key to stay logged in
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Add needed animation
const styleElement = document.createElement('style');
styleElement.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
`;
document.head.appendChild(styleElement);

export default SessionTimeoutWarning;