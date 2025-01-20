import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Send, User } from "lucide-react";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { getDatabase, ref, get, update } from 'firebase/database';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { getCourseEnrollmentStatusInfo } from '../config/DropdownOptions';
import { toast } from "sonner";

const EnrollmentStatusEmailDialog = ({ 
  open, 
  onOpenChange, 
  enrollmentStatus, 
  courseId,
  studentData,
  assignedStaff = []
}) => {
  const [selectedStaffEmail, setSelectedStaffEmail] = useState(assignedStaff[0]?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getStaffDisplayName = (staff) => {
    return `${staff.firstName} ${staff.lastName} (${staff.role})`;
  };

  const selectedStaff = assignedStaff.find(staff => staff.email === selectedStaffEmail);

  const handleSubmit = async () => {
    if (!selectedStaff || !enrollmentStatus || !studentData?.profile?.StudentEmail || !courseId) return;
    
    setIsSubmitting(true);
    const db = getDatabase();
    const sanitizedTeacherEmail = sanitizeEmail(selectedStaff.email);
    const studentKey = sanitizeEmail(studentData.profile.StudentEmail);
    const statusInfo = getCourseEnrollmentStatusInfo(enrollmentStatus);
    const categoryKey = `PASI_${enrollmentStatus}`;

    try {
      // Check if category already exists
      const categoriesRef = ref(db, `teacherCategories/${sanitizedTeacherEmail}/${categoryKey}`);
      const snapshot = await get(categoriesRef);

      const updates = {};

      // If category doesn't exist, create it
      if (!snapshot.exists()) {
        updates[`teacherCategories/${sanitizedTeacherEmail}/${categoryKey}`] = {
          archived: false,
          color: statusInfo.color,
          icon: statusInfo.iconName,
          name: statusInfo.categoryName,
          type: "PASI"
        };
      }

      // Add category to student's course
      updates[`students/${studentKey}/courses/${courseId}/categories/${sanitizedTeacherEmail}/${categoryKey}`] = true;

      // Perform all updates
      await update(ref(db), updates);

      toast.success(`Email request category ${snapshot.exists() ? 'assigned' : 'created and assigned'} successfully`);
      onOpenChange(false);
    } catch (error) {
      console.error('Error managing category:', error);
      toast.error("Failed to manage email request category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request {enrollmentStatus} Status Email</DialogTitle>
          <DialogDescription>
            Select a staff member to send an email about the student's {enrollmentStatus.toLowerCase()} status.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {assignedStaff.length === 0 ? (
            <Alert>
              <AlertDescription>
                No staff members are currently assigned to this course.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              <Label>Select Staff Member</Label>
              <Select
                value={selectedStaffEmail}
                onValueChange={setSelectedStaffEmail}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a staff member" />
                </SelectTrigger>
                <SelectContent>
                  {assignedStaff.map((staff) => (
                    <SelectItem 
                      key={staff.email} 
                      value={staff.email}
                      className="flex items-center"
                    >
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{getStaffDisplayName(staff)}</span>
                        {staff === assignedStaff[0] && (
                          <span className="ml-2 text-sm text-muted-foreground">
                            (Primary Teacher)
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="text-sm text-muted-foreground space-y-1">
            <p>Selected staff will be requested to email: {studentData?.profile?.StudentEmail}</p>
            <p>Course ID: {courseId}</p>
            <p>Status: {enrollmentStatus}</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-[#1fa6a7] text-white hover:bg-[#1a8f90]"
            disabled={!selectedStaffEmail || assignedStaff.length === 0 || isSubmitting}
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? "Creating..." : "Request Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EnrollmentStatusEmailDialog;