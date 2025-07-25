import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar, Plus, Edit, Trash, Check, Clock, AlertCircle, Info, CalendarCheck, Clock8, User, Home, Sun, Globe, GraduationCap, AlertTriangle, CalendarDays, CalendarX } from 'lucide-react';
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

// Import calendar components
import CalendarSelector from './CalendarSelector';

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

// GeneralDateEditor Component - updated for registration dates with schedule end date
function GeneralDateEditor({ event, onSave, onCancel, onDelete, isNew = false }) {
  const [editedEvent, setEditedEvent] = useState({
    id: event.id || `event-${Date.now()}`,
    type: event.type || 'Registration',
    title: event.title || '',
    description: event.description || '',
    ...formatDateForDatabase(event.displayDate || formatDateForDisplay(event) || new Date().toLocaleDateString('en-CA')),
    // Add endDate fields for registration window
    endDate: event.endDate || null,
    endDateDisplayDate: event.endDateDisplayDate || '',
    // Add scheduleEndDate fields for course completion deadline
    scheduleEndDate: event.scheduleEndDate || null,
    scheduleEndDateDisplayDate: event.scheduleEndDateDisplayDate || '',
    confirmed: event.confirmed || false,
    applicableStudentTypes: event.applicableStudentTypes || [], // Initialize with existing data or empty array
    recurring: false // Always set to false for backwards compatibility
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

  const handleEndDateChange = (e) => {
    const localDate = e.target.value;
    const { date, displayDate } = formatDateForDatabase(localDate);
    const updatedEvent = {
      ...editedEvent,
      endDate: date,
      endDateDisplayDate: displayDate
    };
    setEditedEvent(updatedEvent);
    onSave(updatedEvent); // Immediately update parent component
  };

  // New handler for schedule end date
  const handleScheduleEndDateChange = (e) => {
    const localDate = e.target.value;
    const { date, displayDate } = formatDateForDatabase(localDate);
    const updatedEvent = {
      ...editedEvent,
      scheduleEndDate: date,
      scheduleEndDateDisplayDate: displayDate
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

  // Check if end date is after start date
  const isEndDateValid = () => {
    if (!editedEvent.endDate || !editedEvent.displayDate) return true;
    
    const startDate = new Date(editedEvent.displayDate);
    const endDate = new Date(editedEvent.endDateDisplayDate);
    
    return endDate >= startDate;
  };

  // Check if schedule end date is after registration start date
  const isScheduleEndDateValid = () => {
    if (!editedEvent.scheduleEndDate || !editedEvent.displayDate) return true;
    
    const startDate = new Date(editedEvent.displayDate);
    const scheduleEndDate = new Date(editedEvent.scheduleEndDateDisplayDate);
    
    return scheduleEndDate >= startDate;
  };

  return (
    <div className="space-y-4">
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
        <Label>Start Date</Label>
        <Input
          type="date"
          value={editedEvent.displayDate || formatDateForDisplay(editedEvent)}
          onChange={handleDateChange}
          className="mt-1"
        />
      </div>
      
      {/* Registration End Date field */}
      <div>
        <Label>End Date (Optional)</Label>
        <Input
          type="date"
          value={editedEvent.endDateDisplayDate || formatDateForDisplay({
            date: editedEvent.endDate,
            displayDate: editedEvent.endDateDisplayDate
          })}
          onChange={handleEndDateChange}
          className="mt-1"
        />
        <p className="text-xs text-gray-500 mt-1">
          If specified, this period will end on this date.
        </p>
        {editedEvent.endDateDisplayDate && !isEndDateValid() && (
          <p className="text-xs text-red-500 mt-1">
            End date must be after or equal to the start date.
          </p>
        )}
      </div>

      {/* Schedule End Date field */}
      <div>
        <Label className="font-medium text-base">Course Completion Deadline</Label>
        <p className="text-sm text-gray-500 mt-1 mb-2">
          The date by which students must complete their course.
        </p>
        <Input
          type="date"
          value={editedEvent.scheduleEndDateDisplayDate || formatDateForDisplay({
            date: editedEvent.scheduleEndDate,
            displayDate: editedEvent.scheduleEndDateDisplayDate
          })}
          onChange={handleScheduleEndDateChange}
          className="mt-1"
        />
        {editedEvent.scheduleEndDateDisplayDate && !isScheduleEndDateValid() && (
          <p className="text-xs text-red-500 mt-1">
            Course completion deadline must be after or equal to the start date.
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

      {/* Warning message for protected date types */}
      {!isNew && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start">
          <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800 font-medium">
              Registration dates cannot be deleted
            </p>
            <p className="text-xs text-amber-700 mt-1">
              These dates are used elsewhere in the system to manage student workflows.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// AddGeneralEventDialog Component - Updated for registration with schedule end date
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
    title: '',
    description: '',
    date,
    displayDate,
    timezone,
    endDate: null,
    endDateDisplayDate: '',
    scheduleEndDate: null, // New field for course completion deadline
    scheduleEndDateDisplayDate: '', // New field for course completion deadline display
    confirmed: false,
    applicableStudentTypes: [], // Initialize empty array for student types
    recurring: false // Always false
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

    // Validate that end date is after start date if specified
    if (newEvent.endDate && newEvent.displayDate && newEvent.endDateDisplayDate) {
      const startDate = new Date(newEvent.displayDate);
      const endDate = new Date(newEvent.endDateDisplayDate);
      
      if (endDate < startDate) {
        toast.error("End date must be after or equal to the start date.");
        return;
      }
    }

    // Validate that schedule end date is after start date if specified
    if (newEvent.scheduleEndDate && newEvent.displayDate && newEvent.scheduleEndDateDisplayDate) {
      const startDate = new Date(newEvent.displayDate);
      const scheduleEndDate = new Date(newEvent.scheduleEndDateDisplayDate);
      
      if (scheduleEndDate < startDate) {
        toast.error("Course completion deadline must be after or equal to the start date.");
        return;
      }
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
          <Plus className="h-4 w-4 mr-2" /> Add Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[100vh]">
        <DialogHeader>
          <DialogTitle>Add Event</DialogTitle>
          <DialogDescription>
            Add a new event that will be visible in the student dashboard. You can specify a single date or a date window.
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

// EditGeneralEventSheet Component - Updated for registration with schedule end date
function EditGeneralEventSheet({ event, onSave, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editedEvent, setEditedEvent] = useState({...event, recurring: false});
  
  // Reset edited event when original event changes
  useEffect(() => {
    setEditedEvent({...event, recurring: false});
  }, [event]);
  
  const handleEditorUpdate = (updatedEvent) => {
    setEditedEvent(updatedEvent);
  };
  
  const handleSave = () => {
    // Validate that end date is after start date if specified
    if (editedEvent.endDate && editedEvent.displayDate && editedEvent.endDateDisplayDate) {
      const startDate = new Date(editedEvent.displayDate);
      const endDate = new Date(editedEvent.endDateDisplayDate);
      
      if (endDate < startDate) {
        toast.error("End date must be after or equal to the start date.");
        return;
      }
    }

    // Validate that schedule end date is after start date if specified
    if (editedEvent.scheduleEndDate && editedEvent.displayDate && editedEvent.scheduleEndDateDisplayDate) {
      const startDate = new Date(editedEvent.displayDate);
      const scheduleEndDate = new Date(editedEvent.scheduleEndDateDisplayDate);
      
      if (scheduleEndDate < startDate) {
        toast.error("Course completion deadline must be after or equal to the start date.");
        return;
      }
    }
    
    onSave(editedEvent);
    setIsOpen(false);
  };
  
  const handleDelete = () => {
    onDelete(event.id);
    setIsOpen(false);
  };
  
  // Registration dates cannot be deleted
  const isDeletionAllowed = false;
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(true)}>
        <Edit className="h-4 w-4" />
      </Button>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Edit Date</SheetTitle>
          <SheetDescription>
            Update the details for this period.
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
              {isDeletionAllowed && (
                <Button variant="destructive" onClick={() => handleDelete()}>
                  <Trash className="h-4 w-4 mr-1" /> Delete
                </Button>
              )}
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
function DeleteConfirmDialog({ isOpen, onClose, onConfirm, itemInfo, itemType = 'event' }) {
  // Registration dates cannot be deleted
  const isProtectedType = itemInfo?.type === 'Registration';
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Delete Important Event</DialogTitle>
          <DialogDescription>
            {isProtectedType ? (
              `Registration dates cannot be deleted as they are used elsewhere in the system.`
            ) : (
              `Are you sure you want to delete this event?`
            )}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-220px)] pr-4">
          <div className="pb-10"> {/* Added padding wrapper */}
            <div className="mt-2 p-2 bg-gray-100 rounded">
              <>
                <div><strong>Title:</strong> {itemInfo?.title}</div>
                <div><strong>Type:</strong> {itemInfo?.type}</div>
                <div><strong>Date:</strong> {formatDateForGrouping(itemInfo)}</div>
                {itemInfo?.endDate && (
                  <div><strong>End Date:</strong> {formatDateForGrouping({
                    date: itemInfo.endDate,
                    displayDate: itemInfo.endDateDisplayDate
                  })}</div>
                )}
                {itemInfo?.scheduleEndDate && (
                  <div><strong>Course Completion Deadline:</strong> {formatDateForGrouping({
                    date: itemInfo.scheduleEndDate,
                    displayDate: itemInfo.scheduleEndDateDisplayDate
                  })}</div>
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
            </div>
            
            {isProtectedType ? (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-800 font-medium">
                    Registration dates cannot be deleted
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    These dates are used elsewhere in the system to manage student workflows.
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-red-600 font-medium">This action cannot be undone.</p>
            )}
          </div>
        </ScrollArea>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {!isProtectedType && (
            <Button variant="destructive" onClick={onConfirm}>
              <Trash className="h-4 w-4 mr-2" /> Delete
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CalendarViewSheet({ isOpen, onClose, dates, courses }) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  // Get calendar data from Firebase
  const [icsCalendars, setIcsCalendars] = useState([]);
  
  // Load ICS calendars
  useEffect(() => {
    if (!isOpen) return; // Only load when sheet is open
    
    const db = getDatabase();
    const calendarsRef = ref(db, 'calendars');
    
    const fetchCalendars = async () => {
      try {
        const snapshot = await get(calendarsRef);
        if (snapshot.exists()) {
          const calendarData = snapshot.val();
          const calendars = [];
          
          // Process all calendar categories
          for (const category in calendarData) {
            if (Object.prototype.hasOwnProperty.call(calendarData, category)) {
              const categoryCalendars = calendarData[category];
              
              // Convert each calendar in this category to an array item
              for (const calId in categoryCalendars) {
                if (Object.prototype.hasOwnProperty.call(categoryCalendars, calId)) {
                  calendars.push({
                    id: calId,
                    category,
                    ...categoryCalendars[calId]
                  });
                }
              }
            }
          }
          
          setIcsCalendars(calendars);
        }
      } catch (error) {
        console.error("Error fetching calendars:", error);
      }
    };
    
    fetchCalendars();
  }, [isOpen]);
  
  // Filter to only include registration dates with defensive check for dates
  const registrationDates = useMemo(() => {
    // Add defensive check
    if (!dates || !Array.isArray(dates)) {
      console.warn("CalendarViewSheet received invalid dates prop:", dates);
      return [];
    }
    
    // Make sure we're filtering to only registration events
    return dates.filter(date => date && date.type === 'Registration');
  }, [dates]);

  // Generate year options (current year and next 5 years)
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear + i);
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[95%] max-w-[1200px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Calendar View</span>
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6">
          {/* Use the new CalendarSelector component */}
          <CalendarSelector 
            dates={registrationDates || []} 
            icsCalendars={icsCalendars || []}
            year={selectedYear}
            courses={courses}
            title="Calendar View"
          />
        </div>
        
        <SheetFooter className="mt-6">
          <Button onClick={onClose}>Close</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
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
    itemType: 'event' // Only 'event' now
  });
  const [loading, setLoading] = useState(true);
  const [expandedAccordionItems, setExpandedAccordionItems] = useState([]);
  
  // Calendar view sheet state
  const [calendarSheetOpen, setCalendarSheetOpen] = useState(false);
  
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
          const data = snapshot.val();
          // Ensure recurring is false for backwards compatibility
          Object.keys(data).forEach(key => {
            if (data[key].recurring) {
              data[key].recurring = false;
            }
          });
          setGeneralDates(data);
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

  // General dates list
  const generalDatesList = useMemo(() => {
    return Object.values(generalDates)
      .filter(event => event.date)
      .sort((a, b) => {
        const dateA = a.displayDate ? new Date(a.displayDate) : new Date(a.date);
        const dateB = b.displayDate ? new Date(b.displayDate) : new Date(b.date);
        return dateA - dateB;
      });
  }, [generalDates]);

  // Combined dates based on active tab and filter
  const filteredDates = useMemo(() => {
    let dates = [];
    
    if (activeTab === 'all' || activeTab === 'diploma') {
      dates = [...dates, ...allDiplomaTimes];
    }
    
    if (activeTab === 'all' || activeTab === 'general') {
      dates = [...dates, ...generalDatesList];
    }
    
    // Apply additional filtering if needed
    if (filter === 'registration' && activeTab !== 'diploma') {
      dates = dates.filter(date => date.type === 'Registration');
    }
    
    // Sort dates correctly using the displayDate when available
    return dates.sort((a, b) => {
      const dateA = a.displayDate ? new Date(a.displayDate.split('-').join('/')) : new Date(a.date);
      const dateB = b.displayDate ? new Date(b.displayDate.split('-').join('/')) : new Date(b.date);
      return dateA - dateB;
    });
  }, [activeTab, filter, allDiplomaTimes, generalDatesList]);

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

  // Format the registration period for display
  const formatRegistrationPeriod = (startDate, endDate) => {
    if (!startDate) return '';
    
    if (!endDate) return formatReadableDate(startDate);
    
    const startStr = formatReadableDate(startDate);
    const endStr = formatReadableDate(endDate);
    return `${startStr} to ${endStr}`;
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
      toast.success("The event has been added successfully.");
      setLoading(false);
    } catch (error) {
      console.error('Error adding general event:', error);
      toast.error("An error occurred while adding the event.");
      setLoading(false);
    }
  };

  // Update an existing general event
  const handleEditGeneralEvent = async (updatedEvent) => {
    try {
      setLoading(true);
      const db = getDatabase();
      const eventRef = ref(db, `ImportantDates/${updatedEvent.id}`);
      
      await update(eventRef, updatedEvent);
      
      // Update local state
      setGeneralDates(prev => ({
        ...prev,
        [updatedEvent.id]: updatedEvent
      }));
      
      console.log('Successfully updated general event');
      toast.success("The event has been updated successfully.");
      setLoading(false);
    } catch (error) {
      console.error('Error updating general event:', error);
      toast.error("An error occurred while updating the event.");
      setLoading(false);
    }
  };

  // Delete a general event
  const handleDeleteGeneralEvent = async (eventId) => {
    try {
      // Registration dates cannot be deleted
      const event = generalDates[eventId];
      if (event && event.type === 'Registration') {
        toast.error(`Registration dates cannot be deleted as they are used elsewhere in the system.`);
        return;
      }
      
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
      toast.success("The event has been deleted successfully.");
      setLoading(false);
    } catch (error) {
      console.error('Error deleting general event:', error);
      toast.error("An error occurred while deleting the event.");
      setLoading(false);
    }
  };

  // Show delete confirmation for general event
  const confirmDeleteGeneralEvent = (eventId) => {
    const event = generalDates[eventId];
    
    // Registration dates cannot be deleted
    if (event && event.type === 'Registration') {
      toast.error(`Registration dates cannot be deleted as they are used elsewhere in the system.`);
      return;
    }
    
    setDeleteDialog({
      isOpen: true,
      itemId: eventId,
      itemInfo: event,
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
    handleDeleteGeneralEvent(deleteDialog.itemId);
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

  // Get border color based on event type
  const getEventBorderColor = (type) => {
    switch (type) {
      case 'Diploma':
        return 'border-l-blue-500';
      case 'Registration':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  };

  return (
    <div className="p-4 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Important Dates</h1>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center"
            onClick={() => setCalendarSheetOpen(true)}
          >
            <CalendarDays className="h-4 w-4 mr-2" /> Calendar View
          </Button>
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
          <TabsTrigger value="general">Registration Dates</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Diploma message */}
      {(activeTab === 'diploma' || activeTab === 'all') && (
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600">To add diploma dates, please add them within each course setting.</p>
            </div>
          </CardContent>
        </Card>
      )}
      
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
                      const isProtectedEvent = date.type === 'Registration';
                      
                      return (
                        <Card 
                          key={date.id} 
                          className={`overflow-hidden border-l-4 ${getEventBorderColor(date.type)} ${getPastEventClasses(date)}`}
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
                                        : date.title || `Registration Date`}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {isPastEvent && (
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
                                  // For registration events
                                  <>
                                    {/* Registration Period Display */}
                                    <div className="flex items-center text-sm text-green-600">
                                      <CalendarCheck className="h-4 w-4 mr-1" />
                                      <span>Period: {
                                        date.endDate 
                                          ? formatRegistrationPeriod(
                                              date, 
                                              { date: date.endDate, displayDate: date.endDateDisplayDate }
                                            )
                                          : formatReadableDate(date)
                                      }</span>
                                    </div>

                                    {/* Schedule End Date Display */}
                                    {date.scheduleEndDate && (
                                      <div className="flex items-center text-sm text-red-600">
                                        <CalendarX className="h-4 w-4 mr-1" />
                                        <span>Course completion deadline: {formatReadableDate({
                                          date: date.scheduleEndDate,
                                          displayDate: date.scheduleEndDateDisplayDate
                                        })}</span>
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
                            {date.type !== 'Diploma' && (
                              <div className="pr-4 pt-4 flex items-center gap-1">
                                <EditGeneralEventSheet
                                  event={date}
                                  onSave={handleEditGeneralEvent}
                                  onDelete={confirmDeleteGeneralEvent}
                                />
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => 
                                    confirmDeleteGeneralEvent(date.id)
                                  }
                                  disabled={isProtectedEvent}
                                  title={isProtectedEvent ? `Registration dates cannot be deleted` : "Delete this event"}
                                >
                                  <Trash className={`h-4 w-4 ${isProtectedEvent ? 'text-gray-400' : ''}`} />
                                </Button>
                              </div>
                            )}
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
      itemInfo={deleteDialog.itemInfo}
      itemType={deleteDialog.itemType}
    />

    {/* Calendar View Sheet */}
    <CalendarViewSheet 
      isOpen={calendarSheetOpen}
      onClose={() => setCalendarSheetOpen(false)}
      dates={filteredDates}
      courses={courses}
    />
  </div>
);
}

export default ImportantDates;