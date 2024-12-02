import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { useMode, MODES } from '../context/ModeContext';
import {
  ChevronDown, X, Maximize, Minimize, Search,
  Star, Flag, Bookmark, Circle, Square, Triangle, BookOpen as BookOpenIcon, 
  GraduationCap, Trophy, Target, ClipboardCheck, Brain, Lightbulb, Clock, 
  Calendar as CalendarIcon, BarChart, TrendingUp, AlertCircle, HelpCircle, 
  MessageCircle, Users, Presentation, FileText, Filter,
} from "lucide-react";
import CategoryManager from './CategoryManager';
import AdvancedFilters from './AdvancedFilters';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "../components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { UserSquare2, ClipboardList } from "lucide-react";

const iconMap = {
  'circle': Circle,
  'square': Square,
  'triangle': Triangle,
  'book-open': BookOpenIcon,
  'graduation-cap': GraduationCap,
  'trophy': Trophy,
  'target': Target,
  'clipboard-check': ClipboardCheck,
  'brain': Brain,
  'lightbulb': Lightbulb,
  'clock': Clock,
  'calendar': CalendarIcon,
  'bar-chart': BarChart,
  'trending-up': TrendingUp,
  'alert-circle': AlertCircle,
  'help-circle': HelpCircle,
  'message-circle': MessageCircle,
  'users': Users,
  'presentation': Presentation,
  'file-text': FileText,
  'bookmark': Bookmark,
  'star': Star,
  'flag': Flag,
};

const MODE_CONFIG = {
  [MODES.TEACHER]: {
    icon: <UserSquare2 className="h-4 w-4" />,
    tooltip: "Teacher Mode"
  },
  [MODES.REGISTRATION]: {
    icon: <ClipboardList className="h-4 w-4" />,
    tooltip: "Registration Mode"
  }
};

