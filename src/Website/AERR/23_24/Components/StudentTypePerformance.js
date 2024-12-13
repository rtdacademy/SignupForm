import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StudentTypePerformance = () => {
  const data = [
    {
      type: 'Home Education',
      average: 89.7,
      students: 47
    },
    {
      type: 'Primary',
      average: 88.3,
      students: 62
    },
    {
      type: 'Non-Primary',
      average: 88.3,
      students: 635
    },
    {
      type: 'Summer School',
      average: 86.9,
      students: 197
    },
    {
      type: 'Adult',
      average: 83.6,
      students: 63
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
          <XAxis dataKey="type" />
          <YAxis domain={[80, 90]} />
          <Tooltip />
          <Legend />
          <Bar dataKey="average" name="Average Mark (%)" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StudentTypePerformance;