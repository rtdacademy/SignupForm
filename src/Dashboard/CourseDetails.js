import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { FaCalendar, FaUser, FaGraduationCap, FaChartBar, FaArrowLeft, FaInfoCircle, FaCheckCircle, FaClock, FaIdCard, FaBirthdayCake } from 'react-icons/fa';

const InfoPopover = ({ content }) => (
  <Popover>
    <PopoverTrigger>
      <FaInfoCircle className="inline-block ml-2 text-gray-400 cursor-help" />
    </PopoverTrigger>
    <PopoverContent side="top" align="start" className="w-80 p-2 bg-white border border-gray-200 rounded shadow-lg">
      <div className="text-sm" dangerouslySetInnerHTML={{ __html: content }} />
    </PopoverContent>
  </Popover>
);

const CourseInfoItem = ({ icon: Icon, label, value, info }) => (
  <div className="flex items-center space-x-2 mb-2">
    <Icon className="text-gray-500" />
    <span className="font-medium">{label}:</span>
    <Badge className="bg-white text-black border border-gray-300">{value}</Badge>
    {info && <InfoPopover content={info} />}
  </div>
);

const StatusBadge = ({ status }) => {
  const isActive = status === 'Active';
  return (
    <Badge 
      variant="outline"
      className={`
        absolute top-4 right-4 
        ${isActive ? 'bg-green-700 text-white' : 'bg-gray-300 text-gray-700'}
      `}
    >
      {isActive ? 'Active' : 'Not Active'}
    </Badge>
  );
};

const CourseDetails = ({ course, onBack }) => {
  const [activeTab, setActiveTab] = useState('info');

  const showDiplomaMonth = [89, 86, 70].includes(course.CourseID) && course.DiplomaMonthChoices.Value;

  const sanitizeAndStyleActivityLog = (html) => {
    // Basic sanitization (you might want to use a proper sanitization library in production)
    const sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Add Tailwind CSS classes to the table
    return sanitized.replace('<table', '<table class="min-w-full divide-y divide-gray-200"')
                   .replace('<thead', '<thead class="bg-gray-50"')
                   .replace(/<th/g, '<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"')
                   .replace('<tbody', '<tbody class="bg-white divide-y divide-gray-200"')
                   .replace(/<td/g, '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"');
  };


  const formatLastLogin = (lastLogin) => {
    return `
      <table class="min-w-full divide-y divide-gray-200 mb-4">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${lastLogin}</td>
          </tr>
        </tbody>
      </table>
    `;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button onClick={onBack} className="mb-4">
        <FaArrowLeft className="mr-2" /> Back to Dashboard
      </Button>
      <h2 className="text-3xl font-bold mb-6">{course.Course.Value}</h2>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">Course Info</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="gradebook">Gradebook</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card className="relative">
            <CardHeader>
              <h3 className="text-xl font-semibold">Course Information</h3>
              <StatusBadge status={course.ActiveFutureArchived.Value} />
            </CardHeader>
            <CardContent>
              <CourseInfoItem 
                icon={FaCalendar}
                label="School Year"
                value={course.School_x0020_Year.Value}
              />
              <CourseInfoItem 
                icon={FaUser}
                label="Teacher"
                value={course.ResponsibleTeacher.Value}
              />
              <CourseInfoItem 
                icon={FaCheckCircle}
                label="Status"
                value={course.Status.Value}
                info="This is your current status in the course. It's determined by your teacher or RTD Academy staff based on your schedule and progress. Some automated systems may also update this status. If you believe your status is inaccurate, please contact your teacher or our support team for clarification."
              />
              <CourseInfoItem 
                icon={FaGraduationCap}
                label="Student Type"
                value={course.StudentType.Value}
                info="This classification determines the grant that our school receives for your enrollment. It helps us provide appropriate resources and support for your education."
              />
              {showDiplomaMonth && (
                <CourseInfoItem 
                  icon={FaClock}
                  label="Diploma Month"
                  value={course.DiplomaMonthChoices.Value}
                  info="The month you're expected to receive your diploma."
                />
              )}
              <CourseInfoItem 
                icon={FaBirthdayCake}
                label="Over 18"
                value={course.Over18_x003f_.Value}
                info="Students under 18 require parent approval for certain activities and decisions related to their education."
              />
              <CourseInfoItem 
                icon={FaIdCard}
                label="Course on Transcript"
                value={course.PASI.Value}
                info="This indicates that RTD has registered you with Alberta Education and the course should now appear on your transcript. To view your transcript, sign in to your <a href='https://public.education.alberta.ca/PASI/mypass/welcome' target='_blank' rel='noopener noreferrer' class='text-blue-600 hover:underline'>MyPass account</a>. It may take up to a day for the course to appear. If you don't see your registration after 24 hours, please contact our registrar at <a href='mailto:stan@rtdacademy.com' class='text-blue-600 hover:underline'>stan@rtdacademy.com</a>."
              />
              <CourseInfoItem 
                icon={FaChartBar}
                label="Course Items Completed"
                value={`${course.CountAssignmentsComplete} / ${course.CountAllGradebookAssignments}`}
                info="This counts the number of assignments, homework, or exams in your gradebook that have been completed to an acceptable level. Note that if your teacher has exempted an assignment, this count may not be fully accurate."
              />
            </CardContent>
          </Card>
          
          {/* Progress Overview */}
          <Card className="mt-6">
            <CardHeader>
              <h3 className="text-xl font-semibold">Progress Overview</h3>
            </CardHeader>
            <CardContent>
              <div dangerouslySetInnerHTML={{ __html: course.ProgressBarsHTML }} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Recent Activity</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="overflow-x-auto">
                  <div dangerouslySetInnerHTML={{ __html: formatLastLogin(course.LastLogin) }} />
                  <div dangerouslySetInnerHTML={{ __html: sanitizeAndStyleActivityLog(course.ActivityLogLMS) }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gradebook">
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Gradebook</h3>
            </CardHeader>
            <CardContent>
              <div dangerouslySetInnerHTML={{ __html: course.GradebookHTML }} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Full Schedule</h3>
            </CardHeader>
            <CardContent>
              <div dangerouslySetInnerHTML={{ __html: course.Schedule }} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseDetails;