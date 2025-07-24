// functions/retrieveAuthActivityLogs.js
const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Import Google Cloud Logging (will need to add to package.json)
const { Logging } = require('@google-cloud/logging');

// Retrieve Firebase Identity Platform authentication activity logs
exports.retrieveAuthActivityLogs = onCall({
  cors: true,
  region: 'us-central1'
}, async (request) => {
  const { uid, email, startDate, endDate, limit = 100 } = request.data;
  const callerUid = request.auth?.uid;
  
  // Verify the caller is staff
  if (!callerUid) {
    throw new Error('Authentication required');
  }
  
  const callerEmail = request.auth.token.email || '';
  const isStaff = callerEmail.endsWith('@rtdacademy.com');
  
  if (!isStaff) {
    throw new Error('Unauthorized: Staff access required');
  }
  
  try {
    // Initialize Google Cloud Logging
    const logging = new Logging({
      projectId: 'rtd-academy'
    });
    
    // Build the filter for Identity Toolkit logs
    let filter = `
      logName="projects/rtd-academy/logs/identitytoolkit.googleapis.com/requests"
      AND resource.type="identitytoolkit_project"
    `;
    
    // Add time range filter
    if (startDate && endDate) {
      filter += ` AND timestamp >= "${startDate}" AND timestamp <= "${endDate}"`;
    }
    
    // Add user-specific filter if uid or email provided
    if (uid) {
      filter += ` AND (jsonPayload.request.localId="${uid}" OR jsonPayload.response.localId="${uid}")`;
    } else if (email) {
      filter += ` AND (jsonPayload.request.email="${email}" OR jsonPayload.response.email="${email}")`;
    }
    
    // Get the logs
    const [entries] = await logging.getEntries({
      filter: filter,
      pageSize: limit,
      orderBy: 'timestamp desc'
    });
    
    // Process and format the log entries
    const processedLogs = entries.map(entry => {
      const metadata = entry.metadata;
      const data = entry.data;
      
      return {
        timestamp: metadata.timestamp,
        severity: metadata.severity,
        methodName: data.methodName,
        userAgent: data.request?.userAgent,
        ip: data.request?.ip,
        request: {
          email: data.request?.email,
          uid: data.request?.localId,
          requestType: data.request?.requestType,
          returnSecureToken: data.request?.returnSecureToken
        },
        response: {
          email: data.response?.email,
          uid: data.response?.localId,
          registered: data.response?.registered,
          kind: data.response?.kind
        },
        error: data.error ? {
          code: data.error.code,
          message: data.error.message,
          status: data.error.status
        } : null,
        insertId: metadata.insertId,
        labels: metadata.labels
      };
    });
    
    // Group by event types for summary
    const eventSummary = processedLogs.reduce((acc, log) => {
      const method = log.methodName || 'unknown';
      const eventType = getEventTypeFromMethod(method);
      
      if (!acc[eventType]) {
        acc[eventType] = {
          count: 0,
          lastOccurrence: null,
          successCount: 0,
          errorCount: 0
        };
      }
      
      acc[eventType].count++;
      acc[eventType].lastOccurrence = log.timestamp;
      
      if (log.error) {
        acc[eventType].errorCount++;
      } else {
        acc[eventType].successCount++;
      }
      
      return acc;
    }, {});
    
    return {
      success: true,
      logs: processedLogs,
      summary: {
        totalEvents: processedLogs.length,
        dateRange: {
          start: startDate,
          end: endDate
        },
        eventTypes: eventSummary,
        user: {
          uid: uid,
          email: email
        }
      }
    };
    
  } catch (error) {
    console.error('Error retrieving auth activity logs:', error);
    throw new Error(`Failed to retrieve auth logs: ${error.message}`);
  }
});

