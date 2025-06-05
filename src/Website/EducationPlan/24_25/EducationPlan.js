import React, { useRef, useState } from 'react';
import { Card } from "../../../components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription, SheetFooter, SheetClose } from "../../../components/ui/sheet";
import { Button } from "../../../components/ui/button";
import { Menu, ChevronRight, ChevronLeft, Bot, LightbulbIcon } from "lucide-react";
import GoogleAIChatPage from '../../../edbotz/GoogleAIChat/GoogleAIChatPage';

// Import required components (to be created)
// Section I: Introduction and Context
import SchoolProfile from './Components/SchoolProfile';
// import ThreeYearProgress from './Components/ThreeYearProgress';

// Current Data Analysis
import CurrentDataAnalysis from './Components/CurrentDataAnalysis';

// Section II: Accountability Statement
import AccountabilityStatement from './Components/AccountabilityStatement';

// Section III: Stakeholder Engagement
import StakeholderEngagement from './Components/StakeholderEngagement';

// Section IV: Vision, Mission, and Values
import FoundationalStatements from './Components/FoundationalStatements';

// Section V: Domain Analysis and Priorities
import StudentGrowthAchievement from './Components/Domains/StudentGrowthAchievement';
import TeachingLeading from './Components/Domains/TeachingLeading';
import LearningSupports from './Components/Domains/LearningSupports';
import AcademicIntegrityInitiative from './Components/Domains/AcademicIntegrityInitiative';
import Governance from './Components/Domains/Governance';
import SocietalContext from './Components/Domains/SocietalContext';

// Section VI: Indigenous Education
import IndigenousEducation from './Components/IndigenousEducation';

// Section VII: Performance Measures
import PerformanceMeasures from './Components/PerformanceMeasures';

// Section VIII: Conclusion
import ConclusionFutureDirection from './Components/ConclusionFutureDirection';

// Supporting Components
// import ComparativeAnalysis from './Components/ComparativeAnalysis';
// import AppendixDocuments from './Components/AppendixDocuments';

