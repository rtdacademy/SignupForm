import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { isLabourDisruptionActive } from '../config/calendarConfig';

const LOCAL_STORAGE_KEY = 'labourDisruptionDialogSeen';

/**
 * LabourDisruptionDialog Component
 *
 * Displays a dialog about temporary Alberta Education policy changes
 * during the labour disruption. The dialog:
 * - Auto-shows once per user on first visit (tracked in local storage)
 * - Can be manually opened via external control (pass open/onOpenChange props)
 * - Only appears if isLabourDisruptionActive() is true
 */
const LabourDisruptionDialog = ({ open: externalOpen, onOpenChange: externalOnOpenChange }) => {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use external control if provided, otherwise use internal state
  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;

  useEffect(() => {
    // Only auto-show if not externally controlled
    if (!isControlled) {
      // Check if user has already seen this dialog
      const hasSeenDialog = localStorage.getItem(LOCAL_STORAGE_KEY);

      // Only show if not seen before AND labour disruption is active
      if (!hasSeenDialog && isLabourDisruptionActive()) {
        setInternalOpen(true);
      }
    }
  }, [isControlled]);

  const handleClose = (isOpen) => {
    if (isControlled && externalOnOpenChange) {
      externalOnOpenChange(isOpen);
    } else {
      setInternalOpen(isOpen);
    }

    // Mark as seen when dialog is closed
    if (!isOpen) {
      localStorage.setItem(LOCAL_STORAGE_KEY, 'true');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <DialogTitle className="text-xl text-blue-900 dark:text-blue-100">
                Flexible Registration Now Available!
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <DialogDescription asChild>
          <div className="space-y-4 text-foreground">
            <p className="font-semibold text-blue-800 dark:text-blue-200">
              Alberta Education has temporarily lifted key restrictions:
            </p>

            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 space-y-3 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">✓</span>
                <div>
                  <strong className="text-blue-900 dark:text-blue-100">No September Count Deadline:</strong>
                  <p className="text-blue-800 dark:text-blue-200 mt-1">
                    Register for Term 1 anytime - the enrollment deadline is lifted for all students!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">✓</span>
                <div>
                  <strong className="text-blue-900 dark:text-blue-100">No 10-Credit Cap for Non-Primary:</strong>
                  <p className="text-blue-800 dark:text-blue-200 mt-1">
                    Distance Education Non-Primary students can take unlimited courses!
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-100/50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-semibold mb-2 text-blue-900 dark:text-blue-100">
                What this means for you:
              </p>
              <ul className="text-sm space-y-1.5 ml-4 text-blue-800 dark:text-blue-200">
                <li>• All students can register for courses at any point during the school year</li>
                <li>• Non-Primary students: No limit on the number of Distance Education courses</li>
                <li>• Home Education students: Still limited to 10 credits per year</li>
                <li>• These are temporary measures during the Alberta labour disruption</li>
              </ul>
            </div>

          </div>
        </DialogDescription>

        <DialogFooter>
          <Button
            onClick={() => handleClose(false)}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LabourDisruptionDialog;
