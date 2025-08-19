import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updatePassword, getAuth } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase'; // Import the already configured functions instance
import { Shield, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';

const ForcedPasswordChange = ({ onPasswordChanged }) => {
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Password validation rules
  const validatePassword = (password) => {
    const errors = {};
    
    if (password.length < 7) {
      errors.length = 'Password must be at least 7 characters long';
    }
    
    if (!/\d/.test(password)) {
      errors.number = 'Password must contain at least one number';
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.symbol = 'Password must contain at least one symbol';
    }
    
    return errors;
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setNewPassword(password);
    
    // Validate password in real-time
    const errors = validatePassword(password);
    setValidationErrors(errors);
  };

  // Check if passwords match
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const isValidPassword = newPassword && Object.keys(validationErrors).length === 0;
  const canSubmit = isValidPassword && passwordsMatch && !loading;

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!canSubmit) return;
    
    setLoading(true);
    setError('');

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      // Update the user's password
      await updatePassword(currentUser, newPassword);
      console.log('Password updated successfully');
      
      // Remove the temporary password claim by calling a cloud function
      // Use the pre-configured functions instance with correct region
      const removeTempPasswordClaim = httpsCallable(functions, 'removeTempPasswordClaim');
      
      try {
        console.log('Calling removeTempPasswordClaim cloud function...');
        const result = await removeTempPasswordClaim();
        console.log('Cloud function result:', result.data);
      } catch (claimError) {
        console.error('Error removing temp password claim:', claimError);
        console.error('Cloud function error details:', {
          code: claimError.code,
          message: claimError.message,
          details: claimError.details,
          fullError: claimError
        });
        // Log the full error object to see what's happening
        console.error('Full error object:', JSON.stringify(claimError, null, 2));
        // Don't throw here - password was changed successfully
        // The claim might still be removed server-side even if the call failed
      }
      
      // Force token refresh to get updated claims
      console.log('Forcing token refresh...');
      await currentUser.getIdToken(true);
      
      // Verify the claim was actually removed
      const idTokenResult = await currentUser.getIdTokenResult();
      console.log('Claims after password change:', idTokenResult.claims);
      
      if (idTokenResult.claims.tempPasswordRequired) {
        console.error('Warning: tempPasswordRequired claim still present after removal attempt');
      }
      
      // Notify parent component that password was changed
      if (onPasswordChanged) {
        console.log('Calling onPasswordChanged callback...');
        await onPasswordChanged();
      }
      
    } catch (error) {
      console.error('Error changing password:', error);
      setError(error.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Shield className="h-12 w-12 text-red-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Password Change Required
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Your account has a temporary password. Please create a new secure password to continue.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Create New Password</CardTitle>
            <CardDescription className="text-center">
              Enter a secure password that you'll remember for future logins.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password Field */}
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={handlePasswordChange}
                    required
                    className={`appearance-none block w-full px-3 py-2 border ${
                      validationErrors && Object.keys(validationErrors).length > 0 
                        ? 'border-red-300' 
                        : 'border-gray-300'
                    } rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Password validation feedback */}
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className={`flex items-center text-xs ${
                      validationErrors.length ? 'text-red-600' : 'text-green-600'
                    }`}>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      At least 7 characters
                    </div>
                    <div className={`flex items-center text-xs ${
                      validationErrors.number ? 'text-red-600' : 'text-green-600'
                    }`}>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Contains at least one number
                    </div>
                    <div className={`flex items-center text-xs ${
                      validationErrors.symbol ? 'text-red-600' : 'text-green-600'
                    }`}>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Contains at least one symbol
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`appearance-none block w-full px-3 py-2 border ${
                      confirmPassword && !passwordsMatch 
                        ? 'border-red-300' 
                        : 'border-gray-300'
                    } rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {confirmPassword && !passwordsMatch && (
                  <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                )}
                
                {confirmPassword && passwordsMatch && (
                  <p className="mt-1 text-xs text-green-600 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Passwords match
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div>
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating Password...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </div>
            </form>

            {/* Help Information */}
            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Shield className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Security Notice
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Your administrator has set a temporary password for your account. 
                      After updating your password, you'll be able to access your account normally.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForcedPasswordChange;