import React from 'react';
import { getDatabase, ref, remove } from 'firebase/database';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

const DeleteCourseDialog = ({ 
  isOpen, 
  setIsOpen, 
  courseId, 
  courseTitle,
  onDeleteComplete 
}) => {
  const handleDelete = async () => {
    try {
      const db = getDatabase();
      const courseRef = ref(db, `courses/${courseId}`);
      await remove(courseRef);
      onDeleteComplete();
      setIsOpen(false);
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('An error occurred while deleting the course.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Course</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this course? This action cannot be undone. 
            This will permanently delete "{courseTitle}" and remove all associated data.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex space-x-2 justify-end">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            Delete Course
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCourseDialog;