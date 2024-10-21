import React, { useState, useEffect, useRef } from 'react';
import { getDatabase, ref, onValue, off, update, get } from 'firebase/database';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { Sheet, SheetContent } from "../components/ui/sheet";
import { Edit2, ExternalLink, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { ToggleGroup, ToggleGroupItem } from '../components/ui/toggle-group';
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import StudentDetailsSheet from './StudentDetailsSheet';
import ScheduleMaker from '../Schedule/ScheduleMaker'; 
import StudentNotes from './StudentNotes';
import SchedCombined from '../Schedule/schedCombined';

// Function to generate a color based on initials
const getColorFromInitials = (initials) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F06292', '#AED581', '#FFD54F', '#4DB6AC', '#7986CB'
  ];
  let hash = 0;
  for (let i = 0; i < initials.length; i++) {
    hash = initials.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  return colors[hash % colors.length];
};

function StudentDetail({ studentSummary }) {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const { user } = useAuth();
  const [visibleSections, setVisibleSections] = useState(['notes']);
  const [changedFields, setChangedFields] = useState({});
  const [assignedStaff, setAssignedStaff] = useState([]);
  const [courseId, setCourseId] = useState(null);
  const [courseTitle, setCourseTitle] = useState('');
  const prevDataRef = useRef();
  const [hasJsonGradebookSchedule, setHasJsonGradebookSchedule] = useState(false);
  const [jsonGradebookSchedule, setJsonGradebookSchedule] = useState(null);

  useEffect(() => {
    if (!studentSummary) {
      setStudentData(null);
      setNotes([]);
      setCourseId(null);
      setCourseTitle('');
      setHasJsonGradebookSchedule(false);
      setJsonGradebookSchedule(null);
      return;
    }

    setLoading(true);
    const db = getDatabase();
    const sanitizedEmail = sanitizeEmail(studentSummary.StudentEmail);
    const studentRef = ref(db, `students/${sanitizedEmail}`);

    const unsubscribe = onValue(studentRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setStudentData(data);

        // Use the CourseID from studentSummary
        const selectedCourseId = studentSummary.CourseID;

        if (data.courses && data.courses[selectedCourseId]) {
          setCourseId(selectedCourseId);

          // Fetch courseTitle
          const courseTitleRef = ref(db, `courses/${selectedCourseId}/Title`);
          try {
            const courseSnapshot = await get(courseTitleRef);
            if (courseSnapshot.exists()) {
              setCourseTitle(courseSnapshot.val());
            } else {
              setCourseTitle('Unknown Course');
            }
          } catch (error) {
            console.error('Error fetching course title:', error);
            setCourseTitle('Unknown Course');
          }

          // Check for jsonGradebookSchedule
          const jsonGradebookScheduleRef = ref(db, `students/${sanitizedEmail}/courses/${selectedCourseId}/jsonGradebookSchedule`);
          try {
            const scheduleSnapshot = await get(jsonGradebookScheduleRef);
            if (scheduleSnapshot.exists()) {
              setHasJsonGradebookSchedule(true);
              setJsonGradebookSchedule(scheduleSnapshot.val());
              setVisibleSections(['notes', 'progress']);
            } else {
              setHasJsonGradebookSchedule(false);
              setJsonGradebookSchedule(null);
              setVisibleSections(['notes', 'gradebook', 'schedule']);
            }
          } catch (error) {
            console.error('Error fetching jsonGradebookSchedule:', error);
            setHasJsonGradebookSchedule(false);
            setJsonGradebookSchedule(null);
            setVisibleSections(['notes', 'gradebook', 'schedule']);
          }

          // Handle jsonStudentNotes
          const courseData = data.courses[selectedCourseId];
          if (!courseData.jsonStudentNotes) {
            // Create jsonStudentNotes with legacy note as first item
            const legacyNote = {
              id: 'legacy-note',
              content: data.profile.StudentNotes || '',
              timestamp: 'Legacy Note',
              author: '',
              noteType: '📝'
            };
            
            const jsonStudentNotes = [legacyNote];
            
            // Update the database with the new structure
            const courseRef = ref(db, `students/${sanitizedEmail}/courses/${selectedCourseId}`);
            await update(courseRef, { jsonStudentNotes });
            
            setNotes(jsonStudentNotes);
          } else {
            setNotes(courseData.jsonStudentNotes);
          }

          // Fetch assigned staff
          const courseRef = ref(db, `courses/${selectedCourseId}`);
          try {
            const courseSnapshot = await get(courseRef);
            if (courseSnapshot.exists()) {
              const courseData = courseSnapshot.val();
              const teacherEmails = courseData.Teachers || [];
              const supportEmails = courseData.SupportStaff || [];

              const staffPromises = [
                ...teacherEmails.map(email =>
                  get(ref(db, `staff/${sanitizeEmail(email)}`)).then(snap => ({ ...snap.val(), role: 'Teacher' }))
                ),
                ...supportEmails.map(email =>
                  get(ref(db, `staff/${sanitizeEmail(email)}`)).then(snap => ({ ...snap.val(), role: 'Support Staff' }))
                )
              ];

              const staffData = await Promise.all(staffPromises);
              setAssignedStaff(staffData.filter(Boolean));
            }
          } catch (error) {
            console.error('Error fetching assigned staff:', error);
            setAssignedStaff([]);
          }
        } else {
          console.error(`Course ID ${selectedCourseId} not found for student ${sanitizedEmail}`);
          setCourseId(null);
          setCourseTitle('');
          setNotes([]);
        }

        if (prevDataRef.current) {
          const changed = findChangedFields(prevDataRef.current, data);
          setChangedFields(changed);
        }
        prevDataRef.current = data;
      } else {
        console.log('No student data available');
        setStudentData(null);
        setNotes([]);
        setCourseId(null);
        setCourseTitle('');
      }
      setLoading(false);
    });

    return () => {
      off(studentRef);
      unsubscribe();
    };
  }, [studentSummary]);

  useEffect(() => {
    if (Object.keys(changedFields).length > 0) {
      const timer = setTimeout(() => {
        setChangedFields({});
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [changedFields]);

  const findChangedFields = (prevData, newData, path = '') => {
    const changed = {};
    Object.keys(newData).forEach(key => {
      const currentPath = path ? `${path}.${key}` : key;
      if (typeof newData[key] === 'object' && newData[key] !== null) {
        Object.assign(changed, findChangedFields(prevData[key] || {}, newData[key], currentPath));
      } else if (prevData[key] !== newData[key]) {
        changed[currentPath] = true;
      }
    });
    return changed;
  };

  const handleToggleSection = (value) => {
    if (value.includes('more-info')) {
      setIsSheetOpen(true);
      setVisibleSections(value.filter(v => v !== 'more-info'));
    } else {
      setVisibleSections(value);
    }
  };

  const renderHTML = (htmlString) => {
    return <div dangerouslySetInnerHTML={{ __html: htmlString }} />;
  };

  if (!studentSummary) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Select a student to view details</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (!studentData || !studentData.courses || !courseId || !studentData.courses[courseId]) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Student Data Unavailable</h2>
        <p>No data available for this student.</p>
      </div>
    );
  }

  const courseData = studentData.courses[courseId];

  return (
    <div className="relative h-full overflow-hidden flex flex-col">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div>
            <h2 className="text-2xl font-bold text-[#315369]">
              {studentData.profile.firstName} {studentData.profile.lastName}
              {(changedFields['profile.firstName'] || changedFields['profile.lastName']) && (
                <span className="ml-2 text-yellow-500">●</span>
              )}
            </h2>
            <p className="text-sm text-gray-500">
              {studentData.profile.StudentEmail}
              {changedFields['profile.StudentEmail'] && (
                <span className="ml-2 text-yellow-500">●</span>
              )}
            </p>
          </div>
          <Button 
  variant="default" 
  size="sm" 
  onClick={() => setIsScheduleDialogOpen(true)}
  className="hidden sm:flex items-center bg-[#1fa6a7] text-white hover:bg-[#1a8f90] transition-colors"
>
  <Calendar className="h-4 w-4 mr-2" />
  Schedule Maker
</Button>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          {/* Assigned Staff Avatars */}
          <div className="flex -space-x-2 overflow-hidden">
            {assignedStaff.map((staff) => (
              <TooltipProvider key={staff.email}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar 
                      className="inline-block border-2 border-white" 
                      style={{ 
                        backgroundColor: getColorFromInitials(
                          `${typeof staff.firstName === 'string' ? staff.firstName.charAt(0) : ''}${typeof staff.lastName === 'string' ? staff.lastName.charAt(0) : ''}`
                        ) 
                      }}
                    >
                      <AvatarFallback>
                        {typeof staff.firstName === 'string' ? staff.firstName.charAt(0) : ''}
                        {typeof staff.lastName === 'string' ? staff.lastName.charAt(0) : ''}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{staff.displayName || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{staff.email}</p>
                    <p className="text-xs font-semibold">{staff.role}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
          {/* Toggle Groups for Sections */}
          <ToggleGroup 
            type="multiple" 
            value={visibleSections} 
            onValueChange={handleToggleSection}
            className="bg-[#40b3b3] p-1 rounded-full shadow-md w-full sm:w-auto"
          >
            <ToggleGroupItem 
              value="notes" 
              className="px-4 py-2 rounded-full data-[state=on]:bg-white data-[state=on]:text-[#40b3b3] text-white transition-colors"
            >
              Notes
            </ToggleGroupItem>
            {hasJsonGradebookSchedule ? (
              <ToggleGroupItem 
                value="progress" 
                className="px-4 py-2 rounded-full data-[state=on]:bg-white data-[state=on]:text-[#40b3b3] text-white transition-colors"
              >
                Progress
              </ToggleGroupItem>
            ) : (
              <>
                <ToggleGroupItem 
                  value="gradebook" 
                  className="px-4 py-2 rounded-full data-[state=on]:bg-white data-[state=on]:text-[#40b3b3] text-white transition-colors"
                >
                  Gradebook
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="schedule" 
                  className="px-4 py-2 rounded-full data-[state=on]:bg-white data-[state=on]:text-[#40b3b3] text-white transition-colors"
                >
                  Schedule
                </ToggleGroupItem>
              </>
            )}
           <ToggleGroupItem 
              value="more-info" 
              className="px-4 py-2 rounded-full data-[state=on]:bg-white data-[state=on]:text-[#40b3b3] text-white transition-colors"
            >
              More Info
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Schedule Maker Button for Mobile */}
      <div className="flex sm:hidden mb-4">
      <Button 
  variant="default" 
  size="sm" 
  onClick={() => setIsScheduleDialogOpen(true)}
  className="w-full flex items-center justify-center bg-[#1fa6a7] text-white hover:bg-[#1a8f90] transition-colors"
>
  <Calendar className="h-4 w-4 mr-2" />
  Schedule Maker
</Button>
      </div>

      {/* Content Sections */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 h-full overflow-hidden">
        {/* Notes Section */}
        {visibleSections.includes('notes') && (
          <div className={`flex flex-col overflow-hidden min-h-0 h-80 sm:h-auto ${visibleSections.length === 1 ? 'w-full' : 'sm:w-1/3'}`}>
            <Card className="flex-1 flex flex-col min-h-0 bg-white shadow-md">
              <CardContent className="p-4 flex flex-col flex-1 min-h-0">
                <h4 className="font-semibold mb-2 text-[#1fa6a7]">Notes</h4>
                <StudentNotes 
                  studentEmail={studentSummary.StudentEmail}
                  courseId={courseId}
                  initialNotes={notes}
                  onNotesUpdate={(updatedNotes) => {
                    setNotes(updatedNotes);
                    console.log('Notes updated:', updatedNotes);
                  }}
                />
              </CardContent>
            </Card>
          </div>
        )
        }

        {/* Gradebook and Schedule Sections */}
        <div className={`flex flex-col sm:flex-row flex-1 overflow-hidden space-y-4 sm:space-y-0 sm:space-x-4`}>
          {/* Gradebook Section */}
          {!hasJsonGradebookSchedule && visibleSections.includes('gradebook') && (
            <Card className="flex-1 bg-white shadow-md overflow-auto">
              <CardContent className="p-4 h-full">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-[#1fa6a7]">
                    Gradebook
                    {changedFields[`courses.${courseId}.GradebookHTML`] && (
                      <span className="ml-2 text-yellow-500">●</span>
                    )}
                  </h4>
                  {courseData.LinkToStudentInLMS && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(courseData.LinkToStudentInLMS, '_blank')}
                      className="text-[#1fa6a7]"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View in LMS
                    </Button>
                  )}
                </div>
                {courseData.GradebookHTML ? (
                  renderHTML(courseData.GradebookHTML)
                ) : (
                  <p>No Gradebook available.</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Schedule Section */}
          {!hasJsonGradebookSchedule && visibleSections.includes('schedule') && (
            <Card className="flex-1 bg-white shadow-md overflow-auto">
              <CardContent className="p-4 h-full">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-[#1fa6a7]">
                    Schedule
                    {changedFields[`courses.${courseId}.Schedule`] && (
                      <span className="ml-2 text-yellow-500">●</span>
                    )}
                  </h4>
                  <Button
  variant="outline"
  size="sm"
  onClick={() => setIsScheduleDialogOpen(true)}
  className="flex items-center bg-[#1fa6a7] text-white hover:bg-[#1a8f90] transition-colors"
>
  <Calendar className="h-4 w-4 mr-2" />
  Schedule Maker
</Button>
                </div>
                {courseData.Schedule ? (
                  renderHTML(courseData.Schedule)
                ) : (
                  <p>No Schedule available.</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Progress Section */}
          {hasJsonGradebookSchedule && visibleSections.includes('progress') && (
            <Card className="flex-1 bg-white shadow-md overflow-auto">
              <CardContent className="p-4 h-full">
                <h4 className="font-semibold mb-2 text-[#1fa6a7]">Progress</h4>
                <SchedCombined jsonGradebookSchedule={jsonGradebookSchedule} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* StudentDetailsSheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-full md:w-2/3 bg-gray-50">
          <StudentDetailsSheet 
            studentData={studentData}
            courseData={courseData}
            changedFields={changedFields}
            courseId={courseId}
            studentKey={sanitizeEmail(studentSummary.StudentEmail)}
            onUpdate={() => {
              // Refresh your data here if needed
            }}
            onClose={() => setIsSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Schedule Maker Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="max-w-6xl w-full h-[90vh] overflow-auto bg-gray-50">
          <DialogHeader>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
              <DialogTitle className="flex items-center">
                <Calendar className="h-6 w-6 mr-2" />
                Schedule Maker
              </DialogTitle>
              <div className="text-sm text-gray-700 text-center sm:text-left">
                <p><strong>Student:</strong> {studentData.profile.firstName} {studentData.profile.lastName}</p>
                <p><strong>Course:</strong> {courseTitle}</p>
              </div>
            </div>
          </DialogHeader>
          <div className="h-full overflow-auto p-4 flex flex-col">
            {courseId ? (
              <div className="flex-1">
                <ScheduleMaker 
                  studentKey={sanitizeEmail(studentSummary.StudentEmail)} 
                  courseId={courseId} 
                  onClose={() => setIsScheduleDialogOpen(false)}
                />
              </div>
            ) : (
              <p className="text-gray-600">No course selected.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentDetail;
