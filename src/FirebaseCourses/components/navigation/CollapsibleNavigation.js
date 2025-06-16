import React, { useEffect, useMemo } from 'react';
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
  X,
  Menu,
  TrendingUp,
  TrendingDown,
  // SEQUENTIAL_ACCESS_UPDATE: Added Lock icon for lesson access control
  Lock
} from 'lucide-react';
// SEQUENTIAL_ACCESS_UPDATE: Added lesson access utilities for Course 4 sequential unlocking
import { 
  getLessonAccessibility, 
  shouldBypassAccessControl 
} from '../../utils/lessonAccess';
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
import { Button } from '../../../components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '../../../components/ui/sheet';

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
  course,
  isMobile = false,
  gradebookItems = {},
  // SEQUENTIAL_ACCESS_UPDATE: Added props for lesson access control
  // Original props (before sequential access): courseTitle, unitsList, progress, activeItemId, onItemSelect, expanded, onToggleExpand, currentUnitIndex, course, isMobile, gradebookItems
  isStaffView = false,
  devMode = false,
}) => {

  // Display debugging information about the course structure
  useEffect(() => {
    if (course) {
      console.log("CollapsibleNavigation: Course structure paths:", {
        providedUnitsList: unitsList,
        detailsStructure: course.courseDetails?.courseStructure?.structure,
        directStructure: course.courseStructure?.structure,
        units: course.units
      });
    }
  }, [course, unitsList]);

  // Process units by section or course code
  const sectionedUnits = useMemo(() => {
    // Try to use course.courseDetails.courseStructure.structure if available and unitsList is empty
    const effectiveUnitsList = unitsList.length > 0 ? unitsList :
      (course?.courseDetails?.courseStructure?.structure || []);

    // Check if this course has multiple course codes
    const courseCodes = new Set(effectiveUnitsList
      .map(unit => unit.courseCode)
      .filter(code => code && code !== 'SECTION2_EXAM' && code !== 'FINAL_EXAM')
    );
    const hasMultipleCourses = courseCodes.size > 1;

    // Initialize sections
    const sections = {"": [], "1": [], "2": [], "3": []};

    effectiveUnitsList.forEach((unit, index) => {
      let sectionKey;
      
      if (hasMultipleCourses && unit.courseCode) {
        // Use course code as section key for multi-course structures
        sectionKey = unit.courseCode;
      } else {
        // Use traditional section numbering for single-course structures
        sectionKey = getUnitSection(unit);
      }
      
      if (!sections[sectionKey]) {
        sections[sectionKey] = [];
      }
      sections[sectionKey].push({...unit, index});
    });

    // Remove empty sections
    Object.keys(sections).forEach(key => {
      if (sections[key].length === 0) {
        delete sections[key];
      }
    });

    return { sections, hasMultipleCourses };
  }, [unitsList, course]);
  
  // Flatten all course items for progress calculations
  const allCourseItems = useMemo(() => {
    const items = [];

    // Try to use course.courseDetails.courseStructure.structure if available and unitsList is empty
    const effectiveUnitsList = unitsList.length > 0 ? unitsList :
      (course?.courseDetails?.courseStructure?.structure || []);

    effectiveUnitsList.forEach(unit => {
      if (unit.items && Array.isArray(unit.items)) {
        items.push(...unit.items);
      }
    });
    return items;
  }, [unitsList, course]);
  
  // Calculate overall progress percentage
  const overallProgress = useMemo(() => {
    if (!allCourseItems.length) return 0;
    const completedCount = Object.values(progress).filter(item => item.completed).length;
    return Math.round((completedCount / allCourseItems.length) * 100);
  }, [allCourseItems, progress]);

  // SEQUENTIAL_ACCESS_UPDATE: Calculate lesson accessibility for sequential unlocking
  // Original code (before sequential access): Only had overallProgress calculation above
  const lessonAccessibility = useMemo(() => {
    // Skip access control for staff/dev or if no course structure
    if (shouldBypassAccessControl(isStaffView, devMode) || !course) {
      const accessibility = {};
      allCourseItems.forEach(item => {
        accessibility[item.itemId] = { accessible: true, reason: 'Access control bypassed' };
      });
      return accessibility;
    }
    
    // Use assessment data (gradebookItems) for unlocking instead of progress data
    return getLessonAccessibility(course, gradebookItems);
  }, [allCourseItems, isStaffView, devMode, course, gradebookItems]);
  
  const renderItem = (item, unitIndex, itemIndex) => {
    const isCompleted = progress[item.itemId]?.completed;
    const isActive = activeItemId === item.itemId;
    const gradebookItem = gradebookItems[item.itemId];
    
    // SEQUENTIAL_ACCESS_UPDATE: Check lesson accessibility
    // Original code (before sequential access): Only had isCompleted, isActive, gradebookItem above
    const accessInfo = lessonAccessibility[item.itemId] || { accessible: true, reason: 'Default access' };
    const isAccessible = accessInfo.accessible;
    
    // Determine if this is the first incomplete item
    const isNextItem = !isCompleted && 
      Object.entries(progress).filter(([, data]) => data.completed).length > 0 &&
      !Object.entries(progress)
        .filter(([id, data]) => !data.completed && id !== item.itemId)
        .some(([id]) => {
          const thisItem = allCourseItems.find(i => i.itemId === id);
          const currentItem = allCourseItems.find(i => i.itemId === item.itemId);
          const thisGlobalIndex = thisItem ? allCourseItems.indexOf(thisItem) : -1;
          const currentGlobalIndex = currentItem ? allCourseItems.indexOf(currentItem) : -1;
          return thisGlobalIndex < currentGlobalIndex;
        });
    
    // Calculate grade percentage if available
    const gradePercentage = gradebookItem && gradebookItem.maxScore > 0
      ? Math.round((gradebookItem.score / gradebookItem.maxScore) * 100)
      : null;
    
    // Get grade color
    const getGradeColor = (percentage) => {
      if (percentage >= 90) return 'text-green-600';
      if (percentage >= 80) return 'text-blue-600';
      if (percentage >= 70) return 'text-yellow-600';
      if (percentage >= 60) return 'text-orange-600';
      return 'text-red-600';
    };
    
    // SEQUENTIAL_ACCESS_UPDATE: Updated styling and click handler for lesson access control
    // Original styling (before sequential access): Only had isActive, isNextItem, isCompleted states
    const getItemStyling = () => {
      if (!isAccessible) {
        return 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60';
      }
      if (isActive) {
        return 'bg-blue-50 border-l-2 border-blue-500 pl-1.5';
      }
      if (isNextItem) {
        return 'bg-purple-50 border-l-2 border-purple-400 pl-1.5';
      }
      if (isCompleted) {
        return 'bg-green-50 border-l-2 border-green-400 pl-1.5';
      }
      return 'hover:bg-gray-50 cursor-pointer';
    };

    return (
      <Tooltip key={`${unitIndex}-${itemIndex}-${item.itemId}`}>
        <TooltipTrigger asChild>
          <div
            className={`p-2 mb-1.5 rounded-md text-sm transition-all duration-200 ${getItemStyling()}`}
            onClick={() => {
              // SEQUENTIAL_ACCESS_UPDATE: Added access control to click handler
              // Original click handler (before sequential access): onClick={() => onItemSelect(item.itemId)}
              if (isAccessible) {
                onItemSelect(item.itemId);
              }
            }}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-2 flex-1">
                <div className="mt-0.5 flex-shrink-0">
                  {/* SEQUENTIAL_ACCESS_UPDATE: Added lock icon for inaccessible lessons */}
                  {/* Original icon logic (before sequential access): Only had isCompleted, isNextItem, and default type icons */}
                  {!isAccessible ? (
                    <Lock className="text-gray-400 h-4 w-4" />
                  ) : isCompleted ? (
                    <CheckCircle className="text-green-500 h-4 w-4" />
                  ) : isNextItem ? (
                    <PlayCircle className="text-purple-500 h-4 w-4" />
                  ) : (
                    typeIcons[item.type] || <Info className="h-4 w-4" />
                  )}
                </div>
                <span className="font-medium line-clamp-2 flex-1">
                  {item.title}
                </span>
              </div>
              <div className="flex items-center gap-2 ml-2">
                {gradePercentage !== null && (
                  <span className={`text-xs font-semibold ${getGradeColor(gradePercentage)}`}>
                    {gradePercentage}%
                  </span>
                )}
                <Badge
                  className={`${typeColors[item.type] || 'bg-gray-100 text-gray-800'} text-xs py-0.5 px-2 min-h-0 h-5`}
                >
                  {item.type}
                </Badge>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{item.title}</p>
            {/* SEQUENTIAL_ACCESS_UPDATE: Added accessibility information to tooltip */}
            {/* Original tooltip (before sequential access): Only showed gradebook info and completion status */}
            {!isAccessible && (
              <p className="text-sm text-red-600 font-medium">🔒 {accessInfo.reason}</p>
            )}
            {gradebookItem && (
              <>
                <p className="text-sm">Score: {gradebookItem.score}/{gradebookItem.maxScore} ({gradePercentage}%)</p>
                <p className="text-sm">Attempts: {gradebookItem.attempts || 0}</p>
                {gradebookItem.lastAttempt && (
                  <p className="text-sm">Last attempt: {new Date(gradebookItem.lastAttempt).toLocaleDateString()}</p>
                )}
              </>
            )}
            {!isCompleted && isAccessible && (
              <p className="text-sm text-gray-600">Not yet completed</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  };
  
  if (!expanded) {
    return (
      <div className="w-full bg-white border-r border-gray-200 flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleExpand}
          className="mt-2"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        <div className="mt-6 flex flex-col items-center gap-4">
          <TooltipProvider>
            {unitsList.map((unit, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`w-8 h-8 rounded-full ${index === currentUnitIndex ? 'bg-blue-100' : ''}`}
                    onClick={() => onItemSelect(unit.items?.[0]?.itemId)}
                  >
                    {unit.sequence || unit.order || index + 1}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {unit.name || unit.title || `Unit ${unit.sequence || unit.order || index + 1}`}
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </div>
    );
  }
  
  // Navigation content component
  const NavigationContent = () => (
    <>
      <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="font-semibold text-base text-blue-800 flex items-center gap-1 truncate">
          <BookOpen className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{courseTitle}</span>
        </h2>
        {!isMobile && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggleExpand} 
            className="ml-1 flex-shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="p-3 bg-white flex items-center justify-between text-sm">
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
      
      <div className="flex-1">
        <div className="p-2">
          <TooltipProvider>
            {Object.entries(sectionedUnits.sections)
            .sort(([a, b]) => {
              // Empty section goes last, then sort by section/course code
              if (a === "") return 1;
              if (b === "") return -1;
              
              // If using course codes, sort alphabetically
              if (sectionedUnits.hasMultipleCourses) {
                return a.localeCompare(b);
              }
              
              // Traditional numerical section sorting
              return a.localeCompare(b);
            })
            .map(([sectionKey, sectionUnits]) => (
              <div key={sectionKey} className="mb-4">
                {sectionKey && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-md mb-2 text-xs">
                    <Award className="w-3 h-3 text-blue-600" />
                    <span className="font-medium text-blue-800">
                      {sectionedUnits.hasMultipleCourses ? sectionKey : `Section ${sectionKey}`}
                    </span>
                  </div>
                )}
                
                <Accordion
                  type="multiple"
                  defaultValue={[`unit-${currentUnitIndex}`]}
                  className="space-y-2"
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
                        key={`unit-${unit.sequence || unit.order || unit.index}`}
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
                              className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs
                                ${isCurrentUnit ? 'bg-purple-600 text-white' : 'bg-blue-500 text-white'}`}
                            >
                              {unit.sequence || unit.order || unit.index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span
                                  className={`text-sm font-medium ${
                                    isCurrentUnit ? 'text-purple-800' : 'text-blue-800'
                                  }`}
                                >
                                  {unit.name || unit.title || `Unit ${unit.sequence || unit.order || unit.index + 1}`}
                                </span>
                                <span className="text-xs text-gray-500 whitespace-nowrap ml-1">
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
          </TooltipProvider>
        </div>
      </div>
    </>
  );

  // For mobile devices, wrap in a Sheet
  if (isMobile) {
    return (
      <>
        <Sheet open={expanded} onOpenChange={onToggleExpand}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="fixed bottom-4 right-4 z-50 md:hidden bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 shadow-lg"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] sm:w-[350px] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>{courseTitle} Navigation</SheetTitle>
            </SheetHeader>
            <div className="h-full overflow-y-auto flex flex-col bg-white">
              <NavigationContent />
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // For desktop, return the regular navigation
  return (
    <div className="w-full flex flex-col border-r border-gray-200 bg-white shadow-sm">
      <NavigationContent />
    </div>
  );
};

export default CollapsibleNavigation;