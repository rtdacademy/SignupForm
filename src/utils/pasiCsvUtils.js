import { getDatabase, ref, get, update, query, orderByChild, equalTo } from 'firebase/database';
import { toast } from 'sonner';

/**
 * Process PASI CSV data for records management
 * 
 * @param {Array} csvData Raw data from CSV
 * @param {string} schoolYear Selected school year
 * @param {Object} asnEmails ASN to email mapping
 * @returns {Object} Processed data with stats
 */
export const processPasiCsvData = async (csvData, schoolYear, asnEmails = {}) => {
  if (!csvData || !csvData.length) {
    throw new Error('No data provided');
  }
  
  if (!schoolYear) {
    throw new Error('School year is required');
  }
  
  // Format school year for database
  const formattedYear = formatSchoolYear(schoolYear);
  
  try {
    // Fetch existing records to compare
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
    
    // Process CSV into new records
    const newRecordsMap = {};
    const stats = {
      total: csvData.length,
      new: 0,
      updated: 0,
      linked: 0,
      unchanged: 0,
      removed: Object.keys(existingRecords).length,
      duplicates: 0
    };
    
    // Check for duplicates first
    const recordsWithMultipleVersions = {};
    
    csvData.forEach(row => {
      const asn = row['ASN']?.trim() || '';
      const courseCode = row[' Code']?.trim().toUpperCase() || '';
      const period = row['Period']?.trim() || 'Regular';
      const recordId = `${asn}_${courseCode.toLowerCase()}_${formattedYear}_${period.toLowerCase()}`;
      
      if (!recordsWithMultipleVersions[recordId]) {
        recordsWithMultipleVersions[recordId] = [];
      }
      
      recordsWithMultipleVersions[recordId].push(row);
    });
    
    // Count duplicates
    Object.keys(recordsWithMultipleVersions).forEach(recordId => {
      if (recordsWithMultipleVersions[recordId].length > 1) {
        stats.duplicates++;
      }
    });
    
    // Process each unique record
    const processedRecords = [];
    
    Object.entries(recordsWithMultipleVersions).forEach(([recordId, rows]) => {
      // Get the primary row (first one)
      const primaryRow = rows[0];
      
      const asn = primaryRow['ASN']?.trim() || '';
      const email = asnEmails[asn] || '-';
      const courseCode = primaryRow[' Code']?.trim().toUpperCase() || '';
      const period = primaryRow['Period']?.trim() || 'Regular';
      
      // Create new record object from CSV data
      const newRecord = {
        asn,
        email,
        matchStatus: asnEmails[asn] ? 'Found in Database' : 'Not Found',
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
        lastUpdated: new Date().toISOString(),
        id: recordId
      };
      
      // Handle multiple records if present
      if (rows.length > 1) {
        newRecord.multipleRecords = rows.map(row => ({
          referenceNumber: row['Reference #']?.trim() || null,
          term: row['Term']?.trim() || null,
          status: row['Status']?.trim() || null,
          exitDate: row['Exit Date']?.trim() || '-',
          deleted: row['Deleted?']?.trim() || null,
          approved: row['Approved?']?.trim() || null,
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
      }
      
      // Check if record already exists to preserve link metadata
      if (existingRecords[recordId]) {
        stats.removed--; // Not actually removing this one
        
        // Preserve critical metadata
        newRecord.linked = existingRecords[recordId].linked === true;
        newRecord.linkedAt = existingRecords[recordId].linkedAt || null;
        newRecord.summaryKey = existingRecords[recordId].summaryKey || null;
        
        // If already linked, count it
        if (newRecord.linked) {
          stats.linked++;
        }
        
        // Check if anything changed
        const recordChanged = hasRecordChanged(existingRecords[recordId], newRecord);
        if (recordChanged) {
          stats.updated++;
          newRecord._status = 'updated';
        } else {
          stats.unchanged++;
          newRecord._status = 'unchanged';
        }
      } else {
        // This is a brand new record
        stats.new++;
        
        // Initialize link status
        newRecord.linked = false;
        newRecord.linkedAt = null;
        newRecord.summaryKey = null;
        newRecord._status = 'new';
      }
      
      // Add to new records map
      newRecordsMap[recordId] = newRecord;
      
      // Add to processed records for preview
      processedRecords.push(newRecord);
    });
    
    return {
      processedRecords,
      newRecordsMap,
      stats,
      recordsBeingRemoved: stats.removed,
      totalChanges: stats.new + stats.updated + stats.removed
    };
  } catch (error) {
    console.error('Error processing CSV data:', error);
    throw new Error(`Failed to process CSV data: ${error.message}`);
  }
};

/**
 * Save processed PASI records to Firebase
 * 
 * @param {Object} data Processed data from processPasiCsvData
 * @returns {Promise} Firebase update result
 */
export const savePasiRecords = async (data) => {
  if (!data || !data.newRecordsMap) {
    throw new Error('Invalid data provided');
  }
  
  try {
    const db = getDatabase();
    const { newRecordsMap } = data;
    
    // Process in batches to respect Firebase limits
    const BATCH_SIZE = 400;
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
              delete cleanValue[key];
            }
          });
          
          // Check if multipleRecords exists but is empty or has only one item
          if (cleanValue.multipleRecords && cleanValue.multipleRecords.length <= 1) {
            delete cleanValue.multipleRecords;
          }
          
          // Remove internal status flag used for preview
          if (cleanValue._status) {
            delete cleanValue._status;
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
      
      // Remove internal status flag
      if (cleanRecord._status) {
        delete cleanRecord._status;
      }
      
      // Only include multipleRecords if it has multiple items
      if (cleanRecord.multipleRecords && cleanRecord.multipleRecords.length <= 1) {
        delete cleanRecord.multipleRecords;
      }
      
      allOperations.push({ 
        path: `pasiRecords/${recordId}`,
        value: cleanRecord
      });
    });
    
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
      
      toast.loading(`Processing batch ${batchNumber}/${totalBatches}...`, {
        id: `batch-${batchNumber}`,
        duration: 3000
      });
      
      const updates = createBatch(batch);
      
      // Only proceed if there are actual updates to make
      if (Object.keys(updates).length > 0) {
        // Apply this batch of updates
        await update(ref(getDatabase()), updates);
      }
      
      operationsProcessed += batch.length;
      
      // Small delay between batches to reduce load
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    return {
      success: true,
      operationsProcessed,
      stats: data.stats
    };
  } catch (error) {
    console.error('Error saving records:', error);
    throw new Error(`Failed to save records: ${error.message}`);
  }
};

/**
 * Formats school year string for database (e.g., "23/24" to "23_24")
 * 
 * @param {string} year School year in format "23/24"
 * @returns {string} Formatted school year "23_24"
 */
export const formatSchoolYear = (year) => {
  return year.replace('/', '_');
};

/**
 * Checks if a record has changed compared to existing record
 * 
 * @param {Object} existingRecord Existing record from database
 * @param {Object} newRecord New record from CSV
 * @returns {boolean} True if record has changed
 */
const hasRecordChanged = (existingRecord, newRecord) => {
  // Fields to compare (only the ones that come from CSV)
  const fieldsToCompare = [
    'asn', 'studentName', 'courseCode', 'courseDescription', 
    'status', 'period', 'value', 'approved', 'assignmentDate', 
    'creditsAttempted', 'deleted', 'dualEnrolment', 'exitDate', 
    'fundingRequested', 'term', 'referenceNumber', 'workItems',
    'schoolEnrolment'
  ];
  
  return fieldsToCompare.some(field => existingRecord[field] !== newRecord[field]);
};