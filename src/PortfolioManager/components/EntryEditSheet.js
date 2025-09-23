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
import { ScrollArea } from '../../components/ui/scroll-area';
import QuillEditor from '../../courses/CourseEditor/QuillEditor';
import PortfolioTagSelector from './PortfolioTagSelector';
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
  Eye
} from 'lucide-react';

const EntryEditSheet = ({
  isOpen,
  onClose,
  entry,
  structureId,
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        size="full"
        className="w-full max-w-none overflow-hidden flex flex-col p-0"
        style={{
          backgroundColor: '#ffffff', // Solid white base
          backgroundImage: getBackgroundGradient()
        }}
      >
        <SheetHeader className="relative px-4 sm:px-6 py-2 border-b"
          style={{
            backgroundColor: '#ffffff',
            backgroundImage: getBackgroundGradient()
          }}
        >
          <SheetTitle className="text-base sm:text-lg">
            {entry ? 'Edit Entry' : 'Create New Entry'}
          </SheetTitle>
          <DevFileIndicator fileName="EntryEditSheet.js" />
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-4 sm:px-6 py-6 space-y-6">
            {/* Title and Date - Stack on mobile, side by side on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter entry title..."
                  className="text-base sm:text-lg bg-white border-gray-300 focus-visible:ring-0 focus-visible:outline-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                  Date
                </Label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: themeColorDark }}
                  />
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="pl-10 bg-white border-gray-300 focus-visible:ring-0 focus-visible:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this entry..."
                className="bg-white border-gray-300 focus-visible:ring-0 focus-visible:outline-none"
              />
            </div>

            {/* Content Editor */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Content</Label>
              <div className="overflow-hidden rounded-lg border border-gray-300 bg-white" style={{ minHeight: '300px' }}>
                <QuillEditor
                  initialContent={formData.content}
                  onContentChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  fixedHeight="300px"
                  hideSaveButton={true}
                />
              </div>
            </div>

            {/* File Attachments */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Attachments</Label>
              <p className="text-xs sm:text-sm text-gray-600">
                Upload evidence of your work including photos, videos, documents, presentations, or any files that showcase your learning and achievements.
              </p>
              <div className="space-y-3">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center transition-colors bg-white hover:border-opacity-100"
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
                  <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3">
                    <Image className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                    <Video className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                    <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Add Files
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Supported: Images, Videos, Documents (PDF, Word, Excel, PowerPoint)
                  </p>
                </div>

                {formData.attachments.length > 0 && (
                  <div className="space-y-2">
                    {formData.attachments.map((file, index) => (
                      <Card key={index} className="p-3 bg-white border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            {file.type?.startsWith('image/') ? (
                              <Image className="w-4 h-4 text-blue-500 flex-shrink-0 mt-1" />
                            ) : file.type?.startsWith('video/') ? (
                              <Video className="w-4 h-4 text-purple-500 flex-shrink-0 mt-1" />
                            ) : (
                              <FileText className="w-4 h-4 text-gray-500 flex-shrink-0 mt-1" />
                            )}
                            <div className="flex-1 space-y-1">
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
                                className="h-7 text-sm bg-white border-gray-300 focus:border-purple-500"
                              />
                              <p className="text-xs text-gray-500 truncate">{file.name}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                            className="p-1 h-auto ml-2 hover:bg-red-50 hover:text-red-600"
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
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Tags
              </Label>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
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

        <SheetFooter className="px-4 sm:px-6 py-2 border-t"
          style={{
            backgroundColor: '#ffffff',
            backgroundImage: getBackgroundGradient()
          }}
        >
          <div className="flex flex-col-reverse sm:flex-row justify-between w-full gap-3">
            {entry && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this entry?')) {
                    onDelete(entry.id);
                    onClose();
                  }
                }}
                className="w-full sm:w-auto"
              >
                Delete
              </Button>
            )}
            <div className="flex flex-col sm:flex-row gap-2 sm:ml-auto w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              {onPreview && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onPreview(formData)}
                  disabled={isSaving || !formData.title.trim()}
                  className="gap-2 w-full sm:w-auto border-2 transition-all"
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
                  <Eye className="w-4 h-4" />
                  <span className="sm:inline">Preview</span>
                </Button>
              )}
              <Button
                onClick={handleSave}
                disabled={isSaving || !formData.title.trim()}
                className="w-full sm:w-auto text-white border-0 transition-all"
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
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {entry ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {entry ? 'Update' : 'Save'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default EntryEditSheet;