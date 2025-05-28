import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { useAuth } from '../../context/AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getDatabase, ref, get, update } from 'firebase/database';
import { format } from 'date-fns';

const DateDisplay = ({ date, placeholder }) => {
  if (!date) return <span>{placeholder}</span>;
  return <span>{format(new Date(date), 'MM/dd/yyyy')}</span>;
};

const ResumingOnDialog = ({
  isOpen,
  onOpenChange,
  status,
  statusValue,
  studentName,
  courseName,
  studentKey,
  courseId,
  studentEmail,
  onConfirm,
  onCancel
}) => {
  const { user } = useAuth();
  const userName = user.displayName;
  const [selectedDate, setSelectedDate] = useState(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when dialog opens/closes or student changes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDate(null);
      setComment('');
      setIsSubmitting(false);
    }
  }, [isOpen, studentKey]);

  const handleClose = useCallback(() => {
    setSelectedDate(null);
    setComment('');
    setIsSubmitting(false);
    onCancel();
  }, [onCancel]);

  const handleSubmit = useCallback(async () => {
    if (!selectedDate) {
      alert('Please select a resuming date');
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
      const noteContent = `Resuming On ${formattedDisplayDate}\nComment: ${comment}`;
      
      // Create UTC date at 07:00:00
      const utcDate = new Date(selectedDate);
      utcDate.setUTCHours(7, 0, 0, 0);
      const formattedDbDate = utcDate.toISOString();
  
      const newNote = {
        author: userName,
        content: noteContent,
        id: `note-${Date.now()}`,
        noteType: "⌛",
        timestamp: now.toISOString()
      };
  
      // Get existing resuming dates to handle cleanup
      const resumingDatesRef = ref(db, 'notificationDates/resumingDates');
      const resumingDatesSnapshot = await get(resumingDatesRef);
      const existingResumingDates = resumingDatesSnapshot.val() || {};
  
      // Find and remove any existing entries for this student/course
      Object.keys(existingResumingDates).forEach(date => {
        if (existingResumingDates[date]?.[studentKey]) {
          delete existingResumingDates[date][studentKey];
          if (Object.keys(existingResumingDates[date]).length === 0) {
            delete existingResumingDates[date];
          }
        }
      });
  
      // Add new resuming date entry
      const dateKey = format(utcDate, 'yyyy-MM-dd'); // Use date-only key for the resumingDates object
      if (!existingResumingDates[dateKey]) {
        existingResumingDates[dateKey] = {};
      }
      existingResumingDates[dateKey][studentKey] = {
        courseId,
        studentEmail
      };
  
      // Create status log entry
      const statusLogEntry = {
        timestamp: now.toISOString(),
        status: "Resuming on (date)",
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
        // Add lastChange tracking with resuming on details
        [`students/${studentKey}/courses/${courseId}/enrollmentHistory/lastChange`]: {
          userEmail: user?.email || 'unknown',
          timestamp: Date.now(),
          field: 'Status_Value',
          isResumingOn: true,
          resumingOnDetails: {
            date: formattedDbDate,
            displayDate: formattedDisplayDate,
            comment: comment
          }
        },
        [`students/${studentKey}/courses/${courseId}/jsonStudentNotes`]: [newNote, ...existingNotes],
        [`students/${studentKey}/courses/${courseId}/resumingOnDate`]: formattedDbDate,
        [`students/${studentKey}/courses/${courseId}/Status/Value`]: "Resuming on (date)",
        [`students/${studentKey}/courses/${courseId}/statusLog/${Date.now()}`]: statusLogEntry,
        ['notificationDates/resumingDates']: existingResumingDates
      };
  
      // Update database
      await update(ref(db), updates);
  
      // Call onConfirm callback with the date
      await onConfirm(formattedDbDate);
      
      // Reset state after successful submission
      setSelectedDate(null);
      setComment('');
      
    } catch (error) {
      console.error('Error updating resuming date:', error);
      alert('An error occurred while saving the data.');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedDate, comment, studentKey, courseId, studentEmail, userName, user.email, statusValue, onConfirm]);

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
          <DialogTitle>Select Resuming Date</DialogTitle>
          <DialogDescription className="pt-4">
            Select when this student will resume their coursework:
            <div className="font-medium mt-2 text-base text-foreground">
              {studentName}
            </div>
            <div className="font-medium mt-1 text-blue-600">
              {courseName}
            </div>
          </DialogDescription>
        </DialogHeader>

        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            The student's status will be set to "Resuming on {selectedDate ? format(selectedDate, 'MMM d, yyyy') : '(date)'}".
          </AlertDescription>
        </Alert>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label>Select Resuming Date</Label>
            <DatePicker
              selected={selectedDate}
              onChange={setSelectedDate}
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter comment about resuming date"
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

export default ResumingOnDialog;