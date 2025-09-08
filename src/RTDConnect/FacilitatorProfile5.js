import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  GraduationCap, 
  TreePine,
  Heart,
  Palette,
  Users,
  Award,
  BookOpen,
  Leaf,
  Ban
} from 'lucide-react';
import { getFacilitatorById } from '../config/facilitators';

const FacilitatorProfile5 = () => {
  const navigate = useNavigate();
  
  // Get Kari's data from the config
  const facilitatorData = getFacilitatorById('kari-luther');
  const isFull = facilitatorData?.isAvailable === false;

  const handleGoBack = () => {
    navigate('/bio');
  };

  const handleContactEmail = () => {
    window.location.href = 'mailto:kari@rtd-connect.com';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-emerald-100 sticky top-0 z-50">
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
      <section className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <img 
                src="/connectImages/Kari.jpg" 
                alt="Kari Luther"
                className="w-48 h-48 rounded-full object-cover object-top border-4 border-white shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Kari Luther</h1>
              <p className="text-xl text-emerald-600 font-semibold mb-2">Holistic Learning Specialist</p>
              <p className="text-lg text-gray-600 mb-1">M.Ed, B.A./B.Ed.</p>
              <p className="text-lg text-gray-600 mb-2">30+ Years Experience</p>
              
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
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-colors"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Email Kari
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Kari */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">About Me</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              With over 30 years of experience working with children in various settings, I am passionate about supporting 
              holistic, authentic, child-led learning. I understand and appreciate that each child and family's journey in 
              education can be as unique as they are.
            </p>
            <p className="text-gray-700 leading-relaxed">
              My extensive background includes 10 years of teaching in rural communities, where I developed a deep 
              understanding of the importance of nature-based and play-based learning. I believe in the power of following 
              children's natural curiosity and supporting their individual learning journeys through creative, hands-on experiences.
            </p>
          </div>
        </div>
      </section>

      {/* Areas of Expertise */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Areas of Expertise</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-3">
                  <TreePine className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Nature-based & Play-based Learning</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Creating meaningful learning experiences through outdoor exploration and structured play activities.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-3">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Child-Led Learning & Art Education</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Supporting children's natural creativity and following their interests through artistic expression.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-3">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Indigenous Education & Early Literacy</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Incorporating Indigenous perspectives and developing strong foundational literacy skills.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-3">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Resource Sourcing & Early Elementary</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Helping families find the right resources and supporting early elementary learners' development.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Experience & Qualifications */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Experience & Qualifications</h2>
          
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">30+ Years</h3>
                <p className="text-sm text-gray-600">Working with Children</p>
              </div>
              
              <div>
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">M.Ed, B.A./B.Ed.</h3>
                <p className="text-sm text-gray-600">Educational Qualifications</p>
              </div>
              
              <div>
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">10 Years</h3>
                <p className="text-sm text-gray-600">Rural Teaching Experience</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">My Educational Philosophy</h2>
          
          <div className="bg-white rounded-xl p-8 shadow-md">
            <p className="text-gray-700 leading-relaxed mb-4">
              I believe in the power of holistic education that nurtures the whole child – mind, body, and spirit. 
              Every child has unique gifts and learning styles, and my role is to help families discover and celebrate 
              these individual strengths.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Through play-based and nature-based approaches, combined with creative arts and intuitive parental wisdom, 
              we can create rich learning environments where children thrive naturally. My goal is to support families 
              in building confidence, fostering curiosity, and developing a lifelong love of learning.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-br from-emerald-500 to-teal-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Begin Your Learning Journey?</h2>
          <p className="text-xl text-emerald-100 mb-8">
            Let's work together to create a holistic, child-centered learning experience for your family
          </p>
          
          <div className="flex justify-center">
            <button
              onClick={handleContactEmail}
              className="inline-flex items-center px-8 py-4 border border-white text-lg font-medium rounded-lg text-emerald-600 bg-white hover:bg-gray-50 transition-colors"
            >
              <Mail className="w-5 h-5 mr-2" />
              kari@rtd-connect.com
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FacilitatorProfile5;