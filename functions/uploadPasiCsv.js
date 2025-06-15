// Import 2nd gen Firebase Functions
const { onCall } = require('firebase-functions/v2/https');

// Other dependencies
const admin = require('firebase-admin');
const { sanitizeEmail, PASI_TO_COURSE_MAP } = require('./utils');
const Papa = require('papaparse');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Course mapping is now imported from utils.js as PASI_TO_COURSE_MAP

// Required CSV fields
const REQUIRED_FIELDS = [
  'ASN', 'Work Items', ' Code', 'Student Name', ' Description', 
  'Status', 'School Enrolment', 'Value', 'Approved?', 'Assignment Date', 
  'Credits Attempted', 'Deleted?', 'Dual Enrolment?', 'Exit Date', 
  'Funding Requested?', 'Term', 'Reference #', 'Description', 'School',
  'Entry Date', 'Instructional Minutes Received', 'Partner PSI', 'Last Updated'
];

// Helper function to parse CSV using Papa Parse
const parseCSV = (csvString) => {
  const results = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: 'greedy',
    trimHeaders: true
  });

  if (results.errors.length > 0) {
    console.warn('CSV parsing warnings:', results.errors);
  }

  return {
    headers: results.meta.fields || [],
    data: results.data || []
  };
};

// Helper function to validate required fields
const validateRequiredFields = (headers) => {
  const missingFields = REQUIRED_FIELDS.filter(field => !headers.includes(field));
  return missingFields;
};

// Helper function to get course ID from PASI code
const getCourseIdFromPasiCode = (pasiCode) => {
  const code = pasiCode?.trim();
  return PASI_TO_COURSE_MAP[code] || 2000; // Default to 2000 if not found
};

// Helper function to convert school year format (e.g., "2024-2025" to "24_25")
const formatSchoolYear = (schoolYear) => {
  if (schoolYear.includes('-')) {
    // Convert "2024-2025" to "24_25"
    const [start, end] = schoolYear.split('-');
    return `${start.slice(-2)}_${end.slice(-2)}`;
  }
  // Return as-is if already in correct format
  return schoolYear;
};

/**
 * Cloud Function: uploadPasiCsvV2
 * Processes PASI CSV uploads and stores records in new structure
 */
const uploadPasiCsvV2 = onCall({
  memory: '2GiB',
  timeoutSeconds: 540,
  concurrency: 500,
  cors: [
    "https://yourway.rtdacademy.com", 
    "https://*.rtdacademy.com", 
    "http://localhost:3000", 
    "https://3000-idx-yourway-1744540653512.cluster-76blnmxvvzdpat4inoxk5tmzik.cloudworkstations.dev"
  ],
}, async (data) => {
  // Authentication check
  if (!data.auth) {
    throw new Error('User must be authenticated.');
  }

  const userEmail = data.auth.token.email;
  
  // Permission check - only staff can upload
  if (!userEmail.endsWith('@rtdacademy.com')) {
    throw new Error('Only RTD Academy staff members can upload PASI data.');
  }

  // Input validation
  const { csvContent, schoolYear } = data.data;
  
  if (!csvContent) {
    throw new Error('CSV content is required.');
  }
  
  if (!schoolYear) {
    throw new Error('School year is required.');
  }

  const db = admin.database();
  const uploadId = db.ref('pasiUploads').push().key;
  const uploadRef = db.ref(`pasiUploads/${uploadId}`);
  
  try {
    // Format school year for database storage
    const formattedSchoolYear = formatSchoolYear(schoolYear);
    
    console.log(`Processing PASI CSV upload for school year ${schoolYear} (formatted: ${formattedSchoolYear}) by ${userEmail}`);
    
    // Initialize upload status
    await uploadRef.set({
      status: 'processing',
      schoolYear,
      formattedSchoolYear,
      uploadedBy: userEmail,
      startTime: Date.now(),
      recordCount: 0,
      processedCount: 0,
      errors: []
    });

    // Decode base64 CSV content
    const csvString = Buffer.from(csvContent, 'base64').toString('utf-8');
    
    // Parse CSV
    const { headers, data } = parseCSV(csvString);
    
    // Debug: Log the actual headers found
    console.log('CSV Headers found:', headers);
    console.log('Required fields:', REQUIRED_FIELDS);
    
    // Validate required fields
    const missingFields = validateRequiredFields(headers);
    if (missingFields.length > 0) {
      console.error('Missing fields. Found headers:', headers);
      console.error('Missing required fields:', missingFields);
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Update record count
    await uploadRef.update({
      recordCount: data.length
    });

    // Get ASN email mappings
    const asnSnapshot = await db.ref('ASNs').once('value');
    const asnEmailMap = asnSnapshot.val() || {};

    // Process records
    const processedRecords = {};
    const errors = [];
    
    data.forEach((row, index) => {
      try {
        // Extract and clean fields
        const asn = row['ASN']?.trim();
        const courseCode = row[' Code']?.trim();
        const period = row['Value']?.trim() || 'Unknown';
        const grade = row['Value']?.trim() || '';
        const term = row['Term']?.trim() || 'Unknown';
        
        if (!asn) {
          errors.push({
            row: index + 2,
            error: 'Missing ASN'
          });
          return;
        }

        // Generate unique key for this record using referenceNumber instead of period
        const referenceNumber = row['Reference #']?.trim() || 'NoRef';
        const recordKey = `${asn}_${courseCode}_${referenceNumber}_${term}`;
        
        // Get student key from ASN mapping
        const studentKeyMapping = asnEmailMap[asn] || asnEmailMap[`${asn.substring(0, 4)}-${asn.substring(4)}`] || null;
        
        // Extract first student key if provided as object (for backwards compatibility)
        let studentKey = null;
        let availableStudentKeys = [];
        
        if (studentKeyMapping) {
          if (typeof studentKeyMapping === 'string') {
            // Simple string format
            studentKey = studentKeyMapping;
            availableStudentKeys = [studentKeyMapping];
          } else if (typeof studentKeyMapping === 'object' && studentKeyMapping.emailKeys) {
            // Object with emailKeys format
            availableStudentKeys = Object.keys(studentKeyMapping.emailKeys);
            studentKey = availableStudentKeys.length > 0 ? availableStudentKeys[0] : null;
          }
        }
        
        // Create record object
        const record = {
          // Core fields
          asn,
          studentKey: studentKey || '', // Primary student key (empty string if none)
          studentKeys: availableStudentKeys, // Array of all available student keys
          hasStudentKey: !!studentKey, // Boolean flag for easy filtering
          courseCode,
          courseDescription: row[' Description']?.trim() || '',
          studentName: row['Student Name']?.trim() || '',
          status: row['Status']?.trim() || '',
          period,
          grade,
          term,
          schoolYear: formattedSchoolYear,
          
          // Additional fields
          schoolEnrolment: row['School Enrolment']?.trim() || '',
          approved: row['Approved?']?.trim() || '',
          assignmentDate: row['Assignment Date']?.trim() || '',
          creditsAttempted: row['Credits Attempted']?.trim() || '',
          deleted: row['Deleted?']?.trim() || '',
          dualEnrolment: row['Dual Enrolment?']?.trim() || '',
          exitDate: row['Exit Date']?.trim() || '',
          fundingRequested: row['Funding Requested?']?.trim() || '',
          referenceNumber,
          workItems: row['Work Items']?.trim() || '',
          
          // New fields
          description: row['Description']?.trim() || '', // Without leading space
          school: row['School']?.trim() || '',
          entryDate: row['Entry Date']?.trim() || '',
          instructionalMinutesReceived: row['Instructional Minutes Received']?.trim() || '',
          partnerPSI: row['Partner PSI']?.trim() || '',
          lastUpdated: row['Last Updated']?.trim() || '',
          
          // Metadata
          uploadId,
          uploadedAt: Date.now(),
          uploadedBy: userEmail,
          
          // Computed fields
          courseId: getCourseIdFromPasiCode(courseCode),
          id: recordKey
        };
        
        // Store record
        processedRecords[recordKey] = record;
        
      } catch (error) {
        errors.push({
          row: index + 2,
          error: error.message
        });
      }
    });

    // Batch size for Firebase operations
    const BATCH_SIZE = 500;
    const recordEntries = Object.entries(processedRecords);
    let processedCount = 0;

    // Delete existing records for this school year first (both old and new formats)
    console.log(`Deleting existing records for school year ${formattedSchoolYear}`);
    await db.ref(`pasiRecordsNew/${formattedSchoolYear}`).remove();
    
    // Also delete old format if it exists (e.g., "2024-2025")
    if (schoolYear !== formattedSchoolYear) {
      console.log(`Also deleting old format records for ${schoolYear}`);
      await db.ref(`pasiRecordsNew/${schoolYear}`).remove();
    }

    // Process records in batches
    for (let i = 0; i < recordEntries.length; i += BATCH_SIZE) {
      const batch = recordEntries.slice(i, i + BATCH_SIZE);
      const updates = {};
      
      batch.forEach(([key, record]) => {
        updates[`pasiRecordsNew/${formattedSchoolYear}/${key}`] = record;
      });
      
      // Apply batch updates
      await db.ref().update(updates);
      
      processedCount += batch.length;
      
      // Update progress
      await uploadRef.update({
        processedCount,
        progress: Math.round((processedCount / recordEntries.length) * 100)
      });
      
      console.log(`Processed ${processedCount}/${recordEntries.length} records`);
    }

    // Update final status
    await uploadRef.update({
      status: 'completed',
      endTime: Date.now(),
      processedCount: recordEntries.length,
      errorCount: errors.length,
      errors: errors.slice(0, 100), // Limit errors to first 100
      progress: 100
    });

    console.log(`Upload completed: ${recordEntries.length} records processed, ${errors.length} errors`);

    return {
      success: true,
      uploadId,
      schoolYear,
      formattedSchoolYear,
      totalRecords: data.length,
      processedRecords: recordEntries.length,
      errors: errors.length,
      errorDetails: errors.slice(0, 10), // Return first 10 errors
      message: `Successfully processed ${recordEntries.length} records for school year ${schoolYear} (stored as ${formattedSchoolYear})`
    };

  } catch (error) {
    console.error('Error in uploadPasiCsvV2:', error);
    
    // Update upload status to failed
    await uploadRef.update({
      status: 'failed',
      endTime: Date.now(),
      error: error.message
    });
    
    throw new Error(`Failed to process PASI CSV: ${error.message}`);
  }
});

// Export the function
module.exports = {
  uploadPasiCsvV2
};