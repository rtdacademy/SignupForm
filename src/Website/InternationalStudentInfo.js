import React, { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ChevronRight, Info, AlertCircle, ArrowLeft, CalendarIcon } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/ui/collapsible";
import { Button } from "../components/ui/button";
import NewUserSignUp from '../Registration/NewUserSignUp';
import YourWayScheduleMaker from '../Schedule/YourWayScheduleMaker';
import { getPricingForStudentType } from '../config/pricingConfig';

// Constants for triangle animation (using blue/teal colors for international theme)
const TRIANGLE_SIZE = 220;
const MOVEMENT_SPEED = 0.2;
const ROTATION_SPEED = 0.001;

// Inline SVG component for RTD Academy Logo
const RTDLogo = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 75 75" 
    className="w-32 h-32"
    role="img"
    aria-label="RTD Academy Logo"
  >
    <g transform="translate(10, 25)">
      <polygon points="40 0 46.5 12 53 24 40 24 27 24 33.5 12 40 0" fill="#4169E1"/>
      <polygon points="53 24 59.5 36 66 48 53 48 40 48 46.5 36 53 24" fill="#E6E6FA"/>
      <polygon points="27 24 33.5 36 40 48 27 48 14 48 20.5 36 27 24" fill="#1E90FF"/>
    </g>
  </svg>
);

// MovingTriangle Component remains the same as in AdultStudentInfo
const MovingTriangle = ({ color, initialX, initialY, initialAngle }) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [angle, setAngle] = useState(initialAngle);
  const [direction, setDirection] = useState({
    x: Math.cos(initialAngle) * MOVEMENT_SPEED,
    y: Math.sin(initialAngle) * MOVEMENT_SPEED
  });
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });
  const requestRef = useRef();

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const updatePosition = () => {
      setPosition(prevPos => {
        let newX = prevPos.x + direction.x;
        let newY = prevPos.y + direction.y;
        let newDirection = { ...direction };

        if (newX <= -TRIANGLE_SIZE || newX >= dimensions.width) {
          newDirection.x = -direction.x;
        }
        if (newY <= -TRIANGLE_SIZE || newY >= dimensions.height) {
          newDirection.y = -direction.y;
        }

        setDirection(newDirection);
        return { x: newX, y: newY };
      });

      setAngle(prevAngle => prevAngle + ROTATION_SPEED);
      requestRef.current = requestAnimationFrame(updatePosition);
    };

    requestRef.current = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(requestRef.current);
  }, [direction, dimensions]);

  const points = `
    ${position.x + TRIANGLE_SIZE / 2},${position.y}
    ${position.x},${position.y + TRIANGLE_SIZE}
    ${position.x + TRIANGLE_SIZE},${position.y + TRIANGLE_SIZE}
  `;

  return (
    <polygon
      points={points}
      fill={color}
      opacity="0.15"
      transform={`rotate(${angle * (180 / Math.PI)} ${position.x + TRIANGLE_SIZE / 2} ${position.y + TRIANGLE_SIZE / 2})`}
    />
  );
};

// AnimatedCard Component for hover animations
const AnimatedCard = ({ children, className = '' }) => {
  return (
    <div className={`group relative overflow-hidden transform transition-all duration-300 hover:scale-[1.02] ${className}`}>
      <div className="relative z-10">{children}</div>
      <div className="absolute inset-0 bg-gradient-to-br from-accent to-background transition-opacity duration-300 group-hover:opacity-100 opacity-0" />
    </div>
  );
};

// FeatureCard Component for individual feature sections
const FeatureCard = ({ title, children, className = '' }) => (
  <AnimatedCard className={`bg-card text-card-foreground rounded-lg shadow-lg p-6 ${className}`}>
    <h3 className="text-xl font-semibold mb-4 flex items-center">
      <ChevronRight className="w-5 h-5 mr-2 text-primary" />
      {title}
    </h3>
    {children}
  </AnimatedCard>
);

