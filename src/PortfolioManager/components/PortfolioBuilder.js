import React, { useState, useRef, useEffect, Fragment } from 'react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Accordion } from '../../components/ui/accordion';
import PortfolioEntry from './PortfolioEntry';
import PortfolioTagSelector from './PortfolioTagSelector';
import PortfolioShareSettings from './PortfolioShareSettings';
import EntryEditSheet from './EntryEditSheet';
import QuillEditor from '../../courses/CourseEditor/QuillEditor';
import DirectoryView from './DirectoryView';
import DevFileIndicator from './DevFileIndicator';
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
  Layers,
  GripVertical
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
  onReorderEntries,
  familyId,
  onInitializeStructure
}) => {
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [showShareSettings, setShowShareSettings] = useState(null); // courseId to share
  const [editingEntry, setEditingEntry] = useState(null);
  const [isEditingStructure, setIsEditingStructure] = useState(false);
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFullPresentationMode, setIsFullPresentationMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [navigationPath, setNavigationPath] = useState([]);
  const [viewingEntry, setViewingEntry] = useState(null); // Track which entry is being viewed
  const [modeTransitioning, setModeTransitioning] = useState(false); // Track mode transitions
  const [previewEntryData, setPreviewEntryData] = useState(null); // Track preview data
  const [isPreviewingFromEdit, setIsPreviewingFromEdit] = useState(false); // Track if previewing from edit sheet

  // Helper function to create a light gradient from collection color
  const getCollectionGradient = () => {
    if (!selectedStructure?.color) {
      // Default purple-blue gradient
      return 'from-purple-50 via-blue-50 to-indigo-50';
    }

    // Parse the hex color and create a light gradient
    const color = selectedStructure.color;
    const colorName = getColorName(color);

    // Create a light gradient using the color
    return `from-${colorName}-50 via-${colorName}-100/30 to-purple-50`;
  };

  // Helper to map hex colors to Tailwind color names
  const getColorName = (hex) => {
    const colorMap = {
      '#8B5CF6': 'purple',
      '#3B82F6': 'blue',
      '#10B981': 'green',
      '#F59E0B': 'yellow',
      '#EF4444': 'red',
      '#EC4899': 'pink',
      '#6366F1': 'indigo',
      '#14B8A6': 'teal',
      '#F97316': 'orange',
      '#6B7280': 'gray'
    };
    return colorMap[hex] || 'purple';
  };

  // Helper to darken a hex color
  const darkenColor = (hex, amount = 0.2) => {
    // Remove # if present
    const color = hex?.replace('#', '') || '8B5CF6';

    // Convert to RGB
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);

    // Darken
    const darkenedR = Math.round(r * (1 - amount));
    const darkenedG = Math.round(g * (1 - amount));
    const darkenedB = Math.round(b * (1 - amount));

    // Convert back to hex
    const toHex = (n) => n.toString(16).padStart(2, '0');
    return `#${toHex(darkenedR)}${toHex(darkenedG)}${toHex(darkenedB)}`;
  };

  // Helper to lighten a hex color
  const lightenColor = (hex, amount = 0.8) => {
    // Remove # if present
    const color = hex?.replace('#', '') || '8B5CF6';

    // Convert to RGB
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);

    // Lighten
    const lightenedR = Math.round(r + (255 - r) * amount);
    const lightenedG = Math.round(g + (255 - g) * amount);
    const lightenedB = Math.round(b + (255 - b) * amount);

    // Convert back to hex
    const toHex = (n) => n.toString(16).padStart(2, '0');
    return `#${toHex(lightenedR)}${toHex(lightenedG)}${toHex(lightenedB)}`;
  };

  // State for optimistic UI updates during drag and drop
  const [optimisticStructure, setOptimisticStructure] = useState(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // Notify parent when presentation mode changes
  React.useEffect(() => {
    if (onPresentationModeChange) {
      onPresentationModeChange(isPresentationMode, isFullPresentationMode);
    }
  }, [isPresentationMode, isFullPresentationMode, onPresentationModeChange]);

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
      if (e.key === 'Escape') {
        setIsPresentationMode(false);
        setIsFullPresentationMode(false);
        setIsFullscreen(false);

        // Exit browser fullscreen if active
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(err => {
            console.log('Exit fullscreen failed:', err);
          });
        }
      }
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

  const renderModeToggle = () => {
    const structureColor = selectedStructure?.color || '#8B5CF6';
    const lightColor = lightenColor(structureColor, 0.95);
    const mediumColor = lightenColor(structureColor, 0.85);
    const darkColor = darkenColor(structureColor, 0.1);

    return (
      <div
        className="relative flex w-72 items-center rounded-full border shadow-sm overflow-hidden"
        style={{
          background: `linear-gradient(to right, ${lightColor}, ${mediumColor})`,
          borderColor: `${structureColor}33`
        }}
      >
        <div
          className={`absolute inset-0 w-1/2 transition-transform duration-300 ease-in-out shadow-md ${
            isPresentationMode ? 'translate-x-full' : 'translate-x-0'
          }`}
          style={{
            background: `linear-gradient(to right, ${structureColor}, ${darkColor})`
          }}
        />

        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-6 w-px -translate-x-1/2 -translate-y-1/2"
          style={{ backgroundColor: `${structureColor}30` }}
        />

      <button
        type="button"
        onClick={() => {
          setModeTransitioning(true);
          setIsPresentationMode(false);
          setIsFullPresentationMode(false);
          setTimeout(() => setModeTransitioning(false), 500);

          // Exit fullscreen if in fullscreen mode
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(err => {
              console.log('Exit fullscreen failed:', err);
            });
          }
        }}
        className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors duration-200 ${
          !isPresentationMode
            ? 'text-white'
            : 'text-gray-700 hover:text-gray-900'
        }`}
      >
        <PenTool className="w-4 h-4" />
        Builder
      </button>

      <button
        type="button"
        onClick={() => {
          setModeTransitioning(true);
          setIsPresentationMode(true);
          setIsFullPresentationMode(true);
          setTimeout(() => setModeTransitioning(false), 500);

          // Request fullscreen if available
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(err => {
              console.log('Fullscreen request failed:', err);
            });
          }
        }}
        className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors duration-200 ${
          isPresentationMode
            ? 'text-white'
            : 'text-gray-700 hover:text-gray-900'
        }`}
      >
        <Presentation className="w-4 h-4" />
        Present
      </button>
      </div>
    );
  };

  const renderBreadcrumbs = () => {
    const structureColor = selectedStructure?.color || '#8B5CF6';
    const lightColor = lightenColor(structureColor, 0.92);
    const darkColor = darkenColor(structureColor, 0.2);
    const mediumColor = darkenColor(structureColor, 0.05);

    return (
      <div
        className={`flex items-center gap-2 overflow-x-auto whitespace-nowrap transition-all duration-300 ${
          isPresentationMode
            ? '' // Styling handled by CSS class
            : 'px-4 py-2 rounded-full shadow-sm text-base font-semibold'
        }`}
        style={!isPresentationMode ? {
          backgroundColor: `${lightColor}cc`,
          color: darkColor
        } : {}}
      >
        <button
          type="button"
          onClick={() => onSelectStructure(null)}
          className="transition-colors flex-shrink-0"
          style={{
            color: isPresentationMode ? mediumColor : structureColor
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = darkColor}
          onMouseLeave={(e) => e.currentTarget.style.color = isPresentationMode ? mediumColor : structureColor}
        >
          <Home className="w-4 h-4" />
        </button>
        {navigationPath.map((crumb, index) => (
          <Fragment key={crumb.id}>
            <ChevronRight
              className="w-3 h-3 flex-shrink-0"
              style={{ color: `${structureColor}66` }}
            />
            <button
              type="button"
              onClick={() => index < navigationPath.length - 1 && onSelectStructure(crumb.id)}
              disabled={index === navigationPath.length - 1}
              className={`transition-colors ${
                isMobile ? 'max-w-[120px] truncate' : ''
              }`}
              style={{
                color: index === navigationPath.length - 1 ? darkColor : structureColor,
                fontWeight: index === navigationPath.length - 1 ? '600' : '400',
                cursor: index === navigationPath.length - 1 ? 'default' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (index < navigationPath.length - 1) {
                  e.currentTarget.style.color = darkColor;
                }
              }}
              onMouseLeave={(e) => {
                if (index < navigationPath.length - 1) {
                  e.currentTarget.style.color = structureColor;
                }
              }}
              title={crumb.title}
            >
              {crumb.title}
            </button>
          </Fragment>
        ))}
      </div>
    );
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

  // Get inherited color from entry or structure hierarchy
  const getInheritedColor = (structureId, entry = null) => {
    // First priority: Check if the entry itself has a color
    if (entry?.color) {
      return entry.color;
    }

    if (!structureId || !portfolioStructure) return '#8B5CF6'; // Default purple

    // Find the structure
    const structure = portfolioStructure.find(s => s.id === structureId);
    if (!structure) return '#8B5CF6';

    // If this structure has a color, use it
    if (structure.color) return structure.color;

    // Otherwise, traverse up the parent hierarchy
    let currentStructure = structure;
    let maxDepth = 10; // Prevent infinite loops

    while (currentStructure.parentId && maxDepth > 0) {
      const parentStructure = portfolioStructure.find(s => s.id === currentStructure.parentId);
      if (!parentStructure) break;

      if (parentStructure.color) {
        return parentStructure.color;
      }

      currentStructure = parentStructure;
      maxDepth--;
    }

    return '#8B5CF6'; // Default purple if no color found in hierarchy
  };

  // Handle preview from edit sheet
  const handlePreview = (formData) => {
    // Create a temporary entry object from the form data
    const tempEntry = {
      id: editingEntry?.id || 'preview-temp',
      title: formData.title || 'Untitled',
      content: formData.content || '',
      description: formData.description || '',
      type: formData.type || 'text',
      files: formData.attachments || [],
      tags: formData.tags || {
        activities: [],
        assessments: [],
        resources: [],
        custom: []
      },
      date: formData.date,
      createdAt: editingEntry?.createdAt || new Date(),
      studentId: student?.id,
      structureId: selectedStructure?.id,
      isPreview: true // Mark this as a preview entry
    };

    // Set preview state
    setPreviewEntryData(tempEntry);
    setIsPreviewingFromEdit(true);
  };

  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  // State for editing card backgrounds
  const [editingCardId, setEditingCardId] = useState(null);
  const [cardBackgrounds, setCardBackgrounds] = useState({});

  // Drag and drop state for reordering collections
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Predefined gradient backgrounds with color mappings
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

  // Map gradients to primary colors for Firebase storage
  const gradientToColor = {
    'from-purple-500 to-blue-600': '#8B5CF6',
    'from-blue-500 to-teal-600': '#3B82F6',
    'from-green-500 to-emerald-600': '#10B981',
    'from-orange-500 to-red-600': '#F97316',
    'from-pink-500 to-purple-600': '#EC4899',
    'from-indigo-500 to-purple-600': '#6366F1',
    'from-yellow-500 to-orange-600': '#F59E0B',
    'from-cyan-500 to-blue-600': '#06B6D4',
    'from-rose-500 to-pink-600': '#F43F5E',
    'from-slate-600 to-gray-700': '#475569'
  };

  // Reverse mapping: convert Firebase color back to gradient
  const colorToGradient = Object.entries(gradientToColor).reduce((acc, [gradient, color]) => {
    acc[color] = gradient;
    return acc;
  }, {});

  // Drag and drop handlers for reordering collections
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Add a visual effect
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '';
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    // Only clear if we're leaving the card entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    e.currentTarget.style.opacity = '';

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Filter to only top-level items for reordering
    const topLevelItems = portfolioStructure.filter(item =>
      item.parentId === null && (item.type === 'portfolio' || item.type === 'course')
    );

    // Reorder the top-level items
    const reorderedItems = [...topLevelItems];
    const [draggedItem] = reorderedItems.splice(draggedIndex, 1);
    reorderedItems.splice(dropIndex, 0, draggedItem);

    // Update the order values
    const itemsWithNewOrder = reorderedItems.map((item, index) => ({
      ...item,
      order: index
    }));

    // Create the optimistic update for immediate UI feedback
    const optimisticUpdate = [...portfolioStructure];
    // Update order for all top-level items
    optimisticUpdate.forEach(item => {
      const reorderedItem = itemsWithNewOrder.find(r => r.id === item.id);
      if (reorderedItem) {
        item.order = reorderedItem.order;
      }
    });

    // Apply optimistic update immediately for instant UI response
    setOptimisticStructure(optimisticUpdate);
    setDraggedIndex(null);
    setDragOverIndex(null);
    setIsSavingOrder(true);

    // Call the reorder function from usePortfolio in the background
    if (onReorderStructure) {
      try {
        await onReorderStructure(itemsWithNewOrder);
        // Success - the real data will update via subscription
        setOptimisticStructure(null); // Clear optimistic state
      } catch (error) {
        console.error('Error reordering collections:', error);
        // Rollback optimistic update on error
        setOptimisticStructure(null);
        // Optionally show an error toast here
      } finally {
        setIsSavingOrder(false);
      }
    }
  };

  // Empty state - show portfolio overview if no section selected
  if (!selectedStructure) {
    // Always show presentation mode for portfolio overview
    if (portfolioStructure && portfolioStructure.length > 0) {
      return (
        <>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
          {/* Presentation Mode Header */}
          <div className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-10 px-8 py-4">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {student?.firstName}'s Portfolio
                </h1>
                <p className="mt-1 text-gray-600">Learning Journey & Achievements</p>
              </div>
              <div className="flex items-center gap-3">
                {isSavingOrder && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/80 px-3 py-1.5 rounded-lg">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                )}
                {!isPresentationMode && (
                  <Button
                    onClick={() => setEditingCardId(editingCardId ? null : 'edit-mode')}
                    className="gap-2 bg-white hover:bg-purple-50 border-2 border-purple-200 text-purple-700 hover:text-purple-800 hover:border-purple-300 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <PenTool className="w-4 h-4" />
                    {editingCardId ? 'Done Editing' : 'Edit Cards'}
                  </Button>
                )}
                {renderModeToggle()}
              </div>
            </div>
          </div>

          {/* Portfolio Sections Grid with Animations */}
          <div className="max-w-7xl mx-auto px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 portfolio-stagger-container">
              {(optimisticStructure || portfolioStructure)
                .filter(item => item.parentId === null && (item.type === 'portfolio' || item.type === 'course'))
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((section, index) => {
                const sectionEntries = entries.filter(e => e.structureId === section.id);

                // Determine the background gradient to use:
                // 1. Check temporary local state (cardBackgrounds)
                // 2. Check if section has a saved color in Firebase and convert to gradient
                // 3. Fall back to default gradient based on index
                let backgroundGradient;
                if (cardBackgrounds[section.id]) {
                  // User has selected a gradient in this session (not yet refreshed)
                  backgroundGradient = cardBackgrounds[section.id];
                } else if (section.color && colorToGradient[section.color]) {
                  // Section has a color saved in Firebase, convert it to gradient
                  backgroundGradient = colorToGradient[section.color];
                } else {
                  // Use default gradient based on index
                  backgroundGradient = gradientOptions[index % gradientOptions.length];
                }

                return (
                  <Card
                    key={section.id}
                    draggable={!editingCardId} // Only draggable when not editing backgrounds
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`portfolio-card group hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden relative bg-white
                      ${draggedIndex === index ? 'opacity-50' : ''}
                      ${dragOverIndex === index && draggedIndex !== index ? 'ring-4 ring-purple-400 ring-opacity-50' : ''}
                    `}
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
                    {/* Drag Handle Indicator - Hidden in presentation mode */}
                    {!editingCardId && !isPresentationMode && (
                      <div className="absolute top-2 left-2 z-20">
                        <div className="p-1 bg-white/70 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
                          <GripVertical className="w-4 h-4 text-gray-600" />
                        </div>
                      </div>
                    )}

                    {/* Edit Background and Share Buttons - Modified for presentation mode */}
                    {!isPresentationMode && (
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
                                onClick={async (e) => {
                                  e.stopPropagation();

                                  // Update local state for immediate feedback
                                  setCardBackgrounds(prev => ({
                                    ...prev,
                                    [section.id]: gradient
                                  }));

                                  // Save color to Firebase
                                  const colorHex = gradientToColor[gradient];
                                  if (colorHex && onUpdateStructure) {
                                    try {
                                      await onUpdateStructure(section.id, { color: colorHex });
                                    } catch (error) {
                                      console.error('Failed to save color:', error);
                                    }
                                  }

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

                    <div
                      className={`aspect-[16/9] p-6 flex flex-col justify-end relative bg-gradient-to-br ${backgroundGradient}`}
                    >
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
                      <p className="text-sm mb-3 text-gray-600">{section.description || 'Portfolio section'}</p>
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
          {onInitializeStructure && (
            <Button
              onClick={async () => {
                try {
                  const count = await onInitializeStructure();
                  if (count > 0) {
                    console.log(`Successfully initialized ${count} collections`);
                  } else {
                    console.log('No entries found to create collections from');
                  }
                } catch (error) {
                  console.error('Failed to initialize structure:', error);
                }
              }}
              className="mt-4 gap-2"
            >
              <Layers className="w-4 h-4" />
              Initialize Collections from Entries
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Define leaf types that cannot have children (content-only types)
  const leafTypes = ['entry'];
  const isLeafType = leafTypes.includes(selectedStructure?.type);

  // Determine if current structure is a directory type
  const sectionEntries = entries.filter(entry => entry.structureId === selectedStructure?.id);
  const childSections = portfolioStructure
    .filter(s => s.parentId === selectedStructure?.id)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Leaf types are NEVER directories - they always show content view
  // A structure is a directory if:
  // 1. It's a container type (portfolio/collection/course) - always show as directory
  // 2. OR it has child sections (always show as directory to navigate)
  // Collections now always show directory view with entry cards
  const isDirectory = !isLeafType && (
    ['portfolio', 'collection', 'course'].includes(selectedStructure?.type) ||
    childSections.length > 0
  );

  // Enhanced Presentation Mode with Directory Navigation
  if (isPresentationMode) {
    return (
      <>
      <div
        className={`flex flex-col ${isFullPresentationMode ? 'fixed inset-0 z-50' : 'min-h-screen'} ${modeTransitioning ? 'mode-transition' : ''}`}
        style={{
          background: selectedStructure?.color
            ? `linear-gradient(135deg, ${selectedStructure.color}15 0%, ${selectedStructure.color}08 50%, #f3f4f6 100%)`
            : 'linear-gradient(135deg, #f3e8ff 0%, #e0e7ff 50%, #f3f4f6 100%)',
          minHeight: '100vh'
        }}
      >
        {/* Clean Header for Presentation Mode */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-20 shadow-lg">
          <div className="px-4 md:px-8 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className={isPresentationMode ? "presentation-breadcrumbs" : ""}>
                {renderBreadcrumbs()}
              </div>
              {renderModeToggle()}
            </div>
          </div>
        </div>

        {/* Content Area with Enhanced Presentation Styling */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            {/* Show single entry view if viewing an entry */}
            {viewingEntry ? (
              <div className="max-w-6xl mx-auto animate-fadeIn">
                {/* Back button with presentation styling */}
                <Button
                  onClick={() => setViewingEntry(null)}
                  variant="outline"
                  className="mb-4 gap-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to {selectedStructure?.title || 'Collection'}
                </Button>

                <Card className="p-8 bg-white shadow-xl border border-gray-200">
                  <PortfolioEntry
                    entry={viewingEntry}
                    viewMode="expanded"
                    isPresentationMode={true}
                    familyId={familyId}
                    onEdit={() => {
                      setIsPresentationMode(false);
                      setEditingEntry(viewingEntry);
                      setViewingEntry(null);
                    }}
                    onDelete={() => {
                      onDeleteEntry(viewingEntry.id);
                      setViewingEntry(null);
                    }}
                    onUpdate={(updates) => onUpdateEntry(viewingEntry.id, updates)}
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
                </Card>
              </div>
            ) : isDirectory ? (
              <>
              {/* Show Directory View for directory types (course, unit, section) */}
              <DirectoryView
                currentStructure={selectedStructure}
                childStructures={childSections}
                allStructures={portfolioStructure}
                entries={entries}
                familyId={familyId}
                studentId={student?.id}
                onUpdateEntry={onUpdateEntry}
                onNavigate={(item, isEntry) => {
                  if (isEntry && item.itemType === 'entry') {
                    // View the specific entry
                    setViewingEntry(item);
                  } else {
                    // Navigate to structure
                    setViewingEntry(null);
                    onSelectStructure(item.id);
                  }
                }}
                onCreateStructure={onCreateStructure}
                onUpdateStructure={(id, updates) => onUpdateStructure(id, updates)}
                onReorderStructures={onReorderStructure}
                onReorderEntries={onReorderEntries}
                onDeleteStructure={onDeleteStructure}
                onAddContent={() => {
                  setIsPresentationMode(false);
                  setShowNewEntry(true);
                }}
                isEditMode={false}
                isPresentationMode={true}
                isMobile={isMobile}
              />
              </>
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
                        <Card className="p-8 bg-white shadow-xl border border-gray-200">
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

                          {/* No add button in presentation mode */}
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
      <div className={`h-full flex flex-col bg-gray-50 ${modeTransitioning ? 'mode-transition' : ''}`}>
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {renderBreadcrumbs()}
              {renderModeToggle()}
            </div>
          </div>
        </div>


      {/* Content Area */}
      <div className="flex-1 overflow-auto p-6">

        {/* Show preview view if previewing from edit sheet */}
        {previewEntryData && isPreviewingFromEdit ? (
          <div className="max-w-5xl mx-auto">
            {/* Back to Edit button */}
            <div className="flex items-center gap-4 mb-4">
              <Button
                onClick={() => {
                  setPreviewEntryData(null);
                  setIsPreviewingFromEdit(false);
                  // Keep the edit sheet open
                }}
                variant="outline"
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Edit
              </Button>
              <Badge variant="secondary" className="gap-2">
                <Eye className="w-3 h-3" />
                Preview Mode - Unsaved Changes
              </Badge>
            </div>

            <PortfolioEntry
              entry={previewEntryData}
              viewMode="expanded"
              familyId={familyId}
              isPreview={true}
              onEdit={() => {
                // Return to edit mode
                setPreviewEntryData(null);
                setIsPreviewingFromEdit(false);
              }}
              onDelete={null} // Disable delete in preview
              comments={[]} // No comments in preview
              loadingComments={false}
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
        ) : /* Show single entry view if viewing an entry in builder mode */
        viewingEntry ? (
          <div className="max-w-5xl mx-auto">
            {/* Back button */}
            <Button
              onClick={() => setViewingEntry(null)}
              variant="outline"
              className="mb-4 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to {selectedStructure?.title || 'Collection'}
            </Button>

            <PortfolioEntry
              entry={viewingEntry}
              viewMode="expanded"
              familyId={familyId}
              onEdit={() => {
                setEditingEntry(viewingEntry);
                setShowNewEntry(true);
                setViewingEntry(null);
              }}
              onDelete={() => {
                handleDeleteEntry(viewingEntry.id);
                setViewingEntry(null);
              }}
              onUpdate={(updates) => handleUpdateEntry(viewingEntry.id, updates)}
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
        ) : isDirectory ? (
          <>
            {/* Show Directory View for directory types in builder mode */}
            <DirectoryView
              currentStructure={selectedStructure}
              childStructures={childSections}
              allStructures={portfolioStructure}
              entries={entries}
              familyId={familyId}
              studentId={student?.id}
              onUpdateEntry={handleUpdateEntry}
              onNavigate={(item, isEntry) => {
                if (isEntry && item.itemType === 'entry') {
                  // View/edit the specific entry
                  setEditingEntry(item);
                  setShowNewEntry(true);
                } else if (isEntry || ['lesson', 'assessment'].includes(item.type)) {
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
              onReorderStructures={onReorderStructure}
              onReorderEntries={onReorderEntries}
              isEditMode={true}
              isMobile={isMobile}
            />
          </>
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

      {/* Entry Edit Sheet */}
      <EntryEditSheet
        isOpen={(showNewEntry || !!editingEntry) && !isPreviewingFromEdit}
        onClose={() => {
          setShowNewEntry(false);
          setEditingEntry(null);
          setViewingEntry(null);
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
        entry={editingEntry}
        structureId={selectedStructure?.id}
        collectionColor={getInheritedColor(selectedStructure?.id, editingEntry)}
        onPreview={handlePreview}
        onSave={async (entryData, filesToUpload, entryId, fileMetadata) => {
          setIsSaving(true);
          try {
            if (entryId) {
              // Update existing entry with new files if any
              // For now, fileMetadata isn't used on update since files already have metadata
              await onUpdateEntry(entryId, entryData, filesToUpload);
            } else {
              // Create new entry
              // TODO: Pass fileMetadata to onCreateEntry when the hook is updated
              await onCreateEntry(entryData, filesToUpload);
            }
            // Close sheet after successful save
            setShowNewEntry(false);
            setEditingEntry(null);
            setViewingEntry(null);
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
          } catch (error) {
            console.error('Error saving entry:', error);
          } finally {
            setIsSaving(false);
          }
        }}
        onDelete={onDeleteEntry}
        isSaving={isSaving}
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
      <DevFileIndicator fileName="PortfolioBuilder.js" />
    </>
  );
};

export default PortfolioBuilder;
