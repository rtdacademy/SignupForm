import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Alert, AlertDescription } from "../components/ui/alert";
import { FaGraduationCap, FaUserTie, FaUsers, FaClock, FaBook, FaCalendarDay, FaExternalLinkAlt } from 'react-icons/fa';
import { InfoCircledIcon } from "@radix-ui/react-icons";

const formatDate = (dateString) => {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatExamDateTime = (examTime) => {
  if (!examTime) return 'Not set';
  
  const {
    displayDate,
    hour,
    minute,
    period,
    month
  } = examTime;

  const formattedTime = `${hour}:${minute.padStart(2, '0')} ${period}`;
  return {
    date: formatDate(displayDate),
    time: formattedTime,
    month
  };
};

const StaffCard = ({ title, staffObj }) => {
  const staffArray = staffObj ? Object.values(staffObj) : [];

  return (
    <Card className="bg-gray-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {title === 'Teachers' ? <FaUserTie className="text-gray-600" /> : <FaUsers className="text-gray-600" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {staffArray.map((person, index) => (
          <div key={index} className="text-sm">
            <div className="font-medium">{person.displayName}</div>
            <div className="text-gray-500">{person.email}</div>
          </div>
        ))}
        {staffArray.length === 0 && (
          <div className="text-sm text-gray-500">No {title.toLowerCase()} assigned</div>
        )}
      </CardContent>
    </Card>
  );
};

const UnitTable = ({ unit }) => {
  if (!unit.items || unit.items.length === 0) return null;

  return (
    <div className="mb-6">
      <h4 className="text-base font-semibold mb-3">{unit.name}</h4>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-gray-50">Item</TableHead>
              <TableHead className="bg-gray-50 w-32">Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {unit.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.title}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {item.type}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const CourseDetailsDialog = ({ isOpen, onOpenChange, course }) => {
  const courseDetails = course?.courseDetails || {};
  const isDiplomaCourse = courseDetails?.DiplomaCourse === "Yes";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <FaBook className="text-gray-600" />
            Course Details
          </DialogTitle>
         
        </DialogHeader>

        <ScrollArea className="h-[calc(80vh-8rem)]">
          <div className="space-y-6 pr-6">

          <Alert>
              <InfoCircledIcon className="h-4 w-4" />
              <AlertDescription>
                Once enrolled, this course will appear in your{' '}
                <a
                  href="https://public.education.alberta.ca/PASI/mypass/welcome"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline hover:text-primary"
                >
                  MyPass account
                </a>. 
                MyPass is the official transcript system for Alberta students - when schools or universities request proof of registration, they will see the same information you see in MyPass.
              </AlertDescription>
            </Alert>
            {/* Basic Course Information */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Course Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Course Name</div>
                  <div className="font-medium">{courseDetails.Title || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Course ID</div>
                  <div className="font-medium">{course.CourseID || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Grade</div>
                  <div className="font-medium">{courseDetails.grade || 'Not available'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Hours</div>
                  <div className="font-medium flex items-center gap-2">
                    <FaClock className="text-gray-400" />
                    {courseDetails.NumberOfHours || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-gray-200" />

            {/* Staff Information */}
            <div className="grid grid-cols-2 gap-4">
              <StaffCard 
                title="Teachers" 
                staffObj={courseDetails.teachers} 
              />
              <StaffCard 
                title="Support Staff" 
                staffObj={courseDetails.supportStaff} 
              />
            </div>

            {/* Diploma Course Information */}
            {isDiplomaCourse && courseDetails.diplomaTimes && courseDetails.diplomaTimes.length > 0 && (
              <>
                <Separator className="bg-gray-200" />
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FaGraduationCap className="text-gray-600" />
                      <h3 className="text-lg font-semibold">Diploma Information</h3>
                    </div>
                    <a
                      href="https://www.alberta.ca/diploma-exams-overview"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      More about diplomas <FaExternalLinkAlt className="h-3 w-3" />
                    </a>
                  </div>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        {courseDetails.diplomaTimes.map((examTime, index) => {
                          const { date, time, month } = formatExamDateTime(examTime);
                          return (
                            <div key={index} className="flex flex-col bg-gray-50 p-4 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-900">{month} Diploma</span>
                                <Badge variant="outline" className="bg-white">
                                  <FaCalendarDay className="mr-2 h-4 w-4" />
                                  {date}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600">
                                Exam Time: {time}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {/* Course Content */}
            {courseDetails.units && courseDetails.units.length > 0 && (
              <>
                <Separator className="bg-gray-200" />
                <div>
                  <h3 className="text-lg font-semibold mb-4">Course Content</h3>
                  {courseDetails.units.map((unit, index) => (
                    <UnitTable key={index} unit={unit} />
                  ))}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CourseDetailsDialog;