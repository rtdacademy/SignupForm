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
      const saveSchedule = httpsCallable(functions, 'saveStudentScheduleV2');
      
      const result = await saveSchedule({
        scheduleData: schedule,
        courseId: courseId,
        isScheduleUpdate: isScheduleUpdate,
        note: newNote
      });
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      if (result.data.success) {
        const formatMessage = result.data.formatUsed === 'enhanced' ? ' (Enhanced Format)' : '';
        toast.success(`Your schedule has been ${isScheduleUpdate ? 'updated' : 'saved'} successfully!${formatMessage}`);
        if (onScheduleSaved) {
          onScheduleSaved(result.data.scheduleData);
        }
        // Page refresh removed - real-time updates now working properly
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
    <div className={`w-full h-full flex flex-col ${className}`}>
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold">Create Your Course Schedule</h2>
        <p className="text-sm text-gray-500 mt-1">
          Design your learning schedule for {course?.Course?.Value || 'your course'}
        </p>
      </div>
      
      <div className="flex-1 overflow-auto">
        <YourWayScheduleMaker
          course={course}
          defaultStartDate={defaultStartDate}
          defaultEndDate={defaultEndDate}
          onScheduleSaved={handleScheduleSaved}
          disableDirectSave={true}
        />
      </div>
    </div>
  );
};

export default YourWayScheduleCreator;