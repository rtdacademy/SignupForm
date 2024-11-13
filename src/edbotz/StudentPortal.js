import React, { useState, useEffect } from 'react';
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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '../components/ui/dropdown-menu';
import AIChatApp from './AIChatApp';

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

const processAssistants = (assistantsData, course) => {
  const processedAssistants = [];

  // Process course-level assistants
  Object.entries(assistantsData).forEach(([id, assistant]) => {
    if (course.assistants?.[id] === true) {
      processedAssistants.push({
        id,
        ...assistant,
        entityType: 'course',
        contextData: course,
        usage: {
          type: 'course',
          entityId: course.id
        }
      });
    }
  });

  // Process unit and lesson level assistants
  course.units?.forEach(unit => {
    // Unit-level assistants
    Object.entries(unit.assistants || {}).forEach(([id, isEnabled]) => {
      if (isEnabled === true && assistantsData[id]) {
        processedAssistants.push({
          id,
          ...assistantsData[id],
          entityType: 'unit',
          contextData: unit,
          usage: {
            type: 'unit',
            entityId: unit.id,
            parentId: course.id
          }
        });
      }
    });

    // Lesson-level assistants
    unit.lessons?.forEach(lesson => {
      Object.entries(lesson.assistants || {}).forEach(([id, isEnabled]) => {
        if (isEnabled === true && assistantsData[id]) {
          processedAssistants.push({
            id,
            ...assistantsData[id],
            entityType: 'lesson',
            contextData: lesson,
            unitData: unit,
            usage: {
              type: 'lesson',
              entityId: lesson.id,
              parentId: course.id
            }
          });
        }
      });
    });
  });

  return processedAssistants;
};

