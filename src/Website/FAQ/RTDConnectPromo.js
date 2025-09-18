import React from 'react';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ArrowRight, Home, Users, DollarSign, CheckCircle } from 'lucide-react';

// RTD Connect Logo Component
const RTDConnectLogo = () => (
  <div className="flex items-center space-x-3">
    <img
      src="/connectImages/Connect.png"
      alt="RTD Connect Logo"
      className="h-12 w-auto"
    />
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
        RTD Connect
      </h1>
      <p className="text-xs text-muted-foreground">Home Education Program</p>
    </div>
  </div>
);

const RTDConnectPromo = ({ minimal = false }) => {
  const handleVisitSite = () => {
    window.open('https://rtd-connect.com', '_blank', 'noopener,noreferrer');
  };

  if (minimal) {
    // Minimal version for inline display
    return (
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Home className="h-6 w-6 text-purple-600" />
              <div>
                <p className="font-semibold text-purple-900 dark:text-purple-100">
                  Looking for complete home education support?
                </p>
                <p className="text-sm text-muted-foreground">
                  RTD Connect offers facilitator support and up to $1,700/year in reimbursements
                </p>
              </div>
            </div>
            <Button
              onClick={handleVisitSite}
              variant="outline"
              size="sm"
              className="border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              Learn More
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full promotional card
  return (
    <Card className="overflow-hidden border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-950/10 dark:via-blue-950/10 dark:to-cyan-950/10">
      <CardHeader className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b">
        <div className="flex items-start justify-between">
          <RTDConnectLogo />
          <div className="text-xs text-purple-600 font-semibold bg-purple-100 dark:bg-purple-900/50 px-2 py-1 rounded-full">
            Complete Program
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
          Need Complete Home Education Support?
        </h3>
        <p className="text-muted-foreground mb-4">
          While our Distance Education courses are great for supplementing your education,
          RTD Connect is our full home education program with everything you need!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">Certified Teacher Facilitators</p>
              <p className="text-xs text-muted-foreground">Personalized support & guidance</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">Up to $1,700/year</p>
              <p className="text-xs text-muted-foreground">In educational reimbursements</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">All Grades K-12</p>
              <p className="text-xs text-muted-foreground">Complete education journey</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">Digital Platform</p>
              <p className="text-xs text-muted-foreground">Easy plans & portfolio management</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-100/50 dark:bg-purple-900/20 rounded-lg p-4 mb-4">
          <p className="text-sm text-purple-900 dark:text-purple-100">
            <strong>Perfect for families who want:</strong> Full support, flexible learning,
            reimbursements for educational expenses, and a community of home educators.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleVisitSite}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            Visit RTD Connect
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open('https://rtd-connect.com/faq', '_blank', 'noopener,noreferrer')}
            className="flex-1 border-purple-600 text-purple-600 hover:bg-purple-50"
          >
            View Full FAQ
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RTDConnectPromo;