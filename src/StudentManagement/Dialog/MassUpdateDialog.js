import React, { useState } from 'react';
import { ref, update, push } from 'firebase/database';
import { database } from '../../firebase';
import { sanitizeEmail } from '../../utils/sanitizeEmail';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "../../components/ui/dropdown-menu";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";
import { useAuth } from '../../context/AuthContext';
import { Alert, AlertDescription } from "../../components/ui/alert";
import { 
  AlertCircle,
  ChevronDown,
  Grid2X2,
  Circle,
  Users,
  Plus,
  Pencil,
  ClipboardList,
  Calendar,
  CalendarDays,
  CalendarClock,
  Umbrella,
  GraduationCap,
  Database,
  Tags
} from 'lucide-react';
import PermissionIndicator from '../../context/PermissionIndicator';
import {
  STATUS_OPTIONS,
  ACTIVE_FUTURE_ARCHIVED_OPTIONS,
  PASI_OPTIONS,
  STUDENT_TYPE_OPTIONS,
  getSchoolYearOptions,
  DIPLOMA_MONTH_OPTIONS,
  TERM_OPTIONS,
} from '../../config/DropdownOptions';
import { toast } from 'sonner';


const iconMap = {
  'circle': Circle,
  'grid': Grid2X2,
  'pencil': Pencil,
  'clipboard-list': ClipboardList,
  'calendar': Calendar,
  'calendar-days': CalendarDays,
  'calendar-clock': CalendarClock,
  'umbrella': Umbrella,
  'graduation-cap': GraduationCap,
  'database': Database,
  'tags': Tags
};

const PROPERTY_OPTIONS = [
  { value: 'status', label: 'Status', icon: ClipboardList, path: 'Status/Value' },
  { value: 'state', label: 'State', icon: Database, path: 'ActiveFutureArchived/Value' },
  { value: 'pasi', label: 'PASI', icon: Database, path: 'PASI/Value' },
  { value: 'studentType', label: 'Student Type', icon: GraduationCap, path: 'StudentType/Value' },
  { value: 'schoolYear', label: 'School Year', icon: Calendar, path: 'School_x0020_Year/Value' },
  { value: 'diplomaMonth', label: 'Diploma Month', icon: Calendar, path: 'DiplomaMonthChoices/Value' },
  { value: 'term', label: 'Term', icon: Calendar, path: 'Term' },
  { value: 'categories', label: 'Categories', icon: Tags }
];