// Get authentication activity summary for multiple users
exports.getAuthActivitySummary = onCall({
  cors: true,
  region: 'us-central1'
}, async (request) => {
  const { startDate, endDate, limit = 1000 } = request.data;
  const callerUid = request.auth?.uid;
  
  // Verify the caller is staff
  if (!callerUid) {
    throw new Error('Authentication required');
  }
  
  const callerEmail = request.auth.token.email || '';
  const isStaff = callerEmail.endsWith('@rtdacademy.com');
  
  if (!isStaff) {
    throw new Error('Unauthorized: Staff access required');
  }
  
  try {
    const logging = new Logging({
      projectId: 'rtd-academy'
    });
    
    let filter = `
      logName="projects/rtd-academy/logs/identitytoolkit.googleapis.com/requests"
      AND resource.type="identitytoolkit_project"
    `;
    
    if (startDate && endDate) {
      filter += ` AND timestamp >= "${startDate}" AND timestamp <= "${endDate}"`;
    }
    
    const [entries] = await logging.getEntries({
      filter: filter,
      pageSize: limit,
      orderBy: 'timestamp desc'
    });
    
    // Aggregate data by user
    const userSummaries = {};
    const globalSummary = {
      totalEvents: entries.length,
      uniqueUsers: 0,
      eventTypes: {},
      successfulLogins: 0,
      failedLogins: 0,
      registrations: 0,
      passwordResets: 0
    };
    
    entries.forEach(entry => {
      const data = entry.data;
      const userEmail = data.request?.email || data.response?.email;
      const userId = data.request?.localId || data.response?.localId;
      const method = data.methodName;
      const eventType = getEventTypeFromMethod(method);
      const isError = !!data.error;
      
      // Update global summary
      if (!globalSummary.eventTypes[eventType]) {
        globalSummary.eventTypes[eventType] = { count: 0, errors: 0 };
      }
      globalSummary.eventTypes[eventType].count++;
      if (isError) {
        globalSummary.eventTypes[eventType].errors++;
      }
      
      // Count specific event types
      if (eventType === 'signin') {
        if (isError) {
          globalSummary.failedLogins++;
        } else {
          globalSummary.successfulLogins++;
        }
      } else if (eventType === 'signup') {
        globalSummary.registrations++;
      } else if (eventType === 'password_reset') {
        globalSummary.passwordResets++;
      }
      
      // Update user-specific summary
      if (userEmail || userId) {
        const userKey = userEmail || userId;
        
        if (!userSummaries[userKey]) {
          userSummaries[userKey] = {
            email: userEmail,
            uid: userId,
            totalEvents: 0,
            lastActivity: null,
            eventTypes: {},
            errors: 0
          };
          globalSummary.uniqueUsers++;
        }
        
        const userSummary = userSummaries[userKey];
        userSummary.totalEvents++;
        userSummary.lastActivity = entry.metadata.timestamp;
        
        if (!userSummary.eventTypes[eventType]) {
          userSummary.eventTypes[eventType] = 0;
        }
        userSummary.eventTypes[eventType]++;
        
        if (isError) {
          userSummary.errors++;
        }
      }
    });
    
    return {
      success: true,
      globalSummary,
      userSummaries: Object.values(userSummaries)
        .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
        .slice(0, 100), // Limit to top 100 most active users
      dateRange: {
        start: startDate,
        end: endDate
      }
    };
    
  } catch (error) {
    console.error('Error retrieving auth activity summary:', error);
    throw new Error(`Failed to retrieve auth summary: ${error.message}`);
  }
});

// Helper function to categorize authentication methods into event types
function getEventTypeFromMethod(methodName) {
  if (!methodName) return 'unknown';
  
  const method = methodName.toLowerCase();
  
  if (method.includes('signin') || method.includes('signinnwith')) {
    return 'signin';
  } else if (method.includes('signup')) {
    return 'signup';
  } else if (method.includes('resetpassword') || method.includes('getoobcode')) {
    return 'password_reset';
  } else if (method.includes('deleteaccount')) {
    return 'account_deletion';
  } else if (method.includes('setaccountinfo')) {
    return 'account_update';
  } else if (method.includes('getaccountinfo')) {
    return 'account_info';
  } else if (method.includes('createauthuri')) {
    return 'auth_uri_creation';
  } else if (method.includes('sendverificationcode')) {
    return 'verification_code';
  } else if (method.includes('getprojectconfig')) {
    return 'config_request';
  }
  
  return 'other';
}

