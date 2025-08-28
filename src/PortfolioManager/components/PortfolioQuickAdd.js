import React, { useState, useRef, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../../components/ui/sheet';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Separator } from '../../components/ui/separator';
import PortfolioCourseSelector from './PortfolioCourseSelector';
import {
  Upload,
  Camera,
  X,
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle,
  Image,
  FileText,
  Film,
  Link,
  Tag,
  ChevronDown,
  ChevronRight,
  Zap,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PortfolioTagSelector from './PortfolioTagSelector';

const PortfolioQuickAdd = ({
  isOpen,
  onClose,
  portfolioStructure = [],
  getStructureHierarchy,
  onCreateEntry,
  activities = [],
  assessments = [],
  resources = [],
  activityDescriptions = {},
  assessmentDescriptions = {},
  resourceDescriptions = {},
  getTagSuggestions,
  preselectedStructureId = null
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  
  // State management
  const [selectedStructureId, setSelectedStructureId] = useState(preselectedStructureId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [link, setLink] = useState('');
  const [entryType, setEntryType] = useState('file');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [tags, setTags] = useState({
    activities: [],
    assessments: [],
    resources: []
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // If there's only one structure, auto-select it
      if (portfolioStructure.length === 1) {
        setSelectedStructureId(portfolioStructure[0].id);
      } else if (preselectedStructureId) {
        setSelectedStructureId(preselectedStructureId);
      }
      
      // Reset form
      setTitle('');
      setDescription('');
      setFiles([]);
      setLink('');
      setEntryType('file');
      setError(null);
      setSuccess(false);
      setShowTags(false);
      setTags({
        activities: [],
        assessments: [],
        resources: []
      });
    }
  }, [isOpen, portfolioStructure, preselectedStructureId]);

  // Handle file selection
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Auto-generate title from first file if title is empty
    if (!title && selectedFiles.length > 0) {
      const fileName = selectedFiles[0].name.replace(/\.[^/.]+$/, ''); // Remove extension
      setTitle(fileName.replace(/[-_]/g, ' ')); // Replace dashes/underscores with spaces
    }
    
    setFiles(prev => [...prev, ...selectedFiles]);
    setEntryType('file');
  };

  // Handle camera capture (mobile)
  const handleCameraCapture = (e) => {
    const capturedFiles = Array.from(e.target.files);
    
    // Auto-generate title with timestamp
    if (!title && capturedFiles.length > 0) {
      const date = new Date().toLocaleDateString();
      setTitle(`Photo from ${date}`);
    }
    
    setFiles(prev => [...prev, ...capturedFiles]);
    setEntryType('image');
  };

  // Remove file from selection
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle quick save
  const handleQuickSave = async () => {
    // Validation
    if (!selectedStructureId) {
      setError('Please select a course or section');
      return;
    }

    if (files.length === 0 && !link.trim()) {
      setError('Please add at least one file or link');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Determine entry type
      let finalEntryType = entryType;
      if (link && !files.length) {
        finalEntryType = 'link';
      } else if (files.length > 0) {
        // Check file types to determine entry type
        const hasImages = files.some(f => f.type.startsWith('image/'));
        const hasVideos = files.some(f => f.type.startsWith('video/'));
        const hasDocs = files.some(f => !f.type.startsWith('image/') && !f.type.startsWith('video/'));
        
        if (hasImages && !hasVideos && !hasDocs) {
          finalEntryType = 'image';
        } else if (hasVideos && !hasImages && !hasDocs) {
          finalEntryType = 'video';
        } else if (hasDocs && !hasImages && !hasVideos) {
          finalEntryType = 'file';
        } else {
          finalEntryType = 'combined';
        }
      }

      // Create entry data
      const entryData = {
        title: title.trim() || `Quick Add - ${new Date().toLocaleDateString()}`,
        type: finalEntryType,
        content: description.trim(),
        date: new Date().toISOString().split('T')[0],
        structureId: selectedStructureId,
        tags: showTags ? tags : { activities: [], assessments: [], resources: [] },
        reflections: '',
        quickAdd: true, // Mark as quick-add entry
        link: link.trim() || null
      };

      // Create the entry
      await onCreateEntry(entryData, files);

      // Show success feedback
      setSuccess(true);
      
      // Reset form after brief delay
      setTimeout(() => {
        if (portfolioStructure.length > 1) {
          // Keep the structure selection if multiple courses
          setTitle('');
          setDescription('');
          setFiles([]);
          setLink('');
          setError(null);
          setSuccess(false);
          setTags({ activities: [], assessments: [], resources: [] });
        } else {
          // Close if only one course (likely want to see their addition)
          onClose();
        }
      }, 1500);

    } catch (err) {
      console.error('Error creating quick entry:', err);
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Get file icon based on type
  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type.startsWith('video/')) return Film;
    return FileText;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Quick Add to Portfolio
          </SheetTitle>
          <SheetDescription>
            Quickly add photos, documents, or links to your portfolio
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-700">Entry added successfully!</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Course/Section Selection */}
          {portfolioStructure.length > 0 && (
            <PortfolioCourseSelector
              structures={getStructureHierarchy ? getStructureHierarchy() : portfolioStructure}
              selectedId={selectedStructureId}
              onSelect={setSelectedStructureId}
              mobileFullWidth={true}
            />
          )}

          {/* Quick Upload Options */}
          <div className="space-y-3">
            <Label>Add Content</Label>
            
            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handleCameraCapture}
              className="hidden"
            />

            {/* Upload buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="h-20 flex-col gap-2"
              >
                <Upload className="w-6 h-6" />
                <span className="text-xs">Upload Files</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => cameraInputRef.current?.click()}
                className="h-20 flex-col gap-2"
              >
                <Camera className="w-6 h-6" />
                <span className="text-xs">Take Photo</span>
                <Badge variant="secondary" className="text-xs">
                  <Smartphone className="w-3 h-3 mr-1" />
                  Mobile
                </Badge>
              </Button>
            </div>

            {/* Link input */}
            <div>
              <Label htmlFor="link" className="text-sm">Or add a link</Label>
              <Input
                id="link"
                type="url"
                placeholder="https://example.com"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Selected files */}
          {files.length > 0 && (
            <div>
              <Label className="text-sm">Selected Files ({files.length})</Label>
              <ScrollArea className="h-32 mt-2">
                <div className="space-y-2">
                  {files.map((file, index) => {
                    const Icon = getFileIcon(file);
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-sm truncate">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({formatFileSize(file.size)})
                          </span>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <X className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Title (optional) */}
          <div>
            <Label htmlFor="title">
              Title
              <span className="text-xs text-gray-500 ml-2">(Optional)</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give this entry a title..."
              className="mt-1"
            />
          </div>

          {/* Description (optional) */}
          <div>
            <Label htmlFor="description">
              Description
              <span className="text-xs text-gray-500 ml-2">(Optional)</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a brief description..."
              rows={2}
              className="mt-1"
            />
          </div>

          {/* Tags (collapsible, optional) */}
          <div>
            <button
              onClick={() => setShowTags(!showTags)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              {showTags ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <Tag className="w-4 h-4" />
              <span>Add Tags (Optional)</span>
            </button>
            
            {showTags && (
              <div className="mt-3">
                <PortfolioTagSelector
                  selectedTags={tags}
                  onChange={setTags}
                  activities={activities}
                  assessments={assessments}
                  resources={resources}
                  activityDescriptions={activityDescriptions}
                  assessmentDescriptions={assessmentDescriptions}
                  resourceDescriptions={resourceDescriptions}
                  getTagSuggestions={getTagSuggestions}
                  content={description || title}
                  compact={true}
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleQuickSave}
              disabled={saving || (!files.length && !link.trim())}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Quick Save
                </>
              )}
            </Button>
          </div>

          {/* Tip */}
          <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
            <p>
              <strong>Tip:</strong> This quick add is perfect for families who manage their portfolio elsewhere. 
              Just upload required items here for record keeping.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PortfolioQuickAdd;