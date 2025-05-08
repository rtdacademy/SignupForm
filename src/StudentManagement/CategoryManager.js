import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  Plus,
  Archive,
  Trash2,
  RotateCcw,
  Circle,
  Square,
  Triangle,
  BookOpen,
  GraduationCap,
  Trophy,
  Target,
  ClipboardCheck,
  Brain,
  Lightbulb,
  Clock,
  Calendar,
  BarChart,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  MessageCircle,
  Users,
  Presentation,
  FileText,
  Bookmark,
  UserMinus,
  Grid2X2,
  ListFilter,
  ChartNoAxesGantt,
  UserPlus
} from 'lucide-react';
import { getDatabase, ref, set, onValue, update, remove, push, serverTimestamp } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../context/AuthContext';
import PermissionIndicator from '../context/PermissionIndicator';

const iconOptions = [
  { value: 'circle', label: 'Circle', icon: Circle },
  { value: 'square', label: 'Square', icon: Square },
  { value: 'triangle', label: 'Triangle', icon: Triangle },
  { value: 'book-open', label: 'Study Material', icon: BookOpen },
  { value: 'graduation-cap', label: 'Graduation', icon: GraduationCap },
  { value: 'trophy', label: 'Achievement', icon: Trophy },
  { value: 'target', label: 'Goal', icon: Target },
  { value: 'clipboard-check', label: 'Task Complete', icon: ClipboardCheck },
  { value: 'brain', label: 'Understanding', icon: Brain },
  { value: 'lightbulb', label: 'Idea', icon: Lightbulb },
  { value: 'clock', label: 'Time Management', icon: Clock },
  { value: 'calendar', label: 'Schedule', icon: Calendar },
  { value: 'bar-chart', label: 'Progress', icon: BarChart },
  { value: 'trending-up', label: 'Improvement', icon: TrendingUp },
  { value: 'alert-circle', label: 'Attention Needed', icon: AlertCircle },
  { value: 'help-circle', label: 'Help', icon: HelpCircle },
  { value: 'message-circle', label: 'Discussion', icon: MessageCircle },
  { value: 'users', label: 'Group Work', icon: Users },
  { value: 'presentation', label: 'Lecture', icon: Presentation },
  { value: 'file-text', label: 'Assignment', icon: FileText },
  { value: 'bookmark', label: 'Important', icon: Bookmark },
];

const colorOptions = [
  { value: '#315369', label: 'Primary' },
  { value: '#1fa6a7', label: 'Secondary' },
  { value: '#5d7a8c', label: 'Tertiary' },
  { value: '#2ecc71', label: 'Success' },
  { value: '#f39c12', label: 'Warning' },
  { value: '#3498db', label: 'Info' },
  { value: '#a75a1f', label: 'Complementary' },
];

