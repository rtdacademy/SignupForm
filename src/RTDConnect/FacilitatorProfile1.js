import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  GraduationCap, 
  BookOpen, 
  Clock,
  CheckCircle2,
  Star,
  Heart,
  Users,
  Award,
  Lightbulb,
  School,
  Target
} from 'lucide-react';

const FacilitatorProfile1 = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/bio');
  };

  const handleContactEmail = () => {
    window.location.href = 'mailto:golda@rtd-connect.com';
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
      <section className="bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <img 
                src="/connectImages/Golda.jpg" 
                alt="Golda David"
                className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Golda David</h1>
              <p className="text-xl text-purple-600 font-semibold mb-2">Senior Home Education Facilitator</p>
              <p className="text-lg text-gray-600 mb-1">B.Ed, M.Ed</p>
              <p className="text-lg text-gray-600 mb-6">20+ years experience · Educator since 2004</p>
              
              <div className="flex justify-center md:justify-start">
                <button
                  onClick={handleContactEmail}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-colors"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Email Golda
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Home Education */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <Heart className="w-8 h-8 text-purple-500 mr-3" />
              Why Home Education?
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              My journey into home education started when I was doing my Masters Degree in Education where one of our 
              professors asked us to read the book, "Dumbing Us Down" by John Taylor Gatto. Many of my papers afterwards 
              were coloured by the ideas in that book and led me to question the entire system and what benefits and 
              drawbacks 'the system' had on our society and on individual children.
            </p>
            <p className="text-gray-700 leading-relaxed">
              When my son wasn't able to continue in the system itself in the middle of grade 3, I quite readily pulled 
              him out of school and started on our own home education journey. Along the way I have learned a lot more 
              than my MEd degree taught me! People learn best when they choose their own learning and they learn it 
              deeply and permanently.
            </p>
          </div>
        </div>
      </section>

      {/* How I Support Families */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How I Support Families</h2>
          
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <p className="text-gray-700 leading-relaxed mb-6">
              With over 20 years of experience in education, including years spent home educating (unschooling) my own son, 
              I specialize in supporting families in a holistic, non-judgemental format while still ensuring all families 
              meet the needs of their children and can move forward with confidence with their education.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <CheckCircle2 className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-gray-700">Help families navigate the exit from the traditional system while maintaining opportunities for post-secondary education</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <CheckCircle2 className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-gray-700">Support community education and champion parents' rights to teach their children what is relevant today and for each individual child</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <CheckCircle2 className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-gray-700">Provide resource sourcing for students at all levels of skill and development</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle2 className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-gray-700">Offer specialized support for students with exceptionalities, whether gifted or those who struggle in the traditional system</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* My Experience */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">My Experience</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Education Background</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• BEd - University of Western Ontario</li>
                <li>• MEd - University of New Brunswick</li>
                <li>• Educational Leadership & Administration</li>
                <li>• Multiple Provincial Certifications</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Teaching Certifications</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Alberta Teaching Certificate</li>
                <li>• Ontario Teaching Certificate</li>
                <li>• British Columbia Teaching Certificate</li>
                <li>• Nunavut & Quebec Certifications</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            <p className="text-gray-700 leading-relaxed mb-4">
              I have experience in the school system and can help families navigate the exit from the traditional 
              system while still maintaining opportunities later in post-secondary, if that is what they choose. 
              I have a strong belief in community education and the rights of parents to teach their children 
              what is relevant today and for each individual child.
            </p>
            <p className="text-gray-700 leading-relaxed">
              My journey has taught me that every child learns differently, and my role is to support families 
              in finding the approach that works best for them - whether that's unschooling, structured learning, 
              or anything in between.
            </p>
          </div>

          {/* Experience Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">20+</div>
              <div className="text-sm text-gray-600">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">300+</div>
              <div className="text-sm text-gray-600">Families Supported</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">Since 2004</div>
              <div className="text-sm text-gray-600">Educator</div>
            </div>
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
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Student-Led Learning</h3>
              </div>
              <p className="text-gray-600 text-sm">Unschooling approaches and student-led educational practices that follow natural curiosity and interests</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Support for Exceptionalities</h3>
              </div>
              <p className="text-gray-600 text-sm">Specialized guidance for gifted students and those who struggle in traditional educational settings</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <School className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">High School Support</h3>
              </div>
              <p className="text-gray-600 text-sm">Comprehensive support for high school education, whether pursuing credits or alternative pathways</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Assessment Strategies</h3>
              </div>
              <p className="text-gray-600 text-sm">Educational leadership and innovative assessment approaches tailored to individual learning styles</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Resource Sourcing</h3>
              </div>
              <p className="text-gray-600 text-sm">Expert at finding and recommending resources for students at all levels of skill and development</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Parental Support</h3>
              </div>
              <p className="text-gray-600 text-sm">Comprehensive support for parents in all situations, building confidence in their educational choices</p>
            </div>
          </div>
        </div>
      </section>

      {/* Specializations Summary */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Specializations</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>Resource sourcing for students at all levels of skill and development</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>Supporting students with exceptionalities</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>Educational leadership</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>Assessment strategies</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>Student-led educational practices and support (unschooling)</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-br from-purple-500 to-blue-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Connect with Golda?</h2>
          <p className="text-xl text-purple-100 mb-8">
            Let's explore how I can support your family's unique educational journey
          </p>
          
          <div className="flex justify-center">
            <button
              onClick={handleContactEmail}
              className="inline-flex items-center px-8 py-4 border border-white text-lg font-medium rounded-lg text-purple-600 bg-white hover:bg-gray-50 transition-colors"
            >
              <Mail className="w-5 h-5 mr-2" />
              golda@rtd-connect.com
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FacilitatorProfile1;