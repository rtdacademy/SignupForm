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
import { Clock, Calendar, Info, AlertCircle } from 'lucide-react';
import { websiteConfig } from '../websiteConfig';

const NonPrimaryStudentsFAQ = () => {
  const categoryData = websiteConfig.categories.nonPrimary;
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
            <p className="text-xs text-muted-foreground">Must register by this date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Term 2 Registration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{dates.term2.registrationDeadline}</p>
            <p className="text-xs text-muted-foreground">For Semester 2 completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="h-4 w-4" />
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
      <Alert className="border-primary/20 bg-primary/5">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Key Requirement:</strong> You must have a primary enrollment with another Alberta school to qualify as a non-primary student. Students in Grades 10-12 only.
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

      {/* Term Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Term Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
              <div className="flex-1">
                <p className="font-medium">Term 1 (September - January)</p>
                <p className="text-sm text-muted-foreground">
                  Register by {dates.term1.registrationDeadline} • End by {dates.term1.endDate}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
              <div className="flex-1">
                <p className="font-medium">Term 2 (February - June)</p>
                <p className="text-sm text-muted-foreground">
                  Register by {dates.term2.registrationDeadline} • End by {dates.term2.endDate}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
              <div className="flex-1">
                <p className="font-medium">Summer School (July - August)</p>
                <p className="text-sm text-muted-foreground">
                  {dates.summerSchool.startDate} to {dates.summerSchool.endDate} • Up to 10 free credits
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NonPrimaryStudentsFAQ;