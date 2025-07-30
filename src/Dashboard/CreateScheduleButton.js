import React from 'react';
import { FaCalendarPlus, FaLock } from 'react-icons/fa';
import { ArrowDown, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip';

const CreateScheduleButton = ({ onClick, hasSchedule, gracePeriodInfo, courseName, teacherEmail }) => {
  const { isInGracePeriod, daysRemaining, hasStarted, noScheduleYet } = gracePeriodInfo || {};
  
  // If no schedule exists yet, always show create button
  if (!hasSchedule || noScheduleYet) {
    return (
      <div className="flex flex-col items-center w-full">
        <div className="mb-2 hidden lg:block">
          <ArrowDown 
            className="w-6 h-6 text-blue-500 animate-bounce"
          />
        </div>
        <Button 
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-sm transition-all duration-200"
          onClick={onClick}
        >
          <FaCalendarPlus className="mr-2 h-4 w-4" />
          Create Your Schedule
        </Button>
      </div>
    );
  }
  
  // If schedule exists and grace period has expired, show locked badge
  if (hasSchedule && !isInGracePeriod) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full">
              <Badge 
                className="w-full bg-gray-100 text-gray-600 border border-gray-300 flex items-center justify-center py-2 cursor-not-allowed hover:bg-gray-100"
                onClick={onClick}
              >
                <FaLock className="mr-2 h-3 w-3" />
                Schedule Locked
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>Your schedule modification period has ended. Contact {teacherEmail} for assistance.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // During grace period or before course starts
  const showSparkle = isInGracePeriod && daysRemaining > 3;
  const buttonText = hasSchedule 
    ? "Update Schedule"
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
        className={`w-full ${
          showSparkle 
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
            : 'bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-700/90 hover:to-purple-700/90'
        } text-white shadow-sm transition-all duration-200`}
        onClick={onClick}
      >
        {showSparkle ? (
          <Sparkles className="mr-2 h-4 w-4" />
        ) : (
          <FaCalendarPlus className="mr-2 h-4 w-4" />
        )}
        {buttonText}
      </Button>
    </div>
  );
};

export default CreateScheduleButton;