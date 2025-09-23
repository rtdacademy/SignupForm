import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import DevFileIndicator from './DevFileIndicator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuGroup
} from '../../components/ui/dropdown-menu';
import { Badge } from '../../components/ui/badge';
import {
  ChevronDown,
  ChevronRight,
  Check,
  FolderOpen,
  Folder,
  BookOpen,
  Calculator,
  Beaker,
  Globe,
  Activity,
  Briefcase,
  Wrench,
  GraduationCap,
  FileText,
  Hash,
  Layers
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Icon mapping for portfolio structure icons
const iconMap = {
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
  Layers: Layers
};

const getIconComponent = (iconName) => {
  if (!iconName || typeof iconName !== 'string' || !iconMap[iconName]) {
    return null;
  }
  return iconMap[iconName];
};

const PortfolioStructureDropdown = ({
  structures = [],
  selectedId,
  onSelect,
  placeholder = "Select a section",
  className,
  disabled = false,
  allowRootSelection = true,
  mobileFullWidth = true
}) => {
  const [open, setOpen] = useState(false);

  // Find the selected item recursively
  const findSelectedItem = (items, id) => {
    for (const item of items) {
      if (item.id === id) {
        return item;
      }
      if (item.children?.length > 0) {
        const found = findSelectedItem(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedItem = selectedId ? findSelectedItem(structures, selectedId) : null;

  // Render icon for an item
  const renderIcon = (item) => {
    const IconComponent = getIconComponent(item.icon);
    if (IconComponent) {
      return <IconComponent className="w-4 h-4" style={{ color: item.color }} />;
    }
    // Check if it's an emoji
    if (item.icon && item.icon.length <= 2) {
      return <span className="text-base">{item.icon}</span>;
    }
    // Default folder icon
    return <Folder className="w-4 h-4" style={{ color: item.color || '#6B7280' }} />;
  };

  // Build breadcrumb path for selected item
  const buildPath = (items, targetId, path = []) => {
    for (const item of items) {
      if (item.id === targetId) {
        return [...path, item];
      }
      if (item.children?.length > 0) {
        const result = buildPath(item.children, targetId, [...path, item]);
        if (result) return result;
      }
    }
    return null;
  };

  const selectedPath = selectedId ? buildPath(structures, selectedId) : [];

  // Recursive component for rendering menu items
  const renderMenuItem = (item, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isSelected = selectedId === item.id;
    const isSelectable = allowRootSelection || !hasChildren || depth > 0;

    if (hasChildren) {
      return (
        <DropdownMenuSub key={item.id}>
          <DropdownMenuSubTrigger 
            className={cn(
              "flex items-center gap-2 px-3 py-2 min-h-[44px]",
              isSelected && "bg-accent",
              !isSelectable && "opacity-60"
            )}
          >
            <div className="flex items-center gap-2 flex-1">
              {renderIcon(item)}
              <span className="flex-1">{item.title}</span>
              {isSelected && <Check className="w-4 h-4 ml-auto" />}
            </div>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent 
            className={cn(
              "min-w-[200px]",
              mobileFullWidth && "sm:w-[calc(100vw-2rem)] md:w-auto"
            )}
          >
            {/* Option to select this level if it has children */}
            {isSelectable && (
              <>
                <DropdownMenuItem
                  onClick={() => {
                    onSelect(item.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 min-h-[44px]",
                    isSelected && "bg-accent"
                  )}
                >
                  {renderIcon(item)}
                  <span className="flex-1 font-medium">Select "{item.title}"</span>
                  {isSelected && <Check className="w-4 h-4 ml-auto" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Or choose a subsection:
                </DropdownMenuLabel>
              </>
            )}
            {item.children.map(child => renderMenuItem(child, depth + 1))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      );
    }

    return (
      <DropdownMenuItem
        key={item.id}
        onClick={() => {
          onSelect(item.id);
          setOpen(false);
        }}
        className={cn(
          "flex items-center gap-2 px-3 py-2 min-h-[44px]",
          isSelected && "bg-accent"
        )}
      >
        {renderIcon(item)}
        <span className="flex-1">{item.title}</span>
        {item.description && (
          <span className="text-xs text-muted-foreground ml-2">
            {item.description}
          </span>
        )}
        {isSelected && <Check className="w-4 h-4 ml-auto" />}
      </DropdownMenuItem>
    );
  };

  // Flatten structure for simple mobile view if needed
  const flattenStructure = (items, parentTitle = '', depth = 0) => {
    const flattened = [];
    for (const item of items) {
      const prefix = depth > 0 ? `${parentTitle} › ` : '';
      flattened.push({
        ...item,
        displayTitle: `${prefix}${item.title}`,
        depth
      });
      if (item.children?.length > 0) {
        flattened.push(...flattenStructure(item.children, item.title, depth + 1));
      }
    }
    return flattened;
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const flatStructures = isMobile ? flattenStructure(structures) : [];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-between",
            mobileFullWidth && "w-full",
            className
          )}
          disabled={disabled}
        >
          {selectedItem ? (
            <div className="flex items-center gap-2">
              {renderIcon(selectedItem)}
              <span className="truncate">
                {selectedPath.length > 1 && (
                  <span className="text-muted-foreground text-xs mr-1">
                    {selectedPath.slice(0, -1).map(p => p.title).join(' › ')} ›
                  </span>
                )}
                {selectedItem.title}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronDown className="h-4 w-4 opacity-50 ml-2 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className={cn(
          "min-w-[250px] max-h-[400px] overflow-y-auto",
          mobileFullWidth && "sm:w-[calc(100vw-2rem)] md:w-auto"
        )}
      >
        {structures.length === 0 ? (
          <DropdownMenuItem disabled className="text-center py-4">
            <span className="text-muted-foreground">No sections available</span>
          </DropdownMenuItem>
        ) : isMobile && flatStructures.length > 0 ? (
          // Simple flat list for mobile
          flatStructures.map(item => (
            <DropdownMenuItem
              key={item.id}
              onClick={() => {
                onSelect(item.id);
                setOpen(false);
              }}
              className={cn(
                "flex items-center gap-2 min-h-[48px]",
                selectedId === item.id && "bg-accent",
                item.depth > 0 && `pl-${3 + item.depth * 4}`
              )}
              style={{ paddingLeft: item.depth > 0 ? `${12 + item.depth * 16}px` : undefined }}
            >
              {renderIcon(item)}
              <span className="flex-1">{item.title}</span>
              {selectedId === item.id && <Check className="w-4 h-4 ml-auto" />}
            </DropdownMenuItem>
          ))
        ) : (
          // Hierarchical menu for desktop
          <>
            {structures.map(item => renderMenuItem(item))}
          </>
        )}
      </DropdownMenuContent>
      <DevFileIndicator fileName="PortfolioStructureDropdown.js" />
    </DropdownMenu>
  );
};

export default PortfolioStructureDropdown;