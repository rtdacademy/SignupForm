# Course Generator Testing Guide

## Pre-Test Checklist

Before testing, verify:
- [ ] Node.js is installed (`node --version`)
- [ ] You're in the project root directory (`/mnt/c/Users/kyle_/Documents/GitHub/SignupForm`)
- [ ] The sample config exists at `course-generator/configs/course-sample-config.json`

## Test 1: Generate a New Course (Clean Generation)

### Command
```bash
node course-generator/scripts/generate-course-with-rollback.js generate course-generator/configs/course-sample-config.json
```

### Expected Output
You should see:
```
════════════════════════════════════════
Course Generation with Rollback Support
════════════════════════════════════════
ℹ Loaded configuration from course-generator/configs/course-sample-config.json

════════════════════════════════════════════════════
Generating Course 5: Introduction to Data Science
════════════════════════════════════════════════════
ℹ Creating frontend structure...
✓ Created: src/FirebaseCourses/courses/5/index.js
✓ Created: src/FirebaseCourses/courses/5/content/index.js
✓ Created: src/FirebaseCourses/courses/5/content/01-introduction-overview/index.js
✓ Created: src/FirebaseCourses/courses/5/content/02-python-basics/index.js
[... more files ...]

ℹ Creating backend structure...
✓ Created: functions/courses/5/assessment-mapping.js
✓ Created: functions/courses/5/01-introduction-overview/assessments.js
[... more files ...]

✓ Generation manifest saved: course-generator/manifests/course-5-manifest.json

═══════════════════════
Generation Complete!
═══════════════════════
✓ ✅ Course 5 has been generated successfully

📊 Course Statistics:
   Units: 3
   Items: 11
   Questions: 30
   Files Generated: ~25-30 files
```

### Verify Created Files
Check that these directories and files exist:

**Frontend:**
```bash
ls -la src/FirebaseCourses/courses/5/
# Should show:
# - index.js
# - content/

ls -la src/FirebaseCourses/courses/5/content/
# Should show:
# - index.js (registry)
# - 01-introduction-overview/
# - 02-python-basics/
# - ... (all lesson folders)
```

**Backend:**
```bash
ls -la functions/courses/5/
# Should show:
# - assessment-mapping.js
# - 01-introduction-overview/
# - 02-python-basics/
# - ... (lesson folders with assessments)
```

**Config & Manifest:**
```bash
ls -la course-generator/configs/
# Should show:
# - course-5-generated.json (new file)

ls -la course-generator/manifests/
# Should show:
# - course-5-manifest.json
```

## Test 2: Regenerate (Test Backup System)

### Command
Run the same generation command again:
```bash
node course-generator/scripts/generate-course-with-rollback.js generate course-generator/configs/course-sample-config.json
```

### Expected Output
This time you should see backup messages:
```
⚠ Frontend files exist for course 5, creating backup...
✓ Backup created at: course-generator/backups/course-5-2025-01-31T...
⚠ Backend files exist for course 5, creating backup...
✓ Backup created at: course-generator/backups/course-5-2025-01-31T...
ℹ Manifest saved at: course-generator/manifests/backup-5-2025-01-31T...

[... generation continues ...]

⚠️  Previous files were backed up
To restore previous version:
► node course-generator/scripts/generate-course-with-rollback.js rollback 5
```

### Verify Backup
```bash
ls -la course-generator/backups/
# Should show a timestamped folder like:
# course-5-2025-01-31T12-30-45-123Z/

ls -la course-generator/manifests/
# Should show backup manifest:
# backup-5-2025-01-31T12-30-45-123Z.json
```

## Test 3: Rollback

### Command
```bash
node course-generator/scripts/generate-course-with-rollback.js rollback 5
```

### Expected Output
```
═══════════════════════
Rolling Back Course 5
═══════════════════════
ℹ Found manifest from 2025-01-31T...
ℹ Will remove 25 files
► Removed: src/FirebaseCourses/courses/5/index.js
► Removed: src/FirebaseCourses/courses/5/content/index.js
[... lists all removed files ...]
► Removed empty directory: src/FirebaseCourses/courses/5/content
► Removed empty directory: src/FirebaseCourses/courses/5

📦 Available backups:
   1. 2025-01-31T12-30-45-123Z

To restore a backup, use:
► node course-generator/scripts/generate-course-with-rollback.js restore 5 <backup-timestamp>

✅ Rollback complete! Removed 25 files
```

### Verify Removal
```bash
ls -la src/FirebaseCourses/courses/5/
# Should show: No such file or directory

ls -la functions/courses/5/
# Should show: No such file or directory

# But backups still exist:
ls -la course-generator/backups/
# Should still show the backup folder
```

