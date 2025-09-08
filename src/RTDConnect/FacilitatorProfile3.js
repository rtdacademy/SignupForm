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
  Heart,
  Trees,
  Flower2,
  Users,
  Award,
  Ban
} from 'lucide-react';
import { getFacilitatorById } from '../config/facilitators';

const FacilitatorProfile3 = () => {
  const navigate = useNavigate();
  
  // Get Grace-Anne's data from the config
  const facilitatorData = getFacilitatorById('grace-anne-post');
  const isFull = facilitatorData?.isAvailable === false;

  const handleGoBack = () => {
    navigate('/bio');
  };

  const handleContactEmail = () => {
    window.location.href = 'mailto:grace-anne@rtd-connect.com';
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
      <section className="bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <img 
                src="/connectImages/Grace-Anne.jpg" 
                alt="Grace-Anne Post"
                className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Grace-Anne Post</h1>
              <p className="text-xl text-green-600 font-semibold mb-2">K-12 Home Education Teacher/Facilitator</p>
              <p className="text-lg text-gray-600 mb-1">B.Ed, E.C.E</p>
              <p className="text-lg text-gray-600 mb-2">25 years experience</p>
              
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
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 transition-colors"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Email Grace-Anne
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Home Education */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <Heart className="w-8 h-8 text-green-500 mr-3" />
              Why Home Education?
            </h2>
            <p className="text-gray-700 leading-relaxed">
              My journey into home education began over two decades ago when my first son was born. 
              I couldn't imagine returning to the classroom and placing him in daycare - so I dove into 
              every book I could find, inspired by the freedom to learn together at home. That decision 
              led to 20 wonderful years of eclectic, interest-led learning with my two boys, right through 
              to high school graduation. When my youngest completed his final year at home, I knew I wasn't 
              ready to leave this vibrant community - and I've been supporting home educating families ever 
              since as a home education facilitator.
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
              I walk alongside parents as they craft meaningful, personalized educational paths for their 
              children. Whether you're just beginning or well into your homeschooling journey, I offer 
              encouragement, clarity, and practical tools to help you thrive.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-gray-700">Help you build learning plans, set goals, and reflect on growth through student-led projects, passions, and experiences</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-gray-700">Connect families with creative resources and share experiences</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-gray-700">Support families in honouring their children's unique development - because comparison is the thief of joy, and every learner deserves to be seen and celebrated</p>
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
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Education Background</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Diploma in Early Childhood Education - Confederation College (1993)</li>
                <li>• Bachelor of Education - Lakehead University (1996)</li>
                <li>• Minor in Sociology</li>
                <li>• Certified Aromatherapist</li>
                <li>• Family Herbalist</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Teaching Journey</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Daycare centres to public classrooms</li>
                <li>• Kitchen tables to forest trails</li>
                <li>• 20 years homeschooling own children</li>
                <li>• Supporting diverse learners</li>
                <li>• Highly Sensitive Person (HSP) specialist</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            <p className="text-gray-700 leading-relaxed mb-4">
              My career has taken me from daycare centres to public classrooms to kitchen tables and forest trails. 
              I've supported a wide spectrum of learners - from gifted and neurodiverse children to those navigating 
              anxiety, trauma, or exceptionalities such as Down's syndrome and hearing differences.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              As a Highly Sensitive Person (HSP) myself, I have a deep appreciation for sensory needs, emotional 
              intensity, and the importance of gentle, responsive learning environments. I bring both professional 
              training and lived experience as a homeschooling parent, offering grounded, empathetic guidance rooted 
              in child development and brain-based learning.
            </p>
            <p className="text-gray-700 leading-relaxed">
              I love helping families recognize and honour sensitivity as a strength, especially in children who 
              experience the world deeply.
            </p>
          </div>

          {/* Experience Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">25+</div>
              <div className="text-sm text-gray-600">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">20</div>
              <div className="text-sm text-gray-600">Years Homeschooling</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">B.Ed, ECE</div>
              <div className="text-sm text-gray-600">Qualifications</div>
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
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center mr-3">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Eclectic & Interest-Led Learning</h3>
              </div>
              <p className="text-gray-600 text-sm">Crafting personalized educational paths that follow your child's natural curiosity and passions</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center mr-3">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Gifted & Neurodiverse Learners</h3>
              </div>
              <p className="text-gray-600 text-sm">Supporting children with ADHD, dyslexia, giftedness, and other unique learning profiles</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center mr-3">
                  <Flower2 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Highly Sensitive Children</h3>
              </div>
              <p className="text-gray-600 text-sm">Creating gentle, responsive learning environments for children who experience the world deeply</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center mr-3">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Early Childhood Development</h3>
              </div>
              <p className="text-gray-600 text-sm">Grounded expertise in child development and brain-based learning approaches</p>
            </div>
          </div>
        </div>
      </section>

      {/* When I'm Not Facilitating */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <Trees className="w-8 h-8 text-green-500 mr-3" />
              When I'm Not Facilitating...
            </h2>
            <p className="text-gray-700 leading-relaxed">
              You'll find me outdoors - hiking, biking, skiing, skating, or tending my garden. I'm a certified 
              aromatherapist and family herbalist, passionate about holistic wellness and lifelong learning. 
              I also enjoy fitness, cooking, writing, spending time with my family and curling up with a good 
              book or podcast.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What Families Say</h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <Heart className="w-10 h-10 text-green-500 mb-4" />
              <blockquote className="text-lg text-gray-700 mb-4 italic">
                "Thank you again! I always appreciate how encouraged, motivated and appreciated my kids feel 
                after speaking with you. That was the most writing Dylan has ever done on one project because, 
                'it's for Grace-Anne!' Hahaha! You make the visit a very special event for us."
              </blockquote>
              <p className="text-green-600 font-semibold">— Kari</p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <Heart className="w-10 h-10 text-green-500 mb-4" />
              <blockquote className="text-lg text-gray-700 mb-4 italic">
                "I just wanted to say thank you Grace-Anne for your kindness and patience with Zuri. I will 
                never be able to express how much it means to me. Thank you for sharing your personal stories 
                too with her. She takes it in and it means so much to her too. You are amazing and I feel so 
                blessed to have you on this journey of learning with us."
              </blockquote>
              <p className="text-green-600 font-semibold">— Meagan</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-br from-green-500 to-teal-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Connect with Grace-Anne?</h2>
          <p className="text-xl text-green-100 mb-8">
            Let's walk together on your family's unique educational journey
          </p>
          
          <div className="flex justify-center">
            <button
              onClick={handleContactEmail}
              className="inline-flex items-center px-8 py-4 border border-white text-lg font-medium rounded-lg text-green-600 bg-white hover:bg-gray-50 transition-colors"
            >
              <Mail className="w-5 h-5 mr-2" />
              grace-anne@rtdconnect.com
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FacilitatorProfile3;