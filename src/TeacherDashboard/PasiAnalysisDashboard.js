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
        },
        // Add student type analytics
        studentTypes: {
          distribution: [],
          statusByType: {},
          gradesByType: {},
          countsByType: {},
          coursesByType: {},
          creditsByType: {} // Add tracking for credits by student type
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
    
    // Add student type tracking
    const studentTypeCounts = {};
    const studentTypeStatusCounts = {};
    const studentTypeGrades = {};
    const studentTypeCourses = {};
    const studentTypeCredits = {}; // Add tracking for credits by student type
    const studentTypeUniqueStudents = {}; // Track unique students by ASN for each student type
    
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
        
        // Track total credits by student type
        if (record.creditsAttempted && record.creditsAttempted !== '-' && record.creditsAttempted !== 'N/A') {
          if (!studentTypeCredits[studentType]) {
            studentTypeCredits[studentType] = {
              totalCredits: 0,
              recordsWithCredits: 0
            };
          }
          
          // Parse the credits - convert string to number
          const creditsValue = parseFloat(record.creditsAttempted);
          if (!isNaN(creditsValue)) {
            studentTypeCredits[studentType].totalCredits += creditsValue;
            studentTypeCredits[studentType].recordsWithCredits += 1;
          }
        }
        
        // Track unique students by ASN for each student type
        if (record.asn) {
          if (!studentTypeUniqueStudents[studentType]) {
            studentTypeUniqueStudents[studentType] = new Set();
          }
          studentTypeUniqueStudents[studentType].add(record.asn);
        }
      }
    });
    
    // Update the studentTypeCredits object with unique student count
    Object.keys(studentTypeCredits).forEach(type => {
      if (studentTypeUniqueStudents[type]) {
        studentTypeCredits[type].uniqueStudentCount = studentTypeUniqueStudents[type].size;
      } else {
        studentTypeCredits[type].uniqueStudentCount = 0;
      }
    });
    
    // Calculate average grade
    const averageGrade = numericGrades.length > 0 
      ? (numericGrades.reduce((sum, grade) => sum + grade, 0) / numericGrades.length).toFixed(1)
      : 0;
    
    // Calculate average grades by student type
    Object.keys(studentTypeGrades).forEach(type => {
      const numericGradesForType = studentTypeGrades[type].numericGrades;
      if (numericGradesForType.length > 0) {
        studentTypeGrades[type].averageGrade = 
          (numericGradesForType.reduce((sum, grade) => sum + grade, 0) / numericGradesForType.length).toFixed(1);
      }
    });
    
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
      registrationTrends,
      grades: {
        hasGrade: hasGradeCount,
        noGrade: noGradeCount,
        averageGrade,
        gradeDistribution
      },
      multipleRecords: {
        withMultiple: withMultipleRecordsCount,
        withoutMultipleRecordsCount
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
        gradesByType: studentTypeGrades,
        countsByType: studentTypeCounts,
        coursesByType: studentTypeCourses,
        creditsByType: studentTypeCredits
      }
    };
  }, [records]);
  
  // Download data as CSV
  const downloadCSV = () => {
    if (!records || records.length === 0) return;
    
    // Create CSV content with all available headers
    const headers = [
      'ASN',
      'Student Name',
      'First Name',
      'Last Name',
      'Email',
      'Student Email',
      'Parent Email',
      'Parent First Name',
      'Parent Last Name',
      'Parent Phone',
      'Student Phone',
      'Student Type',
      'Course Code',
      'Course ID',
      'Course Value',
      'Course Description',
      'Status',
      'Status Value',
      'Term',
      'PASI Term',
      'Registration Date',
      'Exit Date',
      'Exit Date Formatted',
      'Start Date',
      'Start Date Formatted',
      'Schedule Start Date',
      'Schedule End Date',
      'Resuming On Date',
      'Diploma Month',
      'School Year',
      'Active/Future/Archived',
      'Age',
      'Birthday',
      'Gender',
      'Work Items',
      'Assignment Date',
      'Approved',
      'Deleted',
      'Dual Enrolment',
      'Funding Requested',
      'Period',
      'Credits Attempted',
      'Grade',
      'Reference Number',
      'School Enrolment',
      'Primary School Name',
      'LMS Student ID',
      'Created',
      'Created At',
      'Last Updated',
      'Last Sync',
      'Original Email',
      'Has Schedule',
      'In Old SharePoint',
      'Preferred First Name',
      'Match Status',
      'Link Status',
      'Linked',
      'Linked At',
      'Display Student Type',
      'Display Term',
      'Start Date Source',
      'UID'
    ].join(',');
    
    const rows = records.map(record => {
      // Function to safely escape CSV values
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
        escapeCSV(record.firstName),
        escapeCSV(record.lastName),
        escapeCSV(record.email),
        escapeCSV(record.StudentEmail),
        escapeCSV(record.ParentEmail),
        escapeCSV(record.ParentFirstName),
        escapeCSV(record.ParentLastName),
        escapeCSV(record.ParentPhone_x0023_),
        escapeCSV(record.StudentPhone),
        escapeCSV(record.StudentType_Value || record.studentType || ''),
        record.courseCode || '',
        record.CourseID || '',
        escapeCSV(record.Course_Value),
        escapeCSV(record.courseDescription),
        escapeCSV(record.status),
        escapeCSV(record.Status_Value),
        record.term || '',
        record.pasiTerm || '',
        record.startDateFormatted || '',
        record.exitDate || '',
        record.exitDateFormatted || '',
        record.startDate || '',
        record.startDateFormatted || '',
        record.ScheduleStartDate || '',
        record.ScheduleEndDate || '',
        record.resumingOnDate || '',
        escapeCSV(record.DiplomaMonthChoices_Value),
        escapeCSV(record.School_x0020_Year_Value || record.schoolYear),
        escapeCSV(record.ActiveFutureArchived_Value),
        record.age || '',
        record.birthday || '',
        escapeCSV(record.gender),
        escapeCSV(record.workItems),
        record.assignmentDate || '',
        escapeCSV(record.approved),
        escapeCSV(record.deleted),
        escapeCSV(record.dualEnrolment),
        escapeCSV(record.fundingRequested),
        escapeCSV(record.period),
        record.creditsAttempted || '',
        record.value || '',
        escapeCSV(record.referenceNumber),
        escapeCSV(record.schoolEnrolment),
        escapeCSV(record.primarySchoolName),
        record.LMSStudentID || '',
        record.Created || '',
        record.createdAt || '',
        record.lastUpdated || '',
        record.LastSync || '',
        escapeCSV(record.originalEmail),
        record.hasSchedule || '',
        record.inOldSharePoint || '',
        escapeCSV(record.preferredFirstName),
        escapeCSV(record.matchStatus),
        escapeCSV(record.linkStatus),
        record.linked || '',
        record.linkedAt || '',
        escapeCSV(record.displayStudentType),
        escapeCSV(record.displayTerm),
        escapeCSV(record.startDateSource),
        record.uid || ''
      ].join(',');
    });
    
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

  // Download data as JSON
  const downloadJSON = () => {
    if (!records || records.length === 0) return;
    
    const jsonContent = JSON.stringify(records, null, 2);
    
    // Create download
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pasi-records-export-${new Date().toISOString().slice(0,10)}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Simple hash function to create anonymous identifier from ASN
  const createAnonymousId = (asn) => {
    if (!asn) return 'unknown';
    
    // Simple hash function for demonstration
    // In production, you might want to use a proper cryptographic hash
    let hash = 0;
    for (let i = 0; i < asn.length; i++) {
      const char = asn.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert to positive number and pad with zeros
    const positiveHash = Math.abs(hash);
    return `ANON-${positiveHash.toString().padStart(10, '0')}`;
  };

  // Download anonymous data (CSV or JSON)
  const downloadAnonymousData = (format) => {
    if (!records || records.length === 0) return;
    
    // Fields to include in anonymous export (now includes anonymousId)
    const anonymousFields = [
      'anonymousId',
      'ActiveFutureArchived_Value',
      'CourseID',
      'Course_Value',
      'Created',
      'DiplomaMonthChoices_Value',
      'ScheduleEndDate',
      'ScheduleStartDate',
      'School_x0020_Year_Value',
      'Status_Value',
      'StudentType_Value',
      'birthday',
      'createdAt',
      'gender',
      'hasSchedule',
      'primarySchoolName',
      'approved',
      'assignmentDate',
      'courseCode',
      'courseDescription',
      'creditsAttempted',
      'deleted',
      'dualEnrolment',
      'exitDate',
      'fundingRequested',
      'period',
      'schoolEnrolment',
      'schoolYear',
      'status',
      'value',
      'pasiTerm',
      'startDate',
      'startDateFormatted',
      'startDateSource',
      'exitDateFormatted'
    ];
    
    // Create anonymous records with only specified fields
    const anonymousRecords = records.map(record => {
      const anonymousRecord = {};
      
      // Add anonymous ID based on ASN
      anonymousRecord.anonymousId = createAnonymousId(record.asn);
      
      // Add other fields
      anonymousFields.forEach(field => {
        if (field !== 'anonymousId' && record.hasOwnProperty(field)) {
          anonymousRecord[field] = record[field];
        }
      });
      return anonymousRecord;
    });
    
    if (format === 'json') {
      // Export as JSON
      const jsonContent = JSON.stringify(anonymousRecords, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `pasi-records-anonymous-export-${new Date().toISOString().slice(0,10)}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Export as CSV
      const headers = anonymousFields.join(',');
      
      const rows = anonymousRecords.map(record => {
        // Function to safely escape CSV values
        const escapeCSV = (value) => {
          if (value === null || value === undefined) return '';
          const str = String(value);
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        };
        
        return anonymousFields.map(field => escapeCSV(record[field] || '')).join(',');
      });
      
      const csvContent = [headers, ...rows].join('\n');
      
      // Create download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `pasi-records-anonymous-export-${new Date().toISOString().slice(0,10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full md:max-w-[90%] sm:max-w-full overflow-y-auto" side="right">
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
              <TabsTrigger value="studenttypes" className="flex items-center">
                <Users className="h-4 w-4 mr-1" /> Student Types
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
            
            {/* Student Types Tab */}
            <TabsContent value="studenttypes" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Student Type Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analytics.studentTypes.distribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
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

                <Card className="bg-violet-50 border-violet-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-violet-800">Student Type Summary</h3>
                    </div>
                    <div className="space-y-3 max-h-[250px] overflow-auto pr-2">
                      {analytics.studentTypes.distribution.map((type, index) => (
                        <div key={index} className="flex items-center justify-between text-sm border-b border-violet-100 pb-2">
                          <span className="text-violet-700 font-medium">{type.name}</span>
                          <div className="flex items-center">
                            <span>{type.value} records</span>
                            <Badge variant="outline" className="ml-2 bg-violet-100 text-violet-800 border-violet-300">
                              {analytics.totalRecords ? ((type.value / analytics.totalRecords) * 100).toFixed(1) : 0}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Academic Performance by Student Type</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.entries(analytics.studentTypes.gradesByType)
                          .filter(([type, data]) => data.averageGrade > 0) // Only include types with grade data
                          .map(([type, data]) => ({
                            name: type,
                            averageGrade: parseFloat(data.averageGrade),
                            count: data.count
                          }))}
                        margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip 
                          formatter={(value, name, props) => {
                            if (name === 'averageGrade') return [value, 'Average Grade'];
                            return [value, 'Records with Grades']; 
                          }}
                        />
                        <Legend />
                        <Bar dataKey="averageGrade" name="Average Grade" fill="#8b5cf6" />
                        <Bar dataKey="count" name="Records with Grades" fill="#c4b5fd" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Course Preferences by Student Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Course Preferences by Student Type</CardTitle>
                  <CardDescription>Top courses taken by each student type</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue={analytics.studentTypes.distribution[0]?.name || "all"} className="w-full">
                    <TabsList className="w-full justify-start flex-wrap border-b pb-px mb-4">
                      {analytics.studentTypes.distribution.map((type, index) => (
                        <TabsTrigger key={index} value={type.name} className="text-xs">
                          {type.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {analytics.studentTypes.distribution.map((type, index) => {
                      const courseData = analytics.studentTypes.coursesByType[type.name];
                      if (!courseData) return null;

                      // Format data for chart
                      const formattedData = Object.entries(courseData)
                        .sort(([, countA], [, countB]) => countB - countA)
                        .slice(0, 7) // Top 7 courses
                        .map(([course, count]) => ({
                          name: course,
                          count
                        }));

                      return (
                        <TabsContent key={index} value={type.name} className="mt-0">
                          <div className="h-[250px]">
                            {formattedData.length > 0 ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={formattedData}
                                  layout="vertical"
                                  margin={{ top: 5, right: 30, left: 70, bottom: 5 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis type="number" />
                                  <YAxis type="category" dataKey="name" width={65} />
                                  <Tooltip formatter={(value) => [value, 'Records']} />
                                  <Bar dataKey="count" fill={COLORS[index % COLORS.length]} />
                                </BarChart>
                              </ResponsiveContainer>
                            ) : (
                              <div className="h-full flex items-center justify-center text-gray-500">
                                No course data available for this student type
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      );
                    })}
                  </Tabs>
                </CardContent>
              </Card>
              
              {/* Status Analysis by Student Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Status Analysis by Student Type</CardTitle>
                  <CardDescription>Completion and status metrics for each student type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {analytics.studentTypes.distribution.map((type, index) => {
                      const statusData = analytics.studentTypes.statusByType[type.name];
                      if (!statusData) return null;

                      // Format status data
                      const statuses = Object.entries(statusData).map(([status, count]) => ({
                        status,
                        count,
                        percentage: ((count / analytics.studentTypes.countsByType[type.name]) * 100).toFixed(1)
                      }));

                      // Calculate completion percentage
                      const completedCount = statusData['Completed'] || 0;
                      const totalCount = analytics.studentTypes.countsByType[type.name];
                      const completionPercentage = ((completedCount / totalCount) * 100).toFixed(1);

                      return (
                        <div key={index} className="pb-4 border-b border-gray-200 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">{type.name}</h4>
                            <Badge 
                              style={{ 
                                backgroundColor: `${COLORS[index % COLORS.length]}20`,
                                color: COLORS[index % COLORS.length],
                                borderColor: `${COLORS[index % COLORS.length]}40`
                              }}
                            >
                              {totalCount} records
                            </Badge>
                          </div>
                          
                          {/* Status breakdown */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {statuses.map((status, statusIndex) => (
                              <Badge 
                                key={statusIndex}
                                variant="outline" 
                                className="text-xs"
                                style={{
                                  backgroundColor: status.status === 'Completed' ? '#d1fae5' : 
                                                  status.status === 'Active' ? '#e0f2fe' : '#f3f4f6',
                                  color: status.status === 'Completed' ? '#065f46' :
                                        status.status === 'Active' ? '#0369a1' : '#4b5563',
                                  borderColor: status.status === 'Completed' ? '#a7f3d0' :
                                              status.status === 'Active' ? '#bae6fd' : '#e5e7eb',
                                }}
                              >
                                {status.status}: {status.count} ({status.percentage}%)
                              </Badge>
                            ))}
                          </div>

                          {/* Completion progress */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Completion Rate</span>
                              <span className="font-medium">{completionPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full" 
                                style={{ 
                                  width: `${completionPercentage}%`, 
                                  backgroundColor: COLORS[index % COLORS.length] 
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Average Grade Analysis */}
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-indigo-800 mb-2 flex items-center">
                  <Award className="h-4 w-4 mr-2" /> Performance Insights by Student Type
                </h3>
                <div className="space-y-3">
                  {Object.entries(analytics.studentTypes.gradesByType)
                    .sort(([, a], [, b]) => parseFloat(b.averageGrade) - parseFloat(a.averageGrade))
                    .map(([type, data], index) => {
                      if (parseFloat(data.averageGrade) <= 0) return null;
                      
                      return (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-indigo-700">{type}</span>
                          <div className="flex items-center">
                            <span className="font-medium text-indigo-800">
                              Avg: {data.averageGrade}
                            </span>
                            <Badge variant="outline" className="ml-2 bg-indigo-100 text-indigo-800 border-indigo-300">
                              {data.count} records
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Credits Analysis by Student Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Credits Analysis by Student Type</CardTitle>
                  <CardDescription>Total credits attempted by each student type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.entries(analytics.studentTypes.creditsByType)
                          .filter(([type, data]) => data.totalCredits > 0) 
                          .map(([type, data]) => ({
                            name: type,
                            totalCredits: data.totalCredits,
                            recordsWithCredits: data.recordsWithCredits,
                            avgCredits: parseFloat((data.totalCredits / data.recordsWithCredits).toFixed(1)),
                            avgCreditsPerStudent: parseFloat((data.totalCredits / data.uniqueStudentCount).toFixed(1))
                          }))}
                        margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => {
                            if (name === 'totalCredits') return [value, 'Total Credits'];
                            if (name === 'avgCredits') return [value, 'Avg Credits per Record'];
                            if (name === 'avgCreditsPerStudent') return [value, 'Avg Credits per Student'];
                            return [value, 'Records with Credits']; 
                          }}
                        />
                        <Legend />
                        <Bar dataKey="totalCredits" name="Total Credits" fill="#0ea5e9" />
                        <Bar dataKey="avgCredits" name="Avg Credits per Record" fill="#6366f1" />
                        <Bar dataKey="avgCreditsPerStudent" name="Avg Credits per Student" fill="#65a30d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" /> Credits Summary by Student Type
                </h3>
                <div className="space-y-3 mt-3">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-blue-700 border-b border-blue-200">
                        <th className="text-left py-1">Student Type</th>
                        <th className="text-right py-1">Total Credits</th>
                        <th className="text-right py-1">Records</th>
                        <th className="text-right py-1">Avg Credits</th>
                        <th className="text-right py-1">Number of Students</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(analytics.studentTypes.creditsByType)
                        .sort(([, a], [, b]) => b.totalCredits - a.totalCredits)
                        .map(([type, data], index) => {
                          if (data.totalCredits <= 0) return null;
                          const avgCredits = data.uniqueStudentCount > 0 ? 
                            (data.totalCredits / data.uniqueStudentCount).toFixed(1) : '0.0';
                          
                          return (
                            <tr key={index} className="border-b border-blue-100 last:border-0">
                              <td className="py-2 text-blue-800 font-medium">{type}</td>
                              <td className="py-2 text-right text-blue-700 font-medium">{data.totalCredits}</td>
                              <td className="py-2 text-right text-blue-600">{data.recordsWithCredits}</td>
                              <td className="py-2 text-right text-blue-700">{avgCredits}</td>
                              <td className="py-2 text-right text-blue-700">{data.uniqueStudentCount || 0}</td>
                            </tr>
                          );
                        })}
                        <tr className="bg-blue-100 font-medium">
                          <td className="py-2 text-blue-900">Total</td>
                          <td className="py-2 text-right text-blue-900">
                            {Object.values(analytics.studentTypes.creditsByType).reduce((sum, data) => sum + data.totalCredits, 0)}
                          </td>
                          <td className="py-2 text-right text-blue-900">
                            {Object.values(analytics.studentTypes.creditsByType).reduce((sum, data) => sum + data.recordsWithCredits, 0)}
                          </td>
                          <td className="py-2 text-right text-blue-900"></td>
                          <td className="py-2 text-right text-blue-900">
                            {Object.values(analytics.studentTypes.creditsByType).reduce((sum, data) => sum + (data.uniqueStudentCount || 0), 0)}
                          </td>
                        </tr>
                    </tbody>
                  </table>
                </div>
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
              onClick={() => downloadAnonymousData('csv')}
              disabled={!analytics.totalRecords}
            >
              <Download className="h-4 w-4 mr-1" /> Export CSV (Anonymous)
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadJSON}
              disabled={!analytics.totalRecords}
            >
              <Download className="h-4 w-4 mr-1" /> Export JSON
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => downloadAnonymousData('json')}
              disabled={!analytics.totalRecords}
            >
              <Download className="h-4 w-4 mr-1" /> Export JSON (Anonymous)
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