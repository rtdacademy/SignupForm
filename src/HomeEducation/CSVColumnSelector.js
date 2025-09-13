import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '../components/ui/sheet';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  GripVertical,
  Download,
  Eye,
  Settings2,
  CheckCircle2,
  XCircle,
  Info,
  FileSpreadsheet,
  Users,
  GraduationCap,
  FileText,
  CreditCard,
  MapPin,
  Calendar,
  ClipboardCheck,
  ChevronRight,
  ChevronDown,
  Layers
} from 'lucide-react';

// Define all available columns with categories
export const COLUMN_DEFINITIONS = {
  family: {
    label: 'Family Information',
    icon: Users,
    columns: [
      { id: 'familyId', label: 'Family ID', description: 'Unique family identifier', default: false },
      { id: 'familyName', label: 'Family Name', description: 'Family surname', default: true },
      { id: 'status', label: 'Status', description: 'Active/Inactive status', default: true },
      { id: 'createdAt', label: 'Created Date', description: 'When family was added', default: false },
      { id: 'lastUpdated', label: 'Last Updated', description: 'Most recent activity', default: true },
      { id: 'totalStudents', label: 'Total Students', description: 'Number of students', default: true },
      { id: 'totalGuardians', label: 'Total Guardians', description: 'Number of guardians', default: false },
    ]
  },
  students: {
    label: 'Student Information',
    icon: GraduationCap,
    columns: [
      { id: 'studentNames', label: 'Student Names', description: 'All student names', default: true },
      { id: 'studentASNs', label: 'Student ASNs', description: 'Alberta Student Numbers', default: true },
      { id: 'studentGrades', label: 'Grades', description: 'Student grade levels', default: true },
      { id: 'studentAges', label: 'Ages', description: 'Student ages', default: false },
      { id: 'studentBirthdays', label: 'Birthdays', description: 'Student birth dates', default: false },
      { id: 'studentGenders', label: 'Genders', description: 'Student genders', default: false },
      { id: 'studentEmails', label: 'Student Emails', description: 'Student email addresses', default: false },
      { id: 'studentPhones', label: 'Student Phones', description: 'Student phone numbers', default: false },
      { id: 'readyForPASI', label: 'Ready for PASI', description: 'PASI readiness status', default: true },
    ]
  },
  guardians: {
    label: 'Guardian Information',
    icon: Users,
    columns: [
      { id: 'primaryGuardianName', label: 'Primary Guardian', description: 'Primary guardian name', default: true },
      { id: 'primaryGuardianEmail', label: 'Primary Email', description: 'Primary guardian email', default: true },
      { id: 'primaryGuardianPhone', label: 'Primary Phone', description: 'Primary guardian phone', default: true },
      { id: 'secondaryGuardianNames', label: 'Other Guardians', description: 'Additional guardian names', default: false },
      { id: 'secondaryGuardianEmails', label: 'Other Emails', description: 'Additional guardian emails', default: false },
      { id: 'guardianRelations', label: 'Relations', description: 'Relation to students', default: false },
    ]
  },
  facilitator: {
    label: 'Facilitator Information',
    icon: Users,
    columns: [
      { id: 'facilitatorName', label: 'Facilitator Name', description: 'Assigned facilitator', default: true },
      { id: 'facilitatorEmail', label: 'Facilitator Email', description: 'Facilitator contact', default: true },
      { id: 'facilitatorAssignedDate', label: 'Assigned Date', description: 'When facilitator was assigned', default: false },
      { id: 'lastFacilitatorUpdate', label: 'Last Update', description: 'Last facilitator activity', default: false },
    ]
  },
  registration: {
    label: 'Registration Status',
    icon: ClipboardCheck,
    columns: [
      { id: 'schoolYear', label: 'School Year', description: 'Current school year', default: true },
      { id: 'notificationFormStatus', label: 'Notification Form', description: 'Form submission status', default: true },
      { id: 'educationPlanStatus', label: 'Education Plan', description: 'SOLO plan status', default: true },
      { id: 'citizenshipDocsStatus', label: 'Citizenship Docs', description: 'Document approval status', default: true },
      { id: 'paymentSetupStatus', label: 'Payment Setup', description: 'Stripe setup status', default: false },
      { id: 'pasiRegistrationStatus', label: 'PASI Status', description: 'PASI registration status', default: true },
      { id: 'overallRegistrationStatus', label: 'Overall Status', description: 'Combined registration status', default: true },
      { id: 'assistanceRequired', label: 'Assistance Required', description: 'Family needs help', default: true },
    ]
  },
  address: {
    label: 'Address Information',
    icon: MapPin,
    columns: [
      { id: 'streetAddress', label: 'Street Address', description: 'Street address', default: false },
      { id: 'city', label: 'City', description: 'City name', default: true },
      { id: 'province', label: 'Province', description: 'Province/State', default: true },
      { id: 'postalCode', label: 'Postal Code', description: 'Postal/ZIP code', default: false },
      { id: 'country', label: 'Country', description: 'Country name', default: false },
      { id: 'fullAddress', label: 'Full Address', description: 'Complete formatted address', default: false },
    ]
  },
  compliance: {
    label: 'Forms & Compliance',
    icon: FileText,
    columns: [
      { id: 'registrationDate', label: 'Registration Date', description: 'Initial registration date', default: false },
      { id: 'acceptanceStatus', label: 'Acceptance Status', description: 'School acceptance status', default: false },
      { id: 'schoolCode', label: 'School Code', description: 'Alberta school code', default: false },
      { id: 'authorityCode', label: 'Authority Code', description: 'Authority code', default: false },
      { id: 'residentSchoolBoard', label: 'School Board', description: 'Resident school board', default: false },
      { id: 'aboriginalDeclaration', label: 'Aboriginal Declaration', description: 'Aboriginal status', default: false },
      { id: 'francophoneEligible', label: 'Francophone', description: 'Francophone eligibility', default: false },
    ]
  },
  funding: {
    label: 'Funding Information',
    icon: CreditCard,
    columns: [
      { id: 'fundingEligible', label: 'Funding Eligible', description: 'Students eligible for funding', default: true },
      { id: 'fundingAmounts', label: 'Funding Amounts', description: 'Funding amount per student', default: true },
      { id: 'totalFunding', label: 'Total Funding', description: 'Total family funding', default: true },
    ]
  },
  meetings: {
    label: 'Meeting Information',
    icon: Calendar,
    columns: [
      { id: 'meeting1Date', label: 'Meeting 1 Date', description: 'First meeting date', default: false },
      { id: 'meeting1Attendees', label: 'Meeting 1 Attendees', description: 'First meeting participants', default: false },
      { id: 'meeting2Date', label: 'Meeting 2 Date', description: 'Second meeting date', default: false },
      { id: 'meeting2Attendees', label: 'Meeting 2 Attendees', description: 'Second meeting participants', default: false },
      { id: 'professionalJudgment', label: 'Professional Judgment', description: 'Achieving outcomes assessment', default: false },
      { id: 'meetingComments', label: 'Meeting Comments', description: 'Overall meeting notes', default: false },
    ]
  }
};

