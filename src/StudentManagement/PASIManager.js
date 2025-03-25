import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { getDatabase, ref, get, update } from 'firebase/database';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { Copy, ClipboardCheck, Check, X, ExternalLink, AlertCircle, Edit, Send, User, CheckCircle, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from "../components/ui/alert";
import EnrollmentStatusEmailDialog from './EnrollmentStatusEmailDialog';
import { 
  COURSE_ENROLLMENT_STATUS_OPTIONS,
  getCourseEnrollmentStatusInfo
} from '../config/DropdownOptions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";



// Define new options for funding and final mark
const FUNDING_OPTIONS = [
  { value: "Yes", label: "Yes", color: "#10B981", icon: Check }, // Green
  { value: "No", label: "No", color: "#EF4444", icon: X }      // Red
];

const PASI_STATUS_OPTIONS = [
  { value: "Yes", label: "Yes", color: "#10B981", icon: Check },       // Green
  { value: "No", label: "No", color: "#EF4444", icon: X },            // Red
  { value: "Pending", label: "Pending", color: "#F59E0B", icon: AlertCircle }  // Amber
];

const PASIManager = ({ studentData, courseId, assignedStaff  }) => {
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pasiData, setPasiData] = useState({
    referenceNumber: '',
    enrollmentStatus: '',
    requestFunding: '',
    submittedFinalMark: '',
    pasiStatus: '' // Added PASI status
  });

 
  const [isEditingASN, setIsEditingASN] = useState(false);
  const [newASN, setNewASN] = useState('');
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  const formatASN = (value) => {
    // Remove any non-digits
    let numbers = value.replace(/\D/g, '');
    
    // Limit to 9 digits
    numbers = numbers.slice(0, 9);
    
    // Add dashes after 4th and 8th digits if they exist
    if (numbers.length > 4) {
      numbers = numbers.slice(0, 4) + '-' + numbers.slice(4);
    }
    if (numbers.length > 9) {
      numbers = numbers.slice(0, 9) + '-' + numbers.slice(9);
    }
    
    return numbers;
  };

  useEffect(() => {
    const fetchPasiData = async () => {
      if (!studentData || !courseId) return;

      const db = getDatabase();
      const studentKey = sanitizeEmail(studentData.profile.StudentEmail);
      const pasiRef = ref(db, `students/${studentKey}/courses/${courseId}`);

      try {
        const snapshot = await get(pasiRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setPasiData({
            referenceNumber: data.pasiReferenceNumber || '',
            enrollmentStatus: data.pasiEnrollmentStatus || '',
            requestFunding: data.pasiRequestFunding || '',
            submittedFinalMark: data.pasiSubmittedFinalMark || '',
            pasiStatus: data.PASI?.Value || '' // Get PASI status value
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching PASI data:', error);
        setError('Failed to load PASI data');
        setLoading(false);
      }
    };

    fetchPasiData();
  }, [studentData, courseId]);

  // Handler for starting ASN edit
  const handleStartEditASN = () => {
    setNewASN(studentData?.profile?.asn || '');
    setIsEditingASN(true);
  };

  // Modified ASN update handler
  const handleASNUpdate = async () => {
    if (!studentData) return;
    setError(null);
  
    const db = getDatabase();
    const studentKey = sanitizeEmail(studentData.profile.StudentEmail);
    
    try {
      await update(ref(db), {
        [`students/${studentKey}/profile/asn`]: newASN
      });
      
      // Just close the dialog - the parent component will handle the refresh
      setIsEditingASN(false);
    
    } catch (error) {
      console.error('Error updating ASN:', error);
      setError('Failed to update ASN');
    }
  };

  const handleUpdate = async (field, value) => {
    if (!studentData || !courseId) return;
    setError(null);

    const db = getDatabase();
    const studentKey = sanitizeEmail(studentData.profile.StudentEmail);
    const updates = {};
    updates[`students/${studentKey}/courses/${courseId}/${field}`] = value;

    try {
      await update(ref(db), updates);
      setPasiData(prev => ({ 
        ...prev, 
        [field.replace('pasi', '').toLowerCase()]: value 
      }));
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      setError(`Failed to update ${field}`);
    }
  };

  const handlePasiStatusUpdate = async (value) => {
    if (!studentData || !courseId) return;
    setError(null);

    const db = getDatabase();
    const studentKey = sanitizeEmail(studentData.profile.StudentEmail);
    const updates = {};
    
    // Update both Value and Id fields for PASI status
    updates[`students/${studentKey}/courses/${courseId}/PASI/Value`] = value;
    updates[`students/${studentKey}/courses/${courseId}/PASI/Id`] = PASI_STATUS_OPTIONS.findIndex(opt => opt.value === value) + 1;

    try {
      await update(ref(db), updates);
      setPasiData(prev => ({ ...prev, pasiStatus: value }));
    } catch (error) {
      console.error('Error updating PASI status:', error);
      setError('Failed to update PASI status');
    }
  };

  const openPASIEnrollment = () => {
    if (!pasiData.referenceNumber) return;
    window.open(`https://extranet.education.alberta.ca/PASI/PASIprep/course-enrolment/${pasiData.referenceNumber}/edit`, '_blank');
  };

  const copyASN = async () => {
    try {
      await navigator.clipboard.writeText(studentData.profile.asn || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy ASN');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ASN Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Alberta Student Number (ASN)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input
              value={studentData?.profile?.asn || ''}
              className="font-mono"
              readOnly
            />
            <Button 
              size="sm" 
              variant="outline" 
              onClick={copyASN}
              className="flex-shrink-0"
            >
              {copied ? <ClipboardCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleStartEditASN}
              className="flex-shrink-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

    {/* ASN Edit Dialog */}
<Dialog open={isEditingASN} onOpenChange={setIsEditingASN}>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Edit ASN</DialogTitle>
      <DialogDescription>
        Update the Alberta Student Number (ASN). Please verify the number carefully before saving.
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="asn">ASN</Label>
        <Input
          id="asn"
          value={newASN}
          onChange={(e) => {
            const formattedASN = formatASN(e.target.value);
            setNewASN(formattedASN);
          }}
          className="font-mono"
          placeholder="123456789"
          maxLength={11}
        />
        <p className="text-sm text-muted-foreground">
          Enter 9 digits - dashes will be added automatically
        </p>
      </div>
      {studentData?.profile?.asn && (
        <div className="text-sm text-muted-foreground">
          Current ASN: <span className="font-mono">{studentData.profile.asn}</span>
        </div>
      )}
    </div>
    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => setIsEditingASN(false)}
      >
        Cancel
      </Button>
      <Button
        onClick={handleASNUpdate}
        className="bg-[#1fa6a7] text-white hover:bg-[#1a8f90]"
        disabled={!newASN || newASN.replace(/\D/g, '').length !== 9}
      >
        Save Changes
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>




      {/* PASI Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">PASI Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* PASI Status */}
          <div className="space-y-2">
            <Label>In PASI?</Label>
            <Select
              value={pasiData.pasiStatus}
              onValueChange={handlePasiStatusUpdate}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select PASI status" />
              </SelectTrigger>
              <SelectContent>
                {PASI_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center">
                      <option.icon className="h-4 w-4 mr-2" style={{ color: option.color }} />
                      <span style={{ color: option.color }}>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reference Number with PASI Link Button */}
          <div className="space-y-2">
            <Label>Reference Number</Label>
            <div className="flex items-start gap-4">
              <div className="flex-1 space-y-2">
                <Input
                  value={pasiData.referenceNumber}
                  onChange={(e) => handleUpdate('pasiReferenceNumber', e.target.value)}
                  placeholder="Enter reference number"
                />
                {!pasiData.referenceNumber && (
                  <Alert variant="warning" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Enter a reference number to create a direct link to student in PASI
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              <Button 
                onClick={openPASIEnrollment}
                disabled={!pasiData.referenceNumber}
                className="flex-shrink-0 bg-[#1fa6a7] text-white hover:bg-[#1a8f90]"
              >
                <ExternalLink className="h-4 w-4 mr-2 text-white" />
                <span>PASI Enrollment</span>
              </Button>
            </div>
          </div>

          {/* Course Enrollment Status */}
          <div className="space-y-2">
            <Label>Course Enrollment Status</Label>
            <Select
              value={pasiData.enrollmentStatus}
              onValueChange={(value) => handleUpdate('pasiEnrollmentStatus', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select enrollment status" />
              </SelectTrigger>
              <SelectContent>
                {COURSE_ENROLLMENT_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center">
                      <option.icon className="h-4 w-4 mr-2" style={{ color: option.color }} />
                      <span style={{ color: option.color }}>{option.value}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

         {/* Update the button section */}
<div className="mt-2">
  {studentData?.courses?.[courseId]?.categories ? (
    Object.entries(studentData.courses[courseId].categories).some(([teacherEmail, categories]) => {
      return Object.entries(categories).some(([categoryKey, value]) => {
        return categoryKey === `PASI_${pasiData.enrollmentStatus}` && (value === true || value === false);
      });
    }) ? (
      Object.entries(studentData.courses[courseId].categories).map(([teacherEmail, categories]) => {
        return Object.entries(categories).map(([categoryKey, value]) => {
          if (categoryKey === `PASI_${pasiData.enrollmentStatus}`) {
            const teacher = assignedStaff.find(staff => sanitizeEmail(staff.email) === teacherEmail);
            const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : teacherEmail;
            return (
              <Button
                key={categoryKey}
                variant="outline"
                className="w-full"
                disabled={true}
              >
                {value ? 
                  <AlertCircle className="h-4 w-4 mr-2 text-amber-500" /> : 
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />}
                {value ? 
                  `Category Assigned to ${teacherName}` : 
                  `Category Completed by ${teacherName}`}
              </Button>
            );
          }
          return null;
        });
      })
    ) : (
      <Button
        onClick={() => setEmailDialogOpen(true)}
        variant="outline"
        className="w-full"
        disabled={!pasiData.enrollmentStatus}
      >
        <Send className="h-4 w-4 mr-2" />
        Request Teacher Send {pasiData.enrollmentStatus} Email
      </Button>
    )
  ) : (
    <Button
      onClick={() => setEmailDialogOpen(true)}
      variant="outline"
      className="w-full"
      disabled={!pasiData.enrollmentStatus}
    >
      <Send className="h-4 w-4 mr-2" />
      Request Teacher Send {pasiData.enrollmentStatus} Email
    </Button>
  )}
</div>

{studentData?.courses?.[courseId]?.categories ? (
      <Table>
       <TableHeader>
  <TableRow>
    <TableHead>Category</TableHead>
    <TableHead>Assigned To</TableHead>
    <TableHead>Status</TableHead>
    <TableHead>Actions</TableHead>
  </TableRow>
</TableHeader>
        <TableBody>
          {Object.entries(studentData.courses[courseId].categories).map(([teacherEmail, categories]) => (
            Object.entries(categories).map(([categoryKey, value]) => {
              if (!categoryKey.startsWith('PASI_')) return null;
              
              // Get the status from the category key (e.g., "PASI_Withdrawn" -> "Withdrawn")
              const status = categoryKey.split('_')[1];
              const statusInfo = getCourseEnrollmentStatusInfo(status);
              
              // Find the teacher in assignedStaff
              const teacher = assignedStaff.find(staff => 
                sanitizeEmail(staff.email) === teacherEmail
              );

              return (
                <TableRow key={`${teacherEmail}-${categoryKey}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {statusInfo.icon && (
                        <statusInfo.icon 
                          className="h-4 w-4" 
                          style={{ color: statusInfo.color }} 
                        />
                      )}
                      <span>Send {status} Status Email</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {teacher ? (
                      <span>{teacher.firstName} {teacher.lastName}</span>
                    ) : (
                      <span className="text-muted-foreground">{teacherEmail}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={value ? "secondary" : "success"}
                      className={`${value ? "bg-gray-100 text-gray-800" : "bg-green-100 text-green-800"}`}
                    >
                      {value ? "Assigned" : "Completed"}
                    </Badge>
                  </TableCell>
                  <TableCell>
    <Select
      defaultValue={value === true ? "assigned" : value === false ? "completed" : "current"}
      onValueChange={async (newValue) => {
        const db = getDatabase();
        const studentKey = sanitizeEmail(studentData.profile.StudentEmail);
        const updates = {};

        if (newValue === "remove") {
          // Remove the category
          updates[`students/${studentKey}/courses/${courseId}/categories/${teacherEmail}/${categoryKey}`] = null;
        } else {
          // Update the status
          updates[`students/${studentKey}/courses/${courseId}/categories/${teacherEmail}/${categoryKey}`] = 
            newValue === "assigned" ? true : false;
        }

        try {
          await update(ref(db), updates);
          toast.success(
            newValue === "remove" 
              ? "Category removed successfully" 
              : "Category status updated successfully"
          );
        } catch (error) {
          console.error('Error updating category:', error);
          toast.error("Failed to update category");
        }
      }}
    >
      <SelectTrigger className="w-[130px]">
        <SelectValue placeholder="Select action" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Change Status</SelectLabel>
          <SelectItem value="assigned">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
              <span>Assigned</span>
            </div>
          </SelectItem>
          <SelectItem value="completed">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              <span>Completed</span>
            </div>
          </SelectItem>
          <SelectItem value="remove" className="text-red-500">
            <div className="flex items-center">
              <Trash2 className="h-4 w-4 mr-2" />
              <span>Remove Category</span>
            </div>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  </TableCell>

                </TableRow>
              );
            })
          ))}
        </TableBody>
      </Table>
    ) : (
      <div className="text-center py-4 text-muted-foreground">
        No PASI categories assigned
      </div>
    )}

          {/* Request Funding */}
          <div className="space-y-2">
            <Label>Request Funding</Label>
            <Select
              value={pasiData.requestFunding}
              onValueChange={(value) => handleUpdate('pasiRequestFunding', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select funding status" />
              </SelectTrigger>
              <SelectContent>
                {FUNDING_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center">
                      <option.icon className="h-4 w-4 mr-2" style={{ color: option.color }} />
                      <span style={{ color: option.color }}>{option.value}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submitted Final Mark */}
          <div className="space-y-2">
            <Label>Submitted Final Mark</Label>
            <Select
              value={pasiData.submittedFinalMark}
              onValueChange={(value) => handleUpdate('pasiSubmittedFinalMark', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select final mark status" />
              </SelectTrigger>
              <SelectContent>
                {FUNDING_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center">
                      <option.icon className="h-4 w-4 mr-2" style={{ color: option.color }} />
                      <span style={{ color: option.color }}>{option.value}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <EnrollmentStatusEmailDialog
  open={emailDialogOpen}
  onOpenChange={setEmailDialogOpen}
  enrollmentStatus={pasiData.enrollmentStatus}
  courseId={courseId}
  studentData={studentData}
  assignedStaff={assignedStaff} 
/>
      
    </div>
  );
};

export default PASIManager;
