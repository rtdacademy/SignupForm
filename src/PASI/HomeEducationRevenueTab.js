import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Loader2, DollarSign, BookOpen, Users, GraduationCap, AlertTriangle, CheckCircle, XCircle, Download, Info, Home } from 'lucide-react';
import { STATUS_OPTIONS, ALERT_LEVELS } from "../config/DropdownOptions";
import { CSVLink } from "react-csv";

// Memoized card to prevent re-renders
const StatCard = memo(({ className, title, value, subtitle, valueClassName }) => (
  <Card className={className}>
    <CardContent className="pt-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className={`text-3xl font-bold ${valueClassName || ''}`}>
          {value}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {subtitle}
        </p>
      </div>
    </CardContent>
  </Card>
));

// Memoized table component - modified for Home Education
const CourseTable = memo(({ courses, formatCurrency, type = "confirmed" }) => (
  <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Course</TableHead>
          <TableHead>Records</TableHead>
          <TableHead>Unique Students</TableHead>
          <TableHead>{type === "projected" ? "Projected Revenue" : "Revenue"}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courses.length > 0 ? (
          courses.map((course) => (
            <TableRow key={course.courseCode}>
              <TableCell>
                <div>
                  <p className="font-medium">{course.courseCode}</p>
                  <p className="text-sm text-muted-foreground">{course.courseDescription}</p>
                </div>
              </TableCell>
              <TableCell>{course.count}</TableCell>
              <TableCell>{course.uniqueStudents}</TableCell>
              <TableCell className={`font-medium ${type === "projected" ? "text-blue-600" : type === "unfunded" ? "text-red-600" : "text-green-600"}`}>
                {formatCurrency(course.revenue)}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} className="text-center h-24">
              No {type === "projected" ? "active" : type === "unfunded" ? "unfunded" : "completed"} courses found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>
));

// Memoized status breakdown table
const StatusTable = memo(({ statusBreakdown, totalRecords, getStatusColor }) => (
  <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead>Count</TableHead>
          <TableHead>Percentage</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {statusBreakdown.length > 0 ? (
          statusBreakdown.map((item) => {
            const percent = ((item.count / totalRecords) * 100).toFixed(1);
            const statusColor = getStatusColor(item.status);
            
            return (
              <TableRow key={item.status}>
                <TableCell>
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: statusColor }}
                    />
                    <span>{item.status}</span>
                  </div>
                </TableCell>
                <TableCell>{item.count}</TableCell>
                <TableCell>{percent}%</TableCell>
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <TableCell colSpan={3} className="text-center h-24">
              No status data available
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>
));

// Memoized CSV export button component
const CSVExportButton = memo(({ data, status, buttonText = "Export CSV" }) => {
  // Generate a timestamp string in the format YYYY-MM-DD_HH-MM-SS
  const getTimestamp = () => {
    const now = new Date();
    const datePart = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timePart = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    return `${datePart}_${timePart}`;
  };

  // Generate the full filename with status and timestamp
  const filename = `home-education-records_${status}_${getTimestamp()}.csv`;

  return (
    <CSVLink 
      data={data} 
      filename={filename}
      className="no-underline"
    >
      <Button variant="outline" size="sm" className="flex items-center gap-2">
        <Download className="h-4 w-4" />
        {buttonText}
      </Button>
    </CSVLink>
  );
});

// Memoized combined totals section
const CombinedTotals = memo(({ data, formatCurrency }) => (
  <Card className="bg-slate-50 border-slate-200">
    <CardHeader>
      <CardTitle className="text-lg">Combined Revenue Projection</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-3xl font-bold text-slate-900">
            {formatCurrency(data.homeEducation.total.revenue)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Completed + Projected</p>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground">Completed Revenue</p>
          <p className="text-2xl font-semibold text-green-700">
            {formatCurrency(data.homeEducation.completed.revenue)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Confirmed</p>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground">Projected Revenue</p>
          <p className="text-2xl font-semibold text-blue-700">
            {formatCurrency(data.homeEducation.active.revenue)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">From active students</p>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground">Funding Rate</p>
          <p className="text-2xl font-semibold">
            {data.homeEducation.percentFunded}%
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {data.homeEducation.total.uniqueStudents} of {data.homeEducation.allStudentsCount} students
          </p>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-md">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 text-red-600" />
          <div>
            <p className="font-medium text-red-900">Potential Lost Revenue:</p>
            <p className="text-lg font-bold text-red-700">
              {formatCurrency(data.homeEducation.notFunded.revenue)}
            </p>
            <p className="text-sm text-red-700 mt-1">
              From {data.homeEducation.notFunded.uniqueStudents} students with {data.homeEducation.notFunded.totalRecords} records
            </p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
));

const HomeEducationRevenueTab = ({ records }) => {
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [activeTab, setActiveTab] = useState("completed");
  const [previousRecordsLength, setPreviousRecordsLength] = useState(0);

  // Constants for funding calculations - Defined at component level
  const FUNDING_RATE_HOME_EDUCATION = 650; // $650 per student per school year

  // Format currency - memoized to prevent recreation
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-CA', { 
      style: 'currency', 
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, []);

  // Get color for status - memoized to prevent recreation
  const getStatusColor = useCallback((status) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === status);
    return option ? option.color : "#6B7280";  // Default to gray if status not found
  }, []);

  // Format CSV data for export - memoized to prevent recreation
  const prepareCSVData = useCallback((recordsList) => {
    return recordsList.map(record => ({
      ASN: record.asn || '',
      CourseCode: record.courseCode || '',
      CourseDescription: record.courseDescription || '',
      CreditsAttempted: record.creditsAttempted || '',
      Status: record.status || '',
      StatusValue: record.statusValue || '',
      StudentType: record.studentType || ''
    }));
  }, []);

  // Revenue calculations using useMemo with stabilized dependencies
  const revenueData = useMemo(() => {
    if (!records || records.length === 0) return null;

    // First, filter all Home Education records
    const allHomeEducationRecords = records.filter(record => 
      record.studentType === "Home Education"
    );

    // Create a map of all Home Education students and their records
    const studentRecordsMap = new Map();
    
    allHomeEducationRecords.forEach(record => {
      if (!record.asn) return; // Skip if no ASN
      
      if (!studentRecordsMap.has(record.asn)) {
        studentRecordsMap.set(record.asn, []);
      }
      
      studentRecordsMap.get(record.asn).push(record);
    });

    // Determine which students have completed at least one course
    // A student is considered 'completed' if they have at least one record with:
    // 1. record.status === "Completed" OR
    // 2. record.creditsAttempted === "1"
    const completedStudents = new Map();
    const activeStudents = new Map(); // Students with active courses but no completed ones
    const otherStudents = new Map(); // Students with neither completed nor active courses
    
    studentRecordsMap.forEach((studentRecords, asn) => {
      // Check if student has any completed courses
      const hasCompletedCourse = studentRecords.some(record => 
        record.status === "Completed" || parseInt(record.creditsAttempted) === 1
      );
      
      if (hasCompletedCourse) {
        // If student has at least one completed course, add to completed
        completedStudents.set(asn, studentRecords);
      } else {
        // Check if student has any active courses
        const hasActiveCourse = studentRecords.some(record => record.status === "Active");
        
        if (hasActiveCourse) {
          // If student has active courses (but no completed ones), add to active
          activeStudents.set(asn, studentRecords);
        } else {
          // Student has neither completed nor active courses
          otherStudents.set(asn, studentRecords);
        }
      }
    });

    // Helper function to process records for a specific student set
    const processStudentSet = (studentMap) => {
      const allRecords = Array.from(studentMap.values()).flat();
      const uniqueStudents = studentMap.size;
      
      // Calculate revenue based on number of students (not credits)
      const revenue = uniqueStudents * FUNDING_RATE_HOME_EDUCATION;
      
      // Process course breakdown
      const courseRecords = {};
      const statusCounts = {};
      
      allRecords.forEach(record => {
        // Track by course
        if (!courseRecords[record.courseCode]) {
          courseRecords[record.courseCode] = {
            courseCode: record.courseCode,
            courseDescription: record.courseDescription,
            count: 0,
            students: new Set()
          };
        }
        
        courseRecords[record.courseCode].count++;
        if (record.asn) {
          courseRecords[record.courseCode].students.add(record.asn);
        }
        
        // Count by status
        const statusValue = record.statusValue || 'Unknown';
        if (!statusCounts[statusValue]) {
          statusCounts[statusValue] = 0;
        }
        statusCounts[statusValue]++;
      });
      
      // Calculate course-specific revenue (proportional to student count)
      const sortedCourses = Object.values(courseRecords)
        .map(course => {
          const uniqueStudentsInCourse = course.students.size;
          // Calculate course revenue based on proportion of unique students
          // This is just for visualization - total revenue is still based on unique students overall
          const courseRevenue = uniqueStudentsInCourse * FUNDING_RATE_HOME_EDUCATION;
          
          return {
            ...course,
            uniqueStudents: uniqueStudentsInCourse,
            revenue: courseRevenue
          };
        })
        .sort((a, b) => b.uniqueStudents - a.uniqueStudents);
        
      // Convert status counts to array and sort by count
      const statusBreakdown = Object.entries(statusCounts)
        .map(([status, count]) => ({ status, count }))
        .sort((a, b) => b.count - a.count);

      return {
        totalRecords: allRecords.length,
        uniqueStudents,
        revenue,
        courseBreakdown: sortedCourses,
        statusBreakdown,
        records: allRecords // Include the original records for CSV export
      };
    };

    // Process all three types of student sets
    const completedData = processStudentSet(completedStudents);
    const activeData = processStudentSet(activeStudents);
    const notFundedData = processStudentSet(otherStudents);
    
    // Calculate combined totals for funded records (completed + active)
    const combinedTotals = {
      totalRecords: completedData.totalRecords + activeData.totalRecords,
      uniqueStudents: completedStudents.size + activeStudents.size,
      revenue: completedData.revenue + activeData.revenue
    };

    // Calculate total students count including not funded
    const allStudentsCount = studentRecordsMap.size;
    
    // Calculate percentage of students funded vs total
    const percentFunded = allStudentsCount > 0 
      ? (((completedStudents.size + activeStudents.size) / allStudentsCount) * 100).toFixed(1)
      : 0;

    return {
      homeEducation: {
        completed: completedData,
        active: activeData,
        notFunded: notFundedData,
        total: combinedTotals,
        allStudentsCount,
        percentFunded,
        allRecords: allHomeEducationRecords,
        completedStudents: completedStudents.size,
        activeStudents: activeStudents.size,
        otherStudents: otherStudents.size
      }
    };
  }, [records, FUNDING_RATE_HOME_EDUCATION]);

  // Prepare CSV data for all tabs - memoized to prevent recreation
  const csvData = useMemo(() => {
    if (!revenueData) return { completed: [], active: [], notFunded: [], all: [] };
    
    return {
      completed: prepareCSVData(revenueData.homeEducation.completed.records || []),
      active: prepareCSVData(revenueData.homeEducation.active.records || []),
      notFunded: prepareCSVData(revenueData.homeEducation.notFunded.records || []),
      all: prepareCSVData(revenueData.homeEducation.allRecords || [])
    };
  }, [revenueData, prepareCSVData]);

  // Only show loading on initial data fetch
  useEffect(() => {
    if (records && records.length > 0 && isFirstLoad) {
      // Use a shorter timeout for initial load
      const timer = setTimeout(() => {
        setIsFirstLoad(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
    
    // If data length changes significantly, consider it an update not a flicker
    if (records && Math.abs(records.length - previousRecordsLength) > 5) {
      setPreviousRecordsLength(records.length);
    }
  }, [records, isFirstLoad, previousRecordsLength]);

  return (
    <div className="space-y-6">
      {isFirstLoad ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : revenueData ? (
        <div className="space-y-8">
          {/* Export All Records Button with total count */}
          <div className="flex justify-between items-center">
            <div className="flex items-center text-sm">
              <Home className="h-4 w-4 mr-1 text-slate-500" />
              <span>Home Education Students: {revenueData.homeEducation.allStudentsCount}</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2 text-sm text-muted-foreground">
                Total: {revenueData.homeEducation.allRecords.length} records
              </span>
              <CSVExportButton 
                data={csvData.all} 
                status="all"
                buttonText="Export All Records"
              />
            </div>
          </div>

          {/* Home Education Student Revenue Section */}
          <div>
            <Tabs 
              defaultValue="completed" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="mb-6"
            >
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="completed" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Completed 
                  <Badge>{revenueData.homeEducation.completedStudents}</Badge>
                </TabsTrigger>
                <TabsTrigger value="active" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Active 
                  <Badge>{revenueData.homeEducation.activeStudents}</Badge>
                </TabsTrigger>
                <TabsTrigger value="notFunded" className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Not Funded
                  <Badge variant="destructive">{revenueData.homeEducation.otherStudents}</Badge>
                </TabsTrigger>
              </TabsList>
              
              {/* Completed Tab */}
              <TabsContent value="completed">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Completed Students</h3>
                  <CSVExportButton 
                    data={csvData.completed} 
                    status="completed"
                    buttonText="Export Completed"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <StatCard 
                    className="bg-green-50 border-green-100"
                    title="Completed Revenue"
                    value={formatCurrency(revenueData.homeEducation.completed.revenue)}
                    valueClassName="text-green-700"
                    subtitle={`@ $${FUNDING_RATE_HOME_EDUCATION} per student`}
                  />
                  
                  <StatCard 
                    title="Funded Students"
                    value={revenueData.homeEducation.completed.uniqueStudents}
                    subtitle="With completed courses"
                  />
                  
                  <StatCard 
                    title="Course Records"
                    value={revenueData.homeEducation.completed.totalRecords}
                    subtitle="From funded students"
                  />
                </div>
                
                <div>
                  <h4 className="text-md font-medium mb-3 flex items-center">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Completed Course Breakdown
                  </h4>
                  <CourseTable 
                    courses={revenueData.homeEducation.completed.courseBreakdown} 
                    formatCurrency={formatCurrency} 
                    type="confirmed"
                  />
                </div>
              </TabsContent>
              
              {/* Active Tab */}
              <TabsContent value="active">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Active Students</h3>
                  <CSVExportButton 
                    data={csvData.active} 
                    status="active"
                    buttonText="Export Active"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <StatCard 
                    className="bg-blue-50 border-blue-100"
                    title="Projected Revenue"
                    value={formatCurrency(revenueData.homeEducation.active.revenue)}
                    valueClassName="text-blue-700"
                    subtitle={`@ $${FUNDING_RATE_HOME_EDUCATION} per student`}
                  />
                  
                  <StatCard 
                    title="Active Students"
                    value={revenueData.homeEducation.active.uniqueStudents}
                    subtitle="With active courses"
                  />
                  
                  <StatCard 
                    title="Course Records"
                    value={revenueData.homeEducation.active.totalRecords}
                    subtitle="From active students"
                  />
                </div>
                
                {/* Added grid layout for Active tab with Status Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Course Breakdown */}
                  <div>
                    <h4 className="text-md font-medium mb-3 flex items-center">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Active Course Breakdown
                    </h4>
                    <CourseTable 
                      courses={revenueData.homeEducation.active.courseBreakdown} 
                      formatCurrency={formatCurrency} 
                      type="projected"
                    />
                  </div>
                  
                  {/* Status Breakdown */}
                  <div>
                    <h4 className="text-md font-medium mb-3 flex items-center">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Breakdown by Status
                    </h4>
                    <StatusTable 
                      statusBreakdown={revenueData.homeEducation.active.statusBreakdown}
                      totalRecords={revenueData.homeEducation.active.totalRecords}
                      getStatusColor={getStatusColor}
                    />
                  </div>
                </div>
              </TabsContent>
              
              {/* Not Funded Tab */}
              <TabsContent value="notFunded">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Unfunded Students</h3>
                  <CSVExportButton 
                    data={csvData.notFunded} 
                    status="notFunded"
                    buttonText="Export Not Funded"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <StatCard 
                    className="bg-red-50 border-red-100"
                    title="Potential Lost Revenue"
                    value={formatCurrency(revenueData.homeEducation.notFunded.revenue)}
                    valueClassName="text-red-700"
                    subtitle="From unfunded students"
                  />
                  
                  <StatCard 
                    title="Unfunded Students"
                    value={revenueData.homeEducation.notFunded.uniqueStudents}
                    subtitle="No completed/active courses"
                  />
                  
                  <StatCard 
                    title="Course Records"
                    value={revenueData.homeEducation.notFunded.totalRecords}
                    subtitle="From unfunded students"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Course Breakdown */}
                  <div>
                    <h4 className="text-md font-medium mb-3 flex items-center">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Unfunded Course Breakdown
                    </h4>
                    <CourseTable 
                      courses={revenueData.homeEducation.notFunded.courseBreakdown} 
                      formatCurrency={formatCurrency} 
                      type="unfunded"
                    />
                  </div>
                  
                  {/* Status Breakdown */}
                  <div>
                    <h4 className="text-md font-medium mb-3 flex items-center">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Breakdown by Status
                    </h4>
                    <StatusTable 
                      statusBreakdown={revenueData.homeEducation.notFunded.statusBreakdown}
                      totalRecords={revenueData.homeEducation.notFunded.totalRecords}
                      getStatusColor={getStatusColor}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Totals Section */}
          <CombinedTotals data={revenueData} formatCurrency={formatCurrency} />

          <div className="text-sm text-muted-foreground p-4 bg-blue-50 rounded-md">
            <div className="flex items-start">
              <GraduationCap className="h-5 w-5 mr-2 mt-0.5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Funding Formula:</p>
                <p className="mt-1">Home Education Students: ${FUNDING_RATE_HOME_EDUCATION} per student per school year</p>
                <p className="mt-1">Completed status: Students with at least one course with status "Completed" or at least one 1-credit course.</p>
                <p className="mt-1">Active status: Students with active courses but no completed courses.</p>
                <p className="mt-1">Not Funded: Students with neither completed nor active courses.</p>
                <p className="mt-1">Note: Unlike other student types, Home Education funding is based on unique students, not on course credits.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p>No data available for Home Education student revenue analysis.</p>
      )}
    </div>
  );
};

export default memo(HomeEducationRevenueTab);