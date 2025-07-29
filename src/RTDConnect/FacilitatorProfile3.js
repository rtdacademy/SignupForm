import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  GraduationCap, 
  BookOpen, 
  Clock,
  CheckCircle2,
  Star,
  Heart
} from 'lucide-react';

const FacilitatorProfile3 = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/');
  };

  const handleContactEmail = () => {
    window.location.href = 'mailto:graceanne@rtdacademy.com';
  };

  const handleContactPhone = () => {
    window.location.href = 'tel:403-555-0126';
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
              Back to RTD Connect
            </button>
          </div>
        </div>
      </nav>

      {/* Profile Header */}
      <section className="bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <img 
                src="/connectImages/FakeFacil2.png" 
                alt="Grace-Anne Post"
                className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Grace-Anne Post</h1>
              <p className="text-xl text-green-600 font-semibold mb-4">K-12 Education Specialist</p>
              <p className="text-lg text-gray-600 mb-6 max-w-2xl">
                Passionate educator with 12 years of experience supporting families throughout their entire home education journey. 
                Specializes in multi-grade families and diverse learning approaches.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button
                  onClick={handleContactEmail}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 transition-colors"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Email Grace-Anne
                </button>
                <button
                  onClick={handleContactPhone}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call Grace-Anne
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise & Qualifications */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Expertise & Qualifications</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Education Background</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Master of Education, University of Alberta</li>
                <li>• Bachelor of Education (K-12)</li>
                <li>• Alberta Teaching Certificate</li>
                <li>• Special Education Certification</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Specializations</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• K-12 Curriculum Development</li>
                <li>• Multi-Grade Family Support</li>
                <li>• Special Needs Education</li>
                <li>• Educational Technology Integration</li>
              </ul>
            </div>
          </div>

          {/* Experience Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">12+</div>
              <div className="text-sm text-gray-600">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">200+</div>
              <div className="text-sm text-gray-600">Families Supported</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">24hr</div>
              <div className="text-sm text-gray-600">Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* How Grace-Anne Can Help */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How Grace-Anne Can Help Your Family</h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">K-12 Curriculum Planning</h3>
                <p className="text-gray-600">Comprehensive guidance for families with children at any grade level, ensuring smooth transitions and consistent educational philosophy throughout.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Grade Teaching Strategies</h3>
                <p className="text-gray-600">Expert support for families teaching multiple children at different grade levels, with practical strategies for efficient and effective home education.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Special Needs Support</h3>
                <p className="text-gray-600">Specialized guidance for children with diverse learning needs, including ADHD, autism spectrum, dyslexia, and giftedness.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Long-Term Educational Planning</h3>
                <p className="text-gray-600">Help families develop a cohesive educational journey from kindergarten through graduation, aligned with each child's unique goals and interests.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Success Stories</h2>
          
          <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-8 text-center">
            <Heart className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <blockquote className="text-lg text-gray-700 mb-4">
              "Grace-Anne has been our family's educational guide for 8 years. Her ability to support all three of our children at different stages - from kindergarten to high school - has been remarkable. She truly understands the unique dynamics of multi-grade home education."
            </blockquote>
            <p className="text-green-600 font-semibold">— Parent of Three Home-Educated Children</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-br from-green-500 to-teal-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Connect with Grace-Anne?</h2>
          <p className="text-xl text-green-100 mb-8">
            Let's discuss your family's unique educational journey
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleContactEmail}
              className="inline-flex items-center px-8 py-4 border border-white text-lg font-medium rounded-lg text-green-600 bg-white hover:bg-gray-50 transition-colors"
            >
              <Mail className="w-5 h-5 mr-2" />
              graceanne@rtdacademy.com
            </button>
            <button
              onClick={handleContactPhone}
              className="inline-flex items-center px-8 py-4 border border-white text-lg font-medium rounded-lg text-white bg-transparent hover:bg-white hover:text-green-600 transition-colors"
            >
              <Phone className="w-5 h-5 mr-2" />
              (403) 555-0126
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FacilitatorProfile3;