import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { X, Plus, Archive, Trash2, RotateCcw, Circle, Square, Triangle, BookOpen, GraduationCap, Trophy, Target, ClipboardCheck, Brain, Lightbulb, Clock, Calendar, BarChart, TrendingUp, AlertCircle, HelpCircle, MessageCircle, Users, Presentation, FileText, Bookmark, UserMinus } from 'lucide-react';
import { getDatabase, ref, set, onValue, update, remove } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../context/AuthContext';

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
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', color: '', icon: '' });
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const { user_email_key } = useAuth();
  
  // State for custom notification
  const [notification, setNotification] = useState({ message: '', type: '' });

  // Function to show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000); // Hide after 3 seconds
  };

  useEffect(() => {
    if (!user_email_key) return;

    const db = getDatabase();
    const categoriesRef = ref(db, `teacherCategories/${user_email_key}`);
    
    const unsubscribe = onValue(categoriesRef, (snapshot) => {
      if (snapshot.exists()) {
        const categoriesData = snapshot.val();
        const categoriesArray = Object.entries(categoriesData).map(([id, data]) => ({ id, ...data }));
        setCategories(categoriesArray);
        onCategoryChange(categoriesArray.filter(cat => !cat.archived));
      } else {
        setCategories([]);
        onCategoryChange([]);
      }
    });

    return () => unsubscribe();
  }, [user_email_key, onCategoryChange]);

  const handleAddCategory = () => {
    if (newCategory.name && newCategory.color && newCategory.icon && user_email_key) {
      const db = getDatabase();
      const newCategoryRef = ref(db, `teacherCategories/${user_email_key}/${Date.now()}`);
      set(newCategoryRef, { ...newCategory, archived: false });
      setNewCategory({ name: '', color: '', icon: '' });
      showNotification("Category added successfully");
    }
  };

  const handleCategoryAction = async (categoryId, action) => {
    if (user_email_key) {
      const db = getDatabase();
      const categoryRef = ref(db, `teacherCategories/${user_email_key}/${categoryId}`);
  
      if (action === 'delete' || action === 'removeFromStudents') {
        showNotification(action === 'delete' ? "Deleting category..." : "Removing category from students...", "info");
  
        if (action === 'delete') {
          try {
            await remove(categoryRef);
            console.log(`Category ${categoryId} deleted locally`);
          } catch (error) {
            console.error('Error deleting category locally:', error);
            showNotification("Error deleting category locally", "error");
            return;
          }
        }
  
        const functions = getFunctions();
        const deleteCategoryForStudents = httpsCallable(functions, 'deleteCategoryForStudents');
        try {
          console.log(`Calling cloud function to ${action === 'delete' ? 'delete' : 'remove'} category ${categoryId} for students`);
          const result = await deleteCategoryForStudents({ 
            categoryId, 
            teacherEmailKey: user_email_key,
            action
          });
          
          console.log('Cloud function response:', result.data);
          
          const { affectedStudents, message } = result.data;
          if (affectedStudents > 0) {
            showNotification(`Category ${action === 'delete' ? 'deleted' : 'removed'}. ${affectedStudents} student${affectedStudents !== 1 ? 's were' : ' was'} affected.`);
          } else {
            showNotification(`Category ${action === 'delete' ? 'deleted' : 'removed'}. No students were affected.`);
          }
          
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
          console.log(`Category ${categoryId} ${action}d locally`);
          showNotification(`Category ${action}d successfully`);
        } catch (error) {
          console.error(`Error ${action}ing category:`, error);
          showNotification(`Error ${action}ing category`, "error");
        }
      }
    }
  };

  const renderCategoryList = (archived) => (
    <div className="max-h-[200px] overflow-y-auto">
      {categories
        .filter((category) => category.archived === archived)
        .map((category) => (
          <div key={category.id} className="flex items-center justify-between py-2">
            <div className="flex items-center">
              {iconOptions.find(icon => icon.value === category.icon) && 
                React.createElement(iconOptions.find(icon => icon.value === category.icon).icon, { 
                  className: "mr-2 h-5 w-5", 
                  style: { color: category.color }
                })}
              <span>{category.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                {archived ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCategoryAction(category.id, 'unarchive')}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Unarchive: Make this category visible again. Students who previously had this category will regain access to it.</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCategoryAction(category.id, 'archive')}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Archive: Hide this category from view. It can be unarchived later. Students will retain the category.</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove category from all students?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove the category from all students but keep it in your {archived ? 'archived' : ''} list. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction asChild>
                            <Button onClick={() => handleCategoryAction(category.id, 'removeFromStudents')}>
                              Remove
                            </Button>
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Remove from Students: Remove this category from all students without deleting it from your list</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCategoryToDelete(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the category and remove it from all students.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>Cancel</AlertDialogCancel>
                          <AlertDialogAction asChild>
                            <Button onClick={() => handleCategoryAction(category.id, 'delete')}>
                              Delete
                            </Button>
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete: Permanently remove this category from your list and remove it from all students</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        ))}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <Plus className="mr-2 h-4 w-4" /> Categories
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription>Create, edit, archive, or delete your custom categories for tracking student progress.</DialogDescription>
        </DialogHeader>
        {/* Custom notification */}
        {notification.message && (
          <div className={`p-2 mb-4 rounded ${notification.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {notification.message}
          </div>
        )}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            <div className="grid gap-4 py-4">
              <Input
                id="name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Category Name"
              />
              <Select
                value={newCategory.color}
                onValueChange={(value) => setNewCategory({ ...newCategory, color: value })}
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
              <Select
                value={newCategory.icon}
                onValueChange={(value) => setNewCategory({ ...newCategory, icon: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an icon">
                    {newCategory.icon && (
                      <div className="flex items-center">
                        {React.createElement(iconOptions.find(icon => icon.value === newCategory.icon).icon, { className: "h-4 w-4 mr-2" })}
                        {iconOptions.find(icon => icon.value === newCategory.icon).label}
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <div className="grid grid-cols-3 gap-2 p-2">
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value}>
                        <div className="flex flex-col items-center justify-center">
                          {React.createElement(icon.icon, { className: "h-6 w-6 mb-1" })}
                          <span className="text-xs text-center">{icon.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
              <Button onClick={handleAddCategory} disabled={!newCategory.name || !newCategory.color || !newCategory.icon}>
                <Plus className="mr-2 h-4 w-4" /> Add Category
              </Button>
            </div>
            {renderCategoryList(false)}
          </TabsContent>
          <TabsContent value="archived">
            {renderCategoryList(true)}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryManager;