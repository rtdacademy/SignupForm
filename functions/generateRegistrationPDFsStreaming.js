const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const path = require('path');
const { stringify } = require('csv-stringify/sync');

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Import all the helper functions from the original file
const { 
  getTimestamp,
  calculateAge,
  formatDate,
  findEarliestFormCreationDate,
  getSchoolYearStartYear,
  prepareCSVData,
  prepareCourseData,
  pdfTemplate
} = require('./generateRegistrationPDFs');

// HTTP Function with Server-Sent Events for real-time streaming
const generateRegistrationPDFsStreaming = onRequest({
  region: 'us-central1',
  memory: '2GiB',
  timeoutSeconds: 540, // 9 minutes
  maxInstances: 10,
  cors: {
    origin: ['https://yourway.rtdacademy.com', 'http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
}, async (req, res) => {
  // Set CORS headers explicitly
  const origin = req.headers.origin;
  const allowedOrigins = ['https://yourway.rtdacademy.com', 'http://localhost:3000', 'http://127.0.0.1:3000'];
  
  if (allowedOrigins.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
  }
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Set headers for Server-Sent Events
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  // Helper function to send SSE data
  const sendEvent = (eventType, data) => {
    res.write(`event: ${eventType}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const { students, documentConfig, csvConfig, idToken } = req.body;
    
    // Verify Firebase ID token
    if (!idToken) {
      sendEvent('error', { message: 'Authentication required' });
      res.end();
      return;
    }

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      sendEvent('error', { message: 'Invalid authentication token' });
      res.end();
      return;
    }

    const userId = decodedToken.uid;
    const userEmail = decodedToken.email;

    if (!students || students.length === 0) {
      sendEvent('error', { message: 'No students provided' });
      res.end();
      return;
    }

    console.log(`Starting streaming PDF generation for ${students.length} students by ${userEmail}`);
    
    // Send initial progress
    sendEvent('progress', {
      message: `Starting PDF generation for ${students.length} students`,
      completed: 0,
      total: students.length,
      status: 'starting'
    });

    // Initialize storage and database
    const sanitizedSchoolYear = documentConfig.schoolYear.replace(/\//g, '_');
    const db = admin.database();
    const storage = admin.storage().bucket();

    // Create job record
    const jobId = `pdf_job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const jobRef = db.ref(`pdfGenerationJobs/${jobId}`);

    await jobRef.set({
      status: 'processing',
      userId: userId,
      startedAt: getTimestamp(),
      config: documentConfig,
      progress: { total: students.length, completed: 0 }
    });

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    let processedCount = 0;
    const downloadUrls = [];
    const failedStudents = [];

    // Process each student
    for (const student of students) {
      try {
        // Send progress update
        sendEvent('progress', {
          message: `Processing student ${student.asn}... (${processedCount + 1}/${students.length})`,
          completed: processedCount,
          total: students.length,
          status: 'processing',
          currentStudent: student.asn
        });

        const allCourseRecords = student.allCourseRecords || [student];
        const formCreationDate = findEarliestFormCreationDate(allCourseRecords, documentConfig.schoolYear);
        const courseData = prepareCourseData(allCourseRecords, documentConfig);
        
        const age = calculateAge(student.birthday);
        const parentName = [student.ParentFirstName, student.ParentLastName]
          .filter(Boolean)
          .join(' ') || 'Not provided';

        const referenceId = `REG-${student.asn}-${Date.now()}`;

        const templateData = {
          documentTitle: documentConfig.title || 'Student Registration Form',
          documentSubtitle: documentConfig.subtitle || '',
          studentName: student.studentName || `${student.firstName} ${student.lastName}`,
          asn: student.asn,
          birthday: formatDate(student.birthday),
          age: age,
          parentName: parentName,
          parentEmail: student.ParentEmail || 'Not provided',
          parentPhone: student.ParentPhone_x0023_ || 'Not provided',
          studentEmail: student.StudentEmail || 'Not provided',
          studentPhone: student.StudentPhone || 'Not provided',
          courseData: courseData,
          schoolYear: documentConfig.schoolYear,
          formCreationDate: formatDate(formCreationDate),
          referenceId: referenceId,
          customProperties: documentConfig.customProperties || {}
        };

        const html = handlebars.compile(pdfTemplate)(templateData);
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
          format: 'letter',
          printBackground: true,
          margin: {
            top: '0.75in',
            right: '0.75in',
            bottom: '0.75in',
            left: '0.75in'
          },
          timeout: 60000
        });

        await page.close();

        // Generate filename with pasiTerm
        const courseCount = courseData.length;
        const uniqueTerms = [...new Set(courseData.map(c => c.term).filter(Boolean))].sort();
        const termsPart = uniqueTerms.length > 0 ? `_${uniqueTerms.join('-')}` : '';
        const fileName = `Registration_${student.asn}_${courseCount}Courses${termsPart}_${documentConfig.schoolYear.replace(/\//g, '_')}.pdf`;
        const filePath = `registrationDocuments/${sanitizedSchoolYear}/pdfs/${fileName}`;

        // Upload to storage
        const file = storage.file(filePath);
        await file.save(pdfBuffer, {
          metadata: {
            contentType: 'application/pdf',
            metadata: {
              asn: student.asn,
              studentName: student.studentName || `${student.firstName} ${student.lastName}`,
              courseCount: courseData.length,
              courseCodes: courseData.map(c => c.courseCode).join(', '),
              schoolYear: student.schoolYear || documentConfig.schoolYear,
              generatedAt: new Date().toISOString(),
              generatedBy: userEmail,
              jobId: jobId,
              referenceId: referenceId,
              documentType: 'comprehensive_registration'
            }
          }
        });

        downloadUrls.push({
          asn: student.asn,
          fileName: fileName,
          filePath: filePath,
          referenceId: referenceId,
          courseCount: courseData.length,
          courseCodes: courseData.map(c => c.courseCode).join(', ')
        });

        processedCount++;

        // Update progress in database
        await jobRef.child('progress').update({
          completed: processedCount
        });

      } catch (error) {
        console.error(`Error processing student ${student.asn}:`, error);
        failedStudents.push({
          asn: student.asn,
          error: error.message
        });
      }
    }

    await browser.close();

    // Generate CSV if configured
    let csvDownloadUrl = null;
    if (csvConfig && csvConfig.enabled && csvConfig.selectedColumns.length > 0) {
      try {
        sendEvent('progress', {
          message: `Generating CSV export with ${csvConfig.selectedColumns.length} columns`,
          completed: students.length,
          total: students.length,
          status: 'generating_csv'
        });

        const csvData = prepareCSVData(students, csvConfig.selectedColumns, csvConfig.columnLabels || {});
        const csv = stringify(csvData, { header: true });

        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
        const csvFileName = `Registration_Export_${sanitizedSchoolYear}_${timestamp}.csv`;
        const csvFilePath = `registrationDocuments/${sanitizedSchoolYear}/csv/${csvFileName}`;

        const csvFile = storage.file(csvFilePath);
        await csvFile.save(csv, {
          metadata: {
            contentType: 'text/csv',
            metadata: {
              jobId: jobId,
              generatedBy: userEmail,
              generatedAt: new Date().toISOString(),
              studentCount: students.length,
              recordCount: csvData.length,
              columnCount: csvConfig.selectedColumns.length
            }
          }
        });

        csvDownloadUrl = {
          fileName: csvFileName,
          filePath: csvFilePath,
          recordCount: csvData.length
        };

        console.log(`CSV generated successfully: ${csvFileName}`);
      } catch (csvError) {
        console.error('Error generating CSV:', csvError);
      }
    }

    // Create metadata
    const batchMetadata = {
      jobId: jobId,
      totalStudents: students.length,
      completed: processedCount,
      failed: failedStudents.length,
      generatedBy: userEmail,
      generatedAt: new Date().toISOString(),
      customProperties: documentConfig.customProperties || {},
      csvIncluded: csvDownloadUrl !== null,
      students: downloadUrls.map(item => ({
        asn: item.asn,
        status: 'completed',
        fileName: item.fileName,
        referenceId: item.referenceId,
        courseCount: item.courseCount || 1,
        courseCodes: item.courseCodes || ''
      })).concat(failedStudents.map(item => ({
        asn: item.asn,
        status: 'failed',
        error: item.error
      })))
    };

    const metadataPath = `registrationDocuments/${sanitizedSchoolYear}/metadata/batch_metadata_${jobId}.json`;
    const metadataFile = storage.file(metadataPath);
    await metadataFile.save(JSON.stringify(batchMetadata, null, 2), {
      metadata: {
        contentType: 'application/json'
      }
    });

    // Update job status
    await jobRef.update({
      status: 'completed',
      completedAt: getTimestamp(),
      downloadUrls: downloadUrls,
      csvDownloadUrl: csvDownloadUrl,
      failedStudents: failedStudents,
      metadataPath: metadataPath
    });

    // Send final completion event
    sendEvent('completed', {
      message: `PDF generation completed: ${processedCount} successful, ${failedStudents.length} failed`,
      jobId: jobId,
      downloadUrls: downloadUrls,
      csvDownloadUrl: csvDownloadUrl,
      failedStudents: failedStudents,
      success: true
    });

    console.log(`PDF generation completed: ${processedCount} successful, ${failedStudents.length} failed`);

  } catch (error) {
    console.error('Fatal error in PDF generation:', error);
    sendEvent('error', {
      message: error.message,
      error: 'PDF generation failed'
    });
  }

  res.end();
});

module.exports = { generateRegistrationPDFsStreaming };