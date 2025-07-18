// Centralized Facilitator Configuration
// This file contains all facilitator information used across the RTD Connect platform

export const FACILITATORS = [
  {
    id: 'sarah-johnson',
    name: 'Sarah Johnson',
    title: 'Senior Home Education Facilitator',
    experience: '12+ years experience',
    description: 'Specializes in elementary and middle school curriculum planning, learning differences support, and helping families navigate SOLO compliance with confidence.',
    image: '/connectImages/FakeFacil2.png',
    specializations: [
      'Elementary & Middle School Expert',
      'Learning Differences Support', 
      'SOLO Compliance & Assessment'
    ],
    stats: [
      { icon: 'Star', value: '12+', label: 'Years Experience' },
      { icon: 'Users', value: '150+', label: 'Families Supported' },
      { icon: 'Clock', value: '24hr', label: 'Response Time' }
    ],
    contact: {
      email: 'sarah.johnson@rtdacademy.com',
      phone: '(403) 555-0124'
    },
    gradients: {
      card: 'from-purple-500 to-blue-500',
      border: 'border-purple-100'
    },
    // Grade focus for assignment recommendations
    gradeFocus: {
      primary: ['K', '1', '2', '3', '4', '5', '6', '7', '8'],
      secondary: ['9'] // Can handle some Grade 9
    }
  },
  {
    id: 'michael-chen',
    name: 'Michael Chen',
    title: 'High School & Transition Specialist',
    experience: '8+ years experience',
    description: 'Dedicated to helping teens succeed in high school home education, diploma exam preparation, and planning for post-secondary education and career success.',
    image: '/connectImages/FakeFacil1.png',
    specializations: [
      'High School Course Planning',
      'Diploma Exam Preparation',
      'University Admission Guidance'
    ],
    stats: [
      { icon: 'Star', value: '8+', label: 'Years Experience' },
      { icon: 'Users', value: '85+', label: 'Students Graduated' },
      { icon: 'Clock', value: 'Same Day', label: 'Response Time' }
    ],
    contact: {
      email: 'michael.chen@rtdacademy.com',
      phone: '(403) 555-0125'
    },
    gradients: {
      card: 'from-blue-500 to-cyan-500',
      border: 'border-blue-100'
    },
    // Grade focus for assignment recommendations
    gradeFocus: {
      primary: ['9', '10', '11', '12'],
      secondary: ['8'] // Can handle some Grade 8
    }
  }
];

// Helper functions for facilitator management

/**
 * Get all facilitators
 * @returns {Array} Array of all facilitator objects
 */
export const getAllFacilitators = () => {
  return FACILITATORS;
};

/**
 * Get facilitator by ID
 * @param {string} facilitatorId - The facilitator's unique ID
 * @returns {Object|null} Facilitator object or null if not found
 */
export const getFacilitatorById = (facilitatorId) => {
  return FACILITATORS.find(facilitator => facilitator.id === facilitatorId) || null;
};

/**
 * Get facilitator by name
 * @param {string} facilitatorName - The facilitator's name
 * @returns {Object|null} Facilitator object or null if not found
 */
export const getFacilitatorByName = (facilitatorName) => {
  return FACILITATORS.find(facilitator => facilitator.name === facilitatorName) || null;
};

/**
 * Get facilitators suitable for a specific grade level
 * @param {string} grade - The student's grade level (e.g., 'K', '1', '2', etc.)
 * @returns {Array} Array of facilitator objects suitable for the grade
 */
export const getFacilitatorsForGrade = (grade) => {
  return FACILITATORS.filter(facilitator => 
    facilitator.gradeFocus.primary.includes(grade) || 
    facilitator.gradeFocus.secondary.includes(grade)
  );
};

/**
 * Get recommended facilitator for a student's grade
 * @param {string} grade - The student's grade level
 * @returns {Object|null} Best-match facilitator or null if none found
 */
export const getRecommendedFacilitator = (grade) => {
  // First try to find a facilitator with primary focus on this grade
  const primaryMatch = FACILITATORS.find(facilitator => 
    facilitator.gradeFocus.primary.includes(grade)
  );
  
  if (primaryMatch) return primaryMatch;
  
  // If no primary match, find secondary match
  const secondaryMatch = FACILITATORS.find(facilitator => 
    facilitator.gradeFocus.secondary.includes(grade)
  );
  
  return secondaryMatch || null;
};

/**
 * Get facilitator dropdown options for forms
 * @param {string} studentGrade - Optional grade (not used for recommendations anymore)
 * @returns {Array} Array of options with value, label, and description
 */
export const getFacilitatorDropdownOptions = (studentGrade = null) => {
  const options = [];
  
  // Add default selection option
  options.push({
    value: '',
    label: 'Choose your facilitator below',
    description: 'Please select one of our available facilitators'
  });
  
  // Add all facilitator options in their original order
  FACILITATORS.forEach(facilitator => {
    options.push({
      value: facilitator.name,
      label: facilitator.name,
      description: facilitator.title,
      facilitatorId: facilitator.id,
      isRecommended: false
    });
  });
  
  return options;
};

/**
 * Validate if a facilitator name exists
 * @param {string} facilitatorName - Name to validate
 * @returns {boolean} True if facilitator exists
 */
export const isValidFacilitator = (facilitatorName) => {
  if (!facilitatorName || facilitatorName.trim() === '') return true; // Allow empty (not assigned)
  return FACILITATORS.some(facilitator => facilitator.name === facilitatorName);
};

// Export default for backwards compatibility
export default {
  FACILITATORS,
  getAllFacilitators,
  getFacilitatorById,
  getFacilitatorByName,
  getFacilitatorsForGrade,
  getRecommendedFacilitator,
  getFacilitatorDropdownOptions,
  isValidFacilitator
};