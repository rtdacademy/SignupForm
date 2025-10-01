// Centralized Facilitator Configuration
// This file contains all facilitator information used across the RTD Connect platform

// Base URL for facilitator profiles
const FACILITATOR_BASE_URL = 'https://rtd-connect.com';

// Facilitator Availability - Binary System
// Two separate flags for clear availability management
export const AVAILABILITY_STATUS = {
  // No longer using status strings - using boolean flags instead
  // acceptsIntentRegistrations: true/false
  // acceptsRegularRegistrations: true/false
};

export const FACILITATORS = [
  {
    id: 'golda-david',
    name: 'Golda David',
    title: 'Senior Home Education Facilitator',
    experience: '20+ years experience',
    description: 'With over 20 years of experience in education, including years spent home educating (unschooling) her own son, Golda specializes in supporting families in a holistic, non-judgemental format while ensuring all families meet the needs of their children and can move forward with confidence.',
    image: '/connectImages/Golda.jpg',
    specializations: [
      'Student-Led Learning & Unschooling',
      'Support for Children with Exceptionalities', 
      'High School Support (Credit or Non-Credit)',
      'Parental Support & Resource Sourcing'
    ],
    stats: [
      { icon: 'Star', value: '20+', label: 'Years Experience' },
      { icon: 'Users', value: '300+', label: 'Families Supported' },
      { icon: 'GraduationCap', value: 'Since 2004', label: 'Educator' }
    ],
    contact: {
      email: 'golda@rtd-connect.com'
    },
    profilePath: '/facilitator/golda-david',
    gradients: {
      card: 'from-purple-500 to-blue-500',
      border: 'border-purple-100'
    },
    // Grade focus for assignment recommendations
    gradeFocus: {
      primary: ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      secondary: [] // Handles all grades equally well
    },
    availability: {
      acceptsIntentRegistrations: true,
      acceptsRegularRegistrations: false,
      unavailableReason: 'At capacity for regular registrations',
      notes: 'Currently accepting Intent to Register for 2025-26'
    }
  },
  {
    id: 'grace-anne-post',
    name: 'Grace-Anne Post',
    title: 'K-12 Home Education Teacher/Facilitator',
    experience: '25+ years experience',
    description: 'With over 20 years of homeschooling her own children and extensive experience supporting diverse learners, Grace-Anne offers empathetic, grounded guidance rooted in child development and brain-based learning.',
    image: '/connectImages/Grace-Anne.jpg',
    specializations: [
      'Eclectic & Interest-Led Learning',
      'Support for Gifted & Neurodiverse Learners',
      'Highly Sensitive Children (HSP)',
      'Early Childhood Development'
    ],
    stats: [
      { icon: 'Star', value: '25+', label: 'Years Experience' },
      { icon: 'GraduationCap', value: 'B.Ed, ECE', label: 'Qualifications' },
      { icon: 'Users', value: '20+', label: 'Years Homeschooling' }
    ],
    contact: {
      email: 'grace-anne@rtd-connect.com'
    },
    profilePath: '/facilitator/grace-anne-post',
    gradients: {
      card: 'from-green-500 to-teal-500',
      border: 'border-green-100'
    },
    // Grade focus for assignment recommendations
    gradeFocus: {
      primary: ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      secondary: [] // Handles all grades equally well
    },
    availability: {
      acceptsIntentRegistrations: true,
      acceptsRegularRegistrations: false,
      unavailableReason: 'At capacity for regular registrations',
      notes: 'Currently accepting Intent to Register for 2025-26'
    }
  },
  {
    id: 'marian-johnson',
    name: 'Marian Johnson',
    title: 'Home Education Facilitator | Community Connector | Experiential Learning Advocate',
    experience: 'Facilitator since 2020 | M.Ed in progress',
    description: 'Marian Johnson is a dynamic Home Education Facilitator dedicated to supporting homeschooling families across rural Alberta since 2020. With a strong background in student-centered learning and virtual education, Marian supports families navigating the complexities of home-based education by providing personalized guidance, curriculum planning, and access to academic and emotional support resources.',
    image: '/connectImages/marian.jpg',
    specializations: [
      'Experiential Learning & Global Citizenship',
      'Rural Home Education Support',
      'Curriculum Planning & Personalized Learning',
      'Welcomes Parents Who Are Brand New to Homeschooling'
    ],
    stats: [
      { icon: 'GraduationCap', value: 'Since 2020', label: 'Facilitator' },
      { icon: 'Award', value: 'M.Ed', label: 'In Progress' },
      { icon: 'Star', value: 'Certified', label: 'AB Teacher' }
    ],
    contact: {
      email: 'marian@rtd-connect.com',
      phone: '780-777-1608'
    },
    profilePath: '/facilitator/marian-johnson',
    gradients: {
      card: 'from-blue-500 to-cyan-500',
      border: 'border-blue-100'
    },
    // Grade focus for assignment recommendations
    gradeFocus: {
      primary: ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      secondary: []
    },
    availability: {
      acceptsIntentRegistrations: false,
      acceptsRegularRegistrations: false,
      unavailableReason: 'Not accepting new families at this time',
      notes: ''
    }
  },
  {
    id: 'elise',
    name: 'Elise',
    title: 'Alternative Learning & Literacy Specialist',
    experience: 'B.Ed, B.A, NAMC Montessori',
    description: 'Elise is passionate about alternative learning styles and finding ways to help each family and child flourish. She is excited to learn alongside them! With her B.A in English and Creative Writing from the University of Alberta, she loves helping children unlock their love of reading and writing.',
    image: '/connectImages/Elise.jpg',
    specializations: [
      'Reading and Creative Writing',
      'Montessori and Child-Led Learning',
      'Elementary Education',
      'Alternative Learning Styles'
    ],
    stats: [
      { icon: 'GraduationCap', value: 'B.Ed, B.A', label: 'Qualifications' },
      { icon: 'BookOpen', value: 'NAMC', label: 'Montessori Certified' },
      { icon: 'Heart', value: 'Elementary', label: 'Focus Ages' }
    ],
    contact: {
      email: 'elise@rtd-connect.com'
    },
    profilePath: '/facilitator/elise',
    gradients: {
      card: 'from-pink-500 to-purple-500',
      border: 'border-pink-100'
    },
    // Grade focus for assignment recommendations - Elementary ages
    gradeFocus: {
      primary: ['K', '1', '2', '3', '4', '5', '6'],
      secondary: ['7', '8'] // Can support some middle school
    },
    availability: {
      acceptsIntentRegistrations: true,
      acceptsRegularRegistrations: false,
      unavailableReason: 'At capacity for regular registrations',
      notes: 'Currently accepting Intent to Register for 2025-26'
    }
  },
  {
    id: 'kari-luther',
    name: 'Kari Luther',
    title: 'Holistic Learning Specialist',
    experience: '30+ years experience',
    description: 'With over 30 years of experience working with children in various settings, Kari is passionate about supporting holistic, authentic, child-led learning. She understands and appreciates that each child and family\'s journey in education can be as unique as they are.',
    image: '/connectImages/Kari.jpg',
    imageStyle: 'object-top', // Custom positioning to better frame her face
    specializations: [
      'Nature-based & Play-based Learning',
      'Child-Led Learning & Art Education',
      'Indigenous Education & Early Literacy',
      'Resource Sourcing & Early Elementary'
    ],
    stats: [
      { icon: 'Star', value: '30+', label: 'Years Experience' },
      { icon: 'GraduationCap', value: 'M.Ed, B.A./B.Ed.', label: 'Qualifications' },
      { icon: 'Heart', value: '10 Years', label: 'Rural Teaching' }
    ],
    contact: {
      email: 'kari@rtd-connect.com'
    },
    profilePath: '/facilitator/kari-luther',
    gradients: {
      card: 'from-emerald-500 to-teal-500',
      border: 'border-emerald-100'
    },
    // Grade focus for assignment recommendations - Early Elementary focus
    gradeFocus: {
      primary: ['K', '1', '2', '3', '4', '5', '6'],
      secondary: ['7', '8', '9'] // Can support some middle school
    },
    availability: {
      acceptsIntentRegistrations: true,
      acceptsRegularRegistrations: false,
      unavailableReason: 'At capacity for regular registrations',
      notes: 'Currently accepting Intent to Register for 2025-26'
    }
  }
];

