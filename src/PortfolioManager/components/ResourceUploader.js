import React, { useState, useRef, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '../../components/ui/sheet';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import QuillEditor from '../../courses/CourseEditor/QuillEditor';
import {
  FileText,
  Image,
  Video,
  Link2,
  BookOpen,
  Upload,
  X,
  Save,
  Loader2,
  Plus,
  Tag,
  Library,
  AlertCircle,
  CheckCircle,
  File
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Alert, AlertDescription } from '../../components/ui/alert';

const ResourceUploader = ({
  isOpen,
  onClose,
  onSave,
  resource = null,
  level = 'entry',
  itemTitle = ''
}) => {
  const [resourceType, setResourceType] = useState(resource?.type || 'document');
  const [title, setTitle] = useState(resource?.title || '');
  const [description, setDescription] = useState(resource?.description || '');
  const [content, setContent] = useState(resource?.content || '');
  const [url, setUrl] = useState(resource?.url || '');
  const [tags, setTags] = useState(resource?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [addToLibrary, setAddToLibrary] = useState(resource?.library?.isInLibrary || false);
  const [category, setCategory] = useState(resource?.libraryMetadata?.category || 'general');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef(null);
  const isEditMode = !!resource;

  useEffect(() => {
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  }, [file]);

  const resourceTypeOptions = [
    { value: 'document', label: 'Document', icon: FileText, accept: '.pdf,.doc,.docx,.txt' },
    { value: 'image', label: 'Image', icon: Image, accept: 'image/*' },
    { value: 'video', label: 'Video', icon: Video, accept: 'video/*' },
    { value: 'link', label: 'Link', icon: Link2, accept: null },
    { value: 'text', label: 'Rich Text', icon: BookOpen, accept: null }
  ];

  const categoryOptions = [
    { value: 'general', label: 'General' },
    { value: 'lesson-plans', label: 'Lesson Plans' },
    { value: 'worksheets', label: 'Worksheets' },
    { value: 'references', label: 'References' },
    { value: 'activities', label: 'Activities' },
    { value: 'assessments', label: 'Assessments' },
    { value: 'videos', label: 'Videos' },
    { value: 'presentations', label: 'Presentations' }
  ];

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        return;
      }

      setFile(selectedFile);
      setError('');

      if (!title) {
        const fileName = selectedFile.name.replace(/\.[^/.]+$/, '');
        setTitle(fileName.replace(/[-_]/g, ' '));
      }

      if (selectedFile.type.startsWith('image/')) {
        setResourceType('image');
      } else if (selectedFile.type.startsWith('video/')) {
        setResourceType('video');
      } else if (selectedFile.type.includes('pdf') || selectedFile.type.includes('document')) {
        setResourceType('document');
      }
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please provide a title for the resource');
      return;
    }

    if (resourceType === 'link' && !url.trim()) {
      setError('Please provide a URL for the link resource');
      return;
    }

    if (resourceType === 'text' && !content.trim()) {
      setError('Please provide content for the text resource');
      return;
    }

    if (!isEditMode && !['link', 'text'].includes(resourceType) && !file) {
      setError('Please select a file to upload');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const resourceData = {
        title: title.trim(),
        description: description.trim(),
        type: resourceType,
        tags,
        addToLibrary,
        category: addToLibrary ? category : null
      };

      if (resourceType === 'text') {
        resourceData.content = content;
      } else if (resourceType === 'link') {
        resourceData.url = url;
      }

      await onSave(resourceData, file);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save resource');
      setSaving(false);
    }
  };

  const getAcceptAttribute = () => {
    const option = resourceTypeOptions.find(opt => opt.value === resourceType);
    return option?.accept || '*';
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditMode ? 'Edit Resource' : 'Add New Resource'}
          </SheetTitle>
          <SheetDescription>
            {isEditMode
              ? 'Update the resource details below'
              : `Add a learning resource to ${itemTitle || 'this ' + level}`}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {!isEditMode && (
            <div>
              <Label>Resource Type</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {resourceTypeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.value}
                      variant={resourceType === option.value ? 'default' : 'outline'}
                      className="justify-start"
                      onClick={() => setResourceType(option.value)}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter resource title"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this resource"
              className="mt-2"
              rows={3}
            />
          </div>

          {resourceType === 'text' && (
            <div>
              <Label>Content *</Label>
              <div className="mt-2 border rounded-lg">
                <QuillEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Enter your content here..."
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['blockquote', 'code-block'],
                      ['link', 'image'],
                      ['clean']
                    ]
                  }}
                />
              </div>
            </div>
          )}

          {resourceType === 'link' && (
            <div>
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="mt-2"
              />
            </div>
          )}

          {!isEditMode && !['link', 'text'].includes(resourceType) && (
            <div>
              <Label>File Upload *</Label>
              <div className="mt-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={getAcceptAttribute()}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {file ? 'Change File' : 'Select File'}
                </Button>
              </div>

              {file && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <File className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(1)} MB)
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setFile(null);
                        setFilePreview(null);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {filePreview && resourceType === 'image' && (
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="mt-3 w-full h-40 object-cover rounded"
                    />
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <Label>Tags</Label>
            <div className="mt-2 space-y-2">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="library" className="text-base">
                  Add to Library
                </Label>
                <p className="text-sm text-gray-500">
                  Save this resource to your library for reuse
                </p>
              </div>
              <Switch
                id="library"
                checked={addToLibrary}
                onCheckedChange={setAddToLibrary}
              />
            </div>

            {addToLibrary && (
              <div>
                <Label htmlFor="category">Library Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditMode ? 'Update' : 'Add'} Resource
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ResourceUploader;