## Test 4: Generate Again After Rollback

### Command
```bash
node course-generator/scripts/generate-course-with-rollback.js generate course-generator/configs/course-sample-config.json
```

### Expected
- Should generate fresh files without creating backups (since files don't exist)
- All files should be recreated

## Test 5: Clean (Complete Removal)

### Command
```bash
node course-generator/scripts/generate-course-with-rollback.js clean 5
```

### Expected Output
```
═══════════════════════
Cleaning Course 5
═══════════════════════
⚠ This will permanently remove:
  - Frontend: src/FirebaseCourses/courses/5
  - Backend: functions/courses/5
  - All backups and manifests
✓ Removed frontend files
✓ Removed backend files
► Removed manifest: course-5-manifest.json
► Removed manifest: backup-5-2025...json
► Removed backup: course-5-2025...

✅ Course 5 completely removed
```

### Verify Complete Removal
```bash
ls -la src/FirebaseCourses/courses/5/
# Should show: No such file or directory

ls -la functions/courses/5/
# Should show: No such file or directory

ls -la course-generator/backups/
# Should be empty or not contain course-5 folders

ls -la course-generator/manifests/
# Should not contain course-5 related files
```

## Test 6: Error Handling

### Test Missing Config
```bash
node course-generator/scripts/generate-course-with-rollback.js generate nonexistent.json
```
**Expected:** Error message about file not found

### Test Invalid Command
```bash
node course-generator/scripts/generate-course-with-rollback.js invalid-command
```
**Expected:** Error showing available commands (generate, rollback, clean)

### Test Rollback Non-Existent Course
```bash
node course-generator/scripts/generate-course-with-rollback.js rollback 999
```
**Expected:** Error about no manifest found for course 999

## Quick Validation Script

Create a quick test to verify everything:

```bash
# Test sequence
echo "1. Generating course..."
node course-generator/scripts/generate-course-with-rollback.js generate course-generator/configs/course-sample-config.json

echo "2. Checking files exist..."
[ -f "src/FirebaseCourses/courses/5/index.js" ] && echo "✓ Frontend created" || echo "✗ Frontend missing"
[ -f "functions/courses/5/assessment-mapping.js" ] && echo "✓ Backend created" || echo "✗ Backend missing"

echo "3. Testing rollback..."
node course-generator/scripts/generate-course-with-rollback.js rollback 5

echo "4. Checking files removed..."
[ ! -f "src/FirebaseCourses/courses/5/index.js" ] && echo "✓ Frontend removed" || echo "✗ Frontend still exists"
[ ! -f "functions/courses/5/assessment-mapping.js" ] && echo "✓ Backend removed" || echo "✗ Backend still exists"

echo "5. Cleaning up..."
node course-generator/scripts/generate-course-with-rollback.js clean 5

echo "Test complete!"
```

## What Success Looks Like

✅ **Successful Generation:**
- ~25-30 files created
- Proper directory structure
- Manifest saved
- Clear success messages

✅ **Successful Backup:**
- Warning about existing files
- Backup folder created with timestamp
- Can regenerate without losing work

✅ **Successful Rollback:**
- All generated files removed
- Empty directories cleaned up
- Backups preserved
- Manifest shows what was removed

✅ **Successful Clean:**
- Everything removed including backups
- No trace of the course remains
- Clean slate for fresh start

## Common Issues

### Permission Errors
If you see permission errors, ensure you have write access to all directories.

### Path Issues
If paths don't resolve, ensure you're running from the project root:
```bash
pwd
# Should show: /mnt/c/Users/kyle_/Documents/GitHub/SignupForm
```

### Module Not Found
If Node can't find modules, ensure all dependencies exist:
```bash
npm install
```

## Next Steps After Successful Test

1. **Customize the Generated Content:**
   - Edit lesson components in `src/FirebaseCourses/courses/5/content/*/index.js`
   - Add real questions to `functions/courses/5/*/assessments.js`

2. **Import in Main Wrapper:**
   ```javascript
   // In src/FirebaseCourses/FirebaseCourseWrapperImproved.js
   const Course5 = React.lazy(() => import('./courses/5'));
   ```

3. **Upload to Firebase:**
   ```bash
   firebase database:set /courses/5/course-config course-generator/configs/course-5-generated.json
   ```

4. **Test in Browser:**
   - Start dev server: `npm start`
   - Navigate to the course
   - Verify lessons load correctly

---

*Remember: You can always rollback if something goes wrong!*