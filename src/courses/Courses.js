import React, { useState, useEffect, useMemo } from 'react';
import { getDatabase, ref, update, remove, get } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FaEdit,
  FaExclamationTriangle,
  FaPlus,
  FaTrash,
  FaClock,
  FaRegLightbulb,
  FaLink,
  FaFire,
  FaEnvelope,
  FaSync,
  FaDatabase,
  FaGraduationCap,
  FaPercentage,
  FaRobot
} from 'react-icons/fa';
import { BookOpen, RotateCcw } from 'lucide-react';
import Modal from 'react-modal';
// Keep react-select for multi-select fields.
import ReactSelect from 'react-select';
import { Switch } from '../components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger
} from '../components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import { ScrollArea } from '../components/ui/scroll-area';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import CourseUnitsEditor from './CourseUnitsEditor';
import AddCourseDialog from './AddCourseDialog';
import DeleteCourseDialog from './DeleteCourseDialog';
import CourseWeightingDialog from './CourseWeightingDialog';
import ImprovedEmailManager from './ImprovedEmailManager';
import JsonDisplay from '../components/JsonDisplay';
import FirebaseCourseConfigEditor from './FirebaseCourseConfigEditor';

// Import UI kit Select components for single–value selects
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import PermissionIndicator from '../context/PermissionIndicator';

Modal.setAppElement('#root');

const monthOptions = [
  { value: 'January', label: 'January' },
  { value: 'April', label: 'April' },
  { value: 'June', label: 'June' },
  { value: 'August', label: 'August' },
  { value: 'November', label: 'November' }
];

// Helper Functions
const formatDateForDatabase = (localDate) => {
  const [year, month, day] = localDate.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 7));
  return {
    date: date.toISOString(),
    displayDate: localDate,
    timezone: 'America/Edmonton'
  };
};

const formatDateForDisplay = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Date(date.getTime() - (7 * 60 * 60 * 1000))
    .toLocaleDateString('en-CA', {
      timeZone: 'America/Edmonton',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
};

// Time Selection Options
const timeOptions = Array.from({ length: 12 }, (_, i) => {
  const hour = i + 1;
  return { value: hour.toString(), label: hour.toString() };
});

const minuteOptions = Array.from({ length: 60 }, (_, i) => {
  const minute = i.toString().padStart(2, '0');
  return { value: minute, label: minute };
});

const periodOptions = [
  { value: 'AM', label: 'AM' },
  { value: 'PM', label: 'PM' }
];

function DiplomaTimeEntry({ diplomaTime, onChange, onDelete, courseIsEditing }) {
  const handleDateChange = (e) => {
    const localDate = e.target.value;
    const { date, displayDate, timezone } = formatDateForDatabase(localDate);
    onChange({
      ...diplomaTime,
      date,
      displayDate,
      timezone
    });
  };

  const handleRegistrationDeadlineChange = (e) => {
    const localDate = e.target.value;
    if (!localDate) {
      // If the date is cleared, remove the deadline fields
      const updated = { ...diplomaTime };
      delete updated.registrationDeadline;
      delete updated.registrationDeadlineDisplayDate;
      onChange(updated);
    } else {
      const { date, displayDate, timezone } = formatDateForDatabase(localDate);
      onChange({
        ...diplomaTime,
        registrationDeadline: date,
        registrationDeadlineDisplayDate: displayDate
      });
    }
  };

  const handleTimeChange = (selected, { name }) => {
    onChange({
      ...diplomaTime,
      [name]: selected.value
    });
  };

  return (
    <div className="rounded-lg border p-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Diploma Exam Date</label>
          <Input
            type="date"
            value={diplomaTime.displayDate || formatDateForDisplay(diplomaTime.date) || ''}
            onChange={handleDateChange}
            disabled={!courseIsEditing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Registration Deadline (Optional)
          </label>
          <Input
            type="date"
            value={diplomaTime.registrationDeadlineDisplayDate || formatDateForDisplay(diplomaTime.registrationDeadline) || ''}
            onChange={handleRegistrationDeadlineChange}
            disabled={!courseIsEditing}
            placeholder="No deadline set"
          />
          <p className="text-xs text-gray-500 mt-1">
            If set, students must start their course by this date to be eligible for this diploma exam
          </p>
        </div>

        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Time</label>
            <div className="flex space-x-2 items-center">
              <Select
                name="hour"
                value={diplomaTime.hour}
                onValueChange={(value) => handleTimeChange({ value }, { name: 'hour' })}
                disabled={!courseIsEditing}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Hour" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>:</span>
              <Select
                name="minute"
                value={diplomaTime.minute}
                onValueChange={(value) => handleTimeChange({ value }, { name: 'minute' })}
                disabled={!courseIsEditing}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Min" />
                </SelectTrigger>
                <SelectContent>
                  {minuteOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                name="period"
                value={diplomaTime.period}
                onValueChange={(value) => handleTimeChange({ value }, { name: 'period' })}
                disabled={!courseIsEditing}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="AM/PM" />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Month</label>
          <Select
            name="month"
            value={diplomaTime.month}
            onValueChange={(value) => onChange({ ...diplomaTime, month: value })}
            disabled={!courseIsEditing}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch
              checked={diplomaTime.confirmed || false}
              onCheckedChange={(checked) => onChange({ ...diplomaTime, confirmed: checked })}
              disabled={!courseIsEditing}
            />
            <label className="text-sm">Confirmed</label>
          </div>

          {courseIsEditing && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              type="button"
            >
              <FaTrash className="mr-1" /> Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function DiplomaTimes({ courseId, diplomaTimes, courseIsEditing }) {
  const [times, setTimes] = useState(diplomaTimes || []);

  useEffect(() => {
    setTimes(diplomaTimes || []);
  }, [diplomaTimes]);

  const handleAdd = () => {
    if (!courseIsEditing) return;

    const today = new Date();
    const localDate = today.toLocaleDateString('en-CA', {
      timeZone: 'America/Edmonton',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    const { date, displayDate, timezone } = formatDateForDatabase(localDate);
    
    const newTime = {
      id: `diploma-time-${Date.now()}`,
      date,
      displayDate,
      timezone,
      month: monthOptions[0].value,
      hour: '9',
      minute: '00',
      period: 'AM',
      confirmed: false
    };

    const updatedTimes = [...times, newTime];
    setTimes(updatedTimes);
    updateDatabase(updatedTimes);
  };

  const handleChange = (index, updatedTime) => {
    if (!courseIsEditing) return;

    const updatedTimes = times.map((time, i) => 
      i === index ? updatedTime : time
    );
    setTimes(updatedTimes);
    updateDatabase(updatedTimes);
  };

  const handleDelete = (index) => {
    if (!courseIsEditing) return;

    const updatedTimes = times.filter((_, i) => i !== index);
    setTimes(updatedTimes);
    updateDatabase(updatedTimes);
  };

  const updateDatabase = async (updatedTimes) => {
    try {
      const db = getDatabase();
      const courseRef = ref(db, `courses/${courseId}`);
      await update(courseRef, { 
        diplomaTimes: updatedTimes.length > 0 ? updatedTimes : null 
      });
      console.log('Successfully updated diploma times:', updatedTimes);
    } catch (error) {
      console.error('Error updating diploma times:', error);
      alert('An error occurred while updating diploma times.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Diploma Times</h3>
        {courseIsEditing && (
          <Button 
            onClick={handleAdd}
            type="button"
            className="flex items-center"
          >
            <FaPlus className="mr-2" /> Add Time
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        {(!times || times.length === 0) ? (
          <p className="text-gray-500 text-center py-4">No diploma times added yet.</p>
        ) : (
          times.map((time, index) => (
            <DiplomaTimeEntry
              key={time.id}
              diplomaTime={time}
              onChange={(updatedTime) => handleChange(index, updatedTime)}
              onDelete={() => handleDelete(index)}
              courseIsEditing={courseIsEditing}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Component for managing individual lesson progression overrides
function LessonOverrideEditor({ lessonId, override, onChange, onDelete, onLessonIdChange, courseIsEditing, availableLessons = [], existingOverrides = {} }) {
  const handlePercentageChange = (e) => {
    const value = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
    onChange({
      ...override,
      minimumPercentage: value
    });
  };

  const handleRequireAllChange = (checked) => {
    onChange({
      ...override,
      requireAllQuestions: checked
    });
  };

  const handleSessionsRequiredChange = (e) => {
    const value = Math.max(0, Math.min(5, parseInt(e.target.value) || 1));
    onChange({
      ...override,
      sessionsRequired: value
    });
  };

  const handleRequiresSubmissionChange = (checked) => {
    onChange({
      ...override,
      requiresSubmission: checked
    });
  };

  const handleLessonIdChange = (value) => {
    if (onLessonIdChange) {
      onLessonIdChange(value);
    }
  };

  // Find the selected lesson details using itemId
  const selectedLesson = availableLessons.find(lesson => lesson.itemId === lessonId);

  return (
    <div className="rounded-lg border p-4 bg-white">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lesson
            </label>
            <Select
              value={lessonId}
              onValueChange={handleLessonIdChange}
              disabled={!courseIsEditing}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a lesson">
                  {selectedLesson ? (
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{selectedLesson.title}</span>
                      <span className="text-xs text-gray-500">({selectedLesson.itemId})</span>
                    </span>
                  ) : (
                    "Select a lesson"
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableLessons.length === 0 ? (
                  <div className="p-2 text-sm text-gray-500">No lessons available</div>
                ) : (
                  availableLessons.map(lesson => {
                    const isAlreadySelected = Object.keys(existingOverrides || {}).includes(lesson.itemId);
                    const isCurrentSelection = lesson.itemId === lessonId;
                    const isDisabled = isAlreadySelected && !isCurrentSelection;
                    
                    return (
                      <SelectItem 
                        key={lesson.itemId} 
                        value={lesson.itemId}
                        disabled={isDisabled}
                        className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${isDisabled ? 'text-gray-400' : ''}`}>
                              {lesson.title}
                            </span>
                            {lesson.type === 'assignment' && (
                              <span className={`text-xs px-1.5 py-0.5 rounded ${
                                isDisabled 
                                  ? 'bg-gray-100 text-gray-400' 
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                Assignment
                              </span>
                            )}
                            {lesson.type === 'exam' && (
                              <span className={`text-xs px-1.5 py-0.5 rounded ${
                                isDisabled 
                                  ? 'bg-gray-100 text-gray-400' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                Exam
                              </span>
                            )}
                            {lesson.type === 'lab' && (
                              <span className={`text-xs px-1.5 py-0.5 rounded ${
                                isDisabled 
                                  ? 'bg-gray-100 text-gray-400' 
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                Lab
                              </span>
                            )}
                            {lesson.type === 'quiz' && (
                              <span className={`text-xs px-1.5 py-0.5 rounded ${
                                isDisabled 
                                  ? 'bg-gray-100 text-gray-400' 
                                  : 'bg-purple-100 text-purple-700'
                              }`}>
                                Quiz
                              </span>
                            )}
                            {lesson.type === 'info' && (
                              <span className={`text-xs px-1.5 py-0.5 rounded ${
                                isDisabled 
                                  ? 'bg-gray-100 text-gray-400' 
                                  : 'bg-cyan-100 text-cyan-700'
                              }`}>
                                Info
                              </span>
                            )}
                            {lesson.type === 'review' && (
                              <span className={`text-xs px-1.5 py-0.5 rounded ${
                                isDisabled 
                                  ? 'bg-gray-100 text-gray-400' 
                                  : 'bg-indigo-100 text-indigo-700'
                              }`}>
                                Review
                              </span>
                            )}
                            {lesson.type === 'practice' && (
                              <span className={`text-xs px-1.5 py-0.5 rounded ${
                                isDisabled 
                                  ? 'bg-gray-100 text-gray-400' 
                                  : 'bg-pink-100 text-pink-700'
                              }`}>
                                Practice
                              </span>
                            )}
                            {lesson.type === 'assessment' && (
                              <span className={`text-xs px-1.5 py-0.5 rounded ${
                                isDisabled 
                                  ? 'bg-gray-100 text-gray-400' 
                                  : 'bg-teal-100 text-teal-700'
                              }`}>
                                Assessment
                              </span>
                            )}
                            {isAlreadySelected && !isCurrentSelection && (
                              <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                                Already Selected
                              </span>
                            )}
                          </div>
                          <span className={`text-xs ${isDisabled ? 'text-gray-400' : 'text-gray-500'}`}>
                            {lesson.unitName} • {lesson.itemId}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          </div>
          {courseIsEditing && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              type="button"
              className="ml-4 mt-6"
            >
              <FaTrash className="mr-1" /> Delete
            </Button>
          )}
        </div>

        {/* Criteria based on item type */}
        {(() => {
          // Find the selected lesson to determine its type
          const selectedLesson = availableLessons.find(lesson => lesson.itemId === lessonId);
          const lessonType = selectedLesson?.type || 'lesson';
          
          if (lessonType === 'lesson' || lessonType === 'info' || lessonType === 'review' || 
              lessonType === 'practice' || lessonType === 'assessment') {
            return (
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Percentage
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={override.minimumPercentage || 0}
                      onChange={handlePercentageChange}
                      disabled={!courseIsEditing}
                      className="flex-1"
                    />
                    <FaPercentage className="text-gray-400" />
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-6">
                  <Switch
                    checked={override.requireAllQuestions || false}
                    onCheckedChange={handleRequireAllChange}
                    disabled={!courseIsEditing}
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Require All Questions
                  </label>
                </div>
              </div>
            );
          } else if (lessonType === 'assignment' || lessonType === 'exam' || lessonType === 'quiz') {
            return (
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sessions Required
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      value={override.sessionsRequired || 1}
                      onChange={handleSessionsRequiredChange}
                      disabled={!courseIsEditing}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500">sessions</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Number of completed sessions required (0-5)
                  </p>
                </div>
              </div>
            );
          } else if (lessonType === 'lab') {
            return (
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={override.requiresSubmission || false}
                    onCheckedChange={handleRequiresSubmissionChange}
                    disabled={!courseIsEditing}
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Requires Submission
                  </label>
                </div>
              </div>
            );
          }
          
          return null;
        })()}
      </div>
    </div>
  );
}

// Component for managing course progression requirements
function ProgressionRequirementsManager({ courseId, progressionRequirements, courseIsEditing }) {
  const [requirements, setRequirements] = useState(progressionRequirements || {
    enabled: false,
    defaultCriteria: {
      minimumPercentage: 50,
      requireAllQuestions: true,
      // Legacy structure for backwards compatibility
      lesson: {
        minimumPercentage: 50,
        requireAllQuestions: true
      },
      assignment: {
        sessionsRequired: 1
      },
      exam: {
        sessionsRequired: 1
      },
      quiz: {
        sessionsRequired: 1
      },
      lab: {
        requiresSubmission: true
      }
    },
    lessonOverrides: {},
    visibility: {}
  });
  const [availableLessons, setAvailableLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [detectedItemTypes, setDetectedItemTypes] = useState(new Set());

  useEffect(() => {
    // Handle migration from old structure to new
    if (progressionRequirements) {
      const migrated = { ...progressionRequirements };
      
      // Migrate from showAlways/neverVisible to visibility
      if (!migrated.visibility && (migrated.showAlways || migrated.neverVisible)) {
        migrated.visibility = {};
        
        // Migrate showAlways entries
        if (migrated.showAlways) {
          Object.entries(migrated.showAlways).forEach(([lessonId, value]) => {
            if (value === true) {
              migrated.visibility[lessonId] = 'always';
            }
          });
          delete migrated.showAlways;
        }
        
        // Migrate neverVisible entries
        if (migrated.neverVisible) {
          Object.entries(migrated.neverVisible).forEach(([lessonId, value]) => {
            if (value === true) {
              migrated.visibility[lessonId] = 'never';
            }
          });
          delete migrated.neverVisible;
        }
      }
      
      // Migrate flat defaultCriteria structure to nested structure if needed
      if (migrated.defaultCriteria && typeof migrated.defaultCriteria.minimumPercentage !== 'undefined') {
        // Has flat structure, convert to nested for UI compatibility
        const flatMinPercentage = migrated.defaultCriteria.minimumPercentage;
        const flatRequireAll = migrated.defaultCriteria.requireAllQuestions;
        migrated.defaultCriteria = {
          minimumPercentage: flatMinPercentage,
          requireAllQuestions: flatRequireAll,
          lesson: {
            minimumPercentage: flatMinPercentage,
            requireAllQuestions: flatRequireAll
          },
          assignment: migrated.defaultCriteria.assignment || { sessionsRequired: 1 },
          exam: migrated.defaultCriteria.exam || { sessionsRequired: 1 },
          quiz: migrated.defaultCriteria.quiz || { sessionsRequired: 1 },
          lab: migrated.defaultCriteria.lab || { requiresSubmission: true }
        };
      }
      
      setRequirements(migrated);
    } else {
      setRequirements({
        enabled: false,
        defaultCriteria: {
          minimumPercentage: 50,
          requireAllQuestions: true,
          lesson: {
            minimumPercentage: 50,
            requireAllQuestions: true
          },
          assignment: {
            sessionsRequired: 1
          },
          exam: {
            sessionsRequired: 1
          },
          quiz: {
            sessionsRequired: 1
          },
          lab: {
            requiresSubmission: true
          },
          info: {
            minimumPercentage: 0,
            requireAllQuestions: false
          },
          review: {
            minimumPercentage: 50,
            requireAllQuestions: true
          },
          practice: {
            minimumPercentage: 0,
            requireAllQuestions: false
          },
          assessment: {
            minimumPercentage: 50,
            requireAllQuestions: true
          }
        },
        lessonOverrides: {},
        visibility: {}
      });
    }
  }, [progressionRequirements]);

  // Fetch available lessons from course structure
  useEffect(() => {
    const fetchCourseStructure = async () => {
      if (!courseId) return;
      
      setLoadingLessons(true);
      try {
        const db = getDatabase();
        const structureRef = ref(db, `courses/${courseId}/course-config/courseStructure`);
        const snapshot = await get(structureRef);
        
        if (snapshot.exists()) {
          const courseStructure = snapshot.val();
          const lessons = [];
          const itemTypes = new Set();
          
          // Extract all lessons from all units and detect item types
          if (courseStructure.units) {
            courseStructure.units.forEach(unit => {
              if (unit.items) {
                unit.items.forEach(item => {
                  // Track all item types found in the course
                  if (item.type) {
                    itemTypes.add(item.type);
                  }
                  
                  // Include all item types that can have questions or progression requirements
                  if (item.type === 'lesson' || item.type === 'assignment' || item.type === 'exam' || 
                      item.type === 'quiz' || item.type === 'lab' || item.type === 'info' || 
                      item.type === 'review' || item.type === 'practice' || item.type === 'assessment') {
                    lessons.push({
                      itemId: item.itemId,
                      title: item.title,
                      type: item.type,
                      unitName: unit.name
                    });
                  }
                });
              }
            });
          }
          
          setAvailableLessons(lessons);
          setDetectedItemTypes(itemTypes);
        }
      } catch (error) {
        console.error('Error fetching course structure:', error);
      } finally {
        setLoadingLessons(false);
      }
    };

    fetchCourseStructure();
  }, [courseId]);

  const updateDatabase = async (updatedRequirements) => {
    try {
      // Clean the requirements to only include detected item types
      const cleanedRequirements = { ...updatedRequirements };
      
      if (cleanedRequirements.defaultCriteria) {
        // Create a new defaultCriteria object with only detected types
        const cleanedDefaultCriteria = {
          minimumPercentage: cleanedRequirements.defaultCriteria.minimumPercentage,
          requireAllQuestions: cleanedRequirements.defaultCriteria.requireAllQuestions
        };
        
        // Only include item type configurations that exist in the course
        if (detectedItemTypes.has('lesson') && cleanedRequirements.defaultCriteria.lesson) {
          cleanedDefaultCriteria.lesson = cleanedRequirements.defaultCriteria.lesson;
        }
        if (detectedItemTypes.has('assignment') && cleanedRequirements.defaultCriteria.assignment) {
          cleanedDefaultCriteria.assignment = cleanedRequirements.defaultCriteria.assignment;
        }
        if (detectedItemTypes.has('exam') && cleanedRequirements.defaultCriteria.exam) {
          cleanedDefaultCriteria.exam = cleanedRequirements.defaultCriteria.exam;
        }
        if (detectedItemTypes.has('quiz') && cleanedRequirements.defaultCriteria.quiz) {
          cleanedDefaultCriteria.quiz = cleanedRequirements.defaultCriteria.quiz;
        }
        if (detectedItemTypes.has('lab') && cleanedRequirements.defaultCriteria.lab) {
          cleanedDefaultCriteria.lab = cleanedRequirements.defaultCriteria.lab;
        }
        
        cleanedRequirements.defaultCriteria = cleanedDefaultCriteria;
      }
      
      const db = getDatabase();
      const courseRef = ref(db, `courses/${courseId}/course-config`);
      await update(courseRef, { 
        progressionRequirements: cleanedRequirements 
      });
      console.log('Successfully updated progression requirements:', cleanedRequirements);
    } catch (error) {
      console.error('Error updating progression requirements:', error);
      toast.error('Failed to update progression requirements');
    }
  };

  const handleEnabledChange = (checked) => {
    const updatedRequirements = {
      ...requirements,
      enabled: checked
    };
    setRequirements(updatedRequirements);
    updateDatabase(updatedRequirements);
  };

  const handleResetToDefaults = () => {
    const defaultRequirements = {
      enabled: requirements.enabled, // Keep the current enabled state
      defaultCriteria: {
        minimumPercentage: 50,
        requireAllQuestions: true,
        lesson: {
          minimumPercentage: 50,
          requireAllQuestions: true
        },
        assignment: {
          sessionsRequired: 1
        },
        exam: {
          sessionsRequired: 1
        },
        quiz: {
          sessionsRequired: 1
        },
        lab: {
          requiresSubmission: true
        }
      },
      lessonOverrides: {}, // Clear all overrides
      visibility: {} // Clear all visibility settings
    };
    setRequirements(defaultRequirements);
    updateDatabase(defaultRequirements);
    toast.success('Progression requirements reset to defaults');
  };

  const handleDefaultCriteriaChange = (type, field, value) => {
    const updatedRequirements = {
      ...requirements,
      defaultCriteria: {
        ...requirements.defaultCriteria,
        // Update both flat and nested structures
        ...(type === 'lesson' && field === 'minimumPercentage' ? { minimumPercentage: value } : {}),
        ...(type === 'lesson' && field === 'requireAllQuestions' ? { requireAllQuestions: value } : {}),
        [type]: {
          ...requirements.defaultCriteria[type],
          [field]: value
        }
      }
    };
    setRequirements(updatedRequirements);
    updateDatabase(updatedRequirements);
  };

  const handleVisibilityChange = (lessonId, visibilityType) => {
    const updatedRequirements = {
      ...requirements,
      visibility: {
        ...requirements.visibility
      }
    };
    
    if (visibilityType === 'default') {
      // Remove the visibility override entirely
      delete updatedRequirements.visibility[lessonId];
    } else {
      // Set to 'always' or 'never'
      updatedRequirements.visibility[lessonId] = visibilityType;
    }
    
    setRequirements(updatedRequirements);
    updateDatabase(updatedRequirements);
  };

  const handleAddOverride = () => {
    if (!courseIsEditing) return;

    // Find the first lesson that doesn't already have an override
    const existingOverrideIds = Object.keys(requirements.lessonOverrides || {});
    const availableLesson = availableLessons.find(lesson => 
      !existingOverrideIds.includes(lesson.itemId)
    );

    if (!availableLesson) {
      toast.warning('All lessons already have overrides configured');
      return;
    }

    // Set default values based on item type
    let defaultOverride;
    if (availableLesson.type === 'lesson' || availableLesson.type === 'info' || 
        availableLesson.type === 'review' || availableLesson.type === 'practice' || 
        availableLesson.type === 'assessment') {
      defaultOverride = {
        minimumPercentage: 0,
        requireAllQuestions: false
      };
    } else if (availableLesson.type === 'assignment' || availableLesson.type === 'exam' || availableLesson.type === 'quiz') {
      defaultOverride = {
        sessionsRequired: 1
      };
    } else if (availableLesson.type === 'lab') {
      defaultOverride = {
        requiresSubmission: false
      };
    } else {
      // Fallback for unknown types
      defaultOverride = {
        minimumPercentage: 0,
        requireAllQuestions: false
      };
    }

    const updatedRequirements = {
      ...requirements,
      lessonOverrides: {
        ...requirements.lessonOverrides,
        [availableLesson.itemId]: defaultOverride
      }
    };
    setRequirements(updatedRequirements);
    updateDatabase(updatedRequirements);
  };

  const handleOverrideChange = (oldLessonId, newLessonId, override) => {
    if (!courseIsEditing) return;

    const updatedOverrides = { ...requirements.lessonOverrides };
    
    // If lesson ID changed, remove old and add new
    if (oldLessonId !== newLessonId) {
      delete updatedOverrides[oldLessonId];
      updatedOverrides[newLessonId] = override;
    } else {
      updatedOverrides[oldLessonId] = override;
    }

    const updatedRequirements = {
      ...requirements,
      lessonOverrides: updatedOverrides
    };
    setRequirements(updatedRequirements);
    updateDatabase(updatedRequirements);
  };

  const handleDeleteOverride = (lessonId) => {
    if (!courseIsEditing) return;

    const updatedOverrides = { ...requirements.lessonOverrides };
    delete updatedOverrides[lessonId];

    const updatedRequirements = {
      ...requirements,
      lessonOverrides: updatedOverrides
    };
    setRequirements(updatedRequirements);
    updateDatabase(updatedRequirements);
  };

  const overrideEntries = Object.entries(requirements.lessonOverrides || {});
  const visibilityEntries = Object.entries(requirements.visibility || {});
  const alwaysVisibleCount = visibilityEntries.filter(([_, value]) => value === 'always').length;
  const neverVisibleCount = visibilityEntries.filter(([_, value]) => value === 'never').length;
  const shouldOpenAccordion = visibilityEntries.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Switch
            checked={requirements.enabled || false}
            onCheckedChange={handleEnabledChange}
            disabled={!courseIsEditing}
          />
          <label className="text-sm font-medium text-gray-700">
            Enable Progression Requirements
          </label>
        </div>
        {courseIsEditing && requirements.enabled && (
          <Button
            onClick={handleResetToDefaults}
            variant="outline"
            size="sm"
            className="text-gray-600 hover:text-gray-800"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset to Defaults
          </Button>
        )}
      </div>

      {requirements.enabled && (
        <div className="space-y-6">
          {/* Default Criteria - Wrapped in Accordion */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="default-criteria">
              <AccordionTrigger className="text-md font-semibold text-blue-800">
                Default Criteria
              </AccordionTrigger>
              <AccordionContent>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-gray-600 mb-4">
                    These criteria apply to all items of each type unless overridden below.
                  </p>
                  
                  <div className="space-y-6">
                    {/* Lesson Defaults - Only show if course has lessons */}
                    {detectedItemTypes.has('lesson') && (
                      <div className="bg-white p-4 rounded-lg border border-blue-100">
                        <h5 className="text-sm font-semibold text-blue-700 mb-3">Lessons</h5>
                        <div className="flex flex-wrap gap-6">
                          <div className="flex-1 min-w-48">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Minimum Percentage
                            </label>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={requirements.defaultCriteria?.lesson?.minimumPercentage ?? 50}
                                onChange={(e) => handleDefaultCriteriaChange('lesson', 'minimumPercentage', Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                                disabled={!courseIsEditing}
                                className="flex-1"
                              />
                              <FaPercentage className="text-gray-400" />
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 mt-6">
                            <Switch
                              checked={requirements.defaultCriteria?.lesson?.requireAllQuestions || false}
                              onCheckedChange={(checked) => handleDefaultCriteriaChange('lesson', 'requireAllQuestions', checked)}
                              disabled={!courseIsEditing}
                            />
                            <label className="text-sm font-medium text-gray-700">
                              Require All Questions
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Assignment Defaults - Only show if course has assignments */}
                    {detectedItemTypes.has('assignment') && (
                      <div className="bg-white p-4 rounded-lg border border-blue-100">
                        <h5 className="text-sm font-semibold text-blue-700 mb-3">Assignments</h5>
                        <div className="flex-1 min-w-48">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sessions Required
                          </label>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              min="0"
                              max="5"
                              value={requirements.defaultCriteria?.assignment?.sessionsRequired || 1}
                              onChange={(e) => handleDefaultCriteriaChange('assignment', 'sessionsRequired', Math.max(0, Math.min(5, parseInt(e.target.value) || 1)))}
                              disabled={!courseIsEditing}
                              className="flex-1"
                            />
                            <span className="text-sm text-gray-500">sessions</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Exam Defaults - Only show if course has exams */}
                    {detectedItemTypes.has('exam') && (
                      <div className="bg-white p-4 rounded-lg border border-blue-100">
                        <h5 className="text-sm font-semibold text-blue-700 mb-3">Exams</h5>
                        <div className="flex-1 min-w-48">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sessions Required
                          </label>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              min="0"
                              max="5"
                              value={requirements.defaultCriteria?.exam?.sessionsRequired || 1}
                              onChange={(e) => handleDefaultCriteriaChange('exam', 'sessionsRequired', Math.max(0, Math.min(5, parseInt(e.target.value) || 1)))}
                              disabled={!courseIsEditing}
                              className="flex-1"
                            />
                            <span className="text-sm text-gray-500">sessions</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quiz Defaults - Only show if course has quizzes */}
                    {detectedItemTypes.has('quiz') && (
                      <div className="bg-white p-4 rounded-lg border border-blue-100">
                        <h5 className="text-sm font-semibold text-blue-700 mb-3">Quizzes</h5>
                        <div className="flex-1 min-w-48">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sessions Required
                          </label>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              min="0"
                              max="5"
                              value={requirements.defaultCriteria?.quiz?.sessionsRequired || 1}
                              onChange={(e) => handleDefaultCriteriaChange('quiz', 'sessionsRequired', Math.max(0, Math.min(5, parseInt(e.target.value) || 1)))}
                              disabled={!courseIsEditing}
                              className="flex-1"
                            />
                            <span className="text-sm text-gray-500">sessions</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Lab Defaults - Only show if course has labs */}
                    {detectedItemTypes.has('lab') && (
                      <div className="bg-white p-4 rounded-lg border border-blue-100">
                        <h5 className="text-sm font-semibold text-blue-700 mb-3">Labs</h5>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={requirements.defaultCriteria?.lab?.requiresSubmission || false}
                            onCheckedChange={(checked) => handleDefaultCriteriaChange('lab', 'requiresSubmission', checked)}
                            disabled={!courseIsEditing}
                          />
                          <label className="text-sm font-medium text-gray-700">
                            Requires Submission
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Info Defaults - Only show if course has info items */}
                    {detectedItemTypes.has('info') && (
                      <div className="bg-white p-4 rounded-lg border border-blue-100">
                        <h5 className="text-sm font-semibold text-blue-700 mb-3">Info (Informational)</h5>
                        <div className="flex flex-wrap gap-6">
                          <div className="flex-1 min-w-48">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Minimum Percentage
                            </label>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={requirements.defaultCriteria?.info?.minimumPercentage ?? 0}
                                onChange={(e) => handleDefaultCriteriaChange('info', 'minimumPercentage', Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                                disabled={!courseIsEditing}
                                className="flex-1"
                              />
                              <FaPercentage className="text-gray-400" />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 mt-6">
                            <Switch
                              checked={requirements.defaultCriteria?.info?.requireAllQuestions || false}
                              onCheckedChange={(checked) => handleDefaultCriteriaChange('info', 'requireAllQuestions', checked)}
                              disabled={!courseIsEditing}
                            />
                            <label className="text-sm font-medium text-gray-700">
                              Require All Questions
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Review Defaults - Only show if course has review items */}
                    {detectedItemTypes.has('review') && (
                      <div className="bg-white p-4 rounded-lg border border-blue-100">
                        <h5 className="text-sm font-semibold text-blue-700 mb-3">Review</h5>
                        <div className="flex flex-wrap gap-6">
                          <div className="flex-1 min-w-48">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Minimum Percentage
                            </label>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={requirements.defaultCriteria?.review?.minimumPercentage ?? 50}
                                onChange={(e) => handleDefaultCriteriaChange('review', 'minimumPercentage', Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                                disabled={!courseIsEditing}
                                className="flex-1"
                              />
                              <FaPercentage className="text-gray-400" />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 mt-6">
                            <Switch
                              checked={requirements.defaultCriteria?.review?.requireAllQuestions || false}
                              onCheckedChange={(checked) => handleDefaultCriteriaChange('review', 'requireAllQuestions', checked)}
                              disabled={!courseIsEditing}
                            />
                            <label className="text-sm font-medium text-gray-700">
                              Require All Questions
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Practice Defaults - Only show if course has practice items */}
                    {detectedItemTypes.has('practice') && (
                      <div className="bg-white p-4 rounded-lg border border-blue-100">
                        <h5 className="text-sm font-semibold text-blue-700 mb-3">Practice</h5>
                        <div className="flex flex-wrap gap-6">
                          <div className="flex-1 min-w-48">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Minimum Percentage
                            </label>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={requirements.defaultCriteria?.practice?.minimumPercentage ?? 0}
                                onChange={(e) => handleDefaultCriteriaChange('practice', 'minimumPercentage', Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                                disabled={!courseIsEditing}
                                className="flex-1"
                              />
                              <FaPercentage className="text-gray-400" />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 mt-6">
                            <Switch
                              checked={requirements.defaultCriteria?.practice?.requireAllQuestions || false}
                              onCheckedChange={(checked) => handleDefaultCriteriaChange('practice', 'requireAllQuestions', checked)}
                              disabled={!courseIsEditing}
                            />
                            <label className="text-sm font-medium text-gray-700">
                              Require All Questions
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Assessment Defaults - Only show if course has assessment items */}
                    {detectedItemTypes.has('assessment') && (
                      <div className="bg-white p-4 rounded-lg border border-blue-100">
                        <h5 className="text-sm font-semibold text-blue-700 mb-3">Assessment (Non-session)</h5>
                        <div className="flex flex-wrap gap-6">
                          <div className="flex-1 min-w-48">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Minimum Percentage
                            </label>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={requirements.defaultCriteria?.assessment?.minimumPercentage ?? 50}
                                onChange={(e) => handleDefaultCriteriaChange('assessment', 'minimumPercentage', Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                                disabled={!courseIsEditing}
                                className="flex-1"
                              />
                              <FaPercentage className="text-gray-400" />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 mt-6">
                            <Switch
                              checked={requirements.defaultCriteria?.assessment?.requireAllQuestions || false}
                              onCheckedChange={(checked) => handleDefaultCriteriaChange('assessment', 'requireAllQuestions', checked)}
                              disabled={!courseIsEditing}
                            />
                            <label className="text-sm font-medium text-gray-700">
                              Require All Questions
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Show message if no item types detected yet */}
                    {detectedItemTypes.size === 0 && (
                      <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                        Loading course structure to detect item types...
                      </p>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Lesson Overrides - Wrapped in Accordion */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="lesson-overrides">
              <AccordionTrigger className="text-md font-semibold text-gray-800">
                <div className="flex items-center justify-between w-full">
                  <span>Lesson Overrides</span>
                  {availableLessons.length > 0 && (
                    <span className="text-xs text-gray-600 ml-2">
                      ({overrideEntries.length} of {availableLessons.length} lessons have custom criteria)
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="flex justify-end">
                    {courseIsEditing && (
                      <Button 
                        onClick={handleAddOverride}
                        type="button"
                        className="flex items-center"
                        size="sm"
                        disabled={loadingLessons || availableLessons.every(lesson => 
                          Object.keys(requirements.lessonOverrides || {}).includes(lesson.itemId)
                        )}
                      >
                        <FaPlus className="mr-2" /> Add Override
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {loadingLessons ? (
                      <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                        Loading available lessons...
                      </p>
                    ) : overrideEntries.length === 0 ? (
                      <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                        No lesson overrides configured. All lessons will use the default criteria.
                      </p>
                    ) : (
                      overrideEntries.map(([lessonId, override]) => (
                        <LessonOverrideEditor
                          key={lessonId}
                          lessonId={lessonId}
                          override={override}
                          onChange={(newOverride) => handleOverrideChange(lessonId, lessonId, newOverride)}
                          onLessonIdChange={(newLessonId) => handleOverrideChange(lessonId, newLessonId, override)}
                          onDelete={() => handleDeleteOverride(lessonId)}
                          courseIsEditing={courseIsEditing}
                          availableLessons={availableLessons}
                          existingOverrides={requirements.lessonOverrides || {}}
                        />
                      ))
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Lesson Visibility Overrides */}
          <Accordion 
            type="single" 
            collapsible 
            defaultValue={shouldOpenAccordion ? "visibility-overrides" : undefined}
            className="w-full"
          >
            <AccordionItem value="visibility-overrides">
              <AccordionTrigger className="text-md font-semibold text-gray-800">
                Lesson Visibility Overrides
                {visibilityEntries.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    ({alwaysVisibleCount} always visible, {neverVisibleCount} hidden)
                  </span>
                )}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 px-4 py-2">
                  <p className="text-sm text-gray-600 mb-4">
                    Override the default visibility behavior for specific lessons. "Always Visible" bypasses progression requirements, "Never Visible" hides the lesson completely.
                  </p>
                  
                  {loadingLessons ? (
                    <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                      Loading available lessons...
                    </p>
                  ) : availableLessons.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                      No lessons available to configure.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {availableLessons.map(lesson => {
                        const currentVisibility = requirements.visibility?.[lesson.itemId] || 'default';
                        return (
                          <div key={lesson.itemId} className="flex items-center space-x-3 py-3 px-3 hover:bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-1">
                                <span className="text-sm font-medium text-gray-900">
                                  {lesson.title}
                                </span>
                                <span className="text-sm text-gray-600">•</span>
                                <span className="text-sm text-gray-600">{lesson.unitName}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                {lesson.type === 'lesson' && (
                                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                    Lesson
                                  </span>
                                )}
                                {lesson.type === 'assignment' && (
                                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                    Assignment
                                  </span>
                                )}
                                {lesson.type === 'exam' && (
                                  <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                                    Exam
                                  </span>
                                )}
                                {lesson.type === 'lab' && (
                                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                                    Lab
                                  </span>
                                )}
                                {lesson.type === 'quiz' && (
                                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                    Quiz
                                  </span>
                                )}
                                {lesson.type === 'info' && (
                                  <span className="text-xs px-2 py-1 bg-cyan-100 text-cyan-700 rounded">
                                    Info
                                  </span>
                                )}
                                {lesson.type === 'review' && (
                                  <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded">
                                    Review
                                  </span>
                                )}
                                {lesson.type === 'practice' && (
                                  <span className="text-xs px-2 py-1 bg-pink-100 text-pink-700 rounded">
                                    Practice
                                  </span>
                                )}
                                {lesson.type === 'assessment' && (
                                  <span className="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded">
                                    Assessment
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Select
                                value={currentVisibility}
                                onValueChange={(value) => handleVisibilityChange(lesson.itemId, value)}
                                disabled={!courseIsEditing}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="default">
                                    <span className="flex items-center">
                                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                                      Default
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="always">
                                    <span className="flex items-center">
                                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                      Always Visible
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="never">
                                    <span className="flex items-center">
                                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                      Never Visible
                                    </span>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}

      {!requirements.enabled && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <p className="text-gray-600">
            Progression requirements are disabled. Enable them to configure lesson completion criteria.
          </p>
        </div>
      )}
    </div>
  );
}

// Component for displaying and managing Firebase course configuration from database
function DatabaseCourseConfig({ courseId, courseIsEditing }) {
  const [config, setConfig] = useState(null);
  const [versionControl, setVersionControl] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingSync, setCheckingSync] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  const checkSyncStatus = async () => {
    // Sync functionality removed - configurations are now only in Firebase database
    if (!courseId) return;
    
    setCheckingSync(true);
    
    setSyncStatus({
      status: 'database_only',
      message: 'Configuration stored in Firebase database',
      fileVersion: 'N/A',
      dbVersion: 'Current',
      needsSync: false,
      lastSynced: new Date().toISOString(),
      upToDate: true,
      error: null
    });
    
    setCheckingSync(false);
  };

  const fetchCourseConfigFromDatabase = async () => {
    if (!courseId) return;
    
    try {
      setLoading(true);
      const db = getDatabase();
      
      // Fetch both config and version control data
      const configRef = ref(db, `courses/${courseId}/course-config`);
      const versionRef = ref(db, `courses/${courseId}/course-config-version-control`);
      
      const [configSnapshot, versionSnapshot] = await Promise.all([
        get(configRef),
        get(versionRef)
      ]);
      
      if (configSnapshot.exists()) {
        setConfig(configSnapshot.val());
        setError(null);
      } else {
        setConfig(null);
        setError(`No course configuration found in database for course ${courseId}`);
      }
      
      if (versionSnapshot.exists()) {
        setVersionControl(versionSnapshot.val());
      } else {
        setVersionControl(null);
      }
      
    } catch (err) {
      console.error('Error fetching course config from database:', err);
      setError(`Failed to fetch course configuration: ${err.message}`);
      setConfig(null);
      setVersionControl(null);
    } finally {
      setLoading(false);
    }
  };

  const manualSync = async () => {
    // Sync functionality removed - configurations are now only in Firebase database
    toast.info('Sync not needed', {
      description: 'Configurations are now stored directly in Firebase database'
    });
    
    // Just refresh the database config
    await fetchCourseConfigFromDatabase();
    
    return;
  };

  useEffect(() => {
    const initializeData = async () => {
      // First fetch the database config to get version control info
      await fetchCourseConfigFromDatabase();
      // Then check sync status
      await checkSyncStatus();
    };
    
    initializeData();
  }, [courseId]);

  const getSubtitle = () => {
    if (loading) return 'Loading database configuration...';
    if (error) return error;
    if (!config) return 'No configuration data found in database';
    
    let subtitle = 'Live data from Realtime Database';
    if (versionControl) {
      subtitle += ` • Version: ${versionControl.version} • Last synced: ${new Date(versionControl.lastSynced).toLocaleString()}`;
      if (versionControl.syncedFrom) {
        subtitle += ` • Source: ${versionControl.syncedFrom}`;
      }
    }
    return subtitle;
  };

  const getSyncStatusMessage = () => {
    if (checkingSync) return 'Checking for changes...';
    if (!syncStatus) return 'Sync status unknown';
    
    if (syncStatus.error) {
      return `Error: ${syncStatus.error}`;
    }
    
    if (syncStatus.upToDate) {
      return `${syncStatus.message} (File: v${syncStatus.fileVersion}, DB: v${syncStatus.dbVersion})`;
    }
    
    if (syncStatus.needsSync) {
      return `${syncStatus.message} (File: v${syncStatus.fileVersion}, DB: v${syncStatus.dbVersion})`;
    }
    
    return 'Ready to check sync status';
  };

  const getSyncStatusColor = () => {
    if (checkingSync) return 'text-blue-500';
    if (!syncStatus || syncStatus.error) return 'text-red-500';
    if (syncStatus.upToDate) return 'text-green-500';
    if (syncStatus.needsSync) return 'text-yellow-500';
    return 'text-gray-500';
  };

  const shouldShowSyncButton = () => {
    return syncStatus && (syncStatus.needsSync || syncStatus.error);
  };

  return (
    <div className="space-y-4">
      {/* Sync Warning Banner - Only show when sync is needed */}
      {syncStatus && syncStatus.needsSync && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaExclamationTriangle className="text-yellow-500" />
              <span className="font-medium text-yellow-800">Configuration Out of Sync</span>
            </div>
            <Button
              onClick={manualSync}
              disabled={syncing || checkingSync}
              variant="default"
              size="sm"
              className="flex items-center bg-yellow-600 hover:bg-yellow-700"
            >
              <FaSync className={`mr-1 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>
          <div className="mt-2 text-sm text-yellow-700">
            {getSyncStatusMessage()}
          </div>
        </div>
      )}

      {/* Sync Status and Controls */}
      <div className="p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaDatabase className="text-blue-500" />
            <span className="font-medium">Database Configuration</span>
            {versionControl && (
              <span className="text-sm text-gray-600">
                (v{versionControl.version}{versionControl.syncedFrom ? ` from ${versionControl.syncedFrom}` : ''})
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            {/* Show sync button when sync is needed */}
            {shouldShowSyncButton() && (
              <Button
                onClick={manualSync}
                disabled={syncing || checkingSync}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <FaSync className={`mr-1 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync from File'}
              </Button>
            )}
            
            {/* Show check for updates button when up to date */}
            {syncStatus && syncStatus.upToDate && (
              <Button
                onClick={checkSyncStatus}
                disabled={syncing || checkingSync}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <FaSync className={`mr-1 ${checkingSync ? 'animate-spin' : ''}`} />
                {checkingSync ? 'Checking...' : 'Check for Updates'}
              </Button>
            )}
          </div>
        </div>
        
        {/* Sync Status Display */}
        <div className={`mt-2 text-sm ${getSyncStatusColor()}`}>
          <span>{getSyncStatusMessage()}</span>
        </div>
      </div>

      {/* Configuration Display */}
      <JsonDisplay 
        data={config || { error: error || 'No data available' }}
        title="Course Configuration"
        subtitle={getSubtitle()}
        filePath={versionControl?.syncedFrom || `Database: /courses/${courseId}/course-config/`}
      />
      
      {/* Version Control Information */}
      {versionControl && (
        <JsonDisplay 
          data={versionControl}
          title="Version Control Information"
          subtitle="Sync metadata and version tracking"
          filePath={`Database: /courses/${courseId}/course-config-version-control/`}
        />
      )}
    </div>
  );
}

function Courses({
  courses,
  staffMembers,
  selectedCourseId,
  courseData,
  courseWeights,
  onCourseSelect,
  onCourseUpdate,
  onWeightsUpdate
}) {
  const { user, isStaff, hasSuperAdminAccess } = useAuth();
  // Always enable editing for courses
  const courseIsEditing = hasSuperAdminAccess();
  const navigate = useNavigate();
  
  // Local UI state (not moved to parent)
 
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCourseForDeletion, setSelectedCourseForDeletion] = useState(null);

  const activeOptions = [
    { value: 'Current', label: 'Current' },
    { value: 'Required', label: 'Required' },
    { value: 'Old', label: 'Old' },
    { value: 'Not Used', label: 'Not Used' },
    { value: 'Custom', label: 'Custom' },
  ];

  const firebaseActiveOptions = [
    { value: 'Current', label: 'Current' },
    { value: 'Required', label: 'Required' },
    { value: 'Not Used', label: 'Not Used' },
    { value: 'Development', label: 'Development' },
  ];

  const gradeOptions = [
    { value: '7', label: '7' },
    { value: '8', label: '8' },
    { value: '9', label: '9' },
    { value: '10', label: '10' },
    { value: '11', label: '11' },
    { value: '12', label: '12' },
  ];

  const diplomaCourseOptions = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' },
  ];

  // Basic auth check
  useEffect(() => {
    if (!user || !isStaff(user)) {
      navigate('/login');
      return;
    }
  }, [user, isStaff, navigate]);

  const handleCourseSelect = (courseId) => {
    onCourseSelect(courseId);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedData = {
      ...courseData,
      [name]: value,
    };
    onCourseUpdate(updatedData);

    const db = getDatabase();
    const courseRef = ref(db, `courses/${selectedCourseId}`);
    update(courseRef, { [name]: value })
      .then(() => {
        console.log(`Successfully updated ${name}`);
      })
      .catch((error) => {
        console.error('Error updating course:', error);
        alert('An error occurred while updating the course.');
      });
  };

  // Handler for allowedEmails updates
  const handleAllowedEmailsUpdate = (updatedEmails) => {
    const updatedData = {
      ...courseData,
      allowedEmails: updatedEmails
    };
    onCourseUpdate(updatedData);
  };

  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    // Convert value to integer
    const numValue = value === '' ? '' : parseInt(value, 10);
    const updatedData = {
      ...courseData,
      [name]: numValue,
    };
    onCourseUpdate(updatedData);

    const db = getDatabase();
    const courseRef = ref(db, `courses/${selectedCourseId}`);
    update(courseRef, { [name]: numValue })
      .then(() => {
        console.log(`Successfully updated ${name}`);
      })
      .catch((error) => {
        console.error('Error updating course:', error);
        alert('An error occurred while updating the course.');
      });
  };

  const handleSelectChange = (value, name) => {
    const updatedData = {
      ...courseData,
      [name]: value,
    };

    // Special handling: if DiplomaCourse is set to 'No', clear diplomaTimes.
    if (name === 'DiplomaCourse' && value === 'No') {
      updatedData.diplomaTimes = null;
    }

    onCourseUpdate(updatedData);

    const db = getDatabase();
    const courseRef = ref(db, `courses/${selectedCourseId}`);
    const updates = { [name]: value };
    if (name === 'DiplomaCourse' && value === 'No') {
      updates.diplomaTimes = null;
    }

    update(courseRef, updates)
      .then(() => {
        console.log(`Successfully updated ${name}`);
      })
      .catch((error) => {
        console.error('Error updating course:', error);
        alert('An error occurred while updating the course.');
      });
  };

  const handleMultiSelectChange = (selectedOptions, { name }) => {
    const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
    const updatedData = {
      ...courseData,
      [name]: values,
    };
    onCourseUpdate(updatedData);

    const db = getDatabase();
    const courseRef = ref(db, `courses/${selectedCourseId}`);
    update(courseRef, { [name]: values })
      .then(() => {
        console.log(`Successfully updated ${name}`);
      })
      .catch((error) => {
        console.error('Error updating course:', error);
        alert('An error occurred while updating the course.');
      });
  };

  const handleUnitsChange = (newUnits) => {
    const updatedData = {
      ...courseData,
      units: newUnits,
    };
    onCourseUpdate(updatedData);

    const db = getDatabase();
    const courseRef = ref(db, `courses/${selectedCourseId}`);
    update(courseRef, { units: newUnits })
      .then(() => {
        console.log('Successfully updated units');
      })
      .catch((error) => {
        console.error('Error updating course units:', error);
        alert('An error occurred while updating the course units.');
      });
  };



  const handleSwitchChange = (checked) => {
    if (!courseIsEditing) return;

    const updatedData = {
      ...courseData,
      allowStudentChats: checked,
    };
    onCourseUpdate(updatedData);

    const db = getDatabase();
    const courseRef = ref(db, `courses/${selectedCourseId}`);
    update(courseRef, { allowStudentChats: checked })
      .then(() => {
        console.log('Successfully updated allowStudentChats');
      })
      .catch((error) => {
        console.error('Error updating course:', error);
        alert('An error occurred while updating the course.');
      });
  };

  const handleDoesNotRequireScheduleChange = (checked) => {
    if (!courseIsEditing) return;

    const updatedData = {
      ...courseData,
      doesNotRequireSchedule: checked,
    };
    onCourseUpdate(updatedData);

    const db = getDatabase();
    const courseRef = ref(db, `courses/${selectedCourseId}`);
    update(courseRef, { doesNotRequireSchedule: checked })
      .then(() => {
        console.log('Successfully updated doesNotRequireSchedule');
      })
      .catch((error) => {
        console.error('Error updating course:', error);
        alert('An error occurred while updating the course.');
      });
  };

  const handleStatsChange = (checked) => {
    if (!courseIsEditing) return;

    const updatedData = {
      ...courseData,
      showStats: checked
    };
    onCourseUpdate(updatedData);

    const db = getDatabase();
    const courseRef = ref(db, `courses/${selectedCourseId}`);
    update(courseRef, { showStats: checked })
      .then(() => {
        console.log('Successfully updated showStats');
      })
      .catch((error) => {
        console.error('Error updating showStats:', error);
        alert('An error occurred while updating showStats.');
      });
  };

  const handleLtiLinksChange = (checked) => {
    if (!courseIsEditing) return;

    const updatedData = {
      ...courseData,
      ltiLinksComplete: checked
    };
    onCourseUpdate(updatedData);

    const db = getDatabase();
    const courseRef = ref(db, `courses/${selectedCourseId}`);
    update(courseRef, { ltiLinksComplete: checked })
      .then(() => {
        console.log('Successfully updated ltiLinksComplete');
      })
      .catch((error) => {
        console.error('Error updating ltiLinksComplete:', error);
        alert('An error occurred while updating LTI links status.');
      });
  };

  const handleOnRegistrationChange = (checked) => {
    if (!courseIsEditing) return;

    const updatedData = {
      ...courseData,
      OnRegistration: checked
    };
    onCourseUpdate(updatedData);

    const db = getDatabase();
    const courseRef = ref(db, `courses/${selectedCourseId}`);
    update(courseRef, { OnRegistration: checked })
      .then(() => {
        console.log('Successfully updated OnRegistration');
      })
      .catch((error) => {
        console.error('Error updating OnRegistration:', error);
        alert('An error occurred while updating registration visibility.');
      });
  };

  // Handler for AI features toggle (Firebase courses only)
  const handleAIFeaturesChange = async (checked) => {
    if (!courseIsEditing || !courseData?.firebaseCourse) return;

    try {
      const db = getDatabase();
      const configRef = ref(db, `courses/${selectedCourseId}/course-config`);
      await update(configRef, { aiFeatures: { enabled: checked } });
      
      // Update local state
      const updatedData = {
        ...courseData,
        'course-config': {
          ...courseData['course-config'],
          aiFeatures: { enabled: checked }
        }
      };
      onCourseUpdate(updatedData);
      
      toast.success(`AI features ${checked ? 'enabled' : 'disabled'} successfully`);
      console.log(`Successfully updated AI features: ${checked}`);
    } catch (error) {
      console.error('Error updating AI features:', error);
      toast.error('Failed to update AI features');
    }
  };

  // Function to recalculate gradebooks for all students in a Firebase course
  const handleRecalculateAllGradebooks = async () => {
    if (!selectedCourseId || !courseData?.firebaseCourse) {
      toast.error('This action is only available for Firebase courses');
      return;
    }

    const toastId = toast.loading('Starting gradebook recalculation...', {
      description: 'Please wait while we process all students'
    });

    try {
      const functions = getFunctions();
      const recalculateFunction = httpsCallable(functions, 'recalculateCourseGradebooksOptimized');
      
      const result = await recalculateFunction({
        courseId: parseInt(selectedCourseId)
      });

      if (result.data.success) {
        const { stats, totalStudentCount } = result.data;
        
        toast.success('Gradebook recalculation completed!', {
          id: toastId,
          description: `Successfully processed ${stats.successful} of ${totalStudentCount} students`,
          duration: 5000
        });

        // Show warning if some failed
        if (stats.failed > 0) {
          toast.warning(`${stats.failed} student(s) failed to update`, {
            description: 'Check the console for details',
            duration: 7000
          });
          console.log('Failed students:', result.data.failedStudents);
        }
      } else {
        toast.error('Recalculation failed', {
          id: toastId,
          description: result.data.message || 'An error occurred',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error recalculating gradebooks:', error);
      toast.error('Failed to recalculate gradebooks', {
        id: toastId,
        description: error.message || 'An unexpected error occurred',
        duration: 5000
      });
    }
  };

  const inputClass = `mt-1 block w-full p-2 border ${
    courseIsEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-100'
  } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm`;

  const groupedCourses = useMemo(() => {
    const groups = {};
    
    // Check if courses exists before trying to use Object.entries
    if (!courses) {
      return {};
    }
    
    Object.entries(courses)
      .filter(([courseId]) => courseId !== 'sections')
      .forEach(([courseId, course]) => {
        const grade = course.grade ? course.grade.trim() : 'Other';
        if (!grade) {
          if (!groups['Other']) groups['Other'] = [];
          groups['Other'].push({ courseId, course });
        } else {
          if (!groups[grade]) groups[grade] = [];
          groups[grade].push({ courseId, course });
        }
      });
  
    // Rest of function remains the same
    Object.keys(groups).forEach(grade => {
      groups[grade].sort((a, b) => {
        const idA = parseInt(a.courseId);
        const idB = parseInt(b.courseId);
        return idA - idB;
      });
    });
  
    const sortedGrades = Object.keys(groups)
      .filter((g) => g !== 'Other')
      .sort((a, b) => {
        const numA = parseInt(a, 10);
        const numB = parseInt(b, 10);
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }
        return a.localeCompare(b);
      });
    if (groups['Other']) {
      sortedGrades.push('Other');
    }
  
    const sortedGroups = {};
    sortedGrades.forEach((grade) => {
      sortedGroups[grade] = groups[grade];
    });
  
    return sortedGroups;
  }, [courses]);

  const handleDeleteCourse = async () => {
    if (!selectedCourseForDeletion) return;
  
    try {
      const db = getDatabase();
      const courseRef = ref(db, `courses/${selectedCourseForDeletion.id}`);
      await remove(courseRef);
      console.log(`Successfully deleted course: ${selectedCourseForDeletion.title}`);
  
      setDeleteDialogOpen(false);
      setSelectedCourseForDeletion(null);
      onCourseSelect(null);
      onCourseUpdate({});
      
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('An error occurred while deleting the course.');
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)]">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-200 p-4 pb-24 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Courses</h2>

        <AddCourseDialog />

        {Object.keys(groupedCourses).length > 0 ? (
          <div>
            {Object.entries(groupedCourses).map(([grade, coursesInGrade]) => (
              <div key={grade} className="mb-4">
                <h3 className="text-md font-semibold mb-2">{grade}</h3>
                <ul className="space-y-1 pl-4">
                  {coursesInGrade.map(({ courseId, course }) => (
                    <li
                      key={courseId}
                      className={`p-2 rounded cursor-pointer ${
                        selectedCourseId === courseId
                          ? 'bg-blue-500 text-white'
                          : 'bg-white hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className="flex items-center gap-2 flex-1"
                          onClick={() => handleCourseSelect(courseId)}
                        >
                          {course.modernCourse && (
                            <FaRegLightbulb
                              className={`${selectedCourseId === courseId ? 'text-white' : 'text-yellow-500'}`}
                              title="Modern Course"
                            />
                          )}
                          {course.firebaseCourse && (
                            <FaFire
                              className={`${selectedCourseId === courseId ? 'text-white' : 'text-orange-500'}`}
                              title="Firebase Course"
                            />
                          )}
                          {course.ltiLinksComplete && (
                            <FaLink
                              className={`${selectedCourseId === courseId ? 'text-white' : 'text-green-500'}`}
                              title="LTI Links Complete"
                            />
                          )}
                          {course.allowedEmails && course.allowedEmails.length > 0 && (
                            <FaEnvelope
                              className={`${selectedCourseId === courseId ? 'text-white' : 'text-purple-500'}`}
                              title={`Email Restricted (${course.allowedEmails.length} email${course.allowedEmails.length === 1 ? '' : 's'})`}
                            />
                          )}
                          <span>{course.Title || `Course ID: ${courseId}`}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteDialogOpen(true);
                            setSelectedCourseForDeletion({ id: courseId, title: course.Title });
                          }}
                          className={`p-1 rounded hover:bg-gray-200 ${
                            selectedCourseId === courseId ? 'text-white hover:text-red-600' : 'text-gray-500 hover:text-red-600'
                          }`}
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p>No courses available.</p>
        )}
      </div>
 {/* Course Details */}
 <div className="w-3/4 p-4 pb-24 overflow-y-auto">
        {selectedCourseId ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">
                  Course: {courses[selectedCourseId]?.Title || selectedCourseId}
                </h2>
                {courseData?.modernCourse && (
                  <div className="flex items-center gap-1 text-yellow-500" title="Modern Course">
                    <FaRegLightbulb />
                    <span className="text-sm font-medium">Modern Course</span>
                  </div>
                )}
                {courseData?.firebaseCourse && (
                  <div className="flex items-center gap-1 text-orange-500" title="Firebase Course">
                    <FaFire />
                    <span className="text-sm font-medium">Firebase Course</span>
                  </div>
                )}
                {courseData?.ltiLinksComplete && (
                  <div className="flex items-center gap-1 text-green-500" title="LTI Links Complete">
                    <FaLink />
                    <span className="text-sm font-medium">LTI Links Complete</span>
                  </div>
                )}
                {courseData?.allowedEmails && courseData.allowedEmails.length > 0 && (
                  <div className="flex items-center gap-1 text-purple-500" title="Email Restricted">
                    <FaEnvelope />
                    <span className="text-sm font-medium">Email Restricted</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
      {/* Add this new button for modern courses only */}
      {courseData?.modernCourse && !courseData?.firebaseCourse && (
  <Button
    onClick={() => window.open(`/course-editor/${selectedCourseId}`, '_blank')}
    variant="default"
    className="flex items-center bg-green-600 hover:bg-green-700 text-white mr-2"
  >
    <BookOpen className="mr-2 h-4 w-4" /> Edit Course Content
  </Button>
)}
  {/* Only show Course Weighting Dialog for non-Firebase courses */}
  {!courseData?.firebaseCourse && (
    <CourseWeightingDialog
                  courseId={selectedCourseId}
                  courseUnits={courseData.units || []}
                  courseWeights={courseWeights}
                  onWeightsUpdate={(categoryWeights, updatedUnits) => {
                    const db = getDatabase();
                    
                    try {
                      // Validate categoryWeights
                      if (!categoryWeights || typeof categoryWeights !== 'object') {
                        throw new Error('Invalid category weights');
                      }

                      // Create clean category weights object ensuring all values are numbers
                      const cleanCategoryWeights = {
                        lesson: Number(categoryWeights.lesson) || 0,
                        assignment: Number(categoryWeights.assignment) || 0,
                        exam: Number(categoryWeights.exam) || 0
                      };

                      // Create an update object starting with weights
                      const updates = {
                        [`courses/${selectedCourseId}/weights`]: cleanCategoryWeights
                      };

                      // Update unit weights if we have valid units
                      if (Array.isArray(updatedUnits)) {
                        updatedUnits.forEach((unit, unitIndex) => {
                          if (unit?.items && Array.isArray(unit.items)) {
                            unit.items.forEach((item, itemIndex) => {
                              // Ensure weight is a valid number before adding to updates
                              const weight = Number(item.weight);
                              if (!isNaN(weight)) {
                                updates[`courses/${selectedCourseId}/units/${unitIndex}/items/${itemIndex}/weight`] = weight;
                              }
                            });
                          }
                        });
                      }

                      // Log the final updates object for debugging
                      console.log('Sending updates:', updates);

                      // Get a reference to the root of the database
                      const rootRef = ref(db);

                      // Perform the multi-location update using the root reference
                      update(rootRef, updates)
                        .then(() => {
                          console.log('Successfully updated course weights');
                          onCourseUpdate({
                            ...courseData,
                            units: updatedUnits
                          });
                          onWeightsUpdate(cleanCategoryWeights);
                        })
                        .catch((error) => {
                          console.error('Firebase update error:', error);
                          alert('An error occurred while updating the course weights.');
                        });


                    } catch (error) {
                      console.error('Error preparing updates:', error.message, '\nFull error:', error);
                      alert('An error occurred while preparing the updates: ' + error.message);
                    }
                  }}
                  courseIsEditing={courseIsEditing}
                />
  )}
              </div>
            </div>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              {courseData.firebaseCourse ? (
                // Simplified Firebase Course Form
                <div className="flex flex-wrap -mx-2">
                  {/* Course Name */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Course Name
                    </label>
                    <input
                      type="text"
                      name="Title"
                      value={courseData.Title || ''}
                      disabled
                      className={`mt-1 block w-full p-2 border border-gray-200 bg-gray-100 rounded-md shadow-sm text-sm`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Read-only<br />
                    
                    </p>
                  </div>

                  {/* Development emails - Only show when course access is restricted */}
                  {courseData.restrictCourseAccess === true && (
                    <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Development emails
                      </label>
                      <ImprovedEmailManager
                        courseId={selectedCourseId}
                        allowedEmails={courseData.allowedEmails || []}
                        isEditing={courseIsEditing}
                        onUpdate={handleAllowedEmailsUpdate}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {courseData.allowedEmails && courseData.allowedEmails.length > 0
                          ? `Restricted to ${courseData.allowedEmails.length} email${courseData.allowedEmails.length === 1 ? '' : 's'}`
                          : 'Available to all students'}
                      </p>
                    </div>
                  )}

                  {/* Student Access Controls - Grouped together prominently */}
                  <div className="w-full px-2 mb-6">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="text-md font-semibold text-blue-800 mb-3">Student Access Controls</h4>
                      <div className="flex flex-wrap gap-6">
                        {/* Show on Registration Form */}
                        <div className="flex-1 min-w-64">
                          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                            <span>Show on Registration Form</span>
                            <Switch
                              checked={courseData.OnRegistration === true}
                              onCheckedChange={handleOnRegistrationChange}
                              disabled={!courseIsEditing}
                              className="ml-2"
                            />
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            When enabled, this course will appear in the registration form.
                          </p>
                        </div>

                        {/* Restrict Course Access */}
                        <div className="flex-1 min-w-64">
                          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                            <span>Restrict Course Access</span>
                            <Switch
                              checked={courseData.restrictCourseAccess === true}
                              onCheckedChange={(checked) => handleSelectChange(checked, "restrictCourseAccess")}
                              disabled={!courseIsEditing}
                              className="ml-2"
                            />
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            When enabled, student access to this course will be restricted. Developers can still access.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Course ID */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Course ID
                    </label>
                    <input
                      type="text"
                      name="LMSCourseID"
                      value={courseData.LMSCourseID || ''}
                      disabled
                      className={`mt-1 block w-full p-2 border border-gray-200 bg-gray-100 rounded-md shadow-sm text-sm`}
                    />
                  </div>
                
                  {/* Active */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Active
                    </label>
                    <Select
                      name="Active"
                      value={courseData.Active}
                      onValueChange={(value) => handleSelectChange(value, "Active")}
                      disabled={!courseIsEditing}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select active status" />
                      </SelectTrigger>
                      <SelectContent>
                        {firebaseActiveOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Minimum Completion Months */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Minimum Completion Months
                    </label>
                    <input
                      type="number"
                      name="minCompletionMonths"
                      value={courseData.minCompletionMonths || ''}
                      onChange={handleNumberInputChange}
                      disabled={!courseIsEditing}
                      className={inputClass}
                      min="0"
                      step="1"
                      placeholder="Enter minimum months"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum number of months required to complete this course
                    </p>
                  </div>

                  {/* Recommended Completion Months */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Recommended Completion Months
                    </label>
                    <input
                      type="number"
                      name="recommendedCompletionMonths"
                      value={courseData.recommendedCompletionMonths || ''}
                      onChange={handleNumberInputChange}
                      disabled={!courseIsEditing}
                      className={inputClass}
                      min="0"
                      step="1"
                      placeholder="Enter recommended months"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended time frame to complete this course
                    </p>
                  </div>

                  {/* Diploma Course */}
                  <div className="w-full px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diploma Course
                    </label>
                    <div className="flex space-x-4 items-start">
                      <div className="w-1/3">
                        <Select
                          name="DiplomaCourse"
                          value={courseData.DiplomaCourse}
                          onValueChange={(value) => handleSelectChange(value, "DiplomaCourse")}
                          disabled={!courseIsEditing}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Diploma Course" />
                          </SelectTrigger>
                          <SelectContent>
                            {diplomaCourseOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {courseData.DiplomaCourse === 'Yes' && (
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button 
                              variant="outline" 
                              type="button"
                              disabled={!courseIsEditing}
                              className="flex-shrink-0"
                            >
                              <FaClock className="mr-2" /> Manage Diploma Times
                            </Button>
                          </SheetTrigger>
                          <SheetContent 
                            side="right" 
                            className="w-[400px] sm:w-[540px]"
                            description="Manage diploma exam times for this course"
                          >
                            <SheetHeader>
                              <SheetTitle>Diploma Times Management</SheetTitle>
                              <SheetDescription>
                                Add and manage diploma exam times for this course. Each time can have a specific date, time, month, and confirmation status.
                              </SheetDescription>
                            </SheetHeader>
                            <ScrollArea className="h-[calc(100vh-200px)] mt-6">
                              <div className="pr-4">
                                <DiplomaTimes
                                  courseId={selectedCourseId}
                                  diplomaTimes={courseData.diplomaTimes || []}
                                  courseIsEditing={courseIsEditing}
                                />
                              </div>
                            </ScrollArea>
                          </SheetContent>
                        </Sheet>
                      )}
                    </div>
                  </div>

                  {/* Course Type */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Course Type
                    </label>
                    <Select
                      name="CourseType"
                      value={courseData.CourseType || ''}
                      onValueChange={(value) => handleSelectChange(value, "CourseType")}
                      disabled={!courseIsEditing}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select course type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Math">Math</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="Option">Option</SelectItem>
                        <SelectItem value="Custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {courseData.CourseType === 'Custom' && (
                      <input
                        type="text"
                        name="CourseTypeCustom"
                        value={courseData.CourseTypeCustom || ''}
                        onChange={handleInputChange}
                        disabled={!courseIsEditing}
                        className={`${inputClass} mt-2`}
                        placeholder="Enter custom value"
                      />
                    )}
                  </div>

                  {/* Grade */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Grade
                    </label>
                    <Select
                      name="grade"
                      value={courseData.grade || ''}
                      onValueChange={(value) => handleSelectChange(value, "grade")}
                      disabled={!courseIsEditing}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Course Description */}
                  <div className="w-full px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Course Description
                    </label>
                    <Textarea
                      name="description"
                      value={courseData.description || ''}
                      onChange={handleInputChange}
                      disabled={!courseIsEditing}
                      className={inputClass}
                      placeholder="Enter course description"
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Provide a detailed description of the course that will be visible to students.
                    </p>
                  </div>

                  {/* Allow Student-to-Student Chats */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <span>Allow Student-to-Student Chats</span>
                      <Switch
                        checked={courseData.allowStudentChats || false}
                        onCheckedChange={handleSwitchChange}
                        disabled={!courseIsEditing}
                        className="ml-2"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      When enabled, students can chat with other students in this course.
                    </p>
                  </div>

                  {/* Does Not Require Schedule */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <span>Does Not Require Schedule</span>
                      <Switch
                        checked={courseData.doesNotRequireSchedule || false}
                        onCheckedChange={handleDoesNotRequireScheduleChange}
                        disabled={!courseIsEditing}
                        className="ml-2"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      When enabled, this course does not require a schedule.
                    </p>
                  </div>

                  {/* Teachers (Using ReactSelect for multi-select) */}
                  <div className="w-full md:w-1/2 lg:w-2/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Teachers
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      The first teacher in the list will have primary assignment
                    </p>
                    <ReactSelect
                      isMulti
                      name="Teachers"
                      options={staffMembers}
                      value={staffMembers.filter(
                        (staff) =>
                          courseData.Teachers &&
                          courseData.Teachers.includes(staff.value)
                      )}
                      onChange={handleMultiSelectChange}
                      isDisabled={!courseIsEditing}
                      className="mt-1"
                    />
                  </div>

                  {/* Support Staff (Using ReactSelect for multi-select) */}
                  <div className="w-full md:w-1/2 lg:w-2/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Support Staff
                    </label>
                    <ReactSelect
                      isMulti
                      name="SupportStaff"
                      options={staffMembers}
                      value={staffMembers.filter(
                        (staff) =>
                          courseData.SupportStaff &&
                          courseData.SupportStaff.includes(staff.value)
                      )}
                      onChange={handleMultiSelectChange}
                      isDisabled={!courseIsEditing}
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                // Original Complex Course Form
                <div className="flex flex-wrap -mx-2">
                  {/* Course Name */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Course Name
                    </label>
                    <input
                      type="text"
                      name="Title"
                      value={courseData.Title || ''}
                      onChange={handleInputChange}
                      disabled={!courseIsEditing}
                      className={inputClass}
                    />
                  </div>

                  {/* Email Restrictions - Only show when course access is restricted */}
                  {courseData.restrictCourseAccess === true && (
                    <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Restrictions
                      </label>
                      <ImprovedEmailManager
                        courseId={selectedCourseId}
                        allowedEmails={courseData.allowedEmails || []}
                        isEditing={courseIsEditing}
                        onUpdate={handleAllowedEmailsUpdate}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {courseData.allowedEmails && courseData.allowedEmails.length > 0
                          ? `Restricted to ${courseData.allowedEmails.length} email${courseData.allowedEmails.length === 1 ? '' : 's'}`
                          : 'Available to all students'}
                      </p>
                    </div>
                  )}

                  {/* Student Access Controls - Grouped together prominently */}
                  <div className="w-full px-2 mb-6">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="text-md font-semibold text-blue-800 mb-3">Student Access Controls</h4>
                      <div className="flex flex-wrap gap-6">
                        {/* Show on Registration Form */}
                        <div className="flex-1 min-w-64">
                          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                            <span>Show on Registration Form</span>
                            <Switch
                              checked={courseData.OnRegistration === true}
                              onCheckedChange={handleOnRegistrationChange}
                              disabled={!courseIsEditing}
                              className="ml-2"
                            />
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            When enabled, this course will appear in the registration form.
                          </p>
                        </div>

                        {/* Restrict Course Access */}
                        <div className="flex-1 min-w-64">
                          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                            <span>Restrict Course Access</span>
                            <Switch
                              checked={courseData.restrictCourseAccess === true}
                              onCheckedChange={(checked) => handleSelectChange(checked, "restrictCourseAccess")}
                              disabled={!courseIsEditing}
                              className="ml-2"
                            />
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            When enabled, student access to this course will be restricted. Developers can still access.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* LMS Course ID  */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      LMS Course ID
                    </label>
                    <input
                      type="text"
                      name="LMSCourseID"
                      value={courseData.LMSCourseID || ''}
                      disabled
                      className={`mt-1 block w-full p-2 border border-gray-200 bg-gray-100 rounded-md shadow-sm text-sm`}
                    />
                  </div>

                  {/* Course Version */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Course Version
                    </label>
                    <Select
                      name="CourseVersion"
                      value={
                        courseData.firebaseCourse ? "firebase" :
                        courseData.modernCourse ? "modern" : "original"
                      }
                      onValueChange={(value) => {
                        const updatedData = {
                          ...courseData,
                          modernCourse: value === "modern",
                          firebaseCourse: value === "firebase"
                        };
                        onCourseUpdate(updatedData);
                        const db = getDatabase();
                        const courseRef = ref(db, `courses/${selectedCourseId}`);
                        update(courseRef, {
                          modernCourse: value === "modern",
                          firebaseCourse: value === "firebase"
                        })
                          .then(() => console.log('Updated Course Version'))
                          .catch((error) => alert('Error updating course version'));
                      }}
                      disabled={!courseIsEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select course version" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="original">Original</SelectItem>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="firebase">Firebase</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Active */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Active
                    </label>
                    <Select
                      name="Active"
                      value={courseData.Active}
                      onValueChange={(value) => handleSelectChange(value, "Active")}
                      disabled={!courseIsEditing}
                      >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select active status" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {courseData.Active === 'Custom' && (
                      <input
                        type="text"
                        name="ActiveCustom"
                        value={courseData.ActiveCustom || ''}
                        onChange={handleInputChange}
                        disabled={!courseIsEditing}
                        className={`${inputClass} mt-2`}
                        placeholder="Enter custom value"
                      />
                    )}
                  </div>

                  {/* Show Stats Switch */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <span>Show Course Statistics</span>
                      <Switch
                        checked={courseData.showStats || false}
                        onCheckedChange={handleStatsChange}
                        disabled={!courseIsEditing}
                        className="ml-2"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Enable to display course statistics to students
                    </p>
                  </div>

                  {/* LTI Links Switch - NEW FEATURE */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <span>LTI Links Complete</span>
                      <Switch
                        checked={courseData.ltiLinksComplete || false}
                        onCheckedChange={handleLtiLinksChange}
                        disabled={!courseIsEditing}
                        className="ml-2"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Indicate that all LTI links have been created for this course
                    </p>
                  </div>

                  {/* Course Credits - NEW FIELD */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Course Credits
                    </label>
                    <input
                      type="number"
                      name="courseCredits"
                      value={courseData.courseCredits || ''}
                      onChange={handleNumberInputChange}
                      disabled={!courseIsEditing}
                      className={inputClass}
                      min="0"
                      step="1"
                      placeholder="Enter number of credits"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the number of credits this course is worth
                    </p>
                  </div>

                  {/* Minimum Completion Months - NEW FIELD */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Minimum Completion Months
                    </label>
                    <input
                      type="number"
                      name="minCompletionMonths"
                      value={courseData.minCompletionMonths || ''}
                      onChange={handleNumberInputChange}
                      disabled={!courseIsEditing}
                      className={inputClass}
                      min="0"
                      step="1"
                      placeholder="Enter minimum months"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum number of months required to complete this course
                    </p>
                  </div>

                  {/* Recommended Completion Months - NEW FIELD */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Recommended Completion Months
                    </label>
                    <input
                      type="number"
                      name="recommendedCompletionMonths"
                      value={courseData.recommendedCompletionMonths || ''}
                      onChange={handleNumberInputChange}
                      disabled={!courseIsEditing}
                      className={inputClass}
                      min="0"
                      step="1"
                      placeholder="Enter recommended months"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended time frame to complete this course
                    </p>
                  </div>

                  {/* Diploma Course */}
                  <div className="w-full px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diploma Course
                    </label>
                    <div className="flex space-x-4 items-start">
                      <div className="w-1/3">
                        <Select
                          name="DiplomaCourse"
                          value={courseData.DiplomaCourse}
                          onValueChange={(value) => handleSelectChange(value, "DiplomaCourse")}
                          disabled={!courseIsEditing}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Diploma Course" />
                          </SelectTrigger>
                          <SelectContent>
                            {diplomaCourseOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {courseData.DiplomaCourse === 'Yes' && (
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button 
                              variant="outline" 
                              type="button"
                              disabled={!courseIsEditing}
                              className="flex-shrink-0"
                            >
                              <FaClock className="mr-2" /> Manage Diploma Times
                            </Button>
                          </SheetTrigger>
                          <SheetContent 
                            side="right" 
                            className="w-[400px] sm:w-[540px]"
                            description="Manage diploma exam times for this course"
                          >
                            <SheetHeader>
                              <SheetTitle>Diploma Times Management</SheetTitle>
                              <SheetDescription>
                                Add and manage diploma exam times for this course. Each time can have a specific date, time, month, and confirmation status.
                              </SheetDescription>
                            </SheetHeader>
                            <ScrollArea className="h-[calc(100vh-200px)] mt-6">
                              <div className="pr-4">
                                <DiplomaTimes
                                  courseId={selectedCourseId}
                                  diplomaTimes={courseData.diplomaTimes || []}
                                  courseIsEditing={courseIsEditing}
                                />
                              </div>
                            </ScrollArea>
                          </SheetContent>
                        </Sheet>
                      )}
                    </div>
                  </div>

                  {/* Course Type */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Course Type
                    </label>
                    <Select
                      name="CourseType"
                      value={courseData.CourseType || ''}
                      onValueChange={(value) => handleSelectChange(value, "CourseType")}
                      disabled={!courseIsEditing}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select course type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Math">Math</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="Option">Option</SelectItem>
                        <SelectItem value="Custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {courseData.CourseType === 'Custom' && (
                      <input
                        type="text"
                        name="CourseTypeCustom"
                        value={courseData.CourseTypeCustom || ''}
                        onChange={handleInputChange}
                        disabled={!courseIsEditing}
                        className={`${inputClass} mt-2`}
                        placeholder="Enter custom value"
                      />
                    )}
                  </div>

                  {/* Number of Hours to Complete */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Number of Hours to Complete
                    </label>
                    <input
                      type="number"
                      name="NumberOfHours"
                      value={courseData.NumberOfHours || ''}
                      onChange={handleInputChange}
                      disabled={!courseIsEditing}
                      className={inputClass}
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Specify the total number of hours required to complete the course.
                    </p>
                  </div>

                  {/* Grade */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Grade
                    </label>
                    <input
                      type="text"
                      name="grade"
                      value={courseData.grade || ''}
                      onChange={handleInputChange}
                      disabled={!courseIsEditing}
                      className={inputClass}
                      placeholder="Enter grade"
                    />
                  </div>

                  {/* Course Description */}
                  <div className="w-full px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Course Description
                    </label>
                    <Textarea
                      name="description"
                      value={courseData.description || ''}
                      onChange={handleInputChange}
                      disabled={!courseIsEditing}
                      className={inputClass}
                      placeholder="Enter course description"
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Provide a detailed description of the course that will be visible to students.
                    </p>
                  </div>

                  {/* Allow Student-to-Student Chats */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <span>Allow Student-to-Student Chats</span>
                      <Switch
                        checked={courseData.allowStudentChats || false}
                        onCheckedChange={handleSwitchChange}
                        disabled={!courseIsEditing}
                        className="ml-2"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      When enabled, students can chat with other students in this course.
                    </p>
                  </div>

                  {/* Teachers (Using ReactSelect for multi-select) */}
                  <div className="w-full md:w-1/2 lg:w-2/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Teachers
                    </label>
                    <ReactSelect
                      isMulti
                      name="Teachers"
                      options={staffMembers}
                      value={staffMembers.filter(
                        (staff) =>
                          courseData.Teachers &&
                          courseData.Teachers.includes(staff.value)
                      )}
                      onChange={handleMultiSelectChange}
                      isDisabled={!courseIsEditing}
                      className="mt-1"
                    />
                  </div>

                  {/* Support Staff (Using ReactSelect for multi-select) */}
                  <div className="w-full md:w-1/2 lg:w-2/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Support Staff
                    </label>
                    <ReactSelect
                      isMulti
                      name="SupportStaff"
                      options={staffMembers}
                      value={staffMembers.filter(
                        (staff) =>
                          courseData.SupportStaff &&
                          courseData.SupportStaff.includes(staff.value)
                      )}
                      onChange={handleMultiSelectChange}
                      isDisabled={!courseIsEditing}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Course Content - Different displays for Firebase vs regular courses */}
              <div className="mt-8">
                {courseData.firebaseCourse ? (
                  // Firebase Course - Show database configuration with sync controls
                  <div className="space-y-8">
                    {/* Gradebook Management Section */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FaGraduationCap className="text-blue-600 text-xl" />
                          <div>
                            <h3 className="font-semibold text-gray-800">Gradebook Management</h3>
                            <p className="text-sm text-gray-600">Recalculate gradebooks for all enrolled students</p>
                          </div>
                        </div>
                        <Button
                          onClick={handleRecalculateAllGradebooks}
                          variant="default"
                          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <FaSync className="mr-2" />
                          Recalculate All Gradebooks
                        </Button>
                      </div>
                    </div>

                    {/* AI Features Toggle Section */}
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FaRobot className="text-purple-600 text-xl" />
                          <div>
                            <h3 className="font-semibold text-gray-800">AI Features</h3>
                            <p className="text-sm text-gray-600">Enable AI-powered learning assistants and smart features</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700">
                            {courseData?.['course-config']?.aiFeatures?.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                          <Switch
                            checked={courseData?.['course-config']?.aiFeatures?.enabled || false}
                            onCheckedChange={handleAIFeaturesChange}
                            disabled={!courseIsEditing}
                            className="data-[state=checked]:bg-purple-600"
                          />
                        </div>
                      </div>
                      {courseData?.['course-config']?.aiFeatures?.enabled && (
                        <div className="mt-3 pt-3 border-t border-purple-100">
                          <p className="text-xs text-gray-500">
                            AI features include: Interactive AI tutors, smart question generation, automated feedback, 
                            and personalized learning recommendations.
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <FirebaseCourseConfigEditor 
                        courseId={selectedCourseId} 
                        courseData={courseData}
                        isEditing={courseIsEditing} 
                      />
                    </div>
                    
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="progression-requirements">
                        <AccordionTrigger className="text-lg font-semibold">
                          Course Progression Requirements
                        </AccordionTrigger>
                        <AccordionContent>
                          <ProgressionRequirementsManager 
                            courseId={selectedCourseId}
                            progressionRequirements={courseData.progressionRequirements}
                            courseIsEditing={courseIsEditing}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                ) : (
                  // Regular Course - Show editable units
                  <CourseUnitsEditor
                    courseId={selectedCourseId}
                    units={courseData.units || []}
                    onUnitsChange={handleUnitsChange}
                    courseIsEditing={courseIsEditing}
                  />
                )}
              </div>
            </form>
          </div>
        ) : (
          <p>Select a course to view details.</p>
        )}
      </div>

      {/* Delete Course Dialog */}
      <DeleteCourseDialog
        isOpen={deleteDialogOpen}
        setIsOpen={setDeleteDialogOpen}
        courseId={selectedCourseForDeletion?.id}
        courseTitle={selectedCourseForDeletion?.title}
        onDeleteComplete={() => {
          setSelectedCourseForDeletion(null);
          if (selectedCourseId === selectedCourseForDeletion?.id) {
            onCourseSelect(null);
            onCourseUpdate({});
          }
        }}
        onDelete={handleDeleteCourse}
      />

    
    </div>
  );
}

export default Courses;