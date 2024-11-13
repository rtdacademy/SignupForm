import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, database } from '../firebase';
import { ref, onValue } from 'firebase/database';
import {
  LogOut,
  Menu,
  X,
  Home,
  BookOpen,
  Settings,
  User,
} from 'lucide-react';

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

const ProfilePicture = ({ photoURL, displayName }) => {
  if (!photoURL) {
    const initials = displayName
      ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
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
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <EdBotzLogo />
            </div>
            <nav className="hidden md:flex space-x-8 ml-10">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => navigate(item.href)}
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 hover:text-blue-600 hover:border-blue-500 transition-colors duration-200"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Profile and Sign Out Button */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <ProfilePicture
                photoURL={userProfile?.photoURL}
                displayName={userProfile?.displayName}
              />
              <span className="text-sm font-medium text-gray-700">
                {userProfile?.displayName}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
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
          {/* Profile section in mobile menu */}
          <div className="flex items-center px-4 py-2 border-b border-gray-200">
            <ProfilePicture
              photoURL={userProfile?.photoURL}
              displayName={userProfile?.displayName}
            />
            <span className="ml-3 text-base font-medium text-gray-700">
              {userProfile?.displayName}
            </span>
          </div>
          
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.href);
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              >
                <Icon className="w-4 h-4 mr-2" />
                {item.name}
              </button>
            );
          })}
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
        <div className="flex space-x-6">
          <a href="/privacy" className="text-sm text-gray-500 hover:text-blue-600">
            Privacy Policy
          </a>
          <a href="/terms" className="text-sm text-gray-500 hover:text-blue-600">
            Terms of Service
          </a>
          <a href="/contact" className="text-sm text-gray-500 hover:text-blue-600">
            Contact Us
          </a>
        </div>
      </div>
    </div>
  </footer>
);

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