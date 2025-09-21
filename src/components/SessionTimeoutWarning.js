import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, AlertTriangle, Clock } from 'lucide-react';
import { auth } from '../firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { useLocation } from 'react-router-dom';

const SessionTimeoutWarning = () => {
  const { user, signOut, refreshSession, tokenExpirationTime, addActivityEvent, updateUserActivityInDatabase } = useAuth();
  const location = useLocation();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);
  const [inactivityRemainingTime, setInactivityRemainingTime] = useState(null);
  const [displayTime, setDisplayTime] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const checkIntervalRef = useRef(null);
  const activityTimeoutRef = useRef(null);
  
  // Configure timing thresholds
  const WARNING_TIME = 5 * 60 * 1000; // 5 minutes warning before logout
  const ACTIVITY_THRESHOLD = 120 * 1000; // 2 minutes of inactivity to consider user inactive
  const ABSOLUTE_TIMEOUT = 60 * 60 * 1000; // 1 hour max absolute timeout
  const ABSOLUTE_WARNING_TIME = 5 * 60 * 1000; // 5 min warning before absolute timeout

  // Define public routes (from AuthContext.js)
  const publicRoutes = [
    '/',
    '/login',
    '/migrate',
    '/staff-login',
    '/reset-password',
    '/signup',
    '/auth-action-handler',
    '/contractor-invoice',
    '/adult-students',
    '/your-way',
    '/get-started',
    '/rtd-landing',
    '/policies-reports',
    '/google-ai-chat',
    '/parent-login',
    '/aerr/2023-24',
    '/education-plan/2025-26',
    '/prerequisite-flowchart',
    '/parent-verify-email',
    '/rtd-learning-login',
    '/rtd-learning-admin-login',
    '/facilitators',
    '/about',
    '/bio',
    '/faq',
    '/student-faq',
    '/funding',
    '/privacy',
    '/terms'
  ].map(route => route.toLowerCase());

  // Helper function to check if current route is public
  const isPublicRoute = (path) => {
    const normalizedPath = path.toLowerCase();

    // Check exact matches
    if (publicRoutes.includes(normalizedPath)) {
      return true;
    }

    // Check video routes (both direct links and embeds)
    if (normalizedPath.startsWith('/video/')) {
      return true;
    }

    // Check student portal routes
    if (normalizedPath.startsWith('/student-portal/')) {
      const studentPortalPattern = /^\/student-portal\/[^/]+\/[^/]+$/i;
      return studentPortalPattern.test(normalizedPath);
    }

    // Check facilitator routes
    if (normalizedPath.startsWith('/facilitator/')) {
      return true;
    }

    // Check public portfolio routes
    if (normalizedPath.startsWith('/portfolio/')) {
      const entryPattern = /^\/portfolio\/[^/]+\/[^/]+$/i;
      const coursePattern = /^\/portfolio\/[^/]+\/course\/[^/]+$/i;
      return entryPattern.test(normalizedPath) || coursePattern.test(normalizedPath);
    }

    return false;
  };

  // Check if we should show the activity indicator
  const shouldShowIndicator = user && !isPublicRoute(location.pathname);
  
  // Track user activity
  const trackActivity = useCallback(() => {
    // Skip tracking if tracking is disabled via debug tools
    if (window.disableActivityTracking || window.simulationActive) {
      return;
    }
    
    const now = Date.now();
    
    // Reset inactivity tracking when user becomes active
    setIsActive(true);
    setLastActivityTime(now);
    
    // Also store in localStorage for persistence across sleep/hibernation
    localStorage.setItem('rtd_last_activity_timestamp', now.toString());
    
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
    
    // Add activity event and update database
    if (addActivityEvent) {
      addActivityEvent('session_activity', {
        sessionWarningActive: showWarning,
        remainingTime: remainingTime
      });
    }
    
    if (updateUserActivityInDatabase) {
      updateUserActivityInDatabase();
    }
    
    // Refresh the session in Auth context
    refreshSession();
  }, [showWarning, refreshSession, addActivityEvent, updateUserActivityInDatabase, remainingTime]);

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
    
    // Store last activity timestamp in localStorage for persistence across sleep/hibernation
    const storeActivityTimestamp = () => {
      localStorage.setItem('rtd_last_activity_timestamp', Date.now().toString());
    };
    storeActivityTimestamp();
    
    // Helper to format time for logging
    const formatTime = (ms) => {
      const minutes = Math.floor(ms / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      return `${minutes}m ${seconds}s`;
    };
    
    const checkTokenStatus = () => {
      if (!tokenExpirationTime) return;
      
      const now = Date.now();
      
      // Always use the simulation timestamp if we're in simulation mode
      let storedLastActivity;
      if (window.simulationActive && window.simulatedTimestamp) {
        storedLastActivity = window.simulatedTimestamp;
      } else {
        storedLastActivity = parseInt(localStorage.getItem('rtd_last_activity_timestamp') || Date.now().toString(), 10);
      }
      
      const inactivityDuration = now - storedLastActivity;
      const timeRemaining = tokenExpirationTime - now;
      const timeUntilInactivityTimeout = ABSOLUTE_TIMEOUT - inactivityDuration;
      
      // Update activity state based on localStorage timestamp
      if (inactivityDuration >= ACTIVITY_THRESHOLD) {
        setIsActive(false);
      } else {
        setIsActive(true);
      }
      
      // Update remaining times
      setRemainingTime(timeRemaining);
      setInactivityRemainingTime(timeUntilInactivityTimeout);
      
      // Set display time to the smaller of the two values (whichever will happen first)
      setDisplayTime(Math.min(timeRemaining, timeUntilInactivityTimeout));
      
      // Calculate warning conditions for showing the notification
      const inactivityTimeoutApproaching = timeUntilInactivityTimeout < ABSOLUTE_WARNING_TIME;
      const tokenExpirationApproaching = timeRemaining < WARNING_TIME && timeRemaining > 0;
      
      // Force logout if token is expired or inactivity threshold exceeded
      if (timeRemaining <= 0 || inactivityDuration >= ABSOLUTE_TIMEOUT) {
        console.log("Session timeout - logging out user due to expired token or inactivity");
        // Don't call signOut() directly to avoid circular dependency
        // Instead directly use Firebase signOut and clear storage
        localStorage.removeItem('rtd_last_activity_timestamp');
        localStorage.removeItem('rtd_scheduled_logout_time');
        
        // Create a timeout message to show on login page
        const timeoutMessage = "Your session has expired due to inactivity. Please log in again.";
        sessionStorage.setItem('auth_timeout_message', timeoutMessage);
        
        // Sign out of Firebase and redirect to appropriate login page
        firebaseSignOut(auth)
          .then(() => {
            // Determine which login page to use based on staff status
            const isStaff = user.email && user.email.endsWith('@rtdacademy.com');
            const loginPath = isStaff ? '/staff-login' : '/login';
            
            // Force a hard reload to clear any lingering state
            window.location.href = loginPath;
          })
          .catch(error => {
            console.error("Error during session timeout logout:", error);
            // Even if there's an error, still try to redirect
            window.location.reload();
          });
        
        return;
      }
      
      // Show warning when either:
      // 1. Token is about to expire, OR
      // 2. Inactivity timeout is approaching
      // (using variables calculated earlier)
      
      if ((!isActive && tokenExpirationApproaching) || inactivityTimeoutApproaching) {
        if (!showWarning) {
          console.log("%c WARNING DISPLAYED: Session about to expire ", "background:#e74c3c; color:white; padding:3px;");
        }
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    };
    
    // Listen for visibility changes (tab focus/browser resume)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Immediately check if we should be logged out upon becoming visible
        checkTokenStatus();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Initial check
    checkTokenStatus();
    
    // Set up interval to check expiration periodically
    checkIntervalRef.current = setInterval(checkTokenStatus, 1000);
    
    // Add debug controls to window for testing session timeouts
    if (process.env.NODE_ENV !== 'production') {
      window.SessionTimeoutDebug = {
        // Simulate inactivity - set timestamp to X minutes ago
        simulateInactivity: (minutes) => {
          try {
            // Override the original checkTokenStatus
            const originalCheckStatus = checkTokenStatus;
            const originalTrackActivity = trackActivity;
            
            // Calculate the timestamp for X minutes ago
            const now = Date.now();
            const minutesInMs = minutes * 60 * 1000;
            const timestamp = now - minutesInMs;
            
            // Force the timestamp to localStorage
            localStorage.setItem('rtd_last_activity_timestamp', timestamp.toString());
            
            // Create our own check function that won't reset the timestamp
            window.simulationActive = true;
            window.disableActivityTracking = true;
            window.simulatedTimestamp = timestamp;
            
            // Update React state directly
            setLastActivityTime(timestamp);
            if (minutes * 60 * 1000 >= ACTIVITY_THRESHOLD) {
              setIsActive(false);
            }
            
            // Log simulation details
            console.log(`%c SIMULATION ACTIVE `, "background:#e74c3c; color:white; padding:5px; font-weight:bold;");
            console.log(`Simulated ${minutes} minutes of inactivity`);
            console.log(`Current time: ${new Date(now).toLocaleTimeString()}`);
            console.log(`Timestamp set to: ${new Date(timestamp).toLocaleTimeString()}`); 
            console.log(`Difference: ${Math.floor(minutesInMs/60000)}m ${Math.floor((minutesInMs%60000)/1000)}s`);
            
            // Print current status
            const currentStatus = {
              now: new Date(now).toLocaleTimeString(),
              lastActivity: new Date(timestamp).toLocaleTimeString(),
              inactiveDuration: `${Math.floor(minutesInMs/60000)}m ${Math.floor((minutesInMs%60000)/1000)}s`,
              isActive: minutes * 60 * 1000 < ACTIVITY_THRESHOLD
            };
            
            console.log("%c Simulation Status ", "background:#8e44ad; color:white; padding:3px;");
            console.table(currentStatus);
            
            console.log(`Activity tracking disabled - use resetActivity() when done testing`);
            return currentStatus;
          } catch (error) {
            console.error("Error in simulation:", error);
            return null;
          }
        },
        
        // Show current status
        getStatus: () => {
          const now = Date.now();
          const storedLastActivity = parseInt(localStorage.getItem('rtd_last_activity_timestamp') || now.toString(), 10);
          const inactivityDuration = now - storedLastActivity;
          
          // Double-check activity state before reporting
          const isCurrentlyActive = inactivityDuration < ACTIVITY_THRESHOLD;
          
          console.group("%c Session Status Debug Info ", "background:#3498db; color:white; padding:3px;");
          console.log("Current time:", new Date(now).toLocaleTimeString());
          console.log("Last activity:", new Date(storedLastActivity).toLocaleTimeString());
          console.log(`Inactive for: ${formatTime(inactivityDuration)}`);
          console.log(`User state (stored): ${isActive ? 'ACTIVE' : 'INACTIVE'}`);
          console.log(`User state (calculated): ${isCurrentlyActive ? 'ACTIVE' : 'INACTIVE'}`);
          console.log(`Simulation mode: ${window.disableActivityTracking ? 'ON' : 'OFF'}`);
          console.log(`Warning showing: ${showWarning}`);
          
          if (tokenExpirationTime) {
            const timeRemaining = tokenExpirationTime - now;
            console.log(`Token expires in: ${formatTime(timeRemaining)}`);
            
            // Check if warning should be showing
            const shouldShowWarning = !isCurrentlyActive && timeRemaining < WARNING_TIME;
            if (shouldShowWarning !== showWarning) {
              console.log(`%c Warning state mismatch detected `, "background:#e74c3c; color:white;");
            }
          }
          
          console.groupEnd();
          
          // Ensure UI is consistent with stored timestamps
          if (isCurrentlyActive !== isActive) {
            console.log("Updating activity state to match calculated state");
            setIsActive(isCurrentlyActive);
          }
          
          return {
            inactivityDuration,
            isActive: isCurrentlyActive,
            lastActivity: new Date(storedLastActivity).toLocaleTimeString()
          };
        },
        
        // Reset activity timestamp to now
        resetActivity: () => {
          localStorage.setItem('rtd_last_activity_timestamp', Date.now().toString());
          window.disableActivityTracking = false;
          window.simulationActive = false;
          window.simulatedTimestamp = null;
          console.log("%c SIMULATION ENDED ", "background:#2ecc71; color:white; padding:5px;");
          console.log("Activity timestamp reset to now - normal activity tracking re-enabled");
          setIsActive(true); // Ensure we're active again
          checkTokenStatus(); // Run check immediately
        }
      };
      
      // Debug tools available - commented out to reduce console noise
      // console.log("%c Session Timeout Debug Tools Available ", "background:#8e44ad; color:white; padding:5px;");
      // console.log("Use these functions to test timeouts:");
      // console.log("- window.SessionTimeoutDebug.simulateInactivity(minutes)");
      // console.log("- window.SessionTimeoutDebug.getStatus()");
      // console.log("- window.SessionTimeoutDebug.resetActivity()");
    }
    
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Clean up debug objects
      if (window.SessionTimeoutDebug) {
        delete window.SessionTimeoutDebug;
      }
    };
  }, [user, tokenExpirationTime, isActive, signOut]);

  const formatTimeRemaining = (ms) => {
    if (ms === null || ms === undefined) return '--:--';
    
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Simple activity indicator - only show on non-public routes */}
      {shouldShowIndicator && (
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
                Your session will expire in {formatTimeRemaining(displayTime)} due to inactivity
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