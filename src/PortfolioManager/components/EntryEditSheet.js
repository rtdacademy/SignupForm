import React, { useState, useEffect, useRef } from 'react';
import DevFileIndicator from './DevFileIndicator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '../../components/ui/sheet';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import QuillEditor from '../../courses/CourseEditor/QuillEditor';
import PortfolioTagSelector from './PortfolioTagSelector';
import EnhancedMessageButton from './EnhancedMessageButton';
import CommunicationSheet from './CommunicationSheet';
import { useCommunication } from '../hooks/useCommunication';
import {
  Save,
  Loader2,
  Upload,
  FileText,
  Image,
  Video,
  Link2,
  X,
  Calendar,
  Sparkles,
  Eye,
  MessageCircle,
  ChevronRight
} from 'lucide-react';

const EntryEditSheet = ({
  isOpen,
  onClose,
  entry,
  structureId,
  familyId,
  studentId,
  onSave,
  onDelete,
  onPreview, // New prop for preview functionality
  isSaving = false,
  collectionColor, // New prop for theme color
  // Tag selector props
  activities,
  assessments,
  resources,
  activityDescriptions,
  assessmentDescriptions,
  resourceDescriptions,
  getTagSuggestions,
  customActivities,
  customAssessments,
  customResources
}) => {
  // Add styles to prevent overflow on mobile
  useEffect(() => {
    if (isOpen) {
      const style = document.createElement('style');
      style.innerHTML = `
        /* Force sheet to respect viewport */
        .entry-edit-sheet {
          width: 100% !important;
          max-width: 100vw !important;
          position: fixed !important;
          right: 0 !important;
          left: auto !important;
        }
        @media (max-width: 640px) {
          .entry-edit-sheet {
            width: 100vw !important;
            max-width: 100vw !important;
          }
        }
        /* Constrain all form elements */
        .entry-edit-sheet input,
        .entry-edit-sheet textarea,
        .entry-edit-sheet .ql-container,
        .entry-edit-sheet .ql-toolbar,
        .entry-edit-sheet .ql-editor,
        .entry-edit-sheet .ql-snow {
          max-width: 100% !important;
          box-sizing: border-box !important;
          min-width: 0 !important;
        }
        .entry-edit-sheet .ql-toolbar {
          flex-wrap: wrap !important;
          min-width: 0 !important;
          overflow-x: auto !important;
        }
        .entry-edit-sheet .ql-toolbar button {
          min-width: 0 !important;
        }
        .entry-edit-sheet .ql-formats {
          min-width: 0 !important;
          flex-wrap: wrap !important;
        }
        .entry-edit-sheet .quill {
          min-width: 0 !important;
          width: 100% !important;
        }
        /* Mobile specific Quill adjustments */
        @media (max-width: 640px) {
          .entry-edit-sheet .ql-toolbar {
            padding: 4px !important;
            min-width: 0 !important;
          }
          .entry-edit-sheet .ql-toolbar button {
            padding: 2px !important;
            width: 24px !important;
            height: 24px !important;
          }
          .entry-edit-sheet .ql-toolbar .ql-stroke {
            stroke-width: 1.5 !important;
          }
          .entry-edit-sheet .ql-editor {
            min-height: 150px !important;
            padding: 8px !important;
            min-width: 0 !important;
          }
          .entry-edit-sheet .ql-container {
            min-width: 0 !important;
          }
        }
      `;
      style.id = 'entry-edit-sheet-styles';
      document.head.appendChild(style);

      return () => {
        const existingStyle = document.getElementById('entry-edit-sheet-styles');
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, [isOpen]);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    attachments: [],
    date: new Date().toISOString().split('T')[0],
    tags: {
      activities: [],
      assessments: [],
      resources: [],
      custom: []
    },
    type: 'text',
    description: ''
  });
  const [showCommunicationSheet, setShowCommunicationSheet] = useState(false);

  // Use communication hook for message data
  const {
    parentMessages = { count: 0, unread: 0 },
    staffMessages = { count: 0, unread: 0 },
    lastMessage = null
  } = useCommunication(
    familyId || null,
    studentId || null,
    entry?.id || null
  );

  // Initialize form when entry changes or sheet opens
  useEffect(() => {
    if (entry) {
      // Editing existing entry - mark existing files so we can differentiate them from new uploads
      const existingFiles = (entry.files || []).map(f => ({
        ...f,
        existing: true  // Mark as existing file
      }));
      setFormData({
        title: entry.title || '',
        content: entry.content || '',
        attachments: existingFiles,
        date: entry.date || entry.createdAt?.toDate?.()?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        tags: entry.tags || {
          activities: [],
          assessments: [],
          resources: [],
          custom: []
        },
        type: entry.type || 'text',
        description: entry.description || ''
      });
    } else {
      // New entry
      setFormData({
        title: '',
        content: '',
        attachments: [],
        date: new Date().toISOString().split('T')[0],
        tags: {
          activities: [],
          assessments: [],
          resources: [],
          custom: []
        },
        type: 'text',
        description: ''
      });
    }
  }, [entry, isOpen]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    // Here you would typically upload files to storage
    // For now, we'll just store file info
    const fileData = files.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file), // Temporary URL for preview
      file: file // Keep the file object for upload
    }));

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...fileData]
    }));
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a title for the entry');
      return;
    }

    const entryData = {
      title: formData.title.trim(),
      content: formData.content,
      structureId: structureId,
      type: formData.type,
      description: formData.description,
      tags: formData.tags,
      date: formData.date,
      // Include existing files (those marked with 'existing' flag)
      files: formData.attachments.filter(a => a.existing).map(a => ({
        name: a.name,
        displayTitle: a.displayTitle || null,
        type: a.type,
        size: a.size,
        url: a.url,
        uploadedAt: a.uploadedAt,
        path: a.path
      }))
    };

    // Pass NEW files separately for upload (those with 'file' property)
    // Also include metadata for each file
    const newAttachments = formData.attachments.filter(a => a.file);
    const filesToUpload = newAttachments.map(a => a.file);
    const fileMetadata = newAttachments.map(a => ({
      displayTitle: a.displayTitle || null
    }));

    await onSave(entryData, filesToUpload, entry?.id, fileMetadata);
  };

  // Helper function to darken color for hover states
  const darkenColor = (hex, percent = 0.2) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) * (1 - percent));
    const g = Math.max(0, ((num >> 8) & 0x00FF) * (1 - percent));
    const b = Math.max(0, (num & 0x0000FF) * (1 - percent));
    return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
  };

  const themeColor = collectionColor || '#8B5CF6';
  const themeColorDark = darkenColor(themeColor, 0.30);
  const themeColorDarker = darkenColor(themeColor, 0.45);

  // Create gradient styles from theme color
  const getButtonGradient = () => {
    return `linear-gradient(135deg, ${themeColor} 0%, ${themeColorDark} 100%)`;
  };

  const getButtonGradientDark = () => {
    return `linear-gradient(135deg, ${themeColorDark} 0%, ${themeColorDarker} 100%)`;
  }

  // Helper function to convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgb = hexToRgb(themeColor);
  const getBackgroundGradient = () => {
    // Always ensure we have a solid background color
    if (!rgb) {
      // Fallback to a light purple gradient with white base
      return 'linear-gradient(135deg, #f9f5ff 0%, #f0f4ff 50%, #ffffff 100%)';
    }
    // Use theme color with higher opacity and white background
    return `linear-gradient(135deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.04) 50%, #ffffff 100%)`;
  };

  return (
    <>
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        size="full"
        className="entry-edit-sheet p-0 overflow-hidden"
        style={{
          width: '100%',
          maxWidth: '100vw',
          right: 0,
          left: 'auto'
        }}
      >
        {/* Viewport-constrained container */}
        <div className="flex flex-col h-full w-full overflow-hidden" style={{ maxWidth: '100vw' }}>
          <SheetHeader className="relative px-3 sm:px-6 py-1.5 sm:py-2 border-b flex-shrink-0"
            style={{
              backgroundColor: '#ffffff',
              backgroundImage: getBackgroundGradient()
            }}
          >
            <SheetTitle className="text-sm sm:text-lg">
              {entry ? 'Edit Entry' : 'Create New Entry'}
            </SheetTitle>
            <DevFileIndicator fileName="EntryEditSheet.js" />
          </SheetHeader>

          {/* Communication button below header */}
          {entry && familyId && studentId && (
            <div className="px-3 sm:px-6 py-1 sm:py-2 border-b bg-blue-50/50 flex-shrink-0">
              <div className="sm:hidden">
                {/* Compact mobile version */}
                <Button
                  onClick={() => setShowCommunicationSheet(true)}
                  variant="ghost"
                  className="w-full h-8 px-2 py-1 flex items-center justify-between text-xs hover:bg-blue-100/50"
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Messages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {(parentMessages.unread > 0 || staffMessages.unread > 0) && (
                      <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                        {parentMessages.unread + staffMessages.unread}
                      </Badge>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Button>
              </div>
              <div className="hidden sm:block">
                {/* Full desktop version */}
                <EnhancedMessageButton
                  parentMessages={parentMessages}
                  staffMessages={staffMessages}
                  lastMessage={lastMessage}
                  onClick={() => setShowCommunicationSheet(true)}
                  size="sm"
                  orientation="horizontal"
                  className="w-full"
                />
              </div>
            </div>
          )}

          <ScrollArea className="flex-1 min-h-0">
            <div className="px-3 sm:px-6 py-3 sm:py-6 space-y-4 sm:space-y-6">
            {/* Title and Date - Stack on mobile, side by side on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
              <div className="space-y-1 sm:space-y-2 min-w-0">
                <Label htmlFor="title" className="text-xs sm:text-sm font-medium text-gray-700">
                  Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter entry title..."
                  className="text-sm sm:text-lg bg-white border-gray-300 focus-visible:ring-0 focus-visible:outline-none h-9 sm:h-10 w-full"
                />
              </div>
              <div className="space-y-1 sm:space-y-2 min-w-0">
                <Label htmlFor="date" className="text-xs sm:text-sm font-medium text-gray-700">
                  Date
                </Label>
                <div className="relative w-full">
                  <Calendar
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 pointer-events-none"
                    style={{ color: themeColorDark }}
                  />
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="pl-8 sm:pl-10 bg-white border-gray-300 focus-visible:ring-0 focus-visible:outline-none h-9 sm:h-10 text-sm sm:text-base w-full"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1 sm:space-y-2 w-full">
              <Label htmlFor="description" className="text-xs sm:text-sm font-medium text-gray-700">
                Description
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this entry..."
                className="bg-white border-gray-300 focus-visible:ring-0 focus-visible:outline-none h-9 sm:h-10 text-sm sm:text-base w-full"
              />
            </div>

            {/* Content Editor */}
            <div className="space-y-1 sm:space-y-2 w-full">
              <Label className="text-xs sm:text-sm font-medium text-gray-700">Content</Label>
              <div className="rounded-lg border border-gray-300 bg-white overflow-hidden">
                <QuillEditor
                  initialContent={formData.content}
                  onContentChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  fixedHeight="200px"
                  hideSaveButton={true}
                />
              </div>
            </div>

            {/* File Attachments */}
            <div className="space-y-1 sm:space-y-2 w-full">
              <Label className="text-xs sm:text-sm font-medium text-gray-700">Attachments</Label>
              <p className="text-xs text-gray-600 hidden sm:block">
                Upload evidence of your work including photos, videos, documents, presentations, or any files that showcase your learning and achievements.
              </p>
              <p className="text-xs text-gray-600 sm:hidden">
                Upload photos, videos, documents, and files.
              </p>
              <div className="space-y-3 w-full">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-3 sm:p-6 text-center transition-colors bg-white hover:border-opacity-100 w-full"
                  style={{
                    '--tw-border-opacity': 1
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = themeColorDark;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '';
                  }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="video/*,image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  />
                  <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <Image className="w-5 h-5 sm:w-8 sm:h-8 text-gray-400" />
                    <Video className="w-5 h-5 sm:w-8 sm:h-8 text-gray-400" />
                    <FileText className="w-5 h-5 sm:w-8 sm:h-8 text-gray-400" />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2 text-xs sm:text-sm"
                  >
                    <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                    Add Files
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 hidden sm:block">
                    Supported: Images, Videos, Documents (PDF, Word, Excel, PowerPoint)
                  </p>
                  <p className="text-xs text-gray-500 mt-2 sm:hidden">
                    Images, Videos, PDFs, Docs
                  </p>
                </div>

                {formData.attachments.length > 0 && (
                  <div className="space-y-2">
                    {formData.attachments.map((file, index) => (
                      <Card key={index} className="p-2 sm:p-3 bg-white border-gray-200">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0 overflow-hidden">
                            {file.type?.startsWith('image/') ? (
                              <Image className="w-4 h-4 text-blue-500 flex-shrink-0 mt-1" />
                            ) : file.type?.startsWith('video/') ? (
                              <Video className="w-4 h-4 text-purple-500 flex-shrink-0 mt-1" />
                            ) : (
                              <FileText className="w-4 h-4 text-gray-500 flex-shrink-0 mt-1" />
                            )}
                            <div className="flex-1 min-w-0 space-y-1 overflow-hidden">
                              <Input
                                type="text"
                                placeholder="Display title (optional)"
                                value={file.displayTitle || ''}
                                onChange={(e) => {
                                  const updatedAttachments = [...formData.attachments];
                                  updatedAttachments[index] = {
                                    ...updatedAttachments[index],
                                    displayTitle: e.target.value
                                  };
                                  setFormData(prev => ({
                                    ...prev,
                                    attachments: updatedAttachments
                                  }));
                                }}
                                className="h-7 text-xs sm:text-sm bg-white border-gray-300 focus:border-purple-500 w-full"
                              />
                              <p className="text-xs text-gray-500 truncate">{file.name}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                            className="p-1 h-auto flex-shrink-0 hover:bg-red-50 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-1 sm:space-y-2 w-full">
              <Label className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium text-gray-700">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                Tags
              </Label>
              <div className="bg-white rounded-lg p-2 sm:p-4 border border-gray-200 w-full overflow-hidden">
                <PortfolioTagSelector
                  selectedTags={formData.tags}
                  onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
                  activities={activities}
                  assessments={assessments}
                  resources={resources}
                  activityDescriptions={activityDescriptions}
                  assessmentDescriptions={assessmentDescriptions}
                  resourceDescriptions={resourceDescriptions}
                  getTagSuggestions={getTagSuggestions}
                  customActivities={customActivities}
                  customAssessments={customAssessments}
                  customResources={customResources}
                  content={formData.content || formData.title}
                  compact={false}
                />
              </div>
            </div>

            </div>
          </ScrollArea>

          <SheetFooter className="px-3 sm:px-6 py-2 sm:py-3 border-t flex-shrink-0"
            style={{
              backgroundColor: '#ffffff',
              backgroundImage: getBackgroundGradient()
            }}
          >
          <div className="flex flex-row justify-end w-full gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
                className="flex-1 sm:w-auto text-xs sm:text-sm h-8 sm:h-10"
              >
                Cancel
              </Button>
              {onPreview && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onPreview(formData)}
                  disabled={isSaving || !formData.title.trim()}
                  className="gap-1 sm:gap-2 flex-1 sm:w-auto border-2 transition-all text-xs sm:text-sm h-8 sm:h-10"
                  style={{
                    borderColor: themeColorDark,
                    color: themeColorDark
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundImage = getButtonGradient();
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundImage = '';
                    e.currentTarget.style.color = themeColorDark;
                    e.currentTarget.style.borderColor = themeColorDark;
                  }}
                >
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Preview</span>
                </Button>
              )}
              <Button
                onClick={handleSave}
                disabled={isSaving || !formData.title.trim()}
                className="flex-1 sm:w-auto text-white border-0 transition-all text-xs sm:text-sm h-8 sm:h-10"
                style={{
                  backgroundImage: isSaving || !formData.title.trim() ? '' : getButtonGradient(),
                  backgroundColor: isSaving || !formData.title.trim() ? '#9CA3AF' : ''
                }}
                onMouseEnter={(e) => {
                  if (!isSaving && formData.title.trim()) {
                    e.currentTarget.style.backgroundImage = getButtonGradientDark();
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSaving && formData.title.trim()) {
                    e.currentTarget.style.backgroundImage = getButtonGradient();
                  }
                }}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                    {entry ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    {entry ? 'Update' : 'Save'}
                  </>
                )}
              </Button>
          </div>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>

    {/* Communication Sheet */}
    {entry && familyId && studentId && (
      <CommunicationSheet
        entryId={entry.id}
        entryTitle={formData.title || entry.title}
        familyId={familyId}
        studentId={studentId}
        isOpen={showCommunicationSheet}
        onOpenChange={setShowCommunicationSheet}
      />
    )}
    </>
  );
};

export default EntryEditSheet;