import React, { useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "../components/ui/card";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter,
  SheetClose
} from "../components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  BarChart4, 
  PieChart as PieChartIcon, 
  LineChart as LineChartIcon, 
  Calendar, 
  Award, 
  BookOpen, 
  Users, 
  Clock, 
  AlertTriangle, 
  Check, 
  X, 
  Layers,
  Download,
  FileText,
  TrendingUp
} from 'lucide-react';

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString || dateString === 'N/A') return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

// Helper function to normalize school year format
const normalizeSchoolYear = (schoolYear) => {
  // Handle null, undefined, or non-string values
  if (!schoolYear || typeof schoolYear !== 'string') {
    console.warn('Invalid schoolYear provided to normalizeSchoolYear:', schoolYear);
    return { startYear: 2024, endYear: 2025 };
  }
  
  // Handle both formats: "24/25" and "2024-2025"
  if (schoolYear.includes('/')) {
    const [start, end] = schoolYear.split('/');
    const startYear = 2000 + parseInt(start);
    const endYear = 2000 + parseInt(end);
    return { startYear, endYear };
  } else if (schoolYear.includes('-')) {
    const [startYear, endYear] = schoolYear.split('-').map(y => parseInt(y));
    return { startYear, endYear };
  }
  
  // Fallback for unexpected formats
  console.warn('Unexpected schoolYear format:', schoolYear);
  return { startYear: 2024, endYear: 2025 };
};

// Helper function to get school year month from ISO timestamp
const getSchoolYearMonth = (dateString, schoolYear) => {
  if (!dateString || dateString === 'N/A') return null;
  
  try {
    // Handle ISO timestamp format like "2025-06-23T12:05:09.632Z"
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    
    const month = date.getMonth(); // 0-11 (Jan=0, Feb=1, ..., Dec=11)
    const year = date.getFullYear();
    
    // Extract school year start and end years
    const { startYear, endYear } = normalizeSchoolYear(schoolYear);
    
    // School year months: Sep, Oct, Nov, Dec (startYear), Jan, Feb, Mar, Apr, May, Jun, Jul, Aug (endYear)
    if (month >= 8) { // Sep-Dec (months 8-11: September=8, October=9, November=10, December=11)
      if (year === startYear) {
        return `${date.toLocaleString('default', { month: 'short' })} ${year}`;
      }
    } else { // Jan-Aug (months 0-7: January=0, February=1, ..., August=7)
      if (year === endYear) {
        return `${date.toLocaleString('default', { month: 'short' })} ${year}`;
      }
    }
    
    return null; // Date doesn't fall within the specified school year
  } catch (error) {
    console.error("Error extracting school year month:", error, dateString);
    return null;
  }
};

// Helper function to generate all school year months for x-axis display
const generateAllSchoolYearMonths = (schoolYear) => {
  const { startYear, endYear } = normalizeSchoolYear(schoolYear);
  
  return [
    { label: `Sep ${startYear}`, order: 1, month: 8, year: startYear },
    { label: `Oct ${startYear}`, order: 2, month: 9, year: startYear },
    { label: `Nov ${startYear}`, order: 3, month: 10, year: startYear },
    { label: `Dec ${startYear}`, order: 4, month: 11, year: startYear },
    { label: `Jan ${endYear}`, order: 5, month: 0, year: endYear },
    { label: `Feb ${endYear}`, order: 6, month: 1, year: endYear },
    { label: `Mar ${endYear}`, order: 7, month: 2, year: endYear },
    { label: `Apr ${endYear}`, order: 8, month: 3, year: endYear },
    { label: `May ${endYear}`, order: 9, month: 4, year: endYear },
    { label: `Jun ${endYear}`, order: 10, month: 5, year: endYear },
    { label: `Jul ${endYear}`, order: 11, month: 6, year: endYear },
    { label: `Aug ${endYear}`, order: 12, month: 7, year: endYear }
  ];
};

