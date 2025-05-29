/**
 * Assessment Schemas
 * Zod schemas for validating and structuring assessment data across all types
 */

const { z } = require('zod');

//==============================================================================
// Multiple Choice Schemas
//==============================================================================

// Define the schema for an individual answer option
const AnswerOptionSchema = z.object({
  id: z.enum(['a', 'b', 'c', 'd']).describe('Unique identifier for this option'),
  text: z.string().describe('The text of this answer option'),
  feedback: z.string().describe('Feedback to show if this option is selected'),
});

// Define the schema for the complete AI-generated question
const AIQuestionSchema = z.object({
  questionText: z.string().describe('The text of the multiple-choice question'),
  options: z.array(AnswerOptionSchema)
    .length(4)
    .describe('Exactly four answer options for the question'),
  correctOptionId: z.enum(['a', 'b', 'c', 'd'])
    .describe('The ID of the correct answer option'),
  explanation: z.string()
    .describe('A detailed explanation of why the correct answer is right and the others are wrong'),
});

// Schema for fallback questions stored in course files
const FallbackQuestionSchema = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  questionText: z.string(),
  options: z.array(AnswerOptionSchema).length(4),
  correctOptionId: z.enum(['a', 'b', 'c', 'd']),
  explanation: z.string(),
});

//==============================================================================
// Assessment Configuration Schemas
//==============================================================================

// Schema for AI generation settings
const AISettingsSchema = z.object({
  temperature: z.number().min(0).max(2).optional().default(0.7),
  topP: z.number().min(0).max(1).optional().default(0.8),
  topK: z.number().min(1).max(100).optional().default(40),
});

// Schema for prompt templates
const PromptTemplatesSchema = z.object({
  beginner: z.string().optional(),
  intermediate: z.string().optional(),
  advanced: z.string().optional(),
});

// Schema for assessment configuration
const AssessmentConfigSchema = z.object({
  maxAttempts: z.number().min(1).optional().default(9999),
  pointsValue: z.number().min(0).optional().default(2),
  showFeedback: z.boolean().optional().default(true),
  timeout: z.number().min(30).max(540).optional().default(60),
  memory: z.string().optional().default('512MiB'),
  region: z.string().optional().default('us-central1'),
  aiSettings: AISettingsSchema.optional(),
  prompts: PromptTemplatesSchema.optional(),
  fallbackQuestions: z.array(FallbackQuestionSchema).optional().default([]),
});

//==============================================================================
// Database Record Schemas
//==============================================================================

// Schema for student assessment records
const StudentAssessmentSchema = z.object({
  timestamp: z.any(), // ServerValue.TIMESTAMP or number
  questionText: z.string(),
  options: z.array(z.object({
    id: z.enum(['a', 'b', 'c', 'd']),
    text: z.string(),
  })),
  topic: z.string(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  generatedBy: z.enum(['ai', 'fallback', 'placeholder']),
  attempts: z.number().min(0),
  status: z.enum(['active', 'attempted', 'completed', 'failed']),
  maxAttempts: z.number().min(1),
  pointsValue: z.number().min(0),
  correctOverall: z.boolean().optional().default(false),
  settings: z.object({
    showFeedback: z.boolean(),
  }),
  lastSubmission: z.object({
    timestamp: z.any(),
    answer: z.enum(['a', 'b', 'c', 'd']),
    isCorrect: z.boolean(),
    feedback: z.string(),
    correctOptionId: z.enum(['a', 'b', 'c', 'd']),
  }).optional(),
});

// Schema for secure assessment data (server-side only)
const SecureAssessmentSchema = z.object({
  correctOptionId: z.enum(['a', 'b', 'c', 'd']),
  explanation: z.string(),
  optionFeedback: z.record(z.enum(['a', 'b', 'c', 'd']), z.string()),
  timestamp: z.any(),
  isRegenerated: z.boolean().optional(),
});

// Schema for submission records
const SubmissionSchema = z.object({
  timestamp: z.any(),
  answer: z.enum(['a', 'b', 'c', 'd']),
  isCorrect: z.boolean(),
  attemptNumber: z.number().min(1),
});

//==============================================================================
// Function Parameter Schemas
//==============================================================================

// Schema for validating function call parameters
const FunctionParametersSchema = z.object({
  courseId: z.string().min(1),
  assessmentId: z.string().min(1),
  operation: z.enum(['generate', 'evaluate']),
  answer: z.enum(['a', 'b', 'c', 'd']).optional(),
  studentEmail: z.string().email().optional(),
  userId: z.string().optional(),
  topic: z.string().optional().default('general'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional().default('intermediate'),
});

//==============================================================================
// Response Schemas
//==============================================================================

// Schema for generation response
const GenerationResponseSchema = z.object({
  success: z.boolean(),
  questionGenerated: z.boolean(),
  assessmentId: z.string(),
  generatedBy: z.enum(['ai', 'fallback', 'placeholder']),
});

// Schema for evaluation response
const EvaluationResponseSchema = z.object({
  success: z.boolean(),
  result: z.object({
    isCorrect: z.boolean(),
    correctOptionId: z.enum(['a', 'b', 'c', 'd']),
    feedback: z.string(),
    explanation: z.string(),
  }),
  attemptsRemaining: z.number().min(0),
  attemptsMade: z.number().min(1),
});

// Schema for error response
const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  attemptsRemaining: z.number().min(0).optional(),
});

//==============================================================================
// Long Answer Schemas
//==============================================================================

