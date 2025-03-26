import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { getFirestore, doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { 
  Eye, 
  EyeOff, 
  AlertTriangle,
  Save,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
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
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  const handleSaveChanges = async () => {
    if (!courseData || !contentData || !contentData.units) {
      setError("No content to save");
      return;
    }
    
    setSaving(true);
    setSaveSuccess(false);
    
    try {
      const firestore = getFirestore();
      const db = getDatabase();
      const batch = writeBatch(firestore);
      
      // Keep track of any contentPaths that need updating in the course structure
      const pathUpdates = {};
      
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
          const unitIndex = courseData.units.findIndex(u => u && u.sequence === unitSequence);
          const item = unit?.items?.find(i => i && i.sequence === itemSequence);
          const itemIndex = unit?.items?.findIndex(i => i && i.sequence === itemSequence);
          
          if (item && item.contentPath) {
            // Generate the new path by replacing 'draft' with 'saved'
            const draftPath = item.contentPath;
            const savedPath = draftPath.replace('/draft/', '/saved/');
            
            console.log(`Saving content from ${draftPath} to ${savedPath}`);
            
            // Save to the new path
            const savedContentRef = doc(firestore, savedPath);
            batch.set(savedContentRef, {
              content: itemData.content,
              updatedAt: new Date().toISOString()
            });
            
            // Update the contentPath in the course structure to point to the saved version
            if (unitIndex >= 0 && itemIndex >= 0) {
              pathUpdates[`courses/${courseId}/units/${unitIndex}/items/${itemIndex}/contentPath`] = savedPath;
            }
          } else {
            console.warn(`Could not find contentPath for ${unitId}/${itemId}`);
          }
        }
      }
      
      // Commit all Firestore saves
      await batch.commit();
      
      // Update the paths in the Realtime Database if needed
      if (Object.keys(pathUpdates).length > 0) {
        const updates = {};
        Object.entries(pathUpdates).forEach(([path, value]) => {
          updates[path] = value;
        });
        await update(ref(db), updates);
        
        // Update local courseData to reflect the new paths
        setCourseData(prevData => {
          const updatedData = {...prevData};
          Object.entries(pathUpdates).forEach(([path, value]) => {
            const pathParts = path.split('/');
            const unitIndex = parseInt(pathParts[3]);
            const itemIndex = parseInt(pathParts[5]);
            
            if (updatedData.units && updatedData.units[unitIndex] && 
                updatedData.units[unitIndex].items && updatedData.units[unitIndex].items[itemIndex]) {
              updatedData.units[unitIndex].items[itemIndex].contentPath = value;
            }
          });
          return updatedData;
        });
      }
  
      setIsDirty(false);
      setError(null);
      setSaveSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.error('Error saving content:', err);
      setError('Failed to save changes. Please try again.');
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
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-700 font-medium">
            Initializing course content...
          </p>
        </div>
      </div>
    );
  }
  
  if (!courseData) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-700 font-medium">
            Loading course data...
          </p>
        </div>
      </div>
    );
  }
  
  if (!contentData) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-700 font-medium">
            Preparing content editor...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0 bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/30">
      {/* Header */}
      <div className="flex-none bg-gradient-to-r from-blue-500 to-indigo-500 border-b border-blue-400 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-white">{courseData?.Title || 'Course Editor'}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-blue-400/20 px-3 py-1.5 rounded-lg">
              <Switch
                checked={previewMode}
                onCheckedChange={(checked) => {
                  setPreviewMode(checked);
                  // If we're enabling preview mode and have unsaved changes, save changes
                  if (checked && isDirty) {
                    handleSaveChanges();
                  }
                }}
                id="preview-mode"
                className="data-[state=checked]:bg-white"
              />
              <label htmlFor="preview-mode" className="text-sm text-white font-medium">
                {previewMode ? (
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" /> Preview Mode
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <EyeOff className="w-4 h-4" /> Edit Mode
                  </span>
                )}
              </label>
            </div>
            
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleSaveChanges}
                      disabled={!isDirty || saving}
                      className={`shadow-sm font-medium ${
                        saveSuccess 
                          ? "bg-green-500 hover:bg-green-600 text-white" 
                          : "bg-white text-blue-700 hover:bg-blue-50 border border-white"
                      }`}
                    >
                      {saving ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2" />
                          Saving...
                        </div>
                      ) : saveSuccess ? (
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Changes Saved
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </div>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-blue-900 text-white border-blue-700 p-2">
                    <p>Save and publish changes for students to view</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex-none px-4 py-2">
          <Alert variant="destructive" className="border-red-200 bg-red-50 shadow-sm">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="font-medium">{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 min-h-0">
        {previewMode ? (
          <div className="h-full bg-white shadow-inner">
            <ModernCourseViewer 
              courseId={courseId}
              previewMode={true}
              previewContent={contentData}
              courseData={courseData} 
            />
          </div>
        ) : (
          // Existing tabs content
          <Tabs 
            value={currentSection} 
            onValueChange={setCurrentSection} 
            className="h-full flex flex-col"
          >
            <div className="flex-none border-b bg-white shadow-sm">
              <div className="px-4">
                <TabsList className="bg-blue-50/70">
                  <TabsTrigger 
                    value="content"
                    className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm"
                  >
                    Content
                  </TabsTrigger>
                  <TabsTrigger 
                    value="settings"
                    className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm"
                  >
                    Settings
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <TabsContent 
              value="content" 
              className="flex-1 min-h-0"
            >
              <div className="h-full flex flex-col min-h-0 p-4">
                {isDirty && (
                  <Alert className="flex-none mb-4 bg-amber-50 border-amber-200 shadow-sm">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <AlertDescription className="font-medium text-amber-700">
                      You have unsaved changes - remember to save to make them visible to students
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
                <Card className="shadow-sm border-blue-100 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border-b border-blue-100">
                    <CardTitle className="text-blue-700">Course Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-600">
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