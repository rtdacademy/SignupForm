import React, { useState, useCallback, useEffect, memo, useRef } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../../../components/ui/resizable';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from '../../../components/ui/sheet';
import { Code, Eye, Save, Plus, RefreshCw } from 'lucide-react';
import EnhancedCodeEditor from './EnhancedCodeEditor';
import UiGeneratedContent from '../content/UiGeneratedContent';
import SectionManager from './SectionManager';

const SimplifiedMultiSectionCodeEditor = ({
  courseProps = {},
  currentLessonInfo = null,
  isOpen = false,
  onOpenChange,
  courseId,
  currentUser
}) => {
  // Simple state - only UI concerns
  const [sections, setSections] = useState([]);
  const [sectionOrder, setSectionOrder] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [sectionCode, setSectionCode] = useState('');
  const [sectionTitle, setSectionTitle] = useState('');
  
  // Operation state
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // UI state
  const [isMobile, setIsMobile] = useState(false);
  const [mobileTab, setMobileTab] = useState('sections');

  // Initialize cloud function
  const functions = getFunctions();
  const manageCourseSection = httpsCallable(functions, 'manageCourseSection');
  const debugLesson = httpsCallable(functions, 'debugLesson');

  // Load lesson data when opened
  useEffect(() => {
    if (isOpen && currentLessonInfo?.contentPath && courseId) {
      loadLessonData();
    }
  }, [isOpen, currentLessonInfo, courseId]);

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Track last loaded section to prevent unnecessary reloads
  const lastLoadedSectionId = useRef(null);
  
  // Ref to store the latest content from editor
  const currentEditorContent = useRef('');
  
  // Handler to capture editor content changes (but not update state)
  const handleEditorChange = useCallback((newContent) => {
    currentEditorContent.current = newContent;
    console.log(`📝 Editor content updated: ${newContent?.length || 0} chars`);
  }, []);

  // Update editor when section selection changes (but not on section data updates)
  useEffect(() => {
    if (selectedSectionId && selectedSectionId !== lastLoadedSectionId.current) {
      const section = sections.find(s => s.id === selectedSectionId);
      if (section) {
        setSectionCode(section.originalCode || '');
        setSectionTitle(section.title || '');
        currentEditorContent.current = section.originalCode || '';
        lastLoadedSectionId.current = selectedSectionId;
        console.log(`📝 Loaded section "${section.title}" for editing (section switch)`);
      }
    } else if (!selectedSectionId) {
      setSectionCode('');
      setSectionTitle('');
      currentEditorContent.current = '';
      lastLoadedSectionId.current = null;
    }
  }, [selectedSectionId, sections]);

  const loadLessonData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📚 Loading lesson data via cloud function...');
      
      const result = await manageCourseSection({
        action: 'loadLesson',
        courseId,
        lessonPath: currentLessonInfo.contentPath,
        lessonTitle: currentLessonInfo.title
      });

      if (result.data.success) {
        setSections(result.data.sections || []);
        setSectionOrder(result.data.sectionOrder || []);
        
        // Auto-select first section
        if (result.data.sections && result.data.sections.length > 0) {
          setSelectedSectionId(result.data.sections[0].id);
          console.log(`🎯 Auto-selected first section: "${result.data.sections[0].title}"`);
        }
        
        console.log(`✅ Loaded ${result.data.sections?.length || 0} sections`);
        
        // Debug the lesson structure
        debugLesson({
          courseId,
          lessonPath: currentLessonInfo.contentPath
        }).then(debugResult => {
          console.log('🔍 Lesson debug info:', debugResult.data);
        }).catch(debugError => {
          console.warn('Debug call failed:', debugError);
        });
      } else {
        throw new Error(result.data.error || 'Failed to load lesson data');
      }
    } catch (err) {
      console.error('❌ Error loading lesson:', err);
      setError(`Failed to load lesson: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSection = useCallback(async () => {
    if (!selectedSectionId || !currentLessonInfo?.contentPath) {
      setError('No section selected or lesson path missing');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use the current editor content (from ref) instead of state
      const codeToSave = currentEditorContent.current || sectionCode;

      console.log(`💾 Saving section "${sectionTitle}" via cloud function...`);
      console.log(`📝 State code length: ${sectionCode?.length || 0}`);
      console.log(`📝 Editor ref code length: ${currentEditorContent.current?.length || 0}`);
      console.log(`📝 Using code length: ${codeToSave?.length || 0}`);

      const result = await manageCourseSection({
        action: 'saveSection',
        courseId,
        lessonPath: currentLessonInfo.contentPath,
        sectionId: selectedSectionId,
        sectionData: {
          title: sectionTitle,
          originalCode: codeToSave
        },
        lessonTitle: currentLessonInfo.title,
        userEmail: currentUser?.email
      });

      if (result.data.success) {
        // Update local state with server response
        setSections(result.data.sections);
        setSectionOrder(result.data.sectionOrder);
        
        // Show success
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        
        // Refresh preview
        setRefreshKey(prev => prev + 1);
        
        console.log(`✅ ${result.data.message}`);
      } else {
        throw new Error(result.data.error || 'Save operation failed');
      }
    } catch (err) {
      console.error('❌ Error saving section:', err);
      setError(`Failed to save: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [selectedSectionId, sectionCode, sectionTitle, currentLessonInfo, courseId, currentUser]);

  const handleSectionCreate = useCallback(async (newSectionData) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🆕 Creating section "${newSectionData.title}" via cloud function...`);

      const result = await manageCourseSection({
        action: 'createSection',
        courseId,
        lessonPath: currentLessonInfo.contentPath,
        sectionData: newSectionData,
        lessonTitle: currentLessonInfo.title,
        userEmail: currentUser?.email
      });

      if (result.data.success) {
        setSections(result.data.sections);
        setSectionOrder(result.data.sectionOrder);
        setSelectedSectionId(result.data.newSection.id);
        
        console.log(`✅ ${result.data.message}`);
      } else {
        throw new Error(result.data.error || 'Create operation failed');
      }
    } catch (err) {
      console.error('❌ Error creating section:', err);
      setError(`Failed to create section: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [currentLessonInfo, courseId, currentUser]);

  const handleSectionUpdate = useCallback((sectionId, updates) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId ? { ...section, ...updates } : section
    ));
    
    if (sectionId === selectedSectionId && updates.title) {
      setSectionTitle(updates.title);
    }
  }, [selectedSectionId]);

  const handleSectionDelete = useCallback((sectionId) => {
    setSections(prev => prev.filter(s => s.id !== sectionId));
    setSectionOrder(prev => prev.filter(id => id !== sectionId));
    
    if (selectedSectionId === sectionId) {
      const remainingSections = sections.filter(s => s.id !== sectionId);
      setSelectedSectionId(remainingSections.length > 0 ? remainingSections[0].id : null);
    }
  }, [selectedSectionId, sections]);

  const handleSectionReorder = useCallback((newOrder) => {
    setSectionOrder(newOrder);
  }, []);

  // Mobile Layout
  const MobileContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <Button
          variant={mobileTab === 'sections' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setMobileTab('sections')}
          className="flex-1 rounded-none"
        >
          Sections
        </Button>
        <Button
          variant={mobileTab === 'editor' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setMobileTab('editor')}
          className="flex-1 rounded-none"
          disabled={!selectedSectionId}
        >
          <Code className="h-3 w-3 mr-1" />
          Edit
        </Button>
        <Button
          variant={mobileTab === 'preview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setMobileTab('preview')}
          className="flex-1 rounded-none"
        >
          <Eye className="h-3 w-3 mr-1" />
          Preview
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        {mobileTab === 'sections' && (
          <SectionManager
            sections={sections}
            sectionOrder={sectionOrder}
            selectedSectionId={selectedSectionId}
            onSectionSelect={setSelectedSectionId}
            onSectionCreate={handleSectionCreate}
            onSectionUpdate={handleSectionUpdate}
            onSectionDelete={handleSectionDelete}
            onSectionReorder={handleSectionReorder}
          />
        )}
        
        {mobileTab === 'editor' && selectedSectionId && (
          <div className="flex flex-col h-full">
            <div className="p-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <Input
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                placeholder="Section title..."
                className="mb-2"
              />
              <Button
                onClick={handleSaveSection}
                disabled={loading}
                size="sm"
                className="w-full"
              >
                <Save className="h-3 w-3 mr-1" />
                {loading ? 'Saving...' : 'Save'}
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <EnhancedCodeEditor
                value={sectionCode}
                onChange={handleEditorChange}
                onSave={handleSaveSection}
                height="100%"
                placeholder={`Write JSX for ${sectionTitle || 'this section'}...`}
                editorKey={selectedSectionId}
              />
            </div>
          </div>
        )}
        
        {mobileTab === 'preview' && (
          <div className="flex flex-col h-full">
            <div className="p-2 border-b border-gray-200 bg-gray-50 flex items-center justify-between flex-shrink-0">
              <span className="text-sm font-medium">Combined Preview</span>
              <Button size="sm" variant="outline" onClick={() => setRefreshKey(prev => prev + 1)}>
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-white">
              <UiGeneratedContent
                key={refreshKey}
                course={courseProps.course}
                courseId={courseProps?.courseId}
                courseDisplay={courseProps.courseDisplay}
                itemConfig={currentLessonInfo}
                isStaffView={courseProps.isStaffView}
                devMode={courseProps.devMode}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Desktop Layout
  const DesktopContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <h2 className="font-semibold text-gray-800">Simplified Multi-Section Editor</h2>
        {currentLessonInfo && (
          <Badge variant="outline" className="text-xs">
            📝 {currentLessonInfo.title}
          </Badge>
        )}
        {sections.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {sections.length} section{sections.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <SectionManager
              sections={sections}
              sectionOrder={sectionOrder}
              selectedSectionId={selectedSectionId}
              onSectionSelect={setSelectedSectionId}
              onSectionCreate={handleSectionCreate}
              onSectionUpdate={handleSectionUpdate}
              onSectionDelete={handleSectionDelete}
              onSectionReorder={handleSectionReorder}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={40} minSize={30}>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="flex items-center gap-2 flex-1">
                  <Code className="h-4 w-4 text-gray-600" />
                  <Input
                    value={sectionTitle}
                    onChange={(e) => setSectionTitle(e.target.value)}
                    placeholder="Section title..."
                    className="text-sm max-w-48"
                    disabled={!selectedSectionId}
                  />
                </div>
                <Button
                  onClick={handleSaveSection}
                  disabled={loading || !selectedSectionId}
                  size="sm"
                >
                  <Save className="h-3 w-3 mr-1" />
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </div>
              
              <div className="flex-1 overflow-hidden">
                {selectedSectionId ? (
                  <EnhancedCodeEditor
                    value={sectionCode}
                    onChange={handleEditorChange}
                    onSave={handleSaveSection}
                    height="100%"
                    placeholder={`Write JSX for ${sectionTitle || 'this section'}...`}
                    editorKey={selectedSectionId}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <Plus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Select a section to start editing</p>
                      <p className="text-sm mt-2">Create a new section to get started</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={35} minSize={25}>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Live Preview</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setRefreshKey(prev => prev + 1)}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
              </div>
              
              <div className="flex-1 overflow-auto p-4 bg-white">
                <UiGeneratedContent
                  key={refreshKey}
                  course={courseProps.course}
                  courseId={courseProps?.courseId}
                  courseDisplay={courseProps.courseDisplay}
                  itemConfig={currentLessonInfo}
                  isStaffView={courseProps.isStaffView}
                  devMode={courseProps.devMode}
                />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-2 border-t border-gray-200 bg-gray-50 text-xs flex-shrink-0">
        <div className="flex items-center gap-4 text-gray-600">
          {selectedSectionId && (
            <>
              <span>📝 {sectionCode.split('\n').length} lines</span>
              <span>📊 {sectionCode.length} characters</span>
            </>
          )}
          <span>🔗 {sections.length} sections</span>
        </div>
        
        <div className="flex items-center gap-2">
          {saved && (
            <Badge variant="outline" className="text-xs text-green-600">
              ✓ Saved
            </Badge>
          )}
          {error && (
            <Badge variant="destructive" className="text-xs">
              ⚠ {error}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-screen w-full p-0 max-w-none">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-hidden">
            {isMobile ? <MobileContent /> : <DesktopContent />}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default memo(SimplifiedMultiSectionCodeEditor);