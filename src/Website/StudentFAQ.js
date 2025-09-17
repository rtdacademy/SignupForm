import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, Search, ChevronDown, ChevronUp, Calendar, ExternalLink, Clock, ArrowUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import { Alert, AlertDescription } from '../components/ui/alert';
import { websiteConfig, getAllFAQs, getImportantDates } from './websiteConfig';

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
        <div className="text-muted-foreground whitespace-pre-line">
          {highlightText(faq.answer)}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

// Category Card Component
const CategoryCard = ({ category, onClick }) => {
  const config = websiteConfig.categories[category];

  return (
    <Card
      className="cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg h-full"
      onClick={onClick}
      style={{ borderTopColor: config.color, borderTopWidth: '4px' }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{config.icon}</span>
          <CardTitle className="text-lg">{config.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{config.description}</p>
        <div className="mt-3 flex items-center text-sm text-primary">
          <span>View FAQs</span>
          <ChevronDown className="ml-1 h-4 w-4" />
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
  const scrollTopRef = useRef();

  // Get all FAQs for search
  const allFAQs = useMemo(() => getAllFAQs(), []);

  // Get important dates
  const importantDates = useMemo(() => getImportantDates(), []);

  // Filter FAQs based on search and category
  const filteredFAQs = useMemo(() => {
    let faqs = selectedCategory === 'all'
      ? allFAQs
      : allFAQs.filter(faq => faq.categoryKey === selectedCategory);

    if (searchTerm) {
      faqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
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

  const handleBackClick = () => {
    window.location.href = 'https://www.rtdacademy.com/';
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSearchTerm('');
    // Scroll to FAQ section
    document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen">
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
                <span className="hidden sm:inline">Back to Main Site</span>
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
                    className="pl-9 h-9"
                  />
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
                className="pl-10 pr-4 py-6 text-base"
              />
            </div>
          </div>

          {/* Important Dates Alert */}
          <Alert className="mb-8 border-primary/20 bg-primary/5">
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              <strong className="block mb-2">Important Dates for {websiteConfig.dates.currentSchoolYear}</strong>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {importantDates.map((date, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>{date.label}:</strong> {date.date}
                    </span>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>

          {/* Category Cards Grid */}
          {!searchTerm && selectedCategory === 'all' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {Object.keys(websiteConfig.categories).map(categoryKey => (
                <CategoryCard
                  key={categoryKey}
                  category={categoryKey}
                  onClick={() => handleCategorySelect(categoryKey)}
                />
              ))}
            </div>
          )}

          {/* FAQ Section */}
          <div id="faq-section" className="mb-12">
            {(searchTerm || selectedCategory !== 'all') && (
              <>
                {/* Category Tabs for filtering */}
                <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
                  <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-2">
                    <TabsTrigger value="all" className="text-xs sm:text-sm">
                      All
                    </TabsTrigger>
                    {Object.keys(websiteConfig.categories).map(categoryKey => (
                      <TabsTrigger
                        key={categoryKey}
                        value={categoryKey}
                        className="text-xs sm:text-sm"
                      >
                        <span className="hidden sm:inline">{websiteConfig.categories[categoryKey].title}</span>
                        <span className="sm:hidden">{websiteConfig.categories[categoryKey].icon}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                {/* FAQ Results */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>
                        {searchTerm ? 'Search Results' : websiteConfig.categories[selectedCategory]?.title || 'All FAQs'}
                      </span>
                      <Badge variant="secondary">
                        {filteredFAQs.length} {filteredFAQs.length === 1 ? 'Question' : 'Questions'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {filteredFAQs.length > 0 ? (
                      <Accordion type="single" collapsible className="w-full">
                        {filteredFAQs.map((faq, index) => (
                          <FAQItem
                            key={`${faq.categoryKey}-${index}`}
                            faq={faq}
                            searchTerm={searchTerm}
                          />
                        ))}
                      </Accordion>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="mb-2">No FAQs found matching your search.</p>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedCategory('all');
                          }}
                        >
                          Clear Search
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Related Links */}
                {selectedCategory !== 'all' && websiteConfig.relatedLinks[selectedCategory] && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="text-lg">Related Resources</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {websiteConfig.relatedLinks[selectedCategory].map((link, index) => (
                          <a
                            key={index}
                            href={link.url}
                            className="flex items-center gap-2 text-primary hover:underline"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span>{link.text}</span>
                          </a>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* Contact Section */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle>Still Have Questions?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                If you couldn't find the answer you're looking for, our team is here to help.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium mb-1">Email Us</p>
                  <a
                    href={`mailto:${websiteConfig.contact.email}`}
                    className="text-primary hover:underline"
                  >
                    {websiteConfig.contact.email}
                  </a>
                </div>
                <div>
                  <p className="font-medium mb-1">Office Hours</p>
                  <p className="text-sm text-muted-foreground">{websiteConfig.contact.hours}</p>
                </div>
              </div>
            </CardContent>
          </Card>
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