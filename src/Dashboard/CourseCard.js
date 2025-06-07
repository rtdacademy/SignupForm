import React, { useState } from 'react';
import {
  FaUser,
  FaExternalLinkAlt,
  FaCalendarAlt,
  FaInfoCircle,
  FaGraduationCap,
  FaCalendarPlus,
  FaSearch,
  FaCreditCard,
  FaCheckCircle,
  FaClock,
  FaEnvelope,
  FaFileAlt
} from 'react-icons/fa';
import { ChevronRight, AlertCircle, BarChart, Info } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { Alert, AlertDescription } from "../components/ui/alert";
import CourseDetailsDialog from './CourseDetailsDialog';
import YourWayScheduleCreator from '../Schedule/YourWayScheduleCreator';
import YourWayProgress from '../Schedule/YourWayProgress';
import PaymentOptionsDialog from './PaymentOptionsDialog';
import PaymentDetailsDialog from './PaymentDetailsDialog';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { getFunctions, httpsCallable } from 'firebase/functions';
import SchedulePurchaseDialog from './SchedulePurchaseDialog';
import CreateScheduleButton from './CreateScheduleButton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '../components/ui/sheet';
import ProofOfEnrollmentDialog from './ProofOfEnrollmentDialog';
// Firebase Course Router import
import CourseRouter from '../FirebaseCourses/CourseRouter';

// Keep the enforcement date constant
const PAYMENT_ENFORCEMENT_DATE = new Date('2024-11-22');

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
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const CourseCard = ({ 
  course, 
  onGoToCourse,
  className = '',
  profile 
}) => {
  const { currentUser, isEmulating } = useAuth();
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showCreateScheduleDialog, setShowCreateScheduleDialog] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  // New states for schedule management
  const [showScheduleConfirmDialog, setShowScheduleConfirmDialog] = useState(false);
  const [remainingSchedules, setRemainingSchedules] = useState(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);

  // Determine if a schedule exists by checking if ScheduleJSON is present
  const hasSchedule = !!course.ScheduleJSON;

  const courseName = course.Course?.Value || 'Course Name';
  const courseId = course.CourseID || 'N/A';
  const status = course.ActiveFutureArchived?.Value || 'Unknown';
  const studentType = course.StudentType?.Value || 'Not specified';
  const isAdultStudent = studentType.toLowerCase().includes('adult');
  const isInternationalStudent = studentType.toLowerCase().includes('international');
  const schoolYear = course.School_x0020_Year?.Value || 'N/A';
  const isOnTranscript = course.PASI?.Value === 'Yes';

  const [showEnrollmentProof, setShowEnrollmentProof] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [lastEmailSent, setLastEmailSent] = useState(null);

  // Check if current user is a developer for this course
  const isDeveloper = (() => {
    const userEmail = currentUser?.email;
    const allowedEmails = course.courseDetails?.allowedEmails || [];
    return userEmail && allowedEmails.includes(userEmail);
  })();

  // Update computedPaymentStatus to silently handle legacy courses
  const computedPaymentStatus = (() => {
    // Skip payment enforcement for courses created before Nov 22, 2024
    if (course.Created) {
      const createdDate = new Date(course.Created);
      if (createdDate < PAYMENT_ENFORCEMENT_DATE) {
        return 'paid'; // Treat legacy courses as paid
      }
    }
  
    // Use existing payment status if available
    if (course.payment_status && course.payment_status.status) {
      return course.payment_status.status;
    }
    
    // Check trial period for Adult/International students
    if ((isAdultStudent || isInternationalStudent) && course.Created) {
      const createdDate = new Date(course.Created);
      if (createdDate >= PAYMENT_ENFORCEMENT_DATE) {
        const today = new Date();
        const diffDays = Math.floor((today - createdDate) / (1000 * 3600 * 24));
        if (diffDays >= 9) {
          return 'unpaid';
        } else {
          // Still in trial period but we want to show the button
          return 'trial';  // New status that will show the payment button
        }
      }
    }
    
    // Default to 'unpaid' instead of null to ensure button is always shown
    // for Adult/International students after enforcement date
    return (isAdultStudent || isInternationalStudent) ? 'unpaid' : 'paid';
  })();

  // Render a trial period message if the student has not yet paid and is still within trial period.
  // This message now includes when payment is due.
  const renderTrialMessage = () => {
    const isEligible = isAdultStudent || isInternationalStudent;
    if (!isEligible) return null;
    if (course.payment?.hasValidPayment) return null;
    if (!course.Created) return null;

    const createdDate = new Date(course.Created);
    const trialEndDate = new Date(createdDate.getTime() + 9 * 24 * 3600 * 1000);
    const today = new Date();

    // Only show if trial period is still active
    if (today >= trialEndDate) return null;
  
    return (
      <Alert className="mb-4 bg-purple-50 border-purple-200">
        <AlertCircle className="h-4 w-4 text-purple-500" />
        <AlertDescription className="text-purple-700">
          <p className="font-medium mb-1">Trial Period Active</p>
          <div className="prose prose-sm prose-purple max-w-none">
            <p className="text-purple-700 mt-0 mb-0">
              You are currently in a trial period. Your payment is due on {trialEndDate.toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})}. Please ensure your payment is completed by that date to maintain access.
            </p>
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  const checkRemainingSchedules = () => {
    // Only assume a default of 2 if remainingSchedules is not defined.
    const remaining =
      course?.ScheduleJSON?.remainingSchedules === undefined ||
      course?.ScheduleJSON?.remainingSchedules === null
        ? 2
        : course.ScheduleJSON.remainingSchedules;
    setRemainingSchedules(remaining);
    setShowScheduleConfirmDialog(true);
  };
  
  // Simplify handleGoToCourse to just check schedule and status
  const handleGoToCourse = () => {
    // For required courses, we always allow access
    if (course.isRequiredCourse) {
      if (onGoToCourse) {
        onGoToCourse(course);
      }
      return;
    }

    // Allow developers to bypass all restrictions
    if (isDeveloper) {
      if (onGoToCourse) {
        onGoToCourse(course);
      }
      return;
    }

    // Handle Firebase Courses and regular courses differently
    if (course.courseDetails?.firebaseCourse) {
      // For Firebase courses, only restrict if Archived or Pending
      if (status === 'Archived' || status === 'Pending') {
        toast.error("This course is not currently available for access");
        return;
      }
      // Check payment status for Firebase courses
      if (computedPaymentStatus === 'unpaid') {
        toast.error("You cannot access the course until payment is completed");
        return;
      }
      if (onGoToCourse) {
        onGoToCourse(course);
      }
      return;
    }

    // For regular courses, check for schedule (unless doesNotRequireSchedule is true)
    if (!hasSchedule && !course.courseDetails?.doesNotRequireSchedule) {
      toast.error("Please create a schedule before accessing the course");
      return;
    }

    const createdDate = new Date(course.Created);
    // For courses before cutoff date, only check if course is Active
    if (createdDate < PAYMENT_ENFORCEMENT_DATE) {
      if (status !== 'Active') {
        toast.error("You cannot access the course until it has been activated");
        return;
      }
      if (onGoToCourse) {
        onGoToCourse(course);
      }
      return;
    }

    // For newer courses, check both active status and payment
    if (status !== 'Active' || computedPaymentStatus === 'unpaid') {
      toast.error("You cannot access the course until it has been activated and payment completed");
      return;
    }

    if (onGoToCourse) {
      onGoToCourse(course);
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

  // Update renderPaymentButton to hide payment UI for legacy courses
  const renderPaymentButton = () => {
    const isAdultOrInternational = isAdultStudent || isInternationalStudent;
    
    if (!isAdultOrInternational) return null;

    // Hide payment button for legacy courses
    if (course.Created) {
      const createdDate = new Date(course.Created);
      if (createdDate < PAYMENT_ENFORCEMENT_DATE) {
        return null;
      }
    }
  
   // In the renderPaymentButton function where you handle 'paid' or 'active' status:
if (computedPaymentStatus === 'paid' || computedPaymentStatus === 'active') {
  const buttonStyle = computedPaymentStatus === 'paid'
    ? 'bg-green-50 text-green-700 hover:bg-green-100'
    : 'bg-blue-50 text-blue-700 hover:bg-blue-100';

  return (
    <>
      <Button
        onClick={() => setShowPaymentDetails(true)}
        className={`w-full ${buttonStyle} transition-colors duration-200 flex items-center justify-center`}
      >
        {computedPaymentStatus === 'paid' ? (
          <>
            <FaCheckCircle className="mr-2" />
            Payment Complete
          </>
        ) : (
          <>
            <FaClock className="mr-2" />
            Monthly Payments Active
          </>
        )}
      </Button>

      <PaymentDetailsDialog
        isOpen={showPaymentDetails}
        onOpenChange={setShowPaymentDetails}
        paymentDetails={{
          courseName: courseName,
          type: computedPaymentStatus === 'active' ? 'subscription' : 'onetime',
          ...(course.payment?.details || {}), // Spread all available payment details
          // For subscription plans
          current_period_start: course.payment?.details?.current_period_start,
          current_period_end: course.payment?.details?.current_period_end,
          cancel_at: course.payment?.details?.cancel_at,
          latest_invoice: course.payment?.details?.latest_invoice,
          invoices: course.payment?.details?.invoices,
          // For one-time payments
          payment_date: course.payment?.details?.payment_date,
          amount_paid: course.payment?.details?.amount_paid,
          receipt_url: course.payment?.details?.receipt_url
        }}
      />
    </>
  );
}

    // For trial status, show a different button text
    if (computedPaymentStatus === 'trial') {
      return (
        <Button
          onClick={() => setShowPaymentDialog(true)}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-200 flex items-center justify-center"
        >
          <FaCreditCard className="mr-2" />
          Pay Now
        </Button>
      );
    }
  
    // Default for 'unpaid' status
    return (
      <Button
        onClick={() => setShowPaymentDialog(true)}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all duration-200 flex items-center justify-center"
      >
        <FaCreditCard className="mr-2" />
        Make Payment
      </Button>
    );
  };

  // Updated renderScheduleButtons function
  const renderScheduleButtons = () => {
    // Don't render schedule buttons if courseDetails.units doesn't exist
    if (!course.courseDetails?.units) {
      return null;
    }

    // Don't render schedule buttons if course doesn't require a schedule
    if (course.courseDetails?.doesNotRequireSchedule) {
      return null;
    }

    // Don't render schedule buttons for Firebase courses
    if (course.courseDetails?.firebaseCourse) {
      return (
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
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Course progress for Firebase courses</h3>
              <p className="text-gray-600">Progress tracking for this course is handled within the course itself.</p>
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    // Standard schedule buttons for regular courses
    return (
      <>
        <CreateScheduleButton
          onClick={checkRemainingSchedules}
          hasSchedule={hasSchedule}
          remainingSchedules={course?.ScheduleJSON?.remainingSchedules ?? 2}
        />

        <SchedulePurchaseDialog
          isOpen={showScheduleConfirmDialog}
          onOpenChange={setShowScheduleConfirmDialog}
          onProceedToCreation={() => {
            setShowScheduleConfirmDialog(false);
            setShowCreateScheduleDialog(true);
          }}
          hasSchedule={hasSchedule}
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
  };

  const renderRegistrationMessage = () => {
    if (status !== 'Registration') return null;
  
    // Different messaging for Firebase courses
    if (course.courseDetails?.firebaseCourse) {
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
    
    // If student is 18 or older, don't show parent approval status
    if (!isUnder18) return null;
    
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
    
    // Don't render anything if there's no status to show
    if (!approvalStatus) return null;
    
    const Icon = statusIcon;
    const colors = {
      green: 'bg-green-50 border-green-200 text-green-700',
      amber: 'bg-amber-50 border-amber-200 text-amber-700',
      blue: 'bg-blue-50 border-blue-200 text-blue-700'
    };
    
    const iconColors = {
      green: 'text-green-500',
      amber: 'text-amber-500',
      blue: 'text-blue-500'
    };
    
    return (
      <Alert className={`mb-4 ${colors[statusColor]}`}>
        <Icon className={`h-4 w-4 ${iconColors[statusColor]}`} />
        <AlertDescription>
          <p className="font-medium mb-1">Parent Permission Status</p>
          <p className="text-sm mb-2">{statusMessage}</p>
          
          {/* Show resend button only for pending status */}
          {approvalStatus === 'pending' && (
            <div className="flex items-center gap-2 mt-3">
              <Button
                onClick={handleResendParentEmail}
                disabled={isResendDisabled()}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                {isResendingEmail ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <FaEnvelope className="mr-2 h-3 w-3" />
                    {getResendTimeRemaining() ? `Resend Email (${getResendTimeRemaining()}h)` : 'Resend Email to Parent'}
                  </>
                )}
              </Button>
              
              {getResendTimeRemaining() && (
                <span className="text-xs text-gray-500">
                  Can resend in {getResendTimeRemaining()} hours
                </span>
              )}
            </div>
          )}
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
      paymentStatus: computedPaymentStatus
    });
  };

  return (
    <>
      <div
        className={`transform transition-all duration-300 hover:scale-[1.003] ${className} cursor-pointer`}
        onClick={logCourseDetails}
      >
        <CourseDetailsDialog
          isOpen={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
          course={course}
        />

        <Card className="overflow-hidden border-l-4" style={{ borderLeftColor: getBorderColor(status, course.isRequiredCourse) }}>
          <CardHeader className="bg-gradient-to-br from-slate-50 to-white p-4">
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
                <Badge variant="outline" className={getStatusColor(status, course.isRequiredCourse)}>
                  {course.isRequiredCourse ? "Required" : status}
                </Badge>
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
            {course.courseDetails?.description && (
              <Alert className="mb-4 bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-blue-700">
                  <p className="font-medium mb-1">Course Description</p>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-blue-700 mt-0 mb-0">
                      {course.courseDetails.description}
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {renderRegistrationMessage()}
            {renderTrialMessage()}
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

            {/* Alert to inform the student that payment is required once trial has expired */}
            {computedPaymentStatus === 'unpaid' && (
              <Alert className="mb-4 bg-red-50 border-red-200">
                <FaCreditCard className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-700">
                  Payment is required to access this course. Please complete your payment.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className={`grid ${course.courseDetails?.units && !course.courseDetails?.doesNotRequireSchedule ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
                {renderScheduleButtons()}

                <Button
                  onClick={handleGoToCourse}
                  className={`
                    w-full shadow-lg transition-all duration-200 inline-flex items-center justify-center gap-2
                    ${course.isRequiredCourse
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white hover:shadow-xl hover:scale-[1.02] transform'
                      : isDeveloper
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white hover:shadow-xl hover:scale-[1.02] transform'
                        : course.courseDetails?.firebaseCourse
                          ? ((status === 'Archived' || status === 'Pending') || computedPaymentStatus === 'unpaid')
                            ? 'bg-gray-200 hover:bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white hover:shadow-xl hover:scale-[1.02] transform'
                          : ((!hasSchedule && !course.courseDetails?.doesNotRequireSchedule) || status !== 'Active' || computedPaymentStatus === 'unpaid')
                            ? 'bg-gray-200 hover:bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white hover:shadow-xl hover:scale-[1.02] transform'
                    }
                  `}
                  disabled={!course.isRequiredCourse && !isDeveloper && (
                    course.courseDetails?.firebaseCourse 
                      ? ((status === 'Archived' || status === 'Pending') || computedPaymentStatus === 'unpaid')
                      : ((!hasSchedule && !course.courseDetails?.doesNotRequireSchedule) || status !== 'Active' || computedPaymentStatus === 'unpaid')
                  )}
                >
                  <FaExternalLinkAlt className="h-4 w-4" />
                  <span>
                    {course.isRequiredCourse
                      ? 'Go to Required Course'
                      : isDeveloper
                        ? 'Go to Course (Developer)'
                        : course.courseDetails?.firebaseCourse
                          ? ((status === 'Archived' || status === 'Pending') || computedPaymentStatus === 'unpaid')
                            ? 'Course Unavailable'
                            : 'Go to Course'
                          : ((!hasSchedule && !course.courseDetails?.doesNotRequireSchedule) || status !== 'Active' || computedPaymentStatus === 'unpaid')
                            ? 'Course Unavailable'
                            : 'Go to Course'
                    }
                  </span>
                </Button>

                {renderPaymentButton()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <PaymentOptionsDialog 
        isOpen={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        course={course}
        user={currentUser} 
      />

      <ProofOfEnrollmentDialog
        isOpen={showEnrollmentProof}
        onOpenChange={setShowEnrollmentProof}
        course={course}
        studentProfile={profile}
        onPrint={() => {
          toast.success("Document ready for printing");
        }}
      />
    </>
  );
};

export default CourseCard;