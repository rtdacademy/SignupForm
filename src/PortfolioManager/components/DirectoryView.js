import React, { useState, useMemo } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { ScrollArea } from '../../components/ui/scroll-area';
import {
  FolderOpen,
  FileText,
  Image as ImageIcon,
  Video,
  Link2,
  BookOpen,
  Hash,
  Activity,
  Sparkles,
  ArrowRight,
  Layers,
  Plus,
  Search,
  Grid3x3,
  List,
  ChevronRight,
  Clock,
  Users,
  BarChart3,
  Calendar,
  Edit3,
  Trash2,
  MoreVertical,
  FolderPlus,
  FileEdit,
  Check,
  ExternalLink
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';

const DirectoryView = ({
  currentStructure,
  childStructures,
  allStructures = [],
  entries,
  onNavigate,
  onCreateStructure,
  onUpdateStructure,
  onDeleteStructure,
  onAddContent,
  isEditMode = false,
  isMobile = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showNewItemForm, setShowNewItemForm] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemType, setNewItemType] = useState('portfolio');
  const [editingItem, setEditingItem] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Define leaf types that cannot have children
  const leafTypes = ['entry'];

  // Determine if current structure can have children
  const canHaveChildren = useMemo(() => {
    return !leafTypes.includes(currentStructure?.type);
  }, [currentStructure]);

  // Determine if current structure is a directory type
  const isDirectory = useMemo(() => {
    return canHaveChildren;
  }, [canHaveChildren]);

  // Get icon for structure type
  const getIcon = (type, isDirectory = false) => {
    const icons = {
      portfolio: BookOpen,
      collection: FolderOpen,
      entry: FileText,
      // Legacy support
      course: BookOpen,
      default: isDirectory ? FolderOpen : FileText
    };
    return icons[type] || icons.default;
  };

  // Get color scheme for structure type
  const getColorScheme = (type) => {
    const colors = {
      portfolio: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-purple-600' },
      collection: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-600' },
      entry: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', icon: 'text-gray-600' },
      // Legacy support
      course: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-purple-600' },
      default: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', icon: 'text-gray-600' }
    };
    return colors[type] || colors.default;
  };

  // Calculate statistics for a structure item
  const getItemStats = (item) => {
    const directEntries = entries.filter(e => e.structureId === item.id);
    const directChildren = allStructures.filter(s => s.parentId === item.id);
    const isItemDirectory = ['course', 'unit', 'section'].includes(item.type);

    // Recursively count all entries and get preview content
    const getDescendantInfo = (parentId, maxDepth = 10, currentDepth = 0) => {
      if (currentDepth >= maxDepth) return { entries: [], children: [] };

      const children = allStructures.filter(s => s.parentId === parentId);
      const directEntriesForParent = entries.filter(e => e.structureId === parentId);

      let allDescendantEntries = [...directEntriesForParent];
      let allDescendantChildren = [...children];

      children.forEach(child => {
        const childInfo = getDescendantInfo(child.id, maxDepth, currentDepth + 1);
        allDescendantEntries = [...allDescendantEntries, ...childInfo.entries];
        allDescendantChildren = [...allDescendantChildren, ...childInfo.children];
      });

      return {
        entries: allDescendantEntries,
        children: allDescendantChildren
      };
    };

    const descendantInfo = getDescendantInfo(item.id);
    const totalEntries = descendantInfo.entries.length;
    const hasContent = totalEntries > 0 || directChildren.length > 0;

    // Get up to 3 items total for preview (prioritize showing both types if available)
    let previewChildren = [];
    let previewEntries = [];

    if (directChildren.length > 0 && descendantInfo.entries.length > 0) {
      // If we have both, show at least 1 of each, then fill to 3 total
      previewChildren = directChildren.slice(0, 2);
      previewEntries = descendantInfo.entries.slice(0, 3 - previewChildren.length);
    } else {
      // If we only have one type, show up to 3 of that type
      previewChildren = directChildren.slice(0, 3);
      previewEntries = descendantInfo.entries.slice(0, 3 - previewChildren.length);
    }

    return {
      directEntries: directEntries,
      directChildren: directChildren,
      totalEntries,
      childCount: directChildren.length,
      hasContent,
      isDirectory: isItemDirectory,
      previewEntries,
      previewChildren,
      totalDescendantChildren: descendantInfo.children.length
    };
  };

  // Filter items based on search
  const filteredChildren = useMemo(() => {
    if (!searchQuery) return childStructures;
    return childStructures.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [childStructures, searchQuery]);

  // Handle creating new item
  const handleCreateItem = () => {
    if (newItemTitle.trim()) {
      // Validate parent-child relationship
      const parentType = currentStructure?.type;
      const validTypes = (() => {
        switch (parentType) {
          case 'portfolio':
          case 'course':  // Legacy support
            return ['collection'];
          case 'collection':
            return ['entry'];
          case undefined:
          case null:
            return ['portfolio'];
          default:
            return [];
        }
      })();

      if (!validTypes.includes(newItemType)) {
        alert(`Cannot add ${newItemType} to ${parentType || 'root'}. Valid types are: ${validTypes.join(', ')}`);
        return;
      }

      onCreateStructure({
        type: newItemType,
        title: newItemTitle.trim(),
        description: '',
        parentId: currentStructure?.id || null
      });
      setShowNewItemForm(false);
      setNewItemTitle('');
    }
  };

  // Handle updating item title
  const handleUpdateTitle = (item) => {
    if (editingTitle.trim() && editingTitle !== item.title) {
      onUpdateStructure(item.id, { title: editingTitle.trim() });
    }
    setEditingItem(null);
    setEditingTitle('');
  };

  // Render directory card (for grid view)
  const renderDirectoryCard = (item) => {
    const stats = getItemStats(item);
    const Icon = getIcon(item.type, stats.isDirectory);
    const colors = getColorScheme(item.type);
    const isEditing = editingItem === item.id;
    const isLeaf = leafTypes.includes(item.type);

    // Handle click based on item type and edit mode
    const handleItemClick = () => {
      if (isEditing) return;

      // For leaf types (lessons, assessments) in edit mode, open for editing
      if (isLeaf && isEditMode) {
        // Trigger edit/content creation for this document
        onNavigate(item, true); // Pass flag indicating this is a document to edit
      } else {
        // For directories or in presentation mode, navigate normally
        onNavigate(item);
      }
    };

    return (
      <Card
        key={item.id}
        className={`
          relative group cursor-pointer transition-all duration-200
          hover:shadow-lg hover:scale-[1.02] ${colors.bg} ${colors.border}
          ${isMobile ? 'p-4' : 'p-6'}
          ${isLeaf ? 'ring-2 ring-transparent hover:ring-purple-300' : ''}
        `}
        onClick={handleItemClick}
      >
        {/* Action Menu */}
        {isEditMode && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  setEditingItem(item.id);
                  setEditingTitle(item.title);
                }}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteStructure(item.id);
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <div className="flex items-start space-x-4">
          {/* Icon */}
          <div className={`p-3 rounded-lg ${colors.bg} ${colors.icon}`}>
            <Icon className="w-6 h-6" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                <Input
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdateTitle(item);
                    if (e.key === 'Escape') {
                      setEditingItem(null);
                      setEditingTitle('');
                    }
                  }}
                  className="flex-1"
                  autoFocus
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleUpdateTitle(item)}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <h3 className={`font-semibold text-lg ${colors.text} truncate`}>
                    {item.title}
                  </h3>
                  {isLeaf && (
                    <Badge variant="outline" className="text-xs">
                      Entry
                    </Badge>
                  )}
                </div>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </>
            )}

            {/* Content Preview */}
            {stats.hasContent ? (
              <div className="mt-3">
                <div className="space-y-1.5">
                  {/* Show child structures */}
                  {stats.previewChildren.map((child, index) => (
                    <div key={child.id} className="flex items-center gap-2 text-sm text-gray-600">
                      <FolderOpen className="w-3.5 h-3.5 text-gray-400" />
                      <span className="truncate">{child.title}</span>
                    </div>
                  ))}

                  {/* Show entries */}
                  {stats.previewEntries.map((entry, index) => (
                    <div key={entry.id} className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="w-3.5 h-3.5 text-gray-400" />
                      <span className="truncate">{entry.title || 'Untitled'}</span>
                    </div>
                  ))}

                  {/* Show more indicator if there are more items */}
                  {(stats.childCount + stats.totalEntries > 3) && (
                    <div className="text-sm text-gray-400 italic">
                      +{Math.max(0, stats.childCount - stats.previewChildren.length) + Math.max(0, stats.totalEntries - stats.previewEntries.length)} more
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Only show "Empty" for directories, not for document types
              !isLeaf && <div className="mt-3 text-sm text-gray-400 italic">Empty</div>
            )}
          </div>

          {/* Navigation Arrow or Document Icon */}
          {stats.isDirectory ? (
            <div className={`flex items-center justify-center ${colors.text} opacity-50 group-hover:opacity-100 transition-opacity`}>
              <ChevronRight className="w-5 h-5" />
            </div>
          ) : isLeaf && (
            <div className={`flex items-center justify-center ${colors.text} opacity-50 group-hover:opacity-100 transition-opacity`}>
              {isEditMode ? <Edit3 className="w-5 h-5" /> : <ExternalLink className="w-5 h-5" />}
            </div>
          )}
        </div>

        {/* Progress Bar (for directories with content) */}
        {stats.isDirectory && stats.totalEntries > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{Math.round((stats.directEntries / Math.max(stats.totalEntries, 1)) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${(stats.directEntries / Math.max(stats.totalEntries, 1)) * 100}%` }}
              />
            </div>
          </div>
        )}
      </Card>
    );
  };

  // Render list item (for list view)
  const renderListItem = (item) => {
    const stats = getItemStats(item);
    const Icon = getIcon(item.type, stats.isDirectory);
    const colors = getColorScheme(item.type);
    const isEditing = editingItem === item.id;
    const isLeaf = leafTypes.includes(item.type);

    // Handle click based on item type and edit mode
    const handleItemClick = () => {
      if (isEditing) return;

      // For leaf types (lessons, assessments) in edit mode, open for editing
      if (isLeaf && isEditMode) {
        // Trigger edit/content creation for this document
        onNavigate(item, true); // Pass flag indicating this is a document to edit
      } else {
        // For directories or in presentation mode, navigate normally
        onNavigate(item);
      }
    };

    return (
      <div
        key={item.id}
        className={`
          group flex items-center justify-between p-4 rounded-lg cursor-pointer
          transition-all duration-200 hover:shadow-md ${colors.bg} ${colors.border}
          border mb-2
          ${isLeaf ? 'ring-2 ring-transparent hover:ring-purple-300' : ''}
        `}
        onClick={handleItemClick}
      >
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          {/* Icon */}
          <div className={`p-2 rounded-lg ${colors.bg} ${colors.icon}`}>
            <Icon className="w-5 h-5" />
          </div>

          {/* Title and Description */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                <Input
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdateTitle(item);
                    if (e.key === 'Escape') {
                      setEditingItem(null);
                      setEditingTitle('');
                    }
                  }}
                  className="flex-1"
                  autoFocus
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleUpdateTitle(item)}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <h3 className={`font-medium ${colors.text} truncate`}>
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-sm text-gray-500 truncate">
                    {item.description}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Content Preview for List View */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {stats.previewChildren.slice(0, 2).map(child => (
              <span key={child.id} className="flex items-center gap-1">
                <FolderOpen className="w-3.5 h-3.5" />
                <span className="truncate max-w-[100px]">{child.title}</span>
              </span>
            ))}
            {stats.previewEntries.slice(0, Math.max(0, 2 - stats.previewChildren.length)).map(entry => (
              <span key={entry.id} className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                <span className="truncate max-w-[100px]">{entry.title || 'Untitled'}</span>
              </span>
            ))}
            {(stats.childCount + stats.totalEntries > 2) && (
              <span className="text-gray-400 italic">+{Math.max(0, stats.childCount + stats.totalEntries - 2)} more</span>
            )}
            {!stats.hasContent && !isLeaf && (
              <span className="text-gray-400 italic">Empty</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-4">
          {isEditMode && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  setEditingItem(item.id);
                  setEditingTitle(item.title);
                }}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteStructure(item.id);
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {stats.isDirectory && (
            <ChevronRight className={`w-5 h-5 ${colors.text} opacity-50 group-hover:opacity-100`} />
          )}
        </div>
      </div>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    const isCollection = currentStructure?.type === 'collection';
    const isPortfolio = currentStructure?.type === 'portfolio' || currentStructure?.type === 'course';

    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <FolderOpen className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No items yet
        </h3>
      
        {isEditMode && (
          <Button
            onClick={() => {
              if (isCollection) {
                onAddContent(); // For collections, use the content add function
              } else {
                setShowNewItemForm(true); // For portfolios, show the form
              }
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add {isPortfolio ? 'Collection' : isCollection ? 'Entry' : 'Item'}
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header Controls */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                onClick={() => setViewMode('grid')}
                className="h-8 px-3"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                onClick={() => setViewMode('list')}
                className="h-8 px-3"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Add Button - only show for collections (to add entries) and portfolios (to add collections) */}
          {isEditMode && currentStructure?.type !== 'entry' && (
            <Button
              onClick={() => {
                const isCollection = currentStructure?.type === 'collection';
                const isPortfolio = currentStructure?.type === 'portfolio' || currentStructure?.type === 'course';

                if (isCollection) {
                  // For collections, trigger content add
                  onAddContent();
                } else if (isPortfolio || !currentStructure) {
                  // For portfolios or root level, show form
                  if (!currentStructure) {
                    setNewItemType('portfolio');
                  } else {
                    setNewItemType('collection');
                  }
                  setShowNewItemForm(true);
                }
              }}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add {currentStructure?.type === 'collection' ? 'Entry' : currentStructure?.type === 'portfolio' || currentStructure?.type === 'course' ? 'Collection' : 'Portfolio'}
            </Button>
          )}
        </div>

        {/* Search Bar */}
        {filteredChildren.length > 5 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
      </div>

      {/* New Item Form */}
      {showNewItemForm && (
        <Card className="p-4 mb-4 border-dashed">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Enter name..."
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateItem();
                if (e.key === 'Escape') {
                  setShowNewItemForm(false);
                  setNewItemTitle('');
                }
              }}
              autoFocus
            />
            {/* Only show type selector if there are multiple valid types */}
            {(() => {
              let typeToCreate = '';
              if (!currentStructure) {
                typeToCreate = 'portfolio';
              } else if (currentStructure.type === 'portfolio' || currentStructure.type === 'course') {
                typeToCreate = 'collection';
              } else if (currentStructure.type === 'collection') {
                typeToCreate = 'entry';
              }

              // Set the type if not already set correctly
              if (typeToCreate && newItemType !== typeToCreate) {
                setNewItemType(typeToCreate);
              }

              return (
                <div className="flex items-center px-3 py-2 text-sm text-gray-600">
                  Creating: <span className="font-semibold ml-1">{typeToCreate.charAt(0).toUpperCase() + typeToCreate.slice(1)}</span>
                </div>
              );
            })()}
            <Button onClick={handleCreateItem}>
              Create
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowNewItemForm(false);
                setNewItemTitle('');
              }}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Content Area */}
      <ScrollArea className="flex-1">
        {filteredChildren.length === 0 ? (
          renderEmptyState()
        ) : viewMode === 'grid' ? (
          <div className={`grid gap-4 ${
            isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {filteredChildren.map(renderDirectoryCard)}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredChildren.map(renderListItem)}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default DirectoryView;