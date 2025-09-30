import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { AlertCircle, Calendar as CalendarIcon, Info, Check } from 'lucide-react';
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { useAuth } from '../../context/AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getDatabase, ref, get, update } from 'firebase/database';
import { format } from 'date-fns';
import { TERMS, parseTermDate } from '../../config/calendarConfig';

const DateDisplay = ({ date, placeholder }) => {
  if (!date) return <span>{placeholder}</span>;
  return <span>{format(new Date(date), 'MM/dd/yyyy')}</span>;
};

const StartingOnDialog = ({
  isOpen,
  onOpenChange,
  status,
  statusValue,
  studentName,
  courseName,
  studentKey,
  courseId,
  studentEmail,
  scheduleStartDate, // Existing schedule start date from registration
  onConfirm,
  onCancel
}) => {
  const { user } = useAuth();
  const userName = user.displayName;
  const [selectedDate, setSelectedDate] = useState(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useScheduleDate, setUseScheduleDate] = useState(true);

  // Parse semester dates from config
  const presetDates = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const dates = [];

    // Add schedule start date if available
    if (scheduleStartDate) {
      try {
        const schedDate = new Date(scheduleStartDate);
        if (!isNaN(schedDate.getTime())) {
          dates.push({
            label: 'Scheduled Start Date',
            date: schedDate,
            comment: 'Using scheduled start date from registration',
            isScheduleDate: true
          });
        }
      } catch (error) {
        console.error('Error parsing schedule start date:', error);
      }
    }

    // Add term 1 start date
    if (TERMS.semester1.startDate) {
      const term1Date = parseTermDate(TERMS.semester1.startDate, currentYear);
      if (term1Date) {
        // If September 1 has already passed this year, use next year
        if (term1Date < new Date() && new Date().getMonth() > 8) {
          term1Date.setFullYear(currentYear + 1);
        }
        dates.push({
          label: 'Term 1 (Sep 1)',
          date: term1Date,
          comment: 'Official Term 1 Start Date',
          isScheduleDate: false
        });
      }
    }

    // Add term 2 start date
    if (TERMS.semester2.startDate) {
      const term2Date = parseTermDate(TERMS.semester2.startDate, currentYear);
      if (term2Date) {
        // If February 1 has already passed this year, use next year
        if (term2Date < new Date()) {
          term2Date.setFullYear(currentYear + 1);
        }
        dates.push({
          label: 'Term 2 (Feb 1)',
          date: term2Date,
          comment: 'Official Term 2 Start Date',
          isScheduleDate: false
        });
      }
    }

    // Add summer school start date
    if (TERMS.summer.startDate) {
      const summerDate = parseTermDate(TERMS.summer.startDate, currentYear);
      if (summerDate) {
        // If July 1 has already passed this year, use next year
        if (summerDate < new Date() && new Date().getMonth() > 6) {
          summerDate.setFullYear(currentYear + 1);
        }
        dates.push({
          label: 'Summer School (Jul 1)',
          date: summerDate,
          comment: 'Official start is Summer School',
          isScheduleDate: false
        });
      }
    }

    return dates;
  }, [scheduleStartDate]);

  // Parse and set the schedule start date when dialog opens
  useEffect(() => {
    if (isOpen && scheduleStartDate) {
      try {
        // Handle various date formats
        const parsedDate = new Date(scheduleStartDate);
        if (!isNaN(parsedDate.getTime())) {
          setSelectedDate(parsedDate);
          setComment(`Using scheduled start date from registration`);
        }
      } catch (error) {
        console.error('Error parsing schedule start date:', error);
      }
    }
  }, [isOpen, scheduleStartDate]);

  // Reset state when dialog closes or student changes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDate(null);
      setComment('');
      setIsSubmitting(false);
      setUseScheduleDate(true);
    }
  }, [isOpen, studentKey]);

  const handleClose = useCallback(() => {
    setSelectedDate(null);
    setComment('');
    setIsSubmitting(false);
    setUseScheduleDate(true);
    onCancel();
  }, [onCancel]);

  const handleSubmit = useCallback(async () => {
    if (!selectedDate) {
      alert('Please select a starting date');
      return;
    }

    if (!comment.trim()) {
      alert('Please provide a comment');
      return;
    }

    setIsSubmitting(true);
    const db = getDatabase();

    try {
      // Get existing notes
      const notesRef = ref(db, `students/${studentKey}/courses/${courseId}/jsonStudentNotes`);
      const notesSnapshot = await get(notesRef);
      const existingNotes = notesSnapshot.val() || [];

      // Create new note
      const now = new Date();
      const formattedDisplayDate = format(selectedDate, 'MMM d, yyyy');
      const isUsingScheduleDate = scheduleStartDate &&
        format(new Date(scheduleStartDate), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

      const noteContent = `Starting On ${formattedDisplayDate}${isUsingScheduleDate ? ' (Original Schedule Date)' : ' (Manually Set)'}\nComment: ${comment}`;

      // Store as midnight Edmonton time (which will be 07:00 or 06:00 UTC depending on DST)
      const utcDate = new Date(selectedDate);
      // Set to midnight in local timezone (Edmonton)
      utcDate.setHours(0, 0, 0, 0);
      const formattedDbDate = utcDate.toISOString();

      const newNote = {
        author: userName,
        content: noteContent,
        id: `note-${Date.now()}`,
        noteType: "📅",
        timestamp: now.toISOString()
      };

      // Get existing starting dates to handle cleanup
      const startingDatesRef = ref(db, 'notificationDates/startingDates');
      const startingDatesSnapshot = await get(startingDatesRef);
      const existingStartingDates = startingDatesSnapshot.val() || {};

      // Find and remove any existing entries for this student/course
      Object.keys(existingStartingDates).forEach(date => {
        if (existingStartingDates[date]?.[studentKey]) {
          delete existingStartingDates[date][studentKey];
          if (Object.keys(existingStartingDates[date]).length === 0) {
            delete existingStartingDates[date];
          }
        }
      });

      // Add new starting date entry
      const dateKey = format(utcDate, 'yyyy-MM-dd'); // Use date-only key for the startingDates object
      if (!existingStartingDates[dateKey]) {
        existingStartingDates[dateKey] = {};
      }
      existingStartingDates[dateKey][studentKey] = {
        courseId,
        studentEmail
      };

      // Create status log entry
      const statusLogEntry = {
        timestamp: now.toISOString(),
        status: "Starting on (Date)",
        previousStatus: statusValue || '',
        updatedBy: {
          name: userName,
          email: user.email
        },
        updatedByType: 'teacher',
        autoStatus: false
      };

      // Prepare all updates
      const updates = {
        // Add lastChange tracking with starting on details
        [`students/${studentKey}/courses/${courseId}/enrollmentHistory/lastChange`]: {
          userEmail: user?.email || 'unknown',
          timestamp: Date.now(),
          field: 'Status_Value',
          isStartingOn: true,
          startingOnDetails: {
            date: formattedDbDate,
            displayDate: formattedDisplayDate,
            comment: comment,
            isUsingScheduleDate: isUsingScheduleDate
          }
        },
        [`students/${studentKey}/courses/${courseId}/jsonStudentNotes`]: [newNote, ...existingNotes],
        [`students/${studentKey}/courses/${courseId}/Status/Value`]: "Starting on (Date)",
        [`students/${studentKey}/courses/${courseId}/statusLog/${Date.now()}`]: statusLogEntry,
        ['notificationDates/startingDates']: existingStartingDates
      };

      // Only set startingOnDate if it's different from ScheduleStartDate
      if (!isUsingScheduleDate) {
        updates[`students/${studentKey}/courses/${courseId}/startingOnDate`] = formattedDbDate;
      }

      // Update database
      await update(ref(db), updates);

      // Call onConfirm callback with the date
      await onConfirm(formattedDbDate, !isUsingScheduleDate);

      // Reset state after successful submission
      setSelectedDate(null);
      setComment('');

    } catch (error) {
      console.error('Error updating starting date:', error);
      alert('An error occurred while saving the data.');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedDate, comment, studentKey, courseId, studentEmail, userName, user.email, statusValue, scheduleStartDate, onConfirm]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Set Starting Date</DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          {/* Preset date options */}
          {presetDates.length > 0 && (
            <div className="space-y-2">
              <Label>Quick Select Options</Label>
              <div className="grid gap-2">
                {presetDates.map((preset, index) => {
                  const isSelected = selectedDate &&
                    format(selectedDate, 'yyyy-MM-dd') === format(preset.date, 'yyyy-MM-dd');
                  return (
                    <Button
                      key={index}
                      variant={isSelected ? "default" : "outline"}
                      className="justify-between"
                      onClick={() => {
                        setSelectedDate(preset.date);
                        setComment(preset.comment);
                      }}
                    >
                      <span className="flex items-center gap-2">
                        {preset.label}
                        <span className="text-xs opacity-75">
                          ({format(preset.date, 'MMM d, yyyy')})
                        </span>
                      </span>
                      {isSelected && <Check className="h-4 w-4" />}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Or Select Custom Date</Label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                // Clear comment if selecting a custom date that doesn't match any preset
                const matchesPreset = presetDates.some(preset =>
                  date && format(date, 'yyyy-MM-dd') === format(preset.date, 'yyyy-MM-dd')
                );
                if (!matchesPreset) {
                  setComment('');
                }
              }}
              customInput={
                <Button
                  variant="outline"
                  className="w-[180px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <DateDisplay date={selectedDate} placeholder="Select date" />
                </Button>
              }
              dateFormat="MM/dd/yyyy"
              minDate={new Date()}
            />
            {scheduleStartDate && selectedDate && (
              <p className="text-xs text-muted-foreground">
                {format(new Date(scheduleStartDate), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                  ? "✓ Using scheduled start date"
                  : "⚠️ Different from scheduled start date"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter comment about starting date"
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedDate || !comment.trim()}
          >
            {isSubmitting ? "Saving..." : "Confirm Date"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StartingOnDialog;