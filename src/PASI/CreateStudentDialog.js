import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { toast } from 'sonner';
import { getDatabase, ref, get, update, set } from 'firebase/database';
import { STATUS_OPTIONS, STUDENT_TYPE_OPTIONS } from '../config/DropdownOptions';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { useAuth } from '../context/AuthContext';
import { parseStudentKeyFromSummaryKey, formatSchoolYearWithSlash } from '../utils/pasiLinkUtils';

// Helper to parse a student's full name (assumed to be "LastName, FirstName")
const parseStudentName = (fullName) => {
  if (!fullName) return { firstName: '', lastName: '' };
  const parts = fullName.split(',');
  if (parts.length < 2) return { firstName: fullName.trim(), lastName: '' };
  return { lastName: parts[0].trim(), firstName: parts[1].trim() };
};

const CreateStudentDialog = ({ isOpen, onClose, record }) => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [useAsn, setUseAsn] = useState(false);
  const [status, setStatus] = useState(STATUS_OPTIONS[0]?.value || '');
  const [studentType, setStudentType] = useState(STUDENT_TYPE_OPTIONS[0]?.value || '');
  const [comment, setComment] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [courses, setCourses] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdStudentKey, setCreatedStudentKey] = useState(null);

  // Reset form when dialog opens with a new record
  useEffect(() => {
    if (isOpen && record) {
      setEmail('');
      setUseAsn(false);
      // Ensure these never get set to empty strings
      setStatus(STATUS_OPTIONS[0]?.value || 'active');
      setStudentType(STUDENT_TYPE_OPTIONS[0]?.value || 'regular');
      setComment('');
      setSelectedCourse('');
      setIsSuccess(false);
      setCreatedStudentKey(null);
    }
  }, [isOpen, record]);

  // Fetch courses from Firebase
  useEffect(() => {
    if (!isOpen) return;

    const fetchCourses = async () => {
      try {
        const db = getDatabase();
        const coursesRef = ref(db, 'courses');
        const snapshot = await get(coursesRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const coursesArray = [];
          for (const key in data) {
            if (key === 'sections') continue;
            coursesArray.push({ id: key, ...data[key] });
          }
          setCourses(coursesArray);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to load courses");
      }
    };

    fetchCourses();
  }, [isOpen]);

  const handleCreateStudent = async () => {
    if (!record) return;
    
    if (!selectedCourse) {
      toast.error("Please select a course");
      return;
    }
    
    if (!useAsn && !email) {
      toast.error("Please enter an email address or use ASN");
      return;
    }
    
    // Ensure we have non-empty values for these fields
    const currentStudentType = studentType || STUDENT_TYPE_OPTIONS[0]?.value || 'regular';
    const currentStatus = status || STATUS_OPTIONS[0]?.value || 'active';
    
    setIsCreating(true);
    
    try {
      // Get all necessary data
      let studentKey;
      if (useAsn) {
        studentKey = record.asn.replace(/-/g, '');
      } else {
        studentKey = sanitizeEmail(email);
      }
      
      const { firstName, lastName } = parseStudentName(record.studentName);
      const schoolYearWithSlash = formatSchoolYearWithSlash(record.schoolYear);
      const course = courses.find(c => c.id === selectedCourse);
      
      if (!course) {
        throw new Error("Selected course not found");
      }
      
      // Generate a unique ID for the note
      const noteId = `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Determine if course should be active or archived
      const activeOrArchived = (status === 'Course Completed' || status === 'Unenrolled') 
        ? 'Archived' 
        : 'Active';
      
      // Current timestamp in ISO format
      const timestamp = new Date().toISOString();
      
      // Create updates object for all paths
      const db = getDatabase();
      const updates = {};
      
      // Student profile
      updates[`students/${studentKey}/profile/asn`] = record.asn;
      updates[`students/${studentKey}/profile/firstName`] = firstName;
      updates[`students/${studentKey}/profile/lastName`] = lastName;
      
      // Add student email if using email mode (not ASN mode)
      if (!useAsn && email) {
        updates[`students/${studentKey}/profile/StudentEmail`] = email;
      }
      
      // Course information
      updates[`students/${studentKey}/courses/${selectedCourse}/Course/Value`] = course.Title;
      updates[`students/${studentKey}/courses/${selectedCourse}/CourseID`] = parseInt(selectedCourse, 10);
      updates[`students/${studentKey}/courses/${selectedCourse}/Created`] = timestamp;
      updates[`students/${studentKey}/courses/${selectedCourse}/PASI/Value`] = "Yes";
      updates[`students/${studentKey}/courses/${selectedCourse}/School_x0020_Year/Value`] = schoolYearWithSlash;
      updates[`students/${studentKey}/courses/${selectedCourse}/Status/Value`] = currentStatus;
      updates[`students/${studentKey}/courses/${selectedCourse}/StudentType/Value`] = currentStudentType;
      updates[`students/${studentKey}/courses/${selectedCourse}/ActiveFutureArchived/Value`] = activeOrArchived;
      updates[`students/${studentKey}/courses/${selectedCourse}/categories/kyle@rtdacademy,com/1740839540398`] = true;
      
      // Student note
      const authorName = user?.displayName || 'System';
      updates[`students/${studentKey}/courses/${selectedCourse}/jsonStudentNotes/0`] = {
        author: authorName,
        content: comment || "Student Created from the PASI Records screen",
        id: noteId,
        noteType: "🛠️",
        timestamp: timestamp
      };
      
      // Execute all updates at once
      await update(ref(db), updates);

      // Create studentCourseSummaries entry for linking
      const summaryKey = `${studentKey}_${selectedCourse}`;
      const courseSummaryData = {
        CourseID: parseInt(selectedCourse, 10),
        Course: course.Title,
        firstName: firstName,
        lastName: lastName,
        schoolYear: schoolYearWithSlash,
        status: status,
        studentKey: studentKey,
        timestamp: Date.now()
      };
      
      // Add to studentCourseSummaries
      await set(ref(db, `studentCourseSummaries/${summaryKey}`), courseSummaryData);
      
      // Show success message
      toast.success(`Student ${firstName} ${lastName} created successfully!`);
      
      // Update state to show success UI
      setIsSuccess(true);
      setCreatedStudentKey(studentKey);
      
    } catch (error) {
      console.error("Error creating student:", error);
      toast.error(`Failed to create student: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    onClose(isSuccess);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Student</DialogTitle>
          <DialogDescription>
            Create a new student in YourWay for this PASI record.
          </DialogDescription>
        </DialogHeader>

        {record && (
          <div className="space-y-4">
            {isSuccess ? (
              <Alert className="bg-green-50 border-green-200">
                <AlertTitle className="text-green-800">Student Created Successfully</AlertTitle>
                <AlertDescription className="text-green-700">
                  <p>The student has been created and can now be linked to this PASI record.</p>
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="bg-muted p-3 rounded-md">
                  <h3 className="text-sm font-medium mb-2">PASI Record Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Student: </span>
                      <span className="font-medium">{record.studentName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ASN: </span>
                      <span className="font-medium">{record.asn}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Course Code: </span>
                      <span className="font-medium">{record.courseCode}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">School Year: </span>
                      <span className="font-medium">{record.schoolYear.replace('_', '/')}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Course</label>
                    <Select
                      value={selectedCourse}
                      onValueChange={setSelectedCourse}
                      disabled={isCreating}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
  {courses.length > 0 ? (
    courses.map(course => (
      <SelectItem key={course.id} value={course.id}>
        {course.Title}
      </SelectItem>
    ))
  ) : (
    <SelectItem value="loading" disabled>Loading courses...</SelectItem>
  )}
</SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Student Email</label>
                    <Input 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="Enter email address" 
                      disabled={useAsn || isCreating}
                    />
                    <div className="mt-1">
                      <label className="flex items-center space-x-2 text-sm">
                        <input 
                          type="checkbox" 
                          checked={useAsn} 
                          onChange={(e) => setUseAsn(e.target.checked)}
                          disabled={isCreating}
                        />
                        <span>Use ASN as student key instead of email</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Student Type</label>
                      <Select
                        value={studentType}
                        onValueChange={setStudentType}
                        disabled={isCreating}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select student type" />
                        </SelectTrigger>
                        <SelectContent>
                          {STUDENT_TYPE_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center">
                                <span style={{ color: option.color }} className="mr-2">
                                  {option.value}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Course Status</label>
                      <Select
                        value={status}
                        onValueChange={setStatus}
                        disabled={isCreating}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Comment (Optional)</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Enter additional notes about this student"
                      className="w-full p-2 border rounded-md text-sm min-h-24"
                      disabled={isCreating}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <DialogFooter className="flex justify-between items-center mt-4">
          {isSuccess ? (
            <div className="mr-auto">
              <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                Ready to link
              </Badge>
            </div>
          ) : (
            <div className="mr-auto">
              {!useAsn && !email && (
                <Alert variant="destructive" className="py-1 px-2">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  <span className="text-xs">Email required</span>
                </Alert>
              )}
            </div>
          )}
          
          <Button variant="outline" onClick={handleClose}>
            {isSuccess ? "Close" : "Cancel"}
          </Button>
          
          {!isSuccess && (
            <Button 
              onClick={handleCreateStudent}
              disabled={isCreating || !selectedCourse || (!useAsn && !email)}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Student"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStudentDialog;