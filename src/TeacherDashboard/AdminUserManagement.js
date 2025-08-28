import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  User, 
  UserCog, 
  Shield, 
  Key, 
  Trash2, 
  UserX, 
  UserCheck,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  Copy,
  Eye,
  EyeOff,
  Link2,
  Loader2,
  Mail,
  Send,
  UserPlus,
  Code,
  Edit3,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import TempPasswordModal from './TempPasswordModal';

const AdminUserManagement = ({ defaultTargetSite }) => {
  const { user, hasAdminAccess, isSuperAdminUser } = useAuth();
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: '', data: null });
  const [tempPasswordModal, setTempPasswordModal] = useState({ open: false, userEmail: '', isNewUser: false });
  const [currentTempPassword, setCurrentTempPassword] = useState('');
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [signInMethods, setSignInMethods] = useState([]);
  const [loadingSignInMethods, setLoadingSignInMethods] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);
  const [searchedEmail, setSearchedEmail] = useState('');
  const [currentTargetSite, setCurrentTargetSite] = useState(defaultTargetSite || 'rtdacademy');
  const [showClaimsDialog, setShowClaimsDialog] = useState(false);
  const [editingClaims, setEditingClaims] = useState('');
  const [claimsError, setClaimsError] = useState('');
  const [updatingClaims, setUpdatingClaims] = useState(false);

  // Clear messages after a delay
  const clearMessages = useCallback(() => {
    setTimeout(() => {
      setError('');
      setSuccess('');
    }, 5000);
  }, []);

  // Copy password to clipboard
  const copyPasswordToClipboard = async (password) => {
    try {
      await navigator.clipboard.writeText(password);
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy password:', error);
    }
  };

  // Fetch sign-in methods for a user
  const fetchSignInMethods = async (email) => {
    setLoadingSignInMethods(true);
    try {
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const functions = getFunctions();
      const getSignInMethods = httpsCallable(functions, 'getUserSignInMethods');

      const result = await getSignInMethods({ targetEmail: email });
      
      if (result.data.success) {
        setSignInMethods(result.data.providerData || []);
        console.log('Sign-in methods fetched:', result.data);
      }
    } catch (error) {
      console.error('Error fetching sign-in methods:', error);
      setSignInMethods([]);
    } finally {
      setLoadingSignInMethods(false);
    }
  };

  // Search for user by email
  const handleSearchUser = async () => {
    if (!searchEmail.trim()) {
      setError('Please enter an email address to search');
      clearMessages();
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setSearchResults(null);
    setUserNotFound(false);
    setSearchedEmail('');
    setCurrentTargetSite('rtdacademy');

    try {
      // Import Firebase Functions dynamically
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const functions = getFunctions();
      const getUserInfo = httpsCallable(functions, 'getAnyUserPermissions');

      const result = await getUserInfo({ targetEmail: searchEmail.trim() });
      
      if (result.data.success) {
        setSearchResults(result.data);
        setSuccess(`Found user: ${result.data.email}`);
        
        // Clear any previous temp password display when searching for a new user
        setCurrentTempPassword('');
        setShowTempPassword(false);
        setPasswordCopied(false);
        setEmailSent(false);
        
        // Fetch sign-in methods for this user
        fetchSignInMethods(result.data.email);
        
        // Check if user has temp password claim and show notification
        if (result.data.currentClaims?.tempPasswordRequired) {
          setSuccess(`Found user: ${result.data.email} - User has a temporary password set`);
        }
      } else {
        setError('User not found or access denied');
      }
    } catch (error) {
      console.error('Error searching user:', error);
      if (error.code === 'functions/not-found') {
        setUserNotFound(true);
        setSearchedEmail(searchEmail.trim());
        setError('User not found in the system');
      } else if (error.code === 'functions/permission-denied') {
        setError('Access denied. You do not have permission to search for users.');
      } else {
        setError('Error searching for user. Please try again.');
      }
    } finally {
      setLoading(false);
      clearMessages();
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  // Get user status badge
  const getUserStatusBadge = (userData) => {
    if (userData.disabled) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="w-3 h-3 mr-1" />
        Disabled
      </span>;
    }
    
    if (!userData.emailVerified) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Email Not Verified
      </span>;
    }

    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
      <CheckCircle className="w-3 h-3 mr-1" />
      Active
    </span>;
  };

  // Get provider icon/display info
  const getProviderInfo = (providerId) => {
    const providerMap = {
      'password': { name: 'Email/Password', icon: '🔑', color: 'bg-blue-100 text-blue-800' },
      'google.com': { name: 'Google', icon: '🇬', color: 'bg-red-100 text-red-800' },
      'microsoft.com': { name: 'Microsoft', icon: 'Ⓜ️', color: 'bg-blue-100 text-blue-800' },
      'facebook.com': { name: 'Facebook', icon: '🇫', color: 'bg-blue-100 text-blue-800' },
      'apple.com': { name: 'Apple', icon: '🍎', color: 'bg-gray-100 text-gray-800' },
      'github.com': { name: 'GitHub', icon: '🐙', color: 'bg-gray-100 text-gray-800' }
    };
    
    return providerMap[providerId] || { 
      name: providerId, 
      icon: '🔗', 
      color: 'bg-gray-100 text-gray-800' 
    };
  };

  // Confirmation dialog handler
  const handleConfirmAction = (action, data) => {
    setConfirmDialog({ open: true, action, data });
  };

  // Temp password modal handlers
  const handleOpenTempPasswordModal = (userEmail) => {
    setTempPasswordModal({ open: true, userEmail, isNewUser: false, defaultTargetSite });
  };

  // Handle creating a new user
  const handleCreateNewUser = async ({ password, reason, sendEmail, targetSite }) => {
    if (!searchedEmail) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    setUserNotFound(false);

    try {
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const functions = getFunctions();
      const createUser = httpsCallable(functions, 'createUserWithTempPassword');
      
      const result = await createUser({ 
        targetEmail: searchedEmail,
        customPassword: password,
        sendEmail: sendEmail,
        reason: reason || 'Admin created new user account',
        targetSite: targetSite || 'rtdacademy'
      });
      
      if (result.data.success) {
        setCurrentTempPassword(result.data.tempPassword);
        setCurrentTargetSite(targetSite || 'rtdacademy');
        
        if (result.data.emailResult?.success) {
          setEmailSent(true);
          setSuccess(`New user created successfully and welcome email sent to ${searchedEmail}`);
        } else {
          setSuccess(`New user created successfully. You can send the welcome email manually using the button below.`);
        }
        
        // Set search results to show the new user
        setSearchResults({
          email: result.data.user.email,
          uid: result.data.user.uid,
          emailVerified: result.data.user.emailVerified,
          disabled: result.data.user.disabled,
          creationTime: result.data.user.creationTime,
          lastSignInTime: result.data.user.lastSignInTime,
          userType: 'Student',
          currentClaims: result.data.customClaims
        });
        
        // Fetch sign-in methods for the new user
        fetchSignInMethods(result.data.user.email);
      }
    } catch (error) {
      console.error('Error creating new user:', error);
      if (error.code === 'functions/permission-denied') {
        setError('Access denied. You do not have permission to create users.');
      } else if (error.code === 'functions/already-exists') {
        setError('A user with this email already exists.');
      } else if (error.code === 'functions/invalid-argument') {
        setError(`Invalid input: ${error.message || 'Please check your inputs'}`);
      } else {
        setError(`Error creating user: ${error.message || 'An unexpected error occurred'}`);
      }
    } finally {
      setLoading(false);
      clearMessages();
    }
  };

  const handleTempPasswordConfirm = async ({ password, reason, sendEmail, targetSite }) => {
    const isNewUser = tempPasswordModal.isNewUser;
    setTempPasswordModal({ open: false, userEmail: '' });
    
    if (isNewUser) {
      // Handle new user creation
      await handleCreateNewUser({ password, reason, sendEmail, targetSite });
      return;
    }
    
    // Handle existing user temp password setting
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const functions = getFunctions();
      const setTempPassword = httpsCallable(functions, 'setTemporaryPassword');
      
      const result = await setTempPassword({ 
        targetEmail: searchResults.email,
        customPassword: password,
        reason: reason,
        targetSite: targetSite || 'rtdacademy'
      });
      
      if (result.data.success) {
        setCurrentTempPassword(result.data.tempPassword);
        setCurrentTargetSite(targetSite || 'rtdacademy');
        
        // If email should be sent, send it automatically
        if (sendEmail) {
          try {
            setSendingEmail(true);
            const sendEmailFunction = httpsCallable(functions, 'sendTempPasswordEmail');
            
            const emailResult = await sendEmailFunction({
              targetEmail: searchResults.email,
              tempPassword: result.data.tempPassword,
              userFirstName: searchResults.displayName?.split(' ')[0] || 'Student',
              targetSite: targetSite || 'rtdacademy'
            });
            
            if (emailResult.data.success) {
              setEmailSent(true);
              setSuccess(`Temporary password set and email sent successfully to ${searchResults.email}`);
            }
          } catch (emailError) {
            console.error('Error sending email:', emailError);
            setSuccess(`Temporary password set successfully, but email failed to send. You can send it manually using the button below.`);
          } finally {
            setSendingEmail(false);
          }
        } else {
          setSuccess(`Temporary password set successfully`);
        }
        
        // Refresh user data
        handleSearchUser();
      }
    } catch (error) {
      console.error('Error setting temporary password:', error);
      if (error.code === 'functions/permission-denied') {
        setError('Access denied. You do not have permission to set temporary passwords.');
      } else if (error.code === 'functions/not-found') {
        setError('User not found.');
      } else {
        setError(`Error: ${error.message || 'An unexpected error occurred'}`);
      }
    } finally {
      setLoading(false);
      clearMessages();
    }
  };

  // Send temporary password email
  const handleSendTempPasswordEmail = async () => {
    if (!currentTempPassword || !searchResults) return;
    
    setSendingEmail(true);
    setError('');
    setSuccess('');

    try {
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const functions = getFunctions();
      const sendEmailFunction = httpsCallable(functions, 'sendTempPasswordEmail');
      
      const result = await sendEmailFunction({
        targetEmail: searchResults.email,
        tempPassword: currentTempPassword,
        userFirstName: searchResults.displayName?.split(' ')[0] || 'Student',
        targetSite: currentTargetSite || 'rtdacademy'
      });
      
      if (result.data.success) {
        setEmailSent(true);
        setSuccess(`Temporary password email sent successfully to ${searchResults.email}`);
      }
    } catch (error) {
      console.error('Error sending temporary password email:', error);
      if (error.code === 'functions/permission-denied') {
        setError('Access denied. You do not have permission to send emails.');
      } else {
        setError(`Error sending email: ${error.message || 'An unexpected error occurred'}`);
      }
    } finally {
      setSendingEmail(false);
      clearMessages();
    }
  };

  // Verify user email
  const handleVerifyEmail = async () => {
    if (!searchResults) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const functions = getFunctions();
      const verifyEmail = httpsCallable(functions, 'verifyUserEmail');
      
      const result = await verifyEmail({ 
        targetEmail: searchResults.email,
        reason: 'Admin manually verified email address'
      });
      
      if (result.data.success) {
        if (result.data.alreadyVerified) {
          setSuccess('Email address was already verified');
        } else {
          setSuccess('Email address verified successfully');
        }
        // Refresh user data
        handleSearchUser();
      }
    } catch (error) {
      console.error('Error verifying email:', error);
      if (error.code === 'functions/permission-denied') {
        setError('Access denied. You do not have permission to verify emails.');
      } else if (error.code === 'functions/not-found') {
        setError('User not found.');
      } else {
        setError(`Error: ${error.message || 'An unexpected error occurred'}`);
      }
    } finally {
      setLoading(false);
      clearMessages();
    }
  };

  // Quick remove tempPasswordRequired claim
  const handleQuickRemoveTempPasswordClaim = async () => {
    if (!searchResults) return;
    
    setUpdatingClaims(true);
    setError('');
    setSuccess('');

    try {
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const functions = getFunctions();
      const updateClaims = httpsCallable(functions, 'updateUserCustomClaims');
      
      // Remove tempPasswordRequired from current claims
      const updatedClaims = { ...searchResults.currentClaims };
      delete updatedClaims.tempPasswordRequired;
      
      const result = await updateClaims({ 
        targetEmail: searchResults.email,
        customClaims: updatedClaims,
        reason: 'Admin removed tempPasswordRequired claim'
      });
      
      if (result.data.success) {
        setSuccess('Temporary password requirement removed successfully');
        // Refresh user data
        handleSearchUser();
      }
    } catch (error) {
      console.error('Error removing temp password claim:', error);
      if (error.code === 'functions/permission-denied') {
        setError('Access denied. You do not have permission to update claims.');
      } else {
        setError(`Error: ${error.message || 'Failed to remove claim'}`);
      }
    } finally {
      setUpdatingClaims(false);
      clearMessages();
    }
  };

  // Update custom claims
  const handleUpdateCustomClaims = async () => {
    if (!searchResults) return;
    
    // Validate JSON
    let parsedClaims;
    try {
      parsedClaims = JSON.parse(editingClaims);
    } catch (error) {
      setClaimsError('Invalid JSON format. Please check your syntax.');
      return;
    }
    
    setUpdatingClaims(true);
    setClaimsError('');
    setError('');
    setSuccess('');

    try {
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const functions = getFunctions();
      const updateClaims = httpsCallable(functions, 'updateUserCustomClaims');
      
      const result = await updateClaims({ 
        targetEmail: searchResults.email,
        customClaims: parsedClaims,
        reason: 'Admin manually updated custom claims'
      });
      
      if (result.data.success) {
        setSuccess('Custom claims updated successfully');
        setShowClaimsDialog(false);
        // Refresh user data
        handleSearchUser();
      }
    } catch (error) {
      console.error('Error updating custom claims:', error);
      if (error.code === 'functions/permission-denied') {
        setClaimsError('Access denied. You do not have permission to update claims.');
      } else if (error.code === 'functions/not-found') {
        setClaimsError('User not found.');
      } else {
        setClaimsError(`Error: ${error.message || 'Failed to update claims'}`);
      }
    } finally {
      setUpdatingClaims(false);
      if (!claimsError) {
        clearMessages();
      }
    }
  };

  // Execute confirmed action
  const executeAction = async () => {
    const { action, data } = confirmDialog;
    setConfirmDialog({ open: false, action: '', data: null });
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const functions = getFunctions();

      switch (action) {
        case 'deleteUser': {
          const deleteUser = httpsCallable(functions, 'deleteFirebaseAuthUser');
          const result = await deleteUser({ 
            targetEmail: data.email,
            reason: 'Admin deleted user for account recovery'
          });
          
          if (result.data.success) {
            setSuccess('Firebase Auth user deleted successfully. Student data preserved.');
            setSearchResults(null); // Clear search results since user is deleted
          }
          break;
        }
        
        case 'toggleAccount': {
          const toggleAccount = httpsCallable(functions, 'toggleUserAccountStatus');
          const result = await toggleAccount({ 
            targetEmail: data.email,
            disabled: !data.disabled,
            reason: `Admin ${data.disabled ? 'enabled' : 'disabled'} user account`
          });
          
          if (result.data.success) {
            setSuccess(result.data.message);
            // Refresh user data
            handleSearchUser();
          }
          break;
        }
        
        default:
          setError('Unknown action');
      }
    } catch (error) {
      console.error('Error executing action:', error);
      if (error.code === 'functions/permission-denied') {
        setError('Access denied. You do not have permission to perform this action.');
      } else if (error.code === 'functions/not-found') {
        setError('User not found.');
      } else {
        setError(`Error: ${error.message || 'An unexpected error occurred'}`);
      }
    } finally {
      setLoading(false);
      clearMessages();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <UserCog className="w-8 h-8 mr-3 text-blue-600" />
          User Account Management
        </h1>
        <p className="mt-2 text-gray-600">
          Manage Firebase user accounts, reset passwords, and handle account issues for students and staff.
        </p>
      </div>

      {/* Alert Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* User Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Search User Account
          </CardTitle>
          <CardDescription>
            Enter an email address to search for a user account and view their information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="email"
                placeholder="Enter email address (e.g., student@example.com)"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button 
              onClick={handleSearchUser} 
              disabled={loading}
              className="px-6"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Not Found - Create User Option */}
      {userNotFound && searchedEmail && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-900">
              <AlertTriangle className="w-5 h-5 mr-2" />
              User Not Found
            </CardTitle>
            <CardDescription className="text-yellow-800">
              No user account found for <strong className="font-mono">{searchedEmail}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <UserPlus className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Create New User Account</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={searchedEmail}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                  />
                </div>
                
                <Alert className="border-blue-200 bg-blue-50 mb-4">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-sm">
                    A new account will be created for <strong>{searchedEmail}</strong>. 
                    You'll be asked to confirm the email address in the next step to ensure accuracy before sending credentials.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>New account will be created with temporary password</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Email will be automatically verified</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Welcome email sent with login instructions</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>User must change password on first login</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button 
                    onClick={() => setTempPasswordModal({ open: true, userEmail: searchedEmail, isNewUser: true, defaultTargetSite })}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={loading}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create New User
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Information Display */}
      {searchResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                User Information
              </span>
              {getUserStatusBadge(searchResults)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic User Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Email Address</label>
                <p className="text-gray-900 font-mono">{searchResults.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">User ID (UID)</label>
                <p className="text-gray-900 font-mono text-xs">{searchResults.uid}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Account Created</label>
                <p className="text-gray-900 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(searchResults.creationTime)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Sign In</label>
                <p className="text-gray-900 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatDate(searchResults.lastSignInTime)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">User Type</label>
                <p className="text-gray-900 capitalize">{searchResults.userType || 'Regular User'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email Verified</label>
                <div className="text-gray-900">
                  {searchResults.emailVerified ? (
                    <span className="text-green-600 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Yes
                    </span>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-red-600 flex items-center">
                        <XCircle className="w-4 h-4 mr-1" />
                        No
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleVerifyEmail}
                        disabled={loading}
                        className="h-7 px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white border-green-600"
                      >
                        {loading ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verify Email
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sign-in Methods Display */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Link2 className="w-5 h-5 mr-2" />
                Authentication Methods
                {loadingSignInMethods && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              </h3>
              
              {signInMethods.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    This user can sign in using the following methods:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {signInMethods.map((provider, index) => {
                      const providerInfo = getProviderInfo(provider.providerId);
                      return (
                        <span
                          key={index}
                          className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${providerInfo.color}`}
                        >
                          <span className="mr-2">{providerInfo.icon}</span>
                          {providerInfo.name}
                          {provider.displayName && (
                            <span className="ml-2 text-xs opacity-75">
                              ({provider.displayName})
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                  
                  {signInMethods.length > 1 && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="flex">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="text-sm text-yellow-800">
                          <strong>Multiple sign-in methods detected:</strong> This user has {signInMethods.length} different 
                          ways to sign in. They may have accounts linked to the same email address through different providers.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : !loadingSignInMethods ? (
                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-gray-400 mr-2" />
                    No authentication methods found or unable to fetch sign-in methods.
                  </div>
                </div>
              ) : null}
            </div>

            {/* Custom Claims Display */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center justify-between">
                <span className="flex items-center">
                  <Code className="w-5 h-5 mr-2" />
                  Custom Claims
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingClaims(JSON.stringify(searchResults.currentClaims || {}, null, 2));
                    setClaimsError('');
                    setShowClaimsDialog(true);
                  }}
                  className="flex items-center"
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  Edit Claims
                </Button>
              </h3>
              
              {searchResults.currentClaims && Object.keys(searchResults.currentClaims).length > 0 ? (
                <div className="space-y-3">
                  {/* Warning if tempPasswordRequired is present */}
                  {searchResults.currentClaims.tempPasswordRequired && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        <strong>Warning:</strong> User has <code className="px-1 py-0.5 bg-red-100 rounded">tempPasswordRequired: true</code> claim. 
                        This forces password change on login.
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleQuickRemoveTempPasswordClaim()}
                          className="ml-3 h-6 px-2 py-1 text-xs"
                          disabled={updatingClaims}
                        >
                          {updatingClaims ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>Remove This Claim</>
                          )}
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Display claims in formatted JSON */}
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                    <pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap break-words">
                      {JSON.stringify(searchResults.currentClaims, null, 2)}
                    </pre>
                  </div>
                  
                  {/* Common claim indicators */}
                  <div className="flex flex-wrap gap-2">
                    {searchResults.currentClaims.isStaffUser && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Shield className="w-3 h-3 mr-1" />
                        Staff User
                      </span>
                    )}
                    {searchResults.currentClaims.familyId && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Family: {searchResults.currentClaims.familyId}
                      </span>
                    )}
                    {searchResults.currentClaims.familyRole && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Role: {searchResults.currentClaims.familyRole}
                      </span>
                    )}
                    {searchResults.currentClaims.permissions?.isAdmin && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center">
                    <Info className="h-4 w-4 text-gray-400 mr-2" />
                    No custom claims found for this user.
                  </div>
                </div>
              )}
            </div>

            {/* Current Temporary Password Display */}
            {currentTempPassword && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Key className="w-5 h-5 mr-2 text-green-600" />
                  Current Temporary Password
                </h3>
                
                <Card className="p-4 border-green-200 bg-green-50">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-800">
                        Password for {searchResults.email}:
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 bg-white p-3 rounded-md border">
                      <code className="flex-1 text-sm font-mono text-gray-900">
                        {showTempPassword ? currentTempPassword : '••••••••••••'}
                      </code>
                      
                      <Button
                        type="button"
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowTempPassword(!showTempPassword)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {showTempPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyPasswordToClipboard(currentTempPassword)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {passwordCopied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-green-700">
                        <strong>Important:</strong> {emailSent ? 'Password has been emailed to the user.' : 'Share this password with the user through a secure channel.'} 
                        They will be required to change it on their next login.
                      </p>
                    </div>
                    
                    {/* Email sending section */}
                    {!emailSent && (
                      <div className="border-t pt-4 mt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-green-800">Email Password to User</span>
                          </div>
                          <Button
                            onClick={handleSendTempPasswordEmail}
                            disabled={sendingEmail}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {sendingEmail ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="w-3 h-3 mr-2" />
                                Send Email
                              </>
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-green-600 mt-2">
                          Click to send a professional email with login instructions and the temporary password.
                        </p>
                      </div>
                    )}
                    
                    {emailSent && (
                      <div className="border-t pt-4 mt-4 bg-green-50 p-3 rounded-md border border-green-200">
                        <div className="flex items-center text-green-700">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span className="text-sm font-medium">Email sent successfully!</span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          The user has received an email with their temporary password and login instructions.
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* User Management Actions */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Account Management Actions
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Verify Email - Show only if email is not verified */}
                {!searchResults.emailVerified && (
                  <Card className="p-4 border-green-200 bg-green-50">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-green-900">Verify Email Address</h4>
                        <p className="text-sm text-green-700 mt-1">
                          Manually mark this user's email address as verified.
                        </p>
                        <p className="text-xs text-green-600 mt-2">
                          <strong>Use when:</strong> User cannot receive verification emails or you've confirmed their identity
                        </p>
                        <Button 
                          size="sm" 
                          className="mt-3 bg-green-600 hover:bg-green-700"
                          onClick={handleVerifyEmail}
                          disabled={loading}
                        >
                          Verify Email
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Set Temporary Password */}
                <Card className="p-4 border-blue-200 bg-blue-50">
                  <div className="flex items-start space-x-3">
                    <Key className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900">Set Temporary Password</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Create a temporary password that forces the user to change it on next login.
                      </p>
                      <p className="text-xs text-blue-600 mt-2">
                        <strong>Use when:</strong> Student forgot password and reset isn't working
                      </p>
                      <Button 
                        size="sm" 
                        className="mt-3 bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleOpenTempPasswordModal(searchResults.email)}
                      >
                        Set Temp Password
                      </Button>
                    </div>
                  </div>
                </Card>


                {/* Enable/Disable Account */}
                <Card className="p-4 border-orange-200 bg-orange-50">
                  <div className="flex items-start space-x-3">
                    {searchResults.disabled ? (
                      <UserCheck className="w-5 h-5 text-orange-600 mt-0.5" />
                    ) : (
                      <UserX className="w-5 h-5 text-orange-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-orange-900">
                        {searchResults.disabled ? 'Enable Account' : 'Disable Account'}
                      </h4>
                      <p className="text-sm text-orange-700 mt-1">
                        {searchResults.disabled 
                          ? 'Re-enable this user account to allow login.' 
                          : 'Temporarily prevent user from logging in.'
                        }
                      </p>
                      <p className="text-xs text-orange-600 mt-2">
                        <strong>Use when:</strong> {searchResults.disabled ? 'Resolving account issues' : 'Disciplinary action or security concern'}
                      </p>
                      <Button 
                        size="sm" 
                        className="mt-3 bg-orange-600 hover:bg-orange-700"
                        onClick={() => handleConfirmAction('toggleAccount', searchResults)}
                      >
                        {searchResults.disabled ? 'Enable Account' : 'Disable Account'}
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Delete Firebase User - Super Admin Only */}
                {(isSuperAdminUser || user?.email === 'kyle@rtdacademy.com') && (
                  <Card className="p-4 border-red-200 bg-red-50">
                    <div className="flex items-start space-x-3">
                      <Trash2 className="w-5 h-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-red-900">Delete Firebase User</h4>
                        <p className="text-sm text-red-700 mt-1">
                          Permanently remove the authentication account while preserving student data.
                        </p>
                        <p className="text-xs text-red-600 mt-2">
                          <strong>Use when:</strong> Authentication issues that can't be resolved with password reset
                        </p>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          className="mt-3"
                          onClick={() => handleConfirmAction('deleteUser', searchResults)}
                        >
                          Delete User
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Information */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-900">
            <Info className="w-5 h-5 mr-2" />
            Important Information
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 space-y-2">
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><strong>Temporary passwords</strong> force users to create a new password on their next login</li>
            <li><strong>Deleting Firebase users</strong> removes authentication but preserves student data in the database</li>
            <li><strong>Disabled accounts</strong> prevent login but can be re-enabled later</li>
            <li>All actions are logged for audit purposes</li>
          </ul>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ open: false, action: '', data: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              {confirmDialog.action === 'deleteUser' && (
                <>Are you sure you want to <strong>permanently delete</strong> the Firebase authentication account for <strong className="text-red-600">{confirmDialog.data?.email}</strong>?<br/><br/>This will remove their ability to log in, but their student data will be preserved. This action cannot be undone.</>
              )}
              {confirmDialog.action === 'toggleAccount' && (
                <>Are you sure you want to <strong>{confirmDialog.data?.disabled ? 'enable' : 'disable'}</strong> the account for <strong className="text-blue-600">{confirmDialog.data?.email}</strong>?<br/><br/>{confirmDialog.data?.disabled ? 'This will allow the user to log in again.' : 'This will prevent the user from logging in until the account is re-enabled.'}</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialog({ open: false, action: '', data: null })}
            >
              Cancel
            </Button>
            <Button 
              onClick={executeAction} 
              variant={confirmDialog.action === 'deleteUser' ? 'destructive' : 'default'}
            >
              {confirmDialog.action === 'deleteUser' && 'Delete User'}
              {confirmDialog.action === 'toggleAccount' && (confirmDialog.data?.disabled ? 'Enable Account' : 'Disable Account')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Temporary Password Modal */}
      <TempPasswordModal
        open={tempPasswordModal.open}
        onClose={() => setTempPasswordModal({ open: false, userEmail: '' })}
        userEmail={tempPasswordModal.userEmail}
        isNewUser={tempPasswordModal.isNewUser}
        defaultTargetSite={defaultTargetSite}
        onConfirm={handleTempPasswordConfirm}
      />

      {/* Edit Custom Claims Dialog */}
      <Dialog open={showClaimsDialog} onOpenChange={(open) => {
        if (!open && !updatingClaims) {
          setShowClaimsDialog(false);
          setClaimsError('');
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Code className="w-5 h-5 mr-2 text-blue-600" />
              Edit Custom Claims
            </DialogTitle>
            <DialogDescription>
              Modify the user's custom claims. Be careful - invalid claims can prevent user login.
              {searchResults && (
                <div className="mt-2 text-sm font-medium">
                  User: <span className="text-blue-600">{searchResults.email}</span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-4">
              {/* Quick Actions */}
              {(() => {
                try {
                  const claims = editingClaims ? JSON.parse(editingClaims) : {};
                  if (claims.tempPasswordRequired) {
                    return (
                      <Alert className="border-amber-200 bg-amber-50">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-800">
                          <strong>Warning:</strong> <code>tempPasswordRequired: true</code> is present. 
                          This will force the user to change their password on next login.
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              try {
                                const claimsObj = JSON.parse(editingClaims);
                                delete claimsObj.tempPasswordRequired;
                                delete claimsObj.tempPasswordSetAt;
                                delete claimsObj.tempPasswordSetBy;
                                // Also remove customClaimsKeys if present
                                delete claimsObj.customClaimsKeys;
                                setEditingClaims(JSON.stringify(claimsObj, null, 2));
                              } catch (error) {
                                setClaimsError('Failed to remove claim from editor');
                              }
                            }}
                            className="ml-3 h-6 px-2 py-1 text-xs border-amber-600 text-amber-700 hover:bg-amber-100"
                          >
                            Remove from Editor
                          </Button>
                        </AlertDescription>
                      </Alert>
                    );
                  }
                  // Also check if tempPasswordRequired is in customClaimsKeys array
                  if (claims.customClaimsKeys && claims.customClaimsKeys.includes('tempPasswordRequired')) {
                    return (
                      <Alert className="border-amber-200 bg-amber-50">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-800">
                          <strong>Warning:</strong> <code>tempPasswordRequired</code> found in customClaimsKeys. 
                          This may cause authentication issues.
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              try {
                                const claimsObj = JSON.parse(editingClaims);
                                // Remove the customClaimsKeys array entirely
                                delete claimsObj.customClaimsKeys;
                                // Also ensure temp password fields are removed
                                delete claimsObj.tempPasswordRequired;
                                delete claimsObj.tempPasswordSetAt;
                                delete claimsObj.tempPasswordSetBy;
                                setEditingClaims(JSON.stringify(claimsObj, null, 2));
                              } catch (error) {
                                setClaimsError('Failed to clean claims in editor');
                              }
                            }}
                            className="ml-3 h-6 px-2 py-1 text-xs border-amber-600 text-amber-700 hover:bg-amber-100"
                          >
                            Clean Claims
                          </Button>
                        </AlertDescription>
                      </Alert>
                    );
                  }
                } catch (e) {
                  // Invalid JSON, don't show warning
                  return null;
                }
                return null;
              })()}
              
              {/* JSON Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Claims JSON (edit carefully)
                </label>
                <textarea
                  value={editingClaims}
                  onChange={(e) => {
                    setEditingClaims(e.target.value);
                    setClaimsError(''); // Clear error on edit
                  }}
                  className="w-full h-96 px-3 py-2 font-mono text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder='{}'
                  spellCheck={false}
                />
              </div>
              
              {/* Common Claims Helper */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Add Common Claims:</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      try {
                        const claims = JSON.parse(editingClaims || '{}');
                        claims.isStaffUser = true;
                        setEditingClaims(JSON.stringify(claims, null, 2));
                      } catch (error) {
                        setClaimsError('Invalid JSON in editor');
                      }
                    }}
                  >
                    Add Staff User
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      try {
                        const claims = JSON.parse(editingClaims || '{}');
                        delete claims.tempPasswordRequired;
                        delete claims.tempPasswordSetAt;
                        delete claims.tempPasswordSetBy;
                        // Also remove customClaimsKeys if it exists
                        if (claims.customClaimsKeys) {
                          delete claims.customClaimsKeys;
                        }
                        setEditingClaims(JSON.stringify(claims, null, 2));
                      } catch (error) {
                        setClaimsError('Invalid JSON in editor');
                      }
                    }}
                  >
                    Remove Temp Password
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingClaims('{}');
                    }}
                    className="text-red-600 hover:bg-red-50"
                  >
                    Clear All Claims
                  </Button>
                </div>
              </div>
              
              {/* Error Display */}
              {claimsError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{claimsError}</AlertDescription>
                </Alert>
              )}
              
              {/* Info */}
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700 text-sm">
                  <strong>Note:</strong> Claims are used for permissions and access control. 
                  Common claims include: <code>isStaffUser</code>, <code>familyId</code>, 
                  <code>familyRole</code>, <code>tempPasswordRequired</code>.
                </AlertDescription>
              </Alert>
            </div>
          </div>
          
          <DialogFooter className="border-t pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowClaimsDialog(false);
                setClaimsError('');
              }}
              disabled={updatingClaims}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateCustomClaims}
              disabled={updatingClaims || !editingClaims}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updatingClaims ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Claims'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUserManagement;