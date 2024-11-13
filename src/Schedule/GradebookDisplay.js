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
  <Badge className={`${statusColors[status] || statusColors.Unknown} text-xs`}>
    {status}
  </Badge>
);

const CategorySummary = ({ category }) => (
  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
    <div className="flex justify-between items-center mb-2">
      <h3 className="font-semibold">{category.name}</h3>
      <Badge variant="outline" className="text-xs">
        Weight: {category.weight}%
      </Badge>
    </div>
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <p className="text-gray-600">Points: {category.earnedPoints} / {category.totalPoints}</p>
        <Progress value={category.percentage} className="mt-1" />
      </div>
      <div className="text-right">
        <p className="text-gray-600">Percentage</p>
        <p className="text-xl font-bold">{category.percentage?.toFixed(1)}%</p>
      </div>
    </div>
  </div>
);

const AssignmentItem = ({ assignment }) => {
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

  return (
    <Card className="mb-2">
      <CollapsibleTrigger
        onClick={() => setIsOpen(!isOpen)}
        className="w-full cursor-pointer"
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {icon}
              <div>
                <p className="font-medium text-sm">{assignment.name}</p>
                <p className="text-xs text-gray-500">
                  Points: {assignment.grade.score} / {assignment.pointsPossible}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <GradeStatusBadge status={assignment.grade.status} />
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
          
          <CollapsibleContent>
            <div className="mt-4 pt-4 border-t text-sm grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Percentage</p>
                <p className="font-semibold">{assignment.grade.percentage?.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-gray-600">Time Spent</p>
                <p className="font-semibold">
                  {Math.round((assignment.grade.timeSpent || 0) / 60)} minutes
                </p>
              </div>
              {assignment.grade.requiresManualGrading && (
                <div className="col-span-2">
                  <Badge variant="outline" className="text-xs">
                    Requires Manual Grading
                  </Badge>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </CardContent>
      </CollapsibleTrigger>
    </Card>
  );
};

const GradebookDisplay = ({ jsonGradebook }) => {
  const totalGrade = useMemo(() => {
    const totals = jsonGradebook.totals;
    return {
      percentage: totals.percentage?.toFixed(1),
      points: `${totals.earnedPoints?.toFixed(1)} / ${totals.totalPoints}`
    };
  }, [jsonGradebook.totals]);

  const categorizedAssignments = useMemo(() => {
    const categories = {};
    
    // Initialize categories
    jsonGradebook.categories.forEach(category => {
      categories[category.name] = {
        ...category,
        assignments: []
      };
    });
    
    // Sort assignments into categories
    jsonGradebook.assignments.forEach(assignment => {
      const categoryName = assignment.categoryId ? 
        jsonGradebook.categories.find(c => c.id === assignment.categoryId)?.name || 'Default' :
        'Default';
      
      if (categories[categoryName]) {
        categories[categoryName].assignments.push(assignment);
      }
    });

    return categories;
  }, [jsonGradebook]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Overall Grade</span>
            <span className="text-2xl">{totalGrade.percentage}%</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress 
            value={Number(totalGrade.percentage)} 
            className="h-2"
          />
          <p className="text-sm text-gray-500 mt-2">
            Total Points: {totalGrade.points}
          </p>
        </CardContent>
      </Card>

      {Object.entries(categorizedAssignments).map(([categoryName, category]) => (
        <Collapsible key={categoryName} className="mb-4">
          <CategorySummary category={category} />
          <CollapsibleContent>
            {category.assignments
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((assignment, index) => (
                <AssignmentItem 
                  key={assignment.assessmentId || index} 
                  assignment={assignment}
                />
              ))}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
};

export default GradebookDisplay;