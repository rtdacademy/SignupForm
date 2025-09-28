import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { InfoIcon, CreditCard, TrendingUp, BookOpen, CheckCircle, XCircle, AlertCircle, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { useAllStudentCredits } from '../hooks/useCreditTracking';
import { COURSE_OPTIONS } from '../config/DropdownOptions';
import { useAuth } from '../context/AuthContext';

// Map database keys back to display names
const getDisplayName = (sanitizedType) => {
  const displayMapping = {
    'nonPrimaryStudents': 'Non-Primary',
    'homeEducationStudents': 'Home Education',
    'summerSchoolStudents': 'Summer School',
    'adultStudents': 'Adult Student',
    'internationalStudents': 'International Student'
  };
  return displayMapping[sanitizedType] || sanitizedType;
};

// Check if student type uses course-based payment (not credit-based)
const isCourseBasedPayment = (sanitizedType) => {
  return sanitizedType === 'adultStudents' || sanitizedType === 'internationalStudents';
};

// Get course names from course IDs
const getCourseNames = (courseIds) => {
  if (!courseIds || !Array.isArray(courseIds)) return '';
  
  const courseNames = courseIds.map(id => {
    const course = COURSE_OPTIONS.find(c => c.courseId === Number(id));
    return course ? course.label : `Course ${id}`;
  });
  
  return courseNames.join(', ');
};

// Get course payment details with names and credits
const getCoursePaymentInfo = (coursePaymentDetails, coursesRequiringPayment) => {
  if (!coursesRequiringPayment || !Array.isArray(coursesRequiringPayment)) return [];
  
  return coursesRequiringPayment.map(id => {
    const course = COURSE_OPTIONS.find(c => c.courseId === Number(id));
    const creditsRequired = coursePaymentDetails?.[id]?.creditsRequiredToUnlock || 0;
    
    return {
      name: course ? course.label : `Course ${id}`,
      creditsRequired: creditsRequired
    };
  });
};

export const CreditSummaryCard = forwardRef(({
  schoolYear,
  compactMode = false,
  fullWidth = false,
  onOpenPaymentDialog  // New prop to handle payment dialog from parent
}, ref) => {
  const { creditsData, loading } = useAllStudentCredits(schoolYear);
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false)
  }), []);
  
  if (loading) {
    if (compactMode) {
      return (
        <Button variant="outline" className="flex items-center gap-2 bg-white shadow-sm" disabled>
          <CreditCard className="h-5 w-5 text-gray-400" />
          <span className="text-sm">Loading...</span>
        </Button>
      );
    }
    return (
      <Alert className="mb-6 bg-gray-50 border-gray-200">
        <InfoIcon className="h-4 w-4 text-gray-500" />
        <AlertDescription>Loading credit information...</AlertDescription>
      </Alert>
    );
  }
  
  // Check if there's any credit data
  const hasCredits = Object.keys(creditsData).length > 0;
  if (!hasCredits) return null;
  
  // Separate credit-based and course-based student types
  const creditBasedData = {};
  const courseBasedData = {};
  
  Object.entries(creditsData).forEach(([sanitizedType, data]) => {
    if (isCourseBasedPayment(sanitizedType)) {
      courseBasedData[sanitizedType] = data;
    } else {
      creditBasedData[sanitizedType] = data;
    }
  });
  
  // Check if any type has limits (only credit-based)
  const hasLimitTypes = Object.values(creditBasedData).some(data => 
    data.freeCreditsLimit !== null && data.freeCreditsLimit !== undefined
  );
  
  // Calculate total credits used and limits for compact view (only credit-based)
  const totalCreditsUsed = Object.values(creditBasedData).reduce((sum, data) => 
    sum + (data.nonExemptCredits || data.freeCreditsUsed || 0), 0
  );
  const totalCreditsLimit = Object.values(creditBasedData).reduce((sum, data) => 
    sum + (data.freeCreditsLimit || 0) + (data.totalPaidCredits || 0), 0
  );
  const totalPaidCreditsRequired = Object.values(creditBasedData).reduce((sum, data) =>
    sum + (data.paidCreditsRequired || 0), 0
  );
  const hasAnyLimit = totalCreditsLimit > 0;
  
  // Calculate course totals for course-based students
  const totalCourses = Object.values(courseBasedData).reduce((sum, data) => 
    sum + (data.totalCourses || 0), 0
  );
  const totalPaidCourses = Object.values(courseBasedData).reduce((sum, data) => 
    sum + (data.paidCourses || 0), 0
  );
  const totalUnpaidCourses = Object.values(courseBasedData).reduce((sum, data) => 
    sum + (data.unpaidCourses || 0), 0
  );
  
  // Determine badge color based on usage
  const getUsageColor = () => {
    if (!hasAnyLimit) return 'blue';
    if (totalCreditsUsed > totalCreditsLimit) return 'red';
    const usagePercentage = (totalCreditsUsed / totalCreditsLimit) * 100;
    if (usagePercentage > 100) return 'red';
    if (usagePercentage === 100) return 'blue';
    if (usagePercentage >= 75) return 'yellow';
    return 'blue';
  };
  
  const usageColor = getUsageColor();
  
  // Compact mode - using Popover
  if (compactMode) {
    // Determine what to show in compact mode
    const showCredits = Object.keys(creditBasedData).length > 0;
    const showCourses = Object.keys(courseBasedData).length > 0;
    const showBoth = showCredits && showCourses;
    
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className={`h-10 flex items-center gap-2 bg-white shadow-sm hover:bg-gray-50 px-3 ${fullWidth ? 'w-full justify-between' : ''}`}
          >
            <div className="relative">
              {showBoth ? (
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-400 mx-0.5">/</span>
                  <BookOpen className="h-5 w-5 text-gray-600" />
                </div>
              ) : showCourses ? (
                <BookOpen className="h-5 w-5 text-gray-600" />
              ) : (
                <CreditCard className="h-5 w-5 text-gray-600" />
              )}
              {((hasAnyLimit && totalCreditsUsed > totalCreditsLimit) || totalUnpaidCourses > 0) && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
            <div className="flex items-center gap-2">
              {showCredits && (
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">Credits</span>
                  {hasAnyLimit ? (
                    <>
                      <span className={`px-1.5 py-0.5 ${
                        usageColor === 'red' ? 'bg-red-100 text-red-700' :
                        usageColor === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      } rounded text-xs font-semibold`}>
                        {totalCreditsUsed}
                      </span>
                      <span className="text-gray-400 text-xs">/</span>
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-semibold">
                        {totalCreditsLimit}
                      </span>
                    </>
                  ) : totalCreditsUsed > 0 && (
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                      {totalCreditsUsed}
                    </span>
                  )}
                </div>
              )}
              {showBoth && <span className="text-gray-400 text-xs">|</span>}
              {showCourses && (
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">Courses</span>
                  <span className={`px-1.5 py-0.5 ${
                    totalUnpaidCourses > 0 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                  } rounded text-xs font-semibold`}>
                    {totalPaidCourses}/{totalCourses}
                  </span>
                </div>
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96" align="start">
          <div className="p-2">
              <div className="mb-3 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-500" />
                <strong className="text-gray-700">Credit Usage</strong>
                <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full font-medium">
                  {schoolYear}
                </span>
              </div>
              
              {Object.entries(creditsData).map(([sanitizedType, data]) => {
                const displayName = getDisplayName(sanitizedType);
                const isCourseBased = isCourseBasedPayment(sanitizedType);
                
                // For course-based, check if there are courses
                if (isCourseBased && (!data.totalCourses || data.totalCourses === 0)) return null;
                
                // For credit-based, check credits or limits
                const hasLimit = !isCourseBased && data.freeCreditsLimit !== null && data.freeCreditsLimit !== undefined;
                if (!isCourseBased && !hasLimit && data.totalCredits === 0) return null;
                
                const creditsUsed = data.nonExemptCredits || data.freeCreditsUsed || 0;
                const effectiveLimit = (data.freeCreditsLimit || 0) + (data.totalPaidCredits || 0);
                const usagePercentage = hasLimit ? (creditsUsed / effectiveLimit) * 100 : 0;
                
                return (
                  <div key={sanitizedType} className="mb-3 p-3 bg-white rounded-lg border border-gray-100">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-700">{displayName}</span>
                          {isCourseBased && (
                            <BookOpen className="h-4 w-4 text-purple-500" />
                          )}
                        </div>
                        
                        {isCourseBased ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Courses:</span>
                              <div className="flex items-center gap-1">
                                <span className={`px-2 py-0.5 ${
                                  data.unpaidCourses > 0 
                                    ? 'bg-orange-100 text-orange-700' 
                                    : 'bg-green-100 text-green-700'
                                } rounded-md text-sm font-semibold`}>
                                  {data.paidCourses || 0} paid
                                </span>
                                <span className="text-gray-400 text-sm">/</span>
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-sm font-semibold">
                                  {data.totalCourses || 0} total
                                </span>
                              </div>
                            </div>
                            
                            {/* Show course list if available */}
                            {data.courses && Object.keys(data.courses).length > 0 && (
                              <div className="mt-2 space-y-1">
                                {Object.entries(data.courses).map(([courseId, courseData]) => (
                                  <div key={courseId} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1">
                                      {courseData.isPaid ? (
                                        <CheckCircle className="h-3 w-3 text-green-600" />
                                      ) : (
                                        <XCircle className="h-3 w-3 text-orange-600" />
                                      )}
                                      <span className="text-gray-700">
                                        {(() => {
                                          const course = COURSE_OPTIONS.find(c => c.courseId === Number(courseId));
                                          // Use COURSE_OPTIONS label if available, otherwise fall back to courseName
                                          const name = course?.label || courseData.courseName || `Course ${courseId}`;
                                          const pasiCode = course?.pasiCode;
                                          return pasiCode ? `${name} (${pasiCode})` : name;
                                        })()}
                                      </span>
                                    </div>
                                    {!courseData.isPaid && (
                                      <span className="text-orange-600 font-medium">Unpaid</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Show payment button if there are unpaid courses */}
                            {data.unpaidCourses > 0 && (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('[CreditSummaryCard] Course payment button clicked', {
                                    unpaidCourses: data.unpaidCourses,
                                    courses: data.courses,
                                    currentUser,
                                    sanitizedType,
                                    hasHandler: !!onOpenPaymentDialog
                                  });

                                  if (!currentUser) {
                                    console.error('[CreditSummaryCard] No user logged in');
                                    return;
                                  }

                                  // Call the parent handler if provided
                                  if (onOpenPaymentDialog) {
                                    console.log('[CreditSummaryCard] Calling onOpenPaymentDialog with payment data');
                                    onOpenPaymentDialog({
                                      coursesToPay: data.courses,
                                      unpaidCourses: data.unpaidCourses,
                                      studentType: displayName,
                                      sanitizedType: sanitizedType,
                                      schoolYear: schoolYear,
                                      user: currentUser,
                                      isCourseBased: true
                                    });
                                    setIsOpen(false);
                                  } else {
                                    console.error('[CreditSummaryCard] No onOpenPaymentDialog handler provided');
                                  }
                                }}
                                disabled={!currentUser || !onOpenPaymentDialog}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs"
                              >
                                <CreditCard className="h-3 w-3 mr-1" />
                                Pay for {data.unpaidCourses} Course{data.unpaidCourses > 1 ? 's' : ''}
                              </Button>
                            )}
                          </div>
                        ) : hasLimit ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Credits:</span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1 cursor-help">
                                      <span className={`px-2 py-0.5 ${
                                        creditsUsed > effectiveLimit 
                                          ? 'bg-red-100 text-red-700' 
                                          : 'bg-blue-100 text-blue-700'
                                      } rounded-md text-sm font-semibold`}>
                                        {creditsUsed}
                                      </span>
                                      <span className="text-gray-400 text-sm">/</span>
                                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-sm font-semibold">
                                        {effectiveLimit}
                                      </span>
                                      {data.additionalFreeCredits > 0 && (
                                        <Zap className="h-3 w-3 text-yellow-600 ml-1" />
                                      )}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-gray-900 text-white">
                                    <div className="space-y-1">
                                      <div>Base Free Credits: {data.baseFreeCreditsLimit || 10}</div>
                                      {data.additionalFreeCredits > 0 && (
                                        <div className="text-yellow-400">Override Credits: +{data.additionalFreeCredits}</div>
                                      )}
                                      {data.totalPaidCredits > 0 && (
                                        <div className="text-green-400">Paid Credits: +{data.totalPaidCredits}</div>
                                      )}
                                      <div className="border-t pt-1 mt-1 font-semibold">
                                        Total Limit: {effectiveLimit}
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            
                            {/* Show payment info if over limit */}
                            {data.paidCreditsRequired > 0 && (
                              <div className="space-y-2">
                                <div className="text-xs text-orange-700 bg-orange-50 px-2 py-1 rounded-md">
                                  {data.paidCreditsRequired} credit{data.paidCreditsRequired > 1 ? 's' : ''} require payment
                                </div>
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Compact payment button clicked', {
                                      creditsRequired: data.paidCreditsRequired,
                                      coursesToUnlock: data.coursesRequiringPayment,
                                      currentUser,
                                      sanitizedType
                                    });
                                    
                                    if (!currentUser) {
                                      console.error('No user logged in');
                                      return;
                                    }
                                    
                                    // Call the parent handler if provided
                                    if (onOpenPaymentDialog) {
                                      onOpenPaymentDialog({
                                        creditsRequired: data.paidCreditsRequired,
                                        coursesToUnlock: data.coursesRequiringPayment || [],
                                        coursePaymentDetails: data.coursePaymentDetails || {},
                                        studentType: displayName,
                                        sanitizedType: sanitizedType,
                                        schoolYear: schoolYear,
                                        user: currentUser
                                      });
                                      setIsOpen(false);
                                    }
                                  }}
                                  disabled={!currentUser || !onOpenPaymentDialog}
                                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs"
                                >
                                  <CreditCard className="h-3 w-3 mr-1" />
                                  Pay for {data.paidCreditsRequired} Credit{data.paidCreditsRequired > 1 ? 's' : ''}
                                </Button>
                              </div>
                            )}
                            
                            {/* Progress bar */}
                            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-300 ${
                                  usagePercentage > 100 
                                    ? 'bg-red-500' 
                                    : usagePercentage === 100 
                                    ? 'bg-blue-500' 
                                    : usagePercentage >= 75 
                                    ? 'bg-yellow-500' 
                                    : 'bg-blue-500'
                                }`}
                                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Total:</span>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-sm font-semibold">
                              {data.totalCredits}
                            </span>
                            <span className="text-sm text-gray-600">credits</span>
                          </div>
                        )}
                      </div>
                      
                      {hasLimit && (
                        <div className="ml-4">
                          {data.paidCreditsRequired > 0 ? (
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-red-50 border border-red-200 rounded-md">
                                <CreditCard className="h-3 w-3 text-red-600" />
                                <span className="text-[11px] font-medium text-red-700">
                                  {data.paidCreditsRequired} over
                                </span>
                              </div>
                              {data.coursesRequiringPayment && data.coursesRequiringPayment.length > 0 && (
                                <div className="text-[9px] text-gray-600 px-1">
                                  {getCoursePaymentInfo(data.coursePaymentDetails, data.coursesRequiringPayment).map((course, idx) => (
                                    <div key={idx}>
                                      {course.name}: {course.creditsRequired} over
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (data.remainingFreeCredits || 0) > 0 ? (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-green-50 border border-green-200 rounded-md">
                              <TrendingUp className="h-3 w-3 text-green-600" />
                              <span className="text-[11px] font-medium text-green-700">
                                {data.remainingFreeCredits} left
                              </span>
                            </div>
                          ) : data.totalPaidCredits > 0 ? (
                            // Don't show any badge if they've paid for credits (they're within their paid limit)
                            null
                          ) : (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-orange-50 border border-orange-200 rounded-md">
                              <InfoIcon className="h-3 w-3 text-orange-600" />
                              <span className="text-[11px] font-medium text-orange-700">
                                At limit
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </PopoverContent>
      </Popover>
    );
  }
  
  return (
    <>
    <Alert className={`mb-6 ${hasLimitTypes ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
      <CreditCard className={`h-4 w-4 ${hasLimitTypes ? 'text-blue-500' : 'text-gray-500'}`} />
      <AlertDescription>
        <div className="mb-3 flex items-center gap-2">
          <strong className="text-gray-700">Credit Usage</strong>
          <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full font-medium">
            {schoolYear}
          </span>
        </div>
        {Object.entries(creditsData).map(([sanitizedType, data]) => {
          const displayName = getDisplayName(sanitizedType);
          const isCourseBased = isCourseBasedPayment(sanitizedType);
          
          // For course-based, check if there are courses
          if (isCourseBased && (!data.totalCourses || data.totalCourses === 0)) return null;
          
          // For credit-based, check credits or limits
          const hasLimit = !isCourseBased && data.freeCreditsLimit !== null && data.freeCreditsLimit !== undefined;
          if (!isCourseBased && !hasLimit && data.totalCredits === 0) return null;
          
          const creditsUsed = data.nonExemptCredits || data.freeCreditsUsed || data.totalCredits || 0;
          const effectiveLimit = (data.freeCreditsLimit || 0) + (data.totalPaidCredits || 0);
          const usagePercentage = hasLimit ? (creditsUsed / effectiveLimit) * 100 : 0;
          
          return (
            <div key={sanitizedType} className="mb-3 p-3 bg-white rounded-lg border border-gray-100">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-700">{displayName}</span>
                    {isCourseBased && (
                      <BookOpen className="h-4 w-4 text-purple-500" />
                    )}
                  </div>
                  
                  {isCourseBased ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Courses:</span>
                        <div className="flex items-center gap-1">
                          <span className={`px-2 py-0.5 ${
                            data.unpaidCourses > 0 
                              ? 'bg-orange-100 text-orange-700' 
                              : 'bg-green-100 text-green-700'
                          } rounded-md text-sm font-semibold`}>
                            {data.paidCourses || 0} paid
                          </span>
                          <span className="text-gray-400 text-sm">/</span>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-sm font-semibold">
                            {data.totalCourses || 0} total
                          </span>
                        </div>
                      </div>
                      
                      {/* Show course list if available */}
                      {data.courses && Object.keys(data.courses).length > 0 && (
                        <div className="mt-2 space-y-1.5">
                          {Object.entries(data.courses).map(([courseId, courseData]) => (
                            <div key={courseId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center gap-2">
                                {courseData.isPaid ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-orange-600" />
                                )}
                                <span className="text-sm text-gray-700">
                                  {(() => {
                                    const course = COURSE_OPTIONS.find(c => c.courseId === Number(courseId));
                                    // Use COURSE_OPTIONS label if available, otherwise fall back to courseName
                                    const name = course?.label || courseData.courseName || `Course ${courseId}`;
                                    const pasiCode = course?.pasiCode;
                                    return pasiCode ? `${name} (${pasiCode})` : name;
                                  })()}
                                </span>
                              </div>
                              {!courseData.isPaid && (
                                <span className="text-sm text-orange-600 font-medium">Payment Required</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Show payment button if there are unpaid courses */}
                      {data.unpaidCourses > 0 && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Course payment button clicked (full mode)', {
                              unpaidCourses: data.unpaidCourses,
                              courses: data.courses,
                              currentUser,
                              sanitizedType
                            });
                            
                            if (!currentUser) {
                              console.error('No user logged in');
                              return;
                            }
                            
                            // Call the parent handler if provided
                            if (onOpenPaymentDialog) {
                              onOpenPaymentDialog({
                                coursesToPay: data.courses,
                                unpaidCourses: data.unpaidCourses,
                                studentType: displayName,
                                sanitizedType: sanitizedType,
                                schoolYear: schoolYear,
                                user: currentUser,
                                isCourseBased: true
                              });
                            }
                          }}
                          disabled={!currentUser || !onOpenPaymentDialog}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pay for {data.unpaidCourses} Course{data.unpaidCourses > 1 ? 's' : ''}
                        </Button>
                      )}
                    </div>
                  ) : hasLimit ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Credits:</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1 cursor-help">
                                <span className={`px-2 py-0.5 ${
                                  creditsUsed > effectiveLimit 
                                    ? 'bg-red-100 text-red-700' 
                                    : 'bg-blue-100 text-blue-700'
                                } rounded-md text-sm font-semibold`}>
                                  {creditsUsed}
                                </span>
                                <span className="text-gray-400 text-sm">/</span>
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-sm font-semibold">
                                  {effectiveLimit}
                                </span>
                                {data.additionalFreeCredits > 0 && (
                                  <Zap className="h-3 w-3 text-yellow-600 ml-1" />
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-gray-900 text-white">
                              <div className="space-y-1">
                                <div>Base Free Credits: {data.baseFreeCreditsLimit || 10}</div>
                                {data.additionalFreeCredits > 0 && (
                                  <div className="text-yellow-400">Override Credits: +{data.additionalFreeCredits}</div>
                                )}
                                {data.totalPaidCredits > 0 && (
                                  <div className="text-green-400">Paid Credits: +{data.totalPaidCredits}</div>
                                )}
                                <div className="border-t pt-1 mt-1 font-semibold">
                                  Total Limit: {effectiveLimit}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      
                      {/* Show payment info if over limit */}
                      {data.paidCreditsRequired > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs text-orange-700 bg-orange-50 px-2 py-1 rounded-md">
                            {data.paidCreditsRequired} credit{data.paidCreditsRequired > 1 ? 's' : ''} require payment
                          </div>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Payment button clicked', {
                                creditsRequired: data.paidCreditsRequired,
                                coursesToUnlock: data.coursesRequiringPayment,
                                currentUser,
                                sanitizedType
                              });
                              
                              if (!currentUser) {
                                console.error('No user logged in');
                                return;
                              }
                              
                              // Call the parent handler if provided
                              if (onOpenPaymentDialog) {
                                onOpenPaymentDialog({
                                  creditsRequired: data.paidCreditsRequired,
                                  coursesToUnlock: data.coursesRequiringPayment || [],
                                  coursePaymentDetails: data.coursePaymentDetails || {},
                                  studentType: displayName,
                                  sanitizedType: sanitizedType,
                                  schoolYear: schoolYear,
                                  user: currentUser
                                });
                              }
                            }}
                            disabled={!currentUser || !onOpenPaymentDialog}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Pay for {data.paidCreditsRequired} Credit{data.paidCreditsRequired > 1 ? 's' : ''}
                          </Button>
                        </div>
                      )}
                      
                      {/* Progress bar */}
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            usagePercentage > 100 
                              ? 'bg-red-500' 
                              : usagePercentage >= 100 
                              ? 'bg-orange-500' 
                              : usagePercentage >= 75 
                              ? 'bg-yellow-500' 
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Total:</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-sm font-semibold">
                        {data.totalCredits}
                      </span>
                      <span className="text-sm text-gray-600">credits</span>
                    </div>
                  )}
                </div>
                
                {isCourseBased && (
                  <div className="ml-4">
                    {data.unpaidCourses > 0 ? (
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-50 border border-orange-200 rounded-md">
                        <AlertCircle className="h-3.5 w-3.5 text-orange-600" />
                        <span className="text-xs font-medium text-orange-700">
                          {data.unpaidCourses} unpaid
                        </span>
                      </div>
                    ) : data.totalCourses > 0 ? (
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 border border-green-200 rounded-md">
                        <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                        <span className="text-xs font-medium text-green-700">
                          All paid
                        </span>
                      </div>
                    ) : null}
                  </div>
                )}
                
                {hasLimit && (
                  <div className="ml-4">
                    {data.paidCreditsRequired > 0 ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 border border-red-200 rounded-md">
                          <CreditCard className="h-3.5 w-3.5 text-red-600" />
                          <span className="text-xs font-medium text-red-700">
                            {data.paidCreditsRequired} credit{data.paidCreditsRequired > 1 ? 's' : ''} over
                          </span>
                        </div>
                        {data.coursesRequiringPayment && data.coursesRequiringPayment.length > 0 && (
                          <div className="text-[10px] text-gray-600 px-1 space-y-0.5">
                            {getCoursePaymentInfo(data.coursePaymentDetails, data.coursesRequiringPayment).map((course, idx) => (
                              <div key={idx}>
                                {course.name}: {course.creditsRequired} credit{course.creditsRequired !== 1 ? 's' : ''} over
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (data.remainingFreeCredits || 0) > 0 ? (
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 border border-green-200 rounded-md">
                        <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                        <span className="text-xs font-medium text-green-700">
                          {data.remainingFreeCredits} left
                        </span>
                      </div>
                    ) : data.totalPaidCredits > 0 ? (
                      // Don't show any badge if they've paid for credits (they're within their paid limit)
                      null
                    ) : (
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-50 border border-orange-200 rounded-md">
                        <InfoIcon className="h-3.5 w-3.5 text-orange-600" />
                        <span className="text-xs font-medium text-orange-700">
                          At limit
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </AlertDescription>
    </Alert>
    </>
  );
});

CreditSummaryCard.displayName = 'CreditSummaryCard';