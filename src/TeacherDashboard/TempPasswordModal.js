import React, { useState } from 'react';
import { Key, Eye, EyeOff, RefreshCw, Copy, CheckCircle, Mail, AlertTriangle, XCircle, Globe } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Alert, AlertDescription } from '../components/ui/alert';

const TempPasswordModal = ({ open, onClose, userEmail, isNewUser, onConfirm, defaultTargetSite }) => {
  console.log('TempPasswordModal props:', { defaultTargetSite, userEmail, isNewUser });
  
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [reason, setReason] = useState('');
  const [copied, setCopied] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [emailsMatch, setEmailsMatch] = useState(false);
  // Use defaultTargetSite if provided, otherwise check email domain, fallback to rtdacademy
  const [targetSite, setTargetSite] = useState(
    defaultTargetSite || (userEmail?.endsWith('@rtd-connect.com') ? 'rtdconnect' : 'rtdacademy')
  );
  
  console.log('Initial targetSite state:', targetSite, 'from defaultTargetSite:', defaultTargetSite);

  // Generate a secure password
  const generatePassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let newPassword = '';
    
    // Ensure at least one of each type
    newPassword += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // lowercase
    newPassword += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // uppercase
    newPassword += '0123456789'[Math.floor(Math.random() * 10)]; // number
    newPassword += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // symbol
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      newPassword += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    const shuffled = newPassword.split('').sort(() => Math.random() - 0.5).join('');
    setPassword(shuffled);
    setShowPassword(true);
    return shuffled;
  };

  // Generate initial password when modal opens
  React.useEffect(() => {
    if (open && !password) {
      generatePassword();
    }
  }, [open]);

  // Copy password to clipboard
  const copyToClipboard = async (password) => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy password:', error);
    }
  };

  // Validate custom password
  const isValidPassword = (password) => {
    if (password.length < 7) return false;
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasNumber && hasSymbol;
  };

  // Check email confirmation
  React.useEffect(() => {
    if (confirmEmail && userEmail) {
      setEmailsMatch(confirmEmail.toLowerCase() === userEmail.toLowerCase());
    } else {
      setEmailsMatch(false);
    }
  }, [confirmEmail, userEmail]);

  // Handle confirm
  const handleConfirm = () => {
    onConfirm({
      password: password,
      reason: reason || 'Admin set temporary password for account recovery',
      sendEmail: sendEmail,
      emailConfirmed: emailsMatch,
      targetSite: targetSite
    });
    handleClose();
  };

  // Handle close and reset
  const handleClose = () => {
    setPassword('');
    setShowPassword(true);
    setReason('');
    setCopied(false);
    setSendEmail(true);
    setConfirmEmail('');
    setEmailsMatch(false);
    setTargetSite(defaultTargetSite || (userEmail?.endsWith('@rtd-connect.com') ? 'rtdconnect' : 'rtdacademy'));
    onClose();
  };

  // Check if we can proceed
  const canProceed = emailsMatch && password && isValidPassword(password);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Key className="w-5 h-5 mr-2 text-blue-600" />
            {isNewUser ? 'Create New User Account' : 'Set Temporary Password'}
          </DialogTitle>
          <DialogDescription>
            {isNewUser ? (
              <>
                Create a new Firebase Auth account for <strong>{userEmail}</strong> with a temporary password. 
                The user will receive a welcome email and be required to change the password on their first login.
              </>
            ) : (
              <>
                Create a temporary password for <strong>{userEmail}</strong>. 
                The user will be required to change this password on their next login.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <div className="space-y-4 py-4">
          
          {/* Email Confirmation Section */}
          <div className="space-y-3">
            <Alert className="border-blue-200 bg-blue-50">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-sm">
                <strong>Email Verification:</strong> Please confirm the email address below to ensure the temporary password is sent to the correct recipient.
              </AlertDescription>
            </Alert>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={userEmail}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  placeholder="Re-enter email address to confirm"
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 ${
                    confirmEmail && emailsMatch 
                      ? 'border-green-500 focus:ring-green-500' 
                      : confirmEmail && !emailsMatch 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {confirmEmail && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    {emailsMatch ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                )}
              </div>
              {confirmEmail && !emailsMatch && (
                <p className="mt-1 text-sm text-red-600">
                  Email addresses do not match. Please verify the email carefully.
                </p>
              )}
              {confirmEmail && emailsMatch && (
                <p className="mt-1 text-sm text-green-600">
                  ✓ Email addresses match
                </p>
              )}
            </div>
          </div>

          {/* Site Selection */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <label className="text-sm font-medium text-gray-700">
                Select Login Portal
              </label>
            </div>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="targetSite"
                  value="rtdacademy"
                  checked={targetSite === 'rtdacademy'}
                  onChange={(e) => setTargetSite(e.target.value)}
                  className="h-4 w-4 text-blue-600"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">RTD Academy (YourWay)</div>
                  <div className="text-xs text-gray-500">For students and teachers - yourway.rtdacademy.com</div>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="targetSite"
                  value="rtdconnect"
                  checked={targetSite === 'rtdconnect'}
                  onChange={(e) => setTargetSite(e.target.value)}
                  className="h-4 w-4 text-blue-600"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">RTD Connect</div>
                  <div className="text-xs text-gray-500">For home education families and facilitators - rtd-connect.com</div>
                </div>
              </label>
            </div>
            {userEmail?.endsWith('@rtd-connect.com') && targetSite === 'rtdconnect' && (
              <p className="text-xs text-blue-600 ml-1">
                ✓ Auto-selected RTD Connect based on email domain
              </p>
            )}
          </div>

          <hr className="border-gray-200" />
          
          {/* Password Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Temporary Password
              </label>
              <Button
                type="button"
                onClick={generatePassword}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Generate New
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-24 font-mono text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(password)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              {/* Password validation */}
              {password && (
                <div className="mt-2 text-xs space-y-1">
                  <div className={`flex items-center ${password.length >= 7 ? 'text-green-600' : 'text-red-600'}`}>
                    <span className="w-1 h-1 bg-current rounded-full mr-2"></span>
                    At least 7 characters
                  </div>
                  <div className={`flex items-center ${/\d/.test(password) ? 'text-green-600' : 'text-red-600'}`}>
                    <span className="w-1 h-1 bg-current rounded-full mr-2"></span>
                    Contains at least one number
                  </div>
                  <div className={`flex items-center ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : 'text-red-600'}`}>
                    <span className="w-1 h-1 bg-current rounded-full mr-2"></span>
                    Contains at least one symbol
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reason Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason (optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for setting temporary password..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email Option */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sendEmail"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="sendEmail" className="text-sm font-medium flex items-center">
                <Mail className="w-4 h-4 mr-2 text-blue-600" />
                Email temporary password to user
              </label>
            </div>
            
            {sendEmail && (
              <div className="ml-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-700">
                  <strong>✓ Recommended:</strong> The user will receive a professional {isNewUser ? 'welcome' : ''} email with their temporary password 
                  and login instructions. This is the most secure way to share credentials.
                </p>
              </div>
            )}
            
            {!sendEmail && (
              <div className="ml-6 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-xs text-amber-700">
                  <strong>⚠️ Manual sharing:</strong> You'll need to securely share the temporary password with the user 
                  through another channel (phone, in-person, etc.).
                </p>
              </div>
            )}
          </div>

          {/* Warning */}
          <Alert className="border-yellow-500 bg-yellow-50">
            <AlertDescription className="text-yellow-800 text-sm">
              <strong>Important:</strong> {isNewUser ? 'A new user account will be created and the user' : 'The user'} will be forced to change this password on their next login.
              {!sendEmail && ' Make sure to provide them with this temporary password through a secure channel.'}
            </AlertDescription>
          </Alert>
          </div>
        </div>

        <DialogFooter className="mt-6 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!canProceed}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isNewUser ? 'Create User Account' : 'Set Temporary Password'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TempPasswordModal;