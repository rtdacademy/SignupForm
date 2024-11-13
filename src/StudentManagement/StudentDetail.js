import React, { useState, useEffect, useRef } from 'react';
import { getDatabase, ref, onValue, off, update, get } from 'firebase/database';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { Sheet, SheetContent } from "../components/ui/sheet";
import { Calendar, Check, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { ToggleGroup, ToggleGroupItem } from '../components/ui/toggle-group';
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { useMode, MODES } from '../context/ModeContext';
import StudentDetailsSheet from './StudentDetailsSheet';
import ScheduleMaker from '../Schedule/ScheduleMaker';
import StudentNotes from './StudentNotes';
import SchedCombined from '../Schedule/schedCombined';
import GradebookDisplay from '../Schedule/GradebookDisplay';
import ScheduleDisplay from '../Schedule/ScheduleDisplay';
import RegistrationInfo from './RegistrationInfo';

// Color generation function
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

const DataStatusIndicator = ({ label, exists }) => (
  <div className="flex items-center gap-2">
    {exists ? 
      <Check className="h-4 w-4 text-green-500" /> : 
      <X className="h-4 w-4 text-red-500" />
    }
    <span className="text-sm">{label}</span>
  </div>
);

const MigrationBanner = ({ scheduleJSON, jsonGradebook }) => (
  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
    <div className="flex items-center gap-2 mb-2">
      <AlertTriangle className="h-5 w-5 text-yellow-600" />
      <span className="font-medium text-yellow-800">
        Incomplete Schedule
      </span>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <DataStatusIndicator 
        label="Schedule Available" 
        exists={Boolean(scheduleJSON)} 
      />
      <DataStatusIndicator 
        label="Gradebook Available" 
        exists={Boolean(jsonGradebook)} 
      />
    </div>
  </div>
);

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
  const [jsonGradebookSchedule, setJsonGradebookSchedule] = useState(null);
  const [scheduleJSON, setScheduleJSON] = useState(null);
  const [jsonGradebook, setJsonGradebook] = useState(null);
  const { currentMode } = useMode();

  // Modify the getAvailableTabs function to return tabs in the desired order
  const getAvailableTabs = () => {
    if (currentMode === MODES.REGISTRATION) {
      return ['registration', 'notes', 'progress'];
    }
    return ['notes', 'progress', 'more-info'];
  };

  // Update the initial visible sections based on mode
  useEffect(() => {
    if (currentMode === MODES.REGISTRATION) {
      // In registration mode, show all tabs by default
      setVisibleSections(['registration', 'notes', 'progress']);
    } else {
      // In other modes, show notes and progress by default
      setVisibleSections(['notes', 'progress']);
    }
  }, [currentMode]);

  useEffect(() => {
    if (!studentSummary) {
      setStudentData(null);
      setNotes([]);
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
        const selectedCourseId = studentSummary.CourseID;

        if (data.courses && data.courses[selectedCourseId]) {
          setCourseId(selectedCourseId);
          const courseData = data.courses[selectedCourseId];

          // Fetch course title
          const courseTitleRef = ref(db, `courses/${selectedCourseId}/Title`);
          try {
            const courseSnapshot = await get(courseTitleRef);
            setCourseTitle(courseSnapshot.exists() ? courseSnapshot.val() : 'Unknown Course');
          } catch (error) {
            console.error('Error fetching course title:', error);
            setCourseTitle('Unknown Course');
          }

          // Set data states
          setJsonGradebookSchedule(courseData.jsonGradebookSchedule || null);
          setScheduleJSON(courseData.ScheduleJSON || null);
          setJsonGradebook(courseData.jsonGradebook || null);

          // Handle notes
          if (!courseData.jsonStudentNotes) {
            const legacyNote = {
              id: 'legacy-note',
              content: data.profile.StudentNotes || '',
              timestamp: 'Legacy Note',
              author: '',
              noteType: '📝'
            };
            const jsonStudentNotes = [legacyNote];
            await update(ref(db, `students/${sanitizedEmail}/courses/${selectedCourseId}`), 
              { jsonStudentNotes });
            setNotes(jsonStudentNotes);
          } else {
            setNotes(courseData.jsonStudentNotes);
          }

          // Fetch assigned staff
          const staffSnapshot = await get(ref(db, `courses/${selectedCourseId}`));
          if (staffSnapshot.exists()) {
            const courseData = staffSnapshot.val();
            const teacherEmails = courseData.Teachers || [];
            const supportEmails = courseData.SupportStaff || [];

            const staffPromises = [
              ...teacherEmails.map(email =>
                get(ref(db, `staff/${sanitizeEmail(email)}`))
                  .then(snap => ({ ...snap.val(), role: 'Teacher' }))
              ),
              ...supportEmails.map(email =>
                get(ref(db, `staff/${sanitizeEmail(email)}`))
                  .then(snap => ({ ...snap.val(), role: 'Support Staff' }))
              )
            ];

            const staffData = await Promise.all(staffPromises);
            setAssignedStaff(staffData.filter(Boolean));
          }
        }

        if (prevDataRef.current) {
          setChangedFields(findChangedFields(prevDataRef.current, data));
        }
        prevDataRef.current = data;
      }
      setLoading(false);
    });

    return () => {
      off(studentRef);
      unsubscribe();
    };
  }, [studentSummary]);

  // Update the handleToggleSection function
  const handleToggleSection = (value) => {
    if (currentMode === MODES.REGISTRATION) {
      // Allow toggling in registration mode, but ensure at least one tab is selected
      if (value.length > 0) {
        setVisibleSections(value);
      }
    } else {
      // In other modes, handle more-info sheet and normal toggling
      if (value.includes('more-info')) {
        setIsSheetOpen(true);
        setVisibleSections(value.filter(v => v !== 'more-info'));
      } else {
        setVisibleSections(value);
      }
    }
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
      </div>
    );
  }

  const availableTabs = getAvailableTabs();

  return (
    <div className="relative h-full overflow-hidden flex flex-col">
      {/* Header Section */}
      <div className="flex flex-col space-y-4 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <div>
              <h2 className="text-2xl font-bold text-[#315369]">
                {studentData?.profile.firstName} {studentData?.profile.lastName}
              </h2>
              <p className="text-sm text-gray-500">
                {studentData?.profile.StudentEmail}
              </p>
            </div>
            {/* Schedule Maker Button - Always enabled */}
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
            {currentMode !== MODES.REGISTRATION && (
              <div className="flex -space-x-2 overflow-hidden">
                {assignedStaff.map((staff) => (
                  <TooltipProvider key={staff.email}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar 
                          className="inline-block border-2 border-white" 
                          style={{ backgroundColor: getColorFromInitials(`${staff.firstName?.[0] || ''}${staff.lastName?.[0] || ''}`) }}
                        >
                          <AvatarFallback>
                            {staff.firstName?.[0] || ''}{staff.lastName?.[0] || ''}
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
            )}

            <ToggleGroup 
              type="multiple" 
              value={visibleSections} 
              onValueChange={handleToggleSection}
              className="bg-[#40b3b3] p-1 rounded-full shadow-md w-full sm:w-auto"
            >
              {availableTabs.map(tab => (
                <ToggleGroupItem 
                  key={tab}
                  value={tab} 
                  className="px-4 py-2 rounded-full data-[state=on]:bg-white data-[state=on]:text-[#40b3b3] text-white transition-colors"
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>

        {/* Only show banner if NOT using combined version and not in REGISTRATION mode */}
        {!jsonGradebookSchedule &&  (
          <MigrationBanner 
            scheduleJSON={scheduleJSON}
            jsonGradebook={jsonGradebook}
          />
        )}
      </div>

      {/* Mobile Schedule Maker Button - Always enabled */}
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
        {/* Registration Info Section */}
        {visibleSections.includes('registration') && (
          <div className={`flex flex-col flex-1 overflow-hidden ${visibleSections.length === 1 ? 'w-full' : 'sm:w-1/3'}`}>
            <Card className="flex-1 flex flex-col min-h-0 bg-white shadow-md">
              <CardContent className="p-4 flex flex-col flex-1 min-h-0">
                <h4 className="font-semibold mb-2 text-[#1fa6a7]">Registration Info</h4>
                <RegistrationInfo 
                  studentData={studentData}
                  courseId={courseId}
                  readOnly={currentMode !== MODES.REGISTRATION}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notes Section */}
        {visibleSections.includes('notes') && (
          <div className={`flex flex-col flex-1 overflow-hidden ${visibleSections.length === 1 ? 'w-full' : 'sm:w-1/3'}`}>
            <Card className="flex-1 flex flex-col min-h-0 bg-white shadow-md">
              <CardContent className="p-4 flex flex-col flex-1 min-h-0">
                <h4 className="font-semibold mb-2 text-[#1fa6a7]">Notes</h4>
                <StudentNotes 
                  studentEmail={sanitizeEmail(studentSummary.StudentEmail)}
                  courseId={courseId}
                  initialNotes={notes}
                  onNotesUpdate={setNotes}
                  readOnly={currentMode === MODES.REGISTRATION}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Progress Section */}
        {visibleSections.includes('progress') && (
          <div className={`flex flex-col flex-1 overflow-hidden ${visibleSections.length === 1 ? 'w-full' : 'sm:w-1/3'}`}>
            <Card className="flex-1 flex flex-col min-h-0 bg-white shadow-md overflow-auto">
              <CardContent className="p-4 flex flex-col flex-1 min-h-0">
                <h4 className="font-semibold mb-2 text-[#1fa6a7]">Progress</h4>
                {jsonGradebookSchedule ? (
                  <SchedCombined 
                    jsonGradebookSchedule={jsonGradebookSchedule}
                    readOnly={currentMode === MODES.REGISTRATION}
                  />
                ) : (
                  <div className="space-y-4 flex-1 flex flex-col min-h-0">
                    {jsonGradebook ? (
                      <GradebookDisplay 
                        jsonGradebook={jsonGradebook}
                        readOnly={currentMode === MODES.REGISTRATION}
                      />
                    ) : (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-700">No gradebook data available</p>
                      </div>
                    )}
                    {scheduleJSON ? (
                      <ScheduleDisplay 
                        scheduleJSON={scheduleJSON}
                        readOnly={currentMode === MODES.REGISTRATION}
                      />
                    ) : (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-700">No schedule data available</p>
                      </div>
                    )}
                    {!jsonGradebook && !scheduleJSON && currentMode !== MODES.REGISTRATION && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 font-medium">No progress data available</p>
                        <p className="text-red-600 text-sm mt-1">
                          Use the Schedule Maker to create a schedule for this student.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Sheets and Dialogs */}
      <>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent side="right" className="w-full md:w-2/3 bg-gray-50">
            <StudentDetailsSheet 
              studentData={studentData}
              courseData={studentData?.courses[courseId]}
              changedFields={changedFields}
              courseId={courseId}
              studentKey={sanitizeEmail(studentSummary.StudentEmail)}
              onClose={() => setIsSheetOpen(false)}
            />
          </SheetContent>
        </Sheet>

        <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
          <DialogContent className="max-w-6xl w-full h-[90vh] overflow-auto bg-gray-50">
            <DialogHeader>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                <DialogTitle className="flex items-center">
                  <Calendar className="h-6 w-6 mr-2" />
                  Schedule Maker
                </DialogTitle>
                <div className="text-sm text-gray-700 text-center sm:text-left">
                  <p><strong>Student:</strong> {studentData?.profile.firstName} {studentData?.profile.lastName}</p>
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
      </>
    </div>
  );
}

// Helper function for tracking changed fields
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

export default StudentDetail;
