import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight,
  Menu,
  HelpCircle,
  GraduationCap,
  DollarSign,
  FileText,
  Users,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import { FUNDING_RATES } from '../../config/HomeEducation';

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


const FAQPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleHomeClick = () => {
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleAboutClick = () => {
    navigate('/about');
    setIsMenuOpen(false);
  };

  const handleBioClick = () => {
    navigate('/bio');
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

  const faqData = [
    {
      question: "How do I register with RTD-Connect?",
      answer: (
        <div>
          <p className="mb-3">Registration with RTD-Connect is completed by creating a profile at <button onClick={() => navigate('/login')} className="text-purple-600 hover:text-purple-800 underline font-medium">our registration portal</button>. You can complete the entire process online at your own pace.</p>
          <p className="mb-3">We encourage you to connect with your preferred facilitator for assistance and guidance throughout the registration process. They can help ensure you have everything you need and answer any questions you may have.</p>
          <p className="text-sm text-gray-600">Your facilitator will provide valuable ongoing support throughout your home education journey, but the registration itself is completed through our online portal.</p>
        </div>
      ),
      icon: FileText
    },
    {
      question: "What is parent-directed home education?",
      answer: "Parent-directed home education allows families to build personalized learning programs around each child's interests, needs, and goals. Parents (and students) choose resources, programs, and experiences that support meaningful and relevant learning.",
      icon: Users
    },
    {
      question: "Do you support different home education approaches?",
      answer: "Absolutely. Home education is not one-size-fits-all. Whether you lean toward unschooling, classical, Waldorf, Charlotte Mason, Montessori, eclectic, traditional, or something entirely your own - your approach is welcome here. What matters most is that it works for your family. We encourage flexibility and curiosity as you find your rhythm.",
      icon: GraduationCap
    },
    {
      question: "Are RTD-Connect facilitators certified teachers?",
      answer: "Yes. All of our facilitators are Alberta-certified teachers. Many also have experience as home educators themselves, bringing both professional and personal understanding to their work with families.",
      icon: CheckCircle2
    },
    {
      question: "Do you support diverse learners?",
      answer: "Yes, we welcome and support all learners. This includes students with a range of learning needs and neurodivergent profiles (including ADHD, Autism, giftedness, learning disabilities, physical, emotional, and sensory challenges). We encourage open communication so we can offer respectful and relevant support for your family.",
      icon: Users
    },
    {
      question: "Do you provide a curriculum?",
      answer: "Curriculum choices are entirely up to the parent. While we don't prescribe a specific curriculum, we offer guidance, suggestions, and access to optional subscriptions and digital tools that can support your program. Your facilitator can help you find what suits your child's needs.",
      icon: FileText
    },
    {
      question: "Do I need to submit a home education plan?",
      answer: "Yes. All families are required to submit a program plan that outlines your intended learning approach and goals. Our digital platform makes this easy by guiding you through a simple, step-by-step process that can be completed in just minutes when you register. You can update your plan throughout the year as your child's learning evolves, with the same user-friendly interface.",
      icon: Calendar
    },
    {
      question: "Can I get reimbursed for home education purchases?",
      answer: (
        <div>
          <p className="mb-3">Yes. Each child registered in a supervised home education program is eligible for reimbursement of up to:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>{FUNDING_RATES.GRADES_1_TO_12.formatted}/year for Grades 1–12</li>
            <li>{FUNDING_RATES.KINDERGARTEN.formatted}/year for Kindergarten</li>
          </ul>
          <p className="mt-3">(Amounts are set by Alberta Education and remain fixed for the entire school year. Changes, if any, would only apply to the following school year.)</p>
          <p className="mt-3">To qualify, purchases must clearly support your child's learning plan and meet Alberta's home education reimbursement guidelines. Our program makes this easy since your program plan and file uploads are connected, so it's always clear which expenses align with your approved learning goals.</p>
        </div>
      ),
      icon: DollarSign
    },
    {
      question: "How does the reimbursement process work?",
      answer: (
        <div>
          <p className="mb-3">To receive a refund for learning expenses, you'll need to:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Make sure the item or service is included in your Learning Plan.</li>
            <li>Keep your receipt (with proof of payment).</li>
            <li>Upload it to our online submission tool.</li>
          </ul>
          <p className="mt-3">Once approved, the funds will be sent directly to your bank account.</p>
        </div>
      ),
      icon: DollarSign
    },
    {
      question: "Do we have to follow the Alberta Program of Studies?",
      answer: (
        <div>
          <p className="mb-3">No. Families may follow either:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li><strong>The Alberta Program of Studies (APS)</strong> - the same framework used in schools</li>
            <li><strong>The Schedule of Learning Outcomes (SOLO)</strong> - a flexible option outlined in <a href="https://open.alberta.ca/publications/2019_089" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800 underline">Alberta's Home Education Regulation</a></li>
          </ul>
          <p className="mt-3">If your high school student wants to pursue an Alberta diploma, courses must follow the APS and be completed through accredited means. Your facilitator can help navigate the options.</p>
        </div>
      ),
      icon: GraduationCap
    },
    {
      question: "Can my child earn an Alberta High School Diploma?",
      answer: (
        <div>
          <p className="mb-3">Yes. There are multiple pathways to earning a diploma, and your facilitator can guide you through the requirements based on your child's goals.</p>
          <p className="mt-3">That said, a diploma is not required to access post-secondary education. Many colleges, universities, and trade schools offer alternative entry routes, including:</p>
          <ul className="list-disc ml-6 space-y-1 mt-2">
            <li>Mature student status (usually age 19+)</li>
            <li>Open studies or non-program enrollment</li>
            <li>Portfolio-based admissions (especially in arts or design)</li>
            <li>Completion of individual high school courses for credit (online or in-person)</li>
            <li>Alberta's High School Equivalency Diploma (via adult learning centres)</li>
            <li>Direct entry into trades, apprenticeships, or certificate programs</li>
          </ul>
          <p className="mt-3">Homeschooled students often follow unique and flexible pathways. Many post-secondary institutions are increasingly supportive of non-traditional learners. Your facilitator can help you explore the best route for your child's future.</p>
        </div>
      ),
      icon: GraduationCap
    },
    {
      question: "What kinds of extras does RTD-Connect offer?",
      answer: (
        <div>
          <p className="mb-3">We provide access to various learning subscriptions, digital tools, and course materials (subject to availability and yearly changes), including:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>ADLC resources (by request)</li>
            <li>Subscriptions such as IXL, History Plus, LesPlan, Alberta Exambank, and more</li>
            <li>An online community space for sharing ideas and events</li>
          </ul>
          <p className="mt-3">Ask your facilitator for our current list of offerings.</p>
        </div>
      ),
      icon: HelpCircle
    },
    {
      question: "How often do we meet with our facilitator?",
      answer: "There are two required facilitator visits per year - typically in the fall and spring - conducted virtually. These visits are relaxed, conversational, and focused on celebrating learning. In between, your facilitator is available by email, phone, or video chat to support your family.",
      icon: Calendar
    },
    {
      question: "What happens during a facilitator visit?",
      answer: (
        <div>
          <p className="mb-3"><strong>Fall Visit:</strong></p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Collaborate on your learning plan</li>
            <li>Discuss goals, resources, and next steps</li>
            <li>Share early projects, outings, or learning highlights</li>
          </ul>
          <p className="mt-3"><strong>Spring Visit:</strong></p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Students "show and tell" what they've learned and created</li>
            <li>Share work samples, projects, stories, hobbies, photos, or achievements</li>
            <li>Celebrate progress and complete the required year-end report</li>
          </ul>
          <p className="mt-3">These visits are supportive and tailored to your family's comfort level. They're a chance to reflect, connect, and feel proud of the journey.</p>
        </div>
      ),
      icon: Users
    }
  ];

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
                onClick={handleAboutClick}
                className="text-gray-600 hover:text-gray-900 transition-colors"
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
                className="text-purple-600 font-medium"
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
                  onClick={handleAboutClick}
                  className="text-gray-600 hover:text-gray-900 py-2 transition-colors text-left"
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
                  className="text-purple-600 font-medium py-2 text-left"
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
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Frequently Asked 
            <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent block">
              Questions
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Find answers to common questions about home education with RTD-Connect
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Accordion type="single" collapsible className="space-y-4">
            {faqData.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center space-x-3 text-left">
                    {faq.icon && (
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <faq.icon className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <span className="text-lg font-semibold text-gray-900">{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="text-gray-700 leading-relaxed border-t border-gray-100 pt-4">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 sm:py-20 bg-gradient-to-br from-purple-500 to-cyan-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Still Have Questions?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Our facilitators are here to help guide you through every step of your home education journey.
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
              Contact a Facilitator
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

export default FAQPage;