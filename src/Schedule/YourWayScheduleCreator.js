import React, { useState } from 'react';
import YourWayScheduleMaker from './YourWayScheduleMaker';
import { getDatabase, ref, set, get } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { format } from 'date-fns';

const YourWayScheduleCreator = ({ 
  course,
  onScheduleSaved,
  className = ''
}) => {
  const { currentUser, current_user_email_key, isEmulating } = useAuth();
  const [saving, setSaving] = useState(false);

  const defaultStartDate = course?.ScheduleStartDate ? new Date(course.ScheduleStartDate) : null;
  const defaultEndDate = course?.ScheduleEndDate ? new Date(course.ScheduleEndDate) : null;

  const handleScheduleSaved = async (schedule) => {
    if (!currentUser || !current_user_email_key) {
      toast.error("You must be logged in to save a schedule.");
      return;
    }
  
    const courseId = course.CourseID;
    const db = getDatabase();
    const basePath = `students/${current_user_email_key}/courses/${courseId}`;
    const scheduleRef = ref(db, `${basePath}/ScheduleJSON`);
    const notesRef = ref(db, `${basePath}/jsonStudentNotes`);
    const diplomaChoicesRef = ref(db, `${basePath}/DiplomaMonthChoices`);
  
    // Use currentUser for display info, but note if it's an emulated action
    const userName = currentUser.displayName || currentUser.email || 'Unknown User';
    const timestamp = new Date().toISOString();
    const defaultNoteContent = `📅 Schedule created${isEmulating ? ' (via emulation)' : ''} by ${userName}.\nStart Date: ${format(new Date(schedule.startDate), 'MMM dd, yyyy')}\nEnd Date: ${format(new Date(schedule.endDate), 'MMM dd, yyyy')}`;
  
    const newNote = {
      id: `note-${Date.now()}`,
      content: defaultNoteContent,
      timestamp: timestamp,
      author: userName,
      noteType: '📅',
    };
  
    try {
      setSaving(true);
  
      // Get current remaining schedules value
      const existingScheduleSnapshot = await get(scheduleRef);
      let currentRemainingSchedules = 2; // Default value for new schedules
      
      if (existingScheduleSnapshot.exists()) {
        const existingSchedule = existingScheduleSnapshot.val();
        currentRemainingSchedules = existingSchedule.remainingSchedules !== undefined 
          ? existingSchedule.remainingSchedules
          : 2;
      }
  
      // Decrement remaining schedules
      const newRemainingSchedules = Math.max(0, currentRemainingSchedules - 1);
  
      if (newRemainingSchedules < 0) {
        toast.error("You have no remaining schedules left to save.");
        setSaving(false);
        return;
      }
  
      // Create complete schedule object with the decremented remainingSchedules
      const completeSchedule = {
        ...schedule,
        remainingSchedules: newRemainingSchedules,
        createdViaEmulation: isEmulating, // Add flag to track if created via emulation
        createdBy: currentUser.email // Track who created it
      };
  
      const existingNotesSnapshot = await get(notesRef);
      const existingNotes = existingNotesSnapshot.exists() ? existingNotesSnapshot.val() : [];
      const updatedNotes = [newNote, ...(Array.isArray(existingNotes) ? existingNotes : Object.values(existingNotes))];
  
      // Add diploma month update if present
      const updates = [
        set(scheduleRef, completeSchedule),
        set(notesRef, updatedNotes)
      ];
  
      // If there's a diploma month choice, add it to the updates
      if (schedule.diplomaMonth) {
        const diplomaValue = schedule.diplomaMonth.alreadyWrote 
          ? "Already Wrote" 
          : schedule.diplomaMonth.month;
        
        updates.push(
          set(diplomaChoicesRef, {
            Id: 1,
            Value: diplomaValue
          })
        );
      }
  
      // Save all updates atomically
      await Promise.all(updates);
  
      toast.success("Your schedule and note have been saved successfully!");
      if (onScheduleSaved) {
        onScheduleSaved(completeSchedule);
      }
  
    } catch (error) {
      console.error('Error saving schedule and note:', error);
      toast.error("Failed to save schedule and note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="space-y-4">
        <div>
          <p className="text-gray-500">
            Design your learning schedule for {course?.Course?.Value || 'your course'}
          </p>
        </div>
        
        <div className="h-[80vh] overflow-auto">
          <YourWayScheduleMaker
            courseId={course.CourseID}
            defaultStartDate={defaultStartDate}
            defaultEndDate={defaultEndDate}
            onScheduleSaved={handleScheduleSaved}
          />
        </div>
      </div>
    </div>
  );
};

export default YourWayScheduleCreator;