import React from 'react';
import { Card } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";

const EducationPlan = () => {
  // Sample data for different tabs - you can replace this with actual data
  const goalTabs = [
    { value: "academic", label: "Academic Goals", component: <AcademicGoals /> },
    { value: "career", label: "Career Planning", component: <CareerPlanning /> },
    { value: "personal", label: "Personal Development", component: <PersonalDevelopment /> }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-6">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold">Education Plan</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Student Information</h2>
          <p className="text-gray-600 mb-4">
            This education plan helps students, parents, and educators work together to create a customized learning path that aligns with each student's unique goals and aspirations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">Student Name: <span className="font-normal text-gray-600">[Student Name]</span></p>
              <p className="font-semibold">Grade Level: <span className="font-normal text-gray-600">[Grade]</span></p>
            </div>
            <div>
              <p className="font-semibold">School Year: <span className="font-normal text-gray-600">2024-2025</span></p>
              <p className="font-semibold">Last Updated: <span className="font-normal text-gray-600">{new Date().toLocaleDateString()}</span></p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Current Progress</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold text-lg mb-2">Completed Courses</h3>
              <p className="text-3xl font-bold text-green-600">12</p>
              <p className="text-sm text-gray-600">courses completed</p>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold text-lg mb-2">Current Enrollment</h3>
              <p className="text-3xl font-bold text-blue-600">4</p>
              <p className="text-sm text-gray-600">active courses</p>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold text-lg mb-2">Overall Progress</h3>
              <p className="text-3xl font-bold text-purple-600">75%</p>
              <p className="text-sm text-gray-600">toward graduation</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="bg-slate-50 border-2 border-blue-200 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-2xl font-semibold text-blue-900">Goals & Planning Dashboard</h2>
            <Badge className="bg-blue-100 text-blue-800">
              2024-25 Plan
            </Badge>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <p className="text-gray-600 mb-6">
              Set and track academic, career, and personal development goals. Use the tabs below to explore 
              different areas of your education plan and monitor your progress.
            </p>
            
            <Tabs defaultValue="academic" className="w-full">
              <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
                {goalTabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {goalTabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value}>
                  {tab.component}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Next Steps</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <ul className="list-disc pl-6 space-y-2">
            <li>Review and update your academic goals for the current semester</li>
            <li>Schedule a meeting with your academic advisor</li>
            <li>Complete course selection for next term</li>
            <li>Update your career interests and explore related pathways</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

// Sample component for Academic Goals tab
const AcademicGoals = () => (
  <div className="space-y-4">
    <Card className="p-4">
      <h4 className="font-semibold mb-2">Current Semester Goals</h4>
      <ul className="list-disc pl-5 space-y-1">
        <li>Maintain a GPA of 3.5 or higher</li>
        <li>Complete Math 30-1 with a grade of 80% or higher</li>
        <li>Submit all assignments on time</li>
      </ul>
    </Card>
    <Card className="p-4">
      <h4 className="font-semibold mb-2">Long-term Academic Goals</h4>
      <ul className="list-disc pl-5 space-y-1">
        <li>Graduate with honors</li>
        <li>Complete all required courses for university admission</li>
        <li>Develop strong foundation in STEM subjects</li>
      </ul>
    </Card>
  </div>
);

// Sample component for Career Planning tab
const CareerPlanning = () => (
  <div className="space-y-4">
    <Card className="p-4">
      <h4 className="font-semibold mb-2">Career Interests</h4>
      <div className="flex flex-wrap gap-2">
        <Badge>Engineering</Badge>
        <Badge>Technology</Badge>
        <Badge>Healthcare</Badge>
      </div>
    </Card>
    <Card className="p-4">
      <h4 className="font-semibold mb-2">University Programs of Interest</h4>
      <ul className="list-disc pl-5 space-y-1">
        <li>Computer Science - University of Alberta</li>
        <li>Mechanical Engineering - University of Calgary</li>
        <li>Pre-Med Program - University of Toronto</li>
      </ul>
    </Card>
  </div>
);

// Sample component for Personal Development tab
const PersonalDevelopment = () => (
  <div className="space-y-4">
    <Card className="p-4">
      <h4 className="font-semibold mb-2">Skills to Develop</h4>
      <ul className="list-disc pl-5 space-y-1">
        <li>Time management and organization</li>
        <li>Public speaking and presentation skills</li>
        <li>Leadership and teamwork abilities</li>
      </ul>
    </Card>
    <Card className="p-4">
      <h4 className="font-semibold mb-2">Extracurricular Activities</h4>
      <ul className="list-disc pl-5 space-y-1">
        <li>Math Club - President</li>
        <li>Robotics Team - Lead Programmer</li>
        <li>Volunteer at Local Hospital</li>
      </ul>
    </Card>
  </div>
);

export default EducationPlan;