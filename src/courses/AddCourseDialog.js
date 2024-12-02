import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, set } from 'firebase/database';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { FaPlus } from 'react-icons/fa';

const AddCourseDialog = () => {
  const [open, setOpen] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseType, setCourseType] = useState('');
  const [isModern, setIsModern] = useState(false);
  const [courseId, setCourseId] = useState('');
  const [error, setError] = useState('');
  const [existingCourseIds, setExistingCourseIds] = useState(new Set());

  // Fetch existing course IDs when dialog opens
  useEffect(() => {
    if (open) {
      const fetchCourseIds = async () => {
        const db = getDatabase();
        const coursesRef = ref(db, 'courses');
        const snapshot = await get(coursesRef);
        if (snapshot.exists()) {
          const courses = snapshot.val();
          const ids = new Set(
            Object.keys(courses)
              .filter(id => id !== 'Sections')
              .map(id => parseInt(id))
          );
          setExistingCourseIds(ids);
          
          // Suggest next available course ID
          const suggestedId = isModern ? 
            findNextAvailableId(ids, 100) : 
            findNextAvailableId(ids, 1);
          setCourseId(suggestedId.toString());
        }
      };
      fetchCourseIds();
    }
  }, [open, isModern]);

  // Find next available ID based on a starting number
  const findNextAvailableId = (existingIds, startFrom) => {
    let id = startFrom;
    while (existingIds.has(id)) {
      id++;
    }
    return id;
  };

  const validateCourseId = (id) => {
    const numId = parseInt(id);
    if (isNaN(numId)) return 'Course ID must be a number';
    if (numId < 1) return 'Course ID must be positive';
    if (isModern && numId < 100) return 'Modern course IDs must be 100 or greater';
    if (!isModern && numId >= 100) return 'Traditional course IDs must be less than 100';
    if (existingCourseIds.has(numId)) return 'This course ID already exists';
    return '';
  };

  const handleCreateCourse = async () => {
    const validationError = validateCourseId(courseId);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const db = getDatabase();
      const courseRef = ref(db, `courses/${courseId}`);
      
      // Basic course structure
      const courseData = {
        Title: courseTitle,
        CourseType: courseType,
        modernCourse: isModern,
        Active: 'Current',
        units: [],
        Created: new Date().toISOString(),
        Modified: new Date().toISOString()
      };

      // Set the course data with specific course ID
      await set(courseRef, courseData);
      
      // Reset form and close dialog
      setCourseTitle('');
      setCourseType('');
      setIsModern(false);
      setCourseId('');
      setError('');
      setOpen(false);
    } catch (error) {
      console.error('Error creating course:', error);
      setError('An error occurred while creating the course.');
    }
  };

  // Handle course version change
  const handleVersionChange = (value) => {
    const newIsModern = value === "modern";
    setIsModern(newIsModern);
    
    // Suggest new course ID based on version
    const suggestedId = newIsModern ? 
      findNextAvailableId(existingCourseIds, 100) : 
      findNextAvailableId(existingCourseIds, 1);
    setCourseId(suggestedId.toString());
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">
          <FaPlus className="mr-2" /> Add New Course
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Enter the details for your new course. Modern courses include updated content and features.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="courseId" className="text-right">
              Course ID
            </Label>
            <Input
              id="courseId"
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value);
                setError(validateCourseId(e.target.value));
              }}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select
              value={courseType}
              onValueChange={setCourseType}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select course type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Math">Math</SelectItem>
                <SelectItem value="Science">Science</SelectItem>
                <SelectItem value="Option">Option</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="version" className="text-right">
              Version
            </Label>
            <Select
              value={isModern ? "modern" : "original"}
              onValueChange={handleVersionChange}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="original">Original</SelectItem>
                <SelectItem value="modern">Modern</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && (
            <div className="text-red-500 text-sm mt-2">
              {error}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleCreateCourse}
            disabled={!!error || !courseId || !courseTitle || !courseType}
          >
            Create Course
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCourseDialog;