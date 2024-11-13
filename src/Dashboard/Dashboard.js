import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaPlusCircle, FaBook, FaClock, FaExternalLinkAlt, FaInfoCircle, FaWpforms } from 'react-icons/fa';
import { ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '../components/ui/sheet';
import FormDialog from '../Registration/FormDialog';
import CourseDetails from './CourseDetails';
import { useAuth } from '../context/AuthContext';
import { getDatabase, ref, get } from 'firebase/database';
import ProfileComponent from './ProfileComponent';

// Constants for triangle animation
const TRIANGLE_SIZE = 220;
const MOVEMENT_SPEED = 0.2;
const ROTATION_SPEED = 0.001;

// Moving Triangle Component
const MovingTriangle = ({ color, initialX, initialY, initialAngle }) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [angle, setAngle] = useState(initialAngle);
  const [direction, setDirection] = useState({
    x: Math.cos(initialAngle) * MOVEMENT_SPEED,
    y: Math.sin(initialAngle) * MOVEMENT_SPEED
  });
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });
  const requestRef = React.useRef();

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const updatePosition = () => {
      setPosition(prevPos => {
        let newX = prevPos.x + direction.x;
        let newY = prevPos.y + direction.y;
        let newDirection = { ...direction };

        if (newX <= -TRIANGLE_SIZE || newX >= dimensions.width) {
          newDirection.x = -direction.x;
        }
        if (newY <= -TRIANGLE_SIZE || newY >= dimensions.height) {
          newDirection.y = -direction.y;
        }

        setDirection(newDirection);
        return { x: newX, y: newY };
      });

      setAngle(prevAngle => prevAngle + ROTATION_SPEED);
      requestRef.current = requestAnimationFrame(updatePosition);
    };

    requestRef.current = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(requestRef.current);
  }, [direction, dimensions]);

  const points = `
    ${position.x + TRIANGLE_SIZE / 2},${position.y}
    ${position.x},${position.y + TRIANGLE_SIZE}
    ${position.x + TRIANGLE_SIZE},${position.y + TRIANGLE_SIZE}
  `;

  return (
    <polygon
      points={points}
      fill={color}
      opacity="0.15"
      transform={`rotate(${angle * (180 / Math.PI)} ${position.x + TRIANGLE_SIZE / 2} ${position.y + TRIANGLE_SIZE / 2})`}
    />
  );
};

// Animated Card Component
const AnimatedCard = ({ children, className = '' }) => {
  return (
    <div className={`group relative overflow-hidden transform transition-all duration-300 hover:scale-[1.02] ${className}`}>
      <div className="relative z-10">{children}</div>
      <div className="absolute inset-0 bg-gradient-to-br from-accent to-background transition-opacity duration-300 group-hover:opacity-100 opacity-0" />
    </div>
  );
};

// Custom Alert Component with new styling
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
    <AnimatedCard className={`rounded-lg border p-4 ${getVariantStyles()}`}>
      <div className="flex items-center gap-2">
        <FaInfoCircle className="h-4 w-4" />
        <h3 className="font-semibold">{title}</h3>
      </div>
      {description && (
        <div className="mt-2 text-sm">
          {description}
        </div>
      )}
    </AnimatedCard>
  );
};

// Course Card Component with new styling
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
    <AnimatedCard className="mb-4">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-background to-muted">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold flex items-center">
              <ChevronRight className="h-5 w-5 mr-2 text-primary" />
              {courseName}
            </h4>
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
            <Button onClick={() => onClick(course)} className="flex-1 bg-primary hover:bg-primary/90">View Details</Button>
            <Link to={`/course?cid=${course.CourseID}`} className="flex-1">
              <Button className="w-full bg-secondary hover:bg-secondary/90">
                <FaExternalLinkAlt className="mr-2" />
                Go to Course
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </AnimatedCard>
  );
};

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
    <div className="relative min-h-screen">
      {/* Background SVG layer */}
      <div className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none">
        <svg width="100%" height="100%" className="absolute top-0 left-0">
          <MovingTriangle
            color="#49a3a6"
            initialX={-100}
            initialY={-100}
            initialAngle={Math.random() * Math.PI * 2}
          />
          <MovingTriangle
            color="#b1dbda"
            initialX={typeof window !== 'undefined' ? window.innerWidth / 2 : 0}
            initialY={-150}
            initialAngle={Math.random() * Math.PI * 2}
          />
          <MovingTriangle
            color="#0d8081"
            initialX={typeof window !== 'undefined' ? window.innerWidth - 200 : 0}
            initialY={-50}
            initialAngle={Math.random() * Math.PI * 2}
          />
        </svg>
      </div>

      {/* Content layer */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Button
            variant="default"
            className="bg-[#FF705B] hover:bg-[#FF705B]/90 text-white text-lg py-3"
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
            <AnimatedCard>
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-background to-muted">
                  <h3 className="text-xl font-semibold flex items-center">
                    <ChevronRight className="h-6 w-6 mr-2 text-primary" />
                    My Courses
                  </h3>
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
            </AnimatedCard>
          </div>

          {/* Right Column: Profile */}
          <div className="lg:w-1/3 space-y-6">
            <AnimatedCard>
              <Card>
                <CardHeader className="bg-gradient-to-br from-background to-muted">
                  <h3 className="text-xl font-semibold flex items-center">
                    <ChevronRight className="h-6 w-6 mr-2 text-primary" />
                    Profile
                  </h3>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => setIsProfileOpen(true)}>
                    <FaUser className="mr-2" /> View Profile
                  </Button>
                </CardContent>
              </Card>
            </AnimatedCard>
          </div>
        </div>

        {/* Profile Sheet */}
        <ProfileComponent 
  isOpen={isProfileOpen}
  onOpenChange={setIsProfileOpen}
  profile={profile}
/>
      </div>
    </div>
  );
};

export default Dashboard;
