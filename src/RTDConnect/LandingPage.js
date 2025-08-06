import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Heart, 
  Shield, 
  Users, 
  Calendar, 
  FileText, 
  DollarSign, 
  ArrowRight, 
  CheckCircle2, 
  BookOpen, 
  Home as HomeIcon, 
  Star,
  Phone,
  Mail,
  MapPin,
  Clock,
  Menu
} from 'lucide-react';

// Import configuration
import { 
  FUNDING_RATES, 
  ACADEMIC_STATS, 
  CONTACT_INFO,
  PORTAL_STATS
} from '../config/HomeEducation';
import { getAllFacilitators } from '../config/facilitators';
import { 
  getCurrentSchoolYear,
  getOpenRegistrationSchoolYear,
  getSeptemberCountForYear,
  getRegistrationOpenDateForYear,
  formatImportantDate
} from '../config/importantDates';

// RTD Connect Logo with gradient colors
const RTDConnectLogo = () => (
  <div className="flex items-center space-x-3">
    <img 
      src="/connectImages/Connect.png" 
      alt="RTD Connect Logo"
      className="h-10 w-auto sm:h-12"
    />
    <div>
      <h1 className="text-xl font-bold sm:text-2xl bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
        RTD Connect
      </h1>
      <p className="text-xs text-gray-600 sm:text-sm">Home Education</p>
    </div>
  </div>
);

