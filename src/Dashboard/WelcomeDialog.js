import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Bookmark } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

const WelcomeDialog = ({ isOpen, onOpenChange }) => {
  const addBookmark = () => {
    if ('sidebar' in window) {
      // For Safari
      window.sidebar.addPanel('RTD Academy Dashboard', 'https://yourway.rtdacademy.com/dashboard', '');
    } else if (window.external && 'AddFavorite' in window.external) {
      // For IE
      window.external.AddFavorite('https://yourway.rtdacademy.com/dashboard', 'RTD Academy Dashboard');
    } else {
      // For modern browsers
      alert('Press ' + (navigator.userAgent.toLowerCase().indexOf('mac') != -1 ? 'Command/Cmd' : 'CTRL') + ' + D to bookmark this page.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2 text-customGreen-dark">
            Welcome to RTD Academy! 🎓
          </DialogTitle>
          <DialogDescription className="pt-2">
            We're excited to have you join us! Here's what you need to know:
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-customGreen-light text-customGreen-dark flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Sign Up for a Course</h4>
                <p className="text-sm text-gray-500">
                  Start by clicking the "Register for a New Course" button above to begin your enrollment process.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-customGreen-light text-customGreen-dark flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Registration Processing</h4>
                <p className="text-sm text-gray-500">
                  After signing up, please allow up to 2 business days for our registrar to process your enrollment and add you to the course.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-customGreen-light text-customGreen-dark flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Access Your Course</h4>
                <p className="text-sm text-gray-500">
                  You'll receive an email with instructions once your enrollment is complete. You can then access your course directly from this dashboard.
                </p>
              </div>
            </div>
          </div>

          <Alert className="mt-6">
            <AlertDescription className="flex items-center justify-between">
              <span className="text-sm">Bookmark this page for quick access</span>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={addBookmark}
              >
                <Bookmark className="w-4 h-4" />
                Add Bookmark
              </Button>
            </AlertDescription>
          </Alert>
        </div>
        <DialogFooter>
          <Button 
            onClick={() => onOpenChange(false)} 
            className="w-full bg-customGreen-dark hover:bg-customGreen-hover text-white"
          >
            Got it, thanks!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeDialog;