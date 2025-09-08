import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  GraduationCap, 
  BookOpen,
  Heart,
  Flower2,
  Users,
  Award,
  PenTool,
  Ban
} from 'lucide-react';
import { getFacilitatorById } from '../config/facilitators';

const FacilitatorProfile4 = () => {
  const navigate = useNavigate();
  
  // Get Elise's data from the config
  const facilitatorData = getFacilitatorById('elise');
  const isFull = facilitatorData?.isAvailable === false;

  const handleGoBack = () => {
    navigate('/bio');
  };

  const handleContactEmail = () => {
    window.location.href = 'mailto:elise@rtd-connect.com';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-pink-100 sticky top-0 z-50">
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
      <section className="bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <img 
                src="/connectImages/Elise.jpg" 
                alt="Elise"
                className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Elise</h1>
              <p className="text-xl text-pink-600 font-semibold mb-2">Alternative Learning & Literacy Specialist</p>
              <p className="text-lg text-gray-600 mb-1">B.Ed, B.A in English & Creative Writing</p>
              <p className="text-lg text-gray-600 mb-2">NAMC Montessori Certification</p>
              
              {/* Full Badge */}
              {isFull && (
                <div className="inline-flex items-center px-3 py-1 bg-red-100 border border-red-300 rounded-full mb-4">
                  <Ban className="w-4 h-4 text-red-600 mr-2" />
                  <span className="text-sm font-medium text-red-800">Currently Full - Not Accepting New Families</span>
                </div>
              )}
              
              <div className="flex justify-center md:justify-start">
                <button
                  onClick={handleContactEmail}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition-colors"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Email Elise
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Elise */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">About Me</h2>
            <p className="text-gray-700 leading-relaxed">
              I am passionate about alternative learning styles and finding ways to help each family and child flourish. 
              I am excited to learn alongside them! I obtained my B.A in English and Creative Writing at the University of Alberta 
              and love helping children unlock their love of reading and writing.
            </p>
          </div>
        </div>
      </section>

      {/* Areas of Expertise */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Areas of Expertise</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                  <PenTool className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Reading & Creative Writing</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Helping children discover the joy of storytelling and develop strong literacy skills through engaging activities.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                  <Flower2 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Montessori & Child-Led Learning</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Supporting families in following their children's interests and natural learning rhythms.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Elementary Ages</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Specializing in the unique developmental needs and learning styles of elementary-aged children.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Qualifications */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Qualifications</h2>
          
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">B.Ed</h3>
                <p className="text-sm text-gray-600">Bachelor of Education</p>
              </div>
              
              <div>
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">B.A</h3>
                <p className="text-sm text-gray-600">English & Creative Writing</p>
              </div>
              
              <div>
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">NAMC</h3>
                <p className="text-sm text-gray-600">Montessori Certification</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-br from-pink-500 to-purple-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Begin Your Learning Journey?</h2>
          <p className="text-xl text-pink-100 mb-8">
            Let's work together to help your child flourish through creative, child-centered learning
          </p>
          
          <div className="flex justify-center">
            <button
              onClick={handleContactEmail}
              className="inline-flex items-center px-8 py-4 border border-white text-lg font-medium rounded-lg text-pink-600 bg-white hover:bg-gray-50 transition-colors"
            >
              <Mail className="w-5 h-5 mr-2" />
              elise@rtd-connect.com
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FacilitatorProfile4;