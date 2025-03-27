import React, { useMemo, useState } from 'react';
import { 
  Book, 
  GraduationCap, 
  FileText, 
  Info,
  Edit,
  BookOpen,
  ChevronDown,
  PenLine
} from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../components/ui/accordion';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import QuillEditor from './QuillEditor';
import { sanitizeHtml } from '../../utils/htmlSanitizer';

// Enhanced colors with more vibrant gradients 
const typeColors = {
  lesson: 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border-blue-300',
  assignment: 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border-emerald-300',
  exam: 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 border-purple-300',
  info: 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border-gray-300'
};

// Enhanced section backgrounds with gradients
const sectionColors = {
  '1': 'bg-gradient-to-br from-blue-100 to-blue-50 border-blue-300 shadow-sm',
  '2': 'bg-gradient-to-br from-emerald-100 to-emerald-50 border-emerald-300 shadow-sm',
  '3': 'bg-gradient-to-br from-purple-100 to-purple-50 border-purple-300 shadow-sm',
  'other': 'bg-gradient-to-br from-gray-100 to-gray-50 border-gray-300 shadow-sm'
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
    <Accordion type="single" collapsible className="space-y-4">
      {units.map((unit) => (
        <AccordionItem
          key={unit.sequence}
          value={`unit-${unit.sequence}`}
          className={`border-2 rounded-lg overflow-hidden ${section ? sectionColors[section] : 'border-gray-300 shadow-sm'}`}
        >
          <AccordionTrigger className="px-4 py-3 hover:bg-white/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white to-blue-50 flex items-center justify-center font-semibold text-blue-700 shadow-md border border-blue-200">
                {unit.sequence}
              </div>
              <div>
                <h3 className="font-bold text-left text-blue-900">
                  {unit.name}
                </h3>
                <p className="text-sm text-blue-700 text-left">
                  {unit.items?.length || 0} items
                </p>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent>
            <div className="p-4 space-y-4 bg-white rounded-b-lg">
              {/* Unit Description */}
              <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium mb-1 text-blue-800">Unit Description</h4>
                    <p className="text-sm text-blue-700">
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
                      className="rounded-lg border border-gray-300 hover:border-blue-400 hover:shadow-md transition-all overflow-hidden"
                    >
                      <div className="flex items-start p-4 border-b bg-gradient-to-r from-white to-blue-50">
                        <div className={`p-2 rounded-lg mr-3 shadow-sm ${typeColors[item.type] || typeColors.info}`}>
                          <ItemIcon className="w-4 h-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-semibold truncate text-blue-900">
                                {item.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className={
                                  item.type === 'lesson' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                                  item.type === 'assignment' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' :
                                  item.type === 'exam' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' :
                                  'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                }>
                                  {item.type || 'unknown'}
                                </Badge>
                                {item.multiplier > 1 && (
                                  <Badge variant="outline" className="border-blue-200 text-blue-700">
                                    {item.multiplier}x multiplier
                                  </Badge>
                                )}
                              </div>
                              <div className="mt-2 text-sm">
                                {content ? (
                                  <span className="text-green-600 font-medium flex items-center">
                                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                    Content added
                                  </span>
                                ) : (
                                  <span className="text-amber-600 font-medium flex items-center">
                                    <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
                                    No content yet
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleEditContent(unit, item)}
                              className="mt-1 bg-blue-600 hover:bg-blue-700 shadow-sm"
                            >
                              <PenLine className="w-4 h-4 mr-2" />
                              Edit Content
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Content Preview Accordion - SANITIZE HTML HERE */}
                      {content && (
                        <Accordion type="single" collapsible>
                          <AccordionItem value="content-preview" className="border-0">
                            <AccordionTrigger className="py-2 px-4 border-t bg-blue-50 hover:bg-blue-100 font-medium text-sm">
                              <div className="flex items-center text-blue-700">
                                <span>Preview Content</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-6 bg-white">
                              <div className="prose prose-sm lg:prose-base max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
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
      <ScrollArea className="flex-1 bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-lg">
        <div className="space-y-8 p-4 pr-8">
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
                      <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg shadow-sm border border-blue-200">
                        <BookOpen className="w-5 h-5 text-blue-700" />
                        <h2 className="font-bold text-blue-900">
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
              <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg shadow-sm border border-gray-300">
                <BookOpen className="w-5 h-5 text-gray-700" />
                <h2 className="font-bold text-gray-900">
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
        <DialogContent className="max-w-[95vw] w-full h-[95vh] flex flex-col p-6 overflow-visible border-blue-200 shadow-lg">
          <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 -m-6 mb-2 p-6 border-b border-blue-200">
            <DialogTitle className="text-blue-900 font-bold flex items-center">
              {editingContent && (
                <>
                  <PenLine className="w-5 h-5 mr-2 text-blue-700" />
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