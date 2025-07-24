import React, { useState, useEffect, useCallback } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Shield, 
  AlertTriangle, 
  LogIn, 
  UserPlus, 
  RefreshCw, 
  Download, 
  Users, 
  TrendingUp,
  Clock,
  Globe,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

const AuthActivityDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);
  const [securityAlerts, setSecurityAlerts] = useState(null);
  const [dateRange, setDateRange] = useState('7days');
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Fetch authentication summary data
  const fetchSummaryData = useCallback(async () => {
    try {
      setLoading(true);
      const functions = getFunctions();
      const getAuthActivitySummary = httpsCallable(functions, 'getAuthActivitySummary');
      
      const { start, end } = getDateRange();
      const result = await getAuthActivitySummary({
        startDate: start,
        endDate: end,
        limit: 1000
      });

      if (result.data.success) {
        setSummaryData(result.data);
      } else {
        toast.error('Failed to fetch authentication summary');
      }
    } catch (error) {
      console.error('Error fetching auth summary:', error);
      toast.error('Error loading authentication data');
    } finally {
      setLoading(false);
    }
  }, [getDateRange]);

  // Fetch security alerts
  const fetchSecurityAlerts = useCallback(async () => {
    try {
      const functions = getFunctions();
      const getAuthSecurityAlerts = httpsCallable(functions, 'getAuthSecurityAlerts');
      
      const { start, end } = getDateRange();
      const result = await getAuthSecurityAlerts({
        startDate: start,
        endDate: end,
        alertTypes: ['failed_login', 'multiple_failures']
      });

      if (result.data.success) {
        setSecurityAlerts(result.data);
      }
    } catch (error) {
      console.error('Error fetching security alerts:', error);
      // Don't show toast for security alerts failure as it's not critical
    }
  }, [getDateRange]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchSummaryData(),
      fetchSecurityAlerts()
    ]);
    setIsRefreshing(false);
    toast.success('Data refreshed successfully');
  }, [fetchSummaryData, fetchSecurityAlerts]);

  // Initialize data fetching
  useEffect(() => {
    fetchSummaryData();
    fetchSecurityAlerts();
  }, [fetchSummaryData, fetchSecurityAlerts]);

  // Refresh data when date range changes
  useEffect(() => {
    fetchSummaryData();
    fetchSecurityAlerts();
  }, [dateRange, fetchSummaryData, fetchSecurityAlerts]);

  // Format timestamp helper
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return format(new Date(timestamp), 'MMM dd, yyyy HH:mm');
  };

  const globalSummary = summaryData?.globalSummary || {};
  const userSummaries = summaryData?.userSummaries || [];
  const alerts = securityAlerts?.alerts || [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Authentication Activity Dashboard</h1>
              <p className="text-sm text-gray-600">Monitor user authentication events and security</p>
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
              onClick={refreshData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="flex-shrink-0 mx-6 mt-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Activity</TabsTrigger>
            <TabsTrigger value="security">Security Alerts</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-auto p-6">
            <TabsContent value="overview" className="mt-0">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
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
                  globalSummary={globalSummary}
                  alerts={alerts}
                  dateRange={dateRange}
                />
              )}
            </TabsContent>
            
            <TabsContent value="users" className="mt-0">
              <UsersTab 
                userSummaries={userSummaries}
                formatTimestamp={formatTimestamp}
                loading={loading}
              />
            </TabsContent>
            
            <TabsContent value="security" className="mt-0">
              <SecurityTab 
                alerts={alerts}
                securitySummary={securityAlerts?.summary}
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
const OverviewTab = ({ globalSummary, alerts, dateRange }) => {
  const highSeverityAlerts = alerts.filter(a => a.severity === 'high').length;
  const mediumSeverityAlerts = alerts.filter(a => a.severity === 'medium').length;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalSummary.totalEvents || 0}</div>
            <p className="text-sm text-gray-600">Authentication events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Unique Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{globalSummary.uniqueUsers || 0}</div>
            <p className="text-sm text-gray-600">Active users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Successful Logins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{globalSummary.successfulLogins || 0}</div>
            <p className="text-sm text-gray-600">
              {globalSummary.failedLogins || 0} failed attempts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Security Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{alerts.length}</div>
            <p className="text-sm text-gray-600">
              {highSeverityAlerts} high, {mediumSeverityAlerts} medium
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">New Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{globalSummary.registrations || 0}</div>
            <p className="text-sm text-gray-600">User signups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Password Resets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{globalSummary.passwordResets || 0}</div>
            <p className="text-sm text-gray-600">Reset requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Login Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {globalSummary.successfulLogins && globalSummary.failedLogins 
                ? Math.round((globalSummary.successfulLogins / (globalSummary.successfulLogins + globalSummary.failedLogins)) * 100)
                : 100
              }%
            </div>
            <p className="text-sm text-gray-600">Success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Event Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {Object.keys(globalSummary.eventTypes || {}).length}
            </div>
            <p className="text-sm text-gray-600">Different event types</p>
          </CardContent>
        </Card>
      </div>

      {/* Event Types Breakdown */}
      {globalSummary.eventTypes && Object.keys(globalSummary.eventTypes).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Event Types Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(globalSummary.eventTypes).map(([eventType, data]) => (
                <div key={eventType} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium capitalize">{eventType.replace('_', ' ')}</h3>
                    <span className="text-2xl font-bold">{data.count}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Success: {data.count - data.errors}</span>
                      <span className="text-red-600">Errors: {data.errors}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Security Alerts Preview */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Recent Security Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  alert.severity === 'high' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className={`h-4 w-4 ${
                        alert.severity === 'high' ? 'text-red-600' : 'text-orange-600'
                      }`} />
                      <span className="font-medium capitalize">{alert.type.replace('_', ' ')}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        alert.severity === 'high' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {format(new Date(alert.timestamp), 'MMM dd, HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{alert.description}</p>
                </div>
              ))}
              {alerts.length > 3 && (
                <p className="text-sm text-gray-600 text-center">
                  +{alerts.length - 3} more alerts. View the Security tab for details.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Users Tab Component
const UsersTab = ({ userSummaries, formatTimestamp, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(10)].map((_, i) => (
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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">User Authentication Activity</h2>
        <p className="text-sm text-gray-600">{userSummaries.length} users</p>
      </div>

      {userSummaries.map((user, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <User className="h-5 w-5 text-gray-600 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{user.email || 'Unknown User'}</h3>
                    {user.errors > 0 && (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                        {user.errors} errors
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                    <div>
                      <p className="text-gray-600">Total Events</p>
                      <p className="font-medium">{user.totalEvents}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Last Activity</p>
                      <p className="font-medium">{formatTimestamp(user.lastActivity)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Sign-ins</p>
                      <p className="font-medium">{user.eventTypes?.signin || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">UID</p>
                      <p className="font-medium font-mono text-xs">{user.uid || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Event types breakdown */}
                  {Object.keys(user.eventTypes || {}).length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(user.eventTypes).map(([eventType, count]) => (
                          <span key={eventType} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            {eventType}: {count}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {userSummaries.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-600">No User Activity</p>
            <p className="text-sm text-gray-500">No authentication activity found for the selected date range</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Security Tab Component
const SecurityTab = ({ alerts, securitySummary, formatTimestamp, loading }) => {
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
    <div className="space-y-6">
      {/* Security Summary */}
      {securitySummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securitySummary.totalAlerts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">High Severity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{securitySummary.highSeverity}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Affected Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{securitySummary.uniqueUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Unique IPs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{securitySummary.uniqueIPs}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>Security Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                alert.severity === 'high' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className={`h-4 w-4 ${
                        alert.severity === 'high' ? 'text-red-600' : 'text-orange-600'
                      }`} />
                      <span className="font-medium capitalize">{alert.type.replace('_', ' ')}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        alert.severity === 'high' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">{alert.description}</p>
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Time: {formatTimestamp(alert.timestamp)}</p>
                      {alert.user && <p>User: {alert.user}</p>}
                      {alert.ip && <p>IP Address: {alert.ip}</p>}
                      {alert.count && <p>Occurrence Count: {alert.count}</p>}
                    </div>

                    {/* Alert details */}
                    {alert.details && alert.details.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs font-medium text-gray-700 mb-1">Recent Attempts:</p>
                        <div className="space-y-1">
                          {alert.details.slice(0, 3).map((detail, detailIndex) => (
                            <div key={detailIndex} className="text-xs text-gray-600 bg-white p-2 rounded">
                              {formatTimestamp(detail.timestamp)} - {detail.error}
                              {detail.ip && ` (IP: ${detail.ip})`}
                              {detail.email && ` (Email: ${detail.email})`}
                            </div>
                          ))}
                          {alert.details.length > 3 && (
                            <p className="text-xs text-gray-500">+{alert.details.length - 3} more attempts</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {alerts.length === 0 && (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-600">No Security Alerts</p>
                <p className="text-sm text-gray-500">No security issues detected for the selected date range</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthActivityDashboard;