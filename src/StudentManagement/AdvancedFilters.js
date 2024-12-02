import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
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

const DateRangeFilter = ({ 
  title, 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange,
  description 
}) => (
  <div className="space-y-2">
    <h3 className="font-medium text-gray-700">{title}</h3>
    <div className="flex space-x-2">
      <DatePicker
        selected={startDate}
        onChange={onStartDateChange}
        selectsStart
        startDate={startDate}
        endDate={endDate}
        customInput={
          <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDate ? format(startDate, 'MMM d, yyyy') : 'Start date'}
          </Button>
        }
        dateFormat="MM/dd/yyyy"
      />
      <DatePicker
        selected={endDate}
        onChange={onEndDateChange}
        selectsEnd
        startDate={startDate}
        endDate={endDate}
        minDate={startDate}
        customInput={
          <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {endDate ? format(endDate, 'MMM d, yyyy') : 'End date'}
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

const AdvancedFilters = ({ 
  onFilterChange, 
  currentFilters,
  availableFilters,
  filterOptions,
  studentSummaries 
}) => {
  // Date filter states
  const [createdStartDate, setCreatedStartDate] = useState(null);
  const [createdEndDate, setCreatedEndDate] = useState(null);
  const [scheduleStartStartDate, setScheduleStartStartDate] = useState(null);
  const [scheduleStartEndDate, setScheduleStartEndDate] = useState(null);
  const [scheduleEndStartDate, setScheduleEndStartDate] = useState(null);
  const [scheduleEndEndDate, setScheduleEndEndDate] = useState(null);

  // Migration status state
  const [migrationStatus, setMigrationStatus] = useState('all');

  useEffect(() => {
    const dateFilters = currentFilters.dateFilters || {};
    if (Object.keys(dateFilters).length === 0) {
      setCreatedStartDate(null);
      setCreatedEndDate(null);
      setScheduleStartStartDate(null);
      setScheduleStartEndDate(null);
      setScheduleEndStartDate(null);
      setScheduleEndEndDate(null);
    }
  }, [currentFilters]);

  const getActiveFilterCount = () => {
    let count = 0;
    const dateFilters = currentFilters.dateFilters || {};
    if (dateFilters.created && Object.keys(dateFilters.created).length) count++;
    if (dateFilters.scheduleStart && Object.keys(dateFilters.scheduleStart).length) count++;
    if (dateFilters.scheduleEnd && Object.keys(dateFilters.scheduleEnd).length) count++;
    if (currentFilters.hasSchedule?.length > 0) count++;
    Object.keys(currentFilters).forEach(key => {
      if (Array.isArray(currentFilters[key]) && currentFilters[key].length > 0) count++;
    });
    return count;
  };

  // Migration status handler
  const handleMigrationStatusChange = (value) => {
    const hasSchedule = value === 'all' ? [] : 
                       value === 'migrated' ? [true] : 
                       [false];
    onFilterChange({
      ...currentFilters,
      hasSchedule
    });
    setMigrationStatus(value);
  };

  // Status filter handler
  const handleStatusFilterChange = (key, selectedOptions) => {
    onFilterChange({
      ...currentFilters,
      [key]: selectedOptions ? selectedOptions.map(option => option.value) : []
    });
  };

  // Date filter handlers
  const updateFilters = (type, start, end) => {
    let dateFilter = {};
    if (start && end) {
      dateFilter = { between: { start, end } };
    } else if (start) {
      dateFilter = { after: start };
    } else if (end) {
      dateFilter = { before: end };
    }

    onFilterChange({
      ...currentFilters,
      dateFilters: {
        ...currentFilters.dateFilters,
        [type]: Object.keys(dateFilter).length > 0 ? dateFilter : undefined
      }
    });
  };

  const getFilterDescription = (type, startDate, endDate) => {
    if (!startDate && !endDate) return null;
    
    const dateString = (date) => format(date, 'MMM d, yyyy');
    
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
    // Clear date filters
    setCreatedStartDate(null);
    setCreatedEndDate(null);
    setScheduleStartStartDate(null);
    setScheduleStartEndDate(null);
    setScheduleEndStartDate(null);
    setScheduleEndEndDate(null);
    
    // Clear migration status
    setMigrationStatus('all');
    
    // Clear all filters
    const clearedFilters = Object.keys(currentFilters).reduce(
      (acc, key) => ({
        ...acc,
        [key]: key === 'dateFilters' ? {} : [],
      }),
      {}
    );
    
    onFilterChange(clearedFilters);
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Sheet>
      <SheetTrigger asChild>
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
                {/* Migration Status Section - adjusted spacing */}
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

                {/* Status Filters Section - adjusted spacing */}
                {availableFilters.map(({ key, label }) => {
                  if (key === 'categories') return null;
                  return (
                    <div key={key} className="flex items-center space-x-4">
                      <Label className="font-medium text-gray-700 min-w-[120px]">
                        {label}
                      </Label>
                      <Select
                        isMulti
                        name={key}
                        options={filterOptions[key]}
                        value={filterOptions[key]?.filter(option => 
                          (currentFilters[key] || []).includes(option.value) ||
                          ((currentFilters[key] || []).includes('') && option.value === '')
                        )}
                        onChange={(selectedOptions) => handleStatusFilterChange(key, selectedOptions)}
                        className="flex-1"
                        classNamePrefix="select"
                        placeholder={`Select ${label.toLowerCase()}`}
                      />
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="dates" className="mt-0">
              <div className="space-y-6">
                {/* Date Range Filters */}
                <DateRangeFilter
                  title="Created Date"
                  startDate={createdStartDate}
                  endDate={createdEndDate}
                  onStartDateChange={(date) => {
                    setCreatedStartDate(date);
                    updateFilters('created', date, createdEndDate);
                  }}
                  onEndDateChange={(date) => {
                    setCreatedEndDate(date);
                    updateFilters('created', createdStartDate, date);
                  }}
                  description={getFilterDescription('Created', createdStartDate, createdEndDate)}
                />

                <DateRangeFilter
                  title="Schedule Start Date"
                  startDate={scheduleStartStartDate}
                  endDate={scheduleStartEndDate}
                  onStartDateChange={(date) => {
                    setScheduleStartStartDate(date);
                    updateFilters('scheduleStart', date, scheduleStartEndDate);
                  }}
                  onEndDateChange={(date) => {
                    setScheduleStartEndDate(date);
                    updateFilters('scheduleStart', scheduleStartStartDate, date);
                  }}
                  description={getFilterDescription('Schedule start', scheduleStartStartDate, scheduleStartEndDate)}
                />

                <DateRangeFilter
                  title="Schedule End Date"
                  startDate={scheduleEndStartDate}
                  endDate={scheduleEndEndDate}
                  onStartDateChange={(date) => {
                    setScheduleEndStartDate(date);
                    updateFilters('scheduleEnd', date, scheduleEndEndDate);
                  }}
                  onEndDateChange={(date) => {
                    setScheduleEndEndDate(date);
                    updateFilters('scheduleEnd', scheduleEndStartDate, date);
                  }}
                  description={getFilterDescription('Schedule end', scheduleEndStartDate, scheduleEndEndDate)}
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
