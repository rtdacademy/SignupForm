import React, { useState } from 'react';
import YourWayScheduleMaker from './YourWayScheduleMaker';
import { getDatabase, ref, set, get } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
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
      
      // Show loading toast
      const loadingToast = toast.loading(`Saving your schedule...`);
      
      const functions = getFunctions();
      const saveSchedule = httpsCallable(functions, 'saveStudentSchedule');
      
      const result = await saveSchedule({
        scheduleData: schedule,
        courseId: courseId,
        isScheduleUpdate: isScheduleUpdate,
        note: newNote
      });
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      if (result.data.success) {
        toast.success(`Your schedule has been ${isScheduleUpdate ? 'updated' : 'saved'} successfully!`);
        if (onScheduleSaved) {
          onScheduleSaved(result.data.scheduleData);
        }
      } else {
        toast.error(result.data.message || `Failed to ${isScheduleUpdate ? 'update' : 'save'} schedule`);
      }
  
    } catch (error) {
      console.error('Error saving schedule:', error);
      if (error.message.includes('No remaining schedules')) {
        toast.error("You have no remaining schedules left to save.");
      } else {
        toast.error(error.message || `Failed to ${isScheduleUpdate ? 'update' : 'save'} schedule. Please try again.`);
      }
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
            course={course}
            defaultStartDate={defaultStartDate}
            defaultEndDate={defaultEndDate}
            onScheduleSaved={handleScheduleSaved}
            disableDirectSave={true}
          />
        </div>
      </div>
    </div>
  );
};

export default YourWayScheduleCreator;