// Preset configurations
const PRESETS = {
  basic: {
    name: 'Basic',
    description: 'Essential information only',
    columns: ['familyName', 'primaryGuardianName', 'primaryGuardianEmail', 'studentNames', 'studentGrades', 'facilitatorName']
  },
  detailed: {
    name: 'Detailed',
    description: 'Comprehensive family information',
    columns: [
      'familyName', 'status', 'lastUpdated', 'totalStudents',
      'studentNames', 'studentASNs', 'studentGrades', 'studentAges', 'readyForPASI',
      'primaryGuardianName', 'primaryGuardianEmail', 'primaryGuardianPhone',
      'facilitatorName', 'facilitatorEmail',
      'notificationFormStatus', 'educationPlanStatus', 'citizenshipDocsStatus', 'overallRegistrationStatus',
      'city', 'province'
    ]
  },
  compliance: {
    name: 'Compliance',
    description: 'Registration and compliance focused',
    columns: [
      'familyName', 'studentNames', 'studentASNs',
      'schoolYear', 'notificationFormStatus', 'educationPlanStatus', 'citizenshipDocsStatus',
      'pasiRegistrationStatus', 'overallRegistrationStatus', 'assistanceRequired',
      'registrationDate', 'acceptanceStatus', 'schoolCode', 'authorityCode',
      'meeting1Date', 'meeting2Date', 'professionalJudgment'
    ]
  },
  funding: {
    name: 'Funding',
    description: 'Funding and payment information',
    columns: [
      'familyName', 'studentNames', 'studentGrades', 'studentAges',
      'fundingEligible', 'fundingAmounts', 'totalFunding',
      'paymentSetupStatus', 'primaryGuardianName', 'primaryGuardianEmail'
    ]
  }
};

// Sortable column item component
const SortableColumnItem = ({ column, isSelected, onToggle, categoryLabel }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 rounded-lg border ${
        isSelected ? 'bg-purple-50 border-purple-300' : 'bg-gray-50 border-gray-200'
      } ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div {...attributes} {...listeners} className="cursor-grab hover:cursor-grabbing">
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggle(column.id)}
        className="flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{column.label}</span>
          <Badge variant="outline" className="text-xs px-1 py-0">
            {categoryLabel}
          </Badge>
        </div>
        <p className="text-xs text-gray-500 truncate">{column.description}</p>
      </div>
    </div>
  );
};

// Main CSV Column Selector Component
const CSVColumnSelector = ({ isOpen, onClose, onExport, families, schoolYear }) => {
  // Get all columns in a flat list
  const getAllColumns = () => {
    const columns = [];
    Object.entries(COLUMN_DEFINITIONS).forEach(([categoryKey, category]) => {
      category.columns.forEach(col => {
        columns.push({
          ...col,
          category: categoryKey,
          categoryLabel: category.label
        });
      });
    });
    return columns;
  };

  const allColumns = getAllColumns();
  const defaultColumns = allColumns.filter(col => col.default).map(col => col.id);

  const [selectedColumns, setSelectedColumns] = useState(new Set(defaultColumns));
  const [columnOrder, setColumnOrder] = useState(allColumns.map(col => col.id));
  const [activeTab, setActiveTab] = useState('customize');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set(Object.keys(COLUMN_DEFINITIONS)));

  // Load saved preferences
  useEffect(() => {
    const savedPrefs = localStorage.getItem('csvColumnPreferences');
    if (savedPrefs) {
      try {
        const prefs = JSON.parse(savedPrefs);
        setSelectedColumns(new Set(prefs.selectedColumns));
        setColumnOrder(prefs.columnOrder);
      } catch (e) {
        console.error('Failed to load column preferences:', e);
      }
    }
  }, []);

  // Save preferences
  const savePreferences = () => {
    const prefs = {
      selectedColumns: Array.from(selectedColumns),
      columnOrder: columnOrder
    };
    localStorage.setItem('csvColumnPreferences', JSON.stringify(prefs));
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setColumnOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const toggleColumn = (columnId) => {
    setSelectedColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnId)) {
        newSet.delete(columnId);
      } else {
        newSet.add(columnId);
      }
      return newSet;
    });
  };

  const toggleCategory = (categoryKey) => {
    const categoryColumns = COLUMN_DEFINITIONS[categoryKey].columns.map(col => col.id);
    const allSelected = categoryColumns.every(id => selectedColumns.has(id));
    
    setSelectedColumns(prev => {
      const newSet = new Set(prev);
      categoryColumns.forEach(id => {
        if (allSelected) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
      });
      return newSet;
    });
  };

  const toggleCategoryExpansion = (categoryKey) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryKey)) {
        newSet.delete(categoryKey);
      } else {
        newSet.add(categoryKey);
      }
      return newSet;
    });
  };

  const applyPreset = (presetKey) => {
    const preset = PRESETS[presetKey];
    setSelectedColumns(new Set(preset.columns));
    setSelectedPreset(presetKey);
    
    // Reorder columns to put preset columns first
    const presetOrder = [...preset.columns];
    const otherColumns = columnOrder.filter(id => !preset.columns.includes(id));
    setColumnOrder([...presetOrder, ...otherColumns]);
  };

  const selectAll = () => {
    setSelectedColumns(new Set(allColumns.map(col => col.id)));
  };

  const clearAll = () => {
    setSelectedColumns(new Set());
  };

  const handleExport = () => {
    savePreferences();
    const orderedSelectedColumns = columnOrder.filter(id => selectedColumns.has(id));
    onExport(orderedSelectedColumns);
    onClose();
  };

  // Generate preview data
  const getPreviewData = () => {
    const orderedSelectedColumns = columnOrder.filter(id => selectedColumns.has(id));
    const previewFamilies = Object.values(families).slice(0, 3);
    
    return {
      columns: orderedSelectedColumns.map(id => {
        const col = allColumns.find(c => c.id === id);
        return col ? col.label : id;
      }),
      rows: previewFamilies.map(family => {
        // This would be replaced with actual data extraction logic
        return orderedSelectedColumns.map(id => {
          switch(id) {
            case 'familyName': return family.familyName || '';
            case 'status': return family.status || 'active';
            case 'totalStudents': return family.studentCount || 0;
            // Add more cases for actual data extraction
            default: return 'Sample Data';
          }
        });
      })
    };
  };

  const previewData = showPreview ? getPreviewData() : null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" size="xl" className="flex flex-col overflow-hidden">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-purple-600" />
            Configure CSV Export
          </SheetTitle>
          <SheetDescription>
            Select and arrange the columns you want to include in your CSV export
          </SheetDescription>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col mt-4 min-h-0">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="customize">Customize</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="mt-4 overflow-y-auto">
            <div className="space-y-4 pb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Quick Configurations</h3>
                <Badge variant="outline">
                  {selectedColumns.size} columns selected
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => applyPreset(key)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedPreset === key
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{preset.name}</span>
                      {selectedPreset === key && (
                        <CheckCircle2 className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{preset.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {preset.columns.length} columns
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="customize" className="mt-4 overflow-y-auto">
            <div className="pb-4">
              <div className="flex items-center justify-between mb-4 sticky top-0 bg-background z-10 pb-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAll}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAll}
                  >
                    Clear All
                  </Button>
                </div>
                <Badge variant="outline">
                  {selectedColumns.size} of {allColumns.length} selected
                </Badge>
              </div>

              <div className="space-y-4">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={columnOrder}
                    strategy={verticalListSortingStrategy}
                  >
                    {Object.entries(COLUMN_DEFINITIONS).map(([categoryKey, category]) => {
                      const CategoryIcon = category.icon;
                      const categoryColumns = category.columns;
                      const selectedCount = categoryColumns.filter(col => 
                        selectedColumns.has(col.id)
                      ).length;
                      const isExpanded = expandedCategories.has(categoryKey);
                      
                      return (
                        <div key={categoryKey} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => toggleCategoryExpansion(categoryKey)}
                              className="flex items-center gap-2 hover:text-purple-600 transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                              <CategoryIcon className="w-4 h-4" />
                              <span className="font-medium">{category.label}</span>
                            </button>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {selectedCount}/{categoryColumns.length}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleCategory(categoryKey)}
                              >
                                {selectedCount === categoryColumns.length ? 'Deselect' : 'Select'} All
                              </Button>
                            </div>
                          </div>
                          
                          {isExpanded && (
                            <div className="space-y-2 ml-6">
                              {categoryColumns
                                .filter(col => columnOrder.includes(col.id))
                                .sort((a, b) => 
                                  columnOrder.indexOf(a.id) - columnOrder.indexOf(b.id)
                                )
                                .map(column => (
                                  <SortableColumnItem
                                    key={column.id}
                                    column={column}
                                    isSelected={selectedColumns.has(column.id)}
                                    onToggle={toggleColumn}
                                    categoryLabel={category.label}
                                  />
                                ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-4 overflow-y-auto">
            <div className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">CSV Preview</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showPreview ? 'Refresh' : 'Generate'} Preview
                </Button>
              </div>

              {showPreview && previewData && (
                <div>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {previewData.columns.map((col, idx) => (
                          <TableHead key={idx} className="text-xs font-medium">
                            {col}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.rows.map((row, rowIdx) => (
                        <TableRow key={rowIdx}>
                          {row.map((cell, cellIdx) => (
                            <TableCell key={cellIdx} className="text-xs">
                              {cell}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">
                        This preview shows the first 3 families with selected columns.
                      </p>
                      <p className="text-xs text-gray-600">
                        {selectedColumns.size} columns × {Object.keys(families).length} families 
                        will be exported.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              )}

              {!showPreview && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-2">
                    <Eye className="w-12 h-12 text-gray-300 mx-auto" />
                    <p className="text-sm text-gray-500">
                      Click "Generate Preview" to see sample data
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <SheetFooter className="pt-4 mt-6 border-t">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {selectedColumns.size} columns selected
              </Badge>
              <Badge variant="outline">
                {Object.keys(families).length} families
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={selectedColumns.size === 0}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CSVColumnSelector;