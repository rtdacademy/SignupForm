import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  startOfDay,
  parseISO,
  format,
  isWeekend,
  getDay,
  startOfWeek,
  addDays,
  addMonths,
  addYears,
  isWithinInterval
} from 'date-fns';
import { Calendar } from 'react-big-calendar';
import { dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "../components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Label } from '../components/ui/label';
import { ScrollArea } from '../components/ui/scroll-area';
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { ChevronDown, ChevronRight, AlertTriangle, InfoIcon, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import CustomBlockoutDates from '../Schedule/CustomBlockoutDates';

// Define locales for date-fns
const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

// Initialize date-fns localizer
const localizer = dateFnsLocalizer({
  format,
  parse: parseISO,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 0 }),
  getDay,
  locales,
});

// Format diploma date for display
const formatDiplomaDate = (diplomaTime) => {
  // Format the time in 12-hour format
  const hour = diplomaTime.hour % 12 || 12;
  const minute = diplomaTime.minute.toString().padStart(2, '0');
  const period = diplomaTime.period || (diplomaTime.hour >= 12 ? 'PM' : 'AM');
  
  // Format the date, showing just the date without redundant month
  const date = format(parseISO(diplomaTime.displayDate), 'MMM d');
  
  return `${date} at ${hour}:${minute} ${period}`;
};

// Calculate hours per week
const calculateHoursPerWeek = (startDate, endDate, totalHours) => {
  if (!startDate || !endDate || !totalHours) return null;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffWeeks = diffDays / 7;
  
  const hoursPerWeek = totalHours / diffWeeks;
  return hoursPerWeek.toFixed(1);
};

// Add new helper function to calculate minutes
const calculateItemMinutes = (totalMinutes, totalMultiplier, itemMultiplier) => {
  const minutesPerUnit = totalMinutes / totalMultiplier;
  return Math.round(minutesPerUnit * (itemMultiplier || 1));
};

// Function to map event types to colors
const getEventColor = (type) => {
  switch (type?.toLowerCase()) {
    case 'assignment':
      return {
        background: 'linear-gradient(to right, #DBEAFE, #93C5FD)', // blue-100 to blue-300
        color: '#1E3A8A' // blue-900
      };
    case 'quiz':
      return {
        background: 'linear-gradient(to right, #EDE9FE, #C4B5FD)', // violet-100 to violet-300
        color: '#4C1D95' // violet-900
      };
    case 'exam':
      return {
        background: 'linear-gradient(to right, #E0E7FF, #A5B4FC)', // indigo-100 to indigo-300
        color: '#312E81' // indigo-900
      };
    case 'reading':
      return {
        background: 'linear-gradient(to right, #FCE7F3, #F9A8D4)', // pink-100 to pink-300
        color: '#831843' // pink-900
      };
    case 'info':
      return {
        background: 'linear-gradient(to right, #E5E7EB, #D1D5DB)', // gray-200 to gray-300
        color: '#1F2937' // gray-800
      };
    default:
      return {
        background: 'linear-gradient(to right, #F1F5F9, #CBD5E1)', // slate-100 to slate-300
        color: '#0F172A' // slate-900
      };
  }
};

// Function to get display name for event types
const getTypeDisplayName = (type) => {
  const typeMap = {
    'lesson': 'Lessons',
    'assignment': 'Assignments',
    'exam': 'Exams'
  };
  return typeMap[type.toLowerCase()] || type;
};

// Event Component for Calendar
const EventComponent = ({ event }) => {
  const minutes = event.details.estimatedMinutes;
  const timeDisplay = minutes >= 60 
    ? `${Math.floor(minutes / 60)}h ${minutes % 60}m`
    : `${minutes}m`;
  
  return (
    <div className="text-xs">
      <div>{event.title}</div>
      <div className="opacity-75">{timeDisplay}</div>
    </div>
  );
};

