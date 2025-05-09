import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  ClipboardCheck,
  FileText,
  Lightbulb,
  Award,
  CheckCircle,
  Info,
  PlayCircle,
  ChevronRight,
  ChevronLeft,
  MenuIcon
} from 'lucide-react';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { 
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '../../../components/ui/accordion';
import { Badge } from '../../../components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../components/ui/tooltip';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

// Type-specific styling
const typeColors = {
  lesson: 'bg-blue-100 text-blue-800 border-blue-200',
  assignment: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  exam: 'bg-purple-100 text-purple-800 border-purple-200',
  info: 'bg-amber-100 text-amber-800 border-amber-200',
};

const typeIcons = {
  lesson: <BookOpen className="h-3 w-3" />,
  assignment: <ClipboardCheck className="h-3 w-3" />,
  exam: <FileText className="h-3 w-3" />,
  info: <Lightbulb className="h-3 w-3" />,
};

// Fix for unit sections
const getUnitSection = (unit) => {
  return unit.section || "";
};

/**
 * Collapsible navigation component for Firebase courses
 */
const CollapsibleNavigation = ({
  courseTitle,
  unitsList = [],
  progress = {},
  activeItemId,
  onItemSelect,
  expanded = true,
  onToggleExpand,
  currentUnitIndex = 0,
}) => {
  const [expandedUnit, setExpandedUnit] = useState(currentUnitIndex);
  
  // Process units by section
  const sectionedUnits = useMemo(() => {
    // Initialize with empty sections to maintain order
    const sections = {"": [], "1": [], "2": [], "3": []};
    
    unitsList.forEach((unit, index) => {
      const section = getUnitSection(unit);
      if (!sections[section]) {
        sections[section] = [];
      }
      sections[section].push({...unit, index});
    });
    
    // Remove empty sections
    Object.keys(sections).forEach(key => {
      if (sections[key].length === 0) {
        delete sections[key];
      }
    });
    
    return sections;
  }, [unitsList]);
  
  // Flatten all course items for progress calculations
  const allCourseItems = useMemo(() => {
    const items = [];
    unitsList.forEach(unit => {
      if (unit.items && Array.isArray(unit.items)) {
        items.push(...unit.items);
      }
    });
    return items;
  }, [unitsList]);
  
  // Calculate overall progress percentage
  const overallProgress = useMemo(() => {
    if (!allCourseItems.length) return 0;
    const completedCount = Object.values(progress).filter(item => item.completed).length;
    return Math.round((completedCount / allCourseItems.length) * 100);
  }, [allCourseItems, progress]);
  
  const renderItem = (item, unitIndex, itemIndex) => {
    const isCompleted = progress[item.itemId]?.completed;
    const isActive = activeItemId === item.itemId;
    
    // Determine if this is the first incomplete item
    const isNextItem = !isCompleted && 
      Object.entries(progress).filter(([id, data]) => data.completed).length > 0 &&
      !Object.entries(progress)
        .filter(([id, data]) => !data.completed && id !== item.itemId)
        .some(([id]) => {
          const thisItem = allCourseItems.find(i => i.itemId === id);
          const currentItem = allCourseItems.find(i => i.itemId === item.itemId);
          const thisGlobalIndex = thisItem ? allCourseItems.indexOf(thisItem) : -1;
          const currentGlobalIndex = currentItem ? allCourseItems.indexOf(currentItem) : -1;
          return thisGlobalIndex < currentGlobalIndex;
        });
    
    return (
      <div
        key={`${unitIndex}-${itemIndex}-${item.itemId}`}
        className={`p-1.5 mb-1 rounded-md text-xs cursor-pointer transition-all duration-200
          ${isActive ? 'bg-blue-50 border-l-2 border-blue-500 pl-1' : 
           isNextItem ? 'bg-purple-50 border-l-2 border-purple-400 pl-1' :
           isCompleted ? 'bg-green-50 border-l-2 border-green-400 pl-1' :
           'hover:bg-gray-50'}`}
        onClick={() => onItemSelect(item.itemId)}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-1.5">
            <div className="mt-0.5 flex-shrink-0">
              {isCompleted ? (
                <CheckCircle className="text-green-500 h-3 w-3" />
              ) : isNextItem ? (
                <PlayCircle className="text-purple-500 h-3 w-3" />
              ) : (
                typeIcons[item.type] || <Info className="h-3 w-3" />
              )}
            </div>
            <span className="font-medium line-clamp-2">
              {item.title}
            </span>
          </div>
          <Badge 
            className={`${typeColors[item.type] || 'bg-gray-100 text-gray-800'} text-[10px] py-0 px-1.5 min-h-0 h-4`}
          >
            {item.type}
          </Badge>
        </div>
      </div>
    );
  };
  
  if (!expanded) {
    return (
      <div className="w-12 h-full bg-white border-r border-gray-200 flex flex-col items-center py-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToggleExpand} 
          className="mb-4"
        >
          <MenuIcon className="h-5 w-5" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToggleExpand} 
          className="mt-2"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
        
        <div className="mt-6 flex flex-col items-center gap-4">
          {unitsList.map((unit, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`w-8 h-8 rounded-full ${index === currentUnitIndex ? 'bg-blue-100' : ''}`}
                  onClick={() => onItemSelect(unit.items?.[0]?.itemId)}
                >
                  {unit.sequence || index + 1}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {unit.name || `Unit ${unit.sequence || index + 1}`}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col border-r border-gray-200 bg-white shadow-sm">
      <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="font-semibold text-base text-blue-800 flex items-center gap-1 truncate">
          <BookOpen className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{courseTitle}</span>
        </h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToggleExpand} 
          className="ml-1 flex-shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-2 bg-white flex items-center justify-between text-xs">
        <div className="font-medium text-gray-700">Course Progress</div>
        <div className="text-blue-600 font-medium">{overallProgress}%</div>
      </div>
      <div className="px-2 pb-2">
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className="bg-blue-600 rounded-full h-1.5" 
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {Object.entries(sectionedUnits)
            .sort(([a, b]) => {
              // Empty section goes last, then numerical order
              if (a === "") return 1;
              if (b === "") return -1;
              return a.localeCompare(b);
            })
            .map(([sectionNumber, sectionUnits]) => (
              <div key={sectionNumber} className="mb-4">
                {sectionNumber && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-md mb-2 text-xs">
                    <Award className="w-3 h-3 text-blue-600" />
                    <span className="font-medium text-blue-800">
                      Section {sectionNumber}
                    </span>
                  </div>
                )}
                
                <Accordion
                  type="multiple"
                  defaultValue={[`unit-${currentUnitIndex}`]}
                  className="space-y-1"
                >
                  {sectionUnits.map((unit) => {
                    // Calculate unit progress
                    const unitItems = unit.items || [];
                    const unitCompletedCount = unitItems.filter(item => progress[item.itemId]?.completed).length;
                    const unitPercentage = unitItems.length > 0
                      ? Math.round((unitCompletedCount / unitItems.length) * 100)
                      : 0;
                    
                    const isCurrentUnit = unit.index === currentUnitIndex;
                    
                    return (
                      <AccordionItem
                        key={`unit-${unit.sequence || unit.index}`}
                        value={`unit-${unit.index}`}
                        className={
                          isCurrentUnit
                            ? 'border border-purple-100 bg-purple-50/30 rounded-md shadow-sm'
                            : 'border border-gray-100 bg-white hover:bg-blue-50/20 rounded-md shadow-sm'
                        }
                      >
                        <AccordionTrigger className="hover:no-underline py-2 px-3">
                          <div className="flex items-center gap-2 w-full">
                            <div
                              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs
                                ${isCurrentUnit ? 'bg-purple-600 text-white' : 'bg-blue-500 text-white'}`}
                            >
                              {unit.sequence || unit.index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <span
                                  className={`text-xs font-medium truncate ${
                                    isCurrentUnit ? 'text-purple-800' : 'text-blue-800'
                                  }`}
                                >
                                  {unit.name || `Unit ${unit.sequence || unit.index + 1}`}
                                </span>
                                <span className="text-[10px] text-gray-500 whitespace-nowrap ml-1">
                                  {unitPercentage}%
                                </span>
                              </div>
                              
                              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                <div 
                                  className={`${isCurrentUnit ? 'bg-purple-500' : 'bg-blue-500'} rounded-full h-1`}
                                  style={{ width: `${unitPercentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-2 pb-2 pt-1">
                          {unit.items?.map((item, itemIdx) => {
                            if (!item) return null;
                            return renderItem(item, unit.index, itemIdx);
                          })}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CollapsibleNavigation;