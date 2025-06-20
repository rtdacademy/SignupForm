const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const path = require('path');

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Helper to get timestamp that works in emulator and production
const getTimestamp = () => {
  try {
    return admin.database.ServerValue.TIMESTAMP;
  } catch (error) {
    // Fallback for emulator environment
    return Date.now();
  }
};

// Helper to calculate age from birthday
const calculateAge = (birthday) => {
  if (!birthday) return null;
  
  try {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    console.error('Error calculating age:', error);
    return null;
  }
};

// Helper to format date safely
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

// Helper to find earliest date from multiple date fields across student records
const findEarliestFormCreationDate = (studentRecords, schoolYear) => {
  let earliestDate = null;
  let isSummerSchool = false;
  
  // Look through all records for this student
  for (const record of studentRecords) {
    // Check if this is summer school (Summer term)
    if (record.pasiTerm === 'Summer') {
      isSummerSchool = true;
    }
    
    const dates = [
      record.startDate,
      record.Created, 
      record.ScheduleStartDate,
      record.entryDate
    ].filter(Boolean); // Remove null/undefined dates
    
    for (const dateStr of dates) {
      try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          if (!earliestDate || date < earliestDate) {
            earliestDate = date;
          }
        }
      } catch (error) {
        // Skip invalid dates
      }
    }
  }
  
  const today = new Date();
  const schoolYearStart = getSchoolYearStartYear(schoolYear);
  
  // Handle summer school special cases
  if (isSummerSchool) {
    if (!earliestDate) {
      // No date found for summer school, use today
      return today;
    }
    
    // If earliest date is in the future, use today
    if (earliestDate > today) {
      return today;
    }
    
    // If earliest date is before 2025, use random January/February date
    if (earliestDate.getFullYear() < 2025) {
      return generateRandomWinterDate(2025);
    }
    
    return earliestDate;
  }
  
  // Regular (non-summer) school handling
  if (!earliestDate) {
    return generateRandomSummerDate(schoolYearStart);
  }
  
  // Check if earliest date is before the school year starts
  const schoolYearStartDate = new Date(schoolYearStart, 8, 1); // September 1st of school year
  
  if (earliestDate < schoolYearStartDate) {
    // Use random summer date before school year
    return generateRandomSummerDate(schoolYearStart);
  }
  
  return earliestDate;
};

// Helper to extract start year from school year string
const getSchoolYearStartYear = (schoolYear) => {
  // Handle formats like "24/25", "24_25", "2024/25", etc.
  const yearStr = schoolYear.replace(/[/_]/g, '/').split('/')[0];
  let year = parseInt(yearStr);
  
  // Convert 2-digit to 4-digit year
  if (year < 100) {
    year += 2000;
  }
  
  return year;
};

// Helper to format school year for display (24_25 -> 2024/2025)
const formatSchoolYearForDisplay = (schoolYear) => {
  if (!schoolYear) return '';
  
  // Handle formats like "24/25", "24_25", "2024/25", etc.
  const parts = schoolYear.replace(/[/_]/g, '/').split('/');
  if (parts.length !== 2) return schoolYear; // Return original if not in expected format
  
  let startYear = parseInt(parts[0]);
  let endYear = parseInt(parts[1]);
  
  // Convert 2-digit to 4-digit years
  if (startYear < 100) {
    startYear += 2000;
  }
  if (endYear < 100) {
    endYear += 2000;
  }
  
  return `${startYear}/${endYear}`;
};

// Helper to generate random date in June, July, or August
const generateRandomSummerDate = (year) => {
  const months = [5, 6, 7]; // June, July, August (0-indexed)
  const randomMonth = months[Math.floor(Math.random() * months.length)];
  const daysInMonth = new Date(year, randomMonth + 1, 0).getDate();
  const randomDay = Math.floor(Math.random() * daysInMonth) + 1;
  const randomHour = Math.floor(Math.random() * 24);
  const randomMinute = Math.floor(Math.random() * 60);
  
  return new Date(year, randomMonth, randomDay, randomHour, randomMinute);
};

// Helper to generate random date in January or February
const generateRandomWinterDate = (year) => {
  const months = [0, 1]; // January, February (0-indexed)
  const randomMonth = months[Math.floor(Math.random() * months.length)];
  const daysInMonth = new Date(year, randomMonth + 1, 0).getDate();
  const randomDay = Math.floor(Math.random() * daysInMonth) + 1;
  const randomHour = Math.floor(Math.random() * 24);
  const randomMinute = Math.floor(Math.random() * 60);
  
  return new Date(year, randomMonth, randomDay, randomHour, randomMinute);
};

// Helper to prepare course data with proper entry date handling
const prepareCourseData = (allCourseRecords, documentConfig) => {
  // Get all available entry dates from all courses for this student
  const availableEntryDates = allCourseRecords
    .map(record => record.entryDate)
    .filter(Boolean); // Remove null/undefined dates
  
  // Use the first available entry date as fallback
  const fallbackEntryDate = availableEntryDates.length > 0 ? availableEntryDates[0] : null;
  
  return allCourseRecords.map((courseRecord, index) => {
    // Determine if this is the primary course (first one) or an added course
    const isPrimaryCourse = index === 0;
    
    // Handle entry date for this course
    let courseStartDate = courseRecord.entryDate;
    
    // If no entry date for this course, use fallback from another course
    if (!courseStartDate && fallbackEntryDate) {
      courseStartDate = fallbackEntryDate;
    }
    
    // Handle summer school logic
    const isSummerSchool = courseRecord.pasiTerm === 'Summer';
    if (isSummerSchool && (!courseStartDate || new Date(courseStartDate) > new Date())) {
      const schoolYearEnd = getSchoolYearStartYear(documentConfig.schoolYear) + 1;
      courseStartDate = `${schoolYearEnd}-07-01`;
    }
    
    return {
      courseName: courseRecord.Course_Value || '',
      courseCode: courseRecord.courseCode || '',
      term: courseRecord.pasiTerm || '',
      entryDate: formatDate(courseStartDate),
      isPrimaryCourse: isPrimaryCourse,
      isAddedCourse: !isPrimaryCourse
    };
  });
};

// PDF template
const pdfTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page {
      size: letter;
      margin: 0.75in;
    }
    
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #008B8B;
    }
    
    .logo-section {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .logo {
      width: 60px;
      height: 60px;
    }
    
    .school-info h1 {
      margin: 0;
      color: #008B8B;
      font-size: 24px;
    }
    
    .school-info p {
      margin: 2px 0;
      font-size: 12px;
      color: #666;
    }
    
    .date-section {
      text-align: right;
      font-size: 12px;
    }
    
    .date-section .label {
      color: #666;
    }
    
    .date-section .value {
      font-weight: bold;
      color: #333;
    }
    
    .title {
      text-align: center;
      margin: 40px 0;
    }
    
    .title h2 {
      color: #008B8B;
      font-size: 22px;
      text-transform: uppercase;
      margin: 0;
    }
    
    .subtitle {
      font-size: 16px;
      color: #666;
      margin-top: 5px;
    }
    
    .content {
      margin: 30px 0;
    }
    
    .section {
      margin-bottom: 30px;
    }
    
    .section-title {
      color: #008B8B;
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 15px;
      padding-bottom: 5px;
      border-bottom: 1px solid #E0E0E0;
    }
    
    .field-row {
      display: flex;
      margin-bottom: 10px;
      font-size: 14px;
    }
    
    .field-label {
      font-weight: bold;
      color: #555;
      min-width: 200px;
    }
    
    .field-sublabel {
      font-size: 11px;
      color: #777;
      font-weight: normal;
      display: block;
      margin-top: 2px;
      line-height: 1.3;
    }
    
    .field-value {
      color: #333;
    }
    
    .field-value.empty {
      color: #999;
      font-style: italic;
    }
    
    .course-block {
      margin: 15px 0;
      padding: 12px;
      border-left: 3px solid #008B8B;
      background-color: #f9f9f9;
      border-radius: 0 4px 4px 0;
    }
    
    .course-block.added-course {
      border-left-color: #20B2AA;
      background-color: #f0f8ff;
    }
    
    .course-added-indicator {
      color: #666;
      font-style: italic;
      font-size: 12px;
      margin-left: 8px;
    }
    
    
    .footer {
      margin-top: 60px;
      padding-top: 30px;
      border-top: 2px solid #E0E0E0;
    }
    
    
    .document-footer {
      margin-top: 40px;
      font-size: 10px;
      color: #999;
      text-align: center;
    }
    
    .watermark {
      position: fixed;
      bottom: 20px;
      right: 20px;
      opacity: 0.1;
      z-index: -1;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-section">
      <svg class="logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 75 75">
        <g transform="translate(10, 25)">
          <polygon points="40 0 46.5 12 53 24 40 24 27 24 33.5 12 40 0" fill="#008B8B"/>
          <polygon points="53 24 59.5 36 66 48 53 48 40 48 46.5 36 53 24" fill="#E0FFFF"/>
          <polygon points="27 24 33.5 36 40 48 27 48 14 48 20.5 36 27 24" fill="#20B2AA"/>
        </g>
      </svg>
      <div class="school-info">
        <h1>RTD Academy</h1>
        <p>Alberta School Code: 2444</p>
        <p>Authority Code: 0402</p>
      </div>
    </div>
    <div class="date-section">
      <p class="label">Form Created:</p>
      <p class="value">{{formCreatedDate}}</p>
      <p class="label" style="margin-top: 10px;">Report Exported:</p>
      <p class="value">{{currentDate}}</p>
    </div>
  </div>
  
  <div class="title">
    <h2>{{documentTitle}}</h2>
    <p class="subtitle">{{documentSubtitle}}</p>
  </div>
  
  <div class="content">
    <div class="section">
      <h3 class="section-title">Student Information</h3>
      <div class="field-row">
        <span class="field-label">
          Full Legal Name
          <span class="field-sublabel">Student's complete legal name as registered with Alberta Education</span>
        </span>
        <span class="field-value">{{studentName}}</span>
      </div>
      <div class="field-row">
        <span class="field-label">
          Alberta Student Number (ASN)
          <span class="field-sublabel">Unique 9-digit identifier assigned by Alberta Education</span>
        </span>
        <span class="field-value">{{asn}}</span>
      </div>
      <div class="field-row">
        <span class="field-label">
          Student Type
          <span class="field-sublabel">Classification for grant purposes to ensure RTD Academy receives appropriate funding from Alberta Education</span>
        </span>
        <span class="field-value">{{studentType}}</span>
      </div>
      <div class="field-row">
        <span class="field-label">
          Primary Email Address
          <span class="field-sublabel">Main contact email for course communications and notifications</span>
        </span>
        <span class="field-value">{{email}}</span>
      </div>
      <div class="field-row">
        <span class="field-label">
          Contact Phone Number
          <span class="field-sublabel">Primary phone number for urgent school communications</span>
        </span>
        <span class="field-value">{{phone}}</span>
      </div>
      {{#if birthday}}
      <div class="field-row">
        <span class="field-label">
          Date of Birth
          <span class="field-sublabel">Student's birth date for age verification and program eligibility</span>
        </span>
        <span class="field-value">{{birthday}}{{#if age}} (Current Age: {{age}} years){{/if}}</span>
      </div>
      {{/if}}
      
      {{#if hasCustomProperties}}
      {{#each customProperties}}
      <div class="field-row">
        <span class="field-label">
          {{@key}}
          {{#if this.description}}<span class="field-sublabel">{{this.description}}</span>{{/if}}
        </span>
        <span class="field-value">{{this.value}}</span>
      </div>
      {{/each}}
      {{/if}}
    </div>
    
    <div class="section">
      <h3 class="section-title">Academic Registration & Course Enrollment</h3>
      <div class="field-row">
        <span class="field-label">
          Academic Year
          <span class="field-sublabel">School year period for registered courses and assessments</span>
        </span>
        <span class="field-value">{{schoolYear}}</span>
      </div>
      
      {{#if hasCourses}}
      {{#each courses}}
      <div class="course-block {{#if isAddedCourse}}added-course{{/if}}">
        <div class="field-row">
          <span class="field-label">
            Course Title & Program
            <span class="field-sublabel">Official course name and curriculum designation</span>
          </span>
          <span class="field-value">{{courseName}}{{#if isAddedCourse}}<span class="course-added-indicator">(Course Added to Registration)</span>{{/if}}</span>
        </div>
        <div class="field-row">
          <span class="field-label">
            Provincial Course Code
            <span class="field-sublabel">Alberta Education approved course identifier</span>
          </span>
          <span class="field-value">{{courseCode}}</span>
        </div>
        <div class="field-row">
          <span class="field-label">
            Academic Term
            <span class="field-sublabel">Semester or session when course instruction occurs</span>
          </span>
          <span class="field-value">{{term}}</span>
        </div>
        <div class="field-row">
          <span class="field-label">
            Course Commencement Date
            <span class="field-sublabel">Official start date for course instruction and activities</span>
          </span>
          <span class="field-value">{{entryDate}}</span>
        </div>
      </div>
      {{/each}}
      {{else}}
      <div class="field-row">
        <span class="field-value" style="color: #999; font-style: italic;">No course information available</span>
      </div>
      {{/if}}
    </div>
    
    {{#if hasParentInfo}}
    <div class="section">
      <h3 class="section-title">Parent/Guardian Contact Information</h3>
      <div class="field-row">
        <span class="field-label">
          Legal Guardian Name
          <span class="field-sublabel">Primary parent or legal guardian responsible for student</span>
        </span>
        <span class="field-value{{#unless parentName}} empty{{/unless}}">
          {{#if parentName}}{{parentName}}{{else}}Information Not Provided{{/if}}
        </span>
      </div>
      <div class="field-row">
        <span class="field-label">
          Guardian Email Address
          <span class="field-sublabel">Primary email for parent communications and school updates</span>
        </span>
        <span class="field-value{{#unless parentEmail}} empty{{/unless}}">
          {{#if parentEmail}}{{parentEmail}}{{else}}Information Not Provided{{/if}}
        </span>
      </div>
      <div class="field-row">
        <span class="field-label">
          Guardian Phone Number
          <span class="field-sublabel">Primary contact number for urgent school matters</span>
        </span>
        <span class="field-value{{#unless parentPhone}} empty{{/unless}}">
          {{#if parentPhone}}{{parentPhone}}{{else}}Information Not Provided{{/if}}
        </span>
      </div>
    </div>
    {{/if}}
    
  </div>
  
  <div class="footer">
    <div class="contact-section" style="margin-bottom: 30px;">
      <h3 style="color: #008B8B; margin-bottom: 15px;">School Contact Information</h3>
      <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 250px; margin-right: 20px;">
          <p style="margin: 5px 0;"><strong>Website:</strong> www.rtdacademy.com</p>
          <p style="margin: 5px 0;"><strong>Course Access:</strong> yourway.rtdacademy.com</p>
        </div>
        <div style="flex: 1; min-width: 250px;">
          <p style="margin: 5px 0;"><strong>Email:</strong> info@rtdacademy.com</p>
          <p style="margin: 5px 0;"><strong>Phone:</strong> 403-351-0896 ext 2</p>
        </div>
      </div>
    </div>
    
    <div class="document-footer">
      <p>This is an official registration document generated by RTD Academy's Student Information System.</p>
      <p>Report exported on {{currentDate}} at {{currentTime}}</p>
      <p>Document Reference: {{referenceId}}</p>
    </div>
  </div>
  
  <svg class="watermark" width="150" height="150" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 75 75">
    <g transform="translate(10, 25)">
      <polygon points="40 0 46.5 12 53 24 40 24 27 24 33.5 12 40 0" fill="#008B8B"/>
      <polygon points="53 24 59.5 36 66 48 53 48 40 48 46.5 36 53 24" fill="#E0FFFF"/>
      <polygon points="27 24 33.5 36 40 48 27 48 14 48 20.5 36 27 24" fill="#20B2AA"/>
    </g>
  </svg>
</body>
</html>
`;

// Cloud function
const generateRegistrationPDFs = onCall({
  region: 'us-central1',
  memory: '2GiB',
  timeoutSeconds: 540, // 9 minutes
  maxInstances: 10
}, async (request) => {
  const { students, documentConfig } = request.data;
  const userId = request.auth?.uid;
  const userEmail = request.auth?.token?.email;
  
  if (!userId) {
    throw new Error('Authentication required');
  }
  
  if (!students || students.length === 0) {
    throw new Error('No students provided');
  }
  
  console.log(`Starting PDF generation for ${students.length} students by ${userEmail}`);
  
  // Sanitize school year for file path (replace / with _)
  const sanitizedSchoolYear = documentConfig.schoolYear.replace(/\//g, '_');
  
  const db = admin.database();
  const storage = admin.storage().bucket();
  
  // Create job record
  const jobId = `pdf_job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const jobRef = db.ref(`pdfGenerationJobs/${jobId}`);
  
  await jobRef.set({
    status: 'processing',
    createdBy: userEmail,
    createdAt: getTimestamp(),
    config: documentConfig,
    progress: {
      total: students.length,
      completed: 0,
      failed: 0
    }
  });
  
  // Process in smaller batches for better reliability with large datasets
  const BATCH_SIZE = 25;
  const batches = [];
  
  for (let i = 0; i < students.length; i += BATCH_SIZE) {
    batches.push(students.slice(i, i + BATCH_SIZE));
  }
  
  const downloadUrls = [];
  const failedStudents = [];
  let processedCount = 0;
  
  // Launch Puppeteer
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    ]
  });
  
  try {
    // Compile Handlebars template
    const template = handlebars.compile(pdfTemplate);
    
    // Process each batch
    for (const batch of batches) {
      const batchPromises = batch.map(async (student) => {
        try {
          // Get all course records for this student (passed from frontend)
          const allCourseRecords = student.allCourseRecords || [student];
          const formCreationDate = findEarliestFormCreationDate(allCourseRecords, documentConfig.schoolYear);
          
          // Prepare course data with proper entry date handling
          const courseData = prepareCourseData(allCourseRecords, documentConfig);
          
          // Prepare template data
          const age = calculateAge(student.birthday);
          const parentName = [student.ParentFirstName, student.ParentLastName]
            .filter(Boolean)
            .join(' ');
          
          const hasParentInfo = student.ParentEmail || parentName || student.ParentPhone_x0023_;
          
          // Generate reference ID for tracking (used in both PDF and metadata)
          const referenceId = `REG-${student.asn}-${Date.now()}`;
          
          const templateData = {
            // Document config
            documentTitle: documentConfig.title,
            documentSubtitle: documentConfig.subtitle,
            currentDate: new Date().toLocaleDateString('en-CA', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            currentTime: new Date().toLocaleTimeString('en-CA', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            referenceId: referenceId,
            formCreatedDate: formatDate(formCreationDate),
            
            // Student info
            studentName: student.studentName || `${student.firstName} ${student.lastName}`,
            asn: student.asn,
            studentType: student.StudentType_Value || '',
            email: student.StudentEmail || '',
            phone: student.StudentPhone || '',
            birthday: formatDate(student.birthday),
            age: age,
            
            // Course info (multiple courses)
            courses: courseData,
            hasCourses: courseData.length > 0,
            hasMultipleCourses: courseData.length > 1,
            schoolYear: formatSchoolYearForDisplay(student.schoolYear || documentConfig.schoolYear),
            
            // Parent info
            hasParentInfo: hasParentInfo,
            parentName: parentName,
            parentEmail: student.ParentEmail || '',
            parentPhone: student.ParentPhone_x0023_ || '',
            
            // Custom properties
            hasCustomProperties: Object.keys(documentConfig.customProperties || {}).length > 0,
            customProperties: documentConfig.customProperties || {}
          };
          
          // Generate HTML
          const html = template(templateData);
          
          // Create PDF with extended timeout
          const page = await browser.newPage();
          
          // Set longer timeout for content loading and PDF generation
          page.setDefaultTimeout(120000); // 2 minutes
          
          await page.setContent(html, { 
            waitUntil: 'networkidle0',
            timeout: 90000 // 1.5 minutes for content loading
          });
          await page.emulateMediaType('print');
          
          const pdfBuffer = await page.pdf({
            format: 'Letter',
            printBackground: true,
            margin: {
              top: '0.75in',
              right: '0.75in',
              bottom: '0.75in',
              left: '0.75in'
            },
            timeout: 60000 // 1 minute for PDF generation
          });
          
          await page.close();
          
          // Generate filename for comprehensive registration document
          const courseCount = courseData.length;
          const fileName = `Registration_${student.asn}_${courseCount}Courses_${documentConfig.schoolYear.replace(/\//g, '_')}.pdf`;
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
          
          // Instead of generating URLs on the server, we'll pass the file path
          // The frontend will use Firebase Storage SDK to get proper download URLs
          downloadUrls.push({
            asn: student.asn,
            fileName: fileName,
            filePath: filePath,  // Pass the path instead of URL
            referenceId: referenceId,  // Include reference ID for tracking
            courseCount: courseData.length,
            courseCodes: courseData.map(c => c.courseCode).join(', ')
          });
          
          processedCount++;
          
          // Update progress
          await jobRef.child('progress').update({
            completed: processedCount
          });
          
        } catch (error) {
          console.error(`Error processing student ${student.asn}:`, error);
          
          // Determine error type for better debugging
          let errorType = 'UNKNOWN_ERROR';
          if (error.message.includes('Timed out')) {
            errorType = 'TIMEOUT_ERROR';
          } else if (error.message.includes('Navigation')) {
            errorType = 'NAVIGATION_ERROR';
          } else if (error.message.includes('Protocol error')) {
            errorType = 'BROWSER_ERROR';
          }
          
          failedStudents.push({
            asn: student.asn,
            studentName: student.studentName || `${student.firstName} ${student.lastName}`,
            error: error.message,
            errorCode: errorType,
            timestamp: new Date().toISOString()
          });
          
          await jobRef.child('progress/failed').transaction((current) => (current || 0) + 1);
        }
      });
      
      await Promise.all(batchPromises);
    }
    
    // Create batch metadata
    const batchMetadata = {
      jobId: jobId,
      totalStudents: students.length,
      completed: processedCount,
      failed: failedStudents.length,
      generatedBy: userEmail,
      generatedAt: new Date().toISOString(),
      customProperties: documentConfig.customProperties || {},
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
    
    // Save batch metadata in organized folder structure
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
      failedStudents: failedStudents,
      metadataPath: metadataPath
    });
    
    console.log(`PDF generation completed: ${processedCount} successful, ${failedStudents.length} failed`);
    
    return {
      success: true,
      jobId: jobId,
      processedCount: processedCount,
      failedCount: failedStudents.length,
      downloadUrls: downloadUrls,
      failedStudents: failedStudents // Include failed students for frontend display
    };
    
  } catch (error) {
    console.error('Fatal error in PDF generation:', error);
    
    try {
      await jobRef.update({
        status: 'failed',
        error: error.message,
        failedAt: getTimestamp()
      });
    } catch (dbError) {
      console.error('Error updating job status:', dbError);
    }
    
    // Return structured error instead of throwing
    throw new Error(`PDF generation failed: ${error.message}`);
    
  } finally {
    await browser.close();
  }
});

module.exports = { generateRegistrationPDFs };