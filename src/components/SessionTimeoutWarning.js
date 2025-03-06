import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

// Constants for localStorage keys
const ACTIVITY_TIMESTAMP_KEY = 'rtd_last_activity_timestamp';
const LOGOUT_TIME_KEY = 'rtd_scheduled_logout_time';

const SessionTimeoutWarning = ({ showDebugInfo = false }) => {
  const { user, signOut, refreshSession, sessionTimeout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [activityCount, setActivityCount] = useState(0);
  const [inactiveStartTime, setInactiveStartTime] = useState(null);
  const [logoutTime, setLogoutTime] = useState(null);
  const initialLoadTime = useRef(Date.now());
  const logoutTimeoutRef = useRef(null);
  
  // Configure timing thresholds
  // Show warning when we have this much time left before logout
  const WARNING_TIME = 5 * 60 * 1000; // 5 minutes warning before logout
  
  // Don't show warning if user just logged in
  const INITIAL_GRACE_PERIOD = 120 * 1000; // 2 minute grace period after login
  
  // Activity is detected if user has interacted in the last X seconds
  const ACTIVITY_THRESHOLD =120 * 1000; // 2 minutes

  // Get activity timestamp from localStorage (across all tabs)
  const getGlobalActivityTimestamp = useCallback(() => {
    const stored = localStorage.getItem(ACTIVITY_TIMESTAMP_KEY);
    if (stored) {
      try {
        return parseInt(stored, 10);
      } catch (e) {
        return Date.now();
      }
    }
    return Date.now();
  }, []);

  // Get logout time from localStorage (across all tabs)
  const getGlobalLogoutTime = useCallback(() => {
    const stored = localStorage.getItem(LOGOUT_TIME_KEY);
    if (stored) {
      try {
        return parseInt(stored, 10);
      } catch (e) {
        return null;
      }
    }
    return null;
  }, []);

  // Function to schedule logout at exact time
  const scheduleLogout = useCallback((exactLogoutTime) => {
    // Clear any existing timeout first
    if (logoutTimeoutRef.current) {
      clearTimeout(logoutTimeoutRef.current);
      logoutTimeoutRef.current = null;
    }
    
    // Store the exact logout time in state and localStorage (for cross-tab communication)
    setLogoutTime(exactLogoutTime);
    localStorage.setItem(LOGOUT_TIME_KEY, exactLogoutTime.toString());
    
    // Calculate time until logout
    const now = Date.now();
    const timeUntilLogout = exactLogoutTime - now;
    
    if (timeUntilLogout <= 0) {
      // Time is already up, logout immediately
      console.log('Auto-logout triggered immediately - time expired');
      signOut();
      return;
    }
    
    // Schedule logout at the exact time
    logoutTimeoutRef.current = setTimeout(() => {
      console.log('Auto-logout triggered after timeout');
      signOut();
    }, timeUntilLogout);
    
    if (showDebugInfo) {
      console.log(`Scheduled logout at ${new Date(exactLogoutTime).toLocaleTimeString()} (in ${(timeUntilLogout/1000).toFixed(1)} seconds)`);
    }
  }, [signOut, showDebugInfo]);

  // Track user activity - updates localStorage for cross-tab communication
  const trackActivity = useCallback(() => {
    const now = Date.now();
    const wasInactive = !isActive;
    
    // Update activity timestamp in localStorage for cross-tab synchronization
    localStorage.setItem(ACTIVITY_TIMESTAMP_KEY, now.toString());
    
    // Reset all inactivity tracking when user becomes active
    setIsActive(true);
    setLastActivityTime(now);
    setActivityCount(prev => prev + 1);
    setInactiveStartTime(null);
    setLogoutTime(null);
    
    // Clear scheduled logout across all tabs
    localStorage.removeItem(LOGOUT_TIME_KEY);
    
    // Hide warning if it was showing
    if (showWarning) {
      setShowWarning(false);
    }
    
    // Clear any scheduled logout
    if (logoutTimeoutRef.current) {
      clearTimeout(logoutTimeoutRef.current);
      logoutTimeoutRef.current = null;
    }
    
    // Log when user becomes active again after being inactive
    if (wasInactive && showDebugInfo) {
      console.log("User became active again at", new Date(now).toLocaleTimeString());
    }
  }, [isActive, showWarning, showDebugInfo]);

  // Set up activity event listeners
  useEffect(() => {
    if (!user) return;

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
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
    
    // Handle storage events for cross-tab communication
    const handleStorageChange = (e) => {
      if (e.key === ACTIVITY_TIMESTAMP_KEY) {
        // Another tab has updated the activity timestamp
        const newTimestamp = parseInt(e.newValue, 10);
        if (!isNaN(newTimestamp) && newTimestamp > lastActivityTime) {
          // Update our local state with the new timestamp
          setIsActive(true);
          setLastActivityTime(newTimestamp);
          setInactiveStartTime(null);
          
          // Clear warning if it was showing
          if (showWarning) {
            setShowWarning(false);
          }
          
          // Clear any scheduled logout
          if (logoutTimeoutRef.current) {
            clearTimeout(logoutTimeoutRef.current);
            logoutTimeoutRef.current = null;
          }
          
          if (showDebugInfo) {
            console.log("Activity detected in another tab at", new Date(newTimestamp).toLocaleTimeString());
          }
        }
      } else if (e.key === LOGOUT_TIME_KEY) {
        // Another tab has scheduled a logout
        if (e.newValue === null) {
          // Logout was cleared in another tab
          setLogoutTime(null);
          if (logoutTimeoutRef.current) {
            clearTimeout(logoutTimeoutRef.current);
            logoutTimeoutRef.current = null;
          }
        } else {
          // Logout was scheduled in another tab
          const newLogoutTime = parseInt(e.newValue, 10);
          if (!isNaN(newLogoutTime) && (!logoutTime || newLogoutTime !== logoutTime)) {
            setLogoutTime(newLogoutTime);
            scheduleLogout(newLogoutTime);
          }
        }
      }
    };
    
    activityEvents.forEach(event => {
      document.addEventListener(event, throttledActivity, { passive: true });
    });
    
    // Add storage event listener for cross-tab communication
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, throttledActivity);
      });
      window.removeEventListener('storage', handleStorageChange);
      if (timeout) clearTimeout(timeout);
      if (logoutTimeoutRef.current) {
        clearTimeout(logoutTimeoutRef.current);
      }
    };
  }, [user, trackActivity, showWarning, lastActivityTime, logoutTime, scheduleLogout, showDebugInfo]);

  // Initialize timer on component mount - check for existing activity/logout data
  useEffect(() => {
    if (user) {
      // Check for existing activity timestamp or logout time
      const globalActivityTime = getGlobalActivityTimestamp();
      const globalLogoutTime = getGlobalLogoutTime();
      
      setLastActivityTime(globalActivityTime);
      
      if (globalLogoutTime) {
        // There's an existing logout scheduled
        setLogoutTime(globalLogoutTime);
        scheduleLogout(globalLogoutTime);
      } else {
        // Ensure we have an activity timestamp set
        localStorage.setItem(ACTIVITY_TIMESTAMP_KEY, Date.now().toString());
      }
    }
  }, [user, getGlobalActivityTimestamp, getGlobalLogoutTime, scheduleLogout]);

  // Calculate current remaining time
 // In SessionTimeoutWarning.js

