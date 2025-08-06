import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight,
  Heart,
  Target,
  Users,
  Sparkles,
  Menu,
  BookOpen,
  Home
} from 'lucide-react';

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

const AboutPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleHomeClick = () => {
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleBioClick = () => {
    navigate('/bio');
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
                className="text-purple-600 font-medium"
              >
                About
              </button>
              <button
                onClick={handleBioClick}
                className="text-gray-600 hover:text-gray-900 transition-colors"
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
                  className="text-purple-600 font-medium py-2 text-left"
                >
                  About
                </button>
                <button
                  onClick={handleBioClick}
                  className="text-gray-600 hover:text-gray-900 py-2 transition-colors text-left"
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
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            About 
            <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent block">
              RTD Connect
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Supporting Alberta families in creating meaningful, personalized home education journeys
          </p>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 text-center">Who We Are</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              RTD-Connect is the home education program of RTD Academy, created to support families across Alberta in cultivating meaningful, personalized learning journeys. Our facilitators are not only Alberta-certified teachers but also seasoned homeschooling facilitators who bring a wealth of knowledge, empathy, and real-life experience to their role. We walk alongside families with care, respect, and a deep commitment to educational freedom.
            </p>
          </div>
        </div>
      </section>

      {/* Our Philosophy Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 text-center">Our Philosophy</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              At RTD-Connect, we believe learning is most alive when it's rooted in curiosity, nurtured by creativity, and shaped by the learner. Whether through projects, play, or personal passions, we honour each child's natural drive to grow and discover.
            </p>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-green-500 rounded-full flex items-center justify-center">
                <Target className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 text-center">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              We provide the guidance, tools, and encouragement families need to build a thriving home education experience - one that is flexible, inclusive, and responsive to the unique rhythms of every learner. Our mission is to empower confident, lifelong learners by supporting a learning environment where voices are heard, differences are celebrated, and passions are pursued.
            </p>
          </div>
        </div>
      </section>

      {/* What We Value Section */}
      <section className="py-12 sm:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-purple-500 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12 text-center">What We Value</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Rooted Support */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Rooted Support</h3>
                  <p className="text-gray-600">Meeting families where they are, with grounded and reliable care.</p>
                </div>
              </div>
            </div>

            {/* Thriving Learners */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Thriving Learners</h3>
                  <p className="text-gray-600">Encouraging children to flourish in their own time and way.</p>
                </div>
              </div>
            </div>

            {/* Dynamic Thinking */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Dynamic Thinking</h3>
                  <p className="text-gray-600">Celebrating creativity, adaptability, and bold ideas.</p>
                </div>
              </div>
            </div>

            {/* Connection */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Connection</h3>
                  <p className="text-gray-600">Fostering strong relationships between families, facilitators, and community.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 sm:py-20 bg-gradient-to-br from-purple-500 to-cyan-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Begin Your Home Education Journey?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join families across Alberta who have discovered the freedom and flexibility of personalized home education.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center justify-center px-8 py-4 border border-white text-lg font-medium rounded-lg text-purple-600 bg-white hover:bg-gray-50 transition-colors"
            >
              Get Started Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <button
              onClick={handleBioClick}
              className="inline-flex items-center justify-center px-8 py-4 border border-white text-lg font-medium rounded-lg text-white bg-transparent hover:bg-white hover:text-purple-600 transition-colors"
            >
              Meet Our Facilitators
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

export default AboutPage;