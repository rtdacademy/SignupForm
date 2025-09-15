import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Plus, X, ChevronDown, ChevronUp, Info, Bot, Trash2, Loader,  Sparkles, FileIcon, ImageIcon  } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "../components/ui/sheet";
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
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import {
  RadioGroup,
  RadioGroupItem
} from "../components/ui/radio-group";
import { getDatabase, ref, push, get, update, onValue } from 'firebase/database';
import { getStorage, ref as storageRef, deleteObject } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';
import { Textarea } from "../components/ui/textarea";
import ContextSelector from './ContextSelector';
// Info Sheet Component Imports
import LearnMoreSheet from './documents/LearnMoreSheet';
import ModelTypeSheet from './documents/ModelTypeSheet';
import QuickCreateSheet from './documents/QuickCreateSheet';
import InstructionsSheet from './documents/InstructionsSheet';
import FirstMessageSheet from './documents/FirstMessageSheet';
import MessageStartersSheet from './documents/MessageStartersSheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import  FileManagementSheet from './FileManagementSheet';
// Import Firebase Functions for AI assistant generation
import { getFunctions, httpsCallable } from 'firebase/functions';
import FileManagementInfoSheet from './documents/FileManagementInfoSheet';
import ImageManagementSheet from './ImageManagementSheet';
import QuickCreateControls from './QuickCreateControls';

// Define the DEFAULT_COURSE (Courseless Assistants)
const DEFAULT_COURSE = {
  id: 'courseless-assistants',
  title: 'Courseless Assistants',
  description: 'Central hub for managing standalone AI teaching assistants that can be used across all courses.',
  isDefault: true,
  grade: 'N/A',
  assistants: {}
};


const EditableTextarea = ({ label, value, onChange, className = "", placeholder = "" }) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`border-2 focus:ring-2 focus:ring-blue-500 min-h-[120px] ${className}`}
        placeholder={placeholder}
      />
    </div>
  );
};

const EditableRichText = ({ label, value, onChange, className = "", placeholder = "" }) => {
  // For rich text we use ReactQuill. onChange simply updates local state.
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <div className={`rounded-lg overflow-hidden shadow-sm ${className}`}>
        <ReactQuill
          value={value}
          onChange={onChange}
          className="bg-white quill-editor"
          modules={{
            toolbar: [
              ['bold', 'italic', 'underline'],
              [{ 'list': 'ordered' }, { 'list': 'bullet' }],
              ['link'],
              ['clean']
            ],
          }}
          placeholder={placeholder}
          style={{ height: "180px" }}
        />
        <style jsx="true">{`
          .quill-editor {
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
          }
          .quill-editor .ql-container {
            border: none;
            border-top: 1px solid #e2e8f0;
            min-height: 120px;
            height: calc(100% - 42px);
            font-size: 14px;
            border-radius: 0 0 0.5rem 0.5rem;
          }
          .quill-editor .ql-editor {
            min-height: 120px;
            height: 100%;
            max-height: none;
            padding: 12px 15px;
          }
          .quill-editor .ql-toolbar {
            border: none;
            padding: 8px 12px;
            background-color: #f9fafb;
            border-radius: 0.5rem 0.5rem 0 0;
          }
          .quill-editor .ql-toolbar button {
            height: 24px;
            width: 24px;
            padding: 2px;
          }
          .quill-editor .ql-toolbar button:hover {
            color: #1e40af;
          }
          .quill-editor .ql-toolbar .ql-active {
            color: #1d4ed8;
          }
        `}</style>
      </div>
    </div>
  );
};


