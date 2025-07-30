import React, { useState } from 'react';
import { Key, Eye, EyeOff, RefreshCw, Copy, CheckCircle, Mail } from 'lucide-react';
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

const TempPasswordModal = ({ open, onClose, userEmail, isNewUser, onConfirm }) => {
  const [customPassword, setCustomPassword] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [reason, setReason] = useState('');
  const [copied, setCopied] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);

  // Generate a secure password
  const generatePassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one of each type
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // lowercase
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // uppercase
    password += '0123456789'[Math.floor(Math.random() * 10)]; // number
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // symbol
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    const shuffled = password.split('').sort(() => Math.random() - 0.5).join('');
    setGeneratedPassword(shuffled);
    setShowPassword(true);
  };

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

  // Handle confirm
  const handleConfirm = () => {
    const passwordToUse = useCustom ? customPassword : generatedPassword;
    onConfirm({
      password: passwordToUse,
      reason: reason || 'Admin set temporary password for account recovery',
      sendEmail: sendEmail
    });
    handleClose();
  };

  // Handle close and reset
  const handleClose = () => {
    setCustomPassword('');
    setGeneratedPassword('');
    setUseCustom(false);
    setShowPassword(false);
    setReason('');
    setCopied(false);
    setSendEmail(true);
    onClose();
  };

  // Check if we can proceed
  const canProceed = useCustom 
    ? (customPassword && isValidPassword(customPassword))
    : generatedPassword;

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
          {/* Password Type Selection */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="generated"
                name="passwordType"
                checked={!useCustom}
                onChange={() => setUseCustom(false)}
                className="h-4 w-4 text-blue-600"
              />
              <label htmlFor="generated" className="text-sm font-medium">
                Generate secure password (recommended)
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="custom"
                name="passwordType"
                checked={useCustom}
                onChange={() => setUseCustom(true)}
                className="h-4 w-4 text-blue-600"
              />
              <label htmlFor="custom" className="text-sm font-medium">
                Set custom password
              </label>
            </div>
          </div>

          {/* Generated Password Section */}
          {!useCustom && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  onClick={generatePassword}
                  className="flex items-center"
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate Password
                </Button>
              </div>
              
              {generatedPassword && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Generated Password
                      </label>
                      <div className="flex items-center space-x-2 mt-1">
                        <code className="text-sm font-mono bg-white px-2 py-1 rounded border">
                          {showPassword ? generatedPassword : '••••••••••••'}
                        </code>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(generatedPassword)}
                        >
                          {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Custom Password Section */}
          {useCustom && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    placeholder="Enter custom password"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Password validation */}
                {customPassword && (
                  <div className="mt-2 text-xs">
                    <div className={`flex items-center ${customPassword.length >= 7 ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="w-1 h-1 bg-current rounded-full mr-2"></span>
                      At least 7 characters
                    </div>
                    <div className={`flex items-center ${/\d/.test(customPassword) ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="w-1 h-1 bg-current rounded-full mr-2"></span>
                      Contains at least one number
                    </div>
                    <div className={`flex items-center ${/[!@#$%^&*(),.?":{}|<>]/.test(customPassword) ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="w-1 h-1 bg-current rounded-full mr-2"></span>
                      Contains at least one symbol
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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