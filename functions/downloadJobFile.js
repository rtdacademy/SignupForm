const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Helper to get timestamp that works in emulator and production
const getTimestamp = () => {
  try {
    return admin.database.ServerValue.TIMESTAMP;
  } catch (error) {
    return Date.now();
  }
};

// Cloud function to download individual job files (CSV, metadata, or specific PDFs)
const downloadJobFile = onCall({
  region: 'us-central1',
  memory: '512MiB',
  timeoutSeconds: 60,
  maxInstances: 10
}, async (request) => {
  const { jobId, fileType, fileName } = request.data;
  const userId = request.auth?.uid;
  const userEmail = request.auth?.token?.email;
  
  if (!userId) {
    throw new Error('Authentication required');
  }
  
  if (!jobId) {
    throw new Error('Job ID is required');
  }
  
  if (!fileType || !['csv', 'metadata', 'pdf'].includes(fileType)) {
    throw new Error('Valid file type is required (csv, metadata, or pdf)');
  }
  
  console.log(`Download request for ${fileType} file from job ${jobId} by ${userEmail}`);
  
  const db = admin.database();
  const storage = admin.storage().bucket();
  
  try {
    // Get job details
    const jobSnapshot = await db.ref(`pdfGenerationJobs/${jobId}`).once('value');
    const jobData = jobSnapshot.val();
    
    if (!jobData) {
      throw new Error('Job not found');
    }
    
    if (jobData.status !== 'completed') {
      throw new Error('Job is not completed yet');
    }
    
    let filePath;
    let downloadFileName;
    
    switch (fileType) {
      case 'csv':
        if (!jobData.csvDownloadUrl) {
          throw new Error('CSV file not available for this job');
        }
        filePath = jobData.csvDownloadUrl.filePath;
        downloadFileName = jobData.csvDownloadUrl.fileName;
        break;
        
      case 'metadata':
        if (!jobData.metadataPath) {
          throw new Error('Metadata file not available for this job');
        }
        filePath = jobData.metadataPath;
        downloadFileName = `batch_metadata_${jobId}.json`;
        break;
        
      case 'pdf':
        if (!fileName) {
          throw new Error('PDF filename is required');
        }
        const pdfItem = jobData.downloadUrls?.find(item => item.fileName === fileName);
        if (!pdfItem) {
          throw new Error('PDF file not found');
        }
        const sanitizedSchoolYear = jobData.config?.schoolYear?.replace(/\//g, '_') || 'unknown';
        filePath = `registrationDocuments/${sanitizedSchoolYear}/pdfs/${fileName}`;
        downloadFileName = fileName;
        break;
        
      default:
        throw new Error('Invalid file type');
    }
    
    // Check if file exists
    const file = storage.file(filePath);
    const [exists] = await file.exists();
    
    if (!exists) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    // Log download activity
    await db.ref('downloadActivity').push({
      jobId: jobId,
      downloadedBy: userEmail,
      downloadedAt: getTimestamp(),
      fileType: fileType,
      fileName: downloadFileName,
      downloadType: 'individual'
    });
    
    console.log(`Individual file download prepared: ${downloadFileName}`);
    
    // Return file path for frontend to handle with Firebase Storage SDK
    return {
      success: true,
      filePath: filePath,
      fileName: downloadFileName,
      fileType: fileType
    };
    
  } catch (error) {
    console.error(`Error preparing ${fileType} download:`, error);
    throw new Error(`Failed to prepare ${fileType} download: ${error.message}`);
  }
});

module.exports = { downloadJobFile };