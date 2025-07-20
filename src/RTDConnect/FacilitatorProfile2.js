import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Users, 
  BookOpen, 
  Clock,
  CheckCircle2,
  Star,
  Heart
} from 'lucide-react';

const FacilitatorProfile2 = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/');
  };

  const handleContactEmail = () => {
    window.location.href = 'mailto:michael.chen@rtdacademy.com';
  };

  const handleContactPhone = () => {
    window.location.href = 'tel:403-555-0125';
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
      <section className="bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <img 
                src="/connectImages/FakeFacil1.png" 
                alt="Michael Chen"
                className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Michael Chen</h1>
              <p className="text-xl text-blue-600 font-semibold mb-4">High School & Transition Specialist</p>
              <p className="text-lg text-gray-600 mb-6 max-w-2xl">
                Dedicated to helping families navigate high school home education and prepare students for post-secondary success. 
                Expertise in diploma exam preparation, university admissions, and career planning.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button
                  onClick={handleContactEmail}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 transition-colors"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Email Michael
                </button>
                <button
                  onClick={handleContactPhone}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call Michael
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
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Education Background</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Master of Science, University of Alberta</li>
                <li>• Bachelor of Education (Secondary)</li>
                <li>• Alberta Teaching Certificate</li>
                <li>• Career Development Certification</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-green-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-green-500 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Specializations</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• High School Curriculum Planning</li>
                <li>• Diploma Exam Preparation</li>
                <li>• University Admission Guidance</li>
                <li>• Career & Life Planning</li>
              </ul>
            </div>
          </div>

          {/* Experience Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">8+</div>
              <div className="text-sm text-gray-600">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">85+</div>
              <div className="text-sm text-gray-600">Students Graduated</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">Same Day</div>
              <div className="text-sm text-gray-600">Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* How Michael Can Help */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How Michael Can Help Your Teen</h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">High School Course Planning</h3>
                <p className="text-gray-600">Design a high school program that meets graduation requirements while preparing for your teen's post-secondary goals.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Diploma Exam Preparation</h3>
                <p className="text-gray-600">Strategic preparation for Alberta diploma exams with study schedules, resources, and test-taking strategies.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">University & College Admissions</h3>
                <p className="text-gray-600">Navigate application processes, scholarship opportunities, and entrance requirements for post-secondary institutions.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Career Exploration & Planning</h3>
                <p className="text-gray-600">Help your teen discover their interests and plan their educational path toward meaningful career opportunities.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Success Stories</h2>
          
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-8 text-center">
            <Heart className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <blockquote className="text-lg text-gray-700 mb-4">
              "Michael's guidance was invaluable during our daughter's final high school years. His expertise in diploma exam prep helped her achieve excellent results, and his university admission guidance secured her a place in her dream program with scholarships."
            </blockquote>
            <p className="text-blue-600 font-semibold">— Parent of University of Alberta Engineering Student</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-br from-blue-500 to-green-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Connect with Michael?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Let's discuss your teen's high school journey and future goals
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleContactEmail}
              className="inline-flex items-center px-8 py-4 border border-white text-lg font-medium rounded-lg text-blue-600 bg-white hover:bg-gray-50 transition-colors"
            >
              <Mail className="w-5 h-5 mr-2" />
              michael.chen@rtdacademy.com
            </button>
            <button
              onClick={handleContactPhone}
              className="inline-flex items-center px-8 py-4 border border-white text-lg font-medium rounded-lg text-white bg-transparent hover:bg-white hover:text-blue-600 transition-colors"
            >
              <Phone className="w-5 h-5 mr-2" />
              (403) 555-0125
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FacilitatorProfile2;