import React from 'react';
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
  Home, 
  Star,
  Phone,
  Mail,
  MapPin,
  Clock
} from 'lucide-react';

// Import configuration
import { 
  FUNDING_RATES, 
  ACADEMIC_STATS, 
  CONTACT_INFO,
  PORTAL_STATS
} from '../config/HomeEducation';
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
      className="h-12 w-auto"
    />
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
        RTD Connect
      </h1>
      <p className="text-sm text-gray-600">Home Education</p>
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

  // Get current registration information
  const currentSchoolYear = getCurrentSchoolYear();
  const openRegistrationYear = getOpenRegistrationSchoolYear();
  const registrationOpenDate = openRegistrationYear ? getRegistrationOpenDateForYear(openRegistrationYear) : null;
  const septemberCountDate = openRegistrationYear ? getSeptemberCountForYear(openRegistrationYear) : null;

  const handleGetStarted = () => {
    navigate('/login');
  };

  const handleLearnMore = () => {
    document.getElementById('what-is-home-education').scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <RTDConnectLogo />
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/facilitators')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Our Facilitators
              </button>
              <button
                onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
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
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                Empower Your Child's Learning with 
                <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent block">
                  Flexible Home Education in Alberta
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Experience the joy of tailored education supported by expert guidance. RTD Connect simplifies home education for Alberta families with easy registration, fast funding payouts, and comprehensive resources—all in one user-friendly portal.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={handleGetStarted}
                  className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                >
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
                
                <button
                  onClick={handleLearnMore}
                  className="inline-flex items-center justify-center px-8 py-4 border border-gray-300 text-lg font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                >
                  Learn More
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6">
                <StatCard 
                  value={FUNDING_RATES.GRADES_1_TO_12.formatted}
                  label="Per Student Funding"
                  icon={DollarSign}
                />
                <StatCard 
                  value={`${ACADEMIC_STATS.HOME_EDUCATION_DIPLOMA_AVERAGE.percentage}%`}
                  label="Diploma Exam Avg"
                  icon={Star}
                />
                <StatCard 
                  value={PORTAL_STATS.COMMUNITY_PARTNERS.count}
                  label="Community Partners"
                  icon={Users}
                />
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="/connectImages/ChildComputer.png" 
                alt="Child learning with computer"
                className="w-full max-w-lg mx-auto rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* What is Home Education Section */}
      <section id="what-is-home-education" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Is Home Education in Alberta?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Home education empowers parents to direct their child's learning in Grades K-12, choosing curricula and methods that suit their family's lifestyle while meeting Alberta's Schedule of Learning Outcomes (SOLO).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
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

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Proven Results for Alberta
            </h3>
            <p className="text-lg text-gray-700 mb-6">
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
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why RTD Connect Stands Out for Parents
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Backed by RTD Academy's educational excellence, we make home schooling in Alberta effortless with our intuitive portal, rapid funding access, and dedicated support.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple Steps to Begin
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Starting home education with RTD Connect is straightforward. Our portal guides you through registration, planning, and ongoing management in just a few clicks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
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
              icon={Home}
            />
            <StepCard 
              number="3"
              title="Access Funding & Resources"
              description="Submit receipts digitally for fast reimbursements and start learning with full support"
              icon={BookOpen}
            />
          </div>

          <div className="text-center mt-12">
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              Begin Registration
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Features & Services Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Full Suite of Tools for Success
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our all-in-one platform delivers the support Alberta parents need to thrive in home education, from planning to payouts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Meet Our Expert Facilitators
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our dedicated team of education specialists is here to guide and support your family throughout your home education journey. Get to know our facilitators and find the perfect match for your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Sarah Johnson Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-8">
                <div className="flex items-center space-x-6 mb-6">
                  <img 
                    src="/connectImages/FakeFacil2.png" 
                    alt="Sarah Johnson"
                    className="w-24 h-24 rounded-full object-cover border-4 border-purple-100"
                  />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Sarah Johnson</h3>
                    <p className="text-lg text-purple-600 font-semibold">Senior Home Education Facilitator</p>
                    <p className="text-sm text-gray-600 mt-1">12+ years experience</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Specializes in elementary and middle school curriculum planning, learning differences support, and helping families navigate SOLO compliance with confidence.
                </p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">Elementary & Middle School Expert</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">Learning Differences Support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">SOLO Compliance & Assessment</span>
                  </div>
                </div>
                
                <button
                  onClick={() => navigate('/facilitator/sarah-johnson')}
                  className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-colors"
                >
                  Learn More About Sarah
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>

            {/* Michael Chen Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-8">
                <div className="flex items-center space-x-6 mb-6">
                  <img 
                    src="/connectImages/FakeFacil1.png" 
                    alt="Michael Chen"
                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                  />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Michael Chen</h3>
                    <p className="text-lg text-blue-600 font-semibold">High School & Transition Specialist</p>
                    <p className="text-sm text-gray-600 mt-1">8+ years experience</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Dedicated to helping teens succeed in high school home education, diploma exam preparation, and planning for post-secondary education and career success.
                </p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">High School Course Planning</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">Diploma Exam Preparation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">University Admission Guidance</span>
                  </div>
                </div>
                
                <button
                  onClick={() => navigate('/facilitator/michael-chen')}
                  className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-colors"
                >
                  Learn More About Michael
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-lg text-gray-600 mb-6">
              Ready to connect with one of our facilitators? They're here to help you succeed.
            </p>
            <button
              onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center px-8 py-4 border border-gray-300 text-lg font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              Contact Our Team
            </button>
          </div>
        </div>
      </section>

      {/* Requirements & Funding Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
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
            
            <div className="bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Ready to Empower Your Child?</h3>
              <p className="text-purple-100 mb-6">
                Join Alberta families embracing home education for personalized growth and achievement.
              </p>
              <button
                onClick={handleGetStarted}
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-white text-lg font-medium rounded-lg text-purple-600 bg-white hover:bg-gray-50 transition-colors"
              >
                Start Registration
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              We're Here for You
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Questions about starting home education or our platform? Our team is dedicated to supporting your family's success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
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
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              Launch Your Home Education
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="/connectImages/Connect.png" 
                  alt="RTD Connect Logo"
                  className="h-10 w-auto"
                />
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    RTD Connect
                  </h3>
                  <p className="text-sm text-gray-400">Alberta Home Education Portal</p>
                </div>
              </div>
              <p className="text-gray-400">
                Simplifying home education with fast funding, easy tools, and expert support for Alberta parents.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => document.getElementById('what-is-home-education').scrollIntoView({ behavior: 'smooth' }) } className="hover:text-white transition-colors">About Home Education</button></li>
                <li><button onClick={() => navigate('/facilitators')} className="hover:text-white transition-colors">Our Facilitators</button></li>
                <li><button onClick={handleGetStarted} className="hover:text-white transition-colors">Get Started</button></li>
                <li><button onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' }) } className="hover:text-white transition-colors">Contact Us</button></li>
                <li><a href="https://rtdacademy.com" className="hover:text-white transition-colors">RTD Academy</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Details</h4>
              <div className="space-y-2 text-gray-400">
                <p>{CONTACT_INFO.MAIN.email}</p>
                <p>{CONTACT_INFO.MAIN.phone}</p>
                <p>{CONTACT_INFO.MAIN.location}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} RTD Connect - Home Education Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RTDConnectLandingPage;