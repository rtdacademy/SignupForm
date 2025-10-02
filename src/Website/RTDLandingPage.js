import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Check, ChevronDown, Menu, X, BookOpen, Users, Award, Clock, GraduationCap, Calendar, Phone, Mail, MapPin, Star, Info, Globe, DollarSign, InfoIcon, HelpCircle, Calculator, ExternalLink, Sparkles, Copy, Link } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../components/ui/dropdown-menu';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/accordion';
import { COURSE_OPTIONS } from '../config/DropdownOptions';
import { websiteConfig } from './websiteConfig';
import { courseData, getCourseById, subjectColors } from '../components/PrerequisiteFlowChart/courseData';
import './styles/rtd-landing.css';

// RTD Logo Component
const RTDLogo = ({ className = "w-12 h-12" }) => (
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

// Constants for triangle animation
const TRIANGLE_SIZE = 220;
const MOVEMENT_SPEED = 0.2;
const ROTATION_SPEED = 0.001;

// MovingTriangle Component for animated background
const MovingTriangle = ({ color, initialX, initialY, initialAngle }) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [angle, setAngle] = useState(initialAngle);
  const [direction, setDirection] = useState({
    x: Math.cos(initialAngle) * MOVEMENT_SPEED,
    y: Math.sin(initialAngle) * MOVEMENT_SPEED
  });
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });
  const requestRef = useRef();

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const updatePosition = () => {
      setPosition(prevPos => {
        let newX = prevPos.x + direction.x;
        let newY = prevPos.y + direction.y;
        let newDirection = { ...direction };

        if (newX <= -TRIANGLE_SIZE || newX >= dimensions.width) {
          newDirection.x = -direction.x;
        }
        if (newY <= -TRIANGLE_SIZE || newY >= dimensions.height) {
          newDirection.y = -direction.y;
        }

        setDirection(newDirection);
        return { x: newX, y: newY };
      });

      setAngle(prevAngle => prevAngle + ROTATION_SPEED);
      requestRef.current = requestAnimationFrame(updatePosition);
    };

    requestRef.current = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(requestRef.current);
  }, [direction, dimensions]);

  const points = `
    ${position.x + TRIANGLE_SIZE / 2},${position.y}
    ${position.x},${position.y + TRIANGLE_SIZE}
    ${position.x + TRIANGLE_SIZE},${position.y + TRIANGLE_SIZE}
  `;

  return (
    <polygon
      points={points}
      fill={color}
      opacity="0.15"
      transform={`rotate(${angle * (180 / Math.PI)} ${position.x + TRIANGLE_SIZE / 2} ${position.y + TRIANGLE_SIZE / 2})`}
    />
  );
};

