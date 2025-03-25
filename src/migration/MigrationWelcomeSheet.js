import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '../components/ui/sheet';
import { ScrollArea } from '../components/ui/scroll-area';
import { Button } from '../components/ui/button';
import { AlertCircle, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { getDatabase, ref, set } from 'firebase/database';

const MigrationWelcomeSheet = ({ isOpen, onOpenChange, currentUser }) => {
  const handleDismiss = async () => {
    if (currentUser?.uid) {
      const db = getDatabase();
      await set(ref(db, `users/${currentUser.uid}/readMigrationMessage`), true);
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-screen border-t-0 pt-0"
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="py-6">
            <SheetTitle className="text-2xl flex items-center gap-2 text-primary">
              Welcome to Your New Student Portal! 🎓
            </SheetTitle>
            <SheetDescription className="text-base">
              We're excited to introduce you to your upgraded student portal. Here's what you need to know:
            </SheetDescription>
          </SheetHeader>
          
          <ScrollArea className="flex-1 px-1">
            <div className="space-y-6 pb-24"> {/* Added padding bottom to ensure content isn't hidden behind button */}
              {/* Course Access Section */}
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <AlertDescription className="ml-2">
                  <span className="font-medium text-blue-800">Looking for your course?</span>
                  <p className="mt-1 text-blue-700">
                    If you used the same email address you've been using with us, you should see your course listed below. 
                    If you don't see your course, please sign out and try logging in with your other email address.
                  </p>
                </AlertDescription>
              </Alert>

              {/* Schedule Update Section */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-start gap-3">
                  <Calendar className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">New Schedule Options Available</h3>
                    <p className="mt-2 text-gray-600">
                      With this update, you have the opportunity to create a fresh schedule using our new schedule maker. 
                      This is particularly helpful if you were behind on your previous schedule - you can now start fresh 
                      with realistic deadlines.
                    </p>
                    <p className="mt-2 text-gray-600">
                      <span className="font-medium">Important:</span> If you plan to significantly change your end date, 
                      please let your teacher know of your updated timeline.
                    </p>
                  </div>
                </div>
              </div>

              {/* Course Access Instructions */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800">Accessing Your Course</h4>
                <p className="mt-2 text-green-700">
                  After setting up your new schedule, you'll see a 'Go to Course' button on your dashboard. 
                  Simply click this button to access your course content and continue your learning journey.
                </p>
              </div>
            </div>
          </ScrollArea>

          <div className="p-6 bg-white border-t mt-auto">
            <Button 
              onClick={handleDismiss}
              className="w-full bg-primary hover:bg-primary/90 text-white"
            >
              Got it, thanks!
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MigrationWelcomeSheet;