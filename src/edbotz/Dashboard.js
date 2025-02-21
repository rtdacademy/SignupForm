import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  Library,
  Bot,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { getDatabase, ref, onValue } from 'firebase/database';
import CourseManagement from './CourseManagement';
import AIAssistantSheet from './AIAssistantSheet';
import AssistantSelector from './AssistantSelector';
import LinkGenerator from './LinkGenerator';

// TopSection displays welcome text and key stats
const TopSection = ({ courseCount, assistantCount }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
    <div className="text-center lg:text-left">
      <h1 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Welcome to EdBotz
      </h1>
      <p className="text-gray-600">
        Create personalized AI teaching assistants for your courses. Enhance your students’ learning
        experience with intelligent, always-available help tailored to your curriculum.
      </p>
    </div>
    
    <div className="grid grid-cols-2 gap-4 py-6 lg:py-8">
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Courses</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900">{courseCount}</p>
            </div>
            <Library className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600 opacity-50" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">AI Assistants</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900">{assistantCount}</p>
            </div>
            <Bot className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600 opacity-50" />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Dashboard component
const Dashboard = () => {
  const { user } = useAuth();
  const [activeComponent, setActiveComponent] = useState('main');
  const [showAISheet, setShowAISheet] = useState(false);
  const [assistants, setAssistants] = useState([]);
  const [selectedAssistant, setSelectedAssistant] = useState(null);
  const [courseCount, setCourseCount] = useState(0);
  const [assistantCount, setAssistantCount] = useState(0);
  const [currentAIContext, setCurrentAIContext] = useState({
    type: null,
    entityId: null,
    parentId: null,
    existingAssistantId: null,
  });
  const [courses, setCourses] = useState({});
  const [showLinkGenerator, setShowLinkGenerator] = useState(false);

  // Handle switching to courses management view
  const handleManageCourses = () => {
    setActiveComponent('courses');
  };

  const handleBackToMain = () => {
    setActiveComponent('main');
  };

  // Called when the user wants to edit an assistant (from the AssistantSelector)
  const handleEditAssistant = (assistant) => {
    setCurrentAIContext({
      type: assistant.usage.type,
      entityId: assistant.usage.entityId,
      parentId: assistant.usage.parentId,
      existingAssistantId: assistant.id,
    });
    setShowAISheet(true);
  };

  // Called when the AI Assistant Sheet has finished saving
  const handleAIAssistantSave = async (assistantData) => {
    setShowAISheet(false);
    // Insert any saving logic here if needed.
  };

  // Called when the preview button is clicked from the sheet
  const handlePreviewFromSheet = (assistant) => {
    setShowAISheet(false);
    setSelectedAssistant(assistant);
  };

  // Fetch courses and count them (ignoring the default "courseless-assistants")
  useEffect(() => {
    if (!user?.uid) return;
    const db = getDatabase();
    const coursesRef = ref(db, `edbotz/courses/${user.uid}`);

    const unsubscribe = onValue(coursesRef, (snapshot) => {
      const data = snapshot.val() || {};
      const normalizedCourses = {};
      let count = 0;

      Object.entries(data).forEach(([courseId, course]) => {
        if (courseId !== 'courseless-assistants') {
          count++;
        }
        const units = course.units || [];
        const processedUnits = Array.isArray(units)
          ? units.filter((unit) => unit && typeof unit === 'object')
          : [];
        normalizedCourses[courseId] = {
          ...(courseId === 'courseless-assistants'
            ? { title: 'Courseless Assistants' }
            : course),
          id: courseId,
          units: processedUnits,
          assistants: course.assistants || {},
        };
      });

      setCourseCount(count);
      setCourses(normalizedCourses);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Fetch assistants and count them
  useEffect(() => {
    if (!user?.uid) return;
    const db = getDatabase();
    const assistantsRef = ref(db, `edbotz/assistants/${user.uid}`);

    const unsubscribe = onValue(assistantsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const assistantsArray = Object.entries(data).map(([id, assistant]) => ({
        id,
        ...assistant,
      }));
      setAssistants(assistantsArray);
      setAssistantCount(assistantsArray.length);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // When in courses mode, show the CourseManagement component with a back button
  if (activeComponent === 'courses') {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          onClick={handleBackToMain}
          className="absolute top-4 left-4 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
        <CourseManagement onBack={handleBackToMain} />
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8 animate-fadeIn px-4 lg:px-8">
 

      {/* Assistant Selector is front and center */}
     
          <div className="h-[600px] lg:h-[700px] w-full">
            <AssistantSelector
              assistants={assistants}
              courses={courses}
              selectedAssistant={selectedAssistant}
              onAssistantSelect={setSelectedAssistant}
              onEditAssistant={handleEditAssistant}
              firebaseApp={window.firebaseApp}
              userId={user?.uid}
            />
          </div>
     

      {/* Top Section with welcome text and stats */}
      <TopSection courseCount={courseCount} assistantCount={assistantCount} />

      {/* Dialogs and sheets */}
      <LinkGenerator
        open={showLinkGenerator}
        onOpenChange={setShowLinkGenerator}
        courses={courses}
        assistants={assistants}
        userId={user?.uid}
      />

      {showAISheet && (
        <AIAssistantSheet
          open={showAISheet}
          onOpenChange={setShowAISheet}
          onSave={handleAIAssistantSave}
          type={currentAIContext.type}
          entityId={currentAIContext.entityId}
          parentId={currentAIContext.parentId}
          existingAssistantId={currentAIContext.existingAssistantId}
          isDefaultCourse={currentAIContext.entityId === 'courseless-assistants'}
          onPreviewClick={handlePreviewFromSheet}
        />
      )}
    </div>
  );
};

export default Dashboard;
