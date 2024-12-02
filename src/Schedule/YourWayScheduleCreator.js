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
    const basePath = `students/${studentKey}/courses/${courseId}`;
    const scheduleRef = ref(db, `${basePath}/ScheduleJSON`);
    const notesRef = ref(db, `${basePath}/jsonStudentNotes`);
  
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
        remainingSchedules: newRemainingSchedules
      };
  
      const existingNotesSnapshot = await get(notesRef);
      const existingNotes = existingNotesSnapshot.exists() ? existingNotesSnapshot.val() : [];
      const updatedNotes = [newNote, ...(Array.isArray(existingNotes) ? existingNotes : Object.values(existingNotes))];
  
      // Save all updates atomically
      await Promise.all([
        set(scheduleRef, completeSchedule), // Save complete schedule with updated remainingSchedules
        set(notesRef, updatedNotes)
      ]);
  
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