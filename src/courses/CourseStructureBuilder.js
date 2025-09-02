import React, { useState } from 'react';
import { 
  FaPlus, 
  FaTrash, 
  FaEdit, 
  FaBook,
  FaClipboardList,
  FaFlask,
  FaGraduationCap,
  FaQuestionCircle,
  FaSave,
  FaTimes,
  FaUpload,
  FaFileImport,
  FaChevronDown
} from 'react-icons/fa';
import { 
  MoveUp, 
  MoveDown 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { toast } from 'sonner';
import { 
  generateUnitId, 
  generateItemId,
  generateQuestionId,
  getNextQuestionNumber,
  validateItemId,
  extractItemIdPrefix,
  extractTitleFromItemId
} from '../utils/firebaseCourseConfigUtils';
import QuestionForm from './components/QuestionForm';
import QuestionImportModal from './components/QuestionImportModal';

const CourseStructureBuilder = ({ courseId, structure, onUpdate, isEditing }) => {
  const [editingUnit, setEditingUnit] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [unitEditForm, setUnitEditForm] = useState({});
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [addingQuestion, setAddingQuestion] = useState(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importTarget, setImportTarget] = useState(null); // {unitIndex, itemIndex}
  const [addingItem, setAddingItem] = useState(null); // unitIndex when showing add item form
  const [addItemForm, setAddItemForm] = useState({});
  const [showTimeEstimates, setShowTimeEstimates] = useState(true); // Toggle for showing time estimates
  const [editingInlineTime, setEditingInlineTime] = useState(null); // Track which item's time is being edited inline

  const units = structure?.units || [];

  // Unit management
  const addUnit = () => {
    const unitNumber = units.length + 1;
    const unitName = 'New Unit';
    
    const newUnit = {
      unitId: generateUnitId(unitNumber, unitName),
      name: unitName,
      order: unitNumber,
      items: []
    };
    
    onUpdate({
      ...structure,
      units: [...units, newUnit]
    });
  };

  const updateUnit = (unitIndex, updates) => {
    const updatedUnits = [...units];
    const currentUnit = updatedUnits[unitIndex];
    
    // If name is being updated, regenerate the unitId to match
    if (updates.name && updates.name !== currentUnit.name) {
      updates.unitId = generateUnitId(currentUnit.order, updates.name);
    }
    
    updatedUnits[unitIndex] = { ...currentUnit, ...updates };
    
    onUpdate({
      ...structure,
      units: updatedUnits
    });
  };

  const deleteUnit = (unitIndex) => {
    const updatedUnits = units.filter((_, index) => index !== unitIndex);
    
    // Reorder remaining units
    updatedUnits.forEach((unit, index) => {
      unit.order = index + 1;
    });

    onUpdate({
      ...structure,
      units: updatedUnits
    });
  };

  // Item management
  const startAddingItem = (unitIndex) => {
    const currentUnit = units[unitIndex];
    const nextOrder = (currentUnit.items?.length || 0) + 1;
    
    setAddingItem(unitIndex);
    setAddItemForm({
      itemId: '',
      title: '',
      type: 'lesson',
      estimatedTime: 30
    });
  };

  const cancelAddingItem = () => {
    setAddingItem(null);
    setAddItemForm({});
  };

  const saveNewItem = (unitIndex) => {
    const currentUnit = units[unitIndex];
    const itemNumber = (currentUnit.items?.length || 0) + 1;
    
    const { itemId, title, type, estimatedTime, description } = addItemForm;
    
    // If no title provided, extract it from itemId
    const finalTitle = title || extractTitleFromItemId(itemId) || 'New Item';
    
    const newItem = {
      itemId: itemId,
      type: type || 'lesson',
      title: finalTitle,
      description: description || '',
      estimatedTime: parseInt(estimatedTime) || 30,
      order: itemNumber,
      questions: []
    };

    // Validate the itemId
    const validation = validateItemId(newItem.itemId, structure);
    if (!validation.isValid) {
      toast.error(`Invalid Item ID: ${validation.errors.join(', ')}`);
      return;
    }

    const updatedUnits = [...units];
    updatedUnits[unitIndex].items = [...(updatedUnits[unitIndex].items || []), newItem];
    
    onUpdate({
      ...structure,
      units: updatedUnits
    });

    // Reset form
    setAddingItem(null);
    setAddItemForm({});
    toast.success('Item added successfully');
  };

  const deleteItem = (unitIndex, itemIndex) => {
    const updatedUnits = [...units];
    updatedUnits[unitIndex].items = updatedUnits[unitIndex].items.filter((_, index) => index !== itemIndex);
    
    // Reorder remaining items
    updatedUnits[unitIndex].items.forEach((item, index) => {
      item.order = index + 1;
    });

    onUpdate({
      ...structure,
      units: updatedUnits
    });
  };

  const moveItem = (unitIndex, itemIndex, direction) => {
    const updatedUnits = [...units];
    const items = updatedUnits[unitIndex].items;
    const newIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    
    if (newIndex >= 0 && newIndex < items.length) {
      [items[itemIndex], items[newIndex]] = [items[newIndex], items[itemIndex]];
      
      // Update order values
      items.forEach((item, index) => {
        item.order = index + 1;
      });
    }

    onUpdate({
      ...structure,
      units: updatedUnits
    });
  };

  // Edit form management for items
  const startEditingItem = (unitIndex, itemIndex) => {
    const item = units[unitIndex].items[itemIndex];
    setEditingItem(`${unitIndex}-${itemIndex}`);
    setEditForm({
      itemId: item.itemId,
      title: item.title,
      type: item.type,
      description: item.description || '',
      estimatedTime: item.estimatedTime
    });
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setEditForm({});
  };

  // Edit form management for units
  const startEditingUnit = (unitIndex) => {
    const unit = units[unitIndex];
    setEditingUnit(unitIndex);
    setUnitEditForm({
      name: unit.name
    });
  };

  const cancelUnitEditing = () => {
    setEditingUnit(null);
    setUnitEditForm({});
  };

  const saveUnitChanges = (unitIndex) => {
    const updatedUnits = [...units];
    const currentUnit = updatedUnits[unitIndex];
    
    const updates = { ...unitEditForm };
    
    // If name is being updated, regenerate the unitId to match
    if (updates.name && updates.name !== currentUnit.name) {
      updates.unitId = generateUnitId(currentUnit.order, updates.name);
    }
    
    updatedUnits[unitIndex] = { ...currentUnit, ...updates };
    
    onUpdate({
      ...structure,
      units: updatedUnits
    });

    // Reset editing state
    setEditingUnit(null);
    setUnitEditForm({});
  };

  const saveItemChanges = (unitIndex, itemIndex) => {
    const updatedUnits = [...units];
    const currentItem = updatedUnits[unitIndex].items[itemIndex];
    
    const updates = { ...editForm };
    
    // If itemId changed, auto-populate title if it's empty
    if (updates.itemId && updates.itemId !== currentItem.itemId) {
      // Validate the new itemId
      const validation = validateItemId(updates.itemId, structure, unitIndex, itemIndex);
      if (!validation.isValid) {
        toast.error(`Invalid Item ID: ${validation.errors.join(', ')}`);
        return;
      }
      
      // If title is empty, extract from itemId
      if (!updates.title || updates.title === currentItem.title) {
        const extractedTitle = extractTitleFromItemId(updates.itemId);
        if (extractedTitle) {
          updates.title = extractedTitle;
        }
      }
    }
    
    updatedUnits[unitIndex].items[itemIndex] = { 
      ...currentItem, 
      ...updates,
      order: currentItem.order // Preserve the order
    };
    
    onUpdate({
      ...structure,
      units: updatedUnits
    });

    // Reset editing state
    setEditingItem(null);
    setEditForm({});
    toast.success('Item updated successfully');
  };

  // Question management
  const startAddingQuestion = (unitIndex, itemIndex) => {
    setAddingQuestion(`${unitIndex}-${itemIndex}`);
  };

  const cancelAddingQuestion = () => {
    setAddingQuestion(null);
  };

  const saveNewQuestion = (unitIndex, itemIndex, questionData) => {
    const updatedUnits = [...units];
    const item = updatedUnits[unitIndex].items[itemIndex];
    
    updatedUnits[unitIndex].items[itemIndex] = {
      ...item,
      questions: [...(item.questions || []), questionData]
    };
    
    onUpdate({
      ...structure,
      units: updatedUnits
    });
    
    setAddingQuestion(null);
  };

  const deleteQuestion = (unitIndex, itemIndex, questionIndex) => {
    const updatedUnits = [...units];
    const item = updatedUnits[unitIndex].items[itemIndex];
    
    updatedUnits[unitIndex].items[itemIndex] = {
      ...item,
      questions: item.questions.filter((_, index) => index !== questionIndex)
    };
    
    onUpdate({
      ...structure,
      units: updatedUnits
    });
  };

  const startEditingQuestion = (unitIndex, itemIndex, questionIndex) => {
    setEditingQuestion(`${unitIndex}-${itemIndex}-${questionIndex}`);
  };

  const cancelQuestionEditing = () => {
    setEditingQuestion(null);
  };

  const saveQuestionChanges = (unitIndex, itemIndex, questionIndex, questionData) => {
    const updatedUnits = [...units];
    const questions = [...updatedUnits[unitIndex].items[itemIndex].questions];
    
    questions[questionIndex] = questionData;
    
    updatedUnits[unitIndex].items[itemIndex] = {
      ...updatedUnits[unitIndex].items[itemIndex],
      questions
    };
    
    onUpdate({
      ...structure,
      units: updatedUnits
    });
    
    setEditingQuestion(null);
  };

  // Question import management
  const startImportQuestions = (unitIndex, itemIndex) => {
    setImportTarget({ unitIndex, itemIndex });
    setImportModalOpen(true);
  };

  const handleBulkImport = (questions, importMode) => {
    if (!importTarget) return;

    const { unitIndex, itemIndex } = importTarget;
    const updatedUnits = [...units];
    const item = updatedUnits[unitIndex].items[itemIndex];

    if (importMode === 'replace') {
      // Replace all questions
      updatedUnits[unitIndex].items[itemIndex] = {
        ...item,
        questions: questions
      };
    } else {
      // Add to existing questions
      updatedUnits[unitIndex].items[itemIndex] = {
        ...item,
        questions: [...(item.questions || []), ...questions]
      };
    }

    onUpdate({
      ...structure,
      units: updatedUnits
    });

    // Close modal and reset state
    setImportModalOpen(false);
    setImportTarget(null);
    
    // Show success message
    toast.success(`Imported ${questions.length} questions successfully`);
  };

  const closeImportModal = () => {
    setImportModalOpen(false);
    setImportTarget(null);
  };

  // State for import configuration dialog
  const [importConfigModal, setImportConfigModal] = useState(false);
  const [pendingImportData, setPendingImportData] = useState(null);
  const [importPreview, setImportPreview] = useState(null);

  // Handle import configuration choice
  const handleImportChoice = (choice) => {
    if (!pendingImportData) return;

    if (choice === 'structure-only') {
      // Import just the course structure
      const structureData = pendingImportData.courseStructure || pendingImportData;
      onUpdate(structureData);
      toast.success('Course structure imported successfully!');
    } else if (choice === 'full-config') {
      // Import full configuration - pass to parent
      if (window.updateFullCourseConfig) {
        window.updateFullCourseConfig(pendingImportData);
        toast.success('Full course configuration imported successfully!');
      } else {
        toast.error('Full configuration import not available. Please use structure-only import.');
      }
    }

    // Clean up
    setImportConfigModal(false);
    setPendingImportData(null);
    setImportPreview(null);
  };

  // Import structure from JSON file
  const handleImportStructure = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        // Check if this is a full configuration or just structure
        const isFullConfig = importedData.courseStructure && importedData.courseId;
        
        if (isFullConfig) {
          // This is a full configuration file
          // Prepare preview data
          const preview = {
            courseId: importedData.courseId,
            title: importedData.title,
            hasStructure: !!importedData.courseStructure?.units,
            unitCount: importedData.courseStructure?.units?.length || 0,
            hasWeights: !!importedData.weights,
            hasAttemptLimits: !!importedData.attemptLimits,
            hasProgressionRequirements: !!importedData.progressionRequirements,
            hasAIFeatures: !!importedData.aiFeatures,
            hasMetadata: !!importedData.metadata
          };
          
          setPendingImportData(importedData);
          setImportPreview(preview);
          setImportConfigModal(true);
          return;
        }
        
        // Otherwise, treat as structure-only import
        const structureToValidate = importedData.units ? importedData : { units: [] };
        
        // Validate the imported structure
        if (!structureToValidate.units || !Array.isArray(structureToValidate.units)) {
          toast.error('Invalid structure: missing units array');
          return;
        }

        // Detailed validation
        const validationErrors = [];
        
        // Check each unit
        structureToValidate.units.forEach((unit, unitIndex) => {
          if (!unit.unitId) {
            validationErrors.push(`Unit ${unitIndex + 1}: missing unitId`);
          }
          if (!unit.name) {
            validationErrors.push(`Unit ${unitIndex + 1}: missing name`);
          }
          if (!unit.order || typeof unit.order !== 'number') {
            validationErrors.push(`Unit ${unitIndex + 1}: missing or invalid order`);
          }
          if (!unit.items || !Array.isArray(unit.items)) {
            validationErrors.push(`Unit ${unitIndex + 1}: missing items array`);
            return;
          }
          
          // Check each item
          unit.items.forEach((item, itemIndex) => {
            if (!item.itemId) {
              validationErrors.push(`Unit ${unitIndex + 1}, Item ${itemIndex + 1}: missing itemId`);
            }
            if (!item.title) {
              validationErrors.push(`Unit ${unitIndex + 1}, Item ${itemIndex + 1}: missing title`);
            }
            if (!item.type || !['lesson', 'assignment', 'lab', 'exam', 'quiz'].includes(item.type)) {
              validationErrors.push(`Unit ${unitIndex + 1}, Item ${itemIndex + 1}: invalid type`);
            }
            if (!item.order || typeof item.order !== 'number') {
              validationErrors.push(`Unit ${unitIndex + 1}, Item ${itemIndex + 1}: missing or invalid order`);
            }
            
            // Check questions if present
            if (item.questions && Array.isArray(item.questions)) {
              item.questions.forEach((question, qIndex) => {
                if (!question.questionId) {
                  validationErrors.push(`Unit ${unitIndex + 1}, Item ${itemIndex + 1}, Question ${qIndex + 1}: missing questionId`);
                }
                if (!question.title) {
                  validationErrors.push(`Unit ${unitIndex + 1}, Item ${itemIndex + 1}, Question ${qIndex + 1}: missing title`);
                }
                if (question.points === undefined || typeof question.points !== 'number') {
                  validationErrors.push(`Unit ${unitIndex + 1}, Item ${itemIndex + 1}, Question ${qIndex + 1}: missing or invalid points`);
                }
              });
            }
          });
        });

        if (validationErrors.length > 0) {
          toast.error(`Validation errors:\n${validationErrors.slice(0, 3).join('\n')}${validationErrors.length > 3 ? `\n...and ${validationErrors.length - 3} more` : ''}`);
          console.error('All validation errors:', validationErrors);
          return;
        }

        // Import the structure
        onUpdate(structureToValidate);
        toast.success('Course structure imported successfully!');
      } catch (error) {
        toast.error('Error parsing JSON file: ' + error.message);
      }
    };

    reader.readAsText(file);
    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  const getItemIcon = (type) => {
    switch (type) {
      case 'lesson': return <FaBook className="h-3 w-3 text-purple-500" />;
      case 'assignment': return <FaClipboardList className="h-3 w-3 text-blue-500" />;
      case 'lab': return <FaFlask className="h-3 w-3 text-green-500" />;
      case 'exam': return <FaGraduationCap className="h-3 w-3 text-red-500" />;
      case 'quiz': return <FaQuestionCircle className="h-3 w-3 text-orange-500" />;
      default: return <FaQuestionCircle className="h-3 w-3 text-gray-500" />;
    }
  };

  const getUnitColors = (unitIndex) => {
    const colorSchemes = [
      {
        border: 'border-blue-200',
        bg: 'bg-blue-50',
        header: 'bg-blue-100',
        text: 'text-blue-800',
        accent: 'text-blue-600'
      },
      {
        border: 'border-green-200',
        bg: 'bg-green-50',
        header: 'bg-green-100',
        text: 'text-green-800',
        accent: 'text-green-600'
      },
      {
        border: 'border-purple-200',
        bg: 'bg-purple-50',
        header: 'bg-purple-100',
        text: 'text-purple-800',
        accent: 'text-purple-600'
      },
      {
        border: 'border-orange-200',
        bg: 'bg-orange-50',
        header: 'bg-orange-100',
        text: 'text-orange-800',
        accent: 'text-orange-600'
      },
      {
        border: 'border-indigo-200',
        bg: 'bg-indigo-50',
        header: 'bg-indigo-100',
        text: 'text-indigo-800',
        accent: 'text-indigo-600'
      },
      {
        border: 'border-pink-200',
        bg: 'bg-pink-50',
        header: 'bg-pink-100',
        text: 'text-pink-800',
        accent: 'text-pink-600'
      }
    ];
    
    return colorSchemes[unitIndex % colorSchemes.length];
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h4 className="text-lg font-semibold">Course Structure</h4>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowTimeEstimates(!showTimeEstimates)}
            className="text-xs"
            title="Toggle time estimates display"
          >
            {showTimeEstimates ? '⏱️ Hide Times' : '⏱️ Show Times'}
          </Button>
        </div>
        {isEditing && (
          <div className="flex gap-2">
            <Button onClick={addUnit} size="sm">
              <FaPlus className="mr-2 h-4 w-4" />
              Add Unit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => document.getElementById('structure-import').click()}
            >
              <FaUpload className="mr-2 h-4 w-4" />
              Import JSON
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleImportStructure}
              style={{ display: 'none' }}
              id="structure-import"
            />
          </div>
        )}
      </div>

      {units.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FaBook className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p>No units created yet. Click "Add Unit" to get started.</p>
          {isEditing && (
            <p className="mt-2 text-sm">Or import a JSON file with your course structure.</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {units.map((unit, unitIndex) => {
            const colors = getUnitColors(unitIndex);
            return (
              <div key={unit.unitId} className={`border rounded-lg ${colors.border} ${colors.bg} overflow-hidden`}>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value={`unit-${unitIndex}`} className="border-none">
                    <AccordionTrigger className={`text-left px-4 py-3 ${colors.header} hover:${colors.header}/80 transition-colors`}>
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${colors.text}`}>{unit.name}</span>
                          <span className={`text-sm ${colors.accent}`}>
                            ({(unit.items || []).length} items{showTimeEstimates && `, ${(unit.items || []).reduce((sum, item) => sum + (item.estimatedTime || 0), 0)} min`})
                          </span>
                        </div>
                        
                        {isEditing && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditingUnit(unitIndex);
                              }}
                              className={`${colors.text} hover:${colors.bg}`}
                            >
                              <FaEdit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteUnit(unitIndex);
                              }}
                              className="text-red-500 hover:bg-red-50"
                            >
                              <FaTrash className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4">
                  {/* Unit Editor */}
                  {editingUnit === unitIndex && isEditing && (
                    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Unit Name</label>
                        <Input
                          value={unitEditForm.name || ''}
                          onChange={(e) => setUnitEditForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Unit name"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelUnitEditing}
                        >
                          <FaTimes className="mr-1 h-3 w-3" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => saveUnitChanges(unitIndex)}
                        >
                          <FaSave className="mr-1 h-3 w-3" />
                          Save
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Unit Items */}
                  <div className="space-y-2">
                    {(unit.items || []).map((item, itemIndex) => (
                      <div key={item.itemId} className="border rounded-lg p-3">
                        {editingItem === `${unitIndex}-${itemIndex}` ? (
                          // Edit Form
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium mb-1">Item ID</label>
                              <Input
                                value={editForm.itemId || ''}
                                onChange={(e) => {
                                  const newItemId = e.target.value;
                                  setEditForm(prev => {
                                    return {
                                      ...prev,
                                      itemId: newItemId,
                                      // Auto-populate title if it hasn't been manually changed
                                      title: prev.title === item.title ? extractTitleFromItemId(newItemId) || prev.title : prev.title
                                    };
                                  });
                                }}
                                placeholder="Enter any itemId format you want"
                              />
                              <p className="text-xs text-gray-500 mt-1">Any format allowed - title will auto-update</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <Input
                                  value={editForm.title || ''}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                  placeholder="Item title"
                                />
                                <p className="text-xs text-gray-500 mt-1">Will auto-update from Item ID</p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Type</label>
                                <Select
                                  value={editForm.type || 'lesson'}
                                  onValueChange={(value) => setEditForm(prev => ({ ...prev, type: value }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="lesson">Lesson</SelectItem>
                                    <SelectItem value="assignment">Assignment</SelectItem>
                                    <SelectItem value="lab">Lab</SelectItem>
                                    <SelectItem value="exam">Exam</SelectItem>
                                    <SelectItem value="quiz">Quiz</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-1">Description</label>
                              <Input
                                value={editForm.description || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Brief description of the item"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-1">Estimated Time (minutes)</label>
                              <Input
                                type="number"
                                value={editForm.estimatedTime || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 0 }))}
                                placeholder="30"
                              />
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={cancelEditing}
                              >
                                <FaTimes className="mr-1 h-3 w-3" />
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => saveItemChanges(unitIndex, itemIndex)}
                              >
                                <FaSave className="mr-1 h-3 w-3" />
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // Display Mode
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {getItemIcon(item.type)}
                                <div className="flex flex-col">
                                  <span className="font-medium">{item.title}</span>
                                  <span className="text-xs text-gray-400">ID: {item.itemId}</span>
                                </div>
                                {showTimeEstimates && (
                                  editingInlineTime === `${unitIndex}-${itemIndex}` ? (
                                    <Input
                                      type="number"
                                      value={item.estimatedTime || 0}
                                      onChange={(e) => {
                                        const updatedUnits = [...units];
                                        updatedUnits[unitIndex].items[itemIndex].estimatedTime = parseInt(e.target.value) || 0;
                                        onUpdate({
                                          ...structure,
                                          units: updatedUnits
                                        });
                                      }}
                                      onBlur={() => setEditingInlineTime(null)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          setEditingInlineTime(null);
                                        }
                                      }}
                                      className="w-16 h-6 text-sm"
                                      autoFocus
                                    />
                                  ) : (
                                    <span 
                                      className="text-sm text-gray-500 cursor-pointer hover:bg-gray-100 px-1 rounded"
                                      onClick={() => isEditing && setEditingInlineTime(`${unitIndex}-${itemIndex}`)}
                                      title={isEditing ? "Click to edit time" : ""}
                                    >
                                      ({item.estimatedTime || 0} min)
                                    </span>
                                  )
                                )}
                              </div>
                              
                              {isEditing && (
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => startEditingItem(unitIndex, itemIndex)}
                                  >
                                    <FaEdit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => moveItem(unitIndex, itemIndex, 'up')}
                                    disabled={itemIndex === 0}
                                  >
                                    <MoveUp className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => moveItem(unitIndex, itemIndex, 'down')}
                                    disabled={itemIndex === (unit.items || []).length - 1}
                                  >
                                    <MoveDown className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteItem(unitIndex, itemIndex)}
                                  >
                                    <FaTrash className="h-3 w-3 text-red-500" />
                                  </Button>
                                </div>
                              )}
                            </div>
                            
                            {/* Questions List */}
                            <div className="ml-6 space-y-2">
                              {item.questions && item.questions.length > 0 ? (
                                <Accordion type="single" collapsible className="w-full">
                                  <AccordionItem value={`questions-${unitIndex}-${itemIndex}`}>
                                    <AccordionTrigger className="text-sm font-medium text-gray-600 py-2">
                                      <div className="flex items-center justify-between w-full pr-4">
                                        <span>Questions ({item.questions.length})</span>
                                        <span className="text-xs text-gray-500">
                                          Total: {item.questions.reduce((sum, q) => sum + (q.points || 0), 0)} pts
                                        </span>
                                      </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <div className="space-y-2 pt-2">
                                        {isEditing && (
                                          <div className="flex justify-end">
                                            <div className="flex gap-1">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => startAddingQuestion(unitIndex, itemIndex)}
                                              >
                                                <FaPlus className="mr-1 h-3 w-3" />
                                                Add Question
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => startImportQuestions(unitIndex, itemIndex)}
                                                title="Import questions from JSON"
                                              >
                                                <FaFileImport className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          </div>
                                        )}
                                        
                                        {/* Add Question Form */}
                                        {addingQuestion === `${unitIndex}-${itemIndex}` && (
                                          <div className="mb-3">
                                            <QuestionForm
                                              courseId={courseId}
                                              itemNumber={item.order}
                                              existingQuestions={item.questions || []}
                                              onSave={(questionData) => saveNewQuestion(unitIndex, itemIndex, questionData)}
                                              onCancel={cancelAddingQuestion}
                                            />
                                          </div>
                                        )}
                                        <div className="space-y-1">
                                          {item.questions.map((question, qIndex) => (
                                            <div key={question.questionId || qIndex} className="border rounded p-2">
                                              {editingQuestion === `${unitIndex}-${itemIndex}-${qIndex}` ? (
                                                // Edit Mode for Question
                                                <QuestionForm
                                                  courseId={courseId}
                                                  itemNumber={item.order}
                                                  existingQuestions={item.questions || []}
                                                  question={question}
                                                  onSave={(questionData) => saveQuestionChanges(unitIndex, itemIndex, qIndex, questionData)}
                                                  onCancel={cancelQuestionEditing}
                                                  isEditing={true}
                                                />
                                              ) : (
                                                // Display Mode for Question
                                                <div className="flex items-center gap-2 text-sm">
                                                  <span className="text-gray-400">•</span>
                                                  <span className="flex-1">{question.title}</span>
                                                  <span className="text-xs text-gray-500">({question.points} pt{question.points !== 1 ? 's' : ''})</span>
                                                  {isEditing && (
                                                    <div className="flex items-center gap-1">
                                                      <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => startEditingQuestion(unitIndex, itemIndex, qIndex)}
                                                      >
                                                        <FaEdit className="h-3 w-3" />
                                                      </Button>
                                                      <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => deleteQuestion(unitIndex, itemIndex, qIndex)}
                                                      >
                                                        <FaTrash className="h-3 w-3 text-red-500" />
                                                      </Button>
                                                    </div>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                              ) : (
                                /* Add Question button and form when no questions exist */
                                <div>
                                  {isEditing && !addingQuestion && (
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => startAddingQuestion(unitIndex, itemIndex)}
                                        className="flex-1"
                                      >
                                        <FaPlus className="mr-2 h-3 w-3" />
                                        Add Question
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => startImportQuestions(unitIndex, itemIndex)}
                                        title="Import questions from JSON"
                                      >
                                        <FaFileImport className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                  
                                  {/* Add Question Form when no questions exist */}
                                  {addingQuestion === `${unitIndex}-${itemIndex}` && (
                                    <div className="mt-3">
                                      <QuestionForm
                                        courseId={courseId}
                                        itemNumber={item.order}
                                        existingQuestions={[]}
                                        onSave={(questionData) => saveNewQuestion(unitIndex, itemIndex, questionData)}
                                        onCancel={cancelAddingQuestion}
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add Item Form */}
                    {addingItem === unitIndex && isEditing && (
                      <div className="p-4 bg-gray-50 rounded-lg space-y-3 mb-3">
                        <h5 className="font-medium">Add New Item</h5>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Item ID</label>
                          <Input
                            value={addItemForm.itemId || ''}
                            onChange={(e) => {
                              const newItemId = e.target.value;
                              
                              setAddItemForm(prev => ({
                                ...prev,
                                itemId: newItemId,
                                // Auto-populate title if it's empty
                                title: prev.title || extractTitleFromItemId(newItemId)
                              }));
                            }}
                            placeholder="Enter any itemId format you want"
                          />
                          <p className="text-xs text-gray-500 mt-1">Any format allowed - title will auto-generate</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <Input
                              value={addItemForm.title || ''}
                              onChange={(e) => setAddItemForm(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="Auto-populated from Item ID"
                            />
                            <p className="text-xs text-gray-500 mt-1">Will auto-fill from Item ID</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Type</label>
                            <Select
                              value={addItemForm.type || 'lesson'}
                              onValueChange={(value) => setAddItemForm(prev => ({ ...prev, type: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="lesson">Lesson</SelectItem>
                                <SelectItem value="assignment">Assignment</SelectItem>
                                <SelectItem value="lab">Lab</SelectItem>
                                <SelectItem value="exam">Exam</SelectItem>
                                <SelectItem value="quiz">Quiz</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Description</label>
                          <Input
                            value={addItemForm.description || ''}
                            onChange={(e) => setAddItemForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Brief description of the item"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Estimated Time (minutes)</label>
                          <Input
                            type="number"
                            value={addItemForm.estimatedTime || ''}
                            onChange={(e) => setAddItemForm(prev => ({ ...prev, estimatedTime: e.target.value }))}
                            placeholder="30"
                            className="w-32"
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={cancelAddingItem}
                          >
                            <FaTimes className="mr-1 h-3 w-3" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => saveNewItem(unitIndex)}
                            disabled={!addItemForm.itemId}
                          >
                            <FaSave className="mr-1 h-3 w-3" />
                            Add Item
                          </Button>
                        </div>
                      </div>
                    )}

                    {isEditing && addingItem !== unitIndex && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startAddingItem(unitIndex)}
                        className="w-full"
                      >
                        <FaPlus className="mr-2 h-4 w-4" />
                        Add Item to {unit.name}
                      </Button>
                    )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            );
          })}
        </div>
      )}

      {/* Question Import Modal */}
      {importModalOpen && importTarget && (
        <QuestionImportModal
          isOpen={importModalOpen}
          onClose={closeImportModal}
          onImport={handleBulkImport}
          courseId={courseId}
          itemNumber={units[importTarget.unitIndex]?.items[importTarget.itemIndex]?.order || 1}
          existingQuestions={units[importTarget.unitIndex]?.items[importTarget.itemIndex]?.questions || []}
        />
      )}

      {/* Configuration Import Choice Modal */}
      {importConfigModal && importPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Import Configuration Detected</h2>
            
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                The selected file contains a full course configuration:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                {importPreview.title && (
                  <li>• Course Title: <span className="font-medium">{importPreview.title}</span></li>
                )}
                {importPreview.unitCount > 0 && (
                  <li>• Course Structure: <span className="font-medium">{importPreview.unitCount} units</span></li>
                )}
                {importPreview.hasWeights && <li>• Grade Weights Configuration</li>}
                {importPreview.hasAttemptLimits && <li>• Attempt Limits Settings</li>}
                {importPreview.hasProgressionRequirements && <li>• Progression Requirements</li>}
                {importPreview.hasAIFeatures && <li>• AI Features Settings</li>}
                {importPreview.hasMetadata && <li>• Course Metadata</li>}
              </ul>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-700 font-medium mb-2">
                How would you like to import this file?
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleImportChoice('structure-only')}
                className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-900">Import Course Structure Only</div>
                <div className="text-sm text-gray-600 mt-1">
                  Import just the units, lessons, and questions. Other settings will remain unchanged.
                </div>
              </button>

              <button
                onClick={() => handleImportChoice('full-config')}
                className="w-full p-3 text-left border rounded-lg hover:bg-blue-50 transition-colors border-blue-300"
              >
                <div className="font-medium text-blue-900">Import Full Configuration</div>
                <div className="text-sm text-blue-700 mt-1">
                  Import everything including structure, weights, limits, and all course settings.
                </div>
                <div className="text-xs text-orange-600 mt-2">
                  ⚠️ This will override all existing course settings
                </div>
              </button>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setImportConfigModal(false);
                  setPendingImportData(null);
                  setImportPreview(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseStructureBuilder;