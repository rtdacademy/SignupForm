const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const archiver = require('archiver');
const { Readable } = require('stream');

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

// Cloud function to create and download ZIP of registration PDFs
const downloadRegistrationPDFs = onCall({
  region: 'us-central1',
  memory: '1GiB',
  timeoutSeconds: 300, // 5 minutes
  maxInstances: 5
}, async (request) => {
  const { jobId, selectedAsns = [] } = request.data;
  const userId = request.auth?.uid;
  const userEmail = request.auth?.token?.email;
  
  if (!userId) {
    throw new Error('Authentication required');
  }
  
  if (!jobId) {
    throw new Error('Job ID is required');
  }
  
  console.log(`Creating ZIP download for job ${jobId} by ${userEmail}`);
  
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
    
    if (!jobData.downloadUrls || jobData.downloadUrls.length === 0) {
      throw new Error('No PDFs available for download');
    }
    
    // Filter URLs based on selected ASNs (if provided)
    let urlsToDownload = jobData.downloadUrls;
    if (selectedAsns.length > 0) {
      urlsToDownload = jobData.downloadUrls.filter(item => selectedAsns.includes(item.asn));
    }
    
    if (urlsToDownload.length === 0) {
      throw new Error('No PDFs match the selected criteria');
    }
    
    // Create ZIP file in memory
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });
    
    // Create chunks to store ZIP data
    const chunks = [];
    archive.on('data', chunk => chunks.push(chunk));
    
    // Handle archive completion
    const archivePromise = new Promise((resolve, reject) => {
      archive.on('end', () => {
        const zipBuffer = Buffer.concat(chunks);
        resolve(zipBuffer);
      });
      archive.on('error', reject);
    });
    
    // Add each PDF to the ZIP
    for (const item of urlsToDownload) {
      try {
        // Extract file path from storage structure with organized folders
        const sanitizedSchoolYear = jobData.config?.schoolYear?.replace(/\//g, '_') || 'unknown';
        const filePath = `registrationDocuments/${sanitizedSchoolYear}/pdfs/${item.fileName}`;
        
        // Get file from storage
        const file = storage.file(filePath);
        const [exists] = await file.exists();
        
        if (!exists) {
          console.warn(`File not found: ${filePath}`);
          continue;
        }
        
        // Download file content
        const [fileBuffer] = await file.download();
        
        // Add to ZIP with organized folder structure
        const folderName = `Registration_PDFs_${sanitizedSchoolYear}`;
        archive.append(fileBuffer, { name: `${folderName}/${item.fileName}` });
        
      } catch (fileError) {
        console.error(`Error processing file ${item.fileName}:`, fileError);
        // Continue with other files
      }
    }

    // Add CSV file to ZIP if available
    if (jobData.csvDownloadUrl) {
      try {
        const csvFile = storage.file(jobData.csvDownloadUrl.filePath);
        const [csvExists] = await csvFile.exists();
        
        if (csvExists) {
          const [csvBuffer] = await csvFile.download();
          const sanitizedSchoolYear = jobData.config?.schoolYear?.replace(/\//g, '_') || 'unknown';
          const folderName = `Registration_PDFs_${sanitizedSchoolYear}`;
          
          // Add CSV to the root of the ZIP folder
          archive.append(csvBuffer, { name: `${folderName}/${jobData.csvDownloadUrl.fileName}` });
          console.log(`Added CSV file to ZIP: ${jobData.csvDownloadUrl.fileName}`);
        } else {
          console.warn(`CSV file not found: ${jobData.csvDownloadUrl.filePath}`);
        }
      } catch (csvError) {
        console.error('Error adding CSV to ZIP:', csvError);
        // Continue without CSV - don't fail the whole ZIP
      }
    }
    
    // Finalize the archive
    archive.finalize();
    
    // Wait for ZIP creation to complete
    const zipBuffer = await archivePromise;
    
    // Generate ZIP filename
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const sanitizedSchoolYear = jobData.config?.schoolYear?.replace(/\//g, '_') || 'unknown';
    const zipFileName = `Registration_PDFs_${sanitizedSchoolYear}_${timestamp}.zip`;
    const zipFilePath = `registrationDocuments/${sanitizedSchoolYear}/downloads/${zipFileName}`;
    
    // Upload ZIP to storage
    const zipFile = storage.file(zipFilePath);
    await zipFile.save(zipBuffer, {
      metadata: {
        contentType: 'application/zip',
        metadata: {
          originalJobId: jobId,
          createdBy: userEmail,
          createdAt: new Date().toISOString(),
          fileCount: urlsToDownload.length,
          downloadType: selectedAsns.length > 0 ? 'selected' : 'all'
        }
      }
    });
    
    // Return the file path instead of URL - frontend will use Firebase Storage SDK
    // This ensures proper authentication and security rules enforcement
    
    // Log download activity
    await db.ref('downloadActivity').push({
      jobId: jobId,
      downloadedBy: userEmail,
      downloadedAt: getTimestamp(),
      zipFileName: zipFileName,
      fileCount: urlsToDownload.length + (jobData.csvDownloadUrl ? 1 : 0),
      pdfCount: urlsToDownload.length,
      csvIncluded: !!jobData.csvDownloadUrl,
      downloadType: selectedAsns.length > 0 ? 'selected' : 'all',
      selectedAsns: selectedAsns
    });
    
    console.log(`ZIP download created: ${zipFileName} with ${urlsToDownload.length} files`);
    
    return {
      success: true,
      filePath: zipFilePath,  // Return path instead of URL
      fileName: zipFileName,
      fileCount: urlsToDownload.length + (jobData.csvDownloadUrl ? 1 : 0),
      pdfCount: urlsToDownload.length,
      csvIncluded: !!jobData.csvDownloadUrl
    };
    
  } catch (error) {
    console.error('Error creating ZIP download:', error);
    throw new Error(`Failed to create ZIP download: ${error.message}`);
  }
});

module.exports = { downloadRegistrationPDFs };