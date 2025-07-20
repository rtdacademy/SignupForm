// functions/retrieveUserActivity.js
const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const zlib = require('zlib');

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Retrieve user activity data for a specific date range
exports.retrieveUserActivity = onCall({
  cors: true,
  region: 'us-central1'
}, async (request) => {
  const { uid, startDate, endDate } = request.data;
  const callerUid = request.auth?.uid;
  
  // Verify the caller is either the user themselves or a staff member
  if (!callerUid) {
    throw new Error('Authentication required');
  }
  
  // Check if caller is staff
  const callerEmail = request.auth.token.email || '';
  const isStaff = callerEmail.endsWith('@rtdacademy.com');
  
  // Verify permissions
  if (callerUid !== uid && !isStaff) {
    throw new Error('Unauthorized: You can only view your own activity data');
  }
  
  try {
    const storage = admin.storage().bucket();
    const db = admin.database();
    
    // Convert dates to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Get all files in the date range
    const allSessions = [];
    
    // First, get current session if any
    const currentSessionRef = db.ref(`/users/${uid}/activityTracking/currentSession`);
    const currentSnapshot = await currentSessionRef.once('value');
    if (currentSnapshot.exists()) {
      const currentData = currentSnapshot.val();
      allSessions.push({
        ...currentData,
        isCurrent: true,
        source: 'realtime'
      });
    }
    
    // Then get archived sessions from Cloud Storage
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      
      const prefix = `userActivityLogs/${uid}/${year}/${month}/${day}/`;
      
      try {
        const [files] = await storage.getFiles({ prefix });
        
        for (const file of files) {
          if (file.name.endsWith('.json.gz')) {
            // Download and decompress the file
            const [compressedData] = await file.download();
            
            const decompressedData = await new Promise((resolve, reject) => {
              zlib.gunzip(compressedData, (err, result) => {
                if (err) reject(err);
                else resolve(result.toString());
              });
            });
            
            const sessionData = JSON.parse(decompressedData);
            allSessions.push({
              ...sessionData.sessionData,
              metadata: sessionData.archiveMetadata,
              source: 'archive',
              archivePath: file.name
            });
          }
        }
      } catch (error) {
        console.log(`No data for ${prefix}:`, error.message);
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Sort sessions by start time
    allSessions.sort((a, b) => {
      const aTime = a.startTime || a.metadata?.sessionStartTime || 0;
      const bTime = b.startTime || b.metadata?.sessionStartTime || 0;
      return bTime - aTime;
    });
    
    // Calculate statistics
    const stats = {
      totalSessions: allSessions.length,
      totalEvents: allSessions.reduce((sum, session) => {
        return sum + (session.activityEvents?.length || 0);
      }, 0),
      dateRange: {
        start: startDate,
        end: endDate
      }
    };
    
    return {
      success: true,
      sessions: allSessions,
      stats
    };
    
  } catch (error) {
    console.error('Error retrieving user activity:', error);
    throw new Error(`Failed to retrieve activity data: ${error.message}`);
  }
});

// Generate activity report for a user
exports.generateActivityReport = onCall({
  cors: true,
  region: 'us-central1'
}, async (request) => {
  const { uid, startDate, endDate, reportType = 'summary' } = request.data;
  const callerUid = request.auth?.uid;
  
  // Verify authentication and permissions (same as above)
  if (!callerUid) {
    throw new Error('Authentication required');
  }
  
  const callerEmail = request.auth.token.email || '';
  const isStaff = callerEmail.endsWith('@rtdacademy.com');
  
  if (callerUid !== uid && !isStaff) {
    throw new Error('Unauthorized');
  }
  
  try {
    // First get all the session data
    const { sessions } = await exports.retrieveUserActivity.handler(request);
    
    // Generate report based on type
    let report;
    
    switch (reportType) {
      case 'summary':
        report = generateSummaryReport(sessions, uid);
        break;
      
      case 'detailed':
        report = generateDetailedReport(sessions, uid);
        break;
      
      case 'daily':
        report = generateDailyReport(sessions, uid);
        break;
      
      default:
        throw new Error('Invalid report type');
    }
    
    return {
      success: true,
      report,
      generatedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error generating report:', error);
    throw new Error(`Failed to generate report: ${error.message}`);
  }
});

// Helper function to generate summary report
function generateSummaryReport(sessions, uid) {
  const report = {
    userId: uid,
    totalSessions: sessions.length,
    totalActivityTime: 0,
    averageSessionDuration: 0,
    mostActiveHours: {},
    mostVisitedPages: {},
    activityByDay: {}
  };
  
  sessions.forEach(session => {
    // Calculate session duration
    if (session.startTime && session.endTime) {
      const duration = session.endTime - session.startTime;
      report.totalActivityTime += duration;
    }
    
    // Analyze activity events
    if (session.activityEvents) {
      session.activityEvents.forEach(event => {
        // Track page visits
        const page = event.data?.url || 'unknown';
        report.mostVisitedPages[page] = (report.mostVisitedPages[page] || 0) + 1;
        
        // Track activity by hour
        const hour = new Date(event.timestamp).getHours();
        report.mostActiveHours[hour] = (report.mostActiveHours[hour] || 0) + 1;
        
        // Track activity by day
        const day = new Date(event.timestamp).toDateString();
        report.activityByDay[day] = (report.activityByDay[day] || 0) + 1;
      });
    }
  });
  
  // Calculate average session duration
  if (sessions.length > 0) {
    report.averageSessionDuration = Math.round(report.totalActivityTime / sessions.length);
  }
  
  // Convert objects to sorted arrays
  report.mostVisitedPages = Object.entries(report.mostVisitedPages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
    
  report.mostActiveHours = Object.entries(report.mostActiveHours)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    .sort((a, b) => a.hour - b.hour);
  
  return report;
}

// Helper function to generate detailed report
function generateDetailedReport(sessions, uid) {
  const report = {
    userId: uid,
    sessions: sessions.map(session => ({
      sessionId: session.sessionId,
      startTime: session.startTime,
      endTime: session.endTime || session.metadata?.archiveDate,
      duration: session.endTime && session.startTime ? 
        session.endTime - session.startTime : null,
      eventCount: session.activityEvents?.length || 0,
      source: session.source,
      userAgent: session.userAgent,
      events: session.activityEvents || []
    }))
  };
  
  return report;
}

// Helper function to generate daily report
function generateDailyReport(sessions, uid) {
  const dailyData = {};
  
  sessions.forEach(session => {
    const date = new Date(session.startTime || session.metadata?.sessionStartTime).toDateString();
    
    if (!dailyData[date]) {
      dailyData[date] = {
        date,
        sessions: 0,
        totalEvents: 0,
        totalDuration: 0,
        pages: new Set()
      };
    }
    
    dailyData[date].sessions++;
    dailyData[date].totalEvents += session.activityEvents?.length || 0;
    
    if (session.endTime && session.startTime) {
      dailyData[date].totalDuration += session.endTime - session.startTime;
    }
    
    // Track unique pages visited
    session.activityEvents?.forEach(event => {
      if (event.data?.url) {
        dailyData[date].pages.add(event.data.url);
      }
    });
  });
  
  // Convert to array and format
  const report = {
    userId: uid,
    dailyActivity: Object.values(dailyData).map(day => ({
      ...day,
      uniquePages: day.pages.size,
      pages: undefined // Remove the Set object
    })).sort((a, b) => new Date(b.date) - new Date(a.date))
  };
  
  return report;
}