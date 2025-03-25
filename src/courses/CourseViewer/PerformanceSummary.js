import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { BarChart2 } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../../components/ui/sheet';
import ProgressSection from '../components/ProgressSection';

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

const CustomDot = (props) => {
  const { cx, cy, payload } = props;
  
  // Only draw the vertical line for zeros
  if (payload.score === 0) {
    return (
      <line
        x1={cx}
        y1={cy}
        x2={cx}
        y2={240}
        stroke="#ef4444"
        strokeWidth={2}
        strokeDasharray="4 4"
      />
    );
  }

  // For non-zero scores, render nothing (let the default dot handle it)
  return null;
};

const ScoreTrends = ({ scores }) => {
  if (!scores?.length) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold mb-4">Score Trends</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={scores}
            margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
          >
            <XAxis dataKey="name" hide={true} />
            <YAxis domain={[0, 100]} />
            <RechartsTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-2 border rounded-lg shadow-sm">
                      <p className="font-medium">{payload[0].payload.name}</p>
                      <p className="text-sm text-gray-600">
                        Score: {payload[0].payload.score === 0 ? "Not Complete" : `${payload[0].payload.score}%`}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Main line with dots for non-zero scores */}
            <Line 
              type="monotone" 
              dataKey="displayScore"
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{
                r: 4,
                fill: "#3b82f6",
                stroke: "white",
                strokeWidth: 2
              }}
              connectNulls={true}
            />
            {/* Additional line just for zero scores */}
            <Line 
              dataKey="zeroScore"
              stroke="none"
              dot={{
                r: 4,
                fill: "#ef4444",
                stroke: "white",
                strokeWidth: 2
              }}
            />
            {/* Custom vertical lines */}
            <Line 
              dataKey="displayScore"
              stroke="none"
              dot={CustomDot}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const PerformanceInsights = ({ categoryData }) => {
  return (
    <Alert>
      <AlertDescription>
        <div className="space-y-2">
          {categoryData.map(cat => cat.percentage >= 80 && (
            <Badge key={cat.name} variant="outline" className="bg-green-50">
              Strong performance in {cat.name}: {cat.percentage}%
            </Badge>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  );
};

const PerformanceContent = ({ studentCourseData, courseData }) => { 
  const lastStartedIndex = studentCourseData?.jsonGradebookSchedule?.adherenceMetrics?.lastStartedIndex;
  
  const scores = studentCourseData?.jsonGradebookSchedule?.units
    ?.flatMap(unit => unit.items)
    .slice(0, lastStartedIndex + 1)
    .map((item, index) => {
      const score = item.gradebookData?.grade?.percentage || 0;
      return {
        name: item.title,
        score: score,
        // For the main line chart (only non-zero scores)
        displayScore: score > 0 ? score : null,
        // For showing zero score dots
        zeroScore: score === 0 ? 0 : null,
        index
      };
    }) || [];
 
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
      <ProgressSection
        totalAssignments={courseData?.NumberGradeBookAssignments}
        lastStartedIndex={lastStartedIndex}
        lessonsBehind={studentCourseData?.jsonGradebookSchedule?.adherenceMetrics?.lessonsBehind}
        isOnTrack={studentCourseData?.jsonGradebookSchedule?.adherenceMetrics?.isOnTrack}
        status={studentCourseData?.Status?.Value}
        autoStatus={studentCourseData?.autoStatus}
        currentMark={currentMark}
        statusLog={studentCourseData?.statusLog}
      />

      <GradeDistribution categoryData={categoryData} />
      <ScoreTrends scores={scores} />
      <PerformanceInsights categoryData={categoryData} />
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