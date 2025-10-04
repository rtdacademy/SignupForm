import React from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Sparkles, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

/**
 * LabourDisruptionBanner Component
 *
 * Displays a prominent banner about temporary Alberta Education policy changes
 * during the labour disruption. This includes:
 * - Lifted September count date deadlines (ALL students)
 * - Removed 10-credit cap for Distance Education Non-Primary students ONLY
 *
 * @param {Object} props
 * @param {boolean} props.showDetails - Whether to show detailed information (default: false)
 */
const LabourDisruptionBanner = ({ showDetails = false }) => {
  return (
    <Alert className="border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
      <div className="flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <AlertTitle className="text-base font-bold text-blue-900 dark:text-blue-100">
            🎉 Great News: Flexible Registration Now Available!
          </AlertTitle>
          <AlertDescription className="space-y-3 text-blue-800 dark:text-blue-200">
            <p className="font-semibold">
              Alberta Education has temporarily lifted key restrictions during the labour disruption:
            </p>
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">✓</span>
                <span><strong>No September Count Deadline:</strong> Register for Term 1 anytime - the enrollment deadline is lifted for all students!</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">✓</span>
                <span><strong>No 10-Credit Cap for Non-Primary:</strong> Distance Education Non-Primary students can take unlimited courses!</span>
              </div>
            </div>

            {showDetails && (
              <div className="mt-3 p-3 rounded-lg bg-blue-100/50 dark:bg-blue-900/20">
                <p className="text-sm font-medium mb-2">What this means for you:</p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• All students can register for courses at any point during the school year</li>
                  <li>• Non-Primary students: No limit on the number of Distance Education courses</li>
                  <li>• Home Education students: Still limited to 10 credits per year</li>
                  <li>• These are temporary measures during the Alberta labour disruption</li>
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                className="gap-2 border-blue-600 text-blue-700 hover:bg-blue-100 dark:border-blue-400 dark:text-blue-300 dark:hover:bg-blue-900/30"
                onClick={() => window.location.href = '/student-faq#teacherStrike'}
              >
                Learn More <ExternalLink className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-2 border-blue-600 text-blue-700 hover:bg-blue-100 dark:border-blue-400 dark:text-blue-300 dark:hover:bg-blue-900/30"
                onClick={() => window.location.href = 'https://yourway.rtdacademy.com/get-started'}
              >
                Get Started <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};

export default LabourDisruptionBanner;
