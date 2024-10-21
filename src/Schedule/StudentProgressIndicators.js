import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardContent } from '../components/ui/card';

const StudentProgressIndicators = ({ data, currentDate }) => {
  // Helper function to calculate days difference
  const daysBetween = (date1, date2) => {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((date1 - date2) / oneDay));
  };

  // Calculate overall progress
  const totalItems = data.units.flatMap(unit => unit.items).length;
  const completedItems = data.units.flatMap(unit => unit.items).filter(item => 
    item.gradebookData && item.gradebookData.grade && item.gradebookData.grade.status === "Submitted"
  ).length;
  const overallProgress = (completedItems / totalItems) * 100;

  // Calculate schedule adherence
  const itemsDueByNow = data.units.flatMap(unit => unit.items).filter(item => 
    new Date(item.date) <= new Date(currentDate)
  ).length;
  const scheduleAdherence = (completedItems / itemsDueByNow) * 100;

  // Calculate average score
  const scoredItems = data.units.flatMap(unit => unit.items).filter(item => 
    item.gradebookData && item.gradebookData.grade && item.gradebookData.grade.percentage
  );
  const averageScore = scoredItems.reduce((sum, item) => sum + item.gradebookData.grade.percentage, 0) / scoredItems.length;

  // Identify upcoming deadlines
  const upcomingDeadlines = data.units.flatMap(unit => unit.items)
    .filter(item => new Date(item.date) > new Date(currentDate))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  // Calculate time spent on completed items
  const timeSpentTotal = scoredItems.reduce((sum, item) => sum + (item.gradebookData.grade.timeSpent || 0), 0);
  const averageTimePerItem = timeSpentTotal / scoredItems.length / 60; // in minutes

  // Prepare data for the chart
  const chartData = data.units.map(unit => ({
    name: unit.name,
    completed: unit.items.filter(item => item.gradebookData && item.gradebookData.grade && item.gradebookData.grade.status === "Submitted").length,
    total: unit.items.length
  }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>Overall Progress</CardHeader>
        <CardContent>{overallProgress.toFixed(2)}%</CardContent>
      </Card>
      
      <Card>
        <CardHeader>Schedule Adherence</CardHeader>
        <CardContent>{scheduleAdherence.toFixed(2)}%</CardContent>
      </Card>
      
      <Card>
        <CardHeader>Average Score</CardHeader>
        <CardContent>{averageScore.toFixed(2)}%</CardContent>
      </Card>
      
      <Card>
        <CardHeader>Upcoming Deadlines</CardHeader>
        <CardContent>
          <ul>
            {upcomingDeadlines.map((item, index) => (
              <li key={index}>{item.title}: {new Date(item.date).toLocaleDateString()}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>Average Time Spent Per Item</CardHeader>
        <CardContent>{averageTimePerItem.toFixed(2)} minutes</CardContent>
      </Card>
      
      <Card>
        <CardHeader>Progress by Unit</CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#8884d8" name="Completed" />
              <Bar dataKey="total" fill="#82ca9d" name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentProgressIndicators;