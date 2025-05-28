# Student Properties Integration Guide

## Overview
This guide shows how to integrate the student properties components into the parent dashboard.

## Basic Integration

### 1. Import Components
```javascript
import { 
  ProfileCompletionTracker, 
  PASIProgressIndicator 
} from '../Registration/studentProperties';
```

### 2. Add to Parent Dashboard

In your `ParentDashboard.js`, add the profile completion tracker:

```javascript
// Inside your parent dashboard component
const ParentDashboard = () => {
  // ... existing code ...

  const handleStudentDataUpdate = (updatedStudentData) => {
    // Update the local state with the new data
    setParentData(prev => ({
      ...prev,
      linkedStudents: prev.linkedStudents.map(student => 
        student.studentKey === updatedStudentData.studentKey 
          ? updatedStudentData 
          : student
      )
    }));
  };

  // Add this inside your student display section
  return (
    <div>
      {/* Existing student info */}
      
      {/* Add PASI Progress Indicator (compact view) */}
      <Card className="mb-4">
        <CardContent className="py-3">
          <PASIProgressIndicator 
            studentData={selectedStudent} 
            compact={true} 
          />
        </CardContent>
      </Card>

      {/* Add Profile Completion Tracker */}
      <ProfileCompletionTracker
        studentData={selectedStudent}
        onUpdate={handleStudentDataUpdate}
      />
    </div>
  );
};
```

### 3. Full PASI Progress View (Optional)

For a dedicated PASI readiness view:

```javascript
// Add a tab or section for PASI readiness
<Tabs>
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="profile">Profile Completion</TabsTrigger>
    <TabsTrigger value="pasi">PASI Readiness</TabsTrigger>
  </TabsList>
  
  <TabsContent value="pasi">
    <PASIProgressIndicator 
      studentData={selectedStudent} 
      compact={false} 
    />
  </TabsContent>
</Tabs>
```

## Understanding the Requirements System

### Student Requirements Configuration

The system automatically determines required fields based on:
- **Student Type**: Different requirements for Adult, International, Home Education, etc.
- **Age**: Students under 18 require parent/guardian information
- **Special Cases**: International students need different documents

### Field Importance Levels

1. **PASI Required**: Must have for Alberta Education registration
2. **Required**: Must have for basic functionality
3. **Recommended**: Should have but not blocking
4. **Optional**: Nice to have

### Dynamic Requirements

The system adapts requirements based on student characteristics:

```javascript
// Example: Getting requirements for a specific student
import { getStudentRequirements } from '../Registration/studentProperties';

const requirements = getStudentRequirements(studentData);
// Returns customized requirements based on student type and age
```

## Features

### 1. Profile Completion Tracker
- Shows overall completion percentage
- Breaks down by category (Personal, Address, Academic, etc.)
- Allows editing each category
- Shows which fields are missing
- Indicates PASI requirements

### 2. PASI Progress Indicator
- Focused view on PASI readiness
- Shows critical missing fields
- Provides checklist of key requirements
- Available in compact and full views

### 3. Individual Editors
Each category has its own editor:
- `PersonalInfoEditor`: Names, birthday, gender, phone
- `AddressEditor`: Street address, city, province, postal code
- `AcademicInfoEditor`: ASN, grade level, home school
- `GuardianInfoEditor`: Parent contact information
- `StatusEditor`: Residency and indigenous status
- `DocumentsEditor`: Photos and citizenship documents

## Security Features

All updates go through cloud functions that:
1. Verify the user is the primary parent
2. Validate all input data
3. Create audit trail in profileHistory
4. Return updated data for real-time updates

## Customization

### Styling
Components use your existing Tailwind classes and can be customized:

```javascript
// Example: Custom wrapper
<div className="custom-wrapper">
  <ProfileCompletionTracker 
    studentData={selectedStudent}
    onUpdate={handleUpdate}
  />
</div>
```

### Conditional Display
Show components based on permissions:

```javascript
{selectedStudent.permissions.editContactInfo && (
  <ProfileCompletionTracker 
    studentData={selectedStudent}
    onUpdate={handleUpdate}
  />
)}
```

## Best Practices

1. **Always handle updates**: Update local state when data changes
2. **Show loading states**: Components handle their own loading, but wrap in skeleton if needed
3. **Error handling**: Components show errors, but you can add global error handling
4. **Permissions**: Check parent permissions before showing edit capabilities
5. **Mobile responsive**: Components are responsive but test on target devices

## Example: Complete Integration

```javascript
import React, { useState } from 'react';
import { 
  ProfileCompletionTracker, 
  PASIProgressIndicator,
  calculateCompletionStats 
} from '../Registration/studentProperties';

const EnhancedStudentView = ({ student, onUpdate }) => {
  const stats = calculateCompletionStats(student);
  
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Profile Complete</p>
            <p className="text-2xl font-bold">{stats.completionPercentage}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">PASI Ready</p>
            <p className="text-2xl font-bold">
              {stats.pasiCompletionPercentage === 100 ? '✓' : `${stats.pasiCompletionPercentage}%`}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* PASI Status Bar */}
      <PASIProgressIndicator studentData={student} compact={true} />
      
      {/* Full Profile Tracker */}
      <ProfileCompletionTracker
        studentData={student}
        onUpdate={onUpdate}
      />
    </div>
  );
};
```