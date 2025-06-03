import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Trash2, Plus, GripVertical, Edit3, Check, X, HelpCircle, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';

// Section types
const SECTION_TYPES = {
  CONTENT: 'content',
  ASSESSMENT: 'assessment'
};

// Assessment types
const ASSESSMENT_TYPES = {
  AI_MULTIPLE_CHOICE: 'ai-multiple-choice',
  AI_LONG_ANSWER: 'ai-long-answer'
};

// Convert title to valid React component name
const toComponentName = (title) => {
  return title
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('') + 'Section';
};

// Generate assessment ID from title
const toAssessmentId = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '_');
};

// Generate assessment component code
const generateAssessmentCode = (title, assessmentType, assessmentId, lessonPath) => {
  const componentName = `${toComponentName(title)}Assessment`;
  
  if (assessmentType === ASSESSMENT_TYPES.AI_MULTIPLE_CHOICE) {
    return `// ${title} Assessment Section
const ${componentName} = ({ course, courseId, isStaffView, devMode }) => {
  return (
    <div className="assessment-section mb-6">
      <AIMultipleChoiceQuestion
        courseId={courseId}
        assessmentId="${assessmentId}"
        cloudFunctionName="generateDatabaseAssessment"
        lessonPath="${lessonPath || 'unknown'}"
        title="${title}"
        theme="purple"
        // Additional props will be loaded from database configuration
      />
    </div>
  );
};

export default ${componentName};`;
  } else if (assessmentType === ASSESSMENT_TYPES.AI_LONG_ANSWER) {
    return `// ${title} Assessment Section
const ${componentName} = ({ course, courseId, isStaffView, devMode }) => {
  return (
    <div className="assessment-section mb-6">
      <AILongAnswerQuestion
        courseId={courseId}
        assessmentId="${assessmentId}"
        cloudFunctionName="generateDatabaseAssessment"
        lessonPath="${lessonPath || 'unknown'}"
        title="${title}"
        theme="blue"
        // Additional props will be loaded from database configuration
      />
    </div>
  );
};

export default ${componentName};`;
  }
  
  return `// Unknown assessment type: ${assessmentType}`;
};

// Get default configuration for assessment type
const getDefaultAssessmentConfig = (assessmentType) => {
  if (assessmentType === ASSESSMENT_TYPES.AI_MULTIPLE_CHOICE) {
    return {
      type: 'ai-multiple-choice',
      prompts: {
        beginner: 'Create a basic multiple choice question about this topic...',
        intermediate: 'Create an intermediate multiple choice question about this topic...',
        advanced: 'Create an advanced multiple choice question about this topic...'
      },
      activityType: 'lesson',
      maxAttempts: 999,
      pointsValue: 5,
      theme: 'purple',
      enableAIChat: true,
      katexFormatting: false,
      showFeedback: true,
      enableHints: true,
      allowDifficultySelection: false,
      defaultDifficulty: 'intermediate',
      fallbackQuestions: []
    };
  } else if (assessmentType === ASSESSMENT_TYPES.AI_LONG_ANSWER) {
    return {
      type: 'ai-long-answer',
      prompts: {
        beginner: 'Create a basic long answer question about this topic...',
        intermediate: 'Create an intermediate long answer question about this topic...',
        advanced: 'Create an advanced long answer question about this topic...'
      },
      activityType: 'assignment',
      maxAttempts: 3,
      totalPoints: 10,
      rubricCriteria: 3,
      wordLimits: { min: 100, max: 500 },
      theme: 'blue',
      enableAIChat: true,
      katexFormatting: true,
      showRubric: true,
      showWordCount: true,
      allowDifficultySelection: false,
      defaultDifficulty: 'intermediate',
      rubrics: {
        beginner: [
          { criterion: 'Understanding', points: 4, description: 'Demonstrates basic understanding of key concepts' },
          { criterion: 'Application', points: 3, description: 'Applies concepts correctly' },
          { criterion: 'Communication', points: 3, description: 'Communicates ideas clearly' }
        ],
        intermediate: [
          { criterion: 'Understanding', points: 4, description: 'Demonstrates solid understanding of key concepts' },
          { criterion: 'Analysis', points: 3, description: 'Analyzes information effectively' },
          { criterion: 'Application', points: 3, description: 'Applies concepts to new situations' }
        ],
        advanced: [
          { criterion: 'Understanding', points: 3, description: 'Demonstrates deep understanding of complex concepts' },
          { criterion: 'Analysis', points: 4, description: 'Provides thorough analysis and evaluation' },
          { criterion: 'Synthesis', points: 3, description: 'Synthesizes information from multiple sources' }
        ]
      },
      fallbackQuestions: []
    };
  }
  
  return {};
};

