import React, { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Alert,
  AlertDescription
} from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ScrollArea } from "../components/ui/scroll-area";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { 
  InfoIcon, 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  GraduationCap,
  Globe,
  Home,
  Sun 
} from "lucide-react";
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { 
  COURSE_OPTIONS, 
  PASI_COURSES,
  ACTIVE_FUTURE_ARCHIVED_OPTIONS,
  PASI_OPTIONS,
  STUDENT_TYPE_OPTIONS,
  STATUS_OPTIONS
} from '../config/DropdownOptions';
import { getDatabase, ref, get, set } from 'firebase/database';

const ExistingStudentInfo = ({ studentData }) => {
  if (!studentData) return null;

  const { profile = {}, courses = {} } = studentData;
  const existingCourses = Object.entries(courses || {})
    .map(([_, courseData]) => courseData?.Course?.Value)
    .filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <User className="h-4 w-4" />
          <span className="font-medium">Student Information</span>
        </div>
        <div className="grid grid-cols-2 gap-2 pl-6">
          <div>
            <span className="text-sm text-muted-foreground">First Name:</span>
            <p>{profile.preferredFirstName || 'Not provided'}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Last Name:</span>
            <p>{profile.lastName || 'Not provided'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <p>{profile.StudentEmail || 'No email provided'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <p>{profile.StudentPhone || 'No phone provided'}</p>
          </div>
        </div>
      </div>

      {existingCourses.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <GraduationCap className="h-4 w-4" />
            <span className="font-medium">Current Courses</span>
          </div>
          <ul className="pl-6 space-y-1">
            {existingCourses.map((course, index) => (
              <li key={index} className="text-sm">
                {course}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const NewCourseForm = ({ 
  selectedCourseId, 
  schoolYear, 
  availableCourses,
  teacherName,
  onSave
}) => {
  const [formData, setFormData] = useState({
    courseId: selectedCourseId || '',
    activeFutureArchived: 'Active',
    lmsStudentId: '',
    pasi: 'No',
    status: 'Default',
    studentType: 'Non-Primary'
  });

  const selectedCourse = availableCourses.find(
    course => course.courseId.toString() === formData.courseId
  );

  const handleSave = () => {
    const now = new Date();
    const noteId = `note-${Date.now()}`;

    const courseData = {
      ActiveFutureArchived: {
        Value: formData.activeFutureArchived
      },
      Course: {
        Value: selectedCourse?.label || ''
      },
      CourseID: parseInt(formData.courseId),
      Created: now.toISOString(),
      LMSStudentID: formData.lmsStudentId,
      PASI: {
        Value: formData.pasi
      },
      School_x0020_Year: {
        Value: schoolYear
      },
      Status: {
        Value: formData.status
      },
      StudentType: {
        Value: formData.studentType
      },
      categories: {
        "info@rtdacademy,com": {
          Manually_Created: true
        }
      },
      jsonStudentNotes: [
        {
          author: teacherName,
          content: `➕ New student created by ${teacherName}.\nCreated: ${now.toLocaleDateString()}`,
          id: noteId,
          noteType: "➕",
          timestamp: now.toISOString()
        }
      ]
    };

    onSave(courseData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = formData.courseId && selectedCourse;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-primary">
        <GraduationCap className="h-4 w-4" />
        <span className="font-medium">Course Details</span>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Course</Label>
          <Select
            value={formData.courseId}
            onValueChange={(value) => handleChange('courseId', value)}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {availableCourses.map((course) => (
                <SelectItem 
                  key={course.courseId} 
                  value={course.courseId.toString()}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: course.color }}
                    />
                    {course.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Status</Label>
          <Select
            value={formData.activeFutureArchived}
            onValueChange={(value) => handleChange('activeFutureArchived', value)}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {ACTIVE_FUTURE_ARCHIVED_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: option.color }}
                    />
                    {option.value}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>PASI Status</Label>
          <Select
            value={formData.pasi}
            onValueChange={(value) => handleChange('pasi', value)}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select PASI status" />
            </SelectTrigger>
            <SelectContent>
              {PASI_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: option.color }}
                    />
                    {option.value}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Student Type</Label>
          <Select
            value={formData.studentType}
            onValueChange={(value) => handleChange('studentType', value)}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select student type" />
            </SelectTrigger>
            <SelectContent>
              {STUDENT_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: option.color }}
                    />
                    {option.value}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>LMS Student ID (Optional)</Label>
          <Input
            value={formData.lmsStudentId}
            onChange={(e) => handleChange('lmsStudentId', e.target.value)}
            placeholder="Enter LMS Student ID"
            className="bg-white"
          />
        </div>

        <div className="pt-4">
          <Button 
            onClick={handleSave}
            disabled={!isFormValid}
            className="w-full"
          >
            Save Course
          </Button>
        </div>
      </div>
    </div>
  );
};

const NewStudentForm = ({ asn, firstName, lastName }) => {
  const [formData, setFormData] = useState({
    asn: asn || '',
    firstName: firstName || '',
    lastName: lastName || '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <User className="h-4 w-4" />
          <span className="font-medium">New Student Profile</span>
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor="asn">ASN Number</Label>
            <Input
              id="asn"
              value={formData.asn}
              onChange={(e) => handleInputChange('asn', e.target.value)}
              placeholder="Enter ASN"
              className="bg-white"
            />
          </div>

          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="Enter first name"
              className="bg-white"
            />
          </div>

          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Enter last name"
              className="bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const EmailVerificationStep = ({ defaultEmail, onEmailVerified, transformedData, onSaveCourse }) => {
  const [email, setEmail] = useState(defaultEmail || '');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');
  const [studentData, setStudentData] = useState(null);

  const availableCourses = useMemo(() => {
    return COURSE_OPTIONS.filter(course => 
      transformedData?.courseIds?.includes(course.courseId)
    );
  }, [transformedData?.courseIds]);

  const handleCheckEmail = async () => {
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    setIsChecking(true);
    setError('');
    setStudentData(null);

    try {
      const db = getDatabase();
      const studentKey = sanitizeEmail(email);
      const studentRef = ref(db, `students/${studentKey}`);
      const snapshot = await get(studentRef);

      if (snapshot.exists()) {
        console.log('Student exists:', snapshot.val());
        setStudentData(snapshot.val());
      } else {
        console.log('Student does not exist');
        setStudentData(false);
      }

      console.log('Transformed Data:', {
        asn: transformedData?.asn,
        email: transformedData?.email,
        studentKey: transformedData?.studentKey,
        schoolYear: transformedData?.schoolYear,
        status: transformedData?.status,
        studentName: transformedData?.studentName,
        firstName: transformedData?.firstName,
        lastName: transformedData?.lastName,
        courseCode: transformedData?.courseCode,
        courseIds: transformedData?.courseIds,
      });

      onEmailVerified(email, studentKey, snapshot.exists());
    } catch (error) {
      console.error('Error checking email:', error);
      setError('Error checking email. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Student Email</Label>
        <div className="flex space-x-2">
          <Input
            id="email"
            type="email"
            placeholder="student@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isChecking}
            className="bg-white"
          />
          <Button 
            onClick={handleCheckEmail}
            disabled={isChecking || !email}
          >
            {isChecking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Check Email'
            )}
          </Button>
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>

      {studentData !== null && (
        <div className="space-y-6">
          {studentData && (
            <Alert className="bg-muted">
              <AlertDescription>
                <ExistingStudentInfo studentData={studentData} />
              </AlertDescription>
            </Alert>
          )}
          
          <Alert className="bg-primary/10">
            <AlertDescription>
              <NewStudentForm 
                asn={transformedData?.asn}
                firstName={transformedData?.firstName}
                lastName={transformedData?.lastName}
              />
            </AlertDescription>
          </Alert>

          <Alert className="bg-primary/10">
            <AlertDescription>
              <NewCourseForm 
                availableCourses={availableCourses}
                schoolYear={transformedData?.schoolYear}
                teacherName="Teacher Name" // This should come from your auth context
                onSave={onSaveCourse}
              />
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

const parseStudentName = (fullName) => {
  if (!fullName) return { firstName: '', lastName: '' };
  const [lastNamePart, firstNamePart] = fullName.split(',').map(part => part.trim());
  if (!firstNamePart) return { firstName: '', lastName: '' };
  const firstName = firstNamePart.split(' ')[0];
  return {
    firstName,
    lastName: lastNamePart
  };
};

const CreateStudent = ({ 
  isOpen, 
  onClose,
  asn,
  email,
  schoolYear,
  status,
  studentName,
  courseCode
}) => {
  const [verifiedEmail, setVerifiedEmail] = useState(null);
  const [studentExists, setStudentExists] = useState(false);

  const transformedData = useMemo(() => {
    if (!email || !schoolYear || !courseCode) return null;
  
    const formattedSchoolYear = schoolYear.replace('_', '/');
    const studentKey = sanitizeEmail(email);
    
    const pasiCourseInfo = PASI_COURSES.find(course => course.pasiCode === courseCode);
    console.log('PASI Course Lookup:', { 
      courseCode, 
      pasiCourseInfo,
      allPasiCodes: PASI_COURSES.map(c => c.pasiCode)
    });
    
    const courseIds = pasiCourseInfo?.courseId || [];
    
    const { firstName, lastName } = parseStudentName(studentName);
  
    return {
      asn,
      email,
      studentKey,
      schoolYear: formattedSchoolYear,
      status,
      studentName,
      firstName,
      lastName,
      courseCode,
      courseIds,
      courseInfo: pasiCourseInfo ? {
        description: pasiCourseInfo.description,
        credits: pasiCourseInfo.credits,
        grade: pasiCourseInfo.grade,
        courseType: pasiCourseInfo.courseType
      } : null
    };
  }, [asn, email, schoolYear, status, studentName, courseCode]);

  const logFirebaseStructure = (email, courseData, profileData) => {
    const studentKey = sanitizeEmail(email);
    const courseId = courseData.CourseID;

    const firebaseStructure = {
      [`/students/${studentKey}/profile`]: {
        ASN: profileData.asn,
        StudentEmail: email,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        preferredFirstName: profileData.firstName,
        Created: new Date().toISOString(),
        LastModified: new Date().toISOString(),
      },
      [`/students/${studentKey}/courses/${courseId}`]: {
        ActiveFutureArchived: courseData.ActiveFutureArchived,
        Course: courseData.Course,
        CourseID: courseData.CourseID,
        Created: courseData.Created,
        LMSStudentID: courseData.LMSStudentID,
        PASI: courseData.PASI,
        School_x0020_Year: courseData.School_x0020_Year,
        Status: courseData.Status,
        StudentType: courseData.StudentType,
        categories: courseData.categories,
        jsonStudentNotes: courseData.jsonStudentNotes
      }
    };

    console.group('Firebase Data Structure Preview');
    console.log('Student Key:', studentKey);
    console.log('Course ID:', courseId);
    
    console.group('Profile Data Path:');
    console.log(`/students/${studentKey}/profile`);
    console.log('Profile Data:', firebaseStructure[`/students/${studentKey}/profile`]);
    console.groupEnd();
    
    console.group('Course Data Path:');
    console.log(`/students/${studentKey}/courses/${courseId}`);
    console.log('Course Data:', firebaseStructure[`/students/${studentKey}/courses/${courseId}`]);
    console.groupEnd();
    
    console.groupEnd();

    return firebaseStructure;
  };

  const handleSaveCourse = (courseData) => {
    if (!transformedData) {
      console.error('No transformed data available');
      return;
    }

    const profileData = {
      asn: transformedData.asn,
      firstName: transformedData.firstName,
      lastName: transformedData.lastName
    };

    const firebaseStructure = logFirebaseStructure(
      transformedData.email,
      courseData,
      profileData
    );

    // TODO: Uncomment to implement actual Firebase save
    // const db = getDatabase();
    // Object.entries(firebaseStructure).forEach(([path, data]) => {
    //   const nodeRef = ref(db, path);
    //   set(nodeRef, data);
    // });

    // Optional: Close dialog after save
    // onClose();
  };

  const handleEmailVerified = (verifiedEmail, studentKey, exists) => {
    setVerifiedEmail(verifiedEmail);
    setStudentExists(exists);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Student</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[600px] pr-4">
          <div className="p-4 space-y-6">
            <EmailVerificationStep 
              defaultEmail={email} 
              onEmailVerified={handleEmailVerified}
              transformedData={transformedData}
              onSaveCourse={handleSaveCourse}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStudent;
