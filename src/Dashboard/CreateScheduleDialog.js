// CreateScheduleDialog.js

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import YourWayScheduleMaker from '../Website/YourWayScheduleMaker';
import { getDatabase, ref, set, get } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { format } from 'date-fns';

const CreateScheduleDialog = ({ 
  isOpen, 
  onOpenChange, 
  course
}) => {
  const { user } = useAuth();

  const [saving, setSaving] = useState(false);

  const defaultStartDate = course?.ScheduleStartDate ? new Date(course.ScheduleStartDate) : null;
  const defaultEndDate = course?.ScheduleEndDate ? new Date(course.ScheduleEndDate) : null;

  const handleScheduleSaved = async (schedule) => {
    if (!user) {
      toast.error("You must be logged in to save a schedule.");
      return;
    }

    const studentEmail = user.email;
    const studentKey = sanitizeEmail(studentEmail);
    const courseId = course.CourseID;

    const db = getDatabase();
    const scheduleRef = ref(db, `students/${studentKey}/courses/${courseId}/ScheduleJSON`);
    const notesRef = ref(db, `students/${studentKey}/courses/${courseId}/jsonStudentNotes`);

    const userName = user.displayName || user.email || 'Unknown User';
    const timestamp = new Date().toISOString();
    const defaultNoteContent = `📅 Schedule created by ${userName}.\nStart Date: ${format(new Date(schedule.startDate), 'MMM dd, yyyy')}\nEnd Date: ${format(new Date(schedule.endDate), 'MMM dd, yyyy')}`;

    const newNote = {
      id: `note-${Date.now()}`,
      content: defaultNoteContent,
      timestamp: timestamp,
      author: userName,
      noteType: '📅',
    };

    try {
      setSaving(true);

      const existingScheduleSnapshot = await get(scheduleRef);
      let remainingSchedules;
      if (existingScheduleSnapshot.exists()) {
        const existingSchedule = existingScheduleSnapshot.val();
        remainingSchedules = existingSchedule.remainingSchedules !== undefined 
          ? existingSchedule.remainingSchedules - 1 
          : 1;
      } else {
        remainingSchedules = 1;
      }

      if (remainingSchedules <= 0) {
        toast.error("You have no remaining schedules left to save.");
        setSaving(false);
        return;
      }

      schedule.remainingSchedules = remainingSchedules;

      const existingNotesSnapshot = await get(notesRef);
      const existingNotes = existingNotesSnapshot.exists() ? existingNotesSnapshot.val() : [];
      const updatedNotes = [newNote, ...(Array.isArray(existingNotes) ? existingNotes : Object.values(existingNotes))];

      await Promise.all([
        set(scheduleRef, schedule),
        set(notesRef, updatedNotes),
      ]);

      toast.success("Your schedule and note have been saved successfully!");
      onOpenChange(false);

    } catch (error) {
      console.error('Error saving schedule and note:', error);
      toast.error("Failed to save schedule and note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl">
        <DialogHeader>
          <DialogTitle>Create Your Course Schedule</DialogTitle>
          <DialogDescription>
            Design your learning schedule for {course?.Course?.Value || 'your course'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="h-[80vh] overflow-auto">
          <YourWayScheduleMaker
            courseId={course.CourseID}
            defaultStartDate={defaultStartDate}
            defaultEndDate={defaultEndDate}
            onScheduleSaved={handleScheduleSaved}
           
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateScheduleDialog;
