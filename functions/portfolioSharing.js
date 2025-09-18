// Portfolio Sharing Cloud Functions
// Handles public sharing of portfolio entries with secure access

const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Cloud Function: getPublicPortfolioEntry
 * Fetches public portfolio entries with signed URLs
 * This bypasses normal auth requirements for publicly shared entries
 */
const getPublicPortfolioEntry = onCall({
  memory: '512MiB',
  timeoutSeconds: 60,
  maxInstances: 100,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000", "https://3000-idx-yourway-*"],
}, async (request) => {
  const { familyId, entryId } = request.data;

  // Validate input
  if (!familyId || !entryId) {
    throw new Error('familyId and entryId are required');
  }

  try {
    // Check if entry exists and is public
    const entryRef = admin.firestore()
      .collection('portfolios')
      .doc(familyId)
      .collection('entries')
      .doc(entryId);

    const entryDoc = await entryRef.get();

    if (!entryDoc.exists) {
      throw new Error('Portfolio entry not found');
    }

    const entryData = entryDoc.data();

    // Check if entry is publicly shared
    if (!entryData.sharingSettings?.isPublic) {
      throw new Error('This portfolio entry is not publicly shared');
    }

    // Check if sharing has expired (if expiration is set)
    if (entryData.sharingSettings?.expiresAt) {
      const expirationDate = new Date(entryData.sharingSettings.expiresAt);
      if (expirationDate < new Date()) {
        throw new Error('The sharing link for this entry has expired');
      }
    }

    // Get student metadata for display
    let studentInfo = null;
    if (entryData.studentId) {
      try {
        const metadataRef = admin.firestore()
          .collection('portfolios')
          .doc(familyId)
          .collection('metadata')
          .doc(entryData.studentId);

        const metadataDoc = await metadataRef.get();
        if (metadataDoc.exists) {
          const metadata = metadataDoc.data();
          studentInfo = {
            firstName: metadata.studentName || 'Student',
            schoolYear: metadata.schoolYear
          };
        }
      } catch (err) {
        console.log('Could not fetch student metadata:', err);
        // Non-critical error, continue without student info
      }
    }

    // Generate signed URLs for files
    const files = entryData.files || [];
    const filesWithSignedUrls = await Promise.all(
      files.map(async (file) => {
        if (file.path) {
          try {
            const bucket = admin.storage().bucket();
            const storageFile = bucket.file(file.path);

            // Check if file exists
            const [exists] = await storageFile.exists();
            if (!exists) {
              console.log(`File not found: ${file.path}`);
              return { ...file, url: null, error: 'File not found' };
            }

            // Generate signed URL with 7-day expiration
            const [signedUrl] = await storageFile.getSignedUrl({
              action: 'read',
              expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            return { ...file, url: signedUrl };
          } catch (err) {
            console.error(`Error generating signed URL for ${file.path}:`, err);
            return { ...file, url: null, error: 'Could not generate download link' };
          }
        }
        return file;
      })
    );

    // Log access for analytics (optional)
    try {
      await admin.firestore()
        .collection('portfolios')
        .doc(familyId)
        .collection('entries')
        .doc(entryId)
        .collection('accessLogs')
        .add({
          accessedAt: process.env.FUNCTIONS_EMULATOR
            ? new Date().toISOString()
            : admin.firestore.FieldValue.serverTimestamp(),
          accessType: 'public',
          ipAddress: request.rawRequest?.ip || 'unknown',
          userAgent: request.rawRequest?.headers['user-agent'] || 'unknown'
        });
    } catch (err) {
      console.log('Could not log access:', err);
      // Non-critical error, continue
    }

    // Return the entry data with signed URLs
    return {
      success: true,
      entry: {
        ...entryData,
        id: entryDoc.id,
        files: filesWithSignedUrls
      },
      studentInfo
    };

  } catch (error) {
    console.error('Error fetching public portfolio entry:', error);
    throw new Error(error.message || 'An error occurred while fetching the portfolio entry');
  }
});

/**
 * Cloud Function: updatePortfolioSharing
 * Toggles sharing settings for a portfolio entry
 * Only family members can change sharing settings
 */
const updatePortfolioSharing = onCall({
  memory: '256MiB',
  timeoutSeconds: 30,
  maxInstances: 50,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000", "https://3000-idx-yourway-*"],
}, async (request) => {
  // Check authentication
  if (!request.auth) {
    throw new Error('You must be logged in to change sharing settings');
  }

  const { familyId, entryId, isPublic, expiresAt } = request.data;

  // Validate input
  if (!familyId || !entryId || typeof isPublic !== 'boolean') {
    throw new Error('familyId, entryId, and isPublic are required');
  }

  // Validate expiration date if provided
  if (expiresAt && isPublic) {
    const expDate = new Date(expiresAt);
    if (isNaN(expDate.getTime())) {
      throw new Error('Invalid expiration date');
    }
    if (expDate <= new Date()) {
      throw new Error('Expiration date must be in the future');
    }
  }

  // Check permissions: user must either belong to the family or be staff
  const isStaff = request.auth.token.email &&
    (request.auth.token.email.endsWith('@rtdacademy.com') ||
     request.auth.token.email.endsWith('@rtd-connect.com'));

  const userFamilyId = request.auth.token.familyId;

  if (!isStaff && userFamilyId !== familyId) {
    throw new Error('You do not have permission to modify this portfolio');
  }

  try {
    const entryRef = admin.firestore()
      .collection('portfolios')
      .doc(familyId)
      .collection('entries')
      .doc(entryId);

    // Update sharing settings
    // Use serverTimestamp in production, fallback to Date for emulator
    const timestamp = process.env.FUNCTIONS_EMULATOR
      ? new Date().toISOString()
      : admin.firestore.FieldValue.serverTimestamp();

    const sharingSettings = {
      isPublic,
      sharedAt: isPublic ? timestamp : null,
      sharedBy: isPublic ? request.auth.uid : null,
      expiresAt: isPublic && expiresAt ? expiresAt : null,
      modifiedAt: timestamp,
      modifiedBy: request.auth.uid
    };

    await entryRef.update({
      sharingSettings,
      lastModified: process.env.FUNCTIONS_EMULATOR
        ? new Date().toISOString()
        : admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      sharingSettings
    };

  } catch (error) {
    console.error('Error updating sharing settings:', error);
    throw new Error('Failed to update sharing settings');
  }
});

/**
 * Cloud Function: getPublicPortfolio
 * Fetches a specific public portfolio/course with its structure and entries
 */
const getPublicPortfolio = onCall({
  memory: '1GiB',
  timeoutSeconds: 60,
  maxInstances: 100,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000", "https://3000-idx-yourway-*"],
}, async (request) => {
  const { familyId, courseId } = request.data;

  // Validate input
  if (!familyId || !courseId) {
    throw new Error('familyId and courseId are required');
  }

  try {
    // Get the course/portfolio structure item
    const courseRef = admin.firestore()
      .collection('portfolios')
      .doc(familyId)
      .collection('structure')
      .doc(courseId);

    const courseDoc = await courseRef.get();

    if (!courseDoc.exists) {
      throw new Error('Portfolio/Course not found');
    }

    const courseData = courseDoc.data();

    // Check if this course/portfolio is publicly shared
    if (!courseData.sharingSettings?.isPublic) {
      throw new Error('This portfolio/course is not publicly shared');
    }

    // Check if sharing has expired
    if (courseData.sharingSettings?.expiresAt) {
      const expirationDate = new Date(courseData.sharingSettings.expiresAt);
      if (expirationDate < new Date()) {
        throw new Error('The sharing link for this portfolio/course has expired');
      }
    }

    // Get all child structure items for this course
    const structureSnapshot = await admin.firestore()
      .collection('portfolios')
      .doc(familyId)
      .collection('structure')
      .where('parentId', '==', courseId)
      .where('isArchived', '!=', true)
      .get();

    const structure = [{ id: courseDoc.id, ...courseData }];
    structureSnapshot.forEach(doc => {
      structure.push({ id: doc.id, ...doc.data() });
    });

    // Get all entries for this course and its children
    const structureIds = structure.map(s => s.id);
    const entriesSnapshot = await admin.firestore()
      .collection('portfolios')
      .doc(familyId)
      .collection('entries')
      .where('structureId', 'in', structureIds)
      .where('isArchived', '!=', true)
      .get();

    const entries = [];
    const bucket = admin.storage().bucket();

    // Process entries and generate signed URLs for files
    await Promise.all(
      entriesSnapshot.docs.map(async (doc) => {
        const entryData = { id: doc.id, ...doc.data() };

        // Include all entries when the course is public (simplified logic)
        // If a course is public, all its entries should be visible
        if (courseData.sharingSettings?.isPublic) {
          // Generate signed URLs for files
          if (entryData.files && entryData.files.length > 0) {
            const filesWithSignedUrls = await Promise.all(
              entryData.files.map(async (file) => {
                if (file.path) {
                  try {
                    const storageFile = bucket.file(file.path);
                    const [exists] = await storageFile.exists();

                    if (!exists) {
                      return { ...file, url: null, error: 'File not found' };
                    }

                    const [signedUrl] = await storageFile.getSignedUrl({
                      action: 'read',
                      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
                    });

                    return { ...file, url: signedUrl };
                  } catch (err) {
                    console.error(`Error generating signed URL for ${file.path}:`, err);
                    return { ...file, url: null, error: 'Could not generate download link' };
                  }
                }
                return file;
              })
            );
            entryData.files = filesWithSignedUrls;
          }

          entries.push(entryData);
        }
      })
    );

    // Get student metadata for display
    const studentId = courseData.studentId;
    let studentInfo = null;
    if (studentId) {
      try {
        const metadataRef = admin.firestore()
          .collection('portfolios')
          .doc(familyId)
          .collection('metadata')
          .doc(studentId);

        const metadataDoc = await metadataRef.get();
        if (metadataDoc.exists) {
          const metadata = metadataDoc.data();
          studentInfo = {
            studentName: metadata.studentName || 'Student',
            schoolYear: metadata.schoolYear
          };
        }
      } catch (err) {
        console.log('Could not fetch student metadata:', err);
      }
    }

    // Log access for analytics
    try {
      await admin.firestore()
        .collection('portfolios')
        .doc(familyId)
        .collection('structure')
        .doc(courseId)
        .collection('accessLogs')
        .add({
          accessedAt: process.env.FUNCTIONS_EMULATOR
            ? new Date().toISOString()
            : admin.firestore.FieldValue.serverTimestamp(),
          accessType: 'public-portfolio',
          ipAddress: request.rawRequest?.ip || 'unknown',
          userAgent: request.rawRequest?.headers['user-agent'] || 'unknown'
        });
    } catch (err) {
      console.log('Could not log access:', err);
    }

    // Return portfolio data
    return {
      success: true,
      portfolio: {
        courseTitle: courseData.title || 'Portfolio',
        courseId,
        studentName: studentInfo?.studentName || 'Student',
        schoolYear: studentInfo?.schoolYear,
        sharingSettings: courseData.sharingSettings
      },
      structure,
      entries
    };

  } catch (error) {
    console.error('Error fetching public portfolio:', error);
    throw new Error(error.message || 'An error occurred while fetching the portfolio');
  }
});

/**
 * Cloud Function: updatePortfolioLevelSharing
 * Updates course/portfolio-level sharing settings
 */
const updatePortfolioLevelSharing = onCall({
  memory: '256MiB',
  timeoutSeconds: 30,
  maxInstances: 50,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000", "https://3000-idx-yourway-*"],
}, async (request) => {
  // Check authentication
  if (!request.auth) {
    throw new Error('You must be logged in to change sharing settings');
  }

  const { familyId, courseId, isPublic, expiresAt, includeAllEntries } = request.data;

  // Validate input
  if (!familyId || !courseId || typeof isPublic !== 'boolean') {
    throw new Error('familyId, courseId, and isPublic are required');
  }

  // Check permissions
  const isStaff = request.auth.token.email &&
    (request.auth.token.email.endsWith('@rtdacademy.com') ||
     request.auth.token.email.endsWith('@rtd-connect.com'));

  const userFamilyId = request.auth.token.familyId;

  if (!isStaff && userFamilyId !== familyId) {
    throw new Error('You do not have permission to modify this portfolio');
  }

  // Validate expiration date if provided
  if (expiresAt && isPublic) {
    const expDate = new Date(expiresAt);
    if (isNaN(expDate.getTime())) {
      throw new Error('Invalid expiration date');
    }
    if (expDate <= new Date()) {
      throw new Error('Expiration date must be in the future');
    }
  }

  try {
    const courseRef = admin.firestore()
      .collection('portfolios')
      .doc(familyId)
      .collection('structure')
      .doc(courseId);

    // Use serverTimestamp in production, fallback to Date for emulator
    const timestamp = process.env.FUNCTIONS_EMULATOR
      ? new Date().toISOString()
      : admin.firestore.FieldValue.serverTimestamp();

    const sharingSettings = {
      isPublic,
      sharedAt: isPublic ? timestamp : null,
      sharedBy: isPublic ? request.auth.uid : null,
      expiresAt: isPublic && expiresAt ? expiresAt : null,
      includeAllEntries: isPublic && includeAllEntries ? includeAllEntries : false,
      modifiedAt: timestamp,
      modifiedBy: request.auth.uid
    };

    await courseRef.update({
      sharingSettings,
      lastModified: timestamp
    });

    return {
      success: true,
      sharingSettings
    };

  } catch (error) {
    console.error('Error updating course/portfolio sharing settings:', error);
    throw new Error('Failed to update course/portfolio sharing settings');
  }
});

// Export functions
module.exports = {
  getPublicPortfolioEntry,
  updatePortfolioSharing,
  getPublicPortfolio,
  updatePortfolioLevelSharing
};