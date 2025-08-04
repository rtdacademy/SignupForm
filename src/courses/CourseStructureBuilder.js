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
  FaUpload
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
  generateQuestionId
} from '../utils/firebaseCourseConfigUtils';

const CourseStructureBuilder = ({ courseId, structure, onUpdate, isEditing }) => {
  const [editingUnit, setEditingUnit] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [unitEditForm, setUnitEditForm] = useState({});
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionEditForm, setQuestionEditForm] = useState({});

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
  const addItem = (unitIndex) => {
    const currentUnit = units[unitIndex];
    const itemNumber = (currentUnit.items?.length || 0) + 1;
    const itemTitle = 'New Item';
    
    const newItem = {
      itemId: generateItemId(itemNumber, itemTitle),
      type: 'lesson',
      title: itemTitle,
      estimatedTime: 30,
      order: itemNumber,
      questions: []
    };

    const updatedUnits = [...units];
    updatedUnits[unitIndex].items = [...(updatedUnits[unitIndex].items || []), newItem];
    
    onUpdate({
      ...structure,
      units: updatedUnits
    });
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
      title: item.title,
      type: item.type,
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
    
    // If title is being updated, regenerate the itemId to match
    if (updates.title && updates.title !== currentItem.title) {
      updates.itemId = generateItemId(currentItem.order, updates.title);
    }
    
    updatedUnits[unitIndex].items[itemIndex] = { 
      ...currentItem, 
      ...updates 
    };
    
    onUpdate({
      ...structure,
      units: updatedUnits
    });

    // Reset editing state
    setEditingItem(null);
    setEditForm({});
  };

  // Question management
  const addQuestion = (unitIndex, itemIndex) => {
    const updatedUnits = [...units];
    const item = updatedUnits[unitIndex].items[itemIndex];
    const questionNumber = (item.questions?.length || 0) + 1;
    
    const newQuestion = {
      questionId: generateQuestionId(courseId, item.order, questionNumber),
      title: `Question ${questionNumber}`,
      points: 1
    };
    
    updatedUnits[unitIndex].items[itemIndex] = {
      ...item,
      questions: [...(item.questions || []), newQuestion]
    };
    
    onUpdate({
      ...structure,
      units: updatedUnits
    });
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
    const question = units[unitIndex].items[itemIndex].questions[questionIndex];
    setEditingQuestion(`${unitIndex}-${itemIndex}-${questionIndex}`);
    setQuestionEditForm({
      title: question.title,
      points: question.points
    });
  };

  const cancelQuestionEditing = () => {
    setEditingQuestion(null);
    setQuestionEditForm({});
  };

  const saveQuestionChanges = (unitIndex, itemIndex, questionIndex) => {
    const updatedUnits = [...units];
    const questions = [...updatedUnits[unitIndex].items[itemIndex].questions];
    
    questions[questionIndex] = {
      ...questions[questionIndex],
      ...questionEditForm
    };
    
    updatedUnits[unitIndex].items[itemIndex] = {
      ...updatedUnits[unitIndex].items[itemIndex],
      questions
    };
    
    onUpdate({
      ...structure,
      units: updatedUnits
    });
    
    // Reset editing state
    setEditingQuestion(null);
    setQuestionEditForm({});
  };

  // Import structure from JSON file
  const handleImportStructure = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        // Validate the imported structure
        if (!importedData.units || !Array.isArray(importedData.units)) {
          toast.error('Invalid structure: missing units array');
          return;
        }

        // Detailed validation
        const validationErrors = [];
        
        // Check each unit
        importedData.units.forEach((unit, unitIndex) => {
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
            if (!item.type || !['lesson', 'assignment', 'lab', 'exam'].includes(item.type)) {
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
        onUpdate(importedData);
        toast.success('Structure imported successfully!');
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
        <h4 className="text-lg font-semibold">Course Structure</h4>
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
                            ({(unit.items || []).length} items)
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
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <Input
                                  value={editForm.title || ''}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                  placeholder="Item title"
                                />
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
                                  </SelectContent>
                                </Select>
                              </div>
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
                                <span className="font-medium">{item.title}</span>
                                <span className="text-sm text-gray-500">
                                  ({item.estimatedTime || 0} min)
                                </span>
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
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => addQuestion(unitIndex, itemIndex)}
                                            >
                                              <FaPlus className="mr-1 h-3 w-3" />
                                              Add Question
                                            </Button>
                                          </div>
                                        )}
                                        <div className="space-y-1">
                                          {item.questions.map((question, qIndex) => (
                                            <div key={question.questionId || qIndex} className="border rounded p-2">
                                              {editingQuestion === `${unitIndex}-${itemIndex}-${qIndex}` ? (
                                                // Edit Mode for Question
                                                <div className="space-y-2">
                                                  <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                      <label className="block text-xs font-medium mb-1">Question Title</label>
                                                      <Input
                                                        value={questionEditForm.title || ''}
                                                        onChange={(e) => setQuestionEditForm(prev => ({ ...prev, title: e.target.value }))}
                                                        placeholder="Question title"
                                                        className="text-sm"
                                                      />
                                                    </div>
                                                    <div>
                                                      <label className="block text-xs font-medium mb-1">Points</label>
                                                      <Input
                                                        type="number"
                                                        value={questionEditForm.points || ''}
                                                        onChange={(e) => setQuestionEditForm(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                                                        placeholder="1"
                                                        className="text-sm"
                                                        min="0"
                                                      />
                                                    </div>
                                                  </div>
                                                  <div className="flex justify-end gap-2">
                                                    <Button
                                                      variant="outline"
                                                      size="sm"
                                                      onClick={cancelQuestionEditing}
                                                    >
                                                      <FaTimes className="mr-1 h-3 w-3" />
                                                      Cancel
                                                    </Button>
                                                    <Button
                                                      size="sm"
                                                      onClick={() => saveQuestionChanges(unitIndex, itemIndex, qIndex)}
                                                    >
                                                      <FaSave className="mr-1 h-3 w-3" />
                                                      Save
                                                    </Button>
                                                  </div>
                                                </div>
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
                                /* Add Question button when no questions exist */
                                isEditing && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addQuestion(unitIndex, itemIndex)}
                                    className="w-full"
                                  >
                                    <FaPlus className="mr-2 h-3 w-3" />
                                    Add Question
                                  </Button>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addItem(unitIndex)}
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
    </div>
  );
};

export default CourseStructureBuilder;