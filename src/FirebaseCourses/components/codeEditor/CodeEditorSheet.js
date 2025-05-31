import React, { useState, useCallback, useEffect } from 'react';
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
import LivePreviewPanel from './LivePreviewPanel';
import TemplateSelector from './templates/TemplateSelector';

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
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileTab, setMobileTab] = useState('editor'); // 'editor' | 'preview'
  const [showTemplates, setShowTemplates] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [previewSuccess, setPreviewSuccess] = useState(false);

  // Update local code when initialCode changes
  useEffect(() => {
    setJsxCode(initialCode);
  }, [initialCode]);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle code changes
  const handleCodeChange = useCallback((newCode) => {
    setJsxCode(newCode);
    onCodeChange?.(newCode);
  }, [onCodeChange]);

  // Handle save
  const handleSave = useCallback(() => {
    onSave?.(jsxCode);
  }, [onSave, jsxCode]);

  // Handle template selection
  const handleTemplateSelect = useCallback((templateCode) => {
    setJsxCode(templateCode);
    onCodeChange?.(templateCode);
    setShowTemplates(false);
  }, [onCodeChange]);

  // Reset code
  const handleReset = useCallback(() => {
    setJsxCode(initialCode);
    onCodeChange?.(initialCode);
  }, [initialCode, onCodeChange]);

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
            <div className="p-2 border-b border-gray-200 bg-white flex-shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTemplates(!showTemplates)}
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
              </div>
              
              {showTemplates && (
                <div className="border border-gray-200 rounded-md max-h-40 overflow-auto">
                  <TemplateSelector 
                    onSelect={handleTemplateSelect}
                    compact={true}
                  />
                </div>
              )}
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
          <div className="flex-1 overflow-hidden">
            <LivePreviewPanel
              jsxCode={jsxCode}
              courseProps={courseProps}
              autoRefresh={true}
              refreshDelay={500}
              onError={handlePreviewError}
              onSuccess={handlePreviewSuccess}
            />
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
      {/* Desktop Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-gray-800">Code Editor</h2>
          {currentLessonInfo && (
            <Badge variant="outline" className="text-xs">
              📝 {currentLessonInfo.title}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTemplates(!showTemplates)}
            className="h-8"
          >
            <Palette className="h-3 w-3 mr-1" />
            Templates
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="h-8"
          >
            {autoRefresh ? '🔄 Auto' : '⏸️ Manual'}
          </Button>
          
          {jsxCode !== initialCode && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-8"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
          
          <Button
            onClick={handleSave}
            disabled={loading}
            size="sm"
            className="h-8"
          >
            <Save className="h-3 w-3 mr-1" />
            {loading ? 'Saving...' : 'Save Code'}
          </Button>
        </div>
      </div>

      {/* Templates Panel */}
      {showTemplates && (
        <div className="border-b border-gray-200 bg-white p-3 max-h-60 overflow-auto flex-shrink-0">
          <TemplateSelector 
            onSelect={handleTemplateSelect}
            onClose={() => setShowTemplates(false)}
          />
        </div>
      )}

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
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Ctrl+S to save</span>
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
            <div className="h-full overflow-hidden">
              <LivePreviewPanel
                jsxCode={jsxCode}
                courseProps={courseProps}
                autoRefresh={autoRefresh}
                refreshDelay={800}
                onError={handlePreviewError}
                onSuccess={handlePreviewSuccess}
              />
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
          {autoRefresh && (
            <span className="text-blue-600">
              🔄 Auto-refresh enabled
            </span>
          )}
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
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-screen w-full p-0 max-w-none"
      >
        <div className="h-full flex flex-col">
          <SheetHeader className="p-4 border-b border-gray-200 flex-shrink-0">
            <SheetTitle className="flex items-center gap-2">
              <FaCodeIcon className="h-4 w-4" />
              Code Editor
              {currentLessonInfo && (
                <span className="text-sm font-normal text-gray-500">
                  - {currentLessonInfo.title}
                </span>
              )}
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 overflow-hidden">
            {isMobile ? <MobileContent /> : <DesktopContent />}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CodeEditorSheet;