// Helper functions for facilitator management

/**
 * Shuffle array helper function for randomization
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled copy of the array
 */
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Get all facilitators
 * @returns {Array} Array of all facilitator objects
 */
export const getAllFacilitators = () => {
  return FACILITATORS;
};

/**
 * Get all facilitators with randomized order for available ones
 * Available facilitators are randomized and shown first, full ones are at the bottom
 * @returns {Array} Array of facilitator objects with available ones randomized first
 */
export const getAllFacilitatorsRandomized = () => {
  const available = FACILITATORS.filter(f => f.availability?.status !== 'closed');
  const full = FACILITATORS.filter(f => f.availability?.status === 'closed');
  return [...shuffleArray(available), ...full];
};

/**
 * Get available facilitators only (open or intent-only)
 * @returns {Array} Array of available facilitator objects
 */
export const getAvailableFacilitators = () => {
  return FACILITATORS.filter(f => f.availability?.status !== 'closed');
};

/**
 * Get full/closed facilitators only
 * @returns {Array} Array of full facilitator objects
 */
export const getFullFacilitators = () => {
  return FACILITATORS.filter(f => f.availability?.status === 'closed');
};

/**
 * Get facilitators available for funded registrations (open status)
 * @returns {Array} Facilitators accepting funded families
 */
export const getFundedAvailableFacilitators = () => {
  return FACILITATORS.filter(f => f.availability?.status === 'open');
};

