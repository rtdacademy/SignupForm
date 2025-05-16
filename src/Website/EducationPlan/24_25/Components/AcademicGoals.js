import React from 'react';
import { Card } from "../../../../components/ui/card";
import { CheckCircle, Circle, Target } from "lucide-react";

const AcademicGoals = () => {
  // Sample data - clearly marked
  const sampleGoals = {
    shortTerm: [
      { goal: "Maintain a GPA of 3.5 or higher", completed: true },
      { goal: "Complete Math 30-1 with 80%+", completed: false },
      { goal: "Submit all assignments on time", completed: true },
      { goal: "Join the Math Club", completed: true }
    ],
    longTerm: [
      { goal: "Graduate with honors (Sample)", status: "In Progress" },
      { goal: "Complete all university prerequisites", status: "On Track" },
      { goal: "Achieve 90%+ in core STEM subjects", status: "Working Toward" }
    ]
  };

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Academic Goals</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Short-term Goals (Sample)
          </h3>
          <ul className="space-y-3">
            {sampleGoals.shortTerm.map((goal, index) => (
              <li key={index} className="flex items-start gap-2">
                {goal.completed ? 
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /> : 
                  <Circle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                }
                <span className={goal.completed ? 'line-through text-gray-500' : ''}>
                  {goal.goal}
                </span>
              </li>
            ))}
          </ul>
        </Card>
        
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Long-term Goals (Sample)
          </h3>
          <ul className="space-y-3">
            {sampleGoals.longTerm.map((goal, index) => (
              <li key={index} className="space-y-1">
                <div className="font-medium">{goal.goal}</div>
                <div className="text-sm text-gray-600">Status: {goal.status}</div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  );
};

export default AcademicGoals;