import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CompletionRatesDashboard = () => {
  const data = [
    {
      category: 'Overall',
      completed: 77.6,
      incomplete: 12.4,
      withdrawn: 10.0
    },
    {
      category: 'Math 30-1',
      completed: 66.9,
      incomplete: 23.4,
      withdrawn: 9.7
    },
    {
      category: 'Math 30-2',
      completed: 84.4,
      incomplete: 8.3,
      withdrawn: 7.3
    },
    {
      category: 'Math 31',
      completed: 58.6,
      incomplete: 24.3,
      withdrawn: 17.1
    }
  ];

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="completed" name="Completed" fill="#22c55e" />
          <Bar dataKey="incomplete" name="Incomplete" fill="#f59e0b" />
          <Bar dataKey="withdrawn" name="Withdrawn" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CompletionRatesDashboard;