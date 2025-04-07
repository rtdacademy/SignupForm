import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { STUDENT_TYPE_OPTIONS } from '../config/DropdownOptions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { ChevronLeft, ChevronRight, CalendarIcon, Info, Home, Bookmark, SunIcon, GraduationCap, Globe, Filter, Calendar } from 'lucide-react';

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

// Get periods for a specific month from any calendar type
const getPeriodsForMonth = (year, month, events, options = { eventType: null, filterField: null }) => {
  if (!events || !Array.isArray(events)) {
    return [];
  }
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const periods = [];
  
  const filteredEvents = options.eventType 
    ? events.filter(event => event && event.type === options.eventType)
    : events;
  
  filteredEvents.forEach(event => {
    let startDate;
    if (event.startDate) {
      startDate = new Date(event.startDate);
    } else if (event.displayDate) {
      const [startYear, startMonth, startDay] = event.displayDate.split('-').map(Number);
      startDate = new Date(startYear, startMonth - 1, startDay);
    } else if (event.date) {
      startDate = new Date(event.date);
    } else {
      return; 
    }
    
    let endDate;
    if (event.endDate) {
      if (typeof event.endDate === 'string') {
        endDate = new Date(event.endDate);
      } else if (event.endDateDisplayDate) {
        const [endYear, endMonth, endDay] = event.endDateDisplayDate.split('-').map(Number);
        endDate = new Date(endYear, endMonth - 1, endDay);
      } 
    } 
    
    // If no end date, use start date (single day event)
    if (!endDate) {
      endDate = new Date(startDate);
    }
    
    // Handle recurring events
    if (event.recurring) {
      const recurringStart = new Date(year, startDate.getMonth(), startDate.getDate());
      const recurringEnd = new Date(year, endDate.getMonth(), endDate.getDate());
      
      if (recurringEnd < recurringStart) {
        recurringEnd.setFullYear(year + 1);
      }
      
      startDate = recurringStart;
      endDate = recurringEnd;
    }
    
    // Check if the event falls within this month
    if (!(endDate < firstDay || startDate > lastDay)) {
      const visibleStartDate = startDate < firstDay ? firstDay : startDate;
      const visibleEndDate = endDate > lastDay ? lastDay : endDate;
      
      const startDay = visibleStartDate.getDate();
      const endDay = visibleEndDate.getDate();
      
      periods.push({
        id: event.id || `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: event.title || event.summary || 'Event',
        startDay,
        endDay,
        startDate,
        endDate,
        continuesFromPreviousMonth: startDate < firstDay,
        continuesIntoNextMonth: endDate > lastDay,
        originalStartDate: startDate,
        originalEndDate: endDate,
        color: event.color || '#4f46e5', // Default indigo color
        studentTypes: event.applicableStudentTypes || [],
        recurring: event.recurring || false,
        original: event
      });
    }
  });
  
  return periods.sort((a, b) => a.startDay - b.startDay);
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

const YearlyCalendarView = ({ 
  year: initialYear = new Date().getFullYear(),
  title = "Calendar View",
  filteredDates = [],
  selectedStudentType = '',
  selectedEventType = '',
  selectedEventSource = 'registration',
  selectionComplete = false,
  courses = {}
}) => {
  const today = new Date();
  const currentYear = initialYear;
  
  // Get periods for the entire year (all months)
  const yearlyPeriods = useMemo(() => {
    // Array to hold periods for all 12 months
    const allMonthsPeriods = [];
    
    // Options for getPeriodsForMonth
    const options = selectedEventSource === 'registration' 
      ? { eventType: 'Registration' } 
      : {};
    
    // Get periods for each month
    for (let month = 0; month < 12; month++) {
      const periodsForMonth = getPeriodsForMonth(currentYear, month, filteredDates, options);
      allMonthsPeriods.push({
        month,
        periods: periodsForMonth
      });
    }
    
    return allMonthsPeriods;
  }, [currentYear, filteredDates, selectedEventSource]);
  
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
    
    // Get the color info (student type or calendar color)
    let colorInfo = { color: '#4f46e5' }; // Default indigo
    
    if (selectedEventSource === 'registration' && selectedStudentType) {
      colorInfo = getStudentTypeInfo(selectedStudentType);
    }
    
    // Function to determine if a day is the start or end of any period
    const getDayStatus = (day) => {
      let isStart = false;
      let isEnd = false;
      let continuesFromPrevious = false;
      let continuesIntoNext = false;
      let isPartOfPeriod = false;
      let periodColor = colorInfo.color;
      
      for (const period of periodsForMonth) {
        if (day === period.startDay && day === period.endDay) {
          // Single day period
          isStart = true;
          isEnd = true;
          isPartOfPeriod = true;
          periodColor = period.color || colorInfo.color;
        } else if (day === period.startDay) {
          isStart = true;
          continuesIntoNext = day === daysInMonth && period.continuesIntoNextMonth;
          isPartOfPeriod = true;
          periodColor = period.color || colorInfo.color;
        } else if (day === period.endDay) {
          isEnd = true;
          continuesFromPrevious = day === 1 && period.continuesFromPreviousMonth;
          isPartOfPeriod = true;
          periodColor = period.color || colorInfo.color;
        } else if (day > period.startDay && day < period.endDay) {
          isPartOfPeriod = true;
          periodColor = period.color || colorInfo.color;
        }
      }
      
      return { isStart, isEnd, continuesFromPrevious, continuesIntoNext, isPartOfPeriod, periodColor };
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
            const { isStart, isEnd, continuesFromPrevious, continuesIntoNext, isPartOfPeriod, periodColor } = getDayStatus(day);
            
            // Determine the column position (0-6) for CSS grid styling
            const colPosition = (firstDayOfMonth + day - 1) % 7;
            const isFirstInRow = colPosition === 0;
            const isLastInRow = colPosition === 6;
            
            // Create custom classes for the line spans
            let lineClasses = '';
            if (isPartOfPeriod) {
              if (isStart && isEnd) {
                // Single day event
                lineClasses = 'rounded-full';
              } else if (isStart) {
                lineClasses = `${isLastInRow ? 'rounded-l-full' : 'rounded-l-full border-r-0'}`;
              } else if (isEnd) {
                lineClasses = `${isFirstInRow ? 'rounded-r-full' : 'rounded-r-full border-l-0'}`;
              } else {
                // Middle of period
                lineClasses = '';
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
                            backgroundColor: periodColor,
                            opacity: 0.8
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs font-medium">
                          {periodsForDay.map((period, idx) => (
                            <div key={idx} className="font-medium">{period.title}</div>
                          ))}
                        </div>
                        <div className="text-xs">
                          {periodsForDay.map((period, idx) => (
                            <div key={`date-${idx}`}>
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
                    style={{ backgroundColor: periodColor }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Render the full year calendar view
  const renderYearlyCalendar = () => {
    if (!selectionComplete) return null;
    
    let headerInfo;
    
    if (selectedEventSource === 'registration' && selectedStudentType) {
      const studentTypeInfo = getStudentTypeInfo(selectedStudentType);
      const IconComponent = studentTypeInfo.icon;
      
      headerInfo = (
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
            {filteredDates.length} period{filteredDates.length !== 1 ? 's' : ''}
          </div>
        </div>
      );
    } else if (selectedEventSource === 'icsCalendars') {
      headerInfo = (
        <div className="flex items-center mt-2 gap-2">
          <Badge className="flex items-center gap-1">
            <Calendar className="h-3 w-3 mr-1" />
            {/* Calendar name would go here */}
          </Badge>
          <div className="text-xs text-gray-500 ml-2">
            {filteredDates.length} event{filteredDates.length !== 1 ? 's' : ''}
          </div>
        </div>
      );
    }
    
    return (
      <div>
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">{currentYear} {title}</CardTitle>
            </div>
            {headerInfo}
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
                  style={{ 
                    backgroundColor: selectedEventSource === 'registration' && selectedStudentType 
                      ? getStudentTypeInfo(selectedStudentType).color 
                      : '#4f46e5'
                  }}
                />
                <span>
                  {selectedEventSource === 'registration' ? 'Registration Period' : 'Calendar Event'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Period/Event Details Section */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              {selectedEventSource === 'registration' ? 'Registration Period Details' : 'Calendar Event Details'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDates.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {filteredDates.map(event => {
                  // Determine if it's a single day event
                  let startDate, endDate, isSingleDay;
                  
                  if (event.startDate && event.endDate) {
                    startDate = new Date(event.startDate);
                    endDate = new Date(event.endDate);
                    
                    // Check if it's the same day (for ICS events)
                    const startDay = startDate.getDate();
                    const startMonth = startDate.getMonth();
                    const startYear = startDate.getFullYear();
                    
                    const endDay = endDate.getDate();
                    const endMonth = endDate.getMonth();
                    const endYear = endDate.getFullYear();
                    
                    isSingleDay = startDay === endDay && startMonth === endMonth && startYear === endYear;
                  } else {
                    startDate = new Date(event.date || event.displayDate);
                    endDate = event.endDate ? new Date(event.endDate || event.endDateDisplayDate) : null;
                    isSingleDay = !endDate;
                  }
                  
                  return (
                    <Card key={event.id || event.title} className="overflow-hidden">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-sm">{event.title || event.summary}</h3>
                            <div className="text-xs text-gray-600 mt-1">
                              {formatDateForDisplay(startDate)}
                              {!isSingleDay && endDate && 
                                ` to ${formatDateForDisplay(endDate)}`
                              }
                            </div>
                            {event.recurring && (
                              <Badge variant="outline" className="mt-1 text-xs">Annual</Badge>
                            )}
                            {selectedEventSource === 'icsCalendars' && event.calendarName && (
                              <div className="text-xs text-gray-500 mt-1">
                                Calendar: {event.calendarName}
                              </div>
                            )}
                          </div>
                          {selectedEventSource === 'registration' && selectedStudentType && (
                            <Badge 
                              variant="outline" 
                              className="text-xs flex items-center gap-1"
                              style={{
                                borderColor: getStudentTypeInfo(selectedStudentType).color,
                                color: getStudentTypeInfo(selectedStudentType).color,
                                backgroundColor: `${getStudentTypeInfo(selectedStudentType).color}10`
                              }}
                            >
                              {(() => {
                                const typeInfo = getStudentTypeInfo(selectedStudentType);
                                const IconComponent = typeInfo.icon;
                                return <IconComponent className="h-3 w-3" />;
                              })()}
                              <span>{selectedStudentType}</span>
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 border rounded-md bg-gray-50 text-gray-500 text-center">
                No events found for the selected criteria
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      {renderYearlyCalendar()}
      
      {/* No data message */}
      {selectionComplete && filteredDates.length === 0 && (
        <div className="mt-4 p-3 border border-amber-200 bg-amber-50 rounded-md">
          <p className="text-amber-700 text-sm flex items-center">
            <Info className="h-4 w-4 mr-2" />
            No events found for the selected criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default YearlyCalendarView;