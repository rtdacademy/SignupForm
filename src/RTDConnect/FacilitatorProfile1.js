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
  Star
} from 'lucide-react';

const FacilitatorProfile1 = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/');
  };

  const handleContactEmail = () => {
    window.location.href = 'mailto:golda@rtd-connect.com';
  };

  const handleContactPhone = () => {
    window.location.href = 'tel:403-555-0124';
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
      <section className="bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <img 
                src="/connectImages/FakeFacil2.png" 
                alt="Golda David"
                className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Golda David</h1>
              <p className="text-xl text-purple-600 font-semibold mb-4">Senior Home Education Facilitator</p>
              <p className="text-lg text-gray-600 mb-6 max-w-2xl">
                Passionate educator with 10 years of experience helping Alberta families succeed in home education. 
                Specializes in curriculum planning, learning assessment, and family support.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button
                  onClick={handleContactEmail}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 transition-colors"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Email Golda
                </button>
                <button
                  onClick={handleContactPhone}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call Golda
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
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Education Background</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Master of Education, University of Calgary</li>
                <li>• Bachelor of Elementary Education</li>
                <li>• Alberta Teaching Certificate</li>
                <li>• Home Education Specialist Certification</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Specializations</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Elementary & Middle School Curriculum</li>
                <li>• Learning Differences Support</li>
                <li>• SOLO Compliance & Planning</li>
                <li>• Assessment Strategies</li>
              </ul>
            </div>
          </div>

          {/* Experience Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">10+</div>
              <div className="text-sm text-gray-600">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">120+</div>
              <div className="text-sm text-gray-600">Families Supported</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">24hr</div>
              <div className="text-sm text-gray-600">Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* How Sarah Can Help */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How Golda Can Help Your Family</h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Curriculum Planning & Selection</h3>
                <p className="text-gray-600">Get personalized recommendations for curricula that match your child's learning style and meet Alberta's SOLO requirements.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Learning Assessment Strategies</h3>
                <p className="text-gray-600">Develop effective ways to track your child's progress and ensure they're meeting learning outcomes at their own pace.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Support for Learning Differences</h3>
                <p className="text-gray-600">Specialized guidance for children with unique learning needs, including ADHD, dyslexia, and giftedness.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Compliance & Documentation</h3>
                <p className="text-gray-600">Ensure your home education program meets all Alberta requirements with proper record-keeping and reporting.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-br from-purple-500 to-cyan-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Connect with Golda?</h2>
          <p className="text-xl text-purple-100 mb-8">
            Schedule a consultation to discuss your family's home education journey
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleContactEmail}
              className="inline-flex items-center px-8 py-4 border border-white text-lg font-medium rounded-lg text-purple-600 bg-white hover:bg-gray-50 transition-colors"
            >
              <Mail className="w-5 h-5 mr-2" />
              golda@rtd-connect.com
            </button>
            <button
              onClick={handleContactPhone}
              className="inline-flex items-center px-8 py-4 border border-white text-lg font-medium rounded-lg text-white bg-transparent hover:bg-white hover:text-purple-600 transition-colors"
            >
              <Phone className="w-5 h-5 mr-2" />
              (403) 555-0124
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FacilitatorProfile1;