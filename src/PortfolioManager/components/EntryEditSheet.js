import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles
} from 'lucide-react';

const EntryEditSheet = ({
  isOpen,
  onClose,
  entry,
  structureId,
  onSave,
  onDelete,
  isSaving = false,
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
        type: a.type,
        size: a.size,
        url: a.url,
        uploadedAt: a.uploadedAt,
        path: a.path
      }))
    };

    // Pass NEW files separately for upload (those with 'file' property)
    const filesToUpload = formData.attachments
      .filter(a => a.file)
      .map(a => a.file);

    await onSave(entryData, filesToUpload, entry?.id);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" size="full" className="w-full max-w-none overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl">
            {entry ? 'Edit Entry' : 'Create New Entry'}
          </SheetTitle>
          <SheetDescription>
            {entry ? 'Update your portfolio entry details' : 'Add a new entry to your portfolio'}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 mt-6">
          <div className="space-y-6 pr-6">
            {/* Title and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter entry title..."
                  className="text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this entry..."
              />
            </div>

            {/* Content Editor */}
            <div className="space-y-2">
              <Label>Content</Label>
              <div className="overflow-hidden" style={{ minHeight: '400px' }}>
                <QuillEditor
                  initialContent={formData.content}
                  onContentChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  fixedHeight="400px"
                  hideSaveButton={true}
                />
              </div>
            </div>

            {/* File Attachments */}
            <div className="space-y-2">
              <Label>Attachments</Label>
              <p className="text-sm text-gray-600">
                Upload evidence of your work including photos, videos, documents, presentations, or any files that showcase your learning and achievements.
              </p>
              <div className="space-y-3">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="video/*,image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  />
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <Image className="w-8 h-8 text-gray-400" />
                    <Video className="w-8 h-8 text-gray-400" />
                    <FileText className="w-8 h-8 text-gray-400" />
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
                    Supported: Images (JPG, PNG, GIF), Videos (MP4, MOV, etc.), Documents (PDF, Word, Excel, PowerPoint)
                  </p>
                </div>

                {formData.attachments.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {formData.attachments.map((file, index) => (
                      <Card key={index} className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {file.type?.startsWith('image/') ? (
                            <Image className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          ) : file.type?.startsWith('video/') ? (
                            <Video className="w-4 h-4 text-purple-500 flex-shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          )}
                          <span className="text-sm truncate">{file.name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                          className="p-1 h-auto"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Tags
              </Label>
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
        </ScrollArea>

        <SheetFooter className="mt-6 pt-6 border-t">
          <div className="flex justify-between w-full">
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
              >
                Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !formData.title.trim()}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {entry ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {entry ? 'Update Entry' : 'Save Entry'}
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