import React, { useMemo, useState } from 'react';
import { 
  Book, 
  GraduationCap, 
  FileText, 
  Info,
  Edit,
  BookOpen,
  X
} from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../components/ui/accordion';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import QuillEditor from './QuillEditor';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getDatabase, ref, update } from 'firebase/database';

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

const ContentEditor = ({ courseData, contentData, onUpdate, courseId }) => {
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

  const handleEditContent = (unit, item) => {
    setEditingContent({
      unit,
      item,
      // Get existing content if available
      content: contentData?.units?.[`unit_${unit.sequence}`]?.items?.[`item_${item.sequence}`]?.content || ''
    });
    setIsEditorOpen(true);
  };

  const handleSaveContent = async (html) => {
    if (!editingContent || !courseData.ID) return;

    const { unit, item } = editingContent;
    const courseId = courseData.ID;
    const unitId = `unit_${unit.sequence}`;
    const itemId = `item_${item.sequence}`;

    try {
      // Save to Firestore
      const firestore = getFirestore();
      const contentRef = doc(firestore, 'courses', courseId.toString(), 'content', `${unitId}_${itemId}`);
      await setDoc(contentRef, {
        content: html,
        updatedAt: new Date().toISOString()
      });

      // Update RTDB path
      const db = getDatabase();
      const pathRef = ref(db, `courses/${courseId}/units/${unit.sequence - 1}/items/${item.sequence - 1}`);
      await update(pathRef, {
        contentPath: `courses/${courseId}/content/${unitId}_${itemId}`
      });

      // Update local state through parent
      onUpdate(unitId, itemId, { content: html });
      
      // Close editor
      setIsEditorOpen(false);
      setEditingContent(null);
    } catch (error) {
      console.error('Error saving content:', error);
      // Handle error appropriately
    }
  };

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="space-y-8 pr-4">
          {Object.entries(sectionedUnits)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([section, sectionUnits]) => (
              section !== 'other' && (
                <div key={section} className="space-y-4">
                  {/* Section Header */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                    <BookOpen className="w-5 h-5 text-gray-700" />
                    <h2 className="font-semibold text-gray-900">
                      Section {section}
                    </h2>
                  </div>

                  <Accordion type="single" collapsible className="space-y-3">
                    {sectionUnits.map((unit) => (
                      <AccordionItem
                        key={unit.sequence}
                        value={`unit-${unit.sequence}`}
                        className={`border-2 rounded-lg overflow-hidden ${sectionColors[section]}`}
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
                            <div className="space-y-2">
                              {unit.items?.map((item) => {
                                const ItemIcon = typeIcons[item.type] || Info;
                                const contentRef = `unit_${unit.sequence}/item_${item.sequence}`;
                                const itemContent = contentData?.units?.[`unit_${unit.sequence}`]?.items?.[`item_${item.sequence}`];
                                
                                return (
                                  <div
                                    key={item.sequence}
                                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                                  >
                                    <div className={`p-2 rounded ${typeColors[item.type]}`}>
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
                                              {item.type}
                                            </Badge>
                                            {item.multiplier > 1 && (
                                              <Badge variant="outline">
                                                {item.multiplier}x multiplier
                                              </Badge>
                                            )}
                                          </div>
                                          <div className="mt-2 text-sm text-gray-500">
                                            {itemContent ? (
                                              <span className="text-green-600">Content added</span>
                                            ) : (
                                              <span className="text-gray-400">No content yet</span>
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
                                );
                              })}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )
          ))}
        </div>
      </ScrollArea>

      {/* Content Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
  <DialogContent className="max-w-[95vw] w-full h-[95vh] flex flex-col p-6 overflow-visible">
    {/* Add overflow-visible above and to the parent div below */}
    <div className="flex-1 min-h-0 mt-4 overflow-visible">
      <QuillEditor
        courseId={courseId}
        unitId={editingContent?.unit.sequence}
        itemId={editingContent?.item.sequence}
        initialContent={editingContent?.content}
        onSave={handleSaveContent}
      />
    </div>
  </DialogContent>
</Dialog>
    </div>
  );
};

export default ContentEditor;