// Utility functions for family notes operations

/**
 * Format note content for display (strip HTML tags for preview)
 * @param {string} content - HTML content from QuillEditor
 * @param {number} maxLength - Maximum length for preview
 * @returns {string} - Plain text preview
 */
export const formatNotePreview = (content, maxLength = 150) => {
  if (!content) return '';
  
  // Remove HTML tags
  const textContent = content.replace(/<[^>]*>/g, ' ');
  
  // Clean up extra whitespace
  const cleanText = textContent.replace(/\s+/g, ' ').trim();
  
  // Truncate if needed
  if (cleanText.length > maxLength) {
    return cleanText.substring(0, maxLength) + '...';
  }
  
  return cleanText;
};

/**
 * Parse mentions from note content
 * @param {string} content - Note content
 * @returns {string[]} - Array of mentioned email addresses
 */
export const parseMentions = (content) => {
  if (!content) return [];
  
  // Look for @mentions in the format @[email]
  const mentionRegex = /@\[([^\]]+)\]/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  
  return [...new Set(mentions)]; // Remove duplicates
};

/**
 * Check if a note matches search criteria
 * @param {Object} note - Note object
 * @param {string} searchTerm - Search term
 * @returns {boolean} - Whether note matches search
 */
export const noteMatchesSearch = (note, searchTerm) => {
  if (!searchTerm) return true;
  
  const term = searchTerm.toLowerCase();
  
  // Search in content (without HTML tags)
  const contentText = note.content.replace(/<[^>]*>/g, '').toLowerCase();
  if (contentText.includes(term)) return true;
  
  // Search in author name
  if (note.authorName?.toLowerCase().includes(term)) return true;
  
  // Search in category
  if (note.category?.toLowerCase().includes(term)) return true;
  
  return false;
};

/**
 * Group notes by date periods
 * @param {Array} notes - Array of note objects
 * @returns {Object} - Notes grouped by time period
 */
export const groupNotesByDate = (notes) => {
  const groups = {
    today: [],
    yesterday: [],
    thisWeek: [],
    thisMonth: [],
    older: []
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  notes.forEach(note => {
    const noteDate = new Date(note.createdAt);
    
    if (noteDate >= today) {
      groups.today.push(note);
    } else if (noteDate >= yesterday) {
      groups.yesterday.push(note);
    } else if (noteDate >= weekAgo) {
      groups.thisWeek.push(note);
    } else if (noteDate >= monthAgo) {
      groups.thisMonth.push(note);
    } else {
      groups.older.push(note);
    }
  });

  return groups;
};

/**
 * Sort notes by various criteria
 * @param {Array} notes - Array of note objects
 * @param {string} sortBy - Sort criteria ('date', 'author', 'category', 'important')
 * @param {string} order - Sort order ('asc', 'desc')
 * @returns {Array} - Sorted notes array
 */
export const sortNotes = (notes, sortBy = 'date', order = 'desc') => {
  const sorted = [...notes];
  
  sorted.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.createdAt) - new Date(b.createdAt);
        break;
      case 'author':
        comparison = (a.authorName || '').localeCompare(b.authorName || '');
        break;
      case 'category':
        comparison = (a.category || '').localeCompare(b.category || '');
        break;
      case 'important':
        comparison = (a.isImportant ? 1 : 0) - (b.isImportant ? 1 : 0);
        break;
      default:
        comparison = 0;
    }
    
    return order === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
};

/**
 * Filter notes by multiple criteria
 * @param {Array} notes - Array of note objects
 * @param {Object} filters - Filter criteria
 * @returns {Array} - Filtered notes array
 */
export const filterNotes = (notes, filters = {}) => {
  return notes.filter(note => {
    // Filter by visibility
    if (filters.visibility && note.visibility !== filters.visibility) {
      return false;
    }
    
    // Filter by category
    if (filters.category && filters.category !== 'all' && note.category !== filters.category) {
      return false;
    }
    
    // Filter by author
    if (filters.author && note.authorEmail !== filters.author) {
      return false;
    }
    
    // Filter by importance
    if (filters.important !== undefined && note.isImportant !== filters.important) {
      return false;
    }
    
    // Filter by date range
    if (filters.dateFrom && new Date(note.createdAt) < new Date(filters.dateFrom)) {
      return false;
    }
    if (filters.dateTo && new Date(note.createdAt) > new Date(filters.dateTo)) {
      return false;
    }
    
    // Filter by search term
    if (filters.searchTerm && !noteMatchesSearch(note, filters.searchTerm)) {
      return false;
    }
    
    return true;
  });
};

