import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getDatabase, ref, get } from 'firebase/database';
import { 
  Bot, 
  Library, 
  BookOpen, 
  Info,
  ChevronRight,
  GraduationCap,
  Menu,
  X
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
import AIChatApp from './AIChatApp';
import { Alert, AlertDescription } from '../components/ui/alert';

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

const WelcomeMessage = ({ onDismiss }) => {
  return (
    <Alert className="mb-6 relative bg-blue-50 border-blue-200">
      <div className="flex items-start gap-3">
        <Bot className="h-5 w-5 text-blue-600 mt-0.5" />
        <div className="space-y-2 flex-1">
          <AlertDescription className="text-sm text-blue-800">
            Select where you want help:
            <ul className="mt-2 space-y-1">
              <li>• Course-level AI can help with general course questions</li>
              <li>• Unit-level AI understands specific unit concepts</li>
              <li>• Lesson-level AI has detailed knowledge about individual lessons</li>
            </ul>
          </AlertDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-blue-100"
          onClick={onDismiss}
        >
          <X className="h-4 w-4 text-blue-600" />
        </Button>
      </div>
    </Alert>
  );
};

const BotCountBadge = ({ count, type = 'general', variant = 'secondary' }) => {
  if (count === 0) return null;
  
  // Get the color based on type
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

const ContextSelector = ({ courseData, onContextSelect, availableAssistants }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  // Count assistants at each level
  const getCounts = () => {
    const counts = {
      course: availableAssistants.filter(a => a.entityType === 'course').length,
      units: {},
      lessons: {}
    };

    courseData.units?.forEach(unit => {
      counts.units[unit.id] = availableAssistants.filter(
        a => a.entityType === 'unit' && a.contextData?.id === unit.id
      ).length;

      unit.lessons?.forEach(lesson => {
        counts.lessons[lesson.id] = availableAssistants.filter(
          a => a.entityType === 'lesson' && a.contextData?.id === lesson.id
        ).length;
      });
    });

    return counts;
  };

  const counts = getCounts();

  return (
    <div className="space-y-4">
      {showWelcome && (
        <WelcomeMessage onDismiss={() => setShowWelcome(false)} />
      )}
      
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
          
          {/* Course Option */}
          <DropdownMenuItem
            onClick={() => {
              onContextSelect({ type: 'course', data: courseData });
              setIsOpen(false);
            }}
          >
            <div className="flex items-center w-full">
              <BookOpen className="w-4 h-4 text-blue-600 mr-2" />
              <span className="flex-1">{courseData.title}</span>
              <BotCountBadge count={counts.course} type="course" />
            </div>
          </DropdownMenuItem>

          {/* Units and Lessons */}
          {courseData.units?.map(unit => (
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
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const AssistantList = ({ context, availableAssistants, onAssistantSelect }) => {
  const filteredAssistants = availableAssistants.filter(assistant => {
    if (context.type === 'course') {
      return assistant.entityType === 'course';
    } else if (context.type === 'unit') {
      return assistant.entityType === 'unit' && 
             assistant.contextData?.id === context.data.id;
    } else if (context.type === 'lesson') {
      return assistant.entityType === 'lesson' && 
             assistant.contextData?.id === context.data.id;
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
    <div className="grid gap-3">
      {filteredAssistants.map((assistant) => (
        <Button
          key={assistant.id}
          variant="outline"
          className={`w-full p-4 h-auto flex items-center gap-3 hover:bg-gray-50 group ${
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
      ))}
    </div>
  );
};

const Sidebar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
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

const DescriptionContent = ({ html }) => {
  if (!html) return null;
  
  return (
    <div 
      className="prose prose-sm max-w-none mt-2
        prose-p:my-3 prose-p:leading-relaxed
        prose-em:text-gray-700 prose-em:font-medium
        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
        prose-a:font-medium prose-a:transition-colors
        first:prose-p:mt-0 last:prose-p:mb-0
        prose-ul:my-3 prose-ul:list-disc prose-ul:pl-6
        prose-li:my-0 prose-li:leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

const StudentPortal = () => {
  const { userId, accessKey } = useParams();
  const [accessConfig, setAccessConfig] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [availableAssistants, setAvailableAssistants] = useState([]);
  const [selectedAssistant, setSelectedAssistant] = useState(null);
  const [selectedContext, setSelectedContext] = useState(null);
  const [sidebarContext, setSidebarContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add cleanup function
  const cleanup = useCallback(() => {
    // Reset states related to the current assistant
    setSelectedAssistant(null);
    setSelectedContext(null);
  }, []);

  useEffect(() => {
    const fetchAccess = async () => {
      try {
        const db = getDatabase();
        
        // Fetch access configuration
        const accessRef = ref(db, `edbotz/studentAccess/${userId}/${accessKey}`);
        const accessSnapshot = await get(accessRef);
        
        if (!accessSnapshot.exists()) {
          throw new Error('Invalid access link');
        }
        
        const accessData = accessSnapshot.val();
        setAccessConfig(accessData);

        // Fetch all assistants for the course owner
        const assistantsRef = ref(db, `edbotz/assistants/${userId}`);
        const assistantsSnapshot = await get(assistantsRef);
        
        let assistantsData = {};
        if (assistantsSnapshot.exists()) {
          assistantsData = assistantsSnapshot.val();
        }
        
        // If this is a course-specific access
        if (accessData.parentId) {
          // Fetch course data
          const courseRef = ref(db, `edbotz/courses/${userId}/${accessData.parentId}`);
          const courseSnapshot = await get(courseRef);
          
          if (courseSnapshot.exists()) {
            const courseDataFetched = {
              ...courseSnapshot.val(),
              id: accessData.parentId
            };
            
            setCourseData(courseDataFetched);
            
            // Process and set available assistants
            const processedAssistants = processAssistants(assistantsData, courseDataFetched);
            setAvailableAssistants(processedAssistants);
            
            // Set the selected assistant based on access configuration
            const defaultAssistant = processedAssistants.find(a => a.id === accessData.entityId);
            if (defaultAssistant) {
              await cleanup();
              setSelectedAssistant(defaultAssistant);
              
              // Set both sidebar and selected context based on the assistant's type
              const newContext = {
                type: defaultAssistant.entityType,
                data: defaultAssistant.contextData,
                unitData: defaultAssistant.unitData
              };
              
              setSidebarContext(newContext);
              setSelectedContext(newContext);
            }
          }
        } else {
          // For global assistant access
          const assistantData = assistantsData[accessData.entityId];
          if (assistantData) {
            const enhancedAssistant = {
              ...assistantData,
              id: accessData.entityId,
              usage: {
                ownerId: userId,
                type: accessData.type,
                entityId: accessData.entityId
              }
            };
            await cleanup();
            setSelectedAssistant(enhancedAssistant);
            setAvailableAssistants([enhancedAssistant]);
          }
        }
        
      } catch (err) {
        console.error('Error fetching access:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAccess();
  }, [userId, accessKey, cleanup]);

  // Update the process assistants function to handle empty or invalid data
  const processAssistants = (assistantsData, course) => {
    const processedAssistants = [];
    
    if (!assistantsData || !course) return processedAssistants;

    // Process course-level assistants
    if (course.assistants) {
      Object.entries(course.assistants).forEach(([id, isEnabled]) => {
        if (isEnabled && assistantsData[id]) {
          processedAssistants.push({
            id,
            ...assistantsData[id],
            entityType: 'course',
            contextData: course,
            usage: {
              type: 'course',
              entityId: course.id,
              ownerId: course.ownerId
            }
          });
        }
      });
    }

    // Process unit and lesson level assistants
    course.units?.forEach(unit => {
      // Unit-level assistants
      if (unit.assistants) {
        Object.entries(unit.assistants).forEach(([id, isEnabled]) => {
          if (isEnabled && assistantsData[id]) {
            processedAssistants.push({
              id,
              ...assistantsData[id],
              entityType: 'unit',
              contextData: unit,
              usage: {
                type: 'unit',
                entityId: unit.id,
                parentId: course.id,
                ownerId: course.ownerId
              }
            });
          }
        });
      }

      // Lesson-level assistants
      unit.lessons?.forEach(lesson => {
        if (lesson.assistants) {
          Object.entries(lesson.assistants).forEach(([id, isEnabled]) => {
            if (isEnabled && assistantsData[id]) {
              processedAssistants.push({
                id,
                ...assistantsData[id],
                entityType: 'lesson',
                contextData: lesson,
                unitData: unit,
                usage: {
                  type: 'lesson',
                  entityId: lesson.id,
                  parentId: course.id,
                  ownerId: course.ownerId
                }
              });
            }
          });
        }
      });
    });

    return processedAssistants;
  };

  const handleContextSelect = (context) => {
    setSidebarContext(context);
    setSelectedContext(context);
    setSelectedAssistant(null);
  };

  const handleAssistantSelect = useCallback(async (assistant) => {
    // Clean up current assistant before switching
    await cleanup();
    
    // Update selected assistant with proper metadata
    const enhancedAssistant = {
      ...assistant,
      usage: {
        ...assistant.usage,
        ownerId: userId // Ensure we have the owner ID
      }
    };
    
    setSelectedAssistant(enhancedAssistant);
    setSelectedContext({
      type: enhancedAssistant.entityType,
      data: enhancedAssistant.contextData,
      unitData: enhancedAssistant.unitData
    });
  }, [cleanup, userId]);

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
            <DescriptionContent html={data.description} />
          </>
        )}

        {type === 'unit' && (
          <>
            <div className="flex items-center gap-2 mb-2">
              <Library className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-indigo-600">{data.title}</h3>
            </div>
            <DescriptionContent html={data.description} />
          </>
        )}

        {type === 'course' && (
          <>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-600">{data.title}</h3>
            </div>
            <DescriptionContent html={data.description} />
          </>
        )}
      </div>
    );
  };

  const renderSidebarContent = () => (
    <div className="space-y-6">
      <div>
        <ContextSelector 
          courseData={courseData}
          onContextSelect={handleContextSelect}
          availableAssistants={availableAssistants}
        />
      </div>

      {sidebarContext && (
        <>
          {renderContextPanel()}
          
          <div>
            <h2 className="text-lg font-semibold mb-3">Available Assistants</h2>
            <AssistantList
              context={sidebarContext}
              availableAssistants={availableAssistants}
              onAssistantSelect={handleAssistantSelect}
            />
          </div>
        </>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Info className="w-12 h-12 text-red-600 mx-auto" />
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-red-600">Access Error</h2>
                <p className="text-sm text-gray-600">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[100vh] bg-gray-50 mx-auto w-full p-6">
      <Card className="h-[calc(95vh-1rem)] shadow-lg">
        <div className="flex h-full">
          {/* Only show sidebar if not a global assistant access */}
          {(!accessConfig?.isGlobalAssistant) && (
            <>
              {/* Desktop Sidebar */}
              <div className="hidden lg:block w-1/4 min-w-[300px] max-w-[400px] h-full overflow-y-auto border-r bg-white p-6">
                {renderSidebarContent()}
              </div>

              {/* Mobile Sidebar */}
              <Sidebar>
                {renderSidebarContent()}
              </Sidebar>
            </>
          )}

          {/* Main Content */}
          <div className="flex-1 h-full overflow-hidden">
            <div className="h-full bg-white">
              {selectedAssistant ? (
                <AIChatApp
                  key={selectedAssistant.id} // Add key to force remount
                  assistant={selectedAssistant}
                  mode="embedded"
                  firebaseApp={window.firebaseApp}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-center text-gray-500 p-4">
                  <div>
                    <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>
                      {availableAssistants.length > 0 
                        ? "Select a location and assistant to start chatting" 
                        : "No assistants available for this content."}
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

export default StudentPortal;
