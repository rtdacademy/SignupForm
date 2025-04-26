import { toast } from 'sonner';
import { getDatabase, ref, query, orderByChild, equalTo, get, update } from 'firebase/database';

/**
 * Formats a school year string by replacing slash with underscore (e.g., "23/24" to "23_24")
 * @param {string} year - School year in format "XX/XX"
 * @returns {string} Formatted school year "XX_XX"
 */
export const formatSchoolYear = (year) => {
  return year.replace('/', '_');
};

/**
 * Format school year with a slash (e.g., "23_24" to "23/24")
 */
export const formatSchoolYearWithSlash = (year) => {
  return year.replace('_', '/');
};

/**
 * Helper function to check if a record has changed
 * @param {Object} existingRecord - Existing record from the database
 * @param {Object} newRecord - New record from the CSV
 * @returns {boolean} True if the record has changed, false otherwise
 */
const hasRecordChanged = (existingRecord, newRecord) => {
  // Fields to compare (only the ones that come from CSV)
  const fieldsToCompare = [
    'asn', 'studentName', 'courseCode', 'courseDescription', 
    'status', 'period', 'value', 'approved', 'assignmentDate', 
    'creditsAttempted', 'deleted', 'dualEnrolment', 'exitDate', 
    'fundingRequested', 'term', 'referenceNumber' 
  ];
  
  return fieldsToCompare.some(field => existingRecord[field] !== newRecord[field]);
};

/**
 * Loads ASN to email mapping for all students
 * @returns {Promise<Object>} Object mapping ASNs to email addresses
 */
const getAsnEmailMapping = async () => {
  try {
    const db = getDatabase();
    const asnsSnapshot = await get(ref(db, 'ASNs'));
    
    const asnEmailMap = {};
    
    if (!asnsSnapshot.exists()) {
      console.warn('No ASN records found in database');
      return asnEmailMap;
    }
    
    // Process each ASN record
    asnsSnapshot.forEach((child) => {
      const asn = child.key;
      const record = child.val();
      
      if (!asn || !record.emailKeys) return;
      
      const keys = Object.keys(record.emailKeys);
      if (!keys.length) return;
      
      // Find preferred email or use the first one
      const preferred = keys.find(k => record.emailKeys[k]) || keys[0];
      asnEmailMap[asn] = preferred.replace(/,/g, '.');
    });
    
    console.log(`Loaded email mapping for ${Object.keys(asnEmailMap).length} ASNs`);
    return asnEmailMap;
  } catch (error) {
    console.error('Error loading ASN email mapping:', error);
    return {};
  }
};

/**
 * Process a CSV file containing PASI records
 * @param {File} file - The uploaded CSV file
 * @param {Object} context - Context object with dependencies 
 * @returns {Promise} Promise that resolves when processing is complete
 */
