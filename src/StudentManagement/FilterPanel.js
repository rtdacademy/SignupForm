import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { useMode, MODES } from '../context/ModeContext';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { getSchoolYearOptions, TERM_OPTIONS, getTermInfo } from '../config/DropdownOptions';
import {
  ChevronDown, X, Maximize, Minimize, Search,
  Star, Flag, Bookmark, Circle, Square, Triangle, BookOpen as BookOpenIcon, 
  GraduationCap, Trophy, Target, ClipboardCheck, Brain, Lightbulb, Clock, 
  Calendar as CalendarIcon, BarChart, TrendingUp, AlertCircle, HelpCircle, 
  MessageCircle, Users, Presentation, FileText, Filter, Loader2, 
  UserSquare2, ClipboardList, Grid2X2, FilterX
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
  'grid-2x2': Grid2X2, // Added Grid2X2 to iconMap
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

const ClearingOverlay = ({ isClearing }) => {
  if (!isClearing) return null;

  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg transition-all duration-300">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        <span className="text-sm text-blue-500 font-medium">Clearing filters...</span>
      </div>
    </div>
  );
};

// New enhanced filter indicator component
const FilterIndicator = ({ count, isFullScreen }) => {
  if (count === 0) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-full shadow-md hover:bg-blue-700 transition-colors">
            <Filter className="h-4 w-4" />
            {isFullScreen && (
              <>
                <span className="ml-1 text-sm font-medium">
                  {count} active {count === 1 ? 'filter' : 'filters'}
                </span>
              </>
            )}
            {!isFullScreen && (
              <span className="ml-1 text-sm font-medium">{count}</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Click 'Clear Filters' to reset all filters</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// New enhanced clear filters button component
const ClearFiltersButton = ({ onClick, isClearing }) => {
  if (isClearing) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
        disabled
      >
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        Clearing...
      </Button>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onClick}
            className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 transition-colors"
          >
            <FilterX className="h-4 w-4 mr-1" />
           
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Reset all applied filters</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

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
  categoryTypes, 
}) {
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [localFilters, setLocalFilters] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isClearing, setIsClearing] = useState(false);
  const { currentMode, setCurrentMode } = useMode();
  const { preferences, updateFilterPreferences, clearAllFilters } = useUserPreferences();

  const groupCategoriesByType = useMemo(() => {
    return () => {
      const grouped = {};
      
      // Initialize groups for each type
      categoryTypes.forEach(type => {
        grouped[type.id] = [];
      });
      
      // Add uncategorized group
      grouped['uncategorized'] = [];
      
      // Group categories
      Object.entries(teacherCategories).forEach(([teacherEmailKey, categories]) => {
        categories
          .filter(category => !category.archived)
          .forEach(category => {
            const categoryWithTeacher = {
              ...category,
              teacherEmailKey,
              teacherName: teacherNames[teacherEmailKey] || teacherEmailKey
            };
            
            if (category.type && grouped[category.type]) {
              grouped[category.type].push(categoryWithTeacher);
            } else {
              grouped['uncategorized'].push(categoryWithTeacher);
            }
          });
      });
      
      return grouped;
    };
  }, [categoryTypes, teacherCategories, teacherNames]);

  // Load saved preferences
  useEffect(() => {
    if (preferences?.filters) {
      // Make sure we initialize with valid filter structure
      const safeFilters = {
        ...preferences.filters,
        categories: Array.isArray(preferences.filters.categories) ? 
          preferences.filters.categories : [],
        dateFilters: preferences.filters.dateFilters || {},
        hasSchedule: Array.isArray(preferences.filters.hasSchedule) ? 
          preferences.filters.hasSchedule : []
      };
      
      setLocalFilters(safeFilters);
      onFilterChange(safeFilters);
      onSearchChange(preferences.filters.searchTerm || '');
      
      if (preferences.filters.currentMode) {
        setCurrentMode(preferences.filters.currentMode);
      }
    }
  }, [preferences, onFilterChange, onSearchChange, setCurrentMode]);

  // Mobile check effect
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sync with prop filters
  useEffect(() => {
    if (JSON.stringify(localFilters) !== JSON.stringify(propFilters)) {
      setLocalFilters(propFilters);
    }
  }, [propFilters, localFilters]);

  // Updated active filter count calculation
  useEffect(() => {
    const count = (
      // Count category filters
      (localFilters.categories || []).reduce((sum, teacherCat) => {
        const categories = Object.values(teacherCat)[0];
        return sum + (categories ? categories.length : 0);
      }, 0) + 
      // Count search term if present
      (searchTerm ? 1 : 0) +
      // Count date filters
      (localFilters.dateFilters ? Object.keys(localFilters.dateFilters).length : 0) +
      // Count other filters except mode
      availableFilters.reduce((sum, { key }) => {
        if (key !== 'categories' && key !== 'currentMode' && Array.isArray(localFilters[key])) {
          return sum + (localFilters[key].length || 0);
        }
        return sum;
      }, 0) +
      // Count hasSchedule filter
      (localFilters.hasSchedule?.length ? 1 : 0)
    );
    setActiveFilterCount(count);
  }, [localFilters, searchTerm, availableFilters]);

  // Memoized handlers
  const handleSearchChange = useCallback((term) => {
    onSearchChange(term);
    updateFilterPreferences({ searchTerm: term });
  }, [onSearchChange, updateFilterPreferences]);

  // Updated clear filters handler with animation
  const handleClearAll = useCallback(async () => {
    setIsClearing(true);

    await new Promise(resolve => setTimeout(resolve, 100));

    const clearedFilters = {
        ...localFilters,
        categories: [],
        hasSchedule: [],
        dateFilters: {},
        currentMode: localFilters.currentMode || MODES.TEACHER,
        ...Object.keys(localFilters).reduce((acc, key) => {
            if (key !== 'currentMode' && key !== 'dateFilters' && key !== 'hasSchedule') {
                acc[key] = [];
            }
            return acc;
        }, {})
    };

    // Clear everything in one batch
    const updatedPreferences = {
        ...clearedFilters,
        searchTerm: '' // Include searchTerm in the preferences update
    };

    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
    onSearchChange(''); // Use onSearchChange directly instead of handleSearchChange
    await updateFilterPreferences(updatedPreferences);

    setTimeout(() => {
        setIsClearing(false);
    }, 1000);
}, [localFilters, onFilterChange, onSearchChange, updateFilterPreferences]);

  const handleModeChange = useCallback((newMode) => {
    setCurrentMode(newMode);
    updateFilterPreferences({ currentMode: newMode });
  }, [setCurrentMode, updateFilterPreferences]);

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
        updateFilterPreferences(updatedFilters);
        return updatedFilters;
      });
    },
    [onFilterChange, updateFilterPreferences]
  );

  const filterOptions = useMemo(() => {
    const options = {};
    availableFilters.forEach(({ key }) => {
      if (key === 'CourseID' || key === 'categories') return; // Skip CourseID here since we handle it in AdvancedFilters
      
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

  const selectedCategoriesCount = useMemo(() => {
    return (localFilters.categories || []).reduce((sum, teacherCat) => {
      const categories = Object.values(teacherCat)[0];
      return sum + (categories ? categories.length : 0);
    }, 0);
  }, [localFilters.categories]);

  // Render Categories Dropdown with grouping by Staff and Type
  const renderCategoriesDropdown = () => (
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
      <DropdownMenuContent className="w-56">
        {/* By Staff option */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Users className="h-4 w-4 mr-2" />
            By Staff
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent 
            className="max-h-[300px] overflow-y-auto"
            alignOffset={-5}
            side="right"
          >
            {Object.entries(teacherCategories).map(([teacherEmailKey, categories]) => (
              <DropdownMenuSub key={teacherEmailKey}>
                <DropdownMenuSubTrigger className="w-full">
                  <div className="truncate">
                    {teacherNames[teacherEmailKey] || teacherEmailKey}
                  </div>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent 
                  className="max-h-[300px] overflow-y-auto"
                  alignOffset={-5}
                  side="right"
                >
                  {categories
                    .filter(category => !category.archived)
                    .map((category) => {
                      const isSelected = (localFilters.categories || []).some(cat => 
                        cat[teacherEmailKey] && 
                        cat[teacherEmailKey].includes(category.id)
                      );
                      return (
                        <DropdownMenuItem
                          key={category.id}
                          onSelect={() => handleCategoryChange(category.id, teacherEmailKey)}
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
                          <span className="truncate">{category.name}</span>
                        </DropdownMenuItem>
                      );
                    })}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* By Type option */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Grid2X2 className="h-4 w-4 mr-2" />
            By Type
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent 
            className="max-h-[300px] overflow-y-auto"
            alignOffset={-5}
            side="right"
          >
            {categoryTypes.map((type) => {
              const categoriesByType = groupCategoriesByType();
              const typeCategories = categoriesByType[type.id] || [];
              
              if (typeCategories.length === 0) return null;

              return (
                <DropdownMenuSub key={type.id}>
                  <DropdownMenuSubTrigger className="w-full">
                    <div className="flex items-center">
                      {React.createElement(
                        iconMap[type.icon] || Circle,
                        { 
                          className: "h-4 w-4 mr-2 flex-shrink-0",
                          style: { color: type.color }
                        }
                      )}
                      <span className="truncate">{type.name}</span>
                    </div>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent 
                    className="max-h-[300px] overflow-y-auto"
                    alignOffset={-5}
                    side="right"
                  >
                    {typeCategories.map((category) => {
                      const isSelected = (localFilters.categories || []).some(cat => 
                        cat[category.teacherEmailKey] && 
                        cat[category.teacherEmailKey].includes(category.id)
                      );
                      
                      return (
                        <DropdownMenuItem
                          key={`${category.teacherEmailKey}-${category.id}`}
                          onSelect={() => handleCategoryChange(category.id, category.teacherEmailKey)}
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
                          <span className="truncate">{category.name}</span>
                          <span className="ml-2 text-xs text-gray-500 flex-shrink-0">
                            ({category.teacherName})
                          </span>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              );
            })}

            {/* Uncategorized section */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Circle className="h-4 w-4 mr-2" />
                Uncategorized
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent 
                className="max-h-[300px] overflow-y-auto"
                alignOffset={-5}
                side="right"
              >
                {groupCategoriesByType()['uncategorized'].map((category) => {
                  const isSelected = (localFilters.categories || []).some(cat => 
                    cat[category.teacherEmailKey] && 
                    cat[category.teacherEmailKey].includes(category.id)
                  );
                  
                  return (
                    <DropdownMenuItem
                      key={`${category.teacherEmailKey}-${category.id}`}
                      onSelect={() => handleCategoryChange(category.id, category.teacherEmailKey)}
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
                      <span className="truncate">{category.name}</span>
                      <span className="ml-2 text-xs text-gray-500 flex-shrink-0">
                        ({category.teacherName})
                      </span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <Card className="bg-[#f0f4f7] shadow-md relative">
      <ClearingOverlay isClearing={isClearing} />
      <CardHeader className="py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <CardTitle className="text-lg font-semibold text-[#315369] whitespace-nowrap mr-4">
          Filters
        </CardTitle>
        <div className="flex flex-1 items-center space-x-4 w-full">
          <div className="relative flex-1">
          <Input
  type="text"
  placeholder="Search by name, email, parent email or asn..."  
  value={searchTerm}
  onChange={(e) => handleSearchChange(e.target.value)}
  className="pl-10 pr-10 bg-white w-full h-9"
/>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSearchChange('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {!isMobile && (
            <div className="flex items-center space-x-2">
              <AdvancedFilters
                onFilterChange={(newFilters) => {
                  setLocalFilters((prevFilters) => {
                    const updatedFilters = {
                      ...prevFilters,
                      ...newFilters
                    };
                    onFilterChange(updatedFilters);
                    updateFilterPreferences(updatedFilters);
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

              {renderCategoriesDropdown()}

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
                    {activeFilterCount > 0 && (
                      <DropdownMenuItem onSelect={handleClearAll}>
                        Clear All
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <CategoryManager onCategoryChange={() => {}} />

              <div className="border-l border-gray-200 pl-2">
                <TooltipProvider>
                  <RadioGroup
                    value={currentMode}
                    onValueChange={handleModeChange}
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

              {/* Enhanced Filter Indicator */}
              {activeFilterCount > 0 && (
                <FilterIndicator count={activeFilterCount} />
              )}

              {/* Enhanced Clear Filters Button */}
              {activeFilterCount > 0 && (
                <ClearFiltersButton
                  onClick={handleClearAll}
                  isClearing={isClearing}
                />
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
              
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );
});

export default FilterPanel;
