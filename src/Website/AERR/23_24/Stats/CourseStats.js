import React, { useState } from 'react';
import { Card } from "../../../../components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const CourseStats = () => {
  const [selectedView, setSelectedView] = useState('table');

  const courseData = [
    { CourseName: "CSE Project A", Completed: 10, Incomplete: 0, Registered: 10, Withdrawn: 0, "Completion Rate (%)": 100 },
    { CourseName: "Client-side Scripting 1", Completed: 98, Incomplete: 8, Registered: 106, Withdrawn: 0, "Completion Rate (%)": 92.45 },
    { CourseName: "Client-side Scripting 2", Completed: 5, Incomplete: 0, Registered: 5, Withdrawn: 0, "Completion Rate (%)": 100 },
    { CourseName: "Competencies in Math 15", Completed: 33, Incomplete: 14, Registered: 53, Withdrawn: 6, "Completion Rate (%)": 62.26 },
    { CourseName: "E-Learning & Learning Management Systems", Completed: 428, Incomplete: 0, Registered: 428, Withdrawn: 0, "Completion Rate (%)": 100 },
    { CourseName: "Mathematics 10-3", Completed: 12, Incomplete: 2, Registered: 15, Withdrawn: 1, "Completion Rate (%)": 80 },
    { CourseName: "Mathematics 10C", Completed: 80, Incomplete: 33, Registered: 121, Withdrawn: 8, "Completion Rate (%)": 66.12 },
    { CourseName: "Mathematics 20-1", Completed: 39, Incomplete: 25, Registered: 67, Withdrawn: 3, "Completion Rate (%)": 58.21 },
    { CourseName: "Mathematics 20-2", Completed: 43, Incomplete: 12, Registered: 61, Withdrawn: 6, "Completion Rate (%)": 70.49 },
    { CourseName: "Mathematics 20-3", Completed: 7, Incomplete: 3, Registered: 12, Withdrawn: 2, "Completion Rate (%)": 58.33 },
    { CourseName: "Mathematics 30-1", Completed: 103, Incomplete: 36, Registered: 154, Withdrawn: 15, "Completion Rate (%)": 66.88 },
    { CourseName: "Mathematics 30-2", Completed: 92, Incomplete: 9, Registered: 109, Withdrawn: 8, "Completion Rate (%)": 84.40 },
    { CourseName: "Mathematics 30-3", Completed: 1, Incomplete: 0, Registered: 3, Withdrawn: 2, "Completion Rate (%)": 33.33 },
    { CourseName: "Mathematics 31", Completed: 41, Incomplete: 17, Registered: 70, Withdrawn: 12, "Completion Rate (%)": 58.57 },
    { CourseName: "Object-oriented Programming 1", Completed: 1, Incomplete: 0, Registered: 1, Withdrawn: 0, "Completion Rate (%)": 100 },
    { CourseName: "Physics 30", Completed: 2, Incomplete: 0, Registered: 2, Withdrawn: 0, "Completion Rate (%)": 100 },
    { CourseName: "Procedural Programming 1", Completed: 1, Incomplete: 0, Registered: 1, Withdrawn: 0, "Completion Rate (%)": 100 },
    { CourseName: "Structured Programming 1", Completed: 4, Incomplete: 1, Registered: 72, Withdrawn: 67, "Completion Rate (%)": 5.56 },
    { CourseName: "Structured Programming 2", Completed: 4, Incomplete: 0, Registered: 4, Withdrawn: 0, "Completion Rate (%)": 100 }
  ];

  // Colors for the charts
  const COLORS = ['#4ade80', '#f87171', '#60a5fa', '#fbbf24'];

  // Calculate overall statistics
  const totalStats = courseData.reduce((acc, course) => ({
    completed: acc.completed + course.Completed,
    incomplete: acc.incomplete + course.Incomplete,
    registered: acc.registered + course.Registered,
    withdrawn: acc.withdrawn + course.Withdrawn
  }), { completed: 0, incomplete: 0, registered: 0, withdrawn: 0 });

  const overallCompletionRate = ((totalStats.completed / totalStats.registered) * 100).toFixed(1);

  // Prepare data for pie chart
  const pieChartData = [
    { name: 'Completed', value: totalStats.completed },
    { name: 'Incomplete', value: totalStats.incomplete },
    { name: 'Withdrawn', value: totalStats.withdrawn }
  ];

  return (
    <div className="space-y-6">

 {/* Analysis Commentary */}
 <Card className="p-6 bg-white">
        <h3 className="text-xl font-semibold mb-4">Course Performance Analysis</h3>
        <div className="prose max-w-none text-gray-600 space-y-4">
          <p>
            Our course data for 2023-24 reveals notable patterns in student success across different subject areas. 
            With 1,294 total enrollments and an overall completion rate of {overallCompletionRate}%, we've identified 
            both significant achievements and areas requiring focused attention.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Strengths</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Technology courses consistently show high completion rates (90-100%)</li>
                <li>Client-side Scripting 1 achieved 92.45% completion with 106 enrollments</li>
                <li>E-Learning & LMS course had 100% completion across 428 enrollments</li>
                <li>Mathematics 30-2 performing well at 84.40% completion</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Areas for Improvement</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Mathematics 20-1 and 20-3 showing completion rates below 60%</li>
                <li>Mathematics 10C at 66.12% completion needs attention</li>
                <li>Structured Programming 1 has concerning 5.56% completion rate</li>
                <li>Mathematics 31 showing 58.57% completion rate</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>



      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Registrations</h3>
          <p className="text-2xl font-bold">{totalStats.registered}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Completed</h3>
          <p className="text-2xl font-bold text-green-600">{totalStats.completed}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Overall Completion Rate</h3>
          <p className="text-2xl font-bold text-blue-600">{overallCompletionRate}%</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Withdrawn</h3>
          <p className="text-2xl font-bold text-red-600">{totalStats.withdrawn}</p>
        </Card>
      </div>

      {/* View Toggle */}
      <div className="flex space-x-2">
        <button
          onClick={() => setSelectedView('table')}
          className={`px-4 py-2 rounded ${
            selectedView === 'table'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Table View
        </button>
        <button
          onClick={() => setSelectedView('charts')}
          className={`px-4 py-2 rounded ${
            selectedView === 'charts'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Charts View
        </button>
      </div>

      {/* Table View */}
      {selectedView === 'table' && (
        <Card className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-4 text-left">Course Name</th>
                  <th className="p-4 text-right">Registered</th>
                  <th className="p-4 text-right">Completed</th>
                  <th className="p-4 text-right">Incomplete</th>
                  <th className="p-4 text-right">Withdrawn</th>
                  <th className="p-4 text-right">Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {courseData.map((course, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-4">{course.CourseName}</td>
                    <td className="p-4 text-right">{course.Registered}</td>
                    <td className="p-4 text-right text-green-600">{course.Completed}</td>
                    <td className="p-4 text-right text-yellow-600">{course.Incomplete}</td>
                    <td className="p-4 text-right text-red-600">{course.Withdrawn}</td>
                    <td className="p-4 text-right font-medium">{course["Completion Rate (%)"].toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Charts View */}
      {selectedView === 'charts' && (
        <div className="space-y-6">
          {/* Completion Rates Bar Chart */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Course Completion Rates</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={courseData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="CourseName"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="Completion Rate (%)"
                    fill="#60a5fa"
                    name="Completion Rate"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Overall Status Distribution Pie Chart */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Overall Course Status Distribution</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    outerRadius={130}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CourseStats;