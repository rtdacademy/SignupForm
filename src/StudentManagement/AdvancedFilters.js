import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import Select, { components } from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "../components/ui/sheet";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { CalendarIcon, FilterIcon, XCircleIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { getDatabase, ref, get } from 'firebase/database';
import {
  STATUS_OPTIONS,
  STUDENT_TYPE_OPTIONS,
  ACTIVE_FUTURE_ARCHIVED_OPTIONS,
  DIPLOMA_MONTH_OPTIONS,
  getSchoolYearOptions
} from '../config/DropdownOptions';

const StatusOption = ({ data, children, ...props }) => {
  const option = STATUS_OPTIONS.find(opt => opt.value === data.value) || data;
  const color = option?.color || '#6B7280'; // Fallback color
  
  return (
    <components.Option {...props}>
      <div className="flex items-center">
        <div 
          className="w-3 h-3 rounded-full mr-2" 
          style={{ backgroundColor: color }}
        />
        {children}
      </div>
    </components.Option>
  );
};

const StudentTypeOption = ({ data, children, ...props }) => {
  const option = STUDENT_TYPE_OPTIONS.find(opt => opt.value === data.value) || data;
  const color = option?.color || '#6B7280'; // Fallback color
  const Icon = option?.icon;
  
  return (
    <components.Option {...props}>
      <div className="flex items-center">
        {Icon && React.createElement(Icon, {
          className: "w-4 h-4 mr-2",
          style: { color }
        })}
        <span>{children}</span>
      </div>
    </components.Option>
  );
};

// Separate component for date display
const DateDisplay = ({ date, placeholder }) => {
  if (!date) {
    return (
      <span className="text-gray-500">{placeholder}</span>
    );
  }
  return format(new Date(date), 'MMM d, yyyy');
};

const DateRangeFilter = ({ 
  title, 
  filterType,
  currentFilters,
  onFilterChange,
  description 
}) => {
  const dateFilters = currentFilters.dateFilters?.[filterType] || {};
  const startDate = dateFilters.after || dateFilters.between?.start;
  const endDate = dateFilters.before || dateFilters.between?.end;

  const handleDateChange = (type, date) => {
    const timestamp = date ? date.getTime() : null;
    let newDateFilter = {};

    // Get existing timestamps
    const existingStart = type === 'start' ? timestamp : startDate;
    const existingEnd = type === 'end' ? timestamp : endDate;

    // Determine filter type based on which dates are present
    if (existingStart && existingEnd) {
      newDateFilter = {
        between: {
          start: existingStart,
          end: existingEnd
        }
      };
    } else if (existingStart) {
      newDateFilter = {
        after: existingStart
      };
    } else if (existingEnd) {
      newDateFilter = {
        before: existingEnd
      };
    }

    onFilterChange({
      ...currentFilters,
      dateFilters: {
        ...currentFilters.dateFilters,
        [filterType]: Object.keys(newDateFilter).length > 0 ? newDateFilter : undefined
      }
    });
  };

  return (
    <div className="space-y-2">
      <h3 className="font-medium text-gray-700">{title}</h3>
      <div className="flex space-x-2">
        <DatePicker
          selected={startDate ? new Date(startDate) : null}
          onChange={(date) => handleDateChange('start', date)}
          selectsStart
          startDate={startDate ? new Date(startDate) : null}
          endDate={endDate ? new Date(endDate) : null}
          customInput={
            <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <DateDisplay date={startDate} placeholder="Start date" />
            </Button>
          }
          dateFormat="MM/dd/yyyy"
        />
        <DatePicker
          selected={endDate ? new Date(endDate) : null}
          onChange={(date) => handleDateChange('end', date)}
          selectsEnd
          startDate={startDate ? new Date(startDate) : null}
          endDate={endDate ? new Date(endDate) : null}
          minDate={startDate ? new Date(startDate) : null}
          customInput={
            <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <DateDisplay date={endDate} placeholder="End date" />
            </Button>
          }
          dateFormat="MM/dd/yyyy"
        />
      </div>
      {(startDate || endDate) && (
        <div className="text-sm text-blue-600">
          {description}
        </div>
      )}
    </div>
  );
};

const AdvancedFilters = ({ 
  children,
  onFilterChange, 
  currentFilters,
  availableFilters,
  filterOptions,
  studentSummaries 
}) => {
  const { updateFilterPreferences } = useUserPreferences();
  const [courseTitles, setCourseTitles] = useState({});
  
  // Migration status state
  const [migrationStatus, setMigrationStatus] = useState('all');

  // Fetch course titles
  useEffect(() => {
    const fetchCourseTitles = async () => {
      const db = getDatabase();
      const uniqueCourseIds = [...new Set(
        studentSummaries
          .map(s => String(s.CourseID)) // Ensure IDs are strings
          .filter(id => id !== undefined && id !== null)
      )];
    
      try {
        const titlePromises = uniqueCourseIds.map(async (courseId) => {
          const titleRef = ref(db, `courses/${courseId}/Title`);
          const snapshot = await get(titleRef);
          const title = snapshot.val();
          return { courseId, title };
        });
    
        const titles = await Promise.all(titlePromises);
        const titleMap = titles.reduce((acc, { courseId, title }) => {
          if (title && typeof title === 'string') { // Only include courses with valid titles
            acc[courseId] = title;
          }
          return acc;
        }, {});
    
        setCourseTitles(titleMap);
      } catch (error) {
        console.error('Error fetching course titles:', error);
        setCourseTitles({});
      }
    }; 

    fetchCourseTitles();
  }, [studentSummaries]);

  // Load saved filters from preferences
  useEffect(() => {
    // No need to set individual date states anymore as DateRangeFilter handles it
    setMigrationStatus(currentFilters.hasSchedule?.length ? 
      (currentFilters.hasSchedule[0] ? 'migrated' : 'not-migrated') : 'all');
  }, [currentFilters]);

  const getActiveFilterCount = () => {
    let count = 0;
    const dateFilters = currentFilters.dateFilters || {};
    if (dateFilters.created && Object.keys(dateFilters.created).length) count++;
    if (dateFilters.scheduleStart && Object.keys(dateFilters.scheduleStart).length) count++;
    if (dateFilters.scheduleEnd && Object.keys(dateFilters.scheduleEnd).length) count++;
    if (currentFilters.hasSchedule?.length > 0) count++;
    Object.keys(currentFilters).forEach(key => {
      if (key !== 'dateFilters' && Array.isArray(currentFilters[key]) && currentFilters[key].length > 0) count++;
    });
    return count;
  };

  const handleFiltersUpdate = (newFilters) => {
    onFilterChange(newFilters);
    updateFilterPreferences(newFilters);
  };

  const handleMigrationStatusChange = (value) => {
    const hasSchedule = value === 'all' ? [] : 
                       value === 'migrated' ? [true] : 
                       [false];
    const newFilters = {
      ...currentFilters,
      hasSchedule
    };
    handleFiltersUpdate(newFilters);
    setMigrationStatus(value);
  };

  const handleStatusFilterChange = (key, selectedOptions) => {
    const newFilters = {
      ...currentFilters,
      [key]: selectedOptions ? selectedOptions.map(option => option.value) : []
    };
    handleFiltersUpdate(newFilters);
  };

  const getFilterDescription = (type, startDate, endDate) => {
    if (!startDate && !endDate) return null;
    
    const dateString = (date) => format(new Date(date), 'MMM d, yyyy');
    
    if (startDate && endDate) {
      return `${type} between ${dateString(startDate)} and ${dateString(endDate)}`;
    }
    if (startDate) {
      return `${type} after ${dateString(startDate)}`;
    }
    if (endDate) {
      return `${type} before ${dateString(endDate)}`;
    }
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      ...currentFilters,
      dateFilters: {},
      hasSchedule: [],
      ...Object.keys(currentFilters).reduce((acc, key) => {
        if (key !== 'dateFilters' && key !== 'hasSchedule') {
          acc[key] = [];
        }
        return acc;
      }, {})
    };
    
    handleFiltersUpdate(clearedFilters);
    setMigrationStatus('all');
  };

  const renderFilterOptions = ({ key, label }) => {
    if (key === 'Course_Value' || key === 'categories') {
      return null;
    }
  
    let selectConfig = {
      options: [],
      components: {},
      styles: {
        option: (provided, state) => ({
          ...provided,
          color: state.data?.color || provided.color,
          backgroundColor: state.isSelected 
            ? `${state.data?.color || '#6B7280'}15` 
            : state.isFocused 
              ? `${state.data?.color || '#6B7280'}10` 
              : provided.backgroundColor
        }),
        multiValue: (provided, state) => ({
          ...provided,
          backgroundColor: `${state.data?.color || '#6B7280'}15`,
        }),
        multiValueLabel: (provided, state) => ({
          ...provided,
          color: state.data?.color || provided.color
        }),
        multiValueRemove: (provided, state) => ({
          ...provided,
          color: state.data?.color || provided.color,
          ':hover': {
            backgroundColor: `${state.data?.color || '#6B7280'}25`,
            color: state.data?.color || provided.color
          }
        })
      }
    };
  
    switch (key) {
      case 'Status_Value':
        selectConfig.options = STATUS_OPTIONS.map(opt => ({
          value: opt.value,
          label: opt.value,
          color: opt.color,
          category: opt.category
        }));
        selectConfig.components = { Option: StatusOption };
        break;
  
      case 'StudentType_Value':
        selectConfig.options = STUDENT_TYPE_OPTIONS.map(opt => ({
          value: opt.value,
          label: opt.value,
          color: opt.color,
          icon: opt.icon
        }));
        selectConfig.components = { Option: StudentTypeOption };
        break;
  
      case 'ActiveFutureArchived_Value':
        selectConfig.options = ACTIVE_FUTURE_ARCHIVED_OPTIONS.map(opt => ({
          value: opt.value,
          label: opt.value,
          color: opt.color
        }));
        break;
  
      case 'DiplomaMonthChoices_Value':
        selectConfig.options = DIPLOMA_MONTH_OPTIONS.map(opt => ({
          value: opt.value,
          label: opt.label || opt.value,
          color: opt.color
        }));
        break;
  
      case 'School_x0020_Year_Value':
        selectConfig.options = getSchoolYearOptions().map(opt => ({
          value: opt.value,
          label: opt.value,
          color: opt.color
        }));
        break;
  
      case 'CourseID':
        selectConfig.options = Object.entries(courseTitles)
          .sort((a, b) => a[1].localeCompare(b[1]))
          .map(([id, title]) => ({
            value: String(id),
            label: title
          }))
          .filter(option => option.label && !option.label.startsWith('Course '));
        break;
  
      default:
        selectConfig.options = filterOptions[key] || [];
    }
  
    return (
      <div key={key} className="flex items-center space-x-4">
        <Label className="font-medium text-gray-700 min-w-[120px]">
          {label}
        </Label>
        <Select
          isMulti
          name={key}
          options={selectConfig.options}
          components={selectConfig.components}
          value={selectConfig.options.filter(option => 
            (currentFilters[key] || []).includes(option.value)
          )}
          onChange={(selectedOptions) => handleStatusFilterChange(key, selectedOptions)}
          className="flex-1"
          classNamePrefix="select"
          placeholder={`Select ${label.toLowerCase()}`}
          styles={selectConfig.styles}
        />
      </div>
    );
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children || (
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 relative"
          >
            <FilterIcon className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2 bg-blue-500 text-white"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] md:w-[800px]">
        <SheetHeader>
          <div className="flex justify-between items-center">
            <SheetTitle>Filters</SheetTitle>
            {activeFilterCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAllFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircleIcon className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </SheetHeader>
        
        <Tabs defaultValue="status" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="status">Status Filters</TabsTrigger>
            <TabsTrigger value="dates">Date Filters</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[70vh] mt-4 pr-4">
            <TabsContent value="status" className="mt-0">
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-700">Migration Status</h3>
                  </div>
                  <RadioGroup 
                    value={migrationStatus}
                    onValueChange={handleMigrationStatusChange}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="all-adv" />
                      <Label htmlFor="all-adv">All</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="migrated" id="migrated-adv" />
                      <Label htmlFor="migrated-adv">Migrated</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="not-migrated" id="not-migrated-adv" />
                      <Label htmlFor="not-migrated-adv">Not Migrated</Label>
                    </div>
                  </RadioGroup>
                </div>

                {availableFilters.map(filter => renderFilterOptions(filter))}
              </div>
            </TabsContent>

            <TabsContent value="dates" className="mt-0">
              <div className="space-y-6">
                <DateRangeFilter
                  title="Created Date"
                  filterType="created"
                  currentFilters={currentFilters}
                  onFilterChange={handleFiltersUpdate}
                  description={getFilterDescription(
                    'Created',
                    currentFilters.dateFilters?.created?.after || currentFilters.dateFilters?.created?.between?.start,
                    currentFilters.dateFilters?.created?.before || currentFilters.dateFilters?.created?.between?.end
                  )}
                />

                <DateRangeFilter
                  title="Schedule Start Date"
                  filterType="scheduleStart"
                  currentFilters={currentFilters}
                  onFilterChange={handleFiltersUpdate}
                  description={getFilterDescription(
                    'Schedule start',
                    currentFilters.dateFilters?.scheduleStart?.after || currentFilters.dateFilters?.scheduleStart?.between?.start,
                    currentFilters.dateFilters?.scheduleStart?.before || currentFilters.dateFilters?.scheduleStart?.between?.end
                  )}
                />

                <DateRangeFilter
                  title="Schedule End Date"
                  filterType="scheduleEnd"
                  currentFilters={currentFilters}
                  onFilterChange={handleFiltersUpdate}
                  description={getFilterDescription(
                    'Schedule end',
                    currentFilters.dateFilters?.scheduleEnd?.after || currentFilters.dateFilters?.scheduleEnd?.between?.start,
                    currentFilters.dateFilters?.scheduleEnd?.before || currentFilters.dateFilters?.scheduleEnd?.between?.end
                  )}
                />
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <SheetFooter className="mt-6">
          <div className="text-sm text-gray-500">
            {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AdvancedFilters;
