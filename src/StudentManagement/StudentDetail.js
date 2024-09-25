import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, child } from 'firebase/database';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ScrollArea } from "../components/ui/scroll-area";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";

function StudentDetail({ studentSummary }) {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
      const dbRef = ref(getDatabase());
      try {
        const sanitizedEmail = sanitizeEmail(studentSummary.StudentEmail);
        const snapshot = await get(child(dbRef, `students/${sanitizedEmail}`));
        if (snapshot.exists()) {
          setStudentData(snapshot.val());
        } else {
          console.log('No student data available');
          setStudentData(null);
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
        setStudentData(null);
      }
      setLoading(false);
    };

    fetchStudentData();
  }, [studentSummary.StudentEmail]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (!studentData) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Student Data Unavailable</h2>
        </CardHeader>
        <CardContent>
          <p>No data available for this student.</p>
        </CardContent>
      </Card>
    );
  }

  const courseData = studentData.courses[studentSummary.courseId];

  const renderHTML = (htmlString) => {
    return <div dangerouslySetInnerHTML={{ __html: htmlString }} />;
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">{studentData.profile.firstName} {studentData.profile.lastName}</h2>
        <p className="text-sm text-muted-foreground">{studentData.profile.StudentEmail}</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="course">
          <TabsList>
            <TabsTrigger value="course">Course Information</TabsTrigger>
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
          </TabsList>
          <TabsContent value="course">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm">
                      <span className="font-semibold">Status:</span>{' '}
                      <Badge variant={courseData.Status_Value === 'Behind' ? "destructive" : "success"}>
                        {courseData.Status_Value}
                      </Badge>
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Last Week Status:</span> {courseData.StatusCompare}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Status Streak Count:</span> {courseData.StatusStreakCount}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Course:</span> {courseData.Course_Value}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Current Mark:</span> {courseData.CurrentMark}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-semibold">School Year:</span> {courseData.School_x0020_Year_Value}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Student Type:</span> {courseData.StudentType_Value}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Diploma Month:</span> {courseData.DiplomaMonthChoices_Value}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Responsible Teacher:</span> {courseData.ResponsibleTeacher_Value}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Active:</span>{' '}
                      <Badge variant={courseData.ActiveFutureArchived_Value === 'Active' ? "success" : "secondary"}>
                        {courseData.ActiveFutureArchived_Value}
                      </Badge>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Activity Log:</h4>
                  <Card>
                    <CardContent>
                      {courseData.ActivityLogLMS ? renderHTML(courseData.ActivityLogLMS) : <p>No Activity Log available.</p>}
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Gradebook:</h4>
                  <Card>
                    <CardContent>
                      {courseData.GradebookHTML ? renderHTML(courseData.GradebookHTML) : <p>No Gradebook available.</p>}
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Schedule:</h4>
                  <Card>
                    <CardContent>
                      {courseData.Schedule ? renderHTML(courseData.Schedule) : <p>No Schedule available.</p>}
                    </CardContent>
                  </Card>
                </div>

                {courseData.LinkToStudentInLMS && (
                  <Button
                    onClick={() => window.open(courseData.LinkToStudentInLMS, '_blank')}
                    className="w-full"
                  >
                    View in LMS
                  </Button>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="profile">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-4">
                {Object.entries(studentData.profile).map(([key, value]) => (
                  <p key={key} className="text-sm">
                    <span className="font-semibold">{key}:</span> {value}
                  </p>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default StudentDetail;