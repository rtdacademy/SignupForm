import React, { useState } from 'react';
import { Card } from '../../../../components/ui/card';
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

const SurveyAnalysis = () => {
  const [selectedView, setSelectedView] = useState('table');

  const studentRatings = [
    { metric: "Platform Navigation", score: 8.53 },
    { metric: "Online vs In-Person", score: 7.91 },
    { metric: "Course Material Quality", score: 8.49 },
    { metric: "Instructor Support", score: 8.36 },
    { metric: "Progress Monitoring", score: 8.62 },
    { metric: "Lesson Clarity", score: 8.54 },
    { metric: "Likelihood to Recommend", score: 8.54 }
  ];

  const satisfactionData = [
    { category: "Very Satisfied", students: 69, parents: 40 },
    { category: "Satisfied", students: 36, parents: 21 },
    { category: "Neutral", students: 9, parents: 5 },
    { category: "Dissatisfied", students: 2, parents: 1 },
    { category: "Very Dissatisfied", students: 1, parents: 0 }
  ];

  const courseDistribution = [
    { course: "Math 10C", count: 33 },
    { course: "Math 20-1", count: 25 },
    { course: "Math 30-1", count: 22 },
    { course: "Math 30-2", count: 20 },
    { course: "Math 20-2", count: 16 },
    { course: "Math 31", count: 10 },
    { course: "Coding", count: 9 }
  ];

  const engagementMetrics = [
    { category: "Workload Manageable", yes: 77.1, maybe: 16.9, no: 5.9 },
    { category: "Easy to Stay Focused", yes: 68.6, maybe: 17.8, no: 13.6 },
    { category: "Interest in Collaboration", yes: 25.4, maybe: 31.4, no: 43.2 }
  ];

  return (
    <div className="space-y-6">
      {/* Analysis Commentary */}
      <Card className="p-6 bg-white">
        <h3 className="text-xl font-semibold mb-4">Survey Results Analysis</h3>
        <div className="prose max-w-none text-gray-600 space-y-4">
          <p>
            Our survey results demonstrate that RTD Academy is fulfilling a vital need in Alberta's educational landscape. 
            The data shows exceptional satisfaction levels, with 89% of students and 90% of parents reporting being either satisfied 
            or very satisfied with their experience. This high satisfaction rate, combined with numerous positive comments, 
            validates our unique model of allowing students to begin and complete courses at any time throughout the year.

            The flexibility of our program appears to be meeting a significant gap in traditional education offerings. 
            Our diverse student body - including adult learners (26.3%), traditional high school students (69.5%), and 
            junior high students (4.2%) - demonstrates the broad appeal of our flexible learning model. Student achievement 
            rates are notably high, with 92.4% of students reporting they are meeting or mostly meeting their academic goals, 
            suggesting that our flexible approach effectively supports student success.
            
            Particularly noteworthy is the strong appreciation expressed for our asynchronous learning model. Students and 
            parents frequently comment on the value of being able to progress at their own pace while maintaining access to 
            consistent teacher support. This flexibility, combined with our high academic standards and comprehensive support 
            system, appears to be filling a crucial gap in Alberta's educational options.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Key Strengths</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Exceptional flexibility in course timing and pacing</li>
                <li>High overall satisfaction rates (89% students, 90% parents)</li>
                <li>Strong progress monitoring (8.62/10 rating)</li>
                <li>Clear lesson delivery (8.54/10 rating)</li>
                <li>High recommendation likelihood (8.54/10)</li>
                <li>Broad accessibility across different student demographics</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Focus Areas</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Online vs in-person experience (7.91/10)</li>
                <li>Student focus and engagement (31.4% reporting challenges)</li>
                <li>Peer collaboration opportunities</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Responses</h3>
          <p className="text-2xl font-bold text-blue-600">186</p>
          <p className="text-sm text-gray-500">118 Students, 68 Parents</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Overall Satisfaction</h3>
          <p className="text-2xl font-bold text-green-600">89%</p>
          <p className="text-sm text-gray-500">Satisfied or Very Satisfied</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Achievement Rate</h3>
          <p className="text-2xl font-bold text-orange-600">92.4%</p>
          <p className="text-sm text-gray-500">Meeting Academic Goals</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Avg Platform Rating</h3>
          <p className="text-2xl font-bold text-purple-600">8.53</p>
          <p className="text-sm text-gray-500">Out of 10</p>
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
            <h3 className="text-lg font-semibold mb-4">Satisfaction Distribution</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-4 text-left">Satisfaction Level</th>
                    <th className="p-4 text-right">Students</th>
                    <th className="p-4 text-right">Parents</th>
                  </tr>
                </thead>
                <tbody>
                  {satisfactionData.map((level, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-4">{level.category}</td>
                      <td className="p-4 text-right font-medium">{level.students}</td>
                      <td className="p-4 text-right font-medium">{level.parents}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Student Ratings (Scale: 1-10)</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-4 text-left">Metric</th>
                    <th className="p-4 text-right">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {studentRatings.map((rating, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-4">{rating.metric}</td>
                      <td className="p-4 text-right font-medium">{rating.score.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Course Enrollment Distribution</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-4 text-left">Course</th>
                    <th className="p-4 text-right">Number of Students</th>
                  </tr>
                </thead>
                <tbody>
                  {courseDistribution.map((course, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-4">{course.course}</td>
                      <td className="p-4 text-right font-medium">{course.count}</td>
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
            <h3 className="text-lg font-semibold mb-4">Satisfaction Distribution</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={satisfactionData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="category"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis label={{ value: 'Number of Responses', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="students" fill="#60a5fa" name="Students" />
                  <Bar dataKey="parents" fill="#34d399" name="Parents" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Student Ratings Distribution</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={studentRatings}
                  margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="metric"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                  />
                  <YAxis
                    domain={[0, 10]}
                    label={{ value: 'Rating Score', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="score" fill="#60a5fa" name="Average Rating" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Student Engagement Metrics</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={engagementMetrics}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="yes" stackId="a" fill="#4ade80" name="Yes" />
                  <Bar dataKey="maybe" stackId="a" fill="#fbbf24" name="Maybe" />
                  <Bar dataKey="no" stackId="a" fill="#f87171" name="No" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Course Distribution</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={courseDistribution}
                  margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="course"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#818cf8" name="Number of Students" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SurveyAnalysis;