// Helper function to generate school year months up to current date with daily positioning
const generateSchoolYearMonths = (schoolYear) => {
  const { startYear, endYear } = normalizeSchoolYear(schoolYear);
  const today = new Date();
  const currentMonth = today.getMonth(); // 0-11
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();
  
  const allMonths = generateAllSchoolYearMonths(schoolYear);
  
  // Filter to only include months up to and including the current month
  const monthsUpToToday = allMonths.filter(monthData => {
    if (monthData.year < currentYear) {
      return true; // All months from previous years
    } else if (monthData.year === currentYear) {
      return monthData.month <= currentMonth; // Only months up to current month in current year
    }
    return false; // No future months
  });
  
  // Add fractional positioning for current month
  const monthsWithPositioning = monthsUpToToday.map((monthData, index) => {
    const isCurrentMonth = monthData.year === currentYear && monthData.month === currentMonth;
    
    if (isCurrentMonth) {
      // Calculate the fractional position within the current month
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const fractionOfMonth = currentDay / daysInMonth;
      
      return {
        ...monthData,
        order: monthData.order - 1 + fractionOfMonth, // Adjust order to position within month
        isCurrentMonth: true,
        dayProgress: `${currentDay}/${daysInMonth}`
      };
    }
    
    return monthData;
  });
  
  return { 
    dataMonths: monthsWithPositioning,
    allMonths: allMonths
  };
};

// Helper for color generation
const COLORS = [
  '#4f46e5', '#0284c7', '#0891b2', '#059669', '#65a30d', 
  '#ca8a04', '#dc2626', '#9333ea', '#db2777', '#475569'
];