const FeatureCard = ({ icon: Icon, title, description, gradient = "from-gray-400 to-gray-500" }) => (
  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${gradient} flex items-center justify-center mb-4`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

const StepCard = ({ number, title, description, icon: Icon }) => (
  <div className="text-center">
    <div className="relative mb-4">
      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
        {number}
      </div>
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const StatCard = ({ value, label, icon: Icon }) => (
  <div className="text-center">
    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);

const RTDConnectLandingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Get current registration information
  const currentSchoolYear = getCurrentSchoolYear();
  const openRegistrationYear = getOpenRegistrationSchoolYear();
  const registrationOpenDate = openRegistrationYear ? getRegistrationOpenDateForYear(openRegistrationYear) : null;
  const septemberCountDate = openRegistrationYear ? getSeptemberCountForYear(openRegistrationYear) : null;

  const handleGetStarted = () => {
    navigate('/login');
  };

  const handleLearnMore = () => {
    document.getElementById('what-is-home-education')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  const handleHomeClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const handleFacilitatorsClick = () => {
    navigate('/bio');
    setIsMenuOpen(false);
  };

  const handleEducationClick = () => {
    handleLearnMore();
    setIsMenuOpen(false);
  };

  const handleContactClick = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const handleGetStartedClick = () => {
    handleGetStarted();
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <RTDConnectLogo />
            
            {/* Desktop Menu */}
            <div className="hidden sm:flex items-center space-x-4">
              <button
                onClick={handleHomeClick}
                className="text-purple-600 font-medium"
              >
                Home
              </button>
              <button
                onClick={() => navigate('/about')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                About
              </button>
              <button
                onClick={() => navigate('/bio')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Facilitators
              </button>
              <button
                onClick={() => navigate('/faq')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                FAQ
              </button>
              <button
                onClick={() => navigate('/funding')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Funding
              </button>
              <button
                onClick={handleContactClick}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Contact
              </button>
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 transition-colors"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="sm:hidden text-gray-600 hover:text-gray-900"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="sm:hidden pb-3">
              <div className="flex flex-col space-y-2 px-2">
                <button
                  onClick={handleHomeClick}
                  className="text-purple-600 font-medium py-2 text-left"
                >
                  Home
                </button>
                <button
                  onClick={() => navigate('/about')}
                  className="text-gray-600 hover:text-gray-900 py-2 transition-colors text-left"
                >
                  About
                </button>
                <button
                  onClick={() => navigate('/bio')}
                  className="text-gray-600 hover:text-gray-900 py-2 transition-colors text-left"
                >
                  Facilitators
                </button>
                <button
                  onClick={() => navigate('/faq')}
                  className="text-gray-600 hover:text-gray-900 py-2 transition-colors text-left"
                >
                  FAQ
                </button>
                <button
                  onClick={() => navigate('/funding')}
                  className="text-gray-600 hover:text-gray-900 py-2 transition-colors text-left"
                >
                  Funding
                </button>
                <button
                  onClick={handleContactClick}
                  className="text-gray-600 hover:text-gray-900 py-2 transition-colors text-left"
                >
                  Contact
                </button>
                <button
                  onClick={handleGetStartedClick}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 transition-colors"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
        {/* Decorative background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-blue-200 rounded-full opacity-30 animate-pulse delay-75"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-cyan-200 rounded-full opacity-20 animate-pulse delay-150"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          {/* Hero Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
            {/* Left Column - Text Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/70 backdrop-blur-sm border border-purple-200 mb-8">
                <Heart className="w-5 h-5 text-purple-500 mr-2" />
                <span className="text-purple-700 font-semibold text-sm sm:text-base">
                  Rooted in Relationship • Thriving in Freedom • Dynamic by Design
                </span>
              </div>
              
              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
                Welcome to
                <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent block mt-2">
                  RTD-Connect
                </span>
                <span className="block text-2xl sm:text-3xl lg:text-4xl mt-4 text-gray-700">
                  Home Education, Reimagined
                </span>
              </h1>
              
              {/* Subheading with better spacing */}
              <div className="mb-12">
                <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed mb-6">
                  Learning should be as <span className="text-purple-600 font-semibold">unique as the child</span>
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  As part of RTD Academy, we offer Alberta families the support, flexibility, and freedom to follow their own path. 
                  Our experienced facilitators—both certified teachers and homeschool parents—partner with you to create 
                  personalized learning journeys rooted in curiosity, creativity, and connection.
                </p>
              </div>
              
              {/* Call to Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start">
                <button
                  onClick={handleGetStarted}
                  className="group inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button
                  onClick={handleFacilitatorsClick}
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-purple-300 text-lg font-semibold rounded-xl text-purple-700 bg-white/80 backdrop-blur-sm hover:bg-white hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Meet Our Facilitators
                </button>
              </div>
            </div>

            {/* Right Column - Hero Image */}
            <div className="relative lg:order-last">
              <div className="relative">
                {/* Decorative elements around image */}
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-r from-purple-400 to-blue-400 rounded-2xl opacity-20 rotate-12"></div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-15"></div>
                
                {/* Main image container */}
                <div className="relative bg-white/60 backdrop-blur-sm rounded-3xl p-4 border border-white/50 shadow-2xl">
                  <img 
                    src="/connectImages/ChildComputer.png" 
                    alt="Child learning with computer - personalized home education"
                    className="w-full h-auto rounded-2xl shadow-lg"
                  />
                  
                  {/* Floating stats badge */}
                  <div className="absolute -bottom-4 -left-4 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">100%</div>
                        <div className="text-sm text-gray-600">Success Rate</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating facilitator badge */}
                  <div className="absolute -top-4 -right-4 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">Expert</div>
                        <div className="text-sm text-gray-600">Facilitators</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Feature 1 */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-purple-100 hover:bg-white/80 transition-all duration-300 hover:shadow-lg group">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Personalized Learning</h3>
              <p className="text-gray-600 leading-relaxed">
                Tailored education paths that adapt to your child's unique learning style, interests, and pace.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-blue-100 hover:bg-white/80 transition-all duration-300 hover:shadow-lg group">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Expert Support</h3>
              <p className="text-gray-600 leading-relaxed">
                Certified teachers who are also homeschool parents, providing both professional and personal guidance.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-cyan-100 hover:bg-white/80 transition-all duration-300 hover:shadow-lg group">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-green-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Alberta Approved</h3>
              <p className="text-gray-600 leading-relaxed">
                Fully compliant with Alberta's education requirements while maintaining the flexibility you need.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-8 border border-white/50">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Trusted by Alberta Families</h3>
              <p className="text-gray-600">Real results from our home education community</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{FUNDING_RATES.GRADES_1_TO_12.formatted}</div>
                <div className="text-sm text-gray-600 font-medium">Per Student Funding</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{ACADEMIC_STATS.HOME_EDUCATION_DIPLOMA_AVERAGE.percentage}%</div>
                <div className="text-sm text-gray-600 font-medium">Diploma Exam Average</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{PORTAL_STATS.COMMUNITY_PARTNERS.count}</div>
                <div className="text-sm text-gray-600 font-medium">Community Partners</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is Home Education Section */}
      <section id="what-is-home-education" className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Is Home Education in Alberta?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Home education empowers parents to direct their child's learning in Grades K-12, choosing curricula and methods that suit their family's lifestyle while meeting Alberta's Schedule of Learning Outcomes (SOLO).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16">
            <FeatureCard 
              icon={Heart}
              title="Tailored Learning Paths"
              description="Customize education to your child's strengths, interests, and pace for better engagement and outcomes"
              gradient="from-purple-500 to-blue-500"
            />
            <FeatureCard 
              icon={Clock}
              title="Flexible Family Scheduling"
              description="Integrate learning into your daily life without rigid timetables or school calendars"
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureCard 
              icon={Shield}
              title="Supportive Home Setting"
              description="Provide a positive, bully-free environment that builds confidence and values"
              gradient="from-cyan-500 to-blue-500"
            />
            <FeatureCard 
              icon={Users}
              title="Stronger Community Bonds"
              description="More time for family, faith, and local activities that enrich your child's world"
              gradient="from-green-500 to-cyan-500"
            />
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 sm:p-8 text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Proven Results for Alberta
            </h3>
            <p className="text-base sm:text-lg text-gray-700 mb-6">
              Home educated students frequently surpass provincial averages, scoring {ACADEMIC_STATS.HOME_EDUCATION_DIPLOMA_AVERAGE.percentage}% on diploma exams compared to {ACADEMIC_STATS.PROVINCIAL_DIPLOMA_AVERAGE.percentage}% province-wide, with flexible learning.
            </p>
            <div className="inline-flex items-center text-purple-600 font-semibold">
              <Star className="w-5 h-5 mr-2" />
              Academic success through personalization
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose RTD Connect Section */}
      <section className="py-12 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why RTD Connect Stands Out for Parents
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Backed by RTD Academy's educational excellence, we make home schooling in Alberta effortless with our intuitive portal, rapid funding access, and dedicated support.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard 
              icon={GraduationCap}
              title="Expert Educational Backing"
              description="Leverage RTD Academy's established expertise in Alberta's learning standards"
              gradient="from-purple-500 to-blue-500"
            />
            <FeatureCard 
              icon={FileText}
              title="Effortless Registration"
              description="Complete everything online—no downloads or complex paperwork required"
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureCard 
              icon={DollarSign}
              title="Quick Funding Payouts"
              description="Avoid delays with our streamlined reimbursement process for educational resources"
              gradient="from-cyan-500 to-blue-500"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Simple Steps to Begin
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Starting home education with RTD Connect is straightforward. Our portal guides you through registration, planning, and ongoing management in just a few clicks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            <StepCard 
              number="1"
              title="Register in Minutes"
              description="Sign up online and set up your family profile through our easy portal—no forms to print or mail"
              icon={Users}
            />
            <StepCard 
              number="2"
              title="Plan Your Program"
              description="Customize your home education plan with SOLO guidance and resource recommendations"
              icon={HomeIcon}
            />
            <StepCard 
              number="3"
              title="Access Funding & Resources"
              description="Submit receipts digitally for fast reimbursements and start learning with full support"
              icon={BookOpen}
            />
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center px-8 py-4 border border-transparent text-base sm:text-lg font-medium rounded-lg text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              Begin Registration
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Features & Services Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Full Suite of Tools for Success
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Our all-in-one platform delivers the support Alberta parents need to thrive in home education, from planning to payouts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard 
              icon={Users}
              title="Family & Student Profiles"
              description="Easily manage multiple children with personalized tracking and plans"
              gradient="from-purple-500 to-blue-500"
            />
            <FeatureCard 
              icon={FileText}
              title="Annual Registration Simplified"
              description="Renew effortlessly with automated reminders and one-click submission"
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureCard 
              icon={DollarSign}
              title="Hassle-Free Reimbursements"
              description="Upload receipts in the portal for quick approvals and payouts—no waiting or complex rules"
              gradient="from-cyan-500 to-blue-500"
            />
            <FeatureCard 
              icon={Calendar}
              title="Progress & Compliance Tracking"
              description="Monitor learning outcomes and maintain records seamlessly"
              gradient="from-green-500 to-cyan-500"
            />
            <FeatureCard 
              icon={BookOpen}
              title="Curated Resource Hub"
              description="Discover approved curricula, tools, and activities for SOLO alignment"
              gradient="from-indigo-500 to-purple-500"
            />
            <FeatureCard 
              icon={Shield}
              title="Secure Family Portal"
              description="Keep your data safe while accessing all features in one place"
              gradient="from-blue-500 to-cyan-500"
            />
          </div>
        </div>
      </section>

      {/* Meet Our Facilitators Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Expert Facilitators
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Our dedicated team of education specialists is here to guide and support your family throughout your home education journey. Get to know our facilitators and find the perfect match for your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            {/* Facilitator Cards */}
            {getAllFacilitators().slice(0, 2).map((facilitator) => (
              <div key={facilitator.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6 sm:p-8">
                  <div className="flex items-center space-x-4 sm:space-x-6 mb-6">
                    <img 
                      src={facilitator.image} 
                      alt={facilitator.name}
                      className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 ${facilitator.gradients.border}`}
                    />
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{facilitator.name}</h3>
                      <p className="text-base sm:text-lg text-purple-600 font-semibold">{facilitator.title}</p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">{facilitator.experience}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-6">
                    {facilitator.description}
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    {facilitator.specializations.slice(0, 3).map((spec, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{spec}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => navigate(`/facilitator/${facilitator.id}`)}
                    className={`w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r ${facilitator.gradients.card} hover:from-purple-600 hover:to-blue-600 transition-colors`}
                  >
                    Learn More About {facilitator.name.split(' ')[0]}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <p className="text-base sm:text-lg text-gray-600 mb-6">
              Ready to connect with one of our facilitators? They're here to help you succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/bio')}
                className="inline-flex items-center px-8 py-4 border border-transparent text-base sm:text-lg font-medium rounded-lg text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                View All Facilitators
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <button
                onClick={handleContactClick}
                className="inline-flex items-center px-8 py-4 border border-gray-300 text-base sm:text-lg font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                Contact Our Team
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements & Funding Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Alberta Home Education Essentials & Funding
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Registration Timeline</h3>
                    <p className="text-gray-600">
                      {openRegistrationYear ? (
                        <>Registration open for {openRegistrationYear} school year. Deadline: {septemberCountDate ? formatImportantDate(septemberCountDate) : 'September 30'}</>
                      ) : (
                        'Registration opens January 1st each year. Deadline: September 30th for funding eligibility'
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Learning Requirements</h3>
                    <p className="text-gray-600">Meet Schedule of Learning Outcomes (SOLO) by age 20</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Available Funding (Per Student)</h3>
                    <p className="text-gray-600">{FUNDING_RATES.GRADES_1_TO_12.formatted} per year for grades 1-12, {FUNDING_RATES.KINDERGARTEN.formatted} per year for Kindergarten</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Flexible Assessment</h3>
                    <p className="text-gray-600">No mandatory provincial testing—assess as fits your family</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl p-6 sm:p-8 text-white">
              <h3 className="text-xl sm:text-2xl font-bold mb-6">Ready to Empower Your Child?</h3>
              <p className="text-purple-100 mb-6">
                Join Alberta families embracing home education for personalized growth and achievement.
              </p>
              <button
                onClick={handleGetStarted}
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-white text-base sm:text-lg font-medium rounded-lg text-purple-600 bg-white hover:bg-gray-50 transition-colors"
              >
                Start Registration
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              We're Here for You
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Questions about starting home education or our platform? Our team is dedicated to supporting your family's success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone Support</h3>
              <p className="text-gray-600">Get quick help from our experts</p>
              <p className="text-purple-600 font-medium mt-2">{CONTACT_INFO.MAIN.phone}</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Us</h3>
              <p className="text-gray-600">Detailed responses within 24 hours</p>
              <p className="text-purple-600 font-medium mt-2">{CONTACT_INFO.MAIN.email}</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Our Location</h3>
              <p className="text-gray-600">Schedule a visit</p>
              <p className="text-purple-600 font-medium mt-2">{CONTACT_INFO.MAIN.location}</p>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center px-8 py-4 border border-transparent text-base sm:text-lg font-medium rounded-lg text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              Launch Your Home Education
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="/connectImages/Connect.png" 
                  alt="RTD Connect Logo"
                  className="h-8 sm:h-10 w-auto"
                />
                <div>
                  <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    RTD Connect
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400">Alberta Home Education Portal</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Simplifying home education with fast funding, easy tools, and expert support for Alberta parents.
              </p>
            </div>

            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><button onClick={() => navigate('/about')} className="hover:text-white transition-colors">About</button></li>
                <li><button onClick={() => navigate('/bio')} className="hover:text-white transition-colors">Our Facilitators</button></li>
                <li><button onClick={() => navigate('/faq')} className="hover:text-white transition-colors">FAQ</button></li>
                <li><button onClick={() => navigate('/funding')} className="hover:text-white transition-colors">Funding</button></li>
                <li><button onClick={handleGetStarted} className="hover:text-white transition-colors">Get Started</button></li>
                <li><button onClick={handleContactClick} className="hover:text-white transition-colors">Contact Us</button></li>
                <li><a href="https://rtdacademy.com" className="hover:text-white transition-colors">RTD Academy</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-4">Contact Details</h4>
              <div className="space-y-2 text-gray-400 text-sm">
                <p>{CONTACT_INFO.MAIN.email}</p>
                <p>{CONTACT_INFO.MAIN.phone}</p>
                <p>{CONTACT_INFO.MAIN.location}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} RTD Connect - Home Education Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RTDConnectLandingPage;