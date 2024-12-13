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
} from 'recharts';

const PerformanceMetrics = () => {
  const [selectedView, setSelectedView] = useState('table');

  const mathCourseMarks = [
    { CourseName: "Competencies in Math 15", AverageMark: 82.91 },
    { CourseName: "Mathematics 10-3", AverageMark: 82.92 },
    { CourseName: "Mathematics 10C", AverageMark: 73.20 },
    { CourseName: "Mathematics 20-1", AverageMark: 81.44 },
    { CourseName: "Mathematics 20-2", AverageMark: 72.93 },
    { CourseName: "Mathematics 20-3", AverageMark: 79.86 },
    { CourseName: "Mathematics 30-1", AverageMark: 78.90 },
    { CourseName: "Mathematics 30-2", AverageMark: 78.60 },
    { CourseName: "Mathematics 30-3", AverageMark: 85.00 },
    { CourseName: "Mathematics 31", AverageMark: 85.02 }
  ];

  const successRates = [
    { threshold: "Above 50%", rate: 99.30 },
    { threshold: "Above 70%", rate: 88.84 },
    { threshold: "Above 90%", rate: 49.80 }
  ];

  const overallAverageMark = (mathCourseMarks.reduce((sum, course) => sum + course.AverageMark, 0) / mathCourseMarks.length).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Analysis Commentary */}
      <Card className="p-6 bg-white">
        <h3 className="text-xl font-semibold mb-4">Mathematics Performance Analysis</h3>
        <div className="prose max-w-none text-gray-600 space-y-4">
          <p>
            Analysis of our mathematics courses shows consistent achievement levels with an overall 
            average of {overallAverageMark}%. Notably, 99.30% of students are achieving passing grades, 
            with 88.84% achieving above 70%, indicating strong overall student success in mathematics.
          </p>
          
          <div className="mb-4">
            <h4 className="text-lg font-medium text-gray-900 mb-2">Diploma Examination Performance</h4>
            <p className="text-gray-600">
              Our diploma examination results, while showing improvement from previous years, indicate an area requiring focused attention. 
              The acceptable standard achievement rate of 60.9% in Math 30-1, though up from 50.0% last year, remains below the provincial 
              average of 81.5%. Similarly, our standard of excellence rate of 16.7%, while improved from 11.1%, trails the provincial average 
              of 22.6%. We are actively addressing this gap through structured interventions and course delivery modifications to better 
              prepare our students for diploma examinations while maintaining the integrity of our assessment practices.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Strengths</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Mathematics 31 and Math 30-3 leading with 85%+ averages</li>
                <li>Math 10-3 and Math 15 showing strong performance (~83%)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Focus Areas</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Mathematics 10C average (73.20%) needs attention</li>
                <li>Mathematics 20-2 showing lowest average (72.93%)</li>
                <li>-1 stream courses showing room for improvement</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Overall Math Average</h3>
          <p className="text-2xl font-bold text-blue-600">{overallAverageMark}%</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Highest Course Average</h3>
          <p className="text-2xl font-bold text-orange-600">85.02%</p>
        </Card>

        {/* Diploma Results Card */}
        <Card className="p-6 col-span-full bg-white">
          <h3 className="text-lg font-semibold mb-4">Diploma Examination Results</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Math 30-1 (68 writers)</h4>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-gray-600">Acceptable Standard</p>
                    <p className="text-xl font-bold text-blue-600">60.9%</p>
                    <p className="text-xs text-gray-500">vs Alberta: 81.5%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Standard of Excellence</p>
                    <p className="text-xl font-bold text-purple-600">16.7%</p>
                    <p className="text-xs text-gray-500">vs Alberta: 22.6%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t md:border-t-0 md:border-l md:pl-6 pt-4 md:pt-0">
              <p className="text-gray-600">
                While our diploma results show improvement from previous years (50.0% to 60.9% at acceptable standard), 
                we recognize the need for continued enhancement. We are implementing several initiatives:
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Introducing free "Rock the Diploma" preparation sessions</li>
                <li>• Restructuring course assessments to better align with diploma expectations</li>
                <li>• Increasing weight of supervised exam components</li>
                <li>• Providing additional practice with diploma-style questions throughout the course</li>
              </ul>
            </div>
          </div>
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
        <div className="space-y-6">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Mathematics Course Averages</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-4 text-left">Course Name</th>
                    <th className="p-4 text-right">Average Mark (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {mathCourseMarks.map((course, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-4">{course.CourseName}</td>
                      <td className="p-4 text-right font-medium">{course.AverageMark.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

    
        </div>
      )}

      {/* Charts View */}
      {selectedView === 'charts' && (
        <div className="space-y-6">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Mathematics Course Averages</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mathCourseMarks}
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
                  <YAxis
                    domain={[0, 100]}
                    label={{ value: 'Average Mark (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="AverageMark" fill="#60a5fa" name="Average Mark" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Success Rate Distribution</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={successRates}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="threshold" />
                  <YAxis
                    domain={[0, 100]}
                    label={{ value: 'Success Rate (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="rate" fill="#60a5fa" name="Success Rate" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PerformanceMetrics;