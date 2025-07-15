import React, { useState, useEffect, useCallback } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Calendar, Clock, Activity, BarChart3, Download, RefreshCw, User, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

const StudentActivitySheet = ({ studentData, courseId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [currentSession, setCurrentSession] = useState(null);
  const [archivedSessions, setArchivedSessions] = useState([]);
  const [detailedData, setDetailedData] = useState(null);
  const [dateRange, setDateRange] = useState('7days');
  const [activeTab, setActiveTab] = useState('overview');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Get student UID from the profile
  const studentUid = studentData?.profile?.uid;
  const studentName = `${studentData?.profile?.preferredFirstName || studentData?.profile?.firstName || ''} ${studentData?.profile?.lastName || ''}`.trim();

  // Date range options
  const dateRangeOptions = {
    '1day': { label: 'Last 24 hours', days: 1 },
    '7days': { label: 'Last 7 days', days: 7 },
    '30days': { label: 'Last 30 days', days: 30 },
    '90days': { label: 'Last 90 days', days: 90 }
  };

  // Get date range for API calls
  const getDateRange = useCallback(() => {
    const days = dateRangeOptions[dateRange]?.days || 7;
    const endDate = endOfDay(new Date());
    const startDate = startOfDay(subDays(endDate, days));
    return {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    };
  }, [dateRange]);

  // Fetch current session data from Realtime Database
  const fetchCurrentSession = useCallback(() => {
    if (!studentUid) return;

    const db = getDatabase();
    const currentSessionRef = ref(db, `users/${studentUid}/activityTracking/currentSession`);
    
    const unsubscribe = onValue(currentSessionRef, (snapshot) => {
      if (snapshot.exists()) {
        setCurrentSession(snapshot.val());
      } else {
        setCurrentSession(null);
      }
    });

    return unsubscribe;
  }, [studentUid]);

  // Fetch archived sessions summary from Realtime Database
  const fetchArchivedSessions = useCallback(() => {
    if (!studentUid) return;

    const db = getDatabase();
    const archivedSessionsRef = ref(db, `users/${studentUid}/activityTracking/archivedSessions`);
    
    const unsubscribe = onValue(archivedSessionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const sessionsArray = Object.values(data).sort((a, b) => b.archivedAt - a.archivedAt);
        setArchivedSessions(sessionsArray);
      } else {
        setArchivedSessions([]);
      }
    });

    return unsubscribe;
  }, [studentUid]);

  // Fetch detailed activity data using Cloud Function
  const fetchDetailedData = useCallback(async () => {
    if (!studentUid) return;

    try {
      setLoading(true);
      const functions = getFunctions();
      const retrieveUserActivity = httpsCallable(functions, 'retrieveUserActivity');
      
      const { start, end } = getDateRange();
      const result = await retrieveUserActivity({
        uid: studentUid,
        startDate: start,
        endDate: end
      });

      if (result.data.success) {
        setDetailedData(result.data);
      } else {
        toast.error('Failed to fetch detailed activity data');
      }
    } catch (error) {
      console.error('Error fetching detailed activity:', error);
      toast.error('Error loading activity data');
    } finally {
      setLoading(false);
    }
  }, [studentUid, getDateRange]);

  // Generate and download activity report
  const generateReport = async (reportType = 'summary') => {
    if (!studentUid) return;

    try {
      setIsGeneratingReport(true);
      const functions = getFunctions();
      const generateActivityReport = httpsCallable(functions, 'generateActivityReport');
      
      const { start, end } = getDateRange();
      const result = await generateActivityReport({
        uid: studentUid,
        startDate: start,
        endDate: end,
        reportType
      });

      if (result.data.success) {
        // Create and download the report as JSON
        const dataStr = JSON.stringify(result.data.report, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `student-activity-${reportType}-${studentName}-${format(new Date(), 'yyyy-MM-dd')}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        toast.success('Report downloaded successfully');
      } else {
        toast.error('Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error generating report');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Initialize data fetching
  useEffect(() => {
    if (!studentUid) {
      setLoading(false);
      return;
    }

    const currentSessionUnsubscribe = fetchCurrentSession();
    const archivedSessionsUnsubscribe = fetchArchivedSessions();
    
    fetchDetailedData();

    return () => {
      if (currentSessionUnsubscribe) currentSessionUnsubscribe();
      if (archivedSessionsUnsubscribe) archivedSessionsUnsubscribe();
    };
  }, [studentUid, fetchCurrentSession, fetchArchivedSessions, fetchDetailedData]);

  // Refresh data when date range changes
  useEffect(() => {
    if (studentUid) {
      fetchDetailedData();
    }
  }, [dateRange, fetchDetailedData]);

  // Format duration helper
  const formatDuration = (ms) => {
    if (!ms || ms < 0) return '0m';
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  // Format timestamp helper
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return format(new Date(timestamp), 'MMM dd, yyyy HH:mm');
  };

  // Check if student is currently active
  const isCurrentlyActive = currentSession && 
    currentSession.lastActivityTimestamp && 
    (Date.now() - currentSession.lastActivityTimestamp < 5 * 60 * 1000); // Active within 5 minutes

  if (!studentUid) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center text-gray-500">
          <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">No Activity Data Available</p>
          <p className="text-sm">Student UID not found in profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Activity className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Student Activity</h2>
              <p className="text-sm text-gray-600">{studentName}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(dateRangeOptions).map(([key, option]) => (
                  <SelectItem key={key} value={key}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchDetailedData()}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateReport('summary')}
              disabled={isGeneratingReport}
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
            isCurrentlyActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isCurrentlyActive ? 'bg-green-500' : 'bg-gray-400'
            }`} />
            <span>{isCurrentlyActive ? 'Currently Active' : 'Inactive'}</span>
          </div>
          
          {currentSession && (
            <div className="text-sm text-gray-600">
              Current session: {formatDuration(Date.now() - currentSession.startTime)}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="flex-shrink-0 mx-6 mt-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-auto p-6">
            <TabsContent value="overview" className="mt-0">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-8 w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <OverviewTab 
                  currentSession={currentSession}
                  archivedSessions={archivedSessions}
                  detailedData={detailedData}
                  formatDuration={formatDuration}
                  formatTimestamp={formatTimestamp}
                  isCurrentlyActive={isCurrentlyActive}
                />
              )}
            </TabsContent>
            
            <TabsContent value="sessions" className="mt-0">
              <SessionsTab 
                currentSession={currentSession}
                detailedData={detailedData}
                formatDuration={formatDuration}
                formatTimestamp={formatTimestamp}
                loading={loading}
              />
            </TabsContent>
            
            <TabsContent value="timeline" className="mt-0">
              <TimelineTab 
                detailedData={detailedData}
                formatTimestamp={formatTimestamp}
                loading={loading}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ currentSession, archivedSessions, detailedData, formatDuration, formatTimestamp, isCurrentlyActive }) => {
  const stats = detailedData?.stats || {};
  const sessions = detailedData?.sessions || [];
  
  // Calculate today's sessions
  const today = new Date().toDateString();
  const todaySessions = sessions.filter(session => {
    const sessionDate = new Date(session.startTime || session.metadata?.sessionStartTime).toDateString();
    return sessionDate === today;
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isCurrentlyActive ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-2xl font-bold">
                {isCurrentlyActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {currentSession && (
              <p className="text-sm text-gray-600 mt-1">
                Session: {formatDuration(Date.now() - currentSession.startTime)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Today's Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaySessions.length}</div>
            <p className="text-sm text-gray-600">
              {todaySessions.reduce((sum, session) => sum + (session.activityEvents?.length || 0), 0)} events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions || 0}</div>
            <p className="text-sm text-gray-600">{stats.totalEvents || 0} total events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Last Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {currentSession?.lastActivityTimestamp 
                ? formatTimestamp(currentSession.lastActivityTimestamp)
                : archivedSessions[0]?.archivedAt 
                ? formatTimestamp(archivedSessions[0].archivedAt)
                : 'No recent activity'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Session Details */}
      {currentSession && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Current Session</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Started</p>
                <p className="font-medium">{formatTimestamp(currentSession.startTime)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-medium">{formatDuration(Date.now() - currentSession.startTime)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Events</p>
                <p className="font-medium">{currentSession.activityEvents?.length || 0}</p>
              </div>
              {currentSession.userAgent && (
                <div className="md:col-span-3">
                  <p className="text-sm text-gray-600">Browser</p>
                  <p className="font-medium text-sm">{currentSession.userAgent}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sessions.slice(0, 5).map((session, index) => (
              <div key={session.sessionId || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${session.isCurrent ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <div>
                    <p className="font-medium">
                      {formatTimestamp(session.startTime || session.metadata?.sessionStartTime)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {session.activityEvents?.length || 0} events
                      {session.source && ` • ${session.source}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {session.endTime && session.startTime 
                      ? formatDuration(session.endTime - session.startTime)
                      : session.isCurrent 
                      ? formatDuration(Date.now() - session.startTime)
                      : 'Unknown'
                    }
                  </p>
                </div>
              </div>
            ))}
            {sessions.length === 0 && (
              <p className="text-center text-gray-500 py-4">No sessions found for the selected date range</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Sessions Tab Component
const SessionsTab = ({ currentSession, detailedData, formatDuration, formatTimestamp, loading }) => {
  const sessions = detailedData?.sessions || [];

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session, index) => (
        <Card key={session.sessionId || index} className={session.isCurrent ? 'border-green-200 bg-green-50' : ''}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${session.isCurrent ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <h3 className="font-medium">
                    Session {formatTimestamp(session.startTime || session.metadata?.sessionStartTime)}
                  </h3>
                  {session.isCurrent && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Live</span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Duration</p>
                    <p className="font-medium">
                      {session.endTime && session.startTime 
                        ? formatDuration(session.endTime - session.startTime)
                        : session.isCurrent 
                        ? formatDuration(Date.now() - session.startTime)
                        : 'Unknown'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Events</p>
                    <p className="font-medium">{session.activityEvents?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Source</p>
                    <p className="font-medium capitalize">{session.source || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">End Time</p>
                    <p className="font-medium">
                      {session.endTime 
                        ? formatTimestamp(session.endTime)
                        : session.isCurrent 
                        ? 'Active'
                        : 'Unknown'
                      }
                    </p>
                  </div>
                </div>

                {session.userAgent && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-gray-600 text-sm">Browser</p>
                    <p className="text-sm font-mono">{session.userAgent}</p>
                  </div>
                )}

                {session.events && session.events.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-gray-600 text-sm mb-2">Recent Activity ({session.events.length} events)</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {session.events.slice(0, 5).map((event, eventIndex) => (
                        <div key={eventIndex} className="text-xs bg-white p-2 rounded border">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{event.type}</span>
                            <span className="text-gray-500">{formatTimestamp(event.timestamp)}</span>
                          </div>
                          {event.data?.url && (
                            <p className="text-gray-600 truncate mt-1">{event.data.url}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {sessions.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-600">No Sessions Found</p>
            <p className="text-sm text-gray-500">No activity sessions found for the selected date range</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Timeline Tab Component
const TimelineTab = ({ detailedData, formatTimestamp, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const sessions = detailedData?.sessions || [];

  // Group sessions by day
  const sessionsByDay = sessions.reduce((acc, session) => {
    const date = new Date(session.startTime || session.metadata?.sessionStartTime).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(session);
    return acc;
  }, {});

  const sortedDays = Object.keys(sessionsByDay).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="space-y-6">
      {sortedDays.map(day => {
        const daySessions = sessionsByDay[day];
        const totalEvents = daySessions.reduce((sum, session) => sum + (session.activityEvents?.length || 0), 0);
        const totalDuration = daySessions.reduce((sum, session) => {
          if (session.endTime && session.startTime) {
            return sum + (session.endTime - session.startTime);
          }
          return sum;
        }, 0);

        return (
          <Card key={day}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>{format(new Date(day), 'EEEE, MMMM dd, yyyy')}</span>
                </CardTitle>
                <div className="text-sm text-gray-600">
                  {daySessions.length} sessions • {totalEvents} events
                  {totalDuration > 0 && ` • ${Math.round(totalDuration / 60000)}m total`}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {daySessions.map((session, index) => (
                  <div key={session.sessionId || index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${session.isCurrent ? 'bg-green-500' : 'bg-blue-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">
                          {format(new Date(session.startTime || session.metadata?.sessionStartTime), 'HH:mm')}
                          {session.endTime && ` - ${format(new Date(session.endTime), 'HH:mm')}`}
                          {session.isCurrent && ' (Live)'}
                        </p>
                        <div className="text-sm text-gray-600">
                          {session.endTime && session.startTime 
                            ? `${Math.round((session.endTime - session.startTime) / 60000)}m`
                            : session.isCurrent 
                            ? `${Math.round((Date.now() - session.startTime) / 60000)}m`
                            : ''
                          }
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {session.activityEvents?.length || 0} events
                        {session.source && ` • ${session.source}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {sortedDays.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-600">No Timeline Data</p>
            <p className="text-sm text-gray-500">No activity timeline available for the selected date range</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentActivitySheet;