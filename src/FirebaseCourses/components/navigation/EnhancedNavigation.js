import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  ClipboardCheck,
  FileText,
  Lightbulb,
  Calendar,
  Award,
  CheckCircle,
  Info,
  PlayCircle,
  Target
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

// Type-specific styling
const typeColors = {
  lesson: 'bg-blue-100 text-blue-800 border-blue-200',
  assignment: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  exam: 'bg-purple-100 text-purple-800 border-purple-200',
  info: 'bg-amber-100 text-amber-800 border-amber-200',
};

const typeIcons = {
  lesson: <BookOpen className="h-4 w-4" />,
  assignment: <ClipboardCheck className="h-4 w-4" />,
  exam: <FileText className="h-4 w-4" />,
  info: <Lightbulb className="h-4 w-4" />,
};

const getTitleAccentColor = (type) => {
  switch (type) {
    case 'exam':
      return 'bg-purple-50 border-l-4 border-purple-300';
    case 'assignment':
      return 'bg-emerald-50 border-l-4 border-emerald-300';
    case 'lesson':
      return 'bg-blue-50 border-l-4 border-blue-300';
    case 'info':
      return 'bg-amber-50 border-l-4 border-amber-300';
    default:
      return 'bg-gray-50 border-l-4 border-gray-300';
  }
};

/**
 * Enhanced navigation component for Firebase courses
 */
const EnhancedNavigation = ({
  courseTitle,
  unitsList = [],
  progress = {},
  activeItemId,
  onItemSelect,
  currentUnitIndex = 0,
}) => {
  const [expandedUnit, setExpandedUnit] = useState(currentUnitIndex);
  
  // Group units by section
  const sectionedUnits = useMemo(() => {
    return unitsList.reduce((acc, unit, index) => {
      const section = unit.section || "1";
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push({...unit, index});
      return acc;
    }, {});
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
      <Card
        key={`${unitIndex}-${itemIndex}-${item.itemId}`}
        className={`mb-2 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer
          ${isActive ? 'border-blue-500 border-l-4 bg-blue-50/50' : 
           isNextItem ? 'border-purple-500 border-l-4 bg-purple-50/50' :
           isCompleted ? 'border-green-500 border-l-4 bg-green-50/50' :
           'border-gray-200 hover:border-l-4 hover:border-blue-300'}`}
        onClick={() => onItemSelect(item.itemId)}
      >
        <CardContent className="p-3">
          <div className="flex justify-between items-start">
            <div className="flex-grow flex items-start gap-2">
              {isNextItem && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="mt-1">
                      <PlayCircle className="text-purple-600" size={16} />
                    </TooltipTrigger>
                    <TooltipContent className="bg-purple-900 text-white border-purple-700">
                      <p>Continue here</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {isCompleted && !isNextItem && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="mt-1">
                      <CheckCircle className="text-green-500" size={16} />
                    </TooltipTrigger>
                    <TooltipContent className="bg-green-900 text-white border-green-700">
                      <p>Completed</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <div className="flex-grow">
                <div
                  className={`font-medium text-gray-900 p-2 rounded-md mb-1 ${getTitleAccentColor(item.type)}`}
                >
                  {item.title}
                </div>
                {isCompleted && (
                  <div className="ml-2 text-xs text-gray-500">
                    Completed: {new Date(progress[item.itemId].completedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
            <Badge 
              className={`${typeColors[item.type] || 'bg-gray-100 text-gray-800'} text-xs ml-2 shrink-0 flex items-center`}
            >
              {typeIcons[item.type]}
              <span className="ml-1">{item.type}</span>
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="font-semibold text-xl text-blue-800 mb-2 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          {courseTitle}
        </h2>
        
        <div className="flex items-center gap-2 text-sm text-blue-600 mt-1 bg-white px-3 py-1.5 rounded-full shadow-sm w-fit">
          <span>{overallProgress}% Complete</span>
        </div>
      </div>
      
      <ScrollArea className="flex-1 w-full">
        <div className="p-4">
          {Object.entries(sectionedUnits)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([sectionNumber, sectionUnits]) => (
              <div key={sectionNumber} className="mb-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mb-4 shadow-sm">
                  <Award className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">
                    Section {sectionNumber}
                  </h3>
                </div>
                
                <Accordion
                  type="single"
                  collapsible
                  className="space-y-4"
                  defaultValue={`unit-${currentUnitIndex}`}
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
                            ? 'border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg shadow-sm'
                            : 'border border-blue-100 bg-white hover:bg-blue-50/50 rounded-lg shadow-sm'
                        }
                      >
                        <AccordionTrigger className="hover:no-underline px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm
                                ${isCurrentUnit ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'}`}
                            >
                              {unit.sequence || unit.index + 1}
                            </div>
                            <div className="flex-1">
                              <span
                                className={`font-semibold ${
                                  isCurrentUnit ? 'text-purple-800' : 'text-blue-800'
                                }`}
                              >
                                {unit.name || `Unit ${unit.sequence || unit.index + 1}`}
                              </span>
                              
                              {unitItems.length > 0 && (
                                <div className="flex items-center mt-1 gap-2">
                                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div 
                                      className="bg-blue-600 rounded-full h-1.5" 
                                      style={{ width: `${unitPercentage}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-600 whitespace-nowrap">
                                    {unitPercentage}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pt-2">
                          <div className="space-y-2">
                            {unit.items?.map((item, itemIdx) => {
                              if (!item) return null;
                              return renderItem(item, unit.index, itemIdx);
                            })}
                          </div>
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

export default EnhancedNavigation;