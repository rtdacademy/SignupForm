import React, { useState, useRef, useEffect, Fragment } from 'react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Accordion } from '../../components/ui/accordion';
import PortfolioEntry from './PortfolioEntry';
import PortfolioTagSelector from './PortfolioTagSelector';
import PortfolioShareSettings from './PortfolioShareSettings';
import QuillEditor from '../../courses/CourseEditor/QuillEditor';
import DirectoryView from './DirectoryView';
import '../styles/portfolio-animations.css';
import {
  Plus,
  Upload,
  Camera,
  FileText,
  FileEdit,
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
  Home,
  Map,
  Navigation,
  ArrowLeft,
  ArrowRight,
  Maximize,
  ZoomIn,
  Share2,
  ExternalLink,
  PanelLeft,
  PanelLeftClose,
  Layers
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';

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
  customActivities = [],
  customAssessments = [],
  customResources = [],
  student,
  portfolioStructure,
  onSelectStructure,
  onPresentationModeChange,
  loadComments,
  createComment,
  updateComment,
  deleteComment,
  comments,
  loadingComments,
  onCreateStructure,
  onUpdateStructure,
  onDeleteStructure,
  onReorderStructure,
  familyId
}) => {
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [showShareSettings, setShowShareSettings] = useState(null); // courseId to share
  const [editingEntry, setEditingEntry] = useState(null);
  const [isEditingStructure, setIsEditingStructure] = useState(false);
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [navigationPath, setNavigationPath] = useState([]);

  // Notify parent when presentation mode changes
  React.useEffect(() => {
    if (onPresentationModeChange) {
      onPresentationModeChange(isPresentationMode);
    }
  }, [isPresentationMode, onPresentationModeChange]);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-open editor for entry types in builder mode
  useEffect(() => {
    if (!isPresentationMode && selectedStructure && selectedStructure.type === 'entry') {
      // If we're on an entry and there are no content items yet, auto-open the editor
      const hasEntries = entries.filter(e => e.structureId === selectedStructure.id).length > 0;
      if (!hasEntries && !showNewEntry) {
        setShowNewEntry(true);
      }
    }
  }, [selectedStructure, isPresentationMode]);

  // Build navigation path
  useEffect(() => {
    if (!selectedStructure || !portfolioStructure) {
      setNavigationPath([]);
      return;
    }

    const buildPath = (structureId) => {
      const path = [];
      let current = portfolioStructure.find(s => s.id === structureId);

      while (current) {
        path.unshift(current);
        if (current.parentId) {
          current = portfolioStructure.find(s => s.id === current.parentId);
        } else {
          break;
        }
      }

      return path;
    };

    setNavigationPath(buildPath(selectedStructure.id));
  }, [selectedStructure, portfolioStructure]);

  // Handle keyboard navigation in presentation mode
  useEffect(() => {
    if (!isPresentationMode || !selectedStructure) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') navigateToPrevEntry();
      if (e.key === 'ArrowRight') navigateToNextEntry();
      if (e.key === 'Escape') setIsFullscreen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresentationMode, currentEntryIndex, entries]);

  // Navigation functions
  const navigateToNextEntry = () => {
    const sectionEntries = entries.filter(e => e.structureId === selectedStructure?.id);
    if (currentEntryIndex < sectionEntries.length - 1) {
      setCurrentEntryIndex(currentEntryIndex + 1);
    }
  };

  const navigateToPrevEntry = () => {
    if (currentEntryIndex > 0) {
      setCurrentEntryIndex(currentEntryIndex - 1);
    }
  };

  // Handle swipe gestures for mobile
  const handleTouchStart = useRef(null);
  const handleTouchEnd = (e) => {
    if (!handleTouchStart.current || !isPresentationMode) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchStartX = handleTouchStart.current;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) { // Minimum swipe distance
      if (diff > 0) {
        navigateToNextEntry();
      } else {
        navigateToPrevEntry();
      }
    }
    handleTouchStart.current = null;
  };

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

  // New entry state - simplified unified structure
  const [newEntryData, setNewEntryData] = useState({
    title: '',
    content: '',
    attachments: [], // For videos and documents only
    date: new Date().toISOString().split('T')[0],
    tags: {
      activities: [],
      assessments: [],
      resources: []
    },
    reflections: ''
  });

  // Pre-populate form when editing an existing entry
  useEffect(() => {
    if (editingEntry) {
      setNewEntryData({
        title: editingEntry.title || '',
        content: editingEntry.content || '',
        attachments: [], // New attachments to add
        date: editingEntry.date || new Date().toISOString().split('T')[0],
        tags: editingEntry.tags || {
          activities: [],
          assessments: [],
          resources: []
        },
        reflections: editingEntry.reflections || '',
        existingFiles: editingEntry.files || [] // Keep track of existing files
      });
      setShowNewEntry(true); // Show the form when editing
    }
  }, [editingEntry]);

  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Handle attachment selection (videos and documents)
  const handleAttachmentSelect = (e) => {
    const files = Array.from(e.target.files);
    setNewEntryData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  // Remove attachment from selection
  const removeAttachment = (index) => {
    setNewEntryData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  // Save new or update existing entry
  const handleSaveEntry = async () => {
    if (!newEntryData.title.trim()) {
      alert('Please enter a title for your entry');
      return;
    }

    setIsSaving(true);
    try {
      if (editingEntry) {
        // Update existing entry
        const updates = {
          title: newEntryData.title,
          content: newEntryData.content,
          date: newEntryData.date,
          tags: newEntryData.tags,
          reflections: newEntryData.reflections,
          files: newEntryData.existingFiles || editingEntry.files || []
        };

        // If there are new attachments, we need to handle them
        if (newEntryData.attachments.length > 0) {
          // Call update with new files
          await onUpdateEntry(editingEntry.id, updates, newEntryData.attachments);
        } else {
          // Just update the entry data
          await onUpdateEntry(editingEntry.id, updates);
        }

        setEditingEntry(null);
      } else {
        // Create new entry
        await onCreateEntry(
          {
            ...newEntryData,
            type: 'unified', // Single unified type
            structureId: selectedStructure.id
          },
          newEntryData.attachments
        );
      }

      // Reset form
      setNewEntryData({
        title: '',
        content: '',
        attachments: [],
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
        <>
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

          {/* Portfolio Sections Grid with Animations */}
          <div className="max-w-7xl mx-auto px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 portfolio-stagger-container">
              {portfolioStructure.map((section, index) => {
                const sectionEntries = entries.filter(e => e.structureId === section.id);
                const backgroundGradient = cardBackgrounds[section.id] || gradientOptions[index % gradientOptions.length];
                
                return (
                  <Card
                    key={section.id}
                    className="portfolio-card group hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden relative"
                    onClick={() => {
                      if (!editingCardId) {
                        onSelectStructure(section.id);
                      }
                    }}
                    onTouchStart={(e) => {
                      handleTouchStart.current = e.touches[0].clientX;
                    }}
                    onTouchEnd={handleTouchEnd}
                  >
                    {/* Edit Background and Share Buttons */}
                    <div className="absolute top-2 right-2 z-20 flex gap-2">
                      {editingCardId && (
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
                      )}
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-white/90 text-gray-700 hover:bg-white shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowShareSettings(section.id);
                        }}
                        title={`Share ${section.title}`}
                      >
                        <Share2 className="w-3 h-3" />
                      </Button>
                    </div>

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

        {/* Portfolio Share Settings Dialog */}
        {showShareSettings && (
          <PortfolioShareSettings
              isOpen={!!showShareSettings}
              onClose={() => setShowShareSettings(null)}
              courseId={showShareSettings}
              courseTitle={portfolioStructure.find(s => s.id === showShareSettings)?.title || 'Portfolio'}
              studentName={student?.firstName || 'Student'}
              familyId={familyId}
            />
        )}
      </>
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

  // Define leaf types that cannot have children (content-only types)
  const leafTypes = ['entry'];
  const isLeafType = leafTypes.includes(selectedStructure?.type);

  // Determine if current structure is a directory type
  const sectionEntries = entries.filter(entry => entry.structureId === selectedStructure?.id);
  const childSections = portfolioStructure.filter(s => s.parentId === selectedStructure?.id);

  // Leaf types are NEVER directories - they always show content view
  // A structure is a directory if:
  // 1. It has child sections (always show as directory to navigate)
  // 2. OR it's a container type (portfolio/collection/course) WITH NO entries (empty containers show directory view)
  // If a collection has entries, it should show those entries, not directory view
  const isDirectory = !isLeafType && (
    childSections.length > 0 ||
    (['portfolio', 'collection', 'course'].includes(selectedStructure?.type) && sectionEntries.length === 0)
  );

  // Enhanced Presentation Mode with Directory Navigation
  if (isPresentationMode) {
    return (
      <>
      <div className="min-h-full bg-gradient-to-br from-purple-50 via-white to-blue-50">
        {/* Header with Breadcrumbs */}
        <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="px-4 md:px-8 py-4">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-sm mb-3">
              <button
                onClick={() => onSelectStructure(null)}
                className="text-gray-500 hover:text-purple-600 transition-colors"
              >
                <Home className="w-4 h-4" />
              </button>
              {navigationPath.map((crumb, index) => (
                  <Fragment key={crumb.id}>
                    <ChevronRight className="w-3 h-3 text-gray-400" />
                    <button
                      onClick={() => index < navigationPath.length - 1 && onSelectStructure(crumb.id)}
                      className={`${
                        index === navigationPath.length - 1
                          ? 'text-gray-900 font-medium cursor-default'
                          : 'text-gray-500 hover:text-purple-600 transition-colors'
                      }`}
                    >
                      {crumb.title}
                    </button>
                  </Fragment>
                ))}
              </div>

              {/* Header Content */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div style={{ color: selectedStructure?.color }}>
                    {renderIcon(selectedStructure?.icon || 'Folder', "w-8 h-8")}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {selectedStructure?.title}
                    </h1>
                    {selectedStructure?.description && (
                      <p className="text-sm text-gray-600">{selectedStructure.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setIsPresentationMode(false)}
                    size="sm"
                    className="gap-2 bg-white hover:bg-purple-50 border-2 border-purple-200 text-purple-700 hover:text-purple-800 hover:border-purple-300 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <PenTool className="w-4 h-4" />
                    <span className="hidden md:inline">Edit Mode</span>
                    <span className="md:hidden">Edit</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
            {/* Show Directory View for directory types (course, unit, section) */}
            {isDirectory ? (
              <DirectoryView
                currentStructure={selectedStructure}
                childStructures={childSections}
                allStructures={portfolioStructure}
                entries={entries}
                onNavigate={(item) => {
                  // Simply navigate to any item - the view logic will handle what to display
                  onSelectStructure(item.id);
                }}
                onCreateStructure={onCreateStructure}
                onUpdateStructure={(id, updates) => onUpdateStructure(id, updates)}
                onDeleteStructure={onDeleteStructure}
                onAddContent={() => {
                  setIsPresentationMode(false);
                  setShowNewEntry(true);
                }}
                isEditMode={false}
                isMobile={isMobile}
              />
            ) : (
              /* Show Entries for content types (topic, lesson, etc) */
              <>
                {/* All non-directory types (entries) show content view */}
                {(selectedStructure?.type === 'entry' || !isDirectory) ? (
                  sectionEntries.length === 0 ? (
                    <div className="max-w-4xl mx-auto">
                      <Card className="p-12 text-center bg-gradient-to-br from-purple-50 to-blue-50">
                        <FileEdit className="w-20 h-20 text-purple-400 mx-auto mb-6" />
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">
                          {selectedStructure?.title || 'Untitled Content'}
                        </h2>
                        <p className="text-lg text-gray-600 mb-8">
                          This {selectedStructure?.type || 'section'} doesn't have any content yet.
                        </p>
                        <Button
                          onClick={() => setIsPresentationMode(false)}
                          size="lg"
                          className="gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                        >
                          <PenTool className="w-5 h-5" />
                          Start Creating Content
                        </Button>
                      </Card>
                    </div>
                  ) : (
                    <div className="max-w-6xl mx-auto">
                      <div className="prose prose-lg max-w-none">
                        {/* Beautiful content presentation for lessons */}
                        <Card className="p-8 bg-white shadow-lg">
                          <div className="space-y-8">
                            {sectionEntries.map((entry, index) => (
                              <div key={entry.id} className="relative">
                                {index > 0 && <hr className="my-8 border-gray-200" />}
                                <PortfolioEntry
                                  entry={entry}
                                  viewMode="expanded"
                                  isPresentationMode={true}
                                  familyId={familyId}
                                  onEdit={() => {
                                    setIsPresentationMode(false);
                                    setEditingEntry(entry);
                                  }}
                                  onDelete={() => onDeleteEntry(entry.id)}
                                  onUpdate={(updates) => onUpdateEntry(entry.id, updates)}
                                  comments={comments}
                                  loadingComments={loadingComments}
                                  onCreateComment={createComment}
                                  onUpdateComment={updateComment}
                                  onDeleteComment={deleteComment}
                                  onLoadComments={loadComments}
                                  // Tag selector props
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
                                />
                              </div>
                            ))}
                          </div>

                          {/* Add more content button */}
                          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                            <Button
                              onClick={() => setIsPresentationMode(false)}
                              variant="outline"
                              className="gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              Add More Content
                            </Button>
                          </div>
                        </Card>
                      </div>
                    </div>
                  )
                ) : (
                  /* Regular grid view for topics and other container types */
                  sectionEntries.length === 0 ? (
                    <div className="text-center py-20">
                      <Sparkles className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                      <h2 className="text-2xl font-semibold text-gray-700">No Content Yet</h2>
                      <p className="text-gray-500 mt-2 mb-8">Add your first entry to this topic</p>
                      <Button
                        onClick={() => setIsPresentationMode(false)}
                        className="gap-2"
                      >
                        <PenTool className="w-4 h-4" />
                        Add Content
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-8">
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
                            onDelete={() => onDeleteEntry(entry.id)}
                            onUpdate={(updates) => onUpdateEntry(entry.id, updates)}
                            comments={comments}
                            loadingComments={loadingComments}
                            onCreateComment={createComment}
                            onUpdateComment={updateComment}
                            onDeleteComment={deleteComment}
                            onLoadComments={loadComments}
                            // Tag selector props
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
                          />
                        ))}
                      </div>
                    </div>
                  )
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Portfolio Share Settings Dialog - Always available in presentation mode */}
      {showShareSettings && (
        <PortfolioShareSettings
            isOpen={!!showShareSettings}
            onClose={() => setShowShareSettings(null)}
            courseId={showShareSettings}
            courseTitle={portfolioStructure.find(s => s.id === showShareSettings)?.title || 'Portfolio'}
            studentName={student?.firstName || 'Student'}
            familyId={familyId}
          />
      )}
    </>
  );
  }

  // Builder Mode
  return (
    <>
      <div className="h-full flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-sm">
              <Button
                onClick={() => onSelectStructure(null)}
                variant="ghost"
                size="sm"
                className="hover:bg-purple-50 p-2"
              >
                <Home className="w-4 h-4" />
              </Button>
              {navigationPath.map((crumb, index) => (
                <Fragment key={crumb.id}>
                  <ChevronRight className="w-3 h-3 text-gray-400" />
                  <Button
                    onClick={() => index < navigationPath.length - 1 && onSelectStructure(crumb.id)}
                    variant="ghost"
                    size="sm"
                    disabled={index === navigationPath.length - 1}
                    className="text-sm"
                  >
                    {crumb.title}
                  </Button>
                </Fragment>
              ))}
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
        {/* Entry Form - show for creating new or editing existing entries */}
        {(showNewEntry || editingEntry) && (
          <Card className="mb-6 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingEntry ? 'Edit Portfolio Entry' : 'New Portfolio Entry'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowNewEntry(false);
                  setEditingEntry(null);
                  // Reset form data
                  setNewEntryData({
                    title: '',
                    content: '',
                    attachments: [],
                    date: new Date().toISOString().split('T')[0],
                    tags: {
                      activities: [],
                      assessments: [],
                      resources: []
                    },
                    reflections: ''
                  });
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Title and Date - Always visible */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newEntryData.title}
                    onChange={(e) => setNewEntryData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Give your entry a title..."
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

              {/* Content Editor - Always visible */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
            
                <div className="overflow-hidden" style={{ minHeight: '300px' }}>
                  <QuillEditor
                    initialContent={newEntryData.content}
                    onContentChange={(content) => setNewEntryData(prev => ({ ...prev, content }))}
                    fixedHeight="300px"
                    hideSaveButton={true}
                  />
                </div>
              </div>

              {/* Attachments - For videos, images, and documents */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attachments
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Upload videos, images, or documents that you want to attach to this entry
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="video/*,image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                    onChange={handleAttachmentSelect}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <Image className="w-8 h-8 text-gray-400" />
                    <Video className="w-8 h-8 text-gray-400" />
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Add Files
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Supported: Images (JPG, PNG, GIF), Videos (MP4, MOV, etc.) and Documents (PDF, Word, Excel, PowerPoint)
                  </p>
                </div>

                {/* Existing files when editing */}
                {editingEntry && newEntryData.existingFiles && newEntryData.existingFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Current files:</p>
                    {newEntryData.existingFiles.map((file, index) => {
                      const fileExt = file.name ? file.name.split('.').pop().toLowerCase() : '';
                      const isVideo = ['mp4', 'mov', 'avi', 'webm'].includes(fileExt);
                      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt);
                      const Icon = isVideo ? Video : isImage ? Image : FileText;
                      const iconColor = isVideo ? 'text-purple-600' :
                                       isImage ? 'text-blue-600' :
                                       'text-gray-600';

                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                              <Icon className={`w-5 h-5 ${iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium text-gray-900 truncate block">
                                {file.name || `File ${index + 1}`}
                              </span>
                              <span className="text-xs text-gray-500">Existing file</span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              // Remove from existing files
                              setNewEntryData(prev => ({
                                ...prev,
                                existingFiles: prev.existingFiles.filter((_, i) => i !== index)
                              }));
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                            aria-label="Remove file"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* New attachments list */}
                {newEntryData.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      {editingEntry ? 'New files to add:' : 'Attached files:'}
                    </p>
                    {newEntryData.attachments.map((file, index) => {
                      const isVideo = file.type.startsWith('video/');
                      const isImage = file.type.startsWith('image/');
                      const Icon = isVideo ? Video : isImage ? Image : FileText;

                      // Calculate file size display
                      const sizeInKB = file.size / 1024;
                      const sizeInMB = sizeInKB / 1024;
                      const sizeDisplay = sizeInMB < 1
                        ? `${sizeInKB.toFixed(0)} KB`
                        : `${sizeInMB.toFixed(1)} MB`;

                      // Determine icon color based on file type
                      const iconColor = isVideo ? 'text-purple-600' :
                                       isImage ? 'text-blue-600' :
                                       'text-gray-600';

                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`p-2 rounded-lg bg-white shadow-sm ${
                              isVideo ? 'bg-purple-50' :
                              isImage ? 'bg-blue-50' :
                              'bg-gray-50'
                            }`}>
                              <Icon className={`w-5 h-5 ${iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium text-gray-900 truncate block">{file.name}</span>
                              <span className="text-xs text-gray-500">
                                {sizeDisplay}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeAttachment(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                            aria-label="Remove attachment"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

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

              {/* Tags - Discrete and Optional - Placed at bottom */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Tags from SOLO Plan (Optional)
                  </label>
                
                </div>
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
                  customActivities={customActivities}
                  customAssessments={customAssessments}
                  customResources={customResources}
                  content={newEntryData.content || newEntryData.title}
                  compact={true}  // Use compact mode
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewEntry(false);
                    setEditingEntry(null);
                    // Reset form data
                    setNewEntryData({
                      title: '',
                      content: '',
                      attachments: [],
                      date: new Date().toISOString().split('T')[0],
                      tags: {
                        activities: [],
                        assessments: [],
                        resources: []
                      },
                      reflections: ''
                    });
                  }}
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
                      {editingEntry ? 'Updating...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingEntry ? 'Update Entry' : 'Save Entry'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Show Directory View for directory types in builder mode */}
        {isDirectory ? (
          <DirectoryView
            currentStructure={selectedStructure}
            childStructures={childSections}
            allStructures={portfolioStructure}
            entries={entries}
            onNavigate={(item, isDocumentEdit) => {
              // Check if this is a document type that should be edited
              if (isDocumentEdit || ['lesson', 'assessment'].includes(item.type)) {
                // Navigate to the document and open entry form
                onSelectStructure(item.id);
                setShowNewEntry(true);
              } else {
                // Normal navigation for directories
                onSelectStructure(item.id);
              }
            }}
            onCreateStructure={onCreateStructure}
            onUpdateStructure={(id, updates) => onUpdateStructure(id, updates)}
            onDeleteStructure={onDeleteStructure}
            onAddContent={() => setShowNewEntry(true)}
            isEditMode={true}
            isMobile={isMobile}
          />
        ) : (
          <>
            {/* Display entries for non-directory items */}
            {sortedEntries.length === 0 ? (
              <div className="text-center py-12">
                <FolderPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  No entries yet
                </h2>
                <p className="text-gray-500 mb-4">
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
              <Accordion type="single" collapsible className="space-y-2">
                {sortedEntries.map(entry => (
                  <PortfolioEntry
                    key={entry.id}
                    entry={entry}
                    viewMode={viewMode}
                    familyId={familyId}
                    onEdit={() => setEditingEntry(entry)}
                    onDelete={() => handleDeleteEntry(entry.id)}
                    onUpdate={(updates) => handleUpdateEntry(entry.id, updates)}
                    comments={comments}
                    loadingComments={loadingComments}
                    onCreateComment={createComment}
                    onUpdateComment={updateComment}
                    onDeleteComment={deleteComment}
                    onLoadComments={loadComments}
                    // Tag selector props
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
                  />
                ))}
              </Accordion>
            )}
          </>
        )}
      </div>
    </div>

    {/* Portfolio Share Settings Dialog */}
      {showShareSettings && (
        <PortfolioShareSettings
            isOpen={!!showShareSettings}
            onClose={() => setShowShareSettings(null)}
            courseId={showShareSettings}
            courseTitle={portfolioStructure.find(s => s.id === showShareSettings)?.title || 'Portfolio'}
            studentName={student?.firstName || 'Student'}
            familyId={familyId}
          />
      )}
    </>
  );
};

export default PortfolioBuilder;
