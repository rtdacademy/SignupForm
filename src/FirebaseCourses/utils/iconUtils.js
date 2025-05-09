/**
 * Centralized icon imports and mapping for Firebase Courses
 * This helps maintain consistency across the application and
 * makes it easier to update icons in one place.
 */

import {
  // Navigation & UI icons
  BookOpen,
  BookMarked,
  Layout,
  Layers,
  Compass,
  GraduationCap,
  ClipboardList,
  ClipboardCheck,
  FileText,
  FileQuestion,
  FileCheck,
  PenTool,
  CheckCircle,
  XCircle,
  HelpCircle,
  AlertCircle,
  Info,
  Award,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  
  // Content type icons
  Video,
  Image,
  FilePresentation,
  ListChecks,
  Code,
  
  // Activity icons
  Brain,
  Lightbulb,
  Target,
  Sparkles,
  Zap,
  Clock,
  Calendar,
  CopyCheck,
  
  // Status icons
  Check,
  X,
  AlertTriangle,
  PlayCircle,
  PauseCircle,
  LockKeyhole,
} from 'lucide-react';

/**
 * Maps course item types to their icons
 */
export const typeIcons = {
  lesson: BookOpen,
  assignment: ClipboardCheck,
  exam: FileText,
  quiz: FileQuestion,
  project: PenTool,
  video: Video,
  info: Lightbulb,
  resource: FilePresentation,
};

/**
 * Maps progress status to appropriate icons
 */
export const statusIcons = {
  completed: CheckCircle,
  inProgress: PlayCircle,
  locked: LockKeyhole,
  notStarted: Clock,
  failed: XCircle,
  passed: Award,
};

/**
 * Utility function to get the appropriate icon for a content type
 * @param {string} type - The content type
 * @param {object} props - Props to pass to the icon (size, className, etc.)
 * @returns {JSX.Element} The icon component
 */
export const getContentTypeIcon = (type, props = {}) => {
  const IconComponent = typeIcons[type] || Lightbulb;
  return <IconComponent {...props} />;
};

/**
 * Utility function to get the appropriate icon for a status
 * @param {string} status - The status
 * @param {object} props - Props to pass to the icon (size, className, etc.)
 * @returns {JSX.Element} The icon component
 */
export const getStatusIcon = (status, props = {}) => {
  const IconComponent = statusIcons[status] || HelpCircle;
  return <IconComponent {...props} />;
};

/**
 * Returns style classes for different content types
 */
export const typeColors = {
  lesson: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    accent: 'bg-blue-50 border-l-4 border-blue-300'
  },
  assignment: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-200', 
    accent: 'bg-emerald-50 border-l-4 border-emerald-300'
  },
  exam: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200',
    accent: 'bg-purple-50 border-l-4 border-purple-300'
  },
  quiz: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
    accent: 'bg-indigo-50 border-l-4 border-indigo-300'
  },
  info: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-200',
    accent: 'bg-amber-50 border-l-4 border-amber-300'
  },
  video: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    accent: 'bg-red-50 border-l-4 border-red-300'
  },
  project: {
    bg: 'bg-teal-100',
    text: 'text-teal-800',
    border: 'border-teal-200',
    accent: 'bg-teal-50 border-l-4 border-teal-300'
  },
  resource: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
    accent: 'bg-gray-50 border-l-4 border-gray-300'
  }
};

/**
 * Get full set of styles for a content type
 * @param {string} type - The content type
 * @returns {object} Object with style classes
 */
export const getTypeStyles = (type) => {
  return typeColors[type] || typeColors.resource;
};

/**
 * Get combined classes for a badge based on content type
 * @param {string} type - The content type
 * @returns {string} Combined class string
 */
export const getTypeBadgeClasses = (type) => {
  const styles = getTypeStyles(type);
  return `${styles.bg} ${styles.text} ${styles.border}`;
};

export default {
  typeIcons,
  statusIcons,
  getContentTypeIcon,
  getStatusIcon,
  typeColors,
  getTypeStyles,
  getTypeBadgeClasses
};