const CategoryManager = ({ onCategoryChange }) => {
  // Existing states
  const [categories, setCategories] = useState([]);
  const [categoryTypes, setCategoryTypes] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', color: '', icon: '', type: '' });
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [organizationMethod, setOrganizationMethod] = useState('type');
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isAddingType, setIsAddingType] = useState(false);
  const [newType, setNewType] = useState({
    name: '',
    description: '',
    icon: '',
    color: colorOptions[0].value,
  });

  // Additional states for all categories and teacher info
  const [allCategories, setAllCategories] = useState([]);
  const [teacherNames, setTeacherNames] = useState({});

  // New state for super admin staff selection
  const [selectedStaffKey, setSelectedStaffKey] = useState(null);
  const [staffList, setStaffList] = useState([]);

  const [notification, setNotification] = useState({ message: '', type: '' });

  // Updated auth context with super admin info
  const { 
    current_user_email_key, 
    hasSuperAdminAccess, 
    user_email_key,
    isStaffUser  
  } = useAuth();

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  // Memoize getEffectiveEmailKey to prevent unnecessary recreations
  const getEffectiveEmailKey = useCallback(() => {
    if (hasSuperAdminAccess() && selectedStaffKey) {
      return selectedStaffKey;
    }
    return current_user_email_key;
  }, [hasSuperAdminAccess, selectedStaffKey, current_user_email_key]);

  // Fetch staff list for super admins and set default selected staff if not already set
  useEffect(() => {
    if (hasSuperAdminAccess()) {
      const db = getDatabase();
      const staffRef = ref(db, 'staff');

      const unsubscribe = onValue(staffRef, (snapshot) => {
        if (snapshot.exists()) {
          const staffData = snapshot.val();
          const staffArray = Object.entries(staffData).map(([key, data]) => ({
            email_key: key,
            ...data,
          }));
          setStaffList(staffArray);
          if (!selectedStaffKey) {
            setSelectedStaffKey(user_email_key);
          }
        }
      });

      return () => unsubscribe();
    }
  }, [hasSuperAdminAccess, user_email_key]);

  // Load categories for the effective teacher (staff) key using memoized getEffectiveEmailKey
  useEffect(() => {
    const effectiveEmailKey = getEffectiveEmailKey();
    if (!effectiveEmailKey) return;

    const db = getDatabase();
    const categoriesRef = ref(db, `teacherCategories/${effectiveEmailKey}`);

    const unsubscribe = onValue(categoriesRef, (snapshot) => {
      if (snapshot.exists()) {
        const categoriesData = snapshot.val();
        const categoriesArray = Object.entries(categoriesData).map(([id, data]) => ({ id, ...data }));
        setCategories(categoriesArray);
        onCategoryChange(categoriesArray.filter((cat) => !cat.archived));
      } else {
        setCategories([]);
        onCategoryChange([]);
      }
    });

    return () => unsubscribe();
  }, [getEffectiveEmailKey, onCategoryChange]);

  // Load category types
  useEffect(() => {
    const db = getDatabase();
    const typesRef = ref(db, 'categoryTypes');

    const handleTypes = (snapshot) => {
      if (snapshot.exists()) {
        const typesData = snapshot.val();
        const typesArray = Object.entries(typesData).map(([id, type]) => ({
          id,
          ...type,
        }));
        setCategoryTypes(typesArray);
      } else {
        setCategoryTypes([]);
      }
    };

    const unsubscribe = onValue(typesRef, handleTypes);
    return () => unsubscribe();
  }, []);

  // Load all categories and teacher names
  useEffect(() => {
    const db = getDatabase();
    const allCategoriesRef = ref(db, 'teacherCategories');
    const staffRef = ref(db, 'staff');

    // Load all categories
    const unsubscribeAllCategories = onValue(allCategoriesRef, (snapshot) => {
      if (snapshot.exists()) {
        const categoriesData = snapshot.val();
        const allCategoriesArray = Object.entries(categoriesData).flatMap(([teacherKey, teacherCategories]) =>
          Object.entries(teacherCategories).map(([id, data]) => ({
            id,
            teacherKey,
            ...data,
          }))
        );
        setAllCategories(allCategoriesArray);
      } else {
        setAllCategories([]);
      }
    });

    // Load teacher names
    const unsubscribeStaff = onValue(staffRef, (snapshot) => {
      if (snapshot.exists()) {
        const staffData = snapshot.val();
        const names = Object.entries(staffData).reduce((acc, [email, data]) => {
          acc[email] = `${data.firstName} ${data.lastName}`;
          return acc;
        }, {});
        setTeacherNames(names);
      } else {
        setTeacherNames({});
      }
    });

    return () => {
      unsubscribeAllCategories();
      unsubscribeStaff();
    };
  }, []);

  // Memoize isCategoryTypeInUse to prevent unnecessary recalculations
  const isCategoryTypeInUse = useCallback((typeId) => {
    return [...categories, ...allCategories].some((category) => category.type === typeId);
  }, [categories, allCategories]);

  const handleAddCategoryType = async () => {
    if (!newType.name || !newType.icon) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    const db = getDatabase();
    const typeId = newType.name.toLowerCase().replace(/\s+/g, '-');
    const typeRef = ref(db, `categoryTypes/${typeId}`);

    try {
      await set(typeRef, {
        name: newType.name,
        description: newType.description,
        icon: newType.icon,
        color: newType.color,
        createdAt: serverTimestamp(),
        createdBy: current_user_email_key,
      });
      setNewType({ name: '', description: '', icon: '', color: colorOptions[0].value });
      setIsAddingType(false);
      showNotification('Category type added successfully');
    } catch (error) {
      console.error('Error adding category type:', error);
      showNotification('Failed to add category type', 'error');
    }
  };

  const handleDeleteCategoryType = async (typeId) => {
    if (isCategoryTypeInUse(typeId)) {
      showNotification('Cannot delete this category type as it is currently in use', 'error');
      return;
    }

    const db = getDatabase();
    const typeRef = ref(db, `categoryTypes/${typeId}`);

    try {
      await remove(typeRef);
      showNotification('Category type deleted successfully');
    } catch (error) {
      console.error('Error deleting category type:', error);
      showNotification('Failed to delete category type', 'error');
    }
  };

  const handleAddCategory = () => {
    if (newCategory.name && newCategory.color && newCategory.icon) {
      const effectiveEmailKey = getEffectiveEmailKey();
      const db = getDatabase();
      const newCategoryRef = ref(db, `teacherCategories/${effectiveEmailKey}/${Date.now()}`);
      set(newCategoryRef, { ...newCategory, archived: false });
      setNewCategory({ name: '', color: '', icon: '', type: '' });
      showNotification('Category added successfully');
    }
  };

  const handleCategoryAction = async (categoryId, action, teacherKey = getEffectiveEmailKey()) => {
    // Verify permissions
    if (!isStaffUser || (!hasSuperAdminAccess() && teacherKey !== user_email_key)) {
      showNotification("You don't have permission to perform this action", "error");
      return;
    }
  
    if (teacherKey) {
      const db = getDatabase();
      const categoryRef = ref(db, `teacherCategories/${teacherKey}/${categoryId}`);
  
      if (action === 'delete' || action === 'removeFromStudents') {
        showNotification(
          action === 'delete' ? "Deleting category..." : "Removing category from students...",
          "info"
        );
  
        if (action === 'delete') {
          try {
            await remove(categoryRef);
          } catch (error) {
            console.error('Error deleting category locally:', error);
            showNotification("Error deleting category locally", "error");
            return;
          }
        }
  
        const functions = getFunctions();
        const deleteCategoryForStudents = httpsCallable(functions, 'deleteCategoryForStudentsV2');
        try {
          const result = await deleteCategoryForStudents({
            categoryId,
            teacherEmailKey: teacherKey,
            action
          });
  
          const { affectedStudents } = result.data;
          showNotification(
            `Category ${action === 'delete' ? 'deleted' : 'removed'}. ` +
            `${affectedStudents > 0 ? `${affectedStudents} student${affectedStudents !== 1 ? 's were' : ' was'} affected.` : 'No students were affected.'}`
          );
  
          if (action === 'delete') {
            setCategoryToDelete(null);
          }
        } catch (error) {
          console.error(`Error ${action === 'delete' ? 'deleting' : 'removing'} category for students:`, error);
          showNotification(`Error ${action === 'delete' ? 'deleting' : 'removing'} category for students`, "error");
        }
      } else if (action === 'archive' || action === 'unarchive') {
        try {
          await update(categoryRef, { archived: action === 'archive' });
          showNotification(`Category ${action}d successfully`);
        } catch (error) {
          console.error(`Error ${action}ing category:`, error);
          showNotification(`Error ${action}ing category`, "error");
        }
      }
    }
  };

  const handleUpdateCategoryType = async (categoryId, typeId, teacherKey = getEffectiveEmailKey()) => {
    const db = getDatabase();
    const categoryRef = ref(db, `teacherCategories/${teacherKey}/${categoryId}`);

    try {
      await update(categoryRef, { type: typeId === 'none' ? null : typeId });
      showNotification('Category type updated successfully');
    } catch (error) {
      console.error('Error updating category type:', error);
      showNotification('Failed to update category type', 'error');
    }
  };

  const renderCategoryByType = (archived) => {
    const filteredCategories = categories.filter((cat) => cat.archived === archived);

    return (
      <ScrollArea className="max-h-[60vh] pr-4">
        <div className="space-y-4">
          {/* Categories with types */}
          {categoryTypes.map((type) => {
            const typeCategories = filteredCategories.filter((cat) => cat.type === type.id);
            if (typeCategories.length === 0) return null;

            return (
              <div key={type.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {React.createElement(
                      iconOptions.find((icon) => icon.value === type.icon)?.icon || Circle,
                      {
                        className: 'h-5 w-5 mr-2',
                        style: { color: type.color },
                      }
                    )}
                    <h3 className="font-medium">{type.name}</h3>
                  </div>
                  {/* Type actions */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="ml-2" disabled={isCategoryTypeInUse(type.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete category type?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete this category type. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteCategoryType(type.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isCategoryTypeInUse(type.id)
                          ? 'Cannot delete: Type is in use by categories'
                          : 'Delete category type'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {renderCategoryList(archived, typeCategories)}
              </div>
            );
          })}

          {/* Uncategorized categories */}
          {filteredCategories.filter((cat) => !cat.type).length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Uncategorized</h3>
              {renderCategoryList(archived, filteredCategories.filter((cat) => !cat.type))}
            </div>
          )}
        </div>
      </ScrollArea>
    );
  };

  const renderCategoryList = (archived, categoryList = null) => {
    const list = categoryList || categories.filter((category) => category.archived === archived);

    return (
      <div className="space-y-2">
        {list.map((category) => (
          <div key={category.id} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              {iconOptions.find((icon) => icon.value === category.icon) &&
                React.createElement(iconOptions.find((icon) => icon.value === category.icon).icon, {
                  className: 'mr-2 h-5 w-5',
                  style: { color: category.color },
                })}
              <span>{category.name}</span>
              {/* Type selection dropdown */}
              <Select
                value={category.type || 'none'}
                onValueChange={(value) => handleUpdateCategoryType(category.id, value === 'none' ? '' : value)}
              >
                <SelectTrigger className="h-7 w-full sm:w-[180px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="text-gray-500">No type</span>
                  </SelectItem>
                  {categoryTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center">
                        {React.createElement(
                          iconOptions.find((icon) => icon.value === type.icon)?.icon || Circle,
                          {
                            className: 'h-4 w-4 mr-2',
                            style: { color: type.color },
                          }
                        )}
                        <span>{type.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <TooltipProvider>
                {archived ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => handleCategoryAction(category.id, 'unarchive')}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Unarchive: Make this category visible again</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => handleCategoryAction(category.id, 'archive')}>
                        <Archive className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Archive: Hide this category from view</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove category from all students?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove the category from all students but keep it in your list. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleCategoryAction(category.id, 'removeFromStudents', category.teacherKey)}>
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Remove from Students: Remove this category from ALL students WITHOUT deleting it from your list
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setCategoryToDelete(category.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the category and remove it from all students.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleCategoryAction(category.id, 'delete')}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete: Permanently remove this category and remove it from ALL students</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAllCategoriesList = () => {
    return (
      <ScrollArea className="max-h-[60vh] pr-4">
        <div className="space-y-2">
          {allCategories.map((category) => (
            <div key={`${category.teacherKey}-${category.id}`} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                {iconOptions.find((icon) => icon.value === category.icon) &&
                  React.createElement(iconOptions.find((icon) => icon.value === category.icon).icon, {
                    className: 'mr-2 h-5 w-5',
                    style: { color: category.color },
                  })}
                <div className="flex flex-col">
                  <span>{category.name}</span>
                  <span className="text-xs text-gray-500">
                    Created by: {teacherNames[category.teacherKey] || category.teacherKey}
                  </span>
                </div>
                {/* Type selection dropdown */}
                <Select
                  value={category.type || 'none'}
                  onValueChange={(value) =>
                    handleUpdateCategoryType(category.id, value === 'none' ? '' : value, category.teacherKey)
                  }
                >
                  <SelectTrigger className="h-7 w-full sm:w-[180px]">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <span className="text-gray-500">No type</span>
                    </SelectItem>
                    {categoryTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center">
                          {React.createElement(
                            iconOptions.find((icon) => icon.value === type.icon)?.icon || Circle,
                            {
                              className: 'h-4 w-4 mr-2',
                              style: { color: type.color },
                            }
                          )}
                          <span>{type.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Only show delete button if user owns the category */}
              {category.teacherKey === getEffectiveEmailKey() && (
                <div className="flex items-center space-x-2">
                  <TooltipProvider>
                    {/* Archive button */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCategoryAction(category.id, 'archive', category.teacherKey)}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Archive: Hide this category from view</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* Remove from students button */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove category from all students?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove the category from all students but keep it in your list. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleCategoryAction(category.id, 'removeFromStudents', category.teacherKey)}>
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Remove from Students: Remove this category from all students without deleting it from your list</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* Delete button */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete category?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the category and remove it from all students.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleCategoryAction(category.id, 'delete', category.teacherKey)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete: Permanently remove this category</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  };

  const renderAllCategoriesByType = () => {
    const grouped = allCategories.reduce((acc, category) => {
      if (category.archived) return acc;
      if (!category.type) {
        acc['uncategorized'] = acc['uncategorized'] || [];
        acc['uncategorized'].push(category);
      } else {
        acc[category.type] = acc[category.type] || [];
        acc[category.type].push(category);
      }
      return acc;
    }, {});

    return (
      <ScrollArea className="max-h-[60vh] pr-4">
        <div className="space-y-4">
          {categoryTypes.map((type) => {
            const typeCategories = grouped[type.id];
            if (!typeCategories || typeCategories.length === 0) return null;

            return (
              <div key={type.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {React.createElement(
                      iconOptions.find((icon) => icon.value === type.icon)?.icon || Circle,
                      {
                        className: 'h-5 w-5 mr-2',
                        style: { color: type.color },
                      }
                    )}
                    <h3 className="font-medium">{type.name}</h3>
                  </div>
                </div>
                {renderAllCategoriesListByType(typeCategories)}
              </div>
            );
          })}

          {/* Uncategorized categories */}
          {grouped['uncategorized'] && grouped['uncategorized'].length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Uncategorized</h3>
              {renderAllCategoriesListByType(grouped['uncategorized'])}
            </div>
          )}
        </div>
      </ScrollArea>
    );
  };

  const renderAllCategoriesListByType = (categoryList) => {
    return (
      <div className="space-y-2">
        {categoryList.map((category) => (
          <div key={`${category.teacherKey}-${category.id}`} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              {iconOptions.find((icon) => icon.value === category.icon) &&
                React.createElement(iconOptions.find((icon) => icon.value === category.icon).icon, {
                  className: 'mr-2 h-5 w-5',
                  style: { color: category.color },
                })}
              <div className="flex flex-col">
                <span>{category.name}</span>
                <span className="text-xs text-gray-500">
                  Created by: {teacherNames[category.teacherKey] || category.teacherKey}
                </span>
              </div>
              {/* Type selection dropdown */}
              <Select
                value={category.type || 'none'}
                onValueChange={(value) =>
                  handleUpdateCategoryType(category.id, value === 'none' ? '' : value, category.teacherKey)
                }
              >
                <SelectTrigger className="h-7 w-full sm:w-[180px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="text-gray-500">No type</span>
                  </SelectItem>
                  {categoryTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center">
                        {React.createElement(
                          iconOptions.find((icon) => icon.value === type.icon)?.icon || Circle,
                          {
                            className: 'h-4 w-4 mr-2',
                            style: { color: type.color },
                          }
                        )}
                        <span>{type.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Only show delete button if user owns the category */}
            {category.teacherKey === getEffectiveEmailKey() && (
              <div className="flex items-center space-x-2">
                <TooltipProvider>
                  {/* Archive button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCategoryAction(category.id, 'archive', category.teacherKey)}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Archive: Hide this category from view</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Remove from students button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove category from all students?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove the category from all students but keep it in your list. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleCategoryAction(category.id, 'removeFromStudents', category.teacherKey)}>
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Remove from Students: Remove this category from all students without deleting it from your list</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Delete button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete category?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the category and remove it from all students.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleCategoryAction(category.id, 'delete', category.teacherKey)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete: Permanently remove this category</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render a staff selector dropdown (only for super admins)
  const renderStaffSelector = () => {
    if (!hasSuperAdminAccess()) return null;

    return (
      <div className="mb-4">
        <Select value={selectedStaffKey} onValueChange={setSelectedStaffKey}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select staff member" />
          </SelectTrigger>
          <SelectContent>
            {staffList.map((staff) => (
              <SelectItem key={staff.email_key} value={staff.email_key}>
                {staff.firstName} {staff.lastName} ({staff.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  // Render content for the "New" tab (includes the staff selector for super admins)
  const renderNewCategoryContent = () => (
    <div className="space-y-4">
      {renderStaffSelector()}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
        <Input
          value={newCategory.name}
          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
          placeholder="Category Name"
        />
        <Select
          value={newCategory.type || 'none'}
          onValueChange={(value) => setNewCategory({ ...newCategory, type: value === 'none' ? '' : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a type" />
          </SelectTrigger>
          <SelectContent position="popper" className="max-h-[300px]">
            <SelectItem value="none">
              <span className="text-gray-500">No type</span>
            </SelectItem>
            {categoryTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                <div className="flex items-center">
                  {React.createElement(
                    iconOptions.find((icon) => icon.value === type.icon)?.icon || Circle,
                    {
                      className: 'h-4 w-4 mr-2',
                      style: { color: type.color },
                    }
                  )}
                  <span>{type.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={newCategory.color}
          onValueChange={(value) => setNewCategory({ ...newCategory, color: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a color" />
          </SelectTrigger>
          <SelectContent position="popper" className="max-h-[300px]">
            {colorOptions.map((color) => (
              <SelectItem key={color.value} value={color.value}>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: color.value }} />
                  {color.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={newCategory.icon}
          onValueChange={(value) => setNewCategory({ ...newCategory, icon: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an icon" />
          </SelectTrigger>
          <SelectContent position="popper" className="max-h-[300px]">
            <div className="grid grid-cols-3 gap-2 p-2">
              {iconOptions.map((icon) => (
                <SelectItem key={icon.value} value={icon.value}>
                  <div className="flex flex-col items-center justify-center">
                    {React.createElement(icon.icon, { className: 'h-6 w-6 mb-1' })}
                    <span className="text-xs text-center">{icon.label}</span>
                  </div>
                </SelectItem>
              ))}
            </div>
          </SelectContent>
        </Select>
        <Button
          className="col-span-2"
          onClick={handleAddCategory}
          disabled={!newCategory.name || !newCategory.color || !newCategory.icon}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>
    </div>
  );

  const renderAddTypeDialog = () => (
    <AlertDialog open={isAddingType} onOpenChange={setIsAddingType}>
      <AlertDialogContent className="max-w-[90vw] sm:max-w-[600px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Category Types Manager</AlertDialogTitle>
          <AlertDialogDescription>
            Create and manage types to organize your categories.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Tabs defaultValue="new" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new">New Type</TabsTrigger>
            <TabsTrigger value="manage">Manage Types</TabsTrigger>
          </TabsList>

          <TabsContent value="new">
            <div className="space-y-4 py-4">
              <Input
                placeholder="Type Name"
                value={newType.name}
                onChange={(e) => setNewType({ ...newType, name: e.target.value })}
              />
              <Input
                placeholder="Description (optional)"
                value={newType.description}
                onChange={(e) => setNewType({ ...newType, description: e.target.value })}
              />
              <Select
                value={newType.icon}
                onValueChange={(value) => setNewType({ ...newType, icon: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
                <SelectContent>
                  <div className="grid grid-cols-3 gap-2 p-2">
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value}>
                        <div className="flex flex-col items-center justify-center">
                          {React.createElement(icon.icon, { className: 'h-6 w-6 mb-1' })}
                          <span className="text-xs text-center">{icon.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
              <Select
                value={newType.color}
                onValueChange={(value) => setNewType({ ...newType, color: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a color" />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: color.value }} />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="pt-4">
                <Button className="w-full" onClick={handleAddCategoryType} disabled={!newType.name || !newType.icon}>
                  <Plus className="mr-2 h-4 w-4" /> Add Type
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="manage">
            <div className="text-sm text-gray-500 mb-4">
              Note: Category types can only be deleted if they are not being used by any categories.
            </div>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-2">
                {categoryTypes.map((type) => {
                  const isInUse = [...categories, ...allCategories].some((cat) => cat.type === type.id);

                  return (
                    <div key={type.id} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center space-x-2">
                        {React.createElement(
                          iconOptions.find((icon) => icon.value === type.icon)?.icon || Circle,
                          {
                            className: 'h-5 w-5',
                            style: { color: type.color },
                          }
                        )}
                        <div>
                          <div className="font-medium">{type.name}</div>
                          {type.description && <div className="text-sm text-gray-500">{type.description}</div>}
                        </div>
                      </div>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCategoryType(type.id)}
                                disabled={isInUse}
                                className={isInUse ? 'opacity-50 cursor-not-allowed' : ''}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isInUse ? 'Cannot delete: Remove all categories from this type first' : 'Delete type'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  );
                })}

                {categoryTypes.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No category types found. Create one to get started.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel onClick={() => setIsAddingType(false)}>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const renderCategoryTypes = () => (
    <div className="mt-4 border-t pt-4">
      <h3 className="font-medium mb-2">Category Types</h3>
      <div className="space-y-2">
        {categoryTypes.map((type) => {
          const isInUse = [...categories, ...allCategories].some((cat) => cat.type === type.id);
          return (
            <div key={type.id} className="flex items-center justify-between">
              <div className="flex items-center">
                {React.createElement(
                  iconOptions.find((icon) => icon.value === type.icon)?.icon || Circle,
                  {
                    className: 'h-5 w-5 mr-2',
                    style: { color: type.color },
                  }
                )}
                <span>{type.name}</span>
                {isInUse && <span className="text-xs text-gray-500 ml-2">(In use)</span>}
              </div>
              {!isInUse && (
                <Button variant="ghost" size="sm" onClick={() => handleDeleteCategoryType(type.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="ml-2">
            <ChartNoAxesGantt className="mr-2 h-4 w-4" /> Categories
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="overflow-y-auto w-full max-w-[90vw] sm:max-w-[600px] md:max-w-[725px]">
          <SheetHeader className="mb-6">
            <div className="flex items-center gap-2">
              <SheetTitle>Manage Categories</SheetTitle>
              <PermissionIndicator type="STAFF" />
            </div>
            <SheetDescription>
              Create and manage your custom categories for tracking student progress.
            </SheetDescription>
          </SheetHeader>

          {/* Staff selector */}
          {hasSuperAdminAccess() && (
            <div className="mb-6 mt-2">
              <div className="flex items-center gap-2 mb-2">
                <UserPlus className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Managing categories for:</span>
                <PermissionIndicator type="SUPER_ADMIN" />
              </div>
              <Select
                value={selectedStaffKey}
                onValueChange={setSelectedStaffKey}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staffList.map((staff) => (
                    <SelectItem key={staff.email_key} value={staff.email_key}>
                      <div className="flex items-center justify-between w-full">
                        <span>{staff.firstName} {staff.lastName}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {staff.email}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {notification.message && (
            <div className={`p-2 rounded ${notification.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {notification.message}
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            {activeTab !== 'new' && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOrganizationMethod('type')}
                  className={organizationMethod === 'type' ? 'bg-primary text-white' : ''}
                >
                  <Grid2X2 className="h-4 w-4 mr-2" />
                  By Type
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOrganizationMethod('name')}
                  className={organizationMethod === 'name' ? 'bg-primary text-white' : ''}
                >
                  <ListFilter className="h-4 w-4 mr-2" />
                  By Name
                </Button>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingType(true)}
              className={activeTab === 'new' ? 'ml-auto' : ''}
            >
              <ChartNoAxesGantt className="h-4 w-4 mr-2" />
              Types Manager
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="active">My Active</TabsTrigger>
              <TabsTrigger value="archived">My Archived</TabsTrigger>
              <TabsTrigger value="all">All Categories</TabsTrigger>
            </TabsList>

            <TabsContent value="new">{renderNewCategoryContent()}</TabsContent>
            <TabsContent value="active">
              <div className="space-y-4">
                {organizationMethod === 'type' ? renderCategoryByType(false) : renderCategoryList(false)}
              </div>
            </TabsContent>
            <TabsContent value="archived">
              {organizationMethod === 'type' ? renderCategoryByType(true) : renderCategoryList(true)}
            </TabsContent>
            <TabsContent value="all">
              <div className="space-y-4">
                {organizationMethod === 'type' ? renderAllCategoriesByType() : renderAllCategoriesList()}
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      {renderAddTypeDialog()}
    </>
  );
};

export default CategoryManager;
