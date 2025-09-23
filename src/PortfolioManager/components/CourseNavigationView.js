import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import DevFileIndicator from './DevFileIndicator';
import { ScrollArea } from '../../components/ui/scroll-area';
import {
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Plus,
  Search,
  Grid3x3,
  List,
  FolderOpen,
  FileText,
  Image as ImageIcon,
  Video,
  Link2,
  Home,
  BookOpen,
  Hash,
  Activity,
  Sparkles,
  ArrowRight,
  Layers,
  Eye,
  Edit3,
  Trash2,
  GripVertical,
  X,
  Check,
  FolderPlus,
  FileEdit,
  Maximize2,
  Filter,
  Clock,
  CheckCircle2,
  Circle,
  MoreVertical,
  Zap
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';

const CourseNavigationView = ({
  course,
  structure,
  entries,
  onSelectSection,
  onCreateSection,
  onUpdateSection,
  onDeleteSection,
  onReorderSections,
  onNavigateToEntry,
  isEditMode = false,
  onToggleEditMode,
  isMobile = false
}) => {
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('tree'); // tree, grid, timeline
  const [editingSection, setEditingSection] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [showNewSectionForm, setShowNewSectionForm] = useState(null);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const [selectedPath, setSelectedPath] = useState([]);

  // Calculate section statistics
  const getSectionStats = (sectionId) => {
    const sectionEntries = entries.filter(e => e.structureId === sectionId);
    const childSections = structure.filter(s => s.parentId === sectionId);

    // Recursively count entries in child sections
    const childEntryCount = childSections.reduce((count, child) => {
      return count + entries.filter(e => e.structureId === child.id).length;
    }, 0);

    return {
      directEntries: sectionEntries.length,
      totalEntries: sectionEntries.length + childEntryCount,
      childSections: childSections.length,
      hasContent: sectionEntries.length > 0,
      recentEntry: sectionEntries.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      )[0]
    };
  };

  // Get icon for entry type
  const getEntryIcon = (type) => {
    switch(type) {
      case 'text': return <FileText className="w-3 h-3" />;
      case 'image': return <ImageIcon className="w-3 h-3" />;
      case 'video': return <Video className="w-3 h-3" />;
      case 'link': return <Link2 className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  // Toggle section expansion
  const toggleExpand = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Start editing section
  const startEditingSection = (section) => {
    setEditingSection(section.id);
    setEditingTitle(section.title);
  };

  // Save section edit
  const saveEdit = () => {
    if (editingTitle.trim() && editingSection) {
      onUpdateSection(editingSection, { title: editingTitle.trim() });
    }
    setEditingSection(null);
    setEditingTitle('');
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingSection(null);
    setEditingTitle('');
  };

  // Add new section
  const handleAddSection = (parentId = null) => {
    if (newSectionTitle.trim()) {
      onCreateSection({
        title: newSectionTitle.trim(),
        parentId,
        type: parentId ? 'topic' : 'section'
      });
      setNewSectionTitle('');
      setShowNewSectionForm(null);
    }
  };

  // Handle drag start
  const handleDragStart = (e, item) => {
    if (!isEditMode) return;
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e, item) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(item);
  };

  // Handle drop
  const handleDrop = (e, targetItem) => {
    if (!isEditMode) return;
    e.preventDefault();

    if (draggedItem && targetItem && draggedItem.id !== targetItem.id) {
      onReorderSections(draggedItem.id, targetItem.id);
    }

    setDraggedItem(null);
    setDragOverItem(null);
  };

  // Filter sections based on search
  const filterSections = (sections) => {
    if (!searchQuery) return sections;

    return sections.filter(section => {
      const matchesSearch = section.title.toLowerCase().includes(searchQuery.toLowerCase());
      const hasMatchingEntries = entries.some(e =>
        e.structureId === section.id &&
        e.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return matchesSearch || hasMatchingEntries;
    });
  };

  // Render section tree item
  const renderTreeSection = (section, depth = 0) => {
    const stats = getSectionStats(section.id);
    const childSections = structure.filter(s => s.parentId === section.id);
    const hasChildren = childSections.length > 0;
    const isExpanded = expandedSections.has(section.id);
    const isEditing = editingSection === section.id;
    const sectionEntries = entries.filter(e => e.structureId === section.id);

    return (
      <div key={section.id} className="select-none">
        <div
          className={`
            group flex items-center px-3 py-2.5 rounded-lg transition-all duration-200
            ${depth > 0 ? 'ml-6' : ''}
            ${isEditMode ? 'hover:bg-gray-50' : 'hover:bg-purple-50 cursor-pointer'}
            ${dragOverItem?.id === section.id ? 'bg-blue-50 border-2 border-blue-300' : ''}
          `}
          draggable={isEditMode}
          onDragStart={(e) => handleDragStart(e, section)}
          onDragOver={(e) => handleDragOver(e, section)}
          onDrop={(e) => handleDrop(e, section)}
          onClick={() => !isEditMode && !isEditing && onSelectSection(section.id)}
        >
          {/* Drag Handle */}
          {isEditMode && (
            <GripVertical className="w-4 h-4 text-gray-400 mr-2 cursor-move" />
          )}

          {/* Expand/Collapse */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(section.id);
              }}
              className="p-0.5 hover:bg-gray-200 rounded mr-2"
            >
              {isExpanded ?
                <ChevronDown className="w-4 h-4" /> :
                <ChevronRight className="w-4 h-4" />
              }
            </button>
          )}

          {/* Icon */}
          <div className={`p-1.5 rounded-lg mr-3 ${section.color ? '' : 'bg-purple-100'}`}
               style={section.color ? { backgroundColor: `${section.color}20` } : {}}>
            {section.icon || <FolderOpen className="w-4 h-4 text-purple-600" />}
          </div>

          {/* Title */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Input
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit();
                    if (e.key === 'Escape') cancelEdit();
                  }}
                  className="h-7 text-sm"
                  autoFocus
                />
                <Button size="sm" variant="ghost" onClick={saveEdit}>
                  <Check className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={cancelEdit}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <div>
                <div className="font-medium text-gray-900 truncate">{section.title}</div>
                {section.description && (
                  <div className="text-xs text-gray-500 truncate">{section.description}</div>
                )}
              </div>
            )}
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-2 ml-2">
            {stats.totalEntries > 0 && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                {stats.totalEntries}
              </Badge>
            )}
            {stats.childSections > 0 && (
              <Badge variant="outline" className="text-gray-600">
                {stats.childSections} sections
              </Badge>
            )}
          </div>

          {/* Actions */}
          {isEditMode && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => startEditingSection(section)}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowNewSectionForm(section.id)}>
                  <FolderPlus className="w-4 h-4 mr-2" />
                  Add Subsection
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDeleteSection(section.id)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Quick View */}
          {!isEditMode && stats.totalEntries > 0 && (
            <ChevronRight className="w-4 h-4 text-gray-400 ml-2" />
          )}
        </div>

        {/* Entry Preview (when expanded) */}
        {isExpanded && sectionEntries.length > 0 && !isEditMode && (
          <div className={`ml-${depth + 12} mt-1 space-y-1`}>
            {sectionEntries.slice(0, 3).map(entry => (
              <div
                key={entry.id}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 cursor-pointer hover:bg-gray-50 rounded"
                onClick={() => onNavigateToEntry(entry.id)}
              >
                {getEntryIcon(entry.type)}
                <span className="truncate">{entry.title}</span>
                {entry.quickAdd && (
                  <Zap className="w-3 h-3 text-yellow-500" />
                )}
              </div>
            ))}
            {sectionEntries.length > 3 && (
              <div className="px-3 py-1 text-xs text-gray-500">
                +{sectionEntries.length - 3} more entries
              </div>
            )}
          </div>
        )}

        {/* New Subsection Form */}
        {showNewSectionForm === section.id && (
          <div className={`ml-${depth + 6} mt-2 p-3 bg-gray-50 rounded-lg`}>
            <div className="flex items-center gap-2">
              <Input
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                placeholder="New section title..."
                className="flex-1 h-8"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddSection(section.id);
                  if (e.key === 'Escape') {
                    setShowNewSectionForm(null);
                    setNewSectionTitle('');
                  }
                }}
                autoFocus
              />
              <Button
                size="sm"
                onClick={() => handleAddSection(section.id)}
                disabled={!newSectionTitle.trim()}
              >
                Add
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowNewSectionForm(null);
                  setNewSectionTitle('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Render children */}
        {isExpanded && hasChildren && (
          <div className="mt-1">
            {filterSections(childSections).map(child =>
              renderTreeSection(child, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  // Render grid view
  const renderGridView = () => {
    const topLevelSections = filterSections(structure.filter(s => !s.parentId));

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {topLevelSections.map(section => {
          const stats = getSectionStats(section.id);
          const childSections = structure.filter(s => s.parentId === section.id);

          return (
            <Card
              key={section.id}
              className="group hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
              onClick={() => onSelectSection(section.id)}
            >
              {/* Header with gradient */}
              <div className={`
                h-32 p-4 bg-gradient-to-br from-purple-500 to-blue-600
                flex flex-col justify-between relative
              `}>
                {isEditMode && (
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="bg-white/20 hover:bg-white/30 text-white"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => startEditingSection(section)}>
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDeleteSection(section.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    {section.icon || <FolderOpen className="w-5 h-5 text-white" />}
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-semibold text-lg">{section.title}</h3>
                  {section.description && (
                    <p className="text-white/80 text-sm line-clamp-2">{section.description}</p>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Stats */}
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{stats.totalEntries} entries</span>
                  </div>
                  {childSections.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Layers className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{childSections.length} subsections</span>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                {stats.totalEntries > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.min(stats.totalEntries * 10, 100)}%` }}
                    />
                  </div>
                )}

                {/* Child sections preview */}
                {childSections.length > 0 && (
                  <div className="space-y-1">
                    {childSections.slice(0, 3).map(child => (
                      <div key={child.id} className="flex items-center gap-2 text-sm text-gray-600">
                        <ChevronRight className="w-3 h-3" />
                        <span className="truncate">{child.title}</span>
                      </div>
                    ))}
                    {childSections.length > 3 && (
                      <div className="text-xs text-gray-500 pl-5">
                        +{childSections.length - 3} more
                      </div>
                    )}
                  </div>
                )}

                {/* View button */}
                <Button
                  variant="outline"
                  className="w-full group-hover:bg-purple-50 group-hover:border-purple-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSection(section.id);
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Section
                </Button>
              </div>
            </Card>
          );
        })}

        {/* Add new section card */}
        {isEditMode && (
          <Card
            className="border-2 border-dashed border-gray-300 hover:border-purple-400 cursor-pointer transition-colors"
            onClick={() => setShowNewSectionForm('root')}
          >
            <div className="h-full flex flex-col items-center justify-center p-8 text-gray-500 hover:text-purple-600">
              <Plus className="w-12 h-12 mb-2" />
              <span className="font-medium">Add New Section</span>
            </div>
          </Card>
        )}
      </div>
    );
  };

  // Main render
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{course?.title || 'Course Structure'}</h2>
              <p className="text-sm text-gray-500">
                {structure.filter(s => !s.parentId).length} sections • {entries.length} total entries
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setViewMode('tree')}
                      className={`p-1.5 rounded ${viewMode === 'tree' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Tree View</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                    >
                      <Grid3x3 className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Grid View</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Edit Mode Toggle */}
            <Button
              onClick={onToggleEditMode}
              variant={isEditMode ? 'default' : 'outline'}
              size="sm"
              className="gap-2"
            >
              <Edit3 className="w-4 h-4" />
              {isEditMode ? 'Done' : 'Edit'}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sections and entries..."
            className="pl-9 h-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'tree' ? (
          <ScrollArea className="h-full">
            <div className="p-4">
              {/* Add root section button */}
              {isEditMode && (
                <Button
                  variant="outline"
                  className="w-full mb-4 border-dashed"
                  onClick={() => setShowNewSectionForm('root')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Section
                </Button>
              )}

              {/* New root section form */}
              {showNewSectionForm === 'root' && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Input
                      value={newSectionTitle}
                      onChange={(e) => setNewSectionTitle(e.target.value)}
                      placeholder="New section title..."
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddSection(null);
                        if (e.key === 'Escape') {
                          setShowNewSectionForm(null);
                          setNewSectionTitle('');
                        }
                      }}
                      autoFocus
                    />
                    <Button onClick={() => handleAddSection(null)}>Add</Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowNewSectionForm(null);
                        setNewSectionTitle('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Section tree */}
              {filterSections(structure.filter(s => !s.parentId)).map(section =>
                renderTreeSection(section)
              )}

              {/* Empty state */}
              {structure.length === 0 && (
                <div className="text-center py-12">
                  <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h3>
                  <p className="text-gray-500 mb-6">Start building your course structure</p>
                  <Button onClick={() => setShowNewSectionForm('root')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Section
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        ) : (
          renderGridView()
        )}
      </div>
      <DevFileIndicator fileName="CourseNavigationView.js" />
    </div>
  );
};

export default CourseNavigationView;