/**
 * Get statistics about notes
 * @param {Array} notes - Array of note objects
 * @returns {Object} - Statistics object
 */
export const getNotesStatistics = (notes) => {
  const stats = {
    total: notes.length,
    byVisibility: {
      personal: 0,
      shared: 0
    },
    byCategory: {},
    important: 0,
    unread: 0,
    authors: new Set(),
    dateRange: {
      earliest: null,
      latest: null
    }
  };
  
  notes.forEach(note => {
    // Count by visibility
    if (note.visibility === 'personal') {
      stats.byVisibility.personal++;
    } else {
      stats.byVisibility.shared++;
    }
    
    // Count by category
    if (note.category) {
      stats.byCategory[note.category] = (stats.byCategory[note.category] || 0) + 1;
    }
    
    // Count important
    if (note.isImportant) {
      stats.important++;
    }
    
    // Track authors
    if (note.authorEmail) {
      stats.authors.add(note.authorEmail);
    }
    
    // Track date range
    const noteDate = new Date(note.createdAt);
    if (!stats.dateRange.earliest || noteDate < stats.dateRange.earliest) {
      stats.dateRange.earliest = noteDate;
    }
    if (!stats.dateRange.latest || noteDate > stats.dateRange.latest) {
      stats.dateRange.latest = noteDate;
    }
  });
  
  stats.authors = Array.from(stats.authors);
  
  return stats;
};

/**
 * Export notes to CSV format
 * @param {Array} notes - Array of note objects
 * @param {Object} family - Family object
 * @returns {string} - CSV content
 */
export const exportNotesToCSV = (notes, family) => {
  const headers = [
    'Date Created',
    'Author',
    'Category',
    'Visibility',
    'Important',
    'Content',
    'Last Updated'
  ];
  
  const rows = notes.map(note => {
    const content = formatNotePreview(note.content, 500);
    return [
      new Date(note.createdAt).toLocaleString(),
      note.authorName || note.authorEmail,
      note.category || 'general',
      note.visibility,
      note.isImportant ? 'Yes' : 'No',
      `"${content.replace(/"/g, '""')}"`, // Escape quotes in content
      note.updatedAt ? new Date(note.updatedAt).toLocaleString() : ''
    ];
  });
  
  // Add family information at the top
  const familyInfo = [
    [`Family Notes Export - ${family?.familyName || 'Unknown Family'}`],
    [`Export Date: ${new Date().toLocaleString()}`],
    [`Total Notes: ${notes.length}`],
    [''],
    headers
  ];
  
  const csvContent = [
    ...familyInfo,
    ...rows
  ].map(row => row.join(',')).join('\n');
  
  return csvContent;
};

/**
 * Download content as file
 * @param {string} content - File content
 * @param {string} filename - Filename
 * @param {string} type - MIME type
 */
export const downloadFile = (content, filename, type = 'text/csv') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Validate note data before saving
 * @param {Object} noteData - Note data to validate
 * @returns {Object} - Validation result
 */
export const validateNoteData = (noteData) => {
  const errors = [];
  
  if (!noteData.content || noteData.content.trim() === '') {
    errors.push('Note content is required');
  }
  
  if (!noteData.category) {
    errors.push('Note category is required');
  }
  
  if (!noteData.visibility) {
    errors.push('Note visibility is required');
  }
  
  if (noteData.visibility !== 'personal' && noteData.visibility !== 'shared') {
    errors.push('Invalid visibility value');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitize HTML content from QuillEditor
 * @param {string} html - HTML content
 * @returns {string} - Sanitized HTML
 */
export const sanitizeNoteContent = (html) => {
  if (!html) return '';
  
  // This is a basic sanitization - in production, use a library like DOMPurify
  // Remove script tags and event handlers
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*"[^"]*"/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*'[^']*'/gi, '');
  
  return sanitized;
};