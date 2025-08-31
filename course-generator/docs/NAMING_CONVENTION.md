# Course Generator Naming Convention Guide

## Core Principle: Full ItemId Everywhere

This course generation system uses a **consistent naming convention** where the `itemId` from your course configuration is used exactly as-is for all folder names and references throughout the system.

## Benefits

✅ **Complete Consistency** - The same ID appears in:
- Firebase Database configuration
- Frontend folder names
- Backend folder names  
- Assessment mappings
- Content registries

✅ **No Translation Needed** - What you define in the config is exactly what gets created on the filesystem

✅ **Easier Debugging** - When you see an error mentioning an itemId, you can directly navigate to that exact folder

✅ **Future-Proof** - Works with any itemId pattern you choose

## ItemId Format Recommendations

While the system accepts any valid itemId, we recommend this format for clarity:

```
{number}_{subject}_{identifier}_{topic}
```

### Examples:
- `01_data_science_introduction_overview`
- `02_physics_30_momentum_basics`
- `03_math_20_algebra_review`

## How It Works

### 1. Database Configuration
```json
{
  "itemId": "01_data_science_introduction_overview",
  "title": "Introduction to Data Science",
  "type": "lesson"
}
```

### 2. Generated Frontend Structure
```
src/FirebaseCourses/courses/5/content/
└── 01_data_science_introduction_overview/
    └── index.js
```

### 3. Generated Backend Structure  
```
functions/courses/5/
└── 01_data_science_introduction_overview/
    └── assessments.js
```

### 4. Content Registry
```javascript
const contentRegistry = {
  '01_data_science_introduction_overview': LessonComponent,
  // itemId matches folder name exactly
};
```

### 5. Assessment Mapping
```javascript
module.exports = {
  'course5_01_knowledge_check': '01_data_science_introduction_overview/assessments',
  // Path uses the exact itemId as folder name
};
```

## Question ID Convention

Question IDs should follow this pattern:
```
course{courseId}_{lessonNumber}_{description}
```

Examples:
- `course5_01_introduction_knowledge_check`
- `course5_02_python_syntax`
- `course5_11_exam_section1`

## Important Notes

1. **No Shortened Versions** - The generator will never shorten or modify your itemIds
2. **Underscores in Folders** - Folder names will contain underscores if your itemIds do
3. **JavaScript Imports** - Import names are sanitized (no numbers at start, no special characters)
4. **Case Sensitive** - ItemIds are case-sensitive throughout the system

## Migration from Old Naming

If you have existing courses using shortened folder names (like `01-introduction` instead of `01_physics_30_introduction`), you have two options:

1. **Keep existing courses as-is** - They will continue to work
2. **Regenerate with new convention** - Use the updated generator to create consistent naming

## Best Practices

1. **Be Descriptive** - Use clear, descriptive itemIds that indicate the content
2. **Be Consistent** - Use the same pattern across all items in a course
3. **Number Sequentially** - Use padded numbers (01, 02, etc.) for proper sorting
4. **Avoid Special Characters** - Stick to letters, numbers, and underscores

## Example Course Configuration

```json
{
  "courseId": "5",
  "title": "Introduction to Data Science",
  "courseStructure": {
    "units": [{
      "unitId": "unit_1_foundations",
      "name": "Foundations",
      "items": [
        {
          "itemId": "01_data_science_introduction_overview",
          "title": "Introduction to Data Science",
          "type": "lesson",
          "questions": [{
            "questionId": "course5_01_introduction_knowledge_check",
            "title": "Knowledge Check",
            "points": 1
          }]
        }
      ]
    }]
  }
}
```

This configuration will generate folders named exactly `01_data_science_introduction_overview` in both frontend and backend.

## Troubleshooting

**Issue**: "Content Not Found" error
**Solution**: Ensure the folder name matches the itemId exactly

**Issue**: JavaScript import errors
**Solution**: The generator automatically handles invalid JavaScript identifiers by prefixing with "Lesson"

**Issue**: Assessment not loading
**Solution**: Check that the assessment-mapping.js uses the exact itemId as the folder path

---

*Last Updated: January 2025*
*Generator Version: 2.0.0 (Full ItemId Convention)*