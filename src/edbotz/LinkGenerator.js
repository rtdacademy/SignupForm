import React, { useState } from 'react';
import { 
  Check, 
  Copy, 
  Share2, 
  Bot, 
  Library, 
  BookOpen, 
  GraduationCap, 
  ClipboardList, 
  Brain, 
  PenTool, 
  Info,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { ScrollArea } from '../components/ui/scroll-area';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "../components/ui/tooltip";
import { getDatabase, ref, push, set } from 'firebase/database';
import { cn } from '../lib/utils';

// Keep the getLessonTypeStyles helper function the same
const getLessonTypeStyles = (type) => {
  switch (type) {
    case 'assignment':
      return {
        icon: ClipboardList,
        color: 'text-amber-600 bg-amber-50 border-amber-200',
        badge: 'bg-amber-100 text-amber-700'
      };
    case 'quiz':
      return {
        icon: Brain,
        color: 'text-purple-600 bg-purple-50 border-purple-200',
        badge: 'bg-purple-100 text-purple-700'
      };
    case 'project':
      return {
        icon: PenTool,
        color: 'text-green-600 bg-green-50 border-green-200',
        badge: 'bg-green-100 text-green-700'
      };
    default:
      return {
        icon: GraduationCap,
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        badge: 'bg-blue-100 text-blue-700'
      };
  }
};

const CopyLinkButton = ({ onClick, tooltip }) => {
  const [copied, setCopied] = useState(false);

  const handleClick = async (e) => {
    e.stopPropagation();
    try {
      await onClick();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClick}
            className={cn(
              "hover:bg-blue-50 transition-colors",
              copied ? "text-green-600" : "text-blue-600"
            )}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const CollapsibleSection = ({ 
  title, 
  icon: Icon, 
  children, 
  defaultExpanded = false,
  copyLinkAction,
  iconColor = "text-blue-600",
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={className}>
      <div 
        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Icon className={cn("w-5 h-5", iconColor)} />
          <span className="font-medium">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {copyLinkAction && (
            <div onClick={e => e.stopPropagation()}>
              {copyLinkAction}
            </div>
          )}
          {children && (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-gray-500"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </div>
      {isExpanded && children && (
        <div className="mt-2 ml-6">
          {children}
        </div>
      )}
    </div>
  );
};

const LinkGenerator = ({ 
  open, 
  onOpenChange, 
  courses, 
  assistants, 
  userId 
}) => {
  const generateAccessLink = async (assistantId, courseId = null) => {
    try {
      const db = getDatabase();
      const accessRef = ref(db, `edbotz/studentAccess/${userId}`);
      const newAccessRef = push(accessRef);
      
      const accessConfig = {
        type: 'assistant',
        entityId: assistantId,
        parentId: courseId,
        createdAt: new Date().toISOString(),
        createdBy: userId,
        // If courseId is null, this is a global assistant
        isGlobalAssistant: !courseId,
        defaultAssistant: assistantId
      };
  
      await set(newAccessRef, accessConfig);
      
      const accessKey = newAccessRef.key;
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/student-portal/${userId}/${accessKey}`;
      
      await navigator.clipboard.writeText(link);
      return true;
    } catch (error) {
      console.error('Error generating access link:', error);
      return false;
    }
  };

  const renderGlobalAssistants = (courseId, assistants) => (
    <Card key={courseId} className="p-4 mb-4">
      <CollapsibleSection
        title="Global Assistants"
        icon={Bot}
        defaultExpanded={false}
      >
        <div className="space-y-2">
          {assistants.map(assistant => (
            <CollapsibleSection
              key={assistant.id}
              title={assistant.assistantName}
              icon={Bot}
              iconColor="text-purple-600"
              copyLinkAction={
                <CopyLinkButton
                  onClick={() => generateAccessLink(assistant.id)}
                  tooltip="Copy link to this assistant"
                />
              }
            />
          ))}
        </div>
      </CollapsibleSection>
    </Card>
  );

  const renderLessons = (lessons, courseId, unitId) => (
    <div className="space-y-2">
      {lessons?.map(lesson => {
        const typeStyles = getLessonTypeStyles(lesson.type);
        const lessonAssistants = assistants.filter(
          a => a.usage.type === 'lesson' && a.usage.entityId === lesson.id
        );

        return (
          <CollapsibleSection
            key={lesson.id}
            title={
              <div className="flex items-center gap-2">
                <span>{lesson.title}</span>
                <Badge className={typeStyles.badge}>
                  {lesson.type}
                </Badge>
              </div>
            }
            icon={typeStyles.icon}
            iconColor={typeStyles.color.split(' ')[0]}
          >
            {lessonAssistants.map(assistant => (
              <CollapsibleSection
                key={assistant.id}
                title={assistant.assistantName}
                icon={Bot}
                iconColor="text-purple-600"
                copyLinkAction={
                  <CopyLinkButton
                    onClick={() => generateAccessLink(assistant.id, courseId)}
                    tooltip="Copy link to this assistant"
                  />
                }
              />
            ))}
          </CollapsibleSection>
        );
      })}
    </div>
  );

  const renderUnits = (units, courseId) => (
    <div className="space-y-2">
      {units?.map(unit => {
        const unitAssistants = assistants.filter(
          a => a.usage.type === 'unit' && a.usage.entityId === unit.id
        );

        return (
          <CollapsibleSection
            key={unit.id}
            title={unit.title}
            icon={Library}
            iconColor="text-indigo-600"
          >
            {unitAssistants.length > 0 && (
              <div className="space-y-2 mb-4">
                {unitAssistants.map(assistant => (
                  <CollapsibleSection
                    key={assistant.id}
                    title={assistant.assistantName}
                    icon={Bot}
                    iconColor="text-purple-600"
                    copyLinkAction={
                      <CopyLinkButton
                        onClick={() => generateAccessLink(assistant.id, courseId)}
                        tooltip="Copy link to this assistant"
                      />
                    }
                  />
                ))}
              </div>
            )}
            {renderLessons(unit.lessons, courseId, unit.id)}
          </CollapsibleSection>
        );
      })}
    </div>
  );

  const renderCourses = () => (
    <>
      {Object.entries(courses).map(([courseId, course]) => {
        if (courseId === 'courseless-assistants') {
          const globalAssistants = assistants.filter(
            a => a.usage.type === 'course' && a.usage.entityId === courseId
          );
          return renderGlobalAssistants(courseId, globalAssistants);
        }

        const courseAssistants = assistants.filter(
          a => a.usage.type === 'course' && a.usage.entityId === courseId
        );

        return (
          <Card key={courseId} className="p-4 mb-4">
            <CollapsibleSection
              title={course.title}
              icon={BookOpen}
            >
              {courseAssistants.length > 0 && (
                <div className="space-y-2 mb-4">
                  {courseAssistants.map(assistant => (
                    <CollapsibleSection
                      key={assistant.id}
                      title={assistant.assistantName}
                      icon={Bot}
                      iconColor="text-purple-600"
                      copyLinkAction={
                        <CopyLinkButton
                          onClick={() => generateAccessLink(assistant.id, courseId)}
                          tooltip="Copy link to this assistant"
                        />
                      }
                    />
                  ))}
                </div>
              )}
              {renderUnits(course.units, courseId)}
            </CollapsibleSection>
          </Card>
        );
      })}
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Share Course Content</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <ScrollArea className="h-[600px] pr-4">
            {renderCourses()}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LinkGenerator;
