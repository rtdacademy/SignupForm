import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { 
  Calendar,
  Clock,
  BookOpen,
  GraduationCap,
  BarChart,
  AlertTriangle,
  CheckCircle2,
  SplitSquareVertical,
  ListChecks,
  CalendarDays
} from 'lucide-react';
import ScheduleDisplay from './ScheduleDisplay';
import GradebookDisplay from './GradebookDisplay';
import SchedCombined from './schedCombined';

import { format, parseISO, differenceInDays, differenceInBusinessDays } from 'date-fns';

const YourWayProgress = ({ course, className = '' }) => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [progressStats, setProgressStats] = useState({
    daysElapsed: 0,
    daysRemaining: 0,
    completedItems: 0,
    totalItems: 0,
    isOnTrack: true
  });

  const hasScheduleJSON = !!course?.ScheduleJSON;
  const hasGradebook = !!course?.jsonGradebook;
  const hasCombinedSchedule = !!course?.jsonGradebookSchedule;

  useEffect(() => {
    if (hasCombinedSchedule) {
      const schedule = course.jsonGradebookSchedule;
      const startDate = parseISO(schedule.startDate);
      const endDate = parseISO(schedule.endDate);
      const today = new Date();
      
      // Calculate total items and completed items from combined schedule
      const items = schedule.units.flatMap(unit => unit.items || []);
      const totalItems = items.length;
      const completedItems = items.filter(item => 
        item.completed || parseISO(item.date) < today
      ).length;

      // Calculate days
      const totalDays = differenceInBusinessDays(endDate, startDate);
      const elapsedDays = differenceInBusinessDays(today, startDate);
      const remainingDays = differenceInBusinessDays(endDate, today);

      // Calculate if on track
      const expectedProgress = (elapsedDays / totalDays) * 100;
      const actualProgress = (completedItems / totalItems) * 100;
      const isOnTrack = actualProgress >= expectedProgress - 10;

      setProgressStats({
        daysElapsed: Math.max(0, elapsedDays),
        daysRemaining: Math.max(0, remainingDays),
        completedItems,
        totalItems,
        isOnTrack
      });
    }
  }, [course?.jsonGradebookSchedule]);

  const renderTabs = () => {
    const tabs = [];
    
    // Overview tab only if we have combined schedule
    if (hasCombinedSchedule) {
      tabs.push(
        <TabsTrigger key="overview" value="overview">
          <BarChart className="h-4 w-4 mr-2" />
          Overview & Stats
        </TabsTrigger>
      );
    }

    // Show appropriate schedule tab based on available data
    if (hasCombinedSchedule) {
      tabs.push(
        <TabsTrigger key="schedule" value="schedule">
          <Calendar className="h-4 w-4 mr-2" />
          Schedule & Progress
        </TabsTrigger>
      );
    } else {
      if (hasScheduleJSON) {
        tabs.push(
          <TabsTrigger key="schedule" value="schedule">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </TabsTrigger>
        );
      }
      if (hasGradebook) {
        tabs.push(
          <TabsTrigger key="gradebook" value="gradebook">
            <ListChecks className="h-4 w-4 mr-2" />
            Gradebook
          </TabsTrigger>
        );
      }
    }

 

    return tabs;
  };

  const renderContent = () => {
    if (!hasScheduleJSON && !hasGradebook && !hasCombinedSchedule) {
      return (
        <div className="p-4 text-center text-gray-500">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No schedule or gradebook data available yet. Use the Schedule Maker to get started.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return (
      <Tabs 
        defaultValue={hasCombinedSchedule ? "overview" : (hasScheduleJSON ? "schedule" : "gradebook")} 
        className="w-full" 
        onValueChange={setSelectedTab}
      >
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${renderTabs().length}, 1fr)` }}>
          {renderTabs()}
        </TabsList>

        {hasCombinedSchedule && (
          <TabsContent value="overview" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  Course Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Overall Progress</span>
                    <span>{Math.round((progressStats.completedItems / progressStats.totalItems) * 100)}%</span>
                  </div>
                  <Progress value={(progressStats.completedItems / progressStats.totalItems) * 100} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">Days Elapsed</p>
                          <p className="text-2xl font-bold">{progressStats.daysElapsed}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-purple-500" />
                        <div>
                          <p className="text-sm font-medium">Days Remaining</p>
                          <p className="text-2xl font-bold">{progressStats.daysRemaining}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">Items Completed</p>
                          <p className="text-2xl font-bold">
                            {progressStats.completedItems}/{progressStats.totalItems}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Alert className={progressStats.isOnTrack ? "bg-green-50" : "bg-amber-50"}>
                  {progressStats.isOnTrack ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  )}
                  <AlertDescription className={progressStats.isOnTrack ? "text-green-700" : "text-amber-700"}>
                    {progressStats.isOnTrack
                      ? "You're on track with your schedule!"
                      : "You're falling a bit behind schedule. Consider reviewing your progress."}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Course Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p className="font-medium">
                        {format(parseISO(course.jsonGradebookSchedule.startDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">End Date</p>
                      <p className="font-medium">
                        {format(parseISO(course.jsonGradebookSchedule.endDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Course Title</p>
                    <p className="font-medium">{course?.Course?.Value || course?.jsonGradebookSchedule?.courseTitle}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="schedule">
          <ScrollArea className="h-[calc(100vh-300px)]">
            {hasCombinedSchedule ? (
              <SchedCombined scheduleJSON={course.jsonGradebookSchedule} />
            ) : (
              hasScheduleJSON && <ScheduleDisplay scheduleJSON={course.ScheduleJSON} />
            )}
          </ScrollArea>
        </TabsContent>

        {hasGradebook && !hasCombinedSchedule && (
          <TabsContent value="gradebook">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <GradebookDisplay gradebook={course.jsonGradebook} />
            </ScrollArea>
          </TabsContent>
        )}

      </Tabs>
    );
  };

  return (
    <div className={`w-full ${className}`}>
      {renderContent()}
    </div>
  );
};

export default YourWayProgress;