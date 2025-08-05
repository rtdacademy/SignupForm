import { 
  generateQuestionIdPreview, 
  validateQuestionId, 
  getNextQuestionNumber 
} from './firebaseCourseConfigUtils';

/**
 * Parse JSON string and return questions array with validation
 */
export const parseQuestionJson = (jsonString) => {
  const result = {
    success: false,
    questions: [],
    errors: [],
    warnings: []
  };

  if (!jsonString || !jsonString.trim()) {
    result.errors.push('JSON input is empty');
    return result;
  }

  try {
    const parsed = JSON.parse(jsonString.trim());
    result.questions = extractQuestionsFromParsedData(parsed);
    result.success = true;
  } catch (error) {
    result.errors.push(`Invalid JSON format: ${error.message}`);
    return result;
  }

  return result;
};

/**
 * Extract questions array from various JSON structures
 */
const extractQuestionsFromParsedData = (data) => {
  // Handle different input formats
  if (Array.isArray(data)) {
    return data;
  }
  
  if (data && typeof data === 'object') {
    // Check for common wrapper properties
    if (data.questions && Array.isArray(data.questions)) {
      return data.questions;
    }
    
    if (data.items && Array.isArray(data.items)) {
      return data.items;
    }
    
    // If it's a single object that looks like a question, wrap it
    if (data.title || data.questionId) {
      return [data];
    }
  }
  
  throw new Error('JSON must contain an array of questions or an object with a "questions" property');
};

/**
 * Normalize questions to standard format
 */
export const normalizeQuestions = (questions) => {
  return questions.map((question, index) => {
    // Handle string format (convert to question object)
    if (typeof question === 'string') {
      return {
        title: question.trim(),
        points: 1
      };
    }
    
    // Handle object format
    if (typeof question === 'object' && question !== null) {
      return {
        title: question.title || question.text || question.question || `Question ${index + 1}`,
        points: parseInt(question.points) || parseInt(question.value) || parseInt(question.score) || 1,
        // Preserve any additional properties
        ...question
      };
    }
    
    // Fallback for invalid formats
    return {
      title: `Question ${index + 1}`,
      points: 1
    };
  });
};

/**
 * Validate normalized question data
 */
export const validateQuestionData = (questions) => {
  const result = {
    isValid: true,
    errors: [],
    warnings: [],
    validQuestions: []
  };

  if (!Array.isArray(questions) || questions.length === 0) {
    result.isValid = false;
    result.errors.push('No questions found to import');
    return result;
  }

  questions.forEach((question, index) => {
    const questionErrors = [];
    const questionWarnings = [];
    
    // Validate title
    if (!question.title || typeof question.title !== 'string' || !question.title.trim()) {
      questionErrors.push(`Question ${index + 1}: Missing or empty title`);
    } else if (question.title.length > 200) {
      questionWarnings.push(`Question ${index + 1}: Title is very long (${question.title.length} characters)`);
    }
    
    // Validate points
    if (typeof question.points !== 'number' || question.points < 0) {
      questionErrors.push(`Question ${index + 1}: Points must be a non-negative number`);
    } else if (question.points > 100) {
      questionWarnings.push(`Question ${index + 1}: Points value seems high (${question.points})`);
    }
    
    // Add question-level validation results
    if (questionErrors.length === 0) {
      result.validQuestions.push({
        ...question,
        _importIndex: index
      });
    }
    
    result.errors.push(...questionErrors);
    result.warnings.push(...questionWarnings);
  });

  result.isValid = result.errors.length === 0 && result.validQuestions.length > 0;
  return result;
};

/**
 * Generate import preview with question IDs and validation
 */
export const generateImportPreview = (questions, courseId, itemNumber, existingQuestions = []) => {
  const result = {
    success: false,
    previewItems: [],
    summary: {
      totalQuestions: 0,
      validQuestions: 0,
      duplicates: 0,
      errors: 0
    },
    errors: [],
    warnings: []
  };

  if (!questions || questions.length === 0) {
    result.errors.push('No questions to preview');
    return result;
  }

  const startingQuestionNumber = getNextQuestionNumber(existingQuestions);
  
  questions.forEach((question, index) => {
    const questionNumber = startingQuestionNumber + index;
    const generatedId = generateQuestionIdPreview(courseId, itemNumber, questionNumber, question.title);
    
    const previewItem = {
      originalIndex: index,
      title: question.title,
      points: question.points,
      questionId: generatedId,
      status: 'valid',
      errors: [],
      warnings: []
    };

    // Validate question ID
    const idValidation = validateQuestionId(generatedId, existingQuestions);
    if (!idValidation.isValid) {
      previewItem.status = 'error';
      previewItem.errors = idValidation.errors;
      result.summary.errors++;
    }

    // Check for duplicate titles
    const duplicateTitle = existingQuestions.find(q => 
      q.title.toLowerCase().trim() === question.title.toLowerCase().trim()
    );
    if (duplicateTitle) {
      previewItem.warnings.push('Similar title already exists');
      result.summary.duplicates++;
    }

    // Check for duplicate within import batch
    const batchDuplicate = questions.slice(0, index).find(q => 
      q.title.toLowerCase().trim() === question.title.toLowerCase().trim()
    );
    if (batchDuplicate) {
      previewItem.warnings.push('Duplicate title within import batch');
    }

    result.previewItems.push(previewItem);
    
    if (previewItem.status === 'valid') {
      result.summary.validQuestions++;
    }
  });

  result.summary.totalQuestions = questions.length;
  result.success = result.summary.validQuestions > 0;

  return result;
};

/**
 * Detect duplicates between new and existing questions
 */
export const detectDuplicates = (newQuestions, existingQuestions = []) => {
  const duplicates = [];
  
  newQuestions.forEach((newQ, index) => {
    // Check title duplicates
    const titleMatch = existingQuestions.find(existingQ => 
      existingQ.title.toLowerCase().trim() === newQ.title.toLowerCase().trim()
    );
    
    if (titleMatch) {
      duplicates.push({
        type: 'title',
        newQuestion: { ...newQ, importIndex: index },
        existingQuestion: titleMatch,
        suggestion: 'rename'
      });
    }
  });

  return duplicates;
};

/**
 * Convert preview items to final question objects
 */
export const finalizeImportQuestions = (previewItems) => {
  return previewItems
    .filter(item => item.status === 'valid')
    .map(item => ({
      title: item.title.trim(),
      points: item.points,
      questionId: item.questionId
    }));
};

/**
 * Validate file for question import
 */
export const validateImportFile = (file) => {
  const errors = [];
  
  if (!file) {
    errors.push('No file selected');
    return { isValid: false, errors };
  }
  
  // Check file type
  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    errors.push('File must be a JSON file (.json)');
  }
  
  // Check file size (limit to 1MB)
  if (file.size > 1024 * 1024) {
    errors.push('File is too large (max 1MB)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Read file content as text
 */
export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    reader.readAsText(file);
  });
};

/**
 * Generate import summary text
 */
export const generateImportSummary = (preview) => {
  const { summary } = preview;
  const parts = [];
  
  parts.push(`${summary.totalQuestions} question${summary.totalQuestions !== 1 ? 's' : ''} found`);
  
  if (summary.validQuestions < summary.totalQuestions) {
    parts.push(`${summary.validQuestions} valid`);
  }
  
  if (summary.duplicates > 0) {
    parts.push(`${summary.duplicates} duplicate${summary.duplicates !== 1 ? 's' : ''}`);
  }
  
  if (summary.errors > 0) {
    parts.push(`${summary.errors} error${summary.errors !== 1 ? 's' : ''}`);
  }
  
  return parts.join(', ');
};