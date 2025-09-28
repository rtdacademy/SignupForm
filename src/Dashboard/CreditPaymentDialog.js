import React, { useState, useEffect, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../components/ui/sheet";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { FaCreditCard, FaCheck, FaInfoCircle, FaGraduationCap } from 'react-icons/fa';
import { Loader2, CreditCard, AlertCircle, CheckCircle2, BookOpen } from "lucide-react";
import {
  collection,
  onSnapshot,
  addDoc,
  doc
} from 'firebase/firestore';
import { toast } from 'sonner';
import { firestore } from '../firebase';
import { COURSE_OPTIONS } from '../config/DropdownOptions';
import { getCreditPricing, formatPrice as formatCurrency } from '../config/paymentConfig';
import PaymentOptionsDialog from './PaymentOptionsDialog';

// Loading Overlay Component
const LoadingOverlay = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4 text-center space-y-4">
        <div className="flex justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Preparing Your Secure Checkout
        </h3>
        <p className="text-sm text-gray-500">
          You'll be redirected to our secure payment partner momentarily...
        </p>
      </div>
    </div>
  );
};

// Format price helper function - moved inside component to access pricingData
// We'll handle this inside the component

// Get course names from IDs
const getCourseNames = (courseIds) => {
  if (!courseIds || !Array.isArray(courseIds)) return [];
  
  return courseIds.map(id => {
    const course = COURSE_OPTIONS.find(c => c.courseId === Number(id));
    return course ? course.label : `Course ${id}`;
  });
};

