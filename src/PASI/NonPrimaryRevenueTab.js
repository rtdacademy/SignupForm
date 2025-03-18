import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Loader2, DollarSign, BookOpen, Users, GraduationCap, AlertTriangle, CheckCircle, XCircle, Download, Info } from 'lucide-react';
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

// Memoized table component
const CourseTable = memo(({ courses, formatCurrency, type = "confirmed" }) => (
  <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Course</TableHead>
          <TableHead>Records</TableHead>
          <TableHead>Unique Students</TableHead>
          <TableHead>Total Credits</TableHead>
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
              <TableCell>{course.totalCredits}</TableCell>
              <TableCell className={`font-medium ${type === "projected" ? "text-blue-600" : type === "unfunded" ? "text-red-600" : "text-green-600"}`}>
                {formatCurrency(course.revenue)}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center h-24">
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
  const filename = `nonprimary-records_${status}_${getTimestamp()}.csv`;

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
            {formatCurrency(data.nonPrimary.total.revenue)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Completed + Projected</p>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground">Completed Revenue</p>
          <p className="text-2xl font-semibold text-green-700">
            {formatCurrency(data.nonPrimary.completed.revenue)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Confirmed</p>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground">Projected Revenue</p>
          <p className="text-2xl font-semibold text-blue-700">
            {formatCurrency(data.nonPrimary.active.revenue)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">From active courses</p>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground">Funding Rate</p>
          <p className="text-2xl font-semibold">
            {data.nonPrimary.percentFunded}%
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {data.nonPrimary.total.uniqueStudents} of {data.nonPrimary.allStudentsCount} students
          </p>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-md">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 text-red-600" />
          <div>
            <p className="font-medium text-red-900">Potential Lost Revenue:</p>
            <p className="text-lg font-bold text-red-700">
              {formatCurrency(data.nonPrimary.notFunded.revenue)}
            </p>
            <p className="text-sm text-red-700 mt-1">
              From {data.nonPrimary.notFunded.uniqueStudents} students with {data.nonPrimary.notFunded.totalRecords} records
            </p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
));

const NonPrimaryRevenueTab = ({ records }) => {
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [activeTab, setActiveTab] = useState("completed");
  const [previousRecordsLength, setPreviousRecordsLength] = useState(0);

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

    // Constants for funding calculations
    const FUNDING_RATE_NON_PRIMARY = 107; // $107 per credit

    // First, filter all non-primary records
    const allNonPrimaryRecords = records.filter(record => 
      record.studentType === "Non-Primary"
    );

    // Helper function to determine if a status is likely to be funded
    const isLikelyToBeFunded = (record) => {
      // Only these specific statuses are considered NOT funded
      return record.statusValue !== "✗ Removed (Not Funded)" && 
             record.statusValue !== "Hasn't Started";
    };

    // For our new requirement: Any record with creditsAttempted = 1 is considered completed
    // Find Non-Primary students with completed status OR creditsAttempted = 1
    const nonPrimaryCompletedRecords = allNonPrimaryRecords.filter(record => 
      record.status === "Completed" || parseInt(record.creditsAttempted) === 1
    );

    // Find Non-Primary students with active status (excluding those with creditsAttempted = 1)
    const nonPrimaryActiveRecords = allNonPrimaryRecords.filter(record => 
      record.status === "Active" && parseInt(record.creditsAttempted) !== 1
    );
    
    // Filter active records to only those likely to be funded
    const nonPrimaryActiveLikelyFundedRecords = nonPrimaryActiveRecords.filter(isLikelyToBeFunded);
    
    // Active records unlikely to be funded (will go in notFunded category)
    const nonPrimaryActiveUnlikelyFundedRecords = nonPrimaryActiveRecords.filter(
      record => !isLikelyToBeFunded(record)
    );
    
    // Find all other Non-Primary records (not Completed, not Active, not with creditsAttempted = 1)
    const nonPrimaryOtherRecords = allNonPrimaryRecords.filter(record => 
      record.status !== "Completed" && 
      record.status !== "Active" && 
      parseInt(record.creditsAttempted) !== 1
    );
    
    // Combine active-unlikely-funded and other records for "Not Funded" tab
    const nonPrimaryNotFundedRecords = [
      ...nonPrimaryActiveUnlikelyFundedRecords,
      ...nonPrimaryOtherRecords.filter(record => 
        // Only include records with specific status values in "Not Funded"
        record.statusValue === "✗ Removed (Not Funded)" || 
        record.statusValue === "Hasn't Started"
      )
    ];

    // Create a breakdown of other statuses for debugging
    const otherStatusCounts = {};
    nonPrimaryOtherRecords.forEach(record => {
      const status = record.status || 'Unknown';
      otherStatusCounts[status] = (otherStatusCounts[status] || 0) + 1;
    });

    // Debug totals
    const totalNonPrimary = allNonPrimaryRecords.length;
    const totalCompleted = nonPrimaryCompletedRecords.length;
    const totalActive = nonPrimaryActiveRecords.length;
    const totalOther = nonPrimaryOtherRecords.length;
    const calculatedTotal = totalCompleted + totalActive + totalOther;
    const missingRecords = totalNonPrimary - calculatedTotal;

    // Helper function to process records for a specific status
    const processRecords = (recordList) => {
      let totalCredits = 0;
      const uniqueStudents = new Set();
      const courseRecords = {};
      const statusCounts = {};

      recordList.forEach(record => {
        // Add to unique students set
        if (record.asn) {
          uniqueStudents.add(record.asn);
        }
        
        // Parse credits (defaulting to 0 if not a valid number)
        const credits = parseInt(record.creditsAttempted) || 0;
        totalCredits += credits;
        
        // Track by course
        if (!courseRecords[record.courseCode]) {
          courseRecords[record.courseCode] = {
            courseCode: record.courseCode,
            courseDescription: record.courseDescription,
            count: 0,
            totalCredits: 0,
            students: new Set()
          };
        }
        
        courseRecords[record.courseCode].count++;
        courseRecords[record.courseCode].totalCredits += credits;
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
      
      // Calculate revenue
      const revenue = totalCredits * FUNDING_RATE_NON_PRIMARY;

      // Sort courses by total credits (highest first)
      const sortedCourses = Object.values(courseRecords)
        .map(course => ({
          ...course,
          uniqueStudents: course.students.size,
          revenue: course.totalCredits * FUNDING_RATE_NON_PRIMARY
        }))
        .sort((a, b) => b.totalCredits - a.totalCredits);
        
      // Convert status counts to array and sort by count
      const statusBreakdown = Object.entries(statusCounts)
        .map(([status, count]) => ({ status, count }))
        .sort((a, b) => b.count - a.count);

      return {
        totalRecords: recordList.length,
        uniqueStudents: uniqueStudents.size,
        totalCredits,
        revenue,
        courseBreakdown: sortedCourses,
        statusBreakdown,
        records: recordList // Include the original records for CSV export
      };
    };

    // Process all three types of records
    const completedData = processRecords(nonPrimaryCompletedRecords);
    const activeData = processRecords(nonPrimaryActiveLikelyFundedRecords);
    const notFundedData = processRecords(nonPrimaryNotFundedRecords);
    
    // Calculate combined totals for funded records
    const combinedTotals = {
      totalRecords: completedData.totalRecords + activeData.totalRecords,
      // For unique students, we need to combine the sets to avoid duplicates
      uniqueStudents: new Set([...nonPrimaryCompletedRecords, ...nonPrimaryActiveLikelyFundedRecords]
        .filter(record => record.asn)
        .map(record => record.asn)).size,
      totalCredits: completedData.totalCredits + activeData.totalCredits,
      revenue: completedData.revenue + activeData.revenue
    };

    // Calculate total students count including not funded
    const allStudentsCount = new Set(allNonPrimaryRecords
      .filter(record => record.asn)
      .map(record => record.asn)).size;
    
    // Calculate percentage of students funded vs total
    const percentFunded = combinedTotals.uniqueStudents > 0 
      ? ((combinedTotals.uniqueStudents / allStudentsCount) * 100).toFixed(1)
      : 0;

    return {
      nonPrimary: {
        completed: completedData,
        active: activeData,
        notFunded: notFundedData,
        total: combinedTotals,
        activeRecords: nonPrimaryActiveRecords.length,
        activeLikelyFunded: nonPrimaryActiveLikelyFundedRecords.length,
        notFundedRecords: nonPrimaryNotFundedRecords.length,
        allStudentsCount,
        percentFunded,
        allRecords: allNonPrimaryRecords,
        debug: {
          totalNonPrimary,
          totalCompleted,
          totalActive,
          totalOther,
          calculatedTotal,
          missingRecords,
          otherStatusCounts
        }
      }
    };
  }, [records]);

  // Prepare CSV data for all tabs - memoized to prevent recreation
  const csvData = useMemo(() => {
    if (!revenueData) return { completed: [], active: [], notFunded: [], all: [] };
    
    return {
      completed: prepareCSVData(revenueData.nonPrimary.completed.records || []),
      active: prepareCSVData(revenueData.nonPrimary.active.records || []),
      notFunded: prepareCSVData(revenueData.nonPrimary.notFunded.records || []),
      all: prepareCSVData(revenueData.nonPrimary.allRecords || [])
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

  // Calculate total records from tabs for verification
  const tabTotalRecords = revenueData ? 
    revenueData.nonPrimary.completed.totalRecords + 
    revenueData.nonPrimary.active.totalRecords + 
    revenueData.nonPrimary.notFunded.totalRecords : 0;

  // Calculate missing records if any
  const totalNonPrimaryRecords = revenueData?.nonPrimary.allRecords.length || 0;
  const missingRecords = totalNonPrimaryRecords - tabTotalRecords;

  return (
    <div className="space-y-6">
      {isFirstLoad ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : revenueData ? (
        <div className="space-y-8">
          {/* Export All Records Button with total count and debug */}
          <div className="flex justify-between items-center">
            <div className="flex items-center text-sm">
              {missingRecords > 0 && (
                <div className="flex items-center text-amber-600 mr-4">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  <span>
                    {missingRecords} records not categorized
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center">
              <span className="mr-2 text-sm text-muted-foreground">
                Total: {revenueData.nonPrimary.allRecords.length} records
              </span>
              <CSVExportButton 
                data={csvData.all} 
                status="all"
                buttonText="Export All Records"
              />
            </div>
          </div>

          {/* Debug Information - Records Distribution */}
          {missingRecords > 0 && (
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  Records Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-white">Total Non-Primary: {revenueData.nonPrimary.debug.totalNonPrimary}</Badge>
                  <Badge variant="outline" className="bg-white">Completed: {revenueData.nonPrimary.debug.totalCompleted}</Badge>
                  <Badge variant="outline" className="bg-white">Active: {revenueData.nonPrimary.debug.totalActive}</Badge>
                  <Badge variant="outline" className="bg-white">Other Statuses: {revenueData.nonPrimary.debug.totalOther}</Badge>
                </div>
                
                <div className="mt-2 text-xs text-muted-foreground">
                  <p className="font-medium mb-1">Other status breakdown:</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(revenueData.nonPrimary.debug.otherStatusCounts).map(([status, count]) => (
                      <Badge key={status} variant="outline" className="bg-white">{status}: {count}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Non-Primary Student Revenue Section */}
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
                  <Badge>{revenueData.nonPrimary.completed.totalRecords}</Badge>
                </TabsTrigger>
                <TabsTrigger value="active" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Active 
                  <Badge>{revenueData.nonPrimary.activeLikelyFunded}</Badge>
                </TabsTrigger>
                <TabsTrigger value="notFunded" className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Not Funded
                  <Badge variant="destructive">{revenueData.nonPrimary.notFundedRecords}</Badge>
                </TabsTrigger>
              </TabsList>
              
              {/* Completed Tab */}
              <TabsContent value="completed">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Completed Records</h3>
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
                    value={formatCurrency(revenueData.nonPrimary.completed.revenue)}
                    valueClassName="text-green-700"
                    subtitle="@ $107 per credit"
                  />
                  
                  <StatCard 
                    title="Completed Credits"
                    value={revenueData.nonPrimary.completed.totalCredits}
                    subtitle={`From ${revenueData.nonPrimary.completed.totalRecords} records`}
                  />
                  
                  <StatCard 
                    title="Unique Students"
                    value={revenueData.nonPrimary.completed.uniqueStudents}
                    subtitle="With completed courses"
                  />
                </div>
                
                <div>
                  <h4 className="text-md font-medium mb-3 flex items-center">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Completed Course Breakdown
                  </h4>
                  <CourseTable 
                    courses={revenueData.nonPrimary.completed.courseBreakdown} 
                    formatCurrency={formatCurrency} 
                    type="confirmed"
                  />
                </div>
              </TabsContent>
              
              {/* Active Tab */}
              <TabsContent value="active">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Active Records</h3>
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
                    value={formatCurrency(revenueData.nonPrimary.active.revenue)}
                    valueClassName="text-blue-700"
                    subtitle="From likely funded courses"
                  />
                  
                  <StatCard 
                    title="Projected Credits"
                    value={revenueData.nonPrimary.active.totalCredits}
                    subtitle={`Likely to be funded: ${revenueData.nonPrimary.activeLikelyFunded} of ${revenueData.nonPrimary.activeRecords}`}
                  />
                  
                  <StatCard 
                    title="Unique Students"
                    value={revenueData.nonPrimary.active.uniqueStudents}
                    subtitle="With active courses"
                  />
                </div>
                
                {/* Added grid layout for Active tab with Status Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Course Breakdown */}
                  <div>
                    <h4 className="text-md font-medium mb-3 flex items-center">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Active Course Breakdown (Likely to be Funded)
                    </h4>
                    <CourseTable 
                      courses={revenueData.nonPrimary.active.courseBreakdown} 
                      formatCurrency={formatCurrency} 
                      type="projected"
                    />
                  </div>
                  
                  {/* Status Breakdown - Added to Active tab */}
                  <div>
                    <h4 className="text-md font-medium mb-3 flex items-center">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Breakdown by Status
                    </h4>
                    <StatusTable 
                      statusBreakdown={revenueData.nonPrimary.active.statusBreakdown}
                      totalRecords={revenueData.nonPrimary.active.totalRecords}
                      getStatusColor={getStatusColor}
                    />
                  </div>
                </div>
              </TabsContent>
              
              {/* Not Funded Tab */}
              <TabsContent value="notFunded">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Not Funded Records</h3>
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
                    value={formatCurrency(revenueData.nonPrimary.notFunded.revenue)}
                    valueClassName="text-red-700"
                    subtitle="From records unlikely to be funded"
                  />
                  
                  <StatCard 
                    title="Unfunded Credits"
                    value={revenueData.nonPrimary.notFunded.totalCredits}
                    subtitle={`From ${revenueData.nonPrimary.notFunded.totalRecords} records`}
                  />
                  
                  <StatCard 
                    title="At-Risk Students"
                    value={revenueData.nonPrimary.notFunded.uniqueStudents}
                    subtitle="With unfunded courses"
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
                      courses={revenueData.nonPrimary.notFunded.courseBreakdown} 
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
                      statusBreakdown={revenueData.nonPrimary.notFunded.statusBreakdown}
                      totalRecords={revenueData.nonPrimary.notFunded.totalRecords}
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
                <p className="mt-1">Non-Primary Students: $107 per completed credit</p>
                <p className="mt-1">Completed status: Records with status "Completed" or with credits attempted = 1 are included as confirmed revenue.</p>
                <p className="mt-1">Active status: Records with status "Active" (but not credits attempted = 1) that don't have specific unfunded statuses are included as projected revenue.</p>
                <p className="mt-1">Not Funded: Only records with specific statuses "✗ Removed (Not Funded)" or "Hasn't Started" are considered unfunded.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p>No data available for Non-Primary student revenue analysis.</p>
      )}
    </div>
  );
};

export default memo(NonPrimaryRevenueTab);