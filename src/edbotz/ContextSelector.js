import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Library, 
  GraduationCap,
  ChevronRight,
  Bot,
  Book,
  Grid
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '../components/ui/dropdown-menu';
import { LESSON_TYPES } from './utils/settings';

const BotCountBadge = ({ count }) => {
  if (!count) return null;
  return (
    <div className="flex items-center gap-1">
      <Bot className="w-3.5 h-3.5 text-blue-600" />
      <span className="text-xs text-gray-500">({count})</span>
    </div>
  );
};

const ContextSelector = ({ courses, onContextSelect, availableAssistants, selectedContext: externalSelectedContext }) => {
  // Create the default context only once.
  const defaultContext = useMemo(
    () => ({ type: 'all', data: { title: 'All Assistants' } }),
    []
  );
  
  const [isOpen, setIsOpen] = useState(false);
  const [maxHeight, setMaxHeight] = useState('60vh');
  const triggerRef = useRef(null);
  
  // Initialize local state from external prop (or default)
  const [selectedContext, setSelectedContext] = useState(externalSelectedContext || defaultContext);

  // Debug: log the external selected context
  useEffect(() => {
    console.log("External selected context:", externalSelectedContext);
  }, [externalSelectedContext]);

  // When the external prop changes, update local state.
  useEffect(() => {
    if (externalSelectedContext) {
      setSelectedContext(externalSelectedContext);
    }
  }, [externalSelectedContext]);

  // Notify parent whenever the local selected context changes.
  useEffect(() => {
    onContextSelect(selectedContext);
  }, [onContextSelect, selectedContext]);

  const updateMaxHeight = () => {
    if (triggerRef.current) {
      const buttonRect = triggerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - buttonRect.bottom - 20;
      const spaceAbove = buttonRect.top - 20;
      const openUpward = spaceBelow < 400 && spaceAbove > spaceBelow;
      const availableSpace = openUpward ? spaceAbove : spaceBelow;
      setMaxHeight(`${Math.min(availableSpace, windowHeight * 0.6)}px`);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        updateMaxHeight();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  const handleOpenChange = (open) => {
    if (open) {
      updateMaxHeight();
    }
    setIsOpen(open);
  };

  const getCounts = () => {
    const counts = {
      course: {},
      units: {},
      lessons: {},
    };

    Object.entries(courses).forEach(([courseId, course]) => {
      counts.course[courseId] = availableAssistants.filter(
        a => a.usage.type === 'course' && a.usage.entityId === courseId
      ).length;

      course.units?.forEach(unit => {
        counts.units[unit.id] = availableAssistants.filter(
          a => a.usage.type === 'unit' && a.usage.entityId === unit.id
        ).length;

        unit.lessons?.forEach(lesson => {
          counts.lessons[lesson.id] = availableAssistants.filter(
            a => a.usage.type === 'lesson' && a.usage.entityId === lesson.id
          ).length;
        });
      });
    });

    return counts;
  };

  const counts = getCounts();
  const totalAssistants = availableAssistants.length;

  const handleContextSelectLocal = (context) => {
    setSelectedContext(context);
    onContextSelect(context);
    setIsOpen(false);
  };

  const renderLessonItem = (lesson, unit, course) => (
    <DropdownMenuItem
      key={lesson.id}
      onSelect={(e) => {
        e.preventDefault();
        // Attach courseId to the unitData
        handleContextSelectLocal({ 
          type: 'lesson', 
          data: lesson, 
          unitData: { ...unit, courseId: course.id } 
        });
      }}
    >
      <div className="flex items-center w-full gap-2">
        <GraduationCap className={`w-4 h-4 mr-2 ${LESSON_TYPES[lesson.type || 'general'].color}`} />
        <span className="flex-1">{lesson.title}</span>
        <Badge className={LESSON_TYPES[lesson.type || 'general'].badge}>
          {LESSON_TYPES[lesson.type || 'general'].label}
        </Badge>
        <BotCountBadge count={counts.lessons[lesson.id] || 0} />
      </div>
    </DropdownMenuItem>
  );
  

  const renderUnitSubmenu = (unit, course) => {
    const handleUnitClick = (e) => {
      e.preventDefault();
      handleContextSelectLocal({ type: 'unit', data: { ...unit, courseId: course.id } });
    };
  
    return (
      <DropdownMenuSub key={unit.id}>
        <DropdownMenuSubTrigger onClick={handleUnitClick} className="cursor-pointer">
          <div className="flex items-center w-full gap-2">
            <Library className="w-4 h-4 text-indigo-600 mr-2" />
            <span className="flex-1">{unit.title}</span>
            <BotCountBadge count={counts.units[unit.id] || 0} />
          </div>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          {unit.lessons?.map(lesson => renderLessonItem(lesson, unit, course))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );
  };
  

  const renderCourseItem = (courseId, course) => {
    const isCourseless = course.title === "Courseless Assistants";

    if (isCourseless) {
      return (
        <DropdownMenuItem
          key={courseId}
          onSelect={(e) => {
            e.preventDefault();
            handleContextSelectLocal({ type: 'course', data: course });
          }}
        >
          <div className="flex items-center w-full gap-2">
            <Book className="w-4 h-4 text-gray-600 mr-2" />
            <span className="flex-1">Courseless Assistants</span>
            <BotCountBadge count={counts.course[courseId] || 0} />
          </div>
        </DropdownMenuItem>
      );
    }

    return (
      <DropdownMenuSub key={courseId}>
        <DropdownMenuSubTrigger
          onClick={(e) => {
            e.preventDefault();
            handleContextSelectLocal({ type: 'course', data: course });
          }}
          className="cursor-pointer"
        >
          <div className="flex items-center w-full gap-2">
            <BookOpen className="w-4 h-4 text-blue-600 mr-2" />
            <span className="flex-1">{course.title}</span>
            <BotCountBadge count={counts.course[courseId] || 0} />
          </div>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          {course.units?.map(unit => renderUnitSubmenu(unit, course))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );
  };

  const getSelectedLabel = () => {
    if (!selectedContext) return 'Select Location';
    switch (selectedContext.type) {
      case 'all':
        return 'All Assistants';
      case 'course':
        return selectedContext.data.title === "Courseless Assistants"
          ? "Courseless Assistants"
          : selectedContext.data.title;
      case 'unit':
        return selectedContext.data.title;
      case 'lesson':
        return selectedContext.data.title;
      default:
        return 'Select Location';
    }
  };

  const getSelectedIcon = () => {
    if (!selectedContext) return null;
    switch (selectedContext.type) {
      case 'all':
        return <Grid className="w-4 h-4 text-purple-600 mr-2" />;
      case 'course':
        return selectedContext.data.title === "Courseless Assistants"
          ? <Book className="w-4 h-4 text-gray-600 mr-2" />
          : <BookOpen className="w-4 h-4 text-blue-600 mr-2" />;
      case 'unit':
        return <Library className="w-4 h-4 text-indigo-600 mr-2" />;
      case 'lesson':
        return (
          <GraduationCap
            className={`w-4 h-4 mr-2 ${LESSON_TYPES[selectedContext.data.type || 'general'].color}`}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            ref={triggerRef}
            variant="outline"
            className="w-full justify-between truncate"
            role="combobox"
            aria-expanded={isOpen}
          >
            <div className="flex items-center gap-2 truncate">
              {getSelectedIcon()}
              <span className="truncate">{getSelectedLabel()}</span>
            </div>
            <ChevronRight className="ml-2 h-4 w-4 shrink-0 opacity-50 flex-none" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[300px]"
          align="start"
          sideOffset={4}
          alignOffset={0}
          style={{ maxHeight }}
        >
          <DropdownMenuLabel>Select Location</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <ScrollArea className="pr-2" style={{ maxHeight: `calc(${maxHeight} - 3rem)` }}>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                handleContextSelectLocal({
                  type: 'all',
                  data: { title: 'All Assistants' },
                });
              }}
            >
              <div className="flex items-center w-full gap-2">
                <Grid className="w-4 h-4 text-purple-600 mr-2" />
                <span className="flex-1">All Assistants</span>
                <BotCountBadge count={totalAssistants} />
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {Object.entries(courses).map(([courseId, course]) =>
              renderCourseItem(courseId, course)
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ContextSelector;
