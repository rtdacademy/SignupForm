import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Check, ChevronDown, Menu, X, BookOpen, Users, Award, Clock, GraduationCap, Calendar, Phone, Mail, MapPin, Star, Info } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
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
          <div className="hidden md:flex items-center gap-8">
            <a href="#courses" className={`font-medium transition-colors ${
              scrolled ? 'text-gray-700 hover:text-teal-700' : 'text-white/90 hover:text-white'
            }`}>
              Courses
            </a>
            <a href="#why-rtd" className={`font-medium transition-colors ${
              scrolled ? 'text-gray-700 hover:text-teal-700' : 'text-white/90 hover:text-white'
            }`}>
              Why RTD?
            </a>
            <a href="#adult-students" className={`font-medium transition-colors ${
              scrolled ? 'text-gray-700 hover:text-teal-700' : 'text-white/90 hover:text-white'
            }`}>
              Adult Students
            </a>
            <a href="#contact" className={`font-medium transition-colors ${
              scrolled ? 'text-gray-700 hover:text-teal-700' : 'text-white/90 hover:text-white'
            }`}>
              Contact
            </a>
            <a href="#policies" className={`font-medium transition-colors ${
              scrolled ? 'text-gray-700 hover:text-teal-700' : 'text-white/90 hover:text-white'
            }`}>
              Policies
            </a>
            <a href="/login" className={`font-medium transition-colors ${
              scrolled ? 'text-gray-700 hover:text-teal-700' : 'text-white/90 hover:text-white'
            }`}>
              Login
            </a>
            <Button className={`${
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
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg p-6 space-y-4">
            <a href="#courses" className="block py-2 text-gray-700 hover:text-teal-700 font-medium">Courses</a>
            <a href="#why-rtd" className="block py-2 text-gray-700 hover:text-teal-700 font-medium">Why RTD?</a>
            <a href="#adult-students" className="block py-2 text-gray-700 hover:text-teal-700 font-medium">Adult Students</a>
            <a href="#contact" className="block py-2 text-gray-700 hover:text-teal-700 font-medium">Contact</a>
            <a href="#policies" className="block py-2 text-gray-700 hover:text-teal-700 font-medium">Policies</a>
            <a href="/login" className="block py-2 text-gray-700 hover:text-teal-700 font-medium">Login</a>
            <Button className="w-full bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 hover:from-teal-700 hover:via-cyan-700 hover:to-teal-800 text-white shadow-md hover:shadow-lg transition-all">
              Get started <ArrowRight className="ml-2 h-4 w-4" />
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
                <Info className="w-5 h-5 text-teal-700 mt-0.5" />
                <div>
                  <p className="font-semibold text-teal-900">Free for Alberta Students</p>
                  <p className="text-sm text-teal-800 mt-1">
                    If you're currently attending an Alberta High School and under 20 years old, courses are completely free.
                  </p>
                </div>
              </div>
              </div>
            </div>

            {/* Registration Deadline Card with gradient accent */}
            <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 space-y-4 border border-gray-200 shadow-lg hover:shadow-xl transition-all group overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-lg text-gray-900">2025/26 Registration Open</h3>
              </div>
              <div className="space-y-2 pl-7">
                <p className="text-gray-700">
                  <span className="font-semibold">Term 1 Deadline:</span> September 26, 2025
                </p>
                <p className="text-sm text-gray-600 italic">
                  Adult students can register anytime throughout the year
                </p>
              </div>
            </div>

            {/* Links Section */}
            <div className="flex flex-wrap gap-6 text-sm">
              <a href="#adult-students" className="flex items-center gap-2 text-teal-700 font-semibold hover:text-teal-800 transition-colors">
                <GraduationCap className="w-4 h-4" />
                Adult Upgrading Program
              </a>
              <a href="#learn-more" className="flex items-center gap-2 text-teal-700 font-semibold hover:text-teal-800 transition-colors">
                <Info className="w-4 h-4" />
                How It Works
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 hover:from-teal-700 hover:via-cyan-700 hover:to-teal-800 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="relative border-2 border-teal-600 text-teal-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 px-8 py-6 text-lg transition-all duration-300 overflow-hidden group">
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
                  <p className="text-xs text-gray-600">Years Experience</p>
                </div>
                <div className="border-l border-gray-200"></div>
                <div>
                  <p className="text-2xl font-bold text-teal-700">1000s</p>
                  <p className="text-xs text-gray-600">Students Graduated</p>
                </div>
                <div className="border-l border-gray-200"></div>
                <div>
                  <p className="text-2xl font-bold text-teal-700">100%</p>
                  <p className="text-xs text-gray-600">Online Delivery</p>
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
            Alberta's leading, fully accredited diploma prep academy
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
      description: "Access Alberta's best online math and physics instruction anytime, anywhere on any device."
    },
    {
      icon: BookOpen,
      title: "Learn quickly",
      description: "Master math and coding with expert video courses, practice tests and personalized advice."
    },
    {
      icon: Award,
      title: "Gain big confidence",
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
            Learn life-changing, future money-making skills at home, for free.
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
              <div className="flex items-center gap-2">
                <Star className="text-yellow-500 fill-current" size={20} />
                <Star className="text-yellow-500 fill-current" size={20} />
                <Star className="text-yellow-500 fill-current" size={20} />
                <Star className="text-yellow-500 fill-current" size={20} />
                <Star className="text-yellow-500 fill-current" size={20} />
                <span className="text-gray-600 ml-2">5.0 Student Rating</span>
              </div>
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
      description: "Help is always available through online chat and video conferencing so you don't stay stuck on a topic for long.",
      icon: Users
    },
    {
      number: "03",
      title: "Write full credit exams",
      description: "RTD Math Academy graduates receive full accreditation for the classes they take, and count towards their entrance into university.",
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
    { feature: "Learn coding", traditional: false, rtd: true },
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
          <Button size="lg" className="bg-teal-700 hover:bg-teal-800 text-white px-8 py-6 text-lg">
            Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

// Experience Section - Light and Professional
const ExperienceSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-white via-purple-50/10 to-teal-50/20 shadow-lg relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-gradient-to-br from-purple-200 to-teal-200 rounded-full blur-3xl opacity-20 animate-pulse-slow"></div>
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              15 years of excellence in online education
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              It all started with Alberta teachers who knew that there was a better way
              to prepare high school students for incredible lives. Since 2008, we've been
              helping students achieve their academic goals with innovative online learning.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-3xl font-bold text-teal-700 mb-2">10,000+</p>
                <p className="text-gray-600">Students Graduated</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-3xl font-bold text-teal-700 mb-2">98%</p>
                <p className="text-gray-600">Success Rate</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-3xl font-bold text-teal-700 mb-2">15+</p>
                <p className="text-gray-600">Years Experience</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-3xl font-bold text-teal-700 mb-2">24/7</p>
                <p className="text-gray-600">Online Support</p>
              </div>
            </div>

            <Button size="lg" variant="outline" className="border-2 border-teal-700 text-teal-700 hover:bg-teal-50">
              Learn More About RTD
            </Button>
          </div>

          <div className="relative">
            <img
              src="/RTDAcademyWebsite/63a365b88e02fd152f13519c_Teenager.png"
              alt="Student Learning"
              className="w-full h-auto rounded-lg shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

// Courses Section - Professional Design
const CoursesSection = () => {
  const courses = [
    { name: "Math 10C", level: "Grade 10", credits: 5, description: "Foundation mathematics" },
    { name: "Math 20-1", level: "Grade 11", credits: 5, description: "Pre-calculus path" },
    { name: "Math 30-1", level: "Grade 12", credits: 5, description: "Advanced mathematics" },
    { name: "Math 31", level: "Grade 12", credits: 5, description: "Calculus" },
    { name: "Physics 20", level: "Grade 11", credits: 5, description: "Introduction to physics" },
    { name: "Physics 30", level: "Grade 12", credits: 5, description: "Advanced physics" }
  ];

  return (
    <section id="courses" className="py-20 bg-gradient-to-b from-gray-50 to-white shadow-md relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            2025 Course Offerings
          </h2>
          <p className="text-xl text-gray-600">
            Alberta-approved high school mathematics and physics courses
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {courses.map((course, index) => (
            <Card key={index} className="shadow-lg hover:shadow-xl transition-all duration-300 bg-white border-gray-200">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-2xl text-gray-900">{course.name}</CardTitle>
                  <Badge className="bg-teal-100 text-teal-700">{course.credits} Credits</Badge>
                </div>
                <p className="text-gray-600">{course.level}</p>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{course.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-6">
            Send an application and schedule your free intro call to ask us directly.
          </p>
          <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-6 text-lg">
            Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
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
              2025 applications are now being accepted. Limited spaces remain.
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

            <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-6 text-lg shadow-lg">
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
    <footer className="bg-gradient-to-b from-gray-100 to-gray-200 text-gray-700 py-16 border-t border-gray-300 shadow-inner">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <RTDLogo className="w-10 h-10" />
              <span className="font-bold text-lg text-gray-900">RTD Math Academy</span>
            </div>
            <p className="text-gray-600">
              Alberta's leading online high school since 2008.
              Fully accredited diploma prep academy.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4 text-gray-900">Quick Links</h3>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#courses" className="hover:text-teal-700 transition-colors">Courses</a></li>
              <li><a href="#about" className="hover:text-teal-700 transition-colors">About Us</a></li>
              <li><a href="#contact" className="hover:text-teal-700 transition-colors">Contact</a></li>
              <li><a href="/login" className="hover:text-teal-700 transition-colors">Student Login</a></li>
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h3 className="font-bold mb-4 text-gray-900">Programs</h3>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#math" className="hover:text-teal-700 transition-colors">Mathematics</a></li>
              <li><a href="#physics" className="hover:text-teal-700 transition-colors">Physics</a></li>
              <li><a href="#adult" className="hover:text-teal-700 transition-colors">Adult Upgrading</a></li>
              <li><a href="#summer" className="hover:text-teal-700 transition-colors">Summer School</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold mb-4 text-gray-900">Contact Us</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-teal-700" />
                <span>1-800-RTD-MATH</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-teal-700" />
                <span>info@rtdacademy.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-teal-700" />
                <span>Edmonton, Alberta, Canada</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-300 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm mb-4 md:mb-0">
              © 2025 RTD Math Academy. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-600">
              <a href="/privacy" className="hover:text-teal-700 transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-teal-700 transition-colors">Terms of Service</a>
              <a href="/policies" className="hover:text-teal-700 transition-colors">Policies</a>
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