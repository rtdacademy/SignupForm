import React, { useRef } from 'react';
import { Card } from "../../../components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../../../components/ui/sheet";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Menu } from "lucide-react";
import StudentInformation from './Components/StudentInformation';
import CurrentProgress from './Components/CurrentProgress';
import AcademicGoals from './Components/AcademicGoals';
import CareerPlanning from './Components/CareerPlanning';
import PersonalDevelopment from './Components/PersonalDevelopment';
import NextSteps from './Components/NextSteps';

const EducationPlan = () => {
  // Create refs for each section
  const studentInfoRef = useRef(null);
  const currentProgressRef = useRef(null);
  const academicGoalsRef = useRef(null);
  const careerPlanningRef = useRef(null);
  const personalDevRef = useRef(null);
  const nextStepsRef = useRef(null);

  // Navigation items with their refs
  const navigationItems = [
    { name: "Student Information", ref: studentInfoRef },
    { name: "Current Progress", ref: currentProgressRef },
    { name: "Academic Goals", ref: academicGoalsRef },
    { name: "Career Planning", ref: careerPlanningRef },
    { name: "Personal Development", ref: personalDevRef },
    { name: "Next Steps", ref: nextStepsRef }
  ];

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header with Navigation Sheet */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Education Plan 2024-25</h1>
          <p className="text-gray-600 mt-2">
            ⚠️ This document contains sample data for demonstration purposes only
          </p>
        </div>
        
        {/* Navigation Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-2">
              {navigationItems.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => scrollToSection(item.ref)}
                >
                  {item.name}
                </Button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Sample Data Warning */}
      <Card className="mb-8 bg-yellow-50 border-yellow-200">
        <div className="p-4">
          <h2 className="font-semibold text-yellow-800 mb-2">Sample Data Notice</h2>
          <p className="text-yellow-700">
            All information displayed in this education plan is sample data for demonstration purposes. 
            Actual student data will be integrated in future updates.
          </p>
        </div>
      </Card>

      {/* Main Content Sections */}
      <div className="space-y-12">
        <div ref={studentInfoRef}>
          <StudentInformation />
        </div>
        
        <div ref={currentProgressRef}>
          <CurrentProgress />
        </div>
        
        <div ref={academicGoalsRef}>
          <AcademicGoals />
        </div>
        
        <div ref={careerPlanningRef}>
          <CareerPlanning />
        </div>
        
        <div ref={personalDevRef}>
          <PersonalDevelopment />
        </div>
        
        <div ref={nextStepsRef}>
          <NextSteps />
        </div>
      </div>
    </div>
  );
};

export default EducationPlan;