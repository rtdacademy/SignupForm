import React from 'react';
import { Card } from "../../../../components/ui/card";
import { BarChart, LineChart, PieChart, AreaChart, AlertTriangle } from 'lucide-react';

const PerformanceMeasures = () => {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">VI. Performance Measures Framework</h2>
      
      <Card className="p-6">
        <p className="text-lg leading-relaxed mb-6">
          RTD Academy has developed a comprehensive framework for measuring performance and progress 
          toward our educational goals. This framework incorporates both required provincial measures 
          and local measures specifically designed to assess our effectiveness as an online asynchronous 
          mathematics and STEM education provider.
        </p>
      </Card>
      
      {/* Provincial Measures */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart className="h-5 w-5 text-blue-600" />
          Provincial Measures
        </h3>
        
        <div className="space-y-6">
          
          <div>
            <h4 className="font-medium mb-3">Diploma Examination Results</h4>
            <div className="bg-gray-50 p-4 rounded space-y-2">
              <p className="text-sm">
                <strong>Description:</strong> Percentage of students achieving the acceptable standard and 
                standard of excellence on diploma examinations. The gap between school-awarded grades and 
                diploma results is a key focus area being addressed through our assessment integrity initiatives.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <h6 className="text-sm font-medium mb-2">Mathematics 30-1 (January 2025)</h6>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Students: 26</span>
                      <span className="text-green-600 font-semibold">100% Acceptable</span>
                    </div>
                    <div className="flex justify-between">
                      <span>School-Awarded Average:</span>
                      <span className="font-medium">81.1%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Diploma Exam Average:</span>
                      <span className="font-medium">65.5%</span>
                    </div>
                    <div className="flex justify-between text-yellow-700 bg-yellow-50 p-1 rounded">
                      <span>Gap:</span>
                      <span className="font-bold">15.6%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Provincial Gap:</span>
                      <span>11.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Excellence Standard:</span>
                      <span>42.3% (Provincial: 47.0%)</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <h6 className="text-sm font-medium mb-2">Mathematics 30-2 (January 2025)</h6>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Students: 33</span>
                      <span className="text-green-600 font-semibold">100% Acceptable</span>
                    </div>
                    <div className="flex justify-between">
                      <span>School-Awarded Average:</span>
                      <span className="font-medium">79.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Diploma Exam Average:</span>
                      <span className="font-medium">58.6%</span>
                    </div>
                    <div className="flex justify-between text-red-700 bg-red-50 p-1 rounded">
                      <span>Gap:</span>
                      <span className="font-bold">20.6%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Provincial Gap:</span>
                      <span>8.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Excellence Standard:</span>
                      <span>24.2% (Provincial: 24.8%)</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 bg-blue-50 p-3 rounded-lg">
                <p className="text-sm flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Assessment Integrity Focus:</strong> Our goal is to reduce the gap between school-awarded grades 
                    and diploma exam results to match or be better than provincial averages (11.3% for Math 30-1, 8.2% for Math 30-2).
                    Implementation of Proctorio secure testing across all courses will be a key strategy to address this challenge.
                  </span>
                </p>
              </div>
              
              <p className="text-sm mt-3">
                <strong>Measurement Strategy:</strong> Direct tracking of diploma examination results for all 
                RTD Academy students, with detailed analysis of grade distributions, written response performance, 
                and comparison against provincial averages.
              </p>
            </div>
          </div>
          
        </div>
      </Card>
      
      {/* Local Measures */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <LineChart className="h-5 w-5 text-green-600" />
          Local Measures
        </h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Student Learning Engagement</h4>
            <div className="bg-gray-50 p-4 rounded space-y-2">
              <p className="text-sm">
                <strong>Description:</strong> Percentage of teachers, parents and students who agree that 
                students are engaged in their learning at school.
              </p>
              <p className="text-sm">
                <strong>Current Result (2023-24):</strong> 89% (based on RTD Academy custom survey)
              </p>
              <p className="text-sm">
                <strong>Target for 2024-25:</strong> 91%
              </p>
              <p className="text-sm">
                <strong>Measurement Strategy:</strong> RTD Academy conducts custom surveys of all stakeholders 
                since we primarily serve non-primary students and aren't included in the provincial Assurance Survey.
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Course Completion Rates</h4>
            <div className="bg-gray-50 p-4 rounded space-y-2">
              <p className="text-sm">
                <strong>Description:</strong> Percentage of enrolled courses successfully completed by students.
              </p>
              <p className="text-sm">
                <strong>Current Result (2023-24):</strong> 77.6% overall completion rate
              </p>
              <p className="text-sm">
                <strong>Target for 2024-25:</strong> 80% overall completion rate
              </p>
              <p className="text-sm">
                <strong>Stratified Analysis:</strong>
              </p>
              <ul className="list-disc list-inside text-sm pl-4 space-y-1">
                <li>Non-Primary Students: 78.2% completion (Target: 81%)</li>
                <li>Adult Students: 72.4% completion (Target: 75%)</li>
                <li>Home Education Students: 84.1% completion (Target: Maintain 84%+)</li>
                <li>Summer School Students: 76.9% completion (Target: 79%)</li>
              </ul>
              <p className="text-sm mt-2">
                <strong>Measurement Strategy:</strong> Direct tracking through our student information system, 
                analyzed quarterly and annually.
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Citizenship</h4>
            <div className="bg-gray-50 p-4 rounded space-y-2">
              <p className="text-sm">
                <strong>Description:</strong> Percentage of teachers, parents and students who are satisfied 
                that students model the characteristics of active citizenship.
              </p>
              <p className="text-sm">
                <strong>Current Result (2023-24):</strong> 84% (based on RTD Academy custom survey)
              </p>
              <p className="text-sm">
                <strong>Target for 2024-25:</strong> 86%
              </p>
              <p className="text-sm">
                <strong>Measurement Strategy:</strong> Custom RTD Academy survey with questions aligned to 
                provincial measures but adapted to our online learning context.
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Welcoming, Caring, Respectful, and Safe Learning Environments</h4>
            <div className="bg-gray-50 p-4 rounded space-y-2">
              <p className="text-sm">
                <strong>Description:</strong> Percentage of teachers, parents and students who agree that their 
                learning environments are welcoming, caring, respectful and safe.
              </p>
              <p className="text-sm">
                <strong>Current Result (2023-24):</strong> 92% (based on RTD Academy custom survey)
              </p>
              <p className="text-sm">
                <strong>Target for 2024-25:</strong> Maintain 92%+
              </p>
              <p className="text-sm">
                <strong>Measurement Strategy:</strong> Custom survey with questions adapted for online learning 
                environment but aligned with provincial measures.
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Access to Supports and Services</h4>
            <div className="bg-gray-50 p-4 rounded space-y-2">
              <p className="text-sm">
                <strong>Description:</strong> Percentage of teachers, parents and students who agree that students 
                have access to the appropriate supports and services at school.
              </p>
              <p className="text-sm">
                <strong>Current Result (2023-24):</strong> 87% (based on RTD Academy custom survey)
              </p>
              <p className="text-sm">
                <strong>Target for 2024-25:</strong> 89%
              </p>
              <p className="text-sm">
                <strong>Measurement Strategy:</strong> Custom survey with questions focused on the accessibility 
                and effectiveness of our online support services.
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Student Satisfaction</h4>
            <div className="bg-gray-50 p-4 rounded space-y-2">
              <p className="text-sm">
                <strong>Description:</strong> Percentage of students who report satisfaction with their 
                educational experience at RTD Academy.
              </p>
              <p className="text-sm">
                <strong>Current Result (2023-24):</strong> 89% student satisfaction
              </p>
              <p className="text-sm">
                <strong>Target for 2024-25:</strong> 91% student satisfaction
              </p>
              <p className="text-sm">
                <strong>Measurement Strategy:</strong> Course exit surveys administered to all students upon 
                course completion, with detailed analysis of response patterns.
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Parent Satisfaction</h4>
            <div className="bg-gray-50 p-4 rounded space-y-2">
              <p className="text-sm">
                <strong>Description:</strong> Percentage of parents who report satisfaction with their child's 
                educational experience at RTD Academy.
              </p>
              <p className="text-sm">
                <strong>Current Result (2023-24):</strong> 90% parent satisfaction
              </p>
              <p className="text-sm">
                <strong>Target for 2024-25:</strong> Maintain 90%+ parent satisfaction
              </p>
              <p className="text-sm">
                <strong>Measurement Strategy:</strong> Annual parent survey administered electronically, with 
                specific questions about course quality, support services, and overall experience.
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Performance in Key Mathematics Courses</h4>
            <div className="bg-gray-50 p-4 rounded space-y-2">
              <p className="text-sm">
                <strong>Description:</strong> Average final grade in key mathematics courses.
              </p>
              <div className="overflow-x-auto mt-2">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-3 py-2 text-left">Course</th>
                      <th className="border px-3 py-2 text-left">Current Average (2023-24)</th>
                      <th className="border px-3 py-2 text-left">Target 2024-25</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border px-3 py-2">Mathematics 10C</td>
                      <td className="border px-3 py-2">71.59%</td>
                      <td className="border px-3 py-2">74.0%</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border px-3 py-2">Mathematics 20-2</td>
                      <td className="border px-3 py-2">69.44%</td>
                      <td className="border px-3 py-2">73.0%</td>
                    </tr>
                    <tr>
                      <td className="border px-3 py-2">Mathematics 30-1</td>
                      <td className="border px-3 py-2">75.68%</td>
                      <td className="border px-3 py-2">78.0%</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border px-3 py-2">Mathematics 31</td>
                      <td className="border px-3 py-2">86.33%</td>
                      <td className="border px-3 py-2">Maintain 86%+</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm mt-2">
                <strong>Measurement Strategy:</strong> Direct tracking of final grades, analyzed by course, 
                student type, and demographic factors.
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Early Identification Effectiveness</h4>
            <div className="bg-gray-50 p-4 rounded space-y-2">
              <p className="text-sm">
                <strong>Description:</strong> Percentage of at-risk students successfully identified within the 
                first three weeks of enrollment and subsequently retained.
              </p>
              <p className="text-sm">
                <strong>Current Result (2023-24):</strong> 68% identification rate; 62% retention rate of identified students
              </p>
              <p className="text-sm">
                <strong>Target for 2024-25:</strong> 75% identification rate; 70% retention rate of identified students
              </p>
              <p className="text-sm">
                <strong>Measurement Strategy:</strong> Analysis of student engagement metrics through our early 
                warning system, combined with subsequent tracking of student outcomes.
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Assessment Integrity</h4>
            <div className="bg-gray-50 p-4 rounded space-y-2">
              <p className="text-sm">
                <strong>Description:</strong> Metrics related to assessment security and integrity through 
                Proctorio implementation.
              </p>
              <p className="text-sm">
                <strong>Current Result (2023-24):</strong> Not applicable (new measure for 2024-25)
              </p>
              <p className="text-sm">
                <strong>Target for 2024-25:</strong> 100% implementation across ALL courses as soon as possible; reduce gaps between 
                school-awarded grades and diploma results (currently 15.6% for Math 30-1 and 20.6% for Math 30-2 in January) 
                by at least 5 percentage points to be more in line with provincial averages
              </p>
              <p className="text-sm">
                <strong>Measurement Strategy:</strong> Tracking Proctorio implementation rates, analyzing flagged 
                integrity issues, and monitoring the correlation between course grades and external assessments.
              </p>
            </div>
          </div>
        </div>
      </Card>
      
    
    </section>
  );
};

export default PerformanceMeasures;