import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CourseProvider } from '../context/CourseContext';
import { useTeacherStudentData } from '../Dashboard/hooks/useTeacherStudentData';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import FirebaseCourseWrapperImproved from '../FirebaseCourses/FirebaseCourseWrapperImproved';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, User, BookOpen, AlertCircle, Flame, Eye } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Skeleton } from '../components/ui/skeleton';

/**
 * TeacherFirebaseCourseView - Allows teachers to view and interact with a student's Firebase course
 * exactly as the student would see it, but in a teacher mode with additional context and controls.
 */
const TeacherFirebaseCourseViewContent = () => {
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const studentEmail = searchParams.get('student');
  const { user } = useAuth();
  
  // State for UI
  const [studentEmailKey, setStudentEmailKey] = useState(null);
  const [error, setError] = useState(null);

  // Convert student email to email key
  useEffect(() => {
    if (studentEmail) {
      try {
        const emailKey = sanitizeEmail(studentEmail);
        setStudentEmailKey(emailKey);
      } catch (err) {
        console.error('Error sanitizing student email:', err);
        setError('Invalid student email format');
      }
    } else {
      setError('No student email provided');
    }
  }, [studentEmail]);

  // Teacher permissions - basic check for now
  const teacherPermissions = {
    canViewStudentData: true,
    isStaff: user?.email?.includes('@rtdacademy.com') || false,
    isTeacher: true
  };

  // Fetch student data using teacher hook
  const studentData = useTeacherStudentData(studentEmailKey, teacherPermissions);

  // Find the specific course in the student's data
  const targetCourse = studentData.courses?.find(course => course.id === courseId);
  const isFirebaseCourse = targetCourse?.courseDetails?.firebaseCourse === true;

  // Handle navigation back
  const handleBack = () => {
    window.close(); // Close the popup/tab
  };

  // Show loading state
  if (studentData.loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-6 rounded" />
                <Skeleton className="h-6 w-48" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || studentData.error || !studentData.hasPermissions) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Access Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error || studentData.error || 'Insufficient permissions to view student data'}
                </AlertDescription>
              </Alert>
              <Button onClick={handleBack} className="mt-4" variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show course not found or not Firebase course
  if (!targetCourse || !isFirebaseCourse) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-5 w-5" />
                Course Not Available
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {!targetCourse 
                    ? `Course ${courseId} not found for student ${studentEmail}` 
                    : `Course ${courseId} is not a Firebase course`
                  }
                </AlertDescription>
              </Alert>
              <Button onClick={handleBack} className="mt-4" variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render the Firebase course in teacher mode
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Teacher Control Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={handleBack} variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900">
                    {studentData.profile?.firstName} {studentData.profile?.lastName}
                  </span>
                  <span className="text-sm text-gray-500">({studentEmail})</span>
                </div>
                
                <div className="h-4 border-l border-gray-300" />
                
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-gray-900">
                    {targetCourse.courseDetails?.Title || `Course ${courseId}`}
                  </span>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    Firebase Course
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                Teacher View
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Teacher Mode Notice */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <Alert>
          <Eye className="h-4 w-4" />
          <AlertDescription>
            You are viewing this Firebase course as the student would see it. 
            Your interactions (like answering questions) will be recorded under your teacher account, 
            not the student's account. The student's actual progress and data remain unchanged.
          </AlertDescription>
        </Alert>
      </div>

      {/* Firebase Course Content */}
      <div className="max-w-7xl mx-auto px-4 pb-6">
        <FirebaseCourseWrapperImproved
          course={targetCourse}
          isStaffView={true}
          devMode={true} // Enable dev mode for teachers
          teacherViewStudent={{
            email: studentEmail,
            name: `${studentData.profile?.firstName} ${studentData.profile?.lastName}`,
            emailKey: studentEmailKey
          }}
        />
      </div>
    </div>
  );
};

// Wrapper component that provides CourseContext
const TeacherFirebaseCourseView = () => {
  return (
    <CourseProvider>
      <TeacherFirebaseCourseViewContent />
    </CourseProvider>
  );
};

export default TeacherFirebaseCourseView;