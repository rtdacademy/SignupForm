import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import DevFileIndicator from './DevFileIndicator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '../../components/ui/dropdown-menu';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import {
  ChevronDown,
  Check,
  BookOpen,
  Calculator,
  Beaker,
  Globe,
  Activity,
  Briefcase,
  Wrench,
  GraduationCap,
  Folder,
  FolderOpen,
  FileText,
  Hash,
  Layers,
  ArrowRight
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

const PortfolioCourseSelector = ({
  structures = [],
  selectedId,
  onSelect,
  className,
  disabled = false,
  mobileFullWidth = true
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const [sectionDropdownOpen, setSectionDropdownOpen] = useState(false);

  // Get top-level courses only
  const courses = structures.filter(s => !s.parentId || s.parentId === null);
  
  // Get selected course object
  const selectedCourse = courses.find(c => c.id === selectedCourseId);
  
  // Get sections for selected course
  const sections = selectedCourse?.children || [];
  
  // Get selected section object
  const selectedSection = sections.find(s => s.id === selectedSectionId);

  // Initialize from selectedId prop
  useEffect(() => {
    if (selectedId && structures.length > 0) {
      // Find the item and its parent
      const findItemAndParent = (items, id, parentId = null) => {
        for (const item of items) {
          if (item.id === id) {
            return { item, parentId };
          }
          if (item.children?.length > 0) {
            const result = findItemAndParent(item.children, id, item.id);
            if (result) return result;
          }
        }
        return null;
      };

      const result = findItemAndParent(structures, selectedId);
      if (result) {
        if (result.parentId) {
          // It's a section
          setSelectedCourseId(result.parentId);
          setSelectedSectionId(selectedId);
        } else {
          // It's a course
          setSelectedCourseId(selectedId);
          setSelectedSectionId(null);
        }
      }
    }
  }, [selectedId, structures]);

  // Handle course selection
  const handleCourseSelect = (courseId) => {
    setSelectedCourseId(courseId);
    setSelectedSectionId(null); // Reset section when course changes
    setCourseDropdownOpen(false);
    
    const course = courses.find(c => c.id === courseId);
    
    // If course has no children, it's the final selection
    if (!course?.children || course.children.length === 0) {
      onSelect(courseId);
    }
  };

  // Handle section selection
  const handleSectionSelect = (sectionId) => {
    setSelectedSectionId(sectionId);
    setSectionDropdownOpen(false);
    onSelect(sectionId);
  };

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

  // Check if we only have one course with no children
  const singleSimpleCourse = courses.length === 1 && (!courses[0].children || courses[0].children.length === 0);

  if (singleSimpleCourse) {
    // Just show the single course as a static display
    return (
      <div className={className}>
        <Label className="text-xs text-gray-600 mb-2 block">Course</Label>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            {renderIcon(courses[0])}
            <span className="font-medium">{courses[0].title}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Course Dropdown */}
      <div>
        <Label className="text-sm mb-1 block">
          Select Course
          <span className="text-red-500 ml-1">*</span>
        </Label>
        <DropdownMenu open={courseDropdownOpen} onOpenChange={setCourseDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-between",
                mobileFullWidth && "w-full",
                selectedCourse && "border-purple-300"
              )}
              disabled={disabled || courses.length === 0}
            >
              {selectedCourse ? (
                <div className="flex items-center gap-2">
                  {renderIcon(selectedCourse)}
                  <span>{selectedCourse.title}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">Choose a course...</span>
              )}
              <ChevronDown className="h-4 w-4 opacity-50 ml-2 flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className={cn(
              "min-w-[250px]",
              mobileFullWidth && "w-[calc(100vw-2rem)] sm:w-[250px]"
            )}
          >
            {courses.length === 0 ? (
              <DropdownMenuItem disabled className="text-center py-4">
                <span className="text-muted-foreground">No courses available</span>
              </DropdownMenuItem>
            ) : (
              courses.map(course => (
                <DropdownMenuItem
                  key={course.id}
                  onClick={() => handleCourseSelect(course.id)}
                  className={cn(
                    "flex items-center gap-2 min-h-[44px] cursor-pointer",
                    selectedCourseId === course.id && "bg-accent"
                  )}
                >
                  {renderIcon(course)}
                  <span className="flex-1">{course.title}</span>
                  {course.children?.length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {course.children.length}
                    </Badge>
                  )}
                  {selectedCourseId === course.id && <Check className="w-4 h-4 ml-auto" />}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Section Dropdown - Only show if selected course has children */}
      {selectedCourse && sections.length > 0 && (
        <div className="pl-4 border-l-2 border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <Label className="text-sm">
              Select Section
              <span className="text-gray-500 ml-1">(Optional)</span>
            </Label>
          </div>
          <DropdownMenu open={sectionDropdownOpen} onOpenChange={setSectionDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-between",
                  mobileFullWidth && "w-full",
                  selectedSection && "border-blue-300"
                )}
              >
                {selectedSection ? (
                  <div className="flex items-center gap-2">
                    {renderIcon(selectedSection)}
                    <span>{selectedSection.title}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">
                    Add to entire course or select section...
                  </span>
                )}
                <ChevronDown className="h-4 w-4 opacity-50 ml-2 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className={cn(
                "min-w-[250px]",
                mobileFullWidth && "w-[calc(100vw-2rem)] sm:w-[250px]"
              )}
            >
              {/* Option to add to course level */}
              <DropdownMenuItem
                onClick={() => {
                  setSelectedSectionId(null);
                  setSectionDropdownOpen(false);
                  onSelect(selectedCourseId);
                }}
                className={cn(
                  "flex items-center gap-2 min-h-[44px] cursor-pointer",
                  !selectedSectionId && "bg-accent"
                )}
              >
                {renderIcon(selectedCourse)}
                <span className="flex-1 font-medium">Entire Course</span>
                {!selectedSectionId && <Check className="w-4 h-4 ml-auto" />}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Or choose a specific section:
              </DropdownMenuLabel>
              
              {/* Sections */}
              {sections.map(section => (
                <DropdownMenuItem
                  key={section.id}
                  onClick={() => handleSectionSelect(section.id)}
                  className={cn(
                    "flex items-center gap-2 min-h-[44px] cursor-pointer",
                    selectedSectionId === section.id && "bg-accent"
                  )}
                >
                  {renderIcon(section)}
                  <span className="flex-1">{section.title}</span>
                  {section.children?.length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {section.children.length}
                    </Badge>
                  )}
                  {selectedSectionId === section.id && <Check className="w-4 h-4 ml-auto" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Visual feedback of current selection */}
      {selectedCourse && (
        <div className="text-xs text-muted-foreground bg-gray-50 rounded p-2">
          <span className="font-medium">Selected: </span>
          {selectedCourse.title}
          {selectedSection && (
            <>
              <span className="mx-1">›</span>
              {selectedSection.title}
            </>
          )}
        </div>
      )}
      <DevFileIndicator fileName="PortfolioCourseSelector.js" />
    </div>
  );
};

export default PortfolioCourseSelector;