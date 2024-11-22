import React from 'react';
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Loader2 } from "lucide-react";
import { getDatabase, ref, get } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

// Utility function to determine if school selection should be shown
const shouldShowSchoolSelection = (studentType) => {
  return studentType === 'Non-Primary' || 
         studentType === 'Home Education' || 
         studentType === 'Summer School';
};

const ReviewSection = ({ title, items }) => (
  <div className="space-y-3">
    <h3 className="font-semibold text-lg">{title}</h3>
    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
      {items.map(([label, value]) => value && (
        <div key={label} className="space-y-1">
          <dt className="text-sm font-medium text-gray-500">{label}</dt>
          <dd className="text-sm">{value}</dd>
        </div>
      ))}
    </dl>
  </div>
);

const StudentRegistrationReview = ({ onBack }) => {
  const { user } = useAuth();
  const uid = user?.uid;
  const [registrationData, setRegistrationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRegistrationData = async () => {
      if (!uid) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      try {
        const db = getDatabase();
        const regRef = ref(db, `users/${uid}/pendingRegistration`);
        const snapshot = await get(regRef);

        if (snapshot.exists()) {
          setRegistrationData(snapshot.val());
        } else {
          setError('No registration data found');
        }
      } catch (err) {
        console.error('Error fetching registration data:', err);
        setError('Failed to load registration data');
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrationData();
  }, [uid]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>{error}</p>
      </div>
    );
  }

  if (!registrationData?.formData) {
    return null;
  }

  const { formData } = registrationData;
  const isAdultStudent = formData.studentType === 'Adult Student';

  // Create name display that handles preferred names for both student types
  const nameDisplay = formData.preferredFirstName && formData.preferredFirstName !== formData.firstName
    ? `${formData.firstName} ${formData.lastName} (Preferred: ${formData.preferredFirstName})`
    : `${formData.firstName} ${formData.lastName}`;

  const personalInfo = [
    ['Name', nameDisplay],
    ['Email', user.email],
    ['Phone', formData.phoneNumber],
    ['Birthday', formData.birthday],
    ['Age', formData.age ? `${formData.age} years old` : ''],
    ['Alberta Student Number', formData.albertaStudentNumber],
    // Show school information for appropriate student types
    ...(shouldShowSchoolSelection(formData.studentType) ? [
      ['Current School', formData.schoolAddress?.name || formData.currentSchool],
      ['School Address', formData.schoolAddress?.fullAddress]
    ] : [])
  ];

  // Handle parent information differently based on student type
  const shouldShowParentInfo = isAdultStudent 
    ? Boolean(formData.parentFirstName) // Only show if provided for adult students
    : true; // Always show for non-primary students

  const parentInfo = [
    ['Parent First Name', formData.parentFirstName],
    ['Parent Last Name', formData.parentLastName],
    ['Parent Phone', formData.parentPhone],
    ['Parent Email', formData.parentEmail]
  ];

  const courseInfo = [
    ['Student Type', formData.studentType],
    ['School Year', formData.enrollmentYear],
    ['Course', formData.courseName],
    ['Start Date', formData.startDate],
    ['End Date', formData.endDate],
    // Only show diploma date if it exists
    ...(formData.diplomaMonth?.displayDate ? [['Diploma Date', formData.diplomaMonth.displayDate]] : [])
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="space-y-6 pt-6">
          <ReviewSection title="Personal Information" items={personalInfo} />
          
          {shouldShowParentInfo && (
            <ReviewSection 
              title={isAdultStudent ? "Parent/Guardian Information (Optional)" : "Parent/Guardian Information"} 
              items={parentInfo} 
            />
          )}
          
          <ReviewSection title="Course Information" items={courseInfo} />
          
          {formData.additionalInformation && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Additional Information</h3>
              <p className="text-sm whitespace-pre-wrap">{formData.additionalInformation}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentRegistrationReview;