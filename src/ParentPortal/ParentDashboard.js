import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../context/AuthContext';
import Header from '../Layout/Header';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Users, 
  GraduationCap, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  ChevronRight,
  User,
  Calendar,
  BookOpen,
  CreditCard,
  Loader2
} from 'lucide-react';
import CourseCard from '../Dashboard/CourseCard';
import { ImportantDatesCard } from '../Dashboard/ImportantDatesCard';
import NotificationCenter from '../Dashboard/NotificationCenter';
import ProfileComponent from '../Dashboard/ProfileComponent';
import { toast } from 'sonner';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [parentData, setParentData] = useState(null);
  const [selectedStudentKey, setSelectedStudentKey] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showLMS, setShowLMS] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Fetch parent dashboard data when component mounts
  useEffect(() => {
    const fetchParentData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const functions = getFunctions();
        const getParentDashboardData = httpsCallable(functions, 'getParentDashboardData');
        
        const result = await getParentDashboardData();
        
        if (result.data.success) {
          setParentData(result.data);
          
          // Set the first linked student as selected by default
          if (result.data.linkedStudents && result.data.linkedStudents.length > 0) {
            setSelectedStudentKey(result.data.linkedStudents[0].studentEmailKey);
          }
        } else {
          setError(result.data.message || 'Failed to load parent dashboard data');
        }
      } catch (err) {
        console.error('Error fetching parent data:', err);
        setError(err.message || 'Failed to load parent dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchParentData();
  }, [currentUser]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      navigate('/parent-login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  }, [signOut, navigate]);

  const handleBackClick = useCallback(() => {
    if (showLMS) {
      setShowLMS(false);
      setSelectedCourse(null);
    } else if (selectedCourse) {
      setSelectedCourse(null);
    }
  }, [showLMS, selectedCourse]);

  const showBackButton = showLMS || selectedCourse;

  // Get currently selected student
  const selectedStudent = parentData?.linkedStudents?.find(
    student => student.studentEmailKey === selectedStudentKey
  );

  // Get pending approvals count
  const pendingApprovalsCount = parentData?.linkedStudents?.reduce((count, student) => {
    if (!student.permissions.approveEnrollment) return count;
    return count + Object.values(student.enrollmentApproval?.courses || {}).filter(
      course => !course.approved && !course.denied
    ).length;
  }, 0) || 0;

  // Handle course approval
  const handleCourseApproval = async (studentKey, courseId, approved) => {
    try {
      const functions = getFunctions();
      const approveStudentEnrollment = httpsCallable(functions, 'approveStudentEnrollment');
      
      const result = await approveStudentEnrollment({
        studentEmailKey: studentKey,
        courseId: parseInt(courseId),
        approved
      });
      
      if (result.data.success) {
        toast.success(approved ? 'Course enrollment approved' : 'Course enrollment denied');
        
        // Update local state
        setParentData(prev => ({
          ...prev,
          linkedStudents: prev.linkedStudents.map(student => {
            if (student.studentEmailKey === studentKey) {
              return {
                ...student,
                enrollmentApproval: {
                  ...student.enrollmentApproval,
                  courses: {
                    ...student.enrollmentApproval.courses,
                    [courseId]: {
                      ...student.enrollmentApproval.courses[courseId],
                      approved,
                      denied: !approved,
                      approvedAt: new Date().toISOString()
                    }
                  }
                }
              };
            }
            return student;
          })
        }));
      } else {
        throw new Error(result.data.message || 'Failed to process approval');
      }
    } catch (err) {
      console.error('Error approving enrollment:', err);
      toast.error(err.message || 'Failed to process enrollment approval');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <Header 
          user={currentUser}
          onLogout={handleLogout}
          onBackClick={null}
          onDashboardClick={() => {}}
          portalType="Parent Portal"
          isEmulating={false}
          isStaffUser={false}
        />
        <div className="flex justify-center items-center flex-1">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading parent dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen">
        <Header 
          user={currentUser}
          onLogout={handleLogout}
          onBackClick={null}
          onDashboardClick={() => {}}
          portalType="Parent Portal"
          isEmulating={false}
          isStaffUser={false}
        />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!parentData || !parentData.linkedStudents || parentData.linkedStudents.length === 0) {
    return (
      <div className="flex flex-col h-screen">
        <Header 
          user={currentUser}
          onLogout={handleLogout}
          onBackClick={null}
          onDashboardClick={() => {}}
          portalType="Parent Portal"
          isEmulating={false}
          isStaffUser={false}
        />
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <Users className="h-4 w-4" />
            <AlertDescription>
              No linked students found. Please contact the school if you believe this is an error.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Render the main dashboard
  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        user={currentUser}
        onLogout={handleLogout}
        onBackClick={showBackButton ? handleBackClick : null}
        onDashboardClick={() => {
          setSelectedCourse(null);
          setShowLMS(false);
        }}
        portalType="Parent Portal"
        isEmulating={false}
        isStaffUser={false}
      />

      <div className="flex-1 relative flex flex-col">
        <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col">
          {/* Pending Approvals Banner */}
          {pendingApprovalsCount > 0 && (
            <Alert className="mb-6 bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription>
                <span className="text-amber-800 font-medium">
                  You have {pendingApprovalsCount} course enrollment{pendingApprovalsCount > 1 ? 's' : ''} pending approval. 
                  {parentData.linkedStudents.length > 1 && ' Check each student tab below to review their enrollments.'}
                </span>
              </AlertDescription>
            </Alert>
          )}

          {/* Student Selector Tabs */}
          {parentData.linkedStudents.length > 1 && (
            <Tabs 
              value={selectedStudentKey} 
              onValueChange={setSelectedStudentKey}
              className="mb-6"
            >
              <TabsList className="w-full flex gap-2">
                {parentData.linkedStudents.map((student) => {
                  const pendingCount = student.permissions.approveEnrollment ? 
                    Object.values(student.enrollmentApproval?.courses || {}).filter(c => !c.approved && !c.denied).length : 0;
                  
                  return (
                    <TabsTrigger 
                      key={student.studentEmailKey} 
                      value={student.studentEmailKey}
                      className="relative flex-1"
                    >
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{student.studentName}</span>
                        {pendingCount > 0 && (
                          <Badge className="ml-2 bg-amber-500 text-white">
                            {pendingCount}
                          </Badge>
                        )}
                      </div>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              
              {/* Tab Content for each student */}
              {parentData.linkedStudents.map((student) => (
                <TabsContent key={student.studentEmailKey} value={student.studentEmailKey}>
                  <div className="space-y-6">
                    {/* Student Info Card */}
                    <Card className="border border-gray-200 shadow-md">
                      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                              <GraduationCap className="h-6 w-6 text-purple-600" />
                              {student.studentName}
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                              {student.relationship} • {student.profile.StudentEmail}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => setIsProfileOpen(true)}
                            disabled={!student.profile}
                          >
                            View Profile
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>

                    {/* Pending Approvals for this student */}
                    {student.permissions.approveEnrollment && 
                     student.enrollmentApproval?.courses && 
                     Object.entries(student.enrollmentApproval.courses).some(([_, course]) => !course.approved && !course.denied) && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardHeader>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Clock className="h-5 w-5 text-amber-600" />
                      Pending Course Approvals
                    </h3>
                  </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Object.entries(student.enrollmentApproval.courses)
                            .filter(([_, course]) => !course.approved && !course.denied)
                            .map(([courseId, course]) => (
                              <div 
                                key={courseId} 
                                className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200"
                              >
                                <div>
                                  <p className="font-medium">{course.courseName}</p>
                                  <p className="text-sm text-gray-600">Course ID: {courseId}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-green-500 text-green-700 hover:bg-green-50"
                                    onClick={() => handleCourseApproval(student.studentEmailKey, courseId, true)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-500 text-red-700 hover:bg-red-50"
                                    onClick={() => handleCourseApproval(student.studentEmailKey, courseId, false)}
                                  >
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    Deny
                                  </Button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                    )}

                    {/* Courses Section */}
                    <Card className="border border-gray-200 shadow-md">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                        <h3 className="text-lg font-semibold flex items-center">
                          <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                          Courses
                        </h3>
                      </CardHeader>
                      <CardContent className="p-6">
                        {student.courses && student.courses.length > 0 ? (
                          <div className="space-y-6">
                            {student.courses.map((course) => (
                              <CourseCard
                                key={course.CourseID || course.id}
                                course={course}
                                profile={student.profile}
                                onViewDetails={() => setSelectedCourse(course)}
                                onGoToCourse={() => {
                                  toast.info("Parent view of course content coming soon!");
                                }}
                                showProgressBar={student.permissions.viewGrades}
                                showGradeInfo={student.permissions.viewGrades}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            No courses enrolled yet
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Important Dates - if we have them */}
                    {student.importantDates && (
                      <Card className="border border-gray-200 shadow-md">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                          <h3 className="text-lg font-semibold flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                            Important Dates
                          </h3>
                        </CardHeader>
                        <CardContent className="p-4">
                          <ImportantDatesCard importantDates={student.importantDates} />
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}

          {/* Single Student Content (when no tabs needed) */}
          {parentData.linkedStudents.length === 1 && selectedStudent && (
            <div className="space-y-6">
              {/* Student Info Card */}
              <Card className="border border-gray-200 shadow-md">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-purple-600" />
                        {selectedStudent.studentName}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedStudent.relationship} • {selectedStudent.profile.StudentEmail}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setIsProfileOpen(true)}
                      disabled={!selectedStudent.profile}
                    >
                      View Profile
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {/* Pending Approvals for this student */}
              {selectedStudent.permissions.approveEnrollment && 
               selectedStudent.enrollmentApproval?.courses && 
               Object.entries(selectedStudent.enrollmentApproval.courses).some(([_, course]) => !course.approved && !course.denied) && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardHeader>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Clock className="h-5 w-5 text-amber-600" />
                      Pending Course Approvals
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(selectedStudent.enrollmentApproval.courses)
                        .filter(([_, course]) => !course.approved && !course.denied)
                        .map(([courseId, course]) => (
                          <div 
                            key={courseId} 
                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200"
                          >
                            <div>
                              <p className="font-medium">{course.courseName}</p>
                              <p className="text-sm text-gray-600">Course ID: {courseId}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-500 text-green-700 hover:bg-green-50"
                                onClick={() => handleCourseApproval(selectedStudent.studentEmailKey, courseId, true)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500 text-red-700 hover:bg-red-50"
                                onClick={() => handleCourseApproval(selectedStudent.studentEmailKey, courseId, false)}
                              >
                                <AlertCircle className="h-4 w-4 mr-1" />
                                Deny
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Courses Section */}
              <Card className="border border-gray-200 shadow-md">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h3 className="text-lg font-semibold flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                    Courses
                  </h3>
                </CardHeader>
                <CardContent className="p-6">
                  {selectedStudent.courses && selectedStudent.courses.length > 0 ? (
                    <div className="space-y-6">
                      {selectedStudent.courses.map((course) => (
                        <CourseCard
                          key={course.CourseID || course.id}
                          course={course}
                          profile={selectedStudent.profile}
                          onViewDetails={() => setSelectedCourse(course)}
                          onGoToCourse={() => {
                            toast.info("Parent view of course content coming soon!");
                          }}
                          showProgressBar={selectedStudent.permissions.viewGrades}
                          showGradeInfo={selectedStudent.permissions.viewGrades}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No courses enrolled yet
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Important Dates - if we have them */}
              {selectedStudent.importantDates && (
                <Card className="border border-gray-200 shadow-md">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                      Important Dates
                    </h3>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ImportantDatesCard importantDates={selectedStudent.importantDates} />
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Profile Component as a Sheet */}
      {(() => {
        const currentStudent = parentData?.linkedStudents?.find(
          student => student.studentEmailKey === selectedStudentKey
        );
        return currentStudent && currentStudent.profile && (
          <ProfileComponent
            isOpen={isProfileOpen}
            onOpenChange={setIsProfileOpen}
            profile={currentStudent.profile}
            readOnly={!currentStudent.permissions.editContactInfo}
          />
        );
      })()}
    </div>
  );
};

export default ParentDashboard;