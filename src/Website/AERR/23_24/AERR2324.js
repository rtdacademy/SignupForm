import React from 'react';
import { Card } from "../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import CourseStats from './Stats/CourseStats';
import SurveyResults from './Stats/SurveyResults';
import PerformanceMetrics from './Stats/PerformanceMetrics'; 
import DomainsDashboard from './DomainsDashboard'; 

const AERR2324 = () => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto p-6">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold">Annual Education Results Report 2023-24</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Accountability Statement</h2>
          <p className="text-gray-600 mb-4">
            The Annual Education Results Report for RTD Academy for the 2023/2024 school year was prepared under the direction of the Board of Directors in accordance with the responsibilities under the Private Schools Regulation and the Ministerial Grants Regulation. The Board is committed to using the results in this report, to the best of its abilities, to improve outcomes for students and to ensure that all students in the school authority can acquire the knowledge, skills and attitudes they need to be successful and contributing members of society.
          </p>
          <p className="text-gray-600">
            This Annual Education Results Report for 2023/2024 was approved by the Board on [DATE].
          </p>
          <p className="mt-4 font-semibold">Board Chair: Nikki Allen</p>
          <p className="font-semibold">Board Chair Signature: _______________________</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Introduction and Context</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-gray-600 mb-4">
            RTD Academy, founded in September 2022, is an innovative online school specializing in high school Math and STEM courses. Our mission is to provide high-quality, accessible education through an asynchronous format, allowing students to maintain flexible schedules and timelines.
          </p>
          <p className="text-gray-600">
            In the 2023-24 academic year, we served 806 unique students across various programs, with a total of 1,294 course enrollments. Our student population includes:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>635 Non-Primary Students</li>
            <li>197 Summer School Students</li>
            <li>62 Primary Students</li>
            <li>63 Adult Students</li>
            <li>47 Home Education Students</li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <div className="bg-slate-50 border-2 border-blue-200 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-2xl font-semibold text-blue-900">Interactive Data Analysis Dashboard</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              2023-24 Data
            </span>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <p className="text-gray-600 mb-6">
              This interactive dashboard presents comprehensive data analysis from our 2023-24 academic year. 
              Use the tabs below to explore different aspects of our performance, including stakeholder feedback, 
              course statistics, and academic outcomes.
            </p>
            
            <Tabs defaultValue="survey" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="survey">Survey Results</TabsTrigger>
                <TabsTrigger value="courses">Course Stats</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              <TabsContent value="survey">
                <SurveyResults />
              </TabsContent>

              <TabsContent value="courses">
                <CourseStats />
              </TabsContent>

              <TabsContent value="performance">
                <PerformanceMetrics />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      <DomainsDashboard />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Summary and Future Direction</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-gray-600 mb-4">Based on our results, our priorities for the upcoming year include:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Enhancing support systems for students at risk of non-completion</li>
            <li>Expanding our technology course offerings given their high success rates</li>
            <li>Developing additional resources for Mathematics 10C to improve performance</li>
            <li>Implementing more robust early identification systems for struggling students</li>
            <li>Strengthening our communication systems with stakeholders</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default AERR2324;