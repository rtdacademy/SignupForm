import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaPlusCircle, FaBook, FaClock, FaExternalLinkAlt, FaInfoCircle, FaWpforms } from 'react-icons/fa';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '../components/ui/sheet';
import FormDialog from '../Registration/FormDialog';
import CourseDetails from './CourseDetails';
import { useAuth } from '../context/AuthContext';
import { getDatabase, ref, get } from 'firebase/database';

// CustomAlert Component
const CustomAlert = ({ title, description, variant = 'info' }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getVariantStyles()}`}>
      <div className="flex items-center gap-2">
        <FaInfoCircle className="h-4 w-4" />
        <h3 className="font-semibold">{title}</h3>
      </div>
      {description && (
        <div className="mt-2 text-sm">
          {description}
        </div>
      )}
    </div>
  );
};

// CourseCard Component
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

// WelcomeMessage Component
const WelcomeMessage = ({ hasStudentNode, hasCourses }) => {
  if (!hasStudentNode) {
    return (
      <CustomAlert
        variant="info"
        title="Welcome to RTD Academy!"
        description="To get started, please click the 'Register for a New Course' button above to enroll in your first course."
      />
    );
  }
  
  if (!hasCourses) {
    return (
      <CustomAlert
        variant="info"
        title="Ready to Begin Your Learning Journey?"
        description="You're all set up! Click the 'Register for a New Course' button above to enroll in your first course."
      />
    );
  }

  return null;
};

const Dashboard = ({ studentData }) => {
  const { user, user_email_key } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [sortedCourses, setSortedCourses] = useState([]);
  const [hasStudentNode, setHasStudentNode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);

  useEffect(() => {
    const checkStudentNode = async () => {
      if (!user_email_key) return;
      
      try {
        const db = getDatabase();
        const studentRef = ref(db, `students/${user_email_key}`);
        const snapshot = await get(studentRef);
        setHasStudentNode(snapshot.exists());
      } catch (error) {
        console.error("Error checking student node:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkStudentNode();
  }, [user_email_key]);

  useEffect(() => {
    if (studentData && studentData.courses) {
      const coursesArray = Object.values(studentData.courses);
      const sorted = coursesArray.sort((a, b) => new Date(b.Created) - new Date(a.Created));
      setSortedCourses(sorted);
    }
  }, [studentData]);

  const profile = studentData?.profile || {};
  const hasCourses = sortedCourses.length > 0;

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
  };

  const handleBackToDashboard = () => {
    setSelectedCourse(null);
  };

  if (selectedCourse) {
    return <CourseDetails course={selectedCourse} onBack={handleBackToDashboard} />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Button
          variant="default"
          className="bg-secondary hover:bg-secondary/90 text-white text-lg py-3"
        >
          <Link to="/register" className="flex items-center justify-center w-full">
            <FaPlusCircle className="mr-2" /> Register for a New Course
          </Link>
        </Button>
        
        <FormDialog 
          trigger={
            <Button
              variant="outline"
              className="bg-primary hover:bg-primary/90 text-white text-lg py-3"
            >
              <FaWpforms className="mr-2" /> Open Student Form
            </Button>
          }
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
        />
      </div>

      {/* Welcome Message */}
      <div className="mb-6">
        <WelcomeMessage hasStudentNode={hasStudentNode} hasCourses={hasCourses} />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Courses */}
        <div className="lg:w-2/3 space-y-6">
          <Card className="overflow-hidden">
            <CardHeader>
              <h3 className="text-xl font-semibold">My Courses</h3>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              {hasCourses ? (
                sortedCourses.map((course) => (
                  <CourseCard key={course.ID} course={course} onClick={() => handleCourseSelect(course)} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No courses enrolled yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Profile */}
        <div className="lg:w-1/3 space-y-6">
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