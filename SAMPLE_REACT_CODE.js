// Sample React code for testing the dynamic code system
// Copy and paste this into the Code Editor to test functionality
// NOTE: Use React.createElement instead of JSX for now

const IntroEthicsFinancialDecisions = ({ course, courseId, courseDisplay, itemConfig, isStaffView, devMode }) => {
  return React.createElement('div', { className: 'space-y-8' },
    // Test Header
    React.createElement('div', { className: 'text-center' },
      React.createElement('h1', { className: 'text-4xl font-bold text-purple-900 mb-2' },
        '🚧 DYNAMICALLY GENERATED CONTENT! 🚧'
      ),
      React.createElement('p', { className: 'text-lg text-purple-600' },
        'This content was generated from code stored in the database!'
      ),
      React.createElement('div', { className: 'flex justify-center gap-2 mt-4' },
        React.createElement(Badge, { variant: 'secondary' }, 'Database-Driven'),
        React.createElement(Badge, { variant: 'outline' }, 'UI-Generated Content')
      )
    ),
    
    // Success Message
    React.createElement(Alert, null,
      React.createElement(AlertDescription, null,
        '🎉 Success! If you can see this message, the dynamic code rendering system is working correctly! The React component code was stored in the Firebase database and is being rendered dynamically.'
      )
    ),
    
    // Test Card
    React.createElement(Card, null,
      React.createElement(CardHeader, null,
        React.createElement(CardTitle, { className: 'flex items-center gap-2' },
          '✨ Dynamic Content Test'
        )
      ),
      React.createElement(CardContent, null,
        React.createElement('p', { className: 'text-gray-700 mb-4' },
          'This is a test of the dynamic content system. Teachers can now:'
        ),
        React.createElement('ul', { className: 'space-y-2' },
          React.createElement('li', { className: 'flex items-start gap-2' },
            React.createElement('span', { className: 'text-green-600 mt-1' }, '✓'),
            'Paste React component code into the StaffCourseWrapper'
          ),
          React.createElement('li', { className: 'flex items-start gap-2' },
            React.createElement('span', { className: 'text-green-600 mt-1' }, '✓'),
            'Save code directly to the Firebase database'
          ),
          React.createElement('li', { className: 'flex items-start gap-2' },
            React.createElement('span', { className: 'text-green-600 mt-1' }, '✓'),
            'See their changes rendered immediately in the lesson'
          ),
          React.createElement('li', { className: 'flex items-start gap-2' },
            React.createElement('span', { className: 'text-green-600 mt-1' }, '✓'),
            'Toggle between manual and UI-generated versions'
          )
        )
      )
    ),
    
    // Footer
    React.createElement('div', { className: 'text-center p-4 bg-gray-50 rounded-lg' },
      React.createElement('p', { className: 'text-sm text-gray-600' },
        '🎯 Mission Accomplished! Teachers can now create course content without developer knowledge.'
      )
    )
  );
};

// No export needed - the component will be found automatically