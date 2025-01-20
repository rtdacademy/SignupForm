import React from 'react';
import { Button } from '../components/ui/button';
import { HelpCircle } from 'lucide-react';
import { useTutorial } from '../context/TutorialContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";

export const TutorialButton = ({ tutorialId, className = "", tooltipText = "Help" }) => {
  const { showTutorial } = useTutorial();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            className={`
              relative p-0 h-6 w-6 
              rounded-full 
              bg-slate-100
              text-slate-600
              hover:bg-slate-200
              hover:text-slate-700
              shadow-sm
              transform transition-all duration-200
              hover:scale-105
              active:scale-95
              ${className}
            `}
            onClick={() => showTutorial(tutorialId)}
            aria-label="Show help"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent 
          className="bg-slate-800 text-white"
        >
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TutorialButton;