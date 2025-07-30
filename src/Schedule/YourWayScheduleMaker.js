import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { getDatabase, ref, get, set } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../context/AuthContext';
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
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
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
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Label } from '../components/ui/label';
import { ScrollArea } from '../components/ui/scroll-area';
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { ChevronDown, ChevronRight, AlertTriangle, InfoIcon, CalendarIcon, Clock, CalendarClock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import CustomBlockoutDates from './CustomBlockoutDates';

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

// Create DnD Calendar component after the locales setup
const DragAndDropCalendar = withDragAndDrop(Calendar);

// Calculate expected time for each type
const calculateExpectedTimes = (course, totalHours) => {
  const items = course.units.flatMap(unit => unit.items);
  const examCount = items.filter(item => item.type?.toLowerCase() === 'exam').length;
  const assignmentCount = items.filter(item => item.type?.toLowerCase() === 'assignment').length;
  const lessonCount = items.filter(item => item.type?.toLowerCase() === 'lesson').length;

  // Calculate total hours taken by exams and assignments
  const examHours = examCount * 2; // 2 hours per exam
  const assignmentHours = assignmentCount * 1; // 1 hour per assignment

  // Calculate remaining hours for lessons
  const remainingHours = Math.max(0, totalHours - examHours - assignmentHours);
  const lessonHours = lessonCount > 0 ? remainingHours / lessonCount : 0;

  return {
    exam: 2 * 60, // 2 hours in minutes
    assignment: 1 * 60, // 1 hour in minutes
    lesson: Math.round(lessonHours * 60), // Convert to minutes
  };
};

// Get expected time for a specific item
const getExpectedTime = (item, expectedTimes) => {
  const type = item.type?.toLowerCase();
  return expectedTimes[type] || 0;
};

// Format minutes as hours and minutes
const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
};

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

// Modify the calculateItemMinutes function to handle different types
const calculateItemMinutes = (totalMinutes, totalMultiplier, itemMultiplier, itemType) => {
  // For assignments and exams, return fixed durations
  if (itemType?.toLowerCase() === 'assignment') {
    return 60; // 1 hour in minutes
  }
  if (itemType?.toLowerCase() === 'exam') {
    return 120; // 2 hours in minutes
  }

  // For lessons and other types, calculate based on multiplier.
  // Use the provided multiplier if defined; otherwise, default to 1.
  const effectiveMultiplier = itemMultiplier !== undefined ? itemMultiplier : 1;
  const minutesPerUnit = totalMinutes / totalMultiplier;
  return Math.round(minutesPerUnit * effectiveMultiplier);
};


// Function to map event types to colors
const getEventColor = (type) => {
  switch (type?.toLowerCase()) {
    case 'assignment':
      return {
        background: 'linear-gradient(to right, #DBEAFE, #93C5FD)',
        color: '#1E3A8A'
      };
    case 'quiz':
      return {
        background: 'linear-gradient(to right, #EDE9FE, #C4B5FD)',
        color: '#4C1D95'
      };
    case 'exam':
      return {
        background: 'linear-gradient(to right, #E0E7FF, #A5B4FC)',
        color: '#312E81'
      };
    case 'reading':
      return {
        background: 'linear-gradient(to right, #FCE7F3, #F9A8D4)',
        color: '#831843'
      };
    case 'info':
      return {
        background: 'linear-gradient(to right, #E5E7EB, #D1D5DB)',
        color: '#1F2937'
      };
    default:
      return {
        background: 'linear-gradient(to right, #F1F5F9, #CBD5E1)',
        color: '#0F172A'
      };
  }
};

