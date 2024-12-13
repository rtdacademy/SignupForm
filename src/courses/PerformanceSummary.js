import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Star, 
  Clock, 
  BarChart2, 
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import ProgressSection from './components/ProgressSection';



const GradeDistribution = ({ categoryData }) => {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-4">Category Performance</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={categoryData}>
            <XAxis dataKey="name" />
            <YAxis />
            <RechartsTooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-2 border rounded-lg shadow-sm">
                      <p className="font-medium">{payload[0].payload.name}</p>
                      <p className="text-sm text-gray-600">Grade: {payload[0].value}%</p>
                      <p className="text-sm text-gray-600">Weight: {payload[0].payload.weight}%</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="percentage" fill="#3b82f6">
              {categoryData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={entry.percentage >= 80 ? '#22c55e' : 
                        entry.percentage >= 65 ? '#eab308' : '#ef4444'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const TimeInvestment = ({ timeStats }) => {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-2">Time Investment</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="font-medium">Average Time per Assignment</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {Math.round(timeStats.totalTimeSpent / (60 * timeStats.itemCount)) || 0} minutes
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 text-blue-600" />
            <span className="font-medium">Completed Items</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {timeStats.itemCount || 0}
          </p>
        </div>
      </div>
    </div>
  );
};

const ScoreTrends = ({ scores }) => {
  if (!scores?.length) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold mb-4">Score Trends</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={scores}>
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <RechartsTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-2 border rounded-lg shadow-sm">
                      <p className="font-medium">{payload[0].payload.name}</p>
                      <p className="text-sm text-gray-600">Score: {payload[0].value}%</p>
                      <p className="text-sm text-gray-600">Time Spent: {payload[0].payload.timeSpent} minutes</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const PerformanceInsights = ({ categoryData, timeStats }) => {
  return (
    <Alert>
      <AlertDescription>
        <div className="space-y-2">
          {categoryData.map(cat => cat.percentage >= 80 && (
            <Badge key={cat.name} variant="outline" className="bg-green-50">
              Strong performance in {cat.name}: {cat.percentage}%
            </Badge>
          ))}
          {timeStats.scores.length > 0 && (
            <Badge variant="outline" className="bg-blue-50">
              Average completion time: {Math.round(timeStats.totalTimeSpent / (60 * timeStats.itemCount))} minutes
            </Badge>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

const PerformanceContent = ({ studentCourseData, courseData }) => { 
  // Calculate time stats from completed items (same as before)
  const timeStats = studentCourseData?.jsonGradebookSchedule?.units
    ?.flatMap(unit => unit.items)
    .filter(item => item.gradebookData?.grade?.timeSpent > 0)
    .reduce((acc, item) => {
      const timeSpent = item.gradebookData.grade.timeSpent;
      const timeOnTask = item.gradebookData.grade.timeOnTask;
      const score = item.gradebookData.grade.percentage;

      return {
        totalTimeSpent: acc.totalTimeSpent + timeSpent,
        totalTimeOnTask: acc.totalTimeOnTask + timeOnTask,
        itemCount: acc.itemCount + 1,
        scores: [
          ...acc.scores,
          {
            name: item.title.substring(0, 20),
            score,
            timeSpent: Math.round(timeSpent / 60) // Convert to minutes
          }
        ]
      };
    }, { totalTimeSpent: 0, totalTimeOnTask: 0, itemCount: 0, scores: [] }) 
    || { totalTimeSpent: 0, totalTimeOnTask: 0, itemCount: 0, scores: [] };

 
  const categoryData = studentCourseData?.jsonGradebookSchedule?.categoryTotals
    ?.filter(cat => cat.totalPoints > 0)
    .map(cat => ({
      name: cat.name === 'Default' ? 'Homework' : cat.name,
      percentage: Math.round(cat.percentage),
      weight: cat.weight
    })) || [];

    const currentMark = Math.round(studentCourseData?.jsonGradebookSchedule?.overallTotals?.percentage ?? 0);

    return (
      <div className="space-y-8">
        {/* Progress Section */}
        <ProgressSection
          totalAssignments={courseData?.NumberGradeBookAssignments}
          lastStartedIndex={studentCourseData?.jsonGradebookSchedule?.adherenceMetrics?.lastStartedIndex}
          lessonsBehind={studentCourseData?.jsonGradebookSchedule?.adherenceMetrics?.lessonsBehind}
          isOnTrack={studentCourseData?.jsonGradebookSchedule?.adherenceMetrics?.isOnTrack}
          status={studentCourseData?.Status?.Value}
          autoStatus={studentCourseData?.autoStatus}
          currentMark={currentMark}
          statusLog={studentCourseData?.statusLog}
        />
  
        {/* Grade Distribution */}
        <GradeDistribution categoryData={categoryData} />
  
        {/* Time Investment */}
        <TimeInvestment timeStats={timeStats} />
  
        {/* Score Trends */}
        <ScoreTrends scores={timeStats.scores} />
  
        {/* Performance Insights */}
        <PerformanceInsights 
          categoryData={categoryData}
          timeStats={timeStats}
        />
      </div>
    );
  };

const PerformanceSummary = ({ studentCourseData, courseData }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <BarChart2 className="h-4 w-4" />
          Performance
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Performance Analytics</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <PerformanceContent 
            studentCourseData={studentCourseData}
            courseData={courseData} 
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PerformanceSummary;