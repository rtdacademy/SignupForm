import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { CalendarPlus } from "lucide-react";

const SchedulePurchaseDialog = ({ 
  isOpen, 
  onOpenChange, 
  onProceedToCreation
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Your Course Schedule</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center gap-3 mb-4">
            <CalendarPlus className="h-8 w-8 text-blue-500 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-900 mb-1">
                Ready to plan your learning journey?
              </h4>
              <p className="text-sm text-gray-600">
                Create a personalized schedule to help guide your progress through the course.
              </p>
            </div>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-700">
              Your schedule will serve as a flexible guide to help you stay on track. 
              The dates are suggestions rather than strict deadlines, allowing you to 
              learn at your own pace while maintaining steady progress.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          
          <Button
            onClick={() => {
              onOpenChange(false);
              onProceedToCreation();
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Create Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SchedulePurchaseDialog;