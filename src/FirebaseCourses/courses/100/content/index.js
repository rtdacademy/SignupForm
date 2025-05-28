import { lazy } from 'react';

/**
 * Content Registry for 100 Course
 * 
 * This registry maps content folder names to their React components.
 * The folder names (01-getting-started, etc.) are used to maintain order
 * and to generate cloud function names following the convention:
 * COURSEID_FOLDERNAME_FUNCTIONTYPE
 * 
 * For example:
 * - Folder: 01-getting-started
 * - Function: course100_01_getting_started_aiQuestion
 */
const contentRegistry = {
  // The key must match the folder name exactly
  '01-getting-started': lazy(() => import('./01-getting-started')),
  '02-core-concepts': lazy(() => import('./02-core-concepts')),
  '03-advanced-topic-1': lazy(() => import('./03-advanced-topic-1')),
  '04-reflection-assignment': lazy(() => import('./04-reflection-assignment')),
  '05-midterm-exam': lazy(() => import('./05-midterm-exam')),
};

// Helper function to generate cloud function names based on conventions
export const getCloudFunctionName = (courseId, folderName, functionType) => {
  // Replace hyphens with underscores for valid function names
  const safeFolderName = folderName.replace(/-/g, '_');
  return `${courseId}_${safeFolderName}_${functionType}`;
};

// Helper function to check if content exists
export const contentExists = (folderName) => {
  return folderName in contentRegistry;
};

// Helper function to get ordered content list
export const getOrderedContent = () => {
  return Object.keys(contentRegistry).sort();
};

export default contentRegistry;