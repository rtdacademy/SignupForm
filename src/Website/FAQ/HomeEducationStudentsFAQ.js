import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Clock, Calendar, Home, AlertCircle } from 'lucide-react';
import { websiteConfig } from '../websiteConfig';

const HomeEducationStudentsFAQ = () => {
  const categoryData = websiteConfig.categories.homeEducation;
  const dates = websiteConfig.dates;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <span className="text-5xl">{categoryData.icon}</span>
        </div>
        <h2 className="text-3xl font-bold mb-2">{categoryData.title}</h2>
        <p className="text-muted-foreground">{categoryData.description}</p>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Term 1 Registration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{dates.term1.registrationDeadline}</p>
            <p className="text-xs text-muted-foreground">Same as non-primary</p>
          </CardContent>
        </Card>

        <Card className="border-primary/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-primary">
              <Calendar className="h-4 w-4" />
              Term 2 Registration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-primary">{dates.term2.homeEducationDeadline}</p>
            <p className="text-xs text-muted-foreground">Earlier than non-primary!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Home className="h-4 w-4" />
              Credit Limit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{websiteConfig.credits.maxCreditsPerYear} Credits</p>
            <p className="text-xs text-muted-foreground">Free per school year</p>
          </CardContent>
        </Card>
      </div>

      {/* Important Alert */}
      <Alert className="border-green-500/20 bg-green-50 dark:bg-green-950/20">
        <Home className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertDescription>
          <strong>Key Difference:</strong> Home Education students must register for Term 2 by <strong>{dates.term2.homeEducationDeadline}</strong> (earlier than the {dates.term2.registrationDeadline} deadline for regular non-primary students).
        </AlertDescription>
      </Alert>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {categoryData.faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>
                  <div className="flex items-center gap-2 text-left">
                    <span className="flex-1">{faq.question}</span>
                    {faq.priority === 'high' && (
                      <Badge variant="default" className="ml-2">Important</Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="text-muted-foreground whitespace-pre-line">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Benefits for Home Education */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Benefits for Home Education Families
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mt-0.5">
                <span className="text-xs">✓</span>
              </div>
              <div>
                <p className="font-medium">Flexible Schedule</p>
                <p className="text-sm text-muted-foreground">
                  Asynchronous courses fit perfectly with your home education schedule
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mt-0.5">
                <span className="text-xs">✓</span>
              </div>
              <div>
                <p className="font-medium">Alberta Certified</p>
                <p className="text-sm text-muted-foreground">
                  All courses meet Alberta Education standards
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mt-0.5">
                <span className="text-xs">✓</span>
              </div>
              <div>
                <p className="font-medium">Self-Paced Learning</p>
                <p className="text-sm text-muted-foreground">
                  Work at your own pace within the term timeline
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Registration Timeline Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="font-medium mb-2">Term 1 (Same for all students)</p>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm">Register by: <strong>{dates.term1.registrationDeadline}</strong></p>
                <p className="text-sm">Complete by: <strong>{dates.term1.endDate}</strong></p>
              </div>
            </div>
            <div>
              <p className="font-medium mb-2">Term 2 (Different deadlines)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">Home Education</p>
                  <p className="text-sm">Register by: <strong>{dates.term2.homeEducationDeadline}</strong></p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm font-medium text-muted-foreground">Regular Non-Primary</p>
                  <p className="text-sm">Register by: <strong>{dates.term2.registrationDeadline}</strong></p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomeEducationStudentsFAQ;