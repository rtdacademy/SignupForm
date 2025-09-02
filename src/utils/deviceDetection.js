/**
 * Device detection utilities for determining if a device has keyboard capabilities
 */

// Legacy function for backward compatibility with StaffLogin.js
export const isMobileDevice = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    'mobile', 'android', 'iphone', 'ipod', 'blackberry', 
    'windows phone', 'webos', 'opera mini', 'opera mobi'
  ];
  
  return mobileKeywords.some(keyword => userAgent.includes(keyword));
};

export const detectDeviceType = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform.toLowerCase();
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const touchPoints = navigator.maxTouchPoints || 0;
  
  // Check for mobile user agents
  const mobileKeywords = [
    'mobile', 'android', 'iphone', 'ipod', 'blackberry', 
    'windows phone', 'webos', 'opera mini', 'opera mobi'
  ];
  
  const isMobileUserAgent = mobileKeywords.some(keyword => userAgent.includes(keyword));
  
  // Check for tablet user agents (tablets might be okay for typing)
  const isTablet = /ipad|tablet|kindle|silk/i.test(userAgent) && !/mobile/i.test(userAgent);
  
  // Check for desktop indicators
  const isDesktopUserAgent = /windows nt|macintosh|mac os x|linux/i.test(userAgent) && !isMobileUserAgent;
  
  // Screen size checks (accounting for landscape mode)
  const minDimension = Math.min(screenWidth, screenHeight);
  const maxDimension = Math.max(screenWidth, screenHeight);
  
  // Phone typically has min dimension < 500px even in landscape
  const isPhoneScreen = minDimension < 500;
  
  // Additional checks
  const hasMouseSupport = window.matchMedia("(pointer: fine)").matches;
  const hasHoverSupport = window.matchMedia("(hover: hover)").matches;
  
  // Comprehensive device detection
  const deviceInfo = {
    userAgent,
    platform,
    screenWidth,
    screenHeight,
    minDimension,
    maxDimension,
    touchPoints,
    isMobileUserAgent,
    isTablet,
    isDesktopUserAgent,
    isPhoneScreen,
    hasMouseSupport,
    hasHoverSupport,
    devicePixelRatio: window.devicePixelRatio || 1
  };
  
  // Determine if device can properly support typing course
  const canSupportTypingCourse = () => {
    // Definitely support: Desktop/Laptop
    if (isDesktopUserAgent && (hasMouseSupport || hasHoverSupport)) {
      return true;
    }
    
    // Maybe support: Tablets with external keyboards
    if (isTablet && maxDimension >= 768) {
      return true; // Allow tablets, they might have keyboards
    }
    
    // Don't support: Phones
    if (isMobileUserAgent && isPhoneScreen) {
      return false;
    }
    
    // Edge case: Small windows on desktop (like your 847x744)
    // Check if it's actually a desktop with a small window
    if (hasMouseSupport && hasHoverSupport && !isMobileUserAgent) {
      return true; // It's a desktop with a small window
    }
    
    // Default to checking screen size
    return minDimension >= 600; // Reasonable minimum for typing
  };
  
  return {
    ...deviceInfo,
    isPhone: isMobileUserAgent && isPhoneScreen && !isTablet,
    isTablet,
    isDesktop: isDesktopUserAgent || (hasMouseSupport && hasHoverSupport),
    canSupportTyping: canSupportTypingCourse(),
    deviceSummary: getDeviceSummary(deviceInfo)
  };
};

const getDeviceSummary = (deviceInfo) => {
  if (deviceInfo.isDesktopUserAgent || (deviceInfo.hasMouseSupport && deviceInfo.hasHoverSupport)) {
    return 'Desktop/Laptop';
  }
  if (deviceInfo.isTablet) {
    return 'Tablet';
  }
  if (deviceInfo.isMobileUserAgent && deviceInfo.isPhoneScreen) {
    return 'Phone';
  }
  return 'Unknown Device';
};

// Fun messages for phone users trying to access typing course
export const getPhoneBlockMessage = () => {
  const messages = [
    {
      title: "Nice try! 📱",
      message: "A typing course on a phone? That's like trying to play piano with your nose. Technically possible, but nobody wants to see it.",
      submessage: "Please switch to a device with a real keyboard. Your thumbs will thank you."
    },
    {
      title: "Hold up there, thumb warrior! 👍",
      message: "We admire your confidence, but typing 60 WPM with two thumbs isn't quite what we had in mind.",
      submessage: "Come back on a laptop or desktop for the full typing experience."
    },
    {
      title: "Plot twist! 🔄",
      message: "You've discovered our secret: this typing course doesn't work on phones. Because... physics.",
      submessage: "Find a device with an actual keyboard and let's do this properly."
    },
    {
      title: "Achievement Locked! 🔒",
      message: "Prerequisites not met: Requires a keyboard larger than a candy bar.",
      submessage: "Switch to a computer to unlock this course."
    },
    {
      title: "Error 418: I'm a teapot ☕",
      message: "Your phone refuses to brew typing lessons. It says it's not that kind of device.",
      submessage: "Try again with a computer - they're much better at this sort of thing."
    }
  ];
  
  // Return a random message
  return messages[Math.floor(Math.random() * messages.length)];
};