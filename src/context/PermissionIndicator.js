// src/components/PermissionIndicator.js

import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { useAuth } from '../context/AuthContext';

const PermissionIndicator = ({ type, className = "" }) => {
  const { permissionIndicators } = useAuth();
  const indicator = permissionIndicators[type];

  if (!indicator) return null;

  const Icon = indicator.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center ${className}`}>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">{indicator.label}</p>
          <p className="text-sm text-muted-foreground">{indicator.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default PermissionIndicator;