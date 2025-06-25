// functions/courseConfig.js
const { onCall } = require('firebase-functions/v2/https');
const { getDatabase } = require('firebase-admin/database');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * Fetches course configuration from the functions/courses-config directory
 * This is a read-only function to display hardcoded course settings
 */
exports.getCourseConfigV2 = onCall(async (request) => {
  try {
    const { courseId } = request.data;
    
    if (!courseId) {
      throw new Error('Course ID is required');
    }

    // Construct the path to the course config file
    const configPath = path.join(__dirname, 'courses-config', courseId.toString(), 'course-config.json');
    
    try {
      // Read the configuration file
      const configData = await fs.readFile(configPath, 'utf8');
      const courseConfig = JSON.parse(configData);
      
      return {
        success: true,
        courseConfig,
        configPath: `functions/courses-config/${courseId}/course-config.json`
      };
    } catch (error) {
      // If file doesn't exist, return a clear message
      if (error.code === 'ENOENT') {
        return {
          success: false,
          error: 'Course configuration not found',
          message: `No configuration file found at functions/courses-config/${courseId}/course-config.json`,
          configPath: `functions/courses-config/${courseId}/course-config.json`
        };
      }
      
      // For other errors (like JSON parsing), throw them
      throw error;
    }
  } catch (error) {
    console.error('Error fetching course config:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

/**
 * Syncs course configuration from files to Realtime Database
 * Supports syncing individual courses or all courses with change detection
 */
exports.syncCourseConfigToDatabase = onCall(async (request) => {
  try {
    const { courseId, syncAll = false, force = false } = request.data;
    
    // Basic validation
    if (!courseId && !syncAll) {
      throw new Error('Either courseId or syncAll must be specified');
    }

    if (courseId && syncAll) {
      throw new Error('Cannot specify both courseId and syncAll');
    }

    const db = getDatabase();
    const results = [];

    if (syncAll) {
      // Get list of all course directories
      const coursesConfigDir = path.join(__dirname, 'courses-config');
      
      try {
        const courseDirectories = await fs.readdir(coursesConfigDir);
        const validCourseIds = [];
        
        // Filter for valid course directories (numeric IDs)
        for (const dir of courseDirectories) {
          const dirPath = path.join(coursesConfigDir, dir);
          const stat = await fs.stat(dirPath);
          if (stat.isDirectory() && /^\d+$/.test(dir)) {
            validCourseIds.push(dir);
          }
        }

        // Sync each course
        for (const id of validCourseIds) {
          try {
            const result = await syncSingleCourse(db, id, force);
            results.push({ courseId: id, ...result });
          } catch (error) {
            results.push({
              courseId: id,
              success: false,
              error: error.message
            });
          }
        }
      } catch (error) {
        throw new Error(`Failed to read courses-config directory: ${error.message}`);
      }
    } else {
      // Sync single course
      const result = await syncSingleCourse(db, courseId.toString(), force);
      results.push({ courseId, ...result });
    }

    return {
      success: true,
      message: `Successfully processed ${results.length} course(s)`,
      results
    };

  } catch (error) {
    console.error('Error syncing course config:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

/**
 * Helper function to sync a single course configuration
 */
async function syncSingleCourse(db, courseId, force = false) {
  try {
    // Read the course configuration file
    const configPath = path.join(__dirname, 'courses-config', courseId, 'course-config.json');
    
    let configData;
    try {
      const configFileContent = await fs.readFile(configPath, 'utf8');
      configData = JSON.parse(configFileContent);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return {
          success: false,
          error: `No configuration file found for course ${courseId}`,
          skipped: true
        };
      }
      throw new Error(`Failed to read/parse config file: ${error.message}`);
    }

    // Calculate content hash for change detection
    const configString = JSON.stringify(configData, null, 2);
    const contentHash = crypto.createHash('sha256').update(configString).digest('hex');

    // Check if update is needed (unless forced)
    if (!force) {
      try {
        const versionControlRef = db.ref(`courses/${courseId}/course-config-version-control`);
        const existingVersionData = await versionControlRef.once('value');
        const existingVersion = existingVersionData.val();

        if (existingVersion && existingVersion.contentHash === contentHash) {
          return {
            success: true,
            message: 'No changes detected, skipping update',
            skipped: true,
            version: existingVersion.version,
            lastSynced: existingVersion.lastSynced
          };
        }
      } catch (error) {
        console.log(`No existing version data for course ${courseId}, proceeding with sync`);
      }
    }

    // Prepare version control metadata
    const versionControlData = {
      version: configData.metadata?.version || '1.0.0',
      contentHash,
      lastSynced: new Date().toISOString(),
      syncedFrom: `functions/courses-config/${courseId}/course-config.json`,
      fileModified: configData.metadata?.lastModified || null,
      originalVersion: configData.metadata?.version || null
    };

    // Update database in transaction
    const courseConfigRef = db.ref(`courses/${courseId}/course-config`);
    const versionControlRef = db.ref(`courses/${courseId}/course-config-version-control`);

    // Remove metadata from config data before storing
    const { metadata, ...cleanConfigData } = configData;

    // Update both paths
    await Promise.all([
      courseConfigRef.set(cleanConfigData),
      versionControlRef.set(versionControlData)
    ]);

    return {
      success: true,
      message: 'Configuration synced successfully',
      updated: true,
      version: versionControlData.version,
      contentHash,
      lastSynced: versionControlData.lastSynced,
      configPath: `functions/courses-config/${courseId}/course-config.json`
    };

  } catch (error) {
    console.error(`Error syncing course ${courseId}:`, error);
    throw error;
  }
}