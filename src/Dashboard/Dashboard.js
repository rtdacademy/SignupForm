import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaPlusCircle, FaCalendar, FaBook, FaClock, FaExternalLinkAlt } from 'react-icons/fa';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '../components/ui/sheet';
import CourseDetails from './CourseDetails';

const CourseCard = ({ course, onClick }) => {
  const courseName = course.Course?.Value.replace('(3E)', '').trim() || 'Course Name';
  const isActive = course.ActiveFutureArchived?.Value === 'Active';
  const statusColor = isActive ? 'bg-green-700 text-white' : 'bg-gray-300 text-gray-700';
  const statusText = isActive ? 'Active' : 'Not Active';

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Card className="mb-4 hover:shadow-lg transition-shadow duration-300 w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-semibold">{courseName}</h4>
          <div className="flex gap-2">
            <Badge className={statusColor}>
              {statusText}
            </Badge>
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              {course.Status?.Value || 'Status'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <p className="text-sm text-gray-600"><FaBook className="inline mr-2" />School Year: {course.School_x0020_Year?.Value}</p>
          <p className="text-sm text-gray-600"><FaUser className="inline mr-2" />Teacher: {course.ResponsibleTeacher?.Value}</p>
          <p className="text-sm text-gray-600"><FaClock className="inline mr-2" />Last Login: {formatDate(course.LastLogin)}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onClick(course)} className="flex-1">View Details</Button>
          <Link 
            to={`/course?cid=${course.CourseID}`}
            className="flex-1"
          >
            <Button className="w-full">
              <FaExternalLinkAlt className="mr-2" />
              Go to Course
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

const Dashboard = ({ studentData }) => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [sortedCourses, setSortedCourses] = useState([]);

  useEffect(() => {
    if (studentData && studentData.courses) {
      const coursesArray = Object.values(studentData.courses);
      const sorted = coursesArray.sort((a, b) => new Date(b.Created) - new Date(a.Created));
      setSortedCourses(sorted);
    }
  }, [studentData]);

  const profile = studentData?.profile || {};

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
  };

  const handleBackToDashboard = () => {
    setSelectedCourse(null);
  };

  if (selectedCourse) {
    return <CourseDetails course={selectedCourse} onBack={handleBackToDashboard} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Register for a New Course Button */}
      <div className="mb-6">
        <Button
          variant="default"
          className="w-full bg-secondary hover:bg-secondary/90 text-white text-lg py-3"
        >
          <Link to="/register" className="flex items-center justify-center">
            <FaPlusCircle className="mr-2" /> Register for a New Course
          </Link>
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Courses and Message Center */}
        <div className="lg:w-2/3 space-y-6">
          {/* Courses Section */}
          <Card className="overflow-hidden">
            <CardHeader>
              <h3 className="text-xl font-semibold">My Courses</h3>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              {sortedCourses.map((course) => (
                <CourseCard key={course.ID} course={course} onClick={() => handleCourseSelect(course)} />
              ))}
            </CardContent>
          </Card>

          {/* Message Center */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Message Center</h3>
            </CardHeader>
            <CardContent>
              <p>Message center content will be displayed here.</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Profile and Schedule */}
        <div className="lg:w-1/3 space-y-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Profile</h3>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => setIsProfileOpen(true)}>
                <FaUser className="mr-2" /> View Profile
              </Button>
            </CardContent>
          </Card>

          {/* Book Office Hours / Exam Block */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Schedule</h3>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <FaCalendar className="mr-2" /> Book Office Hours / Exam Block
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Profile Sheet */}
      <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Your Profile</SheetTitle>
            <SheetDescription>
              View and edit your profile information
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                Name
              </label>
              <input id="name" value={profile.firstName || ''} className="col-span-3" readOnly />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email" className="text-right">
                Email
              </label>
              <input id="email" value={profile.StudentEmail || ''} className="col-span-3" readOnly />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="phone" className="text-right">
                Phone
              </label>
              <input id="phone" value={profile.StudentPhone || ''} className="col-span-3" readOnly />
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="button">Close</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Dashboard;