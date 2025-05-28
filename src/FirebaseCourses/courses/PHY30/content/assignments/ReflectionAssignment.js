import React from 'react';

const ReflectionAssignment = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Course Reflection Assignment</h1>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Assignment Overview</h2>
        <p>
          In this assignment, you will reflect on your learning journey through Physics 30.
          Your reflection should demonstrate your understanding of key concepts and their real-world applications.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Requirements</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Discuss at least three major concepts you learned in this course</li>
          <li>Explain how these concepts apply to real-world situations</li>
          <li>Describe any challenges you faced and how you overcame them</li>
          <li>Minimum 500 words</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Submission</h2>
        <p>
          Submit your reflection as a PDF document through the assignment submission portal.
        </p>
      </section>
    </div>
  );
};

export default ReflectionAssignment;