const SectionManager = ({ 
  sections = [], 
  sectionOrder = [], 
  selectedSectionId, 
  onSectionSelect, 
  onSectionCreate, 
  onSectionUpdate, 
  onSectionDelete, 
  onSectionReorder,
  lessonPath = null  // Add lessonPath prop
}) => {
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [sectionType, setSectionType] = useState(SECTION_TYPES.CONTENT);
  const [assessmentType, setAssessmentType] = useState(ASSESSMENT_TYPES.AI_MULTIPLE_CHOICE);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [validationError, setValidationError] = useState('');

  // Get ordered sections
  const orderedSections = sectionOrder.map(id => sections.find(s => s.id === id)).filter(Boolean);

  // Validate section name for duplicates
  const validateSectionName = (title, excludeId = null) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return 'Section title is required';
    }
    
    const normalizedTitle = trimmedTitle.toLowerCase();
    const duplicate = sections.find(s => 
      s.id !== excludeId && s.title.trim().toLowerCase() === normalizedTitle
    );
    
    if (duplicate) {
      return `A section named "${duplicate.title}" already exists`;
    }
    
    return '';
  };

  const handleCreateSection = () => {
    if (!newSectionTitle.trim()) return;
    
    // Validate for duplicates
    const error = validateSectionName(newSectionTitle);
    if (error) {
      setValidationError(error);
      return;
    }
    
    console.log('🔧 Creating section with:', { 
      title: newSectionTitle.trim(), 
      sectionType, 
      assessmentType 
    });
    
    let newSection;
    
    if (sectionType === SECTION_TYPES.CONTENT) {
      // Create content section (original behavior)
      newSection = {
        id: `section_${Date.now()}`,
        title: newSectionTitle.trim(),
        type: SECTION_TYPES.CONTENT,
        originalCode: `// ${newSectionTitle} Section\nconst ${toComponentName(newSectionTitle)} = ({ course, courseId, isStaffView, devMode }) => {\n  return (\n    <div className="section-container mb-6">\n      <Card className="mb-6">\n        <CardHeader>\n          <CardTitle>${newSectionTitle}</CardTitle>\n        </CardHeader>\n        <CardContent>\n          <p>Add your content here...</p>\n        </CardContent>\n      </Card>\n    </div>\n  );\n};\n\nexport default ${toComponentName(newSectionTitle)};`,
        code: '',
        order: orderedSections.length,
        createdAt: new Date().toISOString()
      };
    } else if (sectionType === SECTION_TYPES.ASSESSMENT) {
      // Create assessment section
      const assessmentId = toAssessmentId(newSectionTitle.trim());
      
      newSection = {
        id: `assessment_${Date.now()}`,
        title: newSectionTitle.trim(),
        type: SECTION_TYPES.ASSESSMENT,
        assessmentType: assessmentType,
        assessmentId: assessmentId,
        originalCode: generateAssessmentCode(newSectionTitle.trim(), assessmentType, assessmentId, lessonPath),
        code: '',
        order: orderedSections.length,
        createdAt: new Date().toISOString(),
        // Store default configuration
        assessmentConfig: getDefaultAssessmentConfig(assessmentType)
      };
    }
    
    onSectionCreate(newSection);
    setNewSectionTitle('');
    setSectionType(SECTION_TYPES.CONTENT); // Reset to default
    setAssessmentType(ASSESSMENT_TYPES.AI_MULTIPLE_CHOICE); // Reset to default
    setValidationError(''); // Clear any validation errors
  };

  const handleEditSection = (section) => {
    setEditingSectionId(section.id);
    setEditingTitle(section.title);
  };

  const handleSaveEdit = () => {
    if (!editingTitle.trim()) return;
    
    // Validate for duplicates (exclude current section being edited)
    const error = validateSectionName(editingTitle, editingSectionId);
    if (error) {
      setValidationError(error);
      return;
    }
    
    onSectionUpdate(editingSectionId, { title: editingTitle.trim() });
    setEditingSectionId(null);
    setEditingTitle('');
    setValidationError(''); // Clear any validation errors
  };

  const handleCancelEdit = () => {
    setEditingSectionId(null);
    setEditingTitle('');
    setValidationError(''); // Clear any validation errors
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    
    const newOrder = [...sectionOrder];
    const draggedId = newOrder[draggedIndex];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, draggedId);
    
    onSectionReorder(newOrder);
    setDraggedIndex(null);
  };


  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold mb-4">Lesson Sections</h3>
        
        {/* Add new section */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Section Type</label>
            <Select value={sectionType} onValueChange={setSectionType}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SECTION_TYPES.CONTENT}>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Content Section
                  </div>
                </SelectItem>
                <SelectItem value={SECTION_TYPES.ASSESSMENT}>
                  <div className="flex items-center">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Assessment Section
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {sectionType === SECTION_TYPES.ASSESSMENT && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Assessment Type</label>
              <Select value={assessmentType} onValueChange={setAssessmentType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ASSESSMENT_TYPES.AI_MULTIPLE_CHOICE}>
                    AI Multiple Choice
                  </SelectItem>
                  <SelectItem value={ASSESSMENT_TYPES.AI_LONG_ANSWER}>
                    AI Long Answer
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <Input
            placeholder={sectionType === SECTION_TYPES.CONTENT ? "Section title..." : "Assessment title..."}
            value={newSectionTitle}
            onChange={(e) => {
              setNewSectionTitle(e.target.value);
              setValidationError(''); // Clear error as user types
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateSection()}
            className={validationError ? 'border-red-500' : ''}
          />
          {validationError && (
            <p className="text-xs text-red-500 mt-1">{validationError}</p>
          )}
          <Button 
            onClick={handleCreateSection}
            disabled={!newSectionTitle.trim()}
            size="sm"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add {sectionType === SECTION_TYPES.CONTENT ? 'Section' : 'Assessment'}
          </Button>
        </div>
      </div>

      {/* Sections list */}
      <div className="flex-1 overflow-y-auto p-4">
        {orderedSections.length === 0 ? (
          <Alert>
            <AlertDescription>
              No sections yet. Create your first section to get started.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-2">
            {orderedSections.map((section, index) => (
              <Card
                key={section.id}
                className={`cursor-pointer transition-colors ${
                  selectedSectionId === section.id 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <GripVertical className="h-4 w-4 text-gray-400 mr-2 cursor-grab" />
                      
                      {editingSectionId === section.id ? (
                        <div className="flex items-center flex-1 space-x-2">
                          <div className="flex-1">
                            <Input
                              value={editingTitle}
                              onChange={(e) => {
                                setEditingTitle(e.target.value);
                                setValidationError(''); // Clear error as user types
                              }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') handleSaveEdit();
                                if (e.key === 'Escape') handleCancelEdit();
                              }}
                              className={`text-sm ${validationError ? 'border-red-500' : ''}`}
                              autoFocus
                            />
                            {validationError && (
                              <p className="text-xs text-red-500 mt-1 absolute">{validationError}</p>
                            )}
                          </div>
                          <Button size="sm" variant="ghost" onClick={handleSaveEdit}>
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => onSectionSelect(section.id)}
                        >
                          <div className="font-medium text-sm flex items-center">
                            {section.type === SECTION_TYPES.ASSESSMENT ? (
                              <HelpCircle className="h-3 w-3 mr-1 text-blue-500" />
                            ) : (
                              <FileText className="h-3 w-3 mr-1 text-gray-500" />
                            )}
                            {section.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {section.type === SECTION_TYPES.ASSESSMENT ? (
                              <span>Assessment: {section.assessmentType}</span>
                            ) : (
                              <span>Component: {toComponentName(section.title)}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {editingSectionId !== section.id && (
                      <div className="flex items-center space-x-1">
                        <Badge variant="secondary" className="text-xs">
                          {index + 1}
                        </Badge>
                        {section.type === SECTION_TYPES.ASSESSMENT && (
                          <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                            {section.assessmentType === ASSESSMENT_TYPES.AI_MULTIPLE_CHOICE ? 'MC' : 'LA'}
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSection(section);
                          }}
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete "${section.title}" section?`)) {
                              onSectionDelete(section.id);
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Section info */}
      {orderedSections.length > 0 && (
        <div className="p-4 border-t bg-gray-50">
          <div className="text-xs text-gray-600">
            {orderedSections.length} section{orderedSections.length !== 1 ? 's' : ''}
            {selectedSectionId && (
              <span className="ml-2">
                • Editing: {orderedSections.find(s => s.id === selectedSectionId)?.title}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionManager;