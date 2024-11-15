import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  BookOpen,
  Bot,
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  X,
  ChevronRight,
  Library,
  Pencil,
  Share2,
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

// FeatureCard component with improved mobile styling
const FeatureCard = ({ icon: Icon, title, description, action, onClick }) => (
  <Card className="hover:shadow-lg transition-shadow duration-300">
    <CardHeader>
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <button
        onClick={onClick}
        className="w-full mt-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
      >
        {action}
        <ArrowRight className="ml-2 w-4 h-4" />
      </button>
    </CardContent>
  </Card>
);

// Updated TopSection component
const TopSection = ({ courseCount, assistantCount }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
    <div className="text-center lg:text-left">
      <h1 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Welcome to EdBotz
      </h1>
      <p className="text-gray-600">
        Create personalized AI teaching assistants for your courses. Enhance your students' learning
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
            <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600 opacity-50" />
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

  // Function declarations first
  const handleCreateAssistant = () => {
    setCurrentAIContext({
      type: 'course',
      entityId: 'courseless-assistants',
      parentId: null,
      existingAssistantId: null,
    });
    setShowAISheet(true);
  };

  const handleEditAssistant = (assistant) => {
    setCurrentAIContext({
      type: assistant.usage.type,
      entityId: assistant.usage.entityId,
      parentId: assistant.usage.parentId,
      existingAssistantId: assistant.id,
    });
    setShowAISheet(true);
  };

  const handleAIAssistantSave = async (assistantData) => {
    setShowAISheet(false);
    // Handle saving assistant data if necessary
  };

  const handleManageCourses = () => {
    setActiveComponent('courses');
  };

  const handleBackToMain = () => {
    setActiveComponent('main');
  };

  const handlePreviewFromSheet = (assistant) => {
    setShowAISheet(false); // Close the sheet
    setSelectedAssistant(assistant);
    // Assuming AssistantSelector handles the preview, no separate dialog needed
  };

  // Features array moved after function declarations
  const features = [
    {
      icon: BookOpen,
      title: 'Manage Courses',
      description: 'Create and organize your courses, units, and lessons.',
      action: 'Manage Courses',
      onClick: handleManageCourses,
    },
    {
      icon: Bot,
      title: 'Create AI Assistant',
      description: 'Build custom AI teaching assistants for your courses.',
      action: 'Create Assistant',
      onClick: handleCreateAssistant,
    },
    {
      icon: Share2,
      title: 'Share with Students',
      description: 'Generate access links for students to use your AI assistants.',
      action: 'Create Link',
      onClick: () => setShowLinkGenerator(true),
    },
  ];

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
            ? { title: 'Global Assistants' }
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

  if (activeComponent === 'courses') {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          onClick={handleBackToMain}
          className="absolute top-4 left-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <CourseManagement onBack={handleBackToMain} />
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8 animate-fadeIn px-4 lg:px-8">
      <TopSection courseCount={courseCount} assistantCount={assistantCount} />
      
      {/* Features Section */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>

      {/* Chat Section */}
      <div className="mb-8">
        <Card className="border-t border-gray-200">
          <CardHeader className="p-4 lg:p-6">
            <CardTitle className="text-xl font-semibold">
              AI Teaching Assistants
            </CardTitle>
            <p className="text-sm text-gray-500">
              Test your assistants here
            </p>
          </CardHeader>
          <CardContent className="p-4 lg:p-6">
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
          </CardContent>
        </Card>
      </div>

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
