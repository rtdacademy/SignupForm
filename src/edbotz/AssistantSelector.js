import React, { useState } from 'react';
import { Bot, ChevronRight, Pencil } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from '../components/ui/card';
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
import { Library, BookOpen } from 'lucide-react';
import AIChatApp from './AIChatApp';

const AssistantSelector = ({ 
    assistants, 
    courses,
    selectedAssistant,
    onAssistantSelect,
    onEditAssistant,
    firebaseApp 
  }) => {
    const [isOpen, setIsOpen] = useState(false);
  
    // Group assistants by their location
    const organizedAssistants = React.useMemo(() => {
      const organized = {
        global: [],
        courses: new Map(),
        units: new Map(),
        lessons: new Map(),
      };
  
      assistants.forEach((assistant) => {
        if (!assistant.usage) return;
  
        const { type, entityId, parentId } = assistant.usage;
        const course = type === 'course' ? courses[entityId] : courses[parentId];
  
        if (!course) return;
  
        switch (type) {
          case 'course':
            if (entityId === 'courseless-assistants') {
              organized.global.push(assistant);
            } else {
              if (!organized.courses.has(entityId)) {
                organized.courses.set(entityId, []);
              }
              organized.courses.get(entityId).push(assistant);
            }
            break;
          case 'unit':
            if (!organized.units.has(parentId)) {
              organized.units.set(parentId, new Map());
            }
            if (!organized.units.get(parentId).has(entityId)) {
              organized.units.get(parentId).set(entityId, []);
            }
            organized.units.get(parentId).get(entityId).push(assistant);
            break;
          case 'lesson':
            if (!organized.lessons.has(parentId)) {
              organized.lessons.set(parentId, new Map());
            }
            if (!organized.lessons.get(parentId).has(entityId)) {
              organized.lessons.get(parentId).set(entityId, []);
            }
            organized.lessons.get(parentId).get(entityId).push(assistant);
            break;
          default:
            break;
        }
      });
  
      return organized;
    }, [assistants, courses]);
  
    return (
      <Card className="w-full h-full flex flex-col">
        <CardHeader>
          <div className="flex flex-col space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex flex-col space-y-1">
                <CardTitle>AI Assistant Chat</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select an assistant to start chatting
                </p>
              </div>
              {selectedAssistant && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditAssistant(selectedAssistant)}
                  className="flex items-center gap-2 hover:bg-gray-100"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Assistant
                </Button>
              )}
            </div>
            
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  role="combobox"
                  aria-expanded={isOpen}
                >
                  {selectedAssistant
                    ? selectedAssistant.assistantName
                    : 'Select an assistant'}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[300px]" align="start">
                <DropdownMenuLabel>Select Assistant</DropdownMenuLabel>
                <DropdownMenuSeparator />
  
                {/* Global Assistants */}
                {organizedAssistants.global.length > 0 && (
                  <>
                    <DropdownMenuLabel>Global Assistants</DropdownMenuLabel>
                    {organizedAssistants.global.map((assistant) => (
                      <DropdownMenuItem
                        key={assistant.id}
                        onSelect={() => onAssistantSelect(assistant)}
                      >
                        <Bot className="w-4 h-4 mr-2 text-purple-600" />
                        {assistant.assistantName}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </>
                )}
  
                {/* Course-specific Assistants */}
                {Array.from(organizedAssistants.courses.entries()).map(
                  ([courseId, courseAssistants]) => {
                    const course = courses[courseId];
                    if (!course || courseAssistants.length === 0) return null;
  
                    return (
                      <DropdownMenuSub key={courseId}>
                        <DropdownMenuSubTrigger>
                          <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
                          {course.title}
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                            {courseAssistants.map((assistant) => (
                              <DropdownMenuItem
                                key={assistant.id}
                                onSelect={() => onAssistantSelect(assistant)}
                              >
                                <Bot className="w-4 h-4 mr-2 text-blue-600" />
                                {assistant.assistantName}
                              </DropdownMenuItem>
                            ))}
  
                            {/* Unit Assistants */}
                            {organizedAssistants.units.has(courseId) &&
                              course.units.map((unit) => {
                                const unitAssistants = organizedAssistants.units
                                  .get(courseId)
                                  ?.get(unit.id);
                                if (!unitAssistants?.length) return null;
  
                                return (
                                  <DropdownMenuSub key={unit.id}>
                                    <DropdownMenuSubTrigger>
                                      <Library className="w-4 h-4 mr-2 text-indigo-600" />
                                      {unit.title}
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                      <DropdownMenuSubContent>
                                        {unitAssistants.map((assistant) => (
                                          <DropdownMenuItem
                                            key={assistant.id}
                                            onSelect={() => onAssistantSelect(assistant)}
                                          >
                                            <Bot className="w-4 h-4 mr-2 text-indigo-600" />
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
                  }
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
  
        <CardContent className="flex-1 min-h-0 p-0">
          {selectedAssistant ? (
            <AIChatApp
              firebaseApp={firebaseApp}
              mode="embedded"
              assistant={selectedAssistant}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select an assistant to start chatting
            </div>
          )}
        </CardContent>
      </Card>
    );
  };
  
  export default AssistantSelector;