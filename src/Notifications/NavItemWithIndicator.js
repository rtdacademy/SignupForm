import React from 'react';
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/ui/tooltip";

const NavItemWithIndicator = ({ item, isActive, isExpanded, onClick, isAdminItem = false }) => {
  // Define admin-specific styling
  const getAdminStyling = () => {
    if (!isAdminItem) return {};
    
    return isActive 
      ? {
          button: 'bg-orange-500 text-white hover:bg-orange-600 border-l-4 border-orange-700',
          icon: 'text-white group-hover:text-white/80'
        }
      : {
          button: 'text-orange-600 hover:bg-orange-50 hover:text-orange-700 border-l-2 border-transparent hover:border-orange-200',
          icon: 'text-orange-600 group-hover:text-orange-700'
        };
  };

  const adminStyles = getAdminStyling();

  const buttonContent = (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      className={cn(
        'w-full transition-colors duration-200 group',
        isExpanded ? 'justify-start px-4' : 'justify-center items-center px-0',
        // Use admin styling if it's an admin item, otherwise use default
        isAdminItem && adminStyles.button ? adminStyles.button : (
          isActive
            ? 'bg-primary text-primary-foreground hover:bg-primary/70'
            : 'text-foreground hover:bg-accent/70 hover:text-accent-foreground'
        )
      )}
      onClick={onClick}
    >
      <item.icon className={cn(
        "h-5 w-5 transition-colors duration-200",
        isExpanded && "mr-2",
        // Use admin icon styling if it's an admin item, otherwise use default
        isAdminItem && adminStyles.icon ? adminStyles.icon : (
          isActive
            ? "text-primary-foreground group-hover:text-primary-foreground/70"
            : "text-foreground group-hover:text-accent-foreground/70"
        )
      )} />
      {isExpanded && <span>{item.label}</span>}
    </Button>
  );

  return (
    <div className="relative">
      {!isExpanded ? (
        <Tooltip>
          <TooltipTrigger asChild>
            {buttonContent}
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.label}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        buttonContent
      )}
      {item.indicatorCount > 0 && (
        <div className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full min-w-[16px] h-4 flex items-center justify-center text-[10px] font-semibold px-1">
          {item.indicatorCount > 99 ? '99+' : item.indicatorCount}
        </div>
      )}
    </div>
  );
};

export default NavItemWithIndicator;