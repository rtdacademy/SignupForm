import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, database } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { LogOut, Menu, X, Library, Info, Shield, Home } from 'lucide-react';
import { auth as firebaseAuth } from '../firebase';
import PoliciesSheet from './documents/PoliciesSheet';
import HowItWorksSheet from './documents/HowItWorksSheet';

// EdBotz Logo Component
const EdBotzLogo = () => (
  <div className="flex items-center gap-2">
    <div className="relative w-8 h-8">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
      <div className="relative flex items-center justify-center h-full">
        <span className="text-lg font-bold text-white">E</span>
      </div>
    </div>
    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden md:block">
      EdBotz
    </span>
  </div>
);

// ProfilePicture Component
const ProfilePicture = ({ photoURL, displayName }) => {
  if (!photoURL) {
    const initials = displayName
      ? displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
      : '?';
    return (
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
        {initials}
      </div>
    );
  }
  return (
    <img
      src={photoURL}
      alt={`${displayName}'s profile`}
      className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="%234B5563"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>`;
      }}
    />
  );
};

// EdBotz Header Component
const EdBotzHeader = ({ userProfile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPoliciesOpen, setIsPoliciesOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isCoursesRoute = location.pathname === '/courses';

  const handleNavigation = () => {
    if (isCoursesRoute) {
      navigate('/dashboard');
    } else {
      navigate('/courses');
    }
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Left side: Logo and Navigation button */}
            <div className="flex items-center gap-4">
              <EdBotzLogo />
              <button
                onClick={handleNavigation}
                className="hidden md:inline-flex items-center gap-1 px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
              >
                {isCoursesRoute ? (
                  <>
                    <Home className="w-5 h-5" />
                    Home
                  </>
                ) : (
                  <>
                    <Library className="w-5 h-5" />
                    Manage Courses
                  </>
                )}
              </button>
            </div>

            {/* Right side: Profile, Nav Links, and Sign Out */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setIsHowItWorksOpen(true)}
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                  How It Works
                </button>
                <button
                  onClick={() => setIsPoliciesOpen(true)}
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Policies
                </button>
                <div className="h-4 w-px bg-gray-200" />
                <div className="flex items-center gap-3">
                  <ProfilePicture
                    photoURL={userProfile?.photoURL}
                    displayName={userProfile?.displayName}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      {userProfile?.displayName}
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                      title="Sign Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100"
              >
                {isOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
          <div className="pt-2 pb-3 space-y-1">
            <div className="flex items-center px-4 py-2 border-b border-gray-200">
              <ProfilePicture
                photoURL={userProfile?.photoURL}
                displayName={userProfile?.displayName}
              />
              <span className="ml-3 text-base font-medium text-gray-700">
                {userProfile?.displayName}
              </span>
            </div>
            <button
              onClick={handleNavigation}
              className="flex items-center w-full px-4 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50"
            >
              {isCoursesRoute ? (
                <>
                  <Home className="w-5 h-5 mr-2" />
                  Home
                </>
              ) : (
                <>
                  <Library className="w-5 h-5 mr-2" />
                  Manage Courses
                </>
              )}
            </button>
            
            <button
              onClick={() => setIsHowItWorksOpen(true)}
              className="flex items-center w-full px-4 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50"
            >
              <Info className="w-5 h-5 mr-2" />
              How It Works
            </button>
            
            <button
              onClick={() => setIsPoliciesOpen(true)}
              className="flex items-center w-full px-4 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50"
            >
              <Shield className="w-5 h-5 mr-2" />
              Policies
            </button>

            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Sheets */}
      <PoliciesSheet 
        open={isPoliciesOpen} 
        onOpenChange={setIsPoliciesOpen} 
      />
      <HowItWorksSheet 
        open={isHowItWorksOpen}
        onOpenChange={setIsHowItWorksOpen}
      />
    </>
  );
};

// EdBotz Footer Component
const EdBotzFooter = () => (
  <footer className="bg-white border-t border-gray-200">
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center">
          <EdBotzLogo />
          <span className="ml-2 text-sm text-gray-500">
            © {new Date().getFullYear()} EdBotz. All rights reserved.
          </span>
        </div>
      </div>
    </div>
  </footer>
);

// Main Layout Component
const EdBotzLayout = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userRef = ref(database, `edbotz/edbotzUsers/${user.uid}`);
      const unsubscribe = onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          setUserProfile(snapshot.val());
        }
      });
      return () => unsubscribe();
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <EdBotzHeader userProfile={userProfile} />
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <EdBotzFooter />
    </div>
  );
};

export default EdBotzLayout;