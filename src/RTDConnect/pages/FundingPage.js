import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight,
  DollarSign,
  CheckCircle2,
  Calculator,
  FileText,
  Upload,
  Calendar,
  AlertCircle,
  Menu,
  CreditCard,
  Wifi,
  ShoppingCart,
  Book,
  Users,
  Laptop,
  GraduationCap,
  MessageCircle
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../components/ui/sheet";
import { FUNDING_RATES } from '../../config/HomeEducation';
import GoogleAIChatApp from '../../edbotz/GoogleAIChat/GoogleAIChatApp';
import { FUNDING_EXPERT_PROMPT, FUNDING_CHATBOT_CONFIG } from './FundingPrompt';

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

// Step Card Component
const StepCard = ({ number, title, description, icon: Icon }) => (
  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-start space-x-4">
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {number}
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  </div>
);

// Eligible Items Component
const EligibleItemCard = ({ icon: Icon, title, examples }) => (
  <div className="bg-gradient-to-br from-green-50 to-cyan-50 rounded-lg p-4 hover:shadow-md transition-shadow">
    <div className="flex items-start space-x-3">
      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-600">{examples}</p>
      </div>
    </div>
  </div>
);

const FundingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

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

  const handleFAQClick = () => {
    navigate('/faq');
    setIsMenuOpen(false);
  };

  const handleGetStarted = () => {
    navigate('/login');
    setIsMenuOpen(false);
  };

  // Use the comprehensive funding expert prompt from FundingPrompt.js
  const fundingExpertInstructions = FUNDING_EXPERT_PROMPT;

  // Use the predefined initial conversation from config
  const fundingChatHistory = FUNDING_CHATBOT_CONFIG.initialConversation;

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
                onClick={handleFAQClick}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                FAQ
              </button>
              <button
                className="text-purple-600 font-medium"
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
                  onClick={handleFAQClick}
                  className="text-gray-600 hover:text-gray-900 py-2 transition-colors text-left"
                >
                  FAQ
                </button>
                <button
                  className="text-purple-600 font-medium py-2 text-left"
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
              <DollarSign className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Home Education 
            <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent block">
              Funding Overview
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Alberta provides financial support for your home education journey. Learn how to access and maximize your funding.
          </p>
        </div>
      </section>

      {/* Funding Eligibility Chatbot Button */}
      <section className="py-8 bg-gradient-to-r from-purple-50 to-cyan-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sheet open={isChatbotOpen} onOpenChange={setIsChatbotOpen}>
            <SheetTrigger asChild>
              <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:from-purple-600 hover:via-blue-600 hover:to-cyan-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <MessageCircle className="w-6 h-6 mr-3" />
                Ask About Funding Eligibility
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-1/2 sm:max-w-[800px] h-full p-0 flex flex-col">
              <SheetHeader className="p-6 pb-4 border-b border-gray-200 flex-shrink-0">
                <SheetTitle className="text-left flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  Alberta Home Education Funding Assistant
                </SheetTitle>
                <SheetDescription className="text-left">
                  Get instant help determining if your purchases qualify for Alberta home education funding reimbursement.
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 min-h-0 overflow-hidden">
                <GoogleAIChatApp
                  instructions={fundingExpertInstructions}
                  conversationHistory={fundingChatHistory}
                  sessionIdentifier={FUNDING_CHATBOT_CONFIG.sessionConfig.identifier}
                  showUpload={FUNDING_CHATBOT_CONFIG.uiConfig.showUpload}
                  showYouTube={FUNDING_CHATBOT_CONFIG.uiConfig.showYouTube}
                  showHeader={FUNDING_CHATBOT_CONFIG.uiConfig.showHeader}
                  allowContentRemoval={FUNDING_CHATBOT_CONFIG.uiConfig.allowContentRemoval}
                  forceNewSession={FUNDING_CHATBOT_CONFIG.uiConfig.forceNewSession}
                  enabledTools={FUNDING_CHATBOT_CONFIG.enabledTools}
                  aiModel={FUNDING_CHATBOT_CONFIG.aiSettings.model}
                  aiTemperature={FUNDING_CHATBOT_CONFIG.aiSettings.temperature}
                  aiMaxTokens={FUNDING_CHATBOT_CONFIG.aiSettings.maxTokens}
                  placeholderText={FUNDING_CHATBOT_CONFIG.uiConfig.placeholderText}
                />
              </div>
            </SheetContent>
          </Sheet>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Not sure if something qualifies for funding? Chat with our AI assistant for instant guidance on Alberta's home education reimbursement policies.
          </p>
        </div>
      </section>

      {/* Funding Amount Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
            How Much Funding Do I Get?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl p-6 text-white">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Grades 1-12</h3>
              </div>
              <div className="text-4xl font-bold mb-2">{FUNDING_RATES.GRADES_1_TO_12.formatted}</div>
              <p className="text-purple-100">per student, per year</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Kindergarten</h3>
              </div>
              <div className="text-4xl font-bold mb-2">{FUNDING_RATES.KINDERGARTEN.formatted}</div>
              <p className="text-blue-100">per student, per year</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <p className="text-gray-700 text-center">
              This funding supports your child's learning needs at home. You can be reimbursed for eligible educational expenses as long as you follow Alberta's Standards for Home Education Reimbursement.
            </p>
          </div>
        </div>
      </section>

      {/* How to Submit Claims Section */}
      <section className="py-12 sm:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-center">
            How to Submit Learning Claim Requests
          </h2>
          <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Follow these simple steps to get reimbursed for your educational purchases
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StepCard
              number="1"
              title="Review the Guidelines"
              description={
                <span>
                  Before submitting anything, please read through this page and the{" "}
                  <a 
                    href="https://open.alberta.ca/dataset/ff02773f-ba94-4c4d-90e6-7fc82b18a110/resource/cdbded1c-8729-4509-8f91-686b58ddd0ce/download/educ-standards-for-home-education-reimbursement-2023-01.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-800 underline"
                  >
                    Alberta Reimbursement Standards
                  </a>{" "}
                  to understand what's allowed.
                </span>
              }
              icon={FileText}
            />
            
            <StepCard
              number="2"
              title="Check If Your Purchase Is Eligible"
              description={
                <span>
                  Make sure the item or service is clearly connected to your child's home education plan.{" "}
                  <a 
                    href="#eligible-items"
                    className="text-purple-600 hover:text-purple-800 underline"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('eligible-items')?.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                      });
                    }}
                  >
                    See detailed eligibility guidelines below ↓
                  </a>
                </span>
              }
              icon={CheckCircle2}
            />
            
            <StepCard
              number="3"
              title="Collect and Prepare Your Receipts"
              description={
                <div>
                  <p className="mb-2">To qualify, receipts must include:</p>
                  <ul className="list-disc ml-4 space-y-1 text-sm">
                    <li>Purchase date</li>
                    <li>Full vendor/seller name and contact info</li>
                    <li>Proof of payment (e.g., paid stamp or bank statement)</li>
                    <li>For Amazon purchases: use the "Amazon Invoice" (not just order confirmation)</li>
                    <li>A brief note linking the purchase to your child's learning plan</li>
                  </ul>
                </div>
              }
              icon={FileText}
            />
            
            <StepCard
              number="4"
              title="Submit Your Receipts"
              description="Upload proof of purchase through our online submission tool (link coming soon). You can start making purchases for the next school year starting in April of that year."
              icon={Upload}
            />
            
            <StepCard
              number="5"
              title="Reimbursement Schedule"
              description="Funds will be electronically transferred to your bank account starting after November 30th for eligible receipts."
              icon={Calendar}
            />
            
            <StepCard
              number="6"
              title="Final Submission Date"
              description="Final date for submission will be August 31 of the current school year."
              icon={Calendar}
            />
          </div>
        </div>
      </section>

      {/* Eligible Items Section */}
      <section id="eligible-items" className="py-12 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12 text-center">
            What Can I Claim?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <CheckCircle2 className="w-6 h-6 text-green-500 mr-2" />
                Commonly Approved Items
              </h3>
              <div className="space-y-4">
                <EligibleItemCard
                  icon={Book}
                  title="Educational Materials"
                  examples="Books, workbooks, learning materials"
                />
                <EligibleItemCard
                  icon={ShoppingCart}
                  title="Supplies & Kits"
                  examples="Art/craft supplies, science kits, manipulatives"
                />
                <EligibleItemCard
                  icon={Laptop}
                  title="Technology"
                  examples="Laptops, printers, educational software"
                />
                <EligibleItemCard
                  icon={Wifi}
                  title="Online Programs"
                  examples="Reading Eggs, IXL, educational subscriptions"
                />
                <EligibleItemCard
                  icon={Users}
                  title="Classes & Lessons"
                  examples="Music, language, swimming, tutoring (non-household)"
                />
                <EligibleItemCard
                  icon={Calendar}
                  title="Field Trips & Passes"
                  examples="Educational passes (student cost only)"
                />
                <EligibleItemCard
                  icon={Wifi}
                  title="Internet"
                  examples="50% of your internet bill (Sept–Aug)"
                />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
                Not Approved
              </h3>
              <div className="bg-red-50 rounded-lg p-6">
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Clothing, phones, furniture
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Travel, food (unless related to foods program and clearly indicated)
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Pet supplies
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Sports team fees, competitions
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Movie tickets, gaming systems
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Parent resources or teacher guides
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Important Information Section */}
      <section className="py-12 sm:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">
            Important Information
          </h2>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="full-funding" className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center space-x-3 text-left">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calculator className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-gray-900">How Do I Get the Full {FUNDING_RATES.GRADES_1_TO_12.formatted}?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="text-gray-700 leading-relaxed border-t border-gray-100 pt-4">
                  Once 75% of your claimed receipts are approved (e.g., ${(FUNDING_RATES.GRADES_1_TO_12.amount * 0.75).toFixed(2)}), you'll unlock the full funding amount for your child.
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="shared-receipts" className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center space-x-3 text-left">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-gray-900">Shared Receipts for Multiple Children?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="text-gray-700 leading-relaxed border-t border-gray-100 pt-4">
                  Upload the receipt and tag it in each student's profile and specify how much should be claimed per child.
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="foreign-currency" className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center space-x-3 text-left">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-gray-900">Foreign Currency or Online Orders?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="text-gray-700 leading-relaxed border-t border-gray-100 pt-4">
                  If the purchase was made internationally, upload the receipt plus a bank statement showing the exchange/conversion rate.
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="unused-funds" className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center space-x-3 text-left">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-gray-900">Unused Funds?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="text-gray-700 leading-relaxed border-t border-gray-100 pt-4">
                  If you don't plan to use your funding, you can choose to donate it back to support the program (instead of having it return to Alberta Education). A simple form will be provided.
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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

export default FundingPage;