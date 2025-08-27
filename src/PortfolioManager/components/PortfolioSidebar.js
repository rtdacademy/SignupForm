import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/ui/popover';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  FolderPlus,
  FileText,
  GripVertical,
  BookOpen,
  Palette,
  Check,
  X,
  Search,
  Filter,
  FolderOpen,
  Folder,
  GraduationCap,
  Calculator,
  Beaker,
  Info,
  Globe,
  Activity,
  Briefcase,
  Wrench,
  Hash,
  Shield,
  Archive,
  ArchiveRestore
} from 'lucide-react';
import { getIconForSubject } from '../hooks/usePortfolio';

const PortfolioSidebar = ({
  structure,
  selectedId,
  onSelectStructure,
  onCreateStructure,
  onUpdateStructure,
  onDeleteStructure,
  onRestoreStructure,
  onGetArchivedItems,
  onReorder,
  metadata,
  onOpenSOLOPlan
}) => {
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [archivedItems, setArchivedItems] = useState([]);
  const [loadingArchived, setLoadingArchived] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [showNewItemForm, setShowNewItemForm] = useState(false);
  const [newItemParentId, setNewItemParentId] = useState(null);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemType, setNewItemType] = useState('module');
  
  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  
  // Refresh archived items when showing and metadata indicates changes
  useEffect(() => {
    if (showArchived && metadata?.hasArchivedItems && onGetArchivedItems) {
      const loadArchived = async () => {
        setLoadingArchived(true);
        try {
          const items = await onGetArchivedItems();
          setArchivedItems(items);
        } catch (err) {
          console.error('Error refreshing archived items:', err);
        } finally {
          setLoadingArchived(false);
        }
      };
      loadArchived();
    }
  }, [metadata?.hasArchivedItems, metadata?.lastModified]); // Re-run when metadata changes

  // Color palette for structure items
  const colorPalette = [
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#F97316', // Orange
    '#6366F1', // Indigo
    '#84CC16', // Lime
  ];

  // Icon mapping for different types
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
    FileText: FileText,
    Hash: Hash
  };
  
  // Get icon component
  const getIconComponent = (iconName) => {
    return iconComponents[iconName] || Folder;
  };

  // Toggle item expansion
  const toggleExpand = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  // Start editing an item
  const startEditing = (item) => {
    setEditingId(item.id);
    setEditingTitle(item.title);
  };

  // Save edited title
  const saveEdit = () => {
    if (editingTitle.trim() && editingId) {
      onUpdateStructure(editingId, { title: editingTitle.trim() });
    }
    setEditingId(null);
    setEditingTitle('');
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  // Handle drag start
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e, item) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(item);
  };

  // Handle drop
  const handleDrop = (e, targetItem) => {
    e.preventDefault();
    
    if (draggedItem && targetItem && draggedItem.id !== targetItem.id) {
      // Reorder logic
      const reorderedItems = [...structure];
      const draggedIndex = reorderedItems.findIndex(item => item.id === draggedItem.id);
      const targetIndex = reorderedItems.findIndex(item => item.id === targetItem.id);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        reorderedItems.splice(draggedIndex, 1);
        reorderedItems.splice(targetIndex, 0, draggedItem);
        onReorder(reorderedItems);
      }
    }
    
    setDraggedItem(null);
    setDragOverItem(null);
  };

  // Create new structure item
  const handleCreateNew = () => {
    if (newItemTitle.trim()) {
      onCreateStructure({
        type: newItemType,
        title: newItemTitle.trim(),
        description: '',
        parentId: newItemParentId,
        icon: newItemType === 'course' ? 'GraduationCap' : newItemType === 'module' ? 'Folder' : 'FileText',
        color: colorPalette[Math.floor(Math.random() * colorPalette.length)]
      });
      
      setShowNewItemForm(false);
      setNewItemTitle('');
      setNewItemType('module');
      setNewItemParentId(null);
    }
  };

  // Duplicate an item
  const duplicateItem = (item) => {
    onCreateStructure({
      ...item,
      title: `${item.title} (Copy)`,
      id: undefined,
      createdAt: undefined
    });
  };

  // Filter structure based on search
  const filterStructure = (items) => {
    if (!searchQuery) return items;
    
    return items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      const hasMatchingChildren = item.children && filterStructure(item.children).length > 0;
      return matchesSearch || hasMatchingChildren;
    });
  };

  // Render structure item
  const renderStructureItem = (item, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isSelected = selectedId === item.id;
    const isEditing = editingId === item.id;
    const isDraggedOver = dragOverItem?.id === item.id;

    return (
      <div key={item.id}>
        <div
          className={`
            group flex items-center px-2 py-1.5 rounded-md cursor-pointer
            transition-all duration-200
            ${isSelected ? 'bg-purple-100 text-purple-900' : 'hover:bg-gray-100'}
            ${isDraggedOver ? 'bg-blue-50 border-blue-300' : ''}
            ${item.isAlbertaCourse ? 'border-l-4 border-blue-500' : ''}
            ${level > 0 ? `ml-${Math.min(level * 4, 12)}` : ''}
          `}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => !isEditing && onSelectStructure(item.id)}
          draggable={!isEditing}
          onDragStart={(e) => handleDragStart(e, item)}
          onDragOver={(e) => handleDragOver(e, item)}
          onDrop={(e) => handleDrop(e, item)}
        >
          {/* Drag handle */}
          <GripVertical className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity mr-1" />
          
          {/* Expand/Collapse chevron */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(item.id);
              }}
              className="p-0.5 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          
          {/* Icon with color */}
          <div 
            className="w-6 h-6 rounded flex items-center justify-center mr-2 text-sm"
            style={{ backgroundColor: `${item.color}20`, color: item.color }}
          >
            {(() => {
              const IconComponent = getIconComponent(item.icon || 'Folder');
              return <IconComponent className="w-4 h-4" />;
            })()}
          </div>
          
          {/* Title */}
          {isEditing ? (
            <Input
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEdit();
                if (e.key === 'Escape') cancelEdit();
              }}
              onClick={(e) => e.stopPropagation()}
              className="h-7 text-sm flex-1"
              autoFocus
            />
          ) : (
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm truncate">
                  {item.title}
                </span>
                {/* Alberta Course Shield Icon with Info */}
                {item.isAlbertaCourse && (
                  <div className="flex items-center space-x-1">
                    <Shield 
                      className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" 
                      title="Alberta Education Course"
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Info className="w-3 h-3 text-blue-500 hover:text-blue-700" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-4">
                        <div className="space-y-3">
                          <div className="flex items-start space-x-2">
                            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-sm">Alberta Education Course</h4>
                              <p className="text-xs text-gray-600 mt-1">
                                This course is managed through your Program Plan. To ensure proper 
                                paperwork with Alberta Education, all Alberta courses must be listed 
                                in your SOLO Education Plan.
                              </p>
                            </div>
                          </div>
                          <div className="bg-amber-50 border border-amber-200 rounded p-2">
                            <p className="text-xs text-amber-800">
                              <strong>Note:</strong> Changes to Alberta courses should be made in your 
                              Program Plan. The portfolio will automatically sync with your plan.
                            </p>
                          </div>
                          {onOpenSOLOPlan && (
                            <button
                              onClick={() => onOpenSOLOPlan()}
                              className="w-full text-sm bg-blue-600 text-white rounded-md py-2 px-3 hover:bg-blue-700 transition-colors"
                            >
                              Manage in Program Plan →
                            </button>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
              {/* Course Code */}
              {item.courseCode && (
                <span className="text-xs text-gray-500">
                  {item.courseCode}
                </span>
              )}
            </div>
          )}
          
          {/* Entry count badge */}
          {item.entryCount > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full flex-shrink-0">
              {item.entryCount}
            </span>
          )}
          
          {/* Action menu */}
          {!isEditing && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 p-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-1">
                <button
                  onClick={() => {
                    setNewItemParentId(item.id);
                    setShowNewItemForm(true);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 rounded"
                >
                  <FolderPlus className="w-4 h-4 mr-2" />
                  Add Sub-item
                </button>
                <button
                  onClick={() => startEditing(item)}
                  className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 rounded"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Rename
                </button>
                <button
                  onClick={() => duplicateItem(item)}
                  className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 rounded"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </button>
                
                {/* Color picker */}
                <div className="border-t my-1">
                  <div className="px-3 py-2 text-xs text-gray-500">Color</div>
                  <div className="grid grid-cols-5 gap-1 px-3 pb-2">
                    {colorPalette.map((color) => (
                      <button
                        key={color}
                        onClick={() => onUpdateStructure(item.id, { color })}
                        className="w-6 h-6 rounded border-2 border-gray-200 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                      >
                        {item.color === color && (
                          <Check className="w-3 h-3 text-white m-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                
                {item.isAlbertaCourse ? (
                  <div className="border-t">
                    <div className="px-3 py-2 bg-blue-50 rounded">
                      <div className="flex items-start space-x-2">
                        <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-blue-800">
                            This Alberta course is managed through your Program Plan
                          </p>
                          {onOpenSOLOPlan && (
                            <button
                              onClick={() => onOpenSOLOPlan()}
                              className="text-xs text-blue-600 hover:text-blue-700 underline mt-1"
                            >
                              Edit in Program Plan →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-t">
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to archive this item? You can restore it later from the archive.')) {
                          onDeleteStructure(item.id);
                        }
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded"
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          )}
          
          {/* Edit action buttons */}
          {isEditing && (
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  saveEdit();
                }}
                className="p-1"
              >
                <Check className="w-4 h-4 text-green-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  cancelEdit();
                }}
                className="p-1"
              >
                <X className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          )}
        </div>
        
        {/* Render children */}
        {hasChildren && isExpanded && (
          <div>
            {filterStructure(item.children).map((child) => 
              renderStructureItem(child, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const filteredStructure = filterStructure(structure);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Search bar */}
      <div className="p-3 border-b bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search portfolio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 h-9"
          />
        </div>
      </div>

      {/* Quick stats */}
      {metadata && (
        <div className="px-3 py-2 bg-white border-b">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-gray-600">
              <span className="font-medium">{metadata.totalEntries || 0}</span> entries
            </div>
            <div className="text-gray-600">
              <span className="font-medium">{metadata.totalFiles || 0}</span> files
            </div>
          </div>
        </div>
      )}

      {/* Add new button and archive toggle */}
      <div className="p-3 bg-white border-b space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            setNewItemParentId(null);
            setShowNewItemForm(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
        
        {metadata?.hasArchivedItems && (
          <Button
            variant={showArchived ? 'default' : 'outline'}
            size="sm"
            className="w-full"
            disabled={loadingArchived}
            onClick={async () => {
              if (!showArchived && onGetArchivedItems) {
                setLoadingArchived(true);
                try {
                  const items = await onGetArchivedItems();
                  setArchivedItems(items);
                } catch (err) {
                  console.error('Error loading archived items:', err);
                } finally {
                  setLoadingArchived(false);
                }
              }
              setShowArchived(!showArchived);
            }}
          >
            {loadingArchived ? (
              <Archive className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Archive className="w-4 h-4 mr-2" />
            )}
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </Button>
        )}
      </div>

      {/* Structure tree */}
      <div className="flex-1 overflow-y-auto p-3">
        {showArchived ? (
          // Show archived items
          archivedItems.length === 0 ? (
            <div className="text-center py-8">
              <Archive className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No archived items</p>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Archived Items</h3>
              {archivedItems.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center p-2 rounded-md bg-gray-100 opacity-60"
                >
                  <Archive className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="flex-1 text-sm text-gray-600 italic">{item.title}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (window.confirm('Restore this item?')) {
                        onRestoreStructure(item.id);
                        // Refresh archived items
                        onGetArchivedItems().then(setArchivedItems);
                      }
                    }}
                    className="p-1"
                  >
                    <ArchiveRestore className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )
        ) : (
          // Show normal items
          filteredStructure.length === 0 ? (
            <div className="text-center py-8">
              <Folder className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                {searchQuery ? 'No items found' : 'No sections yet'}
              </p>
              {!searchQuery && (
                <p className="text-gray-400 text-xs mt-1">
                  Click "Add Section" to get started
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-0.5">
              {filteredStructure.map((item) => renderStructureItem(item))}
            </div>
          )
        )}
      </div>

      {/* New item form modal */}
      {showNewItemForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">
              Add New {newItemParentId ? 'Sub-section' : 'Section'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={newItemType}
                  onChange={(e) => setNewItemType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="course">Course</option>
                  <option value="subject">Subject</option>
                  <option value="module">Module</option>
                  <option value="lesson">Lesson</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <Input
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  placeholder={`Enter ${newItemType} title...`}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateNew();
                    if (e.key === 'Escape') setShowNewItemForm(false);
                  }}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewItemForm(false);
                  setNewItemTitle('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateNew}
                disabled={!newItemTitle.trim()}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioSidebar;