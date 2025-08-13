import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import Select, { components } from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '../components/ui/sheet';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { CalendarIcon, FilterIcon, XCircleIcon, BookOpen, Database, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { getDatabase, ref, get } from 'firebase/database';
import {
  STATUS_OPTIONS,
  STUDENT_TYPE_OPTIONS,
  ACTIVE_FUTURE_ARCHIVED_OPTIONS,
  DIPLOMA_MONTH_OPTIONS,
  getSchoolYearOptions,
  COURSE_OPTIONS,
} from '../config/DropdownOptions';

// Option Components

const StatusOption = ({ data, children, ...props }) => {
  const option = STATUS_OPTIONS.find((opt) => opt.value === data.value) || data;
  const color = option?.color || '#6B7280';
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
  const option = STUDENT_TYPE_OPTIONS.find((opt) => opt.value === data.value) || data;
  const color = option?.color || '#6B7280';
  const Icon = option?.icon;
  return (
    <components.Option {...props}>
      <div className="flex items-center">
        {Icon &&
          React.createElement(Icon, {
            className: 'w-4 h-4 mr-2',
            style: { color },
          })}
        <span>{children}</span>
      </div>
    </components.Option>
  );
};

const CourseOption = ({ data, children, ...props }) => {
  const predefinedCourse = COURSE_OPTIONS.find(
    (opt) => String(opt.courseId) === String(data.value)
  );
  const Icon = predefinedCourse?.icon || BookOpen;
  return (
    <components.Option {...props}>
      <div className="flex items-center">
        {Icon &&
          React.createElement(Icon, {
            className: 'w-4 h-4 mr-2',
            style: { color: predefinedCourse?.color || '#6B7280' },
          })}
        <span className="flex-1">{children}</span>
        {predefinedCourse?.grade && (
          <span className="ml-2 text-sm text-gray-500">
            Grade {predefinedCourse.grade}
          </span>
        )}
      </div>
    </components.Option>
  );
};

const DateDisplay = ({ date, placeholder }) => {
  if (!date) {
    return <span className="text-gray-500">{placeholder}</span>;
  }
  return format(new Date(date), 'MMM d, yyyy');
};

const DateRangeFilter = ({
  title,
  filterType,
  currentFilters,
  onFilterChange,
  description,
}) => {
  const dateFilters = currentFilters.dateFilters?.[filterType] || {};
  const startDate = dateFilters.after || dateFilters.between?.start;
  const endDate = dateFilters.before || dateFilters.between?.end;

  const handleDateChange = (type, date) => {
    const timestamp = date ? date.getTime() : null;
    let newDateFilter = {};
    const existingStart = type === 'start' ? timestamp : startDate;
    const existingEnd = type === 'end' ? timestamp : endDate;
    if (existingStart && existingEnd) {
      newDateFilter = {
        between: {
          start: existingStart,
          end: existingEnd,
        },
      };
    } else if (existingStart) {
      newDateFilter = {
        after: existingStart,
      };
    } else if (existingEnd) {
      newDateFilter = {
        before: existingEnd,
      };
    }
    onFilterChange({
      ...currentFilters,
      dateFilters: {
        ...currentFilters.dateFilters,
        [filterType]:
          Object.keys(newDateFilter).length > 0 ? newDateFilter : undefined,
      },
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
            <Button
              variant="outline"
              className="w-[180px] justify-start text-left font-normal"
            >
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
            <Button
              variant="outline"
              className="w-[180px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              <DateDisplay date={endDate} placeholder="End date" />
            </Button>
          }
          dateFormat="MM/dd/yyyy"
        />
      </div>
      {(startDate || endDate) && (
        <div className="text-sm text-blue-600">{description}</div>
      )}
    </div>
  );
};


const RecordTypeOption = ({ data, children, ...props }) => {
  const option = RECORD_TYPE_OPTIONS.find((opt) => opt.value === data.value) || data;
  const Icon = option?.icon || Circle;
  const color = option?.color || '#6B7280';
  return (
    <components.Option {...props}>
      <div className="flex items-center w-full">
        <Icon className="h-4 w-4 mr-2" style={{ color }} />
        <span>{children}</span>
        {option?.description && (
          <span className="ml-auto text-xs text-gray-500">{option.description}</span>
        )}
      </div>
    </components.Option>
  );
};


const RECORD_TYPE_OPTIONS = [
  { value: 'yourway', label: 'YourWay Records', color: '#3B82F6', description: '(Default)', icon: Circle },
  { value: 'all', label: 'All Records', color: '#6B7280', description: '', icon: Circle },
  { value: 'linked', label: 'Linked Only', color: '#10B981', description: '(PASI + YourWay)', icon: Circle },
  { value: 'pasiOnly', label: 'PASI Only', color: '#F59E0B', description: '(No YourWay)', icon: Circle },
  { value: 'summaryOnly', label: 'YourWay Only', color: '#3B82F6', description: '(No PASI)', icon: Circle },
];

const AdvancedFilters = ({
  children,
  onFilterChange,
  currentFilters,
  availableFilters,
  filterOptions,
  studentSummaries,
  recordTypeFilter,
  onRecordTypeFilterChange,
}) => {
  const { updateFilterPreferences } = useUserPreferences();
  const [courseTitles, setCourseTitles] = useState({});

  // Fetch course titles from the database
  useEffect(() => {
    const fetchCourseTitles = async () => {
      const db = getDatabase();
      const uniqueCourseIds = [
        ...new Set(
          studentSummaries
            .map((s) => String(s.CourseID))
            .filter((id) => id !== undefined && id !== null)
        ),
      ];

      try {
        const titlePromises = uniqueCourseIds.map(async (courseId) => {
          const titleRef = ref(db, `courses/${courseId}/Title`);
          const snapshot = await get(titleRef);
          const title = snapshot.val();
          return { courseId, title };
        });

        const titles = await Promise.all(titlePromises);
        const titleMap = titles.reduce((acc, { courseId, title }) => {
          const predefinedCourse = COURSE_OPTIONS.find(
            (opt) => String(opt.courseId) === String(courseId)
          );
          if (predefinedCourse) {
            acc[courseId] = {
              title: predefinedCourse.value,
              predefinedCourse: true,
              ...predefinedCourse,
            };
          } else if (title && typeof title === 'string') {
            acc[courseId] = {
              title,
              value: title,
              predefinedCourse: false,
            };
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

  const handleFiltersUpdate = (newFilters) => {
    onFilterChange(newFilters);
    updateFilterPreferences(newFilters);
  };

  const handleStatusFilterChange = (key, selectedOptions) => {
    const newFilters = {
      ...currentFilters,
      [key]: selectedOptions ? selectedOptions.map((option) => option.value) : [],
    };
    handleFiltersUpdate(newFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    const dateFilters = currentFilters.dateFilters || {};
    if (dateFilters.created && Object.keys(dateFilters.created).length) count++;
    if (dateFilters.scheduleStart && Object.keys(dateFilters.scheduleStart).length) count++;
    if (dateFilters.scheduleEnd && Object.keys(dateFilters.scheduleEnd).length) count++;
    // Count record type filter (only count when it's not 'yourway' which is the default)
    if (recordTypeFilter && recordTypeFilter !== 'yourway') count++;
    Object.keys(currentFilters).forEach((key) => {
      if (key !== 'dateFilters') {
        if (Array.isArray(currentFilters[key]) && currentFilters[key].length > 0) {
          count++;
        }
      }
    });
    return count;
  };

  const getFilterDescription = (type, startDate, endDate) => {
    if (!startDate && !endDate) return null;
    const dateString = (date) => format(new Date(date), 'MMM d, yyyy');
    if (startDate && endDate) {
      return `${type} between ${dateString(startDate)} and ${dateString(endDate)}`;
    }
    if (startDate) return `${type} after ${dateString(startDate)}`;
    if (endDate) return `${type} before ${dateString(endDate)}`;
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      ...currentFilters,
      dateFilters: {},
      ...Object.keys(currentFilters).reduce((acc, key) => {
        if (key !== 'dateFilters') {
          acc[key] = [];
        }
        return acc;
      }, {}),
    };
    handleFiltersUpdate(clearedFilters);
    // Reset record type filter to default
    onRecordTypeFilterChange('yourway');
  };


  const getCurrentRecordType = () => {
    if (!recordTypeFilter) return [];
    return RECORD_TYPE_OPTIONS.filter(option => option.value === recordTypeFilter);
  };

  const handleRecordTypeChange = (selectedOption) => {
    const newValue = selectedOption ? selectedOption.value : 'yourway';
    onRecordTypeFilterChange(newValue);
  };

  const renderFilterOptions = ({ key, label }) => {
    if (
      key === 'Course_Value' ||
      key === 'categories' ||
      key === 'School_x0020_Year_Value'
    ) {
      return null;
    }

    // Get the appropriate predefined options based on the key
    let options = [];
    switch (key) {
      case 'Status_Value':
        options = STATUS_OPTIONS.map(opt => ({
          value: opt.value,
          label: opt.value,
          color: opt.color,
          icon: opt.icon
        }));
        break;
      case 'StudentType_Value':
        options = STUDENT_TYPE_OPTIONS.map(opt => ({
          value: opt.value,
          label: opt.value,
          color: opt.color,
          icon: opt.icon
        }));
        break;
      case 'ActiveFutureArchived_Value':
        options = ACTIVE_FUTURE_ARCHIVED_OPTIONS.map(opt => ({
          value: opt.value,
          label: opt.value,
          color: opt.color
        }));
        break;
      case 'DiplomaMonthChoices_Value':
        options = DIPLOMA_MONTH_OPTIONS.map(opt => ({
          value: opt.value,
          label: opt.label,
          color: opt.color
        }));
        break;
      case 'CourseID':
        // CourseID is handled separately below
        break;
      default:
        // For any other fields, return null as we don't have predefined options
        return null;
    }

    let selectConfig = {
      options: options,
      components: {},
      styles: {
        option: (provided, state) => ({
          ...provided,
          color: state.data?.color || provided.color,
          backgroundColor: state.isSelected
            ? `${state.data?.color || '#6B7280'}15`
            : state.isFocused
            ? `${state.data?.color || '#6B7280'}10`
            : provided.backgroundColor,
        }),
        multiValue: (provided, state) => ({
          ...provided,
          backgroundColor: `${state.data?.color || '#6B7280'}15`,
        }),
        multiValueLabel: (provided, state) => ({
          ...provided,
          color: state.data?.color || provided.color,
        }),
        multiValueRemove: (provided, state) => ({
          ...provided,
          color: state.data?.color || provided.color,
          ':hover': {
            backgroundColor: `${state.data?.color || '#6B7280'}25`,
            color: state.data?.color || provided.color,
          },
        }),
      },
    };

    if (key === 'Status_Value') {
      selectConfig.components = { Option: StatusOption };
    } else if (key === 'StudentType_Value') {
      selectConfig.components = { Option: StudentTypeOption };
    } else if (key === 'CourseID') {
      selectConfig.components = {
        Option: CourseOption,
        MultiValue: ({ data, ...props }) => {
          const predefinedCourse = COURSE_OPTIONS.find(
            (opt) => String(opt.courseId) === String(data.value)
          );
          const Icon = predefinedCourse?.icon || BookOpen;
          return (
            <components.MultiValue {...props}>
              <div className="flex items-center">
                {Icon &&
                  React.createElement(Icon, {
                    className: 'w-3 h-3 mr-1',
                    style: { color: predefinedCourse?.color || '#6B7280' },
                  })}
                {data.label}
              </div>
            </components.MultiValue>
          );
        },
      };

      selectConfig.options = Object.entries(courseTitles)
        .map(([id, courseInfo]) => ({
          value: id,
          label: courseInfo.title,
          courseId: id,
          ...(courseInfo.predefinedCourse && {
            color: courseInfo.color,
            icon: courseInfo.icon,
            grade: courseInfo.grade,
            courseType: courseInfo.courseType,
          }),
        }))
        .sort((a, b) => {
          const gradeA = a.grade || 0;
          const gradeB = b.grade || 0;
          if (gradeA !== gradeB) return gradeA - gradeB;
          const typeA = a.courseType || '';
          const typeB = b.courseType || '';
          if (typeA !== typeB) return typeA.localeCompare(typeB);
          return a.label.localeCompare(b.label);
        })
        .filter((option) => option.label && !option.label.startsWith('Course '));
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
          value={selectConfig.options.filter((option) =>
            (currentFilters[key] || []).includes(option.value)
          )}
          onChange={(selectedOptions) => handleStatusFilterChange(key, selectedOptions)}
          className="flex-1"
          classNamePrefix="select"
          placeholder={`Select ${label.toLowerCase()}`}
          styles={selectConfig.styles}
          menuPlacement="auto"
          menuPosition="fixed"
        />
      </div>
    );
  };


  return (
    <Sheet>
      <SheetTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="h-9 relative">
            <FilterIcon className="h-4 w-4 mr-2" />
            Filters
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-2 bg-blue-500 text-white">
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] md:w-[800px]">
        <SheetHeader>
          <div className="flex justify-between items-center">
            <SheetTitle>Filters</SheetTitle>
            {getActiveFilterCount() > 0 && (
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
                <div className="flex items-center space-x-4">
                  <Label className="font-medium text-gray-700 min-w-[120px]">
                    Record Type
                  </Label>
                  <Select
                    options={RECORD_TYPE_OPTIONS}
                    components={{ Option: RecordTypeOption }}
                    value={getCurrentRecordType()[0] || null}
                    onChange={handleRecordTypeChange}
                    className="flex-1"
                    classNamePrefix="select"
                    placeholder="Select record type"
                    styles={{
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isSelected
                          ? `${state.data?.color || '#6B7280'}15`
                          : state.isFocused
                          ? `${state.data?.color || '#6B7280'}10`
                          : provided.backgroundColor,
                      }),
                      singleValue: (provided, state) => ({
                        ...provided,
                        color: '#374151', // Use a dark gray color for better visibility
                      }),
                    }}
                  />
                </div>

                {availableFilters.map((filter) => renderFilterOptions(filter))}
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
                    currentFilters.dateFilters?.created?.after ||
                      currentFilters.dateFilters?.created?.between?.start,
                    currentFilters.dateFilters?.created?.before ||
                      currentFilters.dateFilters?.created?.between?.end
                  )}
                />

                <DateRangeFilter
                  title="Schedule Start Date"
                  filterType="scheduleStart"
                  currentFilters={currentFilters}
                  onFilterChange={handleFiltersUpdate}
                  description={getFilterDescription(
                    'Schedule start',
                    currentFilters.dateFilters?.scheduleStart?.after ||
                      currentFilters.dateFilters?.scheduleStart?.between?.start,
                    currentFilters.dateFilters?.scheduleStart?.before ||
                      currentFilters.dateFilters?.scheduleStart?.between?.end
                  )}
                />

                <DateRangeFilter
                  title="Schedule End Date"
                  filterType="scheduleEnd"
                  currentFilters={currentFilters}
                  onFilterChange={handleFiltersUpdate}
                  description={getFilterDescription(
                    'Schedule end',
                    currentFilters.dateFilters?.scheduleEnd?.after ||
                      currentFilters.dateFilters?.scheduleEnd?.between?.start,
                    currentFilters.dateFilters?.scheduleEnd?.before ||
                      currentFilters.dateFilters?.scheduleEnd?.between?.end
                  )}
                />
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <SheetFooter className="mt-6">
          <div className="text-sm text-gray-500">
            {getActiveFilterCount()} active filter
            {getActiveFilterCount() !== 1 ? 's' : ''}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AdvancedFilters;