import React, { useState, useMemo } from 'react';
import { getDatabase, ref, update } from 'firebase/database';
import { useAuth } from '../../context/AuthContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '../../components/ui/sheet';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Separator } from '../../components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Hash,
  User,
  Calendar,
  MapPin,
  FileText,
  Download,
  ExternalLink,
  Eye,
  History,
  Shield,
  BookOpen,
  Phone,
  Mail,
  Edit,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Home,
  CreditCard,
  Loader2,
  Copy,
  FileDown,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckSquare,
  AlertTriangle
} from 'lucide-react';
import { formatDateForDisplay } from '../../utils/timeZoneUtils';
import { toast } from 'sonner';
import DocumentViewer from './DocumentViewer';

const RegistrationDetailSheet = ({
  isOpen,
  onClose,
  student,
  familyData,
  schoolYear,
  onUpdate
}) => {
  const { user } = useAuth();
  const [editedData, setEditedData] = useState({});
  const [saving, setSaving] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerDocument, setViewerDocument] = useState(null);
  const [showVersionHistory, setShowVersionHistory] = useState({});
  const [saveTimeout, setSaveTimeout] = useState(null);
  
  const dbSchoolYear = schoolYear.replace('/', '_');
  
  // Get all relevant data
  const notificationForm = familyData?.NOTIFICATION_FORMS?.[dbSchoolYear]?.[student.id];
  const citizenshipDocs = familyData?.STUDENT_CITIZENSHIP_DOCS?.[student.id];
  const soloPlan = familyData?.SOLO_EDUCATION_PLANS?.[dbSchoolYear]?.[student.id];
  const pasiRegistration = familyData?.PASI_REGISTRATIONS?.[dbSchoolYear]?.[student.id];
  
  // Get primary guardian
  const primaryGuardian = useMemo(() => {
    if (!familyData?.guardians) return null;
    return Object.values(familyData.guardians).find(g => g.guardianType === 'primary_guardian') ||
           Object.values(familyData.guardians)[0];
  }, [familyData]);
  
  // Get all guardians
  const allGuardians = useMemo(() => {
    if (!familyData?.guardians) return [];
    return Object.values(familyData.guardians);
  }, [familyData]);
  
  // Get student address
  const studentAddress = useMemo(() => {
    // Check if student has their own address
    if (!student.usePrimaryAddress && student.address) {
      return student.address;
    }
    // Otherwise use primary guardian address
    return primaryGuardian?.address;
  }, [student, primaryGuardian]);
  
  // Calculate student age
  const age = useMemo(() => {
    if (!student.birthday) return null;
    const birthDate = new Date(student.birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }, [student.birthday]);
  
  // Get Alberta courses in uppercase
  const albertaCourses = useMemo(() => {
    if (!soloPlan?.followAlbertaPrograms || !soloPlan?.selectedAlbertaCourses) return [];
    
    const courses = [];
    Object.entries(soloPlan.selectedAlbertaCourses).forEach(([category, selectedCourses]) => {
      selectedCourses.forEach(courseId => {
        courses.push({
          category: category.replace(/_/g, ' ').toUpperCase(),
          code: courseId.toUpperCase()
        });
      });
    });
    return courses;
  }, [soloPlan]);
  
  // Handle field update with auto-save
  const handleFieldUpdate = async (field, value) => {
    // Update local state immediately
    setEditedData(prev => ({ ...prev, [field]: value }));
    
    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    // Set new timeout for auto-save (debounced)
    const newTimeout = setTimeout(async () => {
      setSaving(true);
      try {
        const db = getDatabase();
        const studentRef = ref(db, `homeEducationFamilies/familyInformation/${student.familyId}/students/${student.id}`);
        
        await update(studentRef, {
          [field]: value,
          updatedAt: Date.now(),
          updatedBy: user.uid
        });
        
        toast.success(`${field} updated successfully`);
        if (onUpdate) onUpdate();
      } catch (error) {
        console.error(`Error updating ${field}:`, error);
        toast.error(`Failed to update ${field}`);
      }
      setSaving(false);
    }, 1000); // Auto-save after 1 second of no typing
    
    setSaveTimeout(newTimeout);
  };
  
  // Handle guardian field update
  const handleGuardianFieldUpdate = async (guardianId, field, value) => {
    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    // Set new timeout for auto-save (debounced)
    const newTimeout = setTimeout(async () => {
      setSaving(true);
      try {
        const db = getDatabase();
        const guardianRef = ref(db, `homeEducationFamilies/familyInformation/${student.familyId}/guardians/${guardianId}`);
        
        await update(guardianRef, {
          [field]: value,
          updatedAt: Date.now(),
          updatedBy: user.uid
        });
        
        toast.success(`Guardian ${field} updated successfully`);
        if (onUpdate) onUpdate();
      } catch (error) {
        console.error(`Error updating guardian ${field}:`, error);
        toast.error(`Failed to update guardian ${field}`);
      }
      setSaving(false);
    }, 1000);
    
    setSaveTimeout(newTimeout);
  };
  
  
  // Handle document download
  const handleDownloadDocument = (url, filename) => {
    window.open(url, '_blank');
  };
  
  // Handle view document
  const handleViewDocument = (doc) => {
    setViewerDocument(doc);
    setViewerOpen(true);
  };
  
  
  // Copy ASN to clipboard
  const copyAsn = () => {
    if (student.asn) {
      navigator.clipboard.writeText(student.asn);
      toast.success('ASN copied to clipboard');
    }
  };
  
  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent size="xl" className="w-full sm:max-w-4xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              <span>Student Registration Details</span>
              {saving && (
                <div className="flex items-center text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </div>
              )}
            </SheetTitle>
            <SheetDescription>
              Complete registration information for PASI system entry
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6">
            <Tabs defaultValue="student" className="w-full">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="student">Student Info</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="program">Program</TabsTrigger>
                <TabsTrigger value="guardians">Guardians</TabsTrigger>
              </TabsList>
              
              {/* Student Information Tab */}
              <TabsContent value="student" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Basic Information</span>
                      <span className="text-xs text-gray-500 font-normal">All fields are directly editable</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>First Name</Label>
                        <Input 
                          value={editedData.firstName !== undefined ? editedData.firstName : student.firstName} 
                          onChange={(e) => handleFieldUpdate('firstName', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Last Name</Label>
                        <Input 
                          value={editedData.lastName !== undefined ? editedData.lastName : student.lastName} 
                          onChange={(e) => handleFieldUpdate('lastName', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Preferred Name</Label>
                        <Input 
                          value={editedData.preferredName !== undefined ? editedData.preferredName : (student.preferredName || '')} 
                          onChange={(e) => handleFieldUpdate('preferredName', e.target.value)}
                          placeholder="Enter preferred name (optional)"
                        />
                      </div>
                      <div>
                        <Label>ASN (Alberta Student Number)</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            value={editedData.asn !== undefined ? editedData.asn : (student.asn || '')}
                            onChange={(e) => handleFieldUpdate('asn', e.target.value)}
                            placeholder="Enter ASN (e.g., 123456789 or 1234-5678-9)"
                            className={!student.asn && !editedData.asn ? 'border-red-500' : ''}
                          />
                          {(student.asn || editedData.asn) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={copyAsn}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        {!student.asn && (
                          <p className="text-xs text-red-600 mt-1">
                            ASN is required for PASI registration
                          </p>
                        )}
                      </div>
                      <div>
                        <Label>Birthday</Label>
                        <Input 
                          type="date"
                          value={editedData.birthday !== undefined ? editedData.birthday : (student.birthday || '')} 
                          onChange={(e) => handleFieldUpdate('birthday', e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">Age: {age} years</p>
                      </div>
                      <div>
                        <Label>Gender</Label>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={editedData.gender !== undefined ? editedData.gender : (student.gender || '')} 
                          onChange={(e) => handleFieldUpdate('gender', e.target.value)}
                        >
                          <option value="">Select Gender</option>
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                          <option value="O">Other</option>
                        </select>
                      </div>
                      <div>
                        <Label>Grade</Label>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={editedData.grade !== undefined ? editedData.grade : (student.grade || '')} 
                          onChange={(e) => handleFieldUpdate('grade', e.target.value)}
                        >
                          <option value="">Select Grade</option>
                          <option value="K">Kindergarten</option>
                          {[...Array(12)].map((_, i) => (
                            <option key={i + 1} value={String(i + 1)}>Grade {i + 1}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <Label>Email</Label>
                        <Input 
                          type="email"
                          value={editedData.email !== undefined ? editedData.email : (student.email || '')} 
                          onChange={(e) => handleFieldUpdate('email', e.target.value)}
                          placeholder="Enter student email (optional)"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Current Address</CardTitle>
                    <CardDescription>
                      Student's registered address for {schoolYear}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {studentAddress ? (
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                          <div>
                            <p className="font-medium">{studentAddress.streetAddress}</p>
                            <p className="text-sm text-gray-600">
                              {studentAddress.city}, {studentAddress.province} {studentAddress.postalCode}
                            </p>
                            <p className="text-sm text-gray-600">{studentAddress.country || 'Canada'}</p>
                          </div>
                        </div>
                        {primaryGuardian?.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{primaryGuardian.phone}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>No address information available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Documents Tab */}
              <TabsContent value="documents" className="space-y-4">
                {/* Notification Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Notification Form</span>
                      {notificationForm?.submissionStatus === 'submitted' ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Submitted
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          <X className="w-3 h-3 mr-1" />
                          Missing
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {notificationForm?.pdfVersions && notificationForm.pdfVersions.length > 0 ? (
                      <div className="space-y-3">
                        {/* Latest Version */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-8 h-8 text-blue-600" />
                            <div>
                              <p className="font-medium">Latest Version</p>
                              <p className="text-sm text-gray-500">
                                Generated {formatDateForDisplay(new Date(notificationForm.pdfVersions[notificationForm.pdfVersions.length - 1].generatedAt))}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDocument({
                                type: 'pdf',
                                url: notificationForm.pdfVersions[notificationForm.pdfVersions.length - 1].url,
                                name: 'Notification Form'
                              })}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadDocument(
                                notificationForm.pdfVersions[notificationForm.pdfVersions.length - 1].url,
                                notificationForm.pdfVersions[notificationForm.pdfVersions.length - 1].filename
                              )}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                        
                        {/* Version History */}
                        {notificationForm.pdfVersions.length > 1 && (
                          <div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowVersionHistory({
                                ...showVersionHistory,
                                notification: !showVersionHistory.notification
                              })}
                              className="w-full justify-between"
                            >
                              <span className="flex items-center">
                                <History className="w-4 h-4 mr-2" />
                                Version History ({notificationForm.pdfVersions.length} versions)
                              </span>
                              {showVersionHistory.notification ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </Button>
                            
                            {showVersionHistory.notification && (
                              <div className="mt-2 space-y-2">
                                {notificationForm.pdfVersions.slice(0, -1).reverse().map((version, index) => (
                                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                                    <span>Version {notificationForm.pdfVersions.length - index - 1}</span>
                                    <span className="text-gray-500">{formatDateForDisplay(new Date(version.generatedAt))}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDownloadDocument(version.url, version.filename)}
                                    >
                                      <Download className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>No notification form available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Citizenship Documents */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Citizenship Documents</span>
                      {citizenshipDocs?.staffApproval?.isApproved ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Approved
                        </Badge>
                      ) : citizenshipDocs?.requiresStaffReview ? (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Review Required
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          <X className="w-3 h-3 mr-1" />
                          Missing
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {citizenshipDocs?.documents && citizenshipDocs.documents.length > 0 ? (
                      <div className="space-y-3">
                        {citizenshipDocs.documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Shield className="w-8 h-8 text-green-600" />
                              <div>
                                <p className="font-medium">{doc.typeLabel || doc.type}</p>
                                <p className="text-sm text-gray-500">
                                  Uploaded {formatDateForDisplay(new Date(doc.uploadedAt))}
                                </p>
                                {citizenshipDocs.staffApproval?.approvedBy && (
                                  <p className="text-xs text-green-600">
                                    Approved by {citizenshipDocs.staffApproval.approvedBy.name}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDocument({
                                  type: 'image',
                                  url: doc.url,
                                  name: doc.name
                                })}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadDocument(doc.url, doc.name)}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <Shield className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>No citizenship documents available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Education Plan */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Education Plan (SOLO)</span>
                      {soloPlan?.submissionStatus === 'submitted' ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Submitted
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          <X className="w-3 h-3 mr-1" />
                          Missing
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {soloPlan?.pdfVersions && soloPlan.pdfVersions.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <BookOpen className="w-8 h-8 text-purple-600" />
                            <div>
                              <p className="font-medium">Education Plan</p>
                              <p className="text-sm text-gray-500">
                                {soloPlan.followAlbertaPrograms ? 'Following Alberta Curriculum' : 'Custom Plan'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDocument({
                                type: 'pdf',
                                url: soloPlan.pdfVersions[soloPlan.pdfVersions.length - 1].url,
                                name: 'Education Plan'
                              })}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadDocument(
                                soloPlan.pdfVersions[soloPlan.pdfVersions.length - 1].url,
                                soloPlan.pdfVersions[soloPlan.pdfVersions.length - 1].filename
                              )}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>No education plan available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Program Tab */}
              <TabsContent value="program" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Education Program Details</CardTitle>
                    <CardDescription>
                      Student's educational program for {schoolYear}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {soloPlan ? (
                      <>
                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                          <div>
                            <p className="font-medium text-purple-900">Program Type</p>
                            <p className="text-sm text-purple-700">
                              {soloPlan.followAlbertaPrograms ? 
                                'Following Alberta Programs of Study' : 
                                'Custom Education Plan'}
                            </p>
                          </div>
                          {soloPlan.followAlbertaPrograms && (
                            <Badge className="bg-purple-100 text-purple-800">
                              Alberta Curriculum
                            </Badge>
                          )}
                        </div>
                        
                        {soloPlan.followAlbertaPrograms && albertaCourses.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Selected Alberta Courses</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {albertaCourses.map((course, index) => (
                                <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                                  <span className="font-medium">{course.code}</span>
                                  <span className="text-gray-500 ml-2 text-xs">{course.category}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {soloPlan.otherCourses && soloPlan.otherCourses.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Additional Courses</h4>
                            <div className="space-y-2">
                              {soloPlan.otherCourses.map((course, index) => (
                                <div key={index} className="p-3 bg-gray-50 rounded">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <p className="font-medium">{course.courseName}</p>
                                      <p className="text-sm text-gray-600">{course.description}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-medium">{course.courseCode}</p>
                                      {course.forCredit && (
                                        <p className="text-xs text-gray-500">{course.credits} credits</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {soloPlan.facilitatorName && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-700">Facilitator</p>
                            <p className="font-medium text-blue-900">{soloPlan.facilitatorName}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>No education plan submitted</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Guardians Tab */}
              <TabsContent value="guardians" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Guardian Information</CardTitle>
                    <CardDescription>
                      Parents and guardians registered for this student
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {allGuardians.map((guardian, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-lg">
                              {guardian.firstName} {guardian.lastName}
                            </p>
                            <Badge className={guardian.guardianType === 'primary_guardian' ? 
                              'bg-purple-100 text-purple-800' : 
                              'bg-gray-100 text-gray-800'}>
                              {guardian.guardianType === 'primary_guardian' ? 'Primary Guardian' : 'Guardian'}
                            </Badge>
                          </div>
                          {guardian.guardianType === 'primary_guardian' && (
                            <Badge className="bg-blue-100 text-blue-800">
                              Primary Contact
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {guardian.email && (
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4 text-gray-500" />
                              <span>{guardian.email}</span>
                            </div>
                          )}
                          {guardian.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-gray-500" />
                              <span>{guardian.phone}</span>
                            </div>
                          )}
                          {guardian.relationToStudents && (
                            <div className="flex items-center space-x-2">
                              <UserCheck className="w-4 h-4 text-gray-500" />
                              <span>{guardian.relationToStudents}</span>
                            </div>
                          )}
                          {guardian.address && (
                            <div className="flex items-center space-x-2 col-span-2">
                              <Home className="w-4 h-4 text-gray-500" />
                              <span>
                                {guardian.address.streetAddress}, {guardian.address.city}, {guardian.address.province} {guardian.address.postalCode}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                
                {/* Facilitator Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Facilitator Assignment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {familyData?.facilitatorEmail ? (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-700">Assigned Facilitator</p>
                        <p className="font-medium text-green-900">{familyData.facilitatorEmail}</p>
                      </div>
                    ) : (
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <p className="text-sm text-orange-700">No Facilitator Assigned</p>
                        <p className="text-xs text-orange-600 mt-1">
                          Please assign a facilitator before PASI registration
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Document Viewer */}
      {viewerDocument && (
        <DocumentViewer
          isOpen={viewerOpen}
          onClose={() => {
            setViewerOpen(false);
            setViewerDocument(null);
          }}
          document={viewerDocument}
        />
      )}
      
    </>
  );
};

export default RegistrationDetailSheet;