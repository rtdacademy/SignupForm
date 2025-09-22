import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { ScrollArea } from '../../components/ui/scroll-area';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
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
  ExternalLink,
  GripVertical
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
  familyId,
  studentId,
  onNavigate,
  onCreateStructure,
  onUpdateStructure,
  onDeleteStructure,
  onAddContent,
  onReorderStructures,
  onReorderEntries,
  isEditMode = false,
  isMobile = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  // Load view mode from localStorage with fallback to 'grid'
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('portfolioViewMode') || 'grid';
  });
  const [showNewItemForm, setShowNewItemForm] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemType, setNewItemType] = useState('portfolio');
  const [editingItem, setEditingItem] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingColor, setEditingColor] = useState(null);
  const [collectionEntryCounts, setCollectionEntryCounts] = useState({});
  const [loadingEntries, setLoadingEntries] = useState(false);

  // Color palette options (solid colors for collections)
  const colorOptions = [
    '#8B5CF6', // Purple
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#6366F1', // Indigo
    '#F97316', // Orange
    '#84CC16', // Lime
  ];

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

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

  // Fetch entry counts for all child structures
  useEffect(() => {

    if (!familyId || !studentId || !childStructures || childStructures.length === 0) {
      return;
    }

    const fetchEntryCounts = async () => {
      setLoadingEntries(true);
      const db = getFirestore();
      const counts = {};

      try {
        // Firestore 'in' operator supports max 10 items, so we need to batch
        const structureIds = childStructures.map(s => s.id);

        const chunks = [];

        // Split into chunks of 10
        for (let i = 0; i < structureIds.length; i += 10) {
          chunks.push(structureIds.slice(i, i + 10));
        }


        // Query each chunk
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];

          const q = query(
            collection(db, 'portfolios', familyId, 'entries'),
            where('structureId', 'in', chunk),
            where('studentId', '==', studentId)
          );

          const snapshot = await getDocs(q);

          // Count entries per structure
          snapshot.forEach((doc) => {
            const data = doc.data();

            if (data.structureId) {
              counts[data.structureId] = (counts[data.structureId] || 0) + 1;
            }
          });
        }

        setCollectionEntryCounts(counts);
      } catch (error) {
        console.error('❌ Error fetching entry counts:', error);
      } finally {
        setLoadingEntries(false);
      }
    };

    fetchEntryCounts();
  }, [familyId, studentId, childStructures]);

  // Get icon for structure type
  const getIcon = (item) => {
    // For entries, use specific icons based on entry type
    if (item.itemType === 'entry') {
      const entryIcons = {
        text: FileText,
        document: FileText,
        image: ImageIcon,
        video: Video,
        link: Link2,
        assessment: Activity,
        default: FileText
      };
      return entryIcons[item.type] || entryIcons.default;
    }

    // For structures
    const icons = {
      portfolio: BookOpen,
      collection: FolderOpen,
      entry: FileText,
      // Legacy support
      course: BookOpen,
      default: FolderOpen
    };
    return icons[item.type] || icons.default;
  };

  // Get color styling based on item's color property
  const getColorStyling = (item) => {
    const color = item.color || '#8B5CF6'; // Default to purple if no color

    // Convert hex to RGB for transparency
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    const rgb = hexToRgb(color);

    return {
      backgroundColor: rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)` : `${color}20`,
      borderColor: rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` : `${color}50`,
      color: color,
      iconBg: rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)` : `${color}30`
    };
  };

  // Calculate statistics for a structure item
  const getItemStats = (item) => {
    // Use the fetched entry count if available, otherwise fall back to filtering
    const entryCount = collectionEntryCounts[item.id] || 0;
    const directEntries = entries.filter(e => e.structureId === item.id);
    const directChildren = allStructures.filter(s => s.parentId === item.id);
    const isItemDirectory = ['course', 'unit', 'section', 'portfolio', 'collection'].includes(item.type);

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

    // Use database counts when entries aren't loaded, otherwise use descendant counting
    const descendantInfo = entries.length > 0 ? getDescendantInfo(item.id) : { entries: [], children: [] };
    // If we have no entries loaded (homepage), use the fetched count from database
    // Otherwise use the filtered descendant count
    const totalEntries = entries.length === 0 ? entryCount : descendantInfo.entries.length;
    const hasContent = totalEntries > 0 || directChildren.length > 0;


    // Get up to 3 items total for preview (prioritize showing both types if available)
    let previewChildren = [];
    let previewEntries = [];

    // Only populate entry previews if we have the actual entries loaded
    if (entries.length > 0) {
      if (directChildren.length > 0 && descendantInfo.entries.length > 0) {
        // If we have both, show at least 1 of each, then fill to 3 total
        previewChildren = directChildren.slice(0, 2);
        previewEntries = descendantInfo.entries.slice(0, 3 - previewChildren.length);
      } else {
        // If we only have one type, show up to 3 of that type
        previewChildren = directChildren.slice(0, 3);
        previewEntries = descendantInfo.entries.slice(0, 3 - previewChildren.length);
      }
    } else {
      // When entries aren't loaded, we can still show child collections
      previewChildren = directChildren.slice(0, 3);
      // No entry previews when entries aren't loaded
      previewEntries = [];
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

  // Get entries for current structure
  const currentEntries = useMemo(() => {
    if (!currentStructure?.id) return [];
    return entries.filter(e => e.structureId === currentStructure.id);
  }, [entries, currentStructure]);

  // Combine child structures and entries for display
  const allItems = useMemo(() => {
    const items = [];

    // Add child structures
    childStructures.forEach(child => {
      items.push({
        ...child,
        itemType: 'structure'
      });
    });

    // Add entries as items
    currentEntries.forEach(entry => {
      items.push({
        ...entry,
        itemType: 'entry',
        type: 'entry'
      });
    });

    // Sort by order, then by creation date
    return items.sort((a, b) => {
      const orderA = a.order ?? 999;
      const orderB = b.order ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0);
    });
  }, [childStructures, currentEntries]);

  // Filter items based on search
  const filteredChildren = useMemo(() => {
    if (!searchQuery) return allItems;
    return allItems.filter(item =>
      (item.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allItems, searchQuery]);

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

  // Handle updating item color
  const handleUpdateColor = (item, newColor) => {
    onUpdateStructure(item.id, { color: newColor });
    setEditingColor(null);
  };

  // Drag and drop handlers
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
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
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

    // Get sorted items with same parent
    const sortedItems = [...filteredChildren];

    // Reorder the items
    const [draggedItem] = sortedItems.splice(draggedIndex, 1);
    sortedItems.splice(dropIndex, 0, draggedItem);

    // Update the order values for all items
    const itemsWithNewOrder = sortedItems.map((item, index) => ({
      ...item,
      order: index
    }));

    // Separate structures and entries
    const structuresToReorder = itemsWithNewOrder.filter(item => item.itemType === 'structure');
    const entriesToReorder = itemsWithNewOrder.filter(item => item.itemType === 'entry');

    // For now, only reorder structures since we don't have an entry reorder function
    if (structuresToReorder.length > 0 && onReorderStructures) {
      try {
        await onReorderStructures(structuresToReorder);
      } catch (error) {
        console.error('❌ Error reordering structures:', error);
      }
    }

    // Reorder entries if function is available
    if (entriesToReorder.length > 0 && onReorderEntries) {
      try {
        await onReorderEntries(entriesToReorder);
      } catch (error) {
        console.error('❌ Error reordering entries:', error);
      }
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Render directory card (for grid view)
  const renderDirectoryCard = (item, index) => {
    const isEntry = item.itemType === 'entry';
    const stats = isEntry ? {} : getItemStats(item);
    const Icon = getIcon(item);
    const colorStyle = getColorStyling(item);
    const isEditing = editingItem === item.id;
    const isEditingItemColor = editingColor === item.id;
    const isLeaf = isEntry || leafTypes.includes(item.type);


    // Handle click based on item type and edit mode
    const handleItemClick = (e) => {
      // Don't handle click if we're dragging
      if (draggedIndex !== null) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (isEditing) return;

      // For entries, navigate to view the entry
      if (isEntry) {
        onNavigate(item, true); // Pass flag indicating this is an entry to view
      } else if (isLeaf && isEditMode) {
        // For leaf types (lessons, assessments) in edit mode, open for editing
        onNavigate(item, true); // Pass flag indicating this is a document to edit
      } else {
        // For directories, navigate normally
        onNavigate(item);
      }
    };

    return (
      <div
        key={item.id}
        draggable={isEditMode && !isEditing}
        onDragStart={(e) => handleDragStart(e, index)}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragEnter={(e) => handleDragEnter(e, index)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, index)}
        className={`
          border-2 rounded-lg shadow-sm
          relative group cursor-pointer transition-all duration-200
          hover:shadow-lg hover:scale-[1.02]
          ${isMobile ? 'p-4' : 'p-6'}
          ${isLeaf ? 'ring-2 ring-transparent hover:ring-purple-300' : ''}
          ${isEditMode ? 'border-dashed' : ''}
          ${draggedIndex === index ? 'opacity-50' : ''}
          ${dragOverIndex === index && draggedIndex !== index ? 'ring-4 ring-purple-400 ring-opacity-50' : ''}
        `}
        style={{
          backgroundColor: colorStyle.backgroundColor,
          borderColor: colorStyle.borderColor
        }}
        onClick={handleItemClick}
      >
        {/* Drag Handle Indicator */}
        {isEditMode && !isEditing && (
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="p-1 bg-white/70 rounded-md cursor-move">
              <GripVertical className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        )}

        {/* Action Menu (shows on hover in edit mode) */}
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
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  setEditingColor(editingColor === item.id ? null : item.id);
                }}>
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded mr-2"
                      style={{ backgroundColor: item.color || '#8B5CF6' }}
                    />
                    Change Color
                  </div>
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

        {/* Color Palette Popup */}
        {isEditingItemColor && (
          <div className="absolute top-14 left-4 z-50 bg-white rounded-lg shadow-xl border p-3" onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-5 gap-2 mb-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-lg hover:scale-110 transition-transform ${
                    item.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateColor(item, color);
                  }}
                />
              ))}
            </div>
            <button
              className="w-full text-xs text-gray-500 hover:text-gray-700 mt-1"
              onClick={(e) => {
                e.stopPropagation();
                setEditingColor(null);
              }}
            >
              Cancel
            </button>
          </div>
        )}

        <div className="flex items-start space-x-4">
          {/* Icon */}
          <div
            className="p-3 rounded-lg"
            style={{
              backgroundColor: colorStyle.iconBg,
              color: colorStyle.color
            }}
          >
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
                  <h3 className="font-semibold text-lg text-gray-900 truncate">
                    {item.title || 'Untitled'}
                  </h3>
                  {isEntry && (
                    <Badge variant="outline" className="text-xs">
                      {item.type || 'Entry'}
                    </Badge>
                  )}
                  {isLeaf && !isEntry && (
                    <Badge variant="outline" className="text-xs">
                      Entry
                    </Badge>
                  )}
                </div>
                {(item.description || (isEntry && item.content)) && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {item.description || (isEntry ? item.content?.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '')}
                  </p>
                )}
              </>
            )}

            {/* Content Preview */}
            {stats.hasContent ? (
              <div className="mt-3">
                {/* Show preview if we have the actual items loaded */}
                {(stats.previewChildren.length > 0 || stats.previewEntries.length > 0) ? (
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
                ) : (
                  /* Show count-based summary when items aren't loaded yet */
                  <div className="space-y-1.5 text-sm text-gray-600">
                    {stats.childCount > 0 && (
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-3.5 h-3.5 text-gray-400" />
                        <span>{stats.childCount} collection{stats.childCount !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {stats.totalEntries > 0 && (
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-gray-400" />
                        <span>{stats.totalEntries} {stats.totalEntries !== 1 ? 'entries' : 'entry'}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // Only show "Empty" for directories, not for document types
              !isLeaf && <div className="mt-3 text-sm text-gray-400 italic">Empty</div>
            )}
          </div>

          {/* Navigation Arrow or Document Icon */}
          {isEntry ? (
            <div className="flex items-center justify-center text-gray-600 opacity-50 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="w-5 h-5" />
            </div>
          ) : stats.isDirectory ? (
            <div className="flex items-center justify-center text-gray-600 opacity-50 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-5 h-5" />
            </div>
          ) : isLeaf && (
            <div className="flex items-center justify-center text-gray-600 opacity-50 group-hover:opacity-100 transition-opacity">
              {isEditMode ? <Edit3 className="w-5 h-5" /> : <ExternalLink className="w-5 h-5" />}
            </div>
          )}
        </div>

      </div>
    );
  };

  // Render list item (for list view)
  const renderListItem = (item, index) => {
    const isEntry = item.itemType === 'entry';
    const stats = isEntry ? {} : getItemStats(item);
    const Icon = getIcon(item);
    const colorStyle = getColorStyling(item);
    const isEditing = editingItem === item.id;
    const isEditingItemColor = editingColor === item.id;
    const isLeaf = isEntry || leafTypes.includes(item.type);

    // Handle click based on item type and edit mode
    const handleItemClick = (e) => {
      // Don't handle click if we're dragging
      if (draggedIndex !== null) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (isEditing) return;

      // For entries, navigate to view the entry
      if (isEntry) {
        onNavigate(item, true); // Pass flag indicating this is an entry to view
      } else if (isLeaf && isEditMode) {
        // For leaf types (lessons, assessments) in edit mode, open for editing
        onNavigate(item, true); // Pass flag indicating this is a document to edit
      } else {
        // For directories, navigate normally
        onNavigate(item);
      }
    };

    return (
      <div
        key={item.id}
        draggable={isEditMode && !isEditing}
        onDragStart={(e) => handleDragStart(e, index)}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragEnter={(e) => handleDragEnter(e, index)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, index)}
        className={`
          group flex items-center justify-between p-4 rounded-lg cursor-pointer
          transition-all duration-200 hover:shadow-md
          border-2 mb-2 relative
          ${isLeaf ? 'ring-2 ring-transparent hover:ring-purple-300' : ''}
          ${isEditMode ? 'border-dashed' : ''}
          ${draggedIndex === index ? 'opacity-50' : ''}
          ${dragOverIndex === index && draggedIndex !== index ? 'ring-4 ring-purple-400 ring-opacity-50' : ''}
        `}
        style={{
          backgroundColor: colorStyle.backgroundColor,
          borderColor: colorStyle.borderColor
        }}
        onClick={handleItemClick}
      >
        {/* Color Palette Popup for List View */}
        {isEditingItemColor && (
          <div className="absolute top-14 left-4 z-50 bg-white rounded-lg shadow-xl border p-3" onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-5 gap-2 mb-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-lg hover:scale-110 transition-transform ${
                    item.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateColor(item, color);
                  }}
                />
              ))}
            </div>
            <button
              className="w-full text-xs text-gray-500 hover:text-gray-700 mt-1"
              onClick={(e) => {
                e.stopPropagation();
                setEditingColor(null);
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Drag Handle for List View */}
        {isEditMode && !isEditing && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="p-1 bg-white/70 rounded-md cursor-move">
              <GripVertical className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        )}

        <div className="flex items-center space-x-4 flex-1 min-w-0 ml-8">
          {/* Icon */}
          <div
            className="p-2 rounded-lg"
            style={{
              backgroundColor: colorStyle.iconBg,
              color: colorStyle.color
            }}
          >
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
                <h3 className="font-medium text-gray-900 truncate">
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
            {/* Show preview if we have the actual items loaded */}
            {!isEntry && (stats.previewChildren?.length > 0 || stats.previewEntries?.length > 0) ? (
              <>
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
              </>
            ) : !isEntry && stats.hasContent ? (
              /* Show count-based summary when items aren't loaded yet */
              <>
                {stats.childCount > 0 && (
                  <span className="flex items-center gap-1">
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>{stats.childCount} collection{stats.childCount !== 1 ? 's' : ''}</span>
                  </span>
                )}
                {stats.totalEntries > 0 && (
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{stats.totalEntries} {stats.totalEntries !== 1 ? 'entries' : 'entry'}</span>
                  </span>
                )}
              </>
            ) : isEntry ? (
              /* Show entry type and date for entries */
              <span className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {item.type || 'entry'}
                </Badge>
                {item.createdAt && (
                  <span className="text-xs text-gray-400">
                    {new Date(item.createdAt.toDate ? item.createdAt.toDate() : item.createdAt).toLocaleDateString()}
                  </span>
                )}
              </span>
            ) : (
              !isLeaf && <span className="text-gray-400 italic">Empty</span>
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
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  setEditingColor(editingColor === item.id ? null : item.id);
                }}>
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded mr-2"
                      style={{ backgroundColor: item.color || '#8B5CF6' }}
                    />
                    Change Color
                  </div>
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
          {(isEntry || stats.isDirectory) && (
            <ChevronRight className="w-5 h-5 text-gray-600 opacity-50 group-hover:opacity-100" />
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
      
        {(isCollection || (isEditMode && isPortfolio)) && (
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
                onClick={() => {
                  setViewMode('grid');
                  localStorage.setItem('portfolioViewMode', 'grid');
                }}
                className="h-8 px-3"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                onClick={() => {
                  setViewMode('list');
                  localStorage.setItem('portfolioViewMode', 'list');
                }}
                className="h-8 px-3"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Add Button - show for collections (to add entries) and portfolios (to add collections) */}
          {currentStructure?.type !== 'entry' && (currentStructure?.type === 'collection' || isEditMode) && (
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
        <div className="p-4">
          {filteredChildren.length === 0 ? (
            renderEmptyState()
          ) : viewMode === 'grid' ? (
            <div className={`grid gap-6 ${
              isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {filteredChildren.map((item, index) => renderDirectoryCard(item, index))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredChildren.map((item, index) => renderListItem(item, index))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default DirectoryView;