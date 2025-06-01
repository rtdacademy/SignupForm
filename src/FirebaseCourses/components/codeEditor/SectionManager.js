import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Trash2, Plus, GripVertical, Edit3, Check, X } from 'lucide-react';

// Convert title to valid React component name
const toComponentName = (title) => {
  return title
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('') + 'Section';
};

const SectionManager = ({ 
  sections = [], 
  sectionOrder = [], 
  selectedSectionId, 
  onSectionSelect, 
  onSectionCreate, 
  onSectionUpdate, 
  onSectionDelete, 
  onSectionReorder 
}) => {
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Get ordered sections
  const orderedSections = sectionOrder.map(id => sections.find(s => s.id === id)).filter(Boolean);

  const handleCreateSection = () => {
    if (!newSectionTitle.trim()) return;
    
    const newSection = {
      id: `section_${Date.now()}`,
      title: newSectionTitle.trim(),
      originalCode: `// ${newSectionTitle} Section\nconst ${toComponentName(newSectionTitle)} = ({ course, courseId, isStaffView, devMode }) => {\n  return (\n    <div className="section-container mb-6">\n      <Card className="mb-6">\n        <CardHeader>\n          <CardTitle>${newSectionTitle}</CardTitle>\n        </CardHeader>\n        <CardContent>\n          <p>Add your content here...</p>\n        </CardContent>\n      </Card>\n    </div>\n  );\n};\n\nexport default ${toComponentName(newSectionTitle)};`,
      code: '',
      order: orderedSections.length,
      createdAt: new Date().toISOString()
    };
    
    onSectionCreate(newSection);
    setNewSectionTitle('');
  };

  const handleEditSection = (section) => {
    setEditingSectionId(section.id);
    setEditingTitle(section.title);
  };

  const handleSaveEdit = () => {
    if (!editingTitle.trim()) return;
    
    onSectionUpdate(editingSectionId, { title: editingTitle.trim() });
    setEditingSectionId(null);
    setEditingTitle('');
  };

  const handleCancelEdit = () => {
    setEditingSectionId(null);
    setEditingTitle('');
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
        <div className="space-y-2">
          <Input
            placeholder="Section title..."
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateSection()}
          />
          <Button 
            onClick={handleCreateSection}
            disabled={!newSectionTitle.trim()}
            size="sm"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Section
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
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') handleSaveEdit();
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                            className="text-sm"
                            autoFocus
                          />
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
                          <div className="font-medium text-sm">{section.title}</div>
                          <div className="text-xs text-gray-500">
                            Component: {toComponentName(section.title)}
                          </div>
                        </div>
                      )}
                    </div>

                    {editingSectionId !== section.id && (
                      <div className="flex items-center space-x-1">
                        <Badge variant="secondary" className="text-xs">
                          {index + 1}
                        </Badge>
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