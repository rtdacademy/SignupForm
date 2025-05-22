import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, query, orderByKey, limitToFirst, startAt } from 'firebase/database';
import { toast } from 'sonner';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Loader2, User, Calendar, Eye, EyeOff, CheckCircle, XCircle, ChevronDown } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';

const NotificationResultsViewer = ({ notificationId, notification, intendedRecipients = [] }) => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [lastKey, setLastKey] = useState(null);
  const [allLoaded, setAllLoaded] = useState(false);
  
  console.log('🔍 [NotificationResults] Received intendedRecipients prop:', intendedRecipients);
  console.log('🔍 [NotificationResults] Number of intended recipients:', intendedRecipients.length);

  // Fetch all notification results for this notification
  const fetchResults = async () => {
    if (!notificationId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const db = getDatabase();
      const resultsRef = ref(db, `studentDashboardNotificationsResults/${notificationId}`);
      const snapshot = await get(resultsRef);
      
      if (snapshot.exists()) {
        setResults(snapshot.val());
        console.log('🔍 [NotificationResults] Fetched results:', snapshot.val());
      } else {
        setResults({});
        console.log('🔍 [NotificationResults] No results found for notification');
      }
    } catch (err) {
      console.error('Error fetching notification results:', err);
      setError('Failed to load notification results');
      toast.error('Failed to load notification results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [notificationId]);

  // Get notification result for a specific student
  const getStudentResult = (student) => {
    const studentKey = sanitizeEmail(student.StudentEmail);
    console.log('🔍 [NotificationResults] Looking for student:', student.StudentEmail, '-> studentKey:', studentKey);
    
    // Try different key formats that might exist in the database
    const possibleKeys = [
      studentKey,
      `000${studentKey}`, // With 000 prefix
      student.StudentEmail.replace(/\./g, ','), // Direct email with dots to commas
      `000${student.StudentEmail.replace(/\./g, ',')}` // With 000 prefix
    ];
    
    for (const key of possibleKeys) {
      if (results[key]) {
        console.log('✅ [NotificationResults] Found result for', student.StudentEmail, 'using key:', key);
        return results[key];
      }
    }
    
    console.log('❌ [NotificationResults] No result found for', student.StudentEmail, 'tried keys:', possibleKeys);
    return null;
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading notification results...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Calculate true engagement metrics based on intended recipients
  const totalIntendedRecipients = intendedRecipients.length;
  
  // Count students who have results
  const studentsWithResults = intendedRecipients.map(student => ({
    student,
    result: getStudentResult(student)
  }));
  
  const seenCount = studentsWithResults.filter(({ result }) => result?.hasSeen).length;
  const acknowledgedCount = studentsWithResults.filter(({ result }) => result?.hasAcknowledged).length;
  const notSeenCount = totalIntendedRecipients - studentsWithResults.filter(({ result }) => result !== null).length;

  if (totalIntendedRecipients === 0) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No students match the notification conditions</p>
        <p className="text-sm text-gray-400 mt-1">Check the notification filters to ensure students are targeted</p>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Notification Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            Notification Engagement Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalIntendedRecipients}</div>
              <div className="text-sm text-gray-500">Intended Recipients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{seenCount}</div>
              <div className="text-sm text-gray-500">Have Seen</div>
              <div className="text-xs text-gray-400">
                {totalIntendedRecipients > 0 ? Math.round((seenCount / totalIntendedRecipients) * 100) : 0}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{acknowledgedCount}</div>
              <div className="text-sm text-gray-500">Acknowledged</div>
              <div className="text-xs text-gray-400">
                {totalIntendedRecipients > 0 ? Math.round((acknowledgedCount / totalIntendedRecipients) * 100) : 0}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{notSeenCount}</div>
              <div className="text-sm text-gray-500">Not Seen</div>
              <div className="text-xs text-gray-400">
                {totalIntendedRecipients > 0 ? Math.round((notSeenCount / totalIntendedRecipients) * 100) : 0}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Student Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Email</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>First Seen</TableHead>
                  <TableHead>Acknowledged</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsWithResults.map(({ student, result }, index) => (
                  <TableRow key={student.id || index}>
                    <TableCell className="font-medium">
                      {student.StudentEmail}
                    </TableCell>
                    <TableCell>
                      {student.Course_Value || 'Unknown Course'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {result?.hasSeen ? (
                          <Badge variant="default" className="bg-green-100 text-green-800 flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            Seen
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className={`flex items-center gap-1 ${result ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
                            <EyeOff className="h-3 w-3" />
                            {result ? 'Interacted but not seen' : 'Not Seen'}
                          </Badge>
                        )}
                        {result?.hasAcknowledged && (
                          <Badge variant="default" className="bg-blue-100 text-blue-800 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Acknowledged
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {result?.hasSeenTimeStamp ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {formatDate(result.hasSeenTimeStamp)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Not seen</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {result?.acknowledgedAt ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {formatDate(result.acknowledgedAt)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Not acknowledged</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Summary */}
          {totalIntendedRecipients > 0 && (
            <div className="mt-4 text-center text-sm text-gray-500">
              Showing all {totalIntendedRecipients} intended {totalIntendedRecipients === 1 ? 'recipient' : 'recipients'}
            </div>
          )}
          
          {/* Summary at bottom */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <strong>Engagement Rate:</strong> {totalIntendedRecipients > 0 ? Math.round((seenCount / totalIntendedRecipients) * 100) : 0}% of intended recipients have seen this notification
                </div>
                <div>
                  <strong>Acknowledgment Rate:</strong> {totalIntendedRecipients > 0 ? Math.round((acknowledgedCount / totalIntendedRecipients) * 100) : 0}% of intended recipients have acknowledged this notification
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationResultsViewer;