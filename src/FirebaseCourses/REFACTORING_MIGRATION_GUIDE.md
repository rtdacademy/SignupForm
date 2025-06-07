# Course Router Refactoring Migration Guide

## Overview

We've refactored the course routing system to eliminate duplication between `StaffCourseWrapper` and `CourseRouter`. The new architecture provides:

1. **Single source of truth** for course imports and routing logic
2. **Flexible rendering modes** to support different wrapper requirements
3. **Elimination of navigation-within-navigation** issues
4. **Cleaner separation of concerns**

## New Architecture

### Components

1. **CourseRouterEnhanced** (`CourseRouterEnhanced.js`)
   - Central routing logic for all courses
   - Supports multiple render modes
   - Single place to add new courses

2. **CourseRouter** (`CourseRouter.js`)
   - Now a thin wrapper around CourseRouterEnhanced
   - Maintains backward compatibility
   - No changes needed for existing usage

3. **StaffCourseWrapperRefactored** (`StaffCourseWrapperRefactored.js`)
   - Uses CourseRouterEnhanced in `content-only` mode
   - No duplicate course imports
   - Maintains all staff-specific features

## Migration Steps

### For Staff Course Wrapper

Replace the import in your route configuration:

```javascript
// Before
import StaffCourseWrapper from './FirebaseCourses/StaffCourseWrapper';

// After
import StaffCourseWrapperRefactored from './FirebaseCourses/StaffCourseWrapperRefactored';
```

### For Direct CourseRouter Usage

No changes needed! The existing CourseRouter maintains full backward compatibility.

### For New Course Additions

Add new courses only in `CourseRouterEnhanced.js`:

```javascript
// 1. Add import
const Course5 = lazy(() => import('./courses/5'));

// 2. Add structure helper (if needed)
const getCourse5Structure = () => {
  const data = require('./courses/5/course-structure.json');
  return {
    title: "Course 5 Title",
    structure: data.courseStructure?.units || []
  };
};

// 3. Add to getCourseStructure helper
case 5:
case '5':
  return getCourse5Structure();

// 4. Add to renderCourseContent
case 5:
case '5':
  return (
    <Suspense fallback={<LoadingCourse />}>
      <Course5 {...courseProps} />
    </Suspense>
  );
```

## Render Modes

CourseRouterEnhanced supports three render modes:

1. **'wrapped'** (default) - Uses FirebaseCourseWrapper with full navigation
2. **'content-only'** - Returns just the course content without any wrapper
3. **'custom-wrapper'** - Use a custom wrapper component

Example usage:

```javascript
// Content only (for StaffCourseWrapper)
<CourseRouterEnhanced
  course={course}
  renderMode="content-only"
  externalActiveItemId={activeItemId}
  externalOnItemSelect={handleItemSelect}
/>

// With custom wrapper
<CourseRouterEnhanced
  course={course}
  renderMode="custom-wrapper"
  customWrapper={MyCustomWrapper}
  wrapperProps={{ additionalProp: value }}
/>
```

## Benefits

1. **No Duplication**: Course imports and routing logic exist in only one place
2. **Flexible**: Different rendering modes for different use cases
3. **Maintainable**: Adding new courses requires changes in only one file
4. **Compatible**: Existing code continues to work without changes

## Testing Checklist

Before deploying:

- [ ] Test student course access through normal routes
- [ ] Test staff course access through admin routes
- [ ] Verify navigation works correctly (no duplicate navigation)
- [ ] Check that dev mode and code editor still function
- [ ] Ensure progress and grades tabs work in staff view
- [ ] Confirm course content renders correctly
- [ ] Test on mobile devices

## Rollback Plan

If issues arise, you can temporarily revert by:

1. Changing the import back to the original StaffCourseWrapper
2. The original files remain unchanged and functional

## Future Improvements

Consider these enhancements:

1. Lazy load the course structure JSON files
2. Add TypeScript types for better type safety
3. Create a course registry pattern for even cleaner additions
4. Add unit tests for the routing logic