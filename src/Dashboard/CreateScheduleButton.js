import React from 'react';
import { FaCalendarPlus, FaCheckCircle } from 'react-icons/fa';
import { ArrowDown } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

const CreateScheduleButton = ({ onClick, hasSchedule }) => {
  if (hasSchedule) {
    return (
      <Badge 
        className="w-full bg-green-100 text-green-800 hover:bg-green-100 border border-green-200 flex items-center justify-center py-1"
      >
        <FaCheckCircle className="mr-2 h-3 w-3" />
        Schedule Created
      </Badge>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div className="mb-2 hidden lg:block">
        <ArrowDown 
          className="w-6 h-6 text-blue-500 animate-bounce"
        />
      </div>

      <Button 
        className="w-full bg-gradient-to-r from-blue-600/80 to-purple-600/80 
          hover:from-blue-700/90 hover:to-purple-700/90 text-white 
          shadow-sm transition-all duration-200"
        onClick={onClick}
      >
        <FaCalendarPlus className="mr-2 h-4 w-4" />
        Create Schedule
      </Button>
    </div>
  );
};

export default CreateScheduleButton;