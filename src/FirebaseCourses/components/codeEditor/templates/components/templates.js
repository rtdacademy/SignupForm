// Header Template
export const headerTemplate = `<div className="text-center">
  <h1 className="text-4xl font-bold text-gray-900 mb-2">
    Your Lesson Title Here
  </h1>
  <p className="text-lg text-gray-600">
    Brief description of what students will learn in this lesson
  </p>
  <div className="flex justify-center gap-2 mt-4">
    <Badge variant="secondary">Course Name</Badge>
    <Badge variant="outline">Unit X: Your Unit</Badge>
  </div>
</div>`;

// Learning Objectives Template
export const objectivesTemplate = `<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      🎯 Learning Objectives
    </CardTitle>
  </CardHeader>
  <CardContent>
    <ul className="space-y-2">
      <li className="flex items-start gap-2">
        <span className="text-green-600 mt-1">✓</span>
        Your first learning objective here
      </li>
      <li className="flex items-start gap-2">
        <span className="text-green-600 mt-1">✓</span>
        Your second learning objective here
      </li>
      <li className="flex items-start gap-2">
        <span className="text-green-600 mt-1">✓</span>
        Your third learning objective here
      </li>
      <li className="flex items-start gap-2">
        <span className="text-green-600 mt-1">✓</span>
        Your fourth learning objective here
      </li>
    </ul>
  </CardContent>
</Card>`;

// Theory Card with Formula Box Template
export const theoryTemplate = `<Card>
  <CardHeader>
    <CardTitle>📚 Theory Section</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div>
      <h3 className="text-xl font-semibold mb-2">Main Concept</h3>
      <p className="text-gray-700 leading-relaxed">
        Explain your main concept here. Provide clear definitions, context, 
        and why this concept is important for students to understand.
      </p>
    </div>

    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <h4 className="font-semibold text-blue-900 mb-2">Key Formula/Principle</h4>
      <div className="text-center">
        <p className="text-2xl font-mono font-bold text-blue-800">Formula = Here</p>
        <p className="text-sm text-blue-700 mt-2">
          where variables are defined here with their units
        </p>
      </div>
    </div>

    <div>
      <h4 className="font-semibold mb-2">Important Points:</h4>
      <ul className="list-disc list-inside space-y-1 text-gray-700">
        <li>First important point or property</li>
        <li>Second important point or property</li>
        <li>Third important point or property</li>
        <li>Fourth important point or property</li>
      </ul>
    </div>
  </CardContent>
</Card>`;

// Examples Grid Template
export const examplesTemplate = `<Card>
  <CardHeader>
    <CardTitle>💡 Examples & Applications</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <h4 className="font-semibold text-green-900 mb-2">Example 1: Scenario Name</h4>
        <p className="text-sm text-green-800">
          Describe the problem setup and given values<br/>
          Show the calculation: Formula = values = <strong>Result</strong>
        </p>
      </div>
      
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <h4 className="font-semibold text-purple-900 mb-2">Example 2: Scenario Name</h4>
        <p className="text-sm text-purple-800">
          Describe the problem setup and given values<br/>
          Show the calculation: Formula = values = <strong>Result</strong>
        </p>
      </div>
    </div>

    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-semibold mb-2">Real-World Applications:</h4>
      <div className="grid md:grid-cols-3 gap-3 text-sm">
        <div>🚗 <strong>Application 1:</strong> Brief explanation of first application</div>
        <div>🏢 <strong>Application 2:</strong> Brief explanation of second application</div>
        <div>🌍 <strong>Application 3:</strong> Brief explanation of third application</div>
      </div>
    </div>
  </CardContent>
</Card>`;

// Interactive Component Template
export const interactiveTemplate = `const InteractiveExample = ({ course, courseId }) => {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('Click the buttons!');

  const increment = () => {
    setCount(count + 1);
    setMessage(\`Count increased to \${count + 1}!\`);
  };

  const decrement = () => {
    setCount(count - 1);
    setMessage(\`Count decreased to \${count - 1}!\`);
  };

  const reset = () => {
    setCount(0);
    setMessage('Count reset to zero!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🎮 Interactive Example</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-lg mb-2">{message}</p>
          <div className="text-6xl font-bold text-blue-600 mb-4">{count}</div>
        </div>
        
        <div className="flex justify-center gap-3">
          <button
            onClick={decrement}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            -1
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={increment}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            +1
          </button>
        </div>
        
        <div className="text-center text-sm text-gray-600">
          This demonstrates useState hooks and event handling in React
        </div>
      </CardContent>
    </Card>
  );
};`;

// Assessment Template
export const assessmentTemplate = `<Card>
  <CardHeader>
    <CardTitle>🧮 Practice Question</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <p className="text-gray-700">
      Test your understanding with this AI-generated question tailored to the lesson content.
    </p>

    {devMode && (
      <div className="mb-4">
        <Badge variant="outline" className="text-xs">
          Function: your_cloud_function_name_here
        </Badge>
      </div>
    )}

    <AIMultipleChoiceQuestion
      courseId={courseId}
      assessmentId="practice_question_id"
      cloudFunctionName="your_cloud_function_name_here"
      course={course}
      topic="Your Lesson Topic"
      onCorrectAnswer={() => {
        console.log('Correct answer!');
      }}
      onAttempt={(isCorrect) => {
        console.log('Attempt made:', isCorrect);
      }}
      onComplete={() => {
        console.log('Assessment completed');
      }}
    />
  </CardContent>
</Card>`;

// Key Takeaways Template
export const takeawaysTemplate = `<Card>
  <CardHeader>
    <CardTitle>📝 Key Takeaways</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <h4 className="font-semibold mb-2">Remember:</h4>
        <ul className="text-sm space-y-1 text-gray-700">
          <li>• First key point to remember</li>
          <li>• Second important concept</li>
          <li>• Third critical understanding</li>
          <li>• Fourth essential takeaway</li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Next Steps:</h4>
        <ul className="text-sm space-y-1 text-gray-700">
          <li>• Practice with more problems</li>
          <li>• Study the next lesson topic</li>
          <li>• Explore advanced applications</li>
          <li>• Complete the unit assignment</li>
        </ul>
      </div>
    </div>
  </CardContent>
</Card>`;

// Alert/Warning Box Template
export const alertTemplate = `<Alert>
  <AlertDescription>
    <strong>Important Note:</strong> Add your important information here. 
    This could be a key concept, warning, or helpful tip for students.
  </AlertDescription>
</Alert>`;

// Process Steps Template
export const processTemplate = `<div className="bg-gray-50 p-4 rounded-lg">
  <h4 className="font-semibold mb-3">Step-by-Step Process:</h4>
  <div className="space-y-2 text-sm">
    <div className="flex items-start gap-2">
      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
      <p><strong>Step 1:</strong> Description of the first step</p>
    </div>
    <div className="flex items-start gap-2">
      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
      <p><strong>Step 2:</strong> Description of the second step</p>
    </div>
    <div className="flex items-start gap-2">
      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
      <p><strong>Step 3:</strong> Description of the third step</p>
    </div>
    <div className="flex items-start gap-2">
      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</span>
      <p><strong>Step 4:</strong> Description of the final step</p>
    </div>
  </div>
</div>`;