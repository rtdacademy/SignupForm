import React, { useState, useEffect } from 'react';
import { AlertTriangle, Mail, UserCheck, Info, Loader2, CheckCircle, ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

const ChangeEmailModal = ({ 
  open, 
  onClose, 
  currentEmail, 
  userInfo,
  onConfirm 
}) => {
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [reason, setReason] = useState('');
  const [authMethod, setAuthMethod] = useState('password');
  const [understanding, setUnderstanding] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setNewEmail('');
      setConfirmEmail('');
      setReason('');
      setAuthMethod('password');
      setUnderstanding(false);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [open]);

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!newEmail) {
      newErrors.newEmail = 'New email is required';
    } else if (!validateEmail(newEmail)) {
      newErrors.newEmail = 'Please enter a valid email address';
    } else if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      newErrors.newEmail = 'New email must be different from current email';
    }
    
    if (!confirmEmail) {
      newErrors.confirmEmail = 'Please confirm the new email';
    } else if (confirmEmail !== newEmail) {
      newErrors.confirmEmail = 'Emails do not match';
    }
    
    if (!reason.trim()) {
      newErrors.reason = 'Please provide a reason for the email change';
    }
    
    if (!understanding) {
      newErrors.understanding = 'You must acknowledge understanding of the changes';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onConfirm({
        originalEmail: currentEmail,
        newEmail: newEmail.toLowerCase(),
        familyId: userInfo?.currentClaims?.familyId || null,
        reason: reason.trim(),
        authMethod: authMethod
      });
    } catch (error) {
      console.error('Error in form submission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Extract relevant user information
  const hasFamilyId = userInfo?.currentClaims?.familyId;
  const isPrimaryGuardian = userInfo?.currentClaims?.familyRole === 'primary_guardian';
  
  // If not a primary guardian, show error
  if (!isPrimaryGuardian) {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <ShieldAlert className="w-5 h-5 mr-2" />
              Access Restricted
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Email change is only available for primary guardians. 
                The current user role is: <strong>{userInfo?.currentClaims?.familyRole || 'Not specified'}</strong>
              </AlertDescription>
            </Alert>
            <p className="mt-4 text-sm text-gray-600">
              This feature is specifically designed to change the email address of primary guardians 
              in the home education system. Please contact support if you believe this is an error.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && !isSubmitting && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Mail className="w-5 h-5 mr-2 text-blue-600" />
            Change Primary Guardian Email Address
          </DialogTitle>
          <DialogDescription>
            Update the primary guardian's email address and transfer all permissions and data to the new email.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Current Email Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Email Address
            </label>
            <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              <span className="font-mono text-gray-700">{currentEmail}</span>
            </div>
          </div>

          {/* New Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => {
                setNewEmail(e.target.value);
                if (errors.newEmail) {
                  setErrors(prev => ({ ...prev, newEmail: '' }));
                }
              }}
              placeholder="Enter new email address"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.newEmail ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.newEmail && (
              <p className="mt-1 text-sm text-red-600">{errors.newEmail}</p>
            )}
          </div>

          {/* Confirm Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={confirmEmail}
              onChange={(e) => {
                setConfirmEmail(e.target.value);
                if (errors.confirmEmail) {
                  setErrors(prev => ({ ...prev, confirmEmail: '' }));
                }
              }}
              placeholder="Re-enter new email address"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.confirmEmail ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.confirmEmail && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmEmail}</p>
            )}
          </div>

          {/* Authentication Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How will the guardian sign in? <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <label className="flex items-start cursor-pointer p-3 border rounded-md hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="authMethod"
                  value="google"
                  checked={authMethod === 'google'}
                  onChange={(e) => setAuthMethod(e.target.value)}
                  className="mt-1 mr-3"
                  disabled={isSubmitting}
                />
                <div className="flex-1">
                  <div className="font-medium flex items-center">
                    <span className="mr-2">🇬</span>
                    Google Account
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Guardian will sign in using "Sign in with Google" button. No password needed.
                  </p>
                </div>
              </label>
              
              <label className="flex items-start cursor-pointer p-3 border rounded-md hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="authMethod"
                  value="microsoft"
                  checked={authMethod === 'microsoft'}
                  onChange={(e) => setAuthMethod(e.target.value)}
                  className="mt-1 mr-3"
                  disabled={isSubmitting}
                />
                <div className="flex-1">
                  <div className="font-medium flex items-center">
                    <span className="mr-2">Ⓜ️</span>
                    Microsoft Account
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Guardian will sign in using "Sign in with Microsoft" button. No password needed.
                  </p>
                </div>
              </label>
              
              <label className="flex items-start cursor-pointer p-3 border rounded-md hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="authMethod"
                  value="password"
                  checked={authMethod === 'password'}
                  onChange={(e) => setAuthMethod(e.target.value)}
                  className="mt-1 mr-3"
                  disabled={isSubmitting}
                />
                <div className="flex-1">
                  <div className="font-medium flex items-center">
                    <span className="mr-2">🔑</span>
                    Email & Password
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    A temporary password will be created. Guardian must change it on first login.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Reason for Change */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Email Change <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (errors.reason) {
                  setErrors(prev => ({ ...prev, reason: '' }));
                }
              }}
              placeholder="e.g., User changed their email address, typo in original email, etc."
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.reason ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
            )}
          </div>

          {/* Important Information Alerts */}
          <div className="space-y-3">
            {hasFamilyId && (
              <Alert className="border-amber-200 bg-amber-50">
                <UserCheck className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Primary Guardian Account:</strong> This primary guardian's record will be 
                  migrated to the new email address, and the old guardian entry will be marked as 
                  "primary_guardian_old".
                </AlertDescription>
              </Alert>
            )}

            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>What will happen:</strong>
                <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
                  <li>All custom claims and permissions will transfer to the new email</li>
                  <li>If the new email already exists, claims will be merged</li>
                  {authMethod === 'password' ? (
                    <li>If the new email doesn't exist, a new account will be created with a temporary password</li>
                  ) : (
                    <li>If the new email doesn't exist, a new account will be created for {authMethod === 'google' ? 'Google' : 'Microsoft'} sign-in</li>
                  )}
                  <li>Guardian records will be updated in the database</li>
                  <li>The original account's family-related claims will be removed</li>
                  <li>All changes will be logged for audit purposes</li>
                </ul>
              </AlertDescription>
            </Alert>

            {authMethod === 'password' ? (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>Password Authentication:</strong> The guardian will receive an email with a 
                  temporary password that must be changed on their first login. They will use their 
                  email and password to sign in.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>{authMethod === 'google' ? 'Google' : 'Microsoft'} Authentication:</strong> The guardian will receive an email 
                  with instructions to sign in using their {authMethod === 'google' ? 'Google' : 'Microsoft'} account. 
                  No password will be created or required - they'll use the "Sign in with {authMethod === 'google' ? 'Google' : 'Microsoft'}" button.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Understanding Checkbox */}
          <div className="bg-gray-50 p-4 rounded-md">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={understanding}
                onChange={(e) => {
                  setUnderstanding(e.target.checked);
                  if (errors.understanding) {
                    setErrors(prev => ({ ...prev, understanding: '' }));
                  }
                }}
                className="mt-1 mr-3"
                disabled={isSubmitting}
              />
              <span className={`text-sm ${errors.understanding ? 'text-red-600' : 'text-gray-700'}`}>
                I understand that this will permanently change the user's login email address and 
                transfer all their permissions and data to the new email. This action cannot be 
                easily undone.
              </span>
            </label>
            {errors.understanding && (
              <p className="mt-2 text-sm text-red-600">{errors.understanding}</p>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !newEmail || !confirmEmail || !reason || !understanding}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Changing Email...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Change Email Address
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeEmailModal;