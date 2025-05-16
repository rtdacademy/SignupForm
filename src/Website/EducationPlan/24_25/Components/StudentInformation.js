import React from 'react';
import { Card } from "../../../../components/ui/card";

const StudentInformation = () => {
  // Sample data - clearly marked
  const sampleStudentData = {
    name: "Jane Doe (Sample)",
    studentId: "12345678",
    grade: "Grade 11",
    enrollmentDate: "September 1, 2024",
    homeSchool: "Sample High School",
    program: "Non-Primary Student"
  };

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Student Information</h2>
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-3">Personal Details</h3>
            <p className="mb-2"><span className="font-medium">Name:</span> {sampleStudentData.name}</p>
            <p className="mb-2"><span className="font-medium">Student ID:</span> {sampleStudentData.studentId}</p>
            <p className="mb-2"><span className="font-medium">Grade Level:</span> {sampleStudentData.grade}</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-3">Enrollment Information</h3>
            <p className="mb-2"><span className="font-medium">Enrollment Date:</span> {sampleStudentData.enrollmentDate}</p>
            <p className="mb-2"><span className="font-medium">Home School:</span> {sampleStudentData.homeSchool}</p>
            <p className="mb-2"><span className="font-medium">Program Type:</span> {sampleStudentData.program}</p>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default StudentInformation;