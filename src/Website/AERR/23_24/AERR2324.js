import React from 'react';
import { Card } from "../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import CourseStats from './Stats/CourseStats';
import SurveyResults from './Stats/SurveyResults';
import PerformanceMetrics from './Stats/PerformanceMetrics'; 
import DomainsDashboard from './DomainsDashboard'; 

const AERR2324 = () => {
  const dataTabs = [
    { value: "survey", label: "Survey Results", component: <SurveyResults /> },
    { value: "courses", label: "Course Stats", component: <CourseStats /> },
    { value: "performance", label: "Performance", component: <PerformanceMetrics /> }
  ];

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
              {/* Mobile view - horizontal scroll */}
              <div className="md:hidden overflow-x-auto pb-2">
                <TabsList className="inline-flex min-w-full">
                  {dataTabs.map((tab) => (
                    <TabsTrigger 
                      key={tab.value}
                      value={tab.value}
                      className="whitespace-nowrap flex-1"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Desktop view - grid */}
              <div className="hidden md:block">
                <TabsList className="grid w-full grid-cols-3">
                  {dataTabs.map((tab) => (
                    <TabsTrigger 
                      key={tab.value}
                      value={tab.value}
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Tab content */}
              {dataTabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value}>
                  {tab.component}
                </TabsContent>
              ))}
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

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Conclusion</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-gray-600 mb-4">
            The 2023-24 Annual Education Results Report highlights RTD Academy's commitment to delivering accessible, high-quality education through an innovative asynchronous model. With 1,294 course enrollments and a significant improvement in completion rates, we have demonstrated our ability to address the diverse needs of our student population. Investments in enhanced support systems, technology integration, and professional development have played a crucial role in driving these positive outcomes.
          </p>
          <p className="text-gray-600 mb-4">
            Stakeholder feedback reflects strong satisfaction levels, with 89% of students and 90% of parents expressing positive experiences. These insights guide our continuous efforts to improve communication, support at-risk students, and refine our curriculum to meet evolving educational standards.
          </p>
          <p className="text-gray-600">
            As we move forward, our focus remains on sustaining this growth by expanding course offerings, enhancing support systems, and leveraging data-driven insights to optimize student success. RTD Academy is proud to contribute to the advancement of asynchronous education in Alberta and remains dedicated to empowering students to achieve their fullest potential.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Annual Report of Disclosures</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                In accordance with Section 32 of the Public Interest Disclosure Act, RTD Academy reports 
                that there were no disclosures received or acted upon during the 2023-24 academic year. 
                Our commitment to transparency and ethical practices remains steadfast, with clear procedures 
                in place for handling any future disclosures.
              </p>
            </div>
          </div>
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Financial Documentation</h4>
            <p className="text-sm text-gray-600 mb-2">
              For detailed financial information, please view our complete audited financial statements:
            </p>
            <a
              href="https://rtdacademy.sharepoint.com/:f:/s/RTDMathAcademy/Ep-6WVc_xu5PjrvcgB76gGYBUxrF3BHnY015dg_U6Dv0Ag?e=RIiRqB"
              className="text-blue-600 hover:text-blue-800 text-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Audited Financial Statements 2023-24
            </a>
          </div>
        </div>
      </section>



    </div>
  );
};

export default AERR2324;