export const processCsvFile = async (file, context) => {
  const { 
    selectedSchoolYear, 
    setIsProcessing,
    setChangePreview,
    setShowPreview,
    asnEmails, // Accept this from context but don't use it
    COURSE_CODE_TO_ID,
    summaryDataMap,
    Papa
  } = context;

  if (!file) {
    throw new Error('Please select a file');
  }

  if (!selectedSchoolYear) {
    throw new Error('Please select a school year before uploading');
  }

  setIsProcessing(true);
  setChangePreview(null);
  setShowPreview(false);

  // Load ASN to email mapping directly here instead of relying on context
  const dynamicAsnEmails = await getAsnEmailMapping();
  
  // Log the number of ASN to email mappings for debugging
  console.log(`Loaded ${Object.keys(dynamicAsnEmails).length} ASN to email mappings`);

  return new Promise((resolve, reject) => {
    const config = {
      header: true,
      skipEmptyLines: 'greedy',
      complete: async (results) => {
        try {
          if (!results?.data?.length) {
            throw new Error('No valid data found in CSV file');
          }
  
          // Define required fields
          const requiredFields = ['ASN','Work Items', ' Code', 'Student Name', ' Description', 'Status', 'School Enrolment', 'Value', 'Approved?', 'Assignment Date', 'Credits Attempted', 'Deleted?', 'Dual Enrolment?', 'Exit Date', 'Funding Requested?', 'Term', 'Reference #'];
          
          // Check if all required fields are present in the CSV headers
          const csvHeaders = Object.keys(results.data[0] || {});
          const missingFields = requiredFields.filter(field => !csvHeaders.includes(field));
          
          // Specifically check for Reference # field
          const hasReferenceNumber = csvHeaders.includes('Reference #');
  
          if (Object.keys(summaryDataMap).length === 0) {
            throw new Error("Student course summaries are still loading. Please wait a moment and try again.");
          }
          
          // Validate ASN data
          const missingAsnRow = results.data.findIndex(row => !row['ASN']?.trim());
          if (missingAsnRow !== -1) {
            throw new Error(`Missing ASN value in row ${missingAsnRow + 2}`);
          }

          const formattedYear = formatSchoolYear(selectedSchoolYear);
          const schoolYearWithSlash = selectedSchoolYear; // Already in slash format
          
          // Create a lookup for student summaries by ASN and course code
          const summariesByAsnAndCourse = {};
          
          // Create a map of courseId to PASI code
          const courseIdToPasiCode = {};
          Object.entries(COURSE_CODE_TO_ID).forEach(([pasiCode, courseId]) => {
            courseIdToPasiCode[courseId] = pasiCode.toLowerCase();
          });
          
          // Organize student summaries for efficient lookup
          Object.entries(summaryDataMap).forEach(([summaryKey, summary]) => {
            if (summary.asn && summary.CourseID) {
              const courseId = summary.CourseID;
              const pasiCode = courseIdToPasiCode[courseId];
              
              if (pasiCode) {
                // Create a unique key combining ASN and PASI code
                const lookupKey = `${summary.asn}_${pasiCode}`;
                
                if (!summariesByAsnAndCourse[lookupKey]) {
                  summariesByAsnAndCourse[lookupKey] = [];
                }
                
                summariesByAsnAndCourse[lookupKey].push({
                  summaryKey,
                  summary,
                  courseId,
                  pasiCode
                });
              }
            }
          });
          
          // Fetch existing PASI records for this school year
          const db = getDatabase();
          const pasiRef = ref(db, 'pasiRecords');
          const schoolYearQuery = query(
            pasiRef,
            orderByChild('schoolYear'),
            equalTo(formattedYear)
          );
          
          const snapshot = await get(schoolYearQuery);
          const existingRecords = {};
          
          if (snapshot.exists()) {
            snapshot.forEach((child) => {
              existingRecords[child.key] = child.val();
            });
          }
          
          // Process CSV into new records map
          const newRecordsMap = {};
          const studentSummaryUpdates = {};
          
          // Track existing summary entries for comparison
          const existingSummaryEntries = {};
          
          // For each existing record, if it has a summaryKey, note the existing entry
          Object.entries(existingRecords).forEach(([recordId, record]) => {
            if (record.summaryKey && record.courseCode) {
              const key = `${record.summaryKey}/${record.courseCode.toLowerCase()}`;
              existingSummaryEntries[key] = recordId;
            }
          });
          
          const stats = {
            total: results.data.length,
            new: 0,
            updated: 0,
            linked: 0,
            newLinks: 0,
            removedLinks: 0,
            removed: Object.keys(existingRecords).length,
            duplicates: 0
          };
          
          // Track duplicates with multiple records
          const recordsWithMultipleVersions = {};
          
          // First pass: identify duplicates
          results.data.forEach(row => {
            const asn = row['ASN']?.trim() || '';
            const courseCode = row[' Code']?.trim().toUpperCase() || '';
            const period = row['Period']?.trim() || 'Regular';
            const recordId = `${asn}_${courseCode.toLowerCase()}_${formattedYear}_${period.toLowerCase()}`;
            
            if (!recordsWithMultipleVersions[recordId]) {
              recordsWithMultipleVersions[recordId] = [];
            }
            
            recordsWithMultipleVersions[recordId].push(row);
          });
          
          // Count duplicates for statistics
          Object.keys(recordsWithMultipleVersions).forEach(recordId => {
            if (recordsWithMultipleVersions[recordId].length > 1) {
              stats.duplicates++;
            }
          });
          
          // Track ASNs with missing emails for reporting
          const asnsWithMissingEmails = new Set();
          
          // Process each unique record
          Object.entries(recordsWithMultipleVersions).forEach(([recordId, rows]) => {
            // Get the primary row (first one, will be enhanced with multiple records data)
            const primaryRow = rows[0];
            
            const asn = primaryRow['ASN']?.trim() || '';
            
            // Look up email from our dynamically loaded ASN to email mapping
            let email = dynamicAsnEmails[asn] || null;
            
            // If we couldn't find a direct match, try to find a fuzzy match
            if (!email && asn) {
              // Sometimes ASNs may have different formats (with/without dashes)
              // Try to match without the dashes
              const asnWithoutDashes = asn.replace(/-/g, '');
              
              // Find any ASN in our map that matches when dashes are removed
              const match = Object.keys(dynamicAsnEmails).find(key => 
                key.replace(/-/g, '') === asnWithoutDashes
              );
              
              if (match) {
                email = dynamicAsnEmails[match];
                console.log(`Found fuzzy match for ASN ${asn} -> ${match}: ${email}`);
              }
            }
            
            // If still no email, use the default '-' and track this ASN for reporting
            if (!email) {
              email = '-';
              asnsWithMissingEmails.add(asn);
            }
            
            const courseCode = primaryRow[' Code']?.trim().toUpperCase() || '';
            const period = primaryRow['Period']?.trim() || 'Regular';
            
            // Create new record object from CSV data
            const newRecord = {
              asn,
              email,
              matchStatus: email !== '-' ? 'Found in Database' : 'Not Found',
              studentName: primaryRow['Student Name']?.trim() || '',
              workItems: primaryRow['Work Items']?.trim() || '',
              courseCode,
              courseDescription: primaryRow[' Description']?.trim() || '',
              status: primaryRow['Status']?.trim() || 'Active',
              schoolEnrolment: primaryRow['School Enrolment']?.trim() || '',
              period,
              schoolYear: formattedYear,
              value: primaryRow['Value']?.trim() || '-',
              approved: primaryRow['Approved?']?.trim() || 'No',
              assignmentDate: primaryRow['Assignment Date']?.trim() || '-',
              creditsAttempted: primaryRow['Credits Attempted']?.trim() || '-',
              deleted: primaryRow['Deleted?']?.trim() || 'No',
              dualEnrolment: primaryRow['Dual Enrolment?']?.trim() || 'No',
              exitDate: primaryRow['Exit Date']?.trim() || '-',
              fundingRequested: primaryRow['Funding Requested?']?.trim() || 'No',
              term: primaryRow['Term']?.trim() || 'Full Year',
              referenceNumber: primaryRow['Reference #']?.trim() || '',
              lastUpdated: new Date().toLocaleString('en-US'),
              id: recordId
            };
            
            // Create multiple records data ONLY if there are multiple rows
            if (rows.length > 1) {
              // Current upload has duplicates, create fresh multipleRecords array 
              // from current upload only - don't merge with previous data
              newRecord.multipleRecords = rows.map(row => ({
                referenceNumber: row['Reference #']?.trim() || null,
                term: row['Term']?.trim() || null,
                status: row['Status']?.trim() || null,
                exitDate: row['Exit Date']?.trim() || '-',
                deleted: row['Deleted']?.trim() || null,
                approved: row['Approved']?.trim() || null,
                value: row['Value']?.trim() || null
              }));
              
              // Sort records to prioritize Completed status and later exit dates
              newRecord.multipleRecords.sort((a, b) => {
                // Completed status takes priority
                if (a.status === "Completed" && b.status !== "Completed") return -1;
                if (a.status !== "Completed" && b.status === "Completed") return 1;
                
                // Then compare by exitDate (latest date wins)
                const aDate = a.exitDate && a.exitDate !== '-' ? new Date(a.exitDate) : new Date(0);
                const bDate = b.exitDate && b.exitDate !== '-' ? new Date(b.exitDate) : new Date(0);
                return bDate - aDate; // Descending order (latest first)
              });
              
              // Update primary record fields to match the primary version
              const primaryVersion = newRecord.multipleRecords[0];
              newRecord.status = primaryVersion.status || newRecord.status;
              newRecord.term = primaryVersion.term || newRecord.term;
              newRecord.exitDate = primaryVersion.exitDate || newRecord.exitDate;
              newRecord.value = primaryVersion.value || newRecord.value;
              newRecord.approved = primaryVersion.approved || newRecord.approved;
              newRecord.referenceNumber = primaryVersion.referenceNumber || newRecord.referenceNumber;
            } else {
              // Current upload does NOT have duplicates - ensure no multipleRecords exists
              delete newRecord.multipleRecords;
            }
            
            // Check if record already exists to preserve link metadata
            if (existingRecords[recordId]) {
              stats.removed--; // Not actually removing this one
              
              // Preserve critical metadata
              newRecord.linked = existingRecords[recordId].linked === true;
              newRecord.linkedAt = existingRecords[recordId].linkedAt || null;
              newRecord.summaryKey = existingRecords[recordId].summaryKey || null;
              
              // IMPORTANT: Also preserve the old email if our new one is just the default
              if (newRecord.email === '-' && existingRecords[recordId].email && existingRecords[recordId].email !== '-') {
                newRecord.email = existingRecords[recordId].email;
              }
              
              // If already linked, count it
              if (newRecord.linked) {
                stats.linked++;
              }
              
              // Check if anything changed
              const recordChanged = hasRecordChanged(existingRecords[recordId], newRecord);
              if (recordChanged) {
                stats.updated++;
                
                // If record changed AND it's linked, we need to update the student summary
                if (newRecord.linked && newRecord.summaryKey) {
                  const summaryKey = newRecord.summaryKey;
                  
                  // Only update if the actual student-visible data changed
                  const relevantDataChanged = [
                    'courseDescription',
                    'creditsAttempted',
                    'term',
                    'period',
                    'studentName'
                  ].some(field => existingRecords[recordId][field] !== newRecord[field]);
                  
                  if (relevantDataChanged) {
                    // Add to our updates
                    studentSummaryUpdates[`${summaryKey}/pasiRecords/${courseCode.toLowerCase()}`] = {
                      courseDescription: newRecord.courseDescription,
                      creditsAttempted: newRecord.creditsAttempted,
                      term: newRecord.term,
                      period: newRecord.period,
                      schoolYear: schoolYearWithSlash,
                      studentName: newRecord.studentName,
                      pasiRecordID: recordId
                    };
                  }
                }
              }
              
              // Handle multiple records updating
              if (rows.length > 1) {
                newRecord.multipleRecords = rows.map(row => ({
                  referenceNumber: row['Reference #']?.trim() || null,
                  term: row['Term']?.trim() || null,
                  status: row['Status']?.trim() || null,
                  exitDate: row['Exit Date']?.trim() || '-',
                  deleted: row['Deleted']?.trim() || null,
                  approved: row['Approved']?.trim() || null,
                  value: row['Value']?.trim() || null
                }));
                
                // Sort records to prioritize Completed status and later exit dates
                newRecord.multipleRecords.sort((a, b) => {
                  // Completed status takes priority
                  if (a.status === "Completed" && b.status !== "Completed") return -1;
                  if (a.status !== "Completed" && b.status === "Completed") return 1;
                  
                  // Then compare by exitDate (latest date wins)
                  const aDate = a.exitDate && a.exitDate !== '-' ? new Date(a.exitDate) : new Date(0);
                  const bDate = b.exitDate && b.exitDate !== '-' ? new Date(b.exitDate) : new Date(0);
                  return bDate - aDate; // Descending order (latest first)
                });
                
                // Update primary record fields to match the primary version
                const primaryVersion = newRecord.multipleRecords[0];
                newRecord.status = primaryVersion.status || newRecord.status;
                newRecord.term = primaryVersion.term || newRecord.term;
                newRecord.exitDate = primaryVersion.exitDate || newRecord.exitDate;
                newRecord.value = primaryVersion.value || newRecord.value;
                newRecord.approved = primaryVersion.approved || newRecord.approved;
                newRecord.referenceNumber = primaryVersion.referenceNumber || newRecord.referenceNumber;
              } else {
                // Current upload does NOT have duplicates - ensure no multipleRecords exists
                delete newRecord.multipleRecords;
              }
            } else {
              // This is a brand new record
              stats.new++;
              
              // Initialize link status (we'll update this later if we find a match)
              newRecord.linked = false;
              newRecord.linkedAt = null;
              newRecord.summaryKey = null;
            }
            
            // Build the summaryKey using our desired process
            if (asn) {
              // 1. Get the email to use for the link (email from record or from an existing link)
              const emailToUse = newRecord.email !== '-' ? newRecord.email : (existingRecords[recordId]?.email || '-');
              
              // Only proceed if we have a valid email
              if (emailToUse !== '-') {
                // 2. Sanitize the email
                const sanitizedEmail = emailToUse.replace(/\./g, ',');
                
                // 3. Look up the base courseId using the COURSE_CODE_TO_ID mapping
                let baseCourseId = COURSE_CODE_TO_ID[newRecord.courseCode];
                
                // 4. If baseCourseId is 2000, then we need to look up an actual course ID from a matching student summary
                if (baseCourseId === 2000) {
                  // Look for a matching student summary that has this student's ASN and a valid CourseID.
                  const potentialSummary = Object.values(summaryDataMap).find(summary =>
                    summary.asn === asn && summary.CourseID
                  );
                  if (potentialSummary) {
                    baseCourseId = potentialSummary.CourseID;
                  }
                }
                
                // 5. Create the computed summaryKey as: sanitizedEmail + "_" + baseCourseId
                const computedSummaryKey = `${sanitizedEmail}_${baseCourseId}`;
                
                // 6. If this record isn't already linked or has a different summaryKey, update it.
                if (!newRecord.linked || newRecord.summaryKey !== computedSummaryKey) {
                  if (!newRecord.linked) {
                    stats.newLinks++;
                  }
                  
                  newRecord.linked = true;
                  newRecord.linkedAt = new Date().toISOString();
                  newRecord.summaryKey = computedSummaryKey;
                  
                  // Update the student summary update map using the computed key
                  studentSummaryUpdates[`${computedSummaryKey}/pasiRecords/${courseCode.toLowerCase()}`] = {
                    courseDescription: newRecord.courseDescription,
                    creditsAttempted: newRecord.creditsAttempted,
                    term: newRecord.term,
                    period: newRecord.period,
                    schoolYear: schoolYearWithSlash,
                    studentName: newRecord.studentName,
                    pasiRecordID: recordId
                  };
                  
                  // Check if this is a placeholder course (2000) and flag it
                  if (baseCourseId === 2000) {
                    // Add a flag to indicate this needs course assignment
                    studentSummaryUpdates[`${computedSummaryKey}/needsCourseAssignment`] = true;
                    console.log(`Created placeholder link with courseId 2000 for ASN: ${asn}, Student: ${newRecord.studentName}`);
                  } else {
                    // Make sure to remove the flag if it exists and the course ID is now valid
                    studentSummaryUpdates[`${computedSummaryKey}/needsCourseAssignment`] = null;
                  }
                  
                  // Mark this link in the existing summary entries map
                  const entryKey = `${computedSummaryKey}/${courseCode.toLowerCase()}`;
                  existingSummaryEntries[entryKey] = recordId;
                }
                
                stats.linked++;
              }
            }
            
            // Add to new records map
            newRecordsMap[recordId] = newRecord;
          });
          
          // Find links that need to be removed (existing entries not in new data)
          Object.entries(existingSummaryEntries).forEach(([entryKey, recordId]) => {
            // If the record ID is not in our new map, this link needs to be removed
            if (!newRecordsMap[recordId]) {
              const [summaryKey, courseCode] = entryKey.split('/');
              studentSummaryUpdates[`${summaryKey}/pasiRecords/${courseCode}`] = null;
              stats.removedLinks++;
            }
          });
          
          // Log the number of ASNs with missing emails
          if (asnsWithMissingEmails.size > 0) {
            console.warn(`${asnsWithMissingEmails.size} ASNs couldn't be matched to emails:`, 
              Array.from(asnsWithMissingEmails).slice(0, 10).join(', ') + 
              (asnsWithMissingEmails.size > 10 ? '...' : '')
            );
          }
          
          // Set preview data with enhanced statistics
          const changePreview = {
            newRecordsMap,
            studentSummaryUpdates,
            stats,
            recordsBeingRemoved: stats.removed,
            totalChanges: stats.new + stats.updated + stats.removed,
            totalLinks: stats.linked,
            newLinks: stats.newLinks,
            removedLinks: stats.removedLinks,
            duplicateCount: stats.duplicates,
            hasReferenceNumber: hasReferenceNumber,
            missingFields: missingFields,
            allFieldsPresent: missingFields.length === 0,
            missingEmails: asnsWithMissingEmails.size,
            asnsWithMissingEmails: Array.from(asnsWithMissingEmails).slice(0, 20) // Include first 20 for display
          };
          
          setChangePreview(changePreview);
          setShowPreview(true);
          setIsProcessing(false);
          resolve(changePreview);
        } catch (error) {
          console.error('Error processing CSV:', error);
          setIsProcessing(false);
          reject(error);
        }
      },
      error: (error) => {
        console.error('Papa Parse error:', error);
        setIsProcessing(false);
        reject(error);
      }
    };
  
    Papa.parse(file, config);
  });
};

