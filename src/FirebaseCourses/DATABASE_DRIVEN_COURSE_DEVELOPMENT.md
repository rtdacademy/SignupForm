# Database-Driven Course Development Guide

## Overview

This guide documents the database-driven course development system that allows course creators to build lessons and assessments through a visual UI interface without requiring coding knowledge. This system operates as a hybrid approach alongside the traditional file-based course structure, providing real-time editing capabilities and automatic content detection.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Key Components](#key-components)
3. [Database Structure](#database-structure)
4. [Development Workflow](#development-workflow)
5. [Assessment System](#assessment-system)
6. [Cloud Functions](#cloud-functions)
7. [Frontend Components](#frontend-components)
8. [Dynamic Import System](#dynamic-import-system)
9. [Configuration Management](#configuration-management)
10. [Troubleshooting](#troubleshooting)

## Architecture Overview

The database-driven system operates as a **true hybrid** alongside the traditional file-based course structure, with automatic detection and seamless switching between content modes.

### System Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Hybrid Lesson   │───▶│  Auto-Detection │───▶│ Content Router  │
│   Component     │    │  (DB vs Manual) │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Manual.js      │    │ UiGenerated     │    │ Visual Editor   │
│  (Traditional)  │    │ Content         │    │ (ModernSection) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                               │                       │
                               ▼                       ▼
                    ┌─────────────────┐    ┌─────────────────┐
                    │ Multi-Section   │    │ Section Manager │
                    │ Rendering       │    │ (Drag & Drop)   │
                    └─────────────────┘    └─────────────────┘
```

### Hybrid Content Detection

Each lesson automatically detects and switches between modes:
- **Manual Mode**: Uses traditional React component files (`manual.js`)
- **UI-Generated Mode**: Database-driven multi-section content with real-time editing
- **Auto-Detection**: Checks for database content on lesson load and switches automatically
- **Staff Toggle**: Staff can manually switch between modes for comparison/editing

## Key Components

### Core Files

```
src/FirebaseCourses/
├── components/
│   ├── content/
│   │   ├── UiGeneratedContent.js          # Multi-section content renderer
│   │   ├── DynamicComponentLoader.js      # Selective component loading
│   │   ├── LessonContent.js               # Traditional lesson wrapper
│   │   └── IMPLEMENTATION_SUMMARY.md      # Dynamic import documentation
│   ├── codeEditor/
│   │   ├── ModernSectionEditor.js         # Main visual editing interface
│   │   ├── SectionManager.js              # Section management with drag-drop
│   │   ├── AssessmentConfigForm.js        # Assessment configuration
│   │   └── CodeMirrorWrapper.js           # Code editor integration
│   └── assessments/
│       ├── AIMultipleChoiceQuestion/      # AI-powered multiple choice
│       └── AILongAnswerQuestion/          # AI-powered long answer
│
├── courses/[courseId]/content/[lessonPath]/
│   ├── index.js                           # Hybrid auto-detection component
│   └── manual.js                          # Traditional manual content
│
functions/
├── manageCourseSection.js                 # Section CRUD operations
├── manageDatabaseAssessment.js            # Generic assessment routing
├── autoTransformSections.js               # JSX→React transformation
├── jsxTransformerEnhanced.js              # Enhanced JSX parser with metadata
└── shared/
    ├── assessment-types/                  # Reusable assessment modules
    ├── prompt-modules/                    # AI prompt enhancements
    └── utilities/                         # Database and utility functions
```

### Hybrid Lesson Structure

Each lesson implements the hybrid pattern:

```javascript
// Example: courses/3/content/01-intro-ethics-financial-decisions/index.js
const LessonComponent = (props) => {
  const [contentMode, setContentMode] = useState('manual');
  const [uiContentExists, setUiContentExists] = useState(false);

  // Auto-detect UI-generated content
  useEffect(() => {
    checkUIGeneratedContent(); // Checks database for content
  }, []);

  return contentMode === 'uiGenerated' ? 
    <UiGeneratedContent {...props} /> : 
    <ManualContent {...props} />;
};
```

## Database Structure

### Course Development Data

```
/courseDevelopment/{courseId}/{lessonPath}/
├── enabled: boolean                       # Enable UI-generated mode
├── sections: {                            # Individual lesson sections (multi-section approach)
│   ├── {sectionId}: {
│   │   ├── id: string                     # Unique section identifier  
│   │   ├── title: string                  # Section display name
│   │   ├── type: "content" | "assessment" # Section type
│   │   ├── originalCode: string           # Original JSX code (user writes)
│   │   ├── code: string                   # Transformed React.createElement code
│   │   ├── importMetadata: {              # Dynamic import optimization
│   │   │   ├── requiredComponents: object # UI components needed
│   │   │   └── requiredIcons: string[]    # Lucide icons needed
│   │   ├── order: number                  # Display order in lesson
│   │   ├── createdAt: timestamp
│   │   ├── lastModified: timestamp
│   │   ├── modifiedBy: string
│   │   ├── autoTransformed: boolean       # Auto-transform completion status
│   │   │
│   │   └── [Assessment-specific fields]:
│   │       ├── assessmentType: string     # "ai-multiple-choice" | "ai-long-answer"
│   │       ├── assessmentId: string       # Unique assessment identifier  
│   │       └── assessmentConfig: object   # Assessment configuration
│   └── ...
├── sectionOrder: string[]                 # Ordered list of section IDs (for rendering)
├── mainComponent: {                       # Legacy: Combined lesson component
│   ├── code: string                       # Full lesson code (not used in multi-section)
│   ├── lastGenerated: timestamp
│   └── autoGenerated: boolean
├── lastModified: timestamp
└── modifiedBy: string
```

**Key Changes from Original Design:**
- **Multi-Section Rendering**: Sections are now rendered individually rather than combined
- **Import Metadata**: Performance optimization to load only required components
- **Auto-Transform**: Real-time JSX to React.createElement conversion
- **Assessment Integration**: Content and assessment sections in unified interface

### Assessment Configuration

```
/courses_secure/{courseId}/assessmentConfig/{lessonPath}/{assessmentId}
├── id: string                             # Assessment identifier
├── title: string                          # Assessment display name
├── type: "ai-multiple-choice" | "ai-long-answer"
├── status: "active" | "draft" | "archived"
├── configuration: {                       # Type-specific configuration
│   ├── activityType: string               # "lesson" | "assignment" | "exam" | "lab"
│   ├── prompts: {                         # AI generation prompts
│   │   ├── beginner: string
│   │   ├── intermediate: string
│   │   └── advanced: string
│   ├── maxAttempts: number
│   ├── pointsValue: number
│   ├── theme: string                      # UI theme
│   ├── enableAIChat: boolean
│   ├── showFeedback: boolean
│   ├── enableHints: boolean
│   ├── katexFormatting: boolean
│   ├── fallbackQuestions: array           # Backup questions
│   └── [Type-specific fields]
├── createdAt: timestamp
├── modifiedAt: timestamp
├── createdBy: string
├── lessonPath: string
└── insertionPoint: string
```

## Development Workflow

### Creating a Database-Driven Lesson

1. **Automatic UI Generation Detection**
   - System automatically checks for database content on lesson load
   - If database content exists and is enabled, switches to UI-generated mode
   - Staff can toggle between manual and UI-generated modes for comparison

2. **Access Visual Editor**
   ```javascript
   // In lesson component (e.g., courses/3/content/01-intro-ethics/index.js)
   // The hybrid component automatically provides editing interface for staff
   {isStaffView && uiContentExists && (
     <ModernSectionEditor
       courseProps={courseProps}
       currentLessonInfo={itemConfig}
       courseId={courseId}
       currentUser={currentUser}
     />
   )}
   ```

3. **Multi-Section Development**
   - **Content Sections**: Rich text, cards, interactive elements using JSX
   - **Assessment Sections**: AI-powered questions with visual configuration
   - **Drag-and-Drop Ordering**: Visual section reordering with SectionManager
   - **Individual Section Editing**: Each section has its own code editor

4. **Real-time Multi-Section Rendering**
   - Each section renders independently for better performance
   - Changes appear immediately in preview panel
   - JSX automatically transformed to React.createElement code
   - Import metadata extracted for performance optimization

### Section Types

#### Content Sections
```javascript
// Example content section structure
{
  id: "section_1234567890",
  title: "Introduction to Ethics",
  type: "content",
  originalCode: `
    <Card>
      <CardHeader>
        <CardTitle>Financial Ethics</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Understanding ethical decision making in finance...</p>
      </CardContent>
    </Card>
  `,
  code: "/* Auto-transformed React.createElement code */",
  order: 0
}
```

#### Assessment Sections
```javascript
// Example assessment section structure
{
  id: "assessment_1234567890",
  title: "Ethics Quiz",
  type: "assessment",
  assessmentType: "ai-multiple-choice",
  assessmentId: "ethics_quiz_1",
  originalCode: `
    <div className="assessment-section">
      <AIMultipleChoiceQuestion
        courseId={courseId}
        assessmentId="ethics_quiz_1"
        cloudFunctionName="generateDatabaseAssessment"
        lessonPath="01-intro-ethics"
        title="Ethics Quiz"
        theme="purple"
      />
    </div>
  `,
  assessmentConfig: {
    type: "ai-multiple-choice",
    activityType: "lesson",
    prompts: { /* ... */ },
    maxAttempts: 999,
    pointsValue: 5
  }
}
```

## Assessment System

### Generic Assessment Handler

The system uses a single `generateDatabaseAssessment` cloud function that routes to appropriate assessment types based on database configuration.

#### Flow
1. **Frontend calls** `generateDatabaseAssessment`
2. **Function loads** configuration from `/courses_secure/{courseId}/assessmentConfig/...`
3. **Routes to** appropriate handler (`ai-multiple-choice` or `ai-long-answer`)
4. **Uses shared modules** (`createAIMultipleChoice`, `createAILongAnswer`)
5. **Returns result** to frontend

#### Example Call
```javascript
// Frontend assessment component
const result = await generateDatabaseAssessment({
  courseId: "3",
  lessonPath: "01-intro-ethics",
  assessmentId: "ethics_quiz_1",
  operation: "generate",
  difficulty: "intermediate"
});
```

### Assessment Configuration

Assessments are configured through the `AssessmentConfigForm` component:

```javascript
<AssessmentConfigForm
  assessmentType="ai-multiple-choice"
  config={currentConfig}
  onChange={handleConfigChange}
  onSave={handleSave}
  title="Configure Ethics Quiz"
/>
```

## Cloud Functions

### manageCourseSection.js
Handles section CRUD operations:
- `loadLesson`: Load all sections for a lesson
- `saveSection`: Save individual section changes
- `createSection`: Create new sections

### manageDatabaseAssessment.js
Generic assessment handler that:
- Loads assessment configuration from database
- Routes to appropriate assessment type
- Uses shared assessment modules

### autoTransformSections.js
Database trigger that:
- Monitors changes to `originalCode` fields
- Transforms JSX to React.createElement syntax
- Regenerates combined lesson components

### manageDatabaseAssessmentConfig.js
Manages assessment configurations:
- `save`: Create/update assessment configurations
- `load`: Retrieve assessment configurations
- `delete`: Remove assessment configurations

## Dynamic Import System

The system now includes a sophisticated dynamic import system that dramatically improves performance by loading only the components and icons actually needed by each section.

### Performance Benefits
- **Before**: ~800KB loaded (all Lucide icons)
- **After**: ~50-100KB loaded (only used components)
- **Load time**: Reduced by 60-80%
- **Memory usage**: Significantly reduced

### How It Works

1. **Enhanced JSX Transformation** (`jsxTransformerEnhanced.js`)
   - Parses import statements from JSX code
   - Extracts which UI components and Lucide icons are used
   - Returns both transformed code AND import metadata

2. **Dynamic Component Loader** (`DynamicComponentLoader.js`)
   - Loads only components specified in metadata
   - Caches loaded components for performance
   - Supports all UI components and Lucide icons

3. **Selective Loading in UiGeneratedContent**
   - Uses import metadata when available
   - Falls back to loading all icons for backward compatibility
   - Injects exactly what's needed into component execution scope

### Example: Writing JSX with Imports

```javascript
// User writes normal JSX in section editor:
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { BookOpen, Clock } from 'lucide-react';

const TestSection = ({ course, courseId, isStaffView, devMode }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Dynamic Imports Test
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>This only loads the icons you use!</span>
        </div>
      </CardContent>
    </Card>
  );
};
```

The system automatically extracts and stores:
```json
{
  "requiredComponents": {
    "Card": "../../../components/ui/card",
    "CardContent": "../../../components/ui/card",
    "CardHeader": "../../../components/ui/card", 
    "CardTitle": "../../../components/ui/card"
  },
  "requiredIcons": ["BookOpen", "Clock"]
}
```

## Frontend Components

### UiGeneratedContent.js
**Multi-section content renderer** that:
- Listens to database changes in real-time
- Renders each section independently for better performance
- Handles loading states for sections pending auto-transform
- Creates error boundaries for individual sections
- Uses dynamic imports based on metadata for performance
- Provides seamless fallbacks and error handling

### ModernSectionEditor.js  
**Visual editing interface** featuring:
- Resizable panels (sections list, code editor, live preview)
- Real-time preview updates with individual section rendering
- Integrated SectionManager for drag-and-drop section ordering
- Assessment configuration access via sheets
- Mobile-responsive design with tab switching

### SectionManager.js
**Section management UI** that:
- Displays ordered list of sections with type indicators
- Supports drag-and-drop reordering with visual feedback
- Provides unified creation dialog for content and assessment sections
- Shows section type badges (Content/Assessment, MC/LA)
- Handles section editing and deletion with confirmation

### DynamicComponentLoader.js
**Performance optimization system** that:
- Loads only required UI components based on metadata
- Caches loaded components to avoid re-loading
- Supports lazy loading of Lucide icons
- Provides fallback loading for backward compatibility
- Maintains import cache with size limits

### AssessmentConfigForm.js
**Assessment configuration interface** with:
- Type-specific configuration panels (AI Multiple Choice/Long Answer)
- Real-time validation and preview updates  
- Integration with database assessment configuration storage
- Support for rubrics, prompts, and fallback questions

## Configuration Management

### Assessment Configuration Hierarchy

Configuration settings are applied in this priority order:

1. **Assessment-specific configuration** (highest priority)
2. **Activity type configuration** (from course config)
3. **Global course settings** (lowest priority)

### Example Configuration Flow
```javascript
// 1. Database assessment config
const assessmentConfig = {
  type: "ai-multiple-choice",
  activityType: "lesson",
  maxAttempts: 5,  // Override
  prompts: { /* ... */ }
};

// 2. Merged with course defaults
const finalConfig = {
  ...courseDefaults.lesson,    // Activity type defaults
  ...globalSettings,           // Global settings
  ...assessmentConfig          // Assessment-specific (highest priority)
};

// 3. Used by shared assessment module
const assessmentHandler = createAIMultipleChoice(finalConfig);
```

## Troubleshooting

### Common Issues

#### 1. Assessment Not Loading
```
Error: "Assessment configuration not found"
```
**Solution**: Ensure assessment configuration exists in database:
```bash
firebase database:get /courses_secure/{courseId}/assessmentConfig/{lessonPath}/{assessmentId}
```

#### 2. JSX Transformation Errors
```
Error: "JSX transformation failed"
```
**Solution**: Check the `autoTransformSections` trigger logs and ensure valid JSX syntax.

#### 3. Section Not Rendering
```
Error: "Component creation failed"
```
**Solution**: Verify the transformed code is valid React.createElement syntax.

#### 4. Missing Database Configuration
```
Error: "No UI-generated content found"
```
**Solution**: Initialize lesson in database or check `enabled` flag.

### Debugging Steps

1. **Check Database Structure**
   ```bash
   firebase database:get /courseDevelopment/{courseId}/{lessonPath} --pretty
   ```

2. **Verify Assessment Configuration**
   ```bash
   firebase database:get /courses_secure/{courseId}/assessmentConfig --pretty
   ```

3. **Monitor Cloud Function Logs**
   ```bash
   firebase functions:log --only generateDatabaseAssessment
   ```

4. **Test Auto-Transform**
   - Update section `originalCode`
   - Check if `code` field is populated
   - Verify `autoTransformed` flag

### Performance Considerations

- **Real-time Listeners**: Cleaned up on component unmount
- **Code Transformation**: Cached in database to avoid repeated processing
- **Assessment Generation**: Uses fallback questions when AI fails
- **Memory Management**: Large lessons split into individual sections

## Migration Path

### Current Implementation: True Hybrid System

The system is now **fully implemented** as a true hybrid, with automatic detection and seamless switching:

1. **Automatic Detection**: Every lesson automatically detects database content on load
2. **Zero Migration Required**: Existing manual lessons work unchanged
3. **Gradual Enhancement**: Add UI-generated content to lessons as needed
4. **Staff Control**: Staff can toggle between modes for comparison/editing
5. **Student Transparency**: Students see the best version automatically

### Implemented Hybrid Pattern
```javascript
// Current implementation in lessons like 01-intro-ethics-financial-decisions/index.js
const LessonComponent = (props) => {
  const [contentMode, setContentMode] = useState('manual');
  const [uiContentExists, setUiContentExists] = useState(false);

  // Automatic detection of UI-generated content
  useEffect(() => {
    const checkUIGeneratedContent = async () => {
      const snapshot = await get(ref(db, `courseDevelopment/${courseId}/${lessonPath}`));
      if (snapshot.exists() && snapshot.val().enabled) {
        setContentMode('uiGenerated');  // Auto-switch
        setUiContentExists(true);
      }
    };
    checkUIGeneratedContent();
  }, []);

  return (
    <div>
      {/* Staff content mode indicator & toggle */}
      {isStaffView && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <span className={contentMode === 'uiGenerated' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
            {contentMode === 'uiGenerated' ? '🚧 UI-Generated' : '📄 Manual'}
          </span>
          {uiContentExists && (
            <button onClick={() => setContentMode(contentMode === 'manual' ? 'uiGenerated' : 'manual')}>
              Switch to {contentMode === 'manual' ? 'UI-Generated' : 'Manual'}
            </button>
          )}
        </div>
      )}
      
      {/* Render appropriate content */}
      {contentMode === 'uiGenerated' ? (
        <UiGeneratedContent {...props} />
      ) : (
        <ManualContent {...props} />
      )}
    </div>
  );
};
```

### Current Status
- ✅ **Hybrid system fully implemented**
- ✅ **Multi-section rendering operational**
- ✅ **Dynamic import system active**
- ✅ **Assessment integration complete**
- ✅ **Real-time editing functional**
- ✅ **Performance optimizations deployed**

---

## Additional Resources

- [File-Based Assessment Workflow](./ASSESSMENT_WORKFLOW.md) - Traditional assessment system documentation
- [Dynamic Import Implementation Summary](./components/content/IMPLEMENTATION_SUMMARY.md) - Performance optimization details
- [Shared Assessment Types Documentation](../functions/shared/assessment-types/) - Reusable assessment modules
- [SectionManager Component](./components/codeEditor/SectionManager.js) - Section management implementation
- [UiGeneratedContent Component](./components/content/UiGeneratedContent.js) - Multi-section rendering system

---

## Summary

The database-driven course development system is now a **mature, production-ready hybrid system** that:

✅ **Automatically detects** and switches between manual and UI-generated content  
✅ **Renders sections independently** for optimal performance and flexibility  
✅ **Optimizes loading** with dynamic imports based on usage metadata  
✅ **Integrates assessments** seamlessly within the content editing workflow  
✅ **Provides real-time editing** with live preview and drag-and-drop management  
✅ **Maintains backward compatibility** with zero migration required  

The system represents a significant evolution from the original design, implementing true hybrid functionality with automatic detection, multi-section architecture, and performance optimizations that make it both powerful for developers and transparent for students.

