

// src/edbotz/utils/settings.js

export const AI_MODEL_MAPPING = {
  standard: {
    name: 'gemini-2.0-flash-lite',
    label: 'Gemini 2.0 Flash-Lite',
    description: 'Great model for everyday use. This model provides quick, concise responses perfect for common tasks like answering questions, writing assistance, and basic analysis. It balances speed and accuracy while keeping costs low, making it ideal for chat applications with steady traffic. Best choice if you need reliable performance without advanced features.',
  },
  advanced: {
    name: 'gemini-2.0-flash',
    label: 'Gemini 2.0 Flash',
    description: 'Our most powerful model offering enhanced capabilities for complex tasks. Features improved context understanding, more nuanced responses, and better handling of specialized topics. Choose this model for tasks requiring deep analysis, technical discussions, creative writing, or when accuracy is critical. Ideal for professional applications where quality takes priority over speed.',
  },
  fallback: {
    name: 'gemini-1.5-flash',
    label: 'Gemini 1.5 Flash',
    description: 'A reliable backup model that maintains service continuity during high demand or system constraints. While slightly older than our 2.0 versions, it delivers consistent performance for most tasks. Automatically engages when needed to prevent service interruptions, ensuring your application remains responsive even under heavy load. No action required from users as this switches seamlessly in the background.',
  },
  livechat: {
    name: 'gemini-1.5-flash',
    label: 'Gemini 1.5 Flash for Chat',
    description: 'Optimized for real-time interactive chat applications. This model delivers fast, responsive outputs for dynamic conversations while maintaining high quality responses. Perfect for chat interfaces requiring quick turnaround times and natural conversational flow.',
  }
};




export const LESSON_TYPES = {
    general: {
      value: 'general',
      label: 'General',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      badge: 'bg-gray-100 text-gray-700'
    },
    lesson: {
      value: 'lesson',
      label: 'Lesson',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      badge: 'bg-blue-100 text-blue-700'
    },
    assignment: {
      value: 'assignment',
      label: 'Assignment',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      badge: 'bg-green-100 text-green-700'
    },
    quiz: {
      value: 'quiz',
      label: 'Quiz',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      badge: 'bg-amber-100 text-amber-700'
    },
    exam: {
      value: 'exam',
      label: 'Exam',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      badge: 'bg-red-100 text-red-700'
    },
    project: {
      value: 'project',
      label: 'Project',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      badge: 'bg-purple-100 text-purple-700'
    }
  };