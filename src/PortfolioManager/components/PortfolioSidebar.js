import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';
import {
  ChevronRight,
  ChevronDown,
  ChevronLeft,
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
  ArchiveRestore,
  EyeOff,
  PanelLeftClose,
  PanelLeft,
  BarChart,
  Layers
} from 'lucide-react';
import { getIconForSubject } from '../hooks/usePortfolio';
import Toast from '../../components/Toast';

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
  onOpenSOLOPlan,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [archivedItems, setArchivedItems] = useState([]);
  const [loadingArchived, setLoadingArchived] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [undoItem, setUndoItem] = useState(null);
  const undoTimeoutRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [showNewItemForm, setShowNewItemForm] = useState(false);
  const [newItemParentId, setNewItemParentId] = useState(null);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemType, setNewItemType] = useState('portfolio');
  
  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);

  // Helper function to get valid child types for a parent
  const getValidChildTypes = (parentType) => {
    switch (parentType) {
      case 'portfolio':
      case 'course':  // Legacy support
        return ['collection'];
      case 'collection':
        return ['entry'];
      case null:
      case undefined:
        return ['portfolio'];
      default:
        return [];
    }
  };

  // Get the default child type for a parent
  const getDefaultChildType = (parentType) => {
    const validTypes = getValidChildTypes(parentType);
    return validTypes[0] || 'portfolio';
  };
  
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
    FolderOpen: FolderOpen,
    FileText: FileText,
    Hash: Hash,
    Layers: Layers,
    BarChart: BarChart
  };
  
  // Get icon component
  const getIconComponent = (iconName) => {
    return iconComponents[iconName] || Folder;
  };

  // Get icon for a given type
  const getIconForType = (type) => {
    const iconMap = {
      course: 'BookOpen',
      unit: 'Layers',
      section: 'FolderOpen',
      topic: 'Hash',
      lesson: 'FileText',
      assessment: 'BarChart'
    };
    return iconMap[type] || 'Folder';
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
      // Validate parent-child relationship
      if (newItemParentId) {
        const parentItem = structure.find(s => s.id === newItemParentId);
        const validTypes = getValidChildTypes(parentItem?.type);

        if (!validTypes.includes(newItemType)) {
          alert(`Cannot add ${newItemType} to ${parentItem?.type}. Valid child types are: ${validTypes.join(', ')}`);
          return;
        }
      } else {
        // Root level - only portfolios allowed
        if (newItemType !== 'portfolio' && newItemType !== 'course') {
          alert('Only portfolios can be created at the root level');
          return;
        }
      }

      onCreateStructure({
        type: newItemType,
        title: newItemTitle.trim(),
        description: '',
        parentId: newItemParentId,
        icon: getIconForType(newItemType),
        color: colorPalette[Math.floor(Math.random() * colorPalette.length)]
      });

      setShowNewItemForm(false);
      setNewItemTitle('');
      setNewItemType('portfolio'); // Reset to portfolio as default
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

  // Render collapsed structure item
  const renderCollapsedItem = (item, level = 0) => {
    const isSelected = selectedId === item.id;
    const IconComponent = getIconComponent(item.icon || 'Folder');
    
    return (
      <Tooltip key={item.id}>
        <TooltipTrigger asChild>
          <div
            className={`
              flex items-center justify-center p-2 rounded-md cursor-pointer
              transition-all duration-200 mb-1
              ${isSelected ? 'bg-purple-100' : 'hover:bg-gray-100'}
            `}
            onClick={() => {
              console.log('Sidebar: Selecting structure:', { id: item.id, title: item.title });
              onSelectStructure(item.id);
            }}
          >
            <div 
              className="w-8 h-8 rounded flex items-center justify-center"
              style={{ backgroundColor: `${item.color}20`, color: item.color }}
            >
              {IconComponent ? (
                <IconComponent className="w-5 h-5" />
              ) : (
                <span className="text-lg">{item.icon || '📁'}</span>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          <div>
            <div className="font-medium">{item.title}</div>
            {item.entryCount > 0 && (
              <div className="text-xs text-gray-500">{item.entryCount} entries</div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  };

  // Render structure item
  const renderStructureItem = (item, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isSelected = selectedId === item.id;
    const isEditing = editingId === item.id;
    const isDraggedOver = dragOverItem?.id === item.id;

    // Use collapsed rendering when sidebar is collapsed
    if (isCollapsed && level === 0) {
      return renderCollapsedItem(item);
    }

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
          onClick={() => {
            if (!isEditing) {
              console.log('Sidebar: Selecting structure:', { id: item.id, title: item.title });
              onSelectStructure(item.id);
            }
          }}
          draggable={!isEditing}
          onDragStart={(e) => handleDragStart(e, item)}
          onDragOver={(e) => handleDragOver(e, item)}
          onDrop={(e) => handleDrop(e, item)}
        >
          {/* Drag handle */}
          <GripVertical className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity mr-1" />
          
          {/* Expand/Collapse chevron - always show for courses */}
          {(hasChildren || item.type === 'course') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(item.id);
              }}
              className="p-0.5 hover:bg-gray-200 rounded transition-transform"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          {!hasChildren && item.type !== 'course' && (
            <div className="w-5" /> 
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
          
          {/* Inline action buttons */}
          {!isEditing && (
            <div className="flex items-center space-x-1 opacity-40 group-hover:opacity-100 transition-opacity">
              {/* Add sub-item button - only for portfolios (to add collections) */}
              {(item.type === 'portfolio' || item.type === 'course') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 hover:bg-gray-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setNewItemParentId(item.id);
                    setNewItemType(getDefaultChildType(item.type));
                    setShowNewItemForm(true);
                  }}
                  title="Add collection"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              )}
              
              {/* More actions menu */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 hover:bg-gray-200"
                    onClick={(e) => e.stopPropagation()}
                    title="More actions"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-1">
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
                
                <div className="border-t my-1"></div>
                
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
                        // Store item for potential undo
                        setUndoItem(item);
                        onDeleteStructure(item.id);
                        
                        // Show toast with undo
                        setToastMessage({
                          text: `"${item.title}" hidden from view`,
                          action: 'Undo',
                          onAction: () => {
                            if (undoItem) {
                              onRestoreStructure(undoItem.id);
                              setUndoItem(null);
                              setToastMessage(null);
                            }
                          }
                        });
                        
                        // Clear undo after 5 seconds
                        if (undoTimeoutRef.current) {
                          clearTimeout(undoTimeoutRef.current);
                        }
                        undoTimeoutRef.current = setTimeout(() => {
                          setUndoItem(null);
                          setToastMessage(null);
                        }, 5000);
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded"
                    >
                      <EyeOff className="w-4 h-4 mr-2" />
                      Hide from view
                    </button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
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
        
        {/* Render children or empty state */}
        {isExpanded && (
          <div className="relative">
            {/* Indentation guide line */}
            {level < 3 && hasChildren && (
              <div 
                className="absolute w-0.5 bg-gray-200" 
                style={{ 
                  left: `${(level + 1) * 16 + 20}px`,
                  top: '0',
                  bottom: '0'
                }}
              />
            )}
            
            {hasChildren ? (
              filterStructure(item.children).map((child) => 
                renderStructureItem(child, level + 1)
              )
            ) : (
              // Only show add hint for portfolios (not collections)
              (item.type === 'portfolio' || item.type === 'course') && (
                <div
                  className="text-xs text-gray-400 italic py-2 hover:text-gray-600 cursor-pointer"
                  style={{ paddingLeft: `${(level + 1) * 16 + 32}px` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setNewItemParentId(item.id);
                    setNewItemType(getDefaultChildType(item.type));
                    setShowNewItemForm(true);
                  }}
                >
                  Click + to add collections...
                </div>
              )
            )}
          </div>
        )}
      </div>
    );
  };

  const filteredStructure = filterStructure(structure);

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col bg-gray-50 relative">
        {/* Collapse Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3 top-4 z-50 bg-white border border-gray-200 rounded-full p-1.5 hover:bg-gray-100 transition-all duration-200 shadow-sm hover:shadow-md"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <PanelLeft className="w-4 h-4 text-gray-600" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {/* Search bar */}
        {!isCollapsed && (
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
        )}


      {/* Add new button and archive toggle */}
      {!isCollapsed ? (
        <div className="p-3 bg-white border-b space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              setNewItemParentId(null);
              setNewItemType('portfolio'); // Force portfolio type for top-level
              setShowNewItemForm(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Portfolio
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
      ) : (
        // When collapsed, just add spacing to push content down below the toggle button
        <div className="h-12 bg-white border-b" />
      )}

      {/* Structure tree */}
      <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'p-2 pt-1' : 'p-3'}`}>
        {showArchived ? (
          // Show archived items
          archivedItems.length === 0 ? (
            <div className="text-center py-8">
              <Archive className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No archived items</p>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Hidden Items</h3>
              <p className="text-xs text-gray-400">Click restore to bring items back</p>
              {archivedItems.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors group"
                >
                  <EyeOff className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="flex-1 text-sm text-gray-600">{item.title}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onRestoreStructure(item.id);
                      // Refresh archived items
                      onGetArchivedItems().then(setArchivedItems);
                    }}
                    className="p-1 opacity-70 group-hover:opacity-100"
                    title="Restore this item"
                  >
                    <ArchiveRestore className="w-4 h-4 text-green-600" />
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
              Add New {newItemParentId ? 'Sub-item' : 'Course'}
            </h3>
            
            <div className="space-y-4">
              {/* Only show type selector for sub-items */}
              {newItemParentId && (() => {
                // Find the parent item to determine its type
                const parentItem = structure.find(s => s.id === newItemParentId);
                const validTypes = getValidChildTypes(parentItem?.type);

                // Only show dropdown if there are multiple valid types (which shouldn't happen in new hierarchy)
                if (validTypes.length > 1) {
                  return (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        value={newItemType}
                        onChange={(e) => setNewItemType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      >
                        {validTypes.map(type => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                } else if (validTypes.length === 1) {
                  // Single type - just show what will be created
                  return (
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">
                        Creating new <span className="font-semibold">{validTypes[0]}</span>
                      </p>
                    </div>
                  );
                }
                return null;
              })()}
              
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

      {/* Toast notification with undo */}
      {toastMessage && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-3">
            <span className="text-sm">{toastMessage.text}</span>
            {toastMessage.action && (
              <button
                onClick={toastMessage.onAction}
                className="text-sm font-medium text-blue-300 hover:text-blue-200 underline"
              >
                {toastMessage.action}
              </button>
            )}
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
    </TooltipProvider>
  );
};

export default PortfolioSidebar;