export const aiChatExamples = {
  'physics-tutor': {
    id: 'physics-tutor',
    title: 'Physics AI Tutor',
    category: 'AI Chat',
    description: 'Subject-specific AI tutor for physics lessons with comprehensive configuration',
    tags: ['ai', 'chat', 'physics', 'tutor', 'education'],
    difficulty: 'advanced',
    imports: [
      "import { GoogleAIChatApp } from '../../../edbotz/GoogleAIChat/GoogleAIChatApp';",
      "import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';"
    ],
    code: `const PhysicsTutorSection = ({ course, courseId, isStaffView, devMode }) => {
  const instructions = "You are a physics tutor specialized in helping students understand physics concepts. Focus on clear explanations, real-world examples, and step-by-step problem solving. Encourage questions and provide supportive feedback.";
  
  const firstMessage = "Hello! I'm your physics tutor. I can help you with mechanics, electricity, magnetism, waves, thermodynamics, and modern physics. What physics topic would you like to explore today?";
  
  const context = {
    subject: "Physics",
    gradeLevel: "High School",
    currentTopic: "Mechanics",
    courseId: courseId
  };

  const aiChatContext = "This is a physics lesson. The student is learning about fundamental physics concepts and may need help with problem-solving, understanding theory, or connecting concepts to real-world applications.";

  return (
    <div className="physics-tutor-section mb-6">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔬 Physics AI Tutor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Get personalized help with physics concepts, problem-solving, and homework questions.
          </p>
          
          <GoogleAIChatApp 
            instructions={instructions}
            firstMessage={firstMessage}
            showYouTube={true}
            showUpload={true}
            YouTubeURL="https://www.youtube.com/watch?v=ZM8ECpBuQYE"
            YouTubeDisplayName="Physics Fundamentals Overview"
            predefinedFiles={[
              "gs://your-bucket/physics-formulas.pdf",
              "gs://your-bucket/physics-reference-sheet.pdf"
            ]}
            predefinedFilesDisplayNames={{
              "gs://your-bucket/physics-formulas.pdf": "Physics Formula Reference",
              "gs://your-bucket/physics-reference-sheet.pdf": "Quick Reference Guide"
            }}
            allowContentRemoval={false}
            showResourcesAtTop={true}
            context={context}
            sessionIdentifier={\`physics-tutor-\${courseId}\`}
            aiChatContext={aiChatContext}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PhysicsTutorSection;`,
    props: {
      instructions: "You are a physics tutor specialized in helping students understand physics concepts...",
      firstMessage: "Hello! I'm your physics tutor. I can help you with mechanics, electricity, magnetism...",
      showYouTube: true,
      showUpload: true,
      allowContentRemoval: false,
      showResourcesAtTop: true,
      aiChatContext: "This is a physics lesson context..."
    }
  },
  
  'math-helper': {
    id: 'math-helper',
    title: 'Math Problem Solver',
    category: 'AI Chat',
    description: 'AI assistant specialized in mathematics with step-by-step problem solving',
    tags: ['ai', 'chat', 'math', 'problem-solving', 'step-by-step'],
    difficulty: 'intermediate',
    imports: [
      "import { GoogleAIChatApp } from '../../../edbotz/GoogleAIChat/GoogleAIChatApp';"
    ],
    code: `const MathHelperSection = ({ course, courseId, isStaffView, devMode }) => {
  const instructions = "You are a mathematics tutor that excels at breaking down complex problems into manageable steps. Always show your work, explain reasoning, and help students understand the 'why' behind mathematical concepts.";
  
  const firstMessage = "Hi! I'm your math assistant. I can help you solve problems step-by-step, explain concepts, and practice different types of mathematical problems. What math topic can I help you with?";

  return (
    <div className="math-helper-section mb-6">
      <GoogleAIChatApp 
        instructions={instructions}
        firstMessage={firstMessage}
        showYouTube={true}
        showUpload={true}
        allowContentRemoval={true}
        showResourcesAtTop={false}
        sessionIdentifier={\`math-helper-\${courseId}\`}
        aiChatContext="Mathematics lesson - focus on problem-solving and conceptual understanding"
      />
    </div>
  );
};

export default MathHelperSection;`,
    props: {
      instructions: "Mathematics tutor focused on step-by-step problem solving",
      firstMessage: "Hi! I'm your math assistant...",
      showYouTube: true,
      showUpload: true,
      allowContentRemoval: true,
      showResourcesAtTop: false
    }
  },

  'writing-assistant': {
    id: 'writing-assistant',
    title: 'Writing Assistant',
    category: 'AI Chat',
    description: 'AI assistant for improving writing skills, grammar, and essay structure',
    tags: ['ai', 'chat', 'writing', 'grammar', 'essays'],
    difficulty: 'intermediate',
    imports: [
      "import { GoogleAIChatApp } from '../../../edbotz/GoogleAIChat/GoogleAIChatApp';",
      "import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';"
    ],
    code: `const WritingAssistantSection = ({ course, courseId, isStaffView, devMode }) => {
  const instructions = "You are a writing tutor who helps students improve their writing skills. Provide constructive feedback on grammar, structure, clarity, and style. Help students develop their ideas and express them effectively. Be encouraging and supportive.";
  
  const firstMessage = "Hello! I'm your writing assistant. I can help you with essays, creative writing, grammar, and improving your writing style. What would you like to work on today?";

  return (
    <div className="writing-assistant-section mb-6">
      <Card>
        <CardHeader>
          <CardTitle>✍️ Writing Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <GoogleAIChatApp 
            instructions={instructions}
            firstMessage={firstMessage}
            showYouTube={false}
            showUpload={true}
            allowContentRemoval={true}
            showResourcesAtTop={false}
            sessionIdentifier={\`writing-assistant-\${courseId}\`}
            aiChatContext="Writing assistance - focus on grammar, structure, and clarity"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default WritingAssistantSection;`,
    props: {
      instructions: "Writing tutor helping with essays and creative writing",
      firstMessage: "Hello! I'm your writing assistant...",
      showYouTube: false,
      showUpload: true,
      allowContentRemoval: true,
      showResourcesAtTop: false
    }
  },

  'quiz-generator': {
    id: 'quiz-generator',
    title: 'Interactive Quiz Generator',
    category: 'AI Chat',
    description: 'AI that generates customized quizzes based on lesson content',
    tags: ['ai', 'chat', 'quiz', 'assessment', 'interactive'],
    difficulty: 'advanced',
    imports: [
      "import { GoogleAIChatApp } from '../../../edbotz/GoogleAIChat/GoogleAIChatApp';",
      "import { useState } from 'react';",
      "import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';",
      "import { Button } from '../../../../components/ui/button';"
    ],
    code: `const QuizGeneratorSection = ({ course, courseId, isStaffView, devMode }) => {
  const [quizTopic, setQuizTopic] = useState('');
  
  const instructions = "You are a quiz generator that creates interactive, educational quizzes. Generate multiple choice, true/false, and short answer questions based on the topic provided. After each answer, provide detailed explanations to help students learn. Keep track of scores and provide encouraging feedback.";
  
  const firstMessage = "Welcome to the Quiz Generator! Tell me what topic you'd like to be quizzed on, and I'll create a customized quiz just for you. I can make it easier or harder based on your comfort level.";

  const aiChatContext = \`Generate educational quizzes on: \${quizTopic || 'any topic'}. Include varied question types and difficulty levels.\`;

  return (
    <div className="quiz-generator-section mb-6">
      <Card>
        <CardHeader>
          <CardTitle>🎯 Interactive Quiz Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter quiz topic..."
              value={quizTopic}
              onChange={(e) => setQuizTopic(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <GoogleAIChatApp 
            instructions={instructions}
            firstMessage={firstMessage}
            showYouTube={false}
            showUpload={false}
            allowContentRemoval={false}
            showResourcesAtTop={false}
            sessionIdentifier={\`quiz-generator-\${courseId}\`}
            aiChatContext={aiChatContext}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizGeneratorSection;`,
    props: {
      instructions: "Quiz generator creating interactive educational quizzes",
      firstMessage: "Welcome to the Quiz Generator!...",
      showYouTube: false,
      showUpload: false,
      allowContentRemoval: false,
      showResourcesAtTop: false
    }
  }
};