// Main InternationalStudentInfo Component
const InternationalStudentInfo = () => {
  // Get pricing data from config
  const pricingData = getPricingForStudentType('internationalStudents');

  const handleBackClick = () => {
    window.location.href = 'https://www.rtdacademy.com/';
  };

  if (!pricingData) {
    return (
      <div className="text-center text-muted-foreground">
        Error loading pricing information. Please try again later.
      </div>
    );
  }

  const {
    trialPeriodDays,
    subscriptionTotal,
    oneTimePrice,
    subscriptionLengthMonths,
    lockoutAfterDays,
    rejoinFee,
    monthlyPayment
  } = pricingData;

  return (
    <div className="relative min-h-screen">
      {/* Background SVG layer */}
      <div className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none">
        <svg width="100%" height="100%" className="absolute top-0 left-0">
          <MovingTriangle
            color="#4169E1"
            initialX={-100}
            initialY={-100}
            initialAngle={Math.random() * Math.PI * 2}
          />
          <MovingTriangle
            color="#1E90FF"
            initialX={typeof window !== 'undefined' ? window.innerWidth / 2 : 0}
            initialY={-150}
            initialAngle={Math.random() * Math.PI * 2}
          />
          <MovingTriangle
            color="#000080"
            initialX={typeof window !== 'undefined' ? window.innerWidth - 200 : 0}
            initialY={-50}
            initialAngle={Math.random() * Math.PI * 2}
          />
        </svg>
      </div>

      {/* Content layer */}
      <div className="relative z-10 max-w-4xl mx-auto p-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground"
          onClick={handleBackClick}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Main Site
        </Button>

        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <RTDLogo />
          </div>
          <h1 className="text-4xl font-bold text-center text-foreground">
            International Student Programs
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Study Alberta Curriculum from Anywhere in the World
          </p>
        </div>

        {/* Modified Tabs Section */}
        <Tabs defaultValue="how-it-works" className="w-full">
          <TabsList className="grid w-full gap-2 mb-8 p-1 pb-16 md:pb-1 bg-muted/50 grid-cols-3 sm:grid-cols-3 md:grid-cols-5">
            <TabsTrigger 
              value="how-it-works"
              className="text-sm sm:text-base data-[state=active]:bg-background"
            >
              How It Works
            </TabsTrigger>
            <TabsTrigger 
              value="courses"
              className="text-sm sm:text-base data-[state=active]:bg-background"
            >
              Our Courses
            </TabsTrigger>
            <TabsTrigger 
              value="assessments"
              className="text-sm sm:text-base data-[state=active]:bg-background"
            >
              Assessments
            </TabsTrigger>
            <TabsTrigger 
              value="plan-your-way"
              className="text-sm sm:text-base data-[state=active]:bg-background col-start-1 col-end-2 sm:col-start-1 md:col-auto"
            >
              <CalendarIcon className="w-4 h-4 text-blue-600" />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold pl-1">
                YourWay
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="get-started"
              className="text-sm sm:text-base bg-[#FF705B] text-white hover:bg-[#FF705B]/90 data-[state=active]:bg-[#FF705B] data-[state=active]:text-white col-start-2 col-end-3 sm:col-start-2 md:col-auto"
            >
              Get Started
            </TabsTrigger>
          </TabsList>

          {/* How It Works Tab Content */}
          <TabsContent value="how-it-works" className="space-y-6">
            <FeatureCard title="International Student Experience" className="bg-gradient-to-br from-muted to-background">
              <p className="mb-2">
                Join our global community of learners and earn an Alberta High School Diploma from anywhere in the world. 
                Start with a {trialPeriodDays}-day trial period to experience our comprehensive online learning system.
              </p>
            </FeatureCard>

            <FeatureCard title="Flexible Payment Options">
              <ul className="list-disc ml-6 space-y-2">
                <li>One-time payment: <span className="font-semibold text-primary">${oneTimePrice}</span></li>
                <li>Monthly payments: <span className="font-semibold text-primary">${monthlyPayment.toFixed(2)}</span> per month for {subscriptionLengthMonths} months (total ${subscriptionTotal})</li>
                <li>International payment methods accepted</li>
                <li>Cancel anytime during the {subscriptionLengthMonths}-month period</li>
              </ul>
            </FeatureCard>

            <FeatureCard title="Study at Your Own Pace" className="bg-gradient-to-br from-muted to-background">
              <ul className="list-disc ml-6 space-y-2">
                <li>Access course materials 24/7 from any time zone</li>
                <li>Create your personalized schedule with our "Your Way Schedule Maker"</li>
                <li>Flexible deadlines to accommodate your local schedule</li>
                <li>If you fall {lockoutAfterDays} days behind, you can create a new schedule once</li>
                <li>Additional schedule resets available for a ${rejoinFee} fee</li>
              </ul>
            </FeatureCard>
          </TabsContent>

          {/* Our Courses Tab Content */}
          <TabsContent value="courses" className="space-y-6">
            <FeatureCard title="Global Learning Environment" className="bg-gradient-to-br from-muted to-background">
              <p className="mb-4">
                Experience Alberta's world-class curriculum through our innovative online platform. 
                Study from anywhere, anytime, with full support from our experienced teachers.
              </p>
            </FeatureCard>

            <FeatureCard title="International Student Support">
              <ul className="list-disc ml-6 space-y-2">
                <li>English language support available</li>
                <li>Course materials accessible across all time zones</li>
                <li>Regular check-ins with Alberta-certified teachers</li>
                <li>Progress tracking and feedback in multiple languages</li>
                <li>Cultural support for international learners</li>
              </ul>
            </FeatureCard>

            <FeatureCard title="Interactive Learning Materials">
              <ul className="list-disc ml-6 space-y-2">
                <li>Engaging video lessons with multilingual captions</li>
                <li>Online homework with instant feedback</li>
                <li>Math courses with randomized practice questions</li>
                <li>Downloadable resources for offline study</li>
              </ul>
            </FeatureCard>
          </TabsContent>

          {/* Assessments Tab Content */}
          <TabsContent value="assessments" className="space-y-6">
            <FeatureCard title="Course Assessments" className="bg-gradient-to-br from-muted to-background">
              <ul className="list-disc ml-6 space-y-2">
                <li>Multiple online assessments with flexible timing for different time zones</li>
                <li>Three comprehensive Section Exams covering 2-3 units each</li>
                <li>24/7 exam scheduling to accommodate international students</li>
                <li>Online proctoring available for remote testing</li>
              </ul>
            </FeatureCard>

            <FeatureCard title="International Diploma Information">
              <ul className="list-disc ml-6 space-y-2">
                <li>Alberta Diploma recognized by universities worldwide</li>
                <li>Diploma exams account for 30% of final grade (where applicable)</li>
                <li>Option to write diploma exams at international test centers</li>
                <li>Support for university applications worldwide</li>
                <li>Note: Additional fees may apply for international exam centers</li>
              </ul>
            </FeatureCard>
          </TabsContent>

          {/* Plan Your Way Tab Content */}
          <TabsContent value="plan-your-way" className="space-y-6 pb-24">
            <YourWayScheduleMaker />
          </TabsContent>

          {/* Get Started Tab Content */}
          <TabsContent value="get-started" className="space-y-6">
            <FeatureCard title="Begin Your International Learning Journey" className="bg-gradient-to-br from-muted to-background">
              <div className="mb-6">
              <p className="text-lg mb-4">
                  Start your international education journey by signing in securely with Google or Microsoft authentication. Create your personalized dashboard to begin.
                </p>

                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Important: Use a personal email address that you'll have long-term access to, not a temporary or school-provided email.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                      <Info className="h-4 w-4 mr-2" />
                      Which email addresses work with Microsoft login?
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 text-sm text-muted-foreground pl-6">
                      Microsoft authentication works with:
                      <ul className="list-disc ml-4 mt-1">
                        <li>@outlook.com</li>
                        <li>@hotmail.com</li>
                        <li>@live.com</li>
                        <li>@msn.com</li>
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                      <Info className="h-4 w-4 mr-2" />
                      What happens after I sign in?
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 text-sm text-muted-foreground pl-6">
                      <ol className="list-decimal ml-4 space-y-1">
                        <li>Sign in creates your secure international student dashboard</li>
                        <li>Access our course catalog and registration system</li>
                        <li>Create your personalized schedule in your time zone</li>
                        <li>Complete secure international payment processing</li>
                        <li>Begin your {trialPeriodDays}-day trial with full course access</li>
                        <li>Connect with our international student support team</li>
                      </ol>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                      <Info className="h-4 w-4 mr-2" />
                      International Student FAQs
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 text-sm text-muted-foreground pl-6">
                      <ul className="list-disc ml-4 space-y-2">
                        <li>We welcome students from all time zones</li>
                        <li>All course materials are available in English</li>
                        <li>Technical support available 24/7</li>
                        <li>International payment methods accepted</li>
                        <li>Alberta diploma recognized by universities worldwide</li>
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </div>
              
              <div className="bg-background rounded-lg shadow-lg">
                <NewUserSignUp />
              </div>
            </FeatureCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InternationalStudentInfo;