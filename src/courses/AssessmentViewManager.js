import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getDatabase, ref, get } from 'firebase/database';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Clipboard, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AssessmentViewManager = ({ courseId, assessmentType, gradebookIndex, title }) => {
  const { user, user_email_key, isStaff } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [activeTab, setActiveTab] = useState('view');
  const [accessChecked, setAccessChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Generate a unique assessment link
  const assessmentLink = `${window.location.origin}/assessment/${courseId}/${gradebookIndex}`;

  useEffect(() => {
    checkAccess();
  }, [courseId, user_email_key]);

  const checkAccess = async () => {
    try {
      if (!user) {
        setHasAccess(false);
        setError("Please log in to access this assessment");
        return;
      }

      // Staff always has access
      if (isStaff(user)) {
        setHasAccess(true);
        loadAssessment();
        return;
      }

      // Check if student is enrolled in the course
      const db = getDatabase();
      const studentCourseRef = ref(db, `students/${user_email_key}/courses/${courseId}`);
      const snapshot = await get(studentCourseRef);

      if (snapshot.exists()) {
        setHasAccess(true);
        loadAssessment();
      } else {
        setHasAccess(false);
        setError("You don't have access to this assessment");
      }
    } catch (err) {
      setError("Error checking access permissions");
      console.error(err);
    } finally {
      setAccessChecked(true);
      setLoading(false);
    }
  };

  const loadAssessment = async () => {
    try {
      setLoading(true);
      const firestore = getFirestore();
      const assessmentRef = doc(firestore, 'assessments', `${courseId}-${gradebookIndex}`);
      const assessmentDoc = await getDoc(assessmentRef);

      if (assessmentDoc.exists()) {
        setAssessment(assessmentDoc.data());
      } else if (isStaff(user)) {
        // Only create new assessment if user is staff
        const newAssessment = {
          id: `${courseId}-${gradebookIndex}`,
          courseId,
          gradebookIndex,
          type: assessmentType,
          title: title || 'Untitled Assessment',
          questions: [],
          created: new Date().toISOString(),
          createdBy: user.uid,
          isPublished: false,
          accessLink: assessmentLink
        };
        await setDoc(assessmentRef, newAssessment);
        setAssessment(newAssessment);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(assessmentLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!hasAccess) {
    return (
      <Alert variant="warning">
        <AlertDescription>You do not have permission to access this assessment.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{assessment?.title}</span>
          {isStaff(user) && (
            <Button
              variant="outline"
              onClick={() => setActiveTab(activeTab === 'edit' ? 'view' : 'edit')}
            >
              {activeTab === 'edit' ? 'View Mode' : 'Edit Mode'}
            </Button>
          )}
        </CardTitle>
        {isStaff(user) && (
          <div className="mt-4">
            <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
              <LinkIcon className="h-4 w-4 text-gray-500" />
              <Input 
                value={assessmentLink}
                readOnly
                className="flex-1 bg-transparent border-none focus:ring-0"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={copyLinkToClipboard}
                className="flex items-center space-x-2"
              >
                <Clipboard className="h-4 w-4" />
                <span>{copySuccess ? 'Copied!' : 'Copy Link'}</span>
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Share this link with students to access the assessment. Only enrolled students will be able to view and complete it.
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isStaff(user) ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="view">View</TabsTrigger>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="responses">Responses</TabsTrigger>
            </TabsList>
            <TabsContent value="view">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Student View</h3>
                {/* StudentView component will be added here */}
                <p className="text-gray-500">Student view will be implemented here</p>
              </div>
            </TabsContent>
            <TabsContent value="edit">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Edit Assessment</h3>
                {/* AssessmentEditor component will be added here */}
                <p className="text-gray-500">Assessment editor will be implemented here</p>
              </div>
            </TabsContent>
            <TabsContent value="responses">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Student Responses</h3>
                {/* ResponseViewer component will be added here */}
                <p className="text-gray-500">Student responses will be displayed here</p>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="p-4">
            {/* StudentView component will be added here */}
            <p className="text-gray-500">Student view will be implemented here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssessmentViewManager;