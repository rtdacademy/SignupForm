import React, { useState } from 'react';
import YourWayScheduleMaker from './YourWayScheduleMaker';
import { getDatabase, ref, set, get } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { format, addMonths } from 'date-fns';

const YourWayScheduleCreator = ({ 
  course,
  onScheduleSaved,
  className = '',
  isScheduleUpdate = false,
  initialEndDate = addMonths(new Date(), 5)
}) => {
  const { currentUser, current_user_email_key, isEmulating } = useAuth();
  const [saving, setSaving] = useState(false);

  const [defaultStartDate] = useState(() => new Date());
  const [defaultEndDate] = useState(() => {
    if (initialEndDate) return new Date(initialEndDate);
    return addMonths(new Date(), 5);
  });

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
  
    const userName = currentUser.displayName || currentUser.email || 'Unknown User';
    const timestamp = new Date().toISOString();
    const defaultNoteContent = `📅 Schedule ${isScheduleUpdate ? 'updated' : 'created'}${isEmulating ? ' (via emulation)' : ''} by ${userName}.\nStart Date: ${format(new Date(schedule.startDate), 'MMM dd, yyyy')}\nEnd Date: ${format(new Date(schedule.endDate), 'MMM dd, yyyy')}`;
  
    const newNote = {
      id: `note-${Date.now()}`,
      content: defaultNoteContent,
      timestamp: timestamp,
      author: userName,
      noteType: '📅',
    };
  
    try {
      setSaving(true);
  
      let completeSchedule;
      
      if (isScheduleUpdate) {
        // For schedule updates, preserve the existing remainingSchedules value
        const existingScheduleSnapshot = await get(scheduleRef);
        const existingRemainingSchedules = existingScheduleSnapshot.exists() 
          ? existingScheduleSnapshot.val().remainingSchedules 
          : 2;

        completeSchedule = {
          ...schedule,
          remainingSchedules: existingRemainingSchedules,
          updatedViaValidation: true, 
          updatedBy: currentUser.email
        };
      } else {
        // Original logic for new schedules
        const existingScheduleSnapshot = await get(scheduleRef);
        let currentRemainingSchedules = 2;
        
        if (existingScheduleSnapshot.exists()) {
          const existingSchedule = existingScheduleSnapshot.val();
          currentRemainingSchedules = existingSchedule.remainingSchedules !== undefined 
            ? existingSchedule.remainingSchedules
            : 2;
        }
        
        if (currentRemainingSchedules <= 0) {
          toast.error("You have no remaining schedules left to save.");
          setSaving(false);
          return;
        }
        
        completeSchedule = {
          ...schedule,
          remainingSchedules: currentRemainingSchedules - 1,
          createdViaEmulation: isEmulating,
          createdBy: currentUser.email
        };
      }
  
      const existingNotesSnapshot = await get(notesRef);
      const existingNotes = existingNotesSnapshot.exists() ? existingNotesSnapshot.val() : [];
      const updatedNotes = [newNote, ...(Array.isArray(existingNotes) ? existingNotes : Object.values(existingNotes))];
  
      const updates = [
        set(scheduleRef, completeSchedule),
        set(notesRef, updatedNotes)
      ];
  
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
  
      await Promise.all(updates);
  
      toast.success(`Your schedule has been ${isScheduleUpdate ? 'updated' : 'saved'} successfully!`);
      if (onScheduleSaved) {
        onScheduleSaved(completeSchedule);
      }
  
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error(`Failed to ${isScheduleUpdate ? 'update' : 'save'} schedule. Please try again.`);
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