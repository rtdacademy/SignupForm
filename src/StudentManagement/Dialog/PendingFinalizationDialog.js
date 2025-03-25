import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { useAuth } from '../../context/AuthContext';
import { Label } from "../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { getDatabase, ref, get, update } from 'firebase/database';

const PendingFinalizationDialog = ({
  isOpen,
  onOpenChange,
  status,
  studentName,
  courseName,
  studentKey,
  courseId,
  onConfirm,
  onCancel
}) => {
  const isUnenrolled = status === "Unenrolled";
  const { user } = useAuth();
  const userName = user.displayName;

  const [finalMark, setFinalMark] = useState('');
  const [comment, setComment] = useState('');
  const [metFundingRequirements, setMetFundingRequirements] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (isUnenrolled) {
      if (metFundingRequirements === null) {
        alert('Please select whether the student met funding requirements.');
        return;
      }
      if (!comment.trim()) {
        alert('Please provide a comment for unenrollment.');
        return;
      }
      if (metFundingRequirements === "yes" && !finalMark.trim()) {
        alert('Please provide a final mark.');
        return;
      }
    } else if (!finalMark.trim() || !comment.trim()) {
      alert('Please provide both a final mark and a comment.');
      return;
    }

    setIsSubmitting(true);
    const db = getDatabase();

    try {
      // 1. Get existing notes to preserve them
      const notesRef = ref(db, `students/${studentKey}/courses/${courseId}/jsonStudentNotes`);
      const notesSnapshot = await get(notesRef);
      const existingNotes = notesSnapshot.val() || [];
    
      // 2. Create new note
      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      let noteContent;
      let noteType;

      if (isUnenrolled) {
        const fundingStatus = metFundingRequirements === "yes" 
          ? "✔️ Student met funding requirements"
          : "❌ Student did not meet funding requirements";
        
        noteContent = `Unenrolled by ${userName}\nDate: ${formattedDate}\n${fundingStatus}${
          metFundingRequirements === "yes" ? `\n✔️ Final Mark: ${finalMark}%` : ''
        }\nComment: ${comment}`;
        
        noteType = metFundingRequirements === "yes" ? "⛔" : "🚫";
      } else {
        noteContent = `✔️ Final Mark: ${finalMark}% \nSubmitted by ${userName}\nDate: ${formattedDate}\nComment: ${comment}`;
        noteType = "✅";
      }
    
      const newNote = {
        author: userName,
        content: noteContent,
        id: `note-${Date.now()}`,
        noteType,
        timestamp: now.toISOString()
      };
    
      // 3. Update database with path references
      const updates = {
        [`students/${studentKey}/courses/${courseId}/jsonStudentNotes`]: [newNote, ...existingNotes],
        [`students/${studentKey}/courses/${courseId}/teacherFinalMark`]: 
          (isUnenrolled && metFundingRequirements === "no") ? null : Number(finalMark),
        [`students/${studentKey}/courses/${courseId}/ActiveFutureArchived/Value`]: "Pending",
        [`students/${studentKey}/courses/${courseId}/MetFundingRequirements`]: 
          isUnenrolled ? (metFundingRequirements === "yes") : null,
        // Add Status/Value update here
        [`students/${studentKey}/courses/${courseId}/Status/Value`]: status
      };
  
      await update(ref(db), updates);
      await onConfirm();
      
    } catch (error) {
      console.error('Error updating student data:', error);
      alert('An error occurred while saving the data.');
    } finally {
      setIsSubmitting(false);
    }
  }, [isUnenrolled, finalMark, comment, studentKey, courseId, userName, onConfirm, metFundingRequirements, status]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {isUnenrolled ? "Confirm Unenrollment" : "Confirm Course Completion"}
          </DialogTitle>
          <DialogDescription className="pt-4">
            You are about to mark the following student as <strong>{status}</strong>:
            <div className="font-medium mt-2 text-base text-foreground">
              {studentName}
            </div>
            <div className="font-medium mt-1 text-blue-600">
              {courseName}
            </div>
          </DialogDescription>
        </DialogHeader>

        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Setting the student status to {status} will change the state value from 'Active' to 'Pending'. 
            To see both Active and Pending in your list, ensure these filters are set.
          </AlertDescription>
        </Alert>

        <div className="mt-6 space-y-4">
          {isUnenrolled && (
            <div className="space-y-2">
              <Label>Did the student receive a final mark of 25% or greater for the entire course?</Label>
              <RadioGroup
                value={metFundingRequirements}
                onValueChange={setMetFundingRequirements}
                className="flex flex-col space-y-1 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no">No</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {(!isUnenrolled || (isUnenrolled && metFundingRequirements === "yes")) && (
            <div className="space-y-2">
              <Label htmlFor="finalMark">Final Mark (%)</Label>
              <Input
                id="finalMark"
                type="number"
                min="0"
                max="100"
                value={finalMark}
                onChange={(e) => setFinalMark(e.target.value)}
                placeholder="Enter final mark"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={isUnenrolled ? "Enter reason for unenrollment" : "Enter final comment"}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant={isUnenrolled ? "destructive" : "default"}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : `Confirm ${isUnenrolled ? "Unenrollment" : "Completion"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PendingFinalizationDialog;