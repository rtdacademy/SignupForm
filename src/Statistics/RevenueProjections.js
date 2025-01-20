import React, { useState, useEffect, useMemo } from 'react';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "../components/ui/tooltip";
import { STUDENT_TYPE_OPTIONS, getStudentTypeInfo } from '../config/DropdownOptions';
import { useCourse } from '../context/CourseContext';

const RevenueProjections = ({ summariesData, selectedSchoolYear }) => {
    const [courseCredits, setCourseCredits] = useState({});
    const [rateSettings, setRateSettings] = useState({
      'Non-Primary': 107,
      'Summer School': 108,
      'Home Education': 650,
      'Adult Student': 650,
      'International Student': 650
    });
    const [isEditing, setIsEditing] = useState(false);
    const { getAllCourses } = useCourse();
    const courses = useMemo(() => getAllCourses(), [getAllCourses]);
  
    // Load saved projections from Firebase
    useEffect(() => {
      const db = getDatabase();
      const projectionsRef = ref(db, `projections/${selectedSchoolYear}`);
      
      onValue(projectionsRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (data.courseCredits) setCourseCredits(data.courseCredits);
          if (data.rateSettings) setRateSettings(data.rateSettings);
        }
      });
    }, [selectedSchoolYear]);
  
    // Save projections to Firebase
    const saveProjections = async () => {
      const db = getDatabase();
      const projectionsRef = ref(db, `projections/${selectedSchoolYear}`);
      await set(projectionsRef, {
        courseCredits,
        rateSettings,
        lastUpdated: new Date().toISOString()
      });
      setIsEditing(false);
    };
  
    // Calculate revenue projections
    const projections = useMemo(() => {
      const studentTypeMap = new Map();
      const calculationDetails = new Map();
  
      // First pass: Group students by type and track their enrollments
      summariesData.forEach(student => {
        if (!student) return;
        if (student.School_x0020_Year_Value !== selectedSchoolYear) return;
        if (student.Status_Value === '✗ Removed (Not Funded)') return;
  
        const type = student.StudentType_Value;
        if (!type) return;
  
        if (!studentTypeMap.has(type)) {
          studentTypeMap.set(type, {
            uniqueStudents: new Set(),
            courseEnrollments: new Map(),
            courseDetails: {} // Store enrollment details per course
          });
        }
  
        const typeData = studentTypeMap.get(type);
        const email = student.StudentEmail;
        typeData.uniqueStudents.add(email);
  
        const courseId = student.CourseID;
        if (!typeData.courseEnrollments.has(courseId)) {
          typeData.courseEnrollments.set(courseId, new Set());
          typeData.courseDetails[courseId] = {
            title: courses[courseId]?.Title || 'Unknown Course',
            enrollments: 0,
            credits: courseCredits[courseId] || 0
          };
        }
        typeData.courseEnrollments.get(courseId).add(email);
        typeData.courseDetails[courseId].enrollments = typeData.courseEnrollments.get(courseId).size;
      });
  
      // Calculate revenue for each student type
      const revenueByType = {};
      let totalGrantRevenue = 0;
      let totalRevenue = 0;
  
      studentTypeMap.forEach((data, type) => {
        let typeRevenue = 0;
        let details = [];
        const rate = rateSettings[type] || 0;
  
        switch (type) {
          case 'Non-Primary':
          case 'Summer School': {
            Object.entries(data.courseDetails).forEach(([courseId, courseData]) => {
              const courseRevenue = rate * courseData.credits * courseData.enrollments;
              typeRevenue += courseRevenue;
              details.push(
                `${courseData.title}: ${courseData.enrollments} students × ${courseData.credits} credits × $${rate} = $${courseRevenue.toFixed(2)}`
              );
            });
            totalGrantRevenue += typeRevenue;
            break;
          }
  
          case 'Home Education': {
            typeRevenue = rate * data.uniqueStudents.size;
            details.push(
              `${data.uniqueStudents.size} unique students × $${rate} = $${typeRevenue.toFixed(2)}`
            );
            totalGrantRevenue += typeRevenue;
            break;
          }
  
          case 'Adult Student':
          case 'International Student': {
            let totalEnrollments = 0;
            Object.values(data.courseDetails).forEach(courseData => {
              const courseRevenue = rate * courseData.enrollments;
              typeRevenue += courseRevenue;
              details.push(
                `${courseData.title}: ${courseData.enrollments} enrollments × $${rate} = $${courseRevenue.toFixed(2)}`
              );
              totalEnrollments += courseData.enrollments;
            });
            break;
          }
        }
  
        revenueByType[type] = {
          revenue: typeRevenue,
          uniqueStudents: data.uniqueStudents.size,
          totalEnrollments: Array.from(data.courseEnrollments.values()).reduce((sum, students) => sum + students.size, 0),
          calculationDetails: details
        };
  
        totalRevenue += typeRevenue;
      });
  
      // Calculate admin grant
      const adminGrant = totalGrantRevenue * 0.05;
      totalRevenue += adminGrant;
  
      return {
        byType: revenueByType,
        adminGrant,
        totalGrantRevenue,
        total: totalRevenue
      };
    }, [summariesData, selectedSchoolYear, courseCredits, rateSettings, courses]);
  
    const renderCalculationTooltip = (type, data) => {
      if (!data) return null;
  
      return (
        <div className="space-y-2 max-w-md">
          <p className="font-medium">Calculation Details:</p>
          {data.calculationDetails.map((detail, index) => (
            <p key={index} className="text-sm">{detail}</p>
          ))}
          <p className="text-sm font-medium mt-2">
            Total Revenue: ${data.revenue.toFixed(2)}
          </p>
        </div>
      );
    };
  
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Revenue Projections</h2>
          <div className="space-x-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={saveProjections}>
                  Save Projections
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Edit Projections
              </Button>
            )}
          </div>
        </div>
  
        {/* Course Credits Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Course Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(courses).map(([courseId, course]) => (
                <div key={courseId} className="flex items-center space-x-2">
                  <span className="flex-grow">{course.Title}</span>
                  <Input
                    type="number"
                    value={courseCredits[courseId] || ''}
                    disabled={!isEditing}
                    onChange={(e) => setCourseCredits(prev => ({
                      ...prev,
                      [courseId]: parseFloat(e.target.value) || 0
                    }))}
                    className="w-24"
                    placeholder="Credits"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
  
        {/* Revenue Settings and Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Student Type</CardTitle>
          </CardHeader>
          <CardContent>
            <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Type</TableHead>
                    <TableHead>Rate ($)</TableHead>
                    <TableHead>Unique Students</TableHead>
                    <TableHead>Total Enrollments</TableHead>
                    <TableHead className="text-right">Projected Revenue ($)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {STUDENT_TYPE_OPTIONS.map(type => {
                    const typeData = projections.byType[type.value] || {
                      revenue: 0,
                      uniqueStudents: 0,
                      totalEnrollments: 0,
                      calculationDetails: []
                    };
  
                    return (
                      <Tooltip key={type.value}>
                        <TooltipTrigger asChild>
                          <TableRow className="cursor-help">
                            <TableCell className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: type.color }}
                              />
                              <span>{type.value}</span>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={rateSettings[type.value]}
                                disabled={!isEditing}
                                onChange={(e) => setRateSettings(prev => ({
                                  ...prev,
                                  [type.value]: parseFloat(e.target.value) || 0
                                }))}
                                className="w-24"
                              />
                            </TableCell>
                            <TableCell>{typeData.uniqueStudents}</TableCell>
                            <TableCell>{typeData.totalEnrollments}</TableCell>
                            <TableCell className="text-right font-medium">
                              {typeData.revenue.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        </TooltipTrigger>
                        <TooltipContent align="start" className="p-4 max-w-[400px]">
                          {renderCalculationTooltip(type.value, typeData)}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                  {/* Admin Grant Row */}
                  <TableRow className="bg-gray-50">
                    <TableCell colSpan={4}>
                      <Tooltip>
                        <TooltipTrigger className="cursor-help">
                          System Admin Grant (5% of Grant Funding)
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>5% of total grant revenue (Non-Primary, Summer School, and Home Education)</p>
                          <p className="mt-1">Calculation: ${projections.totalGrantRevenue.toFixed(2)} × 5% = ${projections.adminGrant.toFixed(2)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {projections.adminGrant.toFixed(2)}
                    </TableCell>
                  </TableRow>
                  {/* Total Row */}
                  <TableRow className="font-bold">
                    <TableCell colSpan={4}>Total Projected Revenue</TableCell>
                    <TableCell className="text-right">{projections.total.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TooltipProvider>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  export default RevenueProjections;