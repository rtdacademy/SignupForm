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

    // Get existing version control data to check for changes and increment version
    let existingVersion = null;
    let newVersion = '1.0.0';
    
    try {
      const versionControlRef = db.ref(`courses/${courseId}/course-config-version-control`);
      const existingVersionData = await versionControlRef.once('value');
      existingVersion = existingVersionData.val();

      if (existingVersion) {
        // Check if update is needed (unless forced)
        if (!force && existingVersion.contentHash === contentHash) {
          return {
            success: true,
            message: 'No changes detected, skipping update',
            skipped: true,
            version: existingVersion.version,
            lastSynced: existingVersion.lastSynced
          };
        }
        
        // Auto-increment version number
        const currentVersion = existingVersion.version || '1.0.0';
        const versionParts = currentVersion.split('.').map(Number);
        versionParts[2] = (versionParts[2] || 0) + 1; // Increment patch version
        newVersion = versionParts.join('.');
      }
    } catch (error) {
      console.log(`No existing version data for course ${courseId}, starting with v1.0.0`);
    }

    // Prepare version control metadata with auto-incremented version
    const versionControlData = {
      version: newVersion,
      contentHash,
      lastSynced: new Date().toISOString(),
      syncedFrom: `functions/courses-config/${courseId}/course-config.json`,
      changesSince: existingVersion?.version || 'Initial sync',
      syncCount: (existingVersion?.syncCount || 0) + 1
    };

    // Update database in transaction
    const courseConfigRef = db.ref(`courses/${courseId}/course-config`);
    const versionControlRef = db.ref(`courses/${courseId}/course-config-version-control`);
    const courseTitleRef = db.ref(`courses/${courseId}/Title`);

    // Prepare updates - store config data and update course title if available
    const updates = [
      courseConfigRef.set(configData),
      versionControlRef.set(versionControlData)
    ];

    // If the config has a title property, also update the main course Title
    if (configData.title) {
      updates.push(courseTitleRef.set(configData.title));
    }

    await Promise.all(updates);

    return {
      success: true,
      message: configData.title ? 
        'Configuration and course title synced successfully' : 
        'Configuration synced successfully',
      updated: true,
      version: versionControlData.version,
      contentHash,
      lastSynced: versionControlData.lastSynced,
      configPath: `functions/courses-config/${courseId}/course-config.json`,
      titleUpdated: !!configData.title
    };

  } catch (error) {
    console.error(`Error syncing course ${courseId}:`, error);
    throw error;
  }
}

/**
 * Checks if course configuration file and database are in sync
 * Returns sync status without making any changes
 */
exports.checkCourseConfigSyncStatus = onCall(async (request) => {
  try {
    const { courseId } = request.data;
    
    if (!courseId) {
      throw new Error('Course ID is required');
    }

    const db = getDatabase();
    
    // Read the course configuration file
    const configPath = path.join(__dirname, 'courses-config', courseId.toString(), 'course-config.json');
    
    let fileConfig;
    try {
      const configFileContent = await fs.readFile(configPath, 'utf8');
      fileConfig = JSON.parse(configFileContent);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return {
          success: false,
          error: `No configuration file found for course ${courseId}`,
          status: 'file_not_found'
        };
      }
      throw new Error(`Failed to read config file: ${error.message}`);
    }

    // Calculate file content hash
    const fileConfigString = JSON.stringify(fileConfig, null, 2);
    const fileContentHash = crypto.createHash('sha256').update(fileConfigString).digest('hex');

    // Check database version control data
    const versionControlRef = db.ref(`courses/${courseId}/course-config-version-control`);
    const versionSnapshot = await versionControlRef.once('value');
    const versionControlData = versionSnapshot.val();

    // Check if configuration data exists in database
    const configRef = db.ref(`courses/${courseId}/course-config`);
    const configSnapshot = await configRef.once('value');
    const dbConfigExists = configSnapshot.exists();

    // Since we no longer store version in file, we'll use "File" as identifier
    const fileVersion = "File";

    if (!versionControlData || !dbConfigExists) {
      return {
        success: true,
        status: 'never_synced',
        message: 'Configuration has never been synced to database',
        fileVersion,
        dbVersion: null,
        needsSync: true
      };
    }

    const dbVersion = versionControlData.version || '1.0.0';
    const dbContentHash = versionControlData.contentHash;

    if (fileContentHash === dbContentHash) {
      return {
        success: true,
        status: 'up_to_date',
        message: 'Database is up to date with file',
        fileVersion,
        dbVersion,
        needsSync: false,
        lastSynced: versionControlData.lastSynced
      };
    } else {
      return {
        success: true,
        status: 'out_of_sync',
        message: 'Configuration file has been updated and needs syncing',
        fileVersion,
        dbVersion,
        needsSync: true,
        lastSynced: versionControlData.lastSynced
      };
    }

  } catch (error) {
    console.error('Error checking course config sync status:', error);
    return {
      success: false,
      error: error.message,
      status: 'error'
    };
  }
});