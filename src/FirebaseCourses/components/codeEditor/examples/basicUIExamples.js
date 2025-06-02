export const basicUIExamples = {
  'card-with-tabs': {
    id: 'card-with-tabs',
    title: 'Card with Tabs Layout',
    category: 'Basic UI',
    description: 'A card component with tabbed content sections',
    tags: ['card', 'tabs', 'layout', 'navigation'],
    difficulty: 'beginner',
    imports: [
      "import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';",
      "import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';"
    ],
    code: `const TabbedContentSection = ({ course, courseId, isStaffView, devMode }) => {
  return (
    <div className="tabbed-content-section mb-6">
      <Card>
        <CardHeader>
          <CardTitle>📖 Learning Materials</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Lesson Overview</h3>
                <p className="text-gray-600">
                  This lesson introduces fundamental concepts that will form the foundation 
                  for more advanced topics. Pay close attention to the key terms and definitions.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="mt-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Detailed Information</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Concept 1: Understanding the basics</li>
                  <li>Concept 2: Building on fundamentals</li>
                  <li>Concept 3: Advanced applications</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="resources" className="mt-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Additional Resources</h3>
                <div className="space-y-2">
                  <a href="#" className="text-blue-600 hover:underline block">
                    📄 Download Study Guide (PDF)
                  </a>
                  <a href="#" className="text-blue-600 hover:underline block">
                    🎥 Watch Video Tutorial
                  </a>
                  <a href="#" className="text-blue-600 hover:underline block">
                    📝 Practice Exercises
                  </a>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TabbedContentSection;`,
    props: {
      defaultTab: "overview",
      tabs: ["overview", "details", "resources"]
    }
  },

  'progress-tracker': {
    id: 'progress-tracker',
    title: 'Progress Tracker Component',
    category: 'Basic UI',
    description: 'Visual progress indicator for lesson completion',
    tags: ['progress', 'tracker', 'visual', 'feedback'],
    difficulty: 'beginner',
    imports: [
      "import React, { useState } from 'react';",
      "import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';",
      "import { Progress } from '../../../../components/ui/progress';",
      "import { Button } from '../../../../components/ui/button';",
      "import { CheckCircle, Circle } from 'lucide-react';"
    ],
    code: `const ProgressTrackerSection = ({ course, courseId, isStaffView, devMode }) => {
  const [completedSteps, setCompletedSteps] = useState([]);
  
  const steps = [
    { id: 1, title: 'Watch Introduction Video', duration: '5 min' },
    { id: 2, title: 'Read Key Concepts', duration: '10 min' },
    { id: 3, title: 'Complete Practice Problems', duration: '15 min' },
    { id: 4, title: 'Take Mini Quiz', duration: '5 min' },
    { id: 5, title: 'Review Summary', duration: '3 min' }
  ];
  
  const toggleStep = (stepId) => {
    setCompletedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };
  
  const progress = (completedSteps.length / steps.length) * 100;

  return (
    <div className="progress-tracker-section mb-6">
      <Card>
        <CardHeader>
          <CardTitle>📊 Lesson Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Overall Progress</span>
                <span className="text-gray-600">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            {/* Steps List */}
            <div className="space-y-2">
              {steps.map((step) => {
                const isCompleted = completedSteps.includes(step.id);
                return (
                  <div
                    key={step.id}
                    className={\`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer
                      \${isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}\`}
                    onClick={() => toggleStep(step.id)}
                  >
                    <div className="flex items-center gap-3">
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                      <span className={\`font-medium \${isCompleted ? 'text-green-800' : 'text-gray-700'}\`}>
                        {step.title}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{step.duration}</span>
                  </div>
                );
              })}
            </div>
            
            {/* Completion Message */}
            {progress === 100 && (
              <div className="bg-green-100 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-green-800 font-medium">
                  🎉 Congratulations! You've completed this lesson!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressTrackerSection;`,
    props: {
      steps: "Array of step objects with id, title, and duration",
      showCompletionMessage: true
    }
  },

  'info-cards-grid': {
    id: 'info-cards-grid',
    title: 'Information Cards Grid',
    category: 'Basic UI',
    description: 'Grid layout of informational cards with icons',
    tags: ['grid', 'cards', 'layout', 'information'],
    difficulty: 'beginner',
    imports: [
      "import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';",
      "import { BookOpen, Clock, Target, Award } from 'lucide-react';"
    ],
    code: `const InfoCardsGridSection = ({ course, courseId, isStaffView, devMode }) => {
  const infoCards = [
    {
      icon: BookOpen,
      title: 'Prerequisites',
      content: 'Basic understanding of algebra and problem-solving skills',
      color: 'text-blue-600'
    },
    {
      icon: Clock,
      title: 'Duration',
      content: 'Approximately 45 minutes to complete',
      color: 'text-green-600'
    },
    {
      icon: Target,
      title: 'Learning Objectives',
      content: 'Master 5 key concepts and solve practical problems',
      color: 'text-purple-600'
    },
    {
      icon: Award,
      title: 'Achievement',
      content: 'Earn a completion badge upon finishing',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="info-cards-grid-section mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {infoCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className={\`h-5 w-5 \${card.color}\`} />
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{card.content}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default InfoCardsGridSection;`,
    props: {
      cards: "Array of card objects with icon, title, content, and color",
      columns: 4
    }
  },

  'alert-banner': {
    id: 'alert-banner',
    title: 'Alert Banner Component',
    category: 'Basic UI',
    description: 'Dismissible alert banner for important messages',
    tags: ['alert', 'banner', 'notification', 'message'],
    difficulty: 'beginner',
    imports: [
      "import React, { useState } from 'react';",
      "import { Alert, AlertDescription, AlertTitle } from '../../../../components/ui/alert';",
      "import { Button } from '../../../../components/ui/button';",
      "import { X, Info, AlertCircle, CheckCircle } from 'lucide-react';"
    ],
    code: `const AlertBannerSection = ({ course, courseId, isStaffView, devMode }) => {
  const [showAlert, setShowAlert] = useState(true);
  const [alertType, setAlertType] = useState('info'); // 'info', 'warning', 'success'
  
  const alertConfigs = {
    info: {
      icon: Info,
      title: 'Important Information',
      description: 'This lesson includes interactive exercises. Make sure you have your notebook ready!',
      className: 'bg-blue-50 border-blue-200'
    },
    warning: {
      icon: AlertCircle,
      title: 'Deadline Reminder',
      description: 'Assignment submission closes in 2 days. Don\\'t forget to submit your work!',
      className: 'bg-yellow-50 border-yellow-200'
    },
    success: {
      icon: CheckCircle,
      title: 'Great Progress!',
      description: 'You\\'ve completed 80% of this module. Keep up the excellent work!',
      className: 'bg-green-50 border-green-200'
    }
  };
  
  const currentAlert = alertConfigs[alertType];
  const Icon = currentAlert.icon;

  return (
    <div className="alert-banner-section mb-6">
      {showAlert && (
        <Alert className={\`relative \${currentAlert.className}\`}>
          <Icon className="h-4 w-4" />
          <AlertTitle>{currentAlert.title}</AlertTitle>
          <AlertDescription>{currentAlert.description}</AlertDescription>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={() => setShowAlert(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      )}
      
      {/* Demo Controls - Remove in production */}
      {isStaffView && !showAlert && (
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAlert(true)}
          >
            Show Alert
          </Button>
          <select
            value={alertType}
            onChange={(e) => setAlertType(e.target.value)}
            className="px-3 py-1 border rounded text-sm"
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="success">Success</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default AlertBannerSection;`,
    props: {
      type: "info | warning | success",
      dismissible: true,
      autoHide: false
    }
  },

  'stats-display': {
    id: 'stats-display',
    title: 'Statistics Display',
    category: 'Basic UI',
    description: 'Display key statistics in a visually appealing format',
    tags: ['stats', 'metrics', 'dashboard', 'data'],
    difficulty: 'intermediate',
    imports: [
      "import { Card, CardContent } from '../../../../components/ui/card';",
      "import { TrendingUp, Users, BookOpen, Trophy } from 'lucide-react';"
    ],
    code: `const StatsDisplaySection = ({ course, courseId, isStaffView, devMode }) => {
  const stats = [
    {
      label: 'Course Progress',
      value: '67%',
      change: '+12%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Active Students',
      value: '1,234',
      change: '+89',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Lessons Completed',
      value: '18/25',
      change: '72%',
      trend: 'neutral',
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Average Score',
      value: '85%',
      change: '+5%',
      trend: 'up',
      icon: Trophy,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="stats-display-section mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {stat.value}
                    </p>
                    <p className={\`text-sm mt-1 \${
                      stat.trend === 'up' ? 'text-green-600' : 'text-gray-600'
                    }\`}>
                      {stat.change} from last week
                    </p>
                  </div>
                  <div className={\`p-3 rounded-full \${stat.bgColor}\`}>
                    <Icon className={\`h-6 w-6 \${stat.color}\`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default StatsDisplaySection;`,
    props: {
      stats: "Array of stat objects with label, value, change, trend, icon, color",
      columns: 4
    }
  }
};