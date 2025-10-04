// src/Website/components/EventDetailsSheet.js
import React from 'react';
import { format, isSameDay } from 'date-fns';
import { Calendar, XCircle, CheckCircle, Info, ArrowRight } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../../components/ui/sheet';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../../components/ui/accordion';
import StudentTypeMessage from './StudentTypeMessage';

/**
 * Event Details Sheet Component
 * Displays detailed information about calendar event(s) in a side drawer
 * Handles both single events and multiple events on the same day
 */
const EventDetailsSheet = ({ event, eventTypes, open, onOpenChange }) => {
  if (!event) return null;

  // Handle both single event and array of events
  const events = Array.isArray(event) ? event : [event];
  const isMultipleEvents = events.length > 1;

  // Determine if school is closed on this day
  // School is closed if ANY event has schoolClosed: true
  const schoolClosedForDay = events.some(e => e.schoolClosed === true);
  const hasSchoolStatus = events.some(e => e.schoolClosed !== undefined);

  // Format date range for display
  const formatDateRange = (event) => {
    const sameDay = isSameDay(event.start, event.end) ||
                    (event.end.getTime() - event.start.getTime() === 86400000);

    if (sameDay) {
      return format(event.start, 'EEEE, MMMM d, yyyy');
    }

    // For multi-day events, show inclusive end date
    const inclusiveEnd = new Date(event.end.getTime() - 86400000);

    if (event.start.getFullYear() === inclusiveEnd.getFullYear()) {
      if (event.start.getMonth() === inclusiveEnd.getMonth()) {
        return `${format(event.start, 'EEEE, MMMM d')} - ${format(inclusiveEnd, 'd, yyyy')}`;
      }
      return `${format(event.start, 'EEEE, MMMM d')} - ${format(inclusiveEnd, 'EEEE, MMMM d, yyyy')}`;
    }
    return `${format(event.start, 'EEEE, MMMM d, yyyy')} - ${format(inclusiveEnd, 'EEEE, MMMM d, yyyy')}`;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent size="sm" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-gray-900 pr-8">
            {isMultipleEvents ? `Events on ${format(events[0].start, 'MMMM d, yyyy')}` : events[0].title}
          </SheetTitle>
          <SheetDescription>
            <div className="flex items-center gap-2 mt-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {formatDateRange(events[0])}
              </span>
            </div>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* School Status for the Day */}
          {hasSchoolStatus && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">School Status</h3>
              <div className="flex items-center gap-2">
                {schoolClosedForDay ? (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-medium text-red-600">School Closed</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">School Open</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Display each event */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              {isMultipleEvents ? `${events.length} Events` : 'Event Details'}
            </h3>

            <Accordion type="multiple" className="space-y-3">
              {events.map((evt, index) => {
                const eventType = eventTypes[evt.type] || eventTypes.important;
                const IconComponent = eventType.icon;

                return (
                  <AccordionItem
                    key={evt.id}
                    value={evt.id}
                    style={{
                      backgroundColor: eventType.bgColor,
                      borderColor: eventType.color
                    }}
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-start gap-3 text-left w-full">
                        {/* Event Type Icon */}
                        {IconComponent && (
                          <div
                            className="flex-shrink-0 p-2 rounded-lg"
                            style={{ backgroundColor: eventType.color }}
                          >
                            <IconComponent className="w-4 h-4 text-white" />
                          </div>
                        )}

                        {/* Event Title and Type */}
                        <div className="flex-1 min-w-0 pr-4">
                          <h4 className="font-semibold text-gray-900 text-base break-words">
                            {evt.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className="text-xs font-medium px-2 py-0.5 rounded whitespace-nowrap"
                              style={{
                                backgroundColor: eventType.color,
                                color: 'white'
                              }}
                            >
                              {eventType.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-6 pb-4 space-y-3">
                      {/* Description */}
                      {evt.description && (
                        <div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {evt.description}
                          </p>
                        </div>
                      )}

                      {/* Additional Information */}
                      {evt.additionalInfo && (
                        <div className="bg-white border border-blue-200 rounded-md p-3">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {evt.additionalInfo}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Link */}
                      {evt.link && (
                        <div>
                          <a
                            href={evt.link.url}
                            className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-900 underline transition-colors"
                          >
                            {evt.link.text} <ArrowRight className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {/* Student-Type Specific Messages */}
                      {evt.studentTypeMessages && (
                        <div className="space-y-3 pt-2 border-t border-gray-200">
                          <h5 className="text-sm font-semibold text-gray-700">
                            How This Affects Different Students
                          </h5>

                          {/* Non-Primary Students */}
                          {evt.studentTypeMessages['non-primary'] && (
                            <StudentTypeMessage
                              type="non-primary"
                              label="Non-Primary Students"
                              message={evt.studentTypeMessages['non-primary']}
                              eventDate={evt.start}
                            />
                          )}

                          {/* Home Education Students */}
                          {evt.studentTypeMessages['home-education'] && (
                            <StudentTypeMessage
                              type="home-education"
                              label="Home Education Students"
                              message={evt.studentTypeMessages['home-education']}
                              eventDate={evt.start}
                            />
                          )}

                          {/* Summer School Students */}
                          {evt.studentTypeMessages['summer'] && (
                            <StudentTypeMessage
                              type="summer"
                              label="Summer School Students"
                              message={evt.studentTypeMessages['summer']}
                              eventDate={evt.start}
                            />
                          )}

                          {/* Adult Students */}
                          {evt.studentTypeMessages['adult'] && (
                            <StudentTypeMessage
                              type="adult"
                              label="Adult Students"
                              message={evt.studentTypeMessages['adult']}
                              eventDate={evt.start}
                            />
                          )}

                          {/* International Students */}
                          {evt.studentTypeMessages['international'] && (
                            <StudentTypeMessage
                              type="international"
                              label="International Students"
                              message={evt.studentTypeMessages['international']}
                              eventDate={evt.start}
                            />
                          )}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EventDetailsSheet;