/**
 * Get facilitators available for intent registrations (intent-only or open)
 * @returns {Array} Facilitators accepting intent families
 */
export const getIntentAvailableFacilitators = () => {
  return FACILITATORS.filter(f =>
    f.availability?.status === 'intent-only' ||
    f.availability?.status === 'open'
  );
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
 * Get facilitator by email
 * @param {string} facilitatorEmail - The facilitator's email address
 * @returns {Object|null} Facilitator object or null if not found
 */
export const getFacilitatorByEmail = (facilitatorEmail) => {
  return FACILITATORS.find(facilitator => facilitator.contact?.email === facilitatorEmail) || null;
};

/**
 * Get full profile URL for a facilitator
 * @param {Object} facilitator - The facilitator object
 * @returns {string} Full URL to the facilitator's profile page
 */
export const getFacilitatorProfileUrl = (facilitator) => {
  if (!facilitator?.profilePath) return null;
  return `${FACILITATOR_BASE_URL}${facilitator.profilePath}`;
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
 * Check if facilitator accepts intent registrations
 * @param {string} facilitatorId - Facilitator ID
 * @returns {boolean} True if accepting intent
 */
export const acceptsIntentRegistrations = (facilitatorId) => {
  const facilitator = getFacilitatorById(facilitatorId);
  if (!facilitator) return false;
  return facilitator.availability?.acceptsIntentRegistrations === true;
};

/**
 * Check if facilitator accepts funded registrations
 * @param {string} facilitatorId - Facilitator ID
 * @returns {boolean} True if accepting funded
 */
export const acceptsFundedRegistrations = (facilitatorId) => {
  const facilitator = getFacilitatorById(facilitatorId);
  return facilitator?.availability?.acceptsRegularRegistrations === true;
};

/**
 * Get facilitator availability for current phase (Binary System)
 * @param {string} facilitatorId - Facilitator ID
 * @param {string} selectionType - 'intent' or 'regular'
 * @returns {Object} Availability info
 */
export const getFacilitatorAvailabilityForType = (facilitatorId, selectionType) => {
  const facilitator = getFacilitatorById(facilitatorId);
  if (!facilitator) return { isAvailable: false, message: 'Facilitator not found', badge: 'Not Found' };

  const availability = facilitator.availability || {};

  if (selectionType === 'intent') {
    const isAvailable = availability.acceptsIntentRegistrations === true;
    return {
      isAvailable,
      message: isAvailable
        ? 'Available for intent to register'
        : (availability.unavailableReason || 'Not accepting intent registrations'),
      badge: isAvailable ? 'Accepting Intent to Register' : (availability.unavailableReason || 'Closed')
    };
  }

  if (selectionType === 'regular' || selectionType === 'funded') {
    const isAvailable = availability.acceptsRegularRegistrations === true;
    return {
      isAvailable,
      message: isAvailable
        ? 'Available for funded registration'
        : (availability.unavailableReason || 'Not accepting funded registrations'),
      badge: isAvailable ? 'Available' : (availability.unavailableReason || 'Closed')
    };
  }

  return { isAvailable: false, message: 'Invalid selection type', badge: 'Error' };
};

/**
 * Get facilitator dropdown options for forms (legacy - uses available facilitators)
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

  // Only add available facilitator options (open or intent-only)
  const availableFacilitators = getAvailableFacilitators();
  availableFacilitators.forEach(facilitator => {
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
 * Get facilitator dropdown options filtered by selection type
 * @param {string} selectionType - 'funded' or 'intent'
 * @returns {Array} Filtered dropdown options
 */
export const getFacilitatorDropdownOptionsByType = (selectionType) => {
  const options = [{
    value: '',
    label: 'Choose your facilitator below',
    description: 'Please select one of our available facilitators'
  }];

  let availableFacilitators;
  if (selectionType === 'funded') {
    availableFacilitators = getFundedAvailableFacilitators();
  } else if (selectionType === 'intent') {
    availableFacilitators = getIntentAvailableFacilitators();
  } else {
    availableFacilitators = [];
  }

  availableFacilitators.forEach(facilitator => {
    options.push({
      value: facilitator.name,
      label: facilitator.name,
      description: facilitator.title,
      facilitatorId: facilitator.id
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
  AVAILABILITY_STATUS,
  getAllFacilitators,
  getAllFacilitatorsRandomized,
  getAvailableFacilitators,
  getFullFacilitators,
  getFundedAvailableFacilitators,
  getIntentAvailableFacilitators,
  getFacilitatorById,
  getFacilitatorByName,
  getFacilitatorByEmail,
  getFacilitatorProfileUrl,
  getFacilitatorsForGrade,
  getRecommendedFacilitator,
  acceptsIntentRegistrations,
  acceptsFundedRegistrations,
  getFacilitatorAvailabilityForType,
  getFacilitatorDropdownOptions,
  getFacilitatorDropdownOptionsByType,
  isValidFacilitator
};