// InfoSection Component (in AIAssistantSheet.js)
const InfoSection = ({ id, title, description, activeInfoSection, setActiveInfoSection }) => {
  return (
    <>
      <button
        className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 mt-2"
        onClick={(e) => {
          e.preventDefault();
          setActiveInfoSection(id);
        }}
      >
        <Info className="w-4 h-4 mr-1" />
        Learn more about this setting
      </button>
      
      {/* Location Info Sheet */}
      {id === 'location' && (
        <LearnMoreSheet 
          open={activeInfoSection === 'location'}
          onOpenChange={(open) => setActiveInfoSection(open ? 'location' : null)}
          topic={id}
        />
      )}
      {/* Model Selection Info Sheet */}
      {id === 'modelSelection' && (
        <ModelTypeSheet 
          open={activeInfoSection === 'modelSelection'}
          onOpenChange={(open) => setActiveInfoSection(open ? 'modelSelection' : null)}
          topic={id}
        />
      )}
      {/* AI Description Info Sheet */}
      {id === 'aiDescription' && (
        <QuickCreateSheet 
          open={activeInfoSection === 'aiDescription'}
          onOpenChange={(open) => setActiveInfoSection(open ? 'aiDescription' : null)}
          topic={id}
        />
      )}
      {/* Assistant Name Info Sheet */}
      {id === 'assistantName' && (
        <AssistantNameSheet 
          open={activeInfoSection === 'assistantName'}
          onOpenChange={(open) => setActiveInfoSection(open ? 'assistantName' : null)}
          topic={id}
        />
      )}
      {/* Instructions Info Sheet */}
      {id === 'instructions' && (
        <InstructionsSheet 
          open={activeInfoSection === 'instructions'}
          onOpenChange={(open) => setActiveInfoSection(open ? 'instructions' : null)}
          topic={id}
        />
      )}
      {/* First Message Info Sheet */}
      {id === 'firstMessage' && (
        <FirstMessageSheet 
          open={activeInfoSection === 'firstMessage'}
          onOpenChange={(open) => setActiveInfoSection(open ? 'firstMessage' : null)}
          topic={id}
        />
      )}
      {/* Message Starters Info Sheet */}
      {id === 'messageStarters' && (
        <MessageStartersSheet 
          open={activeInfoSection === 'messageStarters'}
          onOpenChange={(open) => setActiveInfoSection(open ? 'messageStarters' : null)}
          topic={id}
        />
      )}
      {/* File Management Info Sheet */}
      {id === 'fileManagement' && (
        <FileManagementInfoSheet 
          open={activeInfoSection === 'fileManagement'}
          onOpenChange={(open) => setActiveInfoSection(open ? 'fileManagement' : null)}
        />
      )}
    </>
  );
};
// --- Main AIAssistantSheet Component ---
const AIAssistantSheet = ({ 
  open, 
  onOpenChange, 
  type, 
  entityId,
  parentId,
  existingAssistantId,
  onSave,
  onDelete,
  selectedContext,
  firebaseApp
}) => {
  const { user } = useAuth();

  // Local state for the assistant's fields.
  // These are our draft values that will only be committed when the user clicks Save.
  const [assistantName, setAssistantName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [firstMessage, setFirstMessage] = useState('');
  
  // Special handler for firstMessage to ensure links work
  const handleFirstMessageChange = (content) => {
    // ReactQuill provides HTML content directly
    setFirstMessage(content);
  };
  const [messageStarters, setMessageStarters] = useState(['']);
  const [selectedModel, setSelectedModel] = useState('standard');
  const [enabledTools, setEnabledTools] = useState({ createVisualization: false });
  const [studentFeatures, setStudentFeatures] = useState({
    allowFileUpload: true
  });

  // Location state – these determine where the assistant is created.
  const [currentTypeState, setCurrentTypeState] = useState(type); // e.g. 'course', 'unit', or 'lesson'
  const [currentEntityIdState, setCurrentEntityIdState] = useState(entityId);
  const [currentParentIdState, setCurrentParentIdState] = useState(parentId);

  // Courses loaded from Firebase (for the ContextSelector)
  const [courses, setCourses] = useState({});
const [assistantDescription, setAssistantDescription] = useState('');
const [isGenerating, setIsGenerating] = useState(false);
const [activeInfoSection, setActiveInfoSection] = useState(null);
// Add these right after the other useState declarations (around line 158)
const [uploadedFileIds, setUploadedFileIds] = useState([]);
const [uploadedImageIds, setUploadedImageIds] = useState([]);
const [fileCount, setFileCount] = useState(0);
const [imageCount, setImageCount] = useState(0);
const [attachedContexts, setAttachedContexts] = useState({ files: [], images: [] });
const [assistantFiles, setAssistantFiles] = useState({});
const [fileSheetOpen, setFileSheetOpen] = useState(false);
const [imageSheetOpen, setImageSheetOpen] = useState(false);
const [tempAssistantId, setTempAssistantId] = useState(null);

const handleContextUpdate = (contexts) => {
  setAttachedContexts(contexts);
};

const calculateFileCount = (firebaseFiles = {}, localFileIds = []) => {
  const firebaseCount = Object.values(firebaseFiles).filter(value => value === true).length;
  const localCount = localFileIds.length;
  return Math.max(firebaseCount, localCount);
};

const calculateImageCount = (firebaseImages = {}, localImageIds = []) => {
  const firebaseCount = Object.values(firebaseImages).filter(value => value === true).length;
  const localCount = localImageIds.length;
  return Math.max(firebaseCount, localCount);
};



// Generate assistant configuration using cloud function
const generateAssistantConfig = async (description, fileContexts, imageContexts, firebaseApp) => {
  try {
    const functions = getFunctions(firebaseApp);
    // Note: Firebase deployed this without the edbotz- prefix
    const generateAssistant = httpsCallable(functions, 'generateAssistant');

    const result = await generateAssistant({
      description,
      fileContexts: fileContexts || [],
      imageContexts: imageContexts || []
    });

    if (result.data.success) {
      return result.data.config;
    } else {
      throw new Error(result.data.error || 'Failed to generate assistant configuration');
    }
  } catch (error) {
    console.error('Error generating assistant config:', error);
    console.error('Error details:', error.message, error.code);
    throw error;
  }
};

// Handler for generate button
const handleGenerate = async () => {
  if (!assistantDescription.trim()) return;

  setIsGenerating(true);
  try {
    const config = await generateAssistantConfig(
      assistantDescription,
      attachedContexts.files,
      attachedContexts.images,
      firebaseApp
    );

    console.log('Generated config:', config);

    // Update all the fields with generated values
    setAssistantName(config.assistantName);
    setInstructions(config.instructions);
    setFirstMessage(config.firstMessage);
    setMessageStarters(config.messageStarters || ['']);

    // Show success feedback
    console.log('Assistant configuration generated successfully');

  } catch (error) {
    console.error('Error:', error);
    alert('Failed to generate assistant configuration. Please try again or configure manually.');
  } finally {
    setIsGenerating(false);
  }
};

  // Load courses from Firebase
  useEffect(() => {
    if (!user?.uid) return;
    const db = getDatabase();
    const coursesRef = ref(db, `edbotz/courses/${user.uid}`);
    const unsubscribe = onValue(coursesRef, (snapshot) => {
      const data = snapshot.val() || {};
      const normalizedCourses = {};
      Object.entries(data).forEach(([courseId, course]) => {
        const units = course.units || [];
        const processedUnits = Array.isArray(units)
          ? units.map(unit => ({ ...unit, courseId }))
          : [];
        if (courseId === DEFAULT_COURSE.id) {
          normalizedCourses[courseId] = {
            ...DEFAULT_COURSE,
            ...course,
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

  // If editing an existing assistant, load its data.
  useEffect(() => {
    const loadExistingAssistant = async () => {
      if (!existingAssistantId) {
        // Reset states for new assistant
        setAssistantName('');
        setInstructions('');
        setFirstMessage('');
        setMessageStarters(['']);
        setSelectedModel('standard');
        setEnabledTools({ createVisualization: false });
        setStudentFeatures({ allowFileUpload: true });
        setCurrentTypeState(type);
        setCurrentEntityIdState(entityId);
        setCurrentParentIdState(parentId);
        setAssistantFiles({});
        setUploadedFileIds([]);
        setUploadedImageIds([]); // Add this line
        return;
      }

      try {
        const db = getDatabase();
        const assistantRef = ref(db, `edbotz/assistants/${user.uid}/${existingAssistantId}`);
        const snapshot = await get(assistantRef);
        const assistant = snapshot.val();

        if (assistant) {
          setAssistantName(assistant.assistantName || '');
          setInstructions(assistant.instructions || '');
          setFirstMessage(assistant.firstMessage || '');
          setMessageStarters(assistant.messageStarters?.length ? assistant.messageStarters : ['']);
          setSelectedModel(assistant.model || 'standard');
          setEnabledTools(assistant.enabledTools || { createVisualization: false });
          setStudentFeatures(assistant.studentFeatures || { allowFileUpload: true });
          setCurrentTypeState(assistant.usage?.type || 'course');
          setCurrentEntityIdState(assistant.usage?.entityId || null);
          setCurrentParentIdState(assistant.usage?.parentId || null);

          // Load files information
          if (assistant.files) {
            const fileIds = Object.keys(assistant.files).filter(key => assistant.files[key] === true);
            setUploadedFileIds(fileIds);
            
            // Fetch file details for each file
            const fileDetailsPromises = fileIds.map(async (fileId) => {
              const fileRef = ref(db, `edbotz/files/${fileId}`);
              const fileSnapshot = await get(fileRef);
              return { id: fileId, ...fileSnapshot.val() };
            });
            
            const fileDetails = await Promise.all(fileDetailsPromises);
            const filesObject = fileDetails.reduce((acc, file) => {
              if (file) {
                acc[file.id] = file;
              }
              return acc;
            }, {});
            
            setAssistantFiles(filesObject);
          }

          // Load images information
          if (assistant.images) {
            const imageIds = Object.keys(assistant.images).filter(key => assistant.images[key] === true);
            setUploadedImageIds(imageIds);
          }
        }
      } catch (error) {
        console.error('Error loading assistant:', error);
      }
    };
    loadExistingAssistant();
  }, [existingAssistantId, user?.uid, type, entityId, parentId]);

  // Handler for location selection using ContextSelector.
  const handleLocationSelect = (context) => {
    if (context.type === 'course') {
      setCurrentTypeState('course');
      setCurrentEntityIdState(context.data.id);
      setCurrentParentIdState(null);
    } else if (context.type === 'unit') {
      setCurrentTypeState('unit');
      setCurrentEntityIdState(context.data.id);
      setCurrentParentIdState(context.data.courseId);
    } else if (context.type === 'lesson') {
      setCurrentTypeState('lesson');
      setCurrentEntityIdState(context.data.id);
      setCurrentParentIdState(context.unitData ? context.unitData.courseId : null);
    } else {
      setCurrentTypeState('course');
      setCurrentEntityIdState(DEFAULT_COURSE.id);
      setCurrentParentIdState(null);
    }
  };

  // Local state for the ContextSelector inside the sheet.
  const [localSelectedContext, setLocalSelectedContext] = useState(
    selectedContext || { type: 'course', data: { id: 'courseless-assistants', title: 'Courseless Assistants' } }
  );
  useEffect(() => {
    if (selectedContext) {
      setLocalSelectedContext(selectedContext);
    }
  }, [selectedContext]);

  // Add state for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Handler for temporary assistant ID creation
  const handleAssistantIdCreated = (newId) => {
    setTempAssistantId(newId);
  };

// Update the useEffect for file count tracking
useEffect(() => {
  if (!existingAssistantId && !tempAssistantId) {
    setFileCount(uploadedFileIds.length);
    return;
  }

  const db = getDatabase(firebaseApp);
  const filesRef = ref(db, `edbotz/assistants/${user.uid}/${existingAssistantId || tempAssistantId}/files`);
  
  const unsubscribe = onValue(filesRef, (snapshot) => {
    const filesData = snapshot.val() || {};
    const count = calculateFileCount(filesData, uploadedFileIds);
    setFileCount(count);
  });

  return () => unsubscribe();
}, [existingAssistantId, tempAssistantId, firebaseApp, user?.uid, uploadedFileIds]);


  // Update useEffect to load existing files
  useEffect(() => {
    if (!existingAssistantId && !tempAssistantId) return;

    const db = getDatabase(firebaseApp);
    const filesRef = ref(db, `assistant-files/${existingAssistantId || tempAssistantId}`);
    
    const unsubscribe = onValue(filesRef, (snapshot) => {
      const filesData = snapshot.val() || {};
      const filesList = Object.entries(filesData).map(([id, file]) => ({
        id,
        ...file
      }));
      setAssistantFiles(filesList);
    });

    return () => unsubscribe();
  }, [existingAssistantId, tempAssistantId, firebaseApp]);

  const handleFilesUploaded = (fileIds, filesData) => {
    setUploadedFileIds(fileIds); // Replace instead of merge
    setFileCount(fileIds.length); // Set count to match exactly what's passed
    setAssistantFiles(filesData); // Replace instead of merge
  };


  // Add new effect for tracking image count
  useEffect(() => {
    if (!existingAssistantId && !tempAssistantId) {
      setImageCount(uploadedImageIds.length);
      return;
    }
  
    const db = getDatabase(firebaseApp);
    const imagesRef = ref(db, `edbotz/assistants/${user.uid}/${existingAssistantId || tempAssistantId}/images`);
    
    const unsubscribe = onValue(imagesRef, (snapshot) => {
      const imagesData = snapshot.val() || {};
      const count = calculateImageCount(imagesData, uploadedImageIds);
      setImageCount(count);
    });
  
    return () => unsubscribe();
  }, [existingAssistantId, tempAssistantId, firebaseApp, user?.uid, uploadedImageIds]);

  // Add handler for receiving image IDs
// Add handler for receiving image IDs
const handleImagesUploaded = (imageIds) => {
  // Only include IDs that are passed from the ImageManagementSheet
  setUploadedImageIds(imageIds); // Replace instead of merge
  setImageCount(imageIds.length); // Set count to match exactly what's passed
};

  // When saving, we commit all changes at once.
  const handleSave = async () => {
    if (!assistantName.trim() || !user?.uid) return;
    
    const finalAssistantId = existingAssistantId || tempAssistantId;
    const db = getDatabase();
    
    // Create the files object with all file IDs set to true
    const filesObject = uploadedFileIds.reduce((acc, fileId) => {
      acc[fileId] = true;  // This ensures each file ID is properly mapped to true
      return acc;
    }, {});

    const imagesObject = uploadedImageIds.reduce((acc, imageId) => {
      acc[imageId] = true;
      return acc;
    }, {});

    const assistantData = {
      assistantName,
      instructions,
      // firstMessage might be HTML from ReactQuill or plain text
      firstMessage,
      messageStarters: messageStarters.filter(msg => msg.trim() !== ''),
      model: selectedModel,
      enabledTools: enabledTools,
      studentFeatures: studentFeatures,
      usage: {
        type: currentTypeState,
        entityId: currentEntityIdState,
        parentId: currentParentIdState,
        courseId: currentTypeState === 'course' ? currentEntityIdState : currentParentIdState
      },
      files: filesObject,  // Make sure this is included in the update
      images: imagesObject,
      updatedAt: new Date().toISOString(),
      createdBy: user.uid
    };
  
    try {
      const updates = {};
      let assistantId = finalAssistantId;
  
      if (!assistantId) {
        // Create new ID if none exists
        const newAssistantRef = push(ref(db, `edbotz/assistants/${user.uid}`));
        assistantId = newAssistantRef.key;
        updates[`edbotz/assistants/${user.uid}/${assistantId}`] = {
          ...assistantData,
          createdAt: new Date().toISOString()
        };
      } else {
        updates[`edbotz/assistants/${user.uid}/${assistantId}`] = assistantData;
      }
  
      // Determine the course path
      const isDefaultCourse = currentEntityIdState === DEFAULT_COURSE.id;
      const coursePath = isDefaultCourse 
        ? `edbotz/courses/${user.uid}/courseless-assistants`
        : `edbotz/courses/${user.uid}/${currentParentIdState || currentEntityIdState}`;
  
      if (currentTypeState === 'course') {
        updates[`${coursePath}/assistants/${assistantId}`] = true;
        updates[`${coursePath}/hasAI`] = true;
      } else {
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
  
      await update(ref(db), updates);
      onOpenChange(false);
      onSave({ assistantId, ...assistantData });
    } catch (error) {
      console.error('Error saving assistant:', error);
      throw error;
    }
  };

  // Handle delete confirmation
  const handleDelete = async () => {
    try {
      const db = getDatabase();
      const storage = getStorage();
      const updates = {};
  
      // First, get all files associated with this assistant
      const filesSnapshot = await get(ref(db, `assistant-files/${existingAssistantId}`));
      const files = filesSnapshot.val() || {};
  
      // Delete all files from storage
      await Promise.all(
        Object.values(files).map(async (file) => {
          const fileRef = storageRef(storage, `assistant-files/${existingAssistantId}/${file.name}`);
          try {
            await deleteObject(fileRef);
          } catch (error) {
            console.error(`Error deleting file ${file.name}:`, error);
          }
        })
      );
  
      // Remove all file references from database
      updates[`assistant-files/${existingAssistantId}`] = null;
  
      // Remove the assistant from the assistants collection
      updates[`edbotz/assistants/${user.uid}/${existingAssistantId}`] = null;
  
      // Remove the assistant reference from its location
      const isDefaultCourse = currentEntityIdState === DEFAULT_COURSE.id;
      const coursePath = isDefaultCourse 
        ? `edbotz/courses/${user.uid}/courseless-assistants`
        : `edbotz/courses/${user.uid}/${currentParentIdState || currentEntityIdState}`;
  
      if (currentTypeState === 'course') {
        updates[`${coursePath}/assistants/${existingAssistantId}`] = null;
      } else {
        const courseRef = ref(db, coursePath);
        const courseSnapshot = await get(courseRef);
        const courseData = courseSnapshot.val();
  
        if (currentTypeState === 'unit') {
          if (courseData?.units) {
            const units = Array.isArray(courseData.units) ? courseData.units : Object.values(courseData.units);
            const unitIndex = units.findIndex(unit => unit.id === currentEntityIdState);
            if (unitIndex !== -1) {
              updates[`${coursePath}/units/${unitIndex}/assistants/${existingAssistantId}`] = null;
            }
          }
        } else if (currentTypeState === 'lesson') {
          if (courseData?.units) {
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
              updates[`${coursePath}/units/${unitIndex}/lessons/${lessonIndex}/assistants/${existingAssistantId}`] = null;
            }
          }
        }
      }
  
      // Perform all database updates in a single transaction
      await update(ref(db), updates);
      onOpenChange(false);
      if (onDelete) {
        onDelete(existingAssistantId);
      }
    } catch (error) {
      console.error('Error deleting assistant:', error);
      throw error;
    }
  };



  // Updated renderFooterButtons to include delete button
  const renderFooterButtons = () => {
    if (existingAssistantId) {
      return (
        <div className="space-y-4 pt-6 border-t">
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="hover:bg-gray-100"
            >
              Close
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
            >
              Save Changes
            </Button>
          </div>
          <div className="flex justify-center border-t pt-4">
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Assistant
            </Button>
          </div>
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

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
  side="right"
  className="w-full sm:max-w-[1200px] h-screen overflow-y-auto bg-gradient-to-br from-white to-gray-50"
>
          <SheetHeader className="pb-6 border-b">
            <div className="flex flex-col space-y-2 pr-8">
              <div className="flex items-start justify-between">
                <div className="flex flex-col space-y-1">
                  <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {existingAssistantId ? 'Edit AI Assistant' : 'Create AI Assistant'}
                  </SheetTitle>
                  <SheetDescription className="text-gray-600">
                    {existingAssistantId
                      ? 'Edit your AI teaching assistant. Changes will be saved when you click Save.'
                      : 'Configure your AI teaching assistant to help your students learn and engage with the material.'}
                  </SheetDescription>
                </div>
              </div>
            </div>
          </SheetHeader>
  
          <div className="space-y-8 py-6">
            {/* Assistant Location */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Assistant Location</Label>
                <InfoSection
                  id="location"
                  activeInfoSection={activeInfoSection}
                  setActiveInfoSection={setActiveInfoSection}
                />
              </div>
              <ContextSelector
                courses={courses}
                onContextSelect={handleLocationSelect}
                availableAssistants={[]}
                selectedContext={localSelectedContext}
              />
           
            </div>
  
            {/* AI Model Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI Model</Label>
                <InfoSection
                  id="modelSelection"
                  activeInfoSection={activeInfoSection}
                  setActiveInfoSection={setActiveInfoSection}
                />
              </div>
              <RadioGroup
                defaultValue="standard"
                value={selectedModel}
                onValueChange={setSelectedModel}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem value="standard" id="standard" className="peer sr-only" />
                  <Label
                    htmlFor="standard"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary"
                  >
                    <Bot className="mb-3 h-6 w-6" />
                    <div className="mb-2 font-semibold">Standard Model</div>
                    <span className="text-sm text-muted-foreground">
                      Fast responses, efficient for most tasks
                    </span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="advanced" id="advanced" className="peer sr-only" />
                  <Label
                    htmlFor="advanced"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary"
                  >
                    <Bot className="mb-3 h-6 w-6" />
                    <div className="mb-2 font-semibold">Advanced Model</div>
                    <span className="text-sm text-muted-foreground">
                      More capable, better for complex topics
                    </span>
                  </Label>
                </div>
              </RadioGroup>

            </div>

            {/* Assistant Options Accordion */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Assistant Options
                </Label>
              </div>
              <Accordion type="single" collapsible className="border rounded-lg">
                <AccordionItem value="options" className="border-0">
                  <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                    <span className="text-sm font-medium">Configure Tools & Features</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      {/* Tools Section */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Assistant Tools</h4>
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              id="visualization-tool"
                              checked={enabledTools.createVisualization || false}
                              onChange={(e) => setEnabledTools({
                                ...enabledTools,
                                createVisualization: e.target.checked
                              })}
                              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="visualization-tool" className="flex-1">
                              <div className="font-medium text-gray-900">Visualization Tool</div>
                              <p className="text-sm text-gray-600">
                                Create interactive diagrams, graphs, and visualizations. Ideal for STEM subjects.
                              </p>
                            </label>
                          </div>
                          {/* Future tools can be added here */}
                        </div>
                      </div>

                      <div className="border-t pt-4"></div>

                      {/* Student Features Section */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Student Features</h4>
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              id="allow-file-upload"
                              checked={studentFeatures.allowFileUpload}
                              onChange={(e) => setStudentFeatures({
                                ...studentFeatures,
                                allowFileUpload: e.target.checked
                              })}
                              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="allow-file-upload" className="flex-1">
                              <div className="font-medium text-gray-900">Allow File Uploads</div>
                              <p className="text-sm text-gray-600">
                                Students can upload documents and images for the assistant to analyze.
                              </p>
                            </label>
                          </div>

                        </div>
                      </div>

                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600">
                          <strong>Note:</strong> When tools are disabled, the assistant won't mention or suggest using them.
                          Student features control what students can share with the assistant.
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

  
            {/* Quick Create with AI */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
  Quick Create with AI
</span>
                <InfoSection
                  id="aiDescription"
                  activeInfoSection={activeInfoSection}
                  setActiveInfoSection={setActiveInfoSection}
                />
              </div>
              <Accordion type="single" collapsible>
                <AccordionItem value="description" className="border rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50">
                  <AccordionTrigger className="text-sm font-medium text-gray-700 px-4 py-3 flex items-center">
                    <Sparkles className="w-4 h-4 text-purple-500 mr-2" />
                    <span>Quick Create with AI</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">
                        Describe the teaching assistant you want to create, and AI will help generate the configuration. You can edit any fields afterward.
                      </Label>
                      <QuickCreateControls
      fileCount={fileCount}
      imageCount={imageCount}
      uploadedFileIds={uploadedFileIds}
      uploadedImageIds={uploadedImageIds}
      firebaseApp={firebaseApp}
      onContextUpdate={handleContextUpdate}
    />
                      <Textarea
                        value={assistantDescription}
                        onChange={(e) => setAssistantDescription(e.target.value)}
                        placeholder="Example: I want to create a math tutor assistant that helps students with algebra problems. It should be friendly, patient, and good at breaking down complex problems into simple steps..."
                        className="min-h-[120px]"
                      />
                      <Button
                        onClick={handleGenerate}
                        disabled={!assistantDescription.trim() || isGenerating}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                      >
                        {isGenerating ? (
                          <>
                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate Assistant
                          </>
                        )}
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
           
            </div>
  {/* Assistant Name */}
<div className="space-y-2">
  <div className="flex-1 space-y-2">
    <Label className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Assistant Name</Label>
    <Input
      value={assistantName}
      onChange={(e) => setAssistantName(e.target.value)}
      placeholder="e.g., Math Helper, Writing Coach"
      className="w-full h-10"
    />
  </div>
</div>
            {/* Assistant Personality & Instructions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Assistant Personality & Instructions
                </Label>
                <InfoSection
                  id="instructions"
                  activeInfoSection={activeInfoSection}
                  setActiveInfoSection={setActiveInfoSection}
                />
              </div>
              <EditableTextarea
                value={instructions}
                onChange={setInstructions}
                placeholder="Describe how the assistant should behave and interact with students..."
              />
           
            </div>
  
            {/* First Message */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">First Message</Label>
                <InfoSection
                  id="firstMessage"
                  activeInfoSection={activeInfoSection}
                  setActiveInfoSection={setActiveInfoSection}
                />
              </div>
              <EditableRichText
                value={firstMessage}
                onChange={handleFirstMessageChange}
                placeholder="Enter the first message the assistant will send to students..."
                className="mb-4" 
              />
            </div>
  
       {/* Message Starters */}
<div className="space-y-2">
  <div className="flex items-center justify-between">
    <Label className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Message Starters</Label>
    <InfoSection
      id="messageStarters"
      activeInfoSection={activeInfoSection}
      setActiveInfoSection={setActiveInfoSection}
    />
  </div>

  <div className="space-y-3">
    {messageStarters.map((starter, index) => (
      <div key={index} className="flex gap-2">
        <div className="flex-1 space-y-2">
          <Label className="text-sm font-medium text-gray-700">{`Starter ${index + 1}`}</Label>
          <Input
            value={starter}
            onChange={(e) => {
              const newStarters = [...messageStarters];
              newStarters[index] = e.target.value;
              setMessageStarters(newStarters);
            }}
            placeholder="Enter a message starter..."
            className="w-full h-10"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            const newStarters = messageStarters.filter((_, i) => i !== index);
            setMessageStarters(newStarters);
          }}
          className="h-10 mt-8"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    ))}
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => setMessageStarters([...messageStarters, ''])}
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
  
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete AI Assistant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this AI assistant? This action cannot be undone.
              All conversations and configurations associated with this assistant will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* File Management Sheet */}
      <FileManagementSheet
        open={fileSheetOpen}
        onOpenChange={setFileSheetOpen}
        onFilesUploaded={handleFilesUploaded}
        existingFileIds={uploadedFileIds}
        assistantId={existingAssistantId || tempAssistantId}
        onAssistantIdCreated={handleAssistantIdCreated}
        firebaseApp={firebaseApp}
      />

<ImageManagementSheet
  open={imageSheetOpen}
  onOpenChange={setImageSheetOpen}
  onImagesUploaded={handleImagesUploaded}
  existingImageIds={uploadedImageIds}
  firebaseApp={firebaseApp}
  userId={user?.uid}  // Add this
  assistantId={existingAssistantId || tempAssistantId}  // Add this
/>
    </>
  );
  
};

export default AIAssistantSheet;