// Update the EventComponent to show times differently based on type
const EventComponent = ({ event }) => {
  const type = event.type?.toLowerCase();
  const minutes = event.details.estimatedMinutes;

  if (type === 'info') {
    return (
      <div className="text-xs">
        <div>{event.title}</div>
      </div>
    );
  }

  if (type === 'assignment' || type === 'exam') {
    const timeDisplay = type === 'assignment' ? '1h' : '2h';
    return (
      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        <div>{event.title}</div>
        <div className="opacity-75">{timeDisplay}</div>
      </div>
    );
  }

  if (type === 'lesson') {
    const timeDisplay = minutes >= 60 
      ? `${Math.floor(minutes / 60)}h ${minutes % 60}m`
      : `${minutes}m`;

    return (
      <div className="text-xs">
        <div>{event.title}</div>
        <div className="opacity-75">Available: {timeDisplay}</div>
      </div>
    );
  }

  return (
    <div className="text-xs">
      <div>{event.title}</div>
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
      <div></div>
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

const YourWayScheduleMaker = ({
  course = null,
  //defaultStartDate = null,
  defaultEndDate = null,
  onScheduleSaved = () => {},
  disableDirectSave = false, // New prop to disable direct saving when used within YourWayScheduleCreator
}) => {
  const { user, user_email_key, authLoading } = useAuth();

  const [startDate, setStartDate] = useState(() => {
    if (course?.ScheduleStartDate) {
      return parseISO(course.ScheduleStartDate);
    }
    return new Date();
  });
  const [endDate, setEndDate] = useState(() => {
    if (course?.ScheduleEndDate) {
      return parseISO(course.ScheduleEndDate);
    }
    return defaultEndDate || null;
  });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState({});
  const [registrationSettings, setRegistrationSettings] = useState(null);

  const [excludeWeekends, setExcludeWeekends] = useState(false);
  const [showBreakOptions, setShowBreakOptions] = useState(false);
  const [scheduleData, setScheduleData] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [courseHours, setCourseHours] = useState(null);

  const [isDiplomaCourse, setIsDiplomaCourse] = useState(false);
  const [diplomaDates, setDiplomaDates] = useState([]);
  const [selectedDiplomaDate, setSelectedDiplomaDate] = useState(null);
  const [alreadyWroteDiploma, setAlreadyWroteDiploma] = useState(false);
  const [hasExistingDiplomaDate, setHasExistingDiplomaDate] = useState(false);
  const [existingDiplomaInfo, setExistingDiplomaInfo] = useState(null);
  const [minCompletionMonths, setMinCompletionMonths] = useState(null);
  const [recommendedCompletionMonths, setRecommendedCompletionMonths] = useState(null);

  const [customBlockoutDates, setCustomBlockoutDates] = useState([]);
  const scheduleRef = useRef(null);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(startDate || new Date());

  const [scheduleCreated, setScheduleCreated] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showMoreEvents, setShowMoreEvents] = useState(null);
  const [showMoreDate, setShowMoreDate] = useState(null);

  // Modified state for starting assignment
  const [startingAssignmentOptions, setStartingAssignmentOptions] = useState([]);
  const [selectedStartingAssignment, setSelectedStartingAssignment] = useState(null);
  const [forceAssignmentSelection, setForceAssignmentSelection] = useState(true);

  const [allCourseItems, setAllCourseItems] = useState([]);
  const [hasExistingSchedule, setHasExistingSchedule] = useState(false);
  const [existingSchedule, setExistingSchedule] = useState(null);
  const [scheduleJson, setScheduleJson] = useState(null);

  const getMinEndDate = (startDate) => {
    if (!startDate) {
      return addDays(minStartDate, 15);
    }
    
    // Use the greater of 15 days or minCompletionMonths
    const fifteenDaysLater = addDays(startDate, 15);
    
    if (minCompletionMonths) {
      // Convert months to days (30 days per month)
      const minCompletionDays = minCompletionMonths * 30;
      const minCompletionDate = addDays(startDate, minCompletionDays);
      
      // Return the later date
      return minCompletionDate > fifteenDaysLater ? minCompletionDate : fifteenDaysLater;
    }
    
    return fifteenDaysLater;
  };

  useEffect(() => {
    // Prioritize course.ScheduleEndDate over defaultEndDate
    if (course?.ScheduleEndDate) {
      setEndDate(parseISO(course.ScheduleEndDate));
    } else if (defaultEndDate) {
      setEndDate(defaultEndDate);
    }
  }, [defaultEndDate, course]);

  useEffect(() => {
    if (course) {
      const fetchCourseById = async (id) => {
        const db = getDatabase();
        const courseRef = ref(db, `courses/${id}`);
        try {
          const snapshot = await get(courseRef);
          if (snapshot.exists()) {
            const courseData = snapshot.val();
            setSelectedCourse({
              id,
              ...courseData,
            });
            handleCourseData(courseData, id);
          } else {
            console.error("Course not found");
            toast.error("Course not found");
          }
        } catch (error) {
          console.error("Error fetching course:", error);
          toast.error("Failed to load course");
        } finally {
          setLoading(false);
        }
      };
      fetchCourseById(course.CourseID);
      
      // Fetch registration settings if available
      if (course.registrationSettingsPath) {
        // Pass the timeSectionId only if it's explicitly provided
        fetchRegistrationSettings(course.registrationSettingsPath, course.timeSectionId || null);
      }
    } else {
      fetchAllCourses();
    }
  }, [course]);

  const fetchAllCourses = async () => {
    const db = getDatabase();
    const coursesRef = ref(db, "courses");

    try {
      const snapshot = await get(coursesRef);
      if (snapshot.exists()) {
        const coursesData = snapshot.val();
        const validCourses = Object.entries(coursesData)
          .filter(([id, course]) => {
            return (
              id !== "sections" &&
              course?.Active === "Current" &&
              course?.Title &&
              course?.units
            );
          })
          .reduce((acc, [id, course]) => {
            const grade = course.grade || "Other";
            if (!acc[grade]) {
              acc[grade] = [];
            }
            acc[grade].push({
              id,
              ...course,
            });
            return acc;
          }, {});

        Object.keys(validCourses).forEach((grade) => {
          validCourses[grade].sort((a, b) => {
            if (a.Title && b.Title) {
              return a.Title.localeCompare(b.Title);
            }
            return 0;
          });
        });

        const sortedCourses = Object.keys(validCourses)
          .sort((a, b) => {
            if (a === "Other") return 1;
            if (b === "Other") return -1;
            return parseInt(a) - parseInt(b);
          })
          .reduce((obj, key) => {
            obj[key] = validCourses[key];
            return obj;
          }, {});

        setCourses(sortedCourses);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleCourseData = async (courseData, id) => {
    const isDiploma = courseData.DiplomaCourse === "Yes";
    setIsDiplomaCourse(isDiploma);

    if (isDiploma && courseData.diplomaTimes) {
      const diplomaTimesArray = Array.isArray(courseData.diplomaTimes)
        ? courseData.diplomaTimes
        : Object.values(courseData.diplomaTimes);

      const validDates = diplomaTimesArray
        .filter((item) => new Date(item.displayDate) > new Date())
        .sort((a, b) => new Date(a.displayDate) - new Date(b.displayDate));

      setDiplomaDates(validDates);
    }

    // Check if student already has a diploma date registered
    if (isDiploma && course?.DiplomaMonthChoices?.Value) {
      const diplomaChoice = course.DiplomaMonthChoices.Value;
      
      if (diplomaChoice === "Already Wrote") {
        setAlreadyWroteDiploma(true);
        setHasExistingDiplomaDate(false);
        setExistingDiplomaInfo(null);
      } else {
        // Student has an existing diploma date - make it read-only
        setHasExistingDiplomaDate(true);
        setAlreadyWroteDiploma(false);
        
        // Try to find the matching diploma time info
        let diplomaInfo = null;
        if (courseData.diplomaTimes) {
          const diplomaTimesArray = Array.isArray(courseData.diplomaTimes)
            ? courseData.diplomaTimes
            : Object.values(courseData.diplomaTimes);
          
          diplomaInfo = diplomaTimesArray.find(date => 
            date.month === diplomaChoice || 
            date.id === diplomaChoice ||
            date.displayName === diplomaChoice
          );
        }
        
        setExistingDiplomaInfo({
          choice: diplomaChoice,
          displayInfo: diplomaInfo
        });
        
        // Set the end date based on existing diploma date if we have the full info
        if (diplomaInfo && diplomaInfo.displayDate) {
          setEndDate(parseISO(diplomaInfo.displayDate));
        }
      }
    } else if (isDiploma) {
      // Diploma course but no existing choice - allow selection
      setHasExistingDiplomaDate(false);
      setExistingDiplomaInfo(null);
      setAlreadyWroteDiploma(false);
    }

    if (courseData.NumberOfHours) {
      setCourseHours(courseData.NumberOfHours);
    }
    
    // Fetch minimum completion months
    if (courseData.minCompletionMonths) {
      setMinCompletionMonths(courseData.minCompletionMonths);
    } else {
      setMinCompletionMonths(null);
    }
    
    // Fetch recommended completion months
    if (courseData.recommendedCompletionMonths) {
      setRecommendedCompletionMonths(courseData.recommendedCompletionMonths);
    } else {
      setRecommendedCompletionMonths(null);
    }
  };

  const encodeEmailForPath = (email) => {
    return email ? email.replace(/[.#$\[\]]/g, ',') : null;
  };

  const handleCourseSelect = async (course) => {
    setStartDate(null);
    setEndDate(null);
    setSelectedDiplomaDate(null);
    setAlreadyWroteDiploma(false);
    setIsDiplomaCourse(false);
    setDiplomaDates([]);
    setHasExistingDiplomaDate(false);
    setExistingDiplomaInfo(null);
    setSelectedCourse(course);
    setHasExistingSchedule(false);
    setExistingSchedule(null);
    setScheduleJson(null);
    setMinCompletionMonths(null);
    setRecommendedCompletionMonths(null);

    try {
      const db = getDatabase();
      const courseRef = ref(db, `courses/${course.id}`);
      const snapshot = await get(courseRef);

      if (snapshot.exists()) {
        const courseData = snapshot.val();
        await handleCourseData(courseData, course.id);
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
      toast.error('Failed to load course details');
    }
  };

  useEffect(() => {
    if (selectedCourse) {
      const expectedTimes = calculateExpectedTimes(selectedCourse, courseHours);
    }
  }, [selectedCourse, courseHours]);

  // Fetch registration settings from Firebase
  const fetchRegistrationSettings = async (registrationSettingsPath, timeSectionId) => {
    const db = getDatabase();
    try {
      // Check if the path already includes the full time section path
      let targetPath = registrationSettingsPath;
      
      // If the path doesn't already include 'timeSections', append it
      if (!registrationSettingsPath.includes('/timeSections/')) {
        targetPath = `${registrationSettingsPath}/timeSections/${timeSectionId}`;
      }
      
      console.log('Fetching registration settings from path:', targetPath);
      const timeSectionRef = ref(db, targetPath);
      const snapshot = await get(timeSectionRef);
      
      if (snapshot.exists()) {
        const settings = snapshot.val();
        console.log('Registration settings loaded:', settings);
        console.log('Start begins:', settings.startBegins, 'Start ends:', settings.startEnds);
        console.log('Completion begins:', settings.completionBegins, 'Completion ends:', settings.completionEnds);
        setRegistrationSettings(settings);
      } else {
        console.warn('No registration settings found at path:', targetPath);
      }
    } catch (error) {
      console.error('Error fetching registration settings:', error);
    }
  };

  // Modified useEffect for starting assignment options
  useEffect(() => {
    if (selectedCourse) {
      // Flatten all items from all units into a single array
      const flattenedItems = selectedCourse.units.flatMap(unit => 
        unit.items.map(item => ({
          ...item,
          unitName: unit.name
        }))
      );
      setAllCourseItems(flattenedItems);
      
      // Create options for the dropdown (only needed for existing schedules)
      const assignmentOptions = flattenedItems.map((item, index) => ({
        value: index,
        label: item.title,
        type: item.type,
        unitName: item.unitName
      }));
      setStartingAssignmentOptions(assignmentOptions);
      
      // For new schedules, automatically select the first assignment
      if (!hasExistingSchedule && assignmentOptions.length > 0) {
        setSelectedStartingAssignment(assignmentOptions[0]);
        setForceAssignmentSelection(false);
      } else {
        // For existing schedules, clear selection until user chooses
        setSelectedStartingAssignment(null);
        setForceAssignmentSelection(true);
      }
    } else {
      setAllCourseItems([]);
      setStartingAssignmentOptions([]);
      setSelectedStartingAssignment(null);
    }
  }, [selectedCourse, hasExistingSchedule]);

  useEffect(() => {
    if (scheduleData?.startDate) {
      setCurrentCalendarDate(parseISO(scheduleData.startDate));
    }
  }, [scheduleData]);

  // Calculate date constraints based on registration settings or defaults
  const getMinStartDate = () => {
    if (registrationSettings?.startBegins) {
      try {
        const settingsStartDate = parseISO(registrationSettings.startBegins);
        const today = new Date();
        // Use the later of today or the registration settings start date
        return settingsStartDate > today ? settingsStartDate : today;
      } catch (error) {
        console.error('Error parsing registration settings start begins date:', registrationSettings.startBegins, error);
        return startOfDay(new Date());
      }
    }
    // Default: today
    return startOfDay(new Date());
  };
  
  // Get the maximum date allowed for start date
  const getMaxStartDate = () => {
    if (registrationSettings?.startEnds) {
      try {
        return parseISO(registrationSettings.startEnds);
      } catch (error) {
        console.error('Error parsing registration settings start ends date:', registrationSettings.startEnds, error);
      }
    }
    // No maximum if not specified
    return null;
  };

  const getMaxEndDate = () => {
    if (registrationSettings?.completionEnds) {
      try {
        return parseISO(registrationSettings.completionEnds);
      } catch (error) {
        console.error('Error parsing registration settings completion ends date:', registrationSettings.completionEnds, error);
      }
    }
    // Default: use course.ScheduleEndDate if no registration settings
    if (course?.ScheduleEndDate) {
      try {
        return parseISO(course.ScheduleEndDate);
      } catch (error) {
        console.error('Error parsing course end date:', course.ScheduleEndDate, error);
      }
    }
    return null;
  };

  const minStartDate = getMinStartDate();
  const maxStartDate = getMaxStartDate();
  const maxEndDate = getMaxEndDate();
  
  const getDefaultEndDate = (startDate) => {
    // Always use course.ScheduleEndDate to show current selection
    if (course?.ScheduleEndDate) {
      return parseISO(course.ScheduleEndDate);
    }
    // Fallback if no course end date exists
    const referenceDate = startDate || new Date();
    return addMonths(referenceDate, 5);
  };

  const handleStartDateChange = (date) => {
    if (endDate && date > endDate) {
      toast.error("Start date cannot be after end date");
      return;
    }
    
    // Check if start date exceeds registration period limit
    if (maxStartDate && date > maxStartDate) {
      toast.error(`Start date cannot be after ${format(maxStartDate, 'MMM dd, yyyy')} (registration period limit)`);
      return;
    }
    
    setStartDate(date);
    // Don't automatically change the end date if we already have one from the course
    if (!endDate && date) {
      const newEndDate = getDefaultEndDate(date);
      if (!isDiplomaCourse || alreadyWroteDiploma) {
        setEndDate(newEndDate);
      }
    }
  };

  const handleEndDateChange = (date) => {
    if (startDate && date < startDate) {
      toast.error("End date cannot be before start date");
      return;
    }
    
    const minEndDate = getMinEndDate(startDate);
    if (date < minEndDate) {
      if (minCompletionMonths) {
        const daysDifference = Math.round((minEndDate - startDate) / (1000 * 60 * 60 * 24));
        toast.error(`End date must be at least ${minCompletionMonths} month${minCompletionMonths > 1 ? 's' : ''} (${daysDifference} days) after start date`);
      } else {
        toast.error("End date must be at least 15 days after start date");
      }
      return;
    }
    
    // Check if end date exceeds registration settings limit
    if (maxEndDate && date > maxEndDate) {
      if (registrationSettings?.completionEnds) {
        toast.error(`End date cannot be after ${format(maxEndDate, 'MMM dd, yyyy')} (registration period limit)`);
      } else {
        toast.error(`End date cannot be after ${format(maxEndDate, 'MMM dd, yyyy')} (current course end date)`);
      }
      return;
    }
    
    setEndDate(date);
  };

  const canSelectDiplomaDate = selectedCourse && (!isDiplomaCourse || (diplomaDates.length > 0 && !hasExistingDiplomaDate));
  const canSelectStartDate = selectedCourse && 
    (!isDiplomaCourse || alreadyWroteDiploma || selectedDiplomaDate || hasExistingDiplomaDate);
  const canSelectEndDate = startDate && 
    (!isDiplomaCourse || alreadyWroteDiploma || !hasExistingDiplomaDate);

  const isDateExcluded = (date) => {
    if (excludeWeekends && isWeekend(date)) {
      return true;
    }
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
        
        const endDate = parseISO(selectedDate.displayDate);
        setEndDate(endDate);
      }
    }
  };

  const distributeItemsAcrossDates = (items, startDate, endDate) => {
    // Build an array of available dates (skipping weekends / blockouts)
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
    const allItems = items;
  
    // FIRST PASS: Calculate totalMultiplier for proportional scheduling.
    // Use the special multiplier for the first lesson.
    let totalMultiplier = 0;
    let firstLessonFound = false;
    allItems.forEach((item) => {
      const type = item.type?.toLowerCase();
      let multiplier;
      if (type === 'exam') {
        multiplier = 4;
      } else if (type === 'assignment') {
        multiplier = 2;
      } else if (type === 'lesson') {
        if (!firstLessonFound) {
          multiplier = 1.5; // Force first lesson to have a multiplier of 1.5
          firstLessonFound = true;
        } else {
          multiplier = item.multiplier !== undefined ? item.multiplier : 1;
        }
      } else {
        multiplier = item.multiplier !== undefined ? item.multiplier : 1;
      }
      totalMultiplier += multiplier;
    });
  
    let scheduledItems = [];
    let accumulatedMultiplier = 0;
    // Reset the flag for the second pass so that the first lesson is still detected correctly.
    firstLessonFound = false;
    const totalMinutes = courseHours * 60; // courseHours is from state
  
    // SECOND PASS: Loop through each item and assign a date based on its proportional weight.
    allItems.forEach((item) => {
      const type = item.type?.toLowerCase();
      let multiplier;
      if (type === 'exam') {
        multiplier = 4;
      } else if (type === 'assignment') {
        multiplier = 2;
      } else if (type === 'lesson') {
        if (!firstLessonFound) {
          multiplier = 1.5; // Again, force the first lesson to use 1.5
          firstLessonFound = true;
        } else {
          multiplier = item.multiplier !== undefined ? item.multiplier : 1;
        }
      } else {
        multiplier = item.multiplier !== undefined ? item.multiplier : 1;
      }
      
      accumulatedMultiplier += multiplier;
      
      // Calculate which available day the item should land on
      const idealDayIndex = Math.floor((accumulatedMultiplier / totalMultiplier) * (totalDays - 1));
      const scheduledDate = availableDates[Math.min(idealDayIndex, totalDays - 1)];
  
      // Pass the computed multiplier (which for the first lesson is 1.5) into your minutes calculation
      const estimatedMinutes = calculateItemMinutes(
        totalMinutes,
        totalMultiplier,
        multiplier,
        type
      );
  
      scheduledItems.push({
        ...item,
        date: scheduledDate.toISOString(),
        estimatedMinutes,
      });
    });
  
    return scheduledItems;
  };
  
  

  const scrollToSchedule = () => {
    setTimeout(() => {
      if (scheduleRef.current) {
        scheduleRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  // Modified handleCreateSchedule to enforce starting assignment selection
  const handleCreateSchedule = () => {
    if (!selectedCourse || !startDate || !endDate) {
      toast.error("Please select a course and specify start and end dates");
      return;
    }

    if (!selectedStartingAssignment) {
      toast.error("Please select your starting point in the course");
      setForceAssignmentSelection(true);
      return;
    }

    if (isDiplomaCourse && !alreadyWroteDiploma && !selectedDiplomaDate && !hasExistingDiplomaDate) {
      toast.error("Please select a diploma exam date");
      return;
    }
    
    // Validate minimum completion time
    const minEndDate = getMinEndDate(startDate);
    if (endDate < minEndDate) {
      if (minCompletionMonths) {
        const daysDifference = Math.round((minEndDate - startDate) / (1000 * 60 * 60 * 24));
        toast.error(`Schedule duration must be at least ${minCompletionMonths} month${minCompletionMonths > 1 ? 's' : ''} (${daysDifference} days)`);
      } else {
        toast.error("Schedule duration must be at least 15 days");
      }
      return;
    }

    const startingIndex = selectedStartingAssignment?.value || 0;
    const relevantItems = allCourseItems.slice(startingIndex);

    if (relevantItems.length === 0) {
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

    const itemsWithCreation = [scheduleCreationItem, ...relevantItems];

    const scheduledItems = distributeItemsAcrossDates(
      itemsWithCreation,
      utcStartDate,
      utcEndDate
    );

    if (scheduledItems.length === 0) return;

    const scheduledUnits = selectedCourse.units.map(unit => ({
      ...unit,
      items: scheduledItems.filter(item => 
        item.type === 'info' ? false :
        unit.items.some(unitItem => unitItem.title === item.title)
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
      courseId: selectedCourse.id,
      courseTitle: selectedCourse.Title,
      units: scheduledUnits,
      diplomaMonth: selectedDiplomaDate ? {
        month: selectedDiplomaDate.month,
        alreadyWrote: false
      } : alreadyWroteDiploma ? {
        month: "Already Wrote",
        alreadyWrote: true
      } : hasExistingDiplomaDate ? {
        month: existingDiplomaInfo?.choice || "Registered",
        alreadyWrote: false,
        existingRegistration: true
      } : null
    };

    setScheduleData(schedule);
    setScheduleCreated(true);
    scrollToSchedule();
  };

  const handleSaveSchedule = async () => {
    if (!scheduleData) {
      toast.error("Cannot save schedule. Missing schedule data.");
      return;
    }

    // If disableDirectSave is true, just pass the schedule data to onScheduleSaved
    // This prevents double saving when used within YourWayScheduleCreator
    if (disableDirectSave) {
      onScheduleSaved(scheduleData);
      return;
    }

    // Direct save path (when used standalone)
    if (!course?.CourseID || !user_email_key) {
      toast.error("Cannot save schedule. Missing required data.");
      return;
    }
  
    try {
      setSaving(true);
      const functions = getFunctions();
      const saveSchedule = httpsCallable(functions, 'saveStudentSchedule');
      
      const result = await saveSchedule({
        scheduleData,
        courseId: course.CourseID,
        isScheduleUpdate: false,
        note: {
          content: `📅 Schedule created via YourWay Schedule Builder.\nStart Date: ${format(new Date(scheduleData.startDate), 'MMM dd, yyyy')}\nEnd Date: ${format(new Date(scheduleData.endDate), 'MMM dd, yyyy')}`,
          author: user?.displayName || user?.email || 'Student',
          noteType: '📅'
        }
      });
      
      if (result.data.success) {
        toast.success("Schedule saved successfully!");
        onScheduleSaved(result.data.scheduleData);
      } else {
        toast.error(result.data.message || "Failed to save schedule");
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error(error.message || "Failed to save schedule. Please try again.");
    } finally {
      setSaving(false);
    }
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
        details: item,
      }))
    );
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event.details);
    setIsDialogOpen(true);
  };

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
        
        {hasExistingDiplomaDate ? (
          // Read-only display for existing diploma date
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {existingDiplomaInfo?.displayInfo ? 
                      formatDiplomaDate(existingDiplomaInfo.displayInfo) : 
                      existingDiplomaInfo?.choice || 'Registered for diploma exam'
                    }
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Your diploma exam date is already registered
                  </div>
                </div>
              </div>
            </div>
            
            <Alert className="bg-blue-50 border-blue-200">
              <InfoIcon className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                <div className="space-y-1">
                  <p className="font-medium">Diploma Date Set</p>
                  <p className="text-sm">
                    Your diploma exam date is already registered and cannot be changed through the schedule builder. 
                    If you need to change your diploma exam date, please contact your instructor.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          // Original selectable diploma date section
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
        )}

        {selectedDiplomaDate && !selectedDiplomaDate.confirmed && !hasExistingDiplomaDate && (
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

  // Modified section for starting assignment selection
  const startingAssignmentSection = selectedCourse && (
    <div className={`space-y-2 p-4 rounded-lg border ${
      hasExistingSchedule 
        ? 'bg-blue-50/50 border-blue-100' 
        : 'bg-gray-50/50 border-gray-100'
    }`}>
      <Label className={hasExistingSchedule ? 'text-blue-800' : 'text-gray-700'}>
        {hasExistingSchedule ? 'Current Progress' : 'Starting Point'}
      </Label>
      
      {hasExistingSchedule ? (
        // Only show selection for existing schedules
        <>
          <Select
            value={selectedStartingAssignment?.value?.toString()}
            onValueChange={(value) => {
              const option = startingAssignmentOptions.find(opt => opt.value.toString() === value);
              setSelectedStartingAssignment(option);
              setForceAssignmentSelection(false);
            }}
          >
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Select your current assignment" />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-[200px]">
                {startingAssignmentOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value.toString()}
                    className="flex flex-col space-y-1 py-2"
                  >
                    <span className="font-medium">{option.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {option.unitName} • {option.type}
                    </span>
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
          
          {forceAssignmentSelection && !selectedStartingAssignment && (
            <Alert variant="warning" className="mt-2">
              <AlertDescription className="text-yellow-800">
                Please select your current progress to continue. This helps ensure your new schedule aligns with where you are in the course.
              </AlertDescription>
            </Alert>
          )}
          
          <p className="text-sm text-blue-600">
            Select the assignment you're currently working on to update your schedule from this point forward.
          </p>
        </>
      ) : (
        // For new schedules, just show the first assignment as the starting point
        <>
          <div className="p-3 bg-white border rounded-md">
            <div className="font-medium text-gray-900">
              {selectedStartingAssignment?.label}
            </div>
            {selectedStartingAssignment && (
              <div className="text-sm text-gray-500 mt-1">
                {selectedStartingAssignment.unitName} • {selectedStartingAssignment.type}
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600">
            Your schedule will begin with the first lesson in the course.
          </p>
        </>
      )}
    </div>
  );

  const isEndDateValid = (date) => {
    return date && date > new Date();
  };

  useEffect(() => {
    if (authLoading || !user || !user_email_key || !course?.CourseID) return;
  
    const db = getDatabase();
    const scheduleJSONRef = ref(db, `students/${encodeEmailForPath(user_email_key)}/courses/${course.CourseID}/ScheduleJSON`);
    const scheduleRef = ref(db, `students/${encodeEmailForPath(user_email_key)}/courses/${course.CourseID}/Schedule`);
    const scheduleStartDateRef = ref(db, `students/${encodeEmailForPath(user_email_key)}/courses/${course.CourseID}/ScheduleStartDate`);
    const scheduleEndDateRef = ref(db, `students/${encodeEmailForPath(user_email_key)}/courses/${course.CourseID}/ScheduleEndDate`);
  
    const fetchScheduleData = async () => {
      try {
        const [scheduleJSONSnapshot, scheduleSnapshot] = await Promise.all([
          get(scheduleJSONRef),
          get(scheduleRef)
        ]);
        
        setHasExistingSchedule(scheduleJSONSnapshot.exists() || scheduleSnapshot.exists());
  
        if (scheduleJSONSnapshot.exists()) {
          const data = scheduleJSONSnapshot.val();
          setExistingSchedule(data);
          setScheduleJson(data);
          setStartDate(parseISO(data.startDate)); 
          
          // Only set the end date if it's in the future
          const parsedEndDate = parseISO(data.endDate);
          if (isEndDateValid(parsedEndDate)) {
            setEndDate(parsedEndDate);
          } else {
            setEndDate(null);
          }
  
          // ... rest of the code
        } else {
          const startDateSnapshot = await get(scheduleStartDateRef);
          const endDateSnapshot = await get(scheduleEndDateRef);
          
          if (startDateSnapshot.exists() && endDateSnapshot.exists()) {
            const startDateString = startDateSnapshot.val();
            const endDateString = endDateSnapshot.val();
            
            const parsedStartDate = parseISO(startDateString);
            const parsedEndDate = parseISO(endDateString);
            
            setStartDate(parsedStartDate);
            // Only set the end date if it's in the future
            if (isEndDateValid(parsedEndDate)) {
              setEndDate(parsedEndDate);
            } else {
              setEndDate(null);
            }
          }
          setExistingSchedule(null);
        }
      } catch (error) {
        console.error('Error fetching schedule data:', error);
      }
    };
  
    fetchScheduleData();
  }, [course, user, authLoading, user_email_key, startingAssignmentOptions]);

  useEffect(() => {
    if (existingSchedule && startingAssignmentOptions.length > 0) {
      const firstItem = existingSchedule.units?.[0]?.items?.[0];
      if (firstItem) {
        const startingAssignmentOption = startingAssignmentOptions.find(option => 
          option.label === firstItem.title
        );
        if (startingAssignmentOption) {
          setSelectedStartingAssignment(startingAssignmentOption);
        }
      }
    }
  }, [existingSchedule, startingAssignmentOptions]);

  useEffect(() => {
    if (scheduleCreated) {
      // Additional logic if needed when schedule is created
    }
  }, [scheduleCreated]);

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
          {course ? (
            <div>
              <Label>Selected Course</Label>
              <p className="text-lg font-semibold">
                {selectedCourse ? selectedCourse.Title : "Loading..."}
              </p>
            </div>
          ) : (
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
          )}

          {startingAssignmentSection}

          {diplomaSelectSection}

          {/* Add the alert here */}
{!endDate && hasExistingSchedule && (
  <Alert className="mb-4 bg-yellow-50 border-yellow-200">
    <AlertTriangle className="h-4 w-4 text-yellow-600" />
    <AlertDescription className="text-yellow-700">
      Your previous end date has passed. Please select a new end date before choosing your start date.
    </AlertDescription>
  </Alert>
)}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>
                Start Date
                {registrationSettings?.startBegins && registrationSettings?.startEnds && (
                  <span className="text-xs text-gray-600 ml-2 font-normal">
                    Must be between {format(parseISO(registrationSettings.startBegins), 'MMM d, yyyy')} and {format(parseISO(registrationSettings.startEnds), 'MMM d, yyyy')}
                  </span>
                )}
              </Label>
              <DatePicker
  selected={startDate}
  onChange={handleStartDateChange}
  dateFormat="MMM dd, yyyy"
  placeholderText="Select start date"
  className={`w-full border rounded px-3 py-2 mt-1 ${
    (!canSelectStartDate || !endDate) ? 'opacity-50 cursor-not-allowed' : ''
  }`}
  minDate={minStartDate}
  maxDate={(() => {
    const dates = [];
    if (endDate) dates.push(endDate);
    if (maxStartDate) dates.push(maxStartDate);
    if (maxEndDate) dates.push(maxEndDate);
    return dates.length > 0 ? dates.reduce((min, date) => (date < min ? date : min)) : null;
  })()}
  calendarStartDay={1}
  withPortal
  disabled={!canSelectStartDate || !endDate}
/>
{!endDate && (
  <p className="text-sm text-gray-600 mt-1">Please select an end date first</p>
)}
              {!canSelectStartDate && isDiplomaCourse && !selectedDiplomaDate && !alreadyWroteDiploma && (
                <p className="text-sm text-gray-600 mt-1">Please select a diploma date first</p>
              )}
            </div>
            <div>
              <Label>
                End Date
                {!isDiplomaCourse || alreadyWroteDiploma ? (
                  registrationSettings?.completionBegins && registrationSettings?.completionEnds && (
                    <span className="text-xs text-gray-600 ml-2 font-normal">
                      Must be between {format(parseISO(registrationSettings.completionBegins), 'MMM d, yyyy')} and {format(parseISO(registrationSettings.completionEnds), 'MMM d, yyyy')}
                    </span>
                  )
                ) : hasExistingDiplomaDate ? (
                  <span className="text-xs text-gray-600 ml-2 font-normal">
                    Set by your registered diploma exam date
                  </span>
                ) : (
                  selectedDiplomaDate && (
                    <span className="text-xs text-gray-600 ml-2 font-normal">
                      Set by your selected diploma exam date
                    </span>
                  )
                )}
              </Label>
              <DatePicker
  selected={endDate}
  onChange={handleEndDateChange}
  dateFormat="MMM dd, yyyy"
  placeholderText="Select end date"
  className={`w-full border rounded px-3 py-2 mt-1 ${!canSelectEndDate || (isDiplomaCourse && hasExistingDiplomaDate) ? 'opacity-50 cursor-not-allowed' : ''}`}
  minDate={startDate ? getMinEndDate(startDate) : getMinEndDate(null)}
  maxDate={maxEndDate || (startDate ? addYears(startDate, 1) : null)}
  disabled={!canSelectEndDate || (isDiplomaCourse && !alreadyWroteDiploma && (selectedDiplomaDate || hasExistingDiplomaDate))}
  calendarStartDay={1}
  withPortal
  monthsShown={1}
  openToDate={startDate ? getDefaultEndDate(startDate) : null}
  preventOpenOnFocus={true}
/>
              {isDiplomaCourse && hasExistingDiplomaDate && endDate ? (
                <p className="text-sm text-gray-600 mt-1">
                  End date is set by your registered diploma exam date: {format(endDate, 'MMM dd, yyyy')}. Contact your instructor to change your diploma date.
                </p>
              ) : isDiplomaCourse && !alreadyWroteDiploma && selectedDiplomaDate ? (
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
          
          {/* Minimum duration warning */}
          {startDate && endDate && minCompletionMonths && (
            (() => {
              const minEndDate = getMinEndDate(startDate);
              if (endDate < minEndDate) {
                return (
                  <Alert className="mt-3 bg-red-50 border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                      This course requires a minimum of {minCompletionMonths} month{minCompletionMonths > 1 ? 's' : ''} ({minCompletionMonths * 30} days) to complete
                    </AlertDescription>
                  </Alert>
                );
              }
              return null;
            })()
          )}
          
          {/* Recommended completion months */}
          {recommendedCompletionMonths && (
            <div className="mt-3 text-sm text-gray-600">
              <InfoIcon className="h-4 w-4 inline mr-1" />
              Most students complete this course in {recommendedCompletionMonths} month{recommendedCompletionMonths > 1 ? 's' : ''}
            </div>
          )}

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="breaks">
              <AccordionTrigger className="hover:no-underline">
                Schedule Breaks & Days Off
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
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
                  <div>
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
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button
            onClick={handleCreateSchedule}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-colors"
            disabled={!selectedCourse || !startDate || !endDate || (isDiplomaCourse && !alreadyWroteDiploma && !selectedDiplomaDate && !hasExistingDiplomaDate)}
          >
            Create Schedule
          </Button>
          {!registrationSettings && course?.registrationSettingsPath && (
            <Alert className="mt-2">
              <AlertDescription>
                <InfoIcon className="inline h-4 w-4 mr-1" />
                Loading registration period restrictions...
              </AlertDescription>
            </Alert>
          )}
        </div>
      </FeatureCard>

      {scheduleData && (
        <FeatureCard 
          ref={scheduleRef}
          customHeader={
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-semibold flex items-center">
                <ChevronRight className="w-5 h-5 mr-2 text-primary" />
                Your Schedule
              </CardTitle>
              {course && (
                <Button 
                  onClick={handleSaveSchedule}
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    disableDirectSave ? 'Use This Schedule' : 'Save Schedule'
                  )}
                </Button>
              )}
            </CardHeader>
          }
          className="bg-gradient-to-br from-muted to-background"
        >
          <Tabs defaultValue="calendar" className="w-full">
            <TabsList className="w-full bg-transparent grid grid-cols-2 gap-4">
              <TabsTrigger 
                value="calendar"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white px-8"
              >
                Calendar View
              </TabsTrigger>
              <TabsTrigger 
                value="list"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white px-8"
              >
                List View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar">
              <EnhancedCalendarView
                events={getCalendarEvents()}
                localizer={localizer}
                isDateExcluded={isDateExcluded}
                setScheduleData={setScheduleData}
                scheduleData={scheduleData}
                setScheduleCreated={setScheduleCreated}
                currentCalendarDate={currentCalendarDate}
                setCurrentCalendarDate={setCurrentCalendarDate}
                handleEventSelect={handleEventSelect}
                showMoreEvents={showMoreEvents}
                setShowMoreEvents={setShowMoreEvents}
                showMoreDate={showMoreDate}
                setShowMoreDate={setShowMoreDate}
              />
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
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm opacity-75">{event.type}</div>
                        </div>
                      );
                    })}
                  </ScrollArea>
                </DialogContent>
              </Dialog>
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
                          <div className="font-medium">{item.title}</div>
                          <div className="text-sm opacity-75">
                            {format(parseISO(item.date), 'MMM dd, yyyy')} - {item.type}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </ScrollArea>
            </TabsContent>
          </Tabs>
          {course && (
            <div className="flex justify-end space-x-4 mt-4">
              <Button variant="outline" onClick={() => {
                setScheduleData(null);
                setScheduleCreated(false);
              }}>
                Back
              </Button>
              <Button 
                onClick={handleSaveSchedule}
                disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  disableDirectSave ? 'Use This Schedule' : 'Save Schedule'
                )}
              </Button>
            </div>
          )}
        </FeatureCard>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {selectedEvent && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div><strong>Type:</strong> {selectedEvent.type}</div>
                  <div><strong>Date:</strong> {format(parseISO(selectedEvent.date), 'MMM dd, yyyy')}</div>
                  {selectedEvent.type?.toLowerCase() !== 'info' && (
                    <div className="mt-4">
                      {selectedEvent.type?.toLowerCase() === 'lesson' ? (
                        <div className="flex items-center space-x-2">
                          <CalendarClock className="h-4 w-4 text-green-500" />
                          <div>
                            <div className="text-sm font-medium text-gray-600">Time Available</div>
                            <div className="text-green-600">
                              {selectedEvent.estimatedMinutes >= 60 
                                ? `${Math.floor(selectedEvent.estimatedMinutes / 60)}h ${selectedEvent.estimatedMinutes % 60}m`
                                : `${selectedEvent.estimatedMinutes}m`}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <div>
                            <div className="text-sm font-medium text-gray-600">Expected Time</div>
                            <div className="text-blue-600">
                              {selectedEvent.type?.toLowerCase() === 'assignment' ? '1 hour' : '2 hours'}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {selectedEvent.type === 'exam' && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription className="text-blue-700">
                      This exam will take 2 hours to complete. While this date appears in your schedule, you are not required to write the exam specifically on this day. You'll have access to a variety of available dates and times to choose from through our online booking system.
                    </AlertDescription>
                  </Alert>
                )}
                {selectedEvent.type === 'lesson' && (
                  <Alert className="bg-green-50 border-green-200">
                    <AlertDescription className="text-green-700">
                      You have {selectedEvent.estimatedMinutes >= 60 
                        ? `${Math.floor(selectedEvent.estimatedMinutes / 60)}h ${selectedEvent.estimatedMinutes % 60}m `
                        : `${selectedEvent.estimatedMinutes}m `} 
                      allocated in your schedule for this lesson. This timing allows you to work at your own pace while staying On Track with your course progress.
                    </AlertDescription>
                  </Alert>
                )}
                {selectedEvent.type === 'assignment' && (
                  <Alert className="bg-purple-50 border-purple-200">
                    <AlertDescription className="text-purple-700">
                      This assignment will take approximately 1 hour to complete. You can work on it at your own pace within your scheduled timeframe.
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

const EnhancedCalendarView = ({ 
  events, 
  localizer, 
  isDateExcluded,
  setScheduleData,
  scheduleData,
  setScheduleCreated,
  currentCalendarDate,
  setCurrentCalendarDate,
  handleEventSelect,
  showMoreEvents,
  setShowMoreEvents,
  showMoreDate,
  setShowMoreDate
}) => {
  const handleEventDrop = ({ event, start, end }) => {
    if (isDateExcluded(start)) {
      toast.error("You cannot move events to blocked dates (weekends or break periods)");
      return;
    }

    const updatedScheduleData = {
      ...scheduleData,
      units: scheduleData.units.map(unit => ({
        ...unit,
        items: unit.items.map(item => {
          if (item.title === event.title && 
              parseISO(item.date).getTime() === event.start.getTime()) {
            return {
              ...item,
              date: startOfDay(start).toISOString()
            };
          }
          return item;
        })
      }))
    };

    setScheduleData(updatedScheduleData);
    setScheduleCreated(true);
    toast.success(`Moved "${event.title}" to ${format(start, 'MMM dd, yyyy')}`);
    toast.info("Don't forget to save your changes!", { duration: 4000 });
  };

  const handleShowMore = (events, date) => {
    setShowMoreEvents(events);
    setShowMoreDate(date);
  };

  return (
    <div className="w-full min-h-[600px]">
      <DragAndDropCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={['month']}
        defaultView="month"
        date={currentCalendarDate}
        onNavigate={setCurrentCalendarDate}
        onSelectEvent={handleEventSelect}
        onEventDrop={handleEventDrop}
        resizable={false}
        popup
        popupOffset={5}
        showMultiDayTimes={false}
        onShowMore={handleShowMore}
        style={{ height: '100%', minHeight: '600px' }}
        className="rounded-lg shadow-sm p-2"
        eventPropGetter={(event) => {
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
              transition: 'opacity 0.2s ease, transform 0.2s ease',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              marginBottom: '1px', 
              position: 'relative',
              display: 'block',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              margin: '1px 0',
              zIndex: 1,
              minHeight: '20px',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
            }
          };
        }}
        dayPropGetter={date => ({
          className: `
            ${isWeekend(date) ? 'bg-slate-50/50' : 'bg-white'}
            hover:bg-blue-50/50 
            transition-colors
            ${isDateExcluded(date) ? 'bg-gray-100' : ''}
          `
        })}
        components={{
          event: EventComponent,
          toolbar: CustomToolbar
        }}
        length={3}
        formats={{
          eventTimeRangeFormat: () => '',
          timeGutterFormat: () => '',
        }}
      />
    </div>
  );
};

export default YourWayScheduleMaker;
