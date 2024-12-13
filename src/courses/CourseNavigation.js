import React from 'react';
import { ScrollArea } from '../components/ui/scroll-area';
import { Progress } from '../components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { Badge } from '../components/ui/badge';
import { format, parseISO } from 'date-fns';
import { 
  Book, 
  GraduationCap, 
  FileText, 
  Info,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Flag,
  UserCircle,
  Star
} from 'lucide-react';

const CourseNavigation = ({ 
  courseTitle,
  schedule,
  units = [],
  currentUnitIndex,
  currentItemIndex,
  calculateProgress,
  findScheduleItem,
  isCurrentAssignment,
  isLastStartedAssignment,
  onItemSelect,
  typeColors
}) => {
  const getItemIcon = (type) => {
    switch (type) {
      case 'lesson':
        return <Book className="w-5 h-5" />;
      case 'assignment':
        return <FileText className="w-5 h-5" />;
      case 'exam':
        return <GraduationCap className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="font-semibold text-lg text-gray-800 line-clamp-2 break-words">
          {courseTitle}
        </h2>
        {schedule && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span className="break-words">
                {format(parseISO(schedule.startDate), 'MMM d')} - {format(parseISO(schedule.endDate), 'MMM d, yyyy')}
              </span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{calculateProgress()}%</span>
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 w-full">
        <div className="p-4">
          {units.map((unit, unitIdx) => (
            <div key={unit.sequence} className="mb-6">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2 text-gray-700 font-medium flex-shrink-0">
                  {unit.sequence}
                </div>
                <h3 className="font-semibold text-gray-900 break-words">
                  {unit.name}
                </h3>
              </div>

              <div className="ml-4 space-y-1">
                {unit.items.map((item, itemIdx) => {
                  const isActive = currentUnitIndex === unitIdx && currentItemIndex === itemIdx;
                  const scheduleItem = findScheduleItem(item);
                  const isCurrent = isCurrentAssignment(item);
                  const isLastStarted = isLastStartedAssignment(item);

                  return (
                    <TooltipProvider key={item.sequence}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => onItemSelect(unitIdx, itemIdx)}
                            className={`w-full text-left p-2 rounded-lg transition-all duration-200 flex gap-2
                              ${isActive ? typeColors[item.type] : 'hover:bg-gray-50'} border
                              ${isActive ? '' : 'border-transparent hover:border-gray-200'}
                              ${isCurrent ? 'border-green-500 border-2' : ''}
                              ${isLastStarted ? 'border-yellow-500 border-2' : ''}`}
                          >
                            <div className="flex-shrink-0 flex items-start pt-0.5">
                              {isCurrent && <Flag className="w-4 h-4 text-green-500 mr-1" />}
                              {isLastStarted && <UserCircle className="w-4 h-4 text-yellow-500 mr-1" />}
                              <span className={`${isActive ? 'text-current' : typeColors[item.type].split(' ')[0]}`}>
                                {scheduleItem?.completed ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                                ) : getItemIcon(item.type)}
                              </span>
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <div className="text-sm break-words">
                                {item.title}
                              </div>
                              {scheduleItem && (
                                <div className="text-xs mt-0.5">
                                  <span className="inline-flex items-center">
                                    <CalendarDays className="w-3 h-3 mr-1 flex-shrink-0" />
                                    {format(parseISO(scheduleItem.date), 'MMM d')}
                                  </span>
                                </div>
                              )}
                            </div>
                            {item.multiplier > 1 && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 flex-shrink-0 self-start mt-0.5">
                                {item.multiplier}x
                              </span>
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {isCurrent && <p>Current Assignment</p>}
                          {isLastStarted && <p>Last Started Assignment</p>}
                          {scheduleItem?.gradebookData?.grade?.percentage !== undefined && (
                            <p>Grade: {scheduleItem.gradebookData.grade.percentage}%</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CourseNavigation;