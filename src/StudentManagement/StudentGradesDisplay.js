import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { getDatabase, ref, onValue, get } from 'firebase/database'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet'
import { Progress } from '../components/ui/progress'
import { ScrollArea } from '../components/ui/scroll-area'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import {
  Calendar,
  BookOpen,
  Clock as ClockIcon,
  PlayCircle,
  Target,
  CalendarDays,
  TrendingDown,
  TrendingUp,
  PieChart,
  History,
  RefreshCw,
  Info,
  Percent,
  BarChart,
  ZapIcon, 
  InfoIcon, 
  Bell,
  Split,
  FileText
} from 'lucide-react'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../components/ui/accordion'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip'
import { Button } from '../components/ui/button'
import { ALERT_LEVELS } from '../config/DropdownOptions'
import { format, fromUnixTime, formatDistanceToNow } from 'date-fns'
import NewFeatureDialog from './Dialog/NewFeatureDialog' 
import { useUserPreferences } from '../context/UserPreferencesContext' 

// Feature info configuration
const FEATURE_ID = 'unifiedProgressTracking';
const FEATURE_INFO = {
  title: 'New Schedule View',
  description: '',
  icon: ZapIcon,
  sections: [
    {
      title: 'All-in-One Progress View',
      icon: Target,
      content: 'This new view combines both the student\'s schedule and gradebook in one place, so you can now see grades and progress at a glance.'
    },
    {
      title: 'Schedule Tracking',
      icon: BookOpen,
      content: 'The system now automatically determines what lesson each student is on and compares it to where they should be based on their schedule.'
    },
    {
      title: 'Auto Status Suggestions',
      icon: ZapIcon,
      content: 'Based on this data, the system now generates status suggestions that you can review and apply with a single click on the student card.'
    },
    {
      title: 'Need the Old View?',
      icon: Split, // or SplitSquareHorizontal
      content: 'You can see the old layout by clicking the "View All" button in the top-right corner.'
    }
  ],
  note: `Note: This feature is currently available for courses with LTI integration, and we're working on expanding it to all courses.
Staff members should consider this feature to be in BETA and compare the auto status values to each student's actual gradebook.
Over time, our goal is to gain enough confidence to allow the system to automatically set these statuses in most cases.`
};

