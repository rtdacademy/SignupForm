# Course Generator System

A comprehensive system for generating, managing, and rolling back Firebase courses with full backup support.

## Quick Start

```bash
# Generate a new course
node course-generator/scripts/generate-course-with-rollback.js generate course-generator/configs/course-sample-config.json

# Rollback if needed
node course-generator/scripts/generate-course-with-rollback.js rollback 5

# Clean everything
node course-generator/scripts/generate-course-with-rollback.js clean 5
```

## Directory Structure

```
course-generator/
├── configs/           # Course configuration JSON files
│   └── course-sample-config.json
├── scripts/           # Generation and management scripts
│   └── generate-course-with-rollback.js # Course generator with rollback
├── docs/              # Documentation
│   ├── COURSE_ARCHITECTURE.md          # System architecture
│   └── COURSE_GENERATOR_README.md      # Detailed usage guide
├── backups/           # Automatic backups of existing courses
├── manifests/         # Generation and backup manifests
└── README.md          # This file
```

## Features

### 🚀 Generation
- Complete course structure from JSON config
- Frontend React components
- Backend assessment configurations
- Automatic file organization
- Boilerplate code generation

### 🔄 Rollback Support
- Automatic backup before overwriting
- Manifest tracking of all generated files
- Single command rollback
- Clean removal of all traces

### 📁 Organization
- Centralized configuration storage
- Separated scripts and documentation
- Backup management
- Generation tracking

## Commands

### Generate Course
```bash
node course-generator/scripts/generate-course-with-rollback.js generate <config.json>
```

Creates:
- Frontend components in `src/FirebaseCourses/courses/{courseId}/`
- Backend assessments in `functions/courses/{courseId}/`
- Configuration copy in `course-generator/configs/`
- Generation manifest in `course-generator/manifests/`

### Rollback Course
```bash
node course-generator/scripts/generate-course-with-rollback.js rollback <courseId>
```

Actions:
- Removes all generated files
- Cleans empty directories
- Shows available backups
- Preserves backup for restoration

### Clean Course
```bash
node course-generator/scripts/generate-course-with-rollback.js clean <courseId>
```

Removes:
- All frontend files
- All backend files
- All backups
- All manifests

## Configuration Format

Create a JSON file in `course-generator/configs/`:

```json
{
  "courseId": "5",
  "title": "Course Title",
  "courseStructure": {
    "units": [{
      "unitId": "unit_1",
      "name": "Unit Name",
      "order": 1,
      "items": [{
        "itemId": "01_subject_grade_lesson_name",
        "title": "Lesson Title",
        "type": "lesson",
        "order": 1,
        "questions": [{
          "questionId": "course5_01_question1",
          "title": "Question Title",
          "points": 1
        }]
      }]
    }]
  }
}
```

See `configs/course-sample-config.json` for a complete example.

## Workflow

### Creating a New Course

1. **Create Configuration**
   ```bash
   cp course-generator/configs/course-sample-config.json course-generator/configs/my-course.json
   # Edit my-course.json with your course structure
   ```

2. **Generate Course**
   ```bash
   node course-generator/scripts/generate-course-with-rollback.js generate course-generator/configs/my-course.json
   ```

3. **Customize Content**
   - Edit lesson components in `src/FirebaseCourses/courses/{courseId}/content/`
   - Add questions to `functions/courses/{courseId}/*/assessments.js`

4. **Test and Deploy**
   - Import course in `FirebaseCourseWrapperImproved.js`
   - Upload config to Firebase
   - Test with student account

### Updating an Existing Course

1. **Modify Configuration**
   ```bash
   # Edit the config file
   vim course-generator/configs/course-5-config.json
   ```

2. **Regenerate with Backup**
   ```bash
   # Automatically backs up existing files
   node course-generator/scripts/generate-course-with-rollback.js generate course-generator/configs/course-5-config.json
   ```

3. **If Issues Arise**
   ```bash
   # Rollback to remove generated files
   node course-generator/scripts/generate-course-with-rollback.js rollback 5
   
   # Or completely clean
   node course-generator/scripts/generate-course-with-rollback.js clean 5
   ```

## Safety Features

### Automatic Backups
- Creates timestamped backups before overwriting
- Stores in `course-generator/backups/`
- Preserves directory structure

### Manifest Tracking
- Records every generated file
- Enables precise rollback
- Stored in `course-generator/manifests/`

### Non-Destructive Operations
- Never modifies custom content
- Preserves manual edits in backups
- Clean removal without affecting other courses

## Best Practices

1. **Version Control**
   - Commit configs to git
   - Tag releases after generation
   - Document custom modifications

2. **Configuration Management**
   - Keep configs in `course-generator/configs/`
   - Use descriptive filenames
   - Include metadata in configs

3. **Testing**
   - Generate in development first
   - Test all assessments
   - Verify navigation flow

4. **Backup Strategy**
   - Regular backups are automatic
   - Keep important backups longer
   - Clean old backups periodically

## Troubleshooting

### Generation Fails
```bash
# Check configuration syntax
cat course-generator/configs/my-course.json | python -m json.tool

# Ensure courseId is unique
ls src/FirebaseCourses/courses/
```

### Rollback Not Working
```bash
# Check manifest exists
ls course-generator/manifests/course-*-manifest.json

# Manual cleanup if needed
rm -rf src/FirebaseCourses/courses/{courseId}
rm -rf functions/courses/{courseId}
```

### Files Not Generated
- Verify all required fields in config
- Check console output for errors
- Ensure proper permissions

## Advanced Usage

### Batch Generation
```bash
# Generate multiple courses
for config in course-generator/configs/*.json; do
  node course-generator/scripts/generate-course-with-rollback.js generate "$config"
done
```

### Custom Templates
Edit generator functions in the script:
- `generateCourseIndex()` - Main course component
- `generateLessonComponent()` - Lesson templates
- `generateAssessmentConfig()` - Assessment structure

### Integration with CI/CD
```yaml
# Example GitHub Action
- name: Generate Course
  run: |
    node course-generator/scripts/generate-course-with-rollback.js generate ${{ github.workspace }}/course-generator/configs/course-${{ env.COURSE_ID }}.json
```

## Documentation

- **[COURSE_ARCHITECTURE.md](docs/COURSE_ARCHITECTURE.md)** - Complete system architecture
- **[COURSE_GENERATOR_README.md](docs/COURSE_GENERATOR_README.md)** - Detailed generator guide
- **Sample Config** - `configs/course-sample-config.json`

## Support

For issues or questions:
1. Check documentation in `docs/`
2. Review sample configuration
3. Examine generated file structure
4. Check generation manifests for debugging

---

*Generated courses follow the Firebase Course System architecture. See docs for complete details.*