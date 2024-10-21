import React from 'react';
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";

const NavItemWithIndicator = ({ item, isActive, isExpanded, onClick }) => {
  return (
    <div className="relative">
      <Button
        variant={isActive ? 'secondary' : 'ghost'}
        className={cn(
          'w-full transition-colors duration-200 group',
          isExpanded ? 'justify-start px-4' : 'justify-center items-center px-0',
          isActive
            ? 'bg-primary text-primary-foreground hover:bg-primary/70'
            : 'text-foreground hover:bg-accent/70 hover:text-accent-foreground'
        )}
        onClick={onClick}
      >
        <item.icon className={cn(
          "h-5 w-5 transition-colors duration-200",
          isExpanded && "mr-2",
          isActive
            ? "text-primary-foreground group-hover:text-primary-foreground/70"
            : "text-foreground group-hover:text-accent-foreground/70"
        )} />
        {isExpanded && <span>{item.label}</span>}
      </Button>
      {item.indicatorCount > 0 && (
        <div className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full min-w-[16px] h-4 flex items-center justify-center text-[10px] font-semibold px-1">
          {item.indicatorCount > 99 ? '99+' : item.indicatorCount}
        </div>
      )}
    </div>
  );
};

export default NavItemWithIndicator;