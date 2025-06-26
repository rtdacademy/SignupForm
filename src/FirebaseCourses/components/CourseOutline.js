import React, { useState, useMemo } from 'react';
import { X, ChevronDown, ChevronRight, FileText, Download, Clock, Target, BookOpen, FlaskConical, FileCheck, GraduationCap } from 'lucide-react';

const CourseOutline = ({ course, isOpen, onClose }) => {
  const [expandedUnits, setExpandedUnits] = useState({});

  // Extract course data from the course prop
  const courseConfig = course?.Gradebook?.courseConfig || {};
  const courseStructure = courseConfig?.courseStructure || {};
  const courseDetails = course?.courseDetails || {};
  const weights = courseConfig?.weights || {};
  const resources = courseConfig?.courseOutline?.resources || {};

  // Calculate total estimated hours from course structure
  const totalEstimatedHours = useMemo(() => {
    let total = 0;
    courseStructure.units?.forEach(unit => {
      unit.items?.forEach(item => {
        total += item.estimatedTime || 0;
      });
    });
    return Math.round(total / 60); // Convert minutes to hours
  }, [courseStructure]);

  // Get activity type icons
  const getActivityIcon = (type) => {
    switch (type) {
      case 'lesson':
        return <BookOpen className="h-4 w-4" />;
      case 'lab':
        return <FlaskConical className="h-4 w-4" />;
      case 'assignment':
        return <FileCheck className="h-4 w-4" />;
      case 'exam':
        return <GraduationCap className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Get activity type color
  const getActivityColor = (type) => {
    const theme = courseConfig?.themes?.[type] || courseConfig?.themes?.default || {};
    return theme.accent || '#8b5cf6';
  };

  // Toggle unit expansion
  const toggleUnit = (unitId) => {
    setExpandedUnits(prev => ({
      ...prev,
      [unitId]: !prev[unitId]
    }));
  };

  // Count items by type
  const itemCounts = useMemo(() => {
    const counts = { lesson: 0, assignment: 0, lab: 0, exam: 0 };
    courseStructure.units?.forEach(unit => {
      unit.items?.forEach(item => {
        if (counts[item.type] !== undefined) {
          counts[item.type]++;
        }
      });
    });
    return counts;
  }, [courseStructure]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-3xl bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {courseStructure.title || courseDetails.Title || 'Course'} Outline
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Course Overview */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Course Overview</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Total Hours: <span className="font-medium">{courseDetails.NumberOfHours || totalEstimatedHours}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Credits: <span className="font-medium">{courseDetails.courseCredits || 5}</span>
                    </span>
                  </div>
                </div>

                {/* Assessment Breakdown */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Assessment Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-purple-600" />
                        Lessons ({itemCounts.lesson})
                      </span>
                      <span className="font-medium">{Math.round(weights.lesson * 100)}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-blue-600" />
                        Assignments ({itemCounts.assignment})
                      </span>
                      <span className="font-medium">{Math.round(weights.assignment * 100)}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <FlaskConical className="h-4 w-4 text-green-600" />
                        Labs ({itemCounts.lab})
                      </span>
                      <span className="font-medium">{Math.round(weights.lab * 100)}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-red-600" />
                        Exams ({itemCounts.exam})
                      </span>
                      <span className="font-medium">{Math.round(weights.exam * 100)}%</span>
                    </div>
                  </div>
                </div>

                {/* Resources */}
                {resources.dataBooklet && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Resources</h4>
                    <a
                      href={resources.dataBooklet.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Download className="h-4 w-4" />
                      {resources.dataBooklet.title}
                    </a>
                  </div>
                )}
              </div>

              {/* Course Structure */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Course Structure</h3>
                <div className="space-y-4">
                  {courseStructure.units?.map((unit, unitIndex) => (
                    <div key={unit.unitId} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleUnit(unit.unitId)}
                        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-semibold text-gray-700">
                            {unit.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({unit.items?.length || 0} items)
                          </span>
                        </div>
                        {expandedUnits[unit.unitId] ? (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                      
                      {expandedUnits[unit.unitId] && (
                        <div className="bg-white">
                          {unit.description && (
                            <p className="px-4 py-2 text-sm text-gray-600 border-b border-gray-100">
                              {unit.description}
                            </p>
                          )}
                          <div className="divide-y divide-gray-100">
                            {unit.items?.map((item, itemIndex) => (
                              <div key={item.itemId} className="px-4 py-3 hover:bg-gray-50">
                                <div className="flex items-start gap-3">
                                  <div 
                                    className="mt-0.5"
                                    style={{ color: getActivityColor(item.type) }}
                                  >
                                    {getActivityIcon(item.type)}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-sm font-medium text-gray-900">
                                      {item.title}
                                    </h4>
                                    {item.description && (
                                      <p className="text-xs text-gray-600 mt-1">
                                        {item.description}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                      <span>{item.estimatedTime} min</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Diploma Information */}
              {courseDetails.DiplomaCourse === "Yes" && (
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">Diploma Exam Information</h3>
                  <p className="text-sm text-gray-700">
                    This is a diploma course. Students must write the provincial diploma exam 
                    worth 30% of their final grade.
                  </p>
                  {courseDetails.diplomaTimes && courseDetails.diplomaTimes.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700">Upcoming Exam Dates:</p>
                      <ul className="mt-2 space-y-1">
                        {courseDetails.diplomaTimes.map((time, index) => {
                          const examDate = new Date(time.date);
                          const formattedDate = examDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          });
                          const formattedTime = `${time.hour}:${time.minute.padStart(2, '0')} ${time.period}`;
                          
                          return (
                            <li key={index} className="text-sm text-gray-600">
                              {formattedDate} at {formattedTime}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseOutline;