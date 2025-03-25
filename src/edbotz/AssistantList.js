import React, { useState } from 'react';
import { Bot, Copy, Code, Check, PlusCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { getDatabase, ref, push, set } from 'firebase/database';
import { cn } from '../lib/utils';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../components/ui/accordion';
import { LESSON_TYPES } from './utils/settings';

const EmptyAssistantList = ({ contextType }) => (
  <div className="text-center py-8 px-4">
    <div className="mb-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse" />
      <div className="relative">
        <Bot className="w-12 h-12 mx-auto text-blue-600/60" />
      </div>
    </div>
    <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
      No Assistants Yet
    </h3>
    <p className="text-gray-500 text-sm mb-4">
      {contextType === 'all' 
        ? "You haven't created any AI assistants yet" 
        : "No AI assistants available at this level"}
    </p>
    <div className="flex items-center justify-center text-sm text-gray-500">
      <PlusCircle className="w-4 h-4 mr-2" />
      <span>Click "Create New Assistant" to get started</span>
    </div>
  </div>
);

const AssistantList = ({
  context,
  availableAssistants,
  onAssistantSelect,
  onAssistantEdit,
  userId,
  firebaseApp,
  selectedAssistant,
}) => {
  const [copyStatus, setCopyStatus] = useState({});
  const [embedCopyStatus, setEmbedCopyStatus] = useState({});

  const filteredAssistants = (availableAssistants || [])
    .filter(assistant => assistant != null)
    .filter(assistant => {
      if (context.type === 'all') {
        return true;
      }
      if (!context.data || !context.data.id) return false;
      if (context.type === 'course') {
        return assistant.usage.type === 'course' && assistant.usage.entityId === context.data.id;
      } else if (context.type === 'unit') {
        return assistant.usage.type === 'unit' && assistant.usage.entityId === context.data.id;
      } else if (context.type === 'lesson') {
        return assistant.usage.type === 'lesson' && assistant.usage.entityId === context.data.id;
      }
      return false;
    });

  const generateAccessLink = async (assistant) => {
    try {
      const db = getDatabase(firebaseApp);
      const accessRef = ref(db, `edbotz/studentAccess/${userId}`);
      const newAccessRef = push(accessRef);

      const isCourselessAssistant = 
        assistant.usage.type === 'course' && 
        assistant.usage.entityId === 'courseless-assistants';

      const accessConfig = {
        type: 'assistant',
        entityId: assistant.id,
        isGlobalAssistant: isCourselessAssistant,
        createdAt: new Date().toISOString(),
        createdBy: userId,
        defaultAssistant: assistant.id,
        ...(isCourselessAssistant ? {} : {
          parentId: assistant.usage.type === 'course'
            ? assistant.usage.entityId
            : assistant.usage.parentId
        })
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

      const isCourselessAssistant = 
        assistant.usage.type === 'course' && 
        assistant.usage.entityId === 'courseless-assistants';

      const accessConfig = {
        type: 'assistant',
        entityId: assistant.id,
        isGlobalAssistant: isCourselessAssistant,
        createdAt: new Date().toISOString(),
        createdBy: userId,
        defaultAssistant: assistant.id,
        ...(isCourselessAssistant ? {} : {
          parentId: assistant.usage.type === 'course'
            ? assistant.usage.entityId
            : assistant.usage.parentId
        })
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

  const getAssistantContextColor = (assistant) => {
    if (assistant.usage.type === 'lesson') {
      return LESSON_TYPES[assistant.contextData?.type || 'general'].color;
    } else if (assistant.usage.type === 'unit') {
      return 'text-indigo-600';
    }
    return 'text-blue-600';
  };

  const getAssistantType = (assistant) => {
    if (assistant.usage.type === 'course' && assistant.usage.entityId === 'courseless-assistants') {
      return 'Global';
    }
    return assistant.usage.type === 'course'
      ? 'Course'
      : assistant.usage.type === 'unit'
      ? 'Unit'
      : assistant.usage.type === 'lesson'
      ? 'Lesson'
      : '';
  };

  if (filteredAssistants.length === 0) {
    return <EmptyAssistantList contextType={context.type} />;
  }

  return (
    <Accordion 
      type="single" 
      collapsible
      value={selectedAssistant?.id}
    >
      {filteredAssistants.map((assistant) => (
        <AccordionItem key={assistant.id} value={assistant.id} className="border rounded-lg mb-2">
          <AccordionTrigger 
            onClick={() => onAssistantSelect(assistant)}
            className={cn(
              "px-3 py-2 hover:no-underline",
              "data-[state=open]:border-b"
            )}
            showExpandText={false}
          >
            <div className="flex items-center gap-2 w-full">
              <Bot className={cn(
                "w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110",
                getAssistantContextColor(assistant)
              )} />
              <div className="flex-1 min-w-0 max-w-[160px]">
                <h3 className="text-sm font-medium truncate" title={assistant.assistantName}>
                  {assistant.assistantName}
                </h3>
                <p className="text-xs text-gray-500 truncate">
                  {getAssistantType(assistant)} Assistant
                </p>
              </div>
            </div>
          </AccordionTrigger>
          
          <AccordionContent className="px-3 py-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "flex-1 gap-2 text-xs h-8",
                  copyStatus[assistant.id] && "text-green-600"
                )}
                onClick={() => generateAccessLink(assistant)}
              >
                {copyStatus[assistant.id] ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied Link
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Link
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "flex-1 gap-2 text-xs h-8",
                  embedCopyStatus[assistant.id] && "text-green-600"
                )}
                onClick={() => copyEmbedCode(assistant)}
              >
                {embedCopyStatus[assistant.id] ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied Code
                  </>
                ) : (
                  <>
                    <Code className="w-3.5 h-3.5" />
                    Embed Code
                  </>
                )}
              </Button>
            </div>
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 text-xs h-8"
                onClick={() => {
                  onAssistantSelect(null);
                  onAssistantEdit(assistant);
                }}
              >
                <Bot className="w-3.5 h-3.5" />
                Edit
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default AssistantList;