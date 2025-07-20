const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const zlib = require('zlib');
const crypto = require('crypto');

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const uploadPasiData = onCall({
  region: 'us-central1',
  memory: '2GiB',
  timeoutSeconds: 540, // 9 minutes
  maxInstances: 10,
}, async (request) => {
  const { data, dataType, recordCount, metadata } = request.data;
  const { auth } = request;

  // Verify authentication
  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated to upload data');
  }

  // Validate input
  if (!data || !dataType || !recordCount) {
    throw new HttpsError('invalid-argument', 'Missing required fields: data, dataType, or recordCount');
  }

  const validDataTypes = ['courseRegistrations', 'schoolEnrollments', 'mergedPasiData'];
  if (!validDataTypes.includes(dataType)) {
    throw new HttpsError('invalid-argument', `Invalid dataType. Must be one of: ${validDataTypes.join(', ')}`);
  }

  const db = admin.database();
  const storage = admin.storage().bucket();
  
  try {
    console.log(`Starting ${dataType} upload for user ${auth.uid}, ${recordCount} records`);

    // Convert data to JSON string
    const jsonString = JSON.stringify(data);
    const originalSize = Buffer.byteLength(jsonString);
    console.log(`Original data size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);

    // Compress the data
    const compressedBuffer = await new Promise((resolve, reject) => {
      zlib.gzip(jsonString, { level: 9 }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    const compressedSize = compressedBuffer.length;
    const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(2);
    console.log(`Compressed size: ${(compressedSize / 1024 / 1024).toFixed(2)} MB (${compressionRatio}% reduction)`);

    // Generate file path with timestamp and unique ID
    const timestamp = Date.now();
    const date = new Date();
    const year = date.getFullYear();
    const dateString = date.toISOString().split('T')[0];
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const fileName = `${dataType}_${dateString}_${uniqueId}.json.gz`;
    const filePath = `pasiData/${dataType}/${year}/${fileName}`;

    // Upload to Cloud Storage
    const file = storage.file(filePath);
    const storageMetadata = {
      contentType: 'application/gzip',
      metadata: {
        uploadedBy: auth.token.email || auth.uid,
        uploadedByUid: auth.uid,
        dataType: dataType,
        recordCount: recordCount.toString(),
        originalSize: originalSize.toString(),
        compressedSize: compressedSize.toString(),
        compressionRatio: compressionRatio,
        timestamp: timestamp.toString(),
        uploadDate: date.toISOString()
      }
    };

    // Add additional metadata for merged data
    if (dataType === 'mergedPasiData' && metadata) {
      storageMetadata.metadata.studentCount = metadata.studentCount?.toString() || recordCount.toString();
      storageMetadata.metadata.totalCourseCount = metadata.totalCourseCount?.toString() || '0';
      storageMetadata.metadata.schoolEnrollmentCount = metadata.schoolEnrollmentCount?.toString() || '0';
      storageMetadata.metadata.originalCourseRegistrationCount = metadata.originalCourseRegistrationCount?.toString() || '0';
    }

    await file.save(compressedBuffer, storageMetadata);

    console.log(`Successfully uploaded ${dataType} to ${filePath}`);

    // Verify the file exists
    const [exists] = await file.exists();
    if (!exists) {
      throw new Error('File verification failed after upload');
    }

    // Get file metadata for storage in database
    const [metadata] = await file.getMetadata();

    // Store metadata in Realtime Database
    const metadataRecord = {
      uploadDate: date.toISOString(),
      uploadTimestamp: timestamp,
      recordCount: recordCount,
      filePath: filePath,
      fileName: fileName,
      fileSize: compressedSize,
      originalSize: originalSize,
      compressionRatio: parseFloat(compressionRatio),
      uploadedBy: auth.token.email || auth.uid,
      uploadedByUid: auth.uid,
      cloudStorageUrl: `gs://${storage.name}/${filePath}`,
      status: 'completed'
    };

    // Add additional fields for merged data
    if (dataType === 'mergedPasiData' && metadata) {
      metadataRecord.studentCount = metadata.studentCount || recordCount;
      metadataRecord.totalCourseCount = metadata.totalCourseCount || 0;
      metadataRecord.schoolEnrollmentCount = metadata.schoolEnrollmentCount || 0;
      metadataRecord.originalCourseRegistrationCount = metadata.originalCourseRegistrationCount || 0;
      metadataRecord.dataStructure = 'merged_by_asn';
    }

    // Store in both latestUpload and uploadHistory
    const updates = {};
    updates[`/pasiData/${dataType}/latestUpload`] = metadataRecord;
    updates[`/pasiData/${dataType}/uploadHistory/${timestamp}`] = metadataRecord;
    
    await db.ref().update(updates);

    console.log(`Metadata stored for ${dataType}`);

    // Return success response
    return {
      success: true,
      message: `Successfully uploaded ${recordCount} ${dataType} records`,
      filePath: filePath,
      fileSize: compressedSize,
      compressionRatio: compressionRatio,
      uploadDate: date.toISOString()
    };

  } catch (error) {
    console.error(`Error uploading ${dataType}:`, error);

    // Log error to database
    await db.ref('errorLogs/pasiDataUpload').push({
      dataType,
      recordCount,
      error: error.message,
      stack: error.stack,
      timestamp: admin.database.ServerValue.TIMESTAMP,
      userId: auth.uid
    });

    throw new HttpsError('internal', `Failed to upload ${dataType}: ${error.message}`);
  }
});

