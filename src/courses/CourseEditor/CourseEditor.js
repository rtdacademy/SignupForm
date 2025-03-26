import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDatabase, ref, onValue } from 'firebase/database';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  Eye, 
  EyeOff, 
  AlertTriangle,
  Save,
  ArrowLeft
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
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    if (!isStaffUser) {
      navigate('/staff-login');
    }
  }, [isStaffUser, navigate]);

  useEffect(() => {
    if (!courseId) return;
    
    const db = getDatabase();
    const courseRef = ref(db, `courses/${courseId}`);
    
    return onValue(courseRef, (snapshot) => {
      if (snapshot.exists()) {
        setCourseData(snapshot.val());
        console.log("Course data loaded successfully");
      } else {
        console.log("No course data found");
        setCourseData({});
      }
    });
  }, [courseId]);

  // Function to extract content path from course data
  const getContentPaths = (courseData) => {
    if (!courseData || !courseData.units) return [];
    
    const paths = [];
    courseData.units.forEach((unit, unitIndex) => {
      if (unit && unit.items) {
        unit.items.forEach((item, itemIndex) => {
          if (item && item.contentPath) {
            paths.push({
              unitIndex,
              itemIndex,
              unitSequence: unit.sequence,
              itemSequence: item.sequence,
              contentPath: item.contentPath
            });
          }
        });
      }
    });
    
    console.log(`Found ${paths.length} content paths`);
    return paths;
  };

  // Generate initial content structure from course units
  const generateInitialContent = (courseData) => {
    const initialContent = { units: {} };
    
    if (courseData && Array.isArray(courseData.units)) {
      courseData.units.forEach(unit => {
        if (!unit) return;
        
        const unitId = `unit_${unit.sequence}`;
        initialContent.units[unitId] = { 
          items: {},
          overview: { description: "" }
        };
        
        if (Array.isArray(unit.items)) {
          unit.items.forEach(item => {
            if (!item) return;
            
            const itemId = `item_${item.sequence}`;
            initialContent.units[unitId].items[itemId] = {
              content: ""
            };
          });
        }
      });
    }
    
    return initialContent;
  };

  // Fetch content from specified paths
  const fetchContentFromPaths = async (paths) => {
    if (!paths || paths.length === 0) return {};
    
    const firestore = getFirestore();
    const contents = {};
    
    for (const pathInfo of paths) {
      try {
        if (!pathInfo || !pathInfo.contentPath) continue;
        
        const contentPath = pathInfo.contentPath;
        console.log(`Fetching content from: ${contentPath}`);
        
        const contentRef = doc(firestore, contentPath);
        const contentSnap = await getDoc(contentRef);
        
        if (contentSnap.exists()) {
          const unitId = `unit_${pathInfo.unitSequence}`;
          const itemId = `item_${pathInfo.itemSequence}`;
          
          if (!contents[unitId]) {
            contents[unitId] = { items: {} };
          }
          
          contents[unitId].items[itemId] = {
            content: contentSnap.data().content || ""
          };
        } else {
          console.log(`No content found at ${contentPath}`);
        }
      } catch (error) {
        console.error(`Error fetching content for path:`, error);
      }
    }
    
    return contents;
  };

  useEffect(() => {
    const fetchContent = async () => {
      if (!courseData) return;
      
      setInitializing(true);
      
      try {
        // 1. Get content paths from the course data
        const contentPaths = getContentPaths(courseData);
        
        // 2. Generate initial content structure
        const initialContent = generateInitialContent(courseData);
        
        // 3. Fetch content from these paths
        const fetchedContent = await fetchContentFromPaths(contentPaths);
        
        // 4. Merge the fetched content with the initial structure
        const mergedContent = { 
          ...initialContent,
          units: { ...initialContent.units }
        };
        
        // Merge fetched content into the structure
        Object.entries(fetchedContent).forEach(([unitId, unitData]) => {
          if (!mergedContent.units[unitId]) {
            mergedContent.units[unitId] = { items: {} };
          }
          
          if (unitData && unitData.items) {
            Object.entries(unitData.items).forEach(([itemId, itemData]) => {
              if (!mergedContent.units[unitId].items[itemId]) {
                mergedContent.units[unitId].items[itemId] = {};
              }
              
              if (itemData) {
                mergedContent.units[unitId].items[itemId].content = itemData.content;
              }
            });
          }
        });
        
        console.log("Content successfully merged");
        
        // 5. Set the content data
        setContentData(mergedContent);
        
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Failed to load course content. Please try again.');
      } finally {
        setInitializing(false);
      }
    };

    if (courseId && courseData) {
      fetchContent();
    }
  }, [courseId, courseData]);

  const handleContentUpdate = (unitId, itemId, newContent) => {
    if (!unitId || !itemId || !newContent) {
      console.error("Missing required parameters for content update");
      return;
    }
    
    console.log(`Updating content for ${unitId}/${itemId}`);
    
    setContentData(prev => {
      if (!prev || !prev.units) {
        console.error("No content data to update");
        return prev;
      }
      
      // Create a deep copy to work with
      const updated = {
        ...prev,
        units: { ...prev.units }
      };
      
      // Make sure the unit exists
      if (!updated.units[unitId]) {
        updated.units[unitId] = { items: {} };
      }
      
      // Make sure the items object exists
      if (!updated.units[unitId].items) {
        updated.units[unitId].items = {};
      }
      
      // Make sure the item exists
      if (!updated.units[unitId].items[itemId]) {
        updated.units[unitId].items[itemId] = {};
      }
      
      // Update the content
      updated.units[unitId] = {
        ...updated.units[unitId],
        items: {
          ...updated.units[unitId].items,
          [itemId]: {
            ...updated.units[unitId].items[itemId],
            ...newContent
          }
        }
      };
      
      return updated;
    });
    
    setIsDirty(true);
  };

  const handlePublish = async () => {
    if (!courseData || !contentData || !contentData.units) {
      setError("No content to publish");
      return;
    }
    
    setSaving(true);
    try {
      // Save content for each updated item
      for (const [unitId, unitData] of Object.entries(contentData.units)) {
        if (!unitData || !unitData.items) continue;
        
        for (const [itemId, itemData] of Object.entries(unitData.items)) {
          if (!itemData || !itemData.content) continue;
          
          // Find the corresponding item in courseData to get contentPath
          const unitSequence = parseInt(unitId.split('_')[1]);
          const itemSequence = parseInt(itemId.split('_')[1]);
          
          if (!courseData.units) {
            console.warn("No units found in course data");
            continue;
          }
          
          const unit = courseData.units.find(u => u && u.sequence === unitSequence);
          const item = unit?.items?.find(i => i && i.sequence === itemSequence);
          
          if (item && item.contentPath) {
            console.log(`Publishing content for ${unitId}/${itemId}`);
            
            const firestore = getFirestore();
            const contentRef = doc(firestore, item.contentPath);
            
            await setDoc(contentRef, {
              content: itemData.content,
              updatedAt: new Date().toISOString()
            });
          } else {
            console.warn(`Could not find contentPath for ${unitId}/${itemId}`);
          }
        }
      }

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
      // Save content for each updated item, same as publish but to draft location
      await handlePublish();
      
      setIsDirty(false);
      setError(null);
    } catch (err) {
      console.error('Error saving draft:', err);
      setError('Failed to save draft. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleGoBack = () => {
    // Check if there are unsaved changes
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/courses');
      }
    } else {
      navigate('/courses');
    }
  };

  if (initializing) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">
            Initializing course content...
          </p>
        </div>
      </div>
    );
  }
  
  if (!courseData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">
            Loading course data...
          </p>
        </div>
      </div>
    );
  }
  
  if (!contentData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">
            Preparing content editor...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="flex-none bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleGoBack} 
              className="mr-2"
              title="Back to Courses"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">{courseData?.Title || 'Course Editor'}</h1>
          </div>
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
                <Save className="w-4 h-4 mr-2" />
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
                {contentData && courseData && (
                  <ContentEditor 
                    courseData={courseData}
                    contentData={contentData}
                    onUpdate={handleContentUpdate}
                    courseId={courseId}
                  />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="p-4">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Course settings will be available here in the future.
                  </p>
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