import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Info, MapPin, ExternalLink, BookOpen } from 'lucide-react';
import { Button } from '../components/ui/button';
import { getCourseById } from '../components/PrerequisiteFlowChart/courseData';
import { getCourseByIdFromData } from './courseData';

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

const OpenCourseViewer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [showCourseInfo, setShowCourseInfo] = useState(false);
  const [selectedCourseForInfo, setSelectedCourseForInfo] = useState(null);

  useEffect(() => {
    const course = getCourseByIdFromData(courseId);
    if (course) {
      setCourseData(course);
    } else {
      // Course not found, redirect back to dashboard
      navigate('/open-courses-dashboard');
    }
  }, [courseId, navigate]);

  const handleClose = () => {
    navigate('/open-courses-dashboard');
  };

  const handleShowCourseInfo = (id) => {
    const course = getCourseById(id);
    if (course) {
      setSelectedCourseForInfo(course);
      setShowCourseInfo(true);
    }
  };

  const handleOpenFlowChart = (id = null) => {
    const url = id ? `/prerequisites?course=${id}` : '/prerequisites';
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

  if (!courseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-teal-600 mx-auto" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Course Viewer Header */}
      <div className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={handleClose}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            title="Back to Open Courses"
          >
            <RTDLogo className="w-6 h-6" />
            <span className="text-sm font-medium text-gray-700">Open Courses</span>
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <h2 className="text-lg font-semibold text-gray-900">{courseData.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleShowCourseInfo(courseData.id)}
            variant="outline"
            size="sm"
            className="text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            <Info className="h-4 w-4 mr-2" />
            Course Info
          </Button>
          <Button
            onClick={() => handleOpenFlowChart(courseData.id)}
            variant="outline"
            size="sm"
            className="text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Prerequisites
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Course Content Iframe */}
      <div className="flex-1 relative">
        <iframe
          src={courseData.url}
          className="absolute inset-0 w-full h-full border-none"
          title={courseData.name}
          allow="fullscreen"
        />
      </div>

      {/* Course Information Modal */}
      <CourseInfoModal />
    </div>
  );
};

export default OpenCourseViewer;
