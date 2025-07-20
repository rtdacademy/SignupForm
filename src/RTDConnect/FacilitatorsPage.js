import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2,
  GraduationCap,
  Users,
  Mail,
  Phone,
  Star,
  Clock,
  BookOpen,
  Menu
} from 'lucide-react';

// Import configuration
import { CONTACT_INFO } from '../config/HomeEducation';
import { getAllFacilitators } from '../config/facilitators';

// Get facilitator data from centralized config
const facilitators = getAllFacilitators();

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

const FacilitatorsPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleBackToHome = () => {
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleGetStarted = () => {
    navigate('/login');
    setIsMenuOpen(false);
  };

  const handleContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const handleContactEmail = (email) => {
    window.location.href = `mailto:${email}`;
  };

  const handleContactPhone = (phone) => {
    window.location.href = `tel:${phone}`;
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
                onClick={handleBackToHome}
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </button>
              <button
                onClick={handleContact}
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
                  onClick={handleBackToHome}
                  className="inline-flex items-center text-gray-600 hover:text-gray-900 py-2 transition-colors text-left"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </button>
                <button
                  onClick={handleContact}
                  className="text-gray-600 hover:text-gray-900 py-2 transition-colors text-left"
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
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Meet Our Expert 
            <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent block">
              Home Education Facilitators
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Our dedicated team of education specialists is here to guide and support your family throughout your home education journey. Each facilitator brings unique expertise and passion for helping Alberta families succeed.
          </p>
        </div>
      </section>

      {/* Facilitators Grid */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 mb-12 sm:mb-16">
            {facilitators.map((facilitator) => (
              <div key={facilitator.id} className={`bg-white rounded-2xl shadow-lg border ${facilitator.gradients.border} overflow-hidden hover:shadow-xl transition-shadow`}>
                {/* Header with Profile */}
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
                  
                  {/* Specializations */}
                  <div className="space-y-3 mb-6">
                    {facilitator.specializations.map((spec, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{spec}</span>
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    {facilitator.stats.map((stat, index) => {
                      const iconMap = { Star, Users, Clock, GraduationCap };
                      const IconComponent = iconMap[stat.icon] || Star;
                      return (
                        <div key={index} className="text-center">
                          <IconComponent className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                          <div className="text-base sm:text-lg font-bold text-gray-900">{stat.value}</div>
                          <div className="text-xs text-gray-600">{stat.label}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Contact Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate(`/facilitator/${facilitator.id}`)}
                      className={`w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r ${facilitator.gradients.card} hover:from-purple-600 hover:to-blue-600 transition-colors`}
                    >
                      View Full Profile
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleContactEmail(facilitator.contact.email)}
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </button>
                      <button
                        onClick={() => handleContactPhone(facilitator.contact.phone)}
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* How Our Facilitators Help */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 sm:p-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">How Our Facilitators Support Your Family</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Curriculum Planning</h3>
                <p className="text-gray-600 text-sm">Personalized guidance for choosing and implementing the right curriculum for your child</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Compliance Support</h3>
                <p className="text-gray-600 text-sm">Ensure your home education program meets all Alberta requirements</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Family Coaching</h3>
                <p className="text-gray-600 text-sm">Ongoing support and encouragement throughout your home education journey</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Academic Excellence</h3>
                <p className="text-gray-600 text-sm">Help your child achieve their full potential with expert educational guidance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Ready to Connect?</h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Our facilitators are here to help you succeed in your home education journey. Get started today or reach out with any questions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center px-8 py-4 border border-transparent text-base sm:text-lg font-medium rounded-lg text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 transition-colors"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <button
              onClick={() => handleContactEmail(CONTACT_INFO.MAIN.email)}
              className="inline-flex items-center px-8 py-4 border border-gray-300 text-base sm:text-lg font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Mail className="w-5 h-5 mr-2" />
              Contact Our Team
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
                <li><button onClick={handleBackToHome} className="hover:text-white transition-colors">Home</button></li>
                <li><button onClick={() => navigate('/facilitators')} className="hover:text-white transition-colors">Our Facilitators</button></li>
                <li><button onClick={handleGetStarted} className="hover:text-white transition-colors">Get Started</button></li>
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

export default FacilitatorsPage;