const MassUpdateDialog = ({ 
  isOpen, 
  onClose, 
  selectedStudents,
  teacherCategories,
  categoryTypes,
  user_email_key
}) => {
  const { user, isAdminUser, isStaffUser } = useAuth();
  const hasAdminAccess = isStaffUser && isAdminUser;
  
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTeacherKey, setSelectedTeacherKey] = useState(null);
  const [isCategoryEnabled, setIsCategoryEnabled] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const getDisplayName = (student) => {
    if (!student) return 'Unknown Student';
    return `${student.preferredFirstName || student.firstName || ''} ${student.lastName || ''} - ${student.Course_Value || 'No Course'}`;
  };

  const getOptionsForProperty = () => {
    switch (selectedProperty) {
      case 'status':
        return STATUS_OPTIONS;
      case 'state':
        return ACTIVE_FUTURE_ARCHIVED_OPTIONS;
      case 'pasi':
        return PASI_OPTIONS;
      case 'studentType':
        return STUDENT_TYPE_OPTIONS;
      case 'schoolYear':
        return getSchoolYearOptions();
      case 'diplomaMonth':
        return DIPLOMA_MONTH_OPTIONS;
      case 'term':
        return TERM_OPTIONS;
      default:
        return [];
    }
  };

  const handlePropertyChange = (value) => {
    setSelectedProperty(value);
    setSelectedValue(null);
    setSelectedCategory(null);
    setSelectedTeacherKey(null);
  };

  const handleValueChange = (value) => {
    setSelectedValue(value);
  };

  const handleCategorySelect = (categoryId, teacherEmailKey, categoryData) => {
    setSelectedCategory({ ...categoryData, id: categoryId });
    setSelectedTeacherKey(teacherEmailKey);
    setCategoryMenuOpen(false);
  };

  const handleUpdate = async () => {
    if (!selectedProperty || (!selectedValue && !selectedCategory)) return;
    setIsUpdating(true);
  
    try {
      const updates = {};
      
      selectedStudents.forEach(student => {
        const studentKey = sanitizeEmail(student.StudentEmail);
        const basePath = `/students/${studentKey}/courses/${student.CourseID}`;
  
        if (selectedProperty === 'categories') {
          const categoryPath = `${basePath}/categories/${selectedTeacherKey}/${selectedCategory.id}`;
          updates[categoryPath] = isCategoryEnabled;
          
          // Add lastChange tracking for category updates
          updates[`${basePath}/enrollmentHistory/lastChange`] = {
            userEmail: user?.email || 'unknown',
            timestamp: Date.now(),
            field: 'categories',
            isMassUpdate: true,
            massUpdateDetails: {
              totalStudents: selectedStudents.length,
              categoryName: selectedCategory.name,
              action: isCategoryEnabled ? 'added' : 'removed'
            }
          };
        } else {
          const propertyInfo = PROPERTY_OPTIONS.find(p => p.value === selectedProperty);
          if (propertyInfo) {
            const updatePath = `${basePath}/${propertyInfo.path}`;
            updates[updatePath] = selectedValue;
            
            // Add lastChange tracking for all property updates
            const fieldName = propertyInfo.path.replace('/', '_');
            updates[`${basePath}/enrollmentHistory/lastChange`] = {
              userEmail: user?.email || 'unknown',
              timestamp: Date.now(),
              field: fieldName,
              isMassUpdate: true,
              massUpdateDetails: {
                totalStudents: selectedStudents.length,
                propertyName: propertyInfo.label,
                newValue: selectedValue
              }
            };
  
            // Add status log entry if we're updating status
            if (selectedProperty === 'status') {
              const statusLogRef = ref(database, `${basePath}/statusLog`);
              const newLogRef = push(statusLogRef);
              updates[`${basePath}/statusLog/${newLogRef.key}`] = {
                timestamp: new Date().toISOString(),
                status: selectedValue,
                previousStatus: student.Status_Value || '',
                updatedBy: {
                  name: user.displayName || user.email,
                  email: user.email,
                },
                updatedByType: 'teacher',
                autoStatus: false,
                bulkUpdate: true // Add this flag to indicate it was part of a mass update
              };
            }
          }
        }
      });
  
      await update(ref(database), updates);
      
      toast.success(
        selectedProperty === 'categories'
          ? `Successfully ${isCategoryEnabled ? 'added' : 'removed'} ${selectedCategory.name} ${isCategoryEnabled ? 'to' : 'from'} ${selectedStudents.length} students`
          : `Successfully updated ${selectedProperty} to "${selectedValue}" for ${selectedStudents.length} students`
      );
      
      onClose();
    } catch (error) {
      console.error('Error updating students:', error);
      toast.error(`Failed to update students: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };


  const renderPropertySelection = () => {
    if (selectedProperty === 'categories') {
      return (
        <div className="space-y-4">
          <DropdownMenu open={categoryMenuOpen} onOpenChange={setCategoryMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-between text-left font-normal"
              >
                {selectedCategory ? (
                  <div className="flex items-center">
                    {iconMap[selectedCategory.icon] && React.createElement(iconMap[selectedCategory.icon], { 
                      style: { color: selectedCategory.color }, 
                      size: 16, 
                      className: 'mr-2' 
                    })}
                    <span>{selectedCategory.name}</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Plus className="h-4 w-4 mr-1" />
                    Select Category
                  </div>
                )}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {/* By Staff option */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Users className="h-4 w-4 mr-2" />
                  By Staff
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
                  {Object.entries(teacherCategories).map(([teacherEmailKey, categories]) => (
                    <DropdownMenuSub key={teacherEmailKey}>
                      <DropdownMenuSubTrigger className="w-full">
                        <div className="truncate">
                          {teacherEmailKey}
                        </div>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {categories.map(category => (
                          <DropdownMenuItem
                            key={category.id}
                            onSelect={() => handleCategorySelect(category.id, teacherEmailKey, category)}
                          >
                            <div className="flex items-center">
                              {iconMap[category.icon] && React.createElement(iconMap[category.icon], { 
                                style: { color: category.color }, 
                                size: 16, 
                                className: 'mr-2' 
                              })}
                              <span>{category.name}</span>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              {/* By Type option */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Grid2X2 className="h-4 w-4 mr-2" />
                  By Type
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
                  {categoryTypes.map((type) => (
                    <DropdownMenuSub key={type.id}>
                      <DropdownMenuSubTrigger className="w-full">
                        <div className="flex items-center">
                          {React.createElement(
                            iconMap[type.icon] || Circle,
                            { 
                              className: "h-4 w-4 mr-2 flex-shrink-0",
                              style: { color: type.color }
                            }
                          )}
                          <span className="truncate">{type.name}</span>
                        </div>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {Object.entries(teacherCategories).flatMap(([teacherEmailKey, categories]) =>
                          categories
                            .filter(category => category.type === type.id)
                            .map(category => (
                              <DropdownMenuItem
                                key={`${teacherEmailKey}-${category.id}`}
                                onSelect={() => handleCategorySelect(category.id, teacherEmailKey, category)}
                              >
                                <div className="flex items-center">
                                  {iconMap[category.icon] && React.createElement(iconMap[category.icon], { 
                                    style: { color: category.color }, 
                                    size: 16, 
                                    className: 'mr-2' 
                                  })}
                                  <span>{category.name}</span>
                                </div>
                              </DropdownMenuItem>
                            ))
                        )}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
  <span className="text-sm">
    {isCategoryEnabled ? (
      <span className="text-green-700">
        Add <span className="font-medium">{selectedCategory?.name}</span> category to all {selectedStudents.length} selected students
      </span>
    ) : (
      <span className="text-red-700">
        Remove <span className="font-medium">{selectedCategory?.name}</span> category from all selected students
      </span>
    )}
  </span>
  <Switch
    checked={isCategoryEnabled}
    onCheckedChange={setIsCategoryEnabled}
  />
</div>
        </div>
      );
    }

    return (
      <Select value={selectedValue} onValueChange={handleValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Choose value..." />
        </SelectTrigger>
        <SelectContent>
          {getOptionsForProperty().map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="flex items-center"
            >
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: option.color }}
                />
                {option.value} 
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
     <DialogContent className="max-w-3xl h-[90vh] max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <DialogTitle>Mass Update Students</DialogTitle>
            <PermissionIndicator type="ADMIN" className="ml-2" />
          </div>
          <DialogDescription>
            Selected Students: {selectedStudents.length}
          </DialogDescription>
        </DialogHeader>

        {!hasAdminAccess && (
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don't have administrator privileges. This view is read-only.
            </AlertDescription>
          </Alert>
        )}

<ScrollArea className="flex-1 h-[calc(90vh-200px)] w-full rounded-md border p-4">
          <div className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="students-list">
                <AccordionTrigger className="text-sm font-medium">
                  Selected Students ({selectedStudents.length})
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pl-4">
                    {selectedStudents.map((student) => (
                      <div 
                        key={student.id} 
                        className="text-sm text-gray-700 py-1 border-b border-gray-100 last:border-0"
                      >
                        {getDisplayName(student)}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {hasAdminAccess && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Property to Update</label>
                  <Select value={selectedProperty} onValueChange={handlePropertyChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose property..." />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center">
                            {React.createElement(option.icon, { 
                              className: "h-4 w-4 mr-2" 
                            })}
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedProperty && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select New Value</label>
                    {renderPropertySelection()}
                  </div>
                )}
              </div>
            )}

            {selectedProperty && (
              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <h3 className="text-sm font-medium mb-2">Preview of Changes</h3>
                <div className="text-sm text-gray-600">
                  <p>
                    Property to update: <span className="font-medium">{selectedProperty}</span>
                  </p>
                  <p>
                    New value: <span className="font-medium">
                      {selectedProperty === 'categories' 
                        ? selectedCategory?.name 
                        : selectedValue}
                    </span>
                  </p>
                  <p>
                    Number of students affected: <span className="font-medium">{selectedStudents.length}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {hasAdminAccess && ((selectedValue && selectedProperty !== 'categories') || (selectedCategory && selectedProperty === 'categories')) && (
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              className="bg-blue-600 text-white hover:bg-blue-700"
              disabled={
                !selectedProperty ||
                (
                  (selectedProperty !== 'categories' && !selectedValue) ||
                  (selectedProperty === 'categories' && !selectedCategory)
                ) || isUpdating
              }
            >
              {isUpdating ? 'Updating...' : `Update ${selectedStudents.length} Students`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MassUpdateDialog;
