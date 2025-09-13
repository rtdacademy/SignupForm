import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, update } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '../components/ui/sheet';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import { Checkbox } from '../components/ui/checkbox';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../components/ui/card';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  ExternalLink,
  Calendar,
  User,
  FileText,
  Clock,
  Shield,
  AlertCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Info,
  UserCheck,
  Hash,
  MessageSquare,
  ClipboardCheck
} from 'lucide-react';
import { formatDateForDisplay } from '../utils/timeZoneUtils';
import { toast } from 'sonner';

// Helper function to format document type
const formatDocumentType = (type) => {
  const typeDisplayMap = {
    'alberta_birth_certificate': 'Alberta Birth Certificate',
    'canadian_birth_certificate': 'Canadian Birth Certificate',
    'canadian_citizenship_certificate': 'Canadian Citizenship Certificate',
    'canadian_citizenship_card': 'Canadian Citizenship Card',
    'canadian_passport': 'Canadian Passport',
    'foreign_passport': 'Foreign Passport',
    'canadian_certificate_of_indian_status': 'Status Card',
    'treaty_card': 'Treaty Card',
    'canadian_permanent_resident_card': 'Permanent Resident Card',
    'canadian_study_permit': 'Study Permit',
    'canadian_work_permit': 'Work Permit',
    'canadian_temporary_resident_visa': 'Temporary Resident Visa',
    'confirmation_of_permanent_residence': 'Confirmation of Permanent Residence',
    'canadian_refugee_protection_claimant': 'Refugee Protection Claimant Document',
    'foreign_birth_certificate': 'Foreign Birth Certificate',
    'unknown': 'Unknown Document Type'
  };
  
  return typeDisplayMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Helper function to check if date is expired or expiring soon
const getExpiryStatus = (expiryDate) => {
  if (!expiryDate) return null;
  
  const expiry = new Date(expiryDate);
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  
  if (expiry < today) {
    return { status: 'expired', color: 'text-red-600', message: 'Document Expired' };
  } else if (expiry < thirtyDaysFromNow) {
    return { status: 'expiring', color: 'text-orange-600', message: 'Expiring Soon' };
  }
  return { status: 'valid', color: 'text-green-600', message: 'Valid' };
};

const StaffDocumentReview = ({
  isOpen,
  onOpenChange,
  familyId,
  familyData,
  initialStudentId = null
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [allStudents, setAllStudents] = useState([]); // All students in family
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0);
  const [documentData, setDocumentData] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState({});
  const [manualOverrides, setManualOverrides] = useState({});
  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [staffComment, setStaffComment] = useState('');
  const [reviewPriority, setReviewPriority] = useState('medium');
  const [reviewIssues, setReviewIssues] = useState({
    unclear: false,
    nameMismatch: false,
    expired: false,
    wrongType: false,
    other: false
  });
  const [otherIssueText, setOtherIssueText] = useState('');
  const [userProfile, setUserProfile] = useState(null);

  // Load user profile
  useEffect(() => {
    if (!user) return;
    
    const loadUserProfile = async () => {
      try {
        const db = getDatabase();
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setUserProfile(snapshot.val());
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };
    
    loadUserProfile();
  }, [user]);

  // Load students with documents
  useEffect(() => {
    if (!isOpen || !familyId || !familyData) return;

    const loadStudentsWithDocuments = async () => {
      setLoading(true);
      try {
        const db = getDatabase();
        const allStudentsList = [];

        // Get all students in the family
        const familyStudents = familyData.students ? Object.values(familyData.students) : [];

        for (const student of familyStudents) {
          // Check if student has any documents
          const docsRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/STUDENT_CITIZENSHIP_DOCS/${student.id}`);
          const docsSnapshot = await get(docsRef);

          let studentWithStatus = { ...student };

          if (docsSnapshot.exists()) {
            const docData = docsSnapshot.val();
            if (docData.documents && docData.documents.length > 0) {
              // Student has documents
              studentWithStatus.documentData = docData;
              studentWithStatus.hasDocuments = true;
            } else {
              // Student has doc node but no actual documents uploaded
              studentWithStatus.hasDocuments = false;
              studentWithStatus.documentData = null;
            }
          } else {
            // No document node at all for this student
            studentWithStatus.hasDocuments = false;
            studentWithStatus.documentData = null;
          }

          allStudentsList.push(studentWithStatus);
        }

        // Store all students
        setAllStudents(allStudentsList);

        // If initialStudentId is provided, navigate to that student
        if (initialStudentId) {
          const targetIndex = allStudentsList.findIndex(
            student => student.id === initialStudentId
          );
          if (targetIndex !== -1) {
            setCurrentStudentIndex(targetIndex);
            await loadStudentDocuments(allStudentsList[targetIndex]);
            return; // Exit early since we found the target student
          }
        }

        // Otherwise, find first student that needs review (not already approved)
        const firstUnreviewedIndex = allStudentsList.findIndex(
          student => student.hasDocuments && !student.documentData?.staffApproval?.isApproved
        );

        if (firstUnreviewedIndex !== -1) {
          setCurrentStudentIndex(firstUnreviewedIndex);
          await loadStudentDocuments(allStudentsList[firstUnreviewedIndex]);
        } else if (allStudentsList.length > 0) {
          // Load the first student regardless of document status
          await loadStudentDocuments(allStudentsList[0]);
        }
      } catch (error) {
        console.error('Error loading students:', error);
        toast.error('Failed to load student documents');
      } finally {
        setLoading(false);
      }
    };

    loadStudentsWithDocuments();
  }, [isOpen, familyId, familyData, initialStudentId]);

  // Load specific student's documents and analysis
  const loadStudentDocuments = async (student) => {
    if (!student?.documentData) return;
    
    setDocumentData(student.documentData);
    setCurrentDocumentIndex(0); // Reset to first document
    
    // Load AI analysis for each document
    const analyses = {};
    const overrides = {};
    
    if (student.documentData.documents) {
      for (const doc of student.documentData.documents) {
        if (doc._analysisId && student.documentData.aiAnalysisResults) {
          analyses[doc._analysisId] = student.documentData.aiAnalysisResults[doc._analysisId];
        }
        if (doc._analysisId && student.documentData.manualOverrides) {
          overrides[doc._analysisId] = student.documentData.manualOverrides[doc._analysisId];
        }
      }
    }
    
    setAiAnalysis(analyses);
    setManualOverrides(overrides);
    
    // Reset form state
    setReviewNotes('');
    setStaffComment('');
    setReviewPriority(student.documentData.reviewPriority || 'medium');
    setReviewIssues({
      unclear: false,
      nameMismatch: false,
      expired: false,
      wrongType: false,
      other: false
    });
    setOtherIssueText('');
  };

  // Handle moving to next student
  const handleNextStudent = async () => {
    if (currentStudentIndex < allStudents.length - 1) {
      const nextIndex = currentStudentIndex + 1;
      setCurrentStudentIndex(nextIndex);
      await loadStudentDocuments(allStudents[nextIndex]);
    }
  };

  // Handle moving to previous student
  const handlePreviousStudent = async () => {
    if (currentStudentIndex > 0) {
      const prevIndex = currentStudentIndex - 1;
      setCurrentStudentIndex(prevIndex);
      await loadStudentDocuments(allStudents[prevIndex]);
    }
  };

  // Handle document navigation
  const handleNextDocument = () => {
    if (documentData?.documents && currentDocumentIndex < documentData.documents.length - 1) {
      setCurrentDocumentIndex(currentDocumentIndex + 1);
      setReviewNotes(''); // Clear notes for new document
    }
  };

  const handlePreviousDocument = () => {
    if (currentDocumentIndex > 0) {
      setCurrentDocumentIndex(currentDocumentIndex - 1);
      setReviewNotes(''); // Clear notes for new document
    }
  };

  // Handle staff approval
  const handleApprove = async () => {
    const currentStudent = allStudents[currentStudentIndex];
    if (!currentStudent || !currentStudent.hasDocuments) return;

    setIsProcessing(true);
    
    try {
      const db = getDatabase();
      const docsRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/STUDENT_CITIZENSHIP_DOCS/${currentStudent.id}`);
      
      const updateData = {
        staffApproval: {
          isApproved: true,
          approvedBy: {
            uid: user.uid,
            email: user.email,
            name: userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : user.email
          },
          approvedAt: new Date().toISOString(),
          comment: reviewNotes || null
        },
        requiresStaffReview: false,
        staffReviewRequired: false,
        completionStatus: 'completed',
        lastUpdated: new Date().toISOString()
      };
      
      await update(docsRef, updateData);
      
      toast.success(
        `Documents approved for ${currentStudent.firstName} ${currentStudent.lastName}`
      );
      
      // Check if there are more students to review
      if (currentStudentIndex < allStudents.length - 1) {
        await handleNextStudent();
      } else {
        // All students reviewed, close the sheet
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error updating document status:', error);
      toast.error('Failed to update document status');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle staff rejection
  const handleReject = async () => {
    const currentStudent = allStudents[currentStudentIndex];
    if (!currentStudent || !currentStudent.hasDocuments) return;

    setIsProcessing(true);
    
    try {
      const db = getDatabase();
      const docsRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/STUDENT_CITIZENSHIP_DOCS/${currentStudent.id}`);
      
      const updateData = {
        staffApproval: {
          isApproved: false,
          approvedBy: {
            uid: user.uid,
            email: user.email,
            name: userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : user.email
          },
          approvedAt: new Date().toISOString(),
          comment: reviewNotes || null
        },
        requiresStaffReview: false,
        staffReviewRequired: false,
        completionStatus: 'rejected',
        lastUpdated: new Date().toISOString()
      };
      
      await update(docsRef, updateData);
      
      toast.success(
        `Documents rejected for ${currentStudent.firstName} ${currentStudent.lastName}`
      );
      
      // Check if there are more students to review
      if (currentStudentIndex < allStudents.length - 1) {
        await handleNextStudent();
      } else {
        // All students reviewed, close the sheet
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error updating document status:', error);
      toast.error('Failed to update document status');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-6xl overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (allStudents.length === 0) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="right" size="full" className="overflow-hidden p-0">
          <div className="sticky top-0 z-10 bg-white border-b px-6 py-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              Document Review
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {familyData?.familyName}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center h-96">
            <AlertTriangle className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-lg font-medium">No Students Found</p>
            <p className="text-gray-600">No students registered for this family.</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const currentStudent = allStudents[currentStudentIndex];
  if (!currentStudent) {
    return null;
  }
  const currentDoc = documentData?.documents?.[currentDocumentIndex];
  const currentAnalysis = currentDoc?._analysisId ? aiAnalysis[currentDoc._analysisId] : null;
  const currentOverride = currentDoc?._analysisId ? manualOverrides[currentDoc._analysisId] : null;
  const expiryStatus = currentAnalysis?.expiryDate ? getExpiryStatus(currentAnalysis.expiryDate) : null;
  const totalDocs = documentData?.documents?.length || 0;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" size="full" className="overflow-hidden p-0">
        {/* Header with Review Actions */}
        <div className="sticky top-0 z-10 bg-white border-b">
          {/* Top Section - Title and Navigation */}
          <div className="px-6 py-3 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-600" />
                  Document Verification
                </h2>
                <p className="text-sm text-gray-600 mt-0.5">
                  {familyData?.familyName} • {currentStudent?.firstName} {currentStudent?.lastName}
                  {totalDocs > 1 && (
                    <span className="ml-2 font-medium">
                      • Document {currentDocumentIndex + 1} of {totalDocs}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {documentData?.staffApproval && (
                  <Badge 
                    variant={documentData.staffApproval.isApproved ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {documentData.staffApproval.isApproved ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Previously Approved
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 mr-1" />
                        Previously Rejected
                      </>
                    )}
                  </Badge>
                )}
                {totalDocs > 1 && (
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handlePreviousDocument}
                      disabled={currentDocumentIndex === 0}
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </Button>
                    <Badge variant="outline" className="text-xs">
                      Doc {currentDocumentIndex + 1}/{totalDocs}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleNextDocument}
                      disabled={currentDocumentIndex >= totalDocs - 1}
                    >
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                )}
                {allStudents.length > 1 && (
                  <Badge variant="outline" className="text-xs">
                    Student {currentStudentIndex + 1}/{allStudents.length}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Review Actions - Compact Single Row */}
          <div className="px-6 py-3 bg-white">
            {!currentStudent.hasDocuments ? (
              // Student has no documents - show special message
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-orange-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">No Documents Uploaded</span>
                  <span className="text-gray-500">
                    This student has no citizenship documents on file
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {currentStudentIndex > 0 && (
                    <Button
                      onClick={handlePreviousStudent}
                      size="sm"
                      variant="outline"
                    >
                      <ChevronLeft className="w-3 h-3 mr-1" />
                      Previous Student
                    </Button>
                  )}
                  {currentStudentIndex < allStudents.length - 1 && (
                    <Button
                      onClick={handleNextStudent}
                      size="sm"
                      variant="outline"
                    >
                      Next Student
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            ) : documentData?.staffApproval?.isApproved ? (
              // Already approved - show status only
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-medium">Document Approved</span>
                  <span className="text-gray-500">
                    by {(documentData.staffApproval.approvedBy?.name &&
                         !documentData.staffApproval.approvedBy.name.includes('undefined'))
                         ? documentData.staffApproval.approvedBy.name
                         : documentData.staffApproval.approvedBy?.email} on {formatDateForDisplay(documentData.staffApproval.approvedAt)}
                  </span>
                  {documentData.staffApproval.comment && (
                    <span className="text-gray-500">• "{documentData.staffApproval.comment}"</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleReject}
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50 border-red-200"
                  >
                    <XCircle className="w-3 h-3 mr-1" />
                    Override & Reject
                  </Button>
                  <div className="flex items-center gap-2">
                    {currentStudentIndex > 0 && (
                      <Button
                        onClick={handlePreviousStudent}
                        size="sm"
                        variant="outline"
                      >
                        <ChevronLeft className="w-3 h-3 mr-1" />
                        Previous
                      </Button>
                    )}
                    {currentStudentIndex < allStudents.length - 1 && (
                      <Button
                        onClick={handleNextStudent}
                        size="sm"
                        variant="outline"
                      >
                        Next
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Not approved or rejected - show full actions
              <>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add review comment (optional)..."
                      className="w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleApprove}
                      disabled={isProcessing}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleReject}
                      disabled={isProcessing}
                      size="sm"
                      variant="destructive"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Reject
                        </>
                      )}
                    </Button>
                    <div className="flex items-center gap-2">
                      {currentStudentIndex > 0 && (
                        <Button
                          onClick={handlePreviousStudent}
                          size="sm"
                          variant="outline"
                        >
                          <ChevronLeft className="w-3 h-3 mr-1" />
                          Previous
                        </Button>
                      )}
                      {currentStudentIndex < allStudents.length - 1 && (
                        <Button
                          onClick={handleNextStudent}
                          size="sm"
                          variant="outline"
                        >
                          Next
                          <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                {documentData?.staffApproval && !documentData.staffApproval.isApproved && (
                  <div className="mt-2 text-xs text-gray-500">
                    Previously rejected by {(documentData.staffApproval.approvedBy?.name &&
                                             !documentData.staffApproval.approvedBy.name.includes('undefined'))
                                             ? documentData.staffApproval.approvedBy.name
                                             : documentData.staffApproval.approvedBy?.email} on {formatDateForDisplay(documentData.staffApproval.approvedAt)}
                    {documentData.staffApproval.comment && (
                      <span className="ml-2">• "{documentData.staffApproval.comment}"</span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex h-[calc(100vh-10rem)]">
          {!currentStudent.hasDocuments ? (
            // Student has no documents - show special UI
            <div className="w-full flex items-center justify-center p-8">
              <Card className="max-w-2xl w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    No Documents Available
                  </CardTitle>
                  <CardDescription>
                    Citizenship documents have not been uploaded for this student
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-sm text-orange-800 font-medium mb-2">
                      Student Information
                    </p>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p><strong>Name:</strong> {currentStudent.firstName} {currentStudent.lastName}</p>
                      {currentStudent.birthday && (
                        <p><strong>Birth Date:</strong> {formatDateForDisplay(currentStudent.birthday)}</p>
                      )}
                      {currentStudent.grade && (
                        <p><strong>Grade:</strong> {currentStudent.grade}</p>
                      )}
                      {currentStudent.asn && (
                        <p><strong>ASN:</strong> {currentStudent.asn}</p>
                      )}
                    </div>
                  </div>
                  <Alert className="border-blue-200 bg-blue-50">
                    <Info className="w-4 h-4 text-blue-600" />
                    <AlertDescription className="text-sm">
                      The parent/guardian needs to upload citizenship or immigration documents for this student before they can be reviewed.
                    </AlertDescription>
                  </Alert>
                  <div className="flex justify-center gap-3 pt-4">
                    {currentStudentIndex > 0 && (
                      <Button
                        onClick={handlePreviousStudent}
                        variant="outline"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous Student
                      </Button>
                    )}
                    {currentStudentIndex < allStudents.length - 1 && (
                      <Button
                        onClick={handleNextStudent}
                        variant="default"
                      >
                        Next Student
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Student has documents - show normal UI
            <>
              {/* Left Column - Document Preview */}
              <div className="w-1/2 border-r bg-gray-50 p-4 overflow-auto">
                {/* Document Thumbnails if multiple */}
            {totalDocs > 1 && (
              <Card className="mb-4">
                <CardHeader className="pb-2 pt-3">
                  <CardTitle className="text-sm">All Documents ({totalDocs})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {documentData.documents.map((doc, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentDocumentIndex(index);
                          setReviewNotes('');
                        }}
                        className={`relative flex-shrink-0 border-2 rounded-lg overflow-hidden transition-all ${
                          index === currentDocumentIndex 
                            ? 'border-purple-500 shadow-lg' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="w-20 h-20 bg-gray-100 flex items-center justify-center">
                          {doc.name?.toLowerCase().endsWith('.pdf') ? (
                            <FileText className="w-8 h-8 text-gray-400" />
                          ) : (
                            <img 
                              src={doc.url} 
                              alt={`Doc ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<div class="w-8 h-8 text-gray-400"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                              }}
                            />
                          )}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                          {index + 1}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Document Preview
                    {totalDocs > 1 && (
                      <Badge variant="outline" className="text-xs">
                        {currentDocumentIndex + 1} of {totalDocs}
                      </Badge>
                    )}
                  </span>
                  {currentDoc?.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(currentDoc.url, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Full Size
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentDoc?.url ? (
                  <div className="space-y-3">
                    {currentDoc.name?.toLowerCase().endsWith('.pdf') ? (
                      <div className="w-full h-96 rounded-lg border shadow-sm overflow-hidden">
                        <iframe 
                          src={currentDoc.url}
                          title="Document preview"
                          className="w-full h-full"
                          style={{ minHeight: '400px' }}
                        />
                      </div>
                    ) : (
                      <img 
                        src={currentDoc.url} 
                        alt="Document preview"
                        className="w-full rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => window.open(currentDoc.url, '_blank')}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.insertAdjacentHTML('afterend', 
                            '<div class="text-center text-gray-500 py-8 border rounded-lg">Unable to load image preview</div>'
                          );
                        }}
                      />
                    )}
                    <div className="text-xs text-gray-600 space-y-1">
                      <p><strong>Type:</strong> {formatDocumentType(currentDoc.type)}</p>
                      {currentDoc.uploadDate && (
                        <p><strong>Uploaded:</strong> {formatDateForDisplay(currentDoc.uploadDate)}</p>
                      )}
                      {currentDoc.name && (
                        <p><strong>File:</strong> {currentDoc.name}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No document available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - AI Analysis & Info */}
          <div className="w-1/2 p-4 overflow-auto">
            <div className="space-y-4">
              {/* Validation Status */}
              <Card className={currentAnalysis?.isValidDocument ? 'border-green-200' : 'border-red-200'}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>AI Validation Result</span>
                    {currentAnalysis?.isValidDocument ? (
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Valid
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700">
                        <XCircle className="w-3 h-3 mr-1" />
                        Issues Found
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentAnalysis?.requiresManualReview && (
                    <Alert className="mb-3 border-orange-200 bg-orange-50">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <AlertDescription className="text-sm">
                        Manual review required - AI confidence below threshold
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-3">
                    {/* Name Match */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Name Match</span>
                        <Badge variant="outline" className={
                          currentAnalysis?.studentNameMatch?.match 
                            ? 'border-green-300 text-green-700' 
                            : 'border-red-300 text-red-700'
                        }>
                          {currentAnalysis?.studentNameMatch?.match ? 'Matches' : 'Mismatch'}
                        </Badge>
                      </div>
                      {currentAnalysis?.nameMatchReasoning && (
                        <p className="text-xs text-gray-600">{currentAnalysis.nameMatchReasoning}</p>
                      )}
                    </div>

                    {/* Document Type */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Document Type</span>
                        <Badge variant="outline">
                          {formatDocumentType(currentAnalysis?.detectedType || 'unknown')}
                        </Badge>
                      </div>
                      {currentAnalysis?.typeMatchReasoning && (
                        <p className="text-xs text-gray-600">{currentAnalysis.typeMatchReasoning}</p>
                      )}
                    </div>

                    {/* Birth Date */}
                    {currentAnalysis?.detectedBirthDate && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Birth Date</span>
                          <span className="text-sm">{formatDateForDisplay(currentAnalysis.detectedBirthDate)}</span>
                        </div>
                      </div>
                    )}

                    {/* Expiry Date */}
                    {currentAnalysis?.expiryDate && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Expiry Date</span>
                          <span className={`text-sm ${expiryStatus?.color}`}>
                            {formatDateForDisplay(currentAnalysis.expiryDate)}
                          </span>
                        </div>
                        {expiryStatus && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              expiryStatus.status === 'expired' ? 'border-red-300 text-red-700' :
                              expiryStatus.status === 'expiring' ? 'border-orange-300 text-orange-700' :
                              'border-green-300 text-green-700'
                            }`}
                          >
                            {expiryStatus.message}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Validation Issues */}
              {currentAnalysis?.validationIssues && currentAnalysis.validationIssues.length > 0 && (
                <Card className="border-orange-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      Validation Issues
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {currentAnalysis.validationIssues.map((issue, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Parent Override */}
              {currentOverride && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      Parent's Manual Review
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="mb-2">
                      <strong>Parent indicated:</strong>{' '}
                      <Badge variant="outline" className={
                        currentOverride.isValid 
                          ? 'border-green-300 text-green-700' 
                          : 'border-red-300 text-red-700'
                      }>
                        {currentOverride.isValid ? 'Valid Document' : 'Invalid Document'}
                      </Badge>
                    </p>
                    {currentOverride.reason && (
                      <p className="text-gray-600 italic">"{currentOverride.reason}"</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default StaffDocumentReview;