// Schema for a rubric criterion
const RubricCriterionSchema = z.object({
  criterion: z.string().describe('The name/title of this scoring criterion'),
  points: z.number().min(0).describe('Maximum points for this criterion'),
  description: z.string().describe('Detailed description of what is expected to earn full points'),
});

// Schema for AI-generated long answer question
const AILongAnswerQuestionSchema = z.object({
  questionText: z.string().describe('The long answer question prompt'),
  rubric: z.array(RubricCriterionSchema)
    .min(1)
    .max(6)
    .describe('Scoring rubric with 1-6 criteria'),
  maxPoints: z.number().min(1).describe('Total maximum points (sum of all rubric criteria)'),
  wordLimit: z.object({
    min: z.number().min(10).optional().describe('Minimum word count'),
    max: z.number().min(50).describe('Maximum word count'),
  }).describe('Word count limits for the answer'),
  sampleAnswer: z.string().describe('A high-quality sample answer that would earn full points'),
  hints: z.array(z.string()).optional().describe('Optional hints to help students'),
});

// Schema for rubric score per criterion
const RubricScoreSchema = z.object({
  criterion: z.string().describe('The criterion being scored'),
  score: z.number().min(0).describe('Points earned for this criterion'),
  maxPoints: z.number().min(0).describe('Maximum possible points for this criterion'),
  feedback: z.string().describe('Specific feedback for this criterion'),
});

// Schema for AI evaluation of long answer
const AILongAnswerEvaluationSchema = z.object({
  totalScore: z.number().min(0).describe('Total points earned'),
  maxScore: z.number().min(1).describe('Maximum possible points'),
  percentage: z.number().min(0).max(100).describe('Score as a percentage'),
  overallFeedback: z.string().describe('Overall feedback on the answer'),
  rubricScores: z.array(RubricScoreSchema).describe('Detailed scores per criterion'),
  strengths: z.array(z.string()).optional().describe('Key strengths in the answer'),
  improvements: z.array(z.string()).optional().describe('Suggested improvements'),
  suggestions: z.string().optional().describe('Specific suggestions for improvement'),
});

// Schema for long answer student assessment record
const StudentLongAnswerAssessmentSchema = z.object({
  timestamp: z.any(),
  questionText: z.string(),
  rubric: z.array(RubricCriterionSchema),
  maxPoints: z.number().min(1),
  wordLimit: z.object({
    min: z.number().optional(),
    max: z.number(),
  }),
  topic: z.string(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  generatedBy: z.enum(['ai', 'fallback', 'manual']),
  attempts: z.number().min(0),
  status: z.enum(['active', 'attempted', 'completed', 'failed']),
  maxAttempts: z.number().min(1),
  activityType: z.string(),
  enableAIChat: z.boolean().optional(),
  aiChatContext: z.string().optional(),
  settings: z.object({
    showRubric: z.boolean().default(true),
    showWordCount: z.boolean().default(true),
    showHints: z.boolean().default(false),
    allowDifficultySelection: z.boolean().default(false),
    theme: z.string().default('purple'),
  }),
  lastSubmission: z.object({
    timestamp: z.any(),
    answer: z.string(),
    wordCount: z.number(),
    evaluation: AILongAnswerEvaluationSchema,
  }).optional(),
});

// Schema for secure long answer data (server-side only)
const SecureLongAnswerAssessmentSchema = z.object({
  sampleAnswer: z.string(),
  hints: z.array(z.string()).optional(),
  timestamp: z.any(),
});

// Schema for long answer submission
const LongAnswerSubmissionSchema = z.object({
  timestamp: z.any(),
  answer: z.string(),
  wordCount: z.number(),
  evaluation: AILongAnswerEvaluationSchema,
  attemptNumber: z.number().min(1),
});

// Schema for long answer function parameters
const LongAnswerFunctionParametersSchema = z.object({
  courseId: z.string().min(1),
  assessmentId: z.string().min(1),
  operation: z.enum(['generate', 'evaluate']),
  answer: z.string().optional(),
  studentEmail: z.string().email().optional(),
  userId: z.string().optional(),
  topic: z.string().optional().default('general'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional().default('intermediate'),
});

// Schema for long answer evaluation response
const LongAnswerEvaluationResponseSchema = z.object({
  success: z.boolean(),
  result: AILongAnswerEvaluationSchema,
  attemptsRemaining: z.number().min(0),
  attemptsMade: z.number().min(1),
});

module.exports = {
  // Multiple Choice Schemas
  AnswerOptionSchema,
  AIQuestionSchema,
  FallbackQuestionSchema,
  
  // Long Answer Schemas
  RubricCriterionSchema,
  AILongAnswerQuestionSchema,
  RubricScoreSchema,
  AILongAnswerEvaluationSchema,
  StudentLongAnswerAssessmentSchema,
  SecureLongAnswerAssessmentSchema,
  LongAnswerSubmissionSchema,
  LongAnswerFunctionParametersSchema,
  LongAnswerEvaluationResponseSchema,
  
  // Configuration Schemas
  AISettingsSchema,
  PromptTemplatesSchema,
  AssessmentConfigSchema,
  
  // Database Schemas
  StudentAssessmentSchema,
  SecureAssessmentSchema,
  SubmissionSchema,
  
  // Function Schemas
  FunctionParametersSchema,
  
  // Response Schemas
  GenerationResponseSchema,
  EvaluationResponseSchema,
  ErrorResponseSchema,
};