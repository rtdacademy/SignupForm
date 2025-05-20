import React from 'react';
import { Card } from "../../../../../components/ui/card";
import { Badge } from "../../../../../components/ui/badge";
import { GraduationCap, TrendingUp, Award, BookOpen, AlertTriangle } from 'lucide-react';

const StudentGrowthAchievement = () => {
  // Course performance data from our analysis
  const coursePerformanceData = [
    { course: "Mathematics 30-1 (MAT3791)", enrollments: 335, averageGrade: 75.68, diplomaExamAverage: 65.5 },
    { course: "Mathematics 30-2 (MAT3792)", enrollments: 261, averageGrade: 77.58, diplomaExamAverage: 58.6 },
    { course: "Mathematics 10C (MAT1791)", enrollments: 255, averageGrade: 71.59, diplomaExamAverage: null },
    { course: "Mathematics 20-1 (MAT2791)", enrollments: 203, averageGrade: 75.65, diplomaExamAverage: null },
    { course: "Mathematics 20-2 (MAT2792)", enrollments: 134, averageGrade: 69.44, diplomaExamAverage: null },
    { course: "Mathematics 31 (MAT3211)", enrollments: 113, averageGrade: 86.33, diplomaExamAverage: null },
    { course: "Mathematics 10-3 (MAT1793)", enrollments: 38, averageGrade: 71.80, diplomaExamAverage: null },
    { course: "Mathematics 20-3 (MAT2793)", enrollments: 38, averageGrade: 77.89, diplomaExamAverage: null },
    { course: "Mathematics 30-3 (MAT3793)", enrollments: 20, averageGrade: 67.00, diplomaExamAverage: null },
    { course: "Competencies in Math 15 (LDC1515)", enrollments: 39, averageGrade: 78.19, diplomaExamAverage: null },
  ];
  
  // Diploma exam data from January 2025
  const diplomaDataJan = {
    math301: {
      school: {
        studentCount: 26,
        schoolAwarded: 81.1,
        diplomaExam: 65.5,
        gap: 15.6,
        blended: 76.8,
        acceptableStandard: 100.0,
        excellenceStandard: 42.3
      },
      province: {
        studentCount: 12000,
        schoolAwarded: 79.4,
        diplomaExam: 68.1,
        gap: 11.3,
        blended: 76.1,
        acceptableStandard: 95.6,
        excellenceStandard: 47.0
      },
      gradeDistribution: {
        schoolAwarded: { A: 65.4, B: 23.1, C: 11.5, F: 0.0 },
        diplomaExam: { A: 26.9, B: 26.9, C: 30.8, F: 15.4 },
        blended: { A: 42.3, B: 46.2, C: 11.5, F: 0.0 }
      },
      writtenResponse: {
        school: 52.4,
        province: 58.8,
        difference: -6.4
      }
    },
    math302: {
      school: {
        studentCount: 33,
        schoolAwarded: 79.2,
        diplomaExam: 58.6,
        gap: 20.6,
        blended: 73.1,
        acceptableStandard: 100.0,
        excellenceStandard: 24.2
      },
      province: {
        studentCount: 7959,
        schoolAwarded: 71.6,
        diplomaExam: 63.4,
        gap: 8.2,
        blended: 69.3,
        acceptableStandard: 94.9,
        excellenceStandard: 24.8
      },
      gradeDistribution: {
        schoolAwarded: { A: 48.5, B: 42.4, C: 9.1, F: 0.0 },
        diplomaExam: { A: 15.2, B: 21.2, C: 36.4, F: 27.3 },
        blended: { A: 24.2, B: 54.5, C: 21.2, F: 0.0 }
      },
      writtenResponse: {
        school: 38.6,
        province: 46.7,
        difference: -8.1
      }
    }
  };
  
  // We've removed April 2025 data for now until we have more context and information

  return (
    <section className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Domain 1: Student Growth & Achievement</h3>
      
      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-blue-600" />
          Enhance Student Achievement in Mathematics
        </h4>
        
        <div className="space-y-4">
          <p className="leading-relaxed">
            RTD Academy's commitment to student achievement in mathematics is reflected in our steadily 
            growing enrollment figures across all mathematics courses. With 1,435 unique students taking 
            2,903 course enrollments in the 2024-25 school year, our reach and impact continue to expand 
            across Alberta. Mathematics 30-1 remains our most enrolled course with 335 students, followed 
            by Mathematics 30-2 with 261 students.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h5 className="font-medium mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Course Performance Analysis
              </h5>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">Course</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">Students</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">Avg. Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coursePerformanceData.map((course, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-3 py-2 text-sm border">{course.course}</td>
                        <td className="px-3 py-2 text-sm border">{course.enrollments}</td>
                        <td className="px-3 py-2 text-sm border">
                          <Badge className={
                            course.averageGrade >= 80 ? 'bg-green-100 text-green-800' :
                            course.averageGrade >= 70 ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {course.averageGrade}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div>
              <h5 className="font-medium mb-3 flex items-center gap-2">
                <Award className="h-4 w-4 text-blue-600" />
                Key Performance Insights
              </h5>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">•</span>
                  <span>
                    <strong>Strength:</strong> Mathematics 31 (Calculus) shows the highest average at 86.33%, 
                    demonstrating our effectiveness with advanced mathematics content.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold mt-0.5">•</span>
                  <span>
                    <strong>Focus Area:</strong> Mathematics 20-2 (69.44%) and Mathematics 30-3 (67.00%) 
                    show the most room for improvement and will be targeted for enhanced support strategies.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold mt-0.5">•</span>
                  <span>
                    <strong>Challenge:</strong> Significant gaps between school-awarded grades and diploma exam results,
                    with detailed analysis presented in our diploma results section below.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span>
                    <strong>Overall:</strong> Average grade of 75.12% across all courses demonstrates 
                    satisfactory performance while identifying specific areas for improvement.
                  </span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Diploma Results Analysis Section */}
          <div className="mt-8">
            <h5 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-red-600" />
              Diploma Examination Results Analysis
            </h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Math 30-1 January Results Card */}
              <Card className="p-4">
                <h6 className="font-medium mb-2">Mathematics 30-1 (January 2025)</h6>
                <div className="flex justify-between mb-3 text-sm">
                  <span className="text-gray-600">Students: {diplomaDataJan.math301.school.studentCount}</span>
                  <span className="text-green-600 font-semibold">
                    <Badge variant="outline" className="bg-green-50">100% Acceptable Standard</Badge>
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h6 className="text-xs font-medium text-gray-500 mb-1">Grade Distribution Comparison</h6>
                    <div className="w-full bg-gray-100 rounded-lg p-3">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-sm font-medium">School-Awarded</span>
                        <span className="text-xs">{diplomaDataJan.math301.school.schoolAwarded}%</span>
                      </div>
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div className="flex">
                            <div className="w-24 bg-blue-100 py-1 text-center text-xs" style={{width: `${diplomaDataJan.math301.gradeDistribution.schoolAwarded.A}%`}}>
                              A: {diplomaDataJan.math301.gradeDistribution.schoolAwarded.A}%
                            </div>
                            <div className="w-24 bg-green-100 py-1 text-center text-xs" style={{width: `${diplomaDataJan.math301.gradeDistribution.schoolAwarded.B}%`}}>
                              B: {diplomaDataJan.math301.gradeDistribution.schoolAwarded.B}%
                            </div>
                            <div className="w-24 bg-yellow-100 py-1 text-center text-xs" style={{width: `${diplomaDataJan.math301.gradeDistribution.schoolAwarded.C}%`}}>
                              C: {diplomaDataJan.math301.gradeDistribution.schoolAwarded.C}%
                            </div>
                            <div className="w-24 bg-red-100 py-1 text-center text-xs" style={{width: `${diplomaDataJan.math301.gradeDistribution.schoolAwarded.F}%`}}>
                              {diplomaDataJan.math301.gradeDistribution.schoolAwarded.F > 0 ? `F: ${diplomaDataJan.math301.gradeDistribution.schoolAwarded.F}%` : ''}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mb-1.5 mt-3">
                        <span className="text-sm font-medium">Diploma Exam</span>
                        <span className="text-xs">{diplomaDataJan.math301.school.diplomaExam}%</span>
                      </div>
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div className="flex">
                            <div className="w-24 bg-blue-100 py-1 text-center text-xs" style={{width: `${diplomaDataJan.math301.gradeDistribution.diplomaExam.A}%`}}>
                              A: {diplomaDataJan.math301.gradeDistribution.diplomaExam.A}%
                            </div>
                            <div className="w-24 bg-green-100 py-1 text-center text-xs" style={{width: `${diplomaDataJan.math301.gradeDistribution.diplomaExam.B}%`}}>
                              B: {diplomaDataJan.math301.gradeDistribution.diplomaExam.B}%
                            </div>
                            <div className="w-24 bg-yellow-100 py-1 text-center text-xs" style={{width: `${diplomaDataJan.math301.gradeDistribution.diplomaExam.C}%`}}>
                              C: {diplomaDataJan.math301.gradeDistribution.diplomaExam.C}%
                            </div>
                            <div className="w-24 bg-red-100 py-1 text-center text-xs" style={{width: `${diplomaDataJan.math301.gradeDistribution.diplomaExam.F}%`}}>
                              F: {diplomaDataJan.math301.gradeDistribution.diplomaExam.F}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-3 rounded-lg flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h6 className="text-sm font-medium text-yellow-800">Grade-Diploma Gap</h6>
                      <p className="text-xs text-yellow-700">
                        <span className="font-bold">{diplomaDataJan.math301.school.gap}%</span> gap between school-awarded ({diplomaDataJan.math301.school.schoolAwarded}%) 
                        and diploma exam ({diplomaDataJan.math301.school.diplomaExam}%) results
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        <span className="font-bold">Provincial Gap:</span> 11% (79.4% school vs. 68.1% diploma)
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        <span className="font-bold">Goal:</span> Reduce our gap from 15.6% to be in line with or below provincial average
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        <span className="font-bold">Written Response:</span> {diplomaDataJan.math301.writtenResponse.school}% 
                        (Provincial: {diplomaDataJan.math301.writtenResponse.province}%)
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* Math 30-2 January Results Card */}
              <Card className="p-4">
                <h6 className="font-medium mb-2">Mathematics 30-2 (January 2025)</h6>
                <div className="flex justify-between mb-3 text-sm">
                  <span className="text-gray-600">Students: {diplomaDataJan.math302.school.studentCount}</span>
                  <span className="text-green-600 font-semibold">
                    <Badge variant="outline" className="bg-green-50">100% Acceptable Standard</Badge>
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h6 className="text-xs font-medium text-gray-500 mb-1">Grade Distribution Comparison</h6>
                    <div className="w-full bg-gray-100 rounded-lg p-3">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-sm font-medium">School-Awarded</span>
                        <span className="text-xs">{diplomaDataJan.math302.school.schoolAwarded}%</span>
                      </div>
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div className="flex">
                            <div className="w-24 bg-blue-100 py-1 text-center text-xs" style={{width: `${diplomaDataJan.math302.gradeDistribution.schoolAwarded.A}%`}}>
                              A: {diplomaDataJan.math302.gradeDistribution.schoolAwarded.A}%
                            </div>
                            <div className="w-24 bg-green-100 py-1 text-center text-xs" style={{width: `${diplomaDataJan.math302.gradeDistribution.schoolAwarded.B}%`}}>
                              B: {diplomaDataJan.math302.gradeDistribution.schoolAwarded.B}%
                            </div>
                            <div className="w-24 bg-yellow-100 py-1 text-center text-xs" style={{width: `${diplomaDataJan.math302.gradeDistribution.schoolAwarded.C}%`}}>
                              C: {diplomaDataJan.math302.gradeDistribution.schoolAwarded.C}%
                            </div>
                            <div className="w-24 bg-red-100 py-1 text-center text-xs" style={{width: `${diplomaDataJan.math302.gradeDistribution.schoolAwarded.F}%`}}>
                              {diplomaDataJan.math302.gradeDistribution.schoolAwarded.F > 0 ? `F: ${diplomaDataJan.math302.gradeDistribution.schoolAwarded.F}%` : ''}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mb-1.5 mt-3">
                        <span className="text-sm font-medium">Diploma Exam</span>
                        <span className="text-xs">{diplomaDataJan.math302.school.diplomaExam}%</span>
                      </div>
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div className="flex">
                            <div className="w-24 bg-blue-100 py-1 text-center text-xs" style={{width: `${diplomaDataJan.math302.gradeDistribution.diplomaExam.A}%`}}>
                              A: {diplomaDataJan.math302.gradeDistribution.diplomaExam.A}%
                            </div>
                            <div className="w-24 bg-green-100 py-1 text-center text-xs" style={{width: `${diplomaDataJan.math302.gradeDistribution.diplomaExam.B}%`}}>
                              B: {diplomaDataJan.math302.gradeDistribution.diplomaExam.B}%
                            </div>
                            <div className="w-24 bg-yellow-100 py-1 text-center text-xs" style={{width: `${diplomaDataJan.math302.gradeDistribution.diplomaExam.C}%`}}>
                              C: {diplomaDataJan.math302.gradeDistribution.diplomaExam.C}%
                            </div>
                            <div className="w-24 bg-red-100 py-1 text-center text-xs" style={{width: `${diplomaDataJan.math302.gradeDistribution.diplomaExam.F}%`}}>
                              F: {diplomaDataJan.math302.gradeDistribution.diplomaExam.F}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 p-3 rounded-lg flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h6 className="text-sm font-medium text-red-800">Grade-Diploma Gap</h6>
                      <p className="text-xs text-red-700">
                        <span className="font-bold">{diplomaDataJan.math302.school.gap}%</span> gap between school-awarded ({diplomaDataJan.math302.school.schoolAwarded}%) 
                        and diploma exam ({diplomaDataJan.math302.school.diplomaExam}%) results
                      </p>
                      <p className="text-xs text-red-700 mt-1">
                        <span className="font-bold">Provincial Gap:</span> 8% (71.6% school vs. 63.4% diploma)
                      </p>
                      <p className="text-xs text-red-700 mt-1">
                        <span className="font-bold">Goal:</span> Reduce our gap from 20.6% to be in line with or below provincial average
                      </p>
                      <p className="text-xs text-red-700 mt-1">
                        <span className="font-bold">Written Response:</span> {diplomaDataJan.math302.writtenResponse.school}% 
                        (Provincial: {diplomaDataJan.math302.writtenResponse.province}%)
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            
            <Card className="p-4 bg-gray-50 mb-6">
              <div className="text-sm text-gray-700">
                <p className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Key School Goal:</strong> Our school aims to reduce the gap between our school-awarded grades 
                    and diploma exam results to match or be better than provincial averages (11% for Math 30-1, 8% for Math 30-2).
                    Proctorio implementation will be a key strategy to address this assessment integrity challenge.
                  </span>
                </p>
              </div>
            </Card>
          </div>
          
          <div className="mt-6">
            <h5 className="font-medium mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              Strategies for Enhancement
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <h6 className="font-medium text-sm mb-2">1. Enhanced Support for Key Courses</h6>
                <p className="text-sm">
                  Develop additional support resources specifically for Mathematics 20-2 and 
                  Mathematics 30-3, including supplementary practice problems, video tutorials, 
                  and targeted intervention strategies for common areas of difficulty.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h6 className="font-medium text-sm mb-2">2. Expanded Diploma Preparation with Secure Assessment</h6>
                <p className="text-sm">
                  Enhance our "Rock the Diploma" preparation program with more practice 
                  assessments, specialized review sessions, and alignment with provincial 
                  diploma exam expectations to address the significant gaps between school-awarded grades 
                  and diploma exam results (currently 15.6% for Math 30-1 and 20.6% for Math 30-2 vs provincial 
                  gaps of 11% and 8%). Integrate Proctorio secure testing technology for all practice exams to simulate 
                  actual diploma exam conditions and ensure assessment integrity.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h6 className="font-medium text-sm mb-2">3. Data-Driven Instruction</h6>
                <p className="text-sm">
                  Implement regular data analysis of student performance to identify specific 
                  concept areas where students struggle most. Use this information to refine 
                  course content and develop targeted intervention strategies.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h6 className="font-medium text-sm mb-2">4. Personalized Learning Pathways</h6>
                <p className="text-sm">
                  Develop more adaptive learning pathways that respond to individual student 
                  performance data, automatically providing additional practice or advanced 
                  content based on demonstrated mastery of concepts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      <Card className="p-6 bg-blue-50">
        <div className="flex items-start gap-3">
          <GraduationCap className="h-5 w-5 text-blue-700 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Expected Outcomes</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Increase in Mathematics 20-2 (69.44%) and Mathematics 30-3 (67.00%) average grades by at least 3% by end of 2025-26</li>
              <li>• Reduce the gap between school-awarded grades and diploma exam results from current levels (15.6% for Math 30-1, 20.6% for Math 30-2) to match or beat provincial averages (11% and 8% respectively)</li>
              <li>• Maintain our high diploma exam acceptable standard of 100% in future exam sessions</li>
              <li>• Maintain our strong performance in Mathematics 31 (86.33%)</li>
              <li>• Increase overall course completion rates from 77.6% to 82% by end of 2025-26</li>
              <li>• Improved student confidence and self-efficacy in mathematics as measured by exit surveys</li>
            </ul>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default StudentGrowthAchievement;