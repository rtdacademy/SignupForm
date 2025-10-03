// src/Website/components/AcademicCalendarComponent.js
import React, { useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/academic-calendar.css';
import {
  getCurrentSchoolYearEvents,
  getEventTypes,
  getCurrentSchoolYear
} from '../../config/calendarConfig';

// Set up the date-fns localizer
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
 * Academic Calendar Component
 * Displays school year events including holidays, breaks, deadlines, and important dates
 * Uses react-big-calendar with teal/cyan theme matching RTD Landing Page
 */
const AcademicCalendarComponent = ({
  className = '',
  defaultView = 'month',
  showToolbar = true
}) => {
  const currentSchoolYear = getCurrentSchoolYear();
  const eventTypes = getEventTypes();

  // Detect mobile device and set default view
  const isMobile = window.innerWidth < 768; // md breakpoint
  const initialView = isMobile ? 'agenda' : defaultView;

  // Get and format events for react-big-calendar
  const events = useMemo(() => {
    const rawEvents = getCurrentSchoolYearEvents();

    return rawEvents.map(event => ({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      allDay: event.allDay !== undefined ? event.allDay : true,
      resource: {
        type: event.type,
        description: event.description
      }
    }));
  }, []);

  // Custom event styling based on event type
  const eventStyleGetter = (event) => {
    const eventType = eventTypes[event.resource.type] || eventTypes.important;

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

  // Custom day styling for weekends and today
  const dayPropGetter = (date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return {
        style: {
          backgroundColor: 'rgba(20, 184, 166, 0.1)', // teal-500 with opacity
          border: '2px solid rgb(20, 184, 166)'
        }
      };
    }

    return {};
  };

  // Custom event component to show description on hover
  const EventComponent = ({ event }) => (
    <div className="calendar-event" title={event.resource.description}>
      <span className="event-title">{event.title}</span>
    </div>
  );

  // Custom toolbar to match website style
  const CustomToolbar = ({ label, onNavigate, onView, view }) => (
    <div className="calendar-toolbar">
      <div className="calendar-nav-buttons">
        <button
          onClick={() => onNavigate('PREV')}
          className="nav-button"
          aria-label="Previous month"
        >
          ‹
        </button>
        <button
          onClick={() => onNavigate('TODAY')}
          className="today-button"
        >
          Today
        </button>
        <button
          onClick={() => onNavigate('NEXT')}
          className="nav-button"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="calendar-label">
        <h3>{label}</h3>
      </div>

      <div className="calendar-view-buttons">
        <button
          className={view === 'month' ? 'active' : ''}
          onClick={() => onView('month')}
        >
          Month
        </button>
        <button
          className={view === 'agenda' ? 'active' : ''}
          onClick={() => onView('agenda')}
        >
          Agenda
        </button>
      </div>
    </div>
  );

  return (
    <div className={`academic-calendar-container ${className}`}>
      {/* Legend */}
      <div className="calendar-legend">
        {Object.entries(eventTypes).map(([key, type]) => (
          <div key={key} className="legend-item">
            <span
              className="legend-color"
              style={{ backgroundColor: type.color }}
            />
            <span className="legend-label">{type.label}</span>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="calendar-wrapper">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          defaultView={initialView}
          views={['month', 'agenda']}
          eventPropGetter={eventStyleGetter}
          dayPropGetter={dayPropGetter}
          components={{
            event: EventComponent,
            toolbar: showToolbar ? CustomToolbar : () => null
          }}
          popup
          tooltipAccessor={(event) => event.resource.description}
        />
      </div>
    </div>
  );
};

export default AcademicCalendarComponent;