// Custom Toolbar without the 'Today' button
const CustomToolbar = (toolbar) => {
  const goToBack = () => {
    toolbar.onNavigate('PREV');
  };

  const goToNext = () => {
    toolbar.onNavigate('NEXT');
  };

  const goToCurrent = () => {
    toolbar.onNavigate('TODAY');
  };

  const label = () => {
    const date = toolbar.date;
    const view = toolbar.view;
    let label = '';
    switch (view) {
      case 'month':
        label = format(date, 'MMMM yyyy');
        break;
      case 'week':
        label = `Week of ${format(startOfWeek(date, { weekStartsOn: 0 }), 'MMM dd, yyyy')}`;
        break;
      case 'day':
        label = format(date, 'MMMM dd, yyyy');
        break;
      default:
        label = format(date, 'MMMM yyyy');
    }
    return label;
  };

  return (
    <div className="rbc-toolbar flex justify-between mb-4">
      <div className="flex space-x-2">
        <button onClick={goToBack} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">
          {'<'}
        </button>
        <button onClick={goToNext} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">
          {'>'}
        </button>
      </div>
      <span className="text-lg font-semibold">{label()}</span>
      <div></div> {/* Empty div to balance the flex layout */}
    </div>
  );
};

// Enhanced FeatureCard component with custom header option and ref forwarding
const FeatureCard = forwardRef(({ title, customHeader, children, className = '' }, ref) => (
  <Card ref={ref} className={`bg-card text-card-foreground rounded-lg shadow-lg ${className}`}>
    {customHeader ? (
      customHeader
    ) : title ? (
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center">
          <ChevronRight className="w-5 h-5 mr-2 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
    ) : null}
    <CardContent>
      {children}
    </CardContent>
  </Card>
));

