/**
 * Centralized import maps for dynamic import system
 * This file contains all available imports that can be used in course sections
 * 
 * To update Lucide icons:
 * 1. Run: node -e "const icons = require('lucide-react'); const iconNames = Object.keys(icons).filter(k => k[0] === k[0].toUpperCase() && !k.endsWith('Icon') && k !== 'createLucideIcon' && k !== 'icons'); console.log(JSON.stringify(iconNames, null, 2));"
 * 2. Copy the output to lucide-icons.json
 * 3. Restart your functions
 */

/**
 * Complete list of Lucide React icons
 * Loaded from: ../lucide-icons.json
 * Version: 0.439.0 (check package.json for current version)
 * Count: 3,445+ icons (as of last update)
 */
const lucideIcons = require('../lucide-icons.json');

/**
 * UI Component imports map
 * Maps import paths to their available exports
 */
const uiComponents = {
  '../../../components/ui/card': ['Card', 'CardContent', 'CardHeader', 'CardTitle', 'CardDescription', 'CardFooter'],
  '../../../components/ui/alert': ['Alert', 'AlertDescription', 'AlertTitle'],
  '../../../components/ui/badge': ['Badge'],
  '../../../components/ui/button': ['Button'],
  '../../../components/ui/input': ['Input'],
  '../../../components/ui/textarea': ['Textarea'],
  '../../../components/ui/select': ['Select', 'SelectContent', 'SelectItem', 'SelectTrigger', 'SelectValue'],
  '../../../components/ui/tabs': ['Tabs', 'TabsContent', 'TabsList', 'TabsTrigger'],
  '../../../components/ui/dialog': ['Dialog', 'DialogContent', 'DialogDescription', 'DialogFooter', 'DialogHeader', 'DialogTitle', 'DialogTrigger'],
  '../../../components/ui/checkbox': ['Checkbox'],
  '../../../components/ui/radio-group': ['RadioGroup', 'RadioGroupItem'],
  '../../../components/ui/switch': ['Switch'],
  '../../../components/ui/progress': ['Progress'],
  '../../../components/ui/skeleton': ['Skeleton'],
  '../../../components/ui/accordion': ['Accordion', 'AccordionContent', 'AccordionItem', 'AccordionTrigger'],
  '../../../components/ui/avatar': ['Avatar', 'AvatarFallback', 'AvatarImage'],
  '../../../components/ui/popover': ['Popover', 'PopoverContent', 'PopoverTrigger'],
  '../../../components/ui/tooltip': ['Tooltip', 'TooltipContent', 'TooltipProvider', 'TooltipTrigger'],
  '../../../components/ui/sheet': ['Sheet', 'SheetContent', 'SheetDescription', 'SheetHeader', 'SheetTitle', 'SheetTrigger', 'SheetFooter', 'SheetClose'],
  '../../../components/ui/separator': ['Separator'],
  '../../../components/ui/scroll-area': ['ScrollArea', 'ScrollBar'],
  '../../../components/ui/label': ['Label'],
  '../../../components/ui/collapsible': ['Collapsible', 'CollapsibleContent', 'CollapsibleTrigger'],
  '../../../components/ui/command': ['Command', 'CommandEmpty', 'CommandGroup', 'CommandInput', 'CommandItem', 'CommandList', 'CommandSeparator'],
  '../../../components/ui/dropdown-menu': ['DropdownMenu', 'DropdownMenuContent', 'DropdownMenuItem', 'DropdownMenuLabel', 'DropdownMenuSeparator', 'DropdownMenuTrigger'],
  '../../../components/ui/navigation-menu': ['NavigationMenu', 'NavigationMenuContent', 'NavigationMenuItem', 'NavigationMenuLink', 'NavigationMenuList', 'NavigationMenuTrigger'],
  '../../../components/ui/table': ['Table', 'TableBody', 'TableCaption', 'TableCell', 'TableHead', 'TableHeader', 'TableRow'],
  '../../../components/ui/form': ['Form', 'FormControl', 'FormDescription', 'FormField', 'FormItem', 'FormLabel', 'FormMessage'],
  '../../../components/ui/toggle': ['Toggle'],
  '../../../components/ui/toggle-group': ['ToggleGroup', 'ToggleGroupItem'],
  '../../../components/ui/hover-card': ['HoverCard', 'HoverCardContent', 'HoverCardTrigger'],
  '../../../components/ui/context-menu': ['ContextMenu', 'ContextMenuContent', 'ContextMenuItem', 'ContextMenuTrigger'],
  '../../../components/ui/menubar': ['Menubar', 'MenubarContent', 'MenubarItem', 'MenubarMenu', 'MenubarSeparator', 'MenubarTrigger'],
  '../../../components/ui/breadcrumb': ['Breadcrumb', 'BreadcrumbItem', 'BreadcrumbLink', 'BreadcrumbList', 'BreadcrumbPage', 'BreadcrumbSeparator'],
  '../../../components/ui/pagination': ['Pagination', 'PaginationContent', 'PaginationItem', 'PaginationLink', 'PaginationNext', 'PaginationPrevious'],
  '../../../components/ui/aspect-ratio': ['AspectRatio'],
  '../../../components/ui/calendar': ['Calendar'],
  '../../../components/ui/resizable': ['ResizableHandle', 'ResizablePanel', 'ResizablePanelGroup'],
  '../../../components/ui/slider': ['Slider'],
  '../../../components/ui/toast': ['Toast', 'ToastAction', 'ToastClose', 'ToastDescription', 'ToastProvider', 'ToastTitle', 'ToastViewport'],
  '../../../components/ui/toaster': ['Toaster'],
  '../../../components/ui/sonner': ['Toaster as Sonner']
};

/**
 * Assessment component imports
 */
const assessmentComponents = {
  '../assessments/AIMultipleChoiceQuestion': ['default'],
  '../assessments/AILongAnswerQuestion': ['default'],
  '../assessments/DynamicQuestion': ['default'],
  '../assessments/MultipleChoiceQuestion': ['default']
};

/**
 * Complete import map combining all sources
 */
const importMap = {
  'lucide-react': lucideIcons,
  ...uiComponents,
  ...assessmentComponents
};

/**
 * Function to check if an import source is supported
 */
function isSupported(source) {
  return source === 'lucide-react' || 
         source in uiComponents || 
         source in assessmentComponents;
}

/**
 * Function to get available exports for a source
 */
function getExports(source) {
  if (source === 'lucide-react') {
    return lucideIcons;
  }
  return uiComponents[source] || assessmentComponents[source] || [];
}

module.exports = {
  importMap,
  lucideIcons,
  uiComponents,
  assessmentComponents,
  isSupported,
  getExports
};