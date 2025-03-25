// src/components/ScheduleMaker.js

import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, set, get } from 'firebase/database';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  startOfWeek,
  addDays,
  startOfDay,
  parseISO,
  format,
  isWeekend,
  isSameDay,
  isWithinInterval
} from 'date-fns';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Clipboard, ChevronDown, ChevronRight } from 'lucide-react';
import CustomBlockoutDates from './CustomBlockoutDates';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from '../components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from "sonner";

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse: parseISO,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 0 }),
  getDay: date => date.getDay(),
  locales,
});

// Create DnD Calendar component
const DragAndDropCalendar = withDragAndDrop(Calendar);

// Modified calendar view component
const CalendarView = ({ 
  events, 
  localizer, 
  isDateExcluded,
  onEventDrop,
  onEventResize,
  onSelectEvent 
}) => {
  const handleEventDrop = ({ event, start, end }) => {
    // Check if the new date is excluded
    if (isDateExcluded(start)) {
      toast.error("Cannot move event to blocked date");
      return;
    }
    
    // Call parent handler with new event details
    onEventDrop({
      event,
      start: startOfDay(start),
      end: startOfDay(end || start)
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <DragAndDropCalendar
        localizer={localizer}
        events={events}
        style={{ height: 600 }}
        views={['month']}
        onEventDrop={handleEventDrop}
        onEventResize={onEventResize}
        onSelectEvent={onSelectEvent}
        dragFromOutsideItem={null}
        resizable
        selectable
        popup
        messages={{
          today: 'Today',
          month: 'Month'
        }}
      />
    </DndProvider>
  );
};

const ScheduleMaker = ({ studentKey, courseId, onClose }) => {
  const { user, loading: authLoading } = useAuth();
  const [calendars, setCalendars] = useState([]);
  const [selectedCourseOption, setSelectedCourseOption] = useState(null);
  const [selectedCalendarOption, setSelectedCalendarOption] = useState(null);
  const [startDate, setStartDate] = useState(null); // Initial state set to null
  const [endDate, setEndDate] = useState(null);
  const [scheduleJson, setScheduleJson] = useState(null);
  const [courseItems, setCourseItems] = useState([]);
  const [debugInfo, setDebugInfo] = useState('');
  const [excludeWeekends, setExcludeWeekends] = useState(false);
  const [blockoutDates, setBlockoutDates] = useState([]);
  const [customBlockoutDates, setCustomBlockoutDates] = useState([]);
  const [showBlockoutOptions, setShowBlockoutOptions] = useState(false);
  const [startingAssignmentOptions, setStartingAssignmentOptions] = useState([]);
  const [selectedStartingAssignment, setSelectedStartingAssignment] = useState(null);
  const [needsRecreation, setNeedsRecreation] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [jsonStudentNotes, setJsonStudentNotes] = useState([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [existingSchedule, setExistingSchedule] = useState(null);
  const [scheduleCreated, setScheduleCreated] = useState(false);
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);

  // Fetch course, calendars, student email, and notes
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      console.warn('User is not authenticated.');
      return;
    }

    if (!studentKey || !courseId) {
      console.warn('studentKey or courseId is missing.');
      return;
    }

    console.log('Fetching data with courseId:', courseId); // Debug log

    const db = getDatabase();
    const courseRef = ref(db, `courses/${courseId}`);
    const calendarsRef = ref(db, 'calendars/blockOutDates');
    const studentRef = ref(db, `students/${sanitizeEmail(studentKey)}`);
    const notesRef = ref(db, `students/${sanitizeEmail(studentKey)}/courses/${courseId}/jsonStudentNotes`);

    // Fetch the specific course
    const unsubscribeCourse = onValue(courseRef, (snapshot) => {
      const courseData = snapshot.val();
      if (courseData) {
        const course = {
          value: courseId,
          label: courseData.Title,
          ...courseData
        };
        console.log('Course loaded:', course.label); // Debug log
        setSelectedCourseOption(course);
        setIsLoadingCourse(false);
      } else {
        console.error(`Course with ID ${courseId} not found.`);
        setSelectedCourseOption(null);
        setIsLoadingCourse(false);
      }
    });

    const unsubscribeCalendars = onValue(calendarsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const calendarsArray = Object.keys(data).map((key) => ({
          value: key,
          label: data[key].name,
          ...data[key]
        }));
        setCalendars(calendarsArray);
      }
    });

    get(studentRef).then((snapshot) => {
      if (snapshot.exists()) {
        const studentData = snapshot.val();
        setStudentEmail(studentData.profile.StudentEmail);
      }
    });

    const unsubscribeNotes = onValue(notesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setJsonStudentNotes(Object.values(data));
      } else {
        setJsonStudentNotes([]);
      }
    });

    return () => {
      unsubscribeCourse();
      unsubscribeCalendars();
      unsubscribeNotes();
    };
  }, [studentKey, courseId, user, authLoading]);

  // Fetch existing schedule data
  useEffect(() => {
    if (authLoading || !user || !studentKey || !courseId) return;

    const db = getDatabase();
    const scheduleJSONRef = ref(db, `students/${sanitizeEmail(studentKey)}/courses/${courseId}/ScheduleJSON`);
    const scheduleStartDateRef = ref(db, `students/${sanitizeEmail(studentKey)}/courses/${courseId}/ScheduleStartDate`);
    const scheduleEndDateRef = ref(db, `students/${sanitizeEmail(studentKey)}/courses/${courseId}/ScheduleEndDate`);

    const fetchScheduleData = async () => {
      try {
        const scheduleSnapshot = await get(scheduleJSONRef);
        
        if (scheduleSnapshot.exists()) {
          const data = scheduleSnapshot.val();
          setExistingSchedule(data);
          setScheduleJson(data);
          setStartDate(parseISO(data.startDate)); 
          setEndDate(parseISO(data.endDate));

          if (data.units && data.units.length > 0 && data.units[0].items && data.units[0].items.length > 0) {
            const firstItem = data.units[0].items[0];
            const startingAssignmentOption = startingAssignmentOptions.find(option => 
              option.label === firstItem.title
            );
            if (startingAssignmentOption) {
              setSelectedStartingAssignment(startingAssignmentOption);
            }
          }
        } else {
          const startDateSnapshot = await get(scheduleStartDateRef);
          const endDateSnapshot = await get(scheduleEndDateRef);
          
          if (startDateSnapshot.exists() && endDateSnapshot.exists()) {
            const startDateString = startDateSnapshot.val();
            const endDateString = endDateSnapshot.val();
            
            const parsedStartDate = parseISO(startDateString);
            const parsedEndDate = parseISO(endDateString);
            
            setStartDate(parsedStartDate);
            setEndDate(parsedEndDate);
          }
          setExistingSchedule(null);
        }
      } catch (error) {
        console.error('Error fetching schedule data:', error);
      }
    };

    fetchScheduleData();
  }, [studentKey, courseId, user, authLoading, startingAssignmentOptions]);

  useEffect(() => {
    if (selectedCourseOption) {
      const allCourseItems = selectedCourseOption.units.flatMap((unit) => unit.items);
      setCourseItems(allCourseItems);
      
      const assignmentOptions = allCourseItems.map((item, index) => ({
        value: index,
        label: item.title
      }));
      setStartingAssignmentOptions(assignmentOptions);
      
      const firstLesson = assignmentOptions.find(option => option.label.toLowerCase().includes('lesson'));
      setSelectedStartingAssignment(firstLesson || assignmentOptions[0]);
    } else {
      setCourseItems([]);
      setStartingAssignmentOptions([]);
      setSelectedStartingAssignment(null);
    }
    setNeedsRecreation(true);
    setScheduleCreated(false);
  }, [selectedCourseOption]);

  useEffect(() => {
    if (selectedCalendarOption) {
      const dates = selectedCalendarOption.events.flatMap(event => {
        if (event.startDate && event.endDate) {
          try {
            const start = parseISO(event.startDate);
            const end = parseISO(event.endDate);
            const datesInRange = [];
            let currentDate = start;
            while (currentDate <= end) {
              datesInRange.push(new Date(currentDate));
              currentDate = addDays(currentDate, 1);
            }
            return datesInRange;
          } catch (error) {
            console.error('Error parsing event dates:', error, event);
            return [];
          }
        } else {
          console.warn('Event is missing startDate or endDate:', event);
          return [];
        }
      });
      setBlockoutDates(dates);
    } else {
      setBlockoutDates([]);
    }
    setNeedsRecreation(true);
    setScheduleCreated(false);
  }, [selectedCalendarOption]);

  const isDateExcluded = (date) => {
    if (excludeWeekends && isWeekend(date)) {
      return true;
    }
    if (blockoutDates.some(blockoutDate => isSameDay(date, blockoutDate))) {
      return true;
    }
    return customBlockoutDates.some(range => 
      isWithinInterval(date, { start: range.startDate, end: range.endDate })
    );
  };

  const distributeItemsAcrossDates = (items, startDate, endDate) => {
    let currentDate = startOfDay(startDate);
    const endDateTime = startOfDay(endDate).getTime();
    const availableDates = [];
    
    while (currentDate.getTime() <= endDateTime) {
      if (!isDateExcluded(currentDate)) {
        availableDates.push(new Date(currentDate));
      }
      currentDate = addDays(currentDate, 1);
    }

    if (availableDates.length === 0) {
      toast.error("No available dates to schedule items. Please adjust your blockout options.");
      return [];
    }

    const totalDays = availableDates.length;
    const totalMultiplier = items.reduce((sum, item) => sum + item.multiplier, 0);
    let debugOutput = `Total available days: ${totalDays}, Total multiplier: ${totalMultiplier}\n\n`;

    let scheduledItems = [];
    let accumulatedMultiplier = 0;

    items.forEach((item, index) => {
      if (index === 0) {
        if (startDate) {
          scheduledItems.push({
            ...item,
            date: startDate.toISOString(),
          });
          debugOutput += `Item 1 (Schedule Created):\n`;
          debugOutput += `  Title: ${item.title}\n`;
          debugOutput += `  Scheduled Date: ${format(startDate, 'yyyy-MM-dd')}\n\n`;
        } else {
          console.warn('Start date is undefined for schedule creation item.');
        }
        return;
      }

      accumulatedMultiplier += item.multiplier;
      const idealDayIndex = Math.floor((accumulatedMultiplier / totalMultiplier) * (totalDays - 1));
      let scheduledDate = availableDates[Math.max(0, Math.min(idealDayIndex, totalDays - 1))];

      if (index === items.length - 1) {
        scheduledDate = new Date(endDate);
      }

      if (!scheduledDate) {
        console.warn('Scheduled date is undefined for item:', item);
        return;
      }

      scheduledItems.push({
        ...item,
        date: scheduledDate.toISOString(),
      });

      debugOutput += `Item ${index + 1}:\n`;
      debugOutput += `  Title: ${item.title}\n`;
      debugOutput += `  Multiplier: ${item.multiplier}\n`;
      debugOutput += `  Accumulated Multiplier: ${accumulatedMultiplier}\n`;
      debugOutput += `  Ideal Day Index: ${idealDayIndex}\n`;
      debugOutput += `  Scheduled Date: ${format(scheduledDate, 'yyyy-MM-dd')}\n\n`;
    });

    setDebugInfo(debugOutput);
    return scheduledItems;
  };

  const handleCreateSchedule = () => {
    if (!startDate || !endDate || selectedStartingAssignment === null) {
      toast.error("Please specify start and end dates, and choose a starting assignment.");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to create a schedule.");
      return;
    }

    const startingIndex = selectedStartingAssignment.value;
    const allItems = courseItems.slice(startingIndex);

    if (allItems.length === 0) {
      toast.error("No items to schedule for the selected starting point.");
      return;
    }

    const utcStartDate = startOfDay(startDate);
    const utcEndDate = startOfDay(endDate);

    const scheduleCreationItem = {
      multiplier: 0,
      sequence: 0,
      title: 'Schedule Created',
      type: 'info',
    };

    const itemsWithCreation = [scheduleCreationItem, ...allItems];

    const scheduledItems = distributeItemsAcrossDates(
      itemsWithCreation,
      utcStartDate,
      utcEndDate
    );

    if (scheduledItems.length === 0) {
      return;
    }

    const scheduledUnits = selectedCourseOption.units.map(unit => ({
      ...unit,
      items: scheduledItems.filter(item => 
        unit.items.some(unitItem => unitItem.title === item.title && unitItem.type === item.type)
      )
    })).filter(unit => unit.items.length > 0);

    const scheduleInfoItem = scheduledItems.find(item => item.title === 'Schedule Created');
    if (scheduleInfoItem) {
      scheduledUnits.unshift({
        name: 'Schedule Information',
        items: [scheduleInfoItem]
      });
    }

    const schedule = {
      startDate: utcStartDate.toISOString(),
      endDate: utcEndDate.toISOString(),
      courseId: selectedCourseOption.value,
      courseTitle: selectedCourseOption.label,
      units: scheduledUnits,
    };

    setScheduleJson(schedule);
    setNeedsRecreation(false);
    setShowNotes(true);
    setScheduleCreated(true);

    toast.success("Schedule created! Please review and click 'Save Schedule and Note' to finalize.", {
      duration: 5000,
    });
  };

  const saveScheduleAndNote = () => {
    if (!scheduleJson) {
      toast.error("Please create a schedule first.");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to save the schedule.");
      return;
    }

    const db = getDatabase();
    const scheduleRef = ref(db, `students/${sanitizeEmail(studentKey)}/courses/${courseId}/ScheduleJSON`);
    const notesRef = ref(db, `students/${sanitizeEmail(studentKey)}/courses/${courseId}/jsonStudentNotes`);

    const userName = user.displayName || user.email || 'Unknown User';
    const timestamp = new Date().toISOString();
    const defaultNoteContent = `📅 Schedule created by ${userName}.\nStart Date: ${formatLocalDate(scheduleJson.startDate)}\nEnd Date: ${formatLocalDate(scheduleJson.endDate)}`;
    
    const newNote = {
      id: `note-${Date.now()}`,
      content: newNoteContent.trim() || defaultNoteContent,
      timestamp: timestamp,
      author: userName,
      noteType: '📅',
    };

    const updatedNotes = [newNote, ...jsonStudentNotes];

    Promise.all([
      set(scheduleRef, scheduleJson),
      set(notesRef, updatedNotes)
    ]).then(() => {
      setJsonStudentNotes(updatedNotes);
      setNewNoteContent('');
      setScheduleCreated(false);
      toast.success("Your schedule and note have been saved successfully!");
      // Close the modal after saving
      if (onClose) {
        onClose();
      }
    }).catch((error) => {
      console.error('Error saving schedule and note:', error);
      toast.error("Failed to save schedule and note. Please try again.");
    });
  };

  const formatLocalDate = (utcDateString) => {
    if (!utcDateString) {
      console.warn('formatLocalDate called with undefined or null date string.');
      return 'Invalid Date';
    }
  
    if (utcDateString === "Legacy Note") {
      return "Legacy Note";
    }
  
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
    if (!isoDateRegex.test(utcDateString)) {
      console.warn('Invalid date string format:', utcDateString);
      return 'Invalid Date';
    }
  
    try {
      const date = parseISO(utcDateString);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error, utcDateString);
      return 'Invalid Date';
    }
  };

  const getCalendarEvents = () => {
    if (!scheduleJson) return [];

    const events = [];

    scheduleJson.units.forEach((unit, unitIndex) => {
      if (!Array.isArray(unit.items)) {
        console.warn(`Unit ${unitIndex} items is not an array:`, unit.items);
        return;
      }

      unit.items.forEach((item, itemIndex) => {
        if (item.date) {
          try {
            const startDate = parseISO(item.date);
            const endDate = parseISO(item.date);
            events.push({
              id: `${unit.name}-${item.title}-${item.date}`,
              title: item.title,
              start: startDate,
              end: endDate,
              type: item.type,
              details: item,
            });
          } catch (error) {
            console.error(`Error processing item ${itemIndex} in unit ${unitIndex}:`, error, item);
          }
        } else {
          console.warn(`Item ${itemIndex} in unit ${unitIndex} is missing date:`, item);
        }
      });
    });

    return events;
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event.details);
    setIsDialogOpen(true);
  };

  const handleListItemClick = (item) => {
    setSelectedEvent(item);
    setIsDialogOpen(true);
  };

  const handleEventDrop = ({ event, start, end }) => {
    if (!scheduleJson) {
      toast.error("Please create a schedule first");
      return;
    }
  
    // Find the event in scheduleJson and update its date
    const updatedScheduleJson = {
      ...scheduleJson,
      units: scheduleJson.units.map(unit => ({
        ...unit,
        items: unit.items.map(item => {
          if (item.title === event.title && parseISO(item.date).getTime() === event.start.getTime()) {
            return {
              ...item,
              date: start.toISOString()
            };
          }
          return item;
        })
      }))
    };
  
    setScheduleJson(updatedScheduleJson);
    setNeedsRecreation(true);
    
    // Add these lines to show the save options
    setShowNotes(true);
    setScheduleCreated(true);
    
    toast.success(`Moved "${event.title}" to ${format(start, 'MMM dd, yyyy')}`);
    toast.info("Don't forget to save your changes!", {
      duration: 4000,
    });
  };

  const handleEventResize = ({ event, start, end }) => {
    toast.error("Event resizing is not supported for this calendar");
  };

  const styles = `
  .orange-circle {
    width: 8px;
    height: 8px;
    background-color: orange;
    border-radius: 50%;
    display: inline-block;
    margin-left: 8px;
  }
  
  /* Add these new styles for drag and drop */
  .rbc-addons-dnd-drag-preview {
    position: absolute;
    z-index: 10;
    pointer-events: none;
    background-color: rgba(255, 255, 255, 0.8);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    padding: 4px;
    border-radius: 4px;
  }
  
  .rbc-addons-dnd-dragged-event {
    opacity: 0.5;
  }
  
  .rbc-addons-dnd-over {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to create and manage schedules.</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
     
      <div className="flex flex-grow">
        <div className="w-full md:w-1/3 p-4">
          <Card className="p-4">
            <CardHeader>
              <CardTitle>{existingSchedule ? 'Edit Schedule' : 'Create Schedule'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label>Course</Label>
                {isLoadingCourse ? (
                  <p>Loading course...</p>
                ) : selectedCourseOption ? (
                  <p>{selectedCourseOption.label}</p>
                ) : (
                  <p>Course not found</p>
                )}
              </div>

              {selectedCourseOption && (
                <div className="mb-4">
                  <Label>Starting Assignment</Label>
                  <Select
                    value={selectedStartingAssignment}
                    onChange={(option) => {
                      setSelectedStartingAssignment(option);
                      setNeedsRecreation(true);
                      setScheduleCreated(false);
                    }}
                    options={startingAssignmentOptions}
                    placeholder="Select starting assignment"
                    isSearchable
                    className="w-full text-xs"
                  />
                </div>
              )}

              <div className="mb-4 flex flex-col md:flex-row">
                <div className="w-full md:w-1/2 pr-0 md:pr-2 mb-2 md:mb-0">
                  <Label>Start Date</Label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => {
                      setStartDate(startOfDay(date));
                      setNeedsRecreation(true);
                      setScheduleCreated(false);
                    }}
                    dateFormat="MMM dd, yyyy"
                    placeholderText="Select start date"
                    className="w-full border border-gray-300 rounded px-2 py-1"
                    wrapperClassName="w-full"
                    preventOpenOnFocus={true} // Added line
                  />
                </div>
                <div className="w-full md:w-1/2 pl-0 md:pl-2">
                  <Label>End Date</Label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => {
                      setEndDate(startOfDay(date));
                      setNeedsRecreation(true);
                      setScheduleCreated(false);
                    }}
                    dateFormat="MMM dd, yyyy"
                    placeholderText="Select end date"
                    minDate={startDate}
                    className="w-full border border-gray-300 rounded px-2 py-1"
                    disabled={!startDate}
                    wrapperClassName="w-full"
                    preventOpenOnFocus={true} // Added line
                  />
                </div>
              </div>

              <div className="mb-4">
                <button
                  type="button"
                  className="flex items-center w-full text-left focus:outline-none"
                  onClick={() => setShowBlockoutOptions(!showBlockoutOptions)}
                >
                  {showBlockoutOptions ? (
                    <ChevronDown className="mr-2" />
                  ) : (
                    <ChevronRight className="mr-2" />
                  )}
                  <Label>Blockout Options</Label>
                </button>
                {showBlockoutOptions && (
                  <div className="mt-2">
                    <div className="mb-4 flex items-center">
                      <input
                        type="checkbox"
                        checked={excludeWeekends}
                        onChange={(e) => {
                          setExcludeWeekends(e.target.checked);
                          setNeedsRecreation(true);
                          setScheduleCreated(false);
                        }}
                        id="excludeWeekends"
                        className="mr-2"
                      />
                      <Label htmlFor="excludeWeekends">Exclude Weekends</Label>
                    </div>

                    <div className="mb-4">
                      <Label>Select Blockout Calendar</Label>
                      <Select
                        value={selectedCalendarOption}
                        onChange={(option) => {
                          setSelectedCalendarOption(option);
                          setNeedsRecreation(true);
                          setScheduleCreated(false);
                        }}
                        options={calendars}
                        placeholder="Select a calendar"
                        isSearchable
                        className="w-full text-xs"
                        isClearable={true}
                      />
                    </div>

                    <CustomBlockoutDates
                      customBlockoutDates={customBlockoutDates}
                      setCustomBlockoutDates={(dates) => {
                        setCustomBlockoutDates(dates);
                        setNeedsRecreation(true);
                        setScheduleCreated(false);
                      }}
                    />
                  </div>
                )}
              </div>

              <button
                onClick={handleCreateSchedule}
                className={`px-4 py-2 bg-primary text-white rounded flex items-center justify-center w-full ${
                  !selectedCourseOption || !startDate || !endDate || selectedStartingAssignment === null
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-secondary'
                }`}
                disabled={!selectedCourseOption || !startDate || !endDate || selectedStartingAssignment === null}
              >
                {existingSchedule ? 'Create This Schedule' : 'Create Schedule'}
                {needsRecreation && <span className="orange-circle" title="Changes detected. Click to update schedule."></span>}
              </button>

              {scheduleCreated && (
                <div className="mt-4 p-2 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                  Schedule created! Please review and click 'Save Schedule and Note' below to finalize.
                </div>
              )}
            </CardContent>
          </Card>

          {showNotes && (
            <>
              <Card className="mt-4 p-4">
                <CardHeader>
                  <CardTitle>Schedule Note</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Add an optional note about this schedule..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="mb-2"
                    rows={4}
                  />
                  <Button 
                    onClick={saveScheduleAndNote} 
                    className="mt-2 w-full"
                  >
                    Save Schedule and Note
                  </Button>
                </CardContent>
              </Card>

              <Card className="mt-4 p-4">
                <CardHeader>
                  <CardTitle>Previous Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    {jsonStudentNotes.length > 0 ? (
                      jsonStudentNotes.map(note => (
                        <div key={note.id} className="mb-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-semibold">{note.author}</span> <span className="text-gray-500 text-sm">{formatLocalDate(note.timestamp)}</span>
                            </div>
                            <span>{note.noteType}</span>
                          </div>
                          <p className="mt-1">{note.content}</p>
                          <hr className="mt-2" />
                        </div>
                      ))
                    ) : (
                      <p>No previous notes available.</p>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="w-full md:w-2/3 p-4">
          {scheduleJson && (
            <Card className="p-4">
              <Tabs defaultValue="calendar">
                <TabsList>
                  <TabsTrigger value="calendar">Calendar View</TabsTrigger>
                  <TabsTrigger value="list">List View</TabsTrigger>
                  <TabsTrigger value="json">JSON View</TabsTrigger>
                  <TabsTrigger value="debug">Debug Info</TabsTrigger>
                </TabsList>

                <TabsContent value="calendar">
                  <CalendarView
                    events={getCalendarEvents()}
                    localizer={localizer}
                    isDateExcluded={isDateExcluded}
                    onEventDrop={handleEventDrop}
                    onEventResize={handleEventResize}
                    onSelectEvent={handleSelectEvent}
                  />
                </TabsContent>

                <TabsContent value="list">
                  <h3 className="text-lg font-bold mt-4">Scheduled Items:</h3>
                  {scheduleJson.units.map((unit, idx) => (
                    <div key={idx} className="mb-4">
                      <h4 className="text-md font-semibold">{unit.name}</h4>
                      {Array.isArray(unit.items) ? (
                        unit.items.map((item, idx2) => (
                          <div
                            key={idx2}
                            className="pl-4 cursor-pointer hover:bg-gray-100 p-2 rounded"
                            onClick={() => handleListItemClick(item)}
                          >
                            <p>
                              <strong>{item.title}</strong> ({item.type})<br />
                              Date: {formatLocalDate(item.date)}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="pl-4 text-red-500">No items available for this unit</p>
                      )}
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="json">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold">Schedule JSON:</h3>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(scheduleJson, null, 2));
                        toast.success("Schedule JSON has been copied to your clipboard!");
                      }}
                      className="px-2 py-1 bg-secondary text-white rounded flex items-center"
                      title="Copy JSON"
                    >
                      <Clipboard size={20} className="mr-1" />
                      Copy
                    </button>
                  </div>
                  <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-96">
                    {JSON.stringify(scheduleJson, null, 2)}
                  </pre>
                </TabsContent>

                <TabsContent value="debug">
                  <h3 className="text-lg font-bold mt-4">Debug Information:</h3>
                  <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-96">
                    {debugInfo}
                  </pre>
                </TabsContent>
              </Tabs>
            </Card>
          )}

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Item Details</DialogTitle>
                <DialogClose />
              </DialogHeader>
              {selectedEvent && (
                <DialogDescription>
                  <p><strong>Title:</strong> {selectedEvent.title}</p>
                  <p><strong>Type:</strong> {selectedEvent.type}</p>
                  <p><strong>Date:</strong> {formatLocalDate(selectedEvent.date)}</p>
                </DialogDescription>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <style>{styles}</style>
    </div>
  );
};

export default ScheduleMaker;
