import React from 'react';
import { FaCalendarPlus, FaCheckCircle } from 'react-icons/fa';
import { ArrowDown } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

const CreateScheduleButton = ({ onClick, hasSchedule, remainingSchedules }) => {
  // If a schedule already exists and no remaining schedules are available, show a badge
  if (hasSchedule && remainingSchedules <= 0) {
    return (
      <Badge 
        className="w-full bg-gray-300 text-gray-700 border border-gray-200 flex items-center justify-center py-1"
      >
        <FaCheckCircle className="mr-2 h-3 w-3" />
        Schedule Limit Reached
      </Badge>
    );
  }

  // Show remaining schedules in button text if there's already a schedule
  const buttonText = hasSchedule 
    ? `Create New Schedule`
    : "Create Your Schedule";

  return (
    <div className="flex flex-col items-center w-full">
      {!hasSchedule && (
        <div className="mb-2 hidden lg:block">
          <ArrowDown 
            className="w-6 h-6 text-blue-500 animate-bounce"
          />
        </div>
      )}

      <Button 
        className="w-full bg-gradient-to-r from-blue-600/80 to-purple-600/80 
          hover:from-blue-700/90 hover:to-purple-700/90 text-white 
          shadow-sm transition-all duration-200"
        onClick={onClick}
      >
        <FaCalendarPlus className="mr-2 h-4 w-4" />
        {buttonText}
      </Button>
    </div>
  );
};

export default CreateScheduleButton;