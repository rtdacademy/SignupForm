import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../components/ui/collapsible";
import { ChevronDown, ChevronUp, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const statusColors = {
  'Submitted': 'bg-green-100 text-green-800',
  'In Progress': 'bg-yellow-100 text-yellow-800',
  'Unknown': 'bg-gray-100 text-gray-800'
};

const GradeStatusBadge = ({ status }) => (
  <Badge variant="outline" className={`${statusColors[status] || statusColors.Unknown} text-xs`}>
    {status}
  </Badge>
);

const AssignmentRow = ({ assignment }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const icon = useMemo(() => {
    switch (assignment.grade.status) {
      case 'Submitted':
        return <CheckCircle2 className="text-green-500" size={16} />;
      case 'In Progress':
        return <Clock className="text-yellow-500" size={16} />;
      default:
        return <AlertCircle className="text-gray-400" size={16} />;
    }
  }, [assignment.grade.status]);

  const percentage = assignment.grade.percentage || 0;
  const timeSpentMinutes = Math.round((assignment.grade.timeSpent || 0) / 60);
  const score = assignment.grade.score || 0;

  return (
    <Card className="mb-2">
      <Collapsible>
        <CollapsibleTrigger 
          className="w-full cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 flex-1">
                {icon}
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{assignment.name}</h4>
                  <p className="text-xs text-gray-500">
                    Score: {score} / {assignment.pointsPossible} 
                    {percentage > 0 && ` (${percentage.toFixed(1)}%)`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <GradeStatusBadge status={assignment.grade.status} />
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-4">
            <div className="pt-4 border-t mt-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Time Spent</p>
                  <p className="font-medium">{timeSpentMinutes} minutes</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Submission Status</p>
                  <p className="font-medium">{assignment.started ? 'Started' : 'Not Started'}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Manual Grading</p>
                  <p className="font-medium">
                    {assignment.grade.requiresManualGrading ? 'Required' : 'Not Required'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Type</p>
                  <p className="font-medium capitalize">{assignment.type}</p>
                </div>
              </div>

              {assignment.grade.hasFeedback && (
                <div className="mt-4">
                  <Badge variant="secondary" className="text-xs">
                    Feedback Available
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

const GradebookDisplay = ({ jsonGradebook }) => {
  const { assignments = [], totals = {} } = jsonGradebook?.gradebook || {};

  const overallGrade = useMemo(() => ({
    percentage: totals.percentage?.toFixed(1) || '0.0',
    points: `${totals.earnedPoints?.toFixed(1) || '0'} / ${totals.totalPoints || '0'}`
  }), [totals]);

  // Group assignments by unit (based on naming convention)
  const groupedAssignments = useMemo(() => {
    const groups = {};
    
    assignments.forEach(assignment => {
      // Extract unit number from assignment name (e.g., "1.1", "2.3", etc.)
      const unitMatch = assignment.name.match(/^(\d+)\./);
      const unitNumber = unitMatch ? unitMatch[1] : 'Other';
      const unitName = `Unit ${unitNumber}`;
      
      if (!groups[unitName]) {
        groups[unitName] = [];
      }
      groups[unitName].push(assignment);
    });
    
    // Sort assignments within each unit
    Object.keys(groups).forEach(unitName => {
      groups[unitName].sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        return aName.localeCompare(bName, undefined, { numeric: true });
      });
    });
    
    return groups;
  }, [assignments]);

  if (!jsonGradebook?.gradebook) {
    return (
      <div className="p-4 text-center text-gray-500">
        No gradebook data available
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Overall Grade</span>
            <span className="text-2xl">{overallGrade.percentage}%</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress 
            value={Number(overallGrade.percentage)} 
            className="h-2"
          />
          <p className="text-sm text-gray-500 mt-2">
            Total Points: {overallGrade.points}
          </p>
        </CardContent>
      </Card>

      {Object.entries(groupedAssignments).sort().map(([unitName, unitAssignments]) => (
        <div key={unitName} className="mb-8">
          <h3 className="text-lg font-semibold mb-4">{unitName}</h3>
          {unitAssignments.map((assignment) => (
            <AssignmentRow
              key={assignment.assessmentId}
              assignment={assignment}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default GradebookDisplay;