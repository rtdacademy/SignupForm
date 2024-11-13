// AIAssistantSheet.jsx

import React, { useState, useEffect, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Plus, X, ChevronDown, ChevronUp, Info, Bot, ChevronRight, Eye } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "../components/ui/sheet";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "../components/ui/collapsible";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  RadioGroup,
  RadioGroupItem
} from "../components/ui/radio-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuLabel,
  DropdownMenuPortal
} from "../components/ui/dropdown-menu";
import { getDatabase, ref, push, get, update, onValue } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import debounce from 'lodash/debounce';
import { Textarea } from '../components/ui/textarea';

// Define the DEFAULT_COURSE
const DEFAULT_COURSE = {
  id: 'courseless-assistants',
  title: 'Courseless Assistants',
  description: 'Central hub for managing standalone AI teaching assistants that can be used across all courses.',
  isDefault: true,
  grade: 'N/A',
  assistants: {}
};

// Helper function to get array index for a unit ID
const getUnitIndex = (units, unitId) => {
  if (!units) return null;
  // Look through numbered indices
  for (let i = 0; i < Object.keys(units).length; i++) {
    if (units[i]?.id === unitId) {
      return i;
    }
  }
  return null;
};

// Helper function to normalize units array
const normalizeUnits = (units) => {
  if (!units) return [];

  // If units is an object with numeric keys and a unit with assistants
  const normalizedUnits = [];
  Object.entries(units).forEach(([key, value]) => {
    // Skip the special entry containing assistants
    if (typeof key === 'string' && !key.startsWith('unit-')) {
      normalizedUnits.push(value);
    }
  });

  return normalizedUnits;
};

// Helper function to get course-level assistant path
const getCourseAssistantPath = (courseId, userId) => {
  return `edbotz/courses/${userId}/${courseId}/assistants`;
};

// Helper function to get unit-level assistant path
const getUnitAssistantPath = async (courseId, unitId, userId) => {
  const db = getDatabase();
  const courseRef = ref(db, `edbotz/courses/${userId}/${courseId}`);
  const snapshot = await get(courseRef);
  const course = snapshot.val();

  if (!course?.units) return null;

  // Find the correct unit index
  const unitIndex = course.units.findIndex(unit => unit.id === unitId);
  if (unitIndex === -1) return null;

  return `edbotz/courses/${userId}/${courseId}/units/${unitIndex}/assistants`;
};

// Handle moving assistant between locations
const handleMoveAssistant = async (
  userId,
  assistantId, 
  fromType, 
  fromEntityId, 
  fromParentId,
  toType, 
  toEntityId, 
  toParentId
) => {
  if (!userId) return;

  const db = getDatabase();
  const updates = {};

  try {
    // 1. First get the course data to find the unit index
    const courseSnapshot = await get(ref(db, `edbotz/courses/${userId}/${fromParentId || fromEntityId}`));
    const courseData = courseSnapshot.val();
    
    // 2. Set the old location assistant to false
    if (fromType === 'course') {
      updates[`edbotz/courses/${userId}/${fromEntityId}/assistants/${assistantId}`] = false;
      updates[`edbotz/courses/${userId}/${fromEntityId}/hasAI`] = false;
    } else if (fromType === 'unit') {
      // Find unit index
      const unitIndex = courseData.units.findIndex(unit => unit.id === fromEntityId);
      if (unitIndex !== -1) {
        updates[`edbotz/courses/${userId}/${fromParentId}/units/${unitIndex}/assistants/${assistantId}`] = false;
        updates[`edbotz/courses/${userId}/${fromParentId}/units/${unitIndex}/hasAI`] = false;
      }
    }

    // 3. Set the new location assistant to true
    if (toType === 'course') {
      updates[`edbotz/courses/${userId}/${toEntityId}/assistants/${assistantId}`] = true;
      updates[`edbotz/courses/${userId}/${toEntityId}/hasAI`] = true;
    } else if (toType === 'unit') {
      // Find unit index for the destination
      const unitIndex = courseData.units.findIndex(unit => unit.id === toEntityId);
      if (unitIndex !== -1) {
        updates[`edbotz/courses/${userId}/${toParentId}/units/${unitIndex}/assistants/${assistantId}`] = true;
        updates[`edbotz/courses/${userId}/${toParentId}/units/${unitIndex}/hasAI`] = true;
      }
    }

    // 4. Update assistant's usage information
    updates[`edbotz/assistants/${userId}/${assistantId}/usage`] = {
      type: toType,
      entityId: toEntityId,
      parentId: toParentId,
      courseId: toType === 'course' ? toEntityId : toParentId
    };

    // 5. Perform all updates atomically
    await update(ref(db), updates);
  } catch (error) {
    console.error('Error moving assistant:', error);
    throw error;
  }
};

