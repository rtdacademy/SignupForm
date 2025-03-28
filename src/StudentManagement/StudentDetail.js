import React, { useState, useEffect, useRef } from 'react';
import { getDatabase, ref, onValue, off, update, get } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { Sheet, SheetContent } from "../components/ui/sheet";
import { Calendar, Split, IdCard, AlertTriangle, Edit, Maximize2} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { ToggleGroup, ToggleGroupItem } from '../components/ui/toggle-group';
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { useMode, MODES } from '../context/ModeContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import StudentDetailsSheet from './StudentDetailsSheet';
import ScheduleMaker from '../Schedule/ScheduleMaker';
import StudentNotes from './StudentNotes';
import SchedCombined from '../Schedule/schedCombined';
import ScheduleDisplay from '../Schedule/ScheduleDisplay';
import RegistrationInfo from './RegistrationInfo';
import InternationalDocuments from './InternationalDocuments';
import { useUserPreferences } from '../context/UserPreferencesContext';
import PaymentInfo from './PaymentInfo'; 
import PASIManager from './PASIManager';
import StudentGradesDisplay from './StudentGradesDisplay';

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

function StudentDetail({ studentSummary, isMobile, onRefresh  }) {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isComparisonSheetOpen, setIsComparisonSheetOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const { user } = useAuth();
  const [visibleSections, setVisibleSections] = useState(isMobile ? 'notes' : ['notes']);
  const [changedFields, setChangedFields] = useState({});
  const [assignedStaff, setAssignedStaff] = useState([]);
  const [courseId, setCourseId] = useState(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseData, setCourseData] = useState(null); // Store the course data 
  const [ltiLinksComplete, setLtiLinksComplete] = useState(false); // Track ltiLinksComplete status
  const prevDataRef = useRef();
  const [jsonGradebookSchedule, setJsonGradebookSchedule] = useState(null);
  const [scheduleJSON, setScheduleJSON] = useState(null);
  const [jsonGradebook, setJsonGradebook] = useState(null);
  const { currentMode } = useMode();
  const { preferences, updatePreferences } = useUserPreferences();
  const [newLMSId, setNewLMSId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localLMSStudentID, setLocalLMSStudentID] = useState(studentSummary?.LMSStudentID || null);
  const [isLMSIdDialogOpen, setIsLMSIdDialogOpen] = useState(false);
  // Add this with the other state variables at the top of the component
const [isNotesSheetOpen, setIsNotesSheetOpen] = useState(false);

  const [comparisonTab, setComparisonTab] = useState("unified");
  const lmsId = studentData?.courses?.[courseId]?.LMSStudentID || "";

  // New refs and state for dynamic font sizing
  const nameRef = useRef(null);
  const containerRef = useRef(null);
  const [nameFontSize, setNameFontSize] = useState(24); // Starting font size for text-2xl

  // Check if student has a schedule
  const hasSchedule = !!studentData?.courses?.[courseId]?.ScheduleJSON;

  const handleStudentStatsChange = (checked) => {
    const db = getDatabase();
    const studentRef = ref(db, `students/${sanitizeEmail(studentSummary.StudentEmail)}/courses/${courseId}`);
    update(studentRef, { showStats: checked })
      .then(() => {
        console.log('Successfully updated student showStats');
        setStudentData(prev => ({
          ...prev,
          courses: {
            ...prev.courses,
            [courseId]: {
              ...prev.courses[courseId],
              showStats: checked
            }
          }
        }));
      })
      .catch((error) => {
        console.error('Error updating student stats setting:', error);
        alert('An error occurred while updating the student stats setting.');
      });
  };

  const handleFetchLMSId = async () => {
    if (!studentSummary?.StudentEmail || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const functions = getFunctions();
      const fetchLMSStudentId = httpsCallable(functions, 'fetchLMSStudentId');
      
      const result = await fetchLMSStudentId({
        email: studentSummary.StudentEmail,
        courseId: courseId
      });
      
      if (result.data.success) {
        setLocalLMSStudentID(result.data.lmsId);
        
        // Update the student data with the new LMS ID
        setStudentData(prev => ({
          ...prev,
          courses: {
            ...prev.courses,
            [courseId]: {
              ...prev.courses[courseId],
              LMSStudentID: result.data.lmsId
            }
          }
        }));
        
        toast.success("Successfully fetched and updated LMS Student ID");
      } else {
        toast.error(result.data.message || "Failed to fetch LMS ID");
      }
    } catch (error) {
      console.error('Error fetching LMS ID:', error);
      toast.error(error.message || "An error occurred while fetching the LMS ID");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitLMSId = async () => {
    if (!newLMSId.trim()) return;
  
    setIsSubmitting(true);
    const db = getDatabase();
  
    try {
      // Update the student's LMS Student ID
      await update(
        ref(db, `students/${sanitizeEmail(studentSummary.StudentEmail)}/courses/${courseId}`),
        {
          LMSStudentID: newLMSId
        }
      );
      
      // Update local state
      setStudentData(prev => ({
        ...prev,
        courses: {
          ...prev.courses,
          [courseId]: {
            ...prev.courses[courseId],
            LMSStudentID: newLMSId
          }
        }
      }));
  
      toast.success('LMS Student ID updated successfully');
      setNewLMSId('');
      setIsLMSIdDialogOpen(false);
    } catch (error) {
      console.error('Error updating LMS Student ID:', error);
      toast.error('Failed to update LMS Student ID. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Updated getAvailableTabs function to handle ltiLinksComplete course
  const getAvailableTabs = () => {
    // If no student data or no courses, return minimal tabs
    if (!studentData || !studentData.courses || !courseId || !studentData.courses[courseId]) {
      if (currentMode === MODES.REGISTRATION) {
        return ['registration', 'pasi', 'edge-admin', 'notes'];
      }
      return ['notes'];
    }
  
    // Registration mode tabs
    if (currentMode === MODES.REGISTRATION) {
      // Start with ordered base tabs
      let tabs = ['registration', 'pasi', 'edge-admin', 'notes'];
      
      // Add documents tab if internationalDocuments exist
      if (studentData.profile.internationalDocuments) {
        tabs.push('documents');
      }
  
      // Add paid tab in registration mode
      tabs.push('paid');
  
      return tabs;
    } else {
      // Non-registration mode tabs
      const baseTabs = ['notes'];
      
      // If course has ltiLinksComplete, show grades tab instead of schedule/gradebook
      if (ltiLinksComplete) {
        return [...baseTabs, 'grades', 'more-info'];
      } else if (studentData.courses[courseId].jsonGradebookSchedule) {
        return [...baseTabs, 'progress', 'more-info'];
      } else {
        return [...baseTabs, 'schedule', 'gradebook', 'more-info'];
      }
    }
  };

  // Right inside StudentDetail:
  useEffect(() => {
    console.log("StudentDetail MOUNTED (or re-mounted)");
    return () => console.log("StudentDetail UNMOUNTED");
  }, []);


  useEffect(() => {
    if (isMobile) {
      // For mobile, show first available tab
      const availableTabs = getAvailableTabs();
      setVisibleSections(availableTabs[0]);
    } else {
      // For desktop, use saved preferences or default to initial set of tabs
      const availableTabs = getAvailableTabs();
      const mode = currentMode === MODES.REGISTRATION ? 'registration' : 'default';
      const savedTabs = preferences?.selectedTabs?.[mode] || [];
      
      // Filter saved tabs to only include currently available tabs
      const validSavedTabs = savedTabs.filter(tab => availableTabs.includes(tab));
      
      if (validSavedTabs.length > 0) {
        setVisibleSections(validSavedTabs);
      } else if (availableTabs.length > 2) {
        setVisibleSections(availableTabs.slice(0, 3));
      } else {
        setVisibleSections(availableTabs);
      }
    }
  }, [currentMode, studentData, courseId, isMobile, preferences, ltiLinksComplete]); // Add ltiLinksComplete as dependency

  useEffect(() => {
    if (!studentSummary) {
      setStudentData(null);
      setNotes([]);
      setCourseId(null);
      return;
    }

    setLoading(true);
    const db = getDatabase();
    const sanitizedEmail = sanitizeEmail(studentSummary.StudentEmail);
    const studentRef = ref(db, `students/${sanitizedEmail}`);
    const paymentsRef = ref(db, `payments/${sanitizedEmail}/courses`);

    const unsubscribe = onValue(studentRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const selectedCourseId = studentSummary.CourseID;

        try {
          // Fetch payments data
          const paymentsSnapshot = await get(paymentsRef);
          const paymentsData = paymentsSnapshot.val() || {};
          
          // Merge payments data with course data if courses exist
          if (data.courses) {
            Object.keys(data.courses).forEach(courseId => {
              if (paymentsData[courseId]) {
                data.courses[courseId].paymentDetails = paymentsData[courseId];
              }
            });
          }

          setStudentData(data);

          // Check if the course still exists
          if (data.courses && data.courses[selectedCourseId]) {
            setCourseId(selectedCourseId);
            const courseData = data.courses[selectedCourseId];

            // Fetch additional course information including ltiLinksComplete
            const courseFetchRef = ref(db, `courses/${selectedCourseId}`);
            try {
              const courseSnapshot = await get(courseFetchRef);
              if (courseSnapshot.exists()) {
                const fullCourseData = courseSnapshot.val();
                setCourseData(fullCourseData);
                setCourseTitle(fullCourseData.Title || 'Unknown Course');
                setLtiLinksComplete(!!fullCourseData.ltiLinksComplete); // Set ltiLinksComplete flag
              } else {
                setCourseTitle('Unknown Course');
                setLtiLinksComplete(false);
              }
            } catch (error) {
              console.error('Error fetching course data:', error);
              setCourseTitle('Unknown Course');
              setLtiLinksComplete(false);
            }

            setJsonGradebookSchedule(courseData.jsonGradebookSchedule || null);
            setScheduleJSON(courseData.ScheduleJSON || null);
            setJsonGradebook(courseData.jsonGradebook || null);

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
          } else {
            // Course was deleted or doesn't exist
            setCourseId(null);
            setJsonGradebookSchedule(null);
            setScheduleJSON(null);
            setJsonGradebook(null);
            setNotes([]);
            setLtiLinksComplete(false);
          }

          if (prevDataRef.current) {
            setChangedFields(findChangedFields(prevDataRef.current, data));
          }
          prevDataRef.current = data;
        } catch (error) {
          console.error('Error fetching additional data:', error);
          setStudentData(data); // Still set the basic student data even if additional fetches fail
        }
      } else {
        // Student data doesn't exist
        setStudentData(null);
        setCourseId(null);
        setLtiLinksComplete(false);
      }
      setLoading(false);
    });

    return () => {
      off(studentRef);
      unsubscribe();
    };
  }, [studentSummary]);

  // Update the font sizing useEffect
  useEffect(() => {
    if (!isMobile && nameRef.current && containerRef.current) {
      const nameContainer = nameRef.current;
      const container = containerRef.current;

      const adjustNameSize = () => {
        if (!nameContainer || !container) return;
        
        try {
          const availableWidth = container.offsetWidth - 500; // Reserve space for tabs and badges
          if (availableWidth <= 0) return; // Don't proceed if width is invalid
          
          let currentFontSize = 24; // Starting size (text-2xl)
          
          // Reset font size to measure natural width
          nameContainer.style.fontSize = `${currentFontSize}px`;
          
          // If name is too wide, gradually reduce font size
          while (nameContainer.scrollWidth > availableWidth && currentFontSize > 12) {
            currentFontSize -= 1;
            nameContainer.style.fontSize = `${currentFontSize}px`;
          }
          
          setNameFontSize(currentFontSize);
        } catch (error) {
          console.error('Error adjusting name size:', error);
        }
      };

      // Use ResizeObserver instead of window resize event
      const resizeObserver = new ResizeObserver((entries) => {
        // Wait for next frame to ensure DOM is updated
        requestAnimationFrame(() => {
          adjustNameSize();
        });
      });

      // Start observing the container
      resizeObserver.observe(container);

      // Initial adjustment
      adjustNameSize();

      // Cleanup
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [isMobile, studentData, nameRef.current, containerRef.current]);

  const handleToggleSection = (value) => {
    if (isMobile) {
      // In mobile mode, value will be a single string
      setVisibleSections(value);
    } else {
      if (currentMode === MODES.REGISTRATION) {
        if (value.length > 0) {
          setVisibleSections(value);
          // Save preferences
          updatePreferences({
            ...preferences,
            selectedTabs: {
              ...preferences.selectedTabs,
              registration: value
            }
          });
        }
      } else {
        if (value.includes('more-info')) {
          setIsSheetOpen(true);
          const newValue = value.filter(v => v !== 'more-info');
          setVisibleSections(newValue);
          // Save preferences
          updatePreferences({
            ...preferences,
            selectedTabs: {
              ...preferences.selectedTabs,
              default: newValue
            }
          });
        } else {
          setVisibleSections(value);
          // Save preferences
          updatePreferences({
            ...preferences,
            selectedTabs: {
              ...preferences.selectedTabs,
              default: value
            }
          });
        }
      }
    }
  };

  // Create Schedule Button component
  const CreateScheduleButton = () => (
    <Button 
      variant="default" 
      size="sm" 
      onClick={() => setIsScheduleDialogOpen(true)}
      className="w-full flex items-center justify-center bg-[#1fa6a7] text-white hover:bg-[#1a8f90] transition-colors mb-4"
    >
      <Calendar className="h-4 w-4 mr-2" />
      {hasSchedule ? "Update Schedule" : "Create Schedule"}
    </Button>
  );

  // NEW LMS ID Button Component
  const LMSIdButton = ({ compact = false, className = "" }) => (
    <Button
      variant={compact ? "outline" : "default"}
      size="sm"
      onClick={() => setIsLMSIdDialogOpen(true)}
      className={`text-[#40b3b3] border-[#40b3b3] hover:bg-[#40b3b3] hover:text-white ${className}`}
    >
      <IdCard className="h-4 w-4 mr-1" />
      {studentData?.courses?.[courseId]?.LMSStudentID 
        ? (compact 
            ? `${studentData.courses[courseId].LMSStudentID}` 
            : `LMS ID: ${studentData.courses[courseId].LMSStudentID} (Edit)`)
        : "Set LMS ID"}
      {!compact && studentData?.courses?.[courseId]?.LMSStudentID && <Edit className="h-3 w-3 ml-1" />}
    </Button>
  );

  // Added function to render the gradebook container with LMS button
  const renderGradebookContainer = (gradebookUrl) => {
    if (!lmsId) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-center text-yellow-700">
            <p className="mb-4">LMS Student ID is required to view the gradebook</p>
            <LMSIdButton className="mx-auto" />
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-end mb-2">
          <LMSIdButton compact={true} />
        </div>
        <div className="w-full h-full min-h-[500px] relative">
          <iframe
            src={gradebookUrl}
            className="w-full h-full absolute inset-0 border-0"
            title="Student Gradebook"
            allow="fullscreen"
          />
        </div>
      </div>
    );
  };

  const renderScheduleContent = () => {
    const courseData = studentData?.courses[courseId];

    return (
      <div className="space-y-4">
        <CreateScheduleButton />
        
        {courseData?.ScheduleJSON ? (
          <ScheduleDisplay 
            scheduleJSON={courseData.ScheduleJSON}
            readOnly={currentMode === MODES.REGISTRATION}
          />
        ) : courseData?.Schedule ? (
          <div 
            className="legacy-schedule" 
            dangerouslySetInnerHTML={{ __html: courseData.Schedule }}
          />
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700">No schedule available in either system</p>
          </div>
        )}
      </div>
    );
  };

  const renderProgressContent = () => {
    const courseData = studentData?.courses[courseId];
    
    return (
      <div className="space-y-4">
        <CreateScheduleButton />

        <div className="flex items-center justify-between p-2 border rounded-lg bg-gray-50">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={studentData?.courses[courseId]?.showStats ?? true}
                    onCheckedChange={handleStudentStatsChange}
                  />
                  <span className="text-sm font-medium">Show Statistics</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p>Toggle this off to hide statistics for students in unique situations where progress tracking may not be applicable. This helps prevent confusion when standard progress metrics don't reflect their actual situation.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <SchedCombined 
          jsonGradebookSchedule={courseData?.jsonGradebookSchedule}
          readOnly={currentMode === MODES.REGISTRATION}
        />
      </div>
    );
  };

  // Updated render function for StudentGradesDisplay
  const renderGradesContent = () => {
    if (!studentData?.courses[courseId]?.LMSStudentID) {
      return (
        <div className="flex items-center justify-center h-full p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-center text-yellow-700">
            <p className="mb-2">LMS Student ID is required for displaying grades</p>
            <LMSIdButton className="mx-auto mt-2" />
          </div>
        </div>
      );
    }

    // Check if student has a schedule
    if (!hasSchedule) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center mb-4 text-amber-600">
            <AlertTriangle className="h-6 w-6 mr-2" />
            <h3 className="text-lg font-medium">Schedule Required</h3>
          </div>
          <p className="text-center text-yellow-700 mb-4">
            Student needs a schedule to track progress properly. Please create a schedule first.
          </p>
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsScheduleDialogOpen(true)}
            className="bg-[#1fa6a7] text-white hover:bg-[#1a8f90] transition-colors"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Create Schedule
          </Button>
        </div>
      );
    }

    return (
      <div className="h-full">
        <div className="flex justify-end mb-2">
         
        </div>
        <StudentGradesDisplay
          studentKey={sanitizeEmail(studentSummary.StudentEmail)}
          courseId={courseId}
          useSheet={false}
          className="h-full"
        />
      </div>
    );
  };

  // New render function for Edge Admin content
  const renderEdgeAdminContent = () => {
    const handleOpenSearchTab = () => {
      window.open('https://edge.rtdacademy.com/admin/admin2.php', '_blank');
    };
  
    const handleOpenNewStudentTab = () => {
      window.open(`https://edge.rtdacademy.com/course/listusers.php?cid=${courseId}&newstu=new`, '_blank');
    };
  
    const handleOpenExistingStudentTab = () => {
      window.open(`https://edge.rtdacademy.com/course/listusers.php?cid=${courseId}&enroll=student`, '_blank');
    };
  
    return (
      <div className="flex flex-col h-full">
        <div className="flex flex-col space-y-4">
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenSearchTab}
              className="text-[#40b3b3] border-[#40b3b3] hover:bg-[#40b3b3] hover:text-white w-full text-left justify-start"
            >
              1. Search for Existing Student
            </Button>
            <p className="text-sm mt-2 text-gray-600">
              Search for the newly registered student to see if they already exist. If they exist, use the third option. If they don't exist, use the second option.
            </p>
          </div>
  
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenNewStudentTab}
              className="text-[#40b3b3] border-[#40b3b3] hover:bg-[#40b3b3] hover:text-white w-full text-left justify-start"
            >
              2. Add New Student
            </Button>
            <p className="text-sm mt-2 text-gray-600">
              Use this option when the student does not already have an account. You can add the student to the course from here.
            </p>
          </div>
  
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenExistingStudentTab}
              className="text-[#40b3b3] border-[#40b3b3] hover:bg-[#40b3b3] hover:text-white w-full text-left justify-start"
            >
              3. Add Existing Student to Course
            </Button>
            <p className="text-sm mt-2 text-gray-600">
              Use this option to register an existing student by their username.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Updated renderGradebookContent with LMS ID button integration
  const renderGradebookContent = () => {
    if (!studentSummary?.CourseID) {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700">Missing course information</p>
        </div>
      );
    }
  
    const gradebookUrl = `https://edge.rtdacademy.com/course/gradebook.php?cid=${studentSummary?.CourseID}&stu=${lmsId}`;
    return renderGradebookContainer(gradebookUrl);
  };

  // Render the comparison sheet content - updated with LMS ID button
  const renderComparisonSheetContent = () => {
    const courseData = studentData?.courses[courseId];
    const gradebookUrl = `https://edge.rtdacademy.com/course/gradebook.php?cid=${studentSummary?.CourseID}&stu=${lmsId}`;

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <Split className="h-5 w-5 mr-2" />
            Student Progress Views
          </h2>
          <LMSIdButton compact={true} />
        </div>
        
        <Tabs
          value={comparisonTab}
          onValueChange={setComparisonTab}
          className="flex-1 flex flex-col h-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="unified">YourWay Schedule</TabsTrigger>
            <TabsTrigger value="gradebook">Gradebook</TabsTrigger>
            <TabsTrigger value="schedule">Legacy Schedule</TabsTrigger>
          </TabsList>
          <TabsContent value="gradebook" className="flex-1 h-full">
            {!lmsId ? (
              <div className="flex items-center justify-center h-full p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-center text-yellow-700">
                  <p className="mb-4">LMS Student ID is required to view the gradebook</p>
                  <LMSIdButton className="mx-auto" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex justify-end mb-2">
                 
                </div>
                <div className="w-full h-full min-h-[600px] relative">
                  <iframe
                    src={gradebookUrl}
                    className="w-full h-full absolute inset-0 border-0"
                    title="Student Gradebook"
                    allow="fullscreen"
                  />
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="schedule" className="flex-1 h-full overflow-auto">
            {courseData?.ScheduleJSON ? (
              <ScheduleDisplay 
                scheduleJSON={courseData.ScheduleJSON}
                readOnly={true}
              />
            ) : courseData?.Schedule ? (
              <div 
                className="legacy-schedule" 
                dangerouslySetInnerHTML={{ __html: courseData.Schedule }}
              />
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-700">No schedule available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="unified" className="flex-1 h-full">
            {!hasSchedule ? (
              <div className="flex flex-col items-center justify-center h-full p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center mb-4 text-amber-600">
                  <AlertTriangle className="h-6 w-6 mr-2" />
                  <h3 className="text-lg font-medium">Schedule Required</h3>
                </div>
                <p className="text-center text-yellow-700 mb-4">
                  A schedule is needed to view the YourWay schedule. Please create one first.
                </p>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setIsScheduleDialogOpen(true)}
                  className="bg-[#1fa6a7] text-white hover:bg-[#1a8f90] transition-colors"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Create Schedule
                </Button>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex justify-end mb-2">
                  <LMSIdButton compact={true} />
                </div>
                <StudentGradesDisplay
                  studentKey={sanitizeEmail(studentSummary.StudentEmail)}
                  courseId={courseId}
                  useSheet={false}
                  className="h-full"
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  if (!studentSummary || !studentData || !courseId || !studentData.courses || !studentData.courses[courseId]) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <p className="mb-2">No student selected or no courses available.</p>
          {currentMode === MODES.REGISTRATION && (
            <p className="text-sm">Select a student from the list to view or manage their courses.</p>
          )}
        </div>
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

  const isSectionVisible = (sectionName) => {
    if (isMobile) {
      return visibleSections === sectionName;
    }
    return Array.isArray(visibleSections) && visibleSections.includes(sectionName);
  };

  return (
    <div className="relative h-full overflow-hidden flex flex-col">
      {/* Header Section */}
      <div className={`flex flex-col space-y-4 mb-4 ${isMobile ? 'space-y-2' : ''}`}>
        {/* Desktop Header Layout */}
        {!isMobile && (
          <div ref={containerRef} className="flex items-center w-full gap-4">
         
            
            {/* Tabs - Fixed width and always visible */}
            <div className="flex-none">
              <ToggleGroup 
                type="multiple" 
                value={visibleSections} 
                onValueChange={handleToggleSection}
                className="bg-[#40b3b3] p-1 rounded-full shadow-md"
              >
                {getAvailableTabs().map(tab => (
                  <ToggleGroupItem 
                    key={tab}
                    value={tab} 
                    className="px-4 py-2 rounded-full data-[state=on]:bg-white data-[state=on]:text-[#40b3b3] text-white transition-colors whitespace-nowrap"
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            {/* Staff Badges - Fixed width */}
            {currentMode !== MODES.REGISTRATION && (
              <div className="flex-none -space-x-2 overflow-hidden w-32">
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

            {/* Student Name - Flexible width and font size */}
            <div className="flex-1 min-w-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h2 
                      ref={nameRef}
                      className="font-bold text-[#315369] truncate"
                      style={{ fontSize: `${nameFontSize}px` }}
                    >
                      {(studentData?.profile.preferredFirstName || studentData?.profile.firstName || '') + ' ' + (studentData?.profile.lastName || '')}
                    </h2>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{(studentData?.profile.preferredFirstName || studentData?.profile.firstName || '') + ' ' + (studentData?.profile.lastName || '')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
         
          </div>
        )}

        {/* Mobile Layout */}
        {isMobile && (
          <>
            {/* LMS ID Button for mobile */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLMSIdDialogOpen(true)}
              className="flex items-center justify-center text-[#40b3b3] border-[#40b3b3] hover:bg-[#40b3b3] hover:text-white w-full mb-2"
            >
              <IdCard className="h-4 w-4 mr-2" />
              {studentData?.courses?.[courseId]?.LMSStudentID ? 
                `LMS ID: ${studentData.courses[courseId].LMSStudentID}` : 
                "Set LMS ID"}
            </Button>
            
            <RadioGroup
              value={visibleSections}
              onValueChange={handleToggleSection}
              className="grid grid-cols-2 gap-1.5 w-full"
            >
              {getAvailableTabs().map(tab => (
                <div key={tab} className="relative">
                  <RadioGroupItem value={tab} id={tab} className="peer sr-only" />
                  <Label
                    htmlFor={tab}
                    className="flex items-center justify-center px-2 py-1.5 w-full rounded-md border border-[#40b3b3] bg-white text-[#40b3b3] cursor-pointer transition-all peer-data-[state=checked]:bg-[#40b3b3] peer-data-[state=checked]:text-white hover:bg-[#40b3b3]/10"
                  >
                    <span className="text-xs font-medium text-center whitespace-nowrap">
                      {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </>
        )}

        {/* Global Create Schedule Button that appears when no schedule exists */}
        {!hasSchedule && currentMode !== MODES.REGISTRATION && (
          <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center">
            <div className="flex-1">
              <div className="flex items-center text-amber-600 mb-1">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span className="font-medium">No Schedule Found</span>
              </div>
              <p className="text-sm text-yellow-700">
                Student needs a schedule to track progress properly. Some features might be limited without it.
              </p>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsScheduleDialogOpen(true)}
              className="ml-3 bg-[#1fa6a7] text-white hover:bg-[#1a8f90] transition-colors flex-shrink-0"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Create Schedule
            </Button>
          </div>
        )}
      </div>

      {/* Main Content Sections */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 h-full overflow-hidden">
        {/* Registration Info Section - Only shown in registration mode */}
        {currentMode === MODES.REGISTRATION && isSectionVisible('registration') && (
          <div className={`flex flex-col flex-1 overflow-hidden ${!isMobile && Array.isArray(visibleSections) && visibleSections.length === 1 ? 'w-full' : 'sm:w-1/3'}`}>
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
{isSectionVisible('notes') && (
  <div className={`flex flex-col flex-1 overflow-hidden ${!isMobile && Array.isArray(visibleSections) && visibleSections.length === 1 ? 'w-full' : 'sm:w-1/3'}`}>
    <Card className="flex-1 flex flex-col min-h-0 bg-white shadow-md">
      <CardContent className="p-4 flex flex-col flex-1 min-h-0">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-[#1fa6a7]">Notes</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsNotesSheetOpen(true)}
            className="text-[#40b3b3] hover:bg-[#40b3b3] hover:text-white h-7 w-7 p-0"
            title="Expand notes"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
        <StudentNotes 
  studentEmail={sanitizeEmail(studentSummary.StudentEmail)}
  courseId={courseId}
  initialNotes={notes}
  onNotesUpdate={setNotes}
  readOnly={currentMode === MODES.REGISTRATION}
  isExpanded={false} // Default view
/>
      </CardContent>
    </Card>
  </div>
)}

        {/* International Documents Section */}
        {currentMode === MODES.REGISTRATION && isSectionVisible('documents') && studentData?.profile?.internationalDocuments && (
          <div className={`flex flex-col flex-1 overflow-hidden ${!isMobile && Array.isArray(visibleSections) && visibleSections.length === 1 ? 'w-full' : 'sm:w-1/3'}`}>
            <Card className="flex-1 flex flex-col min-h-0 bg-white shadow-md">
              <CardContent className="p-4 flex flex-col flex-1 min-h-0">
                <h4 className="font-semibold mb-2 text-[#1fa6a7]">International Documents</h4>
                <InternationalDocuments documents={studentData.profile.internationalDocuments} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Grades Section - New section for ltiLinksComplete courses */}
        {isSectionVisible('grades') && ltiLinksComplete && (
          <div className={`flex flex-col flex-1 overflow-hidden ${!isMobile && Array.isArray(visibleSections) && visibleSections.length === 1 ? 'w-full' : 'sm:w-1/3'}`}>
            <Card className="flex-1 flex flex-col min-h-0 bg-white shadow-md overflow-auto">
              <CardContent className="p-4 flex flex-col flex-1 min-h-0">
          
<div className="flex items-center justify-between mb-2">
  <h4 className="font-semibold text-[#1fa6a7]">Progress</h4>
  <div className="flex space-x-2">
    <LMSIdButton compact={true} />
    <Button
      variant="outline"
      size="sm"
      onClick={() => setIsScheduleDialogOpen(true)}
      className="text-[#40b3b3] border-[#40b3b3] hover:bg-[#40b3b3] hover:text-white flex items-center"
    >
      <Calendar className="h-4 w-4 mr-1" />
      {hasSchedule ? "" : "Create"}
    </Button>
    <Button
      variant="outline"
      size="sm"
      onClick={() => setIsComparisonSheetOpen(true)}
      className="text-[#40b3b3] border-[#40b3b3] hover:bg-[#40b3b3] hover:text-white flex items-center"
    >
      <Split className="h-4 w-4 mr-1" />
      All
    </Button>
  </div>
</div>
                {renderGradesContent()}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Progress Section */}
        {isSectionVisible('progress') && studentData?.courses[courseId]?.jsonGradebookSchedule && !ltiLinksComplete && (
          <div className={`flex flex-col flex-1 overflow-hidden ${!isMobile && Array.isArray(visibleSections) && visibleSections.length === 1 ? 'w-full' : 'sm:w-1/3'}`}>
            <Card className="flex-1 flex flex-col min-h-0 bg-white shadow-md overflow-auto">
              <CardContent className="p-4 flex flex-col flex-1 min-h-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-[#1fa6a7]">Progress</h4>
                 
                </div>
                {renderProgressContent()}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Schedule Section - Only shown for non-ltiLinksComplete courses */}
        {isSectionVisible('schedule') && !studentData?.courses[courseId]?.jsonGradebookSchedule && !ltiLinksComplete && (
          <div className={`flex flex-col flex-1 overflow-hidden ${!isMobile && Array.isArray(visibleSections) && visibleSections.length === 1 ? 'w-full' : 'sm:w-1/3'}`}>
            <Card className="flex-1 flex flex-col min-h-0 bg-white shadow-md overflow-auto">
              <CardContent className="p-4 flex flex-col flex-1 min-h-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-[#1fa6a7]">Schedule</h4>
                 
                </div>
                {renderScheduleContent()}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gradebook Section - Only shown for non-ltiLinksComplete courses */}
        {isSectionVisible('gradebook') && !studentData?.courses[courseId]?.jsonGradebookSchedule && !ltiLinksComplete && (
          <div className={`flex flex-col flex-1 overflow-hidden ${!isMobile && Array.isArray(visibleSections) && visibleSections.length === 1 ? 'w-full' : 'sm:w-1/3'}`}>
            <Card className="flex-1 flex flex-col min-h-0 bg-white shadow-md overflow-auto">
              <CardContent className="p-4 flex flex-col flex-1 min-h-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-[#1fa6a7]">Gradebook</h4>
                </div>
                {renderGradebookContent()}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edge Admin Section */}
        {currentMode === MODES.REGISTRATION && isSectionVisible('edge-admin') && (
          <div className={`flex flex-col flex-1 overflow-hidden ${!isMobile && Array.isArray(visibleSections) && visibleSections.length === 1 ? 'w-full' : 'sm:w-1/3'}`}>
            <Card className="flex-1 flex flex-col min-h-0 bg-white shadow-md overflow-auto">
              <CardContent className="p-4 flex flex-col flex-1 min-h-0">
                <h4 className="font-semibold mb-2 text-[#1fa6a7]">Edge Admin</h4>
                {renderEdgeAdminContent()}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Payment Info Section */}
        {currentMode === MODES.REGISTRATION && isSectionVisible('paid') && (
          <div className={`flex flex-col flex-1 overflow-hidden ${!isMobile && Array.isArray(visibleSections) && visibleSections.length === 1 ? 'w-full' : 'sm:w-1/3'}`}>
            <Card className="flex-1 flex flex-col min-h-0 bg-white shadow-md">
              <CardContent className="p-4 flex flex-col flex-1 min-h-0">
                <h4 className="font-semibold mb-2 text-[#1fa6a7]">Payment Information</h4>
                <PaymentInfo 
                  studentKey={sanitizeEmail(studentSummary.StudentEmail)}
                  courseId={courseId}
                  paymentStatus={studentData.courses[courseId].payment_status?.status}
                  paymentDetails={studentData.courses[courseId].paymentDetails}
                  readOnly={currentMode !== MODES.REGISTRATION}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* PASI Section */}
        {currentMode === MODES.REGISTRATION && isSectionVisible('pasi') && (
          <div className={`flex flex-col flex-1 overflow-hidden ${!isMobile && Array.isArray(visibleSections) && visibleSections.length === 1 ? 'w-full' : 'sm:w-1/3'}`}>
            <Card className="flex-1 flex flex-col min-h-0 bg-white shadow-md overflow-auto">
              <CardContent className="p-4 flex flex-col flex-1 min-h-0">
                <h4 className="font-semibold mb-2 text-[#1fa6a7]">PASI Management</h4>
                <PASIManager 
                  studentData={studentData} 
                  courseId={courseId} 
                  assignedStaff={assignedStaff} 
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* LMS Student ID Dialog - Unified single dialog for all sections */}
      <Dialog open={isLMSIdDialogOpen} onOpenChange={setIsLMSIdDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>LMS Student ID</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Auto-fetch section */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-3">
                Click below to automatically fetch the student's LMS ID using their email:
              </p>
              <Button
                onClick={handleFetchLMSId}
                disabled={isSubmitting}
                className="w-full bg-[#40b3b3] text-white hover:bg-[#379999] disabled:bg-gray-300"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">⟳</span>
                    Fetching...
                  </span>
                ) : (
                  'Fetch LMS ID from Edge'
                )}
              </Button>
              <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                <span>Using email:</span>
                <code className="px-2 py-1 bg-white rounded border">
                  {studentSummary.StudentEmail}
                </code>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">or enter manually</span>
              </div>
            </div>

            {/* Manual entry section */}
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newLMSId || ''}
                  onChange={(e) => setNewLMSId(e.target.value)}
                  placeholder="Enter LMS Student ID"
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#40b3b3] focus:border-transparent"
                  disabled={isSubmitting}
                />
                <Button
                  onClick={handleSubmitLMSId}
                  disabled={!newLMSId || isSubmitting}
                  className="bg-[#40b3b3] text-white hover:bg-[#379999] disabled:bg-gray-300"
                >
                  Save
                </Button>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <a 
                  href="https://edge.rtdacademy.com/util/utils.php?form=lookup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#40b3b3] hover:text-[#379999] flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Look up ID manually
                </a>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Additional Sheets and Dialogs */}
      <>
        {/* Student Details Sheet */}
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

 {/* Notes Expanded Sheet */}
 <Sheet open={isNotesSheetOpen} onOpenChange={setIsNotesSheetOpen}>
 <SheetContent 
  side="right" 
  className="w-full md:w-2/3 bg-white p-6 overflow-hidden flex flex-col"
>
  <div className="flex flex-col h-full">
    {/* Header */}
    <div className="mb-4 flex-shrink-0">
      <h2 className="text-xl font-bold text-[#1fa6a7]">
        Student Notes
      </h2>
    </div>
    
    {/* StudentNotes with flex-1 to take remaining space */}
    <div className="flex-1 overflow-hidden">
      <StudentNotes 
        studentEmail={sanitizeEmail(studentSummary.StudentEmail)}
        courseId={courseId}
        initialNotes={notes}
        onNotesUpdate={setNotes}
        readOnly={currentMode === MODES.REGISTRATION}
        isExpanded={true}
      />
    </div>
  </div>
</SheetContent>
</Sheet>

        {/* Comparison Sheet - Wide Sheet for Side by Side Comparison */}
        <Sheet open={isComparisonSheetOpen} onOpenChange={setIsComparisonSheetOpen}>
          <SheetContent side="right" className="w-[95%] max-w-5xl p-6 overflow-hidden">
            <div className="h-full flex flex-col">
              {renderComparisonSheetContent()}
            </div>
          </SheetContent>
        </Sheet>

        {/* Schedule Dialog */}
        <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
          <DialogContent className="max-w-6xl w-full h-[90vh] overflow-auto bg-gray-50">
            <DialogHeader>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                <DialogTitle className="flex items-center">
                  <Calendar className="h-6 w-6 mr-2" />
                  Schedule Maker
                </DialogTitle>
                <div className="text-sm text-gray-700 text-center sm:text-left">
                  <p><strong>Student:</strong> {(studentData?.profile.preferredFirstName || studentData?.profile.firstName || '') + ' ' + (studentData?.profile.lastName || '')}</p>
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