// Professional Header Component
const Header = ({ scrolled }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-lg py-3' : 'bg-teal-700 py-4'
    }`}>
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between">
          {/* Logo and Name */}
          <div className="flex items-center">
            <div className={`${
              scrolled ? '' : 'bg-gradient-to-r from-gray-100/95 to-teal-50/95 backdrop-blur'
            } rounded-xl px-4 py-2 transition-all duration-300 ${
              scrolled ? '' : 'shadow-lg'
            } flex items-center gap-3`}>
              <RTDLogo className="w-10 h-10" />
              <span className={`font-bold text-lg ${
                scrolled
                  ? 'text-gray-900'
                  : 'bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 bg-clip-text text-transparent'
              }`}>
                RTD Academy
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Courses Dropdown */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger className={`font-medium transition-colors flex items-center gap-1 ${
                scrolled ? 'text-gray-700 hover:text-teal-700' : 'text-white/90 hover:text-white'
              }`}>
                Courses
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem asChild>
                  <a href="#courses" className="cursor-pointer">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    All Courses
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="#open-courses" className="cursor-pointer">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Open Courses (Free)
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* For Students Dropdown */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger className={`font-medium transition-colors flex items-center gap-1 ${
                scrolled ? 'text-gray-700 hover:text-teal-700' : 'text-white/90 hover:text-white'
              }`}>
                For Students
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <a href="https://yourway.rtdacademy.com/adult-students" className="cursor-pointer">
                    <Users className="mr-2 h-4 w-4" />
                    Adult Students
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="https://yourway.rtdacademy.com/international-students" className="cursor-pointer">
                    <Globe className="mr-2 h-4 w-4" />
                    International Students
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* FAQ - Direct Link (Important) */}
            <a href="/student-faq" className={`font-medium transition-colors ${
              scrolled ? 'text-gray-700 hover:text-teal-700' : 'text-white/90 hover:text-white'
            }`}>
              FAQ
            </a>

            {/* Helpful Tools - Direct Link */}
            <a href="#helpful-tools" className={`font-medium transition-colors ${
              scrolled ? 'text-gray-700 hover:text-teal-700' : 'text-white/90 hover:text-white'
            }`}>
              Helpful Tools
            </a>

            {/* Direct Links */}
            <a href="#footer" className={`font-medium transition-colors ${
              scrolled ? 'text-gray-700 hover:text-teal-700' : 'text-white/90 hover:text-white'
            }`}>
              Contact
            </a>
            <a href="https://yourway.rtdacademy.com/login" className={`font-medium transition-colors ${
              scrolled ? 'text-gray-700 hover:text-teal-700' : 'text-white/90 hover:text-white'
            }`}>
              Login
            </a>
            <Button
              onClick={() => window.open('https://yourway.rtdacademy.com/get-started', '_blank')}
              className={`${
              scrolled
                ? 'bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 hover:from-teal-700 hover:via-cyan-700 hover:to-teal-800 text-white'
                : 'bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-800 hover:from-teal-100 hover:to-cyan-100 border border-teal-200/50'
            } px-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold`}>
              Get started <ArrowRight className="ml-2 h-4 w-4" />
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
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg p-6 space-y-4 max-h-[calc(100vh-80px)] overflow-y-auto">
            {/* Courses Section */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2">Courses</p>
              <a href="#courses" className="block py-2 px-2 text-gray-700 hover:text-teal-700 hover:bg-teal-50 rounded font-medium">All Courses</a>
              <a href="#open-courses" className="block py-2 px-2 text-gray-700 hover:text-teal-700 hover:bg-teal-50 rounded font-medium">Open Courses (Free)</a>
            </div>

            <div className="border-t border-gray-200"></div>

            {/* For Students Section */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2">For Students</p>
              <a href="https://yourway.rtdacademy.com/adult-students" className="block py-2 px-2 text-gray-700 hover:text-teal-700 hover:bg-teal-50 rounded font-medium">Adult Students</a>
              <a href="https://yourway.rtdacademy.com/international-students" className="block py-2 px-2 text-gray-700 hover:text-teal-700 hover:bg-teal-50 rounded font-medium">International Students</a>
            </div>

            <div className="border-t border-gray-200"></div>

            {/* FAQ - Prominent Position */}
            <a href="/student-faq" className="block py-3 px-2 text-gray-900 hover:text-teal-700 hover:bg-teal-50 rounded font-semibold text-base">
              Student FAQ
            </a>

            <div className="border-t border-gray-200"></div>

            {/* Helpful Tools - Prominent Position */}
            <a href="#helpful-tools" className="block py-3 px-2 text-gray-900 hover:text-teal-700 hover:bg-teal-50 rounded font-semibold text-base">
              Helpful Tools
            </a>

            <div className="border-t border-gray-200"></div>

            {/* Quick Links */}
            <div className="space-y-2">
              <a href="/policies-reports" className="block py-2 px-2 text-gray-700 hover:text-teal-700 hover:bg-teal-50 rounded font-medium">Policies & Reports</a>
              <a href="#footer" className="block py-2 px-2 text-gray-700 hover:text-teal-700 hover:bg-teal-50 rounded font-medium">Contact</a>
              <a href="https://yourway.rtdacademy.com/login" className="block py-2 px-2 text-gray-700 hover:text-teal-700 hover:bg-teal-50 rounded font-medium">Login</a>
            </div>

            {/* CTA Button */}
            <Button
              onClick={() => window.open('https://yourway.rtdacademy.com/get-started', '_blank')}
              className="w-full bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 hover:from-teal-700 hover:via-cyan-700 hover:to-teal-800 text-white shadow-md hover:shadow-lg transition-all">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

// Hero Section Component - Modern and Professional with Teal Theme
const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/20 flex items-center pt-20">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-teal-200 to-cyan-300 rounded-full blur-3xl opacity-25 animate-pulse-slow" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-tr from-purple-200 to-teal-200 rounded-full blur-3xl opacity-20 animate-pulse-slow animation-delay-2000" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-bl from-cyan-100 to-teal-100 rounded-full blur-3xl opacity-15" />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content - Text */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 bg-clip-text text-transparent animate-gradient-x">
                Master High School
              </span>
              <br />
              <span className="text-gray-900">Math & Physics</span>
              <br />
              <span className="text-gray-700 text-3xl md:text-4xl lg:text-5xl">
                Your Way, Your Pace
              </span>
            </h1>

            <div className="space-y-3 text-lg text-gray-700">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <span>Complete Math 10 through Math 31 curriculum</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <span>Physics 20 and 30 available</span>
              </div>
            </div>

            {/* Important Notice Card with animated gradient border */}
            <div className="relative bg-gradient-to-r from-teal-50 via-cyan-50 to-teal-50 p-6 rounded-xl shadow-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 opacity-20 animate-gradient-x"></div>
              <div className="relative">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-teal-700 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-teal-900">Free for Grant-Funded Students • No Hidden Fees</p>
                  <p className="text-sm text-teal-800 mt-1">
                    If you're a Non-Primary, Home Education, or Summer School student in Alberta, courses are completely free through grant funding. We believe in transparent pricing with no surprise charges.
                  </p>
                  <Button
                    onClick={() => window.location.href = '/student-faq#grantFunding'}
                    variant="link"
                    className="h-auto p-0 mt-2 text-teal-900 hover:text-teal-700 font-medium text-sm"
                  >
                    Learn more about grant funding eligibility →
                  </Button>
                </div>
              </div>
              </div>
            </div>

            {/* Registration Deadline Card with gradient accent */}
            <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 space-y-4 border border-gray-200 shadow-lg hover:shadow-xl transition-all group overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-lg text-gray-900">{websiteConfig.dates.currentSchoolYear} Registration Open</h3>
              </div>
              <div className="space-y-2 pl-7">
                <p className="text-gray-700">
                  <span className="font-semibold">Term 1 Deadline:</span> {websiteConfig.dates.term1.registrationDeadline}
                </p>
                <p className="text-sm text-gray-600 italic">
                  Adult and International students can register anytime throughout the year
                </p>
              </div>
            </div>


            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                onClick={() => window.open('https://yourway.rtdacademy.com/get-started', '_blank')}
                className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 hover:from-teal-700 hover:via-cyan-700 hover:to-teal-800 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById('courses').scrollIntoView({ behavior: 'smooth' })}
                className="relative border-2 border-teal-600 text-teal-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 px-8 py-6 text-lg transition-all duration-300 overflow-hidden group">
                <span className="relative z-10">Browse Courses</span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-100 to-cyan-100 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </Button>
            </div>

            {/* Trust Badges - Dual Accreditation */}
            <div className="flex flex-wrap items-center gap-6 pt-6 p-4 bg-gradient-to-r from-gray-50 to-teal-50/30 rounded-xl">
              <div className="flex items-center gap-3">
                <img
                  src="/RTDAcademyWebsite/6303d64d9628820f05340b8b_Alberta_Education_Logo.png"
                  alt="Alberta Education"
                  className="h-12"
                />
                <div className="border-l-2 border-gray-300 pl-3">
                  <p className="text-xs font-semibold text-gray-900">Alberta Education</p>
                  <p className="text-xs text-gray-600">Fully Accredited</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src="/RTDAcademyWebsite/AISCA-Logo-LG.png"
                  alt="AISCA"
                  className="h-12"
                />
                <div className="border-l-2 border-gray-300 pl-3">
                  <p className="text-xs font-semibold text-gray-900">AISCA Member</p>
                  <p className="text-xs text-gray-600">Independent Schools</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-teal-300 via-cyan-300 to-purple-300 rounded-2xl blur-3xl opacity-30 animate-pulse-slow"></div>
            <img
              src="/RTDAcademyWebsite/pasted-image-1758144484998.png"
              alt="Happy Students Learning Online"
              className="relative w-full h-auto rounded-2xl shadow-2xl"
            />
            {/* Stats Overlay with gradient background */}
            <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-r from-white/95 via-teal-50/95 to-white/95 backdrop-blur-lg rounded-xl p-4 shadow-xl border border-white/50">
              <div className="flex justify-around text-center">
                <div>
                  <p className="text-2xl font-bold text-teal-700">15+</p>
                  <p className="text-xs text-gray-600">Years of Expert Teaching</p>
                </div>
                <div className="border-l border-gray-200"></div>
                <div>
                  <p className="text-2xl font-bold text-teal-700">1000s</p>
                  <p className="text-xs text-gray-600">Courses Completed</p>
                </div>
                <div className="border-l border-gray-200"></div>
                <div>
                  <p className="text-2xl font-bold text-teal-700">100%</p>
                  <p className="text-xs text-gray-600">Flexible Learning</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-sm text-teal-700 font-medium mb-2">Discover More</p>
          <ChevronDown className="w-6 h-6 mx-auto text-teal-600 animate-bounce" />
        </div>
      </div>
    </section>
  );
};

// Accreditation Banner - Clean and Professional
const AccreditationBanner = () => {
  return (
    <section className="bg-gradient-to-r from-teal-700 to-teal-800 py-16 shadow-xl relative z-10">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Your pathway to an Alberta High School Diploma
          </h2>
          <p className="text-5xl font-bold mb-8">since 2008</p>

          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Check className="text-white" size={24} />
              </div>
              <span className="text-lg font-medium">Free courses for eligible students</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Check className="text-white" size={24} />
              </div>
              <span className="text-lg font-medium">Alberta curriculum</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Check className="text-white" size={24} />
              </div>
              <span className="text-lg font-medium">Earn full Alberta high school credits</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Life Advantage Section - Light Background
const LifeAdvantageSection = () => {
  const advantages = [
    {
      icon: Clock,
      title: "Fit into your schedule",
      description: "Access Alberta's best online math and physics instruction anytime, anywhere, on any device."
    },
    {
      icon: BookOpen,
      title: "Learn quickly",
      description: "Master math and coding with expert video courses, practice tests and personalized advice."
    },
    {
      icon: Award,
      title: "Gain confidence",
      description: "No matter your life goals, come away with critical skills and confidence to succeed as an adult."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-teal-50/20 shadow-md relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Your new, incredible <span className="text-teal-700">life advantage</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Learn life-changing, future money-making skills at home. Grant-funded students learn for free.
            You'll be getting ahead every single day with highly desirable skills that
            universities and employers want.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {advantages.map((item, index) => (
            <Card key={index} className="relative border-2 border-teal-600 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-teal-50/30 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-100 to-cyan-100 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <CardContent className="p-8 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
                  <item.icon className="text-teal-700 h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-center mb-4 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 text-center leading-relaxed">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Teacher Support Section */}
        <div className="mt-16 bg-gradient-to-r from-white via-gray-50 to-white rounded-xl shadow-xl p-8 border border-gray-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-500 via-cyan-500 to-purple-500"></div>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <img
              src="/RTDAcademyWebsite/62fff78da6b59e2b1bcae319_Teacher headset.png"
              alt="Teacher Support"
              className="w-64 h-auto rounded-lg"
            />
            <div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Expert Teacher Support</h3>
              <p className="text-gray-600 mb-4">
                Our certified Alberta teachers are available through online chat and video conferencing,
                ensuring you never stay stuck on a topic for long.
              </p>
         
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// How Online Learning Works - Light Design
const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      title: "Interactive lessons",
      description: "Our program is designed from the ground up to optimize for distance learning students. That means you get effective instruction in a convenient, engaging and supportive environment.",
      icon: BookOpen
    },
    {
      number: "02",
      title: "Teacher live calls",
      description: "Access help around your schedule through online chat and video conferencing so you don't stay stuck on a topic for long.",
      icon: Users
    },
    {
      number: "03",
      title: "Write full credit exams",
      description: "RTD Math Academy students receive high school credits for the classes they take, and count towards their entrance into university.",
      icon: Award
    }
  ];

  return (
    <section id="learn-more" className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How online learning works
          </h2>
          <p className="text-xl text-gray-600">
            Three simple steps to academic success
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Connection arrows between cards on desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 left-full w-full -translate-y-1/2 z-0">
                  <div className="flex items-center justify-center">
                    <ArrowRight className="text-teal-300 h-8 w-8 animate-pulse-slow" />
                  </div>
                </div>
              )}

              {/* Card */}
              <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full">
                {/* Step number as large background element */}
                <div className="absolute top-0 right-0 text-[120px] font-bold text-gray-100 leading-none select-none">
                  {step.number}
                </div>

                {/* Card content */}
                <div className="relative p-8 z-10">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <step.icon className="text-white h-8 w-8" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Decorative bottom border */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-teal-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Alberta Education section */}
        <div className="text-center mt-20 pt-12 border-t border-gray-200">
          <div className="flex items-center justify-center gap-4">
            <img
              src="/RTDAcademyWebsite/6303d64d9628820f05340b8b_Alberta_Education_Logo.png"
              alt="Alberta Education"
              className="h-20"
            />
            <div className="text-left">
              <p className="text-gray-900 font-semibold text-lg">
                Alberta Education
              </p>
              <p className="text-gray-600">
                Fully accredited institution
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Comparison Section - Clean Table
const ComparisonSection = () => {
  const comparisons = [
    { feature: "Learn math", traditional: true, rtd: true, rtdNote: "...FASTER" },
    { feature: "Get credit for university", traditional: true, rtd: true },
    //{ feature: "Learn coding", traditional: false, rtd: true },
    { feature: "Take class when you want", traditional: false, rtd: true },
    { feature: "Write exams from home", traditional: false, rtd: true },
    { feature: "Get quick answers to questions", traditional: false, rtd: true },
    { feature: "Interactive online lessons", traditional: false, rtd: true },
    { feature: "Study in comfortable environment", traditional: false, rtd: true }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-teal-50/20 shadow-md relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Choose Online Learning?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Level up without the pressures of the classroom.
            Learn at your own pace in a comfortable environment.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="grid grid-cols-3 bg-gray-50">
              <div className="p-6 font-bold text-lg text-gray-700">Features</div>
              <div className="p-6 text-center font-bold text-lg text-gray-700">Traditional School</div>
              <div className="p-6 text-center font-bold text-lg text-teal-700 bg-teal-50">
                RTD Math Academy
              </div>
            </div>

            {comparisons.map((item, index) => (
              <div key={index} className="grid grid-cols-3 border-t border-gray-200">
                <div className="p-4 font-medium text-gray-700">{item.feature}</div>
                <div className="p-4 text-center">
                  {item.traditional ? (
                    <Check className="text-green-600 mx-auto" size={24} />
                  ) : (
                    <X className="text-gray-400 mx-auto" size={24} />
                  )}
                </div>
                <div className="p-4 text-center bg-teal-50/30">
                  <Check className="text-teal-700 mx-auto" size={24} />
                  {item.rtdNote && (
                    <span className="text-sm text-teal-700 font-semibold block mt-1">
                      {item.rtdNote}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <Button
            size="lg"
            onClick={() => window.open('https://yourway.rtdacademy.com/get-started', '_blank')}
            className="bg-teal-700 hover:bg-teal-800 text-white px-8 py-6 text-lg">
            Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

// Open Courses Section - New Feature Coming Soon
const OpenCoursesSection = () => {
  const handleExploreOpenCourses = () => {
    // Navigate to dedicated open courses page with mode=open query parameter
    window.location.href = '/open-courses?mode=open';
  };

  return (
    <section id="open-courses" className="py-20 bg-gradient-to-br from-white via-green-50/20 to-teal-50/30 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-green-200 to-teal-200 rounded-full blur-3xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-tr from-teal-200 to-cyan-200 rounded-full blur-3xl opacity-15 animate-pulse-slow animation-delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <Badge className="bg-gradient-to-r from-green-100 to-teal-100 text-green-800 px-4 py-1 mb-4">
            Coming Soon
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Introducing <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Open Courses</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Access our complete curriculum for free. Learn at your own pace, practice unlimited questions,
            and master the material without any cost.
          </p>
        </div>

        {/* Comparison Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {/* Open Courses Card */}
          <Card className="relative border-2 border-green-200 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-teal-400"></div>
            <CardHeader className="bg-gradient-to-br from-green-50 to-teal-50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl text-gray-900">Open Courses</CardTitle>
                <Badge className="bg-green-100 text-green-700">FREE</Badge>
              </div>
              <p className="text-gray-600 mt-2">Learn Without Limits</p>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Access all course content</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Watch all lesson videos</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Practice unlimited questions</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Learn at your own pace</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">No registration required</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500">No official credits</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500">No teacher support</span>
                </li>
              </ul>
              <Button
                onClick={handleExploreOpenCourses}
                className="w-full mt-6 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white"
              >
                Explore Open Courses <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Credit Courses Card */}
          <Card className="relative border-2 border-teal-200 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-500 to-cyan-500"></div>
            <CardHeader className="bg-gradient-to-br from-teal-50 to-cyan-50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl text-gray-900">Credit Courses</CardTitle>
                <Badge className="bg-teal-100 text-teal-700">DIPLOMA</Badge>
              </div>
              <p className="text-gray-600 mt-2">Earn Your Alberta High School Credits</p>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-semibold">Official Alberta credits</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-semibold">Certified teacher support</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">All course content</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Progress tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Official transcripts</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Diploma eligibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <InfoIcon className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Free for grant-funded Alberta students</span>
                </li>
              </ul>
              <Button
                onClick={() => window.open('https://yourway.rtdacademy.com/get-started', '_blank')}
                className="w-full mt-6 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
              >
                Enroll for Credits <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

// Helpful Tools Section
const HelpfulToolsSection = () => {
  const [linkCopied, setLinkCopied] = useState(false);

  const copyShareableLink = () => {
    const link = `${window.location.origin}${window.location.pathname}#helpful-tools`;
    navigator.clipboard.writeText(link).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  return (
    <section id="helpful-tools" className="py-20 bg-gradient-to-br from-teal-50/30 via-white to-blue-50/30 relative overflow-hidden">
      {/* Animated background element */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-gradient-to-br from-teal-200 to-blue-200 rounded-full blur-3xl opacity-15 animate-pulse-slow"></div>
        <div className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-gradient-to-br from-blue-200 to-teal-200 rounded-full blur-3xl opacity-15 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Helpful Tools & Resources
            </h2>
            <Button
              onClick={copyShareableLink}
              variant="outline"
              size="sm"
              className="border-teal-300 hover:bg-teal-50 text-teal-700"
            >
              {linkCopied ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Link className="w-4 h-4 mr-1" />
                </>
              )}
            </Button>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Quick access to tools that help you determine eligibility and find the right path for your education
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Student Type Guide Card */}
          <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-teal-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3">
              <Badge className="bg-teal-100 text-teal-700 border-teal-300">
                <Sparkles className="w-3 h-3 mr-1" />
                Interactive
              </Badge>
            </div>
            <CardHeader className="pb-4 pt-8">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <HelpCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Find Your Student Type</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Answer a few quick questions to determine your student category and understand your pricing options
              </p>
              <Button
                onClick={() => window.location.href = '/student-faq#student-type-guide'}
                className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white group"
              >
                Launch Student Type Guide
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* Age Calculator Card */}
          <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3">
              <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                <Calculator className="w-3 h-3 mr-1" />
                Calculator
              </Badge>
            </div>
            <CardHeader className="pb-4 pt-8">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Check School-Age Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Alberta Education defines school-aged students as those aged 6-19 as of September 1st.
              </p>

              <Accordion type="single" collapsible className="mb-4">
                <AccordionItem value="details" className="border-amber-200 bg-amber-50">
                  <AccordionTrigger className="px-3 py-2 hover:bg-amber-100/50 text-sm">
                    <span className="text-amber-700 font-semibold">Important Note</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="px-3 pb-2 text-sm text-amber-700">
                      Being school-aged does not automatically qualify you for free courses. You must be a grant-funded student type (Non-Primary, Home Education, or Summer School).
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="space-y-2">
                <Button
                  onClick={() => window.location.href = '/student-faq#age-calculator'}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white group"
                >
                  Open Age Calculator
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={() => window.location.href = '/student-faq#grantFunding'}
                  variant="outline"
                  className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 group"
                >
                  Learn About Grant Funding
                  <Info className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Card */}
          <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-purple-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3">
              <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                <BookOpen className="w-3 h-3 mr-1" />
                Resource
              </Badge>
            </div>
            <CardHeader className="pb-4 pt-8">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Browse All FAQs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Find detailed answers about enrollment, terms, requirements, and everything you need to know
              </p>
              <Button
                onClick={() => window.location.href = '/student-faq'}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white group"
              >
                View Complete FAQ
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* Prerequisite Flowchart Card */}
          <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-orange-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3">
              <Badge className="bg-orange-100 text-orange-700 border-orange-300">
                <GraduationCap className="w-3 h-3 mr-1" />
                Visual Guide
              </Badge>
            </div>
            <CardHeader className="pb-4 pt-8">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Course Prerequisites</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Interactive flowchart showing course prerequisites and pathways for Alberta high school courses
              </p>
              <Button
                onClick={() => window.location.href = '/prerequisite-flowchart'}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white group"
              >
                View Flowchart
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