// Custom hook for handling editable content
const useEditableContent = (initialValue, onSave) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(initialValue);

  useEffect(() => {
    setDraftValue(initialValue);
  }, [initialValue]);

  const handleSave = useCallback(() => {
    if (draftValue !== initialValue) {
      onSave(draftValue);
    }
    setIsEditing(false);
  }, [draftValue, initialValue, onSave]);

  return {
    isEditing,
    draftValue,
    setIsEditing,
    setDraftValue,
    handleSave
  };
};

// Updated EditableInput component with better affordances
const EditableInput = ({ label, value, onSave, className = "", placeholder = "" }) => {
  const {
    isEditing,
    draftValue,
    setIsEditing,
    setDraftValue,
    handleSave
  } = useEditableContent(value, onSave);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      {isEditing ? (
        <Input
          value={draftValue}
          onChange={(e) => setDraftValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className={`border-2 focus:ring-2 focus:ring-blue-500 ${className}`}
          autoFocus
          placeholder={placeholder}
        />
      ) : (
        <div 
          onClick={() => setIsEditing(true)}
          className={`cursor-text p-3 rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors duration-200 bg-white hover:bg-gray-50 ${className}`}
        >
          {value || <span className="text-gray-400">{placeholder}</span>}
        </div>
      )}
    </div>
  );
};

// Updated EditableTextarea component
const EditableTextarea = ({ label, value, onSave, className = "", placeholder = "" }) => {
  const {
    isEditing,
    draftValue,
    setIsEditing,
    setDraftValue,
    handleSave
  } = useEditableContent(value || '', onSave);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      {isEditing ? (
        <Textarea
          value={draftValue}
          onChange={(e) => setDraftValue(e.target.value)}
          onBlur={handleSave}
          className={`border-2 focus:ring-2 focus:ring-blue-500 min-h-[120px] ${className}`}
          autoFocus
          placeholder={placeholder}
        />
      ) : (
        <div 
          onClick={() => setIsEditing(true)}
          className={`cursor-text p-3 rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors duration-200 bg-white hover:bg-gray-50 min-h-[120px] ${className}`}
        >
          {value || <span className="text-gray-400">{placeholder}</span>}
        </div>
      )}
    </div>
  );
};

// Updated EditableRichText component
const EditableRichText = ({ label, value, onSave, className = "", placeholder = "" }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(value || '');

  useEffect(() => {
    setDraftValue(value || '');
  }, [value]);

  const handleSave = () => {
    if (draftValue !== value) {
      onSave(draftValue);
    }
    setIsEditing(false);
  };

  // Function to enhance links with icons and styling
  const enhanceLinks = (htmlContent) => {
    if (!htmlContent) return '';
    
    // Create a temporary container
    const div = document.createElement('div');
    div.innerHTML = htmlContent;
    
    // Find all links
    const links = div.getElementsByTagName('a');
    
    // Convert HTMLCollection to Array and iterate backwards to avoid issues with live HTMLCollection
    Array.from(links)
      .reverse()
      .forEach(link => {
        // Create new elements
        const wrapper = document.createElement('span');
        const iconSpan = document.createElement('span');
        
        // Style the link
        link.style.fontWeight = 'bold';
        link.style.textDecoration = 'underline';
        link.classList.add('text-blue-600');
        
        // Add the link icon using an SVG
        iconSpan.innerHTML = `
          <svg 
            class="inline-block w-4 h-4 mr-1" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
        `;
        
        // Structure the enhanced link
        wrapper.appendChild(iconSpan);
        link.parentNode.insertBefore(wrapper, link);
        wrapper.appendChild(link);
      });
    
    return div.innerHTML;
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      {isEditing ? (
        <div className={`border-2 rounded-lg overflow-hidden ${className}`}>
          <ReactQuill
            value={draftValue}
            onChange={(content) => setDraftValue(content)}
            className="bg-white"
            modules={{
              toolbar: [
                ['bold', 'italic', 'underline'],
                [{'list': 'ordered'}, {'list': 'bullet'}],
                ['link'],
                ['clean']
              ],
            }}
          />
          <div className="flex justify-end p-2 bg-gray-50 border-t">
            <Button
              size="sm"
              onClick={handleSave}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Save Changes
            </Button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => setIsEditing(true)}
          className={`cursor-text prose prose-sm max-w-none rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors duration-200 bg-white hover:bg-gray-50 p-3 ${className}`}
        >
          {value ? (
            <div 
              dangerouslySetInnerHTML={{ __html: enhanceLinks(value) }}
              className="[&_a]:text-blue-600 [&_a]:font-bold [&_a]:underline [&_a]:decoration-blue-600"
            />
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
      )}
    </div>
  );
};

// Main AIAssistantSheet component
const AIAssistantSheet = ({ 
  open, 
  onOpenChange, 
  type, 
  entityId,
  parentId,
  existingAssistantId,
  onSave,
  onPreviewClick // Add this prop
}) => {
  const { user } = useAuth();
  const [assistantName, setAssistantName] = useState('');
  const [messageToStudents, setMessageToStudents] = useState('');
  const [instructions, setInstructions] = useState('');
  const [firstMessage, setFirstMessage] = useState('');
  const [messageStarters, setMessageStarters] = useState(['']);
  const [openInfo, setOpenInfo] = useState({});
  const [selectedModel, setSelectedModel] = useState('standard');
  const [currentTypeState, setCurrentTypeState] = useState(type);
  const [currentEntityIdState, setCurrentEntityIdState] = useState(entityId);
  const [currentParentIdState, setCurrentParentIdState] = useState(parentId);

  const isEditingExistingAssistant = Boolean(existingAssistantId);

  // Define onSave handlers
  const handleAssistantNameSave = async (newValue) => {
    if (isEditingExistingAssistant) {
      try {
        const db = getDatabase();
        const assistantRef = ref(db, `edbotz/assistants/${user.uid}/${existingAssistantId}`);
        await update(assistantRef, { assistantName: newValue, updatedAt: new Date().toISOString() });
        setAssistantName(newValue);
      } catch (error) {
        console.error('Error updating assistantName:', error);
      }
    } else {
      setAssistantName(newValue);
    }
  };

  const handleMessageToStudentsSave = async (newValue) => {
    if (isEditingExistingAssistant) {
      try {
        const db = getDatabase();
        const assistantRef = ref(db, `edbotz/assistants/${user.uid}/${existingAssistantId}`);
        await update(assistantRef, { messageToStudents: newValue, updatedAt: new Date().toISOString() });
        setMessageToStudents(newValue);
      } catch (error) {
        console.error('Error updating messageToStudents:', error);
      }
    } else {
      setMessageToStudents(newValue);
    }
  };

  const handleInstructionsSave = async (newValue) => {
    if (isEditingExistingAssistant) {
      try {
        const db = getDatabase();
        const assistantRef = ref(db, `edbotz/assistants/${user.uid}/${existingAssistantId}`);
        await update(assistantRef, { instructions: newValue, updatedAt: new Date().toISOString() });
        setInstructions(newValue);
      } catch (error) {
        console.error('Error updating instructions:', error);
      }
    } else {
      setInstructions(newValue);
    }
  };

  const handleFirstMessageSave = async (newValue) => {
    if (isEditingExistingAssistant) {
      try {
        const db = getDatabase();
        const assistantRef = ref(db, `edbotz/assistants/${user.uid}/${existingAssistantId}`);
        await update(assistantRef, { firstMessage: newValue, updatedAt: new Date().toISOString() });
        setFirstMessage(newValue);
      } catch (error) {
        console.error('Error updating firstMessage:', error);
      }
    } else {
      setFirstMessage(newValue);
    }
  };

  const handleModelChange = async (value) => {
    if (isEditingExistingAssistant) {
      try {
        const db = getDatabase();
        const assistantRef = ref(db, `edbotz/assistants/${user.uid}/${existingAssistantId}`);
        await update(assistantRef, { model: value, updatedAt: new Date().toISOString() });
        setSelectedModel(value);
      } catch (error) {
        console.error('Error updating model:', error);
      }
    } else {
      setSelectedModel(value);
    }
  };

  const saveMessageStarters = async (newStarters) => {
    if (isEditingExistingAssistant) {
      try {
        const db = getDatabase();
        const assistantRef = ref(db, `edbotz/assistants/${user.uid}/${existingAssistantId}`);
        await update(assistantRef, { messageStarters: newStarters.filter(msg => msg.trim() !== ''), updatedAt: new Date().toISOString() });
        setMessageStarters(newStarters);
      } catch (error) {
        console.error('Error updating messageStarters:', error);
      }
    } else {
      setMessageStarters(newStarters);
    }
  };

  const handleAddMessageStarter = () => {
    const newStarters = [...messageStarters, ''];
    saveMessageStarters(newStarters);
  };

  const handleRemoveMessageStarter = (index) => {
    const newStarters = messageStarters.filter((_, i) => i !== index);
    saveMessageStarters(newStarters);
  };

  const handleMessageStarterChange = (index, value) => {
    const newStarters = [...messageStarters];
    newStarters[index] = value;
    saveMessageStarters(newStarters);
  };

  // LocationDropdown Component
  const LocationDropdown = ({ 
    currentType, 
    currentEntityId, 
    currentParentId, 
    onLocationChange 
  }) => {
    const { user } = useAuth();
    const [courses, setCourses] = useState({});
    const [currentLocation, setCurrentLocation] = useState('Select Location');
    const [isOpen, setIsOpen] = useState(false);
  
    useEffect(() => {
      if (!user?.uid) return;
  
      const db = getDatabase();
      const coursesRef = ref(db, `edbotz/courses/${user.uid}`);
  
      const unsubscribe = onValue(coursesRef, (snapshot) => {
        const data = snapshot.val() || {};
        const normalizedCourses = {};
  
        // Process each course
        Object.entries(data).forEach(([courseId, course]) => {
          // Process units array
          const units = course.units || [];
          const processedUnits = Array.isArray(units) 
            ? units.filter(unit => unit && typeof unit === 'object') // Filter valid units
            : [];
  
          // If it's the default course, ensure it has the necessary fields
          if (courseId === DEFAULT_COURSE.id) {
            normalizedCourses[courseId] = {
              ...DEFAULT_COURSE, // Include default fields
              ...course, // Merge with existing data
              id: courseId,
              units: processedUnits
            };
          } else {
            normalizedCourses[courseId] = {
              ...course,
              id: courseId,
              units: processedUnits
            };
          }
        });
  
        setCourses(normalizedCourses);
      });
  
      return () => unsubscribe();
    }, [user?.uid]);
  
    const handleLocationSelect = (type, entityId, parentId) => {
      if (!type || !entityId) return;
  
      // For the default course, parentId should be null
      if (entityId === DEFAULT_COURSE.id) {
        parentId = null;
      }
  
      onLocationChange(type, entityId, parentId);
      setIsOpen(false);
    };
  
    // Update current location display
    useEffect(() => {
      if (!currentType || !currentEntityId || !Object.keys(courses).length) {
        setCurrentLocation('Select Location');
        return;
      }
  
      const courseId = currentType === 'course' ? currentEntityId : currentParentId;
      const course = courses[courseId];
  
      if (!course) {
        setCurrentLocation('Select Location');
        return;
      }
  
      if (currentType === 'course') {
        setCurrentLocation(`Course: ${course.title}`);
      } else if (currentType === 'unit') {
        const unit = course.units?.find(u => u.id === currentEntityId);
        if (unit) {
          setCurrentLocation(`${course.title} > Unit: ${unit.title}`);
        }
      } else if (currentType === 'lesson') {
        // Find the unit containing the lesson
        const unit = course.units?.find(u => 
          u.lessons?.some(l => l.id === currentEntityId)
        );
        if (unit) {
          const lesson = unit.lessons.find(l => l.id === currentEntityId);
          if (lesson) {
            setCurrentLocation(`${course.title} > ${unit.title} > Lesson: ${lesson.title}`);
          }
        }
      }
    }, [currentType, currentEntityId, currentParentId, courses]);

    // Separate default course and user courses
    const defaultCourse = courses[DEFAULT_COURSE.id];
    const userCourses = Object.entries(courses).filter(([courseId]) => courseId !== DEFAULT_COURSE.id);
  
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between"
            role="combobox"
            aria-expanded={isOpen}
          >
            {currentLocation}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent 
            className="w-56" 
            align="start"
            sideOffset={5}
          >
            <DropdownMenuLabel>Select Location</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Display the Courseless Assistants separately */}
            
            <DropdownMenuItem 
              onSelect={() => handleLocationSelect('course', DEFAULT_COURSE.id, null)}
            >
              {DEFAULT_COURSE.title}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Display the user's courses */}
            <DropdownMenuLabel>Your Courses</DropdownMenuLabel>
            {userCourses.map(([courseId, course]) => (
              <DropdownMenuSub key={courseId}>
                <DropdownMenuSubTrigger>
                  <span>{course.title}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem 
                      onSelect={() => handleLocationSelect('course', courseId, null)}
                    >
                      Course Level
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {course.units?.map((unit) => (
                      <DropdownMenuSub key={unit.id}>
                        <DropdownMenuSubTrigger>
                          <span>{unit.title}</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem 
                              onSelect={() => handleLocationSelect('unit', unit.id, courseId)}
                            >
                              Unit Level
                            </DropdownMenuItem>
                            {unit.lessons?.length > 0 && (
                              <>
                                <DropdownMenuSeparator />
                                {unit.lessons.map((lesson) => (
                                  <DropdownMenuItem
                                    key={lesson.id}
                                    onSelect={() => handleLocationSelect('lesson', lesson.id, courseId)}
                                  >
                                    {lesson.title}
                                  </DropdownMenuItem>
                                ))}
                              </>
                            )}
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            ))}
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    );
  };

  // Updated InfoSection component
  const InfoSection = ({ id, title, description }) => (
    <Collapsible
      open={openInfo[id]}
      onOpenChange={(isOpen) => setOpenInfo(prev => ({ ...prev, [id]: isOpen }))}
      className="mt-2"
    >
      <CollapsibleTrigger className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200">
        <Info className="w-4 h-4 mr-1" />
        Learn more about this setting
        {openInfo[id] ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Card className="mt-2 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-none">
          <AlertDescription className="text-gray-700">{description}</AlertDescription>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );

  useEffect(() => {
    const loadExistingAssistant = async () => {
      if (!existingAssistantId) {
        // Reset form for new assistant
        setAssistantName('');
        setMessageToStudents('');
        setInstructions('');
        setFirstMessage('');
        setMessageStarters(['']);
        setSelectedModel('standard');
        setCurrentTypeState(type);
        setCurrentEntityIdState(entityId);
        setCurrentParentIdState(parentId);
        return;
      }

      try {
        const db = getDatabase();
        const assistantRef = ref(db, `edbotz/assistants/${user.uid}/${existingAssistantId}`);
        const snapshot = await get(assistantRef);
        const assistant = snapshot.val();

        if (assistant) {
          setAssistantName(assistant.assistantName || '');
          setMessageToStudents(assistant.messageToStudents || '');
          setInstructions(assistant.instructions || '');
          setFirstMessage(assistant.firstMessage || '');
          setMessageStarters(assistant.messageStarters?.length ? assistant.messageStarters : ['']);
          setSelectedModel(assistant.model || 'standard');
          setCurrentTypeState(assistant.usage.type || 'course');
          setCurrentEntityIdState(assistant.usage.entityId || null);
          setCurrentParentIdState(assistant.usage.parentId || null);
        }
      } catch (error) {
        console.error('Error loading assistant:', error);
        // Add proper error handling here
      }
    };

    loadExistingAssistant();
  }, [existingAssistantId, user.uid, type, entityId, parentId]);

  // Location change handler
  const handleLocationChange = async (newType, newEntityId, newParentId) => {
    try {
      if (isEditingExistingAssistant) {
        await handleMoveAssistant(
          user.uid,
          existingAssistantId,
          currentTypeState,
          currentEntityIdState,
          currentParentIdState,
          newType,
          newEntityId,
          newParentId
        );
      }
      // Update the current context
      setCurrentTypeState(newType);
      setCurrentEntityIdState(newEntityId);
      setCurrentParentIdState(newParentId);
    } catch (error) {
      console.error('Error changing location:', error);
      // Optionally show an error message to the user
    }
  };

  // Updated renderFooterButtons function to match the gradient style
  const renderFooterButtons = () => {
    if (isEditingExistingAssistant) {
      return (
        <div className="flex justify-end gap-2 pt-6 border-t">
          <Button 
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="hover:bg-gray-100"
          >
            Close
          </Button>
          <Button 
            onClick={() => onPreviewClick?.({
              id: existingAssistantId,
              assistantName,
              messageToStudents,
              instructions,
              firstMessage,
              messageStarters: messageStarters.filter(msg => msg.trim() !== ''),
              model: selectedModel,
              usage: {
                type: currentTypeState,
                entityId: currentEntityIdState,
                parentId: currentParentIdState
              }
            })}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview Assistant
          </Button>
        </div>
      );
    }

    return (
      <div className="flex justify-end gap-2 pt-6 border-t">
        <Button 
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="hover:bg-gray-100"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
        >
          Create Assistant
        </Button>
      </div>
    );
  };

  const getUnitIdForLesson = async (lessonId, courseId) => {
    const db = getDatabase();
    const courseRef = ref(db, `edbotz/courses/${user.uid}/${courseId}`);

    const snapshot = await get(courseRef);
    const course = snapshot.val();
    if (!course || !course.units) return null;

    for (const unit of course.units) {
      if (unit.lessons?.some(l => l.id === lessonId)) {
        return unit.id;
      }
    }
    return null;
  };

  const handleSave = async () => {
    if (!assistantName.trim() || !user?.uid) return;
  
    const db = getDatabase();
    const assistantData = {
      messageToStudents,
      assistantName,
      instructions,
      firstMessage,
      messageStarters: messageStarters.filter(msg => msg.trim() !== ''),
      model: selectedModel,
      usage: {
        type: currentTypeState,
        entityId: currentEntityIdState,
        parentId: currentParentIdState,
        courseId: currentTypeState === 'course' ? currentEntityIdState : currentParentIdState
      },
      updatedAt: new Date().toISOString(),
      createdBy: user.uid
    };
  
    try {
      let assistantId;
      const updates = {};
  
      // Create or update assistant
      if (isEditingExistingAssistant) {
        assistantId = existingAssistantId;
        updates[`edbotz/assistants/${user.uid}/${existingAssistantId}`] = assistantData;
      } else {
        const newAssistantRef = push(ref(db, `edbotz/assistants/${user.uid}`));
        assistantId = newAssistantRef.key;
        updates[`edbotz/assistants/${user.uid}/${assistantId}`] = {
          ...assistantData,
          createdAt: new Date().toISOString()
        };
      }
  
      // Get the course path based on whether this is the default course or not
      const isDefaultCourse = currentEntityIdState === DEFAULT_COURSE.id;
      const coursePath = isDefaultCourse 
        ? `edbotz/courses/${user.uid}/courseless-assistants`
        : `edbotz/courses/${user.uid}/${currentParentIdState || currentEntityIdState}`;
  
      if (currentTypeState === 'course') {
        // For course-level assistants (including default course)
        updates[`${coursePath}/assistants/${assistantId}`] = true;
        updates[`${coursePath}/hasAI`] = true;
      } else {
        // Get the current course data for unit/lesson updates
        const courseRef = ref(db, coursePath);
        const courseSnapshot = await get(courseRef);
        const courseData = courseSnapshot.val();
  
        if (currentTypeState === 'unit') {
          if (!courseData?.units) {
            throw new Error('Course units not found');
          }
  
          const units = Array.isArray(courseData.units) ? courseData.units : Object.values(courseData.units);
          const unitIndex = units.findIndex(unit => unit.id === currentEntityIdState);
          
          if (unitIndex !== -1) {
            updates[`${coursePath}/units/${unitIndex}/assistants/${assistantId}`] = true;
            updates[`${coursePath}/units/${unitIndex}/hasAI`] = true;
          }
        } else if (currentTypeState === 'lesson') {
          if (!courseData?.units) {
            throw new Error('Course units not found');
          }
  
          const units = Array.isArray(courseData.units) ? courseData.units : Object.values(courseData.units);
          let unitIndex = -1;
          let lessonIndex = -1;
  
          for (let i = 0; i < units.length; i++) {
            const unit = units[i];
            const lIndex = unit.lessons?.findIndex(l => l.id === currentEntityIdState);
            if (lIndex !== -1) {
              unitIndex = i;
              lessonIndex = lIndex;
              break;
            }
          }
  
          if (unitIndex !== -1 && lessonIndex !== -1) {
            updates[`${coursePath}/units/${unitIndex}/lessons/${lessonIndex}/assistants/${assistantId}`] = true;
            updates[`${coursePath}/units/${unitIndex}/lessons/${lessonIndex}/hasAI`] = true;
          }
        }
      }
  
      // Perform all updates atomically
      await update(ref(db), updates);
  
      onOpenChange(false);
      onSave({
        assistantId,
        ...assistantData
      });
    } catch (error) {
      console.error('Error saving assistant:', error);
      throw error;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[95vw] sm:w-[1200px] max-w-[95vw] sm:max-w-[1200px] overflow-y-auto bg-gradient-to-br from-white to-gray-50"
      >
        <SheetHeader className="pb-6 border-b">
    <div className="flex flex-col space-y-2 pr-8">
      <div className="flex items-start justify-between">
        <div className="flex flex-col space-y-1">
          <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {isEditingExistingAssistant ? 'Edit AI Assistant' : 'Create AI Assistant'}
          </SheetTitle>
          <SheetDescription className="text-gray-600">
            {isEditingExistingAssistant 
              ? 'Edit your AI teaching assistant. Changes are saved automatically.'
              : 'Configure your AI teaching assistant to help your students learn and engage with the material.'}
          </SheetDescription>
        </div>
        {isEditingExistingAssistant && (
          <Button
            onClick={() => onPreviewClick?.({
              id: existingAssistantId,
              assistantName,
              messageToStudents,
              instructions,
              firstMessage,
              messageStarters: messageStarters.filter(msg => msg.trim() !== ''),
              model: selectedModel,
              usage: {
                type: currentTypeState,
                entityId: currentEntityIdState,
                parentId: currentParentIdState
              }
            })}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview Assistant
          </Button>
        )}
      </div>
    </div>
  </SheetHeader>

        <div className="space-y-8 py-6">
          {/* Assistant Location */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Assistant Location</Label>
            <LocationDropdown
              currentType={currentTypeState}
              currentEntityId={currentEntityIdState}
              currentParentId={currentParentIdState}
              onLocationChange={handleLocationChange}
            />
            <InfoSection
              id="location"
              title="Assistant Location"
              description="Choose where this assistant will be available within your course structure. Course-level assistants are available throughout the entire course, unit-level assistants are specific to a unit, and lesson-level assistants are only available within a specific lesson."
            />
          </div>

          {/* Assistant Model Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">AI Model</Label>
            <RadioGroup
              defaultValue="standard"
              value={selectedModel}
              onValueChange={handleModelChange}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="standard"
                  id="standard"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="standard"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Bot className="mb-3 h-6 w-6" />
                  <div className="mb-2 font-semibold">Standard Model</div>
                  <span className="text-sm text-muted-foreground">
                    Fast responses, efficient for most tasks
                  </span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="advanced"
                  id="advanced"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="advanced"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Bot className="mb-3 h-6 w-6" />
                  <div className="mb-2 font-semibold">Advanced Model</div>
                  <span className="text-sm text-muted-foreground">
                    More capable, better for complex topics
                  </span>
                </Label>
              </div>
            </RadioGroup>
            <InfoSection
              id="modelSelection"
              title="AI Model Selection"
              description="Standard Model: Best for most educational tasks. Provides quick, accurate responses and is cost-effective. Advanced Model: Offers deeper understanding and more nuanced responses. Better for complex subjects, detailed explanations, and sophisticated teaching strategies. Choose based on your subject matter complexity and student needs."
            />
          </div>

          {/* Assistant Name */}
          <EditableInput
            label="Assistant Name"
            value={assistantName}
            onSave={handleAssistantNameSave}
            placeholder="e.g., Math Helper, Writing Coach"
          />
          <InfoSection
            id="assistantName"
            title="Assistant Name"
            description="This name will be displayed to students in the chat interface. Choose a name that reflects the assistant's role and makes students feel comfortable asking questions."
          />

          {/* Message to Students (Rich Text Editor) */}
          <EditableRichText
            label="Message to Students"
            value={messageToStudents}
            onSave={handleMessageToStudentsSave}
            placeholder="Enter a message to your students..."
          />
          <InfoSection
            id="messageToStudents"
            title="Message to Students"
            description="This message will be shown to students before they start chatting with the AI assistant. Use it to explain what kind of help the assistant can provide and how students should interact with it."
          />

          {/* Assistant Personality & Instructions */}
          <EditableTextarea
            label="Assistant Personality & Instructions"
            value={instructions}
            onSave={handleInstructionsSave}
            placeholder="Describe how the assistant should behave and interact with students..."
          />
          <InfoSection
            id="instructions"
            title="Assistant Personality"
            description="These instructions shape how the AI assistant interacts with students. You can specify the teaching style, tone of voice, and any specific approaches or methodologies you want the assistant to use. For example, you might want the assistant to use the Socratic method or to provide step-by-step explanations."
          />

          {/* First Message */}
          <EditableTextarea
            label="First Message"
            value={firstMessage}
            onSave={handleFirstMessageSave}
            placeholder="Enter the first message the assistant will send to students..."
          />
          <InfoSection
            id="firstMessage"
            title="First Message"
            description="This is the first message students will see from the assistant when they start a conversation. Use it to introduce the assistant and set expectations for how it can help."
          />

          {/* Message Starters */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Message Starters</Label>
            <InfoSection
              id="messageStarters"
              title="Message Starters"
              description="Message starters are pre-written questions or prompts that students can easily select to start their conversation. These help students who might be unsure how to begin or what kinds of questions they can ask."
            />
            <div className="space-y-3">
              {messageStarters.map((starter, index) => (
                <div key={index} className="flex gap-2">
                  <EditableInput
                    label={`Starter ${index + 1}`}
                    value={starter}
                    onSave={(newValue) => handleMessageStarterChange(index, newValue)}
                    placeholder="Enter a message starter..."
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveMessageStarter(index)}
                    className="shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddMessageStarter}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Message Starter
              </Button>
            </div>
          </div>

          {/* Footer Buttons */}
          {renderFooterButtons()}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AIAssistantSheet;
