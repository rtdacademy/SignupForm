import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Plus, Loader2, BookOpen, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { albertaCourses, getAlbertaCourseById } from '../../config/albertaCourses';
import { addAlbertaCourse, addOtherCourse } from '../../utils/courseManagementUtils';

/**
 * Interface for adding courses to a student
 * @param {string} familyId - The family ID
 * @param {string} schoolYear - The school year (e.g., "25_26")
 * @param {number} studentId - The student ID (timestamp)
 * @param {string} studentName - The name of the student
 * @param {function} onCourseAdded - Callback after course is added
 */
const AddCourseInterface = ({ familyId, schoolYear, studentId, studentName, onCourseAdded }) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('alberta');

  // Alberta course selection state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  // Other course form state
  const [otherCourseForm, setOtherCourseForm] = useState({
    courseName: '',
    courseCode: '',
    category: '',
    grade: '',
    credits: '',
    description: '',
    forCredit: true,
  });

  const [formErrors, setFormErrors] = useState({});

  const handleAddAlbertaCourse = async () => {
    if (!selectedCategory || !selectedCourse) {
      alert('Please select both a category and a course');
      return;
    }

    setSaving(true);
    try {
      await addAlbertaCourse(familyId, schoolYear, studentId, selectedCategory, selectedCourse);

      // Notify parent component
      if (onCourseAdded) {
        onCourseAdded();
      }

      // Reset and close
      setSelectedCategory('');
      setSelectedCourse('');
      setOpen(false);
    } catch (error) {
      console.error('Error adding Alberta course:', error);
      alert('Failed to add course. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const validateOtherCourseForm = () => {
    const errors = {};

    if (!otherCourseForm.courseName.trim()) {
      errors.courseName = 'Course name is required';
    }

    if (!otherCourseForm.courseCode.trim()) {
      errors.courseCode = 'Course code is required';
    }

    if (!otherCourseForm.category.trim()) {
      errors.category = 'Category is required';
    }

    if (!otherCourseForm.grade.trim()) {
      errors.grade = 'Grade level is required';
    }

    if (!otherCourseForm.credits.trim()) {
      errors.credits = 'Credits are required';
    } else if (isNaN(Number(otherCourseForm.credits))) {
      errors.credits = 'Credits must be a number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddOtherCourse = async () => {
    if (!validateOtherCourseForm()) {
      return;
    }

    setSaving(true);
    try {
      const courseData = {
        courseName: otherCourseForm.courseName.trim(),
        courseCode: otherCourseForm.courseCode.trim(),
        category: otherCourseForm.category.trim(),
        grade: otherCourseForm.grade.trim(),
        credits: otherCourseForm.credits.trim(),
        description: otherCourseForm.description.trim(),
        forCredit: otherCourseForm.forCredit,
      };

      await addOtherCourse(familyId, schoolYear, studentId, courseData);

      // Notify parent component
      if (onCourseAdded) {
        onCourseAdded();
      }

      // Reset and close
      setOtherCourseForm({
        courseName: '',
        courseCode: '',
        category: '',
        grade: '',
        credits: '',
        description: '',
        forCredit: true,
      });
      setFormErrors({});
      setOpen(false);
    } catch (error) {
      console.error('Error adding other course:', error);
      alert('Failed to add course. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const availableCourses = selectedCategory
    ? albertaCourses[selectedCategory]?.courses || []
    : [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Course
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Course for {studentName}</DialogTitle>
          <DialogDescription>
            Add an Alberta curriculum course or a custom course
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="alberta" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Alberta Course
            </TabsTrigger>
            <TabsTrigger value="other" className="gap-2">
              <FileText className="w-4 h-4" />
              Other Course
            </TabsTrigger>
          </TabsList>

          {/* Alberta Course Tab */}
          <TabsContent value="alberta" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="category">Course Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(albertaCourses).map(([key, subject]) => (
                    <SelectItem key={key} value={key}>
                      {subject.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCategory && (
              <div>
                <Label htmlFor="course">Course</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name} - {course.credits} credit(s) - Grade {course.grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedCourse && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                {(() => {
                  const course = getAlbertaCourseById(selectedCourse);
                  return course ? (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">{course.name}</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        {course.code && <p><strong>Code:</strong> {course.code}</p>}
                        <p><strong>Credits:</strong> {course.credits}</p>
                        <p><strong>Grade:</strong> {course.grade}</p>
                        {course.description && <p className="mt-2">{course.description}</p>}
                        {course.prerequisite && (
                          <p className="text-xs text-orange-600">
                            <strong>Prerequisite:</strong> {course.prerequisite}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button
                onClick={handleAddAlbertaCourse}
                disabled={!selectedCategory || !selectedCourse || saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Course'
                )}
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* Other Course Tab */}
          <TabsContent value="other" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="courseName">Course Name *</Label>
              <Input
                id="courseName"
                value={otherCourseForm.courseName}
                onChange={(e) =>
                  setOtherCourseForm({ ...otherCourseForm, courseName: e.target.value })
                }
                placeholder="e.g., Advanced Pottery"
                className={formErrors.courseName ? 'border-red-500' : ''}
              />
              {formErrors.courseName && (
                <p className="text-xs text-red-600 mt-1">{formErrors.courseName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="courseCode">Course Code *</Label>
              <Input
                id="courseCode"
                value={otherCourseForm.courseCode}
                onChange={(e) =>
                  setOtherCourseForm({ ...otherCourseForm, courseCode: e.target.value })
                }
                placeholder="e.g., ART2000"
                className={formErrors.courseCode ? 'border-red-500' : ''}
              />
              {formErrors.courseCode && (
                <p className="text-xs text-red-600 mt-1">{formErrors.courseCode}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={otherCourseForm.category}
                  onChange={(e) =>
                    setOtherCourseForm({ ...otherCourseForm, category: e.target.value })
                  }
                  placeholder="e.g., Fine Arts"
                  className={formErrors.category ? 'border-red-500' : ''}
                />
                {formErrors.category && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.category}</p>
                )}
              </div>

              <div>
                <Label htmlFor="grade">Grade *</Label>
                <Input
                  id="grade"
                  value={otherCourseForm.grade}
                  onChange={(e) =>
                    setOtherCourseForm({ ...otherCourseForm, grade: e.target.value })
                  }
                  placeholder="e.g., 10"
                  className={formErrors.grade ? 'border-red-500' : ''}
                />
                {formErrors.grade && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.grade}</p>
                )}
              </div>

              <div>
                <Label htmlFor="credits">Credits *</Label>
                <Input
                  id="credits"
                  value={otherCourseForm.credits}
                  onChange={(e) =>
                    setOtherCourseForm({ ...otherCourseForm, credits: e.target.value })
                  }
                  placeholder="e.g., 5"
                  className={formErrors.credits ? 'border-red-500' : ''}
                />
                {formErrors.credits && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.credits}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={otherCourseForm.description}
                onChange={(e) =>
                  setOtherCourseForm({ ...otherCourseForm, description: e.target.value })
                }
                placeholder="Course description..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="forCredit"
                checked={otherCourseForm.forCredit}
                onCheckedChange={(checked) =>
                  setOtherCourseForm({ ...otherCourseForm, forCredit: checked })
                }
              />
              <Label htmlFor="forCredit" className="cursor-pointer">
                This course is for credit
              </Label>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleAddOtherCourse} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Course'
                )}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddCourseInterface;
