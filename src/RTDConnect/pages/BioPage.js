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
  Menu,
  Heart,
  Award
} from 'lucide-react';

// Import configuration
import { CONTACT_INFO } from '../../config/HomeEducation';
import { getAllFacilitators } from '../../config/facilitators';

// Get facilitator data from centralized config
const facilitators = getAllFacilitators();

// RTD Connect Logo
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

const BioPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleHomeClick = () => {
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleAboutClick = () => {
    navigate('/about');
    setIsMenuOpen(false);
  };

  const handleFAQClick = () => {
    navigate('/faq');
    setIsMenuOpen(false);
  };

  const handleFundingClick = () => {
    navigate('/funding');
    setIsMenuOpen(false);
  };

  const handleGetStarted = () => {
    navigate('/login');
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
                onClick={handleHomeClick}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Home
              </button>
              <button
                onClick={handleAboutClick}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                About
              </button>
              <button
                className="text-purple-600 font-medium"
              >
                Facilitators
              </button>
              <button
                onClick={handleFAQClick}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                FAQ
              </button>
              <button
                onClick={handleFundingClick}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Funding
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
                  className="text-gray-600 hover:text-gray-900 py-2 transition-colors text-left"
                >
                  Home
                </button>
                <button
                  onClick={handleAboutClick}
                  className="text-gray-600 hover:text-gray-900 py-2 transition-colors text-left"
                >
                  About
                </button>
                <button
                  className="text-purple-600 font-medium py-2 text-left"
                >
                  Facilitators
                </button>
                <button
                  onClick={handleFAQClick}
                  className="text-gray-600 hover:text-gray-900 py-2 transition-colors text-left"
                >
                  FAQ
                </button>
                <button
                  onClick={handleFundingClick}
                  className="text-gray-600 hover:text-gray-900 py-2 transition-colors text-left"
                >
                  Funding
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
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Meet The RTD-Connect
            <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent block">
              Facilitators
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Our dedicated team of education specialists brings passion, expertise, and personal experience to support your family's home education journey.
          </p>
        </div>
      </section>

      {/* Facilitators Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {facilitators.map((facilitator, index) => (
              <div key={facilitator.id} className={`${index % 2 === 1 ? 'bg-gradient-to-br from-purple-50 to-blue-50' : 'bg-white'} rounded-2xl ${index % 2 === 0 ? 'shadow-lg' : ''} overflow-hidden`}>
                <div className="p-8 md:p-12">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    {/* Profile Image - Alternate sides */}
                    <div className={`md:col-span-3 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                      <div className="relative">
                        <img 
                          src={facilitator.image} 
                          alt={facilitator.name}
                          className={`w-48 h-48 mx-auto rounded-full object-cover border-4 ${facilitator.gradients.border} shadow-xl`}
                        />
                        <div className={`absolute bottom-0 right-1/4 w-12 h-12 bg-gradient-to-r ${facilitator.gradients.card} rounded-full flex items-center justify-center shadow-lg`}>
                          <Award className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className={`md:col-span-9 ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                      <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">{facilitator.name}</h2>
                        <p className="text-xl text-purple-600 font-semibold mb-1">{facilitator.title}</p>
                        <p className="text-gray-600 mb-6">{facilitator.experience}</p>
                        
                        <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                          {facilitator.description}
                        </p>

                        {/* Specializations */}
                        <div className="mb-8">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Areas of Expertise</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {facilitator.specializations.map((spec, specIndex) => (
                              <div key={specIndex} className="flex items-center space-x-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <span className="text-gray-700">{spec}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                          {facilitator.stats.map((stat, statIndex) => {
                            const iconMap = { Star, Users, Clock, GraduationCap };
                            const IconComponent = iconMap[stat.icon] || Star;
                            return (
                              <div key={statIndex} className="text-center bg-white rounded-lg p-4 shadow-md">
                                <IconComponent className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                                <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                                <div className="text-sm text-gray-600">{stat.label}</div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Contact Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                          <button
                            onClick={() => navigate(`/facilitator/${facilitator.id}`)}
                            className={`inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r ${facilitator.gradients.card} hover:from-purple-600 hover:to-blue-600 transition-colors shadow-md`}
                          >
                            View Full Profile
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </button>
                          
                          <button
                            onClick={() => handleContactEmail(facilitator.contact.email)}
                            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-md"
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Email {facilitator.name.split(' ')[0]}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Our Facilitators Matter Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-center">
            Why Our Facilitators Make the Difference
          </h2>
          <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Our facilitators are more than just educators – they're partners in your family's learning journey
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Experience</h3>
              <p className="text-gray-600">
                Many of our facilitators are homeschooling parents themselves, bringing firsthand understanding of your journey.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Professional Expertise</h3>
              <p className="text-gray-600">
                All facilitators are Alberta-certified teachers with specialized training in home education support.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-green-500 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Dedicated Support</h3>
              <p className="text-gray-600">
                Your facilitator is your advocate, guide, and encourager throughout your educational journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 sm:py-20 bg-gradient-to-br from-purple-500 to-cyan-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Connect with a Facilitator?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Choose the facilitator who best matches your family's needs and begin your home education journey with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center justify-center px-8 py-4 border border-white text-lg font-medium rounded-lg text-purple-600 bg-white hover:bg-gray-50 transition-colors"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <button
              onClick={() => handleContactEmail(CONTACT_INFO.MAIN.email)}
              className="inline-flex items-center justify-center px-8 py-4 border border-white text-lg font-medium rounded-lg text-white bg-transparent hover:bg-white hover:text-purple-600 transition-colors"
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
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <img 
                src="/connectImages/Connect.png" 
                alt="RTD Connect Logo"
                className="h-8 sm:h-10 w-auto"
              />
              <div>
                <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  RTD Connect
                </h3>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} RTD Connect - Home Education Portal. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BioPage;