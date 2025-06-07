import React from 'react';
import { Card } from "../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import CourseStats from './Stats/CourseStats';
import SurveyResults from './Stats/SurveyResults';
import PerformanceMetrics from './Stats/PerformanceMetrics'; 
import DomainsDashboard from './DomainsDashboard'; 
import RequiredAEAMResults from './Components/RequiredAEAMResults';

const AERR2324 = () => {
  const dataTabs = [
    { value: "survey", label: "Survey Results", component: <SurveyResults /> },
    { value: "courses", label: "Course Stats", component: <CourseStats /> },
    { value: "performance", label: "Performance", component: <PerformanceMetrics /> }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-6">
      {/* Permalink Header */}
      <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-center">
        <p className="text-sm text-green-800">
          <strong>Permanent Link:</strong> This AERR is permanently accessible at{' '}
          <a 
            href="https://yourway.rtdacademy.com/aerr/2023-24" 
            className="text-green-700 underline hover:text-green-900"
            target="_blank"
            rel="noopener noreferrer"
          >
            yourway.rtdacademy.com/aerr/2023-24
          </a>
        </p>
      </div>

      <section className="space-y-4">
        <h1 className="text-3xl font-bold">Annual Education Results Report 2023-24</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Accountability Statement</h2>
          <p className="text-gray-600 mb-4">
            The Annual Education Results Report for RTD Academy for the 2023/2024 school year was prepared under the direction of the Board of Directors in accordance with the responsibilities under the Private Schools Regulation and the Ministerial Grants Regulation. The Board is committed to using the results in this report, to the best of its abilities, to improve outcomes for students and to ensure that all students in the school authority can acquire the knowledge, skills and attitudes they need to be successful and contributing members of society.
          </p>
          <p className="text-gray-600 mb-4">
            This Annual Education Results Report for 2023/2024 was approved by the Board.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Signed Accountability Statement:</strong>
            </p>
            <a
              href="https://rtdacademy.sharepoint.com/:b:/s/RTDAdministration/ERJXCPm4P_lOsAlUtGtYzD0BoIzFty1tZu5lTjAIpZVr8Q?e=gAtF9H"
              className="text-blue-600 hover:text-blue-800 text-sm underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Official Signed Accountability Statement (PDF)
            </a>
          </div>
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

      {/* Alberta Education Checklist Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Alberta Education Requirements Reference</h2>
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
          <p className="text-green-800 mb-4 font-medium">
            This section provides direct references to where each required AERR element can be found within this report.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-green-900">✅ Provincial Achievement Data</h3>
              <ul className="text-sm text-green-700 space-y-1 ml-4">
                <li>• <strong>High School Completion:</strong> See "High School Completion Rates" section below</li>
                <li>• <strong>Citizenship:</strong> Addressed in Provincial Measures section</li>
                <li>• <strong>Student Learning Engagement:</strong> Provincial Measures section</li>
                <li>• <strong>Education Quality:</strong> Provincial Measures section</li>
                <li>• <strong>PAT Results:</strong> See "Provincial Achievement Test Results" section below</li>
                <li>• <strong>Diploma Results:</strong> See "Diploma Examination Results" section below</li>
              </ul>
              
              <h3 className="font-semibold text-green-900 mt-4">✅ Diversity & Inclusion</h3>
              <ul className="text-sm text-green-700 space-y-1 ml-4">
                <li>• <strong>FNMI Success:</strong> See "First Nations, Métis and Inuit Education" section below</li>
                <li>• <strong>EAL Students:</strong> See "English as Additional Language Results" section below</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-green-900">✅ Organizational Elements</h3>
              <ul className="text-sm text-green-700 space-y-1 ml-4">
                <li>• <strong>Accountability Statement:</strong> Above (with official signed PDF link)</li>
                <li>• <strong>Stakeholder Engagement:</strong> Domains Dashboard → Stakeholders tab</li>
                <li>• <strong>Financial Information:</strong> Annual Report of Disclosures section</li>
                <li>• <strong>Contextual Information:</strong> Introduction and Context section above</li>
              </ul>
              
              <h3 className="font-semibold text-green-900 mt-4">✅ Data Sources</h3>
              <ul className="text-sm text-green-700 space-y-1 ml-4">
                <li>• <strong>AEAM Charts:</strong> Enhanced in Required AEAM Results section</li>
                <li>• <strong>Historical Trends:</strong> 4+ years data where available</li>
                <li>• <strong>Official Reports:</strong> All data sourced from APORI reports</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-green-100 rounded">
            <p className="text-xs text-green-600">
              <strong>Permanent Link:</strong> This AERR is permanently accessible at 
              <a href="https://yourway.rtdacademy.com/aerr/2023-24" className="font-medium text-green-800 ml-1 underline" target="_blank">
                yourway.rtdacademy.com/aerr/2023-24
              </a>
            </p>
          </div>
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

      {/* Additional Required Domains */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Additional Required Assurance Domains</h2>
        
        {/* Early Years Literacy and Numeracy */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Early Years Literacy and Numeracy Assessments</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">
              <strong>Status:</strong> Not applicable - RTD Academy serves students in grades 10-12 exclusively. 
              Early Years Literacy and Numeracy Assessments are administered to students in kindergarten through grade 3, 
              which fall outside our institutional scope.
            </p>
          </div>
        </div>

        {/* Professional Learning */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Professional Learning, Supervision and Evaluation</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Professional Development Initiatives</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Regular training on asynchronous pedagogy and online learning best practices</li>
                <li>• Mathematics curriculum and assessment workshops</li>
                <li>• Technology integration and digital platform training</li>
                <li>• Student support and engagement strategies</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Supervision and Evaluation</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Annual performance reviews for all teaching staff</li>
                <li>• Regular classroom observation and feedback cycles</li>
                <li>• Student outcome analysis and improvement planning</li>
                <li>• Collaborative reflection on teaching practices</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Safe Learning Environment */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Welcoming, Caring, Respectful and Safe Learning Environment</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Digital Safety Measures</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Comprehensive digital citizenship policies</li>
                <li>• Secure learning management system protocols</li>
                <li>• Anti-harassment and cyberbullying policies</li>
                <li>• Clear communication guidelines and expectations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Inclusive Environment</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Flexible scheduling accommodating diverse student needs</li>
                <li>• Culturally responsive teaching practices</li>
                <li>• Individual learning support plans</li>
                <li>• Respectful communication protocols</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Access to Supports */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Access to Supports and Services</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Student Support Services</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Individual tutoring and academic coaching</li>
                <li>• Flexible pacing and timeline accommodations</li>
                <li>• Technical support for online learning</li>
                <li>• Regular progress monitoring and feedback</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Accessibility Features</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Platform accessibility compliance</li>
                <li>• Multiple content delivery formats</li>
                <li>• Assistive technology compatibility</li>
                <li>• Individual accommodation planning</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Continuum of Supports */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Access to a Continuum of Supports and Services</h3>
          <div className="space-y-4">
            <p className="text-gray-700">
              RTD Academy provides a comprehensive continuum of support services designed to meet diverse student needs 
              within our asynchronous learning environment.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">Tier 1: Universal Supports</h5>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• High-quality curriculum design</li>
                  <li>• Clear learning expectations</li>
                  <li>• Regular progress monitoring</li>
                </ul>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h5 className="font-medium text-orange-900 mb-2">Tier 2: Targeted Interventions</h5>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Additional tutoring sessions</li>
                  <li>• Modified pacing plans</li>
                  <li>• Enhanced communication</li>
                </ul>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h5 className="font-medium text-purple-900 mb-2">Tier 3: Intensive Supports</h5>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Individual learning plans</li>
                  <li>• Specialized accommodations</li>
                  <li>• External referrals when needed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Financial Information Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Financial Information</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Budget Comparison */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Budget – Actual Comparison</h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800 mb-3">
                <strong>Financial Performance:</strong> Detailed budget vs. actual comparisons and variance analysis 
                are provided in our audited financial statements and annual financial report.
              </p>
              <a
                href="https://rtdacademy.sharepoint.com/:x:/s/RTDAdministration/EUqGdEbJ1ctAot-nMl6DIjYBJKTu7n67VG_cBC6Oq1fUsQ?e=e78plp"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Complete Financial Statements
              </a>
            </div>
          </div>

          {/* Financial Results Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Summary of Financial Results</h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                RTD Academy maintained sound financial management throughout the 2023-24 fiscal year, 
                with responsible stewardship of public and private funding sources.
              </p>
              <div className="bg-green-50 p-3 rounded">
                <p className="text-xs text-green-700">
                  <strong>Key Financial Indicators:</strong> Detailed in audited financial statements including 
                  revenue sources, expenditure categories, and year-end financial position.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Contact */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Financial Information Contact</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Principal/Financial Officer:</strong> Kyle Allen
            </p>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Email:</strong> kyle@rtdacademy.com
            </p>
            <p className="text-sm text-gray-700">
              <strong>Phone:</strong> Available upon request through main office
            </p>
          </div>
        </div>
      </section>

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
              href="https://rtdacademy.sharepoint.com/:x:/s/RTDAdministration/EUqGdEbJ1ctAot-nMl6DIjYBJKTu7n67VG_cBC6Oq1fUsQ?e=e78plp"
              className="text-blue-600 hover:text-blue-800 text-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Audited Financial Statements 2023-24
            </a>
          </div>
        </div>
      </section>

      {/* PAT Results Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Provincial Achievement Test (PAT) Results</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900 mb-3">PAT Participation Status</h3>
            <p className="text-gray-700 mb-4">
              RTD Academy does not participate in Provincial Achievement Tests (PATs) as we serve students in grades 10-12 exclusively. 
              PATs are administered to students in grades 6 and 9, which fall outside our grade range.
            </p>
            <div className="bg-white p-3 rounded border-l-4 border-blue-400">
              <p className="text-sm text-gray-600">
                <strong>Official Status:</strong> Not applicable - RTD Academy is a grades 10-12 school specializing in high school mathematics and STEM courses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* High School Completion Rates */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">High School Completion Rates</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">3-Year Completion Rate</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">*</p>
                <p className="text-sm text-gray-600 mt-2">
                  Data suppressed - fewer than 6 students in cohort
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  <strong>Alberta Average:</strong> 80.4%
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">5-Year Completion Rate</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">*</p>
                <p className="text-sm text-gray-600 mt-2">
                  Data suppressed - insufficient historical cohort data
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  <strong>Alberta Average:</strong> See APORI Authority Report
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-amber-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-amber-800 mb-2">Context for Completion Rate Data</h4>
            <p className="text-sm text-amber-700 mb-3">
              As RTD Academy was founded in September 2022, we have limited historical data for traditional 3-year and 5-year completion tracking. 
              Our student population primarily consists of course-specific enrollments rather than full high school completion cohorts. 
              Detailed completion analysis is available in our official APORI Authority Report.
            </p>
            <a
              href="https://rtdacademy.sharepoint.com/:b:/s/RTDAdministration/EcUWP4V-5kpPjkwF6mm6DmMB1VkaAn-oNhTUpHXRTAHvTw?e=VmvDi0"
              className="text-sm text-amber-600 hover:text-amber-800 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Official APORI Authority Report (PDF)
            </a>
          </div>
        </div>
      </section>

      {/* Diploma Examination Results */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Diploma Examination Results</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Overall Results for All Students</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900">Acceptable Standard</h4>
                <p className="text-2xl font-bold text-blue-600">60.9%</p>
                <p className="text-sm text-gray-600">vs Alberta: 81.5%</p>
                <p className="text-xs text-gray-500 mt-2">Based on Math 30-1 results (68 writers)</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900">Standard of Excellence</h4>
                <p className="text-2xl font-bold text-purple-600">16.7%</p>
                <p className="text-sm text-gray-600">vs Alberta: 22.6%</p>
                <p className="text-xs text-gray-500 mt-2">Improvement from 11.1% previous year</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Course-Specific Results</h4>
            <p className="text-sm text-gray-600 mb-3">
              Detailed course-by-course diploma examination results are available in our official APORI School Report. 
              This includes breakdown by subject area and achievement levels for all diploma-bearing courses offered.
            </p>
            <div className="flex gap-4">
              <a
                href="https://rtdacademy.sharepoint.com/:b:/s/RTDAdministration/EWwoTaNnMXdBvLLOvcVlnOABofgUMpi_r3UN9gFV5mOmgw?e=9qx0aS"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                View APORI School Report (PDF)
              </a>
              <a
                href="https://rtdacademy.sharepoint.com/:x:/s/RTDAdministration/EYL92gZT3VBGskFnJyUGqHwBKdsGXRneNvePzM2ahIcSew?e=zsrbLN"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Diploma Results Data (Excel)
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FNMI Education Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">First Nations, Métis and Inuit Education</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Diploma Examination Results for Self-Identified FNMI Students</h3>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-orange-800 mb-3">
                <strong>Official Results:</strong> Specific results for self-identified First Nations, Métis and Inuit students are detailed in our 
                official APORI Authority FNMI Report, including achievement and excellence standards for diploma examinations.
              </p>
              <a
                href="https://rtdacademy.sharepoint.com/:b:/s/RTDAdministration/EWsFT8XPcndGpZf8gDZm4HYBcINGifUjHhILPjvDtFY6ug?e=nPtabR"
                className="text-sm text-orange-600 hover:text-orange-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Official APORI Authority FNMI Report (PDF)
              </a>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Addressing Systemic Education Gaps</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">System Supports</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Flexible scheduling to accommodate cultural commitments</li>
                  <li>• Asynchronous learning supporting community-based education</li>
                  <li>• Culturally responsive mathematics instruction approaches</li>
                  <li>• Individual student success planning</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Truth and Reconciliation Commission Alignment</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Supporting Indigenous student success in STEM fields</li>
                  <li>• Removing barriers through flexible delivery methods</li>
                  <li>• Respecting traditional knowledge systems</li>
                  <li>• Building educational partnerships with Indigenous communities</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-800 mb-2">Commitment to Indigenous Education</h4>
            <p className="text-sm text-green-700">
              RTD Academy is committed to improving education outcomes for First Nations, Métis and Inuit students through 
              our flexible, accessible delivery model that respects Indigenous learning approaches and cultural commitments. 
              Specific performance data and initiatives are detailed in our APORI Authority FNMI Report.
            </p>
          </div>
        </div>
      </section>

      {/* EAL Students Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">English as Additional Language (EAL) Student Results</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Results for Students with Codes 301/303</h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800 mb-3">
                <strong>Official Results:</strong> Specific diploma examination results for students requiring and receiving 
                English language supports (EAL codes 301/303) are documented in our official APORI School EAL Report.
              </p>
              <a
                href="https://rtdacademy.sharepoint.com/:b:/s/RTDAdministration/Ef3Mxs5kpx9NpiAPAtiMrJ0BMnoWrfztDz3ANNVoUGGK7Q?e=BWtlvK"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Official APORI School EAL Report (PDF)
              </a>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">EAL Support Strategies</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Mathematics instruction with reduced language complexity</li>
                <li>• Visual and graphical learning supports</li>
                <li>• Extended time accommodations where appropriate</li>
                <li>• Multilingual resource access</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Performance Context</h4>
              <p className="text-sm text-gray-600">
                Our mathematics-focused curriculum provides advantages for EAL students as mathematical concepts 
                often transcend language barriers. Detailed achievement data and analysis are available in the 
                official APORI School EAL Report.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <RequiredAEAMResults />
      </section>



    </div>
  );
};

export default AERR2324;