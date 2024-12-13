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
  FaEnvelope
} from 'react-icons/fa';
import { ChevronRight, AlertCircle, BarChart } from 'lucide-react';
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
import PaymentDetailsDialog from './PaymentDetailsDialog'; // Added import
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import SchedulePurchaseDialog from './SchedulePurchaseDialog';
import CreateScheduleButton from './CreateScheduleButton'; 

const getStatusColor = (status) => {
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

const getBorderColor = (status) => {
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
  className = ''
}) => {
  const { currentUser, isEmulating } = useAuth();
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showCreateScheduleDialog, setShowCreateScheduleDialog] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  // New states
  const [showScheduleConfirmDialog, setShowScheduleConfirmDialog] = useState(false);
  const [remainingSchedules, setRemainingSchedules] = useState(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false); // Added state

  // Get hasSchedule directly from course.ScheduleJSON
  const hasSchedule = !!course.ScheduleJSON;

  const courseName = course.Course?.Value || 'Course Name';
  const courseId = course.CourseID || 'N/A';
  const status = course.ActiveFutureArchived?.Value || 'Unknown';
  const studentType = course.StudentType?.Value || 'Not specified';
  const schoolYear = course.School_x0020_Year?.Value || 'N/A';
  const isOnTranscript = course.PASI?.Value === 'Yes';
  const isAdultStudent = studentType.toLowerCase().includes('adult');

  // New function to check remaining schedules
  const checkRemainingSchedules = () => {
    if (!course?.ScheduleJSON?.remainingSchedules) {
      // If remainingSchedules doesn't exist, set it to 2
      setRemainingSchedules(2);
    } else {
      setRemainingSchedules(course.ScheduleJSON.remainingSchedules);
    }
    setShowScheduleConfirmDialog(true);
  };

  const handleGoToCourse = () => {
    if (!hasSchedule) {
      toast.error("Please create a schedule before accessing the course");
      return;
    }
    if (status !== 'Active') {
      toast.error("You cannot access the course until it has been activated");
      return;
    }
    if (onGoToCourse) {
      onGoToCourse(course);
    }
  };

  const renderRegistrationMessage = () => {
    if (status !== 'Registration') return null;
  
    return (
      <Alert className="mb-4 bg-blue-50 border-blue-200">
        <FaEnvelope className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-700">
          <p className="font-medium mb-2">Registration Steps:</p>
          <div className="space-y-3">
            {/* Schedule Creation Step */}
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
  
            {/* Registration Processing Step */}
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

  const renderTrialMessage = () => {
    if (!isAdultStudent || course.payment?.hasValidPayment) return null;

    return (
      <Alert className="mb-4 bg-purple-50 border-purple-200">
        <AlertCircle className="h-4 w-4 text-purple-500" />
        <AlertDescription className="text-purple-700">
          <p className="font-medium mb-1">7-Day Trial Period</p>
          <div className="prose prose-sm prose-purple max-w-none">
            <p className="text-purple-700 mt-0 mb-0">
              Once you're added to the course, you'll have 7 days to explore the content before payment is required. 
              Choose between a one-time payment or three monthly installments.
            </p>
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  const renderPaymentButton = () => {
    if (!isAdultStudent) return null;
    
    // Get payment info from course object
    const { payment } = course;
    
    if (!payment) {
      return (
        <Button disabled className="w-full bg-gray-100 text-gray-400">
          <span className="animate-pulse">Payment status unavailable</span>
        </Button>
      );
    }
  
    if (payment.status === 'paid' || payment.status === 'active') {
      const isSubscription = payment.details?.type === 'subscription';
      const buttonStyle = payment.status === 'paid'
        ? 'bg-green-50 text-green-700 hover:bg-green-100'
        : 'bg-blue-50 text-blue-700 hover:bg-blue-100';
  
      return (
        <>
          <Button
            onClick={() => setShowPaymentDetails(true)}
            className={`w-full ${buttonStyle} transition-colors duration-200 flex items-center justify-center`}
          >
            {payment.status === 'paid' ? (
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
              ...payment.details,
              courseName: courseName
            }}
          />
        </>
      );
    }
  
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

  // Updated renderScheduleButtons function with animation
  const renderScheduleButtons = () => {
    return (
      <>
        <CreateScheduleButton 
          onClick={checkRemainingSchedules} 
          hasSchedule={hasSchedule}
        />
  
        {/* Schedule Purchase Dialog */}
        <SchedulePurchaseDialog 
          isOpen={showScheduleConfirmDialog}
          onOpenChange={setShowScheduleConfirmDialog}
          onProceedToCreation={() => {
            setShowScheduleConfirmDialog(false);
            setShowCreateScheduleDialog(true);
          }}
        />
  
        {/* Create Schedule Dialog */}
        <Dialog open={showCreateScheduleDialog} onOpenChange={setShowCreateScheduleDialog}>
          <DialogContent className="max-w-7xl">
            <DialogHeader>
              <DialogTitle>Create Your Course Schedule</DialogTitle>
            </DialogHeader>
            <YourWayScheduleCreator 
              course={course}
              onScheduleSaved={() => {
                setRemainingSchedules(prev => Math.max(0, prev - 1));
                setShowCreateScheduleDialog(false);
              }}
            />
          </DialogContent>
        </Dialog>
  
        {/* Show Progress button if schedule exists */}
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

  return (
    <>
      <div className={`transform transition-all duration-300 hover:scale-[1.003] ${className}`}>
        <CourseDetailsDialog 
          isOpen={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
          course={course}
        />

        <Card className="overflow-hidden border-l-4" style={{ borderLeftColor: getBorderColor(status) }}>
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
                <Badge variant="outline" className={getStatusColor(status)}>
                  {status}
                </Badge>
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
            {renderRegistrationMessage()}
            {renderTrialMessage()}
            
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
              <div className="grid grid-cols-3 gap-2">
                {renderScheduleButtons()}

                <Button 
                  onClick={handleGoToCourse}
                  className={`
                    w-full shadow-lg transition-all duration-200 inline-flex items-center justify-center gap-2
                    ${(!hasSchedule || status !== 'Active') 
                      ? 'bg-gray-200 hover:bg-gray-200 text-gray-400 cursor-not-allowed opacity-60' 
                      : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white hover:shadow-xl hover:scale-[1.02] transform'
                    }
                  `}
                  disabled={!hasSchedule || status !== 'Active'}
                >
                  <FaExternalLinkAlt className="h-4 w-4" />
                  <span>{(!hasSchedule || status !== 'Active') ? 'Course Unavailable' : 'Go to Course'}</span>
                </Button>

                {renderPaymentButton()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Dialog */}
      <PaymentOptionsDialog 
        isOpen={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        course={course}
        user={currentUser} 
      />
    </>
  );
};

export default CourseCard;
