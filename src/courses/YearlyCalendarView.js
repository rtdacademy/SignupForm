import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { STUDENT_TYPE_OPTIONS } from '../config/DropdownOptions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { ChevronLeft, ChevronRight, CalendarIcon, Info, Home, Bookmark, SunIcon, GraduationCap, Globe, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

// Helper functions
const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

const formatDateForDisplay = (date) => {
  if (!date) return '';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Get registration periods for a specific month
const getRegistrationPeriodsForMonth = (year, month, events) => {
  if (!events || !Array.isArray(events)) {
    console.log("No events provided to getRegistrationPeriodsForMonth");
    return [];
  }
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const registrationPeriods = [];
  
  events.filter(event => event && event.type === 'Registration').forEach(event => {
    let startDate;
    if (event.displayDate) {
      const [startYear, startMonth, startDay] = event.displayDate.split('-').map(Number);
      startDate = new Date(startYear, startMonth - 1, startDay);
    } else if (event.date) {
      startDate = new Date(event.date);
    } else {
      return; 
    }
    
    let endDate;
    if (event.endDate) {
      if (event.endDateDisplayDate) {
        const [endYear, endMonth, endDay] = event.endDateDisplayDate.split('-').map(Number);
        endDate = new Date(endYear, endMonth - 1, endDay);
      } else {
        endDate = new Date(event.endDate);
      }
    } else {
      endDate = new Date(startDate);
    }
    
    if (event.recurring) {
      const recurringStart = new Date(year, startDate.getMonth(), startDate.getDate());
      const recurringEnd = new Date(year, endDate.getMonth(), endDate.getDate());
      
      if (recurringEnd < recurringStart) {
        recurringEnd.setFullYear(year + 1);
      }
      
      startDate = recurringStart;
      endDate = recurringEnd;
    }
    
    if (!(endDate < firstDay || startDate > lastDay)) {
      const visibleStartDate = startDate < firstDay ? firstDay : startDate;
      const visibleEndDate = endDate > lastDay ? lastDay : endDate;
      
      const startDay = visibleStartDate.getDate();
      const endDay = visibleEndDate.getDate();
      
      registrationPeriods.push({
        id: event.id || `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: event.title || 'Registration Period',
        startDay,
        endDay,
        startDate,
        endDate,
        continuesFromPreviousMonth: startDate < firstDay,
        continuesIntoNextMonth: endDate > lastDay,
        originalStartDate: startDate,
        originalEndDate: endDate,
        studentTypes: event.applicableStudentTypes || [],
        recurring: event.recurring || false,
        original: event
      });
    }
  });
  
  return registrationPeriods.sort((a, b) => a.startDay - b.startDay);
};

// Get student type info including icon
const getStudentTypeInfo = (type) => {
  const typeInfo = STUDENT_TYPE_OPTIONS.find(option => option.value === type) || {
    value: type,
    color: '#6B7280',
    icon: Bookmark
  };
  
  // Map student types to specific icons
  let IconComponent = typeInfo.icon || Bookmark;
  
  if (type === 'Home Education') {
    IconComponent = Home;
  } else if (type === 'Non-Primary') {
    IconComponent = Bookmark;
  } else if (type === 'Summer School') {
    IconComponent = SunIcon;
  } else if (type === 'Adult Student') {
    IconComponent = GraduationCap;
  } else if (type === 'International Student') {
    IconComponent = Globe;
  }
  
  return {
    ...typeInfo,
    icon: IconComponent
  };
};

const YearlyCalendarView = ({ dates = [], year: initialYear = new Date().getFullYear() }) => {
  const [registrationDates, setRegistrationDates] = useState([]);
  const [selectedStudentType, setSelectedStudentType] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('');
  const [selectionComplete, setSelectionComplete] = useState(false);
  const today = new Date();
  const currentYear = initialYear;
  
  // Process dates effect - ensure we're only using registration dates
  useEffect(() => {
    if (!dates || !Array.isArray(dates)) {
      console.warn("YearlyCalendarView received invalid dates prop:", dates);
      setRegistrationDates([]);
      return;
    }
    
    const filtered = dates.filter(date => date && date.type === 'Registration');
    console.log("Filtered registration dates:", filtered);
    setRegistrationDates(filtered);
  }, [dates]);
  
  // Get unique student types from all registration dates
  const uniqueStudentTypes = useMemo(() => {
    if (!registrationDates || !registrationDates.length) return [];
    
    const typesSet = new Set();
    
    registrationDates.forEach(date => {
      if (!date) return;
      
      const types = date.applicableStudentTypes || [];
      if (types.length === 0 || types.length === STUDENT_TYPE_OPTIONS.length) {
        // If no types specified, it applies to all
        STUDENT_TYPE_OPTIONS.forEach(option => typesSet.add(option.value));
      } else {
        types.forEach(type => typesSet.add(type));
      }
    });
    
    return Array.from(typesSet);
  }, [registrationDates]);
  
  // Get unique event categories (titles)
  const uniqueEventCategories = useMemo(() => {
    if (!registrationDates || !registrationDates.length) return [];
    
    const categoriesSet = new Set();
    
    registrationDates.forEach(date => {
      if (date && date.title) {
        categoriesSet.add(date.title);
      }
    });
    
    return Array.from(categoriesSet);
  }, [registrationDates]);
  
  // Get filtered event types based on selected student type
  const filteredEventTypes = useMemo(() => {
    if (!selectedStudentType) return [];
    
    return uniqueEventCategories.filter(eventType => {
      // Find events of this type that apply to the selected student type
      return registrationDates.some(date => 
        date.title === eventType && 
        (date.applicableStudentTypes?.includes(selectedStudentType) || 
         date.applicableStudentTypes?.length === 0 || 
         date.applicableStudentTypes?.length === STUDENT_TYPE_OPTIONS.length)
      );
    });
  }, [selectedStudentType, uniqueEventCategories, registrationDates]);
  
  // Filter registration dates based on selected student type and event type
  const filteredDates = useMemo(() => {
    if (!selectedStudentType || !selectedEventType) return [];
    
    return registrationDates.filter(date => {
      if (!date) return false;
      
      // Check event type match
      if (date.title !== selectedEventType) return false;
      
      // Check student type match
      const types = date.applicableStudentTypes || [];
      if (types.length === 0 || types.length === STUDENT_TYPE_OPTIONS.length) {
        // If applies to all, it matches any selected type
        return true;
      }
      
      return types.includes(selectedStudentType);
    });
  }, [registrationDates, selectedStudentType, selectedEventType]);
  
  // Get registration periods for the entire year (all months)
  const yearlyPeriods = useMemo(() => {
    // Array to hold periods for all 12 months
    const allMonthsPeriods = [];
    
    // Get periods for each month
    for (let month = 0; month < 12; month++) {
      const periodsForMonth = getRegistrationPeriodsForMonth(currentYear, month, filteredDates);
      allMonthsPeriods.push({
        month,
        periods: periodsForMonth
      });
    }
    
    return allMonthsPeriods;
  }, [currentYear, filteredDates]);
  
  // Handle selection changes
  const handleStudentTypeChange = (value) => {
    setSelectedStudentType(value);
    // Reset event type when student type changes
    setSelectedEventType('');
    setSelectionComplete(false);
  };
  
  const handleEventTypeChange = (value) => {
    setSelectedEventType(value);
  };
  
  const applyFilters = () => {
    if (selectedStudentType && selectedEventType) {
      setSelectionComplete(true);
    }
  };
  
  const resetFilters = () => {
    setSelectedStudentType('');
    setSelectedEventType('');
    setSelectionComplete(false);
  };
  
  // Render a single month in the yearly view
  const renderMonth = (month, periodsForMonth) => {
    const monthName = new Date(currentYear, month).toLocaleDateString('en-US', { month: 'short' });
    const daysInMonth = getDaysInMonth(currentYear, month);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, month);
    
    // Create array for days in month
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    // Create array for blank spaces before first day
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => `blank-${i}`);
    
    // Combine blank spaces and days
    const calendarDays = [...blanks, ...days];
    
    // Check if this is the current month
    const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() === month;
    const currentDate = today.getDate();
    
    // Get the student type info for styling
    const typeInfo = getStudentTypeInfo(selectedStudentType);
    
    // Function to determine if a day is the start or end of any period
    const getDayStatus = (day) => {
      let isStart = false;
      let isEnd = false;
      let continuesFromPrevious = false;
      let continuesIntoNext = false;
      let isPartOfPeriod = false;
      
      for (const period of periodsForMonth) {
        if (day === period.startDay && day === period.endDay) {
          // Single day period
          isStart = true;
          isEnd = true;
          isPartOfPeriod = true;
        } else if (day === period.startDay) {
          isStart = true;
          continuesIntoNext = day === daysInMonth && period.continuesIntoNextMonth;
          isPartOfPeriod = true;
        } else if (day === period.endDay) {
          isEnd = true;
          continuesFromPrevious = day === 1 && period.continuesFromPreviousMonth;
          isPartOfPeriod = true;
        } else if (day > period.startDay && day < period.endDay) {
          isPartOfPeriod = true;
        }
      }
      
      return { isStart, isEnd, continuesFromPrevious, continuesIntoNext, isPartOfPeriod };
    };
    
    return (
      <div key={`month-${month}`} className="mb-1 overflow-hidden">
        <h3 className="text-sm font-medium mb-1 text-center">{monthName}</h3>
        <div className="grid grid-cols-7 gap-0 text-center text-xs">
          {/* Abbreviated day headers */}
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={`header-${month}-${i}`} className="text-gray-600 p-1">
              {day}
            </div>
          ))}
          
          {/* Calendar grid */}
          {calendarDays.map((day, i) => {
            // For blank spaces
            if (typeof day === 'string' && day.startsWith('blank')) {
              return (
                <div 
                  key={`${month}-${day}`} 
                  className="p-1 h-6"
                />
              );
            }
            
            // Check if this is today
            const isToday = isCurrentMonth && day === currentDate;
            
            // Get status for this day
            const { isStart, isEnd, continuesFromPrevious, continuesIntoNext, isPartOfPeriod } = getDayStatus(day);
            
            // Determine the column position (0-6) for CSS grid styling
            const colPosition = (firstDayOfMonth + day - 1) % 7;
            const isFirstInRow = colPosition === 0;
            const isLastInRow = colPosition === 6;
            
            // Create custom classes for the line spans
            let lineClasses = '';
            if (isPartOfPeriod) {
              if (isStart && isEnd) {
                // Single day event
                lineClasses = 'bg-current rounded-full';
              } else if (isStart) {
                lineClasses = `bg-current ${isLastInRow ? 'rounded-l-full' : 'rounded-l-full border-r-0'}`;
              } else if (isEnd) {
                lineClasses = `bg-current ${isFirstInRow ? 'rounded-r-full' : 'rounded-r-full border-l-0'}`;
              } else {
                // Middle of period
                lineClasses = 'bg-current';
                if (isFirstInRow) {
                  lineClasses += ' rounded-l-none';
                }
                if (isLastInRow) {
                  lineClasses += ' rounded-r-none';
                }
              }
            }
            
            // Generate tooltip content for this day
            const periodsForDay = periodsForMonth.filter(
              period => day >= period.startDay && day <= period.endDay
            );
            
            return (
              <div 
                key={`${month}-day-${day}`}
                className={`relative p-0 h-6 ${
                  isToday ? 'bg-blue-100' : ''
                }`}
              >
                {/* Day number */}
                <div className={`text-xs z-10 relative ${isPartOfPeriod ? 'font-bold' : ''}`}>
                  {day}
                </div>
                
                {/* Event line/indicator */}
                {isPartOfPeriod && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`absolute left-0 right-0 h-1 top-4 ${lineClasses}`}
                          style={{ 
                            color: typeInfo.color,
                            opacity: 0.8
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs font-medium">
                          {selectedEventType}
                        </div>
                        <div className="text-xs">
                          {periodsForDay.map((period, idx) => (
                            <div key={idx}>
                              {formatDateForDisplay(period.originalStartDate)} to {formatDateForDisplay(period.originalEndDate)}
                            </div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                {/* Special indicator for periods continuing from/to other months */}
                {(continuesFromPrevious || continuesIntoNext) && (
                  <div 
                    className={`absolute ${continuesFromPrevious ? 'left-0' : 'right-0'} top-4 h-1 w-1 rounded-full`}
                    style={{ backgroundColor: typeInfo.color }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Render the selection form
  const renderSelectionForm = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Registration Period View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Student Type Selection */}
            <div>
              <label className="block text-sm font-medium mb-1">Student Type</label>
              <Select value={selectedStudentType} onValueChange={handleStudentTypeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a student type" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueStudentTypes.map(type => {
                    const typeInfo = getStudentTypeInfo(type);
                    const IconComponent = typeInfo.icon;
                    
                    return (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center gap-2">
                          <IconComponent 
                            className="h-4 w-4" 
                            style={{ color: typeInfo.color }}
                          />
                          <span>{type}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            {/* Event Type Selection - only enabled if student type is selected */}
            <div>
              <label className="block text-sm font-medium mb-1">Registration Period</label>
              <Select 
                value={selectedEventType} 
                onValueChange={handleEventTypeChange}
                disabled={!selectedStudentType}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={selectedStudentType ? "Select a registration period" : "Select a student type first"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredEventTypes.map(eventType => (
                    <SelectItem key={eventType} value={eventType}>
                      {eventType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={applyFilters} 
                disabled={!selectedStudentType || !selectedEventType}
                className="flex-1"
              >
                <Filter className="h-4 w-4 mr-2" />
                View Calendar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // Render the full year calendar view
  const renderYearlyCalendar = () => {
    if (!selectionComplete) return null;
    
    const studentTypeInfo = getStudentTypeInfo(selectedStudentType);
    const IconComponent = studentTypeInfo.icon;
    
    // Count total events
    const totalEvents = filteredDates.length;
    
    return (
      <div>
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">{currentYear} Registration Calendar</CardTitle>
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Change Selection
              </Button>
            </div>
            <div className="flex items-center mt-2 gap-2">
              <Badge 
                className="flex items-center gap-1"
                style={{
                  backgroundColor: studentTypeInfo.color,
                  color: 'white'
                }}
              >
                <IconComponent className="h-3 w-3" />
                <span>{selectedStudentType}</span>
              </Badge>
              <Badge>
                {selectedEventType}
              </Badge>
              <div className="text-xs text-gray-500 ml-2">
                {totalEvents} registration period{totalEvents !== 1 ? 's' : ''}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {yearlyPeriods.map(({ month, periods }) => (
                <div key={`month-container-${month}`} className="border rounded-md p-2">
                  {renderMonth(month, periods)}
                </div>
              ))}
            </div>
            
            {/* Legend for the calendar */}
            <div className="mt-4 flex items-center gap-4 justify-center text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <div 
                  className="h-2 w-6 rounded-full" 
                  style={{ backgroundColor: studentTypeInfo.color }}
                />
                <span>Registration Period</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Period Details Section */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Registration Period Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDates.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {filteredDates.map(event => {
                  const isSingleDay = !event.endDate;
                  
                  return (
                    <Card key={event.id || event.title} className="overflow-hidden">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-sm">{event.title}</h3>
                            <div className="text-xs text-gray-600 mt-1">
                              {formatDateForDisplay(new Date(event.date || event.displayDate))}
                              {!isSingleDay && event.endDate && 
                                ` to ${formatDateForDisplay(new Date(event.endDate || event.endDateDisplayDate))}`
                              }
                            </div>
                            {event.recurring && (
                              <Badge variant="outline" className="mt-1 text-xs">Annual</Badge>
                            )}
                          </div>
                          <Badge 
                            variant="outline" 
                            className="text-xs flex items-center gap-1"
                            style={{
                              borderColor: studentTypeInfo.color,
                              color: studentTypeInfo.color,
                              backgroundColor: `${studentTypeInfo.color}10`
                            }}
                          >
                            <IconComponent className="h-3 w-3" />
                            <span>{selectedStudentType}</span>
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 border rounded-md bg-gray-50 text-gray-500 text-center">
                No registration periods found for the selected criteria
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      {!selectionComplete && renderSelectionForm()}
      {renderYearlyCalendar()}
      
      {/* No data message */}
      {selectionComplete && filteredDates.length === 0 && (
        <div className="mt-4 p-3 border border-amber-200 bg-amber-50 rounded-md">
          <p className="text-amber-700 text-sm flex items-center">
            <Info className="h-4 w-4 mr-2" />
            No registration periods found for the selected student type and registration period.
          </p>
        </div>
      )}
    </div>
  );
};

export default YearlyCalendarView;