import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Filter, Calendar as CalendarIcon } from 'lucide-react';
import { STUDENT_TYPE_OPTIONS } from '../config/DropdownOptions';
import YearlyCalendarView from './YearlyCalendarView';

// Transform ICS calendar events to compatible format
const transformIcsEvents = (calendar) => {
  if (!calendar || !calendar.events) return [];
  
  return calendar.events.map(event => ({
    id: `ics-${Math.random().toString(36).substr(2, 9)}`,
    title: event.summary,
    startDate: event.startDate,
    endDate: event.endDate,
    color: '#3b82f6', // Blue color for ICS events
    calendarName: calendar.name
  }));
};

const CalendarSelector = ({ 
  dates = [], 
  icsCalendars = [],
  year = new Date().getFullYear(),
  title = "Calendar View",
  defaultView = "registration",
  showFilters = true,
  courses = {}
}) => {
  const [selectedEventSource, setSelectedEventSource] = useState(defaultView);
  const [selectedCalendar, setSelectedCalendar] = useState('');
  const [processedDates, setProcessedDates] = useState([]);
  const [selectedStudentType, setSelectedStudentType] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('');
  const [selectionComplete, setSelectionComplete] = useState(false);
  
  // Available calendar sources
  const calendarSources = [
    { id: 'registration', label: 'Registration Periods', filterType: 'studentType' },
    { id: 'icsCalendars', label: 'ICS Calendars', filterType: 'calendar' }
  ];
  
  // Process dates effect based on selected source
  useEffect(() => {
    if (selectedEventSource === 'registration') {
      if (!dates || !Array.isArray(dates)) {
        setProcessedDates([]);
        return;
      }
      
      const filtered = dates.filter(date => date && date.type === 'Registration');
      setProcessedDates(filtered);
      setSelectionComplete(false);
    } else if (selectedEventSource === 'icsCalendars') {
      // When ICS is selected, clear student type filters
      setSelectedStudentType('');
      setSelectedEventType('');
      
      if (selectedCalendar && icsCalendars && icsCalendars.length > 0) {
        const calendar = icsCalendars.find(cal => cal.name === selectedCalendar);
        if (calendar) {
          const transformedEvents = transformIcsEvents(calendar);
          setProcessedDates(transformedEvents);
          setSelectionComplete(true);
        } else {
          setProcessedDates([]);
          setSelectionComplete(false);
        }
      } else {
        setProcessedDates([]);
        setSelectionComplete(false);
      }
    }
  }, [dates, icsCalendars, selectedEventSource, selectedCalendar]);
  
  // Get unique student types from registration dates
  const uniqueStudentTypes = useMemo(() => {
    if (selectedEventSource !== 'registration' || !processedDates || !processedDates.length) return [];
    
    const typesSet = new Set();
    
    processedDates.forEach(date => {
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
  }, [processedDates, selectedEventSource]);
  
  // Get unique event categories (titles) for registration dates
  const uniqueEventCategories = useMemo(() => {
    if (selectedEventSource !== 'registration' || !processedDates || !processedDates.length) return [];
    
    const categoriesSet = new Set();
    
    processedDates.forEach(date => {
      if (date && date.title) {
        categoriesSet.add(date.title);
      }
    });
    
    return Array.from(categoriesSet);
  }, [processedDates, selectedEventSource]);
  
  // Get available ICS calendars
  const availableIcsCalendars = useMemo(() => {
    return icsCalendars.map(calendar => calendar.name) || [];
  }, [icsCalendars]);
  
  // Get filtered event types based on selected student type
  const filteredEventTypes = useMemo(() => {
    if (selectedEventSource !== 'registration' || !selectedStudentType) return [];
    
    return uniqueEventCategories.filter(eventType => {
      // Find events of this type that apply to the selected student type
      return processedDates.some(date => 
        date.title === eventType && 
        (date.applicableStudentTypes?.includes(selectedStudentType) || 
         date.applicableStudentTypes?.length === 0 || 
         date.applicableStudentTypes?.length === STUDENT_TYPE_OPTIONS.length)
      );
    });
  }, [selectedStudentType, uniqueEventCategories, processedDates, selectedEventSource]);
  
  // Filter dates based on selected criteria
  const filteredDates = useMemo(() => {
    if (selectedEventSource === 'registration') {
      if (!selectedStudentType || !selectedEventType) return [];
      
      return processedDates.filter(date => {
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
    } else if (selectedEventSource === 'icsCalendars') {
      // For ICS calendars, we already filtered by calendar in the useEffect
      return processedDates;
    }
    
    return [];
  }, [processedDates, selectedStudentType, selectedEventType, selectedEventSource]);
  
  // Handle selection changes
  const handleEventSourceChange = (value) => {
    setSelectedEventSource(value);
    setSelectedStudentType('');
    setSelectedEventType('');
    setSelectedCalendar('');
    setSelectionComplete(false);
  };
  
  const handleStudentTypeChange = (value) => {
    setSelectedStudentType(value);
    // Reset event type when student type changes
    setSelectedEventType('');
    setSelectionComplete(false);
  };
  
  const handleEventTypeChange = (value) => {
    setSelectedEventType(value);
  };
  
  const handleCalendarChange = (value) => {
    setSelectedCalendar(value);
  };
  
  const applyFilters = () => {
    if (selectedEventSource === 'registration' && selectedStudentType && selectedEventType) {
      setSelectionComplete(true);
    } else if (selectedEventSource === 'icsCalendars' && selectedCalendar) {
      setSelectionComplete(true);
    }
  };
  
  const resetFilters = () => {
    setSelectedStudentType('');
    setSelectedEventType('');
    setSelectedCalendar('');
    setSelectionComplete(false);
  };
  
  // Calendar source button component
  const CalendarSourceButton = ({ source, isSelected, onClick }) => (
    <Button
      variant={isSelected ? "default" : "outline"}
      className={`flex flex-1 items-center justify-center h-16 p-4 gap-2 transition-all`}
      onClick={onClick}
    >
      <CalendarIcon className="h-5 w-5" />
      <span>{source.label}</span>
    </Button>
  );
  
  // Student type card component
  const StudentTypeCard = ({ type, isSelected, onClick }) => {
    const typeInfo = STUDENT_TYPE_OPTIONS.find(option => option.value === type) || {
      value: type,
      color: '#6B7280',
      icon: null
    };
    
    const Icon = typeInfo.icon;
    
    return (
      <div
        className={`flex flex-col items-center p-4 rounded-lg cursor-pointer transition-all ${
          isSelected 
            ? 'bg-opacity-90 ring-2 ring-offset-2 shadow-md scale-105' 
            : 'bg-opacity-70 hover:bg-opacity-80 hover:shadow-sm'
        }`}
        style={{ 
          backgroundColor: `${typeInfo.color}20`, 
          borderColor: typeInfo.color,
          borderWidth: isSelected ? '1px' : '0',
          ringColor: typeInfo.color
        }}
        onClick={onClick}
      >
        <div 
          className="w-12 h-12 flex items-center justify-center rounded-full mb-2"
          style={{ backgroundColor: typeInfo.color }}
        >
          {Icon && <Icon className="h-6 w-6 text-white" />}
        </div>
        <span className="font-medium text-center">{type}</span>
      </div>
    );
  };
  
  // Registration period card component
  const RegistrationPeriodCard = ({ period, isSelected, onClick }) => (
    <div
      className={`p-4 rounded-lg cursor-pointer transition-all ${
        isSelected 
          ? 'bg-blue-100 border-blue-500 border-2 shadow-md' 
          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:shadow-sm'
      }`}
      onClick={onClick}
    >
      <span className="font-medium">{period}</span>
    </div>
  );
  
  // Calendar card component for ICS calendars
  const CalendarCard = ({ calendar, isSelected, onClick }) => (
    <div
      className={`p-4 rounded-lg cursor-pointer transition-all ${
        isSelected 
          ? 'bg-blue-100 border-blue-500 border-2 shadow-md' 
          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:shadow-sm'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <CalendarIcon className="h-5 w-5 text-blue-500" />
        <span className="font-medium">{calendar}</span>
      </div>
    </div>
  );
  
  // Render the selection form with buttons and cards
  const renderSelectionForm = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Calendar View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Calendar Source Selection Buttons */}
            <div>
              <label className="block text-sm font-medium mb-2">Calendar Type</label>
              <div className="flex gap-3">
                {calendarSources.map(source => (
                  <CalendarSourceButton 
                    key={source.id}
                    source={source}
                    isSelected={selectedEventSource === source.id}
                    onClick={() => handleEventSourceChange(source.id)}
                  />
                ))}
              </div>
            </div>
            
            {selectedEventSource === 'registration' && (
              <>
                {/* Student Type Selection Cards */}
                <div>
                  <label className="block text-sm font-medium mb-2">Student Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {uniqueStudentTypes.map(type => (
                      <StudentTypeCard 
                        key={type} 
                        type={type}
                        isSelected={selectedStudentType === type}
                        onClick={() => handleStudentTypeChange(type)}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Registration Period Selection Cards */}
                {selectedStudentType && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Registration Period</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {filteredEventTypes.map(eventType => (
                        <RegistrationPeriodCard 
                          key={eventType} 
                          period={eventType}
                          isSelected={selectedEventType === eventType}
                          onClick={() => handleEventTypeChange(eventType)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            
            {selectedEventSource === 'icsCalendars' && (
              <div>
                <label className="block text-sm font-medium mb-2">Calendar</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {availableIcsCalendars.map(calendar => (
                    <CalendarCard 
                      key={calendar} 
                      calendar={calendar}
                      isSelected={selectedCalendar === calendar}
                      onClick={() => handleCalendarChange(calendar)}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={applyFilters} 
                disabled={(selectedEventSource === 'registration' && (!selectedStudentType || !selectedEventType)) || 
                         (selectedEventSource === 'icsCalendars' && !selectedCalendar)}
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

  return (
    <div className="space-y-4">
      {showFilters && !selectionComplete && renderSelectionForm()}
      <YearlyCalendarView 
        year={year}
        title={title}
        filteredDates={filteredDates}
        selectedStudentType={selectedStudentType}
        selectedEventType={selectedEventType}
        selectedEventSource={selectedEventSource}
        selectionComplete={selectionComplete}
        courses={courses}
      />
      
      {selectionComplete && showFilters && (
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={resetFilters}>
            Change Selection
          </Button>
        </div>
      )}
    </div>
  );
};

export default CalendarSelector;