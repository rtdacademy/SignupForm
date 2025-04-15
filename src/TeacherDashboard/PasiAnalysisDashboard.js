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
  FileText
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

// Helper function to extract month and year from date
const getMonthYear = (dateString) => {
  if (!dateString || dateString === 'N/A') return null;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    
    return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
  } catch (error) {
    console.error("Error extracting month/year:", error);
    return null;
  }
};

// Helper for color generation
const COLORS = [
  '#4f46e5', '#0284c7', '#0891b2', '#059669', '#65a30d', 
  '#ca8a04', '#dc2626', '#9333ea', '#db2777', '#475569'
];

// Main component
const PasiAnalysisDashboard = ({ records, isOpen, onClose }) => {
  // Calculate all analytics data
  const analytics = useMemo(() => {
    if (!records || records.length === 0) {
      return {
        totalRecords: 0,
        statusDistribution: [],
        termDistribution: [],
        courseDistribution: [],
        courseCountsRaw: {},
        registrationTrends: [],
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
        }
      };
    }
    
    // Counts and distributions
    const statusCounts = {};
    const termCounts = {};
    const courseCounts = {};
    const workItemsCounts = {};
    const registrationDateCounts = {};
    const gradeValues = [];
    const numericGrades = [];
    
    let withMultipleRecordsCount = 0;
    let withoutMultipleRecordsCount = 0;
    
    let activeCount = 0;
    let completedCount = 0;
    let pendingCount = 0;
    let recentlyRegisteredCount = 0;
    
    // Last 30 days timestamp for recent registrations
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
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
      
      // Registration date trends
      if (record.startDateFormatted && record.startDateFormatted !== 'N/A') {
        // Check if recent registration (last 30 days)
        try {
          const regDate = new Date(record.startDateFormatted);
          if (regDate > thirtyDaysAgo) {
            recentlyRegisteredCount++;
          }
          
          // Group by month-year for trend chart
          const monthYear = getMonthYear(record.startDateFormatted);
          if (monthYear) {
            registrationDateCounts[monthYear] = (registrationDateCounts[monthYear] || 0) + 1;
          }
        } catch (error) {
          console.error("Error processing registration date:", error);
        }
      }
      
      // Multiple records counter
      if (record.hasMultipleRecords) {
        withMultipleRecordsCount++;
      } else {
        withoutMultipleRecordsCount++;
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
    
    // Registration trends for line chart
    const registrationTrendsUnsorted = Object.entries(registrationDateCounts).map(([monthYear, count]) => ({
      month: monthYear,
      count
    }));
    
    // Sort the registration trends by date
    const registrationTrends = registrationTrendsUnsorted.sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA - dateB;
    });
    
    // Work items distribution for pie chart
    const workItemsDistribution = Object.entries(workItemsCounts).map(([type, count]) => ({
      name: type,
      value: count
    }));
    
    // Grade distribution data
    const hasGradeCount = gradeValues.length;
    const noGradeCount = records.length - hasGradeCount;
    
    // Create grade ranges distribution (e.g., 90-100, 80-89, etc.)
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
    
    return {
      totalRecords: records.length,
      statusDistribution,
      termDistribution,
      courseDistribution,
      courseCountsRaw: courseCounts,
      registrationTrends,
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
      }
    };
  }, [records]);
  
  // Download data as CSV
  const downloadCSV = () => {
    if (!records || records.length === 0) return;
    
    // Create CSV content
    const headers = [
      'ASN', 
      'Student Name', 
      'Course Code', 
      'Status', 
      'Term', 
      'Grade', 
      'Registration Date', 
      'Exit Date',
      'Work Items'
    ].join(',');
    
    const rows = records.map(record => [
      record.asn || '',
      `"${record.studentName || ''}"`, // Wrap in quotes to handle commas in names
      record.courseCode || '',
      record.status || '',
      record.term || record.pasiTerm || '',
      record.value || '',
      record.startDateFormatted || '',
      record.exitDateFormatted || '',
      record.workItems || ''
    ].join(','));
    
    const csvContent = [headers, ...rows].join('\n');
    
    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pasi-records-export-${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Generate report text
  const generateReport = () => {
    if (!records || records.length === 0) return "";
    
    const report = `
# PASI Records Analysis Report
Generated: ${new Date().toLocaleString()}

## Summary Statistics
- Total Records: ${analytics.totalRecords}
- Active Records: ${analytics.summaryStats.activeCount} (${((analytics.summaryStats.activeCount / analytics.totalRecords) * 100).toFixed(1)}%)
- Completed Records: ${analytics.summaryStats.completedCount} (${((analytics.summaryStats.completedCount / analytics.totalRecords) * 100).toFixed(1)}%)
- Other Status: ${analytics.summaryStats.pendingCount} (${((analytics.summaryStats.pendingCount / analytics.totalRecords) * 100).toFixed(1)}%)
- Records with Grades: ${analytics.grades.hasGrade} (${((analytics.grades.hasGrade / analytics.totalRecords) * 100).toFixed(1)}%)
- Records with Multiple Entries: ${analytics.multipleRecords.withMultiple} (${((analytics.multipleRecords.withMultiple / analytics.totalRecords) * 100).toFixed(1)}%)
- Recent Registrations (Last 30 Days): ${analytics.summaryStats.recentlyRegistered}

## Course Distribution
${Object.entries(analytics.courseCountsRaw)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15)
  .map(([course, count]) => `- ${course}: ${count} records (${((count / analytics.totalRecords) * 100).toFixed(1)}%)`)
  .join('\n')}

## Term Distribution
${analytics.termDistribution
  .map(item => `- ${item.name}: ${item.count} records (${((item.count / analytics.totalRecords) * 100).toFixed(1)}%)`)
  .join('\n')}

## Grade Analysis
- Average Grade (Numeric): ${analytics.grades.averageGrade}
- Grade Distribution:
${analytics.grades.gradeDistribution
  .map(item => `  - ${item.name}: ${item.count} records`)
  .join('\n')}

## Work Items Analysis
${analytics.workItemsDistribution
  .map(item => `- ${item.name}: ${item.value} records (${((item.value / analytics.totalRecords) * 100).toFixed(1)}%)`)
  .join('\n')}
`;
    
    // Create text file download
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pasi-analysis-report-${new Date().toISOString().slice(0,10)}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full md:max-w-[800px] sm:max-w-full overflow-y-auto" side="right">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="text-lg flex items-center">
            <BarChart4 className="mr-2 h-5 w-5" /> PASI Records Analysis Dashboard
          </SheetTitle>
          <SheetDescription>
            Analysis of {analytics.totalRecords} PASI records in the current view
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
                    <p className="text-sm text-purple-700 font-medium">Multiple Records</p>
                    <h3 className="text-2xl font-bold text-purple-800">{analytics.multipleRecords.withMultiple}</h3>
                  </div>
                  <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Layers className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-xs text-purple-600 mt-1">
                  {analytics.totalRecords ? ((analytics.multipleRecords.withMultiple / analytics.totalRecords) * 100).toFixed(1) : 0}% of total
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Tabs for different chart views */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start flex-wrap border-b pb-px">
              <TabsTrigger value="overview" className="flex items-center">
                <PieChartIcon className="h-4 w-4 mr-1" /> Overview
              </TabsTrigger>
              <TabsTrigger value="courses" className="flex items-center">
                <BookOpen className="h-4 w-4 mr-1" /> Courses
              </TabsTrigger>
              <TabsTrigger value="registration" className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" /> Registration
              </TabsTrigger>
              <TabsTrigger value="grades" className="flex items-center">
                <Award className="h-4 w-4 mr-1" /> Grades
              </TabsTrigger>
              <TabsTrigger value="workitems" className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" /> Work Items
              </TabsTrigger>
            </TabsList>
            
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
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Registration Trends</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={analytics.registrationTrends}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [value, 'Records']} />
                        <Line type="monotone" dataKey="count" stroke="#4f46e5" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
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
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                  <Users className="h-4 w-4 mr-2" /> Course Enrollment Insights
                </h3>
                <ul className="space-y-2">
                  {analytics.courseDistribution.slice(0, 5).map((course, index) => (
                    <li key={index} className="flex items-center justify-between text-sm">
                      <span className="text-blue-700">{course.name}</span>
                      <div className="flex items-center">
                        <span className="font-medium text-blue-800">{course.count} records</span>
                        <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800 border-blue-300">
                          {analytics.totalRecords ? ((course.count / analytics.totalRecords) * 100).toFixed(1) : 0}%
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
            
            {/* Registration Tab */}
            <TabsContent value="registration" className="mt-4 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Registration Trends Over Time</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={analytics.registrationTrends}
                        margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" angle={-45} textAnchor="end" height={60} />
                        <YAxis />
                        <Tooltip formatter={(value) => [value, 'Registrations']} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="count" 
                          name="Registrations" 
                          stroke="#0891b2" 
                          strokeWidth={2} 
                          dot={{ r: 4 }} 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-cyan-50 border-cyan-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-cyan-800">Recent Registrations</h3>
                      <Badge className="bg-cyan-100 text-cyan-800 border-cyan-300">
                        Last 30 Days
                      </Badge>
                    </div>
                    <div className="flex items-center">
                      <div className="h-16 w-16 bg-cyan-100 rounded-full flex items-center justify-center mr-4">
                        <Calendar className="h-8 w-8 text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-cyan-800">
                          {analytics.summaryStats.recentlyRegistered}
                        </p>
                        <p className="text-sm text-cyan-600">
                          {analytics.totalRecords ? 
                            ((analytics.summaryStats.recentlyRegistered / analytics.totalRecords) * 100).toFixed(1) : 0}% of total records
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Registration Status</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-[160px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Has Multiple Records', value: analytics.multipleRecords.withMultiple },
                              { name: 'Single Record', value: analytics.multipleRecords.withoutMultiple }
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={70}
                            dataKey="value"
                          >
                            <Cell fill="#4f46e5" />
                            <Cell fill="#94a3b8" />
                          </Pie>
                          <Tooltip formatter={(value) => [value, 'Records']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
                    <div className="mt-3 pt-3 border-t border-teal-200">
                      <p className="text-xs text-teal-700 flex items-center">
                        <Check className="h-3 w-3 mr-1" /> 
                        {analytics.grades.hasGrade} records with grades 
                        ({analytics.totalRecords ? ((analytics.grades.hasGrade / analytics.totalRecords) * 100).toFixed(1) : 0}%)
                      </p>
                      <p className="text-xs text-teal-700 flex items-center mt-1">
                        <X className="h-3 w-3 mr-1" /> 
                        {analytics.grades.noGrade} records without grades
                        ({analytics.totalRecords ? ((analytics.grades.noGrade / analytics.totalRecords) * 100).toFixed(1) : 0}%)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
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
            </TabsContent>
            
            {/* Work Items Tab */}
            <TabsContent value="workitems" className="mt-4 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Work Items Distribution</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.workItemsDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analytics.workItemsDistribution.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={
                                entry.name === 'Warning' ? '#f59e0b' :   // Amber for Warning
                                entry.name === 'Advice' ? '#3b82f6' :    // Blue for Advice
                                entry.name === 'Unknown' ? '#8b5cf6' :   // Violet for Unknown
                                entry.name === 'None' ? '#94a3b8' :      // Gray for None
                                COLORS[index % COLORS.length]            // Default colors
                              } 
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value, 'Records']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="bg-amber-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-amber-800 mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" /> Work Items Summary
                </h3>
                <ul className="space-y-2">
                  {analytics.workItemsDistribution.map((item, index) => (
                    <li key={index} className="flex items-center justify-between text-sm">
                      <span className={`
                        ${item.name === 'Warning' ? 'text-amber-700' : ''}
                        ${item.name === 'Advice' ? 'text-blue-700' : ''}
                        ${item.name === 'Unknown' ? 'text-purple-700' : ''}
                        ${item.name === 'None' ? 'text-gray-700' : ''}
                      `}>
                        {item.name}
                      </span>
                      <div className="flex items-center">
                        <span className="font-medium text-amber-800">{item.value} records</span>
                        <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 border-amber-300">
                          {analytics.totalRecords ? ((item.value / analytics.totalRecords) * 100).toFixed(1) : 0}%
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <SheetFooter className="mt-6 border-t pt-4 flex flex-row justify-between">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadCSV}
              disabled={!analytics.totalRecords}
            >
              <Download className="h-4 w-4 mr-1" /> Export CSV
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateReport}
              disabled={!analytics.totalRecords}
            >
              <FileText className="h-4 w-4 mr-1" /> Export Report
            </Button>
          </div>
          <SheetClose asChild>
            <Button variant="secondary" size="sm">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default PasiAnalysisDashboard;