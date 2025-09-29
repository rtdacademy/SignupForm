import React, { useState, useEffect } from 'react';
import { ArrowRight, BookOpen, Check, Info, Scale, Globe, Menu, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useNavigate, useLocation } from 'react-router-dom';
import Login from '../Dashboard/Login';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '../components/ui/accordion';

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

const OpenCoursesEntry = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Ensure the URL has the open mode parameter for the Login component
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (!searchParams.has('mode')) {
      searchParams.set('mode', 'open');
      navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
    }
  }, [location, navigate]);

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
              <a href="/get-started" className={`font-medium transition-colors ${
                scrolled ? 'text-gray-700 hover:text-teal-700' : 'text-white/90 hover:text-white'
              }`}>
                Credit Courses
              </a>
              <a href="/student-faq" className={`font-medium transition-colors ${
                scrolled ? 'text-gray-700 hover:text-teal-700' : 'text-white/90 hover:text-white'
              }`}>
                FAQ
              </a>
              <Button
                onClick={() => navigate('/login')}
                className={`${
                scrolled
                  ? 'bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 hover:from-teal-700 hover:via-cyan-700 hover:to-teal-800 text-white'
                  : 'bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-800 hover:from-teal-100 hover:to-cyan-100 border border-teal-200/50'
              } px-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold`}>
                Student Login <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
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
              <a href="/get-started" className="block py-2 text-gray-700 hover:text-teal-700 font-medium">Credit Courses</a>
              <a href="/student-faq" className="block py-2 text-gray-700 hover:text-teal-700 font-medium">FAQ</a>
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 hover:from-teal-700 hover:via-cyan-700 hover:to-teal-800 text-white shadow-md hover:shadow-lg transition-all"
              >
                Student Login <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
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

          {/* Right Column - Login Component */}
          <div className="lg:sticky lg:top-24">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Sign In to Access Materials
              </h2>
              <p className="text-gray-600">
                Create a free account or sign in to begin learning.
              </p>
            </div>
            <Login
              hideWelcome={true}
              compactView={true}
              hideOtherOptions={true}
            />

            {/* Note about Credit Courses */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">Need official Alberta credits?</span><br />
                Our{' '}
                <button
                  onClick={() => navigate('/get-started')}
                  className="text-teal-600 hover:text-teal-700 font-medium underline"
                >
                  Credit Courses
                </button>
                {' '}provide diploma-eligible programs with certified teacher support.
              </p>
            </div>

            {/* Licensing Information - Now below credit courses */}
            <Accordion type="single" collapsible className="w-full mt-4">
              <AccordionItem value="terms" className="border-teal-200 bg-teal-50/30">
                <AccordionTrigger className="hover:bg-teal-50/50">
                  <span className="flex items-center gap-2 text-sm">
                    <Scale className="w-4 h-4 text-teal-600" />
                    Terms of Use
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-4 py-2 space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-teal-200">
                      <p className="font-semibold text-gray-900 mb-2 text-sm">
                        Open Access Terms
                      </p>
                      <p className="text-xs text-gray-700 mb-3">
                        RTD Academy provides free access to our educational materials with the following simple terms:
                      </p>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-start gap-2">
                          <Check className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600">Materials are for personal educational use</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600">Content should be accessed through our platform</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600">Automated scraping or bulk downloading is not permitted</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-teal-100">
                        <p className="text-xs text-gray-500 italic">
                          We provide these materials freely to support learning. Please respect the platform and
                          other users by accessing content as intended.
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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