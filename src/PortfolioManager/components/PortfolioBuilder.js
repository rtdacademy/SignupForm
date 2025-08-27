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
  Filter,
  SortAsc,
  SortDesc,
  Search,
  X,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle
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
  resourceDescriptions
}) => {
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [sortBy, setSortBy] = useState('date'); // date, title, type
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState({
    activities: [],
    assessments: [],
    resources: []
  });

  // File upload ref
  const fileInputRef = useRef(null);

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

  // Filter and sort entries
  const getFilteredEntries = () => {
    let filtered = [...entries];

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(entry => entry.type === filterType);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.reflections?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by selected tags
    if (selectedTags.activities.length > 0 ||
        selectedTags.assessments.length > 0 ||
        selectedTags.resources.length > 0) {
      filtered = filtered.filter(entry => {
        const hasActivityTag = selectedTags.activities.length === 0 ||
          selectedTags.activities.some(tag => entry.tags?.activities?.includes(tag));
        const hasAssessmentTag = selectedTags.assessments.length === 0 ||
          selectedTags.assessments.some(tag => entry.tags?.assessments?.includes(tag));
        const hasResourceTag = selectedTags.resources.length === 0 ||
          selectedTags.resources.some(tag => entry.tags?.resources?.includes(tag));
        return hasActivityTag && hasAssessmentTag && hasResourceTag;
      });
    }

    // Sort entries
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(b.date) - new Date(a.date);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  const filteredEntries = getFilteredEntries();

  // Empty state
  if (!selectedStructure) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900">No Section Selected</h2>
          <p className="text-gray-600 mt-2">Select a section from the sidebar to start adding content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="mr-2" style={{ color: selectedStructure.color }}>
                {selectedStructure.icon}
              </span>
              {selectedStructure.title}
            </h2>
            {selectedStructure.description && (
              <p className="text-sm text-gray-600 mt-1">{selectedStructure.description}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewEntry(!showNewEntry)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Entry
            </Button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Filters and View Options */}
          <div className="flex items-center space-x-2">
            {/* Filter by type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Types</option>
              {entryTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-');
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
              <option value="type-asc">Type</option>
            </select>

            {/* View mode toggle */}
            <div className="flex bg-gray-100 rounded-md p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="px-2 py-1"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-2 py-1"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active tags filter */}
        {(selectedTags.activities.length > 0 ||
          selectedTags.assessments.length > 0 ||
          selectedTags.resources.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedTags.activities.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  onClick={() => setSelectedTags(prev => ({
                    ...prev,
                    activities: prev.activities.filter(t => t !== tag)
                  }))}
                  className="ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {/* Similar for assessments and resources */}
          </div>
        )}
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
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No Entries Yet</h3>
            <p className="text-gray-600 mt-2">
              {searchQuery || filterType !== 'all' || selectedTags.activities.length > 0
                ? 'No entries match your current filters'
                : 'Start building your portfolio by adding your first entry'}
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
            {filteredEntries.map(entry => (
              <PortfolioEntry
                key={entry.id}
                entry={entry}
                viewMode={viewMode}
                onEdit={() => setEditingEntry(entry)}
                onDelete={() => handleDeleteEntry(entry.id)}
                onUpdate={(updates) => handleUpdateEntry(entry.id, updates)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioBuilder;