import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
import { useCourse } from '../context/CourseContext';
import StudentDetailsDialog from './StudentDetailsDialog';

const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const EXCLUDED_EMAILS = [
  'kyle.e.brown13@gmail.com',
  'kyle.brown@wolfcreek.com',
  'kyle@edbotz.com',
  'kyle@rtdlearning.com'
];

const EnrollmentCharts = ({ summariesData, selectedSchoolYear }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [filterInfo, setFilterInfo] = useState({ type: '', value: '' });
  const { getAllCourses } = useCourse();

  const handleChartClick = (data, type) => {
    let filteredStudents = [];
    let filterValue = '';

    const baseFilter = student => 
      student.School_x0020_Year_Value === selectedSchoolYear &&
      !EXCLUDED_EMAILS.includes(student.StudentEmail) &&
      student.Status_Value !== '✗ Removed (Not Funded)';

    switch(type) {
      case 'course':
        filteredStudents = summariesData.filter(student => 
          baseFilter(student) &&
          getAllCourses()[student.CourseID]?.Title === data.name
        );
        filterValue = data.name;
        break;
      case 'studentType':
        filteredStudents = summariesData.filter(student => 
          baseFilter(student) &&
          student.StudentType_Value === data.name
        );
        filterValue = data.name;
        break;
      case 'status':
        filteredStudents = summariesData.filter(student => 
          baseFilter(student) &&
          student.Status_Value === data.name
        );
        filterValue = data.name;
        break;
      default:
        break;
    }

    setSelectedStudents(filteredStudents);
    setFilterInfo({ 
      type: type === 'studentType' ? 'Student Type' : type === 'status' ? 'Status' : 'Course', 
      value: filterValue 
    });
    setDialogOpen(true);
  };

  // Initial data filtering
  const filteredData = useMemo(() => summariesData.filter(student => 
    student.School_x0020_Year_Value === selectedSchoolYear &&
    !EXCLUDED_EMAILS.includes(student.StudentEmail) &&
    student.Status_Value !== '✗ Removed (Not Funded)'
  ), [summariesData, selectedSchoolYear]);

  const courses = useMemo(() => getAllCourses(), [getAllCourses]);

  // Course enrollment calculations
  const courseEnrollments = useMemo(() => {
    return filteredData.reduce((acc, student) => {
      const courseId = student.CourseID;
      const course = courses[courseId];
      
      if (course?.Title) {
        const courseName = course.Title;
        acc[courseName] = (acc[courseName] || 0) + 1;
      }
      return acc;
    }, {});
  }, [filteredData, courses]);

  const courseEnrollmentData = useMemo(() => {
    return Object.entries(courseEnrollments)
      .filter(([_, count]) => count > 0)
      .map(([name, count]) => ({
        name,
        count
      }));
  }, [courseEnrollments]);

  // Student type calculations
  const studentTypeData = useMemo(() => {
    return filteredData.reduce((acc, student) => {
      const type = student.StudentType_Value || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
  }, [filteredData]);

  const studentTypeChartData = useMemo(() => {
    return Object.entries(studentTypeData)
      .map(([name, value]) => ({
        name,
        value
      }))
      .filter(item => item.value > 0);
  }, [studentTypeData]);

  // Status calculations
  const statusData = useMemo(() => {
    return filteredData.reduce((acc, student) => {
      const status = student.Status_Value || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  }, [filteredData]);

  const statusChartData = useMemo(() => {
    return Object.entries(statusData)
      .map(([name, value]) => ({
        name,
        value
      }))
      .filter(item => item.value > 0);
  }, [statusData]);

  // Calculate unique student data
  const studentAnalysis = useMemo(() => {
    const studentMap = new Map();

    filteredData.forEach(student => {
      const emailKey = student.StudentEmail;
      if (!studentMap.has(emailKey)) {
        studentMap.set(emailKey, {
          email: emailKey,
          courseCount: 1,
          courses: [student.CourseID],
          studentType: student.StudentType_Value,
          status: student.Status_Value
        });
      } else {
        const existingStudent = studentMap.get(emailKey);
        if (!existingStudent.courses.includes(student.CourseID)) {
          existingStudent.courseCount++;
          existingStudent.courses.push(student.CourseID);
        }
      }
    });

    // Calculate course load distribution
    const courseLoadDistribution = Array.from(studentMap.values()).reduce((acc, student) => {
      const count = student.courseCount;
      acc[count] = (acc[count] || 0) + 1;
      return acc;
    }, {});

    return {
      uniqueStudentCount: studentMap.size,
      courseLoadData: Object.entries(courseLoadDistribution)
        .map(([courses, count]) => ({
          name: `${courses} ${parseInt(courses) === 1 ? 'Course' : 'Courses'}`,
          value: count
        }))
        .sort((a, b) => parseInt(a.name) - parseInt(b.name))
    };
  }, [filteredData]);

  return (
    <div className="space-y-8">

  {/* Course Enrollments - Full Width */}
  {courseEnrollmentData.length > 0 && (
        <Card>
          <CardHeader className="flex flex-col space-y-2">
            <div className="flex flex-row items-center justify-between">
              <CardTitle>Course Enrollments</CardTitle>
              <div className="text-sm font-medium text-muted-foreground">
                Total Enrollments: {courseEnrollmentData.reduce((total, item) => total + item.count, 0)}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Note: Excludes students with status "✗ Removed (Not Funded)"
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseEnrollmentData}>
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    tick={{
                      dy: 10
                    }}
                  />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar 
                    dataKey="count" 
                    fill="#3b82f6" 
                    onClick={(data) => handleChartClick(data, 'course')}
                    cursor="pointer"
                    background={{ fill: "transparent" }}
                    minPointSize={2}
                  >
                    {courseEnrollmentData.map((entry, index) => (
                      <Cell 
                        key={`cell-course-${index}`}
                        fill="#3b82f6"
                        className="hover:fill-blue-400"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}


      {/* School Enrollments Summary */}
      <Card>
        <CardHeader className="flex flex-col space-y-2">
          <div className="flex flex-row items-center justify-between">
            <CardTitle>School Enrollments</CardTitle>
            <div className="text-sm font-medium text-muted-foreground">
              Unique Students: {studentAnalysis.uniqueStudentCount}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Note: Excludes students with status "✗ Removed (Not Funded)"
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Course Load Distribution */}
            <div className="h-[300px]">
              <h3 className="text-sm font-semibold mb-4">Course Load Distribution</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentAnalysis.courseLoadData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-2 border rounded shadow-sm">
                            <p>{data.name}</p>
                            <p>{data.value} student{data.value !== 1 ? 's' : ''}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#3b82f6"
                    onClick={(data) => handleChartClick(data, 'courseLoad')}
                    cursor="pointer"
                  >
                    {studentAnalysis.courseLoadData.map((entry, index) => (
                      <Cell 
                        key={`cell-courseLoad-${index}`}
                        fill="#3b82f6"
                        className="hover:fill-blue-400"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           
            </div>
          </div>
        </CardContent>
      </Card>

    

      {/* Pie Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {/* Student Type Distribution */}
        {studentTypeChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Student Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={studentTypeChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label={({ name, value }) => `${name}: ${value}`}
                      onClick={(data) => handleChartClick(data, 'studentType')}
                      cursor="pointer"
                    >
                      {studentTypeChartData.map((entry, index) => (
                        <Cell key={`cell-studentType-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Distribution */}
        {statusChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label={({ name, value }) => `${name}: ${value}`}
                      onClick={(data) => handleChartClick(data, 'status')}
                      cursor="pointer"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-status-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <StudentDetailsDialog 
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        students={selectedStudents}
        filterType={filterInfo.type}
        filterValue={filterInfo.value}
      />
    </div>
  );
};

export default EnrollmentCharts;
