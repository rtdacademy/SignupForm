import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar, Plus, Edit, Trash, Check, Clock, AlertCircle, Info, CalendarCheck, Clock8, RepeatIcon, User, Home, Sun, Globe, GraduationCap } from 'lucide-react';
import { getDatabase, ref, update, get, push, remove } from 'firebase/database';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription, 
  SheetFooter
} from '../components/ui/sheet';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { ScrollArea } from '../components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from 'sonner';
import { Checkbox } from '../components/ui/checkbox';

// Import student type options
import { STUDENT_TYPE_OPTIONS } from '../config/DropdownOptions';

// Helper Functions
const formatDateForDatabase = (localDate) => {
  if (!localDate) return { date: null, displayDate: null, timezone: 'America/Edmonton' };
  
  const [year, month, day] = localDate.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 7));
  return {
    date: date.toISOString(),
    displayDate: localDate,
    timezone: 'America/Edmonton'
  };
};

// Updated to prioritize displayDate
const formatDateForDisplay = (dateObj) => {
  if (!dateObj) return '';
  
  // If displayDate is directly provided
  if (typeof dateObj === 'object' && dateObj.displayDate) {
    return dateObj.displayDate;
  }
  
  // If date is a string ISO format
  if (typeof dateObj === 'string') {
    const date = new Date(dateObj);
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
  
  // If date is an object with date field
  if (typeof dateObj === 'object' && dateObj.date) {
    return formatDateForDisplay(dateObj.date);
  }
  
  return '';
};

// Updated to prioritize displayDate
const formatDateForGrouping = (dateObj) => {
  if (!dateObj) return '';
  
  // If displayDate is directly provided
  if (typeof dateObj === 'object' && dateObj.displayDate) {
    const [year, month, day] = dateObj.displayDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  }
  
  // If date is a string ISO format
  if (typeof dateObj === 'string') {
    const date = new Date(dateObj);
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  }
  
  // If date is an object with date field
  if (typeof dateObj === 'object' && dateObj.date) {
    return formatDateForGrouping(dateObj.date);
  }
  
  return '';
};

// Updated for recurring events
const formatRecurringDateForDisplay = (dateObj) => {
  if (!dateObj) return '';
  
  // If displayDate is directly provided
  if (typeof dateObj === 'object' && dateObj.displayDate) {
    const [year, month, day] = dateObj.displayDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-CA', {
      month: 'long',
      day: 'numeric'
    });
  }
  
  // If date is a string ISO format
  if (typeof dateObj === 'string') {
    const date = new Date(dateObj);
    return date.toLocaleDateString('en-CA', {
      month: 'long',
      day: 'numeric'
    });
  }
  
  // If date is an object with date field
  if (typeof dateObj === 'object' && dateObj.date) {
    return formatRecurringDateForDisplay(dateObj.date);
  }
  
  return '';
};