// Modify the calculateRemainingTime function to account for the ACTIVITY_THRESHOLD
const calculateRemainingTime = useCallback(() => {
  const now = Date.now();
  
  // If we have a scheduled logout time, use that for precise calculation
  if (logoutTime) {
    return Math.max(0, logoutTime - now);
  }
  
  // If inactive, calculate based on the actual last activity time
  // This is the key change - always using lastActivityTime, not inactiveStartTime
  const timeSinceLastActivity = now - lastActivityTime;
  return Math.max(0, sessionTimeout - timeSinceLastActivity);
  
}, [logoutTime, lastActivityTime, sessionTimeout]);

// Also update the checkInactivity function to schedule logout based on actual activity time
const checkInactivity = useCallback(() => {
  if (!user) return;
  
  const now = Date.now();
  
  // Get the latest activity timestamp from all tabs
  const globalActivityTime = getGlobalActivityTimestamp();
  const timeSinceLastGlobalActivity = now - globalActivityTime;
  const timeSinceMount = now - initialLoadTime.current;
  
  // Update our local copy if global is newer
  if (globalActivityTime > lastActivityTime) {
    setLastActivityTime(globalActivityTime);
  }
  
  // Determine if user is currently inactive across all tabs
  const currentlyInactive = timeSinceLastGlobalActivity > ACTIVITY_THRESHOLD;
  
  // If we just became inactive, record the time and schedule logout
  if (currentlyInactive && isActive) {
    setIsActive(false);
    setInactiveStartTime(now);
    
    // Important change: Schedule logout based on the last actual activity time, not current time
    const exactLogoutTime = globalActivityTime + sessionTimeout;
    
    // Schedule logout at exact time - this also updates localStorage
    scheduleLogout(exactLogoutTime);
    
    if (showDebugInfo) {
      console.log("User inactive across all tabs at", new Date(now).toLocaleTimeString());
      console.log("Last activity at", new Date(globalActivityTime).toLocaleTimeString());
      console.log("Logout scheduled for", new Date(exactLogoutTime).toLocaleTimeString());
    }
  }
  
  // Rest of the function remains the same...
  const globalLogoutTime = getGlobalLogoutTime();
  if (globalLogoutTime && globalLogoutTime !== logoutTime) {
    setLogoutTime(globalLogoutTime);
  }
  
  // Calculate and update remaining time
  const timeRemaining = calculateRemainingTime();
  setRemainingTime(timeRemaining);
  
  // Show warning when time remaining is below warning threshold
  const shouldShowWarning = 
    currentlyInactive &&
    timeRemaining < WARNING_TIME &&
    timeRemaining > 0 &&
    timeSinceMount > INITIAL_GRACE_PERIOD;
  
  setShowWarning(shouldShowWarning);
  
}, [
  user, 
  isActive, 
  lastActivityTime, 
  sessionTimeout, 
  WARNING_TIME, 
  showDebugInfo, 
  scheduleLogout,
  getGlobalActivityTimestamp,
  getGlobalLogoutTime,
  calculateRemainingTime
]);

  // Run the inactivity check periodically
  useEffect(() => {
    if (!user) return;
    
    // Check inactivity every second for more precise countdown
    const intervalId = setInterval(checkInactivity, 1000);
    
    // Initial check
    checkInactivity();
    
    return () => clearInterval(intervalId);
  }, [user, checkInactivity]);

  const formatTimeRemaining = (ms) => {
    if (ms === null || ms === undefined) return '--:--';
    
    // For very large values (full session timeout), just return a placeholder
    if (ms > 2 * 60 * 60 * 1000) return '> 2 hours';
    
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };
  
  // Format the inactivity duration
  const getInactiveDuration = () => {
    if (isActive) return 0;
    
    // Use the global activity timestamp for calculation
    const globalActivityTime = getGlobalActivityTimestamp();
    return Date.now() - globalActivityTime;
  };
  
  // Get debug status for next event
  const getDebugStatus = useCallback(() => {
    const now = Date.now();
    
    // If already inactive with a scheduled logout
    if (logoutTime) {
      const timeUntilLogout = logoutTime - now;
      
      // If within warning period
      if (timeUntilLogout < WARNING_TIME) {
        return {
          event: "Logout",
          timeUntil: timeUntilLogout,
          warningActive: timeUntilLogout < WARNING_TIME && timeUntilLogout > 0
        };
      }
      
      // Before warning period
      return {
        event: "Warning",
        timeUntil: timeUntilLogout - WARNING_TIME,
        warningActive: false
      };
    }
    
    // If inactive but no scheduled logout yet
    if (!isActive && inactiveStartTime) {
      const inactiveDuration = now - inactiveStartTime;
      const timeRemaining = sessionTimeout - inactiveDuration;
      
      if (timeRemaining < WARNING_TIME) {
        return {
          event: "Logout",
          timeUntil: timeRemaining,
          warningActive: timeRemaining < WARNING_TIME && timeRemaining > 0
        };
      }
      
      return {
        event: "Warning",
        timeUntil: timeRemaining - WARNING_TIME,
        warningActive: false
      };
    }
    
    // If active
    return {
      event: "Warning",
      timeUntil: sessionTimeout - WARNING_TIME,
      warningActive: false
    };
  }, [isActive, inactiveStartTime, logoutTime, sessionTimeout, WARNING_TIME]);

  const debugStatus = getDebugStatus();

  return (
    <>
      {/* Debug information */}
      {showDebugInfo && user && (
        <div className="fixed bottom-2 right-2 bg-gray-800 text-white p-3 rounded-md shadow-lg z-50 text-sm max-w-xs">
          <div className="mb-1 font-semibold">Activity Status</div>
          <div className="flex items-center">
            <span className="mr-2">Current:</span>
            <span className={isActive ? "text-green-400" : "text-red-400"}>
              {isActive ? "Active" : "Inactive"}
            </span>
            <div 
              className={`ml-2 w-3 h-3 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`}
            ></div>
          </div>
          <div>Activity count: {activityCount}</div>
          <div>Last activity: {formatTimestamp(lastActivityTime)}</div>
          <div>Global activity: {formatTimestamp(getGlobalActivityTimestamp())}</div>
          {!isActive && (
            <div>Inactive for: {formatTimeRemaining(getInactiveDuration())}</div>
          )}
          
          <div className="mt-2 mb-1 font-semibold">Timeouts</div>
          <div>Total session time: {formatTimeRemaining(sessionTimeout)}</div>
          <div>Warning shows with: {formatTimeRemaining(WARNING_TIME)} left</div>
          {logoutTime && (
            <div>Logout at: {formatTimestamp(logoutTime)}</div>
          )}
          <div className={debugStatus.warningActive ? "text-red-300" : "text-yellow-300"}>
            Next {debugStatus.event} in: {formatTimeRemaining(Math.max(0, debugStatus.timeUntil))}
          </div>
          {showWarning && (
            <div className="text-red-300 mt-1 font-bold">
              Time remaining: {formatTimeRemaining(remainingTime)}
            </div>
          )}
        </div>
      )}

      {/* Non-intrusive warning notification */}
      {showWarning && (
        <div className="fixed top-4 right-4 bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 rounded shadow-lg z-50 max-w-md animate-fadeIn">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
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