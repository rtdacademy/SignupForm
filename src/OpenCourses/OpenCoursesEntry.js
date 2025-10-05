import React, { useState, useEffect } from 'react';
import { ArrowRight, BookOpen, Check, Info, Globe, Menu, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged
} from 'firebase/auth';
import { getDatabase, ref, set, get, child } from 'firebase/database';
import { auth, googleProvider, microsoftProvider, isDevelopment, analytics } from '../firebase';
import { logEvent } from 'firebase/analytics';
import { sanitizeEmail } from '../utils/sanitizeEmail';

// RTD Logo Component
const RTDLogo = ({ className = "w-10 h-10" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 75 75"
    className={className}
    role="img"
    aria-label="RTD Academy Logo"
  >
    <g transform="translate(10, 15)">
      <polygon points="40 0 46.5 12 53 24 40 24 27 24 33.5 12 40 0" fill="#0F766E"/>
      <polygon points="53 24 59.5 36 66 48 53 48 40 48 46.5 36 53 24" fill="#E0FFFF"/>
      <polygon points="27 24 33.5 36 40 48 27 48 14 48 20.5 36 27 24" fill="#14B8A6"/>
    </g>
  </svg>
);

// Auth Loading Screen Component
const AuthLoadingScreen = ({ message }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <div className="flex items-center justify-center space-x-3 mb-8">
        <RTDLogo className="w-12 h-12" />
        <h1 className="text-3xl font-extrabold text-teal-700 leading-none">RTD Academy</h1>
      </div>

      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <svg className="animate-spin h-12 w-12 text-teal-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Signing you in...</h2>
            <p className="text-sm text-gray-600">{message}</p>
          </div>

          <div className="text-xs text-gray-500">
            Please wait while we complete your authentication.
          </div>
        </div>
      </div>
    </div>
  </div>
);

const OpenCoursesEntry = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [checkingRedirect, setCheckingRedirect] = useState(true);
  const [showAuthLoading, setShowAuthLoading] = useState(false);
  const [authLoadingMessage, setAuthLoadingMessage] = useState("Completing your sign-in...");

  const db = getDatabase();

  // Convert Firebase error codes to user-friendly messages
  const getFriendlyErrorMessage = (error) => {
    const errorMessages = {
      'auth/popup-closed-by-user': 'The sign-in window was closed. Please try again.',
      'auth/popup-blocked': 'Your browser blocked the sign-in window. Please allow popups for this site and try again.',
      'auth/cancelled-popup-request': 'Sign-in process was interrupted. Please try again.',
      'auth/redirect-cancelled-by-user': 'Sign-in was cancelled. Please try again.',
      'auth/network-request-failed': 'Connection problem. Please check your internet and try again.',
      'auth/internal-error': 'An unexpected error occurred. Please try again later.',
      'auth/account-exists-with-different-credential': 'An account already exists with this email. Try signing in with a different method (Google or Microsoft).',
    };

    return errorMessages[error.code] || `Something went wrong. Please try again. (${error.message})`;
  };

  const isStaffEmail = (email) => {
    if (typeof email !== 'string') return false;
    const sanitized = sanitizeEmail(email);
    return sanitized.endsWith("@rtdacademy.com");
  };

  const ensureUserData = async (user) => {
    if (!user) return false;

    const uid = user.uid;
    const userRef = ref(db, `users/${uid}`);

    try {
      const snapshot = await get(child(ref(db), `users/${uid}`));
      if (!snapshot.exists()) {
        const sanitizedEmail = sanitizeEmail(user.email);
        const userData = {
          uid: uid,
          email: user.email,
          sanitizedEmail: sanitizedEmail,
          type: isStaffEmail(user.email) ? "staff" : "student",
          createdAt: Date.now(),
          lastLogin: Date.now(),
          provider: user.providerData[0]?.providerId || 'unknown',
          emailVerified: user.emailVerified,
          hasOpenAccess: true,
          // Mark as Open Courses user (email verification not required)
          isOpenCoursesUser: true
        };
        await set(userRef, userData);
      } else {
        const existingData = snapshot.val();
        await set(userRef, {
          ...existingData,
          lastLogin: Date.now(),
          emailVerified: user.emailVerified,
          hasOpenAccess: true,
          isOpenCoursesUser: true
        });
      }
      return true;
    } catch (error) {
      console.error("Error ensuring user data:", error);
      // For Open Courses, we'll allow users to continue even if database write fails
      // since the authentication was successful
      return true;
    }
  };

  useEffect(() => {
    // Handle redirect result from social sign-in (only in production)
    const handleRedirectResult = async () => {
      if (isDevelopment) {
        console.log('Skipping redirect result check in development');
        setCheckingRedirect(false);
        return;
      }

      try {
        setCheckingRedirect(true);
        console.log('Checking for redirect result in production...');

        const authInProgress = sessionStorage.getItem('openCoursesAuthInProgress');
        const authProvider = sessionStorage.getItem('openCoursesAuthProvider');

        if (authInProgress) {
          console.log(`Expecting redirect result from ${authProvider}`);
        }

        const result = await getRedirectResult(auth);

        if (result && result.user) {
          console.log('Redirect sign-in successful for:', result.user.email);

          setShowAuthLoading(true);
          setAuthLoadingMessage("Completing your sign-in...");

          sessionStorage.removeItem('openCoursesAuthInProgress');
          sessionStorage.removeItem('openCoursesAuthProvider');

          const user = result.user;

          if (!user.email) {
            setShowAuthLoading(false);
            setError("Unable to retrieve email from provider. Please try again.");
            return;
          }

          if (isStaffEmail(user.email)) {
            setShowAuthLoading(false);
            await auth.signOut();
            setError("This email belongs to staff. Please use a personal account to access Open Courses.");
          } else {
            setAuthLoadingMessage("Preparing your courses...");
            const success = await ensureUserData(user);
            if (success) {
              setAuthLoadingMessage("Almost ready...");
              setTimeout(() => {
                setShowAuthLoading(false);
                navigate("/open-courses-dashboard");
              }, 1000);
            } else {
              setShowAuthLoading(false);
            }
          }
        } else if (authInProgress) {
          console.log('Expected redirect result but none found');
          setShowAuthLoading(false);
          setError("Sign-in process was interrupted or cancelled. Please try again.");
          sessionStorage.removeItem('openCoursesAuthInProgress');
          sessionStorage.removeItem('openCoursesAuthProvider');
        }
      } catch (error) {
        console.error("Redirect sign-in error:", error);
        setShowAuthLoading(false);

        if (error.code !== 'auth/redirect-cancelled-by-user' &&
            error.code !== 'auth/popup-blocked' &&
            error.code !== 'auth/operation-not-allowed') {
          setError(getFriendlyErrorMessage(error) || "Failed to complete sign-in. Please try again.");
        }
      } finally {
        setCheckingRedirect(false);
      }
    };

    handleRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !checkingRedirect) {
        ensureUserData(user);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track page view with Firebase Analytics
  useEffect(() => {
    logEvent(analytics, 'page_view', {
      page_title: 'Open Courses',
      page_path: '/open-courses',
      page_location: window.location.href
    });
  }, []);

  const handleProviderSignIn = async (provider) => {
    setError(null);
    setIsAuthenticating(true);

    try {
      if (isDevelopment) {
        console.log('Using popup flow for development');
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        if (!user.email) {
          setError("Unable to retrieve email from provider. Please try again.");
          return;
        }

        if (isStaffEmail(user.email)) {
          await auth.signOut();
          setError("This email belongs to staff. Please use a personal account to access Open Courses.");
        } else {
          await ensureUserData(user);
          navigate("/open-courses-dashboard");
        }
      } else {
        console.log('Using redirect flow for production');

        sessionStorage.setItem('openCoursesAuthInProgress', 'true');
        sessionStorage.setItem('openCoursesAuthProvider', provider.providerId);

        await signInWithRedirect(auth, provider);
      }
    } catch (error) {
      console.error("Sign-in error:", error);

      if (isDevelopment && error.code === 'auth/popup-blocked') {
        setError("Popup was blocked. Please allow popups for this site and try again.");
      } else {
        setError(getFriendlyErrorMessage(error) || `Failed to sign in with ${provider.providerId}. Please try again.`);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Show auth loading screen if we're processing authentication
  if (showAuthLoading) {
    return <AuthLoadingScreen message={authLoadingMessage} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-lg py-3' : 'bg-teal-700 py-4'
      }`}>
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between">
            {/* Logo and Name with Back to Home */}
            <div className="flex items-center gap-4">
              {/* Back to Home button */}
              <button
                onClick={() => navigate('/')}
                className={`font-medium transition-colors flex items-center gap-2 ${
                  scrolled ? 'text-gray-700 hover:text-teal-700' : 'text-white/90 hover:text-white'
                }`}
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back to Home
              </button>

              {/* RTD Academy Badge - now clickable */}
              <button
                onClick={() => navigate('/')}
                className={`${
                  scrolled ? '' : 'bg-gradient-to-r from-gray-100/95 to-teal-50/95 backdrop-blur'
                } rounded-xl px-4 py-2 transition-all duration-300 ${
                  scrolled ? '' : 'shadow-lg'
                } flex items-center gap-3 hover:scale-105`}
              >
                <RTDLogo className="w-10 h-10" />
                <span className={`font-bold text-lg ${
                  scrolled
                    ? 'text-gray-900'
                    : 'bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 bg-clip-text text-transparent'
                }`}>
                  RTD Academy
                </span>
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <a href="/#courses" className={`font-medium transition-colors ${
                scrolled ? 'text-gray-700 hover:text-teal-700' : 'text-white/90 hover:text-white'
              }`}>
                Credit Courses
              </a>
              <a href="/student-faq" className={`font-medium transition-colors ${
                scrolled ? 'text-gray-700 hover:text-teal-700' : 'text-white/90 hover:text-white'
              }`}>
                FAQ
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 transition-colors ${
                scrolled ? 'text-gray-700' : 'text-white'
              }`}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </nav>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg p-6 space-y-4">
              <button
                onClick={() => navigate('/')}
                className="block py-2 text-gray-700 hover:text-teal-700 font-medium w-full text-left"
              >
                ← Back to Home
              </button>
              <a href="/#courses" className="block py-2 text-gray-700 hover:text-teal-700 font-medium">Credit Courses</a>
              <a href="/student-faq" className="block py-2 text-gray-700 hover:text-teal-700 font-medium">FAQ</a>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-white shadow-sm pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 flex items-center justify-center">
            <div className="text-center">
              {/* Main Title - Open Courses with Icon */}
              <div className="flex items-center justify-center gap-4 mb-2">
                <BookOpen className="w-12 h-12 md:w-14 md:h-14 text-green-600" />
                <h1 className="text-4xl md:text-5xl font-bold">
                  <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                    Open Courses
                  </span>
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Information */}
          <div className="space-y-8">
            {/* About Open Access */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-teal-600" />
                  About Open Access
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  RTD Academy believes in the power of open education. We provide full access
                  to our curriculum materials to support self-directed learning, homeschooling,
                  and educational advancement for all learners.
                </p>
                <p className="text-gray-700">
                  Our materials cover the complete Alberta Mathematics curriculum from Grade 10
                  through Grade 12, including Math 31 (Calculus), as well as Physics 20 and 30.
                </p>
              </CardContent>
            </Card>

            {/* What's Included */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>What's Included</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Complete lesson content and instructional videos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Practice questions with detailed solutions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Self-assessment tools and progress tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Access on any device with internet connection</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Authentication Required */}
            <Card className="shadow-sm bg-blue-50/30 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  Why Sign In?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-700">
                  While our materials are freely available, we require authentication to:
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Verify you are human and prevent automated bot access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Ensure content is accessed as intended through our platform</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Comply with Creative Commons licensing terms for authenticated access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Optionally join our mailing list for updates on new resources and registration windows</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sign In */}
          <div className="lg:sticky lg:top-24">
            <Card className="shadow-lg border-2 border-green-200">
              <CardHeader className="bg-gradient-to-br from-green-50 to-teal-50">
                <div className="flex items-center justify-center mb-4">
                  <BookOpen className="w-16 h-16 text-green-600" />
                </div>
                <CardTitle className="text-center text-2xl">
                  <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                    Get Started
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <p className="text-center text-gray-700">
                  Sign in with your Google or Microsoft account to access our free curriculum materials.
                </p>

                {error && (
                  <Alert variant="destructive" className="border-red-500 bg-red-50">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <button
                    onClick={() => handleProviderSignIn(googleProvider)}
                    disabled={isAuthenticating || checkingRedirect}
                    className={`w-full flex items-center justify-center px-6 py-3 border rounded-lg shadow-sm text-base font-medium transition-all duration-200 ${
                      isAuthenticating || checkingRedirect
                        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    {isAuthenticating || checkingRedirect ? (
                      <svg className="animate-spin h-6 w-6 mr-3 text-gray-400" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <img
                        className="h-6 w-6 mr-3"
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google logo"
                      />
                    )}
                    <span>{checkingRedirect ? 'Checking authentication...' : 'Continue with Google'}</span>
                  </button>

                  <button
                    onClick={() => handleProviderSignIn(microsoftProvider)}
                    disabled={isAuthenticating || checkingRedirect}
                    className={`w-full flex items-center justify-center px-6 py-3 border rounded-lg shadow-sm text-base font-medium transition-all duration-200 ${
                      isAuthenticating || checkingRedirect
                        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    {isAuthenticating || checkingRedirect ? (
                      <svg className="animate-spin h-6 w-6 mr-3 text-gray-400" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <img
                        className="h-6 w-6 mr-3"
                        src="https://learn.microsoft.com/en-us/entra/identity-platform/media/howto-add-branding-in-apps/ms-symbollockup_mssymbol_19.png"
                        alt="Microsoft logo"
                      />
                    )}
                    <span>{checkingRedirect ? 'Checking authentication...' : 'Continue with Microsoft'}</span>
                  </button>

                  {!isDevelopment && (
                    <p className="text-xs text-center text-blue-600 bg-blue-50 p-2 rounded">
                      You'll be redirected to sign in securely
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">
                    <span className="font-semibold text-gray-900">Need official high school credits?</span>
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Our{' '}
                    <a
                      href="/#courses"
                      className="text-teal-600 hover:text-teal-700 font-medium underline"
                    >
                      Credit Courses
                    </a>
                    {' '}are available with full teacher support and official Alberta high school credits.
                  </p>
                  <Button
                    onClick={() => window.location.href = '/#courses'}
                    className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
                  >
                    Enroll in Credit Courses <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-sm text-gray-500 pb-8">
        <p>&copy; {new Date().getFullYear()} RTD Academy</p>
      </footer>
    </div>
  );
};

export default OpenCoursesEntry;