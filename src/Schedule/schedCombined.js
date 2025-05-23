import React, { useState, useMemo, useRef, useEffect } from 'react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../components/ui/collapsible";
import { ChevronDown, ChevronUp, Flag, UserCircle } from 'lucide-react';

const typeColors = {
  lesson: 'bg-blue-100 text-blue-800',
  assignment: 'bg-green-100 text-green-800',
  exam: 'bg-red-100 text-red-800',
  info: 'bg-yellow-100 text-yellow-800',
};

const StatusBadge = ({ status }) => {
  const statusColors = {
    Submitted: 'bg-green-100 text-green-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
    Unknown: 'bg-gray-100 text-gray-800',
  };

  return (
    <Badge className={`${statusColors[status] || 'bg-gray-100 text-gray-800'} text-xs`}>
      {status}
    </Badge>
  );
};

const ScheduleItem = ({ item, isClosestToToday, isCurrentAssignment, isLastStartedAssignment }) => {
  const [isOpen, setIsOpen] = useState(false);
  const formattedDate = useMemo(() => {
    return format(parseISO(item.date), 'EEE, MMM d, yyyy');
  }, [item.date]);

  const percentage = item.gradebookData?.grade?.percentage ?? 'N/A';

  return (
    <Card className={`mb-2 shadow-sm ${isClosestToToday ? 'bg-blue-50' : ''} ${isCurrentAssignment ? 'border-green-500 border-2' : ''} ${isLastStartedAssignment ? 'border-yellow-500 border-2' : ''}`}>
      <CardContent className="p-3">
        <div className="flex justify-between items-center mb-1">
          <div className="flex-grow flex items-center">
            {isCurrentAssignment && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Flag className="mr-2 text-green-500" size={16} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Current Assignment</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {isLastStartedAssignment && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <UserCircle className="mr-2 text-yellow-500" size={16} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Last Started Assignment</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <div>
              <h3 className="text-base font-semibold">{item.title}</h3>
              <p className="text-xs text-gray-500">{formattedDate}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex flex-col items-end">
              <Badge className={`${typeColors[item.type] || 'bg-gray-100 text-gray-800'} text-xs mb-1`}>
                {item.type}
              </Badge>
              <p className="text-xs font-semibold">
                {percentage !== 'N/A' ? `${percentage}%` : 'N/A'}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-500 hover:text-gray-700"
            >
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="mt-2">
            {item.notes && (
              <div
                className="mb-2 text-xs text-gray-700"
                dangerouslySetInnerHTML={{ __html: item.notes }}
              />
            )}

            {item.gradebookData && (
              <>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <h4 className="font-semibold mb-1">Gradebook Data</h4>
                    <p>Points Possible: {item.gradebookData.pointsPossible ?? 'N/A'}</p>
                    <p>Started: {item.gradebookData.started ? 'Yes' : 'No'}</p>
                    <p>Excused: {item.gradebookData.isExcused ? 'Yes' : 'No'}</p>
                  </div>
                  {item.gradebookData.grade && (
                    <div>
                      <h4 className="font-semibold mb-1">Grade Information</h4>
                      <StatusBadge status={item.gradebookData.grade.status ?? 'Unknown'} />
                      <p className="mt-1">Score: {item.gradebookData.grade.score ?? 'N/A'}</p>
                    </div>
                  )}
                </div>

                {item.gradebookData.grade && (
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="text-left">
                          <span className="font-semibold">Time on Task:</span>{' '}
                          {Math.round((item.gradebookData.grade.timeOnTask ?? 0) / 60)} minutes
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            Actual time spent:{' '}
                            {Math.round((item.gradebookData.grade.timeSpent ?? 0) / 60)} minutes
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <p>
                      <span className="font-semibold">Has Feedback:</span>{' '}
                      {item.gradebookData.grade.hasFeedback ? 'Yes' : 'No'}
                    </p>
                    <p>
                      <span className="font-semibold">Manual Grading Status:</span>{' '}
                      {item.gradebookData.grade.manualGradingStatus ?? 'N/A'}
                    </p>
                    <p>
                      <span className="font-semibold">Prerequisites Met:</span>{' '}
                      {item.gradebookData.grade.prerequisitesMet ? 'Yes' : 'No'}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const SchedCombined = ({ jsonGradebookSchedule }) => {
  const containerRef = useRef(null);
  const itemRefs = useRef([]);

  const { sortedItems, currentAssignmentIndex, lastStartedIndex } = useMemo(() => {
    const sorted = jsonGradebookSchedule.units
      .flatMap(unit => unit.items)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const { currentAssignmentIndex, lastStartedIndex } = jsonGradebookSchedule.adherenceMetrics;

    return { sortedItems: sorted, currentAssignmentIndex, lastStartedIndex };
  }, [jsonGradebookSchedule]);

  useEffect(() => {
    const scrollToItem = () => {
      const item = itemRefs.current[currentAssignmentIndex];
      if (item) {
        item.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    };

    const timeoutId = setTimeout(scrollToItem, 500);

    return () => clearTimeout(timeoutId);
  }, [currentAssignmentIndex]);

  return (
    <div ref={containerRef} className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Course Schedule</h1>
      <div className="space-y-2">
        {sortedItems.map((item, index) => (
          <div key={index} ref={el => (itemRefs.current[index] = el)}>
            <ScheduleItem
              item={item}
              isClosestToToday={index === currentAssignmentIndex}
              isCurrentAssignment={index === currentAssignmentIndex}
              isLastStartedAssignment={index === lastStartedIndex}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchedCombined;