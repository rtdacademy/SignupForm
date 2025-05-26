import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth, googleProvider, microsoftProvider } from '../firebase';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const ParentSetup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [invitation, setInvitation] = useState(null);
  
  // Authentication state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authMode, setAuthMode] = useState('signin'); // signin or signup
  const [authLoading, setAuthLoading] = useState(false);

  // Validate invitation token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('No invitation token provided');
        setLoading(false);
        return;
      }

      try {
        const db = getDatabase();
        const invitationRef = ref(db, `parentInvitations/${token}`);
        const snapshot = await get(invitationRef);

        if (!snapshot.exists()) {
          setError('Invalid invitation token');
          setLoading(false);
          return;
        }

        const invitationData = snapshot.val();
        
        // Check if invitation is still valid
        if (invitationData.status !== 'pending') {
          setError('This invitation has already been used');
          setLoading(false);
          return;
        }

        // Check expiration
        const expirationTime = new Date(invitationData.expiresAt).getTime();
        if (Date.now() > expirationTime) {
          setError('This invitation has expired. Please contact the school for a new invitation.');
          setLoading(false);
          return;
        }

        setInvitation(invitationData);
        setEmail(invitationData.parentEmail);
        setLoading(false);
      } catch (err) {
        console.error('Error validating token:', err);
        setError('Failed to validate invitation');
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setAuthLoading(true);

    try {
      if (authMode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setAuthLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setAuthLoading(false);
          return;
        }

        // Create new account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        
        // Accept invitation after account creation
        await acceptInvitation();
      } else {
        // Sign in existing account
        await signInWithEmailAndPassword(auth, email, password);
        await acceptInvitation();
      }
    } catch (err) {
      console.error('Authentication error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please sign in instead.');
        setAuthMode('signin');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email. Please create an account.');
        setAuthMode('signup');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSocialAuth = async (provider) => {
    setError(null);
    setAuthLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      
      // Verify the signed-in email matches the invitation
      if (result.user.email.toLowerCase() !== invitation.parentEmail.toLowerCase()) {
        await auth.signOut();
        setError('Please sign in with the email address the invitation was sent to.');
        setAuthLoading(false);
        return;
      }

      await acceptInvitation();
    } catch (err) {
      console.error('Social auth error:', err);
      setError(err.message || 'Authentication failed');
      setAuthLoading(false);
    }
  };

  const acceptInvitation = async () => {
    try {
      const functions = getFunctions();
      const acceptParentInvitation = httpsCallable(functions, 'acceptParentInvitation');
      
      const result = await acceptParentInvitation({ invitationToken: token });
      
      if (result.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/parent-dashboard');
        }, 2000);
      } else {
        throw new Error('Failed to accept invitation');
      }
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError(err.message || 'Failed to link parent account');
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Invalid Invitation</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button 
              className="mt-4 w-full" 
              onClick={() => navigate('/login')}
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-green-600 flex items-center">
              <CheckCircle className="h-6 w-6 mr-2" />
              Success!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Your parent account has been successfully linked to {invitation.studentName}'s profile.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Redirecting to your parent dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Parent Account Setup</CardTitle>
          <CardDescription>
            Welcome! You've been invited to create a parent account for {invitation?.studentName}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={authMode} onValueChange={setAuthMode}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Create Account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Sign in with the email address the invitation was sent to
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                
                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must be at least 6 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialAuth(googleProvider)}
                disabled={authLoading}
              >
                <img
                  className="h-5 w-5 mr-2"
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                />
                Google
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialAuth(microsoftProvider)}
                disabled={authLoading}
              >
                <img
                  className="h-5 w-5 mr-2"
                  src="https://learn.microsoft.com/en-us/entra/identity-platform/media/howto-add-branding-in-apps/ms-symbollockup_mssymbol_19.png"
                  alt="Microsoft"
                />
                Microsoft
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentSetup;