// Export annotation components for easy importing
export { default as AnnotationCanvas } from './AnnotationCanvas';
export { default as AnnotationToolbar } from './AnnotationToolbar';
export { default as SimpleAnnotationCanvas } from './SimpleAnnotationCanvas';

// Export teacher comment components
export { default as TeacherCommentArea } from '../TeacherCommentArea';
export { 
  default as QuickTeacherComment,
  DataCollectionComment,
  CalculationComment, 
  ConclusionComment,
  GeneralComment
} from '../QuickTeacherComment';