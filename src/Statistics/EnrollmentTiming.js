import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';
import { format, parseISO, addMonths, isBefore } from 'date-fns';
import StudentDetailsDialog from './StudentDetailsDialog';

const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6'];

const DATA_START_DATE = new Date(2024, 10, 1); // November 2024

const getSchoolYearMonths = (schoolYear) => {
  const [startYearShort] = schoolYear.split('/');
  const startYear = 2000 + parseInt(startYearShort, 10);
  const months = [];
  const startDate = new Date(startYear, 8, 1); // September 1st

  for (let i = 0; i < 12; i++) {
    const date = addMonths(startDate, i);
    // Only include months from November 2024 onwards
    if (!isBefore(date, DATA_START_DATE)) {
      months.push(format(date, 'MMM yyyy'));
    }
  }

  return months;
};

const EnrollmentTiming = ({ summariesData, selectedSchoolYear }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [filterInfo, setFilterInfo] = useState({ type: '', value: '' });

  const processedData = useMemo(() => {
    const filteredData = summariesData.filter(student => 
      student.School_x0020_Year_Value === selectedSchoolYear &&
      student.Created &&
      !isBefore(parseISO(student.Created), DATA_START_DATE)
    );

    const schoolYearMonths = getSchoolYearMonths(selectedSchoolYear);
    
    const enrollmentsByMonth = schoolYearMonths.reduce((acc, month) => {
      acc[month] = {
        month,
        total: 0,
        byType: {},
        withAge: 0,
        totalAge: 0,
        ageGroups: {
          'Under 18': 0,
          '18-24': 0,
          '25-34': 0,
          '35+': 0,
          'Unknown': 0
        },
        averageAge: 0
      };
      return acc;
    }, {});

    filteredData.forEach(student => {
      const enrollmentDate = parseISO(student.Created);
      const monthKey = format(enrollmentDate, 'MMM yyyy');
      
      if (!enrollmentsByMonth[monthKey]) return;

      const monthData = enrollmentsByMonth[monthKey];
      
      monthData.total += 1;
      
      const studentType = student.StudentType_Value || 'Unknown';
      monthData.byType[studentType] = (monthData.byType[studentType] || 0) + 1;

      if (student.age) {
        monthData.withAge += 1;
        monthData.totalAge += student.age;
        
        if (student.age < 18) {
          monthData.ageGroups['Under 18'] += 1;
        } else if (student.age <= 24) {
          monthData.ageGroups['18-24'] += 1;
        } else if (student.age <= 34) {
          monthData.ageGroups['25-34'] += 1;
        } else {
          monthData.ageGroups['35+'] += 1;
        }
      } else {
        monthData.ageGroups['Unknown'] += 1;
      }

      if (monthData.withAge > 0) {
        monthData.averageAge = monthData.totalAge / monthData.withAge;
      }
    });

    return schoolYearMonths.map(month => enrollmentsByMonth[month]);
  }, [summariesData, selectedSchoolYear]);

  const handleDataClick = (data, type, ageGroup = null) => {
    let filteredStudents = [];
    let filterValue = '';

    const baseFilter = student => 
      student.School_x0020_Year_Value === selectedSchoolYear &&
      student.Created &&
      !isBefore(parseISO(student.Created), DATA_START_DATE);

    switch(type) {
      case 'month':
        filteredStudents = summariesData.filter(student => {
          if (!baseFilter(student)) return false;
          return format(parseISO(student.Created), 'MMM yyyy') === data.month;
        });
        filterValue = `Enrolled in ${data.month}`;
        break;
      case 'age-group':
        filteredStudents = summariesData.filter(student => {
          if (!baseFilter(student)) return false;
          if (format(parseISO(student.Created), 'MMM yyyy') !== data.month) return false;

          if (ageGroup === 'Unknown') {
            return !student.age;
          }
          
          const age = student.age;
          if (!age) return false;
          
          switch (ageGroup) {
            case 'Under 18': return age < 18;
            case '18-24': return age >= 18 && age <= 24;
            case '25-34': return age >= 25 && age <= 34;
            case '35+': return age >= 35;
            default: return false;
          }
        });
        filterValue = `${ageGroup} enrolled in ${data.month}`;
        break;
      default:
        break;
    }

    setSelectedStudents(filteredStudents);
    setFilterInfo({ type: 'Enrollment', value: filterValue });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Monthly Enrollment Trends */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Monthly Enrollment Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processedData}>
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2 border rounded shadow-sm">
                          <p className="font-medium">{data.month}</p>
                          <p>Enrollments: {data.total}</p>
                          {Object.entries(data.byType).map(([type, count]) => (
                            <p key={type}>{type}: {count}</p>
                          ))}
                          {data.withAge > 0 && (
                            <p>Average Age: {data.averageAge.toFixed(1)}*</p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="total"
                  fill="#3b82f6"
                  onClick={(data) => handleDataClick(data, 'month')}
                  cursor="pointer"
                >
                  {processedData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill="#3b82f6"
                      className="hover:fill-blue-400"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            * Age data is available for some students only
          </p>
        </CardContent>
      </Card>

      {/* Age Distribution by Month */}
      <Card>
        <CardHeader>
          <CardTitle>Age Distribution by Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processedData}>
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const ageGroup = payload[0].dataKey;
                      return (
                        <div className="bg-white p-2 border rounded shadow-sm">
                          <p className="font-medium">{data.month}</p>
                          <p>{ageGroup.split('.')[1]}: {data.ageGroups[ageGroup.split('.')[1]]}</p>
                          <p>Click to see student details</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {Object.keys(processedData[0]?.ageGroups || {}).map((group, index) => (
                  <Bar
                    key={group}
                    dataKey={`ageGroups.${group}`}
                    stackId="age"
                    fill={COLORS[index % COLORS.length]}
                    onClick={(data) => handleDataClick(data, 'age-group', group)}
                    cursor="pointer"
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            {Object.keys(processedData[0]?.ageGroups || {}).map((group, index) => (
              <div key={group} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm">{group}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Age distributions are shown where data is available. "Unknown" indicates no age data.
          </p>
        </CardContent>
      </Card>

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

export default EnrollmentTiming;
