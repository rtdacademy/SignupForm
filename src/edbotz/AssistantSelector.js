import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bot, 
  Library, 
  BookOpen, 
  Info,
  ChevronRight,
  GraduationCap,
  Menu,
  X,
  Copy,
  Code,
  Check
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '../components/ui/dropdown-menu';
//import { Alert, AlertDescription } from '../components/ui/alert';
import AIChatApp from './AIChatApp';
import { getDatabase, ref, push, set } from 'firebase/database';
import { cn } from '../lib/utils';

const LESSON_TYPES = {
  general: {
    value: 'general',
    label: 'General',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    badge: 'bg-gray-100 text-gray-700'
  },
  lesson: {
    value: 'lesson',
    label: 'Lesson',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    badge: 'bg-blue-100 text-blue-700'
  },
  assignment: {
    value: 'assignment',
    label: 'Assignment',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    badge: 'bg-green-100 text-green-700'
  },
  quiz: {
    value: 'quiz',
    label: 'Quiz',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    badge: 'bg-amber-100 text-amber-700'
  },
  exam: {
    value: 'exam',
    label: 'Exam',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    badge: 'bg-red-100 text-red-700'
  },
  project: {
    value: 'project',
    label: 'Project',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    badge: 'bg-purple-100 text-purple-700'
  }
};



const BotCountBadge = ({ count, type = 'general', variant = 'secondary' }) => {
  if (count === 0) return null;
  
  const getColor = () => {
    switch (type) {
      case 'course':
        return 'text-blue-600';
      case 'unit':
        return 'text-indigo-600';
      default:
        return LESSON_TYPES[type || 'general'].color;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'course':
        return 'bg-blue-50';
      case 'unit':
        return 'bg-indigo-50';
      default:
        return LESSON_TYPES[type || 'general'].bgColor;
    }
  };

  return (
    <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full ${getBgColor()}`}>
      {[...Array(count)].map((_, i) => (
        <Bot key={i} className={`w-3.5 h-3.5 ${getColor()}`} />
      ))}
    </div>
  );
};

const ContextSelector = ({ courses, onContextSelect, availableAssistants }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const getCounts = () => {
    const counts = {
      course: {},
      units: {},
      lessons: {}
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

  return (
    <div className="space-y-4">
      

      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
            role="combobox"
            aria-expanded={isOpen}
          >
            <span>Select Location</span>
            <ChevronRight className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[300px]" align="start">
          <DropdownMenuLabel>Select Location</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {Object.entries(courses).map(([courseId, course]) => (
            <React.Fragment key={courseId}>
              <DropdownMenuItem
                onClick={() => {
                  onContextSelect({ type: 'course', data: course });
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center w-full">
                  <BookOpen className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="flex-1">{course.title}</span>
                  <BotCountBadge count={counts.course[courseId]} type="course" />
                </div>
              </DropdownMenuItem>

              {course.units?.map(unit => (
                <React.Fragment key={unit.id}>
                  <DropdownMenuItem
                    onClick={() => {
                      onContextSelect({ type: 'unit', data: unit });
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-center w-full">
                      <Library className="w-4 h-4 text-indigo-600 mr-2" />
                      <span className="flex-1">{unit.title}</span>
                      <BotCountBadge count={counts.units[unit.id]} type="unit" />
                    </div>
                  </DropdownMenuItem>
                  
                  {unit.lessons?.map(lesson => (
                    <DropdownMenuItem
                      key={lesson.id}
                      className="pl-6"
                      onClick={() => {
                        onContextSelect({ 
                          type: 'lesson', 
                          data: lesson,
                          unitData: unit
                        });
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-center w-full">
                        <GraduationCap className={`w-4 h-4 mr-2 ${LESSON_TYPES[lesson.type || 'general'].color}`} />
                        <span className="flex-1">{lesson.title}</span>
                        <div className="flex items-center gap-2">
                          <Badge className={LESSON_TYPES[lesson.type || 'general'].badge}>
                            {LESSON_TYPES[lesson.type || 'general'].label}
                          </Badge>
                          <BotCountBadge count={counts.lessons[lesson.id]} type={lesson.type || 'general'} />
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const AssistantList = ({ context, availableAssistants, onAssistantSelect, userId, firebaseApp }) => {
  const [copyStatus, setCopyStatus] = useState({});
  const [embedCopyStatus, setEmbedCopyStatus] = useState({});

  const generateAccessLink = async (assistant) => {
    try {
      const db = getDatabase(firebaseApp);
      const accessRef = ref(db, `edbotz/studentAccess/${userId}`);
      const newAccessRef = push(accessRef);

      const accessConfig = {
        type: 'assistant',
        entityId: assistant.id,
        parentId: assistant.usage.type === 'course' ? assistant.usage.entityId : assistant.usage.parentId,
        createdAt: new Date().toISOString(),
        createdBy: userId,
        defaultAssistant: assistant.id,
      };

      await set(newAccessRef, accessConfig);
      const accessKey = newAccessRef.key;
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/student-portal/${userId}/${accessKey}`;
      
      await navigator.clipboard.writeText(link);
      setCopyStatus(prev => ({ ...prev, [assistant.id]: true }));
      setTimeout(() => setCopyStatus(prev => ({ ...prev, [assistant.id]: false })), 2000);
    } catch (error) {
      console.error('Error generating access link:', error);
    }
  };

  const copyEmbedCode = async (assistant) => {
    try {
      const db = getDatabase(firebaseApp);
      const accessRef = ref(db, `edbotz/studentAccess/${userId}`);
      const newAccessRef = push(accessRef);

      const accessConfig = {
        type: 'assistant',
        entityId: assistant.id,
        parentId: assistant.usage.type === 'course' ? assistant.usage.entityId : assistant.usage.parentId,
        createdAt: new Date().toISOString(),
        createdBy: userId,
        defaultAssistant: assistant.id,
      };

      await set(newAccessRef, accessConfig);
      const accessKey = newAccessRef.key;
      const baseUrl = window.location.origin;
      const embedUrl = `${baseUrl}/student-portal/${userId}/${accessKey}`;
      
      const embedCode = `<iframe
  src="${embedUrl}"
  width="100%"
  height="650"
  frameborder="0"
  allow="clipboard-write"
  style="border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
></iframe>`;

      await navigator.clipboard.writeText(embedCode);
      setEmbedCopyStatus(prev => ({ ...prev, [assistant.id]: true }));
      setTimeout(() => setEmbedCopyStatus(prev => ({ ...prev, [assistant.id]: false })), 2000);
    } catch (error) {
      console.error('Error generating embed code:', error);
    }
  };

  const filteredAssistants = availableAssistants.filter(assistant => {
    if (context.type === 'course') {
      return assistant.usage.type === 'course' && 
             assistant.usage.entityId === context.data.id;
    } else if (context.type === 'unit') {
      return assistant.usage.type === 'unit' && 
             assistant.usage.entityId === context.data.id;
    } else if (context.type === 'lesson') {
      return assistant.usage.type === 'lesson' && 
             assistant.usage.entityId === context.data.id;
    }
    return false;
  });

  if (filteredAssistants.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No assistants available at this level</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {filteredAssistants.map((assistant) => (
        <div key={assistant.id} className="rounded-lg border bg-card overflow-hidden">
          {/* Main Assistant Button */}
          <Button
            variant="ghost"
            className={`w-full p-4 h-auto items-center gap-3 hover:bg-gray-50 group ${
              context.type === 'lesson'
                ? LESSON_TYPES[context.data.type || 'general'].bgColor
                : 'bg-white'
            }`}
            onClick={() => onAssistantSelect(assistant)}
          >
            <Bot className={`w-6 h-6 ${
              context.type === 'lesson'
                ? LESSON_TYPES[context.data.type || 'general'].color
                : context.type === 'unit'
                ? 'text-indigo-600'
                : 'text-blue-600'
            } group-hover:scale-110 transition-transform`} />
            <div className="flex-1 text-left">
              <h3 className="font-medium">{assistant.assistantName}</h3>
              {assistant.description && (
                <p className="text-sm text-gray-500 mt-1">{assistant.description}</p>
              )}
            </div>
          </Button>

          {/* Action Buttons */}
          <div className="px-4 py-2 bg-gray-50 border-t flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "flex-1 gap-2",
                copyStatus[assistant.id] && "text-green-600"
              )}
              onClick={() => generateAccessLink(assistant)}
            >
              {copyStatus[assistant.id] ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied Link
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "flex-1 gap-2",
                embedCopyStatus[assistant.id] && "text-green-600"
              )}
              onClick={() => copyEmbedCode(assistant)}
            >
              {embedCopyStatus[assistant.id] ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied Code
                </>
              ) : (
                <>
                  <Code className="w-4 h-4" />
                  Embed Code
                </>
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

const Sidebar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>Course Navigation</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              {children}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

const AssistantSelector = ({ assistants, courses, firebaseApp, userId }) => {
  const [selectedAssistant, setSelectedAssistant] = useState(null);
  const [selectedContext, setSelectedContext] = useState(null);
  const [sidebarContext, setSidebarContext] = useState(null);
  
  const handleContextSelect = (context) => {
    setSidebarContext(context);
    setSelectedContext(context);
    setSelectedAssistant(null);
  };

  const handleAssistantSelect = useCallback((assistant) => {
    setSelectedAssistant(assistant);
    setSelectedContext({
      type: assistant.usage.type,
      data: assistant.contextData,
      unitData: assistant.unitData
    });
  }, []);

  const renderContextPanel = () => {
    if (!selectedContext || !selectedContext.data) return null;

    const { type, data, unitData } = selectedContext;

    return (
      <div className={`${LESSON_TYPES[data.type || 'general'].bgColor} rounded-lg p-4`}>
        {type === 'lesson' && (
          <>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge className={LESSON_TYPES[data.type || 'general'].badge}>
                  {LESSON_TYPES[data.type || 'general'].label}
                </Badge>
                <span className="text-sm text-gray-500">Unit: {unitData?.title}</span>
              </div>
            </div>
            <h3 className={`text-lg font-semibold ${LESSON_TYPES[data.type || 'general'].color} mb-2`}>
              {data.title}
            </h3>
            {data.description && (
              <div 
                className="prose prose-sm mt-2"
                dangerouslySetInnerHTML={{ __html: data.description }}
              />
            )}
          </>
        )}

        {type === 'unit' && (
          <>
            <div className="flex items-center gap-2 mb-2">
              <Library className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-indigo-600">{data.title}</h3>
            </div>
            {data.description && (
              <div 
                className="prose prose-sm mt-2"
                dangerouslySetInnerHTML={{ __html: data.description }}
              />
            )}
          </>
        )}

        {type === 'course' && (
          <>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-600">{data.title}</h3>
            </div>
            {data.description && (
              <div 
                className="prose prose-sm mt-2"
                dangerouslySetInnerHTML={{ __html: data.description }}
              />
            )}
          </>
        )}
      </div>
    );
  };

  const renderSidebarContent = () => (
    <div className="space-y-6">
      <div>
        <ContextSelector 
          courses={courses}
          onContextSelect={handleContextSelect}
          availableAssistants={assistants}
        />
      </div>

      {sidebarContext && (
        <>
          {renderContextPanel()}
          
          <div>
            <h2 className="text-lg font-semibold mb-3">Available Assistants</h2>
            <AssistantList
              context={sidebarContext}
              availableAssistants={assistants}
              onAssistantSelect={handleAssistantSelect}
              userId={userId}
              firebaseApp={firebaseApp}
            />
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="h-full bg-gray-50 w-full">
      <Card className="h-full shadow-lg flex flex-col">
        <div className="flex flex-1 min-h-0"> {/* min-h-0 prevents flex item from overflowing */}
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-1/4 min-w-[300px] max-w-[400px] border-r bg-white">
            <div className="h-full overflow-y-auto p-6">
              {renderSidebarContent()}
            </div>
          </div>

          {/* Mobile Sidebar */}
          <Sidebar>
            {renderSidebarContent()}
          </Sidebar>

          {/* Main Content */}
          <div className="flex-1 min-h-0"> {/* min-h-0 prevents flex item from overflowing */}
            <div className="h-full bg-white">
              {selectedAssistant ? (
                <div className="h-full">
                  <AIChatApp
                    key={selectedAssistant.id}
                    assistant={selectedAssistant}
                    mode="embedded"
                    firebaseApp={firebaseApp}
                  />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center text-gray-500 p-4">
                  <div>
                    <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>
                      {assistants.length > 0 
                        ? "Select a location and assistant to start testing" 
                        : "No assistants available. Create one to get started."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}; 

export default AssistantSelector;