// Updated to prioritize displayDate
const formatReadableDate = (dateObj) => {
  if (!dateObj) return 'Not set';
  
  // If displayDate is directly provided
  if (typeof dateObj === 'object' && dateObj.displayDate) {
    const [year, month, day] = dateObj.displayDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  // If date is a string ISO format
  if (typeof dateObj === 'string') {
    const date = new Date(dateObj);
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  // If date is an object with date field
  if (typeof dateObj === 'object' && dateObj.date) {
    return formatReadableDate(dateObj.date);
  }
  
  return 'Not set';
};

// Option definitions
const monthOptions = [
  { value: 'January', label: 'January' },
  { value: 'April', label: 'April' },
  { value: 'June', label: 'June' },
  { value: 'August', label: 'August' },
  { value: 'November', label: 'November' }
];

const timeOptions = Array.from({ length: 12 }, (_, i) => {
  const hour = i + 1;
  return { value: hour.toString(), label: hour.toString() };
});

const minuteOptions = Array.from({ length: 60 }, (_, i) => {
  const minute = i.toString().padStart(2, '0');
  return { value: minute, label: minute };
});

const periodOptions = [
  { value: 'AM', label: 'AM' },
  { value: 'PM', label: 'PM' }
];

const eventTypeOptions = [
  { value: 'Diploma', label: 'Diploma Exam' },
  { value: 'Registration', label: 'Registration Date' },
  { value: 'SchoolEvent', label: 'School Event' }
];

// Check if a date is in the past
const isPastDate = (dateObj) => {
  if (!dateObj) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to beginning of day
  
  // Handle different date formats
  let dateToCheck;
  
  if (typeof dateObj === 'object' && dateObj.displayDate) {
    const [year, month, day] = dateObj.displayDate.split('-').map(Number);
    dateToCheck = new Date(year, month - 1, day);
  } else if (typeof dateObj === 'string') {
    dateToCheck = new Date(dateObj);
  } else if (typeof dateObj === 'object' && dateObj.date) {
    return isPastDate(dateObj.date);
  } else {
    return false;
  }
  
  dateToCheck.setHours(0, 0, 0, 0); // Reset time to beginning of day
  return dateToCheck < today;
};

// Find closest future date
const findClosestFutureDate = (dates) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to beginning of day
  
  // Filter future dates
  const futureDates = dates.filter(date => {
    return !isPastDate(date);
  });
  
  if (futureDates.length === 0) return null;
  
  // Find closest date
  return futureDates.reduce((closest, current) => {
    let closestDate, currentDate;
    
    if (closest.displayDate) {
      const [year, month, day] = closest.displayDate.split('-').map(Number);
      closestDate = new Date(year, month - 1, day);
    } else {
      closestDate = new Date(closest.date);
    }
    
    if (current.displayDate) {
      const [year, month, day] = current.displayDate.split('-').map(Number);
      currentDate = new Date(year, month - 1, day);
    } else {
      currentDate = new Date(current.date);
    }
    
    return (currentDate - today) < (closestDate - today) ? current : closest;
  });
};

// For recurring events, check if the month and day match the current year
const isRecurringEventActive = (dateObj) => {
  if (!dateObj) return false;
  
  const today = new Date();
  let eventDate;
  
  if (typeof dateObj === 'object' && dateObj.displayDate) {
    const [year, month, day] = dateObj.displayDate.split('-').map(Number);
    eventDate = new Date(year, month - 1, day);
  } else if (typeof dateObj === 'string') {
    eventDate = new Date(dateObj);
  } else if (typeof dateObj === 'object' && dateObj.date) {
    return isRecurringEventActive(dateObj.date);
  } else {
    return false;
  }
  
  // Create a date using this year but with event's month and day
  const thisYearEventDate = new Date(
    today.getFullYear(),
    eventDate.getMonth(),
    eventDate.getDate()
  );
  
  // Check if that date is in the past relative to today
  return !isPastDate(thisYearEventDate);
};

// DiplomaDateEditor Component - for diploma exam dates
function DiplomaDateEditor({ time, onSave, onCancel, onDelete, isNew = false }) {
  const [editedTime, setEditedTime] = useState({ 
    ...time,
    // Ensure registrationDeadline fields exist
    registrationDeadline: time.registrationDeadline || null,
    registrationDeadlineDisplayDate: time.registrationDeadlineDisplayDate || ''
  });
  
  // Modified to call onSave after state changes
  const handleChange = (field, value) => {
    const updatedTime = { ...editedTime, [field]: value };
    setEditedTime(updatedTime);
    onSave(updatedTime); // Immediately update parent component
  };
  
  const handleDateChange = (e) => {
    const localDate = e.target.value;
    const { date, displayDate, timezone } = formatDateForDatabase(localDate);
    const updatedTime = {
      ...editedTime,
      date,
      displayDate,
      timezone
    };
    setEditedTime(updatedTime);
    onSave(updatedTime); // Immediately update parent component
  };

  const handleRegistrationDeadlineChange = (e) => {
    const localDate = e.target.value;
    const { date, displayDate } = formatDateForDatabase(localDate);
    const updatedTime = {
      ...editedTime,
      registrationDeadline: date,
      registrationDeadlineDisplayDate: displayDate
    };
    setEditedTime(updatedTime);
    onSave(updatedTime); // Immediately update parent component
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="font-medium text-base">Diploma Exam Information</Label>
      </div>
      
      <div>
        <Label>Exam Date</Label>
        <Input
          type="date"
          value={editedTime.displayDate || formatDateForDisplay(editedTime)}
          onChange={handleDateChange}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label>Hour</Label>
          <Select
            value={editedTime.hour}
            onValueChange={(value) => handleChange('hour', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Hour" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Minute</Label>
          <Select
            value={editedTime.minute}
            onValueChange={(value) => handleChange('minute', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Minute" />
            </SelectTrigger>
            <SelectContent>
              {minuteOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>AM/PM</Label>
          <Select
            value={editedTime.period}
            onValueChange={(value) => handleChange('period', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="AM/PM" />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Month</Label>
        <Select
          value={editedTime.month}
          onValueChange={(value) => handleChange('month', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={editedTime.confirmed || false}
          onCheckedChange={(checked) => handleChange('confirmed', checked)}
        />
        <Label>Confirmed</Label>
      </div>

      <Separator className="my-6" />

      {/* Registration Deadline Section */}
      <div>
        <Label className="font-medium text-base">Registration Deadline</Label>
        <p className="text-sm text-gray-500 mt-1 mb-4">
          The last date a student can register with our school to be eligible for this diploma exam.
        </p>
        
        <div>
          <Label>Registration Deadline Date</Label>
          <Input
            type="date"
            value={editedTime.registrationDeadlineDisplayDate || formatDateForDisplay({
              date: editedTime.registrationDeadline,
              displayDate: editedTime.registrationDeadlineDisplayDate
            })}
            onChange={handleRegistrationDeadlineChange}
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            Must be before the exam date.
          </p>
        </div>
      </div>
    </div>
  );
}

// GeneralDateEditor Component - for registration and other event types
function GeneralDateEditor({ event, onSave, onCancel, onDelete, isNew = false }) {
  const [editedEvent, setEditedEvent] = useState({
    id: event.id || `event-${Date.now()}`,
    type: event.type || 'Registration',
    title: event.title || '',
    description: event.description || '',
    recurring: event.recurring || false,
    ...formatDateForDatabase(event.displayDate || formatDateForDisplay(event) || new Date().toLocaleDateString('en-CA')),
    confirmed: event.confirmed || false,
    applicableStudentTypes: event.applicableStudentTypes || [] // Initialize with existing data or empty array
  });
  
  const handleDateChange = (e) => {
    const localDate = e.target.value;
    const { date, displayDate, timezone } = formatDateForDatabase(localDate);
    const updatedEvent = {
      ...editedEvent,
      date,
      displayDate,
      timezone
    };
    setEditedEvent(updatedEvent);
    onSave(updatedEvent); // Immediately update parent component
  };

  // Modified to call onSave after state changes
  const handleChange = (field, value) => {
    const updatedEvent = { ...editedEvent, [field]: value };
    setEditedEvent(updatedEvent);
    onSave(updatedEvent); // Immediately update parent component
  };

  // Handle student type checkbox changes
  const handleStudentTypeChange = (studentType, checked) => {
    const currentTypes = [...(editedEvent.applicableStudentTypes || [])];
    
    // Add or remove the student type based on checkbox state
    if (checked) {
      if (!currentTypes.includes(studentType)) {
        const updatedTypes = [...currentTypes, studentType];
        const updatedEvent = { ...editedEvent, applicableStudentTypes: updatedTypes };
        setEditedEvent(updatedEvent);
        onSave(updatedEvent);
      }
    } else {
      const updatedTypes = currentTypes.filter(type => type !== studentType);
      const updatedEvent = { ...editedEvent, applicableStudentTypes: updatedTypes };
      setEditedEvent(updatedEvent);
      onSave(updatedEvent);
    }
  };

  // Handle "all student types" checkbox
  const handleAllStudentTypesChange = (checked) => {
    if (checked) {
      // Select all student types
      const allTypes = STUDENT_TYPE_OPTIONS.map(option => option.value);
      const updatedEvent = { ...editedEvent, applicableStudentTypes: allTypes };
      setEditedEvent(updatedEvent);
      onSave(updatedEvent);
    } else {
      // Deselect all
      const updatedEvent = { ...editedEvent, applicableStudentTypes: [] };
      setEditedEvent(updatedEvent);
      onSave(updatedEvent);
    }
  };

  // Check if all student types are selected
  const isAllStudentTypesSelected = () => {
    const allTypes = STUDENT_TYPE_OPTIONS.map(option => option.value);
    return (
      editedEvent.applicableStudentTypes &&
      editedEvent.applicableStudentTypes.length === allTypes.length &&
      allTypes.every(type => editedEvent.applicableStudentTypes.includes(type))
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Event Type</Label>
        <Select
          value={editedEvent.type}
          onValueChange={(value) => handleChange('type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select event type" />
          </SelectTrigger>
          <SelectContent>
            {eventTypeOptions.filter(t => t.value !== 'Diploma').map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Title</Label>
        <Input
          value={editedEvent.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Enter event title"
          className="mt-1"
        />
      </div>
      
      <div>
        <Label>Date</Label>
        <Input
          type="date"
          value={editedEvent.displayDate || formatDateForDisplay(editedEvent)}
          onChange={handleDateChange}
          className="mt-1"
        />
        {editedEvent.recurring && (
          <p className="text-xs text-gray-500 mt-1">
            This event will repeat annually on this date regardless of year.
          </p>
        )}
      </div>
      
      <div>
        <Label>Description</Label>
        <Textarea
          value={editedEvent.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe the event"
          className="mt-1"
          rows={3}
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Switch
          checked={editedEvent.confirmed || false}
          onCheckedChange={(checked) => handleChange('confirmed', checked)}
        />
        <Label>Confirmed</Label>
      </div>
      
      {/* Recurring Event Option */}
      <div className="flex items-center gap-2">
        <Switch
          checked={editedEvent.recurring || false}
          onCheckedChange={(checked) => handleChange('recurring', checked)}
        />
        <div>
          <Label>Annual Recurring Event</Label>
          <p className="text-xs text-gray-500">
            Event repeats every year on the same date
          </p>
        </div>
      </div>

      {/* Student Types Section */}
      <Separator className="my-6" />
      
      <div>
        <Label className="font-medium text-base">Applicable Student Types</Label>
        <p className="text-sm text-gray-500 mt-1 mb-4">
          Select which student types this event applies to.
        </p>

        <div className="space-y-2 mt-4">
          {/* "All Student Types" option */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="all-student-types" 
              checked={isAllStudentTypesSelected()}
              onCheckedChange={handleAllStudentTypesChange}
            />
            <Label 
              htmlFor="all-student-types" 
              className="font-medium cursor-pointer"
            >
              All Student Types
            </Label>
          </div>

          <Separator className="my-2" />

          {/* Individual student type options */}
          {STUDENT_TYPE_OPTIONS.map(option => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox 
                id={`student-type-${option.value}`} 
                checked={editedEvent.applicableStudentTypes?.includes(option.value) || false}
                onCheckedChange={(checked) => handleStudentTypeChange(option.value, checked)}
              />
              <div className="flex items-center space-x-2">
                <div 
                  className="flex-shrink-0 w-4 h-4 rounded-full" 
                  style={{ backgroundColor: option.color }}
                />
                <Label 
                  htmlFor={`student-type-${option.value}`} 
                  className="cursor-pointer"
                >
                  {option.value}
                </Label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// AddDiplomaDateDialog Component
function AddDiplomaDateDialog({ courses, onAddDate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  
  // Create default time with today's date
  const today = new Date();
  const localDate = today.toLocaleDateString('en-CA', {
    timeZone: 'America/Edmonton',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  const { date, displayDate, timezone } = formatDateForDatabase(localDate);
  
  // Calculate a default registration deadline (30 days before exam date)
  const defaultDeadlineDate = new Date(today);
  defaultDeadlineDate.setDate(today.getDate() - 30);
  const defaultDeadlineLocalDate = defaultDeadlineDate.toLocaleDateString('en-CA', {
    timeZone: 'America/Edmonton',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  const { date: registrationDeadline, displayDate: registrationDeadlineDisplayDate } = 
    formatDateForDatabase(defaultDeadlineLocalDate);
  
  const defaultTime = {
    id: `diploma-time-${Date.now()}`,
    date,
    displayDate,
    timezone,
    month: 'January',
    hour: '9',
    minute: '00',
    period: 'AM',
    confirmed: false,
    registrationDeadline,
    registrationDeadlineDisplayDate
  };
  
  const [newTime, setNewTime] = useState(defaultTime);
  
  // Filter courses that are diploma courses
  const diplomaCourses = useMemo(() => {
    return Object.entries(courses)
      .filter(([_, course]) => course.DiplomaCourse === 'Yes')
      .map(([id, course]) => ({
        id,
        title: course.Title || `Course ID: ${id}`
      }));
  }, [courses]);
  
  // New function to handle updates from the editor
  const handleEditorUpdate = (updatedTime) => {
    setNewTime(updatedTime);
  };
  
  const handleSave = () => {
    if (!selectedCourse) {
      toast.error("Please select a course for this diploma exam date.");
      return;
    }
    
    onAddDate(selectedCourse, newTime);
    setIsOpen(false);
    // Reset form
    setSelectedCourse('');
    setNewTime({
      ...defaultTime,
      id: `diploma-time-${Date.now()}`
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center">
          <Plus className="h-4 w-4 mr-2" /> Add Diploma Date
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add Diploma Exam Date</DialogTitle>
          <DialogDescription>
            Add a new diploma exam date for a course.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <div className="py-4 pb-20"> {/* Added more bottom padding */}
            <div className="mb-4">
              <Label>Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {diplomaCourses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {diplomaCourses.length === 0 && (
                <p className="text-sm text-amber-600 mt-2">
                  No diploma courses available. Set a course as a Diploma Course in Course Management to add dates.
                </p>
              )}
            </div>
            
            <DiplomaDateEditor
              time={newTime}
              onSave={handleEditorUpdate} // Now properly updates parent state
              onCancel={() => setIsOpen(false)}
              onDelete={() => setIsOpen(false)}
              isNew={true}
            />
          </div>
        </ScrollArea>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// AddGeneralEventDialog Component
function AddGeneralEventDialog({ onAddEvent }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Create default event with today's date
  const today = new Date();
  const localDate = today.toLocaleDateString('en-CA', {
    timeZone: 'America/Edmonton',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  const { date, displayDate, timezone } = formatDateForDatabase(localDate);
  
  const defaultEvent = {
    id: `event-${Date.now()}`,
    type: 'Registration',
    subtype: 'Regular',
    title: '',
    description: '',
    date,
    displayDate,
    timezone,
    confirmed: false,
    recurring: false,
    applicableStudentTypes: [] // Initialize empty array for student types
  };
  
  const [newEvent, setNewEvent] = useState(defaultEvent);
  
  // This function now receives updates from the editor as inputs change
  const handleEditorUpdate = (updatedEvent) => {
    setNewEvent(updatedEvent);
  };
  
  const handleSave = () => {
    if (!newEvent.title) {
      toast.error("Please provide a title for this event.");
      return;
    }
    
    onAddEvent(newEvent);
    setIsOpen(false);
    // Reset form
    setNewEvent({
      ...defaultEvent,
      id: `event-${Date.now()}`
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center">
          <Plus className="h-4 w-4 mr-2" /> Add General Date
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[100vh]">
        <DialogHeader>
          <DialogTitle>Add Important Date</DialogTitle>
          <DialogDescription>
            Add a new date for registrations or other important school events.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <div className="py-4 pb-20"> {/* Added more bottom padding */}
            <GeneralDateEditor
              event={newEvent}
              onSave={handleEditorUpdate} // Now properly updates parent state on form changes
              onCancel={() => setIsOpen(false)}
              onDelete={() => setIsOpen(false)}
              isNew={true}
            />
          </div>
        </ScrollArea>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}> 
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// EditDiplomaDateSheet Component
function EditDiplomaDateSheet({ time, courseId, courseTitle, onSave, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editedTime, setEditedTime] = useState(time);
  
  // Reset edited time when original time changes
  useEffect(() => {
    setEditedTime(time);
  }, [time]);
  
  const handleEditorUpdate = (updatedTime) => {
    setEditedTime(updatedTime);
  };
  
  const handleSave = () => {
    onSave(courseId, editedTime);
    setIsOpen(false);
  };
  
  const handleDelete = () => {
    onDelete(courseId, time.id, courseTitle, time);
    setIsOpen(false);
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(true)}>
        <Edit className="h-4 w-4" />
      </Button>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Edit Diploma Date for {courseTitle}</SheetTitle>
          <SheetDescription>
            Update the details for this diploma exam date.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col h-[calc(100vh-180px)]">
          <ScrollArea className="flex-1 mt-6 pr-4">
            <div className="pr-4 pb-20"> {/* Added more bottom padding */}
              <DiplomaDateEditor
                time={editedTime}
                onSave={handleEditorUpdate}
                onCancel={() => setIsOpen(false)}
                onDelete={handleDelete}
              />
            </div>
          </ScrollArea>
          <SheetFooter className="flex justify-between mt-6 border-t pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <div className="space-x-2">
              <Button variant="destructive" onClick={() => handleDelete()}>
                <Trash className="h-4 w-4 mr-1" /> Delete
              </Button>
              <Button onClick={handleSave}>
                Save
              </Button>
            </div>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// EditGeneralEventSheet Component
function EditGeneralEventSheet({ event, onSave, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editedEvent, setEditedEvent] = useState(event);
  
  // Reset edited event when original event changes
  useEffect(() => {
    setEditedEvent(event);
  }, [event]);
  
  const handleEditorUpdate = (updatedEvent) => {
    setEditedEvent(updatedEvent);
  };
  
  const handleSave = () => {
    onSave(editedEvent);
    setIsOpen(false);
  };
  
  const handleDelete = () => {
    onDelete(event.id);
    setIsOpen(false);
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(true)}>
        <Edit className="h-4 w-4" />
      </Button>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Edit Event</SheetTitle>
          <SheetDescription>
            Update the details for this important date.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col h-[calc(100vh-180px)]">
          <ScrollArea className="flex-1 mt-6 pr-4">
            <div className="pr-4 pb-20"> {/* Added more bottom padding */}
              <GeneralDateEditor
                event={editedEvent}
                onSave={handleEditorUpdate}
                onCancel={() => setIsOpen(false)}
                onDelete={handleDelete}
              />
            </div>
          </ScrollArea>
          <SheetFooter className="flex justify-between mt-6 border-t pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <div className="space-x-2">
              <Button variant="destructive" onClick={() => handleDelete()}>
                <Trash className="h-4 w-4 mr-1" /> Delete
              </Button>
              <Button onClick={handleSave}>
                Save
              </Button>
            </div>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// DeleteConfirmDialog Component
function DeleteConfirmDialog({ isOpen, onClose, onConfirm, itemInfo, itemType = 'date' }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Delete Important {itemType === 'date' ? 'Date' : 'Event'}</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this {itemType === 'date' ? 'date' : 'event'}
            {itemInfo?.courseTitle ? ` for ${itemInfo.courseTitle}` : ''}?
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-220px)] pr-4">
          <div className="pb-10"> {/* Added padding wrapper */}
            <div className="mt-2 p-2 bg-gray-100 rounded">
              {itemType === 'date' ? (
                <>
                  <div><strong>Date:</strong> {formatDateForGrouping(itemInfo)}</div>
                  <div><strong>Time:</strong> {itemInfo?.hour}:{itemInfo?.minute} {itemInfo?.period}</div>
                  <div><strong>Month:</strong> {itemInfo?.month}</div>
                  {itemInfo?.registrationDeadline && (
                    <div><strong>Registration Deadline:</strong> {formatDateForGrouping({
                      date: itemInfo.registrationDeadline,
                      displayDate: itemInfo.registrationDeadlineDisplayDate
                    })}</div>
                  )}
                </>
              ) : (
                <>
                  <div><strong>Title:</strong> {itemInfo?.title}</div>
                  <div><strong>Type:</strong> {itemInfo?.type} {itemInfo?.subtype ? `(${itemInfo.subtype})` : ''}</div>
                  <div><strong>Date:</strong> {formatDateForGrouping(itemInfo)}</div>
                  {itemInfo?.recurring && (
                    <div><strong>Recurring:</strong> Yes (Annual)</div>
                  )}
                  {itemInfo?.description && (
                    <div><strong>Description:</strong> {itemInfo.description}</div>
                  )}
                  {itemInfo?.applicableStudentTypes && itemInfo.applicableStudentTypes.length > 0 && (
                    <div><strong>Applies to:</strong> {
                      itemInfo.applicableStudentTypes.length === STUDENT_TYPE_OPTIONS.length 
                        ? "All Student Types" 
                        : itemInfo.applicableStudentTypes.join(", ")
                    }</div>
                  )}
                </>
              )}
            </div>
            <p className="mt-4 text-red-600 font-medium">This action cannot be undone.</p>
          </div>
        </ScrollArea>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>
            <Trash className="h-4 w-4 mr-2" /> Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ImportantDates({ courses, selectedCourseId, courseData, onCourseSelect }) {
  // Local state
  const [generalDates, setGeneralDates] = useState({});
  const [activeTab, setActiveTab] = useState('all');
  const [filter, setFilter] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    itemId: null,
    courseId: null,
    courseTitle: '',
    itemInfo: null,
    itemType: 'date' // 'date' or 'event'
  });
  const [loading, setLoading] = useState(true);
  const [expandedAccordionItems, setExpandedAccordionItems] = useState([]);
  
  // Create refs for date groups and the closest upcoming date
  const scrollContainerRef = useRef(null);
  const dateGroupRefs = useRef({});
  const closestFutureDateRef = useRef(null);

  // Load general dates from Firebase
  useEffect(() => {
    const loadGeneralDates = async () => {
      try {
        const db = getDatabase();
        const datesRef = ref(db, 'ImportantDates');
        const snapshot = await get(datesRef);
        
        if (snapshot.exists()) {
          setGeneralDates(snapshot.val());
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading important dates:', error);
        setLoading(false);
      }
    };
    
    loadGeneralDates();
  }, []);

  // Find courses with diploma times
  const coursesWithDiplomaTimes = useMemo(() => {
    return Object.entries(courses)
      .filter(([_, course]) => course.diplomaTimes && course.diplomaTimes.length > 0)
      .map(([id, course]) => ({
        id,
        title: course.Title || `Course ID: ${id}`,
        diplomaTimes: course.diplomaTimes
      }));
  }, [courses]);

  // Collect all diploma times
  const allDiplomaTimes = useMemo(() => {
    const allTimes = [];
    coursesWithDiplomaTimes.forEach(course => {
      course.diplomaTimes.forEach(time => {
        if (time.date) {
          allTimes.push({
            courseId: course.id,
            courseTitle: course.title,
            type: 'Diploma',
            ...time
          });
        }
      });
    });
    
    // Sort by date
    return allTimes.sort((a, b) => {
      const dateA = a.displayDate ? new Date(a.displayDate) : new Date(a.date);
      const dateB = b.displayDate ? new Date(b.displayDate) : new Date(b.date);
      return dateA - dateB;
    });
  }, [coursesWithDiplomaTimes]);

  // Process general dates including recurring events
  const processedGeneralDates = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    return Object.values(generalDates)
      .filter(event => event.date)
      .map(event => {
        // If it's not a recurring event, return as is
        if (!event.recurring) return event;
        
        // For recurring events, create a new date in the current year
        let eventDate;
        if (event.displayDate) {
          const [year, month, day] = event.displayDate.split('-').map(Number);
          eventDate = new Date(year, month - 1, day);
        } else {
          eventDate = new Date(event.date);
        }
        
        const currentYearDate = new Date(
          currentYear,
          eventDate.getMonth(),
          eventDate.getDate()
        );
        
        // If this year's event date is already in the past, move to next year
        if (isPastDate(currentYearDate)) {
          currentYearDate.setFullYear(currentYear + 1);
        }
        
        // Format the displayDate correctly for the UI
        const formattedDisplayDate = currentYearDate.toLocaleDateString('en-CA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        
        // Return event with updated date
        return {
          ...event,
          date: currentYearDate.toISOString(),
          displayDate: formattedDisplayDate,
          originalDate: event.date, // Store original date for reference
          originalDisplayDate: event.displayDate // Store original displayDate
        };
      });
  }, [generalDates]);

  // Combined dates based on active tab and filter
  const filteredDates = useMemo(() => {
    let dates = [];
    
    if (activeTab === 'all' || activeTab === 'diploma') {
      dates = [...dates, ...allDiplomaTimes];
    }
    
    if (activeTab === 'all' || activeTab === 'general') {
      dates = [...dates, ...processedGeneralDates];
    }
    
    // Apply additional filtering if needed
    if (filter === 'registration' && activeTab !== 'diploma') {
      dates = dates.filter(date => date.type === 'Registration');
    } else if (filter === 'school' && activeTab !== 'diploma') {
      dates = dates.filter(date => date.type === 'SchoolEvent');
    }
    
    // Sort dates correctly using the displayDate when available
    return dates.sort((a, b) => {
      const dateA = a.displayDate ? new Date(a.displayDate.split('-').join('/')) : new Date(a.date);
      const dateB = b.displayDate ? new Date(b.displayDate.split('-').join('/')) : new Date(b.date);
      return dateA - dateB;
    });
  }, [activeTab, filter, allDiplomaTimes, processedGeneralDates]);

  // Group dates by date
  const groupedByDate = useMemo(() => {
    const groups = {};
    
    filteredDates.forEach(date => {
      const dateKey = formatDateForGrouping(date);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(date);
    });
    
    // Convert to array for rendering
    return Object.entries(groups)
      .sort(([dateA, _], [dateB, __]) => {
        // Sort by date
        // Parse date strings to get reliable date objects
        const getDateFromString = (str) => {
          const parts = str.split(' ')[1].split(',')[0].split(' ');
          const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].indexOf(parts[0]);
          const day = parseInt(parts[1]);
          const year = parseInt(str.split(',')[1].trim());
          return new Date(year, month, day);
        };
        
        const dateObjA = getDateFromString(dateA);
        const dateObjB = getDateFromString(dateB);
        return dateObjA - dateObjB;
      })
      .map(([date, dates], index) => {
        // Get a proper Date object for comparison
        let dateObj;
        if (dates[0].displayDate) {
          const [year, month, day] = dates[0].displayDate.split('-').map(Number);
          dateObj = new Date(year, month - 1, day);
        } else {
          dateObj = new Date(dates[0].date);
        }
        
        return {
          date,
          dates,
          index,
          dateObj // Store a date object for easier comparison
        };
      });
  }, [filteredDates]);

  // Find the closest upcoming date group
  const closestUpcomingDateGroup = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Filter future date groups
    const futureDateGroups = groupedByDate.filter(group => group.dateObj >= today);
    
    if (futureDateGroups.length === 0) {
      // If no future dates, return the most recent past date
      return groupedByDate.length > 0 ? groupedByDate[groupedByDate.length - 1] : null;
    }
    
    // Return the closest future date group
    return futureDateGroups[0];
  }, [groupedByDate]);

  // Auto-expand the closest date group and scroll to it
  useEffect(() => {
    if (!loading && closestUpcomingDateGroup && groupedByDate.length > 0) {
      // Expand the accordion item
      const itemsToExpand = [`date-${closestUpcomingDateGroup.index}`];
      setExpandedAccordionItems(itemsToExpand);
      
      // Set a timeout to allow the DOM to update before scrolling
      setTimeout(() => {
        const element = dateGroupRefs.current[`date-${closestUpcomingDateGroup.index}`];
        const container = scrollContainerRef.current;
        
        if (element && container) {
          // Calculate the position of the element relative to the container
          const elementRect = element.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          
          // Calculate the scroll amount needed - this scrolls the element to the top of the visible area
          const scrollTop = element.offsetTop - container.offsetTop;
          
          // Scroll the container
          container.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
          });
        }
      }, 300);
    }
  }, [loading, closestUpcomingDateGroup, groupedByDate.length]);

  // Format time string
  const formatTime = (hour, minute, period) => {
    if (!hour || !minute || !period) return '';
    return `${hour}:${minute} ${period}`;
  };

  // Get icon for event type
  const getEventIcon = (type) => {
    switch (type) {
      case 'Diploma':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'Registration':
        return <CalendarCheck className="h-4 w-4 text-green-500" />;
      case 'SchoolEvent':
        return <Info className="h-4 w-4 text-purple-500" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  // Get student type icon and color
  const getStudentTypeIcon = (type) => {
    const studentType = STUDENT_TYPE_OPTIONS.find(option => option.value === type);
    if (!studentType) return null;
    
    const IconComponent = studentType.icon;
    return <IconComponent className="h-3 w-3" />;
  };

  const getStudentTypeColor = (type) => {
    const studentType = STUDENT_TYPE_OPTIONS.find(option => option.value === type);
    return studentType ? studentType.color : '#6B7280'; // Default gray color
  };

  // Check if registration deadline is approaching (within 14 days)
  const isDeadlineApproaching = (deadline) => {
    if (!deadline) return false;
    
    const today = new Date();
    
    let deadlineDate;
    if (typeof deadline === 'object' && deadline.displayDate) {
      const [year, month, day] = deadline.displayDate.split('-').map(Number);
      deadlineDate = new Date(year, month - 1, day);
    } else {
      deadlineDate = new Date(deadline);
    }
    
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 && diffDays <= 14;
  };

  // Check if registration deadline has passed
  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false;
    
    const today = new Date();
    
    let deadlineDate;
    if (typeof deadline === 'object' && deadline.displayDate) {
      const [year, month, day] = deadline.displayDate.split('-').map(Number);
      deadlineDate = new Date(year, month - 1, day);
    } else {
      deadlineDate = new Date(deadline);
    }
    
    return deadlineDate < today;
  };

  // Add a new diploma date
  const handleAddDiplomaDate = async (courseId, newTime) => {
    try {
      setLoading(true);
      const db = getDatabase();
      const courseRef = ref(db, `courses/${courseId}`);
      
      // Get existing times or create empty array
      const existingTimes = courses[courseId].diplomaTimes || [];
      const updatedTimes = [...existingTimes, newTime];
      
      await update(courseRef, { 
        diplomaTimes: updatedTimes 
      });
      console.log('Successfully added diploma time');
      toast.success("The diploma exam date has been added successfully.");
      setLoading(false);
    } catch (error) {
      console.error('Error adding diploma time:', error);
      toast.error("An error occurred while adding the diploma date.");
      setLoading(false);
    }
  };

  // Add a new general event
  const handleAddGeneralEvent = async (newEvent) => {
    try {
      setLoading(true);
      const db = getDatabase();
      const eventsRef = ref(db, 'ImportantDates');
      
      // Use push to generate a unique key
      const newEventRef = push(eventsRef);
      const eventWithId = {
        ...newEvent,
        id: newEventRef.key
      };
      
      await update(eventsRef, { 
        [newEventRef.key]: eventWithId 
      });
      
      // Update local state
      setGeneralDates(prev => ({
        ...prev,
        [newEventRef.key]: eventWithId
      }));
      
      console.log('Successfully added general event');
      toast.success("The important date has been added successfully.");
      setLoading(false);
    } catch (error) {
      console.error('Error adding general event:', error);
      toast.error("An error occurred while adding the important date.");
      setLoading(false);
    }
  };

  // Update an existing diploma date
  const handleEditDiplomaDate = async (courseId, updatedTime) => {
    try {
      setLoading(true);
      const db = getDatabase();
      const courseRef = ref(db, `courses/${courseId}`);
      
      // Get existing times
      const existingTimes = courses[courseId].diplomaTimes || [];
      
      // Replace the specific time
      const updatedTimes = existingTimes.map(time => 
        time.id === updatedTime.id ? updatedTime : time
      );
      
      await update(courseRef, { 
        diplomaTimes: updatedTimes 
      });
      console.log('Successfully updated diploma time');
      toast.success("The diploma exam date has been updated successfully.");
      setLoading(false);
    } catch (error) {
      console.error('Error updating diploma time:', error);
      toast.error("An error occurred while updating the diploma date.");
      setLoading(false);
    }
  };

  // Update an existing general event
  const handleEditGeneralEvent = async (updatedEvent) => {
    try {
      setLoading(true);
      const db = getDatabase();
      const eventRef = ref(db, `ImportantDates/${updatedEvent.id}`);
      
      // If this is a processed recurring event, ensure we're preserving the original date
      let eventToSave = { ...updatedEvent };
      if (updatedEvent.originalDate) {
        // If editing a recurring event, we need to preserve the original date
        eventToSave.date = updatedEvent.originalDate;
      }
      
      if (updatedEvent.originalDisplayDate) {
        // Also preserve original displayDate if it exists
        eventToSave.displayDate = updatedEvent.originalDisplayDate;
      }
      
      // Remove temporary processing fields
      delete eventToSave.originalDate;
      delete eventToSave.originalDisplayDate;
      
      await update(eventRef, eventToSave);
      
      // Update local state
      setGeneralDates(prev => ({
        ...prev,
        [updatedEvent.id]: eventToSave
      }));
      
      console.log('Successfully updated general event');
      toast.success("The important date has been updated successfully.");
      setLoading(false);
    } catch (error) {
      console.error('Error updating general event:', error);
      toast.error("An error occurred while updating the important date.");
      setLoading(false);
    }
  };

  // Delete a diploma date
  const handleDeleteDiplomaDate = async (courseId, timeId) => {
    try {
      setLoading(true);
      const db = getDatabase();
      const courseRef = ref(db, `courses/${courseId}`);
      
      // Get existing times
      const existingTimes = courses[courseId].diplomaTimes || [];
      
      // Filter out the deleted time
      const updatedTimes = existingTimes.filter(time => time.id !== timeId);
      
      // If no times left, set to null to clean up the DB
      await update(courseRef, { 
        diplomaTimes: updatedTimes.length > 0 ? updatedTimes : null
      });
      console.log('Successfully deleted diploma time');
      toast.success("The diploma exam date has been deleted successfully.");
      setLoading(false);
    } catch (error) {
      console.error('Error deleting diploma time:', error);
      toast.error("An error occurred while deleting the diploma date.");
      setLoading(false);
    }
  };

  // Delete a general event
  const handleDeleteGeneralEvent = async (eventId) => {
    try {
      setLoading(true);
      const db = getDatabase();
      const eventRef = ref(db, `ImportantDates/${eventId}`);
      
      await remove(eventRef);
      
      // Update local state
      setGeneralDates(prev => {
        const updated = { ...prev };
        delete updated[eventId];
        return updated;
      });
      
      console.log('Successfully deleted general event');
      toast.success("The important date has been deleted successfully.");
      setLoading(false);
    } catch (error) {
      console.error('Error deleting general event:', error);
      toast.error("An error occurred while deleting the important date.");
      setLoading(false);
    }
  };

  // Show delete confirmation for diploma date
  const confirmDeleteDiplomaDate = (courseId, timeId, courseTitle, dateInfo) => {
    setDeleteDialog({
      isOpen: true,
      courseId,
      itemId: timeId,
      courseTitle,
      itemInfo: dateInfo,
      itemType: 'date'
    });
  };

  // Show delete confirmation for general event
  const confirmDeleteGeneralEvent = (eventId) => {
    setDeleteDialog({
      isOpen: true,
      itemId: eventId,
      itemInfo: generalDates[eventId],
      itemType: 'event'
    });
  };

  // Close delete confirmation
  const closeDeleteDialog = () => {
    setDeleteDialog({
      ...deleteDialog,
      isOpen: false
    });
  };

  // Execute deletion after confirmation
  const executeDelete = () => {
    if (deleteDialog.itemType === 'date') {
      handleDeleteDiplomaDate(deleteDialog.courseId, deleteDialog.itemId);
    } else {
      handleDeleteGeneralEvent(deleteDialog.itemId);
    }
    closeDeleteDialog();
  };

  // Handle accordion state change
  const handleAccordionChange = (value) => {
    setExpandedAccordionItems(typeof value === 'string' ? [value] : value);
  };

  // Get CSS classes for past events
  const getPastEventClasses = (date) => {
    if (isPastDate(date)) {
      return "opacity-70 bg-gray-50";
    }
    return "";
  };

  // Check if a date group is today
  const isToday = (dateObj) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const date = new Date(dateObj);
    date.setHours(0, 0, 0, 0);
    
    return date.getTime() === today.getTime();
  };

  // Get CSS classes for today's date group
  const getTodayClasses = (dateObj) => {
    return isToday(dateObj) ? "bg-blue-50 border-blue-200" : "";
  };

  return (
    <div className="p-4 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Important Dates</h1>
        
        <div className="flex gap-2">
          <AddDiplomaDateDialog 
            courses={courses} 
            onAddDate={handleAddDiplomaDate} 
          />
          <AddGeneralEventDialog 
            onAddEvent={handleAddGeneralEvent} 
          />
        </div>
      </div>
      
      {/* Today indicator */}
      <div className="mb-4 flex items-center">
        <div className="flex items-center bg-blue-50 text-blue-800 px-3 py-1 rounded-md text-sm">
          <Clock8 className="h-4 w-4 mr-2" />
          <span>Today: {new Date().toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>
      
      {/* Tabs for date types */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Dates</TabsTrigger>
          <TabsTrigger value="diploma">Diploma Exams</TabsTrigger>
          <TabsTrigger value="general">General Dates</TabsTrigger>
        </TabsList>
      </Tabs>
      
    {/* Display dates grouped by date */}
<div 
  ref={scrollContainerRef}
  className="flex-1 overflow-y-auto pb-24" // Added more padding at bottom
>
  {loading ? (
    <div className="text-center py-10">
      <p className="text-gray-500">Loading important dates...</p>
    </div>
  ) : groupedByDate.length === 0 ? (
    <div className="text-center py-10 border rounded-lg bg-gray-50">
      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-2" />
      <p className="text-gray-500">No important dates found.</p>
      <p className="text-gray-400 text-sm mt-2">Add dates using the buttons above.</p>
    </div>
  ) : (
    <Accordion 
      type="multiple" 
      value={expandedAccordionItems} 
      onValueChange={handleAccordionChange}
      className="space-y-4"
    >
      {groupedByDate.map((dateGroup, index) => {
        const isPast = isPastDate(dateGroup.dateObj);
        
        return (
          <AccordionItem 
            key={dateGroup.date} 
            value={`date-${dateGroup.index}`}
            ref={(el) => (dateGroupRefs.current[`date-${dateGroup.index}`] = el)}
            className={`border rounded-lg shadow-sm ${isPast ? 'border-gray-200' : ''} ${
              dateGroup.index === closestUpcomingDateGroup?.index 
                ? 'border-green-300 ring-1 ring-green-300' 
                : ''
            } ${getTodayClasses(dateGroup.dateObj)}`}
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center text-left">
                <Calendar className={`h-5 w-5 mr-3 ${isPast ? 'text-gray-400' : 'text-blue-500'} flex-shrink-0`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{dateGroup.date}</span>
                    {isPast && (
                      <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
                        Past
                      </Badge>
                    )}
                    {isToday(dateGroup.dateObj) && (
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                        Today
                      </Badge>
                    )}
                    {dateGroup.index === closestUpcomingDateGroup?.index && !isToday(dateGroup.dateObj) && (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        Upcoming
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {dateGroup.dates.length} {dateGroup.dates.length === 1 ? 'event' : 'events'}
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                {dateGroup.dates.map((date) => {
                  const isPastEvent = isPastDate(date);
                  
                  return (
                    <Card 
                      key={date.id} 
                      className={`overflow-hidden ${
                        date.type === 'Diploma' 
                          ? 'border-l-4 border-l-blue-500' 
                          : date.type === 'Registration' 
                            ? 'border-l-4 border-l-green-500' 
                            : 'border-l-4 border-l-purple-500'
                      } ${getPastEventClasses(date)}`}
                    >
                      <div className="flex items-start">
                        <div 
                          className={`flex-1 cursor-pointer hover:bg-gray-50 ${
                            date.type === 'Diploma' ? '' : 'cursor-default'
                          }`}
                          onClick={() => date.type === 'Diploma' ? onCourseSelect(date.courseId) : null}
                        >
                          <CardHeader className="py-3">
                            <CardTitle className="text-md flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {getEventIcon(date.type)}
                                <span>
                                  {date.type === 'Diploma' 
                                    ? date.courseTitle
                                    : date.title || `${date.type} Event`}
                                </span>
                                {date.recurring && (
                                  <Badge variant="outline" className="flex items-center gap-1 bg-purple-50 text-purple-700 border-purple-200">
                                    <RepeatIcon className="h-3 w-3" />
                                    <span>Annual</span>
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {isPastEvent && !date.recurring && (
                                  <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
                                    Past
                                  </Badge>
                                )}
                                {date.confirmed && (
                                  <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center gap-1 border-green-200">
                                    <Check className="h-3 w-3" />
                                    Confirmed
                                  </Badge>
                                )}
                              
                              </div>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="py-1 pb-3 space-y-2">
                            {date.type === 'Diploma' ? (
                              <>
                                <div className="flex items-center text-sm text-gray-700">
                                  <span className="font-medium">{formatTime(date.hour, date.minute, date.period)}</span>
                                  <span className="mx-2">•</span>
                                  <span>{date.month} Exam</span>
                                </div>
                                
                                {/* Registration Deadline Display for Diploma */}
                                {date.registrationDeadline ? (
                                  <div className="flex items-start text-sm">
                                    <Clock className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span>Registration Deadline: <strong>{formatReadableDate({
                                          date: date.registrationDeadline,
                                          displayDate: date.registrationDeadlineDisplayDate
                                        })}</strong></span>
                                        {isDeadlinePassed({
                                          date: date.registrationDeadline,
                                          displayDate: date.registrationDeadlineDisplayDate
                                        }) ? (
                                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                                            Passed
                                          </Badge>
                                        ) : isDeadlineApproaching({
                                          date: date.registrationDeadline,
                                          displayDate: date.registrationDeadlineDisplayDate
                                        }) ? (
                                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                            Approaching
                                          </Badge>
                                        ) : null}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center text-sm text-amber-600">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    <span>No registration deadline set</span>
                                  </div>
                                )}
                              </>
                            ) : (
                              // For general events
                              <>
                                {date.recurring && (
                                  <div className="flex items-center text-sm text-purple-600">
                                    <RepeatIcon className="h-4 w-4 mr-1" />
                                    <span>Occurs annually on {formatRecurringDateForDisplay(date)}</span>
                                  </div>
                                )}
                                {date.description && (
                                  <p className="text-sm text-gray-700">{date.description}</p>
                                )}
                                
                                {/* Student Types Section */}
                                {date.applicableStudentTypes && date.applicableStudentTypes.length > 0 && (
                                  <div className="mt-2">
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {date.applicableStudentTypes.length === STUDENT_TYPE_OPTIONS.length ? (
                                        <Badge variant="outline" className="bg-gray-100 text-gray-800">
                                          All Student Types
                                        </Badge>
                                      ) : (
                                        date.applicableStudentTypes.map(type => (
                                          <Badge 
                                            key={type} 
                                            variant="outline" 
                                            className="flex items-center gap-1"
                                            style={{ 
                                              backgroundColor: `${getStudentTypeColor(type)}20`, // 20% opacity
                                              color: getStudentTypeColor(type),
                                              borderColor: `${getStudentTypeColor(type)}40` // 40% opacity
                                            }}
                                          >
                                            {getStudentTypeIcon(type)}
                                            <span>{type}</span>
                                          </Badge>
                                        ))
                                      )}
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </CardContent>
                        </div>
                        <div className="pr-4 pt-4 flex items-center gap-1">
                          {date.type === 'Diploma' ? (
                            <EditDiplomaDateSheet
                              time={date}
                              courseId={date.courseId}
                              courseTitle={date.courseTitle}
                              onSave={handleEditDiplomaDate}
                              onDelete={confirmDeleteDiplomaDate}
                            />
                          ) : (
                            <EditGeneralEventSheet
                              event={date}
                              onSave={handleEditGeneralEvent}
                              onDelete={confirmDeleteGeneralEvent}
                            />
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => 
                              date.type === 'Diploma'
                                ? confirmDeleteDiplomaDate(date.courseId, date.id, date.courseTitle, date)
                                : confirmDeleteGeneralEvent(date.id)
                            }
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  )}
</div>

{/* Selected course details */}
{selectedCourseId && courseData && (
  <div className="mt-8 p-4 border rounded-lg">
    <h2 className="text-xl font-semibold mb-4">Selected Course: {courseData.Title}</h2>
    {/* Course-specific information would go here */}
  </div>
)}

{/* Delete Confirmation Dialog */}
<DeleteConfirmDialog
  isOpen={deleteDialog.isOpen}
  onClose={closeDeleteDialog}
  onConfirm={executeDelete}
  courseTitle={deleteDialog.courseTitle}
  itemInfo={deleteDialog.itemInfo}
  itemType={deleteDialog.itemType}
/>
</div>
);
}

export default ImportantDates;