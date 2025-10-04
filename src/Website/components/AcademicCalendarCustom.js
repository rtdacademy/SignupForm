// src/Website/components/AcademicCalendarCustom.js
import React, { useState, useMemo } from 'react';
import { format, addMonths, parse, startOfWeek, getDay, isSameDay } from 'date-fns';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/academic-calendar.css';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from 'lucide-react';
import { Button } from '../../components/ui/button';
import EventDetailsSheet from './EventDetailsSheet';
import {
  getCurrentSchoolYearEvents,
  getEventTypes,
  getCurrentSchoolYear
} from '../../config/calendarConfig';

// Set up the date-fns localizer for react-big-calendar
const locales = {
  'en-US': require('date-fns/locale/en-US')
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

/**
 * Custom Academic Calendar Component
 * Displays school year events with two view modes: List and Calendar Grid
 *
 * Features:
 * - Dynamic legend (only shows event types that are visible)
 * - Smart multi-day event display (shows as date ranges)
 * - Configurable date range for list view
 * - Role-based event filtering (public, staff, admin)
 * - Mobile-responsive design
 */
const AcademicCalendarCustom = ({
  userRole = 'public',
  className = '',
  defaultView, // If not provided, will be set based on screen size
  dateRangeMonths = 6 // How many months to show in list view
}) => {
  // Determine initial view based on screen size if not explicitly set
  const getInitialView = () => {
    if (defaultView) return defaultView;
    // Default to calendar on desktop (≥768px), list on mobile
    return window.innerWidth >= 768 ? 'calendar' : 'list';
  };

  const [view, setView] = useState(getInitialView);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const currentSchoolYear = getCurrentSchoolYear();
  const allEventTypes = getEventTypes();

  // Get filtered events based on user role
  const events = useMemo(() => {
    return getCurrentSchoolYearEvents(userRole);
  }, [userRole]);

  // Get visible event types (only types that have events in the filtered list)
  const visibleEventTypes = useMemo(() => {
    const typesInUse = new Set(events.map(event => event.type));
    return Object.entries(allEventTypes).filter(([key]) => typesInUse.has(key));
  }, [events, allEventTypes]);

  // Get events for list view (next N months)
  const listViewEvents = useMemo(() => {
    const startDate = new Date();
    const endDate = addMonths(startDate, dateRangeMonths);

    return events
      .filter(event => event.start <= endDate && event.end >= startDate)
      .sort((a, b) => a.start - b.start);
  }, [events, dateRangeMonths]);

  // Group events by month for list view
  const eventsByMonth = useMemo(() => {
    const grouped = {};

    listViewEvents.forEach(event => {
      const monthKey = format(event.start, 'MMMM yyyy');
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(event);
    });

    return grouped;
  }, [listViewEvents]);

  // Format events for react-big-calendar
  const calendarEvents = useMemo(() => {
    return events.map(event => ({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      allDay: event.allDay !== undefined ? event.allDay : true,
      resource: {
        type: event.type,
        description: event.description,
        link: event.link,
        additionalInfo: event.additionalInfo,
        studentTypeMessages: event.studentTypeMessages,
        schoolClosed: event.schoolClosed
      }
    }));
  }, [events]);

  // Format event date range
  const formatEventDateRange = (event) => {
    const sameDay = isSameDay(event.start, event.end) ||
                    (event.end.getTime() - event.start.getTime() === 86400000); // 1 day difference (exclusive end)

    if (sameDay) {
      return format(event.start, 'MMM d, yyyy');
    }

    // For multi-day events, show inclusive end date (subtract 1 day from exclusive end)
    const inclusiveEnd = new Date(event.end.getTime() - 86400000);

    if (event.start.getFullYear() === inclusiveEnd.getFullYear()) {
      if (event.start.getMonth() === inclusiveEnd.getMonth()) {
        return `${format(event.start, 'MMM d')} - ${format(inclusiveEnd, 'd, yyyy')}`;
      }
      return `${format(event.start, 'MMM d')} - ${format(inclusiveEnd, 'MMM d, yyyy')}`;
    }
    return `${format(event.start, 'MMM d, yyyy')} - ${format(inclusiveEnd, 'MMM d, yyyy')}`;
  };

  // Custom event styling for react-big-calendar
  const eventStyleGetter = (event) => {
    const eventType = allEventTypes[event.resource.type] || allEventTypes.important;

    return {
      style: {
        backgroundColor: eventType.bgColor,
        color: eventType.color,
        borderLeft: `4px solid ${eventType.color}`,
        borderRadius: '4px',
        padding: '2px 6px',
        fontSize: '0.875rem',
        fontWeight: '500',
        opacity: 0.95,
        border: 'none'
      }
    };
  };

  // Custom day styling
  const dayPropGetter = (date) => {
    const today = new Date();
    const isCurrentDay = date.toDateString() === today.toDateString();

    if (isCurrentDay) {
      return {
        style: {
          backgroundColor: 'rgba(20, 184, 166, 0.1)',
          border: '2px solid rgb(20, 184, 166)'
        }
      };
    }

    return {};
  };

  // Handle event click - find all events on the same day
  const handleEventClick = (event) => {
    // Find all events that occur on the same day as the clicked event
    const eventDate = event.start;
    const eventsOnSameDay = events.filter(e => {
      // For single-day events, check if it's the same day
      if (isSameDay(e.start, e.end) || (e.end.getTime() - e.start.getTime() === 86400000)) {
        return isSameDay(eventDate, e.start);
      }
      // For multi-day events, check if date falls within the range
      return eventDate >= e.start && eventDate < e.end;
    });

    if (eventsOnSameDay.length > 0) {
      setSelectedEvent(eventsOnSameDay);
      setSheetOpen(true);
    }
  };

  return (
    <div className={`academic-calendar-custom ${className}`}>
      {/* Header with View Toggle and Legend */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        {/* View Toggle Buttons */}
        <div className="flex gap-2">
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            onClick={() => setView('list')}
            size="sm"
            className="flex items-center gap-1.5 text-sm"
          >
            <List className="w-3.5 h-3.5" />
            List View
          </Button>
          <Button
            variant={view === 'calendar' ? 'default' : 'outline'}
            onClick={() => setView('calendar')}
            size="sm"
            className="flex items-center gap-1.5 text-sm"
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            Calendar
          </Button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          {visibleEventTypes.map(([key, type]) => {
            const IconComponent = type.icon;
            return (
              <div key={key} className="flex items-center gap-2">
                {IconComponent && (
                  <IconComponent className="w-4 h-4" style={{ color: type.color }} />
                )}
                <span
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: type.color }}
                />
                <span className="text-sm text-gray-700">{type.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* List View */}
      {view === 'list' && (
        <div className="space-y-8">
          {Object.entries(eventsByMonth).length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No upcoming events in the next {dateRangeMonths} months
            </div>
          ) : (
            Object.entries(eventsByMonth).map(([month, monthEvents]) => (
              <div key={month} className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  {month}
                </h3>
                <div className="space-y-2">
                  {monthEvents.map(event => {
                    const eventType = allEventTypes[event.type] || allEventTypes.important;
                    const IconComponent = eventType.icon;
                    return (
                      <div
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className="flex flex-col sm:flex-row gap-3 p-4 rounded-lg border-l-4 hover:shadow-lg transition-all cursor-pointer hover:scale-[1.01]"
                        style={{
                          backgroundColor: eventType.bgColor,
                          borderLeftColor: eventType.color
                        }}
                      >
                        <div className="flex-shrink-0 sm:w-48">
                          <div
                            className="text-sm font-semibold"
                            style={{ color: eventType.color }}
                          >
                            {formatEventDateRange(event)}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1">
                            {IconComponent && (
                              <IconComponent className="w-3.5 h-3.5" style={{ color: eventType.color }} />
                            )}
                            {eventType.label}
                          </div>
                        </div>
                        <div className="flex-grow">
                          <div className="font-medium text-gray-900">
                            {event.title}
                          </div>
                          {event.description && (
                            <div className="text-sm text-gray-600 mt-1">
                              {event.description}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Calendar Grid View with react-big-calendar */}
      {view === 'calendar' && (
        <div className="calendar-wrapper">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            defaultView="month"
            views={['month']}
            eventPropGetter={eventStyleGetter}
            dayPropGetter={dayPropGetter}
            onSelectEvent={handleEventClick}
            popup
            tooltipAccessor={(event) => event.resource.description}
          />
        </div>
      )}

      {/* Event Details Sheet */}
      <EventDetailsSheet
        event={selectedEvent}
        eventTypes={allEventTypes}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
};

export default AcademicCalendarCustom;
