import React, { useState, useEffect } from 'react';
import {
  FaUser,
  FaExternalLinkAlt,
  FaCalendarAlt,
  FaInfoCircle,
  FaGraduationCap,
  FaCalendarPlus,
  FaSearch,
  FaCheckCircle,
  FaClock,
  FaEnvelope,
  FaFileAlt,
  FaLock
} from 'react-icons/fa';
import { ChevronRight, AlertCircle, BarChart, Info, Lock } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { toEdmontonDate } from '../utils/timeZoneUtils';
import { Alert, AlertDescription } from "../components/ui/alert";
import CourseDetailsDialog from './CourseDetailsDialog';
import YourWayScheduleCreator from '../Schedule/YourWayScheduleCreator';
import YourWayProgress from '../Schedule/YourWayProgress';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDatabase, ref, onValue } from 'firebase/database';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import SchedulePurchaseDialog from './SchedulePurchaseDialog';
import CreateScheduleButton from './CreateScheduleButton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '../components/ui/sheet';
import ProofOfEnrollmentDialog from './ProofOfEnrollmentDialog';
import FormDialog from '../Registration/FormDialog';
import { RefreshCw } from 'lucide-react';
import { isCourseUnlocked, getCoursePaymentStatus } from '../utils/coursePaymentUtils';


const getStatusColor = (status, isRequired = false) => {
  // Special styling for required courses
  if (isRequired) {
    return 'bg-purple-100 text-purple-800 border border-purple-300';
  }

  switch (status) {
    case 'Active':
      return 'bg-customGreen-medium text-customGreen-light border-customGreen-dark';
    case 'Archived':
      return 'bg-slate-100 text-slate-700 border border-slate-200';
    case 'Registration':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    default:
      return 'bg-gray-100 text-gray-700 border border-gray-200';
  }
};

