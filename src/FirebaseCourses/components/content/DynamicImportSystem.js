// Dynamic Import System for UiGeneratedContent

/**
 * Parse code to detect required imports
 */
export const detectRequiredImports = (code) => {
  const requiredImports = {
    components: new Set(),
    icons: new Set(),
    hooks: new Set(),
    utils: new Set()
  };

  // Detect UI components
  const componentPatterns = {
    'Card|CardContent|CardHeader|CardTitle': '@/components/ui/card',
    'Alert|AlertDescription': '@/components/ui/alert',
    'Badge': '@/components/ui/badge',
    'Button': '@/components/ui/button',
    'Input': '@/components/ui/input',
    'Tabs|TabsList|TabsTrigger|TabsContent': '@/components/ui/tabs',
    'Dialog|DialogContent|DialogHeader|DialogTitle': '@/components/ui/dialog',
    'Select|SelectContent|SelectItem|SelectTrigger': '@/components/ui/select',
    'Checkbox': '@/components/ui/checkbox',
    'RadioGroup|RadioGroupItem': '@/components/ui/radio-group',
    'Switch': '@/components/ui/switch',
    'Textarea': '@/components/ui/textarea',
    'Progress': '@/components/ui/progress',
    'Skeleton': '@/components/ui/skeleton',
    'Accordion|AccordionContent|AccordionItem|AccordionTrigger': '@/components/ui/accordion',
    'Avatar|AvatarFallback|AvatarImage': '@/components/ui/avatar',
    'Popover|PopoverContent|PopoverTrigger': '@/components/ui/popover',
    'Tooltip|TooltipContent|TooltipProvider|TooltipTrigger': '@/components/ui/tooltip',
    'AIMultipleChoiceQuestion': '@/assessments/AIMultipleChoiceQuestion',
    'AILongAnswerQuestion': '@/assessments/AILongAnswerQuestion'
  };

  // Check for component usage
  Object.entries(componentPatterns).forEach(([pattern, importPath]) => {
    const regex = new RegExp(`<(${pattern})\\s|\\b(${pattern})\\s*=`, 'g');
    if (regex.test(code)) {
      requiredImports.components.add(importPath);
    }
  });

  // Detect Lucide icons - more efficient approach
  const iconRegex = /<(\w+)\s+className=["'][^"']*\bh-\d+\s+w-\d+/g;
  const functionIconRegex = /icon:\s*(\w+)/g;
  const iconComponentRegex = /Icon\s*=\s*(?:card\.)?icon/g;
  
  let match;
  const potentialIcons = new Set();
  
  // Find potential icon usage patterns
  while ((match = iconRegex.exec(code)) !== null) {
    potentialIcons.add(match[1]);
  }
  while ((match = functionIconRegex.exec(code)) !== null) {
    potentialIcons.add(match[1]);
  }
  if (iconComponentRegex.test(code)) {
    // If using dynamic icons, extract from data structures
    const iconNamesRegex = /icon:\s*(\w+)/g;
    while ((match = iconNamesRegex.exec(code)) !== null) {
      potentialIcons.add(match[1]);
    }
  }

  // Common icon names to check
  const commonIcons = [
    'BookOpen', 'Clock', 'Target', 'Award', 'Check', 'X', 'Info', 'HelpCircle',
    'User', 'Users', 'Calendar', 'FileText', 'Download', 'Upload', 'Settings',
    'Search', 'Plus', 'Minus', 'Edit', 'Trash', 'Eye', 'EyeOff', 'Save',
    'RefreshCw', 'ChevronRight', 'ChevronLeft', 'ChevronUp', 'ChevronDown',
    'ArrowRight', 'ArrowLeft', 'Star', 'Heart', 'AlertCircle', 'CheckCircle',
    'XCircle', 'Loader2', 'Play', 'Pause', 'Mail', 'Phone', 'Globe', 'Lock',
    'Zap', 'Code', 'Terminal', 'Database', 'Image', 'Video', 'Music'
  ];

  // Only add icons that are actually used
  potentialIcons.forEach(icon => {
    if (commonIcons.includes(icon) || code.includes(`${icon}`)) {
      requiredImports.icons.add(icon);
    }
  });

  // Detect React hooks
  if (code.includes('useState')) requiredImports.hooks.add('useState');
  if (code.includes('useEffect')) requiredImports.hooks.add('useEffect');
  if (code.includes('useCallback')) requiredImports.hooks.add('useCallback');
  if (code.includes('useMemo')) requiredImports.hooks.add('useMemo');
  if (code.includes('useRef')) requiredImports.hooks.add('useRef');
  if (code.includes('useContext')) requiredImports.hooks.add('useContext');
  if (code.includes('useReducer')) requiredImports.hooks.add('useReducer');

  return requiredImports;
};

/**
 * Dynamically load only required components
 */
export const loadDynamicImports = async (requiredImports) => {
  const imports = {
    React,
    // Always include basic hooks
    useState: React.useState,
    useEffect: React.useEffect,
  };

  // Load UI components dynamically
  const componentLoaders = {
    '@/components/ui/card': () => import('../../../components/ui/card'),
    '@/components/ui/alert': () => import('../../../components/ui/alert'),
    '@/components/ui/badge': () => import('../../../components/ui/badge'),
    '@/components/ui/button': () => import('../../../components/ui/button'),
    '@/components/ui/input': () => import('../../../components/ui/input'),
    '@/components/ui/tabs': () => import('../../../components/ui/tabs'),
    '@/components/ui/dialog': () => import('../../../components/ui/dialog'),
    '@/components/ui/select': () => import('../../../components/ui/select'),
    '@/components/ui/checkbox': () => import('../../../components/ui/checkbox'),
    '@/components/ui/radio-group': () => import('../../../components/ui/radio-group'),
    '@/components/ui/switch': () => import('../../../components/ui/switch'),
    '@/components/ui/textarea': () => import('../../../components/ui/textarea'),
    '@/components/ui/progress': () => import('../../../components/ui/progress'),
    '@/components/ui/skeleton': () => import('../../../components/ui/skeleton'),
    '@/components/ui/accordion': () => import('../../../components/ui/accordion'),
    '@/components/ui/avatar': () => import('../../../components/ui/avatar'),
    '@/components/ui/popover': () => import('../../../components/ui/popover'),
    '@/components/ui/tooltip': () => import('../../../components/ui/tooltip'),
    '@/assessments/AIMultipleChoiceQuestion': () => import('../assessments/AIMultipleChoiceQuestion'),
    '@/assessments/AILongAnswerQuestion': () => import('../assessments/AILongAnswerQuestion')
  };

  // Load required components
  for (const componentPath of requiredImports.components) {
    if (componentLoaders[componentPath]) {
      try {
        const module = await componentLoaders[componentPath]();
        Object.assign(imports, module);
      } catch (error) {
        console.warn(`Failed to load component: ${componentPath}`, error);
      }
    }
  }

  // Load only required Lucide icons
  if (requiredImports.icons.size > 0) {
    try {
      const iconImports = await import('lucide-react');
      requiredImports.icons.forEach(iconName => {
        if (iconImports[iconName]) {
          imports[iconName] = iconImports[iconName];
        }
      });
    } catch (error) {
      console.warn('Failed to load Lucide icons:', error);
    }
  }

  // Add additional React hooks if needed
  if (requiredImports.hooks.has('useCallback')) imports.useCallback = React.useCallback;
  if (requiredImports.hooks.has('useMemo')) imports.useMemo = React.useMemo;
  if (requiredImports.hooks.has('useRef')) imports.useRef = React.useRef;
  if (requiredImports.hooks.has('useContext')) imports.useContext = React.useContext;
  if (requiredImports.hooks.has('useReducer')) imports.useReducer = React.useReducer;

  return imports;
};

/**
 * Cache for loaded imports to avoid re-parsing and re-loading
 */
const importCache = new Map();

export const getCachedImports = async (code) => {
  // Create a simple hash of the code for caching
  const codeHash = btoa(code.slice(0, 100) + code.length);
  
  if (importCache.has(codeHash)) {
    return importCache.get(codeHash);
  }

  const requiredImports = detectRequiredImports(code);
  const loadedImports = await loadDynamicImports(requiredImports);
  
  importCache.set(codeHash, loadedImports);
  
  // Clear cache if it gets too large
  if (importCache.size > 50) {
    const firstKey = importCache.keys().next().value;
    importCache.delete(firstKey);
  }

  return loadedImports;
};