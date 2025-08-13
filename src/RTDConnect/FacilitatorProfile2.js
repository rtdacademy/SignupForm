import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Phone,
  Globe,
  Users,
  Heart,
  Star,
  MapPin,
  GraduationCap,
  Palette,
  Copy,
  Check,
  BookOpen,
  Award
} from 'lucide-react';

const FacilitatorProfile2 = () => {
  const navigate = useNavigate();
  const [copiedPhone, setCopiedPhone] = useState(false);

  const handleGoBack = () => {
    navigate('/bio');
  };

  const handleContactEmail = () => {
    window.location.href = 'mailto:marian@rtd-connect.com';
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText('780-777-1608');
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 3000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button
              onClick={handleGoBack}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Facilitators
            </button>
          </div>
        </div>
      </nav>

      {/* Profile Header */}
      <section className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Profile Image */}
            <div className="relative inline-block mb-6">
              <img 
                src="/connectImages/marian.jpg" 
                alt="Marian Johnson"
                className="w-48 h-48 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Marian Johnson</h1>
            <p className="text-xl text-blue-600 font-semibold mb-2">Alberta Certified Teacher | Home Education Facilitator Since 2020</p>
            <p className="text-lg text-gray-600 mb-6">Community Connector | Experiential Learning Advocate</p>
            
            <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Marian Johnson is a dynamic Home Education Facilitator who has been dedicated to supporting homeschooling families across rural Alberta since 2020. 
              With a strong background in student-centered learning and virtual education, Marian supports families navigating the 
              complexities of home-based education by providing personalized guidance, curriculum planning, and access to academic 
              and emotional support resources.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleContactEmail}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-colors"
              >
                <Mail className="w-5 h-5 mr-2" />
                Email Marian
              </button>
              
              <button
                onClick={handleCopyPhone}
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors relative"
              >
                {copiedPhone ? (
                  <>
                    <Check className="w-5 h-5 mr-2 text-green-600" />
                    <span className="text-green-600">Phone Copied!</span>
                  </>
                ) : (
                  <>
                    <Phone className="w-5 h-5 mr-2" />
                    <span>Text/Call 780-777-1608</span>
                  </>
                )}
                {copiedPhone && (
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm px-3 py-1 rounded-md whitespace-nowrap">
                    Phone number copied to clipboard!
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Education & Qualifications */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Education & Qualifications</h2>
          
          <div className="bg-white rounded-xl p-8 shadow-md mb-12">
            <div className="space-y-4">
              <div className="flex items-start">
                <GraduationCap className="w-6 h-6 text-blue-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">M.Ed - Open, Digital and Distance Education</p>
                  <p className="text-gray-600">Athabasca University (Currently Pursuing)</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Award className="w-6 h-6 text-blue-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">B.Ed - Bachelor of Education</p>
                  <p className="text-gray-600">University of Technology, Jamaica (2008)</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Award className="w-6 h-6 text-blue-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Diploma in Secondary Education - Business Studies</p>
                  <p className="text-gray-600">Church Teacher's College, Mandeville, Jamaica</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Star className="w-6 h-6 text-yellow-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Alberta Education Certified Teacher</p>
                  <p className="text-gray-600">Home Education Facilitator Since 2020</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specializations & Expertise */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Areas of Expertise</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Globe className="w-8 h-8 text-blue-500 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Experiential Learning</h3>
              </div>
              <p className="text-gray-700">
                Leading global education initiatives including the EF Tours' Homeschool Journey to Japan 2026, 
                fostering international perspectives and cultural understanding.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <MapPin className="w-8 h-8 text-cyan-500 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Rural Alberta Support</h3>
              </div>
              <p className="text-gray-700">
                Specialized in supporting families in rural communities, understanding unique challenges and 
                connecting families to resources across Alberta.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <BookOpen className="w-8 h-8 text-teal-500 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Curriculum Planning</h3>
              </div>
              <p className="text-gray-700">
                Expert in designing inclusive, flexible learning experiences that adapt to each student's 
                unique learning style and educational goals.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Users className="w-8 h-8 text-green-500 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Community Building</h3>
              </div>
              <p className="text-gray-700">
                Regularly hosts parent seminars and homeschool group activities, building supportive 
                communities for home education families.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Current Projects & Initiatives */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Current Initiatives</h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">EF Tours: Homeschool Journey to Japan 2026</h3>
                  <p className="text-gray-700">
                    Leading an exciting educational tour to Japan, providing homeschool students with immersive 
                    cultural experiences and global learning opportunities.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Student Art Exhibition</h3>
                  <p className="text-gray-700">
                    Curated the first homeschool student art exhibition in partnership with the Peace River Art Hub, 
                    showcasing creative talents and building community connections.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Parent Education Seminars</h3>
                  <p className="text-gray-700">
                    Regular workshops empowering families with tools and strategies for successful home education, 
                    covering topics from curriculum design to social development.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy & Approach */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Educational Philosophy</h2>
          
          <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 rounded-xl p-8">
            <div className="space-y-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                Marian believes in designing inclusive, flexible learning experiences that connect students to their 
                communities and the wider world. Her approach focuses on:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <Star className="w-5 h-5 text-yellow-500 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Student-centered, personalized learning paths</span>
                </div>
                <div className="flex items-start">
                  <Star className="w-5 h-5 text-yellow-500 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Community engagement and real-world connections</span>
                </div>
                <div className="flex items-start">
                  <Star className="w-5 h-5 text-yellow-500 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Global citizenship and cultural awareness</span>
                </div>
                <div className="flex items-start">
                  <Star className="w-5 h-5 text-yellow-500 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Innovation and equity in education</span>
                </div>
              </div>
              
              <p className="text-lg text-gray-700 leading-relaxed">
                With a passion for innovation and equity in education, Marian continues to build bridges between 
                families, schools, and community stakeholders to ensure every student has access to enriching, 
                personalized learning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-br from-blue-500 to-cyan-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Let's Connect Today!</h2>
          <p className="text-xl text-blue-100 mb-8">
            Ready to explore personalized learning opportunities for your family? Marian is here to support your home education journey.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleContactEmail}
              className="inline-flex items-center px-8 py-4 border border-white text-lg font-medium rounded-lg text-blue-600 bg-white hover:bg-gray-50 transition-colors"
            >
              <Mail className="w-5 h-5 mr-2" />
              Email Marian
            </button>
            
            <button
              onClick={handleCopyPhone}
              className="inline-flex items-center px-8 py-4 border border-white text-lg font-medium rounded-lg text-white bg-transparent hover:bg-white hover:text-blue-600 transition-colors relative"
            >
              {copiedPhone ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  <span>Phone Copied!</span>
                </>
              ) : (
                <>
                  <Phone className="w-5 h-5 mr-2" />
                  <span>Call/Text 780-777-1608</span>
                </>
              )}
              {copiedPhone && (
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm px-3 py-1 rounded-md whitespace-nowrap">
                  Phone number copied to clipboard!
                </div>
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FacilitatorProfile2;