const YourWayScheduleMaker = () => {
  const [courses, setCourses] = useState({});
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [excludeWeekends, setExcludeWeekends] = useState(false);
  const [showBreakOptions, setShowBreakOptions] = useState(false); // renamed from showBlockoutOptions
  const [scheduleData, setScheduleData] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [courseHours, setCourseHours] = useState(null);

  // Diploma-related state
  const [isDiplomaCourse, setIsDiplomaCourse] = useState(false);
  const [diplomaDates, setDiplomaDates] = useState([]);
  const [selectedDiplomaDate, setSelectedDiplomaDate] = useState(null);
  const [alreadyWroteDiploma, setAlreadyWroteDiploma] = useState(false);

  // Add new state for custom blockout dates
  const [customBlockoutDates, setCustomBlockoutDates] = useState([]);

  // Add state for the show more dialog
  const [showMoreEvents, setShowMoreEvents] = useState(null);
  const [showMoreDate, setShowMoreDate] = useState(null);

  // New refs for scrolling
  const scheduleRef = useRef(null);

  useEffect(() => {
    const fetchCourses = async () => {
      const db = getDatabase();
      const coursesRef = ref(db, 'courses');
      
      try {
        const snapshot = await get(coursesRef);
        if (snapshot.exists()) {
          const coursesData = snapshot.val();
          const validCourses = Object.entries(coursesData)
            .filter(([id, course]) => {
              return id !== 'sections' && 
                     course?.Active === 'Current' &&
                     course?.Title &&
                     course?.units;
            })
            .reduce((acc, [id, course]) => {
              const grade = course.grade || 'Other';
              if (!acc[grade]) {
                acc[grade] = [];
              }
              acc[grade].push({
                id,
                ...course,
              });
              return acc;
            }, {});

          Object.keys(validCourses).forEach(grade => {
            validCourses[grade].sort((a, b) => {
              if (a.Title && b.Title) {
                return a.Title.localeCompare(b.Title);
              }
              return 0;
            });
          });
          
          const sortedCourses = Object.keys(validCourses)
            .sort((a, b) => {
              if (a === 'Other') return 1;
              if (b === 'Other') return -1;
              return parseInt(a) - parseInt(b);
            })
            .reduce((obj, key) => {
              obj[key] = validCourses[key];
              return obj;
            }, {});

          setCourses(sortedCourses);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Get minimum start date (2 days from now)
  const minStartDate = startOfDay(addDays(new Date(), 2));
  
  // Calculate default end date preview (5 months from start)
  const getDefaultEndDate = (startDate) => {
    if (!startDate) return null;
    return addMonths(startDate, 5);
  };

  // Function to handle start date changes
  const handleStartDateChange = (date) => {
    // If end date is set and selected start date is after end date, don't update
    if (endDate && date > endDate) {
      toast.error("Start date cannot be after end date");
      return;
    }
    
    setStartDate(date);
    // When start date changes, set a default end date 5 months later
    if (date) {
      const newEndDate = getDefaultEndDate(date);
      // Only set end date if not a diploma course or if "already wrote"
      if (!isDiplomaCourse || alreadyWroteDiploma) {
        setEndDate(newEndDate);
      }
    } else {
      setEndDate(null);
    }
  };

  // Function to handle end date changes
  const handleEndDateChange = (date) => {
    // If start date is set and selected end date is before start date, don't update
    if (startDate && date < startDate) {
      toast.error("End date cannot be before start date");
      return;
    }
    setEndDate(date);
  };

  const handleCourseSelect = async (course) => {
    // Reset all dependent fields when course changes
    setStartDate(null);
    setEndDate(null);
    setSelectedDiplomaDate(null);
    setAlreadyWroteDiploma(false);
    setIsDiplomaCourse(false);
    setDiplomaDates([]);
    setSelectedCourse(course);
    
    try {
      const db = getDatabase();
      const courseRef = ref(db, `courses/${course.id}`);
      const snapshot = await get(courseRef);

      if (snapshot.exists()) {
        const courseData = snapshot.val();
        const isDiploma = courseData.DiplomaCourse === "Yes";
        setIsDiplomaCourse(isDiploma);

        if (isDiploma && courseData.diplomaTimes) {
          const diplomaTimesArray = Array.isArray(courseData.diplomaTimes)
            ? courseData.diplomaTimes
            : Object.values(courseData.diplomaTimes);

          // Filter for future dates and sort
          const validDates = diplomaTimesArray
            .filter(item => new Date(item.displayDate) > new Date())
            .sort((a, b) => new Date(a.displayDate) - new Date(b.displayDate));

          setDiplomaDates(validDates);
        }

        // Fetch course hours
        if (courseData.NumberOfHours) {
          setCourseHours(courseData.NumberOfHours);
        }
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
      toast.error('Failed to load course details');
    }
  };

  // Determine if diploma date selection is allowed
  const canSelectDiplomaDate = selectedCourse && (!isDiplomaCourse || diplomaDates.length > 0);
  
  // Determine if start date selection is allowed
  const canSelectStartDate = selectedCourse && 
    (!isDiplomaCourse || alreadyWroteDiploma || selectedDiplomaDate);

  // Determine if end date selection is allowed
  const canSelectEndDate = startDate && 
    (!isDiplomaCourse || alreadyWroteDiploma);

  // Update the isDateExcluded function to include custom blockout dates
  const isDateExcluded = (date) => {
    // Check weekends if enabled
    if (excludeWeekends && isWeekend(date)) {
      return true;
    }

    // Check custom blockout dates
    return customBlockoutDates.some(range => 
      isWithinInterval(date, { start: range.startDate, end: range.endDate })
    );
  };

  const handleDiplomaDateSelect = (dateId) => {
    if (dateId === "already-wrote") {
      setAlreadyWroteDiploma(true);
      setSelectedDiplomaDate(null);
      if (startDate) {
        const defaultEndDate = new Date(startDate);
        defaultEndDate.setMonth(defaultEndDate.getMonth() + 5);
        setEndDate(defaultEndDate);
      }
    } else {
      const selectedDate = diplomaDates.find(date => date.id === dateId);
      if (selectedDate) {
        setSelectedDiplomaDate(selectedDate);
        setAlreadyWroteDiploma(false);
        
        // Just parse the ISO date string directly
        const endDate = parseISO(selectedDate.displayDate);
        setEndDate(endDate);
      }
    }
  };

  const distributeItemsAcrossDates = (items, startDate, endDate) => {
    let currentDate = startOfDay(startDate);
    const endDateTime = startOfDay(endDate);
    const availableDates = [];
    
    while (currentDate <= endDateTime) {
      if (!isDateExcluded(currentDate)) {
        availableDates.push(new Date(currentDate));
      }
      currentDate = addDays(currentDate, 1);
    }

    if (availableDates.length === 0) {
      toast.error("No available dates to schedule items. Please adjust your break options.");
      return [];
    }

    const totalDays = availableDates.length;
    const allItems = items.flatMap(unit => unit.items);
    const totalMultiplier = allItems.reduce((sum, item) => sum + (item.multiplier || 1), 0);
    let scheduledItems = [];
    let accumulatedMultiplier = 0;

    // Calculate total course minutes
    const totalMinutes = courseHours * 60;

    allItems.forEach((item) => {
      accumulatedMultiplier += item.multiplier || 1;
      const idealDayIndex = Math.floor((accumulatedMultiplier / totalMultiplier) * (totalDays - 1));
      const scheduledDate = availableDates[Math.min(idealDayIndex, totalDays - 1)];

      // Calculate minutes for this item
      const estimatedMinutes = calculateItemMinutes(totalMinutes, totalMultiplier, item.multiplier);

      scheduledItems.push({
        ...item,
        date: scheduledDate.toISOString(),
        estimatedMinutes, // Added estimatedMinutes
      });
    });

    return scheduledItems;
  };

  // Calculate type distribution for the combined section
  const typeDistribution = selectedCourse && courseHours ? selectedCourse.units.flatMap(unit => unit.items).reduce((acc, item) => {
    const type = item.type || 'Other';
    const minutes = calculateItemMinutes(courseHours * 60, selectedCourse.units.flatMap(u => u.items).reduce((sum, i) => sum + (i.multiplier || 1), 0), item.multiplier);
    
    if (!acc[type]) {
      acc[type] = { count: 0, totalMinutes: 0 };
    }
    
    acc[type].count++;
    acc[type].totalMinutes += minutes;
    
    return acc;
  }, {}) : {};

  // Function to handle smooth scrolling with a delay
  const scrollToSchedule = () => {
    // Add a small delay to ensure the DOM has updated
    setTimeout(() => {
      if (scheduleRef.current) {
        scheduleRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100); // 100ms delay should be sufficient
  };

  const handleCreateSchedule = () => {
    if (!selectedCourse || !startDate || !endDate) {
      toast.error("Please select a course and specify start and end dates");
      return;
    }

    if (isDiplomaCourse && !alreadyWroteDiploma && !selectedDiplomaDate) {
      toast.error("Please select a diploma exam date");
      return;
    }

    const scheduledItems = distributeItemsAcrossDates(
      selectedCourse.units,
      startDate,
      endDate
    );

    if (scheduledItems.length === 0) return;

    const scheduledUnits = selectedCourse.units.map(unit => ({
      ...unit,
      items: unit.items.map(item => {
        const scheduledItem = scheduledItems.find(
          scheduled => scheduled.title === item.title
        );
        return scheduledItem || item;
      })
    }));

    setScheduleData({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      courseId: selectedCourse.id,
      courseTitle: selectedCourse.Title,
      units: scheduledUnits,
    });

    // Trigger scroll after schedule data is set
    scrollToSchedule();
  };

  const getCalendarEvents = () => {
    if (!scheduleData) return [];

    return scheduleData.units.flatMap(unit => 
      unit.items.map(item => ({
        id: `${unit.name}-${item.title}`,
        title: item.title,
        start: parseISO(item.date),
        end: parseISO(item.date),
        type: item.type,
        details: item, // Updated to include entire item details
      }))
    );
  };

  // Updated calendar styles with softer grid and better spacing
  const calendarStyles = {
    style: { height: 500 },
    className: "rounded-lg shadow-sm p-2",
    eventPropGetter: (event) => {
      const colors = getEventColor(event.type);
      return {
        style: {
          background: colors.background,
          color: colors.color,
          border: 'none',
          padding: '2px 5px',
          fontSize: '0.75rem',
          borderRadius: '2px',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'opacity 0.2s ease',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          ':hover': {
            opacity: 0.9
          }
        }
      };
    },
    dayPropGetter: date => ({
      className: `
        ${isWeekend(date) ? 'bg-slate-50/50' : 'bg-white'}
        hover:bg-blue-50/50 
        transition-colors
      `
    }),
    popup: true,
    components: {
      event: EventComponent,
      toolbar: CustomToolbar
    }
  };
  
  const handleEventSelect = (event) => {
    setSelectedEvent(event.details);
    setIsDialogOpen(true);
  };

  // Diploma Select Section
  const diplomaSelectSection = isDiplomaCourse && (
    <div className="space-y-4">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          This is a diploma course. You must complete the course before your selected diploma exam date.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label>Diploma Exam Date</Label>
        <div className="relative">
          <Select
            defaultValue={selectedDiplomaDate?.id}
            onValueChange={handleDiplomaDateSelect}
          >
            <SelectTrigger 
              className={`w-full bg-background ${!canSelectDiplomaDate ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!canSelectDiplomaDate}
            >
              <SelectValue placeholder="Select diploma exam date" />
            </SelectTrigger>
            <SelectContent
              ref={(ref) => {
                if (ref) {
                  ref.style.width = 'var(--radix-select-trigger-width)';
                }
              }}
              className="overflow-y-auto"
              align="start"
            >
              <SelectGroup>
                <SelectLabel>Available Dates</SelectLabel>
                {diplomaDates.map((date) => (
                  <SelectItem 
                    key={date.id} 
                    value={date.id}
                    className="cursor-pointer"
                  >
                    {formatDiplomaDate(date)}
                  </SelectItem>
                ))}
                <SelectSeparator />
                <SelectItem 
                  value="already-wrote"
                  className="cursor-pointer"
                >
                  I already wrote the diploma exam
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {selectedDiplomaDate && !selectedDiplomaDate.confirmed && (
          <div className="flex items-center gap-2 mt-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <p className="text-sm text-amber-600">
              This exam date is tentative and may be adjusted by Alberta Education.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col space-y-8 p-4">
      <FeatureCard 
        className="bg-gradient-to-br from-muted to-background"
        customHeader={
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="w-8 h-8 text-blue-600" />
              <div>
                <CardTitle className="text-2xl font-bold">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    YourWay
                  </span>
                  <span className="text-gray-700"> Schedule Builder</span>
                </CardTitle>
                <p className="text-gray-600 mt-1">
                  Design your perfect learning schedule
                </p>
              </div>
            </div>
          </CardHeader>
        }
      >
        <div className="space-y-4 pt-6">
          {/* Course Selection */}
          <div>
            <Label>Select Course</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between mt-1"
                >
                  {selectedCourse ? selectedCourse.Title : "Select a course..."}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {Object.entries(courses).map(([grade, gradeCourses]) => (
                  <DropdownMenuSub key={grade}>
                    <DropdownMenuSubTrigger>
                      Grade {grade}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {gradeCourses.map((course) => (
                        <DropdownMenuItem
                          key={course.id}
                          onSelect={() => handleCourseSelect(course)}
                        >
                          {course.Title}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Diploma Section */}
          {diplomaSelectSection}

          {/* Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <DatePicker
                selected={startDate}
                onChange={handleStartDateChange}
                dateFormat="MMM dd, yyyy"
                placeholderText="Select start date"
                className={`w-full border rounded px-3 py-2 mt-1 ${!canSelectStartDate ? 'opacity-50 cursor-not-allowed' : ''}`}
                minDate={minStartDate}
                maxDate={endDate} // Add maxDate constraint
                calendarStartDay={1}
                withPortal
                disabled={!canSelectStartDate}
              />
              {!canSelectStartDate && isDiplomaCourse && !selectedDiplomaDate && !alreadyWroteDiploma && (
                <p className="text-sm text-gray-600 mt-1">Please select a diploma date first</p>
              )}
            </div>
            <div>
              <Label>End Date</Label>
              <DatePicker
                selected={endDate}
                onChange={handleEndDateChange} // Use new handler
                dateFormat="MMM dd, yyyy"
                placeholderText="Select end date"
                className={`w-full border rounded px-3 py-2 mt-1 ${!canSelectEndDate ? 'opacity-50 cursor-not-allowed' : ''}`}
                minDate={startDate ? startDate : addMonths(minStartDate, 1)} // Update minDate logic
                maxDate={startDate ? addYears(startDate, 1) : null}
                disabled={!canSelectEndDate || (isDiplomaCourse && !alreadyWroteDiploma && selectedDiplomaDate)}
                calendarStartDay={1}
                withPortal
                monthsShown={1}
                openToDate={startDate ? getDefaultEndDate(startDate) : null}
              />
              {/* Updated end date message logic */}
              {isDiplomaCourse && !alreadyWroteDiploma && selectedDiplomaDate ? (
                <p className="text-sm text-gray-600 mt-1">
                  End date is fixed to your selected diploma date: {format(parseISO(selectedDiplomaDate.displayDate), 'MMM dd, yyyy')}
                </p>
              ) : (
                !canSelectEndDate && startDate && (
                  <p className="text-sm text-gray-600 mt-1">Please select a start date first</p>
                )
              )}
            </div>
          </div>

          {/* Combined Study Time and Distribution section */}
          {startDate && endDate && courseHours && (
            <div className="space-y-4">
              {/* Study Time Required - Enhanced styling */}
              <div className="p-6 bg-gradient-to-br from-slate-50 to-white rounded-lg border border-slate-200 shadow-sm">
                <h5 className="font-semibold text-lg mb-3">Study Time Required</h5>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    This is a <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">{courseHours}-hour</span> course. 
                    Based on your selected schedule, you will need to study approximately{' '}
                    <span className="font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded">
                      {calculateHoursPerWeek(startDate, endDate, courseHours)}
                    </span>{' '}
                    hours per week.
                  </p>
                  
                  {parseFloat(calculateHoursPerWeek(startDate, endDate, courseHours)) > 20 && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-md border border-amber-200">
                      <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                      <p className="text-amber-700">
                        This schedule may be intensive. Consider extending your end date for a more manageable pace.
                      </p>
                    </div>
                  )}
                  
                  {parseFloat(calculateHoursPerWeek(startDate, endDate, courseHours)) < 3 && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-md border border-amber-200">
                      <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                      <p className="text-amber-700">
                        This schedule is quite spread out. Consider reducing the duration to maintain momentum.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Time Distribution - stays the same but moved inside the condition */}
              <div className="p-6 bg-gradient-to-br from-slate-50 to-white rounded-lg border border-slate-200 shadow-sm">
                <h5 className="font-semibold text-lg mb-3">Estimated Time Distribution</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(typeDistribution).map(([type, data]) => {
                    const hours = Math.floor(data.totalMinutes / 60);
                    const minutes = data.totalMinutes % 60;
                    const colors = getEventColor(type);
                    
                    return (
                      <div
                        key={type}
                        className="p-3 rounded-md"
                        style={{
                          background: colors.background,
                          color: colors.color
                        }}
                      >
                        <div className="font-medium">{getTypeDisplayName(type)}</div>
                        <div className="text-sm">
                          {data.count} {data.count === 1 ? 'item' : 'items'} • {hours}h {minutes}m total
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Break Options */}
          <div>
            <button
              className="flex items-center space-x-2"
              onClick={() => setShowBreakOptions(!showBreakOptions)}
            >
              {showBreakOptions ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <span>Schedule Breaks & Days Off</span>
            </button>
            
            {showBreakOptions && (
              <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                {/* Add a helpful description */}
                <div className="text-sm text-gray-600 mb-4">
                  <p>Customize when you'll be taking breaks from your studies. Your schedule will be created around these dates.</p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="excludeWeekends"
                    checked={excludeWeekends}
                    onChange={(e) => setExcludeWeekends(e.target.checked)}
                    className="mr-2"
                  />
                  <Label htmlFor="excludeWeekends">Keep Weekends Free</Label>
                </div>
                
                {/* Keep CustomBlockoutDates component name but update the rendered content */}
                <div className="mt-4">
                  <Label className="text-base font-medium">Plan Additional Breaks</Label>
                  <p className="text-sm text-gray-600 mt-1 mb-3">
                    Add dates when you won't be studying (e.g., vacations, appointments, or other commitments)
                  </p>
                  <CustomBlockoutDates
                    customBlockoutDates={customBlockoutDates}
                    setCustomBlockoutDates={setCustomBlockoutDates}
                  />
                </div>

                {customBlockoutDates.length > 0 && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-700">
                      Your schedule will be adjusted to work around these breaks while keeping you on track to complete your course.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <Button
            onClick={handleCreateSchedule}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-colors"
            disabled={!selectedCourse || !startDate || !endDate || (isDiplomaCourse && !alreadyWroteDiploma && !selectedDiplomaDate)}
          >
            Create Schedule
          </Button>
        </div>
      </FeatureCard>

      {scheduleData && (
        <FeatureCard 
          ref={scheduleRef}
          title="Your Schedule"
          className="bg-gradient-to-br from-muted to-background"
        >
          <Tabs defaultValue="calendar" className="w-full">
            <TabsList className="w-full bg-transparent grid grid-cols-2 gap-4"> {/* Updated styling here */}
              <TabsTrigger 
                value="calendar"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white px-8" // Added more horizontal padding
              >
                Calendar View
              </TabsTrigger>
              <TabsTrigger 
                value="list"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white px-8" // Added more horizontal padding
              >
                List View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar">
              <>
                <Calendar
                  localizer={localizer}
                  events={getCalendarEvents()}
                  startAccessor="start"
                  endAccessor="end"
                  views={['month']}
                  defaultView="month"
                  onSelectEvent={handleEventSelect}
                  onShowMore={(events, date) => {
                    setShowMoreEvents(events);
                    setShowMoreDate(date);
                  }}
                  {...calendarStyles}
                />

                {/* Add Dialog for showing more events */}
                <Dialog 
                  open={showMoreEvents !== null} 
                  onOpenChange={() => {
                    setShowMoreEvents(null);
                    setShowMoreDate(null);
                  }}
                >
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        Events for {showMoreDate ? format(showMoreDate, 'MMMM d, yyyy') : ''}
                      </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh]">
                      {showMoreEvents?.map((event, index) => {
                        const colors = getEventColor(event.type);
                        return (
                          <div
                            key={index}
                            className="mb-2 p-2 rounded cursor-pointer hover:opacity-90"
                            style={{
                              background: colors.background,
                              color: colors.color
                            }}
                            onClick={() => {
                              handleEventSelect(event);
                              setShowMoreEvents(null);
                              setShowMoreDate(null);
                            }}
                          >
                            <p className="font-medium">{event.title}</p>
                            <p className="text-sm opacity-75">{event.type}</p>
                          </div>
                        );
                      })}
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </>
            </TabsContent>

            <TabsContent value="list">
              <ScrollArea className="h-[500px]">
                {scheduleData.units.map((unit, idx) => (
                  <div key={idx} className="mb-4">
                    <h3 className="font-semibold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {unit.name}
                    </h3>
                    {unit.items.map((item, itemIdx) => {
                      const colors = getEventColor(item.type);
                      return (
                        <div
                          key={itemIdx}
                          className={`ml-4 py-2 px-3 my-2 cursor-pointer rounded-lg transition-colors`}
                          style={{
                            background: colors.background,
                            color: colors.color
                          }}
                          onClick={() => handleEventSelect({ details: item })}
                        >
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm opacity-75">
                            {format(parseISO(item.date), 'MMM dd, yyyy')} - {item.type}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </FeatureCard>
      )}

      {/* Updated Dialog component */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {selectedEvent && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p><strong>Type:</strong> {selectedEvent.type}</p>
                  <p><strong>Date:</strong> {format(parseISO(selectedEvent.date), 'MMM dd, yyyy')}</p>
                  {selectedEvent.type !== 'exam' && (
                    <p>
                      <strong>Estimated Time:</strong>{' '}
                      {selectedEvent.estimatedMinutes >= 60 
                        ? `${Math.floor(selectedEvent.estimatedMinutes / 60)}h ${selectedEvent.estimatedMinutes % 60}m`
                        : `${selectedEvent.estimatedMinutes}m`
                      }
                    </p>
                  )}
                </div>

                {/* Conditional messages based on type */}
                {selectedEvent.type === 'exam' && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription className="text-blue-700">
                      This exam is a 3-hour assessment that you can complete from home. While this date appears in your schedule, you are not required to write the exam specifically on this day. You'll have access to a variety of available dates and times to choose from through our online booking system. The exam is conducted via secure video supervision to maintain academic integrity.
                    </AlertDescription>
                  </Alert>
                )}

                {selectedEvent.type === 'lesson' && (
                  <Alert className="bg-green-50 border-green-200">
                    <AlertDescription className="text-green-700">
                      While this date is not a hard deadline, maintaining this general pace will help you stay On Track with your course progress.
                    </AlertDescription>
                  </Alert>
                )}

                {selectedEvent.type === 'assignment' && (
                  <Alert className="bg-purple-50 border-purple-200">
                    <AlertDescription className="text-purple-700">
                      These assignments can be completed from home at your own pace. While the date shown is not a strict deadline, staying close to this schedule will help you maintain steady progress through your course.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default YourWayScheduleMaker;