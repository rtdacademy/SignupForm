/**
 * Styles for the MultipleChoiceQuestion component
 * This separate file helps keep the component file cleaner and more focused
 */

// Define the theme color configurations
export const themeConfigs = {
  blue: { 
    name: 'blue',
    bgLight: '#EFF6FF', // bg-blue-50
    bgDark: '#DBEAFE',  // bg-blue-100
    border: '#BFDBFE',  // border-blue-200
    textDark: '#1E40AF', // text-blue-800
    accent: '#3B82F6',  // blue-500
    accentHover: '#2563EB', // blue-600
  },
  green: {
    name: 'green',
    bgLight: '#ECFDF5', // bg-green-50
    bgDark: '#D1FAE5',  // bg-green-100
    border: '#A7F3D0',  // border-green-200
    textDark: '#065F46', // text-green-800
    accent: '#10B981',  // green-500
    accentHover: '#059669', // green-600
  },
  purple: {
    name: 'purple',
    bgLight: '#F5F3FF', // bg-purple-50
    bgDark: '#EDE9FE',  // bg-purple-100
    border: '#DDD6FE',  // border-purple-200
    textDark: '#5B21B6', // text-purple-800
    accent: '#8B5CF6',  // purple-500
    accentHover: '#7C3AED', // purple-600
  },
  amber: {
    name: 'amber',
    bgLight: '#FFFBEB', // bg-amber-50
    bgDark: '#FEF3C7',  // bg-amber-100
    border: '#FDE68A',  // border-amber-200
    textDark: '#92400E', // text-amber-800
    accent: '#F59E0B',  // amber-500
    accentHover: '#D97706', // amber-600
  },
  red: {
    name: 'red',
    bgLight: '#FEF2F2', // bg-red-50
    bgDark: '#FEE2E2',  // bg-red-100
    border: '#FECACA',  // border-red-200
    textDark: '#991B1B', // text-red-800
    accent: '#EF4444',  // red-500
    accentHover: '#DC2626', // red-600
  },
  gray: {
    name: 'gray',
    bgLight: '#F9FAFB', // bg-gray-50
    bgDark: '#F3F4F6',  // bg-gray-100
    border: '#E5E7EB',  // border-gray-200
    textDark: '#1F2937', // text-gray-800
    accent: '#6B7280',  // gray-500
    accentHover: '#4B5563', // gray-600
  }
};

// Animation variants for framer-motion
export const animations = {
  container: {
    hidden: { opacity: 0 },
    show: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  },
  fadeIn: {
    hidden: { opacity: 0 },
    show: { opacity: 1 }
  },
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  },
  pulse: {
    hidden: { scale: 0.95, opacity: 0.7 },
    show: { 
      scale: [0.95, 1.02, 1],
      opacity: 1,
      transition: { 
        times: [0, 0.7, 1],
        duration: 0.5
      }
    }
  }
};

// Get the theme colors based on the theme name
export function getThemeColors(theme) {
  return themeConfigs[theme] || themeConfigs.blue;
}

// Generate CSS classes for the button based on the theme
export function getButtonClasses(theme) {
  const themeColors = getThemeColors(theme);
  return `bg-${themeColors.name}-600 hover:bg-${themeColors.name}-700 text-white font-medium py-2 px-4 rounded-md transition-colors`;
}

// Generate inline styles for components
export function getContainerStyles(theme) {
  const themeColors = getThemeColors(theme);
  return {
    backgroundColor: themeColors.bgLight,
    borderColor: themeColors.border,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  };
}

export function getHeaderStyles(theme) {
  const themeColors = getThemeColors(theme);
  return {
    backgroundColor: themeColors.bgDark,
    borderColor: themeColors.border,
    color: themeColors.textDark,
  };
}

export function getOptionStyles(theme, isSelected) {
  const themeColors = getThemeColors(theme);
  
  if (isSelected) {
    return {
      backgroundColor: `${themeColors.bgDark}`,
      borderColor: themeColors.accent,
      boxShadow: `0 0 0 1px ${themeColors.accent}`,
    };
  }
  
  return {
    backgroundColor: 'white',
    borderColor: '#E5E7EB', // gray-200
    transition: 'all 0.2s ease',
  };
}

export function getSubmitButtonStyles(theme) {
  const themeColors = getThemeColors(theme);
  return {
    backgroundColor: themeColors.accent,
    color: 'white',
    '&:hover': {
      backgroundColor: themeColors.accentHover,
    }
  };
}