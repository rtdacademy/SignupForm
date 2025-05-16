import React, { useEffect, useState } from 'react';
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import studentData from '../CurrentStudentData_May16.json';

const CurrentDataAnalysis = () => {
  const [analysisData, setAnalysisData] = useState(null);

  useEffect(() => {
    const analyzeData = () => {
      const currentYearData = studentData;
      
      // Unique students
      const uniqueStudents = [...new Set(currentYearData.map(record => record.anonymousId))];
      
      // Student types breakdown
      const studentTypeCounts = currentYearData.reduce((acc, record) => {
        const type = record.StudentType_Value || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      
      // Course enrollments by course
      const courseCounts = currentYearData.reduce((acc, record) => {
        const course = record.courseDescription || record.Course_Value || 'Unknown';
        acc[course] = (acc[course] || 0) + 1;
        return acc;
      }, {});
      
      // Status breakdown
      const statusCounts = currentYearData.reduce((acc, record) => {
        const status = record.status || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      // PASI Term breakdown
      const pasiTermCounts = currentYearData.reduce((acc, record) => {
        const term = record.pasiTerm || 'Unknown';
        acc[term] = (acc[term] || 0) + 1;
        return acc;
      }, {});
      
      // Period breakdown
      const periodCounts = currentYearData.reduce((acc, record) => {
        const period = record.period || 'Unknown';
        acc[period] = (acc[period] || 0) + 1;
        return acc;
      }, {});
      
      // Calculate average age
      const currentDate = new Date();
      const validBirthdays = currentYearData
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
      const creditData = currentYearData
        .filter(record => record.creditsAttempted !== undefined && record.creditsAttempted !== null);
      const totalCreditsAttempted = creditData
        .reduce((sum, record) => sum + parseFloat(record.creditsAttempted || 0), 0);
      
      const completedCredits = currentYearData
        .filter(record => record.status === 'Completed' && record.creditsAttempted)
        .reduce((sum, record) => sum + parseFloat(record.creditsAttempted || 0), 0);
      
      // Primary school breakdown
      const primarySchoolCounts = currentYearData.reduce((acc, record) => {
        const school = record.primarySchoolName || 'Unknown';
        acc[school] = (acc[school] || 0) + 1;
        return acc;
      }, {});
      
      // Sort and get top schools
      const topSchools = Object.entries(primarySchoolCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
      
      // Grade distribution analysis
      const gradeDistribution = currentYearData
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
      const activeStatusCounts = currentYearData.reduce((acc, record) => {
        const status = record.ActiveFutureArchived_Value || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      // Diploma month choices
      const diplomaMonthCounts = currentYearData.reduce((acc, record) => {
        if (record.DiplomaMonthChoices_Value) {
          acc[record.DiplomaMonthChoices_Value] = (acc[record.DiplomaMonthChoices_Value] || 0) + 1;
        }
        return acc;
      }, {});
      
      // Registration trends by month
      const registrationsByMonth = currentYearData.reduce((acc, record) => {
        const date = new Date(record.Created || record.startDate);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        acc[monthYear] = (acc[monthYear] || 0) + 1;
        return acc;
      }, {});
      
      // Sort courses by enrollment count
      const sortedCourses = Object.entries(courseCounts)
        .sort(([,a], [,b]) => b - a);
      
      setAnalysisData({
        uniqueStudents,
        totalEnrollments: currentYearData.length,
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
          averageCreditsPerStudent: creditData.length > 0 ? totalCreditsAttempted / creditData.length : 0
        }
      });
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
      
      {/* Student Type Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Student Type Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(analysisData.studentTypeCounts).map(([type, count]) => (
            <div key={type} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">{type}</span>
              <Badge variant="secondary">{count}</Badge>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Status Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Enrollment Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(analysisData.statusCounts).map(([status, count]) => (
            <div key={status} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">{status}</span>
              <Badge variant={status === 'Completed' ? 'success' : 'secondary'}>{count}</Badge>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Credits Analysis */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Credits Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </Card>
      
      {/* Grade Distribution */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Grade Distribution</h3>
        <div className="mb-4">
          <p className="text-sm text-gray-600">Average Grade</p>
          <p className="text-2xl font-bold">{analysisData.averageGrade.toFixed(2)}%</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(analysisData.gradeDistribution).map(([range, count]) => (
            <div key={range} className="text-center p-3 bg-gray-50 rounded">
              <p className="font-medium">{range}</p>
              <p className="text-xl font-bold">{count}</p>
            </div>
          ))}
        </div>
      </Card>
      
      {/* PASI Terms */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">PASI Term Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(analysisData.pasiTermCounts).map(([term, count]) => (
            <div key={term} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">{term}</span>
              <Badge variant="secondary">{count}</Badge>
            </div>
          ))}
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
      
      {/* Top Primary Schools */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top Primary Schools</h3>
        <div className="space-y-2">
          {analysisData.topSchools.map(([school, count]) => (
            <div key={school} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="font-medium">{school}</span>
              <Badge variant="secondary">{count}</Badge>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Active/Future/Archived Status */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Active/Future/Archived Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(analysisData.activeStatusCounts).map(([status, count]) => (
            <div key={status} className="text-center p-3 bg-gray-50 rounded">
              <p className="font-medium">{status}</p>
              <p className="text-xl font-bold">{count}</p>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Diploma Month Choices */}
      {Object.keys(analysisData.diplomaMonthCounts).length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Diploma Month Selections</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(analysisData.diplomaMonthCounts).map(([month, count]) => (
              <div key={month} className="text-center p-3 bg-gray-50 rounded">
                <p className="font-medium">{month}</p>
                <p className="text-xl font-bold">{count}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </section>
  );
};

export default CurrentDataAnalysis;