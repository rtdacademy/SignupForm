// Sample React code for testing the dynamic code system with JSX
// Copy and paste this into the Code Editor to test JSX functionality
// 🎉 You can now use normal JSX syntax!

const IntroEthicsFinancialDecisions = ({ course, courseId, courseDisplay, itemConfig, isStaffView, devMode }) => {
  return (
    <div className="space-y-8">
      {/* Test Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-purple-900 mb-2">
          🚧 DYNAMICALLY GENERATED JSX CONTENT! 🚧
        </h1>
        <p className="text-lg text-purple-600">
          This content was generated from JSX code stored in Firebase Storage!
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant="secondary">Storage-Driven</Badge>
          <Badge variant="outline">JSX-Generated Content</Badge>
        </div>
      </div>
      
      {/* Success Message */}
      <Alert>
        <AlertDescription>
          🎉 Success! If you can see this message, the JSX dynamic code rendering system is working correctly! 
          The React component code was written in JSX, stored in Firebase Storage, and is being rendered dynamically.
        </AlertDescription>
      </Alert>
      
      {/* Test Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ✨ JSX Dynamic Content Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">
            This is a test of the JSX dynamic content system. Teachers can now:
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              Write React components using normal JSX syntax
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              Save JSX code directly to Firebase Storage
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              See their JSX changes rendered immediately in lessons
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              Use familiar JSX syntax instead of React.createElement
            </li>
          </ul>
        </CardContent>
      </Card>
      
      {/* Feature Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>JSX Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              <li>• Normal HTML-like syntax</li>
              <li>• Component composition</li>
              <li>• Props and children</li>
              <li>• Conditional rendering</li>
              <li>• Dynamic expressions</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Available Components</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              <li>• Card, CardHeader, CardContent, CardTitle</li>
              <li>• Alert, AlertDescription</li>
              <li>• Badge</li>
              <li>• AIMultipleChoiceQuestion</li>
              <li>• All standard HTML elements</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      {/* Footer */}
      <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          🎯 Mission Accomplished!
        </h3>
        <p className="text-sm text-green-700">
          Teachers can now create course content using familiar JSX syntax without any developer knowledge.
          The system automatically transforms JSX to executable JavaScript and renders it dynamically!
        </p>
      </div>
    </div>
  );
};

// No export needed - the component will be found automatically