// New component for Last Activity Button
const LastActivityButton = ({ lastChange, onClick }) => {
  if (!lastChange) return null;
  
  const date = fromUnixTime(lastChange);
  const formattedDate = format(date, 'MMM d, yyyy h:mm a');
  const relativeTime = formatDistanceToNow(date, { addSuffix: true });
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center gap-1 h-7 px-2 text-blue-700 hover:bg-blue-50"
            onClick={onClick}
          >
            <History className="h-4 w-4" />
            <span className="text-sm font-medium">{relativeTime}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Last activity: {formattedDate}</p>
          <p className="text-xs text-gray-500 mt-1">Click to view full history</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// New component for Activity Log Sheet with iframe
const ActivityLogSheet = ({ isOpen, onOpenChange, courseId, lmsStudentId }) => {
  const actionLogUrl = `https://edge.rtdacademy.com/course/viewactionlog.php?cid=${courseId}&uid=${lmsStudentId}&from=gb`;
  
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[95%] sm:w-[800px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Student Activity Log
          </SheetTitle>
        </SheetHeader>
        <div className="h-[calc(100vh-80px)]">
          <iframe 
            src={actionLogUrl} 
            className="w-full h-full border-0" 
            title="Student Activity Log" 
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Helper styles for different item types
const typeColors = {
  lesson: 'bg-blue-100 text-blue-800',
  assignment: 'bg-green-100 text-green-800',
  exam: 'bg-red-100 text-red-800',
  info: 'bg-yellow-100 text-yellow-800',
}

const getTitleAccentColor = (type) => {
  switch (type) {
    case 'exam':
      return 'bg-red-50'
    case 'assignment':
      return 'bg-green-50'
    case 'lesson':
      return 'bg-blue-50'
    case 'info':
      return 'bg-yellow-50'
    default:
      return 'bg-gray-50'
  }
}

const TimeDetails = ({ startTime, lastChange }) => {
  if (!startTime && !lastChange) return null

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
  )
}

const CourseOverviewCard = ({
  courseData,
  studentCourseData,
  schedule,
  scheduleAdherence,
  normalizedSchedule,
  onRefresh,
  refreshing,
  onOpenActionLog,
}) => {
  const alertLevelKey = scheduleAdherence?.alertLevel?.toUpperCase()
  const alertLevel = ALERT_LEVELS[alertLevelKey] || ALERT_LEVELS.GREY
  const AlertIcon = alertLevel.icon

  const lastActiveDate = scheduleAdherence?.lastCompletedDate
    ? new Date(scheduleAdherence.lastCompletedDate)
    : null

  const lastUpdated = normalizedSchedule?.lastUpdated 
    ? new Date(normalizedSchedule.lastUpdated)
    : null

  const lastAssessmentImport = scheduleAdherence?.currentCompletedItem?.assessmentData?.importedAt
    ? new Date(scheduleAdherence.currentCompletedItem.assessmentData.importedAt)
    : null
    
  const lastActivity = scheduleAdherence?.currentCompletedItem?.assessmentData?.lastChange

  const progressPercentage = Math.round(
    (scheduleAdherence?.currentCompletedIndex /
      (normalizedSchedule?.totalItems || 1)) *
      100
  ) || 0
  
  const currentGrade = Math.round(normalizedSchedule?.marks?.overall?.omitMissing) || 0
  const gradeWithZeros = Math.round(normalizedSchedule?.marks?.overall?.withZeros) || 0
  
  const lessonsOffset = scheduleAdherence?.lessonsOffset || 0
  const isAhead = lessonsOffset > -1

  return (
    <Accordion type="single" collapsible className="mb-8 w-full">
      <AccordionItem value="overview" className="border-blue-200 bg-blue-50 rounded-lg shadow-md">
        <div className="px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-blue-900">
                {courseData?.Title || 'Untitled Course'}
              </h3>

              <div className="flex items-center ml-2">
        {/* Add the LastActivity button here */}
        {lastActivity && (
          <LastActivityButton 
            lastChange={lastActivity} 
            onClick={onOpenActionLog} 
          />
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={(e) => {
                  e.stopPropagation();
                  onRefresh();
                }}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh normalized schedule</p>
              {lastUpdated && (
                <p className="text-xs mt-1">
                  Last updated: {format(lastUpdated, 'MMM d, yyyy h:mm a')}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  </div>
            
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex items-center gap-1">
                  <PieChart className="w-4 h-4 text-blue-700" />
                  <span className="font-medium">{currentGrade}%</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Current grade (omitting missing)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex items-center gap-1">
                  <BarChart className="w-4 h-4 text-purple-700" />
                  <span className="font-medium">{gradeWithZeros}%</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Grade with zeros included</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex items-center gap-1">
                  <Percent className="w-4 h-4 text-green-700" />
                  <span className="font-medium">{progressPercentage}%</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Course completion percentage</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex items-center gap-1">
                  {isAhead ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={isAhead ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {Math.abs(lessonsOffset)} {Math.abs(lessonsOffset) === 1 ? 'lesson' : 'lessons'}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {isAhead ? 'Ahead of schedule' : 'Behind schedule'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <AccordionTrigger className="px-4 py-2 text-blue-900 hover:no-underline hover:bg-blue-100 group rounded-b-lg transition-all">
          <span className="text-sm font-medium">View detailed information</span>
        </AccordionTrigger>
        
        <AccordionContent className="px-4 py-3 bg-white border-t border-blue-100">
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-blue-800">Course Progress</span>
                <span className="font-medium text-blue-800">{progressPercentage}%</span>
              </div>
              <Progress
                value={progressPercentage}
                className="h-3 bg-blue-100"
                style={{
                  "--progress-background": "rgb(219 234 254)",
                  "--progress-foreground": `linear-gradient(90deg, rgba(37,99,235,1) 0%, rgba(79,70,229,1) 100%)`,
                }}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {schedule && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="w-4 h-4 text-blue-700" />
                  <span>
                    {format(new Date(schedule.startDate), 'MMM d')} -{' '}
                    {format(new Date(schedule.endDate), 'MMM d, yyyy')}
                  </span>
                </div>
              )}
              
              {lastActiveDate && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <History className="w-4 h-4 text-blue-700" />
                  <span>
                    Last active {formatDistanceToNow(lastActiveDate, { addSuffix: true })}
                  </span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">Schedule Adherence</h4>
             
                
                <div className="flex items-center gap-2 text-sm">
                  {isAhead ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={isAhead ? 'text-green-600' : 'text-red-600'}>
                    {isAhead ? 'Ahead by' : 'Behind by'} {Math.abs(lessonsOffset)} {Math.abs(lessonsOffset) === 1 ? 'lesson' : 'lessons'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">Data Updates</h4>
                {lastUpdated && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <RefreshCw className="w-4 h-4" />
                    <span>
                      Schedule updated{' '}
                      {formatDistanceToNow(lastUpdated, {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                )}
                
                {lastAssessmentImport && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Info className="w-4 h-4" />
                    <span>
                      Assessment imported{' '}
                      {formatDistanceToNow(lastAssessmentImport, {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Performance Details</h4>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm">
                    Current Grade: <span className="font-semibold">{currentGrade}%</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-sm">
                    With Zeros: <span className="font-semibold">{gradeWithZeros}%</span>
                  </span>
                </div>
                {normalizedSchedule?.marks?.exam && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm">
                      Exams: <span className="font-semibold">{Math.round(normalizedSchedule.marks.exam.average) || 0}%</span>
                    </span>
                  </div>
                )}
                {normalizedSchedule?.marks?.assignment && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">
                      Assignments: <span className="font-semibold">{Math.round(normalizedSchedule.marks.assignment.average) || 0}%</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

const GradesContent = ({
  loading,
  courseData,
  studentCourseData,
  normalizedSchedule,
  onRefresh,
  refreshing,
  onShowFeatureInfo,
  onOpenActionLog
}) => {
  // 1) If still loading, show spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading grades...</p>
        </div>
      </div>
    );
  }

  // 2) If no schedule yet, show a placeholder
  if (!normalizedSchedule) {
    return (
      <div className="p-4 text-center">
        <p className="mb-4">No normalized schedule found yet.</p>
        <Button 
          onClick={onRefresh} 
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Generate Schedule
        </Button>
      </div>
    );
  }

  // New feature info button
  const FeatureInfoButton = () => (
    <Button
      variant="ghost"
      size="sm"
      onClick={onShowFeatureInfo}
      className="absolute top-2 right-2 h-8 w-8 rounded-full p-0 text-blue-600 bg-blue-50 hover:bg-blue-100"
    >
      <InfoIcon className="h-4 w-4" />
    </Button>
  );

  // Now that we're sure normalizedSchedule exists:
  const scheduleAdherence = normalizedSchedule.scheduleAdherence || {};
  const schedule = studentCourseData?.jsonGradebookSchedule;

  const currentProgressUnit = useMemo(() => {
    if (!scheduleAdherence.currentCompletedIndex) return null
    return normalizedSchedule?.units?.find((unit) =>
      unit.items?.some(
        (item) =>
          item.globalIndex === scheduleAdherence.currentCompletedIndex + 1
      )
    )
  }, [normalizedSchedule, scheduleAdherence])

  const sectionedUnits = useMemo(() => {
    const filteredUnits = normalizedSchedule?.units || []
    return filteredUnits.reduce((acc, unit) => {
      if (unit.name === 'Schedule Information') return acc
      const section = unit.section || '1'
      if (!acc[section]) {
        acc[section] = []
      }
      acc[section].push(unit)
      return acc
    }, {})
  }, [normalizedSchedule])

  const findScheduleItem = (item) => {
    if (!schedule) return null
    const sortedItems = (normalizedSchedule.units || [])
      .flatMap((unit) => unit.items)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
    return sortedItems.find((schedItem) => schedItem.title === item.title)
  }

  const renderItem = (item, unitIdx, itemIdx) => {
    if (item.type === 'info' && item.title === 'Schedule Created') {
      return null
    }

    const scheduleItem = findScheduleItem(item)
    const isCurrentScheduled =
      item.globalIndex === scheduleAdherence.currentScheduledIndex
    const isCurrentProgress =
      item.globalIndex === scheduleAdherence.currentCompletedIndex
    const isCompleted =
      item.globalIndex <= scheduleAdherence.currentCompletedIndex

    const hasScore = item.assessmentData?.scorePercent !== undefined
    const startTime = item.assessmentData?.startTime
    const lastChange = item.assessmentData?.lastChange
    const gradebookData = scheduleItem?.gradebookData?.grade

    const getScoreDisplay = () => {
      if (hasScore) {
        const scorePercent = parseFloat(item.assessmentData.scorePercent)
        return {
          label: `${Math.round(scorePercent)}%`,
          className: 'bg-blue-100 text-blue-800',
        }
      }
      if (gradebookData?.percentage !== undefined) {
        return {
          label: `${Math.round(gradebookData.percentage)}%`,
          className: 'bg-blue-100 text-blue-800',
        }
      }
      return {
        label: item.type,
        className: typeColors[item.type] || 'bg-gray-100 text-gray-800',
      }
    }

    const scoreDisplay = getScoreDisplay()

    const getCardBorderClass = () => {
      if (isCurrentProgress) return 'border-purple-500 border-2 bg-purple-50'
      if (isCurrentScheduled) return 'border-green-500 border-2 bg-green-50'
      return ''
    }

    return (
      <Card
        key={`${unitIdx}-${itemIdx}-${item.sequence}`}
        className={`mb-2 shadow-sm hover:shadow-md transition-shadow duration-200
          ${getCardBorderClass()}
          ${isCompleted ? 'bg-gray-50' : ''}`}
      >
        <CardContent className="p-3">
          <div className="flex justify-between items-start">
            <div className="flex-grow flex items-start gap-2">
              {isCurrentProgress && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <PlayCircle className="text-purple-600 mt-1" size={16} />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Last Completed Item</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {isCurrentScheduled && (
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
                >
                  {item.title}
                </div>
                <div className="flex flex-wrap gap-2 ml-2">
                  {(item.date || findScheduleItem(item)?.date) && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <CalendarDays size={12} />
                      <span>
                        {format(
                          new Date(item.date || findScheduleItem(item)?.date),
                          'MMM d, yyyy'
                        )}
                      </span>
                    </div>
                  )}
                  {(startTime || lastChange) && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-1 text-xs text-gray-500">
                          <ClockIcon size={12} />
                          <span>
                            Modified:{' '}
                            {lastChange
                              ? format(fromUnixTime(lastChange), 'MMM d')
                              : 'Not yet'}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <TimeDetails
                            startTime={startTime}
                            lastChange={lastChange}
                          />
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </div>
            <Badge
              className={`${scoreDisplay.className} text-xs ml-2 shrink-0 hover:bg-transparent hover:text-inherit`}
            >
              {scoreDisplay.label}
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6 relative">
        {/* Add Feature Info Button near the top */}
        <FeatureInfoButton />
        
        <CourseOverviewCard
          courseData={courseData}
          studentCourseData={studentCourseData}
          schedule={schedule}
          scheduleAdherence={scheduleAdherence}
          normalizedSchedule={normalizedSchedule}
          onRefresh={onRefresh}
          refreshing={refreshing}
          onOpenActionLog={onOpenActionLog}
        />

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
                defaultValue={
                  currentProgressUnit
                    ? `unit-${currentProgressUnit.sequence}`
                    : undefined
                }
              >
                {sectionUnits.map((unit) => {
                  const isCurrentUnit =
                    currentProgressUnit?.sequence === unit.sequence
                  return (
                    <AccordionItem
                      key={unit.sequence}
                      value={`unit-${unit.sequence}`}
                      className={
                        isCurrentUnit
                          ? 'border-purple-200 bg-purple-50 rounded-lg'
                          : ''
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
                          <span className={`font-semibold ${isCurrentUnit ? 'text-purple-800' : 'text-gray-900'}`}>
                            {unit.name}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4">
                        <div className="space-y-2">
                          {unit.items?.map((item, itemIdx) =>
                            item && renderItem(item, unit.sequence - 1, itemIdx)
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            </div>
          ))}
      </div>
    </ScrollArea>
  )
}

const StudentGradesDisplay = ({
  studentKey,
  courseId,
  initialNormalizedSchedule = null,
  isOpen = false,
  onOpenChange,
  useSheet = true,
  className = '',
}) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [normalizedSchedule, setNormalizedSchedule] = useState(initialNormalizedSchedule);
  const [courseData, setCourseData] = useState(null);
  const [studentCourseData, setStudentCourseData] = useState(null);
  const [lmsStudentId, setLmsStudentId] = useState(null);
  
  // New state for feature info dialog and action log sheet
  const [showFeatureInfo, setShowFeatureInfo] = useState(false);
  const [actionLogOpen, setActionLogOpen] = useState(false);
  
  // Get user preferences
  const { preferences } = useUserPreferences();

  useEffect(() => {
    // Only show dialog if user hasn't seen it before
    const hasSeenFeature = preferences?.seenFeatures?.[FEATURE_ID];
    if (!hasSeenFeature) {
      setShowFeatureInfo(true);
    }
  }, [preferences]);

  useEffect(() => {
    if (!studentKey || !courseId) {
      console.warn('Missing required props: studentKey or courseId')
      setLoading(false)
      return
    }

    console.log('Setting up data listeners for', studentKey, courseId)
    
    const db = getDatabase()
    const studentCourseRef = ref(db, `students/${studentKey}/courses/${courseId}`)
    const normalizedScheduleRef = ref(db, `students/${studentKey}/courses/${courseId}/normalizedSchedule`)
    const courseRef = ref(db, `courses/${courseId}`)
    const lmsStudentIdRef = ref(db, `students/${studentKey}/courses/${courseId}/LMSStudentID`)

    const studentCourseUnsubscribe = onValue(studentCourseRef, (snapshot) => {
      if (snapshot.exists()) {
        const studentData = snapshot.val()
        console.log('Fetched student course data')
        setStudentCourseData(studentData)
      } else {
        console.log('No course data found for student')
      }
    })

    const courseUnsubscribe = onValue(courseRef, (snapshot) => {
      if (snapshot.exists()) {
        const courseInfo = snapshot.val()
        console.log('Fetched course info')
        setCourseData(courseInfo)
      } else {
        console.log('No course info found')
      }
    })

    const normalizedScheduleUnsubscribe = onValue(normalizedScheduleRef, (snapshot) => {
      setLoading(false)
      if (snapshot.exists()) {
        console.log('Fetched normalized schedule')
        const scheduleData = snapshot.val()
        setNormalizedSchedule(scheduleData)
      } else {
        console.log('No normalized schedule available')
        setNormalizedSchedule(null)
      }
    })
    
    // Fetch LMS Student ID
    const lmsStudentIdUnsubscribe = onValue(lmsStudentIdRef, (snapshot) => {
      if (snapshot.exists()) {
        console.log('Fetched LMS Student ID')
        setLmsStudentId(snapshot.val())
      } else {
        console.log('No LMS Student ID found')
      }
    })

    return () => {
      studentCourseUnsubscribe()
      courseUnsubscribe()
      normalizedScheduleUnsubscribe()
      lmsStudentIdUnsubscribe()
    }
  }, [studentKey, courseId])

  const handleRefresh = async () => {
    if (refreshing) return
    
    try {
      setRefreshing(true)
      // Make sure you're using the correct region
      const functions = getFunctions();
      // Explicitly set the region to match your function configuration
      const functionWithRegion = httpsCallable(functions, 'generateNormalizedScheduleV2');
      
      console.log(`Requesting normalized schedule update for ${studentKey}/${courseId}`)
      
      await functionWithRegion({
        studentKey,
        courseId,
        forceUpdate: true
      })
      
      console.log('Update request sent successfully')
    } catch (error) {
      // Improved error logging to see exactly what's happening
      console.error('Error requesting normalized schedule update:', error)
      if (error.details) {
        console.error('Error details:', error.details)
      }
    } finally {
      setRefreshing(false)
    }
  }
  
  // Handler for opening the action log
  const handleOpenActionLog = () => {
    if (!lmsStudentId) {
      console.error('LMS Student ID not available');
      return;
    }
    setActionLogOpen(true);
  };

  const content = (
    <>
      <GradesContent
        loading={loading}
        courseData={courseData}
        studentCourseData={studentCourseData}
        normalizedSchedule={normalizedSchedule}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onShowFeatureInfo={() => setShowFeatureInfo(true)}
        onOpenActionLog={handleOpenActionLog}
      />
      
      {/* Feature Info Dialog */}
      <NewFeatureDialog 
        isOpen={showFeatureInfo} 
        onOpenChange={setShowFeatureInfo}
        featureId={FEATURE_ID}
        {...FEATURE_INFO}
      />
      
      {/* Activity Log Sheet with iframe */}
      <ActivityLogSheet 
        isOpen={actionLogOpen}
        onOpenChange={setActionLogOpen}
        courseId={courseId}
        lmsStudentId={lmsStudentId}
      />
    </>
  )

    // Determine if we should show the NEW badge
    const shouldShowNewBadge = !preferences?.seenFeatures?.[FEATURE_ID];

    if (useSheet) {
      return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
          <SheetContent side="right" className="w-[90%] sm:w-[600px] p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="flex items-center">
                Student Grades
                {shouldShowNewBadge && (
                  <Badge className="ml-2 bg-blue-600 text-white text-xs py-0.5 px-1.5 rounded-full">
                    NEW
                  </Badge>
                )}
              </SheetTitle>
            </SheetHeader>
            <div className="h-[calc(100vh-80px)]">{content}</div>
          </SheetContent>
        </Sheet>
      );
    }

    return (
      <div className={`h-full relative ${className}`}>
        {/* "NEW" feature badge for non-sheet view */}
        {shouldShowNewBadge && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 z-10 h-8 px-2 py-0 bg-blue-600 text-white hover:bg-blue-700 rounded-full flex items-center"
                  onClick={() => setShowFeatureInfo(true)}
                >
                  <Bell className="h-3 w-3 mr-1" />
                  <span className="text-xs font-bold">NEW</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to learn about the new unified progress tracking</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {content}
      </div>
  )
}

export default StudentGradesDisplay