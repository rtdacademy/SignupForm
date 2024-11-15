// CourseUnitsManagement.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { getDatabase, ref, update, get, remove } from 'firebase/database';
import debounce from 'lodash/debounce';
import { useAuth } from '../context/AuthContext';
import { 
  FileEdit, 
  Trash2, 
  Plus, 
  GripVertical,
  ChevronDown,
  ChevronUp,
  Bot,
  LayoutGrid,
  Library,
  BookOpen
} from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import AIAssistantSheet from './AIAssistantSheet';
import EntityAssistants from './EntityAssistants';

// Define lesson types with associated colors
const LESSON_TYPES = {
  general: {
    value: 'general',
    label: 'General',
    borderColor: 'border-l-gray-500',
    hoverColor: 'hover:border-l-gray-400',
    selectedColor: 'border-l-gray-500 bg-gray-50/50'
  },
  lesson: {
    value: 'lesson',
    label: 'Lesson',
    borderColor: 'border-l-blue-500',
    hoverColor: 'hover:border-l-blue-400',
    selectedColor: 'border-l-blue-500 bg-blue-50/50'
  },
  assignment: {
    value: 'assignment',
    label: 'Assignment',
    borderColor: 'border-l-green-500',
    hoverColor: 'hover:border-l-green-400',
    selectedColor: 'border-l-green-500 bg-green-50/50'
  },
  quiz: {
    value: 'quiz',
    label: 'Quiz',
    borderColor: 'border-l-amber-500',
    hoverColor: 'hover:border-l-amber-400',
    selectedColor: 'border-l-amber-500 bg-amber-50/50'
  },
  exam: {
    value: 'exam',
    label: 'Exam',
    borderColor: 'border-l-red-500',
    hoverColor: 'hover:border-l-red-400',
    selectedColor: 'border-l-red-500 bg-red-50/50'
  },
  project: {
    value: 'project',
    label: 'Project',
    borderColor: 'border-l-purple-500',
    hoverColor: 'hover:border-l-purple-400',
    selectedColor: 'border-l-purple-500 bg-purple-50/50'
  }
};

// Add a custom hook for handling editable content
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

// Optimized Input Component
const EditableInput = ({ value, onSave, className = "" }) => {
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

  return isEditing ? (
    <Input
      value={draftValue}
      onChange={(e) => setDraftValue(e.target.value)}
      onBlur={handleSave}
      onKeyDown={handleKeyDown}
      className={className}
      autoFocus
    />
  ) : (
    <div 
      onClick={() => setIsEditing(true)}
      className={`cursor-text p-2 rounded hover:bg-gray-50 ${className}`}
    >
      {value}
    </div>
  );
};