const EducationPlan = () => {
  // States for navigation and AI preview
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [isAIPreviewOpen, setIsAIPreviewOpen] = useState(false);

  // Create refs for each major section
  const currentDataRef = useRef(null);
  const schoolProfileRef = useRef(null);
  const accountabilityRef = useRef(null);
  const stakeholderRef = useRef(null);
  const foundationalRef = useRef(null);
  const domainGrowthRef = useRef(null);
  const domainTeachingRef = useRef(null);
  const domainSupportsRef = useRef(null);
  const domainGovernanceRef = useRef(null);
  const domainSocietalRef = useRef(null);
  const indigenousRef = useRef(null);
  const performanceRef = useRef(null);
  const implementationRef = useRef(null);
  const budgetRef = useRef(null);
  const conclusionRef = useRef(null);

  // Navigation structure following Alberta requirements
  const navigationStructure = [
    {
      title: "Accountability",
      items: [
        { name: "Accountability Statement", ref: accountabilityRef }
      ]
    },
    {
      title: "I. Introduction & Context",
      items: [
        { name: "School Profile", ref: schoolProfileRef },
        { name: "Current Year Data Analysis", ref: currentDataRef },
        { name: "Three-Year Progress", ref: schoolProfileRef }
      ]
    },
    {
      title: "II. Stakeholder Engagement",
      items: [
        { name: "Engagement Process", ref: stakeholderRef }
      ]
    },
    {
      title: "III. Foundational Statements",
      items: [
        { name: "Vision, Mission & Values", ref: foundationalRef }
      ]
    },
    {
      title: "IV. Domain Analysis",
      items: [
        { name: "Student Growth & Achievement", ref: domainGrowthRef },
        { name: "Teaching & Leading", ref: domainTeachingRef },
        { name: "Learning Supports", ref: domainSupportsRef },
        { name: "Governance", ref: domainGovernanceRef },
        { name: "Societal Context", ref: domainSocietalRef }
      ]
    },
    {
      title: "V. Indigenous Education",
      items: [
        { name: "FNMI Student Success", ref: indigenousRef }
      ]
    },
    {
      title: "VI. Performance Measures",
      items: [
        { name: "Performance Framework", ref: performanceRef }
      ]
    },
    {
      title: "VII. Conclusion",
      items: [
        { name: "Future Direction", ref: conclusionRef }
      ]
    }
  ];

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  
  // Expose function to open AI preview to window for access from other components
  React.useEffect(() => {
    window.openAIPreview = () => setIsAIPreviewOpen(true);
    return () => {
      window.openAIPreview = undefined;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 md:pl-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">RTD Academy Education Plan 2023-2026</h1>
          <p className="text-gray-600 mt-2">Third Year of Three-Year Plan</p>
        </div>
        
        <div>
          {/* Mobile Navigation Trigger - Only visible on small screens */}
          <div className="md:hidden">
            <Button variant="outline" size="icon" onClick={() => setIsSheetOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Fixed side navigation */}
        <div className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ${isSheetExpanded ? 'w-[400px]' : 'w-[50px]'} bg-white shadow-lg flex`}>
          {/* Toggle button */}
          <div className="absolute top-20 right-0 translate-x-full">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-r-md rounded-l-none h-10 shadow-md"
              onClick={() => setIsSheetExpanded(!isSheetExpanded)}
            >
              {isSheetExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
          
          {/* Collapsed state - Just shows icons */}
          {!isSheetExpanded && (
            <div className="w-full p-2 overflow-y-auto scrollbar-thin flex flex-col items-center pt-16 space-y-6">
              {navigationStructure.map((section, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  title={section.title}
                  onClick={() => scrollToSection(section.items[0].ref)}
                >
                  <span className="text-xs font-semibold">
                    {section.title.includes('.') ? section.title.split('.')[0] : (section.title === "Accountability" ? "A" : "")}
                  </span>
                </Button>
              ))}
            </div>
          )}
          
          {/* Expanded state - Shows full navigation */}
          {isSheetExpanded && (
            <div className="w-full p-6 overflow-y-auto pt-16 space-y-6">
              <h2 className="text-lg font-bold mb-4">Education Plan Navigation</h2>
              {navigationStructure.map((section) => (
                <div key={section.title}>
                  <h3 className="font-semibold text-sm text-gray-600 mb-2">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <Button
                        key={item.name}
                        variant="ghost"
                        className="w-full justify-start text-sm"
                        onClick={() => {
                          scrollToSection(item.ref);
                          setIsSheetExpanded(false);
                        }}
                      >
                        {item.name}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Responsive Sheet for mobile only */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="w-full sm:w-[400px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Education Plan Navigation</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-6">
              {navigationStructure.map((section) => (
                <div key={section.title}>
                  <h3 className="font-semibold text-sm text-gray-600 mb-2">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <Button
                        key={item.name}
                        variant="ghost"
                        className="w-full justify-start text-sm"
                        onClick={() => {
                          scrollToSection(item.ref);
                          setIsSheetOpen(false);
                        }}
                      >
                        {item.name}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Cover Page */}
      <Card className="mb-8">
        <div className="p-12 text-center">
          <h1 className="text-4xl font-bold mb-4">
            RTD Academy
          </h1>
          <h2 className="text-2xl font-semibold mb-6">
            Education Plan 2023-2026
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Third Year of Three-Year Education Plan
          </p>
        
        </div>
      </Card>
      
      {/* AI Preview Sheet */}
      <Sheet open={isAIPreviewOpen} onOpenChange={setIsAIPreviewOpen}>
        <SheetContent className="w-full md:max-w-[800px] h-full p-0 overflow-hidden" side="right">
          <div className="h-full">
            <GoogleAIChatPage />
          </div>
          
          <div className="absolute top-4 right-4 z-10">
            <SheetClose asChild>
              <Button size="sm" variant="outline" className="h-8 px-2 bg-white/80 backdrop-blur-sm">
                Close
              </Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content Sections */}
      <div className="space-y-12">
        {/* Accountability Statement - First after cover page */}
        <div ref={accountabilityRef}>
          <AccountabilityStatement />
        </div>

        {/* Section I: Introduction and Context */}
        <div ref={schoolProfileRef}>
          <SchoolProfile />
        </div>

        {/* Current Data Analysis */}
        <div ref={currentDataRef}>
          <CurrentDataAnalysis />
        </div>

        {/* Section II: Stakeholder Engagement */}
        <div ref={stakeholderRef}>
          <StakeholderEngagement />
        </div>

        {/* Section III: Vision, Mission, Values */}
        <div ref={foundationalRef}>
          <FoundationalStatements />
        </div>

        {/* Section IV: Domain Analysis */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">IV. Domain Analysis and Priorities</h2>
          
          <div ref={domainGrowthRef}>
            <StudentGrowthAchievement />
          </div>

          <div ref={domainTeachingRef}>
            <TeachingLeading />
          </div>

          <div ref={domainSupportsRef}>
            <LearningSupports />
          </div>
          
          <div>
            <AcademicIntegrityInitiative />
          </div>

          <div ref={domainGovernanceRef}>
            <Governance />
          </div>

          <div ref={domainSocietalRef}>
            <SocietalContext />
          </div>
        </div>

        {/* Section V: Indigenous Education */}
        <div ref={indigenousRef}>
          <IndigenousEducation />
        </div>

        {/* Section VI: Performance Measures */}
        <div ref={performanceRef}>
          <PerformanceMeasures />
        </div>

        {/* Section VII: Conclusion */}
        <div ref={conclusionRef}>
          <ConclusionFutureDirection />
        </div>
      </div>

    </div>
  );
};

export default EducationPlan;