// Get authentication security alerts (failed logins, suspicious activity)
exports.getAuthSecurityAlerts = onCall({
  cors: true,
  region: 'us-central1'
}, async (request) => {
  const { startDate, endDate, alertTypes = ['failed_login', 'multiple_failures'] } = request.data;
  const callerUid = request.auth?.uid;
  
  // Verify the caller is staff
  if (!callerUid) {
    throw new Error('Authentication required');
  }
  
  const callerEmail = request.auth.token.email || '';
  const isStaff = callerEmail.endsWith('@rtdacademy.com');
  
  if (!isStaff) {
    throw new Error('Unauthorized: Staff access required');
  }
  
  try {
    const logging = new Logging({
      projectId: 'rtd-academy'
    });
    
    // Filter for error logs only
    let filter = `
      logName="projects/rtd-academy/logs/identitytoolkit.googleapis.com/requests"
      AND resource.type="identitytoolkit_project"
      AND jsonPayload.error.code!=null
    `;
    
    if (startDate && endDate) {
      filter += ` AND timestamp >= "${startDate}" AND timestamp <= "${endDate}"`;
    }
    
    const [entries] = await logging.getEntries({
      filter: filter,
      pageSize: 1000,
      orderBy: 'timestamp desc'
    });
    
    const alerts = [];
    const failuresByUser = {};
    const failuresByIP = {};
    
    entries.forEach(entry => {
      const data = entry.data;
      const userEmail = data.request?.email;
      const userIP = data.request?.ip;
      const error = data.error;
      const timestamp = entry.metadata.timestamp;
      
      // Track failed login attempts
      if (data.methodName && data.methodName.includes('SignIn')) {
        const userKey = userEmail || 'unknown';
        const ipKey = userIP || 'unknown';
        
        // Track by user
        if (!failuresByUser[userKey]) {
          failuresByUser[userKey] = [];
        }
        failuresByUser[userKey].push({
          timestamp,
          error: error.message,
          ip: userIP
        });
        
        // Track by IP
        if (!failuresByIP[ipKey]) {
          failuresByIP[ipKey] = [];
        }
        failuresByIP[ipKey].push({
          timestamp,
          error: error.message,
          email: userEmail
        });
        
        // Create alert for failed login
        if (alertTypes.includes('failed_login')) {
          alerts.push({
            type: 'failed_login',
            severity: 'medium',
            timestamp,
            user: userEmail,
            ip: userIP,
            error: error.message,
            description: `Failed login attempt for ${userEmail || 'unknown user'}`
          });
        }
      }
    });
    
    // Check for multiple failures (potential brute force)
    if (alertTypes.includes('multiple_failures')) {
      Object.entries(failuresByUser).forEach(([user, failures]) => {
        if (failures.length >= 5) {
          alerts.push({
            type: 'multiple_failures',
            severity: 'high',
            timestamp: failures[0].timestamp,
            user,
            count: failures.length,
            description: `${failures.length} failed login attempts for user ${user}`,
            details: failures.slice(0, 10) // Include first 10 attempts
          });
        }
      });
      
      Object.entries(failuresByIP).forEach(([ip, failures]) => {
        if (failures.length >= 10) {
          alerts.push({
            type: 'ip_multiple_failures',
            severity: 'high',
            timestamp: failures[0].timestamp,
            ip,
            count: failures.length,
            description: `${failures.length} failed login attempts from IP ${ip}`,
            details: failures.slice(0, 10)
          });
        }
      });
    }
    
    // Sort alerts by timestamp (newest first)
    alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return {
      success: true,
      alerts: alerts.slice(0, 100), // Limit to 100 most recent alerts
      summary: {
        totalAlerts: alerts.length,
        highSeverity: alerts.filter(a => a.severity === 'high').length,
        mediumSeverity: alerts.filter(a => a.severity === 'medium').length,
        uniqueUsers: Object.keys(failuresByUser).length,
        uniqueIPs: Object.keys(failuresByIP).length
      },
      dateRange: {
        start: startDate,
        end: endDate
      }
    };
    
  } catch (error) {
    console.error('Error retrieving security alerts:', error);
    throw new Error(`Failed to retrieve security alerts: ${error.message}`);
  }
});