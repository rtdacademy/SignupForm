import React, { useState, useEffect } from 'react';
import { getDatabase, ref, update } from 'firebase/database';
import { FaPlus, FaTrash, FaCheck } from 'react-icons/fa';
import { ScrollArea } from '../components/ui/scroll-area';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetFooter
} from '../components/ui/sheet';

function ImprovedEmailManager({ courseId, allowedEmails = [], isEditing, onUpdate }) {
  // Track whether the sheet is open
  const [open, setOpen] = useState(false);
  
  // Working copy of data that we only save on explicit confirmation
  const [localEmails, setLocalEmails] = useState([]);
  const [localRestrictionEnabled, setLocalRestrictionEnabled] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Initialize local state when sheet opens or props change
  useEffect(() => {
    if (open || allowedEmails !== localEmails) {
      setLocalEmails(allowedEmails || []);
      setLocalRestrictionEnabled(Boolean(allowedEmails && allowedEmails.length > 0));
    }
  }, [open, allowedEmails]);
  
  // Handle adding a new email to local state only
  const handleAddEmail = (e) => {
    e.preventDefault();
    
    if (!newEmail.trim() || !validateEmail(newEmail)) return;
    
    const trimmedEmail = newEmail.trim().toLowerCase();
    
    // Check for duplicates
    if (localEmails.includes(trimmedEmail)) {
      alert('This email is already in the list.');
      return;
    }
    
    // Update local state only, not database
    setLocalEmails([...localEmails, trimmedEmail]);
    setNewEmail('');
    
    // Show success message
    setSuccessMessage(`Added ${trimmedEmail}`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  
  // Handle deleting an email from local state only
  const handleDeleteEmail = (index) => {
    const updatedEmails = localEmails.filter((_, i) => i !== index);
    setLocalEmails(updatedEmails);
  };
  
  // Toggle email restriction in local state only
  const handleToggleRestriction = (checked) => {
    setLocalRestrictionEnabled(checked);
    
    // If turning off restrictions, clear the local email list
    if (!checked) {
      setLocalEmails([]);
    }
  };
  
  // Save changes to database when explicitly confirmed
  const handleSaveChanges = async () => {
    try {
      const db = getDatabase();
      const courseRef = ref(db, `courses/${courseId}`);
      
      // Determine what to save - if restriction is disabled, clear the list
      const emailsToSave = localRestrictionEnabled ? localEmails : [];
      
      // Only store non-empty arrays in the database
      await update(courseRef, { 
        allowedEmails: emailsToSave.length > 0 ? emailsToSave : null 
      });
      
      // Update parent component
      if (typeof onUpdate === 'function') {
        onUpdate(emailsToSave);
      }
      
      // Close the sheet
      setOpen(false);
    } catch (error) {
      console.error('Error updating allowed emails:', error);
      alert('An error occurred while updating allowed emails.');
    }
  };
  
  // Cancel changes and reset to last saved state
  const handleCancelChanges = () => {
    setLocalEmails(allowedEmails || []);
    setLocalRestrictionEnabled(Boolean(allowedEmails && allowedEmails.length > 0));
    setOpen(false);
  };
  
  // Validate email format
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          type="button"
          disabled={!isEditing}
          className="flex items-center"
        >
          {allowedEmails && allowedEmails.length > 0 
            ? 'Manage Restricted Emails' 
            : 'Add Email Restrictions'}
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="right"
        className="w-[400px] sm:w-[540px]"
      >
        <SheetHeader>
          <SheetTitle>Email Restriction Management</SheetTitle>
          <SheetDescription>
            Restrict this course to specific email addresses. If no emails are added, the course will be available to all students.
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6">
          <div className="flex items-center space-x-2 py-2 border-t border-b">
            <Switch
              checked={localRestrictionEnabled}
              onCheckedChange={handleToggleRestriction}
              disabled={!isEditing}
            />
            <span className="font-medium">
              {localRestrictionEnabled 
                ? 'Email restriction enabled' 
                : 'Course available to all students'}
            </span>
          </div>
          
          {localRestrictionEnabled && (
            <ScrollArea className="h-[calc(100vh-340px)] mt-6">
              <div className="space-y-4 pr-4">
                <form onSubmit={handleAddEmail} className="flex gap-2">
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter email address"
                    disabled={!isEditing}
                    className="flex-1"
                  />
                  <Button 
                    type="submit"
                    disabled={!isEditing || !newEmail.trim() || !validateEmail(newEmail)}
                  >
                    <FaPlus className="mr-1" /> Add
                  </Button>
                </form>
                
                {showSuccess && (
                  <div className="flex items-center bg-green-100 text-green-700 p-2 rounded-md">
                    <FaCheck className="mr-2" />
                    <span>{successMessage}</span>
                  </div>
                )}
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Allowed Emails</h3>
                  <div className="border rounded-md p-2">
                    {localEmails.length === 0 ? (
                      <p className="text-gray-500 text-sm">No emails added. Add emails to restrict course access.</p>
                    ) : (
                      <div className="space-y-2">
                        {localEmails.map((email, index) => (
                          <div 
                            key={index} 
                            className="flex justify-between items-center p-2 bg-gray-50 rounded-md"
                          >
                            <span className="text-sm">{email}</span>
                            {isEditing && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteEmail(index)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <FaTrash size={14} />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </div>
        
        <SheetFooter className="pt-4 border-t flex justify-between sm:justify-between">
          <Button 
            variant="outline" 
            onClick={handleCancelChanges}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveChanges}
            disabled={!isEditing}
          >
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default ImprovedEmailManager;