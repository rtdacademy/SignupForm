import React from 'react';
import { Info, ExternalLink, Calendar, BookOpen } from 'lucide-react';
import { albertaCourses, ctsCourses, getSubjectCourses, getSubjectInfo, pathwayNotes, getAlbertaCourseById } from '../config/albertaCourses';
import OtherCoursesManager from './OtherCoursesManager';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion';
import { cn } from '../lib/utils';

const AlbertaCourseSelection = ({ 
  selectedCourses, 
  onCourseSelectionChange, 
  onShowFlowChart,
  otherCourses = [],
  onOtherCoursesChange
}) => {

  const handleCourseToggle = (subjectKey, courseId) => {
    // Store current scroll position
    const scrollY = window.scrollY;
    
    const currentSelections = selectedCourses[subjectKey] || [];
    const newSelections = currentSelections.includes(courseId)
      ? currentSelections.filter(id => id !== courseId)
      : [...currentSelections, courseId];
    
    onCourseSelectionChange(subjectKey, newSelections);
    
    // Restore scroll position after state update
    setTimeout(() => {
      window.scrollTo(0, scrollY);
    }, 0);
  };

  const SubjectSection = ({ subjectKey, customTitle = null }) => {
    const subjectInfo = getSubjectInfo(subjectKey);
    const courses = getSubjectCourses(subjectKey);
    const selectedInSubject = selectedCourses[subjectKey] || [];

    if (!courses.length) return null;

    return (
      <AccordionItem 
        value={subjectKey}
        className={cn(
          "border rounded-lg transition-all",
          selectedInSubject.length > 0 
            ? "border-purple-300 bg-purple-50/30 shadow-sm" 
            : "border-gray-200 bg-white"
        )}
      >
        <AccordionTrigger 
          className={cn(
            "px-4 py-4 hover:no-underline",
            selectedInSubject.length > 0 && "hover:bg-purple-100/50"
          )}
        >
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 text-lg">
              {customTitle || subjectInfo.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {subjectInfo.description}
            </p>
            {selectedInSubject.length > 0 && (
              <p className="text-sm text-purple-700 font-medium mt-1">
                ✓ {selectedInSubject.length} course{selectedInSubject.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="px-4 pb-4">
            {subjectInfo.note && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">{subjectInfo.note}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {courses.map((course) => (
                <label
                  key={course.id}
                  className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedInSubject.includes(course.id)
                      ? 'border-purple-400 bg-purple-100'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedInSubject.includes(course.id)}
                    onChange={() => handleCourseToggle(subjectKey, course.id)}
                    className="mt-1 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 text-sm">
                        {course.name}
                      </span>
                      {course.code !== 'N/A' && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {course.code}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {course.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Grade: {course.grade}</span>
                      <span>Credits: {course.credits}</span>
                      {course.prerequisite && (
                        <span className="text-orange-600">
                          Prereq: {course.prerequisite}
                        </span>
                      )}
                    </div>
                    {course.note && (
                      <p className="text-xs text-blue-600 mt-1 italic">
                        {course.note}
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  const getTotalSelectedCourses = () => {
    return Object.values(selectedCourses).reduce((total, subjectCourses) => 
      total + (subjectCourses?.length || 0), 0
    );
  };

  const getTotalCredits = () => {
    let totalCredits = 0;
    
    // Credits from selected Alberta courses
    Object.values(selectedCourses).forEach(subjectCourses => {
      if (subjectCourses) {
        subjectCourses.forEach(courseId => {
          const course = getAlbertaCourseById(courseId);
          if (course && course.credits && course.credits !== 0) {
            // Handle courses with variable credits (like PE which can be "3, 4, or 5")
            const credits = typeof course.credits === 'string' ? 
              parseInt(course.credits.split(',')[0]) || 0 : 
              course.credits;
            totalCredits += credits;
          }
        });
      }
    });
    
    // Credits from other courses
    if (otherCourses && otherCourses.length > 0) {
      otherCourses.forEach(course => {
        if (course.forCredit && course.credits) {
          const credits = typeof course.credits === 'string' ? 
            parseInt(course.credits) || 0 : 
            course.credits;
          totalCredits += credits;
        }
      });
    }
    
    return totalCredits;
  };

  return (
    <div className="space-y-6">
      {/* Header with flow chart button */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">Alberta Programs of Study Course Selection</h3>
            <div className="bg-orange-100 border border-orange-300 rounded-md p-3 mb-3">
              <div className="flex items-start space-x-2">
                <Calendar className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-orange-800 font-medium">
                  <strong>Important:</strong> Select courses your student plans to complete <em>this school year only</em>. 
                  You can update course selections each year as your student progresses.
                </p>
              </div>
            </div>
            <p className="text-sm text-blue-800 mb-3">
              Choose the courses your student plans to complete this school year. If they are working 
              towards earning credits, please choose the specific course and level. You may choose more 
              than one grade level per course. If your student is not working towards credit in this 
              subject, choose the "not for credit" option.
            </p>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-blue-800">
                  Total courses selected: {getTotalSelectedCourses()}
                </span>
                <span className="text-sm font-medium text-blue-800">
                  Total credits: <span className="text-lg font-bold">{getTotalCredits()}</span>/100 
                  <span className="text-xs text-blue-600 ml-1 block sm:inline">(for Alberta High School Diploma)</span>
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                {onShowFlowChart && (
                  <button
                    type="button"
                    onClick={onShowFlowChart}
                    className="inline-flex items-center justify-center space-x-2 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Visualize Core Subject Prerequisites</span>
                  </button>
                )}
                <a
                  href="https://curriculum.learnalberta.ca/hs-courses/en/home"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-2 text-sm bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Browse All Alberta Courses</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workload Guidance */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <BookOpen className="w-5 h-5 text-purple-600" />
          <h4 className="font-medium text-purple-900">Course Load Guidance for Home Education</h4>
        </div>
        <div className="text-sm text-purple-800 space-y-2">
          <p>
            <strong>Typical high school students</strong> take 7-8 courses per semester (about 30-40 credits per year). 
            However, as a home education family, you have the flexibility to customize your student's pace.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            <div className="bg-white rounded p-3 border border-purple-200">
              <p className="font-medium text-purple-900">Light Load</p>
              <p className="text-xs text-purple-700">3-4 courses (15-20 credits)</p>
              <p className="text-xs text-purple-600">Good for younger students or those needing more support</p>
            </div>
            <div className="bg-white rounded p-3 border border-purple-200">
              <p className="font-medium text-purple-900">Moderate Load</p>
              <p className="text-xs text-purple-700">5-6 courses (25-30 credits)</p>
              <p className="text-xs text-purple-600">Balanced approach allowing depth in each subject</p>
            </div>
            <div className="bg-white rounded p-3 border border-purple-200">
              <p className="font-medium text-purple-900">Full Load</p>
              <p className="text-xs text-purple-700">7-8 courses (35-40 credits)</p>
              <p className="text-xs text-purple-600">Traditional pace, good for university preparation</p>
            </div>
          </div>
          <p className="text-xs text-purple-700 mt-2">
            <strong>Remember:</strong> Students need 100 credits total to graduate, but home education families 
            are not required to complete 100 credits if it doesn't align with their educational goals.
          </p>
        </div>
      </div>


      {/* Course Selection Sections */}
      <Accordion type="single" collapsible className="space-y-4">
        <SubjectSection subjectKey="english_language_arts" />
        <SubjectSection subjectKey="mathematics" />
        <SubjectSection subjectKey="social_studies" />
        <SubjectSection subjectKey="science" />
        <SubjectSection subjectKey="physical_education" />
        <SubjectSection subjectKey="career_life_management" />
        <SubjectSection 
          subjectKey="career_technology_studies" 
          customTitle="Career & Technology Studies (CTS) / Other Courses"
        />
      </Accordion>

      {/* Other Courses Section */}
      <div className="border border-gray-200 rounded-lg p-4">
        <OtherCoursesManager 
          courses={otherCourses}
          onCoursesChange={onOtherCoursesChange}
        />
      </div>

      {/* Summary */}
      {getTotalSelectedCourses() > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">Course Selection Summary</h4>
          <div className="space-y-2 text-sm text-green-800">
            {Object.entries(selectedCourses).map(([subjectKey, courseIds]) => {
              if (!courseIds?.length) return null;
              const subjectInfo = getSubjectInfo(subjectKey);
              return (
                <div key={subjectKey}>
                  <strong>{subjectInfo.title}:</strong> {courseIds.length} course{courseIds.length !== 1 ? 's' : ''}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlbertaCourseSelection;