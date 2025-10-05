import React, { useState, useEffect } from 'react';
import { ArrowRight, BookOpen, Menu, X, LogOut, User, Info, MapPin, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/accordion';
import { useNavigate } from 'react-router-dom';
import { auth, analytics } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { logEvent } from 'firebase/analytics';
import { getCourseById } from '../components/PrerequisiteFlowChart/courseData';
import { courses } from './courseData';

// RTD Logo Component
const RTDLogo = ({ className = "w-10 h-10" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 75 75"
    className={className}
    role="img"
    aria-label="RTD Academy Logo"
  >
    <g transform="translate(10, 15)">
      <polygon points="40 0 46.5 12 53 24 40 24 27 24 33.5 12 40 0" fill="#0F766E"/>
      <polygon points="53 24 59.5 36 66 48 53 48 40 48 46.5 36 53 24" fill="#E0FFFF"/>
      <polygon points="27 24 33.5 36 40 48 27 48 14 48 20.5 36 27 24" fill="#14B8A6"/>
    </g>
  </svg>
);

const OpenCoursesDashboard = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCourseInfo, setShowCourseInfo] = useState(false);
  const [selectedCourseForInfo, setSelectedCourseForInfo] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Redirect to open courses entry if not authenticated
        navigate('/open-courses');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track page view with Firebase Analytics
  useEffect(() => {
    if (user) {
      logEvent(analytics, 'page_view', {
        page_title: 'Open Courses Dashboard',
        page_path: '/open-courses-dashboard',
        page_location: window.location.href
      });
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/open-courses');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleStartLearning = (course) => {
    if (course.url === '#') {
      alert('This course is not yet available. Please check back later.');
      return;
    }
    navigate(`/open-courses/view/${course.id}`);
  };

  const handleShowCourseInfo = (courseId) => {
    const courseData = getCourseById(courseId);
    if (courseData) {
      setSelectedCourseForInfo(courseData);
      setShowCourseInfo(true);
    }
  };

  const handleOpenFlowChart = (courseId = null) => {
    // Open flowchart in a new window
    const url = courseId
      ? `/prerequisites?course=${courseId}`
      : '/prerequisites';
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Course Information Modal Component
  const CourseInfoModal = () => {
    if (!showCourseInfo || !selectedCourseForInfo) return null;

    const course = selectedCourseForInfo;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
        onClick={() => setShowCourseInfo(false)}
      >
        <div
          className="bg-white shadow-2xl w-full md:w-[80%] h-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{course.code}</h2>
              {course.name !== course.code && (
                <p className="text-lg text-gray-600">{course.name}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <span>{course.credits} credits</span>
                <span>Grade {course.grade}</span>
                {course.diplomaExam && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                    Diploma Exam Required
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowCourseInfo(false)}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none ml-4"
            >
              ×
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-120px)]">
            {/* Course Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Description</h3>
              <p className="text-gray-700">{course.description}</p>
              {course.detailedInfo?.importance && (
                <p className="text-gray-600 mt-2 italic">{course.detailedInfo.importance}</p>
              )}
            </div>

            {/* Diploma Prep Info - Only for diploma courses */}
            {course.diplomaExam && (
              <div className="bg-gradient-to-br from-[#60A694]/5 via-[#60A694]/10 to-[#60A694]/5 border-2 border-[#60A694]/30 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <img
                    src="/RTDLearning/Logo_with_name.svg"
                    alt="Rock the Diploma"
                    className="h-16 w-auto flex-shrink-0"
                  />
                  <div>
                    <p className="text-gray-700 mb-3">
                      Get expert help preparing for your Alberta diploma exam with <span className="font-semibold" style={{color: '#60A694'}}>Rock the Diploma</span> from RTD Learning.
                    </p>
                    <Button
                      onClick={() => window.open('https://rtdlearning.com/', '_blank')}
                      className="text-white"
                      style={{backgroundColor: '#60A694'}}
                      size="sm"
                    >
                      Learn About Diploma Prep <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Prerequisites */}
            {course.prerequisites && course.prerequisites.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Prerequisites</h3>
                <div className="flex flex-wrap gap-2">
                  {course.prerequisites.map(prereqId => {
                    const prereq = getCourseById(prereqId);
                    return prereq ? (
                      <span key={prereqId} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                        {prereq.code}
                      </span>
                    ) : null;
                  })}
                </div>
                {course.recommendedGrade && (
                  <p className="text-sm text-gray-600 mt-2">
                    Recommended: {course.recommendedGrade}% or higher in prerequisite courses
                  </p>
                )}
              </div>
            )}

            {/* Skills Developed */}
            {course.detailedInfo?.skills && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills You'll Develop</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {course.detailedInfo.skills.map((skill, index) => (
                    <div key={index} className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Career Pathways */}
            {course.careerPathways && course.careerPathways.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Career Pathways</h3>
                <p className="text-gray-600 mb-3">This course opens doors to careers in:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {course.careerPathways.map((career, index) => (
                    <div key={index} className="bg-purple-50 text-purple-800 px-3 py-2 rounded-lg text-sm">
                      {career}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* University Programs */}
            {course.universityPrograms && course.universityPrograms.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">University Programs</h3>
                <p className="text-gray-600 mb-3">This course is typically required or recommended for:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {course.universityPrograms.map((program, index) => (
                    <div key={index} className="bg-blue-50 text-blue-800 px-3 py-2 rounded-lg text-sm">
                      {program}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Next Steps</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {course.leadsTo && course.leadsTo.length > 0 ? (
                  <div>
                    <p className="text-gray-700 mb-2">After completing this course, you can take:</p>
                    <div className="flex flex-wrap gap-2">
                      {course.leadsTo.map(nextId => {
                        const nextCourse = getCourseById(nextId);
                        return nextCourse ? (
                          <span key={nextId} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                            {nextCourse.code}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700">
                    This is a final course in this pathway. You're ready for post-secondary studies or the workforce!
                  </p>
                )}
              </div>
            </div>

            {/* View Prerequisites Button */}
            <div className="pt-4 border-t">
              <Button
                onClick={() => handleOpenFlowChart(course.id)}
                className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
              >
                <MapPin className="h-5 w-5 mr-2" />
                View Interactive Prerequisites Flowchart
                <ExternalLink className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-teal-600 mx-auto" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-lg py-2' : 'bg-teal-700 py-3'
      }`}>
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between">
            {/* Logo Button - Clickable */}
            <button
              onClick={() => window.location.href = 'https://www.rtdacademy.com/'}
              className={`${
                scrolled
                  ? 'shadow-md hover:shadow-lg'
                  : 'bg-gradient-to-r from-gray-100/95 to-teal-50/95 backdrop-blur shadow-lg hover:shadow-xl'
              } rounded-lg px-3 py-2 transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95`}
            >
              <RTDLogo className="w-8 h-8" />
              <span className={`font-bold text-base ${
                scrolled
                  ? 'text-gray-900'
                  : 'bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 bg-clip-text text-transparent'
              }`}>
                RTD Academy
              </span>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <div className={`flex items-center gap-2 ${
                scrolled ? 'text-gray-700' : 'text-white/90'
              }`}>
                <User className="w-4 h-4" />
                <span className="text-sm">{user?.email}</span>
              </div>
              <Button
                onClick={handleSignOut}
                className={`${
                  scrolled
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-white/10 text-white hover:bg-white/20'
                } flex items-center gap-2`}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 transition-colors ${
                scrolled ? 'text-gray-700' : 'text-white'
              }`}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </nav>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg p-6 space-y-4">
              <div className="flex items-center gap-2 text-gray-700 pb-4 border-b">
                <User className="w-4 h-4" />
                <span className="text-sm">{user?.email}</span>
              </div>
              <Button
                onClick={handleSignOut}
                className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-white shadow-sm pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <BookOpen className="w-12 h-12 md:w-14 md:h-14 text-green-600" />
              <h1 className="text-4xl md:text-5xl font-bold">
                <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                  Open Courses
                </span>
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              Welcome! Explore our complete curriculum materials for free. Select a course below to get started.
            </p>
            <Button
              onClick={() => handleOpenFlowChart()}
              variant="outline"
              className="inline-flex items-center gap-2 border-2 border-teal-600 text-teal-600 hover:bg-teal-50"
            >
              <MapPin className="h-5 w-5" />
              View Course Prerequisites & Pathways
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mathematics Courses */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Mathematics
            </span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.mathematics.map((course) => (
              <Card key={course.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900">{course.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">{course.description}</p>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleStartLearning(course)}
                      className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white"
                    >
                      Open Course <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleShowCourseInfo(course.id)}
                      variant="outline"
                      className="px-3"
                      title="Course Information"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Diploma Exam Accordion */}
                  {course.diplomaExam && (
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="diploma-prep" className="border-2 border-[#60A694]/30 bg-gradient-to-br from-[#60A694]/5 via-[#60A694]/10 to-[#60A694]/5">
                        <AccordionTrigger className="hover:bg-[#60A694]/10 px-4 py-2">
                          <span className="text-white text-xs font-semibold px-3 py-1 rounded-full" style={{backgroundColor: '#60A694'}}>
                            Diploma Exam
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="px-4 pb-3 pt-1">
                            <div className="flex flex-col items-center gap-3">
                              <img
                                src="/RTDLearning/Logo_with_name.svg"
                                alt="Rock the Diploma"
                                className="h-12 w-auto"
                              />
                              <p className="text-sm text-gray-700 text-center">
                                Get expert help preparing for your Alberta diploma exam with <span className="font-semibold" style={{color: '#60A694'}}>Rock the Diploma</span>. Live prep sessions and online courses designed to help you succeed.
                              </p>
                              <Button
                                onClick={() => window.open('https://rtdlearning.com/', '_blank')}
                                className="w-full text-white"
                                style={{backgroundColor: '#60A694'}}
                                size="sm"
                              >
                                Diploma Prep Info <ExternalLink className="ml-2 h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Physics Courses */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Physics
            </span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.physics.map((course) => (
              <Card key={course.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl text-gray-900">{course.name}</CardTitle>
                    {course.comingSoon && (
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap">
                        Coming Soon
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">{course.description}</p>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleStartLearning(course)}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      disabled={course.comingSoon}
                    >
                      {course.comingSoon ? 'Coming Soon' : 'Open Course'} {!course.comingSoon && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                    <Button
                      onClick={() => handleShowCourseInfo(course.id)}
                      variant="outline"
                      className="px-3"
                      title="Course Information"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Diploma Exam Accordion */}
                  {course.diplomaExam && (
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="diploma-prep" className="border-2 border-[#60A694]/30 bg-gradient-to-br from-[#60A694]/5 via-[#60A694]/10 to-[#60A694]/5">
                        <AccordionTrigger className="hover:bg-[#60A694]/10 px-4 py-2">
                          <span className="text-white text-xs font-semibold px-3 py-1 rounded-full" style={{backgroundColor: '#60A694'}}>
                            Diploma Exam
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="px-4 pb-3 pt-1">
                            <div className="flex flex-col items-center gap-3">
                              <img
                                src="/RTDLearning/Logo_with_name.svg"
                                alt="Rock the Diploma"
                                className="h-12 w-auto"
                              />
                              <p className="text-sm text-gray-700 text-center">
                                Get expert help preparing for your Alberta diploma exam with <span className="font-semibold" style={{color: '#60A694'}}>Rock the Diploma</span>. Live prep sessions and online courses designed to help you succeed.
                              </p>
                              <Button
                                onClick={() => window.open('https://rtdlearning.com/', '_blank')}
                                className="w-full text-white"
                                style={{backgroundColor: '#60A694'}}
                                size="sm"
                              >
                                Diploma Prep Info <ExternalLink className="ml-2 h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Rock the Diploma Section */}
        <Card className="bg-gradient-to-br from-[#60A694]/5 via-[#60A694]/10 to-[#60A694]/5 border-2 border-[#60A694]/30 shadow-xl mb-12">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Logo */}
              <div className="flex-shrink-0">
                <img
                  src="/RTDLearning/Logo_with_name.svg"
                  alt="Rock the Diploma"
                  className="h-16 md:h-20 w-auto"
                />
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Preparing for Your Diploma Exams?
                </h2>
                <p className="text-gray-700 mb-4 text-lg">
                  While these courses are free to learn, Alberta diploma exams require focused preparation.
                  <span className="font-semibold" style={{color: '#60A694'}}> Rock the Diploma</span> from RTD Learning offers expert support:
                </p>
                <div className="grid md:grid-cols-2 gap-3 mb-6 text-left">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{backgroundColor: '#60A694'}}></span>
                    <span className="text-gray-700">Live diploma prep sessions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{backgroundColor: '#60A694'}}></span>
                    <span className="text-gray-700">Online diploma prep courses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{backgroundColor: '#60A694'}}></span>
                    <span className="text-gray-700">Expert instructors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{backgroundColor: '#60A694'}}></span>
                    <span className="text-gray-700">Proven exam strategies</span>
                  </div>
                </div>
                <Button
                  onClick={() => window.open('https://rtdlearning.com/', '_blank')}
                  className="text-white text-lg px-8 py-6 transition-all hover:brightness-110"
                  style={{backgroundColor: '#60A694'}}
                >
                  Get Diploma Exam Help <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credit Courses CTA */}
        <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 shadow-lg">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* RTD Academy Logo */}
              <div className="flex-shrink-0">
                <div className="bg-gradient-to-r from-gray-100/95 to-teal-50/95 backdrop-blur shadow-lg rounded-lg px-3 py-2 flex items-center gap-2">
                  <RTDLogo className="w-10 h-10 md:w-12 md:h-12" />
                  <span className="font-bold text-base md:text-lg bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 bg-clip-text text-transparent">
                    RTD Academy
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Need Official High School Credits?
                </h2>
                <p className="text-gray-700 mb-4">
                  Our Credit Courses provide the same quality curriculum with full teacher support,
                  assessments, and official Alberta high school credits upon completion.
                </p>
                <p className="text-sm text-gray-500 italic mb-6">
                  Note: If you are already enrolled in this course with your primary school or another school, you will not be permitted to register for credit.
                </p>
                <Button
                  onClick={() => window.location.href = '/#courses'}
                  className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white text-lg px-8 py-6"
                >
                  Learn About Credit Courses <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-sm text-gray-500 pb-8">
        <p>&copy; {new Date().getFullYear()} RTD Academy</p>
      </footer>

      {/* Course Information Modal */}
      <CourseInfoModal />
    </div>
  );
};

export default OpenCoursesDashboard;