const getBorderColor = (status, isRequired = false) => {
  // Special border color for required courses
  if (isRequired) {
    return '#9333ea'; // Purple color for required courses
  }

  switch (status) {
    case 'Active':
      return '#20B2AA';
    case 'Registration':
      return '#fbbf24';
    default:
      return '#94a3b8';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'Not set';
  const edmontonDate = toEdmontonDate(dateString);
  if (!edmontonDate) return 'Not set';
  return edmontonDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const CourseCard = ({ 
  course, 
  onGoToCourse, // Keep for backward compatibility
  onGoToFirebaseCourse, // New handler for Firebase courses
  onGoToLMSCourse, // New handler for LMS courses
  onCourseRefresh, // Handler for refreshing course data after transition
  className = '',
  profile,
  importantDates 
}) => {
  const { currentUser, isEmulating } = useAuth();
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showCreateScheduleDialog, setShowCreateScheduleDialog] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  
  // New states for schedule management
  const [showScheduleConfirmDialog, setShowScheduleConfirmDialog] = useState(false);
  const [showInstructorContactAlert, setShowInstructorContactAlert] = useState(false);
  
  // Cache course details to prevent button disappearing
  const [cachedCourseDetails, setCachedCourseDetails] = useState(null);
  
  // Update cached course details when they become available or change
  useEffect(() => {
    if (course.courseDetails) {
      setCachedCourseDetails(course.courseDetails);
    }
  }, [course.courseDetails]);
  
  // Use cached details if current ones are unavailable
  const effectiveCourseDetails = course.courseDetails || cachedCourseDetails;

  // Determine if a schedule exists by checking if ScheduleJSON is present
  const hasSchedule = !!course.ScheduleJSON;

  const courseName = course.Course?.Value || 'Course Name';
  const courseId = course.CourseID || 'N/A';
  const status = course.ActiveFutureArchived?.Value || 'Unknown';
  const studentType = course.StudentType?.Value || 'Not specified';
  const schoolYear = course.School_x0020_Year?.Value || 'N/A';
  const isOnTranscript = course.PASI?.Value === 'Yes';
  
  // Debug log for status changes
  useEffect(() => {
    console.log(`📊 Course ${courseId} status updated:`, status);
  }, [status, courseId]);
  
  // Check if course is unlocked based on payment status
  const paymentStatus = getCoursePaymentStatus(course, profile);
  const isUnlocked = paymentStatus.isUnlocked;
  
  // Extract trial information for display
  const { isInTrial, trialDaysRemaining, trialExpired } = paymentStatus;

  const [showEnrollmentProof, setShowEnrollmentProof] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [lastEmailSent, setLastEmailSent] = useState(null);
  const [showTransitionDialog, setShowTransitionDialog] = useState(false);

  // Monitor course.transition for changes
  useEffect(() => {
    // If transition was true and now it's false/null, the transition is complete
    if (course.transition === false || (course.transition === null && showTransitionDialog)) {
      // Close the dialog if it's open
      if (showTransitionDialog) {
        setShowTransitionDialog(false);
        toast.success('Re-registration complete! You can now access your course.', {
          duration: 5000
        });
        // Trigger course refresh if callback is available
        if (onCourseRefresh) {
          onCourseRefresh(course.CourseID || course.id);
        }
      }
    }
  }, [course.transition, showTransitionDialog, onCourseRefresh, course.CourseID, course.id]);

  // Optional: Set up Firebase listener for real-time updates
  useEffect(() => {
    if (!currentUser?.email || !course.CourseID) return;
    
    const db = getDatabase();
    const sanitizedEmail = sanitizeEmail(currentUser.email);
    const transitionRef = ref(db, `students/${sanitizedEmail}/courses/${course.CourseID}/transition`);
    
    const unsubscribe = onValue(transitionRef, (snapshot) => {
      const transitionValue = snapshot.val();
      // If transition is false or null, trigger update
      if (transitionValue === false || transitionValue === null) {
        if (showTransitionDialog) {
          setShowTransitionDialog(false);
          toast.success('Re-registration complete! You can now access your course.', {
            duration: 5000
          });
          if (onCourseRefresh) {
            onCourseRefresh(course.CourseID);
          }
        }
      }
    });
    
    return () => unsubscribe();
  }, [currentUser?.email, course.CourseID, showTransitionDialog, onCourseRefresh]);

  // Check if current user is a developer for this course
  const isDeveloper = (() => {
    const userEmail = currentUser?.email;
    const allowedEmails = effectiveCourseDetails?.allowedEmails || [];
    return userEmail && allowedEmails.includes(userEmail);
  })();

  // Check if course details are still loading (prevents race condition on dashboard re-entry)
  // Now only true if we have never loaded course details (no cached version either)
  const courseDetailsLoading = !effectiveCourseDetails && course.id;



  // Calculate grace period status - works even before schedule is created
  const calculateGracePeriod = () => {
    // Use course start date as the reference for grace period (available from registration)
    const courseStartDate = course.ScheduleStartDate ? new Date(course.ScheduleStartDate) : null;
    
    if (!courseStartDate) return { isInGracePeriod: false, daysRemaining: 0, gracePeriodEndDate: null, noScheduleYet: !hasSchedule };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison
    
    const courseStartDateStart = new Date(courseStartDate);
    courseStartDateStart.setHours(0, 0, 0, 0); // Reset to start of day
    
    const gracePeriodEnd = new Date(courseStartDateStart);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 14); // 2 weeks grace period from course start
    gracePeriodEnd.setHours(23, 59, 59, 999); // End of day
    
    const daysRemaining = Math.ceil((gracePeriodEnd - today) / (1000 * 60 * 60 * 24));
    const isInGracePeriod = today <= gracePeriodEnd;
    
    return {
      isInGracePeriod,
      daysRemaining: Math.max(0, daysRemaining),
      gracePeriodEndDate: gracePeriodEnd,
      hasStarted: hasSchedule,
      noScheduleYet: !hasSchedule
    };
  };
  
  const gracePeriodInfo = calculateGracePeriod();
  
  const handleScheduleCreation = () => {
    // Always allow creation if no schedule exists
    if (!hasSchedule) {
      setShowCreateScheduleDialog(true);
    } else if (gracePeriodInfo.isInGracePeriod) {
      setShowCreateScheduleDialog(true);
    } else {
      // Grace period has expired
      setShowInstructorContactAlert(true);
    }
  };
  // Handle transition re-registration
  const handleTransitionRegistration = () => {
    setShowTransitionDialog(true);
  };

  // Simplified handleGoToCourse using centralized payment check
  const handleGoToCourse = async () => {
    // Check if course requires transition re-registration
    if (course.transition === true) {
      toast.error("You must complete re-registration for the next school year before accessing this course");
      return;
    }

    // Check if course is locked due to payment
    if (!isUnlocked && !isDeveloper) {
      if (trialExpired) {
        toast.error("Your free trial has expired. Please complete payment using the credit summary in the header to continue accessing this course.");
      } else {
        toast.error("This course requires payment. Please complete payment using the credit summary in the header.");
      }
      return;
    }

    // Check for course access restriction
    if (effectiveCourseDetails?.restrictCourseAccess === true && !isDeveloper) {
      toast.error("Access to this course is currently restricted");
      return;
    }

    // Check if course is archived or pending
    if (status === 'Archived' || status === 'Pending') {
      toast.error("This course is not currently available for access");
      return;
    }

    // For regular courses, check for schedule (unless doesNotRequireSchedule is true)
    const isFirebaseCourse = effectiveCourseDetails?.firebaseCourse || course.firebaseCourse;
    if (!isFirebaseCourse && !hasSchedule && !effectiveCourseDetails?.doesNotRequireSchedule) {
      toast.error("Please create a schedule before accessing the course");
      return;
    }

    // Check if course is active
    if (status !== 'Active' && !course.isRequiredCourse) {
      toast.error("You cannot access the course until it has been activated");
      return;
    }
    
    // Validate gradebook structure for Firebase courses before allowing access
    if (isFirebaseCourse) {
      try {
        const { getFunctions, httpsCallable } = await import('firebase/functions');
        const functions = getFunctions();
        const validateGradebook = httpsCallable(functions, 'validateGradebookStructure');
        
        const result = await validateGradebook({
          courseId: course.id,
          studentEmail: currentUser?.email
        });
        
        if (!result.data.isValid) {
          console.log('Gradebook structure validation completed with fixes:', result.data);
          toast.success("Course gradebook has been updated. You can now access the course.");
        }
      } catch (error) {
        console.error('Error validating gradebook structure:', error);
        // Don't block access if validation fails, just log the error
      }
    }

    // Use appropriate handler based on course type
    if (isFirebaseCourse) {
      if (onGoToFirebaseCourse) {
        onGoToFirebaseCourse(course);
      } else if (onGoToCourse) {
        onGoToCourse(course); // Fallback for backward compatibility
      }
    } else {
      if (onGoToLMSCourse) {
        onGoToLMSCourse(course);
      } else if (onGoToCourse) {
        onGoToCourse(course); // Fallback for backward compatibility
      }
    }
  };

  // Handle resending parent invitation email
  const handleResendParentEmail = async () => {
    if (isResendingEmail) return;

    setIsResendingEmail(true);
    
    try {
      const functions = getFunctions();
      const resendParentInvitation = httpsCallable(functions, 'resendParentInvitation');
      
      const result = await resendParentInvitation({
        courseId: course.CourseID || course.id
      });

      if (result.data.success) {
        setLastEmailSent(new Date());
        toast.success(`Parent invitation email sent to ${result.data.parentEmail}`);
      } else {
        // Handle error returned from function
        toast.error(result.data.error || 'Failed to send parent invitation');
      }
    } catch (error) {
      console.error('Error resending parent email:', error);
      toast.error(error.message || 'Failed to send parent invitation. Please try again.');
    } finally {
      setIsResendingEmail(false);
    }
  };

  // Check if resend button should be disabled due to rate limiting
  const isResendDisabled = () => {
    if (isResendingEmail) return true;
    if (!lastEmailSent) return false;
    
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return lastEmailSent > oneDayAgo;
  };

  // Get time remaining before next resend is allowed
  const getResendTimeRemaining = () => {
    if (!lastEmailSent) return null;
    
    const oneDayFromSent = new Date(lastEmailSent.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    const remaining = oneDayFromSent - now;
    
    if (remaining <= 0) return null;
    
    const hours = Math.ceil(remaining / (1000 * 60 * 60));
    return hours;
  };


  // Function to render trial status info (only shows during active trial)
  const renderTrialStatus = () => {
    // Only show for adult and international students
    if (studentType !== 'Adult Student' && studentType !== 'International Student') {
      return null;
    }

    // Only show if currently in trial
    if (!isInTrial) {
      return null;
    }

    const isEndingSoon = trialDaysRemaining <= 3;
    
    return (
      <Alert className={`mb-4 ${isEndingSoon ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
        <div className="flex items-center gap-2">
          {isEndingSoon ? (
            <AlertCircle className="h-4 w-4 text-amber-500" />
          ) : (
            <FaInfoCircle className="h-4 w-4 text-blue-500" />
          )}
          <div className="flex-1">
            <AlertDescription className={isEndingSoon ? 'text-amber-700' : 'text-blue-700'}>
              <p className="font-medium mb-1">
                {isEndingSoon ? '⚠️ Trial Ending Soon' : '🎉 Free Trial Active'}
              </p>
              <p className="text-sm">
                {isEndingSoon 
                  ? `Your trial ends in ${trialDaysRemaining} day${trialDaysRemaining !== 1 ? 's' : ''}. Payment will be required to continue access.`
                  : `You have ${trialDaysRemaining} day${trialDaysRemaining !== 1 ? 's' : ''} remaining in your free trial.`
                }
              </p>
              {isEndingSoon && (
                <p className="text-xs mt-1 text-amber-600">
                  Please complete payment using the <strong>Credit & Payment Summary</strong> in the header to avoid interruption.
                </p>
              )}
            </AlertDescription>
          </div>
        </div>
      </Alert>
    );
  };

  // Function to render subtle grace period info
  const renderGracePeriodInfo = () => {
    if (!gracePeriodInfo) {
      return null;
    }

    const { isInGracePeriod, daysRemaining, gracePeriodEndDate, noScheduleYet } = gracePeriodInfo;
    
    // Show message even before schedule is created
    if (noScheduleYet && course.ScheduleStartDate) {
      if (isInGracePeriod) {
        const isEndingSoon = daysRemaining <= 3;
        return (
          <div className={`text-xs ${isEndingSoon ? 'text-amber-600' : 'text-gray-500'} text-center mt-2`}>
            {isEndingSoon && '⚠️ '}
            You'll be able to modify your schedule for {daysRemaining} more day{daysRemaining !== 1 ? 's' : ''} after creation
          </div>
        );
      } else {
        return (
          <div className="text-xs text-gray-500 text-center mt-2">
            Grace period has passed • Schedule changes will require instructor approval
          </div>
        );
      }
    }
    
    // Original messages for when schedule exists
    if (hasSchedule) {
      if (isInGracePeriod) {
        const isEndingSoon = daysRemaining <= 3;
        return (
          <div className={`text-xs ${isEndingSoon ? 'text-amber-600' : 'text-gray-500'} text-center mt-2`}>
            {isEndingSoon && '⚠️ '}
            You can modify your schedule for {daysRemaining} more day{daysRemaining !== 1 ? 's' : ''}
          </div>
        );
      } else {
        return (
          <div className="text-xs text-gray-500 text-center mt-2">
            Schedule locked • Contact instructor for changes
          </div>
        );
      }
    }
    
    return null;
  };

  // Updated renderScheduleButtons function
  const renderScheduleButtons = () => {
    // Don't render schedule buttons if course explicitly doesn't require a schedule
    // Only check this if effectiveCourseDetails exists
    if (effectiveCourseDetails && effectiveCourseDetails.doesNotRequireSchedule) {
      return null;
    }

    // Check if ANY course (Firebase or not) has the enhanced course structure
    // Look in multiple possible locations for the course structure
    const hasEnhancedCourseStructure = !!(
      effectiveCourseDetails?.["course-config"]?.courseStructure?.units ||  // Primary location (matches database)
      effectiveCourseDetails?.courseStructure?.units ||  // Direct location (legacy)
      course.Gradebook?.courseStructure?.units  // Student-specific location (legacy fallback)
    );
    
    if (hasEnhancedCourseStructure) {
      // Course with enhanced structure - allow schedule creation
      return (
          <>
            <div className="w-full">
              <CreateScheduleButton
                onClick={handleScheduleCreation}
                hasSchedule={hasSchedule}
                gracePeriodInfo={gracePeriodInfo}
                courseName={courseName}
                teacherEmail={effectiveCourseDetails?.teachers?.['rory@rtdacademy,com']?.email || 'your instructor'}
              />
              {renderGracePeriodInfo()}
            </div>

            <SchedulePurchaseDialog
              isOpen={showScheduleConfirmDialog}
              onOpenChange={setShowScheduleConfirmDialog}
              onProceedToCreation={() => {
                setShowScheduleConfirmDialog(false);
                setShowCreateScheduleDialog(true);
              }}
              hasSchedule={hasSchedule}
              gracePeriodInfo={gracePeriodInfo}
            />

            <Sheet
              open={showCreateScheduleDialog}
              onOpenChange={setShowCreateScheduleDialog}
              side="right"
            >
              <SheetContent className="w-full sm:max-w-[90%] h-full">
               
                <YourWayScheduleCreator
                  course={course}
                  onScheduleSaved={() => {
                    setShowCreateScheduleDialog(false);
                  }}
                />
              </SheetContent>
            </Sheet>

            {/* Progress button for Firebase courses with enhanced structure */}
            <Dialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
              <DialogTrigger asChild>
                <Button
                  className="w-full bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-700/90 hover:to-purple-700/90 text-white shadow-sm transition-all duration-200 flex items-center justify-center"
                >
                  <BarChart className="mr-2 h-4 w-4" />
                  Course Progress
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-7xl max-h-[90vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle>Course Progress</DialogTitle>
                </DialogHeader>
                {hasSchedule && (
                  <YourWayProgress
                    course={course}
                    schedule={course.ScheduleJSON}
                  />
                )}
                {!hasSchedule && (
                  <div className="p-6">
                    <h3 className="text-lg font-medium mb-4">Create a schedule first</h3>
                    <p className="text-gray-600">Please create your course schedule to view detailed progress tracking.</p>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </>
        );
    }

    // Check if this is a regular course with units
    if (effectiveCourseDetails?.units) {
      // Standard schedule buttons for regular courses
      return (
      <>
        <div className="w-full">
          <CreateScheduleButton
            onClick={handleScheduleCreation}
            hasSchedule={hasSchedule}
            gracePeriodInfo={gracePeriodInfo}
            courseName={courseName}
            teacherEmail={effectiveCourseDetails?.teachers?.['rory@rtdacademy,com']?.email || 'your instructor'}
          />
          {renderGracePeriodInfo()}
        </div>

        <SchedulePurchaseDialog
          isOpen={showScheduleConfirmDialog}
          onOpenChange={setShowScheduleConfirmDialog}
          onProceedToCreation={() => {
            setShowScheduleConfirmDialog(false);
            setShowCreateScheduleDialog(true);
          }}
          hasSchedule={hasSchedule}
          gracePeriodInfo={gracePeriodInfo}
        />

        <Sheet
          open={showCreateScheduleDialog}
          onOpenChange={setShowCreateScheduleDialog}
          side="right"
        >
          <SheetContent className="w-full sm:max-w-[90%] h-full">
            <SheetHeader>
              <SheetTitle>Create Your Course Schedule</SheetTitle>
            </SheetHeader>
            <YourWayScheduleCreator
              course={course}
              onScheduleSaved={() => {
                setShowCreateScheduleDialog(false);
              }}
            />
          </SheetContent>
        </Sheet>

        {hasSchedule && (
          <Dialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
            <DialogTrigger asChild>
              <Button
                className="w-full bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-700/90 hover:to-purple-700/90 text-white shadow-sm transition-all duration-200 flex items-center justify-center"
              >
                <BarChart className="mr-2 h-4 w-4" />
                Course Progress
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Course Progress</DialogTitle>
              </DialogHeader>
              <YourWayProgress
                course={course}
                schedule={course.ScheduleJSON}
              />
            </DialogContent>
          </Dialog>
        )}
      </>
    );
    }

    // Fallback for courses without schedule capability
    return null;
  };

  // Render transition required message
  const renderTransitionMessage = () => {
    if (!course.transition) return null;

    return (
      <Alert className="mb-4 bg-orange-50 border-orange-200">
        <RefreshCw className="h-4 w-4 text-orange-500" />
        <AlertDescription className="text-orange-700">
          <p className="font-medium mb-2">Re-registration Required</p>
          <div className="space-y-2">
            <p className="text-sm">
              This course requires re-registration for the next school year. 
              You must complete the re-registration process to continue accessing this course.
            </p>
            <p className="text-xs text-orange-600">
              Your previous enrollment data will be preserved, but you need to confirm your student type and information for the upcoming year.
            </p>
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  // Render schedule required message
  const renderScheduleRequiredMessage = () => {
    // Check if this course needs a schedule but doesn't have one
    const needsSchedule = !hasSchedule && 
      !effectiveCourseDetails?.doesNotRequireSchedule &&
      !(effectiveCourseDetails?.firebaseCourse || course.firebaseCourse) &&
      status === 'Active'; // Only show for active courses
    
    if (!needsSchedule) return null;
    
    return (
      <Alert className="mb-4 bg-blue-50 border-blue-200">
        <FaCalendarPlus className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-700">
          <p className="font-medium mb-2">Schedule Required</p>
          <div className="space-y-2">
            <p className="text-sm">
              You need to create a schedule for this course before you can access the course materials.
            </p>
            <p className="text-xs text-blue-600">
              👉 Please use the <strong>"Create/Edit Schedule"</strong> button below to set up your learning schedule.
            </p>
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  const renderRegistrationMessage = () => {
    if (status !== 'Registration') return null;

    // Show restriction message if course access is restricted (unless user is developer)
    // Also show loading state if course details aren't loaded yet
    if (courseDetailsLoading) {
      return (
        <Alert className="mb-4 bg-gray-50 border-gray-200">
          <AlertCircle className="h-4 w-4 text-gray-500" />
          <AlertDescription className="text-gray-700">
            <p className="font-medium mb-1">Loading Course Details</p>
            <p className="text-sm">
              Please wait while we load the latest course information...
            </p>
          </AlertDescription>
        </Alert>
      );
    }
    
    if (effectiveCourseDetails?.restrictCourseAccess === true && !isDeveloper) {
      return (
        <Alert className="mb-4 bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-700">
            <p className="font-medium mb-1">Course Access Restricted</p>
            <p className="text-sm">
              This course needs to be activated by your instructor before you can access it.
            </p>
          </AlertDescription>
        </Alert>
      );
    }
  
    // Different messaging for Firebase courses
    if (effectiveCourseDetails?.firebaseCourse) {
      return (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <FaCheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">
            <p className="font-medium mb-2">Course Ready to Start!</p>
            <div className="space-y-2">
              <p className="text-sm">
                This online course is ready for immediate access. You can start learning right away using the "Go to Course" button below.
              </p>
              <p className="text-xs text-green-600">
                You can start learning immediately while our registrar completes the enrollment setup in the background.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      );
    }
  
    // Original messaging for regular courses
    return (
      <Alert className="mb-4 bg-blue-50 border-blue-200">
        <FaEnvelope className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-700">
          <p className="font-medium mb-2">Registration Steps:</p>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <div className="mt-1 flex-shrink-0">
                {hasSchedule ? (
                  <FaCheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="h-4 w-4 border-2 border-blue-300 rounded-full" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">Create Your Schedule</p>
                {!hasSchedule && (
                  <p className="text-xs text-blue-600 mt-1">
                    Please create your schedule using the button below
                  </p>
                )}
              </div>
            </div>
  
            <div className="flex items-start gap-2">
              <div className="mt-1 flex-shrink-0">
                <div className="h-4 w-4 border-2 border-blue-300 rounded-full flex items-center justify-center">
                  <div className="h-2 w-2 bg-blue-300 rounded-full animate-pulse" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Registration Processing</p>
                <p className="text-xs text-blue-600 mt-1">
                  Your registration is being processed by our registrar (up to 2 business days). 
                  You'll receive an email when complete, and the "Go to Course" button will become active.
                </p>
              </div>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  // Function to render parent approval status for under-18 students
  const renderParentApprovalStatus = () => {
    // Check if student is under 18 from profile
    const isUnder18 = profile && profile.age && profile.age < 18;
    
    // Check for parent approval status from the course data
    const courseParentApproval = course.parentApproval;
    
    // Check for parent approval status from the profile data
    const profileParentApproval = profile.parentApprovalStatus;
    
    // Determine the approval status and message
    let approvalStatus = null;
    let statusMessage = null;
    let statusColor = null;
    let statusIcon = null;
    
    // First check course-specific approval
    if (courseParentApproval) {
      if (courseParentApproval.approved) {
        approvalStatus = 'approved';
        statusMessage = `Parent permission granted for this course by ${courseParentApproval.approvedBy}`;
        statusColor = 'green';
        statusIcon = FaCheckCircle;
      } else if (courseParentApproval.required) {
        approvalStatus = 'pending';
        statusMessage = 'Parent permission required for this course.';
        statusColor = 'amber';
        statusIcon = FaClock;
      }
    }
    // Then check profile-level approval status
    else if (profileParentApproval) {
      if (profileParentApproval.status === 'approved') {
        approvalStatus = 'approved';
        statusMessage = `Parent account linked and approved by ${profileParentApproval.linkedParentEmail || profileParentApproval.approvedBy}`;
        statusColor = 'green';
        statusIcon = FaCheckCircle;
      } else if (profileParentApproval.required && profileParentApproval.status === 'pending') {
        approvalStatus = 'pending';
        statusMessage = 'Parent permission pending.';
        statusColor = 'amber';
        statusIcon = FaClock;
      }
    }
    
    // If no approval info found but student is under 18, show a general message
    if (!approvalStatus && isUnder18) {
      approvalStatus = 'pending';
      statusMessage = 'Parent permission may be required. Please ensure your parent/guardian information is up to date.';
      statusColor = 'blue';
      statusIcon = AlertCircle;
    }
    
    // Check if parent email exists in profile
    const hasParentEmail = profile?.ParentEmail || course.parentApproval?.parentEmail;
    
    // Determine button disabled state and tooltip message
    let isButtonDisabled = false;
    let disabledReason = '';
    
    if (!isUnder18) {
      isButtonDisabled = true;
      disabledReason = 'Parent permission not required for students 18 and older';
    } else if (!hasParentEmail) {
      isButtonDisabled = true;
      disabledReason = 'No parent email address on file';
    } else if (approvalStatus === 'approved') {
      isButtonDisabled = true;
      disabledReason = 'Parent permission already granted';
    } else if (isResendDisabled()) {
      isButtonDisabled = true;
      disabledReason = getResendTimeRemaining() 
        ? `Email recently sent. Can resend in ${getResendTimeRemaining()} hours`
        : 'Processing...';
    }
    
    // Always show parent permission section
    const Icon = statusIcon || AlertCircle;
    const colors = {
      green: 'bg-green-50 border-green-200 text-green-700',
      amber: 'bg-amber-50 border-amber-200 text-amber-700',
      blue: 'bg-blue-50 border-blue-200 text-blue-700',
      gray: 'bg-gray-50 border-gray-200 text-gray-700'
    };
    
    const iconColors = {
      green: 'text-green-500',
      amber: 'text-amber-500',
      blue: 'text-blue-500',
      gray: 'text-gray-400'
    };
    
    // Default color for no status
    const displayColor = statusColor || 'gray';
    const displayMessage = statusMessage || (isUnder18 
      ? 'Parent permission status not yet determined' 
      : 'Parent permission not required (student is 18 or older)');
    
    return (
      <Alert className={`mb-4 ${colors[displayColor]}`}>
        <Icon className={`h-4 w-4 ${iconColors[displayColor]}`} />
        <AlertDescription>
          <p className="font-medium mb-1">Parent Permission</p>
          <p className="text-sm mb-2">{displayMessage}</p>
          
          {/* Always show resend button */}
          <div className="flex items-center gap-2 mt-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0} className="inline-flex">
                    <Button
                      onClick={isButtonDisabled ? undefined : handleResendParentEmail}
                      disabled={isButtonDisabled}
                      size="sm"
                      variant="outline"
                      className={`text-xs ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isResendingEmail ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <FaEnvelope className="mr-2 h-3 w-3" />
                          Send Email to Parent
                        </>
                      )}
                    </Button>
                  </span>
                </TooltipTrigger>
                {isButtonDisabled && (
                  <TooltipContent>
                    <p className="text-sm">{disabledReason}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            
            {profile?.ParentEmail && (
              <span className="text-xs text-gray-500">
                ({profile.ParentEmail})
              </span>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  // Function to log course details to console with emoji
  const logCourseDetails = () => {
    console.log(`🎓 Course Details for "${courseName}" (ID: ${courseId}):`, {
      ...course,
      isRequired: course.isRequiredCourse,
      status,
      hasSchedule,
      paymentStatus,
      isUnlocked
    });
  };

  return (
    <>
      <div
        className={`transform transition-all duration-300 hover:scale-[1.003] ${className} cursor-pointer ${
          !isUnlocked && !isDeveloper ? 'opacity-95' : ''
        }`}
        onClick={logCourseDetails}
      >
        <CourseDetailsDialog
          isOpen={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
          course={course}
        />

        <Card className={`overflow-hidden border-l-4 ${
          !isUnlocked && !isDeveloper ? 'bg-gray-50/50' : ''
        }`} style={{ 
          borderLeftColor: !isUnlocked && !isDeveloper 
            ? '#fb923c' // Orange for locked courses
            : getBorderColor(status, course.isRequiredCourse) 
        }}>
          <CardHeader className={`p-4 ${
            !isUnlocked && !isDeveloper 
              ? 'bg-gradient-to-br from-orange-50 to-white' 
              : 'bg-gradient-to-br from-slate-50 to-white'
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-5 w-5 text-gray-800" />
                  <h4 className="text-lg font-semibold">{courseName}</h4>
                  <span className="text-sm text-gray-500">#{courseId}</span>
                
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <Button 
                  variant="outline"
                  onClick={() => setShowDetailsDialog(true)} 
                  className="border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                  size="sm"
                >
                  <FaSearch className="mr-2 h-4 w-4" /> Details
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEnrollmentProof(true)}
                  className="border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                  size="sm"
                >
                  <FaFileAlt className="mr-2 h-4 w-4" /> Enrollment
                </Button>
                {!isUnlocked && !isDeveloper ? (
                  isInTrial ? (
                    <Badge variant="outline" className={trialDaysRemaining <= 3 
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-blue-100 text-blue-800 border border-blue-300"}>
                      <FaClock className="h-3 w-3 mr-1" />
                      Trial: {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-orange-100 text-orange-800 border border-orange-300">
                      <Lock className="h-3 w-3 mr-1" />
                      Locked
                    </Badge>
                  )
                ) : (
                  <Badge variant="outline" className={getStatusColor(status, course.isRequiredCourse)}>
                    {course.isRequiredCourse ? "Required" : status}
                  </Badge>
                )}
                {isDeveloper && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border border-blue-300">
                    Developer
                  </Badge>
                )}
                {status === 'Registration' && !course.payment?.hasValidPayment && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <FaInfoCircle className="text-amber-500 h-5 w-5" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Complete your registration by making a payment below.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-4">
            {/* Required course message */}
            {course.isRequiredCourse && (
              <Alert className="mb-4 bg-purple-50 border-purple-200">
                <AlertCircle className="h-4 w-4 text-purple-500" />
                <AlertDescription className="text-purple-700">
                  <p className="font-medium mb-1">Required Course</p>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-purple-700 mt-0 mb-0">
                      This is a required course that all students must complete. It has been automatically added to your dashboard.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Course description if it exists */}
            {effectiveCourseDetails?.description && (
              <Alert className="mb-4 bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-blue-700">
                  <p className="font-medium mb-1">Course Description</p>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-blue-700 mt-0 mb-0">
                      {effectiveCourseDetails.description}
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Course resources if they exist */}
            {effectiveCourseDetails?.resources && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <FaFileAlt className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700">
                  <p className="font-medium mb-2">Course Resources</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>
                      <a href={effectiveCourseDetails.resources.courseOutline} 
                         className="text-green-600 hover:text-green-800 underline">
                        Course Outline
                      </a>
                    </li>
                    <li>
                      <a href={effectiveCourseDetails.resources.dataBooklet} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="text-green-600 hover:text-green-800 underline">
                        Data Booklet
                      </a>
                    </li>
                    <li>
                      <a href={effectiveCourseDetails.resources.textbook} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="text-green-600 hover:text-green-800 underline">
                        Textbook
                      </a>
                    </li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Consolidated Payment Required Message - Shows for both expired trial and regular payment required */}
            {!isUnlocked && !isDeveloper && !isInTrial && (
              <Alert className="mb-4 bg-orange-50 border-orange-200">
                <Lock className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-700">
                  <p className="font-medium mb-1">Payment Required</p>
                  <div className="prose prose-sm prose-orange max-w-none">
                    <p className="text-orange-700 mt-0 mb-2">
                      {paymentStatus.paymentType === 'credit' 
                        ? `This course requires ${paymentStatus.creditsRequired || 'credit'} payment to unlock.`
                        : trialExpired 
                          ? 'Your 10-day free trial has ended. Payment is now required to access this course.'
                          : 'This course requires payment to access.'}
                    </p>
                    <p className="text-sm text-orange-600">
                      Please use the <strong>Credit & Payment Summary</strong> in the header to complete payment.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {renderTransitionMessage()}
            {/* Only show trial status if currently in trial */}
            {isInTrial && renderTrialStatus()}
            {renderScheduleRequiredMessage()}
            {renderRegistrationMessage()}
            {renderParentApprovalStatus()}
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <FaUser className="text-gray-500" />
                <span className="text-sm">Type: {studentType}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-gray-500" />
                <span className="text-sm">Year: {schoolYear}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-xs text-gray-600">
                  <span className="block text-gray-500">Start Date</span>
                  {formatDate(course.ScheduleStartDate)}
                </div>
                <div className="text-xs text-gray-600">
                  <span className="block text-gray-500">End Date</span>
                  {formatDate(course.ScheduleEndDate)}
                </div>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex items-start gap-2">
                  <FaGraduationCap className={`${isOnTranscript ? "text-emerald-500" : "text-gray-400"} mt-1`} />
                  <div>
                    <span className="text-sm font-medium block">
                      {isOnTranscript ? "Added to Alberta Education System" : "Transcript Status Pending"}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {isOnTranscript ? (
                        <>
                          This course has been registered with Alberta Education and can be viewed in your{' '}
                          <a 
                            href="https://public.education.alberta.ca/PASI/mypass/welcome"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-800 hover:underline"
                          >
                            MyPass <FaExternalLinkAlt className="inline h-2 w-2" />
                          </a>
                          {' '}transcript.
                        </>
                      ) : (
                        <>
                          Our registrar is in the process of adding this course to the Alberta Education system. 
                          Once complete, it will automatically appear in your{' '}
                          <a 
                            href="https://public.education.alberta.ca/PASI/mypass/welcome"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-800 hover:underline"
                          >
                            MyPass <FaExternalLinkAlt className="inline h-2 w-2" />
                          </a>
                          {' '}transcript. No action is required from you.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>


            <div className="space-y-4">
              <div className={`grid ${(effectiveCourseDetails?.units || effectiveCourseDetails?.["course-config"]?.courseStructure?.units || course.Gradebook?.courseStructure?.units) && !(effectiveCourseDetails && effectiveCourseDetails.doesNotRequireSchedule) ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
                {renderScheduleButtons()}

                {/* Show transition button if transition is required */}
                {course.transition === true ? (
                  <Button
                    onClick={handleTransitionRegistration}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg transition-all duration-200 inline-flex items-center justify-center gap-2 hover:shadow-xl hover:scale-[1.02] transform"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Complete Re-registration</span>
                  </Button>
                ) : !(effectiveCourseDetails?.restrictCourseAccess === true && !isDeveloper) && (
                  <Button
                    onClick={courseDetailsLoading ? undefined : handleGoToCourse}
                    className={`
                      w-full shadow-lg transition-all duration-200 inline-flex items-center justify-center gap-2
                      ${courseDetailsLoading
                        ? 'bg-gray-200 hover:bg-gray-200 text-gray-400 cursor-wait opacity-60'
                        : !isUnlocked && !isDeveloper
                          ? 'bg-gray-200 hover:bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                        : course.isRequiredCourse
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white hover:shadow-xl hover:scale-[1.02] transform'
                          : isDeveloper
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white hover:shadow-xl hover:scale-[1.02] transform'
                          : (effectiveCourseDetails?.firebaseCourse || course.firebaseCourse)
                              ? (status === 'Archived' || status === 'Pending')
                                ? 'bg-gray-200 hover:bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white hover:shadow-xl hover:scale-[1.02] transform'
                              : ((!hasSchedule && !effectiveCourseDetails?.doesNotRequireSchedule) || status !== 'Active')
                                ? 'bg-gray-200 hover:bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white hover:shadow-xl hover:scale-[1.02] transform'
                      }
                    `}
                    disabled={courseDetailsLoading || (!isUnlocked && !isDeveloper) || (!course.isRequiredCourse && !isDeveloper && (
                      (effectiveCourseDetails?.firebaseCourse || course.firebaseCourse)
                        ? (status === 'Archived' || status === 'Pending')
                        : ((!hasSchedule && !effectiveCourseDetails?.doesNotRequireSchedule) || status !== 'Active')
                    ))}
                  >
                    {!isUnlocked && !isDeveloper && !isInTrial ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <FaExternalLinkAlt className="h-4 w-4" />
                    )}
                    <span>
                      {courseDetailsLoading
                        ? 'Loading Course...'
                        : !isUnlocked && !isDeveloper
                          ? isInTrial
                            ? `Go to Course (Trial: ${trialDaysRemaining} day${trialDaysRemaining !== 1 ? 's' : ''})`
                            : 'Payment Required'
                        : course.isRequiredCourse
                          ? 'Go to Required Course'
                          : isDeveloper
                            ? 'Go to Course (Developer)'
                          : (effectiveCourseDetails?.firebaseCourse || course.firebaseCourse)
                              ? (status === 'Archived' || status === 'Pending')
                                ? 'Course Unavailable'
                                : 'Go to Course'
                              : ((!hasSchedule && !effectiveCourseDetails?.doesNotRequireSchedule) || status !== 'Active')
                                ? 'Course Unavailable'
                                : 'Go to Course'
                      }
                    </span>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ProofOfEnrollmentDialog
        isOpen={showEnrollmentProof}
        onOpenChange={setShowEnrollmentProof}
        course={course}
        studentProfile={profile}
        onPrint={() => {
          toast.success("Document ready for printing");
        }}
      />

      <Dialog open={showInstructorContactAlert} onOpenChange={setShowInstructorContactAlert}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Modification Period Ended</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Alert className="bg-gray-50 border-gray-200">
              <AlertCircle className="h-4 w-4 text-gray-500" />
              <AlertDescription className="text-gray-700">
                <p className="mb-2">
                  Your initial 2-week grace period for schedule changes has ended. 
                  Your current schedule is now set for the course.
                </p>
                <p>
                  If you have exceptional circumstances requiring a schedule adjustment, 
                  please contact your instructor at{' '}
                  <a 
                    href={`mailto:${effectiveCourseDetails?.teachers?.['rory@rtdacademy,com']?.email || 'info@rtdacademy.com'}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {effectiveCourseDetails?.teachers?.['rory@rtdacademy,com']?.email || 'info@rtdacademy.com'}
                  </a>
                </p>
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowInstructorContactAlert(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transition Re-registration Dialog */}
      <FormDialog
        open={showTransitionDialog}
        onOpenChange={setShowTransitionDialog}
        importantDates={importantDates}
        transitionCourse={{
          courseId: course.CourseID || course.id,
          courseName: courseName,
          currentStudentType: studentType,
          currentEnrollmentYear: schoolYear
        }}
        onTransitionComplete={(studentKey, courseId) => {
          console.log('Transition complete for:', { studentKey, courseId });
          // Trigger a refresh of the course data
          // Option 1: If you have a refresh function from parent
          if (onCourseRefresh) {
            onCourseRefresh(courseId);
          }
          // Option 2: Force a re-render by updating local state
          // This will cause the component to re-evaluate the transition flag
          setShowTransitionDialog(false);
          // You could also trigger a toast notification here
          toast.success('Re-registration complete! You can now access your course.', {
            duration: 5000
          });
        }}
      />
    </>
  );
};

export default CourseCard;