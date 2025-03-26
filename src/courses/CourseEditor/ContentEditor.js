import React, { useMemo, useState } from 'react';
import { 
  Book, 
  GraduationCap, 
  FileText, 
  Info,
  Edit,
  BookOpen,
  ChevronDown
} from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../components/ui/accordion';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import QuillEditor from './QuillEditor';

const typeColors = {
  lesson: 'bg-blue-50 text-blue-700 border-blue-200',
  assignment: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  exam: 'bg-purple-50 text-purple-700 border-purple-200',
  info: 'bg-gray-50 text-gray-700 border-gray-200'
};

const sectionColors = {
  '1': 'bg-blue-50 border-blue-200',
  '2': 'bg-emerald-50 border-emerald-200',
  '3': 'bg-purple-50 border-purple-200',
  'other': 'bg-gray-50 border-gray-200'
};

const typeIcons = {
  lesson: Book,
  assignment: FileText,
  exam: GraduationCap,
  info: Info
};

const ContentEditor = ({ 
  courseData, 
  contentData, 
  onUpdate, 
  courseId
}) => {
  const [editingContent, setEditingContent] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const units = courseData?.units || [];

  // Group units by section
  const sectionedUnits = useMemo(() => {
    return units.reduce((acc, unit) => {
      const section = unit.section || 'other';
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(unit);
      return acc;
    }, {});
  }, [units]);
  
  // If there are no sectioned units (all are 'other'), show them as general units
  const hasOnlyOtherSection = useMemo(() => {
    return Object.keys(sectionedUnits).length === 0 || 
           (Object.keys(sectionedUnits).length === 1 && sectionedUnits['other']);
  }, [sectionedUnits]);

  const getDraftContent = (unit, item) => {
    const unitId = `unit_${unit.sequence}`;
    const itemId = `item_${item.sequence}`;
    
    return contentData?.units?.[unitId]?.items?.[itemId]?.content || '';
  };
  
  const getContentPath = (unit, item) => {
    const unitIndex = unit.sequence - 1;
    const itemIndex = item.sequence - 1;
    
    if (courseData?.units?.[unitIndex]?.items?.[itemIndex]?.contentPath) {
      return courseData.units[unitIndex].items[itemIndex].contentPath;
    }
    
    return null;
  };
  
  const handleEditContent = (unit, item) => {
    const content = getDraftContent(unit, item);
    const contentPath = getContentPath(unit, item);
    
    console.log(`Editing content for unit ${unit.sequence}, item ${item.sequence}`);
    
    setEditingContent({
      unit,
      item,
      content,
      contentPath
    });
    
    setIsEditorOpen(true);
  };

  const handleSaveContent = async (html) => {
    if (!editingContent) return;

    const { unit, item } = editingContent;
    const unitId = `unit_${unit.sequence}`;
    const itemId = `item_${item.sequence}`;

    try {
      console.log(`Saving content for ${unitId}/${itemId}`);
      
      // Update local state
      onUpdate(unitId, itemId, { content: html });
      
      // Close editor
      setIsEditorOpen(false);
      setEditingContent(null);
    } catch (error) {
      console.error('Error saving content:', error);
    }
  };

  const renderUnits = (units, section = null) => (
    <Accordion type="single" collapsible className="space-y-3">
      {units.map((unit) => (
        <AccordionItem
          key={unit.sequence}
          value={`unit-${unit.sequence}`}
          className={`border-2 rounded-lg overflow-hidden ${section ? sectionColors[section] : 'border-gray-200'}`}
        >
          <AccordionTrigger className="px-4 py-3 hover:bg-white/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-semibold text-gray-700 shadow-sm">
                {unit.sequence}
              </div>
              <div>
                <h3 className="font-semibold text-left">
                  {unit.name}
                </h3>
                <p className="text-sm text-gray-600 text-left">
                  {unit.items?.length || 0} items
                </p>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent>
            <div className="p-4 space-y-4 bg-white rounded-b-lg">
              {/* Unit Description */}
              <Card className="p-4 bg-gray-50/50 border">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium mb-1">Unit Description</h4>
                    <p className="text-sm text-gray-600">
                      {contentData?.units?.[`unit_${unit.sequence}`]?.overview?.description || 
                       'No description added yet'}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Items List */}
              <div className="space-y-4">
                {unit.items?.map((item) => {
                  const ItemIcon = typeIcons[item.type] || Info;
                  const content = getDraftContent(unit, item);
                  
                  return (
                    <div
                      key={item.sequence}
                      className="rounded-lg border hover:border-gray-300 transition-colors overflow-hidden"
                    >
                      <div className="flex items-start p-3 border-b bg-white">
                        <div className={`p-2 rounded mr-3 ${typeColors[item.type] || typeColors.info}`}>
                          <ItemIcon className="w-4 h-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-medium truncate">
                                {item.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary">
                                  {item.type || 'unknown'}
                                </Badge>
                                {item.multiplier > 1 && (
                                  <Badge variant="outline">
                                    {item.multiplier}x multiplier
                                  </Badge>
                                )}
                              </div>
                              <div className="mt-2 text-sm">
                                {content ? (
                                  <span className="text-green-600">
                                    Content added
                                  </span>
                                ) : (
                                  <span className="text-gray-400">
                                    No content yet
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditContent(unit, item)}
                              className="mt-1"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Content
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Content Preview Accordion */}
                      {content && (
                        <Accordion type="single" collapsible>
                          <AccordionItem value="content-preview" className="border-0">
                            <AccordionTrigger className="py-2 px-4 border-t bg-gray-50 hover:bg-gray-100 font-medium text-sm">
                              <div className="flex items-center text-gray-600">
                                <span>Preview Content</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-4 bg-white">
                              <div className="prose prose-sm lg:prose-base max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: content }} />
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="space-y-8 pr-4">
          {hasOnlyOtherSection ? (
            // Render all units without section headers if there are no proper sections
            <div className="space-y-4">
              {renderUnits(units)}
            </div>
          ) : (
            // Render units by section
            Object.entries(sectionedUnits)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([section, sectionUnits]) => (
                <div key={section} className="space-y-4">
                  {/* Section Header (except for 'other' which will be shown last) */}
                  {section !== 'other' && (
                    <>
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                        <BookOpen className="w-5 h-5 text-gray-700" />
                        <h2 className="font-semibold text-gray-900">
                          Section {section}
                        </h2>
                      </div>
                      {renderUnits(sectionUnits, section)}
                    </>
                  )}
                </div>
              ))
          )}
          
          {/* Render 'other' section at the end if it exists and we have sections */}
          {!hasOnlyOtherSection && sectionedUnits['other'] && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-gray-700" />
                <h2 className="font-semibold text-gray-900">
                  Other Units
                </h2>
              </div>
              {renderUnits(sectionedUnits['other'], 'other')}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Content Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-[95vw] w-full h-[95vh] flex flex-col p-6 overflow-visible">
          <DialogHeader>
            <DialogTitle>
              {editingContent && (
                <>
                  Editing: {editingContent.item.title}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 mt-4 overflow-visible">
            {editingContent && (
              <QuillEditor
                courseId={courseId}
                unitId={editingContent.unit.sequence}
                itemId={editingContent.item.sequence}
                initialContent={editingContent.content}
                contentPath={editingContent.contentPath}
                onSave={handleSaveContent}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentEditor;