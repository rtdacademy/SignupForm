import { useState, useEffect, useCallback } from 'react';
import { getAuth } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions, 
  getHighestPermission,
  expandPermissions,
  STAFF_PERMISSIONS 
} from './staffPermissions';

/**
 * Custom hook for managing staff custom claims
 * Handles checking existing claims, applying new claims, and providing permission utilities
 */
export const useStaffClaims = () => {
  const [claims, setClaims] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isApplyingClaims, setIsApplyingClaims] = useState(false);

  const auth = getAuth();
  const functions = getFunctions();

  /**
   * Reads the current user's custom claims from their ID token
   */
  const readCurrentClaims = useCallback(async () => {
    if (!auth.currentUser) {
      setClaims(null);
      setLoading(false);
      return null;
    }

    try {
      // Force token refresh to get latest claims
      const idTokenResult = await auth.currentUser.getIdTokenResult(true);
      const customClaims = idTokenResult.claims;
      
      console.log('Current custom claims:', customClaims);
      
      // Extract staff-specific claims
      const staffClaims = {
        staffPermissions: customClaims.staffPermissions || [],
        staffRole: customClaims.staffRole || null,
        lastPermissionUpdate: customClaims.lastPermissionUpdate || null,
        permissionSource: customClaims.permissionSource || null,
        // Keep other claims for compatibility
        ...customClaims
      };
      
      setClaims(staffClaims);
      return staffClaims;
    } catch (err) {
      console.error('Error reading custom claims:', err);
      setError('Failed to read user permissions');
      return null;
    } finally {
      setLoading(false);
    }
  }, [auth.currentUser]);

  /**
   * Applies staff custom claims by calling the cloud function
   */
  const applyStaffClaims = useCallback(async () => {
    if (!auth.currentUser || isApplyingClaims) {
      return null;
    }

    setIsApplyingClaims(true);
    setError(null);

    try {
      console.log('Applying staff custom claims for user:', auth.currentUser.email);
      
      const setStaffClaims = httpsCallable(functions, 'setStaffCustomClaims');
      const result = await setStaffClaims();
      
      if (result.data.success) {
        console.log('✅ Staff claims applied successfully:', result.data);
        
        // Wait for token refresh and then read the new claims
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const newClaims = await readCurrentClaims();
        return newClaims;
      } else {
        throw new Error(result.data.message || 'Failed to apply staff claims');
      }
    } catch (err) {
      console.error('Error applying staff claims:', err);
      setError(err.message || 'Failed to apply staff permissions');
      return null;
    } finally {
      setIsApplyingClaims(false);
    }
  }, [auth.currentUser, isApplyingClaims, functions, readCurrentClaims]);

  /**
   * Checks and applies staff claims if they don't exist or are outdated
   */
  const checkAndApplyStaffClaims = useCallback(async () => {
    if (!auth.currentUser) {
      return null;
    }

    const currentClaims = await readCurrentClaims();
    
    // Check if user needs staff claims applied
    const needsClaims = !currentClaims?.staffPermissions || 
                       currentClaims.staffPermissions.length === 0;
    
    if (needsClaims) {
      console.log('User needs staff claims applied');
      return await applyStaffClaims();
    }
    
    return currentClaims;
  }, [auth.currentUser, readCurrentClaims, applyStaffClaims]);

  /**
   * Manually refresh claims (force token refresh and re-read)
   */
  const refreshClaims = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (auth.currentUser) {
        // Force token refresh
        await auth.currentUser.getIdToken(true);
        await readCurrentClaims();
      }
    } catch (err) {
      console.error('Error refreshing claims:', err);
      setError('Failed to refresh permissions');
    }
  }, [auth.currentUser, readCurrentClaims]);

  /**
   * Permission checking utilities
   */
  const permissionUtils = {
    /**
     * Check if user has a specific permission
     */
    hasPermission: useCallback((permission) => {
      return hasPermission(claims?.staffPermissions || [], permission);
    }, [claims?.staffPermissions]),

    /**
     * Check if user has any of the specified permissions
     */
    hasAnyPermission: useCallback((permissions) => {
      return hasAnyPermission(claims?.staffPermissions || [], permissions);
    }, [claims?.staffPermissions]),

    /**
     * Check if user has all of the specified permissions
     */
    hasAllPermissions: useCallback((permissions) => {
      return hasAllPermissions(claims?.staffPermissions || [], permissions);
    }, [claims?.staffPermissions]),

    /**
     * Get the user's highest permission level
     */
    getHighestPermission: useCallback(() => {
      return getHighestPermission(claims?.staffPermissions || []);
    }, [claims?.staffPermissions]),

    /**
     * Get all expanded permissions (including inherited ones)
     */
    getExpandedPermissions: useCallback(() => {
      return expandPermissions(claims?.staffPermissions || []);
    }, [claims?.staffPermissions]),

    /**
     * Check if user is staff (has any staff permissions)
     */
    isStaff: useCallback(() => {
      return hasPermission(claims?.staffPermissions || [], STAFF_PERMISSIONS.LEVELS.STAFF);
    }, [claims?.staffPermissions]),

    /**
     * Check if user is admin level or higher
     */
    isAdmin: useCallback(() => {
      return hasPermission(claims?.staffPermissions || [], STAFF_PERMISSIONS.LEVELS.ADMIN);
    }, [claims?.staffPermissions]),

    /**
     * Check if user is super admin
     */
    isSuperAdmin: useCallback(() => {
      return hasPermission(claims?.staffPermissions || [], STAFF_PERMISSIONS.LEVELS.SUPER_ADMIN);
    }, [claims?.staffPermissions]),

    /**
     * Get permission description
     */
    getPermissionDescription: useCallback((permission) => {
      return STAFF_PERMISSIONS.DESCRIPTIONS[permission] || permission;
    }, []),

    /**
     * Get all available permission levels
     */
    getAvailablePermissions: useCallback(() => {
      return Object.values(STAFF_PERMISSIONS.LEVELS);
    }, [])
  };

  // Listen for auth state changes and token refresh events
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await checkAndApplyStaffClaims();
      } else {
        setClaims(null);
        setLoading(false);
      }
    });

    // Listen for token refresh events
    const handleTokenRefresh = async () => {
      console.log('Token refresh event detected, re-reading staff claims...');
      await readCurrentClaims();
    };

    window.addEventListener('tokenRefreshed', handleTokenRefresh);

    return () => {
      unsubscribe();
      window.removeEventListener('tokenRefreshed', handleTokenRefresh);
    };
  }, [auth, checkAndApplyStaffClaims, readCurrentClaims]);

  return {
    // Claims data
    claims,
    staffPermissions: claims?.staffPermissions || [],
    staffRole: claims?.staffRole || null,
    lastPermissionUpdate: claims?.lastPermissionUpdate || null,
    
    // Loading states
    loading,
    isApplyingClaims,
    error,
    
    // Actions
    refreshClaims,
    applyStaffClaims,
    checkAndApplyStaffClaims,
    
    // Permission utilities
    ...permissionUtils
  };
};

export default useStaffClaims;