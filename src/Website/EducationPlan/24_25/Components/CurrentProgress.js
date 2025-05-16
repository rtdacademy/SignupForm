import React from 'react';
import { Card } from "../../../../components/ui/card";
import { Progress } from "../../../../components/ui/progress";
import { Badge } from "../../../../components/ui/badge";

const CurrentProgress = () => {
  // Sample data - clearly marked
  const sampleProgressData = {
    completedCourses: [
      { name: "Math 20-1", grade: "85%", status: "Completed" },
      { name: "English 20-1", grade: "78%", status: "Completed" },
      { name: "Science 20", grade: "82%", status: "Completed" }
    ],
    currentCourses: [
      { name: "Math 30-1", progress: 65, grade: "83%" },
      { name: "Physics 30", progress: 45, grade: "79%" },
      { name: "Chemistry 30", progress: 70, grade: "87%" }
    ],
    overallProgress: 75
  };

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Current Progress</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="font-semibold text-lg mb-2">Completed Courses</h3>
          <p className="text-3xl font-bold text-green-600">{sampleProgressData.completedCourses.length}</p>
          <p className="text-sm text-gray-600">Sample courses completed</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-lg mb-2">Current Enrollment</h3>
          <p className="text-3xl font-bold text-blue-600">{sampleProgressData.currentCourses.length}</p>
          <p className="text-sm text-gray-600">Active sample courses</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-lg mb-2">Overall Progress</h3>
          <p className="text-3xl font-bold text-purple-600">{sampleProgressData.overallProgress}%</p>
          <p className="text-sm text-gray-600">Sample progress toward graduation</p>
        </Card>
      </div>
      
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Current Courses (Sample Data)</h3>
        <div className="space-y-4">
          {sampleProgressData.currentCourses.map((course, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{course.name}</span>
                <span className="text-sm text-gray-600">Current Grade: {course.grade}</span>
              </div>
              <Progress value={course.progress} className="h-2" />
              <div className="text-sm text-gray-600">{course.progress}% complete</div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
};

export default CurrentProgress;