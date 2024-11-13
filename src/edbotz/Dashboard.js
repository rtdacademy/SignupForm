import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  BookOpen,
  Bot,
  Users,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { useAuth } from '../context/AuthContext';
import { getDatabase, ref, onValue } from 'firebase/database';
import CourseManagement from './CourseManagement';
import AIAssistantSheet from './AIAssistantSheet';
import AIChatApp from './AIChatApp';
import AssistantSelector from './AssistantSelector';
import LinkGenerator from './LinkGenerator';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '../components/ui/dropdown-menu';

// FeatureCard component
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

// WelcomeSection component
const WelcomeSection = () => (
  <div className="mb-12 text-center md:text-left">
    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
      Welcome to EdBotz
    </h1>
    <p className="text-gray-600 max-w-2xl">
      Create personalized AI teaching assistants for your courses. Enhance your students' learning
      experience with intelligent, always-available help tailored to your curriculum.
    </p>
  </div>
);

// StatsSection component
const StatsSection = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
    {[
      { label: 'Active Courses', value: '0', icon: BookOpen },
      { label: 'AI Assistants', value: '0', icon: Bot },
      { label: 'Student Interactions', value: '0', icon: Users },
    ].map((stat, index) => (
      <Card key={index} className="bg-gradient-to-br from-gray-50 to-gray-100">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <stat.icon className="w-8 h-8 text-blue-600 opacity-50" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Dashboard component
const Dashboard = () => {
  const { user } = useAuth();
  const [activeComponent, setActiveComponent] = useState('main');
  const [showAISheet, setShowAISheet] = useState(false);
  const [assistants, setAssistants] = useState([]);
  const [selectedAssistant, setSelectedAssistant] = useState(null);
  const [currentAIContext, setCurrentAIContext] = useState({
    type: null,
    entityId: null,
    parentId: null,
    existingAssistantId: null,
  });
  const [courses, setCourses] = useState({});
  const [showLinkGenerator, setShowLinkGenerator] = useState(false);

  // Fetch courses
  useEffect(() => {
    if (!user?.uid) return;

    const db = getDatabase();
    const coursesRef = ref(db, `edbotz/courses/${user.uid}`);

    const unsubscribe = onValue(coursesRef, (snapshot) => {
      const data = snapshot.val() || {};
      const normalizedCourses = {};

      Object.entries(data).forEach(([courseId, course]) => {
        const units = course.units || [];
        const processedUnits = Array.isArray(units)
          ? units.filter((unit) => unit && typeof unit === 'object')
          : [];

        if (courseId === 'courseless-assistants') {
          normalizedCourses[courseId] = {
            id: courseId,
            title: 'Global Assistants',
            units: processedUnits,
            assistants: course.assistants || {},
          };
        } else {
          normalizedCourses[courseId] = {
            ...course,
            id: courseId,
            units: processedUnits,
            assistants: course.assistants || {},
          };
        }
      });

      setCourses(normalizedCourses);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Fetch assistants
  useEffect(() => {
    if (!user?.uid) return;

    const db = getDatabase();
    const assistantsRef = ref(db, `edbotz/assistants/${user.uid}`);

    const unsubscribe = onValue(assistantsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const assistantsArray = Object.entries(data).map(
          ([id, assistant]) => ({
            id,
            ...assistant,
          })
        );
        setAssistants(assistantsArray);
      } else {
        setAssistants([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

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

  // Features array
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
    <div className="space-y-8 animate-fadeIn">
      <WelcomeSection />
      <StatsSection />

      {/* Features and Guide Section */}
      <div className="space-y-6">
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>

        {/* Getting Started Guide */}
        <Card className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 border-none">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">
                  Getting Started Guide
                </h3>
                <p className="text-gray-600">
                  New to EdBotz? Learn how to create your first AI teaching assistant and
                  integrate it into your course material in just a few minutes.
                </p>
              </div>
              <button className="inline-flex items-center px-4 py-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors duration-200">
                View Guide
                <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Section */}
      <div className="mt-8">
        <Card className="border-t border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              AI Teaching Assistants
            </CardTitle>
            <p className="text-sm text-gray-500">
              Interact with your AI assistants or create new ones for your courses
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] w-full">
              <AssistantSelector
                assistants={assistants}
                courses={courses}
                selectedAssistant={selectedAssistant}
                onAssistantSelect={setSelectedAssistant}
                onEditAssistant={handleEditAssistant}
                firebaseApp={window.firebaseApp}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Link Generator */}
      <LinkGenerator 
        open={showLinkGenerator}
        onOpenChange={setShowLinkGenerator}
        courses={courses} 
        assistants={assistants} 
        userId={user?.uid}
      />

      {/* AI Assistant Sheet */}
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
