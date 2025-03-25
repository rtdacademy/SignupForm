import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDatabase, ref, onValue } from 'firebase/database';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  Eye, 
  EyeOff, 
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import ModernCourseViewer from '../CourseViewer/ModernCourseViewer';
import ContentEditor from './ContentEditor';

const CourseEditor = () => {
  const { courseId } = useParams();
  const { user, isStaffUser } = useAuth();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [contentData, setContentData] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [currentSection, setCurrentSection] = useState('content');
  const [syncingGrades, setSyncingGrades] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    if (!isStaffUser) {
      navigate('/staff-login');
    }
  }, [isStaffUser, navigate]);

  useEffect(() => {
    const db = getDatabase();
    const courseRef = ref(db, `courses/${courseId}`);
    
    return onValue(courseRef, (snapshot) => {
      if (snapshot.exists()) {
        setCourseData(snapshot.val());
      }
    });
  }, [courseId]);

  useEffect(() => {
    const fetchContent = async () => {
      const firestore = getFirestore();
      const contentRef = doc(firestore, 'courses', courseId, 'content', 'draft');
      const publishedRef = doc(firestore, 'courses', courseId, 'content', 'published');
      
      try {
        const [draftSnap, publishedSnap] = await Promise.all([
          getDoc(contentRef),
          getDoc(publishedRef)
        ]);

        if (!draftSnap.exists()) {
          const initialContent = publishedSnap.exists() 
            ? publishedSnap.data()
            : { units: {} };
          
          await setDoc(contentRef, initialContent);
          setContentData(initialContent);
        } else {
          setContentData(draftSnap.data());
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Failed to load course content. Please try again.');
      }
    };

    if (courseId) {
      fetchContent();
    }
  }, [courseId]);

  const handleContentUpdate = (unitId, itemId, newContent) => {
    setContentData(prev => ({
      ...prev,
      units: {
        ...prev.units,
        [unitId]: {
          ...prev.units[unitId],
          items: {
            ...prev.units[unitId]?.items,
            [itemId]: {
              ...prev.units[unitId]?.items?.[itemId],
              ...newContent
            }
          }
        }
      }
    }));
    setIsDirty(true);
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      const firestore = getFirestore();
      
      await setDoc(
        doc(firestore, 'courses', courseId, 'content', 'draft'), 
        contentData
      );
      
      await setDoc(
        doc(firestore, 'courses', courseId, 'content', 'published'),
        contentData
      );

      setIsDirty(false);
      setError(null);
    } catch (err) {
      console.error('Error publishing content:', err);
      setError('Failed to publish changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const firestore = getFirestore();
      await setDoc(
        doc(firestore, 'courses', courseId, 'content', 'draft'),
        contentData
      );
      setIsDirty(false);
      setError(null);
    } catch (err) {
      console.error('Error saving draft:', err);
      setError('Failed to save draft. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSyncGrades = async () => {
    setSyncingGrades(true);
    setSyncStatus(null);
    try {
      const response = await fetch(
        `https://us-central1-rtd-academy.cloudfunctions.net/syncGrades?courseId=${courseId}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to sync grades');
      }

      const result = await response.json();
      setSyncStatus({
        success: true,
        message: `Successfully synced ${result.processedCount} assessments`,
        details: result
      });

    } catch (err) {
      console.error('Grade sync error:', err);
      setSyncStatus({
        success: false,
        message: 'Failed to sync grades. Please try again.',
        error: err.message
      });
    } finally {
      setSyncingGrades(false);
    }
  };

  if (!courseData || !contentData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="flex-none bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">{courseData?.Title}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={previewMode}
                onCheckedChange={setPreviewMode}
                id="preview-mode"
              />
              <label htmlFor="preview-mode" className="text-sm">
                {previewMode ? (
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" /> Preview
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <EyeOff className="w-4 h-4" /> Edit
                  </span>
                )}
              </label>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={!isDirty || saving}
              >
                Save Draft
              </Button>
              <Button
                onClick={handlePublish}
                disabled={!isDirty || saving}
              >
                Publish Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex-none px-4 py-2">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 min-h-0">
        {previewMode ? (
          <ModernCourseViewer 
            courseId={courseId}
            previewMode={true}
            previewContent={contentData}
          />
        ) : (
          <Tabs 
            value={currentSection} 
            onValueChange={setCurrentSection} 
            className="h-full flex flex-col"
          >
            <div className="flex-none border-b bg-white">
              <div className="px-4">
                <TabsList>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
              </div>
            </div>

            <TabsContent 
              value="content" 
              className="flex-1 min-h-0"
            >
              <div className="h-full flex flex-col min-h-0 p-4">
                {isDirty && (
                  <Alert className="flex-none mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      You have unsaved changes
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="flex-1 min-h-0">
                  <ContentEditor 
                    courseData={courseData}
                    contentData={contentData}
                    onUpdate={handleContentUpdate}
                    courseId={courseId}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="p-4">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>IMathAS Grade Sync</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Sync all grades from IMathAS assignments in this course.
                      </p>
                      
                      <Button
                        onClick={handleSyncGrades}
                        disabled={syncingGrades}
                        className="w-full sm:w-auto"
                      >
                        {syncingGrades ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Syncing Grades...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Sync Grades
                          </>
                        )}
                      </Button>

                      {syncStatus && (
                        <Alert
                          variant={syncStatus.success ? "default" : "destructive"}
                          className="mt-4"
                        >
                          <AlertDescription>
                            {syncStatus.message}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default CourseEditor;