const ModeSelector = ({ currentMode, setCurrentMode }) => (
  <TooltipProvider>
    <div className="flex items-center space-x-1">
      {Object.entries(MODE_CONFIG).map(([mode, config]) => (
        <Tooltip key={mode}>
          <TooltipTrigger asChild>
            <Button
              variant={currentMode === mode ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setCurrentMode(mode)}
              className="p-1.5"
            >
              {config.icon}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{config.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  </TooltipProvider>
);

const FilterPanel = memo(function FilterPanel({
  filters: propFilters,
  onFilterChange,
  studentSummaries,
  availableFilters,
  isFullScreen,
  onFullScreenToggle,
  searchTerm,
  onSearchChange,
  teacherCategories,
  teacherNames,
  user_email_key,
}) {
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [localFilters, setLocalFilters] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { currentMode, setCurrentMode } = useMode();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setLocalFilters((prevFilters) => {
      if (JSON.stringify(prevFilters) !== JSON.stringify(propFilters)) {
        return propFilters;
      }
      return prevFilters;
    });
  }, [propFilters]);

  useEffect(() => {
    const count = (localFilters.categories || []).reduce((sum, teacherCat) => {
      const categories = Object.values(teacherCat)[0];
      return sum + (categories ? categories.length : 0);
    }, 0) + 
    (searchTerm ? 1 : 0) +
    (localFilters.dateFilters ? Object.keys(localFilters.dateFilters).length : 0);
    setActiveFilterCount(count);
  }, [localFilters, searchTerm]);

  const filterOptions = useMemo(() => {
    const options = {};
    availableFilters.forEach(({ key }) => {
      if (key !== 'categories') {
        const uniqueOptions = [
          ...new Set(
            studentSummaries
              .map((s) => s[key])
              .filter((v) => v !== undefined)
              .map(v => v === null || v === '' ? '(Empty)' : v)
          ),
        ].sort();
        
        options[key] = uniqueOptions.map((option) => ({
          value: option === '(Empty)' ? '' : option,
          label: option === '(Empty)' ? '(Empty)' : String(option)
        }));
      }
    });
    return options;
  }, [availableFilters, studentSummaries]);

  const groupedCategories = useMemo(() => {
    const grouped = {};
    Object.entries(teacherCategories).forEach(([teacherEmailKey, categories]) => {
      grouped[teacherEmailKey] = categories
        .filter(category => !category.archived)
        .map(category => ({
          value: category.id,
          label: category.name,
          color: category.color,
          icon: category.icon,
        }));
    });
    return grouped;
  }, [teacherCategories]);

  const handleCategoryChange = useCallback(
    (categoryId, teacherEmailKey) => {
      setLocalFilters((prevFilters) => {
        const prevCategories = prevFilters.categories || [];
        let updatedCategories;

        const existingTeacherIndex = prevCategories.findIndex(
          (cat) => Object.keys(cat)[0] === teacherEmailKey
        );

        if (existingTeacherIndex > -1) {
          const existingTeacherCategories = prevCategories[existingTeacherIndex][teacherEmailKey];
          if (existingTeacherCategories.includes(categoryId)) {
            updatedCategories = [...prevCategories];
            updatedCategories[existingTeacherIndex] = {
              [teacherEmailKey]: existingTeacherCategories.filter((id) => id !== categoryId)
            };
            if (updatedCategories[existingTeacherIndex][teacherEmailKey].length === 0) {
              updatedCategories.splice(existingTeacherIndex, 1);
            }
          } else {
            updatedCategories = [...prevCategories];
            updatedCategories[existingTeacherIndex] = {
              [teacherEmailKey]: [...existingTeacherCategories, categoryId]
            };
          }
        } else {
          updatedCategories = [...prevCategories, { [teacherEmailKey]: [categoryId] }];
        }

        const updatedFilters = {
          ...prevFilters,
          categories: updatedCategories,
        };

        onFilterChange(updatedFilters);
        return updatedFilters;
      });
    },
    [onFilterChange]
  );

  const handleClearAllCategories = useCallback(() => {
    setLocalFilters((prevFilters) => {
      const updatedFilters = {
        ...prevFilters,
        categories: [],
      };
      onFilterChange(updatedFilters);
      return updatedFilters;
    });
  }, [onFilterChange]);

  const clearFilters = useCallback(() => {
    const clearedFilters = Object.keys(localFilters).reduce(
      (acc, key) => ({
        ...acc,
        [key]: key === 'dateFilters' ? {} : [],
      }),
      {}
    );
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
    onSearchChange('');
  }, [onFilterChange, onSearchChange, localFilters]);

  const selectedCategoriesCount = useMemo(() => {
    return (localFilters.categories || []).reduce((sum, teacherCat) => {
      const categories = Object.values(teacherCat)[0];
      return sum + (categories ? categories.length : 0);
    }, 0);
  }, [localFilters.categories]);

  return (
    <Card className="bg-[#f0f4f7] shadow-md">
      <CardHeader className="py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <CardTitle className="text-lg font-semibold text-[#315369] whitespace-nowrap mr-4">
          Filters
        </CardTitle>
        <div className="flex flex-1 items-center space-x-4 w-full">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-10 bg-white w-full h-9"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {!isMobile && (
            <div className="flex items-center space-x-2">
              {/* Moved and renamed Advanced Filters button */}
              <AdvancedFilters
                onFilterChange={(newFilters) => {
                  setLocalFilters((prevFilters) => {
                    const updatedFilters = {
                      ...prevFilters,
                      ...newFilters
                    };
                    onFilterChange(updatedFilters);
                    return updatedFilters;
                  });
                }}
                currentFilters={localFilters}
                availableFilters={availableFilters}
                filterOptions={filterOptions}
                studentSummaries={studentSummaries}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                >
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-1" />
                    Filters
                    <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
                  </div>
                </Button>
              </AdvancedFilters>

              {/* Categories Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9"
                  >
                    <div className="flex items-center">
                      <Filter className="h-4 w-4 mr-1" />
                      Categories
                      <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 max-h-64 overflow-y-auto">
                  {Object.entries(groupedCategories).map(([teacherEmailKey, categories]) => (
                    <DropdownMenuSub key={teacherEmailKey}>
                      <DropdownMenuSubTrigger>
                        {teacherNames[teacherEmailKey] || teacherEmailKey}
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="max-h-64 overflow-y-auto">
                        {categories.map((category) => {
                          const isSelected = (localFilters.categories || []).some(cat => 
                            cat[teacherEmailKey] && 
                            cat[teacherEmailKey].includes(category.value)
                          );
                          return (
                            <DropdownMenuItem
                              key={category.value}
                              onSelect={() => handleCategoryChange(category.value, teacherEmailKey)}
                              className="flex items-center"
                              style={{
                                backgroundColor: isSelected ? `${category.color}20` : 'transparent',
                              }}
                            >
                              {iconMap[category.icon] && React.createElement(iconMap[category.icon], { 
                                style: { color: category.color }, 
                                size: 16, 
                                className: 'mr-2' 
                              })}
                              <span>{category.label}</span>
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {localFilters.categories && localFilters.categories.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 relative"
                    >
                      {selectedCategoriesCount} selected
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 max-h-64 overflow-y-auto">
                    {localFilters.categories.map((teacherCat) => {
                      const teacherEmailKey = Object.keys(teacherCat)[0];
                      return teacherCat[teacherEmailKey].map((categoryId) => {
                        const category = groupedCategories[teacherEmailKey]?.find((c) => c.value === categoryId);
                        if (!category) return null;
                        return (
                          <DropdownMenuItem 
                            key={`${categoryId}-${teacherEmailKey}`} 
                            className="flex items-center"
                            onSelect={() => handleCategoryChange(categoryId, teacherEmailKey)}
                          >
                            {iconMap[category.icon] && React.createElement(iconMap[category.icon], {
                              size: 16,
                              className: 'mr-2',
                              style: { color: category.color }
                            })}
                            {category.label}
                            <X className="ml-auto h-4 w-4" />
                          </DropdownMenuItem>
                        );
                      });
                    })}
                    <DropdownMenuItem onSelect={handleClearAllCategories}>
                      Clear All
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <CategoryManager onCategoryChange={() => {}} />

              <div className="border-l border-gray-200 pl-2">
                <TooltipProvider>
                  <RadioGroup
                    value={currentMode}
                    onValueChange={setCurrentMode}
                    className="flex items-center space-x-1"
                  >
                    {Object.entries(MODE_CONFIG).map(([mode, config]) => (
                      <Tooltip key={mode}>
                        <TooltipTrigger asChild>
                          <div className="flex items-center">
                            <RadioGroupItem
                              value={mode}
                              id={mode}
                              className="peer hidden"
                            />
                            <label
                              htmlFor={mode}
                              className="flex items-center justify-center p-1.5 rounded-md text-gray-600 hover:bg-gray-100 cursor-pointer
                                peer-data-[state=checked]:text-blue-600 peer-data-[state=checked]:bg-blue-50"
                            >
                              {config.icon}
                            </label>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p>{config.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </RadioGroup>
                </TooltipProvider>
              </div>

              {/* Filter Counter Badge */}
              {(activeFilterCount > 0 || searchTerm) && (
                <div className="bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFilterCount}
                </div>
              )}

              {/* Action Buttons */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onFullScreenToggle}
                className="text-[#315369]"
                title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
              >
                {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters} 
                className="text-[#315369]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );
});

export default FilterPanel;