/**
 * Apply changes from processed CSV to the database
 * @param {Object} changePreview - The preview of changes to apply
 * @param {Object} context - Context object with dependencies
 * @returns {Promise} Promise that resolves when changes are applied
 */
export const applyChanges = async (changePreview, context) => {
  const { setShowPreview, setIsProcessing, selectedSchoolYear, refreshStudentSummaries } = context;
  
  if (!changePreview || !changePreview.newRecordsMap) {
    throw new Error('No changes to apply');
  }
  
  // Close the dialog immediately
  setShowPreview(false);
  
  // Show a toast to indicate background processing
  const progressToast = toast.loading("Processing changes in the background...", {
    duration: Infinity,
    id: "pasi-upload-progress"
  });
  
  setIsProcessing(true);
  try {
    const db = getDatabase();
    const { newRecordsMap, studentSummaryUpdates, stats } = changePreview;
    const formattedYear = formatSchoolYear(selectedSchoolYear);
    
    // Simplified approach: Replace all PASI records for this school year
    // Step 1: Get all existing records for this school year
    const pasiRef = ref(db, 'pasiRecords');
    const schoolYearQuery = query(
      pasiRef,
      orderByChild('schoolYear'),
      equalTo(formattedYear)
    );
    
    const snapshot = await get(schoolYearQuery);
    const recordsToDelete = [];
    
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        const recordId = child.key;
        // If record exists in DB but not in our new set, it needs to be deleted
        if (!newRecordsMap[recordId]) {
          recordsToDelete.push({
            id: recordId,
            ...child.val()
          });
        }
      });
    }
    
    // Step 2: Process in batches to respect Firebase limits
    const BATCH_SIZE = 400;
    let batchCount = 0;
    let operationsProcessed = 0;
    
    // Helper function to create flushable batches with validation
    const createBatch = (operations) => {
      const updates = {};
      operations.forEach(op => {
        // Skip operations with undefined values
        if (op.value === undefined) {
          console.warn(`Skipping operation with undefined value for path: ${op.path}`);
          return;
        }
        
        // For objects, validate all properties to avoid Firebase errors
        if (op.value !== null && typeof op.value === 'object') {
          // Create a clean copy to avoid mutating the original
          const cleanValue = { ...op.value };
          
          // Check for and remove undefined values in the object
          Object.keys(cleanValue).forEach(key => {
            if (cleanValue[key] === undefined) {
              console.warn(`Removing undefined property ${key} from object at path: ${op.path}`);
              delete cleanValue[key];
            }
          });
          
          // Check if multipleRecords exists but is empty or has only one item
          if (cleanValue.multipleRecords && cleanValue.multipleRecords.length <= 1) {
            console.log(`Removing unnecessary multipleRecords array for record at path: ${op.path}`);
            delete cleanValue.multipleRecords;
          }
          
          updates[op.path] = cleanValue;
        } else {
          updates[op.path] = op.value;
        }
      });
      
      return updates;
    };
    
    // Collect all operations
    const allOperations = [];
    
    // Add all new/updated records
    Object.entries(newRecordsMap).forEach(([recordId, record]) => {
      // Create a clean copy of the record
      const cleanRecord = { ...record };
      
      // Only include multipleRecords if it has multiple items
      if (cleanRecord.multipleRecords && cleanRecord.multipleRecords.length <= 1) {
        delete cleanRecord.multipleRecords;
      }
      
      allOperations.push({ 
        path: `pasiRecords/${recordId}`,
        value: cleanRecord
      });
    });
    
    // Add all deletions
    recordsToDelete.forEach(record => {
      allOperations.push({
        path: `pasiRecords/${record.id}`,
        value: null
      });
    });
    
    // Add all student summary updates. This is where we update studentCourseSummaries records 
    if (studentSummaryUpdates) {
      Object.entries(studentSummaryUpdates).forEach(([path, value]) => {
        const fullPath = `studentCourseSummaries/${path}`;
        console.log(`Adding update for: ${fullPath}`, value);
        allOperations.push({
          path: fullPath,
          value
        });
      });
    }
    
    // Split into batches
    const batches = [];
    for (let i = 0; i < allOperations.length; i += BATCH_SIZE) {
      batches.push(allOperations.slice(i, i + BATCH_SIZE));
    }
    
    // Process batches sequentially
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const batchNumber = i + 1;
      const totalBatches = batches.length;
      
      // Show progress toast
      toast.loading(`Processing batch ${batchNumber}/${totalBatches}...`, {
        id: progressToast
      });
      
      const updates = createBatch(batch);
      
      // Only proceed if there are actual updates to make
      if (Object.keys(updates).length > 0) {
        // Apply this batch of updates
        await update(ref(db), updates);
      }
      
      batchCount++;
      operationsProcessed += Object.keys(updates).length;
      
      // Small delay between batches to reduce load
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    // Dismiss the progress toast
    toast.dismiss(progressToast);
    
    // Refresh data from context
    refreshStudentSummaries();
    
    // Construct a detailed success message
    const summaryUpdateCount = studentSummaryUpdates ? Object.keys(studentSummaryUpdates).length : 0;
    const totalChanges = stats.new + stats.updated + stats.removed;
    
    let successMessage = `Updated PASI records for ${selectedSchoolYear}: ${totalChanges} changes applied`;
    
    if (stats.linked > 0) {
      successMessage += ` with ${stats.linked} linked records`;
    }
    
    if (stats.newLinks > 0 || stats.removedLinks > 0) {
      successMessage += ` (${stats.newLinks} new links, ${stats.removedLinks} removed links)`;
    }
    
    if (summaryUpdateCount > 0) {
      successMessage += `. Updated ${summaryUpdateCount} student course summaries.`;
    }
    
    toast.success(successMessage);
    return true;
  } catch (error) {
    console.error('Error updating records:', error);
    toast.error(error.message || 'Failed to update records');
    toast.dismiss(progressToast);
    return false;
  } finally {
    setIsProcessing(false);
  }
};