const CreditPaymentDialog = ({ 
  isOpen, 
  onOpenChange, 
  user,
  creditsRequired, // Total credits required to pay
  coursesToUnlock = [], // Array of course IDs that will be unlocked
  coursePaymentDetails = {}, // Detailed payment info per course
  courses = [], // All courses for name lookup
  schoolYear,
  studentType,
  mode = 'total', // 'total' for all credits, 'course' for specific course
  courseName = null, // For course-specific payment
  courseId = null, // For course-specific payment
  onPaymentSuccess, // Callback when payment succeeds
  isCourseBased = false, // Flag for course-based payment (adult/international students)
  coursesToPay = {}, // Object with course details for course-based payment
  unpaidCourses = 0, // Number of unpaid courses
  sanitizedType = '' // Sanitized student type
}) => {
  console.log('[CreditPaymentDialog] Component rendered with:', { isOpen, isCourseBased, coursesToPay, unpaidCourses });

  const [selectedCourses, setSelectedCourses] = useState(new Set()); // Track selected course IDs
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [checkoutSessionUnsubscribe, setCheckoutSessionUnsubscribe] = useState(null);
  const [selectedCourseForPayment, setSelectedCourseForPayment] = useState(null); // For course-based payment
  const [showPaymentOptions, setShowPaymentOptions] = useState(false); // Show PaymentOptionsDialog
  
  // Get pricing data from config
  const pricingData = getCreditPricing();
  const pricingLoading = false; // No need to load from database anymore

  // Use formatPrice from config
  const formatPrice = (amount) => formatCurrency(amount, pricingData?.currency || 'CAD');

  // Get course name by ID
  const getCourseName = (courseId) => {
    const course = courses.find(c => c.CourseID === courseId || c.CourseID === String(courseId) || c.id === courseId || c.id === String(courseId));
    return course?.Course?.Value || course?.CourseName || `Course ${courseId}`;
  };
  
  // Build payment options from coursePaymentDetails - memoized to prevent infinite loops
  const paymentOptions = useMemo(() => {
    const options = [];

    // Add individual course options
    if (coursePaymentDetails && pricingData) {
      Object.entries(coursePaymentDetails).forEach(([courseId, details]) => {
        if (details.requiresPayment && details.creditsRequiredToUnlock > 0) {
          options.push({
            id: courseId,
            courseName: getCourseName(courseId),
            credits: details.creditsRequiredToUnlock,
            price: details.creditsRequiredToUnlock * (pricingData.priceInCents / 100)
          });
        }
      });
    }

    return options;
  }, [coursePaymentDetails, pricingData, courses]); // Added courses as dependency since getCourseName uses it
  
  // Initialize with all courses selected
  useEffect(() => {
    if (paymentOptions.length > 0 && selectedCourses.size === 0) {
      setSelectedCourses(new Set(paymentOptions.map(opt => opt.id)));
    }
  }, [paymentOptions]); // Use paymentOptions directly, not just length
  
  // Calculate total credits based on selected courses - memoized
  const creditQuantity = useMemo(() => {
    return paymentOptions
      .filter(opt => selectedCourses.has(opt.id))
      .reduce((sum, opt) => sum + opt.credits, 0);
  }, [paymentOptions, selectedCourses]);
  
  // Toggle course selection
  const toggleCourse = (courseId) => {
    const newSelection = new Set(selectedCourses);
    if (newSelection.has(courseId)) {
      newSelection.delete(courseId);
    } else {
      newSelection.add(courseId);
    }
    setSelectedCourses(newSelection);
  };
  
  // Select/Deselect all
  const toggleAll = () => {
    if (selectedCourses.size === paymentOptions.length) {
      setSelectedCourses(new Set()); // Deselect all
    } else {
      setSelectedCourses(new Set(paymentOptions.map(opt => opt.id))); // Select all
    }
  };
  
  // Debug logging - commented out to prevent infinite loops
  // useEffect(() => {
  //   console.log('CreditPaymentDialog render:', {
  //     isOpen,
  //     user: user?.email,
  //     creditsRequired,
  //     coursesToUnlock,
  //     coursePaymentDetails,
  //     paymentOptions,
  //     selectedCourses: Array.from(selectedCourses),
  //     creditQuantity
  //   });
  // }, [isOpen, user, creditsRequired, coursesToUnlock, coursePaymentDetails, paymentOptions, selectedCourses, creditQuantity]);


  useEffect(() => {
    return () => {
      if (checkoutSessionUnsubscribe) {
        checkoutSessionUnsubscribe();
      }
    };
  }, [checkoutSessionUnsubscribe]);

  useEffect(() => {
    if (!isOpen) {
      if (checkoutSessionUnsubscribe) {
        checkoutSessionUnsubscribe();
        setCheckoutSessionUnsubscribe(null);
      }
      setIsRedirecting(false);
      setPaymentError(null);
      setPaymentLoading(false);
      // Reset selections when dialog closes
      setSelectedCourses(new Set());
    }
  }, [isOpen]);


  const handleCheckout = async () => {
    try {
      setPaymentLoading(true);
      setIsRedirecting(true);
      setPaymentError(null);

      if (!user) {
        throw new Error('You must be logged in to make a purchase');
      }

      if (!pricingData || !pricingData.stripePriceId) {
        throw new Error('Pricing information is not available. Please try again.');
      }

      // Check if price ID is configured
      if (pricingData.stripePriceId === 'price_XXXXXXXXX') {
        throw new Error('Credit payment is not configured. Please contact support.');
      }

      // Build metadata for the payment
      const coursesToPay = Array.from(selectedCourses);
        
      const metadata = {
        paymentType: 'credits',
        creditsAmount: String(creditQuantity),
        schoolYear: schoolYear || '',
        studentType: studentType || '',
        userEmail: user.email,
        firebaseUID: user.uid,
        coursesToUnlock: coursesToPay.join(','),
        courseCount: String(coursesToPay.length)
      };

      // Create checkout session with line_items for multiple credits
      const sessionData = {
        success_url: `${window.location.origin}/payment/result?session_id={CHECKOUT_SESSION_ID}&type=credits`,
        cancel_url: `${window.location.origin}/payment/cancelled`,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price: pricingData.stripePriceId,
            quantity: creditQuantity
          }
        ],
        metadata: metadata
      };

      // Create checkout session in Firestore
      const customerDocRef = doc(firestore, 'customers', user.uid);
      const checkoutSessionsRef = collection(customerDocRef, 'checkout_sessions');

      const docRef = await addDoc(checkoutSessionsRef, sessionData);

      // Listen for checkout URL
      const unsubscribe = onSnapshot(docRef, (snap) => {
        const data = snap.data();
        if (data?.error) {
          setPaymentError(data.error.message);
          setIsRedirecting(false);
          toast.error(data.error.message);
          unsubscribe();
        } else if (data?.url) {
          // Redirect to Stripe checkout
          window.location.assign(data.url);
        }
      });

      setCheckoutSessionUnsubscribe(() => unsubscribe);

      // Timeout after 2 minutes
      setTimeout(() => {
        unsubscribe();
        setCheckoutSessionUnsubscribe(null);
        setIsRedirecting(false);
        setPaymentError('Checkout session timed out. Please try again.');
      }, 120000);

    } catch (error) {
      console.error('Checkout error:', error);
      setPaymentError(error.message);
      setIsRedirecting(false);
      toast.error('Unable to start checkout process. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Calculate totals based on selected courses - memoized
  const totalPrice = useMemo(() => {
    return pricingData ? creditQuantity * (pricingData.priceInCents / 100) : 0;
  }, [pricingData, creditQuantity]);

  // Get names of selected courses - memoized
  const courseNamesToUnlock = useMemo(() => {
    return paymentOptions
      .filter(opt => selectedCourses.has(opt.id))
      .map(opt => opt.courseName);
  }, [paymentOptions, selectedCourses]);

  // Handle course-based payment selection
  const handleCourseSelection = (courseId) => {
    const course = coursesToPay[courseId];
    if (course) {
      // Create course object in the format PaymentOptionsDialog expects
      const courseForPayment = {
        CourseID: courseId,
        Course: {
          Value: course.courseName || `Course ${courseId}`
        }
      };
      setSelectedCourseForPayment(courseForPayment);
      setShowPaymentOptions(true);
    }
  };

  // If this is course-based payment and we need to show PaymentOptionsDialog
  if (isCourseBased && showPaymentOptions && selectedCourseForPayment) {
    return (
      <PaymentOptionsDialog
        isOpen={true}
        onOpenChange={(open) => {
          if (!open) {
            setShowPaymentOptions(false);
            setSelectedCourseForPayment(null);
            onOpenChange(false); // Close the parent dialog too
          }
        }}
        course={selectedCourseForPayment}
        user={user}
        studentType={sanitizedType}
      />
    );
  }

  // If this is course-based payment, show course selection UI
  if (isCourseBased) {
    const unpaidCoursesList = Object.entries(coursesToPay || {})
      .filter(([_, course]) => !course.isPaid);

    // If only one unpaid course, go directly to payment
    if (unpaidCoursesList.length === 1) {
      const [courseId, course] = unpaidCoursesList[0];
      const courseForPayment = {
        CourseID: courseId,
        Course: {
          Value: course.courseName || `Course ${courseId}`
        }
      };
      
      return (
        <PaymentOptionsDialog
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          course={courseForPayment}
          user={user}
          studentType={sanitizedType}
        />
      );
    }

    // Multiple unpaid courses - show selection UI
    return (
      <>
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
          <SheetContent 
            side="right" 
            size="md"
            className="w-full sm:max-w-md overflow-y-auto"
          >
            <SheetHeader className="mb-6">
              <SheetTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Select Course to Purchase
              </SheetTitle>
              <SheetDescription>
                Choose which course you'd like to pay for. You have {unpaidCoursesList.length} unpaid courses.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-3">
              {unpaidCoursesList.map(([courseId, course]) => {
                const courseOption = COURSE_OPTIONS.find(c => c.courseId === Number(courseId));
                const displayName = courseOption?.label || course.courseName || `Course ${courseId}`;
                const pasiCode = courseOption?.pasiCode;
                
                return (
                  <div 
                    key={courseId}
                    className="p-4 border rounded-lg hover:border-purple-500 hover:bg-purple-50/50 cursor-pointer transition-all"
                    onClick={() => handleCourseSelection(courseId)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {displayName}
                        </h4>
                        {pasiCode && (
                          <p className="text-sm text-gray-500">
                            PASI Code: {pasiCode}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                      >
                        Select
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <SheetFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        
        <LoadingOverlay isVisible={isRedirecting} />
      </>
    );
  }

  // Original credit-based payment flow
  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent 
          side="right" 
          size="md"
          className="w-full sm:max-w-md overflow-y-auto"
        >
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Purchase Course Credits
            </SheetTitle>
            <SheetDescription>
              {mode === 'course' 
                ? `Purchase credits to unlock ${courseName || 'this course'}`
                : 'Purchase credits to unlock your courses'
              }
            </SheetDescription>
          </SheetHeader>

        {pricingLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
            <p className="text-sm text-gray-500">Loading pricing information...</p>
          </div>
        ) : (
        <div className="space-y-6">
          {/* Payment Options Selector */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-base font-semibold">Select Courses to Pay For</Label>
              {paymentOptions.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAll}
                  className="text-xs"
                >
                  {selectedCourses.size === paymentOptions.length ? 'Deselect All' : 'Select All'}
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              {paymentOptions.map((option) => (
                <div 
                  key={option.id}
                  className={`relative flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                    selectedCourses.has(option.id) ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200'
                  }`}
                  onClick={() => toggleCourse(option.id)}
                >
                  <Checkbox 
                    id={option.id}
                    checked={selectedCourses.has(option.id)}
                    onCheckedChange={() => toggleCourse(option.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor={option.id} className="cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <FaGraduationCap className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-gray-900">
                          {option.courseName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {option.credits} credit{option.credits !== 1 ? 's' : ''}
                        </span>
                        <span className="text-lg font-semibold text-gray-900">
                          {formatPrice(option.price)}
                        </span>
                      </div>
                    </label>
                  </div>
                  {selectedCourses.has(option.id) && (
                    <CheckCircle2 className="h-5 w-5 text-blue-600 absolute top-4 right-4" />
                  )}
                </div>
              ))}
            </div>
            
            {paymentOptions.length === 0 && (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  No courses require payment at this time.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Price Summary */}
          {selectedCourses.size > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Selected Courses</p>
                  <p className="text-base font-medium text-gray-900">
                    {selectedCourses.size} course{selectedCourses.size !== 1 ? 's' : ''} • {creditQuantity} credit{creditQuantity !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Price</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(totalPrice)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Courses to be Unlocked */}
          {courseNamesToUnlock.length > 0 && (
            <Alert className="bg-green-50 border-green-200">
              <FaCheck className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <p className="font-semibold mb-1">
                  This payment will unlock:
                </p>
                <ul className="list-disc list-inside text-sm space-y-0.5">
                  {courseNamesToUnlock.map((name, idx) => (
                    <li key={idx}>{name}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Information Alert */}
          <Alert className="bg-blue-50 border-blue-200">
            <FaInfoCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              <ul className="list-disc list-inside space-y-1">
                <li>Credits are valid for the {schoolYear} school year</li>
                <li>Credits are applied to courses in chronological order</li>
                <li>Unused credits can be applied to future courses</li>
                <li>All purchases are final and non-refundable</li>
              </ul>
            </AlertDescription>
          </Alert>

          {paymentError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{paymentError}</AlertDescription>
            </Alert>
          )}
          </div>
        )}

          <SheetFooter className="mt-6 flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={paymentLoading || isRedirecting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCheckout}
              disabled={pricingLoading || paymentLoading || isRedirecting || selectedCourses.size === 0 || creditQuantity === 0}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto"
            >
              {paymentLoading ? (
                <>
                  <FaCreditCard className="mr-2 animate-pulse" />
                  Processing...
                </>
              ) : (
                <>
                  <FaCreditCard className="mr-2" />
                  Pay {formatPrice(totalPrice)}
                </>
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      
      <LoadingOverlay isVisible={isRedirecting} />
    </>
  );
};

export default CreditPaymentDialog;