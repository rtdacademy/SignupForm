import React, { useEffect, useState } from 'react';
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import rawStudentData from '../CurrentStudentData_May16.json';

const CurrentDataAnalysis = () => {
  const [analysisData, setAnalysisData] = useState(null);

  useEffect(() => {
    const analyzeData = () => {
      // Debug: check raw data for Primary students
      const primaryInRaw = rawStudentData.filter(record => record.StudentType_Value === 'Primary Student');
      console.log('Primary Student records in raw data:', primaryInRaw.length);
      
      // Filter out Primary students from the very beginning
      const studentData = rawStudentData.filter(record => record.StudentType_Value !== 'Primary Student');
      
      // Debug: check filtered data
      const primaryInFiltered = studentData.filter(record => record.StudentType_Value === 'Primary Student');
      console.log('Primary Student records in filtered data:', primaryInFiltered.length);
      
      // Unique students
      const uniqueStudents = [...new Set(studentData.map(record => record.anonymousId))];
      
      // Student types breakdown - per unique student
      const studentsByAnonymousId = {};
      studentData.forEach(record => {
        if (!studentsByAnonymousId[record.anonymousId]) {
          studentsByAnonymousId[record.anonymousId] = record;
        }
      });
      
      const studentTypeCounts = Object.values(studentsByAnonymousId).reduce((acc, record) => {
        let type = record.StudentType_Value || 'Non-Primary';
        
        // Skip if Primary type somehow still exists
        if (type === 'Primary' || type === 'Primary Student') {
          console.log('Found Primary Student in studentTypeCounts:', record);
          return acc;
        }
        
        // Consolidate Unknown into Non-Primary
        if (type === 'Unknown') {
          type = 'Non-Primary';
        }
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      
      // Calculate unique students per status (all students)
      const uniqueStudentsByStatus = {};
      const statusGroups = {};
      studentData.forEach(record => {
        const status = record.status || 'Unknown';
        if (!statusGroups[status]) {
          statusGroups[status] = new Set();
        }
        statusGroups[status].add(record.anonymousId);
      });
      
      Object.keys(statusGroups).forEach(status => {
        uniqueStudentsByStatus[status] = statusGroups[status].size;
      });
      
      // Student type breakdown by status - count unique students
      const studentTypeByStatus = {};
      const processedStudents = new Set();
      
      // First get unique student-status combinations
      studentData.forEach(record => {
        const key = `${record.anonymousId}-${record.status}`;
        if (!processedStudents.has(key)) {
          processedStudents.add(key);
          const status = record.status || 'Unknown';
          let type = record.StudentType_Value || 'Non-Primary';
          
          // Skip if Primary type somehow still exists
          if (type === 'Primary' || type === 'Primary Student') {
            console.log('Found Primary Student in studentTypeByStatus:', record);
            return;
          }
          
          // Consolidate Unknown into Non-Primary
          if (type === 'Unknown') {
            type = 'Non-Primary';
          }
          
          if (!studentTypeByStatus[status]) {
            studentTypeByStatus[status] = {};
          }
          
          if (!studentTypeByStatus[status][type]) {
            studentTypeByStatus[status][type] = 0;
          }
          
          studentTypeByStatus[status][type] += 1;
        }
      });
      
      console.log('Final studentTypeByStatus:', studentTypeByStatus);
      
      // Define the course codes we want to include
      const allowedCourseCodes = [
        // Grade 10 Courses
        "KAE1782",  // Math 10-4
        "MAT1793",  // Math 10-3
        "MAT1791",  // Math 10C
        "LDC1515",  // Math 15
        
        // Grade 11 Courses
        "KAE2782",  // Math 20-4
        "MAT2793",  // Math 20-3
        "MAT2792",  // Math 20-2
        "MAT2791",  // Math 20-1
        "SCN2797",  // Physics 20
        
        // Grade 12 Courses
        "MAT3793",  // Math 30-3
        "MAT3792",  // Math 30-2
        "MAT3791",  // Math 30-1
        "MAT3211"   // Math 31 (Calculus)
      ];
      
      // Course enrollments by course - only for allowed course codes
      const courseCounts = studentData
        .filter(record => record.courseCode && allowedCourseCodes.includes(record.courseCode))
        .reduce((acc, record) => {
          const course = record.courseDescription || record.Course_Value || 'Unknown';
          acc[course] = (acc[course] || 0) + 1;
          return acc;
        }, {});
      
      // Status breakdown
      const statusCounts = studentData.reduce((acc, record) => {
        const status = record.status || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      // PASI Term breakdown
      const pasiTermCounts = studentData.reduce((acc, record) => {
        const term = record.pasiTerm || 'Unknown';
        acc[term] = (acc[term] || 0) + 1;
        return acc;
      }, {});
      
      // Period breakdown
      const periodCounts = studentData.reduce((acc, record) => {
        const period = record.period || 'Unknown';
        acc[period] = (acc[period] || 0) + 1;
        return acc;
      }, {});
      
      // Calculate average age
      const currentDate = new Date();
      const validBirthdays = studentData
        .filter(record => record.birthday)
        .map(record => {
          const birthDate = new Date(record.birthday);
          const age = (currentDate - birthDate) / (365.25 * 24 * 60 * 60 * 1000);
          return age;
        });
      const averageAge = validBirthdays.length > 0 
        ? validBirthdays.reduce((sum, age) => sum + age, 0) / validBirthdays.length
        : 0;
      
      // Credits analysis
      const creditData = studentData
        .filter(record => record.creditsAttempted !== undefined && record.creditsAttempted !== null);
      const totalCreditsAttempted = creditData
        .reduce((sum, record) => sum + parseFloat(record.creditsAttempted || 0), 0);
      
      const completedCredits = studentData
        .filter(record => record.status === 'Completed' && record.creditsAttempted)
        .reduce((sum, record) => sum + parseFloat(record.creditsAttempted || 0), 0);
      
      // Credits by student type
      const creditsByStudentType = {};
      const studentCreditSums = {};
      
      studentData.forEach(record => {
        if (record.creditsAttempted !== undefined && record.creditsAttempted !== null) {
          let type = record.StudentType_Value || 'Non-Primary';
          if (type === 'Unknown') {
            type = 'Non-Primary';
          }
          
          if (!creditsByStudentType[type]) {
            creditsByStudentType[type] = {
              totalCredits: 0,
              uniqueStudents: new Set(),
              completedCredits: 0
            };
          }
          
          creditsByStudentType[type].totalCredits += parseFloat(record.creditsAttempted || 0);
          creditsByStudentType[type].uniqueStudents.add(record.anonymousId);
          
          if (record.status === 'Completed') {
            creditsByStudentType[type].completedCredits += parseFloat(record.creditsAttempted || 0);
          }
          
          // Track total credits per student
          if (!studentCreditSums[record.anonymousId]) {
            studentCreditSums[record.anonymousId] = 0;
          }
          studentCreditSums[record.anonymousId] += parseFloat(record.creditsAttempted || 0);
        }
      });
      
      // Calculate averages by student type
      const creditsByTypeFormatted = Object.entries(creditsByStudentType).map(([type, data]) => ({
        type,
        totalCredits: data.totalCredits,
        completedCredits: data.completedCredits,
        uniqueStudents: data.uniqueStudents.size,
        averageCreditsPerStudent: data.uniqueStudents.size > 0 ? data.totalCredits / data.uniqueStudents.size : 0
      }));
      
      // Primary school breakdown
      const primarySchoolCounts = studentData.reduce((acc, record) => {
        const school = record.primarySchoolName || 'Unknown';
        acc[school] = (acc[school] || 0) + 1;
        return acc;
      }, {});
      
      // Sort and get top schools
      const topSchools = Object.entries(primarySchoolCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
      
      // Grade distribution analysis
      const gradeDistribution = studentData
        .filter(record => record.value && !isNaN(record.value))
        .map(record => parseFloat(record.value));
      
      const gradeRanges = {
        '90-100': gradeDistribution.filter(g => g >= 90).length,
        '80-89': gradeDistribution.filter(g => g >= 80 && g < 90).length,
        '70-79': gradeDistribution.filter(g => g >= 70 && g < 80).length,
        '60-69': gradeDistribution.filter(g => g >= 60 && g < 70).length,
        '50-59': gradeDistribution.filter(g => g >= 50 && g < 60).length,
        'Below 50': gradeDistribution.filter(g => g < 50).length
      };
      
      const averageGrade = gradeDistribution.length > 0
        ? gradeDistribution.reduce((sum, g) => sum + g, 0) / gradeDistribution.length
        : 0;
      
      // Active/Future/Archived breakdown
      const activeStatusCounts = studentData.reduce((acc, record) => {
        const status = record.ActiveFutureArchived_Value || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      // Diploma month choices
      const diplomaMonthCounts = studentData.reduce((acc, record) => {
        if (record.DiplomaMonthChoices_Value) {
          acc[record.DiplomaMonthChoices_Value] = (acc[record.DiplomaMonthChoices_Value] || 0) + 1;
        }
        return acc;
      }, {});
      
      // Registration trends by month - count unique students per date
      const registrationsByStudentDate = {};
      studentData.forEach(record => {
        // Use Created date if available, otherwise use startDate
        const dateValue = record.Created || record.startDate;
        if (!dateValue) return; // Skip if no date available
        
        const date = new Date(dateValue);
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        const key = `${record.anonymousId}-${dateKey}`;
        
        if (!registrationsByStudentDate[key]) {
          registrationsByStudentDate[key] = {
            date: dateKey,
            monthYear: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          };
        }
      });
      
      // Count unique registrations by month
      const registrationsByMonth = Object.values(registrationsByStudentDate).reduce((acc, entry) => {
        acc[entry.monthYear] = (acc[entry.monthYear] || 0) + 1;
        return acc;
      }, {});
      
      // Convert to array and sort by date for chart, starting from June 2024
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const today = new Date();
      const currentMonthYear = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      
      const registrationTrends = Object.entries(registrationsByMonth)
        .filter(([monthYear]) => {
          // Only include data from June 2024 onwards
          const [year, month] = monthYear.split('-');
          const yearNum = parseInt(year);
          const monthNum = parseInt(month);
          return (yearNum === 2024 && monthNum >= 6) || yearNum > 2024;
        })
        .map(([monthYear, count]) => {
          const [year, month] = monthYear.split('-');
          const monthIndex = parseInt(month) - 1;
          let displayCount = count;
          let label = monthNames[monthIndex] + ' ' + year.slice(2);
          let isProjection = false;
          
          // If this is the current month (May 2025) and we're before the end of the month, project it
          if (monthYear === currentMonthYear && today.getDate() < 31) {
            displayCount = count * 2; // Double the current count as projection
            label += ' (projected)';
            isProjection = true;
          }
          
          return {
            date: monthYear,
            month: label,
            count: displayCount,
            isProjection
          };
        })
        .sort((a, b) => a.date.localeCompare(b.date));
      
      // Sort courses by enrollment count
      const sortedCourses = Object.entries(courseCounts)
        .sort(([,a], [,b]) => b - a);
      
      // Create the analysis data object
      const analysisResult = {
        uniqueStudents,
        totalEnrollments: studentData.length,
        studentTypeCounts,
        courseCounts: sortedCourses,
        statusCounts,
        pasiTermCounts,
        periodCounts,
        averageAge,
        totalCreditsAttempted,
        completedCredits,
        topSchools,
        gradeDistribution: gradeRanges,
        averageGrade,
        activeStatusCounts,
        diplomaMonthCounts,
        registrationsByMonth,
        creditData: {
          totalStudentsWithCredits: creditData.length,
          averageCreditsPerStudent: uniqueStudents.length > 0 ? totalCreditsAttempted / uniqueStudents.length : 0,
          averageCreditsPerStudentWithCredits: Object.keys(studentCreditSums).length > 0 
            ? totalCreditsAttempted / Object.keys(studentCreditSums).length 
            : 0
        },
        uniqueStudentsByStatus,
        studentTypeByStatus,
        registrationTrends,
        creditsByType: creditsByTypeFormatted
      };
      
      // Log the complete analysis data
      console.log('Current Data Analysis - Complete Results:', analysisResult);
      
      setAnalysisData(analysisResult);
    };
    
    analyzeData();
  }, []);
  
  if (!analysisData) {
    return <div>Loading analysis...</div>;
  }
  
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Current Year Data Analysis (2024-25)</h2>
      
      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-blue-50">
          <h3 className="font-semibold text-blue-900 mb-2">Total Unique Students</h3>
          <p className="text-3xl font-bold text-blue-700">{analysisData.uniqueStudents.length}</p>
        </Card>
        
        <Card className="p-6 bg-green-50">
          <h3 className="font-semibold text-green-900 mb-2">Total Course Enrollments</h3>
          <p className="text-3xl font-bold text-green-700">{analysisData.totalEnrollments}</p>
        </Card>
        
        <Card className="p-6 bg-purple-50">
          <h3 className="font-semibold text-purple-900 mb-2">Average Age</h3>
          <p className="text-3xl font-bold text-purple-700">{analysisData.averageAge.toFixed(1)} years</p>
        </Card>
      </div>
      
      {/* Registration Trends Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Registration Trends by Month</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analysisData.registrationTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [`${value} students`, name]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (payload.isProjection) {
                    return (
                      <circle cx={cx} cy={cy} r={6} fill="#3B82F6" stroke="#3B82F6" strokeWidth={2} fillOpacity={0.5} strokeDasharray="2 2" />
                    );
                  }
                  return <circle cx={cx} cy={cy} r={4} fill="#3B82F6" />;
                }}
                activeDot={{ r: 6 }}
                name="Registrations"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      {/* Student Type Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Student Type Distribution (Unique Students)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(analysisData.studentTypeCounts).map(([type, count]) => (
            <div key={type} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">{type}</span>
              <Badge variant="secondary">{count}</Badge>
            </div>
          ))}
        </div>
      </Card>
      
      
      
      {/* Student Type by Status Matrix */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Student Type by Status (Unique Courses)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {[...new Set(Object.values(analysisData.studentTypeByStatus).flatMap(s => Object.keys(s)))].map(type => {
                  console.log('Table header type:', type);
                  return (
                    <th key={type} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {type}
                    </th>
                  );
                })}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(analysisData.studentTypeByStatus).map(([status, types]) => {
                console.log(`Status ${status} types:`, types);
                const total = Object.values(types).reduce((sum, count) => sum + count, 0);
                const allTypes = [...new Set(Object.values(analysisData.studentTypeByStatus).flatMap(s => Object.keys(s)))];
                return (
                  <tr key={status}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {status}
                    </td>
                    {allTypes.map(type => (
                      <td key={type} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {types[type] || 0}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {total}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Credits Analysis */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Credits Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Credits Attempted</p>
            <p className="text-2xl font-bold">{analysisData.totalCreditsAttempted}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Completed Credits</p>
            <p className="text-2xl font-bold text-green-600">{analysisData.completedCredits}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Average Credits/Student</p>
            <p className="text-2xl font-bold">{analysisData.creditData.averageCreditsPerStudent.toFixed(2)}</p>
          </div>
        </div>
        
        {/* Credits by Student Type Table */}
        <h4 className="text-md font-semibold mb-3">Credits by Student Type</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unique Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Credits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed Credits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Credits/Student
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analysisData.creditsByType.map((row) => (
                <tr key={row.type}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.uniqueStudents}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.totalCredits}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.completedCredits}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.averageCreditsPerStudent.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      
      
      {/* Top Courses */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Course Enrollments (Top 10)</h3>
        <div className="space-y-2">
          {analysisData.courseCounts.slice(0, 10).map(([course, count]) => (
            <div key={course} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="font-medium">{course}</span>
              <Badge variant="secondary">{count}</Badge>
            </div>
          ))}
        </div>
      </Card>
      
      
      
    </section>
  );
};

export default CurrentDataAnalysis;