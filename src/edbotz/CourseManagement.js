// CourseManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  getDatabase, 
  ref, 
  onValue, 
  push, 
  remove, 
  update, 
  get 
} from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Trash2, 
  FileEdit, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  GraduationCap,
  BookOpen,
  School,
  Bot,
  LayoutGrid,
  Library
} from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import CourseUnitsManagement from './CourseUnitsManagement';

const DEFAULT_COURSE = {
  id: 'courseless-assistants',
  title: 'Courseless Assistants',
  description: 'Central hub for managing standalone content that can be used across all courses.',
  isDefault: true,
  grade: 'N/A'
};

// CourseHeader Component
const CourseHeader = ({ course, onEditCourse, onDeleteCourse }) => {
  const [showDescription, setShowDescription] = useState(false);
  const isDefaultCourse = course.id === DEFAULT_COURSE.id;

  const descriptionClasses = `
    pt-4 prose prose-sm max-w-none
    prose-p:my-3 prose-p:leading-relaxed
    prose-ul:my-3 prose-ul:list-disc prose-ul:pl-6 prose-ul:list-outside
    prose-ol:my-3 prose-ol:list-decimal prose-ol:pl-6 prose-ol:list-outside
    prose-li:my-1 prose-li:leading-relaxed prose-li:pl-2
    prose-headings:font-semibold prose-headings:text-gray-900
    prose-a:text-blue-600 prose-a:font-medium prose-a:underline
    prose-a:decoration-blue-300 hover:prose-a:decoration-blue-500
    prose-em:text-gray-700 prose-em:font-medium
  `.trim();

  return (
    <div className="space-y-4">
      <div className={`bg-gradient-to-r ${
        isDefaultCourse 
          ? 'from-purple-50 to-indigo-50 border-purple-100' 
          : 'from-blue-50 to-indigo-50 border-blue-100'
      } rounded-lg border`}>
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                {isDefaultCourse ? (
                  <Bot className="w-5 h-5" />
                ) : (
                  <LayoutGrid className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">
                  {isDefaultCourse ? 'Global Content' : 'Course Overview'}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
              {!isDefaultCourse && (
                <p className="text-gray-600">Section: {course.grade || 'Not specified'}</p>
              )}
            </div>
            <div className="flex gap-2">
              {!isDefaultCourse && (
                <>
                  <Button variant="outline" onClick={onEditCourse}>
                    <FileEdit className="w-4 h-4 mr-2" /> Edit Course
                  </Button>
                  <Button variant="destructive" onClick={onDeleteCourse}>
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Course
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                onClick={() => setShowDescription(!showDescription)}
              >
                {showDescription ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {showDescription && course.description && (
          <div className={`px-6 pb-6 border-t ${
            isDefaultCourse ? 'border-purple-100' : 'border-blue-100'
          }`}>
            <div 
              className={descriptionClasses}
              dangerouslySetInnerHTML={{ __html: course.description }} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

const CourseManagement = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState({});
  const [courseData, setCourseData] = useState({
    title: '',
    grade: '',
    description: ''
  });
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline',
    'list', 'bullet', 'indent',
    'link'
  ];

  useEffect(() => {
    if (!user) return;

    const db = getDatabase();
    const coursesRef = ref(db, `edbotz/courses/${user.uid}`);

    const unsubscribe = onValue(coursesRef, (snapshot) => {
      const data = snapshot.val() || {};
      // Always include the default course
      setCourses({
        [DEFAULT_COURSE.id]: DEFAULT_COURSE,
        ...data
      });
    });

    return () => unsubscribe();
  }, [user]);

  const handleOpenDialog = (courseId = null) => {
    if (courseId === DEFAULT_COURSE.id) return; // Prevent editing default course
    
    if (courseId) {
      setEditingCourseId(courseId);
      setCourseData({
        ...courses[courseId]
      });
    } else {
      setEditingCourseId(null);
      setCourseData({
        title: '',
        grade: '',
        description: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCourseId(null);
    setCourseData({
      title: '',
      grade: '',
      description: ''
    });
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!courseData.title.trim()) return;

    const db = getDatabase();
    const coursesRef = ref(db, `edbotz/courses/${user.uid}`);

    try {
      const courseDataToSave = {
        ...courseData,
        updatedAt: new Date().toISOString()
      };

      if (editingCourseId) {
        const courseRef = ref(db, `edbotz/courses/${user.uid}/${editingCourseId}`);
        await update(courseRef, courseDataToSave);
      } else {
        await push(coursesRef, {
          ...courseDataToSave,
          createdAt: new Date().toISOString(),
        });
      }

      handleCloseDialog();
    } catch (error) {
      console.error("Error saving course:", error);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (courseId === DEFAULT_COURSE.id) return; // Prevent deleting default course
    
    const db = getDatabase();
    const courseRef = ref(db, `edbotz/courses/${user.uid}/${courseId}`);

    try {
      await remove(courseRef);
      setShowDeleteDialog(false);
      setCourseToDelete(null);
      if (selectedCourseId === courseId) {
        setSelectedCourseId(null);
      }
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  const handleSelectCourse = (courseId) => {
    setSelectedCourseId(courseId);
  };

  // Helper function to group courses by grade
  const getGroupedCourses = () => {
    const grouped = {};
    Object.entries(courses).forEach(([id, course]) => {
      if (id === DEFAULT_COURSE.id) return; // Skip default course in grouping
      const grade = course.grade || 'Ungraded';
      if (!grouped[grade]) {
        grouped[grade] = [];
      }
      grouped[grade].push({ id, ...course });
    });
    return grouped;
  };

  const groupedCourses = getGroupedCourses();

  return (
    <div className="p-6 mx-auto">
      <div className="flex gap-6">
        {/* Left Sidebar - Course List */}
        <div className="w-80 flex-shrink-0 mt-12">
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-600">
                  <School className="w-5 h-5" />
                  <CardTitle className="text-lg">Courses</CardTitle>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={() => handleOpenDialog()}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all duration-200"
                      >
                        <Plus className="w-4 h-4 mr-2" /> Create Course
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Create a new course</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Default Course Always First */}
                <div className="space-y-1">
                  <div
                    onClick={() => handleSelectCourse(DEFAULT_COURSE.id)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-200 group ${
                      selectedCourseId === DEFAULT_COURSE.id
                        ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-500'
                        : 'hover:bg-gray-50 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Bot className={`w-4 h-4 ${
                        selectedCourseId === DEFAULT_COURSE.id ? 'text-purple-500' : 'text-gray-400'
                      }`} />
                      <span className="text-sm font-medium">{DEFAULT_COURSE.title}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${
                      selectedCourseId === DEFAULT_COURSE.id ? 'text-purple-500 transform translate-x-1' : 'text-gray-400'
                    }`} />
                  </div>
                </div>

                {/* Regular Courses Grouped by Grade */}
                {Object.entries(groupedCourses).map(([grade, gradeCoursesArray]) => (
                  <div key={grade} className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <GraduationCap className="w-4 h-4" />
                      <h3 className="font-medium text-sm">{grade}</h3>
                    </div>
                    <div className="space-y-1">
                      {gradeCoursesArray.map((course) => (
                        <div
                          key={course.id}
                          onClick={() => handleSelectCourse(course.id)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-200 group ${
                            selectedCourseId === course.id
                              ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                              : 'hover:bg-gray-50 border-l-4 border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <BookOpen className={`w-4 h-4 ${
                              selectedCourseId === course.id ? 'text-blue-500' : 'text-gray-400'
                            }`} />
                            <span className="text-sm font-medium">{course.title}</span>
                          </div>
                          <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${
                            selectedCourseId === course.id ? 'text-blue-500 transform translate-x-1' : 'text-gray-400'
                          }`} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {selectedCourseId ? (
            selectedCourseId === DEFAULT_COURSE.id ? (
              // Render only the course header for default course
              <CourseHeader 
                course={DEFAULT_COURSE}
                onEditCourse={null}
                onDeleteCourse={null}
              />
            ) : (
              // Regular course management with units
              <CourseUnitsManagement 
                courseId={selectedCourseId} 
                course={{
                  id: selectedCourseId,
                  ...(courses[selectedCourseId] || {})
                }}
                onEditCourse={() => handleOpenDialog(selectedCourseId)}
                onDeleteCourse={() => {
                  setCourseToDelete(selectedCourseId);
                  setShowDeleteDialog(true);
                }}
              />
            )
          ) : (
            <div className="text-center mt-12 p-8 rounded-lg border-2 border-dashed border-gray-200">
              <School className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Select a Course</h3>
              <p className="text-gray-500">Choose a course from the list to view and manage its contents</p>
            </div>
          )}
        </div>
      </div>

      {/* Course Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <School className="w-5 h-5 text-blue-600" />
              {editingCourseId ? 'Edit Course' : 'Create New Course'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveCourse}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={courseData.title}
                  onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter course title"
                  className="border-gray-200 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <Label htmlFor="grade">Section</Label>
                <Input
                  id="grade"
                  value={courseData.grade}
                  onChange={(e) => setCourseData(prev => ({ ...prev, grade: e.target.value }))}
                  placeholder="Enter grade level"
                  className="border-gray-200 focus:ring-blue-500"
                />
              </div>
              <div className="pb-8">
                <Label>Course Description</Label>
                <ReactQuill
                  theme="snow"
                  value={courseData.description}
                  onChange={(content) => setCourseData(prev => ({ ...prev, description: content }))}
                  modules={modules}
                  formats={formats}
                  className="h-[150px] [&_.ql-toolbar]:border-gray-200 [&_.ql-container]:border-gray-200
                    [&_.ql-editor]:min-h-[100px] [&_.ql-editor]:prose [&_.ql-editor]:prose-sm
                    [&_.ql-editor_ul]:list-disc [&_.ql-editor_ul]:pl-6
                    [&_.ql-editor_ol]:list-decimal [&_.ql-editor_ol]:pl-6
                    [&_.ql-editor_li]:my-0 [&_.ql-editor_li]:leading-relaxed
                    [&_.ql-editor_p]:my-3 [&_.ql-editor_p]:leading-relaxed"
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {editingCourseId ? 'Save Changes' : 'Create Course'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              Delete Course
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the course
              and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteCourse(courseToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Course
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CourseManagement;
