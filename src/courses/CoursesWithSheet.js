import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
  SheetClose
} from "../components/ui/sheet";
import { Card, CardContent } from "../components/ui/card";
import Courses from './Courses';
import ImportantDates from './ImportantDates';
import RegistrationSettings from './RegistrationSettings';
import { BookOpen, Calendar, Settings} from 'lucide-react';


function CoursesWithSheet() {
  const { user, isStaff, hasSuperAdminAccess } = useAuth();
  const navigate = useNavigate();
  
  // Track which sheet is open
  const [openSheet, setOpenSheet] = useState(null);
  
  // Shared state that will be passed to components
  const [courses, setCourses] = useState({});
  const [staffMembers, setStaffMembers] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [courseData, setCourseData] = useState({});
  const [courseWeights, setCourseWeights] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch courses and staff members
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
    // Only allow super admins to toggle editing mode
    if (value && !hasSuperAdminAccess()) {
      return;
    }
    setIsEditing(value);
  };

  // Menu configuration with icons, labels, and descriptions
  const menuItems = [
    {
      id: 'courses',
      icon: <BookOpen className="h-5 w-5" />,
      label: 'Courses',
      description: 'Manage course information and content',
      color: 'bg-blue-500'
    },
    {
      id: 'important-dates',
      icon: <Calendar className="h-5 w-5" />,
      label: 'Important Dates',
      description: 'Configure important dates for the academic year',
      color: 'bg-green-500'
    },
    {
      id: 'registration-settings',
      icon: <Settings className="h-5 w-5" />,
      label: 'Registration Settings',
      description: 'Configure registration forms for different student types',
      color: 'bg-purple-500'
    }
  ];

  // Get sheet component based on openSheet value
  const getSheetComponent = () => {
    switch (openSheet) {
      case 'courses':
        return (
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
        );
      case 'important-dates':
        return (
          <ImportantDates 
            courses={courses}
            selectedCourseId={selectedCourseId}
            courseData={courseData}
            onCourseSelect={handleCourseSelect}
          />
        );
      case 'registration-settings':
        return <RegistrationSettings />;
      default:
        return null;
    }
  };

  // Get the selected menu item details
  const selectedMenuItem = menuItems.find(item => item.id === openSheet) || {};

  return (
    <div className="w-full h-full p-6">
      <h2 className="text-2xl font-bold mb-6">Course Administration</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <Card 
            key={item.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setOpenSheet(item.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`${item.color} p-3 rounded-full mr-4`}>
                  {React.cloneElement(item.icon, { className: "h-6 w-6 text-white" })}
                </div>
                <div>
                  <h3 className="text-lg font-medium">{item.label}</h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Sheet open={!!openSheet} onOpenChange={(open) => !open && setOpenSheet(null)}>
        <SheetContent 
          className="w-[95vw] sm:max-w-[95vw] p-0 border-l"
          side="right"
        >
          <div className="flex flex-col h-full">
            <SheetHeader className="p-4 border-b flex flex-row items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                {selectedMenuItem.icon && (
                  <div className={`${selectedMenuItem.color} p-2 rounded-full`}>
                    {React.cloneElement(selectedMenuItem.icon, { className: "h-5 w-5 text-white" })}
                  </div>
                )}
                <div>
                  <SheetTitle>{selectedMenuItem.label}</SheetTitle>
                  <SheetDescription>{selectedMenuItem.description}</SheetDescription>
                </div>
              </div>
              
             
            </SheetHeader>
            
            <div className="grow overflow-hidden h-[calc(100vh-8rem)]">
              {getSheetComponent()}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default CoursesWithSheet;