// Main component
const PASIAnalyticsV2 = ({ records, isOpen, onClose, selectedSchoolYear = '2024-2025' }) => {
  // Calculate all analytics data
  const analytics = useMemo(() => {
    if (!records || records.length === 0) {
      return {
        totalRecords: 0,
        statusDistribution: [],
        termDistribution: [],
        courseDistribution: [],
        courseCountsRaw: {},
        schoolYearRegistrationTrends: [],
        allSchoolYearMonths: generateAllSchoolYearMonths(selectedSchoolYear || '2024-2025'),
        grades: {
          hasGrade: 0,
          noGrade: 0,
          averageGrade: 0,
          gradeDistribution: []
        },
        multipleRecords: {
          withMultiple: 0,
          withoutMultiple: 0
        },
        workItemsDistribution: [],
        summaryStats: {
          activeCount: 0,
          completedCount: 0,
          pendingCount: 0,
          recentlyRegistered: 0
        },
        studentTypes: {
          distribution: [],
          statusByType: {},
          countsByType: {}
        }
      };
    }
    
    // Counts and distributions
    const statusCounts = {};
    const termCounts = {};
    const courseCounts = {};
    const workItemsCounts = {};
    const schoolYearRegistrationCounts = {};
    const gradeValues = [];
    const numericGrades = [];
    
    // Student type tracking
    const studentTypeCounts = {};
    const studentTypeStatusCounts = {};
    
    let withMultipleRecordsCount = 0;
    let withoutMultipleRecordsCount = 0;
    
    let activeCount = 0;
    let completedCount = 0;
    let pendingCount = 0;
    let recentlyRegisteredCount = 0;
    
    // Last 30 days timestamp for recent registrations
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Debug: log processing info
    console.log(`Processing ${records.length} records for school year ${selectedSchoolYear}`);
    console.log('Sample record Created dates:', records.slice(0, 3).map(r => r.Created));
    
    // Process each record
    records.forEach(record => {
      // Status counts
      if (record.status) {
        statusCounts[record.status] = (statusCounts[record.status] || 0) + 1;
        
        // For summary stats
        if (record.status === 'Active') activeCount++;
        else if (record.status === 'Completed') completedCount++;
        else pendingCount++;
      }
      
      // Term counts
      const term = record.term || record.pasiTerm;
      if (term) {
        termCounts[term] = (termCounts[term] || 0) + 1;
      }
      
      // Course counts
      if (record.courseCode) {
        courseCounts[record.courseCode] = (courseCounts[record.courseCode] || 0) + 1;
      }
      
      // Work items counts
      if (record.workItems) {
        workItemsCounts[record.workItems] = (workItemsCounts[record.workItems] || 0) + 1;
      } else {
        workItemsCounts['None'] = (workItemsCounts['None'] || 0) + 1;
      }
      
      // Grade data
      if (record.value && record.value !== '-' && record.value !== 'N/A') {
        gradeValues.push(record.value);
        
        // Try to extract numeric grade for average calculation
        const numericGrade = parseFloat(record.value);
        if (!isNaN(numericGrade)) {
          numericGrades.push(numericGrade);
        }
      }
      
      // School year registration trends - using Created field for registration date
      if (record.Created) {
        // Check if recent registration (last 30 days)
        try {
          const regDate = new Date(record.Created);
          if (regDate > thirtyDaysAgo) {
            recentlyRegisteredCount++;
          }
          
          // Group by school year month for trend chart
          const schoolYearMonth = getSchoolYearMonth(record.Created, selectedSchoolYear);
          if (schoolYearMonth) {
            schoolYearRegistrationCounts[schoolYearMonth] = (schoolYearRegistrationCounts[schoolYearMonth] || 0) + 1;
          } else {
            // Debug: log dates that don't match the school year
            console.log(`Date ${record.Created} doesn't match school year ${selectedSchoolYear}`, {
              date: new Date(record.Created),
              month: new Date(record.Created).getMonth(),
              year: new Date(record.Created).getFullYear(),
              schoolYear: selectedSchoolYear
            });
          }
        } catch (error) {
          console.error("Error processing registration date:", error, record.Created);
        }
      }
      
      // Multiple records counter
      if (record.hasMultipleRecords) {
        withMultipleRecordsCount++;
      } else {
        withoutMultipleRecordsCount++;
      }
      
      // Student Type analytics
      const studentType = record.StudentType_Value || record.studentType_Value || record.studentType || 'Unknown';
      if (studentType) {
        // Count by student type
        studentTypeCounts[studentType] = (studentTypeCounts[studentType] || 0) + 1;
        
        // Track status counts by student type
        if (record.status) {
          if (!studentTypeStatusCounts[studentType]) {
            studentTypeStatusCounts[studentType] = {};
          }
          studentTypeStatusCounts[studentType][record.status] = 
            (studentTypeStatusCounts[studentType][record.status] || 0) + 1;
        }
      }
    });
    
    // Calculate average grade
    const averageGrade = numericGrades.length > 0 
      ? (numericGrades.reduce((sum, grade) => sum + grade, 0) / numericGrades.length).toFixed(1)
      : 0;
    
    // Transform into arrays for charts
    
    // Status distribution for pie chart
    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count
    }));
    
    // Term distribution for bar chart
    const termDistribution = Object.entries(termCounts)
      .sort((a, b) => b[1] - a[1]) // Sort by count descending
      .slice(0, 10) // Top 10 terms
      .map(([term, count]) => ({
        name: term,
        count
      }));
    
    // Course distribution for bar chart
    const courseDistribution = Object.entries(courseCounts)
      .sort((a, b) => b[1] - a[1]) // Sort by count descending
      .slice(0, 10) // Top 10 courses
      .map(([course, count]) => ({
        name: course,
        count
      }));
    
    // School year registration trends - NEW FEATURE
    const schoolYearData = generateSchoolYearMonths(selectedSchoolYear);
    const schoolYearRegistrationTrends = schoolYearData.dataMonths.map(month => ({
      month: month.label,
      order: month.order,
      count: schoolYearRegistrationCounts[month.label] || 0,
      isCurrentMonth: month.isCurrentMonth || false,
      dayProgress: month.dayProgress || null
    }));
    
    // All months for x-axis display (including future months)
    const allSchoolYearMonths = schoolYearData.allMonths;
    
    // Work items distribution for pie chart
    const workItemsDistribution = Object.entries(workItemsCounts).map(([type, count]) => ({
      name: type,
      value: count
    }));
    
    // Grade distribution data
    const hasGradeCount = gradeValues.length;
    const noGradeCount = records.length - hasGradeCount;
    
    // Create grade ranges distribution
    const gradeRanges = {
      '90-100': 0,
      '80-89': 0,
      '70-79': 0,
      '60-69': 0,
      '50-59': 0,
      'Below 50': 0,
      'Non-numeric': 0
    };
    
    numericGrades.forEach(grade => {
      if (grade >= 90) gradeRanges['90-100']++;
      else if (grade >= 80) gradeRanges['80-89']++;
      else if (grade >= 70) gradeRanges['70-79']++;
      else if (grade >= 60) gradeRanges['60-69']++;
      else if (grade >= 50) gradeRanges['50-59']++;
      else gradeRanges['Below 50']++;
    });
    
    // Count non-numeric grades
    gradeRanges['Non-numeric'] = gradeValues.length - numericGrades.length;
    
    // Format for chart
    const gradeDistribution = Object.entries(gradeRanges)
      .filter(([range, count]) => count > 0) // Only include ranges with values
      .map(([range, count]) => ({
        name: range,
        count
      }));
    
    // Student type distribution for charts
    const studentTypeDistribution = Object.entries(studentTypeCounts)
      .sort((a, b) => b[1] - a[1]) // Sort by count descending
      .map(([type, count]) => ({
        name: type,
        value: count
      }));
    
    return {
      totalRecords: records.length,
      statusDistribution,
      termDistribution,
      courseDistribution,
      courseCountsRaw: courseCounts,
      schoolYearRegistrationTrends, // NEW: School year focused registration trends (data only)
      allSchoolYearMonths, // NEW: All months for x-axis display
      grades: {
        hasGrade: hasGradeCount,
        noGrade: noGradeCount,
        averageGrade,
        gradeDistribution
      },
      multipleRecords: {
        withMultiple: withMultipleRecordsCount,
        withoutMultiple: withoutMultipleRecordsCount
      },
      workItemsDistribution,
      summaryStats: {
        activeCount,
        completedCount,
        pendingCount,
        recentlyRegistered: recentlyRegisteredCount
      },
      studentTypes: {
        distribution: studentTypeDistribution,
        statusByType: studentTypeStatusCounts,
        countsByType: studentTypeCounts
      }
    };
  }, [records, selectedSchoolYear]);
  
  // Download data as CSV
  const downloadCSV = () => {
    if (!records || records.length === 0) return;
    
    // Create CSV content with key headers
    const headers = [
      'ASN',
      'Student Name',
      'Course Code',
      'Status',
      'Student Type',
      'Created Date',
      'Start Date',
      'Term',
      'Grade',
      'Credits Attempted',
      'School Year'
    ].join(',');
    
    const rows = records.map(record => {
      const escapeCSV = (value) => {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };
      
      return [
        record.asn || '',
        escapeCSV(record.studentName),
        record.courseCode || '',
        escapeCSV(record.status),
        escapeCSV(record.StudentType_Value || record.studentType || ''),
        record.Created || '',
        record.startDate || record.startDateFormatted || '',
        record.term || record.pasiTerm || '',
        record.value || '',
        record.creditsAttempted || '',
        escapeCSV(record.schoolYear || selectedSchoolYear)
      ].join(',');
    });
    
    const csvContent = [headers, ...rows].join('\n');
    
    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pasi-analytics-export-${selectedSchoolYear}-${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full md:max-w-[90%] sm:max-w-full overflow-y-auto" side="right">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="text-lg flex items-center">
            <BarChart4 className="mr-2 h-5 w-5" /> PASI Analytics Dashboard
          </SheetTitle>
          <SheetDescription>
            Analysis of {analytics.totalRecords} PASI records for {selectedSchoolYear} school year
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-4 space-y-6">
          {/* Summary Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Active Records</p>
                    <h3 className="text-2xl font-bold text-blue-800">{analytics.summaryStats.activeCount}</h3>
                  </div>
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  {analytics.totalRecords ? ((analytics.summaryStats.activeCount / analytics.totalRecords) * 100).toFixed(1) : 0}% of total
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700 font-medium">Completed</p>
                    <h3 className="text-2xl font-bold text-green-800">{analytics.summaryStats.completedCount}</h3>
                  </div>
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  {analytics.totalRecords ? ((analytics.summaryStats.completedCount / analytics.totalRecords) * 100).toFixed(1) : 0}% of total
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-700 font-medium">With Grades</p>
                    <h3 className="text-2xl font-bold text-amber-800">{analytics.grades.hasGrade}</h3>
                  </div>
                  <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <Award className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
                <p className="text-xs text-amber-600 mt-1">
                  {analytics.grades.averageGrade > 0 ? `Avg: ${analytics.grades.averageGrade}` : 'No numeric grades'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-700 font-medium">Recent (30d)</p>
                    <h3 className="text-2xl font-bold text-purple-800">{analytics.summaryStats.recentlyRegistered}</h3>
                  </div>
                  <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-xs text-purple-600 mt-1">
                  {analytics.totalRecords ? ((analytics.summaryStats.recentlyRegistered / analytics.totalRecords) * 100).toFixed(1) : 0}% of total
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Tabs for different chart views */}
          <Tabs defaultValue="registration" className="w-full">
            <TabsList className="w-full justify-start flex-wrap border-b pb-px">
              <TabsTrigger value="registration" className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" /> Registration Trends
              </TabsTrigger>
              <TabsTrigger value="overview" className="flex items-center">
                <PieChartIcon className="h-4 w-4 mr-1" /> Overview
              </TabsTrigger>
              <TabsTrigger value="courses" className="flex items-center">
                <BookOpen className="h-4 w-4 mr-1" /> Courses
              </TabsTrigger>
              <TabsTrigger value="grades" className="flex items-center">
                <Award className="h-4 w-4 mr-1" /> Grades
              </TabsTrigger>
              <TabsTrigger value="studenttypes" className="flex items-center">
                <Users className="h-4 w-4 mr-1" /> Student Types
              </TabsTrigger>
            </TabsList>
            
            {/* Registration Trends Tab - FEATURED NEW TAB */}
            <TabsContent value="registration" className="mt-4 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Registration Trends by School Year Month</CardTitle>
                  <CardDescription>When students register throughout the {selectedSchoolYear} school year (up to {new Date().toLocaleDateString()}) based on Created date</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={analytics.schoolYearRegistrationTrends}
                        margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          type="number"
                          dataKey="order"
                          domain={[1, 12]}
                          tickFormatter={(value) => {
                            // Find the month data for this order value from all months
                            const monthData = analytics.allSchoolYearMonths.find(m => 
                              Math.abs(m.order - value) < 0.1
                            );
                            return monthData ? monthData.label : '';
                          }}
                          ticks={analytics.allSchoolYearMonths.map(m => m.order)}
                          angle={-45} 
                          textAnchor="end" 
                          height={80}
                          fontSize={12}
                        />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name, props) => {
                            const data = props.payload;
                            const result = [value, 'Registrations'];
                            if (data.isCurrentMonth) {
                              result.push(`Current month progress: ${data.dayProgress}`);
                            }
                            return result;
                          }}
                          labelFormatter={(label, payload) => {
                            if (payload && payload[0]) {
                              const data = payload[0].payload;
                              return data.isCurrentMonth 
                                ? `${data.month} (through day ${data.dayProgress})`
                                : `Month: ${data.month}`;
                            }
                            return `Month: ${label}`;
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="count" 
                          name="Registrations" 
                          stroke="#0891b2" 
                          strokeWidth={3} 
                          dot={(props) => {
                            const { cx, cy, payload } = props;
                            return (
                              <circle 
                                cx={cx} 
                                cy={cy} 
                                r={payload.isCurrentMonth ? 8 : 6} 
                                fill={payload.isCurrentMonth ? "#f59e0b" : "#0891b2"}
                                stroke={payload.isCurrentMonth ? "#d97706" : "#0891b2"}
                                strokeWidth={payload.isCurrentMonth ? 3 : 2}
                              />
                            );
                          }}
                          activeDot={{ r: 8, stroke: "#0891b2", strokeWidth: 2 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 text-center">
                    Data through {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • Line ends at current position (day {new Date().getDate()}) • Future months shown for context
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-cyan-50 border-cyan-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-cyan-800">Peak Registration Month</h3>
                      <Badge className="bg-cyan-100 text-cyan-800 border-cyan-300">
                        {selectedSchoolYear}
                      </Badge>
                    </div>
                    <div className="flex items-center">
                      <div className="h-16 w-16 bg-cyan-100 rounded-full flex items-center justify-center mr-4">
                        <Calendar className="h-8 w-8 text-cyan-600" />
                      </div>
                      <div>
                        {analytics.schoolYearRegistrationTrends.length > 0 ? (
                          <>
                            <p className="text-lg font-bold text-cyan-800">
                              {analytics.schoolYearRegistrationTrends.reduce((max, month) => 
                                month.count > max.count ? month : max, 
                                analytics.schoolYearRegistrationTrends[0]
                              ).month}
                            </p>
                            <p className="text-sm text-cyan-600">
                              {analytics.schoolYearRegistrationTrends.reduce((max, month) => 
                                month.count > max.count ? month : max, 
                                analytics.schoolYearRegistrationTrends[0]
                              ).count} registrations
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-cyan-600">No data available</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-indigo-50 border-indigo-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-indigo-800">Total School Year Registrations</h3>
                    </div>
                    <div className="flex items-center">
                      <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                        <Users className="h-8 w-8 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-indigo-800">
                          {analytics.schoolYearRegistrationTrends.reduce((sum, month) => sum + month.count, 0)}
                        </p>
                        <p className="text-sm text-indigo-600">
                          From Sep {normalizeSchoolYear(selectedSchoolYear).startYear} to {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Distribution */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analytics.statusDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {analytics.statusDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [value, 'Records']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Term Distribution */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Term Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={analytics.termDistribution}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="name" width={55} />
                          <Tooltip formatter={(value) => [value, 'Records']} />
                          <Bar dataKey="count" fill="#4f46e5" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Courses Tab */}
            <TabsContent value="courses" className="mt-4 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Course Distribution (Top 10)</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analytics.courseDistribution}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={90} />
                        <Tooltip formatter={(value) => [value, 'Records']} />
                        <Bar dataKey="count" fill="#0284c7">
                          {analytics.courseDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Grades Tab */}
            <TabsContent value="grades" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Grade Status</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'With Grade', value: analytics.grades.hasGrade },
                              { name: 'No Grade', value: analytics.grades.noGrade }
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={70}
                            dataKey="value"
                          >
                            <Cell fill="#0891b2" />
                            <Cell fill="#94a3b8" />
                          </Pie>
                          <Tooltip formatter={(value) => [value, 'Records']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-teal-50 border-teal-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-teal-800">Grade Statistics</h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-teal-800">Average Grade</p>
                        <p className="text-3xl font-bold text-teal-700 mt-1">{analytics.grades.averageGrade}</p>
                      </div>
                      <div className="h-16 w-16 bg-teal-100 rounded-full flex items-center justify-center">
                        <Award className="h-8 w-8 text-teal-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {analytics.grades.gradeDistribution.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Grade Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={analytics.grades.gradeDistribution}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => [value, 'Records']} />
                          <Bar dataKey="count" name="Number of Records" fill="#10b981">
                            {analytics.grades.gradeDistribution.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={
                                  entry.name === '90-100' ? '#10b981' :  // Green
                                  entry.name === '80-89' ? '#14b8a6' :   // Teal
                                  entry.name === '70-79' ? '#0ea5e9' :   // Blue
                                  entry.name === '60-69' ? '#6366f1' :   // Indigo
                                  entry.name === '50-59' ? '#8b5cf6' :   // Violet
                                  entry.name === 'Below 50' ? '#ef4444' : // Red
                                  '#94a3b8'                              // Gray for non-numeric
                                } 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* Student Types Tab */}
            <TabsContent value="studenttypes" className="mt-4 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Student Type Distribution</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.studentTypes.distribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analytics.studentTypes.distribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value, 'Records']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <SheetFooter className="mt-6 border-t pt-4 flex flex-row justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={downloadCSV}
            disabled={!analytics.totalRecords}
          >
            <Download className="h-4 w-4 mr-1" /> Export Analytics Data
          </Button>
          <SheetClose asChild>
            <Button variant="secondary" size="sm">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default PASIAnalyticsV2;