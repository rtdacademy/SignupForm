import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

/**
 * Confirmation dialog for removing a course from a student
 * @param {boolean} open - Whether the dialog is open
 * @param {function} onOpenChange - Callback when dialog open state changes
 * @param {function} onConfirm - Callback when removal is confirmed
 * @param {Object} course - The course object to be removed
 * @param {string} studentName - The name of the student
 */
const RemoveCourseDialog = ({ open, onOpenChange, onConfirm, course, studentName }) => {
  if (!course) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Remove Course?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              You are about to remove the following course from <strong>{studentName}</strong>:
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1">
              <p className="font-semibold text-gray-900">{course.name}</p>
              {course.code && course.code !== 'N/A' && (
                <p className="text-sm text-gray-600">Code: {course.code}</p>
              )}
              {course.credits && (
                <p className="text-sm text-gray-600">Credits: {course.credits}</p>
              )}
              {course.grade && (
                <p className="text-sm text-gray-600">Grade: {course.grade}</p>
              )}
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This action cannot be undone. Any course status data
                (committed status, PASI registration, marks) will also be removed.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            Remove Course
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RemoveCourseDialog;