// Experience Section - Adult and International Student Focus
const ExperienceSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-white via-purple-50/10 to-teal-50/20 shadow-lg relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-gradient-to-br from-purple-200 to-teal-200 rounded-full blur-3xl opacity-20 animate-pulse-slow"></div>
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Perfect for Your Life Journey
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Whether you're upgrading for career advancement or studying from abroad,
            we make earning your Alberta diploma achievable and affordable
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Adult Students Card */}
          <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-purple-200">
            <CardHeader className="bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-purple-600" />
                <CardTitle className="text-2xl text-gray-900">Adult Students</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Flexible scheduling that fits around work and family</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Start any time of year - no waiting for semesters</span>
                </li>
                <li className="flex items-start gap-2">
                  <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-semibold">No additional fees - transparent pricing</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Message your teacher anytime for support</span>
                </li>
              </ul>
              <Button
                onClick={() => window.location.href = 'https://yourway.rtdacademy.com/adult-students'}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                Adult Student Program <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* International Students Card */}
          <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-blue-200">
            <CardHeader className="bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="flex items-center gap-3">
                <Globe className="w-8 h-8 text-blue-600" />
                <CardTitle className="text-2xl text-gray-900">International Students</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Study from anywhere in the world</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Alberta diploma recognized globally</span>
                </li>
                <li className="flex items-start gap-2">
                  <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-semibold">Clear international pricing - no hidden fees</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">24/7 access across all time zones</span>
                </li>
              </ul>
              <Button
                onClick={() => window.location.href = 'https://yourway.rtdacademy.com/international-students'}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              >
                International Program <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

// Course mapping utility - maps COURSE_OPTIONS courses to courseData courses
const mapCourseToDetailedData = (courseName) => {
  // Create mapping between landing page course names and courseData IDs
  const courseMapping = {
    'Math 10C': 'math10c',
    'Math 10-3': 'math10-3',
    'Math 10-4': 'math10-4',
    'Math 15': 'math15',
    'Math 20-1': 'math20-1',
    'Math 20-2': 'math20-2',
    'Math 20-3': 'math20-3',
    'Math 20-4': 'math20-4',
    'Math 30-1': 'math30-1',
    'Math 30-2': 'math30-2',
    'Math 30-3': 'math30-3',
    'Math 31': 'math31',
    'Math 31 (Calculus)': 'math31', // Handle the full label from COURSE_OPTIONS
    'Physics 20': 'physics20',
    'Physics 30': 'physics30'
  };

  const courseId = courseMapping[courseName];
  return courseId ? getCourseById(courseId) : null;
};

// Course Details Modal Component
const CourseDetailsModal = ({ course, onClose }) => {
  if (!course) return null;

  // Get prerequisites and next courses
  const prerequisites = course.prerequisites ?
    course.prerequisites.map(id => getCourseById(id)).filter(Boolean) : [];
  const nextCourses = course.leadsTo ?
    course.leadsTo.map(id => getCourseById(id)).filter(Boolean) : [];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
      onClick={onClose}
    >
      <div
        className="bg-white shadow-2xl w-full md:w-[80%] h-full overflow-hidden animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{course.code}</h2>
            <p className="text-lg text-gray-600">{course.name}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span>{course.credits} credits</span>
              <span>Grade {course.grade}</span>
              {course.diplomaExam && (
                <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                  Diploma Exam Required
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none ml-4"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-120px)]">
          {/* Course Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Description</h3>
            <p className="text-gray-700">{course.description}</p>
            {course.detailedInfo?.importance && (
              <p className="text-gray-600 mt-2 italic">{course.detailedInfo.importance}</p>
            )}
          </div>

          {/* Prerequisites */}
          {prerequisites.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Prerequisites</h3>
              <div className="flex flex-wrap gap-2">
                {prerequisites.map(prereq => (
                  <span key={prereq.id} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                    {prereq.code}
                  </span>
                ))}
              </div>
              {course.recommendedGrade && (
                <p className="text-sm text-gray-600 mt-2">
                  Recommended: {course.recommendedGrade}% or higher in prerequisite courses
                </p>
              )}
            </div>
          )}

          {/* Skills Developed */}
          {course.detailedInfo?.skills && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills You'll Develop</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {course.detailedInfo.skills.map((skill, index) => (
                  <div key={index} className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Career Pathways */}
          {course.careerPathways && course.careerPathways.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Career Pathways</h3>
              <p className="text-gray-600 mb-3">This course opens doors to careers in:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {course.careerPathways.map((career, index) => (
                  <div key={index} className="bg-purple-50 text-purple-800 px-3 py-2 rounded-lg text-sm">
                    {career}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* University Programs */}
          {course.universityPrograms && course.universityPrograms.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">University Programs</h3>
              <p className="text-gray-600 mb-3">This course is typically required or recommended for:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {course.universityPrograms.map((program, index) => (
                  <div key={index} className="bg-blue-50 text-blue-800 px-3 py-2 rounded-lg text-sm">
                    {program}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Next Steps</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {nextCourses.length > 0 ? (
                <div>
                  <p className="text-gray-700 mb-2">After completing this course, you can take:</p>
                  <div className="flex flex-wrap gap-2">
                    {nextCourses.map(nextCourse => (
                      <span key={nextCourse.id} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        {nextCourse.code}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-700">
                  This is a final course in this pathway. You're ready for post-secondary studies or the workforce!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Courses Section - Professional Design
const CoursesSection = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Filter courses to only show main math and physics courses with availability
  const availableCourses = COURSE_OPTIONS
    .filter(course => {
      // Only show Math and Science courses (excluding Options courses)
      if (course.courseType !== 'Math' && course.courseType !== 'Science') return false;
      // Check if course has availability property and it's true (default to true if not specified)
      return course.available !== false;
    })
    .map(course => ({
      name: course.label,
      value: course.value,
      level: `Grade ${course.grade}`,
      credits: course.credits,
      color: course.color,
      icon: course.icon,
      description: getDescription(course.value)
    }))
    .sort((a, b) => {
      // Sort by grade first, then by course name
      const gradeA = parseInt(a.level.replace('Grade ', ''));
      const gradeB = parseInt(b.level.replace('Grade ', ''));
      if (gradeA !== gradeB) return gradeA - gradeB;
      return a.name.localeCompare(b.name);
    });

  function getDescription(courseValue) {
    const descriptions = {
      "Math 10-4": "Essential mathematics skills",
      "Math 10-3": "Applied mathematics foundations",
      "Math 10C": "Foundation mathematics",
      "Math 15": "Mathematics literacy",
      "Math 20-4": "Mathematics in trades",
      "Math 20-3": "Applied mathematics",
      "Math 20-2": "Problem-solving mathematics",
      "Math 20-1": "Pre-calculus path",
      "Math 30-3": "Applied mathematics",
      "Math 30-2": "Mathematics for post-secondary",
      "Math 30-1": "Advanced mathematics",
      "Math 31": "Calculus",
      "Physics 20": "Introduction to physics",
      "Physics 30": "Advanced physics"
    };
    return descriptions[courseValue] || "Core curriculum";
  }

  return (
    <section id="courses" className="py-20 bg-gradient-to-b from-gray-50 to-white shadow-md relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {websiteConfig.dates.currentSchoolYear} Course Offerings
          </h2>
          <p className="text-xl text-gray-600">
            Alberta-approved high school mathematics and physics courses
          </p>
        </div>

        {/* Prerequisite Flow Chart Call-Out */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 border-2 border-teal-200 shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-full flex items-center justify-center shadow-lg">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Confused About Prerequisites?
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Explore our interactive course pathway tool to see how courses connect, understand prerequisites,
                    and plan your academic journey from Grade 10 through graduation.
                  </p>
                  <Button
                    onClick={() => window.location.href = '/prerequisite-flowchart'}
                    className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-md"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    View Interactive Course Flowchart
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Group courses by grade level */}
        {[10, 11, 12].map(gradeLevel => {
          const coursesForGrade = availableCourses.filter(course => {
            const grade = parseInt(course.level.replace('Grade ', ''));
            return grade === gradeLevel;
          });

          if (coursesForGrade.length === 0) return null;

          return (
            <div key={gradeLevel} className="mb-12">
              {/* Grade Header */}
              <div className="flex items-center mb-6">
                <div className="flex-grow border-t-2 border-gray-300"></div>
                <div className="px-6">
                  <h3 className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    Grade {gradeLevel} Courses
                  </h3>
                </div>
                <div className="flex-grow border-t-2 border-gray-300"></div>
              </div>

              {/* Course Cards Grid */}
              <div className="grid md:grid-cols-3 gap-6">
                {coursesForGrade.map((course, index) => {
                  const IconComponent = course.icon;
                  const detailedCourse = mapCourseToDetailedData(course.name);

                  return (
                    <Card key={index} className="shadow-lg hover:shadow-xl transition-all duration-300 bg-white border-gray-200 relative">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            {IconComponent && <IconComponent className="w-5 h-5" style={{ color: course.color }} />}
                            <CardTitle className="text-xl text-gray-900">{course.name}</CardTitle>
                          </div>
                          <Badge className="bg-teal-100 text-teal-700">{course.credits} Credits</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4">{course.description}</p>
                        {detailedCourse && (
                          <div className="space-y-2">
                            <Button
                              onClick={() => setSelectedCourse(detailedCourse)}
                              variant="outline"
                              size="sm"
                              className="w-full border-teal-600 text-teal-700 hover:bg-teal-50"
                            >
                              <Info className="w-4 h-4 mr-2" />
                              More Info & Career Paths
                            </Button>
                            <Button
                              onClick={() => window.location.href = `/prerequisites?course=${detailedCourse.id}`}
                              variant="outline"
                              size="sm"
                              className="w-full border-blue-600 text-blue-700 hover:bg-blue-50"
                            >
                              <BookOpen className="w-4 h-4 mr-2" />
                              View Prerequisites
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="text-center">
          <Button
            size="lg"
            onClick={() => window.open('https://yourway.rtdacademy.com/get-started', '_blank')}
            className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-6 text-lg">
            Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Course Details Modal */}
      {selectedCourse && (
        <CourseDetailsModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </section>
  );
};

// Final CTA Section - Professional
const FinalCTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-teal-700 to-teal-800 shadow-2xl relative z-10">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src="/RTDAcademyWebsite/63a366356ccbdb9bdd3a747f_Happy Teen.png"
              alt="Successful Student"
              className="w-full max-w-md mx-auto rounded-lg shadow-2xl"
            />
          </div>

          <div className="text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Get a head start on life success.
            </h2>
            <p className="text-xl mb-8 text-teal-100">
              Join thousands of successful students who have transformed their futures with RTD Math Academy.
            </p>

            <div className="bg-white/10 backdrop-blur rounded-lg p-6 mb-8 border border-white/20">
              <h3 className="font-bold text-lg mb-3">Quick Facts:</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="text-white" size={20} />
                  <span>Start any time of year</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-white" size={20} />
                  <span>Self-paced learning</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-white" size={20} />
                  <span>Full Alberta credits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-white" size={20} />
                  <span>Expert teacher support</span>
                </li>
              </ul>
            </div>

            <Button
              size="lg"
              onClick={() => window.open('https://yourway.rtdacademy.com/get-started', '_blank')}
              className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-6 text-lg shadow-lg">
              Apply Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

// Footer Component - Light and Professional
const Footer = () => {
  return (
    <footer id="footer" className="bg-gradient-to-b from-gray-100 to-gray-200 text-gray-700 py-16 border-t border-gray-300 shadow-inner">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <RTDLogo className="w-10 h-10" />
              <span className="font-bold text-lg text-gray-900">RTD Math Academy</span>
            </div>
        
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Alberta School Code:</strong> 2444</p>
              <p><strong>Authority Code:</strong> 0402</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4 text-gray-900">Quick Links</h3>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#courses" className="hover:text-teal-700 transition-colors">Courses</a></li>
              <li><a href="/about" className="hover:text-teal-700 transition-colors">About Us</a></li>
              <li><a href="/contact" className="hover:text-teal-700 transition-colors">Contact</a></li>
              <li><a href="/student-faq" className="hover:text-teal-700 transition-colors">Student FAQ</a></li>
              <li><a href="/policies-reports" className="hover:text-teal-700 transition-colors">Policies & Reports</a></li>
              <li><a href="https://yourway.rtdacademy.com/login" className="hover:text-teal-700 transition-colors">Student Login</a></li>
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h3 className="font-bold mb-4 text-gray-900">Programs</h3>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#courses" className="hover:text-teal-700 transition-colors">Mathematics</a></li>
              <li><a href="#courses" className="hover:text-teal-700 transition-colors">Physics</a></li>
              <li><a href="https://yourway.rtdacademy.com/adult-students" className="hover:text-teal-700 transition-colors">Adult Upgrading</a></li>
              <li><a href="https://yourway.rtdacademy.com/international-students" className="hover:text-teal-700 transition-colors">International Students</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold mb-4 text-gray-900">Contact Information</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-teal-700" />
                <span>403-351-0896 ext 2</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-teal-700" />
                <span>info@rtdacademy.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Users size={16} className="text-teal-700" />
                <span>Charlie Hiles: Principal</span>
              </li>
              <li className="flex items-center gap-2">
                <Users size={16} className="text-teal-700" />
                <span>Stan Scott: Registrar</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Accreditation Logos */}
        <div className="border-t border-gray-300 pt-8 pb-4">
          <div className="flex flex-wrap items-center justify-center gap-8 mb-6">
            <div className="flex items-center gap-3">
              <img
                src="/RTDAcademyWebsite/6303d64d9628820f05340b8b_Alberta_Education_Logo.png"
                alt="Alberta Education"
                className="h-12"
              />
              <div className="border-l-2 border-gray-300 pl-3">
                <p className="text-xs font-semibold text-gray-900">Alberta Education</p>
                <p className="text-xs text-gray-600">Fully Accredited</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <img
                src="/RTDAcademyWebsite/AISCA-Logo-LG.png"
                alt="AISCA"
                className="h-12"
              />
              <div className="border-l-2 border-gray-300 pl-3">
                <p className="text-xs font-semibold text-gray-900">AISCA Member</p>
                <p className="text-xs text-gray-600">Independent Schools</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-300 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm mb-4 md:mb-0">
              © 2025 RTD Math Academy. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-600">
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-teal-700 transition-colors">Privacy Policy</a>
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="hover:text-teal-700 transition-colors">Terms of Service</a>
              <a href="/policies-reports" className="hover:text-teal-700 transition-colors">Policies & Reports</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main Landing Page Component
const RTDLandingPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle hash scrolling on page load and hash changes
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash;
      if (!hash) return;

      // Remove the # from the hash
      const elementId = hash.substring(1);

      // Try to scroll with retry mechanism
      const attemptScroll = (attempts = 0) => {
        const element = document.getElementById(elementId);

        if (element) {
          // Calculate offset for fixed header (adjust as needed)
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        } else if (attempts < 3) {
          // Retry after delay (element might not be rendered yet)
          const delays = [100, 500, 1000];
          setTimeout(() => attemptScroll(attempts + 1), delays[attempts]);
        }
      };

      // Start scrolling attempt
      attemptScroll();
    };

    // Scroll on initial load
    scrollToHash();

    // Handle hash changes while on the page
    window.addEventListener('hashchange', scrollToHash);

    return () => window.removeEventListener('hashchange', scrollToHash);
  }, []);

  return (
    <div className="min-h-screen relative">
      {/* Animated triangles background layer */}
      <div className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none z-0">
        <svg width="100%" height="100%" className="absolute top-0 left-0">
          <MovingTriangle
            color="#0d8081"
            initialX={-100}
            initialY={-100}
            initialAngle={Math.random() * Math.PI * 2}
          />
          <MovingTriangle
            color="#20B2AA"
            initialX={typeof window !== 'undefined' ? window.innerWidth / 2 : 0}
            initialY={-150}
            initialAngle={Math.random() * Math.PI * 2}
          />
          <MovingTriangle
            color="#14B8A6"
            initialX={typeof window !== 'undefined' ? window.innerWidth - 200 : 0}
            initialY={-50}
            initialAngle={Math.random() * Math.PI * 2}
          />
        </svg>
      </div>

      {/* Main content layer */}
      <div className="relative z-10">
        <Header scrolled={scrolled} />
        <HeroSection />
        <AccreditationBanner />
        <OpenCoursesSection />
        <HelpfulToolsSection />
        <LifeAdvantageSection />
        <HowItWorksSection />
        <ComparisonSection />
        <ExperienceSection />
        <CoursesSection />
        <FinalCTASection />
        <Footer />
      </div>
    </div>
  );
};

export default RTDLandingPage;