import React, { useState, useEffect } from 'react';
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
import { ChevronRight, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Dialog,
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
import CreateScheduleDialog from './CreateScheduleDialog';
import PaymentOptionsDialog from './PaymentOptionsDialog';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { getFirestore, collection, query, getDocs, where } from 'firebase/firestore';

// Helper Functions
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
  showProgressBar = false,
  showGradeInfo = false,
  customActions,
  onGoToCourse,
  className = ''
}) => {
  const { user } = useAuth();
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState({
    isChecking: true,
    hasValidPayment: false,
    paymentType: null,
    paymentName: null
  });
  
  const courseName = course.Course?.Value || 'Course Name';
  const courseId = course.CourseID || 'N/A';
  const status = course.ActiveFutureArchived?.Value || 'Unknown';
  const studentType = course.StudentType?.Value || 'Not specified';
  const schoolYear = course.School_x0020_Year?.Value || 'N/A';
  const isOnTranscript = course.PASI?.Value === 'Yes';
  const hasSchedule = !!course.ScheduleJSON;
  const isAdultStudent = studentType.toLowerCase().includes('adult');

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!user || !isAdultStudent) {
        setPaymentStatus(prev => ({ ...prev, isChecking: false }));
        return;
      }

      try {
        const firestore = getFirestore();
        let hasValidPayment = false;
        let paymentType = null;
        let paymentName = null;

        // Check one-time payments first
        const paymentsRef = collection(firestore, 'customers', user.uid, 'payments');
        const paymentsQuery = query(paymentsRef, where('metadata.courseId', '==', String(courseId)));
        const paymentsSnapshot = await getDocs(paymentsQuery);
        
        // Check for valid one-time payment
        const validPayment = paymentsSnapshot.docs.some(doc => {
          const paymentData = doc.data();
          if (paymentData.status === 'succeeded') {
            paymentType = 'one-time';
            paymentName = 'One-time Payment';
            return true;
          }
          return false;
        });

        // If no valid one-time payment, check subscriptions
        if (!validPayment) {
          const subscriptionsRef = collection(firestore, 'customers', user.uid, 'subscriptions');
          const subscriptionsSnapshot = await getDocs(subscriptionsRef);
          
          // Check each subscription
          for (const doc of subscriptionsSnapshot.docs) {
            const subscriptionData = doc.data();
            if (subscriptionData.metadata?.courseId === String(courseId) && 
                subscriptionData.status === 'active') {
              hasValidPayment = true;
              paymentType = 'subscription';
              // Try to get the subscription name from metadata
              paymentName = subscriptionData.metadata?.items?.[0]?.price?.name || 'Monthly Installments';
              break;
            }
          }
        } else {
          hasValidPayment = true;
        }

        setPaymentStatus({
          isChecking: false,
          hasValidPayment: hasValidPayment || validPayment,
          paymentType,
          paymentName
        });

      } catch (error) {
        console.error('Error checking payment status:', error);
        toast.error('Failed to verify payment status');
        setPaymentStatus(prev => ({ ...prev, isChecking: false }));
      }
    };

    checkPaymentStatus();
  }, [user, courseId, isAdultStudent]);

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
          <p className="font-medium mb-2">Your registration is being processed</p>
          <div className="prose prose-sm prose-blue max-w-none">
            <ul className="text-blue-700 mt-1 mb-0 list-disc">
              <li>You'll receive an email once you've been added to the course</li>
              <li>The "Go to Course" button will become active at that time</li>
              <li>Feel free to create your schedule now - it will be ready when your course access is granted</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  const renderTrialMessage = () => {
    if (!isAdultStudent || paymentStatus.hasValidPayment) return null;

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
    
    if (paymentStatus.isChecking) {
      return (
        <Button disabled className="w-full bg-gray-100 text-gray-400">
          <span className="animate-pulse">Checking payment...</span>
        </Button>
      );
    }

    if (paymentStatus.hasValidPayment) {
      const paymentLabel = paymentStatus.paymentType === 'subscription' 
        ? 'Monthly Installments'  // Changed from "Subscription Payment"
        : 'One-time Payment';

      return (
        <div className="w-full flex flex-col items-center justify-center bg-green-50 text-green-700 py-2 px-4 rounded-md">
          <div className="flex items-center gap-2">
            <FaCheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Payment Complete</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            {paymentStatus.paymentType === 'subscription' ? (
              <FaClock className="h-3 w-3 text-green-600" />
            ) : (
              <FaCreditCard className="h-3 w-3 text-green-600" />
            )}
            <span className="text-xs text-green-600">{paymentLabel}</span>
          </div>
        </div>
      );
    }

    return (
      <Button
        onClick={() => setShowPaymentDialog(true)}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all duration-200"
      >
        <FaCreditCard className="mr-2" />
        Make Payment
      </Button>
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
                {status === 'Registration' && !paymentStatus.hasValidPayment && (
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
                      {isOnTranscript ? "Added to Transcript" : "Not Yet on Transcript"}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {isOnTranscript 
                        ? "This course has been added to your MyPass transcript." 
                        : (
                          <>
                            This course will appear on your transcript once you are registered. 
                            Please confirm your registration in{' '}
                            <a 
                              href="https://public.education.alberta.ca/PASI/mypass/welcome"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-800 hover:underline"
                            >
                              MyPass <FaExternalLinkAlt className="inline h-2 w-2" />
                            </a>
                          </>
                        )
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-700/90 hover:to-purple-700/90 text-white shadow-sm transition-all duration-200"
                    >
                      <FaCalendarPlus className="mr-2 h-4 w-4" />
                      {hasSchedule ? 'View/Edit Schedule' : 'Create Schedule'}
                    </Button>
                  </DialogTrigger>
                  <CreateScheduleDialog
                    isOpen={showScheduleDialog}
                    onOpenChange={setShowScheduleDialog}
                    course={course}
                  />
                </Dialog>

                <Button 
                  onClick={handleGoToCourse}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-600 shadow-lg transition-all duration-200 hover:shadow-xl inline-flex items-center justify-center gap-2"
                  disabled={!hasSchedule || status !== 'Active'}
                >
                  <FaExternalLinkAlt className="h-4 w-4" />
                  <span>Go to Course</span>
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
        user={user}
      />
    </>
  );
};

export default CourseCard;
