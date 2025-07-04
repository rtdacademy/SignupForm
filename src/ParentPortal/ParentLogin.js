import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth, googleProvider, microsoftProvider } from '../firebase';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { useAuth } from '../context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "../components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "../components/ui/tabs";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Loader2, CheckCircle, AlertCircle, Users, ChevronDown, ChevronUp, ShieldCheck, ExternalLink, MapPin } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../components/ui/collapsible';
import AddressPicker from '../components/AddressPicker';

const ParentLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const isFirstTime = searchParams.get('firstTime') === 'true';
  const emailFromParam = searchParams.get('email');
  const { parentLoginProgress, setParentLoginProgress } = useAuth();

  // Invitation state
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState(null);
  const [invitationError, setInvitationError] = useState(null);

  // Auth state
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [emailInput, setEmailInput] = useState(emailFromParam || '');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState(isFirstTime ? 'signup' : 'signin');
  const [authLoading, setAuthLoading] = useState(false);
  const [showEmailVerificationDialog, setShowEmailVerificationDialog] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [isResetingPassword, setIsResetingPassword] = useState(false);
  
  // Accordion state for email/password forms
  const [isEmailFormOpen, setIsEmailFormOpen] = useState(false);

  // Student verification state (ASN or Address)
  const [showStudentVerificationDialog, setShowStudentVerificationDialog] = useState(false);
  const [verificationType, setVerificationType] = useState('asn'); // 'asn' or 'address'
  const [asnInput, setAsnInput] = useState('');
  const [addressInput, setAddressInput] = useState(null);
  const [verificationError, setVerificationError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationOptions, setVerificationOptions] = useState({ asn: true, address: true });

  // Success state
  const [success, setSuccess] = useState(false);
  const [linkingResult, setLinkingResult] = useState(null);

  // Clear parent login progress on mount
  useEffect(() => {
    setParentLoginProgress({
      isLoading: false,
      step: '',
      message: ''
    });
  }, [setParentLoginProgress]);

  // Validate invitation token on mount (if token provided)
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        // No token provided - this is a regular parent login or firstTime signup
        if (isFirstTime && emailFromParam) {
          // Pre-fill email for first-time parent
          setEmailInput(decodeURIComponent(emailFromParam));
          setActiveTab('signup');
        }
        setLoading(false);
        return;
      }

      try {
        const functions = getFunctions();
        const validateParentInvitation = httpsCallable(functions, 'validateParentInvitation');
        
        const result = await validateParentInvitation({ token });
        
        if (result.data.success) {
          setInvitation(result.data.invitation);
          setEmailInput(result.data.invitation.parentEmail);
          setActiveTab('signup'); // Default to signup tab for new invitations
          setVerificationOptions(result.data.invitation.verificationOptions || { asn: true, address: true });
          // Default to ASN if available, otherwise address
          setVerificationType(result.data.invitation.verificationOptions?.asn ? 'asn' : 'address');
          setLoading(false);
        } else {
          setInvitationError('Invalid invitation token. Please check your email link.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error validating token:', err);
        
        // Check if it's a "used invitation" or similar error - redirect to regular login
        const errorMessage = err.message || '';
        if (errorMessage.includes('already been used') || 
            errorMessage.includes('expired') || 
            errorMessage.includes('Invalid invitation') ||
            errorMessage.includes('no longer valid')) {
          console.log('Invitation already used or expired, redirecting to regular parent login');
          // Remove the token from URL and show helpful message
          window.history.replaceState({}, document.title, '/parent-login');
          setMessage('This invitation has already been used. Please sign in with your parent account below.');
          setLoading(false);
          return;
        }
        
        // For other errors, show error message
        setInvitationError(errorMessage || 'Failed to validate invitation. Please try again.');
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  // Error handling
  const getFriendlyErrorMessage = (error) => {
    const errorMessages = {
      'auth/invalid-credential': 'The email or password is incorrect. Please try again.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/user-disabled': 'This account has been disabled. Please contact support.',
      'auth/user-not-found': 'We couldn\'t find an account with this email. Please check your email or create a new account.',
      'auth/wrong-password': 'The password you entered is incorrect. Please try again.',
      'auth/too-many-requests': 'Too many unsuccessful attempts. Please try again later or reset your password.',
      'auth/email-already-in-use': 'An account with this email already exists. Please sign in instead.',
      'auth/weak-password': 'Your password is too weak. Please use a stronger password with at least 7 characters including numbers and symbols.',
      'auth/popup-closed-by-user': 'The sign-in window was closed. Please try again.',
      'auth/popup-blocked': 'Your browser blocked the sign-in window. Please allow popups for this site and try again.',
    };
    
    return errorMessages[error.code] || `Something went wrong. Please try again. (${error.message})`;
  };

  // Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*]).{7,}$/;

  const validateEmail = (email) => {
    return emailRegex.test(email.trim());
  };

  const validatePassword = (password) => {
    return passwordRegex.test(password);
  };

  // Format ASN input - matching NonPrimaryStudentForm.js implementation
  const formatASN = (value) => {
    // Remove all non-digits and limit to 9 digits
    let formattedValue = value.replace(/\D/g, "").slice(0, 9);
    
    // Apply ####-####-# format
    if (formattedValue.length > 4) {
      formattedValue = `${formattedValue.slice(0, 4)}-${formattedValue.slice(4)}`;
    }
    if (formattedValue.length > 9) {
      formattedValue = `${formattedValue.slice(0, 9)}-${formattedValue.slice(9)}`;
    }
    
    return formattedValue;
  };

  // Verify student identity before accepting invitation
  const verifyStudent = async () => {
    // Clear any previous errors
    setVerificationError('');
    
    try {
      setVerifying(true);

      // Validate based on verification type
      if (verificationType === 'asn') {
        if (!asnInput.trim()) {
          setVerificationError('Please enter the student\'s Alberta Student Number');
          setVerifying(false);
          return;
        }
      } else if (verificationType === 'address') {
        if (!addressInput) {
          setVerificationError('Please select the student\'s home address');
          setVerifying(false);
          return;
        }
      }

      const functions = getFunctions();
      const verifyStudentASN = httpsCallable(functions, 'verifyStudentASN');
      
      const verificationData = {
        invitationToken: token,
        verificationType
      };
      
      if (verificationType === 'asn') {
        verificationData.providedASN = asnInput.trim();
      } else {
        verificationData.providedAddress = addressInput;
      }
      
      const result = await verifyStudentASN(verificationData);
      
      if (result.data.success) {
        // Verification successful, now accept invitation
        setShowStudentVerificationDialog(false);
        await acceptInvitation();
      } else {
        throw new Error('Verification failed');
      }
    } catch (err) {
      console.error('Error verifying student:', err);
      
      // Extract the error message from the server
      let errorMessage = 'Failed to verify student information. Please try again.';
      
      // The error message from our cloud function should be in err.message
      if (err.message) {
        errorMessage = err.message;
      }
      
      setVerifying(false);
      setVerificationError(errorMessage);
    }
  };

  // Auto-accept invitation after successful authentication AND ASN verification
  const acceptInvitation = async () => {
    try {
      setAuthLoading(true);
      const functions = getFunctions();
      const acceptParentInvitation = httpsCallable(functions, 'acceptParentInvitation');
      
      const result = await acceptParentInvitation({ invitationToken: token });
      
      if (result.data.success) {
        setLinkingResult(result.data);
        setSuccess(true);
        setAuthLoading(false);
      } else {
        throw new Error('Failed to accept invitation');
      }
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError(err.message || 'Failed to link parent account. Please contact support.');
      setAuthLoading(false);
    }
  };

  // Handle social sign-in
  const handleSocialSignIn = async (provider) => {
    setError(null);
    setMessage(null);
    setAuthLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Set localStorage flag for parent portal access when not using token/invitation
      if (!token && !invitation) {
        localStorage.setItem('parentPortalSignup', 'true');
      }

      if (!user.email) {
        setError('Unable to retrieve email from provider. Please try again.');
        setAuthLoading(false);
        return;
      }

      if (token && invitation) {
        // Token-based flow: verify email matches invitation
        if (user.email.toLowerCase() !== invitation.parentEmail.toLowerCase()) {
          setError(`This invitation was sent to ${invitation.parentEmail}. Please sign in with that email address.`);
          await auth.signOut();
          setAuthLoading(false);
          return;
        }
        // Show verification dialog
        setShowStudentVerificationDialog(true);
        setAuthLoading(false);
      } else {
        // Regular parent login: Set progress and let AuthContext handle the rest
        setParentLoginProgress({
          isLoading: true,
          step: 'social_auth',
          message: `Signing in with ${provider.providerId.includes('google') ? 'Google' : 'Microsoft'}...`
        });
        setAuthLoading(false);
        // Don't clear progress here - let AuthContext handle it
      }
    } catch (error) {
      console.error('Social sign-in error:', error);
      setError(getFriendlyErrorMessage(error));
      setAuthLoading(false);
      setParentLoginProgress({ isLoading: false, step: '', message: '' });
    }
  };

  // Handle email/password authentication
  const handleEmailPasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setAuthLoading(true);

    // For token-based flow, verify email matches invitation
    if (token && invitation && emailInput.trim().toLowerCase() !== invitation.parentEmail.toLowerCase()) {
      setError(`This invitation was sent to ${invitation.parentEmail}. Please use that email address.`);
      setAuthLoading(false);
      return;
    }

    try {
      if (activeTab === 'signup') {
        // Create new account
        if (!validatePassword(password)) {
          setError('Password must be at least 7 characters long and include at least one number and one symbol.');
          setAuthLoading(false);
          return;
        }

        // Check if account already exists
        const methods = await fetchSignInMethodsForEmail(auth, emailInput.trim());
        if (methods.length > 0) {
          setError('An account with this email already exists. Please sign in instead.');
          setActiveTab('signin');
          setAuthLoading(false);
          return;
        }

        // Set localStorage flag for parent portal signup to ensure portal-based detection
        localStorage.setItem('parentPortalSignup', 'true');

        setParentLoginProgress({
          isLoading: true,
          step: 'email_signup',
          message: 'Creating your parent account...'
        });

        const userCredential = await createUserWithEmailAndPassword(auth, emailInput.trim(), password);
        
        // IMMEDIATELY sign out to prevent AuthContext from processing unverified user
        await auth.signOut();
        
        // Send verification email after signing out
        await sendEmailVerification(userCredential.user);
        
        if (token && invitation) {
          // Token-based flow: show verification dialog
          setShowStudentVerificationDialog(true);
          setAuthLoading(false);
          setParentLoginProgress({ isLoading: false, step: '', message: '' });
        } else {
          // Regular signup: redirect to verification page
          setAuthLoading(false);
          setParentLoginProgress({ isLoading: false, step: '', message: '' });
          navigate(`/parent-verify-email?email=${encodeURIComponent(emailInput.trim())}`);
        }
      } else {
        // Sign in with existing account
        const userCredential = await signInWithEmailAndPassword(auth, emailInput.trim(), password);
        const user = userCredential.user;
        
        // Set localStorage flag for parent portal access when not using token/invitation
        if (!token && !invitation) {
          localStorage.setItem('parentPortalSignup', 'true');
        }

        if (user.emailVerified) {
          if (token && invitation) {
            // Token-based flow: show verification dialog
            setShowStudentVerificationDialog(true);
            setAuthLoading(false);
          } else {
            // Regular sign-in: Set progress and let AuthContext handle the rest
            setParentLoginProgress({
              isLoading: true,
              step: 'email_auth',
              message: 'Signing in with email and password...'
            });
            setAuthLoading(false);
            // Don't clear progress here - let AuthContext handle it
          }
        } else {
          await sendEmailVerification(user);
          await auth.signOut();
          setAuthLoading(false);
          navigate(`/parent-verify-email?email=${encodeURIComponent(emailInput.trim())}`);
        }
      }
    } catch (error) {
      console.error('Email/password auth error:', error);
      setError(getFriendlyErrorMessage(error));
      setAuthLoading(false);
      setParentLoginProgress({ isLoading: false, step: '', message: '' });
    }
  };

  // Password reset
  const handlePasswordReset = async () => {
    setError(null);
    setMessage(null);

    if (!emailInput.trim()) {
      setError('Please enter your email address.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, emailInput.trim());
      setMessage('A password reset email has been sent. Please check your inbox.');
      setIsResetingPassword(false);
    } catch (error) {
      console.error('Password reset error:', error);
      setError(getFriendlyErrorMessage(error));
    }
  };

  // Reset form state
  const resetState = () => {
    setError(null);
    setMessage(null);
    setPassword('');
    setIsResetingPassword(false);
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    resetState();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Validating invitation...</p>
        </div>
      </div>
    );
  }

  // Invalid invitation
  if (invitationError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Invalid Invitation</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{invitationError}</AlertDescription>
            </Alert>
            <div className="mt-6 text-center">
              <Button 
                variant="outline" 
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Go to Student Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (success && linkingResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-green-600">Account Linked Successfully!</CardTitle>
            <CardDescription>
              Your parent account has been linked to {linkingResult.studentName}'s profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">What's available now:</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>✅ Approve {linkingResult.studentName}'s course enrollments</li>
                <li>✅ Access to your parent dashboard</li>
              </ul>
              <h4 className="font-medium text-purple-800 mb-2 mt-3">Coming soon:</h4>
              <ul className="text-sm text-purple-600 space-y-1">
                <li>🔄 View grades and progress</li>
                <li>🔄 Access course schedules</li>
                <li>🔄 Update contact information</li>
                <li>🔄 Communicate with teachers</li>
              </ul>
            </div>
            <Button 
              onClick={() => navigate('/parent-dashboard')}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Go to Parent Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render alerts
  const renderAlerts = () => {
    if (!error && !message) return null;
    
    return (
      <div className="mb-6">
        {error && (
          <Alert variant="destructive" className="border-red-500 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}
        {message && (
          <Alert className="border-green-500 bg-green-50">
            <AlertDescription className="text-green-800">{message}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  // Main authentication form
  const renderAuthForm = () => {
    if (isResetingPassword) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Reset Your Password</h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>
          
          {renderAlerts()}

          <form onSubmit={(e) => { e.preventDefault(); handlePasswordReset(); }} className="space-y-6">
            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                id="reset-email"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder={invitation?.parentEmail || "Enter your email"}
              />
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsResetingPassword(false)}
                className="flex-1"
              >
                Back to Sign In
              </Button>
              <Button
                type="submit"
                className="flex-1"
              >
                Send Reset Link
              </Button>
            </div>
          </form>
        </div>
      );
    }

    return (
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={switchTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="signin" className="text-base">Sign In</TabsTrigger>
          <TabsTrigger value="signup" className="text-base">Create Account</TabsTrigger>
        </TabsList>
        
        <TabsContent value="signin">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {invitation ? 'Welcome to the Parent Portal' : 'Parent Portal Sign In'}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {invitation 
                  ? `Sign in to link your account to ${invitation.studentName}'s profile and approve their enrollment.`
                  : 'Sign in to access your parent dashboard and manage your linked students.'
                }
              </p>
            
            </div>
            
            {renderAlerts()}

            <Collapsible open={isEmailFormOpen} onOpenChange={setIsEmailFormOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full mb-4 flex items-center justify-between">
                  <span>Sign in with Email & Password</span>
                  {isEmailFormOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4">
                <form onSubmit={handleEmailPasswordSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="signin-email" className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input
                      id="signin-email"
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      required
                      readOnly={!!invitation || (isFirstTime && emailFromParam)}
                      className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm ${
                        (invitation || (isFirstTime && emailFromParam)) ? 'bg-gray-50' : 'focus:outline-none focus:ring-purple-500 focus:border-purple-500'
                      }`}
                      placeholder={invitation ? invitation.parentEmail : "Enter your email address"}
                    />
                    {(invitation || (isFirstTime && emailFromParam)) && (
                      <p className="mt-1 text-xs text-gray-500">
                        {invitation ? `This invitation is for ${invitation.parentEmail}` : `Creating account for ${emailInput}`}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="signin-password" className="block text-sm font-medium text-gray-700">Password</label>
                      <button
                        type="button"
                        onClick={() => setIsResetingPassword(true)}
                        className="text-xs text-blue-600 hover:text-blue-500 focus:outline-none"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      placeholder="Your Password"
                    />
                  </div>

                  <div>
                    <Button
                      type="submit"
                      disabled={authLoading}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {authLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Linking Account...
                        </>
                      ) : (
                        invitation ? 'Sign In & Link Account' : 'Sign In'
                      )}
                    </Button>
                  </div>
                </form>
              </CollapsibleContent>
            </Collapsible>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or use email and password</span>
              </div>
            </div>

            <div className="text-center mb-4">
            
              <p className="text-sm text-gray-600">
                Sign in with your existing Google or Microsoft account for fastest access
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Button
                variant="outline"
                onClick={() => handleSocialSignIn(googleProvider)}
                disabled={authLoading}
                className="w-full"
              >
                <img
                  className="h-5 w-5 mr-2"
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google logo"
                />
                Google
              </Button>

              <Button
                variant="outline"
                onClick={() => handleSocialSignIn(microsoftProvider)}
                disabled={authLoading}
                className="w-full"
              >
                <img
                  className="h-5 w-5 mr-2"
                  src="https://learn.microsoft.com/en-us/entra/identity-platform/media/howto-add-branding-in-apps/ms-symbollockup_mssymbol_19.png"
                  alt="Microsoft logo"
                />
                Microsoft
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="signup">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Create Your Parent Account</h2>
              <p className="mt-2 text-sm text-gray-600">
                {invitation 
                  ? `Join our new Parent Portal to approve ${invitation.studentName}'s enrollment and access future features.`
                  : 'Join our new Parent Portal to manage your children\'s education and access upcoming features.'
                }
              </p>
            
            </div>
            
            {renderAlerts()}

            <Collapsible open={isEmailFormOpen} onOpenChange={setIsEmailFormOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full mb-4 flex items-center justify-between">
                  <span>Create Account with Email & Password</span>
                  {isEmailFormOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4">
                <form onSubmit={handleEmailPasswordSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input
                      id="signup-email"
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      required
                      readOnly={!!invitation || (isFirstTime && emailFromParam)}
                      className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm ${
                        (invitation || (isFirstTime && emailFromParam)) ? 'bg-gray-50' : 'focus:outline-none focus:ring-purple-500 focus:border-purple-500'
                      }`}
                      placeholder={invitation ? invitation.parentEmail : "Enter your email address"}
                    />
                    {(invitation || (isFirstTime && emailFromParam)) && (
                      <p className="mt-1 text-xs text-gray-500">
                        {invitation ? `This invitation is for ${invitation.parentEmail}` : `Creating account for ${emailInput}`}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700">Create Password</label>
                    <input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      placeholder="Create a secure password"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Password must be at least 7 characters with at least one number and one symbol.
                    </p>
                  </div>

                  <div>
                    <Button
                      type="submit"
                      disabled={authLoading}
                      className="w-full bg-white text-purple-700 border-2 border-purple-600 hover:bg-purple-50"
                    >
                      {authLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        invitation ? 'Create Parent Account & Link' : 'Create Parent Account'
                      )}
                    </Button>
                  </div>
                </form>
              </CollapsibleContent>
            </Collapsible>

            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🚀 Recommended: Quick Setup
              </h3>
              <p className="text-sm text-gray-600">
                Create your account with Google or Microsoft for fastest access
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Button
                variant="outline"
                onClick={() => handleSocialSignIn(googleProvider)}
                disabled={authLoading}
                className="w-full"
              >
                <img
                  className="h-5 w-5 mr-2"
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google logo"
                />
                Google
              </Button>

              <Button
                variant="outline"
                onClick={() => handleSocialSignIn(microsoftProvider)}
                disabled={authLoading}
                className="w-full"
              >
                <img
                  className="h-5 w-5 mr-2"
                  src="https://learn.microsoft.com/en-us/entra/identity-platform/media/howto-add-branding-in-apps/ms-symbollockup_mssymbol_19.png"
                  alt="Microsoft logo"
                />
                Microsoft
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <>
      <Dialog open={showEmailVerificationDialog} onOpenChange={setShowEmailVerificationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Email Verification Required</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-4 mt-4">
                <div>
                  We've sent a verification email to:
                  <span className="block font-medium text-blue-600 mt-1">{verificationEmail}</span>
                </div>
                <div>
                  Please check your inbox (and spam folder) for the verification link. 
                  You'll need to verify your email before you can sign in.
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={() => setShowEmailVerificationDialog(false)}
            >
              Got it, I'll check my email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showStudentVerificationDialog} onOpenChange={setShowStudentVerificationDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                Verify Student Information
              </div>
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-4 mt-4">
                <p>To protect student privacy and ensure you're authorized to access {invitation?.studentName}'s information, please verify their identity.</p>
                
                {invitation?.studentEmail && (
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    <p className="text-gray-600">Student Email: <span className="font-medium text-gray-900">{invitation.studentEmail}</span></p>
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Verification Type Selector - only show if both options available */}
            {verificationOptions.asn && verificationOptions.address && (
              <div className="space-y-2">
                <Label>Verification Method</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={verificationType === 'asn' ? 'default' : 'outline'}
                    onClick={() => {
                      setVerificationType('asn');
                      setVerificationError('');
                    }}
                    className="justify-start"
                  >
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    ASN Number
                  </Button>
                  <Button
                    type="button"
                    variant={verificationType === 'address' ? 'default' : 'outline'}
                    onClick={() => {
                      setVerificationType('address');
                      setVerificationError('');
                    }}
                    className="justify-start"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Home Address
                  </Button>
                </div>
              </div>
            )}
            
            {/* ASN Verification */}
            {verificationType === 'asn' && verificationOptions.asn && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="asn">Alberta Student Number</Label>
                  <Input
                    id="asn"
                    type="text"
                    placeholder="0000-0000-0"
                    value={asnInput}
                    onChange={(e) => setAsnInput(formatASN(e.target.value))}
                    maxLength={11}
                    className="font-mono"
                    autoComplete="off"
                  />
                  <p className="text-xs text-gray-500">Format: ####-####-#</p>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg text-sm">
                  <p className="font-medium text-blue-900 mb-1">What is an ASN?</p>
                  <p className="text-blue-700">The Alberta Student Number is a unique 9-digit identifier found on report cards and official school documents.</p>
                </div>
              </>
            )}
            
            {/* Address Verification */}
            {verificationType === 'address' && (
              <div className="space-y-2">
                <Label>Home Address</Label>
                <AddressPicker 
                  onAddressSelect={setAddressInput}
                  studentType="Parent Verification"
                />
                {addressInput && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                    <p className="text-gray-600">Selected: {addressInput.fullAddress}</p>
                  </div>
                )}
                <p className="text-xs text-gray-500">Please select the exact address the student used during registration</p>
              </div>
            )}
            
            {/* Error Display */}
            {verificationError && (
              <div className="flex items-center gap-2 mt-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-600">{verificationError}</p>
              </div>
            )}
            
            {/* Help Text */}
            {verificationType === 'asn' && (
              <div className="text-sm text-gray-600">
                <p className="mb-2">Don't know the ASN? You can find it:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>On report cards or progress reports</li>
                  <li>On school registration documents</li>
                  <li>By asking the school office</li>
                  <li>
                    <a 
                      href="https://learnerregistry.ae.alberta.ca/Home/StartLookup" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      Through the Alberta Education Learner Registry
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowStudentVerificationDialog(false);
                setAsnInput('');
                setAddressInput(null);
                setVerificationError('');
                auth.signOut();
              }}
              disabled={verifying}
            >
              Cancel
            </Button>
            <Button
              onClick={verifyStudent}
              disabled={verifying || (verificationType === 'asn' ? !asnInput.trim() : !addressInput)}
            >
              {verifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify & Continue'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Users className="h-12 w-12 text-purple-600" />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold text-center text-purple-600">RTD Academy Parent Portal</h1>
         
          {invitation ? (
            <div className="mt-4 text-center">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-800">
                  <strong>{invitation.parentName}</strong>, you've been invited to link your account to:
                </p>
                <p className="text-base font-medium text-purple-900 mt-1">
                  {invitation.studentName}
                </p>
                <p className="text-sm text-purple-700 mt-1">
                  Course: {invitation.courseName}
                </p>
                <div className="mt-3 text-xs text-purple-600 bg-purple-100 rounded p-2">
                  <strong>Coming Soon:</strong> Full parent dashboard with grades, schedules, and communication tools!
                </div>
              </div>
            </div>
          ) : !loading && (
            <div className="mt-4 text-center">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                {isFirstTime && emailFromParam ? (
                  <>
                    <p className="text-sm text-purple-800 font-medium">
                      Welcome! Your child has invited you to create a parent account.
                    </p>
                    <p className="text-sm text-purple-700 mt-2">
                      Please create your account below to view and approve their enrollment.
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-purple-800">
                    Welcome back! Sign in to access your parent dashboard.
                  </p>
                )}
                <div className="mt-3 text-xs text-purple-600 bg-purple-100 rounded p-2">
                  <strong>Coming Soon:</strong> Full parent dashboard with grades, schedules, and communication tools!
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {renderAuthForm()}
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} RTD Math Academy. All rights reserved.</p>
        </footer>
      </div>

      {/* Loading Overlay for Parent Login Progress */}
      {parentLoginProgress.isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Setting Up Your Parent Account
            </h3>
            <p className="text-gray-600 mb-4">
              {parentLoginProgress.message || 'Please wait while we set up your account...'}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                style={{
                  width: parentLoginProgress.step === 'social_auth' ? '15%' :
                         parentLoginProgress.step === 'email_auth' ? '15%' :
                         parentLoginProgress.step === 'email_signup' ? '15%' :
                         parentLoginProgress.step === 'authenticating' ? '25%' :
                         parentLoginProgress.step === 'creating_profile' ? '40%' :
                         parentLoginProgress.step === 'updating_profile' ? '40%' :
                         parentLoginProgress.step === 'initializing_session' ? '60%' :
                         parentLoginProgress.step === 'redirecting' ? '80%' :
                         parentLoginProgress.step === 'loading_dashboard' ? '95%' :
                         '10%'
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Step: {parentLoginProgress.step || 'starting'}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ParentLogin;