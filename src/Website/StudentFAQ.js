import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, ArrowRight, Search, ChevronDown, ChevronUp, Clock, ArrowUp, GraduationCap, Home, Sun, UserCheck, Globe, Info, HelpCircle, Sparkles, CheckCircle, X, Link2, Check, BookOpen, AlertTriangle, ClipboardCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import ReactMarkdown from 'react-markdown';
import { websiteConfig, getAllFAQs, getVisibleCategories } from './websiteConfig';
import { isLabourDisruptionActive } from '../config/calendarConfig';
import StudentTypeSelector from '../Registration/StudentTypeSelector';
import SchoolAgeCalculator from './components/SchoolAgeCalculator';
import { Calculator } from 'lucide-react';

// Constants for triangle animation - matching AdultStudentInfo
const TRIANGLE_SIZE = 220;
const MOVEMENT_SPEED = 0.2;
const ROTATION_SPEED = 0.001;

// Inline SVG component for RTD Academy Logo
const RTDLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 75 75"
    className="w-24 h-24 md:w-32 md:h-32"
    role="img"
    aria-label="RTD Academy Logo"
  >
    <g transform="translate(10, 25)">
      <polygon points="40 0 46.5 12 53 24 40 24 27 24 33.5 12 40 0" fill="#008B8B"/>
      <polygon points="53 24 59.5 36 66 48 53 48 40 48 46.5 36 53 24" fill="#E0FFFF"/>
      <polygon points="27 24 33.5 36 40 48 27 48 14 48 20.5 36 27 24" fill="#20B2AA"/>
    </g>
  </svg>
);

// MovingTriangle Component for animated background
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

