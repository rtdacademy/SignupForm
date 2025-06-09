/**
 * Export assessment components
 *
 * This file exports all available assessment components that can be used in course content.
 * New question types should be added here and properly exported.
 */
import MultipleChoiceQuestion from './MultipleChoiceQuestion/index';
import DynamicQuestion from './DynamicQuestion/index';
import AIMultipleChoiceQuestion from './AIMultipleChoiceQuestion/index';
import AILongAnswerQuestion from './AILongAnswerQuestion/index';
import AIShortAnswerQuestion from './AIShortAnswerQuestion/index';
import StandardMultipleChoiceQuestion from './StandardMultipleChoiceQuestion/index';

export {
  MultipleChoiceQuestion,
  DynamicQuestion,
  AIMultipleChoiceQuestion,
  AILongAnswerQuestion,
  AIShortAnswerQuestion,
  StandardMultipleChoiceQuestion,
};