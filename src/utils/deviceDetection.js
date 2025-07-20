/**
 * Device detection utilities for optimizing authentication flow
 */

/**
 * Detects if the user is on a mobile device
 * @returns {boolean} true if mobile device, false otherwise
 */
export const isMobileDevice = () => {
  // Check if it's a touch device
  const hasTouchScreen = 'ontouchstart' in window || 
    navigator.maxTouchPoints > 0 || 
    navigator.msMaxTouchPoints > 0;
  
  // Check user agent for mobile keywords
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  const isMobileUserAgent = mobileRegex.test(userAgent.toLowerCase());
  
  // Check screen width (consider tablets as desktop for auth purposes)
  const isSmallScreen = window.innerWidth <= 768;
  
  // Additional check for Android specifically
  const isAndroid = /android/i.test(userAgent);
  
  // Return true if any strong mobile indicators are present
  return (isMobileUserAgent && hasTouchScreen) || (isSmallScreen && hasTouchScreen) || isAndroid;
};

/**
 * Detects if the user is specifically on an Android device
 * @returns {boolean} true if Android device, false otherwise
 */
export const isAndroidDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /android/i.test(userAgent.toLowerCase());
};

/**
 * Detects if the user is on iOS (iPhone/iPad)
 * @returns {boolean} true if iOS device, false otherwise
 */
export const isIOSDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /iphone|ipad|ipod/i.test(userAgent.toLowerCase()) && !window.MSStream;
};

/**
 * Checks if popup windows are likely to work properly
 * @returns {boolean} true if popups should work, false otherwise
 */
export const canUsePopups = () => {
  // Mobile devices often have issues with popups
  if (isMobileDevice()) {
    return false;
  }
  
  // Some browsers block popups by default
  // This is a heuristic - actual popup blocking can only be detected when attempting to open one
  return true;
};

/**
 * Get device type string for logging/analytics
 * @returns {string} Device type description
 */
export const getDeviceType = () => {
  if (isAndroidDevice()) return 'Android';
  if (isIOSDevice()) return 'iOS';
  if (isMobileDevice()) return 'Mobile';
  return 'Desktop';
};