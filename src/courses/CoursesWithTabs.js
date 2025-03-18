import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import Courses from './Courses';
import ImportantDates from './ImportantDates';
import { BookOpen, Calendar } from 'lucide-react';

function CoursesWithTabs() {
  const { user, isStaff } = useAuth();
  const navigate = useNavigate();
  
  // Shared state that will be passed to both tab components
  const [courses, setCourses] = useState({});
  const [staffMembers, setStaffMembers] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [courseData, setCourseData] = useState({});
  const [courseWeights, setCourseWeights] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch courses and staff members (moved from Courses.js)
  useEffect(() => {
    if (!user || !isStaff(user)) {
      navigate('/login');
      return;
    }

    const db = getDatabase();

    // Fetch courses
    const coursesRef = ref(db, 'courses');
    const unsubscribeCourses = onValue(coursesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCourses(data);
        if (selectedCourseId && !isEditing) {
          setCourseData(data[selectedCourseId]);
          // Set course weights if they exist; otherwise, use default values
          setCourseWeights(
            data[selectedCourseId]?.weights || {
              lesson: 0.2,
              assignment: 0.2,
              exam: 0.6
            }
          );
        }
      } else {
        setCourses({});
        if (!isEditing) {
          setCourseData({});
          setCourseWeights(null);
        }
      }
    });

    // Fetch staff members
    const staffRef = ref(db, 'staff');
    const unsubscribeStaff = onValue(staffRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const uniqueStaff = Object.entries(data).map(([key, staffData]) => {
          const fullName = staffData.firstName && staffData.lastName
            ? `${staffData.firstName} ${staffData.lastName}`
            : staffData.email;
          return {
            value: key,
            label: fullName,
            email: staffData.email,
          };
        });
        setStaffMembers(uniqueStaff);
      } else {
        setStaffMembers([]);
      }
    });

    return () => {
      unsubscribeCourses();
      unsubscribeStaff();
    };
  }, [user, isStaff, navigate, selectedCourseId, isEditing]);

  // Handler functions to update state
  const handleCourseSelect = (courseId) => {
    setSelectedCourseId(courseId);
    setIsEditing(false);
    if (courses[courseId]) {
      setCourseData(courses[courseId]);
      setCourseWeights(
        courses[courseId].weights || {
          lesson: 0.2,
          assignment: 0.2,
          exam: 0.6
        }
      );
    }
  };

  const handleCourseUpdate = (updatedData) => {
    setCourseData(updatedData);
  };

  const handleWeightsUpdate = (weights) => {
    setCourseWeights(weights);
  };

  const toggleEditing = (value) => {
    setIsEditing(value);
  };

  return (
    <Tabs defaultValue="courses" className="w-full h-full flex flex-col">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="courses" className="flex items-center justify-center">
          <BookOpen className="mr-2 h-4 w-4" />
          Courses
        </TabsTrigger>
        <TabsTrigger value="important-dates" className="flex items-center justify-center">
          <Calendar className="mr-2 h-4 w-4" />
          Important Dates
        </TabsTrigger>
      </TabsList>
      <TabsContent value="courses" className="flex-grow overflow-auto">
        <Courses 
          courses={courses}
          staffMembers={staffMembers}
          selectedCourseId={selectedCourseId}
          courseData={courseData}
          courseWeights={courseWeights}
          isEditing={isEditing}
          onCourseSelect={handleCourseSelect}
          onCourseUpdate={handleCourseUpdate}
          onWeightsUpdate={handleWeightsUpdate}
          toggleEditing={toggleEditing}
        />
      </TabsContent>
      <TabsContent value="important-dates" className="flex-grow overflow-auto">
        <ImportantDates 
          courses={courses}
          selectedCourseId={selectedCourseId}
          courseData={courseData}
          onCourseSelect={handleCourseSelect}
        />
      </TabsContent>
    </Tabs>
  );
}

export default CoursesWithTabs;