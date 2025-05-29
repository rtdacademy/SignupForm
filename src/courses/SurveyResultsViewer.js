import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, query, orderByKey, limitToFirst, startAt, endAt } from 'firebase/database';
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
import { Loader2, User, Calendar, CheckCircle, ChevronDown } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';

const SurveyResultsViewer = ({ notificationId, notification, intendedRecipients = [] }) => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [lastKey, setLastKey] = useState(null);
  const [allLoaded, setAllLoaded] = useState(false);
  
  console.log('🔍 [SurveyResults] Received intendedRecipients prop:', intendedRecipients);
  console.log('🔍 [SurveyResults] Number of intended recipients:', intendedRecipients.length);

  // Fetch all survey results for this notification
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
        console.log('🔍 [SurveyResults] Fetched results:', snapshot.val());
      } else {
        setResults({});
        console.log('🔍 [SurveyResults] No results found for notification');
      }
    } catch (err) {
      console.error('Error fetching survey results:', err);
      setError('Failed to load survey results');
      toast.error('Failed to load survey results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [notificationId]);

  // Get survey result for a specific student
  const getStudentResult = (student) => {
    const studentKey = sanitizeEmail(student.StudentEmail);
    console.log('🔍 [SurveyResults] Looking for student:', student.StudentEmail, '-> studentKey:', studentKey);
    
    // Try different key formats that might exist in the database
    const possibleKeys = [
      studentKey,
      `000${studentKey}`, // With 000 prefix
      student.StudentEmail.replace(/\./g, ','), // Direct email with dots to commas
      `000${student.StudentEmail.replace(/\./g, ',')}` // With 000 prefix
    ];
    
    for (const key of possibleKeys) {
      if (results[key]) {
        console.log('✅ [SurveyResults] Found result for', student.StudentEmail, 'using key:', key);
        return results[key];
      }
    }
    
    console.log('❌ [SurveyResults] No result found for', student.StudentEmail, 'tried keys:', possibleKeys);
    return null;
  };

  const getAnswerText = (questionId, answerId, questions) => {
    const question = questions?.find(q => q.id === questionId);
    if (!question) return 'Unknown';
    
    if (question.questionType === 'multiple-choice') {
      const option = question.options?.find(opt => opt.id === answerId);
      return option?.text || 'Unknown Option';
    } else if (question.questionType === 'text') {
      return answerId || 'No response';
    }
    
    return answerId || 'No response';
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
        <span>Loading survey results...</span>
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

  const surveyQuestions = notification?.surveyQuestions || [];
  
  // Calculate true engagement metrics based on intended recipients
  const totalIntendedRecipients = intendedRecipients.length;
  
  // Count students who have results
  const studentsWithResults = intendedRecipients.map(student => ({
    student,
    result: getStudentResult(student)
  }));
  
  const respondedCount = studentsWithResults.filter(({ result }) => result?.completed).length;
  const seenCount = studentsWithResults.filter(({ result }) => result !== null).length;
  const notRespondedCount = totalIntendedRecipients - seenCount;

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
      {/* Survey Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Survey Results Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalIntendedRecipients}</div>
              <div className="text-sm text-gray-500">Intended Recipients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{respondedCount}</div>
              <div className="text-sm text-gray-500">Completed</div>
              <div className="text-xs text-gray-400">
                {totalIntendedRecipients > 0 ? Math.round((respondedCount / totalIntendedRecipients) * 100) : 0}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{seenCount}</div>
              <div className="text-sm text-gray-500">Started</div>
              <div className="text-xs text-gray-400">
                {totalIntendedRecipients > 0 ? Math.round((seenCount / totalIntendedRecipients) * 100) : 0}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{notRespondedCount}</div>
              <div className="text-sm text-gray-500">Not Started</div>
              <div className="text-xs text-gray-400">
                {totalIntendedRecipients > 0 ? Math.round((notRespondedCount / totalIntendedRecipients) * 100) : 0}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions Header */}
      {surveyQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Survey Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {surveyQuestions.map((question, index) => (
                <div key={question.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">
                    Q{index + 1}: {question.question}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Type: <Badge variant="outline">{question.questionType}</Badge>
                  </div>
                  {question.questionType === 'multiple-choice' && question.options && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-1">Options:</div>
                      <div className="flex flex-wrap gap-1">
                        {question.options.map(option => (
                          <Badge key={option.id} variant="secondary" className="text-xs">
                            {option.text}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Responses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  {surveyQuestions.map((question, index) => (
                    <TableHead key={question.id} className="min-w-[200px]">
                      Q{index + 1}: {question.question.length > 30 
                        ? question.question.substring(0, 30) + '...' 
                        : question.question}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsWithResults.map(({ student, result }, index) => (
                  <TableRow key={student.id || index}>
                    <TableCell className="font-medium">
                      {`${student.firstName} ${student.lastName}` || 'Unknown Student'}
                    </TableCell>
                    <TableCell>
                      {student.StudentEmail}
                    </TableCell>
                    <TableCell>
                      {student.Course_Value || 'Unknown Course'}
                    </TableCell>
                    <TableCell>
                      {result ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {result.submittedAt 
                              ? formatDate(result.submittedAt)
                              : result.completedAt 
                                ? formatDate(result.completedAt)
                                : 'Started but not submitted'
                            }
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Not started</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={result?.completed ? "default" : result ? "secondary" : "outline"}
                        className={
                          result?.completed 
                            ? "bg-green-100 text-green-800" 
                            : result 
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-600"
                        }
                      >
                        {result?.completed ? 'Completed' : result ? 'In Progress' : 'Not Started'}
                      </Badge>
                    </TableCell>
                    {surveyQuestions.map((question) => (
                      <TableCell key={question.id} className="max-w-[200px]">
                        <div className="truncate" title={getAnswerText(question.id, result?.answers?.[question.id], surveyQuestions)}>
                          {result ? getAnswerText(question.id, result.answers?.[question.id], surveyQuestions) : 'No response'}
                        </div>
                      </TableCell>
                    ))}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default SurveyResultsViewer;