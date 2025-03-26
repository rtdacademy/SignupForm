import React, { useState, useEffect, useMemo } from 'react';
import { getDatabase, ref, update, remove } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  FaEdit, 
  FaExclamationTriangle, 
  FaPlus, 
  FaTrash, 
  FaClock, 
  FaRegLightbulb,
  FaLink
} from 'react-icons/fa';
import { BookOpen } from 'lucide-react';
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
import { ScrollArea } from '../components/ui/scroll-area';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import CourseUnitsEditor from './CourseUnitsEditor';
import AddCourseDialog from './AddCourseDialog';
import DeleteCourseDialog from './DeleteCourseDialog';
import CourseWeightingDialog from './CourseWeightingDialog';

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

function DiplomaTimeEntry({ diplomaTime, onChange, onDelete, isEditing }) {
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
          <label className="block text-sm font-medium mb-1">Date</label>
          <Input
            type="date"
            value={diplomaTime.displayDate || formatDateForDisplay(diplomaTime.date) || ''}
            onChange={handleDateChange}
            disabled={!isEditing}
          />
        </div>

        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Time</label>
            <div className="flex space-x-2 items-center">
              <Select
                name="hour"
                value={diplomaTime.hour}
                onValueChange={(value) => handleTimeChange({ value }, { name: 'hour' })}
                disabled={!isEditing}
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
                disabled={!isEditing}
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
                disabled={!isEditing}
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
            disabled={!isEditing}
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
              disabled={!isEditing}
            />
            <label className="text-sm">Confirmed</label>
          </div>

          {isEditing && (
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

function DiplomaTimes({ courseId, diplomaTimes, isEditing }) {
  const [times, setTimes] = useState(diplomaTimes || []);

  useEffect(() => {
    setTimes(diplomaTimes || []);
  }, [diplomaTimes]);

  const handleAdd = () => {
    if (!isEditing) return;

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
    if (!isEditing) return;

    const updatedTimes = times.map((time, i) => 
      i === index ? updatedTime : time
    );
    setTimes(updatedTimes);
    updateDatabase(updatedTimes);
  };

  const handleDelete = (index) => {
    if (!isEditing) return;

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
        {isEditing && (
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
              isEditing={isEditing}
            />
          ))
        )}
      </div>
    </div>
  );
}

function Courses({
  courses,
  staffMembers,
  selectedCourseId,
  courseData,
  courseWeights,
  isEditing,
  onCourseSelect,
  onCourseUpdate,
  onWeightsUpdate,
  toggleEditing
}) {
  const { user, isStaff, hasSuperAdminAccess } = useAuth();
  const navigate = useNavigate();
  
  // Local UI state (not moved to parent)
 
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCourseForDeletion, setSelectedCourseForDeletion] = useState(null);

  const activeOptions = [
    { value: 'Current', label: 'Current' },
    { value: 'Old', label: 'Old' },
    { value: 'Not Used', label: 'Not Used' },
    { value: 'Custom', label: 'Custom' },
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

  const handleEditClick = () => {
    if (hasSuperAdminAccess()) {
      toggleEditing(true);
    } else {
      // Optional: show a toast or small notification that super admin access is required
      alert("Super Admin access required to edit courses");
    }
  };


  const handleSwitchChange = (checked) => {
    if (!isEditing) return;

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

  const handleStatsChange = (checked) => {
    if (!isEditing) return;

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
    if (!isEditing) return;

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

  const inputClass = `mt-1 block w-full p-2 border ${
    isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-100'
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
                          {course.ltiLinksComplete && (
                            <FaLink 
                              className={`${selectedCourseId === courseId ? 'text-white' : 'text-green-500'}`} 
                              title="LTI Links Complete"
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
                {courseData?.ltiLinksComplete && (
                  <div className="flex items-center gap-1 text-green-500" title="LTI Links Complete">
                    <FaLink />
                    <span className="text-sm font-medium">LTI Links Complete</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
  {!isEditing && (
    <>
      <button
        onClick={handleEditClick}
        className={`flex items-center px-3 py-1 ${
          hasSuperAdminAccess() 
            ? 'bg-blue-600 hover:bg-blue-700' 
            : 'bg-gray-400 cursor-not-allowed'
        } text-white rounded transition duration-200 text-sm`}
        disabled={!hasSuperAdminAccess()}
      >
        <FaEdit className="mr-1" /> Edit Course
        {!hasSuperAdminAccess() && (
          <PermissionIndicator type="SUPER_ADMIN" className="ml-1" />
        )}
      </button>
      
      {/* Add this new button for modern courses */}
      {courseData?.modernCourse && (
  <Button
    onClick={() => window.open(`/course-editor/${selectedCourseId}`, '_blank')}
    variant="default"
    className="flex items-center bg-green-600 hover:bg-green-700 text-white"
  >
    <BookOpen className="mr-2 h-4 w-4" /> Edit Course Content
  </Button>
)}
    </>
  )}
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
                  isEditing={isEditing}
                />
              </div>
            </div>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
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
                    disabled={!isEditing}
                    className={inputClass}
                  />
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
                    value={courseData.modernCourse ? "modern" : "original"}
                    onValueChange={(value) => {
                      const updatedData = { ...courseData, modernCourse: value === "modern" };
                      onCourseUpdate(updatedData);
                      const db = getDatabase();
                      const courseRef = ref(db, `courses/${selectedCourseId}`);
                      update(courseRef, { modernCourse: value === "modern" })
                        .then(() => console.log('Updated Course Version'))
                        .catch((error) => alert('Error updating course version'));
                    }}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select course version" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="original">Original</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
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
                    disabled={!isEditing}
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
                      disabled={!isEditing}
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
                      disabled={!isEditing}
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
                      disabled={!isEditing}
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
                    disabled={!isEditing}
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
                    disabled={!isEditing}
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
                    disabled={!isEditing}
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
                        disabled={!isEditing}
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
                            disabled={!isEditing}
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
                                isEditing={isEditing}
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
                    disabled={!isEditing}
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
                      disabled={!isEditing}
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
                    disabled={!isEditing}
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
                    disabled={!isEditing}
                    className={inputClass}
                    placeholder="Enter grade"
                  />
                </div>

                {/* Allow Student-to-Student Chats */}
                <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <span>Allow Student-to-Student Chats</span>
                    <Switch
                      checked={courseData.allowStudentChats || false}
                      onCheckedChange={handleSwitchChange}
                      disabled={!isEditing}
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
                    isDisabled={!isEditing}
                    className="mt-1"
                  />
                </div>

                {/* Support Staff (Using ReactSelect for multi-select) */}
                <div className="w-full md:w-1/2 lg=w-2/3 px-2 mb-4">
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
                    isDisabled={!isEditing}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Course Units Editor */}
              <div className="mt-8">
                <CourseUnitsEditor
                  courseId={selectedCourseId}
                  units={courseData.units || []}
                  onUnitsChange={handleUnitsChange}
                  isEditing={isEditing}
                />
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