const AssistantSelector = ({ 
  selectedAssistant, 
  availableAssistants, 
  courseData, 
  onAssistantSelect, 
  isMobile = false 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Only render dropdown content when dropdown is open to prevent duplicate rendering
  const renderDropdownContent = () => (
    <DropdownMenuContent className="w-[300px]" align="start">
      <DropdownMenuLabel>Select Assistant</DropdownMenuLabel>
      <DropdownMenuSeparator />

      {/* Course-level assistants */}
      {availableAssistants
        .filter(a => a.entityType === 'course')
        .map(assistant => (
          <DropdownMenuItem
            key={assistant.id}
            onSelect={() => {
              onAssistantSelect(assistant);
              setIsDropdownOpen(false);
            }}
          >
            <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
            {assistant.assistantName}
          </DropdownMenuItem>
        ))}

      {/* Group assistants by unit */}
      {courseData?.units?.map(unit => {
        const unitAssistants = availableAssistants.filter(
          a => a.entityType === 'unit' && a.contextData?.id === unit.id
        );
        const lessonAssistants = availableAssistants.filter(
          a => a.entityType === 'lesson' && a.contextData?.id === unit.id
        );

        if (!unitAssistants.length && !lessonAssistants.length) return null;

        return (
          <DropdownMenuSub key={unit.id}>
            <DropdownMenuSubTrigger>
              <Library className="w-4 h-4 mr-2 text-indigo-600" />
              {unit.title}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {unitAssistants.map(assistant => (
                  <DropdownMenuItem
                    key={assistant.id}
                    onSelect={() => {
                      onAssistantSelect(assistant);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <Bot className="w-4 h-4 mr-2 text-indigo-600" />
                    {assistant.assistantName}
                  </DropdownMenuItem>
                ))}

                {unit.lessons?.map(lesson => {
                  const lessonAssistants = availableAssistants.filter(
                    a => a.entityType === 'lesson' && a.contextData?.id === lesson.id
                  );

                  if (!lessonAssistants.length) return null;

                  return (
                    <DropdownMenuSub key={lesson.id}>
                      <DropdownMenuSubTrigger>
                        <div className="flex items-center gap-2">
                          <GraduationCap className={`w-4 h-4 ${LESSON_TYPES[lesson.type || 'general'].color}`} />
                          <span>{lesson.title}</span>
                          <Badge className={LESSON_TYPES[lesson.type || 'general'].badge}>
                            {LESSON_TYPES[lesson.type || 'general'].label}
                          </Badge>
                        </div>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          {lessonAssistants.map(assistant => (
                            <DropdownMenuItem
                              key={assistant.id}
                              onSelect={() => {
                                onAssistantSelect(assistant);
                                setIsDropdownOpen(false);
                              }}
                            >
                              <Bot className={`w-4 h-4 mr-2 ${LESSON_TYPES[lesson.type || 'general'].color}`} />
                              {assistant.assistantName}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  );
                })}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        );
      })}
    </DropdownMenuContent>
  );

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          role="combobox"
          aria-expanded={isDropdownOpen}
        >
          {selectedAssistant ? (
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-600" />
              {selectedAssistant.assistantName}
            </div>
          ) : (
            'Select an assistant'
          )}
          <ChevronRight className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      {isDropdownOpen && renderDropdownContent()}
    </DropdownMenu>
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

const StudentPortal = () => {
  const { userId, accessKey } = useParams();
  const [accessConfig, setAccessConfig] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [availableAssistants, setAvailableAssistants] = useState([]);
  const [selectedAssistant, setSelectedAssistant] = useState(null);
  const [selectedContext, setSelectedContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchAccess = async () => {
      try {
        const db = getDatabase();
        
        const accessRef = ref(db, `edbotz/studentAccess/${userId}/${accessKey}`);
        const accessSnapshot = await get(accessRef);
        
        if (!accessSnapshot.exists()) {
          throw new Error('Invalid access link');
        }
        
        const accessData = accessSnapshot.val();
        setAccessConfig(accessData);

        let course = null;
        let shouldLoadFullCourse = !accessData.isGlobalAssistant;
        
        // Load course data if we should show the full course
        if (shouldLoadFullCourse && (accessData.type === 'course' || accessData.parentId)) {
          const courseId = accessData.type === 'course' ? accessData.entityId : accessData.parentId;
          const courseRef = ref(db, `edbotz/courses/${userId}/${courseId}`);
          const courseSnapshot = await get(courseRef);
          
          if (courseSnapshot.exists()) {
            course = { ...courseSnapshot.val(), id: courseId };
            setCourseData(course);
          } else {
            throw new Error('Course not found');
          }
        }
        
        // Load assistants
        const assistantsRef = ref(db, `edbotz/assistants/${userId}`);
        const assistantsSnapshot = await get(assistantsRef);
        
        if (assistantsSnapshot.exists()) {
          const assistantsData = assistantsSnapshot.val();
          let allowedAssistants = [];

          if (course) {
            // Load all course assistants
            allowedAssistants = processAssistants(assistantsData, course);
          } else if (accessData.isGlobalAssistant) {
            // Load only the specific global assistant
            const assistant = assistantsData[accessData.entityId];
            if (assistant) {
              allowedAssistants = [{
                id: accessData.entityId,
                ...assistant,
                entityType: 'assistant'
              }];
            }
          }
          
          setAvailableAssistants(allowedAssistants);
          
          // Set default assistant based on access configuration
          if (accessData.defaultAssistant && allowedAssistants.length > 0) {
            const defaultAssistant = allowedAssistants.find(a => a.id === accessData.defaultAssistant);
            if (defaultAssistant) {
              setSelectedAssistant(defaultAssistant);
              updateContextFromAssistant(defaultAssistant);
            }
          } else if (allowedAssistants.length > 0) {
            // Fall back to first assistant if no default specified
            setSelectedAssistant(allowedAssistants[0]);
            updateContextFromAssistant(allowedAssistants[0]);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching access:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAccess();
  }, [userId, accessKey]);

  const updateContextFromAssistant = (assistant) => {
    if (!assistant) {
      setSelectedContext(null);
      return;
    }

    setSelectedContext({
      type: assistant.entityType,
      data: assistant.contextData,
      unitData: assistant.unitData
    });
  };

  const handleAssistantSelect = (assistant) => {
    setSelectedAssistant(assistant);
    updateContextFromAssistant(assistant);
    setIsSidebarOpen(false); // Close mobile sidebar after selection
  };

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
    <div className="space-y-4">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Select Assistant</h2>
        <AssistantSelector
          selectedAssistant={selectedAssistant}
          availableAssistants={availableAssistants}
          courseData={courseData}
          onAssistantSelect={handleAssistantSelect}
        />
      </div>
      {selectedContext && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Assistant Location</h2>
          {renderContextPanel()}
        </div>
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
              <div className="lg:hidden fixed top-4 left-4 z-50">
                <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                      {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                    <SheetHeader>
                      <SheetTitle>Course Navigation</SheetTitle>
                    </SheetHeader>
                    <div className="py-4">
                      {renderSidebarContent()}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </>
          )}

          {/* Main Content */}
          <div className="flex-1 h-full overflow-hidden">
            <div className="h-full bg-white">
              {selectedAssistant ? (
                <AIChatApp
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
                        ? "Select an assistant to start chatting" 
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
