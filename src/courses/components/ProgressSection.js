import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Info 
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';

const ProgressSection = ({ 
  totalAssignments, 
  lastStartedIndex, 
  lessonsBehind, 
  isOnTrack, 
  status, 
  autoStatus,
  currentMark,
  statusLog
}) => {
  const progressPercentage = Math.round(((lastStartedIndex + 1) / totalAssignments) * 100) || 0;
  const isAhead = lessonsBehind < 0;
  const lessonDifference = Math.abs(lessonsBehind);

  // Convert statusLog object to array and sort by timestamp
  const logEntries = Object.entries(statusLog || {}).map(([id, entry]) => ({id, ...entry}));
  logEntries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const latestLog = logEntries[logEntries.length - 1];

  // Data for circular progress
  const progressData = [
    { name: 'progress', value: progressPercentage },
    { name: 'remaining', value: 100 - progressPercentage }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Course Progress Card */}
        <div className="bg-white rounded-lg p-6 border">
          <h3 className="text-sm font-semibold mb-4">Course Progress</h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">
                Lesson {lastStartedIndex + 1} of {totalAssignments}
              </div>
            </div>
            <div className="w-24 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={progressData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={35}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                  >
                    <Cell fill="#3b82f6" /> {/* Progress color */}
                    <Cell fill="#e5e7eb" /> {/* Remaining color */}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm font-semibold">Current Mark</span>
            <div className="text-xl font-bold text-blue-600">
              {currentMark}%
            </div>
          </div>
        </div>

        {/* Schedule Status Card */}
        <div className="bg-white rounded-lg p-6 border">
          <h3 className="text-sm font-semibold mb-4">Schedule Status</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {isAhead ? (
                <div className="flex items-center text-green-600">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  <span className="font-semibold">{lessonDifference} lessons ahead</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <TrendingDown className="h-5 w-5 mr-2" />
                  <span className="font-semibold">{lessonDifference} lessons behind</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isOnTrack ? (
                <Badge variant="outline" className="bg-green-50 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  On Track
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-yellow-50 border-yellow-200">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Needs Attention
                </Badge>
              )}
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 text-sm text-gray-600 cursor-help">
                    <Info className="h-4 w-4" />
                    Status: {latestLog?.status || status || 'No status available'}
                    <Badge variant="outline" className="ml-2">
                      {autoStatus ? 'Auto' : 'Manual'}
                    </Badge>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">
                    {autoStatus 
                      ? 'Status is automatically calculated based on course progress'
                      : 'Status is manually set by instructor'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* History Button & Dialog */}
          {logEntries.length > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="mt-4">View History</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md w-full">
                <DialogHeader>
                  <DialogTitle>Schedule Status History</DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                  {logEntries.map(entry => (
                    <div key={entry.id} className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium">{entry.status}</p>
                      <p className="text-xs text-gray-500">
                        Timestamp: {new Date(entry.timestamp).toLocaleString()}
                      </p>
                      {entry.updatedBy && (
                        <p className="text-sm text-gray-700">
                          Updated By: {typeof entry.updatedBy === 'string' ? entry.updatedBy : entry.updatedBy.name || 'Unknown'}
                        </p>
                      )}
                      <p className="text-sm text-gray-700">Previous Status: {entry.previousStatus}</p>
                      <p className="text-sm text-gray-700">Lessons Behind: {entry.lessonsBehind}</p>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressSection;
