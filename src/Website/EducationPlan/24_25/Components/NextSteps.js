import React from 'react';
import { Card } from "../../../../components/ui/card";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

const NextSteps = () => {
  // Sample data - clearly marked
  const sampleNextSteps = {
    immediate: [
      { task: "Submit university applications", deadline: "December 15, 2024", priority: "high" },
      { task: "Register for SAT exam", deadline: "November 30, 2024", priority: "high" },
      { task: "Complete scholarship essays", deadline: "January 10, 2025", priority: "medium" }
    ],
    upcoming: [
      { task: "Schedule advisor meeting", deadline: "November 2024", status: "pending" },
      { task: "Attend university virtual tours", deadline: "December 2024", status: "scheduled" },
      { task: "Request recommendation letters", deadline: "January 2025", status: "not started" }
    ],
    reminders: [
      "Review and update academic goals quarterly",
      "Check scholarship deadlines monthly",
      "Update extracurricular activities log",
      "Meet with career counselor twice per semester"
    ]
  };

  const getPriorityIcon = (priority) => {
    if (priority === "high") return <AlertCircle className="h-5 w-5 text-red-500" />;
    if (priority === "medium") return <Clock className="h-5 w-5 text-yellow-500" />;
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      "pending": "bg-yellow-100 text-yellow-800",
      "scheduled": "bg-blue-100 text-blue-800",
      "not started": "bg-gray-100 text-gray-800"
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Next Steps</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Immediate Action Items (Sample)</h3>
          <ul className="space-y-3">
            {sampleNextSteps.immediate.map((step, index) => (
              <li key={index} className="flex items-start gap-2">
                {getPriorityIcon(step.priority)}
                <div className="flex-1">
                  <div>{step.task}</div>
                  <div className="text-sm text-gray-600">Due: {step.deadline}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
        
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Upcoming Tasks (Sample)</h3>
          <ul className="space-y-3">
            {sampleNextSteps.upcoming.map((task, index) => (
              <li key={index} className="flex justify-between items-start">
                <div>
                  <div>{task.task}</div>
                  <div className="text-sm text-gray-600">{task.deadline}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(task.status)}`}>
                  {task.status}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Regular Reminders (Sample)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sampleNextSteps.reminders.map((reminder, index) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">{reminder}</span>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
};

export default NextSteps;