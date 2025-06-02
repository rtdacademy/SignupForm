const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

/**
 * Firebase Function to load course code files from Storage
 * This bypasses CORS issues by serving files through a Cloud Function
 */
exports.loadCourseCode = onCall(async (request) => {
  const { courseId, lessonPath, fileName } = request.data;
  
  // Validate input
  if (!courseId || !lessonPath || !fileName) {
    throw new Error('Missing required parameters: courseId, lessonPath, fileName');
  }
  
  // Validate user is authenticated
  if (!request.auth) {
    throw new Error('User must be authenticated to load course code');
  }
  
  try {
    // Get the file from Firebase Storage
    const bucket = admin.storage().bucket();
    const filePath = `courseDevelopment/${courseId}/${lessonPath}/${fileName}`;
    const file = bucket.file(filePath);
    
    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      throw new Error(`Code file not found: ${filePath}`);
    }
    
    // Download file contents
    const [contents] = await file.download();
    const codeString = contents.toString('utf8');
    
    console.log(`Successfully loaded course code: ${filePath}`);
    
    return {
      success: true,
      code: codeString,
      filePath: filePath
    };
    
  } catch (error) {
    console.error('Error loading course code:', error);
    throw new Error(`Failed to load course code: ${error.message}`);
  }
});