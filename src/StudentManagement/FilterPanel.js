import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import Select from 'react-select';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  ChevronDown, ChevronUp, X, Maximize, Minimize, Search,
  Star, Flag, Bookmark, Circle, Square, Triangle, BookOpen as BookOpenIcon, GraduationCap, Trophy, Target, ClipboardCheck, Brain, Lightbulb, Clock, Calendar as CalendarIcon, BarChart, TrendingUp, AlertCircle, HelpCircle, MessageCircle, Users, Presentation, FileText, Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CategoryManager from './CategoryManager';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "../components/ui/dropdown-menu";

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
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [localFilters, setLocalFilters] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const initialFilters = { ...propFilters };
    if (!initialFilters.ActiveFutureArchived_Value) {
      initialFilters.ActiveFutureArchived_Value = ['Active'];
    }
    setLocalFilters((prevFilters) => {
      if (JSON.stringify(prevFilters) !== JSON.stringify(initialFilters)) {
        return initialFilters;
      }
      return prevFilters;
    });
  }, [propFilters]);

  useEffect(() => {
    const count = (localFilters.categories || []).reduce((sum, teacherCat) => {
      const categories = Object.values(teacherCat)[0];
      return sum + (categories ? categories.length : 0);
    }, 0) + (searchTerm ? 1 : 0);
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
              .filter((v) => v !== null && v !== undefined && v !== '')
          ),
        ].sort();
        options[key] = uniqueOptions.map((option) => ({ value: option, label: String(option) }));
      }
    });
    return options;
  }, [availableFilters, studentSummaries]);

  // Updated groupedCategories useMemo
  const groupedCategories = useMemo(() => {
    // Debug: Log teacherCategories
    console.log('teacherCategories:', teacherCategories);

    const grouped = {};
    Object.entries(teacherCategories).forEach(([teacherEmailKey, categories]) => {
      grouped[teacherEmailKey] = categories
        .filter(category => !category.archived)
        .map(category => ({
          value: category.id,  // Use the id field as the value
          label: category.name,
          color: category.color,
          icon: category.icon,
        }));
    });
    return grouped;
  }, [teacherCategories]);

  // Updated handleCategoryChange function
  const handleCategoryChange = useCallback(
    (categoryId, teacherEmailKey) => {
      setLocalFilters((prevFilters) => {
        const prevCategories = prevFilters.categories || [];
        let updatedCategories;

        const existingTeacherIndex = prevCategories.findIndex(
          (cat) => Object.keys(cat)[0] === teacherEmailKey
        );

        if (existingTeacherIndex > -1) {
          // Teacher already exists in the filter
          const existingTeacherCategories = prevCategories[existingTeacherIndex][teacherEmailKey];
          if (existingTeacherCategories.includes(categoryId)) {
            // Remove the category if it's already selected
            updatedCategories = [...prevCategories];
            updatedCategories[existingTeacherIndex] = {
              [teacherEmailKey]: existingTeacherCategories.filter((id) => id !== categoryId)
            };
            // Remove the teacher if no categories are left
            if (updatedCategories[existingTeacherIndex][teacherEmailKey].length === 0) {
              updatedCategories.splice(existingTeacherIndex, 1);
            }
          } else {
            // Add the new category
            updatedCategories = [...prevCategories];
            updatedCategories[existingTeacherIndex] = {
              [teacherEmailKey]: [...existingTeacherCategories, categoryId]
            };
          }
        } else {
          // Add new teacher and category
          updatedCategories = [...prevCategories, { [teacherEmailKey]: [categoryId] }];
        }

        const updatedFilters = {
          ...prevFilters,
          categories: updatedCategories,
        };

        // Debug: Log updated categories
        console.log('Updated categories:', updatedCategories);

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
    setLocalFilters((prevFilters) => {
      const clearedFilters = Object.keys(prevFilters).reduce(
        (acc, key) => ({
          ...acc,
          [key]: [],
        }),
        {}
      );
      onFilterChange(clearedFilters);
      onSearchChange('');
      return clearedFilters;
    });
  }, [onFilterChange, onSearchChange]);

  const selectedCategoriesCount = useMemo(() => {
    return (localFilters.categories || []).reduce((sum, teacherCat) => {
      const categories = Object.values(teacherCat)[0];
      return sum + (categories ? categories.length : 0);
    }, 0);
  }, [localFilters.categories]);

  // Debug: Log localFilters before rendering
  console.log('localFilters:', localFilters);

  return (
    <Card className="bg-[#f0f4f7] shadow-md">
      <CardHeader className="py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-4">
        <CardTitle className="text-lg font-semibold text-[#315369] whitespace-nowrap">Filters</CardTitle>
        <div className="flex-grow relative w-full sm:w-auto">
          <Input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10 bg-white w-full h-9"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          {searchTerm && (
            <Button variant="ghost" size="sm" onClick={() => onSearchChange('')} className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {!isMobile && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className="relative">
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
                  {/* Updated dropdown menu rendering */}
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
                                {iconMap[category.icon] && React.createElement(iconMap[category.icon], { style: { color: category.color }, size: 16, className: 'mr-2' })}
                                <span>{category.label}</span>
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
                            {iconMap[category.icon] && React.createElement(iconMap[category.icon], { size: 16, className: 'mr-2', style: { color: category.color } })}
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
            </div>
            <CategoryManager onCategoryChange={() => {}} />
            {(activeFilterCount > 0 || searchTerm) && (
              <div className="bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {activeFilterCount}
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onFullScreenToggle}
              className="text-[#315369]"
              title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
            >
              {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-[#315369]">
              <X className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="text-[#315369]">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </CardHeader>
      {!isMobile && (
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="px-6 py-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {availableFilters.map(({ key, label }) => {
                    if (key === 'categories') return null; // Skip categories here
                    return (
                      <div key={key} className="space-y-1">
                        <Label htmlFor={key} className="text-xs font-medium text-[#1fa6a7]">{label}</Label>
                        <div className="relative">
                          <Select
                            isMulti
                            name={key}
                            options={filterOptions[key]}
                            value={filterOptions[key]?.filter(option => (localFilters[key] || []).includes(option.value))}
                            onChange={(selectedOptions) => {
                              setLocalFilters((prevFilters) => {
                                const updatedFilters = {
                                  ...prevFilters,
                                  [key]: selectedOptions ? selectedOptions.map((option) => option.value) : [],
                                };
                                onFilterChange(updatedFilters);
                                return updatedFilters;
                              });
                            }}
                            styles={{
                              control: (provided) => ({
                                ...provided,
                                backgroundColor: 'white',
                                borderColor: '#d1d5db',
                                minHeight: '32px',
                                height: 'auto',
                              }),
                              valueContainer: (provided) => ({ ...provided, padding: '0 6px' }),
                              input: (provided) => ({ ...provided, margin: '0px' }),
                              indicatorsContainer: (provided) => ({ ...provided, height: '32px' }),
                              menu: (provided) => ({ ...provided, backgroundColor: 'white', zIndex: 9999 }),
                              option: (provided, state) => ({
                                ...provided,
                                backgroundColor: state.isSelected ? '#315369' : state.isFocused ? '#f0f4f7' : 'white',
                                color: state.isSelected ? 'white' : '#315369',
                              }),
                              multiValue: (provided) => ({ ...provided, backgroundColor: '#f0f4f7' }),
                              multiValueLabel: (provided) => ({ ...provided, color: '#315369' }),
                              multiValueRemove: (provided) => ({
                                ...provided,
                                color: '#315369',
                                '&:hover': { backgroundColor: '#315369', color: 'white' },
                              }),
                            }}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            placeholder={`${label}`}
                          />
                          {localFilters[key] && localFilters[key].length > 0 && (
                            <div className="absolute -top-2 -right-2 h-4 w-4 bg-blue-500 rounded-full" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </Card>
  );
});

export default FilterPanel;
