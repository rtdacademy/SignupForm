// Utility functions for registration card operations
import { toast } from 'sonner';
import { getAllAuthorities } from '../../../config/albertaSchoolBoards';
import { getFacilitatorByEmail } from '../../../config/facilitators';

/**
 * Calculate age from birthday
 * @param {string|Date} birthday - The birthday to calculate from
 * @returns {number|null} The calculated age or null if invalid
 */
export const calculateAge = (birthday) => {
  if (!birthday) return null;
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

/**
 * Copy text to clipboard with success feedback
 * @param {string} text - Text to copy
 * @param {string} fieldName - Name of field for toast message
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text, fieldName) => {
  if (!text) {
    toast.error(`No ${fieldName} to copy`);
    return false;
  }
  
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${fieldName} copied to clipboard`);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    toast.error(`Failed to copy ${fieldName}`);
    return false;
  }
};

/**
 * Get school board code from school board name
 * @param {string} schoolBoardName - The name of the school board
 * @returns {string|null} The school board code or null if not found
 */
export const getSchoolBoardCode = (schoolBoardName) => {
  if (!schoolBoardName) return null;
  
  const authorities = getAllAuthorities();
  
  // Find the code by matching the name
  for (const [code, name] of Object.entries(authorities)) {
    if (name === schoolBoardName || name.includes(schoolBoardName) || schoolBoardName.includes(name)) {
      return code;
    }
  }
  
  // Try partial match if exact match not found
  const lowerName = schoolBoardName.toLowerCase();
  for (const [code, name] of Object.entries(authorities)) {
    if (name.toLowerCase().includes(lowerName) || lowerName.includes(name.toLowerCase())) {
      return code;
    }
  }
  
  return null;
};

/**
 * Format address for clipboard copying
 * @param {Object} address - Address object
 * @returns {string} Formatted address string
 */
export const formatAddressForCopy = (address) => {
  if (!address) return '';
  
  const parts = [];
  if (address.streetAddress || address.street) parts.push(address.streetAddress || address.street);
  if (address.city) parts.push(address.city);
  if (address.province) parts.push(address.province);
  if (address.postalCode) parts.push(address.postalCode);
  if (address.country && address.country !== 'Canada') parts.push(address.country);
  
  return parts.join(', ');
};

/**
 * Get the latest document from a versions array
 * @param {Array} versions - Array of document versions
 * @returns {Object|null} Latest version or null
 */
export const getLatestDocument = (versions) => {
  if (!versions || !Array.isArray(versions) || versions.length === 0) return null;
  
  // Versions are usually stored with the latest at the end
  return versions[versions.length - 1];
};

/**
 * Get previous document versions (excluding latest)
 * @param {Array} versions - Array of document versions
 * @returns {Array} Previous versions in reverse chronological order
 */
export const getPreviousDocumentVersions = (versions) => {
  if (!versions || !Array.isArray(versions) || versions.length <= 1) return [];
  
  // Return all but the latest, in reverse order (newest first)
  return versions.slice(0, -1).reverse();
};

/**
 * Format date for display
 * @param {string|Date|number} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'number' ? new Date(date) : new Date(date);
  
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD format
};

/**
 * Get notification form data for a student
 * @param {Object} familyData - Family data object
 * @param {string} schoolYear - School year (e.g., "25/26")
 * @param {string} studentId - Student ID
 * @returns {Object} Notification form data
 */
export const getNotificationFormData = (familyData, schoolYear, studentId) => {
  const dbSchoolYear = schoolYear.replace('/', '_');
  const notificationForm = familyData?.NOTIFICATION_FORMS?.[dbSchoolYear]?.[studentId];
  
  if (!notificationForm) return null;
  
  return {
    submitted: notificationForm.submissionStatus === 'submitted',
    studentAddress: notificationForm.PART_A?.addresses?.studentAddress,
    registrationDate: notificationForm.PART_A?.editableFields?.registrationDate,
    residentSchoolBoard: notificationForm.PART_A?.editableFields?.residentSchoolBoard,
    pdfVersions: notificationForm.pdfVersions || [],
    latestPdf: getLatestDocument(notificationForm.pdfVersions)
  };
};

/**
 * Get education plan data for a student
 * @param {Object} familyData - Family data object
 * @param {string} schoolYear - School year (e.g., "25/26")
 * @param {string} studentId - Student ID
 * @returns {Object} Education plan data
 */
export const getEducationPlanData = (familyData, schoolYear, studentId) => {
  const dbSchoolYear = schoolYear.replace('/', '_');
  const soloPlan = familyData?.SOLO_EDUCATION_PLANS?.[dbSchoolYear]?.[studentId];
  
  if (!soloPlan) return null;
  
  return {
    submitted: soloPlan.submissionStatus === 'submitted',
    followsAlberta: soloPlan.followAlbertaPrograms,
    pdfVersions: soloPlan.pdfVersions || [],
    latestPdf: getLatestDocument(soloPlan.pdfVersions)
  };
};

/**
 * Get citizenship documents data for a student
 * @param {Object} familyData - Family data object
 * @param {string} studentId - Student ID
 * @returns {Object} Citizenship documents data
 */
export const getCitizenshipDocsData = (familyData, studentId) => {
  const citizenshipDocs = familyData?.STUDENT_CITIZENSHIP_DOCS?.[studentId];
  
  if (!citizenshipDocs) return null;
  
  // Process documents to include AI analysis
  const documentsWithAnalysis = (citizenshipDocs.documents || []).map(doc => {
    const analysisId = doc._analysisId;
    const aiAnalysis = analysisId ? citizenshipDocs.aiAnalysisResults?.[analysisId] : null;
    
    return {
      ...doc,
      analysisId,
      aiAnalysis
    };
  });
  
  return {
    documents: documentsWithAnalysis,
    approved: citizenshipDocs.staffApproval?.isApproved === true,
    requiresReview: citizenshipDocs.requiresStaffReview === true,
    hasAiAnalysis: documentsWithAnalysis.some(doc => doc.aiAnalysis !== null)
  };
};

/**
 * Get AI analysis summary for display
 * @param {Object} analysis - AI analysis object
 * @returns {Object} Formatted analysis for display
 */
export const formatAiAnalysis = (analysis) => {
  if (!analysis) return null;
  
  return {
    isValid: analysis.isValidDocument === true,
    documentType: {
      expected: analysis.expectedType || 'Citizenship Document',
      detected: analysis.detectedDocumentType || 'Unknown',
      confidence: analysis.documentTypeConfidence || 0,
      match: analysis.documentTypeMatch === true
    },
    nameMatch: {
      detected: analysis.detectedName || 
                [analysis.detectedFirstName, analysis.detectedLastName].filter(Boolean).join(' ') || 
                'Not detected',
      match: analysis.studentNameMatch === true,
      confidence: analysis.nameMatchConfidence || 0,
      reasoning: analysis.nameMatchReasoning
    },
    overallScore: analysis.overallScore || 0,
    requiresReview: analysis.requiresManualReview === true,
    reviewPriority: analysis.reviewPriority || 'normal',
    issues: analysis.validationIssues || [],
    confidence: {
      authenticity: analysis.confidence?.documentAuthenticity || 0,
      type: analysis.confidence?.documentType || 0,
      nameExtraction: analysis.confidence?.nameExtraction || 0,
      studentMatch: analysis.confidence?.studentMatch || 0
    },
    documentDetails: {
      number: analysis.documentNumber,
      issueDate: analysis.issueDate,
      expiryDate: analysis.expiryDate,
      issuingAuthority: analysis.issuingAuthority,
      birthDate: analysis.detectedBirthDate
    }
  };
};

/**
 * Determine AI analysis status color
 * @param {Object} analysis - AI analysis object
 * @returns {string} Status color class
 */
export const getAiAnalysisStatus = (analysis) => {
  if (!analysis) return 'gray';
  
  if (analysis.isValidDocument && analysis.studentNameMatch) {
    return 'green'; // Valid and matches
  } else if (analysis.requiresManualReview) {
    if (analysis.reviewPriority === 'high') {
      return 'red'; // High priority review needed
    }
    return 'yellow'; // Review needed
  } else if (!analysis.isValidDocument) {
    return 'red'; // Invalid document
  }
  
  return 'blue'; // Processing or unknown
};

/**
 * Get primary guardian information
 * @param {Object} familyData - Family data object
 * @returns {Object|null} Primary guardian data
 */
export const getPrimaryGuardian = (familyData) => {
  if (!familyData?.guardians) return null;
  
  // Find primary guardian
  const guardians = Object.values(familyData.guardians);
  const primary = guardians.find(g => g.guardianType === 'primary_guardian');
  
  return primary || guardians[0] || null;
};

/**
 * Get facilitator name from email
 * @param {string} facilitatorEmail - Facilitator's email address
 * @returns {string} Facilitator name or email prefix
 */
export const getFacilitatorName = (facilitatorEmail) => {
  if (!facilitatorEmail) return 'Unassigned';
  
  const facilitator = getFacilitatorByEmail(facilitatorEmail);
  if (facilitator) {
    return facilitator.name;
  }
  
  // Fallback to email prefix
  return facilitatorEmail.split('@')[0];
};

/**
 * Build copyable text for all student info
 * @param {Object} student - Student object
 * @param {Object} notificationData - Notification form data
 * @param {Object} guardian - Primary guardian data
 * @returns {string} Formatted text for copying
 */
export const buildStudentInfoText = (student, notificationData, guardian) => {
  const lines = [];
  
  lines.push('STUDENT INFORMATION');
  lines.push('===================');
  if (student.asn) lines.push(`ASN: ${student.asn}`);
  lines.push(`Name: ${student.firstName} ${student.lastName}`);
  if (student.preferredName) lines.push(`Preferred Name: ${student.preferredName}`);
  lines.push(`Birthday: ${formatDate(student.birthday)} (Age: ${calculateAge(student.birthday)})`);
  lines.push(`Grade: ${student.grade}`);
  lines.push(`Gender: ${student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : 'Other'}`);
  
  if (notificationData?.registrationDate) {
    lines.push(`\nRegistration Date: ${formatDate(notificationData.registrationDate)}`);
  }
  
  if (notificationData?.studentAddress) {
    lines.push(`\nStudent Address: ${formatAddressForCopy(notificationData.studentAddress)}`);
  }
  
  if (notificationData?.residentSchoolBoard) {
    const code = getSchoolBoardCode(notificationData.residentSchoolBoard);
    lines.push(`School Board: ${notificationData.residentSchoolBoard}${code ? ` (${code})` : ''}`);
  }
  
  if (guardian) {
    lines.push('\nPRIMARY GUARDIAN');
    lines.push('================');
    lines.push(`Name: ${guardian.firstName} ${guardian.lastName}`);
    if (guardian.email) lines.push(`Email: ${guardian.email}`);
    if (guardian.phone) lines.push(`Phone: ${guardian.phone}`);
    if (guardian.address) lines.push(`Address: ${formatAddressForCopy(guardian.address)}`);
  }
  
  return lines.join('\n');
};

/**
 * Check if all required documents are present
 * @param {Object} notificationData - Notification form data
 * @param {Object} citizenshipData - Citizenship documents data
 * @param {Object} educationData - Education plan data
 * @returns {Object} Document status
 */
export const checkDocumentStatus = (notificationData, citizenshipData, educationData) => {
  return {
    notification: {
      present: notificationData?.submitted === true,
      hasFile: notificationData?.latestPdf !== null
    },
    citizenship: {
      present: citizenshipData?.documents?.length > 0,
      approved: citizenshipData?.approved === true,
      needsReview: citizenshipData?.requiresReview === true
    },
    education: {
      present: educationData?.submitted === true,
      hasFile: educationData?.latestPdf !== null
    }
  };
};