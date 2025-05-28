import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../context/AuthContext';
import Header from '../Layout/Header';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import AddressPicker from '../components/AddressPicker';
import { 
  Users, 
  GraduationCap, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  ChevronRight,
  User,
  Calendar,
  BookOpen,
  CreditCard,
  Loader2,
  X,
  RefreshCw,
  UserCircle,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import CourseCard from '../Dashboard/CourseCard';
import { ImportantDatesCard } from '../Dashboard/ImportantDatesCard';
import NotificationCenter from '../Dashboard/NotificationCenter';
import { toast } from 'sonner';
import { 
  ProfileCompletionTracker
} from '../Registration/studentProperties';
import { calculateCompletionStats } from '../Registration/studentProperties/studentRequirements';
import { getStudentTypeInfo, getCourseInfo } from '../config/DropdownOptions';

/**
 * Parent Dashboard Color Theme - Matching Main Dashboard
 * 
 * Primary: Blue to Purple gradients - from-blue-50 to-indigo-50, from-blue-600 to-purple-600
 * Cards: Clean white with gray borders and hover shadow effects
 * Text: Standard gray for readability
 * Buttons: Gradient blue-purple theme matching main dashboard
 * Icons: Blue-600 for consistency
 */

/**
 * Determine if student information accordion should be expanded by default
 * Expanded if any required or PASI required information is missing
 */
const shouldExpandAccordionByDefault = (student) => {
  if (!student?.profile) return false;
  
  try {
    const completionStats = calculateCompletionStats(student);
    // Expand if required completion is less than 100%
    return completionStats.requiredCompletionPercentage < 100;
  } catch (error) {
    console.warn('Error calculating completion stats:', error);
    return false; // Default to closed if there's an error
  }
};

/**
 * Check if parent has made any enrollment decisions (approved or declined any courses)
 * Returns true if any course has been approved or declined
 */
const hasParentMadeEnrollmentDecisions = (student) => {
  if (!student?.enrollmentApproval?.courses) return false;
  
  return Object.values(student.enrollmentApproval.courses).some(
    course => course.approved || course.denied
  );
};

/**
 * Format ASN input - matching NonPrimaryStudentForm.js implementation
 */
const formatASN = (value) => {
  // Remove all non-digits and limit to 9 digits
  let formattedValue = value.replace(/\D/g, "").slice(0, 9);
  
  // Apply ####-####-# format
  if (formattedValue.length > 4) {
    formattedValue = `${formattedValue.slice(0, 4)}-${formattedValue.slice(4)}`;
  }
  if (formattedValue.length > 9) {
    formattedValue = `${formattedValue.slice(0, 9)}-${formattedValue.slice(9)}`;
  }
  
  return formattedValue;
};

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [parentData, setParentData] = useState(null);
  const [selectedStudentKey, setSelectedStudentKey] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showLMS, setShowLMS] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [, forceUpdate] = useState({});
  
  // Verification dialog state
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [pendingInvitation, setPendingInvitation] = useState(null);
  const [verificationType, setVerificationType] = useState('asn');
  const [asnInput, setAsnInput] = useState('');
  const [addressInput, setAddressInput] = useState(null);
  const [verificationError, setVerificationError] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Debug effect to monitor dialog state
  useEffect(() => {
    console.log('=== State Debug ===');
    console.log('showVerificationDialog:', showVerificationDialog);
    console.log('pendingInvitation:', pendingInvitation);
    console.log('pendingInvitation?.token:', pendingInvitation?.token);
    console.log('verificationType:', verificationType);
    console.log('==================');
  }, [showVerificationDialog, pendingInvitation, verificationType]);

  // Function to fetch parent data
  const fetchParentData = async (showToast = true) => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      const functions = getFunctions();
      const getParentDashboardData = httpsCallable(functions, 'getParentDashboardData');
      
      const result = await getParentDashboardData();
      
      if (result.data.success) {
        setParentData(result.data);
        
        // Debug: Log the raw student data to console
        if (result.data.linkedStudents && result.data.linkedStudents.length > 0) {
          console.log('Raw student data from cloud function:', result.data.linkedStudents[0]);
        }
        
        // Set the first linked student as selected by default
        if (result.data.linkedStudents && result.data.linkedStudents.length > 0) {
          setSelectedStudentKey(result.data.linkedStudents[0].studentEmailKey);
        }
        
        if (showToast) {
          toast.success('Dashboard loaded successfully');
        }
      } else {
        const errorMessage = result.data.message || 'Failed to load parent dashboard data';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error('Error fetching parent data:', err);
      const errorMessage = err.message || 'Failed to load parent dashboard';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch parent dashboard data when component mounts
  useEffect(() => {
    fetchParentData();
  }, [currentUser]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      navigate('/parent-login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  }, [signOut, navigate]);

  const handleBackClick = useCallback(() => {
    if (showLMS) {
      setShowLMS(false);
      setSelectedCourse(null);
    } else if (selectedCourse) {
      setSelectedCourse(null);
    }
  }, [showLMS, selectedCourse]);

  const showBackButton = showLMS || selectedCourse;

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    const refreshToastId = toast.loading('Refreshing dashboard...');
    await fetchParentData(false);
    toast.dismiss(refreshToastId);
    toast.success('Dashboard refreshed successfully');
  };

  // Get currently selected student
  const selectedStudent = parentData?.linkedStudents?.find(
    student => student.studentEmailKey === selectedStudentKey
  );

  // Handle updates from student properties editors
  const handleStudentDataUpdate = useCallback((updatedStudentData) => {
    // Update the local state with the new data
    setParentData(prev => ({
      ...prev,
      linkedStudents: prev.linkedStudents.map(student => 
        student.studentEmailKey === updatedStudentData.studentEmailKey 
          ? updatedStudentData 
          : student
      )
    }));
    
    // Show success toast
    toast.success('Student information updated successfully');
  }, []);

  // Get pending approvals count
  const pendingApprovalsCount = parentData?.linkedStudents?.reduce((count, student) => {
    if (!student.permissions.approveEnrollment) return count;
    return count + Object.values(student.enrollmentApproval?.courses || {}).filter(
      course => !course.approved && !course.denied
    ).length;
  }, 0) || 0;
  
  // Filter out notification-only invitations (these are for already-linked students adding new courses)
  // These courses will appear in the pending approvals section, so we don't need to show them as invitations
  const realInvitations = parentData?.pendingInvitations?.filter(inv => !inv.notificationOnly) || [];

  // Handle accepting pending invitation
  const handleAcceptInvitation = (invitation) => {
    console.log('handleAcceptInvitation called with:', invitation);
    console.log('Current showVerificationDialog state:', showVerificationDialog);
    
    // Set all the state values
    setPendingInvitation(invitation);
    setVerificationType('asn'); // Default to ASN
    setAsnInput('');
    setAddressInput(null);
    setVerificationError('');
    setShowVerificationDialog(true);
    
    console.log('All states set. Invitation token:', invitation.token);
    
    // Force a re-render after a small delay
    setTimeout(() => {
      forceUpdate({});
      console.log('Forced re-render');
    }, 100);
  };

  // Verify and accept invitation
  const verifyAndAcceptInvitation = async () => {
    setVerificationError('');
    setVerifying(true);

    try {
      // Validate input
      if (verificationType === 'asn' && !asnInput.trim()) {
        setVerificationError('Please enter the student\'s Alberta Student Number');
        setVerifying(false);
        return;
      }
      if (verificationType === 'address' && !addressInput) {
        setVerificationError('Please select the student\'s home address');
        setVerifying(false);
        return;
      }

      const functions = getFunctions();
      const verifyStudentASN = httpsCallable(functions, 'verifyStudentASN');
      
      const verificationData = {
        invitationToken: pendingInvitation.token,
        verificationType
      };
      
      if (verificationType === 'asn') {
        verificationData.providedASN = asnInput.trim();
      } else {
        verificationData.providedAddress = addressInput;
      }
      
      const verifyResult = await verifyStudentASN(verificationData);
      
      if (verifyResult.data.success) {
        // Now accept the invitation
        const acceptParentInvitation = httpsCallable(functions, 'acceptParentInvitation');
        const acceptResult = await acceptParentInvitation({ invitationToken: pendingInvitation.token });
        
        if (acceptResult.data.success) {
          toast.success(`Successfully linked to ${acceptResult.data.studentName}!`);
          setShowVerificationDialog(false);
          setPendingInvitation(null);
          setAsnInput('');
          setAddressInput(null);
          // Refresh dashboard data
          await fetchParentData(false);
        } else {
          throw new Error('Failed to accept invitation');
        }
      } else {
        throw new Error('Verification failed');
      }
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setVerificationError(err.message || 'Failed to verify student information. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  // Handle course approval
  const handleCourseApproval = async (studentKey, courseId, approved) => {
    // Set loading state for this specific course and action (approve or decline)
    const loadingKey = `${studentKey}-${courseId}-${approved ? 'approve' : 'decline'}`;
    setApprovalLoading(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      const functions = getFunctions();
      const approveStudentEnrollment = httpsCallable(functions, 'approveStudentEnrollment');
      
      // Show loading toast
      const loadingToastId = toast.loading(
        approved ? 'Approving enrollment...' : 'Declining enrollment...'
      );
      
      const result = await approveStudentEnrollment({
        studentEmailKey: studentKey,
        courseId: parseInt(courseId),
        approved
      });
      
      if (result.data.success) {
        // Dismiss loading toast and show success
        toast.dismiss(loadingToastId);
        toast.success(
          approved 
            ? '✅ Course enrollment approved successfully! The student\'s registration will be submitted to Alberta Education.' 
            : '❌ Course enrollment declined. The student can still access the course but won\'t be registered with PASI.'
        );
        
        // Update local state
        setParentData(prev => ({
          ...prev,
          linkedStudents: prev.linkedStudents.map(student => {
            if (student.studentEmailKey === studentKey) {
              return {
                ...student,
                enrollmentApproval: {
                  ...student.enrollmentApproval,
                  courses: {
                    ...student.enrollmentApproval.courses,
                    [courseId]: {
                      ...student.enrollmentApproval.courses[courseId],
                      approved,
                      denied: !approved,
                      approvedAt: new Date().toISOString()
                    }
                  }
                }
              };
            }
            return student;
          })
        }));
      } else {
        toast.dismiss(loadingToastId);
        throw new Error(result.data.message || 'Failed to process approval');
      }
    } catch (err) {
      console.error('Error approving enrollment:', err);
      toast.error(`❌ ${err.message || 'Failed to process enrollment approval'}`);
    } finally {
      // Clear loading state
      setApprovalLoading(prev => {
        const newState = { ...prev };
        const loadingKey = `${studentKey}-${courseId}-${approved ? 'approve' : 'decline'}`;
        delete newState[loadingKey];
        return newState;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <Header 
          user={currentUser}
          onLogout={handleLogout}
          onBackClick={null}
          onDashboardClick={() => {}}
          portalType="Parent Portal"
          isEmulating={false}
          isStaffUser={false}
          parentInfo={null}
        />
        <div className="flex justify-center items-center flex-1">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading parent dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen">
        <Header 
          user={currentUser}
          onLogout={handleLogout}
          onBackClick={null}
          onDashboardClick={() => {}}
          portalType="Parent Portal"
          isEmulating={false}
          isStaffUser={false}
          parentInfo={null}
        />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!parentData || !parentData.linkedStudents || parentData.linkedStudents.length === 0) {
    return (
      <div className="flex flex-col h-screen">
        <Header 
          user={currentUser}
          onLogout={handleLogout}
          onBackClick={null}
          onDashboardClick={() => {}}
          portalType="Parent Portal"
          isEmulating={false}
          isStaffUser={false}
          parentInfo={null}
        />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Welcome message for new parents */}
          <Card className="mb-6">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6 text-purple-600" />
                Welcome to the RTD Academy Parent Portal!
              </h1>
            </CardHeader>
            <CardContent className="p-6">
              {parentData?.message && (
                <Alert className="mb-4 bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {parentData.message}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-4">
                <p className="text-gray-700">
                  The Parent Portal is a new feature that allows you to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>✅ Approve your child's course enrollments</li>
                  <li>✅ Access important school information</li>
                  <li className="text-gray-400">🔄 View grades and progress (coming soon)</li>
                  <li className="text-gray-400">🔄 Access course schedules (coming soon)</li>
                  <li className="text-gray-400">🔄 Update contact information (coming soon)</li>
                  <li className="text-gray-400">🔄 Communicate with teachers (coming soon)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Pending Invitations - Already filtered */}
          {realInvitations.length > 0 && (
            <Card className="mb-6 border-purple-200">
              <CardHeader className="bg-purple-50">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-purple-600" />
                  Pending Student Invitations
                </h2>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  You have pending invitations to link to the following students:
                </p>
                <div className="space-y-3">
                  {realInvitations.map((invitation) => (
                    <div key={invitation.token}>
                      {/* Show invitation or verification form based on state */}
                      {pendingInvitation?.token === invitation.token && showVerificationDialog ? (
                        /* Inline Verification Form */
                        <Card className="border-2 border-purple-500 shadow-lg">
                          <CardHeader className="bg-purple-50">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-green-600" />
                                Verify Student Information
                              </h3>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setShowVerificationDialog(false);
                                  setPendingInvitation(null);
                                  setAsnInput('');
                                  setAddressInput(null);
                                  setVerificationError('');
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div>
                                <p className="text-gray-700">
                                  To protect student privacy, please verify <strong>{invitation.studentName}</strong>'s identity before linking accounts.
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  Course: {invitation.courseName}
                                </p>
                              </div>

                              {/* Verification Type Selector */}
                              <div className="space-y-2">
                                <Label>Verification Method</Label>
                                <div className="grid grid-cols-2 gap-3">
                                  <Button
                                    type="button"
                                    variant={verificationType === 'asn' ? 'default' : 'outline'}
                                    onClick={() => {
                                      setVerificationType('asn');
                                      setVerificationError('');
                                    }}
                                    className="justify-start"
                                  >
                                    <ShieldCheck className="h-4 w-4 mr-2" />
                                    ASN Number
                                  </Button>
                                  <Button
                                    type="button"
                                    variant={verificationType === 'address' ? 'default' : 'outline'}
                                    onClick={() => {
                                      setVerificationType('address');
                                      setVerificationError('');
                                    }}
                                    className="justify-start"
                                  >
                                    <MapPin className="h-4 w-4 mr-2" />
                                    Home Address
                                  </Button>
                                </div>
                              </div>

                              {/* ASN Verification */}
                              {verificationType === 'asn' && (
                                <>
                                  <div className="space-y-2">
                                    <Label htmlFor="asn">Alberta Student Number</Label>
                                    <Input
                                      id="asn"
                                      type="text"
                                      placeholder="0000-0000-0"
                                      value={asnInput}
                                      onChange={(e) => setAsnInput(formatASN(e.target.value))}
                                      maxLength={11}
                                      className="font-mono"
                                      autoComplete="off"
                                    />
                                    <p className="text-xs text-gray-500">Format: ####-####-#</p>
                                  </div>
                                  
                                  <div className="bg-blue-50 p-3 rounded-lg text-sm">
                                    <p className="font-medium text-blue-900 mb-1">What is an ASN?</p>
                                    <p className="text-blue-700">The Alberta Student Number is a unique 9-digit identifier found on report cards and official school documents.</p>
                                    <p className="text-blue-700 mt-2">
                                      Need help finding your child's ASN? 
                                      <a 
                                        href="https://learnerregistry.ae.alberta.ca/home/startlookup" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline hover:text-blue-800 font-medium ml-1"
                                      >
                                        Look it up on Alberta Education's website
                                      </a>
                                    </p>
                                  </div>
                                </>
                              )}

                              {/* Address Verification */}
                              {verificationType === 'address' && (
                                <div className="space-y-2">
                                  <Label>Home Address</Label>
                                  <AddressPicker 
                                    onAddressSelect={setAddressInput}
                                    studentType="Parent Verification"
                                  />
                                  {addressInput && (
                                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                      <p className="text-gray-600">Selected: {addressInput.fullAddress}</p>
                                    </div>
                                  )}
                                  <p className="text-xs text-gray-500">Please select the exact address the student used during registration</p>
                                </div>
                              )}

                              {/* Error Display */}
                              {verificationError && (
                                <Alert variant="destructive">
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertDescription>{verificationError}</AlertDescription>
                                </Alert>
                              )}

                              {/* Action Buttons */}
                              <div className="flex gap-2 justify-end pt-4">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setShowVerificationDialog(false);
                                    setPendingInvitation(null);
                                    setAsnInput('');
                                    setAddressInput(null);
                                    setVerificationError('');
                                  }}
                                  disabled={verifying}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={verifyAndAcceptInvitation}
                                  disabled={verifying || (verificationType === 'asn' ? !asnInput.trim() : !addressInput)}
                                >
                                  {verifying ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Verifying...
                                    </>
                                  ) : (
                                    'Verify & Link'
                                  )}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        /* Normal Invitation Display */
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{invitation.studentName}</p>
                              <p className="text-sm text-gray-600">Course: {invitation.courseName}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700"
                              onClick={() => handleAcceptInvitation(invitation)}
                            >
                              Accept Invitation
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* How to Link Students */}
          <Card className="border-blue-200">
            <CardHeader className="bg-blue-50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                How to Link to Your Child's Account
              </h2>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Option 1: Through Student Registration</h3>
                  <p className="text-sm text-gray-600">
                    When your child registers for a course, they can enter your email address. 
                    You'll receive an invitation email with a link to connect your accounts.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Option 2: Contact the School</h3>
                  <p className="text-sm text-gray-600">
                    Contact RTD Academy at <a href="mailto:info@rtdacademy.com" className="text-blue-600 hover:underline">info@rtdacademy.com</a> to 
                    request linkage to your child's account.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render the main dashboard
  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        user={currentUser}
        onLogout={handleLogout}
        onBackClick={showBackButton ? handleBackClick : null}
        onDashboardClick={() => {
          setSelectedCourse(null);
          setShowLMS(false);
        }}
        portalType="Parent Portal"
        isEmulating={false}
        isStaffUser={false}
        parentInfo={parentData ? {
          name: currentUser?.displayName || parentData.parentProfile?.email?.split('@')[0] || 'Parent',
          email: parentData.parentProfile?.email || currentUser?.email,
          linkedStudents: parentData.linkedStudents?.map(s => ({
            name: s.studentName,
            relationship: s.relationship
          }))
        } : null}
      />

      <div className="flex-1 relative flex flex-col">
        <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col">
          {/* Refresh button */}
          <div className="flex justify-end mb-4">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          
          {/* Pending Invitations for existing parents with linked students */}
          {realInvitations.length > 0 && parentData.linkedStudents && parentData.linkedStudents.length > 0 && (
            <Card className="mb-6 border-purple-200">
              <CardHeader className="bg-purple-50">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-purple-600" />
                  New Student Link Requests
                </h2>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  You have new invitations to link to the following students:
                </p>
                <div className="space-y-3">
                  {realInvitations.map((invitation) => {
                    // Debug log for each invitation
                    console.log('Rendering invitation:', invitation.token);
                    console.log('Checking condition:', {
                      'pendingInvitation?.token': pendingInvitation?.token,
                      'invitation.token': invitation.token,
                      'tokens match': pendingInvitation?.token === invitation.token,
                      'showVerificationDialog': showVerificationDialog,
                      'should show form': pendingInvitation?.token === invitation.token && showVerificationDialog
                    });
                    
                    return (
                    <div key={invitation.token}>
                      {/* Show invitation or verification form based on state */}
                      {pendingInvitation?.token === invitation.token && showVerificationDialog ? (
                        /* Inline Verification Form */
                        <Card className="border-2 border-purple-500 shadow-lg">
                          <CardHeader className="bg-purple-50">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-green-600" />
                                Verify Student Information
                              </h3>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setShowVerificationDialog(false);
                                  setPendingInvitation(null);
                                  setAsnInput('');
                                  setAddressInput(null);
                                  setVerificationError('');
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div>
                                <p className="text-gray-700">
                                  To protect student privacy, please verify <strong>{invitation.studentName}</strong>'s identity before linking accounts.
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  Course: {invitation.courseName}
                                </p>
                              </div>

                              {/* Verification Type Selector */}
                              <div className="space-y-2">
                                <Label>Verification Method</Label>
                                <div className="grid grid-cols-2 gap-3">
                                  <Button
                                    type="button"
                                    variant={verificationType === 'asn' ? 'default' : 'outline'}
                                    onClick={() => {
                                      setVerificationType('asn');
                                      setVerificationError('');
                                    }}
                                    className="justify-start"
                                  >
                                    <ShieldCheck className="h-4 w-4 mr-2" />
                                    ASN Number
                                  </Button>
                                  <Button
                                    type="button"
                                    variant={verificationType === 'address' ? 'default' : 'outline'}
                                    onClick={() => {
                                      setVerificationType('address');
                                      setVerificationError('');
                                    }}
                                    className="justify-start"
                                  >
                                    <MapPin className="h-4 w-4 mr-2" />
                                    Home Address
                                  </Button>
                                </div>
                              </div>

                              {/* ASN Verification */}
                              {verificationType === 'asn' && (
                                <>
                                  <div className="space-y-2">
                                    <Label htmlFor="asn">Alberta Student Number</Label>
                                    <Input
                                      id="asn"
                                      type="text"
                                      placeholder="0000-0000-0"
                                      value={asnInput}
                                      onChange={(e) => setAsnInput(formatASN(e.target.value))}
                                      maxLength={11}
                                      className="font-mono"
                                      autoComplete="off"
                                    />
                                    <p className="text-xs text-gray-500">Format: ####-####-#</p>
                                  </div>
                                  
                                  <div className="bg-blue-50 p-3 rounded-lg text-sm">
                                    <p className="font-medium text-blue-900 mb-1">What is an ASN?</p>
                                    <p className="text-blue-700">The Alberta Student Number is a unique 9-digit identifier found on report cards and official school documents.</p>
                                    <p className="text-blue-700 mt-2">
                                      Need help finding your child's ASN? 
                                      <a 
                                        href="https://learnerregistry.ae.alberta.ca/home/startlookup" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline hover:text-blue-800 font-medium ml-1"
                                      >
                                        Look it up on Alberta Education's website
                                      </a>
                                    </p>
                                  </div>
                                </>
                              )}

                              {/* Address Verification */}
                              {verificationType === 'address' && (
                                <div className="space-y-2">
                                  <Label>Home Address</Label>
                                  <AddressPicker 
                                    onAddressSelect={setAddressInput}
                                    studentType="Parent Verification"
                                  />
                                  {addressInput && (
                                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                      <p className="text-gray-600">Selected: {addressInput.fullAddress}</p>
                                    </div>
                                  )}
                                  <p className="text-xs text-gray-500">Please select the exact address the student used during registration</p>
                                </div>
                              )}

                              {/* Error Display */}
                              {verificationError && (
                                <Alert variant="destructive">
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertDescription>{verificationError}</AlertDescription>
                                </Alert>
                              )}

                              {/* Action Buttons */}
                              <div className="flex gap-2 justify-end pt-4">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setShowVerificationDialog(false);
                                    setPendingInvitation(null);
                                    setAsnInput('');
                                    setAddressInput(null);
                                    setVerificationError('');
                                  }}
                                  disabled={verifying}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={verifyAndAcceptInvitation}
                                  disabled={verifying || (verificationType === 'asn' ? !asnInput.trim() : !addressInput)}
                                >
                                  {verifying ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Verifying...
                                    </>
                                  ) : (
                                    'Verify & Link'
                                  )}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        /* Normal Invitation Display */
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{invitation.studentName || 'Unknown Student'}</p>
                              <p className="text-sm text-gray-600">Course: {invitation.courseName || 'Unknown Course'}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Expires: {invitation.expiresAt ? new Date(invitation.expiresAt).toLocaleDateString() : 'Unknown'}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700"
                              onClick={() => {
                                console.log('Button clicked! Invitation:', invitation);
                                handleAcceptInvitation(invitation);
                              }}
                            >
                              Accept & Link
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Pending Approvals Banner */}
          {pendingApprovalsCount > 0 && (
            <Alert className="mb-6 bg-purple-50 border-purple-200">
              <AlertCircle className="h-4 w-4 text-purple-600" />
              <AlertDescription>
                <span className="text-purple-800 font-medium">
                  You have {pendingApprovalsCount} course enrollment{pendingApprovalsCount > 1 ? 's' : ''} pending approval. 
                  {parentData.linkedStudents.length > 1 && ' Check each student tab below to review their enrollments.'}
                </span>
              </AlertDescription>
            </Alert>
          )}

          {/* Student Selector Tabs */}
          {parentData.linkedStudents.length > 1 && (
            <Tabs 
              value={selectedStudentKey} 
              onValueChange={setSelectedStudentKey}
              className="mb-6"
            >
              <TabsList className="w-full flex gap-2">
                {parentData.linkedStudents.map((student) => {
                  const pendingCount = student.permissions.approveEnrollment ? 
                    Object.values(student.enrollmentApproval?.courses || {}).filter(c => !c.approved && !c.denied).length : 0;
                  
                  return (
                    <TabsTrigger 
                      key={student.studentEmailKey} 
                      value={student.studentEmailKey}
                      className="relative flex-1"
                    >
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{student.studentName}</span>
                        {pendingCount > 0 && (
                          <Badge className="ml-2 bg-purple-500 text-white">
                            {pendingCount}
                          </Badge>
                        )}
                      </div>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
                {/* Tab Content for each student */}
              {parentData.linkedStudents.map((student) => (
                <TabsContent key={student.studentEmailKey} value={student.studentEmailKey}>
                  <div className="space-y-6">
                    {/* Student Info Card */}
                    <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 py-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                              <GraduationCap className="h-6 w-6 text-blue-600" />
                              {student.studentName}
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                              {student.relationship} • {student.profile.StudentEmail}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>

                    {/* Student Information Accordion */}
                    {student.permissions.editContactInfo && (
                      <Accordion 
                        type="single" 
                        collapsible 
                        defaultValue={shouldExpandAccordionByDefault(student) ? "student-info" : undefined}
                        className="w-full"
                      >
                        <AccordionItem value="student-info" className="border border-gray-200">                          <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-3">
                                <UserCircle className="h-5 w-5 text-blue-600" />
                                <span className="font-medium">Student Information</span>
                                {(() => {
                                  try {
                                    const stats = calculateCompletionStats(student);
                                    const isComplete = stats.requiredCompletionPercentage === 100;
                                    return (
                                      <div className="flex items-center gap-2 ml-4">
                                        {isComplete ? (
                                          <div className="flex items-center gap-1 text-green-600">
                                            <CheckCircle className="h-4 w-4" />
                                            <span className="text-sm">Complete</span>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-1 text-orange-600">
                                            <AlertCircle className="h-4 w-4" />
                                            <span className="text-sm">Needs Attention</span>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  } catch (error) {
                                    return null;
                                  }
                                })()}
                              </div>
                              <div className="flex items-center gap-2 mr-2">
                                {/* Student Type Badge - from first course */}
                                {student.courses?.[0]?.StudentType?.Value && (() => {
                                  const typeInfo = getStudentTypeInfo(student.courses[0].StudentType.Value);
                                  const TypeIcon = typeInfo.icon;
                                  return (
                                    <Badge 
                                      className="flex items-center gap-1"
                                      style={{ backgroundColor: typeInfo.color, color: 'white' }}
                                    >
                                      {TypeIcon && <TypeIcon className="h-3 w-3" />}
                                      <span className="text-xs">{student.courses[0].StudentType.Value}</span>
                                    </Badge>
                                  );
                                })()}
                                
                                {/* Course Badge */}
                                {student.courses?.[0]?.courseDetails?.Title && (() => {
                                  const courseInfo = getCourseInfo(student.courses[0].courseDetails.Title);
                                  const CourseIcon = courseInfo.icon;
                                  return (
                                    <Badge 
                                      className="flex items-center gap-1"
                                      style={{ backgroundColor: courseInfo.color, color: 'white' }}
                                    >
                                      {CourseIcon && <CourseIcon className="h-3 w-3" />}
                                      <span className="text-xs">{student.courses[0].courseDetails.Title}</span>
                                    </Badge>
                                  );
                                })()}
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-6 pb-6">
                            <ProfileCompletionTracker
                              studentData={student}
                              onUpdate={handleStudentDataUpdate}
                              hideMainProgress={true}
                            />
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    )}

                    {/* Pending Approvals for this student */}
                    {student.permissions.approveEnrollment && 
                     student.enrollmentApproval?.courses && 
                     Object.entries(student.enrollmentApproval.courses).some(([_, course]) => !course.approved && !course.denied) && (
                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Clock className="h-5 w-5 text-purple-600" />
                      Pending Course Approvals
                    </h3>
                    <p className="text-sm text-purple-700 mt-2">
                      {student.studentName} has completed the registration form for the course(s) below. 
                      Your approval is required before their information can be submitted to Alberta Education (PASI).
                    </p>
                  </CardHeader>
                      <CardContent>
                        <Alert className="mb-4 bg-blue-50 border-blue-200">
                          <AlertCircle className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-sm">
                            <strong>Important:</strong> {student.studentName} can begin studying immediately. 
                            However, their enrollment will not be officially registered with Alberta Education 
                            until you approve it below.
                          </AlertDescription>
                        </Alert>
                        <div className="space-y-3">                          {Object.entries(student.enrollmentApproval.courses)
                            .filter(([_, course]) => !course.approved && !course.denied)
                            .map(([courseId, course]) => (
                              <div 
                                key={courseId} 
                                className="p-4 bg-white rounded-lg border border-purple-200"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="font-medium text-lg">{course.courseName}</p>
                                    <p className="text-sm text-gray-600 mt-1">Course ID: {courseId}</p>
                                    
                                    {/* Course Registration Details */}
                                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                                      <p className="text-sm font-medium text-gray-800 mb-2">Registration Details:</p>                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                                        {(() => {
                                          // Debug: Log the data we're working with
                                          console.log('Debug - Looking for courseId:', courseId, 'Type:', typeof courseId);
                                          console.log('Debug - Available courses:', student.courses);
                                          console.log('Debug - Course IDs in student.courses:', student.courses?.map(c => ({ id: c.CourseID || c.id, type: typeof (c.CourseID || c.id) })));
                                          
                                          // Try multiple matching strategies
                                          let courseData = student.courses?.find(c => c.CourseID === parseInt(courseId));
                                          if (!courseData) {
                                            courseData = student.courses?.find(c => c.CourseID === courseId);
                                          }
                                          if (!courseData) {
                                            courseData = student.courses?.find(c => c.id === parseInt(courseId));
                                          }
                                          if (!courseData) {
                                            courseData = student.courses?.find(c => c.id === courseId);
                                          }
                                          if (!courseData) {
                                            courseData = student.courses?.find(c => String(c.CourseID) === String(courseId));
                                          }
                                          if (!courseData) {
                                            courseData = student.courses?.find(c => String(c.id) === String(courseId));
                                          }
                                          
                                          console.log('Debug - Found courseData:', courseData);
                                          
                                          return courseData ? (
                                            <>
                                              <div>
                                                <span className="font-medium">Student Type:</span>
                                                <span className="ml-2">{courseData.StudentType?.Value || 'Not specified'}</span>
                                              </div>
                                              <div>
                                                <span className="font-medium">Registration Date:</span>
                                                <span className="ml-2">
                                                  {courseData.Created ? new Date(courseData.Created).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                  }) : 'Not available'}
                                                </span>
                                              </div>
                                              <div>
                                                <span className="font-medium">Schedule Start:</span>
                                                <span className="ml-2">
                                                  {courseData.ScheduleStartDate ? new Date(courseData.ScheduleStartDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                  }) : 'Not set'}
                                                </span>
                                              </div>
                                              <div>
                                                <span className="font-medium">Schedule End:</span>
                                                <span className="ml-2">
                                                  {courseData.ScheduleEndDate ? new Date(courseData.ScheduleEndDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                  }) : 'Not set'}
                                                </span>
                                              </div>
                                            </>
                                          ) : (
                                            <div className="col-span-2 text-gray-500">
                                              Course details not available (Course ID: {courseId}, Available courses: {student.courses?.length || 0})
                                            </div>
                                          );
                                        })()}
                                      </div>
                                    </div>

                                    <div className="mt-3 text-sm text-gray-700">
                                      <p className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span>Student can access course materials immediately</span>
                                      </p>
                                      <p className="flex items-start gap-2 mt-1">
                                        <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                        <span>PASI registration pending your approval</span>
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2 ml-4">
                                    <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-green-500 text-green-700 hover:bg-green-50"
                                    onClick={() => handleCourseApproval(student.studentEmailKey, courseId, true)}
                                    disabled={approvalLoading[`${student.studentEmailKey}-${courseId}-approve`] || approvalLoading[`${student.studentEmailKey}-${courseId}-decline`]}
                                  >
                                    {approvalLoading[`${student.studentEmailKey}-${courseId}-approve`] ? (
                                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                    )}
                                    Approve for PASI
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-500 text-red-700 hover:bg-red-50"
                                    onClick={() => handleCourseApproval(student.studentEmailKey, courseId, false)}
                                    disabled={approvalLoading[`${student.studentEmailKey}-${courseId}-approve`] || approvalLoading[`${student.studentEmailKey}-${courseId}-decline`]}
                                  >
                                    {approvalLoading[`${student.studentEmailKey}-${courseId}-decline`] ? (
                                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    ) : (
                                      <X className="h-4 w-4 mr-1" />
                                    )}
                                    Decline
                                  </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                       
                      </CardContent>
                    </Card>
                    )}                    {/* Message when no decisions made yet and courses section is hidden */}
                    {!hasParentMadeEnrollmentDecisions(student) && 
                     student.enrollmentApproval?.courses && 
                     Object.keys(student.enrollmentApproval.courses).length > 0 && (
                      <Card className="border border-blue-200 bg-blue-50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 text-blue-800">
                            <AlertCircle className="h-5 w-5" />
                            <p className="text-sm">
                              <strong>Next Step:</strong> Please review and approve or decline the course enrollment(s) above. 
                              The courses section will appear once you've made your decision.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Courses Section - Only show after enrollment decisions have been made */}
                    {hasParentMadeEnrollmentDecisions(student) && (
                      <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 py-3">
                          <h3 className="text-lg font-semibold flex items-center">
                            <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                            Courses
                          </h3>
                        </CardHeader>
                        <CardContent className="p-6">
                          {(() => {
                            // Filter courses to only show approved ones
                            const approvedCourses = student.courses?.filter(course => {
                              const courseId = course.CourseID || course.id;
                              const enrollmentCourse = student.enrollmentApproval?.courses?.[courseId];
                              return enrollmentCourse?.approved === true;
                            }) || [];

                            return approvedCourses.length > 0 ? (
                              <div className="space-y-6">
                                {approvedCourses.map((course) => (
                                  <CourseCard
                                    key={course.CourseID || course.id}
                                    course={course}
                                    profile={student.profile}
                                    onViewDetails={() => setSelectedCourse(course)}
                                    onGoToCourse={() => {
                                      toast.info("Parent view of course content coming soon!");
                                    }}
                                    showProgressBar={student.permissions.viewGrades}
                                    showGradeInfo={student.permissions.viewGrades}
                                  />
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                {student.courses && student.courses.length > 0 
                                  ? "No approved courses yet. Please approve enrollments above to view courses."
                                  : "No courses enrolled yet"
                                }
                              </div>
                            );
                          })()}
                        </CardContent>
                      </Card>
                    )}

                    {/* Important Dates - if we have them */}
                    {student.importantDates && (
                      <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 py-3">
                          <h3 className="text-lg font-semibold flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                            Important Dates
                          </h3>
                        </CardHeader>
                        <CardContent className="p-4">
                          <ImportantDatesCard importantDates={student.importantDates} />
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}          {/* Single Student Content (when no tabs needed) */}
          {parentData.linkedStudents.length === 1 && selectedStudent && (
            <div className="space-y-6">
              {/* Student Info Card */}
              <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 py-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-blue-600" />
                        {selectedStudent.studentName}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedStudent.relationship} • {selectedStudent.profile.StudentEmail}
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Student Information Accordion */}
              {selectedStudent.permissions.editContactInfo && (
                <Accordion 
                  type="single" 
                  collapsible 
                  defaultValue={shouldExpandAccordionByDefault(selectedStudent) ? "student-info" : undefined}
                  className="w-full"
                >
                  <AccordionItem value="student-info" className="border border-gray-200">                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <UserCircle className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">Student Information</span>
                          {(() => {
                            try {
                              const stats = calculateCompletionStats(selectedStudent);
                              const isComplete = stats.requiredCompletionPercentage === 100;
                              return (
                                <div className="flex items-center gap-2 ml-4">
                                  {isComplete ? (
                                    <div className="flex items-center gap-1 text-green-600">
                                      <CheckCircle className="h-4 w-4" />
                                      <span className="text-sm">Complete</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 text-orange-600">
                                      <AlertCircle className="h-4 w-4" />
                                      <span className="text-sm">Needs Attention</span>
                                    </div>
                                  )}
                                </div>
                              );
                            } catch (error) {
                              return null;
                            }
                          })()}
                        </div>
                        <div className="flex items-center gap-2 mr-2">
                          {/* Student Type Badge - from first course */}
                          {selectedStudent.courses?.[0]?.StudentType?.Value && (() => {
                            const typeInfo = getStudentTypeInfo(selectedStudent.courses[0].StudentType.Value);
                            const TypeIcon = typeInfo.icon;
                            return (
                              <Badge 
                                className="flex items-center gap-1"
                                style={{ backgroundColor: typeInfo.color, color: 'white' }}
                              >
                                {TypeIcon && <TypeIcon className="h-3 w-3" />}
                                <span className="text-xs">{selectedStudent.courses[0].StudentType.Value}</span>
                              </Badge>
                            );
                          })()}
                          
                          {/* Course Badge */}
                          {selectedStudent.courses?.[0]?.courseDetails?.Title && (() => {
                            const courseInfo = getCourseInfo(selectedStudent.courses[0].courseDetails.Title);
                            const CourseIcon = courseInfo.icon;
                            return (
                              <Badge 
                                className="flex items-center gap-1"
                                style={{ backgroundColor: courseInfo.color, color: 'white' }}
                              >
                                {CourseIcon && <CourseIcon className="h-3 w-3" />}
                                <span className="text-xs">{selectedStudent.courses[0].courseDetails.Title}</span>
                              </Badge>
                            );
                          })()}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <ProfileCompletionTracker
                        studentData={selectedStudent}
                        onUpdate={handleStudentDataUpdate}
                        hideMainProgress={true}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              {/* Pending Approvals for this student */}
              {selectedStudent.permissions.approveEnrollment && 
               selectedStudent.enrollmentApproval?.courses && 
               Object.entries(selectedStudent.enrollmentApproval.courses).some(([_, course]) => !course.approved && !course.denied) && (
                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Clock className="h-5 w-5 text-purple-600" />
                      Pending Course Approvals
                    </h3>
                    <p className="text-sm text-purple-700 mt-2">
                      {selectedStudent.studentName} has completed the registration form for the course(s) below. 
                      Your approval is required before their information can be submitted to Alberta Education (PASI).
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Alert className="mb-4 bg-teal-50 border-teal-200">
                      <AlertCircle className="h-4 w-4 text-teal-600" />
                      <AlertDescription className="text-sm text-teal-800">
                        <strong>Important:</strong> {selectedStudent.studentName} can begin studying immediately. 
                        However, their enrollment will not be officially registered with Alberta Education 
                        until you approve it below.
                      </AlertDescription>
                    </Alert>
                    <div className="space-y-3">                      {Object.entries(selectedStudent.enrollmentApproval.courses)
                        .filter(([_, course]) => !course.approved && !course.denied)
                        .map(([courseId, course]) => (
                          <div 
                            key={courseId} 
                            className="p-4 bg-white rounded-lg border border-purple-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-lg">{course.courseName}</p>
                                <p className="text-sm text-gray-600 mt-1">Course ID: {courseId}</p>
                                
                                {/* Course Registration Details */}
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                                  <p className="text-sm font-medium text-gray-800 mb-2">Registration Details:</p>                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                                    {(() => {
                                      // Debug: Log the data we're working with
                                      console.log('Debug - Looking for courseId:', courseId, 'Type:', typeof courseId);
                                      console.log('Debug - Available courses:', selectedStudent.courses);
                                      console.log('Debug - Course IDs in selectedStudent.courses:', selectedStudent.courses?.map(c => ({ id: c.CourseID || c.id, type: typeof (c.CourseID || c.id) })));
                                      
                                      // Try multiple matching strategies
                                      let courseData = selectedStudent.courses?.find(c => c.CourseID === parseInt(courseId));
                                      if (!courseData) {
                                        courseData = selectedStudent.courses?.find(c => c.CourseID === courseId);
                                      }
                                      if (!courseData) {
                                        courseData = selectedStudent.courses?.find(c => c.id === parseInt(courseId));
                                      }
                                      if (!courseData) {
                                        courseData = selectedStudent.courses?.find(c => c.id === courseId);
                                      }
                                      if (!courseData) {
                                        courseData = selectedStudent.courses?.find(c => String(c.CourseID) === String(courseId));
                                      }
                                      if (!courseData) {
                                        courseData = selectedStudent.courses?.find(c => String(c.id) === String(courseId));
                                      }
                                      
                                      console.log('Debug - Found courseData:', courseData);
                                      
                                      return courseData ? (
                                        <>
                                          <div>
                                            <span className="font-medium">Student Type:</span>
                                            <span className="ml-2">{courseData.StudentType?.Value || 'Not specified'}</span>
                                          </div>
                                          <div>
                                            <span className="font-medium">Registration Date:</span>
                                            <span className="ml-2">
                                              {courseData.Created ? new Date(courseData.Created).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                              }) : 'Not available'}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="font-medium">Schedule Start:</span>
                                            <span className="ml-2">
                                              {courseData.ScheduleStartDate ? new Date(courseData.ScheduleStartDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                              }) : 'Not set'}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="font-medium">Schedule End:</span>
                                            <span className="ml-2">
                                              {courseData.ScheduleEndDate ? new Date(courseData.ScheduleEndDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                              }) : 'Not set'}
                                            </span>
                                          </div>
                                        </>
                                      ) : (
                                        <div className="col-span-2 text-gray-500">
                                          Course details not available (Course ID: {courseId}, Available courses: {selectedStudent.courses?.length || 0})
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>

                                <div className="mt-3 text-sm text-gray-700">
                                  <p className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>Student can access course materials immediately</span>
                                  </p>
                                  <p className="flex items-start gap-2 mt-1">
                                    <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                    <span>PASI registration pending your approval</span>
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-500 text-green-700 hover:bg-green-50"
                                onClick={() => handleCourseApproval(selectedStudent.studentEmailKey, courseId, true)}
                                disabled={approvalLoading[`${selectedStudent.studentEmailKey}-${courseId}-approve`] || approvalLoading[`${selectedStudent.studentEmailKey}-${courseId}-decline`]}
                              >
                                {approvalLoading[`${selectedStudent.studentEmailKey}-${courseId}-approve`] ? (
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                )}
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500 text-red-700 hover:bg-red-50"
                                onClick={() => handleCourseApproval(selectedStudent.studentEmailKey, courseId, false)}
                                disabled={approvalLoading[`${selectedStudent.studentEmailKey}-${courseId}-approve`] || approvalLoading[`${selectedStudent.studentEmailKey}-${courseId}-decline`]}
                              >
                                {approvalLoading[`${selectedStudent.studentEmailKey}-${courseId}-decline`] ? (
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <X className="h-4 w-4 mr-1" />
                                )}
                                Decline
                              </Button>
                            </div>
                          </div>
                          </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-purple-100">
                      <p className="text-xs text-purple-700">
                        <strong>Note:</strong> Approving will submit {selectedStudent.studentName}'s enrollment to Alberta Education. 
                        Declining will prevent PASI registration but won't affect course access.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}              {/* Message when no decisions made yet and courses section is hidden */}
              {!hasParentMadeEnrollmentDecisions(selectedStudent) && 
               selectedStudent.enrollmentApproval?.courses && 
               Object.keys(selectedStudent.enrollmentApproval.courses).length > 0 && (
                <Card className="border border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-blue-800">
                      <AlertCircle className="h-5 w-5" />
                      <p className="text-sm">
                        <strong>Next Step:</strong> Please review and approve or decline the course enrollment(s) above. 
                        The courses section will appear once you've made your decision.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Courses Section - Only show after enrollment decisions have been made */}
              {hasParentMadeEnrollmentDecisions(selectedStudent) && (
                <Card className="border border-gray-200 shadow-md">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h3 className="text-lg font-semibold flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                      Courses
                    </h3>
                  </CardHeader>
                  <CardContent className="p-6">
                    {(() => {
                      // Filter courses to only show approved ones
                      const approvedCourses = selectedStudent.courses?.filter(course => {
                        const courseId = course.CourseID || course.id;
                        const enrollmentCourse = selectedStudent.enrollmentApproval?.courses?.[courseId];
                        return enrollmentCourse?.approved === true;
                      }) || [];

                      return approvedCourses.length > 0 ? (
                        <div className="space-y-6">
                          {approvedCourses.map((course) => (
                            <CourseCard
                              key={course.CourseID || course.id}
                              course={course}
                              profile={selectedStudent.profile}
                              onViewDetails={() => setSelectedCourse(course)}
                              onGoToCourse={() => {
                                toast.info("Parent view of course content coming soon!");
                              }}
                              showProgressBar={selectedStudent.permissions.viewGrades}
                              showGradeInfo={selectedStudent.permissions.viewGrades}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          {selectedStudent.courses && selectedStudent.courses.length > 0 
                            ? "No approved courses yet. Please approve enrollments above to view courses."
                            : "No courses enrolled yet"
                          }
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Important Dates - if we have them */}
              {selectedStudent.importantDates && (
                <Card className="border border-gray-200 shadow-md">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                      Important Dates
                    </h3>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ImportantDatesCard importantDates={selectedStudent.importantDates} />
                  </CardContent>
                </Card>
              )}            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default ParentDashboard;