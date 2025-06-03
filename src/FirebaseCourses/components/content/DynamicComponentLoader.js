/**
 * Dynamic Component Loader
 * Handles loading components based on import metadata from the transformer
 */

import React from 'react';

// Lazy load all possible components
const componentLoaders = {
  // UI Components
  'Card': () => import('../../../components/ui/card').then(m => m.Card),
  'CardContent': () => import('../../../components/ui/card').then(m => m.CardContent),
  'CardHeader': () => import('../../../components/ui/card').then(m => m.CardHeader),
  'CardTitle': () => import('../../../components/ui/card').then(m => m.CardTitle),
  'CardDescription': () => import('../../../components/ui/card').then(m => m.CardDescription),
  'CardFooter': () => import('../../../components/ui/card').then(m => m.CardFooter),
  
  'Alert': () => import('../../../components/ui/alert').then(m => m.Alert),
  'AlertDescription': () => import('../../../components/ui/alert').then(m => m.AlertDescription),
  'AlertTitle': () => import('../../../components/ui/alert').then(m => m.AlertTitle),
  
  'Badge': () => import('../../../components/ui/badge').then(m => m.Badge),
  'Button': () => import('../../../components/ui/button').then(m => m.Button),
  'Input': () => import('../../../components/ui/input').then(m => m.Input),
  'Textarea': () => import('../../../components/ui/textarea').then(m => m.Textarea),
  
  'Select': () => import('../../../components/ui/select').then(m => m.Select),
  'SelectContent': () => import('../../../components/ui/select').then(m => m.SelectContent),
  'SelectItem': () => import('../../../components/ui/select').then(m => m.SelectItem),
  'SelectTrigger': () => import('../../../components/ui/select').then(m => m.SelectTrigger),
  'SelectValue': () => import('../../../components/ui/select').then(m => m.SelectValue),
  
  'Tabs': () => import('../../../components/ui/tabs').then(m => m.Tabs),
  'TabsContent': () => import('../../../components/ui/tabs').then(m => m.TabsContent),
  'TabsList': () => import('../../../components/ui/tabs').then(m => m.TabsList),
  'TabsTrigger': () => import('../../../components/ui/tabs').then(m => m.TabsTrigger),
  
  'Dialog': () => import('../../../components/ui/dialog').then(m => m.Dialog),
  'DialogContent': () => import('../../../components/ui/dialog').then(m => m.DialogContent),
  'DialogDescription': () => import('../../../components/ui/dialog').then(m => m.DialogDescription),
  'DialogFooter': () => import('../../../components/ui/dialog').then(m => m.DialogFooter),
  'DialogHeader': () => import('../../../components/ui/dialog').then(m => m.DialogHeader),
  'DialogTitle': () => import('../../../components/ui/dialog').then(m => m.DialogTitle),
  'DialogTrigger': () => import('../../../components/ui/dialog').then(m => m.DialogTrigger),
  
  'Checkbox': () => import('../../../components/ui/checkbox').then(m => m.Checkbox),
  'RadioGroup': () => import('../../../components/ui/radio-group').then(m => m.RadioGroup),
  'RadioGroupItem': () => import('../../../components/ui/radio-group').then(m => m.RadioGroupItem),
  'Switch': () => import('../../../components/ui/switch').then(m => m.Switch),
  'Progress': () => import('../../../components/ui/progress').then(m => m.Progress),
  'Skeleton': () => import('../../../components/ui/skeleton').then(m => m.Skeleton),
  
  'Accordion': () => import('../../../components/ui/accordion').then(m => m.Accordion),
  'AccordionContent': () => import('../../../components/ui/accordion').then(m => m.AccordionContent),
  'AccordionItem': () => import('../../../components/ui/accordion').then(m => m.AccordionItem),
  'AccordionTrigger': () => import('../../../components/ui/accordion').then(m => m.AccordionTrigger),
  
  'Avatar': () => import('../../../components/ui/avatar').then(m => m.Avatar),
  'AvatarFallback': () => import('../../../components/ui/avatar').then(m => m.AvatarFallback),
  'AvatarImage': () => import('../../../components/ui/avatar').then(m => m.AvatarImage),
  
  'Popover': () => import('../../../components/ui/popover').then(m => m.Popover),
  'PopoverContent': () => import('../../../components/ui/popover').then(m => m.PopoverContent),
  'PopoverTrigger': () => import('../../../components/ui/popover').then(m => m.PopoverTrigger),
  
  'Tooltip': () => import('../../../components/ui/tooltip').then(m => m.Tooltip),
  'TooltipContent': () => import('../../../components/ui/tooltip').then(m => m.TooltipContent),
  'TooltipProvider': () => import('../../../components/ui/tooltip').then(m => m.TooltipProvider),
  'TooltipTrigger': () => import('../../../components/ui/tooltip').then(m => m.TooltipTrigger),
  
  // Assessment Components
  'AIMultipleChoiceQuestion': () => import('../assessments/AIMultipleChoiceQuestion').then(m => m.default),
  'AILongAnswerQuestion': () => import('../assessments/AILongAnswerQuestion').then(m => m.default),
};

// Icon loader
const iconLoader = () => import('lucide-react');

/**
 * Load all required components based on metadata
 */
export async function loadRequiredImports(importMetadata) {
  const loadedImports = {
    React,
    useState: React.useState,
    useEffect: React.useEffect,
    useCallback: React.useCallback,
    useMemo: React.useMemo,
    useRef: React.useRef,
  };

  try {
    // Load required UI components
    const componentPromises = [];
    
    for (const [componentName, source] of Object.entries(importMetadata.requiredComponents || {})) {
      if (componentLoaders[componentName]) {
        componentPromises.push(
          componentLoaders[componentName]()
            .then(component => {
              loadedImports[componentName] = component;
            })
            .catch(err => {
              console.error(`Failed to load component ${componentName}:`, err);
            })
        );
      }
    }

    // Load required icons
    if (importMetadata.requiredIcons && importMetadata.requiredIcons.length > 0) {
      componentPromises.push(
        iconLoader().then(lucideIcons => {
          importMetadata.requiredIcons.forEach(iconName => {
            if (lucideIcons[iconName]) {
              loadedImports[iconName] = lucideIcons[iconName];
            }
          });
        }).catch(err => {
          console.error('Failed to load Lucide icons:', err);
        })
      );
    }

    // Wait for all components to load
    await Promise.all(componentPromises);

    return loadedImports;
  } catch (error) {
    console.error('Error loading dynamic imports:', error);
    return loadedImports;
  }
}

/**
 * Cache for loaded components to avoid re-loading
 */
const importCache = new Map();

export async function getCachedImports(importMetadata) {
  // If import metadata is a simple object, use it directly
  // This handles the case where we pass the metadata from the database
  return await loadRequiredImports(importMetadata);
}

// Original cached version for performance optimization
export async function getCachedImportsOptimized(importMetadata) {
  // Create cache key from metadata
  const cacheKey = JSON.stringify({
    components: Object.keys(importMetadata.requiredComponents || {}),
    icons: importMetadata.requiredIcons || []
  });

  if (importCache.has(cacheKey)) {
    return importCache.get(cacheKey);
  }

  const loadedImports = await loadRequiredImports(importMetadata);
  importCache.set(cacheKey, loadedImports);

  // Limit cache size
  if (importCache.size > 20) {
    const firstKey = importCache.keys().next().value;
    importCache.delete(firstKey);
  }

  return loadedImports;
}