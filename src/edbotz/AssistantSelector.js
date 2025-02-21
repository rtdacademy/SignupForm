import React, { useState, useCallback } from 'react';
import { Bot, Library, BookOpen, Info, Menu, X, PlusCircle } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet";
import AIAssistantSheet from './AIAssistantSheet';
import AIChatApp from './AIChatApp';
import AssistantList from './AssistantList';
import ContextSelector from './ContextSelector';
import { LESSON_TYPES } from './utils/settings';
import EmptyStateView from './components/EmptyStateView';

// Sidebar for mobile
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
            <div className="py-4">{children}</div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

const AssistantSelector = ({ assistants = [], courses, firebaseApp, userId }) => {
  const [selectedAssistant, setSelectedAssistant] = useState(null);
  const [selectedContext, setSelectedContext] = useState(null);
  const [sidebarContext, setSidebarContext] = useState(null);
  const [showAISheet, setShowAISheet] = useState(false);
  const [currentAIContext, setCurrentAIContext] = useState({
    type: null,
    entityId: null,
    parentId: null,
    existingAssistantId: null,
  });

  const handleContextSelect = useCallback((context) => {
    setSidebarContext(context);
    setSelectedContext(context);
    setSelectedAssistant(null);
  }, []);

  const handleAssistantSelect = useCallback((assistant) => {
    setSelectedAssistant(assistant);
    if (assistant) {
      setSelectedContext({
        type: assistant.usage.type,
        data: assistant.contextData,
        unitData: assistant.unitData,
      });
    } else {
      // When deselecting, set the selected context to null (or you could keep the previous context if needed)
      setSelectedContext(null);
    }
  }, []);
  

  // Called when clicking "Create New Assistant"
  const handleCreateAssistant = () => {
    setCurrentAIContext({
      type: sidebarContext?.type || 'course',
      entityId: sidebarContext?.data?.id || 'courseless-assistants',
      parentId: sidebarContext?.type === 'unit' ? sidebarContext?.data?.courseId : null,
      existingAssistantId: null,
    });
    setShowAISheet(true);
  };

  // For editing, we now simply re-use the currently selected context
  // and add the assistant id.
  const handleAssistantEdit = (assistant) => {
    setCurrentAIContext({
      type: sidebarContext?.type || 'course',
      entityId: sidebarContext?.data?.id || 'courseless-assistants',
      parentId: sidebarContext?.type === 'unit' ? sidebarContext?.data?.courseId : null,
      existingAssistantId: assistant.id,
    });
    setShowAISheet(true);
  };

  const handleAIAssistantSave = (assistantData) => {
    setShowAISheet(false);
    // Optionally refresh your assistants list here.
  };

  const isSimplifiedView = (context) => {
    if (!context) return false;
    return (
      context.type === 'all' ||
      (context.type === 'course' && context.data?.title === "Courseless Assistants")
    );
  };



  const renderSidebarContent = () => (
    <div className="space-y-6">
      <div>
        <ContextSelector 
          courses={courses}
          onContextSelect={handleContextSelect}
          availableAssistants={assistants}
          selectedContext={sidebarContext}
        />
      </div>
      {sidebarContext && (
        <>
          <Button
            onClick={handleCreateAssistant}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md transition-all duration-200 group"
          >
            <div className="flex items-center justify-center gap-2">
              <PlusCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              <span>Create New Assistant</span>
            </div>
          </Button>
          {!isSimplifiedView(sidebarContext)}
          <div>
            <h2 className="text-lg font-semibold mb-3">
              {isSimplifiedView(sidebarContext)
                ? (sidebarContext.type === 'all' ? 'All Assistants' : 'Courseless Assistants')
                : 'Available Assistants'}
            </h2>
            <ScrollArea className="h-[480px] pr-4">
              <AssistantList
                context={sidebarContext}
                availableAssistants={assistants}
                onAssistantSelect={handleAssistantSelect}
                onAssistantEdit={handleAssistantEdit}  // Pass the edit callback
                userId={userId}
                firebaseApp={firebaseApp}
                selectedAssistant={selectedAssistant}
              />
            </ScrollArea>
          </div>
        </>
      )}
    </div>
  );

  const getEmptyStateMessage = () => {
    if (!sidebarContext) {
      return "Select a location to view available assistants";
    }
    return (Array.isArray(assistants) && assistants.length > 0)
      ? "Select a location and assistant to start testing"
      : "No assistants available. Create one to get started.";
  };

  return (
    <div className="h-full bg-gray-50 w-full">
      <Card className="h-full shadow-lg flex flex-col">
        <div className="flex flex-1 min-h-0">
          <div className="hidden lg:block w-1/4 min-w-[300px] max-w-[400px] border-r bg-white">
            <div className="h-full overflow-y-auto p-6">
              {renderSidebarContent()}
            </div>
          </div>
          <Sidebar>
            {renderSidebarContent()}
          </Sidebar>
          <div className="flex-1 min-h-0">
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
                <EmptyStateView message={getEmptyStateMessage()} />
              )}
            </div>
          </div>
        </div>
      </Card>
      {showAISheet && (
        <AIAssistantSheet
          open={showAISheet}
          onOpenChange={setShowAISheet}
          onSave={handleAIAssistantSave}
          type={currentAIContext.type}
          entityId={currentAIContext.entityId}
          parentId={currentAIContext.parentId}
          existingAssistantId={currentAIContext.existingAssistantId}
          isDefaultCourse={currentAIContext.entityId === 'courseless-assistants'}
          selectedContext={sidebarContext} 
        />
      )}
    </div>
  );
};

export default AssistantSelector;
