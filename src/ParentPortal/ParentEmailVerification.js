import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Mail, CheckCircle, Shield, ArrowLeft, Loader2 } from 'lucide-react';

const ParentEmailVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Get email from URL params or localStorage
    const emailFromParams = searchParams.get('email');
    const emailFromStorage = localStorage.getItem('verificationEmail');
    
    const targetEmail = emailFromParams || emailFromStorage || '';
    setEmail(targetEmail);

    // Clean up localStorage
    localStorage.removeItem('verificationEmail');
    localStorage.removeItem('verificationEmailSent');
    localStorage.removeItem('parentPortalSignup');

    // Set up auth state listener to handle verification
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setChecking(false);
      
      if (user && user.emailVerified) {
        // User is verified, redirect to parent dashboard
        console.log('User verified, redirecting to parent dashboard');
        navigate('/parent-dashboard');
        return;
      }
      
      if (user && !user.emailVerified) {
        // User is signed in but not verified, sign them out
        console.log('User not verified, signing out');
        await signOut();
      }
    });

    return () => unsubscribe();
  }, [navigate, searchParams, signOut]);

  const handleBackToLogin = () => {
    navigate('/parent-login');
  };

  const handleOpenEmailClient = () => {
    // Try to open the default email client
    window.location.href = 'mailto:';
  };

  // Show loading while checking verification status
  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Checking verification status...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900">RTD Academy</h1>
          <h2 className="mt-2 text-xl font-semibold text-gray-700">Parent Portal</h2>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Verify Your Email
            </CardTitle>
            <CardDescription className="mt-2">
              We've sent you a verification link to get started
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {email && (
              <Alert className="border-blue-200 bg-blue-50">
                <Mail className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Email sent to:</strong>
                  <div className="font-medium mt-1">{email}</div>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-blue-600">1</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Check your email</h3>
                  <p className="text-sm text-gray-600">
                    Look for an email from RTD Academy in your inbox (and spam folder).
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-blue-600">2</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Click the verification link</h3>
                  <p className="text-sm text-gray-600">
                    Click the "Verify Email" button in the email to confirm your account.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Sign in to your account</h3>
                  <p className="text-sm text-gray-600">
                    After verification, return to the parent login page to access your dashboard.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6 space-y-3">
              <Button 
                onClick={handleOpenEmailClient}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Mail className="h-4 w-4 mr-2" />
                Open Email App
              </Button>
              
              <Button 
                onClick={handleBackToLogin}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Parent Login
              </Button>
            </div>

            <Alert className="border-amber-200 bg-amber-50">
              <Shield className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Security Notice:</strong> You must verify your email before accessing the parent portal. 
                This ensures the security of your child's educational information.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} RTD Math Academy. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ParentEmailVerification;