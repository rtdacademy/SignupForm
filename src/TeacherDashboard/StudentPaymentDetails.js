import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { COURSE_OPTIONS } from '../config/DropdownOptions';
import {
  X,
  User,
  CreditCard,
  Calendar,
  DollarSign,
  RefreshCw,
  ExternalLink,
  Check,
  Clock,
  AlertCircle,
  FileText,
  TrendingUp,
  Package,
  ChevronRight,
  Database,
  Cloud,
  Link
} from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../components/ui/sheet';

const StudentPaymentDetails = ({ student, schoolYear, isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [stripeData, setStripeData] = useState(null);
  const [stripeLoading, setStripeLoading] = useState(true); // Add separate loading state for Stripe
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [stripePaymentHistory, setStripePaymentHistory] = useState(null);
  const [stripeHistoryLoading, setStripeHistoryLoading] = useState(false);
  const [studentProfile, setStudentProfile] = useState(null);
  const [coursePayments, setCoursePayments] = useState({});
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [subscriptionIdToLink, setSubscriptionIdToLink] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [linkStatus, setLinkStatus] = useState('');

  useEffect(() => {
    if (!isOpen) {
      // Reset data when modal closes
      setStripeData(null);
      setStripePaymentHistory(null);
      setPaymentHistory([]);
      setCoursePayments({});
      setPaymentSummary(null);
      setError(null);
      setActiveTab('overview');
      return;
    }
    
    if (!student) return;
    
    loadStudentData();
    loadStripeData();
  }, [student, isOpen]);

  // Load Stripe payment history when History tab is selected
  useEffect(() => {
    if (isOpen && activeTab === 'history' && !stripePaymentHistory && !stripeHistoryLoading) {
      loadStripePaymentHistory();
    }
  }, [isOpen, activeTab]);

  const loadStudentData = async () => {
    try {
      const db = getDatabase();
      const emailKey = sanitizeEmail(student.email);
      
      // Load student profile
      const profileRef = ref(db, `students/${emailKey}/profile`);
      onValue(profileRef, (snapshot) => {
        if (snapshot.exists()) {
          setStudentProfile(snapshot.val());
        }
      });
      
      // Load payment history and course payments
      const paymentsRef = ref(db, `payments/${emailKey}`);
      onValue(paymentsRef, async (snapshot) => {
        // Determine student type for fetching credit/course info
        const studentType = student.studentType || student.type || 'nonPrimaryStudents';
        
        // Load credits/courses info based on student type
        let unpaidInfo = null;
        const creditsRef = ref(db, `creditsPerStudent/${schoolYear}/${studentType}/${emailKey}`);
        const creditsSnapshot = await get(creditsRef);
        
        if (creditsSnapshot.exists()) {
          const creditsData = creditsSnapshot.val();
          console.log('Credits/courses data:', creditsData);
          
          // Check if this is a per-course student (adult/international)
          if (creditsData.courses && (studentType === 'adultStudents' || studentType === 'internationalStudents')) {
            // Per-course payment model
            const unpaidCoursesList = [];
            Object.entries(creditsData.courses).forEach(([courseId, courseInfo]) => {
              if (!courseInfo.isPaid) {
                unpaidCoursesList.push({
                  courseId,
                  courseName: courseInfo.courseName || `Course ${courseId}`,
                  paymentStatus: courseInfo.paymentStatus || 'unpaid'
                });
              }
            });
            
            unpaidInfo = {
              type: 'courses',
              unpaidCourses: creditsData.unpaidCourses || unpaidCoursesList.length,
              paidCourses: creditsData.paidCourses || 0,
              totalCourses: creditsData.totalCourses || 0,
              unpaidCoursesList
            };
          } else if (creditsData.paidCreditsRequired !== undefined) {
            // Credit-based payment model
            unpaidInfo = {
              type: 'credits',
              paidCreditsRequired: creditsData.paidCreditsRequired || 0,
              totalCredits: creditsData.totalCredits || 0,
              nonExemptCredits: creditsData.nonExemptCredits || 0,
              freeCreditsUsed: creditsData.freeCreditsUsed || 0
            };
          }
        }
        if (snapshot.exists()) {
          const data = snapshot.val();
          const history = [];
          
          if (data.courses) {
            // Store course payments for overview
            setCoursePayments(data.courses);
            
            // Calculate payment summary
            let totalPaid = 0;
            let totalDue = 0;
            let paymentModel = 'Unknown';
            let lastUpdated = 0;
            const coursesList = [];
            
            Object.entries(data.courses).forEach(([courseId, courseData]) => {
              // Add to courses list
              coursesList.push({
                courseId,
                courseName: getCourseNameById(courseId),
                amount: courseData.amount_paid || 0,
                status: courseData.status || 'unknown',
                type: courseData.type || 'unknown',
                customerIds: courseData.customer_id ? [courseData.customer_id] : []
              });
              
              // Calculate totals
              if (courseData.amount_paid) {
                totalPaid += courseData.amount_paid;
              }
              
              // Track latest update
              if (courseData.last_updated && courseData.last_updated > lastUpdated) {
                lastUpdated = courseData.last_updated;
              }
              
              // Determine payment model
              if (courseData.type === 'credits') {
                paymentModel = 'Credit-Based';
              } else if (courseData.type === 'subscription' && paymentModel !== 'Credit-Based') {
                paymentModel = 'Subscription';
              } else if (courseData.type === 'one_time' && paymentModel === 'Unknown') {
                paymentModel = 'One-Time';
              }
              
              // Build history
              if (courseData.invoices) {
                courseData.invoices.forEach(invoice => {
                  history.push({
                    type: 'invoice',
                    courseId,
                    courseName: getCourseNameById(courseId),
                    ...invoice
                  });
                });
              }
              
              if (courseData.type === 'one_time' && courseData.payment_date) {
                history.push({
                  type: 'one_time',
                  courseId,
                  courseName: getCourseNameById(courseId),
                  amount_paid: courseData.amount_paid,
                  payment_date: courseData.payment_date,
                  receipt_url: courseData.receipt_url
                });
              }
            });
            
            // Set payment summary
            setPaymentSummary({
              totalPaid,
              paymentModel,
              lastUpdated,
              coursesList,
              status: totalPaid > 0 ? 'paid' : 'unpaid',
              unpaidInfo
            });
          }
          
          // Sort by date (most recent first)
          history.sort((a, b) => {
            const dateA = a.paid_at || a.payment_date || 0;
            const dateB = b.paid_at || b.payment_date || 0;
            return dateB - dateA;
          });
          
          setPaymentHistory(history);
        }
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading student data:', err);
      setError('Failed to load student data');
      setLoading(false);
    }
  };

  const loadStripeData = async () => {
    setStripeLoading(true); // Start loading
    try {
      const db = getDatabase();
      const emailKey = sanitizeEmail(student.email);
      
      console.log('Loading Stripe data for:', student.email);
      console.log('Student data:', student);
      console.log('Email key for Firebase:', emailKey);
      
      // First, get customer_id from Firebase payment data
      let customerId = null;
      let courseIds = [];
      
      // First, try to get ALL courses from the payments path directly
      // This ensures we get all courses with payment data, not just the current course
      const paymentsRef = ref(db, `payments/${emailKey}/courses`);
      const paymentsSnapshot = await get(paymentsRef);
      
      if (paymentsSnapshot.exists()) {
        const allPaymentCourses = paymentsSnapshot.val();
        courseIds = Object.keys(allPaymentCourses);
        console.log('Found courses with payment data:', courseIds);
      } else {
        // Fallback to checking student data for course IDs
        // Check rawData.coursePaymentDetails first as it's more reliable
        if (student.rawData?.coursePaymentDetails && Object.keys(student.rawData.coursePaymentDetails).length > 0) {
          courseIds = Object.keys(student.rawData.coursePaymentDetails);
          console.log('Course IDs from rawData.coursePaymentDetails:', courseIds);
        } else if (student.courses && typeof student.courses === 'object' && Object.keys(student.courses).length > 0) {
          courseIds = Object.keys(student.courses);
          console.log('Course IDs from student.courses:', courseIds);
        } else {
          // Fallback: check for course IDs directly in rawData (like "2": 5, "84": 5)
          if (student.rawData) {
            courseIds = Object.keys(student.rawData).filter(key => {
              // Filter out non-course properties
              return !isNaN(key) && key !== 'coursePaymentDetails' && 
                     typeof student.rawData[key] === 'number';
            });
            if (courseIds.length > 0) {
              console.log('Course IDs extracted from rawData numeric keys:', courseIds);
            }
          }
          
          if (courseIds.length === 0) {
            console.log('No courses found in student data');
          }
        }
      }
      
      // Collect ALL unique customer_ids from all course payments
      const customerIds = new Set();
      
      for (const courseId of courseIds) {
        const paymentPath = `payments/${emailKey}/courses/${courseId}`;
        console.log('Checking payment path:', paymentPath);
        
        const paymentRef = ref(db, paymentPath);
        const snapshot = await get(paymentRef);
        
        if (snapshot.exists()) {
          const paymentData = snapshot.val();
          console.log(`Payment data for course ${courseId}:`, paymentData);
          
          if (paymentData.customer_id) {
            customerIds.add(paymentData.customer_id);
            console.log('Found customer_id:', paymentData.customer_id, 'from course:', courseId);
          } else {
            console.log(`No customer_id in payment data for course ${courseId}`);
          }
        } else {
          console.log(`No payment data found for course ${courseId}`);
        }
      }
      
      // Convert Set to Array
      const uniqueCustomerIds = Array.from(customerIds);
      console.log('All unique customer IDs found:', uniqueCustomerIds);
      
      // If we found customer_ids, fetch Stripe data for ALL of them
      if (uniqueCustomerIds.length > 0) {
        console.log('Calling cloud function with customer_ids:', uniqueCustomerIds);
        
        const functions = getFunctions();
        const getStripeCustomer = httpsCallable(functions, 'getStudentPaymentDetailsV2');
        
        // Call the function with multiple customer IDs
        const result = await getStripeCustomer({
          customerIds: uniqueCustomerIds, // Pass array of customer IDs
          email: student.email,
          courseIds: courseIds
        });
        
        console.log('Cloud function result:', result.data);
        
        if (result.data.success) {
          setStripeData(result.data);
        }
      } else {
        console.log('No customer_ids found in any payment data, skipping Stripe fetch');
      }
    } catch (err) {
      console.error('Error loading Stripe data:', err);
      // Don't show error for Stripe data as it's optional
    } finally {
      setStripeLoading(false); // Always stop loading
    }
  };

  const loadStripePaymentHistory = async () => {
    // Don't reload if we already have it
    if (stripePaymentHistory) return;
    
    setStripeHistoryLoading(true);
    try {
      const db = getDatabase();
      const emailKey = sanitizeEmail(student.email);
      
      console.log('Loading Stripe payment history for:', student.email);
      
      // Get customer_ids from Firebase payment data (same logic as loadStripeData)
      let courseIds = [];
      
      // First, try to get ALL courses from the payments path directly
      const paymentsRef = ref(db, `payments/${emailKey}/courses`);
      const paymentsSnapshot = await get(paymentsRef);
      
      if (paymentsSnapshot.exists()) {
        const allPaymentCourses = paymentsSnapshot.val();
        courseIds = Object.keys(allPaymentCourses);
        console.log('Found courses with payment data for history:', courseIds);
      } else {
        // Fallback to checking student data
        // Check rawData.coursePaymentDetails first as it's more reliable
        if (student.rawData?.coursePaymentDetails && Object.keys(student.rawData.coursePaymentDetails).length > 0) {
          courseIds = Object.keys(student.rawData.coursePaymentDetails);
        } else if (student.courses && typeof student.courses === 'object' && Object.keys(student.courses).length > 0) {
          courseIds = Object.keys(student.courses);
        } else {
          // Fallback: check for course IDs directly in rawData
          if (student.rawData) {
            courseIds = Object.keys(student.rawData).filter(key => {
              return !isNaN(key) && key !== 'coursePaymentDetails' && 
                     typeof student.rawData[key] === 'number';
            });
          }
        }
      }
      
      // Collect ALL unique customer_ids from all course payments
      const customerIds = new Set();
      
      for (const courseId of courseIds) {
        const paymentPath = `payments/${emailKey}/courses/${courseId}`;
        const paymentRef = ref(db, paymentPath);
        const snapshot = await get(paymentRef);
        
        if (snapshot.exists()) {
          const paymentData = snapshot.val();
          if (paymentData.customer_id) {
            customerIds.add(paymentData.customer_id);
          }
        }
      }
      
      // Convert Set to Array
      const uniqueCustomerIds = Array.from(customerIds);
      console.log('Customer IDs for payment history:', uniqueCustomerIds);
      
      // If we found customer_ids, fetch payment history from Stripe
      if (uniqueCustomerIds.length > 0) {
        console.log('Calling getStudentPaymentHistory with customer_ids:', uniqueCustomerIds);
        
        const functions = getFunctions();
        const getPaymentHistory = httpsCallable(functions, 'getStudentPaymentHistory');
        
        const result = await getPaymentHistory({
          customerIds: uniqueCustomerIds,
          email: student.email
        });
        
        console.log('Payment history result:', result.data);
        
        if (result.data.success) {
          setStripePaymentHistory(result.data);
        }
      } else {
        console.log('No customer_ids found, cannot fetch Stripe payment history');
      }
    } catch (err) {
      console.error('Error loading Stripe payment history:', err);
    } finally {
      setStripeHistoryLoading(false);
    }
  };

  const getCourseNameById = (courseId) => {
    const course = COURSE_OPTIONS.find(c => c.courseId === parseInt(courseId));
    return course ? course.label : `Course ${courseId}`;
  };

  const formatCurrency = (amount) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodIcon = (type) => {
    switch (type) {
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'bank_account': return <FileText className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const handleLinkSubscription = async () => {
    if (!subscriptionIdToLink.trim()) {
      setLinkStatus('Error: Please enter a subscription ID');
      return;
    }

    setIsLinking(true);
    setLinkStatus('');

    try {
      const functions = getFunctions();
      const linkSubscription = httpsCallable(functions, 'linkStripeSubscriptionV2');

      const result = await linkSubscription({
        studentEmail: student.email,
        courseId: '2', // Default to Physics 20 for now
        subscriptionId: subscriptionIdToLink.trim()
      });

      if (result.data.success) {
        setLinkStatus(`Success! Linked subscription with ${result.data.paymentCount || 0} payments found.`);
        // Reload Stripe data to show the new subscription
        setTimeout(() => {
          loadStripeData();
          setShowLinkModal(false);
          setSubscriptionIdToLink('');
          setLinkStatus('');
        }, 2000);
      } else {
        setLinkStatus(`Error: ${result.data.message || 'Failed to link subscription'}`);
      }
    } catch (err) {
      console.error('Error linking subscription:', err);
      setLinkStatus(`Error: ${err.message || 'An error occurred while linking the subscription'}`);
    } finally {
      setIsLinking(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
      case 'active':
      case 'succeeded':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
            <Check className="h-3 w-3" />
            {status}
          </span>
        );
      case 'partial':
      case 'past_due':
      case 'incomplete':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
            <Clock className="h-3 w-3" />
            {status}
          </span>
        );
      case 'unpaid':
      case 'canceled':
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
            <X className="h-3 w-3" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
            <AlertCircle className="h-3 w-3" />
            {status}
          </span>
        );
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" size="xl" className="w-full sm:w-[95%] max-w-none overflow-hidden flex flex-col">
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="text-xl font-bold">Payment Details</SheetTitle>
          <p className="text-sm text-gray-600 mt-1">{student.email}</p>
        </SheetHeader>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex space-x-1 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: Database, source: 'local' },
              { id: 'stripe', label: 'Stripe', icon: Cloud, source: 'live' },
              { id: 'history', label: 'History', icon: Cloud, source: 'live' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-3 w-3" />
                {tab.label}
                {tab.source === 'live' && (
                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">LIVE</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <Alert className="border-red-500">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Data Source Banner */}
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 flex items-center gap-2">
                    <Database className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-blue-700">
                      This data is from your local Firebase database
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <Database className="h-4 w-4 text-gray-500" />
                        Student Information
                      </h3>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Email:</dt>
                          <dd className="text-sm font-medium">{student.email}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">UID:</dt>
                          <dd className="text-sm font-medium">{student.uid}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Type:</dt>
                          <dd className="text-sm font-medium">{student.studentType}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">School Year:</dt>
                          <dd className="text-sm font-medium">{schoolYear}</dd>
                        </div>
                        {studentProfile && (
                          <>
                            <div className="flex justify-between">
                              <dt className="text-sm text-gray-500">Name:</dt>
                              <dd className="text-sm font-medium">
                                {studentProfile.firstName} {studentProfile.lastName}
                              </dd>
                            </div>
                            {studentProfile.ParentEmail && (
                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Parent Email:</dt>
                                <dd className="text-sm font-medium">{studentProfile.ParentEmail}</dd>
                              </div>
                            )}
                          </>
                        )}
                      </dl>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-700 mb-3">Payment Summary</h3>
                      {paymentSummary ? (
                        <dl className="space-y-2">
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Status:</dt>
                            <dd>{getStatusBadge(paymentSummary.status)}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Payment Model:</dt>
                            <dd className="text-sm font-medium">{paymentSummary.paymentModel}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Total Paid:</dt>
                            <dd className="text-sm font-medium text-green-600">
                              {formatCurrency(paymentSummary.totalPaid)}
                            </dd>
                          </div>
                          {paymentSummary.unpaidInfo && (
                            <>
                              {paymentSummary.unpaidInfo.type === 'credits' ? (
                                <>
                                  <div className="flex justify-between">
                                    <dt className="text-sm text-gray-500">Credits Not Paid:</dt>
                                    <dd className="text-sm font-medium text-orange-600">
                                      {paymentSummary.unpaidInfo.paidCreditsRequired}
                                    </dd>
                                  </div>
                                  <div className="flex justify-between">
                                    <dt className="text-sm text-gray-500">Total Credits:</dt>
                                    <dd className="text-sm font-medium">{paymentSummary.unpaidInfo.totalCredits}</dd>
                                  </div>
                                </>
                              ) : paymentSummary.unpaidInfo.type === 'courses' ? (
                                <>
                                  <div className="flex justify-between">
                                    <dt className="text-sm text-gray-500">Unpaid Courses:</dt>
                                    <dd className="text-sm font-medium text-orange-600">
                                      {paymentSummary.unpaidInfo.unpaidCourses}
                                    </dd>
                                  </div>
                                  <div className="flex justify-between">
                                    <dt className="text-sm text-gray-500">Total Courses:</dt>
                                    <dd className="text-sm font-medium">
                                      {paymentSummary.unpaidInfo.paidCourses}/{paymentSummary.unpaidInfo.totalCourses} paid
                                    </dd>
                                  </div>
                                </>
                              ) : null}
                            </>
                          )}
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Last Updated:</dt>
                            <dd className="text-sm font-medium">{formatDate(paymentSummary.lastUpdated)}</dd>
                          </div>
                        </dl>
                      ) : (
                        <dl className="space-y-2">
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Status:</dt>
                            <dd>{getStatusBadge(student.paymentStatus)}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Payment Model:</dt>
                            <dd className="text-sm font-medium capitalize">{student.paymentModel}-based</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Total Paid:</dt>
                            <dd className="text-sm font-medium text-green-600">
                              {formatCurrency(student.amountPaid)}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Last Updated:</dt>
                            <dd className="text-sm font-medium">{formatDate(student.lastUpdated)}</dd>
                          </div>
                        </dl>
                      )}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600">Total Credits</p>
                          <p className="text-2xl font-bold text-blue-700">{student.totalCredits - student.exemptCredits}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-blue-400" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600">Non-Exempt</p>
                          <p className="text-2xl font-bold text-green-700">{student.nonExemptCredits}</p>
                        </div>
                        <Package className="h-8 w-8 text-green-400" />
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-yellow-600">Free Used</p>
                          <p className="text-2xl font-bold text-yellow-700">{student.freeCreditsUsed}</p>
                        </div>
                        <Clock className="h-8 w-8 text-yellow-400" />
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-purple-600">Paid Required</p>
                          <p className="text-2xl font-bold text-purple-700">{student.paidCreditsRequired}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-purple-400" />
                      </div>
                    </div>
                  </div>

                  {/* Unpaid Courses Section for Adult/International Students */}
                  {paymentSummary && paymentSummary.unpaidInfo && 
                   paymentSummary.unpaidInfo.type === 'courses' && 
                   paymentSummary.unpaidInfo.unpaidCoursesList.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        Unpaid Courses
                      </h3>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="space-y-2">
                          {paymentSummary.unpaidInfo.unpaidCoursesList.map((course) => (
                            <div key={course.courseId} className="flex items-center justify-between">
                              <div>
                                <span className="font-medium">{course.courseName}</span>
                                <span className="text-sm text-gray-500 ml-2">(ID: {course.courseId})</span>
                              </div>
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                {course.paymentStatus}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Course Payments Section */}
                  {paymentSummary && paymentSummary.coursesList.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-medium text-gray-700 mb-3">Course Payments</h3>
                      <div className="space-y-2">
                        {paymentSummary.coursesList.map((course) => (
                          <div key={course.courseId} className="bg-white border rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{course.courseName}</span>
                                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    {course.type === 'one_time' ? 'Full Course Payment' : 
                                     course.type === 'subscription' ? 'Subscription' :
                                     course.type === 'credits' ? 'Credits' : 
                                     course.type}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  Course ID: {course.courseId}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-green-600">
                                  {formatCurrency(course.amount)}
                                </div>
                                <div className="text-xs">
                                  {getStatusBadge(course.status)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">Total Paid:</span>
                          <span className="text-lg font-bold text-green-600">
                            {formatCurrency(paymentSummary.totalPaid)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Stripe Tab */}
              {activeTab === 'stripe' && (
                <div className="space-y-6">
                  {/* Link Subscription Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowLinkModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Link className="h-4 w-4" />
                      Link Stripe Subscription
                    </button>
                  </div>

                  {stripeLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                      <p className="text-gray-600">Loading Stripe payment data...</p>
                    </div>
                  ) : stripeData ? (
                    <>
                      <div className="bg-green-50 border-l-4 border-green-500 p-4">
                        <h3 className="font-medium text-green-900 mb-2">
                          {stripeData.multiple_customers ? 'Multiple Stripe Customers Found' : 'Stripe Customer Found'}
                        </h3>
                        {stripeData.multiple_customers && stripeData.customers ? (
                          <div className="space-y-2">
                            {stripeData.customers.map((customer, index) => (
                              <div key={customer.id} className="flex items-center gap-4">
                                <p className="text-sm text-green-700">
                                  Customer {index + 1}: {customer.id} ({customer.email || 'No email'})
                                </p>
                                <a
                                  href={`https://dashboard.stripe.com/customers/${customer.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                                >
                                  View in Stripe
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <p className="text-sm text-green-700">Customer ID: {stripeData.customerId}</p>
                            <a
                              href={`https://dashboard.stripe.com/customers/${stripeData.customerId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                            >
                              View in Stripe
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </div>

                      {stripeData.subscriptions && stripeData.subscriptions.length > 0 && (
                        <div>
                          <h3 className="font-medium text-gray-700 mb-3">Active Subscriptions</h3>
                          <div className="space-y-3">
                            {stripeData.subscriptions.map((sub) => (
                              <div key={sub.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <p className="font-medium">{sub.metadata?.courseName || 'Subscription'}</p>
                                    <p className="text-xs text-gray-500">ID: {sub.id}</p>
                                  </div>
                                  {getStatusBadge(sub.status)}
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <p className="text-gray-500">Amount</p>
                                    <p className="font-medium">{formatCurrency(sub.amount)}/mo</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Started</p>
                                    <p className="font-medium">{formatDate(sub.created * 1000)}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Next Payment</p>
                                    <p className="font-medium">{formatDate(sub.current_period_end * 1000)}</p>
                                  </div>
                                  <div>
                                    <a
                                      href={`https://dashboard.stripe.com/subscriptions/${sub.id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                                    >
                                      View Details
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {stripeData.charges && stripeData.charges.length > 0 && (
                        <div>
                          <h3 className="font-medium text-gray-700 mb-3">Recent Payments</h3>
                          <div className="overflow-x-auto">
                            <table className="w-full border rounded-lg">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Receipt</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y">
                                {stripeData.charges.map((charge) => (
                                  <tr key={charge.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 text-sm">{formatDate(charge.created * 1000)}</td>
                                    <td className="px-4 py-2 text-sm font-medium">{formatCurrency(charge.amount)}</td>
                                    <td className="px-4 py-2 text-sm">{charge.description || 'Payment'}</td>
                                    <td className="px-4 py-2">{getStatusBadge(charge.status)}</td>
                                    <td className="px-4 py-2">
                                      {charge.receipt_url && (
                                        <a
                                          href={charge.receipt_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:underline text-sm"
                                        >
                                          View
                                        </a>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-gray-50 border-l-4 border-gray-400 p-4">
                      <h3 className="font-medium text-gray-700 mb-2">No Stripe Customer Found</h3>
                      <p className="text-sm text-gray-600">
                        No Stripe customer record was found for this student's Firebase UID.
                        This could mean they haven't made any payments yet or their account
                        was created before Stripe integration.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="space-y-6">
                  {/* Show loading state if fetching Stripe data */}
                  {stripeHistoryLoading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-3" />
                      <p className="text-gray-600">Loading payment history from Stripe...</p>
                    </div>
                  ) : stripePaymentHistory && stripePaymentHistory.success ? (
                    // Show Stripe payment history if available
                    <>
                      {/* Data Source Banner for Stripe */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                        <Cloud className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-800 font-medium">
                          Live data from Stripe API
                        </span>
                        {stripePaymentHistory.summary && (
                          <span className="ml-auto text-xs text-green-700">
                            {stripePaymentHistory.summary.total_items} transactions from {stripePaymentHistory.summary.total_customers} customer{stripePaymentHistory.summary.total_customers !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-medium text-gray-700">Payment History</h3>
                      {stripePaymentHistory.history && stripePaymentHistory.history.length > 0 ? (
                        <div className="space-y-3">
                          {stripePaymentHistory.history.map((payment) => (
                            <div key={payment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    {payment.type === 'invoice' ? (
                                      <FileText className="h-4 w-4 text-blue-500" />
                                    ) : payment.type === 'charge' ? (
                                      <CreditCard className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <DollarSign className="h-4 w-4 text-purple-500" />
                                    )}
                                    <p className="font-medium">
                                      {payment.courseName || payment.description || `${payment.type} ${payment.id}`}
                                    </p>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                      {payment.type}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                                    <div>
                                      <p className="text-gray-500">Amount</p>
                                      <p className="font-medium">{formatCurrency(payment.amount)}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Date</p>
                                      <p className="font-medium">
                                        {formatDate((payment.paid_at || payment.created) * 1000)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Status</p>
                                      {getStatusBadge(payment.status)}
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Customer</p>
                                      <p className="font-medium text-xs truncate" title={payment.customer_email}>
                                        {payment.customer_name || payment.customer_email || payment.customer_id}
                                      </p>
                                    </div>
                                    {payment.payment_method_type && (
                                      <div>
                                        <p className="text-gray-500">Method</p>
                                        <p className="font-medium capitalize">
                                          {payment.payment_method_type}
                                          {payment.payment_method_last4 && ` ****${payment.payment_method_last4}`}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                  {/* Show refund info if applicable */}
                                  {payment.refunded && (
                                    <div className="mt-2 bg-yellow-50 rounded p-2 text-sm">
                                      <span className="text-yellow-800">
                                        Refunded: {formatCurrency(payment.refund_amount)}
                                      </span>
                                    </div>
                                  )}
                                  {/* Show dispute info if applicable */}
                                  {payment.disputed && (
                                    <div className="mt-2 bg-red-50 rounded p-2 text-sm">
                                      <span className="text-red-800">
                                        Disputed {payment.dispute_status && `- ${payment.dispute_status}`}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col gap-2 ml-4">
                                  {payment.stripe_dashboard_url && (
                                    <a
                                      href={payment.stripe_dashboard_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                                    >
                                      Stripe
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  )}
                                  {payment.hosted_invoice_url && (
                                    <a
                                      href={payment.hosted_invoice_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                                    >
                                      Invoice
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  )}
                                  {payment.invoice_pdf && (
                                    <a
                                      href={payment.invoice_pdf}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                                    >
                                      PDF
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  )}
                                  {payment.receipt_url && (
                                    <a
                                      href={payment.receipt_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                                    >
                                      Receipt
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          No payment history found in Stripe
                        </div>
                      )}
                    </>
                  ) : (
                    // Fallback to local payment history
                    <>
                      {/* Data Source Banner for Local */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                        <Database className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-800">
                          Data from local database
                        </span>
                      </div>
                      
                      <h3 className="font-medium text-gray-700">Payment History</h3>
                      {paymentHistory.length > 0 ? (
                    <div className="space-y-3">
                      {paymentHistory.map((payment, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {payment.type === 'invoice' ? (
                                  <FileText className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <DollarSign className="h-4 w-4 text-gray-400" />
                                )}
                                <p className="font-medium">
                                  {payment.courseName || (payment.courseId ? getCourseNameById(payment.courseId) : 'Payment')}
                                </p>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500">Type</p>
                                  <p className="font-medium capitalize">{payment.type}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Amount</p>
                                  <p className="font-medium">{formatCurrency(payment.amount_paid)}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Date</p>
                                  <p className="font-medium">
                                    {formatDate(payment.paid_at || payment.payment_date)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Status</p>
                                  {getStatusBadge(payment.status || 'paid')}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              {payment.hosted_invoice_url && (
                                <a
                                  href={payment.hosted_invoice_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                                >
                                  Invoice
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                              {payment.receipt_url && (
                                <a
                                  href={payment.receipt_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                                >
                                  Receipt
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                              {payment.stripe_dashboard_url && (
                                <a
                                  href={payment.stripe_dashboard_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                                >
                                  Stripe
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          No payment history found
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Link Subscription Modal */}
        {showLinkModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold">Link Stripe Subscription</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Manually link a Stripe subscription to this student
                </p>
              </div>

              <div className="px-6 py-4">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="subscription-id" className="block text-sm font-medium text-gray-700 mb-1">
                      Subscription ID
                    </label>
                    <input
                      id="subscription-id"
                      type="text"
                      value={subscriptionIdToLink}
                      onChange={(e) => setSubscriptionIdToLink(e.target.value)}
                      placeholder="sub_..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the Stripe subscription ID (starts with sub_)
                    </p>
                  </div>

                  {linkStatus && (
                    <div className={`p-3 rounded-md ${
                      linkStatus.includes('Error') ? 'bg-red-50 text-red-700' :
                      linkStatus.includes('Success') ? 'bg-green-50 text-green-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {linkStatus}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowLinkModal(false);
                    setSubscriptionIdToLink('');
                    setLinkStatus('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={isLinking}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLinkSubscription}
                  disabled={!subscriptionIdToLink.trim() || isLinking}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLinking ? 'Linking...' : 'Link Subscription'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default StudentPaymentDetails;