// Optimized Rich Text Editor Component
const EditableRichText = ({ value, onSave, className = "" }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(value || '');

  // Simple view mode
  if (!isEditing) {
    return (
      <div className="space-y-2">
        {/* Content Display */}
        <div 
          className={`
            prose prose-sm max-w-none bg-white rounded
            prose-p:my-2 prose-p:leading-relaxed
            prose-ul:list-disc prose-ul:pl-6
            prose-ol:list-decimal prose-ol:pl-6
            prose-li:my-1
            prose-a:text-blue-600 prose-a:underline
          `}
          dangerouslySetInnerHTML={{ __html: value || 'No content yet.' }}
        />
        
        {/* Edit Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="mt-2"
        >
          <FileEdit className="w-4 h-4 mr-2" />
          Edit Content
        </Button>
      </div>
    );
  }

  // Edit mode
  return (
    <div className="space-y-2">
      <ReactQuill
        theme="snow"
        value={draftValue}
        onChange={setDraftValue}
        modules={{
          toolbar: [
            ['bold', 'italic', 'underline'],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            ['link'],
            ['clean']
          ],
        }}
        className="bg-white border rounded"
      />
      <div className="flex gap-2 mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            onSave(draftValue);
            setIsEditing(false);
          }}
        >
          Save Changes
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setDraftValue(value);
            setIsEditing(false);
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

// Course Header Component with Expandable Description
const CourseHeader = ({ course, onEditCourse, onDeleteCourse, onManageAI, onDeleteAssistant }) => {
  const [showDescription, setShowDescription] = useState(false);

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <LayoutGrid className="w-5 h-5" />
                <span className="text-sm font-medium">Course Overview</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-gray-600">Grade: {course.grade || 'Not specified'}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onEditCourse}>
                <FileEdit className="w-4 h-4 mr-2" /> Edit Course
              </Button>
              <Button variant="destructive" onClick={onDeleteCourse}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete Course
              </Button>
              {course.description && (
                <Button
                  variant="ghost"
                  onClick={() => setShowDescription(!showDescription)}
                >
                  {showDescription ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {showDescription && course.description && (
          <div className="px-6 pb-6 border-t border-blue-100">
            <div className="pt-4 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: course.description }} />
          </div>
        )}
      </div>

      <Card className="border-blue-100">
        <CardHeader>
          <div className="flex items-center gap-2 text-blue-600">
            <Bot className="w-5 h-5" />
            <CardTitle>Course Assistants</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <EntityAssistants
            type="course"
            entityId={course.id}
            parentId={null}
            assistants={course.assistants || {}}
            onManageAI={onManageAI}
            onDeleteAssistant={onDeleteAssistant}
            isDefaultCourse={false}
            className=""
          />
        </CardContent>
      </Card>
    </div>
  );
};

// Updated SortableLesson Component
const SortableLesson = ({ 
  unitId, 
  courseId,
  lesson, 
  onUpdate, 
  onDelete, 
  onManageAI, 
  isSelected, 
  setSelectedLesson, 
  setSelectedUnit,
  onDeleteAssistant
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleUpdateTitle = useCallback((newTitle) => {
    onUpdate(unitId, lesson.id, 'title', newTitle);
  }, [unitId, lesson.id, onUpdate]);

  const handleUpdateDescription = useCallback((newDescription) => {
    onUpdate(unitId, lesson.id, 'description', newDescription);
  }, [unitId, lesson.id, onUpdate]);

  const lessonType = LESSON_TYPES[lesson.type || 'general'];

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`border-l-4 ${
        isSelected 
          ? lessonType.selectedColor
          : lessonType.borderColor
      } ${lessonType.hoverColor} transition-colors duration-200`}
      onClick={() => {
        setSelectedLesson(lesson.id);
        setSelectedUnit(unitId);
      }}
    >
      <div className="p-3 space-y-4">
        <div className="flex items-center gap-3">
          <button 
            {...attributes} 
            {...listeners}
            className="cursor-grab hover:text-gray-600 focus:outline-none"
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
          </button>
          <EditableInput
            value={lesson.title}
            onSave={handleUpdateTitle}
            className="flex-1 border-gray-200 focus:ring-gray-500"
          />
          <Select
            value={lesson.type || 'general'}
            onValueChange={(value) => onUpdate(unitId, lesson.id, 'type', value)}
            onClick={(e) => e.stopPropagation()}
          >
            <SelectTrigger className="w-32 border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(LESSON_TYPES).map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(unitId, lesson.id);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="pl-8">
          <EntityAssistants
            type="lesson"
            entityId={lesson.id}
            parentId={courseId}
            assistants={lesson.assistants}
            onManageAI={onManageAI}
            onDeleteAssistant={onDeleteAssistant}
            isDefaultCourse={false}
            className="bg-white rounded-lg p-4 border border-gray-100"
          />
        </div>

        {isExpanded && (
          <div className="pl-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Description</label>
              <EditableRichText
                value={lesson.description}
                onSave={handleUpdateDescription}
                className="bg-white"
              />
            </div>

            {(['assignment', 'quiz', 'exam'].includes(lesson.type)) && (
              <div>
                <label className="block text-sm font-medium text-gray-600">Assessment Details</label>
                <EditableRichText
                  value={lesson.assessment}
                  onSave={(content) => onUpdate(unitId, lesson.id, 'assessment', content)}
                  className="bg-white"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

// CourseUnitsManagement Component
const CourseUnitsManagement = ({ courseId, course, onEditCourse, onDeleteCourse }) => {
  const { user } = useAuth();
  // Helper function to ensure we always have an array
  const ensureArray = (possibleArray) => Array.isArray(possibleArray) ? possibleArray : [];
  const [units, setUnits] = useState(ensureArray(course.units));
  const [expandedUnits, setExpandedUnits] = useState(
    ensureArray(course.units).reduce((acc, unit) => ({
      ...acc,
      [unit.id]: true
    }), {})
  );
  
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showDeleteUnitDialog, setShowDeleteUnitDialog] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [showAISheet, setShowAISheet] = useState(false);
  const [currentAIContext, setCurrentAIContext] = useState({
    type: null,
    entityId: null,
    parentId: null,
    existingAssistantId: null
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle selection clearing when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.card')) {
        setSelectedUnit(null);
        setSelectedLesson(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleUnitExpand = (unitId) => {
    setExpandedUnits(prev => ({
      ...prev,
      [unitId]: !prev[unitId]
    }));
  };

  // Updated addLesson function with default type 'general'
  const addLesson = (unitId) => {
    const targetUnit = units.find(u => u.id === unitId);
    const newLesson = {
      id: `lesson-${Date.now()}`,
      title: 'New Item',
      type: 'general', // Changed default type to 'general'
      sequence: (targetUnit.lessons?.length || 0) + 1,
      description: '',
      assistants: {},
      hasAI: false,
    };

    const updatedUnits = units.map(unit => {
      if (unit.id === unitId) {
        return {
          ...unit,
          lessons: [...(unit.lessons || []), newLesson]
        };
      }
      return unit;
    });

    setUnits(updatedUnits);
    updateUnitsInDatabase(updatedUnits);
  };

  const addUnit = () => {
    const newUnit = {
      id: `unit-${Date.now()}`,
      title: 'New Unit',
      description: '',
      lessons: [],
      sequence: units.length + 1,
      hasAI: false, 
      assistants: {}
    };
    
    const updatedUnits = [...units, newUnit];
    setUnits(updatedUnits);
    updateUnitsInDatabase(updatedUnits);
    setExpandedUnits(prev => ({
      ...prev,
      [newUnit.id]: true
    }));
  };

  const updateUnitsInDatabase = async (updatedUnits) => {
    const db = getDatabase();
    const courseRef = ref(db, `edbotz/courses/${user.uid}/${courseId}`);
    
    try {
      await update(courseRef, {
        units: updatedUnits,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating units:', error);
    }
  };

  const updateUnit = (unitId, field, value) => {
    const updatedUnits = units.map(unit => {
      if (unit.id === unitId) {
        return { ...unit, [field]: value };
      }
      return unit;
    });
    setUnits(updatedUnits);
    updateUnitsInDatabase(updatedUnits);
  };

  const updateLesson = (unitId, lessonId, field, value) => {
    const updatedUnits = units.map(unit => {
      if (unit.id === unitId) {
        const updatedLessons = unit.lessons.map(lesson => {
          if (lesson.id === lessonId) {
            return { ...lesson, [field]: value };
          }
          return lesson;
        });
        return { ...unit, lessons: updatedLessons };
      }
      return unit;
    });
    setUnits(updatedUnits);
    updateUnitsInDatabase(updatedUnits);
  };

  const deleteUnit = async (unitId) => {
    const updatedUnits = units.filter(unit => unit.id !== unitId);
    setUnits(updatedUnits);
    updateUnitsInDatabase(updatedUnits);
    setShowDeleteUnitDialog(false);
    setUnitToDelete(null);
  };

  const deleteLesson = (unitId, lessonId) => {
    const updatedUnits = units.map(unit => {
      if (unit.id === unitId) {
        return {
          ...unit,
          lessons: unit.lessons.filter(lesson => lesson.id !== lessonId)
        };
      }
      return unit;
    });
    setUnits(updatedUnits);
    updateUnitsInDatabase(updatedUnits);
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    // Handle unit reordering
    if (active.id.startsWith('unit-') && over.id.startsWith('unit-')) {
      setUnits(units => {
        const oldIndex = units.findIndex(u => u.id === active.id);
        const newIndex = units.findIndex(u => u.id === over.id);
        const reorderedUnits = arrayMove(units, oldIndex, newIndex);
        
        // Update sequences
        const updatedUnits = reorderedUnits.map((unit, index) => ({
          ...unit,
          sequence: index + 1
        }));
        
        updateUnitsInDatabase(updatedUnits);
        return updatedUnits;
      });
    }
    
    // Handle lesson reordering within a unit
    if (active.id.startsWith('lesson-') && over.id.startsWith('lesson-')) {
      const activeUnit = units.find(u => u.lessons?.some(l => l.id === active.id));
      const overUnit = units.find(u => u.lessons?.some(l => l.id === over.id));
      
      if (activeUnit && overUnit && activeUnit.id === overUnit.id) {
        setUnits(units => {
          const updatedUnits = units.map(unit => {
            if (unit.id === activeUnit.id) {
              const oldIndex = unit.lessons.findIndex(l => l.id === active.id);
              const newIndex = unit.lessons.findIndex(l => l.id === over.id);
              const reorderedLessons = arrayMove(unit.lessons, oldIndex, newIndex);
              
              // Update sequences
              const updatedLessons = reorderedLessons.map((lesson, index) => ({
                ...lesson,
                sequence: index + 1
              }));
              
              return {
                ...unit,
                lessons: updatedLessons
              };
            }
            return unit;
          });
          
          updateUnitsInDatabase(updatedUnits);
          return updatedUnits;
        });
      }
    }
    
    setActiveId(null);
  };

  // Handle AI Assistant Management
  const handleManageAI = (type, id, parentId = null, assistantId = null) => {
    let existingAssistantId = null;
    
    // Find the existing assistant ID based on the type
    switch (type) {
      case 'course':
        existingAssistantId = course.assistantId;
        // For course, parentId should be null
        parentId = null;
        break;
      case 'unit':
        const unit = units.find(u => u.id === id);
        existingAssistantId = unit?.assistantId;
        // For unit, parentId should be courseId
        parentId = courseId;
        break;
      case 'lesson':
        const lessonUnit = units.find(u => u.lessons?.some(l => l.id === id));
        const lesson = lessonUnit?.lessons?.find(l => l.id === id);
        existingAssistantId = lesson?.assistantId;
        // For lesson, parentId should be courseId
        parentId = courseId;
        break;
      case 'assistant':
        // Handle assistant type if needed
        break;
      default:
        break;
    }
  
    console.log('Setting AI Context:', {
      type,
      entityId: id,
      parentId,
      existingAssistantId: assistantId || existingAssistantId
    });
  
    setCurrentAIContext({
      type,
      entityId: id,
      parentId, // Now properly set for each type
      existingAssistantId: assistantId || existingAssistantId
    });
    setShowAISheet(true);
  };


  // Handle AI Assistant Save
  const handleAIAssistantSave = async (assistantData) => {
    const { type, entityId, parentId } = currentAIContext;
    const db = getDatabase();
    
    try {
      const entityPath = getEntityPath(type, entityId, parentId);
      if (!entityPath) {
        throw new Error('Invalid entity path');
      }
  
      // First, get the current state of the entity to preserve existing assistants
      const entityRef = ref(db, entityPath);
      const entitySnapshot = await get(entityRef);
      const entityData = entitySnapshot.val() || {};
      const existingAssistants = entityData.assistants || {};
  
      // Create the updates object
      const updates = {};
  
      // Add the assistant to the assistants collection
      updates[`edbotz/assistants/${user.uid}/${assistantData.assistantId}`] = assistantData;
  
      // Initialize or update assistants object while preserving existing assistants
      if (type === 'lesson') {
        const unit = units.find(u => u.lessons?.some(l => l.id === entityId));
        if (unit) {
          const lesson = unit.lessons.find(l => l.id === entityId);
          if (lesson) {
            const lessonPath = `edbotz/courses/${user.uid}/${courseId}/units/${units.indexOf(unit)}/lessons/${unit.lessons.indexOf(lesson)}/assistants`;
            updates[lessonPath] = {
              ...existingAssistants,
              [assistantData.assistantId]: true
            };
            updates[`edbotz/courses/${user.uid}/${courseId}/units/${units.indexOf(unit)}/lessons/${unit.lessons.indexOf(lesson)}/hasAI`] = true;
          }
        }
      } else {
        // For course and unit levels
        updates[`${entityPath}/assistants`] = {
          ...existingAssistants,
          [assistantData.assistantId]: true
        };
        updates[`${entityPath}/hasAI`] = true;
      }
  
      // Perform all updates atomically
      await update(ref(db), updates);
  
      // Update local state based on type
      if (type === 'lesson') {
        setUnits(prevUnits =>
          prevUnits.map(unit => {
            if (unit.lessons?.some(l => l.id === entityId)) {
              return {
                ...unit,
                lessons: unit.lessons.map(lesson =>
                  lesson.id === entityId
                    ? {
                        ...lesson,
                        assistants: {
                          ...(lesson.assistants || {}),
                          [assistantData.assistantId]: true
                        },
                        hasAI: true
                      }
                    : lesson
                )
              };
            }
            return unit;
          })
        );
      } else if (type === 'unit') {
        const unitIndex = units.findIndex(u => u.id === entityId);
        if (unitIndex !== -1) {
          const updatedUnits = [...units];
          updatedUnits[unitIndex] = {
            ...updatedUnits[unitIndex],
            assistants: {
              ...(updatedUnits[unitIndex].assistants || {}),
              [assistantData.assistantId]: true
            },
            hasAI: true
          };
          setUnits(updatedUnits);
        }
      }

      setShowAISheet(false);
    } catch (error) {
      console.error('Error saving assistant:', error);
      throw error;
    }
  };

  // Handle delete assistant
  const handleDeleteAssistant = async (assistantId, type, entityId, parentId) => {
    const db = getDatabase();
    
    try {
      // 1. Remove assistant from the assistants collection
      const assistantRef = ref(db, `edbotz/assistants/${user.uid}/${assistantId}`);
      await remove(assistantRef);

      // 2. Remove assistant reference from the entity
      const entityPath = getEntityPath(type, entityId, parentId);
      const entityAssistantRef = ref(db, `${entityPath}/assistants/${assistantId}`);
      await remove(entityAssistantRef);

      // 3. Update local state
      if (type === 'unit') {
        setUnits(prevUnits =>
          prevUnits.map(unit =>
            unit.id === entityId
              ? {
                  ...unit,
                  assistants: Object.fromEntries(
                    Object.entries(unit.assistants || {}).filter(
                      ([key]) => key !== assistantId
                    )
                  )
                }
              : unit
          )
        );
      } else if (type === 'lesson') {
        setUnits(prevUnits =>
          prevUnits.map(unit => {
            if (unit.id === parentId) {
              return {
                ...unit,
                lessons: unit.lessons.map(lesson =>
                  lesson.id === entityId
                    ? {
                        ...lesson,
                        assistants: Object.fromEntries(
                          Object.entries(lesson.assistants || {}).filter(
                            ([key]) => key !== assistantId
                          )
                        )
                      }
                    : lesson
                )
              };
            }
            return unit;
          })
        );
      }
    } catch (error) {
      console.error('Error deleting assistant:', error);
      // Add proper error handling here
    }
  };

  // Helper function to get entity path
  const getEntityPath = (type, entityId, parentId = null) => {
    switch (type) {
      case 'course':
        return `edbotz/courses/${user.uid}/${courseId}`;
      case 'unit': {
        const unitIndex = units.findIndex(u => u.id === entityId);
        if (unitIndex === -1) return null;
        return `edbotz/courses/${user.uid}/${courseId}/units/${unitIndex}`;
      }
      case 'lesson': {
        // Find the unit containing the lesson
        const unit = units.find(u => u.lessons?.some(l => l.id === entityId));
        if (!unit) return null;
        
        const unitIndex = units.findIndex(u => u.id === unit.id);
        const lessonIndex = unit.lessons.findIndex(l => l.id === entityId);
        
        if (unitIndex === -1 || lessonIndex === -1) return null;
        
        // Update path to correctly point to the lesson's assistants
        return `edbotz/courses/${user.uid}/${courseId}/units/${unitIndex}/lessons/${lessonIndex}`;
      }
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <CourseHeader 
        course={course} 
        onEditCourse={onEditCourse} 
        onDeleteCourse={onDeleteCourse}
        onManageAI={handleManageAI}
        onDeleteAssistant={handleDeleteAssistant}
      />

      {/* Units Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Units</h2>
          <Button onClick={addUnit}>
            <Plus className="w-4 h-4 mr-2" /> Add Unit
          </Button>
        </div>

        {/* Draggable Units List */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={units.map(u => u.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {units.map((unit) => (
               <SortableUnit
                 key={unit.id}
                 unit={unit}
                 parentId={courseId} 
                 onExpand={handleUnitExpand}
                 isExpanded={expandedUnits[unit.id]}
                 onUpdate={updateUnit}
                 onDelete={(unitId) => {
                   setUnitToDelete(unitId);
                   setShowDeleteUnitDialog(true);
                 }}
                 onAddLesson={addLesson}
                 onManageAI={handleManageAI}
                 isSelected={selectedUnit === unit.id}
                 setSelectedUnit={setSelectedUnit}
                 setSelectedLesson={setSelectedLesson}
                 onDeleteAssistant={handleDeleteAssistant}
               >
                  {/* Lessons Rendering */}
                  <SortableContext
                    items={(unit.lessons || []).map(l => l.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {unit.lessons?.map((lesson) => (
                        <SortableLesson
                          key={lesson.id}
                          unitId={unit.id}
                          courseId={courseId} 
                          lesson={lesson}
                          onUpdate={updateLesson}
                          onDelete={deleteLesson}
                          onManageAI={handleManageAI}
                          isSelected={selectedLesson === lesson.id}
                          setSelectedLesson={setSelectedLesson}
                          setSelectedUnit={setSelectedUnit}
                          onDeleteAssistant={handleDeleteAssistant}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </SortableUnit>
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeId ? (
              <div className="opacity-50">
                {units.find(unit => unit.id === activeId) ? (
                  <Card className="p-4 bg-white shadow-lg">
                    <Input value={units.find(u => u.id === activeId).title} readOnly />
                  </Card>
                ) : (
                  units.flatMap(unit => unit.lessons).find(l => l.id === activeId) && (
                    <Card className="p-3 bg-white shadow-lg">
                      <Input value={units.flatMap(unit => unit.lessons).find(l => l.id === activeId).title} readOnly />
                    </Card>
                  )
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Delete Unit Dialog */}
      <AlertDialog open={showDeleteUnitDialog} onOpenChange={setShowDeleteUnitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Unit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this unit? This action cannot be undone.
              All lessons within this unit will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUnit(unitToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add the AI Assistant Sheet */}
      <AIAssistantSheet
        open={showAISheet}
        onOpenChange={setShowAISheet}
        onSave={handleAIAssistantSave}
        type={currentAIContext.type}
        entityId={currentAIContext.entityId}
        parentId={currentAIContext.parentId}
        existingAssistantId={currentAIContext.existingAssistantId}
      />
    </div>
  );
};

// SortableUnit Component (unchanged)
const SortableUnit = ({ 
  unit, 
  parentId,
  onExpand, 
  isExpanded, 
  onUpdate, 
  onDelete, 
  onAddLesson, 
  onManageAI, 
  children,
  isSelected,
  setSelectedUnit,
  setSelectedLesson,
  onDeleteAssistant
}) => {
  const [showDescription, setShowDescription] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: unit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleUpdateTitle = useCallback((newTitle) => {
    onUpdate(unit.id, 'title', newTitle);
  }, [unit.id, onUpdate]);

  const handleUpdateDescription = useCallback((newDescription) => {
    onUpdate(unit.id, 'description', newDescription);
  }, [unit.id, onUpdate]);

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`border-l-4 ${
        isSelected ? 'border-l-indigo-500 bg-indigo-50/50' : 'border-l-indigo-200'
      } hover:border-l-indigo-400 transition-colors duration-200`}
      onClick={() => {
        setSelectedUnit(unit.id);
        setSelectedLesson(null);
      }}
    >
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <button 
              {...attributes} 
              {...listeners}
              className="cursor-grab hover:text-indigo-600 focus:outline-none"
            >
              <GripVertical className="w-4 h-4 text-gray-400" />
            </button>
            <div className="flex items-center gap-2 text-indigo-600">
              <Library className="w-4 h-4" />
              <EditableInput
                value={unit.title}
                onSave={handleUpdateTitle}
                className="max-w-md border-indigo-200 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowDescription(!showDescription);
              }}
            >
              <FileEdit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onExpand(unit.id);
              }}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(unit.id);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {(showDescription || isExpanded) && (
  <div className="pl-8 space-y-4">
    {showDescription && (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-600">Unit Description</label>
        <div 
          onClick={() => setShowDescription(true)}
          className={`
            prose prose-sm max-w-none bg-white rounded p-2 
            prose-p:my-3 prose-p:leading-relaxed
            prose-ul:my-3 prose-ul:list-disc prose-ul:pl-6 prose-ul:list-outside
            prose-ol:my-3 prose-ol:list-decimal prose-ol:pl-6 prose-ol:list-outside
            prose-li:my-1 prose-li:leading-relaxed prose-li:pl-0
            prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800
          `}
        >
          <EditableRichText
            value={unit.description}
            onSave={handleUpdateDescription}
            className="bg-white"
          />
        </div>
      </div>
            )}

            {isExpanded && (
              <div className="space-y-4">
                <EntityAssistants
                  type="unit"
                  entityId={unit.id}
                  parentId={parentId}
                  assistants={unit.assistants}
                  onManageAI={onManageAI}
                  onDeleteAssistant={onDeleteAssistant}
                  isDefaultCourse={false}
                  className="bg-white rounded-lg p-4 border border-indigo-100"
                />

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-indigo-600">
                      <BookOpen className="w-4 h-4" />
                      <h3 className="text-sm font-medium">Items</h3>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onAddLesson(unit.id)}
                      className="border-indigo-200 hover:bg-indigo-50"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Item
                    </Button>
                  </div>
                  <div className="pl-6">
                    {children}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default CourseUnitsManagement;
