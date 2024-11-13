import React, { useState, useMemo, useRef, useEffect } from 'react';
import { format, parseISO, startOfToday, isAfter, isBefore, isSameDay } from 'date-fns';
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { Calendar, Flag, Info } from 'lucide-react';

const typeColors = {
  lesson: 'bg-blue-100 text-blue-800',
  assignment: 'bg-green-100 text-green-800',
  exam: 'bg-red-100 text-red-800',
  info: 'bg-yellow-100 text-yellow-800'
};

const ScheduleItem = ({ item, isCurrentItem, isPastDue }) => {
  const [isOpen, setIsOpen] = useState(false);
  const formattedDate = useMemo(() => {
    return format(parseISO(item.date), 'EEE, MMM d, yyyy');
  }, [item.date]);

  return (
    <Card className={`mb-2 shadow-sm ${isCurrentItem ? 'border-green-500 border-2' : ''} 
      ${isPastDue ? 'bg-red-50' : ''}`}>
      <CardContent className="p-3">
        <div className="flex justify-between items-center">
          <div className="flex-grow flex items-center gap-2">
            {isCurrentItem && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Flag className="text-green-500" size={16} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Current Item</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {isPastDue && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="text-red-500" size={16} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Past Due</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <div>
              <h3 className="text-base font-semibold">{item.title}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar size={12} />
                {formattedDate}
              </div>
            </div>
          </div>
          <Badge className={`${typeColors[item.type] || 'bg-gray-100 text-gray-800'} text-xs`}>
            {item.type}
          </Badge>
        </div>

        {item.notes && isOpen && (
          <div className="mt-2 text-sm text-gray-700">
            {item.notes}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ScheduleDisplay = ({ scheduleJSON }) => {
  const containerRef = useRef(null);
  const itemRefs = useRef([]);

  const { sortedItems, currentItemIndex } = useMemo(() => {
    if (!scheduleJSON || !scheduleJSON.units) {
      return { sortedItems: [], currentItemIndex: -1 };
    }

    // Flatten and sort all items by date
    const items = scheduleJSON.units
      .flatMap(unit => unit.items || [])
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Find the current item (first item that's not past due)
    const today = startOfToday();
    const currentIndex = items.findIndex(item => {
      const itemDate = parseISO(item.date);
      return isAfter(itemDate, today) || isSameDay(itemDate, today);
    });

    return {
      sortedItems: items,
      currentItemIndex: currentIndex === -1 ? items.length - 1 : currentIndex
    };
  }, [scheduleJSON]);

  useEffect(() => {
    // Scroll to current item
    if (currentItemIndex >= 0) {
      const timeoutId = setTimeout(() => {
        const element = itemRefs.current[currentItemIndex];
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [currentItemIndex]);

  if (!scheduleJSON || !scheduleJSON.units) {
    return <div className="p-4 text-center text-gray-500">No schedule data available</div>;
  }

  const today = startOfToday();

  return (
    <div ref={containerRef} className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">{scheduleJSON.courseTitle || 'Course Schedule'}</h1>
        <div className="text-sm text-gray-500">
          {format(parseISO(scheduleJSON.startDate), 'MMM d, yyyy')} - {format(parseISO(scheduleJSON.endDate), 'MMM d, yyyy')}
        </div>
      </div>

      <div className="space-y-2">
        {sortedItems.map((item, index) => (
          <div key={index} ref={el => (itemRefs.current[index] = el)}>
            <ScheduleItem
              item={item}
              isCurrentItem={index === currentItemIndex}
              isPastDue={isBefore(parseISO(item.date), today) && index < currentItemIndex}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleDisplay;