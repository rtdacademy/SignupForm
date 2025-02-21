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
  onProceedToCreation,
  hasSchedule = false  // Add this prop
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {hasSchedule ? "Create New Schedule" : "Create Your Course Schedule"}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center gap-3 mb-4">
            <CalendarPlus className="h-8 w-8 text-blue-500 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-900 mb-1">
                {hasSchedule 
                  ? "Ready to adjust your learning plan?"
                  : "Ready to plan your learning journey?"}
              </h4>
              <p className="text-sm text-gray-600">
                {hasSchedule 
                  ? "Create a new schedule to better align with your current needs and pace."
                  : "Create a personalized schedule to help guide your progress through the course."}
              </p>
            </div>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-700">
              {hasSchedule ? (
                <>
                  Creating a new schedule will give you a fresh start with updated target dates. 
                  Your course progress will be preserved, and you can continue working at a pace 
                  that better suits your needs.
                </>
              ) : (
                <>
                  Your schedule will serve as a flexible guide to help you stay on track. 
                  The dates are suggestions rather than strict deadlines, allowing you to 
                  learn at your own pace while maintaining steady progress.
                </>
              )}
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
            {hasSchedule ? "Create New Schedule" : "Create Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SchedulePurchaseDialog;