/**
 * Helper function for getting course IDs associated with a PASI code
 */
export const getCourseIdsForPasiCode = (pasiCode) => {
  // This would normally be implemented based on your course mappings
  return [];
};

/**
 * Helper function for PASI link creation
 */
export const processPasiLinkCreation = async (linkData) => {
  try {
    const db = getDatabase();
    
    if (!linkData || !linkData.pasiRecordId || !linkData.summaryKey) {
      console.error('Missing required data for PASI link creation', linkData);
      return false;
    }
    
    // Update the PASI record to link it to the student summary
    const pasiRecordRef = ref(db, `pasiRecords/${linkData.pasiRecordId}`);
    const pasiUpdates = {
      linked: true,
      linkedAt: new Date().toISOString(),
      summaryKey: linkData.summaryKey
    };
    
    await update(pasiRecordRef, pasiUpdates);
    
    // Also update the student summary with PASI record info
    if (linkData.summaryKey && linkData.courseCode) {
      const summaryRef = ref(db, `studentCourseSummaries/${linkData.summaryKey}`);
      const courseCode = linkData.courseCode.toLowerCase();
      
      const summaryUpdates = {};
      summaryUpdates[`pasiRecords/${courseCode}`] = {
        courseDescription: linkData.courseDescription || '',
        creditsAttempted: linkData.creditsAttempted || '',
        term: linkData.term || '',
        period: linkData.period || 'Regular',
        schoolYear: linkData.schoolYear || '',
        studentName: linkData.studentName || '',
        pasiRecordID: linkData.pasiRecordId
      };
      
      await update(summaryRef, summaryUpdates);
    }
    
    return true;
  } catch (error) {
    console.error('Error creating PASI link:', error);
    return false;
  }
};

/**
 * Helper function for PASI record deletions
 */
export const processPasiRecordDeletions = async (records) => {
  if (!records || !records.length) return false;
  
  try {
    const db = getDatabase();
    const updates = {};
    
    // Remove links from student summaries
    for (const record of records) {
      if (record.linked && record.summaryKey && record.courseCode) {
        // Remove reference in student summary
        updates[`studentCourseSummaries/${record.summaryKey}/pasiRecords/${record.courseCode.toLowerCase()}`] = null;
      }
      
      // Mark record as unlinked
      if (record.id) {
        updates[`pasiRecords/${record.id}/linked`] = false;
        updates[`pasiRecords/${record.id}/summaryKey`] = null;
      }
    }
    
    // Apply all updates in a single transaction
    if (Object.keys(updates).length > 0) {
      await update(ref(db), updates);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting PASI records:', error);
    return false;
  }
};