import React, { useState, useMemo, useRef, useEffect } from 'react';
import { format, parseISO, startOfToday, isAfter, isSameDay } from 'date-fns';
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { Calendar, Flag } from 'lucide-react';

const typeColors = {
  lesson: 'bg-blue-100 text-blue-800',
  assignment: 'bg-green-100 text-green-800',
  exam: 'bg-red-100 text-red-800',
  info: 'bg-yellow-100 text-yellow-800'
};

const sanitizeHTML = (html) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  const elements = tempDiv.getElementsByTagName('*');
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    for (let j = 0; j < element.attributes.length; j++) {
      const attr = element.attributes[j];
      if (attr.name.startsWith('on')) {
        element.removeAttribute(attr.name);
      }
    }
  }
  
  return tempDiv.innerHTML;
};

const ScheduleItem = ({ item, isCurrentItem }) => {
  const [isOpen, setIsOpen] = useState(false);
  const formattedDate = useMemo(() => {
    return format(parseISO(item.date), 'EEE, MMM d, yyyy');
  }, [item.date]);

  const sanitizedTitle = useMemo(() => ({
    __html: sanitizeHTML(item.title)
  }), [item.title]);

  const sanitizedNotes = useMemo(() => ({
    __html: item.notes ? sanitizeHTML(item.notes) : ''
  }), [item.notes]);

  // Get background color based on type for subtle title highlighting
  const getTitleAccentColor = (type) => {
    switch (type) {
      case 'exam': return 'bg-red-50';
      case 'assignment': return 'bg-green-50';
      case 'lesson': return 'bg-blue-50';
      case 'info': return 'bg-yellow-50';
      default: return 'bg-gray-50';
    }
  };

  return (
    <Card 
      className={`mb-2 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer
        ${isCurrentItem ? 'border-green-500 border-2' : ''}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <div className="flex-grow flex items-start gap-2">
            {isCurrentItem && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Flag className="text-green-500 mt-1" size={16} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Current Item</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <div className="flex-grow">
              <div 
                className={`prose prose-sm max-w-none prose-headings:m-0 prose-p:m-0
                  prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                  font-medium text-gray-900 ${getTitleAccentColor(item.type)} 
                  p-2 rounded-md mb-2`}
                dangerouslySetInnerHTML={sanitizedTitle}
              />
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 ml-2">
                <Calendar size={12} />
                {formattedDate}
              </div>
            </div>
          </div>
          <Badge className={`${typeColors[item.type] || 'bg-gray-100 text-gray-800'} text-xs ml-2 shrink-0`}>
            {item.type}
          </Badge>
        </div>

        {item.notes && isOpen && (
          <div 
            className="mt-3 prose prose-sm max-w-none prose-a:text-blue-600 
              prose-a:no-underline hover:prose-a:underline ml-2"
            dangerouslySetInnerHTML={sanitizedNotes}
          />
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
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleDisplay;