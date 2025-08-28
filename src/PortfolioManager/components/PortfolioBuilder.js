import React, { useState, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import PortfolioEntry from './PortfolioEntry';
import PortfolioTagSelector from './PortfolioTagSelector';
import QuillEditor from '../../courses/CourseEditor/QuillEditor';
import {
  Plus,
  Upload,
  Camera,
  FileText,
  Image,
  Video,
  Link2,
  Calendar,
  Tag,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Download,
  Grid,
  List,
  X,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Sparkles,
  PenTool,
  Presentation,
  FolderOpen,
  Clock,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Calculator,
  Beaker,
  Globe,
  Activity,
  Briefcase,
  Wrench,
  GraduationCap,
  Folder,
  Hash,
  Home
} from 'lucide-react';

const PortfolioBuilder = ({
  selectedStructure,
  entries = [],
  onCreateEntry,
  onUpdateEntry,
  onDeleteEntry,
  soloplanData,
  getTagSuggestions,
  activities,
  assessments,
  resources,
  activityDescriptions,
  assessmentDescriptions,
  resourceDescriptions,
  student,
  portfolioStructure,
  onSelectStructure,
  onPresentationModeChange,
  loadComments,
  createComment,
  updateComment,
  deleteComment,
  comments,
  loadingComments
}) => {
  const [isPresentationMode, setIsPresentationMode] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  // Notify parent when presentation mode changes
  React.useEffect(() => {
    if (onPresentationModeChange) {
      onPresentationModeChange(isPresentationMode);
    }
  }, [isPresentationMode, onPresentationModeChange]);

  // File upload ref
  const fileInputRef = useRef(null);

  // Icon component mapping
  const iconComponents = {
    BookOpen: BookOpen,
    Calculator: Calculator,
    Beaker: Beaker,
    Globe: Globe,
    Activity: Activity,
    Briefcase: Briefcase,
    Wrench: Wrench,
    GraduationCap: GraduationCap,
    Folder: Folder,
    FolderOpen: FolderOpen,
    FileText: FileText,
    Hash: Hash
  };

  // Get icon component by name
  const getIconComponent = (iconName) => {
    // If it's already a React element or emoji, return it as is
    if (typeof iconName !== 'string' || !iconComponents[iconName]) {
      return null;
    }
    return iconComponents[iconName];
  };

  // Render icon helper
  const renderIcon = (iconNameOrEmoji, className = "w-5 h-5") => {
    const IconComponent = getIconComponent(iconNameOrEmoji);
    if (IconComponent) {
      return <IconComponent className={className} />;
    }
    // If it's an emoji or unsupported icon, display as text
    return <span className="text-2xl">{iconNameOrEmoji || '📁'}</span>;
  };

  // New entry state
  const [newEntryData, setNewEntryData] = useState({
    title: '',
    type: 'text',
    content: '',
    files: [],
    date: new Date().toISOString().split('T')[0],
    tags: {
      activities: [],
      assessments: [],
      resources: []
    },
    reflections: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Entry types
  const entryTypes = [
    { value: 'text', label: 'Text Entry', icon: FileText },
    { value: 'image', label: 'Photos', icon: Image },
    { value: 'file', label: 'Documents', icon: Upload },
    { value: 'video', label: 'Videos', icon: Video },
    { value: 'link', label: 'Links', icon: Link2 },
    { value: 'combined', label: 'Mixed Content', icon: Grid }
  ];

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setNewEntryData(prev => ({
      ...prev,
      files: [...prev.files, ...files]
    }));
  };

  // Remove file from selection
  const removeFile = (index) => {
    setNewEntryData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  // Save new entry
  const handleSaveEntry = async () => {
    if (!newEntryData.title.trim()) {
      alert('Please enter a title for your entry');
      return;
    }

    setIsSaving(true);
    try {
      await onCreateEntry(
        {
          ...newEntryData,
          structureId: selectedStructure.id
        },
        newEntryData.files
      );

      // Reset form
      setNewEntryData({
        title: '',
        type: 'text',
        content: '',
        files: [],
        date: new Date().toISOString().split('T')[0],
        tags: {
          activities: [],
          assessments: [],
          resources: []
        },
        reflections: ''
      });
      setShowNewEntry(false);
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Failed to save entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Update existing entry
  const handleUpdateEntry = async (entryId, updates) => {
    try {
      await onUpdateEntry(entryId, updates);
      setEditingEntry(null);
    } catch (error) {
      console.error('Error updating entry:', error);
      alert('Failed to update entry. Please try again.');
    }
  };

  // Delete entry
  const handleDeleteEntry = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await onDeleteEntry(entryId);
      } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Failed to delete entry. Please try again.');
      }
    }
  };

  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  // State for editing card backgrounds
  const [editingCardId, setEditingCardId] = useState(null);
  const [cardBackgrounds, setCardBackgrounds] = useState({});

  // Predefined gradient backgrounds
  const gradientOptions = [
    'from-purple-500 to-blue-600',
    'from-blue-500 to-teal-600',
    'from-green-500 to-emerald-600',
    'from-orange-500 to-red-600',
    'from-pink-500 to-purple-600',
    'from-indigo-500 to-purple-600',
    'from-yellow-500 to-orange-600',
    'from-cyan-500 to-blue-600',
    'from-rose-500 to-pink-600',
    'from-slate-600 to-gray-700'
  ];

  // Empty state - show portfolio overview if no section selected
  if (!selectedStructure) {
    // Always show presentation mode for portfolio overview
    if (portfolioStructure && portfolioStructure.length > 0) {
      return (
        <div className="min-h-full bg-gradient-to-br from-purple-50 to-blue-50">
          {/* Presentation Mode Header */}
          <div className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-10 px-8 py-4">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {student?.firstName}'s Portfolio
                </h1>
                <p className="text-gray-600 mt-1">Learning Journey & Achievements</p>
              </div>
              <Button
                onClick={() => setEditingCardId(editingCardId ? null : 'edit-mode')}
                className="gap-2 bg-white hover:bg-purple-50 border-2 border-purple-200 text-purple-700 hover:text-purple-800 hover:border-purple-300 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <PenTool className="w-4 h-4" />
                {editingCardId ? 'Done Editing' : 'Edit Cards'}
              </Button>
            </div>
          </div>

          {/* Portfolio Sections Grid */}
          <div className="max-w-7xl mx-auto px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioStructure.map((section, index) => {
                const sectionEntries = entries.filter(e => e.structureId === section.id);
                const backgroundGradient = cardBackgrounds[section.id] || gradientOptions[index % gradientOptions.length];
                
                return (
                  <Card 
                    key={section.id}
                    className="group hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden relative"
                    onClick={() => {
                      if (!editingCardId) {
                        // Navigate to the section
                        onSelectStructure(section.id);
                      }
                    }}
                  >
                    {/* Edit Background Button */}
                    {editingCardId && (
                      <div className="absolute top-2 right-2 z-20">
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-white/90 text-gray-700 hover:bg-white shadow-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCardId(section.id);
                          }}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}

                    {/* Background Selector */}
                    {editingCardId === section.id && (
                      <div className="absolute inset-0 bg-black/50 z-30 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg p-4 max-w-sm w-full">
                          <h4 className="text-sm font-semibold mb-3">Choose Background</h4>
                          <div className="grid grid-cols-5 gap-2">
                            {gradientOptions.map((gradient, idx) => (
                              <button
                                key={idx}
                                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} hover:scale-110 transition-transform`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCardBackgrounds(prev => ({
                                    ...prev,
                                    [section.id]: gradient
                                  }));
                                  setEditingCardId(null);
                                }}
                              />
                            ))}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full mt-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCardId(null);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className={`aspect-[16/9] bg-gradient-to-br ${backgroundGradient} p-6 flex flex-col justify-end relative`}>
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                      <div className="relative z-10">
                        <div className="mb-3">
                          {renderIcon(section.icon || 'BookOpen', "w-10 h-10 text-white")}
                        </div>
                        <h3 className="text-xl font-bold text-white">
                          {section.title}
                        </h3>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-gray-600 text-sm mb-3">{section.description || 'Portfolio section'}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          {sectionEntries.length} {sectionEntries.length === 1 ? 'entry' : 'entries'}
                        </span>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // Fallback for when there are no sections
    return (
      <div className="min-h-full bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Welcome to Your Portfolio</h2>
          <p className="text-gray-600 mt-2">Create your first section to get started</p>
        </div>
      </div>
    );
  }

  // Presentation Mode for Selected Section
  if (isPresentationMode) {
    const sectionEntries = entries.filter(entry => entry.structureId === selectedStructure.id);
    
    return (
      <div className="min-h-full bg-gradient-to-br from-purple-50 via-white to-blue-50">
        {/* Presentation Header */}
        <div className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => onSelectStructure(null)}
                  variant="ghost"
                  size="sm"
                  className="hover:bg-purple-50"
                  title="Back to Portfolio Overview"
                >
                  <Home className="w-5 h-5" />
                </Button>
                <div className="w-px h-8 bg-gray-300" />
                <div style={{ color: selectedStructure.color }}>
                  {renderIcon(selectedStructure.icon || 'Folder', "w-12 h-12")}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {selectedStructure.title}
                  </h1>
                  {selectedStructure.description && (
                    <p className="text-gray-600 mt-1">{selectedStructure.description}</p>
                  )}
                </div>
              </div>
              <Button
                onClick={() => setIsPresentationMode(false)}
                className="gap-2 bg-white hover:bg-purple-50 border-2 border-purple-200 text-purple-700 hover:text-purple-800 hover:border-purple-300 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <PenTool className="w-4 h-4" />
                Edit Mode
              </Button>
            </div>
          </div>
        </div>

        {/* Presentation Content */}
        <div className="max-w-7xl mx-auto px-8 py-12">
          {sectionEntries.length === 0 ? (
            <div className="text-center py-20">
              <Sparkles className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-700">No Content Yet</h2>
              <p className="text-gray-500 mt-2 mb-8">This section is waiting for amazing content</p>
              <Button 
                onClick={() => setIsPresentationMode(false)}
                className="gap-2"
              >
                <PenTool className="w-4 h-4" />
                Go to Builder
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Masonry/Grid Layout for Entries */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sectionEntries.map(entry => (
                  <PortfolioEntry
                    key={entry.id}
                    entry={entry}
                    viewMode="presentation"
                    isPresentationMode={true}
                    onEdit={() => {
                      setIsPresentationMode(false);
                      setEditingEntry(entry);
                    }}
                    onDelete={() => handleDeleteEntry(entry.id)}
                    onUpdate={(updates) => handleUpdateEntry(entry.id, updates)}
                    comments={comments}
                    loadingComments={loadingComments}
                    onCreateComment={createComment}
                    onUpdateComment={updateComment}
                    onDeleteComment={deleteComment}
                    onLoadComments={loadComments}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Builder Mode (existing code)
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => onSelectStructure(null)}
              variant="ghost"
              size="sm"
              className="hover:bg-purple-50"
              title="Back to Portfolio Overview"
            >
              <Home className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <span className="mr-2" style={{ color: selectedStructure.color }}>
                  {renderIcon(selectedStructure.icon || 'Folder', "w-5 h-5")}
                </span>
                {selectedStructure.title}
              </h2>
              {selectedStructure.description && (
                <p className="text-sm text-gray-600 mt-1">{selectedStructure.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Mode Toggle - Modern Pill Design */}
            <div className="relative flex items-center bg-gradient-to-r from-purple-50 to-blue-50 rounded-full p-1 border border-purple-200 shadow-sm">
              {/* Sliding Background */}
              <div 
                className={`absolute h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-300 ease-in-out shadow-md ${
                  isPresentationMode ? 'translate-x-[120px] w-[104px]' : 'translate-x-0 w-[105px]'
                }`}
              />
              
              {/* Builder Button */}
              <button
                onClick={() => setIsPresentationMode(false)}
                className={`relative z-10 flex items-center px-5 py-2 pr-6 rounded-full text-sm font-medium transition-colors duration-200 ${
                  !isPresentationMode 
                    ? 'text-white' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <PenTool className="w-4 h-4 mr-2" />
                Builder
              </button>
              
              {/* Divider */}
              <div className="w-px h-5 bg-gray-300 mx-2" />
              
              {/* Present Button */}
              <button
                onClick={() => setIsPresentationMode(true)}
                className={`relative z-10 flex items-center px-5 py-2 pr-6 rounded-full text-sm font-medium transition-colors duration-200 ${
                  isPresentationMode 
                    ? 'text-white' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <Presentation className="w-4 h-4 mr-2" />
                Present
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Content Area */}
      <div className="flex-1 overflow-auto p-6">
        {/* New Entry Form */}
        {showNewEntry && (
          <Card className="mb-6 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">New Portfolio Entry</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewEntry(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Entry Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entry Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                  {entryTypes.map(type => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => setNewEntryData(prev => ({ ...prev, type: type.value }))}
                        className={`
                          p-3 rounded-lg border-2 transition-colors
                          ${newEntryData.type === type.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        <Icon className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-xs">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title and Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newEntryData.title}
                    onChange={(e) => setNewEntryData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter entry title..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newEntryData.date}
                    onChange={(e) => setNewEntryData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Content based on type */}
              {(newEntryData.type === 'text' || newEntryData.type === 'combined') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <div className="border border-gray-300 rounded-md" style={{ minHeight: '300px' }}>
                    <QuillEditor
                      initialContent={newEntryData.content}
                      onContentChange={(content) => setNewEntryData(prev => ({ ...prev, content }))}
                      fixedHeight="300px"
                      hideSaveButton={true}
                    />
                  </div>
                </div>
              )}

              {/* File Upload */}
              {(newEntryData.type === 'image' || 
                newEntryData.type === 'file' || 
                newEntryData.type === 'video' || 
                newEntryData.type === 'combined') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Files
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept={
                        newEntryData.type === 'image' ? 'image/*' :
                        newEntryData.type === 'video' ? 'video/*' :
                        '*'
                      }
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose Files
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      {newEntryData.type === 'image' ? 'Upload photos (JPG, PNG, GIF)' :
                       newEntryData.type === 'video' ? 'Upload videos (MP4, MOV, AVI)' :
                       'Upload any files'}
                    </p>
                  </div>

                  {/* Selected files list */}
                  {newEntryData.files.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {newEntryData.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm truncate">{file.name}</span>
                          <button
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tags */}
              <PortfolioTagSelector
                selectedTags={newEntryData.tags}
                onChange={(tags) => setNewEntryData(prev => ({ ...prev, tags }))}
                activities={activities}
                assessments={assessments}
                resources={resources}
                activityDescriptions={activityDescriptions}
                assessmentDescriptions={assessmentDescriptions}
                resourceDescriptions={resourceDescriptions}
                getTagSuggestions={getTagSuggestions}
                content={newEntryData.content || newEntryData.title}
              />

              {/* Reflections */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reflections (Optional)
                </label>
                <textarea
                  value={newEntryData.reflections}
                  onChange={(e) => setNewEntryData(prev => ({ ...prev, reflections: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  rows={3}
                  placeholder="Add any reflections or notes about this work..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowNewEntry(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEntry}
                  disabled={isSaving || !newEntryData.title.trim()}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Entry
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Entries Display */}
        {sortedEntries.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No Entries Yet</h3>
            <p className="text-gray-600 mt-2">
              Start building your portfolio by adding your first entry
            </p>
            {!showNewEntry && (
              <Button
                className="mt-4"
                onClick={() => setShowNewEntry(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Entry
              </Button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
            {sortedEntries.map(entry => (
              <PortfolioEntry
                key={entry.id}
                entry={entry}
                viewMode={viewMode}
                onEdit={() => setEditingEntry(entry)}
                onDelete={() => handleDeleteEntry(entry.id)}
                onUpdate={(updates) => handleUpdateEntry(entry.id, updates)}
                comments={comments}
                loadingComments={loadingComments}
                onCreateComment={createComment}
                onUpdateComment={updateComment}
                onDeleteComment={deleteComment}
                onLoadComments={loadComments}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioBuilder;