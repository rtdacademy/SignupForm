import React from 'react';
import { Card } from "../../../../components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const StakeholderEngagement = () => {
  // Student satisfaction data from surveys
  const satisfactionData = [
    { category: "Very Satisfied", students: 69, parents: 40 },
    { category: "Satisfied", students: 36, parents: 21 },
    { category: "Neutral", students: 9, parents: 5 },
    { category: "Dissatisfied", students: 2, parents: 1 },
    { category: "Very Dissatisfied", students: 1, parents: 0 }
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Stakeholder Engagement</h3>
        
        {/* Overview Section */}
        <div className="mb-8 bg-blue-50 p-6 rounded-lg">
          <h4 className="text-lg font-medium text-blue-900 mb-3">Engagement Overview</h4>
          <div className="prose max-w-none text-gray-600 space-y-4">
  <p>
    In 2023-24, RTD Academy managed 1,294 individual course enrollments through our 
    asynchronous learning environment. Our stakeholder engagement focused on maintaining 
    strong connections with students, parents, and partner schools through comprehensive 
    communication and support systems.
  </p>
  <p>
    Survey results from 186 respondents (118 students and 68 parents) demonstrate high 
    satisfaction with our programs and communication methods, with 89% of students and 90% 
    of parents reporting being satisfied or very satisfied with their experience.
  </p>
</div>
        </div>

        {/* Key Stakeholder Groups */}
        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Engagement Initiatives</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Student Support</h5>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Individual course progress monitoring</li>
                  <li>• End-of-course satisfaction surveys</li>
                  <li>• Interactive learning platform access</li>
                  <li>• Direct teacher communication channels</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Parent Involvement</h5>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Weekly progress updates via email</li>
                  <li>• Parent portal access for monitoring</li>
                  <li>• Course orientation meetings</li>
                  <li>• Regular communication channels</li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Partner Schools</h5>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Biweekly student progress updates</li>
                  <li>• Course alignment discussions</li>
                  <li>• Regular feedback collection</li>
                  <li>• Resource sharing initiatives</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Survey Highlights</h5>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Platform Navigation: 8.53/10</li>
                  <li>• Course Material Quality: 8.49/10</li>
                  <li>• Instructor Support: 8.36/10</li>
                  <li>• Progress Monitoring: 8.62/10</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Satisfaction Metrics */}
        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Stakeholder Satisfaction</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={satisfactionData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" name="Students" fill="#60a5fa" />
                <Bar dataKey="parents" name="Parents" fill="#34d399" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Future Initiatives */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Communication Enhancement</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="text-sm font-medium text-gray-500 mb-2">Current Systems</h5>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Custom communication software</li>
                <li>• Edge Learning Management System</li>
                <li>• Weekly automated updates</li>
                <li>• Direct messaging capabilities</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
  <h5 className="text-sm font-medium text-gray-500 mb-2">Planned Improvements</h5>
  <p className="text-sm text-gray-600">
    Development is underway for several key system enhancements: AI-enhanced support systems 
    for immediate student assistance, an improved student management portal for better course 
    engagement, a comprehensive parent portal for detailed progress monitoring, and a 
    dedicated partner school portal to streamline information sharing and collaboration. 
    These improvements will enhance our ability to provide personalized support while 
    maintaining our commitment to quality education delivery.
  </p>
</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StakeholderEngagement;