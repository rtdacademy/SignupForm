import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MathPerformance = () => {
  const data = [
    {
      course: 'Math 31',
      '80-100': 75.6,
      '65-79': 14.6,
      '50-64': 9.8,
      'Below 50': 0
    },
    {
      course: 'Math 30-1',
      '80-100': 51.5,
      '65-79': 40.8,
      '50-64': 5.8,
      'Below 50': 1.9
    },
    {
      course: 'Math 30-2',
      '80-100': 52.2,
      '65-79': 33.7,
      '50-64': 12.0,
      'Below 50': 2.1
    },
    {
      course: 'Math 10C',
      '80-100': 31.3,
      '65-79': 46.3,
      '50-64': 22.4,
      'Below 50': 0
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
          <XAxis dataKey="course" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="80-100" name="80-100%" fill="#22c55e" />
          <Bar dataKey="65-79" name="65-79%" fill="#3b82f6" />
          <Bar dataKey="50-64" name="50-64%" fill="#f59e0b" />
          <Bar dataKey="Below 50" name="Below 50%" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MathPerformance;