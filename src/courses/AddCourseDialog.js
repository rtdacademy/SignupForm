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
  const [courseVersion, setCourseVersion] = useState('original');
  const [courseId, setCourseId] = useState('');
  const [error, setError] = useState('');
  const [existingCourseIds, setExistingCourseIds] = useState(new Set());
  const [nextAvailableId, setNextAvailableId] = useState('');

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
              .filter(id => id !== 'sections')
              .map(id => parseInt(id))
          );
          setExistingCourseIds(ids);

          // Calculate next available ID for suggestion
          const nextId = findNextAvailableId(ids, 1);
          setNextAvailableId(nextId.toString());
          
          // Set suggested ID as default if courseId is empty
          if (!courseId) {
            setCourseId(nextId.toString());
          }
        }
      };
      fetchCourseIds();
    }
  }, [open]);

  // Find next available ID based on a starting number
  const findNextAvailableId = (existingIds, startFrom) => {
    let id = startFrom;
    while (existingIds.has(id)) {
      id++;
    }
    return id;
  };

  const validateForm = () => {
    if (!courseTitle.trim()) return 'Course title is required';
    if (!courseType) return 'Course type is required';
    if (!courseVersion) return 'Course version is required';
    if (!courseId.trim()) return 'Course ID is required';
    
    // Validate course ID is numeric
    const numericId = parseInt(courseId);
    if (isNaN(numericId) || numericId <= 0) {
      return 'Course ID must be a positive number';
    }
    
    // Check for duplicate course ID
    if (existingCourseIds.has(numericId)) {
      return `Course ID ${courseId} already exists. Please choose a different ID.`;
    }
    
    return '';
  };

  const handleCreateCourse = async () => {
    const validationError = validateForm();
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
        modernCourse: courseVersion === 'modern',
        firebaseCourse: courseVersion === 'firebase',
        Active: 'Current',
        LMSCourseID: courseId,
        units: [],
        Created: new Date().toISOString(),
        Modified: new Date().toISOString()
      };

      // Set the course data with next available course ID
      await set(courseRef, courseData);

      // Reset form and close dialog
      setCourseTitle('');
      setCourseType('');
      setCourseVersion('original');
      setCourseId('');
      setError('');
      setOpen(false);
    } catch (error) {
      console.error('Error creating course:', error);
      setError('An error occurred while creating the course.');
    }
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
            Enter the details for your new course. Choose a unique course ID number.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="courseId" className="text-right">
              Course ID
            </Label>
            <Input
              id="courseId"
              type="number"
              min="1"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              placeholder={`Suggested: ${nextAvailableId || '...'}`}
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
              value={courseVersion}
              onValueChange={setCourseVersion}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="original">Original</SelectItem>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="firebase">Firebase</SelectItem>
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
            disabled={!courseTitle || !courseType || !courseId}
          >
            Create Course
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCourseDialog;
