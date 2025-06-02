// Sample JSX code for testing the dynamic JSX transformation system
// Copy and paste this into the Code Editor to test JSX functionality

const MyTestComponent = ({ course, courseId, courseDisplay, itemConfig, isStaffView, devMode }) => {
  const [message, setMessage] = useState('Hello from JSX!');
  const [count, setCount] = useState(0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-900 mb-2">
          🎉 JSX TRANSFORMATION WORKING! 🎉
        </h1>
        <p className="text-lg text-green-600">
          This JSX code was automatically transformed to React.createElement!
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant="secondary">JSX Enabled</Badge>
          <Badge variant="outline">Auto-Transformed</Badge>
        </div>
      </div>
      
      {/* Success Alert */}
      <Alert>
        <AlertDescription>
          🚀 <strong>Success!</strong> JSX syntax is now fully supported! 
          Teachers can write natural JSX code and it will be automatically 
          transformed to React.createElement format.
        </AlertDescription>
      </Alert>
      
      {/* Interactive Test */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive JSX Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2">Current message: <strong>{message}</strong></p>
            <button 
              onClick={() => setMessage('JSX hooks are working!')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test useState Hook
            </button>
          </div>
          
          <div>
            <p className="mb-2">Count: <strong>{count}</strong></p>
            <div className="space-x-2">
              <button 
                onClick={() => setCount(count + 1)}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                +1
              </button>
              <button 
                onClick={() => setCount(count - 1)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                -1
              </button>
              <button 
                onClick={() => setCount(0)}
                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Reset
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Features List */}
      <Card>
        <CardHeader>
          <CardTitle>✨ JSX Features Now Supported</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Natural JSX syntax (no more React.createElement!)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>React hooks (useState, useEffect, etc.)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Event handlers and interactive components</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Automatic Babel transformation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Backend and frontend transformation support</span>
            </li>
          </ul>
        </CardContent>
      </Card>
      
      {/* Dev Info */}
      {devMode && (
        <Card>
          <CardHeader>
            <CardTitle>🔧 Developer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <p><strong>Course ID:</strong> {courseId}</p>
              <p><strong>Staff View:</strong> {isStaffView ? 'Yes' : 'No'}</p>
              <p><strong>Dev Mode:</strong> {devMode ? 'Active' : 'Inactive'}</p>
              <p><strong>Component:</strong> MyTestComponent</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};