// FAQ Item Component
const FAQItem = ({ faq, isOpen, onToggle, searchTerm }) => {
  // Highlight search terms in text
  const highlightText = (text) => {
    if (!searchTerm) return text;

    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ?
        <span key={index} className="bg-yellow-200 dark:bg-yellow-800">{part}</span> :
        part
    );
  };

  return (
    <AccordionItem value={faq.question} className="border rounded-lg mb-3">
      <AccordionTrigger className="hover:no-underline px-4 py-3">
        <div className="flex items-start gap-3 text-left w-full">
          <div className="flex-1">
            <p className="font-medium text-foreground">
              {highlightText(faq.question)}
            </p>
          </div>
          {faq.priority === 'high' && (
            <Badge className="ml-2" variant="default">Important</Badge>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="text-muted-foreground prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown
            components={{
              p: ({children}) => <p className="mb-2">{children}</p>,
              strong: ({children}) => <strong className="font-semibold text-foreground">{children}</strong>,
              ul: ({children}) => <ul className="list-disc list-inside space-y-1 ml-2">{children}</ul>,
              li: ({children}) => <li className="text-muted-foreground">{children}</li>,
              a: ({children, href}) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  {children}
                </a>
              )
            }}
          >
            {faq.answer}
          </ReactMarkdown>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

// Icon mapping for categories
const iconMap = {
  BookOpen: BookOpen,
  GraduationCap: GraduationCap,
  Home: Home,
  Sun: Sun,
  UserCheck: UserCheck,
  Globe: Globe,
  Info: Info,
  ClipboardCheck: ClipboardCheck
};

// Category Card Component
const CategoryCard = ({ category, onClick }) => {
  const config = websiteConfig.categories[category];
  const IconComponent = iconMap[config.icon] || GraduationCap;

  // Handle external link categories
  const handleClick = () => {
    if (config.isExternalLink && config.externalUrl) {
      window.open(config.externalUrl, '_blank', 'noopener,noreferrer');
    } else {
      onClick();
    }
  };

  // Special handling for RTD Connect to show logo
  const isRTDConnect = category === 'rtdConnect';

  // Check if this is the teacher strike category and disruption is active
  const isTeacherStrike = category === 'teacherStrike';
  const isDisruptionActive = isLabourDisruptionActive();
  const shouldHighlight = isTeacherStrike && isDisruptionActive;

  return (
    <Card
      className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] h-full ${
        shouldHighlight
          ? 'hover:shadow-2xl ring-2 ring-blue-400/50 shadow-lg shadow-blue-200/50 dark:shadow-blue-900/50 animate-pulse-subtle'
          : 'hover:shadow-lg'
      }`}
      onClick={handleClick}
      style={{ borderTopColor: config.color, borderTopWidth: '4px' }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          {isRTDConnect ? (
            <img
              src="/connectImages/Connect.png"
              alt="RTD Connect Logo"
              className="h-8 w-8 object-contain"
            />
          ) : (
            <IconComponent className="h-8 w-8" style={{ color: config.color }} />
          )}
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {config.title}
              {shouldHighlight && (
                <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{config.description}</p>
        <div className="mt-3 flex items-center text-sm text-primary">
          <span>{config.isExternalLink ? 'Visit Website' : 'View FAQs'}</span>
          {config.isExternalLink ? (
            <ArrowRight className="ml-1 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-1 h-4 w-4" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Main StudentFAQ Component
const StudentFAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [determinedStudentType, setDeterminedStudentType] = useState('');
  const [guideOpen, setGuideOpen] = useState('');
  const [calculatorOpen, setCalculatorOpen] = useState('');
  const [copiedCategory, setCopiedCategory] = useState('');
  const [highlightedSection, setHighlightedSection] = useState('');
  const [showLabourDisruptionModal, setShowLabourDisruptionModal] = useState(false);
  const scrollTopRef = useRef();

  // Get all FAQs for search
  const allFAQs = useMemo(() => getAllFAQs(), []);

  // Filter FAQs based on search and category with improved search
  const filteredFAQs = useMemo(() => {
    let faqs = selectedCategory === 'all'
      ? allFAQs
      : allFAQs.filter(faq => faq.categoryKey === selectedCategory);

    if (searchTerm && searchTerm.trim()) {
      // Normalize search term: lowercase and trim
      const normalizedSearch = searchTerm.toLowerCase().trim();

      faqs = faqs.filter(faq => {
        const questionLower = faq.question.toLowerCase();
        const answerLower = faq.answer.toLowerCase();
        const categoryLower = faq.category ? faq.category.toLowerCase() : '';

        // First check if the entire search phrase appears as-is (best match)
        const exactPhraseMatch =
          questionLower.includes(normalizedSearch) ||
          answerLower.includes(normalizedSearch) ||
          categoryLower.includes(normalizedSearch);

        if (exactPhraseMatch) return true;

        // For multi-word searches, check if the words appear in sequence
        // This is more forgiving than requiring ALL words but less loose than OR
        const searchWords = normalizedSearch.split(/\s+/).filter(word => word.length > 1);

        if (searchWords.length > 1) {
          // Check if most of the important words match (ignore very short words)
          const significantWords = searchWords.filter(word => word.length > 2);

          if (significantWords.length > 0) {
            // Count how many significant words match
            const matchCount = significantWords.filter(word =>
              questionLower.includes(word) ||
              answerLower.includes(word) ||
              categoryLower.includes(word)
            ).length;

            // Return true if at least 60% of significant words match
            return matchCount >= Math.ceil(significantWords.length * 0.6);
          } else {
            // If all words are short, check if any match
            return searchWords.some(word =>
              questionLower.includes(word) ||
              answerLower.includes(word) ||
              categoryLower.includes(word)
            );
          }
        }

        return false;
      });

      // Sort results - prioritize question matches over answer matches
      faqs.sort((a, b) => {
        const searchInQuestionA = a.question.toLowerCase().includes(normalizedSearch);
        const searchInQuestionB = b.question.toLowerCase().includes(normalizedSearch);

        // If search term is in question A but not B, A comes first
        if (searchInQuestionA && !searchInQuestionB) return -1;
        if (!searchInQuestionA && searchInQuestionB) return 1;

        // Otherwise maintain original order
        return 0;
      });
    }

    return faqs;
  }, [searchTerm, selectedCategory, allFAQs]);

  // Handle scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle URL hash navigation
  useEffect(() => {
    const handleHashNavigation = () => {
      const hash = window.location.hash.slice(1); // Remove #

      // Check for special accordion sections
      if (hash === 'student-type-guide') {
        setSearchTerm('');
        setTimeout(() => {
          const element = document.getElementById('student-type-guide');
          if (element) {
            const offset = 100;
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });

            // Open the accordion
            setGuideOpen('guide');
          }
        }, 300);
      } else if (hash === 'age-calculator') {
        setSearchTerm('');
        setTimeout(() => {
          const element = document.getElementById('age-calculator');
          if (element) {
            const offset = 100;
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });

            // Open the accordion
            setCalculatorOpen('calculator');
          }
        }, 300);
      } else if (hash && document.getElementById(`category-${hash}`)) {
        // Clear search when navigating via hash
        setSearchTerm('');

        setTimeout(() => {
          const element = document.getElementById(`category-${hash}`);
          if (element) {
            const offset = 100;
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });

            // Highlight the section briefly
            setHighlightedSection(hash);
            setTimeout(() => setHighlightedSection(''), 2000);
          }
        }, 300); // Wait for collapse animation if search was active
      }
    };

    // Handle initial load
    handleHashNavigation();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashNavigation);
    return () => window.removeEventListener('hashchange', handleHashNavigation);
  }, []);

  // Check for labour disruption modal on mount
  useEffect(() => {
    const MODAL_VERSION = 'v1';
    const STORAGE_KEY = `rtd_labourDisruption_notice_${MODAL_VERSION}`;

    // Check if labour disruption is active
    if (isLabourDisruptionActive()) {
      // Check if user has already dismissed this version
      const dismissed = localStorage.getItem(STORAGE_KEY);

      if (!dismissed) {
        // Show modal after a brief delay for better UX
        setTimeout(() => {
          setShowLabourDisruptionModal(true);
        }, 500);
      }
    } else {
      // Clean up localStorage if disruption is no longer active
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('rtd_labourDisruption_notice_')) {
          localStorage.removeItem(key);
        }
      });
    }
  }, []);

  const handleBackClick = () => {
    window.location.href = '/';
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseLabourDisruptionModal = () => {
    const MODAL_VERSION = 'v1';
    const STORAGE_KEY = `rtd_labourDisruption_notice_${MODAL_VERSION}`;

    // Save dismissal to localStorage
    localStorage.setItem(STORAGE_KEY, 'true');

    // Close modal
    setShowLabourDisruptionModal(false);
  };

  const handleLearnMoreLabourDisruption = () => {
    const MODAL_VERSION = 'v1';
    const STORAGE_KEY = `rtd_labourDisruption_notice_${MODAL_VERSION}`;

    // Save dismissal to localStorage
    localStorage.setItem(STORAGE_KEY, 'true');

    // Close modal
    setShowLabourDisruptionModal(false);

    // Navigate to teacherStrike section
    window.location.hash = 'teacherStrike';

    // Scroll to section with offset
    setTimeout(() => {
      const element = document.getElementById('category-teacherStrike');
      if (element) {
        const offset = 100;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Highlight the section
        setHighlightedSection('teacherStrike');
        setTimeout(() => setHighlightedSection(''), 3000);
      }
    }, 300);
  };

  const copyLinkToSection = (categoryKey, event) => {
    if (event) {
      event.stopPropagation();
    }

    const baseUrl = window.location.origin;
    const link = `${baseUrl}/student-faq#${categoryKey}`;

    navigator.clipboard.writeText(link).then(() => {
      setCopiedCategory(categoryKey);
      setTimeout(() => setCopiedCategory(''), 2000);
    });
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSearchTerm('');

    // Update URL hash for bookmarking/sharing
    window.history.pushState(null, '', `#${category}`);

    // Scroll to the specific category section with offset
    setTimeout(() => {
      const element = document.getElementById(`category-${category}`);
      if (element) {
        const offset = 100; // Pixels to show above the element
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Add highlight effect
        setHighlightedSection(category);
        setTimeout(() => setHighlightedSection(''), 2000);
      }
    }, 100);
  };

  const handleStudentTypeSelection = (type) => {
    setDeterminedStudentType(type);
    // Map student type to category key and scroll after a brief delay
    setTimeout(() => {
      const categoryMap = {
        'Non-Primary': 'nonPrimary',
        'Home Education': 'homeEducation',
        'Summer School': 'summerStudents',
        'Adult Student': 'adultStudents',
        'International Student': 'internationalStudents'
      };
      const categoryKey = categoryMap[type];
      if (categoryKey) {
        // Close the accordion
        setGuideOpen('');
        // Scroll to the category
        handleCategorySelect(categoryKey);
      }
    }, 1500);
  };

  const handleStartOver = () => {
    setDeterminedStudentType('');
  };

  return (
    <div className="relative min-h-screen">
      {/* Labour Disruption Modal */}
      <Dialog open={showLabourDisruptionModal} onOpenChange={setShowLabourDisruptionModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                <AlertTriangle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <DialogTitle className="text-xl">Important Policy Update</DialogTitle>
            </div>
            <DialogDescription className="text-base space-y-3 pt-2">
              <p className="font-semibold text-foreground">
                Temporary changes are now in effect for Non-Primary students due to the teacher strike:
              </p>
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm"><strong>No September Count Deadline:</strong> Register for Term 1 anytime or choose a later end date</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm"><strong>No 10-Credit Cap:</strong> Take unlimited courses!</p>
                </div>
              </div>
            
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleCloseLabourDisruptionModal}
              className="w-full sm:w-auto"
            >
              Got it
            </Button>
            <Button
              onClick={handleLearnMoreLabourDisruption}
              className="w-full sm:w-auto gap-2"
            >
              Learn More
              <ArrowRight className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Background SVG layer */}
      <div className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none">
        <svg width="100%" height="100%" className="absolute top-0 left-0">
          <MovingTriangle
            color="#49a3a6"
            initialX={-100}
            initialY={-100}
            initialAngle={Math.random() * Math.PI * 2}
          />
          <MovingTriangle
            color="#b1dbda"
            initialX={typeof window !== 'undefined' ? window.innerWidth / 2 : 0}
            initialY={-150}
            initialAngle={Math.random() * Math.PI * 2}
          />
          <MovingTriangle
            color="#0d8081"
            initialX={typeof window !== 'undefined' ? window.innerWidth - 200 : 0}
            initialY={-50}
            initialAngle={Math.random() * Math.PI * 2}
          />
        </svg>
      </div>

      {/* Content layer */}
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-background/95 backdrop-blur-sm border-b sticky top-0 z-20">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                className="flex items-center gap-2"
                onClick={handleBackClick}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>

              {/* Mobile search bar */}
              <div className="flex-1 max-w-xs ml-4 sm:hidden">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-9 ${searchTerm ? 'pr-10' : 'pr-3'} h-9`}
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Logo and Title */}
          <div className="flex flex-col items-center mb-8">
            <div className="mb-4">
              <RTDLogo />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-2">
              Student FAQ Center
            </h1>
            <p className="text-center text-muted-foreground max-w-2xl">
              Find answers to common questions about enrollment, terms, and requirements
            </p>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden sm:block max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search all FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 ${searchTerm ? 'pr-12' : 'pr-4'} py-6 text-base`}
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Category Cards Grid - Collapses when searching */}
          <div className={`
            overflow-hidden transform-gpu
            transition-all duration-500 ease-in-out
            ${searchTerm
              ? 'max-h-0 opacity-0 scale-95 mb-0'
              : 'max-h-[2000px] opacity-100 scale-100 mb-8'}
          `}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(getVisibleCategories()).map(categoryKey => (
                <CategoryCard
                  key={categoryKey}
                  category={categoryKey}
                  onClick={() => handleCategorySelect(categoryKey)}
                />
              ))}
            </div>
          </div>

          {/* Student Type Guide Accordion - Collapses when searching */}
          <div id="student-type-guide" className={`
            overflow-hidden transform-gpu
            transition-all duration-500 ease-in-out delay-75
            ${searchTerm
              ? 'max-h-0 opacity-0 scale-95 mb-0'
              : 'max-h-[600px] opacity-100 scale-100 mb-8'}
          `}>
            <Card className="border border-border">
              <Accordion type="single" collapsible value={guideOpen} onValueChange={setGuideOpen}>
                <AccordionItem value="guide" className="border-0">
                  <AccordionTrigger className="hover:no-underline px-6 py-4">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-full bg-muted">
                          <HelpCircle className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="text-left flex-1">
                          <h3 className="font-semibold text-base mb-1">Need help determining your student type?</h3>
                          <p className="text-sm text-muted-foreground">
                            Answer a few quick questions to find the right category for you
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyLinkToSection('student-type-guide', e);
                          }}
                          className="h-8 w-8 p-0"
                          title="Copy link to this section"
                        >
                          {copiedCategory === 'student-type-guide' ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Link2 className="h-4 w-4" />
                          )}
                        </Button>
                        <div className="flex items-center gap-1 text-xs font-medium text-primary ml-2">
                          <Sparkles className="h-3 w-3" />
                          <span>Interactive</span>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    {!determinedStudentType ? (
                      <div className="mt-4">
                        <StudentTypeSelector
                          onStudentTypeSelect={handleStudentTypeSelection}
                          selectedType={determinedStudentType}
                          isFormComponent={false}
                        />
                      </div>
                    ) : (
                      <div className="mt-4 space-y-4">
                        <Alert className="border-green-200 bg-green-50">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-800">
                            <strong>Great!</strong> You've been identified as a <strong>{determinedStudentType}</strong>.
                            The page will scroll to your category section shortly.
                          </AlertDescription>
                        </Alert>
                        <Button
                          onClick={handleStartOver}
                          variant="outline"
                          className="w-full"
                        >
                          Start Over - Choose Different Type
                        </Button>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          </div>

          {/* School Age Calculator Accordion - Collapses when searching */}
          <div id="age-calculator" className={`
            overflow-hidden transform-gpu
            transition-all duration-500 ease-in-out delay-100
            ${searchTerm
              ? 'max-h-0 opacity-0 scale-95 mb-0'
              : 'max-h-[600px] opacity-100 scale-100 mb-8'}
          `}>
            <Card className="border border-border">
              <Accordion type="single" collapsible value={calculatorOpen} onValueChange={setCalculatorOpen}>
                <AccordionItem value="calculator" className="border-0">
                  <AccordionTrigger className="hover:no-underline px-6 py-4">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-full bg-muted">
                          <Calculator className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="text-left flex-1">
                          <h3 className="font-semibold text-base mb-1">Am I a School-Aged Student?</h3>
                          <p className="text-sm text-muted-foreground">
                            Check if you qualify as a school-aged student for funding purposes
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyLinkToSection('age-calculator', e);
                          }}
                          className="h-8 w-8 p-0"
                          title="Copy link to this section"
                        >
                          {copiedCategory === 'age-calculator' ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Link2 className="h-4 w-4" />
                          )}
                        </Button>
                        <div className="flex items-center gap-1 text-xs font-medium text-primary ml-2">
                          <Sparkles className="h-3 w-3" />
                          <span>Calculator</span>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="mt-4">
                      <SchoolAgeCalculator />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          </div>

          {/* FAQ Sections - Display by category or search results */}
          <div className="space-y-8">
            {searchTerm ? (
              // Search Results - Animated entrance
              <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Search Results</h2>
                  <Badge variant="secondary" className="text-sm">
                    {filteredFAQs.length} {filteredFAQs.length === 1 ? 'Result' : 'Results'}
                  </Badge>
                </div>
                {filteredFAQs.length > 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <Accordion type="single" collapsible className="w-full">
                        {filteredFAQs.map((faq, index) => (
                          <FAQItem
                            key={`${faq.categoryKey}-${index}`}
                            faq={faq}
                            searchTerm={searchTerm}
                          />
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="mb-4 text-lg">No FAQs found matching "{searchTerm}"</p>
                        <p className="mb-4 text-sm">Try different keywords or browse categories below</p>
                        <Button
                          variant="outline"
                          onClick={() => setSearchTerm('')}
                          className="gap-2"
                        >
                          <X className="h-4 w-4" />
                          Clear Search
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              // Category Sections
              Object.keys(getVisibleCategories()).map(categoryKey => {
                const visibleCategories = getVisibleCategories();
                const category = visibleCategories[categoryKey];
                const IconComponent = iconMap[category.icon] || GraduationCap;

                // Skip rendering RTD Connect in the FAQ sections since it's an external link
                if (category.isExternalLink) {
                  return null;
                }

                return (
                  <Card
                    key={categoryKey}
                    id={`category-${categoryKey}`}
                    className={`
                      transition-all duration-500
                      ${highlightedSection === categoryKey
                        ? 'ring-2 ring-primary ring-offset-2'
                        : ''}
                    `}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-3">
                            <IconComponent className="h-6 w-6" style={{ color: category.color }} />
                            <span>{category.title}</span>
                            <Badge variant="secondary" className="ml-auto">
                              {category.faqs.length} {category.faqs.length === 1 ? 'Question' : 'Questions'}
                            </Badge>
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-2">
                            {category.description}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => copyLinkToSection(categoryKey, e)}
                          className="ml-2 h-8 w-8 p-0"
                          title="Copy link to this section"
                        >
                          {copiedCategory === categoryKey ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Link2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {category.faqs.map((faq, index) => (
                          <FAQItem
                            key={`${categoryKey}-${index}`}
                            faq={faq}
                            searchTerm={searchTerm}
                          />
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 rounded-full h-12 w-12 p-0 shadow-lg z-30"
          size="icon"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default StudentFAQ;