// Function to retrieve PASI data
const retrievePasiData = onCall({
  region: 'us-central1',
  memory: '2GiB',
  timeoutSeconds: 300,
}, async (request) => {
  const { dataType, filePath } = request.data;
  const { auth } = request;

  // Verify authentication
  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated to retrieve data');
  }

  const storage = admin.storage().bucket();

  try {
    let targetFilePath = filePath;

    // If no specific filePath provided, get the latest upload
    if (!filePath && dataType) {
      const db = admin.database();
      const latestSnapshot = await db.ref(`/pasiData/${dataType}/latestUpload`).once('value');
      const latestData = latestSnapshot.val();
      
      if (!latestData || !latestData.filePath) {
        throw new HttpsError('not-found', `No ${dataType} data found`);
      }
      
      targetFilePath = latestData.filePath;
    }

    if (!targetFilePath) {
      throw new HttpsError('invalid-argument', 'Either dataType or filePath must be provided');
    }

    console.log(`Retrieving PASI data from ${targetFilePath}`);

    // Download and decompress the file
    const file = storage.file(targetFilePath);
    const [exists] = await file.exists();

    if (!exists) {
      throw new HttpsError('not-found', `File not found: ${targetFilePath}`);
    }

    const [compressedBuffer] = await file.download();

    // Decompress the data
    const decompressedBuffer = await new Promise((resolve, reject) => {
      zlib.gunzip(compressedBuffer, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    const data = JSON.parse(decompressedBuffer.toString());

    console.log(`Successfully retrieved ${Array.isArray(data) ? data.length : 'unknown'} records`);

    return {
      success: true,
      data: data,
      recordCount: Array.isArray(data) ? data.length : null,
      filePath: targetFilePath
    };

  } catch (error) {
    console.error('Error retrieving PASI data:', error);
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', `Failed to retrieve data: ${error.message}`);
  }
});

// Function to retrieve specific student data from merged PASI data
const retrieveStudentPasiData = onCall({
  region: 'us-central1',
  memory: '512MB',
  timeoutSeconds: 60,
}, async (request) => {
  const { asn } = request.data;
  const { auth } = request;

  // Verify authentication
  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated to retrieve data');
  }

  if (!asn) {
    throw new HttpsError('invalid-argument', 'ASN is required');
  }

  const db = admin.database();
  const storage = admin.storage().bucket();

  try {
    // Get the latest merged data upload info
    const latestSnapshot = await db.ref('/pasiData/mergedPasiData/latestUpload').once('value');
    const latestData = latestSnapshot.val();
    
    if (!latestData || !latestData.filePath) {
      throw new HttpsError('not-found', 'No merged PASI data found');
    }

    console.log(`Retrieving student ${asn} from ${latestData.filePath}`);

    // Download and decompress the file
    const file = storage.file(latestData.filePath);
    const [exists] = await file.exists();

    if (!exists) {
      throw new HttpsError('not-found', `File not found: ${latestData.filePath}`);
    }

    const [compressedBuffer] = await file.download();

    // Decompress the data
    const decompressedBuffer = await new Promise((resolve, reject) => {
      zlib.gunzip(compressedBuffer, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    const allData = JSON.parse(decompressedBuffer.toString());
    
    // Find the specific student
    const studentData = allData[asn];
    
    if (!studentData) {
      throw new HttpsError('not-found', `No data found for ASN: ${asn}`);
    }

    console.log(`Found student ${asn} with ${studentData.courseRegistrations?.length || 0} courses`);

    return {
      success: true,
      data: studentData,
      asn: asn,
      courseCount: studentData.courseRegistrations?.length || 0,
      hasSchoolEnrollment: !!studentData.schoolEnrollment,
      uploadDate: latestData.uploadDate
    };

  } catch (error) {
    console.error('Error retrieving student PASI data:', error);
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', `Failed to retrieve student data: ${error.message}`);
  }
});

module.exports = {
  uploadPasiData,
  retrievePasiData,
  retrieveStudentPasiData
};