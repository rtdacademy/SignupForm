import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RTDLearningHeader from '../Layout/RTDLearningHeader';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import './styles/animations.css';
import { 
  BookOpen, 
  GraduationCap, 
  Trophy,
  Users,
  Star,
  ChevronRight,
  Clock,
  Calendar,
  MapPin,
  Monitor,
  CheckCircle,
  Award,
  TrendingUp,
  Shield,
  MessageCircle,
  ChevronDown,
  Phone,
  Mail,
  ArrowRight,
  Sparkles,
  Target,
  Zap,
  Heart
} from 'lucide-react';
import PremiumCourseCatalog from './components/PremiumCourseCatalog';

// Hero Section Component
const HeroSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  const testimonials = [
    { name: "Sarah M.", score: "98%", subject: "Math 30-1" },
    { name: "James L.", score: "95%", subject: "Physics 30" },
    { name: "Emily K.", score: "97%", subject: "Chemistry 30" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-5xl mx-auto text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 text-white">
            <Trophy className="h-4 w-4" />
            <span className="text-sm font-medium">Alberta's #1 Diploma Prep Provider</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Your Diploma Success
            <span className="block text-emerald-200">Starts Here</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-emerald-50 mb-8 max-w-3xl mx-auto">
            Join 5,000+ students who achieved their goals with RTD Learning's proven diploma preparation programs.
          </p>

          {/* Success Metrics */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto mb-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">95%</div>
              <div className="text-sm md:text-base text-emerald-100">Pass Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">5,000+</div>
              <div className="text-sm md:text-base text-emerald-100">Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">4.9★</div>
              <div className="text-sm md:text-base text-emerald-100">Rating</div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              className="bg-white text-emerald-700 hover:bg-gray-100 font-bold text-lg px-8 py-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Browse Courses
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white/10 font-bold text-lg px-8 py-6"
            >
              <Calendar className="h-5 w-5 mr-2" />
              View Schedule
            </Button>
          </div>

          {/* Live Success Ticker */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 inline-flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                  {testimonials[currentTestimonial].name[0]}
                </div>
              ))}
            </div>
            <div className="text-sm text-white">
              <span className="font-bold">{testimonials[currentTestimonial].name}</span> just scored{" "}
              <span className="font-bold text-emerald-200">{testimonials[currentTestimonial].score}</span> in{" "}
              {testimonials[currentTestimonial].subject}!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Trust Signals Section
const TrustSignals = () => {
  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Money-Back Guarantee",
      description: "100% refund if you're not satisfied"
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Certified Instructors",
      description: "Learn from Alberta's best educators"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Small Class Sizes",
      description: "Maximum 12 students per session"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Proven Results",
      description: "95% of students improve their grades"
    }
  ];

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg text-emerald-600 mb-3 group-hover:scale-110 transition-transform duration-200">
                {feature.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// How It Works Section
const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Choose Your Course",
      description: "Select from in-person, online, or study materials",
      icon: <BookOpen className="h-6 w-6" />
    },
    {
      number: "02",
      title: "Join Expert Sessions",
      description: "Learn from certified Alberta educators",
      icon: <GraduationCap className="h-6 w-6" />
    },
    {
      number: "03",
      title: "Ace Your Diploma",
      description: "Apply proven strategies and excel in exams",
      icon: <Trophy className="h-6 w-6" />
    }
  ];

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-emerald-100 text-emerald-800 mb-4">Simple Process</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How RTD Learning Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get started in minutes and see results in weeks
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 h-full border border-emerald-100 group-hover:shadow-xl transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl font-bold text-emerald-200">{step.number}</span>
                  <div className="p-3 bg-white rounded-lg shadow-md text-emerald-600">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-emerald-300 z-10">
                  <ChevronRight className="h-8 w-8" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Testimonials Section
const Testimonials = () => {
  const testimonials = [
    {
      name: "Alexandra Chen",
      role: "Math 30-1 Student",
      content: "RTD Learning completely transformed my approach to math. The instructors are phenomenal and truly care about each student's success.",
      rating: 5,
      image: "AC",
      result: "Improved from 65% to 92%"
    },
    {
      name: "Michael Roberts",
      role: "Physics 30 Student",
      content: "The small class sizes and personalized attention made all the difference. I finally understood concepts that seemed impossible before.",
      rating: 5,
      image: "MR",
      result: "Scored 95% on diploma"
    },
    {
      name: "Priya Patel",
      role: "Chemistry 30 Student",
      content: "The online sessions were incredibly convenient and just as effective as in-person. Highly recommend RTD Learning!",
      rating: 5,
      image: "PP",
      result: "Achieved 89% final grade"
    }
  ];

  return (
    <div className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-emerald-100 text-emerald-800 mb-4">Student Success</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Students Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of successful diploma graduates
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold mr-3">
                    {testimonial.image}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
                
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
                
                <div className="bg-emerald-50 rounded-lg px-3 py-2 inline-block">
                  <span className="text-sm font-bold text-emerald-700">
                    <CheckCircle className="h-4 w-4 inline mr-1" />
                    {testimonial.result}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" className="border-emerald-500 text-emerald-600 hover:bg-emerald-50">
            Read More Success Stories
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// FAQ Section
const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);
  
  const faqs = [
    {
      question: "What subjects does RTD Learning offer?",
      answer: "We offer comprehensive diploma preparation for Math 30-1, Math 30-2, Physics 30, Chemistry 30, Biology 30, Science 30, English 30-1, English 30-2, Social Studies 30-1, and Social Studies 30-2."
    },
    {
      question: "What's the difference between in-person and online sessions?",
      answer: "Both formats cover the same curriculum with the same expert instructors. In-person sessions offer face-to-face interaction and hands-on activities, while online sessions provide flexibility and convenience with interactive virtual tools."
    },
    {
      question: "How small are the class sizes?",
      answer: "We maintain a maximum of 12 students per session to ensure personalized attention and optimal learning outcomes. Most classes have 8-10 students."
    },
    {
      question: "Do you offer a money-back guarantee?",
      answer: "Yes! We're confident in our program's effectiveness. If you're not completely satisfied after attending your first two sessions, we'll provide a full refund."
    },
    {
      question: "When do diploma prep sessions start?",
      answer: "We offer multiple start dates throughout the year, with intensive programs before January and June diploma exams. Check our course calendar for upcoming sessions."
    }
  ];

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-emerald-100 text-emerald-800 mb-4">Got Questions?</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                <button
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <ChevronDown 
                    className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" className="border-emerald-500 text-emerald-600 hover:bg-emerald-50">
                <MessageCircle className="h-4 w-4 mr-2" />
                Live Chat
              </Button>
              <Button variant="outline" className="border-emerald-500 text-emerald-600 hover:bg-emerald-50">
                <Phone className="h-4 w-4 mr-2" />
                1-800-RTD-PREP
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// CTA Section
const CTASection = () => {
  return (
    <div className="py-16 bg-gradient-to-r from-emerald-600 to-teal-600">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Excel in Your Diploma?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Join RTD Learning today and get instant access to Alberta's best diploma preparation
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
              <div>
                <Target className="h-8 w-8 mx-auto mb-2" />
                <div className="font-bold">Targeted Prep</div>
              </div>
              <div>
                <Zap className="h-8 w-8 mx-auto mb-2" />
                <div className="font-bold">Quick Results</div>
              </div>
              <div>
                <Heart className="h-8 w-8 mx-auto mb-2" />
                <div className="font-bold">Caring Support</div>
              </div>
              <div>
                <Award className="h-8 w-8 mx-auto mb-2" />
                <div className="font-bold">Proven Success</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-emerald-700 hover:bg-gray-100 font-bold text-lg px-8 py-6 shadow-xl hover:shadow-2xl"
            >
              Start Learning Today
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white/10 font-bold text-lg px-8 py-6"
            >
              <Mail className="h-5 w-5 mr-2" />
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const RTDLearningDashboard = () => {
  const navigate = useNavigate();
  const { 
    currentUser, 
    signOut, 
    isEmulating,
    stopEmulation
  } = useAuth();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      if (isEmulating) {
        stopEmulation();
      } else {
        await signOut();
        navigate('/rtd-learning-login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [signOut, navigate, isEmulating, stopEmulation]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <RTDLearningHeader 
        user={currentUser}
        onLogout={handleLogout}
        profile={{ firstName: 'Guest', lastName: 'User' }}
        onProfileClick={() => setIsProfileOpen(true)}
      />

      {/* Hero Section */}
      <HeroSection />

      {/* Trust Signals */}
      <TrustSignals />

      {/* Course Catalog */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-emerald-100 text-emerald-800 mb-4">Course Catalog</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Path to Success
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Expert-led diploma preparation in multiple formats to suit your learning style
            </p>
          </div>
          
          <PremiumCourseCatalog />
        </div>
      </div>

      {/* How It Works */}
      <HowItWorks />

      {/* Testimonials */}
      <Testimonials />

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">RTD Learning</h3>
              <p className="text-gray-400">
                Alberta's premier diploma preparation provider since 2010.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Courses</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Math 30-1</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sciences</a></li>
                <li><a href="#" className="hover:text-white transition-colors">English</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Social Studies</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Schedule</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Resources</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  1-800-RTD-PREP
                </li>
                <li className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  info@rtdlearning.com
                </li>
                <li className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Calgary, Alberta
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 RTD Learning. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RTDLearningDashboard;