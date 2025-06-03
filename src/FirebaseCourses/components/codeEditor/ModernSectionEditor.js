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
import { Code, Eye, Save, Plus, RefreshCw, HelpCircle, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen, BookOpen } from 'lucide-react';
import { useToast } from '../../../components/hooks/use-toast';
import CodeMirrorWrapper from './CodeMirrorWrapper';
import UiGeneratedContent from '../content/UiGeneratedContent';
import SectionManager from './SectionManager';
import AssessmentConfigForm from './AssessmentConfigForm';
import CodeExamplesSheet from './CodeExamplesSheet';

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
  const [showAssessmentConfig, setShowAssessmentConfig] = useState(false);
  const [sectionsCollapsed, setSectionsCollapsed] = useState(false);
  const [missingConfigs, setMissingConfigs] = useState([]);
  const [configCheckLoading, setConfigCheckLoading] = useState(false);
  const [showExamplesSheet, setShowExamplesSheet] = useState(false);

  const { toast } = useToast();

  // Initialize cloud function
  const functions = getFunctions();
  const manageCourseSection = httpsCallable(functions, 'manageCourseSection');
  const debugLesson = httpsCallable(functions, 'debugLesson');
  const manageDatabaseAssessmentConfig = httpsCallable(functions, 'manageDatabaseAssessmentConfig');

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

  // Removed click outside to collapse - users must use buttons

  // Check assessment configurations whenever sections change
  useEffect(() => {
    if (sections.length > 0 && courseId && currentLessonInfo?.contentPath) {
      checkAssessmentConfigurations();
    }
  }, [sections, courseId, currentLessonInfo?.contentPath]);

  // Track last loaded section to prevent unnecessary reloads
  const lastLoadedSectionId = useRef(null);
  
  // Ref to store the latest content from editor
  const currentEditorContent = useRef('');
  
  // Ref for the sections panel to detect outside clicks
  const sectionsPanelRef = useRef(null);
  
  // Handler to capture editor content changes
  const handleEditorChange = useCallback((newContent) => {
    // Update both ref and state
    currentEditorContent.current = newContent;
    setSectionCode(newContent);
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
        
        // Check if this is an assessment section to show config form
        console.log('🔍 Section type check:', { 
          sectionId: section.id,
          sectionType: section.type, 
          assessmentType: section.assessmentType,
          shouldShowConfig: section.type === 'assessment' 
        });
        setShowAssessmentConfig(section.type === 'assessment');
        
        console.log(`📝 Loaded section "${section.title}" for editing (section switch)`);
      }
    } else if (!selectedSectionId) {
      setSectionCode('');
      setSectionTitle('');
      currentEditorContent.current = '';
      lastLoadedSectionId.current = null;
      setShowAssessmentConfig(false);
    }
  }, [selectedSectionId]); // Remove sections from dependencies to prevent reload on section updates

  // Separate effect to handle initial section load when sections data arrives
  useEffect(() => {
    if (selectedSectionId && sections.length > 0 && !lastLoadedSectionId.current) {
      const section = sections.find(s => s.id === selectedSectionId);
      if (section) {
        setSectionCode(section.originalCode || '');
        setSectionTitle(section.title || '');
        currentEditorContent.current = section.originalCode || '';
        lastLoadedSectionId.current = selectedSectionId;
        console.log(`📝 Initial load of section "${section.title}"`);
      }
    }
  }, [sections, selectedSectionId]);

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

  const checkAssessmentConfigurations = async () => {
    try {
      setConfigCheckLoading(true);
      const assessmentSections = sections.filter(section => section.type === 'assessment');
      
      if (assessmentSections.length === 0) {
        setMissingConfigs([]);
        return;
      }

      console.log(`🔍 Checking configurations for ${assessmentSections.length} assessment sections...`);

      const missing = [];
      
      for (const section of assessmentSections) {
        if (!section.assessmentId) {
          missing.push({
            sectionId: section.id,
            sectionTitle: section.title,
            reason: 'Missing assessment ID'
          });
          continue;
        }

        try {
          const result = await manageDatabaseAssessmentConfig({
            action: 'load',
            courseId: courseId,
            lessonPath: currentLessonInfo?.contentPath,
            assessmentId: section.assessmentId
          });

          if (!result.data.success || !result.data.configuration) {
            missing.push({
              sectionId: section.id,
              sectionTitle: section.title,
              assessmentId: section.assessmentId,
              reason: 'Database configuration not found'
            });
          }
        } catch (error) {
          console.warn(`Config check failed for ${section.title}:`, error);
          missing.push({
            sectionId: section.id,
            sectionTitle: section.title,
            assessmentId: section.assessmentId,
            reason: 'Failed to check configuration'
          });
        }
      }

      setMissingConfigs(missing);
      
      if (missing.length > 0) {
        console.log(`⚠️ Found ${missing.length} assessment sections with missing configurations:`, missing);
      } else {
        console.log(`✅ All assessment configurations are complete`);
      }
    } catch (error) {
      console.error('❌ Error checking assessment configurations:', error);
      setError(`Failed to check assessment configurations: ${error.message}`);
    } finally {
      setConfigCheckLoading(false);
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
        // DON'T update sections state - keep the local editor content
        // This prevents the editor from reverting to the old content
        
        // Show success
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        
        // Refresh preview only
        setRefreshKey(prev => prev + 1);
        
        console.log(`✅ ${result.data.message}`);
        console.log(`📝 Keeping local editor content - not syncing from server`);
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

  const handleSectionReorder = useCallback(async (newOrder) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔄 Reordering sections: [${newOrder.join(', ')}]`);

      // Update local state immediately for responsive UI
      setSectionOrder(newOrder);

      // Persist to database
      const result = await manageCourseSection({
        action: 'reorderSections',
        courseId,
        lessonPath: currentLessonInfo.contentPath,
        newSectionOrder: newOrder,
        userEmail: currentUser?.email
      });

      if (result.data.success) {
        // Update with server response to ensure consistency
        setSections(result.data.sections);
        setSectionOrder(result.data.sectionOrder);
        
        // Refresh preview to show new order
        setRefreshKey(prev => prev + 1);
        
        console.log(`✅ ${result.data.message}`);
      } else {
        throw new Error(result.data.error || 'Failed to reorder sections');
      }
    } catch (err) {
      console.error('❌ Error reordering sections:', err);
      setError(`Failed to reorder sections: ${err.message}`);
      
      // Revert to previous order on error
      loadLessonData();
    } finally {
      setLoading(false);
    }
  }, [currentLessonInfo, courseId, currentUser, manageCourseSection, loadLessonData]);

  // Handle assessment configuration save
  const handleAssessmentConfigSave = useCallback(async (config) => {
    if (!selectedSectionId || !currentLessonInfo?.contentPath) {
      setError('No assessment selected or lesson path missing');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const section = sections.find(s => s.id === selectedSectionId);
      if (!section || section.type !== 'assessment') {
        throw new Error('Selected section is not an assessment');
      }

      console.log(`💾 Saving assessment configuration for "${section.title}"`);

      // Call the database assessment config management function
      const manageDatabaseAssessmentConfig = httpsCallable(functions, 'manageDatabaseAssessmentConfig');
      
      const functionParams = {
        action: 'save',
        courseId: courseId,
        lessonPath: currentLessonInfo?.contentPath,
        assessmentId: section.assessmentId,
        configuration: {
          title: section.title,
          type: section.assessmentType,
          ...config
        }
      };
      
      console.log('🔧 Function parameters:', functionParams);
      
      const result = await manageDatabaseAssessmentConfig(functionParams);

      if (result.data.success) {
        // Update the section with the new config
        const updatedSections = sections.map(s => 
          s.id === selectedSectionId 
            ? { ...s, assessmentConfig: config }
            : s
        );
        setSections(updatedSections);
        
        // Show success
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        
        // Recheck configurations after successful save
        await checkAssessmentConfigurations();
        
        console.log(`✅ Assessment configuration saved successfully`);
      } else {
        throw new Error(result.data.error || 'Failed to save assessment configuration');
      }
    } catch (err) {
      console.error('❌ Error saving assessment configuration:', err);
      setError(`Failed to save assessment configuration: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [selectedSectionId, sections, currentLessonInfo, courseId, functions]);

  // Handle assessment config cancel
  const handleAssessmentConfigCancel = useCallback(() => {
    setShowAssessmentConfig(false);
  }, []);

  // Handle code insertion from examples
  const handleInsertCode = useCallback(async ({ code, imports, title }) => {
    // Extract existing imports from current code
    const currentCode = currentEditorContent.current || sectionCode;
    const existingImports = [];
    const importRegex = /^import\s+.+from\s+['"].*['"];?\s*$/gm;
    let match;
    while ((match = importRegex.exec(currentCode)) !== null) {
      existingImports.push(match[0].trim());
    }
    
    // Filter out duplicate imports
    const newImports = imports.filter(imp => 
      !existingImports.some(existing => existing.includes(imp))
    );
    
    // Construct the new code
    let newCode = currentCode;
    if (newImports.length > 0) {
      // Add new imports at the top
      const codeWithoutImports = currentCode.replace(importRegex, '').trim();
      newCode = [...existingImports, ...newImports].join('\n') + '\n\n' + codeWithoutImports;
    }
    
    // Add the example code at the end
    newCode = newCode.trim() + '\n\n' + code;
    
    // Update both ref and state to ensure consistency
    currentEditorContent.current = newCode;
    setSectionCode(newCode);
    
    // Optionally update the section title if it's empty
    if (!sectionTitle.trim() && title) {
      setSectionTitle(title);
    }
    
    // Don't automatically save - let the user decide when to save
    // This prevents potential state sync issues
    console.log(`📝 Inserted example "${title}" - ${newCode.length} chars total`);
    
    // Show a brief indication that code was inserted
    toast({
      title: "Code inserted",
      description: `Example "${title}" has been added to your editor`
    });
  }, [sectionCode, sectionTitle, toast]);

  // Component to show missing assessment configurations
  const MissingConfigsWarning = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="max-w-md">
        <div className="mb-4">
          <HelpCircle className="h-16 w-16 mx-auto text-orange-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Assessment Configurations Required
        </h3>
        <p className="text-gray-600 mb-4">
          Before the live preview can be displayed, all assessment sections need their database configurations completed.
        </p>
        
        {configCheckLoading ? (
          <div className="mb-4">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto text-blue-500" />
            <p className="text-sm text-gray-500 mt-2">Checking configurations...</p>
          </div>
        ) : (
          <div className="mb-4">
            <p className="text-sm font-medium text-orange-600 mb-2">
              Missing configurations for {missingConfigs.length} section{missingConfigs.length !== 1 ? 's' : ''}:
            </p>
            <ul className="text-sm text-gray-700 space-y-1">
              {missingConfigs.map((config, index) => (
                <li key={index} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                  <span className="font-medium">{config.sectionTitle}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedSectionId(config.sectionId);
                      setShowAssessmentConfig(true);
                    }}
                    className="ml-2"
                  >
                    Configure
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <p className="text-xs text-gray-500">
          Select an assessment section and use the configuration form to complete the setup.
        </p>
      </div>
    </div>
  );

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
          {showAssessmentConfig ? 'Config' : 'Edit'}
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
            lessonPath={currentLessonInfo?.contentPath}
          />
        )}
        
        {mobileTab === 'editor' && selectedSectionId && (
          <div className="flex flex-col h-full">
            {showAssessmentConfig ? (
              // Assessment Configuration Mode
              <div className="flex-1 overflow-auto p-4">
                <AssessmentConfigForm
                  assessmentType={sections.find(s => s.id === selectedSectionId)?.assessmentType}
                  config={sections.find(s => s.id === selectedSectionId)?.assessmentConfig || {}}
                  onSave={handleAssessmentConfigSave}
                  onCancel={handleAssessmentConfigCancel}
                  loading={loading}
                  title={`Configure ${sectionTitle}`}
                />
              </div>
            ) : (
              // Code Editor Mode
              <>
                <div className="p-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                  <Input
                    value={sectionTitle}
                    onChange={(e) => setSectionTitle(e.target.value)}
                    placeholder="Section title..."
                    className="mb-2"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowExamplesSheet(true)}
                    >
                      <BookOpen className="h-3 w-3 mr-1" />
                      Examples
                    </Button>
                    <Button
                      onClick={handleSaveSection}
                      disabled={loading}
                      size="sm"
                    >
                      <Save className="h-3 w-3 mr-1" />
                      {loading ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <CodeMirrorWrapper
                    value={sectionCode}
                    onChange={handleEditorChange}
                    onSave={handleSaveSection}
                    height="100%"
                    placeholder={`Write JSX for ${sectionTitle || 'this section'}...`}
                    sectionId={selectedSectionId}
                  />
                </div>
              </>
            )}
          </div>
        )}
        
        {mobileTab === 'preview' && (
          <div className="flex flex-col h-full">
            <div className={`p-2 border-b border-gray-200 flex items-center justify-between flex-shrink-0 ${missingConfigs.length > 0 ? 'bg-orange-50' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Combined Preview</span>
                {missingConfigs.length > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {missingConfigs.length} config{missingConfigs.length !== 1 ? 's' : ''} missing
                  </Badge>
                )}
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setRefreshKey(prev => prev + 1);
                  checkAssessmentConfigurations();
                }}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-white">
              {missingConfigs.length > 0 ? (
                <MissingConfigsWarning />
              ) : (
                <UiGeneratedContent
                  key={refreshKey}
                  course={courseProps.course}
                  courseId={courseProps?.courseId}
                  courseDisplay={courseProps.courseDisplay}
                  itemConfig={currentLessonInfo}
                  isStaffView={courseProps.isStaffView}
                  devMode={courseProps.devMode}
                />
              )}
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
          {!sectionsCollapsed && (
            <>
              <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                <div ref={sectionsPanelRef}>
                  <SectionManager
                    sections={sections}
                    sectionOrder={sectionOrder}
                    selectedSectionId={selectedSectionId}
                    onSectionSelect={setSelectedSectionId}
                    onSectionCreate={handleSectionCreate}
                    onSectionUpdate={handleSectionUpdate}
                    onSectionDelete={handleSectionDelete}
                    onSectionReorder={handleSectionReorder}
                    lessonPath={currentLessonInfo?.contentPath}
                  />
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />
            </>
          )}

          {/* Expand Button - when collapsed */}
          {sectionsCollapsed && (
            <div className="relative">
              <Button
                variant="default"
                size="sm"
                onClick={() => setSectionsCollapsed(false)}
                className="absolute left-3 top-3 z-10 shadow-lg border-2 border-blue-200 bg-blue-600 hover:bg-blue-700"
                title="Show sections panel"
              >
                <PanelLeftOpen className="h-4 w-4 mr-2" />
                Show Sections
              </Button>
            </div>
          )}

          <ResizablePanel defaultSize={sectionsCollapsed ? 65 : 40} minSize={30}>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="flex items-center gap-2 flex-1">
                  {!sectionsCollapsed && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSectionsCollapsed(true)}
                      className="h-8 px-3 border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700"
                      title="Hide sections panel"
                    >
                      <PanelLeftClose className="h-4 w-4 mr-1" />
                      Hide
                    </Button>
                  )}
                  {showAssessmentConfig ? (
                    <HelpCircle className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Code className="h-4 w-4 text-gray-600" />
                  )}
                  <Input
                    value={sectionTitle}
                    onChange={(e) => setSectionTitle(e.target.value)}
                    placeholder="Section title..."
                    className="text-sm max-w-48"
                    disabled={!selectedSectionId || showAssessmentConfig}
                  />
                  {showAssessmentConfig && (
                    <Badge variant="secondary" className="text-xs">
                      Assessment Config
                    </Badge>
                  )}
                </div>
                {!showAssessmentConfig && selectedSectionId && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowExamplesSheet(true)}
                      className="h-8"
                    >
                      <BookOpen className="h-3 w-3 mr-1" />
                      Examples
                    </Button>
                    <Button
                      onClick={handleSaveSection}
                      disabled={loading || !selectedSectionId}
                      size="sm"
                    >
                      <Save className="h-3 w-3 mr-1" />
                      {loading ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex-1 overflow-hidden">
                {selectedSectionId ? (
                  showAssessmentConfig ? (
                    // Assessment Configuration Mode
                    <div className="h-full overflow-auto p-4">
                      <AssessmentConfigForm
                        assessmentType={sections.find(s => s.id === selectedSectionId)?.assessmentType}
                        config={sections.find(s => s.id === selectedSectionId)?.assessmentConfig || {}}
                        onSave={handleAssessmentConfigSave}
                        onCancel={handleAssessmentConfigCancel}
                        loading={loading}
                        title={`Configure ${sectionTitle}`}
                      />
                    </div>
                  ) : (
                    // Code Editor Mode
                    <CodeMirrorWrapper
                      value={sectionCode}
                      onChange={handleEditorChange}
                      onSave={handleSaveSection}
                      height="100%"
                      placeholder={`Write JSX for ${sectionTitle || 'this section'}...`}
                      sectionId={selectedSectionId}
                    />
                  )
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

          <ResizablePanel defaultSize={sectionsCollapsed ? 35 : 35} minSize={25}>
            <div className="flex flex-col h-full">
              <div className={`flex items-center justify-between p-2 border-b border-gray-200 flex-shrink-0 ${missingConfigs.length > 0 ? 'bg-orange-50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Live Preview</span>
                  {missingConfigs.length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {missingConfigs.length} config{missingConfigs.length !== 1 ? 's' : ''} missing
                    </Badge>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setRefreshKey(prev => prev + 1);
                    checkAssessmentConfigurations();
                  }}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
              </div>
              
              <div className="flex-1 overflow-auto p-4 bg-white">
                {missingConfigs.length > 0 ? (
                  <MissingConfigsWarning />
                ) : (
                  <UiGeneratedContent
                    key={refreshKey}
                    course={courseProps.course}
                    courseId={courseProps?.courseId}
                    courseDisplay={courseProps.courseDisplay}
                    itemConfig={currentLessonInfo}
                    isStaffView={courseProps.isStaffView}
                    devMode={courseProps.devMode}
                  />
                )}
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
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-screen w-full p-0 max-w-none">
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-hidden">
              {isMobile ? <MobileContent /> : <DesktopContent />}
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      <CodeExamplesSheet
        isOpen={showExamplesSheet}
        onOpenChange={setShowExamplesSheet}
        currentSectionCode={sectionCode}
        onInsertCode={handleInsertCode}
      />
    </>
  );
};

export default memo(SimplifiedMultiSectionCodeEditor);