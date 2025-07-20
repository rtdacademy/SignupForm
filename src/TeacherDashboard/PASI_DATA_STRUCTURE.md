# PASI Data Structure Documentation

## Overview

The PASI (Provincial Approach to Student Information) data upload system has been updated to merge Course Registrations and School Enrollments data into a single, compressed JSON file stored in Cloud Storage.

## Data Structure

### Merged Data Format

The merged data is structured as a JSON object where each key is an Alberta Student Number (ASN):

```json
{
  "123456789": {
    "asn": "123456789",
    "schoolEnrollment": {
      // All fields from school enrollment CSV record
      "asn": "123456789",
      "studentName": "John Doe",
      "grade": "12",
      "school": "Example High School",
      // ... other enrollment fields
    },
    "courseRegistrations": [
      {
        // Course 1 registration data
        "asn": "123456789",
        "courseCode": "ELA30-1",
        "courseName": "English Language Arts 30-1",
        "registrationDate": "2024-09-01",
        // ... other course fields
      },
      {
        // Course 2 registration data
        "asn": "123456789",
        "courseCode": "MATH30-1",
        "courseName": "Mathematics 30-1",
        "registrationDate": "2024-09-01",
        // ... other course fields
      }
    ],
    "metadata": {
      "lastUpdated": "2024-01-10T10:30:00Z",
      "courseCount": 2,
      "warning": null // Optional warning message
    }
  }
}
```

## Data Relationships

- **One-to-One**: Each ASN has at most one school enrollment record
- **One-to-Many**: Each ASN can have multiple course registration records
- **Key Field**: ASN (Alberta Student Number) is used to link records

## Warning Conditions

The system will flag the following conditions:

1. **Students with courses but no enrollment**: Students who have course registrations but no school enrollment record
2. **Students with enrollment but no courses**: Students who have school enrollment but no course registrations

These warnings are stored in the `metadata.warning` field for each student.

## Cloud Storage Organization

```
pasiData/
├── mergedPasiData/
│   └── 2024/
│       └── mergedPasiData_2024-01-10_abc123.json.gz
├── courseRegistrations/
│   └── 2024/
│       └── courseRegistrations_2024-01-10_def456.json.gz (legacy)
└── schoolEnrollments/
    └── 2024/
        └── schoolEnrollments_2024-01-10_ghi789.json.gz (legacy)
```

## Realtime Database Metadata

The system stores metadata in the Realtime Database for quick reference:

```json
{
  "pasiData": {
    "mergedPasiData": {
      "latestUpload": {
        "uploadDate": "2024-01-10T10:30:00Z",
        "uploadTimestamp": 1704887400000,
        "recordCount": 1500,
        "studentCount": 1500,
        "totalCourseCount": 4200,
        "schoolEnrollmentCount": 1480,
        "originalCourseRegistrationCount": 4200,
        "filePath": "pasiData/mergedPasiData/2024/mergedPasiData_2024-01-10_abc123.json.gz",
        "fileName": "mergedPasiData_2024-01-10_abc123.json.gz",
        "fileSize": 524288,
        "originalSize": 2621440,
        "compressionRatio": 80.5,
        "uploadedBy": "user@example.com",
        "uploadedByUid": "abc123",
        "cloudStorageUrl": "gs://bucket-name/pasiData/mergedPasiData/2024/mergedPasiData_2024-01-10_abc123.json.gz",
        "status": "completed",
        "dataStructure": "merged_by_asn"
      }
    }
  }
}
```

## Usage Examples

### Retrieving All Merged Data

```javascript
import { usePasiData } from './usePasiData';

const { retrieveLatestMergedData } = usePasiData();

const loadAllData = async () => {
  const result = await retrieveLatestMergedData();
  // result.data contains the full merged structure
  console.log(`Loaded ${result.recordCount} students`);
};
```

### Retrieving Specific Student Data

```javascript
const { retrieveStudentData } = usePasiData();

const loadStudent = async (asn) => {
  const result = await retrieveStudentData(asn);
  // result.data contains: { asn, schoolEnrollment, courseRegistrations, metadata }
  console.log(`Student has ${result.courseCount} courses`);
};
```

### Working with Retrieved Data

```javascript
// Accessing student data
const studentData = mergedData['123456789'];

// Check if student has enrollment
if (studentData.schoolEnrollment) {
  console.log(`Student enrolled at: ${studentData.schoolEnrollment.school}`);
}

// Iterate through courses
studentData.courseRegistrations.forEach(course => {
  console.log(`Course: ${course.courseCode} - ${course.courseName}`);
});

// Check for warnings
if (studentData.metadata.warning) {
  console.warn(`Warning for ASN ${studentData.asn}: ${studentData.metadata.warning}`);
}
```

## Benefits of Merged Structure

1. **Efficient Lookups**: O(1) access to student data by ASN
2. **Data Integrity**: Maintains relationships between enrollment and courses
3. **Compression**: Typically 80-90% compression for CSV/JSON data
4. **Flexibility**: Easy to add new data types or fields
5. **Auditability**: Complete upload history and metadata tracking
6. **Scalability**: No database size limits, efficient cloud storage

## Migration Notes

- Existing separate uploads still supported for backward compatibility
- New merged uploads recommended for all future data uploads
- Old data structure: separate arrays of records
- New data structure: object keyed by ASN with nested data