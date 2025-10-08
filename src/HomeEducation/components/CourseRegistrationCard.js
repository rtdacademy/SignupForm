import React, { useState, useEffect } from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  GraduationCap,
  BookOpen,
  Loader2,
} from 'lucide-react';
import { getAllStudentCourses, getCourseStatus, getCategoryForCourse } from '../../utils/courseManagementUtils';
import CourseActionSheet from './CourseActionSheet';
import RemoveCourseDialog from './RemoveCourseDialog';
import AddCourseInterface from './AddCourseInterface';
import { removeCourse } from '../../utils/courseManagementUtils';

/**
 * Get status badge for a course
 */
const getStatusBadge = (status) => {
  if (!status) {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
        <Circle className="w-3 h-3 mr-1" />
        New
      </Badge>
    );
  }

  // Check if registrar confirmed mark submitted to PASI (FINAL STATE)
  if (status.registrarConfirmedMark && status.finalMark) {
    return (
      <Badge className="bg-green-100 text-green-700 border-green-300">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Added to PASI: {status.finalMark}%
      </Badge>
    );
  }

  // Check if mark has been entered by teacher (not null, undefined, or empty string)
  if (status.finalMark !== null && status.finalMark !== undefined && status.finalMark !== '') {
    return (
      <Badge className="bg-blue-100 text-blue-700 border-blue-300">
        <GraduationCap className="w-3 h-3 mr-1" />
        Pending Mark: {status.finalMark}%
      </Badge>
    );
  }

  // Check if registrar confirmed PASI registration
  if (status.registrarConfirmedRegistration) {
    return (
      <Badge className="bg-green-100 text-green-700 border-green-300">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Registered
      </Badge>
    );
  }

  // Check if PASI registration was requested but not yet confirmed
  if (status.needsPasiRegistration) {
    return (
      <Badge className="bg-orange-100 text-orange-700 border-orange-300">
        <AlertCircle className="w-3 h-3 mr-1" />
        Pending Registrar
      </Badge>
    );
  }

  // Check if student is committed
  if (status.committed) {
    return (
      <Badge className="bg-blue-100 text-blue-700 border-blue-300">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Committed
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
      <Circle className="w-3 h-3 mr-1" />
      Uncommitted
    </Badge>
  );
};

/**
 * Individual course card component
 */
const CourseCard = ({ course, status, onCourseClick, onQuickCommit }) => {
  // Check if course can be quick-committed (only if uncommitted and nothing else changed)
  const canQuickCommit = status && !status.committed &&
    !status.needsPasiRegistration &&
    !status.registrarConfirmedRegistration &&
    (!status.finalMark || status.finalMark === '') &&
    !status.registrarConfirmedMark;

  const handleBadgeClick = (e) => {
    if (canQuickCommit) {
      e.stopPropagation();
      onQuickCommit(course, status);
    }
  };

  return (
    <button
      onClick={() => onCourseClick(course)}
      className="w-full text-left bg-white border border-gray-200 rounded-lg p-3 hover:border-purple-400 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h5 className="font-semibold text-gray-900 text-sm truncate">{course.name}</h5>
            {course.isAlbertaCourse && (
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-300 flex-shrink-0">
                AB
              </Badge>
            )}
          </div>
          <div className="text-xs text-gray-600 space-y-0.5">
            {!course.isAlbertaCourse && course.courseCode && (
              <p className="truncate"><span className="font-semibold">Code:</span> {course.courseCode}</p>
            )}
            {course.isAlbertaCourse && course.code && course.code !== 'N/A' && (
              <p className="truncate">Code: {course.code}</p>
            )}
            {!course.isAlbertaCourse && course.courseName && (
              <p className="truncate"><span className="font-semibold">Name:</span> {course.courseName}</p>
            )}
            <div className="flex items-center gap-2">
              {course.credits && <span>Credits: {course.credits}</span>}
              {course.grade && <span>• Grade {course.grade}</span>}
            </div>
          </div>
        </div>
        <div
          className="flex-shrink-0"
          onClick={handleBadgeClick}
          title={canQuickCommit ? "Click to mark as committed" : ""}
        >
          <div className={canQuickCommit ? "cursor-pointer hover:scale-110 transition-transform" : ""}>
            {getStatusBadge(status)}
          </div>
        </div>
      </div>
    </button>
  );
};

/**
 * Course Registration Card - Replaces StudentDetailRow when in course management mode
 * @param {Object} student - The student object
 * @param {string} familyId - The family ID
 * @param {string} schoolYear - The school year (e.g., "25_26")
 * @param {Object} educationPlan - The SOLO education plan data
 */
const CourseRegistrationCard = ({ student, familyId, schoolYear, educationPlan }) => {
  const [courses, setCourses] = useState([]);
  const [courseStatuses, setCourseStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [courseToRemove, setCourseToRemove] = useState(null);

  useEffect(() => {
    loadCoursesAndStatuses();
  }, [educationPlan]);

  const loadCoursesAndStatuses = async () => {
    setLoading(true);
    try {
      // Get all courses for this student
      const selectedAlbertaCourses = educationPlan?.selectedAlbertaCourses || {};
      const otherCourses = educationPlan?.otherCourses || [];
      const allCourses = getAllStudentCourses(selectedAlbertaCourses, otherCourses);
      setCourses(allCourses);

      // Load status for each course
      const statuses = {};
      await Promise.all(
        allCourses.map(async (course) => {
          try {
            const status = await getCourseStatus(familyId, schoolYear, student.id, course.id);
            statuses[course.id] = status;
          } catch (error) {
            console.error(`Error loading status for course ${course.id}:`, error);
          }
        })
      );
      setCourseStatuses(statuses);
    } catch (error) {
      console.error('Error loading courses and statuses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setSheetOpen(true);
  };

  const handleQuickCommit = async (course, currentStatus) => {
    try {
      const { updateCourseStatus } = await import('../../utils/courseManagementUtils');

      // Update to committed
      await updateCourseStatus(familyId, schoolYear, student.id, course.id, {
        ...currentStatus,
        committed: true
      });

      // Reload statuses to show updated badge
      await loadCoursesAndStatuses();
    } catch (error) {
      console.error('Error quick-committing course:', error);
      alert('Failed to commit course. Please try again.');
    }
  };

  const handleRemoveCourseRequest = (course) => {
    setCourseToRemove(course);
    setRemoveDialogOpen(true);
  };

  const handleRemoveCourseConfirm = async () => {
    if (!courseToRemove) return;

    try {
      const category = getCategoryForCourse(
        courseToRemove.id,
        educationPlan?.selectedAlbertaCourses || {}
      );

      await removeCourse(
        familyId,
        schoolYear,
        student.id,
        courseToRemove.id,
        courseToRemove.isAlbertaCourse,
        category
      );

      // Reload courses
      await loadCoursesAndStatuses();
      setRemoveDialogOpen(false);
      setCourseToRemove(null);
    } catch (error) {
      console.error('Error removing course:', error);
      alert('Failed to remove course. Please try again.');
    }
  };

  const studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student';
  const studentAge = student.age || 'N/A';
  const studentGrade = student.grade || 'N/A';

  // Separate courses by type
  const albertaCourses = courses.filter((c) => c.isAlbertaCourse);
  const otherCourses = courses.filter((c) => !c.isAlbertaCourse);

  return (
    <>
      <div className="bg-white border-l-4 border-purple-500 rounded-lg p-4 shadow-sm">
        {/* Student Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{studentName}</h3>
            <p className="text-sm text-gray-600">
              Grade {studentGrade} • {studentAge} years old
            </p>
          </div>
          <AddCourseInterface
            familyId={familyId}
            schoolYear={schoolYear}
            studentId={student.id}
            studentName={studentName}
            onCourseAdded={loadCoursesAndStatuses}
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
            <span className="ml-2 text-sm text-gray-600">Loading courses...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Alberta Courses Section */}
            {albertaCourses.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  <h4 className="font-semibold text-gray-900 text-sm">
                    Alberta Courses ({albertaCourses.length})
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {albertaCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      status={courseStatuses[course.id]}
                      onCourseClick={handleCourseClick}
                      onQuickCommit={handleQuickCommit}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other Courses Section */}
            {otherCourses.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="w-4 h-4 text-gray-600" />
                  <h4 className="font-semibold text-gray-900 text-sm">
                    Other Courses ({otherCourses.length})
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {otherCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      status={courseStatuses[course.id]}
                      onCourseClick={handleCourseClick}
                      onQuickCommit={handleQuickCommit}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* No Courses State */}
            {courses.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No courses added yet</p>
                <p className="text-xs mt-1">Click "Add Course" to get started</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Course Action Sheet */}
      {selectedCourse && (
        <CourseActionSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          course={selectedCourse}
          studentName={studentName}
          familyId={familyId}
          schoolYear={schoolYear}
          studentId={student.id}
          onRemoveCourse={handleRemoveCourseRequest}
          onStatusUpdate={loadCoursesAndStatuses}
        />
      )}

      {/* Remove Course Dialog */}
      <RemoveCourseDialog
        open={removeDialogOpen}
        onOpenChange={setRemoveDialogOpen}
        onConfirm={handleRemoveCourseConfirm}
        course={courseToRemove}
        studentName={studentName}
      />
    </>
  );
};

export default CourseRegistrationCard;
