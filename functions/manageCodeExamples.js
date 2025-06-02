const { onCall } = require('firebase-functions/v2/https');
const { logger } = require('firebase-functions');
const { getDatabase } = require('firebase-admin/database');

exports.manageCodeExamples = onCall({
  maxInstances: 10,
  timeoutSeconds: 60,
  memory: '256MB',
  region: 'us-central1'
}, async (request) => {
  try {
    const { action, exampleId, categoryId, exampleData } = request.data;
    const db = getDatabase();
    const examplesRef = db.ref('codeExamples');

    // Log the action for debugging
    logger.info('manageCodeExamples called', { action, exampleId, categoryId });

    switch (action) {
      case 'loadAll':
        // Load all examples grouped by category
        const snapshot = await examplesRef.get();
        return {
          success: true,
          examples: snapshot.exists() ? snapshot.val() : {}
        };

      case 'loadCategory':
        // Load examples from specific category
        if (!categoryId) {
          throw new Error('Category ID is required for loadCategory action');
        }
        const categorySnapshot = await examplesRef.child(categoryId).get();
        return {
          success: true,
          examples: categorySnapshot.exists() ? categorySnapshot.val() : {}
        };

      case 'create':
        // Create new example
        if (!categoryId || !exampleId || !exampleData) {
          throw new Error('Category ID, example ID, and example data are required for create action');
        }
        const newRef = examplesRef.child(categoryId).child(exampleId);
        await newRef.set({
          ...exampleData,
          id: exampleId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: request.auth?.uid || 'system'
        });
        return { success: true, message: 'Example created successfully' };

      case 'update':
        // Update existing example
        if (!categoryId || !exampleId || !exampleData) {
          throw new Error('Category ID, example ID, and example data are required for update action');
        }
        const updateRef = examplesRef.child(categoryId).child(exampleId);
        
        // Check if example exists
        const existingSnapshot = await updateRef.get();
        if (!existingSnapshot.exists()) {
          throw new Error('Example not found');
        }
        
        await updateRef.update({
          ...exampleData,
          updatedAt: new Date().toISOString(),
          updatedBy: request.auth?.uid || 'system'
        });
        return { success: true, message: 'Example updated successfully' };

      case 'delete':
        // Delete example
        if (!categoryId || !exampleId) {
          throw new Error('Category ID and example ID are required for delete action');
        }
        await examplesRef.child(categoryId).child(exampleId).remove();
        return { success: true, message: 'Example deleted successfully' };

      case 'search':
        // Search examples by tags or title
        const { searchTerm } = request.data;
        if (!searchTerm) {
          throw new Error('Search term is required for search action');
        }
        
        const allExamplesSnapshot = await examplesRef.get();
        if (!allExamplesSnapshot.exists()) {
          return { success: true, examples: {} };
        }
        
        const allExamples = allExamplesSnapshot.val();
        const searchResults = {};
        const searchLower = searchTerm.toLowerCase();
        
        // Search through all categories and examples
        Object.keys(allExamples).forEach(catId => {
          const categoryExamples = allExamples[catId] || {};
          const matchingExamples = {};
          
          Object.keys(categoryExamples).forEach(exId => {
            const example = categoryExamples[exId];
            if (
              example.title?.toLowerCase().includes(searchLower) ||
              example.description?.toLowerCase().includes(searchLower) ||
              example.tags?.some(tag => tag.toLowerCase().includes(searchLower))
            ) {
              matchingExamples[exId] = example;
            }
          });
          
          if (Object.keys(matchingExamples).length > 0) {
            searchResults[catId] = matchingExamples;
          }
        });
        
        return { success: true, examples: searchResults };

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    logger.error('Error in manageCodeExamples:', error);
    return { 
      success: false, 
      error: error.message,
      code: error.code || 'internal-error'
    };
  }
});