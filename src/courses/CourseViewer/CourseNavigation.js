import React, { useEffect, useMemo } from 'react';
import { ScrollArea } from '../../components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../../components/ui/accordion';
import { format, parseISO, fromUnixTime } from 'date-fns';
import {
  Calendar,
  CalendarDays,
  BookOpen,
  Clock as ClockIcon,
  PlayCircle,
  Target,
  Info,
} from 'lucide-react';
import ProgressSection from '../components/ProgressSection';

const typeColors = {
  lesson: 'bg-blue-100 text-blue-800',
  assignment: 'bg-green-100 text-green-800',
  exam: 'bg-red-100 text-red-800',
  info: 'bg-yellow-100 text-yellow-800',
};

const getTitleAccentColor = (type) => {
  switch (type) {
    case 'exam':
      return 'bg-red-50';
    case 'assignment':
      return 'bg-green-50';
    case 'lesson':
      return 'bg-blue-50';
    case 'info':
      return 'bg-yellow-50';
    default:
      return 'bg-gray-50';
  }
};

const sanitizeHTML = (html) => {
  if (!html || typeof html !== 'string') return '';
  
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

const TimeDetails = ({ startTime, lastChange }) => {
  if (!startTime && !lastChange) return null;

  return (
    <div className="space-y-2 p-2">
      {startTime && (
        <div className="text-sm">
          <span className="font-medium">Started:</span>{' '}
          {format(fromUnixTime(startTime), 'MMM d, yyyy h:mm a')}
        </div>
      )}
      {lastChange && (
        <div className="text-sm">
          <span className="font-medium">Last Modified:</span>{' '}
          {format(fromUnixTime(lastChange), 'MMM d, yyyy h:mm a')}
        </div>
      )}
    </div>
  );
};

const CourseNavigation = ({
  courseTitle,
  normalizedSchedule,
  findScheduleItem,
  onItemSelect,
  typeColors: customTypeColors,
  studentCourseData,
  courseData,
  previewMode,
  isInitialSchedule = false,
}) => {
  useEffect(() => {
    console.group('%c[CourseNavigation] Rendering with data:', 'color: #06b6d4; font-weight: bold;');
    console.log('normalizedSchedule:', normalizedSchedule);
    console.log('Student Course Data:', studentCourseData);
    console.log('Is Initial Schedule:', isInitialSchedule);
    console.groupEnd();
  }, [normalizedSchedule, studentCourseData, isInitialSchedule]);

  const renderItem = (item, unitIdx, itemIdx) => {
    // Safety check for item
    if (!item || !item.title || item.type === 'info' && item.title === 'Schedule Created') {
      return null;
    }

    const scheduleItem = findScheduleItem?.(item);
    const isCurrentScheduled = normalizedSchedule?.scheduleAdherence && 
                               item.globalIndex === normalizedSchedule.scheduleAdherence.currentScheduledIndex;
    const isCurrentProgress = normalizedSchedule?.scheduleAdherence && 
                              item.globalIndex === (normalizedSchedule.scheduleAdherence.currentCompletedIndex + 1);
    const isCompleted = item.assessmentData !== undefined;
    const sanitizedTitle = { __html: sanitizeHTML(item.title) };
    
    const hasScore = item.assessmentData?.scorePercent !== undefined;
    const startTime = item.assessmentData?.startTime;
    const lastChange = item.assessmentData?.lastChange;

    const getScoreDisplay = () => {
      if (hasScore) {
        const scorePercent = parseFloat(item.assessmentData.scorePercent);
        return {
          label: `${scorePercent.toFixed(1)}%`,
          className: 'bg-blue-100 text-blue-800',
        };
      }
      
      // For initial schedule, show a special indicator for the first item
      if (isInitialSchedule && item.globalIndex === 0) {
        return {
          label: 'Start Here',
          className: 'bg-blue-200 text-blue-900 font-medium',
        };
      }
      
      return {
        label: item.type || 'unknown',
        className: typeColors[item.type] || 'bg-gray-100 text-gray-800',
      };
    };

    const scoreDisplay = getScoreDisplay();

    const getCardBorderClass = () => {
      if (isInitialSchedule && item.globalIndex === 0) {
        return 'border-blue-500 border-2 bg-blue-50';
      }
      if (isCurrentProgress) return 'border-purple-500 border-2 bg-purple-50';
      if (isCurrentScheduled) return 'border-green-500 border-2 bg-green-50';
      return '';
    };

    return (
      <Card
        key={`${unitIdx}-${itemIdx}-${item.sequence || itemIdx}`}
        className={`mb-2 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer
          ${getCardBorderClass()}
          ${isCompleted ? 'bg-gray-50' : ''}`}
        onClick={() => onItemSelect(unitIdx, itemIdx)}
      >
        <CardContent className="p-3">
          <div className="flex justify-between items-start">
            <div className="flex-grow flex items-start gap-2">
              {isInitialSchedule && item.globalIndex === 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <PlayCircle className="text-blue-600 mt-1" size={16} />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Start your course here</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {isCurrentProgress && !isInitialSchedule && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <PlayCircle className="text-purple-600 mt-1" size={16} />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Current Progress Position</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {isCurrentScheduled && !isInitialSchedule && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Target className="text-green-600 mt-1" size={16} />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Scheduled Position</p>
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
                <div className="flex flex-wrap gap-2 ml-2">
                  {item.date && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <CalendarDays size={12} />
                      <span>Due: {format(parseISO(item.date), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                  {(startTime || lastChange) && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-1 text-xs text-gray-500">
                          <ClockIcon size={12} />
                          <span>
                            Modified:{' '}
                            {lastChange ? format(fromUnixTime(lastChange), 'MMM d') : 'Not yet'}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <TimeDetails startTime={startTime} lastChange={lastChange} />
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </div>
            <Badge className={`${scoreDisplay.className} text-xs ml-2 shrink-0`}>
              {scoreDisplay.label}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

  const sectionedUnits = useMemo(() => {
    if (!normalizedSchedule?.units) return {};
    
    const filteredUnits = normalizedSchedule.units.filter(unit => unit && Array.isArray(unit.items));
    return filteredUnits.reduce((acc, unit) => {
      if (!unit || unit.name === 'Schedule Information') return acc;
      const section = unit.section || "1";
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(unit);
      return acc;
    }, {});
  }, [normalizedSchedule]);

  const scheduleAdherence = normalizedSchedule?.scheduleAdherence;

  // Find both current and scheduled units
  const currentProgressUnit = useMemo(() => {
    if (isInitialSchedule && normalizedSchedule?.units && normalizedSchedule.units.length > 0) {
      // For initial schedule, just return the first unit
      return normalizedSchedule.units[0];
    }
    
    if (!scheduleAdherence?.currentCompletedIndex || !normalizedSchedule?.units) return null;
    return normalizedSchedule.units.find(unit =>
      unit && unit.items && unit.items.some(item => 
        item && item.globalIndex === (scheduleAdherence.currentCompletedIndex + 1)
      )
    );
  }, [normalizedSchedule, scheduleAdherence, isInitialSchedule]);

  // Get start and end dates from normalized schedule
  const getScheduleDates = () => {
    if (!normalizedSchedule?.units || previewMode) return null;
    
    // Find the earliest and latest dates in the schedule
    const allDates = normalizedSchedule.units
      .flatMap(unit => unit.items || [])
      .filter(item => item && item.date)
      .map(item => new Date(item.date));
    
    if (allDates.length === 0) return null;
    
    const startDate = new Date(Math.min(...allDates));
    const endDate = new Date(Math.max(...allDates));
    
    return {
      startDate: format(startDate, 'MMM d'),
      endDate: format(endDate, 'MMM d, yyyy')
    };
  };

  const scheduleDates = getScheduleDates();

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="font-semibold text-xl text-gray-800 mb-2">{courseTitle}</h2>
        {scheduleDates && !previewMode && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              {scheduleDates.startDate} - {scheduleDates.endDate}
            </span>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 w-full">
        <div className="p-4">
          {isInitialSchedule && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="text-blue-600 h-5 w-5 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-800 mb-1">Welcome to Your Course</h3>
                  <p className="text-sm text-blue-700">
                    Start with your first lesson to begin tracking your progress through the course.
                  </p>
                </div>
              </div>
            </div>
          )}
        
          {normalizedSchedule && !previewMode && studentCourseData && !isInitialSchedule && (
            <div className="mb-6">
              <ProgressSection
                totalAssignments={courseData?.NumberGradeBookAssignments}
                lastStartedIndex={scheduleAdherence?.lastStartedIndex}
                lessonsBehind={scheduleAdherence?.lessonsOffset}
                isOnTrack={!scheduleAdherence?.isBehind}
                status={studentCourseData?.Status?.Value}
                autoStatus={studentCourseData?.autoStatus}
                currentMark={normalizedSchedule.marks?.overall?.withZeros 
                  ? Math.round(normalizedSchedule.marks.overall.withZeros) 
                  : 0}
                statusLog={studentCourseData?.statusLog}
              />
            </div>
          )}

          {Object.entries(sectionedUnits)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([sectionNumber, sectionUnits]) => (
              <div key={sectionNumber} className="mb-8">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg mb-4">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">
                    Section {sectionNumber}
                  </h3>
                </div>

                <Accordion
                  type="single"
                  collapsible
                  className="space-y-4"
                  defaultValue={currentProgressUnit ? `unit-${currentProgressUnit.sequence}` : undefined}
                >
                  {sectionUnits.map((unit) => {
                    if (!unit || !unit.sequence) return null;
                    
                    const isCurrentUnit = currentProgressUnit?.sequence === unit.sequence;
                    
                    // Find the correct index for this unit
                    const unitIndex = normalizedSchedule.units.findIndex(u => 
                      u && u.sequence === unit.sequence
                    );
                    
                    return (
                      <AccordionItem
                        key={`unit-${unit.sequence}`}
                        value={`unit-${unit.sequence}`}
                        className={
                          isCurrentUnit ? 'border-purple-200 bg-purple-50 rounded-lg' : ''
                        }
                      >
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-gray-700 font-medium
                                ${isCurrentUnit ? 'bg-purple-100' : 'bg-gray-100'}`}
                            >
                              {unit.sequence}
                            </div>
                            <span
                              className={`font-semibold ${
                                isCurrentUnit ? 'text-purple-800' : 'text-gray-900'
                              }`}
                            >
                              {unit.name || `Unit ${unit.sequence}`}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4">
                          <div className="space-y-2">
                            {unit.items?.map((item, itemIdx) => {
                              if (!item) return null;
                              return renderItem(item, unitIndex, itemIdx);
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CourseNavigation;