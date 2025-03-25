// EntityAssistants.jsx
import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { Bot, FileEdit, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";

const EntityAssistants = ({ 
  type, 
  entityId, 
  parentId, 
  assistants, 
  onManageAI, 
  onDeleteAssistant,
  isDefaultCourse,
  className = "" 
}) => {
  const { user } = useAuth();
  const [assistantsList, setAssistantsList] = useState([]);
  const [localAssistants, setLocalAssistants] = useState(assistants);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for changes to relevant assistants
  useEffect(() => {
    if (!user?.uid || !entityId) return;
  
    const db = getDatabase();
    const cleanupFns = [];
  
    if (type === 'course') {
      const courseRef = ref(db, `edbotz/courses/${user.uid}/${entityId}`);
      const unsubscribe = onValue(courseRef, (snapshot) => {
        const courseData = snapshot.val();
        setLocalAssistants(courseData?.assistants || {});
      });
      cleanupFns.push(unsubscribe);
    } 
    else if (type === 'unit' && parentId) {
      const courseRef = ref(db, `edbotz/courses/${user.uid}/${parentId}`);
      const unsubscribe = onValue(courseRef, (snapshot) => {
        const courseData = snapshot.val();
        if (courseData?.units) {
          const unit = courseData.units.find(u => u.id === entityId);
          if (unit) {
            setLocalAssistants(unit.assistants || {});
          }
        }
      });
      cleanupFns.push(unsubscribe);
    }
    else if (type === 'lesson' && parentId) {
      const courseRef = ref(db, `edbotz/courses/${user.uid}/${parentId}`);
      const unsubscribe = onValue(courseRef, (snapshot) => {
        const courseData = snapshot.val();
        if (courseData?.units) {
          const unit = courseData.units.find(u => 
            u.lessons && u.lessons.some(l => l.id === entityId)
          );
          
          if (unit) {
            const lesson = unit.lessons.find(l => l.id === entityId);
            if (lesson) {
              setLocalAssistants(lesson.assistants || {});
            }
          }
        }
      });
      cleanupFns.push(unsubscribe);
    }
  
    return () => cleanupFns.forEach(fn => fn());
  }, [user?.uid, type, entityId, parentId]);

  // Listen for assistant details
  useEffect(() => {
    if (!user?.uid) {
      setAssistantsList([]);
      setIsLoading(false);
      return;
    }
  
    setIsLoading(true);
    const db = getDatabase();
    const assistantsRef = ref(db, `edbotz/assistants/${user.uid}`);

    const unsubscribe = onValue(assistantsRef, (snapshot) => {
      const allAssistants = snapshot.val();
      
      if (!allAssistants || !localAssistants) {
        setAssistantsList([]);
        setIsLoading(false);
        return;
      }
  
      const entityAssistants = Object.entries(allAssistants)
        .filter(([id, assistant]) => {
          // First check if assistant is active in current location
          const isActiveHere = localAssistants[id] === true;
          
          // Then check if assistant's usage matches current location
          const usage = assistant.usage || {};
          
          // Different matching logic based on type
          let locationMatches = false;
          if (type === 'course') {
            locationMatches = usage.type === type && usage.entityId === entityId;
          } else if (type === 'unit') {
            locationMatches = usage.type === type && 
              usage.entityId === entityId && 
              usage.parentId === parentId;
          } else if (type === 'lesson') {
            locationMatches = usage.type === type && 
              usage.entityId === entityId && 
              usage.parentId === parentId;
          }
  
          return isActiveHere && locationMatches;
        })
        .map(([id, assistant]) => ({
          id,
          ...assistant
        }));
  
      setAssistantsList(entityAssistants);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid, localAssistants, type, entityId, parentId]);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">
          {isDefaultCourse ? 'Global AI Teaching Assistants' : 'AI Assistants'}
        </h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                onClick={() => onManageAI(type, entityId, parentId)}
                className={`bg-gradient-to-r ${
                  isDefaultCourse 
                    ? 'from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                    : 'from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                } text-white transition-all duration-200`}
              >
                <Bot className="w-4 h-4 mr-2" />
                Add Assistant
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create a new AI teaching assistant</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {isLoading ? (
        <div className="text-sm text-gray-500">Loading assistants...</div>
      ) : assistantsList.length > 0 ? (
        <div className="grid gap-2">
          {assistantsList.map(assistant => (
            <Card key={assistant.id} className="p-3">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{assistant.assistantName}</h4>
                  <p className="text-sm text-gray-500">{assistant.model} model</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onManageAI(type, entityId, parentId, assistant.id)}
                  >
                    <FileEdit className="w-4 h-4 mr-2" /> Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteAssistant(assistant.id, type, entityId, parentId);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500">No assistants added yet</div>
      )}
    </div>
  );
};

export default EntityAssistants;