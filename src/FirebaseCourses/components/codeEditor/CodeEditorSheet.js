import React, { useState, useCallback, useEffect, memo } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../../../components/ui/resizable';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetTrigger 
} from '../../../components/ui/sheet';
import { Code, Eye, Save, RotateCcw, Palette } from 'lucide-react';
import { FaCode as FaCodeIcon } from 'react-icons/fa';
import EnhancedCodeEditor from './EnhancedCodeEditor';
import UiGeneratedContent from '../content/UiGeneratedContent';
import TemplateGallery from './templates/TemplateGallery';

const CodeEditorSheet = ({
  initialCode = '',
  courseProps = {},
  currentLessonInfo = null,
  onSave,
  onCodeChange,
  loading = false,
  saved = false,
  error = null,
  isOpen = false,
  onOpenChange
}) => {
  const [jsxCode, setJsxCode] = useState(initialCode);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileTab, setMobileTab] = useState('editor'); // 'editor' | 'preview'
  const [templateGalleryOpen, setTemplateGalleryOpen] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [previewSuccess, setPreviewSuccess] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Update local code when initialCode changes (only when actually different)
  useEffect(() => {
    if (initialCode !== jsxCode) {
      setJsxCode(initialCode);
    }
  }, [initialCode]); // Removed jsxCode dependency to prevent circular updates

  // Refresh preview when code is saved
  useEffect(() => {
    if (saved) {
      setRefreshKey(prev => prev + 1);
    }
  }, [saved]);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle code changes - this should ONLY be called on save now
  const handleCodeChange = useCallback((newCode) => {
    setJsxCode(newCode);
    onCodeChange?.(newCode);
  }, [onCodeChange]);

  // Handle save - ensure parent gets the latest code
  const handleSave = useCallback(() => {
    onCodeChange?.(jsxCode); // Make sure parent has the latest code
    onSave?.(jsxCode);
  }, [onSave, onCodeChange, jsxCode]);

  // Handle template gallery
  const handleOpenTemplateGallery = useCallback(() => {
    setTemplateGalleryOpen(true);
  }, []);

  // Reset code - let save handle parent notification
  const handleReset = useCallback(() => {
    setJsxCode(initialCode);
    // Don't notify parent immediately - let them save when ready
  }, [initialCode]);

  // Handle preview feedback
  const handlePreviewError = useCallback((error) => {
    setPreviewError(error.message);
    setPreviewSuccess(false);
  }, []);

  const handlePreviewSuccess = useCallback(() => {
    setPreviewError(null);
    setPreviewSuccess(true);
    setTimeout(() => setPreviewSuccess(false), 2000);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleSave, isOpen]);

  // Mobile Layout Content
  const MobileContent = () => (
    <div className="flex flex-col h-full">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant={mobileTab === 'editor' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMobileTab('editor')}
            className="h-8"
          >
            <Code className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button
            variant={mobileTab === 'preview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMobileTab('preview')}
            className="h-8"
          >
            <Eye className="h-3 w-3 mr-1" />
            Preview
          </Button>
        </div>
        
        {mobileTab === 'editor' && (
          <Button
            onClick={handleSave}
            disabled={loading}
            size="sm"
            className="h-8"
          >
            <Save className="h-3 w-3 mr-1" />
            {loading ? 'Saving...' : 'Save & Preview'}
          </Button>
        )}
      </div>

      {/* Mobile Content */}
      <div className="flex-1 overflow-hidden">
        {mobileTab === 'editor' ? (
          <div className="h-full flex flex-col">
            {/* Mobile Editor Toolbar */}
            <div className="p-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">JSX Editor</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenTemplateGallery}
                    className="h-7"
                  >
                    <Palette className="h-3 w-3 mr-1" />
                    Templates
                  </Button>
                  {jsxCode !== initialCode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      className="h-7"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Reset
                    </Button>
                  )}
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    size="sm"
                    className="h-7"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
              
            </div>
            
            {/* Mobile Editor */}
            <div className="flex-1 overflow-hidden">
              <EnhancedCodeEditor
                value={jsxCode}
                onChange={handleCodeChange}
                onSave={handleSave}
                height="100%"
                placeholder="Write your JSX component here..."
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Mobile Preview Header */}
            <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Live Preview</span>
              </div>
              <div className="text-xs text-gray-500">
                Auto-refresh on save
              </div>
            </div>
            
            {/* Mobile Scrollable Preview Content */}
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

      {/* Mobile Status Bar */}
      <div className="p-2 border-t border-gray-200 bg-gray-50 text-xs flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentLessonInfo && (
              <span className="text-gray-600">
                📝 {currentLessonInfo.title}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {saved && <Badge variant="outline" className="text-xs">✓ Saved</Badge>}
            {error && <Badge variant="destructive" className="text-xs">⚠ Error</Badge>}
            {previewSuccess && <Badge variant="outline" className="text-xs text-green-600">✓ Preview</Badge>}
          </div>
        </div>
      </div>
    </div>
  );

  // Desktop Layout Content
  const DesktopContent = () => (
    <div className="flex flex-col h-full">
      {/* Desktop Header - Simplified */}
      <div className="flex items-center gap-3 p-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <h2 className="font-semibold text-gray-800">Code Editor</h2>
        {currentLessonInfo && (
          <Badge variant="outline" className="text-xs">
            📝 {currentLessonInfo.title}
          </Badge>
        )}
      </div>


      {/* Resizable Panels */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Code Editor Panel */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="flex flex-col h-full">
              {/* Editor Toolbar */}
              <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">JSX Editor</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenTemplateGallery}
                    className="h-7"
                  >
                    <Palette className="h-3 w-3 mr-1" />
                    Templates
                  </Button>
                  
                  {jsxCode !== initialCode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      className="h-7"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Reset
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    size="sm"
                    className="h-7"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 ml-2">
                    <span>Ctrl+S to save</span>
                  </div>
                </div>
              </div>
              
              {/* Editor */}
              <div className="flex-1 overflow-hidden">
                <EnhancedCodeEditor
                  value={jsxCode}
                  onChange={handleCodeChange}
                  onSave={handleSave}
                  height="100%"
                  placeholder="Write your JSX component here..."
                />
              </div>
            </div>
          </ResizablePanel>

          {/* Resizable Handle */}
          <ResizableHandle withHandle />

          {/* Preview Panel */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="flex flex-col h-full">
              {/* Preview Header */}
              <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Live Preview</span>
                </div>
                <div className="text-xs text-gray-500">
                  Auto-refresh on save
                </div>
              </div>
              
              {/* Scrollable Preview Content */}
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
          <span>
            📊 {jsxCode.split('\n').length} lines
          </span>
          <span>
            📝 {jsxCode.length} characters
          </span>
          <span className="text-gray-600">
            🔄 Auto-refresh on save
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {saved && (
            <Badge variant="outline" className="text-xs text-green-600">
              ✓ Saved successfully
            </Badge>
          )}
          {error && (
            <Badge variant="destructive" className="text-xs">
              ⚠ {error}
            </Badge>
          )}
          {previewError && (
            <Badge variant="destructive" className="text-xs">
              ⚠ Preview: {previewError}
            </Badge>
          )}
          {previewSuccess && (
            <Badge variant="outline" className="text-xs text-green-600">
              ✓ Preview updated
            </Badge>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent 
          side="bottom" 
          className="h-screen w-full p-0 max-w-none"
        >
          <div className="h-full flex flex-col">
        
            
            <div className="flex-1 overflow-hidden">
              {isMobile ? <MobileContent /> : <DesktopContent />}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Template Gallery */}
      <TemplateGallery 
        isOpen={templateGalleryOpen}
        onOpenChange={setTemplateGalleryOpen}
      />
    </>
  );
};

// Memoize component to prevent unnecessary re-renders
export default memo(CodeEditorSheet);