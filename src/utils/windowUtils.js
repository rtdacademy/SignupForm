// src/utils/windowUtils.js

// Store window references globally within this module
const windowRefs = {};

/**
 * Opens a URL in a named window, reusing it if already open.
 * @param {string} url The URL to open.
 * @param {string} windowName A unique name for the window (e.g., 'pasiWindow', 'dashboardWindow').
 */
export const openManagedWindow = (url, windowName) => {
  if (!url || !windowName) {
    console.warn('openManagedWindow called without URL or windowName');
    return;
  }

  let windowRef = windowRefs[windowName];

  // Check if the reference exists and the window is still open
  if (windowRef && !windowRef.closed) {
    try {
      // Try to change location and focus
      windowRef.location.href = url;
      windowRef.focus();
    } catch (e) {
      // If cross-origin restrictions prevent access, open a new window
      console.warn(`Could not reuse window "${windowName}" due to cross-origin policy. Opening a new one.`, e);
      const newWindow = window.open(url, windowName);
      windowRefs[windowName] = newWindow;
      if (newWindow) {
        newWindow.focus();
      } else {
        console.error(`Could not open new window "${windowName}". Popup blocker might be active.`);
        // Consider adding a user notification (e.g., using toast)
      }
    }
  } else {
    // If no valid reference, open a new window
    const newWindow = window.open(url, windowName);
    windowRefs[windowName] = newWindow; // Store the new reference
    if (newWindow) {
      newWindow.focus();
    } else {
      // Handle popup blocker
      console.error(`Could not open window "${windowName}". Popup blocker might be active.`);
      // Consider adding a user notification (e.g., using toast)
    }
  }
};
