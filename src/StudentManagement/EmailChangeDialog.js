import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription } from "../components/ui/alert-dialog";
import { getDatabase, ref, get, set } from 'firebase/database';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { Alert, AlertDescription } from "../components/ui/alert";
import { InfoIcon } from 'lucide-react';

export function EmailChangeDialog({ studentData, studentKey, onComplete, onClose }) {
  const [open, setOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailChange = async () => {
    if (!validateEmail(newEmail.trim())) {
      setError('Please enter a valid email address (e.g., name@domain.com) with no spaces before or after');
      return;
    }

    setIsProcessing(true);
    setError('');
    
    const db = getDatabase();
    const sanitizedNewEmail = sanitizeEmail(newEmail);
    
    try {
      // Check if the new email already exists
      const newEmailRef = ref(db, `students/${sanitizedNewEmail}`);
      const snapshot = await get(newEmailRef);
      
      if (snapshot.exists()) {
        setError('This email is already in use');
        setIsProcessing(false);
        return;
      }

      // Get current student data
      const currentStudentRef = ref(db, `students/${studentKey}`);
      const currentStudentSnapshot = await get(currentStudentRef);
      const currentStudentData = currentStudentSnapshot.val();

      // Prepare the new student data
      const newStudentData = { ...currentStudentData };
      
      // Update email in profile
      if (!newStudentData.profile) {
        newStudentData.profile = {};
      }
      newStudentData.profile.StudentEmail = newEmail;
      
      // Remove UID if present
      if (newStudentData.profile.uid) {
        delete newStudentData.profile.uid;
      }

      // Handle previousEmails array
      if (!newStudentData.profile.previousEmails) {
        newStudentData.profile.previousEmails = [studentData.profile.StudentEmail];
      } else if (Array.isArray(newStudentData.profile.previousEmails)) {
        newStudentData.profile.previousEmails.push(studentData.profile.StudentEmail);
      } else {
        newStudentData.profile.previousEmails = [studentData.profile.StudentEmail];
      }

      // Create new student record
      await set(ref(db, `students/${sanitizedNewEmail}`), newStudentData);
      
      setShowConfirmation(true);
      setIsProcessing(false);
      
      if (onComplete) {
        onComplete(sanitizedNewEmail, newEmail);
      }
    } catch (error) {
      console.error("Error during email change:", error);
      setError('An error occurred while changing the email');
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setOpen(true)}
        className="w-full mt-2"
      >
        Change Student Email
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Change Student Email</DialogTitle>
            <DialogDescription className="pt-2">
              In this system, all student data is linked to their email address. To change a student's email, we need to Create a complete copy of the student's profile with the new email.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                Please ensure the student can successfully log in with their new email before removing their old profile.
                The original profile will remain accessible until you verify everything is working correctly.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Current Email</Label>
              <Input 
                value={studentData.profile.StudentEmail} 
                disabled 
              />
            </div>
            
            <div className="space-y-2">
              <Label>New Email</Label>
              <Input
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email"
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEmailChange}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Create New Profile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>New Profile Created Successfully</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                A new student profile has been created with the email: <strong>{newEmail}</strong>
              </p>
              
              <Alert className="mt-4">
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  Next steps:
                  <ol className="list-decimal ml-6 mt-2">
                    <li>Have the student verify they can log in with the new email</li>
                    <li>Check that all course data and progress is visible</li>
                    <li>Once verified, delete the old student</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <p className="text-sm text-muted-foreground mt-4">
                The original profile will remain accessible at: <strong>{studentData.profile.StudentEmail}</strong>
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={() => {
              setShowConfirmation(false);
              setOpen(false);
              if (onClose) onClose();
            }}>
              Close
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}